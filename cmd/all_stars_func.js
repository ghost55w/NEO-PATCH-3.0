// all_stars_func.js
const { ovlcmd } = require("../lib/ovlcmd");
const { cardsBlueLock } = require("../DataBase/cardsBL");

// ================= COMMAND GOAL =================
ovlcmd({
    nom: "goal",
    isfunc: true
}, async (ms_org, ovl, { texte, repondre }) => {
    if (!texte.toLowerCase().startsWith("🔷⚽ goal🥅")) return;

    // Extraction des stats depuis le pavé
    const joueurMatch = texte.match(/🥅joueur\s*=\s*(.+)/i);
    const gardienMatch = texte.match(/🥅Gardien\s*=\s*(\d+)/i);
    const zoneMatch = texte.match(/🥅Zone\s*=\s*([\w\s-]+)/i);
    const distanceMatch = texte.match(/🥅Distance\s*=\s*([\d.]+)/i);

    if (!joueurMatch || !gardienMatch || !zoneMatch || !distanceMatch) {
        return repondre("⚠️ Format incorrect. Assure-toi que la fiche est bien remplie.");
    }

    // Normalisation du nom saisi
    const joueurNomSaisi = joueurMatch[1].trim().toLowerCase().replace(/\s+/g, ' ');

    // Recherche du joueur dans la database (ignore la casse et les espaces)
    const joueurData = Object.values(cardsBlueLock).find(joueur => {
        const nameNormalized = joueur.name.trim().toLowerCase().replace(/\s+/g, ' ');
        return nameNormalized === joueurNomSaisi;
    });

    if (!joueurData) {
        return repondre(`⚠️ Joueur non trouvé dans la Database : *${joueurNomSaisi}*`);
    }

    const tirPuissance = parseInt(joueurData.tir || 50, 10); // Tir depuis DB
    const gardien = parseInt(gardienMatch[1], 10);
    const zone = zoneMatch[1].trim().toLowerCase().replace(/\s+/g, ' ');
    const distance = parseFloat(distanceMatch[1]);

    const sho = parseInt(joueurData.sho || 50, 10); // sho du joueur
    let probaGoal = 0;
    const ecart = sho - gardien;

    // Calcul probabilité selon distance et écart
    if (distance <= 5) {
        probaGoal = ecart > 10 ? 1.0 : ecart > 0 ? 0.85 : ecart === 0 ? 0.5 : 0;
    } else if (distance <= 10) {
        probaGoal = ecart > 10 ? 0.9 : ecart > 0 ? 0.65 : ecart === 0 ? 0.3 : ecart >= -5 ? 0.2 : 0;
    } else {
        probaGoal = ecart > 10 ? 0.85 : ecart > 0 ? 0.6 : ecart === 0 ? 0.2 : ecart >= -5 ? 0.1 : 0;
    }

    const tirAleatoire = Math.random();
    const resultat = tirAleatoire <= probaGoal ? "but" : "arrêt"; 

    if (resultat === "but") {
        const commentaires = {
            "lucarne droite": ["*🎙️: COMME UN MISSILE GUIDÉ ! Le ballon se niche dans la lucarne droite - splendide !*", "*🎙️: UNE FRAPPE POUR L'HISTOIRE ! La lucarne droite explose sous l'effet de la frappe !*"],
            "lucarne gauche": ["*🎙️: MAGNIFIQUE ! La lucarne gauche est pulvérisée par cette frappe !*", "*🎙️: UNE PRÉCISION D'ORFÈVRE ! Lucarne gauche touchée, le gardien impuissant !*"],
            "lucarne milieu": ["*🎙️: JUSTE SOUS LA BARRE ! Une frappe centrée magistrale !*", "*🎙️: UNE FUSÉE POUR LES LIVRES D’HISTOIRE ! En pleine lucarne centrale !*"],
            "mi-hauteur droite": ["*🎙️: UNE FRAPPE SÈCHE ET PRÉCISE ! Filets droits transpercés !*"],
            "mi-hauteur gauche": ["*🎙️: PUISSANCE ET PRÉCISION ! Le ballon traverse la défense à gauche !*"],
            "mi-hauteur centre": ["*🎙️: UNE FUSÉE AU CENTRE ! Le ballon frappe en plein milieu à mi-hauteur !*"],
            "ras du sol droite": ["*🎙️: ENTRE LES JAMBES ! Le ballon glisse à ras du sol côté droit !*"],
            "ras du sol gauche": ["*🎙️: UNE RACLÉE TECHNIQUE ! Le tir rase le sol à gauche et finit au fond !*"],
            "ras du sol milieu": ["*🎙️: UNE FINALE DE CLASSE ! Le ballon fuse au sol, en plein centre !*"]
        };

        if (!commentaires[zone]) {
            return repondre(`Zone inconnue : *${zone}*\nZones valides :\n- ${Object.keys(commentaires).join("\n- ")}`);
        }

        const commentaire = commentaires[zone][Math.floor(Math.random() * commentaires[zone].length)];

        // Premier GIF : GOAL classique
        const videoGoal = [
            "https://files.catbox.moe/chcn2d.mp4",
            "https://files.catbox.moe/t04dmz.mp4",
            "https://files.catbox.moe/8t1eya.mp4"
        ][Math.floor(Math.random() * 3)];

        await ovl.sendMessage(ms_org, {
            video: { url: videoGoal },
            caption: `*🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱*\n${commentaire}`,
            gifPlayback: true
        });

        // GIF célébration spécifique joueur
        if (joueurData.goal) {
            await ovl.sendMessage(ms_org, {
                video: { url: joueurData.goal },
                caption: "",
                gifPlayback: true
            });
        }

    } else {
        await ovl.sendMessage(ms_org, {
            video: { url: 'https://files.catbox.moe/88lylr.mp4' },
            caption: "*🥅:❌MISSED GOAL!!! ▱▱▱▱*",
            gifPlayback: true
        });
    }
});

