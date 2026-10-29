const { ovlcmd } = require("../lib/ovlcmd");
const { getAllFiches } = require("../DataBase/allstars_divs_fiches");

// ==========================================================
// 🖼️ IMAGES DES RUBRIQUES ALLSTARS
// ==========================================================

const imagesRubriquesAllstars = {
    "1": [
        "https://files.catbox.moe/uz7tyi.jpg",
        "https://files.catbox.moe/yhczn8.jpg",
        "https://files.catbox.moe/v6wvtz.jpg",
        "https://files.catbox.moe/j5e4vk.jpg"      
    ],

    "2": [
        "https://files.catbox.moe/ma5elg.jpg"
    ],

    "3": [
        "https://files.catbox.moe/tflyg4.jpg",
        "https://files.catbox.moe/9yi31e.jpg"
    ],

    "4": [
        "https://files.catbox.moe/g88wqp.jpg", 
        "https://files.catbox.moe/kgeovt.jpg"
        
    ],

    "5": [
        "https://files.catbox.moe/1uokf5.jpg"
    ]
};


const gifIntro = 'https://files.catbox.moe/7033mc.mp4';

ovlcmd(
  {
    nom_cmd: "menuneo🔷",
    classe: "AllStars🔷",
    react: "📘",
    desc: "Affiche le menu NEO",
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      /*  await ovl.sendMessage(ms_org, {
          video: { url: gifIntro },
          gifPlayback: true,
          caption: ""
        }, { quoted: ms });
  */
      const lien = "https://files.catbox.moe/x1shw4.jpg";
      const msg = `Bienvenue à NEOverse🔷, votre communauté de jeux text gaming RPTG🎮 sur whatsapp🪀par sa Majesté NEO KÏNGS⚜. Veuillez tapez les commandes pour être introduit à notre NE🌀Galaxy:
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░
+Gamepass🎮 (pour voir nos jeux)
+NSLpro🏆 (infos de la ligue) 
+Neoawards💫 (remise des prix).


🔷NEOVERSE🎮 `;
      await ovl.sendMessage(ms_org, { image: { url: lien }, caption: msg }, { quoted: ms });
    }
  }
);


ovlcmd(
    {
        nom_cmd: "syncclassement",
        classe: "AllStars🌀",
        react: "🏆",
        desc: "Synchronise les rangs All Stars"
    },
    async (ms_org, ovl, { ms }) => {
        try {
            const fiches = await getAllFiches();

            const joueurs = fiches
                .filter(f => Number(f.points) > 0)
                .sort((a, b) =>
                    Number(b.points) - Number(a.points) ||
                    Number(a.id) - Number(b.id)
                );

            for (let i = 0; i < joueurs.length; i++) {
                const f = joueurs[i];
                const position = i + 1;

                let classement;

                if (position === 1) classement = "1er🥇";
                else if (position === 2) classement = "2e🥈";
                else if (position === 3) classement = "3e🥉";
                else classement = `${position}e`;

                if (String(f.classement) !== classement) {
                    await f.update({ classement });
                }
            }

            for (const f of fiches) {
                if (Number(f.points) <= 0 && f.classement !== "aucun") {
                    await f.update({ classement: "aucun" });
                }
            }

            await ovl.sendMessage(
                ms_org,
                {
                    text: `✅ Classement synchronisé pour ${joueurs.length} joueurs.`
                },
                { quoted: ms }
            );

        } catch (error) {
            console.error("Erreur synchronisation classement :", error);

            await ovl.sendMessage(
                ms_org,
                { text: "❌ Échec de la synchronisation du classement." },
                { quoted: ms }
            );
        }
    }
);

