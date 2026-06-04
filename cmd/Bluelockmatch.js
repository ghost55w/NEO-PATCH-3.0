// ===============================
// 📦 IMPORTS
// ===============================
const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

// ===============================
// 📊 GLOBAL STATE
// ===============================
const matchsActifs = new Map();

// ===============================
// 📍 POSITION MAP
// ===============================
const POSITION_POSTES = {

    AG: { zoneX: "gauche", zoneY: "B1" },
    AC: { zoneX: "axe", zoneY: "B1" },
    AD: { zoneX: "droite", zoneY: "B1" },

    MG: { zoneX: "gauche", zoneY: "C1" },
    MC: { zoneX: "axe", zoneY: "C1" },
    MD: { zoneX: "droite", zoneY: "C1" },

    DG: { zoneX: "gauche", zoneY: "A2" },
    DC: { zoneX: "axe", zoneY: "A2" },
    DD: { zoneX: "droite", zoneY: "A2" }
};

// ===============================
// 🧠 ARBITRE
// ===============================
class BlueLockArbiter {
    constructor() {
        this.matches = new Map();
    }

    createMatch(chat, data) {
        const match = {
            chat,
            data,

            players: {
                team1: null,
                team2: null
            },

            lineup: {},

            engine: {
                status: "WAITING_LINEUPS",
                turn: 0,
                maxTurns: 20,
                possession: null,
                possessionTurns: 0,
                maxPossessionTurns: 5,
                score: { team1: 0, team2: 0 },
                startedAt: null
            },

            timeout: null
        };

        this.matches.set(chat, match);
        matchsActifs.set(chat, match);

        return match;
    }

    get(chat) {
        return this.matches.get(chat);
    }

    delete(chat) {
        const m = this.matches.get(chat);
        if (m?.timeout) clearTimeout(m.timeout);
        this.matches.delete(chat);
        matchsActifs.delete(chat);
    }
}

const arbiter = new BlueLockArbiter();

// ===============================
// 🎲 HELPERS
// ===============================
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p = 0.5) => Math.random() < p;

// ===============================
// 🔍 CARD FINDER
// ===============================
function findCardByName(name) {

    return cardsBlueLock.find(card =>
        card.name.toLowerCase() === name.toLowerCase()
    );
}

// ===============================
// 🧾 PARSE MATCH PAVÉ
// ===============================
function parseMatchPave(text) {
    return {
        team1: text.match(/Team 1:\s*(.+)/i)?.[1]?.trim(),
        team2: text.match(/Team 2:\s*(.+)/i)?.[1]?.trim(),
        gardien: text.match(/Gardien:\s*(.+)/i)?.[1]?.trim(),
        scoreWin: text.match(/Score win:\s*(.+)/i)?.[1]?.trim()
    };
}

// ===============================
// 🧠 PARSE LINEUP + CARDS
// ===============================
function parseLineupWithCards(text) {

    const players = [];
    const lines = text.split("\n");

    for (const l of lines) {

        const m = l.match(/\d+\s+👤\((.+?)\)\s+(.+?)(?:\s+\((\d+)\))?/);

        if (!m) continue;

        const position = m[1].trim();
        const name = m[2].trim();

        const card = findCardByName(name);

        if (!card) continue;

        players.push({
            name: card.name,
            position,
            ovr: card.ovr,
            phy: card.phy,
            sho: card.sho,
            pass: card.pass,
            dri: card.dri,
            zone: POSITION_POSTES[position] || null
        });
    }

    return players;
}

// ===============================
// 🧠 BUILD TEAM
// ===============================
function buildTeam(lineupText, owner) {

    const players = parseLineupWithCards(lineupText);

    return {
        owner,
        players,
        avgOVR: Math.round(
            players.reduce((a, b) => a + b.ovr, 0) / players.length
        )
    };
}

// ===============================
// 🧠 KICKOFF PLAYER SELECTOR
// ===============================
function getKickoffPlayer(players) {

    let mc = players.find(p => p.position === "MC");
    if (mc) return mc;

    const mids = players.filter(p => ["MG", "MC", "MD"].includes(p.position));
    if (mids.length) return mids.sort((a, b) => b.ovr - a.ovr)[0];

    const atk = players.filter(p => ["AG", "AC", "AD"].includes(p.position));
    if (atk.length) return atk.sort((a, b) => b.ovr - a.ovr)[0];

    return players[0];
}

// ===============================
// ⚽ MATCH COMMAND
// ===============================
ovlcmd({
    pattern: "match⚽",
    category: "game"
}, async (ms, ovl) => {

    const chat = ms.key.remoteJid;

    await ovl.sendMessage(chat, {
        text: `
🔷⚽ *MATCH BLUE LOCK* 🥅

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Team 1: 
🥅👤Team 2:  
🥅🧤Gardien: 
⌛ Score win: 

╰───────────────────
             🔷BLUELOCK⚽🥅
`
    });
});

