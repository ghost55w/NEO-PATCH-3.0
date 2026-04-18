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

} = require("./BLmatchsetup");

// ⚠️ dépendances externes (à garder ailleurs ou setup engine global)
const {
    startGlobalTimer,
    handleDuelMatch
} = require("./BLmatchengine"); // ou ton core match runtime

/* ===============================
⚽ TERRAIN ENGINE (CORE GAMEPLAY)
=================================*/

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
function calculDistance(p1, p2) {

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

    const isPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔁:") &&
        text.includes("BLUELOCK");

    if (!isPave) return false;

    const sender = normalizeJid(getSenderJid(ms));

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

        startGlobalTimer(ovl, chat, match);
        return true;
    }

    // ===============================
    // 🎯 ATTAQUE
    // ===============================
    if (!match.pendingAttack) {

        if (sender !== normalizeJid(match.joueurTour)) {
            return true;
        }

        match.pendingAttack = text;

        const next =
            match.joueurTour === match.id1
                ? match.id2
                : match.id1;

        match.waitingDefenseFrom = next;
        match.turnType = "defense";

        startGlobalTimer(ovl, chat, match);

        return true;
    }

    // ===============================
    // 🛡️ DEFENSE
    // ===============================
    if (sender !== normalizeJid(match.waitingDefenseFrom)) {
        return true;
    }

    const attaque = match.pendingAttack;
    const defense = text;

    const res = await handleDuelMatch(match, attaque, defense);

    await ovl.sendMessage(chat, { text: res.message });

    if (res.type === "contre") {
        match.phaseDuel = { attaque, defense };
        return true;
    }

    match.pendingAttack = null;
    match.waitingDefenseFrom = null;

    match.joueurTour =
        match.joueurTour === match.id1
            ? match.id2
            : match.id1;

    match.turnType = "attaque";

    startGlobalTimer(ovl, chat, match);

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
    handlePaveGame,
    handleDeplacements,
    handlePasses
};
