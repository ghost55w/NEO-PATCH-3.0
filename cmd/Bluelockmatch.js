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

    // ✅ FIX IMPORTANT : parsing teamName robuste (emoji safe + flexible)
    const teamName = text
        .match(/SQUAD[^:]*:\s*(.+)/i)?.[1]
        ?.replace(/[*_]/g, "")
        ?.replace(/╰.*|▔.*/g, "")
        ?.trim();

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

//Trouver le Vis à VIS
function findVisAVis(player, opponentTeam) {

    const target = getVisAVisPoste(player.poste);

    if (!target) return null;

    return opponentTeam.find(p => 
        POSITION_POSTES[p.poste]?.ligne === target.ligne &&
        POSITION_POSTES[p.poste]?.zoneX === target.zoneX
    ) || null;
}

function getVisAVisPoste(poste) {

    const p = POSITION_POSTES[poste];
    if (!p) return null;

    let targetLigne;
    let targetZoneX = p.zoneX;

    // ===============================
    // 🔁 MIRROR LIGNE
    // ===============================
    if (p.ligne === "attaque") targetLigne = "defense";
    else if (p.ligne === "defense") targetLigne = "attaque";
    else targetLigne = "milieu";

    // ===============================
    // 🔁 MIRROR GAUCHE / DROITE
    // ===============================
    let mirrorZoneX = p.zoneX;

    if (p.zoneX === "gauche") mirrorZoneX = "droite";
    else if (p.zoneX === "droite") mirrorZoneX = "gauche";

    return {
        ligne: targetLigne,
        zoneX: mirrorZoneX
    };
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

    const lower = text.toLowerCase();

    // mots clés de duel défensif
    const keywords = [
        "devant",
        "face à",
        "sur",
        "contre",
        "bloquer",
        "barrer",
        "empêcher",
        "stoppe",
        "stopper"
    ];

    if (!keywords.some(k => lower.includes(k))) return null;

    // 🔍 cherche un joueur mentionné après ou autour
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

    const teamA = match.lineup1 || [];
    const teamB = match.lineup2 || [];

    const mcA = teamA.find(
        p => p.poste?.toUpperCase().includes("MC")
    );

    const mcB = teamB.find(
        p => p.poste?.toUpperCase().includes("MC")
    );

    let starter = null;

    if (match.kickoffTeam === 1) {
        starter = mcA || teamA[0];
    }
    else if (match.kickoffTeam === 2) {
        starter = mcB || teamB[0];
    }
    else {
        return "";
    }

    if (!starter) return "";

    match.ballHolder = starter.nom;
    match.activePlayer = starter.nom;
    match.phase = "active";
    match.zone = "C2";

    return `(C2) ${starter.nom} lance le jeu ⚽...`;
}


// ===============================
// 🎯 EXTRACTION COMPLÈTE DISTANCE RANGE
// ===============================
function extractDistanceRange(text = "") {

    const m = text.match(/(\d+(?:\.\d+)?)\s*m/);

    if (!m) return null;

    const value = parseFloat(m[1]);

    return {
        value,
        isShort: value <= 0.5,
        isMedium: value > 0.5 && value <= 1,
        isLong: value > 1
    };
}

// ===============================
// 🎲 RANDOMIZER
// ===============================
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===============================
// 🧭 ANGLE NORMALISATION
// ===============================
function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
}

// ===============================
// 🧍 BODY STATE
// ===============================
function getBodyState(angle) {

    angle = normalizeAngle(angle);

    if (angle >= 0 && angle < 45) return "front";
    if (angle >= 45 && angle < 135) return "right";
    if (angle >= 135 && angle < 225) return "back";
    if (angle >= 225 && angle < 315) return "left";

    return "front";
}

// ===============================
// 🔄 ROTATION PLAYER
// ===============================
function rotatePlayer(player, deltaAngle) {

    if (!player.bodyAngle) player.bodyAngle = 0;

    player.bodyAngle = normalizeAngle(player.bodyAngle + deltaAngle);

    player.bodyState = getBodyState(player.bodyAngle);

    return player.bodyState;
}

// ===============================
// ⚽ RELATIVE POSITION
// ===============================
function getRelativePosition(player, target) {

    const dx = target.x - player.x;
    const dy = target.y - player.y;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const relativeAngle = normalizeAngle(angle - (player.bodyAngle || 0));

    return getBodyState(relativeAngle);
}

// ===============================
// 🧠 DISTANCE ENTRE 2 POINTS
// ===============================
function getDistance(pos1, pos2) {

    if (!pos1 || !pos2) return 0;

    return Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) +
        Math.pow(pos2.y - pos1.y, 2)
    );
}

// ===============================
// ⚔️ VALIDATION TACLE
// ===============================
function validateTackle(defender, attacker, text = "") {

    const t = text.toLowerCase();

    const hasSlide = t.includes("tacle glissé");
    const hasStand = t.includes("tacle debout");
    const hasCircle = t.includes("tacle circulaire");

    let type = null;

    if (hasStand) type = "stand";
    else if (hasSlide) type = "slide";
    else if (hasCircle) type = "circle";

    const distance = extractDistance(text);

    const direction =
        t.includes("gauche") ? "left" :
        t.includes("droite") ? "right" :
        t.includes("face") ? "front" : null;

    const power = defender.stats?.def || 50;

    const successRate = power + Math.random() * 20;

    const atkPower = attacker.stats?.dri || 50;

    const success = successRate > atkPower;

    return {
        ok: success,
        type,
        distance,
        direction,
        successRate
    };
}

// ===============================
// ⚡ SPEED COMPUTATION
// ===============================
function computeSpeed(player, mode = "normal") {

    const base = player.stats?.acc || 50;

    if (mode === "sprint") return base * 1.5;
    if (mode === "walk") return base * 0.6;

    return base;
}

// ===============================
// 🧠 REACTION WINDOW
// ===============================
function computeReactionWindow(diff) {

    if (diff > 10) return "after_sprint";
    if (diff > 0) return "after_combo";
    return "anytime";
}

// ===============================
// 🧠 TARGET PLAYER DETECTION
// ===============================
function detectTargetPlayer(text, players) {

    const t = pureName(text);

    return players.find(p => {
        const n = pureName(p.nom);
        return t.includes(n);
    });
}

// ===============================
// 🧠 BALL STATE INIT
// ===============================
function initBall(match, position = { x: 0, y: 0 }) {

    match.ball = {
        holder: null,
        state: "neutral",
        position
    };
                            }


// ===============================
// 🧠 MATCH ENGINE UTILITIES CORE
// ===============================

// ===============================
// 🔁 NORMALISATION ANGLE
// ===============================
function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
}

// ===============================
// 🧍 BODY STATE SYSTEM (0–360°)
// ===============================
function getBodyState(angle) {
    angle = normalizeAngle(angle);

    if (angle >= 0 && angle < 45) return "front";
    if (angle >= 45 && angle < 135) return "right";
    if (angle >= 135 && angle < 225) return "back";
    if (angle >= 225 && angle < 315) return "left";

    return "front";
}

