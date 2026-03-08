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

ovlcmd({
  nom_cmd: "match⚽",
  classe: "BLUELOCK⚽",
  react: "⚽",
  desc: "Créer un match Blue Lock"
}, async (ms_org, ovl) => {

const chat = ms_org.key.remoteJid

const ficheMatch = `
🔷⚽ *MATCH BLUE LOCK* 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1:
🥅👤Joueur2:
🥅🧤Gardien:
⌛ Score win:
             
╰───────────────────
▝▝▝       *🔷BLUELOCK⚽*
`

await ovl.sendMessage(chat,{text:ficheMatch})

matchsActifs.set(chat,{
etat:"attente_fiche",
createur:ms_org.key.participant || ms_org.key.remoteJid
})

setTimeout(()=>{
const match = matchsActifs.get(chat)

if(match && match.etat === "attente_fiche"){
matchsActifs.delete(chat)
ovl.sendMessage(chat,{text:"⌛ Temps écoulé. Match annulé."})
}

},60000)

})
//----------DETECTION PAVÉ DE MATCH
async function verifierFiche(message,chat,ovl){

const match = matchsActifs.get(chat)
if(!match) return

if(match.etat !== "attente_fiche") return

if(!message.includes("MATCH BLUE LOCK")) return

const joueur1 = message.match(/Joueur1:\s*(.*)/)
const joueur2 = message.match(/Joueur2:\s*(.*)/)
const gardien = message.match(/Gardien:\s*(.*)/)
const score = message.match(/Score win:\s*(.*)/)

if(!joueur1 || !joueur2) return

match.joueur1 = joueur1[1].trim()
match.joueur2 = joueur2[1].trim()
match.scoreWin = score ? score[1] : "2"

const allPlayers = await TeamFunctions.getAllTeams()

const j1 = allPlayers.find(p => 
stringSimilarity.compareTwoStrings(p.name.toLowerCase(),match.joueur1.toLowerCase()) > 0.6
)

const j2 = allPlayers.find(p => 
stringSimilarity.compareTwoStrings(p.name.toLowerCase(),match.joueur2.toLowerCase()) > 0.6
)

if(!j1 || !j2){

await ovl.sendMessage(chat,{
text:"❌ Joueurs introuvables dans la base."
})

matchsActifs.delete(chat)
return
}

match.id1 = j1.user
match.id2 = j2.user

match.etat = "attente_lineup"

await ovl.sendMessage(chat,{
text:`📋 Joueurs confirmés !

👤 ${match.joueur1}
👤 ${match.joueur2}

⚽ Les joueurs doivent envoyer *+lineup⚽*`
})

}

ovlcmd({
nom_cmd:"lineup⚽",
classe:"BLUELOCK⚽",
react:"📋"
},async(ms_org,ovl)=>{

const chat = ms_org.key.remoteJid
const sender = ms_org.key.participant

const match = matchsActifs.get(chat)

if(!match) return
if(match.etat !== "attente_lineup") return

if(sender === match.id1){

match.lineup1 = true

await ovl.sendMessage(chat,{text:`✅ Lineup reçu pour ${match.joueur1}`})

}

if(sender === match.id2){

match.lineup2 = true

await ovl.sendMessage(chat,{text:`✅ Lineup reçu pour ${match.joueur2}`})

}

if(match.lineup1 && match.lineup2){

match.etat = "debut_match"

await ovl.sendMessage(chat,{
text:"⏳ Match commence dans *1 minute*..."
})

setTimeout(()=>lancerMatch(chat,ovl),60000)

}

})

async function lancerMatch(chat,ovl){

const match = matchsActifs.get(chat)
if(!match) return

const premier = Math.random() < 0.5 ? match.joueur1 : match.joueur2

match.possession = premier
match.etat = "match"

await ovl.sendMessage(chat,{
text:`🏟️ *MATCH BLUE LOCK*

⚽ ${premier} commence avec la possession !

🔥 *KICK OFF*`
})

}
