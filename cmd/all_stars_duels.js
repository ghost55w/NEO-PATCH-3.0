const { ovlcmd } = require("../lib/ovlcmd");
const { getData, setfiche } = require("../DataBase/allstars_divs_fiches");

//================= ARENES =================
const arenes = [
    { nom: 'Desert Montagneux⛰️', image: 'https://files.catbox.moe/aoximf.jpg' },
    { nom: 'Ville en Ruines🏚️', image: 'https://files.catbox.moe/2qmvpa.jpg' },
    { nom: 'Centre-ville🏙️', image: 'https://files.catbox.moe/pzlkf9.jpg' },
    { nom: 'Arise🌇', image: 'https://files.catbox.moe/3vlsmw.jpg' },
    { nom: 'Salle du temps ⌛', image: 'https://files.catbox.moe/j4e1pp.jpg' },
    { nom: 'Valley de la fin🗿', image: 'https://files.catbox.moe/m0k1jp.jpg' },
    { nom: 'École d\'exorcisme de Tokyo📿', image: 'https://files.catbox.moe/rgznzb.jpg' },
    { nom: 'Marinford🏰', image: 'https://files.catbox.moe/4bygut.jpg' },
    { nom: 'Cathédrale⛩️', image: 'https://files.catbox.moe/ie6jvx.jpg' }
];

//================= DUELS PAR GROUPE =================
const duelsEnCours = {};
let lastArenaIndex = -1;

//================= UTILS =================
function tirerAr() {
    let i;
    do { i = Math.floor(Math.random() * arenes.length); }
    while (i === lastArenaIndex);
    lastArenaIndex = i;
    return arenes[i];
}

function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(0, Math.min(100, stats[stat] + val));
}