// ===============================
// 🧍 UPDATE BODY ORIENTATION
// ===============================
function updateBody(player, text) {

    if (!player.bodyAngle) player.bodyAngle = 0;

    const t = text.toLowerCase();

    if (t.includes("pivot du torse 180")) player.bodyAngle += 180;
    if (t.includes("pivot gauche 90")) player.bodyAngle -= 90;
    if (t.includes("pivot droite 90")) player.bodyAngle += 90;
    if (t.includes("tour complet") || t.includes("360")) player.bodyAngle += 360;

    player.bodyAngle = normalizeAngle(player.bodyAngle);
    player.bodyState = getBodyState(player.bodyAngle);
}

// ===============================
// 📏 EXTRACTION NOMBRE (DISTANCE)
// ===============================
function extractNumber(str) {
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[0]) : null;
}

// ===============================
// 🧠 LEVENSHTEIN (FUZZY MATCH)
// ===============================
function levenshtein(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {

            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// ===============================
// 🧠 PARSER IA PAVÉ INTELLIGENT
// ===============================
function parsePlayerIntent(text, players) {

    if (!text) return null;

    const t = text.toLowerCase();

    // ===============================
    // ⚽ PLAYERS FUZZY DETECTION
    // ===============================
    function findBestPlayer(word) {
        if (!word) return null;

        let best = null;
        let bestScore = 0;

        for (const p of players) {
            const name = p.nom.toLowerCase();

            let score = 0;

            if (name === word) score = 100;
            else if (name.includes(word) || word.includes(name)) score = 80;
            else if (levenshtein(name, word) <= 2) score = 60;

            if (score > bestScore) {
                bestScore = score;
                best = p;
            }
        }

        return bestScore >= 60 ? best : null;
    }

    // ===============================
    // ⚙️ ACTIONS
    // ===============================
    const actions = [];

    const actionMap = {
        run: ["fonce", "cours", "accélère", "sprinte", "vmax"],
        dribble: ["dribble", "crochet", "feinte", "roulette"],
        pass: ["passe", "donne", "transmet", "centre"],
        shoot: ["tir", "frappe", "shoot"],
        defend: ["tacle", "bloque", "intercepte"]
    };

    for (const key in actionMap) {
        if (actionMap[key].some(w => t.includes(w))) {
            actions.push(key);
        }
    }

    // ===============================
    // 🧭 DIRECTION
    // ===============================
    let direction = "none";

    if (t.includes("gauche")) direction = "left";
    else if (t.includes("droite")) direction = "right";
    else if (t.includes("devant") || t.includes("face") || t.includes("tout droit")) direction = "front";
    else if (t.includes("diagonale")) direction = "diagonal";

    // ===============================
    // 🦶 FOOT
    // ===============================
    let foot = null;

    if (t.includes("pied gauche")) foot = "left";
    else if (t.includes("pied droit")) foot = "right";

    // ===============================
    // 📏 DISTANCES
    // ===============================
    const ballDistance = extractNumber(t);

    let targetDistance = null;
    if (t.includes("1m")) targetDistance = 1;
    if (t.includes("2m")) targetDistance = 2;
    if (t.includes("5m")) targetDistance = 5;
    if (t.includes("10m")) targetDistance = 10;

    // ===============================
    // 👥 PLAYERS DETECTION
    // ===============================
    const detectedPlayers = [];

    for (const p of players) {
        if (t.includes(p.nom.toLowerCase())) {
            detectedPlayers.push(p);
        }
    }

    // ===============================
    // 📦 OUTPUT FINAL
    // ===============================
    return {
        players: detectedPlayers.length ? detectedPlayers : null,
        actions,
        intent: {
            direction,
            foot,
            ballDistance,
            targetDistance
        }
    };
}

// ===============================
// 🧪 SAFE PLAYER FINDER (STRICT + FALLBACK)
// ===============================
function findPlayerStrict(text, players) {

    const t = text.toLowerCase();

    let found = players.find(p => {
        const name = p.nom.toLowerCase();
        return t.includes(name);
    });

    return found || null;
}

/* ===============================
🧠 INTENT HELPER
=================================*/

function hasIntent(txt = "", patterns = []) {

    txt = txt.toLowerCase();

    return patterns.some(pattern => {

        const words = pattern
            .toLowerCase()
            .split(" ")
            .filter(Boolean);

        return words.every(word =>
            txt.includes(word)
        );
    });
}


/* ===============================
🛑 PASSIVE BLOCK PATTERNS
=================================*/

const PASSIVE_BLOCK_PATTERNS = [

    // blocage simple
    "bloque",
    "blocage",

    // route / trajectoire
    "coupe la route",
    "coupe la trajectoire",
    "barre la route",
    "barre le chemin",
    "bloque la trajectoire",

    // accès / passage
    "bloque le passage",
    "ferme le passage",
    "obstrue le passage",
    "bouche le passage",
    "bouche l'accès",
    "ferme l'accès",

    // positionnement
    "se met devant",
    "reste devant",
    "vient devant",
    "s'interpose",

    // empêcher
    "empêche d'avancer",
    "empêche la progression",
    "ralentit la progression"

];


/* ===============================
⚽ DRIBBLE PATTERNS
=================================*/

const DRIBBLE_PATTERNS = [

    // conduite
    "conduite de balle",
    "conduit le ballon",
    "avance balle aux pieds",
    "progresse balle aux pieds",

    // dribbles
    "dribble",
    "feinte",
    "crochet",
    "roulette",
    "double contact",
    "flip flap",

    // progression
    "fonce",
    "sprint",
    "accélère",
    "perce",
    "transperce",

    // élimination
    "élimine",
    "dépasse",
    "efface",
    "prend de vitesse"

];


// ===============================
// JOUEUR TOUR 
// ===============================
function setJoueurTour(match, player) {
    const jid = player?.id || player?.jid;

    if (!jid) {
        console.log("❌ setJoueurTour refusé: player invalide");
        return;
    }

    match.joueurTour = normalizeJid(jid);
}

function safeGetNextPlayer(match) {
    const current = normalizeJid(match.joueurTour);

    if (current === normalizeJid(match.id1)) return match.id2;
    if (current === normalizeJid(match.id2)) return match.id1;

    console.log("⚠️ joueurTour cassé, reset auto");

    // fallback safe
    return match.id1;
}

function normalizeJidSafe(jid) {
    if (!jid) return null;
    return jid.includes("@") ? jid : null;
}

function setJoueurTour(match, player) {
    const jid = player?.id || player?.jid || player;

    const safe = normalizeJidSafe(jid);

    if (!safe) {
        console.log("❌ LOCK V2: tentative joueurTour invalide rejetée", player);
        return false;
    }

    match.joueurTour = safe;
    match._lastJoueurTourUpdate = Date.now();
    return true;
                     }


function getNextPlayer(match) {
    const id1 = normalizeJidSafe(match.id1);
    const id2 = normalizeJidSafe(match.id2);
    const current = normalizeJidSafe(match.joueurTour);

    if (!id1 || !id2) return null;

    if (current === id1) return id2;
    if (current === id2) return id1;

    console.log("⚠️ LOCK V2: joueurTour cassé → reset id1");
    return id1;
}

// ===============================
// 🧠 UTILS ENGINE (LOCK SYSTEM V2)
// ===============================

function normalizeJidSafe(jid) {
    if (!jid) return null;
    return jid.includes("@") ? jid : null;
}

function getTagSafe(jid) {
    const safe = normalizeJidSafe(jid);
    if (!safe) return "⚠️";

    return getTagFromJid(safe);
}

function setJoueurTour(match, player) {
    const jid = player?.id || player?.jid || player;
    const safe = normalizeJidSafe(jid);

    if (!safe) return false;

    match.joueurTour = safe;
    return true;
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

    // ===============================
    // 🧠 RAW NAMES (DISPLAY ONLY)
    // ===============================
    match.team1Name = team1[1].trim();
    match.team2Name = team2[1].trim();
    match.gardien = gardien ? gardien[1].trim() : "Non défini";
    match.scoreWin = score ? score[1].trim() : "2";

    // ===============================
    // 🧤 GAME SETTINGS
    // ===============================
    match.gardienLevel = gardien
        ? Math.max(70, parseInt(gardien[1].trim()) || 70)
        : 70;

    match.winScore = score
        ? parseInt(score[1].match(/\d+/)?.[0]) || 2
        : 2;

    // ===============================
    // 👤 RESOLVE USERS (OWNERS)
    // ===============================
    const j1 = await trouverUser(match.team1Name);
    const j2 = await trouverUser(match.team2Name);

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

    // ===============================
    // 🔷 TEAMS (SOURCE OF TRUTH)
    // ===============================

    // owners WhatsApp
    match.id1 = j1;
    match.id2 = j2;

    // display names only
    match.team1Name = match.team1Name;
    match.team2Name = match.team2Name;

    match.etat = "attente_lineup";

    // lineups
    match.equipe1 = null;
    match.equipe2 = null;

    // ===============================
    // 📊 STATS INIT (BASED ON OWNERS)
    // ===============================
    match.possessionIndex = {
        [match.id1]: 0,
        [match.id2]: 0
    };

    match.actionsRestantes = {
        [match.id1]: 4,
        [match.id2]: 4
    };

    match.role = {
        [match.id1]: "attack",
        [match.id2]: "defense"
    };

    // ===============================
    // 🎨 CONFIRMATION
    // ===============================
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
👤 Team 1: ${match.team1Name}
👤 Team 2: ${match.team2Name}
🧤 Gardien: ${match.gardien}

╰───────────────────
               *🔷BLUELOCK⚽*`
    });

    await ovl.sendMessage(chat, {
        text: `📢 ${match.team1Name} et ${match.team2Name} ⏳ *Vous avez 2 minutes pour envoyer votre Lineup dans l'arène, ⚠️Ne tapez pas la commande ici.*`
    });

    // ===============================
    // ⏳ TIMER LINEUP
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
// 📋 GESTION LINEUP
// ===============================
// ===============================
// 📋 LINEUP HANDLER
// ===============================
if (match.etat === "attente_lineup") {

    // ❌ sécurité : stop si déjà rempli
    if (match.equipe1 && match.equipe2) return;

    // ❌ sécurité : message non lineup
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

    // ===============================
    // 🧠 NORMALISATION SIMPLE (DISPLAY ONLY)
    // ===============================
    const normalizeTeam = str =>
        (str || "").toLowerCase().trim();

    const squadName = normalizeTeam(squadNameRaw);
    const team1 = normalizeTeam(match.team1Name);
    const team2 = normalizeTeam(match.team2Name);

    // ===============================
    // 👤 OWNER IDENTIFICATION
    // ===============================
    const senderJid = ms.key.participant || ms.key.remoteJid;

    const joueursValides = [];
    const nomsUtilises = new Set();
    const playersDB = Object.values(cardsBlueLock);

    // ===============================
    // ⚽ BUILD LINEUP (PLAYER CARDS)
    // ===============================
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

        // ===============================
        // 🧩 PLAYER CARD STRUCTURE
        // ===============================
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

    // ===============================
    // 🔷 TEAM 1 OWNER (id1)
    // ===============================
    if (squadName === team1 && !match.equipe1) {

        match.id1 = senderJid;              // 👈 OWNER TEAM 1
        match.lineup1 = joueursValides;     // 👈 PLAYER CARDS
        match.equipe1 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation validée pour *${match.team1Name}*`
        });
    }

    // ===============================
    // 🔷 TEAM 2 OWNER (id2)
    // ===============================
    else if (squadName === team2 && !match.equipe2) {

        match.id2 = senderJid;              // 👈 OWNER TEAM 2
        match.lineup2 = joueursValides;     // 👈 PLAYER CARDS
        match.equipe2 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation validée pour *${match.team2Name}*`
        });
    }

    // ===============================
    // ❌ INVALID TEAM
    // ===============================
    else {
        return ovl.sendMessage(chat, {
            text: "❌ Équipe non reconnue ou déjà envoyée"
        });
    }

    // ===============================
    // 🚀 START MATCH (ONLY WHEN READY)
    // ===============================
    if (match.equipe1 && match.equipe2 && !match.starting) {

        match.starting = true;

        // 🧹 cleanup timer lineup
        if (match.timerLineup) {
            clearTimeout(match.timerLineup);
            match.timerLineup = null;
        }

        const imagesReady = [
            "https://files.catbox.moe/dlj5z6.jpg",
            "https://files.catbox.moe/fdadd0.jpeg",
            "https://files.catbox.moe/4104s3.jpg"
        ];

        const imageRandom =
            imagesReady[Math.floor(Math.random() * imagesReady.length)];

        // 🎬 kickoff warning
        await ovl.sendMessage(chat, {
            image: { url: imageRandom },
            caption: `⏳ Les deux formations sont prêtes.\nLe match commence dans *1 minute* 🥅⚽...`
        });

        // ⏱️ start match engine
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

    match.kickoffTeam = isTeam1 ? 1 : 2;

    // ===============================
    // 👥 TEAMS (USER IDS)
    // ===============================
    match.id1 = match.id1; // Team 1 user
    match.id2 = match.id2; // Team 2 user

    // ===============================
    // ⚽ POSSESSION INIT
    // ===============================
    match.joueurTour = isTeam1 ? match.id1 : match.id2;

    const currentTeam = match.joueurTour;
    const opponentTeam =
        currentTeam === match.id1 ? match.id2 : match.id1;

    // ===============================
    // 🧠 POSSESSION LOGIC CLEAN
    // ===============================
    match.possession = currentTeam;

    // IMPORTANT : ATTACK = celui qui joue
    match.attacker = currentTeam;
    match.defender = opponentTeam;

    // ===============================
    // 🔄 RESET MATCH STATE
    // ===============================
    match.etat = "en_cours";
    match.phase = "kickoff";

    match.turnType = "attaque";
    match.pendingAttack = null;
    match.waitingDefenseFrom = null;
    match.phaseDuel = null;

    match.ball = {
        holder: null,
        position: { x: 0, y: 0 },
        state: "libre"
    };

    // ===============================
    // 📊 INIT STATS
    // ===============================
    match.possessions = {
        [match.id1]: 0,
        [match.id2]: 0
    };

    match.tour = 1;
    match.toursRestants = 5;

    // ===============================
    // 🧹 CLEAN TIMERS (UNIQUEMENT LOCAL)
    // ===============================
    ["warningTimer", "kickoffTimer"].forEach(t => {
        if (match[t]) {
            clearTimeout(match[t]);
            match[t] = null;
        }
    });

    // ===============================
    // 🧠 SAFE TERRAIN INIT
    // ===============================
    try {

        const equipeAttack =
            currentTeam === match.id1
                ? match.lineup1
                : match.lineup2;

        const equipeDefense =
            currentTeam === match.id1
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
        }

    } catch (e) {
        console.log("⚠️ Terrain init error ignorée:", e);
    }

