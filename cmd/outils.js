const { exec } = require("child_process");
const { ovlcmd, cmd } = require("../lib/ovlcmd");
const config = require("../set");
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { Bans } = require('../DataBase/ban');
const { Sudo } = require('../DataBase/sudo');

function stylize(text) {
    const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const small =  'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' +
                   'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' +
                   '0123456789';
    return text.split('').map(c => {
        const i = normal.indexOf(c);
        return i !== -1 ? small[i] : c;
    }).join('');
}

const ms_badge = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: '0@s.whatsapp.net',
  },
  message: {
    extendedTextMessage: {
      text: 'ɴᴇᴏ-ʙᴏᴛ-ᴍᴅ ʙʏ ᴀɪɴᴢ',
      contextInfo: {
        mentionedJid: [],
      },
    },
  }
};

ovlcmd(
  {
    nom_cmd: "ban",
    classe: "Outils",
    react: "🚫",
    desc: "Bannir un utilisateur des commandes du bot",
  },
  async (jid, ovl, cmd_options) => {
    const { repondre, ms, arg, auteur_Msg_Repondu, prenium_id, dev_num } = cmd_options;

    try {
      if (!prenium_id) {
        return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
      }
      const cible =
        auteur_Msg_Repondu || arg[0]
 
      if (!cible) return repondre("Mentionnez un utilisateur valide à bannir.");

      if (dev_num.includes(cible)) {
      return ovl.sendMessage(jid, { text: "Vous ne pouvez pas bannir un développeur." }, { quoted: ms });
      }
      const [ban] = await Bans.findOrCreate({
        where: { id: cible },
        defaults: { id: cible, type: "user" },
      });

      if (!ban._options.isNewRecord) return repondre("Cet utilisateur est déjà banni !");
      return ovl.sendMessage(jid, { 
        text: `Utilisateur @${cible.split('@')[0]} banni avec succès.`, 
        mentions: [cible]
      }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande ban :", error);
      return repondre("Une erreur s'est produite.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "deban",
    classe: "Outils",
    react: "🚫",
    desc: "Débannir un utilisateur des commandes du bot",
  },
  async (jid, ovl, cmd_options) => {
    const { repondre, arg, auteur_Msg_Repondu, prenium_id, ms } = cmd_options;

    try {
      if (!prenium_id) {
        return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
      }
      const cible =
        auteur_Msg_Repondu || arg[0]
 
      if (!cible) return repondre("Mentionnez un utilisateur valide à débannir.");

      const suppression = await Bans.destroy({ where: { id: cible, type: "user" } });
      if (suppression === 0) return repondre("Cet utilisateur n'est pas banni.");
      return ovl.sendMessage(jid, { 
        text: `Utilisateur @${cible.split('@')[0]} débanni avec succès.`, 
        mentions: [cible]
      }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande debannir :", error);
      return repondre("Une erreur s'est produite.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "bangroup",
    classe: "Outils",
    react: "🚫",
    desc: "Bannir un groupe des commandes du bot",
  },
  async (jid, ovl, cmd_options) => {
    const { repondre, arg, verif_Groupe, prenium_id, ms } = cmd_options;

    try {
      if (!prenium_id) {
        return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
      }
      if (!verif_Groupe) return repondre("Cette commande fonctionne uniquement dans les groupes.");

      const cible = jid;

      if (!cible) return repondre("Impossible de récupérer l'identifiant du groupe.");

      const [ban] = await Bans.findOrCreate({
        where: { id: cible },
        defaults: { id: cible, type: "group" },
      });

      if (!ban._options.isNewRecord) return repondre("Ce groupe est déjà banni !");
      return repondre(`Groupe banni avec succès.`);
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande bangroup :", error);
      return repondre("Une erreur s'est produite.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "debangroup",
    classe: "Outils",
    react: "🚫",
    desc: "Débannir un groupe des commandes du bot",
  },
  async (jid, ovl, cmd_options) => {
    const { repondre, arg, verif_Groupe, prenium_id, ms } = cmd_options;

    try {
      if (!prenium_id) {
        return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
      }
      if (!verif_Groupe) return repondre("Cette commande fonctionne uniquement dans les groupes.");

      const cible = jid;

      if (!cible) return repondre("Impossible de récupérer l'identifiant du groupe.");

      const suppression = await Bans.destroy({ where: { id: cible, type: "group" } });
      if (suppression === 0) return repondre("Ce groupe n'est pas banni.");
      return repondre(`Groupe débanni avec succès.`);
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande debangroup :", error);
      return repondre("Une erreur s'est produite.");
    }
  }
);


 ovlcmd(
  {
    nom_cmd: "setsudo",
    classe: "Outils",
    react: "🔒",
    desc: "Ajoute un utilisateur dans la liste des utilisateurs premium.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { repondre, arg, auteur_Msg_Repondu, prenium_id, ms } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
    }
    const cible =
      auteur_Msg_Repondu || arg[0]
 
    if (!cible) {
      return repondre("Veuillez mentionner un utilisateur valide pour l'ajouter en premium.");
    }

    try {
      const [user] = await Sudo.findOrCreate({
        where: { id: cible },
        defaults: { id: cible },
      });

      if (!user._options.isNewRecord) {
        return ovl.sendMessage(ms_org, { 
        text: `L'utilisateur @${cible.split('@')[0]} est déjà un utilisateur premium.`, 
        mentions: [cible]
      }, { quoted: ms });
      }

      return ovl.sendMessage(ms_org, { 
        text: `Utilisateur @${cible.split('@')[0]} ajouté avec succès en tant qu'utilisateur premium.`, 
        mentions: [cible]
      }, { quoted: ms });
      } catch (error) {
      console.error("Erreur lors de l'exécution de la commande setsudo :", error);
      return repondre("Une erreur est survenue lors de l'ajout de l'utilisateur en premium.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "sudolist",
    classe: "Outils",
    react: "📋",
    desc: "Affiche la liste des utilisateurs premium.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { repondre, prenium_id, ms } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'exécuter cette commande." }, { quoted: ms });
    }

    try {
      const sudoUsers = await Sudo.findAll();

      if (!sudoUsers.length) {
        return repondre("Aucun utilisateur premium n'est actuellement enregistré.");
      }

      const userList = sudoUsers
        .map((user, index) => `🔹 *${index + 1}.* @${user.id.split('@')[0]}`)
        .join("\n");

      const message = `✨ *Liste des utilisateurs Premium* ✨\n\n*Total*: ${sudoUsers.length}\n\n${userList}`;

      return ovl.sendMessage(ms_org, { text: message, mentions: sudoUsers.map(user => user.id) }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande sudolist :", error);
      return repondre("Une erreur est survenue lors de l'affichage de la liste des utilisateurs premium.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "delsudo",
    classe: "Outils",
    react: "❌",
    desc: "Supprime un utilisateur de la liste des utilisateurs premium.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { repondre, arg, auteur_Msg_Repondu, prenium_id, ms } = cmd_options;
    
    if (!prenium_id) {
      return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
    }
    const cible =
      auteur_Msg_Repondu || arg[0]
     
    if (!cible) {
      return repondre("Veuillez mentionner un utilisateur");
    }

    try {
      const deletion = await Sudo.destroy({ where: { id: cible } });

      if (deletion === 0) {
        return ovl.sendMessage(ms_org, { 
        text: `L'utilisateur @${cible.split('@')[0]} n'est pas un utilisateur premium.`, 
        mentions: [cible]
      }, { quoted: ms });
      }

        return ovl.sendMessage(ms_org, { 
        text: `Utilisateur @${cible.split('@')[0]} supprimé avec succès de la liste premium.`, 
        mentions: [cible]
      }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande delsudo :", error);
      return repondre("Une erreur est survenue lors de la suppression de l'utilisateur de la liste premium.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "jid",
    classe: "Owner",
    react: "🆔",
    desc: "Fournit le JID d'une personne ou d'un groupe",
  },
  async (ms_org, ovl, cmd_options) => {
    const { repondre, auteur_Msg_Repondu, prenium_id, msg_Repondu, arg } = cmd_options;

    if (!prenium_id) {
      return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
    }

    let cbl =
      auteur_Msg_Repondu || arg[0];

    let jid;
    if (cbl) {
      jid = cbl;
    } else {
      jid = ms_org;
    }

    repondre(jid);
  }
);

ovlcmd(
    {
        nom_cmd: "restart",
        classe: "Outils",
        desc: "Redémarre le bot via PM2"
    },
    async (ms_org, ovl, opt) => {
        const { ms, prenium_id } = opt;

        if (!prenium_id) {
            return ovl.sendMessage(ms_org, { text: "Vous n'avez pas la permission d'utiliser cette commande." }, { quoted: ms });
        }

        await ovl.sendMessage(ms_org, { text: "♻️ Redémarrage du bot en cours..." }, { quoted: ms });

        exec('pm2 restart all', (err, stdout, stderr) => {
            if (err) {
                return ovl.sendMessage(ms_org, { text: `Erreur lors du redémarrage :\n${err.message}` }, { quoted: ms });
            }
        });
    }
);


ovlcmd(
    {
        nom_cmd: "menu",
        classe: "Outils",
        react: "📜",
        desc: "Affiche toutes les commandes du bot",
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const seconds = process.uptime();
            const j = Math.floor(seconds / 86400);
            const h = Math.floor((seconds / 3600) % 24);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            let uptime = "";
            if (j > 0) uptime += `${j}J `;
            if (h > 0) uptime += `${h}H `;
            if (m > 0) uptime += `${m}M `;
            if (s > 0) uptime += `${s}S`;

            const dateObj = new Date();
            const dateStr = dateObj.toLocaleDateString("fr-FR");
            const heureStr = dateObj.toLocaleTimeString("fr-FR");
            const platform = process.platform;

            const commandes = cmd;
            const cmd_classe = {};
            commandes.forEach((cmd) => {
                if (!cmd_classe[cmd.classe]) cmd_classe[cmd.classe] = [];
                cmd_classe[cmd.classe].push(cmd);
            });

            const classesSorted = Object.keys(cmd_classe).sort((a, b) => a.localeCompare(b));
            for (const classe of classesSorted) {
                cmd_classe[classe].sort((a, b) =>
                    a.nom_cmd.localeCompare(b.nom_cmd, undefined, { numeric: true })
                );
            }

            let menu = `╭──⟪ 🤖 NEO-BOT -OVL ⟫──╮
├ ߷ Préfixe       : ${config.PREFIXE}
├ ߷ Owner         : AINZ-K⚜️
├ ߷ Commandes  : ${commandes.length}
├ ߷ Uptime        : ${uptime.trim()}
├ ߷ Date          : ${dateStr}
├ ߷ Heure         : ${heureStr}
├ ߷ Plateforme  : ${platform}
├ ߷ Développeur : AINZ-K⚜️
╰──────────────────╯\n\n`;

            for (const classe of classesSorted) {
                if (classe === "Outils") continue;
                menu += `╭──⟪ ${classe.toUpperCase()} ⟫──╮\n`;
                cmd_classe[classe].forEach((cmd) => {
                    menu += `├ ߷ ${cmd.nom_cmd}\n`;
                });
                menu += `╰──────────────────╯\n\n`;
            }

            menu += `> ©2025 NEO-BOT -OVL By *AINZ*`;

                await ovl.sendMessage(ms_org, {
                    image: { url: "https://files.catbox.moe/zxbny1.jpg" },
                    caption: stylize(menu)
                }, { quoted: cmd_options.ms });
          } catch (error) {
            console.error("Erreur lors de la génération de allmenu :", error.message || error);
            await ovl.sendMessage(ms_org, {
                text: "Une erreur est survenue lors de l'affichage du menu complet."
            }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "ping",
    classe: "Outils",
    react: "🏓",
    desc: "Mesure la latence du bot.",
  },
  async (ms_org, ovl, cmd_options) => {
    const start = Date.now();

    const msg_envoye = await ovl.sendMessage(ms_org, {
      text: "*NEO-BOT -OVL Ping...*"
    }, { quoted: cmd_options.ms });

    const end = Date.now();
    const latency = end - start;

    await ovl.sendMessage(ms_org, {
      edit: msg_envoye.key,
      text: `*🏓 Pong ! Latence : ${latency}ms*`
    });
  }
);

ovlcmd(
    {
        nom_cmd: "uptime",
        classe: "Outils",
        react: "⏱️",
        desc: "Affiche le temps de fonctionnement du bot.",
        alias: ["upt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const seconds = process.uptime();
        const j = Math.floor(seconds / 86400);
        const h = Math.floor((seconds / 3600) % 24);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        let uptime = '';
        if (j > 0) uptime += `${j}J `;
        if (h > 0) uptime += `${h}H `;
        if (m > 0) uptime += `${m}M `;
        if (s > 0) uptime += `${s}S`;
        await ovl.sendMessage(ms_org, { text: `⏳ Temps de fonctionnement : ${uptime}` }, { quoted: cmd_options.ms });
    }
);

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    return res.data;
  } catch (error) {
    console.error("Erreur lors de l'upload sur Catbox:", error);
    throw new Error("Une erreur est survenue lors de l'upload du fichier.");
  }
}

ovlcmd(
  {
    nom_cmd: "url",
    classe: "Conversion",
    react: "📤",
    desc: "Upload un fichier (image, vidéo, audio) sur Catbox et renvoie le lien"
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, { text: "Veuillez mentionner un fichier (image, vidéo, audio ou document)." }, { quoted: ms });
    }

    const mediaMessage = msg_Repondu.imageMessage || msg_Repondu.videoMessage || msg_Repondu.audioMessage;
    if (!mediaMessage) {
      return ovl.sendMessage(ms_org, { text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou audio." }, { quoted: ms });
    }

    try {
      const media = await ovl.dl_save_media_ms(mediaMessage);
      const link = await uploadToCatbox(media);
      await ovl.sendMessage(ms_org, { text: link }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'upload sur Catbox:", error);
      await ovl.sendMessage(ms_org, { text: "Erreur lors de la création du lien Catbox." }, { quoted: ms });
    }
  }
);

//==============================================================
// 🌀🧠 NEOAI - BUILD
//==============================================================
ovlcmd(
  {
    nom_cmd: "neo",
    classe: "Outils",
    react: "🧠",
    alias: ["neo🌀"],
    desc: "Lance une session de test NeoAI",
  },

  async (ms_org, ovl, cmd_options) => {

    console.log("🧠 [NeoAI] COMMANDE DÉTECTÉE !");

    const { ms } = cmd_options;

    try {

      //==========================================================
      // 👤 RÉCUPÉRATION DU JID
      //==========================================================

      const userJid =
        ms?.key?.participant ||
        ms?.participant ||
        ms?.key?.remoteJid ||
        ms_org;

      console.log("🧠 [NeoAI] JID :", userJid);
      console.log("🧠 [NeoAI] Lancement de la session...");

      const pseudo = userJid.split("@")[0];

      //==========================================================
      // 🌀 ÉTAPE 1 — CHARGEMENT
      //==========================================================

      const loadingMsg = await ovl.sendMessage(
        ms_org,
        {
          text: "🌀 Chargement de NeoAI."
        },
        {
          quoted: ms
        }
      );

      //==========================================================
      // 🌀 ÉTAPE 2
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 10000));

      await ovl.sendMessage(
        ms_org,
        {
          text: "🌀 Chargement de NeoAI..",
          edit: loadingMsg.key
        }
      );

      //==========================================================
      // 🌀 ÉTAPE 3
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 10000));

      await ovl.sendMessage(
        ms_org,
        {
          text: "🌀 Chargement de NeoAI...",
          edit: loadingMsg.key
        }
      );

      //==========================================================
      // 🧠 ÉTAPE 4 — NEOAI PRÊT
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 3000));

      await ovl.sendMessage(
        ms_org,
        {
          text: "🌀🧠 NeoAi est prêt.",
          edit: loadingMsg.key
        }
      );

      //==========================================================
      // 🧠 ÉTAPE 5
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 3000));

      await ovl.sendMessage(
        ms_org,
        {
          text: "🌀🧠 NeoAi est prêt..",
          edit: loadingMsg.key
        }
      );

      //==========================================================
      // 🧠 ÉTAPE 6
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 3000));

      await ovl.sendMessage(
        ms_org,
        {
          text: "🌀🧠 NeoAI est prêt...",
          edit: loadingMsg.key
        }
      );

      //==========================================================
      // 👋 ÉTAPE FINALE — MESSAGE D'ACCUEIL
      //==========================================================

      await new Promise(resolve => setTimeout(resolve, 1000));

      const caption =
        `🌀 Salut @${pseudo}, je suis NeoAI 🧠👋🏻, ` +
        `tu peux envoyer le texte à analyser....`;

      await ovl.sendMessage(
        ms_org,
        {
          image: {
            url: "https://files.catbox.moe/6s72pg.jpg"
          },
          caption: caption,
          mentions: [userJid]
        },
        {
          quoted: ms
        }
      );

      console.log("✅ [NeoAI] Session lancée avec succès.");

    } catch (error) {

      console.error(
        "❌ [NeoAI] Erreur lors de l'exécution :",
        error
      );

      await ovl.sendMessage(
        ms_org,
        {
          text: "❌ Une erreur est survenue lors du lancement de NeoAI."
        },
        {
          quoted: ms
        }
      );
    }
  }
);


//==============================================================
// 🌀🧠 NEOAI — GESTION DES SESSIONS
//==============================================================

// Sessions NeoAI actuellement actives
//
// clé : JID de l'utilisateur
// valeur : informations de sa session
//
const neoAISessions = new Map();


//==============================================================
// 🧠 DÉMARRER UNE SESSION NEOAI
//==============================================================

function demarrerSessionNeoAI(userJid, chatJid) {

  if (!userJid) {
    console.error("❌ [NeoAI] Impossible de démarrer la session : JID absent.");
    return false;
  }

  neoAISessions.set(userJid, {
    userJid: userJid,
    chatJid: chatJid,
    active: true,
    startedAt: Date.now(),
    messagesAnalyses: 0
  });

  console.log(
    "🧠 [NeoAI] Session démarrée pour :",
    userJid
  );

  return true;
}


//==============================================================
// 🧠 RÉCUPÉRER UNE SESSION NEOAI
//==============================================================

function getSessionNeoAI(userJid) {

  if (!userJid) return null;

  const session = neoAISessions.get(userJid);

  if (!session) {
    return null;
  }

  if (!session.active) {
    return null;
  }

  return session;
}


//==============================================================
// 🧠 VÉRIFIER SI UNE SESSION EST ACTIVE
//==============================================================

function sessionNeoAIActive(userJid) {

  const session = getSessionNeoAI(userJid);

  return !!session;
}


//==============================================================
// 🧠 FERMER UNE SESSION NEOAI
//==============================================================

function fermerSessionNeoAI(userJid) {

  if (!userJid) return false;

  const session = neoAISessions.get(userJid);

  if (!session) {
    return false;
  }

  session.active = false;

  neoAISessions.delete(userJid);

  console.log(
    "🧠 [NeoAI] Session fermée pour :",
    userJid
  );

  return true;
}


//==============================================================
// 🧠 EXTRAIRE LE JID DE L'UTILISATEUR
//==============================================================

function getNeoAIUserJid(ms, ms_org) {

  return (
    ms?.key?.participant ||
    ms?.participant ||
    ms?.key?.remoteJid ||
    ms_org
  );

}


//==============================================================
// 🧠 EXTRAIRE LE TEXTE D'UN MESSAGE
//==============================================================

function extraireTexteNeoAI(ms) {

  if (!ms) return "";

  const message = ms.message || ms;

  if (message.conversation) {
    return message.conversation;
  }

  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text;
  }

  if (message.imageMessage?.caption) {
    return message.imageMessage.caption;
  }

  if (message.videoMessage?.caption) {
    return message.videoMessage.caption;
  }

  return "";
}


//==============================================================
// 🌀 ANALYSE DU TEXTE NEOAI
//==============================================================

async function analyserNeoAI(text) {

  console.log("🧠 [NeoAI] Début de l'analyse.");

  const texteOriginal = String(text || "").trim();

  if (!texteOriginal) {

    return {
      success: false,
      texte: "",
      message: "❌ Aucun texte à analyser."
    };

  }


  //============================================================
  // 🌀 DÉTECTION DU PRÉFIXE NEOAI
  //============================================================

  let texte = texteOriginal;

  if (texte.startsWith("🌀:")) {

    texte = texte
      .slice(3)
      .trim();

  }


  //============================================================
  // ❌ TEXTE VIDE
  //============================================================

  if (!texte) {

    return {
      success: false,
      texte: "",
      message: "❌ Le texte NeoAI est vide."
    };

  }


  //============================================================
  // 🧠 DÉCOUPAGE DES MOTS
  //============================================================

  const mots = texte
    .split(/\s+/)
    .map(mot => mot.trim())
    .filter(Boolean);


  //============================================================
  // 🧠 RÉSULTAT
  //============================================================

  const resultat = {

    success: true,

    texteOriginal: texteOriginal,

    texte: texte,

    nombreMots: mots.length,

    mots: mots,

    dateAnalyse: Date.now()

  };


  console.log(
    "🧠 [NeoAI] Texte analysé :",
    texte
  );

  console.log(
    "🧠 [NeoAI] Nombre de mots :",
    mots.length
  );


  return resultat;
}


//==============================================================
// 🧠 TRAITER UN MESSAGE POUR UNE SESSION NEOAI
//==============================================================
//
// Cette fonction sera appelée par le système qui reçoit les
// messages WhatsApp.
//
// Elle ne traite QUE les utilisateurs ayant une session active.
//
//==============================================================

async function traiterMessageNeoAI(ms, ms_org, ovl) {

  try {

    const userJid = getNeoAIUserJid(ms, ms_org);

    if (!userJid) {
      return null;
    }


    //============================================================
    // 🔎 VÉRIFICATION DE LA SESSION
    //============================================================

    const session = getSessionNeoAI(userJid);

    if (!session) {
      return null;
    }


    //============================================================
    // 📝 RÉCUPÉRATION DU TEXTE
    //============================================================

    const texte = extraireTexteNeoAI(ms);

    if (!texte) {
      return null;
    }


    //============================================================
    // 🌀 LE MESSAGE DOIT COMMENCER PAR 🌀:
    //============================================================

    if (!texte.trim().startsWith("🌀:")) {

      return null;

    }


    console.log(
      "🧠 [NeoAI] Message détecté pour :",
      userJid
    );

    console.log(
      "🌀 [NeoAI] Texte :",
      texte
    );


    //============================================================
    // 🧠 ANALYSE
    //============================================================

    const resultat = await analyserNeoAI(texte);


    //============================================================
    // 📊 COMPTEUR
    //============================================================

    session.messagesAnalyses++;


    //============================================================
    // ❌ ERREUR
    //============================================================

    if (!resultat.success) {

      await ovl.sendMessage(
        ms_org,
        {
          text: resultat.message
        },
        {
          quoted: ms
        }
      );

      return resultat;
    }


    //============================================================
    // 📤 RÉSULTAT TEMPORAIRE
    //============================================================

    let reponse =
      `🌀🧠 *NeoAI — Analyse*\n\n` +
      `📝 Texte : ${resultat.texte}\n\n` +
      `🔢 Nombre de mots : ${resultat.nombreMots}\n\n` +
      `📚 Mots détectés :\n` +
      resultat.mots
        .map((mot, index) => `${index + 1}. ${mot}`)
        .join("\n");


    await ovl.sendMessage(
      ms_org,
      {
        text: reponse
      },
      {
        quoted: ms
      }
    );


    console.log(
      "✅ [NeoAI] Analyse envoyée."
    );


    return resultat;

  } catch (error) {

    console.error(
      "❌ [NeoAI] Erreur traitement message :",
      error
    );

    return null;
  }

}
        
