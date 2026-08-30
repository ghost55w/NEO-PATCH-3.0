//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
//==============================================================
//
// NeoAIchat.js
//
// RÔLE :
// - Lance une session avec +testNeoAI🌀
// - Charge NeoAI pendant 30 secondes
// - Envoie l'image de présentation
// - Attend un texte commençant par 🌀
// - Analyse le texte avec NeoAI.js
// - Affiche un résumé narratif
// - Affiche le JSON complet
//
//==============================================================

const { ovlcmd } = require("../lib/ovlcmd");
const path = require("path");
console.log("🧠 NEO AI CHAT CHARGÉ !");

//==============================================================
// 🧠 IMPORT NEO AI
//==============================================================

const NeoAI = require(
    path.join(__dirname, "../DataBase/NeoAI")
);


//==============================================================
// 🖼️ IMAGE NEO AI
//==============================================================
//
// Mets ton URL d'image ici.
//
// Exemple :
// const NEOAI_IMAGE_URL = "https://files.catbox.moe/xxxx.jpg";
//
//==============================================================

const NEOAI_IMAGE_URL =
     "https://files.catbox.moe/6s72pg.jpg";


//==============================================================
// ⏱️ UTILITAIRE ATTENTE
//==============================================================

const sleep = ms =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    );


//==============================================================
// 🧹 EXTRAIRE TEXTE MESSAGE
//==============================================================

function extraireTexteMessage(reply) {

    if (!reply) {
        return "";
    }

    return (

        reply.message?.extendedTextMessage?.text ||

        reply.message?.conversation ||

        reply.body ||

        ""

    ).trim();

}


//==============================================================
// 🧠 ANALYSE LEXICALE NEO AI
//==============================================================

function analyserTexteNeoAI(texte = "") {

    const normalise =
        NeoAI.neoNormaliserTexte(
            texte
        );

    const sansAccents =
        NeoAI.neoSansAccents(
            texte
        );

    const tokens =
        NeoAI.neoTokeniser(
            texte
        );

    const phrases =
        NeoAI.neoDecouperPhrases(
            texte
        );


    //==========================================================
    // 🔎 RECHERCHE DES MOTS
    //==========================================================

    const recherches =
        NeoAI.neoRechercherTexte(
            texte
        );


    const connus = [];

    const inconnus = [];


    for (const resultat of recherches) {

        if (resultat.trouve) {

            connus.push({
                mot: resultat.mot,
                motNormalise: resultat.motNormalise,
                categories: resultat.categories
            });

        } else {

            inconnus.push(
                resultat.mot
            );

        }

    }


    //==========================================================
    // 🔗 SYNONYMES
    //==========================================================

    const synonymes = [];

    for (const mot of tokens) {

        const resultat =
            NeoAI.neoTrouverSynonymes(
                mot,
                "fr"
            );

        if (resultat.trouve) {

            synonymes.push({

                mot,

                motPrincipal:
                    resultat.motPrincipal,

                synonymes:
                    resultat.synonymes

            });

        }

    }


    //==========================================================
    // 🔄 ANTONYMES
    //==========================================================

    const antonymes = [];

    for (const mot of tokens) {

        const resultat =
            NeoAI.neoTrouverAntonymes(
                mot,
                "fr"
            );

        if (resultat.trouve) {

            antonymes.push({

                mot,

                motPrincipal:
                    resultat.motPrincipal,

                antonymes:
                    resultat.antonymes

            });

        }

    }


    //==========================================================
    // 🥊 CONTEXTE COMBAT
    //==========================================================

    let contexteCombat = false;

    const combatMots = [];


    for (const mot of tokens) {

        const resultat =
            NeoAI.neoChercherMotDansCategorie(
                mot,
                NeoAI.NEO_COMBAT
            );


        if (resultat.trouve) {

            contexteCombat = true;

            combatMots.push({

                mot,

                chemin:
                    resultat.chemin

            });

        }

    }


    //==========================================================
    // ⚡ VITESSE
    //==========================================================

    let vitesse = null;

    for (const niveau of Object.keys(
        NeoAI.NEO_VITESSE
    )) {

        const mots =
            NeoAI.NEO_VITESSE[
                niveau
            ];

        for (const element of mots) {

            const recherche =
                NeoAI.neoSansAccents(
                    element
                );

            if (
                sansAccents.includes(
                    recherche
                )
            ) {

                vitesse = niveau;

                break;

            }

        }

        if (vitesse) break;

    }


    //==========================================================
    // 🧭 DIRECTIONS
    //==========================================================

    const directions = [];

    for (const mot of tokens) {

        const resultat =
            NeoAI.neoChercherMotDansCategorie(
                mot,
                NeoAI.NEO_DIRECTIONS
            );

        if (resultat.trouve) {

            directions.push(mot);

        }

    }


    //==========================================================
    // 🧍 PARTIES DU CORPS
    //==========================================================

    const partiesCorps = [];

    for (const mot of tokens) {

        const resultat =
            NeoAI.neoChercherMotDansCategorie(
                mot,
                NeoAI.NEO_PARTIES_CORPS
            );

        if (resultat.trouve) {

            partiesCorps.push(mot);

        }

    }


    //==========================================================
    // 🔗 CONNECTEURS
    //==========================================================

    const connecteurs = {

        succession: [],

        simultaneite: [],

        condition: [],

        opposition: []

    };


    for (
        const type of Object.keys(
            NeoAI.NEO_CONNECTEURS
        )
    ) {

        for (
            const connecteur
            of NeoAI.NEO_CONNECTEURS[type]
        ) {

            if (
                sansAccents.includes(
                    NeoAI.neoSansAccents(
                        connecteur
                    )
                )
            ) {

                connecteurs[type].push(
                    connecteur
                );

            }

        }

    }


    //==========================================================
    // 📝 RÉSUMÉ NARRATIF
    //==========================================================

    let resume = texte;

    if (phrases.length > 0) {

        resume =
            phrases.join(" ");

    }


    //==========================================================
    // 📦 JSON FINAL
    //==========================================================

    return {

        texteOriginal: texte,

        texteNormalise: normalise,

        tokens,

        phrases,

        mots: {

            total:
                tokens.length,

            connus,

            inconnus

        },

        synonymes,

        antonymes,

        contexte: {

            combat:
                contexteCombat,

            combatMots,

            vitesse,

            directions: [
                ...new Set(
                    directions
                )
            ],

            partiesCorps: [
                ...new Set(
                    partiesCorps
                )
            ],

            connecteurs

        },

        resume

    };

}


