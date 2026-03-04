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
  if(match.possessionsRestantes[match.possession] > 0)
    match.possessionsRestantes[match.possession]--;
  match.possession = match.possession === "A" ? "B" : "A";
  match.tour = match.possession;
  match.tourActuel = 0;
  return { ok:false, message:"❌ Faute ou pavé invalide. Ballon perdu. Possession adverse." };
}

// Trouver utilisateur dans la DB
async function trouverUser(nom){
  const allPlayers = await TeamFunctions.getAllTeams();
  if(!allPlayers) return null;
  for(const team of allPlayers){
    const user = team?.data?.users?.find(u => u.name.toLowerCase() === nom.toLowerCase());
    if(user) return { teamId: team.id, teamName: team.name, userData: user };
  }
  return null;
}

// Arbitre Page 1
function arbitrerPave(match, equipe, pave){
  if(match.possession !== equipe) return { ok:false, message:"⛔ Ce n'est pas ton tour." };
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

    if(i===0){
      joueurNom = seq.match(/\)\s*(\w+)/)?.[1];
      if(!joueurNom) return perteBalle(match);
      const positionReelle = match.equipes[equipe].joueurs[joueurNom]?.zone;
      if(!positionReelle || positionReelle !== zones.depart) return perteBalle(match);
      positionActuelle = positionReelle;
    }

    if(zones.depart !== positionActuelle) return perteBalle(match);
    if(distance(zones.depart, zones.arrivee) > 10) return perteBalle(match);
    positionActuelle = zones.arrivee;
  }

  match.equipes[equipe].joueurs[joueurNom].zone = positionActuelle;
  match.tourActuel++;
  if(match.tourActuel >= 4){
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    match.tourActuel = 0;
    return { ok:true, message:"✅ Action validée. 4 tours effectués, possession changée." };
  }

  return { ok:true, message:"✅ Action validée." };
}

// Timer par tour
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


async function analyserPave(from, msg, ovl){

  // Vérifier si match actif
  if(!matchsActifs.has(from)) return;

  const match = matchsActifs.get(from);
  if(match.statut !== "en_cours") return;

  // Extraction pavé (le pavé commence par 💬 et contient ⚽)
  if(!msg.body.includes("💬:") || !msg.body.includes("⚽:")) return;

  // Extraire ligne ⚽
  const action = msg.body.split("\n").find(l => l.startsWith("⚽:"));
  if(!action) return;

  const texteAction = action.replace("⚽:","").trim();

  // Modèle de référence pour contrôle + conduite
  const model = "(Z) NOM contrôle la balle de l'intérieur ou pointe du pied à DIST cm puis enchaîne avec une conduite de balle de la pointe du pied droit à DIST vmax vers Z2";

  // Calculer ressemblance
  const similarity = stringSimilarity.compareTwoStrings(texteAction.toLowerCase(), model.toLowerCase());
  if(similarity < 0.4){
    // Refus si ressemblance < 40%
    clearTimeout(match.timer);
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    return ovl.sendMessage(from,{
      text:"❌ Pavé refusé : ressemblance insuffisante. Ballon perdu."
    });
  }

  // Séparer séquences
  const sequences = texteAction.split("/").map(s=>s.trim());
  if(sequences.length > 2){
    clearTimeout(match.timer);
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    return ovl.sendMessage(from,{
      text:"❌ Trop de séquences. Ballon perdu."
    });
  }

  const equipe = match.possession;
  let positionActuelle = null;
  let joueurNom = null;

  for(let i=0;i<sequences.length;i++){
    const seq = sequences[i];

    // Compter actions dans la séquence
    let totalActions = 0;
    ["contrôle","conduit"].forEach(a=>{
      const m = seq.match(new RegExp(a,"gi"));
      if(m) totalActions += m.length;
    });
    if(totalActions > 3){
      clearTimeout(match.timer);
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      return ovl.sendMessage(from,{ text:"❌ Trop d'actions dans la séquence. Ballon perdu." });
    }

    // Vérifier combo
    const comboOk = seq.match(/\(combo\)/gi);
    if(comboOk && comboOk.length > 1){
      clearTimeout(match.timer);
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      return ovl.sendMessage(from,{ text:"❌ Combo non valide. Ballon perdu." });
    }

    // Extraire zones
    const departMatch = seq.match(/\((.*?)\)/);
    const arriveeMatch = seq.match(/vers\s+(A1|A2|B1|B2|C1|C2)|en\s+(A1|A2|B1|B2|C1|C2)/i);
    if(!departMatch || !arriveeMatch){
      clearTimeout(match.timer);
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      return ovl.sendMessage(from,{ text:"❌ Zone départ ou arrivée manquante. Ballon perdu." });
    }

    const depart = departMatch[1].toUpperCase();
    const arrivee = (arriveeMatch[1] || arriveeMatch[2]).toUpperCase();

    // Vérifier joueur
    if(i === 0){
      joueurNom = seq.match(/\)\s*(\w+)/)?.[1];
      if(!joueurNom || !match.equipes[equipe].joueurs[joueurNom]){
        clearTimeout(match.timer);
        match.possession = match.possession === "A" ? "B" : "A";
        match.tour = match.possession;
        return ovl.sendMessage(from,{ text:"❌ Joueur introuvable ou incorrect. Ballon perdu." });
      }
      positionActuelle = match.equipes[equipe].joueurs[joueurNom].zone;
      if(positionActuelle !== depart){
        clearTimeout(match.timer);
        match.possession = match.possession === "A" ? "B" : "A";
        match.tour = match.possession;
        return ovl.sendMessage(from,{ text:"❌ Mauvaise position de départ. Ballon perdu." });
      }
    }

    // Vérifier distance
    if(Math.abs(DISTANCES[depart] - DISTANCES[arrivee]) > 10){
      clearTimeout(match.timer);
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      return ovl.sendMessage(from,{ text:"❌ Distance trop longue. Ballon perdu." });
    }

    // Vérifier pied pour contrôle et distance
    if(!/(intérieur|pointe)/i.test(seq) || !/(\d+)cm/i.test(seq)){
      clearTimeout(match.timer);
      match.possession = match.possession === "A" ? "B" : "A";
      match.tour = match.possession;
      return ovl.sendMessage(from,{ text:"❌ Pied de contrôle ou distance manquant. Ballon perdu." });
    }

    // Vérifier vmax
    if(!/vmax/i.test(seq)){
      match.equipes[equipe].joueurs[joueurNom].vitesse = "reduced";
    }

    // Mettre à jour position du joueur
    positionActuelle = arrivee;
  }

  match.equipes[equipe].joueurs[joueurNom].zone = positionActuelle;

  ovl.sendMessage(from,{ text:"✅ Pavé validé. Action acceptée." });

  // Relancer timer pour le joueur suivant
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
▝▝▝       *🔷BLUELOCK⚽*

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
   EXPORT
=================================*/
module.exports = {
  matchsActifs,
  arbitrerPave,
  lancerTimer
};
