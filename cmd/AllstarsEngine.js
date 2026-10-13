const axios = require("axios");

//==============================================================================
// ALL STARS — ARBITRE (fichier unique)
//------------------------------------------------------------------------------
// Organisation (même découpage que le modèle, rassemblé dans ce fichier) :
//   🔁 IA          relais d'IA : Gemini → Mistral → SambaNova → OpenRouter     (ai_manager)
//   🧾 PARSEUR     prompt d'extraction, normalisation, validation de schéma     (prompts/pave)
//   🧰 LOCAL       repli sans IA par mots-clés (réutilise ACTIONS_MAP)          (heuristique)
//   ⚖️ REGLES      discipline du pavé + file des attaques en attente            (moteur : cycle d'un pavé)
//   🛡️ DEFENSES    réactions permises / coûts selon l'écart de Combat Speed     (esquive)
//   ⚙️ MOTEUR      résolution chiffrée (dégâts, Stamina, Force, posture)        (moteur : résolution)
//   🎙️ NARRATEUR   récit déterministe du verdict                                (narrateur)
//   🧩 PIPELINE    analyse complète d'un pavé, au format attendu par l'affichage
//   puis : analysePaveAvecGemini / envoyerResultatPaveGemini, tracker, match, commandes.
//==============================================================================
const { ovlcmd } = require("../lib/ovlcmd");

const {
    getData,
    setfiche,
    getAllFiches
} = require("../DataBase/allstars_divs_fiches");

const { AllStarsDivsFiche } = require("../DataBase/allstars_divs_fiches");

const { cards } = require("../DataBase/cards");
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
const config = require("../set");


//================================================
// 🔁 RELAIS D'IA — Gemini → Mistral → SambaNova → OpenRouter (équivalent de ai_manager.js)
//================================================
const IA = (() => {
    'use strict';
    /**
     * ai_relay.js — Relais d'IA de l'arbitre ALL STARS.
     *
     * Inspiré de aiservices/ai_manager.js (autre bot) : relais séquentiel dans l'ordre AI_ORDER, disjoncteur par
     * fournisseur, validation métier (`valider`) traitée comme un échec, file d'attente par match (`cle`).
     *
     * Adaptations pour ce bot :
     *  • autonome : axios + process.env uniquement (pas de cfg/db/logger/runtime) ;
     *  • BUDGET QUOTIDIEN LOCAL par modèle (ex. Gemini Flash = 20 requêtes/jour) : un modèle épuisé est sauté
     *    sans appel réseau, jusqu'au prochain reset (minuit Pacifique pour Gemini, 00:00 UTC pour les autres) ;
     *  • distinction quota/minute (pause courte) et quota/jour (pause jusqu'au reset) ;
     *  • clé API envoyée en en-tête (jamais dans l'URL, donc jamais dans les logs d'erreur) ;
     *  • extraction JSON robuste (retire <think>…</think>, ```json, texte autour) ;
     *  • délai total borné (le joueur attend) ;
     *  • si tout échoue : { ok:false } → l'appelant applique son repli (ex. mise en attente du pavé).
     *
     * Variables d'environnement (toutes facultatives sauf au moins une clé) :
     *   AI_ORDER=gemini,mistral,sambanova,openrouter
     *   GEMINI_API_KEY, GEMINI_MODELS, GEMINI_RPD_FLASH (20), GEMINI_RPD_LITE (500)   (0 = pas de budget local)
     *   MISTRAL_API_KEY, MISTRAL_MODELS
     *   SAMBANOVA_API_KEY, SAMBANOVA_MODELS, SAMBANOVA_RPD (20)
     *   OPENROUTER_API_KEY, OPENROUTER_MODELS, OPENROUTER_RPD (50 ; 1000 si ≥ 10 $ de crédits achetés)
     *   AI_TIMEOUT_MS (force un délai par appel), AI_DELAI_TOTAL_MS (75000)
     */

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Utilitaires                                                                                                    */
    /* ------------------------------------------------------------------------------------------------------------- */
    const env = (k, d) => { const v = process.env[k]; return v && v.trim() ? v.trim() : d; };
    const liste = (k, d) => env(k, d).split(',').map((s) => s.trim()).filter(Boolean);
    const entier = (k, d) => { const n = Number(env(k, '')); return Number.isFinite(n) && env(k, '') !== '' ? n : d; };

    let journal = (e) => {
      const base = `IA ${e.ok ? '✅' : '⚠️'} ${e.modele} → "${e.tache}"`;
      if (e.ok) console.log(`${base} (${e.ms}ms)`); else console.warn(`${base} : ${e.erreur}`);
    };
    /** Permet de brancher un journal maison : configurer({ journal: (evt) => ... }) */
    function configurer(opts = {}) { if (typeof opts.journal === 'function') journal = opts.journal; }

    /** Clé de jour : bascule au reset du fournisseur ('pacific' = minuit heure du Pacifique, DST géré par Intl). */
    const cleJour = (fuseau) => (fuseau === 'pacific'
      ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date())
      : new Date().toISOString().slice(0, 10));

    /** Mutex minimal par clé (un seul appel IA à la fois par match → état cohérent). */
    const files = new Map();
    function verrou(cle, fn) {
      const prec = files.get(cle) || Promise.resolve();
      const suite = prec.catch(() => {}).then(fn);
      const queue = suite.catch(() => {});
      files.set(cle, queue);
      queue.then(() => { if (files.get(cle) === queue) files.delete(cle); });
      return suite;
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Extraction JSON robuste                                                                                        */
    /* ------------------------------------------------------------------------------------------------------------- */
    function objetsEquilibres(s) {
      const res = []; let prof = 0, debut = -1, chaine = false, esc = false;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (chaine) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') chaine = false; continue; }
        if (prof > 0 && c === '"') { chaine = true; continue; }
        if (c === '{') { if (prof === 0) debut = i; prof++; }
        else if (c === '}' && prof > 0) { prof--; if (prof === 0) res.push(s.slice(debut, i + 1)); }
      }
      return res;
    }
    function essaiParse(s) {
      try { const v = JSON.parse(s); return v && typeof v === 'object' ? v : null; } catch (_) { /* suite */ }
      try { const v = JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); return v && typeof v === 'object' ? v : null; } catch (_) { return null; }
    }
    /** Extrait l'objet JSON d'une réponse d'IA (balises <think>, fences ```json, prose autour). Lève une erreur sinon. */
    function extraireJson(txt) {
      let t = String(txt == null ? '' : txt);
      t = t.replace(/<think>[\s\S]*?<\/think>/gi, '');
      const iFin = t.toLowerCase().lastIndexOf('</think>');
      if (iFin >= 0) t = t.slice(iFin + 8);
      t = t.replace(/<think>[\s\S]*$/i, '').replace(/```(?:json)?/gi, '').trim();
      const direct = essaiParse(t);
      if (direct) return direct;
      const cands = objetsEquilibres(t);
      for (let i = cands.length - 1; i >= 0; i--) { const v = essaiParse(cands[i]); if (v) return v; }
      throw new Error('JSON introuvable dans la réponse');
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Erreurs HTTP → erreurs typées                                                                                  */
    /* ------------------------------------------------------------------------------------------------------------- */
    function erreurHttp(e) {
      const r = e && e.response; const status = r && r.status;
      let corps = r && r.data;
      if (corps && typeof corps !== 'string') { try { corps = JSON.stringify(corps); } catch (_) { corps = ''; } }
      corps = String(corps || '').replace(/\s+/g, ' ').slice(0, 300);
      const timeout = e && (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT' || /timeout/i.test(e.message || ''));
      const err = new Error(status ? `HTTP ${status} ${corps}` : (timeout ? 'timeout' : (e && (e.code || e.message)) || 'erreur réseau'));
      err.status = status;
      if (status === 429) {
        err.quota = true;
        const restantJour = r.headers && r.headers['x-ratelimit-remaining-requests-day'];
        err.quotaJour = /per.?day|daily|free-models-per-day|\bRPD\b/i.test(corps) || (restantJour !== undefined && Number(restantJour) === 0);
        const ra = Number(r.headers && r.headers['retry-after']);
        if (ra > 0) err.retryAfterMs = Math.min(ra * 1000, 600000);
      }
      if (status === 401 || status === 403) err.cle = true;
      return err;
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Budgets quotidiens locaux + santé (disjoncteur)                                                                */
    /* ------------------------------------------------------------------------------------------------------------- */
    const compteurs = new Map();   // cleBudget -> { jour, n }
    const sante = new Map();       // nom -> { echecs, pauseJusqua, epuiseJour }

    function compteur(p) {
      const jour = cleJour(p.fuseau);
      let c = compteurs.get(p.budget.cle);
      if (!c || c.jour !== jour) { c = { jour, n: 0 }; compteurs.set(p.budget.cle, c); }
      return c;
    }
    const budgetRestant = (p) => (p.budget && p.budget.max > 0 ? p.budget.max - compteur(p).n : Infinity);
    function compter(p) { if (p.budget && p.budget.max > 0) compteur(p).n += 1; }
    /** Synchronise le compteur local sur la valeur renvoyée par le serveur (ex. SambaNova : requêtes restantes du jour). */
    function caler(p, restant) { if (p.budget && p.budget.max > 0) compteur(p).n = Math.max(0, p.budget.max - restant); }

    function disponible(p) {
      const s = sante.get(p.nom);
      if (s) {
        if (s.pauseJusqua && Date.now() < s.pauseJusqua) return false;
        if (s.epuiseJour && s.epuiseJour === cleJour(p.fuseau)) return false;
      }
      return budgetRestant(p) > 0;
    }
    function noter(p, ok, err) {
      const s = sante.get(p.nom) || { echecs: 0, pauseJusqua: 0, epuiseJour: null };
      if (ok) { s.echecs = 0; s.pauseJusqua = 0; }
      else if (err && err.quotaJour) s.epuiseJour = cleJour(p.fuseau);                     // épuisé jusqu'au reset
      else if (err && err.quota) s.pauseJusqua = Date.now() + (err.retryAfterMs || 65000);  // limite par minute
      else if (err && err.cle) s.pauseJusqua = Date.now() + 30 * 60000;                     // clé refusée
      else if (err && err.status === 404) s.pauseJusqua = Date.now() + 60 * 60000;          // modèle retiré/inconnu
      else { s.echecs += 1; if (s.echecs >= 2) s.pauseJusqua = Date.now() + 60000; }        // 2 échecs de suite
      sante.set(p.nom, s);
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Fournisseurs                                                                                                   */
    /* ------------------------------------------------------------------------------------------------------------- */
    function creerGemini(modele) {
      const lite = /lite/i.test(modele);
      const max = lite ? entier('GEMINI_RPD_LITE', 500) : (/^gemini-3/.test(modele) ? entier('GEMINI_RPD_FLASH', 20) : 0);
      const p = {
        nom: `gemini:${modele}`, modele, fuseau: 'pacific', timeoutMs: 25000,
        budget: { cle: `gemini:${modele}`, max },
        dispo: () => !!env('GEMINI_API_KEY'),
        async appeler(o) {
          const corps = {
            contents: o.messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
            generationConfig: { temperature: o.temperature, maxOutputTokens: o.maxTokens },
          };
          if (o.system) corps.systemInstruction = { parts: [{ text: o.system }] };
          if (o.json) corps.generationConfig.responseMimeType = 'application/json';
          let r;
          try {
            r = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`, corps,
              { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env('GEMINI_API_KEY') }, timeout: o.timeoutMs });
          } catch (e) { throw erreurHttp(e); }
          const cand = r.data && r.data.candidates && r.data.candidates[0];
          const texte = ((cand && cand.content && cand.content.parts) || []).filter((x) => !x.thought && typeof x.text === 'string').map((x) => x.text).join('');
          if (!texte) throw new Error(`Réponse Gemini vide${cand && cand.finishReason ? ` (${cand.finishReason})` : ''}`);
          return { texte };
        },
      };
      return p;
    }

    /** Fournisseur « compatible OpenAI » (Mistral, SambaNova, OpenRouter…). */
    function creerCompat(def, modele) {
      const p = {
        nom: `${def.nom}:${modele}`, modele, fuseau: 'utc', timeoutMs: def.timeoutMs,
        budget: def.budget ? { cle: def.budget.partage ? def.nom : `${def.nom}:${modele}`, max: def.budget.max } : null,
        dispo: () => !!env(def.cleEnv),
        async appeler(o) {
          const msgs = [...(o.system ? [{ role: 'system', content: o.system }] : []), ...o.messages];
          const corps = { model: modele, messages: msgs, temperature: o.temperature, max_tokens: o.maxTokens };
          if (o.json && def.jsonNatif) corps.response_format = { type: 'json_object' };
          const entetes = { 'Content-Type': 'application/json', Authorization: `Bearer ${env(def.cleEnv)}`, ...(def.entetes || {}) };
          const poster = () => axios.post(`${def.base}/chat/completions`, corps, { headers: entetes, timeout: o.timeoutMs });
          let r;
          try { r = await poster(); } catch (e) {
            // Mode JSON natif non supporté par ce modèle : on réessaie une fois sans, le prompt exige déjà du JSON.
            const msg = JSON.stringify((e.response && e.response.data) || '');
            if (e.response && e.response.status === 400 && corps.response_format && /response_format|json/i.test(msg)) {
              delete corps.response_format;
              try { r = await poster(); } catch (e2) { throw erreurHttp(e2); }
            } else throw erreurHttp(e);
          }
          const message = r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message;
          let c = message && message.content;
          if (Array.isArray(c)) c = c.filter((x) => !x.type || x.type === 'text').map((x) => x.text || '').join('');
          if (!c || !String(c).trim()) throw new Error('Réponse vide');
          const res = { texte: String(c) };
          if (def.entetesRpd && r.headers && r.headers[def.entetesRpd] !== undefined && Number.isFinite(Number(r.headers[def.entetesRpd]))) res.restantJour = Number(r.headers[def.entetesRpd]);
          return res;
        },
      };
      return p;
    }

    const DEF_COMPAT = {
      mistral: () => ({ nom: 'mistral', cleEnv: 'MISTRAL_API_KEY', base: 'https://api.mistral.ai/v1', jsonNatif: true, timeoutMs: 30000, models: liste('MISTRAL_MODELS', 'mistral-large-latest,mistral-medium-latest') }),
      sambanova: () => ({ nom: 'sambanova', cleEnv: 'SAMBANOVA_API_KEY', base: 'https://api.sambanova.ai/v1', jsonNatif: true, timeoutMs: 30000, entetesRpd: 'x-ratelimit-remaining-requests-day',
        budget: { max: entier('SAMBANOVA_RPD', 20), partage: false }, models: liste('SAMBANOVA_MODELS', 'gpt-oss-120b,DeepSeek-V3.1,Meta-Llama-3.3-70B-Instruct') }),
      openrouter: () => ({ nom: 'openrouter', cleEnv: 'OPENROUTER_API_KEY', base: 'https://openrouter.ai/api/v1', jsonNatif: false, timeoutMs: 45000, entetes: { 'X-Title': 'AllStars Arbitre' },
        budget: { max: entier('OPENROUTER_RPD', 50), partage: true },
        models: liste('OPENROUTER_MODELS', 'nvidia/nemotron-3-ultra-550b-a55b:free,nvidia/nemotron-3-super-120b-a12b:free,google/gemma-4-31b-it:free,openrouter/free') }),
    };

    let injectes = null;   // tests uniquement
    function fournisseurs(nom) {
      if (nom === 'gemini') return liste('GEMINI_MODELS', 'gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite').map(creerGemini);
      if (DEF_COMPAT[nom]) { const def = DEF_COMPAT[nom](); return def.models.map((m) => creerCompat(def, m)); }
      return [];
    }
    /** Fournisseurs utilisables maintenant, dans l'ordre configuré (clé présente, pas en pause, budget du jour non épuisé). */
    const chaine = () => (injectes || liste('AI_ORDER', 'gemini,mistral,sambanova,openrouter').flatMap(fournisseurs))
      .filter((p) => p && p.dispo() && disponible(p));

    /* ------------------------------------------------------------------------------------------------------------- */
    /* API                                                                                                            */
    /* ------------------------------------------------------------------------------------------------------------- */
    /**
     * @param {object} o { tache, system?, messages:[{role,content}], json?, temperature?(0), maxTokens?(4096),
     *                     valider?(res)->true|string, cle? (ex. id du match), delaiTotalMs? }
     * @returns {Promise<{ok:boolean, texte?:string, data?:object, modele?:string, ms?:number, erreurs:string[]}>}
     */
    async function demander(o) {
      const run = async () => {
        const erreurs = [];
        const fin = Date.now() + (o.delaiTotalMs || entier('AI_DELAI_TOTAL_MS', 75000));
        for (const p of chaine()) {
          if (Date.now() >= fin - 2000) { erreurs.push('délai total dépassé'); break; }
          const t0 = Date.now();
          try {
            const res = await p.appeler({
              system: o.system, messages: o.messages, json: !!o.json,
              temperature: o.temperature == null ? 0 : o.temperature, maxTokens: o.maxTokens || 4096,
              timeoutMs: Math.min(entier('AI_TIMEOUT_MS', 0) || p.timeoutMs, Math.max(3000, fin - Date.now())),
            });
            if (Number.isFinite(res.restantJour)) caler(p, res.restantJour); else compter(p);   // la requête a bien été consommée
            let data = null;
            if (o.json) data = extraireJson(res.texte);
            if (o.valider) { const v = o.valider(o.json ? data : res.texte); if (v !== true) throw new Error(`Validation : ${typeof v === 'string' ? v : 'réponse invalide'}`); }
            noter(p, true);
            const ms = Date.now() - t0;
            journal({ tache: o.tache, modele: p.nom, ms, ok: true });
            return { ok: true, texte: res.texte, data, modele: p.nom, ms, erreurs };
          } catch (e) {
            noter(p, false, e);
            erreurs.push(`${p.nom}: ${e.message}`);
            journal({ tache: o.tache, modele: p.nom, ok: false, erreur: e.message });
          }
        }
        return { ok: false, erreurs: erreurs.length ? erreurs : ['Aucun fournisseur IA disponible (clés manquantes, en pause ou budget du jour épuisé).'] };
      };
      return o.cle ? verrou(`ia:${o.cle}`, run) : run();
    }

    /** État lisible pour une commande de diagnostic (ex. `ia_status`). */
    function etat() {
      return (injectes || liste('AI_ORDER', 'gemini,mistral,sambanova,openrouter').flatMap(fournisseurs)).map((p) => {
        const s = sante.get(p.nom);
        const reste = budgetRestant(p);
        return {
          nom: p.nom, cle: !!p.dispo(),
          pause: s && s.pauseJusqua > Date.now() ? Math.round((s.pauseJusqua - Date.now()) / 1000) : 0,
          epuise: !!(s && s.epuiseJour === cleJour(p.fuseau)),
          reste: Number.isFinite(reste) ? reste : null,
        };
      });
    }

    return {
      demander, extraireJson, etat, chaine, configurer,
      _test: { injecter: (arr) => { injectes = arr; }, reinitialiser: () => { injectes = null; compteurs.clear(); sante.clear(); files.clear(); }, cleJour, erreurHttp },
    };
})();

