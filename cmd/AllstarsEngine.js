const axios = require("axios");

//==============================================================================
// ALL STARS — ARBITRE (fichier unique) · règles officielles du 6e anniversaire
//------------------------------------------------------------------------------
// Organisation (même découpage que le modèle, rassemblé dans ce fichier) :
//   🔁 IA          relais d'IA : Gemini → Mistral → SambaNova → OpenRouter     (ai_manager)
//   🧾 PARSEUR     prompt d'extraction, normalisation, validation de schéma     (prompts/pave)
//   🧰 LOCAL       repli sans IA par mots-clés (réutilise ACTIONS_MAP)          (heuristique)
//   ⚖️ REGLES      vérification stricte (aucune tolérance) + file d'attaques    (moteur : cycle d'un pavé)
//   🛡️ DEFENSES    réactions permises / coûts selon Combat Speed et vitesses    (esquive)
//   ⚙️ MOTEUR      résolution chiffrée (dégâts, Stamina, Force, états)          (moteur : résolution)
//   🎙️ NARRATEUR   récit déterministe + gabarit du message de verdict           (narrateur)
//   🧩 PIPELINE    analyse d'un pavé, gestion des tours (1 tour = 2 pavés), fin de match
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
// L'IA n'ARBITRE PAS, elle EXTRAIT : elle ne juge ni la validité ni le résultat et ne complète JAMAIS un détail absent
// (côté, trajectoire, distance, intention…) : elle met null. Les manques sont sanctionnés par le code (REGLES) → même verdict
// quelle que soit l'IA du relais.
// Vocabulaire = affiche « ACTIONS COMMANDES » (déplacements, attaques, défenses).
const PARSEUR = (() => {
    'use strict';

    /* --------------------------------------------------------------------------------------------------------- */
    /* Utilitaires                                                                                                */
    /* --------------------------------------------------------------------------------------------------------- */
    const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    /** Chaîne normalisée, ou null pour les « valeurs vides » que les IA écrivent (null, none, n/a…). */
    const txt = (v) => { const s = norm(v); return (s === '' || /^(null|none|n\/a|aucun|aucune|non precise|inconnu|undefined)$/.test(s)) ? null : s; };
    /** Texte tel qu'écrit (casse conservée), ou null. */
    const brut = (v) => { if (v == null) return null; const s = String(v).replace(/\s+/g, ' ').trim(); return txt(s) ? s : null; };
    const bool = (v) => v === true || /^(true|oui|yes|vrai|1)$/.test(norm(v));
    const nombre = (v) => {
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        const m = /(-?\d+(?:[.,]\d+)?)/.exec(String(v == null ? '' : v));
        return m ? Number(m[1].replace(',', '.')) : null;
    };
    const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);

    /* --------------------------------------------------------------------------------------------------------- */
    /* Référentiel officiel (affiche « Actions commandes »)                                                       */
    /* --------------------------------------------------------------------------------------------------------- */
    const DEPLACEMENTS = ['marche', 'course', 'dash', 'saut', 'roulade', 'vol', 'pivot', 'decalage', 'salto', 'vrille', 'flip'];
    const AERIENS = ['vol', 'saut', 'salto', 'vrille', 'flip'];                       // hauteur obligatoire
    const TRAJ_DEPL = ['frontale', 'circulaire', 'diagonale', 'zigzag', 'laterale', 'montante', 'descendante'];
    /** Frappes : membre utilisé + trajectoires possibles ([] = aucune à préciser, 1 = implicite, ≥2 = à préciser par le joueur). */
    const FRAPPES = {
        coup_direct: { membre: 'main', traj: ['frontale'] }, crochet: { membre: 'main', traj: ['laterale', 'oblique'] },
        uppercut: { membre: 'main', traj: ['ascendante'] }, overhand: { membre: 'main', traj: ['descendante'] },
        reverse: { membre: 'main', traj: ['arriere'] }, hammer: { membre: 'main', traj: ['descendante', 'oblique'] },
        coup_de_tete: { membre: 'tete', traj: [] }, coup_de_coude: { membre: 'coude', traj: [] },
        front_kick: { membre: 'pied', traj: ['frontale'] }, side_kick: { membre: 'pied', traj: ['laterale'] },
        axe_kick: { membre: 'pied', traj: ['descendante'] }, roundhouse_kick: { membre: 'pied', traj: ['circulaire', 'laterale', 'oblique'] },
        back_kick: { membre: 'pied', traj: ['arriere'] }, upward_kick: { membre: 'pied', traj: ['ascendante'] },
        low_kick: { membre: 'pied', traj: ['directe', 'oblique'] }, reverse_kick: { membre: 'pied', traj: ['inversee', 'laterale', 'oblique'] },
        spinning_back_kick: { membre: 'pied', traj: ['circulaire', 'laterale', 'oblique'] }, coup_de_genou: { membre: 'genou', traj: [] },
    };
    const TRAJ_ARME = ['directe', 'pique', 'horizontale', 'ascendante', 'descendante', 'oblique', 'revers'];
    const DEFENSES_TYPES = ['garde', 'blocage', 'saisie', 'deviation', 'parade', 'esquive'];
    const MEMBRES_LATERAUX = ['main', 'pied', 'genou', 'coude', 'bras', 'jambe'];
    const PRONOMS = /^(je|j'|moi|il|elle|lui|on|nous|tu)$/;

    /* --------------------------------------------------------------------------------------------------------- */
    /* Alias (variantes d'écriture des IA et synonymes autorisés par les règles)                                   */
    /* --------------------------------------------------------------------------------------------------------- */
    const type = (v) => { const s = norm(v);
        if (/depl|mouvement|move|course|run/.test(s)) return 'deplacement'; if (/attaq|attack|frapp|strike|offens/.test(s)) return 'attaque';
        if (/defen|reaction|guard|parade/.test(s)) return 'defense'; if (/compet|technique|sort|skill|spell|energ/.test(s)) return 'competence'; return 'autre'; };

    const genreDepl = (v) => { const s = txt(v); if (!s) return null; if (DEPLACEMENTS.includes(s)) return s;
        const t = [[/marche|march|walk|pas\b/, 'marche'], [/cour|sprint|run|fonc|file/, 'course'], [/dash|elan|ruee/, 'dash'], [/saut|bond|jump|hop/, 'saut'], [/roul/, 'roulade'],
            [/\bvol|voler|flotte|plane|fly|envol/, 'vol'], [/pivot|tourn/, 'pivot'], [/decal|esquive lateral|pas de cote/, 'decalage'], [/salto/, 'salto'], [/vrille|spin|tonneau/, 'vrille'], [/flip|backflip|culbute/, 'flip']];
        for (const [re, g] of t) if (re.test(s)) return g; return null; };
    const trajDepl = (v) => { const s = txt(v); if (!s) return null; if (TRAJ_DEPL.includes(s)) return s;
        if (/zig/.test(s)) return 'zigzag'; if (/circul|arc|arqu|courb|demi|cercle|rotati|spiral/.test(s)) return 'circulaire'; if (/diagonal|oblique/.test(s)) return 'diagonale';
        if (/later|cote|de cote/.test(s)) return 'laterale'; if (/mont|ascend|vers le haut/.test(s)) return 'montante'; if (/descend|plong|vers le bas/.test(s)) return 'descendante';
        if (/front|droit|ligne|rectil|avant|vers lui|direct/.test(s)) return 'frontale'; return null; };
    const sens = (v) => { const s = txt(v); if (!s) return null; if (/gauche|left/.test(s)) return 'gauche'; if (/droit|right/.test(s)) return 'droite';
        if (/arriere|recul|back/.test(s)) return 'arriere'; if (/avant|devant|front/.test(s)) return 'avant'; if (/haut|monte|up/.test(s)) return 'haut'; if (/bas|descend|down/.test(s)) return 'bas'; return null; };
    const vitesse = (v) => { const s = txt(v); if (!s) return null; if (/vmax|vitesse max|pleine vitesse|a fond|maximale|\bmax\b/.test(s)) return 'vmax'; if (/lent|reduit/.test(s)) return 'lente'; return nombre(s); };

    /** Ordre important : les pieds avant les mains (« reverse kick » ≠ « reverse »). */
    const genreFrappe = (v) => { const s = txt(v); if (!s) return null; const k = s.replace(/[\s-]+/g, '_'); if (FRAPPES[k] || k === 'arme') return k;
        const t = [[/spinning|retourne|tournant/, 'spinning_back_kick'], [/reverse.?kick|kick.?inverse|coup de pied.*invers/, 'reverse_kick'], [/roundhouse|coup de pied circulaire/, 'roundhouse_kick'],
            [/side.?kick|coup de pied lateral/, 'side_kick'], [/axe.?kick|coup de pied descend/, 'axe_kick'], [/back.?kick|coup de pied arriere/, 'back_kick'], [/upward|coup de pied ascend/, 'upward_kick'],
            [/low.?kick|coup de pied bas/, 'low_kick'], [/front.?kick|coup de pied/, 'front_kick'], [/genou|knee/, 'coup_de_genou'], [/coude|elbow/, 'coup_de_coude'], [/tete|headbutt|boule/, 'coup_de_tete'],
            [/uppercut/, 'uppercut'], [/overhand/, 'overhand'], [/hammer|marteau/, 'hammer'], [/crochet|hook/, 'crochet'], [/\breverse\b|poing invers/, 'reverse'],
            [/direct|jab|coup de poing|frontal/, 'coup_direct'], [/taill|tranch|decoup|slash|estoc|poignard|plant|transperc|lame|katana|epee|sabre|dague|arme/, 'arme']];
        for (const [re, g] of t) if (re.test(s)) return g; return null; };
    const trajCoup = (v, genre) => { const s = txt(v); const arme = genre === 'arme';
        if (s) { if (arme) { if (TRAJ_ARME.includes(s)) return s; if (/pique|estoc|plant|transperc/.test(s)) return 'pique'; if (/horizon|lateral/.test(s)) return 'horizontale'; if (/ascend|remont/.test(s)) return 'ascendante';
            if (/descend/.test(s)) return 'descendante'; if (/obliq|diagonal/.test(s)) return 'oblique'; if (/revers|inver/.test(s)) return 'revers'; if (/direct|front/.test(s)) return 'directe'; return null; }
            const l = ['frontale', 'laterale', 'oblique', 'ascendante', 'descendante', 'arriere', 'circulaire', 'directe', 'inversee']; if (l.includes(s)) return s;
            if (/front|droit/.test(s)) return 'frontale'; if (/later|horizon/.test(s)) return 'laterale'; if (/obliq|diagonal/.test(s)) return 'oblique'; if (/ascend|montant|remont/.test(s)) return 'ascendante';
            if (/descend/.test(s)) return 'descendante'; if (/arriere|back/.test(s)) return 'arriere'; if (/circul|rotat/.test(s)) return 'circulaire'; if (/direct/.test(s)) return 'directe'; if (/invers/.test(s)) return 'inversee'; return null; }
        const def = FRAPPES[genre]; return def && def.traj.length === 1 ? def.traj[0] : null; };       // une seule trajectoire possible = implicite

    const BASES = [[/deux mains|two hands|both hands|2 mains/, 'deux_mains'], [/\btete\b|\bfront\b|crane|head|coup de boule/, 'tete'],
        [/epee|lame|katana|dague|couteau|hache|sabre|arme|weapon|baton|rapiere/, 'arme'], [/poing|fist|\bmain\b|paume|hand|crochet|uppercut|\bjab\b|\bdirect\b/, 'main'],
        [/pied|jambe|kick|semelle|talon|botte/, 'pied'], [/genou|knee/, 'genou'], [/coude|elbow/, 'coude'], [/\bbras\b|\barm\b/, 'bras'], [/corps|body|epaule|buste|torse/, 'corps']];
    const cote = (s) => (/\b(gauche|left)\b/.test(s) ? 'gauche' : /\b(droit|droite|right)\b/.test(s) ? 'droite' : null);
    function membreEtCote(membre, coteBrut) {
        const s = (txt(membre) || '').replace(/_/g, ' ');
        let base = null; for (const [re, b] of BASES) if (re.test(s)) { base = b; break; }
        const c = cote(txt(coteBrut) || '') || cote(s);
        return { membre: base, cote: base && MEMBRES_LATERAUX.includes(base) ? c : (base === 'arme' ? c : null) };
    }

    const ZONES = [[/tempe/, 'tempe'], [/machoire|menton/, 'machoire'], [/visage|\bnez\b|oeil|yeux|joue/, 'visage'], [/\btete\b|crane|\bfront\b/, 'tete'], [/gorge/, 'gorge'], [/\bcou\b|nuque/, 'cou'], [/coeur/, 'coeur'],
        [/torse|thorax|poitrine|sternum/, 'torse'], [/\bcotes?\b|flanc/, 'cotes'], [/abdomen|ventre|estomac|plexus/, 'abdomen'], [/\bdos\b|omoplate|colonne/, 'dos'], [/hanche|bassin/, 'hanche'],
        [/cuisse/, 'cuisse'], [/genou/, 'genou'], [/tibia|mollet|cheville/, 'tibia'], [/talon/, 'talon'], [/jambe/, 'jambes'], [/epaule|bras|poignet|coude/, 'bras']];
    const FAMILLE_ZONE = { tempe: 'tete', machoire: 'tete', visage: 'tete', tete: 'tete', gorge: 'gorge', cou: 'gorge', coeur: 'coeur' };
    const zoneFamille = (z) => FAMILLE_ZONE[z] || z || null;
    const zone = (v) => { const s = txt(v); if (!s) return null; for (const [re, z] of ZONES) if (re.test(s)) return z; return null; };

    const niveau = (v) => { const s = txt(v); if (!s) return null; if (/basic|basique|bronze|🥉/.test(s)) return 'basic'; if (/special|speciale|advanced|avance|argent|silver|🥈/.test(s)) return 'special'; if (/ultim|gold|\bor\b|🥇/.test(s)) return 'ultime'; return null; };
    const modeDef = (v) => { const s = txt(v); if (!s) return null; if (DEFENSES_TYPES.includes(s)) return s;
        if (/esquiv|evit|dodge|decal/.test(s)) return 'esquive'; if (/garde|guard/.test(s)) return 'garde'; if (/parade|parry|pare\b/.test(s)) return 'parade'; if (/bloc|block|encaiss/.test(s)) return 'blocage';
        if (/devi|detourn|repouss/.test(s)) return 'deviation'; if (/saisi|attrap|grab/.test(s)) return 'saisie'; return null; };
    /** « [#2] », « #2 », « 2 », « attaque 2 » → 2 ; sinon null. */
    const vise = (v) => { if (v == null) return null; const m = /(\d+)/.exec(String(v)); return m ? Number(m[1]) : null; };

    /* --------------------------------------------------------------------------------------------------------- */
    /* Normalisation (sortie d'IA → structure stable, indépendante du modèle)                                      */
    /* --------------------------------------------------------------------------------------------------------- */
    function normaliserAction(a, i) {
        const t = type(a.type);
        const fr = obj(a.frappe), dep = obj(a.deplacement), df = obj(a.defense), en = obj(a.energie);
        let genreF = fr ? genreFrappe(fr.genre) : null;
        let { membre, cote: c } = membreEtCote(a.membre, a.cote);
        if (!membre && genreF && FRAPPES[genreF]) membre = FRAPPES[genreF].membre;
        if (membre === 'arme' && !genreF) genreF = 'arme';
        if (genreF === 'arme') membre = 'arme';
        const nn = nombre(a.n);
        const acteurBrut = brut(a.acteur);
        const frappe = (t === 'attaque' || genreF) ? { genre: genreF, trajectoire: trajCoup(fr && fr.trajectoire, genreF) } : null;
        const arc = dep && dep.arc && typeof dep.arc === 'object' ? { rayonM: nombre(dep.arc.rayonM), angleDeg: nombre(dep.arc.angleDeg) } : null;
        return {
            n: nn != null && nn >= 1 ? Math.round(nn) : i + 1,
            combo: bool(a.combo),                                                              // « (combo) » écrit après CETTE action (= 2e action du combo)
            sequence: null,                                                                    // calculée dans normaliser()
            texte: String(a.texte || a.description || '').replace(/\s+/g, ' ').trim().slice(0, 160),
            type: t,
            acteur: acteurBrut && !PRONOMS.test(norm(acteurBrut)) ? acteurBrut : null,        // « je » ne désigne pas un perso
            cible: brut(a.cible),
            intention: brut(a.intention),
            perception: bool(a.perception),
            membre, cote: c,
            membreComplet: !!membre && (!MEMBRES_LATERAUX.includes(membre) || !!c),            // recalculé par le code : on ne croit pas les drapeaux de l'IA
            frappe,
            zone: zone(a.zone),
            tranchant: bool(a.tranchant) || genreF === 'arme' && /taill|estoc|tranch|lame|katana|epee|sabre|dague/.test(norm(a.texte || '')),
            energie: en ? { niveau: niveau(en.niveau), projectile: bool(en.projectile) } : null,
            competence: brut(a.competence),
            deplacement: dep ? {
                genre: genreDepl(dep.genre), trajectoire: trajDepl(dep.trajectoire), vitesse: vitesse(dep.vitesse), sens: sens(dep.sens),
                distanceM: (() => { const d = nombre(dep.distanceM); return d != null && d >= 0 ? d : null; })(),
                hauteurM: (() => { const d = nombre(dep.hauteurM); return d != null && d >= 0 ? d : null; })(),
                courbeM: (() => { const d = nombre(dep.courbeM); return d != null && d >= 0 ? d : null; })(),
                vers: /cible|adversaire|lui/.test(txt(dep.vers) || '') ? 'cible' : null,
                arriveeCote: (() => { const s = txt(dep.arrivee_cote || dep.arriveeCote); return s && /gauche|droite|dos|face/.test(s) ? (s.match(/gauche|droite|dos|face/) || [])[0] : null; })(),
                arc: arc && (arc.rayonM != null || arc.angleDeg != null) ? arc : null,
            } : null,
            defense: df ? { mode: modeDef(df.mode), cote: sens(df.cote), vise: vise(df.vise), corps: df.corps == null ? null : bool(df.corps) } : null,
            riposte: bool(a.riposte),
        };
    }
    /** Sortie brute d'IA → { actions[], nombreActions, contradictions[], implicites[], resume }. Les séquences viennent des marqueurs « (combo) ». */
    function normaliser(raw) {
        const b = raw && typeof raw === 'object' ? raw : {};
        const actions = (Array.isArray(b.actions) ? b.actions : []).filter((a) => a && typeof a === 'object').map(normaliserAction);
        let seq = 0;
        actions.forEach((a, k) => { if (!(a.combo && k > 0)) seq += 1; a.sequence = seq; });
        const liste = (x) => (Array.isArray(x) ? x : []).map((s) => String(s).trim()).filter(Boolean);
        return { actions, nombreActions: actions.length, contradictions: liste(b.contradictions), implicites: liste(b.actionsImplicites || b.implicites), resume: String(b.resume || '').trim() };
    }
    /** Validation de SCHÉMA pour le relais (`valider`) : une sortie malformée = échec du modèle, pas faute du joueur. */
    function valider(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'objet JSON attendu';
        if (!Array.isArray(raw.actions)) return 'champ "actions" absent';
        if (raw.actions.length > 12) return 'plus de 12 actions : réponse suspecte';
        for (const a of raw.actions) if (!a || typeof a !== 'object' || !('type' in a)) return 'action sans "type"';
        return true;
    }

    /* --------------------------------------------------------------------------------------------------------- */
    /* Prompt                                                                                                     */
    /* --------------------------------------------------------------------------------------------------------- */
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
0. Principe du jeu : ACTION + MANIÈRE + INTENTION. Lis le SENS (synonymes, conjugaisons et formulations différentes acceptés). N'INVENTE ET NE DEVINE JAMAIS une précision absente : si le texte ne donne pas le côté, la trajectoire, la distance, la hauteur, la zone, l'intention, mets null. Ce n'est pas à toi de sanctionner les manques.
1. Une action = un verbe décrivant un acte distinct. Le dialogue n'est pas une action. "n" part de 1. Les actions durent 1 s ; deux actions en combo durent 0,5 s chacune. "combo" = true UNIQUEMENT pour l'action qui est suivie du marqueur écrit « (combo) » (c'est la 2e action du combo, rattachée à la précédente) ; sinon false.
2. "acteur" = le nom du perso qui réalise l'action, tel qu'écrit par le joueur (ex. « Naruto »). Un sujet nommé en début de phrase vaut pour toutes les actions de cette phrase. null si le joueur écrit « je / j' » ou si aucun perso n'est nommé.
3. "intention" = le but annoncé par le joueur (« pour … », « afin de … », « dans le but de … », « visant à … »), recopié en peu de mots ; null s'il n'y en a pas.
4. DÉPLACEMENT (type "deplacement") — deplacement.genre : marche | course | dash | saut | roulade | vol | pivot | decalage | salto | vrille | flip ; trajectoire : frontale | circulaire | diagonale | zigzag | laterale | montante | descendante ; vitesse : "vmax" (vmax, vitesse maximale, à fond…) UNIQUEMENT s'il est écrit juste après l'action de déplacement, sinon null (ou un nombre en m/s) ; sens : gauche | droite | avant | arriere | haut | bas (côté par lequel il passe ou part) ; distanceM : nombre de mètres explicitement écrit ; hauteurM : hauteur en mètres si écrite (déplacements aériens) ; courbeM : la courbe en mètres si écrite (déplacements circulaires) ; vers = "cible" si le déplacement s'arrête sur/vers l'adversaire ; arrivee_cote : gauche | droite | dos | face | null.
5. ATTAQUE physique (type "attaque") — frappe.genre : coup_direct | crochet | uppercut | overhand | reverse | hammer | coup_de_tete | coup_de_coude | front_kick | side_kick | axe_kick | roundhouse_kick | back_kick | upward_kick | low_kick | reverse_kick | spinning_back_kick | coup_de_genou | arme (katana, épée, lame…) ; membre : main | pied | genou | coude | tete | arme et cote : droite | gauche | null (le côté UNIQUEMENT s'il est écrit : « du droit », « du gauche », « de la main droite »…) ; frappe.trajectoire : celle écrite par le joueur (frontale, laterale, oblique, ascendante, descendante, arriere, circulaire, directe, inversee) ; pour une arme : directe | pique | horizontale | ascendante | descendante | oblique | revers ; zone : tete | tempe | visage | machoire | cou | gorge | coeur | torse | cotes | abdomen | dos | hanche | cuisse | genou | tibia | talon | jambes | bras | null ; tranchant = true si l'attaque coupe ou transperce (lame, katana, griffe, estoc).
6. TECHNIQUE / ÉNERGIE (type "competence") — competence = nom de la technique tel qu'écrit ; energie.niveau : basic | special | ultime | null (🥉 = basic, 🥈 = special, 🥇 = ultime) ; energie.projectile = true si lancée en projectile.
7. DÉFENSE (type "defense") — defense.mode : garde | blocage | saisie | deviation | parade | esquive ; defense.cote = côté de la déviation (gauche | droite) pour une déviation ; defense.vise = numéro [#n] de l'attaque adverse visée si le texte permet de l'identifier, sinon null ; defense.corps = true si tout le corps se déplace, false s'il reste sur place (si true, remplis aussi "deplacement") ; membre/cote = membre qui bloque ou dévie (deux_mains, main, bras…). "perception" = true si le joueur écrit que son perso VOIT, SENT ou RESSENT l'action avant d'y réagir (voit, voyant, en voyant, sent, sentant, ressent, perçoit…) ; sinon false. Une riposte qui SUIT une défense est une "attaque" avec riposte = true.
8. contradictions : incohérences internes ÉVIDENTES entre les actions (côté de l'arme ou de la main incompatible avec la position et le sens du geste ; membre brisé réutilisé ; action physiquement impossible). Liste vide si tout est cohérent.

FORMAT — réponds UNIQUEMENT avec ce JSON (pas de Markdown, aucun texte autour ; mets null/false/[] quand l'information est absente) :
{"actions":[{"n":1,"combo":false,"texte":"extrait court","type":"deplacement|attaque|defense|competence|autre","acteur":null,"cible":null,"intention":null,"perception":false,"membre":null,"cote":null,"frappe":{"genre":null,"trajectoire":null},"zone":null,"tranchant":false,"energie":{"niveau":null,"projectile":false},"competence":null,"deplacement":{"genre":null,"trajectoire":null,"vitesse":null,"sens":null,"distanceM":null,"hauteurM":null,"courbeM":null,"vers":null,"arrivee_cote":null},"defense":{"mode":null,"cote":null,"vise":null,"corps":null},"riposte":false}],"contradictions":[],"actionsImplicites":[],"resume":"une phrase"}`;
    }

    return { construirePrompt, normaliser, normaliserAction, valider, zoneFamille, DEPLACEMENTS, AERIENS, TRAJ_DEPL, FRAPPES, TRAJ_ARME, DEFENSES_TYPES, MEMBRES_LATERAUX };
})();

//================================================
// 🧰 REPLI LOCAL SANS IA — analyse par mots-clés (équivalent de heuristique.js)
//================================================
// Utilisé UNIQUEMENT si toutes les IA du relais échouent : le jeu continue au lieu de se bloquer.
// Volontairement approximatif : le pipeline n'annule jamais un pavé sur la seule foi de cette analyse.
// Réutilise le vocabulaire de ACTIONS_MAP (frappes mains/pieds). Sortie = même structure brute que l'extraction de l'IA.
const LOCAL = (() => {
    'use strict';

    const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nb = (s) => Number(String(s).replace(',', '.'));
    const premier = (v) => (Array.isArray(v) ? v[0] : v);

    // --- Vocabulaire de ACTIONS_MAP (aplati une seule fois) ----------------------------------------------------------
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

    // --- Verbes ------------------------------------------------------------------------------------------------------
    const RE = {
        defense: /\b(esquiv\w*|evit\w*|bloqu\w*|garde|parade|parer|pare|devi\w*|saisi\w*|attrap\w*|me decal\w*|m'ecart\w*|me derob\w*|encaiss\w*)/,
        competence: /\*[^*]{2,40}\*|\b(souffle|jutsu|technique|nuage de poison|boule d'energie|kamehameha|invoque|deploie|canalise)\b|🥉|🥈|🥇/,
        attaque: /\b(frapp\w*|coup\w*|crochet|uppercut|direct|jab|overhand|hammer|kick|trancher?|tranche|decoup\w*|degain\w*|plant\w*|poignard\w*|transperc\w*|assen\w*|envoi\w*|donne\w*|estoc\w*|balay\w*|fauch\w*|lance\w*)/,
        deplacement: /\b(fonc\w*|cour\w*|course|march\w*|dash\w*|avanc\w*|recul\w*|saut\w*|bondi\w*|roul\w*|pivot\w*|salto|vrille|flip|me deplac\w*|m'approch\w*|approch\w*|contourn\w*|zigzag\w*|sprint\w*|vol\w*|se place\w*|me place\w*|rejoin\w*)/,
    };
    const GENRES_DEPL = [[/\b(march\w*)\b/, 'marche'], [/\bdash\w*\b/, 'dash'], [/\b(saut\w*|bondi\w*)\b/, 'saut'], [/\broul\w*\b/, 'roulade'], [/\b(vole\w*|vol)\b/, 'vol'], [/\bpivot\w*\b/, 'pivot'],
        [/\bdecal\w*\b/, 'decalage'], [/\bsalto\b/, 'salto'], [/\bvrille\b/, 'vrille'], [/\bflip\b/, 'flip'], [/\b(cour\w*|course|fonc\w*|sprint\w*|file|avanc\w*|m'approch\w*|approch\w*|contourn\w*|rejoin\w*)\b/, 'course']];
    const ZONES = [[/\b(gorge|cou)\b/, 'gorge'], [/\bcoeur\b/, 'coeur'], [/\b(tete|visage|menton|tempe|machoire|nez|front|crane)\b/, 'tete'],
        [/\b(torse|thorax|poitrine)\b/, 'torse'], [/\b(ventre|abdomen|plexus|cotes|flanc)\b/, 'abdomen'], [/\b(dos|nuque|omoplate)\b/, 'dos'],
        [/\b(jambe|cuisse|mollet|cheville)\b/, 'jambes'], [/\b(bras|epaule|poignet)\b/, 'bras']];
    const ARMES = /\b(epee|lame|katana|dague|couteau|hache|sabre|arme)\b/;

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
    /**
     * Découpe en actions. « (combo) » écrit après une action la marque comme 2e action d'un combo.
     * Après « pour / afin de / visant », un morceau sans verbe d'action est l'INTENTION de l'action précédente.
     */
    function segmenter(texte) {
        const brut = String(texte).replace(/\(\s*\/\s*\)/g, ' ').replace(/\s+/g, ' ').replace(/\(\s*combo\s*\)/gi, ' §C ');
        const blocs = brut.split(/\s*(?:\/|\||;|\.(?=\s|$)|\bpuis\b|\bensuite\b)\s*/i);
        const out = [];
        for (const bloc of blocs) {
            const parts = bloc.split(/(\s+pour\s+|\s+afin de\s+|\s+visant\s+(?:a\s+)?|\s+avec\s+(?=une?\s)|,\s*(?=je\s|j')|\s+et\s+(?=je\s|j'))/i);
            let delim = '';
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 1) { delim = parts[i]; continue; }
                let m = parts[i];
                const combo = /§C/.test(m); m = m.replace(/§C/g, '').trim();
                if (!m || m.length <= 2) { if (combo && out.length) out[out.length - 1].combo = true; continue; }
                const n = norm(m); const aVerbe = Object.values(RE).some((re) => re.test(n));
                const but = /pour|afin de|visant/i.test(delim);
                if (!aVerbe && out.length) {
                    if (but) out[out.length - 1].intention = m.replace(/^à\s+/i, ''); else out[out.length - 1].texte += ' ' + m;
                    if (combo) out[out.length - 1].combo = true;
                } else out.push({ texte: m, combo, intention: null });
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
        const vm = /(\d+(?:[.,]\d+)?)\s*m\s*\/\s*s/.exec(n);
        const vitesse = /\b(vmax|vitesse max\w*|pleine vitesse|a fond)\b/.test(n) ? 'vmax' : (vm ? nb(vm[1]) : null);
        const genre = (GENRES_DEPL.find(([re]) => re.test(n)) || [])[1] || null;
        const trajectoire = /zig\s*-?\s*zag/.test(n) ? 'zigzag' : /\b(arc|arcque\w*|arque\w*|courb\w*|circulaire|demi-?cercle)\b/.test(n) ? 'circulaire' : /diagonal/.test(n) ? 'diagonale' : /\blater\w*/.test(n) ? 'laterale'
            : /\b(montant\w*|ascend\w*)\b/.test(n) ? 'montante' : /\b(descend\w*|plong\w*)\b/.test(n) ? 'descendante' : /ligne droite|frontal|droit devant|vers lui|vers l'adversaire|sur (?:mon )?adversaire|sur lui/.test(n) ? 'frontale' : null;
        let sensV = null;
        if (/\b(par la gauche|sur ma gauche|vers la gauche|a gauche|de ma gauche)\b/.test(n) && !/partant de ma gauche/.test(n)) sensV = 'gauche';
        else if (/\b(par la droite|sur ma droite|vers la droite|a droite)\b/.test(n)) sensV = 'droite';
        else if (/\b(recul\w*|vers l'arriere|m'eloign\w*)\b/.test(n)) sensV = 'arriere';
        else if (/\b(vers lui|vers l'adversaire|sur (?:mon )?adversaire|sur lui)\b/.test(n)) sensV = 'avant';
        else if (/partant de ma droite/.test(n)) sensV = 'droite';
        else if (/partant de ma gauche/.test(n)) sensV = 'gauche';
        const rayon = /rayon\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*m/.exec(n);
        const courbe = /courbe\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*m/.exec(n);
        const haut = /(\d+(?:[.,]\d+)?)\s*m(?:etres?)?\s+de\s+haut|hauteur\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*m/.exec(n);
        const angle = /(\d+)\s*(?:°|\^|degres?)/.exec(n);
        const sansBruit = n.replace(/rayon\s+(?:de\s+)?\d+(?:[.,]\d+)?\s*m/g, ' ').replace(/courbe\s+(?:de\s+)?\d+(?:[.,]\d+)?\s*m/g, ' ').replace(/\(\s*\d+(?:[.,]\d+)?\s*m\s+entre[^)]*\)/g, ' ')
            .replace(/(\d+(?:[.,]\d+)?)\s*m(?:etres?)?\s+de\s+haut/g, ' ');
        const dist = /(\d+(?:[.,]\d+)?)\s*(?:m|metres?)\b(?!\s*\/)/.exec(sansBruit);
        const cote = /profil gauche|cote gauche/.test(n) ? 'gauche' : /profil droit|cote droit/.test(n) ? 'droite' : /derriere (?:lui|elle)|dans le dos|\bderriere\b/.test(n) ? 'dos' : /\bface\b|devant lui/.test(n) ? 'face' : null;
        return {
            genre, trajectoire, vitesse, sens: sensV, distanceM: dist ? nb(dist[1]) : null, hauteurM: haut ? nb(haut[1] || haut[2]) : null,
            courbeM: courbe ? nb(courbe[1]) : (rayon ? nb(rayon[1]) : null),
            vers: /\b(vers|sur) (?:lui|elle|(?:mon |son )?adversaire)\b|\bderriere lui\b|profil (?:gauche|droit)/.test(n) ? 'cible' : null,
            arrivee_cote: cote, arc: rayon || angle ? { rayonM: rayon ? nb(rayon[1]) : null, angleDeg: angle ? Number(angle[1]) : null } : null,
        };
    }
    function extraireFrappe(n) {
        let genre = null, traj = null, membre = null, cote = null;
        const al = indexActions().find((x) => n.includes(x.alias));
        if (al) { genre = al.alias; membre = al.def.type; cote = al.def.main || al.def.pied || null; traj = premier(al.def.trajectoire) || null; }
        if (!genre) {
            const g = /\b(uppercut|overhand|hammer|crochet|jab|direct)\b/.exec(n) || /\b(coup de pied[a-z ]{0,12}|\w+ kick)\b/.exec(n) || /\bcoup de (genou|coude|tete)\b/.exec(n);
            genre = g ? g[0] : (ARMES.test(n) ? 'arme' : null);
        }
        if (!membre) membre = ARMES.test(n) ? 'arme' : /pied|kick/.test(n) ? 'pied' : /genou/.test(n) ? 'genou' : /coude/.test(n) ? 'coude' : /\btete\b/.test(n) && /coup de tete/.test(n) ? 'tete' : /poing|main|crochet|uppercut|jab|direct|overhand|hammer/.test(n) ? 'main' : null;
        if (membre && !['arme', 'tete'].includes(membre)) cote = cote || coteApres(n, membre === 'main' ? 'main|poing' : membre);
        else if (membre === 'arme') cote = /\b(main|bras)\s+droit/.test(n) ? 'droite' : /\b(main|bras)\s+gauche/.test(n) ? 'gauche' : null;
        const t = /horizontal/.test(n) ? 'horizontale' : /ascendant|remontant/.test(n) ? 'ascendante' : /descendant/.test(n) ? 'descendante' : /oblique|diagonal/.test(n) ? 'oblique' : /\bpique\b|estoc|plant\w*|poignard\w*|transperc\w*/.test(n) ? 'pique' : /revers/.test(n) ? 'revers' : null;
        return { membre, cote, frappe: { genre, trajectoire: t || traj } };
    }
    function extraireDefense(n) {
        const mode = /\b(saisi\w*|attrap\w*)\b/.test(n) ? 'saisie' : /\b(devi\w*|detourn\w*|repouss\w*)\b/.test(n) ? 'deviation' : /\bparade\b|\bparer?\b/.test(n) ? 'parade' : /\b(bloqu\w*|encaiss\w*)\b/.test(n) ? 'blocage' : /\bgarde\b/.test(n) ? 'garde' : 'esquive';
        const corps = /\b(recul\w*|saut\w*|bondi\w*|roul\w*|plong\w*|m'ecart\w*|me deplac\w*|pas (?:en arriere|lateral))\b/.test(n);
        const v = /#\s*(\d+)|attaque\s*(?:n°?\s*)?(\d+)/.exec(n);
        const c = /(?:par la|vers la|a)\s+(gauche|droite)/.exec(n);
        return { mode, vise: v ? Number(v[1] || v[2]) : null, corps, cote: c ? c[1] : null };
    }

    /** @param {string} texte pavé brut   @param {{cibleNoms?:string[], acteurNoms?:string[]}} ctx   @returns {object} extraction brute (schéma de l'IA) */
    function analyser(texte, ctx = {}) {
        const actions = []; let n = 0, acteurPrec = null, textePrec = '';
        const cibles = (ctx.cibleNoms || []).map((c) => [norm(c), c]);
        const acteurs = (ctx.acteurNoms || []).map((c) => [norm(c), c]);
        for (const seg of segmenter(texte)) {
            const s = norm(seg.texte);
            const type = typeDe(s);
            if (type === 'autre' && /^(je vois|je le vois|je remarque|je constate|je sens)\b/.test(s)) { textePrec = s; continue; }       // observation, pas une action
            const trouve = (acteurs.find(([k]) => k && s.includes(k)) || [])[1] || null;
            if (trouve) acteurPrec = trouve;
            const intentionTxt = seg.intention || ((/\b(?:dans le but de|histoire de)\s+([^,;.]{3,60})/.exec(seg.texte) || [])[1] || null);
            const a = { n: ++n, combo: !!seg.combo, texte: seg.texte.slice(0, 160), type, acteur: acteurPrec, intention: intentionTxt,
                cible: (cibles.find(([k]) => k && s.includes(k)) || [])[1] || null,
                perception: /\b(voit|vois|voir|voyant|sent|sens|sentant|ressent\w*|percoit|percevant|apercoit|remarque|entend\w*)\b/.test(s + ' ' + textePrec) };
            if (type === 'deplacement') a.deplacement = extraireDeplacement(s);
            else if (type === 'attaque') {
                Object.assign(a, extraireFrappe(s)); a.zone = premiereZone(s);
                a.tranchant = /\b(lame|katana|epee|dague|couteau|hache|sabre|tranch\w*|decoup\w*|poignard\w*|transperc\w*|griffe)\b/.test(s);
            } else if (type === 'competence') {
                const nom = /\*([^*]{2,40})\*/.exec(seg.texte);
                a.competence = nom ? nom[1].trim() : null;
                const t = seg.texte;
                a.energie = { niveau: /🥇|ultime/i.test(t) ? 'ultime' : /🥈|special/i.test(t) ? 'special' : /🥉|basic|basique/i.test(t) ? 'basic' : null, projectile: /projectile/.test(s) };
            } else if (type === 'defense') {
                a.defense = extraireDefense(s);
                if (a.defense.corps) a.deplacement = extraireDeplacement(s);
            }
            textePrec = s;
            actions.push(a);
        }
        return { actions, contradictions: [], actionsImplicites: [], resume: '' };
    }

    return { analyser, segmenter, extraireDeplacement, extraireFrappe };
})();

//================================================
// ⚖️ RÈGLES DU PAVÉ — vérification stricte + file des attaques en attente (équivalent de moteur.js : cycle d'un pavé)
//================================================
// Règle officielle : « si une seule action est mal réalisée dans le pavé, tout le reste est raté, donc tout le pavé est ❌ ».
// Aucune tolérance, aucune correction : la moindre erreur refuse le pavé en entier.
// Toutes les interprétations sont des drapeaux nommés dans REGLES.CFG.
const REGLES = (() => {
    'use strict';

    const CFG = {
        MAX_ACTIONS: 4,                                   // affiche « Nouvelle expérience dynamique » : 4 actions maximum par pavé
        MAX_COMBO: 2,                                     // … avec un combo de 2 actions maximum
        ACTEUR_OBLIGATOIRE: true,                         // « vous devez toujours préciser le perso qui réalise l'action » (pas de « je »)
        INTENTION_OBLIGATOIRE: { deplacement: true, defense: true, attaque: false },   // HYPOTHÈSE : l'affiche ne dit « optionnelle » que pour les attaques
        PERCEPTION_OBLIGATOIRE: true,                     // réagir sans « voit / sent / ressent » = divination → pavé ❌
        SPECIALES_INTERDITES_EN_COMBO: ['special', 'ultime'],   // « vous ne pouvez pas lancer une attaque spéciale en combo »
        DISTANCE_CIBLE_SUFFIT: true,                      // HYPOTHÈSE : « vers l'adversaire » donne la distance et la trajectoire frontale
        COURBE_MAX_M: 3,                                  // courbe d'un déplacement circulaire : 3 m max pour garder la vitesse max
        VITESSE_LENTE_MS: 1,                              // vitesse « considérée lente » si vmax n'est pas écrit juste après le déplacement (valeur de l'ancienne affiche)
    };

    const MSG = {
        TROP_ACTIONS: () => `Plus de ${CFG.MAX_ACTIONS} actions dans le pavé (${CFG.MAX_ACTIONS} maximum).`,
        TROP_COMBO: () => `Plus de ${CFG.MAX_COMBO} actions en combo (${CFG.MAX_COMBO} maximum).`,
        SPECIALE_EN_COMBO: (n) => `Action ${n} : une attaque spéciale ne peut pas être lancée en combo.`,
        ACTEUR_ABSENT: (n) => `Action ${n} : précise le perso qui réalise l'action (ex. « Naruto frappe… »), sans dire « je ».`,
        TYPE_DEPLACEMENT_ABSENT: (n) => `Action ${n} : type de déplacement non précisé (marche, course, dash, saut, roulade, vol, pivot, décalage, salto, vrille, flip).`,
        TRAJECTOIRE_ABSENTE: (n) => `Action ${n} : trajectoire du déplacement non précisée (frontale, circulaire, diagonale, zig zag, latérale, montante, descendante).`,
        DISTANCE_ABSENTE: (n) => `Action ${n} : distance du déplacement non précisée (combien de mètres ?).`,
        HAUTEUR_ABSENTE: (n) => `Action ${n} : la hauteur est obligatoire pour un déplacement aérien.`,
        COURBE_ABSENTE: (n) => `Action ${n} : la courbe est obligatoire pour un déplacement circulaire (${CFG.COURBE_MAX_M} m max pour garder la vitesse max).`,
        SENS_ABSENT: (n) => `Action ${n} : le sens est obligatoire pour un déplacement circulaire (par la gauche ou par la droite).`,
        INTENTION_ABSENTE: (n) => `Action ${n} : intention non précisée (dans quel but ?).`,
        FRAPPE_ABSENTE: (n) => `Action ${n} : type de frappe non précisé (direct, crochet, uppercut, kick…).`,
        COTE_ABSENT: (n) => `Action ${n} : la main ou le pied utilisé n'est pas précisé (droit ou gauche).`,
        TRAJECTOIRE_COUP_ABSENTE: (n, opts) => `Action ${n} : trajectoire du coup non précisée (${opts}).`,
        ZONE_ABSENTE: (n) => `Action ${n} : zone visée non précisée (tête, abdomen, torse, côtes, cou…).`,
        TYPE_DEFENSE_ABSENT: (n) => `Action ${n} : type de défense non précisé (garde, blocage, saisie, déviation, parade, esquive).`,
        DIVINATION: (n) => `Action ${n} : tu dois mentionner que ton perso voit, sent ou ressent l'action avant d'y réagir, sinon c'est de la divination.`,
        COTE_DEVIATION: (n) => `Action ${n} : précise le côté de la déviation (gauche ou droite).`,
        AUCUNE_ACTION: () => 'Aucune action détectée dans le pavé.',
    };

    /* ------------------------------------------------------------------------------------------------------- */
    /* 1. Vérification stricte (pure)                                                                           */
    /* ------------------------------------------------------------------------------------------------------- */
    /**
     * @param {object} p sortie de PARSEUR.normaliser
     * @returns {{issues:{code,n,message}[], notes:{code,n,valeur?}[]}}
     */
    function verifierPave(p) {
        const issues = [], notes = [];
        const add = (code, n, ...args) => issues.push({ code, n: n == null ? null : n, message: MSG[code](n, ...args) });
        const acts = (p && p.actions) || [];

        if (!acts.length) add('AUCUNE_ACTION', null);
        if (acts.length > CFG.MAX_ACTIONS) add('TROP_ACTIONS', null);
        const parSeq = {};
        for (const a of acts) parSeq[a.sequence] = (parSeq[a.sequence] || 0) + 1;
        if (Object.values(parSeq).some((k) => k > CFG.MAX_COMBO)) add('TROP_COMBO', null);

        for (const a of acts) {
            const dansCombo = (parSeq[a.sequence] || 0) > 1;
            if (CFG.ACTEUR_OBLIGATOIRE && a.type !== 'autre' && !a.acteur) add('ACTEUR_ABSENT', a.n);
            if (a.type === 'deplacement') verifierDeplacement(a, add, notes);
            else if (a.type === 'attaque') verifierAttaque(a, add);
            else if (a.type === 'defense') verifierDefense(a, add, notes);
            if (a.type === 'competence' && dansCombo && a.energie && CFG.SPECIALES_INTERDITES_EN_COMBO.includes(a.energie.niveau)) add('SPECIALE_EN_COMBO', a.n);
            if (a.type !== 'defense' && a.type !== 'deplacement' && a.type !== 'attaque' && a.type !== 'competence') continue;
            if (CFG.INTENTION_OBLIGATOIRE[a.type] && !a.intention) add('INTENTION_ABSENTE', a.n);
        }
        for (const c of (p && p.contradictions) || []) issues.push({ code: 'CONTRADICTION', n: null, message: c });
        return { issues, notes };
    }

    function verifierDeplacement(a, add, notes) {
        const d = a.deplacement || {};
        const versCible = CFG.DISTANCE_CIBLE_SUFFIT && d.vers === 'cible';
        if (!d.genre) add('TYPE_DEPLACEMENT_ABSENT', a.n);
        if (!d.trajectoire && !versCible) add('TRAJECTOIRE_ABSENTE', a.n);
        if (d.distanceM == null && !versCible) add('DISTANCE_ABSENTE', a.n);
        if (d.trajectoire === 'circulaire') {
            if (d.courbeM == null) add('COURBE_ABSENTE', a.n);
            if (!d.sens) add('SENS_ABSENT', a.n);
            else if (d.courbeM != null && d.courbeM > CFG.COURBE_MAX_M) notes.push({ code: 'COURBE_TROP_LARGE', n: a.n, valeur: d.courbeM });
        }
        if ((PARSEUR.AERIENS.includes(d.genre) || d.trajectoire === 'montante' || d.trajectoire === 'descendante') && d.hauteurM == null) add('HAUTEUR_ABSENTE', a.n);
        if (d.vitesse == null || d.vitesse === 'lente') notes.push({ code: 'VITESSE_LENTE', n: a.n, valeur: CFG.VITESSE_LENTE_MS });
    }

    function verifierAttaque(a, add) {
        const f = a.frappe || {};
        if (!f.genre) { add('FRAPPE_ABSENTE', a.n); return; }
        if (f.genre !== 'arme' && !a.membreComplet) add('COTE_ABSENT', a.n);
        if (f.genre === 'arme') { if (!f.trajectoire) add('TRAJECTOIRE_COUP_ABSENTE', a.n, 'directe/pique, horizontale, ascendante, descendante, oblique, revers'); }
        else {
            const def = PARSEUR.FRAPPES[f.genre];
            if (def && def.traj.length > 1 && !f.trajectoire) add('TRAJECTOIRE_COUP_ABSENTE', a.n, def.traj.join(', '));
        }
        if (!a.zone) add('ZONE_ABSENTE', a.n);
    }

    function verifierDefense(a, add, notes) {
        const df = a.defense || {};
        if (!df.mode) add('TYPE_DEFENSE_ABSENT', a.n);
        if (CFG.PERCEPTION_OBLIGATOIRE && !a.perception) add('DIVINATION', a.n);
        if (df.mode === 'deviation' && !df.cote) add('COTE_DEVIATION', a.n);
        if (df.mode === 'esquive') {                      // « les déplacements rapides et esquives : préciser (vmax) juste après l'action »
            const v = a.deplacement && a.deplacement.vitesse;
            if (v == null || v === 'lente') notes.push({ code: 'VITESSE_LENTE', n: a.n, valeur: CFG.VITESSE_LENTE_MS });
        }
    }

    /* ------------------------------------------------------------------------------------------------------- */
    /* 2. Décision (lecture seule)                                                                              */
    /* ------------------------------------------------------------------------------------------------------- */
    /** @returns {{etat:'valide'|'mc', annule:boolean, issues, notes, messages:string[]}} */
    function evaluerPave(parse) {
        const v = verifierPave(parse);
        const annule = v.issues.length > 0;
        return { etat: annule ? 'mc' : 'valide', annule, issues: v.issues, notes: v.notes, messages: v.issues.map((i) => i.message) };
    }

    /* ------------------------------------------------------------------------------------------------------- */
    /* 3. File des attaques en attente                                                                          */
    /* ------------------------------------------------------------------------------------------------------- */
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
    /** Format attendu par PARSEUR.construirePrompt({ attaquesEnAttente }). */
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
     * Intègre un pavé (déjà évalué) dans l'état du match :
     *  • pavé annulé → toutes les attaques en attente contre ce joueur touchent de plein fouet (aucune défense retenue) ;
     *  • sinon → défenses liées aux attaques ; ses propres attaques sont mises en attente contre l'adversaire.
     */
    function integrerPave(match, { joueurId, joueurNom, adversaireId, tour, paveId, parse, decision }) {
        const enAttente = attaquesEnAttente(match, joueurId);
        const defenses = decision.annule ? [] : parse.actions.filter((a) => a.type === 'defense');
        const { liens, orphelines } = lierDefenses(enAttente, defenses);
        for (const att of enAttente) att.statut = 'resolue';
        const empilees = decision.annule ? [] : empiler(match, { auteurId: joueurId, auteurNom: joueurNom, cibleId: adversaireId, paveId, tour, actions: parse.actions });
        return { liens, orphelines, empilees, pleinFouet: liens.filter((l) => !l.defenses.length).map((l) => l.attaque) };
    }

    return { CFG, MSG, verifierPave, evaluerPave, empiler, attaquesEnAttente, pourPrompt, lierDefenses, integrerPave };
})();

//================================================
// 🛡️ DÉFENSES — réactions permises et coûts (équivalent de esquive.js)
//================================================
// Source : affiches « Close Combat Technique » (Combat Speed S), « Close Combat Hyper Technique » (coûts, speedblitz),
// « Attaque à pleine puissance » (coût d'esquive selon la vitesse de l'attaque, projectiles).
// Toutes les interprétations sont des drapeaux nommés dans DEFENSES.CFG.
const DEFENSES = (() => {
    'use strict';

    const CFG = {
        GRADE_RANG: { bronze: 0, silver: 1, argent: 1, gold: 2, or: 2 },       // Bronze < Silver < Gold
        VITESSE_GRADE_MS: [10, 15, 20],                                        // Travel Speed : Bronze 10 m/s, Silver 15, Gold 20
        VITESSE_ATTAQUE_MS: { basic: 10, special: 15, ultime: 20, projectile: 10 },
        EQUIVALENT: { garde: 'blocage', parade: 'blocage' },                   // HYPOTHÈSE : garde et parade se traitent comme un blocage
        MODES_INFERIEUR: ['esquive', 'blocage'],                               // S inférieur : retard de 1 s, bloquer ou esquiver seulement
        MODES_ETAT_NORMAL: ['esquive', 'blocage', 'deviation', 'saisie'],      // S égal ou supérieur : dévier et saisir permis
        COUT: { esquive: 10, esquiveEgale: 20, esquiveBoost: 30, esquiveSup2: 5, esquiveProjectile: 5, saisie: 5, saisieSup2: 0, changement_trajectoire: 5, esquiveSonne: 30 },
        // HYPOTHÈSE : l'affiche dit « S+2 : esquive à 5 % au lieu de 10 % » ; on applique 5 % même si la vitesse de l'attaque donnerait 20 ou 30 %.
        S_PLUS2_ECRASE_COUT_VITESSE: true,
    };

    const rangGrade = (g) => { const k = String(g || '').toLowerCase().trim(); return CFG.GRADE_RANG[k] != null ? CFG.GRADE_RANG[k] : 0; };
    const modeCanon = (m) => CFG.EQUIVALENT[m] || m;
    const tierVitesse = (ms) => { const i = CFG.VITESSE_GRADE_MS.indexOf(ms); if (i >= 0) return i; return CFG.VITESSE_GRADE_MS.reduce((best, v, k) => (Math.abs(v - ms) < Math.abs(CFG.VITESSE_GRADE_MS[best] - ms) ? k : best), 0); };

    /**
     * Écart de Combat Speed (défenseur − attaquant).
     * Le GRADE l'emporte : « même si le Bronze est S+ et l'Argent S-, le Silver aura l'avantage +1 ».
     * À grade égal : écart de rang S. Un perso SS « n'est jamais inférieur » à un S ; si le S est supérieur ils sont égaux.
     */
    function ecart(def, att) {
        const gd = (def.gradeRang || 0) - (att.gradeRang || 0);
        if (gd !== 0) return gd;
        const brut = (def.rang || 0) - (att.rang || 0);
        if (def.ss && !att.ss) return Math.max(0, brut);
        if (att.ss && !def.ss) return Math.min(0, brut);
        return brut;
    }

    const estProjectile = (a) => !!a && ((a.energie && a.energie.projectile) || (a.frappe && a.frappe.genre === 'projectile'));
    /** Vitesse (m/s) d'une attaque d'énergie / projectile ; null pour un coup au corps à corps. */
    function vitesseAttaque(a) {
        if (!a) return null;
        const e = a.energie || {};
        if (estProjectile(a)) return CFG.VITESSE_ATTAQUE_MS.projectile;
        if (e.niveau) return CFG.VITESSE_ATTAQUE_MS[e.niveau];
        return null;
    }

    /** Réactions permises (noms canoniques). `speedblitz` : retard de 1 s même à S égal → seulement esquiver ou bloquer. */
    function modesPermis(gap, action, sonne) {
        if (sonne) return ['esquive'];                                          // sonné : seule une esquive boostée est possible
        if (gap < 0 || (action && (action.speedblitz || action.instantanee))) return CFG.MODES_INFERIEUR;
        const modes = CFG.MODES_ETAT_NORMAL.slice();
        if (estProjectile(action) && gap < 1) return modes.filter((m) => m !== 'saisie');   // saisir un projectile : seulement plus fort que le lanceur en S
        return modes;
    }

    /** Coût de Stamina (en %) d'une réaction, ou null si elle est impossible (attaque trop rapide). */
    function coutStamina({ mode, gap, action, def, sonne }) {
        const m = modeCanon(mode);
        if (m === 'esquive') {
            if (sonne) return CFG.COUT.esquiveSonne;
            if (estProjectile(action)) return gap >= 1 ? 0 : CFG.COUT.esquiveProjectile;      // plus fort que le lanceur : gratuit
            let cout = CFG.COUT.esquive;
            const va = vitesseAttaque(action);
            if (va != null) {
                const diff = tierVitesse(va) - tierVitesse(def.vitesseMax != null ? def.vitesseMax : CFG.VITESSE_GRADE_MS[0]);
                if (diff >= 2) return null;                                                     // +2 : esquive impossible (speedblitz)
                cout = diff <= -1 ? CFG.COUT.esquive : diff === 0 ? CFG.COUT.esquiveEgale : CFG.COUT.esquiveBoost;
            }
            return gap >= 2 && CFG.S_PLUS2_ECRASE_COUT_VITESSE ? CFG.COUT.esquiveSup2 : cout;
        }
        if (m === 'saisie') return gap >= 2 ? CFG.COUT.saisieSup2 : CFG.COUT.saisie;
        return CFG.COUT[m] || 0;
    }

    return { CFG, rangGrade, modeCanon, tierVitesse, ecart, estProjectile, vitesseAttaque, modesPermis, coutStamina };
})();

//================================================
// ⚙️ MOTEUR DE RÉSOLUTION — chiffres, jets et règles (équivalent de moteur.js)
//================================================
// Déterministe : l'IA ne fait que COMPRENDRE le pavé ; les pourcentages, coûts et issues sont calculés ici.
// Entrée : les « liens » attaque ↔ défenses (REGLES.integrerPave). Sortie : l'état du défenseur après le pavé + le détail par attaque.
const MOTEUR = (() => {
    'use strict';

    const CFG = {
        DEGATS_COUP_PCT: 10,                                    // un coup encaissé = 10 % PV
        DEGATS_MEMBRE_BRISE_PCT: 15,                            // membre brisé (ou coupé) = 15 % PV
        DEGATS_NIVEAU_PCT: { basic: 30, special: 60, ultime: 100 },   // attaques d'énergie : 30 / 60 / 100 % PV
        DEGATS_PROJECTILE_PCT: 20,                              // ancienne affiche, non remplacée : projectile = 20 % PV
        FORCE_DEMI_DEGATS: 2,                                   // écart de Force +2 en faveur du défenseur : dégâts des coups divisés par 2
        // HYPOTHÈSE : règle de l'ancienne affiche, non remplacée par les nouvelles → « tranchant en zone critique = mort ».
        TRANCHANT_CRITIQUE_MORTEL: true,
        ZONES_CRITIQUES: ['tete', 'gorge', 'coeur'],            // familles de zones (tempe/visage/mâchoire → tête ; cou → gorge)
        REACTION_IMPOSSIBLE: 'ratee',                           // HYPOTHÈSE : réaction interdite par l'écart de S → l'attaque touche
        STAMINA_INSUFFISANTE: 'ratee',                          // HYPOTHÈSE : pas assez de Stamina → la défense échoue sans rien coûter
        // Affiche « Nouvelle expérience dynamique » : mauvaise réaction sur la première action → le reste des actions adverses passe automatiquement.
        PREMIERE_DEFENSE_RATEE_ENTRAINE_LE_RESTE: true,
        SONNE_FORCE_MIN: true,                                  // « seul un adversaire supérieur en force ou égal peut sonner »
        BRISE_GARDE_TOURS: 2,                                   // écart de Force +3 : blocage impossible pendant 2 tours
        REPOUSSE_M: 10,
    };

    const zoneCritique = (z) => CFG.ZONES_CRITIQUES.includes(PARSEUR.zoneFamille(z));

    /** Nature d'une attaque : dégâts (en % PV), mort immédiate, ou technique non chiffrée. */
    function nature(a, ctx) {
        const nom = a.competence || a.texte || a.type;
        const e = a.energie || {};
        if (a.type === 'competence') {
            let niv = e.niveau;
            const info = ctx && ctx.infosTechnique ? ctx.infosTechnique(a) : null;           // la carte du perso peut fournir le niveau
            if (info && info.niveau) niv = info.niveau;
            return { nom, technique: true, niveau: niv, pct: niv ? CFG.DEGATS_NIVEAU_PCT[niv] : null, physique: false };
        }
        if (a.tranchant && CFG.TRANCHANT_CRITIQUE_MORTEL && zoneCritique(a.zone)) return { nom, mort: true, zone: a.zone };
        if (a.frappe && a.frappe.genre === 'projectile') return { nom, pct: CFG.DEGATS_PROJECTILE_PCT, physique: false };
        return { nom, pct: CFG.DEGATS_COUP_PCT, physique: true };
    }

    const arrondi = (x) => Math.round(x * 10) / 10;

    function resoudreLien(lien, ctx) {
        const { def, att, etat, effetsCarte } = ctx;
        const a = lien.attaque.action;
        let nat = nature(a, ctx);
        const carte = effetsCarte ? effetsCarte(a, { def, att, etat }) : null;
        if (carte) nat = { ...nat, ...carte };                       // la carte peut fournir pct / mort / lignes
        const res = { n: lien.attaque.n, nom: nat.nom, statut: null, mode: null, cout: 0, degats: 0, mort: false, raison: '', effets: [], touche: false, auto: false };
        if (a.instantanee) res.effets.push("⚡ attaque lancée instantanément (pénalité de l'adversaire)");
        const gap = DEFENSES.ecart(def, att);
        const d = lien.defenses[0] || null;
        let touche = false;

        if (!d) { res.statut = 'plein_fouet'; touche = true; }
        else {
            const modeAff = (d.defense && d.defense.mode) || 'esquive';
            const mode = DEFENSES.modeCanon(modeAff);
            res.mode = modeAff;
            const permis = DEFENSES.modesPermis(gap, a, etat.sonne);
            if (!permis.includes(mode)) {
                res.statut = 'ratee'; touche = CFG.REACTION_IMPOSSIBLE === 'ratee';
                res.raison = etat.sonne ? 'sonné : seule une esquive boostée est possible' : a.speedblitz ? 'speedblitz : retard de réaction, seulement esquiver ou bloquer' : a.instantanee ? 'attaque lancée instantanément : seulement esquiver ou bloquer' : 'réaction impossible avec cet écart de Combat Speed';
            } else if (mode === 'blocage' && etat.blocageInterdit > 0) {
                res.statut = 'ratee'; touche = true; res.raison = 'garde brisée : blocage impossible pour le moment';
            } else if (mode !== 'saisie' && etat.equilibre === 'perdu' && (mode === 'esquive' || mode === 'blocage')) {
                res.statut = 'ratee'; touche = true; res.raison = 'déséquilibré par la défense précédente';
            } else if (mode === 'blocage' && etat.posture === 'cassee') {
                res.statut = 'ratee'; touche = true; res.raison = 'posture cassée par la défense précédente';
            } else {
                const cout = DEFENSES.coutStamina({ mode, gap, action: a, def, sonne: etat.sonne });
                if (cout == null) { res.statut = 'ratee'; touche = true; res.raison = 'esquive impossible : attaque trop rapide (speedblitz)'; }
                else if (etat.stamina < cout && CFG.STAMINA_INSUFFISANTE === 'ratee') { res.statut = 'ratee'; touche = true; res.raison = 'Stamina insuffisante'; }
                else {
                    etat.stamina = Math.max(0, etat.stamina - cout); res.cout = cout;
                    if (mode === 'blocage') {
                        const fg = (att.force || 0) - (def.force || 0);                  // supériorité de Force de l'attaquant
                        const deuxMains = d.membre === 'deux_mains';
                        if (fg <= 0 || (fg === 1 && deuxMains) || (fg === 2 && deuxMains)) res.statut = 'reussie';
                        else if (fg === 1) { res.statut = 'partielle'; etat.equilibre = 'perdu'; res.raison = 'blocage à une main : déséquilibre, repoussé'; }
                        else if (!deuxMains) { res.statut = 'partielle'; touche = true; nat = { nom: nat.nom, pct: CFG.DEGATS_MEMBRE_BRISE_PCT, physique: false }; res.raison = 'main brisée'; }
                        else if (fg === 3) { res.statut = 'partielle'; etat.posture = 'cassee'; etat.brisegarde = true; res.raison = `garde brisée : blocage impossible ${CFG.BRISE_GARDE_TOURS} tours`; }
                        else { res.statut = 'partielle'; etat.posture = 'cassee'; res.raison = `repoussé de ${CFG.REPOUSSE_M} m malgré les deux mains`; }
                    } else res.statut = 'reussie';                                         // esquive, déviation, saisie
                }
            }
            if (lien.defenses.length > 1) res.effets.push(`ℹ️ ${lien.defenses.length - 1} défense(s) supplémentaire(s) ignorée(s) pour cette attaque`);
        }

        if (touche) {
            res.touche = true;
            if (nat.mort) { res.degats = etat.pv; etat.pv = 0; res.mort = true; res.raison = res.raison || `coup tranchant en zone critique (${nat.zone})`; }
            else if (nat.pct != null) {
                const mult = nat.physique && ((def.force || 0) - (att.force || 0)) >= CFG.FORCE_DEMI_DEGATS ? 0.5 : 1;
                const avant = etat.pv; etat.pv = Math.max(0, etat.pv - nat.pct * mult); res.degats = arrondi(avant - etat.pv);
            } else res.effets.push(`ℹ️ ${nat.nom} : niveau ou effet de carte à appliquer par l'arbitre`);
            if (nat.lignes) res.effets.push(...nat.lignes);
        }
        return res;
    }

    /**
     * @param {{liens:{attaque,defenses}[], defenseur:object, attaquant:object, effetsCarte?:Function, infosTechnique?:Function}} p
     * defenseur / attaquant : { pv, stamina, energie, rang, gradeRang, ss, force, vitesseMax, sonne?, blocageTours? } (voir PIPELINE.statsDe)
     * @returns {{etat, details:object[], ko:boolean}}
     */
    function resoudrePave({ liens, defenseur, attaquant, effetsCarte, infosTechnique }) {
        const etat = {
            pv: defenseur.pv != null ? defenseur.pv : 100, stamina: defenseur.stamina != null ? defenseur.stamina : 100,
            energie: defenseur.energie != null ? defenseur.energie : 100, posture: 'neutre', equilibre: 'stable',
            sonne: !!defenseur.sonne, blocageInterdit: defenseur.blocageTours || 0, brisegarde: false, nouveauSonne: false,
        };
        const details = []; let passeAuto = false, premier = true, prec = null;
        for (const lien of liens) {
            if (etat.pv <= 0) break;
            const auto = passeAuto && CFG.PREMIERE_DEFENSE_RATEE_ENTRAINE_LE_RESTE && lien.defenses.length > 0;
            const r = resoudreLien(auto ? { attaque: lien.attaque, defenses: [] } : lien, { def: defenseur, att: attaquant, etat, effetsCarte, infosTechnique });
            if (auto) { r.auto = true; r.raison = 'la première réaction a échoué : la suite passe automatiquement'; }
            if (premier) { premier = false; if (r.statut === 'ratee' || r.statut === 'plein_fouet') passeAuto = true; }
            // Combo de 2 coups au visage → sonné 1 tour (seul un adversaire de Force supérieure ou égale peut sonner)
            const a = lien.attaque.action;
            const visage = PARSEUR.zoneFamille(a.zone) === 'tete';
            if (prec && prec.visage && prec.touche && visage && r.touche && prec.paveId === lien.attaque.paveId && prec.sequence === a.sequence
                && (!CFG.SONNE_FORCE_MIN || (attaquant.force || 0) >= (defenseur.force || 0)) && !etat.nouveauSonne) {
                etat.nouveauSonne = true; r.effets.push('😵 combo de deux coups au visage : sonné pour 1 tour');
            }
            prec = { visage, touche: r.touche, paveId: lien.attaque.paveId, sequence: a.sequence };
            details.push(r);
        }
        return { etat, details, ko: etat.pv <= 0 };
    }

    return { CFG, nature, resoudreLien, resoudrePave };
})();

//================================================
// 🎙️ NARRATEUR — récit du verdict et gabarit du message, déterministes (équivalent de narrateur.js, sans appel IA)
//================================================
// Même formulation quelle que soit l'IA du relais. Ressources : ❤️ PV · 🫀 Stamina · 🌀 Énergie.
const NARRATEUR = (() => {
    'use strict';

    const EM = { pv: '❤️', sta: '🫀', en: '🌀' };
    const arrondi = (x) => Math.round(x * 10) / 10;
    /** « -10%🫀 » */
    const pct = (x, em, signe = '-') => `${signe}${arrondi(x)}%${em}`;

    const VERBES_DEPL = { marche: 'marche', course: 'court', dash: 'fait un dash', saut: 'saute', roulade: 'fait une roulade', vol: 'vole', pivot: 'pivote', decalage: 'se décale', salto: 'fait un salto', vrille: 'fait une vrille', flip: 'fait un flip' };
    const TRAJ_TXT = { frontale: 'en frontale', circulaire: 'en circulaire', diagonale: 'en diagonale', zigzag: 'en zig zag', laterale: 'en latérale', montante: 'en montante', descendante: 'en descendante' };
    const FRAPPES_TXT = { coup_direct: 'un direct', crochet: 'un crochet', uppercut: 'un uppercut', overhand: 'un overhand', reverse: 'un reverse', hammer: 'un hammer', coup_de_tete: 'un coup de tête',
        coup_de_coude: 'un coup de coude', front_kick: 'un front kick', side_kick: 'un side kick', axe_kick: 'un axe kick', roundhouse_kick: 'un roundhouse kick', back_kick: 'un back kick',
        upward_kick: 'un upward kick', low_kick: 'un low kick', reverse_kick: 'un reverse kick', spinning_back_kick: 'un spinning back kick', coup_de_genou: 'un coup de genou', arme: "un coup d'arme" };
    const ZONES_TXT = { tete: 'la tête', tempe: 'la tempe', machoire: 'la mâchoire', visage: 'le visage', gorge: 'la gorge', cou: 'le cou', coeur: 'le cœur', torse: 'le torse', cotes: 'les côtes',
        abdomen: "l'abdomen", dos: 'le dos', hanche: 'la hanche', cuisse: 'la cuisse', genou: 'le genou', tibia: 'le tibia', talon: 'le talon', jambes: 'les jambes', bras: 'les bras' };
    const DEF_TXT = { esquive: 'esquive', garde: 'se met en garde', blocage: 'bloque', saisie: 'saisit', deviation: 'dévie', parade: 'pare' };
    const sansPour = (s) => String(s || '').replace(/^\s*(pour|afin de|dans le but de|histoire de|visant à)\s+/i, '').trim();

    function decrireAction(a) {
        const d = a.deplacement || {}, f = a.frappe || {};
        let phrase;
        switch (a.type) {
            case 'deplacement': {
                const bits = [VERBES_DEPL[d.genre] || 'se déplace', TRAJ_TXT[d.trajectoire] || '', d.sens === 'gauche' || d.sens === 'droite' ? `par la ${d.sens}` : '',
                    d.courbeM != null ? `courbe de ${d.courbeM} m` : '', d.distanceM != null ? `sur ${d.distanceM} m` : '', d.hauteurM != null ? `à ${d.hauteurM} m de haut` : '',
                    d.vitesse === 'vmax' ? 'à vmax' : typeof d.vitesse === 'number' ? `à ${d.vitesse} m/s` : '', d.vers === 'cible' ? "vers l'adversaire" : ''].filter(Boolean);
                phrase = bits.join(' '); break;
            }
            case 'attaque': {
                const def = PARSEUR.FRAPPES[f.genre];
                const cote = a.cote === 'droite' ? 'droit' : a.cote === 'gauche' ? 'gauche' : '';
                const mem = !def ? '' : def.membre === 'main' ? (cote ? ` du ${cote}` : '') : def.membre === 'pied' ? (a.cote ? ` du pied ${a.cote}` : '') : (def.membre === 'genou' || def.membre === 'coude') && a.cote ? ` (${a.cote})` : '';
                phrase = `porte ${FRAPPES_TXT[f.genre] || 'une frappe'}${a.tranchant ? ' tranchante' : ''}${mem}${f.trajectoire && (f.genre === 'arme' || (def && def.traj.length > 1)) ? ` ${f.trajectoire}` : ''}${a.zone ? ` vers ${ZONES_TXT[a.zone] || a.zone}` : ''}`;
                break;
            }
            case 'competence': phrase = `utilise ${a.competence || 'une technique'}${a.energie && a.energie.niveau ? ` (${a.energie.niveau})` : ''}`; break;
            case 'defense': {
                const df = a.defense || {};
                phrase = `${DEF_TXT[df.mode] || 'réagit'}${df.mode === 'deviation' && df.cote ? ` par la ${df.cote}` : ''}${df.vise ? ` l'attaque [#${df.vise}]` : ''}`;
                break;
            }
            default: phrase = a.texte || 'agit';
        }
        return a.intention ? `${phrase} pour ${sansPour(a.intention)}` : phrase;
    }

    const ICONES = { reussie: '🛡️', partielle: '⚠️', ratee: '❌', plein_fouet: '💥' };
    const LIBELLES = { reussie: 'défense réussie', partielle: 'défense partielle', ratee: 'défense ratée', plein_fouet: 'non défendu' };

    /** « 🛡️ [#1] Nuage : défense réussie (-10%🫀) » */
    function decrireResultat(r) {
        const bits = [];
        if (r.raison) bits.push(r.raison);
        if (r.cout) bits.push(pct(r.cout, EM.sta));
        if (r.mort) bits.push('coup mortel');
        else if (r.degats) bits.push(pct(r.degats, EM.pv));
        const lib = r.auto && r.statut === 'plein_fouet' ? 'passe automatiquement' : (LIBELLES[r.statut] || r.statut);
        return `${r.auto ? '💥' : ICONES[r.statut] || '•'} [#${r.n}] ${r.nom} : ${lib}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`;
    }

    /** @returns {{resume:string, lignes:string[]}} resume = ce que le pavé fait ; lignes = résultat de chaque attaque reçue */
    function composer({ nomDefaut, parse, details }) {
        const groupes = [];
        for (const a of parse.actions) {
            const nom = a.acteur || nomDefaut;
            const g = groupes[groupes.length - 1], phrase = decrireAction(a);
            if (g && g.nom === nom) g.phrases.push(phrase); else groupes.push({ nom, phrases: [phrase] });
        }
        const resume = groupes.length ? `${groupes.map((g) => `${g.nom} ${g.phrases.join(', puis ')}`).join(' ; ')}.` : `${nomDefaut} ne fait aucune action.`;
        return { resume, lignes: (details || []).flatMap((r) => [decrireResultat(r), ...(r.effets || []).map((e) => `   ${e}`)]) };
    }

    /* --------------------------------------------------------------------------------------------------------- */
    /* Gabarits de message                                                                                        */
    /* --------------------------------------------------------------------------------------------------------- */
    const SEP1 = '▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔', SEP2 = '▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔';
    const PIED = ['╰───────────────────', '               *JUMP™️ ARENA🌀🔆*'];
    const bloc = (t) => { const s = Array.isArray(t) ? t.filter(Boolean).join('\n') : String(t || '').trim(); return s ? `- ${s.replace(/\n+/g, '\n  ')}` : null; };

    /** Verdict d'un pavé (valide ou refusé). section1 = résumé + verdict ; section2 = dégâts, coûts, pénalités et autres. */
    function gabaritVerdict({ valide, section1, section2, note, tour, maxTours, prochainPseudo }) {
        const l = ['◥◣   *🎮COMBAT ♨️🌀* ░▒░', SEP1, `⚔️ *TOUR :* ${tour}/${maxTours}`, valide ? '✅ *ACTIONS VALIDÉES*' : '❌ *PAVÉ REFUSÉ*', ''];
        const b1 = bloc(section1), b2 = bloc(section2);
        if (b1) l.push(b1, '');
        if (b2) l.push(b2, '');
        l.push('📊 *Note du pavé :*', `${note}/10 ⭐`, '', SEP2, '🔆 *JOUEUR SUIVANT :*', '', `➡️ @${prochainPseudo} *GO!!* 🔥`, '', ...PIED);
        return l.join('\n');
    }
    /** Fin de match (KO, décision ou égalité) : même cadre, sans « joueur suivant ». */
    function gabaritFin({ valide, section1, section2, tour, maxTours, messageFin }) {
        const l = ['◥◣   *🎮COMBAT ♨️🌀* ░▒░', SEP1, `⚔️ *TOUR :* ${tour}/${maxTours}`, valide ? '✅ *ACTIONS VALIDÉES*' : '❌ *PAVÉ REFUSÉ*', ''];
        const b1 = bloc(section1), b2 = bloc(section2);
        if (b1) l.push(b1, '');
        if (b2) l.push(b2, '');
        l.push(SEP2, messageFin, '', ...PIED);
        return l.join('\n');
    }

    return { EM, pct, decrireAction, decrireResultat, composer, gabaritVerdict, gabaritFin };
})();

//================================================
// 🧩 PIPELINE — analyse complète d'un pavé (cœur de l'arbitre)
//================================================
// relais d'IA (IA) → extraction (PARSEUR) → règles strictes + file d'attaques (REGLES) → résolution (MOTEUR) → récit (NARRATEUR)
// Le retour garde les champs lus par l'affichage : ok, paveDetecte, paveValide, verdict, erreurs[], resume, note, joueurSuivant{nom,jid}…
// Champs AJOUTÉS : section1, section2 (corps du verdict), tour, maxTours, majTracker[], fin, modele, source, etat, horsTour, enAttente.
// Modifie `match` : fileAttaques, paveDuTour, tourArbitre, etats, bilan, pavesTraites (données simples, pas de timers).
const PIPELINE = (() => {
    'use strict';

    const CFG = {
        VERIFIER_TOUR: true,                                   // ignore un pavé hors tour (= « pas de correction »)
        REPLI_LOCAL: true,                                     // si toutes les IA échouent : LOCAL.analyser (jamais d'annulation sur cette seule analyse)
        SOURCE_TOUR: 'arbitre',                                // 'arbitre' : compteur géré ici (1 tour = 2 pavés) | 'match' : lit match.tour (géré ailleurs)
        MAX_TOURS: 10,
        COUT_ENERGIE_PCT: { basic: 20, special: 30, ultime: 50, projectile: 5, projectileExcedentaire: 10 },   // affiche « Attaque à pleine puissance »
        NOTE: { max: 10, parDefenseRatee: 3, parDefensePartielle: 1 },   // PLACEHOLDER : sens exact de « note /10 » à confirmer ; un pavé refusé = 0
        PAVES_EN_MEMOIRE: 30,
        TACHE: 'parse_pave', MAX_TOKENS: 2500,
        // 5️⃣ PÉNALITÉS : un pavé refusé applique UNE des deux pénalités, tirée au hasard.
        PENALITES: ['attaque_instantanee', 'baisse_cs'],
        PENALITE_CS_TOURS: 3,                                  // « pendant 3 tours »
        aleatoire: null,                                       // fonction () → [0,1[ ; null = Math.random (injectable pour les tests)
    };

    const num = (j) => String(j || '').split('@')[0].split(':')[0];
    const memeJid = (a, b) => !!a && !!b && num(a) === num(b);

    /** Nom lisible : texte, ou objet carte { nom | name | titre … }. Évite le « [object Object] ». */
    function nomDe(x, profondeur = 0) {
        if (x == null || profondeur > 3) return null;
        if (typeof x === 'string') return x.trim() || null;
        if (typeof x === 'object') { for (const k of ['nom', 'name', 'titre', 'title', 'personnage', 'character', 'pseudo']) { const v = nomDe(x[k], profondeur + 1); if (v) return v; } }
        return null;
    }
    const nomCarte = (j) => nomDe(j.personnage) || nomDe(j.pseudo) || String(j.jid);

    /** Stats de combat. Rang de Combat Speed = rang de la catégorie (S-, S, S+ … échelle existante) ; le grade (Bronze < Silver < Gold) l'emporte. */
    function statsDe(j, match) {
        const niv = j.category ? getNiveauCategorie(j.category) : -1;
        const rang = j.combatSpeed != null ? Number(j.combatSpeed) : (niv >= 0 ? niv : 0);
        const ss = j.ss != null ? !!j.ss : /^ss/.test(normalizeCategorie(j.category || ''));
        const etats = (match.etats && match.etats[j.jid]) || {};
        return { ...j, rang, gradeRang: DEFENSES.rangGrade(j.grade), ss, force: Number(j.force) || 0, puissance: Number(j.puissance) || 0, sonne: !!etats.sonne, blocageTours: etats.blocageTours || 0 };
    }

    /* --- Tours : 1 tour = 2 pavés (un par joueur) ; le compteur ne bouge JAMAIS après un seul pavé -------------------- */
    const maxToursDe = (match) => Number(match.trackerCombatGemini && match.trackerCombatGemini.combat && match.trackerCombatGemini.combat.maxTours) || CFG.MAX_TOURS;
    function tourCourant(match, opt) { return opt.SOURCE_TOUR === 'match' && Number(match.tour) >= 1 ? Number(match.tour) : (match.tourArbitre || 1); }
    function synchroniserTour(match, tour, opt) {
        match.tourArbitre = tour;
        if (opt.SOURCE_TOUR !== 'match') { match.tour = tour; const c = match.trackerCombatGemini && match.trackerCombatGemini.combat; if (c) c.tour = tour; }
    }
    /** Enregistre le pavé dans le tour ; renvoie { tourTermine, matchTermine }. */
    function avancerTour(match, jid, tour, max, opt) {
        match.paveDuTour = match.paveDuTour || [];
        if (!match.paveDuTour.some((j) => memeJid(j, jid))) match.paveDuTour.push(jid);
        if (match.paveDuTour.length < 2) return { tourTermine: false, matchTermine: false };
        match.paveDuTour = [];
        if (tour >= max) return { tourTermine: true, matchTermine: true };
        synchroniserTour(match, tour + 1, opt);
        return { tourTermine: true, matchTermine: false };
    }

    /** « Un perso plus rapide qui se déplace à vmax puis frappe en combo » : retard de réaction de 1 s pour le défenseur (speedblitz). */
    function marquerSpeedblitz(parse, statsMoi, statsAdv) {
        const acts = parse.actions;
        for (let i = 1; i < acts.length; i++) {
            const a = acts[i], p = acts[i - 1];
            if ((a.type === 'attaque' || a.type === 'competence') && a.combo && p.type === 'deplacement' && p.deplacement && p.deplacement.vitesse === 'vmax' && statsMoi.gradeRang > statsAdv.gradeRang) a.speedblitz = true;
        }
    }

    function coutEnergie(actions, infosTechnique) {
        let c = 0, proj = 0;
        for (const a of actions) {
            if (a.type !== 'competence' && a.type !== 'attaque') continue;
            const e = a.energie || {}; let niv = e.niveau;
            if (a.type === 'competence' && infosTechnique) { const i = infosTechnique(a); if (i && i.niveau) niv = i.niveau; }
            if (e.projectile) { proj += 1; c += proj > 3 ? CFG.COUT_ENERGIE_PCT.projectileExcedentaire : CFG.COUT_ENERGIE_PCT.projectile; }
            else if (niv && CFG.COUT_ENERGIE_PCT[niv]) c += CFG.COUT_ENERGIE_PCT[niv];
        }
        return c;
    }
    function calculerNote(decision, details) {
        if (decision.annule) return 0;
        let n = CFG.NOTE.max;
        for (const d of details) { if (d.statut === 'ratee' || d.statut === 'plein_fouet') n -= CFG.NOTE.parDefenseRatee; else if (d.statut === 'partielle') n -= CFG.NOTE.parDefensePartielle; }
        return Math.max(1, n);
    }
    /* --- Pénalités (pavé refusé) ---------------------------------------------------------------------------------- */
    const TXT_PENALITE = {
        attaque_instantanee: () => "La prochaine attaque🥉🥈 de l'adversaire est lancée instantanément🌀.",
        baisse_cs: (tours) => `Baisse du niveau de combat S : inférieur à l'adversaire de -1 pendant ${tours} tours.`,
    };
    function tirerPenalite(opt) {
        const l = opt.PENALITES, r = typeof opt.aleatoire === 'function' ? opt.aleatoire() : Math.random();
        return l[Math.min(l.length - 1, Math.max(0, Math.floor(r * l.length)))];
    }
    function etatsDe(match, jid) { match.etats = match.etats || {}; match.etats[jid] = match.etats[jid] || {}; return match.etats[jid]; }
    function ajouterPenalite(match, jid, type, tour, opt) {
        const e = etatsDe(match, jid); e.penalites = e.penalites || [];
        const p = type === 'baisse_cs' ? { type, finTour: tour + opt.PENALITE_CS_TOURS } : { type };      // active du tour suivant au tour tour+3
        e.penalites.push(p);
        return { type, texte: TXT_PENALITE[type](opt.PENALITE_CS_TOURS) };
    }
    function penalitesActives(match, jid, tour) {
        const e = match.etats && match.etats[jid]; if (!e || !e.penalites) return [];
        e.penalites = e.penalites.filter((p) => p.type !== 'baisse_cs' || tour <= p.finTour);               // purge des pénalités expirées
        return e.penalites;
    }
    /**
     * Baisse du niveau de combat S : le puni passe à -1 sous l'adversaire (égal si l'adversaire est déjà S- Bronze, le plus bas),
     * sans jamais le RELEVER s'il était déjà plus bas. Modifie les copies de stats passées en argument.
     */
    function appliquerPenalitesCS(a, b, match, tour) {
        const oa = { ...a }, ob = { ...b };
        const baisser = (cible, autre) => {
            if (!penalitesActives(match, cible.jid, tour).some((p) => p.type === 'baisse_cs')) return;
            const plancher = autre.gradeRang === 0 && autre.rang <= 0;                                       // S- Bronze : on ne peut pas descendre en dessous
            if (DEFENSES.ecart(cible, autre) <= (plancher ? 0 : -1)) return;
            cible.gradeRang = autre.gradeRang; cible.ss = false; cible.rang = plancher ? autre.rang : autre.rang - 1; cible.penaliseCS = true;
        };
        baisser(a, ob); baisser(b, oa);
    }
    /** « La prochaine attaque🥉🥈 de l'adversaire est lancée instantanément » : consommée par la 1re technique non ultime du pavé. */
    function consommerInstantanee(match, penaliseJid, parse, infosTechnique) {
        const e = match.etats && match.etats[penaliseJid]; if (!e || !e.penalites) return null;
        const i = e.penalites.findIndex((p) => p.type === 'attaque_instantanee'); if (i < 0) return null;
        const a = parse.actions.find((x) => { if (x.type !== 'competence') return false; const info = infosTechnique ? infosTechnique(x) : null; const niv = (info && info.niveau) || (x.energie && x.energie.niveau); return niv !== 'ultime'; });
        if (!a) return null;
        a.instantanee = true; e.penalites.splice(i, 1);
        return a;
    }

    /** Repli local : on n'annule jamais un pavé sur la seule foi d'une analyse par mots-clés. */
    function adoucirRepli(decision) {
        return { ...decision, issues: [], etat: 'valide', annule: false, messages: [] };
    }
    function majBilan(match, moi, adv, details, parse, annule) {
        const b = (match.bilan = match.bilan || {});
        const zero = () => ({ infliges: 0, recus: 0, attaques: 0, touches: 0, defReussies: 0, defPartielles: 0, defRatees: 0 });
        const bm = (b[moi.jid] = b[moi.jid] || zero()), ba = (b[adv.jid] = b[adv.jid] || zero());
        for (const d of details) {
            bm.recus += d.degats || 0; ba.infliges += d.degats || 0; if (d.touche) ba.touches += 1;
            if (d.statut === 'reussie') bm.defReussies += 1; else if (d.statut === 'partielle') bm.defPartielles += 1; else bm.defRatees += 1;
        }
        if (!annule) bm.attaques += parse.actions.filter((a) => a.type === 'attaque' || a.type === 'competence').length;
    }

    /** Fin par décision après le dernier tour (sans KO) : jugée par l'IA sur le bilan ; ÉGALITÉ si impossible de départager ou IA indisponible. */
    async function decider({ match, moi, adv, pvMoi }) {
        const bilan = match.bilan || {};
        const donnees = { toursJoues: maxToursDe(match), joueurs: [
            { jid: moi.jid, nom: nomCarte(moi), pvRestants: pvMoi, bilan: bilan[moi.jid] || {} },
            { jid: adv.jid, nom: nomCarte(adv), pvRestants: adv.pv, bilan: bilan[adv.jid] || {} }] };
        const prompt = `Tu es l'arbitre officiel d'ALL STARS. Le match 1v1 est terminé après le dernier tour, sans KO. Désigne le vainqueur PAR DÉCISION selon : les dégâts infligés et reçus, les attaques réussies, les défenses, esquives et contres réussis, la domination des échanges, la qualité et l'efficacité des actions, la régularité sur l'ensemble du combat, les désavantages réellement imposés à l'adversaire. Le joueur qui a le plus de PV restants ne gagne PAS automatiquement. Si aucun joueur ne peut être objectivement départagé, réponds "egalite". N'invente aucune donnée.\n\nBILAN :\n${JSON.stringify(donnees)}\n\nRéponds UNIQUEMENT avec ce JSON : {"gagnant":"<jid du vainqueur>" ou "egalite","raison":"une phrase"}`;
        const r = await IA.demander({ tache: 'decision_match', messages: [{ role: 'user', content: prompt }], json: true, temperature: 0, maxTokens: 600,
            cle: match.id || match.matchId || 'match', valider: (d) => (d && (d.gagnant === 'egalite' || d.gagnant === moi.jid || d.gagnant === adv.jid)) || 'gagnant invalide' });
        if (!r.ok || r.data.gagnant === 'egalite') return { egalite: true, raison: 'ÉGALITÉ', detail: r.ok ? String(r.data.raison || '') : 'Décision impossible (IA indisponible) : égalité par défaut.' };
        const gagnant = r.data.gagnant === moi.jid ? moi : adv, perdant = gagnant === moi ? adv : moi;
        return { gagnantJid: gagnant.jid, gagnantPseudo: gagnant.pseudo || nomCarte(gagnant), perdantJid: perdant.jid, raison: 'DÉCISION', detail: String(r.data.raison || '') };
    }

    function composerMessageFin(resultat) {
        const f = resultat && resultat.fin; if (!f) return null;
        if (f.egalite) return `🤝 *ÉGALITÉ* ${f.detail ? '— ' + f.detail : ''}`.trim();
        return `🏆 *VICTOIRE* de @${f.gagnantPseudo} par ${f.raison} !${f.raison === 'DÉCISION' && f.detail ? `\n${f.detail}` : ''}`;
    }

    /**
     * @param {object} p
     *   user  JID de l'auteur        actionsTexte  texte après « 🌀🎮: »
     *   contexteMatch { match }       joueursGemini joueurs du tracker (jid, pseudo, personnage, grade, category, vitesseMax, pv, stamina, energie, force…)
     *   paveId  id du message (évite un double traitement)
     *   options { resoudre?, effetsCarte?, infosTechnique?, verifierTour?, SOURCE_TOUR? } surcharge de CFG
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
            const maxTours = maxToursDe(match);
            const tour = tourCourant(match, opt);
            if (opt.SOURCE_TOUR !== 'match' && !match.tourArbitre) synchroniserTour(match, 1, opt);
            const nomMoi = nomCarte(moi), nomAdv = nomCarte(adv);

            //------------------------------------------------
            // 1. Extraction (IA, sinon repli local)
            //------------------------------------------------
            let parse, source = 'ia', modele = null;
            const prompt = PARSEUR.construirePrompt({
                joueur: { nom: `${nomMoi} (joueur ${moi.pseudo || moi.jid})`, grade: moi.grade, vmax: moi.vitesseMax },
                adversaire: { nom: `${nomAdv} (joueur ${adv.pseudo || adv.jid})` },
                distance: moi.distanceAdversaire, tour, attaquesEnAttente: REGLES.pourPrompt(match, moi.jid), actionsTexte,
            });
            const r = await IA.demander({
                tache: opt.TACHE, messages: [{ role: 'user', content: prompt }], json: true, temperature: 0, maxTokens: opt.MAX_TOKENS,
                cle: match.id || match.matchId || 'match', valider: PARSEUR.valider,
            });
            if (r.ok) { parse = PARSEUR.normaliser(r.data); modele = r.modele; }
            else if (opt.REPLI_LOCAL) {
                parse = PARSEUR.normaliser(LOCAL.analyser(actionsTexte, { cibleNoms: [nomAdv, adv.pseudo].filter(Boolean), acteurNoms: [nomMoi, moi.pseudo].filter(Boolean) }));
                source = 'local'; modele = 'local';
            } else return { ok: false, ...base, enAttente: true, erreur: `Aucune IA disponible : ${r.erreurs.join(' | ')}` };

            //------------------------------------------------
            // 2. Règles strictes + file d'attaques
            //------------------------------------------------
            let decision = REGLES.evaluerPave(parse);
            if (source === 'local') decision = adoucirRepli(decision);
            const statsMoi = statsDe(moi, match), statsAdv = statsDe(adv, match);
            appliquerPenalitesCS(statsMoi, statsAdv, match, tour);
            let penalite = null, lignePenaliteAdverse = null;
            if (decision.annule) {
                if (source === 'ia') penalite = ajouterPenalite(match, moi.jid, tirerPenalite(opt), tour, opt);   // pavé refusé = pénalité au hasard
            } else {
                marquerSpeedblitz(parse, statsMoi, statsAdv);
                const a = consommerInstantanee(match, adv.jid, parse, opt.infosTechnique);
                if (a) lignePenaliteAdverse = `⚡ Pénalité de ${nomAdv} : ${a.competence || 'ton attaque'} est lancée instantanément🌀.`;
            }
            const integ = REGLES.integrerPave(match, { joueurId: moi.jid, joueurNom: nomMoi, adversaireId: adv.jid, tour, paveId: paveId || `p${Date.now()}`, parse, decision });

            //------------------------------------------------
            // 3. Résolution chiffrée des attaques reçues + coût en énergie
            //------------------------------------------------
            const resolveur = typeof opt.resoudre === 'function' ? opt.resoudre : MOTEUR.resoudrePave;
            const reso = (await resolveur({ liens: integ.liens, defenseur: statsMoi, attaquant: statsAdv, effetsCarte: opt.effetsCarte, infosTechnique: opt.infosTechnique, parse, decision, match })) || {};
            const etat = reso.etat || { pv: moi.pv, stamina: moi.stamina, energie: moi.energie, posture: 'neutre', equilibre: 'stable' };
            const details = reso.details || [];
            const cout = decision.annule ? 0 : coutEnergie(parse.actions, opt.infosTechnique);
            const energieAvant = moi.energie != null ? moi.energie : 100, staminaAvant = moi.stamina != null ? moi.stamina : 100;
            const energieApres = Math.max(0, energieAvant - cout);
            majBilan(match, moi, adv, details, parse, decision.annule);

            // états qui durent d'un pavé à l'autre : sonné (1 tour), garde brisée (2 tours)
            match.etats = match.etats || {};
            const prec = match.etats[moi.jid] || {};
            match.etats[moi.jid] = { ...prec, sonne: !!etat.nouveauSonne, blocageTours: etat.brisegarde ? MOTEUR.CFG.BRISE_GARDE_TOURS : Math.max(0, (prec.blocageTours || 0) - 1) };

            const posture = etat.nouveauSonne ? 'sonné' : etat.posture;
            const majTracker = [];
            if (etat.pv !== moi.pv || etat.stamina !== staminaAvant || energieApres !== energieAvant || posture !== 'neutre' || etat.equilibre !== 'stable') {
                majTracker.push({ jid: moi.jid, pv: etat.pv, stamina: etat.stamina, energie: energieApres, posture, equilibre: etat.equilibre });
            }
            let fin = null;
            const ko = etat.pv <= 0;
            if (ko) fin = { gagnantJid: adv.jid, gagnantPseudo: adv.pseudo || adv.jid, perdantJid: moi.jid, raison: 'KO' };

            //------------------------------------------------
            // 4. Tour suivant / fin de match
            //------------------------------------------------
            if (!ko) {
                const t = avancerTour(match, moi.jid, tour, maxTours, opt);
                if (t.matchTermine) fin = await decider({ match, moi, adv, pvMoi: etat.pv });
            }

            //------------------------------------------------
            // 5. Récit + verdict au format du jeu
            //------------------------------------------------
            const recit = NARRATEUR.composer({ nomDefaut: nomMoi, parse, details });
            const lignesNotes = decision.notes.map((n) => (n.code === 'VITESSE_LENTE' ? `🐢 Action ${n.n} : vmax non précisé juste après l'action → vitesse considérée lente` : n.code === 'COURBE_TROP_LARGE' ? `🐢 Action ${n.n} : courbe de ${n.valeur} m (3 m max pour garder la vitesse max)` : null)).filter(Boolean);
            const lignesCout = cout > 0 ? [`🌀 Coût du pavé : ${NARRATEUR.pct(cout, NARRATEUR.EM.en)}`] : [];
            const ligneKO = ko ? `☠️ ${nomMoi} est KO.` : null;
            const actions = parse.actions.map((a) => {
                const lie = integ.liens.find((l) => l.defenses.includes(a));
                const res = lie && details.find((d) => d.n === lie.attaque.n);
                const mes = decision.issues.filter((i) => i.n === a.n).map((i) => i.message);
                return {
                    ordre: a.n, acteur: a.acteur || nomMoi, cible: a.cible || nomAdv, type: a.type, description: a.texte,
                    valide: !decision.annule, raison: decision.annule ? (mes.join(' ') || 'Pavé annulé') : '',
                    resultatDefense: a.type === 'defense' ? (lie ? `liée à [#${lie.attaque.n}]${res ? ' : ' + res.statut : ''}` : 'aucune attaque visée') : '',
                    consequence: a.type === 'attaque' || a.type === 'competence' ? (decision.annule ? 'annulée' : "mise en attente (l'adversaire peut y répondre)") : '',
                };
            });
            let section1, section2;
            if (decision.annule) {
                section1 = [recit.resume, ...decision.issues.map((i) => `❌ ${i.message}`), 'Aucune action ne passe.'].join('\n');
                section2 = [...recit.lignes, penalite ? `❌ *Pénalité* — ${penalite.texte}` : null, ligneKO].filter(Boolean).join('\n');
            } else {
                section1 = recit.resume;
                section2 = [...recit.lignes, ...lignesCout, ...lignesNotes, lignePenaliteAdverse, ligneKO].filter(Boolean).join('\n');
            }

            const resultat = {
                ok: true, ...base,
                paveValide: !decision.annule, nombreActions: parse.nombreActions, actions,
                note: calculerNote(decision, details), tour, maxTours,
                section1, section2,
                verdict: decision.annule ? section1 : '', resume: decision.annule ? '' : [section1, section2].filter(Boolean).join('\n'),
                erreurs: decision.annule ? decision.issues.map((i) => i.message) : [],
                joueurSuivant: { nom: adv.pseudo || adv.jid, jid: adv.jid },
                consequences: {
                    touche: details.some((d) => d.touche), contre: false, mauvaisContre: decision.annule && integ.liens.length > 0,
                    degats: details.reduce((s, d) => s + (d.degats || 0), 0), effets: details.flatMap((d) => d.effets || []),
                    position: '', posture, equilibre: etat.equilibre, garde: '',
                },
                majTracker, fin, modele, source, etat: decision.etat, penalite,
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

    return { CFG, analyser, composerMessageFin, statsDe, nomDe, nomCarte, calculerNote, coutEnergie, appliquerPenalitesCS, ajouterPenalite, penalitesActives, consommerInstantanee, tirerPenalite };
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

            personnage:
                PIPELINE.nomDe(personnage) ||
                PIPELINE.nomDe(j?.carte) ||
                PIPELINE.nomDe(j?.card) ||
                null,

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
        // 📝 CORPS DU VERDICT (résumé + verdict)
        //================================================
        const section1Verdict =
            resultat.section1 ??
            (resultat.paveValide
                ? (resultat.resume || "Actions validées.")
                : [resultat.verdict || "Le pavé est invalide.",
                   ...(Array.isArray(resultat.erreurs) ? resultat.erreurs.map(e => `❌ ${e}`) : [])].join("\n"));

        //================================================
        // 🏁 FIN DE MATCH (KO, DÉCISION OU ÉGALITÉ)
        //================================================
        if (resultat.fin) {
            clearTimeout(match?.timerTour);
            clearTimeout(match?.timerWarning);
            await ovl.sendMessage(
                chat,
                {
                    text: NARRATEUR.gabaritFin({
                        valide: !!resultat.paveValide,
                        section1: section1Verdict,
                        section2: resultat.section2 || "",
                        tour: resultat.tour ?? match?.tour ?? 1,
                        maxTours: resultat.maxTours ?? 10,
                        messageFin: PIPELINE.composerMessageFin(resultat)
                    }),
                    mentions: resultat.fin.gagnantJid ? [resultat.fin.gagnantJid] : []
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
        // 📤 MESSAGE DU VERDICT (gabarit unique : validé ou refusé)
        //================================================
        const texte = NARRATEUR.gabaritVerdict({
            valide: !!resultat.paveValide,
            section1: section1Verdict,
            section2: resultat.section2 || "",
            note: Number(resultat.note) || 0,
            tour: resultat.tour ?? match?.tour ?? 1,
            maxTours: resultat.maxTours ?? 10,
            prochainPseudo
        });

        await ovl.sendMessage(
            chat,
            {
                text: texte,
                mentions: prochainJid ? [prochainJid] : []
            }
        );

        console.log(resultat.paveValide ? "🎮 RENDU PAVÉ ENVOYÉ" : "🎮 PAVÉ REFUSÉ");
        console.log("➡️ PROCHAIN GO :", prochainPseudo, "|", prochainJid);

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
            return 10;

        case "argent":
        case "silver":
            return 15;

        case "or":
        case "gold":
            return 20;

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
    "S+ mega",
    "S+ extreme",
    "S+ ultimate",

    "SS-",
    "SS",
    "SS+",
    "SS+ super",
    "SS+ ultra",
    "SS+ mega",
    "SS+ extreme",
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