//==============================================================
// 📝 CRÉER LE RÉSUMÉ NARRATIF
//==============================================================

function creerResumeNarratif(
    resultat
) {

    const contexte =
        resultat.contexte;

    const mots =
        resultat.mots;


    let resume =
        `🧠 *Résumé de NeoAI*\n\n`;


    resume +=
        `NeoAI a analysé un texte de *${mots.total} mot(s)*.\n\n`;


    if (
        contexte.combat
    ) {

        resume +=
            `🥊 *Contexte détecté :* combat\n`;

    } else {

        resume +=
            `📖 *Contexte détecté :* général\n`;

    }


    if (
        contexte.vitesse
    ) {

        resume +=
            `⚡ *Vitesse :* ${contexte.vitesse}\n`;

    }


    if (
        contexte.directions.length
    ) {

        resume +=
            `🧭 *Direction :* ` +
            contexte.directions.join(", ") +
            `\n`;

    }


    if (
        contexte.partiesCorps.length
    ) {

        resume +=
            `🧍 *Parties du corps :* ` +
            contexte.partiesCorps.join(", ") +
            `\n`;

    }


    if (
        contexte.connecteurs.succession.length
    ) {

        resume +=
            `🔗 *Succession :* ` +
            contexte.connecteurs.succession.join(", ") +
            `\n`;

    }


    resume +=
        `\n📜 *Narration :*\n`;

    resume +=
        `${resultat.resume}`;


    if (
        mots.inconnus.length
    ) {

        resume +=
            `\n\n⚠️ *Mots inconnus :* ` +
            [
                ...new Set(
                    mots.inconnus
                )
            ].join(", ");

    }


    return resume;

}


//==============================================================
// 🧪 COMMANDE TEST NEO AI
//==============================================================