ovlcmd(
  {
    nom_cmd: "gamepass🎮",
    classe: "AllStars🔷",
    react: "🎮",
    desc: "Affiche les passes de jeu",
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      await ovl.sendMessage(ms_org, {
        video: { url: "https://files.catbox.moe/yimc4o.mp4" },
        gifPlayback: true,
        caption: ""
      }, { quoted: ms });

      const lien = "https://files.catbox.moe/o2acuc.jpg";
      const msg = `*🎮GAMEPASS🔷NEOVERSE*
𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗎𝖾 𝖽𝖺𝗇𝗌 𝗅𝖾 𝖦𝖠𝖬𝖤𝖯𝖠𝖲𝖲,𝖯𝖫𝖠𝖸🎮 𝖺 𝗍𝖾𝗌 𝗃𝖾𝗎𝗑 𝖺𝗎 𝗆êm𝖾 𝖾𝗇𝖽𝗋𝗈𝗂𝗍🪀:
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░
+Allstars🌀 +Bluelock⚽  +Elysium💠

╰───────────────────
           *🔷Powered by NEOVERSE™*`;
      await ovl.sendMessage(ms_org, { image: { url: lien }, caption: msg }, { quoted: ms });
    }
  }
);

// ==========================================================
// 🌀 MENU INTERACTIF ALLSTARS
// ==========================================================

const allStarsMenuAttente = new Map();
// ==========================================================
// 🏆 MÉMOIRE DU CLASSEMENT ALLSTARS
// ==========================================================

// Conserve les positions précédentes pendant l'exécution du bot.
const allStarsPositionsPrecedentes = new Map();

// ==========================================================
// 🏆 CLASSEMENT DYNAMIQUE ALLSTARS
// ==========================================================

async function genererClassementAllStars() {
    try {
        const fiches = await getAllFiches();

        if (!fiches || fiches.length === 0) {
            return `. ◥◣              🌀JUMP™RANKINGS🏆🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

⚠️ Aucun joueur trouvé dans la base de données.

╰───────────────────
                                   *R A Z O R X™⚡*`;
        }

        // Récupérer les données des fiches Sequelize.
        const joueurs = fiches
            .map((fiche) => {
                const data = typeof fiche?.get === "function"
                    ? fiche.get({ plain: true })
                    : fiche?.dataValues || fiche?.data || fiche;

                if (!data) return null;

                const points = Number(data.points);

                // Ignorer les fiches sans pseudo ou avec des points invalides.
                if (
                    !data.pseudo ||
                    !String(data.pseudo).trim() ||
                    !Number.isFinite(points)
                ) {
                    return null;
                }

                return {
                    pseudo: String(data.pseudo).trim(),
                    points,
                    jid: data.jid || data.code_fiche || data.pseudo
                };
            })
            .filter(Boolean);

        // Trier du plus grand nombre de points au plus petit.
        joueurs.sort((a, b) => b.points - a.points);

        // Préparer les nouvelles positions.
        const nouvellesPositions = new Map();

        joueurs.forEach((joueur, index) => {
            nouvellesPositions.set(
                String(joueur.jid),
                index + 1
            );
        });

        
        // Construire le classement de tous les joueurs ayant plus de 0 point.
        const joueursClassement = joueurs.filter(
            joueur => joueur.points > 0
        );

        const lignes = [];

        const barre =
            "▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔";

        for (let i = 0; i < joueursClassement.length; i++) {
            const joueur = joueursClassement[i];
            const position = i + 1;
            const identifiant = String(joueur.jid);

            const anciennePosition =
                allStarsPositionsPrecedentes.get(identifiant);

            let mouvement = "";

            if (anciennePosition !== undefined) {
                if (position < anciennePosition) {
                    mouvement = " ▲";
                } else if (position > anciennePosition) {
                    mouvement = " ▼";
                }
            }

            const medailles = {
                1: "🥇",
                2: "🥈",
                3: "🥉"
            };

            if (position === 4 || position === 11) {
                lignes.push(barre);
            }

            const prefixe = medailles[position] || `${position}-`;
            const separation = position <= 3 ? "- " : "";

            lignes.push(
                `${prefixe} ${separation}*${joueur.pseudo}:* ${joueur.points} pts🏆${mouvement}`
            );
        }

        // Mettre à jour les positions après avoir calculé les mouvements.
        allStarsPositionsPrecedentes.clear();

        for (const [identifiant, position] of nouvellesPositions) {
            allStarsPositionsPrecedentes.set(identifiant, position);
        }

        return `. ◥◣              🌀JUMP™RANKINGS🏆🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

🎙️Classement des meilleurs joueurs ALL TIMES🌟🏆
#Alltimesrankings:

${lignes.join("\n")}

╰───────────────────
                                   *R A Z O R X™⚡*`;

    } catch (error) {
        console.error(
            "❌ Erreur classement AllStars :",
            error
        );

        return `⚠️ Impossible de charger le classement ALL STARS pour le moment.`;
    }
}


