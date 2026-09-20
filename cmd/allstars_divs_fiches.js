const { ovlcmd } = require("../lib/ovlcmd");
const { getData, setfiche, getAllFiches, add_id, del_fiche } = require('../DataBase/allstars_divs_fiches');
const axios = require("axios");

const registeredFiches = new Set();

function normalizeText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function countCards(cardsRaw) {
  if (!cardsRaw) return 0;

  return cardsRaw
    .split("\n")
    .map(c => c.trim())
    .filter(Boolean).length;
}

// ===============================================================
// 🖼️ TÉLÉCHARGEMENT DE L'IMAGE DE FICHE
// ===============================================================

async function telechargerImageFiche(url) {

  if (!url || url === "aucun") {
    return null;
  }

  console.log(
    "🌐 Téléchargement image fiche :",
    url
  );

  try {

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxContentLength: 15 * 1024 * 1024,
      maxBodyLength: 15 * 1024 * 1024,
      validateStatus: status =>
        status >= 200 && status < 300
    });

    const contentType =
      response.headers["content-type"] || "";

    console.log(
      "📦 Image reçue :",
      contentType,
      "|",
      response.data.length,
      "octets"
    );

    if (!contentType.startsWith("image/")) {

      console.error(
        "❌ Catbox n'a pas renvoyé une image."
      );

      return null;
    }

    return Buffer.from(response.data);

  } catch (err) {

    console.error(
      "❌ Erreur téléchargement image :",
      err.code || err.message
    );

    return null;
  }
}

// ===============================================================
// 🏆 GESTION AUTOMATIQUE DU NIVEAU XP
// ===============================================================

function calculerNiveauXP(exp) {
  exp = Number(exp) || 0;

  // 0-99 XP  = niveau 1
  // 100-199  = niveau 2
  // 200-299  = niveau 3
  // etc.
  return Math.floor(exp / 100) + 1;
}


// ===============================================================
// 🔄 VÉRIFICATION AUTOMATIQUE DU NIVEAU
// ===============================================================

async function verifierNiveauXP(jid, ovl, chat) {

  try {

    const data = await getData({ jid });

    if (!data) {
      console.error("❌ Impossible de vérifier le niveau : fiche introuvable.");
      return;
    }

    const exp = Number(data.exp) || 0;

    const ancienNiveau =
      Number(data.niveau) || 1;

    const nouveauNiveau =
      calculerNiveauXP(exp);

    // Aucun changement
    if (ancienNiveau === nouveauNiveau) {
      return;
    }

    // ==========================================================
    // 💾 SAUVEGARDE DU NOUVEAU NIVEAU
    // ==========================================================

    await setfiche(
      "niveau",
      nouveauNiveau,
      jid
    );

    const mention =
      `@${jid.split("@")[0]}`;

    // ==========================================================
    // 🎉 LEVEL UP
    // ==========================================================

    if (nouveauNiveau > ancienNiveau) {

      const texte =
`🎉🎉🎉 ✨ *LEVEL UP* ✨ 🎉🎉🎉

🏆 *FÉLICITATIONS !* 🏆
👤 ${mention} vient d'atteindre le niveau supérieur !
⚡ Continue comme ça vers le sommet ! 🏆🏆🏆

🎖️ *Niveau :*
${ancienNiveau} ➜ 🌟 *${nouveauNiveau}*

⏫ *XP :*
${exp}/3000 XP

░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░`;

      // Image de fiche disponible
      if (data.oc_url && data.oc_url !== "aucun") {

        const image =
          await telechargerImageFiche(data.oc_url);

        if (image) {

          await ovl.sendMessage(
            chat,
            {
              image,
              caption: texte,
              mentions: [jid]
            },
            {
              quoted: null
            }
          );

          return;
        }
      }

      // Fallback texte
      await ovl.sendMessage(
        chat,
        {
          text: texte,
          mentions: [jid]
        }
      );

      return;
    }

    // ==========================================================
    // 🔻 LEVEL DOWN
    // ==========================================================

    if (nouveauNiveau < ancienNiveau) {

      const texte =
`🔻 *LEVEL DOWN* 🔻

👤 ${mention}

⚠️ Ton niveau a diminué.

🎖️ *Niveau :*
${ancienNiveau} ➜ *${nouveauNiveau}*

⏫ *XP :*
${exp}/3000 XP

░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░`;

      // Image disponible
      if (data.oc_url && data.oc_url !== "aucun") {

        const image =
          await telechargerImageFiche(data.oc_url);

        if (image) {

          await ovl.sendMessage(
            chat,
            {
              image,
              caption: texte,
              mentions: [jid]
            },
            {
              quoted: null
            }
          );

          return;
        }
      }

      // Fallback texte
      await ovl.sendMessage(
        chat,
        {
          text: texte,
          mentions: [jid]
        }
      );
    }

  } catch (error) {

    console.error(
      "❌ Erreur verifierNiveauXP :",
      error
    );
  }
}

