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

    // Capture : position + nom + note
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

    // 🔹 EXTRACTION NOM TEAM (on supprime uniquement ⚽)
    const teamMatch = text.match(/SQUAD⚽🥅:\s*([^\n]+)/i);
    let teamName = teamMatch ? teamMatch[1].trim() : null;

    if (teamName) {
        teamName = teamName.replace(/⚽$/, "").trim();
    }

    return {
        teamName,
        joueurs
    };
}

function normalizeTeamName(name) {
    if (!name) return "";
    // Supprime tous les emojis et espaces en début/fin
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

function extraireAction(pave) {
    const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
    if (!ligne) return null;
    return ligne.replace("⚽:", "").trim();
}

/* ===============================
TROUVER CARTE JOUEUR
=================================*/
function trouverCarteJoueur(nom) {

    if (!cardsBlueLock) return null;

    const nomClean = nom.toLowerCase().trim();

    for (const carte of cardsBlueLock) {

        if (!carte.nom) continue;

        if (carte.nom.toLowerCase() === nomClean) {
            return carte;
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
        // Récupère correctement le chat et l'auteur
        const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;
        const sender = ms_org.sender || cmd_options?.auteur_Message || (ms_org.key?.participant || "").split(":")[0];

        if (matchsActifs.has(chat)) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Un match est déjà en cours dans ce groupe."
            });
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
        await ovl.sendMessage(chat, {
            text: "❌ L'une des équipes est introuvable dans la base de données de l'équipe."
        });
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

    await ovl.sendMessage(chat, {
        image: { url: randomImage(imagesMatchConfirm) },
        caption: confirmation
    });

    await ovl.sendMessage(chat, {
        text: `📢 ${match.team1} et ${match.team2}
⏳ *Vous avez 2 minutes pour envoyer votre Lineup dans l'arène, ⚠️Ne tapez pas la commande ici.*`
    });

    // 🔹 Timer d'annulation si pas de lineup après 2 minutes
    match.timerLineup = setTimeout(async () => {
        if (!match.equipe1 || !match.equipe2) {
            matchsActifs.delete(chat);
            await ovl.sendMessage(chat, {
                text: "❌ Les deux équipes n'ont pas envoyé leurs lineups à temps. Le match est annulé."
            });
        }
    }, 2 * 60 * 1000); // 2 minutes
}


/* ===============================
LECTURE MESSAGES
=================================*/
async function messageMatch(ms, ovl) {

    if (!ms.message) return;

    const chat = ms.key.remoteJid;

    // récupérer texte ou caption
    const text =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    if (!text) return;

    // vérifier fiche match
    await verifierFiche(text, chat, ovl);

    const match = matchsActifs.get(chat);
    if (!match || match.etat !== "attente_lineup") return;

    // lire le nom de squad
    const squadMatch = text.match(/SQUAD.*?:\s*([^\n]+)/i);
    if (!squadMatch) return;

    const squadName = squadMatch[1].trim();

    const team1 = normalizeTeamName(match.team1);
    const team2 = normalizeTeamName(match.team2);
    const squad = normalizeTeamName(squadName);

    // TEAM 1
    if (squad === team1 && !match.equipe1) {

        match.equipe1 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation confirmée pour *${match.team1Nom}* !`
        });
    }

    // TEAM 2
    else if (squad === team2 && !match.equipe2) {

        match.equipe2 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation confirmée pour *${match.team2Nom}* !`
        });
    }

    // si les deux équipes sont prêtes
    if (match.equipe1 && match.equipe2) {
    if (match.timerMatch) clearTimeout(match.timerMatch);
    match.etat = "debut_match";

    // Texte à afficher
    const readyText = `⏳ Les deux formations sont prêtes.
Le match commence dans *1 minute* 🥅⚽...`;

    // Liste d'images possibles
    const imagesReady = [
        "https://files.catbox.moe/dlj5z6.jpg",
        "https://files.catbox.moe/fdadd0.jpeg",
        "https://files.catbox.moe/4104s3.jpg"
    ];

    // Choisir une image aléatoire
    const imageRandom = imagesReady[Math.floor(Math.random() * imagesReady.length)];

    // Envoyer le message en caption
    await ovl.sendMessage(chat, {
        image: { url: imageRandom },
        caption: readyText
    });

    // Lancer le match après 1 minute
    match.timerMatch = setTimeout(() => lancerMatch(chat, ovl), 60000);
    }
// 👇 LECTURE DES PAVÉS GAMEPLAY
    await lirePaveAction(ms, ovl);
} 

