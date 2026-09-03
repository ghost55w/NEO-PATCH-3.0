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
// 🌀🧠 NEOAI — GESTION DES SESSIONS
//==============================================================

const neoAISessions = new Map();


//==============================================================
// 🧠 NORMALISER UN JID NEOAI
//==============================================================

function normaliserJidNeoAI(jid) {

  if (!jid) {
    return null;
  }

  return String(jid)
    .trim()
    .replace(/^lid:/i, "");
}


//==============================================================
// 🧠 DÉMARRER UNE SESSION NEOAI
//==============================================================

function demarrerSessionNeoAI(
  userJid,
  chatJid
) {

  const jid =
    normaliserJidNeoAI(userJid);

  if (!jid) {

    console.error(
      "❌ [NeoAI] Impossible de démarrer la session : JID absent."
    );

    return false;
  }

  neoAISessions.set(
    jid,
    {
      userJid: jid,
      chatJid: chatJid || null,
      active: true,
      startedAt: Date.now(),
      messagesAnalyses: 0
    }
  );

  console.log(
    "🧠 [NeoAI] Session démarrée pour :",
    jid
  );

  return true;
}


//==============================================================
// 🧠 RÉCUPÉRER UNE SESSION NEOAI
//==============================================================

function getSessionNeoAI(
  userJid
) {

  const jid =
    normaliserJidNeoAI(userJid);

  if (!jid) {
    return null;
  }

  const session =
    neoAISessions.get(jid);

  if (!session) {
    return null;
  }

  if (!session.active) {

    neoAISessions.delete(jid);

    return null;
  }

  return session;
}


//==============================================================
// 🧠 VÉRIFIER SI UNE SESSION EST ACTIVE
//==============================================================

function sessionNeoAIActive(
  userJid
) {

  return !!getSessionNeoAI(userJid);
}


//==============================================================
// 🛑 FERMER UNE SESSION NEOAI
//==============================================================

function fermerSessionNeoAI(
  userJid
) {

  const jid =
    normaliserJidNeoAI(userJid);

  if (!jid) {
    return false;
  }

  const session =
    neoAISessions.get(jid);

  if (!session) {
    return false;
  }

  session.active = false;

  neoAISessions.delete(jid);

  console.log(
    "🛑 [NeoAI] Session fermée pour :",
    jid
  );

  return true;
}


//==============================================================
// 🛑 DÉTECTER UNE COMMANDE D'ARRÊT NEOAI
//==============================================================

function estCommandeArretNeoAI(
  texte
) {

  if (!texte) {
    return false;
  }

  const normalise =
    String(texte)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  return (
    normalise === "🌀 stop" ||
    normalise === "🌀 arrête" ||
    normalise === "🌀 arrete" ||
    normalise === "🌀 arrêter" ||
    normalise === "🌀 stop neoai" ||
    normalise === "🌀 arrête neoai" ||
    normalise === "🌀 arrete neoai" ||
    normalise === "🌀 arrêter neoai"
  );
}


//==============================================================
// 🧠 EXTRAIRE LE JID DE L'UTILISATEUR
//==============================================================

