/**
 * ╔══════════════════════════════════════════════════════╗
 * ║                 NEOAI OPENROUTER                   ║
 * ║                  MODULE PRINCIPAL                  ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * ÉTAPE 2
 *
 * Objectif :
 * Vérifier que NEO-BOT peut communiquer avec OpenRouter.
 *
 * Pour cette étape :
 * - un seul modèle de TEST
 * - aucun système de fallback
 * - aucune analyse de pavé
 * - aucune intégration avec outils.js
 * - aucune intégration avec AllstarsEngine.js
 * - aucune utilisation d'Ollama
 *
 * Le modèle utilisé ici sert UNIQUEMENT à tester
 * la connexion OpenRouter.
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
// 🧪 MODÈLE DE TEST
//==============================================================
//
// IMPORTANT :
// Ce modèle n'est PAS encore le modèle principal de NEOAI.
//
// Il sert uniquement à vérifier que la connexion
// OpenRouter fonctionne.
//
// Nous choisirons les vrais modèles à l'étape
// du système multi-IA.
//==============================================================

const OPENROUTER_TEST_MODEL =
  "openai/gpt-5-mini";


//==============================================================
// ⏱️ TIMEOUT
//==============================================================

const OPENROUTER_TEST_TIMEOUT =
  15000;


//==============================================================
// 🧪 TEST DE CONNEXION
//==============================================================

async function testerConnexionOpenRouter() {

  //============================================================
  // Vérification de la clé
  //============================================================

  if (!OPENROUTER_API_KEY) {

    throw new Error(
      "OPENROUTER_API_KEY est absente des variables d'environnement."
    );

  }


  //============================================================
  // Contrôleur timeout
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
    // Appel OpenRouter
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

                model:
                  OPENROUTER_TEST_MODEL,

                messages:
                  [

                    {
                      role:
                        "user",

                      content:
                        "Réponds simplement : NEOAI fonctionne."
                    }

                  ],

                temperature:
                  0

              }
            ),

          signal:
            controller.signal

        }
      );


    //==========================================================
    // Récupération de la réponse
    //==========================================================

    const texte =
      await response.text();


    //==========================================================
    // Conversion JSON
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
    // Gestion des erreurs HTTP
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
    // Extraction réponse
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
    // Succès
    //==========================================================

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "🌐 NEOAI OPENROUTER"
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "✅ Connexion OpenRouter réussie"
    );

    console.log(
      `🤖 Modèle de test : ${data.model || OPENROUTER_TEST_MODEL}`
    );

    console.log(
      `💬 Réponse : ${contenu}`
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );


    return {

      ok:
        true,

      model:
        data.model ||
        OPENROUTER_TEST_MODEL,

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

function neoOpenRouterEstConfigure() {

  return Boolean(
    OPENROUTER_API_KEY
  );

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

  OPENROUTER_URL,

  OPENROUTER_API_KEY,

  OPENROUTER_SITE_URL,

  OPENROUTER_APP_NAME,

  OPENROUTER_TEST_MODEL,

  testerConnexionOpenRouter,

  neoOpenRouterEstConfigure

};