/* ===============================
LANCEMENT MATCH
=================================*/
async function lancerMatch(chat, ovl) {
    const match = matchsActifs.get(chat);
    if (!match) return;

    // Choisir aléatoirement qui commence
    const premier = Math.random() < 0.5 ? match.team1Nom : match.team2Nom;
    match.possession = premier;
    match.etat = "en_cours";

    // Nouveau texte de kickoff
    const kickoffText = `🎙️⚽: KICK OFF🥅‼️ ${premier} débute avec la possession...`;

    // Tableau d'images possibles
    const imagesKickoff = [
        "https://files.catbox.moe/onotk4.jpg",
        "https://files.catbox.moe/kfw0bl.jpg"
    ];

    // Choisir une image aléatoire
    const imageRandom = imagesKickoff[Math.floor(Math.random() * imagesKickoff.length)];

    // déterminer le jid du joueur qui commence
const jidStart = premier === match.team1Nom ? match.id1 : match.id2;

await ovl.sendMessage(chat, {
    image: { url: imageRandom },
    caption: `🎙️⚽: KICK OFF🥅‼️ @${premier} débute avec la possession...`,
    mentions: [jidStart]
});

    // 🔹 Timer pour que le joueur en possession envoie son pavé : 6 minutes
    match.timerPave = setTimeout(async () => {
        const jidStart = premier === match.team1Nom ? match.id1 : match.id2;

await ovl.sendMessage(chat, {
    text: `⏰ @${premier} LATENCE OUT! ❌.`,
    mentions: [jidStart]
});
    }, 6 * 60 * 1000); // 6 minutes
}

/* ===============================
LECTURE DES PAVÉS - TOUR DE CONTRÔLE
=================================*/
async function lirePaveAction(ms, ovl) {
    if (!ms.message) return;

    const chat = ms.key.remoteJid;
    const sender = ms.key.participant || ms.key.remoteJid;

    const match = matchsActifs.get(chat);
    if (!match || match.etat !== "en_cours") return;

    // récupérer texte ou caption
    const text =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    if (!text.includes("⚽:")) return;

    // Vérifie si c’est le joueur qui doit jouer
    if (sender !== match.joueurTour) return;

    // Extraire l’action complète
    const action = extraireAction(text);
    if (!action) return;

    // Extraire le nom du joueur utilisé dans le pavé
    const nomJoueur = extraireNomJoueur(action);
    if (!nomJoueur) {
        await ovl.sendMessage(chat, {
            text: "❌ Impossible d'identifier le joueur utilisé."
        });
        return;
    }

    // Chercher la carte dans la BDD
    const carte = trouverCarteJoueur(nomJoueur);
    if (!carte) {
        await ovl.sendMessage(chat, {
            text: `❌ Joueur *${nomJoueur}* introuvable dans la base Blue Lock.`
        });
        return;
    }

    // 🔹 Séparer le pavé en séquences/action individuelles
    const sequences = separerSequences(action);

    // 🔹 Dispatcher chaque action vers son compartiment
    for (const seq of sequences) {
        let type = null;
        if (/tir|frappe/i.test(seq)) type = "tir";
        else if (/passe/i.test(seq)) type = "passe";
        else if (/dribble|conduit|accélère|contrôle/i.test(seq)) type = "dribble";
        else type = "deplacement"; // Tout le reste = déplacement

        switch (type) {
            case "tir":
                await gestionTirs(seq, carte, match, chat, ovl);
                break;
            case "passe":
                await gestionPasses(seq, carte, match, chat, ovl);
                break;
            case "dribble":
                await gestionDribbles(seq, carte, match, chat, ovl);
                break;
            case "deplacement":
                await gestionDeplacements(seq, carte, match, chat, ovl);
                break;
        }
    }

    // 🔹 Passer au joueur suivant
    const nextJoueur = match.joueurTour === match.id1 ? match.id2 : match.id1;
    match.joueurTour = nextJoueur;

    // 🔹 Stop timer latence
    if (match.timerPave) clearTimeout(match.timerPave);

    // 🔹 Confirmation de validation et mention du joueur suivant
    await ovl.sendMessage(chat, {
        text: `✅ Action validée ! @${nextJoueur} NEXT⚽`,
        mentions: [nextJoueur]
    });
}

/* ===============================
GESTION DES DÉPLACEMENTS
=================================*/
async function gestionDeplacements(seq, carte, match, chat, ovl) {
    // TODO: Vérifier distance max, zones, et mise à jour de la position du joueur
    // Exemple:
    const zones = extraireZones(seq);
    if (!zones) return ovl.sendMessage(chat, { text: "❌ Impossible de déterminer les zones." });

    const dist = distance(zones.depart, zones.arrivee);
    if (dist > 10) {
        return ovl.sendMessage(chat, { text: "❌ Déplacement trop long, action annulée." });
    }

    // Mettre à jour la position du joueur
    carte.positionActuelle = zones.arrivee;
}

/* ===============================
GESTION DES TIRS
=================================*/
async function gestionTirs(seq, carte, match, chat, ovl) {
    // TODO: Ajouter logique de réussite du tir selon stats SHO, distance, zone, etc.
}

/* ===============================
GESTION DES PASSES
=================================*/
async function gestionPasses(seq, carte, match, chat, ovl) {
    // TODO: Ajouter logique de réussite de passe selon stats PAS, zone, etc.
}

/* ===============================
GESTION DES DRIBBLES / ACCÉLÉRATIONS
=================================*/
async function gestionDribbles(seq, carte, match, chat, ovl) {
    // TODO: Ajouter logique de réussite selon DRI, ACC, PHY, combo, etc.
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
        const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;

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
        const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;
        await ovl.sendMessage(chat, {
            text: "❌ Une erreur est survenue lors de l'arrêt du match."
        });
    }
});


module.exports = { messageMatch, verifierFiche };
