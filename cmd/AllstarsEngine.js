const axios = require("axios");
const { ovlcmd } = require("../lib/ovlcmd");

const {
    getData,
    setfiche,
    getAllFiches
} = require("../DataBase/allstars_divs_fiches");

const { AllStarsDivsFiche } = require("../DataBase/allstars_divs_fiches");

const { cards } = require("../DataBase/cards");
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
const config = require("../set");


//================================================
// 🤖 GEMINI — CONFIGURATION ARBITRE COMBAT
//================================================

const GEMINI_COMBAT_MODELS = [

    // Modèle principal
    "gemini-3.7-flash",

    // Secours rapide
    "gemini-3.5-flash",

    // Secours économique
    "gemini-3.5-flash-lite"

];

const GEMINI_MAX_RETRIES = 3;


//================================================
// ⏱️ ATTENTE BACKOFF
//================================================

function attendreGemini(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

} 

//================================================
// 🤖 APPEL GEMINI
//================================================
async function appelerGemini(prompt) {

    const apiKey =
        process.env.GEMINI_API_KEY;

    if (!apiKey) {

        throw new Error(
            "❌ GEMINI_API_KEY n'est pas configurée sur Render"
        );

    }


    //================================================
    // 🤖 MODÈLES À ESSAYER
    //================================================

    const modeles = [

        "gemini-2.5-flash",

        // Modèle de secours
        "gemini-2.5-flash-lite"

    ];


    //================================================
    // ⚙️ PARAMÈTRES
    //================================================

    const MAX_TENTATIVES_PAR_MODELE = 3;

    const DELAI_BASE = 1500;


    //================================================
    // 🔁 BOUCLE MODÈLES
    //================================================

    for (const modele of modeles) {

        const url =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            modele +
            ":generateContent?key=" +
            apiKey;


        //================================================
        // 🔄 RETRIES
        //================================================

        for (
            let tentative = 1;
            tentative <= MAX_TENTATIVES_PAR_MODELE;
            tentative++
        ) {

            try {

                console.log(
                    `🤖 GEMINI : ${modele} | tentative ${tentative}/${MAX_TENTATIVES_PAR_MODELE}`
                );


                //================================================
                // 📡 APPEL API
                //================================================

                const response =
                    await axios.post(

                        url,

                        {
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: prompt
                                        }
                                    ]
                                }
                            ],

                            generationConfig: {

                                temperature: 0,

                                responseMimeType:
                                    "application/json"

                            }

                        },

                        {
                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            timeout: 30000

                        }

                    );


                //================================================
                // 📦 EXTRACTION
                //================================================

                const texte =
                    response.data
                        ?.candidates?.[0]
                        ?.content?.parts?.[0]
                        ?.text;


                if (!texte) {

                    throw new Error(
                        "Gemini n'a renvoyé aucun texte"
                    );

                }


                //================================================
                // 🧹 NETTOYAGE JSON
                //================================================

                let jsonTexte =
                    texte.trim();


                // Retire éventuellement ```json ... ```
                jsonTexte =
                    jsonTexte
                        .replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/\s*```$/i, "")
                        .trim();


                //================================================
                // 🔎 PARSE JSON
                //================================================

                let resultat;

                try {

                    resultat =
                        JSON.parse(jsonTexte);

                } catch (parseError) {

                    console.error(
                        "❌ GEMINI : JSON invalide :",
                        jsonTexte
                    );

                    throw new Error(
                        "Gemini a renvoyé un JSON invalide"
                    );

                }


                //================================================
                // ✅ SUCCÈS
                //================================================

                console.log(
                    `✅ GEMINI OK : ${modele}`
                );

                return resultat;


            } catch (error) {

                const status =
                    error.response?.status;


                const data =
                    error.response?.data;


                console.error(
                    `❌ GEMINI ${modele} | tentative ${tentative}`,
                    {
                        status,
                        message:
                            error.message,
                        data
                    }
                );


                //================================================
                // 🚫 ERREURS NON TEMPORAIRES
                //================================================

                const erreurDefinitive =
                    status === 400 ||
                    status === 401 ||
                    status === 403;


                if (erreurDefinitive) {

                    throw error;

                }


                //================================================
                // 🔄 SI DERNIÈRE TENTATIVE
                // PASSER AU MODÈLE SUIVANT
                //================================================

                if (
                    tentative ===
                    MAX_TENTATIVES_PAR_MODELE
                ) {

                    console.log(
                        `⚠️ ${modele} indisponible → modèle suivant`
                    );

                    break;

                }


                //================================================
                // ⏳ BACKOFF
                //================================================

                const delai =
                    DELAI_BASE *
                    tentative;


                console.log(
                    `⏳ Nouvelle tentative dans ${delai} ms...`
                );


                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            delai
                        )
                );

            }

        }

    }


    //================================================
    // ❌ TOUS LES MODÈLES ONT ÉCHOUÉ
    //================================================

    throw new Error(
        "❌ GEMINI indisponible après toutes les tentatives"
    );

}


//================================================
// 🤖 ANALYSE PAVÉ AVEC GEMINI
//================================================

async function analysePaveAvecGemini(message, contexteMatch = {}) {

    try {

        //================================================
        // 1️⃣ RÉCUPÉRATION DU TEXTE
        //================================================

        const texte =
            typeof message === "string"
                ? message
                : message?.body ||
                  message?.text ||
                  message?.message?.conversation ||
                  "";

        if (!texte) {
            return {
                ok: false,
                paveDetecte: false,
                erreur: "Message vide"
            };
        }


        //================================================
        // 2️⃣ DÉTECTION DU PAVÉ
        //================================================

        const marqueurDebut =
            "░▒░ RAZORX⚡™ | 🪀GAMING 🎮░▒░";

        const marqueurActions =
            "🌀🎮:";

        const marqueurFin =
            "░▒░  *𝗡𝗘𝗢🔷 ESPORTS ARENA®🏆* ░▒░";


        const estPave =
            texte.includes(marqueurDebut) &&
            texte.includes(marqueurActions) &&
            texte.includes(marqueurFin);


        if (!estPave) {

            return {
                ok: true,
                paveDetecte: false
            };

        }


        //================================================
        // 3️⃣ RÉCUPÉRATION DE L'AUTEUR
        //================================================

        const user =
            message?.sender ||
            message?.participant ||
            message?.key?.participant ||
            message?.key?.remoteJid ||
            contexteMatch?.user ||
            null;


        //================================================
        // 4️⃣ EXTRACTION DES ACTIONS
        //================================================

        const positionActions =
            texte.indexOf(marqueurActions);

        if (positionActions === -1) {

            return {
                ok: false,
                paveDetecte: true,
                user,
                erreur: "Marqueur 🌀🎮: introuvable"
            };

        }


        const actionsTexte =
            texte
                .slice(
                    positionActions +
                    marqueurActions.length
                )
                .split(marqueurFin)[0]
                .trim();


        if (!actionsTexte) {

            return {
                ok: false,
                paveDetecte: true,
                user,
                erreur: "Aucune action trouvée après 🌀🎮:"
            };

        }


        //================================================
// 5️⃣ CONTEXTE SAFE POUR GEMINI
//================================================
// Le contexte contient uniquement les informations
// réellement nécessaires à l'arbitrage du combat.
//
// ⚠️ On ne donne PAS directement match à JSON.stringify()
// car match peut contenir des Timeout/cycles.
//
// ⚠️ Pas de Price, images, rarete, Moves, Patterns, etc.
//================================================

const tracker =
    contexteMatch?.match?.trackerCombatGemini ||
    contexteMatch?.trackerCombatGemini ||
    null;


const joueursMatch =
    Array.isArray(contexteMatch?.match?.joueurs)
        ? contexteMatch.match.joueurs
        : [];


const joueursTracker =
    Array.isArray(tracker?.joueurs)
        ? tracker.joueurs
        : [];


//================================================
// 👥 CONSTRUCTION DES JOUEURS
//================================================

const joueursGemini =
    joueursMatch.map(j => {

        const jid =
            j?.jid ||
            null;


        //================================================
        // 🔎 CHERCHER LE JOUEUR DANS LE TRACKER
        //================================================

        const etat =
            joueursTracker.find(
                t =>
                    t?.jid === jid
            ) || null;


        //================================================
        // 🎴 CARTE UNIQUEMENT POUR LES INFOS COMBAT
        //================================================

        const carte =
            j?.carte ||
            j?.card ||
            j?.personnage ||
            j?.character ||
            null;


        const personnage =
            etat?.personnage ||
            carte?.name ||
            j?.personnage ||
            j?.nomPersonnage ||
            j?.name ||
            null;


        const grade =
            etat?.grade ||
            carte?.grade ||
            null;


        const category =
            etat?.category ||
            carte?.category ||
            null;


        //================================================
        // ⚡ VMAX
        //================================================

        const vitesseMax =
            etat?.vitesseMax ??
            (
                grade === "Bronze"
                    ? 6
                    : grade === "Argent" ||
                      grade === "Silver"
                        ? 8
                        : grade === "Or" ||
                          grade === "Gold"
                            ? 10
                            : null
            );


        //================================================
        // 📦 RETOUR JOUEUR
        //================================================

        return {

            jid,

            pseudo:
    j?.pseudo ||
    j?.user?.pseudo ||
    j?.player?.pseudo ||
    j?.nomJoueur ||
    contexteMatch?.joueur?.pseudo ||
    null,

            personnage,

            grade,

            category,

            //================================================
            // ⚡ VITESSE MAXIMALE DU PERSONNAGE
            //================================================

            vitesseMax,

            //================================================
            // ❤️ ÉTAT ACTUEL
            //================================================

            pv:
                etat?.pv ??
                100,

            stamina:
                etat?.stamina ??
                100,

            energie:
                etat?.energie ??
                100,

            //================================================
            // 🧍 ÉTAT PHYSIQUE
            //================================================

            posture:
                etat?.posture ||
                "neutre",

            equilibre:
                etat?.equilibre ||
                "stable",

            //================================================
            // 📏 DISTANCE AVEC L'ADVERSAIRE
            //================================================

            distanceAdversaire:
                etat?.distanceAdversaire ??
                null,

            //================================================
            // 🧭 POSITION RELATIVE
            //================================================

            positionRelative:
                etat?.positionRelative ||
                "face",

            //================================================
            // 🗡️ ARME
            //================================================

            weapon: {

                active:
                    etat?.weapon?.active ??
                    false,

                nom:
                    etat?.weapon?.nom ||
                    null
            },

            //================================================
            // ☠️ KO
            //================================================

            ko:
                etat?.ko ??
                false

        };

    });


//================================================
// 🧠 CONTEXTE FINAL GEMINI
//================================================

const contexteGemini = {

    //================================================
    // 👤 UTILISATEUR
    //================================================

    user:
        contexteMatch?.user ||
        user ||
        null,


    //================================================
    // 🎮 JOUEUR QUI ENVOIE LE PAVÉ
    //================================================

    joueur:
        contexteMatch?.joueur
            ? {

                jid:
                    contexteMatch.joueur.jid ||
                    null,

                pseudo:
                    contexteMatch.joueur.pseudo ||
                    contexteMatch.joueur.nom ||
                    contexteMatch.joueur.name ||
                    null,

                personnage:
                    contexteMatch.joueur.personnage ||
                    contexteMatch.joueur.nomPersonnage ||
                    null

            }
            : null,


    //================================================
    // ⚔️ MATCH
    //================================================

    match:
        contexteMatch?.match
            ? {

                id:
                    contexteMatch.match.id ||
                    null,

                etat:
                    contexteMatch.match.etat ||
                    "ACTIF",

                //================================================
                // 🔆 JOUEUR QUI DOIT JOUER
                //================================================

                joueurTour:
                    contexteMatch.match.joueurTour ||
                    tracker?.combat?.joueurTour ||
                    null,

                //================================================
                // ⚔️ TOUR
                //================================================

                tour:
                    tracker?.combat?.tour ??
                    0,

                maxTours:
                    tracker?.combat?.maxTours ??
                    10,

                //================================================
                // 👥 JOUEURS
                //================================================

                joueurs:
                    joueursGemini

            }
            : null

};


//================================================
// 🧠 DEBUG
//================================================

console.log(
    "🧠 CONTEXTE GEMINI COMBAT :",
    JSON.stringify(
        contexteGemini.match,
        null,
        2
    )
);


        //================================================
// 6️⃣ PROMPT GEMINI
//================================================
const prompt = `

${GEMINI_RULES_PROMPT}

================================================
MISSION SPÉCIFIQUE DE CETTE ANALYSE
================================================

Tu dois maintenant analyser le pavé suivant en appliquant
STRICTEMENT toutes les règles ci-dessus.

Tu dois notamment :

1. Identifier toutes les actions.
2. Les remettre dans leur ordre chronologique.
3. Compter les actions.
4. Vérifier la limite de 4 actions.
5. RÈGLE VMAX OBLIGATOIRE :

   Lorsque le pavé contient "VMAX", "vitesse maximale",
   "à vitesse maximale", "course VMAX" ou toute formulation
   équivalente, tu dois récupérer automatiquement la vitesse
   depuis le grade du personnage dans le CONTEXTE DU MATCH.

   Correspondance officielle :

   - Bronze = 6 m/s
   - Argent = 8 m/s
   - Or = 10 m/s

   Exemple :

   Contexte :
   Yamato = Bronze

   Pavé :
   "Yamato fonce en course VMAX vers Tobirama."

   Tu dois obligatoirement interpréter :
   Yamato VMAX = 6 m/s.

