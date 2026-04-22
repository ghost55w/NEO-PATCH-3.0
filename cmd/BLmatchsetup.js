// ===============================
// 📦 IMPORTS
// ===============================
const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");
const { handlePaveGame } = require("../cmd/BLmatchgameplay");

/* ===============================
📦 BLUE LOCK MATCH ENGINE - SETUP CORE
=================================*/

/* ===============================
📊 GLOBAL STATE
=================================*/
const matchsActifs = new Map();


const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
// ⏱️ Temps par tour (6 minutes)
const TURN_TIME = 6 * 60 * 1000;
// ===============================
// 📍 MAPPING POSTES → TERRAIN
// ===============================
const POSITION_POSTES = {

    // 🔴 ATTAQUE
    AG: { zoneX: "gauche", ligne: "attaque", zoneY: "B1" },
    AC: { zoneX: "axe",    ligne: "attaque", zoneY: "B1" },
    AD: { zoneX: "droite", ligne: "attaque", zoneY: "B1" },

    // 🟡 MILIEU
    MG: { zoneX: "gauche", ligne: "milieu", zoneY: "C1" },
    MC: { zoneX: "axe",    ligne: "milieu", zoneY: "C1" },
    MD: { zoneX: "droite", ligne: "milieu", zoneY: "C1" },

    // 🔵 DEFENSE
    DG: { zoneX: "gauche", ligne: "defense", zoneY: "A2" },
    DC: { zoneX: "axe",    ligne: "defense", zoneY: "A2" },
    DD: { zoneX: "droite", ligne: "defense", zoneY: "A2" }
};

/* ===============================
🎯 PASSES CONFIG (ENGINE DATA)
=================================*/
const TYPES_PASSES = {
    courte: "passe courte rapide précision contrôle",
    longue: "longue passe aérienne profondeur",
    trivela: "extérieur du pied effet courbe",
    centre: "centre dans la surface",
    talon: "talonnade surprise arrière"
};

/* ===============================
🧠 UTILITAIRES CORE
=================================*/

// Normalisation JID
function normalizeJid(jid) {
    return jid?.split(":")[0] || jid;
}

// Sender helper
function getSenderJid(ms) {
    return ms.key?.participant || ms.key?.remoteJid;
}

//tag @mention DU sender
function getTagFromJid(jid) {
    const clean = normalizeJid(jid);
    return clean ? clean.split("@")[0] : "user";
}
/* ===============================
📐 MATH / TERRAIN ENGINE
=================================*/
// Distance entre zones
function distancePlayer(z1, z2) {
    if (!DISTANCES[z1] || !DISTANCES[z2]) return 0;
    return Math.abs(DISTANCES[z1] - DISTANCES[z2]);
}


// Extractions terrain
function extraireDistance(txt) {
    const m = txt.match(/(\d+)\s?m/);
    return m ? parseInt(m[1]) : null;
}

function extraireZoneArrivee(txt) {
    const m = txt.match(/zone\s*([A-C][1-2])/i);
    return m ? m[1].toUpperCase() : null;
}

function extraireZoneDepart(txt) {
    const m = txt.match(/depuis\s*([A-C][1-2])/i);
    return m ? m[1].toUpperCase() : null;
}

function extraireDirectionLargeur(txt) {
    if (txt.includes("gauche")) return "gauche";
    if (txt.includes("droite")) return "droite";
    return null;
}