function getNeoAIUserJid(
  ms,
  ms_org
) {

  if (!ms) {
    return null;
  }

  const participant =
    ms?.key?.participant ||
    ms?.participant;

  if (participant) {
    return normaliserJidNeoAI(participant);
  }

  const remoteJid =
    ms?.key?.remoteJid;

  if (
    remoteJid &&
    !remoteJid.endsWith("@g.us")
  ) {
    return normaliserJidNeoAI(remoteJid);
  }

  return null;
}


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
// 🌀🧠 NEOAI — ANALYSEUR LINGUISTIQUE
//==============================================================
function analyserNeoAI(text) {

    if (typeof text !== "string") {
        return {
            success: false,
            erreur: "Texte invalide."
        };
    }

    //==========================================================
    // 1️⃣ EXTRACTION DU TEXTE
    //==========================================================

    const texteOriginal = text.trim();

    const texte = texteOriginal
        .replace(/^🌀\s*:\s*/i, "")
        .trim();

    if (!texte) {
        return {
            success: false,
            erreur: "Texte vide."
        };
    }

    //==========================================================
    // 2️⃣ NORMALISATION + TOKENISATION
    //==========================================================

    const texteNormalise =
        typeof NeoAI.neoNormaliserTexte === "function"
            ? NeoAI.neoNormaliserTexte(texte)
            : texte;

    const mots =
        typeof NeoAI.neoTokeniser === "function"
            ? NeoAI.neoTokeniser(texteNormalise)
            : texteNormalise.split(/\s+/);

    //==========================================================
    // 3️⃣ ANALYSE DE CHAQUE MOT
    //==========================================================

    const motsAnalyses = [];

    for (let i = 0; i < mots.length; i++) {

        const mot = mots[i];

        let connaissance = null;

        if (
            typeof NeoAI.neoRechercherMot === "function"
        ) {
            connaissance =
                NeoAI.neoRechercherMot(mot);
        }

        console.log(
            "🌀 NEOAI MOT :",
            mot,
            JSON.stringify(connaissance, null, 2)
        );

        motsAnalyses.push({

            index: i,

            mot,

            connu:
                connaissance?.trouve === true,

            categories:
                connaissance?.categories || [],

            verbe:
                connaissance?.verbe || null,

            forme:
                connaissance?.forme || null

        });
    }

    //==========================================================
    // 4️⃣ OUTILS INTERNES
    //==========================================================

    const motNormalise = mot =>
        String(mot || "")
            .toLowerCase()
            .replace(/[.,!?;:()]/g, "")
            .trim();

    const estCategorie = (element, recherche) => {

        return element.categories?.some(
            categorie =>
                String(
                    categorie.categorie || ""
                )
                .toLowerCase()
                .includes(recherche)
        );
    };

    const estVerbe = element =>
        estCategorie(element, "verbe");

    const estNom = element =>
        (
            estCategorie(element, "nom") ||
            estCategorie(element, "combat")
        );

    const estPartieCorps = element =>
        (
            estCategorie(element, "corps") ||
            estCategorie(element, "partie")
        );

    //==========================================================
    // 5️⃣ DÉTECTION DES ACTIONS VERBALES
    //==========================================================

    const actionsVerbes = [];

    for (let i = 0; i < motsAnalyses.length; i++) {

        const element =
            motsAnalyses[i];

        if (!element.connu) {
            continue;
        }

        if (!estVerbe(element)) {
            continue;
        }

        const forme =
            String(
                element.forme || ""
            ).toLowerCase();

        // ------------------------------------------------------
        // PARTICIPE PRÉSENT
        // "voyant"
        // ------------------------------------------------------

        if (
            forme === "participe_present"
        ) {
            continue;
        }

        // ------------------------------------------------------
        // INFINITIF SUBORDONNÉ
        // "voyant le coup de poing venir..."
        // ------------------------------------------------------

        if (
            forme === "infinitif" &&
            i > 0
        ) {

            const avant =
                motsAnalyses
                    .slice(
                        Math.max(0, i - 8),
                        i
                    )
                    .map(
                        e =>
                            motNormalise(e.mot)
                    );

            if (
                avant.includes("voyant") ||
                avant.includes("voit") ||
                avant.includes("voyait") ||
                avant.includes("voir")
            ) {
                continue;
            }
        }

        actionsVerbes.push({

            index: i,

            verbe:
                element.verbe ||
                element.mot,

            forme:
                element.forme || null,

            mot:
                element.mot
        });
    }

    //==========================================================
    // 6️⃣ SUJET
    //==========================================================

    let sujet = null;

    if (actionsVerbes.length > 0) {

        const premiereAction =
            actionsVerbes[0].index;

        const avantAction =
            motsAnalyses.slice(
                0,
                premiereAction
            );

        const ignore = [
            "le",
            "la",
            "les",
            "un",
            "une",
            "des",
            "du",
            "de",
            "et",
            "ou",
            "mais",
            "puis",
            "ensuite",
            "après",
            "il",
            "elle",
            "ils",
            "elles",
            "qui",
            "que",
            "se",
            "son",
            "sa",
            "ses"
        ];

        for (const element of avantAction) {

            const mot =
                String(element.mot || "");

            if (!mot) {
                continue;
            }

            if (
                ignore.includes(
                    motNormalise(mot)
                )
            ) {
                continue;
            }

            sujet = mot;
            break;
        }
    }
    //==========================================================
    // 🧠 6️⃣ BIS — DÉTECTION DE "ÊTRE"
    //==========================================================
        let etat = null;
    let attribut = null;

    const estVerbeEtre =
        element => {

            if (!element) {
                return false;
            }

            const verbe =
                motNormalise(
                    element.verbe
                );

            const mot =
                motNormalise(
                    element.mot
                );

            return (
                verbe === "être" ||
                verbe === "etre" ||
                mot === "être" ||
                mot === "etre"
            );
        };

    const actionEtre =
        actionsVerbes.find(
            action =>
                estVerbeEtre(
                    motsAnalyses[
                        action.index
                    ]
                )
        );

    if (
        actionEtre
    ) {

        const indexEtre =
            actionEtre.index;

        //======================================================
        // 🔎 RECHERCHE DE L'ATTRIBUT / ÉTAT
        //======================================================

        for (
            let i = indexEtre + 1;
            i < motsAnalyses.length;
            i++
        ) {

            const element =
                motsAnalyses[i];

            const mot =
                motNormalise(
                    element.mot
                );

            if (!mot) {
                continue;
            }

            // Déterminants
            if (
                [
                    "le",
                    "la",
                    "les",
                    "un",
                    "une",
                    "des",
                    "du",
                    "de",
                    "ce",
                    "cet",
                    "cette",
                    "ces"
                ].includes(mot)
            ) {
                continue;
            }

            // Un nouveau verbe = fin de l'attribut
            if (
                estVerbe(element)
            ) {
                break;
            }

            //==================================================
            // 🎯 ATTRIBUT TROUVÉ
            //==================================================

            attribut = element.mot;

            break;
        }
    }
        //==========================================================
    // 🧠 ENREGISTRER L'ÉTAT
    //==========================================================

    if (
        actionEtre &&
        attribut
    ) {

        etat = {

            verbe: "être",

            sujet:
                sujet,

            attribut:
                attribut
        };
    }
    //==========================================================
    // 7️⃣ CONTEXTE AVANT LA PREMIÈRE ACTION
    //==========================================================
    let contexteObjet = null;
    let contexteCible = null;

    if (actionsVerbes.length > 0) {

        const premierIndex =
            actionsVerbes[0].index;

        const avantAction =
            motsAnalyses
                .slice(0, premierIndex);

        const texteAvantAction =
            avantAction
                .map(e => e.mot)
                .join(" ");

        // ------------------------------------------------------
        // COUP DE POING
        // ------------------------------------------------------

        if (
            /\bcoup\s+de\s+poing\b/i.test(
                texteAvantAction
            )
        ) {

            contexteObjet =
                "coup de poing";
        }

        // ------------------------------------------------------
        // COUP DE PIED
        // ------------------------------------------------------

        else if (
            /\bcoup\s+de\s+pied\b/i.test(
                texteAvantAction
            )
        ) {

            contexteObjet =
                "coup de pied";
        }

        // ------------------------------------------------------
        // CIBLE : visage / tête / abdomen...
        // ------------------------------------------------------

        for (
            let i = 0;
            i < avantAction.length;
            i++
        ) {

            const element =
                avantAction[i];

            if (
                !estPartieCorps(element)
            ) {
                continue;
            }

            const mot =
                motNormalise(
                    element.mot
                );

            // "main gauche", "paume gauche",
            // "avant-bras droit" ne sont pas des cibles.
            const avant =
                avantAction
                    .slice(
                        Math.max(0, i - 4),
                        i
                    )
                    .map(
                        e =>
                            motNormalise(e.mot)
                    );

            if (
                avant.includes("main") ||
                avant.includes("paume") ||
                avant.includes("bras") ||
                avant.includes("avant-bras")
            ) {
                continue;
            }

            contexteCible =
                element.mot;

            // "tête de Tobirama"
            if (
                avantAction[i + 1] &&
                motNormalise(
                    avantAction[i + 1].mot
                ) === "de"
            ) {

                if (
                    avantAction[i + 2]
                ) {

                    contexteCible +=
                        " de " +
                        avantAction[i + 2].mot;
                }
            }

            break;
        }
    }

    //==========================================================
    // 8️⃣ ACTIONS COMPLÈTES
    //==========================================================

    const actions = [];

    for (
        let a = 0;
        a < actionsVerbes.length;
        a++
    ) {

        const actionVerbe =
            actionsVerbes[a];
        //==================================================
        // 🧠 "ÊTRE" = ÉTAT, PAS ACTION
        //==================================================

        const elementVerbe =
            motsAnalyses[
                actionVerbe.index
            ];

        if (
            estVerbeEtre(
                elementVerbe
            )
        ) {

            continue;
        }
        
        const debut =
            actionVerbe.index;

        const fin =
            actionsVerbes[a + 1]
                ? actionsVerbes[a + 1].index
                : motsAnalyses.length;

        const zone =
            motsAnalyses.slice(
                debut + 1,
                fin
            );

        const texteZone =
            zone
                .map(e => e.mot)
                .join(" ");

        //======================================================
        // OBJET
        //======================================================

        let objet = null;

        // ------------------------------------------------------
        // Objet explicite après le verbe
        // ------------------------------------------------------

        if (
            /\bcoup\s+de\s+poing\b/i.test(
                texteZone
            )
        ) {

            objet = "coup de poing";

        } else if (
            /\bcoup\s+de\s+pied\b/i.test(
                texteZone
            )
        ) {

            objet = "coup de pied";

        } else {

            for (const element of zone) {

                if (!element.connu) {
                    continue;
                }

                if (
                    estNom(element) &&
                    !estPartieCorps(element)
                ) {

                    const mot =
                        motNormalise(
                            element.mot
                        );

                    // Petits mots / déterminants
                    if (
                        [
                            "le",
                            "la",
                            "les",
                            "un",
                            "une",
                            "des",
                            "du",
                            "de"
                        ].includes(mot)
                    ) {
                        continue;
                    }

                    // Ces mots servent à décrire le moyen
                    // et ne doivent pas devenir des objets.
                    if (
                        mot !== "main" &&
                        mot !== "paume" &&
                        mot !== "bras" &&
                        mot !== "avant-bras"
                    ) {

                        objet =
                            element.mot;

                        break;
                    }
                }
            }
        }

        // ------------------------------------------------------
        // RÉFÉRENCE :
        //
        // "le coup"
        //
        // Si le coup a déjà été décrit comme
        // "coup de poing", on conserve le sens complet.
        // ------------------------------------------------------

        if (
            contexteObjet &&
            motNormalise(objet) === "coup" &&
            /\ble\s+coup\b/i.test(
                texteZone
            )
        ) {

            objet =
                contexteObjet;
        }

        // ------------------------------------------------------
        // Si aucun objet n'a encore été trouvé,
        // on reprend directement le contexte.
        // ------------------------------------------------------

        if (
            !objet &&
            contexteObjet &&
            /\ble\s+coup\b/i.test(
                texteZone
            )
        ) {

            objet =
                contexteObjet;
        }

        
//======================================================
// 🎯 CIBLE
//======================================================

let cible = null;

//======================================================
// 🧠 OUTIL — DÉTECTER SI UNE PARTIE DU CORPS EST
// UTILISÉE COMME MOYEN
//======================================================
const estMoyenCorporel = (
    zone,
    index
) => {

    const avant =
        zone
            .slice(
                Math.max(0, index - 5),
                index
            )
            .map(
                e =>
                    motNormalise(e.mot)
            );

    return (
        avant.includes("main") ||
        avant.includes("paume") ||
        avant.includes("bras") ||
        avant.includes("avant-bras") ||
        avant.includes("poing")
    );
};

//======================================================
// 🧠 OUTIL — EXTRAIRE UNE CIBLE APRÈS UNE EXPRESSION
//======================================================
const trouverCibleApres =
    (
        zone,
        indexDebut
    ) => {

        for (
            let j = indexDebut + 1;
            j < zone.length;
            j++
        ) {

            const element =
                zone[j];

            if (
                !estPartieCorps(element)
            ) {
                continue;
            }

            const mot =
                motNormalise(
                    element.mot
                );

            // ----------------------------------------------
            // "pied" dans "coup de pied"
            // ----------------------------------------------

            if (
                mot === "pied" &&
                j >= 2 &&
                motNormalise(
                    zone[j - 1]?.mot
                ) === "de" &&
                motNormalise(
                    zone[j - 2]?.mot
                ) === "coup"
            ) {
                continue;
            }

            // ----------------------------------------------
            // Cette partie du corps est utilisée comme moyen
            // ----------------------------------------------

            if (
                estMoyenCorporel(
                    zone,
                    j
                )
            ) {
                continue;
            }

            let resultat =
                element.mot;

            // ----------------------------------------------
            // "tête de Tobirama"
            // ----------------------------------------------

            if (
                zone[j + 1] &&
                motNormalise(
                    zone[j + 1].mot
                ) === "de"
            ) {

                if (
                    zone[j + 2]
                ) {

                    resultat +=
                        " de " +
                        zone[j + 2].mot;
                }
            }

            return resultat;
        }

        return null;
    };

//======================================================
// 🎯 1. EXPRESSIONS EXPLICITES DE CIBLE
//======================================================
const expressionsCible = [
    "visant",
    "vers",
    "dans",
    "sur",
    "contre"
];

for (
    let i = 0;
    i < zone.length;
    i++
) {

    const mot =
        motNormalise(
            zone[i]?.mot
        );

    // ----------------------------------------------
    // "visant X"
    // ----------------------------------------------

    if (
        mot === "visant"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }

    // ----------------------------------------------
    // "vers X"
    // ----------------------------------------------

    if (
        mot === "vers"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }

    // ----------------------------------------------
    // "dans X"
    // ----------------------------------------------

    if (
        mot === "dans"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }

    // ----------------------------------------------
    // "sur X"
    // ----------------------------------------------

    if (
        mot === "sur"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }

    // ----------------------------------------------
    // "contre X"
    // ----------------------------------------------

    if (
        mot === "contre"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }

    //==================================================
    // 🎯 "au niveau de X"
    //==================================================

    if (
        mot === "au" &&
        motNormalise(
            zone[i + 1]?.mot
        ) === "niveau" &&
        motNormalise(
            zone[i + 2]?.mot
        ) === "de"
    ) {

        const resultat =
            trouverCibleApres(
                zone,
                i + 2
            );

        if (resultat) {

            cible =
                resultat;

            break;
        }
    }
}

//======================================================
// 🎯 2. STRUCTURE PARTICULIÈRE DE COMBAT
//======================================================
if (
    !cible
) {

    for (
        let i = 0;
        i < zone.length;
        i++
    ) {

        const mot =
            motNormalise(
                zone[i]?.mot
            );

        // ----------------------------------------------
        // "au niveau de"
        // ----------------------------------------------

        if (
            mot === "au" &&
            motNormalise(
                zone[i + 1]?.mot
            ) === "niveau" &&
            motNormalise(
                zone[i + 2]?.mot
            ) === "de"
        ) {

            const resultat =
                trouverCibleApres(
                    zone,
                    i + 2
                );

            if (resultat) {

                cible =
                    resultat;

                break;
            }
        }
    }
}

//======================================================
// 🎯 3. FALLBACK
//======================================================

if (
    !cible
) {

    for (
        let i = 0;
        i < zone.length;
        i++
    ) {

        const element =
            zone[i];

        if (
            !estPartieCorps(element)
        ) {
            continue;
        }

        const mot =
            motNormalise(
                element.mot
            );

        // ----------------------------------------------
        // "pied" de "coup de pied"
        // ----------------------------------------------

        if (
            mot === "pied" &&
            i >= 2 &&
            motNormalise(
                zone[i - 1]?.mot
            ) === "de" &&
            motNormalise(
                zone[i - 2]?.mot
            ) === "coup"
        ) {
            continue;
        }

        // ----------------------------------------------
        // 🚫 MOYEN CORPOREL
        // ----------------------------------------------

        if (
            estMoyenCorporel(
                zone,
                i
            )
        ) {
            continue;
        }

        // ----------------------------------------------
        // 🎯 CIBLE
        // ----------------------------------------------

        cible =
            element.mot;

        // ----------------------------------------------
        // "tête de Tobirama"
        // ----------------------------------------------

        if (
            zone[i + 1] &&
            motNormalise(
                zone[i + 1].mot
            ) === "de"
        ) {

            if (
                zone[i + 2]
            ) {

                cible +=
                    " de " +
                    zone[i + 2].mot;
            }
        }

        break;
    }
}

//======================================================
// 🎯 4. CIBLE DÉCRITE AVANT L'ACTION
//======================================================

if (
    !cible &&
    contexteCible
) {

    cible =
        contexteCible;
}

       

        //======================================================
// 🖐️ MOYEN / INSTRUMENT
//======================================================

let moyen = null;

//======================================================
// 🧠 NORMALISER LES MOTS DE LA ZONE
//======================================================

const motsZone =
    zone.map(
        element =>
            motNormalise(element.mot)
    );

//======================================================
// 🖐️ PAUME
//======================================================
//
// Reconnaît :
// "paume gauche"
// "paume droite"
// "paume de main gauche"
// "paume de main droite"
//

for (
    let i = 0;
    i < motsZone.length;
    i++
) {

    if (
        motsZone[i] !== "paume"
    ) {
        continue;
    }

    let cote = null;

    // paume gauche / droite
    if (
        motsZone[i + 1] === "gauche" ||
        motsZone[i + 1] === "droite"
    ) {

        cote =
            motsZone[i + 1];
    }

    // paume de main gauche / droite
    else if (
        motsZone[i + 1] === "de" &&
        motsZone[i + 2] === "main" &&
        (
            motsZone[i + 3] === "gauche" ||
            motsZone[i + 3] === "droite"
        )
    ) {

        cote =
            motsZone[i + 3];
    }

    if (cote) {

        moyen =
            `paume ${cote}`;

        break;
    }
}

//======================================================
// 🦾 AVANT-BRAS
//======================================================

if (!moyen) {

    for (
        let i = 0;
        i < motsZone.length;
        i++
    ) {

        // "avant-bras droit"
        if (
            motsZone[i] === "avant-bras" &&
            (
                motsZone[i + 1] === "gauche" ||
                motsZone[i + 1] === "droite"
            )
        ) {

            moyen =
                `avant-bras ${motsZone[i + 1]}`;

            break;
        }

        // "avant bras droit"
        if (
            motsZone[i] === "avant" &&
            motsZone[i + 1] === "bras" &&
            (
                motsZone[i + 2] === "gauche" ||
                motsZone[i + 2] === "droite"
            )
        ) {

            moyen =
                `avant-bras ${motsZone[i + 2]}`;

            break;
        }
    }
}

//======================================================
// ✋ MAIN
//======================================================
//
// Reconnaît :
// "main gauche"
// "main droite"
//
// On le fait après avant-bras pour éviter
// qu'un avant-bras soit interprété comme une simple main.
//

if (!moyen) {

    for (
        let i = 0;
        i < motsZone.length;
        i++
    ) {

        if (
            motsZone[i] !== "main"
        ) {
            continue;
        }

        if (
            motsZone[i + 1] === "gauche" ||
            motsZone[i + 1] === "droite"
        ) {

            moyen =
                `main ${motsZone[i + 1]}`;

            break;
        }
    }
}

        //======================================================
        // SI L'ACTION EST "BLOQUER"
        // ET QUE L'OBJET/CIBLE ÉTAIENT DÉCRITS AVANT
        //======================================================

        if (
            !objet &&
            contexteObjet
        ) {
            objet = contexteObjet;
        }

        if (
            !cible &&
            contexteCible
        ) {
            cible = contexteCible;
        }

       //======================================================
        // CRÉATION DE L'ACTION
        //======================================================

        actions.push({

            // Forme normalisée utilisée par NeoAI
            // Exemple : "bloquer"
            verbe:
                actionVerbe.verbe,

            // Forme réellement écrite dans le pavé
            // Exemple : "bloque"
            mot:
                actionVerbe.mot,

            forme:
                actionVerbe.forme,

            ...(objet
                ? { objet }
                : {}),

            ...(cible
                ? { cible }
                : {}),

            ...(moyen
                ? { moyen }
                : {})
        }); 
    } 


    //==========================================================
    // 9️⃣ CONTEXTE
    //==========================================================

    let contexte = "general";

    const texteBas =
        texte.toLowerCase();

    const motsCombat = [
        "frappe",
        "frapper",
        "bloque",
        "bloquer",
        "attaque",
        "attaquer",
        "coup",
        "poing",
        "pied",
        "shuriken",
        "esquive",
        "esquiver",
        "défend",
        "défendre",
        "parer",
        "pare"
    ];

    if (
        motsCombat.some(
            mot =>
                texteBas.includes(mot)
        )
    ) {

        contexte = "combat";
    }

    //==========================================================
    // 🔟 ENCHAÎNEMENT
    //==========================================================

    let enchainement = null;

    const succession = [
        "puis",
        "ensuite",
        "après",
        "dans la foulée",
        "immédiatement"
    ];

    if (
        succession.some(
            mot =>
                texteBas.includes(mot)
        )
    ) {

        enchainement = "successif";
    }

    //==========================================================
    // 1️⃣1️⃣ DIRECTIONS
    //==========================================================

    const directions = [];

    const verbesDeplacement = [
        "marcher",
        "courir",
        "avancer",
        "reculer",
        "sauter",
        "voler",
        "ramper",
        "grimper",
        "descendre",
        "monter",
        "entrer",
        "sortir",
        "approcher",
        "s'éloigner",
        "tourner",
        "accélérer",
        "ralentir"
    ];

    const contientDeplacement =
        actions.some(
            action =>
                verbesDeplacement.includes(
                    String(
                        action.verbe || ""
                    ).toLowerCase()
                )
        );

    if (contientDeplacement) {

        for (const element of motsAnalyses) {

            if (
                !estCategorie(
                    element,
                    "direction"
                )
            ) {
                continue;
            }

            const mot =
                motNormalise(
                    element.mot
                );

            if (
                !directions.includes(mot)
            ) {

                directions.push(mot);
            }
        }
    }

    //==========================================================
    // 1️⃣2️⃣ OBJETS GÉNÉRAUX
    //==========================================================

    const objets = [];

    for (const action of actions) {

        if (
            action.objet &&
            !objets.includes(
                action.objet
            )
        ) {

            objets.push(
                action.objet
            );
        }
    }

    //==========================================================
    // 1️⃣3️⃣ CIBLES GÉNÉRALES
    //==========================================================

    const cibles = [];

    for (const action of actions) {

        if (
            action.cible &&
            !cibles.includes(
                action.cible
            )
        ) {

            cibles.push(
                action.cible
            );
        }
    }

    //==========================================================
    // 1️⃣4️⃣ REFORMULATION
    //==========================================================
    let reformulation =
        texte;

    //==========================================================
    // 🧠 CAS : ÉTAT
    //==========================================================

    if (
        etat &&
        etat.sujet &&
        etat.attribut
    ) {

        reformulation =
            `${etat.sujet} est ${etat.attribut}.`;
    }

    //==========================================================
    // ⚔️ CAS : ACTIONS
    //==========================================================

    else if (
        sujet &&
        actions.length
    ) {

        const phrasesActions =
            actions.map(
                (action, index) => {

                    const verbe =
                        action.mot ||
                        action.verbe;

                    let phrase = "";

                    if (
                        index === 0
                    ) {

                        phrase =
                            `${sujet} ${verbe}`;

                    } else if (
                        enchainement === "successif"
                    ) {

                        phrase =
                            `${verbe}`;

                    } else {

                        phrase =
                            `${sujet} ${verbe}`;
                    }

                    //==================================================
                    // OBJET
                    //==================================================

                    if (
                        action.objet
                    ) {

                        phrase +=
                            ` un ${action.objet}`;
                    }

                    //==================================================
                    // CIBLE
                    //==================================================

                    if (
                        action.cible
                    ) {

                        const cibleNormalisee =
                            motNormalise(
                                action.cible
                            );

                        if (
                            !cibleNormalisee.includes("son ") &&
                            !cibleNormalisee.includes("sa ") &&
                            !cibleNormalisee.includes("ses ") &&
                            !cibleNormalisee.includes(" de ")
                        ) {

                            phrase +=
                                ` visant son ${action.cible}`;

                        } else {

                            phrase +=
                                ` visant ${action.cible}`;
                        }
                    }

                    //==================================================
                    // MOYEN
                    //==================================================

                    if (
                        action.moyen
                    ) {

                        const moyenNormalise =
                            motNormalise(
                                action.moyen
                            );

                        const possessif =
                            moyenNormalise.startsWith(
                                "avant-bras"
                            )
                                ? "son"
                                : "sa";

                        phrase +=
                            ` avec ${possessif} ${action.moyen}`;
                    }

                    return phrase;
                }
            );

        if (
            actions.length > 1 &&
            enchainement === "successif"
        ) {

            reformulation =
                phrasesActions
                    .join(" puis ")
                    + ".";

        } else {

            reformulation =
                phrasesActions
                    .join(" et ")
                    + ".";
        }
    }
  
    //==========================================================
    // 1️⃣5️⃣ COMPRÉHENSION
    //==========================================================
    const comprehension = {

        sujet,

        actions,

        etat,

        directions,

        objets,

        cibles,

        lieux: [],

        temps: [],

        contexte,

        enchainement
    };
    

    //==========================================================
    // 1️⃣6️⃣ RÉSULTAT FINAL
    //==========================================================

    return {

        success: true,

        texteOriginal,

        texte,

        nombreMots:
            mots.length,

        mots:
            motsAnalyses,

        motsConnus:
            motsAnalyses
                .filter(
                    m => m.connu
                )
                .map(
                    m => m.mot
                ),

        motsInconnus:
            motsAnalyses
                .filter(
                    m => !m.connu
                )
                .map(
                    m => m.mot
                ),

        nombreMotsConnus:
            motsAnalyses
                .filter(
                    m => m.connu
                )
                .length,

        nombreMotsInconnus:
            motsAnalyses
                .filter(
                    m => !m.connu
                )
                .length,

        comprehension,

        reformulation,

        dateAnalyse:
            Date.now()
    };
}
                    
                                    