ovlcmd({
    nom_cmd: "testNeoAI🌀",
    react: "🧠",
    classe: "NEO_AI"
}, async (
    ms_org,
    ovl,
    {
        auteur_Message,
        repondre
    }
) => {

    try {


        //======================================================
        // 🔎 CHARGEMENT NEO AI
        //======================================================

        let chargement =
            "🧠🔎 chargement de NeoAI.";

        const messageChargement =
            await repondre(
                chargement
            );


        //======================================================
        // ⏱️ 30 SECONDES
        //======================================================

        const duree =
            30000;

        const debut =
            Date.now();


        let etape = 0;


        while (
            Date.now() - debut <
            duree
        ) {

            await sleep(5000);

            etape++;


            if (
                etape === 1
            ) {

                chargement =
                    "🧠🔎 chargement de NeoAI..";

            }

            else if (
                etape === 2
            ) {

                chargement =
                    "🧠🔎 chargement de NeoAI....";

            }

            else {

                chargement =
                    "🧠🔎 chargement de NeoAI.";

            }


            try {

                if (
                    messageChargement?.key
                ) {

                    await ovl.sendMessage(
                        ms_org,
                        {
                            text: chargement
                        },
                        {
                            edit:
                                messageChargement.key
                        }
                    );

                }

            } catch {

                // Si l'édition échoue,
                // on continue quand même.

            }

        }


        //======================================================
        // 🧠 NEO AI PRÊT
        //======================================================

        await repondre(
            "🧠🌀 NeoAI est prêt..."
        );


        //======================================================
        // 🖼️ IMAGE + MESSAGE
        //======================================================

        const pseudo =
            `@${String(
                auteur_Message
            ).split("@")[0]}`;


        const caption =
`😄 Salut ${pseudo}, je suis NeoAI 🧠👋🏻

Tu peux envoyer le text à Analyser....

🌀: ton text ici`;



        //======================================================
        // 🖼️ SI IMAGE CONFIGURÉE
        //======================================================

        if (
            NEOAI_IMAGE_URL
        ) {

            await ovl.sendMessage(
                ms_org,
                {

                    image: {
                        url:
                            NEOAI_IMAGE_URL
                    },

                    caption,

                    mentions: [
                        auteur_Message
                    ]

                }
            );

        } else {

            await repondre(
                caption
            );

        }


        //======================================================
        // 🔄 SESSION D'ATTENTE
        //======================================================

        const startTime =
            Date.now();

        const timeout =
            60000;


        while (
            Date.now() - startTime <
            timeout
        ) {


            const reply =
                await ovl.recup_msg({

                    auteur:
                        auteur_Message,

                    ms_org,

                    temps:
                        timeout -
                        (
                            Date.now() -
                            startTime
                        )

                });


            if (
                !reply ||
                !reply.message
            ) {

                break;

            }


            const body =
                extraireTexteMessage(
                    reply
                );


            if (!body) {

                continue;

            }


            //==================================================
            // ❌ CLOSE
            //==================================================

            if (
                body
                    .trim()
                    .toLowerCase() ===
                "close"
            ) {

                await repondre(
                    "✅ Session NeoAI fermée."
                );

                break;

            }


            //==================================================
            // 🌀 LE MESSAGE DOIT COMMENCER PAR 🌀
            //==================================================

            if (
                !body
                    .trim()
                    .startsWith("🌀")
            ) {

                continue;

            }


            //==================================================
            // ✂️ EXTRACTION DU TEXTE
            //==================================================

            const texte =
                body
                    .replace(
                        /^🌀\s*:?\s*/i,
                        ""
                    )
                    .trim();


            if (!texte) {

                await repondre(
                    "⚠️ *NeoAI n'a reçu aucun texte à analyser.*"
                );

                continue;

            }


            //==================================================
            // 🧠 RÉACTION
            //==================================================

            try {

                await ovl.sendMessage(
                    ms_org,
                    {
                        react: {
                            text: "🧠",
                            key: reply.key
                        }
                    }
                );

            } catch {

                // Pas bloquant.

            }


            //==================================================
            // 🔍 ANALYSE 20 SECONDES
            //======================================================

            let analyseMsg =
                await repondre(
                    "🔍🧠 Analyse du text."
                );


            await sleep(7000);


            try {

                if (
                    analyseMsg?.key
                ) {

                    await ovl.sendMessage(
                        ms_org,
                        {
                            text:
                                "🔍🧠 Analyse du text.."
                        },
                        {
                            edit:
                                analyseMsg.key
                        }
                    );

                }

            } catch {}


            await sleep(7000);


            try {

                if (
                    analyseMsg?.key
                ) {

                    await ovl.sendMessage(
                        ms_org,
                        {
                            text:
                                "🔍🧠 Analyse du text...."
                        },
                        {
                            edit:
                                analyseMsg.key
                        }
                    );

                }

            } catch {}


            await sleep(6000);


            //==================================================
            // ✳️ PRÉPARATION
            //==================================================

            try {

                if (
                    analyseMsg?.key
                ) {

                    await ovl.sendMessage(
                        ms_org,
                        {
                            text:
                                "🧠✳️ Preparation du résultat..."
                        },
                        {
                            edit:
                                analyseMsg.key
                        }
                    );

                } else {

                    await repondre(
                        "🧠✳️ Preparation du résultat..."
                    );

                }

            } catch {

                await repondre(
                    "🧠✳️ Preparation du résultat..."
                );

            }


            //==================================================
            // 🧠 ANALYSE NEO AI
            //==================================================

            const resultat =
                analyserTexteNeoAI(
                    texte
                );


            //==================================================
            // 📜 RÉSUMÉ NARRATIF
            //==================================================

            const resume =
                creerResumeNarratif(
                    resultat
                );


            await repondre(
                resume
            );


            //==================================================
            // 📦 JSON
            //==================================================

            const json =
                JSON.stringify(
                    resultat,
                    null,
                    2
                );


            await repondre(
                "```json\n" +
                json +
                "\n```"
            );


            //==================================================
            // 🔄 ON ATTEND UN NOUVEAU TEXTE
            //==================================================

        }


    } catch (err) {

        console.log(
            "NEO AI CHAT ERROR:",
            err
        );

    }

});
