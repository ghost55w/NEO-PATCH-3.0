const { Sequelize, DataTypes, Op } = require('sequelize');
const config = require('../set');
const db = config.DATABASE;

let sequelize;

if (!db) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.db',
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  });
}

const AllStarsDivsFiche = sequelize.define('AllStarsDivsFiche', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pseudo: { type: DataTypes.STRING, defaultValue: 'aucun' },
  classement: { type: DataTypes.STRING, defaultValue: 'aucun' },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  exp: { type: DataTypes.INTEGER, defaultValue: 0 },
  niveau: { type: DataTypes.INTEGER, defaultValue: 1 },
  division: { type: DataTypes.STRING, defaultValue: 'aucun' },
  rang: { type: DataTypes.STRING, defaultValue: 'aucun' },
  classe: { type: DataTypes.STRING, defaultValue: 'aucun' },
  saison_pro: { type: DataTypes.INTEGER, defaultValue: 0 },
  golds: { type: DataTypes.INTEGER, defaultValue: 0 },
  worlds: { type: DataTypes.INTEGER, defaultValue: 0 },
  archetype: { type: DataTypes.STRING, defaultValue: 'aucun' },
  commentaire: { type: DataTypes.TEXT, defaultValue: 'aucun' },
  victoires: { type: DataTypes.INTEGER, defaultValue: 0 },
  defaites: { type: DataTypes.INTEGER, defaultValue: 0 },
  championnats: { type: DataTypes.INTEGER, defaultValue: 0 },
  neo_cup: { type: DataTypes.INTEGER, defaultValue: 0 },
  evo: { type: DataTypes.INTEGER, defaultValue: 0 },
  grandslam: { type: DataTypes.INTEGER, defaultValue: 0 },
  tos: { type: DataTypes.INTEGER, defaultValue: 0 },
  the_best: { type: DataTypes.INTEGER, defaultValue: 0 },
  laureat: { type: DataTypes.INTEGER, defaultValue: 0 },
  sigma: { type: DataTypes.INTEGER, defaultValue: 0 },
  neo_globes: { type: DataTypes.INTEGER, defaultValue: 0 },
  golden_boy: { type: DataTypes.INTEGER, defaultValue: 0 },
  cleans: { type: DataTypes.INTEGER, defaultValue: 0 },
  erreurs: { type: DataTypes.INTEGER, defaultValue: 0 },
  note: { type: DataTypes.INTEGER, defaultValue: 0 },
  talent: { type: DataTypes.INTEGER, defaultValue: 0 },
  intelligence: { type: DataTypes.INTEGER, defaultValue: 0 },
  speed: { type: DataTypes.INTEGER, defaultValue: 0 },
  strikes: { type: DataTypes.INTEGER, defaultValue: 0 },
  attaques: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_cards: { type: DataTypes.INTEGER, defaultValue: 0 },
  cards: { type: DataTypes.TEXT, defaultValue: 'aucune' },
  source: { type: DataTypes.STRING, defaultValue: 'inconnu' },
  jid: { type: DataTypes.STRING, defaultValue: 'aucun' },
  oc_url: { type: DataTypes.STRING, defaultValue: 'https://files.catbox.moe/4quw3r.jpg' },
  code_fiche: { type: DataTypes.STRING, defaultValue: 'aucun' },

}, {
  tableName: 'allstars_divs_fiches',
  timestamps: false,
});

async function getAllFiches() {
  return await AllStarsDivsFiche.findAll();
}

async function getData(where = {}) {

  // ==========================================================
  // NORMALISATION DU JID
  // ==========================================================

  if (where.jid) {

    let jid = String(where.jid).trim();

    // Normalise les anciens formats WhatsApp
    jid = jid
      .replace("@whatsapp.net", "@s.whatsapp.net")
      .replace("@c.us", "@s.whatsapp.net");

    where.jid = jid;

    // Recherche normale
    let fiche = await AllStarsDivsFiche.findOne({
      where: {
        ...where,
        jid
      }
    });

    if (fiche) {
      return fiche;
    }

    // ==========================================================
    // SECOURS : RECHERCHE PAR NUMÉRO
    // ==========================================================
    //
    // Permet de retrouver une fiche même si le suffixe
    // du JID enregistré est différent.
    //
    // Exemple :
    // 243843265126@s.whatsapp.net
    // 243843265126@whatsapp.net
    // ==========================================================

    const numero = jid.split("@")[0];

    if (numero) {

      const fiches = await AllStarsDivsFiche.findAll();

      fiche = fiches.find(f => {

        if (!f.jid) return false;

        const jidFiche = String(f.jid).trim();
        const numeroFiche = jidFiche.split("@")[0];

        return numeroFiche === numero;
      });

      if (fiche) {
        console.log(
          `🔄 Fiche retrouvée par numéro : ${numero}`
        );

        return fiche;
      }
    }
  }

  // ==========================================================
  // AUTRES RECHERCHES
  // ==========================================================

  const fiche = await AllStarsDivsFiche.findOne({
    where
  });

  if (!fiche) {
    console.log("❌ Fiche introuvable :", where);
    throw new Error("Fiche inexistante");
  }

  return fiche;
}


