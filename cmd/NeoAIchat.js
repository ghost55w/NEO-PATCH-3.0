//==============================================================
// 🧠 NEO AI CHAT — TESTEUR LINGUISTIQUE
//==============================================================

const { ovlcmd } = require("../lib/ovlcmd");

// 🧠 BASE NEO AI
const NeoAI = require("../DataBase/NeoAI");


//==============================================================
// 🖼️ IMAGE NEO AI
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

    if (!reply) return "";

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
        NeoAI.neoNormaliserTexte(texte);

    const sansAccents =
        NeoAI.neoSansAccents(texte);

    const tokens =
        NeoAI.neoTokeniser(texte);

    const phrases =
        NeoAI.neoDecouperPhrases(texte);


    //==========================================================
    // 🔎 RECHERCHE DES MOTS
    //==========================================================

    const recherches =
        NeoAI.neoRechercherTexte(texte);

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

            inconnus.push(resultat.mot);

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

        if (resultat?.trouve) {

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

        if (resultat?.trouve) {

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

        if (resultat?.trouve) {

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

    if (NeoAI.NEO_VITESSE) {

        for (
            const niveau
            of Object.keys(NeoAI.NEO_VITESSE)
        ) {

            const mots =
                NeoAI.NEO_VITESSE[niveau];

            for (const element of mots) {

                const recherche =
                    NeoAI.neoSansAccents(element);

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

    }


    //==========================================================
    // 🧭 DIRECTIONS
    //==========================================================

    const directions = [];

    if (NeoAI.NEO_DIRECTIONS) {

        for (const mot of tokens) {

            const resultat =
                NeoAI.neoChercherMotDansCategorie(
                    mot,
                    NeoAI.NEO_DIRECTIONS
                );

            if (resultat?.trouve) {

                directions.push(mot);

            }

        }

    }


    //==========================================================
    // 🧍 PARTIES DU CORPS
    //==========================================================

    const partiesCorps = [];

    if (NeoAI.NEO_PARTIES_CORPS) {

        for (const mot of tokens) {

            const resultat =
                NeoAI.neoChercherMotDansCategorie(
                    mot,
                    NeoAI.NEO_PARTIES_CORPS
                );

            if (resultat?.trouve) {

                partiesCorps.push(mot);

            }

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

    if (NeoAI.NEO_CONNECTEURS) {

        for (
            const type
            of Object.keys(NeoAI.NEO_CONNECTEURS)
        ) {

            if (!connecteurs[type]) {
                connecteurs[type] = [];
            }

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

    }


    //==========================================================
    // 📝 RÉSUMÉ
    //==========================================================

    let resume = texte;

    if (phrases.length > 0) {
        resume = phrases.join(" ");
    }


    //==========================================================
    // 📦 RÉSULTAT
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
                ...new Set(directions)
            ],

            partiesCorps: [
                ...new Set(partiesCorps)
            ],

            connecteurs

        },

        resume

    };

}


//==============================================================
// 📝 RÉSUMÉ NARRATIF
//==============================================================

function creerResumeNarratif(resultat) {

    const contexte =
        resultat.contexte;

    const mots =
        resultat.mots;


    let resume =
        `🧠 *Résumé de NeoAI*\n\n`;


    resume +=
        `NeoAI a analysé un texte de *${mots.total} mot(s)*.\n\n`;


    if (contexte.combat) {

        resume +=
            `🥊 *Contexte détecté :* combat\n`;

    } else {

        resume +=
            `📖 *Contexte détecté :* général\n`;

    }


    if (contexte.vitesse) {

        resume +=
            `⚡ *Vitesse :* ${contexte.vitesse}\n`;

    }


    if (contexte.directions.length) {

        resume +=
            `🧭 *Direction :* ` +
            contexte.directions.join(", ") +
            `\n`;

    }


    if (contexte.partiesCorps.length) {

        resume +=
            `🧍 *Parties du corps :* ` +
            contexte.partiesCorps.join(", ") +
            `\n`;

    }


    if (contexte.connecteurs.succession.length) {

        resume +=
            `🔗 *Succession :* ` +
            contexte.connecteurs.succession.join(", ") +
            `\n`;

    }


    resume +=
        `\n📜 *Narration :*\n`;

    resume +=
        resultat.resume;


    if (mots.inconnus.length) {

        resume +=
            `\n\n⚠️ *Mots inconnus :* ` +
            [
                ...new Set(mots.inconnus)
            ].join(", ");

    }


    return resume;

}


//==============================================================
// 🧠 TRAITER MESSAGE NEO AI
//==============================================================
//
// Cette fonction est appelée directement par message_upsert.js
//
// Format attendu :
// 🌀: ton texte
//
//==============================================================

async function traiterMessageNeoAI(
    ovl,
    ms,
    texte
) {

    if (
        typeof texte !== "string" ||
        !/^\s*🌀\s*:/i.test(texte)
    ) {

        return false;

    }


    try {

        const ms_org =
            ms.key.remoteJid;


        const texteAnalyse =
            texte
                .replace(
                    /^\s*🌀\s*:\s*/i,
                    ""
                )
                .trim();


        if (!texteAnalyse) {

            await ovl.sendMessage(
                ms_org,
                {
                    text:
                        "⚠️ *NeoAI n'a reçu aucun texte à analyser.*"
                },
                {
                    quoted: ms
                }
            );

            return true;

        }


        //======================================================
        // 🔍 ANALYSE
        //======================================================

        let analyseMsg =
            await ovl.sendMessage(
                ms_org,
                {
                    text:
                        "🔍🧠 Analyse du text."
                },
                {
                    quoted: ms
                }
            );


        await sleep(7000);


        try {

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

        } catch {}


        await sleep(7000);


        try {

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

        } catch {}


        await sleep(6000);


        //======================================================
        // ✳️ PRÉPARATION
        //======================================================

        try {

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

        } catch {}


        //======================================================
        // 🧠 ANALYSE
        //======================================================

        const resultat =
            analyserTexteNeoAI(
                texteAnalyse
            );


        //======================================================
        // 📜 RÉSUMÉ
        //======================================================

        const resume =
            creerResumeNarratif(
                resultat
            );


        await ovl.sendMessage(
            ms_org,
            {
                text: resume
            },
            {
                quoted: ms
            }
        );


        //======================================================
        // 📦 JSON
        //======================================================

        const json =
            JSON.stringify(
                resultat,
                null,
                2
            );


        await ovl.sendMessage(
            ms_org,
            {
                text:
                    "```json\n" +
                    json +
                    "\n```"
            },
            {
                quoted: ms
            }
        );


        return true;

    } catch (err) {

        console.error(
            "❌ NEO AI TRAITEMENT ERROR:",
            err
        );

        return true;

    }

}


//==============================================================
// 🧪 COMMANDE TEST NEO AI
//==============================================================

ovlcmd({

    nom_cmd: "testNeoAI🌀",

    classe: "NEO_AI",

    react: "🧠",

    desc: "Tester la compréhension linguistique de NeoAI"

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
        // 🔎 CHARGEMENT
        //======================================================

        const messageChargement =
            await repondre(
                "🧠🔎 chargement de NeoAI."
            );


        //======================================================
        // ⏱️ ANIMATION
        //======================================================

        await sleep(5000);

        try {

            await ovl.sendMessage(
                ms_org,
                {
                    text:
                        "🧠🔎 chargement de NeoAI.."
                },
                {
                    edit:
                        messageChargement.key
                }
            );

        } catch {}


        await sleep(5000);

        try {

            await ovl.sendMessage(
                ms_org,
                {
                    text:
                        "🧠🔎 chargement de NeoAI...."
                },
                {
                    edit:
                        messageChargement.key
                }
            );

        } catch {}


        await sleep(5000);


        try {

            await ovl.sendMessage(
                ms_org,
                {
                    text:
                        "🧠🔎 chargement de NeoAI."
                },
                {
                    edit:
                        messageChargement.key
                }
            );

        } catch {}


        //======================================================
        // 🧠 PRÊT
        //======================================================

        await repondre(
            "🧠🌀 NeoAI est prêt..."
        );


        //======================================================
        // 🖼️ MESSAGE
        //======================================================

        const pseudo =
            `@${String(
                auteur_Message
            ).split("@")[0]}`;


        const caption =
`😄 Salut ${pseudo}, je suis NeoAI 🧠👋🏻

Tu peux envoyer le text à analyser....

🌀: ton text ici

Tape *close* pour fermer la session.`;


        if (NEOAI_IMAGE_URL) {

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
        // 🔄 SESSION
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


            if (!body) continue;


            //==================================================
            // ❌ CLOSE
            //==================================================

            if (
                body.trim().toLowerCase() ===
                "close"
            ) {

                await repondre(
                    "✅ Session NeoAI fermée."
                );

                break;

            }


            //==================================================
            // 🌀 TEXTE NEO AI
            //==================================================

            if (
                !/^\s*🌀\s*:/i.test(body)
            ) {

                continue;

            }


            //==================================================
            // ✂️ EXTRACTION
            //==================================================

            const texte =
                body
                    .replace(
                        /^\s*🌀\s*:\s*/i,
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

            } catch {}


            //==================================================
            // 🔍 ANALYSE
            //==================================================

            let analyseMsg =
                await repondre(
                    "🔍🧠 Analyse du text."
                );


            await sleep(7000);


            try {

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

            } catch {}


            await sleep(7000);


            try {

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

            } catch {}


            await sleep(6000);


            //==================================================
            // ✳️ PRÉPARATION
            //==================================================

            try {

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

            } catch {}


            //==================================================
            // 🧠 ANALYSE NEO AI
            //==================================================

            const resultat =
                analyserTexteNeoAI(
                    texte
                );


            //==================================================
            // 📜 RÉSUMÉ
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

            await repondre(
                "```json\n" +
                JSON.stringify(
                    resultat,
                    null,
                    2
                ) +
                "\n```"
            );

        }

    } catch (err) {

        console.error(
            "NEO AI CHAT ERROR:",
            err
        );

    }

});


//==============================================================
// 📤 EXPORT
//==============================================================

module.exports = {
    traiterMessageNeoAI,
    analyserTexteNeoAI,
    creerResumeNarratif
};
