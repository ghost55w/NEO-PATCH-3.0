// ===============================

// 📦 DONNÉES STATIQUES (externalisées)
const _data = require("../lib/bluelock_data.json");
const DRIBBLES = _data.DRIBBLES;
const DRIBBLE_BLUEPRINTS = _data.DRIBBLE_BLUEPRINTS;
const TACKLE_BLUEPRINTS = _data.TACKLE_BLUEPRINTS;
const PASSIVE_BLOCK_PATTERNS = _data.PASSIVE_BLOCK_PATTERNS;
const DRIBBLE_PATTERNS = _data.DRIBBLE_PATTERNS;

// 📦 IMPORTS
const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

// ================================================================
// 🗺️ BLUELOCK PLAYER TRACKER — MODULE COMPLET
// À injecter dans Bluelockmatch.js
// ================================================================

// ================================================================
// SECTION 1 : CONSTANTES TERRAIN
// ================================================================
// Le terrain est une grille 30x60 (largeur x profondeur)
// Zones Y (profondeur) : C2=30, C1=25, B2=20, B1=15, A2=10, A1=5
// Zones X (largeur)   : G=0, CG=7, C=15, CD=23, D=30

const ZONE_Y_MAP = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
const ZONE_X_MAP = { G: 0, CG: 7, C: 15, CD: 23, D: 30 };

// ================================================================
// SECTION 2 : INIT TRACKER (appelé au lancement du match)
// ================================================================
function initTracker(match) {
    match.tracker = {
        // Snapshot de chaque joueur par nom
        joueurs: {},

        // Historique global de toutes les actions
        historique: [],

        // Tour courant
        tour: 0,

        // Position du ballon
        balle: { x: 15, y: 30, zone: "C", holder: null },

        // Stats du match
        stats: {
            passes: 0,
            tirs: 0,
            duels: 0,
            deplacements: 0,
            possessionId1: 0,
            possessionId2: 0
        }
    };

    // Initialiser chaque joueur dans le tracker
    const allPlayers = [...(match.lineup1 || []), ...(match.lineup2 || [])];

    for (const j of allPlayers) {
        if (!match.tracker.joueurs[j.nom]) {
            trackerInitJoueur(match, j);
        }
    }

    // ============================================================
    // 🔄 Attribution du vis-à-vis initial
    // ============================================================
    for (const j of allPlayers) {

        const snap = match.tracker.joueurs[j.nom];
        if (!snap) continue;

        const opponentTeam =
            (match.lineup1 || []).includes(j)
                ? match.lineup2
                : match.lineup1;

        const vis = findVisAVis(j, opponentTeam);

        if (vis) {
            snap.visAVis = vis.nom;
        }
    }
}


// ================================================================
// SECTION 3 : INIT JOUEUR DANS LE TRACKER
// ================================================================

function trackerInitJoueur(match, joueur) {
    if (!match.tracker) return;

    // Position initiale selon zoneX/zoneY définis dans le lineup
    const x = ZONE_X_MAP[joueur.zoneX] ?? 15;
    const y = ZONE_Y_MAP[joueur.zoneY] ?? 30;

    match.tracker.joueurs[joueur.nom] = {
        nom: joueur.nom,
        poste: joueur.poste,
        visAVis: null,
        ligne: joueur.ligne,
        equipe: joueur.equipe || "?",
        equipeNom: joueur.equipeNom || joueur.equipe || "?",
        jid: joueur.jid || joueur.id || null,

        // Position actuelle
        position: { x, y },
        zone: { x: joueur.zoneX || "C", y: joueur.zoneY || "C2" },

        // Position de départ (ne change jamais)
        positionDepart: { x, y },
        zoneDepart: { x: joueur.zoneX || "C", y: joueur.zoneY || "C2" },

        // Orientation corps
        bodyAngle: 0,
        bodyState: "front",

        // État physique
        stamina: 100,
        hasBalle: false,
        estLock: false,

        // Statistiques du joueur
        stats: {
            actions: 0,
            passes: 0,
            tirs: 0,
            duels: 0,
            duelsGagnes: 0,
            deplacements: 0,
            distanceParcourue: 0,
            noteMoyenne: 0,
            notesTotal: 0,
            notesCount: 0
        },

        // Historique des actions de ce joueur
        historique: []
    };
}

// ================================================================
// SECTION 4 : ENREGISTRER UNE ACTION
// ================================================================

function trackerAction(match, joueur, type, details = {}) {
    if (!match.tracker || !joueur) return;

    const t = match.tracker;
    const snap = t.joueurs[joueur.nom];
    if (!snap) return;

    const timestamp = Date.now();
    const posAvant = { ...snap.position };
    const zoneAvant = { ...snap.zone };

    // --- Mettre à jour la position si déplacement ---
    if (details.newZoneY && ZONE_Y_MAP[details.newZoneY]) {
        snap.position.y = ZONE_Y_MAP[details.newZoneY];
        snap.zone.y = details.newZoneY;
        snap.stats.deplacements++;
        t.stats.deplacements++;
    }
    if (details.newZoneX && ZONE_X_MAP[details.newZoneX]) {
        snap.position.x = ZONE_X_MAP[details.newZoneX];
        snap.zone.x = details.newZoneX;
    }
    if (details.newX !== undefined) snap.position.x = details.newX;
    if (details.newY !== undefined) snap.position.y = details.newY;

    // --- Distance parcourue ---
    const dist = Math.sqrt(
        Math.pow(snap.position.x - posAvant.x, 2) +
        Math.pow(snap.position.y - posAvant.y, 2)
    );
    if (dist > 0) snap.stats.distanceParcourue += Math.round(dist * 10) / 10;

    // --- Orientation ---
    if (details.bodyAngle !== undefined) {
        snap.bodyAngle = details.bodyAngle;
        snap.bodyState = getBodyState(details.bodyAngle);
    }

    // --- Stats par type ---
    snap.stats.actions++;
    if (type === "passe") { snap.stats.passes++; t.stats.passes++; }
    if (type === "tir") { snap.stats.tirs++; t.stats.tirs++; }
    if (type === "duel") { snap.stats.duels++; t.stats.duels++; }
    if (type === "duel_gagne") snap.stats.duelsGagnes++;
    if (type === "deplacement") snap.stats.deplacements++;

    // --- Note ---
    if (details.note !== undefined) {
        snap.stats.notesTotal += details.note;
        snap.stats.notesCount++;
        snap.stats.noteMoyenne = Math.round(
            snap.stats.notesTotal / snap.stats.notesCount * 10
        ) / 10;
    }

    // --- Stamina (coût selon action) ---
    const coutStamina = { sprint: 8, duel: 5, tir: 4, passe: 2, deplacement: 3 };
    snap.stamina = Math.max(0, snap.stamina - (coutStamina[type] || 1));

    // --- Enregistrement de l'événement ---
    const event = {
        tour: t.tour,
        timestamp,
        type,
        joueur: joueur.nom,
        posAvant,
        zoneAvant,
        posApres: { ...snap.position },
        zoneApres: { ...snap.zone },
        details
    };

    snap.historique.push(event);
    t.historique.push(event);
}

// ================================================================
// SECTION 5 : MISE À JOUR POSITION BALLE
// ================================================================

function trackerBalle(match, holderNom, zoneY = null, x = null, y = null) {
    if (!match.tracker) return;

    const t = match.tracker;

    // Reset hasBalle pour tous
    for (const nom of Object.keys(t.joueurs)) {
        t.joueurs[nom].hasBalle = false;
    }

    // Nouveau porteur
    t.balle.holder = holderNom;
    if (holderNom && t.joueurs[holderNom]) {
        t.joueurs[holderNom].hasBalle = true;
        // La balle suit le porteur
        t.balle.x = t.joueurs[holderNom].position.x;
        t.balle.y = t.joueurs[holderNom].position.y;
        t.balle.zone = t.joueurs[holderNom].zone.y;
    }

    // Override manuel si fourni
    if (x !== null) t.balle.x = x;
    if (y !== null) t.balle.y = y;
    if (zoneY) t.balle.zone = zoneY;
}

// ================================================================
// SECTION 6 : NOUVEAU TOUR
// ================================================================

function trackerNouveauTour(match) {
    if (!match.tracker) return;
    match.tracker.tour++;
}

// ================================================================
// SECTION 7 : LOG COMPLET (appelé après chaque pavé)
// ================================================================

function trackerLog(match) {
    if (!match.tracker) return;

    const t = match.tracker;
    const allPlayers = [...(match.lineup1 || []), ...(match.lineup2 || [])];

    const sep = "═".repeat(50);
    const lines = [];

    lines.push(`\n${sep}`);
    lines.push(`📊 TRACKER — TOUR ${t.tour} | ⚽ Ballon: ${t.balle.holder || "LIBRE"} (${t.balle.zone})`);
    lines.push(sep);

    // Grouper par équipe
    const equipe1 = match.lineup1 || [];
    const equipe2 = match.lineup2 || [];

    const logEquipe = (lineup, label) => {
        lines.push(`\n👥 ${label}`);
        lines.push("─".repeat(40));

        for (const j of lineup) {
            const snap = t.joueurs[j.nom];
            if (!snap) {
                lines.push(`  ⚠️ ${j.nom} — non tracké (position inconnue)`);
                continue;
            }

            const balle = snap.hasBalle ? " ⚽" : "";
            const lock = snap.estLock ? " 🔒" : "";
            const stamina = snap.stamina < 30 ? " 💀" : snap.stamina < 60 ? " 😤" : " 💪";

            lines.push(
                `  ${j.nom}${balle}${lock}${stamina}`
            );
            lines.push(
    `    🏷️ Poste     : ${snap.poste || "?"}`
);
            lines.push(
                `    📍 Position  : X=${snap.position.x} Y=${snap.position.y} | Zone: ${snap.zone.x}-${snap.zone.y}`
            );
            lines.push(
                `    🏁 Départ    : X=${snap.positionDepart.x} Y=${snap.positionDepart.y} | Zone: ${snap.zoneDepart.x}-${snap.zoneDepart.y}`
            );
            lines.push(
    `    🆚 Vis-à-vis : ${snap.visAVis || "Aucun"}`
);
            lines.push(
                `    🧭 Corps     : ${snap.bodyState} (${snap.bodyAngle}°)`
            );
            lines.push(
                `    ⚡ Stamina   : ${snap.stamina}/100`
            );
            lines.push(
                `    📏 Distance  : ${snap.stats.distanceParcourue}m parcourus`
            );
            lines.push(
                `    🎯 Actions   : ${snap.stats.actions} total | Passes: ${snap.stats.passes} | Tirs: ${snap.stats.tirs}`
            );
            lines.push(
                `    ⚔️  Duels     : ${snap.stats.duels} (${snap.stats.duelsGagnes} gagnés)`
            );
            lines.push(
                `    ⭐ Note moy  : ${snap.stats.noteMoyenne || "—"}/10`
            );

            // Dernière action
            const lastAct = snap.historique[snap.historique.length - 1];
            if (lastAct) {
                lines.push(
                    `    🕐 Dernière  : [${lastAct.type}] ${JSON.stringify(lastAct.details).slice(0, 60)}`
                );
            }
        }
    };

    logEquipe(equipe1, `ÉQUIPE 1 — ${match.team1Name || "Team 1"} [${equipe1.length} joueurs]`);
    logEquipe(equipe2, `ÉQUIPE 2 — ${match.team2Name || "Team 2"} [${equipe2.length} joueurs]`);

    // Stats globales match
    lines.push(`\n📈 STATS MATCH`);
    lines.push("─".repeat(40));
    lines.push(`  Passes      : ${t.stats.passes}`);
    lines.push(`  Tirs        : ${t.stats.tirs}`);
    lines.push(`  Duels       : ${t.stats.duels}`);
    lines.push(`  Déplacements: ${t.stats.deplacements}`);

    lines.push(sep + "\n");

    console.log(lines.join("\n"));
}

