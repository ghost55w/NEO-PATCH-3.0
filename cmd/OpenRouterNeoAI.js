/**
 * ╔══════════════════════════════════════════════════════╗
 * ║                 NEOAI OPENROUTER                   ║
 * ║                  MODULE PRINCIPAL                  ║
 * ╚══════════════════════════════════════════════════════╝
 *
 *
 * Ce module établit uniquement la configuration
 * nécessaire pour communiquer avec OpenRouter.
 *
 * Pour cette étape :
 * - aucun modèle n'est imposé
 * - aucun fallback
 * - aucune analyse de pavé
 * - aucun appel à Gemini
 * - aucun appel à Claude
 * - aucun appel à GPT
 * - aucun appel à Ollama
 * - aucune modification de outils.js
 * - aucune modification de AllstarsEngine.js
 */

//==============================================================
// 🌐 OPENROUTER
//==============================================================

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";


//==============================================================
// 🔑 CLÉ API
//==============================================================
//
// La clé doit être ajoutée dans les variables
// d'environnement de Render.
//
// OPENROUTER_API_KEY=...
//
// Ne jamais mettre la clé directement dans ce fichier.
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

  neoOpenRouterEstConfigure

};