/* ===============================
⌚ TIMER GLOBAL 
=================================*/
async function startMatchCycle(chat, ovl, match) {

    if (match.turnTimer) clearTimeout(match.turnTimer);

    if (!match.tour) match.tour = 1;
    if (!match.toursRestants) match.toursRestants = 5;

    const attacker = match.attacker;
    const defender = match.defender;

    // ===============================
    // 🏁 FIN MATCH
    // ===============================
    if (match.tour > 20) {

        await ovl.sendMessage(chat, {
            text:
`🏁⚽: FIN DU MATCH 🥅‼️

📊 20 TOURS ATTEINTS

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`
        });

        return;
    }

    // ===============================
    // 🎙️ TOUR MESSAGE
    // ===============================
    await ovl.sendMessage(chat, {
        text:
`🎙️⚽: TOUR ${match.tour}/20 🥅‼️

🔥 Attaquant: @${attacker.split("@")[0]}
🛡️ Défenseur: @${defender.split("@")[0]}
⏳ Tours restants: ${match.toursRestants}

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
        mentions: [attacker, defender]
    });

    // ===============================
    // ⏱️ TIMER 6 MIN
    // ===============================
    match.turnTimer = setTimeout(async () => {

        const currentAttacker = match.attacker;

        // ===============================
        // ⛔ LATENCE OUT MESSAGE
        // ===============================
        await ovl.sendMessage(chat, {
            image: { url: "https://files.catbox.moe/3n8q7l.jpg" },
            caption:
`⛔ LATENCE OUT ❌‼️

⚽ @${currentAttacker.split("@")[0]} n’a pas joué !

🔁 SWITCH DE POSSESSION

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [currentAttacker]
        });

        // ===============================
        // 🔁 SWITCH
        // ===============================
        const temp = match.attacker;
        match.attacker = match.defender;
        match.defender = temp;

        // 🔻 pénalité (perte 4 tours restants)
        match.toursRestants = Math.max(1, match.toursRestants - 4);

        // 🔁 progression cycle
        match.toursRestants--;

        if (match.toursRestants <= 0) {
            match.toursRestants = 5;
            match.tour++;
        }

        // ===============================
        // 🔄 RELANCE CYCLE
        // ===============================
        startMatchCycle(chat, ovl, match);

    }, 6 * 60 * 1000);
}

/* ===============================
⚙️ PLAYER ENGINE
=================================*/

// Trouver joueur DB
function findBlueLockPlayer(input, cardsBlueLock) {
  const q = pureName(input);
  const players = Object.values(cardsBlueLock);

  return (
    players.find(p => pureName(p.name) === q) ||
    players.find(p => pureName(p.name).includes(q) || q.includes(pureName(p.name))) ||
    null
  );
}

const pureName = str => {
  if (!str) return "";

  return String(str)
    .replace(/\(.*?\)/g, " ") // enlève (NEL) etc
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, " ") // drapeaux
    .replace(/[\u{1F300}-\u{1F6FF}]/gu, " ") // emojis
    .replace(/[\uFE00-\uFE0F\u200D]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};


/* ===============================
📋 LINEUP ENGINE
=================================*/
// ===============================
// 📋 PARSER LINEUP (AVEC POSTE)
// ===============================
function parseLineupFull(text) {

    const lignes = text.split("\n");
    const joueurs = [];

    for (const ligne of lignes) {

        if (!ligne.includes("👤")) continue;

        const numero = ligne.match(/^(\d+)/)?.[1];

        // 🔥 POSTE SAFE FIX
        const posteMatch = ligne.match(/\(([A-Z]{2})\)/i);
        const poste = posteMatch?.[1]?.toUpperCase() || null;

        const note = ligne.match(/\((\d{1,3})\)/g)?.pop()?.replace(/[()]/g, "");

        let nom = ligne
            .replace(/^(\d+)/, "")
            .replace(/👤/, "")
            .replace(/\([A-Z]{2}\)/gi, "")
            .replace(/\(\d+\)/g, "")
            .replace(/🇯🇵|🇫🇷|🇬🇧|🇪🇸|🇦🇷/g, "")
            .trim();

        // ❌ sécurité : si poste invalide on ignore la ligne
        if (!poste || poste.length !== 2) continue;

        joueurs.push({
            numero: parseInt(numero),
            poste,
            name: nom,
            note: parseInt(note)
        });
    }

    if (!joueurs.length) return null;

    const teamName = text.match(/SQUAD⚽🥅[^:]*:\s*(.+)/i)?.[1]?.trim();

    return { teamName, joueurs };
}
/* ===============================
📦 MATCH ENGINE HELPERS
=================================*/

// Update position global
function updatePositionJoueur(joueur, direction, distance) {
    if (!joueur) return;

    joueur.positionX = direction;
    joueur.distance = distance;
}

// Update global state
function updateGlobalPositions(match, joueur) {
    if (!match.positions) match.positions = [];

    const index = match.positions.findIndex(p => p.nom === joueur.nom);

    if (index !== -1) {
        match.positions[index] = joueur;
    } else {
        match.positions.push(joueur);
    }
}

// ===============================
// KICK OFF 
// ===============================
function tirageKickOff() {
    return Math.random() < 0.5 ? "A" : "B";
}

// ===============================
// TROUVER USER DANS LA BD
// ===============================
function cleanTeamName(str) {
    return str
        .replace(/\p{Emoji}/gu, "") // enlève emojis
        .toLowerCase()
        .trim();
}

