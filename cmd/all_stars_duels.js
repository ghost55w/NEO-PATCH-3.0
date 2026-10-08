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
    { nom: "École d'exorcisme de Tokyo📿", image: 'https://files.catbox.moe/rgznzb.jpg' },
    { nom: 'Marinford🏰', image: 'https://files.catbox.moe/4bygut.jpg' },
    { nom: 'Cathédrale⛩️', image: 'https://files.catbox.moe/ie6jvx.jpg' }
];

//================= DUELS PAR GROUPE =================
const duelsEnCours = {};
let lastArenaIndex = -1;

//================= UTILS =================

function tirerAr() {
    let i;

    do {
        i = Math.floor(Math.random() * arenes.length);
    } while (i === lastArenaIndex);

    lastArenaIndex = i;

    return arenes[i];
}

function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(
        0,
        Math.min(100, Number(stats[stat] || 0) + val)
    );
}

function clean(txt) {
    return txt
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim();
}

function normalizeName(n) {
    return String(n || '')
        .toLowerCase()
        .replace(/@/g, '')
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim();
}

/* ================= NORMALIZE TAG ================= */

function normalizeTag(tag) {
    return String(tag || '')
        .replace(/@/g, '')
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim()
        .toLowerCase();
}

/* ================= FICHE DUEL ================= */

function generateFicheDuel(duel) {

    const j1 = duel?.equipe1?.[0];
    const j2 = duel?.equipe2?.[0];

    return `. ◥◣              🌀JUMP ARENA™🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

🔆🎴 ${j1?.nom || "Joueur 1"} :
🫀 Sta : ${j1?.stats?.sta ?? 0}%
🌀 En : ${j1?.stats?.energie ?? 0}%
❤️ Pv : ${j1?.stats?.pv ?? 0}%

                         ~  *🆚*  ~

🔆🎴 ${j2?.nom || "Joueur 2"} :
🫀 Sta : ${j2?.stats?.sta ?? 0}%
🌀 En : ${j2?.stats?.energie ?? 0}%
❤️ Pv : ${j2?.stats?.pv ?? 0}%

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

🌍 𝐀𝐫𝐞̀𝐧𝐞 : ${duel?.arene?.nom || "Inconnue"}
🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞 : Boost 1 fois chaque 2 tours!
⚖️ 𝐒𝐭𝐚𝐭𝐬 : ${duel?.stats || "Normal"}
🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭 : illimitée
🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌 : 5m
⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞 : 7mins ⚠️
⭕ 𝐏𝐨𝐫𝐭𝐞́ : 10m

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

⚠️ Vous avez 🔟 tours max pour finir votre Adversaire ! Sinon la victoire sera donnée par décision selon l'offensive !

╰───────────────────
R A Z O R X™⚡`;
}

//================= +DUEL =================
ovlcmd({
    nom_cmd: "duel",
    classe: "Duel",
    react: "⚔️"
}, async (ms_org, ovl, { arg, ms }) => {
    if (!arg.length) return;

    const input = arg.join(' '); // ne pas remplacer ou nettoyer
    const [players, statsCustom] = input.split('/').map(v => v.trim());
    const [p1, p2] = players.split('vs').map(v => v.trim());

    if (!p1 || !p2) return;

    const equipe1 = [{
        nom: p1,
        stats: {
            sta: 100,
            energie: 100,
            pv: 100
        }
    }];

    const equipe2 = [{
        nom: p2,
        stats: {
            sta: 100,
            energie: 100,
            pv: 100
        }
    }];

    const arene = tirerAr();

    duelsEnCours[ms_org] = {
        equipe1,
        equipe2,
        arene,
        statsCustom: statsCustom || null
    };

    // 🌀 LANCEMENT DU CHARGEMENT
    await chargerDuel(
        ms_org,
        ovl,
        ms,
        duelsEnCours[ms_org]
    );
});


/* ==========================================================
   🌀 CHARGEMENT DU DUEL
   ========================================================== */

async function chargerDuel(ms_org, ovl, ms, duel) {

    const loading = await ovl.sendMessage(ms_org, {
        text: "🏟️ Sélection de l'arène."
    }, { quoted: ms });

    //========================================
    // 🏟️ ÉTAPE 1 — SÉLECTION DE L'ARÈNE
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
            url: duel.arene.image
        },
        caption: generateFicheDuel(duel)
    }, { quoted: ms });
}


/* ================= +STATS ================= */

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
            image: {
                url: duel.arene.image
            },
            caption: generateFicheDuel(duel)
        }, { quoted: ms });
    }

    const input = arg.join(' ');

    let left;
    let rest;

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
        duel.equipe1.find(
            j => normalizeName(j.nom) === leftNorm
        ) ||
        duel.equipe2.find(
            j => normalizeName(j.nom) === leftNorm
        );

    if (!joueur) {

        return ovl.sendMessage(
            ms_org,
            {
                text: "❌ Joueur introuvable."
            },
            { quoted: ms }
        );
    }

    for (const p of rest.split(',')) {

        const m = p.match(
            /(sta|energie|pv)\s*([+-=])\s*(\d+)/i
        );

        if (!m) continue;

        const stat = m[1].toLowerCase();
        const op = m[2];
        const val = Number(m[3]);

        if (op === '+' || op === '-') {

            limiterStats(
                joueur.stats,
                stat,
                op === '-' ? -val : val
            );

        } else if (op === '=') {

            joueur.stats[stat] =
                Math.max(
                    0,
                    Math.min(100, val)
                );
        }
    }

    console.log(
        "STATS MAJ:",
        joueur.nom,
        joueur.stats
    );

    // Silence total
    return;
});


