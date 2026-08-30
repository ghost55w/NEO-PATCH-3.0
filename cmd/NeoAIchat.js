//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
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

    const match = texte.match(
        /🌀\s*:\s*([\s\S]+)/i
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

        return "NeoAI n'a reçu aucun texte à analyser.";

    }

    return (
        "NeoAI comprend que : " +
        analyse.texte
    );

}


//==============================================================
// 🧠 ANALYSE NEO AI
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
        desc: "Teste la compréhension linguistique de NeoAI"
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
        // 👤 IDENTIFICATION
        //======================================================

        const jid =
            ms?.sender ||
            ms?.key?.participant ||
            ms?.key?.remoteJid;


        //======================================================
        // 🧹 ANCIENNE SESSION
        //======================================================

        neoAITests.delete(
            jid
        );


        //======================================================
        // 🧠 CRÉER SESSION
        //======================================================

        neoAITests.set(
            jid,
            {
                actif: true,
                timestamp: Date.now()
            }
        );


        //======================================================
        // 👋 ACCUEIL
        //======================================================

        await ovl.sendMessage(
            ms.chat,
            {
                text:
                    "🧠 *NEO AI🌀* 👋🏻\n\n" +

                    "🙂 Bonjour ! Je suis *NeoAI*, " +
                    "le moteur linguistique de NEO.\n\n" +

                    "📖 Je vais analyser ton texte " +
                    "et essayer d'en comprendre le contexte.\n\n" +

                    "✍️ *Envoie maintenant le texte à analyser :*\n\n" +

                    "Exemple :\n" +

                    "🌀: Les oiseaux volent dans le ciel " +
                    "en plein midi vers le pays des fleurs."
            },

            {
                quoted: ms
            }
        );

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

    const jid =
        ms?.sender ||
        ms?.key?.participant ||
        ms?.key?.remoteJid;


    //==========================================================
    // 🔎 SESSION ACTIVE ?
    //==========================================================

    const session =
        neoAITests.get(
            jid
        );


    if (!session) {

        return false;

    }


    //==========================================================
    // ⏱️ EXPIRATION SESSION
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
    // 🔎 EXTRAIRE 🌀:
//==========================================================

    const texteAnalyse =
        extraireTexteNeoAI(
            texte
        );


    if (!texteAnalyse) {

        return false;

    }


    console.log(
        "🧠 NEO AI → TEXTE REÇU :"
    );

    console.log(
        texteAnalyse
    );


    //==========================================================
    // 🧠 ANALYSE
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
            ms.chat,
            {
                text:
                    "❌ NeoAI a rencontré une erreur pendant l'analyse."
            },
            {
                quoted: ms
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
    // 📦 JSON
    //==========================================================

    const json =
        JSON.stringify(
            resultat,
            null,
            2
        );


    //==========================================================
    // 📤 RÉPONSE
    //==========================================================

    const reponse =

        "🧠 *NEO AI🌀 — ANALYSE*\n\n" +

        "📝 *Résumé :*\n" +

        resume +

        "\n\n" +

        "📦 *JSON COMPRÉHENSION :*\n\n" +

        "```json\n" +

        json +

        "\n```";


    await ovl.sendMessage(
        ms.chat,
        {
            text: reponse
        },
        {
            quoted: ms
        }
    );


    //==========================================================
    // 🧹 FIN SESSION
    //==========================================================

    neoAITests.delete(
        jid
    );


    console.log(
        "✅ NEO AI → ANALYSE TERMINÉE"
    );


    return true;

}


//==============================================================
// 📤 EXPORT
//==============================================================

module.exports = {

    traiterMessageNeoAI,

    analyserNeoAI,

    extraireTexteNeoAI

};