6. Le joueur n'a PAS besoin d'écrire la valeur numérique
   de la VMAX dans son pavé.

   Si le grade du personnage est présent dans le contexte,
   "VMAX" est une information COMPLÈTE et VALIDE.

   NE REFUSE JAMAIS une VMAX uniquement parce que la valeur
   en m/s n'est pas écrite dans le pavé lorsque le grade
   du personnage est disponible dans le contexte.

   Le CONTEXTE DU MATCH est une source officielle de données.

   Si le contexte indique :
   "Yamato | Grade : Bronze | Vmax : 6 m/s"

   alors toute mention de "VMAX" par Yamato doit être
   automatiquement évaluée à 6 m/s.

   Tu dois utiliser cette valeur pour tous les calculs
   de déplacement, distance et vitesse nécessaires.

   Tu ne dois pas répondre :
   "la VMAX est inconnue"
   si le grade ou la VMAX du personnage est présent
   dans le contexte.
7. Pour une défense, identifier précisément l'attaque à laquelle
   chaque action répond.
8. Évaluer chaque défense séparément.
9. Déterminer si elle est réussie, partielle ou ratée.
10. Appliquer immédiatement les conséquences d'une défense
    avant d'analyser la suivante.
11. Si une défense partielle provoque un déséquilibre,
    changement de posture, ouverture de garde ou déplacement
    empêchant la défense suivante, alors la défense suivante
    doit être réévaluée avec ce nouvel état.
12. Appliquer les dégâts lorsqu'une attaque atteint sa cible.
13. Décrire les conséquences physiques justifiées.
14. Produire un résumé narratif court.
15. Déterminer le joueur suivant.

================================================
CONTEXTE DU MATCH
================================================

${JSON.stringify(contexteGemini, null, 2)}

================================================
PAVÉ À ANALYSER
================================================

${actionsTexte}

================================================
FORMAT DE RÉPONSE OBLIGATOIRE
================================================

Réponds UNIQUEMENT avec un JSON valide.

{
    "paveValide": true,
    "nombreActions": 0,
    "actions": [
        {
            "ordre": 1,
            "acteur": "",
            "cible": "",
            "type": "",
            "description": "",
            "valide": true,
            "raison": "",
            "resultatDefense": "",
            "consequence": ""
        }
    ],
    "note": 0,
    "verdict": "",
    "resume": "",
    "joueurSuivant": {
        "nom": "",
        "jid": ""
    },
    "consequences": {
        "touche": false,
        "contre": false,
        "mauvaisContre": false,
        "degats": 0,
        "effets": [],
        "position": "",
        "posture": "",
        "equilibre": "",
        "garde": ""
    },
    "erreurs": []
}

Ne retourne aucun Markdown.
Ne retourne aucun texte avant ou après le JSON.
`;


        //================================================
// 7️⃣ APPEL GEMINI
//================================================

const apiKey =
    process.env.GEMINI_API_KEY;

if (!apiKey) {

    throw new Error(
        "GEMINI_API_KEY manquante dans Render"
    );

}


const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
    apiKey;


const response =
    await axios.post(
        url,
        {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],

            generationConfig: {
                responseMimeType: "application/json"
            }
        },
        {
            headers: {
                "Content-Type": "application/json"
            },

            timeout: 30000
        }
    );

        //================================================
        // 8️⃣ EXTRACTION RÉPONSE
        //================================================

        let resultatTexte =
            response
                ?.data
                ?.candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text;


        if (!resultatTexte) {

            throw new Error(
                "Gemini n'a retourné aucune réponse"
            );

        }


        resultatTexte =
            resultatTexte
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();


        //================================================
        // 9️⃣ PARSE JSON
        //================================================

        let resultat;

        try {

            resultat =
                JSON.parse(resultatTexte);

        } catch (e) {

            console.error(
                "❌ JSON GEMINI INVALIDE :",
                resultatTexte
            );

            return {
                ok: false,
                paveDetecte: true,
                user,
                actionsTexte,
                erreur: "Réponse Gemini invalide"
            };

        }


        //================================================
        // 🔟 RETOUR FINAL
        //================================================

        return {

            ok: true,

            paveDetecte: true,

            user,

            actionsTexte,

            ...resultat

        };


    } catch (error) {

        console.error(
            "❌ ERREUR analysePaveAvecGemini :",
            error?.response?.data ||
            error?.message ||
            error
        );

        return {

            ok: false,

            paveDetecte: false,

            erreur:
                error?.response?.data?.error?.message ||
                error?.message ||
                "Erreur inconnue Gemini"

        };

    }

}

//================================================
// 🎮 RENDU VISUEL DU PAVÉ GEMINI
//================================================
async function envoyerResultatPaveGemini(
    ovl,
    chat,
    resultat,
    match = {}
) {

    try {

        if (
            !resultat?.ok ||
            !resultat?.paveDetecte
        ) {

            console.log(
                "❌ Aucun résultat de pavé à afficher"
            );

            return;
        }


        //================================================
        // 👤 JOUEUR SUIVANT
        //================================================

        const joueurSuivant =
            resultat.joueurSuivant || {};


        const prochainJid =
            joueurSuivant.jid || null;


        //================================================
        // 👤 RÉCUPÉRATION DU PSEUDO
        // ⚠️ JAMAIS LE NOM DU PERSONNAGE
        //================================================

        let prochainPseudo = null;


        //================================================
        // 🔎 1️⃣ RECHERCHE DANS match.joueurs
        //================================================

        if (
            prochainJid &&
            Array.isArray(match?.joueurs)
        ) {

            const joueur =
                match.joueurs.find(
                    j =>
                        j?.jid === prochainJid
                );


            if (joueur) {

                prochainPseudo =
                    joueur.pseudo ||
                    joueur.username ||
                    joueur.user ||
                    joueur.nomJoueur ||
                    null;

            }

        }


        //================================================
        // 🔎 2️⃣ RECHERCHE DANS match.players
        //================================================

        if (
            !prochainPseudo &&
            prochainJid &&
            match?.players
        ) {

            for (
                const equipe
                of Object.values(match.players)
            ) {

                const joueur =
                    equipe?.find?.(
                        j =>
                            j?.jid === prochainJid
                    );


                if (joueur) {

                    prochainPseudo =
                        joueur.pseudo ||
                        joueur.username ||
                        joueur.user ||
                        joueur.nomJoueur ||
                        null;


                    if (prochainPseudo) {
                        break;
                    }

                }

            }

        }


        //================================================
        // 🔎 3️⃣ GEMINI PEUT FOURNIR LE PSEUDO
        //================================================

        if (!prochainPseudo) {

            prochainPseudo =
                joueurSuivant.pseudo ||
                joueurSuivant.username ||
                joueurSuivant.user ||
                null;

        }


        //================================================
        // 👤 SECOURS
        //================================================

        if (!prochainPseudo) {

            prochainPseudo =
                prochainJid ||
                "Joueur suivant";

        }


        //================================================
        // 🔄 TRANSFERT DU TOUR
        // ⚠️ VALIDE OU REFUSÉ
        //================================================

        if (
            match &&
            prochainJid
        ) {

            match.joueurTour =
                prochainJid;

            match.currentPlayer =
                prochainJid;

            match.joueurActuel =
                prochainJid;


            console.log(
                "🔄 TOUR TRANSFÉRÉ À :",
                prochainPseudo,
                "|",
                prochainJid
            );

        }


        //================================================
        // ⏱️ TIMER DU PROCHAIN JOUEUR
        //================================================

        if (
            typeof startTimerPourJoueur === "function" &&
            prochainJid
        ) {

            await startTimerPourJoueur(
                chat,
                prochainJid,
                match
            );

        }


        //================================================
        // ❌ PAVÉ INVALIDE
        //================================================

        if (!resultat.paveValide) {

            const erreurs =
                Array.isArray(resultat.erreurs)
                    ? resultat.erreurs
                        .map(
                            e => `- ${e}`
                        )
                        .join("\n")
                    : "Pavé invalide";


            const texte =

`░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

❌ *PAVÉ REFUSÉ*

${resultat.verdict ||
    "Le pavé est invalide."}

${erreurs}

📊 *Note du pavé :*
${resultat.note ?? 0}/10 ⭐

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆 *JOUEUR SUIVANT :*

➡️ @${prochainPseudo} *GO!!* 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;


            await ovl.sendMessage(
                chat,
                {
                    text: texte,

                    mentions:
                        prochainJid
                            ? [prochainJid]
                            : []
                }
            );


            console.log(
                "🎮 PAVÉ REFUSÉ"
            );

            console.log(
                "➡️ PROCHAIN GO :",
                prochainPseudo,
                "|",
                prochainJid
            );


            return;
        }


        //================================================
        // ✅ ACTIONS VALIDÉES
        //================================================

        const resume =
            resultat.resume ||
            "Actions validées.";


        const note =
            Number(resultat.note) || 0;


        //================================================
        // 📤 MESSAGE VISUEL
        //================================================

        const texte =