// ================= COMMANDE +ALLSTARS🌀 =================

ovlcmd({
    nom_cmd: "allstars🌀",
    classe: "AllStars🌀",
    react: "🎮",
    desc: "Affiche le menu interactif JUMP"
}, async (ms_org, ovl, { arg, ms }) => {

    if (arg && arg.length > 0) return;

    const joueur = ms.key.participant || ms.key.remoteJid;

    // Enregistre le joueur qui a ouvert le menu
    allStarsMenuAttente.set(ms_org, {
        joueur,
        date: Date.now()
    });

    // Étape 1 : chargement
    const loading = await ovl.sendMessage(
        ms_org,
        { text: "🌀 Chargement du menu..." },
        { quoted: ms }
    );

    // Attendre 20 secondes
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Étape 2 : menu prêt
    await ovl.sendMessage(ms_org, {
        text: "♨️ Menu Allstars🌀 prêt...",
        edit: loading.key
    });

    // Étape 3 : afficher le menu principal
    const caption = `. ◥◣              🌀JUMP™🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔
◥◣🌀 Bienvenue dans le JUMP, l'arène de combat multiverse ultime. Avec plus de 200 perso utilisables, créer ton équipe ALL STARS de rêve avec tes héros d'animes préférés puis domine la ligue PVP🏆 en affrontant les meilleurs joueurs du continent🌍: 

🔆1️⃣ *Règles de combat🎮*
🔆2️⃣ *Commandes/Actions♨️*
🔆3️⃣ *Événements📅*
🔆4️⃣ *Tournois / Saison🏆*
🔆5️⃣ *Boutique🛍️*
🔆6️⃣ *Classements / Rankings🎖️*
🔆7️⃣ *Records⚜️*

🀄Veuillez taper un numéro pour afficher le menu | JUMP🍃 

╰───────────────────
                        *R A Z O R X™⚡*`;

    await ovl.sendMessage(
        ms_org,
        {
            image: {
                url: "https://files.catbox.moe/0g8gpd.jpg"
            },
            caption
        },
        { quoted: ms }
    );
});


// ==========================================================
// 🔢 GESTION DES RÉPONSES 1 À 6
// ==========================================================

