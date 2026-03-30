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
    console.log("📩 MESSAGE REÇU");

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return;

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

        if (squad === team1 && !match.equipe1) {
            const parsed = parseSquadBlueLock(safeText);
            match.lineup1 = parsed ? parsed.joueurs : [];
            match.equipe1 = true;

            await ovl.sendMessage(chat, {
                text: `✅ Formation confirmée pour *${match.team1Nom}* !`
            });
        }

        if (squad === team2 && !match.equipe2) {
            const parsed = parseSquadBlueLock(safeText);
            match.lineup2 = parsed ? parsed.joueurs : [];
            match.equipe2 = true;

            await ovl.sendMessage(chat, {
                text: `✅ Formation confirmée pour *${match.team2Nom}* !`
            });
        }

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

    await ovl.sendMessage(chat, {
        caption: `🎙️⚽: KICK OFF🥅‼️ @${premier} débute avec la possession...`,
        mentions: [jidStart]
    });

    match.timerPave = setTimeout(async () => {
        await ovl.sendMessage(chat, {
            text: `⏰ @${premier} LATENCE OUT! ❌.`,
            mentions: [jidStart]
        });
    }, 6 * 60 * 1000);
}
} 
/* ===============================
LECTURE DES PAVÉS - TOUR DE CONTRÔLE
=================================*/
ovlcmd({
    nom: "lirePaveAction",
    isfunc: true
}, async (ms_org, ovl, { texte, repondre, auteur_Message }) => {

    const chat = ms_org.from || ms_org.key?.remoteJid;
    const match = matchsActifs.get(chat);

    if (!match || match.etat !== "en_cours") return;

    if (!texte.includes("⚽:") || !texte.includes("💬:")) return;

    const safeText = texte.replace(/\u200B/g, "").replace(/\r/g, "").trim();

    const joueurTour = cleanJid(match.joueurTour);
    const senderClean = cleanJid(auteur_Message);

    if (senderClean !== joueurTour) return;

    const actionLine = safeText.split("\n").find(l => /⚽\s*:/.test(l));
    if (!actionLine) return;

    const actionClean = actionLine.replace(/⚽\s*:/g, "").trim();

    if (!actionClean || actionClean.length < 2) {
        return repondre("❌ Aucune action détectée après ⚽:");
    }

    const sequences = actionClean.split("/").map(s => s.trim());

    const isTeam1 = senderClean === cleanJid(match.id1);
    const lineup = isTeam1 ? match.lineup1 : match.lineup2;

    if (!Array.isArray(lineup)) {
        return repondre("❌ Lineup introuvable.");
    }

    for (const seq of sequences) {

        let type = null;
        const seqClean = seq.toLowerCase();

        for (const [key, mots] of Object.entries(ACTIONS_MAP)) {
            if (mots.some(m => new RegExp(`\\b${m}\\b`, "i").test(seqClean))) {
                type = key;
                break;
            }
        }

        if (!type) {
            await repondre(`❌ Action invalide : "${seq}"`);
            return;
        }

        const joueur = lineup.find(j =>
            seqClean.includes(j.nom.toLowerCase())
        );

        if (!joueur) {
            await repondre(`❌ Joueur introuvable dans : "${seq}"`);
            return;
        }

        switch (type) {
            case "tir":
                await gestionTirs(seq, joueur, match, chat, ovl);
                break;

            case "passe":
                await gestionPasses(seq, joueur, match, chat, ovl);
                break;

            case "dribble":
                await gestionDribbles(seq, joueur, match, chat, ovl);
                break;

            case "deplacement":
                await gestionDeplacements(seq, joueur, match, chat, ovl);
                break;
        }
    }

    const nextJoueur = match.joueurTour === match.id1 ? match.id2 : match.id1;
    match.joueurTour = nextJoueur;

    if (match.timerPave) clearTimeout(match.timerPave);

    await ovl.sendMessage(chat, {
        text: `✅ Pavé validé ! @${nextJoueur} NEXT⚽`,
        mentions: [nextJoueur]
    });
});

/* ===============================
GESTION DES DÉPLACEMENTS
=================================*/
async function gestionDeplacements(seq, carte, match, chat, ovl) {
    // Extraire zones départ et arrivée
    const departMatch = seq.match(/\((A1|A2|B1|B2|C1|C2)\)/i);
    const arriveeMatch = seq.match(
    /(vers|en)\s+(A1|A2|B1|B2|C1|C2)|(?:la\s+)?zone\s+(A1|A2|B1|B2|C1|C2)/i
);
    if (!departMatch || !arriveeMatch) {
        return ovl.sendMessage(chat, { text: "❌ Impossible de déterminer les zones." });
    }

    const depart = departMatch[1].toUpperCase();
    const arrivee = (
    arriveeMatch?.[2] ||
    arriveeMatch?.[3] ||
    arriveeMatch?.[4]
)?.toUpperCase();

    // Vérification distance max 10m
    const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
    const dist = Math.abs(DISTANCES[depart] - DISTANCES[arrivee]);
    if (dist > 10) {
        return ovl.sendMessage(chat, { text: "❌ Déplacement trop long, action annulée." });
    }

    // Vérification espacement minimal
    match.positions = match.positions || {};
    for (const pid in match.positions) {
        if (pid === carte.nom) continue;
        if (match.positions[pid] === arrivee) {
            return ovl.sendMessage(chat, { text: `❌ ${carte.nom} trop proche d'un autre joueur dans la zone cible.` });
        }
    }

    // Mise à jour position du joueur
    carte.positionActuelle = arrivee;
    match.positions[carte.nom] = arrivee;

    await ovl.sendMessage(chat, { text: `✅ ${carte.nom} se déplace de ${depart} vers ${arrivee} avec succès !` });
}