// ===============================
// 🧠 MATCH SETUP
// ===============================
async function handleMatchSetup(ms, ovl) {

    const chat = ms.key.remoteJid;

    const text =
        ms.message?.conversation ||
        ms.message?.extendedTextMessage?.text;

    if (!text || !text.includes("MATCH BLUE LOCK")) return false;

    const data = parseMatchPave(text);

    const p1 = MyNeoFunctions.findByName(data.team1);
    const p2 = MyNeoFunctions.findByName(data.team2);

    if (!p1 || !p2) {
        await ovl.sendMessage(chat, {
            text: "❌ Aucun utilisateur trouvé dans la base de données."
        });
        return true;
    }

    const match = arbiter.createMatch(chat, data);

    match.players.team1 = p1;
    match.players.team2 = p2;

    // ===============================
    // 🧤 GARDIEN GLOBAL
    // ===============================
    match.gardien = Math.max(
        70,
        Number(data.gardien) || 70
    );

    // ===============================
    // ⚽ SCORE DE VICTOIRE
    // ===============================
    match.scoreWin = Math.min(
        3,
        Math.max(
            1,
            Number(data.scoreWin) || 1
        )
    );

    // ===============================
    // 📊 SCORE MATCH
    // ===============================
    match.score1 = 0;
    match.score2 = 0;

    // ===============================
    // 🎲 IMAGE ALÉATOIRE
    // ===============================
    const imagesReady = [
        "https://files.catbox.moe/dlj5z6.jpg",
        "https://files.catbox.moe/fdadd0.jpeg",
        "https://files.catbox.moe/4104s3.jpg"
    ];

    const imageRandom =
        imagesReady[Math.floor(Math.random() * imagesReady.length)];

    // ===============================
    // 📢 MATCH VALIDÉ
    // ===============================
    await ovl.sendMessage(chat, {
        image: { url: imageRandom },
        caption: `
🔷⚽ MATCH BLUE LOCK 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🎙️: ✅ Équipes confirmées !

👤 Team 1: ${p1.name}
👤 Team 2: ${p2.name}
🧤 Gardien: ${match.gardien}
⚽ Score Win: ${match.scoreWin} Goal${match.scoreWin > 1 ? "s" : ""}

╰───────────────────
             🔷BLUELOCK⚽🥅
`
    });

    // ===============================
    // ⏳ TIMEOUT LINEUP
    // ===============================
    match.timeout = setTimeout(async () => {

        arbiter.delete(chat);

        await ovl.sendMessage(chat, {
            text: "⛔ Match annulé (timeout lineup)"
        });

    }, 2 * 60 * 1000);

    return true;
}

// ===============================
// 📥 LINEUP HANDLER (SECURISÉ)
// ===============================
async function handleLineup(ms, ovl) {

    const chat = ms.key.remoteJid;
    const match = arbiter.get(chat);
    if (!match) return false;

    const text =
        ms.message?.conversation ||
        ms.message?.extendedTextMessage?.text ||
        ms.message?.imageMessage?.caption;

    if (!text) return false;

    const sender = ms.key.participant || ms.key.remoteJid;

    const isTeam1 = match.players.team1.jid === sender;
    const isTeam2 = match.players.team2.jid === sender;

    if (!isTeam1 && !isTeam2) {
        await ovl.sendMessage(chat, {
            text: "⛔ Tu n'es pas autorisé à envoyer ce lineup."
        });
        return true;
    }

    const key = isTeam1 ? "team1" : "team2";

    if (match.lineup[key]) {
        await ovl.sendMessage(chat, {
            text: "⚠️ Lineup déjà envoyé."
        });
        return true;
    }

    // 🧠 BUILD TEAM WITH CARDS
    match.lineup[key] = buildTeam(text, match.players[key].name);

    await ovl.sendMessage(chat, {
        text: `✅ Formation validée pour *${match.players[key].name}*`
    });

    if (match.lineup.team1 && match.lineup.team2) {
        clearTimeout(match.timeout);
        await startCountdown(match, ovl);
    }

    return true;
}

// ===============================
// ⏳ COUNTDOWN
// ===============================
async function startCountdown(match, ovl) {

    const chat = match.chat;

    await ovl.sendMessage(chat, {
        image: { url: "https://i.imgur.com/img1.jpg" },
        caption: `
⏳ Les deux formations sont prêtes.
Le match commence dans *1 minute* 🥅⚽...
`
    });

    setTimeout(() => launchKickoff(match, ovl), 60000);
}