/* ==========================================================
   🔎 RECHERCHE FICHE PAR PSEUDO
   ========================================================== */

async function getFicheByPseudo(pseudo) {

    const cible = normalizeTag(pseudo);

    try {

        const fiches = await getData();

        if (!fiches) return null;

        const liste = Array.isArray(fiches)
            ? fiches
            : Object.values(fiches);

        return liste.find(fiche => {

            const valeurs = [
                fiche.pseudo,
                fiche.nom,
                fiche.code_fiche
            ];

            return valeurs.some(
                valeur =>
                    normalizeTag(valeur) === cible
            );

        }) || null;

    } catch (err) {

        console.error(
            "❌ Erreur getFicheByPseudo :",
            err
        );

        return null;
    }
}


/* ================= PARSER GLOBAL RAZORX ================= */

function parseRazorX(text) {

    const result = {
        actions: [],
        results: []
    };

    // ---------- MATCH LIVE ----------

    const liveBloc = text.match(
        /▶️`?Match Live`?\s*:\s*([\s\S]+?)(?:▔|🏆`?RESULTAT`?)/i
    );

    if (liveBloc) {

        const lignes = liveBloc[1]
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        for (const ligne of lignes) {

            const cleanLine = ligne.replace(
                /[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g,
                ''
            );

            const idx = cleanLine.indexOf(':');

            if (idx === -1) continue;

            const p = cleanLine
                .slice(0, idx)
                .trim();

            const s = cleanLine
                .slice(idx + 1)
                .trim();

            if (!p || !s) continue;

            const tag = normalizeTag(p);

            const stats = s
                .split('|')
                .map(v => v.trim());

            for (const st of stats) {

                const m = st.match(
                    /(talent|strikes|attaques|pv|sta|energie)\s*:?\s*(\d+)/i
                );

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

    const resBloc = text.match(
        /🏆`?RESULTAT`?\s*:\s*([\s\S]+)/i
    );

    if (resBloc) {

        const lignes = resBloc[1]
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        for (const ligne of lignes) {

            const m = ligne.match(
                /(victoire|defaite|défaite)\s*:?\s*@?(.+?)(?:\s*(✅|❌))?$/i
            );

            if (!m) continue;

            result.results.push({
                type:
                    m[1].toLowerCase() === "défaite"
                        ? "defaite"
                        : m[1].toLowerCase(),

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

            console.log(
                "⚠️ Aucun duel actif pour ce groupe."
            );

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

            console.log(
                "⚠️ Aucun résultat trouvé dans le pavé RazorX."
            );

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

            const fiche =
                await getFicheByPseudo(act.tag);

            if (!fiche) {

                console.log(
                    `⚠️ Joueur introuvable pour ${act.tag}`
                );

                continue;
            }

            const ancien =
                Number(fiche[act.stat]) || 0;

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

            const fiche =
                await getFicheByPseudo(r.tag);

            if (!fiche) {

                console.log(
                    `⚠️ Joueur introuvable pour résultat : ${r.tag}`
                );

                continue;
            }

            let exp =
                Number(fiche.exp) || 0;

            let talent =
                Number(fiche.talent) || 0;

            let golds =
                Number(fiche.golds) || 0;

            let victoires =
                Number(fiche.victoires) || 0;

            let defaites =
                Number(fiche.defaites) || 0;

            // ==================================================
            // VICTOIRE
            // ==================================================

            if (r.type === "victoire") {

                victoires += 1;

                if (r.symbol === "✅") {

                    exp += 10;
                    talent += 1;
                    golds += 10000;

                    console.log(
                        `✅ Bonne performance : ${fiche.pseudo}`
                    );

                } else if (r.symbol === "❌") {

                    exp = Math.max(
                        0,
                        exp - 10
                    );

                    talent = Math.max(
                        0,
                        talent - 1
                    );

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

                if (r.symbol === "✅") {

                    exp += 10;
                    talent += 1;
                    golds += 10000;

                    console.log(
                        `✅ Bonne performance : ${fiche.pseudo}`
                    );

                } else if (r.symbol === "❌") {

                    exp = Math.max(
                        0,
                        exp - 10
                    );

                    talent = Math.max(
                        0,
                        talent - 1
                    );

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

        await ovl.sendMessage(
            ms_org,
            {
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
            },
            { quoted: ms }
        );

    } catch (err) {

        console.error(
            "❌ Erreur RAZORX AUTO :",
            err
        );
    }
});


/* ================= +PAVEMODO ================= */

ovlcmd({
    nom_cmd: "pavemodo",
    classe: "Duel",
    react: "📄",
    desc: "Envoie le pavé RazorX™ vide."
}, async (ms_org, ovl) => {

    const pave = `. ◥◣              🌀JUMP™🔆
▔▔▔▔▔▔▔▔▔▔▔◥◣▔▔▔▔▔▔▔

▶️Match Live:
🎮j1 : Strikes: 0 | attaques: 0
🎮j2 : Strikes: 0 | attaques: 0

▔▔▔▔▔▔▔▔▔▔▔▔░▔▔▔▔▔▔▔▔
🏆RESULTAT:
◥◣victoire :
◥◣défaite :
👤Arbitre:
⏱️Durée:

╰───────────────────
R A Z O R X™⚡`;

    await ovl.sendMessage(
        ms_org,
        { text: pave }
    );
});