function add_fiche(nom_joueur, playerJid, image_oc, joueur_div) {

  if (registeredFiches.has(nom_joueur)) return;

  registeredFiches.add(nom_joueur);

  console.log("Création de la commande :", nom_joueur);

  ovlcmd({
    nom_cmd: nom_joueur,
    classe: joueur_div,
    react: "✅"
  },
  async (ms_org, ovl, cmd_options) => {

    const { repondre, ms, arg, prenium_id } = cmd_options;

    try {

      // ==========================================================
      // 📥 RÉCUPÉRATION DE LA FICHE
      // ==========================================================

      // Utilisation stricte du JID associé à cette commande
      const data = await getData({
        jid: playerJid
      });

      // ==========================================================
      // 🎴 CARDS
      // ==========================================================

      const cardsText = data.cards || "";

      const cardsFormatted = cardsText
        ? cardsText.split("\n").join(" • ")
        : "Aucune";

      const count = countCards(cardsText);

      // ==========================================================
      // 👤 AFFICHAGE DE LA FICHE
      // ==========================================================

      if (!arg.length) {

        const fiche = `░▒░ *👤N E O P L A Y E R | RAZORX⚡™ 🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Pseudo👤*: ${data.pseudo || 'aucun'}
◇ *Classement continental🌍:* ${data.classement || 'aucun'}
◇ *Niveau🎖️*: ${data.niveau || 1} ▲
◇ *Division🛡️*: ${data.division || 'aucun'}
◇ *Rank 🎖️*: ${data.rang || 'aucun'}
◇ *Classe🎖️*: ${data.classe || 'aucun'}

▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Golds🧭*: ${data.golds || 0} ©🧭
◇ *Exp⏫*: ${data.exp || 0/3000} XP
◇ *Archetype ⚖️*: ${data.archetype || 'aucun'}

░▒░░ PALMARÈS🏆
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
✅ Victoires: ${data.victoires || 0} - ❌ Défaites: ${data.defaites || 0}
*◇🏆Championnats MVP*: ${data.championnants || 0}
*◇🏆NEO cup💫*: ${data.neo_cup || 0}
*◇🏆EVO💠*: ${data.evo || 0}
*◇🏆WORLDS🌟*: ${data.worlds || 0}
*◇🏆GrandSlam🅰️*: ${data.grandslam || 0}
*◇🌟TOS*: ${data.tos || 0}
*◇👑The BEST🏆*: ${data.the_best || 0}
*◇🗿Laureat🏆*: ${data.sigma || 0}
*◇🎖️Neo Globes*: ${data.neo_globes || 0}

░▒░▒░ STATS 📊
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
📈 Note: ${data.note || 0}/100
⌬ *Talent⭐:* ▱▱▱▱▬▬▬ ${data.talent || 0}
⌬ *Strikes👊🏻:* ▱▱▱▱▬▬▬ ${data.strikes || 0}
⌬ *Attaques🌀:* ▱▱▱▱▬▬▬ ${data.attaques || 0}

░▒░▒░ CARDS 🎴: ${count}
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
🎴 ${cardsFormatted}

╰───────────────────
░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░`;

        // ==========================================================
        // 🎬 VIDÉO D'INTRO
        // ==========================================================

        try {

          await ovl.sendMessage(
            ms_org,
            {
              video: {
                url: 'https://files.catbox.moe/zbo1fz.mp4'
              },
              gifPlayback: true,
              caption: ""
            },
            {
              quoted: ms
            }
          );

        } catch (videoError) {

          console.error(
            `⚠️ Erreur vidéo pour ${nom_joueur}:`,
            videoError
          );

        }

        // ==========================================================
        // 🖼️ IMAGE DE LA FICHE
        // ==========================================================

        const imageUrl = data.oc_url || image_oc;

        // Si aucune image n'est disponible,
        // on envoie directement la fiche en texte.
        if (!imageUrl || imageUrl === "aucun") {

          console.log(
            `ℹ️ Aucune image pour ${nom_joueur} → fiche texte`
          );

          return await ovl.sendMessage(
            ms_org,
            {
              text: fiche
            },
            {
              quoted: ms
            }
          );
        }

        // ==========================================================
        // 🖼️ TÉLÉCHARGEMENT + ENVOI DE L'IMAGE
        // ==========================================================

        try {

          console.log(
            `🖼️ Envoi image fiche ${nom_joueur}:`,
            imageUrl
          );

          const imageBuffer =
            await telechargerImageFiche(imageUrl);

          // Si le téléchargement échoue,
          // on passe directement à la fiche texte.
          if (!imageBuffer) {

            console.log(
              `↩️ Fallback → fiche texte pour ${nom_joueur}`
            );

            return await ovl.sendMessage(
              ms_org,
              {
                text: fiche
              },
              {
                quoted: ms
              }
            );
          }

          // Envoi du Buffer à WhatsApp
          return await ovl.sendMessage(
            ms_org,
            {
              image: imageBuffer,
              caption: fiche
            },
            {
              quoted: ms
            }
          );

        } catch (imageError) {

          console.error(
            `⚠️ Erreur envoi image ${nom_joueur}:`,
            imageError
          );

          console.log(
            `↩️ Fallback → envoi de la fiche sans image pour ${nom_joueur}`
          );

          try {

            return await ovl.sendMessage(
              ms_org,
              {
                text: fiche
              },
              {
                quoted: ms
              }
            );

          } catch (textError) {

            console.error(
              `❌ Impossible d'envoyer la fiche texte de ${nom_joueur}:`,
              textError
            );

            return await repondre(
              "❌ Impossible d'afficher la fiche."
            );
          }
        }
      }

      // ==========================================================
      // 🔐 MODIFICATION DE FICHE
      // ==========================================================

      if (!prenium_id) {
        return await repondre(
          "⛔ Accès refusé ! Seuls les membres de la NS peuvent faire ça."
        );
      }

      const updates = await processUpdates(
  arg,
  playerJid
);

await updatePlayerData(
  updates,
  playerJid
);

// ==========================================================
// 🏆 VÉRIFICATION AUTOMATIQUE XP → NIVEAU
// ==========================================================

const modificationXP =
  updates.find(
    update => update.colonne === "exp"
  );

if (modificationXP) {

  await verifierNiveauXP(
    playerJid,
    ovl,
    ms_org.chat
  );
}

      const message = updates
        .map(u =>
          `🛠️ *${u.colonne}* modifié : \`${u.oldValue}\` ➤ \`${u.newValue}\``
        )
        .join('\n');

      await repondre(
        "✅ Fiche mise à jour avec succès !\n\n" +
        message
      );

    } catch (err) {

      console.error(
        `Erreur sur la commande ${nom_joueur}:`,
        err
      );

      await repondre(
        "❌ Une erreur est survenue lors de la lecture de la fiche."
      );
    }
  });
}

