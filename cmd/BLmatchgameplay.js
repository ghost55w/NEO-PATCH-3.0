/* ===============================
📦 BL MATCH GAMEPLAY ENGINE
=================================*/

const {
    matchsActifs,
    POSITION_POSTES,
    DISTANCES,
    TYPES_PASSES,

    pureName,
    normalizeJid,
    getSenderJid,

    calculDistance,
    extraireDistance,
    extraireZoneArrivee,
    extraireZoneDepart,
    extraireDirectionLargeur,
    updatePositionJoueur,
    startMatchCycle, 
     extraireAction

} = require("./BLmatchsetup");

// ===============================
// 🎙️ GAMEPLAY UTILITIES (IA / NARRATION)
// ===============================

// 👉 Résumé Action 
function resumerAction(text) {
    if (!text) return "Action inconnue";

    const t = text.toLowerCase();

    let passer = extrairePremierJoueur(text);
    let receveur = extraireDeuxiemeJoueur(text);
    let zone = extraireZoneArrivee(text);

    let resume = "";

    if (t.includes("passe")) {

        const type = extraireTypePasse(text) || "rapide";

        resume = `${passer} fait une passe ${type}`;

        if (receveur) resume += ` vers ${receveur}`;
        if (zone) resume += ` qui reçoit en ${zone}`;
    }

    else if (t.includes("contrôle") || t.includes("controle")) {
        resume = `${passer} contrôle le ballon`;
        if (zone) resume += ` et se projette vers ${zone}`;
    }

    else if (
        t.includes("fonce") ||
        t.includes("dribble") ||
        t.includes("conduite") ||
        t.includes("course")
    ) {
        resume = `${passer} part en conduite de balle`;
        if (zone) resume += ` vers ${zone}`;
    }

    else if (t.includes("tir") || t.includes("shoot")) {
        resume = `${passer} tente une frappe`;
        if (zone) resume += ` depuis ${zone}`;
    }

    else {
        resume = "Action en cours de développement";
    }

    return resume.replace(/\s+/g, " ").trim();
}


/* ===============================
⚽ TERRAIN ENGINE (CORE GAMEPLAY)
=================================*/
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
async function startMatchCycle(chat, ovl, match) {

    // 🔄 CLEAN ancien timer si bug
    if (match.turnTimer) {
        clearTimeout(match.turnTimer);
        match.turnTimer = null;
    }

    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }

    if (!match.tour) match.tour = 1;
    if (!match.toursRestants) match.toursRestants = 5;

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

    const currentTurnId = Date.now();
    match.currentTurnId = currentTurnId;
    
    match.hasPlayed = false;

    // ===============================
    // ⚠️ WARNING (1 MIN RESTANTE)
    // ===============================
    match.warningTimer = setTimeout(async () => {

        if (match.currentTurnId !== currentTurnId) return;

        const attacker = match.attacker;

        const attackerName =
            match.names?.[attacker] ||
            attacker.split("@")[0];

        await ovl.sendMessage(chat, {
            text:
`⚠️ ATTENTION @${attackerName} ❗⏳ Il ne reste que *1 MINUTE* pour jouer !

╰─────────────────▱▱▱
        🔷BLUELOCK⚽🥅`,
            mentions: [attacker]
        });

    }, TURN_TIME - 60000);

    // ===============================
    // ⏱️ FIN TOUR
    // ===============================
    match.turnTimer = setTimeout(async () => {

        if (match.currentTurnId !== currentTurnId) return;
        // 🔥 SI LE JOUEUR A JOUÉ → PAS DE LATENCE
if (match.hasPlayed) {
    startMatchCycle(chat, ovl, match);
    return;
}

        match.turnTimer = null;

        if (match.warningTimer) {
            clearTimeout(match.warningTimer);
            match.warningTimer = null;
        }

        const oldAttacker = match.attacker;

        // 🔁 SWITCH PROPRE
        match.attacker = match.defender;
        match.defender = oldAttacker;

        const newAttacker = match.attacker;

        // 📊 POSSESSIONS
        match.possessions[newAttacker] =
            (match.possessions[newAttacker] || 0) + 1;

        // ⏳ TOURS RESTANTS (FIX IMPORTANT)
        match.toursRestants -= 1;

        if (match.toursRestants <= 0) {
            match.toursRestants = 5;
            match.tour++;
        }

        const oldName =
            match.names?.[oldAttacker] ||
            oldAttacker.split("@")[0];

        const newName =
            match.names?.[newAttacker] ||
            newAttacker.split("@")[0];

        await ovl.sendMessage(chat, {
            image: { url: "https://files.catbox.moe/3n8q7l.jpg" },
            caption:
`⛔ LATENCE OUT ❌‼️

⚽ @${oldName} n’a pas joué à temps !
🔁 @${newName} récupère la possession ⚡

╰─────────────────▱▱▱
        🔷BLUELOCK⚽🥅`,
            mentions: [oldAttacker, newAttacker]
        });

        // 🔁 RELANCE
        startMatchCycle(chat, ovl, match);

    }, TURN_TIME);
}