//==============================================================
// 🧠 NEO AI — AFFICHAGE DU RÉSULTAT
//==============================================================

async function envoyerResultatNeoAI(
    ovl,
    chatJid,
    resultat
) {

    const c =
        resultat.comprehension;

    let comprehension = "";

    //==========================================================
    // SUJET
    //==========================================================

    if (c.sujet) {

        comprehension +=
            `• Sujet : ${c.sujet}\n`;
    }
        //==========================================================
    // 🧠 ÉTAT
    //==========================================================

    if (
        c.etat?.attribut
    ) {

        comprehension +=
            `• État : ${c.etat.attribut}\n`;
    }

    //==========================================================
    // ACTIONS
    //==========================================================

    if (c.actions.length) {

        for (
            const action
            of c.actions
        ) {

            comprehension +=
                `• Action : ${action.verbe}\n`;

            if (action.objet) {

                comprehension +=
                    `• Objet : ${action.objet}\n`;
            }

            if (action.cible) {

                comprehension +=
                    `• Cible : ${action.cible}\n`;
            }

            if (action.moyen) {

                comprehension +=
                    `• Moyen : ${action.moyen}\n`;
            }
        }
    }

    //==========================================================
    // DIRECTIONS
    //==========================================================

    if (c.directions.length) {

        comprehension +=
            `• Direction : ${
                c.directions.join(", ")
            }\n`;
    }

    //==========================================================
    // LIEUX
    //==========================================================

    if (c.lieux.length) {

        comprehension +=
            `• Lieu : ${
                c.lieux.join(", ")
            }\n`;
    }

    //==========================================================
    // TEMPS
    //==========================================================

    if (c.temps.length) {

        comprehension +=
            `• Temps : ${
                c.temps.join(", ")
            }\n`;
    }

    //==========================================================
    // CONTEXTE
    //==========================================================

    if (c.contexte) {

        comprehension +=
            `• Contexte : ${c.contexte}\n`;
    }

    //==========================================================
    // ENCHAÎNEMENT
    //==========================================================

    if (c.enchainement) {

        comprehension +=
            `• Enchaînement : ${c.enchainement}\n`;
    }

    //==========================================================
    // FALLBACK
    //==========================================================

    if (!comprehension) {

        comprehension =
            "• Compréhension insuffisante";
    }

    //==========================================================
    // MESSAGE
    //==========================================================

    const message = `
🌀🧠 *NeoAI*
━━━━━━━━━━━━━━━━━━

📝 *Texte :*
${resultat.texte}

📚 *Compréhension :*
${comprehension}
💡 *Résumé :*
${resultat.reformulation}

╰──────────────────
                     *Powered by NEOVERSE™🌀*
`;

    await ovl.sendMessage(
        chatJid,
        {
            text: message
        }
    );
}


