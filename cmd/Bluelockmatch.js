const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
const ACTIONS_MAP = {
    tir: ["tir", "frappe"],
    passe: ["passe"],

    deplacement: [
        "conduit", "conduite",
        "accélère", "acceleration",
        "fonce", "vmax", "course",
        "se déplace", "avance", "court"
    ],

    dribble: ["dribble"] // uniquement vrai dribble
};
/* ===============================
MOTS CLÉS PASSES (FORMULE 🧩)
=================================*/
const MOTS_CLES_PASSES = {
    types: [
        "passe directe",
        "passe enroulée",
        "passe trivela",
        "passe lobbée",
        "centre",
        "passe longue"
    ],
    pied: ["pied gauche", "pied droit"],
    zonesPied: ["pointe de pied", "intérieur du pied", "extérieur du pied", "talon", "tête"],
    directions: ["gauche", "droite", "devant", "derrière", "diagonal sur la gauche", "diagonal sur la droite"],
    hauteurs: ["ras du sol", "50cmh", "1mh", "2mh", "2.5mh"],
    distanceMax: 30,
    zonesCible: ["intérieur pied gauche", "intérieur du pied droit", "extérieur du pied gauche", "extérieur du pied droit", "mi-hauteur 50cmh", "tête", "torse"]
};

/* ===============================
MODELS DES PASSES (COMPARAISON)
=================================*/
const TYPES_PASSES = {
    "passe directe": "passe directe pied droit intérieur du pied ras du sol devant 10m intérieur pied gauche",
    "passe enroulée": "passe enroulée pied droit extérieur du pied 1mh diagonal sur la droite 20m torse",
    "passe trivela": "passe trivela pied droit extérieur du pied ras du sol gauche 15m intérieur pied droit",
    "passe lobbée": "passe lobbée pied droit intérieur du pied 2mh devant 25m tête",
    "centre": "centre pied droit intérieur du pied 2mh diagonal sur la gauche 20m tête",
    "passe longue": "passe longue pied droit intérieur du pied 2mh devant 30m torse"
};