// ================================================================
// SECTION 8 : EXTRAIRE LES DÉPLACEMENTS D'UN PAVÉ
// Analyse le texte pour détecter les nouvelles zones
// ================================================================

function trackerExtraireDeplacements(text, joueur) {
    if (!text || !joueur) return null;

    const t = text.toLowerCase();
    const result = {};

    // Zones Y (profondeur)
    const zonesY = ["c2", "c1", "b2", "b1", "a2", "a1"];
    for (const z of zonesY) {
        if (t.includes(z) || t.includes(`zone ${z}`)) {
            result.newZoneY = z.toUpperCase();
            break;
        }
    }

    // Zones X (largeur)
    if (t.includes("côté gauche") || t.includes("aile gauche")) result.newZoneX = "G";
    else if (t.includes("centre-gauche") || t.includes("demi-gauche")) result.newZoneX = "CG";
    else if (t.includes("centre droit") || t.includes("demi-droit")) result.newZoneX = "CD";
    else if (t.includes("côté droit") || t.includes("aile droite")) result.newZoneX = "D";
    else if (t.includes("centre") && !t.includes("demi")) result.newZoneX = "C";

    // Orientation corps
    if (t.includes("pivot du torse 180")) result.bodyAngle = (joueur.bodyAngle || 0) + 180;
    else if (t.includes("pivot gauche 90")) result.bodyAngle = (joueur.bodyAngle || 0) - 90;
    else if (t.includes("pivot droite 90")) result.bodyAngle = (joueur.bodyAngle || 0) + 90;

    return Object.keys(result).length ? result : null;
}


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


// 📋 PARSER LINEUP (AVEC POSTE)
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

// TROUVER USER DANS LA BD
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


const DISTANCES_TERRAIN = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
// Alias nécessaire pour distanceZone()
const DISTANCES = DISTANCES_TERRAIN;
// ⏱️ Temps par tour (6 minutes)
const TURN_TIME = 6 * 60 * 1000;
// 📍 MAPPING POSTES → TERRAIN
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

//VIS A VIS, JOUEURS EN FACE PAR RAPPORT AU TERRAIN 
const VIS_A_VIS_POSTE = {
    // Attaque
    AG: "AD",
    AC: "DC",
    AD: "AG",

    // Milieu
    MG: "MD",
    MC: "MC",
    MD: "MG",

    // Défense
    DG: "DD",
    DC: "AC",
    DD: "DG"
};
         
// ⚽ DRIBBLES OFFICIELS
// ===============================// ===============================
// 🧠 NORMALISATION TEXTE
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// 🔍 NORMALISATION LISTE
function normalizeList(arr) {
    return arr.map(w => normalizeText(w));
} 

// 🔍 MATCH FLEX
function containsAny(text, words) {
    return words.some(w => text.includes(w));
}

// ⚙️ VALIDATION DRIBBLE BLUEPRINT
function validateDribbleBlueprint(dribbleName, actionText) {

    const blueprint = DRIBBLE_BLUEPRINTS[dribbleName];

    if (!blueprint) {
        return {
            valid: false,
            similarity: 0,
            reason: `Blueprint introuvable pour : ${dribbleName}`
        };
    }

    const text = normalizeText(actionText);

    let score = 0;
    let maxScore = 0;

    const addRule = (points, condition) => {
        maxScore += points;
        if (condition) score += points;
    };

    const steps = Object.values(blueprint);

    for (const step of steps) {

        const v = step.validation || {};

        // 🦶 SURFACES
        if (v.surfaces) {
            addRule(
                20,
                containsAny(text, normalizeList(v.surfaces))
            );
        }

        // ↔️ DIRECTION
        if (v.ballDirection) {
            addRule(
                15,
                containsAny(text, normalizeList(v.ballDirection))
            );
        }

        // 🚀 ACCÉLÉRATION
        if (v.acceleration) {
            addRule(
                15,
                containsAny(text, [
                    "acceler",
                    "vmax",
                    "vitesse max",
                    "vitesse maximale",
                    "sprint",
                    "explos",
                    "burst"
                ].map(normalizeText))
            );
        }

        // 🎭 FEINTE
        if (v.bodyFeint) {
            addRule(
                15,
                containsAny(text, [
                    "feint",
                    "corps",
                    "epaule",
                    "buste",
                    "leurre"
                ].map(normalizeText))
            );
        }

        // 🎯 FAKE SHOT
        if (v.fakeShot) {
            addRule(
                15,
                containsAny(text, [
                    "frapp",
                    "tir",
                    "arm",
                    "simulation"
                ].map(normalizeText))
            );
        }

        // ⬆️ BALL LIFT
        if (v.ballLift) {
            addRule(
                15,
                containsAny(text, [
                    "soul",
                    "lob",
                    "au-dessus",
                    "lift"
                ].map(normalizeText))
            );
        }
    }

    // ⚽ BONUS ACTION BALL
    addRule(
        10,
        containsAny(text, [
            "pouss",
            "proj",
            "touch",
            "control"
        ].map(normalizeText))
    );

    // ⚡ BONUS ACTION FOOTBALL
    addRule(
        10,
        containsAny(text, [
            "depass",
            "elimin",
            "contourn",
            "prendre de vitesse",
            "pass"
        ].map(normalizeText))
    );

    const similarity = maxScore > 0
        ? Math.round((score / maxScore) * 100)
        : 0;
    // ✅ RESULT
    if (similarity >= 70) {
    return {
        valid: true,
        dribble: dribbleName,
        similarity,
        score: similarity // 👈 
    };
}

    return {
        valid: false,
        similarity,
        reason: `Dribble ${dribbleName} mal réalisé (${similarity}%)`
    };
}


// 🧠 INTENTION DRIBBLE
function detectIntentDribble(text) {

    const t = text.toLowerCase();

    return (
        t.includes("fait un dribble") ||
        t.includes("tente un dribble") ||
        t.includes("réalise un dribble") ||
        t.includes("essaie de dribbler") ||
        t.includes("dribbler") ||
        t.includes("dribble son adversaire")
    );
}

// 🛡️ TACKLE BLUEPRINTS
// ===============================// ===============================
// ⚙️ VALIDATION TACKLE BLUEPRINT (UPDATED)
function validateTackleBlueprint(tackleName, actionText) {

    const blueprint = TACKLE_BLUEPRINTS[tackleName];

    if (!blueprint) {
        return {
            valid: false,
            similarity: 0,
            reason: `Blueprint introuvable pour : ${tackleName}`
        };
    }

    const text = normalizeText(actionText);

    let score = 0;
    let maxScore = 0;

    const addRule = (points, condition) => {
        maxScore += points;
        if (condition) score += points;
    };

    const v = blueprint.validation || {};

    // 🧍 POSTURE
    if (v.posture) {
        addRule(
            20,
            containsAny(text, normalizeList(v.posture))
        );
    }

    // 🧠 BODY ROTATION (ANGLES)
    if (v.bodyRotation) {

        const rotationTextMatch =
            text.includes("60") ||
            text.includes("90") ||
            text.includes("180") ||
            text.includes("rotation") ||
            text.includes("pivot");

        const allowedOk = v.bodyRotation.allowed === true
            ? rotationTextMatch
            : !rotationTextMatch;

        addRule(15, allowedOk);

        if (v.bodyRotation.required) {
            addRule(10, rotationTextMatch);
        }
    }

    // ⚽ CONTACT BALL
    if (v.contact) {
        addRule(
            15,
            containsAny(text, normalizeList(v.contact))
        );
    }

    // 🦶 BODY PART
    if (v.bodyPart) {
        addRule(
            15,
            containsAny(text, normalizeList(v.bodyPart))
        );
    }

    // 🎯 DIRECTION
    if (v.direction) {
        addRule(
            10,
            containsAny(text, normalizeList(v.direction))
        );
    }

    // 📏 DISTANCE MAX (soft check)
    if (v.distanceMax) {

        const hasCloseRange =
            text.includes("proche") ||
            text.includes("court") ||
            text.includes("devant") ||
            text.includes("face") ||
            text.includes("rapproché");

        addRule(10, hasCloseRange);
    }

    // ⚡ SPEED REQUIREMENT
    if (v.speed?.required) {

        addRule(
            15,
            containsAny(text, normalizeList(v.speed.keywords))
        );
    }

    // 🎯 SCORE FINAL
    const similarity = maxScore > 0
        ? Math.round((score / maxScore) * 100)
        : 0;
    // ✅ RESULT
    if (similarity >= 70) {
        return {
            valid: true,
            tackle: tackleName,
            similarity
        };
    }

    return {
        valid: false,
        similarity,
        reason: `Tacle ${tackleName} mal exécuté (${similarity}%)`
    };
}


// Distance entre zones
function distanceZone(z1, z2) {
    if (!DISTANCES[z1] || !DISTANCES[z2]) return 0;
    return Math.abs(DISTANCES[z1] - DISTANCES[z2]);
}

//Postes Vis à VIS: Mapping 
function getVisAVisPoste(poste) {

    const p = POSITION_POSTES[poste];
    if (!p) return null;

    // Ligne miroir
    let ligne;

    switch (p.ligne) {
        case "attaque":
            ligne = "defense";
            break;

        case "defense":
            ligne = "attaque";
            break;

        default:
            ligne = "milieu";
    }

    // Côté miroir
    let zoneX = p.zoneX;

    if (zoneX === "gauche") zoneX = "droite";
    else if (zoneX === "droite") zoneX = "gauche";

    return {
        ligne,
        zoneX
    };
}
//Trouver le Vis à Vis initiale: MAPPING
function findVisAVis(player, opponentTeam) {

    if (!player || !player.poste) return null;

    const cible = getVisAVisPoste(player.poste);
    if (!cible) return null;

    return opponentTeam.find(p => {

        const pos = POSITION_POSTES[p.poste];
        if (!pos) return false;

        return (
            pos.ligne === cible.ligne &&
            pos.zoneX === cible.zoneX
        );

    }) || null;
}