//==============================================================
// 🌀🧠 TRAITER UN MESSAGE NEOAI
//==============================================================

async function traiterMessageNeoAI(
  ms,
  ms_org,
  ovl,
  auteur_Message
) {

  try {

    //==========================================================
    // 👤 JID UTILISATEUR
    //==========================================================

    const userJid =
      normaliserJidNeoAI(
        auteur_Message ||
        getNeoAIUserJid(
          ms,
          ms_org
        )
      );

    if (!userJid) {

      console.log(
        "⚠️ [NeoAI] Aucun JID utilisateur."
      );

      return false;
    }

    //==========================================================
    // 📝 EXTRAIRE LE TEXTE
    //==========================================================

    const texte =
      extraireTexteNeoAI(ms);

    if (!texte) {
      return false;
    }

    const texteNormalise =
      texte
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    console.log(
      "🧠 [NeoAI] Message reçu :",
      texte
    );

    console.log(
      "🧠 [NeoAI] Auteur :",
      userJid
    );

    //==========================================================
    // 🛑 ARRÊT NEOAI
    //==========================================================

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

        await ovl.sendMessage(
          ms_org,
          {
            text:
              "🌀🧠 NeoAI a fermé la session.\n\n" +
              "À bientôt 👋🏻"
          },
          {
            quoted: ms
          }
        );
      }

      return true;
    }

    //==========================================================
    // 🧠 RÉCUPÉRER LA SESSION
    //==========================================================

    const session =
      getSessionNeoAI(
        userJid
      );

    // Pas de session = NeoAI ignore
    if (!session) {

      console.log(
        "ℹ️ [NeoAI] Aucune session active pour :",
        userJid
      );

      return false;
    }

    //==========================================================
    // 🌀 FORMAT NEOAI
    // Accepte :
    // 🌀: texte
    // 🌀 : texte
    //==========================================================

    const estNeoAI =
      /^🌀\s*:/u.test(
        texte.trim()
      );

    if (!estNeoAI) {

      console.log(
        "ℹ️ [NeoAI] Session active mais message sans préfixe 🌀:"
      );

      return false;
    }

    console.log(
      "🌀 [NeoAI] TEXTE D'ANALYSE DÉTECTÉ"
    );

    //==========================================================
    // 🧠 ANALYSER
    //==========================================================

    const resultat =
      await analyserNeoAI(
        texte
      );

    //==========================================================
    // ❌ ERREUR
    //==========================================================

    if (!resultat?.success) {

      await ovl.sendMessage(
        ms_org,
        {
          text:
            resultat?.message ||
            "❌ NeoAI n'a pas pu analyser ce texte."
        },
        {
          quoted: ms
        }
      );

      return true;
    }

    //==========================================================
    // 📊 COMPTEUR
    //==========================================================

    session.messagesAnalyses =
      (
        session.messagesAnalyses ||
        0
      ) + 1;

    //==========================================================
    // 🖼️ ENVOYER LE RÉSULTAT
    //==========================================================
    await envoyerResultatNeoAI(
  ovl,
  ms_org,
  resultat
);
    console.log(
      "✅ [NeoAI] Analyse terminée pour :",
      userJid
    );

    return true;

  } catch (error) {

    console.error(
      "❌ [NeoAI] Erreur interne :",
      error
    );

    try {

      await ovl.sendMessage(
        ms_org,
        {
          text:
            "❌ Une erreur est survenue pendant l'analyse NeoAI."
        },
        {
          quoted: ms
        }
      );

    } catch (sendError) {

      console.error(
        "❌ [NeoAI] Impossible d'envoyer l'erreur :",
        sendError
      );
    }

    return true;
  }
}