/* ==========================================================
   🔄 SYNCHRONISATION AUTOMATIQUE DU CLASSEMENT ALL STARS
========================================================== */

async function synchroniserClassementAllStars() {
  try {
    const fiches = await AllStarsDivsFiche.findAll();

    // Seuls les joueurs ayant plus de 0 point sont classés.
    const joueurs = fiches
      .filter(fiche => Number(fiche.points) > 0)
      .sort((a, b) => {
        const difference = Number(b.points) - Number(a.points);

        // En cas d'égalité, conserver un ordre stable.
        return difference || Number(a.id) - Number(b.id);
      });

    const joueursClasses = new Set(
      joueurs.map(fiche => fiche.id)
    );

    
    // Enregistrer les positions avec suffixes et médailles.
    for (let i = 0; i < joueurs.length; i++) {
      const fiche = joueurs[i];
      const position = i + 1;

      let classement;

      if (position === 1) {
        classement = "1er🥇";
      } else if (position === 2) {
        classement = "2e🥈";
      } else if (position === 3) {
        classement = "3e🥉";
      } else {
        classement = `${position}e`;
      }

      if (String(fiche.classement) !== classement) {
        await fiche.update({ classement });
      }
    }


    // Retirer du classement les joueurs ayant 0 point ou moins.
    for (const fiche of fiches) {
      if (
        !joueursClasses.has(fiche.id) &&
        fiche.classement !== "aucun"
      ) {
        await fiche.update({
          classement: "aucun"
        });
      }
    }

    console.log(
      `🏆 Classement All Stars synchronisé : ${joueurs.length} joueur(s).`
    );

  } catch (error) {
    console.error(
      "❌ Erreur de synchronisation du classement All Stars :",
      error
    );

    throw error;
  }
}

async function setfiche(colonne, valeur, jid) {
  if (!jid) {
    throw new Error("JID requis");
  }

  let normalizedJid = String(jid)
    .trim()
    .replace("@whatsapp.net", "@s.whatsapp.net")
    .replace("@c.us", "@s.whatsapp.net");

  const updateData = {};
  updateData[colonne] = valeur;

  let [updated] = await AllStarsDivsFiche.update(
    updateData,
    {
      where: {
        jid: normalizedJid
      }
    }
  );

  // ==========================================================
  // SECOURS : RECHERCHE PAR NUMÉRO
  // ==========================================================

  if (!updated) {
    const numero = normalizedJid.split("@")[0];
    const fiches = await AllStarsDivsFiche.findAll();

    const fiche = fiches.find(f => {
      if (!f.jid) return false;

      return String(f.jid).trim().split("@")[0] === numero;
    });

    if (fiche) {
      fiche[colonne] = valeur;
      await fiche.save();

      updated = 1;

      console.log(
        `🔄 ${colonne} mis à jour par numéro → ${valeur}`
      );
    }
  }

  if (!updated) {
    throw new Error(
      `❌ Aucun joueur trouvé pour jid : ${normalizedJid}`
    );
  }

  console.log(`✔ ${colonne} mis à jour → ${valeur}`);

  // ==========================================================
  // 🏆 MISE À JOUR AUTOMATIQUE DES POSITIONS
  // ==========================================================

  if (colonne === "points") {
    await synchroniserClassementAllStars();
  }
}


    
async function add_id(jid, data = {}) {
  if (!jid) throw new Error("JID requis");

  const exists = await AllStarsDivsFiche.findOne({ where: { jid } });
  if (exists) return null;

  return await AllStarsDivsFiche.create({ jid, ...data });
}

async function del_fiche(code_fiche) {
  return await AllStarsDivsFiche.destroy({
    where: { code_fiche }
  });
}

module.exports = {
  getAllFiches,
  setfiche,
  getData,
  add_id,
  del_fiche
};
