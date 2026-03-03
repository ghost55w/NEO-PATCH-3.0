const { ovlcmd } = require('../lib/ovlcmd');
const joueurs = new Map();

// ─────────────── UTILITAIRE : attendre réponse d'un joueur ───────────────
async function waitForMsg(ms_org, ovl, auteur, timeout = 60000) {
  while (true) {
    const r = await ovl.recup_msg({ auteur, ms_org, temps: timeout });
    const txt = r?.message?.extendedTextMessage?.text || r?.message?.conversation || "";
    if (txt && txt.trim()) return txt.trim();
  }
}

// ─────────────── ENVOYER RESULTATS ───────────────
async function envoyerResultats(ms_org, ovl, joueur) {
  const tag = `@${joueur.id.split('@')[0]}`;
  let rank = "❌";
  if (joueur.but >= 18) rank = "SS🥇";
  else if (joueur.but >= 12) rank = "S🥈";
  else if (joueur.but >= 6) rank = "A🥉";

  const result = `▔▔▔▔▔▔▔▔▔▔     ▔▔▔▔▔
                    *🔷BLUE LOCK⚽*
▔▔▔▔▔▔▔▔▔▔   ▔▔▔▔▔▔▔▔▔▔
  🔷RESULTATS DE L'ÉVALUATION📊

*🥅Exercice:* Épreuve de tirs
*👤Joueur:* ${tag}
*⚽Buts:* ${joueur.but}
*📊Rank:* ${rank}
`;

  await ovl.sendMessage(ms_org, {
    image: { url: "https://files.catbox.moe/1xnoc6.jpg" },
    caption: result,
    mentions: [joueur.id]
  });

  joueurs.delete(joueur.id);
}

// ─────────────── COMMANDE +exercice1 ───────────────
ovlcmd({
  nom_cmd: 'exercice1',
  classe: 'BLUELOCK⚽',
  react: '⚽',
  desc: "Lance l'épreuve du loup"
}, async (ms_org, ovl, { repondre, auteur_Message }) => {
  try {
    // --- GIF initial ---
    await ovl.sendMessage(ms_org, {
      video: { url: 'https://files.catbox.moe/z64kuq.mp4' },
      gifPlayback: true,
      caption: ''
    });

    // --- Texte d'accueil ---
    const texteDebut = `*🔷ÉPREUVE DE TIRS⚽🥅*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░

🔷⚽RÈGLES:
Marquez 18 buts en 18 tirs max dans 20 mins ⌛
face à un gardien Robot. ⚠
Minimum 6 buts pour passer. ❌
⚠ Si vous ratez un tir, FIN DE L'EXERCICE ❌.

▔▔▔▔▔▔▔ 🔷RANKING🏆 ▔▔▔▔▔▔▔  

🥉Novice: 6 buts⚽ (25 pts) 
🥈Pro: 12 buts⚽ (50 pts) 
🥇Classe mondiale: 18 buts⚽🏆(100 pts) 

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░ ░                         

Souhaitez-vous lancer l'exercice ? :
✅ Oui
❌ Non

⚽BLUE🔷LOCK`;

    await ovl.sendMessage(ms_org, {
      image: { url: 'https://files.catbox.moe/09rll9.jpg' },
      caption: texteDebut
    });

    // --- Attente confirmation ---
    const confirm = await waitForMsg(ms_org, ovl, auteur_Message);
    if (confirm.toLowerCase() === "non") return repondre("❌ Lancement de l'exercice annulé.");
    if (confirm.toLowerCase() !== "oui") return repondre("❌ Réponse invalide, exercice annulé.");

    // --- Créer joueur ---
    const id = auteur_Message;
    const joueur = {
      id,
      tir_info: [],
      but: 0,
      tirs_total: 0,
      en_cours: true,
      timer: null,
      paused: false,
      remainingTime: 20 * 60 * 1000,
      pauseTimestamp: null
    };

    // --- Timer 20 min ---
    joueur.timer = setTimeout(() => {
      joueur.en_cours = false;
      envoyerResultats(ms_org, ovl, joueur);
    }, joueur.remainingTime);

    joueurs.set(id, joueur);

    // --- Début de l'exercice ---
    await ovl.sendMessage(ms_org, {
      video: { url: "https://files.catbox.moe/zqm7et.mp4" },
      gifPlayback: true,
      caption: `*⚽BLUE LOCK🔷:* Début de l'exercice ⌛ Durée : 20:00 mins`
    });

    // --- Boucle de tirs ---
    while (joueur.en_cours && joueur.but < 18) {
      await ovl.sendMessage(ms_org, { text: `Envoyez votre tir (ex: "tir puissant lucarne droite") :` });
      const tirTxt = await waitForMsg(ms_org, ovl, auteur_Message);
      const tirParts = tirTxt.toLowerCase().split(" ");

      // --- Analyse simplifiée du tir ---
      let tir_type = tirParts.slice(0, -2).join(" ") || "tir normal";
      let tir_zone = tirParts.slice(-2).join(" ");
      const zonesValides = ["ras du sol gauche","ras du sol droite","mi-hauteur gauche","mi-hauteur droite","lucarne gauche","lucarne droite"];
      if (!zonesValides.includes(tir_zone)) tir_zone = zonesValides[Math.floor(Math.random() * zonesValides.length)];

      const tir_courant = { tir_type, tir_zone };

      // --- Vérifier répétition ---
      const tir_repeté = joueur.tir_info.some(t => t.tir_type === tir_courant.tir_type && t.tir_zone === tir_courant.tir_zone);
      if (tir_repeté) {
        clearTimeout(joueur.timer);
        joueur.en_cours = false;
        await ovl.sendMessage(ms_org, {
          video: { url: "https://files.catbox.moe/9k5b3v.mp4" },
          gifPlayback: true,
          caption: "❌MISSED! Tir répété, exercice terminé."
        });
        return envoyerResultats(ms_org, ovl, joueur);
      }

      // --- Valider le tir ---
      joueur.but++;
      joueur.tir_info.push(tir_courant);
      if (joueur.tir_info.length > 3) joueur.tir_info.shift();
      const restants = 18 - joueur.but;

      await ovl.sendMessage(ms_org, {
        video: { url: "https://files.catbox.moe/pad98d.mp4" },
        gifPlayback: true,
        caption: `✅⚽GOAL : ${joueur.but} but${joueur.but>1?'s':''} marqué 🎯\n⚠️ Il vous reste ${restants} tirs ⌛`
      });
    }

    if (joueur.en_cours) {
      clearTimeout(joueur.timer);
      joueur.en_cours = false;
      envoyerResultats(ms_org, ovl, joueur);
    }

  } catch (err) {
    console.error(err);
    repondre("❌ Une erreur est survenue.");
  }
});
