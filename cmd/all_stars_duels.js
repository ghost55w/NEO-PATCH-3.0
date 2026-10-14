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


/* ================= PARSER RESULTAT MATCH NSL ================= */

function parseResultatNSL(text) {

    if (!/R[ÉE]SULTAT\s+MATCH\s+NSL/i.test(text || "")) {
        return null;
    }

    const resultat = {
        match: "",
        winner: null,
        loser: null,
        arbitre: "",
        tours: null
    };

    const lignes = text
        .split("\n")
        .map(ligne => ligne.replace(/\*/g, "").trim())
        .filter(Boolean);

    for (const ligne of lignes) {

        const matchType = ligne.match(/Match\s*:\s*(.*)/i);

        if (matchType) {
            resultat.match = matchType[1].trim();
            continue;
        }

        const winner = ligne.match(/Winner\s*:\s*(.*)/i);

        if (winner) {

            const valeur = winner[1].trim();
            const symbole = valeur.match(/(✅|❌)\s*$/u);

            resultat.winner = {
                pseudo: valeur
                    .replace(/\s*(✅|❌)\s*$/u, "")
                    .trim(),
                symbole: symbole ? symbole[1] : null
            };

            continue;
        }

        const loser = ligne.match(/Loser\s*:\s*(.*)/i);

        if (loser) {

            resultat.loser = {
                pseudo: loser[1]
                    .replace(/\s*(✅|❌)\s*$/u, "")
                    .trim()
            };

            continue;
        }

        const arbitre = ligne.match(/Arbitre\s*:\s*(.*)/i);

        if (arbitre) {
            resultat.arbitre = arbitre[1].trim();
            continue;
        }

        const toursMatch = ligne.match(/Tours\s*:\s*(\d+)/i);

        if (toursMatch) {
            resultat.tours = Number(toursMatch[1]);
        }
    }

    if (
        !resultat.match ||
        !resultat.winner?.pseudo ||
        !resultat.loser?.pseudo ||
        resultat.tours === null
    ) {
        return null;
    }

    return resultat;
}


/* ================= RAZORX AUTO — RESULTAT NSL ================= */

