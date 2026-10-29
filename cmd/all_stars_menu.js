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

        // Construire le classement des 10 premiers.
        const lignes = [];

        for (let i = 0; i < 10; i++) {
            const joueur = joueurs[i];

            if (!joueur) {
                lignes.push(`${i + 1}-`);
                continue;
            }

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

            const prefixe = medailles[position] || `${position}-`;

            lignes.push(
                `${prefixe} ${position <= 3 ? "- " : ""}*${joueur.pseudo}:* ${joueur.points} pts🏆${mouvement}`
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

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
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

    if (images.length === 0) {
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
        "https://files.catbox.moe/0g8gpd.jpg",
        "https://files.catbox.moe/uz7tyi.jpg",
        "https://files.catbox.moe/yhczn8.jpg",
        "https://files.catbox.moe/v6wvtz.jpg",
        "https://files.catbox.moe/j5e4vk.jpg"
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
// ⚜️ RUBRIQUE 7 : RECORDS
// ==========================================================

// Le contenu des records pourra être ajouté ultérieurement.
if (texte === "7") {
    await ovl.sendMessage(
        ms_org,
        {
            text: `. ◥◣              🌀JUMP™RECORDS⚜️🔆
▔▔▔▔▔▔▔▔▔▔▔◥▔▔▔▔▔▔▔

⚜️ Bienvenue dans les RECORDS ALL STARS !

🏆 Cette rubrique sera consacrée aux records des joueurs du JUMP.

╰───────────────────
                                   *R A Z O R X™⚡*`
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