// ===============================================================
// 🔄 TRAITEMENT DES MODIFICATIONS
// ===============================================================

async function processUpdates(args, jid) {

  const updates = [];

  const data = await getData({
    jid: jid
  });

  const rawValues = data.get
    ? data.get({ plain: true })
    : data;

  const columns = Object.keys(rawValues);

  let i = 0;

  while (i < args.length) {

    const object = args[i++];
    const signe = args[i++];

    let texte = [];

    while (
      i < args.length &&
      !['+', '-', '=', 'add', 'supp'].includes(args[i]) &&
      !columns.includes(args[i])
    ) {
      texte.push(args[i++]);
    }

    if (!columns.includes(object)) {
      throw new Error(
        `❌ La colonne '${object}' n'existe pas.`
      );
    }

    const oldValue = data[object];

    let newValue;

    // ==========================================================
    // 🎴 CARDS
    // ==========================================================

    if (object === "cards") {

      const old = oldValue || "";

      let list = old
        .split("\n")
        .filter(x => x.trim() !== "");

      const fullText = texte.join(" ");

      const items = fullText.length
        ? fullText
            .split(",")
            .map(x => x.trim())
            .filter(x => x.length > 0)
        : [];

      if (signe === "+") {

        for (const card of items) {

          if (!list.includes(card)) {
            list.push(card);
          }
        }

      } else if (signe === "-") {

        for (const card of items) {

          list = list.filter(
            c => c !== card
          );
        }

      } else if (signe === "=") {

        list = items;

      } else {

        throw new Error(
          "❌ Le champ 'cards' accepte uniquement '+', '-' ou '='"
        );
      }

      newValue = list.join("\n");

      updates.push({
        colonne: "cards",
        oldValue: old,
        newValue
      });

      continue;
    }

    // ==========================================================
    // 🔢 VALEURS NUMÉRIQUES
    // ==========================================================

    if (signe === "+" || signe === "-") {

      const n1 = Number(oldValue) || 0;

      const n2 =
        Number(texte.join(" ")) || 0;

      newValue =
        signe === "+"
          ? n1 + n2
          : n1 - n2;

    } else if (signe === "=") {

      newValue = texte.join(" ");

    } else if (signe === "add") {

      newValue = (
        oldValue +
        " " +
        texte.join(" ")
      ).trim();

    } else if (signe === "supp") {

      const regex = new RegExp(
        `\\b${normalizeText(texte.join(" "))}\\b`,
        "gi"
      );

      newValue = (
        oldValue || ""
      )
        .replace(regex, "")
        .trim();

    } else {

      throw new Error(
        `❌ Signe non reconnu : ${signe}`
      );
    }

    updates.push({
      colonne: object,
      oldValue,
      newValue
    });
  }

  return updates;
}