`░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

✅ *ACTIONS VALIDÉES :*

- ${resume}

📊 *Note du pavé :*
${note}/10 ⭐

▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆 *JOUEUR SUIVANT :*

➡️ @${prochainPseudo} *GO!!* 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;


        await ovl.sendMessage(
            chat,
            {
                text: texte,

                mentions:
                    prochainJid
                        ? [prochainJid]
                        : []
            }
        );


        console.log(
            "🎮 RENDU PAVÉ ENVOYÉ"
        );

        console.log(
            "➡️ PROCHAIN GO :",
            prochainPseudo,
            "|",
            prochainJid
        );


    } catch (error) {

        console.error(
            "❌ ERREUR RENDU PAVÉ GEMINI :",
            error
        );

    }

}


//================================================
// 🧠 TRACKER COMBAT GEMINI
//================================================
function initTrackerCombatGemini(match) {

    const joueurs =
        Array.isArray(match?.joueurs)
            ? match.joueurs
            : [];

    const tracker = {

        //================================================
        // ⚔️ COMBAT
        //================================================

        combat: {

            id:
                match?.id ||
                null,

            etat:
                match?.etat ||
                "ACTIF",

            // 1 tour = 2 pavés
            tour: 0,

            maxTours: 10,

            // Joueur dont c'est actuellement le tour
            joueurTour:
                match?.joueurTour ||
                null,

            // Premier pavé du tour en attente
            paveEnAttente:
                null,

            // Historique des tours
            historique:
                []
        },

        //================================================
        // 👥 JOUEURS
        //================================================

        joueurs:
            joueurs.map(j => {

                const carte =
                    j?.carte ||
                    null;

                const grade =
                    carte?.grade ||
                    j?.grade ||
                    null;

                //================================================
                // ⚡ VMAX SELON LE GRADE
                //================================================

                let vitesseMax =
                    j?.vitesseMax ??
                    null;

                if (vitesseMax == null) {

                    const g =
                        String(grade || "")
                            .toLowerCase()
                            .trim();

                    if (g === "bronze") {

                        vitesseMax = 6;
                    }

                    else if (
                        g === "argent" ||
                        g === "silver"
                    ) {

                        vitesseMax = 8;
                    }

                    else if (
                        g === "or" ||
                        g === "gold"
                    ) {

                        vitesseMax = 10;
                    }
                }

                return {

                    //================================================
                    // 👤 IDENTITÉ
                    //================================================

                    jid:
                        j?.jid ||
                        null,

                    nom:
                        j?.nom ||
                        j?.name ||
                        null,

                    personnage:
                        carte?.name ||
                        j?.personnage ||
                        j?.nomPersonnage ||
                        null,

                    //================================================
                    // 🎴 INFORMATIONS DE RÉFÉRENCE
                    //================================================

                    grade:
                        grade,

                    category:
                        carte?.category ||
                        j?.category ||
                        null,

                    vitesseMax:
                        vitesseMax,

                    //================================================
                    // ❤️ RESSOURCES ACTUELLES
                    //================================================

                    pv: 100,

                    stamina: 100,

                    energie: 100,

                    //================================================
                    // 🧍 ÉTAT PHYSIQUE ACTUEL
                    //================================================

                    posture:
                        "neutre",

                    equilibre:
                        "stable",

                    //================================================
                    // 📏 DISTANCE AVEC L'ADVERSAIRE
                    //================================================

                    distanceAdversaire:
                        null,

                    //================================================
                    // 🧭 POSITION RELATIVE
                    //
                    // face
                    // profil_gauche
                    // profil_droit
                    // avant_gauche
                    // avant_droit
                    // arriere
                    // arriere_gauche
                    // arriere_droit
                    //================================================

                    positionRelative:
                        "face",

                    //================================================
                    // 🔪 ARME
                    //================================================

                    weapon:
                        null,

                    //================================================
                    // ☠️ ÉTAT
                    //================================================

                    ko:
                        false
                };
            })
    };

    //================================================
    // 💾 ATTACHER LE TRACKER AU MATCH
    //================================================

    match.trackerCombatGemini =
        tracker;

    return tracker;
}


//================================================
// 👤 RÉCUPÉRER UN JOUEUR DU TRACKER
//================================================

function getJoueurTrackerCombatGemini(
    match,
    identifiant
) {

    const tracker =
        match?.trackerCombatGemini;

    if (
        !tracker ||
        !Array.isArray(tracker.joueurs)
    ) {

        return null;
    }

    return tracker.joueurs.find(j =>

        j?.jid === identifiant ||

        j?.nom === identifiant ||

        j?.personnage === identifiant

    ) || null;
}


//================================================
// ❤️ MODIFIER LES RESSOURCES
//================================================

function modifierRessourcesCombatGemini(
    match,
    identifiant,
    modifications = {}
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // ❤️ PV
    //================================================

    if (
        modifications.pv != null
    ) {

        joueur.pv =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.pv
                    )
                )
            );
    }

    //================================================
    // 🫀 STAMINA
    //================================================

    if (
        modifications.stamina != null
    ) {

        joueur.stamina =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.stamina
                    )
                )
            );
    }

    //================================================
    // 🌀 ÉNERGIE
    //================================================

    if (
        modifications.energie != null
    ) {

        joueur.energie =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        modifications.energie
                    )
                )
            );
    }

    //================================================
    // ☠️ KO AUTOMATIQUE
    //================================================

    if (
        joueur.pv <= 0
    ) {

        joueur.pv = 0;

        joueur.ko = true;
    }

    return joueur;
}


//================================================
// 🧍 MODIFIER L'ÉTAT PHYSIQUE
//================================================

function modifierEtatPhysiqueCombatGemini(
    match,
    identifiant,
    modifications = {}
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // 🧍 POSTURE
    //================================================

    if (
        modifications.posture != null
    ) {

        joueur.posture =
            String(
                modifications.posture
            ).trim();
    }

    //================================================
    // ⚖️ ÉQUILIBRE
    //================================================

    if (
        modifications.equilibre != null
    ) {

        joueur.equilibre =
            String(
                modifications.equilibre
            ).trim();
    }

    return joueur;
}


//================================================
// 📏 MODIFIER LA DISTANCE
//================================================

function modifierDistanceCombatGemini(
    match,
    identifiant,
    distance
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    const valeur =
        Number(distance);

    if (
        !Number.isFinite(valeur)
    ) {

        return joueur;
    }

    joueur.distanceAdversaire =
        Math.max(
            0,
            valeur
        );

    //================================================
    // 📏 LA DISTANCE EST COMMUNE
    //================================================

    const tracker =
        match?.trackerCombatGemini;

    if (
        tracker?.joueurs
    ) {

        for (
            const autre
            of tracker.joueurs
        ) {

            if (
                autre.jid !== joueur.jid
            ) {

                autre.distanceAdversaire =
                    joueur.distanceAdversaire;
            }
        }
    }

    return joueur;
}


//================================================
// 🧭 MODIFIER LA POSITION RELATIVE
//================================================

function modifierPositionRelativeCombatGemini(
    match,
    identifiant,
    position
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    const positionsValides = [

        "face",

        "profil_gauche",

        "profil_droit",

        "avant_gauche",

        "avant_droit",

        "arriere",

        "arriere_gauche",

        "arriere_droit"
    ];

    const nouvellePosition =
        String(
            position || ""
        )
            .toLowerCase()
            .trim();

    if (
        !positionsValides.includes(
            nouvellePosition
        )
    ) {

        return joueur;
    }

    joueur.positionRelative =
        nouvellePosition;

    return joueur;
}


//================================================
// 🔪 MODIFIER L'ARME
//================================================

function modifierWeaponCombatGemini(
    match,
    identifiant,
    weapon
) {

    const joueur =
        getJoueurTrackerCombatGemini(
            match,
            identifiant
        );

    if (!joueur) {
        return null;
    }

    //================================================
    // 🔪 RETIRER L'ARME
    //================================================

    if (
        weapon === null ||
        weapon === false ||
        weapon === ""
    ) {

        joueur.weapon = null;

        return joueur;
    }

    //================================================
    // 🔪 ARME SOUS FORME DE TEXTE
    //================================================

    if (
        typeof weapon === "string"
    ) {

        joueur.weapon = {

            active: true,

            nom:
                weapon.trim()
        };

        return joueur;
    }

    //================================================
    // 🔪 ARME SOUS FORME D'OBJET
    //================================================

    if (
        typeof weapon === "object"
    ) {

        joueur.weapon = {

            active:
                weapon.active !== false,

            nom:
                weapon.nom ||
                weapon.name ||
                null
        };
    }

    return joueur;
}


//================================================
// 🧠 APPLIQUER LES CONSÉQUENCES GEMINI
//================================================

function appliquerConsequencesCombatGemini(
    match,
    consequences = {}
) {

    if (
        !match?.trackerCombatGemini
    ) {

        return null;
    }

    const identifiant =
        consequences.jid ||
        consequences.personnage ||
        consequences.nom;

    if (!identifiant) {
        return null;
    }

    //================================================
    // ❤️ RESSOURCES
    //================================================

    modifierRessourcesCombatGemini(
        match,
        identifiant,
        {

            pv:
                consequences.pv,

            stamina:
                consequences.stamina,

            energie:
                consequences.energie
        }
    );

    //================================================
    // 🧍 ÉTAT PHYSIQUE
    //================================================

    modifierEtatPhysiqueCombatGemini(
        match,
        identifiant,
        {

            posture:
                consequences.posture,

            equilibre:
                consequences.equilibre
        }
    );

    //================================================
    // 📏 DISTANCE
    //================================================

    if (
        consequences.distanceAdversaire != null
    ) {

        modifierDistanceCombatGemini(
            match,
            identifiant,
            consequences.distanceAdversaire
        );
    }

    //================================================
    // 🧭 POSITION
    //================================================

    if (
        consequences.positionRelative
    ) {

        modifierPositionRelativeCombatGemini(
            match,
            identifiant,
            consequences.positionRelative
        );
    }

    //================================================
    // 🔪 ARME
    //================================================

    if (
        consequences.weapon !== undefined
    ) {

        modifierWeaponCombatGemini(
            match,
            identifiant,
            consequences.weapon
        );
    }

    return getJoueurTrackerCombatGemini(
        match,
        identifiant
    );
}

//-------- UTILITAIRES
const formatNumber = n => {
    try {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch {
        return n;
    }
};

const normalize = str =>
    String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

//================================================
// ⚡ VITESSE MAXIMALE SELON LE GRADE
//================================================

function obtenirVitesseMaxParGrade(grade) {

    const g =
        String(grade || "")
            .toLowerCase()
            .trim();

    switch (g) {

        case "bronze":
            return 6;

        case "argent":
            return 8;

        case "or":
            return 10;

        default:
            return null;
    }
}


//================================================
// ⚡ VITESSE EFFECTIVE DU PERSONNAGE
//================================================

function obtenirVitesseEffective(
    joueur,
    details = {}
) {

    //============================================
    // 🚫 Aucune vitesse maximale demandée
    //============================================

    if (details.vmax !== true) {

        // Vitesse numérique explicitement donnée
        if (
            typeof details.vmax === "number"
        ) {

            return details.vmax;
        }

        // Vitesse normale
        if (
            typeof details.vitesse === "number"
        ) {

            return details.vitesse;
        }

        return null;
    }


    //============================================
    // 🎴 RÉCUPÉRATION DU GRADE
    //============================================

    const grade =
        joueur?.grade ||
        joueur?.Grade ||
        joueur?.card?.grade ||
        joueur?.carte?.grade ||
        null;


    //============================================
    // ⚡ VMAX SELON LE GRADE
    //============================================

    const vitesse =
        obtenirVitesseMaxParGrade(
            grade
        );


    //============================================
    // 📋 DEBUG
    //============================================

    console.log(
        "⚡ VMAX PERSONNAGE :",
        joueur?.nom ||
        joueur?.name ||
        "Inconnu",
        "| Grade :",
        grade,
        "| Vitesse :",
        vitesse
            ? `${vitesse} m/s`
            : "INCONNUE"
    );


    return vitesse;
}

//================= UTILS =================
function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(0, Math.min(100, stats[stat] + val));
}

function clean(txt) {
    return txt.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function normalizeName(str = "") {
    return String(str)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "") // retire les drapeaux
        .replace(/[^\p{L}\p{N}]/gu, "")         // garde seulement lettres et chiffres
        .toLowerCase()
        .trim();
}
                                           
            
                    
//================================================
// 🔎 NORMALISATION
//================================================
function normaliserAction(texte = "") {

    return String(texte)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
        .toLowerCase()
        .replace(/[’']/g, " ")
        .replace(/[^\p{L}\p{N}°\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

//================================================
// 🎮 CONFIGURATION PAVÉ ALL STARS
//================================================

const MAX_ACTIONS_PAVE = 4;

const DUREE_ACTION_NORMALE = 1;   // 1 seconde
const DUREE_ACTION_COMBO = 0.5;   // 0.5 seconde


//================================================
// 📏⚔️ CONFIGURATION DISTANCES COMBAT ALL STARS
//================================================

// Distance initiale entre deux combattants
const DISTANCE_INITIALE_COMBAT = 5;

// Distance "close"
const DISTANCE_CLOSE = 0.5;

// Portée maximale des attaques
const PORTEE_MAIN = 0.5;
const PORTEE_PIED = 1.0;

// Tolérance pour éviter les erreurs de décimales
const TOLERANCE_DISTANCE = 0.01;

//================================================
// 🎮 ACTIONS MAP — ALL STARS
//================================================

const ACTIONS_MAP = {

    //================================================
    // 🥊 FRAPPES
    //================================================

    frapper: {

        //================================================
        // 👊 FRAPPES AVEC LES MAINS
        //================================================

        mains: {

            // 1 — COUP DIRECT
            coup_direct: {
                aliases: [
                    "coup direct",
                    "direct",
                    "coup de poing direct",
                    "poing direct",
                    "jab",
                    "straight"
                ],
                type: "poing",
                trajectoire: "directe",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 2 — CROCHET GAUCHE
            crochet_gauche: {
                aliases: [
                    "crochet gauche",
                    "left hook",
                    "hook gauche"
                ],
                type: "poing",
                main: "gauche",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 3 — CROCHET DROIT
            crochet_droit: {
                aliases: [
                    "crochet droit",
                    "right hook",
                    "hook droit"
                ],
                type: "poing",
                main: "droite",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 4 — UPPERCUT
            uppercut: {
                aliases: [
                    "uppercut",
                    "coup de poing remontant"
                ],
                type: "poing",
                trajectoire: "montante",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 5 — UPPERCUT SAUTÉ
            uppercut_saute: {
                aliases: [
                    "uppercut sauté",
                    "rising uppercut",
                    "uppercut en sautant"
                ],
                type: "poing",
                trajectoire: "montante",
                mouvement: "saut",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 6 — COUP EN REVERS
            backfist: {
                aliases: [
                    "coup en revers",
                    "backfist",
                    "revers"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 7 — REVERS CIRCULAIRE
            spinning_backfist: {
                aliases: [
                    "revers circulaire",
                    "spinning backfist",
                    "spinning back fist"
                ],
                type: "poing",
                trajectoire: "circulaire",
                rotation: [
                    "180",
                    "360"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 8 — MARTEAU DESCENDANT
            hammer_descendant: {
                aliases: [
                    "coup marteau descendant",
                    "marteau descendant",
                    "hammer",
                    "hammer fist",
                    "hammer descendant"
                ],
                type: "poing",
                trajectoire: "descendante",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 9 — MARTEAU LATÉRAL
            hammer_lateral: {
                aliases: [
                    "coup marteau latéral",
                    "marteau latéral",
                    "hammer fist side",
                    "side hammer"
                ],
                type: "poing",
                trajectoire: "latérale",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 10 — MARTEAU EN REVERS
            reverse_hammer: {
                aliases: [
                    "coup marteau en revers",
                    "marteau en revers",
                    "reverse hammer",
                    "reverse hammer fist"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
                ]
            }
        },


        //================================================
        // 🦵 FRAPPES AVEC LES PIEDS
        //================================================

        pieds: {

            // 1 — FRONT KICK
            front_kick: {
                aliases: [
                    "front kick",
                    "coup de pied frontal",
                    "coup de pied direct",
                    "coup de pied avant"
                ],
                type: "pied",
                trajectoire: "directe",
                surface: [
                    "semelle",
                    "plante du pied"
                ]
            },

            // 2 — ROUNDHOUSE KICK
            roundhouse_kick: {
                aliases: [
                    "roundhouse kick",
                    "coup circulaire",
                    "coup de pied circulaire"
                ],
                type: "pied",
                trajectoire: "circulaire",
                surface: [
                    "cou-de-pied",
                    "tibia"
                ]
            },

            // 3 — SIDE KICK
            side_kick: {
                aliases: [
                    "side kick",
                    "coup de pied latéral"
                ],
                type: "pied",
                trajectoire: "latérale",
                surface: [
                    "tranchant du pied",
                    "talon"
                ]
            },

            // 4 — BACK KICK
            back_kick: {
                aliases: [
                    "back kick",
                    "coup de pied arrière"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: true,
                surface: [
                    "talon"
                ]
            },

            // 5 — HOOK KICK
            hook_kick: {
                aliases: [
                    "hook kick",
                    "coup de pied en crochet"
                ],
                type: "pied",
                trajectoire: "crochet",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 6 — AXE KICK
            axe_kick: {
                aliases: [
                    "axe kick",
                    "coup de pied descendant",
                    "coup de pied en axe"
                ],
                type: "pied",
                trajectoire: "descendante",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 7 — SPINNING BACK KICK
            spinning_back_kick: {
                aliases: [
                    "spinning back kick",
                    "coup de pied arrière circulaire"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: "360",
                surface: [
                    "talon"
                ]
            },

            // 8 — LOW KICK
            low_kick: {
                aliases: [
                    "low kick",
                    "coup bas",
                    "coup de pied bas"
                ],
                type: "pied",
                trajectoire: "latérale",
                cible: [
                    "cuisse",
                    "mollet"
                ],
                surface: [
                    "tibia",
                    "cou-de-pied"
                ]
            },

            // 9 — KNEE STRIKE
            knee_strike: {
                aliases: [
                    "knee strike",
                    "coup de genou",
                    "coup genou",
                    "genou"
                ],
                type: "genou",
                trajectoire: "montante",
                surface: [
                    "genou"
                ]
            },

            // 10 — FLYING KICK
            flying_kick: {
                aliases: [
                    "flying kick",
                    "coup sauté",
                    "coup de pied sauté"
                ],
                type: "pied",
                mouvement: "saut",
                trajectoire: [
                    "directe",
                    "latérale"
                ],
                surface: [
                    "pied",
                    "talon"
                ]
            }
        }
    },


    //================================================
    // 🏃 DÉPLACEMENTS
    //================================================

    deplacer: {

        avancer: [
            "avance",
            "avancer",
            "avance vers",
            "fonce vers",
            "se rapproche",
            "approche"
        ],

        reculer: [
            "recule",
            "reculer",
            "se recule",
            "prend du recul"
        ],

        gauche: [
            "va à gauche",
            "se déplace à gauche",
            "déplacement gauche"
        ],

        droite: [
            "va à droite",
            "se déplace à droite",
            "déplacement droite"
        ],

        dash: [
            "dash",
            "dash avant",
            "dash arrière",
            "dash gauche",
            "dash droit"
        ],

        course: [
            "court",
            "course",
            "fonce",
            "sprint"
        ],

        vmax: [
            "vmax",
            "à vitesse maximale",
            "vitesse maximale",
            "à pleine vitesse"
        ],

        deplacement_instantane: [
            "déplacement instantané",
            "instantané",
            "téléportation"
        ],

        saut: [
            "saute",
            "saut",
            "bond"
        ],

        bond: [
            "bondit",
            "bond",
            "bond en avant",
            "bond en arrière"
        ]
    },


    //================================================
    // 🛡️ BLOCAGES
    //================================================

    bloquer: {

        blocage: [
            "bloque",
            "blocage",
            "bloquer",
            "pare",
            "parer"
        ],

        blocage_main: [
            "bloque avec la main",
            "blocage à une main",
            "pare avec la main"
        ],

        blocage_deux_mains: [
            "bloque à deux mains",
            "blocage deux mains",
            "pare à deux mains"
        ],

        garde_haute: [
            "garde haute",
            "bloque en garde haute"
        ],

        garde_basse: [
            "garde basse",
            "bloque en garde basse"
        ],

        garde_corps: [
            "protège son corps",
            "garde du corps",
            "bloque le corps"
        ],

        garde_visage: [
            "protège son visage",
            "garde du visage",
            "bloque le visage"
        ]
    },


    //================================================
    // 🌀 ESQUIVES
    //================================================

    esquiver: {

        esquive: [
            "esquive",
            "esquiver",
            "évite",
            "éviter"
        ],

        esquive_gauche: [
            "esquive à gauche",
            "évite à gauche"
        ],

        esquive_droite: [
            "esquive à droite",
            "évite à droite"
        ],

        esquive_arriere: [
            "esquive en arrière",
            "recule pour esquiver"
        ],

        esquive_avant: [
            "esquive vers l'avant"
        ],

        esquive_basse: [
            "se baisse",
            "esquive basse",
            "duck"
        ],

        esquive_laterale: [
            "esquive latérale",
            "déplacement latéral pour esquiver"
        ],

        esquive_vmax: [
            "esquive à vmax",
            "esquive à vitesse maximale"
        ]
    },


    //================================================
    // ✋ SAISIES / GRAPPLES
    //================================================

    saisir: {

        saisie: [
            "saisit",
            "saisie",
            "attrape",
            "agrippe",
            "empoigne"
        ],

        saisir_bras: [
            "saisit le bras",
            "attrape le bras",
            "agrippe le bras"
        ],

        saisir_jambe: [
            "saisit la jambe",
            "attrape la jambe",
            "agrippe la jambe"
        ],

        saisir_corps: [
            "saisit le corps",
            "attrape le corps",
            "agrippe le corps"
        ],

        saisir_coup: [
            "saisit le coup",
            "attrape le coup",
            "saisit l'attaque"
        ]
    },


    //================================================
    // ↪️ DÉVIATIONS
    //================================================

    devier: {

        deviation: [
            "dévie",
            "dévier",
            "déviation",
            "dévie le coup"
        ],

        deviation_main: [
            "dévie avec la main",
            "dévie le coup avec la main"
        ],

        deviation_bras: [
            "dévie avec le bras",
            "dévie avec l'avant-bras"
        ],

        deviation_jambe: [
            "dévie avec la jambe",
            "dévie le coup avec la jambe"
        ]
    },


    //================================================
    // 🔄 CHANGEMENTS DE TRAJECTOIRE
    //================================================

    modifier_trajectoire: {

        changer_trajectoire: [
            "change la trajectoire",
            "modifie la trajectoire",
            "change la direction du coup"
        ],

        rediriger: [
            "redirige le coup",
            "redirige son attaque",
            "redirige l'attaque"
        ]
    },


    //================================================
    // ⚡ ACTIONS DE VITESSE
    //================================================

    vitesse: {

        acceleration: [
            "accélère",
            "accélération",
            "accélère sa course"
        ],

        boost: [
            "boost",
            "booste",
            "mouvement boosté",
            "se booste"
        ],

        vitesse_reduite: [
            "vitesse réduite",
            "avance lentement"
        ]
    },


    //================================================
    // 👁️ SENSORIALITÉ / RECHERCHE
    //================================================

    rechercher: {

        regarder: [
            "regarde autour",
            "regarde autour de lui",
            "observe autour"
        ],

        localiser: [
            "localise",
            "cherche l'adversaire",
            "recherche l'adversaire",
            "tente de localiser"
        ],

        detection: [
            "détecte",
            "détecte l'adversaire",
            "ressent sa présence"
        ]
    },


    //================================================
    // 💥 PROJECTIONS
    //================================================

    projeter: {

        projection: [
            "projette",
            "projection",
            "envoie valser",
            "jette"
        ],

        repousser: [
            "repousse",
            "repousser",
            "fait reculer"
        ],

        envoyer_sol: [
            "projette au sol",
            "envoie au sol",
            "écrase au sol"
        ],

        envoyer_mur: [
            "projette contre un mur",
            "envoie contre un mur",
            "projette contre un bâtiment"
        ]
    },


    //================================================
    // 🗡️ PROJECTILES
    //================================================

    lancer: {

        projectile: [
            "lance",
            "lancer",
            "projectile",
            "projette un projectile"
        ],

        shuriken: [
            "shuriken",
            "lance un shuriken"
        ],

        kunai: [
            "kunai",
            "lance un kunai"
        ],

        couteau: [
            "couteau",
            "lance un couteau"
        ]
    },


    //================================================
    // 🔋 ÉNERGIE / RÉCUPÉRATION
    //================================================

    energie: {

        charger: [
            "charge son énergie",
            "accumule son énergie"
        ],

        recuperer: [
            "récupère",
            "récupère son énergie",
            "récupère sa stamina"
        ],

        degager_energie: [
            "dégage son énergie",
            "libère son énergie"
        ]
    }
};


//================================================
// 🤖 RÈGLES ARBITRE GEMINI
//================================================
const GEMINI_RULES_PROMPT = `
TU ES L'ARBITRE OFFICIEL D'UN SYSTÈME DE COMBAT DYNAMIQUE.