// Extractions terrain
function extraireDistance(txt) {
    const m = txt.match(/(\d+)\s?m/);
    return m ? parseInt(m[1]) : null;
}
// Alias snake_case utilisé dans handleDuelMatch et resolveDribbleDuel
function extractDistance(txt) {
    return extraireDistance(txt);
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
const FIELD = {
    length: 60, // profondeur (Y)
    width: 30   // largeur (X)
};

// 📍 ZONES PROFONDEUR (Y)
const ZONES_Y = {
    C2: 30,
    C1: 25,
    B2: 20,
    B1: 15,
    A2: 10,
    A1: 5
};

// ↔️ ZONES LARGEUR (X)
const ZONES_X = {
    gauche: 5,
    axe: 15,
    droite: 25
};

// 🔄 ZONE → POSITION (X,Y)
function convertToPosition(zoneX, zoneY) {

    if (!ZONES_X[zoneX] || !ZONES_Y[zoneY]) return null;

    return {
        x: ZONES_X[zoneX],
        y: ZONES_Y[zoneY]
    };
}

// 📏 DISTANCE ENTRE JOUEURS
function distancePlayer(p1, p2) {

    if (!p1 || !p2) return 0;

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return Math.sqrt(dx * dx + dy * dy);
}

// 🚶 DEPLACEMENT AVANT / ARRIERE (ZONE Y)
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

// ↔️ DEPLACEMENT LATÉRAL
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

// 🧠 POSITION → ZONE Y
function getZoneFromY(y) {

    if (y >= 28) return "C2";
    if (y >= 23) return "C1";
    if (y >= 18) return "B2";
    if (y >= 13) return "B1";
    if (y >= 8) return "A2";
    return "A1";
}

// 🧠 POSITION → ZONE X
function getZoneFromX(x) {

    if (x <= 10) return "gauche";
    if (x <= 20) return "axe";
    return "droite";
}

// 🔒 VALIDATION TERRAIN
function isInsideField(pos) {

    if (!pos) return false;

    return (
        pos.x >= 0 &&
        pos.x <= FIELD.width &&
        pos.y >= 0 &&
        pos.y <= FIELD.length
    );
}

// 🧩 INIT POSITION JOUEUR
function initPlayerPosition(player) {

    const pos = convertToPosition(player.zoneX, player.zoneY);

    if (!pos) {
        return { ok: false, erreur: "❌ Position invalide" };
    }

    player.position = pos;

    return { ok: true };
}

// 🔄 SYNC PLAYER (alias safe pour updateGlobalPositions)
function syncPlayer(match, joueur) {
    updateGlobalPositions(match, joueur);
}

// 🔄 UPDATE GLOBAL POSITION
function updateGlobalPositions(match, joueur) {

    if (!match.positions) match.positions = [];

    const index = match.positions.findIndex(p => p.nom === joueur.nom);

    if (index !== -1) {
        match.positions[index] = joueur;
    } else {
        match.positions.push(joueur);
    }
}
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


// 🛡️ STUBS VALIDATION PAVÉ (utilisés dans validatePave)
function validateStructure(text) {
    if (!text || text.trim().length < 10) return { ok: false, reason: "❌ Pavé trop court" };
    const hasAction = text.includes("⚽:") || text.includes("💬:") || text.includes("BLUELOCK");
    return hasAction ? { ok: true } : { ok: false, reason: "❌ Structure invalide" };
}

function checkDeplacements(text, joueur, match) {
    if (!text) return { ok: true };
    const t = text.toLowerCase();
    if ((t.includes("zone") || t.includes("vers")) && !t.match(/\d+\s?m/)) {
        return { ok: false, erreur: "❌ Distance manquante dans le déplacement" };
    }
    return { ok: true };
}

function checkPasses(action, joueur, match) {
    if (!action) return { ok: true };
    const t = action.toLowerCase();
    if (t.includes("passe") && !t.match(/\d+\s?m/)) {
        return { ok: false, erreur: "❌ Distance de passe manquante" };
    }
    return { ok: true };
}

function checkTirs(action, joueur, match) {
    if (!action) return { ok: true };
    const t = action.toLowerCase();
    if ((t.includes("tir") || t.includes("frappe")) && !t.match(/\d+\s?m/)) {
        return { ok: false, erreur: "❌ Distance de tir manquante" };
    }
    return { ok: true };
}

function checkDuels(text, joueur, match) {
    return { ok: true };
}

function formatErreurGlobal(msg) {
    return { texte: msg || "❌ Erreur inconnue" };
}

// 🎯 HELPERS RESULT DUEL
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
// 🧠 VALIDATION PAVÉ (PATCH)
function validatePave(text, joueur, match) {

    const errors = [];

    const structure = validateStructure(text);
    if (!structure.ok) errors.push(structure.reason);

    const action = extraireAction(text);

    if (action) {

        const txt = text.toLowerCase();

        // 🚶 DÉPLACEMENT OBLIGATOIRE
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

// 🧠 EXTRACTION NOM JOUEUR (ROBUSTE)
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
// 🧭 DIRECTION NORMALIZER
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

// 🛑 ACTION VALIDATOR
function validateActionSyntax(texte) {

    const t = texte.toLowerCase();

    // 🚫 PIVOT obligatoire 180°
    if (t.includes("pivot") || t.includes("retourne") || t.includes("demi tour")) {

        const has180 = t.includes("180");
        const hasDirection = t.includes("droite") || t.includes("gauche");

        if (!has180 || !hasDirection) {
            return { valid: false, reason: "PIVOT_INVALID", speedMode: "normal" };
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
            return { valid: false, reason: "SPEED_INVALID", speedMode: "normal" };
        }
    }

    return { valid: true };
}

// getDistance et computeSpeed définis plus bas (versions complètes)

// 🏃 CHASE SYSTEM
function resolveChase(match, attacker, defender, ball, actionA, actionB) {

    // Sécurité ball
    if (!ball || !ball.position) {
        ball = { holder: null, state: "loose", position: { x: 15, y: 30 } };
    }

    const checkA = validateActionSyntax(actionA);
    const checkB = validateActionSyntax(actionB);

    const speedA = computeSpeed(attacker, checkA.speedMode || "normal");
    const speedB = computeSpeed(defender, checkB.speedMode || "normal");

    let distA = getDistance(attacker.position || { x: 0, y: 0 }, ball.position);
    let distB = getDistance(defender.position || { x: 0, y: 0 }, ball.position);

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

// 🧠 EXTRACTION JOUEURS RÉELS (ANTI FAUX POSITIFS)
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

// 🧠 PARSE ACTION SEQUENCE V3
function parseActionSequence(actionText, match, mode = "attack") {

    const players = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

    const attackActions = [
        { type: "controle", words: ["contrôle", "controle"] },
        { type: "conduite", words: ["fonce", "avance", "progresse", "conduite", "accélère", "court"] },
        { type: "dribble", words: ["dribble", "crochet", "roulette", "feinte", "passement"] },
        { type: "passe", words: ["passe", "transmet", "remise"] },
        { type: "centre", words: ["centre"] },
        { type: "tir", words: ["tir", "frappe", "volée", "reprend"] }
    ];

    const defenseActions = [
        { type: "pression", words: ["presse", "harcèle"] },
        { type: "bloc", words: ["bloque", "fait écran", "barre la route", "empêche", "obstrue"] },
        { type: "tacle", words: ["tacle", "glissé"] },
        { type: "interception", words: ["interception", "intercepte"] },
        { type: "contre", words: ["contre"] },
        { type: "recuperation", words: ["récupère", "recupere", "récupération", "recuperation"] },
        { type: "degagement", words: ["dégage", "degage"] }
    ];

    // Tous les mots-clés
    const catalogue = [...attackActions, ...defenseActions];

    const lower = actionText.toLowerCase();

    const playerObj = players.find(p =>
        lower.includes(pureName(p.nom))
    );

    if (!playerObj) return [];

    const targetObj = players.find(p =>
        p.nom !== playerObj.nom &&
        lower.includes(pureName(p.nom))
    );

    const found = [];

    for (const action of catalogue) {

        for (const word of action.words) {

            const index = lower.indexOf(word);

            if (index !== -1) {

                found.push({
                    index,
                    type: action.type
                });

                break;
            }
        }
    }

    found.sort((a, b) => a.index - b.index);

    // Priorité selon le mode
    const offensive = new Set([
        "controle",
        "conduite",
        "dribble",
        "passe",
        "centre",
        "tir"
    ]);

    const defensive = new Set([
        "pression",
        "bloc",
        "tacle",
        "interception",
        "contre",
        "recuperation",
        "degagement"
    ]);

    const already = new Set();
    const actions = [];

    for (const f of found) {

        if (already.has(f.type))
            continue;

        if (
            mode === "attack" &&
            defensive.has(f.type)
        ) continue;

        if (
            mode === "defense" &&
            offensive.has(f.type)
        ) continue;

        already.add(f.type);

        actions.push({
            player: playerObj.nom,
            type: f.type,
            target: targetObj?.nom || null
        });
    }

    return actions;
}


// 📊 NOTE DU PAVÉ
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

// ✅ VALIDATION DES ACTIONS
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

// 🎙️ RESUME FULL INTELLIGENT
// 🧠 GÉNÉRATION RÉSUMÉ INTELLIGENT
function genererResumeFull(actionText, match, mode = "attack") {

    const actions = parseActionSequence(actionText, match, mode);

    if (!actions.length)
        return "Action non identifiable.";

    const phrases = [];

    for (const act of actions) {

        switch (act.type) {

            // ==========================
            // ⚽ ACTIONS OFFENSIVES
            // ==========================
            case "controle":
                phrases.push(`${act.player} contrôle le ballon`);
                break;

            case "conduite":
                phrases.push(`${act.player} progresse balle au pied`);
                break;

            case "dribble":
                phrases.push(`${act.player} tente un dribble`);
                break;

            case "passe":
                phrases.push(
                    act.target
                        ? `${act.player} passe à ${act.target}`
                        : `${act.player} effectue une passe`
                );
                break;

            case "centre":
                phrases.push(`${act.player} adresse un centre`);
                break;

            case "tir":
                phrases.push(`${act.player} frappe au but`);
                break;

            // ==========================
            // 🛡️ ACTIONS DÉFENSIVES
            // ==========================
            case "pression":
                phrases.push(`${act.player} met la pression sur son adversaire`);
                break;

            case "bloc":
                phrases.push(`${act.player} bloque la progression`);
                break;

            case "tacle":
                phrases.push(`${act.player} tente un tacle glissé`);
                break;

            case "interception":
                phrases.push(`${act.player} tente une interception`);
                break;

            case "contre":
                phrases.push(`${act.player} contre l'action`);
                break;

            case "recuperation":
                phrases.push(`${act.player} récupère le ballon`);
                break;

            case "degagement":
                phrases.push(`${act.player} dégage le ballon`);
                break;

            default:
                phrases.push(`${act.player} enchaîne une action`);
                break;
        }
    }

    // 🔥 Suppression des doublons successifs
    const clean = [];

    for (const p of phrases) {

        if (clean[clean.length - 1] !== p)
            clean.push(p);
    }

    if (clean.length === 1)
        return clean[0] + ".";

    if (clean.length === 2)
        return `${clean[0]}, puis ${clean[1]}.`;

    const last = clean.pop();

    return `${clean.join(", puis ")}, puis ${last}.`;
}

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

// ⚽ VIS-À-VIS AUTO (FORMATION)
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


// 🔍 GET VIS-À-VIS PLAYER (safe)
function getVisavisPlayer(match, player) {
    if (!player || !player.visavis) return null;
    const all = [...(match.lineup1 || []), ...(match.lineup2 || [])];
    return all.find(p => p.nom === player.visavis) || null;
}

// 🧭 ZONE Y PAR LIGNE (utilisée dans lancerMatch)
function getZoneYParLigne(ligne, role) {
    if (role === "attaque") {
        if (ligne === "attaque") return "B1";
        if (ligne === "milieu")  return "C1";
        if (ligne === "defense") return "C2";
    } else {
        if (ligne === "defense") return "A2";
        if (ligne === "milieu")  return "C1";
        if (ligne === "attaque") return "B1";
    }
    return "C1";
}

// 🔁 ASSIGNER VIS-À-VIS (wrapper de generateVisAVis)
function assignerVisAVis(match) {
    if (match.lineup1 && match.lineup2) {
        generateVisAVis(match.lineup1, match.lineup2);
    }
}

// ⚽ INIT POSITION KICK-OFF
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


// 🎯 KICK-OFF ACTION AUTOMATIQUE 
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


// 🎯 EXTRACTION COMPLÈTE DISTANCE RANGE
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

// 🎲 RANDOMIZER
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 🧭 ANGLE NORMALISATION
function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
}

// 🧍 BODY STATE
function getBodyState(angle) {

    angle = normalizeAngle(angle);

    if (angle >= 0 && angle < 45) return "front";
    if (angle >= 45 && angle < 135) return "right";
    if (angle >= 135 && angle < 225) return "back";
    if (angle >= 225 && angle < 315) return "left";

    return "front";
}

// 🔄 ROTATION PLAYER
function rotatePlayer(player, deltaAngle) {

    if (!player.bodyAngle) player.bodyAngle = 0;

    player.bodyAngle = normalizeAngle(player.bodyAngle + deltaAngle);

    player.bodyState = getBodyState(player.bodyAngle);

    return player.bodyState;
}

// ⚽ RELATIVE POSITION
function getRelativePosition(player, target) {

    const dx = target.x - player.x;
    const dy = target.y - player.y;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const relativeAngle = normalizeAngle(angle - (player.bodyAngle || 0));

    return getBodyState(relativeAngle);
}

// 🧠 DISTANCE ENTRE 2 POINTS
function getDistance(pos1, pos2) {

    if (!pos1 || !pos2) return 0;

    return Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) +
        Math.pow(pos2.y - pos1.y, 2)
    );
}

// ⚔️ VALIDATION TACLE
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

    const tackleSuccess = successRate > atkPower;

    return {
        ok: tackleSuccess,
        type,
        distance,
        direction,
        successRate
    };
}

