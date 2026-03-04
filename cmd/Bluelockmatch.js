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

/* ===============================
   ARBITRAGE PAGE 1
=================================*/
function arbitrerPave(match, equipe, pave){

  if(match.possession !== equipe)
    return { ok:false, message:"⛔ Ce n'est pas ton tour." };

  const action = extraireAction(pave);
  if(!action) return perteBalle(match);

  const sequences = separerSequences(action);
  if(sequences.length > 2) return perteBalle(match);

  let positionActuelle = null;
  let joueurNom = null;

  for(let i=0;i<sequences.length;i++){
    const seq = sequences[i];
    if(compterActions(seq) > 3) return perteBalle(match);
    if(!verifierCombo(seq)) return perteBalle(match);

    const zones = extraireZones(seq);
    if(!zones) return perteBalle(match);

    if(i === 0){
      joueurNom = seq.match(/\)\s*(\w+)/)?.[1];
      if(!joueurNom) return perteBalle(match);

      const positionReelle = match.equipes[equipe].joueurs[joueurNom]?.zone;
      if(!positionReelle || positionReelle !== zones.depart)
        return perteBalle(match);

      positionActuelle = positionReelle;
    }

    if(zones.depart !== positionActuelle) return perteBalle(match);
    if(distance(zones.depart, zones.arrivee) > 10) return perteBalle(match);

    positionActuelle = zones.arrivee;
  }

  match.equipes[equipe].joueurs[joueurNom].zone = positionActuelle;

  return { ok:true, message:"✅ Action validée." };
}

/* ===============================
   TIMER 6 MINUTES
=================================*/
function lancerTimer(from, ovl){
  const match = matchsActifs.get(from);
  if(match.timer) clearTimeout(match.timer);

  match.timer = setTimeout(()=>{
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;

    ovl.sendMessage(from,{
      text:"⏰ Temps écoulé ! Changement de possession."
    });
  }, 6*60*1000);
}

/* ===============================
   TROUVER JOUEUR DANS DB
=================================*/
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

/* ===============================
   INITIALISATION MATCH
=================================*/
async function initialiserMatch(from, j1Nom, j2Nom, ovl){

  const joueur1 = await trouverUser(j1Nom);
  const joueur2 = await trouverUser(j2Nom);

  if(!joueur1 || !joueur2){
    return ovl.sendMessage(from,{
      text:"❌ Un des joueurs est introuvable dans la base."
    });
  }

  const equipeKickOff = tirageKickOff();

  const match = {
    statut:"en_cours",
    possession:equipeKickOff,
    tour:equipeKickOff,
    timer:null,
    equipes:{
      A:{ nom:j1Nom, db:joueur1, joueurs:{ [j1Nom]:{ zone:"C2", stats: joueur1.userData } }, score:0 },
      B:{ nom:j2Nom, db:joueur2, joueurs:{ [j2Nom]:{ zone:"C2", stats: joueur2.userData } }, score:0 }
    }
  };

  matchsActifs.set(from, match);

  const joueurKickOff = match.equipes[equipeKickOff].nom;

  await ovl.sendMessage(from,{
    text:`🎲 TIRAGE AU SORT...

🥎 ${joueurKickOff} commence !
⏳ 6 minutes pour jouer ⚽`
  });

  lancerTimer(from, ovl);
}

/* ===============================
   COMMANDE +Match⚽
=================================*/
ovlcmd({
  nom_cmd:"match⚽",
  categorie:"game"
}, async (from, msg, args, { ovl }) => {

  if(matchsActifs.has(from))
    return ovl.sendMessage(from,{ text:"⚠️ Match déjà en cours." });

  matchsActifs.set(from,{ statut:"inscription" });

  await ovl.sendMessage(from,{
    text:`
🔷⚽ MATCH BLUE LOCK🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1: 0 ⚽               
🥅👤Joueur2: 0 ⚽ 
             
╰───────────────────
▝▝▝ *🔷BLUELOCK⚽*`
  });
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