// ===============================================================
// 💾 MISE À JOUR BASE DE DONNÉES
// ===============================================================

async function updatePlayerData(updates, jid) {

  for (const update of updates) {

    await setfiche(
      update.colonne,
      update.newValue,
      jid
    );
  }
}

// ===============================================================
// 🔄 CHARGEMENT AUTOMATIQUE DES FICHES
// ===============================================================

async function initFichesAuto() {

  try {

    const all = await getAllFiches();

    console.log(
      "Nombre de fiches :",
      all.length
    );

    for (const player of all) {

      console.log(
        "Chargement :",
        player.code_fiche,
        "| division :",
        player.division,
        "| jid :",
        player.jid
      );

      // IMPORTANT :
      // oc_url n'est plus obligatoire.
      // Une fiche peut fonctionner sans image.

      if (
        !player.code_fiche ||
        player.code_fiche === "pas de fiche" ||
        !player.division ||
        !player.id
      ) {
        continue;
      }

      add_fiche(
        player.code_fiche,
        player.jid,
        player.oc_url,
        player.division.replace(/\*/g, "")
      );
    }

    console.log(
      "Commandes enregistrées :",
      registeredFiches.size
    );

  } catch (e) {

    console.error(e);
  }
}

initFichesAuto();

// ===============================================================
// ➕ AJOUT FICHE
// ===============================================================

ovlcmd({
  nom_cmd: "add_fiche",
  alias: [],
  classe: "Other",
  react: "➕",
},
async (ms_org, ovl, { repondre, arg, prenium_id }) => {

  if (!prenium_id) {
    return await repondre(
      "⛔ Accès refusé !"
    );
  }

  if (arg.length < 3) {
    return await repondre(
      "❌ Syntaxe : add_fiche <jid> <code_fiche> <division>"
    );
  }

  const jid = arg[0];

  const code_fiche = arg[1];

  const division =
    arg.slice(2).join(" ");

  try {

    await add_id(
      jid,
      {
        code_fiche,
        division
      }
    );

    await initFichesAuto();

    await repondre(
      `✅ Nouvelle fiche enregistrée :\n` +
      `• *JID* : \`${jid}\`\n` +
      `• *Code Fiche* : \`${code_fiche}\`\n` +
      `• *Division* : \`${division}\``
    );

  } catch (err) {

    console.error(
      "❌ Erreur lors de l'ajout de la fiche :",
      err
    );

    await repondre(
      "❌ Erreur lors de l'ajout de la fiche. Vérifie la console pour plus de détails."
    );
  }
});

// ===============================================================
// 🗑️ SUPPRESSION FICHE
// ===============================================================

ovlcmd({
  nom_cmd: "del_fiche",
  classe: "Other",
  react: "🗑️",
},
async (ms_org, ovl, { repondre, arg, prenium_id }) => {

  if (!prenium_id) {
    return await repondre(
      "⛔ Accès refusé !"
    );
  }

  if (!arg.length) {
    return await repondre(
      "❌ Syntaxe : del_fiche <code_fiche>"
    );
  }

  const code_fiche =
    arg.join(' ');

  try {

    const deleted =
      await del_fiche(code_fiche);

    if (deleted === 0) {
      return await repondre(
        "❌ Aucune fiche trouvée."
      );
    }

    registeredFiches.delete(
      code_fiche
    );

    await repondre(
      `✅ Fiche supprimée : \`${code_fiche}\``
    );

    await initFichesAuto();

  } catch (err) {

    console.error(err);

    await repondre(
      "❌ Erreur lors de la suppression de la fiche."
    );
  }
});
