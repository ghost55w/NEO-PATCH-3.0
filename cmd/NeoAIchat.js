//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
//==============================================================
//
// NeoAIchat.js
//
// Rôle :
// - Lance une session de test avec +testNeoAI🌀
// - Attend un texte commençant par 🌀:
// - Envoie 3 étapes de progression
// - Analyse le texte avec NeoAI.js
// - Affiche d'abord le résumé
// - Puis le JSON de compréhension
//
// Durée simulée de l'analyse : 30 secondes
//
// 0s  → 🧠 Analyse du texte...
// 10s → 🔎 Réfléchis...
// 20s → ❇️ Envoi de la réponse...
// 30s → Résultat
//==============================================================


const {
    neoAnalyserTexteBase
} = require("./NeoAI");


//==============================================================
// 🧠 SESSIONS DE TEST
//==============================================================

const neoAITests = new Map();


//==============================================================
// 🔎 EXTRAIRE 🌀:
//==============================================================

function extraireTexteNeoAI(texte = "") {

    if (
        typeof texte !== "string"
    ) {

        return null;

    }


    const match =
        texte.match(
            /^\s*🌀\s*:\s*([\s\S]+)/i
        );


    if (!match) {

        return null;

    }


    return match[1].trim();

}


//==============================================================
// 📝 CONSTRUIRE LE RÉSUMÉ
//==============================================================

function construireResumeNeoAI(analyse) {

    if (
        !analyse ||
        !analyse.texte
    ) {

        return (
            "NeoAI n'a reçu aucun texte à analyser."
        );

    }


    return (
        "NeoAI comprend que : " +
        analyse.texte
    );

}


//==============================================================
// 🧠 ANALYSE NEO AI
//==============================================================
//
// Pour le moment NeoAI utilise uniquement
// le moteur linguistique de base.
//
// Cette fonction sera progressivement enrichie
// avec les dictionnaires, synonymes, verbes,
// adjectifs, connecteurs, contexte, etc.
//==============================================================

function analyserNeoAI(texte = "") {

    const analyse =
        neoAnalyserTexteBase(
            texte
        );


    return {

        valid: true,

        langue:
            analyse.langue,

        texte:
            analyse.texte,

        phrases:
            analyse.phrases,

        mots:
            analyse.tokens,

        nombreMots:
            analyse.nombreMots,

        nombrePhrases:
            analyse.nombrePhrases,

        resume:
            construireResumeNeoAI(
                analyse
            )

    };

}


//==============================================================
// 🎮 COMMANDE
//==============================================================