// ===============================
// 🚀 KICKOFF
// ===============================
async function launchKickoff(match, ovl) {

    const chat = match.chat;

    match.engine.status = "LIVE";

    const first = chance(0.5) ? "team1" : "team2";
    match.engine.possession = first;

    const teamPlayers = match.lineup[first].players;

    const starter = getKickoffPlayer(teamPlayers);

    const team = first === "team1"
        ? match.players.team1
        : match.players.team2;

    await ovl.sendMessage(chat, {
        image: { url: rand([
            "https://i.imgur.com/kick1.jpg",
            "https://i.imgur.com/kick2.jpg",
            "https://i.imgur.com/kick3.jpg"
        ]) },
        mentions: [team.jid],
        caption: `
🎙️⚽ *KICK OFF 🥅‼️* @${team.name} débute avec la possession !

🔥 ${starter.name} (OVR ${starter.ovr}) lance le jeu ⚽...

╰─────────────────▱▱▱
🔷BLUELOCK⚽🥅
`
    });

    startMatchEngine(match, ovl);
}

// ===============================
// 🔁 ENGINE SIMPLE
// ===============================
function startMatchEngine(match, ovl) {

    const chat = match.chat;

    const loop = async () => {

        if (match.engine.turn >= 20) {
            return endMatch(match, ovl);
        }

        match.engine.turn++;

        await ovl.sendMessage(chat, {
            text: `
⚽ TOUR ${match.engine.turn}/20

🔥 Possession:
${match.engine.possession === "team1"
? match.players.team1.name
: match.players.team2.name}
`
        });

        match.engine.possessionTurns++;

        if (match.engine.possessionTurns >= 5) {
            match.engine.possessionTurns = 0;
            match.engine.possession =
                match.engine.possession === "team1" ? "team2" : "team1";
        }

        setTimeout(loop, 6 * 60 * 1000);
    };

    loop();
}

// ===============================
// 🏁 END MATCH
// ===============================
async function endMatch(match, ovl) {

    const chat = match.chat;

    await ovl.sendMessage(chat, {
        text: `
🏁 FIN DU MATCH

${match.players.team1.name} vs ${match.players.team2.name}

🔷 BLUE LOCK ⚽🥅
`
    });

    arbiter.delete(chat);
}

// ===============================
// 🔌 ROUTER
// ===============================
async function handleBlueLock(ms, ovl) {

    if (await handleMatchSetup(ms, ovl)) return true;
    if (await handleLineup(ms, ovl)) return true;

    return false;
}

/* ===============================
⛔ COMMANDE +STOPMATCH⚽
================================= */
ovlcmd({
    nom_cmd: "stopmatch⚽",
    classe: "BLUELOCK⚽",
    react: "⛔",
    desc: "Arrêter le match en cours"
}, async (ms_org, ovl) => {

    try {

        const chat = ms_org.key.remoteJid;
        const match = matchsActifs.get(chat);

        if (!match) {
            return await ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        /* ===============================
        ⛔ STOP TIMERS
        ================================= */

        const timers = [
            "timeout",
            "timerMatch",
            "timerKickoff",
            "timerTour",
            "timerAction",
            "timerGlobal",
            "timerPave",
            "turnTimer",
            "warningTimer"
        ];

        for (const timer of timers) {

            if (match[timer]) {
                clearTimeout(match[timer]);
                clearInterval(match[timer]);
                match[timer] = null;
            }
        }

        /* ===============================
        ⛔ STOP ENGINE
        ================================= */

        if (match.engine) {

            match.engine.status = "STOPPED";
            match.engine.possession = null;
            match.engine.possessionTurns = 0;
        }

        /* ===============================
        ⛔ RESET STATES
        ================================= */

        match.pendingAttack = null;
        match.waitingDefenseFrom = null;

        match.phaseDuel = null;

        match.attacker = null;
        match.defender = null;

        match.currentTurnId = -1;
        match.kickoffStarted = false;

        match.etat = "arrete";

        /* ===============================
        🗑 DELETE MATCH
        ================================= */

        matchsActifs.delete(chat);

        if (arbiter?.matches) {
            arbiter.matches.delete(chat);
        }

        /* ===============================
        📢 CONFIRMATION
        ================================= */

        await ovl.sendMessage(chat, {
            text:
`⛔⚽ MATCH BLUE LOCK ARRÊTÉ 🥅

✔ Tous les cycles stoppés
✔ Tous les timers annulés
✔ Match supprimé de la mémoire

╰─────────────────▱▱▱
        🔷BLUELOCK⚽🥅`
        });

    } catch (e) {

        console.error("❌ Erreur stopmatch :", e);

        await ovl.sendMessage(ms_org.key.remoteJid, {
            text: "❌ Erreur lors de l'arrêt du match."
        });
    }
});

module.exports = { handleBlueLock };
