const { ovlcmd } = require("../lib/ovlcmd");
const { getData, setfiche, getAllFiches, add_id, del_fiche } = require('../DataBase/allstars_divs_fiches');

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
      // Utilisation stricte de playerJid propre à cette instance de commande
      const data = await getData({ jid: playerJid });

      // Sécurité : Vérification et valeurs par défaut pour éviter un crash au moment du split
      const cardsText = data.cards || "";
      const cardsFormatted = cardsText ? cardsText.split("\n").join(" • ") : "Aucune";
      const count = countCards(cardsText);

      if (!arg.length) {
        const fiche = `░▒░ *👤N E O P L A Y E R | RAZORX⚡™ 🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Pseudo👤*: ${data.pseudo || 'aucun'}
◇ *Classement continental🌍:* ${data.classement || 'aucun'}
◇ *Niveau🎖️*: ${data.niveau || 1} ▲
◇ *Division🛡️*: ${data.division || 'aucun'}
◇ *Rank 🎖️*: ${data.rang || 'aucun'}
◇ *Classe🎖️*: ${data.classe || 'aucun'}

▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Golds🧭*: ${data.golds || 0} ©🧭
◇ *Fans👥*: ${data.fans || 0} 👥
◇ *Archetype ⚖️*: ${data.archetype || 'aucun'}

░▒░░ PALMARÈS🏆
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
✅ Victoires: ${data.victoires || 0} - ❌ Défaites: ${data.defaites || 0}
*◇🏆Championnats*: ${data.championnants || 0}
*◇🏆NEO cup💫*: ${data.neo_cup || 0}
*◇🏆WORLDS💠*: ${data.evo || 0}
*◇🏆GrandSlam🅰️*: ${data.grandslam || 0}
*◇🌟TOS*: ${data.tos || 0}
*◇👑The BEST🏆*: ${data.the_best || 0}
*◇🗿Laureat🏆*: ${data.sigma || 0}
*◇🎖️Neo Globes*: ${data.neo_globes || 0}
*◇🏵️Golden Rookie🏆*: ${data.golden_boy || 0}

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

        await ovl.sendMessage(ms_org, {
          video: { url: 'https://files.catbox.moe/zbo1fz.mp4' },
          gifPlayback: true,
          caption: ""
        }, { quoted: ms });

        return ovl.sendMessage(ms_org, {
          image: { url: data.oc_url || image_oc },
          caption: fiche
        }, { quoted: ms });
      }

      if (!prenium_id) return await repondre("⛔ Accès refusé ! Seuls les membres de la NS peuvent faire ça.");

      const updates = await processUpdates(arg, playerJid);
      await updatePlayerData(updates, playerJid);

      const message = updates.map(u =>
        `🛠️ *${u.colonne}* modifié : \`${u.oldValue}\` ➤ \`${u.newValue}\``
      ).join('\n');

      await repondre("✅ Fiche mise à jour avec succès !\n\n" + message);

    } catch (err) {
      console.error(`Erreur sur la commande ${nom_joueur}:`, err);
      await repondre("❌ Une erreur est survenue lors de la lecture de la fiche.");
    }
  });
}

