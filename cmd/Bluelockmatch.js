const { ovlcmd } = require('../lib/ovlcmd');
const { MyNeoFunctions, TeamFunctions, BlueLockFunctions } = require("../DataBase/myneo_lineup_team");
const { cardsBlueLock } = require("../DataBase/cardsBL");

const matchsActifs = new Map();

const DISTANCES = { C2: 30, C1: 25, B2: 20, B1: 15, A2: 10, A1: 5 };
/* ===============================
POSTES → POSITION TERRAIN
=================================*/

const POSITION_POSTES = {
    // ATTAQUE
    AG: { zoneX: "aile gauche", ligne: "attaque" },
    AC: { zoneX: "axe", ligne: "attaque" },
    AD: { zoneX: "aile droite", ligne: "attaque" },

    // MILIEU
    MG: { zoneX: "aile gauche", ligne: "milieu" },
    MC: { zoneX: "axe", ligne: "milieu" },
    MD: { zoneX: "aile droite", ligne: "milieu" },

    // DEFENSE
    DG: { zoneX: "aile gauche", ligne: "defense" },
    DC: { zoneX: "axe", ligne: "defense" },
    DD: { zoneX: "aile droite", ligne: "defense" }
};

/* ===============================
PLACEMENT AUTOMATIQUE JOUEURS
=================================*/

function getZoneYParLigne(ligne, mode){

    // mode = "attaque" ou "defense"

    if(mode === "attaque"){
        if(ligne === "attaque") return "B1";
        if(ligne === "milieu") return "B2";
        if(ligne === "defense") return "C2";
    }

    if(mode === "defense"){
        if(ligne === "defense") return "B1";
        if(ligne === "milieu") return "B2";
        if(ligne === "attaque") return "C2";
    }

    return "B2";
}

/* ===============================
ZONES LARGEUR (NOUVEAU)
=================================*/

const ZONES_X = {
    "aile gauche": -5,
    "axe": 0,
    "aile droite": 5
};
/* ===============================
SYNONYMES LARGEUR
=================================*/

const SYNONYMES_X = {
    "côté gauche": "aile gauche",
    "gauche": "aile gauche",

    "côté droit": "aile droite",
    "droite": "aile droite",

    "centre": "axe"
};
/* ===============================
REGLES TERRAIN BLUE LOCK
=================================*/

const ZONES_BLUELOCK = ["A1","A2","B1","B2","C1","C2"];

const MAX_DEPLACEMENT = 10;
const MAX_ACTIONS_PAVE = 3;
const MAX_ACTIONS_COMBO = 2;
const ACTIONS_MAP = {
    tir: ["tir", "frappe"],
    passe: ["passe"],

    deplacement: [
        "conduit", "conduite",
        "accélère", "acceleration",
        "fonce", "vmax", "course",
        "se déplace", "avance", "court"
    ],
controle: [
        "contrôle",
        "controle",
        "amorti", 
        "contrôle de balle", 
    "controle le ballon" 
    ]
}; 
    
/* ===============================
DETECTION AUTOMATIQUE ACTIONS
=================================*/

function detecterActions(sequence){

    const actionsDetectees = [];
    const text = sequence.toLowerCase();

    for(const [type, mots] of Object.entries(ACTIONS_MAP)){

        for(const mot of mots){

            const regex = new RegExp("\\b"+mot+"\\b","gi");

            const matches = text.match(regex);

            if(matches){

                for(let i=0;i<matches.length;i++){
                    actionsDetectees.push(type);
                }

            }

        }

    }

    return actionsDetectees;
}
/* ===============================
MOTS CLÉS PASSES (FORMULE 🧩)
=================================*/
const MOTS_CLES_PASSES = {
    types: [
        "passe directe",
        "passe enroulée",
        "passe trivela",
        "passe lobbée",
        "centre",
        "passe longue"
    ],
    pied: ["pied gauche", "pied droit"],
    zonesPied: ["pointe de pied", "intérieur du pied", "extérieur du pied", "talon", "tête"],
    directions: ["gauche", "droite", "devant", "derrière", "diagonal sur la gauche", "diagonal sur la droite"],
    hauteurs: ["ras du sol", "50cmh", "1mh", "2mh", "2.5mh"],
    distanceMax: 30,
    zonesCible: ["intérieur pied gauche", "intérieur du pied droit", "extérieur du pied gauche", "extérieur du pied droit", "mi-hauteur 50cmh", "tête", "torse"]
};

