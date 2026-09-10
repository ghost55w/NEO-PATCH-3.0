const { exec } = require("child_process");
const { ovlcmd, cmd } = require("../lib/ovlcmd");
const config = require("../set");
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { Bans } = require('../DataBase/ban');
const { Sudo } = require('../DataBase/sudo');
const NeoAI = require("../DataBase/NeoAI");

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

    const {
      ms,
      auteur_Message
    } = cmd_options;

    try {

      //==========================================================
      // 👤 JID CANONIQUE
      //==========================================================

      const userJid =
        auteur_Message ||
        ms?.key?.participant ||
        ms?.participant ||
        (
          ms?.key?.remoteJid &&
          !ms.key.remoteJid.endsWith("@g.us")
            ? ms.key.remoteJid
            : null
        ) ||
        ms_org;

      if (!userJid) {
        console.error("❌ [NeoAI] JID utilisateur introuvable.");
        return;
      }

      console.log("🧠 [NeoAI] JID :", userJid);
      console.log("🧠 [NeoAI] Lancement de la session...");

      //==========================================================
      // 🧠 CRÉATION DE LA SESSION NEOAI
      //==========================================================

      demarrerSessionNeoAI(
        userJid,
        ms_org
      );

      const pseudo =
        String(userJid)
          .split("@")[0];

      //==========================================================
      // 🌀 ÉTAPE 1 — CHARGEMENT
      //==========================================================

      const loadingMsg =
        await ovl.sendMessage(
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

      await new Promise(
        resolve => setTimeout(resolve, 10000)
      );

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

      await new Promise(
        resolve => setTimeout(resolve, 10000)
      );

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

      await new Promise(
        resolve => setTimeout(resolve, 3000)
      );

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

      await new Promise(
        resolve => setTimeout(resolve, 3000)
      );

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

      await new Promise(
        resolve => setTimeout(resolve, 3000)
      );

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

      await new Promise(
        resolve => setTimeout(resolve, 1000)
      );

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

      console.log(
        "✅ [NeoAI] Session lancée avec succès pour :",
        userJid
      );

    } catch (error) {

      console.error(
        "❌ [NeoAI] Erreur lors de l'exécution :",
        error
      );

      await ovl.sendMessage(
        ms_org,
        {
          text:
            "❌ Une erreur est survenue lors du lancement de NeoAI."
        },
        {
          quoted: ms
        }
      );
    }
  }
);




//==============================================================
// 🧠 EXTRAIRE LE TEXTE D'UN MESSAGE
//==============================================================

function extraireTexteNeoAI(
  ms
) {

  if (!ms) {
    return "";
  }

  const message =
    ms.message ||
    ms;

  if (typeof message === "string") {
    return message;
  }

  if (message.conversation) {
    return message.conversation;
  }

  if (
    message.extendedTextMessage?.text
  ) {
    return message.extendedTextMessage.text;
  }

  if (
    message.imageMessage?.caption
  ) {
    return message.imageMessage.caption;
  }

  if (
    message.videoMessage?.caption
  ) {
    return message.videoMessage.caption;
  }

  if (
    message.documentMessage?.caption
  ) {
    return message.documentMessage.caption;
  }

  if (
    message.buttonsResponseMessage?.selectedButtonId
  ) {
    return message.buttonsResponseMessage.selectedButtonId;
  }

  if (
    message.listResponseMessage
      ?.singleSelectReply
      ?.selectedRowId
  ) {
    return message.listResponseMessage
      .singleSelectReply
      .selectedRowId;
  }

  return "";
}

//==============================================================
// 🌀🧠 NEOAI — SESSION + NOUVEAU MOTEUR LINGUISTIQUE
//==============================================================

const neoAISessions = new Map();


//==============================================================
// 👤 NORMALISATION JID
//==============================================================

function normaliserJidNeoAI(jid) {

  if (!jid) return null;

  return String(jid)
    .trim()
    .replace(/^whatsapp:/i, "");

}


//==============================================================
// 👤 RÉCUPÉRER LE JID UTILISATEUR
//==============================================================

function getNeoAIUserJid(ms_org, ms, cmd_options = {}) {

  const {
    auteur_Message,
    auteur_Msg_Repondu
  } = cmd_options || {};

  return normaliserJidNeoAI(
    auteur_Message ||
    auteur_Msg_Repondu ||
    ms?.key?.participant ||
    ms?.participant ||
    (
      ms?.key?.remoteJid &&
      !ms.key.remoteJid.endsWith("@g.us")
        ? ms.key.remoteJid
        : null
    ) ||
    ms_org
  );

}


//==============================================================
// 🧠 DÉMARRER SESSION
//==============================================================

function demarrerSessionNeoAI(userJid, chatJid) {

  userJid = normaliserJidNeoAI(userJid);

  if (!userJid) {
    return null;
  }

  const session = {
    userJid,
    chatJid,

    active: true,

    createdAt: Date.now(),
    lastActivity: Date.now(),

    messagesAnalyses: 0,

    historique: [],

    contexte: {
      dernierActeur: null,
      derniereCible: null,
      derniereAction: null
    }
  };

  neoAISessions.set(userJid, session);

  console.log(
    "🧠 [NeoAI] Session créée :",
    userJid
  );

  return session;
}


//==============================================================
// 🔎 RÉCUPÉRER SESSION
//==============================================================

function getSessionNeoAI(userJid) {

  userJid = normaliserJidNeoAI(userJid);

  if (!userJid) {
    return null;
  }

  const session = neoAISessions.get(userJid);

  if (!session) {
    return null;
  }

  session.lastActivity = Date.now();

  return session;
}


//==============================================================
// ✅ SESSION ACTIVE
//==============================================================

function sessionNeoAIActive(userJid) {

  const session =
    getSessionNeoAI(userJid);

  return !!(
    session &&
    session.active
  );
}


//==============================================================
// ❌ FERMER SESSION
//==============================================================

function fermerSessionNeoAI(userJid) {

  userJid = normaliserJidNeoAI(userJid);

  if (!userJid) {
    return false;
  }

  const session =
    neoAISessions.get(userJid);

  if (!session) {
    return false;
  }

  session.active = false;

  neoAISessions.delete(userJid);

  console.log(
    "🛑 [NeoAI] Session fermée :",
    userJid
  );

  return true;
}


//==============================================================
// 🛑 COMMANDES D'ARRÊT
//==============================================================

function estCommandeArretNeoAI(texte) {

  const t =
    String(texte || "")
      .trim()
      .toLowerCase();

  return [
    "stop",
    "neo stop",
    "neoai stop",
    "🛑",
    "arrête",
    "arrete",
    "arrêter",
    "arreter",
    "fermer neo",
    "quitter neo"
  ].includes(t);

}


//==============================================================
// 🧹 NORMALISATION LINGUISTIQUE
//==============================================================

function neoNormaliserTexteLocal(texte) {

  return String(texte || "")
    .replace(/🌀/gu, "")
    .replace(/\s+/gu, " ")
    .trim();

}


function neoNormaliserMotLocal(mot) {

  return String(mot || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}'-]/gu, "")
    .trim();

}


//==============================================================
// 📝 EXTRACTION DES MOTS
//==============================================================

function neoExtraireMots(texte) {

  return neoNormaliserTexteLocal(texte)
    .split(/\s+/u)
    .map(m => m.trim())
    .filter(Boolean);

}


//==============================================================
// 📚 RÉCUPÉRATION DE LA BASE NEOAI
//==============================================================

function neoGetCollections() {

  const collections = {};

  if (!NeoAI || typeof NeoAI !== "object") {
    return collections;
  }

  for (const [cle, valeur] of Object.entries(NeoAI)) {

    if (
      Array.isArray(valeur) ||
      (
        valeur &&
        typeof valeur === "object"
      )
    ) {
      collections[cle] = valeur;
    }

  }

  return collections;

}


//==============================================================
// 🔍 CHERCHER DANS UNE COLLECTION
//==============================================================

function neoChercherDansCollection(
  mot,
  collection
) {

  const cible =
    neoNormaliserMotLocal(mot);

  if (!collection) {
    return false;
  }

  if (Array.isArray(collection)) {

    for (const element of collection) {

      if (typeof element === "string") {

        if (
          neoNormaliserMotLocal(element) === cible
        ) {
          return true;
        }

      }

      if (
        element &&
        typeof element === "object"
      ) {

        const valeurs = [
          element.mot,
          element.nom,
          element.terme,
          element.texte,
          element.value,
          element.verbe,
          element.action
        ];

        if (
          valeurs.some(v =>
            v &&
            neoNormaliserMotLocal(v) === cible
          )
        ) {
          return true;
        }

        if (
          Array.isArray(element.synonymes) &&
          element.synonymes.some(v =>
            neoNormaliserMotLocal(v) === cible
          )
        ) {
          return true;
        }

        if (
          Array.isArray(element.aliases) &&
          element.aliases.some(v =>
            neoNormaliserMotLocal(v) === cible
          )
        ) {
          return true;
        }

      }
    }

    return false;
  }

  if (
    typeof collection === "object"
  ) {

    for (const [cle, valeur] of Object.entries(collection)) {

      if (
        neoNormaliserMotLocal(cle) === cible
      ) {
        return true;
      }

      if (
        typeof valeur === "string" &&
        neoNormaliserMotLocal(valeur) === cible
      ) {
        return true;
      }

      if (
        Array.isArray(valeur) &&
        valeur.some(v =>
          typeof v === "string" &&
          neoNormaliserMotLocal(v) === cible
        )
      ) {
        return true;
      }

    }
  }

  return false;
}