// ⚡ SPEED COMPUTATION
function computeSpeed(player, mode = "normal") {

    const base = player.stats?.acc || 50;

    if (mode === "sprint") return base * 1.5;
    if (mode === "walk") return base * 0.6;

    return base;
}

// 🧠 REACTION WINDOW
function computeReactionWindow(diff) {

    if (diff > 10) return "after_sprint";
    if (diff > 0) return "after_combo";
    return "anytime";
}

// 🧠 TARGET PLAYER DETECTION
function detectTargetPlayer(text, players) {

    const t = pureName(text);

    return players.find(p => {
        const n = pureName(p.nom);
        return t.includes(n);
    });
}

// 🧠 BALL STATE INIT
function initBall(match, position = { x: 0, y: 0 }) {

    match.ball = {
        holder: null,
        state: "neutral",
        position
    };
                            }


// 🧠 MATCH ENGINE UTILITIES CORE

// 🧍 UPDATE BODY ORIENTATION
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

// 📏 EXTRACTION NOMBRE (DISTANCE)
function extractNumber(str) {
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[0]) : null;
}

// 🧠 LEVENSHTEIN (FUZZY MATCH)
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

// 🧠 PARSER IA PAVÉ INTELLIGENT
function parsePlayerIntent(text, players) {

    if (!text) return null;

    const t = text.toLowerCase();

    // ⚽ PLAYERS FUZZY DETECTION
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

    // ⚙️ ACTIONS
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

    // 🧭 DIRECTION
    let direction = "none";

    if (t.includes("gauche")) direction = "left";
    else if (t.includes("droite")) direction = "right";
    else if (t.includes("devant") || t.includes("face") || t.includes("tout droit")) direction = "front";
    else if (t.includes("diagonale")) direction = "diagonal";

    // 🦶 FOOT
    let foot = null;

    if (t.includes("pied gauche")) foot = "left";
    else if (t.includes("pied droit")) foot = "right";

    // 📏 DISTANCES
    const ballDistance = extractNumber(t);

    let targetDistance = null;
    if (t.includes("1m")) targetDistance = 1;
    if (t.includes("2m")) targetDistance = 2;
    if (t.includes("5m")) targetDistance = 5;
    if (t.includes("10m")) targetDistance = 10;

    // 👥 PLAYERS DETECTION
    const detectedPlayers = [];

    for (const p of players) {
        if (t.includes(p.nom.toLowerCase())) {
            detectedPlayers.push(p);
        }
    }

    // 📦 OUTPUT FINAL
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

// 🧪 SAFE PLAYER FINDER (STRICT + FALLBACK)
function findPlayerStrict(text, players) {

    const t = text.toLowerCase();

    let found = players.find(p => {
        const name = p.nom.toLowerCase();
        return t.includes(name);
    });

    return found || null;
}


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
⚽ DRIBBLE PATTERNS
=================================*/
// 🧠 UTILS ENGINE (LOCK SYSTEM V2)
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
    match._lastJoueurTourUpdate = Date.now();
    return true;
}

function safeGetNextPlayer(match) {
    const current = normalizeJid(match.joueurTour);
    if (current === normalizeJid(match.id1)) return match.id2;
    if (current === normalizeJid(match.id2)) return match.id1;
    return match.id1;
}

function getNextPlayer(match) {
    const id1 = normalizeJidSafe(match.id1);
    const id2 = normalizeJidSafe(match.id2);
    const current = normalizeJidSafe(match.joueurTour);
    if (!id1 || !id2) return null;
    if (current === id1) return id2;
    if (current === id2) return id1;
    return id1;
}

// ==============================
// ⚔️ RESOLUTION DUEL DEFENSIF
// ==============================
function resolveDefenseDuel(match, attacker, defender, attackText) {

    const atkOVR = attacker.stats.ovr;
    const atkDRI = attacker.stats.dri;

    const defDEF = defender.stats.def;

    const actions = parseActionSequence(
        attackText,
        match,
        "attack"
    );

    const has = type => actions.some(a => a.type === type);

    const isPass = has("passe");
    const isDribble = has("dribble");
    const isShot = has("tir");

    const diff = defDEF - atkOVR;

    
let attackerWin = false;

    let attackStat = attacker.stats.dri || 50;
let defenseStat = defender.stats.def || 50;

let attackScore = noterPave(attackText);
let defenseScore = noterPave(match.phaseDuel.defenseText);

let attackTotal = attackStat + attackScore;
let defenseTotal = defenseStat + defenseScore;

// ==========================
// PASSE
// ==========================
if (isPass) {

    // DEF légèrement supérieure -> la passe évite le duel
    if (diff > 0 && diff < 10) {
        attackerWin = true;
    } else {
        attackerWin = attackTotal >= defenseTotal;
    }

}

// ==========================
// DRIBBLE
// ==========================
else if (isDribble) {

    const atk = attackText.toLowerCase();
    const def = match.phaseDuel.defenseText.toLowerCase();

    // 🎯 DÉTECTION DRIBBLE
    const explicitDribble =
        detectIntentDribble(atk);

    let detectedDribble =
        DRIBBLES.find(d => atk.includes(d));

    if (!detectedDribble && explicitDribble) {
        detectedDribble = "creative";
    }

    const isDribbleAction = !!detectedDribble;

    let dribbleCheck = null;

    if (isDribbleAction) {

        dribbleCheck = validateDribbleBlueprint(
            detectedDribble,
            attackText
        );

        // ❌ Dribble raté
        if (!dribbleCheck.valid) {

            return {
                ok: false,

                next: defender.id || defender.jid,
                ballHolder: defender.nom,

                attackStat,
                defenseStat,

                attackScore: 0,
                defenseScore: 0,

                attackTotal: attackStat,
                defenseTotal: defenseStat,

                msg:
`❌ ${attacker.nom} exécute mal son dribble.

🔁 ${defender.nom} récupère automatiquement la possession !`
            };
        }

    }

    // 🛡️ DÉTECTION TACLE
    let detectedTackle =
        Object.keys(TACKLE_BLUEPRINTS)
            .find(t => def.includes(t));

    const explicitTackle =
        def.includes("tacle") ||
        def.includes("tacle debout") ||
        def.includes("tacle glissé") ||
        def.includes("tacle circulaire") ||
        def.includes("tacler");

    if (!detectedTackle && explicitTackle) {
        detectedTackle = "tacle debout";
    }

    const isTackleAction = !!detectedTackle;
    console.log("===== RESOLVE DUEL CHECK =====");
console.log("attackText =", attackText);
console.log("defenseText =", match.phaseDuel.defenseText);
console.log("isDribble =", isDribble);
console.log("isTackle =", isTackleAction);
console.log("detectedTackle =", detectedTackle);
console.log("==============================");

    let tackleCheck = null;

    if (isTackleAction) {

        tackleCheck = validateTackleBlueprint(
            detectedTackle,
            match.phaseDuel.defenseText
        );

        // ❌ Tacle raté
        if (!tackleCheck.valid) {

            return {
                ok: true,

                next: attacker.id || attacker.jid,
                ballHolder: attacker.nom,

                attackStat,
                defenseStat,

                attackScore: dribbleCheck?.similarity || 0,
                defenseScore: 0,

                attackTotal: attackStat + (dribbleCheck?.similarity || 0),
                defenseTotal: defenseStat,

                msg:
`❌ ${defender.nom} rate complètement son intervention défensive.

⚡ ${attacker.nom} garde automatiquement le ballon !`
            };
        }

    }
                                     
// ⚽ DRIBBLE VS TACLE BLUEPRINT
if (isDribbleAction && isTackleAction) {

    attackStat = attacker.stats.dri || 50;
    defenseStat = defender.stats.def || 50;

    attackScore = dribbleCheck?.similarity || 0;
    defenseScore = tackleCheck?.similarity || 0;

    attackTotal = attackStat + attackScore;
    defenseTotal = defenseStat + defenseScore;
    
console.log("===== CHECK BLUEPRINT DUEL =====");
    console.log("DRIBBLE CHECK :", dribbleCheck);
    console.log("TACKLE CHECK :", tackleCheck);
    console.log("attackTotal :", attackTotal);
    console.log("defenseTotal :", defenseTotal);
    console.log("===============================");
    
    if (dribbleCheck?.valid && !tackleCheck?.valid) {

        attackerWin = true;

    } 
    
    else if (!dribbleCheck?.valid && tackleCheck?.valid) {

        attackerWin = false;

    }

    else if (dribbleCheck?.valid && tackleCheck?.valid) {

        attackerWin = attackTotal > defenseTotal;

    }

    else {

        attackerWin = attackTotal >= defenseTotal;

    }

}
        } 

// ⚠️ Pas de duel dribble/tacle
else {

    attackerWin = attackTotal >= defenseTotal;

}
        
console.log("===== FINAL DUEL CHECK =====");
console.log("attackerWin =", attackerWin);
console.log("attackTotal =", attackTotal);
console.log("defenseTotal =", defenseTotal);
console.log("============================");
    
const winner = attackerWin ? attacker : defender;

return {

    ok: attackerWin,

    next: winner.id,
    ballHolder: winner.nom,

    attackStat,
    defenseStat,

    attackScore,
    defenseScore,

    attackTotal,
    defenseTotal,

    msg: attackerWin === null
    ? `⚠️ ${attacker.nom} et ${defender.nom} ratent tous les deux leur geste. Le ballon⚽ devient libre.`
    : attackerWin
        ? `🔥 ${attacker.nom} élimine ${defender.nom}.`
        : `⚽🥅 ${defender.nom} remporte le duel et récupère le ballon.`
};
} 