/* ===============================
📩 LECTURE PAVÉ ENGINE
=================================*/
async function handlePaveGame(ms, ovl) {

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return false;

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
    // 🎯 DETECTION PAVÉ (comme ancien)
    // ===============================
    const isPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔁:") &&
        text.includes("BLUELOCK");

    if (!isPave) return false;

    const sender = normalizeJid(getSenderJid(ms));

    // ===============================
// ⚽ EXTRACTION ACTION (FIX STYLE ANCIEN)
// ===============================
const action = extraireAction(text);

// ❌ uniquement si le format ⚽: n'existe pas
if (action === null) {
    await ovl.sendMessage(chat, {
        text: "❌ Aucune action détectée"
    });
    return true;
}

// ✅ accepte les actions vides 
const actionSafe = action || "";

    // ===============================
    // ⚔️ DUEL PRIORITY SYSTEM
    // ===============================
    if (match.phaseDuel) {

        const res = await handleDuelMatch(
            match,
            text,
            match.phaseDuel.defense
        );

        await ovl.sendMessage(chat, { text: res.message });

        if (res.type !== "contre") {
            match.phaseDuel = null;
        }

        return true;
    }

    // ===============================
    // 🎯 ATTAQUE (LOGIQUE ANCIENNE CLEAN)
    // ===============================
    if (!match.pendingAttack) {

        if (sender !== normalizeJid(match.joueurTour)) return true;

        match.pendingAttack = text;
        match.hasPlayed = true;

        const next =
            match.joueurTour === match.id1
                ? match.id2
                : match.id1;

        match.waitingDefenseFrom = next;
        match.turnType = "defense";

        const resume = resumerAction(action);

        await ovl.sendMessage(chat, {
            text:
`🛡️⚡⚽ ATTAQUE !
▔▔▔▔▔▔▔▔▔▔▔▔
🎙️ : ${resume}

➡️ NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`
        });

        return true;
    }

    // ===============================
    // 🛡️ DEFENSE
    // ===============================
    if (sender !== normalizeJid(match.waitingDefenseFrom)) return true;

    const attaque = match.pendingAttack;
    const defense = text;

    const res = await handleDuelMatch(match, attaque, defense);

    match.hasPlayed = true;

    await ovl.sendMessage(chat, { text: res.message });

    // ===============================
    // ⚠️ CONTRE
    // ===============================
    if (res.type === "contre") {
        match.phaseDuel = { attaque, defense };
        return true;
    }

    // ===============================
    // 🔁 RESET NORMAL
    // ===============================
    match.pendingAttack = null;
    match.waitingDefenseFrom = null;

    match.joueurTour =
        match.joueurTour === match.id1
            ? match.id2
            : match.id1;

    match.turnType = "attaque";

    return true;
}