ovlcmd({
    nom: "razorx_auto",
    isfunc: true
}, async (ms_org, ovl, { texte, ms }) => {

    if (!texte || !/R[ÉE]SULTAT\s+MATCH\s+NSL/i.test(texte)) {
        return;
    }

    try {

        const resultat = parseResultatNSL(texte);

        if (!resultat) {
            console.log("⚠️ Pavé NSL incomplet ou invalide.");
            return;
        }

        // ==============================================
        // 🆚 TYPE DE MATCH
        // ==============================================

        const typeMatch = normalizeTag(resultat.match);

        if (!["amical", "saison"].includes(typeMatch)) {

            console.log(
                `⚠️ Type de match non reconnu : ${resultat.match}`
            );

            return;
        }

        // Vérifier que Winner et Loser sont différents
        if (
            normalizeTag(resultat.winner.pseudo) ===
            normalizeTag(resultat.loser.pseudo)
        ) {
            console.log(
                "❌ Winner et Loser ne peuvent pas être le même joueur."
            );
            return;
        }

        // ==============================================
        // 🎴 RECHERCHE DES FICHES ALL STARS
        // ==============================================

        const ficheWinner = await getFicheByPseudo(
            resultat.winner.pseudo
        );

        const ficheLoser = await getFicheByPseudo(
            resultat.loser.pseudo
        );

        const ficheArbitre = resultat.arbitre
            ? await getFicheByPseudo(resultat.arbitre)
            : null;

        if (!ficheWinner) {

            console.log(
                `❌ Fiche Winner introuvable : ${resultat.winner.pseudo}`
            );

            return;
        }

        if (!ficheLoser) {

            console.log(
                `❌ Fiche Loser introuvable : ${resultat.loser.pseudo}`
            );

            return;
        }

        // ==============================================
        // 🥇 WINNER : +1 VICTOIRE
        // ==============================================

        const victoires =
            Number(ficheWinner.victoires) || 0;

        await setfiche(
            "victoires",
            victoires + 1,
            ficheWinner.jid
        );

        // ==============================================
        // 🎁 RÉCOMPENSE DU WINNER
        // ==============================================

        let recompenseWinner = false;

        if (resultat.winner.symbole === "✅") {

            const exp =
                Number(ficheWinner.exp) || 0;

            const golds =
                Number(ficheWinner.golds) || 0;

            const talents =
                Number(ficheWinner.talent) || 0;

            await setfiche(
                "golds",
                golds + 10000,
                ficheWinner.jid
            );

            await setfiche(
                "exp",
                exp + 10,
                ficheWinner.jid
            );

            await setfiche(
                "talent",
                talents + 10,
                ficheWinner.jid
            );

            recompenseWinner = true;

            console.log(
                `🎁 ${ficheWinner.pseudo} : +10 000 Golds, +10 EXP, +10 talents, +1 victoire`
            );

        } else if (resultat.winner.symbole === "❌") {

            console.log(
                `🏆 ${ficheWinner.pseudo} : +1 victoire, aucune récompense`
            );

        } else {

            console.log(
                `⚠️ Emoji de performance absent : ${ficheWinner.pseudo}. Victoire enregistrée sans récompense.`
            );
        }

        // ==============================================
        // 🥈 LOSER : +1 DÉFAITE
        // ==============================================

        const defaites =
            Number(ficheLoser.defaites) || 0;

        await setfiche(
            "defaites",
            defaites + 1,
            ficheLoser.jid
        );

        // ==============================================
        // ⚠️ PÉNALITÉ SI MOINS DE 3 TOURS
        // ==============================================

        let penaliteLoser = false;

        if (resultat.tours < 3) {

            const exp = Math.max(
                0,
                (Number(ficheLoser.exp) || 0) - 10
            );

            const talents = Math.max(
                0,
                (Number(ficheLoser.talent) || 0) - 10
            );

            await setfiche(
                "exp",
                exp,
                ficheLoser.jid
            );

            await setfiche(
                "talent",
                talents,
                ficheLoser.jid
            );

            penaliteLoser = true;

            console.log(
                `⚠️ ${ficheLoser.pseudo} : +1 défaite, -10 EXP, -10 talents (${resultat.tours} tour(s))`
            );

        } else {

            console.log(
                `📉 ${ficheLoser.pseudo} : +1 défaite, aucune pénalité (${resultat.tours} tours)`
            );
        }

        // ==============================================
        // 👑 RÉCOMPENSE DE L'ARBITRE
        // ==============================================

        let recompenseArbitre = false;

        if (ficheArbitre) {

            const goldsArbitre =
                Number(ficheArbitre.golds) || 0;

            await setfiche(
                "golds",
                goldsArbitre + 15000,
                ficheArbitre.jid
            );

            recompenseArbitre = true;

            console.log(
                `👑 ${ficheArbitre.pseudo} : +15 000 Golds pour l'arbitrage`
            );

        } else if (resultat.arbitre) {

            console.log(
                `⚠️ Aucune fiche All Stars trouvée pour l'arbitre : ${resultat.arbitre}`
            );
        }

        // ==============================================
        // ✅ CONFIRMATION
        // ==============================================

        await ovl.sendMessage(
            ms_org,
            {
                text:
                    `🏆 *RÉSULTAT MATCH NSL ENREGISTRÉ*\n` +
                    `▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n\n` +
                    `🆚 Match : ${resultat.match}\n` +
                    `🥇 Winner : ${ficheWinner.pseudo}\n` +
                    `🏆 Victoires : +1\n` +
                    (
                        recompenseWinner
                            ? `🎁 Récompenses Winner : +10 000 Golds, +10 EXP, +10 talents\n`
                            : `🎁 Récompenses Winner : aucune\n`
                    ) +
                    `🥈 Loser : ${ficheLoser.pseudo}\n` +
                    `📉 Défaites : +1\n` +
                    (
                        penaliteLoser
                            ? `⚠️ Pénalité Loser : -10 EXP, -10 talents\n`
                            : `✅ Aucune pénalité pour le Loser\n`
                    ) +
                    `👤 Arbitre : ${resultat.arbitre || "Non renseigné"}\n` +
                    (
                        recompenseArbitre
                            ? `👑 Récompense Arbitre : +15 000 Golds\n`
                            : `👑 Récompense Arbitre : aucune\n`
                    ) +
                    `🕒 Tours : ${resultat.tours}\n\n` +
                    `╰───────────────────\n` +
                    `R A Z O R X™⚡`
            },
            ms ? { quoted: ms } : {}
        );

        console.log(
            `🏁 Match NSL terminé : ${ficheWinner.pseudo} vs ${ficheLoser.pseudo}`
        );

    } catch (err) {

        console.error(
            "❌ Erreur RAZORX AUTO NSL :",
            err
        );
    }
});


/* ================= +PAVEMODO ================= */

ovlcmd({
    nom_cmd: "pavemodo",
    classe: "Duel",
    react: "📄",
    desc: "Envoie le pavé de résultat du match NSL."
}, async (ms_org, ovl) => {

    const pave = `.  *◥◣🏆RÉSULTAT MATCH NSL🏆*
▔▔▔▔▔▔▔▔▔▔▔◥◣▔▔▔▔▔▔▔
*🆚Match:*
*👍🏼Winner:*
*👎🏼Loser :*
*👤Arbitre:*
*🕒Tours:*

╰───────────────────
                          R A Z O R X™⚡`;

    await ovl.sendMessage(ms_org, {
        text: pave
    });
});