Ton rôle est UNIQUEMENT de parcourir et appliquer les règles ci-dessous
lorsque tu analyses un pavé de combat.

Tu ne dois pas inventer de règles.
Tu ne dois pas modifier les règles.
Tu ne dois pas ajouter de capacités qui ne sont pas indiquées.
Tu dois considérer ces règles comme les règles officielles du système.


============================================================
0. MATCH🎮
============================================================

- Dès le début du match la distance initiale entre les deux personnages est de 5 mètres.
- Le match se termine après 10 tours maximum.
- Un tour est terminé lorsque les deux joueurs ont envoyé leurs pavés et que le verdict du second pavé a été rendu.


============================================================
0-B. TOURS ET FIN DU MATCH
============================================================

DÉFINITION D'UN TOUR :

Un TOUR est terminé uniquement lorsque :

1. le premier joueur a envoyé son pavé ;
2. le deuxième joueur a envoyé son pavé ;
3. les deux pavés ont été analysés ;
4. le verdict de l'échange peut être établi.

IMPORTANT :

Un seul pavé NE constitue PAS un tour complet.

Le compteur de tours ne doit donc PAS augmenter après
le premier pavé d'un joueur.

Exemple :

Pavé de Neo
→ le tour reste en attente du pavé de Damian.

Pavé de Damian
→ les deux joueurs ont joué.
→ les deux pavés sont analysés.
→ le verdict de l'échange est établi.
→ TOUR +1.

============================================================
EXEMPLE DE COMPTEUR
============================================================

Neo pavé + Damian pavé
→ TOUR 1

Neo pavé + Damian pavé
→ TOUR 2

Neo pavé + Damian pavé
→ TOUR 3

Neo pavé + Damian pavé
→ TOUR 4

Neo pavé + Damian pavé
→ TOUR 5

Neo pavé + Damian pavé
→ TOUR 6

Neo pavé + Damian pavé
→ TOUR 7

Neo pavé + Damian pavé
→ TOUR 8

Neo pavé + Damian pavé
→ TOUR 9

Neo pavé + Damian pavé
→ TOUR 10

Après le verdict du TOUR 10 :
→ le match se termine immédiatement.

Aucun TOUR 11 ne peut commencer.

============================================================
KO AVANT LA FIN DES 10 TOURS
============================================================

Si un joueur atteint 0% PV :

- il est immédiatement considéré comme KO ;
- le match se termine ;
- l'autre joueur est déclaré vainqueur par KO ;
- aucun tour supplémentaire ne doit être joué.

============================================================
DÉCISION APRÈS 10 TOURS
============================================================

Si le TOUR 10 est terminé et qu'aucun joueur n'est à 0% PV :

→ le match se termine par DÉCISION.

Le vainqueur est le joueur qui a globalement
le mieux combattu et dominé l'ensemble du combat.

La décision doit prendre en compte :

- les dégâts infligés ;
- les dégâts reçus ;
- les attaques réussies ;
- les défenses réussies ;
- les esquives réussies ;
- les contres réussis ;
- les actions ayant réellement mis l'adversaire en difficulté ;
- la domination des échanges ;
- la qualité des actions ;
- l'efficacité générale ;
- la régularité sur les 10 tours.

Le joueur ayant simplement le plus de PV restants
ne gagne PAS automatiquement.

La décision doit déterminer quel joueur a réellement
dominé l'ensemble du combat.

Si les deux joueurs sont impossibles à départager
objectivement :

→ résultat : ÉGALITÉ.

============================================================
RÈGLE ABSOLUE
============================================================

Le compteur de tours fonctionne ainsi :

PREMIER PAVÉ
→ attente du deuxième pavé
→ DEUXIÈME PAVÉ
→ ANALYSE DES DEUX
→ VERDICT
→ TOUR +1

Le compteur ne doit jamais augmenter après un seul pavé.

Après TOUR = 10 :
→ FIN DU MATCH.

Si aucun KO :
→ DÉCISION.

Si KO :
→ VICTOIRE PAR KO.

============================================================
1. STRUCTURE D'UN PAVÉ🎮
============================================================

- Un pavé peut contenir au maximum 4 ACTIONS issues de ACTIONS MAP.
- Une action se réalise en 1 seconde.
- Chaque action distincte doit être comptée séparément.
- Une action composée de plusieurs mouvements distincts doit être décomposée en plusieurs actions.
- Si un attaquant effectue plusieurs actions et que le défenseur échoue à défendre une action intermédiaire, les actions suivantes doivent être réévaluées selon les conséquences de l'action précédente.
- Une action suivante n'est jamais automatiquement annulée uniquement parce qu'une action précédente a échoué.
- Elle doit être analysée avec le nouvel état du personnage.

ZONE DE SENSORIALITÉ :

- Chaque personnage possède une zone de sensorialité de 1 mètre autour de lui.
- Cette zone permet de ressentir les coups et la présence d'un adversaire.
- Le joueur peut simplement mentionner "ZS" ou "Zone de sensorialité" dans son pavé.

RÈGLE VMAX :

Lorsqu'un joueur indique :

- "VMAX"
- "vitesse maximale"
- "à vitesse maximale"
- "en course VMAX"
- ou toute formulation équivalente,

la vitesse maximale doit être récupérée automatiquement depuis le grade
du personnage présent dans le contexte du match.

CORRESPONDANCE :

- Bronze = 6 m/s
- Argent / Silver = 8 m/s
- Or / Gold = 10 m/s

IMPORTANT :

- Le joueur n'a PAS besoin d'écrire la valeur exacte en m/s.
- Si le joueur écrit simplement "VMAX" et que le grade du personnage est connu dans le contexte du match, la vitesse est considérée comme suffisamment précisée.
- Gemini doit récupérer la valeur correspondante au grade depuis le contexte du match.
- Gemini ne doit PAS refuser un pavé uniquement parce que la valeur "6 m/s", "8 m/s" ou "10 m/s" n'est pas écrite.
- Si le grade du personnage est inconnu et que le pavé utilise VMAX, alors la vitesse maximale ne peut pas être déterminée et l'information doit être signalée comme manquante.

IMPORTANT :

- Si aucun terme VMAX ou équivalent n'est utilisé, le déplacement est considéré comme effectué à vitesse réduite de 1 m/s.
- Cela concerne notamment les déplacements, esquives et mouvements de repositionnement lorsque leur vitesse n'est pas spécifiée.
- VMAX ne doit donc être refusée que si le grade nécessaire pour déterminer sa valeur est inconnu.

DÉFENSE :

- Celui qui défend doit toujours commencer par préciser à quoi il réagit avant de mentionner ses actions.
- Exemple :
  "Voyant le coup venir vers son visage, Tobirama place sa paume gauche en opposition."


============================================================
2. VITESSE DE DÉPLACEMENT
============================================================

La Travel Speed représente la vitesse de déplacement du personnage.

GRADES :

- Bronze : 6 m/s.
- Silver / Argent : 8 m/s.
- Gold / Or : 10 m/s.

Le powerscaling réduit peut modifier la vitesse selon les règles du personnage.

Si VMAX est utilisée :
- récupérer automatiquement la vitesse correspondant au grade du personnage.

Ne jamais exiger que le joueur écrive lui-même la valeur numérique de la VMAX.


============================================================
3. COMBAT SPEED
============================================================

La note S représente la Combat Speed, c'est-à-dire la vitesse de réaction en combat rapproché.

Si la Combat Speed est INFÉRIEURE à celle de l'adversaire :
- retard de 1 seconde ;
- le personnage peut uniquement bloquer ou esquiver les coups.