// =========================
// 🎯 KICKOFF (GARANTI)
// =========================
const kickoffText = kickoffStart(match);

if (kickoffText) {
// ===============================
// 👥 TEAM START
// ===============================
const teamStart = match.joueurTour;
const tag = getTagFromJid(teamStart);

const imagesKickOff = [
    "https://files.catbox.moe/onotk4.jpg",
    "https://files.catbox.moe/kfw0bl.jpg"
];

// ===============================
// ⚽ MESSAGE KICK OFF
// ===============================
await ovl.sendMessage(chat, {
    image: {
        url: imagesKickOff[Math.floor(Math.random() * imagesKickOff.length)]
    },
    caption:
`🎙️⚽ KICK OFF 🥅‼️ @${tag} débute avec la possession ! ⚽

${kickoffText}

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
    mentions: [teamStart]
}); 

    // ===============================
    // ⏱️ WARNING TIMER (5 MIN)
    // ===============================
    if (match.warningTimer) clearTimeout(match.warningTimer);

    match.warningTimer = setTimeout(async () => {

        const m = matchsActifs.get(chat);
        if (!m) return;
        if (m.phaseDuel?.active) return;

        const attacker = m.joueurTour;

        await ovl.sendMessage(chat, {
            text:
`⚠️ @${attacker.split("@")[0]}

⏳ Il reste *1 MINUTE* pour jouer !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [attacker]
        });

    }, 5 * 60 * 1000);

    // ===============================
    // ⛔ TIMEOUT (6 MIN → NEXT TEAM)
    // ===============================
    if (match.turnTimer) clearTimeout(match.turnTimer);

    match.turnTimer = setTimeout(async () => {

        const m = matchsActifs.get(chat);
        if (!m) return;
        if (m.phaseDuel?.active) return;

        const current = m.joueurTour;
        const next = current === m.id1 ? m.id2 : m.id1;

        m.joueurTour = next;
        m.waitingAttackFrom = null;

        await ovl.sendMessage(chat, {
            text:
`⛔ LATENCE OUT ❌

🔁 CHANGEMENT DE POSSESSION

➡️ @${next.split("@")[0]} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
            mentions: [next]
        });

    }, 6 * 60 * 1000);
}
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
    //🚫 FIND PLAYER CARD
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

// ===============================
// ❌ PAVÉ VIDE OU MAL FORMÉ
// ===============================
 const actionCheck = extraireAction(text);
    
if (!actionCheck || actionCheck.trim().length < 5) {

    await ovl.sendMessage(chat, {
        react: { text: "❌", key: ms.key }
    });

    // ===============================
    // 👤 JOUEUR PERDANT
    // ===============================
    const loser = normalizeJid(match.joueurTour);

    const loserPlayer =
        [...(match.lineup1 || []), ...(match.lineup2 || [])]
        .find(p => normalizeJid(p.id || p.jid) === loser);

    const loserName = loserPlayer?.nom || loser.split("@")[0];

    // ===============================
    // ⚽ NEXT VIA VIS-A-VIS (PRIORITÉ)
    // ===============================
    let nextPlayer = null;

    if (loserPlayer) {
        nextPlayer = findVisAVis(loserPlayer, 
            loserPlayer === match.lineup1?.find(p => p.id === loserPlayer.id)
                ? match.lineup2
                : match.lineup1
        );
    }

    // 🔁 FALLBACK SAFE
    if (!nextPlayer) {
        const fallbackTeam =
            loser === match.id1 ? match.id2 : match.id1;

        nextPlayer = [...(match.lineup1 || []), ...(match.lineup2 || [])]
            .find(p => normalizeJid(p.id || p.jid) === fallbackTeam);
    }

    const next = nextPlayer?.id || nextPlayer?.jid || match.id2;
    const nextName = nextPlayer?.nom || next.split("@")[0];

    // ===============================
    // 🚫 LOCK UPDATE
    // ===============================
    match.lockedPlayers = match.lockedPlayers || new Set();
    match.lockedPlayers.add(loserName);

    // ===============================
    // 🔁 POSSESSION UPDATE CLEAN
    // ===============================
    match.joueurTour = next;
    match.attacker = next;
    match.defender = loser;
    match.pendingAttack = null;

    // ===============================
    // 📩 MESSAGE CONTRE-ATTAQUE
    // ===============================
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

    // ===============================
    // ⛔ CLEAN TIMERS (CRUCIAL)
    // ===============================
    if (match.turnTimer) {
        clearTimeout(match.turnTimer);
        match.turnTimer = null;
    }

    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }

    // ===============================
    // 🧠 IMPORTANT
    // ===============================
    match.phaseDuel = null;

    return true;
}
    
    // ===============================
    // ♻️ ANALYSE
    // ===============================
    await ovl.sendMessage(chat, {
    react: { text: "♻️", key: ms.key }
});

    await new Promise(r => setTimeout(r, 1000));

   const action = actionCheck;

console.log("========== DEBUG DUEL ==========");
console.log("phaseDuel =", match.phaseDuel);
console.log("joueurTour =", match.joueurTour);
console.log("sender =", sender);
console.log("waitingDefenseFrom =", match.waitingDefenseFrom);
console.log("================================");
        
/* ===============================
🧠 ACTION TEXT
=================================*/

const actionText = action.toLowerCase();

   
// ===============================
// ⚽ ATTAQUE PHASE DUEL
// ===============================
if (match.phaseDuel?.active && match.phaseDuel.step === "attack_pave") {

    match.phaseDuel.attackPave = action;
    match.phaseDuel.step = "defense_pave";

    const attacker = match.phaseDuel.attacker;
    const defender = match.phaseDuel.defender;

    const actionText = action.toLowerCase();

    // ===============================
    // 🧠 RESUME ACTION
    // ===============================
    let resume = "";

    if (hasIntent(actionText, DRIBBLE_PATTERNS)) {
        resume = `${attacker.nom} tente un dribble pour éliminer ${defender.nom}.`;
    }
    else if (actionText.includes("acceleration") || actionText.includes("vmax")) {
        resume = `${attacker.nom} accélère pour dépasser ${defender.nom}.`;
    }
    else if (actionText.includes("feinte")) {
        resume = `${attacker.nom} tente une feinte pour tromper ${defender.nom}.`;
    }
    else {
        resume = `${attacker.nom} enchaîne une action face à ${defender.nom}.`;
    }

    const note = noterPave(action);

    // ===============================
// 🔥 NEXT = DEFENSEUR DU DUEL
// ===============================
const nextId = match.defender;
const nextTag = getTagFromJid(nextId);
    
    // ===============================
    // ⚽ STATE SYNC (IMPORTANT)
    // ===============================
    match.ballHolder = attacker.nom;
    match.joueurTour = nextId;
    match.waitingDefenseFrom = nextId;

    // ===============================
    // 📩 MESSAGE ATTACK
    // ===============================
    await ovl.sendMessage(chat, {
        text:
`*🛡️⚡⚽ ATTAQUE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [nextId]
    });

    // ===============================
    // ⚠️ WARNING
    // ===============================
    if (match.warningTimer) clearTimeout(match.warningTimer);

    match.warningTimer = setTimeout(async () => {

        if (match.joueurTour !== nextId) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ @${nextTag} ❗⏳

Il reste *1 MINUTE* pour défendre !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [nextId]
        });

    }, 5 * 60 * 1000);

    // ===============================
    // ⏱️ LATENCE OUT (UNIFORM FIX)
    // ===============================
    if (match.defenseTimer) clearTimeout(match.defenseTimer);

    match.defenseTimer = setTimeout(() => {

        if (match.joueurTour !== nextId) return;

        const fallback =
            getVisavisPlayer(match, attacker) || defender;

        const fallbackId = fallback?.id || fallback?.jid;

        match.joueurTour = fallbackId;
        match.attacker = fallbackId;
        match.ballHolder = fallback?.nom;

        match.phaseDuel = null;
        match.pendingAttack = null;
        match.waitingDefenseFrom = null;

        const fallbackTag = getTagFromJid(fallbackId);

        ovl.sendMessage(chat, {
            text:
`⛔ LATENCE OUT ❌

🔁 ${defender.nom} récupère la possession !

➡️ @${fallbackTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
            mentions: [fallbackId]
        });

    }, 6 * 60 * 1000);

    return true;
}
    
/* ===============================
⚽ OFFENSIVE INTENT
=================================*/

const isDribbleAction = hasIntent(
    actionText,
    DRIBBLE_PATTERNS
);


/* ===============================
🛡️ PASSIVE DEFENSE INTENT
=================================*/

const isPassiveDefense = hasIntent(
    actionText,
    PASSIVE_BLOCK_PATTERNS
); 

// ===============================
// 🛡️ DUEL PHASE DEFENSE
// ===============================
if (
    match.phaseDuel?.active &&
    match.phaseDuel?.step === "defense_pave"
) {

    const attacker = match.phaseDuel.attacker;
    const defender = match.phaseDuel.defender;

    // évite double réponse
    if (match.phaseDuel.defensePave) return true;

    match.phaseDuel.defensePave = action;
    match.phaseDuel.step = "resolve_duel";

    const actionText = action.toLowerCase();

    // ===============================
    // 🧠 RESUME DEFENSE
    // ===============================
    let resume = "";

    if (
        actionText.includes("tacle")
    ) {
        resume =
            `${defender.nom} tente un tacle pour stopper l'action.`;
    }
    else if (
        actionText.includes("intercepte")
    ) {
        resume =
            `${defender.nom} tente une interception.`;
    }
    else if (
        actionText.includes("bloque")
    ) {
        resume =
            `${defender.nom} tente de fermer l'espace.`;
    }
    else if (
        actionText.includes("contre")
    ) {
        resume =
            `${defender.nom} tente un contre défensif.`;
    }
    else {
        resume =
            `${defender.nom} répond à l'action offensive.`;
    }

    const note = noterPave(action);

    // ===============================
    // ⏱️ STOP TIMERS DEFENSE
    // ===============================
    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }

    if (match.defenseTimer) {
        clearTimeout(match.defenseTimer);
        match.defenseTimer = null;
    }

    // ===============================
    // 📩 MESSAGE DEFENSE
    // ===============================
    await ovl.sendMessage(chat, {
        text:
`*🛡️⚔️ DÉFENSE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10

⏳ Résolution du duel...

╰───────────────────
🔷BLUELOCK⚽🥅`
    });

    // ===============================
// 🚀 RESOLUTION CENTRALE
// ===============================
const duelResult = await handleDuelMatch(
    match,
    match.phaseDuel.attackPave,
    match.phaseDuel.defensePave
);

console.log("🔥 DUEL RESULT =", duelResult);

if (!duelResult) {
    console.log("❌ duelResult undefined");
    return true;
}

const duelType = duelResult.type;

// ===============================
// 🔥 POSSESSION
// ===============================
let nextPlayer;

if (duelResult.ok) {
    nextPlayer = attacker;
    match.ballHolder = attacker.nom;
}
else {
    nextPlayer = defender;
    match.ballHolder = defender.nom;
}

const nextId =
    nextPlayer.id ||
    nextPlayer.jid;

const nextTag =
    getTagFromJid(nextId);

// ===============================
// ⚽ SYNC
// ===============================
match.joueurTour = nextId;
match.attacker = nextId;

match.phaseDuel = null;
match.pendingAttack = null;
match.waitingDefenseFrom = null;

// ===============================
// 📩 MESSAGE FINAL
// ===============================
await ovl.sendMessage(chat, {
    text:
`*🛡️⚽ RÉSOLUTION DU DUEL !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

${duelResult.msg}

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
    mentions: [nextId]
});

return true;

// ===============================
// 🎯 ATTAQUE⚽
// ===============================
if (!match.pendingAttack) {

    const attackerId = match.joueurTour;

    const attackerPlayer =
        [...(match.lineup1 || []), ...(match.lineup2 || [])]
        .find(p =>
            normalizeJid(p.id || p.jid) === attackerId
        );

    if (attackerPlayer) {
        match.ballHolder = attackerPlayer.nom;
    }

    match.pendingAttack = action;
    match.hasPlayed = true;

    const resume = genererResumeFull(action, match);
    const note = noterPave(action);

    // ===============================
    // 🔥 NEXT
    // ===============================  
const nextId =
    attackerId === match.id1
        ? match.id2
        : match.id1;

const nextTag = getTagFromJid(nextId);

    // ===============================
    // ⚽ ÉTAT MATCH
    // ===============================
    match.waitingDefenseFrom = nextId;
match.joueurTour = nextId;

match.attacker = attackerId;
match.defender = nextId;

    // ===============================
    // ⚠️ WARNING
    // ===============================
    match.warningTimer = setTimeout(async () => {

        if (!match.pendingAttack) return;
        if (match.joueurTour !== nextId) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ @${nextTag} ❗⏳

Il reste *1 MINUTE* pour répondre !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [nextId]
        });

    }, 5 * 60 * 1000);

    // ===============================
    // ⏳ LATENCE OUT
    // ===============================
    match.turnTimer = setTimeout(async () => {

        if (!match.pendingAttack) return;
        if (match.joueurTour !== nextId) return;

        const fallback =
            getVisavisPlayer(match, attackerPlayer) ||
            attackerPlayer;

        const fallbackId =
            fallback?.id ||
            fallback?.jid ||
            attackerId;

        const oldTag = getTagFromJid(attackerId);
        const newTag = getTagFromJid(fallbackId);

        match.pendingAttack = null;
        match.waitingDefenseFrom = null;

        match.attacker = fallbackId;
        match.defender = attackerId;
        match.joueurTour = fallbackId;

        await ovl.sendMessage(chat, {
            text:
`⛔ *LATENCE OUT ❌*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

⚽ @${oldTag} n’a pas répondu !
🔁 @${newTag} récupère la possession

╰───────────────────
🔷BLUELOCK⚽🥅`,
            mentions: [attackerId, fallbackId]
        });

    }, 6 * 60 * 1000);

    // ===============================
    // 📩 MESSAGE
    // ===============================
    await ovl.sendMessage(chat, {
        text:
`*🛡️⚡⚽ ATTAQUE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [nextId]
    });

    return true;
}


// ===============================
// 🛡️ DEFENSE
// ===============================
const defense = action;

// ===============================
// ⚠️ VALIDATION
// ===============================
if (!match.pendingAttack) return false;

// ===============================
// ⚔️ RESOLUTION DUEL
// ===============================
const res = await handleDuelMatch(
    match,
    match.pendingAttack,
    defense
);

match.hasPlayed = true;

// ===============================
// 🔥 MATCH UP INIT ⚽🆚 
// ===============================
if (res && res.type === "PASSIVE_BLOCK") {

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

   const attacker = allPlayers.find(
    p => normalizeJid(p.id || p.jid) === normalizeJid(match.attacker)
) || res.attacker;

const defender = allPlayers.find(
    p => normalizeJid(p.id || p.jid) === normalizeJid(match.defender)
) || res.defender; 

    match.phaseDuel = {
        active: true,
        step: "attack_pave",
        attacker,
        defender,
        attackPave: null,
        defensePave: null,
        starterAttack: match.pendingAttack,
        starterDefense: defense
    };

    // ===============================
// 🔥 NEXT MATCH UP
// ===============================
const nextId = match.attacker;

const nextTag = getTagFromJid(nextId);

    // ⚽ SYNC CLEAN
    match.joueurTour = nextId;
match.waitingDefenseFrom = nextId;
    
    match.ballHolder = attacker.nom;

    await ovl.sendMessage(chat, {
        text:
`*🛡️⚽ MATCH UP⚔️ !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░
${attacker.nom.toUpperCase()} 🆚 ${defender.nom.toUpperCase()}

${res.msg}

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [nextId]
    });
// ===============================
    // ⚠️ WARNING 1 MIN
    // ===============================
    if (match.warningTimer) clearTimeout(match.warningTimer);

    match.warningTimer = setTimeout(async () => {

        if (match.phaseDuel?.step !== "attack_pave") return;
        if (match.joueurTour !== nextId) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ @${nextTag} ❗⏳

Il reste *1 MINUTE* pour jouer le duel !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [nextId]
        });

    }, 5 * 60 * 1000);
    
    // ===============================
    // ⏱️ LATENCE OUT (SAFE)
    // ===============================
    if (match.defenseTimer) clearTimeout(match.defenseTimer);

    match.defenseTimer = setTimeout(() => {

        if (match.phaseDuel?.active && match.phaseDuel.step === "attack_pave") {

            const fallback =
                getVisavisPlayer(match, attacker) || defender;

            const finalNext = fallback?.id || fallback?.jid || nextId;

            match.joueurTour = finalNext;
            match.attacker = finalNext;
            match.ballHolder = fallback?.nom || attacker.nom;

            match.phaseDuel = null;
            match.pendingAttack = null;
            match.waitingDefenseFrom = null;

            ovl.sendMessage(chat, {
                text:
`⛔ LATENCE OUT ❌

🔁 MATCH UP TERMINÉ

➡️ @${getTagFromJid(finalNext)} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
                mentions: [finalNext]
            });
        }

    }, 6 * 60 * 1000);

    return true;
}
    