//==============================================================
// 📚 MOT CONNU
//==============================================================

function neoMotConnu(mot) {

  const collections =
    neoGetCollections();

  for (const collection of Object.values(collections)) {

    if (
      neoChercherDansCollection(
        mot,
        collection
      )
    ) {
      return true;
    }

  }

  return false;
}


//==============================================================
// 🧠 TROUVER UNE COLLECTION PAR MOT-CLÉ
//==============================================================

function neoTrouverCollection(
  motsCles = []
) {

  const collections =
    neoGetCollections();

  const cles =
    Object.keys(collections);

  for (const cle of cles) {

    const n =
      neoNormaliserMotLocal(cle);

    if (
      motsCles.some(m =>
        n.includes(
          neoNormaliserMotLocal(m)
        )
      )
    ) {
      return collections[cle];
    }

  }

  return null;
}


//==============================================================
// 📐 DISTANCE
//==============================================================

function neoDetecterDistance(texte) {

  const match =
    String(texte || "").match(
      /(\d+(?:[.,]\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu
    );

  if (!match) {
    return {
      valeur: null,
      unite: null
    };
  }

  const valeur =
    Number(
      match[1]
        .replace(",", ".")
    );

  let unite =
    match[2].toLowerCase();

  if (
    unite.startsWith("cm") ||
    unite.startsWith("cent")
  ) {
    unite = "cm";
  } else {
    unite = "m";
  }

  return {
    valeur,
    unite
  };

}


//==============================================================
// 📏 HAUTEUR
//==============================================================

function neoDetecterHauteur(texte) {

  const t =
    String(texte || "");

  const regex =
    /(?:hauteur|haut(?:eur)?|monte(?:r)?|montant|saut(?:e|ant)?|en\s+l['’]air)\D{0,20}(\d+(?:[.,]\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu;

  const match =
    t.match(regex);

  if (!match) {
    return {
      valeur: null,
      unite: null
    };
  }

  return {
    valeur: Number(
      match[1]
        .replace(",", ".")
    ),
    unite:
      /cm|centim/i.test(match[2])
        ? "cm"
        : "m"
  };

}


//==============================================================
// ⚡ VITESSE
//==============================================================

function neoDetecterVitesse(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  const valeurs = [
    "vmax",
    "v max",
    "vitesse maximale",
    "pleine vitesse",
    "à pleine vitesse",
    "a pleine vitesse",
    "très vite",
    "tres vite",
    "rapidement",
    "lentement"
  ];

  for (const valeur of valeurs) {

    if (
      t.includes(valeur)
    ) {

      return {
        valeur:
          valeur.includes("vmax") ||
          valeur.includes("v max") ||
          valeur.includes("maximale")
            ? "maximale"
            : valeur
      };

    }

  }

  return {
    valeur: null
  };

}


//==============================================================
// 🦵 PARTIE DU CORPS
//==============================================================

function neoDetecterPartieCorps(texte) {

  const parties = [

    // 🧠 TÊTE / VISAGE
    "tête",
    "tete",
    "crâne",
    "crane",
    "visage",
    "front",
    "tempe",
    "tempe gauche",
    "tempe droite",
    "œil",
    "oeil",
    "œil gauche",
    "oeil droit",
    "oeil gauche",
    "oeil droit",
    "oreille",
    "oreille gauche",
    "oreille droite",
    "nez",
    "joue",
    "joue gauche",
    "joue droite",
    "bouche",
    "lèvre",
    "levre",
    "lèvre gauche",
    "levre gauche",
    "lèvre droite",
    "levre droite",
    "mâchoire",
    "machoire",
    "mâchoire gauche",
    "machoire gauche",
    "mâchoire droite",
    "machoire droite",
    "menton",

    // 🦴 COU / ÉPAULES
    "cou",
    "nuque",
    "gorge",
    "épaule",
    "epaule",
    "épaule gauche",
    "epaule gauche",
    "épaule droite",
    "epaule droite",

    // 💪 BRAS
    "bras",
    "bras gauche",
    "bras droit",
    "biceps",
    "triceps",
    "avant-bras",
    "avant bras",
    "avant-bras gauche",
    "avant bras gauche",
    "avant-bras droit",
    "avant bras droit",
    "coude",
    "coude gauche",
    "coude droit",
    "poignet",
    "poignet gauche",
    "poignet droit",

    // ✋ MAIN
    "main",
    "main gauche",
    "main droite",
    "paume",
    "paume gauche",
    "paume droite",
    "dos de la main",
    "dos de main",
    "poing",
    "poing gauche",
    "poing droit",
    "doigt",
    "doigts",
    "pouce",
    "pouce gauche",
    "pouce droit",
    "index",
    "index gauche",
    "index droit",
    "majeur",
    "annulaire",
    "auriculaire",

    // 🫀 TRONC
    "torse",
    "poitrine",
    "pectoraux",
    "sein",
    "ventre",
    "abdomen",
    "nombril",
    "plexus",
    "côtes",
    "cotes",
    "côte",
    "cote",
    "dos",
    "haut du dos",
    "bas du dos",
    "lombaires",
    "flanc",
    "flanc gauche",
    "flanc droit",

    // 🦵 BASSIN / JAMBES
    "bassin",
    "hanche",
    "hanche gauche",
    "hanche droite",
    "fesse",
    "fesse gauche",
    "fesse droite",
    "cuisse",
    "cuisse gauche",
    "cuisse droite",
    "genou",
    "genou gauche",
    "genou droit",
    "rotule",
    "rotule gauche",
    "rotule droite",
    "tibia",
    "tibia gauche",
    "tibia droit",
    "mollet",
    "mollet gauche",
    "mollet droit",

    // 🦶 CHEVILLE / PIED
    "cheville",
    "cheville gauche",
    "cheville droite",
    "talon",
    "talon gauche",
    "talon droit",
    "pied",
    "pied gauche",
    "pied droit",
    "dessus du pied",
    "dessus du pied gauche",
    "dessus du pied droit",
    "plante du pied",
    "plante du pied gauche",
    "plante du pied droit",
    "semelle",
    "semelle gauche",
    "semelle droite",
    "semelle du pied gauche",
    "semelle du pied droit",
    "orteil",
    "orteils",
    "gros orteil",
    "gros orteil gauche",
    "gros orteil droit"

  ];

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  // Les expressions composées passent AVANT
  // les expressions simples.
  const partiesTriees =
    [...parties].sort(
      (a, b) =>
        b.length - a.length
    );

  for (
    const partie of partiesTriees
  ) {

    const partieNormalisee =
      neoNormaliserTexteLocal(
        partie
      ).toLowerCase();

    const regex =
      new RegExp(
        `(?<![A-Za-zÀ-ÿ0-9_-])${partieNormalisee.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-zÀ-ÿ0-9_-])`,
        "iu"
      );

    if (
      regex.test(t)
    ) {

      return partie;

    }

  }

  return null;

}


//==============================================================
// 🧭 DIRECTION / TRAJECTOIRE
//==============================================================

function neoDetecterTrajectoire(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  if (
    /\bvers\b/iu.test(t)
  ) {
    return "vers";
  }

  if (
    /\ben\s+ligne\s+droite\b/iu.test(t)
  ) {
    return "ligne_droite";
  }

  if (
    /\bfrontal\b/iu.test(t)
  ) {
    return "frontale";
  }

  if (
    /\blatéral\b|\blateral\b/iu.test(t)
  ) {
    return "laterale";
  }

  if (
    /\bdiagonal\b/iu.test(t)
  ) {
    return "diagonale";
  }

  if (
    /\ben\s+l['’]air\b/iu.test(t) ||
    /\bsaute\b/iu.test(t) ||
    /\bsautant\b/iu.test(t)
  ) {
    return "aerienne";
  }

  return null;

}

//==============================================================
// 🎯 DÉTECTION DE LA CIBLE
//==============================================================

function neoDetecterCible(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    );

  const motsExclus = new Set([
    "visage",
    "abdomen",
    "corps",
    "adversaire",
    "ennemi",
    "cible",
    "direction",
    "maximum",
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "du",
    "de",
    "au",
    "aux",
    "son",
    "sa",
    "ses",
    "avant",
    "arrière",
    "arriere",
    "gauche",
    "droite",
    "m",
    "mètre",
    "mètres",
    "metre",
    "metres"
  ]);

  //============================================================
  // 🎯 PATTERNS DE CIBLE
  //============================================================

  const patterns = [

    // "visant Sarutobi"
    /\bvisant\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "visant le visage de Sarutobi"
    // On cherche directement la cible située après "de".
    /\bvisant\s+(?:le|la|les|un|une|des)\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*(?:\s+[A-Za-zÀ-ÿ]+)*\s+\bde\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "vers Sarutobi"
    /\bvers\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "contre Sarutobi"
    /\bcontre\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "sur Sarutobi"
    /\bsur\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "à Sarutobi"
    /\bà\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "au Sarutobi"
    /\bau\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "son adversaire"
    /\bson\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu

  ];

  for (
    const pattern of patterns
  ) {

    const match =
      t.match(pattern);

    if (
      !match ||
      !match[1]
    ) {
      continue;
    }

    const mot =
      match[1];

    const motNormalise =
      neoNormaliserMotLocal(
        mot
      );

    if (
      motsExclus.has(
        motNormalise
      )
    ) {
      continue;
    }

    if (
      /^\d+(?:[.,]\d+)?(?:m|cm|km)?$/iu.test(
        motNormalise
      )
    ) {
      continue;
    }

    return mot;

  }

  return null;

}
      

//==============================================================
// 👤 ACTEUR
//==============================================================

function neoDetecterActeur(
  texte,
  contexte = {}
) {

  // ------------------------------------------------------------
  // Nettoyage du marqueur NeoAI
  // ------------------------------------------------------------

  const textePropre =
    String(texte || "")
      .replace(/^🌀\s*:\s*/u, "")
      .trim();

  const t =
    neoNormaliserTexteLocal(
      textePropre
    );

  // ------------------------------------------------------------
  // Si le texte commence par un nom propre,
  // on privilégie celui-ci.
  // ------------------------------------------------------------

  const premier =
    t.match(
      /^([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*)\b/u
    );

  if (
    premier &&
    premier[1]
  ) {
    return premier[1];
  }

  // ------------------------------------------------------------
  // Sinon contexte précédent.
  // ------------------------------------------------------------

  if (
    contexte.dernierActeur
  ) {
    return contexte.dernierActeur;
  }

  return null;
}


//==============================================================
// ⚔️ DÉTECTION ACTION
//==============================================================

const NEO_ACTION_FALLBACK = {

  deplacement: [
    "avance",
    "avancer",
    "fonce",
    "foncer",
    "court",
    "courir",
    "marche",
    "marcher",
    "recule",
    "reculer",
    "approche",
    "approcher",
    "saut",
    "saute",
    "sauter",
    "bond",
    "bondit",
    "bondir",
    "vole",
    "voler"
  ],

  attaque: [
  "frappe",
  "frapper",
  "attaque",
  "attaquer",
  "donne",
  "donner",
  "assène",
  "assene",
  "asséner",
  "assener",
  "lance",
  "lancer"
],

  esquive: [
    "esquive",
    "esquiver",
    "évite",
    "evite",
    "éviter",
    "eviter",
    "se baisse",
    "se décale",
    "se decale"
  ],

  contre: [
    "contre",
    "contre-attaque",
    "contreattaque",
    "riposte",
    "riposter"
  ],

  parade: [
    "pare",
    "parer",
    "bloque",
    "bloquer",
    "dévie",
    "devie",
    "dévier",
    "devier"
  ],

  saisie: [
    "saisit",
    "saisir",
    "attrape",
    "attraper",
    "agrippe",
    "agripper",
    "empoigne",
    "empoigner"
  ]
};

//==============================================================
// 🧠 DÉTECTION DE L'ACTION
//==============================================================

function neoDetecterAction(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte || ""
    ).toLowerCase();

  if (!t) {
    return {
      action: null,
      categorie: null,
      famille: null
    };
  }

  //============================================================
  // 🚫 MOTS QUI NE PEUVENT JAMAIS ÊTRE DES ACTIONS
  //============================================================

  const motsInterdits = new Set([
    "a",
    "à",
    "au",
    "aux",
    "de",
    "du",
    "des",
    "un",
    "une",
    "le",
    "la",
    "les",
    "dans",
    "sur",
    "vers",
    "avec",
    "pour",
    "par",
    "en",
    "et",
    "ou",
    "où",
    "son",
    "sa",
    "ses",
    "mon",
    "ma",
    "mes",
    "ton",
    "ta",
    "tes",
    "ce",
    "cet",
    "cette",
    "ces",
    "qui",
    "que",
    "se",
    "s",
    "visant",
    "vise",
    "visée",
    "puis",
    "ensuite",
    "après",
    "apres"
  ]);

  //============================================================
  // 🔎 OUTILS
  //============================================================

  const normaliser =
    valeur =>
      neoNormaliserMotLocal(
        String(valeur || "")
      ).toLowerCase();

  const estMotInterdit =
    valeur =>
      motsInterdits.has(
        normaliser(valeur)
      );

  const contientMot = (
    texteNormalise,
    mot
  ) => {

    const normalise =
      normaliser(mot);

    if (!normalise) {
      return false;
    }

    if (
      motsInterdits.has(normalise)
    ) {
      return false;
    }

    //==========================================================
    // MOT SEUL → CORRESPONDANCE EXACTE
    //==========================================================

    if (
      texteNormalise.trim() ===
      normalise
    ) {
      return true;
    }

    //==========================================================
    // PHRASE → MOT ENTIER
    //==========================================================

    const pattern =
      new RegExp(
        `(^|\\s)${normalise.replace(
          /[.*+?^${}()|[\]\\]/gu,
          "\\$&"
        )}(?=\\s|$)`,
        "iu"
      );

    return pattern.test(
      texteNormalise
    );

  };

  //============================================================
  // 📚 RECHERCHE DANS NEO_ACTIONS
  //============================================================

  const collection =
    NeoAI?.NEO_ACTIONS;

  if (
    Array.isArray(collection)
  ) {

    for (
      const actionDef
      of collection
    ) {

      //========================================================
      // ACTION SIMPLE
      //========================================================

      if (
        typeof actionDef === "string"
      ) {

        const actionNormalisee =
          normaliser(actionDef);

        if (
          !actionNormalisee ||
          motsInterdits.has(
            actionNormalisee
          )
        ) {
          continue;
        }

        if (
          contientMot(
            t,
            actionDef
          )
        ) {

          return {
            action: actionDef,
            categorie: "action",
            famille: null
          };

        }

        continue;

      }

      //========================================================
      // ACTION OBJET
      //========================================================

      if (
        !actionDef ||
        typeof actionDef !== "object"
      ) {
        continue;
      }

      const mots = [
        actionDef.nom,
        actionDef.action,
        actionDef.mot,

        ...(Array.isArray(
          actionDef.synonymes
        )
          ? actionDef.synonymes
          : []),

        ...(Array.isArray(
          actionDef.aliases
        )
          ? actionDef.aliases
          : [])

      ].filter(
        mot =>
          mot &&
          !estMotInterdit(mot)
      );

      const trouve =
        mots.find(
          mot =>
            contientMot(
              t,
              mot
            )
        );

      if (
        !trouve
      ) {
        continue;
      }

      //========================================================
      // CATÉGORIE
      //========================================================

      const categorie =
        actionDef.categorie ||
        actionDef.category ||
        null;

      //========================================================
      // FAMILLE EXISTANTE
      //========================================================

      let famille =
        actionDef.famille ||
        null;

      //========================================================
      // RECHERCHE DE FAMILLE DANS LES MODÈLES
      //========================================================

      if (
        !famille
      ) {

        const modeles =
          neoGetModeles();

        let meilleurFamille = null;
        let meilleurScore = 0;

        for (
          const modele
          of modeles
        ) {

          if (
            categorie &&
            modele.categorie &&
            modele.categorie !== categorie
          ) {
            continue;
          }

          const familleModele =
            modele.famille;

          if (
            !familleModele
          ) {
            continue;
          }

          const exemples =
            Array.isArray(
              modele.exemples
            )
              ? modele.exemples
              : [];

          for (
            const exemple
            of exemples
          ) {

            if (
              contientMot(
                neoNormaliserTexteLocal(
                  exemple
                ).toLowerCase(),
                trouve
              )
            ) {

              meilleurFamille =
                familleModele;

              meilleurScore =
                100;

              break;

            }

          }

          if (
            meilleurScore === 100
          ) {
            break;
          }

        }

        famille =
          meilleurFamille;

      }

      return {
        action:
          actionDef.action ||
          actionDef.nom ||
          trouve,

        categorie,

        famille

      };

    }

  }

  //============================================================
  // 🔥 FALLBACK : RECHERCHE DIRECTE DANS LES MODÈLES
  //============================================================

  const modeles =
    neoGetModeles();

  for (
    const modele
    of modeles
  ) {

    //==========================================================
    // ⚠️ IMPORTANT
    //
    // On ne considère PLUS chaque mot d'un exemple
    // comme une action.
    //
    // On cherche uniquement les actions connues
    // dans NEO_ACTIONS.
    //==========================================================

    const exemples =
      Array.isArray(
        modele.exemples
      )
        ? modele.exemples
        : [];

    for (
      const exemple
      of exemples
    ) {

      const exempleNormalise =
        neoNormaliserTexteLocal(
          exemple
        ).toLowerCase();

      if (!exempleNormalise) {
        continue;
      }

      //========================================================
      // Chercher uniquement les actions connues
      //========================================================

      if (
        !Array.isArray(collection)
      ) {
        continue;
      }

      for (
        const actionDef
        of collection
      ) {

        const candidats =
          typeof actionDef === "string"
            ? [actionDef]
            : [
                actionDef?.nom,
                actionDef?.action,
                actionDef?.mot,
                ...(Array.isArray(
                  actionDef?.synonymes
                )
                  ? actionDef.synonymes
                  : []),
                ...(Array.isArray(
                  actionDef?.aliases
                )
                  ? actionDef.aliases
                  : [])
              ].filter(Boolean);

        for (
          const candidat
          of candidats
        ) {

          if (
            estMotInterdit(candidat)
          ) {
            continue;
          }

          if (
            contientMot(
              exempleNormalise,
              candidat
            ) &&
            contientMot(
              t,
              candidat
            )
          ) {

            return {
              action: candidat,

              categorie:
                modele.categorie ||
                null,

              famille:
                modele.famille ||
                null

            };

          }

        }

      }

    }

  }

  //============================================================
  // 🔧 FALLBACK INTERNE EXISTANT
  //============================================================

  for (
    const [categorie, mots]
    of Object.entries(
      NEO_ACTION_FALLBACK
    )
  ) {

    for (
      const mot
      of mots
    ) {

      if (
        estMotInterdit(mot)
      ) {
        continue;
      }

      if (
        contientMot(
          t,
          mot
        )
      ) {

        return {
          action: mot,
          categorie,
          famille: categorie
        };

      }

    }

  }

  //============================================================
  // ❌ RIEN TROUVÉ
  //============================================================

  return {
    action: null,
    categorie: null,
    famille: null
  };

}

//==============================================================
// ✂️ NEOAI — SEGMENTATION INTELLIGENTE DES ACTIONS
//==============================================================

function neoSegmenterActions(texte) {

  const source =
    neoNormaliserTexteLocal(texte);

  if (!source) {
    return [];
  }

  //============================================================
  // 1️⃣ SÉPARATEURS EXPLICITES
  //============================================================

  const explicite =
    source
      .replace(
        /\s*(?:\|\||\/|;)\s*/gu,
        "|||"
      )
      .replace(
        /\s+(?:puis|ensuite|après|apres)\s+/giu,
        "|||"
      );

  const morceauxExplicites =
    explicite
      .split("|||")
      .map(v => v.trim())
      .filter(Boolean);

  if (
    morceauxExplicites.length > 1
  ) {
    return neoFusionnerSegments(
      morceauxExplicites
    );
  }

  //============================================================
  // 2️⃣ DÉTECTION DES VERBES D'ACTION
  //============================================================

  const mots =
    source.split(/\s+/u);

  const positions = [];

  for (
    let i = 0;
    i < mots.length;
    i++
  ) {

    const mot =
      neoNormaliserMotLocal(
        mots[i]
      );

    if (!mot) {
      continue;
    }

    const detection =
      neoDetecterAction(
        mots[i]
      );

    if (
      detection?.action
    ) {

      positions.push({
        index: i,
        mot,
        action: detection
      });

    }

  }

  //============================================================
  // Aucun verbe d'action
  //============================================================

  if (!positions.length) {
    return [source];
  }

  //============================================================
  // Un seul verbe = une seule action
  //============================================================

  if (
    positions.length === 1
  ) {
    return [source];
  }

  //============================================================
  // 3️⃣ CLASSIFICATION DES VERBES
  //============================================================

  const infos =
    positions.map(p => ({
      ...p,

      categorie:
        p.action?.categorie ||
        neoCategorieAction(
          p.action?.action
        )
    }));

  //============================================================
  // 4️⃣ CONSTRUCTION DES SEGMENTS
  //============================================================

  const segments = [];

  let debut = 0;

  for (
    let i = 1;
    i < infos.length;
    i++
  ) {

    const courant =
      infos[i];

    const precedent =
      infos[i - 1];

    //==========================================================
    // IMPORTANT :
    //
    // Un nouveau verbe n'est PAS automatiquement
    // une nouvelle action.
    //
    // Exemple :
    //
    // "donne un violent coup de poing"
    //
    // donne + coup
    //
    // = UNE SEULE ACTION
    //==========================================================

    if (
      neoEstNouveauVerbeAction(
        mots,
        precedent,
        courant
      )
    ) {

      const segment =
        mots
          .slice(
            debut,
            courant.index
          )
          .join(" ")
          .trim();

      if (segment) {
        segments.push(segment);
      }

      debut =
        courant.index;
    }

  }

  //============================================================
  // DERNIER SEGMENT
  //============================================================

  const dernier =
    mots
      .slice(debut)
      .join(" ")
      .trim();

  if (dernier) {
    segments.push(dernier);
  }

  //============================================================
  // NETTOYAGE
  //============================================================

  return neoFusionnerSegments(
    segments
  );

}


//==============================================================
// 🧠 CATÉGORIE D'UNE ACTION
//==============================================================

function neoCategorieAction(
  action
) {

  const mot =
    neoNormaliserMotLocal(
      action
    );

  for (
    const [categorie, liste]
    of Object.entries(
      NEO_ACTION_FALLBACK
    )
  ) {

    if (
      liste.some(v =>
        neoNormaliserMotLocal(v) === mot
      )
    ) {

      return categorie;

    }

  }

  return null;

}


//==============================================================
// 🧠 SAVOIR SI UN VERBE DÉMARRE UNE NOUVELLE ACTION
//==============================================================

function neoEstNouveauVerbeAction(
  mots,
  precedent,
  courant
) {

  const entre =
    mots
      .slice(
        precedent.index + 1,
        courant.index
      )
      .map(neoNormaliserMotLocal);

  const motPrecedent =
    precedent.mot;

  const motCourant =
    courant.mot;

  //============================================================
  // 🔥 1. MOTS QUI FONT PARTIE D'UNE ATTAQUE
  //============================================================

  const elementsAttaque = [
    "coup",
    "poing",
    "pied",
    "kick",
    "frontal",
    "direct",
    "droite",
    "droit",
    "gauche",
    "visage",
    "tete",
    "tête",
    "abdomen",
    "ventre",
    "torse",
    "corps",
    "genou",
    "pied"
  ];

  //============================================================
  // Exemple :
  //
  // "frappe un coup de poing direct"
  //
  // Le "poing" n'est pas une nouvelle action.
  //============================================================

  if (
    elementsAttaque.includes(
      motCourant
    ) ||
    entre.some(
      mot =>
        elementsAttaque.includes(mot)
    )
  ) {

    if (
      courant.categorie === "attaque"
    ) {

      return false;
    }

  }

  //============================================================
  // 🧭 2. CONJONCTIONS QUI MARQUENT UNE NOUVELLE ACTION
  //============================================================

  const texteEntre =
    entre.join(" ");

  if (
    /\b(?:puis|ensuite|apres|après)\b/iu.test(
      texteEntre
    )
  ) {
    return true;
  }

  //============================================================
  // 🏃 3. DEUX DÉPLACEMENTS DISTINCTS
  //============================================================

  if (
    precedent.categorie === "deplacement" &&
    courant.categorie === "deplacement"
  ) {

    return true;
  }

  //============================================================
  // 🏃 → ⚔️
  //============================================================

  if (
    precedent.categorie === "deplacement" &&
    courant.categorie === "attaque"
  ) {

    return true;
  }

  //============================================================
  // 🏃 → 🛡️
  //============================================================

  if (
    precedent.categorie === "deplacement" &&
    (
      courant.categorie === "esquive" ||
      courant.categorie === "parade" ||
      courant.categorie === "contre"
    )
  ) {

    return true;
  }

  //============================================================
  // ⚔️ → ⚔️
  //============================================================

  if (
    precedent.categorie === "attaque" &&
    courant.categorie === "attaque"
  ) {

    // Si le second verbe est introduit par
    // une structure claire, nouvelle action.

    if (
      /\b(?:puis|ensuite|apres|après|et)\b/iu.test(
        texteEntre
      )
    ) {
      return true;
    }

    // Sinon on considère que cela peut
    // appartenir à la même construction.
    return false;
  }

  //============================================================
  // 🧠 4. ACTIONS DIFFÉRENTES
  //============================================================

  if (
    precedent.categorie !==
    courant.categorie
  ) {

    return true;
  }

  return false;

}


//==============================================================
// 🔗 FUSIONNER / NETTOYER LES SEGMENTS
//==============================================================

function neoFusionnerSegments(
  segments
) {

  const propres =
    segments
      .map(v =>
        String(v || "")
          .replace(/\s+/gu, " ")
          .trim()
      )
      .filter(Boolean);

  if (
    propres.length <= 1
  ) {
    return propres;
  }

  const resultat = [];

  for (
    const segment of propres
  ) {

    if (!resultat.length) {

      resultat.push(
        segment
      );

      continue;
    }

    const analyse =
      neoDetecterAction(
        segment
      );

    const precedent =
      neoDetecterAction(
        resultat[
          resultat.length - 1
        ]
      );

    //==========================================================
    // "coup de poing" doit rester ensemble
    //==========================================================

    const contientObjetAttaque =
      /\b(?:coup|poing|pied|kick|genou)\b/iu
        .test(segment);

    if (
      contientObjetAttaque &&
      precedent?.categorie === "attaque"
    ) {

      resultat[
        resultat.length - 1
      ] += " " + segment;

      continue;
    }

    resultat.push(
      segment
    );

  }

  return resultat;

}

//==============================================================
// 📚 MODÈLES D'ACTIONS
//==============================================================

function neoGetModeles() {

  const sources = [
    NeoAI?.NEO_ACTION_MODELS,
    NeoAI?.NEO_COMBAT_MODELS,
    NeoAI?.ACTION_MODELS,
    NeoAI?.MODELES_ACTIONS
  ];

  for (const source of sources) {

    //============================================================
    // SOURCE = TABLEAU DE MODÈLES
    //============================================================

    if (
      Array.isArray(source) &&
      source.length
    ) {

      return source;

    }

    //============================================================
    // SOURCE = OBJET DE CATÉGORIES
    //============================================================

    if (
      source &&
      typeof source === "object"
    ) {

      const modeles = [];

      for (
        const [categorie, valeur]
        of Object.entries(source)
      ) {

        //========================================================
        // CATÉGORIE CONTENANT PLUSIEURS MODÈLES
        //========================================================

        if (
          Array.isArray(valeur)
        ) {

          for (
            const modele of valeur
          ) {

            if (
              modele &&
              typeof modele === "object"
            ) {

              modeles.push({
                categorie:
                  modele.categorie ||
                  categorie,

                ...modele
              });

            }

          }

          continue;

        }

        //========================================================
        // CATÉGORIE CONTENANT UN SEUL MODÈLE
        //========================================================

        if (
          valeur &&
          typeof valeur === "object"
        ) {

          modeles.push({
            categorie:
              valeur.categorie ||
              categorie,

            ...valeur
          });

        }

      }

      if (
        modeles.length
      ) {

        return modeles;

      }

    }

  }

  return [];

}



//==============================================================
// 🧮 SIMILARITÉ MODÈLE
//==============================================================

function neoCalculerSimilariteModele(
  texte,
  modele,
  analyse = {}
) {

  if (!modele) {
    return 0;
  }

  const source =
    neoNormaliserTexteLocal(
      texte || ""
    ).toLowerCase();

  if (!source) {
    return 0;
  }

  //============================================================
  // OUTILS
  //============================================================

  const normaliser = (valeur) => {

    if (
      valeur === null ||
      valeur === undefined
    ) {
      return "";
    }

    return neoNormaliserMotLocal(
      String(valeur)
    ).toLowerCase();

  };

  const motsSource =
    new Set(
      source
        .split(/\s+/u)
        .map(normaliser)
        .filter(Boolean)
    );

//============================================================
// 1️⃣ ACTION + MANIÈRE
//============================================================

let scoreAction = 0;
let scoreManiere = 0;

//------------------------------------------------------------
// ACTION
//------------------------------------------------------------

const actionModele =
  normaliser(
    modele.action
  );

const actionTexte =
  normaliser(
    analyse.action?.action ||
    analyse.action
  );

if (
  actionModele &&
  actionTexte
) {

  if (
    actionModele === actionTexte
  ) {

    scoreAction = 100;

  } else if (
    actionModele.includes(actionTexte) ||
    actionTexte.includes(actionModele)
  ) {

    scoreAction = 80;

  }

}

//------------------------------------------------------------
// MANIÈRE
//------------------------------------------------------------

const maniereModele =
  normaliser(
    modele.maniere ||
    modele.famille
  );

const maniereTexte =
  normaliser(
    analyse.maniere
  );

if (
  maniereModele &&
  maniereTexte
) {

  if (
    maniereModele === maniereTexte
  ) {

    scoreManiere = 100;

  } else if (
    maniereModele.includes(maniereTexte) ||
    maniereTexte.includes(maniereModele)
  ) {

    scoreManiere = 80;

  }

}
 

  //============================================================
  // 2️⃣ STRUCTURE
  //============================================================

  let scoreStructure = 0;

  const structureModele =
    Array.isArray(modele.structure)
      ? modele.structure
      : [];

  const structureAnalyse =
    analyse.structure || {};

  if (
    structureModele.length
  ) {

    let attendus = 0;
    let trouves = 0;

    for (
      const element of structureModele
    ) {

      const slot =
        normaliser(element);

      if (!slot) {
        continue;
      }

      attendus++;

      let present = false;

      switch (slot) {

        case "sujet":
          present = !!analyse.acteur;
          break;

        case "action":
          present = !!(
            analyse.action?.action ||
            analyse.action
          );
          break;

        case "cible":
        case "objet":
          present = !!analyse.cible;
          break;

        case "maniere":
          present = !!analyse.maniere;
          break;

        case "distance":
          present =
            analyse.distance !== null &&
            analyse.distance !== undefined;
          break;

        case "hauteur":
          present =
            analyse.hauteur !== null &&
            analyse.hauteur !== undefined;
          break;

        case "vitesse":
          present =
            analyse.vitesse !== null &&
            analyse.vitesse !== undefined;
          break;

        case "direction":
          present =
            !!analyse.direction ||
            !!analyse.trajectoire;
          break;

        case "membre":
        case "partie_corps":
          present = !!analyse.partieCorps;
          break;

        default:
          present = false;

      }

      if (present) {
        trouves++;
      }

    }

    if (attendus) {

      scoreStructure =
        Math.round(
          (
            trouves /
            attendus
          ) * 100
        );

    }

  }

//============================================================
// 3️⃣ EXEMPLES
//============================================================

let scoreExemple = 0;

const exemples =
  Array.isArray(modele.exemples)
    ? modele.exemples
    : [];

//------------------------------------------------------------
// MOTS SANS VALEUR POUR LA RECONNAISSANCE DU MODÈLE
//------------------------------------------------------------

const motsVides = new Set([
  "un",
  "une",
  "le",
  "la",
  "les",
  "des",
  "du",
  "de",
  "au",
  "aux",
  "son",
  "sa",
  "ses",
  "dans",
  "sur",
  "vers",
  "avec",
  "pour",
  "par",
  "où",
  "ou",
  "et",
  "en",
  "visant",
  "vise",
  "visée",
  "contre",
  "donne",
  "donner",
  "frappe",
  "frapper",
  "porte",
  "porter",
  "attaque",
  "attaquer",
  "assène",
  "assener"
]);

//------------------------------------------------------------
// PHRASES / EXPRESSIONS TECHNIQUES
//------------------------------------------------------------

const expressionsTechniques = [
  "coup de poing",
  "coup de pied",
  "coup de genou",
  "coup en revers",
  "coup marteau",
  "coup de pied frontal",
  "coup de pied circulaire",
  "coup de pied lateral",
  "coup de pied arrière",
  "coup de pied descendant",
  "coup de poing direct",
  "coup de poing circulaire",
  "coup de poing revers",
  "coup de poing marteau"
];

//------------------------------------------------------------
// NORMALISATION TECHNIQUE
//------------------------------------------------------------

const extraireMotsUtiles = (valeur) => {

  let texteNormalise =
    neoNormaliserTexteLocal(
      String(valeur || "")
    )
      .toLowerCase();

  // Transforme les expressions importantes
  // en unités techniques uniques.

  for (
    const expression of expressionsTechniques
  ) {

    const normalisee =
      expression
        .toLowerCase()
        .replace(/\s+/gu, "_");

    const pattern =
      expression
        .split(/\s+/u)
        .map(mot =>
          mot.replace(
            /[.*+?^${}()|[\]\\]/gu,
            "\\$&"
          )
        )
        .join("\\s+");

    texteNormalise =
      texteNormalise.replace(
        new RegExp(
          `\\b${pattern}\\b`,
          "giu"
        ),
        normalisee
      );

  }

  return new Set(
    texteNormalise
      .split(/\s+/u)
      .map(normaliser)
      .filter(Boolean)
      .filter(
        mot =>
          !motsVides.has(mot)
      )
  );

};

//------------------------------------------------------------
// MOTS UTILES DU TEXTE
//------------------------------------------------------------

const motsUtilesSource =
  extraireMotsUtiles(
    source
  );

//------------------------------------------------------------
// COMPARAISON AVEC CHAQUE EXEMPLE
//------------------------------------------------------------

for (
  const exemple of exemples
) {

  const motsExemple =
    extraireMotsUtiles(
      exemple
    );

  if (
    !motsExemple.size
  ) {
    continue;
  }

  let communs = 0;

  for (
    const mot of motsExemple
  ) {

    if (
      motsUtilesSource.has(mot)
    ) {

      communs++;

    }

  }

  const score =
    Math.round(
      (
        communs /
        motsExemple.size
      ) * 100
    );

  scoreExemple =
    Math.max(
      scoreExemple,
      score
    );

}

  //============================================================
  // 4️⃣ MOTS
  //============================================================

  let scoreMots = 0;

  const champs = [
    modele.categorie,
    modele.famille
  ];

  for (
    const champ of champs
  ) {

    const motsModele =
      String(champ || "")
        .split(/\s+/u)
        .map(normaliser)
        .filter(Boolean);

    if (!motsModele.length) {
      continue;
    }

    let communs = 0;

    for (
      const mot of motsModele
    ) {

      if (
        motsSource.has(mot)
      ) {
        communs++;
      }

    }

    const score =
      Math.round(
        (
          communs /
          motsModele.length
        ) * 100
      );

    scoreMots =
      Math.max(
        scoreMots,
        score
      );

  }

  //============================================================
// 5️⃣ SCORE FINAL
//============================================================

const scoreFinal =
  Math.round(
    (
      scoreAction * 0.25
    ) +
    (
      scoreManiere * 0.15
    ) +
    (
      scoreStructure * 0.30
    ) +
    (
      scoreExemple * 0.20
    ) +
    (
      scoreMots * 0.10
    )
  );

return Math.min(
  100,
  scoreFinal
);
} 

//==============================================================
// 📚 RECONNAISSANCE DU MEILLEUR MODÈLE
//==============================================================

function neoReconnaitreModele(
  texte,
  analyse = {}
) {

  const modeles =
    neoGetModeles();

  if (!modeles.length) {

    return {
      modele: null,
      score: 0
    };

  }

  let meilleur = null;
  let meilleurScore = 0;

  for (
    const modele of modeles
  ) {

    console.log(
      "🧪 [NeoAI MODEL]",
      modele.id,
      modele.famille,
      Array.isArray(modele.exemples)
        ? modele.exemples.length
        : 0
    );

    const score =
      neoCalculerSimilariteModele(
        texte,
        modele,
        analyse
      );

    if (
      score > meilleurScore
    ) {

      meilleurScore = score;
      meilleur = modele;

    }

  }

  return {
    modele: meilleur,
    score: meilleurScore
  };

}


//==============================================================
// 🧠 ANALYSE SÉMANTIQUE D'UNE ACTION
//==============================================================

function neoAnalyserAction(
  texte,
  contexte = {}
) {

  const action =
    neoDetecterAction(
      texte
    );

  let acteur =
    neoDetecterActeur(
      texte,
      contexte
    );

  const cible =
    neoDetecterCible(
      texte
    );

  const distance =
    neoDetecterDistance(
      texte
    );

  const hauteur =
    neoDetecterHauteur(
      texte
    );

  const vitesse =
    neoDetecterVitesse(
      texte
    );

  const partieCorps =
    neoDetecterPartieCorps(
      texte
    );

  const trajectoire =
    neoDetecterTrajectoire(
      texte
    );

  //============================================================
  // 🔧 RÉCUPÉRATION PROPRE DE L'ACTION
  //============================================================

  const actionNom =
    typeof action === "string"
      ? action
      : (
          action?.action ||
          action?.verbe ||
          null
        );

  const categorie =
    typeof action === "object"
      ? (
          action?.categorie ||
          null
        )
      : null;

  const famille =
    typeof action === "object"
      ? (
          action?.famille ||
          null
        )
      : null;

  //============================================================
  // 👤 FALLBACK SUJET
  //============================================================

  if (!acteur) {

    const normal =
      neoNormaliserTexteLocal(
        texte
      )
        .replace(/^🌀\s*:\s*/u, "")
        .replace(/^:\s*/u, "")
        .trim();

    const mots =
      normal.split(/\s+/u);

    const premiersMotsAction = [
      "avance",
      "avancer",
      "progresse",
      "recule",
      "reculer",
      "fonce",
      "foncer",
      "court",
      "courir",
      "charge",
      "charger",
      "bondit",
      "bondir",
      "saute",
      "sauter",
      "frappe",
      "frapper",
      "donne",
      "donner",
      "porte",
      "porter",
      "pivote",
      "pivoter",
      "tourne",
      "tourner"
    ];

    const indexAction =
      mots.findIndex(
        mot =>
          premiersMotsAction.includes(
            neoNormaliserMotLocal(mot)
          )
      );

    if (
      indexAction > 0
    ) {

      acteur =
        mots[0];

    }

  }

  //============================================================
  // 💨 MANIÈRE
  //============================================================

  const manieres = [

    "course",
    "sprint",
    "bond",
    "bondissant",
    "saut",
    "sautant",
    "zigzag",
    "zigzagant",

    "direct",
    "directe",
    "circulaire",
    "circulairement",
    "revers",
    "retourné",
    "retourne",
    "crochet",
    "uppercut",
    "frontal",
    "latéral",
    "laterale",
    "latérale",

    "vrille",
    "rotation",
    "tournant",
    "pivot",
    "pivôt",
    "diagonale",
    "diagonal",
    "latéralement",
    "lateralement",
    "frontalement",

    "esquive",
    "déviation",
    "deviation",
    "écart",
    "écartement",

    "violemment",
    "violent",
    "violente",
    "rapidement",
    "brutalement",
    "brutal",
    "brutale",
    "furtivement",
    "précipitamment",
    "precipitamment",
    "doucement"

  ];

  let maniere = null;

  const normal =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  for (
    const mot of manieres
  ) {

    const motNormalise =
      neoNormaliserMotLocal(
        mot
      );

    const regex =
      new RegExp(
        `\\b${motNormalise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "iu"
      );

    if (
      regex.test(normal)
    ) {

      maniere = mot;
      break;

    }

  }

  //============================================================
  // 🦾 MEMBRE UTILISÉ
  //============================================================
  // Le membre appartient à L'ACTEUR.
  //
  // Exemple :
  // "Naruto frappe du droit visant la mâchoire"
  //
  // membre      = main droite
  // partieCorps = mâchoire
  //
  // On cherche d'abord les membres explicitement écrits.
  //============================================================

  let membre = null;

  const membres = [

    // ─────────────────────────────────────────────
    // ✋ MAINS / POINGS
    // ─────────────────────────────────────────────

    "main droite",
    "main gauche",
    "poing droit",
    "poing gauche",
    "paume droite",
    "paume gauche",
    "dos de la main droite",
    "dos de la main gauche",

    // ─────────────────────────────────────────────
    // 💪 BRAS
    // ─────────────────────────────────────────────

    "bras droit",
    "bras gauche",
    "avant-bras droit",
    "avant-bras gauche",
    "coude droit",
    "coude gauche",
    "poignet droit",
    "poignet gauche",

    // ─────────────────────────────────────────────
    // 🦵 JAMBES
    // ─────────────────────────────────────────────

    "cuisse droite",
    "cuisse gauche",
    "genou droit",
    "genou gauche",
    "tibia droit",
    "tibia gauche",
    "mollet droit",
    "mollet gauche",

    // ─────────────────────────────────────────────
    // 🦶 PIEDS
    // ─────────────────────────────────────────────

    "pied droit",
    "pied gauche",
    "talon droit",
    "talon gauche",
    "cheville droite",
    "cheville gauche",

    "dessus du pied droit",
    "dessus du pied gauche",

    "plante du pied droit",
    "plante du pied gauche",

    "semelle du pied droit",
    "semelle du pied gauche",

    "semelle droite",
    "semelle gauche",

    "gros orteil droit",
    "gros orteil gauche"

  ];

  // Les expressions longues doivent être testées
  // avant les expressions courtes.
  const membresTries =
    [...membres].sort(
      (a, b) =>
        b.length - a.length
    );

  for (
    const partie of membresTries
  ) {

    const partieNormalisee =
      neoNormaliserTexteLocal(
        partie
      ).toLowerCase();

    const regex =
      new RegExp(
        `(?<![A-Za-zÀ-ÿ0-9_-])${partieNormalisee.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-zÀ-ÿ0-9_-])`,
        "iu"
      );

    if (
      regex.test(normal)
    ) {

      membre = partie;
      break;

    }

  }

  //============================================================
  // 🧠 INTERPRÉTATION DE "DU DROIT / DU GAUCHE"
  //============================================================
  // Exemple :
  //
  // "Naruto frappe un uppercut du droit"
  //
  // "du droit" ne contient pas "main droite".
  // On déduit donc le membre selon le type d'action.
  //============================================================

  if (!membre) {

    const droit =
      /\bdu\s+droit\b/iu.test(normal) ||
      /\bde\s+la\s+droite\b/iu.test(normal) ||
      /\bà\s+droite\b/iu.test(normal);

    const gauche =
      /\bdu\s+gauche\b/iu.test(normal) ||
      /\bde\s+la\s+gauche\b/iu.test(normal) ||
      /\bà\s+gauche\b/iu.test(normal);

    if (
      droit ||
      gauche
    ) {

      const cote =
        droit
          ? "droite"
          : "gauche";

      // 👊 Poings
      if (
        /\b(poing|uppercut|crochet|frappe|frapper|coup de poing)\b/iu.test(normal)
      ) {

        membre =
          `main ${cote}`;

      }

      // 🦵 Genou
      else if (
        /\b(genou|coup de genou)\b/iu.test(normal)
      ) {

        membre =
          `genou ${cote}`;

      }

      // 🦶 Pied
      else if (
        /\b(pied|coup de pied|kick|semelle|plante du pied)\b/iu.test(normal)
      ) {

        membre =
          `pied ${cote}`;

      }

      // 💪 Coude
      else if (
        /\b(coude|coup de coude)\b/iu.test(normal)
      ) {

        membre =
          `coude ${cote}`;

      }

      // 🦵 Jambe
      else if (
        /\b(jambe|cuisse|tibia|mollet)\b/iu.test(normal)
      ) {

        membre =
          `jambe ${cote}`;

      }

      // 💪 Bras
      else if (
        /\b(bras|avant-bras|poignet)\b/iu.test(normal)
      ) {

        membre =
          `bras ${cote}`;

      }

    }

  }

  //============================================================
  // 🧱 STRUCTURE
  //============================================================

  const structure = {

    sujet:
      acteur
        ? "S"
        : null,

    verbe:
      actionNom
        ? "V"
        : null,

    objet:
      cible
        ? "O"
        : null,

    complement:
      (
        distance?.valeur !== null ||
        hauteur?.valeur !== null ||
        maniere ||
        vitesse?.valeur !== null ||
        membre ||
        partieCorps
      )
        ? "C"
        : null

  };

  //============================================================
  // 📦 ANALYSE UTILISÉE POUR LE MODÈLE
  //============================================================

  const analyseModele = {

    texte,

    acteur,

    sujet: acteur,

    action: {
      action: actionNom,
      categorie,
      famille
    },

    categorie,

    famille,

    cible,

    maniere,

    membre,

    vitesse:
      vitesse?.valeur ?? null,

    distance:
      distance?.valeur ?? null,

    distanceUnite:
      distance?.unite ?? null,

    hauteur:
      hauteur?.valeur ?? null,

    hauteurUnite:
      hauteur?.unite ?? null,

    direction:
      trajectoire,

    trajectoire,

    partieCorps,

    structure

  };

  //============================================================
  // 📚 RECONNAISSANCE DU MODÈLE
  //============================================================

  const modele =
    neoReconnaitreModele(
      texte,
      analyseModele
    );

  //============================================================
  // ✅ FORMAT DE SORTIE
  //============================================================

  return {

    texte,

    acteur,

    sujet: acteur,

    action: actionNom,

    categorie,

    famille,

    cible,

    maniere,

    membre,

    vitesse:
      vitesse?.valeur ?? null,

    distance:
      distance?.valeur ?? null,

    distanceUnite:
      distance?.unite ?? null,

    hauteur:
      hauteur?.valeur ?? null,

    hauteurUnite:
      hauteur?.unite ?? null,

    direction:
      trajectoire,

    trajectoire,

    partieCorps,

    modele:
      modele?.modele || null,

    score:
      modele?.score || 0,

    structure

  };

}


//==============================================================
// ⚖️ ARBITRAGE
//==============================================================

function neoArbitrer(
  analyse,
  options = {}
) {

  const regles =
    options.regles || {};

  const scoreMin =
    Number(
      regles.similariteMinimale ??
      50
    );

  const maxActions =
    Number(
      regles.maxActions ??
      20
    );

  const raisons = [];

  //============================================================
  // Nombre d'actions
  //============================================================

  if (
    options.nombreActions >
    maxActions
  ) {

    raisons.push(
      `Nombre d'actions supérieur à la limite (${maxActions}).`
    );

  }

  //============================================================
  // Action inconnue
  //============================================================

  if (!analyse.action) {

    raisons.push(
      "Aucune action reconnue."
    );

  }

  //============================================================
  // Similarité
  //============================================================

  if (
    analyse.score < scoreMin
  ) {

    raisons.push(
      `Similarité insuffisante (${analyse.score}% < ${scoreMin}%).`
    );

  }

  return {
    valide:
      raisons.length === 0,

    verdict:
      raisons.length === 0
        ? "VALIDÉ"
        : "REFUSÉ",

    raisons

  };

}


//==============================================================
// 💡 RÉSUMÉ
//==============================================================

function neoGenererResume(
  analyse
) {

  const morceaux = [];

  if (analyse.acteur) {
    morceaux.push(
      analyse.acteur
    );
  }

  if (analyse.action) {
    morceaux.push(
      analyse.action
    );
  }

  if (analyse.cible) {
    morceaux.push(
      `vers ${analyse.cible}`
    );
  }

  if (analyse.distance !== null) {

    morceaux.push(
      `${analyse.distance}${analyse.distanceUnite || "m"}`
    );

  }

  if (analyse.hauteur !== null) {

    morceaux.push(
      `à ${analyse.hauteur}${analyse.hauteurUnite || "m"} de hauteur`
    );

  }

  if (analyse.partieCorps) {

    morceaux.push(
      `visant ${analyse.partieCorps}`
    );

  }

  if (analyse.maniere) {

    morceaux.push(
      `de manière ${analyse.maniere}`
    );

  }

  if (analyse.vitesse) {

    morceaux.push(
      `à ${analyse.vitesse}`
    );

  }

  if (!morceaux.length) {
    return analyse.texte;
  }

  return morceaux.join(" ");

}


//==============================================================
// 🧠 NOUVEAU ANALYSER NEOAI
//==============================================================

function AnalyserNeoAI(
  texte,
  options = {}
) {

  const brut =
    String(texte || "");

  const normalise =
    neoNormaliserTexteLocal(
      brut
    );

  if (!normalise) {

    return {
      trouve: false,
      valide: false,
      verdict: "REFUSÉ",

      texte: brut,

      actions: [],

      nombreActions: 0,

      score: 0,

      raisons: [
        "Texte vide."
      ],

      motsConnus: [],
      motsInconnus: [],

      comprehension: null,

      resume: ""
    };

  }

  //============================================================
  // 📝 MOTS
  //============================================================

  const mots =
    neoExtraireMots(
      normalise
    );

  const motsConnus = [];
  const motsInconnus = [];

  for (const mot of mots) {

    const propre =
      neoNormaliserMotLocal(
        mot
      );

    if (!propre) {
      continue;
    }

    if (
      neoMotConnu(propre)
    ) {
      motsConnus.push(mot);
    } else {
      motsInconnus.push(mot);
    }

  }

  //============================================================
  // ✂️ SEGMENTATION
  //============================================================

  const segments =
    neoSegmenterActions(
      normalise
    );

  //============================================================
  // 🧠 ANALYSE ACTIONS
  //============================================================

  const actions = [];

  let contexte = {
    dernierActeur: null,
    derniereCible: null,
    derniereAction: null
  };

  for (
    const segment of segments
  ) {

    const analyse =
      neoAnalyserAction(
        segment,
        contexte
      );

    //==========================================================
    // Héritage de contexte
    //==========================================================

    if (
      !analyse.acteur &&
      contexte.dernierActeur
    ) {
      analyse.acteur =
        contexte.dernierActeur;

      analyse.sujet =
        contexte.dernierActeur;
    }

    if (
      !analyse.cible &&
      contexte.derniereCible
    ) {
      analyse.cible =
        contexte.derniereCible;
    }

    contexte = {
      dernierActeur:
        analyse.acteur ||
        contexte.dernierActeur,

      derniereCible:
        analyse.cible ||
        contexte.derniereCible,

      derniereAction:
        analyse.action ||
        contexte.derniereAction
    };

    actions.push(
      analyse
    );

  }

  //============================================================
  // ⚖️ ARBITRAGE GLOBAL
  //============================================================

  const arbitre =
    neoArbitrer(
      {
        ...(
          actions[0] || {
            action: null,
            score: 0
          }
        )
      },
      {
        ...options,
        nombreActions:
          actions.length
      }
    );

  //============================================================
  // RAISONS ACTIONS
  //============================================================

  const raisons =
    [...arbitre.raisons];

  for (
    let i = 0;
    i < actions.length;
    i++
  ) {

    const action =
      actions[i];

    if (
      !action.action
    ) {

      raisons.push(
        `Action ${i + 1} : action non reconnue.`
      );

    }

  }

  const valide =
    raisons.length === 0;

  //============================================================
  // RÉSUMÉ
  //============================================================

  const resume =
    actions
      .map(
        neoGenererResume
      )
      .join(" puis ");

  //============================================================
  // COMPRÉHENSION GLOBALE
  //============================================================

  const premiere =
    actions[0] || {};

  return {

    trouve:
      actions.length > 0,

    valide,

    verdict:
      valide
        ? "VALIDÉ"
        : "REFUSÉ",

    texte: brut,

    texteNormalise:
      normalise,

    nombreActions:
      actions.length,

    actions,

    // Compatibilité ancienne architecture
    action:
      premiere.action || null,

    modele:
      premiere.modele || null,

    score:
      premiere.score || 0,

    structure:
      premiere.structure || null,

    slots: {
      acteur:
        premiere.acteur || null,

      cible:
        premiere.cible || null,

      action:
        premiere.action || null,

      maniere:
        premiere.maniere || null,

      vitesse:
        premiere.vitesse || null,

      distance:
        premiere.distance ?? null,

      distanceUnite:
        premiere.distanceUnite || null,

      hauteur:
        premiere.hauteur ?? null,

      hauteurUnite:
        premiere.hauteurUnite || null,

      trajectoire:
        premiere.trajectoire || null,

      partieCorps:
        premiere.partieCorps || null
    },

    motsConnus,

    motsInconnus,

    comprehension: {

      sujet:
        premiere.acteur || null,

      action:
        premiere.action || null,

      maniere:
        premiere.maniere || null,

      cible:
        premiere.cible || null,

      trajectoire:
        premiere.trajectoire || null,

      distance:
        premiere.distance ?? null,

      hauteur:
        premiere.hauteur ?? null,

      vitesse:
        premiere.vitesse || null,

      partieCorps:
        premiere.partieCorps || null

    },

    arbitrage: {
      valide,
      verdict:
        valide
          ? "VALIDÉ"
          : "REFUSÉ",

      raisons
    },

    raisons,

    resume

  };

}


//==============================================================
// 🔄 COMPATIBILITÉ ANCIEN NOM
//==============================================================

function analyserNeoAI(
  texte,
  options = {}
) {

  return AnalyserNeoAI(
    texte,
    options
  );

}


//==============================================================
// 📤 AFFICHAGE DU RÉSULTAT NEOAI
//==============================================================

async function envoyerResultatNeoAI(
  ovl,
  ms_org,
  resultat,
  ms
) {

  if (!resultat) {
    return;
  }

  const actions =
    resultat.actions || [];

  let texte =
`🌀🧠 *NeoAI*
━━━━━━━━━━━━━━━━━━

📝 *Texte :*
${resultat.texte || "—"}

🏷️ *Catégorie :*
${actions[0]?.categorie || "—"}

🎯 *Famille :*
${actions[0]?.famille || "—"}

📊 *Actions détectées :*
${resultat.nombreActions || 0}

`;

  if (actions.length) {

    texte +=
`📚 *Analyse des actions :*
`;

    actions.forEach(
      (action, index) => {

        texte +=
`
*Action ${index + 1}*
├ 🧍 Sujet : ${action.acteur || "—"}
├ ⚔️ Action : ${action.action || "—"}
├ 🎯 Cible : ${action.cible || "—"}
├ 🌀 Catégorie : ${action.categorie || "—"}
├ 🎯 Famille : ${action.famille || "—"}
├ 💨 Manière : ${action.maniere || "—"}
├ ⚡ Vitesse : ${action.vitesse || "—"}
├ 📐 Distance : ${
          action.distance !== null &&
          action.distance !== undefined
            ? `${action.distance}${action.distanceUnite || "m"}`
            : "—"
        }
├ 📏 Hauteur : ${
          action.hauteur !== null &&
          action.hauteur !== undefined
            ? `${action.hauteur}${action.hauteurUnite || "m"}`
            : "—"
        }
├ 🧭 Trajectoire : ${action.trajectoire || "—"}
├ 🦵 Partie du corps : ${action.partieCorps || "—"}
├ 📚 Modèle : ${
          action.modele?.id ||
          action.modele?.nom ||
          action.modele ||
          "—"
        }
╰ 📊 Similarité : ${action.score || 0}%
`;

      }
    );

  }

  texte +=
`
🧠 *Mots connus :*
${
    resultat.motsConnus?.length
      ? resultat.motsConnus.join(", ")
      : "Aucun"
  }

❓ *Mots inconnus :*
${
    resultat.motsInconnus?.length
      ? resultat.motsInconnus.join(", ")
      : "Aucun"
  }

⚖️ *Arbitrage :*
${
    resultat.valide
      ? "✅ *VALIDÉ*"
      : "❌ *REFUSÉ*"
  }

📌 *Raisons :*
${
    resultat.raisons?.length
      ? resultat.raisons
          .map(r => `• ${r}`)
          .join("\n")
      : "Aucune"
  }

💡 *Résumé :*
${resultat.resume || "—"}

╰──────────────────
         *Powered by NEOVERSE™🌀*
`;

  return ovl.sendMessage(
    ms_org,
    {
      text: texte
    },
    {
      quoted: ms
    }
  );

}


//==============================================================
// 🌀 TRAITER MESSAGE NEOAI
//==============================================================

async function traiterMessageNeoAI(
  ms_org,
  ovl,
  cmd_options
) {

  const ms =
    cmd_options?.ms;

  const userJid =
    getNeoAIUserJid(
      ms_org,
      ms,
      cmd_options
    );

  if (!userJid) {
    return;
  }

  const texte =
    extraireTexteNeoAI(
      ms
    );

  //============================================================
  // 🛑 STOP
  //============================================================

  if (
    estCommandeArretNeoAI(
      texte
    )
  ) {

    if (
      sessionNeoAIActive(
        userJid
      )
    ) {

      fermerSessionNeoAI(
        userJid
      );

      return ovl.sendMessage(
        ms_org,
        {
          text:
            "🛑 *NeoAI arrêté.*\n\nLa session d'analyse a été fermée."
        },
        {
          quoted: ms
        }
      );

    }

    return;

  }

  //============================================================
  // 🔎 SESSION
  //============================================================

  const session =
    getSessionNeoAI(
      userJid
    );

  if (
    !session ||
    !session.active
  ) {
    return;
  }

  //============================================================
  // 🌀 SEULS LES PAVÉS 🌀: SONT ANALYSÉS
  //============================================================

  if (
    !/^🌀\s*:/u.test(
      texte
    )
  ) {
    return;
  }

  //============================================================
  // ANALYSE
  //============================================================

  try {

    console.log(
      "🧠 [NeoAI] Analyse :",
      texte
    );

    const resultat =
      await AnalyserNeoAI(
        texte,
        {
          jeu: "NeoAI-Test",

          regles: {

            // Pour le laboratoire NeoAI,
            // on ne bloque pas encore
            // les pavés complexes.

            maxActions: 20,

            similariteMinimale: 50

          },

          debug: true,

          session
        }
      );

    session.messagesAnalyses++;

    //==========================================================
    // HISTORIQUE
    //==========================================================

    session.historique.push({

      texte,

      resultat,

      timestamp:
        Date.now()

    });

    // Limite mémoire
    if (
      session.historique.length > 50
    ) {

      session.historique =
        session.historique.slice(-50);

    }

    //==========================================================
    // CONTEXTE
    //==========================================================

    if (
      resultat.actions?.length
    ) {

      const derniere =
        resultat.actions[
          resultat.actions.length - 1
        ];

      session.contexte = {

        dernierActeur:
          derniere.acteur ||
          session.contexte.dernierActeur,

        derniereCible:
          derniere.cible ||
          session.contexte.derniereCible,

        derniereAction:
          derniere.action ||
          session.contexte.derniereAction

      };

    }

    //==========================================================
    // ENVOI
    //==========================================================

    return envoyerResultatNeoAI(
      ovl,
      ms_org,
      resultat,
      ms
    );

  } catch (error) {

    console.error(
      "❌ [NeoAI] Erreur analyse :",
      error
    );

    return ovl.sendMessage(
      ms_org,
      {
        text:
          "❌ Une erreur est survenue pendant l'analyse de NeoAI."
      },
      {
        quoted: ms
      }
    );

  }

}

//==============================================================
// 📤 EXPORTS NEOAI
//==============================================================

module.exports.traiterMessageNeoAI =
  traiterMessageNeoAI;

module.exports.demarrerSessionNeoAI =
  demarrerSessionNeoAI;

module.exports.getSessionNeoAI =
  getSessionNeoAI;

module.exports.sessionNeoAIActive =
  sessionNeoAIActive;

module.exports.fermerSessionNeoAI =
  fermerSessionNeoAI;

module.exports.estCommandeArretNeoAI =
  estCommandeArretNeoAI;

module.exports.analyserNeoAI =
  analyserNeoAI;

module.exports.AnalyserNeoAI =
  AnalyserNeoAI;

module.exports.extraireTexteNeoAI =
  extraireTexteNeoAI;