Si la Combat Speed est ÉGALE :
- retard de 0,5 seconde ;
- le personnage peut désormais dévier et saisir les coups.

Si la Combat Speed est SUPÉRIEURE de +1 :
- aucun retard ;
- le personnage peut réagir au même moment que l'adversaire.

Si la Combat Speed est SUPÉRIEURE de +2 :
- saisir ne coûte plus de Stamina ;
- esquiver coûte 5% de Stamina.

Les personnages SS peuvent combattre tous les tiers S sans retard
et sont donc toujours considérés comme supérieurs de +2.


============================================================
4. DÉPLACEMENTS INSTANTANÉS
============================================================

Les déplacements instantanés coûtent 10% de Stamina ou d'énergie
selon le personnage.

Après avoir utilisé un déplacement instantané :

- le personnage prend l'adversaire de vitesse avec un effet de surprise ;
- un adversaire de vitesse égale ou inférieure ne peut que réagir aux actions venant après le déplacement ;
- il peut uniquement esquiver ou bloquer ;
- il ne peut pas saisir le coup ;
- il peut cependant bloquer, dévier et esquiver.


============================================================
5. ZONE D'EFFET DES ATTAQUES
============================================================

La zone d'effet de vitesse d'une attaque frontale est de 5 mètres.

Si une attaque est lancée depuis cette distance :

- l'esquive coûte 20% de Stamina si le personnage n'est pas plus rapide que l'attaque ;
- normalement, une esquive coûte 10% de Stamina.

Exception :

- les déplacements instantanés ne suivent pas cette règle.


============================================================
6. TEMPS D'UNE ATTAQUE
============================================================

Une attaque est lancée en 1 seconde.

Elle nécessite :

- 0,5 seconde de préparation ;
- 0,5 seconde de lancement.

Une attaque ne peut pas être lancée en combo pendant sa préparation.


============================================================
7. PRÉPARATION D'UNE ATTAQUE
============================================================

Maintenir la préparation d'une attaque coûte 20% d'énergie.

Les attaques à effet maintenu, comme les barrières, durent au maximum 2 tours.

Une attaque d'énergie peut être lancée en projectile pour 5% d'énergie.

La vitesse de ce projectile est de 6 m/s.

Un personnage peut également récupérer son énergie :

- en dégageant son énergie ;
- ou en restant debout sans effectuer d'action.

Cette récupération rapporte 20% d'énergie en 1 séquence.


============================================================
8. VITESSE DES ATTAQUES
============================================================

Les attaques BASIC ont une vitesse de 6 m/s.

Coût :

- 20% d'énergie ;
- 50% des PV en dégâts selon les règles indiquées.

Les attaques ADVANCED ont une vitesse de 8 m/s.

Coût :

- 30% d'énergie ;
- 70% des PV en dégâts.

Les attaques ULTIME ont une vitesse de 10 m/s.

Coût :

- 50% d'énergie ;
- peuvent causer jusqu'à 100% de dégâts aux PV.

Certaines attaques peuvent causer des dégâts mortels selon leur nature.

Exemple :

- une attaque tranchante placée dans une zone critique peut provoquer la mort même si elle est classée comme attaque basique.


============================================================
9. PROJECTILES
============================================================

Selon l'univers, un personnage peut posséder jusqu'à 3 projectiles maximum.

Exemples :

- shuriken ;
- kunai.

Les explosifs, fils, etc. ne sont pas automatiquement considérés comme des projectiles autorisés.

Certains personnages possédant des couteaux peuvent lancer jusqu'à 3 projectiles.

La vitesse d'un projectile est de 5 m/s.

Un projectile cause 20% de dégâts aux PV selon la zone touchée.


============================================================
10. DÉGÂTS DES COUPS
============================================================

Les dégâts des coups sont de 10% des PV.

Un membre BRISÉ représente 15% des PV.

Un membre COUPÉ représente 30% des PV.

Pour sonner un adversaire :

- la force du personnage doit être supérieure à celle de l'adversaire ;
- il faut réussir à placer 2 coups consécutifs au visage.

Une fois sonné :

- l'adversaire est bloqué.

Pour sortir de cet état :

- il doit effectuer un mouvement BOOSTÉ ;
- ce mouvement coûte 30% de Stamina.


============================================================
11. BRISER UN MEMBRE
============================================================

Pour briser un membre avec un seul coup :

- la force de l'attaquant doit être supérieure à celle de l'adversaire.

Alternative :

- frapper deux fois de suite exactement au même endroit.

Si l'écart de force est de +2 ou plus :

- il n'est pas possible de briser le membre avec un seul coup.


============================================================
12. FORCE PHYSIQUE
============================================================

La Force représente :

- la force physique ;
- la résistance ;
- la capacité à encaisser ou repousser les attaques.

Si la Force est INFÉRIEURE de -1 :

- le personnage peut être repoussé par un coup ou une main ;
- il peut perdre sa posture.

Si la Force est INFÉRIEURE de -2 :

- bloquer à une main peut faire perdre l'équilibre ;
- bloquer à deux mains peut casser la posture.

Si la Force est INFÉRIEURE de -3 :

- il devient impossible de résister à certaines attaques ;
- le personnage peut être projeté.

Si la Force est SUPÉRIEURE de +2 :

- les dégâts des coups et projections sont augmentés ;
- les déplacements peuvent être réduits de moitié ;
- le personnage peut être projeté jusqu'à 10 m maximum.

Les personnages ayant une Force de 3 ou plus peuvent :

- soulever ou bloquer certaines parties de bâtiments ;
- projeter un adversaire jusqu'à 20 m maximum ;
- transpercer le corps d'un adversaire ayant une Force inférieure de 3.

Les bonds de 10 m sont possibles selon les niveaux de Force.

Un personnage ayant une Force de 3 ou plus peut effectuer des bonds de 20 m maximum.


============================================================
13. COLLISION ENTRE ATTAQUES
============================================================

La puissance d'attaque détermine le résultat lorsqu'une attaque rencontre une autre attaque.

Lorsque deux attaques entrent en collision :

- leur nature d'énergie doit être prise en compte.

Si l'écart de puissance est de 1 :

- une explosion se produit ;
- le personnage inférieur encaisse la moitié des dégâts.

Si l'écart est de 2 ou plus :

- l'attaque du personnage inférieur est complètement submergée ;
- il encaisse les dégâts.


//================================================
// 🛡️ 13-B. DÉFENSE, CONTRE ET CONSÉQUENCES
//================================================

Lorsqu'un pavé défensif est analysé :

1. Identifier chaque attaque adverse à laquelle le défenseur réagit.
2. Identifier chaque action défensive.
3. Vérifier que l'action défensive correspond à l'attaque.
4. Vérifier la zone protégée.
5. Vérifier le membre utilisé.
6. Vérifier la posture.
7. Vérifier la distance.
8. Vérifier la Combat Speed.
9. Vérifier la Force lorsque nécessaire.
10. Appliquer immédiatement les conséquences de chaque action avant d'analyser la suivante.

Une défense peut produire trois résultats :

1. DÉFENSE RÉUSSIE
2. DÉFENSE PARTIELLE
3. MAUVAIS CONTRE


------------------------------------------------------------
DÉFENSE RÉUSSIE
------------------------------------------------------------

Une défense est réussie lorsque toutes les conditions nécessaires
pour bloquer, dévier, saisir ou esquiver l'attaque sont respectées.

Dans ce cas :

- l'attaque défendue ne cause pas ses dégâts normaux ;
- l'action défensive est validée ;
- aucune conséquence négative ne doit être inventée ;
- les actions défensives suivantes peuvent être exécutées normalement.

Une petite conséquence narrative peut être ajoutée uniquement
si elle découle directement de l'action décrite.

Exemple :

"Tobirama bloque le coup de poing au visage avec sa paume gauche."

Si les conditions sont respectées :

- le coup ne cause aucun dégât ;
- le bloc est réussi ;
- Tobirama peut poursuivre normalement son pavé.


------------------------------------------------------------
DÉFENSE PARTIELLE
------------------------------------------------------------

Une défense partielle signifie que la défense fonctionne
mais ne neutralise pas totalement l'attaque.

Une défense partielle peut :

- amortir le coup ;
- détourner partiellement le coup ;
- réduire les dégâts ;
- provoquer un recul ;
- provoquer un déséquilibre ;
- modifier la posture ;
- ouvrir une garde ;
- déplacer un membre ;
- forcer un déplacement.

IMPORTANT :

La conséquence d'une défense partielle doit être appliquée
AVANT d'analyser l'action défensive suivante.

Exemple :

Tobirama bloque partiellement un premier coup avec son bras gauche.

Le choc provoque un déséquilibre et ouvre sa garde abdominale.

Tobirama tente ensuite de bloquer un coup de pied visant l'abdomen.

Si sa nouvelle posture ne lui permet plus de réaliser correctement
le deuxième bloc :

- le deuxième bloc échoue ;
- le coup de pied peut atteindre l'abdomen ;
- les dégâts sont appliqués ;
- les conséquences physiques du coup sont appliquées.

Une défense partielle ne doit donc jamais être considérée
comme une défense totalement réussie.


------------------------------------------------------------
MAUVAIS CONTRE
------------------------------------------------------------

Un mauvais contre signifie que l'action défensive est incorrecte,
insuffisante ou impossible.

Exemples :

- mauvaise zone protégée ;
- mauvais membre utilisé ;
- réaction trop tardive ;
- posture incompatible ;
- vitesse insuffisante ;
- force insuffisante ;
- distance incompatible ;
- membre déjà indisponible ;
- conséquence d'une action précédente empêchant l'action ;
- défense incompatible avec la trajectoire de l'attaque.

Lorsqu'une défense échoue :

- l'attaque correspondante peut toucher ;
- les dégâts sont appliqués conformément aux règles ;
- les conséquences physiques sont appliquées ;
- l'état du personnage est mis à jour ;
- les actions suivantes sont réévaluées avec ce nouvel état.


------------------------------------------------------------
CONSÉQUENCES DES DÉFENSES RATÉES
------------------------------------------------------------

Une défense ratée ne signifie PAS automatiquement
que toutes les actions suivantes sont annulées.

Chaque action suivante doit être analysée séparément.

Une conséquence peut modifier :

- la position ;
- la posture ;
- l'équilibre ;
- la garde ;
- la disponibilité d'un membre ;
- la direction du corps ;
- la distance avec l'adversaire ;
- la capacité à défendre ;
- la possibilité d'effectuer l'action suivante.

Exemples :

- déséquilibre ;
- recul ;
- posture abaissée ;
- posture ouverte ;
- bras déplacé ;
- garde ouverte ;
- personnage repoussé ;
- personnage projeté ;
- déplacement forcé.

Ne jamais inventer une conséquence qui n'est pas justifiée
par les règles, le contexte ou les actions présentes dans le pavé.


------------------------------------------------------------
SIMULATION CHRONOLOGIQUE DES DÉFENSES
------------------------------------------------------------

Pour un pavé contenant plusieurs défenses :

1. analyser la première défense ;
2. déterminer son résultat ;
3. appliquer immédiatement les dégâts éventuels ;
4. appliquer immédiatement les conséquences physiques ;
5. modifier l'état du personnage ;
6. analyser la deuxième défense avec le nouvel état ;
7. appliquer ses conséquences ;
8. continuer jusqu'à la fin du pavé.

L'état du personnage doit donc évoluer après chaque action.

Une défense réussie ne modifie pas inutilement l'état.

Une défense partielle peut modifier l'état.

Une défense ratée peut modifier fortement l'état.

Les actions suivantes doivent toujours être analysées
en fonction de l'état résultant des actions précédentes.


============================================================
14. STAMINA ET CHANGEMENT DE TRAJECTOIRE
============================================================

Les esquives à VMAX précisée coûtent 10% de Stamina.

Les dashs coûtent 10% de Stamina.

Saisir un coup coûte 5% de Stamina.

============================================================
CHANGEMENT DE TRAJECTOIRE D'UNE ATTAQUE
============================================================

Lorsqu'un personnage lance une frappe et que l'adversaire
effectue une tentative de blocage ou de contre, l'attaquant
peut modifier la trajectoire de sa frappe afin d'adapter
son attaque à la réaction adverse.

Modifier la trajectoire d'une frappe déjà engagée coûte :

→ -5% de Stamina.

Cette modification de trajectoire ne constitue PAS une
nouvelle attaque.

============================================================
LIMITATION APRÈS MODIFICATION DE TRAJECTOIRE
============================================================

Après avoir modifié une fois la trajectoire de sa frappe :

- cette même frappe ne peut plus modifier une nouvelle fois
  sa trajectoire ;

- le membre utilisé pour cette frappe reste engagé dans
  l'action en cours ;

- ce membre ne peut pas être immédiatement utilisé pour
  effectuer un bloc ;

- le personnage ne peut pas interrompre instantanément
  cette frappe pour utiliser le même membre afin de bloquer
  une nouvelle attaque ;

- une deuxième modification de trajectoire est INTERDITE.

Cette limitation concerne le membre et l'action engagés,
et non l'ensemble du personnage.

============================================================
CONTRE-ATTAQUE APRÈS UNE MODIFICATION DE TRAJECTOIRE
============================================================

Si l'adversaire contre-attaque pendant que le personnage
vient de modifier la trajectoire de sa frappe :

- le personnage ne peut plus utiliser le membre engagé
  dans sa frappe pour bloquer ;

- il ne peut plus modifier une deuxième fois la trajectoire
  de cette même frappe ;

- il ne peut pas interrompre instantanément sa frappe pour
  effectuer un blocage avec le membre engagé ;

- pour éviter la contre-attaque, sa défense possible est
  une ESQUIVE PAR DÉPLACEMENT ;

