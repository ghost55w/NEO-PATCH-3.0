/**
 * ╔══════════════════════════════════════════════════════╗
 * ║                    OPENROUTER                      ║
 * ║                  MODULE PRINCIPAL                  ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * ÉTAPE 4
 *
 * Objectif :
 *
 * Créer une fonction générique permettant d'envoyer
 * n'importe quel message à OpenRouter.
 *
 * Cette étape permet ensuite de tester :
 *
 * - un pavé
 * - une question
 * - un prompt
 * - une conversation
 * - n'importe quel texte
 *
 * OpenRouter reste responsable du fallback entre
 * les modèles configurés.
 *
 * Pour cette étape :
 *
 * - aucune analyse NEOAI
 * - aucune analyse de combat
 * - aucune intégration avec outils.js
 * - aucune intégration avec AllstarsEngine.js
 * - aucune utilisation d'Ollama
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

const OPENROUTER_MODELS = [

  "openai/gpt-5-mini",

  "anthropic/claude-sonnet-4.5",

  "google/gemini-2.5-flash",

  "deepseek/deepseek-chat",

  "qwen/qwen3-30b-a3b"

];


//==============================================================
// 🎯 MODÈLE PRINCIPAL
//==============================================================

const OPENROUTER_PRIMARY_MODEL =
  OPENROUTER_MODELS[0];


//==============================================================
// ⏱️ TIMEOUT PAR DÉFAUT
//==============================================================

const OPENROUTER_TIMEOUT =
  30000;


//==============================================================
// 🌐 APPEL GÉNÉRIQUE OPENROUTER
//==============================================================
//
// Cette fonction ne sait rien de NEOAI.
//
// Elle reçoit simplement :
//
// messages
// options
//
// puis retourne la réponse d'OpenRouter.
//
//==============================================================

async function openRouterChat(
  messages,
  options = {}
) {

  //============================================================
  // 🔑 Vérification API
  //============================================================

  if (!OPENROUTER_API_KEY) {

    throw new Error(
      "OPENROUTER_API_KEY est absente des variables d'environnement."
    );

  }


  //============================================================
  // 💬 Vérification messages
  //============================================================

  if (!Array.isArray(messages)) {

    throw new Error(
      "openRouterChat() attend un tableau de messages."
    );

  }


  if (messages.length === 0) {

    throw new Error(
      "openRouterChat() nécessite au moins un message."
    );

  }


  //============================================================
  // 🎯 MODÈLE
  //============================================================

  const modele =
    options.model ||
    OPENROUTER_PRIMARY_MODEL;


  //============================================================
  // 🔄 MODÈLES DE FALLBACK
  //============================================================

  const models =
    Array.isArray(options.models) &&
    options.models.length > 0

      ? [...options.models]

      : [...OPENROUTER_MODELS];


  //============================================================
  // 🌡️ TEMPÉRATURE
  //============================================================

  const temperature =
    typeof options.temperature === "number"

      ? options.temperature

      : 0;


  //============================================================
  // ⏱️ TIMEOUT
  //============================================================

  const timeoutMs =
    Number.isFinite(options.timeout)

      ? options.timeout

      : OPENROUTER_TIMEOUT;


  //============================================================
  // 🎛️ ABORT CONTROLLER
  //============================================================

  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );


  try {

    //==========================================================
    // 🌐 REQUÊTE
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
                  modele,


                //================================================
                // 🔄 Chaîne OpenRouter
                //================================================

                models:
                  models,


                //================================================
                // 💬 Messages
                //================================================

                messages:
                  messages,


                //================================================
                // 🌡️ Température
                //================================================

                temperature:
                  temperature

              }
            ),

          signal:
            controller.signal

        }
      );


    //==========================================================
    // 📥 RÉPONSE BRUTE
    //==========================================================

    const texte =
      await response.text();


    //==========================================================
    // 🔄 JSON
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
    // ❌ ERREUR HTTP
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
    // 💬 CONTENU
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
    // 🤖 MODÈLE RÉELLEMENT UTILISÉ
    //==========================================================

    const modeleUtilise =
      data?.model ||
      modele;


    //==========================================================
    // 📤 RÉSULTAT
    //==========================================================

    return {

      ok:
        true,

      model:
        modeleUtilise,

      primaryModel:
        modele,

      models:
        models,

      response:
        contenu,

      raw:
        data

    };

  } catch (error) {

    //==========================================================
    // ⏱️ TIMEOUT
    //==========================================================

    if (
      error?.name === "AbortError"
    ) {

      throw new Error(
        `OpenRouter timeout après ${timeoutMs} ms.`
      );

    }


    throw error;

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

  OPENROUTER_TIMEOUT,

  openRouterChat,

  openRouterEstConfigure,

  openRouterGetModels

};
