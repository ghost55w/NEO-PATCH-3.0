//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
//==============================================================
//
// NeoAIchat.js
//
// Rôle :
// - Lance une session avec +testNeoAI🌀
// - Attend un texte commençant par 🌀:
// - Analyse le texte avec NeoAI.js
// - Affiche les mots connus/inconnus
// - Détecte le contexte combat
// - Détecte synonymes / antonymes
// - Produit un résumé + JSON
//
//==============================================================


//==============================================================
// 📦 IMPORT DU SYSTÈME DE COMMANDES
//==============================================================

const ovlModule =
    require("../lib/ovlcmd");


//==============================================================
// 🛡️ RÉCUPÉRATION SÉCURISÉE DE ovlcmd
//==============================================================
//
// Ton lib/ovlcmd.js exporte :
//
// {
//     ovlcmd,
//     Module,
//     cmd,
//     func
// }
//
// Donc on récupère d'abord ovlcmd.
// Le fallback permet d'éviter un crash si le module
// est exporté différemment.
//

const ovlcmd =
    ovlModule?.ovlcmd ||
    ovlModule?.Module ||
    (
        typeof ovlModule === "function"
            ? ovlModule
            : null
    );


if (
    typeof ovlcmd !== "function"
) {

    throw new TypeError(
        "❌ NeoAIchat.js : ovlcmd est introuvable ou n'est pas une fonction."
    );

}


//==============================================================
// 🧠 IMPORT NEO AI
//==============================================================

const {

    neoAnalyserTexteBase,

    neoRechercherMot,

    neoRechercherTexte,

    neoTrouverSynonymes,

    neoTrouverAntonymes,

    neoConnaitMot,

    NEO_DICTIONNAIRES

} = require("../DataBase/NeoAI");


//==============================================================
// 🧠 SESSIONS DE TEST
//==============================================================

const neoAITests =
    new Map();


//==============================================================
// ⏱️ CONFIGURATION TIMEOUT
//==============================================================

const NEOAI_TIMEOUT =
    5 * 60 * 1000;


//==============================================================
// 👤 RÉCUPÉRER LE JID
//==============================================================

function obtenirJidNeoAI(ms) {

    if (!ms) {
        return null;
    }

    return (
        ms?.sender ||
        ms?.key?.participant ||
        ms?.key?.remoteJid ||
        null
    );

}


//==============================================================
// ⏱️ DÉMARRER / RÉINITIALISER LE TIMER
//==============================================================

function demarrerTimeoutNeoAI(jid) {

    const session =
        neoAITests.get(jid);

    if (!session) {
        return;
    }


    //==========================================================
    // 🛑 ANCIEN TIMER
    //==========================================================

    if (session.timer) {

        clearTimeout(
            session.timer
        );

        session.timer = null;

    }


    //==========================================================
    // ⏱️ NOUVEAU TIMER
    //==========================================================

    session.timer =
        setTimeout(
            async () => {

                const sessionActuelle =
                    neoAITests.get(jid);


                if (!sessionActuelle) {
                    return;
                }


                //================================================
                // 🧹 SUPPRESSION
                //================================================

                neoAITests.delete(jid);


                console.log(
                    "⏱️ NEO AI → SESSION EXPIRÉE :",
                    jid
                );


                //================================================
                // 📤 MESSAGE
                //================================================

                try {

                    await sessionActuelle.ovl.sendMessage(

                        sessionActuelle.ms_org,

                        {

                            text:

                                "⏱️ *NEO AI🌀 — SESSION EXPIRÉE*\n\n" +

                                "Tu n'as envoyé aucun texte " +
                                "pendant 5 minutes.\n\n" +

                                "🧠 La session NeoAI a été arrêtée.\n\n" +

                                "👉 Utilise *+testNeoAI🌀* pour recommencer."

                        }

                    );

                } catch (error) {

                    console.error(
                        "❌ NEO AI → ERREUR TIMEOUT :",
                        error
                    );

                }

            },

            NEOAI_TIMEOUT
        );

}


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


    const motsConnus =
        analyse.motsConnus || [];


    const motsInconnus =
        analyse.motsInconnus || [];


    const categories =
        analyse.categories || [];


    let resume =
        "NeoAI comprend que : " +
        analyse.texte;


    resume +=
        "\n\n📚 Mots reconnus : " +
        motsConnus.length;


    resume +=
        "\n❓ Mots inconnus : " +
        motsInconnus.length;


    if (
        categories.length
    ) {

        resume +=
            "\n🏷️ Catégories détectées : " +
            categories.join(", ");

    }


    if (
        analyse.combat?.detecte
    ) {

        resume +=
            "\n🥊 Contexte combat détecté.";

    }


    return resume;

}