// ================= COMMAND LATENCE GO/NEXT =================
const activeCountdowns = {};
const pausedCountdowns = {};

ovlcmd({
  nom: "latence go/next",
  isfunc: true
}, async (ms_org, ovl, { texte, getJid }) => {
  if (!texte) return;
  const mots = texte.trim().toLowerCase().split(/\s+/);
  const neoTexte = mots.join(" ");

  let user = null, userW = null;
  if (mots[0]?.startsWith("@")) {
    const userLid = mots[0].slice(1);
    user = await getJid(userLid + "@lid", ms_org, ovl);
    userW = user.split("@")[0]
  }

  const stopCountdown = async () => {
    if (activeCountdowns[ms_org]) clearInterval(activeCountdowns[ms_org].interval);
    delete activeCountdowns[ms_org];
    delete pausedCountdowns[ms_org];
    await ovl.sendMessage(ms_org, { text: "🛑 Décompte arrêté." });
  };

  if (neoTexte === "stop") return stopCountdown();

  if (neoTexte === "pause" && activeCountdowns[ms_org]) {
    clearInterval(activeCountdowns[ms_org].interval);
    pausedCountdowns[ms_org] = activeCountdowns[ms_org];
    delete activeCountdowns[ms_org];
    return ovl.sendMessage(ms_org, { text: "⏸️ Décompte en pause." });
  }

  if (["resume", "continue", "go"].includes(neoTexte) && pausedCountdowns[ms_org]) {
    const { remaining, userW, user } = pausedCountdowns[ms_org];
    let time = remaining;
    const interval = setInterval(async () => {
      time--;
      activeCountdowns[ms_org].remaining = time;
      if (time === 120 && user) {
        await ovl.sendMessage(ms_org, { text: `⚠️ @${userW} il ne reste plus que 2 minutes.`, mentions: [user] });
      }
      if (time <= 0) {
        clearInterval(interval);
        delete activeCountdowns[ms_org];
        await ovl.sendMessage(ms_org, { text: "⚠️ Latence Out" });
      }
    }, 1000);
    activeCountdowns[ms_org] = { interval, remaining: time, userW, user };
    delete pausedCountdowns[ms_org];
    return ovl.sendMessage(ms_org, { text: "▶️ Décompte repris." });
  }

  // Détection Go / Next
let countdownTime = null;
let isGo = false;
let gifUrl = "";

if (mots[1] === "go") {
  countdownTime = 6 * 60;
  isGo = true;
  gifUrl = "https://files.catbox.moe/1td1ai.mp4"; // GIF Go
} else if (mots[1] === "next") {
  countdownTime = 6 * 60;
  isGo = true; // Toujours true pour la logique
  gifUrl = "https://files.catbox.moe/7jmwi8.mp4"; // GIF Next
} else return;

// Envoi du GIF
await ovl.sendMessage(ms_org, {
  video: { url: gifUrl },
  gifPlayback: true
});

  const interval = setInterval(async () => {
    countdownTime--;
    if (countdownTime === 120 && user) {
      await ovl.sendMessage(ms_org, { text: `⚠️ @${userW} il ne reste plus que 2 minutes.`, mentions: [user] });
    }
    if (countdownTime <= 0) {
      clearInterval(interval);
      delete activeCountdowns[ms_org];
      await ovl.sendMessage(ms_org, { text: "⚠️ Latence Out" });
    }
  }, 1000);

  activeCountdowns[ms_org] = { interval, remaining: countdownTime, userW, user };
});