function clean(txt) {
    return txt.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function normalizeName(n) {
    return n
        .toLowerCase()
        .replace(/@/g, '')
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim();
}

//================= FICHE DUEL =================
function generateFicheDuel(duel) {
    return `. ◥◣              🌀JUMP ARENA™🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

🔆🎴 *${j1.nom}* :
🫀 Sta : ${j1.stats.sta}%
🌀 En : ${j1.stats.energie}%
❤️ Pv : ${j1.stats.pv}%

                         ~  *🆚*  ~

🔆🎴 *${j2.nom}* :
🫀 Sta : ${j2.stats.sta}%
🌀 En : ${j2.stats.energie}%
❤️ Pv : ${j2.stats.pv}%

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*🌍 𝐀𝐫𝐞̀𝐧𝐞* : ${duel.arene.nom}
*🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞* : Boost 1 fois chaque 2 tours!
*⚖️ 𝐒𝐭𝐚𝐭𝐬* : ${stats}
*🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭* : illimitée
*🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌* : 5m
*⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞* : 7mins ⚠️
*⭕ 𝐏𝐨𝐫𝐭𝐞́* : 10m

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*⚠️ Vous avez 🔟 tours max pour finir votre Adversaire !* Sinon la victoire sera donnée par décision selon l'offensive !

╰───────────────────
                                   *R A Z O R X™⚡*`;
}

//========================================
// 🌀 MESSAGE DE CHARGEMENT
//========================================

const loading = await ovl.sendMessage(ms_org, {
    text: "🏟️ Sélection de l'arène."
}, { quoted: ms });


//========================================
// 🏟️ ÉTAPE 1 — SÉLECTION DE L'ARÈNE
// 7.5 secondes
//========================================

for (const txt of [
    "🏟️ Sélection de l'arène..",
    "🏟️ Sélection de l'arène...",
    "🏟️ Sélection de l'arène."
]) {

    await new Promise(resolve =>
        setTimeout(resolve, 2500)
    );

    await ovl.sendMessage(ms_org, {
        text: txt,
        edit: loading.key
    });
}


//========================================
// 🌀 ÉTAPE 2 — PRÉPARATION DU MATCH
// 7.5 secondes
//========================================

for (const txt of [
    "🌀 Préparation du match.",
    "🌀 Préparation du match..",
    "🌀 Préparation du match..."
]) {

    await new Promise(resolve =>
        setTimeout(resolve, 2500)
    );

    await ovl.sendMessage(ms_org, {
        text: txt,
        edit: loading.key
    });
}


//========================================
// 🔥 ÉTAPE 3 — INITIALISATION
// 7.5 secondes
//========================================

for (const txt of [
    "🔥 Initialisation du combat.",
    "🔥 Initialisation du combat..",
    "🔥 Initialisation du combat..."
]) {

    await new Promise(resolve =>
        setTimeout(resolve, 2500)
    );

    await ovl.sendMessage(ms_org, {
        text: txt,
        edit: loading.key
    });
}


//========================================
// ♨️ ÉTAPE 4 — DÉBUT DU COMBAT
// 7.5 secondes
//========================================

for (const txt of [
    "♨️ Le combat va commencer.",
    "♨️ Le combat va commencer..",
    "♨️ Le combat va commencer..."
]) {

    await new Promise(resolve =>
        setTimeout(resolve, 2500)
    );

    await ovl.sendMessage(ms_org, {
        text: txt,
        edit: loading.key
    });
}


//========================================
// 🏟️ AFFICHAGE DE LA FICHE DU DUEL
//========================================

await ovl.sendMessage(ms_org, {
    image: {
        url: arene.image
    },
    caption: generateFicheDuel(duelsEnCours[ms_org])
}, { quoted: ms });


//================= +STATS =================
ovlcmd({
    nom_cmd: "stats",
    classe: "Duel",
    react: "📉"
}, async (ms_org, ovl, { arg, ms }) => {
    const duel = duelsEnCours[ms_org];
    if (!duel) return;

    // Si aucun argument → renvoyer fiche actuelle
    if (!arg.length) {
        return ovl.sendMessage(ms_org, {
            image: { url: duel.arene.image },
            caption: generateFicheDuel(duel)
        }, { quoted: ms });
    }

    const input = arg.join(' ');
    let left, rest;

    if (input.includes(':')) {
        const idx = input.indexOf(':');
        left = input.slice(0, idx).trim();
        rest = input.slice(idx + 1).trim();
    } else if (input.includes('=')) {
        const idx = input.indexOf('=');
        left = input.slice(0, idx).trim();
        rest = input.slice(idx + 1).trim();
    } else {
        const parts = input.split(' ');
        left = parts.shift();
        rest = parts.join(' ');
    }

    const leftNorm = normalizeName(left);

    const joueur =
        duel.equipe1.find(j => normalizeName(j.nom) === leftNorm) ||
        duel.equipe2.find(j => normalizeName(j.nom) === leftNorm);

    if (!joueur) {
        return ovl.sendMessage(ms_org, { text: "❌ Joueur introuvable." }, { quoted: ms });
    }

    for (const p of rest.split(',')) {
        const m = p.match(/(sta|energie|pv)\s*([+-=])\s*(\d+)/i);
        if (!m) continue;

        const stat = m[1].toLowerCase();
        const op = m[2];
        const val = Number(m[3]);

        if (op === '+' || op === '-') {
            limiterStats(joueur.stats, stat, op === '-' ? -val : val);
        } else if (op === '=') {
            joueur.stats[stat] = Math.max(0, Math.min(100, val));
        }
    }

    console.log("STATS MAJ:", joueur.nom, joueur.stats);
// Silence total, aucun message envoyé
return;
});
    
/* ================= UTILS ================= */

function normalizeTag(tag) {
    return tag
        .replace(/@/g, '')
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim()
        .toLowerCase();
}

/* ================= PARSER GLOBAL RAZORX ================= */

function parseRazorX(text) {
    const result = { actions: [], results: [] };

    // ---------- MATCH LIVE ----------
    const liveBloc = text.match(/▶️`Match Live`:\s*([\s\S]+?)(?:▔|🏆`RESULTAT`)/i);
    if (liveBloc) {
        const lignes = liveBloc[1].split('\n').map(l => l.trim()).filter(Boolean);

        for (const ligne of lignes) {
            const clean = ligne.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '');
            const idx = clean.indexOf(':');
if (idx === -1) continue;

const p = clean.slice(0, idx).trim();
const s = clean.slice(idx + 1).trim();
            if (!p || !s) continue;

            const tag = normalizeTag(p);
            const stats = s.split('|').map(v => v.trim());

            for (const st of stats) {
                const m = st.match(/(talent|strikes|attaques|pv|sta|energie)\s*:?\s*(\d+)/i);
                if (!m) continue;

                result.actions.push({
                    tag,
                    stat: m[1].toLowerCase(),
                    valeur: Number(m[2]),
                    mode: "set"
                });
            }
        }
    }

    // ---------- RESULTAT ----------
    const resBloc = text.match(/🏆`RESULTAT`:\s*([\s\S]+)/i);
    if (resBloc) {
        const lignes = resBloc[1].split('\n').map(l => l.trim()).filter(Boolean);

        for (const ligne of lignes) {
            const m = ligne.match(/(victoire|defaite|défaite)\s*:?\s*@?(.+?)(?:\s*(✅|❌))?$/i);
            if (!m) continue;

            result.results.push({
                type: m[1].toLowerCase() === "défaite" ? "defaite" : m[1].toLowerCase(),
                tag: normalizeTag(m[2]),
                symbol: m[3] || null
            });
        }
    }

    return result;
}