// ===============================
// 📉 FALLBACK : DEFENSE PASSIVE
// ===============================
const resumeDefense = genererResumeFull(defense, match);
const noteDefense = Math.max(2, Math.min(5, noterPave(defense)));


// ===============================
// 🔥 NEXT UNIFIED (FIX IMPORTANT)
// ===============================
const baseNext =
    match.joueurTour ||
    match.id1;

const fallbackPlayer =
    [ ...(match.lineup1 || []), ...(match.lineup2 || []) ]
    .find(p => normalizeJid(p.id || p.jid) === baseNext);

const nextId =
    fallbackPlayer?.id ||
    fallbackPlayer?.jid ||
    baseNext;

const nextTag = getTagFromJid(nextId);

// ===============================
// ⚽ SYNC SAFE STATE
// ===============================
match.joueurTour = nextId;
match.attacker = nextId;
match.ballHolder = fallbackPlayer?.nom || match.ballHolder;

match.pendingAttack = null;
match.waitingDefenseFrom = null;
match.phaseDuelResolved = false;

// ===============================
// 📩 MESSAGE DEFENSE
// ===============================
await ovl.sendMessage(chat, {
    text:
`*🛡️⚔️⚽ DÉFENSE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resumeDefense}

📊 NOTE DU PAVÉ : ${noteDefense}/10

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
    mentions: [nextId]
});

// ===============================
// ⚠️ WARNING 1 MIN
// ===============================
if (match.warningTimer) clearTimeout(match.warningTimer);

match.warningTimer = setTimeout(async () => {

    if (match.phaseDuel?.active) return;
    if (match.joueurTour !== nextId) return;

    await ovl.sendMessage(chat, {
        text:
`⚠️ @${nextTag} ❗⏳

Il reste *1 MINUTE* pour jouer !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
        mentions: [nextId]
    });

}, 5 * 60 * 1000);