//==============================================================
// 🧠🌀 NEOAI — NEOLEARN
//==============================================================
// Utilisation :
// Répondre à un texte avec :
//
// +neolearn🌀
//
// NeoAI va :
// - analyser le texte
// - détecter les mots inconnus
// - ignorer les mots déjà connus
// - supprimer les doublons
// - ajouter les nouveaux mots dans NEO_LEARN
// - trier NEO_LEARN par ordre alphabétique
//==============================================================

ovlcmd(
    {
        nom_cmd: "neolearn🌀",
        classe: "Outils",
        react: "🧠",
        desc: "Apprend automatiquement les mots inconnus à NeoAI"
    },

    async (ms_org, ovl, cmd_options) => {
//======================================================
// 🔐 SÉCURITÉ SUDO
//======================================================
const senderJid =
    cmd_options.auteur_Message ||
    ms?.key?.participant ||
    ms?.participant ||
    ms?.key?.remoteJid ||
    "";

const senderNormalise =
    String(senderJid)
        .trim()
        .replace(/^lid:/i, "");

const estSudo =
    await Sudo.findOne({
        where: {
            id: senderNormalise
        }
    });

if (!estSudo) {

    console.log(
        "🔐 [NeoLearn] Accès refusé pour :",
        senderNormalise
    );

    await ovl.sendMessage(
        ms_org,
        {
            text:
                "❌ *Accès refusé.*\n\n" +
                "🧠🌀 *NeoAI Learn* est réservé aux Sudo."
        },
        {
            quoted: ms
        }
    );

    return;
}

console.log(
    "✅ [NeoLearn] Sudo autorisé :",
    senderNormalise
);
        const {
            repondre,
            msg_Repondu,
            ms,
            prenium_id
        } = cmd_options;

        //======================================================
        // PERMISSION
        //======================================================

        if (!prenium_id) {

            return repondre(
                "❌ Vous n'avez pas la permission d'utiliser NeoLearn."
            );

        }

        //======================================================
        // MESSAGE RÉPONDU
        //======================================================

        if (!msg_Repondu) {

            return repondre(
                "❌ Répondez à un texte avec :\n\n" +
                "+neolearn🌀"
            );

        }

        //======================================================
        // EXTRACTION DU TEXTE
        //======================================================

        let texte =
            extraireTexteNeoAI(
                msg_Repondu
            );

        if (!texte) {

            return repondre(
                "❌ Impossible de récupérer le texte du message."
            );

        }

        texte =
            String(texte)
                .replace(/\s+/g, " ")
                .trim();

        if (!texte) {

            return repondre(
                "❌ Le texte est vide."
            );

        }

        //======================================================
        // MESSAGE D'ANIMATION
        //======================================================

        const attendre =
            ms =>
                new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            ms
                        )
                );

        //======================================================