- cette esquive doit être réalisée en déplaçant le corps
  hors de la trajectoire de l'attaque adverse ;

- si aucune esquive par déplacement n'est possible selon
  la situation, l'attaque adverse peut atteindre sa cible.

============================================================
BLOCAGE IMPOSSIBLE AVEC LE MEMBRE ENGAGÉ
============================================================

Si le personnage tente malgré tout d'utiliser le membre
encore engagé dans sa frappe pour bloquer la contre-attaque :

→ le bloc est considéré comme un MAUVAIS CONTRE (MC).

La raison est que le personnage ne peut pas arrêter
instantanément une frappe déjà engagée afin de transformer
le même membre en défense contre une attaque déjà en cours.

Cette tentative provoque un retard de 2 actions,
soit 2 secondes, pour effectuer correctement le blocage.

L'attaque adverse peut donc atteindre sa cible.

============================================================
RÈGLE ABSOLUE
============================================================

Après une modification de trajectoire :

→ coût : -5% Stamina ;
→ aucune deuxième modification de trajectoire ;
→ le membre utilisé reste engagé dans la frappe ;
→ ce membre ne peut pas immédiatement servir à bloquer ;
→ en cas de contre-attaque adverse, la défense possible
  est une ESQUIVE PAR DÉPLACEMENT ;
→ tenter de bloquer avec le membre engagé = MAUVAIS CONTRE ;
→ ce mauvais contre entraîne un retard de 2 actions / 2 secondes.

============================================================
RÈGLE ABSOLUE
============================================================

Une même frappe peut modifier sa trajectoire UNE SEULE FOIS.

Modification de trajectoire :
→ -5% Stamina.

Après cette modification :
→ aucune deuxième modification ;
→ le membre utilisé reste engagé ;
→ ce membre ne peut pas servir immédiatement à bloquer ;
→ en cas de contre-attaque, l'esquive devient la défense
   possible avec une partie du corps disponible ;
→ tenter de bloquer avec le membre engagé constitue
   un MAUVAIS CONTRE et provoque un retard de 2 actions
   / 2 secondes.

============================================================
15. DÉPLACEMENTS BOOSTÉS
============================================================

Un mouvement boosté peut être nécessaire pour :

- sortir d'un état sonné ;
- augmenter temporairement les performances du personnage selon les règles.

Le coût indiqué pour sortir d'un état sonné est de 30% de Stamina.


============================================================
16. DESTRUCTION DE L'ARÈNE
============================================================

Les personnages peuvent provoquer des destructions sur l'arène.

Ils peuvent envoyer leur adversaire :

- contre des bâtiments ;
- contre le sol ;
- contre différents éléments du décor.

Les dégâts de destruction sont de 10% des PV.

Un personnage peut récupérer 20% de Stamina en restant 1 séquence
complète sans effectuer la moindre action.

Niveaux de destruction :

SUPER < MEGA < ULTRA < EXTREME < ULTIMATE


============================================================
17. RÈGLE DE LECTURE DU PAVÉ
============================================================

Lorsqu'un pavé est analysé :

1. Identifier toutes les actions réalisées.
2. Respecter l'ordre chronologique.
3. Ne jamais considérer deux actions comme une seule si elles sont réellement distinctes.
4. Vérifier que le nombre total d'actions ne dépasse pas 4.
5. Vérifier que chaque séquence ne dépasse pas 2 actions.
6. Les séparateurs "/" et "|" peuvent être utilisés pour séparer les séquences.
7. L'absence de "/" ou "|" ne rend PAS automatiquement le pavé invalide si les actions peuvent être identifiées clairement dans leur ordre chronologique.
8. Vérifier les vitesses utilisées.
9. Si VMAX est utilisée, récupérer sa valeur depuis le grade du personnage dans le contexte.
10. Ne jamais demander au joueur d'écrire la valeur numérique de VMAX lorsque le grade est connu.
11. Vérifier les distances parcourues.
12. Vérifier les coûts de Stamina ou d'énergie.
13. Vérifier les conditions nécessaires à chaque action.
14. Vérifier les rapports de Force, Combat Speed et Travel Speed lorsque cela est nécessaire.
15. Vérifier si une attaque peut réellement toucher, être bloquée, déviée, esquivée ou saisie.
16. Pour les défenses successives, appliquer les conséquences de chaque défense avant d'analyser la suivante.
17. Vérifier les conséquences des coups selon la zone touchée.
18. Vérifier les règles de combo.
19. Ne jamais inventer une information absente du pavé ou du contexte.


============================================================
18. RÈGLE ABSOLUE DE L'ARBITRE
============================================================

Tu ne dois pas décider selon ce qui semble logique dans un anime
ou dans un combat réel.

Tu dois uniquement appliquer :

- les règles présentes dans ce prompt ;
- les informations présentes dans le pavé ;
- les informations présentes dans le contexte du match.

Si une information nécessaire manque :

- ne l'invente pas ;
- signale qu'elle est manquante ;
- considère uniquement l'action concernée comme NON VALIDABLE.

IMPORTANT :

Une information peut être fournie indirectement par le contexte du match.

Exemple :

Pavé :
"Yamato fonce en course VMAX vers Tobirama."

Contexte :
Yamato = Bronze.

Résultat :

VMAX = 6 m/s.

Le pavé est considéré comme suffisamment précis
concernant la vitesse.

Il est INTERDIT de refuser ce pavé uniquement parce que
"6 m/s" n'est pas écrit dans le texte.

============================================================
19. PRIORITÉ DES INFORMATIONS
============================================================

Lorsqu'une information est disponible dans le contexte du match,
elle doit être utilisée avant de déclarer l'information manquante.

Ordre de priorité :

1. règles de ce prompt ;
2. contexte du match ;
3. informations explicitement présentes dans le pavé ;
4. aucune invention.

Les données du contexte peuvent notamment fournir :

- nom du personnage ;
- JID ;
- grade ;
- Force ;
- Combat Speed ;
- Travel Speed ;
- PV ;
- Stamina ;
- position ;
- distance ;
- état actuel ;
- autres statistiques nécessaires au système.

Si une statistique nécessaire est présente dans le contexte,
Gemini doit l'utiliser.

Si elle n'est présente ni dans le contexte ni dans le pavé,
elle est considérée comme inconnue.

Tu dois analyser le pavé comme un arbitre strict,
chronologique et impartial.
`;



 //================= RECHERCHE FICHE PAR PSEUDO =================
async function getFicheByPseudo(pseudo) {

    const fiches = await getAllFiches();

    // 1️⃣ Correspondance exacte d'abord
    let fiche = fiches.find(f => f.pseudo === pseudo);

    if (fiche) return fiche;

    // 2️⃣ Correspondance insensible à la casse
    fiche = fiches.find(f =>
        String(f.pseudo).toLowerCase() === String(pseudo).toLowerCase()
    );

    if (fiche) return fiche;

    // 3️⃣ En dernier seulement, version normalisée
    const candidats = fiches.filter(f =>
        normalizeName(f.pseudo) === normalizeName(pseudo)
    );

    // Si plusieurs fiches correspondent, on privilégie celle qui possède un JID
    return candidats.find(f => f.jid && f.jid !== "aucun") || candidats[0];
}

function randomImage(list) {
    return list[Math.floor(Math.random() * list.length)];
}
   
                
//================================================
// 🏟️ ARENES
//================================================
const arenes = [
    {
        nom: "Desert Montagneux⛰️",
        image: "https://files.catbox.moe/aoximf.jpg"
    },
    {
        nom: "Ville en Ruines🏚️",
        image: "https://files.catbox.moe/2qmvpa.jpg"
    },
    {
        nom: "Centre-ville🏙️",
        image: "https://files.catbox.moe/pzlkf9.jpg"
    },
    {
        nom: "Arise🌇",
        image: "https://files.catbox.moe/3vlsmw.jpg"
    },
    {
        nom: "Salle du temps ⌛",
        image: "https://files.catbox.moe/j4e1pp.jpg"
    },
    {
        nom: "Valley de la fin🗿",
        image: "https://files.catbox.moe/m0k1jp.jpg"
    },
    {
        nom: "École d'exorcisme de Tokyo📿",
        image: "https://files.catbox.moe/rgznzb.jpg"
    },
    {
        nom: "Marinford🏰",
        image: "https://files.catbox.moe/4bygut.jpg"
    },
    {
        nom: "Cathédrale⛩️",
        image: "https://files.catbox.moe/ie6jvx.jpg"
    }
];


//================================================
// 🌀 DUELS PAR GROUPE
//================================================
const duelsEnCours = {};
const matchAttente = {};

let lastArenaIndex = -1;


//================================================
// 🏟️ TIRAGE ALEATOIRE DE L'ARENE
//================================================
function tirerAr() {

    let i;

    do {
        i = Math.floor(Math.random() * arenes.length);
    } while (
        arenes.length > 1 &&
        i === lastArenaIndex
    );

    lastArenaIndex = i;

    return arenes[i];
}

//================================================
// ⭐ HIERARCHIE DES CATEGORIES
//================================================
const HIERARCHIE_CATEGORIES = [
    "S-",
    "S",
    "S+",
    "S+ super",
    "S+ ultra",
    "S+ extreme",
    "S+ mega",
    "S+ ultimate",

    "SS-",
    "SS",
    "SS+",
    "SS+ super",
    "SS+ ultra",
    "SS+ extreme",
    "SS+ mega",
    "SS+ ultimate"
];


//================================================
// 🔎 NORMALISATION DE CATEGORIE
//================================================
function normalizeCategorie(categorie = "") {

    return String(categorie)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


//================================================
// 📊 OBTENIR LE NIVEAU D'UNE CATEGORIE
//================================================
function getNiveauCategorie(categorie) {

    const normalisee = normalizeCategorie(categorie);

    const index = HIERARCHIE_CATEGORIES.findIndex(
        c => normalizeCategorie(c) === normalisee
    );

    return index;
}


//================================================
// ⚖️ COMPARER DEUX CATEGORIES
//================================================
function comparerCategories(categorie1, categorie2) {

    const niveau1 = getNiveauCategorie(categorie1);
    const niveau2 = getNiveauCategorie(categorie2);

    if (niveau1 === -1 || niveau2 === -1) {
        console.log(
            "⚠️ Catégorie inconnue :",
            categorie1,
            categorie2
        );

        return 0;
    }

    if (niveau1 > niveau2) return 1;

    if (niveau1 < niveau2) return -1;

    return 0;
}

//================================================
// 🎴 PREPARATION DES PERSONNAGES POUR LE MATCH
//================================================
function preparerPersonnageMatch(joueur, personnage) {

    //========================================
    // ⚡ VITESSE MAXIMALE SELON LE GRADE
    //========================================
    const vitesseMax =
        obtenirVitesseMaxParGrade(
            personnage.grade
        );

    console.log(
        "⚡ VITESSE PERSONNAGE :",
        personnage.name,
        "| Grade :", personnage.grade,
        "| Vmax :", vitesseMax, "m/s"
    );

    return {

        // Joueur propriétaire
        pseudo: joueur.pseudo,
        jid: joueur.jid,

        // Personnage / carte
        nom: personnage.name,

        image: personnage.image,

        grade: personnage.grade,

        category: personnage.category,

        //========================================
        // ⚡ VITESSE
        //========================================
        vitesseMax: vitesseMax,

        //========================================
        // ❤️ STATS DE COMBAT
        //========================================
        stats: {

            sta: 100,

            energie: 100,

            pv: 100
        }
    };
}


//================================================
// 🆚 CREATION DU DUEL
//================================================
function creerDuel(match) {

    const joueur1 = match.joueurs[0];
    const joueur2 = match.joueurs[1];

    const personnage1 = joueur1.personnage;
    const personnage2 = joueur2.personnage;

    //============================================
    // 🏟️ ARENE ALEATOIRE
    //============================================
    const arene = tirerAr();

    //============================================
    // 📊 COMPARAISON DES CATEGORIES
    //============================================
    const comparaison = comparerCategories(
        personnage1.category,
        personnage2.category
    );

    let avantageCategorie = "Égalité";

    if (comparaison > 0) {
        avantageCategorie =
            `${personnage1.name} possède la catégorie supérieure`;
    }

    else if (comparaison < 0) {
        avantageCategorie =
            `${personnage2.name} possède la catégorie supérieure`;
    }

    //============================================
    // 🎴 CREATION DES PERSONNAGES
    //============================================
    const perso1 = preparerPersonnageMatch(
        joueur1,
        personnage1
    );

    const perso2 = preparerPersonnageMatch(
        joueur2,
        personnage2
    );
//============================================
// ⚖️ CALCUL DE L'AVANTAGE
//============================================
const avantage = calculerAvantage(
    personnage1,
    personnage2
);
    
    //============================================
    // 🆚 DUEL
    //============================================
    const duel = {

    id: match.id,

    joueur1: joueur1,
    joueur2: joueur2,

    perso1: perso1,
    perso2: perso2,

    equipe1: [
        perso1
    ],

    equipe2: [
        perso2
    ],

    arene: arene,

    tour: 0,

    avantage: avantage,

    avantageCategorie: avantageCategorie,

    etat: "ready",

    createdAt: Date.now()
};

    return duel;
}

//================================================
// 🆚 FICHE DUEL
//================================================
function generateFicheDuel(duel) {

    const perso1 = duel.perso1;
    const perso2 = duel.perso2;

    return `*🆚VERSUS ARENA BATTLE🏆🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░░▒░

🔆🎴 *${perso1.nom}* :
🫀 Sta : ${perso1.stats.sta}%
🌀 En : ${perso1.stats.energie}%
❤️ Pv : ${perso1.stats.pv}%

                         ~  *🆚*  ~

