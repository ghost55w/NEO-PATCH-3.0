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
    // 2️⃣ EXTRACTION DES MOTS
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
    // 3️⃣ RECHERCHE DE CHAQUE MOT DANS NEOAI.JS
    //==========================================================

    const motsAnalyses = [];

    for (const mot of mots) {

        let connaissance = null;

        if (
            typeof NeoAI.neoRechercherMot === "function"
        ) {
            connaissance =
                NeoAI.neoRechercherMot(mot);
        }

        motsAnalyses.push({

            mot,

            connu:
                connaissance?.trouve === true,

            categories:
                connaissance?.categories || []

        });
    }

    //==========================================================
    // 4️⃣ COMPRÉHENSION DU TEXTE
    //==========================================================

    const comprehension = {

        sujet: null,

        actions: [],

        directions: [],

        objets: [],

        cibles: [],

        lieux: [],

        temps: [],

        contexte: "general"

    };

    // On parcourt les connaissances trouvées
    for (const element of motsAnalyses) {

        if (!element.connu) continue;

        for (const categorie of element.categories) {

            const nom =
                String(
                    categorie.categorie || ""
                ).toLowerCase();

            // Direction
            if (
                nom.includes("direction")
            ) {

                comprehension.directions.push(
                    element.mot
                );
            }

            // Verbe
if (
    nom.includes("verbe")
) {

    const indexMot =
        mots.indexOf(element.mot);

    const motAvant =
        mots
            .slice(
                Math.max(0, indexMot - 6),
                indexMot
            )
            .map(m => String(m).toLowerCase());

    if (
        String(element.mot).toLowerCase() === "venir" &&
        motAvant.includes("voyant")
    ) {
        continue;
    }

    comprehension.actions.push({

        verbe: element.mot,

        categories:
            element.categories

    });
}

            // Temps
            if (
                nom.includes("temps")
            ) {

                comprehension.temps.push(
                    element.mot
                );
            }
        }
    }

    //==========================================================
    // 5️⃣ DÉTECTION DU SUJET
    //==========================================================

let indexActionPrincipale = -1;

for (let i = 0; i < motsAnalyses.length; i++) {

    const mot = String(
        motsAnalyses[i].mot || ""
    ).toLowerCase();

    const estVerbe =
        motsAnalyses[i].categories?.some(
            c =>
                String(
                    c.categorie || ""
                )
                .toLowerCase()
                .includes("verbe")
        );

    if (!estVerbe) continue;

    // ------------------------------------------------------
    // "venir" après "voyant ... le coup de poing"
    // n'est pas l'action principale.
    // ------------------------------------------------------

    if (
        mot === "venir" &&
        mots
            .slice(
                Math.max(0, i - 6),
                i
            )
            .some(
                m =>
                    String(m).toLowerCase() === "voyant"
            )
    ) {
        continue;
    }

    indexActionPrincipale = i;
    break;
}


// ---------------------------------------------------------
// Détection du sujet
// ---------------------------------------------------------

if (indexActionPrincipale > 0) {

    const avantAction =
        mots
            .slice(
                0,
                indexActionPrincipale
            );

    const indexIl =
        avantAction.findIndex(
            m =>
                String(m).toLowerCase() === "il"
        );

    if (indexIl > 0) {

        const candidat =
            avantAction
                .slice(0, indexIl)
                .join(" ")
                .trim();

        if (candidat) {
            comprehension.sujet = candidat;
        }

    } else {

        comprehension.sujet =
            avantAction
                .join(" ")
                .trim();
    }
}

    //==========================================================
    // 6️⃣ CONTEXTE
    //==========================================================

    if (
        comprehension.directions.length > 0 &&
        comprehension.actions.length > 0
    ) {

        comprehension.contexte =
            "deplacement";
    }

    //==========================================================
    // 7️⃣ REFORMULATION
    //==========================================================

    let reformulation = texte;

    if (
        comprehension.sujet &&
        comprehension.actions.length
    ) {

        const action =
            comprehension.actions[0].verbe;

        if (
            comprehension.contexte === "deplacement" &&
            comprehension.directions.length
        ) {

            const direction =
                comprehension.directions[0];

            reformulation =
                `${comprehension.sujet} se déplacent en direction du ${direction}.`;

        } else {

            reformulation =
                `${comprehension.sujet} ${action}.`;
        }
    }

    //==========================================================
    // 8️⃣ RÉSULTAT FINAL
    //==========================================================
return {

    success: true,

    texteOriginal,

    texte,

    nombreMots: mots.length,

    mots: motsAnalyses,

    motsConnus: motsAnalyses
        .filter(m => m.connu)
        .map(m => m.mot),

    motsInconnus: motsAnalyses
        .filter(m => !m.connu)
        .map(m => m.mot),

    nombreMotsConnus:
        motsAnalyses.filter(m => m.connu).length,

    nombreMotsInconnus:
        motsAnalyses.filter(m => !m.connu).length,

    comprehension,

    reformulation,

    dateAnalyse: Date.now()

};
    
}


//==============================================================
// 🧠 NEO AI — AFFICHAGE DU RÉSULTAT
//==============================================================

async function envoyerResultatNeoAI(ovl, chatJid, resultat) {

    const c = resultat.comprehension;

    let comprehension = "";

    if (c.sujet) {
        comprehension += `• Sujet : ${c.sujet}\n`;
    }

    if (c.actions.length) {
        comprehension += `• Action : ${
            c.actions
                .map(a => a.verbe)
                .join(", ")
        }\n`;
    }

    if (c.directions.length) {
        comprehension += `• Direction : ${
            c.directions.join(", ")
        }\n`;
    }

    if (c.objets.length) {
        comprehension += `• Objet : ${
            c.objets.join(", ")
        }\n`;
    }

    if (c.cibles.length) {
        comprehension += `• Cible : ${
            c.cibles.join(", ")
        }\n`;
    }

    if (c.lieux.length) {
        comprehension += `• Lieu : ${
            c.lieux.join(", ")
        }\n`;
    }

    if (c.temps.length) {
        comprehension += `• Temps : ${
            c.temps.join(", ")
        }\n`;
    }

    if (!comprehension) {
        comprehension = "• Compréhension insuffisante";
    }

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
