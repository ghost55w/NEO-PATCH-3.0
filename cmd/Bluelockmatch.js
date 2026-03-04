const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");
const stringSimilarity = require('string-similarity');

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
  match.tourActuel = 0;
  return { ok:false, message:"❌ Pavé invalide. Ballon perdu. Possession adverse." };
}

async function trouverUser(nom){
  const allPlayers = await TeamFunctions.getAllTeams();
  if(!allPlayers) return null;
  for(const team of allPlayers){
    const user = team?.data?.users?.find(u => u.name.toLowerCase() === nom.toLowerCase());
    if(user) return { teamId: team.id, teamName: team.name, userData: user };
  }
  return null;
}

/* ===============================
   TIMER
=================================*/
function lancerTimer(from, ovl){
  const match = matchsActifs.get(from);
  if(match.timer) clearTimeout(match.timer);

  match.timer = setTimeout(async ()=>{
    match.tourActuel++;
    if(match.tourActuel >= 4){
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      match.tourActuel = 0;
      ovl.sendMessage(from,{ text:"⏰ 4 tours écoulés, possession changée." });
    } else {
      ovl.sendMessage(from,{ text:`⏰ 6 minutes écoulées. Tour ${match.tourActuel}/4 pour ${match.equipes[match.possession].nom}.` });
      lancerTimer(from, ovl);
    }
  }, 6*60*1000);
}

/* ===============================
   ANALYSE DES PAVÉS
=================================*/
async function analyserPave(from, msg, ovl){
  if(!matchsActifs.has(from)) return;

  const match = matchsActifs.get(from);
  if(match.statut !== "en_cours") return;
  if(!msg.body.includes("💬:") || !msg.body.includes("⚽:")) return;

  const actionLine = msg.body.split("\n").find(l => l.startsWith("⚽:"));
  if(!actionLine) return;

  const texteAction = actionLine.replace("⚽:","").trim();
  const model = "(Z) NOM contrôle la balle de l'intérieur ou pointe du pied à DIST cm puis enchaîne avec une conduite de balle de la pointe du pied droit à DIST vmax vers Z2";

  const similarity = stringSimilarity.compareTwoStrings(texteAction.toLowerCase(), model.toLowerCase());
  if(similarity < 0.4){
    clearTimeout(match.timer);
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    return ovl.sendMessage(from,{ text:"❌ Pavé refusé : ressemblance insuffisante. Ballon perdu." });
  }

  const sequences = texteAction.split("/").map(s=>s.trim());
  if(sequences.length > 2){
    clearTimeout(match.timer);
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    return ovl.sendMessage(from,{ text:"❌ Trop de séquences. Ballon perdu." });
  }

  const equipe = match.possession;
  let positionActuelle = null;
  let joueurNom = null;

  for(let i=0;i<sequences.length;i++){
    const seq = sequences[i];

    if(compterActions(seq) > 3) return ovl.sendMessage(from,{ text:"❌ Trop d'actions dans la séquence. Ballon perdu." });
    if(!verifierCombo(seq)) return ovl.sendMessage(from,{ text:"❌ Combo non valide. Ballon perdu." });

    const zones = extraireZones(seq);
    if(!zones) return ovl.sendMessage(from,{ text:"❌ Zone départ ou arrivée manquante. Ballon perdu." });

    if(i===0){
      joueurNom = seq.match(/\)\s*(\w+)/)?.[1];
      if(!joueurNom || !match.equipes[equipe].joueurs[joueurNom]) 
        return ovl.sendMessage(from,{ text:"❌ Joueur introuvable. Ballon perdu." });

      positionActuelle = match.equipes[equipe].joueurs[joueurNom].zone;
      if(positionActuelle !== zones.depart) 
        return ovl.sendMessage(from,{ text:"❌ Mauvaise position de départ. Ballon perdu." });
    }

    if(zones.depart !== positionActuelle) 
      return ovl.sendMessage(from,{ text:"❌ Zones incohérentes. Ballon perdu." });
    if(distance(zones.depart, zones.arrivee) > 10) 
      return ovl.sendMessage(from,{ text:"❌ Distance trop longue. Ballon perdu." });

    if(!/(intérieur|pointe)/i.test(seq) || !/(\d+)cm/i.test(seq)) 
      return ovl.sendMessage(from,{ text:"❌ Pied de contrôle ou distance manquant. Ballon perdu." });
    if(!/vmax/i.test(seq)) 
      match.equipes[equipe].joueurs[joueurNom].vitesse = "reduced";

    positionActuelle = zones.arrivee;
  }

  match.equipes[equipe].joueurs[joueurNom].zone = positionActuelle;
  ovl.sendMessage(from,{ text:"✅ Pavé validé. Action acceptée." });

  clearTimeout(match.timer);
  lancerTimer(from, ovl);
}