// 🔎 ANALYSE
//======================================================

const animationsAnalyse = [
    "🔎 *Analyse des mots.*",
    "🔎 *Analyse des mots..*",
    "🔎 *Analyse des mots...*"
];

const messageAnalyse =
    await ovl.sendMessage(
        ms_org,
        {
            text:
                animationsAnalyse[0]
        },
        {
            quoted: ms
        }
    );

for (
    let i = 1;
    i < animationsAnalyse.length;
    i++
) {

    await attendre(1600);

    await ovl.sendMessage(
        ms_org,
        {
            text:
                animationsAnalyse[i],
            edit:
                messageAnalyse.key
        }
    );

}

//======================================================
// 📚 APPRENTISSAGE
//======================================================

const animationsLearn = [
    "📚 🧠 *Apprentissage des mots.*",
    "📚 🧠 *Apprentissage des mots..*",
    "📚 🧠 *Apprentissage des mots...*"
];

const messageLearn =
    await ovl.sendMessage(
        ms_org,
        {
            text:
                animationsLearn[0]
        },
        {
            quoted: ms
        }
    );

for (
    let i = 1;
    i < animationsLearn.length;
    i++
) {

    await attendre(1600);

    await ovl.sendMessage(
        ms_org,
        {
            text:
                animationsLearn[i],
            edit:
                messageLearn.key
        }
    );

}

        //======================================================
        // TOKENISATION
        //======================================================

        const mots =
            texte
                .split(/\s+/)
                .map(
                    mot =>
                        mot
                            .replace(
                                /^[^À-ÿA-Za-z0-9'-]+|[^À-ÿA-Za-z0-9'-]+$/g,
                                ""
                            )
                            .trim()
                )
                .filter(Boolean);

        //======================================================
        // NORMALISATION
        //======================================================

        const normaliser =
            valeur =>
                String(valeur || "")
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .trim();

        //======================================================
        // LECTURE DE NEOAI.JS
        //======================================================
        const cheminNeoAI =
            require.resolve(
                "../DataBase/NeoAI"
            );

        let contenu;

        try {

            contenu =
                fs.readFileSync(
                    cheminNeoAI,
                    "utf8"
                );

        } catch (error) {

            console.error(
                "❌ [NeoLearn] Lecture NeoAI.js :",
                error
            );

            return repondre(
                "❌ Impossible de lire DataBase/NeoAI.js."
            );

        }

        //======================================================
        // RECHERCHE DE NEO_LEARN
        //======================================================
        //======================================================
