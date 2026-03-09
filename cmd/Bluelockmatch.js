const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
const ACTIONS = ["contrôle", "conduit", "accélère", "tir", "frappe", "passe", "dribble"];

/* ===============================
OUTILS JEU
=================================*/
function parseSquadBlueLock(text) {
    const lignes = text.split("\n");
    const joueurs = [];

    const regex = /\d+\s+👤(?:\([A-Z]{2}\))?\s*([^(]+)\s*\((\d+)\)/i;

    for (const ligne of lignes) {
        const match = ligne.match(regex);
        if (match) {
            joueurs.push(match[1].trim());
        }
    }

    if (joueurs.length === 0) return null;

    const fiche = {};
    joueurs.forEach((j, i) => {
        fiche[`joueur${i + 1}`] = j;
    });

    return fiche;
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
    ACTIONS.forEach(a => {
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
    return {
        ok: false,
        message: "❌ Pavé invalide. Ballon perdu. Possession adverse."
    };
}

function parseLineup(texte) {
    const regex = /\s*(\w+)\s*:\s*([^\n\r]+)\s*-\s*(\d+)/gi;
    const joueurs = [];
    let match;
    while ((match = regex.exec(texte)) !== null) {
        joueurs.push({
            position: match[1].toUpperCase(),
            nom: match[2].trim(),
            note: match[3].trim()
        });
    }
    return joueurs;
}

/* ===============================
TROUVER JOUEUR DB
=================================*/
async function trouverUser(nom) {
    const allPlayers = await TeamFunctions.getAllTeams();
    if (!allPlayers) return null;

    const nomClean = nom.toLowerCase().trim();

    for (const player of allPlayers) {
        if ((player.users || "").toLowerCase().trim() === nomClean) {
            return player;
        }
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
        const chat = ms_org;
        const sender = cmd_options?.auteur_Message;

        if (matchsActifs.has(chat)) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Un match est déjà en cours dans ce groupe."
            });
        }

        const ficheMatch = `🔷⚽ *MATCH BLUE LOCK* 🥅

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1:
🥅👤Joueur2:
🥅🧤Gardien:
⌛ Score win:

╰───────────────────
▝▝▝       🔷BLUELOCK⚽`;

        await ovl.sendMessage(chat, { text: ficheMatch });

        matchsActifs.set(chat, {
            etat: "attente_fiche",
            createur: sender
        });

    } catch (e) {
        console.log("Erreur match⚽ :", e);
    }
});

/* ===============================
DETECTION FICHE MATCH
=================================*/
async function verifierFiche(message, chat, ovl) {
    const match = matchsActifs.get(chat);
    if (!match || match.etat !== "attente_fiche") return;
    if (!message.includes("MATCH BLUE LOCK") || !message.includes("Joueur1")) return;

    const joueur1 = message.match(/Joueur1:\s*([^\n\r]+)/);
    const joueur2 = message.match(/Joueur2:\s*([^\n\r]+)/);
    const gardien = message.match(/Gardien:\s*([^\n\r]+)/);
    const score = message.match(/Score win:\s*([^\n\r]+)/);

    if (!joueur1 || !joueur2) return;

    match.joueur1 = joueur1[1].trim();
    match.joueur2 = joueur2[1].trim();
    match.gardien = gardien ? gardien[1].trim() : "Non défini";
    match.scoreWin = score ? score[1].trim() : "2";

    const j1 = await trouverUser(match.joueur1);
    const j2 = await trouverUser(match.joueur2);

    if (!j1 || !j2) {
        await ovl.sendMessage(chat, {
            text: "❌ L'un des joueurs est introuvable dans la base de données de l'équipe."
        });
        matchsActifs.delete(chat);
        return;
    }

    match.id1 = j1.id;
    match.id2 = j2.id;
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
🎙️: ✅ Joueurs confirmés !
👤 ${match.joueur1}
👤 ${match.joueur2}
🧤 Gardien: ${match.gardien}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
⚠️ Chaque joueur doit maintenant envoyer son lineup, les remplacements ne sont autorisés que après un but où après la fin d'une possession d'attaque.

╰───────────────────
🔷BLUELOCK⚽`;

    await ovl.sendMessage(
        chat,
        {
            image: { url: randomImage(imagesMatchConfirm) },
            caption: confirmation
        }
    );
}

// Fonction qui intercepte le lineup affiché et l'enregistre dans le match si nécessaire
async function enregistrerLineupMatch(sender, chat, ficheLineup) {
    const match = matchsActifs.get(chat);
    if (!match || match.etat !== "attente_lineup") return;

    // Transforme le lineup en tableau de positions
    const positionsJoueurs = [];
    for (let i = 1; i <= 15; i++) {
        positionsJoueurs.push(ficheLineup[`joueur${i}`] || "aucun");
    }

    // Détermine si c'est l'équipe 1 ou 2
    if (sender === match.id1) {
        match.equipe1 = positionsJoueurs;
        await ovl.sendMessage(chat, { text: `✅ Lineup enregistré pour ${match.joueur1} ! (${positionsJoueurs.length} joueurs)` });
    } else if (sender === match.id2) {
        match.equipe2 = positionsJoueurs;
        await ovl.sendMessage(chat, { text: `✅ Lineup enregistré pour ${match.joueur2} ! (${positionsJoueurs.length} joueurs)` });
    } else return;

    // Si les deux lineups sont prêts, on passe à la phase début de match
    if (match.equipe1 && match.equipe2) {
        match.etat = "debut_match";
        await ovl.sendMessage(chat, { text: "⏳ Les deux formations sont prêtes. Le match commence dans *1 minute* 🥅⚽..." });
        setTimeout(() => lancerMatch(chat, ovl), 60000);
    }
}

/* ===============================
LANCEMENT MATCH
=================================*/
async function lancerMatch(chat, ovl) {
    const match = matchsActifs.get(chat);
    if (!match) return;

    const premier = Math.random() < 0.5 ? match.joueur1 : match.joueur2;
    match.possession = premier;
    match.etat = "en_cours";

    await ovl.sendMessage(chat, {
        text: `🏟️ *MATCH BLUE LOCK* ⚽ Le coup de sifflet retentit !

🔥 ${premier} débute avec la possession !

KICK OFF ! ⚽`
    });
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
        const chat = ms_org;
        const match = matchsActifs.get(chat);

        if (!match) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text: `⛔ Le match Blue Lock en cours a été arrêté!`
        });

    } catch (e) {
        console.error("❌ Erreur commande +stopmatch⚽ :", e);
        await ovl.sendMessage(chat, {
            text: "❌ Une erreur est survenue lors de l'arrêt du match."
        });
    }
});

/* ===============================
LECTURE MESSAGES
=================================*/
async function messageMatch(ms, ovl) {
    if (!ms.message) return;

    const chat = ms.key.remoteJid;
    const sender = ms.key.participant || ms.key.remoteJid;

    const text =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        "";

    if (!text) return;

    // Détection fiche match
    await verifierFiche(text, chat, ovl);

    const match = matchsActifs.get(chat);
    if (!match || match.etat !== "attente_lineup") return;

    // Détection du squad affiché par +lineup⚽
    if (text.includes("👥SQUAD⚽🥅")) {

        const ficheLineup = parseSquadBlueLock(text);
        if (!ficheLineup) return;

        await enregistrerLineupMatch(sender, chat, ficheLineup);
    }
}

module.exports = { messageMatch, verifierFiche };
