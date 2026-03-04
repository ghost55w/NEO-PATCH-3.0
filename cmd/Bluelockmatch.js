const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

const DISTANCES = { C2:30, C1:25, B2:20, B1:15, A2:10, A1:5 };
const ACTIONS = ["contrôle","conduit","accélère","tir","frappe","passe","dribble"];

/* ===============================
   OUTILS
=================================*/
function tirageKickOff(){ return Math.random() < 0.5 ? "A" : "B"; }

function extraireAction(pave){
  const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
  if(!ligne) return null;
  return ligne.replace("⚽:","").trim();
}

function separerSequences(action){ return action.split("/").map(s=>s.trim()); }

function compterActions(sequence){
  let total = 0;
  ACTIONS.forEach(a=>{
    const r = new RegExp(a,"gi");
    const m = sequence.match(r);
    if(m) total += m.length;
  });
  return total;
}

function verifierCombo(sequence){
  const combos = sequence.match(/\(combo\)/gi);
  return !combos || combos.length <= 1;
}

function extraireZones(sequence){
  const departMatch = sequence.match(/\((.*?)\)/);
  const arriveeMatch = sequence.match(/vers\s+(A1|A2|B1|B2|C1|C2)|en\s+(A1|A2|B1|B2|C1|C2)/i);
  if(!departMatch || !arriveeMatch) return null;
  const depart = departMatch[1].toUpperCase();
  const arrivee = (arriveeMatch[1] || arriveeMatch[2]).toUpperCase();
  return { depart, arrivee };
}

function distance(z1,z2){ return Math.abs(DISTANCES[z1] - DISTANCES[z2]); }

function perteBalle(match){
  match.possession = match.possession === "A" ? "B" : "A";
  match.tour = match.possession;
  return { ok:false, message:"❌ Faute. Ballon perdu. Possession adverse." };
}


//MATCH⚽
async function trouverUser(nom){
  const allPlayers = await TeamFunctions.getAllTeams();
  if(!allPlayers) return null;
  for(const team of allPlayers){
    const user = team?.data?.users?.find(u => u.name.toLowerCase() === nom.toLowerCase());
    if(user){
      return { teamId: team.id, teamName: team.name, userData: user };
    }
  }
  return null;
}

function tirageKickOff(){ return Math.random() < 0.5 ? "A" : "B"; }

ovlcmd({
  nom_cmd: 'match⚽',
  classe: 'BLUELOCK⚽',
  react: '⚽',
  desc: "Lance un match BLUE LOCK"
}, async (ms_org, ovl, { repondre, auteur_Message }) => {
  try {

    if(matchsActifs.has(ms_org))
      return ovl.sendMessage(ms_org,{ text:"⚠️ Un match est déjà en cours." });

    matchsActifs.set(ms_org, { statut: "attente_confirmation" });

    // 1️⃣ Pavé initial d'attente de confirmation
    await ovl.sendMessage(ms_org,{
      text:`
🔷⚽ MATCH BLUE LOCK🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1:                        
🥅👤Joueur2:           
🥅🧤Gardien:
             
╰───────────────────
▝▝▝       *🔷BLUELOCK⚽*

⚠️ Veuillez renvoyer le pavé de confirmation dans 1 minute.`
    });

    // 2️⃣ Attendre le pavé de confirmation
    const filter = (msg) => msg.body.includes("MATCH BLUE LOCK") && matchsActifs.get(ms_org)?.statut === "attente_confirmation";

    const confirmationPromise = new Promise((resolve)=>{
      const timer = setTimeout(()=> resolve(null), 60*1000); // 1 min timeout
      const handler = async (msg) => {
        if(msg.from === ms_org && filter(msg)){
          clearTimeout(timer);
          resolve(msg.body);
        }
      };
      repondre.on('message', handler);
    });

    const pavéConfirm = await confirmationPromise;

    if(!pavéConfirm){
      matchsActifs.delete(ms_org);
      return ovl.sendMessage(ms_org,{ text:"❌ Session fermée, confirmation non reçue." });
    }

    // 3️⃣ Extraire noms et gardien
    const lignes = pavéConfirm.split("\n");
    const nomJ1Match = lignes.find(l=>l.includes("Joueur1"))?.match(/Joueur1:\s*(.*?)🇨/);
    const nomJ2Match = lignes.find(l=>l.includes("Joueur2"))?.match(/Joueur2:\s*(.*?)🇨/);
    const gardienMatch = lignes.find(l=>l.includes("Gardien"))?.match(/Gardien:\s*(\d+)/);

    if(!nomJ1Match || !nomJ2Match || !gardienMatch)
      return ovl.sendMessage(ms_org,{ text:"❌ Format invalide, assurez-vous d'indiquer Joueur1, Joueur2 et Gardien." });

    const nomJ1 = nomJ1Match[1].trim();
    const nomJ2 = nomJ2Match[1].trim();
    const gardienNiveau = parseInt(gardienMatch[1]);

    // 4️⃣ Vérifier joueurs dans la DB
    const joueur1 = await trouverUser(nomJ1);
    const joueur2 = await trouverUser(nomJ2);
    if(!joueur1 || !joueur2)
      return ovl.sendMessage(ms_org,{ text:"❌ Un des joueurs est introuvable dans la base." });

    // 5️⃣ Initialiser le match
    const equipeKickOff = tirageKickOff();
    const match = {
      statut:"en_cours",
      possession:equipeKickOff,
      tour:equipeKickOff,
      timer:null,
      gardien:gardienNiveau,
      equipes:{
        A:{ nom:nomJ1, db:joueur1, joueurs:{ [nomJ1]:{ zone:"C2", stats: joueur1.userData } }, score:0 },
        B:{ nom:nomJ2, db:joueur2, joueurs:{ [nomJ2]:{ zone:"C2", stats: joueur2.userData } }, score:0 }
      }
    };
    matchsActifs.set(ms_org, match);

    const joueurKickOff = match.equipes[equipeKickOff].nom;

    // 6️⃣ Envoyer GIF Kick Off avec légende
    await ovl.sendMessage(ms_org,{
      video: "https://files.catbox.moe/7jmwi8.mp4",
      caption: `⚽ ${joueurKickOff} démarre le match avec la possession !`
    });

  } catch(e){
    console.log(e);
    ovl.sendMessage(ms_org,{ text:"⚠️ Erreur lors du lancement du match." });
  }
});



/* ===============================
   EXPORT
=================================*/
module.exports = {
  matchsActifs,
  initialiserMatch,
  arbitrerPave,
  lancerTimer
};
