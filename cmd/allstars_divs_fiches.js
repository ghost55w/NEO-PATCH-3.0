const { ovlcmd } = require("../lib/ovlcmd");
const { getData, setfiche, getAllFiches, add_id, del_fiche } = require('../DataBase/allstars_divs_fiches');

const registeredFiches = new Set();

// ================= UTILITAIRES =================

function normalizeText(text) {
  return text
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function countCards(cardsRaw) {
  if (!cardsRaw) return 0;
  return cardsRaw
    .split("\n")
    .map(c => c.trim())
    .filter(Boolean).length;
}

// ================= CONSTANTES =================

const MAX_LEVEL = 20;

const LEVEL_REWARD_FIXED = {
  golds: 500000,
  fans: 50000
};

// ================= RECOMPENSES =================

async function giveLevelRewards(jid, level, ovl, ms) {
  const dataRaw = await getData({ jid });
  const data = dataRaw?.dataValues ?? dataRaw ?? {};

  for (const [col, value] of Object.entries(LEVEL_REWARD_FIXED)) {
    const oldVal = Number(data[col]) || 0;
    await setfiche(col, oldVal + value, jid);
  }

  await ovl.sendMessage(ms, {
    text:
`🎁 *Récompenses niveau ${level} !*

💰 Golds +${LEVEL_REWARD_FIXED.golds}
👥 Fans +${LEVEL_REWARD_FIXED.fans}`
  });
}

// ================= LEVEL SYSTEM =================

async function checkLevel(jid, oldExp, newExp, ovl, ms_org) {

  oldExp = Number(oldExp) || 0;
  newExp = Number(newExp) || 0;

  const dataRaw = await getData({ jid });
  const data = dataRaw?.dataValues ?? dataRaw ?? {};

  let currentLevel = Number(data.niveau) || 0;

  const oldLevel = Math.floor(oldExp / 100);
  const newLevel = Math.floor(newExp / 100);

  // 🔼 LEVEL UP
  if (newLevel > oldLevel) {

    const levelsGained = newLevel - oldLevel;

    for (let i = 0; i < levelsGained; i++) {

      if (currentLevel >= MAX_LEVEL) break;

      currentLevel++;
      await setfiche("niveau", currentLevel, jid);

      await ovl.sendMessage(ms_org, {
        text: `🏆 Promotion ! @${jid.split('@')[0]} passe niveau ${currentLevel} ▲`,
        mentions: [jid]
      });

      await giveLevelRewards(jid, currentLevel, ovl, ms_org);
    }
  }

  // 🔽 LEVEL DOWN
  else if (newLevel < oldLevel) {

    const levelsLost = oldLevel - newLevel;

    for (let i = 0; i < levelsLost; i++) {

      if (currentLevel <= 0) break;

      currentLevel--;
      await setfiche("niveau", currentLevel, jid);

      await ovl.sendMessage(ms_org, {
        text: `🔻 @${jid.split('@')[0]} redescend niveau ${currentLevel} ▼`,
        mentions: [jid]
      });
    }
  }
}

// ================= UPDATE DATA =================

async function updatePlayerData(updates, jid, ovl, ms_org) {

  for (const update of updates) {

    await setfiche(update.colonne, update.newValue, jid);

    if (update.colonne === "exp") {
      await checkLevel(jid, update.oldValue, update.newValue, ovl, ms_org);
    }
  }
}

// ================= PROCESS UPDATES =================

async function processUpdates(args, jid) {

  if (!args || !args.length) throw new Error("Arguments manquants pour mise à jour");

  const updates = [];

  const dataRaw = await getData({ jid });
  const values = dataRaw?.dataValues ?? dataRaw ?? {};
  const columns = Object.keys(values);

  let i = 0;

  while (i < args.length) {

    const object = args[i++];
    const signe = args[i++];

    if (!object || !signe) throw new Error("Arguments incomplets");

    if (!columns.includes(object)) {
      throw new Error(`Colonne inexistante : ${object}`);
    }

    const oldValue = values[object];
    let newValue;

    let texte = [];

    if (object === "commentaire") {
      texte = args.slice(i);
      i = args.length;
    } else {
      while (
        i < args.length &&
        !['+', '-', '=', 'add', 'supp'].includes(args[i]) &&
        !columns.includes(args[i])
      ) {
        texte.push(args[i++]);
      }
    }

    texte = texte.join(" ");

    // ===== CARDS =====
    if (object === "cards") {

      let list = (oldValue || "").split("\n").filter(Boolean);

      const items = texte
        ? texte.split(",").map(x => x.trim()).filter(Boolean)
        : [];

      if (signe === "+") {
        for (const card of items) {
          if (!list.some(c => normalizeText(c) === normalizeText(card))) {
            list.push(card);
          }
        }
      }
      else if (signe === "-") {
        list = list.filter(c =>
          !items.map(normalizeText).includes(normalizeText(c))
        );
      }
      else if (signe === "=") {
        newValue = items.length ? items.join("\n") : list.join("\n");
        updates.push({ colonne: "cards", oldValue, newValue });
        continue;
      }
      else {
        throw new Error("Cards accepte seulement + - =");
      }

      newValue = list.join("\n");
      updates.push({ colonne: "cards", oldValue, newValue });
      continue;
    }

    // ===== NUMERIQUE =====
    if (signe === "+" || signe === "-") {
      const n1 = Number(oldValue) || 0;
      const n2 = Number(texte) || 0;
      newValue = signe === "+" ? n1 + n2 : n1 - n2;
    }

    // ===== REMPLACEMENT =====
    else if (signe === "=") {
      newValue = texte;
    }

    // ===== AJOUT TEXTE =====
    else if (signe === "add") {
      newValue = (oldValue + " " + texte).trim();
    }

    // ===== SUPPRESSION TEXTE =====
    else if (signe === "supp") {
      newValue = (oldValue || "").replace(new RegExp(texte, "gi"), "").trim();
    }

    else {
      throw new Error(`Signe invalide : ${signe}`);
    }

    updates.push({ colonne: object, oldValue, newValue });
  }

  return updates;
}

// ================= ADD OR UPDATE FICHE =================

async function addOrUpdateFiche(code_fiche, jid, image_oc, division) {

  const existing = await getData({ jid });

  if (existing) {
    await setfiche("code_fiche", code_fiche, jid);
    await setfiche("division", division, jid);
    await setfiche("oc_url", image_oc, jid);
  }
  else {
    await add_id(jid, {
      code_fiche,
      division,
      oc_url: image_oc
    });
  }

  registeredFiches.add(code_fiche);
}

// ================= INIT AUTO =================

async function initFichesAuto(ovl) {
  console.log("[INIT] Début chargement fiches...");

  try {
    const all = await getAllFiches();
    console.log(`[INIT] ${all?.length || 0} fiches trouvées en base`);

    if (!all?.length) return;

    for (const player of all) {

      if (!player.code_fiche || !player.jid) continue;

      registeredFiches.delete(player.code_fiche);

      add_fiche(
        player.code_fiche,
        player.jid,
        player.oc_url || "",
        player.division || "Other",
        ovl
      );
    }

    console.log(`[INIT] ${registeredFiches.size} commandes dynamiques enregistrées`);
    console.log("Fiches chargées ✅");
  } catch (e) {
    console.error("Erreur initFichesAuto:", e);
  }
}

initFichesAuto(ovl);

// ================= ADD FICHE =================

function add_fiche(nom_joueur, jid_real, image_oc, joueur_div, ovl) {

  if (registeredFiches.has(nom_joueur)) registeredFiches.delete(nom_joueur);
  registeredFiches.add(nom_joueur);

  if (!ovl) return; // si ovl non fourni, on ne crée pas la commande

  ovlcmd({
    nom_cmd: nom_joueur,
    classe: joueur_div,
    react: "✅"
  },

  async (ms_org, ovl_instance, cmd_options) => {

    const { repondre, ms, arg, prenium_id } = cmd_options;

    try {

      const dataRaw = await getData({ jid: jid_real });
      if (!dataRaw) return await repondre("❌ Fiche introuvable pour ce joueur.");

      const data = dataRaw?.dataValues ?? dataRaw ?? {};

      const pseudo = data.pseudo ?? "Non défini";
      const user = data.user ?? "Non défini";
      const surnom = data.surnom ?? "Aucun";
      const classement = data.classement ?? "Non classé";
      const exp = Number(data.exp) || 0;
      const niveau = Math.min(Number(data.niveau) || 0, 20);
      const division = data.division ?? joueur_div ?? "Other";
      const rang = data.rang ?? "Non défini";
      const classe = data.classe ?? "Non défini";
      const golds = Number(data.golds) || 0;
      const fans = Number(data.fans) || 0;
      const archetype = data.archetype ?? "Non défini";

      const victoires = Number(data.victoires) || 0;
      const defaites = Number(data.defaites) || 0;

      const cardsRaw = data.cards ?? "";
      const image = data.oc_url || image_oc || "https://files.catbox.moe/4quw3r.jpg";

      if (!arg.length) {

        const fiche = `░▒░ *👤N E O P L A Y E R | RAZORX⚡™ 🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Pseudo👤*: ${data.pseudo}
◇ *User👤*: ${data.user}
◇ *Surnom(s)👤*: ${data.surnom}
◇ *Classement continental🌍:* ${data.classement}
◇ *Experience⏫:* ${data.exp} Exp
◇ *Niveau🎖️*: ${data.niveau} ▲
◇ *Division🛡️*: ${data.division}
◇ *Rank 🎖️*: ${data.rang}
◇ *Classe🎖️*: ${data.classe}

▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
◇ *Golds🧭*: ${data.golds} ©🧭
◇ *Fans👥*: ${data.fans} 👥
◇ *Archetype ⚖️*: ${data.archetype}

░▒░░ PALMARÈS🏆
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
✅ Victoires: ${data.victoires} - ❌ Défaites: ${data.defaites}
*◇🏆Championnats*: ${data.championnants}
*◇🏆NEO cup💫*: ${data.neo_cup}
*◇🏆EVO💠*: ${data.evo}
*◇🏆GrandSlam🅰️*: ${data.grandslam}
*◇🌟TOS*: ${data.tos}
*◇👑The BEST🏆*: ${data.the_best}
*◇🗿Sigma🏆*: ${data.sigma}
*◇🎖️Neo Globes*: ${data.neo_globes}
*◇🏵️Golden Rookie🏆*: ${data.golden_boy}

░▒░▒░ STATS 📊
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
📈 Note: ${data.note}/100
⌬ *Talent⭐:* ▱▱▱▱▬▬▬ ${data.talent}
⌬ *Strikes👊🏻:* ▱▱▱▱▬▬▬ ${data.strikes}
⌬ *Attaques🌀:* ▱▱▱▱▬▬▬ ${data.attaques}

░▒░▒░ CARDS 🎴: ${countCards(data.cards)}
▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░
🎴 ${data.cards.split("\n").join(" • ")}

╰───────────────────
░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░`;

        return ovl.sendMessage(
          ms_org,
          {
            image: { url: data.oc_url },
            caption: fiche
          },
          { quoted: ms }
        );
      }

      if (!prenium_id) {
        return await repondre("⛔ Accès refusé ! Seuls les membres autorisés peuvent modifier.");
      }

      const updates = await processUpdates(arg, jid_real);
      await updatePlayerData(updates, jid_real, ovl, ms_org);

      const message = updates
        .map(u => `🛠️ *${u.colonne}* : \`${u.oldValue}\` ➤ \`${u.newValue}\``)
        .join("\n");

      await repondre("✅ Fiche mise à jour avec succès !\n\n" + message);

    } catch (err) {
      console.error("Erreur fiche:", err);
      await repondre("❌ Une erreur est survenue. Vérifie les paramètres.");
    }
  });
}

// ================= COMMANDES =================

ovlcmd({
  nom_cmd: "add_fiche",
  classe: "Other",
  react: "➕"
},

async (ms_org, ovl, { repondre, arg, prenium_id }) => {

  if (!prenium_id) return repondre("Accès refusé.");
  if (arg.length < 3) return repondre("Syntaxe : add_fiche <jid> <code> <division>");

  const jid = arg[0];
  const code = arg[1];
  const division = arg.slice(2).join(" ");

  await addOrUpdateFiche(code, jid, "", division);
  await initFichesAuto(ovl);

  await repondre("✅ Fiche créée.");
});

ovlcmd({
  nom_cmd: "del_fiche",
  classe: "Other",
  react: "🗑️"
},

async (ms_org, ovl, { repondre, arg, prenium_id }) => {

  if (!prenium_id) return repondre("Accès refusé !");
  if (!arg.length) return repondre("Syntaxe : del_fiche <code>");

  await del_fiche(arg.join(" "));
  await initFichesAuto(ovl);

  await repondre("Fiche supprimée.");
});