ovlcmd({
    nom_cmd: "allstarsMenuReponse",
    isfunc: true
}, async (ms_org, ovl, { ms }) => {

    if (!ms?.message || !ms?.key) return;

    const attente = allStarsMenuAttente.get(ms_org);
    if (!attente) return;

    // Expiration après 5 minutes sans réponse valide
    if (Date.now() - attente.date > 300000) {
        allStarsMenuAttente.delete(ms_org);
        return;
    }

    // Seul le joueur ayant ouvert le menu peut répondre
    const joueur = ms.key.participant || ms.key.remoteJid;
    if (joueur !== attente.joueur) return;

    const message = ms.message;

    const texte = (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        ""
    ).trim();

// ==========================================================
// 🏆 SOUS-MENU PANTHEONS : CLASSEMENTS DES TITRES
// ==========================================================

if (attente.etape === "pantheons") {

    // Accepte 1 à 5, avec ou sans tiret.
    const choixPantheon = texte.match(/^([1-5])-?$/);

    if (!choixPantheon) return;

    const numero = choixPantheon[1];

    const competitions = {
        "1": {
            nom: "CHAMPIONNATS MNVP🌟",
            champ: "championnats",
            emoji: "🌟"
        },
        "2": {
            nom: "NEO CUP🏆",
            champ: "neo_cup",
            emoji: "🏆"
        },
        "3": {
            nom: "EVO CUP💠",
            champ: "evo",
            emoji: "💠"
        },
        "4": {
            nom: "GRAND SLAM🏆",
            champ: "grandslam",
            emoji: "🏆"
        },
        "5": {
            nom: "WORLDS🌟🏆",
            champ: "worlds",
            emoji: "🌟"
        }
    };

    const competition = competitions[numero];

    // Images aléatoires pour les listes de palmarès.
    const imagesPalmares = [
        "https://files.catbox.moe/0g8gpd.jpg",
        "https://files.catbox.moe/uz7tyi.jpg",
        "https://files.catbox.moe/yhczn8.jpg",
        "https://files.catbox.moe/v6wvtz.jpg",
        "https://files.catbox.moe/j5e4vk.jpg"
    ];

    try {
        const fiches = await getAllFiches();

        const possesseurs = fiches
            .map((fiche) => {
                const data = typeof fiche?.get === "function"
                    ? fiche.get({ plain: true })
                    : fiche?.dataValues || fiche?.data || fiche;

                if (!data || !data.pseudo) return null;

                const titres = Number(data[competition.champ]) || 0;

                // Seuls les joueurs possédant au moins un titre apparaissent.
                if (titres <= 0) return null;

                return {
                    pseudo: String(data.pseudo).trim(),
                    titres
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.titres - a.titres);

        const lignes = possesseurs.length
            ? possesseurs.map((joueur, index) => {
                const position = index + 1;

                const medailles = {
                    1: "🥇",
                    2: "🥈",
                    3: "🥉"
                };

                const rang = medailles[position] || `${position}-`;

                return `${rang} *${joueur.pseudo}:* ${joueur.titres} titre(s) ${competition.emoji}`;
            })
            : ["⚠️ Aucun possesseur enregistré pour cette compétition."];

        const caption = `. ◥◣              🌀JUMP™${competition.nom}🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

🏆 *PALMARÈS DES JOUEURS ALL STARS*
🎙️ Classement par nombre de titres remportés

${lignes.join("\n")}

╰───────────────────
                                   *R A Z O R X™⚡*`;

        const imageAleatoire =
            imagesPalmares[
                Math.floor(Math.random() * imagesPalmares.length)
            ];

        // Rester dans le sous-menu Panthéons après chaque sélection.
attente.etape = "pantheons";
attente.date = Date.now();

        await ovl.sendMessage(
            ms_org,
            {
                image: { url: imageAleatoire },
                caption
            },
            { quoted: ms }
        );

    } catch (error) {
        console.error("❌ Erreur palmarès Pantheons :", error);

        await ovl.sendMessage(
            ms_org,
            {
                text: "❌ Impossible de récupérer le palmarès de cette compétition."
            },
            { quoted: ms }
        );
    }

    return;
}
    
    // Accepte uniquement un chiffre de 1 à 6
    if (!/^[1-7]$/.test(texte)) return;

    
const images = imagesRubriquesAllstars[texte] || [];

const noms = {
    "1": "Règles de combat🎮",
    "2": "Commandes/Actions♨️",
    "3": "Événements📅",
    "4": "Tournois / Saison🏆",
    "5": "Boutique🛍️",
    "6": "Classements / Rankings🎖️",
    "7": "Records⚜️"
};

// Prolonge l'attente après une sélection valide
attente.date = Date.now();

// Vérification réservée aux rubriques 1 à 5
if (["1", "2", "3", "4", "5"].includes(texte) && images.length === 0) {
    await ovl.sendMessage(
        ms_org,
        {
            text: `♨️ La rubrique *${noms[texte]}* ne contient aucune image configurée.`
        },
        { quoted: ms }
    );
    return;
}
    // Prolonge l'attente après une sélection valide
attente.date = Date.now();

// ==========================================================
// 🏆 RUBRIQUE 6 : CLASSEMENTS / RANKINGS
// ==========================================================

if (texte === "6") {

    const imagesClassement = [
        "https://files.catbox.moe/uemk6t.jpg",
        "https://files.catbox.moe/pe4p3q.jpg",
        "https://files.catbox.moe/bh146y.jpg",
        "https://files.catbox.moe/zyunx7.jpg",
        "https://files.catbox.moe/twr38p.jpg", 
        "https://files.catbox.moe/fpyi1p.jpg"
    ];

    // Choisir une image aléatoire.
    const imageAleatoire =
        imagesClassement[
            Math.floor(Math.random() * imagesClassement.length)
        ];

    // Générer le classement dynamique.
    const classement = await genererClassementAllStars();

    // Envoyer l'image avec le classement en légende.
    await ovl.sendMessage(
        ms_org,
        {
            image: { url: imageAleatoire },
            caption: classement
        },
        { quoted: ms }
    );

    return;
}

// ==========================================================
// ⚜️ RUBRIQUE 7 : MENU PANTHEONS
// ==========================================================

if (texte === "7") {

    const imagesPantheons = [
        "https://files.catbox.moe/xvsy2r.jpg"
    ];

    const imageAleatoire =
        imagesPantheons[
            Math.floor(Math.random() * imagesPantheons.length)
        ];

    const menuPantheons = `. ◥◣                       🌀JUMP™PANTHEONS🔆🍃
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

▪️1- *◥◣Championnats MNVP🌟*
▪️2- *◥◣NEO Cup🏆*
▪️3- *◥◣EVO Cup💠*
▪️4- *◥◣Grand Slam🏆*
▪️5- *◥◣WORLDS🌟🏆*

╰───────────────────
                                   *R A Z O R X™⚡*`;

    // Active le sous-menu pour le prochain message du joueur.
    attente.etape = "pantheons";
    attente.date = Date.now();

    await ovl.sendMessage(
        ms_org,
        {
            image: { url: imageAleatoire },
            caption: menuPantheons
        },
        { quoted: ms }
    );

    return;
}


    // ==========================================================
    // 🖼️ RUBRIQUES 1 À 5 : ENVOI DES IMAGES
    // ==========================================================

    for (const lien of images) {
        await ovl.sendMessage(
            ms_org,
            {
                image: { url: lien },
                caption: ""
            },
            { quoted: ms }
        );
    }
});
        

// commande pour envoyer le pave
ovlcmd(
  {
    nom_cmd: "pave",
    classe: "AllStars🌀",
    react: "🎮",
    desc: "Affiche le controller pave",
  },
  async (ms_org, ovl, { ms }) => {
    // Si tu veux envoyer un GIF d'intro, décommente les lignes ci-dessous :
    /*
    const gifIntro = "https://files.catbox.moe/yimc4o.mp4";
    await sock.sendMessage(
      ms_org,
      {
        video: { url: gifIntro },
        gifPlayback: true,
        caption: "",
      },
      { quoted: ms }
    );
    */

    const texte = `. ◥◣              🌀JUMP™🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔
💬: 

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🌀🎮:  

╰───────────────────
                        *R A Z O R X™⚡*`;

    await ovl.sendMessage(ms_org, { text: texte }, { quoted: ms });
  }
);

// commande nslpro
ovlcmd(
  {
    nom_cmd: "neoawards💫",
    classe: "Neoverse🔷",
    react: "💫",
    desc: "Affiche la présentation des NEO GAMING AWARDS ",
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      await ovl.sendMessage(
        ms_org,
        {
          video: { url: "https://files.catbox.moe/lc3hft.mp4" },
          gifPlayback: true,
          caption: "",
        },
        { quoted: ms }
      );

      const liens = [
        "https://files.catbox.moe/fgkjih.jpg",       
      ];

      const msg = "";
      for (const lien of liens) {
        await ovl.sendMessage(
          ms_org,
          { image: { url: lien }, caption: msg },
          { quoted: ms }
        );
      }
    }
  }
);