//==============================================================
// 🔍 ANALYSER LES MOTS
//==============================================================

function analyserMotsNeoAI(tokens = []) {

    const motsConnus = [];

    const motsInconnus = [];

    const categoriesTrouvees =
        new Set();


    for (
        const token of tokens
    ) {

        if (
            typeof token !== "string"
        ) {

            continue;

        }


        //======================================================
        // 🧹 NETTOYAGE
        //======================================================

        const mot =
            token
                .replace(
                    /^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu,
                    ""
                )
                .trim();


        if (!mot) {
            continue;
        }


        //======================================================
        // 🔎 RECHERCHE
        //======================================================

        const recherche =
            neoRechercherMot(
                mot
            );


        if (
            recherche?.trouve
        ) {

            motsConnus.push({

                mot,

                categorie:
                    recherche.categorie,

                sousCategorie:
                    recherche.sousCategorie || null,

                valeur:
                    recherche.valeur ?? mot

            });


            if (
                recherche.categorie
            ) {

                categoriesTrouvees.add(
                    recherche.categorie
                );

            }

        } else {

            motsInconnus.push(
                mot
            );

        }

    }


    return {

        motsConnus,

        motsInconnus,

        categories:
            [...categoriesTrouvees]

    };

}


//==============================================================
// 🥊 ANALYSE COMBAT
//==============================================================

function analyserCombatNeoAI(texte = "") {

    const resultat =
        neoRechercherTexte(
            texte,
            "NEO_COMBAT"
        );


    if (
        !resultat?.trouve
    ) {

        return {

            detecte: false,

            elements: []

        };

    }


    return {

        detecte: true,

        elements:
            resultat.elements || []

    };

}


//==============================================================
// 🔗 ANALYSE SYNONYMES
//==============================================================

function analyserSynonymesNeoAI(
    motsConnus = []
) {

    const resultat = [];


    for (
        const element of motsConnus
    ) {

        const synonymes =
            neoTrouverSynonymes(
                element.mot
            );


        if (
            synonymes?.length
        ) {

            resultat.push({

                mot:
                    element.mot,

                synonymes

            });

        }

    }


    return resultat;

}


//==============================================================
// 🔄 ANALYSE ANTONYMES
//==============================================================

function analyserAntonymesNeoAI(
    motsConnus = []
) {

    const resultat = [];


    for (
        const element of motsConnus
    ) {

        const antonymes =
            neoTrouverAntonymes(
                element.mot
            );


        if (
            antonymes?.length
        ) {

            resultat.push({

                mot:
                    element.mot,

                antonymes

            });

        }

    }


    return resultat;

}


//==============================================================
// 🧠 ANALYSE COMPLÈTE NEO AI
//==============================================================