async function processUpdates(args, jid) {
  const updates = [];
  const data = await getData({ jid: jid });
  const rawValues = data.get ? data.get({ plain: true }) : data;
  const columns = Object.keys(rawValues);
  let i = 0;

  while (i < args.length) {
    const object = args[i++];
    const signe = args[i++];

    let texte = [];
    while (i < args.length && !['+', '-', '=', 'add', 'supp'].includes(args[i]) && !columns.includes(args[i])) {
      texte.push(args[i++]);
    }

    if (!columns.includes(object)) {
      throw new Error(`❌ La colonne '${object}' n'existe pas.`);
    }

    const oldValue = data[object];
    let newValue;

    if (object === "cards") {
      const old = oldValue || "";
      let list = old.split("\n").filter(x => x.trim() !== "");

      const fullText = texte.join(" ");
      const items = fullText.length ? fullText.split(",").map(x => x.trim()).filter(x => x.length > 0) : [];

      if (signe === "+") {
        for (const card of items) {
          if (!list.includes(card)) list.push(card);
        }
      } else if (signe === "-") {
        for (const card of items) {
          list = list.filter(c => c !== card);
        }
      } else if (signe === "=") {
        list = items;
      } else {
        throw new Error("❌ Le champ 'cards' accepte uniquement '+', '-' ou '='");
      }

      newValue = list.join("\n");

      updates.push({
        colonne: "cards",
        oldValue: old,
        newValue
      });

      continue;
    }

    if (signe === "+" || signe === "-") {
      const n1 = Number(oldValue) || 0;
      const n2 = Number(texte.join(" ")) || 0;
      newValue = signe === "+" ? n1 + n2 : n1 - n2;
    } else if (signe === "=") {
      newValue = texte.join(" ");
    } else if (signe === "add") {
      newValue = (oldValue + " " + texte.join(" ")).trim();
    } else if (signe === "supp") {
      const regex = new RegExp(`\\b${normalizeText(texte.join(" "))}\\b`, "gi");
      newValue = (oldValue || "").replace(regex, "").trim();
    } else {
      throw new Error(`❌ Signe non reconnu : ${signe}`);
    }

    updates.push({
      colonne: object,
      oldValue,
      newValue
    });
  }

  return updates;
}

async function updatePlayerData(updates, jid) {
  for (const update of updates) {
    await setfiche(update.colonne, update.newValue, jid);
  }
}

async function initFichesAuto() {
    try {
        const all = await getAllFiches();

        console.log("Nombre de fiches :", all.length);

        for (const player of all) {
            console.log(
                "Chargement :",
                player.code_fiche,
                "| division :", player.division,
                "| jid :", player.jid
            );

            if (!player.code_fiche || player.code_fiche === "pas de fiche" || !player.division || !player.oc_url || !player.id)
                continue;

            add_fiche(
                player.code_fiche,
                player.jid,
                player.oc_url,
                player.division.replace(/\*/g, "")
            );
        }

        console.log("Commandes enregistrées :", registeredFiches.size);

    } catch (e) {
        console.error(e);
    }
}

initFichesAuto();

ovlcmd({
  nom_cmd: "add_fiche",
  alias: [],
  classe: "Other",
  react: "➕",
}, async (ms_org, ovl, { repondre, arg, prenium_id }) => {
  if (!prenium_id) return await repondre("⛔ Accès refusé !");
  if (arg.length < 3) return await repondre("❌ Syntaxe : add_fiche <jid> <code_fiche> <division>");

  const jid = arg[0];
  const code_fiche = arg[1];
  const division = arg.slice(2).join(" ");

  try {
    await add_id(jid, { code_fiche, division });
    await initFichesAuto();

    await repondre(
      `✅ Nouvelle fiche enregistrée :\n` +
      `• *JID* : \`${jid}\`\n` +
      `• *Code Fiche* : \`${code_fiche}\`\n` +
      `• *Division* : \`${division}\``
    );
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout de la fiche :", err);
    await repondre("❌ Erreur lors de l'ajout de la fiche. Vérifie la console pour plus de détails.");
  }
});

ovlcmd({
  nom_cmd: "del_fiche",
  classe: "Other",
  react: "🗑️",
}, async (ms_org, ovl, { repondre, arg, prenium_id }) => {
  if (!prenium_id) return await repondre("⛔ Accès refusé !");
  if (!arg.length) return await repondre("❌ Syntaxe : del_fiche <code_fiche>");

  const code_fiche = arg.join(' ');
  try {
    const deleted = await del_fiche(code_fiche);
    if (deleted === 0) return await repondre("❌ Aucune fiche trouvée.");
    registeredFiches.delete(code_fiche);
    await repondre(`✅ Fiche supprimée : \`${code_fiche}\``);
    await initFichesAuto();
  } catch (err) {
    console.error(err);
    await repondre("❌ Erreur lors de la suppression de la fiche.");
  }
});
