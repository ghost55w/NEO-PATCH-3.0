// ===============================
// 📦 IMPORTS
// ===============================
const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

/* ===============================
📊 GLOBAL STATE
=================================*/
const matchsActifs = new Map();

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

/* ===============================
⚽ UTILITAIRES GAMEPLAY 🎮 
=================================*/

/* ===============================
⚽ TERRAIN ENGINE (CORE GAMEPLAY)
=================================*/
const DISTANCES_TERRAIN = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
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
📐 MATH / TERRAIN ENGINE
=================================*/
// Distance entre zones
function distanceZone(z1, z2) {
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

// 📏 DIMENSIONS
// ===============================
const FIELD = {
    length: 60, // profondeur (Y)
    width: 30   // largeur (X)
};

// ===============================
// 📍 ZONES PROFONDEUR (Y)
// ===============================
const ZONES_Y = {
    C2: 30,
    C1: 25,
    B2: 20,
    B1: 15,
    A2: 10,
    A1: 5
};

// ===============================
// ↔️ ZONES LARGEUR (X)
// ===============================
const ZONES_X = {
    gauche: 5,
    axe: 15,
    droite: 25
};

// ===============================
// 🔄 ZONE → POSITION (X,Y)
// ===============================
function convertToPosition(zoneX, zoneY) {

    if (!ZONES_X[zoneX] || !ZONES_Y[zoneY]) return null;

    return {
        x: ZONES_X[zoneX],
        y: ZONES_Y[zoneY]
    };
}

// ===============================
// 📏 DISTANCE ENTRE JOUEURS
// ===============================
function distancePlayer(p1, p2) {

    if (!p1 || !p2) return 0;

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return Math.sqrt(dx * dx + dy * dy);
}

// ===============================
// 🚶 DEPLACEMENT AVANT / ARRIERE (ZONE Y)
// ===============================
function moveToZone(player, newZoneY) {

    if (!player.position) {
        return { ok: false, erreur: "❌ Position non initialisée" };
    }

    const targetY = ZONES_Y[newZoneY];

    if (!targetY) {
        return { ok: false, erreur: "❌ Zone inconnue" };
    }

    const dist = Math.abs(player.position.y - targetY);

    // 🔥 limite réaliste Blue Lock
    if (dist > 10) {
        return { ok: false, erreur: "❌ Déplacement trop long (>10m)" };
    }

    player.position.y = targetY;

    return { ok: true };
}

// ===============================
// ↔️ DEPLACEMENT LATÉRAL
// ===============================
function moveLateral(player, direction, distance = 5) {

    if (!player.position) {
        return { ok: false, erreur: "❌ Position non initialisée" };
    }

    if (distance > 10) {
        return { ok: false, erreur: "❌ Déplacement latéral trop long" };
    }

    if (direction === "gauche") {
        player.position.x -= distance;
    }

    if (direction === "droite") {
        player.position.x += distance;
    }

    // 🔒 clamp terrain
    player.position.x = Math.max(0, Math.min(FIELD.width, player.position.x));

    return { ok: true };
}

// ===============================
// 🧠 POSITION → ZONE Y
// ===============================
function getZoneFromY(y) {

    if (y >= 28) return "C2";
    if (y >= 23) return "C1";
    if (y >= 18) return "B2";
    if (y >= 13) return "B1";
    if (y >= 8) return "A2";
    return "A1";
}

// ===============================
// 🧠 POSITION → ZONE X
// ===============================
function getZoneFromX(x) {

    if (x <= 10) return "gauche";
    if (x <= 20) return "axe";
    return "droite";
}

// ===============================
// 🔒 VALIDATION TERRAIN
// ===============================
function isInsideField(pos) {

    if (!pos) return false;

    return (
        pos.x >= 0 &&
        pos.x <= FIELD.width &&
        pos.y >= 0 &&
        pos.y <= FIELD.length
    );
}

// ===============================
// 🧩 INIT POSITION JOUEUR
// ===============================
function initPlayerPosition(player) {

    const pos = convertToPosition(player.zoneX, player.zoneY);

    if (!pos) {
        return { ok: false, erreur: "❌ Position invalide" };
    }

    player.position = pos;

    return { ok: true };
}

// ===============================
// 🔄 UPDATE GLOBAL POSITION
// ===============================
function updateGlobalPositions(match, joueur) {

    if (!match.positions) match.positions = [];

    const index = match.positions.findIndex(p => p.nom === joueur.nom);

    if (index !== -1) {
        match.positions[index] = joueur;
    } else {
        match.positions.push(joueur);
    }
}
/* ===============================
PAVÉ DE JEU GAMEPLAY 🎮 
=================================*/
function extraireAction(pave) {
    const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
    if (!ligne) return null;
    return ligne.replace("⚽:", "").trim();
}

function extraireBloc(text, symbole) {
    const part = text.split(symbole)[1];
    if (!part) return null;

    return part
        .split("▔")[0]
        .split("─")[0]
        .trim();
}

function extraireActionsPrincipales(text){
    return extraireBloc(text, "⚽:");
}
function extraireActionsSecondaires(text){
    return extraireBloc(text, "🔁:");
}


// ===============================
// 🎙️ RESUME FULL INTELLIGENT
// ===============================
function genererResumeFull(actionText, match) {

    const actions = parseActionSequence(actionText, match);

    if (!actions.length) return "Action non identifiable.";

    let phrases = [];

    for (const act of actions) {

        if (act.type === "passe" && act.target) {
            phrases.push(`${act.player} passe à ${act.target}`);
        }

        else if (act.type === "controle") {
            phrases.push(`${act.player} contrôle le ballon`);
        }

        else if (act.type === "conduite") {
            phrases.push(`${act.player} progresse balle au pied`);
        }

        else if (act.type === "tir") {
            phrases.push(`${act.player} frappe au but`);
        }

        else {
            phrases.push(`${act.player} agit`);
        }
    }

    return phrases.join(", puis ") + ".";
}
//NOTE PAVÉ 
function noterPave(action) {

    let score = 5;

    if (!action) return 0;

    const txt = action.toLowerCase();

    // richesse
    if (txt.length > 80) score += 1;
    if (txt.length > 150) score += 1;

    // éléments techniques
    if (txt.includes("passe")) score += 1;
    if (txt.includes("contrôle") || txt.includes("controle")) score += 1;
    if (txt.includes("zone")) score += 1;
    if (txt.match(/\d+\s?m/)) score += 1;

    // précision vocabulaire
    if (txt.includes("intérieur") || txt.includes("extérieur")) score += 1;

    return Math.min(score, 10);
}

//VALIDATION DES ACTIONS 
function validerAction(action) {

    if (!action) return { ok: false, reason: "Aucune action détectée" };

    const txt = action.toLowerCase();

    if (!txt.includes("passe") && !txt.includes("tir") && !txt.includes("contrôle")) {
        return { ok: false, reason: "Action non reconnue (passe/tir/contrôle requis)" };
    }

    if (!txt.match(/\d+\s?m/)) {
        return { ok: false, reason: "Distance obligatoire (ex: 5m)" };
    }

    return { ok: true };
}

// ===============================
// 🎯 HELPERS RESULT DUEL
// ===============================
function success(message) {
    return { ok: true, type: "win", message };
}

function fail(message) {
    return { ok: false, type: "fail", message };
}

function faute(message) {
    return { ok: false, type: "faute", message };
}
    
//VALIDATION DE PAVÉ RAISON 
// ===============================
// 🧠 VALIDATION PAVÉ (PATCH)
// ===============================
function validatePave(text, joueur, match) {

    const errors = [];

    const structure = validateStructure(text);
    if (!structure.ok) errors.push(structure.reason);

    const action = extraireAction(text);

    if (action) {

        const txt = text.toLowerCase();

        // ===============================
        // 🚶 DÉPLACEMENT OBLIGATOIRE
        // ===============================
        if (
            txt.includes("place") ||
            txt.includes("vient") ||
            txt.includes("court") ||
            txt.includes("déplacement")
        ) {

            if (!txt.match(/\d+\s?m/)) {
                errors.push("❌ Distance non précisée pour déplacement");
            }

            if (
                !txt.includes("vmax") &&
                !txt.includes("course") &&
                !txt.includes("déplacement")
            ) {
                errors.push("❌ Type de déplacement non précisé (ex: course vmax)");
            }
        }

        const moveCheck = checkDeplacements(text, joueur, match);
        if (!moveCheck.ok) errors.push(moveCheck.erreur);

        const passCheck = checkPasses(action, joueur, match);
        if (!passCheck.ok) errors.push(passCheck.erreur);

        const tirCheck = checkTirs(action, joueur, match);
        if (!tirCheck.ok) errors.push(tirCheck.erreur);

        const duelCheck = checkDuels(text, joueur, match);
        if (!duelCheck.ok) errors.push(duelCheck.erreur);
    }

    if (errors.length > 0) {
        return { ok: false, reason: errors.join(" | ") };
    }

    return { ok: true };
}


// ===============================
// ⏱️ STOP TIMER TOUR
// ===============================
function stopTurnTimer(match) {
    if (match.turnTimer) {
        clearTimeout(match.turnTimer);
        match.turnTimer = null;
    }

    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }
} 
/* ===============================
⌚ TIMER GLOBAL 
=================================*/
function startMatchCycle(chat, ovl, match) {

    if (!match || match.etat !== "en_cours") return;

    // 🧹 clean anciens timers
    clearTimeout(match.turnTimer);
    clearTimeout(match.warningTimer);

    match.turnTimer = null;
    match.warningTimer = null;

    if (!match.tour) match.tour = 1;
    if (!match.toursRestants) match.toursRestants = 5;

    // 🔒 lock tour ID
    const currentTurnId = Date.now();
    match.currentTurnId = currentTurnId;

    // 🔥 SAFE CHECK
    if (!match.attacker || !match.defender) {
        console.log("❌ Match cassé: attacker/defender null");
        return;
    }

    const attacker = match.attacker;

    const attackerName =
        match.names?.[attacker] ||
        attacker.split("@")[0];

    // ===============================
    // ⚠️ WARNING (1 MIN RESTANTE)
    // ===============================
    match.warningTimer = setTimeout(async () => {

        if (match.currentTurnId !== currentTurnId) return;
        if (match.hasPlayed) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ ATTENTION @${attackerName} ❗⏳

Il reste *1 MINUTE* pour jouer !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [attacker]
        });

    }, 5 * 60 * 1000);

    // ===============================
    // ⏱️ FIN DE TOUR (6 MIN)
    // ===============================
    match.turnTimer = setTimeout(async () => {

        console.log("⏱️ FIN TOUR déclenché");

        if (match.currentTurnId !== currentTurnId) {
            console.log("⚠️ Timer ignoré (ancien cycle)");
            return;
        }

        match.turnTimer = null;

        if (match.warningTimer) {
            clearTimeout(match.warningTimer);
            match.warningTimer = null;
        }

        // ===============================
        // ✅ SI LE JOUEUR A JOUÉ
        // ===============================
        if (match.hasPlayed) {

            const oldAttacker = match.attacker;
            const newAttacker = match.defender;

            const newName =
                match.names?.[newAttacker] ||
                newAttacker.split("@")[0];

            await ovl.sendMessage(chat, {
                text:
`⚡ ACTION VALIDÉE ✅

🔁 @${newName} NEXT !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
                mentions: [newAttacker]
            });

            // 🔁 SWITCH
            match.attacker = newAttacker;
            match.defender = oldAttacker;

            // 🔥 FIX CRITIQUE
            match.joueurTour = newAttacker;

            // 📊 POSSESSION
            match.possessions[newAttacker] =
                (match.possessions[newAttacker] || 0) + 1;

            // ⏳ TOURS
            match.toursRestants -= 1;

            if (match.toursRestants <= 0) {
                match.toursRestants = 5;
                match.tour++;
            }

            // 🔄 RESET
            match.hasPlayed = false;
            match.pendingAttack = null;
            match.waitingDefenseFrom = null;

            // 🚀 RELANCE
            startMatchCycle(chat, ovl, match);
            return;
        }

        // ===============================
        // ❌ LATENCE OUT
        // ===============================
        const oldAttacker = match.attacker;
        const newAttacker = match.defender;

        const oldName =
            match.names?.[oldAttacker] ||
            oldAttacker.split("@")[0];

        const newName =
            match.names?.[newAttacker] ||
            newAttacker.split("@")[0];

        await ovl.sendMessage(chat, {
            text:
`⛔ LATENCE OUT ❌‼️

⚽ @${oldName} n’a pas joué à temps !
🔁 @${newName} récupère la possession ⚡

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [oldAttacker, newAttacker]
        });

        // 🔁 SWITCH
        match.attacker = newAttacker;
        match.defender = oldAttacker;

        // 🔥 FIX CRITIQUE
        match.joueurTour = newAttacker;

        match.possessions[newAttacker] =
            (match.possessions[newAttacker] || 0) + 1;

        // ⏳ TOURS
        match.toursRestants -= 1;

        if (match.toursRestants <= 0) {
            match.toursRestants = 5;
            match.tour++;
        }
        
        // 🔄 RESET COMPLET TOUR
match.hasPlayed = false;
match.pendingAttack = null;
match.waitingDefenseFrom = null;
match.phaseDuel = null;

        const nextName =
            match.names?.[newAttacker] ||
            newAttacker.split("@")[0];

        await ovl.sendMessage(chat, {
            text:
`🎙️⚽: NOUVEAU TOUR ⚡

@${nextName} à toi de jouer !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [newAttacker]
        });

        // 🚀 RELANCE
        startMatchCycle(chat, ovl, match);

    }, 6 * 60 * 1000);
}
    
//KICK OFF
function tirageKickOff() {
    return Math.random() < 0.5 ? "A" : "B";
}

// ===============================
// 🧠 EXTRACTION NOM JOUEUR (ROBUSTE)
// ===============================
function extractPlayerName(actionText) {

    if (!actionText) return "un joueur";

    const words = actionText.split(" ");

    for (let i = 0; i < words.length; i++) {

        let w = words[i]
            .replace(/[()]/g, "")
            .trim();

        // ignore zones (C2), etc
        if (/^[A-C][1-2]$/i.test(w)) continue;

        // nom valide
        if (/^[A-Z][a-zA-Z0-9]+$/.test(w)) {
            return w;
        }
    }

    return "un joueur";
}
// ===============================
// 🧭 DIRECTION NORMALIZER
// ===============================
function normalizeDirection(texte) {

    const t = texte.toLowerCase();

    // LEFT / RIGHT simples
    if (t.includes("vers la gauche") || t.includes("à gauche") || t.includes("sur la gauche")) {
        return "left";
    }

    if (t.includes("vers la droite") || t.includes("à droite") || t.includes("sur la droite")) {
        return "right";
    }

    // FLANK (contournement)
    if (t.includes("par la gauche")) {
        return "flank_left";
    }

    if (t.includes("par la droite")) {
        return "flank_right";
    }

    return null;
}

// ===============================
// 🛑 ACTION VALIDATOR
// ===============================
function validateActionSyntax(texte) {

    const t = texte.toLowerCase();

    // 🚫 PIVOT obligatoire 180°
    if (t.includes("pivot") || t.includes("retourne") || t.includes("demi tour")) {

        const has180 = t.includes("180");
        const hasDirection = t.includes("droite") || t.includes("gauche");

        if (!has180 || !hasDirection) {
            return { valid: false, reason: "PIVOT_INVALID" };
        }
    }

    // 🚫 VITESSE MAX obligatoire
    if (
        t.includes("accelere") ||
        t.includes("sprint") ||
        t.includes("course rapide")
    ) {
        const hasVmax = t.includes("vmax") || t.includes("(vmax)");

        if (!hasVmax) {
            return { valid: false, reason: "SPEED_INVALID" };
        }
    }

    return { valid: true };
}

// ===============================
// 🧠 SPEED + VALIDATION HELPERS (si pas déjà global)
// ===============================
function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ===============================
// ⚡ SPEED ENGINE (VMAX SYSTEM)
// ===============================
function computeSpeed(player, speedMode) {

    const base = player.ACC || 50;

    if (speedMode === "MAX") return base;
    if (speedMode === "NORMAL") return Math.floor(base * 0.4);
    if (speedMode === "PENALTY") return Math.floor(base * 0.15);

    return Math.floor(base * 0.2);
}

// ===============================
// 🏃 CHASE SYSTEM
// ===============================
function resolveChase(match, attacker, defender, ball, actionA, actionB) {

    const checkA = validateActionSyntax(actionA);
    const checkB = validateActionSyntax(actionB);

    const speedA = computeSpeed(attacker, checkA.speedMode);
    const speedB = computeSpeed(defender, checkB.speedMode);

    let distA = getDistance(attacker.position, ball.position);
    let distB = getDistance(defender.position, ball.position);

    const gainA = speedA * 0.1;
    const gainB = speedB * 0.1;

    distA = Math.max(0, distA - gainA);
    distB = Math.max(0, distB - gainB);

    // 🛡️ INTERCEPTION DEFENSEUR
    if (distB <= 1 && distB < distA) {

        ball.holder = defender.nom;
        ball.state = "controle";
        ball.position = { ...defender.position };

        return {
            winner: defender.nom,
            reason: "INTERCEPTION"
        };
    }

    // ⚽ CONSERVATION ATTAQUANT
    if (distA <= 1 && distA < distB) {

        ball.holder = attacker.nom;
        ball.state = "controle";
        ball.position = { ...attacker.position };

        return {
            winner: attacker.nom,
            reason: "CONSERVATION"
        };
    }

    // 🔄 BALLON LIBRE
    ball.state = "loose";
    ball.position = {
        x: (attacker.position.x + defender.position.x) / 2,
        y: (attacker.position.y + defender.position.y) / 2
    };

    return {
        winner: null,
        reason: "CHASE_CONTINUES"
    };
}

// ===============================
// 🧠 EXTRACTION JOUEURS RÉELS (ANTI FAUX POSITIFS)
// ===============================
function extractRealPlayers(actionText, match) {

    if (!actionText) return [];

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    const namesDB = allPlayers.map(p => p.nom.toLowerCase());

    const words = actionText.match(/[A-Z][a-zA-Z0-9]+/g) || [];

    return words.filter(w => {

        const lower = w.toLowerCase();

        // ❌ zones terrain (C2, B1...)
        if (/^[A-C][1-2]$/i.test(w)) return false;

        // ❌ mots techniques
        const blacklist = [
            "interieur", "exterieur", "pied", "tete",
            "zone", "gauche", "droite", "devant"
        ];

        if (blacklist.includes(lower)) return false;

        // ✅ correspondance avec DB
        return namesDB.some(n => n.includes(lower));
    });
            }


// ===============================
// 🧠 PARSE ACTION SEQUENCE (FIX PRINCIPAL)
// ===============================
function parseActionSequence(actionText, match) {

    const players = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    const steps = actionText.split("/").map(s => s.trim());

    const actions = [];

    for (let step of steps) {

        const lower = step.toLowerCase();

        // 🔍 joueur principal
        const playerObj = players.find(p => {
            const name = pureName(p.nom);
            return lower.includes(name);
        });

        if (!playerObj) continue;

        const player = playerObj.nom;

        // 🔍 cible (autre joueur)
        const targetObj = players.find(p => {
            const name = pureName(p.nom);
            return lower.includes(name) && p.nom !== player;
        });

        const target = targetObj ? targetObj.nom : null;

        // ===============================
        // 🎯 TYPE D’ACTION
        // ===============================
        let type = "action";

        if (lower.includes("passe")) type = "passe";
        else if (lower.includes("contrôle") || lower.includes("controle")) type = "controle";
        else if (
            lower.includes("fonce") ||
            lower.includes("avance") ||
            lower.includes("progresse") ||
            lower.includes("conduite")
        ) type = "conduite";
        else if (lower.includes("tir") || lower.includes("frappe")) type = "tir";

        actions.push({
            player,
            type,
            target
        });
    }

    return actions;
}


// ===============================
// 🎙️ RESUME FULL INTELLIGENT
// ===============================
function genererResumeFull(actionText, match) {

    const actions = parseActionSequence(actionText, match);

    if (!actions.length) return "Action non identifiable.";

    let phrases = [];

    for (const act of actions) {

        if (act.type === "passe" && act.target) {
            phrases.push(`${act.player} passe à ${act.target}`);
        }

        else if (act.type === "controle") {
            phrases.push(`${act.player} contrôle le ballon`);
        }

        else if (act.type === "conduite") {
            phrases.push(`${act.player} progresse balle au pied`);
        }

        else if (act.type === "tir") {
            phrases.push(`${act.player} frappe au but`);
        }

        else {
            phrases.push(`${act.player} enchaîne une action`);
        }
    }

    // ===============================
    // 🔗 CONNECTEURS NATURELS
    // ===============================
    const connectors = [
        "puis",
        "ensuite",
        "et",
        "dans la foulée",
        "immédiatement",
        "alors"
    ];

    let sentence = phrases[0];

    for (let i = 1; i < phrases.length; i++) {

        const connector = connectors[i % connectors.length];

        sentence += `, ${connector} ${phrases[i]}`;
    }

    return sentence + ".";
}


// ===============================
// 📊 NOTE DU PAVÉ
// ===============================
function noterPave(action) {

    let score = 5;

    if (!action) return 0;

    const txt = action.toLowerCase();

    // richesse
    if (txt.length > 80) score += 1;
    if (txt.length > 150) score += 1;

    // éléments techniques
    if (txt.includes("passe")) score += 1;
    if (txt.includes("contrôle") || txt.includes("controle")) score += 1;
    if (txt.includes("zone")) score += 1;
    if (txt.match(/\d+\s?m/)) score += 1;

    // précision vocabulaire
    if (txt.includes("intérieur") || txt.includes("extérieur")) score += 1;

    return Math.min(score, 10);
}


// ===============================
// ✅ VALIDATION DES ACTIONS
// ===============================
function validerAction(action) {

    if (!action) return { ok: false, reason: "Aucune action détectée" };

    const txt = action.toLowerCase();

    if (
        !txt.includes("passe") &&
        !txt.includes("tir") &&
        !txt.includes("contrôle") &&
        !txt.includes("controle")
    ) {
        return { ok: false, reason: "Action non reconnue (passe/tir/contrôle requis)" };
    }

    if (!txt.match(/\d+\s?m/)) {
        return { ok: false, reason: "Distance obligatoire (ex: 5m)" };
    }

    return { ok: true };
}

// ===============================
// 🛡️ DETECTION TARGET DEFENDER
//===============================
function detectTargetPlayer(text, players) {

    const lower = pureName(text);

    // mots clés RÉELS de duel défensif
    const keywords = [
        "face a",
        "contre",
        "bloquer",
        "bloque",
        "barrer",
        "empecher",
        "stoppe",
        "stopper",
        "se place devant",
        "se met devant",
        "vient bloquer",
        "viens bloquer",
        "bloquer le chemin",
        "bloquer le passage",
        "coupe la route"
    ];

    // 🚫 si pas d'action défensive claire
    if (!keywords.some(k => lower.includes(k))) return null;

    // 🔍 cherche joueur mentionné
    return players.find(p => {
        const name = pureName(p.nom);
        return lower.includes(name);
    }) || null;
}

// ===============================
// ⚽ VIS-À-VIS AUTO (FORMATION)
// ===============================
function generateVisAVis(team1, team2) {

    const map = {
        AG: "DD",
        AC: "DC",
        AD: "DG",

        MG: "MD",
        MC: "MC",
        MD: "MG",

        DG: "AD",
        DC: "AC",
        DD: "AG"
    };

    for (const p1 of team1) {
        const opponent = team2.find(p2 => map[p1.poste] === p2.poste);
        if (opponent) {
            p1.visavis = opponent.nom;
            opponent.visavis = p1.nom;
        }
    }
}


// ===============================
// ⚽ INIT POSITION KICK-OFF
// ===============================
function initKickoffPositions(match) {

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    for (const player of allPlayers) {
        initPlayerPosition(player);
    }

    generateVisAVis(match.lineup1, match.lineup2);
}


// ===============================
// 🎯 KICK-OFF ACTION AUTOMATIQUE
// ===============================
function kickoffStart(match) {

    const team1 = match.lineup1 || [];

    const striker = team1.find(p => p.poste === "AC");
    const midfielder = team1.find(p => p.poste === "MC");

    if (!striker || !midfielder) return "";

    match.ballHolder = midfielder.nom;
    match.activePlayer = midfielder.nom;
    match.phase = "active";

    // 👉 ON RETOURNE JUSTE LE TEXTE
    return `${striker.nom} fait une passe vers ${midfielder.nom} au centre du terrain, puis ${midfielder.nom} contrôle et prend le contrôle du jeu`;
}

// ===============================
// 🚀 START MATCH ENGINE
// ===============================
function startMatch(match) {

    initKickoffPositions(match);

    kickoffStart(match);
} 


// ===============================
// 🎯 KICK-OFF ACTION + TEXTE PRO
// ===============================
function kickoffStart(match) {

    // ✅ RESET
    match.pendingAttack = null;
    match.ballHolder = null;
    match.activePlayer = null;

    // ✅ bonne équipe (FIABLE)
    const team =
        match.joueurTour === match.id1
            ? match.lineup1
            : match.lineup2;

    if (!team) return;

    // 🔍 vrais joueurs
    const striker = team.find(p => p.poste === "AC");
    const midfielder = team.find(p => p.poste === "MC");

    if (!striker || !midfielder) return;

    // =========================
    // 📍 POSITION C2 (centre)
    // =========================
    const centerPos = convertToPosition("axe", "C2");

    if (centerPos) {
        striker.position = { ...centerPos };
        midfielder.position = { ...centerPos };

        match.ball = {
            holder: midfielder.nom,
            position: { ...centerPos },
            state: "controle"
        };
    }

    // =========================
    // 🎙️ TEXTE EXACT DEMANDÉ
    // =========================
    const action =
`(C2) ${striker.nom} fait une passe en retrait à ${midfielder.nom} qui contrôle et le match est lancé...`;

    // =========================
    // ✅ GAME STATE
    // =========================
    match.ballHolder = midfielder.nom;
    match.activePlayer = midfielder.nom;
    match.pendingAttack = action;
}

// ===============================
// 🚀 START MATCH ENGINE
// ===============================
function startMatch(match) {

    initKickoffPositions(match);

    kickoffStart(match);
} 

// ===============================
// 🧠 PARSE DRIBBLE AVANCÉ
// ===============================
function parseDribbleAdvanced(text) {

    const t = text.toLowerCase();

    return {
        hasFeint: t.includes("torse") || t.includes("feinte"),
        hasExternalTouch: t.includes("extérieur"),
        hasInternalTouch: t.includes("intérieur"),
        hasDirectionChange: t.includes("gauche") || t.includes("droite"),

        // 📏 distances
        shortTouch: extractDistanceRange(t, 0, 0.5), // 0–50cm
        pushDistance: extractDistance(t), // ex: 1m, 3m, etc

        hasAcceleration: t.includes("vmax") || t.includes("accélère") || t.includes("sprinte")
    };
}
// ===============================
// 🧠 DISTANCES
// ===============================
function extractDistance(text) {
    const m = text.match(/(\d+)\s?m/);
    return m ? parseInt(m[1]) : null;
}

function extractDistanceRange(text, min, max) {
    const m = text.match(/(\d+\.?\d*)\s?m/);
    if (!m) return false;

    const val = parseFloat(m[1]);
    return val >= min && val <= max;
}

// ===============================
// ⚖️ VALIDATION DRIBBLE RÉALISTE
// ===============================
function validateDribbleRealism(player, defender, data) {

    const atk = player.stats || {};
    const def = defender.stats || {};

    let valid = true;
    let reason = "";

    // 🔒 règle 1 : contrôle court (0–0.5m)
    if (data.hasExternalTouch || data.hasInternalTouch) {
        if (!data.shortTouch) {
            valid = false;
            reason = "Contrôle trop long (doit être ≤ 0.5m)";
        }
    }

    // 🔒 règle 2 : poussée de balle réaliste
    if (data.pushDistance !== null) {
        if (data.pushDistance < 1 || data.pushDistance > 10) {
            valid = false;
            reason = "Poussée de balle irréaliste (1m à 10m requis)";
        }
    }

    // 🔒 règle 3 : cohérence mouvement
    if (data.hasFeint && !data.hasDirectionChange) {
        valid = false;
        reason = "Feinte sans changement de direction";
    }

    if (!valid) {
        return { ok: false, reason };
    }

    // ⚔️ duel réel
    const atkScore = (atk.dri || 50) + (atk.acc || 50) * 0.5;
    const defScore = (def.def || 50) + (def.phy || 50) * 0.5;

    if (atkScore > defScore + 5) {
        return { ok: true };
    }

    if (defScore > atkScore + 5) {
        return { ok: false, reason: "bloqué" };
    }

    return { ok: false, reason: "contesté" };
}
// ===============================
// REAL KICK OFF
// ===============================
function getKickoffPair(team) {

    const ac = team.find(p => p.poste === "AC");
    const mc = team.find(p => p.poste === "MC");

    return { ac, mc };
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
    // 🔥 GESTION PAVÉ NORMAL
    // ===============================
    const handled = await handlePaveGame(ms, ovl);
    if (handled) return;

    console.log("📩 MESSAGE REÇU (hors pavé)");

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

    if (match.equipe1 && match.equipe2) return;
    if (!safeText.includes("SQUAD⚽🥅")) return;

    const parsed = parseLineupFull(safeText);

    if (!parsed || !parsed.joueurs || parsed.joueurs.length === 0) {
        return ovl.sendMessage(chat, { text: "❌ Lineup invalide ou mal formaté" });
    }

    const squadNameRaw = parsed.teamName;
    if (!squadNameRaw) {
        return ovl.sendMessage(chat, { text: "❌ Nom d'équipe introuvable" });
    }

    const normalizeTeam = str =>
        str.replace(/\p{Emoji}/gu, "").toLowerCase().trim();

    const squadName = normalizeTeam(squadNameRaw);
    const team1 = normalizeTeam(match.team1Nom);
    const team2 = normalizeTeam(match.team2Nom);

    // ✅ SENDER JID 
    const senderJid = ms.key.participant || ms.key.remoteJid;

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
            return ovl.sendMessage(chat, { text: `❌ Joueur inconnu: ${j.name}` });
        }

        const nomClean = pureName(data.name);
        if (nomsUtilises.has(nomClean)) {
            return ovl.sendMessage(chat, { text: `❌ Joueur en double: ${data.name}` });
        }

        nomsUtilises.add(nomClean);

        const posteData = POSITION_POSTES[j.poste];
        if (!posteData) {
            return ovl.sendMessage(chat, { text: `❌ Poste invalide: ${j.poste}` });
        }

        joueursValides.push({
            numero: j.numero,
            nom: data.name,
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

    if (squadName === team1 && !match.equipe1) {

        match.id1 = senderJid; // ✅ 
        match.lineup1 = joueursValides;
        match.equipe1 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation validée pour *${match.team1Nom}*`
        });

    } else if (squadName === team2 && !match.equipe2) {

        match.id2 = senderJid; // ✅ 
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

    if (match.equipe1 && match.equipe2 && !match.starting) {
        match.starting = true;

        if (match.timerLineup) {
            clearTimeout(match.timerLineup);
            match.timerLineup = null;
        }

        const imagesReady = [
            "https://files.catbox.moe/dlj5z6.jpg",
            "https://files.catbox.moe/fdadd0.jpeg",
            "https://files.catbox.moe/4104s3.jpg"
        ];

        const imageRandom = imagesReady[Math.floor(Math.random() * imagesReady.length)];

        await ovl.sendMessage(chat, {
            image: { url: imageRandom },
            caption: `⏳ Les deux formations sont prêtes.\nLe match commence dans *1 minute* 🥅⚽...`
        });

        match.timerMatch = setTimeout(() => lancerMatch(chat, ovl), 60000);
    }

    return;
}
} 
           
    // ===============================
// 🚀 LANCEMENT MATCH
// ===============================
async function lancerMatch(chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    if (match.kickoffStarted) return;
    match.kickoffStarted = true;

    const isTeam1 = Math.random() < 0.5;

    match.possession = isTeam1 ? match.team1Nom : match.team2Nom;
    match.phase = "kickoff";
    match.etat = "en_cours";
match.ball = {
    holder: null,
    position: { x: 0, y: 0 },
    state: "libre"
};
    
    match.joueurTour = isTeam1 ? match.id1 : match.id2;

    match.turnType = "attaque";
    match.pendingAttack = null;
    match.waitingDefenseFrom = null;
    match.phaseDuel = null;

    // CLEAN timers
 ["timerGlobal","warningTimer","kickoffTimer"].forEach(t => {
        if (match[t]) {
            clearTimeout(match[t]);
            match[t] = null;
        }
    });

    match.waitingKickoff = false;

    // =========================
    // 🔥 INIT SAFE
    // =========================
    const jidStart = match.joueurTour;
    const jidOpposite = jidStart === match.id1 ? match.id2 : match.id1;

    match.tour = 1;
    match.toursRestants = 5;

    match.attacker = jidStart;
    match.defender = jidOpposite;

    // ✅ INIT POSSESSIONS
match.possessions = {
    [match.id1]: 0,
    [match.id2]: 0
};

    // =========================
    // ⚠️ SAFE TERRAIN INIT (ANTI CRASH)
    // =========================
    try {

        const equipeAttack =
            match.possession === match.team1Nom
                ? match.lineup1
                : match.lineup2;

        const equipeDefense =
            match.possession === match.team1Nom
                ? match.lineup2
                : match.lineup1;

        if (equipeAttack && equipeDefense) {

            if (typeof getZoneYParLigne === "function") {
                equipeAttack.forEach(j => {
                    j.zoneY = getZoneYParLigne(j.ligne, "attaque");
                });

                equipeDefense.forEach(j => {
                    j.zoneY = getZoneYParLigne(j.ligne, "defense");
                });
            }

            if (typeof initPlayerPosition === "function") {
                match.lineup1?.forEach(j => initPlayerPosition(j));
                match.lineup2?.forEach(j => initPlayerPosition(j));
            }

            if (typeof assignerVisAVis === "function") {
                match.positions = [
                    ...(match.lineup1 || []),
                    ...(match.lineup2 || [])
                ];

                assignerVisAVis(match);
            }
            if (typeof kickoffStart === "function") {
    kickoffStart(match);
            }
        }

    } catch (e) {
        console.log("⚠️ Erreur init terrain ignorée :", e);
    }

    // =========================
    // 🎯 KICKOFF (GARANTI)
    // =========================
    const striker = (match.lineup1 || []).find(p => p.poste === "AC");
const midfielder = (match.lineup1 || []).find(p => p.poste === "MC");

if (striker && midfielder) {

    match.ballHolder = midfielder.nom;
    match.activePlayer = midfielder.nom;
    match.phase = "active";

    const displayName =
        match.names?.[jidStart] ||
        jidStart.split("@")[0];

    const imagesKickOff = [
        "https://files.catbox.moe/onotk4.jpg",
        "https://files.catbox.moe/kfw0bl.jpg"
    ];

    await ovl.sendMessage(chat, {
        image: {
            url: imagesKickOff[Math.floor(Math.random() * imagesKickOff.length)]
        },
        caption:
`🎙️⚽: KICK OFF 🥅‼️ @${displayName} débute avec la possession ! ⚽

${striker.nom} fait une passe vers ${midfielder.nom} au centre du terrain, puis ${midfielder.nom} contrôle et lance le jeu...

╰─────────────────▱▱▱
            🔷BLUELOCK⚽🥅`,
        mentions: [jidStart]
    });
}

    // =========================
    // 🚀 START ENGINE
    // =========================
    match.kickoffSent = true;

    if (match.turnTimer) {
        clearTimeout(match.turnTimer);
        match.turnTimer = null;
    }

    startMatchCycle(chat, ovl, match);
}


    /* ===============================
📩 LECTURE PAVÉ ENGINE
=================================*/
async function handlePaveGame(ms, ovl) {

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return false;

    const sender = normalizeJid(getSenderJid(ms));

    // ===============================
    // 🚫 FIND PLAYER CARD
    // ===============================
    const allPlayers = (match.lineup1 || []).concat(match.lineup2 || []);

    const playerCard = allPlayers.find(p =>
        normalizeJid(p.id || p.jid) === sender ||
        match.names?.[sender] === p.nom
    );

    // ===============================
    // 🚫 LOCK CHECK
    // ===============================
    if (playerCard && match.lockedPlayers?.has(playerCard.nom)) {

        await ovl.sendMessage(chat, {
            text:
`🚫 TU ES LOCK !

🎮 ${playerCard.nom} ne peut pas jouer ce tour.

╰───────────────────
🔷BLUELOCK⚽🥅`
        });

        return true;
    }

    const raw =
        ms.message?.conversation ||
        ms.message?.extendedTextMessage?.text ||
        ms.message?.imageMessage?.caption ||
        "";

    if (!raw) return false;

    const text = raw
        .replace(/\u200B/g, "")
        .replace(/\u200E/g, "")
        .replace(/\u200F/g, "")
        .replace(/\r/g, "")
        .trim();

    // ===============================
    // 🎯 DETECTION PAVÉ
    // ===============================
    const isPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔁:") &&
        text.includes("BLUELOCK");

    if (!isPave) return false;

    const actionCheck = extraireAction(text);

    // ===============================
    // ❌ PAVÉ INVALIDE
    // ===============================
    if (!actionCheck || actionCheck.trim().length < 5) {

        await ovl.sendMessage(chat, {
            react: { text: "❌", key: ms.key }
        });

        const loser = normalizeJid(match.joueurTour);
        const next = match.defender || match.id2;

        const loserName = match.names?.[loser] || loser.split("@")[0];
        const nextName = match.names?.[next] || next.split("@")[0];

        match.lockedPlayers = match.lockedPlayers || new Set();
        match.lockedPlayers.add(loserName);

        await ovl.sendMessage(chat, {
            text:
`❌ PAVÉ INVALIDE

🎙️ REASON : Action vide ou mal structurée

📊 NOTE DU PAVÉ : 0/10
⚡ CONTRE-ATTAQUE IMMÉDIATE !

⚽ @${nextName} récupère le ballon !
🚫 @${loserName} est LOCK jusqu’au prochain tour

╰───────────────────
               🔷BLUELOCK⚽🥅`,
            mentions: [next, loser]
        });

        match.attacker = next;
        match.defender = next === match.id1 ? match.id2 : match.id1;
        match.joueurTour = next;

        match.hasPlayed = true;
        startMatchCycle(chat, ovl, match);

        return true;
    }

    // ===============================
    // ♻️ ANALYSE
    // ===============================
    await ovl.sendMessage(chat, {
        react: { text: "♻️", key: ms.key }
    });

    await new Promise(r => setTimeout(r, 60000));

    const action = actionCheck;
    const textLower = text.toLowerCase();

    // ===============================
    // 🧠 DÉTECTION DEFENSE
    // ===============================
    const defensiveKeywords = [
        "bloque","barrer","barre","intercepte","tacle",
        "contre","stop","empêche","coupe la route",
        "en face","devant lui","posture basse",
        "stance basse","se place devant",
        "ferme l'angle","ferme la route"
    ];

    const isDefensiveMove = defensiveKeywords.some(w =>
        textLower.includes(w)
    );

    // ===============================
    // 🚀 ATTAQUE SIMPLE
    // ===============================
    if (!isDefensiveMove) {

        const resume = genererResumeFull(action, match);
        const note = noterPave(action);

        await ovl.sendMessage(chat, {
            text:
`*🛡️⚡⚽ ATTAQUE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10

➡️ @${getTagFromJid(match.attacker)} NEXT

╰───────────────────
              🔷BLUELOCK⚽🥅`
        });

        return true;
    }

    // ===============================
    // ⚽ BALL HOLDER UPDATE
    // ===============================
    const detectedPlayers = text.match(/[A-Z][a-zA-Z0-9]+/g) || [];

    if (detectedPlayers.length >= 2) {
        match.ballHolder = detectedPlayers[1];
    } else if (detectedPlayers.length === 1) {
        match.ballHolder = detectedPlayers[0];
    }

    // ===============================
    // ⚔️ DUEL PRIORITY
    // ===============================
    if (isDefensiveMove && match.phaseDuel) {

        const res = await handleDuelMatch(
            match,
            text,
            match.phaseDuel.defense
        );

        if (res.type !== "contre") {
            match.phaseDuel = null;
            match.phaseDuelResolved = true;
        }

        await ovl.sendMessage(chat, {
            text: res.message
        });

        return true;
    }

    // ===============================
    // 🎯 ATTAQUE STOCK
    // ===============================
    if (!match.pendingAttack) {

        const next =
            match.joueurTour === match.id1 ? match.id2 : match.id1;

        match.pendingAttack = action;
        match.hasPlayed = true;
        match.turnType = "defense";
        match.waitingDefenseFrom = next;

        startMatchCycle(chat, ovl, match);
        return true;
    }

    // ===============================
    // 🛡️ DEFENSE
    // ===============================
    const defense = action;

    const res = await handleDuelMatch(match, match.pendingAttack, defense);

    match.hasPlayed = true;

    // ===============================
    // 🔥 DUEL RESULT
    // ===============================
    if (res && res.message && res.type !== "normal") {

        const resume = genererResumeFull(match.pendingAttack, match);
        const note = noterPave(match.pendingAttack);

        await ovl.sendMessage(chat, {
            text:
`${res.message}

─────────────────

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10`,
            mentions: [match.joueurTour]
        });

        if (res.type === "contre") {

            match.phaseDuel = {
                attaque: match.pendingAttack,
                defense
            };

        } else {

            match.phaseDuel = null;
            match.pendingAttack = null;
            match.waitingDefenseFrom = null;
        }

        startMatchCycle(chat, ovl, match);
        return true;
    }

    // ===============================
    // 📉 DEFENSE PASSIVE
    // ===============================
    const resumeDefense = genererResumeFull(defense, match);
    const noteDefense = Math.max(2, Math.min(5, noterPave(defense)));

    await ovl.sendMessage(chat, {
        text:
`*🛡️⚔️⚽ DÉFENSE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resumeDefense}

📊 NOTE DU PAVÉ : ${noteDefense}/10

➡️ @${getTagFromJid(match.joueurTour)} NEXT

╰───────────────────
               🔷BLUELOCK⚽🥅`,
        mentions: [match.joueurTour]
    });

    // RESET
    match.pendingAttack = null;
    match.waitingDefenseFrom = null;

    match.joueurTour =
        match.joueurTour === match.id1 ? match.id2 : match.id1;

    match.turnType = "attaque";

    startMatchCycle(chat, ovl, match);

    return true;
}

    
 // ===============================
    // DÉPLACEMENTS ET POSITIONS TRACKING
    // ===============================
async function handleDeplacements(match, joueur, texte) {

    if (!joueur || !joueur.position) {
        return { ok: false, erreur: "❌ Joueur sans position" };
    }

    const zoneArrivee = extraireZoneArrivee(texte);
    const zoneDepart = extraireZoneDepart(texte);
    const distance = extraireDistance(texte);
    const direction = extraireDirectionLargeur(texte);

    let moved = false;
    let total = 0;

    // ===============================
    // 📍 MOVE Y (ZONE)
    // ===============================
    if (zoneArrivee) {

        const currentZone = getZoneFromY(joueur.position.y);

        if (zoneDepart && zoneDepart !== currentZone) {
            return { ok: false, erreur: "❌ Mauvaise zone de départ" };
        }

        const targetY = ZONES_Y[zoneArrivee];
        if (!targetY) return { ok: false, erreur: "❌ Zone invalide" };

        const distY = Math.abs(joueur.position.y - targetY);

        if (distY > 10) {
            return { ok: false, erreur: "❌ Déplacement trop long (>10m)" };
        }

        joueur.position.y = targetY;
        total += distY;
        moved = true;
    }

    // ===============================
    // ↔️ MOVE X (LATÉRAL)
    // ===============================
    if (direction) {

        const d = distance || 5;

        if (d > 10) {
            return { ok: false, erreur: "❌ Trop loin (>10m)" };
        }

        if (direction === "gauche") joueur.position.x -= d;
        if (direction === "droite") joueur.position.x += d;

        joueur.position.x = Math.max(0, Math.min(FIELD.width, joueur.position.x));

        total += d;
        moved = true;
    }

    // ===============================
    // 🔒 LIMIT GLOBAL
    // ===============================
    if (total > 10) {
        return { ok: false, erreur: "❌ Mouvement total invalide" };
    }

    if (!isInsideField(joueur.position)) {
        return { ok: false, erreur: "❌ Hors terrain" };
    }

    // ===============================
    // 🧠 UPDATE GLOBAL (ONLY ONCE)
    // ===============================
    syncPlayer(match, joueur);

    // ===============================
    // 🧠 IA SANS AUTO-REPOSITION
    // (juste réaction, PAS déplacement forcé)
    // ===============================
    const ballPos = joueur.position;

    for (const p of (match.lineup1 || []).concat(match.lineup2 || [])) {

        if (!p.position || p.nom === joueur.nom) continue;

        const dx = ballPos.x - p.position.x;
        const dy = ballPos.y - p.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let factor = dist > 20 ? 2 : dist > 10 ? 1 : 0.5;

        // 👉 seulement "pression mentale", pas déplacement automatique forcé
        p.pressure = dist < 12 ? "HAUTE" : dist < 20 ? "MOYENNE" : "FAIBLE";

        // léger ajustement défensif uniquement
        if (p.ligne === "defense" && dist < 10) {
            p.position.y += dy > 0 ? factor * 0.3 : -factor * 0.3;
        }

        p.position.x = Math.max(0, Math.min(FIELD.width, p.position.x));
        p.position.y = Math.max(0, Math.min(FIELD.length, p.position.y));

        syncPlayer(match, p);
    }

    match.lastPositionUpdate = {
        joueur: joueur.nom,
        moved,
        total,
        time: Date.now()
    };

    return {
        ok: true,
        message: moved ? "✅ Déplacement enregistré" : "ℹ️ Aucun mouvement"
    };
}


 // ===============================
    // ⚽ PASSES, INTERCEPTIONS, CONTRÔLES
    // ===============================
async function handlePasses(match, action, joueur) {

    if (!action || !joueur) {
        return { ok: false, erreur: "❌ Données invalides (passe)" };
    }

    const txt = action.toLowerCase();

    // ===============================
    // 🎯 TYPE DE PASSE
    // ===============================
    let typePasse = null;

    for (const type in TYPES_PASSES) {
        if (txt.includes(type)) {
            typePasse = type;
            break;
        }
    }

    if (!typePasse) {
        return { ok: false, erreur: "❌ Type de passe non reconnu" };
    }

    // ===============================
    // 📐 VALIDATION
    // ===============================
    const elementsObligatoires = [
        /passe/,
        /(intérieur du pied|extérieur du pied|pointe de pied|talon|tête)/,
        /(gauche|droite|devant|derrière)/,
        /(ras du sol|cm|m)/,
        /\d+\s?m/,
        /(pied|tête|torse)/
    ];

    for (const reg of elementsObligatoires) {
        if (!reg.test(txt)) {
            return { ok: false, erreur: "❌ Passe incomplète" };
        }
    }

    // ===============================
    // 🧠 PRÉCISION
    // ===============================
    const modele = TYPES_PASSES[typePasse];
    const mots = modele.toLowerCase().split(" ");

    let score = 0;
    mots.forEach(m => { if (txt.includes(m)) score++; });

    const precision = Math.round((score / mots.length) * 100);

    if (precision < 60) {
        return { ok: false, erreur: `❌ Passe mal exécutée (${precision}%)` };
    }

    // ===============================
    // 📏 DISTANCE
    // ===============================
    const dist = extraireDistance(txt);

    if (dist && dist > 30) {
        return { ok: false, erreur: "❌ Passe trop longue (>30m)" };
    }

    // ===============================
    // 🎯 INTERCEPTION
    // ===============================
    const visavis = joueur.visavis;

    if (visavis) {

        const chance =
            precision < 80 ? 0.5 :
            precision < 90 ? 0.3 : 0.15;

        if (Math.random() < chance) {

            match.possession =
                match.possession === match.team1Nom
                    ? match.team2Nom
                    : match.team1Nom;

            return {
                ok: false,
                interception: true,
                message: `🛑 Interception par ${visavis.nom} !`
            };
        }
    }

    // ===============================
    // 🎯 CIBLE PASSE
    // ===============================
    const cibleNom = txt.match(/vers\s+([a-zA-Z0-9_]+)/i)?.[1];

    let cible = null;

    if (cibleNom) {
        const all = [...(match.lineup1 || []), ...(match.lineup2 || [])];
        cible = all.find(p =>
            p.nom?.toLowerCase().includes(cibleNom.toLowerCase())
        );
    }

    // ===============================
    // ⚽ CONTRÔLE
    // ===============================
    const hasControle =
        txt.includes("contrôle") ||
        txt.includes("controle");

    if (!hasControle && cible) {

        const notePasse = joueur.stats?.pas || 70;

        if (notePasse < 85) {
            return {
                ok: false,
                erreur: "❌ Contrôle obligatoire (passe faible)"
            };
        }

        if (!txt.includes("déviation") && !txt.includes("deviation")) {
            return {
                ok: false,
                erreur: "❌ Passe sans contrôle → déviation obligatoire"
            };
        }
    }

    // ===============================
    // 📍 TRANSFERT BALLE
    // ===============================
    if (cible) {

        match.ballHolder = cible.nom;

        match.ballPosition = {
            x: cible.position?.x,
            y: cible.position?.y
        };

        updateGlobalPositions(match, cible);

        // ===============================
        // 🧠 MARKING (SANS DEPLACEMENT)
        // ===============================
        const adverses = (match.lineup1 || []).concat(match.lineup2 || []);

        for (const j of adverses) {

            if (!j.position) continue;

            const dx = cible.position.x - j.position.x;
            const dy = cible.position.y - j.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // ❗ MARKING uniquement (PAS DE MOUVEMENT)
            if (dist < 6) {
                j.marking = { target: cible.nom, intensity: "FORT" };
            } else if (dist < 12) {
                j.marking = { target: cible.nom, intensity: "MOYEN" };
            } else {
                j.marking = null;
            }

            updateGlobalPositions(match, j);
        }
    }

    // ===============================
    // 📍 ZONE UPDATE
    // ===============================
    const zoneArrivee = extraireZoneArrivee(txt);
    if (zoneArrivee) {
        joueur.zoneY = zoneArrivee;
    }

    updateGlobalPositions(match, joueur);

    return {
        ok: true,
        type: typePasse,
        precision,
        cible: cible?.nom || null
    };
}


// ===============================
// ⚽ DUELS ET MATCH UP 🆚 
// ===============================
async function handleDuelMatch(match, attaqueText, defenseText) {

    if (!attaqueText || !defenseText) {
        return { ok: false, type: "erreur", message: "❌ Duel invalide" };
    }

    // ===============================
    // 🚫 GARDIEN DUEL DÉJÀ RÉSOLU
    // ===============================
    if (match.phaseDuelResolved) {
        return {
            ok: false,
            type: "ignore",
            message: "⚠️ Duel déjà résolu"
        };
    }

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    const findPlayer = (txt) => {
        const t = pureName(txt);

        return allPlayers.find(p => {
            const n = pureName(p.nom);
            return t.includes(n) || n.includes(t);
        });
    };

    let attacker = null;

    if (match.ballHolder) {
        attacker = allPlayers.find(p => p.nom === match.ballHolder);
    }

    if (!attacker) {
        attacker = findPlayer(attaqueText);
    }

    // ===============================
    // 🛡️ DEFENDER = TEXTE DEFENSE UNIQUEMENT
    // ===============================
    let defender = findPlayer(defenseText);

    const tacticalTarget = detectTargetPlayer(defenseText, allPlayers);

    if (tacticalTarget) {
        defender = tacticalTarget;
    }

    if (!attacker || !defender) {
        return { ok: false, type: "erreur", message: "❌ Joueurs introuvables" };
    }

    // 🚫 anti SAE vs SAE
    if (pureName(attacker.nom) === pureName(defender.nom)) {
        return {
            ok: false,
            type: "ignore",
            message: "⚠️ Faux duel détecté"
        };
    }

    const atkStats = attacker.stats || {};
    const defStats = defender.stats || {};

    const atk = attaqueText.toLowerCase();
    const def = defenseText.toLowerCase();

// ===============================
// 🧠 CHASE SYSTEM (CORRIGÉ + PRIORITAIRE)
// ===============================
const actionAttacker = attaqueText;
const actionDefender = defenseText;

const chaseResult = resolveChase(
    match,
    attacker,
    defender,
    match.ball,
    actionAttacker,
    actionDefender
);

// ===============================
// ⚡ VITESSE BASE (UNE SEULE FOIS)
// ===============================
const atkVmax = atkStats.acc || 50;
const defBaseVmax = defStats.acc || 50;

// ===============================
// 🧍 POSTURE DÉFENSIVE
// ===============================
const postureDebout = ["debout", "relâché", "normal"];

const postureBasse = [
    "fléchis", "jambes fléchies", "écartées",
    "défensive", "basse", "stance basse"
];

let posture = "debout";

if (postureBasse.some(w => def.includes(w))) {
    posture = "basse";
}
else if (postureDebout.some(w => def.includes(w))) {
    posture = "debout";
}

// ===============================
// ⚙️ VITESSE DEF (VMAX)
// ===============================
let defVmax = posture === "debout"
    ? defBaseVmax * 0.5
    : defBaseVmax;

// ===============================
// 🎯 RESULT GLOBAL
// ===============================
let result = null;

// ===============================
// 🏃 CHASE PRIORITY LOGIC
// ===============================
if (chaseResult.reason === "INTERCEPTION") {

    match.ball.holder = defender.nom;
    match.ball.state = "controle";

    result = {
        ok: false,
        type: "INTERCEPTION",
        msg: `🛑 ${defender.nom} intercepte le ballon dans la course !`
    };
}
else if (chaseResult.reason === "CONSERVATION") {

    match.ball.holder = attacker.nom;
    match.ball.state = "controle";

    result = {
        ok: true,
        type: "CONSERVATION",
        msg: `⚡ ${attacker.nom} garde le contrôle du ballon !`
    };
}
else if (chaseResult.reason === "CHASE_CONTINUES") {

    match.ball.state = "loose";

    result = {
        ok: false,
        type: "CONTINUED_CHASE",
        msg: `⚽🛡️ Duel en cours...`
    };
}
 
// ===============================
// 🧱 DEFENSE PASSIVE + VITESSE
// ===============================

const passiveKeywords = [
    "se place", "devant", "barrer",
    "bloque", "ferme", "coupe la route"
];

const isPassive = passiveKeywords.some(k => def.includes(k));

if (!result && isPassive) {

    const defPower = (defStats.def || 50) + (defStats.phy || 50) * 0.3;
    const atkPower = (atkStats.acc || 50) + (atkStats.dri || 50) * 0.3;

    const speedGap = atkVmax - defVmax;

    // 💨 si attaquant trop rapide
    if (speedGap > 15) {
        result = {
            ok: true,
            type: "win",
            msg: `💨 ${attacker.nom} dépasse la défense malgré le blocage !`
        };
    }

    // 🧱 défense physique dominante
    else if (defPower > atkPower) {
        result = {
            ok: false,
            type: "stop",
            msg: `🧱 ${defender.nom} bloque la route parfaitement !`
        };
    }

    // ⚔️ duel neutre
    else {
        result = {
            ok: false,
            type: "contre",
            msg: `⚔️ ${defender.nom} gêne la progression`
        };
    }
}

// ===============================
// 🎯 DRIBBLE + BALL CONTROL IA
// ===============================
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const dribbleData = parseDribbleAdvanced(attaqueText);
const controlData = attaqueText.toLowerCase();

if (!result) {

    // ===============================
    // ⚽ BALL CONTROL (CONDUITE / POUSSÉE)
    // ===============================
    const isConduite =
        controlData.includes("conduite") ||
        controlData.includes("intérieur") ||
        controlData.includes("extérieur");

    const isPush =
        controlData.includes("pousse") ||
        controlData.includes("poussée") ||
        controlData.includes("pointe du pied");

    const distance = extraireDistance(attaqueText);
    const accBase = attacker.stats?.acc || 50;

    if (isConduite) {

        // ❌ dépasse 1m = perte de balle
        if (!distance || distance > 1) {

            result = {
                ok: false,
                type: "lose",
                msg: `❌ ${attacker.nom} perd le contrôle du ballon`
            };

        } else {

            const acc = accBase / 2;

            result = {
                ok: true,
                type: "control",
                msg: `⚽ ${attacker.nom} conduit le ballon avec précision`
            };
        }
    }

    else if (isPush) {

        // ❌ hors zone push
        if (!distance || distance < 1 || distance > 10) {

            result = {
                ok: false,
                type: "lose",
                msg: `❌ ${attacker.nom} perd le ballon sur la poussée`
            };

        } else {

            result = {
                ok: true,
                type: "sprint",
                msg: `🚀 ${attacker.nom} pousse le ballon et sprinte`
            };
        }
    }

    // ===============================
    // 🎯 DRIBBLE IA RÉALISTE
    // ===============================
    else if (dribbleData) {

        const validation = validateDribbleRealism(attacker, defender, dribbleData);

        if (validation.ok) {

            const messagesWin = [
                `🔥 ${attacker.nom} élimine ${defender.nom} avec son dribble !`,
                `⚡ ${attacker.nom} passe ${defender.nom} grâce à un geste technique !`
            ];

            result = {
                ok: true,
                type: "win",
                msg: randomChoice(messagesWin)
            };

        } else {

            if (validation.reason === "bloqué") {

                const messagesLose = [
                    `🛑 ${defender.nom} stoppe le dribble`,
                    `🧱 ${defender.nom} lit parfaitement le mouvement et bloque`
                ];

                result = {
                    ok: false,
                    type: "lose",
                    msg: randomChoice(messagesLose)
                };

            } else if (validation.reason === "contesté") {

                const messagesContre = [
                    `⚔️ Duel serré sur le dribble`,
                    `🤜🤛 ${defender.nom} résiste au dribble`
                ];

                result = {
                    ok: false,
                    type: "contre",
                    msg: randomChoice(messagesContre)
                };

            } else {

                result = {
                    ok: false,
                    type: "faute",
                    msg: `❌ Action irréaliste: ${validation.reason}`
                };
            }
        }
    }
}
    // ===============================
    // ⚖️ FALLBACK
    // ===============================
    if (!result) {
        result = { ok: false, type: "contre", msg: "⚔️ Duel en cours..." };
    }

    const next = match.attacker;

    match.phaseDuelResolved = true;

    return {
        ok: result.ok,
        type: result.type,
        message:
`*🛡️⚽ MATCH UP⚔️ !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░
${defender.nom.toUpperCase()} 🆚 ${attacker.nom.toUpperCase()}

${result.msg}

➡️ @${getTagFromJid(next)} NEXT

╰───────────────────
              🔷BLUELOCK⚽🥅`
    };
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

        // ===============================
        // ⛔ STOP SAFE ENGINE (IMPORTANT)
        // ===============================

        // 🧨 bloque les cycles startMatchCycle
        match.currentTurnId = -1;

        // ⛔ timers principaux
        if (match.turnTimer) clearTimeout(match.turnTimer);
        if (match.warningTimer) clearTimeout(match.warningTimer);

        match.turnTimer = null;
        match.warningTimer = null;

        // ⛔ anciens timers sécurité
        if (match.timerGlobal) clearTimeout(match.timerGlobal);
        if (match.timerPave) clearTimeout(match.timerPave);
        if (match.timerTour) clearTimeout(match.timerTour);
        if (match.timerKickoff) clearTimeout(match.timerKickoff);
        if (match.timerAction) clearTimeout(match.timerAction);

        match.timerGlobal =
        match.timerPave =
        match.timerTour =
        match.timerKickoff =
        match.timerAction = null;

        // ===============================
        // 🧨 STOP STATE GAME
        // ===============================
        match.etat = "arrete";
        match.kickoffStarted = false;

        match.pendingAttack = null;
        match.waitingDefenseFrom = null;
        match.phaseDuel = null;

        match.attacker = null;
        match.defender = null;

        // ===============================
        // 🗑 REMOVE GLOBAL MATCH
        // ===============================
        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text:
`⛔⚽ MATCH BLUE LOCK ARRÊTÉ 🥅

✔ Tous les cycles stoppés
✔ Timers annulés
✔ Partie supprimée

╰─────────────────▱▱▱
        🔷BLUELOCK⚽🥅`
        });

    } catch (e) {
        console.error("❌ Erreur stopmatch :", e);

        await ovl.sendMessage(ms_org, {
            text: "❌ Erreur lors de l'arrêt du match."
        });
    }
});


module.exports = { messageMatch, verifierFiche };