function analyserNeoAI(texte = "") {

    //==========================================================
    // 📖 ANALYSE BASE
    //==========================================================

    const analyseBase =
        neoAnalyserTexteBase(
            texte
        );


    //==========================================================
    // 🔎 MOTS
    //==========================================================

    const analyseMots =
        analyserMotsNeoAI(
            analyseBase.tokens || []
        );


    //==========================================================
    // 🥊 COMBAT
    //==========================================================

    const combat =
        analyserCombatNeoAI(
            analyseBase.texte
        );


    //==========================================================
    // 🔗 SYNONYMES
    //==========================================================

    const synonymes =
        analyserSynonymesNeoAI(
            analyseMots.motsConnus
        );


    //==========================================================
    // 🔄 ANTONYMES
    //==========================================================

    const antonymes =
        analyserAntonymesNeoAI(
            analyseMots.motsConnus
        );


    //==========================================================
    // 📦 RÉSULTAT
    //==========================================================

    const resultat = {

        valid: true,

        langue:
            analyseBase.langue,

        texte:
            analyseBase.texte,

        texteMinuscule:
            analyseBase.texteMinuscule,

        texteSansAccents:
            analyseBase.texteSansAccents,

        phrases:
            analyseBase.phrases,

        mots:
            analyseBase.tokens,

        nombreMots:
            analyseBase.nombreMots,

        nombrePhrases:
            analyseBase.nombrePhrases,

        //======================================================
        // 📚 DICTIONNAIRES
        //======================================================

        motsConnus:
            analyseMots.motsConnus,

        motsInconnus:
            analyseMots.motsInconnus,

        categories:
            analyseMots.categories,

        //======================================================
        // 🥊 COMBAT
        //======================================================

        combat,

        //======================================================
        // 🔗 RELATIONS
        //======================================================

        synonymes,

        antonymes

    };


    //==========================================================
    // 📝 RÉSUMÉ
    //==========================================================

    resultat.resume =
        construireResumeNeoAI(
            resultat
        );


    return resultat;

}


//==============================================================
// 🎮 COMMANDE +testNeoAI🌀
//==============================================================

ovlcmd({

    nom_cmd:
        "testNeoAI🌀",

    classe:
        "NeoAI🧠",

    react:
        "🧠",

    desc:
        "Teste la compréhension linguistique de NeoAI"

}, async (

    ms_org,

    ovl,

    {
        ms
    }

) => {

    //==========================================================
    // 👤 JID
    //==========================================================

    const jid =
        obtenirJidNeoAI(ms);


    if (!jid) {

        return;

    }


    //==========================================================
    // 🧹 ANCIENNE SESSION
    //==========================================================

    const ancienneSession =
        neoAITests.get(jid);


    if (ancienneSession?.timer) {

        clearTimeout(
            ancienneSession.timer
        );

    }


    neoAITests.delete(jid);


    //==========================================================
    // 🧠 NOUVELLE SESSION
    //==========================================================

    neoAITests.set(

        jid,

        {

            actif: true,

            timestamp:
                Date.now(),

            timer:
                null,

            ovl,

            ms_org

        }

    );


    //==========================================================
    // ⏱️ TIMER
    //==========================================================

    demarrerTimeoutNeoAI(
        jid
    );


    //==========================================================
    // 👋 ACCUEIL
    //==========================================================

    await ovl.sendMessage(

        ms_org,

        {

            image: {

                url:
                    "https://files.catbox.moe/6s72pg.jpg"

            },

            caption:

                "🧠 *NEO AI🌀* 👋🏻\n\n" +

                "🙂 Bonjour ! Je suis *NeoAI*, " +

                "le moteur linguistique de NEO.\n\n" +

                "📖 Je vais analyser ton texte " +

                "et parcourir ma base de connaissances " +

                "pour essayer d'en comprendre " +

                "les mots, les actions et le contexte.\n\n" +

                "🥊 Je peux également reconnaître " +

                "les termes liés au combat.\n\n" +

                "✍️ *Envoie maintenant le texte à analyser :*\n\n" +

                "Exemple :\n\n" +

                "🌀: Maki esquive le coup de poing " +

                "de Tobirama puis riposte avec un crochet."

        },

        {

            quoted:
                ms

        }

    );

});


//==============================================================
// 🌀 TRAITEMENT DES TEXTES NEO AI
//==============================================================