// ===============================
// ⏱️ LATENCE SAFE
// ===============================
if (match.defenseTimer) clearTimeout(match.defenseTimer);

match.defenseTimer = setTimeout(() => {

    if (match.phaseDuel?.active) return;
    if (match.joueurTour !== nextId) return;

    const opponent =
        nextId === match.id1 ? match.id2 : match.id1;

    const fallbackOpponent =
        [ ...(match.lineup1 || []), ...(match.lineup2 || []) ]
        .find(p => normalizeJid(p.id || p.jid) === opponent);

    const finalOpponent =
        fallbackOpponent?.id ||
        fallbackOpponent?.jid ||
        opponent;

    match.joueurTour = finalOpponent;

    ovl.sendMessage(chat, {
        text:
`⛔ LATENCE OUT ❌

🔁 CHANGEMENT DE POSSESSION

➡️ @${getTagFromJid(finalOpponent)} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [finalOpponent]
    });

}, 6 * 60 * 1000);

// ===============================
// 🔁 CLEAN STATE (SAFE ORDER)
// ===============================
return true;
}

// ===============================
// ⚽ DUELS ET MATCH UP 🆚
// ===============================
async function handleDuelMatch(match, attaqueText, defenseText) {

    if (!attaqueText || !defenseText) {
        return {
            ok: false,
            type: "erreur",
            message: "❌ Duel invalide"
        };
    }

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    // ===============================
    // 🔍 FIND PLAYER
    // ===============================
    const findPlayer = (txt) => {

        const t = pureName(txt);

        return allPlayers.find(p => {

            const n = pureName(p.nom);

            return t.includes(n) || n.includes(t);

        }) || null;
    };

    let attacker = null;

    // ===============================
    // ⚽ PORTEUR PRIORITAIRE
    // ===============================
    if (match.ballHolder) {

        attacker = allPlayers.find(
            p => p.nom === match.ballHolder
        );

        if (!attacker) {
            attacker = allPlayers[0];
        }
    }

    // fallback
    if (!attacker) {
        attacker = findPlayer(attaqueText);
    }

    let defender = findPlayer(defenseText);

    // ===============================
    // 🧠 TARGET TACTIQUE
    // ===============================
    const tacticalTarget =
        detectTargetPlayer(defenseText, allPlayers);

    if (tacticalTarget) {
        defender = tacticalTarget;
    }

    // ===============================
    // ❌ VALIDATION
    // ===============================
    if (!attacker || !defender) {

        return {
            ok: false,
            type: "erreur",
            message: "❌ Joueurs introuvables"
        };
    }

    const atkStats = attacker.stats || {};
    const defStats = defender.stats || {};

    const atk = attaqueText.toLowerCase();
    const def = defenseText.toLowerCase();

    // ===============================
    // 🎯 RESULT GLOBAL
    // ===============================
    let result = null;

// ===============================
// ⚡ VITESSE
// ===============================
const atkVmax = atkStats.acc || 50;
const defBaseVmax = defStats.acc || 50;

// ===============================
// 🧍 POSTURE DÉFENSIVE
// ===============================
const postureDebout = [
    "debout",
    "relâché",
    "normal"
];

const postureBasse = [
    "fléchis",
    "jambes fléchies",
    "jambes écartées",
    "défensive",
    "basse",
    "stance basse"
];

let posture = "debout";

if (
    postureBasse.some(w => def.includes(w))
) {
    posture = "basse";
}

else if (
    postureDebout.some(w => def.includes(w))
) {
    posture = "debout";
}

// ===============================
// ⚙️ VMAX DEF
// ===============================
let defVmax =
    posture === "debout"
        ? defBaseVmax * 0.5
        : defBaseVmax;

// ===============================
// 🧱 DÉFENSE PASSIVE SIMPLE 
// ===============================
const passiveKeywords = [
    "se place",
    "devant",
    "barrer",
    "bloque",
    "ferme",
    "coupe la route",
    "bloque le passage",
    "posture défensive",
    "défense basse",
    "barre la route",
    "empêche l'avancée",
    "obstrue",
    "reste devant",
    "fait écran"
];

const isPassive =
    passiveKeywords.some(k =>
        atk.includes(k) || def.includes(k)
    );

// 🔥 PRIORITÉ ABSOLUE
if (isPassive) {
    return {
        ok: false,
        type: "PASSIVE_BLOCK",
        attacker,
        defender,
        msg: `⚔️ ${defender.nom} gêne la progression`
    };
}

// ===============================
// ⚽ DRIBBLES OFFICIELS
// ===============================
const DRIBBLES = [
    "crochet extérieur",
    "crochet intérieur",
    "double contact",
    "roulette",
    "elastico",
    "petit pont",
    "rainbow",
    "step over",
    "feinte de corps",
    "feinte de frappe",
    "feinte de passe",
    "changement de direction",
    "pivot du torse",
    "contrôle semelle",
    "conduite intérieure",
    "conduite extérieure",
    "double crochet",
    "dribble rapide",
    "protection de balle",
    "tourne sur lui même",
    "sortie en accélération",
    "push balle",
    "dribble court",
    "dribble long"
];

// ===============================
// 🎯 DÉTECTION TECHNIQUE
// ===============================
const isDribbleAction =
    DRIBBLES.some(d => atk.includes(d));

const isTackleAction =
    def.includes("tacle") ||
    def.includes("intercepte") ||
    def.includes("contre") ||
    def.includes("pied") ||
    def.includes("talon");

// ===============================
// ⚽ DUEL TECHNIQUE
// DRIBBLE vs TACLE
// ===============================
if (
    !result &&
    isDribbleAction &&
    isTackleAction
) {

    const attackStat =
        atkStats.dri || 50;

    const defenseStat =
        defStats.def || 50;

    const attackerWins =
        attackStat > defenseStat;

    if (attackerWins) {

        match.joueurTour =
            attacker.id || attacker.jid;

        result = {
            ok: true,
            type: "DRIBBLE_WIN",

            attacker,
            defender,

            msg:
`🔥⚽ ${attacker.nom} élimine son adversaire et conserve le ballon...`
        };

    } else {

        match.joueurTour =
            defender.id || defender.jid;

        result = {
            ok: false,
            type: "DRIBBLE_LOSE",

            attacker,
            defender,

            msg:
`⚽🥅 ${defender.nom} remporte le duel et récupère le ballon...`
        };
    }
}

// ===============================
// 💪 DUELS PHYSIQUES
// ===============================
const physicalKeywords = [
    "épaule",
    "coup d'épaule",
    "avant bras",
    "paume",
    "contact",
    "pousser",
    "bouscule"
];

const isPhysical =
    physicalKeywords.some(
        k =>
            atk.includes(k) ||
            def.includes(k)
    );

if (!result && isPhysical) {

    const atkPhy = atkStats.phy || 50;
    const defPhy = defStats.phy || 50;

    const diffPhy = defPhy - atkPhy;

    // ===============================
    // 🧱 VALIDATION ÉPAULE
    // ===============================
    const isShoulder =
        def.includes("épaule");

    const validTarget =
        def.includes("épaule droite") ||
        def.includes("épaule gauche");

    // ❌ faute
    if (isShoulder && !validTarget) {

        const zone = match.zone || "C2";

        const isPenalty =
            zone === "A1";

        result = {
            ok: false,
            type: "faute",
            msg:
`❌ Faute ! (${isPenalty ? "PENALTY" : "COUP FRANC"})`
        };
    }

    // ===============================
    // 💥 RÉSOLUTION PHYSIQUE
    // ===============================
    else {

        // 💥 chute
        if (diffPhy > 15) {

            match.fallenPlayer =
                attacker.nom;

            result = {
                ok: false,
                type: "chute",
                msg:
`💥 ${attacker.nom} est envoyé au sol par ${defender.nom}`
            };
        }

        // ⚖️ déséquilibre
        else if (diffPhy > 0) {

            match.unbalancedPlayer =
                attacker.nom;

            result = {
                ok: false,
                type: "déséquilibre",
                msg:
`⚖️ ${attacker.nom} perd l'équilibre`
            };
        }

        // 🤜🤛 équilibre
        else if (diffPhy === 0) {

            match.unbalancedPlayer =
                attacker.nom;

            result = {
                ok: false,
                type: "déséquilibre",
                msg:
`🤜🤛 Duel physique équilibré`
            };
        }

        // 💪 résistance
        else {

            match.unbalancedPlayer =
                defender.nom;

            result = {
                ok: true,
                type: "win_physical",
                msg:
`💪 ${attacker.nom} résiste au contact`
            };
        }
    }
}