async function trouverUser(nom) {
    const allPlayers = await TeamFunctions.getAllTeams();
    if (!allPlayers) return null;

    const nomClean = cleanTeamName(nom);

    for (const player of allPlayers) {
        const userClean = cleanTeamName(player.users || "");

        if (userClean === nomClean) {
            return player;
        }
    }

    return null;
        }

// ===============================
// 🎮 COMMANDE MATCH
// ===============================
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
             🔷BLUELOCK⚽🥅`;

        await ovl.sendMessage(chat, { text: ficheMatch });

        matchsActifs.set(chat, { etat: "attente_fiche", createur: sender });

    } catch (e) {
        console.log("Erreur match⚽ :", e);
    }
}); 
// ===============================
// 📋 DETECTION FICHE
// ===============================
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
        const err = formatErreurGlobal("❌ Joueur introuvable");

        await ovl.sendMessage(chat, {
            text: err.texte + `

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
        });

        matchsActifs.delete(chat);
        return;
    }

    match.team1Nom = match.team1;
    match.team2Nom = match.team2;
    match.etat = "attente_lineup";

    match.equipe1 = null;
    match.equipe2 = null;

    match.possessionIndex = {
        [match.team1Nom]: 0,
        [match.team2Nom]: 0
    };

    match.actionsRestantes = {
        [match.team1Nom]: 4,
        [match.team2Nom]: 4
    };

    match.role = {
        [match.team1Nom]: "attack",
        [match.team2Nom]: "defense"
    };

    const imagesMatchConfirm = [
        "https://files.catbox.moe/7m2axj.jpg",
        "https://files.catbox.moe/mtou2n.jpg"
    ];

    const randomImage = list =>
        list[Math.floor(Math.random() * list.length)];

    await ovl.sendMessage(chat, {
        image: { url: randomImage(imagesMatchConfirm) },
        caption: `🔷⚽ MATCH BLUE LOCK 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🎙️: ✅ Équipes confirmées !
👤 Team 1: ${match.team1}
👤 Team 2: ${match.team2}
🧤 Gardien: ${match.gardien}

╰───────────────────
               *🔷BLUELOCK⚽*`
    });

    await ovl.sendMessage(chat, {
        text: `📢 ${match.team1} et ${match.team2} ⏳ *Vous avez 2 minutes pour envoyer votre Lineup dans l'arène, ⚠️Ne tapez pas la commande ici.*`
    });

    // ===============================
    // ⏳ TIMER 2 MIN LINEUP
    // ===============================
    match.timerLineup = setTimeout(async () => {

        if (!match.equipe1 || !match.equipe2) {

            matchsActifs.delete(chat);

            await ovl.sendMessage(chat, {
                text:
`⚽❌ *MATCH ANNULÉ🥅*  
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░         
🎙️⚠️ Temps écoulé pour envoyer les lineups, le match est annulé. 

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
            });
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
    // 📩 EXTRACTION MESSAGE
    // ===============================
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

// ===============================
// 📋 DETECTION FICHE MATCH
// ===============================
if (match.etat === "attente_fiche") {
    await verifierFiche(safeText, chat, ovl);
    return;
}

// ===============================
// 📋 GESTION LINEUP
// ===============================
if (match.etat === "attente_lineup") {

    // 🔒 STOP si déjà complet
    if (match.equipe1 && match.equipe2) return;

    // 🔍 Vérifie que c'est bien un squad
    if (!safeText.includes("SQUAD⚽🥅")) return;

    const parsed = parseLineupFull(safeText);

    if (!parsed || !parsed.joueurs || parsed.joueurs.length === 0) {
        return ovl.sendMessage(chat, {
            text: "❌ Lineup invalide ou mal formaté"
        });
    }

    const squadNameRaw = parsed.teamName;
    if (!squadNameRaw) {
        return ovl.sendMessage(chat, {
            text: "❌ Nom d'équipe introuvable"
        });
    }

    const normalizeTeam = str =>
        str.replace(/\p{Emoji}/gu, "").toLowerCase().trim();

    const squadName = normalizeTeam(squadNameRaw);
    const team1 = normalizeTeam(match.team1Nom);
    const team2 = normalizeTeam(match.team2Nom);

    const senderJid = getSenderJid(ms);

    match.ownerJid = senderJid;
match.ownerName = ms.pushName || senderJid.split("@")[0];

    // ===============================
    // 🧠 VALIDATION JOUEURS (OK déjà)
    // ===============================
    const joueursValides = [];
const nomsUtilises = new Set();
const playersDB = Object.values(cardsBlueLock);

for (const j of parsed.joueurs) {

    const inputName = pureName(j.name);

    const data =
        playersDB.find(p => pureName(p.name) === inputName) ||
        playersDB.find(p => pureName(p.name).includes(inputName)) ||
        playersDB.find(p => inputName.includes(pureName(p.name)));

    if (!data) {
        return ovl.sendMessage(chat, {
            text: `❌ Joueur inconnu: ${j.name}`
        });
    }

    const nomClean = pureName(data.name);

    if (nomsUtilises.has(nomClean)) {
        return ovl.sendMessage(chat, {
            text: `❌ Joueur en double: ${data.name}`
        });
    }

    nomsUtilises.add(nomClean);

    const posteData = POSITION_POSTES[j.poste];

    if (!posteData) {
        return ovl.sendMessage(chat, {
            text: `❌ Poste invalide: ${j.poste}`
        });
    }

    joueursValides.push({
        numero: j.numero,
        nom: data.name,

        // ⚽ STATS AJOUTÉES 
        stats: {
            ovr: data.ovr,
            sho: data.sho,
            dri: data.dri,
            pas: data.pas,
            acc: data.acc,
            phy: data.phy,
            def: data.def
        },

        weapons: data.weapons || [],
        attitude: data.attitude || "calme",
        rank: data.rank,

        poste: j.poste,
        ligne: posteData.ligne,
        zoneX: posteData.zoneX,
        zoneY: posteData.zoneY,

        position: null,
        visavis: null
    });
}
// ===============================
// ⚽ ATTRIBUTION ÉQUIPE
// ===============================
if (squadName === team1 && !match.equipe1) {

    match.id1 = senderJid;
    match.lineup1 = joueursValides;
    match.equipe1 = true;

    await ovl.sendMessage(chat, {
        text: `✅ Formation validée pour *${match.team1Nom}*`
    });

} else if (squadName === team2 && !match.equipe2) {

    match.id2 = senderJid;
    match.lineup2 = joueursValides;
    match.equipe2 = true;

    await ovl.sendMessage(chat, {
        text: `✅ Formation validée pour *${match.team2Nom}*`
    });

} else {
    return ovl.sendMessage(chat, {
        text: "❌ Équipe non reconnue ou déjà envoyée"
    });
}

// ===============================
// 🚀 MATCH PRÊT 
// ===============================
if (match.equipe1 && match.equipe2 && !match.starting) {

    match.starting = true;

    if (match.timerLineup) {
        clearTimeout(match.timerLineup);
        match.timerLineup = null;
    }

    const readyText = `⏳ Les deux formations sont prêtes.
Le match commence dans *1 minute* 🥅⚽...`;

    const imagesReady = [
        "https://files.catbox.moe/dlj5z6.jpg",
        "https://files.catbox.moe/fdadd0.jpeg",
        "https://files.catbox.moe/4104s3.jpg"
    ];

    const imageRandom =
        imagesReady[Math.floor(Math.random() * imagesReady.length)];

    await ovl.sendMessage(chat, {
        image: { url: imageRandom },
        caption: readyText
    });

    match.timerMatch = setTimeout(() => lancerMatch(chat, ovl), 60000);
    
return; 
        }

// ===============================
    // 🔥 GESTION PAVÉ NORMAL
    // ===============================
// 🔥 GESTION PAVÉ NORMAL
const handled = await handlePaveGame(ms, ovl);
if (handled) return;

console.log("📩 MESSAGE REÇU (hors pavé)");
} 
} 

// ===============================
// 🚀 LANCEMENT MATCH
// ===============================
async function lancerMatch(chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    // ❌ déjà lancé
    if (match.kickoffStarted) return;

    match.kickoffStarted = true;

    // 🎲 tirage équipe qui commence
    const isTeam1 = Math.random() < 0.5;

    match.possession = isTeam1 ? match.team1Nom : match.team2Nom;
    match.phase = "kickoff";
    match.etat = "en_cours";

    // 👤 joueur qui commence
    match.joueurTour = isTeam1 ? match.id1 : match.id2;

    // 🔥 INIT SYSTEME GLOBAL
    match.turnType = "attaque";
    match.pendingAttack = null;
    match.waitingDefenseFrom = null;
    match.phaseDuel = null;

    // 🧹 CLEAN TIMERS (sécurité)
    if (match.timerGlobal) {
        clearTimeout(match.timerGlobal);
        match.timerGlobal = null;
    }

    if (match.timerWarning) {
        clearTimeout(match.timerWarning);
        match.timerWarning = null;
    }

    if (match.kickoffTimer) {
        clearTimeout(match.kickoffTimer);
        match.kickoffTimer = null;
    }

    match.waitingKickoff = false;

// =========================
// 🎯 AFFICHAGE KICKOFF
// =========================
const jidStart = match.joueurTour;
const displayName = jidStart.split("@")[0];

// ✅ FIX ICI
const jidOpposite = jidStart === match.id1 ? match.id2 : match.id1;

await ovl.sendMessage(chat, {
    image: {
        url: imagesKickOff[Math.floor(Math.random() * imagesKickOff.length)]
    },
    caption:
`🎙️⚽: KICK OFF 🥅‼️ @${displayName} débute avec la possession ! ⚽

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
    mentions: [jidStart]
});

// ===============================
// 🚀 INITIALISATION MATCH
// ===============================
match.tour = 1;
match.toursRestants = 5;

match.attacker = jidStart;
match.defender = jidOpposite;

    // =========================
    // 📍 INITIALISATION POSITIONS
    // =========================
    const equipeAttack =
        match.possession === match.team1Nom
            ? match.lineup1
            : match.lineup2;

    const equipeDefense =
        match.possession === match.team1Nom
            ? match.lineup2
            : match.lineup1;

    equipeAttack.forEach(j => {
        j.zoneY = getZoneYParLigne(j.ligne, "attaque");
    });

    equipeDefense.forEach(j => {
        j.zoneY = getZoneYParLigne(j.ligne, "defense");
    });
// =========================
// 📌 INIT POSITION PHYSIQUE (X,Y)
// =========================
match.lineup1.forEach(j => initPlayerPosition(j));
match.lineup2.forEach(j => initPlayerPosition(j));

    
    match.positions = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    // 🔗 vis-à-vis
    assignerVisAVis(match);

    // ===============================
// 🔥 START ENGINE 
// ===============================
startMatchCycle(chat, ovl, match);
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

        const chat = ms_org.key?.remoteJid || ms_org.from || ms_org;
        const match = matchsActifs.get(chat);

        if (!match) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        // ===============================
        // ⛔ STOP TOUS LES TIMERS
        // ===============================
        const timers = [
            "timerGlobal",
            "timerWarning",
            "timerPave",
            "timerTour",
            "timerKickoff",
            "timerAction",
            "timerMatch",          
            "timerLineup", 
            "turnTimer"
        ];

        for (const t of timers) {
            if (match[t]) {
                clearTimeout(match[t]);
                match[t] = null;
            }
        }

        // ===============================
        // 🧨 RESET MATCH STATE
        // ===============================
        match.etat = "arrete";
        match.kickoffStarted = false;
        match.pendingAttack = null;
        match.waitingDefenseFrom = null;
        match.phaseDuel = null;

        match.equipe1 = false;
        match.equipe2 = false;

        match.lineup1 = null;
        match.lineup2 = null;

        match.positions = null;
        match.possession = null;

        // ===============================
        // 🗑 SUPPRESSION
        // ===============================
        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text: `⛔ *MATCH BLUE LOCK ARRÊTÉ AVEC SUCCÈS*`
        });

    } catch (e) {
        console.error("❌ Erreur stopmatch :", e);

        const chat = ms_org.key?.remoteJid || ms_org.from || ms_org;

        await ovl.sendMessage(chat, {
            text: "❌ Erreur lors de l'arrêt du match."
        });
    }
});
    

/*===============================
📤 EXPORT ENGINE
=================================*/
module.exports = {

    // STATE
    matchsActifs,
    

    // TERRAIN
    DISTANCES,
    POSITION_POSTES,
    TYPES_PASSES,

    // CORE UTILS
    pureName,
    normalizeJid,
    getSenderJid,
getTagFromJid, 
    
    // MATH
    distancePlayer,
    extraireDistance,
    extraireZoneArrivee,
    extraireZoneDepart,
    extraireDirectionLargeur,

    // PLAYER
    findBlueLockPlayer,

    // LINEUP
    parseLineupFull,

    // ENGINE
    updatePositionJoueur,
    updateGlobalPositions, 

    // 🔥 AJOUT IMPORTANT
    messageMatch,
    verifierFiche, 
startMatchCycle,

}; 
   