🔆🎴 *${perso2.nom}* :
🫀 Sta : ${perso2.stats.sta}%
🌀 En : ${perso2.stats.energie}%
❤️ Pv : ${perso2.stats.pv}%

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*🌍 𝐀𝐫𝐞̀𝐧𝐞* : ${duel.arene.nom}
*🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞* : Boost 1 fois chaque 2 tours!
*⚖️ 𝐒𝐭𝐚𝐭𝐬* : ${duel.avantage.texte}
*🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭* : illimitée
*🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌* : 5m
*⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞* : 7mins ⚠️
*⭕ 𝐏𝐨𝐫𝐭𝐞́* : 10m

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*⚠️ Vous avez 🔟 tours max pour finir votre Adversaire !*
*Sinon la victoire sera donnée par décision selon l'offensive !*

╰───────────────────
                            🌀🔆`;
}


//================================================
// 🚀 LANCEMENT DU MATCH ALL STARS
//================================================
async function lancerMatchAllStars(match, chat, ovl) {

    try {

        console.log("🚀 PRÉPARATION DU MATCH :", match.id);

        match.etat = "loading_match";

        //========================================
        // 🌀 MESSAGE DE CHARGEMENT
        //========================================
        const loading = await ovl.sendMessage(chat, {
            text: "🏟️ Sélection de l'arène."
        });


        //========================================
        // 🏟️ ÉTAPE 1 — 15 SECONDES
        //========================================
        for (const txt of [
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène...",
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène..."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🌀 ÉTAPE 2 — 15 SECONDES
        //========================================
        for (const txt of [
            "🌀 Préparation du match.",
            "🌀 Préparation du match..",
            "🌀 Préparation du match...",
            "🌀 Préparation du match.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🔥 ÉTAPE 3 — 15 SECONDES
        //========================================
        for (const txt of [
            "🔥 Initialisation du combat.",
            "🔥 Initialisation du combat..",
            "🔥 Initialisation du combat...",
            "🔥 Initialisation du combat.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // ♨️ ÉTAPE 4 — 15 SECONDES
        //========================================
        for (const txt of [
            "♨️ Le combat va commencer.",
            "♨️ Le combat va commencer..",
            "♨️ Le combat va commencer...",
            "♨️ Le combat va commencer.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🆚 CRÉATION DU DUEL
        //========================================
        const duel = creerDuel(match);

        match.duel = duel;

        match.arene = duel.arene;

        match.etat = "in_match";


        //========================================
        // 🏟️ AFFICHAGE DE L'ARÈNE
        //========================================
        await ovl.sendMessage(chat, {

            image: {
                url: duel.arene.image
            },

            caption: generateFicheDuel(duel)

        });


        //========================================
        // ♨️ DÉMARRAGE DU COMBAT
        //========================================
        await demarrerCombat(
            match,
            chat,
            ovl
        );


        //========================================
        // 📊 LOGS
        //========================================

        console.log(
            "🏟️ Arène sélectionnée :",
            duel.arene.nom
        );

        console.log(
            "🎴 Personnage 1 :",
            duel.perso1.nom,
            "| Catégorie :",
            duel.perso1.category
        );

        console.log(
            "🎴 Personnage 2 :",
            duel.perso2.nom,
            "| Catégorie :",
            duel.perso2.category
        );


    } catch (error) {

        console.error(
            "❌ ERREUR LANCEMENT MATCH ALL STARS :",
            error
        );

        match.etat = "error";

        await ovl.sendMessage(chat, {
            text:
`❌ Une erreur est survenue lors du lancement du match.

Veuillez réessayer.`
        });
    }
}

//================================================
// 🏆 HIERARCHIE DES GRADES
//================================================
const HIERARCHIE_GRADES = [
    "Bronze",
    "Argent",
    "Or"
];


//================================================
// ⚖️ COMPARAISON GRADE
//================================================
function getNiveauGrade(grade = "") {

    const index = HIERARCHIE_GRADES.findIndex(
        g => g.toLowerCase() === String(grade).toLowerCase()
    );

    return index;
}

//================================================
// ⚖️ CALCUL DE L'AVANTAGE TOTAL
//================================================
function calculerAvantage(personnage1, personnage2) {

    const cat1 = getNiveauCategorie(personnage1.category);
    const cat2 = getNiveauCategorie(personnage2.category);

    //============================================
    // 1️⃣ CATÉGORIE DIFFÉRENTE
    //============================================
    if (cat1 !== cat2) {

        const ecart = Math.abs(cat1 - cat2);

        if (cat1 > cat2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 2️⃣ CATÉGORIE ÉGALE → GRADE
    //============================================
    const grade1 = getNiveauGrade(personnage1.grade);
    const grade2 = getNiveauGrade(personnage2.grade);

    if (grade1 !== grade2) {

        const ecart = Math.abs(grade1 - grade2);

        if (grade1 > grade2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 3️⃣ CATÉGORIE + GRADE IDENTIQUES
    //============================================
    return {
        joueur: 0,
        valeur: 0.5,
        texte: `${personnage1.name} +0.5 / ${personnage2.name} +0.5`,
        statsEqual: true
    };
}

//================================================
// 🥊 DETERMINER QUI COMMENCE
//================================================
function determinerPremierJoueur(match) {

    const j1 = match.joueurs[0];
    const j2 = match.joueurs[1];

    const p1 = j1.personnage;
    const p2 = j2.personnage;

    //============================================
    // 1️⃣ COMPARAISON DES CATEGORIES
    //============================================
    const cat1 = getNiveauCategorie(p1.category);
    const cat2 = getNiveauCategorie(p2.category);

    console.log("⚖️ Catégorie J1 :", p1.category, cat1);
    console.log("⚖️ Catégorie J2 :", p2.category, cat2);

    // Catégories différentes
    if (cat1 < cat2) {
        return {
            joueur: j1,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat2 - cat1,
            statsEqual: false
        };
    }

    if (cat2 < cat1) {
        return {
            joueur: j2,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat1 - cat2,
            statsEqual: false
        };
    }


    //============================================
    // 2️⃣ CATÉGORIES ÉGALES → COMPARAISON GRADE
    //============================================
    const grade1 = getNiveauGrade(p1.grade);
    const grade2 = getNiveauGrade(p2.grade);

    console.log("🏅 Grade J1 :", p1.grade, grade1);
    console.log("🏅 Grade J2 :", p2.grade, grade2);

    // Grades différents
    if (grade1 < grade2) {
        return {
            joueur: j1,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade2 - grade1,
            statsEqual: false
        };
    }

    if (grade2 < grade1) {
        return {
            joueur: j2,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade1 - grade2,
            statsEqual: false
        };
    }

//============================================
// 3️⃣ CATÉGORIE + GRADE IDENTIQUES
//============================================
const joueurAleatoire =
    Math.random() < 0.5 ? j1 : j2;

return {
    joueur: joueurAleatoire,
    raison: "catégorie et grade identiques → tirage 0.5",
    type: "random",
    ecart: 0.5,
    statsEqual: true
};
}

//================================================
// ⏱️ TIMER DU JOUEUR ACTIF
//================================================
function lancerTimerTour(match, chat, ovl) {

    // Sécurité : annuler les anciens timers
    if (match.timerTour) {
        clearTimeout(match.timerTour);
    }

    if (match.timerWarning) {
        clearTimeout(match.timerWarning);
    }

    const joueur = match.joueurActif;

    if (!joueur || !joueur.jid) {
        console.log("❌ Impossible de lancer le timer : joueur actif introuvable");
        return;
    }

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    console.log(
        "⏱️ TIMER LANCÉ POUR :",
        pseudo,
        "| JID :",
        jid
    );

    //============================================
    // ⚠️ AVERTISSEMENT À 6 MINUTES
    //============================================
    match.timerWarning = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Le joueur doit toujours être celui qui joue
        if (actuel.joueurActif?.jid !== jid) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ *PLUS QU'1 MINUTE !*

➡️ @${pseudo}

Il te reste seulement 1 minute pour envoyer ton pavé !`,
            mentions: [jid]
        });

    }, 6 * 60 * 1000);


    //============================================
    // ⏰ FIN DES 7 MINUTES
    //============================================
    match.timerTour = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Vérifie que le joueur est toujours actif
        if (actuel.joueurActif?.jid !== jid) return;

        console.log(
            "⏰ TEMPS ÉCOULÉ POUR :",
            pseudo
        );

        await ovl.sendMessage(chat, {
            text:
`⏰ *TEMPS ÉCOULÉ !*

➡️ @${pseudo}

Tu n'as pas envoyé ton pavé dans les 7 minutes.

❌ Ton tour est perdu.`
        });

    }, 7 * 60 * 1000);
}

//================================================
// ♨️ DEBUT DU COMBAT
//================================================
async function demarrerCombat(match, chat, ovl) {

    const premier = determinerPremierJoueur(match);

    const joueur = premier.joueur;

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    // Sauvegarde du joueur actif
    match.joueurActif = joueur;
    match.joueurActifJid = jid;

    match.tour = 1;
    match.phase = "attaque";

    console.log(
        "♨️ PREMIER JOUEUR :",
        pseudo,
        "| JID :",
        jid,
        "| Raison :",
        premier.raison
    );

    //================================================
    // 🎬 MEDIA DE DEBUT DU COMBAT
    //================================================
    await ovl.sendMessage(chat, {
    video: {
        url: "https://files.catbox.moe/1td1ai.mp4"
    },
    gifPlayback: true,
    caption:
`*♨️🎮 DEBUT DU COMBAT🌀*
▔▔▔▔▔▔▔▔▔
➡️ @${pseudo} GO !!!! 🔥

╰───────────────────
                            🌀🔆`,
    mentions: [jid]
});

    //================================================
    // ⏱️ TIMER UNIQUEMENT POUR LE PREMIER JOUEUR
    //================================================
    lancerTimerTour(match, chat, ovl);
}