// 🧠 RECHERCHE ET MODIFICATION DE NEO_LEARN
//======================================================

const indexLearn =
    contenu.indexOf("const NEO_LEARN");

if (indexLearn === -1) {

    console.error(
        "❌ [NeoLearn] const NEO_LEARN introuvable."
    );

    return repondre(
        "❌ La catégorie NEO_LEARN est introuvable dans NeoAI.js."
    );
}

//======================================================
// 🇫🇷 RECHERCHE DU TABLEAU FR
//======================================================

const indexFr =
    contenu.indexOf(
        "fr:",
        indexLearn
    );

if (indexFr === -1) {

    console.error(
        "❌ [NeoLearn] fr: introuvable."
    );

    return repondre(
        "❌ La section française de NEO_LEARN est introuvable."
    );
}

const debutTableau =
    contenu.indexOf(
        "[",
        indexFr
    );

if (debutTableau === -1) {

    console.error(
        "❌ [NeoLearn] [ introuvable."
    );

    return repondre(
        "❌ Impossible de trouver la liste NEO_LEARN."
    );
}

const finTableau =
    contenu.indexOf(
        "]",
        debutTableau
    );

if (finTableau === -1) {

    console.error(
        "❌ [NeoLearn] ] introuvable."
    );

    return repondre(
        "❌ Impossible de fermer la liste NEO_LEARN."
    );
}

//======================================================
// 📚 MOTS DÉJÀ PRÉSENTS
//======================================================

const blocLearn =
    contenu.slice(
        debutTableau + 1,
        finTableau
    );

const motsDejaAppris =
    new Map();

const regexMots =
    /["']([^"']+)["']/g;

let match;

while (
    (match = regexMots.exec(blocLearn))
) {

    const motOriginal =
        match[1];

    const motNormalise =
        normaliser(motOriginal);

    if (
        motNormalise &&
        !motsDejaAppris.has(motNormalise)
    ) {

        motsDejaAppris.set(
            motNormalise,
            motOriginal
        );
    }
}

console.log(
    "📚 [NeoLearn] Mots déjà présents :",
    motsDejaAppris.size
);

//======================================================
// 🔎 DÉTECTION DES MOTS INCONNUS
//======================================================

const nouveauxMots = [];

const dejaDetectes =
    new Set();