// 🎮 COMMANDE MATCH
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
        console.error("❌ Erreur match⚽ :", e);
    }
}); 
// 📋 DETECTION FICHE
async function verifierFiche(message, chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    // ⛔ Seulement en phase d'attente fiche
    if (match.etat !== "attente_fiche") return;

    if (!message.includes("MATCH BLUE LOCK") || !message.includes("Team 1")) return;

    const team1 = message.match(/Team 1:\s*([^\n\r]+)/);
    const team2 = message.match(/Team 2:\s*([^\n\r]+)/);
    const gardien = message.match(/Gardien:\s*([^\n\r]+)/);
    const score = message.match(/Score win:\s*([^\n\r]+)/);

    if (!team1 || !team2) return;

    // 🧠 RAW NAMES (DISPLAY ONLY)
    match.team1Name = team1[1].trim();
    match.team2Name = team2[1].trim();
    match.gardien = gardien ? gardien[1].trim() : "Non défini";
    match.scoreWin = score ? score[1].trim() : "2";

    // 🧤 GAME SETTINGS
    match.gardienLevel = gardien
        ? Math.max(70, parseInt((gardien[1].trim().match(/\d+/) || ["70"])[0]) || 70)
        : 70;

    match.winScore = score
        ? parseInt(score[1].match(/\d+/)?.[0]) || 2
        : 2;

    // 👤 RESOLVE USERS (OWNERS)
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

    // 🔷 TEAMS (SOURCE OF TRUTH)

    // owners WhatsApp
    match.id1 = j1;
    match.id2 = j2;

    // display names already set above

    match.etat = "attente_lineup";

    // lineups
    match.equipe1 = null;
    match.equipe2 = null;

    // 📊 STATS INIT (BASED ON OWNERS)
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

    // 🎨 CONFIRMATION
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

    // ⏳ TIMER LINEUP
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


    // 🔥 GESTION PAVÉ NORMAL
    const handled = await handlePaveGame(ms, ovl);
    if (handled) return;
// 📋 GESTION LINEUP
// ===============================
// 📋 LINEUP HANDLER
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

    // 🧠 NORMALISATION SIMPLE (DISPLAY ONLY)
    const normalizeTeam = str =>
        (str || "").toLowerCase().trim();

    const squadName = normalizeTeam(squadNameRaw);
    const team1 = normalizeTeam(match.team1Name);
    const team2 = normalizeTeam(match.team2Name);

    // 👤 OWNER IDENTIFICATION
    const senderJid = ms.key.participant || ms.key.remoteJid;

    const joueursValides = [];
    const nomsUtilises = new Set();
    const playersDB = Object.values(cardsBlueLock);

    // ⚽ BUILD LINEUP (PLAYER CARDS)
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

        // 🧩 PLAYER CARD STRUCTURE
        joueursValides.push({
            numero: j.numero,
            nom: data.name,
            id: senderJid,   // JID WhatsApp du propriétaire
            jid: senderJid,  // alias
            equipe: null,    // sera défini ci-dessous (team1 ou team2)
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

    // 🔷 TEAM 1 OWNER (id1)
    if (squadName === team1 && !match.equipe1) {

        match.id1 = senderJid;              // 👈 OWNER TEAM 1
        joueursValides.forEach(p => { p.equipe = "team1"; p.equipeNom = match.team1Name; });
        match.lineup1 = joueursValides;     // 👈 PLAYER CARDS
        match.equipe1 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation validée pour *${match.team1Name}*`
        });
    }

    // 🔷 TEAM 2 OWNER (id2)
    else if (squadName === team2 && !match.equipe2) {

        match.id2 = senderJid;              // 👈 OWNER TEAM 2
        joueursValides.forEach(p => { p.equipe = "team2"; p.equipeNom = match.team2Name; });
        match.lineup2 = joueursValides;     // 👈 PLAYER CARDS
        match.equipe2 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation validée pour *${match.team2Name}*`
        });
    }

    // ❌ INVALID TEAM
    else {
        return ovl.sendMessage(chat, {
            text: "❌ Équipe non reconnue ou déjà envoyée"
        });
    }

    // 🚀 START MATCH (ONLY WHEN READY)
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

           
// 🚀 LANCEMENT MATCH
async function lancerMatch(chat, ovl) {

    const match = matchsActifs.get(chat);
    if (!match) return;

    if (match.kickoffStarted) return;
    match.kickoffStarted = true;

    const isTeam1 = Math.random() < 0.5;

    match.kickoffTeam = isTeam1 ? 1 : 2;

    // 👥 TEAMS (USER IDS)
    // match.id1 et match.id2 déjà définis lors de la vérification de fiche

    // ⚽ POSSESSION INIT
    match.joueurTour = isTeam1 ? match.id1 : match.id2;

    const currentTeam = match.joueurTour;
    const opponentTeam =
        currentTeam === match.id1 ? match.id2 : match.id1;

    // 🧠 POSSESSION LOGIC CLEAN
    match.possession = currentTeam;

    // IMPORTANT : ATTACK = celui qui joue
    match.attacker = currentTeam;
    match.defender = opponentTeam;

    // 🔄 RESET MATCH STATE
    match.etat = "en_cours";

    // 🗺️ INIT TRACKER POSITIONS
    initTracker(match);
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

    // 📊 INIT STATS
    match.possessions = {
        [match.id1]: 0,
        [match.id2]: 0
    };

    match.tour = 1;
    match.toursRestants = 5;

    // 🧹 CLEAN TIMERS (UNIQUEMENT LOCAL)
    ["warningTimer", "kickoffTimer"].forEach(t => {
        if (match[t]) {
            clearTimeout(match[t]);
            match[t] = null;
        }
    });

    // 🧠 SAFE TERRAIN INIT
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
    }

// 🎯 KICKOFF (GARANTI)
const kickoffText = kickoffStart(match);

// 🗺️ TRACKER : Balle au porteur de départ
if (match.tracker && match.ballHolder) {
    trackerBalle(match, match.ballHolder);
    trackerNouveauTour(match);
}

if (kickoffText) {
// 👥 TEAM START
const teamStart = match.joueurTour;
const tag = getTagFromJid(teamStart);

const imagesKickOff = [
    "https://files.catbox.moe/onotk4.jpg",
    "https://files.catbox.moe/kfw0bl.jpg"
];

// ⚽ MESSAGE KICK OFF
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

    // ⏱️ WARNING TIMER (5 MIN)
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

    // ⛔ TIMEOUT (6 MIN → NEXT TEAM)
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
    } // fin if (kickoffText)
} // fin lancerMatch

