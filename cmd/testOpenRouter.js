const axios = require("axios");
const { ovlcmd } = require("../lib/ovlcmd");

const {
    openRouterChat,
    neoOpenRouterEstConfigure
} = require("./OpenRouterNeoAI");

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║              OPENROUTER TEST COMMAND               ║
 * ║                     ÉTAPE 5                        ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Objectif :
 * Tester OpenRouter directement avec un pavé utilisateur.
 *
 * IMPORTANT :
 * - Aucun NEOAI
 * - Aucun Ollama
 * - Aucun Gemini direct
 * - Aucun AllstarsEngine
 * - Aucun parser
 *
 * OpenRouter reçoit simplement le texte et retourne
 * la réponse du modèle sélectionné.
 */

const {
    openRouterChat,
    neoOpenRouterEstConfigure
} = require("../cmd/NeoAI-OpenRouter");


//==============================================================
// 🧪 COMMANDE TEST OPENROUTER
//==============================================================

ovlcmd({
    nom_cmd: "testOpenRouter",
    classe: "ai",
    react: "🤖",
    desc: "Teste OpenRouter avec un pavé"
}, async (message, match) => {

    try {

        //==========================================================
        // 🔐 VÉRIFICATION CONFIGURATION
        //==========================================================

        if (!neoOpenRouterEstConfigure()) {

            return await message.reply(
                "❌ *OPENROUTER NON CONFIGURÉ*\n\n" +
                "La variable `OPENROUTER_API_KEY` est absente."
            );
        }


        //==========================================================
        // 📝 RÉCUPÉRATION DU PAVÉ
        //==========================================================

        const pave = String(match || "").trim();


        if (!pave) {

            return await message.reply(
                "🤖 *TEST OPENROUTER*\n\n" +
                "Utilisation :\n" +
                "`+testOpenRouter Ton pavé ici`\n\n" +
                "Exemple :\n" +
                "`+testOpenRouter Yamato fonce vers Naruto sur 5m.`"
            );
        }


        //==========================================================
        // ⏳ MESSAGE D'ATTENTE
        //==========================================================

        await message.reply(
            "🤖 *OPENROUTER*\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🧠 Analyse du pavé en cours..."
        );


        //==========================================================
        // 🚀 APPEL OPENROUTER
        //==========================================================

        const resultat = await openRouterChat(
            [
                {
                    role: "system",
                    content:
                        "Tu es une IA de test. " +
                        "Réponds uniquement au texte reçu. " +
                        "Explique clairement ce que tu comprends."
                },
                {
                    role: "user",
                    content: pave
                }
            ],
            {
                temperature: 0
            }
        );


        //==========================================================
        // 📊 RÉCUPÉRATION RÉPONSE
        //==========================================================

        const reponse =
            String(resultat.response || "").trim();

        const modele =
            resultat.model ||
            resultat.primaryModel ||
            "inconnu";


        //==========================================================
        // 📤 RÉSULTAT
        //==========================================================

        await message.reply(
            "🤖 *OPENROUTER*\n" +
            "━━━━━━━━━━━━━━━━━━\n\n" +

            "📝 *PAVÉ REÇU :*\n" +
            pave +
            "\n\n" +

            "🧠 *MODÈLE :*\n" +
            modele +
            "\n\n" +

            "💬 *RÉPONSE :*\n" +
            reponse
        );


        console.log(
            "✅ OpenRouter test réussi | modèle :",
            modele
        );

    } catch (error) {

        console.error(
            "❌ Erreur test OpenRouter :",
            error
        );

        await message.reply(
            "❌ *ERREUR OPENROUTER*\n\n" +
            String(error.message || error)
        );
    }
});