for (
    const mot of mots
) {

    const motNormalise =
        normaliser(mot);

    if (!motNormalise) {
        continue;
    }

    //==================================================
    // 🚫 DOUBLON DANS LE TEXTE
    //==================================================

    if (
        dejaDetectes.has(
            motNormalise
        )
    ) {
        continue;
    }

    dejaDetectes.add(
        motNormalise
    );

    //==================================================
    // 📚 DÉJÀ DANS NEO_LEARN
    //==================================================

    if (
        motsDejaAppris.has(
            motNormalise
        )
    ) {

        console.log(
            "📚 [NeoLearn] Déjà appris :",
            mot
        );

        continue;
    }

    //==================================================
    // 🧠 RECHERCHE DANS NEOAI
    //==================================================

    let connaissance = null;

    try {

        connaissance =
            NeoAI.neoRechercherMot(
                mot
            );

    } catch (error) {

        console.error(
            "⚠️ [NeoLearn] Erreur recherche :",
            error
        );
    }

    //==================================================
    // ✅ MOT DÉJÀ CONNU PAR NEOAI
    //==================================================

    if (
        connaissance?.trouve === true
    ) {

        console.log(
            "🧠 [NeoLearn] Mot déjà connu par NeoAI :",
            mot
        );

        continue;
    }

    //==================================================
    // 🆕 NOUVEAU MOT
    //==================================================

    console.log(
        "🆕 [NeoLearn] Nouveau mot détecté :",
        mot
    );

    nouveauxMots.push(
        mot
    );
}

//======================================================
// 📚 FUSION
//======================================================

const tousLesMots = [
    ...motsDejaAppris.values(),
    ...nouveauxMots
];

//======================================================
// 🚫 SUPPRESSION DES DOUBLONS
//======================================================

const motsUniques =
    new Map();

for (
    const mot of tousLesMots
) {

    const normalise =
        normaliser(mot);

    if (
        !normalise
    ) {
        continue;
    }

    if (
        !motsUniques.has(normalise)
    ) {

        motsUniques.set(
            normalise,
            mot
        );
    }
}

//======================================================
// 🔤 TRI ALPHABÉTIQUE
//======================================================

const listeTriee =
    [
        ...motsUniques.values()
    ]
    .sort(
        (a, b) =>
            normaliser(a).localeCompare(
                normaliser(b),
                "fr",
                {
                    sensitivity: "base"
                }
            )
    );

//======================================================
// 📝 NOUVEAU CONTENU DU TABLEAU
//======================================================

const nouvelleListe =
    listeTriee
        .map(
            mot =>
                `\n        "${mot}",`
        )
        .join("");

//======================================================
// 🔄 REMPLACEMENT EXACT DU TABLEAU FR
//======================================================

const nouveauContenu =
    contenu.slice(
        0,
        debutTableau + 1
    ) +
    nouvelleListe +
    "\n    " +
    contenu.slice(
        finTableau
    );

//======================================================
// 📝 VÉRIFICATION AVANT ÉCRITURE
//======================================================

console.log(
    "📚 [NeoLearn] Total après apprentissage :",
    listeTriee.length
);

console.log(
    "🆕 [NeoLearn] Nouveaux mots :",
    nouveauxMots
);

console.log(
    "📁 [NeoLearn] Fichier :",
    cheminNeoAI
);

//======================================================
// 💾 SAUVEGARDE RÉELLE
//======================================================

try {

    fs.writeFileSync(
        cheminNeoAI,
        nouveauContenu,
        {
            encoding: "utf8",
            flag: "w"
        }
    );

    console.log(
        "✅ [NeoLearn] NeoAI.js modifié avec succès."
    );

} catch (error) {

    console.error(
        "❌ [NeoLearn] Écriture NeoAI.js :",
        error
    );

    return repondre(
        "❌ Impossible d'enregistrer les nouveaux mots."
    );
}

//======================================================
// 🔎 VÉRIFICATION PHYSIQUE DU FICHIER
//======================================================

try {

    const verification =
        fs.readFileSync(
            cheminNeoAI,
            "utf8"
        );

    const verificationFr =
        verification.indexOf(
            "fr:",
            verification.indexOf(
                "const NEO_LEARN"
            )
        );

    const verificationDebut =
        verification.indexOf(
            "[",
            verificationFr
        );

    const verificationFin =
        verification.indexOf(
            "]",
            verificationDebut
        );

    const verificationBloc =
        verification.slice(
            verificationDebut,
            verificationFin + 1
        );

    console.log(
        "🔎 [NeoLearn] NEO_LEARN.fr après écriture :"
    );

    console.log(
        verificationBloc
    );

} catch (error) {

    console.error(
        "⚠️ [NeoLearn] Vérification impossible :",
        error
    );
}                

        //======================================================
        // 📚 AUCUN NOUVEAU MOT
        //======================================================
        if (!nouveauxMots.length) {

            return ovl.sendMessage(
                ms_org,
                {
                    text:
                        "🧠🌀 *NeoAI Learn*\n" +
                        "━━━━━━━━━━━━━━━━━━\n\n" +
                        "📝📚   *Mots enregistrés*\n" +
                        "Aucun nouveau mot.\n\n" +
                        "📁🔎 *Base : NeoAI🌀✳️*\n" +
                        "✅ NeoAI connaît déjà tous les mots.\n\n" +
                        "╰──────────────────\n" +
                        "         *Powered by NEOVERSE™🌀*"
                },
                {
                    quoted: ms
                }
            );

        }

        //======================================================
        // 📝 LISTE DES NOUVEAUX MOTS
        //======================================================
        const liste =
            nouveauxMots
                .map(
                    mot =>
                        `-${mot}`
                )
                .join("\n");

        //======================================================
        // 🧠 RÉSULTAT FINAL
        //======================================================

        return ovl.sendMessage(
            ms_org,
            {
                text:
                    "🧠🌀 *NeoAI Learn*\n" +
                    "━━━━━━━━━━━━━━━━━━\n" +
                    "📝📚   *Mots enregistrés*\n" +
                    `${liste}\n\n` +
                    "📁🔎 *Base : NeoAI🌀✳️*\n" +
                    `✅ NeoAI connaît maintenant ${nouveauxMots.length > 1 ? "ces mots." : "ce mot."}\n\n` +
                    "╰──────────────────\n" +
                    "         *Powered by NEOVERSE™🌀*"
            },
            {
                quoted: ms
            }
        );

    }
);    

//==============================================================
// 📤 EXPORTS
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

module.exports.extraireTexteNeoAI =
  extraireTexteNeoAI;