/* ===============================
GESTION DES PASSES 
=================================*/
async function gestionPasses(seq, carte, match, chat, ovl) {

    const texte = seq.toLowerCase();

    /* ===============================
    1️⃣ DETECTION TYPE DE PASSE
    ==============================*/
    const typePasse = MOTS_CLES_PASSES.types.find(t => texte.includes(t));

    if (!typePasse) {
        return ovl.sendMessage(chat, {
            text: "❌ Type de passe manquant ou invalide."
        });
    }

    const modele = TYPES_PASSES[typePasse];

    /* ===============================
    2️⃣ VALIDATION MOTS CLÉS 🧩
    ==============================*/
    let score = 0;
    let total = 0;
    let manquants = [];

    function check(categorie) {
        total++;
        const ok = categorie.some(m => texte.includes(m));
        if (ok) score++;
        else manquants.push(categorie[0]);
    }

    check(MOTS_CLES_PASSES.types);
    check(MOTS_CLES_PASSES.pied);
    check(MOTS_CLES_PASSES.zonesPied);
    check(MOTS_CLES_PASSES.directions);
    check(MOTS_CLES_PASSES.hauteurs);
    check(MOTS_CLES_PASSES.zonesCible);

    // Distance
    total++;
    const distMatch = texte.match(/(\d+)\s?m/);
    let distance = distMatch ? parseInt(distMatch[1]) : null;

    if (distance && distance <= MOTS_CLES_PASSES.distanceMax) {
        score++;
    } else {
        manquants.push("distance valide (max 30m)");
    }

    const pourcentage = Math.floor((score / total) * 100);

    /* ===============================
    3️⃣ ECHEC SI MOT CLÉ MANQUANT
    ==============================*/
    if (score < total) {
        return ovl.sendMessage(chat, {
            text: `❌ Passe ratée !
📊 Validation: ${pourcentage}%
❗ Manquant: ${manquants.join(", ")}`
        });
    }

    /* ===============================
    4️⃣ EXTRACTION RECEVEUR
    ==============================*/
    const receveurMatch = texte.match(/vers\s+([^\s]+)/i);
    if (!receveurMatch) {
        return ovl.sendMessage(chat, {
            text: "❌ Aucun receveur trouvé."
        });
    }

    const receveurNom = receveurMatch[1];
    const receveur = trouverCarteJoueur(receveurNom);

    if (!receveur) {
        return ovl.sendMessage(chat, {
            text: `❌ Joueur receveur introuvable : ${receveurNom}`
        });
    }

    /* ===============================
    5️⃣ INTERCEPTION (SEULE CAUSE D'ÉCHEC)
    ==============================*/
    const interception = await verifierInterceptionHauteur(
        match,
        texte,
        receveur.positionActuelle,
        carte,
        chat,
        ovl,
        typePasse
    );

    if (interception) return;

    /* ===============================
    6️⃣ PASSE REUSSIE ✅
    ==============================*/
    match.ballZone = receveur.positionActuelle;

    let effet = "";
    switch(typePasse) {
        case "passe trivela": effet = "🎯 Effet extérieur"; break;
        case "passe enroulée": effet = "🌀 Effet enroulé"; break;
        case "passe lobbée": effet = "⛅ Ballon lobé"; break;
        case "centre": effet = "⚡ Centre aérien"; break;
        case "passe longue": effet = "🚀 Long ballon"; break;
        default: effet = "↗ Passe directe"; break;
    }

    await ovl.sendMessage(chat, {
        text: `✅ Passe réussie !
📊 Validation: ${pourcentage}%
🎯 ${carte.nom} → ${receveur.nom}
🧩 Type: ${typePasse}
${effet}`
    });
}