// ===============================
// 🏃 CHASE SYSTEM
// ===============================
const chaseKeywords = [
    "poursuit",
    "poursuivre",
    "rattrape",
    "rattraper",
    "course",
    "sprinte",
    "court",
    "chasse",
    "revient sur"
];

let isChase =
    chaseKeywords.some(
        k =>
            atk.includes(k) ||
            def.includes(k)
    ) ||
    (
        extractDistance(atk) &&
        extractDistance(atk) > 2.5
    );

// ===============================
// 🔒 RESTRICTIONS CHASE
// ===============================
const distance =
    extractDistance(atk) || 1;

// ❌ pas de chase proche
if (distance <= 2) {
    isChase = false;
}

// ❌ pas de chase ballon contrôlé
if (
    match.ball?.state === "controle"
) {
    isChase = false;
}

// ❌ pas si déjà duel résolu
if (result) {
    isChase = false;
}

// ===============================
// 🚀 EXECUTION CHASE
// ===============================
if (!result && isChase) {

    const chaseResult = resolveChase(
        match,
        attacker,
        defender,
        match.ball,
        attaqueText,
        defenseText
    );

    // 🛑 interception
    if (
        chaseResult.reason ===
        "INTERCEPTION"
    ) {

        match.ball.holder =
            defender.nom;

        match.ball.state =
            "controle";

        result = {
            ok: false,
            type: "INTERCEPTION",
            msg:
`🛑 ${defender.nom} intercepte le ballon dans la course !`
        };
    }

    // ⚡ conservation
    else if (
        chaseResult.reason ===
        "CONSERVATION"
    ) {

        match.ball.holder =
            attacker.nom;

        match.ball.state =
            "controle";

        result = {
            ok: true,
            type: "CONSERVATION",
            msg:
`⚡ ${attacker.nom} garde le contrôle du ballon !`
        };
    }

    // 🏃 poursuite continue
    else if (
        chaseResult.reason ===
        "CHASE_CONTINUES"
    ) {

        match.ball.state = "loose";

        result = {
            ok: false,
            type: "CONTINUED_CHASE",
            msg:
`🏃 Duel de course toujours en cours...`
        };
    }
}