/* ===============================
MODELS DES PASSES (COMPARAISON)
=================================*/
const TYPES_PASSES = {
    "passe directe": "passe directe pied droit intérieur du pied ras du sol devant 10m intérieur pied gauche",
    "passe enroulée": "passe enroulée pied droit extérieur du pied 1mh diagonal sur la droite 20m torse",
    "passe trivela": "passe trivela pied droit extérieur du pied ras du sol gauche 15m intérieur pied droit",
    "passe lobbée": "passe lobbée pied droit intérieur du pied 2mh devant 25m tête",
    "centre": "centre pied droit intérieur du pied 2mh diagonal sur la gauche 20m tête",
    "passe longue": "passe longue pied droit intérieur du pied 2mh devant 30m torse"
};
const REGLES_PASSES = {

    "passe directe": {
        obligatoire: [
            "passe", "directe",
            "pied", "ras du sol",
            "m"
        ],

        validate: (txt) => {

            // intérieur du pied OU tête OU talon
            const okZonePied =
                txt.includes("intérieur du pied") ||
                txt.includes("tête") ||
                txt.includes("talon") ||
                txt.includes("pointe de pied");

            if (!okZonePied) {
                return "❌ Passe directe mal exécutée (zone du pied invalide)";
            }

            // direction obligatoire
            if (!txt.match(/gauche|droite|devant|derrière/)) {
                return "❌ Direction obligatoire";
            }

            // hauteur max
            if (txt.includes("mh") && !txt.includes("50cm")) {
                return "❌ Passe directe max 50cm de hauteur";
            }

            // pointe de pied = devant + ras du sol
            if (txt.includes("pointe de pied")) {
                if (!txt.includes("devant") || !txt.includes("ras du sol")) {
                    return "❌ Pointe de pied = devant + ras du sol obligatoire";
                }
            }

            // tête ou talon = 5m max
            const d = extraireDistance(txt);
            if ((txt.includes("tête") || txt.includes("talon")) && d > 5) {
                return "❌ Tête/Talon = max 5m";
            }

            return true;
        }
    },

    "passe circulaire": {
        obligatoire: [
            "passe", "circulaire",
            "intérieur du pied",
            "corps décalé",
            "courbe",
            "m"
        ],

        validate: (txt) => {

            if (!txt.includes("50cm")) {
                return "❌ Hauteur min 50cm obligatoire";
            }

            if (!txt.includes("60°")) {
                return "❌ Corps décalé 60° obligatoire";
            }

            // courbe obligatoire
            if (!txt.includes("courbe")) {
                return "❌ Courbe obligatoire";
            }

            const d = extraireDistance(txt);

            if (d > 10) {
                return "❌ Portée max 10m";
            }

            return true;
        }
    },

    "passe trivela": {
        obligatoire: [
            "passe", "trivela",
            "extérieur du pied",
            "corps décalé",
            "courbe",
            "m"
        ],

        validate: (txt) => {

            if (!txt.includes("50cm")) {
                return "❌ Hauteur min 50cm obligatoire";
            }

            if (!txt.includes("60°")) {
                return "❌ Corps décalé 60° obligatoire";
            }

            const d = extraireDistance(txt);

            if (d > 10) {
                return "❌ Portée max 10m";
            }

            return true;
        }
    },

    "passe longue": {
        obligatoire: [
            "passe",
            "m"
        ],

        validate: (txt, joueur) => {

            const d = extraireDistance(txt);

            if (d < 10) {
                return "❌ Passe longue = minimum 10m";
            }

            if (d >= 10 && d <= 20 && !txt.includes("4m") && !txt.includes("2m")) {
                return "❌ Hauteur invalide pour passe longue";
            }

            if ((joueur.note || 0) < 85) {
                return "❌ 85+ PAS requis pour passe longue";
            }

            return true;
        }
    },

    "centre": {
        obligatoire: ["centre", "m"],

        validate: (txt) => {

            if (!txt.includes("aile")) {
                return "❌ Un centre doit venir d’une aile";
            }

            return true;
        }
    },

    "passe lobbée": {
        obligatoire: ["lobbée", "m"],

        validate: (txt, joueur) => {

            if (!txt.includes("1.5m")) {
                return "❌ Arc de 1.5m obligatoire";
            }

            const d = extraireDistance(txt);

            if (d > 5) {
                return "❌ Passe lobbée = max 5m";
            }

            if ((joueur.note || 0) < 95) {
                return "❌ 95+ PAS requis";
            }

            return true;
        }
    }
};