async function traiterMessageNeoAI(

    ovl,

    ms,

    texte = ""

) {

    //==========================================================
    // 👤 JID
    //==========================================================

    const jid =
        obtenirJidNeoAI(ms);


    if (!jid) {

        return false;

    }


    //==========================================================
    // 🔎 SESSION
    //==========================================================

    const session =
        neoAITests.get(jid);


    if (!session) {

        return false;

    }


    //==========================================================
    // ⏱️ EXPIRATION
    //==========================================================

    if (

        Date.now() -
        session.timestamp >
        NEOAI_TIMEOUT

    ) {

        if (session.timer) {

            clearTimeout(
                session.timer
            );

        }


        neoAITests.delete(
            jid
        );


        return false;

    }


    //==========================================================
    // 🔎 EXTRACTION 🌀:
    //==========================================================

    const texteAnalyse =
        extraireTexteNeoAI(
            texte
        );


    if (!texteAnalyse) {

        return false;

    }


    //==========================================================
    // 🔄 TIMER
    //==========================================================

    session.timestamp =
        Date.now();


    demarrerTimeoutNeoAI(
        jid
    );


    //==========================================================
    // 📥 LOG
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
                "🔎 *Je parcours mon dictionnaire...*"

        },

        {

            quoted:
                ms

        }

    );


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
                "❇️ *Je construis ma compréhension...*"

        },

        {

            quoted:
                ms

        }

    );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                10000
            )
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


        if (session.timer) {

            clearTimeout(
                session.timer
            );

        }


        neoAITests.delete(
            jid
        );


        return true;

    }


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

        "🧠 *NEO AI🌀 — ANALYSE TERMINÉE*\n\n" +

        "📝 *Résumé :*\n\n" +

        resultat.resume +

        "\n\n" +

        "📚 *MOTS RECONNUS :*\n\n" +

        (
            resultat.motsConnus.length

                ? resultat.motsConnus
                    .map(
                        m =>
                            `• ${m.mot} → ${m.categorie}` +
                            (
                                m.sousCategorie
                                    ? ` → ${m.sousCategorie}`
                                    : ""
                            )
                    )
                    .join("\n")

                : "Aucun"
        ) +

        "\n\n" +

        "❓ *MOTS INCONNUS :*\n\n" +

        (
            resultat.motsInconnus.length

                ? resultat.motsInconnus.join(", ")

                : "Aucun"
        ) +

        "\n\n" +

        "🥊 *COMBAT :*\n\n" +

        (
            resultat.combat.detecte
                ? "Détecté"
                : "Non détecté"
        ) +

        "\n\n" +

        "📦 *JSON COMPRÉHENSION :*\n\n" +

        "```json\n" +

        json +

        "\n```";


    //==========================================================
    // 📤 ENVOI
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
    // ⏱️ TIMER APRÈS ANALYSE
    //==========================================================

    const sessionFinale =
        neoAITests.get(jid);


    if (sessionFinale) {

        sessionFinale.timestamp =
            Date.now();


        demarrerTimeoutNeoAI(
            jid
        );

    }


    console.log(
        "✅ NEO AI → ANALYSE TERMINÉE"
    );


    return true;

}


//==============================================================
// 🛑 COMMANDE +stopNeo🌀
//==============================================================

ovlcmd({

    nom_cmd:
        "stopNeo🌀",

    classe:
        "NeoAI🧠",

    react:
        "🛑",

    desc:
        "Arrête la session de test NeoAI"

}, async (

    ms_org,

    ovl,

    {
        ms
    }

) => {

    //==========================================================
    // 👤 JID
    //==========================================================

    const jid =
        obtenirJidNeoAI(ms);


    if (!jid) {

        return;

    }


    //==========================================================
    // 🔎 SESSION
    //==========================================================

    const session =
        neoAITests.get(jid);


    if (!session) {

        await ovl.sendMessage(

            ms_org,

            {

                text:
                    "ℹ️ *Aucune session NeoAI active.*"

            },

            {

                quoted:
                    ms

            }

        );

        return;

    }


    //==========================================================
    // 🛑 TIMER
    //==========================================================

    if (session.timer) {

        clearTimeout(
            session.timer
        );

    }


    //==========================================================
    // 🧹 SESSION
    //==========================================================

    neoAITests.delete(
        jid
    );


    //==========================================================
    // 📤 CONFIRMATION
    //==========================================================

    await ovl.sendMessage(

        ms_org,

        {

            text:

                "🛑 *NEO AI🌀 — SESSION ARRÊTÉE*\n\n" +

                "La session NeoAI a été arrêtée.\n\n" +

                "👉 Utilise *+testNeoAI🌀* pour recommencer."

        },

        {

            quoted:
                ms

        }

    );


    console.log(
        "🛑 NEO AI → SESSION ARRÊTÉE :",
        jid
    );

});


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    traiterMessageNeoAI,

    analyserNeoAI,

    extraireTexteNeoAI

};
