const { ovlcmd } = require("../lib/ovlcmd");
const { getData, setfiche } = require("../DataBase/allstars_divs_fiches");
const { cards } = require('../DataBase/cards');
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
const { getData, setfiche, getAllFiches } = require("../DataBase/allstars_divs_fiches");
const config = require("../set");

//-------- UTILITAIRES
const formatNumber = n => {
    try {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch {
        return n;
    }
};

const normalize = str =>
    String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

//-------- VERIFICATION NIVEAU POUR ACHAT
const checkLevelRequirement = (playerLevel, cardCategory, cardGrade) => {
    let levelRequired = 0;

    if (["or", "gold"].includes(cardCategory)) {
        if (["s+", "sp", "sm"].includes(cardGrade)) levelRequired = 10;
        else if (cardGrade === "s") levelRequired = 5;
    } else if (["argent", "silver"].includes(cardCategory)) {
        if (["s+", "sp", "sm"].includes(cardGrade)) levelRequired = 5;
        else if (cardGrade === "s") levelRequired = 5;
    } else if (["bronze"].includes(cardCategory)) {
        if (["s+", "sp", "sm"].includes(cardGrade)) levelRequired = 3;
        else if (cardGrade === "s") levelRequired = 3;
    } else if (["ss", "ss+", "ssp", "ss-", "ssm"].includes(cardGrade)) {
        levelRequired = 15;
    }

    if (playerLevel < levelRequired) {
        return {
            ok: false,
            message:
                `❌ Tu n'as pas le niveau requis pour posséder cette carte.\n` +
                `Niveau requis: ${levelRequired} ▲, ton niveau: ${playerLevel} ▲  
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░  
                              🌀🔆`
        };
    }

    return { ok: true };
};

//-------- JOUEURS QUI POSSÈDENT UNE CARTE
const getCardOwners = async (cardName) => {
    const allFiches = await getAllFiches();
    const owners = [];
    const normalizedCard = normalize(cardName);

    for (const fiche of allFiches) {
        const playerCards = (fiche.cards || "")
            .split("\n")
            .map(c => normalize(c.trim()));

        if (playerCards.includes(normalizedCard) && fiche.jid) {
            owners.push(fiche.jid);
        }
    }
    return owners;
};
//================= ARENES =================
const arenes = [
    { nom: 'Desert Montagneux⛰️', image: 'https://files.catbox.moe/aoximf.jpg' },
    { nom: 'Ville en Ruines🏚️', image: 'https://files.catbox.moe/2qmvpa.jpg' },
    { nom: 'Centre-ville🏙️', image: 'https://files.catbox.moe/pzlkf9.jpg' },
    { nom: 'Arise🌇', image: 'https://files.catbox.moe/3vlsmw.jpg' },
    { nom: 'Salle du temps ⌛', image: 'https://files.catbox.moe/j4e1pp.jpg' },
    { nom: 'Valley de la fin🗿', image: 'https://files.catbox.moe/m0k1jp.jpg' },
    { nom: 'École d\'exorcisme de Tokyo📿', image: 'https://files.catbox.moe/rgznzb.jpg' },
    { nom: 'Marinford🏰', image: 'https://files.catbox.moe/4bygut.jpg' },
    { nom: 'Cathédrale⛩️', image: 'https://files.catbox.moe/ie6jvx.jpg' }
];

//================= DUELS PAR GROUPE =================
const duelsEnCours = {};
let lastArenaIndex = -1;

//================= UTILS =================
function tirerAr() {
    let i;
    do { i = Math.floor(Math.random() * arenes.length); }
    while (i === lastArenaIndex);
    lastArenaIndex = i;
    return arenes[i];
}

function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(0, Math.min(100, stats[stat] + val));
}

function clean(txt) {
    return txt.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function normalizeName(n) {
    return n
        .toLowerCase()
        .replace(/@/g, '')
        .replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '')
        .trim();
}

//================= FICHE DUEL =================
function generateFicheDuel(duel) {
    return `*🆚VERSUS ARENA BATTLE🏆🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░░▒░
🔅 *${duel.equipe1[0].nom}*: 🫀:${duel.equipe1[0].stats.sta}% 🌀:${duel.equipe1[0].stats.energie}% ❤️:${duel.equipe1[0].stats.pv}%
                                   ~  *🆚*  ~
🔅 *${duel.equipe2[0].nom}*: 🫀:${duel.equipe2[0].stats.sta}% 🌀:${duel.equipe2[0].stats.energie}% ❤️:${duel.equipe2[0].stats.pv}%
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
*🌍 𝐀𝐫𝐞̀𝐧𝐞*: ${duel.arene.nom}
*🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞*: Boost 1 fois chaque 2 tours!
*⚖️ 𝐒𝐭𝐚𝐭𝐬*: ${duel.statsCustom || "Aucune"}
*🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭*: illimitée
*🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌*: 5m
*⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞*: 6mins ⚠️
*⭕ 𝐏𝐨𝐫𝐭𝐞́*: 10m
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*⚠️ Vous avez 🔟 tours max pour finir votre Adversaire !*
*Sinon la victoire sera donnée par décision selon l'offensive !*

╰───────────────────
🏆NSL PRO ESPORT ARENA® | RAZORX⚡™ `;
}


// COMMANDE DE LANCEMENT DU MATCH🌀🆚// 
const duelsEnCours = {};
const matchAttente = {};

ovlcmd({
    pattern: "match🌀",
    desc: "Lancer un match VS",
    react: "🌀",
    type: "game"
}, async (ovl, msg) => {

    const chat = msg.chat;

    const matchId = Date.now().toString();

    // 🧠 création du match
    duelsEnCours[matchId] = {
        id: matchId,
        etat: "waiting_players",
        joueurs: [],
        fiches: {},
        personnages: {},
        arene: null,
        tour: 0,
        createdAt: Date.now()
    };

    matchAttente[chat] = matchId;

    const images = [
        "https://files.catbox.moe/aoximf.jpg",
        "https://files.catbox.moe/2qmvpa.jpg",
        "https://files.catbox.moe/pzlkf9.jpg",
        "https://files.catbox.moe/3vlsmw.jpg",
        "https://files.catbox.moe/j4e1pp.jpg"
    ];

    const img = images[Math.floor(Math.random() * images.length)];

    await ovl.sendMessage(chat, {
        image: { url: img },
        caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

🔅 *MATCH MAKING*
Veuillez inscrire vos pseudos de joueurs:

*🎮 Joueur 1:*
*🎮 Joueur 2:*

⏳ Vous avez 2 minutes pour répondre.

╰───────────────────
🔆 ALL STARS JUMP 🌀`
    });

    // ⏱️ TIMER 2 MINUTES
    setTimeout(async () => {

        const match = duelsEnCours[matchId];

        if (!match || match.etat !== "waiting_players") return;

        await ovl.sendMessage(chat, {
            text:
`⛔ MATCH ANNULÉ
Aucun joueur valide détecté dans le temps imparti.`
        });

        delete duelsEnCours[matchId];
        delete matchAttente[chat];

    }, 120000);
});