// COMMANDE DE LANCEMENT DU MATCH🌀🆚//
ovlcmd({
    nom_cmd: "match🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Lancer un match VS"
}, async (ms_org, ovl, cmd_options) => {

    const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;

    const matchId = Date.now().toString();

    // 🧠 création du match
duelsEnCours[matchId] = {
    id: matchId,
    etat: "waiting_players",
    joueurs: [],
    fiches: {},
    personnages: {},
    arene: null,
    tour: 0,
    createdAt: Date.now(),

    timers: {
        waitingPlayers: null,
        turn: null,
        warning: null
    }
};

    matchAttente[chat] = matchId;

    const images = [
        "https://files.catbox.moe/fc5v8n.jpg",
        "https://files.catbox.moe/8g6zu2.jpg"
    ];

    const img = images[Math.floor(Math.random() * images.length)];

    await ovl.sendMessage(chat, {
        image: { url: img },
        caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔅 *MATCH MAKING*
Veuillez inscrire vos pseudos de joueurs:

*🎮 Joueur 1:*
*🎮 Joueur 2:*

⏳ Vous avez 2 minutes pour répondre.

╰───────────────────
🔆 ALL STARS JUMP 🌀`
    });

    // ⏱️ TIMER 2 MINUTES
match.timers.waitingPlayers = setTimeout(async () => {

    const matchActuel = duelsEnCours[matchId];

    if (!matchActuel) return;

    if (matchActuel.etat !== "waiting_players") return;

    await ovl.sendMessage(chat, {
        text:
`⛔ MATCH ANNULÉ
Aucun joueur valide détecté dans le temps imparti.`
    });

    delete duelsEnCours[matchId];
    delete matchAttente[chat];

}, 120000);
});

//================================================
// 🌀 SYSTEME INSCRIPTION JOUEURS MATCH
//================================================
async function verifierJoueursMatch(message, chat, ovl) {


    const matchId = matchAttente[chat];

    if (!matchId) return;


    const match = duelsEnCours[matchId];


    if (!match || match.etat !== "waiting_players") return;



    // Vérifie que c'est bien la fiche du match
    if(
        !message.includes("Joueur 1") ||
        !message.includes("Joueur 2")
    ) return;



    const j1 = message.match(/joueur\s*1\s*:\s*(.+)/i);
    const j2 = message.match(/joueur\s*2\s*:\s*(.+)/i);



    if(!j1 || !j2) return;



    const pseudo1 = j1[1].trim();
const pseudo2 = j2[1].trim();

const fiche1 = await getFicheByPseudo(pseudo1);
const fiche2 = await getFicheByPseudo(pseudo2);

console.log("Pseudo reçu J1 :", pseudo1);
console.log("Pseudo reçu J2 :", pseudo2);

const toutes = await getAllFiches();
console.log("Tous les pseudos :", toutes.map(x => x.pseudo));

if (!fiche1 || !fiche2) {

    await ovl.sendMessage(chat,{
        text:
`❌ JOUEUR INTROUVABLE

${!fiche1 ? `❌ ${pseudo1}` : ""}
${!fiche2 ? `❌ ${pseudo2}` : ""}

Les joueurs doivent posséder une fiche ALL STARS.`
    });

    return;
}
    
const data1 = fiche1.dataValues || fiche1;
const data2 = fiche2.dataValues || fiche2;

match.joueurs=[
{
    pseudo: data1.pseudo,
    jid: data1.jid,
    fiche: data1
},
{
    pseudo: data2.pseudo,
    jid: data2.jid,
    fiche: data2
}
];

console.log("🆔 JID J1 :", data1.jid);
console.log("🆔 JID J2 :", data2.jid);

console.log("🎮 Joueurs sauvegardés :", match.joueurs);

    match.fiches={
        joueur1: fiche1,
        joueur2: fiche2
    };

    if (match.timers?.waitingPlayers) {
    clearTimeout(match.timers.waitingPlayers);
    match.timers.waitingPlayers = null;
    }
    match.etat="loading_characters";

    await ovl.sendMessage(chat,{
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
✅ JOUEURS CONFIRMÉS 🎉

🎮 Joueur 1 : ${fiche1.pseudo}
              🆚
🎮 Joueur 2 : ${fiche2.pseudo}

📂 Les deux fiches ont été trouvées.

╰───────────────────
                      🔆🌀`
    });

   
    const msg = await ovl.sendMessage(chat,{
        text:"🌀 Chargement."
    });

    for(const txt of [
        "🌀 Chargement.",
        "🌀 Chargement..",
        "🌀 Chargement..."
    ]){

        await new Promise(r=>setTimeout(r,500));


        await ovl.sendMessage(chat,{
            text:txt,
            edit:msg.key
        });

    }

    match.etat="waiting_cards";
    
    const imagesChoixPersonnage = [
    "https://files.catbox.moe/ygzb4n.jpg",
    "https://files.catbox.moe/a49tvk.jpg",
    "https://files.catbox.moe/vvspfe.jpg",
    "https://files.catbox.moe/txd8so.jpg"
];

const imgChoix = imagesChoixPersonnage[
    Math.floor(Math.random() * imagesChoixPersonnage.length)
];

await ovl.sendMessage(chat,{
    image: {
        url: imgChoix
    },
    caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔
*🎮\`CHOIX DU PERSONNAGE\`*

♨️Veuillez écrire le nom complet de vos personnages !

Exemple :
🌀 Tanjiro
🌀 Sasuke Hebi
🌀 Goku SSJ

🎮⌛ Temps d'attente : 2 minutes...

╰───────────────────
                      🔆🌀`
});   
 }

//================================================
// 🎴 SYSTEME CHOIX DES PERSONNAGES / CARDS
//================================================
async function verifierCardsMatch(message, chat, ovl, sender) {

    const matchId = matchAttente[chat];

    if (!matchId) return;

    const match = duelsEnCours[matchId];

    if (!match || match.etat !== "waiting_cards") return;


    // ============================================
// 🎮 DÉTERMINER LE JOUEUR QUI DOIT CHOISIR
// ============================================

// ⚠️ Le message peut venir du BOT lui-même.
// On ne doit donc PAS utiliser `sender` pour identifier
// le joueur qui choisit sa carte.

console.log(
    "🤖 JID du message reçu :",
    sender
);

console.log(
    "🆔 JID des joueurs sauvegardés :",
    match.joueurs.map(j => j.jid)
);


// ============================================
// 🎴 CHERCHER LE PREMIER JOUEUR
// QUI N'A PAS ENCORE CHOISI
// ============================================

const joueur = match.joueurs.find(
    j => !j.personnage
);


if (!joueur) {

    console.log(
        "❌ Tous les joueurs ont déjà choisi leur personnage."
    );

    return;
}


console.log(
    "✅ Joueur identifié pour le choix :",
    joueur.pseudo,
    "| JID :",
    joueur.jid
);


    const texte = clean(message);


    // 🚫 Ignorer les messages système
    if (
        texte.includes("ANIME JUMP VERSUS") ||
        texte.includes("CHOIX DU PERSONNAGE") ||
        texte.includes("Veuillez écrire")
    ) return;


    const nomCarte = texte
    .replace(/^[🌀]\s*/u, "")
    .trim();


    if (!nomCarte) return;


    console.log(
        "🎴 Carte demandée :",
        nomCarte,
        "par",
        joueur.pseudo
    );

// ============================================
// 🎴 RÉCUPÉRATION DES CARTES
// 🔥 MÊME SYSTÈME QUE LA BOUTIQUE
// ============================================

const allCards = [];

for (const [placementKey, placementCards] of Object.entries(cards)) {

    for (const c of placementCards) {

        allCards.push({
            ...c,
            placement: placementKey
        });

    }
}


// ============================================
// 🔎 NORMALISATION
// ============================================

const normaliserCarte = str =>
    String(str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-_]/g, "")
        .trim();

const recherche = normaliserCarte(nomCarte);

console.log("🔎 Recherche carte normalisée :", recherche);


// ============================================
// 🎴 RECHERCHE EXACTE
// ============================================

let carte = allCards.find(c =>
    normaliserCarte(c.name) === recherche
);


// ============================================
// 🎴 RECHERCHE PARTIELLE
// ============================================

if (!carte) {

    carte = allCards.find(c =>
        normaliserCarte(c.name).includes(recherche)
    );

}


// ============================================
// ❌ CARTE INTROUVABLE
// ============================================

if (!carte) {

    console.log(
        "❌ Carte introuvable dans la base :",
        nomCarte
    );

    console.log(
        "🔎 Recherche utilisée :",
        recherche
    );

    return;
}


// ============================================
// ✅ CARTE TROUVÉE
// ============================================

console.log(
    "🎴 CARTE TROUVÉE :",
    carte.name
);

console.log(
    "📊 Grade :",
    carte.grade,
    "| Catégorie :",
    carte.category
);
   
// ============================================
// 📂 FICHE DU JOUEUR DÉJÀ SAUVEGARDÉE
// ============================================

const ficheData = joueur.fiche.dataValues || joueur.fiche;


// ============================================
// 🎴 CARTES POSSÉDÉES
// ============================================

const cartesJoueur = ficheData.cards
    ? ficheData.cards
        .split("\n")
        .map(c => c.trim())
        .filter(Boolean)
    : [];


console.log(
    "🎴 Cartes de",
    joueur.pseudo,
    ":",
    cartesJoueur
);


// ============================================
// ✅ VÉRIFICATION DE POSSESSION
// ============================================

const cartePossedee = cartesJoueur.find(c =>
    normaliserCarte(c) === recherche
);


if (!cartePossedee) {

    await ovl.sendMessage(chat, {
        text:
`❌ CARTE NON POSSÉDÉE

🎮 ${joueur.pseudo}
n'a pas la carte :
🎴 ${nomCarte}

Choisis une carte présente dans ta fiche.`
    });

    return;
}


// ============================================
// 🎴 CARTE DÉJÀ TROUVÉE DANS LA BASE
// ============================================

const card = carte;

console.log("🎴 CARTE TROUVÉE :", card);


// ============================================
// 💾 SAUVEGARDE DU PERSONNAGE
// ============================================

joueur.personnage = card;

console.log(
    "✅ Carte validée :",
    joueur.pseudo,
    "=>",
    card.name
);


// ============================================
// 🖼️ CONFIRMATION
// ============================================

await ovl.sendMessage(chat, {
    image: {
        url: card.image
    },
    caption:
`🎴🌀 *Carte :* ${card.name}

Nom : ${card.name}
Grade : ${card.grade}
Catégorie : ${card.category}

▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░
                                 🔆🌀`
});

   
    // ============================================
    // 🔥 LES DEUX JOUEURS ONT CHOISI
    // ============================================
if (
    match.joueurs[0].personnage &&
    match.joueurs[1].personnage
) {

    match.personnages = {
        joueur1: match.joueurs[0].personnage,
        joueur2: match.joueurs[1].personnage
    };

    match.etat = "cards_loaded";

    await ovl.sendMessage(chat, {
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔
🎴 PERSONNAGES FINALISÉS ✅

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

                🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                      🔆🌀`
    });


//============================================
// ⏳ MATCH PRÊT → CHARGEMENT PENDANT 1 MINUTE
//============================================
match.etat = "waiting_match_start";

//============================================
// 🖼️ IMAGE DE CREATION DU MATCH
//============================================
const imagesMatch = [
    "https://files.catbox.moe/fc5v8n.jpg",
    "https://files.catbox.moe/8g6zu2.jpg"
];

const imageMatch = imagesMatch[
    Math.floor(Math.random() * imagesMatch.length)
];

//============================================
// 🎴 MESSAGE DES JOUEURS PRÊTS
//============================================
await ovl.sendMessage(chat, {

    image: {
        url: imageMatch
    },

    caption:
`🌀🔆 *ANIME JUMP VERSUS*

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

🎴✅ *LES JOUEURS SONT PRÊTS !*
*LE MATCH DÉBUTERA DANS 1 MIN⌚ ...*

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                             🔆🌀`
});

//============================================
// ⏱️ ATTENTE AVANT LE CHARGEMENT
//============================================
// Petite pause avant de commencer les animations
await new Promise(resolve =>
    setTimeout(resolve, 1000)
);


//============================================
// 🚀 LANCEMENT DU CHARGEMENT
//============================================
await lancerMatchAllStars(
    match,
    chat,
    ovl
); 
}       
}

//================================================
// 🌀 COMMANDE STATS DU COMBAT
//================================================

ovlcmd({
    nom_cmd: "stats🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Afficher les statistiques actuelles du combat"
}, async (ms_org, ovl, cmd_options) => {

    //================================================
    // 📍 CHAT
    //================================================

    const chat =
        ms_org.from ||
        ms_org.key?.remoteJid ||
        ms_org;

    //================================================
    // 🔎 RÉCUPÉRER LE MATCH
    //================================================

    const match =
        matchsActifs.get(chat);

    if (!match) {

        await ovl.sendMessage(
            chat,
            {
                text:
                    "❌ Aucun combat actif dans ce groupe."
            },
            {
                quoted: ms_org
            }
        );

        return;
    }

    //================================================
    // 🧠 TRACKER COMBAT GEMINI
    //================================================

    const tracker =
        match.trackerCombatGemini;

    if (
        !tracker ||
        !Array.isArray(tracker.joueurs)
    ) {

        await ovl.sendMessage(
            chat,
            {
                text:
                    "❌ Le tracker du combat n'est pas disponible."
            },
            {
                quoted: ms_org
            }
        );

        return;
    }

    //================================================
    // 📊 BARRE DE STATS
    //================================================

    function barreStats(valeur) {

        const longueur = 10;

        const v =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(valeur) || 0
                )
            );

        const pleins =
            Math.round(
                (v / 100) * longueur
            );

        return (
            "█".repeat(pleins) +
            "░".repeat(
                longueur - pleins
            )
        );
    }

    //================================================
    // 👤 AFFICHAGE JOUEUR
    //================================================

    function afficherJoueur(joueur) {

        const nom =
            joueur?.personnage ||
            joueur?.nom ||
            "Inconnu";

        const pv =
            Math.round(
                Number(joueur?.pv) || 0
            );

        const stamina =
            Math.round(
                Number(joueur?.stamina) || 0
            );

        const energie =
            Math.round(
                Number(joueur?.energie) || 0
            );

        const posture =
            joueur?.posture ||
            "neutre";

        const equilibre =
            joueur?.equilibre ||
            "stable";

        const etat =
            joueur?.ko
                ? "🔴 KO"
                : "🟢 ACTIF";

        return `
╭───────────────
│ 👤 ${nom}
│
│ ❤️ PV       : ${pv}%
│ ${barreStats(pv)}
│
│ 🫀 STAMINA  : ${stamina}%
│ ${barreStats(stamina)}
│
│ 🌀 ÉNERGIE  : ${energie}%
│ ${barreStats(energie)}
│
│ 🧍 Posture  : ${posture}
│ ⚖️ Équilibre : ${equilibre}
│
│ ${etat}
╰───────────────`;
    }

    //================================================
    // ⚔️ TOUR
    //================================================

    const tour =
        Number(
            tracker.combat?.tour
        ) || 0;

    const maxTours =
        Number(
            tracker.combat?.maxTours
        ) || 10;

    //================================================
    // 📝 MESSAGE
    //================================================

    let texte = `
🌀🔆 *ANIME JUMP VERSUS*

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🌀 STATS DU COMBAT
⚔️ TOUR : ${tour}/${maxTours}
`;

    for (
        const joueur
        of tracker.joueurs
    ) {

        texte +=
            "\n" +
            afficherJoueur(joueur) +
            "\n";
    }

    texte += `
                                     🌀🔆`;

    //================================================
    // 📤 ENVOI
    //================================================

    await ovl.sendMessage(
        chat,
        {
            text: texte
        },
        {
            quoted: ms_org
        }
    );

});


//================================================
// 🛑 COMMANDE ARRÊT DU MATCH
//================================================
ovlcmd({
    nom_cmd: "stopmatch🌀",
    classe: "ALLSTARS🌀",
    react: "🛑",
    desc: "Arrêter le match ALL STARS en cours"
}, async (ms_org, ovl, cmd_options) => {

    const chat =
        ms_org.from ||
        ms_org.key?.remoteJid ||
        ms_org;

    //============================================
    // 🔎 RECHERCHE DU MATCH DU GROUPE
    //============================================
    const matchId = matchAttente[chat];

    if (!matchId) {

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Il n'y a actuellement aucun match ALL STARS actif dans ce groupe.`
        });

        return;
    }

    //============================================
    // 🔎 RECUPERATION DU MATCH
    //============================================
    const match = duelsEnCours[matchId];

    if (!match) {

        // Nettoyage au cas où matchAttente
        // contient un ancien ID
        delete matchAttente[chat];

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Le match associé à ce groupe n'existe plus.`
        });

        return;
    }

    //============================================
    // 🛑 ARRET DU MATCH
    //============================================
    const joueurs = match.joueurs || [];

    const nomsJoueurs = joueurs.length
        ? joueurs.map(j => j.pseudo).join(" 🆚 ")
        : "Aucun joueur enregistré";

    console.log(
        "🛑 MATCH ARRÊTÉ :",
        matchId,
        "| Groupe :",
        chat,
        "| Joueurs :",
        nomsJoueurs
    );

    //============================================
    // 🗑️ SUPPRESSION DU MATCH
    //============================================
    delete duelsEnCours[matchId];
    delete matchAttente[chat];

    //============================================
    // 📢 MESSAGE
    //============================================
    await ovl.sendMessage(chat, {
        text:
`🛑 *MATCH ALL STARS ARRÊTÉ*

${nomsJoueurs}

❌ Le match a été annulé avec succès.

╰───────────────────
                 🌀🔆`
    });
});
               
module.exports = {
    verifierJoueursMatch,
    verifierCardsMatch,
    analysePaveAvecGemini,
    envoyerResultatPaveGemini,
    lancerMatchAllStars,
    duelsEnCours,
    matchAttente,
    lancerTimerTour
};
