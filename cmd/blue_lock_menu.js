const { ovlcmd } = require('../lib/ovlcmd');

const gifIntro = 'https://files.catbox.moe/z64kuq.mp4';

ovlcmd(
  {
    nom_cmd: 'bluelock⚽',
    classe: 'Bluelock⚽',
    react: '🎮',
    desc: "Affiche les visuels de Blue Game"
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      await ovl.sendMessage(ms_org, {
        video: { url: gifIntro },
        gifPlayback: true,
        caption: ""
      });

      const liens = [
        'https://files.catbox.moe/zr43jw.jpg',
        'https://files.catbox.moe/gv70v7.jpg',
        'https://files.catbox.moe/9gx12h.jpg',
        'https://files.catbox.moe/0waart.jpg',
        'https://files.catbox.moe/bi5h2w.jpg', 
        'https://files.catbox.moe/siia15.jpg'
      ];

      for (const lien of liens) {
        await ovl.sendMessage(ms_org, { image: { url: lien }, caption: "" }, { quoted: ms });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
);

ovlcmd(
  {
    nom_cmd: 'modechampions⚽',
    classe: 'Bluelock⚽',
    react: '🏆',
    desc: "Affiche le mode Champions"
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      await ovl.sendMessage(ms_org, {
        video: { url: gifIntro },
        gifPlayback: true,
        caption: ""
      });

      await ovl.sendMessage(ms_org, { image: { url: "https://files.catbox.moe/dhkxtt.jpg" }, caption: "" }, { quoted: ms });
      await ovl.sendMessage(ms_org, { image: { url: "https://files.catbox.moe/juvrgg.jpg" }, caption: "" }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: 'modehero⚽',
    classe: 'Bluelock⚽',
    react: '🦸',
    desc: "Affiche le mode Hero"
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg || arg.length === 0) {
      await ovl.sendMessage(ms_org, {
        video: { url: gifIntro },
        gifPlayback: true,
        caption: ""
      });

      await ovl.sendMessage(ms_org, { image: { url: "https://files.catbox.moe/zmzlwt.jpg" }, caption: "" }, { quoted: ms });
      await ovl.sendMessage(ms_org, { image: { url: "https://files.catbox.moe/hku7ch.jpg" }, caption: "" }, { quoted: ms });
    }
  }
);

ovlcmd({
  nom_cmd: 'pave⚽',
  classe: 'Bluelock⚽',
  react: '⚽',
  desc: "Affiche le message d'annonce de lancement Blue Lock (safe)"
}, async (ms_org, ovl, { ms }) => {
  try {
    const pavé = `
💬: 
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▱▱▱
⚽: 
             
╰───────────────────
  ▝▝▝       
             🔷BLUELOCK⚽
          *powered by NEOVERSE™*`;

    // Envoi direct, sans repondre(), pour éviter de déclencher d'autres listeners
    await ovl.sendMessage(ms_org, { text: pavé }, { quoted: ms });
  } catch (e) {
    console.error("❌ Erreur +pave⚽ safe:", e);
    await ovl.sendMessage(ms_org, { text: "❌ Une erreur est survenue lors de l'envoi du pavé." }, { quoted: ms });
  }
});
