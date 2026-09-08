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
    "visage",
    "tête",
    "tete",
    "crâne",
    "crane",
    "mâchoire",
    "machoire",
    "menton",
    "cou",
    "épaule",
    "epaule",
    "bras",
    "avant-bras",
    "poignet",
    "main",
    "doigts",
    "torse",
    "poitrine",
    "ventre",
    "abdomen",
    "dos",
    "hanche",
    "cuisse",
    "genou",
    "tibia",
    "mollet",
    "cheville",
    "pied"
  ];

  const t =
    neoNormaliserTexteLocal(
      texte
    );

  for (const partie of parties) {

    if (
      t.includes(
        neoNormaliserTexteLocal(partie)
      )
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
// 🎯 CIBLE
//==============================================================

function neoDetecterCible(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    );

  const patterns = [
    /\bvers\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,
    /\bcontre\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,
    /\bsur\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,
    /\bà\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,
    /\bau\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,
    /\bson\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu
  ];

  for (const pattern of patterns) {

    const match =
      t.match(pattern);

    if (
      match &&
      match[1]
    ) {

      const mot =
        match[1];

      if (
        ![
          "visage",
          "abdomen",
          "corps",
          "adversaire",
          "ennemi",
          "cible",
          "direction",
          "maximum"
        ].includes(
          neoNormaliserMotLocal(mot)
        )
      ) {
        return mot;
      }

    }

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

  const t =
    neoNormaliserTexteLocal(
      texte
    );

  // Si le texte commence par un nom propre,
  // on privilégie celui-ci.

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

  // Sinon contexte précédent.

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
    "coup",
    "poing",
    "pied",
    "kick",
    "donne",
    "assène",
    "assene"
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


function neoDetecterAction(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  //============================================================
  // Recherche prioritaire dans NEO_ACTIONS
  //============================================================

  const collection =
    NeoAI?.NEO_ACTIONS;

  if (collection) {

    if (Array.isArray(collection)) {

      for (const action of collection) {

        if (typeof action === "string") {

          if (
            t.includes(
              neoNormaliserMotLocal(action)
            )
          ) {
            return {
              action,
              categorie: "action",
              famille: null
            };
          }

        }

        if (
          action &&
          typeof action === "object"
        ) {

          const mots = [
            action.nom,
            action.action,
            action.mot,
            ...(Array.isArray(action.synonymes)
              ? action.synonymes
              : []),
            ...(Array.isArray(action.aliases)
              ? action.aliases
              : [])
          ].filter(Boolean);

          const trouve =
            mots.find(m =>
              t.includes(
                neoNormaliserMotLocal(m)
              )
            );

          if (trouve) {

            return {
              action:
                action.action ||
                action.nom ||
                trouve,

              categorie:
                action.categorie ||
                action.category ||
                null,

              famille:
                action.famille ||
                null
            };

          }

        }

      }

    }

  }

  //============================================================
  // Fallback interne
  //============================================================

  for (
    const [categorie, mots]
    of Object.entries(
      NEO_ACTION_FALLBACK
    )
  ) {

    for (const mot of mots) {

      if (
        t.includes(
          neoNormaliserMotLocal(mot)
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

  return {
    action: null,
    categorie: null,
    famille: null
  };

}


//==============================================================
// ✂️ SEGMENTATION DES ACTIONS
//==============================================================

function neoSegmenterActions(texte) {

  let t =
    neoNormaliserTexteLocal(
      texte
    );

  if (!t) {
    return [];
  }

  //============================================================
  // Séparateurs explicites
  //============================================================

  t =
    t.replace(
      /\s+(?:puis|ensuite|après|apres|et ensuite)\s+/giu,
      "|||"
    );

  //============================================================
  // Détection des verbes d'action
  //============================================================

  const mots =
    t.split(/\s+/u);

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

    const estAction =
      Object.values(
        NEO_ACTION_FALLBACK
      )
      .flat()
      .some(v =>
        neoNormaliserMotLocal(v) === mot
      );

    if (estAction) {
      positions.push(i);
    }

  }

  // Si séparateurs explicites,
  // on les utilise directement.

  if (
    t.includes("|||")
  ) {

    return t
      .split("|||")
      .map(v => v.trim())
      .filter(Boolean);

  }

  //============================================================
  // Découpage basé sur les verbes
  //============================================================

  if (
    positions.length <= 1
  ) {
    return [t];
  }

  const segments = [];

  let debut = 0;

  for (
    let i = 1;
    i < positions.length;
    i++
  ) {

    const position =
      positions[i];

    const segment =
      mots
        .slice(
          debut,
          position
        )
        .join(" ")
        .trim();

    if (segment) {
      segments.push(segment);
    }

    debut = position;

  }

  const dernier =
    mots
      .slice(debut)
      .join(" ")
      .trim();

  if (dernier) {
    segments.push(dernier);
  }

  return segments;

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

    if (
      Array.isArray(source) &&
      source.length
    ) {
      return source;
    }

    if (
      source &&
      typeof source === "object"
    ) {

      return Object.entries(source)
        .map(([id, modele]) => ({
          id,
          ...(
            modele &&
            typeof modele === "object"
              ? modele
              : {
                  phrase: String(modele)
                }
          )
        }));

    }

  }

  return [];

}


//==============================================================
// 🧮 SIMILARITÉ MODÈLE
//==============================================================

function neoCalculerSimilariteModele(
  texte,
  modele
) {

  if (!modele) {
    return 0;
  }

  const source =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  const champs = [
    modele.phrase,
    modele.modele,
    modele.texte,
    modele.structure,
    modele.pattern,
    modele.description,
    modele.intention,
    modele.action
  ].filter(Boolean);

  if (!champs.length) {
    return 0;
  }

  const motsSource =
    new Set(
      source
        .split(/\s+/u)
        .map(neoNormaliserMotLocal)
        .filter(Boolean)
    );

  let meilleur = 0;

  for (const champ of champs) {

    const motsModele =
      String(champ)
        .split(/\s+/u)
        .map(neoNormaliserMotLocal)
        .filter(Boolean);

    if (!motsModele.length) {
      continue;
    }

    let communs = 0;

    for (const mot of motsModele) {

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
          Math.max(
            motsModele.length,
            1
          )
        ) * 100
      );

    meilleur =
      Math.max(
        meilleur,
        score
      );

  }

  return Math.min(
    100,
    meilleur
  );

}


//==============================================================
// 📚 RECONNAISSANCE DU MEILLEUR MODÈLE
//==============================================================

function neoReconnaitreModele(
  texte,
  actionDetectee
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

  for (const modele of modeles) {

    let score =
      neoCalculerSimilariteModele(
        texte,
        modele
      );

    const actionModele =
      neoNormaliserMotLocal(
        modele.action ||
        modele.verbe ||
        modele.intention ||
        ""
      );

    const actionTexte =
      neoNormaliserMotLocal(
        actionDetectee?.action ||
        ""
      );

    if (
      actionModele &&
      actionTexte &&
      (
        actionModele === actionTexte ||
        actionModele.includes(actionTexte) ||
        actionTexte.includes(actionModele)
      )
    ) {
      score += 25;
    }

    score =
      Math.min(
        100,
        score
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

  const acteur =
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

  const modele =
    neoReconnaitreModele(
      texte,
      action
    );

  //============================================================
  // MANIÈRE
  //============================================================

  const manieres = [
    "violemment",
    "violent",
    "violente",
    "rapidement",
    "brutalement",
    "brutal",
    "brutale",
    "direct",
    "directe",
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

  for (const mot of manieres) {

    if (
      normal.includes(
        neoNormaliserMotLocal(mot)
      )
    ) {

      maniere = mot;
      break;

    }

  }

  //============================================================
  // STRUCTURE
  //============================================================

  const structure = {
    sujet: acteur ? "S" : null,
    verbe: action.action ? "V" : null,
    objet: cible ? "O" : null,
    complement:
      (
        distance.valeur !== null ||
        hauteur.valeur !== null ||
        maniere ||
        vitesse.valeur ||
        partieCorps
      )
        ? "C"
        : null
  };

  return {

    texte,

    acteur,

    sujet: acteur,

    action:
      action.action,

    categorie:
      action.categorie,

    famille:
      action.famille,

    cible,

    maniere,

    vitesse:
      vitesse.valeur,

    distance:
      distance.valeur,

    distanceUnite:
      distance.unite,

    hauteur:
      hauteur.valeur,

    hauteurUnite:
      hauteur.unite,

    direction:
      trajectoire,

    trajectoire,

    partieCorps,

    modele:
      modele.modele,

    score:
      modele.score,

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
