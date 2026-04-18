// ===============================
// 📦 IMPORTS
// ===============================
const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

// ===============================
// 📊 STATE GLOBAL
// ===============================
const matchsActifs = new Map();

// ===============================
// 📏 CONSTANTES TERRAIN
// ===============================
const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };

const POSITION_POSTES = {
    AG: { zoneX: "aile gauche", ligne: "attaque" },
    AC: { zoneX: "axe", ligne: "attaque" },
    AD: { zoneX: "aile droite", ligne: "attaque" },

    MG: { zoneX: "aile gauche", ligne: "milieu" },
    MC: { zoneX: "axe", ligne: "milieu" },
    MD: { zoneX: "aile droite", ligne: "milieu" },

    DG: { zoneX: "aile gauche", ligne: "defense" },
    DC: { zoneX: "axe", ligne: "defense" },
    DD: { zoneX: "aile droite", ligne: "defense" }
};

// ===============================
// 🔍 NORMALISATION
// ===============================
const pureName = str => {
    if (!str) return "";
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
};

// ===============================
// 🔎 FIND PLAYER DB
// ===============================
function findBlueLockPlayer(inputName) {
    if (!inputName) return null;

    const players = Object.values(cardsBlueLock);
    const input = pureName(inputName);

    return players.find(p =>
        pureName(p.name).includes(input)
    ) || null;
}

// ===============================
// 📋 PARSER LINEUP
// ===============================
function parseLineupFull(text) {
    const lignes = text.split("\n");
    const joueurs = [];

    for (const ligne of lignes) {
        if (!ligne.includes("👤")) continue;

        const num = ligne.match(/^(\d+)/)?.[1];
        const poste = ligne.match(/\(([A-Z]{2})\)/)?.[1];
        const note = ligne.match(/\((\d{1,3})\)$/)?.[1];

        let nom = ligne
            .replace(/^(\d+)/, "")
            .replace(/👤/, "")
            .replace(/\([A-Z]{2}\)/, "")
            .replace(/\(\d+\)$/, "")
            .trim();

        joueurs.push({
            numero: parseInt(num),
            poste,
            nom,
            note: parseInt(note)
        });
    }

    if (!joueurs.length) return null;

    const teamName = text.match(/SQUAD⚽🥅:\s*(.+)/i)?.[1]?.trim();

    return { teamName, joueurs };
}

// ===============================
// ✅ VALIDATION LINEUP
// ===============================
async function verifierLineupEtChargerData(joueurs) {

    const result = [];

    for (const j of joueurs) {

        const data = findBlueLockPlayer(j.nom);

        if (!data) {
            return {
                ok: false,
                erreur: `❌ Joueur introuvable: ${j.nom}`
            };
        }

        const poste = POSITION_POSTES[j.poste];

        result.push({
            position: j.poste,
            nom: data.name,
            data,
            note: j.note,
            ligne: poste?.ligne || "milieu",
            zoneX: poste?.zoneX || "axe",
            zoneY: null,
            visavis: null
        });
    }

    return { ok: true, joueurs: result };
}

// ===============================
// 👤 USER LOOKUP
// ===============================
async function trouverUser(nom) {
    const all = await TeamFunctions.getAllTeams();
    if (!all) return null;

    const clean = nom.toLowerCase().trim();

    return all.find(p =>
        (p.users || "").toLowerCase().trim() === clean
    ) || null;
}

// ===============================
// 🎮 COMMANDE MATCH
// ===============================
ovlcmd({
    nom_cmd: "match⚽",
    classe: "BLUELOCK⚽",
    react: "⚽",
    desc: "Créer un match Blue Lock"
}, async (ms, ovl) => {

    const chat = ms.key.remoteJid;
    const sender = ms.key.participant;

    if (matchsActifs.has(chat)) {
        return ovl.sendMessage(chat, {
            text: "⚠️ Match déjà en cours"
        });
    }

    await ovl.sendMessage(chat, {
        text:
`🔷⚽ MATCH BLUE LOCK

🥅👤Team 1:
🥅👤Team 2:
🥅🧤Gardien:
⌛ Score win:`
    });

    matchsActifs.set(chat, {
        etat: "attente_fiche",
        createur: sender
    });
});

// ===============================
// 📋 DETECTION FICHE
// ===============================
async function verifierFiche(message, chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    if (!message.includes("MATCH BLUE LOCK")) return;

    const team1 = message.match(/Team 1:\s*(.+)/)?.[1];
    const team2 = message.match(/Team 2:\s*(.+)/)?.[1];

    if (!team1 || !team2) return;

    match.team1Nom = team1.trim();
    match.team2Nom = team2.trim();

    match.equipe1 = false;
    match.equipe2 = false;

    await ovl.sendMessage(chat, {
        text: "📢 Envoyez vos lineups"
    });

    match.etat = "attente_lineup";
}

// ===============================
// 📩 MESSAGE MATCH (SETUP ONLY)
// ===============================
async function messageMatch(ms, ovl) {

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return;

    const text =
        ms.message?.conversation ||
        ms.message?.extendedTextMessage?.text ||
        "";

    if (!text) return;

    // 📋 LINEUP
    if (match.etat === "attente_lineup") {

        const parsed = parseLineupFull(text);
        if (!parsed) return;

        const joueurs = parsed.joueurs.map(j => ({
            poste: j.poste,
            nom: j.nom,
            note: j.note
        }));

        const check = await verifierLineupEtChargerData(joueurs);

        if (!check.ok) {
            return ovl.sendMessage(chat, { text: check.erreur });
        }

        if (!match.equipe1) {
            match.lineup1 = check.joueurs;
            match.equipe1 = true;

            return ovl.sendMessage(chat, {
                text: `✅ ${match.team1Nom} prêt`
            });
        }

        if (!match.equipe2) {
            match.lineup2 = check.joueurs;
            match.equipe2 = true;

            return ovl.sendMessage(chat, {
                text: `✅ ${match.team2Nom} prêt`
            });
        }
    }

    // 🚀 LANCEMENT MATCH
    if (match.equipe1 && match.equipe2 && !match.started) {

        match.started = true;

        await ovl.sendMessage(chat, {
            text: "⏳ Match démarre..."
        });

        setTimeout(() => lancerMatch(chat, ovl), 3000);
    }
}

// ===============================
// 🚀 LANCEMENT MATCH
// ===============================
async function lancerMatch(chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    match.etat = "en_cours";

    const teamStart = Math.random() < 0.5
        ? match.team1Nom
        : match.team2Nom;

    match.possession = teamStart;

    await ovl.sendMessage(chat, {
        text: `⚽ KICKOFF → ${teamStart}`
    });
}

// ===============================
// 📦 EXPORTS
// ===============================
module.exports = {
    matchsActifs,
    messageMatch,
    verifierFiche,
    lancerMatch,
    parseLineupFull,
    verifierLineupEtChargerData,
    findBlueLockPlayer,
    pureName
};