/* ================= RAZORX AUTO ================= */

ovlcmd({
    nom: "razorx_auto",
    isfunc: true
}, async (ms_org, ovl, { texte, ms }) => {

    if (!texte?.includes("RAZORX")) return;

    try {

        const duel = duelsEnCours[ms_org];

        // ======================================================
        // VÉRIFICATION DU DUEL
        // ======================================================

        if (!duel) {
            console.log("⚠️ Aucun duel actif pour ce groupe.");
            return;
        }

        const {
            actions,
            results
        } = parseRazorX(texte);

        // ======================================================
        // VÉRIFICATION DU RESULTAT
        // ======================================================

        if (!results.length) {
            console.log("⚠️ Aucun résultat trouvé dans le pavé RazorX.");
            return;
        }

        // ======================================================
        // MATCH LIVE
        // STRIKES + ATTAQUES
        // ======================================================

        for (const act of actions) {

            if (!["strikes", "attaques"].includes(act.stat)) {
                continue;
            }

            const fiche = await getFicheByPseudo(act.tag);

            if (!fiche) {

                console.log(
                    `⚠️ Joueur introuvable pour ${act.tag}`
                );

                continue;
            }

            const ancien = Number(fiche[act.stat]) || 0;

            const nouveau =
                ancien + Number(act.valeur);

            await setfiche(
                act.stat,
                nouveau,
                fiche.jid
            );

            console.log(
                `📊 ${fiche.pseudo} | ${act.stat} : ${ancien} → ${nouveau}`
            );
        }

        // ======================================================
        // RESULTATS
        // ======================================================

        for (const r of results) {

            const fiche = await getFicheByPseudo(r.tag);

            if (!fiche) {

                console.log(
                    `⚠️ Joueur introuvable pour résultat : ${r.tag}`
                );

                continue;
            }

            let exp = Number(fiche.exp) || 0;
            let talent = Number(fiche.talent) || 0;
            let golds = Number(fiche.golds) || 0;

            let victoires = Number(fiche.victoires) || 0;
            let defaites = Number(fiche.defaites) || 0;

            // ==================================================
            // VICTOIRE
            // ==================================================

            if (r.type === "victoire") {

                victoires += 1;

                // ----------------------------------------------
                // BONNE PERFORMANCE ✅
                // ----------------------------------------------

                if (r.symbol === "✅") {

                    exp += 10;
                    talent += 1;
                    golds += 10000;

                    console.log(
                        `✅ Bonne performance : ${fiche.pseudo}`
                    );
                }

                // ----------------------------------------------
                // MAUVAISE PERFORMANCE ❌
                // ----------------------------------------------

                else if (r.symbol === "❌") {

                    exp = Math.max(0, exp - 10);
                    talent = Math.max(0, talent - 1);

                    console.log(
                        `❌ Mauvaise performance : ${fiche.pseudo}`
                    );
                }
            }

            // ==================================================
            // DEFAITE
            // ==================================================

            else if (r.type === "defaite") {

                defaites += 1;

                // ----------------------------------------------
                // BONNE PERFORMANCE ✅
                // ----------------------------------------------

                if (r.symbol === "✅") {

                    exp += 10;
                    talent += 1;
                    golds += 10000;

                    console.log(
                        `✅ Bonne performance : ${fiche.pseudo}`
                    );
                }

                // ----------------------------------------------
                // MAUVAISE PERFORMANCE ❌
                // ----------------------------------------------

                else if (r.symbol === "❌") {

                    exp = Math.max(0, exp - 10);
                    talent = Math.max(0, talent - 1);

                    console.log(
                        `❌ Mauvaise performance : ${fiche.pseudo}`
                    );
                }
            }

            // ==================================================
            // SAUVEGARDE
            // ==================================================

            await setfiche(
                "exp",
                exp,
                fiche.jid
            );

            await setfiche(
                "talent",
                talent,
                fiche.jid
            );

            await setfiche(
                "golds",
                golds,
                fiche.jid
            );

            await setfiche(
                "victoires",
                victoires,
                fiche.jid
            );

            await setfiche(
                "defaites",
                defaites,
                fiche.jid
            );

            console.log(
                `🏆 ${fiche.pseudo} | ` +
                `V:${victoires} D:${defaites} | ` +
                `EXP:${exp} Talent:${talent} Golds:${golds}`
            );
        }

        // ======================================================
        // FIN DU DUEL
        // ======================================================

        delete duelsEnCours[ms_org];

        console.log(
            `🏁 Duel terminé automatiquement dans ${ms_org}`
        );

        // ======================================================
        // CONFIRMATION
        // ======================================================

        await ovl.sendMessage(ms_org, {
    text:
        `🏁 *FIN DU MATCH* | *JUMP™🔅🌀*\n` +
        `▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n` +
        `✅ Résultats enregistrés.\n` +
        `📊 Statistiques mises à jour.\n` +
        `🏆 Victoire / défaite enregistrées.\n` +
        `🎴 Strikes / attaques enregistrés.\n` +
        `🎁 Performances récompensées.\n\n` +
        `╰───────────────────\n` +
        `                                   *R A Z O R X™⚡*`
}, { quoted: ms });

    } catch (err) {

        console.error(
            "❌ Erreur RAZORX AUTO :",
            err
        );
    }
});


/* ================= +PAVEMODO (PAVÉ VIDE ATTENDU) ================= */

ovlcmd({
    nom_cmd: "pavemodo",
    classe: "Duel",
    react: "📄",
    desc: "Envoie le pavé RazorX™ vide."
}, async (ms_org, ovl) => {
    
const pave = `. ◥◣              🌀JUMP™🔆
▔▔▔▔▔▔▔▔▔▔▔◥◣▔▔▔▔▔▔▔
                             
▶️`Match Live`: 
🎮j1 : Strikes: 0 | attaques: 0
🎮j2 : Strikes: 0 | attaques: 0

▔▔▔▔▔▔▔▔▔▔▔▔░▔▔▔▔▔▔▔▔
🏆`RESULTAT`: 
◥◣victoire :  
◥◣défaite : 
👤Arbitre:  
⏱️Durée: 

╰───────────────────
                        *R A Z O R X™⚡*`;

    await ovl.sendMessage(ms_org, { text: pave });
});
