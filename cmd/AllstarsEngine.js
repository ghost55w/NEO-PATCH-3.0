const { ovlcmd } = require("../lib/ovlcmd");

const {
    getData,
    setfiche,
    getAllFiches
} = require("../DataBase/allstars_divs_fiches");

const { AllStarsDivsFiche } = require("../DataBase/allstars_divs_fiches");

const { cards } = require("../DataBase/cards");
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
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

//================= DUELS PAR GROUPE =================
const duelsEnCours = {};
const matchAttente = {};

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
//================= RECHERCHE FICHE PAR PSEUDO =================

async function getFicheByPseudo(pseudo) {

    const nom = normalizeName(pseudo);

    const fiches = await getAllFiches();

    return fiches.find(f => 
        normalizeName(f.pseudo) === nom
    );

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
ovlcmd({
    nom_cmd: "match🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Lancer un match VS"
}, async (ms_org, ovl, cmd_options) => {

    const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;

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
        "https://files.catbox.moe/fc5v8n.jpg",
        "https://files.catbox.moe/8g6zu2.jpg"
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

//================================================
// 🌀 SYSTEME INSCRIPTION JOUEURS MATCH
//================================================

ovlcmd({
    nom_cmd: "systeme_match_allstars",
    classe: "ALLSTARS🌀",
}, async (ms_org, ovl, cmd_options) => {


    const texte = cmd_options.texte || "";

    const chat = ms_org;


    const matchId = matchAttente[chat];

    if (!matchId) return;


    const match = duelsEnCours[matchId];


    if (!match || match.etat !== "waiting_players") return;



    const j1 = texte.match(/joueur\s*1\s*:\s*(.+)/i);
    const j2 = texte.match(/joueur\s*2\s*:\s*(.+)/i);


    if (!j1 || !j2) return;



    const pseudo1 = j1[1].trim();
    const pseudo2 = j2[1].trim();



    const fiche1 = await getFicheByPseudo(pseudo1);
    const fiche2 = await getFicheByPseudo(pseudo2);



    if (!fiche1 || !fiche2) {

        await ovl.sendMessage(chat,{
            text:
`❌ JOUEUR INTROUVABLE

${!fiche1 ? `❌ ${pseudo1}` : ""}
${!fiche2 ? `❌ ${pseudo2}` : ""}

Les joueurs doivent posséder une fiche ALL STARS.`
        });

        return;
    }



    match.joueurs = [
        {
            pseudo: fiche1.pseudo,
            jid: fiche1.jid,
            fiche: fiche1
        },
        {
            pseudo: fiche2.pseudo,
            jid: fiche2.jid,
            fiche: fiche2
        }
    ];


    match.fiches = {
        joueur1: fiche1,
        joueur2: fiche2
    };


    match.etat = "loading_characters";



    await ovl.sendMessage(chat,{
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

✅ JOUEURS CONFIRMÉS 🎉

🎮 Joueur 1 : ${fiche1.pseudo}
        🆚
🎮 Joueur 2 : ${fiche2.pseudo}

📂 Les deux fiches ont été trouvées.

╰───────────────────
                      🔆🌀`
    });



    const msg = await ovl.sendMessage(chat,{
        text:"🌀 Chargement."
    });



    for(const txt of [
        "🌀 Chargement.",
        "🌀 Chargement..",
        "🌀 Chargement..."
    ]){

        await new Promise(r=>setTimeout(r,500));

        await ovl.sendMessage(chat,{
            text:txt,
            edit:msg.key
        });

    }



    match.etat = "waiting_cards";



    await ovl.sendMessage(chat,{
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

Veuillez écrire le nom complet de vos personnages !

Exemple :

🌀 Tanjiro
🌀 Sasuke
🌀 Goku

🎮⌛ Temps d'attente : 2 minutes...

╰───────────────────
                      🔆🌀`
    });


}); 