/* ===============================
GESTION DES TIRS
=================================*/
async function gestionChancesTir(ms_org, ovl, joueurNomSaisi, zone, distance, gardienMatch) {
    // Normalisation du nom du joueur
    const nomNormalise = joueurNomSaisi.trim().toLowerCase().replace(/\s+/g, ' ');

    // Recherche du joueur dans la DB
    const joueurData = Object.values(cardsBlueLock).find(j => {
        const nameNormalized = j.nom.trim().toLowerCase().replace(/\s+/g, ' ');
        return nameNormalized === nomNormalise;
    });

    if (!joueurData) {
        return ovl.sendMessage(ms_org, {
            text: `⚠️ Joueur non trouvé dans la database : *${joueurNomSaisi}*`
        });
    }

    const tirPuissance = parseInt(joueurData.tir || 50, 10);
    const sho = parseInt(joueurData.sho || 50, 10);
    const gardien = parseInt(gardienMatch || 50, 10);
    distance = parseFloat(distance || 3);

    let probaGoal = 0;
    const ecart = sho - gardien;

    // Calcul probabilité selon distance et écart
    if (distance <= 5) {
        probaGoal = ecart > 10 ? 1.0 : ecart > 0 ? 0.85 : ecart === 0 ? 0.5 : 0;
    } else if (distance <= 10) {
        probaGoal = ecart > 10 ? 0.9 : ecart > 0 ? 0.65 : ecart === 0 ? 0.3 : ecart >= -5 ? 0.2 : 0;
    } else {
        probaGoal = ecart > 10 ? 0.85 : ecart > 0 ? 0.6 : ecart === 0 ? 0.2 : ecart >= -5 ? 0.1 : 0;
    }

    const tirAleatoire = Math.random();
    const resultat = tirAleatoire <= probaGoal ? "but" : "arrêt";

    if (resultat === "but") {
        const commentaires = {
            "lucarne droite": [
                `*🎙️: COMME UN MISSILE GUIDÉ ! ${joueurData.nom} envoie le ballon dans la lucarne droite - splendide !*`,
                `*🎙️: UNE FRAPPE POUR L'HISTOIRE ! ${joueurData.nom} explose la lucarne droite !*`
            ],
            "lucarne gauche": [
                `*🎙️: MAGNIFIQUE ! ${joueurData.nom} pulvérise la lucarne gauche !*`,
                `*🎙️: UNE PRÉCISION D'ORFÈVRE ! ${joueurData.nom} touche la lucarne gauche, gardien impuissant !*`
            ],
            "lucarne milieu": [
                `*🎙️: JUSTE SOUS LA BARRE ! ${joueurData.nom} centre magistralement !*`,
                `*🎙️: UNE FUSÉE POUR LES LIVRES ! ${joueurData.nom} en pleine lucarne centrale !*`
            ],
            "mi-hauteur droite": [`*🎙️: UNE FRAPPE SÈCHE ET PRÉCISE ! ${joueurData.nom} transperce les filets droits !*`],
            "mi-hauteur gauche": [`*🎙️: PUISSANCE ET PRÉCISION ! ${joueurData.nom} traverse la défense à gauche !*`],
            "mi-hauteur centre": [`*🎙️: UNE FUSÉE AU CENTRE ! ${joueurData.nom} frappe en plein milieu à mi-hauteur !*`],
            "ras du sol droite": [`*🎙️: ENTRE LES JAMBES ! ${joueurData.nom} glisse le ballon à ras du sol côté droit !*`],
            "ras du sol gauche": [`*🎙️: UNE RACLÉE TECHNIQUE ! ${joueurData.nom} rase le sol à gauche !*`],
            "ras du sol milieu": [`*🎙️: UNE FINALE DE CLASSE ! ${joueurData.nom} envoie le ballon au sol, en plein centre !*`]
        };

        if (!commentaires[zone]) {
            return ovl.sendMessage(ms_org, {
                text: `Zone inconnue : *${zone}*\nZones valides :\n- ${Object.keys(commentaires).join("\n- ")}`
            });
        }

        const commentaire = commentaires[zone][Math.floor(Math.random() * commentaires[zone].length)];

        // GIF GOAL
        const videoGoal = [
            "https://files.catbox.moe/chcn2d.mp4",
            "https://files.catbox.moe/t04dmz.mp4",
            "https://files.catbox.moe/8t1eya.mp4"
        ][Math.floor(Math.random() * 3)];

        await ovl.sendMessage(ms_org, {
            video: { url: videoGoal },
            caption: `*🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱*\n${commentaire}`,
            gifPlayback: true
        });

        // GIF spécifique du joueur si défini
        if (joueurData.goal) {
            await ovl.sendMessage(ms_org, {
                video: { url: joueurData.goal },
                caption: "",
                gifPlayback: true
            });
        }

    } else {
        // Tir raté
        await ovl.sendMessage(ms_org, {
            video: { url: 'https://files.catbox.moe/88lylr.mp4' },
            caption: "*🥅:❌MISSED GOAL!!! ▱▱▱▱*",
            gifPlayback: true
        });
    }
}
/* ===============================
GESTION DES DRIBBLES / ACCÉLÉRATIONS
=================================*/
// Ici tu ajouteras la fonction gestionDribbles(seq, carte, match, chat, ovl)    


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
        const chat = ms_org.key?.remoteJid || ms_org.from;
        const match = matchsActifs.get(chat);

        if (!match) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text: `⛔ Le match Blue Lock en cours a été arrêté !`
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