/* ===============================
OUTILS JEU
=================================*/
function parseSquadBlueLock(text) {
    const lignes = text.split("\n");
    const joueurs = [];
    const regex = /\d+\s+👤\(([A-Z]{2})\)\s*([^(]+)\s*\((\d+)\)/i;
    for (const ligne of lignes) {
        const match = ligne.match(regex);
        if (match) {
            joueurs.push({
                position: match[1].trim(),
                nom: match[2].trim(),
                note: parseInt(match[3])
            });
        }
    }
    if (joueurs.length === 0) return null;

    const teamMatch = text.match(/SQUAD⚽🥅:\s*([^\n]+)/i);
    let teamName = teamMatch ? teamMatch[1].trim() : null;
    if (teamName) teamName = teamName.replace(/⚽$/, "").trim();

    return { teamName, joueurs };
}

function normalizeTeamName(name) {
    if (!name) return "";
    return name.replace(/\p{Emoji}/gu, "").trim().toLowerCase();
}

function tirageKickOff() {
    return Math.random() < 0.5 ? "A" : "B";
}

function extraireAction(pave) {
    const ligne = pave.split("\n").find(l => l.startsWith("⚽:"));
    if (!ligne) return null;
    return ligne.replace("⚽:", "").trim();
}

function separerSequences(action) {
    return action.split("/").map(s => s.trim());
}


function compterActions(sequence) {
    let total = 0;

    Object.values(ACTIONS_MAP).flat().forEach(a => {
        const r = new RegExp(a, "gi");
        const m = sequence.match(r);
        if (m) total += m.length;
    });

    return total;
}

function verifierCombo(sequence) {
    const combos = sequence.match(/(contrôle|conduit|accélère|tir|frappe|passe|dribble)/gi);
    return !combos || combos.length <= 1;
}

function extraireZones(sequence) {
    const departMatch = sequence.match(/de\s+(A1|A2|B1|B2|C1|C2)/i);
    const arriveeMatch = sequence.match(/vers\s+(A1|A2|B1|B2|C1|C2)|en\s+(A1|A2|B1|B2|C1|C2)/i);
    if (!departMatch || !arriveeMatch) return null;
    const depart = departMatch[1].toUpperCase();
    const arrivee = (arriveeMatch[1] || arriveeMatch[2]).toUpperCase();
    return { depart, arrivee };
}
/* ===============================
EXTRAIRE DIRECTION LARGEUR
=================================*/

function extraireDirectionLargeur(sequence){

    const txt = sequence.toLowerCase();

    if(txt.includes("aile gauche")) return "aile gauche";
    if(txt.includes("aile droite")) return "aile droite";
    if(txt.includes("axe")) return "axe";

    return null;
}

function extraireDistance(sequence){

    const match = sequence.match(/(\d+)\s?m/i);

    if(!match) return null;

    return parseInt(match[1]);
}

/* ===============================
CALCUL DISTANCE ENTRE ZONES
=================================*/

function calculDistance(zone1, zone2){

    if(!DISTANCES[zone1] || !DISTANCES[zone2]) return 0;

    return Math.abs(DISTANCES[zone1] - DISTANCES[zone2]);
}

// DÉPLACEMENTS
function verifierDeplacement(sequence){

    const zoneDepart = extraireZoneDepart(sequence);

    if(!zoneDepart){
        return {
            ok:false,
            erreur:"❌ Zone manquante. Exemple : (A1)"
        };
    }

    const zoneArrivee = extraireZoneArrivee(sequence);

    const direction = extraireDirectionLargeur(sequence);
    const distance = extraireDistance(sequence);

    // 🔥 REGLE LARGEUR (NOUVEAU)
    if(direction){

        if(!distance){
            return {
                ok:false,
                erreur:"❌ Distance obligatoire pour aller vers l’aile ou l’axe"
            };
        }

        if(distance > MAX_DEPLACEMENT){
            return {
                ok:false,
                erreur:"❌ Déplacement trop long (max 10m)"
            };
        }
    }

    // 🔥 TON SYSTEME LONGUEUR (inchangé)
    if(zoneArrivee){

        const dist = calculDistance(zoneDepart, zoneArrivee);

        if(dist > MAX_DEPLACEMENT){
            return {
                ok:false,
                erreur:"❌ Déplacement trop long (max 10m)"
            };
        }

        return {
            ok:true,
            zoneDepart,
            zoneArrivee,
            direction,
            distance
        };
    }

    return {
        ok:true,
        zoneDepart,
        direction,
        distance
    };
}

/* ===============================
UPDATE POSITION JOUEUR
=================================*/

function updatePositionJoueur(joueur, direction, distance){

    if(!direction || !distance) return joueur;

    let pos = ZONES_X[joueur.zoneX];

    // déplacement
    if(direction === "aile droite") pos += distance;
    if(direction === "aile gauche") pos -= distance;

    if(direction === "axe"){
        if(pos < 0) pos += distance;
        else if(pos > 0) pos -= distance;
    }

    // limites terrain
    if(pos > 5) pos = 5;
    if(pos < -5) pos = -5;

    // 🔥 conversion en zone
    if(pos === -5) joueur.zoneX = "aile gauche";
    else if(pos === 5) joueur.zoneX = "aile droite";
    else if(pos === 0) joueur.zoneX = "axe";
    else joueur.zoneX = "axe"; // approximation

    return joueur;
}

/* ===============================
🎭 FORMAT GLOBAL ERREURS BLUELOCK
=================================*/
function formatErreurGlobal(input, joueur = null, match = null) {

    let message = "";

    if (typeof input === "object") {
        message = input.erreur || "Erreur inconnue";
    } else {
        message = input;
    }

    message = message.replace("❌", "").trim();

    let explication = message;
    let nom = joueur?.nom || "Le joueur";

    // 🎯 Explications intelligentes
    if (message.toLowerCase().includes("position")) {
        explication = `${nom} n'est pas dans la bonne zone, son placement est en zone ${joueur?.zoneY || "?"}.`;
    }

    if (message.toLowerCase().includes("distance")) {
        explication = `La distance de l'action dépasse la limite autorisée.`;
    }

    if (message.toLowerCase().includes("formule")) {
        explication = `La formule de passe n'est pas respectée.`;
    }

    if (message.toLowerCase().includes("contrôle")) {
        explication = `${nom} rate son contrôle.`;
    }

    if (message.toLowerCase().includes("kickoff")) {
        explication = `Le coup d’envoi doit obligatoirement être en (C2).`;
    }

    if (message.toLowerCase().includes("joueur")) {
        explication = `Le joueur mentionné est introuvable ou non valide.`;
    }

    // ===============================
    // 🛡️ INTERCEPTION VIS À VIS
    // ===============================
    let defenseur = "un adversaire";

    if (match && joueur && joueur.visavis) {
        defenseur = joueur.visavis.nom;
    } 
    else if (match && match.duels && joueur) {
        const duel = match.duels.find(d => d.joueur1 === joueur.nom);
        if (duel) {
            defenseur = duel.joueur2;
        }
    }

    return {
        texte:
`⚽❌ *ERREUR* : 
🎙️ ${explication} 
\`Verdict\`: Ballon perdu, intercepté par ${defenseur}🛡️.`,
        defenseur
    };
}

//ENVOIE DE L'ERREUR
async function envoyerErreurBlueLock(ovl, chat, match, joueurObj, erreurInput) {
const err = formatErreurGlobal(erreurInput, joueurObj, match);

await ovl.sendMessage(chat, { 
    text: err.texte 
});
    const imagesErreur = [
        "https://files.catbox.moe/3n8q7l.jpg",
        "https://files.catbox.moe/7lqz9p.jpg",
        "https://files.catbox.moe/dxk92l.jpg"
    ];

    const nextJoueur = match.joueurTour === match.id1 ? match.id2 : match.id1;
    const displayNext = nextJoueur.split("@")[0];

    // 🔄 SWITCH JOUEUR
    match.joueurTour = nextJoueur;

    await ovl.sendMessage(chat, {
        image: { url: imagesErreur[Math.floor(Math.random() * imagesErreur.length)] },
        caption:
`${err.texte}

👉🏽NEXT joueur suivant : @${displayNext}
⏱️ Tu as 6 minutes.

💡 Tape *+VAR❌* si tu contestes.

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`,
        mentions: [nextJoueur]
    });

    // ⏱️ TIMER GLOBAL 6 MIN
    if (match.timerPave) clearTimeout(match.timerPave);

    match.timerPave = setTimeout(async () => {
        await ovl.sendMessage(chat, {
            text: `⏰ @${displayNext} temps écoulé ❌`,
            mentions: [nextJoueur]
        });
    }, 6 * 60 * 1000);
}

/* ===============================
EXTRAIRE ZONE DEPART
=================================*/

function extraireZoneDepart(sequence){

    const zoneMatch = sequence.match(/\((A1|A2|B1|B2|C1|C2)\)/i);

    if(!zoneMatch) return null;

    return zoneMatch[1].toUpperCase();
}


/* ===============================
EXTRAIRE ZONE ARRIVEE
=================================*/

function extraireZoneArrivee(sequence){

    const zones = sequence.match(/\b(A1|A2|B1|B2|C1|C2)\b/gi);

    if(!zones || zones.length < 2) return null;

    return zones[zones.length - 1].toUpperCase();
}
function distance(z1, z2) {
    return Math.abs(DISTANCES[z1] - DISTANCES[z2]);
}

function perteBalle(match) {
    match.possession = match.possession === "A" ? "B" : "A";
    match.tour = match.possession;
    match.tourActuel = 0;
    return { ok: false, message: "❌ Pavé invalide. Ballon perdu. Possession adverse." };
}

function getSenderJid(ms) {
    return (
        ms.key.participant ||
        ms.participant ||
        ms.key.remoteJid ||
        ""
    ).replace(/:\d+/g, ""); // enlève :12
}

function normalizeJid(jid) {
    return (jid || "")
        .replace(/:\d+/g, "")
        .replace(/@.*/, "")
        .trim();
}

function parseLineup(texte) {
    const regex = /\s*(\w+)\s*:\s*([^\n\r]+)\s*-\s*(\d+)/gi;
    const joueurs = [];
    let match;
    while ((match = regex.exec(texte)) !== null) {
        joueurs.push({ position: match[1].toUpperCase(), nom: match[2].trim(), note: match[3].trim() });
    }
    return joueurs;
}
function cleanJid(jid) {
    return (jid || "")
        .split(":")[0]
        .split("@")[0]
        .trim();
}

function resetPossession(match, team) {
    match.actionsRestantes[team] = 4;
    match.possessionIndex[team]++;
    return match.possessionIndex[team];
}

function switchRoles(match) {
    const t1 = match.team1Nom;
    const t2 = match.team2Nom;

    const temp = match.role[t1];
    match.role[t1] = match.role[t2];
    match.role[t2] = temp;
}

function triggerCounterAttack(match, attackerTeam, defenderTeam) {

    const temp = match.joueurTour;
    match.joueurTour = match.id1 === temp ? match.id2 : match.id1;

    match.actionsRestantes[attackerTeam] = 4;

    return {
        newAttacker: defenderTeam,
        newDefender: attackerTeam
    };
}
/* ===============================
VALIDATION PAVE BLUELOCK
=================================*/

function verifierPaveBlueLock(actionText){

    if(!actionText){
        return {ok:false, erreur:"❌ Aucune action détectée"};
    }

    const actions = detecterActions(actionText);

    if(actions.length === 0){
        return {
            ok:false,
            erreur:"❌ Aucune action reconnue"
        };
    }

    if(actions.length > MAX_ACTIONS_PAVE){
        return {
            ok:false,
            erreur:"❌ Maximum 3 actions par pavé"
        };
    }

    const zoneCheck = verifierDeplacement(actionText);

    if(!zoneCheck.ok){
        return zoneCheck;
    }

    return {
        ok:true,
        actions
    };
}

/* ===============================
TROUVER JOUEUR DB
=================================*/
async function trouverUser(nom) {
    const allPlayers = await TeamFunctions.getAllTeams();
    if (!allPlayers) return null;
    const nomClean = nom.toLowerCase().trim();
    for (const player of allPlayers) {
        if ((player.users || "").toLowerCase().trim() === nomClean) return player;
    }
    return null;
}

/* ===============================
TROUVER CARTE JOUEUR
=================================*/
function trouverCarteJoueur(nom) {
    if (!cardsBlueLock) return null;
    const nomClean = nom.toLowerCase().trim();
    for (const carte of cardsBlueLock) {
        if (!carte.nom) continue;
        if (carte.nom.toLowerCase() === nomClean) return carte;
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
}, async (ms_org, ovl, cmd_options) => {
    try {
        const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;
        const sender = ms_org.sender || cmd_options?.auteur_Message || (ms_org.key?.participant || "").split(":")[0];

        if (matchsActifs.has(chat)) {
            return ovl.sendMessage(chat, { text: "⚠️ Un match est déjà en cours dans ce groupe." });
        }

        const ficheMatch = `🔷⚽ *MATCH BLUE LOCK* 🥅

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🥅👤Team 1:
🥅👤Team 2:
🥅🧤Gardien:
⌛ Score win:

╰───────────────────
▝▝▝       🔷BLUELOCK⚽`;

        await ovl.sendMessage(chat, { text: ficheMatch });

        matchsActifs.set(chat, { etat: "attente_fiche", createur: sender });

    } catch (e) {
        console.log("Erreur match⚽ :", e);
    }
});

/* ===============================
DETECTION FICHE MATCH
=================================*/
async function verifierFiche(message, chat, ovl) {
    const match = matchsActifs.get(chat);
if (!match) return;
    if (!message.includes("MATCH BLUE LOCK") || !message.includes("Team 1")) return;

    const team1 = message.match(/Team 1:\s*([^\n\r]+)/);
    const team2 = message.match(/Team 2:\s*([^\n\r]+)/);
    const gardien = message.match(/Gardien:\s*([^\n\r]+)/);
    const score = message.match(/Score win:\s*([^\n\r]+)/);

    if (!team1 || !team2) return;

    match.team1 = team1[1].trim();
    match.team2 = team2[1].trim();
    match.gardien = gardien ? gardien[1].trim() : "Non défini";
    match.scoreWin = score ? score[1].trim() : "2";

    const j1 = await trouverUser(match.team1);
    const j2 = await trouverUser(match.team2);

    if (!j1 || !j2) {
        const err = formatErreurGlobal("❌ Joueur introuvable");

await ovl.sendMessage(chat, {
    text: err.texte + `

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
});

matchsActifs.delete(chat);
return;        
    }

    match.team1Nom = match.team1;
    match.team2Nom = match.team2;
    match.etat = "attente_lineup";
    match.equipe1 = null;
    match.equipe2 = null;
    match.possessionIndex = {
    [match.team1Nom]: 0,
    [match.team2Nom]: 0
};

match.actionsRestantes = {
    [match.team1Nom]: 4,
    [match.team2Nom]: 4
};

match.role = {
    [match.team1Nom]: "attack",
    [match.team2Nom]: "defense"
};

    const imagesMatchConfirm = [
        "https://files.catbox.moe/7m2axj.jpg",
        "https://files.catbox.moe/mtou2n.jpg"
    ];

    function randomImage(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const confirmation = `🔷⚽ MATCH BLUE LOCK 🥅
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🎙️: ✅ Équipes confirmées !
👤 Team 1: ${match.team1}
👤 Team 2: ${match.team2}
🧤 Gardien: ${match.gardien}

╰───────────────────
               *🔷BLUELOCK⚽*`;

    await ovl.sendMessage(chat, { image: { url: randomImage(imagesMatchConfirm) }, caption: confirmation });

    await ovl.sendMessage(chat, {
        text: `📢 ${match.team1} et ${match.team2} ⏳ *Vous avez 2 minutes pour envoyer votre Lineup dans l'arène, ⚠️Ne tapez pas la commande ici.*`
    });

    match.timerLineup = setTimeout(async () => {
        if (!match.equipe1 || !match.equipe2) {
            matchsActifs.delete(chat);
            const err = formatErreurGlobal("❌ Temps écoulé pour envoyer les lineups");

await ovl.sendMessage(chat, {
    text: err.texte + `

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
});
        }
    }, 2 * 60 * 1000);
}

/* ===============================
LECTURE MESSAGES
=================================*/
async function messageMatch(ms, ovl) {
    if (!ms.message) return;

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return;

    // ===============================
    // 🔥 GESTION PAVÉ (PRIORITÉ ABSOLUE)
    // ===============================
    const handled = await handlePaveGame(ms, ovl);
    if (handled) return;

    console.log("📩 MESSAGE REÇU (hors pavé)");

    const rawText =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    if (!rawText) return;

    const safeText = rawText
        .replace(/\u200B/g, "")
        .replace(/\u200E/g, "")
        .replace(/\u200F/g, "")
        .replace(/\r/g, "")
        .trim();

    // ===============================
// 📋 GESTION LINEUP UNIQUEMENT
// ===============================
if (match.etat === "attente_lineup") {

    const squadMatch = safeText.match(/SQUAD.*?:\s*([^\n]+)/i);
    if (!squadMatch) return;

    const squadName = squadMatch[1].trim();

    const team1 = normalizeTeamName(match.team1);
    const team2 = normalizeTeamName(match.team2);
    const squad = normalizeTeamName(squadName);

    const senderJid = getSenderJid(ms);

    // ===============================
    // ✅ TEAM 1
    // ===============================
    if (squad === team1 && !match.equipe1) {

        // 🔒 ANTI VOL D'ÉQUIPE
        if (match.id1 && match.id1 !== senderJid) {
            if (match.id1 && match.id1 !== senderJid) {

    const err = formatErreurGlobal("❌ Cette équipe est déjà contrôlée par un autre joueur");

    await ovl.sendMessage(chat, {
        text: err.texte + `

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
    });

    return;
}

        match.id1 = senderJid;

        const parsed = parseSquadBlueLock(safeText);

if(parsed){

    match.lineup1 = parsed.joueurs.map(j => {

        const posteData = POSITION_POSTES[j.position] || {};

        return {
            ...j,
            zoneX: posteData.zoneX || "axe",
            ligne: posteData.ligne || "milieu",
            zoneY: null // sera défini au kickoff
        };
    });

}else{
    match.lineup1 = [];
}
        match.equipe1 = true;

        await ovl.sendMessage(chat, {
            text: `✅ Formation confirmée pour *${match.team1Nom}* !`
        });
    }

    // ===============================
    // ✅ TEAM 2
    // ===============================
    if (squad === team2 && !match.equipe2) {

    // 🔒 ANTI VOL D'ÉQUIPE
    if (match.id2 && match.id2 !== senderJid) {

    const err = formatErreurGlobal("❌ Cette équipe est déjà contrôlée par un autre joueur");

    await ovl.sendMessage(chat, {
        text: err.texte + `

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
    });

    return;
}
    

    match.id2 = senderJid;

    // ✅ FIX ICI
    const parsed = parseSquadBlueLock(safeText);

    if(parsed){

        match.lineup2 = parsed.joueurs.map(j => {

            const posteData = POSITION_POSTES[j.position] || {};

            return {
                ...j,
                zoneX: posteData.zoneX || "axe",
                ligne: posteData.ligne || "milieu",
                zoneY: null
            };
        });

    } else {
        match.lineup2 = [];
    }

    match.equipe2 = true;

    await ovl.sendMessage(chat, {
        text: `✅ Formation confirmée pour *${match.team2Nom}* !`
    });
        }

    // ===============================
    // 🚀 MATCH PRÊT
    // ===============================
    if (match.equipe1 && match.equipe2 && !match.starting) {
        match.starting = true;

        if (match.timerMatch) clearTimeout(match.timerMatch);

        match.etat = "debut_match";

        const readyText = `⏳ Les deux formations sont prêtes.
Le match commence dans *1 minute* 🥅⚽...`;

        const imagesReady = [
            "https://files.catbox.moe/dlj5z6.jpg",
            "https://files.catbox.moe/fdadd0.jpeg",
            "https://files.catbox.moe/4104s3.jpg"
        ];

        const imageRandom = imagesReady[Math.floor(Math.random() * imagesReady.length)];

        await ovl.sendMessage(chat, {
            image: { url: imageRandom },
            caption: readyText
        });

        match.timerMatch = setTimeout(() => lancerMatch(chat, ovl), 60000);
    }
   }
} 


/* ===============================
LANCEMENT MATCH
=================================*/
async function lancerMatch(chat, ovl) {
    const match = matchsActifs.get(chat);
    if (!match) return;
    if (match.kickoffStarted) return;

    match.kickoffStarted = true;

    const isTeam1 = Math.random() < 0.5;

    match.possession = isTeam1 ? match.team1Nom : match.team2Nom;
    match.phase = "kickoff";
    // PLACEMENT AUTOMATIQUE

const equipeAttack = match.possession === match.team1Nom ? match.lineup1 : match.lineup2;
const equipeDefense = match.possession === match.team1Nom ? match.lineup2 : match.lineup1;



  
    match.etat = "en_cours";

    match.joueurTour = isTeam1 ? match.id1 : match.id2;

    const jidStart = match.joueurTour;
    const mentionJid = jidStart;

    // ✅ affichage propre (sans @s.whatsapp.net)
    const displayName = jidStart.split("@")[0];

    const imagesKickOff = [
        "https://files.catbox.moe/onotk4.jpg",
        "https://files.catbox.moe/kfw0bl.jpg"
    ];

    await ovl.sendMessage(chat, {
    image: { url: imagesKickOff[Math.floor(Math.random() * imagesKickOff.length)] },
    caption:
`🎙️⚽: KICK OFF 🥅‼️ @${displayName} Débute avec la possession!⚽ 

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`,
    mentions: [mentionJid]
});

    // ⏱️ timer 1er joueur
    match.timerKickoff = setTimeout(async () => {

    const joueur = match.joueurTour?.split("@")[0];

    await ovl.sendMessage(chat, {
        text:
`⚽❌ *ERREUR* :
🎙️ @${joueur} n’a pas effectué le coup d’envoi à temps.

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`,
        mentions: [match.joueurTour]
    });

}, 6 * 60 * 1000);

} 
    
/* ===============================
LECTURE DES PAVÉS - TOUR DE CONTRÔLE
=================================*/
async function handlePaveGame(ms, ovl) {
    if (!ms.message) return false;

    const chat = ms.key.remoteJid;
    const match = matchsActifs.get(chat);
    if (!match) return false;

    const currentTeam = match.possession;
const nextTeam = currentTeam === match.team1Nom ? match.team2Nom : match.team1Nom;
    if (match.etat !== "en_cours") return false;

    const rawText =
        ms.message.conversation ||
        ms.message.extendedTextMessage?.text ||
        ms.message.imageMessage?.caption ||
        "";

    const text = rawText.trim();
    if (!text) return false;

    // =========================
    // 🔐 VALIDATION PAVÉ BLUELOCK
    // =========================
    const isBlueLockPave =
        text.includes("💬:") &&
        text.includes("⚽:") &&
        text.includes("🔷BLUELOCK⚽🥅");

    if (!isBlueLockPave) return false;
    
    const action = extraireAction(text);
    // =========================
// 🚨 REGLE KICKOFF
// =========================
if (match.phase === "kickoff") {

    const zoneDepart = extraireZoneDepart(action);

    if (zoneDepart !== "C2") {

        const err = formatErreurGlobal("❌ kickoff", null, match);

        await ovl.sendMessage(chat, {
            text:
`${err.texte}

╰─────────────────▱▱▱

                      🔷BLUELOCK⚽🥅`
        });

        return true;
    }
    const validation = verifierPaveBlueLock(action);

if(!validation.ok){

    await ovl.sendMessage(chat,{
    text: formatErreurGlobal(validation)
});

    return true;
}
    
const dialogue = text.split("💬:")[1]?.split("▔")[0]?.trim();
    const isInvalid = !action || action.length < 3;

if (isInvalid) {

    const roles = triggerCounterAttack(match, currentTeam, nextTeam);

    await ovl.sendMessage(chat, {
        text:
`❌ Erreur de pavé !

⚡ CONTRE-ATTAQUE IMMÉDIATE !
⚽ ${roles.newAttacker} récupère le ballon`
    });

    return true;
}

    // =========================
    // 👤 CHECK JOUEUR TOUR
    // =========================
const sender = normalizeJid(getSenderJid(ms));
const tour = normalizeJid(match.joueurTour);

console.log("🧪 SENDER:", sender);
console.log("🧪 TOUR:", tour);

if (sender !== tour) {
    await ovl.sendMessage(chat, {
        text: "❌ Ce n’est pas ton tour de jouer !"
    });
    return true;
}
    // =========================
    // ⚽ ACTION
    // =========================
if (action) {

 // 🔍 récupérer joueur
const joueurMatch = action.match(/\)\s*([^\s]+)/);
const nomJoueur = joueurMatch ? joueurMatch[1].trim() : null;

const allJoueurs = [
    ...(match.lineup1 || []),
    ...(match.lineup2 || [])
];

let joueurObj = allJoueurs.find(j => 
    j.nom.toLowerCase() === nomJoueur?.toLowerCase()
);

// ❌ joueur non trouvé (TOUJOURS AVANT TOUT)
if (!joueurObj) {

    const err = formatErreurGlobal("❌ Joueur introuvable", joueurObj, match);

    await ovl.sendMessage(chat, { 
        text: err.texte 
    });

    return true;
}

// ✅ déplacement (UNE SEULE FOIS)
const move = await handleDeplacements(match, action, joueurObj);

if (!move.ok) {

    const err = formatErreurGlobal(move, joueurObj, match);

    await ovl.sendMessage(chat, { 
        text: err.texte 
    });

    return true;
}

console.log(`📍 ${joueurObj.nom} → ${joueurObj.zoneX} / ${joueurObj.zoneY}`);

await ovl.sendMessage(chat, {  
    text: `⚽✅ Action validée:\n${action}
╰───────────────────     
                       🔷BLUELOCK⚽🥅`
});
    
// ===============================
// 🔥 ACTIVATION POSITIONS APRÈS KICKOFF
// ===============================
if (match.phase === "kickoff") {

    const equipeAttack = match.possession === match.team1Nom ? match.lineup1 : match.lineup2;
    const equipeDefense = match.possession === match.team1Nom ? match.lineup2 : match.lineup1;

    equipeAttack.forEach(j => {
        j.zoneY = getZoneYParLigne(j.ligne, "attaque");
    });

    equipeDefense.forEach(j => {
        j.zoneY = getZoneYParLigne(j.ligne, "defense");
    });

    match.positions = [
        ...match.lineup1,
        ...match.lineup2
    ];

    assignerVisAVis(match);

    match.phase = "normal";

    await ovl.sendMessage(chat, {
        text: "📍 Positions maintenant fixées !"
    });
}
} else {
    await ovl.sendMessage(chat, {
    text: formatErreurGlobal("Aucune action détectée")
});
}
// =========================
// 🔄 FIN DE POSSESSION (4 actions)
// =========================
if (match.actionsRestantes[currentTeam] <= 0) {

    const possessionNumber = resetPossession(match, currentTeam);

    switchRoles(match);

    const roleCurrent = match.role[currentTeam];
    const roleOther = match.role[nextTeam];

    await ovl.sendMessage(chat, {
        text:
`🔁 Fin possession ${possessionNumber}

⚽ ${currentTeam}: ${roleCurrent.toUpperCase()}
🛡️ ${nextTeam}: ${roleOther.toUpperCase()}`
    });
}

    // =========================
    // 💬 DIALOGUE
    // =========================
    if (dialogue) {
        await ovl.sendMessage(chat, {
            text: `💬 ${dialogue}`
        });
    }

    // =========================
    // 🔁 SWITCH JOUEUR (IMPORTANT)
    // =========================
    const isP1 = match.joueurTour === match.id1;

    const nextJoueur = isP1 ? match.id2 : match.id1;
    const nextNom = isP1 ? match.team2Nom : match.team1Nom;

    match.joueurTour = nextJoueur;

    const displayNext = nextJoueur.split("@")[0];

await ovl.sendMessage(chat, {
    text:
`⚽ NEXT ! @${displayNext}

⚔️ ATTAQUE: ${match.role[currentTeam] === "attack" ? currentTeam : nextTeam}
🛡️ DÉFENSE: ${match.role[currentTeam] === "attack" ? nextTeam : currentTeam}

🎯 4 actions pour marquer`,
    mentions: [nextJoueur]
});


// =========================
// ⏱️ TIMER TOUR
// =========================
if (match.timerPave) clearTimeout(match.timerPave);

match.timerPave = setTimeout(async () => {
    await ovl.sendMessage(chat, {
        text: `⏰ @${nextNom} temps écoulé ❌`,
        mentions: [nextJoueur]
    });
}, 6 * 60 * 1000);

return true;
} 
} 
    
// ===============================
// -------- GESTION DES DÉPLACEMENTS
// ===============================
async function handleDeplacements(match, actionText, joueurObj) {

    const direction = extraireDirectionLargeur(actionText);
    const distance = extraireDistance(actionText);
    const zoneDepart = extraireZoneDepart(actionText);
    const zoneArrivee = extraireZoneArrivee(actionText);

    if (zoneDepart && joueurObj.zoneY !== zoneDepart) {
        return { ok: false, erreur: "❌ Mauvaise position" };
    }

    if (zoneArrivee) {
        const dist = calculDistance(joueurObj.zoneY, zoneArrivee);
        if (dist > MAX_DEPLACEMENT) {
            return { ok: false, erreur: "❌ Déplacement trop long" };
        }
        joueurObj.zoneY = zoneArrivee;
    }

    if (direction && distance) {
        updatePositionJoueur(joueurObj, direction, distance);
    }

    // 👉 APPEL DU TRACKING
    updateGlobalPositions(match, joueurObj);

    return { ok: true, joueur: joueurObj };
}

// ===============================
// -------- TRACKING POSITIONS
// ===============================
function updateGlobalPositions(match, joueur) {

    if (!match.positions) match.positions = [];

    const index = match.positions.findIndex(p => p.nom === joueur.nom);

    if (index !== -1) {
        match.positions[index] = joueur;
    } else {
        match.positions.push(joueur);
    }
}

// ===============================
// -------- VIS À VIS
// ===============================
function assignerVisAVis(match) {

    const equipe1 = match.lineup1 || [];
    const equipe2 = match.lineup2 || [];

    match.duels = [];

    equipe1.forEach(j1 => {

        let cible;

        if (j1.zoneX === "aile gauche") {
            cible = equipe2.find(j => j.zoneX === "aile droite" && j.ligne === j1.ligne);
        }
        else if (j1.zoneX === "aile droite") {
            cible = equipe2.find(j => j.zoneX === "aile gauche" && j.ligne === j1.ligne);
        }
        else {
            cible = equipe2.find(j => j.zoneX === "axe" && j.ligne === j1.ligne);
        }

        if (cible) {
            match.duels.push({
                joueur1: j1.nom,
                joueur2: cible.nom
            });
        }
    });
}

/* ===============================
🎯 HANDLE PASSES BLUELOCK (FINAL)
=================================*/

async function handlePasses(match, action, joueur) {

    if (!action || !joueur) {
        return { ok: false, erreur: "❌ Données invalides (passe)" };
    }

    const txt = action.toLowerCase();

    // ===============================
    // 🎯 1. DETECTION TYPE DE PASSE
    // ===============================
    let typePasse = null;

    for (const type in TYPES_PASSES) {
        if (txt.includes(type)) {
            typePasse = type;
            break;
        }
    }

    if (!typePasse) {
        return { ok: false, erreur: "❌ Type de passe non reconnu" };
    }

    // ===============================
    // 📐 2. FORMULE OBLIGATOIRE
    // ===============================
    const elementsObligatoires = [
        /passe/,
        /(intérieur du pied|extérieur du pied|pointe de pied|talon|tête)/,
        /(gauche|droite|devant|derrière)/,
        /(ras du sol|cm|mh)/,
        /\d+\s?m/,
        /(pied|tête|torse)/
    ];

    for (const reg of elementsObligatoires) {
        if (!reg.test(txt)) {
            return {
                ok: false,
                erreur: "❌ Formule de passe incomplète"
            };
        }
    }

    // ===============================
    // 🧩 3. SCORE RESSEMBLANCE MODELE
    // ===============================
    const modele = TYPES_PASSES[typePasse];
    const motsModele = modele.toLowerCase().split(" ");

    let score = 0;

    motsModele.forEach(mot => {
        if (txt.includes(mot)) score++;
    });

    const precision = Math.round((score / motsModele.length) * 100);

    if (precision < 60) {
        return {
            ok: false,
            erreur: `❌ Passe mal formulée (${precision}%)`
        };
    }

    // ===============================
    // 🧠 4. REGLES SPECIFIQUES
    // ===============================
    const regles = REGLES_PASSES[typePasse];

    if (regles) {

        // mots obligatoires
        if (regles.obligatoire) {
            for (const mot of regles.obligatoire) {
                if (!txt.includes(mot)) {
                    return {
                        ok: false,
                        erreur: `❌ Élément manquant: ${mot}`
                    };
                }
            }
        }

        // validation custom
        if (regles.validate) {
            const result = regles.validate(txt, joueur);

            if (result !== true) {
                return {
                    ok: false,
                    erreur: result
                };
            }
        }
    }

    // ===============================
    // 🧠 5. CONTROLE / DEVIATION
    // ===============================
    const hasControle =
        txt.includes("contrôle") ||
        txt.includes("controle");

    const notePasse = joueur.note || 0;

    if (!hasControle) {

        if (notePasse < 85) {
            return {
                ok: false,
                erreur: "❌ Contrôle obligatoire (joueur <85 PAS)"
            };
        }

        if (!txt.includes("déviation") && !txt.includes("deviation")) {
            return {
                ok: false,
                erreur: "❌ Passe sans contrôle = déviation obligatoire"
            };
        }
    }

    // ===============================
    // 📏 6. DISTANCE MAX GLOBALE
    // ===============================
    const d = extraireDistance(txt);

    if (d && d > 30) {
        return {
            ok: false,
            erreur: "❌ Distance max 30m"
        };
    }

    // ===============================
    // ⚔️ 7. INTERCEPTION VIA VIS-À-VIS
    // ===============================
    const visavis = joueur.visavis;

    if (visavis) {

        // petite probabilité selon précision
        const chance = precision < 80 ? 0.5 : 0.2;

        if (Math.random() < chance) {

            match.possession =
                match.possession === match.team1Nom
                    ? match.team2Nom
                    : match.team1Nom;

            return {
                ok: false,
                interception: true,
                message: `🛑 Passe interceptée par ${visavis.nom} !`
            };
        }
    }

    // ===============================
    // 📍 8. UPDATE POSITION BALLE
    // ===============================
    const zoneArrivee = extraireZoneArrivee(txt);

    if (zoneArrivee) {
        joueur.zoneY = zoneArrivee;
    }

    // ===============================
    // ✅ SUCCESS
    // ===============================
    return {
        ok: true,
        type: typePasse,
        precision
    };
}

        
/* ===============================
COMMANDE +STOPMATCH⚽
=================================*/ 
ovlcmd({
    nom_cmd: "stopmatch⚽",
    classe: "BLUELOCK⚽",
    react: "⛔",
    desc: "Arrêter le match en cours dans le groupe"
}, async (ms_org, ovl, cmd_options) => {
    try {

        // ✅ ms_org EST DÉJÀ LE JID
        const chat = ms_org;

        const match = matchsActifs.get(chat);

        if (!match) {
            return ovl.sendMessage(chat, {
                text: "⚠️ Aucun match en cours dans ce groupe."
            });
        }

        // ===============================
        // ⛔ STOP TOUS LES TIMERS
        // ===============================
        if (match.timerPave) clearTimeout(match.timerPave);
        if (match.timerTour) clearTimeout(match.timerTour);
        if (match.timerKickoff) clearTimeout(match.timerKickoff);
        if (match.timerAction) clearTimeout(match.timerAction);

        // BONUS sécurité
        match.timerPave = null;
        match.timerTour = null;
        match.timerKickoff = null;
        match.timerAction = null;

        // ===============================
        // 🧨 RESET MATCH COMPLET
        // ===============================
        match.etat = "arrete";
        match.kickoffStarted = false;

        // ===============================
        // 🗑 SUPPRESSION
        // ===============================
        matchsActifs.delete(chat);

        await ovl.sendMessage(chat, {
            text: `⛔ Le match Blue Lock a été arrêté avec succès !`
        });

    } catch (e) {
        console.error("❌ Erreur stopmatch :", e);

        const chat = ms_org;

        await ovl.sendMessage(chat, {
            text: "❌ Erreur lors de l'arrêt du match."
        });
    }
});

module.exports = { messageMatch, verifierFiche };
