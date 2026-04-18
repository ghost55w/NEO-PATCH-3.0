/* ===============================
📦 BL MATCH GAMEPLAY ENGINE
=================================*/

const matchsActifs = require("./matchState"); // adapte si besoin
const {
    matchsActifs,
    POSITION_POSTES,
    DISTANCES,
    pureName,
    findBlueLockPlayer
} = require("./BLmatchsetup");

// ===============================
// 📩 LECTURE PAVÉ
// ===============================
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
    // ⚔️ DUEL PRIORITY
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
            await ovl.sendMessage(chat, {
                text: "❌ Pas ton tour"
            });
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

        await ovl.sendMessage(chat, {
            text: `🛡️ ATTAQUE VALIDÉE`
        });

        return true;
    }

    // ===============================
    // 🛡️ DEFENSE
    // ===============================
    if (sender !== normalizeJid(match.waitingDefenseFrom)) {
        await ovl.sendMessage(chat, {
            text: "❌ Pas à toi de défendre"
        });
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

// ===============================
// 🚶 DEPLACEMENTS (FIXÉ)
// ===============================
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
    // 📏 MOVE LIMIT
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
                erreur: "❌ Trop grand déplacement latéral"
            };
        }

        updatePositionJoueur(joueur, direction, distance);
    }

    updateGlobalPositions(match, joueur);

    return { ok: true, joueur };
}

// ===============================
// 🎯 PASSES (NETTOYÉ)
// ===============================
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
    // 📊 PRECISION
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
    // 📏 DISTANCE MAX
    // ===============================
    const dist = extraireDistance(txt);

    if (dist && dist > 30) {
        return {
            ok: false,
            erreur: "❌ Distance max dépassée"
        };
    }

    // ===============================
    // 🛑 INTERCEPTION SIMPLE
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

// ===============================
// 📦 EXPORTS
// ===============================
module.exports = {
    handlePaveGame,
    handleDeplacements,
    handlePasses
};
