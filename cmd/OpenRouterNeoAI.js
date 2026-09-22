/**
 * ╔══════════════════════════════════════════════════════╗
 * ║                    OPENROUTER                      ║
 * ║                  MODULE PRINCIPAL                  ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * ÉTAPE 3
 *
 * Objectif :
 *
 * Installer/configurer plusieurs IA via OpenRouter
 * avec un relais automatique entre les modèles.
 *
 * ORDRE ACTUEL :
 *
 * 1. GPT-5 Mini
 * 2. Claude Sonnet
 * 3. Gemini
 * 4. DeepSeek
 * 5. Qwen
 *
 * OpenRouter gère automatiquement le fallback
 * entre les modèles.
 *
 * Pour cette étape :
 *
 * - aucun fallback manuel dans le code
 * - aucune analyse de pavé
 * - aucune intégration avec outils.js
 * - aucune intégration avec AllstarsEngine.js
 * - aucune utilisation d'Ollama
 * - aucune logique NEOAI
 */


//==============================================================
// 🌐 OPENROUTER
//==============================================================

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";


//==============================================================
// 🔑 CLÉ API
//==============================================================

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || "";


//==============================================================
// 🌍 INFORMATIONS APPLICATION
//==============================================================

const OPENROUTER_SITE_URL =
  process.env.OPENROUTER_SITE_URL ||
  "";

const OPENROUTER_APP_NAME =
  process.env.OPENROUTER_APP_NAME ||
  "NEO-BOT";


//==============================================================
// 🤖 MODÈLES
//==============================================================
//
// L'ordre est important.
//
// OpenRouter utilise cette liste comme chaîne de fallback.
//
// Si le modèle principal échoue,
// OpenRouter peut essayer les modèles suivants.
//
//==============================================================

const OPENROUTER_MODELS = [

  //============================================================
  // 1️⃣ GPT
  //============================================================

  "openai/gpt-5-mini",

  //============================================================
  // 2️⃣ CLAUDE
  //============================================================

  "anthropic/claude-sonnet-4.5",

  //============================================================
  // 3️⃣ GEMINI
  //============================================================

  "google/gemini-2.5-flash",

  //============================================================
  // 4️⃣ DEEPSEEK
  //============================================================

  "deepseek/deepseek-chat",

  //============================================================
  // 5️⃣ QWEN
  //============================================================

  "qwen/qwen3-30b-a3b"

];


//==============================================================
// 🎯 MODÈLE PRINCIPAL
//==============================================================
//
// Le premier modèle de la liste est le modèle principal.
//
// Les autres sont les modèles de secours.
//
//==============================================================

const OPENROUTER_PRIMARY_MODEL =
  OPENROUTER_MODELS[0];


//==============================================================
// ⏱️ TIMEOUT
//==============================================================

const OPENROUTER_TEST_TIMEOUT =
  15000;


//==============================================================
// 🧪 TEST OPENROUTER
//==============================================================
//
// Cette fonction vérifie que :
//
// - la clé API fonctionne
// - OpenRouter est accessible
// - la liste des modèles est correctement envoyée
// - une réponse est reçue
//
// Elle ne fait aucune analyse.
//
//==============================================================

async function testerConnexionOpenRouter() {

  //============================================================
  // 🔑 Vérification de la clé
  //============================================================

  if (!OPENROUTER_API_KEY) {

    throw new Error(
      "OPENROUTER_API_KEY est absente des variables d'environnement."
    );

  }


  //============================================================
  // ⏱️ Contrôleur timeout
  //============================================================

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      OPENROUTER_TEST_TIMEOUT
    );


  try {

    //==========================================================
    // 🌐 Appel OpenRouter
    //==========================================================

    const response =
      await fetch(
        OPENROUTER_URL,
        {

          method:
            "POST",

          headers:
            {

              "Authorization":
                `Bearer ${OPENROUTER_API_KEY}`,

              "Content-Type":
                "application/json",

              "HTTP-Referer":
                OPENROUTER_SITE_URL,

              "X-Title":
                OPENROUTER_APP_NAME

            },

          body:
            JSON.stringify(
              {

                //================================================
                // 🎯 Modèle principal
                //================================================

                model:
                  OPENROUTER_PRIMARY_MODEL,


                //================================================
                // 🔄 Chaîne de fallback OpenRouter
                //================================================

                models:
                  OPENROUTER_MODELS,


                //================================================
                // 💬 Message de test
                //================================================

                messages:
                  [

                    {

                      role:
                        "user",

                      content:
                        "Réponds simplement : OpenRouter multi-IA fonctionne."

                    }

                  ],


                //================================================
                // 🎯 Test déterministe
                //================================================

                temperature:
                  0

              }
            ),

          signal:
            controller.signal

        }
      );


    //==========================================================
    // 📥 Récupération de la réponse
    //==========================================================

    const texte =
      await response.text();


    //==========================================================
    // 🔄 Conversion JSON
    //==========================================================

    let data;

    try {

      data =
        JSON.parse(texte);

    } catch {

      throw new Error(
        `Réponse OpenRouter invalide : ${texte.slice(0, 500)}`
      );

    }


    //==========================================================
    // ❌ Gestion des erreurs HTTP
    //==========================================================

    if (!response.ok) {

      const message =
        data?.error?.message ||
        `HTTP ${response.status}`;

      throw new Error(
        `OpenRouter ${response.status} : ${message}`
      );

    }


    //==========================================================
    // 💬 Extraction de la réponse
    //==========================================================

    const contenu =
      data?.choices?.[0]?.message?.content ||
      "";


    if (!contenu) {

      throw new Error(
        "OpenRouter a répondu mais aucun contenu n'a été reçu."
      );

    }


    //==========================================================
    // 🤖 Identification du modèle réellement utilisé
    //==========================================================

    const modeleUtilise =
      data?.model ||
      OPENROUTER_PRIMARY_MODEL;


    //==========================================================
    // ✅ Succès
    //==========================================================

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "🌐 OPENROUTER"
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "✅ Connexion OpenRouter réussie"
    );

    console.log(
      `🎯 Modèle principal : ${OPENROUTER_PRIMARY_MODEL}`
    );

    console.log(
      `🔄 Modèle utilisé : ${modeleUtilise}`
    );

    console.log(
      `💬 Réponse : ${contenu}`
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );


    //==========================================================
    // 📤 Résultat
    //==========================================================

    return {

      ok:
        true,

      primaryModel:
        OPENROUTER_PRIMARY_MODEL,

      model:
        modeleUtilise,

      models:
        OPENROUTER_MODELS,

      response:
        contenu

    };

  } finally {

    clearTimeout(
      timeout
    );

  }

}


//==============================================================
// 📊 ÉTAT DE CONFIGURATION
//==============================================================

function openRouterEstConfigure() {

  return Boolean(
    OPENROUTER_API_KEY
  );

}


//==============================================================
// 📋 RÉCUPÉRER LES MODÈLES
//==============================================================

function openRouterGetModels() {

  return [
    ...OPENROUTER_MODELS
  ];

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

  OPENROUTER_URL,

  OPENROUTER_API_KEY,

  OPENROUTER_SITE_URL,

  OPENROUTER_APP_NAME,

  OPENROUTER_MODELS,

  OPENROUTER_PRIMARY_MODEL,

  testerConnexionOpenRouter,

  openRouterEstConfigure,

  openRouterGetModels

};
