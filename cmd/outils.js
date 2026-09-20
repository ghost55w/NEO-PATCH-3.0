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

  const normal =
    String(texte || "")
      .toLowerCase()
      .replace(/,/g, ".")
      .replace(/\s+/g, " ")
      .trim();

  //============================================================
  // 📏 DISTANCE EXPLICITE
  //============================================================

  const patterns = [

    // "sur une distance de 5m"
    /sur\s+(?:une\s+)?distance\s+de\s+(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu,

    // "sur 5m"
    /sur\s+(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu,

    // "sur une distance de 5 mètres"
    /distance\s+de\s+(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu,

    // "parcourir 5m"
    /(?:parcourir|parcourt|parcourant|avance|avancer|court|courir|fonce|foncer)\s+(?:sur\s+)?(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu

  ];

  for (
    const pattern of patterns
  ) {

    const match =
      normal.match(pattern);

    if (!match) {
      continue;
    }

    const valeur =
      Number(
        match[1]
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

  //============================================================
  // 📏 FALLBACK
  //============================================================
  //
  // Seulement s'il n'existe aucun contexte "hauteur",
  // "courbe", etc.
  //============================================================

  const matches = [
    ...normal.matchAll(
      /(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/giu
    )
  ];

  for (
    const match of matches
  ) {

    const debut =
      Math.max(
        0,
        match.index - 30
      );

    const contexte =
      normal.slice(
        debut,
        match.index
      );

    // Ne pas prendre une hauteur
    if (
      /\b(?:hauteur|haut|altitude)\s*(?:de|à)?\s*$/iu.test(
        contexte
      )
    ) {
      continue;
    }

    // Ne pas prendre une courbe
    if (
      /\b(?:courbe|courbure)\s*(?:de|à)?\s*$/iu.test(
        contexte
      )
    ) {
      continue;
    }

    const valeur =
      Number(
        match[1]
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

  return {
    valeur: null,
    unite: null
  };

}

//==============================================================
// 📏 HAUTEUR
//==============================================================
function neoDetecterHauteur(texte) {

  const t =
    String(texte || "")
      .replace(/,/g, ".")
      .replace(/\s+/g, " ")
      .trim();

  //============================================================
  // 1️⃣ "hauteur de 10m"
  //    "hauteur : 10m"
  //    "hauteur 10m"
  //============================================================

  const regexHauteurAvant =
    /(?:hauteur|haut(?:eur)?)\s*(?:de|à|:)?\s*(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu;

  let match =
    t.match(
      regexHauteurAvant
    );

  if (match) {

    return {
      valeur:
        Number(match[1]),

      unite:
        /cm|centim/i.test(match[2])
          ? "cm"
          : "m"
    };

  }

  //============================================================
  // 2️⃣ "5m de hauteur"
  //    "5 mètres de haut"
  //============================================================

  const regexHauteurApres =
    /(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)\s+(?:de\s+)?(?:hauteur|haut(?:eur)?)/iu;

  match =
    t.match(
      regexHauteurApres
    );

  if (match) {

    return {
      valeur:
        Number(match[1]),

      unite:
        /cm|centim/i.test(match[2])
          ? "cm"
          : "m"
    };

  }

  //============================================================
  // 3️⃣ "monte de 5m"
  //    "montant de 5m"
  //    "monte 5m"
  //============================================================

  const regexMontee =
    /(?:monte(?:r)?|montant)\s*(?:de|à)?\s*(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu;

  match =
    t.match(
      regexMontee
    );

  if (match) {

    return {
      valeur:
        Number(match[1]),

      unite:
        /cm|centim/i.test(match[2])
          ? "cm"
          : "m"
    };

  }

  //============================================================
  // 4️⃣ "saute de 5m"
  //    "saute à 5m"
  //============================================================

  const regexSaut =
    /(?:saut(?:e|er|ant)?|bond(?:it|ir|issant)?)\s*(?:de|à)?\s*(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)/iu;

  match =
    t.match(
      regexSaut
    );

  if (match) {

    return {
      valeur:
        Number(match[1]),

      unite:
        /cm|centim/i.test(match[2])
          ? "cm"
          : "m"
    };

  }

  //============================================================
  // 5️⃣ "5m en l'air"
  //============================================================

  const regexAir =
    /(\d+(?:\.\d+)?)\s*(mètres?|metres?|m|cm|centimètres?|centimetres?)\s+(?:en\s+l['’]air|dans\s+l['’]air)/iu;

  match =
    t.match(
      regexAir
    );

  if (match) {

    return {
      valeur:
        Number(match[1]),

      unite:
        /cm|centim/i.test(match[2])
          ? "cm"
          : "m"
    };

  }

  return {
    valeur: null,
    unite: null
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
// 🧭 TRAJECTOIRE
//==============================================================
function neoDetecterTrajectoire(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  //============================================================
  // 🌀 CIRCULAIRE
  //============================================================
  if (
    /\bcirculaire\b/iu.test(t) ||
    /\bcirculairement\b/iu.test(t) ||
    /\ben\s+cercle\b/iu.test(t) ||
    /\ben\s+arc\b/iu.test(t)
  ) {
    return "circulaire";
  }

  //============================================================
  // 🌀 ZIG-ZAG
  //============================================================
  if (
    /\bzig[\s-]?zag\b/iu.test(t) ||
    /\bzigzaguant\b/iu.test(t) ||
    /\ben\s+zig[\s-]?zag\b/iu.test(t)
  ) {
    return "zig_zag";
  }

  //============================================================
  // ➡️ FRONTALE
  //============================================================
  if (
    /\bfrontal\b/iu.test(t) ||
    /\bfrontale\b/iu.test(t) ||
    /\bfrontalement\b/iu.test(t) ||
    /\bde\s+face\b/iu.test(t) ||
    /\ben\s+ligne\s+droite\b/iu.test(t) ||
    /\ben\s+ligne\s+directe\b/iu.test(t)
  ) {
    return "frontale";
  }

  //============================================================
  // ↔️ LATÉRALE
  //============================================================
  if (
    /\blatéral(?:e|ement)?\s+(?:gauche|à\s+gauche)\b/iu.test(t) ||
    /\b(?:côté|cote)\s+gauche\b/iu.test(t) ||
    /\b(?:sur|vers)\s+le\s+côté\s+gauche\b/iu.test(t)
  ) {
    return "laterale_gauche";
  }

  if (
    /\blatéral(?:e|ement)?\s+(?:droit|à\s+droite)\b/iu.test(t) ||
    /\b(?:côté|cote)\s+droit\b/iu.test(t) ||
    /\b(?:sur|vers)\s+le\s+côté\s+droit\b/iu.test(t)
  ) {
    return "laterale_droite";
  }

  if (
    /\blatéral\b/iu.test(t) ||
    /\blaterale\b/iu.test(t) ||
    /\blatéralement\b/iu.test(t) ||
    /\blateralement\b/iu.test(t)
  ) {
    return "laterale";
  }

  //============================================================
  // ↗️ DIAGONALE
  //============================================================
  if (
    /\bdiagonal(?:e|ement)?\b/iu.test(t)
  ) {
    return "diagonale";
  }

  //============================================================
  // ⬅️ ARRIÈRE
  //============================================================
  if (
    /\barrière\b/iu.test(t) ||
    /\ben\s+arrière\b/iu.test(t) ||
    /\bvers\s+l['’]arrière\b/iu.test(t) ||
    /\bvers\s+arrière\b/iu.test(t) ||
    /\brecule\b/iu.test(t) ||
    /\ben\s+reculant\b/iu.test(t)
  ) {
    return "arriere";
  }

  //============================================================
  // ⬆️ AÉRIENNE
  //============================================================
  if (
    /\ben\s+l['’]air\b/iu.test(t) ||
    /\baérien(?:ne)?\b/iu.test(t) ||
    /\baérienne\b/iu.test(t) ||
    /\bsaut(?:e|ant)?\b/iu.test(t) ||
    /\bbond(?:it|issant)?\b/iu.test(t)
  ) {
    return "aerienne";
  }

  //============================================================
  // ❌ IMPORTANT
  //
  // "vers" n'est PAS une trajectoire.
  //
  // Exemple :
  // "Yamato court vers Naruto"
  //
  // vers = direction
  // Naruto = cible
  // trajectoire = à déterminer séparément
  //============================================================

  return null;
}

//==============================================================
// 🧭 DIRECTION
//==============================================================
function neoDetecterDirection(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  //============================================================
  // ⬆️ AVANT
  //============================================================
  if (
    /\bvers\s+l['’]avant\b/iu.test(t) ||
    /\bvers\s+avant\b/iu.test(t) ||
    /\ben\s+avant\b/iu.test(t) ||
    /\bdroit\s+vers\b/iu.test(t) ||
    /\bvers\b/iu.test(t)
  ) {
    return "avant";
  }

  //============================================================
  // ⬇️ ARRIÈRE
  //============================================================
  if (
    /\bvers\s+l['’]arrière\b/iu.test(t) ||
    /\bvers\s+arrière\b/iu.test(t) ||
    /\ben\s+arrière\b/iu.test(t) ||
    /\ben\s+reculant\b/iu.test(t)
  ) {
    return "arriere";
  }

  //============================================================
  // ⬅️ GAUCHE
  //============================================================
  if (
    /\bvers\s+la\s+gauche\b/iu.test(t) ||
    /\bà\s+gauche\b/iu.test(t) ||
    /\bgauche\b/iu.test(t)
  ) {
    return "gauche";
  }

  //============================================================
  // ➡️ DROITE
  //============================================================
  if (
    /\bvers\s+la\s+droite\b/iu.test(t) ||
    /\bà\s+droite\b/iu.test(t) ||
    /\bdroite\b/iu.test(t)
  ) {
    return "droite";
  }

  return null;
}

//==============================================================
// 🎯 INTENTION
//==============================================================
function neoDetecterIntention(texte) {

  const t =
    neoNormaliserTexteLocal(
      texte
    ).toLowerCase();

  //============================================================
  // 🎯 ATTEINDRE / REJOINDRE
  //============================================================
  if (
    /\bpour\s+l['’]atteindre\b/iu.test(t) ||
    /\bpour\s+atteindre\b/iu.test(t) ||
    /\bpour\s+le\s+rejoindre\b/iu.test(t) ||
    /\bpour\s+la\s+rejoindre\b/iu.test(t) ||
    /\bpour\s+rejoindre\b/iu.test(t)
  ) {
    return "atteindre";
  }

  //============================================================
  // 🎯 INTERCEPTER
  //============================================================
  if (
    /\bpour\s+l['’]intercepter\b/iu.test(t) ||
    /\bpour\s+intercepter\b/iu.test(t)
  ) {
    return "intercepter";
  }

  //============================================================
  // 🎯 RAPPROCHER
  //============================================================
  if (
    /\bpour\s+se\s+rapprocher\b/iu.test(t) ||
    /\bafin\s+de\s+se\s+rapprocher\b/iu.test(t)
  ) {
    return "rapprocher";
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

    // Articles / déterminants
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

    // Directions
    "avant",
    "arrière",
    "arriere",
    "gauche",
    "droite",

    // Articles isolés pouvant apparaître
    // dans "l'avant" / "l'arrière"
    "l",

    // Unités
    "m",
    "cm",
    "km",
    "mètre",
    "mètres",
    "metre",
    "metres"
  ]);

  //============================================================
  // 🚫 EXPRESSIONS QUI NE SONT PAS DES CIBLES
  //============================================================

  const expressionsDirection = [
    /\bvers\s+l['’]?\s*avant\b/iu,
    /\bvers\s+l['’]?\s*arrière\b/iu,
    /\bvers\s+l['’]?\s*arriere\b/iu,

    /\bvers\s+avant\b/iu,
    /\bvers\s+arrière\b/iu,
    /\bvers\s+arriere\b/iu,

    /\bvers\s+la\s+gauche\b/iu,
    /\bvers\s+la\s+droite\b/iu,
    /\bvers\s+gauche\b/iu,
    /\bvers\s+droite\b/iu
  ];

  //============================================================
  // 🎯 PATTERNS DE CIBLE
  //============================================================

  const patterns = [

    // "visant Sarutobi"
    /\bvisant\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*)/iu,

    // "visant le visage de Sarutobi"
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

  //============================================================
  // 🔎 ANALYSE DES PATTERNS
  //============================================================

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

    //==========================================================
    // 🚫 CAS "vers l'avant", "vers la gauche", etc.
    //==========================================================

    if (
      pattern.source.includes("\\bvers\\s+") &&
      expressionsDirection.some(
        expression =>
          expression.test(t)
      )
    ) {
      continue;
    }

    //==========================================================
    // 🚫 MOT EXCLU
    //==========================================================

    if (
      motsExclus.has(
        motNormalise
      )
    ) {
      continue;
    }

    //==========================================================
    // 🚫 NOMBRE / DISTANCE
    //==========================================================

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
// 👤 ACTEUR / SUJET
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
  // Récupération des actions connues
  // ------------------------------------------------------------

  const modeles =
    neoGetModeles();

  const actionsConnues =
    new Set();

  // ------------------------------------------------------------
  // Actions présentes dans les modèles
  // ------------------------------------------------------------

  for (
    const modele of modeles
  ) {

    if (
      !modele ||
      typeof modele !== "object"
    ) {
      continue;
    }

    const exemples =
      Array.isArray(modele.exemples)
        ? modele.exemples
        : [];

    for (
      const exemple of exemples
    ) {

      const mots =
        String(exemple)
          .toLowerCase()
          .match(
            /[a-zà-ÿ][a-zà-ÿ0-9_-]*/giu
          ) || [];

      for (
        const mot of mots
      ) {

        actionsConnues.add(
          mot.toLowerCase()
        );

      }

    }

  }

  // ------------------------------------------------------------
  // Actions principales NeoAI
  // ------------------------------------------------------------

  const actions =
    Array.isArray(
      NeoAI?.NEO_ACTIONS
    )
      ? NeoAI.NEO_ACTIONS
      : [];

  for (
    const action of actions
  ) {

    if (
      typeof action === "string"
    ) {

      actionsConnues.add(
        action.toLowerCase()
      );

    }

  }

  // ------------------------------------------------------------
  // Liste des mots
  // ------------------------------------------------------------

  const mots =
    t.match(
      /[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*/gu
    ) || [];

  // ------------------------------------------------------------
  // RÈGLE PRINCIPALE
  //
  // Le sujet est TOUJOURS le nom qui fait l'action.
  //
  // Exemple :
  //
  // "Début du combat, Yamato fonce vers Naruto"
  //
  //            ↑
  //          sujet
  //
  // "Yamato fonce"
  //
  // => Yamato
  //
  // Tout ce qui précède "Yamato" est ignoré.
  // ------------------------------------------------------------

  for (
    let i = 0;
    i < mots.length - 1;
    i++
  ) {

    const candidat =
      mots[i];

    const action =
      mots[i + 1];

    // ----------------------------------------------------------
    // Le candidat doit être un nom propre
    // ----------------------------------------------------------

    if (
      !/^[A-ZÀ-Ý]/u.test(candidat)
    ) {
      continue;
    }

    // ----------------------------------------------------------
    // Le mot suivant doit être une action connue
    // ----------------------------------------------------------

    if (
      !actionsConnues.has(
        action.toLowerCase()
      )
    ) {
      continue;
    }

    // ----------------------------------------------------------
    // C'est le sujet :
    // le nom qui effectue l'action.
    // ----------------------------------------------------------

    return candidat;

  }

  // ------------------------------------------------------------
  // Recherche plus souple :
  //
  // Permet de gérer une action composée ou une formulation
  // où plusieurs mots séparent légèrement le sujet de l'action.
  //
  // Exemple :
  //
  // "Yamato se met à foncer"
  //
  // ------------------------------------------------------------

  for (
    let i = 0;
    i < mots.length - 1;
    i++
  ) {

    const candidat =
      mots[i];

    if (
      !/^[A-ZÀ-Ý]/u.test(candidat)
    ) {
      continue;
    }

    // Cherche une action dans les 3 mots suivants maximum.
    for (
      let j = i + 1;
      j <= Math.min(
        i + 3,
        mots.length - 1
      );
      j++
    ) {

      const mot =
        mots[j].toLowerCase();

      if (
        actionsConnues.has(mot)
      ) {

        return candidat;

      }

    }

  }

  // ------------------------------------------------------------
  // Dernier recours :
  // contexte précédent.
  //
  // IMPORTANT :
  // On ne prend JAMAIS arbitrairement le premier mot du texte.
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
        NeoAI?.MODELES_ACTIONS,

        // IMPORTANT :
        // Ancienne source éventuelle
        typeof NEO_ACTIONS_COMBAT !== "undefined"
            ? NEO_ACTIONS_COMBAT
            : null
    ];


    for (const source of sources) {

        if (!source) {
            continue;
        }


        // ============================================================
        // 📦 SOURCE SOUS FORME DE TABLEAU
        // ============================================================

        if (Array.isArray(source)) {

            const modeles = [];

            for (const modele of source) {

                if (
                    !modele ||
                    typeof modele !== "object"
                ) {
                    continue;
                }

                modeles.push({
                    ...modele,

                    action:
                        modele.action ||
                        modele.nomAction ||
                        null
                });
            }


            if (modeles.length) {

                console.log(
                    "📚 [NeoAI MODELES] Source tableau :",
                    modeles.length
                );

                return modeles;
            }

            continue;
        }


        // ============================================================
        // 📚 SOURCE SOUS FORME D'OBJET
        // ============================================================

        if (
            typeof source === "object" &&
            !Array.isArray(source)
        ) {

            const modeles = [];


            // ========================================================
            // 🔎 PARCOURS DES CATÉGORIES
            //
            // Nouvelle architecture :
            //
            // NEO_ACTION_MODELS = {
            //
            //     deplacement: {
            //
            //         categorie: "deplacement",
            //
            //         course: [
            //             COURSE_001,
            //             COURSE_002
            //         ],
            //
            //         saut: [
            //             SAUT_001
            //         ]
            //     }
            // }
            //
            // On doit donc descendre :
            //
            // CATÉGORIE
            //      ↓
            // ACTION
            //      ↓
            // MODÈLE
            // ========================================================

            for (
                const [categorie, groupe]
                of Object.entries(source)
            ) {

                if (
                    !groupe ||
                    typeof groupe !== "object" ||
                    Array.isArray(groupe)
                ) {
                    continue;
                }


                // ====================================================
                // 🔎 PARCOURS DES ACTIONS
                // ====================================================

                for (
                    const [actionCanonique, valeur]
                    of Object.entries(groupe)
                ) {

                    // ------------------------------------------------
                    // "categorie" est une propriété descriptive,
                    // pas une action.
                    // ------------------------------------------------

                    if (
                        actionCanonique === "categorie"
                    ) {
                        continue;
                    }


                    // ------------------------------------------------
                    // ACTION → plusieurs modèles
                    //
                    // Exemple :
                    //
                    // course: [
                    //     COURSE_001,
                    //     COURSE_002
                    // ]
                    // ------------------------------------------------

                    if (Array.isArray(valeur)) {

                        for (const modele of valeur) {

                            if (
                                !modele ||
                                typeof modele !== "object"
                            ) {
                                continue;
                            }


                            modeles.push({

                                // On conserve toutes les
                                // propriétés du modèle
                                ...modele,

                                // ==================================================
                                // ACTION CANONIQUE
                                //
                                // Priorité au nom de l'action dans
                                // la hiérarchie.
                                //
                                // Exemple :
                                //
                                // deplacement
                                //      ↓
                                // course
                                //
                                // devient :
                                //
                                // action: "course"
                                // ==================================================

                                action:
                                    actionCanonique,

                                // ==================================================
                                // CATÉGORIE
                                //
                                // Exemple :
                                //
                                // categorie: "deplacement"
                                // ==================================================

                                categorie:
                                    modele.categorie ||
                                    categorie
                            });
                        }

                        continue;
                    }


                    // ------------------------------------------------
                    // ACTION → un seul modèle
                    // ------------------------------------------------

                    if (
                        valeur &&
                        typeof valeur === "object"
                    ) {

                        modeles.push({

                            ...valeur,

                            action:
                                actionCanonique,

                            categorie:
                                valeur.categorie ||
                                categorie
                        });
                    }
                }
            }


            // ========================================================
            // ✅ MODÈLES TROUVÉS
            // ========================================================

            if (modeles.length) {

                console.log(
                    "📚 [NeoAI MODELES] Source hiérarchique :",
                    modeles.length
                );

                console.log(
                    "🎯 [NeoAI CATÉGORIES DISPONIBLES] :",
                    [
                        ...new Set(
                            modeles
                                .map(
                                    modele =>
                                        modele.categorie
                                )
                                .filter(Boolean)
                        )
                    ]
                );

                console.log(
                    "🎯 [NeoAI ACTIONS CANONIQUES] :",
                    [
                        ...new Set(
                            modeles
                                .map(
                                    modele =>
                                        modele.action
                                )
                                .filter(Boolean)
                        )
                    ]
                );

                return modeles;
            }


            // ========================================================
            // 🔄 COMPATIBILITÉ AVEC ANCIEN FORMAT
            //
            // Exemple :
            //
            // {
            //     course: [ ... ],
            //     saut: [ ... ]
            // }
            //
            // Si l'objet n'a pas de sous-catégorie, on le traite
            // directement comme un groupe d'actions.
            // ========================================================

            const anciensModeles = [];


            for (
                const [actionCanonique, valeur]
                of Object.entries(source)
            ) {

                if (actionCanonique === "categorie") {
                    continue;
                }


                if (Array.isArray(valeur)) {

                    for (const modele of valeur) {

                        if (
                            !modele ||
                            typeof modele !== "object"
                        ) {
                            continue;
                        }

                        anciensModeles.push({

                            ...modele,

                            action:
                                modele.action ||
                                actionCanonique,

                            categorie:
                                modele.categorie ||
                                null
                        });
                    }

                    continue;
                }


                if (
                    valeur &&
                    typeof valeur === "object"
                ) {

                    anciensModeles.push({

                        ...valeur,

                        action:
                            valeur.action ||
                            actionCanonique,

                        categorie:
                            valeur.categorie ||
                            null
                    });
                }
            }


            if (anciensModeles.length) {

                console.log(
                    "📚 [NeoAI MODELES] Ancien format :",
                    anciensModeles.length
                );

                console.log(
                    "🎯 [NeoAI ACTIONS DISPONIBLES] :",
                    [
                        ...new Set(
                            anciensModeles
                                .map(
                                    modele =>
                                        modele.action
                                )
                                .filter(Boolean)
                        )
                    ]
                );

                return anciensModeles;
            }
        }
    }


    // ================================================================
    // ❌ AUCUN MODÈLE
    // ================================================================

    console.log(
        "⚠️ [NeoAI MODELES] Aucun modèle trouvé."
    );

    return [];
}


//==============================================================
// 🧩 COMPARAISON SÉMANTIQUE D'UN MODÈLE
//==============================================================
//
// 🎯 RÔLES :
//
// EXEMPLES  = reconnaissance du modèle
// STRUCTURE = validation de l'action
//
// Le modèle est choisi principalement grâce à la phrase
// d'exemple qui ressemble le plus au texte reçu.
//
// 30% = candidat
// 70% = correspondance forte
//==============================================================

function neoCalculerSimilariteModele(
    texte,
    modele,
    analyse = {}
) {

    if (!modele) {
        return 0;
    }

    //============================================================
    // 🔧 OUTILS
    //============================================================

    const normaliser = valeur => {

        if (
            valeur === null ||
            valeur === undefined
        ) {
            return "";
        }

        return neoNormaliserTexteLocal(
            String(valeur)
        )
            .toLowerCase()
            .replace(/[.,!?;:()[\]{}"'`]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const normaliserMot = valeur => {

        return neoNormaliserMotLocal(
            String(valeur || "")
        )
            .toLowerCase()
            .trim();

    };

    const texteNormalise =
        normaliser(texte);

    //============================================================
    // 📦 VALEURS ANALYSÉES
    //============================================================

    const actionAnalysee =
        typeof analyse.action === "object"
            ? (
                analyse.action.action ||
                analyse.action.verbe ||
                ""
            )
            : (
                analyse.action ||
                ""
            );

    const valeurs = {

        SUJET:
            analyse.acteur ||
            analyse.sujet ||
            null,

        ACTION:
            actionAnalysee,

        CIBLE:
            analyse.cible ||
            null,

        MEMBRE:
            analyse.membre ||
            null,

        PARTIE_CORPS:
            analyse.partieCorps ||
            null,

        MANIERE:
            analyse.maniere ||
            null,

        DISTANCE:
            analyse.distance ??
            null,

        HAUTEUR:
            analyse.hauteur ??
            null,

        VITESSE:
            analyse.vitesse ??
            null,

        DIRECTION:
            analyse.direction ||
            null,

        TRAJECTOIRE:
            analyse.trajectoire ||
            null,

        COURBE:
            analyse.courbe ??
            null,

        INTENTION:
            analyse.intention ||
            null

    };

    //============================================================
    // 🧠 SYNONYMES → ACTION CANONIQUE
    //============================================================

    const synonymes =
        NeoAI?.NEO_SYNONYMES ||
        {};

    const canoniserMot =
        mot => {

            const recherche =
                normaliserMot(mot);

            if (!recherche) {
                return "";
            }

            for (
                const groupe of Object.values(
                    synonymes
                )
            ) {

                if (
                    !groupe ||
                    typeof groupe !== "object" ||
                    Array.isArray(groupe)
                ) {
                    continue;
                }

                for (
                    const [canonique, aliases]
                    of Object.entries(groupe)
                ) {

                    const canoniqueNormalise =
                        normaliserMot(
                            canonique
                        );

                    if (
                        recherche ===
                        canoniqueNormalise
                    ) {
                        return canoniqueNormalise;
                    }

                    if (
                        Array.isArray(aliases) &&
                        aliases.some(
                            alias =>
                                normaliserMot(alias) ===
                                recherche
                        )
                    ) {
                        return canoniqueNormalise;
                    }

                }

            }

            return recherche;

        };

    //============================================================
    // 🚫 MOTS VIDES
    //============================================================

    const motsVides = new Set([

        "a",
        "au",
        "aux",
        "de",
        "des",
        "du",
        "en",
        "et",
        "la",
        "le",
        "les",
        "un",
        "une",
        "vers",
        "pour",
        "sur",
        "dans",
        "avec",
        "par",
        "se",
        "sa",
        "son",
        "ses",
        "leur",
        "leurs",
        "à",
        "d",
        "l"

    ]);

    //============================================================
    // 🔎 TOKENISATION
    //============================================================

    const extraireTokens =
        valeur => {

            return normaliser(valeur)
                .split(/\s+/u)
                .map(
                    mot =>
                        mot.replace(
                            /[^a-z0-9_-]/giu,
                            ""
                        )
                )
                .filter(Boolean);

        };

    //============================================================
    // 🧠 NORMALISATION INTELLIGENTE D'UNE PHRASE
    //============================================================

    const preparerPhrase =
        valeur => {

            const tokens =
                extraireTokens(valeur);

            const resultat = [];

            for (
                const token of tokens
            ) {

                if (
                    motsVides.has(token)
                ) {
                    continue;
                }

                const canonique =
                    canoniserMot(token);

                if (
                    canonique
                ) {

                    resultat.push(
                        canonique
                    );

                }

            }

            return resultat;

        };

    //============================================================
    // 🎯 TOKENS DU TEXTE REÇU
    //============================================================

    const tokensTexte =
        preparerPhrase(
            texteNormalise
        );

    const ensembleTexte =
        new Set(
            tokensTexte
        );

    //============================================================
    // 🎯 MOTS IMPORTANTS DÉTECTÉS PAR NEOAI
    //============================================================

    const elementsImportants = [];

    const ajouterImportant =
        valeur => {

            if (
                valeur === null ||
                valeur === undefined ||
                valeur === ""
            ) {
                return;
            }

            const morceaux =
                preparerPhrase(
                    String(valeur)
                );

            for (
                const mot of morceaux
            ) {

                if (
                    !elementsImportants.includes(
                        mot
                    )
                ) {

                    elementsImportants.push(
                        mot
                    );

                }

            }

        };

    ajouterImportant(
        valeurs.TRAJECTOIRE
    );

    ajouterImportant(
        valeurs.DIRECTION
    );

    ajouterImportant(
        valeurs.VITESSE
    );

    ajouterImportant(
        valeurs.MANIERE
    );

    ajouterImportant(
        valeurs.INTENTION
    );

    ajouterImportant(
        valeurs.DISTANCE
    );

    ajouterImportant(
        valeurs.HAUTEUR
    );

    ajouterImportant(
        valeurs.ACTION
    );

    //============================================================
    // 📚 EXEMPLES DU MODÈLE
    //============================================================

    const exemples =
        Array.isArray(
            modele.exemples
        )
            ? modele.exemples.filter(
                exemple =>
                    typeof exemple === "string" &&
                    exemple.trim() !== ""
            )
            : [];

    //============================================================
    // ❌ MODÈLE SANS EXEMPLES
    //============================================================

    if (
        !exemples.length
    ) {

        console.log(
            "⚠️ [NeoAI EXEMPLES] Aucun exemple pour :",
            modele.id
        );

        return 0;

    }

    //============================================================
    // 🧠 COMPARAISON D'UN EXEMPLE
    //============================================================

    const calculerScoreExemple =
        exemple => {

            const tokensExemple =
                preparerPhrase(
                    exemple
                );

            if (
                !tokensExemple.length
            ) {
                return 0;
            }

            const ensembleExemple =
                new Set(
                    tokensExemple
                );

            //====================================================
            // 🔹 1. SIMILARITÉ DES MOTS
            //====================================================

            let communs = 0;

            for (
                const mot of ensembleTexte
            ) {

                if (
                    ensembleExemple.has(mot)
                ) {

                    communs++;

                }

            }

            const union =
                new Set([
                    ...ensembleTexte,
                    ...ensembleExemple
                ]).size;

            const scoreMots =
                union > 0
                    ? (
                        communs /
                        union
                    ) * 100
                    : 0;

            //====================================================
            // 🔹 2. MOTS IMPORTANTS
            //====================================================

            let importantsTrouves = 0;

            for (
                const mot of elementsImportants
            ) {

                if (
                    ensembleExemple.has(mot)
                ) {

                    importantsTrouves++;

                }

            }

            const scoreImportants =
                elementsImportants.length > 0
                    ? (
                        importantsTrouves /
                        elementsImportants.length
                    ) * 100
                    : 0;

            //====================================================
            // 🔹 3. PHRASE / SÉQUENCE
            //====================================================

            let sequencesCommunes = 0;

            for (
                let i = 0;
                i < tokensTexte.length - 1;
                i++
            ) {

                const a =
                    tokensTexte[i];

                const b =
                    tokensTexte[i + 1];

                for (
                    let j = 0;
                    j < tokensExemple.length - 1;
                    j++
                ) {

                    if (
                        tokensExemple[j] === a &&
                        tokensExemple[j + 1] === b
                    ) {

                        sequencesCommunes++;
                        break;

                    }

                }

            }

            const totalSequences =
                Math.max(
                    tokensTexte.length - 1,
                    1
                );

            const scoreSequence =
                (
                    sequencesCommunes /
                    totalSequences
                ) * 100;

            //====================================================
            // 🏆 SCORE DE L'EXEMPLE
            //====================================================
            //
            // Les mots importants ont le plus de poids.
            // La ressemblance générale vient ensuite.
            // La séquence départage les phrases proches.
            //====================================================

            const score =
                Math.round(

                    (
                        scoreImportants *
                        0.50
                    ) +

                    (
                        scoreMots *
                        0.35
                    ) +

                    (
                        scoreSequence *
                        0.15
                    )

                );

            return Math.min(
                100,
                score
            );

        };

    //============================================================
    // 📊 COMPARER TOUS LES EXEMPLES
    //============================================================

    let meilleurExemple =
        null;

    let meilleurScoreExemple =
        0;

    for (
        const exemple of exemples
    ) {

        const scoreExemple =
            calculerScoreExemple(
                exemple
            );

        console.log(
            "📝 [NeoAI EXEMPLE]",
            modele.id,
            "|",
            scoreExemple + "%",
            "|",
            exemple
        );

        if (
            scoreExemple >
            meilleurScoreExemple
        ) {

            meilleurScoreExemple =
                scoreExemple;

            meilleurExemple =
                exemple;

        }

    }

    //============================================================
    // 📐 STRUCTURE
    //
    // Elle ne sert PLUS à choisir le modèle.
    // Elle sert uniquement à savoir si le modèle retenu
    // pourra ensuite être validé.
    //============================================================

    const structureModele =
        Array.isArray(
            modele.structure
        )
            ? modele.structure
            : [];

    let attendus = 0;
    let trouves = 0;

    const slotsTrouves = [];
    const slotsManquants = [];

    const existe =
        valeur => {

            if (
                valeur === null ||
                valeur === undefined
            ) {
                return false;
            }

            return String(
                valeur
            ).trim() !== "";

        };

    const normaliserSlot =
        valeur =>
            normaliserMot(
                valeur
            )
                .toUpperCase()
                .replace(
                    /\s+/g,
                    "_"
                );

    for (
        const element of structureModele
    ) {

        const slot =
            normaliserSlot(
                element
            );

        if (!slot) {
            continue;
        }

        attendus++;

        let valeur =
            null;

        switch (slot) {

            case "SUJET":
            case "ACTEUR":
                valeur =
                    valeurs.SUJET;
                break;

            case "ACTION":
            case "VERBE":
                valeur =
                    valeurs.ACTION;
                break;

            case "CIBLE":
            case "OBJET":
                valeur =
                    valeurs.CIBLE;
                break;

            case "MEMBRE":
                valeur =
                    valeurs.MEMBRE;
                break;

            case "PARTIE_CORPS":
            case "PARTIECORPS":
                valeur =
                    valeurs.PARTIE_CORPS;
                break;

            case "MANIERE":
                valeur =
                    valeurs.MANIERE;
                break;

            case "DISTANCE":
                valeur =
                    valeurs.DISTANCE;
                break;

            case "HAUTEUR":
                valeur =
                    valeurs.HAUTEUR;
                break;

            case "VITESSE":
                valeur =
                    valeurs.VITESSE;
                break;

            case "DIRECTION":
                valeur =
                    valeurs.DIRECTION;
                break;

            case "TRAJECTOIRE":
                valeur =
                    valeurs.TRAJECTOIRE;
                break;

            case "COURBE":
                valeur =
                    valeurs.COURBE;
                break;

            case "INTENTION":
                valeur =
                    valeurs.INTENTION;
                break;

            default:
                valeur = null;
                break;

        }

        if (
            existe(valeur)
        ) {

            trouves++;

            slotsTrouves.push({
                slot,
                valeur
            });

        } else {

            slotsManquants.push(
                slot
            );

        }

    }

    const scoreStructure =
        attendus > 0
            ? Math.round(
                (
                    trouves /
                    attendus
                ) * 100
            )
            : 0;

    const structureComplete =
        slotsManquants.length === 0;

    //============================================================
    // 📦 INFORMATIONS POUR NEORECONNAITREMODELE
    //============================================================

    analyse.scoreStructure =
        scoreStructure;

    analyse.slotsTrouves =
        slotsTrouves;

    analyse.slotsManquants =
        slotsManquants;

    analyse.structureComplete =
        structureComplete;

    analyse.scoreExemple =
        meilleurScoreExemple;

    analyse.meilleurExemple =
        meilleurExemple;

    //============================================================
    // 🎯 SCORE FINAL
    //
    // IMPORTANT :
    //
    // Le score final représente maintenant principalement
    // la ressemblance avec les exemples.
    //
    // La structure ne sert plus à départager COURSE_001,
    // COURSE_004, etc.
    //============================================================

    const scoreFinal =
        meilleurScoreExemple;

    console.log(
        "🧩 [NeoAI STRUCTURE]",
        modele.id,
        "|",
        `${trouves}/${attendus}`,
        "|",
        `${scoreStructure}%`,
        "| Manquants:",
        slotsManquants
    );

    console.log(
        "📝 [NeoAI MEILLEUR EXEMPLE]",
        modele.id,
        "|",
        `${meilleurScoreExemple}%`,
        "|",
        meilleurExemple
    );

    console.log(
        "📊 [NeoAI SCORE MODÈLE]",
        modele.id,
        "|",
        `${scoreFinal}%`
    );

    return Math.min(
        100,
        scoreFinal
    );
}
            
//==============================================================
// 📚 RECONNAISSANCE DU MODÈLE STRUCTUREL
//==============================================================

function neoReconnaitreModele(
    texte,
    analyse = {}
) {

    const tousLesModeles =
        neoGetModeles();

    if (
        !Array.isArray(tousLesModeles) ||
        !tousLesModeles.length
    ) {

        console.log(
            "⚠️ [NeoAI MODEL] Aucun modèle disponible."
        );

        return {

            modele: null,
            score: 0,
            scoreStructure: 0,
            structureComplete: false,
            slotsTrouves: [],
            slotsManquants: [],
            actionCanonique:
                analyse?.action || null,
            categorie:
                analyse?.categorie || null,
            structure: []

        };

    }

    //============================================================
    // 🎯 ACTION BRUTE
    //============================================================

    const actionDetectee =
        analyse?.action ||
        neoDetecterAction(
            texte
        );

    const actionBrute =
        typeof actionDetectee === "string"
            ? actionDetectee
            : (
                actionDetectee?.action ||
                actionDetectee?.verbe ||
                ""
            );

    const actionBruteNormalisee =
        neoNormaliserMotLocal(
            String(actionBrute)
        )
            .toLowerCase()
            .trim();

    //============================================================
    // 🧠 SYNONYMES
    //============================================================

    let actionCanonique =
        actionBruteNormalisee;

    const synonymes =
        NeoAI?.NEO_SYNONYMES ||
        {};

    for (
        const [categorie, groupe]
        of Object.entries(synonymes)
    ) {

        if (
            !groupe ||
            typeof groupe !== "object" ||
            Array.isArray(groupe)
        ) {
            continue;
        }

        for (
            const [canonique, aliases]
            of Object.entries(groupe)
        ) {

            const canoniqueNormalisee =
                neoNormaliserMotLocal(
                    String(canonique)
                )
                    .toLowerCase()
                    .trim();

            if (
                actionBruteNormalisee ===
                canoniqueNormalisee
            ) {

                actionCanonique =
                    canonique;

                break;

            }

            if (
                Array.isArray(aliases) &&
                aliases.some(
                    alias =>
                        neoNormaliserMotLocal(
                            String(alias)
                        )
                            .toLowerCase()
                            .trim() ===
                        actionBruteNormalisee
                )
            ) {

                actionCanonique =
                    canonique;

                console.log(
                    "🔄 [NeoAI SYNONYME]",
                    actionBruteNormalisee,
                    "→",
                    canonique,
                    "| catégorie:",
                    categorie
                );

                break;

            }

        }

        if (
            actionCanonique !==
            actionBruteNormalisee
        ) {
            break;
        }

    }

    //============================================================
    // 🏷️ CATÉGORIE
    //============================================================

    let categorieCanonique =
        analyse?.categorie ||
        null;

    for (
        const [categorie, groupe]
        of Object.entries(synonymes)
    ) {

        if (
            !groupe ||
            typeof groupe !== "object" ||
            Array.isArray(groupe)
        ) {
            continue;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                groupe,
                actionCanonique
            )
        ) {

            categorieCanonique =
                categorie;

            break;

        }

    }

    //============================================================
    // 📌 FALLBACK CATÉGORIE PAR MODÈLE
    //============================================================

    if (
        !categorieCanonique
    ) {

        const modeleCategorie =
            tousLesModeles.find(
                modele => {

                    const actionModele =
                        neoNormaliserMotLocal(
                            String(
                                modele?.action ||
                                ""
                            )
                        )
                            .toLowerCase()
                            .trim();

                    return (
                        actionModele ===
                        neoNormaliserMotLocal(
                            String(
                                actionCanonique
                            )
                        )
                            .toLowerCase()
                            .trim()
                    );

                }
            );

        if (
            modeleCategorie?.categorie
        ) {

            categorieCanonique =
                modeleCategorie.categorie;

        }

    }

    analyse.action =
        actionCanonique;

    analyse.categorie =
        categorieCanonique;

    //============================================================
    // 🧩 FAMILLE
    //============================================================

    const famille =
        analyse?.famille ||
        null;

    //============================================================
    // 🔎 NORMALISATION
    //============================================================

    const normaliser =
        valeur =>
            neoNormaliserMotLocal(
                String(
                    valeur ?? ""
                )
            )
                .toLowerCase()
                .trim();

    const actionNorm =
        normaliser(
            actionCanonique
        );

    const categorieNorm =
        normaliser(
            categorieCanonique
        );

    const familleNorm =
        normaliser(
            famille
        );

    //============================================================
    // 📚 1. CANDIDATS
    //============================================================
    //
    // On commence par l'action canonique.
    //
    // Exemple :
    //
    // fonce
    //   ↓
    // course
    //
    // Tous les modèles "course" deviennent candidats.
    //============================================================

    let modelesCompatibles =
        tousLesModeles.filter(
            modele => {

                const actionModele =
                    normaliser(
                        modele?.action
                    );

                return (
                    actionModele &&
                    actionNorm &&
                    actionModele ===
                    actionNorm
                );

            }
        );

    //============================================================
    // 📌 FALLBACK CATÉGORIE / FAMILLE
    //============================================================

    if (
        !modelesCompatibles.length
    ) {

        modelesCompatibles =
            tousLesModeles.filter(
                modele => {

                    const categorieModele =
                        normaliser(
                            modele?.categorie
                        );

                    const familleModele =
                        normaliser(
                            modele?.famille
                        );

                    const categorieOK =
                        !categorieModele ||
                        !categorieNorm ||
                        categorieModele ===
                        categorieNorm;

                    const familleOK =
                        !familleModele ||
                        !familleNorm ||
                        familleModele ===
                        familleNorm;

                    return (
                        categorieOK &&
                        familleOK &&
                        (
                            !!categorieModele ||
                            !!familleModele
                        )
                    );

                }
            );

    }

    console.log(
        "📚 [NeoAI MODÈLES CANDIDATS] :",
        modelesCompatibles.length
    );

    //============================================================
    // ❌ AUCUN CANDIDAT
    //============================================================

    if (
        !modelesCompatibles.length
    ) {

        console.log(
            "⚠️ [NeoAI MODEL] Aucun modèle compatible pour :",
            actionCanonique
        );

        return {

            modele: null,
            score: 0,
            scoreStructure: 0,
            structureComplete: false,
            slotsTrouves: [],
            slotsManquants: [],
            actionCanonique,
            categorie:
                categorieCanonique,
            structure: []

        };

    }

    //============================================================
    // 🧠 OUTILS DE COMPARAISON
    //============================================================

    const valeurPresente =
        valeur => {

            if (
                valeur === null ||
                valeur === undefined
            ) {
                return false;
            }

            if (
                typeof valeur === "string"
            ) {
                return valeur.trim().length > 0;
            }

            if (
                Array.isArray(valeur)
            ) {
                return valeur.length > 0;
            }

            return true;

        };

    const contientValeur =
        (
            valeurAnalyse,
            valeurModele
        ) => {

            if (
                !valeurPresente(
                    valeurAnalyse
                )
            ) {
                return false;
            }

            const analyseNorm =
                normaliser(
                    valeurAnalyse
                );

            if (
                Array.isArray(
                    valeurModele
                )
            ) {

                return valeurModele.some(
                    valeur =>
                        normaliser(
                            valeur
                        ) ===
                        analyseNorm
                );

            }

            if (
                typeof valeurModele === "string"
            ) {

                return (
                    normaliser(
                        valeurModele
                    ) ===
                    analyseNorm
                );

            }

            return false;

        };

    //============================================================
    // 🔑 MOTS DISCRIMINANTS DU MODÈLE
    //============================================================
    //
    // Ces éléments servent à distinguer des modèles très proches.
    //
    // Exemple :
    //
    // frontale  → modèle frontal
    // circulaire → modèle circulaire
    // diagonale → modèle diagonal
    // latérale  → modèle latéral
    //============================================================

    const scoreDiscrimination =
        modele => {

            let score = 0;

            const params =
                modele?.params || {};

            // --------------------------------------------
            // TRAJECTOIRE
            // --------------------------------------------

            if (
                contientValeur(
                    analyse?.trajectoire,
                    params?.trajectoire
                )
            ) {

                score += 100;

            }

            // --------------------------------------------
            // DIRECTION
            // --------------------------------------------

            if (
                contientValeur(
                    analyse?.direction,
                    params?.direction
                )
            ) {

                score += 80;

            }

            // --------------------------------------------
            // MANIÈRE
            // --------------------------------------------

            if (
                contientValeur(
                    analyse?.maniere,
                    params?.maniere
                )
            ) {

                score += 60;

            }

            // --------------------------------------------
            // VITESSE
            // --------------------------------------------

            if (
                contientValeur(
                    analyse?.vitesse,
                    params?.vitesse
                )
            ) {

                score += 30;

            }

            // --------------------------------------------
            // INTENTION
            // --------------------------------------------

            if (
                contientValeur(
                    analyse?.intention,
                    params?.intention
                )
            ) {

                score += 20;

            }

            return score;

        };

    //============================================================
    // 🏆 ÉVALUATION DES CANDIDATS
    //============================================================
    //
    // ORDRE DE PRIORITÉ :
    //
    // 1. Action canonique
    // 2. Mots discriminants structurels
    // 3. Similarité des exemples
    //
    // La similarité ne valide PAS le pavé.
    // Elle départage uniquement les modèles proches.
    //============================================================

    const candidats = [];

    for (
        let index = 0;
        index < modelesCompatibles.length;
        index++
    ) {

        const modele =
            modelesCompatibles[index];

        let scoreExemple = 0;

        let meilleurExemple = null;

        try {

            const analyseModele = {

                ...analyse,

                action:
                    actionCanonique,

                categorie:
                    categorieCanonique

            };

            scoreExemple =
                Number(
                    neoCalculerSimilariteModele(
                        texte,
                        modele,
                        analyseModele
                    )
                ) || 0;

            meilleurExemple =
                analyseModele?.meilleurExemple ||
                null;

        } catch (error) {

            console.log(
                "⚠️ [NeoAI SCORE] Erreur similarité :",
                error?.message
            );

        }

        const discrimination =
            scoreDiscrimination(
                modele
            );

        const actionModele =
            normaliser(
                modele?.action
            );

        const actionExacte =
            actionModele ===
            actionNorm;

        const categorieModele =
            normaliser(
                modele?.categorie
            );

        const familleModele =
            normaliser(
                modele?.famille
            );

        const categorieExacte =
            categorieModele &&
            categorieNorm &&
            categorieModele ===
            categorieNorm;

        const familleExacte =
            familleModele &&
            familleNorm &&
            familleModele ===
            familleNorm;

        // --------------------------------------------
        // SCORE DE SÉLECTION
        // --------------------------------------------
        //
        // IMPORTANT :
        //
        // Ce score sert uniquement à CHOISIR LE MODÈLE.
        //
        // Il ne sera jamais utilisé comme score de validation.
        // --------------------------------------------

        let selectionScore =
            discrimination;

        if (
            actionExacte
        ) {

            selectionScore += 1000;

        }

        if (
            categorieExacte
        ) {

            selectionScore += 100;

        }

        if (
            familleExacte
        ) {

            selectionScore += 50;

        }

        // --------------------------------------------
        // Similarité comme départage
        // --------------------------------------------
        //
        // Elle intervient après les indices structurels.
        // Elle ne peut donc pas remplacer une trajectoire
        // ou une direction explicitement détectée.
        // --------------------------------------------

        selectionScore +=
            scoreExemple / 1000;

        candidats.push({

            modele,

            selectionScore,

            discrimination,

            scoreExemple,

            meilleurExemple,

            index

        });

    }

    //============================================================
    // 🥇 MODÈLE FINAL
    //============================================================

    candidats.sort(
        (
            a,
            b
        ) => {

            if (
                b.selectionScore !==
                a.selectionScore
            ) {

                return (
                    b.selectionScore -
                    a.selectionScore
                );

            }

            // Dernier départage :
            // similarité des exemples

            if (
                b.scoreExemple !==
                a.scoreExemple
            ) {

                return (
                    b.scoreExemple -
                    a.scoreExemple
                );

            }

            // Stabilité :
            // ordre original des modèles

            return (
                a.index -
                b.index
            );

        }
    );

    const meilleurCandidat =
        candidats[0];

    const meilleur =
        meilleurCandidat?.modele ||
        null;

    if (
        !meilleur
    ) {

        return {

            modele: null,
            score: 0,
            scoreStructure: 0,
            structureComplete: false,
            slotsTrouves: [],
            slotsManquants: [],
            actionCanonique,
            categorie:
                categorieCanonique,
            structure: []

        };

    }

    //============================================================
    // 📐 STRUCTURE DU MODÈLE RETENU
    //============================================================

    const structure =
        Array.isArray(
            meilleur?.structure
        )
            ? meilleur.structure
            : [];

    const valeurSlot =
        slot => {

            switch (
                String(
                    slot || ""
                )
                    .toUpperCase()
            ) {

                case "SUJET":
                    return (
                        analyse?.acteur ??
                        analyse?.sujet
                    );

                case "ACTION":
                    return analyse?.action;

                case "CIBLE":
                    return analyse?.cible;

                case "MEMBRE":
                    return analyse?.membre;

                case "PARTIE_CORPS":
                    return analyse?.partieCorps;

                case "MANIERE":
                    return analyse?.maniere;

                case "VITESSE":
                    return analyse?.vitesse;

                case "DISTANCE":
                    return analyse?.distance;

                case "HAUTEUR":
                    return analyse?.hauteur;

                case "DIRECTION":
                    return analyse?.direction;

                case "TRAJECTOIRE":
                    return analyse?.trajectoire;

                case "INTENTION":
                    return analyse?.intention;

                case "COURBE":
                    return analyse?.courbe;

                default:
                    return null;

            }

        };

    const slotsTrouves = [];

    const slotsManquants = [];

    for (
        const slot
        of structure
    ) {

        if (
            valeurPresente(
                valeurSlot(slot)
            )
        ) {

            slotsTrouves.push(
                slot
            );

        } else {

            slotsManquants.push(
                slot
            );

        }

    }

    const totalSlots =
        structure.length;

    const totalTrouves =
        slotsTrouves.length;

    //============================================================
    // 📊 STRUCTURE
    //============================================================

    const scoreStructure =
        totalSlots > 0
            ? Math.round(
                (
                    totalTrouves /
                    totalSlots
                ) * 100
            )
            : 0;

    const structureComplete =
        totalSlots > 0 &&
        slotsManquants.length === 0;

    //============================================================
    // 📤 RETOUR
    //============================================================

    console.log(
        "🏆 [NeoAI MODEL]",
        meilleur?.id ||
        meilleur?.nom ||
        "—",
        "| discrimination:",
        meilleurCandidat.discrimination,
        "| similarité:",
        `${meilleurCandidat.scoreExemple}%`,
        "| structure:",
        `${totalTrouves}/${totalSlots}`,
        structureComplete
            ? "✅"
            : "❌"
    );

    return {

        modele:
            meilleur,

        // -------------------------------------------------------
        // Similarité = INFORMATION / DÉPARTAGE UNIQUEMENT
        // -------------------------------------------------------

        score:
            meilleurCandidat.scoreExemple,

        scoreExemple:
            meilleurCandidat.scoreExemple,

        meilleurExemple:
            meilleurCandidat.meilleurExemple,

        // -------------------------------------------------------
        // Structure = VALIDATION
        // -------------------------------------------------------

        scoreStructure,

        structureComplete,

        slotsTrouves,

        slotsManquants,

        requisManquants:
            slotsManquants,

        // -------------------------------------------------------
        // Informations générales
        // -------------------------------------------------------

        actionCanonique,

        categorie:
            categorieCanonique,

        structure,

        // Conservé pour compatibilité avec le code existant.
        // Ce champ ne doit PAS servir au verdict.
        correspondanceForte:
            false

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

  const direction =
  neoDetecterDirection(
    texte
  );

const trajectoire =
  neoDetecterTrajectoire(
    texte
  );

const intention =
  neoDetecterIntention(
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

    direction,

    trajectoire,

    intention,

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
    
    const actionFinale =
  modele?.actionCanonique ||
  actionNom;

//============================================================
// 🧩 VALIDATION STRUCTURELLE
//============================================================
//
// IMPORTANT :
//
// La structure est validée indépendamment du score
// de similarité de l'exemple.
//
// Le modèle sert uniquement à fournir la structure
// requise de l'action.
//
//============================================================

const modeleReconnu =
  modele?.modele || null;

let scoreStructure = 0;

let structureComplete = false;

let slotsManquants = [];

let slotsTrouves = [];

const structureModele =
  Array.isArray(
    modeleReconnu?.structure
  )
    ? modeleReconnu.structure
    : [];

//============================================================
// 🔎 TEST EXISTENCE SLOT
//============================================================

const existe = valeur => {

  if (
    valeur === null ||
    valeur === undefined
  ) {

    return false;

  }

  return String(
    valeur
  ).trim() !== "";

};

//============================================================
// 📦 VALEURS SÉMANTIQUES
//============================================================

const valeurs = {

  SUJET:
    acteur || null,

  ACTION:
    actionFinale || null,

  CIBLE:
    cible || null,

  MEMBRE:
    membre || null,

  PARTIE_CORPS:
    partieCorps || null,

  MANIERE:
    maniere || null,

  DISTANCE:
    distance?.valeur ?? null,

  HAUTEUR:
    hauteur?.valeur ?? null,

  VITESSE:
    vitesse?.valeur ?? null,

  DIRECTION:
    direction || null,

  TRAJECTOIRE:
    trajectoire || null,

  INTENTION:
    intention || null

};

//============================================================
// 🧠 COMPARAISON STRUCTURELLE
//============================================================

for (
  const element
  of structureModele
) {

  const slot =
    neoNormaliserMotLocal(
      String(element)
    )
      .toUpperCase()
      .replace(/\s+/g, "_");

  if (!slot) {
    continue;
  }

  let valeur = null;

  switch (slot) {

    case "SUJET":
    case "ACTEUR":

      valeur =
        valeurs.SUJET;

      break;

    case "ACTION":
    case "VERBE":

      valeur =
        valeurs.ACTION;

      break;

    case "CIBLE":
    case "OBJET":

      valeur =
        valeurs.CIBLE;

      break;

    case "MEMBRE":

      valeur =
        valeurs.MEMBRE;

      break;

    case "PARTIE_CORPS":
    case "PARTIECORPS":

      valeur =
        valeurs.PARTIE_CORPS;

      break;

    case "MANIERE":

      valeur =
        valeurs.MANIERE;

      break;

    case "DISTANCE":

      valeur =
        valeurs.DISTANCE;

      break;

    case "HAUTEUR":

      valeur =
        valeurs.HAUTEUR;

      break;

    case "VITESSE":

      valeur =
        valeurs.VITESSE;

      break;

    case "DIRECTION":

      valeur =
        valeurs.DIRECTION;

      break;

    case "TRAJECTOIRE":

      valeur =
        valeurs.TRAJECTOIRE;

      break;

    case "INTENTION":

      valeur =
        valeurs.INTENTION;

      break;

    default:

      valeur = null;

      break;

  }

  if (
    existe(valeur)
  ) {

    slotsTrouves.push({

      slot,

      valeur

    });

  } else {

    slotsManquants.push(
      slot
    );

  }

}

//============================================================
// 📊 SCORE STRUCTURE
//============================================================

const totalSlots =
  structureModele.length;

const totalTrouves =
  slotsTrouves.length;

scoreStructure =
  totalSlots > 0

    ? Math.round(
        (
          totalTrouves /
          totalSlots
        ) * 100
      )

    : 0;

structureComplete =
  totalSlots > 0 &&
  slotsManquants.length === 0;


//============================================================
// 🧠 STRUCTURE SÉMANTIQUE FINALE
//============================================================

const structureSemantique = {

  sujet:
    acteur ||
    null,

  action:
  actionFinale || null,

  cible:
    cible ||
    null,

  membre:
    membre ||
    null,

  partieCorps:
    partieCorps ||
    null,

  maniere:
    maniere ||
    null,

  distance:
    distance?.valeur ??
    null,

  hauteur:
    hauteur?.valeur ??
    null,

  vitesse:
    vitesse?.valeur ??
    null,

  direction:
    direction ||
    null,

trajectoire:
    trajectoire ||
    null,

intention:
    intention ||
    null

};
    
  //============================================================
  // ✅ FORMAT DE SORTIE
  //============================================================
return {

    texte,

    // 👤 SUJET
    acteur,
    sujet: acteur,

    // ⚔️ ACTION
    action: actionNom,

    categorie,
    famille,

    // 🎯 CIBLE
    cible,

    // 🧩 COMPLÉMENTS
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

    // 🧠 MODÈLE SÉLECTIONNÉ
modele:
    modele?.modele || null,

// 🔎 SCORE DE RECONNAISSANCE DU MODÈLE
score:
    modele?.score || 0,

// 🧩 SCORE DE STRUCTURE RÉEL
scoreStructure,

// ✅ STRUCTURE COMPLÈTE ?
structureComplete,

// ❌ CHAMPS MANQUANTS
slotsManquants,

// ✅ CHAMPS TROUVÉS
slotsTrouves,

// Alias utilisé par l'arbitrage
requisManquants:
    slotsManquants,

// 🧱 STRUCTURE GRAMMATICALE EXISTANTE
structure,

// 🧠 STRUCTURE SÉMANTIQUE EXTRAITE
structureSemantique,

// 🔎 SCORE DE SIMILARITÉ AVEC L'EXEMPLE
// Informatif uniquement — NE VALIDE PAS et NE REFUSE PAS l'action
scoreExemple:
    modele?.scoreExemple || 0,

// 🧠 ACTION CANONIQUE RECONNUE
actionCanonique:
    actionFinale

};
}

//==============================================================
// ⚖️ ARBITRAGE SÉMANTIQUE NEOAI
//==============================================================
//
// IMPORTANT :
// AUCUN seuil de similarité 50 % / 70 %.
//
// Le modèle peut être reconnu avec une faible similarité.
//
// La seule vraie condition de validation est :
//
//     structureComplete === true
//
// Donc :
//     modèle trouvé + structure complète = VALIDÉ
//
//==============================================================

function neoArbitrer(
  analyse,
  options = {}
) {

  const maxActions =
    Number(
      options?.regles?.maxActions ??
      options?.maxActions ??
      20
    );

  const raisons = [];

  //============================================================
  // NOMBRE D'ACTIONS
  //============================================================

  if (
    Number(options.nombreActions || 0) >
    maxActions
  ) {

    raisons.push(
      `Nombre d'actions supérieur à la limite (${maxActions}).`
    );

  }

  //============================================================
  // ACTION
  //============================================================

  const actionExiste =
    !!(
      analyse?.action?.action ||
      analyse?.action
    );

  if (!actionExiste) {

    raisons.push(
      "Aucune action reconnue."
    );

  }

  //============================================================
  // ⚠️ IMPORTANT
  //============================================================
  // Le modèle / exemple NE participe PLUS à la validation.
  //
  // Un modèle peut être :
  // - null
  // - différent
  // - reconnu avec une faible similarité
  // - totalement absent
  //
  // Tant que la structure réelle de l'action est complète,
  // l'action peut être VALIDÉE.
  //============================================================

  //============================================================
  // STRUCTURE
  //============================================================

  const structureComplete =
    analyse?.structureComplete === true;

  const slotsManquants =
    Array.isArray(
      analyse?.slotsManquants
    )
      ? analyse.slotsManquants
      : [];

  //============================================================
  // STRUCTURE INCOMPLÈTE
  //============================================================

  if (
    !structureComplete
  ) {

    if (
      slotsManquants.length
    ) {

      raisons.push(
        `Informations manquantes : ${slotsManquants.join(", ")}.`
      );

    } else {

      raisons.push(
        "Structure sémantique incomplète."
      );

    }

  }

  //============================================================
  // VERDICT FINAL
  //============================================================

  const valide =
    raisons.length === 0;

  //============================================================
  // SCORE STRUCTUREL
  //============================================================

  const scoreStructure =
    Number(
      analyse?.scoreStructure
    ) || 0;

  //============================================================
  // RETOUR
  //============================================================

  return {

    valide,

    verdict:
      valide
        ? "VALIDÉ"
        : "REFUSÉ",

    score:
      scoreStructure,

    scoreStructure,

    structureComplete,

    slotsManquants,

    raisons

  };

}


//==============================================================
// 💡 RÉSUMÉ NARRATIF
//==============================================================

function neoGenererResume(
  analyse
) {

  let texte = String(
    analyse?.texte ||
    ""
  ).trim();

  if (!texte) {
    return "Aucune action décrite.";
  }

  //============================================================
  // 🧹 NETTOYAGE DU MARQUEUR NEO
  //============================================================

  texte = texte
    .replace(/^🌀\s*:\s*/iu, "")
    .replace(/^🌀\s*/iu, "")
    .replace(/^:\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!texte) {
    return "Aucune action décrite.";
  }

  //============================================================
  // 🎲 OUTIL DE VARIATION
  //============================================================

  function choisir(
    variantes
  ) {

    return variantes[
      Math.floor(
        Math.random() *
        variantes.length
      )
    ];

  }

  //============================================================
  // 🔄 SYNONYMES NARRATIFS
  //
  // Chaque groupe contient plusieurs variantes.
  // La phrase originale peut aussi être conservée.
  //============================================================

  const synonymes = [

    //==========================================================
    // 🥊 ATTAQUES
    //==========================================================

    {
      regex: /\bfrappe\b/iu,
      variantes: [
        "frappe",
        "porte",
        "assène",
        "lance",
        "déclenche"
      ]
    },

    {
      regex: /\bfrapper\b/iu,
      variantes: [
        "frapper",
        "porter",
        "asséner",
        "lancer",
        "déclencher"
      ]
    },

    {
      regex: /\bdonne un coup\b/iu,
      variantes: [
        "donne un coup",
        "porte un coup",
        "lance un coup",
        "assène un coup"
      ]
    },

    {
      regex: /\bfonce\b/iu,
      variantes: [
        "fonce",
        "se précipite",
        "s'élance",
        "charge",
        "se rue"
      ]
    },

    {
      regex: /\bfoncer\b/iu,
      variantes: [
        "foncer",
        "se précipiter",
        "s'élancer",
        "charger",
        "se ruer"
      ]
    },

    //==========================================================
    // 🏃 DÉPLACEMENTS
    //==========================================================

    {
      regex: /\bcourt vers\b/iu,
      variantes: [
        "court vers",
        "fonce vers",
        "s'élance vers",
        "se précipite vers"
      ]
    },

    {
      regex: /\bcourant vers\b/iu,
      variantes: [
        "courant vers",
        "fonçant vers",
        "s'élançant vers",
        "se précipitant vers"
      ]
    },

    {
      regex: /\bse déplace vers\b/iu,
      variantes: [
        "se déplace vers",
        "avance vers",
        "se dirige vers",
        "s'avance vers"
      ]
    },

    {
      regex: /\bavance vers\b/iu,
      variantes: [
        "avance vers",
        "se dirige vers",
        "s'avance vers",
        "progresse vers"
      ]
    },

    {
      regex: /\brecule\b/iu,
      variantes: [
        "recule",
        "se replie",
        "fait un pas en arrière",
        "s'éloigne"
      ]
    },

    //==========================================================
    // 🌀 DIRECTION
    //==========================================================

    {
      regex: /\bvers\b/iu,
      variantes: [
        "vers",
        "en direction de",
        "vers la direction de"
      ]
    },

    //==========================================================
    // 🛡️ ESQUIVE / DÉFENSE
    //==========================================================

    {
      regex: /\besquive\b/iu,
      variantes: [
        "esquive",
        "évite",
        "se dérobe à",
        "se soustrait à"
      ]
    },

    {
      regex: /\besquiver\b/iu,
      variantes: [
        "esquiver",
        "éviter",
        "se dérober à",
        "se soustraire à"
      ]
    },

    {
      regex: /\bpar(e|er)\b/iu,
      variantes: [
        "pare",
        "bloque",
        "intercepte",
        "dévie"
      ]
    },

    //==========================================================
    // ✋ SAISIES
    //==========================================================

    {
      regex: /\battrape\b/iu,
      variantes: [
        "attrape",
        "saisit",
        "empoigne",
        "agrippe"
      ]
    },

    {
      regex: /\battraper\b/iu,
      variantes: [
        "attraper",
        "saisir",
        "empoigner",
        "agripper"
      ]
    },

    {
      regex: /\bempoigne\b/iu,
      variantes: [
        "empoigne",
        "saisit",
        "agrippe",
        "attrape"
      ]
    },

    //==========================================================
    // 🦘 SAUTS
    //==========================================================

    {
      regex: /\bsaut(e|ant)?\b/iu,
      variantes: [
        "saute",
        "bondit",
        "s'élance dans les airs",
        "effectue un bond"
      ]
    },

    {
      regex: /\bbondit\b/iu,
      variantes: [
        "bondit",
        "saute",
        "s'élève",
        "s'élance dans les airs"
      ]
    },

    //==========================================================
    // 👁️ PERCEPTION
    //==========================================================

    {
      regex: /\bregarde\b/iu,
      variantes: [
        "regarde",
        "observe",
        "fixe",
        "scrute"
      ]
    },

    {
      regex: /\bregarder\b/iu,
      variantes: [
        "regarder",
        "observer",
        "fixer",
        "scruter"
      ]
    }

  ];

  //============================================================
  // 🎯 NOMBRE DE TRANSFORMATIONS
  //
  // Parfois aucune modification.
  // Parfois 1 ou 2 mots seulement.
  // Cela garde le résumé proche du pavé.
  //============================================================

  const candidats = [];

  for (
    const item of synonymes
  ) {

    if (
      item.regex.test(texte)
    ) {

      candidats.push(
        item
      );

    }

  }

  // Mélange les candidats
  for (
    let i = candidats.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      candidats[i],
      candidats[j]
    ] = [
      candidats[j],
      candidats[i]
    ];

  }

  //============================================================
  // 🎲 30 % : conserver presque exactement le pavé
  //============================================================

  const hasard = Math.random();

  if (hasard >= 0.30) {

    // 1 ou 2 reformulations maximum
    const nombre =
      candidats.length > 1 &&
      Math.random() > 0.55
        ? 2
        : 1;

    let modifications = 0;

    for (
      const item of candidats
    ) {

      if (
        modifications >= nombre
      ) {
        break;
      }

      const variante =
        choisir(
          item.variantes
        );

      texte = texte.replace(
        item.regex,
        variante
      );

      modifications++;

    }

  }

  //============================================================
  // 🧹 NETTOYAGE FINAL
  //============================================================

  texte = texte
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

  // Première lettre en majuscule
  if (texte.length) {

    texte =
      texte.charAt(0).toUpperCase() +
      texte.slice(1);

  }

  // Point final
  if (
    !/[.!?]$/u.test(texte)
  ) {

    texte += ".";

  }

  return texte;

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
const premiereAction =
  actions[0] || {};

const arbitre =
  neoArbitrer(
    premiereAction,
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
      scoreStructure:
    premiere.scoreStructure || 0,

structureComplete:
    premiere.structureComplete === true,

slotsManquants:
    premiere.slotsManquants || [],

requisManquants:
    premiere.requisManquants || [],

    structure:
    premiere.structure || null,

structureSemantique:
    premiere.structureSemantique || null,

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
        premiere.acteur ||
        null,

    action:
        premiere.action ||
        null,

    maniere:
        premiere.maniere ||
        null,

    cible:
        premiere.cible ||
        null,

    membre:
        premiere.membre ||
        null,

    partieCorps:
        premiere.partieCorps ||
        null,

    trajectoire:
        premiere.trajectoire ||
        null,

    distance:
        premiere.distance ??
        null,

    hauteur:
        premiere.hauteur ??
        null,

    vitesse:
        premiere.vitesse ||
        null

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
├ 🦾 Membre utilisé : ${action.membre || "—"}
├ 🦵 Partie du corps : ${action.partieCorps || "—"}
├ 📚 Modèle : ${
  action.modele?.id ||
  action.modele?.nom ||
  action.modele ||
  "—"
}
├ 🧩 Structure : ${
  Array.isArray(action.structure)
    ? `${action.structure.length - (action.slotsManquants?.length || 0)}/${action.structure.length} ${action.structureComplete ? "✅" : "❌"}`
    : "—"
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