async function handlePaveGame(ms, ovl) {

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return false;

    // ⛔ Ignorer les pavés si le match n'est pas actif
    if (match.etat !== "en_cours") return false;

    const sender = normalizeJid(getSenderJid(ms));

    //🚫 FIND PLAYER CARD
    const allPlayers = (match.lineup1 || []).concat(match.lineup2 || []);

    const playerCard = allPlayers.find(p =>
        normalizeJid(p.id || p.jid) === sender ||
        match.names?.[sender] === p.nom
    );

    // 🚫 LOCK CHECK
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

    // 🎯 DETECTION PAVÉ
    const isPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔁:") &&
        text.includes("BLUELOCK");

    if (!isPave) return false;

// 🔒 GUARD : C'EST BIEN TON TOUR ?
const isMyTurn = normalizeJid(match.joueurTour) === sender;

// Exception : pendant phaseDuel, les deux joueurs du duel peuvent envoyer
const isDuelParticipant =
    match.phaseDuel?.active && (
        normalizeJid(match.phaseDuel?.attackerJid) === sender ||
        normalizeJid(match.phaseDuel?.defenderJid) === sender
    );

if (!isMyTurn && !isDuelParticipant) {
    await ovl.sendMessage(chat, {
        text:
`⏳ Ce n'est pas ton tour !

➡️ Attends que @${getTagFromJid(match.joueurTour)} joue.

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [match.joueurTour]
    });
    return true;
}

// ❌ PAVÉ VIDE OU MAL FORMÉ
 const actionCheck = extraireAction(text);
    
if (!actionCheck || actionCheck.trim().length < 5) {

    await ovl.sendMessage(chat, {
        react: { text: "❌", key: ms.key }
    });

    // 👤 JOUEUR PERDANT
    const loser = normalizeJid(match.joueurTour);

    const loserPlayer =
        [...(match.lineup1 || []), ...(match.lineup2 || [])]
        .find(p => normalizeJid(p.id || p.jid) === loser);

    const loserName = loserPlayer?.nom || loser.split("@")[0];

    // ⚽ NEXT VIA VIS-A-VIS (PRIORITÉ)
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

    // 🚫 LOCK UPDATE
    match.lockedPlayers = match.lockedPlayers || new Set();
    match.lockedPlayers.add(loserName);

    // 🔁 POSSESSION UPDATE CLEAN
    match.joueurTour = next;
    match.attacker = next;
    match.defender = loser;
    match.pendingAttack = null;

    // 📩 MESSAGE CONTRE-ATTAQUE
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

    // ⛔ CLEAN TIMERS (CRUCIAL)
    if (match.turnTimer) {
        clearTimeout(match.turnTimer);
        match.turnTimer = null;
    }

    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }

    // 🧠 IMPORTANT
    match.phaseDuel = null;

    return true;
}
    
    // ♻️ ANALYSE
    await ovl.sendMessage(chat, {
    react: { text: "♻️", key: ms.key }
});

    await new Promise(r => setTimeout(r, 1000));

   const action = actionCheck;

const actionText = action.toLowerCase();

   
// ⚽ ATTAQUE PHASE DUEL
if (match.phaseDuel?.active && match.phaseDuel.step === "attack_pave") {

    match.phaseDuel.attackPave = action;
    match.phaseDuel.step = "defense_pave";

    const attacker = match.phaseDuel.attacker;
    const defender = match.phaseDuel.defender;

    // 🗺️ TRACKER : Pavé attaque duel
    if (attacker) {
        const _deps = trackerExtraireDeplacements(action, match.tracker?.joueurs[attacker.nom]);
        trackerAction(match, attacker, "duel", {
            texte: action.slice(0, 80),
            note: noterPave(action),
            adversaire: defender?.nom,
            ...(_deps || {})
        });
        trackerBalle(match, attacker.nom);
    }

    const actionText = action.toLowerCase();

    // 🧠 RESUME ACTION
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

// 🔥 NEXT = DEFENSEUR DU DUEL
const duelNextId = match.defender;
const nextTag = getTagFromJid(duelNextId);
    
// ⚽ STATE SYNC (IMPORTANT)
match.ballHolder = attacker.nom;
match.joueurTour = duelNextId;
match.waitingDefenseFrom = duelNextId;

    // 📩 MESSAGE ATTACK
    await ovl.sendMessage(chat, {
        text:
`*🛡️⚡⚽ ATTAQUE !*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░

🎙️ RESUME♻️ : ${resume}

📊 NOTE DU PAVÉ : ${note}/10

➡️ @${nextTag} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [duelNextId]
    });

    // ⚠️ WARNING
    if (match.warningTimer) clearTimeout(match.warningTimer);

    match.warningTimer = setTimeout(async () => {

        if (match.joueurTour !== duelNextId) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ @${nextTag} ❗⏳

Il reste *1 MINUTE* pour défendre !

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅`,
            mentions: [duelNextId]
        });

    }, 5 * 60 * 1000);

    // ⏱️ LATENCE OUT (UNIFORM FIX)
    if (match.defenseTimer) clearTimeout(match.defenseTimer);

    match.defenseTimer = setTimeout(() => {

        if (match.joueurTour !== duelNextId) return;

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
    

const isDribbleAction = hasIntent(
    actionText,
    DRIBBLE_PATTERNS
);



const isPassiveDefense = hasIntent(
    actionText,
    PASSIVE_BLOCK_PATTERNS
); 

// 🛡️ DUEL PHASE DEFENSE
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

    // 🧠 RESUME DEFENSE
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

    // ⏱️ STOP TIMERS DEFENSE
    if (match.warningTimer) {
        clearTimeout(match.warningTimer);
        match.warningTimer = null;
    }

    if (match.defenseTimer) {
        clearTimeout(match.defenseTimer);
        match.defenseTimer = null;
    }

// 📩 MESSAGE DEFENSE
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

// 🧠 SNAPSHOT
const attackPave = match.phaseDuel.attackPave;
const defensePave = match.phaseDuel.defensePave;
const duelAttacker = match.phaseDuel.attacker;
const duelDefender = match.phaseDuel.defender;

// 🗺️ TRACKER : Pavé défense duel
if (duelDefender) {
    const _depsD = trackerExtraireDeplacements(defensePave, match.tracker?.joueurs[duelDefender.nom]);
    trackerAction(match, duelDefender, "duel", {
        texte: (defensePave || "").slice(0, 80),
        note: noterPave(defensePave || ""),
        adversaire: duelAttacker?.nom,
        role: "defense",
        ...(_depsD || {})
    });
}
    
// 🧠 RESOLUTION
match.phaseDuel.step = "resolve_duel_pending";
setTimeout(async () => {

    const duelResult = await handleDuelMatch(
        match,
        attackPave,
        defensePave
    );

    // 🎯 POSSESSION (SOURCE UNIQUE)
    // ⚠️ On utilise les snapshots (duelAttacker/duelDefender) et PAS match.phaseDuel
    // car phaseDuel peut être null si stopmatch a été appelé pendant le setTimeout
    if (!duelAttacker || !duelDefender) return;

    const attackerJidSnap = match.phaseDuel?.attackerJid || duelAttacker.id || duelAttacker.jid;
    const defenderJidSnap = match.phaseDuel?.defenderJid || duelDefender.id || duelDefender.jid;

    const winnerId = duelResult.ok ? attackerJidSnap : defenderJidSnap;
    const winnerPlayer = duelResult.ok ? duelAttacker : duelDefender;
match.ballHolderPlayer = winnerPlayer.nom;
match.ballHolderJid = winnerId;
match.joueurTour = winnerId;

// 🗺️ TRACKER : Résultat duel
if (duelAttacker) {
    trackerAction(match, duelAttacker, duelResult.ok ? "duel_gagne" : "duel_perdu", {
        resultat: duelResult.ok ? "WIN" : "LOSE",
        attackTotal: duelResult.attackTotal,
        defenseTotal: duelResult.defenseTotal
    });
}
if (duelDefender) {
    trackerAction(match, duelDefender, duelResult.ok ? "duel_perdu" : "duel_gagne", {
        resultat: duelResult.ok ? "LOSE" : "WIN"
    });
}
trackerBalle(match, winnerPlayer.nom);
trackerNouveauTour(match);

// 📊 LOG TEMPS RÉEL (après résolution duel)
trackerLog(match);

// 🎯 NEXT = BALLHOLDER (TOUJOURS)
const nextId = match.ballHolderJid;
    
// 🛡️⚽ MESSAGE RÉSOLUTION DUEL
// SOURCE DE VÉRITÉ : phaseDuel (snapshot pris avant handleDuelMatch)
// duelResult.attacker/defender peuvent être inversés selon ballHolderPlayer
// On force l'affichage depuis le snapshot du duel
const displayAttacker = duelAttacker;
const displayDefender = duelDefender;
const atkWon = duelResult.ok;  // ok=true → attaquant gagne

await ovl.sendMessage(chat, {
    text:
`🛡️⚽ RÉSOLUTION DU DUEL !

${duelResult.msg}

⚡ ${displayAttacker.nom}
├ Dribble : ${duelResult.attackStat ?? (displayAttacker.stats?.dri || 50)}
├ Score Pavé : ${duelResult.attackScore ?? 0}
└ Total : ${duelResult.attackTotal ?? (displayAttacker.stats?.dri || 50)} ${atkWon ? "✅" : "❌"}

🛡️ ${displayDefender.nom}
├ Défense : ${duelResult.defenseStat ?? (displayDefender.stats?.def || 50)}
├ Score Pavé : ${duelResult.defenseScore ?? 0}
└ Total : ${duelResult.defenseTotal ?? (displayDefender.stats?.def || 50)} ${atkWon ? "❌" : "✅"}

➡️ @${getTagFromJid(nextId)} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
    mentions: [nextId]
});    

// 🧹 CLEAN
match.phaseDuel = null;
match.pendingAttack = null;
match.waitingDefenseFrom = null;
match.hasPlayed = true;

}, 1000);
    return true; 
}    

