const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

const DISTANCES = { C2:30, C1:25, B2:20, B1:15, A2:10, A1:5 };

const ACTIONS = [
"contrôle",
"conduit",
"accélère",
"tir",
"frappe",
"passe",
"dribble"
];


/* ===============================
   OUTILS
=================================*/

function tirageKickOff(){
return Math.random() < 0.5 ? "A" : "B";
}

function extraireAction(pave){
const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
if(!ligne) return null;
return ligne.replace("⚽:","").trim();
}

function separerSequences(action){
return action.split("/").map(s=>s.trim());
}

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

function distance(z1,z2){
return Math.abs(DISTANCES[z1] - DISTANCES[z2]);
}

function perteBalle(match){

match.possession = match.possession === "A" ? "B" : "A";
match.tour = match.possession;
match.tourActuel = 0;

return {
ok:false,
message:"❌ Pavé invalide. Ballon perdu. Possession adverse."
};

}


/* ===============================
   TROUVER JOUEUR DB
=================================*/

async function trouverUser(nom){

const allPlayers = await TeamFunctions.getAllTeams();

if(!allPlayers) return null;

for(const team of allPlayers){

const user = team?.data?.users?.find(u =>
u.name.toLowerCase() === nom.toLowerCase()
);

if(user){

return {
teamId: team.id,
teamName: team.name,
userData: user
};

}

}

return null;

}


/* ===============================
   COMMANDE MATCH
=================================*/

ovlcmd({
nom_cmd: "match⚽",
classe: "BLUELOCK⚽",
react: "⚽",
desc: "Créer un match Blue Lock"

}, async (ms_org, ovl) => {

try{

const chat = ms_org.key.remoteJid;

if(matchsActifs.has(chat)){
return ovl.sendMessage(chat,{
text:"⚠️ Un match est déjà en cours dans ce groupe."
});
}

const ficheMatch = `
🔷⚽ *MATCH BLUE LOCK* 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Joueur1:
🥅👤Joueur2:
🥅🧤Gardien:
⌛ Score win:
             
╰───────────────────
▝▝▝       *🔷BLUELOCK⚽*
`;

await ovl.sendMessage(chat,{text:ficheMatch});

const sender = ms_org.key.participant || ms_org.key.remoteJid;

matchsActifs.set(chat,{
etat:"attente_fiche",
createur:sender
});

/* TIMER */

setTimeout(()=>{

const match = matchsActifs.get(chat);

if(match && match.etat === "attente_fiche"){

matchsActifs.delete(chat);

ovl.sendMessage(chat,{
text:"⌛ Temps écoulé. Match annulé."
});

}

},60000);

}catch(e){

console.log("Erreur match⚽ :",e);

}

});


/* ===============================
   DETECTION FICHE MATCH
=================================*/

async function verifierFiche(message,chat,ovl){

const match = matchsActifs.get(chat);

if(!match) return;

if(match.etat !== "attente_fiche") return;

if(!message.includes("MATCH BLUE LOCK")) return;

const joueur1 = message.match(/Joueur1:\s*(.*)/);
const joueur2 = message.match(/Joueur2:\s*(.*)/);
const score = message.match(/Score win:\s*(.*)/);

if(!joueur1 || !joueur2) return;

match.joueur1 = joueur1[1].trim();
match.joueur2 = joueur2[1].trim();
match.scoreWin = score ? score[1] : "2";

const j1 = await trouverUser(match.joueur1);
const j2 = await trouverUser(match.joueur2);

if(!j1 || !j2){

await ovl.sendMessage(chat,{
text:"❌ Joueurs introuvables dans la base."
});

matchsActifs.delete(chat);
return;

}

match.id1 = j1.userData.id;
match.id2 = j2.userData.id;

match.etat = "attente_lineup";

await ovl.sendMessage(chat,{
text:`📋 Joueurs confirmés !

👤 ${match.joueur1}
👤 ${match.joueur2}

⚽ Les joueurs doivent envoyer *+lineup⚽*`
});

}


/* ===============================
   COMMANDE LINEUP
=================================*/

ovlcmd({

nom_cmd:"lineup⚽",
classe:"BLUELOCK⚽",
react:"📋"

},async(ms_org,ovl)=>{

const chat = ms_org.key.remoteJid;
const sender = ms_org.key.participant || ms_org.key.remoteJid;

const match = matchsActifs.get(chat);

if(!match) return;

if(match.etat !== "attente_lineup") return;

if(sender === match.id1){

match.lineup1 = true;

await ovl.sendMessage(chat,{
text:`✅ Lineup reçu pour ${match.joueur1}`
});

}

if(sender === match.id2){

match.lineup2 = true;

await ovl.sendMessage(chat,{
text:`✅ Lineup reçu pour ${match.joueur2}`
});

}

if(match.lineup1 && match.lineup2){

match.etat = "debut_match";

await ovl.sendMessage(chat,{
text:"⏳ Match commence dans *1 minute*..."
});

setTimeout(()=>{
lancerMatch(chat,ovl)
},60000);

}

});


/* ===============================
   LANCEMENT MATCH
=================================*/

async function lancerMatch(chat,ovl){

const match = matchsActifs.get(chat);
if(!match) return;

const premier = Math.random() < 0.5
? match.joueur1
: match.joueur2;

match.possession = premier;
match.etat = "match";

await ovl.sendMessage(chat,{
text:`🏟️ *MATCH BLUE LOCK*

⚽ ${premier} commence avec la possession !

🔥 *KICK OFF*`
});

}


/* ===============================
   LECTURE MESSAGES
=================================*/

async function messageMatch(ms,ovl){

if(!ms.message) return;

const chat = ms.key.remoteJid;

const text =
ms.message.conversation ||
ms.message.extendedTextMessage?.text ||
"";

if(!text) return;

await verifierFiche(text,chat,ovl);

}

module.exports = { messageMatch };