/* ===============================
🚶 DEPLACEMENTS ENGINE
=================================*/
async function handleDeplacements(match, action, joueur) {

    if (!action || !joueur) {
        return { ok: false, erreur: "❌ Action invalide" };
    }

    const txt = action.toLowerCase();

    const direction = extraireDirectionLargeur(txt);
    const distance = extraireDistance(txt);
    const zoneArrivee = extraireZoneArrivee(txt);

    // ===============================
    // 📍 POSITION CHECK
    // ===============================
    if (match.phase !== "kickoff") {

        if (joueur.zoneY && txt.includes("zone")) {

            const zoneDepart = extraireZoneDepart(txt);

            if (zoneDepart && zoneDepart !== joueur.zoneY) {
                return {
                    ok: false,
                    erreur: "❌ Mauvaise position"
                };
            }
        }
    }

    // ===============================
    // 📏 ZONE MOVE
    // ===============================
    if (zoneArrivee) {

        const dist = calculDistance(joueur.zoneY, zoneArrivee);

        if (dist > 30) {
            return {
                ok: false,
                erreur: "❌ Déplacement trop long"
            };
        }

        joueur.zoneY = zoneArrivee;
    }

    // ===============================
    // ↔️ LATERAL MOVE
    // ===============================
    if (direction && distance) {

        if (distance > 15) {
            return {
                ok: false,
                erreur: "❌ Trop grand déplacement"
            };
        }

        updatePositionJoueur(joueur, direction, distance);
    }

    return { ok: true, joueur };
}

/* ===============================
🎯 PASSES ENGINE
=================================*/
async function handlePasses(match, action, joueur) {

    if (!action || !joueur) {
        return { ok: false, erreur: "❌ Données invalides" };
    }

    const txt = action.toLowerCase();

    // ===============================
    // 🎯 TYPE PASSE
    // ===============================
    let type = null;

    for (const t in TYPES_PASSES) {
        if (txt.includes(t)) {
            type = t;
            break;
        }
    }

    if (!type) {
        return { ok: false, erreur: "❌ Type de passe inconnu" };
    }

    // ===============================
    // 📐 VALIDATION BASE
    // ===============================
    const required = [
        /passe/,
        /(pied|tête|torse)/,
        /(gauche|droite)/,
        /\d+\s?m/
    ];

    for (const r of required) {
        if (!r.test(txt)) {
            return {
                ok: false,
                erreur: "❌ Passe incomplète"
            };
        }
    }

    // ===============================
    // 📊 PRECISION ENGINE
    // ===============================
    const model = TYPES_PASSES[type];
    const words = model.split(" ");

    let score = 0;

    for (const w of words) {
        if (txt.includes(w)) score++;
    }

    const precision = Math.round((score / words.length) * 100);

    if (precision < 60) {
        return {
            ok: false,
            erreur: "❌ Passe trop imprécise"
        };
    }

    // ===============================
    // 📏 DISTANCE LIMIT
    // ===============================
    const dist = extraireDistance(txt);

    if (dist && dist > 30) {
        return {
            ok: false,
            erreur: "❌ Distance max dépassée"
        };
    }

    // ===============================
    // 🛑 INTERCEPTION SYSTEM
    // ===============================
    const visavis = joueur.visavis;

    if (visavis && Math.random() < 0.3) {

        match.possession =
            match.possession === match.team1Nom
                ? match.team2Nom
                : match.team1Nom;

        return {
            ok: false,
            interception: true,
            message: `🛑 Interception par ${visavis.nom}`
        };
    }

    // ===============================
    // ✅ SUCCESS
    // ===============================
    return {
        ok: true,
        type,
        precision
    };
}

/* ===============================
📦 EXPORTS
=================================*/
module.exports = {

    // 🎮 CORE GAMEPLAY
    handlePaveGame,
    handleDeplacements,
    handlePasses,
    startMatchCycle, 

    // 🎙️ NARRATION IA
    resumerAction
};