// ==============================
// ⚔️ RÉPONSE AU TACLE
// ==============================
if (
    match.phaseDuel?.active &&
    match.phaseDuel.step === "response"
) {

    console.log("⚔️ PHASE RESPONSE DÉTECTÉE");

    const duel = match.phaseDuel;

    console.log("Sender :", normalizeJid(sender));
    console.log("AttackerJid :", normalizeJid(duel.attackerJid));

    // Seul le propriétaire du joueur attaquant répond
    if (normalizeJid(sender) !== normalizeJid(duel.attackerJid)) {
        console.log("❌ Mauvais joueur");
        return true;
    }

    console.log("✅ Bon joueur");

    // On récupère directement les objets joueurs
    const attacker = duel.attacker;
    const defender = duel.defender;

    // Snapshot compatible avec handleDuelMatch
    match.phaseDuel.attackPave = duel.attackText;
    match.phaseDuel.defensePave = duel.defenseText;

    // Résolution unique
    const result = await handleDuelMatch(
        match,
        duel.attackText,
        duel.defenseText
    );

    // ==============================
    // 📊 STATS DUEL
    // ==============================

    attacker.stats.duels = (attacker.stats.duels || 0) + 1;
    defender.stats.duels = (defender.stats.duels || 0) + 1;

    if (result.ok) {

        attacker.stats.duelsGagnes =
            (attacker.stats.duelsGagnes || 0) + 1;

        attacker.stats.lastAction = {
            type: "duel",
            texte: `Dribble réussi contre ${defender.nom}`,
            action: null,
            resultat: "victoire"
        };

        defender.stats.lastAction = {
            type: "duel",
            texte: `Tacle échoué contre ${attacker.nom}`,
            action: duel.defenseText,
            resultat: "défaite"
        };

    } else {

        defender.stats.duelsGagnes =
            (defender.stats.duelsGagnes || 0) + 1;

        defender.stats.lastAction = {
            type: "duel",
            texte: `Tacle réussi contre ${attacker.nom}`,
            action: duel.defenseText,
            resultat: "victoire"
        };

        attacker.stats.lastAction = {
            type: "duel",
            texte: `Dribble perdu contre ${defender.nom}`,
            resultat: "défaite"
        };
    }

    // 🗺️ TRACKER : action défenseur
    trackerAction(match, defender, "duel", {
        texte: duel.defenseText.slice(0, 80),
        note: noterPave(duel.defenseText),
        adversaire: attacker.nom,
        role: "defense"
    });

    const winnerPlayer = result.ok ? attacker : defender;
    const winnerId = result.ok
        ? (attacker.id || attacker.jid)
        : (defender.id || defender.jid);

    match.ballHolder = winnerPlayer.nom;
    match.ballHolderPlayer = winnerPlayer.nom;
    match.ballHolderJid = winnerId;
    match.joueurTour = winnerId;

    // 🗺️ TRACKER
    trackerBalle(match, winnerPlayer.nom);
    trackerNouveauTour(match);
    trackerLog(match);

    await ovl.sendMessage(chat, {
        text:
`🛡️⚽ RÉSOLUTION DU DUEL !

${result.msg}

⚡ ${attacker.nom}
├ Dribble : ${result.attackStat}
├ Score Pavé : ${result.attackScore}
└ Total : ${result.attackTotal} ${result.ok ? "✅" : "❌"}

🛡️ ${defender.nom}
├ Défense : ${result.defenseStat}
├ Score Pavé : ${result.defenseScore}
└ Total : ${result.defenseTotal} ${result.ok ? "❌" : "✅"}

➡️ @${getTagFromJid(winnerId)} NEXT

╰───────────────────
🔷BLUELOCK⚽🥅`,
        mentions: [winnerId]
    });

    return true;
}

    
// 🎯 ATTAQUE⚽
if (!match.pendingAttack) {

    const attackerId = match.joueurTour;

    const attackerPlayer =
        [...(match.lineup1 || []), ...(match.lineup2 || [])]
        .find(p =>
            normalizeJid(p.id || p.jid) === attackerId
        );

    if (attackerPlayer) {
    match.ballHolderPlayer = attackerPlayer.nom;
    match.ballHolderJid = attackerId;
}

    match.pendingAttack = action;
    match.hasPlayed = true;

    // 🔓 Reset locks au début d'un nouveau tour d'attaque
    match.lockedPlayers = new Set();
    
// 🗺️ TRACKER : Enregistrer l'action attaque
const _trackerAttacker =
    [...(match.lineup1 || []), ...(match.lineup2 || [])]
    .find(p => {
        const name = pureName(p.nom);
        const text = pureName(match.pendingAttack);

        return text.includes(name);
    });
    if (_trackerAttacker) {
        const _deps = trackerExtraireDeplacements(action, match.tracker?.joueurs[_trackerAttacker.nom]);
        trackerAction(match, _trackerAttacker, "attaque", {
            texte: action.slice(0, 80),
            note: noterPave(action),
            ...(_deps || {})
        });
        trackerBalle(match, _trackerAttacker.nom);
    }
    trackerNouveauTour(match);

    // 📊 LOG TEMPS RÉEL
    trackerLog(match);

    const resume = genererResumeFull(action, match, "attack");
    const note = noterPave(action);

    // 🔥 NEXT
const nextId =
    attackerId === match.id1
        ? match.id2
        : match.id1;

const nextTag = getTagFromJid(nextId);

    // ⚽ ÉTAT MATCH
    match.waitingDefenseFrom = nextId;
match.joueurTour = nextId;

match.attacker = attackerId;
match.defender = nextId;

    // ⚠️ WARNING
    if (match.warningTimer) clearTimeout(match.warningTimer);
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

    // ⏳ LATENCE OUT
    if (match.turnTimer) clearTimeout(match.turnTimer);
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

    // 📩 MESSAGE
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


// 🛡️ DEFENSE
const defense = action;

// ⚠️ VALIDATION
if (!match.pendingAttack) return false;

// ⚔️ RESOLUTION DUEL
const res = await handleDuelMatch(
    match,
    match.pendingAttack,
    defense
);

match.hasPlayed = true;

// 🔥 MATCH UP INIT ⚽🆚 
if (res && res.type === "PASSIVE_BLOCK") {

    const allPlayers = [
        ...(match.lineup1 || []),
        ...(match.lineup2 || [])
    ];

  const attacker = res.attacker;
const defender = res.defender; 
    match.phaseDuel = {
    active: true,
    step: "attack_pave",

    attacker,
    defender,

    attackerJid: match.attacker,
    defenderJid: match.defender,

    attackPave: null,
    defensePave: null,

    starterAttack: match.pendingAttack,
    starterDefense: defense
};

// 🔥 NEXT MATCH UP
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
    // ⚠️ WARNING 1 MIN
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
    
    // ⏱️ LATENCE OUT (SAFE)
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
    
// 📉 FALLBACK : DEFENSE ACTIVE
const resumeDefense = genererResumeFull(
    defense,
    match,
    "defense"
);
const noteDefense = Math.max(2, Math.min(5, noterPave(defense)));
    
// 🔍 FIND PLAYER
const findPlayer = (txt, ownerJid) => {

    const lineup =
        normalizeJid(ownerJid) === normalizeJid(match.id1)
            ? (match.lineup1 || [])
            : (match.lineup2 || []);

    const t = pureName(txt);

    return lineup.find(p => {

        const n = pureName(p.nom);

        return t.includes(n) || n.includes(t);

    }) || null;
};    

match.joueurTour = match.attacker;

// ==============================
// ⚔️ ATTENTE DE LA RÉPONSE ATTAQUANT
// ==============================
const attacker = findPlayer(match.pendingAttack, match.attacker);
const defender = findPlayer(defense, match.defender);

console.log("=== CREATE RESPONSE ===");
console.log("pendingAttack :", match.pendingAttack);
console.log("attacker trouvé :", attacker.nom);
console.log("defender trouvé :", defender.nom);
    
if (!attacker) {
    return ovl.sendMessage(chat, {
        text: "❌ Joueur attaquant non détecté dans le lineup."
    });
}

if (!defender) {
    return ovl.sendMessage(chat, {
        text: "❌ Joueur défenseur non détecté dans le lineup."
    });
}

// ==============================
// 📊 ACTION ATTAQUANT
// ==============================

attacker.stats.actions = (attacker.stats.actions || 0) + 1;

attacker.stats.lastAction = {
    type: "attaque",
    texte: match.pendingAttack
};
                           
// 🔄 SOURCE UNIQUE : l'attaquant garde le ballon
const attackerJid = attacker.id || attacker.jid || match.attacker;

match.ballHolder = attacker.nom;
match.ballHolderPlayer = attacker.nom;
match.ballHolderJid = attackerJid;
match.joueurTour = attackerJid;

// 🗺️ TRACKER
trackerBalle(match, attacker.nom);
    
match.phaseDuel = {
    active: true,
    step: "response",

    attacker,
    defender,

    attackerJid: match.attacker,
    defenderJid: match.defender,

    attackText: match.pendingAttack,
    defenseText: defense
};

const nextId = match.attacker;
const nextTag = getTagFromJid(nextId);

// 📩 MESSAGE
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
    
// ⚠️ WARNING
if (match.warningTimer) clearTimeout(match.warningTimer);

match.warningTimer = setTimeout(async () => {

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

// ⏱️ LATENCE OUT
if (match.defenseTimer) clearTimeout(match.defenseTimer);

match.defenseTimer = setTimeout(() => {

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

    match.ballHolder = fallbackOpponent?.nom || "unknown";
match.ballHolderPlayer = fallbackOpponent?.nom || "unknown";
match.ballHolderJid = finalOpponent;
match.joueurTour = finalOpponent;

trackerBalle(match, fallbackOpponent?.nom || "unknown");
trackerNouveauTour(match);
trackerLog(match);
    
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

// 🔁 CLEAN STATE (SAFE ORDER)
return true;
}
       

// ⚽ DUELS ET MATCH UP 🆚
async function handleDuelMatch(
    match,
    attaqueText,
    defenseText,
    responseText = null
) {

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

    // 🔍 FIND PLAYER
    const findPlayer = (txt) => {

        const t = pureName(txt);

        return allPlayers.find(p => {

            const n = pureName(p.nom);

            return t.includes(n) || n.includes(t);

        }) || null;
    };

    let attacker = null;
    let defender = null;

    // ⚽ SOURCE DE VÉRITÉ : phaseDuel snapshots (PRIORITÉ ABSOLUE)
    // Garantit que attacker/defender = ceux du match up, pas une résolution par texte
    if (match.phaseDuel?.attacker && match.phaseDuel?.defender) {
        attacker = match.phaseDuel.attacker;
        defender = match.phaseDuel.defender;
    } else {
        // Fallback si pas de phaseDuel (appel direct)
        attacker = findPlayer(attaqueText);
defender = findPlayer(defenseText);

if (!attacker) {
    return {
        ok: false,
        type: "erreur",
        message: "❌ Joueur attaquant non détecté dans le lineup."
    };
}

if (!defender) {
    return {
        ok: false,
        type: "erreur",
        message: "❌ Joueur défenseur non détecté dans le lineup."
    };
}

        // Anti-collision attacker = defender
        if (defender && attacker &&
            normalizeJid(defender.id || defender.jid) === normalizeJid(attacker.id || attacker.jid)
        ) {
            defender = allPlayers.find(p =>
                normalizeJid(p.id || p.jid) !== normalizeJid(attacker.id || attacker.jid) &&
                pureName(defenseText).includes(pureName(p.nom))
            );
        }

        // Cible tactique
        const tacticalTarget = detectTargetPlayer(defenseText, allPlayers);
        if (tacticalTarget) defender = tacticalTarget;
    }
    // ❌ VALIDATION
    if (!attacker || !defender) {

        return {
            ok: false,
            type: "erreur",
            message: "❌ Joueurs introuvables"
        };
    }

    const atkStats = attacker.stats || {};
const defStats = defender.stats || {};

// Source du dribble : réponse si elle existe, sinon attaque initiale
const dribbleSource = responseText || attaqueText;

const atk = dribbleSource.toLowerCase();
const def = defenseText.toLowerCase();

    // 🎯 RESULT GLOBAL
    let result = null;

// ⚡ VITESSE
const atkVmax = atkStats.acc || 50;
const defBaseVmax = defStats.acc || 50;

// 🧍 POSTURE DÉFENSIVE
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

// ⚙️ VMAX DEF
let defVmax =
    posture === "debout"
        ? defBaseVmax * 0.5
        : defBaseVmax;


// 🎯 DÉTECTION DRIBBLE
const explicitDribble =
    detectIntentDribble(atk);

let detectedDribble =
    DRIBBLES.find(d => atk.includes(d));

// DRIBBLE CREATIF⚽ 
if (!detectedDribble && explicitDribble) {
    detectedDribble = "creative";
}

const isDribbleAction =
    !!detectedDribble;

// 🎯 VALIDATION DRIBBLE
let dribbleCheck = null;

if (isDribbleAction) {

const dribbleText = responseText || attaqueText;

dribbleCheck =
    validateDribbleBlueprint(
        detectedDribble,
        dribbleText
    );    

if (!dribbleCheck.valid) {

    // 🔄 PERTE DE BALLE
    match.ballHolder = defender.nom;

    const defenderId = defender.id || defender.jid;

    match.joueurTour = defenderId;
    match.attacker = defenderId;
    match.waitingDefenseFrom = null;

    return {
        ok: false,
        type: "BAD_DRIBBLE",
        attacker,
        defender,
        msg:
`❌ ${attacker.nom} exécute mal son dribble.

🔁 ${defender.nom} récupère la possession !`,
        details:
            dribbleCheck.reason
    };
}
    
}

// 🛡️ DÉTECTION TACLE 
let detectedTackle = null;
let tackleCheck = null;

// on essaie de trouver un tacle connu
detectedTackle = Object.keys(TACKLE_BLUEPRINTS)
    .find(t => def.includes(t));

// fallback si intention défensive mais tacle non explicite
const explicitTackle =
    def.includes("tacle") ||
    def.includes("tacle debout") ||
    def.includes("tacle glissé") ||
    def.includes("tacle circulaire") ||
    def.includes("tacler");

if (!detectedTackle && explicitTackle) {
    detectedTackle = "tacle debout"; // fallback intelligent
}

const isTackleAction = !!detectedTackle;   
// 🧱 VALIDATION TACLE
if (isTackleAction) {

    tackleCheck = validateTackleBlueprint(
        detectedTackle,
        defenseText
    );
    // ❌ tacle raté
    if (!tackleCheck.valid) {

        match.ballHolder = attacker.nom;

        const attackerId = attacker.id || attacker.jid;

        match.joueurTour = attackerId;
        match.defender = attackerId;
        match.waitingDefenseFrom = null;

        return {
            ok: true,
            type: "BAD_TACKLE",
            attacker,
            defender,
            msg:
`❌ ${defender.nom} rate complètement son intervention défensive.

⚡ ${attacker.nom} garde la possession !`,
            details: tackleCheck.reason
        };
    }
}

    

// ⚽ PRIORITÉ 1 : DRIBBLE VS TACKLE (BLUEPRINT SYSTEM)
if (isDribbleAction && isTackleAction) {

    const attackStat = atkStats.dri || 50;
    const defenseStat = defStats.def || 50;

    const attackScore = dribbleCheck?.similarity || 0;
    const defenseScore = tackleCheck?.similarity || 0;

    const attackTotal = attackStat + attackScore;
    const defenseTotal = defenseStat + defenseScore;

    let winner = null;

    // 🧠 CAS 1 : DRIBBLE PARFAIT / TACLE RATÉ
    if (dribbleCheck?.valid && !tackleCheck?.valid) {
        winner = "attacker";
    }

    // 🧠 CAS 2 : TACLE PARFAIT / DRIBBLE RATÉ
    else if (!dribbleCheck?.valid && tackleCheck?.valid) {
        winner = "defender";
    }

    // 🧠 CAS 3 : LES DEUX VALIDES
    else if (dribbleCheck?.valid && tackleCheck?.valid) {
        winner = attackTotal > defenseTotal ? "attacker" : "defender";
    }

    // 🧠 CAS 4 : LES DEUX RATÉS
    else {
        if (attackTotal > defenseTotal) winner = "attacker";
        else if (defenseTotal > attackTotal) winner = "defender";
        else winner = Math.random() > 0.5 ? "attacker" : "defender";
    }

    // ⚔️ RESULT FINAL
    if (winner === "attacker") {

        match.joueurTour = attacker.id || attacker.jid;

        return {
            ok: true,
            type: "DRIBBLE_WIN",
            attacker,
            defender,
            attackStat,
            defenseStat,
            attackScore,
            defenseScore,
            attackTotal,
            defenseTotal,
            msg: `🔥⚽ ${attacker.nom} élimine son adversaire et conserve le ballon...`
        };
    }

    match.joueurTour = defender.id || defender.jid;

    return {
        ok: false,
        type: "DRIBBLE_LOSE",
        attacker,
        defender,
        attackStat,
        defenseStat,
        attackScore,
        defenseScore,
        attackTotal,
        defenseTotal,
        msg: `⚽🥅 ${defender.nom} remporte le duel et récupère le ballon...`
    };
}
    
// 🧱 DÉFENSE PASSIVE SIMPLE
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
// 🧱 DÉFENSE ACTIVE SIMPLE
const activeDefenseKeywords = [
    "tacle",
    "tacle debout", 
    "tacle circulaire", 
    "tacle glissé",
    "interception",
    "contre",
    "récupère",
    "récupération",
    "dégage",
    "dévie",
    "charge",
    "épaule",
    "presse",
    "arrache"
];

const isActiveDefense =
    activeDefenseKeywords.some(k => def.includes(k));

const isPassive =
    !isActiveDefense &&
    passiveKeywords.some(k => def.includes(k));

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
    
// 💪 DUELS PHYSIQUES
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

    // 🧱 VALIDATION ÉPAULE
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

    // 💥 RÉSOLUTION PHYSIQUE
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

// 🏃 CHASE SYSTEM
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

// 🔒 RESTRICTIONS CHASE
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

// 🚀 EXECUTION CHASE
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

// ⚖️ FALLBACK
if (!result) {

    result = {
        ok: false,
        type: "contre",
        msg:
`⚔️ Duel en cours...`
    };
}
    
// 📤 RETURN SIMPLE
return {
    ok: result.ok,
    type: result.type,

    attacker,
    defender,

    msg: result.msg
};
} 

                        

// ⚽ DRIBBLE VS DEFENSE ENGINE (FULL IA + PHYSIQUE + BODY SYSTEM)

function resolveDribbleDuel(match, attacker, defender, attackText, defenseText) {

    const atk = attacker.stats || {};
    const def = defender.stats || {};

    const tA = (attackText || "").toLowerCase();
    const tD = (defenseText || "").toLowerCase();

    // Mise à jour orientation corps (via fonction globale)
    updateBody(attacker, attackText);
    updateBody(defender, defenseText);

    const attackerState = attacker.bodyState || "front";
    const defenderState = defender.bodyState || "front";

    // ⚽ DRIBBLES RECONNUS (liste étendue locale)
    const DRIBBLES_LOCAL = [
        "crochet extérieur","crochet intérieur","double contact","roulette",
        "elastico","petit pont","rainbow","step over","feinte de corps",
        "feinte de frappe","feinte de passe","changement de direction",
        "pivot du torse","contrôle semelle","conduite intérieure",
        "conduite extérieure","double crochet","dribble rapide",
        "protection de balle","tourne sur lui même",
        "sortie en accélération","push balle","dribble court","dribble long"
    ];

    const isDribble = DRIBBLES_LOCAL.some(d => tA.includes(d));

    // 🧠 INTENTION
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

    // ⚖️ VALIDATION DRIBBLE
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

    // 🧠 TIMING
    const diff = (atk.dri || 50) - (def.def || 50);

    let reactionWindow =
        diff > 10 ? "after_sprint" :
        diff > 0 ? "after_combo" :
        "anytime";

    // 🧠 BODY ADVANTAGE
    const bodyAdvantage =
        (attackerState === "front" && defenderState === "back") ? 5 :
        (attackerState === "left" && defenderState === "right") ? 3 :
        (attackerState === "right" && defenderState === "left") ? 3 : 0;

    // 🧱 TACLE SYSTEM
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

    // ❌ ANTICIPATION
    if (tackle.ok && reactionWindow === "after_combo") {
        return { ok: false, type: "divination", msg: `❌ ${defender.nom} anticipe trop tôt` };
    }

    if (tackle.ok && reactionWindow === "after_sprint") {
        return { ok: false, type: "divination", msg: "❌ Anticipation illégale" };
    }

    // 🛑 INTERCEPTION
    if (tackle.ok && tackle.type === "win_clean") {

        match.ball.holder = defender.nom;
        match.ball.state = "controle";

        const move = computeBallAfterTackle(tackle);
        match.ball.position = {
            x: (match.ball.position?.x || 0) + (move.dx || 0),
            y: (match.ball.position?.y || 0) + (move.dy || 0)
        };

        return {
            ok: false,
            type: "INTERCEPTION",
            msg: `🛑 ${defender.nom} récupère le ballon proprement`
        };
    }


    // ⚔️ FINAL DUEL
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


    // DÉPLACEMENTS ET POSITIONS TRACKING
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

    // 📍 MOVE Y (ZONE)
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

    // ↔️ MOVE X (LATÉRAL)
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

    // 🔒 LIMIT GLOBAL
    if (total > 10) {
        return { ok: false, erreur: "❌ Mouvement total invalide" };
    }

    if (!isInsideField(joueur.position)) {
        return { ok: false, erreur: "❌ Hors terrain" };
    }

    // 🧠 UPDATE GLOBAL (ONLY ONCE)
    syncPlayer(match, joueur);

    // 🧠 IA SANS AUTO-REPOSITION
    // (juste réaction, PAS déplacement forcé)
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


    // ⚽ PASSES, INTERCEPTIONS, CONTRÔLES
async function handlePasses(match, action, joueur) {

    if (!action || !joueur) {
        return { ok: false, erreur: "❌ Données invalides (passe)" };
    }

    const txt = action.toLowerCase();

    // 🎯 TYPE DE PASSE
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

    // 📐 VALIDATION
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

    // 🧠 PRÉCISION
    const modele = TYPES_PASSES[typePasse];
    const mots = modele.toLowerCase().split(" ");

    let score = 0;
    mots.forEach(m => { if (txt.includes(m)) score++; });

    const precision = Math.round((score / mots.length) * 100);

    if (precision < 60) {
        return { ok: false, erreur: `❌ Passe mal exécutée (${precision}%)` };
    }

    // 📏 DISTANCE
    const dist = extraireDistance(txt);

    if (dist && dist > 30) {
        return { ok: false, erreur: "❌ Passe trop longue (>30m)" };
    }

    // 🎯 INTERCEPTION
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

    // 🎯 CIBLE PASSE
    const cibleNom = txt.match(/vers\s+([a-zA-Z0-9_]+)/i)?.[1];

    let cible = null;

    if (cibleNom) {
        const all = [...(match.lineup1 || []), ...(match.lineup2 || [])];
        cible = all.find(p =>
            p.nom?.toLowerCase().includes(cibleNom.toLowerCase())
        );
    }

    // ⚽ CONTRÔLE
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

    // 📍 TRANSFERT BALLE
    if (cible) {

        match.ballHolder = cible.nom;

        match.ballPosition = {
            x: cible.position?.x,
            y: cible.position?.y
        };

        updateGlobalPositions(match, cible);

        // 🧠 MARKING (SANS DEPLACEMENT)
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

    // 📍 ZONE UPDATE
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

        // ⛔ STOP SAFE ENGINE (IMPORTANT)

        // 🧨 bloque les cycles startMatchCycle
        match.currentTurnId = -1;

        // ⛔ timers principaux
        if (match.turnTimer) clearTimeout(match.turnTimer);
        if (match.warningTimer) clearTimeout(match.warningTimer);

        match.turnTimer = null;
        match.warningTimer = null;

        // ⛔ timers lineup et match
        if (match.timerLineup) clearTimeout(match.timerLineup);
        if (match.timerMatch) clearTimeout(match.timerMatch);
        if (match.defenseTimer) clearTimeout(match.defenseTimer);

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

        // 🧨 STOP STATE GAME
        match.etat = "arrete";
        match.kickoffStarted = false;

        match.pendingAttack = null;
        match.waitingDefenseFrom = null;
        match.phaseDuel = null;

        match.attacker = null;
        match.defender = null;

        // 🗑 REMOVE GLOBAL MATCH
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