/* ===============================
OUTILS JEU
=================================*/
function parseSquadBlueLock(text) {
    const lignes = text.split("\n");
    const joueurs = [];
    const regex = /\d+\s+👤\(([A-Z]{2})\)\s*([^(]+)\s*\((\d+)\)/i;
    for (const ligne of lignes) {
        const match = ligne.match(regex);
        if (match) {
            joueurs.push({
                position: match[1].trim(),
                nom: match[2].trim(),
                note: parseInt(match[3])
            });
        }
    }
    if (joueurs.length === 0) return null;

    const teamMatch = text.match(/SQUAD⚽🥅:\s*([^\n]+)/i);
    let teamName = teamMatch ? teamMatch[1].trim() : null;
    if (teamName) teamName = teamName.replace(/⚽$/, "").trim();

    return { teamName, joueurs };
}

function normalizeTeamName(name) {
    if (!name) return "";
    return name.replace(/\p{Emoji}/gu, "").trim().toLowerCase();
}

function tirageKickOff() {
    return Math.random() < 0.5 ? "A" : "B";
}

function extraireAction(pave) {
    const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
    if (!ligne) return null;
    return ligne.replace("⚽:", "").trim();
}

function separerSequences(action) {
    return action.split("/").map(s => s.trim());
}


function compterActions(sequence) {
    let total = 0;

    Object.values(ACTIONS_MAP).flat().forEach(a => {
        const r = new RegExp(a, "gi");
        const m = sequence.match(r);
        if (m) total += m.length;
    });

    return total;
}

function verifierCombo(sequence) {
    const combos = sequence.match(/(contrôle|conduit|accélère|tir|frappe|passe|dribble)/gi);
    return !combos || combos.length <= 1;
}

function extraireZones(sequence) {
    const departMatch = sequence.match(/de\s+(A1|A2|B1|B2|C1|C2)/i);
    const arriveeMatch = sequence.match(/vers\s+(A1|A2|B1|B2|C1|C2)|en\s+(A1|A2|B1|B2|C1|C2)/i);
    if (!departMatch || !arriveeMatch) return null;
    const depart = departMatch[1].toUpperCase();
    const arrivee = (arriveeMatch[1] || arriveeMatch[2]).toUpperCase();
    return { depart, arrivee };
}

function distance(z1, z2) {
    return Math.abs(DISTANCES[z1] - DISTANCES[z2]);
}

function perteBalle(match) {
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    match.tourActuel = 0;
    return { ok: false, message: "❌ Pavé invalide. Ballon perdu. Possession adverse." };
}

function parseLineup(texte) {
    const regex = /\s*(\w+)\s*:\s*([^\n\r]+)\s*-\s*(\d+)/gi;
    const joueurs = [];
    let match;
    while ((match = regex.exec(texte)) !== null) {
        joueurs.push({ position: match[1].toUpperCase(), nom: match[2].trim(), note: match[3].trim() });
    }
    return joueurs;
}
function cleanJid(jid) {
    return (jid || "")
        .split(":")[0]
        .split("@")[0]
        .trim();
}

/* ===============================
TROUVER JOUEUR DB
=================================*/
async function trouverUser(nom) {
    const allPlayers = await TeamFunctions.getAllTeams();
    if (!allPlayers) return null;
    const nomClean = nom.toLowerCase().trim();
    for (const player of allPlayers) {
        if ((player.users || "").toLowerCase().trim() === nomClean) return player;
    }
    return null;
}

/* ===============================
TROUVER CARTE JOUEUR
=================================*/
function trouverCarteJoueur(nom) {
    if (!cardsBlueLock) return null;
    const nomClean = nom.toLowerCase().trim();
    for (const carte of cardsBlueLock) {
        if (!carte.nom) continue;
        if (carte.nom.toLowerCase() === nomClean) return carte;
    }
    return null;
}

/* ===============================
COMMANDE MATCH
=================================*/
ovlcmd({
    nom_cmd: "match⚽",
    classe: "BLUELOCK⚽",
    react: "⚽",
    desc: "Créer un match Blue Lock"
}, async (ms_org, ovl, cmd_options) => {
    try {
        const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;
        const sender = ms_org.sender || cmd_options?.auteur_Message || (ms_org.key?.participant || "").split(":")[0];

        if (matchsActifs.has(chat)) {
            return ovl.sendMessage(chat, { text: "⚠️ Un match est déjà en cours dans ce groupe." });
        }

        const ficheMatch = `🔷⚽ *MATCH BLUE LOCK* 🥅

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Team 1:
🥅👤Team 2:
🥅🧤Gardien:
⌛ Score win:

╰───────────────────
▝▝▝       🔷BLUELOCK⚽`;

        await ovl.sendMessage(chat, { text: ficheMatch });

        matchsActifs.set(chat, { etat: "attente_fiche", createur: sender });

    } catch (e) {
        console.log("Erreur match⚽ :", e);
    }
});

/* ===============================
DETECTION FICHE MATCH
=================================*/
async function verifierFiche(message, chat, ovl) {
    const match = matchsActifs.get(chat);
if (!match) return;
    if (!message.includes("MATCH BLUE LOCK") || !message.includes("Team 1")) return;

    const team1 = message.match(/Team 1:\s*([^\n\r]+)/);
    const team2 = message.match(/Team 2:\s*([^\n\r]+)/);
    const gardien = message.match(/Gardien:\s*([^\n\r]+)/);
    const score = message.match(/Score win:\s*([^\n\r]+)/);

    if (!team1 || !team2) return;

    match.team1 = team1[1].trim();
    match.team2 = team2[1].trim();
    match.gardien = gardien ? gardien[1].trim() : "Non défini";
    match.scoreWin = score ? score[1].trim() : "2";

    const j1 = await trouverUser(match.team1);
    const j2 = await trouverUser(match.team2);

    if (!j1 || !j2) {
        await ovl.sendMessage(chat, { text: "❌ L'une des équipes est introuvable dans la base de données." });
        matchsActifs.delete(chat);
        return;
    }

    match.team1Nom = match.team1;
    match.team2Nom = match.team2;
    match.id1 = j1.jid || j1.id;
    match.id2 = j2.jid || j2.id;
    match.etat = "attente_lineup";
    match.equipe1 = null;
    match.equipe2 = null;

    const imagesMatchConfirm = [
        "https://files.catbox.moe/7m2axj.jpg",
        "https://files.catbox.moe/mtou2n.jpg"
    ];

    function randomImage(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const confirmation = `🔷⚽ MATCH BLUE LOCK 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🎙️: ✅ Équipes confirmées !
👤 Team 1: ${match.team1}
👤 Team 2: ${match.team2}
🧤 Gardien: ${match.gardien}

╰───────────────────
               *🔷BLUELOCK⚽*`;

    await ovl.sendMessage(chat, { image: { url: randomImage(imagesMatchConfirm) }, caption: confirmation });

    await ovl.sendMessage(chat, {
        text: `📢 ${match.team1} et ${match.team2} ⏳ *Vous avez 2 minutes pour envoyer votre Lineup dans l'arène, ⚠️Ne tapez pas la commande ici.*`
    });

    match.timerLineup = setTimeout(async () => {
        if (!match.equipe1 || !match.equipe2) {
            matchsActifs.delete(chat);
            await ovl.sendMessage(chat, { text: "❌ Les deux équipes n'ont pas envoyé leurs lineups à temps. Le match est annulé." });
        }
    }, 2 * 60 * 1000);
}

/* ===============================
LECTURE MESSAGES
=================================*/
async function messageMatch(ms, ovl) {
    if (!ms.message) return;

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return;

    // ===============================
    // 🔥 GESTION PAVÉ (PRIORITÉ ABSOLUE)
    // ===============================
    const handled = await handlePaveGame(ms, ovl);
    if (handled) return;

    console.log("📩 MESSAGE REÇU (hors pavé)");

    const rawText =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    if (!rawText) return;

    const safeText = rawText
        .replace(/\u200B/g, "")
        .replace(/\u200E/g, "")
        .replace(/\u200F/g, "")
        .replace(/\r/g, "")
        .trim();

    /* ===============================
    📋 GESTION LINEUP UNIQUEMENT
    =================================*/
    if (match.etat === "attente_lineup") {

        const squadMatch = safeText.match(/SQUAD.*?:\s*([^\n]+)/i);
        if (!squadMatch) return;

        const squadName = squadMatch[1].trim();

        const team1 = normalizeTeamName(match.team1);
        const team2 = normalizeTeamName(match.team2);
        const squad = normalizeTeamName(squadName);

        // ===============================
        // ✅ TEAM 1
        // ===============================
        if (squad === team1 && !match.equipe1) {
            const parsed = parseSquadBlueLock(safeText);
            match.lineup1 = parsed ? parsed.joueurs : [];
            match.equipe1 = true;

            await ovl.sendMessage(chat, {
                text: `✅ Formation confirmée pour *${match.team1Nom}* !`
            });
        }

        // ===============================
        // ✅ TEAM 2
        // ===============================
        if (squad === team2 && !match.equipe2) {
            const parsed = parseSquadBlueLock(safeText);
            match.lineup2 = parsed ? parsed.joueurs : [];
            match.equipe2 = true;

            await ovl.sendMessage(chat, {
                text: `✅ Formation confirmée pour *${match.team2Nom}* !`
            });
        }

        // ===============================
        // 🚀 MATCH PRÊT
        // ===============================
        if (match.equipe1 && match.equipe2 && !match.starting) {
            match.starting = true;

            if (match.timerMatch) clearTimeout(match.timerMatch);

            match.etat = "debut_match";

            const readyText = `⏳ Les deux formations sont prêtes.
Le match commence dans *1 minute* 🥅⚽...`;

            const imagesReady = [
                "https://files.catbox.moe/dlj5z6.jpg",
                "https://files.catbox.moe/fdadd0.jpeg",
                "https://files.catbox.moe/4104s3.jpg"
            ];

            const imageRandom = imagesReady[Math.floor(Math.random() * imagesReady.length)];

            await ovl.sendMessage(chat, {
                image: { url: imageRandom },
                caption: readyText
            });

            match.timerMatch = setTimeout(() => lancerMatch(chat, ovl), 60000);
        }
    }
}


/* ===============================
LANCEMENT MATCH
=================================*/
async function lancerMatch(chat, ovl) {
    const match = matchsActifs.get(chat);
    if (!match) return;
    if (match.kickoffStarted) return;

    match.kickoffStarted = true;

    const premier = Math.random() < 0.5 ? match.team1Nom : match.team2Nom;
    match.possession = premier;
    match.etat = "en_cours";
    match.joueurTour = premier === match.team1Nom ? match.id1 : match.id2;

    const jidStart = match.joueurTour;

    const imagesKickOff = [
        "https://files.catbox.moe/onotk4.jpg",
        "https://files.catbox.moe/kfw0bl.jpg"
    ];

    await ovl.sendMessage(chat, {
        image: { url: imagesKickOff[Math.floor(Math.random() * imagesKickOff.length)] },
        caption: `🎙️⚽: KICK OFF 🥅‼️ @${premier} commence !\n⚠️ Envoie ton pavé ⚽`,
        mentions: [jidStart]
    });

    // ⏱️ timer 1er joueur
    match.timerKickoff = setTimeout(async () => {
    await ovl.sendMessage(chat, {
        text: `⏰ @${premier} LATENCE OUT! ❌.`,
        mentions: [jidStart]
    });
}, 6 * 60 * 1000);
} 

/* ===============================
LECTURE DES PAVÉS - TOUR DE CONTRÔLE
=================================*/
async function handlePaveGame(ms, ovl) {
    if (!ms.message) return false;

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return false;

    if (match.etat !== "en_cours") return false;

    const rawText =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    const text = rawText.trim();
    if (!text) return false;

    // =========================
    // 🔐 VALIDATION PAVÉ BLUELOCK
    // =========================
    const isBlueLockPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔷BLUELOCK⚽🥅");

    if (!isBlueLockPave) return false;

    // =========================
    // 👤 CHECK JOUEUR TOUR
    // =========================
function cleanJid(jid) {
    return (jid || "")
        .split(":")[0]
        .trim();
}

const sender = cleanJid(ms.key.participant || ms.key.remoteJid);
const joueurTour = cleanJid(match.joueurTour);

// 🔍 DEBUG
console.log("🧪 SENDER:", sender);
console.log("🧪 TOUR:", joueurTour);

if (sender !== joueurTour) {
    await ovl.sendMessage(chat, {
        text: "❌ Ce n’est pas ton tour de jouer !"
    });
    return true;
} 

    // =========================
    // 📦 PARSING PAVÉ
    // =========================
    const dialogueMatch = text.match(/💬:\s*([\s\S]*?)(?=⚽:|🔷BLUELOCK⚽🥅|$)/i);
    const actionMatch = text.match(/⚽:\s*([\s\S]*?)(?=🔷BLUELOCK⚽🥅|$)/i);

    const dialogue = dialogueMatch ? dialogueMatch[1].trim() : "";
    const action = actionMatch ? actionMatch[1].trim() : "";

    // =========================
    // ❌ PAVÉ VIDE
    // =========================
    if (!dialogue && !action) {
        await ovl.sendMessage(chat, {
            text: "❌ Aucune action détectée dans ce pavé !"
        });

        await switchJoueur(match, chat, ovl);
        return true;
    }

    // =========================
    // ⚽ ACTION
    // =========================
    if (action) {
        await ovl.sendMessage(chat, {
            text: `⚽ Action validée:\n${action}`
        });
    } else {
        await ovl.sendMessage(chat, {
            text: "⚠️ Aucune action détectée."
        });
    }

    // =========================
    // 💬 DIALOGUE
    // =========================
    if (dialogue) {
        await ovl.sendMessage(chat, {
            text: `💬 ${dialogue}`
        });
    }

    // =========================
    // 🔁 SWITCH JOUEUR (IMPORTANT)
    // =========================
    const isP1 = match.joueurTour === match.id1;

    const nextJoueur = isP1 ? match.id2 : match.id1;
    const nextNom = isP1 ? match.team2Nom : match.team1Nom;

    match.joueurTour = nextJoueur;

    await ovl.sendMessage(chat, {
        text: `➡️ À toi de jouer @${nextNom}`,
        mentions: [nextJoueur]
    });

    // =========================
    // ⏱️ TIMER TOUR
    // =========================
    if (match.timerPave) clearTimeout(match.timerPave);

    match.timerPave = setTimeout(async () => {
        await ovl.sendMessage(chat, {
            text: `⏰ @${nextNom} temps écoulé ❌`,
            mentions: [nextJoueur]
        });
    }, 6 * 60 * 1000);

    return true;
}


/* ===============================
COMMANDE +STOPMATCH⚽
=================================*/ 
ovlcmd({
    nom_cmd: "stopmatch⚽",
    classe: "BLUELOCK⚽",
    react: "⛔",
    desc: "Arrêter le match en cours dans le groupe"
}, async (ms_org, ovl, cmd_options) => {
    try {

        // ✅ ms_org EST DÉJÀ LE JID
        const chat = ms_org;

        const match = matchsActifs.get(chat);

        if (!match) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        // ===============================
        // ⛔ STOP TOUS LES TIMERS
        // ===============================
        if (match.timerPave) clearTimeout(match.timerPave);
        if (match.timerTour) clearTimeout(match.timerTour);
        if (match.timerKickoff) clearTimeout(match.timerKickoff);
        if (match.timerAction) clearTimeout(match.timerAction);

        // BONUS sécurité
        match.timerPave = null;
        match.timerTour = null;
        match.timerKickoff = null;
        match.timerAction = null;

        // ===============================
        // 🧨 RESET MATCH COMPLET
        // ===============================
        match.etat = "arrete";
        match.kickoffStarted = false;

        // ===============================
        // 🗑 SUPPRESSION
        // ===============================
        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text: `⛔ Le match Blue Lock a été arrêté avec succès !`
        });

    } catch (e) {
        console.error("❌ Erreur stopmatch :", e);

        const chat = ms_org;

        await ovl.sendMessage(chat, {
            text: "❌ Erreur lors de l'arrêt du match."
        });
    }
});

module.exports = { messageMatch, verifierFiche };