// ===============================
// ⚖️ FALLBACK
// ===============================
if (!result) {

    result = {
        ok: false,
        type: "contre",
        msg:
`⚔️ Duel en cours...`
    };
}
    
// ===============================
// 📤 RETURN SIMPLE
// ===============================
return {
    ok: result.ok,
    type: result.type,

    attacker,
    defender,

    msg: result.msg
};


// ===============================
// ⚽ DRIBBLE VS DEFENSE ENGINE (FULL IA + PHYSIQUE + BODY SYSTEM)
// ===============================

function resolveDribbleDuel(match, attacker, defender, attackText, defenseText) {

    const atk = attacker.stats || {};
    const def = defender.stats || {};

    const tA = (attackText || "").toLowerCase();
    const tD = (defenseText || "").toLowerCase();

    // ===============================
    // 🧭 BODY ORIENTATION UPDATE
    // ===============================
    function updateBody(player, text) {

        if (!player.bodyAngle) player.bodyAngle = 0;

        if (text.includes("pivot du torse 180")) player.bodyAngle += 180;
        if (text.includes("pivot gauche 90")) player.bodyAngle -= 90;
        if (text.includes("pivot droite 90")) player.bodyAngle += 90;
        if (text.includes("tour complet") || text.includes("360")) player.bodyAngle += 360;

        player.bodyAngle = normalizeAngle(player.bodyAngle);
        player.bodyState = getBodyState(player.bodyAngle);
    }

    updateBody(attacker, attackText);
    updateBody(defender, defenseText);

    const attackerState = attacker.bodyState || "front";
    const defenderState = defender.bodyState || "front";

    // ===============================
    // ⚽ DRIBBLES RECONNUS
    // ===============================
    const DRIBBLES = [
        "crochet extérieur","crochet intérieur","double contact","roulette",
        "elastico","petit pont","rainbow","step over","feinte de corps",
        "feinte de frappe","feinte de passe","changement de direction",
        "pivot du torse","contrôle semelle","conduite intérieure",
        "conduite extérieure","double crochet","dribble rapide",
        "protection de balle","tourne sur lui même",
        "sortie en accélération","push balle","dribble court","dribble long"
    ];

    const isDribble = DRIBBLES.some(d => tA.includes(d));

    // ===============================
    // 🧠 INTENTION
    // ===============================
    const intent = {
        foot:
            tA.includes("pied gauche") ? "left" :
            tA.includes("pied droit") ? "right" : null,

        surface:
            tA.includes("extérieur du pied") ? "outside" :
            tA.includes("intérieur du pied") ? "inside" :
            tA.includes("semelle") ? "sole" :
            tA.includes("pointe du pied") ? "toe" :
            tA.includes("talon") ? "heel" : null,

        direction:
            tA.includes("gauche") ? "left" :
            tA.includes("droite") ? "right" : null,

        distance: extractDistance(tA),

        sprint:
            tA.includes("vmax") ||
            tA.includes("accélère") ||
            tA.includes("fonce")
    };

    // ===============================
    // ⚖️ VALIDATION DRIBBLE
    // ===============================
    if (isDribble) {

        if (!intent.foot) {
            return { ok: false, type: "faute", msg: "❌ Dribble raté : pied non précisé" };
        }

        if (!intent.surface) {
            return { ok: false, type: "faute", msg: "❌ Dribble raté : surface du pied non précisée" };
        }

        if (intent.distance !== null && intent.distance < 0.3) {
            return { ok: false, type: "faute", msg: "❌ Contrôle trop collé au pied" };
        }
    }

    // ===============================
    // 🧠 TIMING
    // ===============================
    const diff = (atk.dri || 50) - (def.def || 50);

    let reactionWindow =
        diff > 10 ? "after_sprint" :
        diff > 0 ? "after_combo" :
        "anytime";

    // ===============================
    // 🧠 BODY ADVANTAGE
    // ===============================
    const bodyAdvantage =
        (attackerState === "front" && defenderState === "back") ? 5 :
        (attackerState === "left" && defenderState === "right") ? 3 :
        (attackerState === "right" && defenderState === "left") ? 3 : 0;

    // ===============================
    // 🧱 TACLE SYSTEM
    // ===============================
    const tackle = validateTackle(defender, attacker, defenseText);

    function computeBallAfterTackle(tackle) {

        let distance = tackle.distance;

        if (!distance) {
            if (tackle.type === "stand") distance = 2 + Math.random() * 3;
            if (tackle.type === "slide") distance = 1.5 + Math.random() * 2.5;
            if (tackle.type === "circle") distance = 1 + Math.random() * 2;
        }

        let dx = 0, dy = 0;

        if (tackle.type === "stand") dy = -distance;

        if (tackle.type === "slide") {
            dx = tackle.direction === "left" ? -distance :
                 tackle.direction === "right" ? distance : 0;
            if (!tackle.direction) dy = -distance;
        }

        if (tackle.type === "circle") {
            const angle = (tackle.direction === "left" ? -45 : 45);
            dx = distance * Math.cos(angle);
            dy = distance * Math.sin(angle);
        }

        return { dx, dy };
    }

    // ===============================
    // ❌ ANTICIPATION
    // ===============================
    if (tackle.ok && reactionWindow === "after_combo") {
        return { ok: false, type: "divination", msg: `❌ ${defender.nom} anticipe trop tôt` };
    }

    if (tackle.ok && reactionWindow === "after_sprint") {
        return { ok: false, type: "divination", msg: "❌ Anticipation illégale" };
    }

    // ===============================
    // 🛑 INTERCEPTION
    // ===============================
    if (tackle.ok && tackle.type === "win_clean") {

        match.ball.holder = defender.nom;
        match.ball.state = "controle";

        const move = computeBallAfterTackle(tackle);
        match.ball.position = move;

        return {
            ok: false,
            type: "INTERCEPTION",
            msg: `🛑 ${defender.nom} récupère le ballon proprement`
        };
    }

    // ===============================
    // ⚔️ FINAL DUEL
    // ===============================
    const atkPower = (atk.dri || 50) + bodyAdvantage;
    const defPower = def.def || 50;

    const gap = atkPower - defPower;

    if (gap > 0) {
        return {
            ok: true,
            type: intent.sprint ? "escape" : "win",
            msg: intent.sprint
                ? `🚀 ${attacker.nom} élimine ${defender.nom} et accélère`
                : `🔥 ${attacker.nom} élimine ${defender.nom}`
        };
    }

    if (Math.abs(gap) <= 5) {
        return {
            ok: false,
            type: "contre",
            msg: `⚔️ Duel serré entre ${attacker.nom} et ${defender.nom}`
        };
    }

    return {
        ok: false,
        type: "stop",
        msg: `🧱 ${defender.nom} stoppe l'action`
    };
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