//================================================
// 🧾 PARSEUR DE PAVÉ — prompt d'extraction, normalisation, validation de schéma (équivalent de prompts/pave.js)
//================================================
const PARSEUR = (() => {
    'use strict';
    /**
     * parseur_pave.js — Parseur de pavé ALL STARS (prompt + normalisation + validation de schéma).
     *
     * PRINCIPE (repris de l'autre bot) : l'IA n'ARBITRE PAS, elle EXTRAIT. Elle ne juge ni la validité, ni le résultat,
     * et ne complète JAMAIS un détail absent (côté, sens, distance…) : elle met null. Les manques sont sanctionnés
     * par le code (regles_pave.js) → même verdict quelle que soit l'IA du relais.
     *
     * Utilisation avec le relais :
     *   const r = await relay.demander({ tache:'parse_pave', messages:[{role:'user', content: construirePrompt(ctx)}],
     *                                    json:true, temperature:0, maxTokens:2500, cle: match.id, valider });
     *   const parse = normaliser(r.data);
     */

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Utilitaires                                                                                                    */
    /* ------------------------------------------------------------------------------------------------------------- */
    const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    /** Chaîne normalisée, ou null pour les « valeurs vides » que les IA écrivent (null, none, n/a…). */
    const txt = (v) => { const s = norm(v); return (s === '' || /^(null|none|n\/a|aucun|aucune|non precise|inconnu)$/.test(s)) ? null : s; };
    const bool = (v) => v === true || /^(true|oui|yes|vrai|1)$/.test(norm(v));
    const nombre = (v) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      const m = /(-?\d+(?:[.,]\d+)?)/.exec(String(v == null ? '' : v));
      return m ? Number(m[1].replace(',', '.')) : null;
    };
    const parmi = (v, liste) => { const s = txt(v); return s && liste.includes(s) ? s : null; };

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Énumérations & alias (variantes que les IA écrivent volontiers)                                                */
    /* ------------------------------------------------------------------------------------------------------------- */
    const TYPES = ['deplacement', 'attaque', 'defense', 'competence', 'autre'];
    const MEMBRES_LATERAUX = ['poing', 'pied', 'coude', 'genou', 'main', 'bras', 'jambe'];
    const MODES_DEFENSE = ['esquive', 'blocage', 'deviation', 'saisie', 'contre', 'coupe', 'changement_trajectoire'];
    const TRAJECTOIRES = ['rectiligne', 'arc', 'zigzag', 'contournement', 'saut'];
    const SENS_DEPL = ['gauche', 'droite', 'avant', 'arriere', 'haut', 'bas'];
    const SENS_FRAPPE = ['horizontale', 'ascendante', 'descendante', 'oblique', 'frontale', 'circulaire'];

    const ALIAS_TYPE = [[/depl|mouvement|move|course|run/, 'deplacement'], [/attaq|attack|frapp|strike|offens/, 'attaque'],
      [/defen|reaction|guard|parade/, 'defense'], [/compet|technique|sort|skill|spell|energ/, 'competence']];
    const type = (v) => { const s = norm(v); for (const [re, t] of ALIAS_TYPE) if (re.test(s)) return t; return 'autre'; };

    /** « poing_droit », « main droite », « katana » → { membre:'poing', cote:'droite' } (la base et le côté sont séparés). */
    const BASES = [[/deux mains|two hands|both hands|2 mains/, 'deux_mains'], [/\btete\b|\bfront\b|crane|head|coup de boule/, 'tete'],
      [/epee|lame|katana|dague|couteau|hache|sabre|arme|weapon|baton|rapiere/, 'arme'], [/poing|fist|crochet|uppercut|\bjab\b|\bdirect\b/, 'poing'],
      [/pied|jambe|kick|semelle|talon|botte|\bjambe/, 'pied'], [/genou|knee/, 'genou'], [/coude|elbow/, 'coude'],
      [/\bmain\b|paume|hand/, 'main'], [/\bbras\b|\barm\b/, 'bras'], [/corps|body|epaule|buste|torse/, 'corps']];
    const cote = (s) => (/\b(gauche|left)\b/.test(s) ? 'gauche' : /\b(droit|droite|right)\b/.test(s) ? 'droite' : null);
    function membreEtCote(membre, coteBrut) {
      const s = (txt(membre) || '').replace(/_/g, ' ');
      let base = null; for (const [re, b] of BASES) if (re.test(s)) { base = b; break; }
      const c = cote(txt(coteBrut) || '') || cote(s);
      return { membre: base, cote: base && !['deux_mains', 'tete', 'corps'].includes(base) ? c : null };
    }

    const ALIAS_GENRE = [[/direct|jab/, 'direct'], [/crochet|hook/, 'crochet'], [/uppercut/, 'uppercut'], [/balay|fauch|sweep/, 'balayage'],
      [/pied|kick|low/, 'coup_de_pied'], [/estoc|poignard|plant|transperc|empal|pique|stab/, 'estoc'], [/taill|tranch|\bcoupe\b|decoup|slash|lame/, 'taille'],
      [/projectile|lanc|jet|shuriken|kunai/, 'projectile'], [/energ|souffle|boule|rayon|blast/, 'energie']];
    const genre = (v) => { const s = txt(v); if (!s) return null; for (const [re, g] of ALIAS_GENRE) if (re.test(s)) return g; return 'autre'; };
    const sensFrappe = (v) => { const s = txt(v); if (!s) return null; if (SENS_FRAPPE.includes(s)) return s;
      if (/horizon|lateral/.test(s)) return 'horizontale'; if (/ascend|monta|vers le haut/.test(s)) return 'ascendante'; if (/descend|vers le bas|plongeante/.test(s)) return 'descendante';
      if (/obliq|diagonal/.test(s)) return 'oblique'; if (/front|direct|droit devant/.test(s)) return 'frontale'; if (/circul|rotati|360/.test(s)) return 'circulaire'; return null; };
    const lateral = (v) => { const s = txt(v); if (!s) return null; if (/gauche|left/.test(s)) return 'gauche'; if (/droit|right/.test(s)) return 'droite'; if (/haut|up/.test(s)) return 'haut'; if (/bas|down/.test(s)) return 'bas'; return null; };
    const sensDepl = (v) => { const s = txt(v); if (!s) return null; if (SENS_DEPL.includes(s)) return s;
      if (/gauche|left/.test(s)) return 'gauche'; if (/droite|right/.test(s)) return 'droite'; if (/arriere|recul|back/.test(s)) return 'arriere';
      if (/avant|devant|front|vers lui|vers l.adversaire/.test(s)) return 'avant'; if (/haut|monte|up/.test(s)) return 'haut'; if (/bas|descend|down/.test(s)) return 'bas'; return null; };
    const trajectoire = (v) => { const s = txt(v); if (!s) return null; if (TRAJECTOIRES.includes(s)) return s;
      if (/zig/.test(s)) return 'zigzag'; if (/arc|arqu|courb|circul|demi|cercle/.test(s)) return 'arc'; if (/contourn|autour|tour de/.test(s)) return 'contournement';
      if (/saut|bond/.test(s)) return 'saut'; if (/rectil|droit|ligne/.test(s)) return 'rectiligne'; return null; };
    const vitesse = (v) => { const s = txt(v); if (!s) return null; if (/vmax|vitesse max|pleine vitesse|a fond|maximale|\bmax\b/.test(s)) return 'vmax'; if (/reduit|lent/.test(s)) return 'reduite'; return nombre(s); };
    const niveau = (v) => { const s = txt(v); if (!s) return null; if (/basic|basique|bronze|🥉/.test(s)) return 'basic'; if (/advanced|avance|argent|silver|🥈/.test(s)) return 'advanced'; if (/ultim|gold|\bor\b|🥇/.test(s)) return 'ultime'; return null; };
    const modeDef = (v) => { const s = txt(v); if (!s) return null; if (MODES_DEFENSE.includes(s)) return s;
      if (/esquiv|evit|dodge/.test(s)) return 'esquive'; if (/bloc|block|encaiss/.test(s)) return 'blocage'; if (/devi|detourn|repouss|parade|parry/.test(s)) return 'deviation';
      if (/saisi|attrap|grab/.test(s)) return 'saisie'; if (/contre|riposte|counter/.test(s)) return 'contre'; if (/coup|interromp|stopp/.test(s)) return 'coupe'; if (/trajectoire/.test(s)) return 'changement_trajectoire'; return null; };
    const zone = (v) => { const s = txt(v); if (!s) return null; const l = ['tete', 'gorge', 'coeur', 'thorax', 'abdomen', 'dos', 'jambes', 'bras'];
      if (l.includes(s)) return s; if (/\bcou\b|gorge/.test(s)) return 'gorge'; if (/visage|tempe|menton|machoire|nez|\bfront\b|crane|oeil/.test(s)) return 'tete';
      if (/torse|poitrine|thorax/.test(s)) return 'thorax'; if (/ventre|cotes|abdomen|plexus/.test(s)) return 'abdomen'; if (/\bdos\b|nuque|omoplate/.test(s)) return 'dos';
      if (/jambe|cuisse|mollet|cheville/.test(s)) return 'jambes'; if (/bras|epaule|poignet/.test(s)) return 'bras'; if (/coeur/.test(s)) return 'coeur'; return null; };
    /** « [#2] », « #2 », « 2 », « attaque 2 » → 2 ; sinon null. */
    const vise = (v) => { if (v == null) return null; const m = /(\d+)/.exec(String(v)); return m ? Number(m[1]) : null; };

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Normalisation (sortie d'IA → structure stable, indépendante du modèle)                                         */
    /* ------------------------------------------------------------------------------------------------------------- */
    function normaliserAction(a, i) {
      const t = type(a.type);
      const { membre, cote: c } = membreEtCote(a.membre, a.cote);
      const dep = a.deplacement && typeof a.deplacement === 'object' ? a.deplacement : null;
      const fr = a.frappe && typeof a.frappe === 'object' ? a.frappe : null;
      const df = a.defense && typeof a.defense === 'object' ? a.defense : null;
      const en = a.energie && typeof a.energie === 'object' ? a.energie : null;
      const arc = dep && dep.arc && typeof dep.arc === 'object' ? { rayonM: nombre(dep.arc.rayonM), angleDeg: nombre(dep.arc.angleDeg) } : null;
      const nn = nombre(a.n), sq = nombre(a.sequence);
      return {
        n: nn != null && nn >= 1 ? Math.round(nn) : i + 1,
        sequence: sq != null && sq >= 1 ? Math.round(sq) : i + 1,                       // sans info : une séquence par action (pas de combo présumé)
        texte: String(a.texte || a.description || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        type: t,
        cible: txt(a.cible) ? String(a.cible).trim() : null,
        membre, cote: c,
        membreComplet: !!membre && (!MEMBRES_LATERAUX.includes(membre) || !!c),         // recalculé par le code : on ne croit pas les drapeaux de l'IA
        frappe: fr ? { genre: genre(fr.genre), sens: sensFrappe(fr.sens), depart: lateral(fr.depart), arrivee: lateral(fr.arrivee) } : null,
        zone: zone(a.zone),
        tranchant: bool(a.tranchant) || (!!a.frappe && /taill|estoc|tranch/.test(norm(a.frappe.genre))),   // lame/katana/griffe : sert à la règle « tranchant en zone critique = mort »
        energie: en ? { niveau: niveau(en.niveau), projectile: bool(en.projectile) } : null,
        competence: txt(a.competence) ? String(a.competence).trim() : null,
        deplacement: dep ? {
          vitesse: vitesse(dep.vitesse), trajectoire: trajectoire(dep.trajectoire), sens: sensDepl(dep.sens),
          distanceM: (() => { const d = nombre(dep.distanceM); return d != null && d >= 0 ? d : null; })(),
          vers: /cible|adversaire|lui/.test(txt(dep.vers) || '') ? 'cible' : null,
          arriveeCote: (() => { const s = txt(dep.arrivee_cote || dep.arriveeCote); return s && /gauche|droite|dos|face/.test(s) ? (s.match(/gauche|droite|dos|face/) || [])[0] : null; })(),
          arc: arc && (arc.rayonM != null || arc.angleDeg != null) ? arc : null,
        } : null,
        defense: df ? { mode: modeDef(df.mode), vise: vise(df.vise), corps: df.corps == null ? null : bool(df.corps) } : null,
        riposte: bool(a.riposte),
      };
    }
    /** Sortie brute d'IA → { actions[], nombreActions, contradictions[], implicites[], resume }. */
    function normaliser(raw) {
      const brut = raw && typeof raw === 'object' ? raw : {};
      const actions = (Array.isArray(brut.actions) ? brut.actions : []).filter((a) => a && typeof a === 'object').map(normaliserAction);
      const liste = (x) => (Array.isArray(x) ? x : []).map((s) => String(s).trim()).filter(Boolean);
      return { actions, nombreActions: actions.length, contradictions: liste(brut.contradictions), implicites: liste(brut.actionsImplicites || brut.implicites), resume: String(brut.resume || '').trim() };
    }
    /** Validation de SCHÉMA pour le relais (`valider`) : une sortie malformée = échec du modèle, pas faute du joueur. */
    function valider(raw) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'objet JSON attendu';
      if (!Array.isArray(raw.actions)) return 'champ "actions" absent';
      if (raw.actions.length > 12) return 'plus de 12 actions : réponse suspecte';
      for (const a of raw.actions) if (!a || typeof a !== 'object' || !('type' in a)) return 'action sans "type"';
      return true;
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* Prompt                                                                                                         */
    /* ------------------------------------------------------------------------------------------------------------- */
    /**
     * @param {{joueur:{nom,grade?,vmax?}, adversaire:{nom}, distance?:number|string, tour?:number,
     *          attaquesEnAttente?:{n:number, auteur:string, texte:string}[], actionsTexte:string}} c
     */
    function construirePrompt(c) {
      const j = c.joueur || {};
      const att = (c.attaquesEnAttente || []).length
        ? `Attaques adverses EN ATTENTE contre ${j.nom || 'le joueur'} (le pavé peut y répondre) :\n${c.attaquesEnAttente.map((x) => `  [#${x.n}] ${x.auteur} : ${x.texte}`).join('\n')}`
        : 'Aucune attaque adverse en attente (rien à défendre).';
      return `Tu es le "Message Parser" de l'arbitre du jeu ALL STARS (combat textuel 1v1). Tu ne juges RIEN et tu ne narres RIEN : tu transformes le texte d'un joueur ("pavé") en JSON strict. Le code du bot applique les règles.

    CONTEXTE
    - Joueur : ${j.nom || '?'}${j.grade ? ` (grade ${j.grade}${j.vmax ? `, vmax ${j.vmax} m/s` : ''})` : ''} — Adversaire : ${(c.adversaire && c.adversaire.nom) || '?'} — Distance actuelle : ${c.distance != null ? c.distance : '?'} m — Tour ${c.tour || 1}
    ${att}

    PAVÉ À ANALYSER
    """
    ${c.actionsTexte}
    """

    RÈGLES D'EXTRACTION
    0. Lis le SENS (jargon et synonymes acceptés). N'INVENTE ET NE DEVINE JAMAIS une précision absente : si le texte ne donne pas le côté, le sens, la distance en mètres ou la vitesse, mets null. Ce n'est pas à toi de sanctionner les manques.
    1. Une action = un verbe décrivant un acte distinct ("pour"/"afin de" séparent deux actions). Le dialogue n'est pas une action. "n" part de 1. "sequence" = numéro de séquence : "/", "|", " - " entre deux blocs ou "puis" ouvrent une nouvelle séquence ; "(combo)" ou "enchaîne" rattache l'action à la séquence précédente.
    2. DÉPLACEMENT (type "deplacement") : vitesse = "vmax" (vmax, vitesse maximale, à fond…) ou nombre en m/s ou null ; trajectoire = rectiligne | arc | zigzag | contournement | saut | null ; sens = gauche | droite | avant | arriere | haut | bas | null (côté par lequel il passe/part) ; distanceM = nombre de MÈTRES explicitement écrit, jamais calculé (un arc donné par rayon + angle va dans "arc", pas dans distanceM) ; vers = "cible" si le déplacement s'arrête sur/vers l'adversaire ; arrivee_cote = côté de l'adversaire où il arrive (gauche | droite | dos | face | null).
    3. ATTAQUE (type "attaque" pour un geste physique, "competence" pour une technique/énergie) : membre = poing | pied | coude | genou | main | bras | jambe | deux_mains | tete | arme | corps | null et cote = droite | gauche | null (le côté seulement s'il est écrit) ; frappe.genre = direct | crochet | uppercut | coup_de_pied | balayage | taille | estoc | projectile | energie | autre | null ; frappe.sens = horizontale | ascendante | descendante | oblique | frontale | circulaire | null (seulement s'il est écrit ou évident par le mot) ; frappe.depart / frappe.arrivee = côté où le geste commence / finit (gauche | droite | haut | bas | null) ; zone = tete | gorge | coeur | thorax | abdomen | dos | jambes | bras | null ; energie.niveau = basic | advanced | ultime | null (🥉 = basic, 🥈 = advanced, 🥇 = ultime) ; energie.projectile = true si projectile ; competence = nom de la technique si cité ; tranchant = true si l'attaque coupe ou transperce (lame, katana, griffe, estoc), false sinon.
    4. DÉFENSE (type "defense") : defense.mode = esquive | blocage | deviation | saisie | contre | coupe | changement_trajectoire ; defense.vise = numéro [#n] de l'attaque adverse visée si le texte permet de l'identifier, sinon null ; defense.corps = true si tout le corps se déplace, false s'il reste sur place (si corps = true, remplis aussi "deplacement"). Une riposte qui SUIT une défense est une "attaque" avec riposte = true.
    5. contradictions : incohérences internes ÉVIDENTES entre les actions (ex. côté de l'arme ou de la main incompatible avec le côté d'approche et le sens du geste ; membre brisé réutilisé ; action physiquement impossible). Liste vide si tout est cohérent.
    6. actionsImplicites : actions indispensables mais non écrites (ex. se lever), seulement si réellement nécessaires.

    FORMAT — réponds UNIQUEMENT avec ce JSON (pas de Markdown, aucun texte autour ; mets null/false/[] quand l'information est absente) :
    {"actions":[{"n":1,"sequence":1,"texte":"extrait court","type":"deplacement|attaque|defense|competence|autre","cible":null,"membre":null,"cote":null,"frappe":{"genre":null,"sens":null,"depart":null,"arrivee":null},"zone":null,"tranchant":false,"energie":{"niveau":null,"projectile":false},"competence":null,"deplacement":{"vitesse":null,"trajectoire":null,"sens":null,"distanceM":null,"vers":null,"arrivee_cote":null,"arc":{"rayonM":null,"angleDeg":null}},"defense":{"mode":null,"vise":null,"corps":null},"riposte":false}],"contradictions":[],"actionsImplicites":[],"resume":"une phrase"}`;
    }

    return { construirePrompt, normaliser, normaliserAction, valider, TYPES, MODES_DEFENSE, MEMBRES_LATERAUX };
})();

//================================================
// 🧰 REPLI LOCAL SANS IA — analyse par mots-clés (équivalent de heuristique.js)
//================================================
// Utilisé UNIQUEMENT si toutes les IA du relais échouent : le jeu continue au lieu de se bloquer.
// Volontairement prudent : en cas de doute une action est « autre ». Réutilise le vocabulaire de ACTIONS_MAP (frappes mains/pieds).
// Sortie = même structure brute que l'extraction de l'IA (PARSEUR.normaliser la normalise ensuite).
const LOCAL = (() => {
    'use strict';

    const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nb = (s) => Number(String(s).replace(',', '.'));

    // --- Vocabulaire de ACTIONS_MAP (aplati une seule fois) ------------------------------------------------------
    let INDEX = null;
    function indexActions() {
        if (INDEX) return INDEX;
        INDEX = [];
        (function marcher(o) {
            for (const v of Object.values(o || {})) {
                if (v && Array.isArray(v.aliases)) v.aliases.forEach((al) => INDEX.push({ alias: norm(al), def: v }));
                else if (v && typeof v === 'object') marcher(v);
            }
        })(typeof ACTIONS_MAP !== 'undefined' ? ACTIONS_MAP : {});
        INDEX.sort((a, b) => b.alias.length - a.alias.length);          // alias les plus longs d'abord
        return INDEX;
    }
    const TRAJ = { directe: 'frontale', circulaire: 'circulaire', montante: 'ascendante', descendante: 'descendante', laterale: 'horizontale', horizontale: 'horizontale', diagonale: 'oblique', crochet: 'circulaire' };
    const premier = (v) => (Array.isArray(v) ? v[0] : v);

    // --- Verbes ------------------------------------------------------------------------------------------------------
    const RE = {
        defense: /\b(esquiv\w*|evit\w*|bloqu\w*|parer?|pare\b|devi\w*|saisi\w*|attrap\w*|contr(?:e|er)\b|ripost\w*|me decal\w*|m'ecart\w*|me derob\w*|encaiss\w*)/,
        competence: /\*[^*]{2,40}\*|\b(souffle|jutsu|technique|nuage de poison|boule d'energie|kamehameha|invoque|deploie|canalise)\b|🥉|🥈|🥇/,
        attaque: /\b(frapp\w*|coup\w*|crochet|uppercut|direct|jab|trancher?|tranche|decoup\w*|degain\w*|plant\w*|poignard\w*|transperc\w*|assen\w*|envoi\w*|donne\w*|estoc\w*|balay\w*|fauch\w*|lance\w*)/,
        deplacement: /\b(fonc\w*|cour\w*|cours\w*|course|avanc\w*|recul\w*|saut\w*|bondi\w*|me deplac\w*|m'approch\w*|approch\w*|contourn\w*|zigzag\w*|sprint\w*|vol\w*|fil\w*|se place\w*|me place\w*|rejoin\w*)/,
    };
    const ZONES = [[/\b(gorge|cou)\b/, 'gorge'], [/\bcoeur\b/, 'coeur'], [/\b(tete|visage|menton|tempe|machoire|nez|front|crane)\b/, 'tete'],
        [/\b(torse|thorax|poitrine)\b/, 'thorax'], [/\b(ventre|abdomen|plexus|cotes|flanc)\b/, 'abdomen'], [/\b(dos|nuque|omoplate)\b/, 'dos'],
        [/\b(jambe|cuisse|mollet|cheville)\b/, 'jambes'], [/\b(bras|epaule|poignet)\b/, 'bras']];
    const MEMBRES = [[/\bdeux mains\b/, 'deux_mains'], [/\b(epee|lame|katana|dague|couteau|hache|sabre|arme)\b/, 'arme'], [/\b(poing|crochet|uppercut|jab|direct)\b/, 'poing'],
        [/\b(pied|semelle|talon|botte)\b/, 'pied'], [/\bgenou\b/, 'genou'], [/\bcoude\b/, 'coude'], [/\bmain\b/, 'main'], [/\bbras\b/, 'bras'], [/\bjambe\b/, 'jambe']];

    function premiereZone(s) {
        const apres = /(?:dans|sur|sous|au niveau de|vers|a la|au)\s+(?:le |la |les |l'|sa |son |ses |mon |ma )?(.*)$/.exec(s);
        for (const src of [apres ? apres[1] : '', s]) { let best = null, pos = 1e9; for (const [re, z] of ZONES) { const m = re.exec(src); if (m && m.index < pos) { pos = m.index; best = z; } } if (best) return best; }
        return null;
    }
    function coteApres(s, mot) {
        const m = new RegExp(`\\b(?:${mot})\\w*\\s+(?:de\\s+(?:mon|ma|son|sa)\\s+\\w+\\s+)?(droit|droite|gauche)\\b`).exec(s) || /\bdu\s+(droit|gauche)\b/.exec(s);
        return m ? (m[1] === 'gauche' ? 'gauche' : 'droite') : null;
    }

    // --- Segmentation ----------------------------------------------------------------------------------------------
    /** Découpe en actions ; "sequence" change à « / », « | », « ; », « . », « puis », « ensuite ». */
    function segmenter(texte) {
        const brut = String(texte).replace(/\(\s*\/\s*\)/g, ' ').replace(/\s+/g, ' ');
        const blocs = brut.split(/\s*(?:\/|\||;|\.(?=\s|$)|\bpuis\b|\bensuite\b)\s*/i).map((s) => s.trim()).filter((s) => s.length > 2);
        const out = []; let seq = 0;
        for (const bloc of blocs) {
            seq += 1;
            const morceaux = bloc.split(/\s*\(\s*combo\s*\)\s*|\s+pour\s+|\s+visant\s+|\s+avec\s+(?=une?\s)|,\s*(?=je\s|j')|\s+et\s+(?=je\s|j')/i).map((s) => s.trim()).filter((s) => s.length > 2);
            for (const m of morceaux) {
                const n = norm(m);
                const aVerbe = Object.values(RE).some((re) => re.test(n));
                if (!aVerbe && out.length && out[out.length - 1].sequence === seq) out[out.length - 1].texte += ' ' + m;   // clause sans verbe : rattachée à la précédente
                else out.push({ texte: m, sequence: seq });
            }
        }
        return out;
    }

    // --- Extraction par segment ----------------------------------------------------------------------------------------
    function typeDe(n) {
        if (RE.defense.test(n)) return 'defense';
        if (RE.competence.test(n)) return 'competence';
        if (RE.attaque.test(n)) return 'attaque';
        if (RE.deplacement.test(n)) return 'deplacement';
        return 'autre';
    }
    function extraireDeplacement(n) {
        const vitesse = /\b(vmax|vitesse max\w*|pleine vitesse|a fond)\b/.test(n) ? 'vmax' : ((/(\d+(?:[.,]\d+)?)\s*m\s*\/\s*s/.exec(n) || [])[1] ? nb(/(\d+(?:[.,]\d+)?)\s*m\s*\/\s*s/.exec(n)[1]) : null);
        const trajectoire = /zig\s*-?\s*zag/.test(n) ? 'zigzag' : /\b(arc|arcque\w*|arque\w*|courb\w*|circulaire|demi-?cercle)\b/.test(n) ? 'arc' : /contourn/.test(n) ? 'contournement' : /\b(saut\w*|bond\w*)\b/.test(n) ? 'saut' : /ligne droite|rectiligne/.test(n) ? 'rectiligne' : null;
        let sensV = null;
        if (/\b(par la gauche|sur ma gauche|vers la gauche|a gauche|de ma gauche)\b/.test(n) && !/partant de ma gauche/.test(n)) sensV = 'gauche';
        else if (/\b(par la droite|sur ma droite|vers la droite|a droite)\b/.test(n)) sensV = 'droite';
        else if (/\b(recul\w*|vers l'arriere|m'eloign\w*)\b/.test(n)) sensV = 'arriere';
        else if (/\b(vers lui|vers l'adversaire|sur (?:mon )?adversaire|sur lui|vers (?:le|la) \w+)\b/.test(n)) sensV = 'avant';
        else if (/partant de ma droite/.test(n)) sensV = 'droite';
        else if (/partant de ma gauche/.test(n)) sensV = 'gauche';
        const rayon = /rayon\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*m/.exec(n);
        const angle = /(\d+)\s*(?:°|\^|degres?)/.exec(n);
        const sansRayon = n.replace(/rayon\s+(?:de\s+)?\d+(?:[.,]\d+)?\s*m/g, ' ').replace(/\(\s*\d+(?:[.,]\d+)?\s*m\s+entre[^)]*\)/g, ' ');
        const dist = /(\d+(?:[.,]\d+)?)\s*(?:m|metres?)\b(?!\s*\/)/.exec(sansRayon);
        const cote = /profil gauche|cote gauche/.test(n) ? 'gauche' : /profil droit|cote droit/.test(n) ? 'droite' : /derriere (?:lui|elle)|dans le dos|\bderriere\b/.test(n) ? 'dos' : /\bface\b|devant lui/.test(n) ? 'face' : null;
        return {
            vitesse, trajectoire, sens: sensV, distanceM: dist ? nb(dist[1]) : null,
            vers: /\b(vers|sur) (?:lui|elle|(?:mon |son )?adversaire)\b|\bderriere lui\b|profil (?:gauche|droit)/.test(n) ? 'cible' : null,
            arrivee_cote: cote, arc: rayon || angle ? { rayonM: rayon ? nb(rayon[1]) : null, angleDeg: angle ? Number(angle[1]) : null } : { rayonM: null, angleDeg: null },
        };
    }
    function extraireFrappe(n) {
        let genre = null, sens = null, membre = null, cote = null;
        const al = indexActions().find((x) => n.includes(x.alias));
        if (al) {
            const t = al.def.type;                                                   // poing | pied | genou
            membre = t === 'pied' ? 'pied' : t; cote = al.def.main || al.def.pied || null;
            sens = TRAJ[norm(premier(al.def.trajectoire) || '')] || null;
            genre = /crochet/.test(al.alias) ? 'crochet' : /uppercut/.test(al.alias) ? 'uppercut' : t === 'poing' ? 'direct' : t === 'pied' ? 'coup_de_pied' : null;
        }
        if (!genre) genre = /crochet/.test(n) ? 'crochet' : /uppercut/.test(n) ? 'uppercut' : /\b(plant\w*|poignard\w*|transperc\w*|estoc\w*)\b/.test(n) ? 'estoc' : /\b(tranch\w*|decoup\w*|coupe\w*|degain\w*|lame|katana|epee)\b/.test(n) ? 'taille' : /coup de pied|\bkick\b/.test(n) ? 'coup_de_pied' : /\b(direct|jab)\b/.test(n) ? 'direct' : null;
        if (/horizontal/.test(n)) sens = 'horizontale'; else if (/ascendant|remontant/.test(n)) sens = 'ascendante'; else if (/descendant/.test(n)) sens = 'descendante'; else if (/oblique|diagonal/.test(n)) sens = 'oblique';
        if (!membre) for (const [re, m] of MEMBRES) if (re.test(n)) { membre = m; break; }
        if (membre && !['arme', 'deux_mains', 'tete', 'corps'].includes(membre)) cote = cote || coteApres(n, membre);
        else if (membre === 'arme') cote = (/\b(main|bras)\s+droit/.test(n) || /de la main droite/.test(n)) ? 'droite' : (/\b(main|bras)\s+gauche/.test(n) ? 'gauche' : null);
        const dg = /de (?:la )?gauche (?:vers|a) (?:la )?droite/.test(n), gd = /de (?:la )?droite (?:vers|a) (?:la )?gauche/.test(n);
        return { membre, cote, frappe: { genre, sens, depart: dg ? 'gauche' : gd ? 'droite' : null, arrivee: dg ? 'droite' : gd ? 'gauche' : null } };
    }
    function extraireDefense(n) {
        const mode = /\b(saisi\w*|attrap\w*)\b/.test(n) ? 'saisie' : /\b(devi\w*|detourn\w*|repouss\w*)\b/.test(n) ? 'deviation' : /\b(contre|contrer|ripost\w*)\b/.test(n) ? 'contre' : /\b(bloqu\w*|pare|parer|encaiss\w*)\b/.test(n) ? 'blocage' : 'esquive';
        const corps = /\b(recul\w*|saut\w*|bondi\w*|roul\w*|plong\w*|m'ecart\w*|me deplac\w*|pas (?:en arriere|lateral))\b/.test(n);
        const v = /#\s*(\d+)|attaque\s*(?:n°?\s*)?(\d+)/.exec(n);
        return { mode, vise: v ? Number(v[1] || v[2]) : null, corps };
    }

    /** @param {string} texte pavé brut   @param {{cibleNoms?:string[]}} ctx   @returns {object} extraction brute (schéma de l'IA) */
    function analyser(texte, ctx = {}) {
        const actions = []; let n = 0;
        const cibles = (ctx.cibleNoms || []).map((c) => [norm(c), c]);
        for (const seg of segmenter(texte)) {
            const s = norm(seg.texte);
            const type = typeDe(s);
            if (type === 'autre' && /^(je vois|je le vois|je remarque|je constate|je sens)\b/.test(s)) continue;     // observation, pas une action
            const a = { n: ++n, sequence: seg.sequence, texte: seg.texte.slice(0, 160), type, cible: (cibles.find(([k]) => k && s.includes(k)) || [])[1] || null };
            if (type === 'deplacement') a.deplacement = extraireDeplacement(s);
            else if (type === 'attaque') {
                Object.assign(a, extraireFrappe(s)); a.zone = premiereZone(s);
                a.tranchant = /\b(lame|katana|epee|dague|couteau|hache|sabre|tranch\w*|decoup\w*|poignard\w*|transperc\w*|griffe)\b/.test(s);
                if (/\b(basic|basique|advanced|ultime)\b|🥉|🥈|🥇/.test(seg.texte.toLowerCase())) a.energie = { niveau: /🥇|ultime/.test(seg.texte.toLowerCase()) ? 'ultime' : /🥈|advanced/.test(seg.texte.toLowerCase()) ? 'advanced' : 'basic', projectile: false };
            } else if (type === 'competence') {
                const nom = /\*([^*]{2,40})\*/.exec(seg.texte);
                a.competence = nom ? nom[1].trim() : null;
                const t = seg.texte;
                a.energie = { niveau: /🥇|ultime/i.test(t) ? 'ultime' : /🥈|advanced/i.test(t) ? 'advanced' : /🥉|basic|basique/i.test(t) ? 'basic' : null, projectile: /projectile/.test(s) };
            } else if (type === 'defense') {
                a.defense = extraireDefense(s);
                if (a.defense.corps) a.deplacement = extraireDeplacement(s);
            }
            actions.push(a);
        }
        return { actions, contradictions: [], actionsImplicites: [], resume: '' };
    }

    return { analyser, segmenter, extraireDeplacement, extraireFrappe };
})();

//================================================
// ⚖️ RÈGLES DU PAVÉ — discipline (tolérance / pénalité / annulation) + file des attaques en attente
//================================================
const REGLES = (() => {
    'use strict';
    /**
     * regles_pave.js — Discipline du pavé + file des attaques en attente (ALL STARS).
     *
     * Entrée : la sortie NORMALISÉE du parseur (parseur_pave.normaliser). Sortie : une DÉCISION déterministe,
     * identique quelle que soit l'IA qui a extrait le pavé. Aucun appel IA ici.
     *
     * Trois classes d'écarts (déduites de ton match de référence) :
     *   remarque    : détail déductible mais non nommé (ex. « frappe » non nommée)  → le pavé passe, simple rappel
     *   omission    : donnée requise absente (côté, sens, distance, membre…)        → toléré UNE fois (tour 1) avec pénalité,
     *                                                                                  ensuite le pavé est ANNULÉ
     *   incoherence : contradiction interne / limites de pavé dépassées              → pavé ANNULÉ ; au tour 1 la 1re erreur
     *                                                                                  s'accompagne en plus de la pénalité
     * Pas de correction : seul le premier message de pavé compte (à gérer côté bot : ignorer les messages suivants du tour).
     *
     * Toutes les hypothèses interprétatives sont des drapeaux nommés dans CFG (même esprit que config/regles.js).
     */
    const CFG = {
      MAX_ACTIONS: 4,                       // images : 4 actions max par pavé
      MAX_PAR_SEQUENCE: 2,                  // images : 2 en combo max par séquence
      TOLERANCE_TOUR_MAX: 1,                // la tolérance de début de combat ne vaut qu'au tour 1 (1 usage par joueur)
      PENALITE: { stat: 'combatSpeed', de: 'S', vers: 'S-', libelle: 'Baisse de Réactivité S vers S-' },
      VITESSE_ABSENTE: 'reduite',           // 'reduite' (règle de l'image 1 : 1 m/s) | 'erreur'
      VITESSE_REDUITE_MS: 1,
      ARC_COMPTE_COMME_DISTANCE: false,     // match de référence : « rayon 1,01 m, 180° » n'a PAS suffi comme distance
      DISTANCE_ESQUIVE_CORPS_EXIGEE: true,  // une esquive qui déplace tout le corps doit donner sens + distance (sortie de zone)
      IMPLICITES_CLASSE: 'remarque',        // 'remarque' | 'omission' : action implicite manquante signalée par l'IA
    };
    const RANG = { remarque: 1, omission: 2, incoherence: 3 };

    /* ------------------------------------------------------------------------------------------------------------- */
    /* 1. Vérification stricte (pure)                                                                                 */
    /* ------------------------------------------------------------------------------------------------------------- */
    const COURBES = ['arc', 'zigzag', 'contournement'];

    function verifierDeplacement(a, d, add, { strictDistance = false } = {}) {
      const courbe = COURBES.includes(d.trajectoire);
      const arcCalculable = CFG.ARC_COMPTE_COMME_DISTANCE && d.arc && d.arc.rayonM != null && d.arc.angleDeg != null;
      if (d.vitesse == null && a.type === 'deplacement') {
        if (CFG.VITESSE_ABSENTE === 'erreur') add('VITESSE_ABSENTE', 'omission', a.n, `Action ${a.n} : vitesse de déplacement non précisée (vmax ?).`);
      }
      if (courbe) {
        if (!d.sens) add('SENS_ABSENT', 'omission', a.n, `Action ${a.n} : le sens de la course n'est pas précisé (par la gauche ou par la droite).`);
        if (d.distanceM == null && !arcCalculable) add('DISTANCE_ABSENTE', 'omission', a.n, `Action ${a.n} : distance parcourue non précisée (combien de mètres ?).`);
      } else {
        if (!d.sens && d.vers !== 'cible') add('DIRECTION_ABSENTE', 'omission', a.n, `Action ${a.n} : direction du déplacement non précisée.`);
        if (d.distanceM == null && (strictDistance || d.vers !== 'cible')) add('DISTANCE_ABSENTE', 'omission', a.n, `Action ${a.n} : distance parcourue non précisée (combien de mètres ?).`);
      }
    }

    /**
     * @param {object} p sortie de parseur_pave.normaliser
     * @returns {{issues:{code,classe,n,message}[], notes:{code,n,valeur?}[], pire:number}}
     */
    function verifierPave(p) {
      const issues = [], notes = [];
      const add = (code, classe, n, message) => issues.push({ code, classe, n: n == null ? null : n, message });
      const acts = (p && p.actions) || [];

      if (acts.length > CFG.MAX_ACTIONS) add('TROP_ACTIONS', 'incoherence', null, `${acts.length} actions : ${CFG.MAX_ACTIONS} maximum par pavé.`);
      const parSeq = {};
      for (const a of acts) parSeq[a.sequence] = (parSeq[a.sequence] || 0) + 1;
      for (const [s, k] of Object.entries(parSeq)) if (k > CFG.MAX_PAR_SEQUENCE) add('TROP_PAR_SEQUENCE', 'incoherence', null, `Séquence ${s} : ${k} actions, ${CFG.MAX_PAR_SEQUENCE} maximum en combo.`);

      for (const a of acts) {
        if (a.type === 'deplacement') {
          const d = a.deplacement || {};
          verifierDeplacement(a, d, add);
          if (d.vitesse == null && CFG.VITESSE_ABSENTE === 'reduite') notes.push({ code: 'VITESSE_REDUITE', n: a.n, valeur: CFG.VITESSE_REDUITE_MS });
        }
        if (a.type === 'defense' && a.defense && a.defense.corps === true && a.defense.mode === 'esquive' && CFG.DISTANCE_ESQUIVE_CORPS_EXIGEE) {
          verifierDeplacement(a, a.deplacement || {}, add, { strictDistance: true });   // l'IA a oublié le bloc "deplacement" = rien n'est précisé
        }
        if (a.type === 'attaque') {
          if (!a.membre) add('MEMBRE_ABSENT', 'omission', a.n, `Action ${a.n} : le membre utilisé n'est pas précisé.`);
          else if (!a.membreComplet) add('COTE_ABSENT', 'omission', a.n, `Action ${a.n} : le côté du membre (${a.membre}) n'est pas précisé (droit ou gauche).`);
          else {
            const f = a.frappe || {};
            const sansTrajet = !f.genre && !f.sens && !f.depart && !f.arrivee;
            if (sansTrajet) add('FRAPPE_ABSENTE', 'omission', a.n, `Action ${a.n} : la frappe n'est pas décrite (type et sens du geste).`);
            else if (!f.genre && !f.sens) add('FRAPPE_NON_NOMMEE', 'remarque', a.n, `Action ${a.n} : il faut toujours nommer la frappe (ex. « frappe horizontale du droit, de la gauche vers la droite »).`);
          }
        }
      }
      for (const c of (p && p.contradictions) || []) add('CONTRADICTION', 'incoherence', null, c);
      for (const i of (p && p.implicites) || []) add('ACTION_IMPLICITE', CFG.IMPLICITES_CLASSE, null, `Action implicite manquante : ${i}`);

      return { issues, notes, pire: issues.reduce((m, i) => Math.max(m, RANG[i.classe]), 0) };
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* 2. Politique : tolérance de début de combat, pénalité, annulation                                              */
    /* ------------------------------------------------------------------------------------------------------------- */
    /**
     * LECTURE SEULE (aperçu, relances sans effet de bord). La tolérance n'est consommée que par `appliquerDecision`.
     * @param {object} parse  sortie normalisée du parseur
     * @param {{tour?:number, joueur?:string, discipline?:object}} ctx  discipline = match.discipline
     * @returns decision { etat:'valide'|'attention'|'mc', annule, penalite, toleranceConsommee, issues, notes, messages[] }
     */
    function evaluerPave(parse, ctx = {}) {
      const v = verifierPave(parse);
      const tour = ctx.tour || 1;
      const d = (ctx.discipline && ctx.discipline[ctx.joueur]) || {};
      const toleranceDispo = tour <= CFG.TOLERANCE_TOUR_MAX && !d.toleranceUtilisee;
      let etat = 'valide', annule = false, penalite = null, consommee = false;
      if (v.pire === RANG.remarque) etat = 'attention';
      else if (v.pire === RANG.omission) {
        if (toleranceDispo) { etat = 'attention'; penalite = CFG.PENALITE; consommee = true; }
        else { etat = 'mc'; annule = true; }
      } else if (v.pire === RANG.incoherence) {
        etat = 'mc'; annule = true;
        if (toleranceDispo) { penalite = CFG.PENALITE; consommee = true; }
      }
      return { etat, annule, penalite, toleranceConsommee: consommee, issues: v.issues, notes: v.notes, messages: composerMessages({ etat, annule, penalite, issues: v.issues }) };
    }

    /** Messages au format de l'arbitre humain (❌ERREUR / ⚠️ / pénalité). */
    function composerMessages({ etat, annule, penalite, issues }) {
      const m = [];
      if (!issues.length) return m;
      const txtIssues = issues.map((i) => i.message).join(' ');
      if (etat === 'mc') m.push(`❌ERREUR : ${txtIssues}${annule ? ' Aucune action ne passe.' : ''}`);
      else m.push(`⚠️Attention : ${txtIssues}`);
      if (penalite) m.push(`⚠️Pénalité (erreur tolérée en début de combat) : ${penalite.libelle}.`);
      return m;
    }

    /** Commit : consomme la tolérance et enregistre la pénalité. À appeler UNE fois, à la résolution réelle du pavé. */
    function appliquerDecision(match, joueur, decision, tour) {
      match.discipline = match.discipline || {};
      const d = match.discipline[joueur] = match.discipline[joueur] || { toleranceUtilisee: false, penalites: [] };
      if (decision.toleranceConsommee) { d.toleranceUtilisee = true; d.penalites.push({ ...decision.penalite, tour: tour || 1 }); }
      return d;
    }

    /* ------------------------------------------------------------------------------------------------------------- */
    /* 3. File des attaques en attente                                                                                */
    /* ------------------------------------------------------------------------------------------------------------- */
    /** Une action est « offensive » (à mettre en attente) : attaque physique ou technique (hors défense / déplacement). */
    const estOffensive = (a) => a.type === 'attaque' || a.type === 'competence';

    /** Empile les attaques d'un pavé validé contre `cibleId`. Numérotation [#n] propre au défenseur (1, 2, 3…). */
    function empiler(match, { auteurId, auteurNom, cibleId, paveId, tour, actions }) {
      match.fileAttaques = match.fileAttaques || [];
      const out = [];
      for (const a of actions.filter(estOffensive)) {
        const n = match.fileAttaques.filter((x) => x.cibleId === cibleId && x.statut === 'en_attente').length + 1;
        const att = { id: `A${(match.compteurAttaques = (match.compteurAttaques || 0) + 1)}`, n, auteurId, auteurNom: auteurNom || String(auteurId), cibleId, paveId, tour, action: a, statut: 'en_attente' };
        match.fileAttaques.push(att); out.push(att);
      }
      return out;
    }
    const attaquesEnAttente = (match, defenseurId) => (match.fileAttaques || []).filter((x) => x.cibleId === defenseurId && x.statut === 'en_attente');
    /** Format attendu par parseur_pave.construirePrompt({ attaquesEnAttente }). */
    const pourPrompt = (match, defenseurId) => attaquesEnAttente(match, defenseurId).map((x) => ({ n: x.n, auteur: x.auteurNom, texte: x.action.texte || x.action.competence || x.action.type }));

    /**
     * Associe les défenses aux attaques en attente. Une défense n'est JAMAIS jetée pour une faute de numéro :
     * 1) par numéro visé (« [#2] ») ; 2) les autres, dans l'ordre, sur les attaques restantes ; 3) une attaque sans défense touche de plein fouet.
     * @returns {{liens:{attaque, defenses:object[]}[], orphelines:object[]}}
     */
    function lierDefenses(attaques, defenses) {
      const liens = attaques.map((attaque) => ({ attaque, defenses: [] }));
      const restantes = [];
      for (const d of defenses) {
        const cible = d.defense && d.defense.vise != null ? liens.find((l) => l.attaque.n === d.defense.vise) : null;
        if (cible) cible.defenses.push(d); else restantes.push(d);
      }
      const libres = liens.filter((l) => !l.defenses.length);
      const orphelines = [];
      restantes.forEach((d, i) => { if (libres[i]) libres[i].defenses.push(d); else orphelines.push(d); });
      return { liens, orphelines };
    }

    /**
     * Point d'entrée : intègre un pavé (déjà évalué) dans l'état du match.
     *  • consomme la tolérance (commit) ;
     *  • pavé annulé → toutes les attaques en attente contre ce joueur touchent de plein fouet (aucune défense retenue) ;
     *  • sinon → défenses liées aux attaques ; ses propres attaques sont mises en attente contre l'adversaire.
     * La résolution chiffrée (dégâts, coûts, écarts de S…) viendra du moteur de règles à partir de `liens`.
     */
    function integrerPave(match, { joueurId, joueurNom, adversaireId, tour, paveId, parse, decision }) {
      appliquerDecision(match, joueurId, decision, tour);
      const enAttente = attaquesEnAttente(match, joueurId);
      const defenses = decision.annule ? [] : parse.actions.filter((a) => a.type === 'defense');
      const { liens, orphelines } = lierDefenses(enAttente, defenses);
      for (const att of enAttente) att.statut = 'resolue';
      const empilees = decision.annule ? [] : empiler(match, { auteurId: joueurId, auteurNom: joueurNom, cibleId: adversaireId, paveId, tour, actions: parse.actions });
      return { liens, orphelines, empilees, pleinFouet: liens.filter((l) => !l.defenses.length).map((l) => l.attaque) };
    }

    return { CFG, verifierPave, evaluerPave, appliquerDecision, composerMessages, empiler, attaquesEnAttente, pourPrompt, lierDefenses, integrerPave };
})();

//================================================
// 🛡️ DÉFENSES — options de réaction et coûts (équivalent de esquive.js)
//================================================
// Source : image « Close Combat » (Combat Speed S), image « Close Combat Dynamique » (coûts de Stamina),
// image « Attaque à pleine puissance » (zone de vitesse de 5 m).
// Toutes les interprétations sont des drapeaux nommés dans DEFENSES.CFG.
const DEFENSES = (() => {
    'use strict';

    const CFG = {
        // Réactions permises selon l'écart de Combat Speed (défenseur − attaquant)
        MODES: {
            inferieur: ['esquive', 'blocage'],                                          // retard 1 s : bloquer et esquiver seulement
            egal: ['esquive', 'blocage', 'deviation', 'saisie'],                        // retard 0,5 s : dévier et saisir
            sup1: ['esquive', 'blocage', 'deviation', 'saisie', 'contre'],              // aucun retard : réagit au même moment
            sup2: ['esquive', 'blocage', 'deviation', 'saisie', 'contre'],
        },
        // Coûts de Stamina (en %)
        COUT: { esquive: 10, esquiveZone: 20, esquiveSup2: 5, saisie: 5, saisieSup2: 0, changement_trajectoire: 5, blocage: 0, deviation: 0, contre: 0 },
        ZONE_VITESSE_M: 5,                       // attaque frontale lancée à ≤ 5 m : esquive à 20 % si on n'est pas plus rapide qu'elle
        // HYPOTHÈSE : les images ne disent pas laquelle l'emporte quand S+2 (5 %) et zone de 5 m (20 %) s'appliquent ensemble.
        PRIORITE_COUT_ESQUIVE: 'ecart',          // 'ecart' : S+2 l'emporte (5 %)  |  'zone' : la zone de 5 m l'emporte (20 %)
        // Vitesse des attaques d'énergie (m/s)
        VITESSE_ATTAQUE: { basic: 6, advanced: 8, ultime: 10, projectile_energie: 6, projectile_physique: 5 },
        // HYPOTHÈSE : l'interruption (« coupe ») n'existe pas dans les règles de ce jeu → traitée comme un contre.
        COUPE_COMME: 'contre',
    };

    const modeEffectif = (m) => (m === 'coupe' ? CFG.COUPE_COMME : m);

    /** Écart de Combat Speed (défenseur − attaquant). Un perso « Ss » est toujours +2 face à un non-Ss (image Close Combat). */
    function ecart(def, att) {
        if (def.ss && !att.ss) return 2;
        if (att.ss && !def.ss) return -2;
        return (def.rang || 0) - (att.rang || 0);
    }
    const classe = (g) => (g < 0 ? 'inferieur' : g === 0 ? 'egal' : g === 1 ? 'sup1' : 'sup2');
    const modesPermis = (g) => CFG.MODES[classe(g)];

    /** Vitesse de l'attaque (m/s) si elle a une zone de vitesse (énergie / projectile), sinon null (coup au corps à corps). */
    function vitesseAttaque(a) {
        const e = (a && a.energie) || {};
        if (e.projectile) return CFG.VITESSE_ATTAQUE.projectile_energie;
        if (e.niveau) return CFG.VITESSE_ATTAQUE[e.niveau];
        if (a && a.frappe && a.frappe.genre === 'projectile') return CFG.VITESSE_ATTAQUE.projectile_physique;
        return null;
    }

    /** Coût de Stamina (en %) d'une réaction. */
    function coutStamina({ mode, gap, distance, action, vitesseDefenseur, instantane }) {
        const m = modeEffectif(mode);
        if (m === 'esquive') {
            const va = vitesseAttaque(action);
            const zone = distance != null && distance <= CFG.ZONE_VITESSE_M && va != null && !instantane && !(vitesseDefenseur > va);
            if (CFG.PRIORITE_COUT_ESQUIVE === 'ecart') {
                if (gap >= 2) return CFG.COUT.esquiveSup2;
                return zone ? CFG.COUT.esquiveZone : CFG.COUT.esquive;
            }
            if (zone) return CFG.COUT.esquiveZone;
            return gap >= 2 ? CFG.COUT.esquiveSup2 : CFG.COUT.esquive;
        }
        if (m === 'saisie') return gap >= 2 ? CFG.COUT.saisieSup2 : CFG.COUT.saisie;
        return CFG.COUT[m] || 0;
    }

    return { CFG, ecart, classe, modesPermis, vitesseAttaque, coutStamina, modeEffectif };
})();

//================================================
// ⚙️ MOTEUR DE RÉSOLUTION — chiffres, jets et règles (équivalent de moteur.js)
//================================================
// Déterministe : l'IA ne fait que COMPRENDRE le pavé ; les pourcentages, coûts et issues sont calculés ici.
// Entrée : les « liens » attaque ↔ défenses (REGLES.integrerPave). Sortie : l'état du défenseur après le pavé + le détail par attaque.
// Source des valeurs : les 4 images de règles. Tout ce qui est interprété est un drapeau nommé dans MOTEUR.CFG.
const MOTEUR = (() => {
    'use strict';

    const CFG = {
        DEGATS_COUP_PCT: 10,                                    // image 1 : un coup = 10 % PV
        DEGATS_NIVEAU_PCT: { basic: 50, advanced: 70, ultime: 100 },   // image 2
        DEGATS_PROJECTILE_PCT: 20,                              // image 2 : projectile physique = 20 % PV
        DEGATS_PROJECTION_PCT: 10,                              // image 3 : envoyé valser contre le décor = 10 % PV
        ZONES_CRITIQUES: ['tete', 'gorge', 'coeur'],            // HYPOTHÈSE : « tranchant en endroit critique = mort » (image 2)
        FORCE_DEMI_DEGATS: 2,                                   // image 3 : Force +2 → dégâts de coups et projections divisés par 2
        REACTION_IMPOSSIBLE: 'ratee',                           // HYPOTHÈSE : réaction interdite par l'écart de S → l'attaque touche
        STAMINA_INSUFFISANTE: 'ratee',                          // HYPOTHÈSE : pas assez de Stamina → la défense échoue sans rien coûter
        CONTRE_ENCAISSE: true,                                  // HYPOTHÈSE : un « contre à travers » encaisse quand même le coup
        REEVALUER_APRES_PARTIELLE: true,                        // consigne arbitre : une défense partielle change l'état pour la suivante
        TECHNIQUE_DEGATS_PAR_NIVEAU: false,                     // les techniques nommées dépendent de la carte → non chiffrées par défaut
    };

    /** Nature d'une attaque : dégâts (en % PV), mort immédiate, ou technique non chiffrée. */
    function nature(a) {
        const nom = a.competence || a.texte || a.type;
        const e = a.energie || {};
        if (a.type === 'competence') {
            return { nom, technique: true, pct: CFG.TECHNIQUE_DEGATS_PAR_NIVEAU && e.niveau ? CFG.DEGATS_NIVEAU_PCT[e.niveau] : null };
        }
        if (a.tranchant && CFG.ZONES_CRITIQUES.includes(a.zone)) return { nom, mort: true, zone: a.zone };
        if (e.niveau) return { nom, pct: CFG.DEGATS_NIVEAU_PCT[e.niveau] };
        if (a.frappe && a.frappe.genre === 'projectile') return { nom, pct: CFG.DEGATS_PROJECTILE_PCT };
        return { nom, pct: CFG.DEGATS_COUP_PCT };
    }

    function resoudreLien(lien, ctx) {
        const { def, att, etat, distance, effetsCarte } = ctx;
        const a = lien.attaque.action;
        let nat = nature(a);
        const carte = effetsCarte ? effetsCarte(a, { def, att, etat }) : null;
        if (carte) nat = { ...nat, ...carte };                    // la carte peut fournir pct / mort / lignes
        const res = { n: lien.attaque.n, nom: nat.nom, statut: null, cout: 0, degats: 0, mort: false, raison: '', effets: [] };
        const gap = DEFENSES.ecart(def, att);
        const d = lien.defenses[0] || null;
        let touche = false;

        if (!d) { res.statut = 'plein_fouet'; touche = true; }
        else {
            const mode = DEFENSES.modeEffectif((d.defense && d.defense.mode) || 'esquive');
            if (!DEFENSES.modesPermis(gap).includes(mode)) {
                res.statut = 'ratee'; res.raison = 'réaction impossible avec cet écart de Combat Speed'; touche = CFG.REACTION_IMPOSSIBLE === 'ratee';
            } else if (CFG.REEVALUER_APRES_PARTIELLE && etat.equilibre === 'perdu' && (mode === 'esquive' || mode === 'blocage')) {
                res.statut = 'ratee'; res.raison = 'déséquilibré par la défense précédente'; touche = true;
            } else if (CFG.REEVALUER_APRES_PARTIELLE && etat.posture === 'cassee' && mode === 'blocage') {
                res.statut = 'ratee'; res.raison = 'posture cassée par la défense précédente'; touche = true;
            } else {
                const cout = DEFENSES.coutStamina({ mode, gap, distance, action: a, vitesseDefenseur: def.vitesseMax, instantane: false });
                if (etat.stamina < cout && CFG.STAMINA_INSUFFISANTE === 'ratee') {
                    res.statut = 'ratee'; res.raison = 'Stamina insuffisante'; touche = true;
                } else {
                    etat.stamina = Math.max(0, etat.stamina - cout); res.cout = cout;
                    if (mode === 'contre') { res.statut = 'echange'; touche = CFG.CONTRE_ENCAISSE; }
                    else if (mode === 'blocage') {
                        const fg = (def.force || 0) - (att.force || 0);                  // écart de Force (image 3)
                        const deuxMains = d.membre === 'deux_mains';
                        if (fg >= 0 || (fg === -1 && deuxMains)) res.statut = 'reussie';
                        else if (fg >= -2) {
                            res.statut = 'partielle'; etat.posture = 'cassee';
                            if (fg === -2 && !deuxMains) etat.equilibre = 'perdu';
                            res.raison = fg === -1 ? 'blocage à une main : posture cassée' : (deuxMains ? 'posture cassée' : 'équilibre perdu');
                        } else {
                            res.statut = 'ratee'; res.raison = 'envoyé valser'; touche = true;
                            nat = { nom: nat.nom, pct: CFG.DEGATS_PROJECTION_PCT, projection: true };
                        }
                    } else res.statut = 'reussie';                                         // esquive, déviation, saisie, changement de trajectoire
                }
            }
            if (lien.defenses.length > 1) res.effets.push(`${lien.defenses.length - 1} défense(s) supplémentaire(s) ignorée(s) pour cette attaque`);
        }

        if (touche) {
            if (nat.mort) { res.degats = etat.pv; etat.pv = 0; res.mort = true; if (nat.zone) res.raison = res.raison || `coup tranchant en zone critique (${nat.zone})`; }
            else if (nat.pct != null) {
                const mult = ((def.force || 0) - (att.force || 0)) >= CFG.FORCE_DEMI_DEGATS ? 0.5 : 1;
                const avant = etat.pv; etat.pv = Math.max(0, etat.pv - nat.pct * mult); res.degats = avant - etat.pv;
            } else res.effets.push(`Technique non chiffrée : ${nat.nom} (effet de carte à appliquer)`);
            if (nat.lignes) res.effets.push(...nat.lignes);
        }
        res.touche = touche;
        return res;
    }

    /**
     * @param {{liens:{attaque,defenses}[], defenseur:object, attaquant:object, distance?:number, effetsCarte?:Function}} p
     * defenseur / attaquant : { pv, stamina, energie, rang, ss, force, vitesseMax, … } (voir PIPELINE.statsDe)
     * @returns {{etat:{pv,stamina,energie,posture,equilibre}, details:object[], ko:boolean}}
     */
    function resoudrePave({ liens, defenseur, attaquant, distance, effetsCarte }) {
        const etat = {
            pv: defenseur.pv != null ? defenseur.pv : 100, stamina: defenseur.stamina != null ? defenseur.stamina : 100,
            energie: defenseur.energie != null ? defenseur.energie : 100, posture: 'neutre', equilibre: 'stable',
        };
        const details = [];
        for (const lien of liens) {
            if (etat.pv <= 0) break;
            details.push(resoudreLien(lien, { def: defenseur, att: attaquant, etat, distance, effetsCarte }));
        }
        return { etat, details, ko: etat.pv <= 0 };
    }

    return { CFG, nature, resoudreLien, resoudrePave };
})();

//================================================
// 🎙️ NARRATEUR — texte du verdict, déterministe (équivalent de narrateur.js, sans appel IA)
//================================================
// Même formulation quelle que soit l'IA du relais : le récit est construit à partir de l'extraction et du moteur.
const NARRATEUR = (() => {
    'use strict';

    const VERBES_DEF = { esquive: 'esquive', blocage: 'bloque', deviation: 'dévie', saisie: 'saisit', contre: 'contre', coupe: 'interrompt', changement_trajectoire: 'change la trajectoire' };
    const GENRES = { direct: 'un direct', crochet: 'un crochet', uppercut: 'un uppercut', coup_de_pied: 'un coup de pied', balayage: 'un balayage', taille: 'une taille', estoc: 'un estoc', projectile: 'un projectile', energie: "une attaque d'énergie", autre: 'une frappe' };
    const ZONES = { tete: 'la tête', gorge: 'la gorge', coeur: 'le cœur', thorax: 'le thorax', abdomen: "l'abdomen", dos: 'le dos', jambes: 'les jambes', bras: 'les bras' };
    const sens = (s) => (s === 'gauche' || s === 'droite' ? `par la ${s}` : s === 'avant' ? "vers l'avant" : s === 'arriere' ? "vers l'arrière" : s ? `vers le ${s}` : '');

    function decrireAction(a) {
        const d = a.deplacement || {}, f = a.frappe || {};
        switch (a.type) {
            case 'deplacement': {
                const bits = [d.trajectoire ? `en ${d.trajectoire}` : '', sens(d.sens), d.distanceM != null ? `sur ${d.distanceM} m` : '',
                    d.vitesse === 'vmax' ? 'à vmax' : typeof d.vitesse === 'number' ? `à ${d.vitesse} m/s` : ''].filter(Boolean);
                return `se déplace${bits.length ? ' ' + bits.join(' ') : ''}`;
            }
            case 'attaque': {
                const mem = a.membre ? ` du ${a.membre.replace('_', ' ')}${a.cote ? ' ' + a.cote : ''}`.replace(/ du (tete|corps)/, ' de la $1') : '';
                const arme = a.tranchant ? ' tranchante' : '';
                return `porte ${GENRES[f.genre] || 'une frappe'}${arme}${mem}${a.zone ? ' vers ' + ZONES[a.zone] : ''}`;
            }
            case 'competence': return `utilise ${a.competence || 'une technique'}${a.energie && a.energie.niveau ? ` (${a.energie.niveau})` : ''}`;
            case 'defense': {
                const df = a.defense || {};
                return `${VERBES_DEF[df.mode] || 'réagit'}${df.vise ? ` l'attaque [#${df.vise}]` : ''}`;
            }
            default: return a.texte || 'agit';
        }
    }

    const ICONES = { reussie: '🛡️', partielle: '⚠️', ratee: '❌', echange: '⚔️', plein_fouet: '💥' };
    const LIBELLES = { reussie: 'défense réussie', partielle: 'défense partielle', ratee: 'défense ratée', echange: 'échange de coups', plein_fouet: 'non défendu' };

    function decrireResultat(r) {
        const bits = [];
        if (r.raison) bits.push(r.raison);
        if (r.cout) bits.push(`-${r.cout}% Stamina`);
        if (r.mort) bits.push('coup mortel');
        else if (r.degats) bits.push(`-${Math.round(r.degats * 10) / 10}% PV`);
        return `${ICONES[r.statut] || '•'} [#${r.n}] ${r.nom} : ${LIBELLES[r.statut] || r.statut}${bits.length ? ' (' + bits.join(', ') + ')' : ''}.`;
    }

    /** @returns {{resume:string, lignes:string[]}} resume = une ligne d'actions ; lignes = résultats par attaque reçue */
    function composer({ nom, parse, details }) {
        const actions = parse.actions.map(decrireAction);
        const resume = actions.length ? `${nom} ${actions.join(', puis ')}.` : `${nom} ne fait aucune action.`;
        return { resume, lignes: (details || []).map(decrireResultat) };
    }

    return { decrireAction, decrireResultat, composer };
})();

//================================================
// 🧩 PIPELINE — analyse complète d'un pavé (cœur de l'arbitre)
//================================================
// relais d'IA (IA) → extraction (PARSEUR) → discipline + file d'attaques (REGLES) → résolution (MOTEUR) → récit (NARRATEUR)
// Le retour garde exactement les champs lus par envoyerResultatPaveGemini : ok, paveDetecte, paveValide, verdict, erreurs[],
// resume, note, joueurSuivant{nom,jid}, plus nombreActions / actions / consequences.
// Champs AJOUTÉS : majTracker[], fin, penalite, modele, source, etat, horsTour, enAttente.
// Modifie `match` : discipline, fileAttaques, compteurPaves, pavesTraites (données simples, pas de timers).
const PIPELINE = (() => {
    'use strict';

    const CFG = {
        VERIFIER_TOUR: true,                                   // ignore un pavé hors tour (= « pas de correction »)
        REPLI_LOCAL: true,                                     // si toutes les IA échouent : LOCAL.analyser (vérification stricte adoucie)
        COUT_ENERGIE_PCT: { basic: 20, advanced: 30, ultime: 50, projectile: 5 },   // image 2 : coût en énergie des attaques d'énergie
        NOTE: { max: 10, parRemarque: 1, tolerance: 4 },       // PLACEHOLDER : sens exact de « note /10 » à confirmer
        PAVES_EN_MEMOIRE: 30,
        TACHE: 'parse_pave', MAX_TOKENS: 2500,
    };

    const num = (j) => String(j || '').split('@')[0].split(':')[0];
    const memeJid = (a, b) => !!a && !!b && num(a) === num(b);
    const nomPerso = (j) => j.personnage || j.pseudo || String(j.jid);

    /** Stats de combat d'un joueur. Rang de Combat Speed = rang de la catégorie (échelle S-, S, S+, … existante) − pénalités. */
    function statsDe(j, match) {
        const niv = j.category ? getNiveauCategorie(j.category) : -1;
        const pen = ((match.discipline && match.discipline[j.jid] && match.discipline[j.jid].penalites) || []).filter((p) => p.stat === 'combatSpeed').length;
        const rang = (j.combatSpeed != null ? Number(j.combatSpeed) : (niv >= 0 ? niv : 0)) - pen;
        const ss = j.ss != null ? !!j.ss : /^ss/.test(normalizeCategorie(j.category || ''));
        return { ...j, rang, ss, force: Number(j.force) || 0, puissance: Number(j.puissance) || 0 };
    }

    /** Note /10 : 0 si annulé ; −1 par remarque ; −4 si la tolérance de début de combat a été utilisée. */
    function calculerNote(decision) {
        if (decision.annule) return 0;
        const remarques = decision.issues.filter((i) => i.classe === 'remarque').length;
        return Math.max(0, CFG.NOTE.max - remarques * CFG.NOTE.parRemarque - (decision.toleranceConsommee ? CFG.NOTE.tolerance : 0));
    }
    function coutEnergie(actions) {
        let c = 0;
        for (const a of actions) {
            if ((a.type !== 'competence' && a.type !== 'attaque') || !a.energie) continue;
            if (a.energie.projectile) c += CFG.COUT_ENERGIE_PCT.projectile; else if (a.energie.niveau) c += CFG.COUT_ENERGIE_PCT[a.energie.niveau];
        }
        return c;
    }
    /** Repli local : on n'annule ni ne pénalise sur la seule foi d'une analyse par mots-clés. */
    function adoucirRepli(decision) {
        const issues = decision.issues.filter((i) => i.classe === 'remarque');
        return { ...decision, issues, etat: 'attention', annule: false, penalite: null, toleranceConsommee: false,
            messages: ['⚠️ Analyse locale (IA indisponible) : vérification stricte du pavé différée.'] };
    }

    /**
     * @param {object} p
     *   user          JID de l'auteur            actionsTexte  texte après « 🌀🎮: »
     *   contexteMatch { match }                  joueursGemini joueurs du tracker (jid, pseudo, personnage, grade, category, vitesseMax, pv, stamina, energie, …)
     *   paveId        id du message (évite un double traitement)
     *   options       { resoudre?, effetsCarte?, verifierTour? } surcharge de CFG
     */
    async function analyser({ user, actionsTexte, contexteMatch = {}, joueursGemini = [], paveId = null, options = {} }) {
        const opt = { ...CFG, ...options };
        const match = (contexteMatch && contexteMatch.match) || contexteMatch;
        const base = { paveDetecte: true, user, actionsTexte };

        const moi = joueursGemini.find((j) => memeJid(j.jid, user));
        const adv = moi && joueursGemini.find((j) => j !== moi);
        if (!moi || !adv) return { ok: false, ...base, erreur: 'Joueur ou adversaire introuvable dans le match' };
        if (moi.ko || adv.ko) return { ok: false, ...base, erreur: 'Le match est terminé' };

        if (paveId && match.pavesTraites && match.pavesTraites[paveId]) return match.pavesTraites[paveId];

        const attendu = match.joueurTour || match.joueurActifJid || null;
        if (opt.VERIFIER_TOUR !== false && opt.verifierTour !== false && attendu && !memeJid(attendu, moi.jid)) {
            return { ok: false, ...base, horsTour: true, erreur: "Ce n'est pas ton tour : message ignoré." };
        }
        if (match.paveEnCours) return { ok: false, ...base, horsTour: true, erreur: "Un pavé est déjà en cours d'analyse." };
        match.paveEnCours = moi.jid;                                 // vérifier + poser AVANT tout await (JS mono-thread = atomique)

        try {
            const tour = ((match.compteurPaves && match.compteurPaves[moi.jid]) || 0) + 1;   // « tour » du joueur (match.tour n'est jamais incrémenté)

            //------------------------------------------------
            // 1. Extraction (IA, sinon repli local)
            //------------------------------------------------
            let parse, source = 'ia', modele = null;
            const prompt = PARSEUR.construirePrompt({
                joueur: { nom: `${nomPerso(moi)} (joueur ${moi.pseudo || moi.jid})`, grade: moi.grade, vmax: moi.vitesseMax },
                adversaire: { nom: `${nomPerso(adv)} (joueur ${adv.pseudo || adv.jid})` },
                distance: moi.distanceAdversaire, tour, attaquesEnAttente: REGLES.pourPrompt(match, moi.jid), actionsTexte,
            });
            const r = await IA.demander({
                tache: opt.TACHE, messages: [{ role: 'user', content: prompt }], json: true, temperature: 0, maxTokens: opt.MAX_TOKENS,
                cle: match.id || match.matchId || 'match', valider: PARSEUR.valider,
            });
            if (r.ok) { parse = PARSEUR.normaliser(r.data); modele = r.modele; }
            else if (opt.REPLI_LOCAL) {
                parse = PARSEUR.normaliser(LOCAL.analyser(actionsTexte, { cibleNoms: [nomPerso(adv), adv.pseudo].filter(Boolean) }));
                source = 'local'; modele = 'local';
            } else return { ok: false, ...base, enAttente: true, erreur: `Aucune IA disponible : ${r.erreurs.join(' | ')}` };

            //------------------------------------------------
            // 2. Discipline + file d'attaques
            //------------------------------------------------
            let decision = REGLES.evaluerPave(parse, { tour, joueur: moi.jid, discipline: match.discipline });
            if (source === 'local') decision = adoucirRepli(decision);
            const integ = REGLES.integrerPave(match, { joueurId: moi.jid, joueurNom: nomPerso(moi), adversaireId: adv.jid, tour, paveId: paveId || `p${Date.now()}`, parse, decision });
            match.compteurPaves = match.compteurPaves || {};
            match.compteurPaves[moi.jid] = tour;

            //------------------------------------------------
            // 3. Résolution chiffrée des attaques reçues + coût en énergie
            //------------------------------------------------
            const statsMoi = statsDe(moi, match), statsAdv = statsDe(adv, match);
            const resolveur = typeof opt.resoudre === 'function' ? opt.resoudre : MOTEUR.resoudrePave;
            const reso = (await resolveur({ liens: integ.liens, defenseur: statsMoi, attaquant: statsAdv, distance: moi.distanceAdversaire, effetsCarte: opt.effetsCarte, parse, decision, match })) || {};
            const etat = reso.etat || { pv: moi.pv, stamina: moi.stamina, energie: moi.energie, posture: 'neutre', equilibre: 'stable' };
            const details = reso.details || [];
            const energieAvant = moi.energie != null ? moi.energie : 100;
            const energieApres = Math.max(0, energieAvant - (decision.annule ? 0 : coutEnergie(parse.actions)));
            const staminaAvant = moi.stamina != null ? moi.stamina : 100;
            const majTracker = [];
            if (etat.pv !== moi.pv || etat.stamina !== staminaAvant || energieApres !== energieAvant || etat.posture !== 'neutre' || etat.equilibre !== 'stable') {
                majTracker.push({ jid: moi.jid, pv: etat.pv, stamina: etat.stamina, energie: energieApres, posture: etat.posture, equilibre: etat.equilibre });
            }
            const ko = etat.pv <= 0;
            const fin = ko ? { gagnantJid: adv.jid, gagnantPseudo: adv.pseudo || adv.jid, perdantJid: moi.jid, raison: 'KO' } : null;

            //------------------------------------------------
            // 4. Récit + verdict au format actuel
            //------------------------------------------------
            const recit = NARRATEUR.composer({ nom: nomPerso(moi), parse, details });
            const lignePenalite = decision.penalite ? `⚠️ Pénalité (erreur tolérée en début de combat) : ${decision.penalite.libelle}.` : null;
            const ligneKO = ko ? `☠️ ${nomPerso(moi)} est KO.` : null;
            const actions = parse.actions.map((a) => {
                const lie = integ.liens.find((l) => l.defenses.includes(a));
                const res = lie && details.find((d) => d.n === lie.attaque.n);
                const mes = decision.issues.filter((i) => i.n === a.n).map((i) => i.message);
                return {
                    ordre: a.n, acteur: nomPerso(moi), cible: a.cible || nomPerso(adv), type: a.type, description: a.texte,
                    valide: !decision.annule, raison: decision.annule ? (mes.join(' ') || 'Pavé annulé') : mes.join(' '),
                    resultatDefense: a.type === 'defense' ? (lie ? `liée à [#${lie.attaque.n}]${res ? ' : ' + res.statut : ''}` : 'aucune attaque visée') : '',
                    consequence: a.type === 'attaque' || a.type === 'competence' ? (decision.annule ? 'annulée' : "mise en attente (l'adversaire peut y répondre)") : '',
                };
            });

            let verdict = '', resume = '', erreurs = [];
            if (decision.annule) {
                verdict = ['Aucune action ne passe.', ...recit.lignes, ligneKO].filter(Boolean).join('\n');
                erreurs = [...decision.issues.map((i) => i.message), ...(lignePenalite ? [lignePenalite] : [])];
            } else {
                resume = [recit.resume, ...decision.messages, ...recit.lignes, ligneKO].filter(Boolean).join('\n');
            }

            const resultat = {
                ok: true, ...base,
                paveValide: !decision.annule, nombreActions: parse.nombreActions, actions,
                note: calculerNote(decision), verdict, resume,
                joueurSuivant: { nom: adv.pseudo || adv.jid, jid: adv.jid },
                consequences: {
                    touche: details.some((d) => d.touche), contre: details.some((d) => d.statut === 'echange'), mauvaisContre: decision.annule && integ.liens.length > 0,
                    degats: details.reduce((s, d) => s + (d.degats || 0), 0), effets: details.flatMap((d) => d.effets || []),
                    position: '', posture: etat.posture, equilibre: etat.equilibre, garde: '',
                },
                erreurs,
                majTracker, fin, penalite: decision.penalite || null, modele, source, etat: decision.etat,
            };
            match.pavesTraites = match.pavesTraites || {};
            match.pavesTraites[paveId || `p${Date.now()}`] = resultat;
            const cles = Object.keys(match.pavesTraites);
            if (cles.length > opt.PAVES_EN_MEMOIRE) delete match.pavesTraites[cles[0]];
            return resultat;
        } finally {
            match.paveEnCours = null;
        }
    }

    function composerMessageFin(resultat) {
        return resultat && resultat.fin ? `🏆 *VICTOIRE* de @${resultat.fin.gagnantPseudo} par ${resultat.fin.raison} !` : null;
    }

    return { CFG, analyser, composerMessageFin, statsDe, calculerNote };
})();

//================================================
// 🤖 ANALYSE PAVÉ AVEC GEMINI
//================================================

async function analysePaveAvecGemini(message, contexteMatch = {}) {

    try {

        //================================================
        // 1️⃣ RÉCUPÉRATION DU TEXTE
        //================================================

        const texte =
            typeof message === "string"
                ? message
                : message?.body ||
                  message?.text ||
                  message?.message?.conversation ||
                  "";

        if (!texte) {
            return {
                ok: false,
                paveDetecte: false,
                erreur: "Message vide"
            };
        }


        //================================================
        // 2️⃣ DÉTECTION DU PAVÉ
        //================================================

        const marqueurDebut =
            "░▒░ RAZORX⚡™ | 🪀GAMING 🎮░▒░";

        const marqueurActions =
            "🌀🎮:";

        const marqueurFin =
            "░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░";


        const estPave =
            texte.includes(marqueurDebut) &&
            texte.includes(marqueurActions) &&
            texte.includes(marqueurFin);


        if (!estPave) {

            return {
                ok: true,
                paveDetecte: false
            };

        }


        //================================================
        // 3️⃣ RÉCUPÉRATION DE L'AUTEUR
        //================================================

        const user =
            message?.sender ||
            message?.participant ||
            message?.key?.participant ||
            message?.key?.remoteJid ||
            contexteMatch?.user ||
            null;


        //================================================
        // 4️⃣ EXTRACTION DES ACTIONS
        //================================================

        const positionActions =
            texte.indexOf(marqueurActions);

        if (positionActions === -1) {

            return {
                ok: false,
                paveDetecte: true,
                user,
                erreur: "Marqueur 🌀🎮: introuvable"
            };

        }


        const actionsTexte =
            texte
                .slice(
                    positionActions +
                    marqueurActions.length
                )
                .split(marqueurFin)[0]
                .trim();


        if (!actionsTexte) {

            return {
                ok: false,
                paveDetecte: true,
                user,
                erreur: "Aucune action trouvée après 🌀🎮:"
            };

        }


        //================================================
// 5️⃣ CONTEXTE SAFE POUR GEMINI
//================================================
// Le contexte contient uniquement les informations
// réellement nécessaires à l'arbitrage du combat.
//
// ⚠️ On ne donne PAS directement match à JSON.stringify()
// car match peut contenir des Timeout/cycles.
//
// ⚠️ Pas de Price, images, rarete, Moves, Patterns, etc.
//================================================

const tracker =
    contexteMatch?.match?.trackerCombatGemini ||
    contexteMatch?.trackerCombatGemini ||
    null;


const joueursMatch =
    Array.isArray(contexteMatch?.match?.joueurs)
        ? contexteMatch.match.joueurs
        : [];


const joueursTracker =
    Array.isArray(tracker?.joueurs)
        ? tracker.joueurs
        : [];

//================================================
// 👥 CONSTRUCTION DES JOUEURS POUR GEMINI
//================================================

const joueursGemini =
    joueursMatch.map(j => {

        const jid =
            j?.jid || null;


        //================================================
        // 🔎 ÉTAT ACTUEL DU TRACKER
        //================================================

        const etat =
            joueursTracker.find(
                t => t?.jid === jid
            ) || null;


        //================================================
        // 👤 PSEUDO DU JOUEUR
        //================================================

        const pseudo =
            j?.pseudo ||
            j?.nomJoueur ||
            etat?.pseudo ||
            null;


        //================================================
        // 🎴 PERSONNAGE
        //================================================

        const personnage =
            etat?.personnage ||
            j?.personnage ||
            j?.nomPersonnage ||
            j?.carte?.name ||
            j?.card?.name ||
            null;


        //================================================
        // 🏷️ GRADE
        //================================================

        const grade =
            etat?.grade ||
            j?.grade ||
            j?.carte?.grade ||
            null;


        //================================================
        // 🏆 CATEGORY
        //================================================

        const category =
            etat?.category ||
            j?.category ||
            j?.carte?.category ||
            null;


        //================================================
        // ⚡ VITESSE MAXIMALE
        //================================================

        const vitesseMax =
            etat?.vitesseMax ??
            j?.vitesseMax ??
            (
                typeof obtenirVitesseMaxParGrade === "function"
                    ? obtenirVitesseMaxParGrade(grade)
                    : null
            );


        //================================================
        // 📦 CONTEXTE COMBAT MINIMAL
        //================================================

        return {

            jid,

            pseudo,

            personnage,

            grade,

            category,

            vitesseMax,

            pv:
                etat?.pv ??
                j?.stats?.pv ??
                100,

            stamina:
                etat?.stamina ??
                j?.stats?.sta ??
                100,

            energie:
                etat?.energie ??
                j?.stats?.energie ??
                100,

            posture:
                etat?.posture ||
                "neutre",

            equilibre:
                etat?.equilibre ||
                "stable",

            distanceAdversaire:
                etat?.distanceAdversaire ??
                null,

            positionRelative:
                etat?.positionRelative ||
                "face",

            weapon: {

                active:
                    etat?.weapon?.active ??
                    false,

                nom:
                    etat?.weapon?.nom ||
                    null
            },

            ko:
                etat?.ko ??
                false,

            //================================================
            // 🆕 STATS DE COMBAT (lues par le moteur : écarts de Force / Puissance / Combat Speed)
            // À alimenter par le code des cartes ; absentes = 0, et Combat Speed = rang de la catégorie.
            //================================================
            force:
                etat?.force ?? j?.force ?? j?.carte?.force ?? j?.card?.force ?? null,

            puissance:
                etat?.puissance ?? j?.puissance ?? j?.carte?.puissance ?? j?.card?.puissance ?? null,

            combatSpeed:
                etat?.combatSpeed ?? j?.combatSpeed ?? j?.carte?.combatSpeed ?? j?.card?.combatSpeed ?? null,

            ss:
                etat?.ss ?? j?.ss ?? j?.carte?.ss ?? j?.card?.ss ?? null
        };

    });

        //================================================
        // 6️⃣ ARBITRAGE : IA → PARSEUR → RÈGLES → MOTEUR → NARRATEUR
        //================================================
        // Le retour garde le format attendu par envoyerResultatPaveGemini (voir PIPELINE).
        return await PIPELINE.analyser({
            user,
            actionsTexte,
            contexteMatch,
            joueursGemini,
            paveId: message?.key?.id || null
        });



    } catch (error) {

        console.error(
            "❌ ERREUR analysePaveAvecGemini :",
            error?.response?.data ||
            error?.message ||
            error
        );

        return {

            ok: false,

            paveDetecte: false,

            erreur:
                error?.response?.data?.error?.message ||
                error?.message ||
                "Erreur inconnue Gemini"

        };

    }

}

//================================================
// 🎮 RENDU VISUEL DU PAVÉ GEMINI
//================================================
async function envoyerResultatPaveGemini(
    ovl,
    chat,
    resultat,
    match = {}
) {

    try {

        if (
            !resultat?.ok ||
            !resultat?.paveDetecte
        ) {

            console.log(
                "❌ Aucun résultat de pavé à afficher"
            );

            return;
        }

        //================================================
        // 🆕 MISE À JOUR DU TRACKER (PV / STAMINA / ÉNERGIE) calculée par le moteur
        //================================================
        for (const maj of resultat.majTracker || []) {
            try {
                appliquerConsequencesCombatGemini(match, maj);
            } catch (e) {
                console.error("❌ MAJ TRACKER :", e?.message || e);
            }
        }

        //================================================
        // 🏁 FIN DE MATCH (KO)
        //================================================
        if (resultat.fin) {
            clearTimeout(match?.timerTour);
            clearTimeout(match?.timerWarning);
            const corps = resultat.paveValide
                ? `✅ *ACTIONS VALIDÉES :*\n- ${resultat.resume || ""}`
                : `❌ *PAVÉ REFUSÉ*\n${resultat.verdict || ""}\n` +
                  (Array.isArray(resultat.erreurs) ? resultat.erreurs.map(e => `- ${e}`).join("\n") : "");
            await ovl.sendMessage(
                chat,
                {
                    text:
`░▒░   *🎮COMBAT ♨️🌀* ░▒░\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n${corps}\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n${PIPELINE.composerMessageFin(resultat)}\n╰───────────────────\n               *JUMP BATTLE ARENA 🌀🔆*`,
                    mentions: [resultat.fin.gagnantJid]
                }
            );
            // nettoyage du match (même logique que stopmatch🌀)
            for (const [id, m] of Object.entries(duelsEnCours)) {
                if (m === match) delete duelsEnCours[id];
            }
            for (const [groupe, id] of Object.entries(matchAttente)) {
                if (!duelsEnCours[id]) delete matchAttente[groupe];
            }
            return;
        }


        //================================================
        // 👤 JOUEUR SUIVANT
        //================================================

        const joueurSuivant =
            resultat.joueurSuivant || {};


        const prochainJid =
            joueurSuivant.jid || null;


        //================================================
        // 👤 RÉCUPÉRATION DU PSEUDO
        // ⚠️ JAMAIS LE NOM DU PERSONNAGE
        //================================================

        let prochainPseudo = null;


        //================================================
        // 🔎 1️⃣ RECHERCHE DANS match.joueurs
        //================================================

        if (
            prochainJid &&
            Array.isArray(match?.joueurs)
        ) {

            const joueur =
                match.joueurs.find(
                    j =>
                        j?.jid === prochainJid
                );


            if (joueur) {

                prochainPseudo =
                    joueur.pseudo ||
                    joueur.username ||
                    joueur.user ||
                    joueur.nomJoueur ||
                    null;

            }

        }


        //================================================
        // 🔎 2️⃣ RECHERCHE DANS match.players
        //================================================

        if (
            !prochainPseudo &&
            prochainJid &&
            match?.players
        ) {

            for (
                const equipe
                of Object.values(match.players)
            ) {

                const joueur =
                    equipe?.find?.(
                        j =>
                            j?.jid === prochainJid
                    );


                if (joueur) {

                    prochainPseudo =
                        joueur.pseudo ||
                        joueur.username ||
                        joueur.user ||
                        joueur.nomJoueur ||
                        null;


                    if (prochainPseudo) {
                        break;
                    }

                }

            }

        }


        //================================================
        // 🔎 3️⃣ GEMINI PEUT FOURNIR LE PSEUDO
        //================================================

        if (!prochainPseudo) {

            prochainPseudo =
                joueurSuivant.pseudo ||
                joueurSuivant.username ||
                joueurSuivant.user ||
                null;

        }


        //================================================
        // 👤 SECOURS
        //================================================

        if (!prochainPseudo) {

            prochainPseudo =
                prochainJid ||
                "Joueur suivant";

        }


        //================================================
        // 🔄 TRANSFERT DU TOUR
        // ⚠️ VALIDE OU REFUSÉ
        //================================================

        if (
            match &&
            prochainJid
        ) {

            match.joueurTour =
                prochainJid;

            match.currentPlayer =
                prochainJid;

            match.joueurActuel =
                prochainJid;


            console.log(
                "🔄 TOUR TRANSFÉRÉ À :",
                prochainPseudo,
                "|",
                prochainJid
            );

        }


        //================================================
        // ⏱️ TIMER DU PROCHAIN JOUEUR
        //================================================

        if (
            typeof startTimerPourJoueur === "function" &&
            prochainJid
        ) {

            await startTimerPourJoueur(
                chat,
                prochainJid,
                match
            );

        }


        //================================================
        // ❌ PAVÉ INVALIDE
        //================================================

        if (!resultat.paveValide) {

            const erreurs =
                Array.isArray(resultat.erreurs)
                    ? resultat.erreurs
                        .map(
                            e => `- ${e}`
                        )
                        .join("\n")
                    : "Pavé invalide";


            const texte =

`░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

❌ *PAVÉ REFUSÉ*

${resultat.verdict ||
    "Le pavé est invalide."}

${erreurs}

📊 *Note du pavé :*
${resultat.note ?? 0}/10 ⭐

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆 *JOUEUR SUIVANT :*

➡️ @${prochainPseudo} *GO!!* 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;


            await ovl.sendMessage(
                chat,
                {
                    text: texte,

                    mentions:
                        prochainJid
                            ? [prochainJid]
                            : []
                }
            );


            console.log(
                "🎮 PAVÉ REFUSÉ"
            );

            console.log(
                "➡️ PROCHAIN GO :",
                prochainPseudo,
                "|",
                prochainJid
            );


            return;
        }


        //================================================
        // ✅ ACTIONS VALIDÉES
        //================================================

        const resume =
            resultat.resume ||
            "Actions validées.";


        const note =
            Number(resultat.note) || 0;


        //================================================
        // 📤 MESSAGE VISUEL
        //================================================

        const texte =

`░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

✅ *ACTIONS VALIDÉES :*

- ${resume}

📊 *Note du pavé :*
${note}/10 ⭐

▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆 *JOUEUR SUIVANT :*

➡️ @${prochainPseudo} *GO!!* 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;


        await ovl.sendMessage(
            chat,
            {
                text: texte,

                mentions:
                    prochainJid
                        ? [prochainJid]
                        : []
            }
        );


        console.log(
            "🎮 RENDU PAVÉ ENVOYÉ"
        );

        console.log(
            "➡️ PROCHAIN GO :",
            prochainPseudo,
            "|",
            prochainJid
        );


    } catch (error) {

        console.error(
            "❌ ERREUR RENDU PAVÉ GEMINI :",
            error
        );

    }

}


//================================================
// 🧠 TRACKER COMBAT GEMINI
//================================================
function initTrackerCombatGemini(match) {

    const joueurs =
        Array.isArray(match?.joueurs)
            ? match.joueurs
            : [];

    const tracker = {

        //================================================
        // ⚔️ COMBAT
        //================================================

        combat: {

            id:
                match?.id ||
                null,

            etat:
                match?.etat ||
                "ACTIF",

            // 1 tour = 2 pavés
            tour: 0,

            maxTours: 10,

            // Joueur dont c'est actuellement le tour
            joueurTour:
                match?.joueurTour ||
                null,

            // Premier pavé du tour en attente
            paveEnAttente:
                null,

            // Historique des tours
            historique:
                []
        },

        //================================================
        // 👥 JOUEURS
        //================================================

        joueurs:
            joueurs.map(j => {

                const carte =
                    j?.carte ||
                    null;

                const grade =
                    carte?.grade ||
                    j?.grade ||
                    null;

                //================================================
                // ⚡ VMAX SELON LE GRADE
                //================================================

                let vitesseMax =
                    j?.vitesseMax ??
                    null;

                if (vitesseMax == null) {

                    const g =
                        String(grade || "")
                            .toLowerCase()
                            .trim();

                    if (g === "bronze") {

                        vitesseMax = 6;
                    }

                    else if (
                        g === "argent" ||
                        g === "silver"
                    ) {

                        vitesseMax = 8;
                    }

                    else if (
                        g === "or" ||
                        g === "gold"
                    ) {

                        vitesseMax = 10;
                    }
                }

                return {

                    //================================================
                    // 👤 IDENTITÉ
                    //================================================

                    jid:
                        j?.jid ||
                        null,

                    nom:
                        j?.nom ||
                        j?.name ||
                        null,

                    personnage:
                        carte?.name ||
                        j?.personnage ||
                        j?.nomPersonnage ||
                        null,

                    //================================================
                    // 🎴 INFORMATIONS DE RÉFÉRENCE
                    //================================================

                    grade:
                        grade,

                    category:
                        carte?.category ||
                        j?.category ||
                        null,

                    vitesseMax:
                        vitesseMax,

                    //================================================
                    // ❤️ RESSOURCES ACTUELLES
                    //================================================

                    pv: 100,

                    stamina: 100,

                    energie: 100,

                    //================================================
                    // 🧍 ÉTAT PHYSIQUE ACTUEL
                    //================================================

                    posture:
                        "neutre",

                    equilibre:
                        "stable",

                    //================================================
                    // 📏 DISTANCE AVEC L'ADVERSAIRE
                    //================================================

                    distanceAdversaire:
                        null,

                    //================================================
                    // 🧭 POSITION RELATIVE
                    //
                    // face
                    // profil_gauche
                    // profil_droit
                    // avant_gauche
                    // avant_droit
                    // arriere
                    // arriere_gauche
                    // arriere_droit
                    //================================================

                    positionRelative:
                        "face",

                    //================================================
                    // 🔪 ARME
                    //================================================

                    weapon:
                        null,

                    //================================================
                    // ☠️ ÉTAT
                    //================================================

                    ko:
                        false
                };
            })
    };

    //================================================
    // 💾 ATTACHER LE TRACKER AU MATCH
    //================================================

    match.trackerCombatGemini =
        tracker;

    return tracker;
}


//================================================
// 👤 RÉCUPÉRER UN JOUEUR DU TRACKER
//================================================

function getJoueurTrackerCombatGemini(
    match,
    identifiant
) {

    const tracker =
        match?.trackerCombatGemini;

    if (
        !tracker ||
        !Array.isArray(tracker.joueurs)
    ) {

        return null;
    }

    return tracker.joueurs.find(j =>

        j?.jid === identifiant ||

        j?.nom === identifiant ||

        j?.personnage === identifiant

    ) || null;
}


//================================================
// ❤️ MODIFIER LES RESSOURCES
//================================================

function modifierRessourcesCombatGemini(
    match,
    identifiant,
    modifications = {}
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // ❤️ PV
    //================================================

    if (
        modifications.pv != null
    ) {

        joueur.pv =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.pv
                    )
                )
            );
    }

    //================================================
    // 🫀 STAMINA
    //================================================

    if (
        modifications.stamina != null
    ) {

        joueur.stamina =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.stamina
                    )
                )
            );
    }

    //================================================
    // 🌀 ÉNERGIE
    //================================================

    if (
        modifications.energie != null
    ) {

        joueur.energie =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.energie
                    )
                )
            );
    }

    //================================================
    // ☠️ KO AUTOMATIQUE
    //================================================

    if (
        joueur.pv <= 0
    ) {

        joueur.pv = 0;

        joueur.ko = true;
    }

    return joueur;
}


//================================================
// 🧍 MODIFIER L'ÉTAT PHYSIQUE
//================================================

function modifierEtatPhysiqueCombatGemini(
    match,
    identifiant,
    modifications = {}
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // 🧍 POSTURE
    //================================================

    if (
        modifications.posture != null
    ) {

        joueur.posture =
            String(
                modifications.posture
            ).trim();
    }

    //================================================
    // ⚖️ ÉQUILIBRE
    //================================================

    if (
        modifications.equilibre != null
    ) {

        joueur.equilibre =
            String(
                modifications.equilibre
            ).trim();
    }

    return joueur;
}


//================================================
// 📏 MODIFIER LA DISTANCE
//================================================

function modifierDistanceCombatGemini(
    match,
    identifiant,
    distance
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    const valeur =
        Number(distance);

    if (
        !Number.isFinite(valeur)
    ) {

        return joueur;
    }

    joueur.distanceAdversaire =
        Math.max(
            0,
            valeur
        );

    //================================================
    // 📏 LA DISTANCE EST COMMUNE
    //================================================

    const tracker =
        match?.trackerCombatGemini;

    if (
        tracker?.joueurs
    ) {

        for (
            const autre
            of tracker.joueurs
        ) {

            if (
                autre.jid !== joueur.jid
            ) {

                autre.distanceAdversaire =
                    joueur.distanceAdversaire;
            }
        }
    }

    return joueur;
}


//================================================
// 🧭 MODIFIER LA POSITION RELATIVE
//================================================

function modifierPositionRelativeCombatGemini(
    match,
    identifiant,
    position
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    const positionsValides = [

        "face",

        "profil_gauche",

        "profil_droit",

        "avant_gauche",

        "avant_droit",

        "arriere",

        "arriere_gauche",

        "arriere_droit"
    ];

    const nouvellePosition =
        String(
            position || ""
        )
            .toLowerCase()
            .trim();

    if (
        !positionsValides.includes(
            nouvellePosition
        )
    ) {

        return joueur;
    }

    joueur.positionRelative =
        nouvellePosition;

    return joueur;
}


//================================================
// 🔪 MODIFIER L'ARME
//================================================

function modifierWeaponCombatGemini(
    match,
    identifiant,
    weapon
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // 🔪 RETIRER L'ARME
    //================================================

    if (
        weapon === null ||
        weapon === false ||
        weapon === ""
    ) {

        joueur.weapon = null;

        return joueur;
    }

    //================================================
    // 🔪 ARME SOUS FORME DE TEXTE
    //================================================

    if (
        typeof weapon === "string"
    ) {

        joueur.weapon = {

            active: true,

            nom:
                weapon.trim()
        };

        return joueur;
    }

    //================================================
    // 🔪 ARME SOUS FORME D'OBJET
    //================================================

    if (
        typeof weapon === "object"
    ) {

        joueur.weapon = {

            active:
                weapon.active !== false,

            nom:
                weapon.nom ||
                weapon.name ||
                null
        };
    }

    return joueur;
}


//================================================
// 🧠 APPLIQUER LES CONSÉQUENCES GEMINI
//================================================

function appliquerConsequencesCombatGemini(
    match,
    consequences = {}
) {

    if (
        !match?.trackerCombatGemini
    ) {

        return null;
    }

    const identifiant =
        consequences.jid ||
        consequences.personnage ||
        consequences.nom;

    if (!identifiant) {
        return null;
    }

    //================================================
    // ❤️ RESSOURCES
    //================================================

    modifierRessourcesCombatGemini(
        match,
        identifiant,
        {

            pv:
                consequences.pv,

            stamina:
                consequences.stamina,

            energie:
                consequences.energie
        }
    );

    //================================================
    // 🧍 ÉTAT PHYSIQUE
    //================================================

    modifierEtatPhysiqueCombatGemini(
        match,
        identifiant,
        {

            posture:
                consequences.posture,

            equilibre:
                consequences.equilibre
        }
    );

    //================================================
    // 📏 DISTANCE
    //================================================

    if (
        consequences.distanceAdversaire != null
    ) {

        modifierDistanceCombatGemini(
            match,
            identifiant,
            consequences.distanceAdversaire
        );
    }

    //================================================
    // 🧭 POSITION
    //================================================

    if (
        consequences.positionRelative
    ) {

        modifierPositionRelativeCombatGemini(
            match,
            identifiant,
            consequences.positionRelative
        );
    }

    //================================================
    // 🔪 ARME
    //================================================

    if (
        consequences.weapon !== undefined
    ) {

        modifierWeaponCombatGemini(
            match,
            identifiant,
            consequences.weapon
        );
    }

    return getJoueurTrackerCombatGemini(
        match,
        identifiant
    );
}

//-------- UTILITAIRES
const formatNumber = n => {
    try {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch {
        return n;
    }
};

const normalize = str =>
    String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

//================================================
// ⚡ VITESSE MAXIMALE SELON LE GRADE
//================================================

function obtenirVitesseMaxParGrade(grade) {

    const g =
        String(grade || "")
            .toLowerCase()
            .trim();

    switch (g) {

        case "bronze":
            return 6;

        case "argent":
            return 8;

        case "or":
            return 10;

        default:
            return null;
    }
}


//================================================
// ⚡ VITESSE EFFECTIVE DU PERSONNAGE
//================================================

function obtenirVitesseEffective(
    joueur,
    details = {}
) {

    //============================================
    // 🚫 Aucune vitesse maximale demandée
    //============================================

    if (details.vmax !== true) {

        // Vitesse numérique explicitement donnée
        if (
            typeof details.vmax === "number"
        ) {

            return details.vmax;
        }

        // Vitesse normale
        if (
            typeof details.vitesse === "number"
        ) {

            return details.vitesse;
        }

        return null;
    }


    //============================================
    // 🎴 RÉCUPÉRATION DU GRADE
    //============================================

    const grade =
        joueur?.grade ||
        joueur?.Grade ||
        joueur?.card?.grade ||
        joueur?.carte?.grade ||
        null;


    //============================================
    // ⚡ VMAX SELON LE GRADE
    //============================================

    const vitesse =
        obtenirVitesseMaxParGrade(
            grade
        );


    //============================================
    // 📋 DEBUG
    //============================================

    console.log(
        "⚡ VMAX PERSONNAGE :",
        joueur?.nom ||
        joueur?.name ||
        "Inconnu",
        "| Grade :",
        grade,
        "| Vitesse :",
        vitesse
            ? `${vitesse} m/s`
            : "INCONNUE"
    );


    return vitesse;
}

//================= UTILS =================
function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(0, Math.min(100, stats[stat] + val));
}

function clean(txt) {
    return txt.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function normalizeName(str = "") {
    return String(str)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "") // retire les drapeaux
        .replace(/[^\p{L}\p{N}]/gu, "")         // garde seulement lettres et chiffres
        .toLowerCase()
        .trim();
}
                                           
            
                    
//================================================
// 🔎 NORMALISATION
//================================================
function normaliserAction(texte = "") {

    return String(texte)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
        .toLowerCase()
        .replace(/[’']/g, " ")
        .replace(/[^\p{L}\p{N}°\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

//================================================
// 🎮 CONFIGURATION PAVÉ ALL STARS
//================================================

const MAX_ACTIONS_PAVE = 4;

const DUREE_ACTION_NORMALE = 1;   // 1 seconde
const DUREE_ACTION_COMBO = 0.5;   // 0.5 seconde


//================================================
// 📏⚔️ CONFIGURATION DISTANCES COMBAT ALL STARS
//================================================

// Distance initiale entre deux combattants
const DISTANCE_INITIALE_COMBAT = 5;

// Distance "close"
const DISTANCE_CLOSE = 0.5;

// Portée maximale des attaques
const PORTEE_MAIN = 0.5;
const PORTEE_PIED = 1.0;

// Tolérance pour éviter les erreurs de décimales
const TOLERANCE_DISTANCE = 0.01;

//================================================
// 🎮 ACTIONS MAP — ALL STARS
//================================================

const ACTIONS_MAP = {

    //================================================
    // 🥊 FRAPPES
    //================================================

    frapper: {

        //================================================
        // 👊 FRAPPES AVEC LES MAINS
        //================================================

        mains: {

            // 1 — COUP DIRECT
            coup_direct: {
                aliases: [
                    "coup direct",
                    "direct",
                    "coup de poing direct",
                    "poing direct",
                    "jab",
                    "straight"
                ],
                type: "poing",
                trajectoire: "directe",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 2 — CROCHET GAUCHE
            crochet_gauche: {
                aliases: [
                    "crochet gauche",
                    "left hook",
                    "hook gauche"
                ],
                type: "poing",
                main: "gauche",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 3 — CROCHET DROIT
            crochet_droit: {
                aliases: [
                    "crochet droit",
                    "right hook",
                    "hook droit"
                ],
                type: "poing",
                main: "droite",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 4 — UPPERCUT
            uppercut: {
                aliases: [
                    "uppercut",
                    "coup de poing remontant"
                ],
                type: "poing",
                trajectoire: "montante",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 5 — UPPERCUT SAUTÉ
            uppercut_saute: {
                aliases: [
                    "uppercut sauté",
                    "rising uppercut",
                    "uppercut en sautant"
                ],
                type: "poing",
                trajectoire: "montante",
                mouvement: "saut",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 6 — COUP EN REVERS
            backfist: {
                aliases: [
                    "coup en revers",
                    "backfist",
                    "revers"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 7 — REVERS CIRCULAIRE
            spinning_backfist: {
                aliases: [
                    "revers circulaire",
                    "spinning backfist",
                    "spinning back fist"
                ],
                type: "poing",
                trajectoire: "circulaire",
                rotation: [
                    "180",
                    "360"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 8 — MARTEAU DESCENDANT
            hammer_descendant: {
                aliases: [
                    "coup marteau descendant",
                    "marteau descendant",
                    "hammer",
                    "hammer fist",
                    "hammer descendant"
                ],
                type: "poing",
                trajectoire: "descendante",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 9 — MARTEAU LATÉRAL
            hammer_lateral: {
                aliases: [
                    "coup marteau latéral",
                    "marteau latéral",
                    "hammer fist side",
                    "side hammer"
                ],
                type: "poing",
                trajectoire: "latérale",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 10 — MARTEAU EN REVERS
            reverse_hammer: {
                aliases: [
                    "coup marteau en revers",
                    "marteau en revers",
                    "reverse hammer",
                    "reverse hammer fist"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
                ]
            }
        },


        //================================================
        // 🦵 FRAPPES AVEC LES PIEDS
        //================================================

        pieds: {

            // 1 — FRONT KICK
            front_kick: {
                aliases: [
                    "front kick",
                    "coup de pied frontal",
                    "coup de pied direct",
                    "coup de pied avant"
                ],
                type: "pied",
                trajectoire: "directe",
                surface: [
                    "semelle",
                    "plante du pied"
                ]
            },

            // 2 — ROUNDHOUSE KICK
            roundhouse_kick: {
                aliases: [
                    "roundhouse kick",
                    "coup circulaire",
                    "coup de pied circulaire"
                ],
                type: "pied",
                trajectoire: "circulaire",
                surface: [
                    "cou-de-pied",
                    "tibia"
                ]
            },

            // 3 — SIDE KICK
            side_kick: {
                aliases: [
                    "side kick",
                    "coup de pied latéral"
                ],
                type: "pied",
                trajectoire: "latérale",
                surface: [
                    "tranchant du pied",
                    "talon"
                ]
            },

            // 4 — BACK KICK
            back_kick: {
                aliases: [
                    "back kick",
                    "coup de pied arrière"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: true,
                surface: [
                    "talon"
                ]
            },

            // 5 — HOOK KICK
            hook_kick: {
                aliases: [
                    "hook kick",
                    "coup de pied en crochet"
                ],
                type: "pied",
                trajectoire: "crochet",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 6 — AXE KICK
            axe_kick: {
                aliases: [
                    "axe kick",
                    "coup de pied descendant",
                    "coup de pied en axe"
                ],
                type: "pied",
                trajectoire: "descendante",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 7 — SPINNING BACK KICK
            spinning_back_kick: {
                aliases: [
                    "spinning back kick",
                    "coup de pied arrière circulaire"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: "360",
                surface: [
                    "talon"
                ]
            },

            // 8 — LOW KICK
            low_kick: {
                aliases: [
                    "low kick",
                    "coup bas",
                    "coup de pied bas"
                ],
                type: "pied",
                trajectoire: "latérale",
                cible: [
                    "cuisse",
                    "mollet"
                ],
                surface: [
                    "tibia",
                    "cou-de-pied"
                ]
            },

            // 9 — KNEE STRIKE
            knee_strike: {
                aliases: [
                    "knee strike",
                    "coup de genou",
                    "coup genou",
                    "genou"
                ],
                type: "genou",
                trajectoire: "montante",
                surface: [
                    "genou"
                ]
            },

            // 10 — FLYING KICK
            flying_kick: {
                aliases: [
                    "flying kick",
                    "coup sauté",
                    "coup de pied sauté"
                ],
                type: "pied",
                mouvement: "saut",
                trajectoire: [
                    "directe",
                    "latérale"
                ],
                surface: [
                    "pied",
                    "talon"
                ]
            }
        }
    },


    //================================================
    // 🏃 DÉPLACEMENTS
    //================================================

    deplacer: {

        avancer: [
            "avance",
            "avancer",
            "avance vers",
            "fonce vers",
            "se rapproche",
            "approche"
        ],

        reculer: [
            "recule",
            "reculer",
            "se recule",
            "prend du recul"
        ],

        gauche: [
            "va à gauche",
            "se déplace à gauche",
            "déplacement gauche"
        ],

        droite: [
            "va à droite",
            "se déplace à droite",
            "déplacement droite"
        ],

        dash: [
            "dash",
            "dash avant",
            "dash arrière",
            "dash gauche",
            "dash droit"
        ],

        course: [
            "court",
            "course",
            "fonce",
            "sprint"
        ],

        vmax: [
            "vmax",
            "à vitesse maximale",
            "vitesse maximale",
            "à pleine vitesse"
        ],

        deplacement_instantane: [
            "déplacement instantané",
            "instantané",
            "téléportation"
        ],

        saut: [
            "saute",
            "saut",
            "bond"
        ],

        bond: [
            "bondit",
            "bond",
            "bond en avant",
            "bond en arrière"
        ]
    },


    //================================================
    // 🛡️ BLOCAGES
    //================================================

    bloquer: {

        blocage: [
            "bloque",
            "blocage",
            "bloquer",
            "pare",
            "parer"
        ],

        blocage_main: [
            "bloque avec la main",
            "blocage à une main",
            "pare avec la main"
        ],

        blocage_deux_mains: [
            "bloque à deux mains",
            "blocage deux mains",
            "pare à deux mains"
        ],

        garde_haute: [
            "garde haute",
            "bloque en garde haute"
        ],

        garde_basse: [
            "garde basse",
            "bloque en garde basse"
        ],

        garde_corps: [
            "protège son corps",
            "garde du corps",
            "bloque le corps"
        ],

        garde_visage: [
            "protège son visage",
            "garde du visage",
            "bloque le visage"
        ]
    },


    //================================================
    // 🌀 ESQUIVES
    //================================================

    esquiver: {

        esquive: [
            "esquive",
            "esquiver",
            "évite",
            "éviter"
        ],

        esquive_gauche: [
            "esquive à gauche",
            "évite à gauche"
        ],

        esquive_droite: [
            "esquive à droite",
            "évite à droite"
        ],

        esquive_arriere: [
            "esquive en arrière",
            "recule pour esquiver"
        ],

        esquive_avant: [
            "esquive vers l'avant"
        ],

        esquive_basse: [
            "se baisse",
            "esquive basse",
            "duck"
        ],

        esquive_laterale: [
            "esquive latérale",
            "déplacement latéral pour esquiver"
        ],

        esquive_vmax: [
            "esquive à vmax",
            "esquive à vitesse maximale"
        ]
    },


    //================================================
    // ✋ SAISIES / GRAPPLES
    //================================================

    saisir: {

        saisie: [
            "saisit",
            "saisie",
            "attrape",
            "agrippe",
            "empoigne"
        ],

        saisir_bras: [
            "saisit le bras",
            "attrape le bras",
            "agrippe le bras"
        ],

        saisir_jambe: [
            "saisit la jambe",
            "attrape la jambe",
            "agrippe la jambe"
        ],

        saisir_corps: [
            "saisit le corps",
            "attrape le corps",
            "agrippe le corps"
        ],

        saisir_coup: [
            "saisit le coup",
            "attrape le coup",
            "saisit l'attaque"
        ]
    },


    //================================================
    // ↪️ DÉVIATIONS
    //================================================

    devier: {

        deviation: [
            "dévie",
            "dévier",
            "déviation",
            "dévie le coup"
        ],

        deviation_main: [
            "dévie avec la main",
            "dévie le coup avec la main"
        ],

        deviation_bras: [
            "dévie avec le bras",
            "dévie avec l'avant-bras"
        ],

        deviation_jambe: [
            "dévie avec la jambe",
            "dévie le coup avec la jambe"
        ]
    },


    //================================================
    // 🔄 CHANGEMENTS DE TRAJECTOIRE
    //================================================

    modifier_trajectoire: {

        changer_trajectoire: [
            "change la trajectoire",
            "modifie la trajectoire",
            "change la direction du coup"
        ],

        rediriger: [
            "redirige le coup",
            "redirige son attaque",
            "redirige l'attaque"
        ]
    },


    //================================================
    // ⚡ ACTIONS DE VITESSE
    //================================================

    vitesse: {

        acceleration: [
            "accélère",
            "accélération",
            "accélère sa course"
        ],

        boost: [
            "boost",
            "booste",
            "mouvement boosté",
            "se booste"
        ],

        vitesse_reduite: [
            "vitesse réduite",
            "avance lentement"
        ]
    },


    //================================================
    // 👁️ SENSORIALITÉ / RECHERCHE
    //================================================

    rechercher: {

        regarder: [
            "regarde autour",
            "regarde autour de lui",
            "observe autour"
        ],

        localiser: [
            "localise",
            "cherche l'adversaire",
            "recherche l'adversaire",
            "tente de localiser"
        ],

        detection: [
            "détecte",
            "détecte l'adversaire",
            "ressent sa présence"
        ]
    },


    //================================================
    // 💥 PROJECTIONS
    //================================================

    projeter: {

        projection: [
            "projette",
            "projection",
            "envoie valser",
            "jette"
        ],

        repousser: [
            "repousse",
            "repousser",
            "fait reculer"
        ],

        envoyer_sol: [
            "projette au sol",
            "envoie au sol",
            "écrase au sol"
        ],

        envoyer_mur: [
            "projette contre un mur",
            "envoie contre un mur",
            "projette contre un bâtiment"
        ]
    },


    //================================================
    // 🗡️ PROJECTILES
    //================================================

    lancer: {

        projectile: [
            "lance",
            "lancer",
            "projectile",
            "projette un projectile"
        ],

        shuriken: [
            "shuriken",
            "lance un shuriken"
        ],

        kunai: [
            "kunai",
            "lance un kunai"
        ],

        couteau: [
            "couteau",
            "lance un couteau"
        ]
    },


    //================================================
    // 🔋 ÉNERGIE / RÉCUPÉRATION
    //================================================

    energie: {

        charger: [
            "charge son énergie",
            "accumule son énergie"
        ],

        recuperer: [
            "récupère",
            "récupère son énergie",
            "récupère sa stamina"
        ],

        degager_energie: [
            "dégage son énergie",
            "libère son énergie"
        ]
    }
};





 //================= RECHERCHE FICHE PAR PSEUDO =================
async function getFicheByPseudo(pseudo) {

    const fiches = await getAllFiches();

    // 1️⃣ Correspondance exacte d'abord
    let fiche = fiches.find(f => f.pseudo === pseudo);

    if (fiche) return fiche;

    // 2️⃣ Correspondance insensible à la casse
    fiche = fiches.find(f =>
        String(f.pseudo).toLowerCase() === String(pseudo).toLowerCase()
    );

    if (fiche) return fiche;

    // 3️⃣ En dernier seulement, version normalisée
    const candidats = fiches.filter(f =>
        normalizeName(f.pseudo) === normalizeName(pseudo)
    );

    // Si plusieurs fiches correspondent, on privilégie celle qui possède un JID
    return candidats.find(f => f.jid && f.jid !== "aucun") || candidats[0];
}

function randomImage(list) {
    return list[Math.floor(Math.random() * list.length)];
}
   
                
//================================================
// 🏟️ ARENES
//================================================
const arenes = [
    {
        nom: "Desert Montagneux⛰️",
        image: "https://files.catbox.moe/aoximf.jpg"
    },
    {
        nom: "Ville en Ruines🏚️",
        image: "https://files.catbox.moe/2qmvpa.jpg"
    },
    {
        nom: "Centre-ville🏙️",
        image: "https://files.catbox.moe/pzlkf9.jpg"
    },
    {
        nom: "Arise🌇",
        image: "https://files.catbox.moe/3vlsmw.jpg"
    },
    {
        nom: "Salle du temps ⌛",
        image: "https://files.catbox.moe/j4e1pp.jpg"
    },
    {
        nom: "Valley de la fin🗿",
        image: "https://files.catbox.moe/m0k1jp.jpg"
    },
    {
        nom: "École d'exorcisme de Tokyo📿",
        image: "https://files.catbox.moe/rgznzb.jpg"
    },
    {
        nom: "Marinford🏰",
        image: "https://files.catbox.moe/4bygut.jpg"
    },
    {
        nom: "Cathédrale⛩️",
        image: "https://files.catbox.moe/ie6jvx.jpg"
    }
];


//================================================
// 🌀 DUELS PAR GROUPE
//================================================
const duelsEnCours = {};
const matchAttente = {};

let lastArenaIndex = -1;


//================================================
// 🏟️ TIRAGE ALEATOIRE DE L'ARENE
//================================================
function tirerAr() {

    let i;

    do {
        i = Math.floor(Math.random() * arenes.length);
    } while (
        arenes.length > 1 &&
        i === lastArenaIndex
    );

    lastArenaIndex = i;

    return arenes[i];
}

//================================================
// ⭐ HIERARCHIE DES CATEGORIES
//================================================
const HIERARCHIE_CATEGORIES = [
    "S-",
    "S",
    "S+",
    "S+ super",
    "S+ ultra",
    "S+ extreme",
    "S+ mega",
    "S+ ultimate",

    "SS-",
    "SS",
    "SS+",
    "SS+ super",
    "SS+ ultra",
    "SS+ extreme",
    "SS+ mega",
    "SS+ ultimate"
];


//================================================
// 🔎 NORMALISATION DE CATEGORIE
//================================================
function normalizeCategorie(categorie = "") {

    return String(categorie)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


//================================================
// 📊 OBTENIR LE NIVEAU D'UNE CATEGORIE
//================================================
function getNiveauCategorie(categorie) {

    const normalisee = normalizeCategorie(categorie);

    const index = HIERARCHIE_CATEGORIES.findIndex(
        c => normalizeCategorie(c) === normalisee
    );

    return index;
}


//================================================
// ⚖️ COMPARER DEUX CATEGORIES
//================================================
function comparerCategories(categorie1, categorie2) {

    const niveau1 = getNiveauCategorie(categorie1);
    const niveau2 = getNiveauCategorie(categorie2);

    if (niveau1 === -1 || niveau2 === -1) {
        console.log(
            "⚠️ Catégorie inconnue :",
            categorie1,
            categorie2
        );

        return 0;
    }

    if (niveau1 > niveau2) return 1;

    if (niveau1 < niveau2) return -1;

    return 0;
}

//================================================
// 🎴 PREPARATION DES PERSONNAGES POUR LE MATCH
//================================================
function preparerPersonnageMatch(joueur, personnage) {

    //========================================
    // ⚡ VITESSE MAXIMALE SELON LE GRADE
    //========================================
    const vitesseMax =
        obtenirVitesseMaxParGrade(
            personnage.grade
        );

    console.log(
        "⚡ VITESSE PERSONNAGE :",
        personnage.name,
        "| Grade :", personnage.grade,
        "| Vmax :", vitesseMax, "m/s"
    );

    return {

        // Joueur propriétaire
        pseudo: joueur.pseudo,
        jid: joueur.jid,

        // Personnage / carte
        nom: personnage.name,

        image: personnage.image,

        grade: personnage.grade,

        category: personnage.category,

        //========================================
        // ⚡ VITESSE
        //========================================
        vitesseMax: vitesseMax,

        //========================================
        // ❤️ STATS DE COMBAT
        //========================================
        stats: {

            sta: 100,

            energie: 100,

            pv: 100
        }
    };
}


//================================================
// 🆚 CREATION DU DUEL
//================================================
function creerDuel(match) {

    const joueur1 = match.joueurs[0];
    const joueur2 = match.joueurs[1];

    const personnage1 = joueur1.personnage;
    const personnage2 = joueur2.personnage;

    //============================================
    // 🏟️ ARENE ALEATOIRE
    //============================================
    const arene = tirerAr();

    //============================================
    // 📊 COMPARAISON DES CATEGORIES
    //============================================
    const comparaison = comparerCategories(
        personnage1.category,
        personnage2.category
    );

    let avantageCategorie = "Égalité";

    if (comparaison > 0) {
        avantageCategorie =
            `${personnage1.name} possède la catégorie supérieure`;
    }

    else if (comparaison < 0) {
        avantageCategorie =
            `${personnage2.name} possède la catégorie supérieure`;
    }

    //============================================
    // 🎴 CREATION DES PERSONNAGES
    //============================================
    const perso1 = preparerPersonnageMatch(
        joueur1,
        personnage1
    );

    const perso2 = preparerPersonnageMatch(
        joueur2,
        personnage2
    );
//============================================
// ⚖️ CALCUL DE L'AVANTAGE
//============================================
const avantage = calculerAvantage(
    personnage1,
    personnage2
);
    
    //============================================
    // 🆚 DUEL
    //============================================
    const duel = {

    id: match.id,

    joueur1: joueur1,
    joueur2: joueur2,

    perso1: perso1,
    perso2: perso2,

    equipe1: [
        perso1
    ],

    equipe2: [
        perso2
    ],

    arene: arene,

    tour: 0,

    avantage: avantage,

    avantageCategorie: avantageCategorie,

    etat: "ready",

    createdAt: Date.now()
};

    return duel;
}

//================================================
// 🆚 FICHE DUEL
//================================================
function generateFicheDuel(duel) {

    const perso1 = duel.perso1;
    const perso2 = duel.perso2;

    return `*🆚VERSUS ARENA BATTLE🏆🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░░▒░

🔆🎴 *${perso1.nom}* :
🫀 Sta : ${perso1.stats.sta}%
🌀 En : ${perso1.stats.energie}%
❤️ Pv : ${perso1.stats.pv}%

                         ~  *🆚*  ~

🔆🎴 *${perso2.nom}* :
🫀 Sta : ${perso2.stats.sta}%
🌀 En : ${perso2.stats.energie}%
❤️ Pv : ${perso2.stats.pv}%

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*🌍 𝐀𝐫𝐞̀𝐧𝐞* : ${duel.arene.nom}
*🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞* : Boost 1 fois chaque 2 tours!
*⚖️ 𝐒𝐭𝐚𝐭𝐬* : ${duel.avantage.texte}
*🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭* : illimitée
*🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌* : 5m
*⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞* : 7mins ⚠️
*⭕ 𝐏𝐨𝐫𝐭𝐞́* : 10m

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*⚠️ Vous avez 🔟 tours max pour finir votre Adversaire !*
*Sinon la victoire sera donnée par décision selon l'offensive !*

╰───────────────────
                            🌀🔆`;
}


//================================================
// 🚀 LANCEMENT DU MATCH ALL STARS
//================================================
async function lancerMatchAllStars(match, chat, ovl) {

    try {

        console.log("🚀 PRÉPARATION DU MATCH :", match.id);

        match.etat = "loading_match";

        //========================================
        // 🌀 MESSAGE DE CHARGEMENT
        //========================================
        const loading = await ovl.sendMessage(chat, {
            text: "🏟️ Sélection de l'arène."
        });


        //========================================
        // 🏟️ ÉTAPE 1 — 15 SECONDES
        //========================================
        for (const txt of [
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène...",
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène..."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🌀 ÉTAPE 2 — 15 SECONDES
        //========================================
        for (const txt of [
            "🌀 Préparation du match.",
            "🌀 Préparation du match..",
            "🌀 Préparation du match...",
            "🌀 Préparation du match.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🔥 ÉTAPE 3 — 15 SECONDES
        //========================================
        for (const txt of [
            "🔥 Initialisation du combat.",
            "🔥 Initialisation du combat..",
            "🔥 Initialisation du combat...",
            "🔥 Initialisation du combat.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // ♨️ ÉTAPE 4 — 15 SECONDES
        //========================================
        for (const txt of [
            "♨️ Le combat va commencer.",
            "♨️ Le combat va commencer..",
            "♨️ Le combat va commencer...",
            "♨️ Le combat va commencer.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🆚 CRÉATION DU DUEL
        //========================================
        const duel = creerDuel(match);

        match.duel = duel;

        match.arene = duel.arene;

        match.etat = "in_match";


        //========================================
        // 🏟️ AFFICHAGE DE L'ARÈNE
        //========================================
        await ovl.sendMessage(chat, {

            image: {
                url: duel.arene.image
            },

            caption: generateFicheDuel(duel)

        });


        //========================================
        // ♨️ DÉMARRAGE DU COMBAT
        //========================================
        await demarrerCombat(
            match,
            chat,
            ovl
        );


        //========================================
        // 📊 LOGS
        //========================================

        console.log(
            "🏟️ Arène sélectionnée :",
            duel.arene.nom
        );

        console.log(
            "🎴 Personnage 1 :",
            duel.perso1.nom,
            "| Catégorie :",
            duel.perso1.category
        );

        console.log(
            "🎴 Personnage 2 :",
            duel.perso2.nom,
            "| Catégorie :",
            duel.perso2.category
        );


    } catch (error) {

        console.error(
            "❌ ERREUR LANCEMENT MATCH ALL STARS :",
            error
        );

        match.etat = "error";

        await ovl.sendMessage(chat, {
            text:
`❌ Une erreur est survenue lors du lancement du match.

Veuillez réessayer.`
        });
    }
}

//================================================
// 🏆 HIERARCHIE DES GRADES
//================================================
const HIERARCHIE_GRADES = [
    "Bronze",
    "Argent",
    "Or"
];


//================================================
// ⚖️ COMPARAISON GRADE
//================================================
function getNiveauGrade(grade = "") {

    const index = HIERARCHIE_GRADES.findIndex(
        g => g.toLowerCase() === String(grade).toLowerCase()
    );

    return index;
}

//================================================
// ⚖️ CALCUL DE L'AVANTAGE TOTAL
//================================================
function calculerAvantage(personnage1, personnage2) {

    const cat1 = getNiveauCategorie(personnage1.category);
    const cat2 = getNiveauCategorie(personnage2.category);

    //============================================
    // 1️⃣ CATÉGORIE DIFFÉRENTE
    //============================================
    if (cat1 !== cat2) {

        const ecart = Math.abs(cat1 - cat2);

        if (cat1 > cat2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 2️⃣ CATÉGORIE ÉGALE → GRADE
    //============================================
    const grade1 = getNiveauGrade(personnage1.grade);
    const grade2 = getNiveauGrade(personnage2.grade);

    if (grade1 !== grade2) {

        const ecart = Math.abs(grade1 - grade2);

        if (grade1 > grade2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 3️⃣ CATÉGORIE + GRADE IDENTIQUES
    //============================================
    return {
        joueur: 0,
        valeur: 0.5,
        texte: `${personnage1.name} +0.5 / ${personnage2.name} +0.5`,
        statsEqual: true
    };
}

//================================================
// 🥊 DETERMINER QUI COMMENCE
//================================================
function determinerPremierJoueur(match) {

    const j1 = match.joueurs[0];
    const j2 = match.joueurs[1];

    const p1 = j1.personnage;
    const p2 = j2.personnage;

    //============================================
    // 1️⃣ COMPARAISON DES CATEGORIES
    //============================================
    const cat1 = getNiveauCategorie(p1.category);
    const cat2 = getNiveauCategorie(p2.category);

    console.log("⚖️ Catégorie J1 :", p1.category, cat1);
    console.log("⚖️ Catégorie J2 :", p2.category, cat2);

    // Catégories différentes
    if (cat1 < cat2) {
        return {
            joueur: j1,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat2 - cat1,
            statsEqual: false
        };
    }

    if (cat2 < cat1) {
        return {
            joueur: j2,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat1 - cat2,
            statsEqual: false
        };
    }


    //============================================
    // 2️⃣ CATÉGORIES ÉGALES → COMPARAISON GRADE
    //============================================
    const grade1 = getNiveauGrade(p1.grade);
    const grade2 = getNiveauGrade(p2.grade);

    console.log("🏅 Grade J1 :", p1.grade, grade1);
    console.log("🏅 Grade J2 :", p2.grade, grade2);

    // Grades différents
    if (grade1 < grade2) {
        return {
            joueur: j1,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade2 - grade1,
            statsEqual: false
        };
    }

    if (grade2 < grade1) {
        return {
            joueur: j2,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade1 - grade2,
            statsEqual: false
        };
    }

//============================================
// 3️⃣ CATÉGORIE + GRADE IDENTIQUES
//============================================
const joueurAleatoire =
    Math.random() < 0.5 ? j1 : j2;

return {
    joueur: joueurAleatoire,
    raison: "catégorie et grade identiques → tirage 0.5",
    type: "random",
    ecart: 0.5,
    statsEqual: true
};
}

//================================================
// ⏱️ TIMER DU JOUEUR ACTIF
//================================================
function lancerTimerTour(match, chat, ovl) {

    // Sécurité : annuler les anciens timers
    if (match.timerTour) {
        clearTimeout(match.timerTour);
    }

    if (match.timerWarning) {
        clearTimeout(match.timerWarning);
    }

    const joueur = match.joueurActif;

    if (!joueur || !joueur.jid) {
        console.log("❌ Impossible de lancer le timer : joueur actif introuvable");
        return;
    }

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    console.log(
        "⏱️ TIMER LANCÉ POUR :",
        pseudo,
        "| JID :",
        jid
    );

    //============================================
    // ⚠️ AVERTISSEMENT À 6 MINUTES
    //============================================
    match.timerWarning = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Le joueur doit toujours être celui qui joue
        if (actuel.joueurActif?.jid !== jid) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ *PLUS QU'1 MINUTE !*

➡️ @${pseudo}

Il te reste seulement 1 minute pour envoyer ton pavé !`,
            mentions: [jid]
        });

    }, 6 * 60 * 1000);


    //============================================
    // ⏰ FIN DES 7 MINUTES
    //============================================
    match.timerTour = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Vérifie que le joueur est toujours actif
        if (actuel.joueurActif?.jid !== jid) return;

        console.log(
            "⏰ TEMPS ÉCOULÉ POUR :",
            pseudo
        );

        await ovl.sendMessage(chat, {
            text:
`⏰ *TEMPS ÉCOULÉ !*

➡️ @${pseudo}

Tu n'as pas envoyé ton pavé dans les 7 minutes.

❌ Ton tour est perdu.`
        });

    }, 7 * 60 * 1000);
}

//================================================
// ♨️ DEBUT DU COMBAT
//================================================
async function demarrerCombat(match, chat, ovl) {

    const premier = determinerPremierJoueur(match);

    const joueur = premier.joueur;

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    // Sauvegarde du joueur actif
    match.joueurActif = joueur;
    match.joueurActifJid = jid;

    match.tour = 1;
    match.phase = "attaque";

    console.log(
        "♨️ PREMIER JOUEUR :",
        pseudo,
        "| JID :",
        jid,
        "| Raison :",
        premier.raison
    );

    //================================================
    // 🎬 MEDIA DE DEBUT DU COMBAT
    //================================================
    await ovl.sendMessage(chat, {
    video: {
        url: "https://files.catbox.moe/1td1ai.mp4"
    },
    gifPlayback: true,
    caption:
`*♨️🎮 DEBUT DU COMBAT🌀*
▔▔▔▔▔▔▔▔▔
➡️ @${pseudo} GO !!!! 🔥

╰───────────────────
                            🌀🔆`,
    mentions: [jid]
});

    //================================================
    // ⏱️ TIMER UNIQUEMENT POUR LE PREMIER JOUEUR
    //================================================
    lancerTimerTour(match, chat, ovl);
}



// COMMANDE DE LANCEMENT DU MATCH🌀🆚//
ovlcmd({
    nom_cmd: "match🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Lancer un match VS"
}, async (ms_org, ovl, cmd_options) => {

    const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;

    const matchId = Date.now().toString();

    // 🧠 création du match
duelsEnCours[matchId] = {
    id: matchId,
    etat: "waiting_players",
    joueurs: [],
    fiches: {},
    personnages: {},
    arene: null,
    tour: 0,
    createdAt: Date.now(),

    timers: {
        waitingPlayers: null,
        turn: null,
        warning: null
    }
};

    matchAttente[chat] = matchId;

    const images = [
        "https://files.catbox.moe/fc5v8n.jpg",
        "https://files.catbox.moe/8g6zu2.jpg"
    ];

    const img = images[Math.floor(Math.random() * images.length)];

    await ovl.sendMessage(chat, {
        image: { url: img },
        caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔅 *MATCH MAKING*
Veuillez inscrire vos pseudos de joueurs:

*🎮 Joueur 1:*
*🎮 Joueur 2:*

⏳ Vous avez 2 minutes pour répondre.

╰───────────────────
🔆 ALL STARS JUMP 🌀`
    });

    // ⏱️ TIMER 2 MINUTES
match.timers.waitingPlayers = setTimeout(async () => {

    const matchActuel = duelsEnCours[matchId];

    if (!matchActuel) return;

    if (matchActuel.etat !== "waiting_players") return;

    await ovl.sendMessage(chat, {
        text:
`⛔ MATCH ANNULÉ
Aucun joueur valide détecté dans le temps imparti.`
    });

    delete duelsEnCours[matchId];
    delete matchAttente[chat];

}, 120000);
});

//================================================
// 🌀 SYSTEME INSCRIPTION JOUEURS MATCH
//================================================
async function verifierJoueursMatch(message, chat, ovl) {


    const matchId = matchAttente[chat];

    if (!matchId) return;


    const match = duelsEnCours[matchId];


    if (!match || match.etat !== "waiting_players") return;



    // Vérifie que c'est bien la fiche du match
    if(
        !message.includes("Joueur 1") ||
        !message.includes("Joueur 2")
    ) return;



    const j1 = message.match(/joueur\s*1\s*:\s*(.+)/i);
    const j2 = message.match(/joueur\s*2\s*:\s*(.+)/i);



    if(!j1 || !j2) return;



    const pseudo1 = j1[1].trim();
const pseudo2 = j2[1].trim();

const fiche1 = await getFicheByPseudo(pseudo1);
const fiche2 = await getFicheByPseudo(pseudo2);

console.log("Pseudo reçu J1 :", pseudo1);
console.log("Pseudo reçu J2 :", pseudo2);

const toutes = await getAllFiches();
console.log("Tous les pseudos :", toutes.map(x => x.pseudo));

if (!fiche1 || !fiche2) {

    await ovl.sendMessage(chat,{
        text:
`❌ JOUEUR INTROUVABLE

${!fiche1 ? `❌ ${pseudo1}` : ""}
${!fiche2 ? `❌ ${pseudo2}` : ""}

Les joueurs doivent posséder une fiche ALL STARS.`
    });

    return;
}
    
const data1 = fiche1.dataValues || fiche1;
const data2 = fiche2.dataValues || fiche2;

match.joueurs=[
{
    pseudo: data1.pseudo,
    jid: data1.jid,
    fiche: data1
},
{
    pseudo: data2.pseudo,
    jid: data2.jid,
    fiche: data2
}
];

console.log("🆔 JID J1 :", data1.jid);
console.log("🆔 JID J2 :", data2.jid);

console.log("🎮 Joueurs sauvegardés :", match.joueurs);

    match.fiches={
        joueur1: fiche1,
        joueur2: fiche2
    };

    if (match.timers?.waitingPlayers) {
    clearTimeout(match.timers.waitingPlayers);
    match.timers.waitingPlayers = null;
    }
    match.etat="loading_characters";

    await ovl.sendMessage(chat,{
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
✅ JOUEURS CONFIRMÉS 🎉

🎮 Joueur 1 : ${fiche1.pseudo}
              🆚
🎮 Joueur 2 : ${fiche2.pseudo}

📂 Les deux fiches ont été trouvées.

╰───────────────────
                      🔆🌀`
    });

   
    const msg = await ovl.sendMessage(chat,{
        text:"🌀 Chargement."
    });

    for(const txt of [
        "🌀 Chargement.",
        "🌀 Chargement..",
        "🌀 Chargement..."
    ]){

        await new Promise(r=>setTimeout(r,500));


        await ovl.sendMessage(chat,{
            text:txt,
            edit:msg.key
        });

    }

    match.etat="waiting_cards";
    
    const imagesChoixPersonnage = [
    "https://files.catbox.moe/ygzb4n.jpg",
    "https://files.catbox.moe/a49tvk.jpg",
    "https://files.catbox.moe/vvspfe.jpg",
    "https://files.catbox.moe/txd8so.jpg"
];

const imgChoix = imagesChoixPersonnage[
    Math.floor(Math.random() * imagesChoixPersonnage.length)
];

await ovl.sendMessage(chat,{
    image: {
        url: imgChoix
    },
    caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔
*🎮\`CHOIX DU PERSONNAGE\`*

♨️Veuillez écrire le nom complet de vos personnages !

Exemple :
🌀 Tanjiro
🌀 Sasuke Hebi
🌀 Goku SSJ

🎮⌛ Temps d'attente : 2 minutes...

╰───────────────────
                      🔆🌀`
});   
 }

//================================================
// 🎴 SYSTEME CHOIX DES PERSONNAGES / CARDS
//================================================
async function verifierCardsMatch(message, chat, ovl, sender) {

    const matchId = matchAttente[chat];

    if (!matchId) return;

    const match = duelsEnCours[matchId];

    if (!match || match.etat !== "waiting_cards") return;


    // ============================================
// 🎮 DÉTERMINER LE JOUEUR QUI DOIT CHOISIR
// ============================================

// ⚠️ Le message peut venir du BOT lui-même.
// On ne doit donc PAS utiliser `sender` pour identifier
// le joueur qui choisit sa carte.

console.log(
    "🤖 JID du message reçu :",
    sender
);

console.log(
    "🆔 JID des joueurs sauvegardés :",
    match.joueurs.map(j => j.jid)
);


// ============================================
// 🎴 CHERCHER LE PREMIER JOUEUR
// QUI N'A PAS ENCORE CHOISI
// ============================================

const joueur = match.joueurs.find(
    j => !j.personnage
);


if (!joueur) {

    console.log(
        "❌ Tous les joueurs ont déjà choisi leur personnage."
    );

    return;
}


console.log(
    "✅ Joueur identifié pour le choix :",
    joueur.pseudo,
    "| JID :",
    joueur.jid
);


    const texte = clean(message);


    // 🚫 Ignorer les messages système
    if (
        texte.includes("ANIME JUMP VERSUS") ||
        texte.includes("CHOIX DU PERSONNAGE") ||
        texte.includes("Veuillez écrire")
    ) return;


    const nomCarte = texte
    .replace(/^[🌀]\s*/u, "")
    .trim();


    if (!nomCarte) return;


    console.log(
        "🎴 Carte demandée :",
        nomCarte,
        "par",
        joueur.pseudo
    );

// ============================================
// 🎴 RÉCUPÉRATION DES CARTES
// 🔥 MÊME SYSTÈME QUE LA BOUTIQUE
// ============================================

const allCards = [];

for (const [placementKey, placementCards] of Object.entries(cards)) {

    for (const c of placementCards) {

        allCards.push({
            ...c,
            placement: placementKey
        });

    }
}


// ============================================
// 🔎 NORMALISATION
// ============================================

const normaliserCarte = str =>
    String(str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-_]/g, "")
        .trim();

const recherche = normaliserCarte(nomCarte);

console.log("🔎 Recherche carte normalisée :", recherche);


// ============================================
// 🎴 RECHERCHE EXACTE
// ============================================

let carte = allCards.find(c =>
    normaliserCarte(c.name) === recherche
);


// ============================================
// 🎴 RECHERCHE PARTIELLE
// ============================================

if (!carte) {

    carte = allCards.find(c =>
        normaliserCarte(c.name).includes(recherche)
    );

}


// ============================================
// ❌ CARTE INTROUVABLE
// ============================================

if (!carte) {

    console.log(
        "❌ Carte introuvable dans la base :",
        nomCarte
    );

    console.log(
        "🔎 Recherche utilisée :",
        recherche
    );

    return;
}


// ============================================
// ✅ CARTE TROUVÉE
// ============================================

console.log(
    "🎴 CARTE TROUVÉE :",
    carte.name
);

console.log(
    "📊 Grade :",
    carte.grade,
    "| Catégorie :",
    carte.category
);
   
// ============================================
// 📂 FICHE DU JOUEUR DÉJÀ SAUVEGARDÉE
// ============================================

const ficheData = joueur.fiche.dataValues || joueur.fiche;


// ============================================
// 🎴 CARTES POSSÉDÉES
// ============================================

const cartesJoueur = ficheData.cards
    ? ficheData.cards
        .split("\n")
        .map(c => c.trim())
        .filter(Boolean)
    : [];


console.log(
    "🎴 Cartes de",
    joueur.pseudo,
    ":",
    cartesJoueur
);


// ============================================
// ✅ VÉRIFICATION DE POSSESSION
// ============================================

const cartePossedee = cartesJoueur.find(c =>
    normaliserCarte(c) === recherche
);


if (!cartePossedee) {

    await ovl.sendMessage(chat, {
        text:
`❌ CARTE NON POSSÉDÉE

🎮 ${joueur.pseudo}
n'a pas la carte :
🎴 ${nomCarte}

Choisis une carte présente dans ta fiche.`
    });

    return;
}


// ============================================
// 🎴 CARTE DÉJÀ TROUVÉE DANS LA BASE
// ============================================

const card = carte;

console.log("🎴 CARTE TROUVÉE :", card);


// ============================================
// 💾 SAUVEGARDE DU PERSONNAGE
// ============================================

joueur.personnage = card;

console.log(
    "✅ Carte validée :",
    joueur.pseudo,
    "=>",
    card.name
);


// ============================================
// 🖼️ CONFIRMATION
// ============================================

await ovl.sendMessage(chat, {
    image: {
        url: card.image
    },
    caption:
`🎴🌀 *Carte :* ${card.name}

Nom : ${card.name}
Grade : ${card.grade}
Catégorie : ${card.category}

▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░
                                 🔆🌀`
});

   
    // ============================================
    // 🔥 LES DEUX JOUEURS ONT CHOISI
    // ============================================
if (
    match.joueurs[0].personnage &&
    match.joueurs[1].personnage
) {

    match.personnages = {
        joueur1: match.joueurs[0].personnage,
        joueur2: match.joueurs[1].personnage
    };

    match.etat = "cards_loaded";

    await ovl.sendMessage(chat, {
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔
🎴 PERSONNAGES FINALISÉS ✅

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

                🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                      🔆🌀`
    });


//============================================
// ⏳ MATCH PRÊT → CHARGEMENT PENDANT 1 MINUTE
//============================================
match.etat = "waiting_match_start";

//============================================
// 🖼️ IMAGE DE CREATION DU MATCH
//============================================
const imagesMatch = [
    "https://files.catbox.moe/fc5v8n.jpg",
    "https://files.catbox.moe/8g6zu2.jpg"
];

const imageMatch = imagesMatch[
    Math.floor(Math.random() * imagesMatch.length)
];

//============================================
// 🎴 MESSAGE DES JOUEURS PRÊTS
//============================================
await ovl.sendMessage(chat, {

    image: {
        url: imageMatch
    },

    caption:
`🌀🔆 *ANIME JUMP VERSUS*

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

🎴✅ *LES JOUEURS SONT PRÊTS !*
*LE MATCH DÉBUTERA DANS 1 MIN⌚ ...*

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                             🔆🌀`
});

//============================================
// ⏱️ ATTENTE AVANT LE CHARGEMENT
//============================================
// Petite pause avant de commencer les animations
await new Promise(resolve =>
    setTimeout(resolve, 1000)
);


//============================================
// 🚀 LANCEMENT DU CHARGEMENT
//============================================
await lancerMatchAllStars(
    match,
    chat,
    ovl
); 
}       
}

//================================================
// 🌀 COMMANDE STATS DU COMBAT
//================================================

ovlcmd({
    nom_cmd: "stats🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Afficher les statistiques actuelles du combat"
}, async (ms_org, ovl, cmd_options) => {

    //================================================
    // 📍 CHAT
    //================================================

    const chat =
        ms_org.from ||
        ms_org.key?.remoteJid ||
        ms_org;

    //================================================
    // 🔎 RÉCUPÉRER LE MATCH
    //================================================

    const match =
        matchsActifs.get(chat);

    if (!match) {

        await ovl.sendMessage(
            chat,
            {
                text:
                    "❌ Aucun combat actif dans ce groupe."
            },
            {
                quoted: ms_org
            }
        );

        return;
    }

    //================================================
    // 🧠 TRACKER COMBAT GEMINI
    //================================================

    const tracker =
        match.trackerCombatGemini;

    if (
        !tracker ||
        !Array.isArray(tracker.joueurs)
    ) {

        await ovl.sendMessage(
            chat,
            {
                text:
                    "❌ Le tracker du combat n'est pas disponible."
            },
            {
                quoted: ms_org
            }
        );

        return;
    }

    //================================================
    // 📊 BARRE DE STATS
    //================================================

    function barreStats(valeur) {

        const longueur = 10;

        const v =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(valeur) || 0
                )
            );

        const pleins =
            Math.round(
                (v / 100) * longueur
            );

        return (
            "█".repeat(pleins) +
            "░".repeat(
                longueur - pleins
            )
        );
    }

    //================================================
    // 👤 AFFICHAGE JOUEUR
    //================================================

    function afficherJoueur(joueur) {

        const nom =
            joueur?.personnage ||
            joueur?.nom ||
            "Inconnu";

        const pv =
            Math.round(
                Number(joueur?.pv) || 0
            );

        const stamina =
            Math.round(
                Number(joueur?.stamina) || 0
            );

        const energie =
            Math.round(
                Number(joueur?.energie) || 0
            );

        const posture =
            joueur?.posture ||
            "neutre";

        const equilibre =
            joueur?.equilibre ||
            "stable";

        const etat =
            joueur?.ko
                ? "🔴 KO"
                : "🟢 ACTIF";

        return `
╭───────────────
│ 👤 ${nom}
│
│ ❤️ PV       : ${pv}%
│ ${barreStats(pv)}
│
│ 🫀 STAMINA  : ${stamina}%
│ ${barreStats(stamina)}
│
│ 🌀 ÉNERGIE  : ${energie}%
│ ${barreStats(energie)}
│
│ 🧍 Posture  : ${posture}
│ ⚖️ Équilibre : ${equilibre}
│
│ ${etat}
╰───────────────`;
    }

    //================================================
    // ⚔️ TOUR
    //================================================

    const tour =
        Number(
            tracker.combat?.tour
        ) || 0;

    const maxTours =
        Number(
            tracker.combat?.maxTours
        ) || 10;

    //================================================
    // 📝 MESSAGE
    //================================================

    let texte = `
🌀🔆 *ANIME JUMP VERSUS*

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🌀 STATS DU COMBAT
⚔️ TOUR : ${tour}/${maxTours}
`;

    for (
        const joueur
        of tracker.joueurs
    ) {

        texte +=
            "\n" +
            afficherJoueur(joueur) +
            "\n";
    }

    texte += `
                                     🌀🔆`;

    //================================================
    // 📤 ENVOI
    //================================================

    await ovl.sendMessage(
        chat,
        {
            text: texte
        },
        {
            quoted: ms_org
        }
    );

});


//================================================
// 🛑 COMMANDE ARRÊT DU MATCH
//================================================
ovlcmd({
    nom_cmd: "stopmatch🌀",
    classe: "ALLSTARS🌀",
    react: "🛑",
    desc: "Arrêter le match ALL STARS en cours"
}, async (ms_org, ovl, cmd_options) => {

    const chat =
        ms_org.from ||
        ms_org.key?.remoteJid ||
        ms_org;

    //============================================
    // 🔎 RECHERCHE DU MATCH DU GROUPE
    //============================================
    const matchId = matchAttente[chat];

    if (!matchId) {

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Il n'y a actuellement aucun match ALL STARS actif dans ce groupe.`
        });

        return;
    }

    //============================================
    // 🔎 RECUPERATION DU MATCH
    //============================================
    const match = duelsEnCours[matchId];

    if (!match) {

        // Nettoyage au cas où matchAttente
        // contient un ancien ID
        delete matchAttente[chat];

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Le match associé à ce groupe n'existe plus.`
        });

        return;
    }

    //============================================
    // 🛑 ARRET DU MATCH
    //============================================
    const joueurs = match.joueurs || [];

    const nomsJoueurs = joueurs.length
        ? joueurs.map(j => j.pseudo).join(" 🆚 ")
        : "Aucun joueur enregistré";

    console.log(
        "🛑 MATCH ARRÊTÉ :",
        matchId,
        "| Groupe :",
        chat,
        "| Joueurs :",
        nomsJoueurs
    );

    //============================================
    // 🗑️ SUPPRESSION DU MATCH
    //============================================
    delete duelsEnCours[matchId];
    delete matchAttente[chat];

    //============================================
    // 📢 MESSAGE
    //============================================
    await ovl.sendMessage(chat, {
        text:
`🛑 *MATCH ALL STARS ARRÊTÉ*

${nomsJoueurs}

❌ Le match a été annulé avec succès.

╰───────────────────
                 🌀🔆`
    });
});
               
module.exports = {
    verifierJoueursMatch,
    verifierCardsMatch,
    analysePaveAvecGemini,
    envoyerResultatPaveGemini,
    lancerMatchAllStars,
    duelsEnCours,
    matchAttente,
    lancerTimerTour,
    _interne: { IA, PARSEUR, LOCAL, REGLES, DEFENSES, MOTEUR, NARRATEUR, PIPELINE }
};
