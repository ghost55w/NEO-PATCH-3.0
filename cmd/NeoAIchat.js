//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
//==============================================================
//
// NeoAIchat.js
//
// Rôle :
// - Lance une session de test avec +testNeoAI🌀
// - Attend un texte commençant par 🌀:
// - Parcourt les dictionnaires de NeoAI.js
// - Identifie les mots connus
// - Identifie les catégories linguistiques
// - Identifie les termes de combat
// - Détecte les synonymes / antonymes disponibles
// - Analyse le contexte de base
// - Affiche d'abord le résumé
// - Puis le JSON de compréhension
//
// NeoAIchat.js = MOTEUR DE TEST
// NeoAI.js     = BASE DE CONNAISSANCES
//
//==============================================================


const ovlcmd = require("../lib/ovlcmd");


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

} = require("./NeoAI");


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
// ⏱️ DÉMARRER / RÉINITIALISER LE TIMER
//==============================================================

function demarrerTimeoutNeoAI(
    jid
) {

    const session =
        neoAITests.get(
            jid
        );


    if (!session) {

        return;

    }


    //==========================================================
    // 🛑 SUPPRIMER ANCIEN TIMER
    //==========================================================

    if (
        session.timer
    ) {

        clearTimeout(
            session.timer
        );

    }


    //==========================================================
    // ⏱️ NOUVEAU TIMER 5 MINUTES
    //==========================================================

    session.timer =
        setTimeout(

            async () => {

                const sessionActuelle =
                    neoAITests.get(
                        jid
                    );


                if (!sessionActuelle) {

                    return;

                }


                //================================================
                // 🧹 SUPPRIMER SESSION
                //================================================

                neoAITests.delete(
                    jid
                );


                console.log(
                    "⏱️ NEO AI → SESSION EXPIRÉE :",
                    jid
                );


                //================================================
                // 📤 MESSAGE EXPIRATION
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

function extraireTexteNeoAI(
    texte = ""
) {

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

function construireResumeNeoAI(
    analyse
) {

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
// 🔍 ANALYSER LES MOTS DU TEXTE
//==============================================================

function analyserMotsNeoAI(
    tokens = []
) {

    const motsConnus = [];

    const motsInconnus = [];

    const categoriesTrouvees =
        new Set();


    for (
        const token of tokens
    ) {

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
        // 🔎 RECHERCHE DANS NEOAI.JS
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
                    recherche.valeur || mot

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

function analyserCombatNeoAI(
    texte = ""
) {

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
// 🔗 ANALYSE DES SYNONYMES
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
// 🔄 ANALYSE DES ANTONYMES
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

function analyserNeoAI(
    texte = ""
) {

    //==========================================================
    // 📖 ANALYSE LINGUISTIQUE DE BASE
    //==========================================================

    const analyseBase =
        neoAnalyserTexteBase(
            texte
        );


    //==========================================================
    // 🔎 RECHERCHE DES MOTS
    //==========================================================

    const analyseMots =
        analyserMotsNeoAI(
            analyseBase.tokens
        );


    //==========================================================
    // 🥊 RECHERCHE COMBAT
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
    // 📦 RÉSULTAT FINAL
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
        // 🔗 RELATIONS LINGUISTIQUES
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

ovlcmd(

    {

        nom_cmd:
            "testNeoAI🌀",

        classe:
            "NeoAI🧠",

        react:
            "🧠",

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
        // 🧹 SUPPRIMER ANCIENNE SESSION
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

                actif:
                    true,

                timestamp:
                    Date.now(),

                timer:
                    null,

                ovl,

                ms_org

            }

        );


        //======================================================
        // ⏱️ DÉMARRER TIMER 5 MINUTES
        //======================================================

        demarrerTimeoutNeoAI(
            jid
        );


        //======================================================
        // 👋 ACCUEIL NEO AI — IMAGE + CAPTION
        //======================================================

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
    // 👤 IDENTIFICATION
    //==========================================================

    const jid =

        ms?.sender ||

        ms?.key?.participant ||

        ms?.key?.remoteJid;


    //==========================================================
    // 🔎 SESSION
    //==========================================================

    const session =
        neoAITests.get(
            jid
        );


    if (!session) {

        return false;

    }


    //==========================================================
    // ⏱️ EXPIRATION
    //==========================================================

    const expiration =
        5 * 60 * 1000;


    if (

        Date.now() -
        session.timestamp >
        expiration

    ) {

        if (
            session.timer
        ) {

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
    // 🔎 PRÉFIXE 🌀:
    //==========================================================

    const texteAnalyse =
        extraireTexteNeoAI(
            texte
        );


    if (!texteAnalyse) {

        return false;

    }


    //==========================================================
    // 🔄 RÉINITIALISER LE TIMER
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


        if (
            session.timer
        ) {

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
    // 📤 ENVOYER
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
    // ⏱️ RÉINITIALISER LE TIMER APRÈS ANALYSE
    //==========================================================

    const sessionFinale =
        neoAITests.get(
            jid
        );


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

ovlcmd(

    {

        nom_cmd:
            "stopNeo🌀",

        classe:
            "NeoAI🧠",

        react:
            "🛑",

        desc:
            "Arrête la session de test NeoAI"

    },


    async (

        ms_org,

        ovl,

        {

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
        // 🔎 RECHERCHER LA SESSION
        //======================================================

        const session =
            neoAITests.get(
                jid
            );


        //======================================================
        // ℹ️ AUCUNE SESSION
        //======================================================

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


        //======================================================
        // 🛑 ARRÊTER LE TIMER
        //======================================================

        if (
            session.timer
        ) {

            clearTimeout(
                session.timer
            );

        }


        //======================================================
        // 🧹 SUPPRIMER LA SESSION
        //======================================================

        neoAITests.delete(
            jid
        );


        //======================================================
        // 📤 CONFIRMATION
        //======================================================

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


        //======================================================
        // 📊 LOG
        //======================================================

        console.log(
            "🛑 NEO AI → SESSION ARRÊTÉE :",
            jid
        );

    }

);


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    traiterMessageNeoAI,

    analyserNeoAI,

    extraireTexteNeoAI

};