/* ===============================
COMMANDE +Match⚽
=================================*/
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

await ovl.sendMessage(ms_org,{  
  text:`🔷⚽ MATCH BLUE LOCK🥅

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1:
🥅👤Joueur2:
🥅🧤Gardien:

╰───────────────────
▝▝▝       🔷BLUELOCK⚽

⚠️ Veuillez renvoyer le pavé de confirmation dans 1 minute.`
});

const filter = (msg) => msg.body.includes("MATCH BLUE LOCK") && matchsActifs.get(ms_org)?.statut === "attente_confirmation";  
const confirmationPromise = new Promise((resolve)=>{  
  const timer = setTimeout(()=> resolve(null), 60*1000);  
  const handler = async (msg) => { if(msg.from === ms_org && filter(msg)){ clearTimeout(timer); resolve(msg.body); } };  
  repondre.on('message', handler);  
});  

const paveConfirm = await confirmationPromise;  
if(!paveConfirm){  
  matchsActifs.delete(ms_org);  
  return ovl.sendMessage(ms_org,{ text:"❌ Session fermée, confirmation non reçue." });  
}  

const lignes = paveConfirm.split("\n");  
const nomJ1 = lignes.find(l=>l.includes("Joueur1"))?.split(":")[1]?.trim();  
const nomJ2 = lignes.find(l=>l.includes("Joueur2"))?.split(":")[1]?.trim();  
const gardienNiveau = parseInt(lignes.find(l=>l.includes("Gardien"))?.split(":")[1]?.trim());  

const joueur1 = await trouverUser(nomJ1);  
const joueur2 = await trouverUser(nomJ2);  
if(!joueur1 || !joueur2)  
  return ovl.sendMessage(ms_org,{ text:"❌ Un des joueurs est introuvable dans la base." });  

const equipeKickOff = tirageKickOff();  
const match = {  
  statut:"en_cours",  
  possession:equipeKickOff,  
  tour:equipeKickOff,  
  tourActuel:0,  
  possessionsRestantes: { A: 2, B: 2 },  
  timer:null,  
  gardien:gardienNiveau,  
  equipes:{  
    A:{ nom:nomJ1, db:joueur1, joueurs:{ [nomJ1]:{ zone:"C2", stats: joueur1.userData } }, score:0 },  
    B:{ nom:nomJ2, db:joueur2, joueurs:{ [nomJ2]:{ zone:"C2", stats: joueur2.userData } }, score:0 }  
  }  
};  
matchsActifs.set(ms_org, match);  

const joueurKickOff = match.equipes[equipeKickOff].nom;  

await ovl.sendMessage(ms_org,{  
  video: "https://files.catbox.moe/7jmwi8.mp4",  
  caption: `⚽ ${joueurKickOff} démarre le match avec la possession ! 6 minutes pour le premier pavé.`  
});  

lancerTimer(ms_org, ovl);

} catch(e){
console.log(e);
ovl.sendMessage(ms_org,{ text:"⚠️ Erreur lors du lancement du match." });
}
});
/* ===============================
   INTÉGRATION RECEPTION MESSAGE
=================================*/
async function onMessageReceived(from, msg, ovl){
  if(matchsActifs.has(from)){
    await analyserPave(from, msg, ovl);
  }
}

/* ===============================
   EXPORT
=================================*/
module.exports = {
  matchsActifs,
  analyserPave,
  lancerTimer,
  onMessageReceived
};