ovlcmd(
    {

        nom_cmd: 'testNeoAI🌀',

        classe: 'NeoAI🧠',

        react: '🧠',

        desc:
            "Teste la compréhension linguistique de NeoAI"

    },


    async (
        ms_org,
        ovl,
        {
            arg,
            ms
        }
    ) => {


        //======================================================
        // 👤 IDENTIFICATION DU JOUEUR
        //======================================================

        const jid =
            ms?.sender ||
            ms?.key?.participant ||
            ms?.key?.remoteJid;


        //======================================================
        // 🧹 SUPPRIMER UNE ANCIENNE SESSION
        //======================================================

        neoAITests.delete(
            jid
        );


        //======================================================
        // 🧠 CRÉER UNE NOUVELLE SESSION
        //======================================================

        neoAITests.set(
            jid,
            {

                actif: true,

                timestamp:
                    Date.now()

            }
        );

//======================================================
// 👋 ACCUEIL NEO AI — IMAGE + CAPTION
//======================================================

await ovl.sendMessage(

    ms_org,

    {

        image: {
            url: "URL_DE_TON_IMAGE"
        },

        caption:

            "🧠 *NEO AI🌀* 👋🏻\n\n" +

            "🙂 Bonjour ! Je suis *NeoAI*, " +
            "le moteur linguistique de NEO.\n\n" +

            "📖 Je vais analyser ton texte " +
            "et essayer d'en comprendre " +
            "le langage, les actions et le contexte.\n\n" +

            "✍️ *Envoie maintenant le texte à analyser :*\n\n" +

            "Exemple :\n\n" +

            "🌀: Les oiseaux volent dans le ciel " +
            "en plein midi vers le pays des fleurs."

    },

    {

        quoted:
            ms

    }

);
        
//==============================================================
// 🌀 TRAITEMENT DES TEXTES NEO AI
//==============================================================

async function traiterMessageNeoAI(

    ovl,

    ms,

    texte = ""

) {


    //==========================================================
    // 👤 IDENTIFICATION DU JOUEUR
    //==========================================================

    const jid =

        ms?.sender ||

        ms?.key?.participant ||

        ms?.key?.remoteJid;


    //==========================================================
    // 🔎 VÉRIFIER SI UNE SESSION EST ACTIVE
    //==========================================================

    const session =

        neoAITests.get(
            jid
        );


    if (!session) {

        return false;

    }


    //==========================================================
    // ⏱️ EXPIRATION DE LA SESSION
    //==========================================================

    const expiration =
        5 * 60 * 1000;


    if (

        Date.now() -
        session.timestamp >
        expiration

    ) {

        neoAITests.delete(
            jid
        );

        return false;

    }


    //==========================================================
    // 🔎 VÉRIFIER LE PRÉFIXE 🌀:
    //==========================================================

    const texteAnalyse =

        extraireTexteNeoAI(
            texte
        );


    //==========================================================
    // 🚫 PAS UN TEXTE NEO AI
    //==========================================================

    if (!texteAnalyse) {

        return false;

    }


    //==========================================================
    // 📥 TEXTE REÇU
    //==========================================================

    console.log(
        "🧠 NEO AI → TEXTE REÇU :"
    );

    console.log(
        texteAnalyse
    );


    //==========================================================
    // 🧠 ÉTAPE 1
    //==========================================================

    await ovl.sendMessage(

        ms.key.remoteJid,

        {

            text:
                "🧠 *Analyse du texte...*"

        },

        {

            quoted:
                ms

        }

    );


    //==========================================================
    // ⏱️ ATTENTE 10 SECONDES
    //==========================================================

    await new Promise(

        resolve =>
            setTimeout(
                resolve,
                10000
            )

    );


    //==========================================================
    // 🔎 ÉTAPE 2
    //==========================================================

    await ovl.sendMessage(

        ms.key.remoteJid,

        {

            text:
                "🔎 *Réfléchis...*"

        },

        {

            quoted:
                ms

        }

    );


    //==========================================================
    // ⏱️ ATTENTE 10 SECONDES
    //==========================================================

    await new Promise(

        resolve =>
            setTimeout(
                resolve,
                10000
            )

    );


    //==========================================================
    // ❇️ ÉTAPE 3
    //==========================================================

    await ovl.sendMessage(

        ms.key.remoteJid,

        {

            text:
                "❇️ *Envoi de la réponse...*"

        },

        {

            quoted:
                ms

        }

    );


    //==========================================================
    // ⏱️ ATTENTE 10 SECONDES
    //==========================================================

    await new Promise(

        resolve =>
            setTimeout(
                resolve,
                10000
            )

    );


    //==========================================================
    // 🧠 ANALYSE NEO AI
    //==========================================================

    let resultat;


    try {

        resultat =

            analyserNeoAI(
                texteAnalyse
            );


    } catch (error) {

        console.error(
            "❌ NEO AI → ERREUR :",
            error
        );


        await ovl.sendMessage(

            ms.key.remoteJid,

            {

                text:
                    "❌ NeoAI a rencontré une erreur pendant l'analyse."

            },

            {

                quoted:
                    ms

            }

        );


        neoAITests.delete(
            jid
        );


        return true;

    }


    //==========================================================
    // 📝 RÉSUMÉ
    //==========================================================

    const resume =

        resultat.resume;


    //==========================================================
    // 📦 CONVERSION JSON
    //==========================================================

    const json =

        JSON.stringify(

            resultat,

            null,

            2

        );


    //==========================================================
    // 📤 RÉPONSE FINALE
    //==========================================================

    const reponse =

        "🧠 *NEO AI🌀 — ANALYSE TERMINÉE*\n\n" +

        "📝 *Résumé :*\n\n" +

        resume +

        "\n\n" +

        "📦 *JSON COMPRÉHENSION :*\n\n" +

        "```json\n" +

        json +

        "\n```";


    //==========================================================
    // 📤 ENVOYER LE RÉSULTAT
    //==========================================================

    await ovl.sendMessage(

        ms.key.remoteJid,

        {

            text:
                reponse

        },

        {

            quoted:
                ms

        }

    );


    //==========================================================
    // 🧹 FIN DE SESSION
    //==========================================================

    neoAITests.delete(
        jid
    );


    //==========================================================
    // 📊 LOG
    //==========================================================

    console.log(
        "✅ NEO AI → ANALYSE TERMINÉE"
    );


    return true;

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    traiterMessageNeoAI,

    analyserNeoAI,

    extraireTexteNeoAI

};
