//==============================================================
// 🧠 NEO AI — BASE DE CONNAISSANCES LINGUISTIQUES
//==============================================================
//
// NeoAI.js
//
// RÔLE :
// - Contenir le vocabulaire de NeoAI
// - Contenir les verbes et leurs formes
// - Contenir les noms / objets / personnes / lieux
// - Contenir les modèles de phrases
// - Contenir les formules grammaticales
// - Permettre au moteur NeoAI de comparer une phrase
//   avec des modèles connus
//
// ARCHITECTURE :
//
//                    🧠 NEO AI
//                         │
//          ┌──────────────┼──────────────┐
//          │              │              │
//      📚 MOTS       📝 MODÈLES       📐 FORMULES
//          │              │              │
//          └──────────────┼──────────────┘
//                         ↓
//                    🔎 COMPARATEUR
//                         ↓
//                      SCORE %
//
//==============================================================


//==============================================================
// ⚙️ CONFIGURATION
//==============================================================

const NEOAI_CONFIG = {

    langues: ["fr"],

    langueDefaut: "fr",

    seuilSimilarite: 50,

    version: "2.0.0",

    debug: true

};


//==============================================================
// 🧹 NORMALISATION
//==============================================================

function neoNormaliserTexte(texte = "") {

    if (typeof texte !== "string") {
        return "";
    }

    return texte
        .replace(/[’`]/g, "'")
        .replace(/[‐-‒–—]/g, "-")
        .replace(/\s+/g, " ")
        .replace(/\s+([,.!?;:])/g, "$1")
        .trim();

}


//==============================================================
// 🔡 MINUSCULE
//==============================================================

function neoMinuscule(texte = "") {

    return neoNormaliserTexte(texte)
        .toLowerCase();

}


//==============================================================
// 🧹 SANS ACCENTS
//==============================================================

function neoSansAccents(texte = "") {

    return neoMinuscule(texte)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


//==============================================================
// 🧩 TOKENISATION
//==============================================================

function neoTokeniser(texte = "") {

    const normalise =
        neoSansAccents(texte);

    if (!normalise) {
        return [];
    }

    return normalise
        .replace(/[^\p{L}\p{N}'-]+/gu, " ")
        .split(/\s+/)
        .filter(Boolean);

}


//==============================================================
// ✂️ DÉCOUPAGE DES PHRASES
//==============================================================

function neoDecouperPhrases(texte = "") {

    const normalise =
        neoNormaliserTexte(texte);

    if (!normalise) {
        return [];
    }

    return normalise
        .split(/(?<=[.!?])\s+/)
        .map(x => x.trim())
        .filter(Boolean);

}


//==============================================================
// 📖 NEO LEARN
//==============================================================
//
// Conservé pour le système NeoLearn.
// Cette liste peut être enrichie automatiquement.
//
//==============================================================

const NEO_LEARN = {

    fr: [
        "mot1",
        "mot2",
        "mot3"
    ]

};


//==============================================================
// ⚔️ NEO AI — MODÈLES DE COMBAT
// 🏃 DÉPLACEMENTS — MODÈLES STRUCTURELS
//==============================================================

const NEO_COMBAT_MODELS = {

    deplacement: {

        //======================================================
        // 🏃 1. DÉPLACEMENTS FRONTAUX
        //======================================================

        frontal: [

            {
                id: "DEP_F_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Se déplacer frontalement vers une cible en marchant"
            },

            {
                id: "DEP_F_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Se déplacer frontalement vers une cible en courant"
            },

            {
                id: "DEP_F_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "VITESSE"
                ],
                description: "Courir frontalement vers une cible avec une vitesse précisée"
            },

            {
                id: "DEP_F_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE"
                ],
                description: "Se déplacer frontalement sur une distance donnée"
            },

            {
                id: "DEP_F_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Déplacement frontal avec vitesse et distance"
            },

            {
                id: "DEP_F_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE"
                ],
                description: "Déplacement frontal vers une direction précise"
            },

            {
                id: "DEP_F_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Déplacement frontal rapide vers une cible"
            },

            {
                id: "DEP_F_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Déplacement frontal avec détails supplémentaires"
            },

            {
                id: "DEP_F_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DIRECTION",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Déplacement frontal dirigé vers une cible"
            },

            {
                id: "DEP_F_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE"
                ],
                description: "Déplacement frontal complet"
            }
        ],


        //======================================================
        // 🔄 2. DÉPLACEMENTS CIRCULAIRES
        //======================================================

        circulaire: [

            {
                id: "DEP_C_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE"
                ],
                description: "Se déplacer autour d'une cible par un côté"
            },

            {
                id: "DEP_C_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE"
                ],
                description: "Déplacement circulaire avec courbe"
            },

            {
                id: "DEP_C_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE"
                ],
                description: "Déplacement circulaire avec vitesse"
            },

            {
                id: "DEP_C_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE"
                ],
                description: "Déplacement circulaire complet"
            },

            {
                id: "DEP_C_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "TRAJECTOIRE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "TRAJECTOIRE"
                ],
                description: "Déplacement suivant une trajectoire circulaire"
            },

            {
                id: "DEP_C_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE"
                ],
                description: "Déplacement circulaire sur une distance donnée"
            },

            {
                id: "DEP_C_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COURBE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COURBE"
                ],
                description: "Déplacement courbé autour d'une cible"
            },

            {
                id: "DEP_C_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE",
                    "DISTANCE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE"
                ],
                description: "Déplacement circulaire détaillé"
            },

            {
                id: "DEP_C_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE"
                ],
                description: "Déplacement circulaire avec détails supplémentaires"
            },

            {
                id: "DEP_C_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE",
                    "VITESSE",
                    "DISTANCE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "COTE",
                    "COURBE"
                ],
                description: "Déplacement circulaire complet avec paramètres"
            }
        ],


        //======================================================
        // ↔️ 3. DÉPLACEMENTS LATÉRAUX
        //======================================================

        lateral: [

            {
                id: "DEP_L_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral simple"
            },

            {
                id: "DEP_L_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral vers une cible"
            },

            {
                id: "DEP_L_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral avec vitesse"
            },

            {
                id: "DEP_L_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral sur une distance"
            },

            {
                id: "DEP_L_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral complet"
            },

            {
                id: "DEP_L_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral vers une cible"
            },

            {
                id: "DEP_L_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral avec précision"
            },

            {
                id: "DEP_L_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral avec détails"
            },

            {
                id: "DEP_L_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "DISTANCE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral rapide"
            },

            {
                id: "DEP_L_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "DISTANCE",
                    "VITESSE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement latéral complet"
            }
        ],


        //======================================================
        // ↗️ 4. DÉPLACEMENTS DIAGONAUX
        //======================================================

        diagonal: [

            {
                id: "DEP_D_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal simple"
            },

            {
                id: "DEP_D_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal vers une cible"
            },

            {
                id: "DEP_D_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "ANGLE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal avec angle"
            },

            {
                id: "DEP_D_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal sur une distance"
            },

            {
                id: "DEP_D_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal avec vitesse"
            },

            {
                id: "DEP_D_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "ANGLE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal rapide avec angle"
            },

            {
                id: "DEP_D_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "ANGLE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal précis"
            },

            {
                id: "DEP_D_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal complet"
            },

            {
                id: "DEP_D_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal avec détails"
            },

            {
                id: "DEP_D_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "ANGLE",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Déplacement diagonal complet avec paramètres"
            }
        ],


        //======================================================
        // 🔙 5. DÉPLACEMENTS EN ARRIÈRE
        //======================================================

        arriere: [

            {
                id: "DEP_A_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul simple"
            },

            {
                id: "DEP_A_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul sur une distance"
            },

            {
                id: "DEP_A_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul avec vitesse"
            },

            {
                id: "DEP_A_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Recul dans une direction"
            },

            {
                id: "DEP_A_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DISTANCE"
                ],
                description: "Recul par rapport à une cible"
            },

            {
                id: "DEP_A_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Recul rapide"
            },

            {
                id: "DEP_A_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DISTANCE",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul avec distance et vitesse"
            },

            {
                id: "DEP_A_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "DISTANCE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION"
                ],
                description: "Recul détaillé"
            },

            {
                id: "DEP_A_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul rapide par rapport à une cible"
            },

            {
                id: "DEP_A_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "CIBLE",
                    "VITESSE",
                    "DISTANCE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE"
                ],
                description: "Recul complet"
            }
        ],


        //======================================================
        // 🪽 6. DÉPLACEMENTS AÉRIENS
        //======================================================

        aerien: [

            {
                id: "DEP_AE_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien à une hauteur donnée"
            },

            {
                id: "DEP_AE_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien dirigé"
            },

            {
                id: "DEP_AE_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien vers une cible"
            },

            {
                id: "DEP_AE_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien sur une distance"
            },

            {
                id: "DEP_AE_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien suivant une trajectoire"
            },

            {
                id: "DEP_AE_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien rapide"
            },

            {
                id: "DEP_AE_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien vers une cible sur une distance"
            },

            {
                id: "DEP_AE_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "DIRECTION",
                    "HAUTEUR",
                    "VITESSE"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien complet"
            },

            {
                id: "DEP_AE_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "TRAJECTOIRE",
                    "HAUTEUR",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien avec détails"
            },

            {
                id: "DEP_AE_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "TRAJECTOIRE",
                    "DIRECTION",
                    "VITESSE",
                    "DISTANCE",
                    "HAUTEUR",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                description: "Déplacement aérien complet avec paramètres"
            }
        ],


        //======================================================
        // 🦘 7. SAUTS / BONDS
        //======================================================

        saut_bond: [

            {
                id: "DEP_SB_001",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "HAUTEUR"
                ],
                description: "Saut vertical simple"
            },

            {
                id: "DEP_SB_002",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Saut dirigé"
            },

            {
                id: "DEP_SB_003",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                description: "Bond avec distance et hauteur"
            },

            {
                id: "DEP_SB_004",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                description: "Bond vers une cible"
            },

            {
                id: "DEP_SB_005",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Saut dans une direction"
            },

            {
                id: "DEP_SB_006",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                description: "Saut suivant une trajectoire"
            },

            {
                id: "DEP_SB_007",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "VITESSE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "DIRECTION",
                    "HAUTEUR"
                ],
                description: "Saut rapide"
            },

            {
                id: "DEP_SB_008",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "DIRECTION",
                    "DISTANCE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "HAUTEUR"
                ],
                description: "Bond dirigé vers une cible"
            },

            {
                id: "DEP_SB_009",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "ANGLE",
                    "HAUTEUR"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "HAUTEUR"
                ],
                description: "Saut avec trajectoire et angle"
            },

            {
                id: "DEP_SB_010",
                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "CIBLE",
                    "TRAJECTOIRE",
                    "DIRECTION",
                    "VITESSE",
                    "DISTANCE",
                    "HAUTEUR",
                    "ANGLE",
                    "EXTRAS"
                ],
                requis: [
                    "ACTION",
                    "MANIERE",
                    "HAUTEUR"
                ],
                description: "Saut ou bond complet"
            }
        ]
    },

attaque: {

    mains: {

        // =========================================================
        // 1. COUP DIRECT
        // =========================================================

        coup_direct: [

            {
                id: "ATT_MD_001",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de poing direct à Tobirama."
            },

            {
                id: "ATT_MD_002",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un coup de poing direct."
            },

            {
                id: "ATT_MD_003",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato décoche un direct vers Tobirama."
            },

            {
                id: "ATT_MD_004",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie son poing droit directement sur Tobirama."
            },

            {
                id: "ATT_MD_005",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette un poing droit en ligne directe vers Tobirama."
            },

            {
                id: "ATT_MD_006",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un jab en direction de Tobirama."
            },

            {
                id: "ATT_MD_007",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato assène un straight à Tobirama."
            },

            {
                id: "ATT_MD_008",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tend le poing et frappe Tobirama en ligne droite."
            },

            {
                id: "ATT_MD_009",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe frontalement Tobirama avec son poing."
            },

            {
                id: "ATT_MD_010",
                modele: "coup_direct",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un coup direct contre Tobirama."
            }
        ],

        // =========================================================
        // 2. CROCHET GAUCHE
        // =========================================================

        crochet_gauche: [

            {
                id: "ATT_CG_001",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un crochet gauche."
            },

            {
                id: "ATT_CG_002",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato décoche un crochet du gauche sur Tobirama."
            },

            {
                id: "ATT_CG_003",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie son poing gauche en crochet vers Tobirama."
            },

            {
                id: "ATT_CG_004",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balance un hook gauche contre Tobirama."
            },

            {
                id: "ATT_CG_005",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un crochet avec sa main gauche vers Tobirama."
            },

            {
                id: "ATT_CG_006",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato arme son gauche puis frappe Tobirama en crochet."
            },

            {
                id: "ATT_CG_007",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un hook du gauche sur Tobirama."
            },

            {
                id: "ATT_CG_008",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec son poing gauche en mouvement circulaire."
            },

            {
                id: "ATT_CG_009",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait partir son crochet gauche directement vers Tobirama."
            },

            {
                id: "ATT_CG_010",
                modele: "crochet_gauche",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "gauche",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un crochet gauche à Tobirama."
            }
        ],

        // =========================================================
        // 3. CROCHET DROIT
        // =========================================================

        crochet_droit: [

            {
                id: "ATT_CD_001",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un crochet droit."
            },

            {
                id: "ATT_CD_002",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato décoche un crochet du droit sur Tobirama."
            },

            {
                id: "ATT_CD_003",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie son poing droit en crochet vers Tobirama."
            },

            {
                id: "ATT_CD_004",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balance un hook droit contre Tobirama."
            },

            {
                id: "ATT_CD_005",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un crochet avec sa main droite vers Tobirama."
            },

            {
                id: "ATT_CD_006",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato arme son droit puis frappe Tobirama en crochet."
            },

            {
                id: "ATT_CD_007",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un hook du droit sur Tobirama."
            },

            {
                id: "ATT_CD_008",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec son poing droit en mouvement circulaire."
            },

            {
                id: "ATT_CD_009",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait partir son crochet droit directement vers Tobirama."
            },

            {
                id: "ATT_CD_010",
                modele: "crochet_droit",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MAIN", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MAIN: "droite",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un crochet droit à Tobirama."
            }
        ],

        // =========================================================
        // 4. UPPERCUT
        // =========================================================

        uppercut: [

            {
                id: "ATT_UP_001",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un uppercut."
            },

            {
                id: "ATT_UP_002",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie un uppercut vers Tobirama."
            },

            {
                id: "ATT_UP_003",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de poing remontant à Tobirama."
            },

            {
                id: "ATT_UP_004",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato remonte son poing sous Tobirama."
            },

            {
                id: "ATT_UP_005",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance son poing vers le haut contre Tobirama."
            },

            {
                id: "ATT_UP_006",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec un coup ascendant."
            },

            {
                id: "ATT_UP_007",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un uppercut sur Tobirama."
            },

            {
                id: "ATT_UP_008",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato remonte violemment son poing vers Tobirama."
            },

            {
                id: "ATT_UP_009",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato assène un uppercut à Tobirama."
            },

            {
                id: "ATT_UP_010",
                modele: "uppercut",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette un coup ascendant contre Tobirama."
            }
        ],

        // =========================================================
        // 5. UPPERCUT SAUTÉ
        // =========================================================

        uppercut_saute: [

            {
                id: "ATT_US_001",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato saute et frappe Tobirama d'un uppercut."
            },

            {
                id: "ATT_US_002",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato bondit en envoyant un uppercut vers Tobirama."
            },

            {
                id: "ATT_US_003",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato prend appui, saute et remonte son poing vers Tobirama."
            },

            {
                id: "ATT_US_004",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato bondit vers Tobirama avec un coup remontant."
            },

            {
                id: "ATT_US_005",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato saute en direction de Tobirama et lance un uppercut."
            },

            {
                id: "ATT_US_006",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato s'élève du sol et frappe Tobirama par-dessous."
            },

            {
                id: "ATT_US_007",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato exécute un uppercut sauté contre Tobirama."
            },

            {
                id: "ATT_US_008",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato bondit et projette son poing vers Tobirama."
            },

            {
                id: "ATT_US_009",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato saute devant Tobirama et lui assène un uppercut."
            },

            {
                id: "ATT_US_010",
                modele: "uppercut_saute",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato décolle et remonte son poing sous Tobirama."
            }
        ],

        // =========================================================
        // 6. BACKFIST
        // =========================================================

        backfist: [

            {
                id: "ATT_BF_001",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un backfist."
            },

            {
                id: "ATT_BF_002",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec le dos du poing."
            },

            {
                id: "ATT_BF_003",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un coup en revers vers Tobirama."
            },

            {
                id: "ATT_BF_004",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balance le dos de son poing contre Tobirama."
            },

            {
                id: "ATT_BF_005",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato assène un revers du poing à Tobirama."
            },

            {
                id: "ATT_BF_006",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "diagonale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait partir un revers diagonal vers Tobirama."
            },

            {
                id: "ATT_BF_007",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama du revers de la main."
            },

            {
                id: "ATT_BF_008",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato rabat son poing sur Tobirama avec le dos de la main."
            },

            {
                id: "ATT_BF_009",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un coup de revers sur Tobirama."
            },

            {
                id: "ATT_BF_010",
                modele: "backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un backfist directement à Tobirama."
            }
        ],

        // =========================================================
        // 7. SPINNING BACKFIST
        // =========================================================

        spinning_backfist: [

            {
                id: "ATT_SBF_001",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote et frappe Tobirama d'un spinning backfist."
            },

            {
                id: "ATT_SBF_002",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne sur lui-même puis frappe Tobirama du revers."
            },

            {
                id: "ATT_SBF_003",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato effectue une rotation avant d'envoyer son revers sur Tobirama."
            },

            {
                id: "ATT_SBF_004",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne puis balance un spinning backfist vers Tobirama."
            },

            {
                id: "ATT_SBF_005",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne à 360 degrés et frappe Tobirama du dos du poing."
            },

            {
                id: "ATT_SBF_006",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote rapidement et envoie son revers contre Tobirama."
            },

            {
                id: "ATT_SBF_007",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un revers tournoyant sur Tobirama."
            },

            {
                id: "ATT_SBF_008",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato effectue un tour et frappe Tobirama avec le dos du poing."
            },

            {
                id: "ATT_SBF_009",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "180"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne sur son axe puis percute Tobirama avec son revers."
            },

            {
                id: "ATT_SBF_010",
                modele: "spinning_backfist",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato accomplit une rotation complète avant de frapper Tobirama."
            }
        ],

        // =========================================================
        // 8. HAMMER DESCENDANT
        // =========================================================

        hammer_descendant: [

            {
                id: "ATT_HD_001",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un coup marteau descendant."
            },

            {
                id: "ATT_HD_002",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat son poing comme un marteau sur Tobirama."
            },

            {
                id: "ATT_HD_003",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie un hammer descendant sur Tobirama."
            },

            {
                id: "ATT_HD_004",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato écrase Tobirama avec un coup de marteau."
            },

            {
                id: "ATT_HD_005",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait tomber son poing en marteau vers Tobirama."
            },

            {
                id: "ATT_HD_006",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un marteau descendant à Tobirama."
            },

            {
                id: "ATT_HD_007",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat violemment le tranchant de son poing sur Tobirama."
            },

            {
                id: "ATT_HD_008",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama verticalement avec un hammer fist."
            },

            {
                id: "ATT_HD_009",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato laisse tomber son poing en marteau sur Tobirama."
            },

            {
                id: "ATT_HD_010",
                modele: "hammer_descendant",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato assène un coup de marteau du haut vers Tobirama."
            }
        ],

        // =========================================================
        // 9. HAMMER LATERAL
        // =========================================================

        hammer_lateral: [

            {
                id: "ATT_HL_001",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un marteau latéral."
            },

            {
                id: "ATT_HL_002",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balance un coup de marteau latéralement sur Tobirama."
            },

            {
                id: "ATT_HL_003",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec un hammer fist latéral."
            },

            {
                id: "ATT_HL_004",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie son poing en marteau vers le côté de Tobirama."
            },

            {
                id: "ATT_HL_005",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un hammer latéral contre Tobirama."
            },

            {
                id: "ATT_HL_006",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait partir son marteau de côté vers Tobirama."
            },

            {
                id: "ATT_HL_007",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup marteau latéral à Tobirama."
            },

            {
                id: "ATT_HL_008",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe latéralement Tobirama avec son poing en marteau."
            },

            {
                id: "ATT_HL_009",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette un marteau de côté contre Tobirama."
            },

            {
                id: "ATT_HL_010",
                modele: "hammer_lateral",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec le tranchant de son poing latéralement."
            }
        ],

        // =========================================================
        // 10. REVERSE HAMMER
        // =========================================================

        reverse_hammer: [

            {
                id: "ATT_RH_001",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un reverse hammer."
            },

            {
                id: "ATT_RH_002",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un marteau en revers à Tobirama."
            },

            {
                id: "ATT_RH_003",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance son poing en reverse hammer vers Tobirama."
            },

            {
                id: "ATT_RH_004",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "diagonale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec un marteau en revers diagonal."
            },

            {
                id: "ATT_RH_005",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato rabat le dos de son poing contre Tobirama."
            },

            {
                id: "ATT_RH_006",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait passer son poing en revers sur Tobirama."
            },

            {
                id: "ATT_RH_007",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un reverse hammer contre Tobirama."
            },

            {
                id: "ATT_RH_008",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec le dos du poing en revers."
            },

            {
                id: "ATT_RH_009",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "diagonale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie un coup marteau diagonal en revers vers Tobirama."
            },

            {
                id: "ATT_RH_010",
                modele: "reverse_hammer",
                famille: "mains",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "poing",
                    TRAJECTOIRE: "horizontale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un marteau en revers directement à Tobirama."
            }
        ]
    },

    pieds: {

        // =========================================================
        // 11. FRONT KICK
        // =========================================================

        front_kick: [

            {
                id: "ATT_FK_001",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un front kick."
            },

            {
                id: "ATT_FK_002",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied frontal à Tobirama."
            },

            {
                id: "ATT_FK_003",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pousse son pied directement vers Tobirama."
            },

            {
                id: "ATT_FK_004",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette un coup de pied direct sur Tobirama."
            },

            {
                id: "ATT_FK_005",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tend la jambe et frappe Tobirama frontalement."
            },

            {
                id: "ATT_FK_006",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie sa jambe droite directement vers Tobirama."
            },

            {
                id: "ATT_FK_007",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un front kick contre Tobirama."
            },

            {
                id: "ATT_FK_008",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec un coup de pied avant."
            },

            {
                id: "ATT_FK_009",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato enfonce son pied vers Tobirama en ligne droite."
            },

            {
                id: "ATT_FK_010",
                modele: "front_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied frontal à Tobirama."
            }
        ],

        // =========================================================
        // 12. ROUNDHOUSE KICK
        // =========================================================

        roundhouse_kick: [

            {
                id: "ATT_RK_001",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un roundhouse kick."
            },

            {
                id: "ATT_RK_002",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied circulaire à Tobirama."
            },

            {
                id: "ATT_RK_003",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait tourner sa jambe vers Tobirama."
            },

            {
                id: "ATT_RK_004",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un coup de pied circulaire contre Tobirama."
            },

            {
                id: "ATT_RK_005",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balaie Tobirama avec son tibia en mouvement circulaire."
            },

            {
                id: "ATT_RK_006",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait partir son pied en rotation vers Tobirama."
            },

            {
                id: "ATT_RK_007",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un roundhouse sur Tobirama."
            },

            {
                id: "ATT_RK_008",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec un coup de pied tournant."
            },

            {
                id: "ATT_RK_009",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait pivoter sa jambe et frappe Tobirama."
            },

            {
                id: "ATT_RK_010",
                modele: "roundhouse_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "circulaire"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup circulaire de la jambe à Tobirama."
            }
        ],

        // =========================================================
        // 13. SIDE KICK
        // =========================================================

        side_kick: [

            {
                id: "ATT_SK_001",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un side kick."
            },

            {
                id: "ATT_SK_002",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied latéral à Tobirama."
            },

            {
                id: "ATT_SK_003",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette sa jambe de côté vers Tobirama."
            },

            {
                id: "ATT_SK_004",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie un side kick contre Tobirama."
            },

            {
                id: "ATT_SK_005",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec le tranchant du pied."
            },

            {
                id: "ATT_SK_006",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pousse son pied latéralement vers Tobirama."
            },

            {
                id: "ATT_SK_007",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un coup de pied latéral sur Tobirama."
            },

            {
                id: "ATT_SK_008",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tend sa jambe sur le côté et frappe Tobirama."
            },

            {
                id: "ATT_SK_009",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato enfonce son side kick dans la direction de Tobirama."
            },

            {
                id: "ATT_SK_010",
                modele: "side_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied latéral à Tobirama."
            }
        ],

        // =========================================================
        // 14. BACK KICK
        // =========================================================

        back_kick: [

            {
                id: "ATT_BK_001",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato se retourne et frappe Tobirama d'un back kick."
            },

            {
                id: "ATT_BK_002",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied arrière à Tobirama."
            },

            {
                id: "ATT_BK_003",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote et projette son talon vers Tobirama."
            },

            {
                id: "ATT_BK_004",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un back kick contre Tobirama."
            },

            {
                id: "ATT_BK_005",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne le dos et frappe Tobirama avec son talon."
            },

            {
                id: "ATT_BK_006",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pousse sa jambe derrière lui vers Tobirama."
            },

            {
                id: "ATT_BK_007",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato effectue un coup de pied arrière sur Tobirama."
            },

            {
                id: "ATT_BK_008",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote sur son axe et envoie son talon vers Tobirama."
            },

            {
                id: "ATT_BK_009",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama derrière lui avec un back kick."
            },

            {
                id: "ATT_BK_010",
                modele: "back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: true
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied arrière retourné à Tobirama."
            }
        ],

        // =========================================================
        // 15. HOOK KICK
        // =========================================================

        hook_kick: [

            {
                id: "ATT_HK_001",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un hook kick."
            },

            {
                id: "ATT_HK_002",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied en crochet à Tobirama."
            },

            {
                id: "ATT_HK_003",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato ramène son talon en crochet vers Tobirama."
            },

            {
                id: "ATT_HK_004",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un hook kick contre Tobirama."
            },

            {
                id: "ATT_HK_005",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait passer son pied autour de Tobirama puis ramène le talon."
            },

            {
                id: "ATT_HK_006",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato replie sa jambe en crochet vers Tobirama."
            },

            {
                id: "ATT_HK_007",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un coup de pied crocheté sur Tobirama."
            },

            {
                id: "ATT_HK_008",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec son talon en mouvement de crochet."
            },

            {
                id: "ATT_HK_009",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato ramène son pied derrière lui pour frapper Tobirama."
            },

            {
                id: "ATT_HK_010",
                modele: "hook_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "crochet"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un hook kick au visage de Tobirama."
            }
        ],

        // =========================================================
        // 16. AXE KICK
        // =========================================================

        axe_kick: [

            {
                id: "ATT_AK_001",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un axe kick."
            },

            {
                id: "ATT_AK_002",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied descendant à Tobirama."
            },

            {
                id: "ATT_AK_003",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lève sa jambe puis l'abat vers Tobirama."
            },

            {
                id: "ATT_AK_004",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un axe kick contre Tobirama."
            },

            {
                id: "ATT_AK_005",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait tomber son talon sur Tobirama."
            },

            {
                id: "ATT_AK_006",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat son pied depuis le haut vers Tobirama."
            },

            {
                id: "ATT_AK_007",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un coup de pied en axe sur Tobirama."
            },

            {
                id: "ATT_AK_008",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato élève sa jambe avant de la rabattre sur Tobirama."
            },

            {
                id: "ATT_AK_009",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fait chuter son pied sur Tobirama."
            },

            {
                id: "ATT_AK_010",
                modele: "axe_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "descendante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied descendant à Tobirama."
            }
        ],

        // =========================================================
        // 17. SPINNING BACK KICK
        // =========================================================

        spinning_back_kick: [

            {
                id: "ATT_SBK_001",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne et frappe Tobirama d'un spinning back kick."
            },

            {
                id: "ATT_SBK_002",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote à 360 degrés et envoie son talon vers Tobirama."
            },

            {
                id: "ATT_SBK_003",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato effectue une rotation complète avant de frapper Tobirama."
            },

            {
                id: "ATT_SBK_004",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un coup de pied arrière tournoyant sur Tobirama."
            },

            {
                id: "ATT_SBK_005",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne sur lui-même puis projette son talon vers Tobirama."
            },

            {
                id: "ATT_SBK_006",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato pivote et frappe Tobirama avec un spinning back kick."
            },

            {
                id: "ATT_SBK_007",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato accomplit un tour complet avant d'expulser son pied vers Tobirama."
            },

            {
                id: "ATT_SBK_008",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato tourne rapidement et plante son talon dans la direction de Tobirama."
            },

            {
                id: "ATT_SBK_009",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un spinning back kick contre Tobirama."
            },

            {
                id: "ATT_SBK_010",
                modele: "spinning_back_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "ROTATION", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "arrière",
                    ROTATION: "360"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied arrière tourné à Tobirama."
            }
        ],

        // =========================================================
        // 18. LOW KICK
        // =========================================================

        low_kick: [

            {
                id: "ATT_LK_001",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un low kick."
            },

            {
                id: "ATT_LK_002",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato donne un coup de pied bas à Tobirama."
            },

            {
                id: "ATT_LK_003",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE", "ZONE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe la jambe de Tobirama avec un low kick."
            },

            {
                id: "ATT_LK_004",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato balance son tibia contre la jambe de Tobirama."
            },

            {
                id: "ATT_LK_005",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un low kick vers Tobirama."
            },

            {
                id: "ATT_LK_006",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama au niveau de la cuisse."
            },

            {
                id: "ATT_LK_007",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato abat un coup de pied bas sur Tobirama."
            },

            {
                id: "ATT_LK_008",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato fouette la jambe de Tobirama avec son tibia."
            },

            {
                id: "ATT_LK_009",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup bas directement à Tobirama."
            },

            {
                id: "ATT_LK_010",
                modele: "low_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato attaque la cuisse de Tobirama avec un low kick."
            }
        ],

        // =========================================================
        // 19. KNEE STRIKE
        // =========================================================

        knee_strike: [

            {
                id: "ATT_KS_001",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama d'un coup de genou."
            },

            {
                id: "ATT_KS_002",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato envoie son genou vers Tobirama."
            },

            {
                id: "ATT_KS_003",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato remonte son genou contre Tobirama."
            },

            {
                id: "ATT_KS_004",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un knee strike à Tobirama."
            },

            {
                id: "ATT_KS_005",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato frappe Tobirama avec son genou."
            },

            {
                id: "ATT_KS_006",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato projette son genou vers le corps de Tobirama."
            },

            {
                id: "ATT_KS_007",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato déclenche un coup de genou contre Tobirama."
            },

            {
                id: "ATT_KS_008",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato remonte brutalement son genou vers Tobirama."
            },

            {
                id: "ATT_KS_009",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato assène un genou à Tobirama."
            },

            {
                id: "ATT_KS_010",
                modele: "knee_strike",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "genou",
                    TRAJECTOIRE: "montante"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato percute Tobirama avec son genou."
            }
        ],

        // =========================================================
        // 20. FLYING KICK
        // =========================================================

        flying_kick: [

            {
                id: "ATT_FLY_001",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato saute et frappe Tobirama d'un flying kick."
            },

            {
                id: "ATT_FLY_002",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato bondit vers Tobirama avec un coup de pied sauté."
            },

            {
                id: "ATT_FLY_003",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato décolle du sol et projette son pied vers Tobirama."
            },

            {
                id: "ATT_FLY_004",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato lance un flying kick contre Tobirama."
            },

            {
                id: "ATT_FLY_005",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato saute en direction de Tobirama et frappe avec son pied."
            },

            {
                id: "ATT_FLY_006",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "latérale"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato bondit de côté et frappe Tobirama avec un flying kick."
            },

            {
                id: "ATT_FLY_007",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato s'élance dans les airs et frappe Tobirama du pied."
            },

            {
                id: "ATT_FLY_008",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato attaque Tobirama en plein saut avec son pied."
            },

            {
                id: "ATT_FLY_009",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato prend son impulsion et percute Tobirama avec son pied."
            },

            {
                id: "ATT_FLY_010",
                modele: "flying_kick",
                famille: "pieds",
                structure: ["SUJET", "ACTION", "TYPE", "MOUVEMENT", "CIBLE"],
                slots: {
                    ACTION: "frapper",
                    TYPE: "pied",
                    MOUVEMENT: "saut",
                    TRAJECTOIRE: "directe"
                },
                requis: ["SUJET", "ACTION", "CIBLE"],
                phrase: "Yamato porte un coup de pied sauté à Tobirama."
            }
        ]
    },

    autres: {}
},
    
    esquive: [],
    contre: [],
    parade: [],
    saisie: []

};

                            
//==============================================================
// 🧠 NEO AI — ANALYSEUR SÉMANTIQUE COMBAT
//==============================================================

const NEO_COMBAT_MANIERES = {
    courir: [
        "court",
        "courir",
        "en courant",
        "fonce",
        "foncer",
        "en fonçant"
    ],

    marcher: [
        "marche",
        "marcher",
        "en marchant"
    ],

    ramper: [
        "rampe",
        "ramper",
        "en rampant"
    ],

    glisser: [
        "glisse",
        "glisser",
        "en glissant"
    ],

    sauter: [
        "saute",
        "sauter",
        "en sautant",
        "bondit",
        "bondir",
        "en bondissant"
    ],

    voler: [
        "vole",
        "voler",
        "en volant"
    ]
};


const NEO_COMBAT_VITESSES = {
    vmax: [
        "vmax",
        "pleine vitesse",
        "vitesse maximale",
        "à pleine vitesse",
        "au maximum de sa vitesse",
        "à vitesse maximale"
    ],

    rapide: [
        "rapidement",
        "très vite",
        "à grande vitesse"
    ],

    lent: [
        "lentement",
        "à faible vitesse"
    ]
};


const NEO_COMBAT_FAMILLES = {

    circulaire: [
        "circulaire",
        "contourne",
        "contourner",
        "autour de",
        "tourne autour",
        "en cercle"
    ],

    diagonal: [
        "diagonale",
        "diagonalement",
        "en diagonale"
    ],

    lateral: [
        "latéral",
        "latérale",
        "latéralement",
        "sur le côté"
    ],

    arriere: [
        "recule",
        "reculer",
        "en arrière",
        "vers l'arrière",
        "vers l arriere"
    ],

    aerien: [
        "dans les airs",
        "dans l'air",
        "en l'air",
        "aérien",
        "aérienne",
        "s'élève",
        "s'eleve"
    ],

    saut_bond: [
        "saute",
        "sauter",
        "bondit",
        "bondir",
        "bond"
    ]
};


function neoTrouverCorrespondance(texte, dictionnaire) {

    const t = neoNormaliserTexte(texte);

    for (const [valeur, variantes] of Object.entries(dictionnaire)) {

        for (const variante of variantes) {

            const v = neoNormaliserTexte(variante);

            if (t.includes(v)) {
                return valeur;
            }
        }
    }

    return null;
}


function neoExtraireDistance(texte) {

    const match = texte.match(
        /(?:sur|de|pendant|parcours?|avance(?:r)?|recule(?:r)?)?\s*(\d+(?:[.,]\d+)?)\s*(mètres?|m|cm|centimètres?)/i
    );

    if (!match) return null;

    return {
        valeur: Number(match[1].replace(",", ".")),
        unite: match[2].toLowerCase().startsWith("cm")
            ? "cm"
            : "m"
    };
}


function neoExtraireCourbe(texte) {

    const match = texte.match(
        /courbe\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(mètres?|m|cm|centimètres?)/i
    );

    if (!match) return null;

    return {
        valeur: Number(match[1].replace(",", ".")),
        unite: match[2].toLowerCase().startsWith("cm")
            ? "cm"
            : "m"
    };
}


function neoExtraireHauteur(texte) {

    const match = texte.match(
        /(?:hauteur|haut|s'élève|s eleve|monte)\s*(?:de|à|a)?\s*(\d+(?:[.,]\d+)?)\s*(mètres?|m|cm|centimètres?)/i
    );

    if (!match) return null;

    return {
        valeur: Number(match[1].replace(",", ".")),
        unite: match[2].toLowerCase().startsWith("cm")
            ? "cm"
            : "m"
    };
}


function neoExtraireCote(texte) {

    const t = neoNormaliserTexte(texte);

    if (
        t.includes("par la droite") ||
        t.includes("sur la droite") ||
        t.includes("cote droit") ||
        t.includes("cote droite")
    ) {
        return "droite";
    }

    if (
        t.includes("par la gauche") ||
        t.includes("sur la gauche") ||
        t.includes("cote gauche")
    ) {
        return "gauche";
    }

    return null;
}


function neoExtraireDirection(texte) {

    const t = neoNormaliserTexte(texte);

    const match = t.match(
        /\bvers\s+(?:la\s+)?(gauche|droite|avant|arriere|l'arriere|haut|le haut|le bas)\b/i
    );

    if (match) {
        return match[1]
            .replace("l'arriere", "arrière")
            .replace("le haut", "haut")
            .replace("le bas", "bas");
    }

    return null;
}


function neoExtraireCible(texte) {

    /*
     * On cherche principalement ce qui suit :
     * vers X
     * autour de X
     * par rapport à X
     * contre X
     */

    const match = texte.match(
        /\b(?:vers|autour de|contre|sur|devant|derrière|aupres de|aupres)\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*)/i
    );

    if (!match) return null;

    return match[1];
}

    //==========================================================
    // 👤 EXTRAIRE SUJET
    //==========================================================
function neoExtraireSujet(texte) {

    const texteNormalise =
    neoNormaliserTexte(texte);

    //==========================================================
    // 🚫 FORMULES D'INTRODUCTION À IGNORER
    //==========================================================

    const introductions = [
        "début du combat",
        "debut du combat",
        "début du duel",
        "debut du duel",
        "début de combat",
        "debut de combat",
        "commence le combat",
        "commence le duel",
        "début",
        "debut"
    ];

    let texteAction = texteNormalise;

    for (const intro of introductions) {

        if (
            texteAction.startsWith(intro)
        ) {

            texteAction =
                texteAction
                    .slice(intro.length)
                    .trim();

            break;
        }
    }

    //==========================================================
    // 👤 RECHERCHE DU VÉRITABLE SUJET
    //==========================================================

    const verbesAction = [
        "court",
        "courir",
        "fonce",
        "foncer",
        "avance",
        "avancer",
        "recule",
        "reculer",
        "marche",
        "marcher",
        "se deplace",
        "se déplacer",
        "se déplace",
        "saute",
        "sauter",
        "bondit",
        "bondir",
        "rampe",
        "ramper",
        "contourne",
        "contourner",
        "tourne",
        "tourner",
        "frappe",
        "frapper",
        "attaque",
        "attaquer",
        "saisit",
        "saisir",
        "esquive",
        "esquiver",
        "bloque",
        "bloquer",
        "pare",
        "parer"
    ];

    //==========================================================
    // 🔎 CHERCHER LE MOT JUSTE AVANT LE VERBE D'ACTION
    //==========================================================

    for (const verbe of verbesAction) {

        const regex = new RegExp(
            `\\b([a-zàâäçéèêëîïôöùûüÿñæœ0-9_-]+)\\s+${verbe}\\b`,
            "i"
        );

        const match =
            texteAction.match(regex);

        if (match) {

            return match[1]
                .trim();
        }
    }

    //==========================================================
    // 🔎 CAS « X se déplace »
    //==========================================================

    const matchSeDeplace =
        texteAction.match(
            /\b([a-zàâäçéèêëîïôöùûüÿñæœ0-9_-]+)\s+se\s+(?:déplace|deplace)\b/i
        );

    if (matchSeDeplace) {

        return matchSeDeplace[1]
            .trim();
    }

    //==========================================================
    // 🔎 FALLBACK
    //==========================================================

    const premierMot =
        texteAction
            .split(/\s+/)
            .filter(Boolean)[0];

    return premierMot || null;
}


function neoDeterminerFamille(texte, maniere) {

    const t = neoNormaliserTexte(texte);

    for (const [famille, variantes] of Object.entries(NEO_COMBAT_FAMILLES)) {

        for (const variante of variantes) {

            if (t.includes(neoNormaliserTexte(variante))) {
                return famille;
            }
        }
    }

    /*
     * Si rien n'est explicitement indiqué,
     * un déplacement vers une cible est considéré
     * comme frontal.
     */

    if (
        maniere &&
        (
            t.includes("vers ") ||
            t.includes("avance") ||
            t.includes("fonce") ||
            t.includes("court")
        )
    ) {
        return "frontal";
    }

    return null;
}


function neoDeterminerTrajectoire(famille, texte) {

    const t = neoNormaliserTexte(texte);

    if (t.includes("circulaire") || t.includes("autour de")) {
        return "circulaire";
    }

    if (t.includes("diagonale")) {
        return "diagonale";
    }

    if (
        t.includes("latéral") ||
        t.includes("lateral") ||
        t.includes("sur le côté") ||
        t.includes("sur le cote")
    ) {
        return "latérale";
    }

    if (
        t.includes("en arrière") ||
        t.includes("en arriere") ||
        t.includes("recule")
    ) {
        return "arrière";
    }

    if (
        famille === "aerien" ||
        famille === "saut_bond"
    ) {
        return "aérienne";
    }

    if (famille === "frontal") {
        return "directe";
    }

    return null;
}


function neoAnalyserStructureCombat(texte) {
    const sujet =
        neoExtraireSujet(texte);

    const cible =
        neoExtraireCible(texte);


    //==========================================================
    // 🔎 VERBE PRINCIPAL
    //==========================================================

    const tokens =
        neoTokeniser(texte);

    let verbe = null;
    let indexVerbe = -1;

    for (
        let i = 0;
        i < tokens.length;
        i++
    ) {

        const resultat =
            neoTrouverVerbe(
                tokens[i]
            );

        if (resultat) {

            verbe = resultat;
            indexVerbe = i;

            break;
        }
    }


    //==========================================================
    // 🏃 MANIÈRE
    //==========================================================

    const maniere =
        neoTrouverCorrespondance(
            texte,
            NEO_COMBAT_MANIERES
        );


    //==========================================================
    // ⚡ VITESSE
    //==========================================================

    const vitesse =
        neoTrouverCorrespondance(
            texte,
            NEO_COMBAT_VITESSES
        );


    //==========================================================
    // 🧭 FAMILLE
    //==========================================================

    const famille =
        neoDeterminerFamille(
            texte,
            maniere
        );


    //==========================================================
    // 🎯 TRAJECTOIRE
    //==========================================================

    const trajectoire =
        neoDeterminerTrajectoire(
            famille,
            texte
        );


    //==========================================================
    // 📐 INFORMATIONS COMPLÉMENTAIRES
    //==========================================================

    const cote =
        neoExtraireCote(texte);

    const direction =
        neoExtraireDirection(texte);

    const distance =
        neoExtraireDistance(texte);

    const courbe =
        neoExtraireCourbe(texte);

    const hauteur =
        neoExtraireHauteur(texte);


    //==========================================================
    // 🧠 ACTION
    //==========================================================

    const action =
        verbe?.lemme ||
        null;


    //==========================================================
    // 🏷️ CATÉGORIE
    //==========================================================

    const categorie =
        neoDeterminerCategorieCombat(
            verbe
        );


    //==========================================================
    // 📦 SLOTS
    //==========================================================

    const slots = {

        SUJET: sujet,

        ACTION: action,

        MANIERE: maniere,

        CIBLE: cible,

        TRAJECTOIRE: trajectoire,

        COTE: cote,

        COURBE: courbe,

        DIRECTION: direction,

        VITESSE: vitesse,

        DISTANCE: distance,

        HAUTEUR: hauteur

    };


    //==========================================================
    // 🧹 NETTOYAGE
    //==========================================================

    for (
        const key
        of Object.keys(slots)
    ) {

        if (
            slots[key] === null ||
            slots[key] === undefined
        ) {

            delete slots[key];

        }

    }


    //==========================================================
    // 📤 RÉSULTAT
    //==========================================================

    return {

        verbe,

        indexVerbe,

        categorie,

        famille,

        slots

    };
}
    

function neoComparerModeleCombat(analyse, modele) {

    const slots = analyse.slots || {};
    const requis = modele.requis || [];
    const structure = modele.structure || [];

    let score = 0;
    let total = 0;

    /*
     * Les éléments obligatoires ont un poids très fort.
     */

    for (const champ of requis) {

        total += 4;

        if (slots[champ]) {
            score += 4;
        }
    }

    /*
     * Les éléments optionnels apportent des points.
     */

    for (const champ of structure) {

        if (requis.includes(champ)) {
            continue;
        }

        total += 1;

        if (slots[champ]) {
            score += 1;
        }
    }

    /*
     * Bonus : cohérence famille / trajectoire.
     */

    if (
        analyse.famille === "circulaire" &&
        structure.includes("COTE")
    ) {
        score += 1;
        total += 1;
    }

    if (
        analyse.famille === "circulaire" &&
        structure.includes("COURBE")
    ) {
        score += 1;
        total += 1;
    }

    /*
     * Si un champ requis manque,
     * le modèle ne doit jamais être considéré
     * comme parfaitement validé.
     */

    const requisManquants = requis.filter(
        champ => !slots[champ]
    );

    let pourcentage = total > 0
        ? Math.round((score / total) * 100)
        : 0;

    if (requisManquants.length > 0) {
        pourcentage = Math.min(
            pourcentage,
            69
        );
    }

    return {
        score: pourcentage,
        requisManquants
    };
}

//==============================================================
// 🧭 DÉTERMINER LA CATÉGORIE COMBAT DEPUIS LE VERBE
//==============================================================
//
// Le verbe est la première source de routage.
// Aucun tableau manuel de mots n'est utilisé.
//
// Exemple :
// "frappe" → frapper → attaque
// "fonce"  → foncer  → deplacement
//
//==============================================================

function neoDeterminerCategorieCombat(verbe) {

    if (!verbe) return null;

    const lemme =
        typeof verbe === "string"
            ? verbe
            : verbe.lemme;

    if (!lemme) return null;

    const lemmeNormalise =
        neoSansAccents(lemme);

    let meilleureCategorie = null;
    let meilleurScore = 0;


    //==========================================================
    // 🔎 PARCOURS RÉCURSIF DES MODÈLES
    //==========================================================

    function parcourir(noeud, categorie) {

        if (Array.isArray(noeud)) {

            for (const modele of noeud) {

                if (!modele) continue;

                const slots =
                    modele.slots || {};


                //================================================
                // ⚔️ ACTION DIRECTE
                //================================================

                if (slots.ACTION) {

                    const action =
                        neoSansAccents(
                            slots.ACTION
                        );

                    if (
                        action ===
                        lemmeNormalise
                    ) {

                        return 100;

                    }
                }


                //================================================
                // 🏃 MANIÈRE DE DÉPLACEMENT
                //================================================

                if (slots.MANIERE) {

                    const maniere =
                        neoSansAccents(
                            slots.MANIERE
                        );

                    if (
                        maniere ===
                        lemmeNormalise
                    ) {

                        return 100;

                    }
                }
            }

            return 0;
        }


        if (
            !noeud ||
            typeof noeud !== "object"
        ) {

            return 0;

        }


        let score = 0;

        for (
            const valeur
            of Object.values(noeud)
        ) {

            score = Math.max(
                score,
                parcourir(
                    valeur,
                    categorie
                )
            );

            if (score === 100) {
                break;
            }
        }

        return score;
    }


    //==========================================================
    // 🔎 TEST DE CHAQUE CATÉGORIE
    //==========================================================

    for (
        const [categorie, branche]
        of Object.entries(
            NEO_COMBAT_MODELS
        )
    ) {

        const score =
            parcourir(
                branche,
                categorie
            );

        if (
            score >
            meilleurScore
        ) {

            meilleurScore = score;
            meilleureCategorie =
                categorie;

        }
    }


    return meilleureCategorie;
}

//==============================================================
// 🧠 MEILLEUR MODÈLE COMBAT
//==============================================================
//
// 1. Utilise la catégorie déterminée par le verbe.
// 2. N'examine QUE cette branche.
// 3. Parcourt automatiquement toutes les sous-branches.
// 4. Compare les modèles compatibles.
// 5. Retourne le meilleur.
//
// Aucun traitement spécifique à attaque/esquive/parade/etc.
// n'est nécessaire.
//
//==============================================================

function neoTrouverMeilleurModeleCombat(analyse) {

    if (
        !analyse ||
        !analyse.categorie
    ) {

        return null;

    }


    const categorie =
        analyse.categorie;


    const branche =
        NEO_COMBAT_MODELS[
            categorie
        ];


    if (!branche) {

        return null;

    }


    const meilleurs = [];


    //==========================================================
    // 🔎 PARCOURS RÉCURSIF
    //==========================================================

    function parcourir(
        noeud,
        chemin = []
    ) {

        //======================================================
        // 📚 LISTE DE MODÈLES
        //======================================================

        if (Array.isArray(noeud)) {

            for (
                const modele
                of noeud
            ) {

                if (!modele) continue;


                const comparaison =
                    neoComparerModeleCombat(
                        analyse,
                        modele
                    );


                meilleurs.push({

                    categorie,

                    famille:
                        chemin[
                            chemin.length - 1
                        ] || null,

                    chemin,

                    modele,

                    score:
                        comparaison.score,

                    requisManquants:
                        comparaison.requisManquants

                });

            }

            return;
        }


        //======================================================
        // 📦 OBJET / SOUS-BRANCHE
        //======================================================

        if (
            !noeud ||
            typeof noeud !== "object"
        ) {

            return;

        }


        for (
            const [
                cle,
                valeur
            ]
            of Object.entries(noeud)
        ) {

            parcourir(
                valeur,
                [
                    ...chemin,
                    cle
                ]
            );

        }
    }


    //==========================================================
    // 🚀 LANCEMENT
    //==========================================================

    parcourir(branche);


    //==========================================================
    // 🏆 TRI
    //==========================================================

    meilleurs.sort(
        (a, b) =>
            b.score -
            a.score
    );


    return (
        meilleurs[0] ||
        null
    );
}

function neoGenererComprehensionCombat(analyse) {

    const slots = analyse.slots || {};

    const lignes = [];

    const labels = {
        SUJET: "Sujet",
        ACTION: "Action",
        MANIERE: "Manière",
        CIBLE: "Cible",
        TRAJECTOIRE: "Trajectoire",
        COTE: "Côté",
        COURBE: "Courbe",
        DIRECTION: "Direction",
        VITESSE: "Vitesse",
        DISTANCE: "Distance",
        HAUTEUR: "Hauteur"
    };

    for (const [cle, label] of Object.entries(labels)) {

        if (!slots[cle]) continue;

        let valeur = slots[cle];

        if (
            typeof valeur === "object" &&
            valeur.valeur !== undefined
        ) {
            valeur =
                `${valeur.valeur} ${valeur.unite}`;
        }

        lignes.push(
            `${label} : ${valeur}`
        );
    }

    return lignes.join("\n");
}

//* =====================================================
     // GÉNÉRATION DU RESUME 
     //* =====================================================
function neoGenererResumeCombat(analyse) {

    const s = analyse.slots || {};

    const sujet = s.SUJET || "Le combattant";
    const cible = s.CIBLE || "";
    const categorie = analyse.categorie || "";
    const modele = analyse.modele || "";
    const famille = analyse.famille || "";

    /*
     * =====================================================
     * RECHERCHE DES REFORMULATIONS
     * =====================================================
     */

    let reformulations = null;

    /*
     * 1. Recherche par catégorie + modèle
     */

    if (
        typeof NEO_COMBAT_RESUMES !== "undefined" &&
        NEO_COMBAT_RESUMES[categorie] &&
        NEO_COMBAT_RESUMES[categorie][modele]
    ) {
        reformulations =
            NEO_COMBAT_RESUMES[categorie][modele];
    }

    /*
     * 2. Recherche par catégorie + famille
     */

    if (
        !reformulations &&
        typeof NEO_COMBAT_RESUMES !== "undefined" &&
        NEO_COMBAT_RESUMES[categorie] &&
        NEO_COMBAT_RESUMES[categorie][famille]
    ) {
        reformulations =
            NEO_COMBAT_RESUMES[categorie][famille];
    }

    /*
     * 3. Recherche générique par catégorie
     */

    if (
        !reformulations &&
        typeof NEO_COMBAT_RESUMES !== "undefined" &&
        NEO_COMBAT_RESUMES[categorie] &&
        Array.isArray(NEO_COMBAT_RESUMES[categorie].default)
    ) {
        reformulations =
            NEO_COMBAT_RESUMES[categorie].default;
    }


    /*
     * =====================================================
     * AUCUNE REFORMULATION
     * =====================================================
     */

    if (
        !reformulations ||
        !Array.isArray(reformulations) ||
        reformulations.length === 0
    ) {

        /*
         * Fallback minimal.
         * Le moteur ne plante jamais même si aucun
         * modèle de reformulation n'a encore été ajouté.
         */

        const action =
            s.ACTION ||
            "effectue une action";

        let phrase =
            `${sujet} ${action}`;

        if (cible) {
            phrase += ` vers ${cible}`;
        }

        return phrase + ".";
    }


    /*
     * =====================================================
     * CHOIX ALÉATOIRE
     * =====================================================
     */

    const modelePhrase =
        reformulations[
            Math.floor(
                Math.random() * reformulations.length
            )
        ];


    /*
     * =====================================================
     * REMPLACEMENT DES VARIABLES
     * =====================================================
     */

    const valeurs = {
        SUJET: sujet,
        ACTION: s.ACTION || "",
        MANIERE: s.MANIERE || "",
        CIBLE: cible,
        TYPE: s.TYPE || "",
        TRAJECTOIRE: s.TRAJECTOIRE || "",
        MOUVEMENT: s.MOUVEMENT || "",
        VITESSE: s.VITESSE || "",
        COTE: s.COTE || "",
        DIRECTION: s.DIRECTION || "",
        DISTANCE: s.DISTANCE
            ? `${s.DISTANCE.valeur} ${s.DISTANCE.unite}`
            : "",
        HAUTEUR: s.HAUTEUR
            ? `${s.HAUTEUR.valeur} ${s.HAUTEUR.unite}`
            : "",
        PARTIE:
            s.PARTIE ||
            s.PARTIE_DU_CORPS ||
            ""
    };


    let phrase = modelePhrase;

    /*
     * Remplace :
     * {SUJET}
     * {ACTION}
     * {CIBLE}
     * etc.
     */

    phrase = phrase.replace(
        /\{([A-Z_]+)\}/g,
        (match, cle) => {

            if (
                Object.prototype.hasOwnProperty.call(
                    valeurs,
                    cle
                )
            ) {
                return valeurs[cle];
            }

            return match;
        }
    );


    /*
     * Nettoyage
     */

    phrase = phrase
        .replace(/\s+/g, " ")
        .replace(/\s+([,.!?])/g, "$1")
        .trim();


    /*
     * Ponctuation finale
     */

    if (
        !/[.!?]$/.test(phrase)
    ) {
        phrase += ".";
    }

    return phrase;
}


function neoAnalyserCombat(texte) {

    const analyse =
    neoAnalyserStructureCombat(texte);


//==========================================================
// 🧭 ROUTAGE PAR VERBE
//==========================================================

const verbe =
    analyse.verbe ||
    null;

const categorie =
    neoDeterminerCategorieCombat(
        verbe
    );


//==========================================================
// 🏷️ CATÉGORIE
//==========================================================

analyse.categorie =
    categorie;


//==========================================================
// 🧠 RECHERCHE DU MODÈLE
//==========================================================

const meilleur =
    neoTrouverMeilleurModeleCombat(
        analyse
    );

    if (!meilleur) {
        return {
            trouve: false,
            score: 0,
            famille: null,
            modele: null,
            structure: [],
            slots: analyse.slots,
            comprehension: neoGenererComprehensionCombat(analyse),
            resume: neoGenererResumeCombat(analyse)
        };
    }

    return {
        trouve: meilleur.score >= 70,

        score: meilleur.score,

        categorie: meilleur.categorie,

        famille: meilleur.famille,

        modele: meilleur.modele.id,

        structure: meilleur.modele.structure,

        slots: analyse.slots,

        requisManquants:
            meilleur.requisManquants,

        comprehension:
            neoGenererComprehensionCombat(analyse),

        resume:
            neoGenererResumeCombat(analyse)
    };
}


        
//==============================================================
// 📚 VERBES
//==============================================================
//
// Les verbes sont la base d'action de NeoAI.
// Les formes permettent de reconnaître différentes
// conjugaisons sans construire un analyseur grammatical.
//
//==============================================================

const NEO_VERBES = {

    fr: {

        //========================================================
        // 🧠 VIE COURANTE / GÉNÉRAL
        //========================================================

        aller: [
            "aller",
            "vais",
            "vas",
            "va",
            "allons",
            "allez",
            "vont",
            "allais",
            "allait",
            "allions",
            "alliez",
            "allaient",
            "irai",
            "iras",
            "ira",
            "irons",
            "irez",
            "iront",
            "allant",
            "allé",
            "allée",
            "allés",
            "allées"
        ],

        avoir: [
            "avoir",
            "ai",
            "as",
            "a",
            "avons",
            "avez",
            "ont",
            "avais",
            "avait",
            "avions",
            "aviez",
            "avaient",
            "aurai",
            "auras",
            "aura",
            "aurons",
            "aurez",
            "auront",
            "ayant",
            "eu",
            "eue",
            "eus",
            "eues"
        ],

        être: [
            "être",
            "suis",
            "es",
            "est",
            "sommes",
            "êtes",
            "sont",
            "étais",
            "était",
            "étions",
            "étiez",
            "étaient",
            "serai",
            "seras",
            "sera",
            "serons",
            "serez",
            "seront",
            "étant",
            "été"
        ],

        faire: [
            "faire",
            "fais",
            "fait",
            "faisons",
            "faites",
            "font",
            "faisais",
            "faisait",
            "faisions",
            "faisiez",
            "faisaient",
            "ferai",
            "feras",
            "fera",
            "ferons",
            "ferez",
            "feront",
            "faisant",
            "faite",
            "faits",
            "faites"
        ],

        chercher: [
            "chercher",
            "cherche",
            "cherches",
            "cherchons",
            "cherchez",
            "cherchent",
            "cherchais",
            "cherchait",
            "cherchions",
            "cherchiez",
            "cherchaient",
            "chercherai",
            "cherchera",
            "chercherons",
            "cherchant",
            "cherché"
        ],

        comprendre: [
            "comprendre",
            "comprends",
            "comprend",
            "comprenons",
            "comprenez",
            "comprennent",
            "comprenais",
            "comprenait",
            "comprendrai",
            "comprendra",
            "comprenant",
            "compris",
            "comprise"
        ],

        devoir: [
            "devoir",
            "dois",
            "doit",
            "devons",
            "devez",
            "doivent",
            "devais",
            "devait",
            "devrai",
            "devra",
            "devant",
            "dû",
            "due"
        ],

        dire: [
            "dire",
            "dis",
            "dit",
            "disons",
            "dites",
            "disent",
            "disais",
            "disait",
            "dirai",
            "dira",
            "disant"
        ],

        écouter: [
            "écouter",
            "écoute",
            "écoutes",
            "écoutons",
            "écoutez",
            "écoutent",
            "écoutais",
            "écoutait",
            "écouterai",
            "écoutera",
            "écoutant",
            "écouté"
        ],

        entendre: [
            "entendre",
            "entends",
            "entend",
            "entendons",
            "entendez",
            "entendent",
            "entendais",
            "entendait",
            "entendrai",
            "entendra",
            "entendant",
            "entendu"
        ],

        parler: [
            "parler",
            "parle",
            "parles",
            "parlons",
            "parlez",
            "parlent",
            "parlais",
            "parlait",
            "parlerai",
            "parlera",
            "parlant",
            "parlé"
        ],

        penser: [
            "penser",
            "pense",
            "penses",
            "pensons",
            "pensez",
            "pensent",
            "pensais",
            "pensait",
            "penserai",
            "pensera",
            "pensant",
            "pensé"
        ],

        pouvoir: [
            "pouvoir",
            "peux",
            "peut",
            "pouvons",
            "pouvez",
            "peuvent",
            "pouvais",
            "pouvait",
            "pourrai",
            "pourra",
            "pouvant",
            "pu"
        ],

        regarder: [
            "regarder",
            "regarde",
            "regardes",
            "regardons",
            "regardez",
            "regardent",
            "regardais",
            "regardait",
            "regarderai",
            "regardera",
            "regardant",
            "regardé"
        ],

        savoir: [
            "savoir",
            "sais",
            "sait",
            "savons",
            "savez",
            "savent",
            "savais",
            "savait",
            "saurai",
            "saura",
            "sachant",
            "su"
        ],

        sentir: [
            "sentir",
            "sens",
            "sent",
            "sentons",
            "sentez",
            "sentent",
            "sentais",
            "sentait",
            "sentirai",
            "sentira",
            "sentant",
            "senti"
        ],

        trouver: [
            "trouver",
            "trouve",
            "trouves",
            "trouvons",
            "trouvez",
            "trouvent",
            "trouvais",
            "trouvait",
            "trouverai",
            "trouvera",
            "trouvant",
            "trouvé"
        ],

        venir: [
            "venir",
            "viens",
            "vient",
            "venons",
            "venez",
            "viennent",
            "venais",
            "venait",
            "viendrai",
            "viendra",
            "venant",
            "venu"
        ],

        voir: [
            "voir",
            "vois",
            "voit",
            "voyons",
            "voyez",
            "voient",
            "voyais",
            "voyait",
            "verrai",
            "verra",
            "voyant",
            "vu"
        ],

        vouloir: [
            "vouloir",
            "veux",
            "veut",
            "voulons",
            "voulez",
            "veulent",
            "voulais",
            "voulait",
            "voudrai",
            "voudra",
            "voulant",
            "voulu"
        ],


        //========================================================
        // 🚶 DÉPLACEMENT
        //========================================================

        accélérer: [
            "accélérer",
            "accélère",
            "accélères",
            "accélérons",
            "accélérez",
            "accélèrent",
            "accélérais",
            "accélérait",
            "accélérant",
            "accéléré"
        ],

        approcher: [
            "approcher",
            "approche",
            "approches",
            "approchons",
            "approchez",
            "approchent",
            "approchait",
            "approchant",
            "approché"
        ],

        arriver: [
            "arriver",
            "arrive",
            "arrives",
            "arrivons",
            "arrivez",
            "arrivent",
            "arrivait",
            "arrivant",
            "arrivé"
        ],

        avancer: [
            "avancer",
            "avance",
            "avances",
            "avançons",
            "avancez",
            "avancent",
            "avançais",
            "avançait",
            "avançant",
            "avancé"
        ],

        courir: [
            "courir",
            "cours",
            "court",
            "courons",
            "courez",
            "courent",
            "courais",
            "courait",
            "courant",
            "couru"
        ],

        descendre: [
            "descendre",
            "descends",
            "descend",
            "descendons",
            "descendez",
            "descendent",
            "descendais",
            "descendait",
            "descendant",
            "descendu"
        ],

        entrer: [
            "entrer",
            "entre",
            "entres",
            "entrons",
            "entrez",
            "entrent",
            "entrais",
            "entrait",
            "entrant",
            "entré"
        ],

        grimper: [
            "grimper",
            "grimpe",
            "grimpes",
            "grimpons",
            "grimpez",
            "grimpent",
            "grimpais",
            "grimpait",
            "grimpant",
            "grimpé"
        ],

        marcher: [
            "marcher",
            "marche",
            "marches",
            "marchons",
            "marchez",
            "marchent",
            "marchais",
            "marchait",
            "marchant",
            "marché"
        ],

        monter: [
            "monter",
            "monte",
            "montes",
            "montons",
            "montez",
            "montent",
            "montais",
            "montait",
            "montant",
            "monté"
        ],

        partir: [
            "partir",
            "pars",
            "part",
            "partons",
            "partez",
            "partent",
            "partais",
            "partait",
            "partant",
            "parti"
        ],

        ramper: [
            "ramper",
            "rampe",
            "rampes",
            "rampons",
            "rampez",
            "rampent",
            "rampais",
            "rampait",
            "rampant",
            "rampé"
        ],

        reculer: [
            "reculer",
            "recule",
            "recules",
            "reculons",
            "reculez",
            "reculent",
            "reculais",
            "reculait",
            "reculant",
            "reculé"
        ],

        sauter: [
            "sauter",
            "saute",
            "sautes",
            "sautons",
            "sautez",
            "sautent",
            "sautais",
            "sautait",
            "sautant",
            "sauté"
        ],

        foncer: [
            "foncer",
            "fonce",
            "fonces",
            "fonçons",
            "foncez",
            "foncent",
            "fonçait",
            "fonçant",
            "foncé"
        ],

        se_diriger: [
            "se diriger",
            "se dirige",
            "se dirigent",
            "se dirigeait",
            "se dirigeant"
        ],


        //========================================================
        // ⚔️ COMBAT
        //========================================================

        attaquer: [
            "attaquer",
            "attaque",
            "attaques",
            "attaquons",
            "attaquez",
            "attaquent",
            "attaquait",
            "attaquant",
            "attaqué"
        ],

        frapper: [
            "frapper",
            "frappe",
            "frappes",
            "frappons",
            "frappez",
            "frappent",
            "frappait",
            "frappant",
            "frappé"
        ],

        bloquer: [
            "bloquer",
            "bloque",
            "bloques",
            "bloquons",
            "bloquez",
            "bloquent",
            "bloquait",
            "bloquant",
            "bloqué"
        ],

        défendre: [
            "défendre",
            "défends",
            "défend",
            "défendons",
            "défendez",
            "défendent",
            "défendait",
            "défendant",
            "défendu"
        ],

        esquiver: [
            "esquiver",
            "esquive",
            "esquives",
            "esquivons",
            "esquivez",
            "esquivent",
            "esquivait",
            "esquivant",
            "esquivé"
        ],

        saisir: [
            "saisir",
            "saisis",
            "saisit",
            "saisissons",
            "saisissez",
            "saisissent",
            "saisissant",
            "saisi"
        ],

        attraper: [
            "attraper",
            "attrape",
            "attrapes",
            "attrapons",
            "attrapez",
            "attrapent",
            "attrapait",
            "attrapant",
            "attrapé"
        ],

        pousser: [
            "pousser",
            "pousse",
            "pousses",
            "poussons",
            "poussez",
            "poussent",
            "poussait",
            "poussant",
            "poussé"
        ],

        tirer: [
            "tirer",
            "tire",
            "tires",
            "tirons",
            "tirez",
            "tirent",
            "tirait",
            "tirant",
            "tiré"
        ],

        frapper_avec: [
            "frapper",
            "donner",
            "porter",
            "asséner"
        ],


        //========================================================
        // ⚽ FOOTBALL
        //========================================================

        passer: [
            "passer",
            "passe",
            "passes",
            "passons",
            "passez",
            "passent",
            "passait",
            "passant",
            "passé"
        ],

        tirer: [
            "tirer",
            "tire",
            "tires",
            "tirons",
            "tirez",
            "tirent",
            "tirait",
            "tirant",
            "tiré"
        ],

        contrôler: [
            "contrôler",
            "contrôle",
            "contrôles",
            "contrôlons",
            "contrôlez",
            "contrôlent",
            "contrôlait",
            "contrôlant",
            "contrôlé"
        ],

        dribbler: [
            "dribbler",
            "dribble",
            "dribbles",
            "dribblons",
            "dribblez",
            "dribblent",
            "dribblait",
            "dribblant",
            "dribblé"
        ],

        conduire: [
            "conduire",
            "conduis",
            "conduit",
            "conduisons",
            "conduisez",
            "conduisent",
            "conduisait",
            "conduisant",
            "conduit"
        ],

        centrer: [
            "centrer",
            "centre",
            "centres",
            "centrons",
            "centrez",
            "centrent",
            "centrant",
            "centré"
        ],

        marquer: [
            "marquer",
            "marque",
            "marques",
            "marquons",
            "marquez",
            "marquent",
            "marquait",
            "marquant",
            "marqué"
        ],


        //========================================================
        // ✈️ VOYAGE
        //========================================================

        voyager: [
            "voyager",
            "voyage",
            "voyages",
            "voyageons",
            "voyagez",
            "voyagent",
            "voyageait",
            "voyageant",
            "voyagé"
        ],

        conduire_un_vehicule: [
            "conduire",
            "conduis",
            "conduit",
            "conduisons",
            "conduisez",
            "conduisent"
        ],

        réserver: [
            "réserver",
            "réserve",
            "réserves",
            "réservons",
            "réservez",
            "réservent",
            "réservait",
            "réservant",
            "réservé"
        ],

        visiter: [
            "visiter",
            "visite",
            "visites",
            "visitons",
            "visitez",
            "visitent",
            "visitait",
            "visitant",
            "visité"
        ]

    }

};


// 🧱 NOMS / OBJETS / PERSONNES / LIEUX
//==============================================================

const NEO_NOMS = {

    fr: {

        personnes: [
            "personne",
            "homme",
            "femme",
            "enfant",
            "adolescent",
            "adulte",
            "joueur",
            "combattant",
            "adversaire",
            "ami",
            "ennemi",
            "voyageur",
            "gardien",
            "attaquant",
            "défenseur",
            "passager",
            "conducteur",
            "capitaine",
            "soldat",
            "guerrier",
            "chef",
            "leader",
            "guide",
            "professeur",
            "élève",
            "médecin",
            "infirmier",
            "policier",
            "agent",
            "client",
            "vendeur",
            "acheteur",
            "spectateur",
            "arbitre",
            "entraîneur",
            "coéquipier",
            "rival",
            "partenaire",
            "propriétaire",
            "invité",
            "inconnu",
            "victime",
            "héros",
            "ennemi",
            "cible"
        ],

        animaux: [
            "lion",
            "tigre",
            "chien",
            "chat",
            "cheval",
            "loup",
            "ours",
            "chèvre",
            "mouton",
            "oiseau",
            "serpent",
            "poisson",
            "aigle",
            "faucon",
            "requin",
            "dauphin",
            "éléphant",
            "girafe",
            "zèbre",
            "singe",
            "gorille",
            "renard",
            "cerf",
            "lapin",
            "rat",
            "souris",
            "taureau",
            "vache",
            "cochon",
            "poule",
            "coq",
            "canard",
            "corbeau",
            "hibou",
            "araignée",
            "insecte",
            "abeille",
            "papillon",
            "tortue",
            "lézard"
        ],

        corps: [
            "corps",
            "tête",
            "visage",
            "front",
            "nez",
            "bouche",
            "œil",
            "yeux",
            "oreille",
            "cou",
            "épaule",
            "bras",
            "avant-bras",
            "main",
            "doigt",
            "poitrine",
            "ventre",
            "dos",
            "jambe",
            "genou",
            "pied",
            "cheville",
            "hanche",
            "cuisse",
            "mollet",
            "poignet",
            "coude",
            "paume",
            "ongle",
            "dent",
            "langue",
            "menton",
            "joue",
            "mâchoire",
            "tempe",
            "crâne",
            "gorge",
            "nuque",
            "torse",
            "abdomen",
            "taille",
            "talon",
            "orteil",
            "doigts",
            "poings"
        ],

        objets: [
            "objet",
            "arme",
            "épée",
            "couteau",
            "bâton",
            "ballon",
            "livre",
            "sac",
            "clé",
            "téléphone",
            "ordinateur",
            "véhicule",
            "voiture",
            "moto",
            "train",
            "avion",
            "bateau",
            "pistolet",
            "bouclier",
            "casque",
            "armure",
            "chaise",
            "table",
            "lit",
            "porte",
            "fenêtre",
            "mur",
            "lampe",
            "télévision",
            "écran",
            "clavier",
            "souris",
            "stylo",
            "crayon",
            "papier",
            "cahier",
            "boîte",
            "bouteille",
            "verre",
            "assiette",
            "tasse",
            "montre",
            "lunettes",
            "vêtement",
            "chaussure",
            "corde",
            "chaîne",
            "marteau",
            "pierre",
            "balle"
        ],

        lieux: [
            "lieu",
            "maison",
            "chambre",
            "école",
            "hôpital",
            "ville",
            "pays",
            "route",
            "rue",
            "gare",
            "aéroport",
            "hôtel",
            "terrain",
            "stade",
            "surface",
            "zone",
            "sol",
            "mur",
            "porte",
            "marché",
            "magasin",
            "restaurant",
            "bureau",
            "parc",
            "jardin",
            "plage",
            "forêt",
            "montagne",
            "rivière",
            "lac",
            "mer",
            "océan",
            "île",
            "village",
            "quartier",
            "centre",
            "place",
            "pont",
            "tunnel",
            "parking",
            "station",
            "université",
            "bibliothèque",
            "gymnase",
            "arène",
            "dojo",
            "prison",
            "laboratoire",
            "usine",
            "boutique"
        ],

        football: [
            "ballon",
            "but",
            "filet",
            "terrain",
            "stade",
            "joueur",
            "gardien",
            "défenseur",
            "milieu",
            "attaquant",
            "adversaire",
            "équipe",
            "match",
            "passe",
            "tir",
            "dribble",
            "corner",
            "penalty",
            "coup",
            "faute",
            "arbitre",
            "capitaine",
            "remplaçant",
            "coéquipier",
            "coach",
            "entraîneur",
            "score",
            "but",
            "surface",
            "ligne",
            "centre",
            "aile",
            "axe",
            "défense",
            "attaque",
            "milieu",
            "possession",
            "contre-attaque",
            "occasion",
            "victoire",
            "défaite",
            "égalité",
            "tacle",
            "contrôle",
            "pied",
            "passe",
            "frappe",
            "feinte",
            "marquage"
        ],

        voyage: [
            "voyage",
            "billet",
            "train",
            "avion",
            "bateau",
            "gare",
            "aéroport",
            "hôtel",
            "chambre",
            "bagage",
            "valise",
            "passeport",
            "pays",
            "ville",
            "destination",
            "départ",
            "arrivée",
            "voyageur",
            "passager",
            "conducteur",
            "pilote",
            "gare",
            "station",
            "bus",
            "taxi",
            "métro",
            "route",
            "autoroute",
            "frontière",
            "douane",
            "carte",
            "itinéraire",
            "trajet",
            "direction",
            "escale",
            "réservation",
            "chambre",
            "réception",
            "touriste",
            "guide",
            "monument",
            "visite",
            "excursion",
            "plage",
            "île",
            "port",
            "terminal"
        ],

        concepts: [
            "temps",
            "distance",
            "vitesse",
            "direction",
            "position",
            "action",
            "mouvement",
            "cible",
            "objectif",
            "manière",
            "cause",
            "raison",
            "résultat",
            "départ",
            "arrivée",
            "origine",
            "destination",
            "trajectoire",
            "orientation",
            "rotation",
            "accélération",
            "ralentissement",
            "impact",
            "force",
            "énergie",
            "puissance",
            "équilibre",
            "déséquilibre",
            "stabilité",
            "danger",
            "risque",
            "attaque",
            "défense",
            "combat",
            "duel",
            "victoire",
            "défaite",
            "score",
            "point",
            "niveau",
            "rang",
            "grade",
            "condition",
            "situation",
            "contexte",
            "structure",
            "phrase",
            "verbe",
            "sujet",
            "objet",
            "complément",
            "description",
            "information",
            "réponse",
            "question",
            "message",
            "texte",
            "mot",
            "sens",
            "idée",
            "pensée",
            "intention",
            "possibilité",
            "probabilité",
            "erreur",
            "validation",
            "similarité",
            "modèle",
            "formule",
            "catégorie",
            "classification"
        ]

    }

};


//==============================================================
// 🔤 AUTRES MOTS
//==============================================================

const NEO_ADJECTIFS = {

    fr: [
        "grand",
        "petit",
        "fort",
        "faible",
        "rapide",
        "lent",
        "agile",
        "brutal",
        "direct",
        "violent",
        "calme",
        "dangereux",
        "puissant",
        "précis",
        "proche",
        "lointain",
        "haut",
        "bas",
        "gros",
        "jeune",
        "vieux",
        "nouveau",
        "ancien",
        "bon",
        "mauvais",
        "important",
        "difficile",
        "facile",
        "géant",
        "gigantesque",
        "minuscule",
        "énorme",
        "immense",
        "large",
        "étroit",
        "long",
        "court",
        "épais",
        "fin",
        "lourd",
        "léger",
        "solide",
        "fragile",
        "résistant",
        "endurant",
        "fatigué",
        "épuisé",
        "blessé",
        "sain",
        "vivant",
        "mort",
        "actif",
        "immobile",
        "mobile",
        "stable",
        "instable",
        "souple",
        "rigide",
        "nerveux",
        "serein",
        "furieux",
        "énervé",
        "concentré",
        "attentif",
        "distrait",
        "prudent",
        "imprudent",
        "courageux",
        "peureux",
        "audacieux",
        "agressif",
        "défensif",
        "offensif",
        "menaçant",
        "terrifiant",
        "impressionnant",
        "redoutable",
        "inoffensif",
        "silencieux",
        "bruyant",
        "discret",
        "visible",
        "invisible",
        "clair",
        "sombre",
        "propre",
        "sale",
        "sec",
        "mouillé",
        "chaud",
        "froid",
        "dur",
        "mou",
        "simple",
        "complexe",
        "robuste",
        "énergique",
        "vigoureux"
    ]

};

const NEO_ADVERBES = {

fr: [
    "rapidement",
    "lentement",
    "brutalement",
    "violemment",
    "doucement",
    "calmement",
    "directement",
    "précisément",
    "fortement",
    "faiblement",
    "soudainement",
    "immédiatement",
    "progressivement",
    "silencieusement",
    "prudemment",
    "agilement",
    "habilement",
    "fermement",
    "puissamment",
    "violemment",
    "dangereusement",
    "précipitamment",
    "lentement",
    "rapidement",
    "discrètement",
    "bruyamment",
    "nerveusement",
    "sereinement",
    "attentivement",
    "soigneusement",
    "précautionneusement",
    "courageusement",
    "audacieusement",
    "agressivement",
    "défensivement",
    "offensivement",
    "silencieusement",
    "visiblement",
    "invisiblement",
    "facilement",
    "difficilement",
    "simplement",
    "complexement",
    "efficacement",
    "correctement",
    "incorrectement",
    "exactement",
    "approximativement",
    "totalement",
    "partiellement",
    "complètement",
    "presque",
    "beaucoup",
    "peu",
    "assez",
    "très",
    "trop",
    "davantage",
    "moins",
    "plus",
    "suffisamment",
    "fort",
    "mal",
    "bien",
    "mieux",
    "pire",
    "ensemble",
    "séparément",
    "successivement",
    "simultanément",
    "brusquement",
    "subitement",
    "instantanément",
    "finalement",
    "définitivement",
    "continuellement",
    "constamment",
    "régulièrement",
    "fréquemment",
    "rarement",
    "parfois",
    "souvent",
    "toujours",
    "jamais",
    "désormais",
    "actuellement",
    "auparavant",
    "ensuite",
    "d'abord",
    "puis",
    "alors",
    "ici",
    "ailleurs",
    "partout",
    "dessus",
    "dessous",
    "devant",
    "derrière"
]

};

const NEO_PREPOSITIONS = {

    fr: [
        "à",
        "au",
        "aux",
        "de",
        "du",
        "des",
        "dans",
        "en",
        "vers",
        "sur",
        "sous",
        "avec",
        "sans",
        "pour",
        "par",
        "entre",
        "contre",
        "devant",
        "derrière",
        "près",
        "loin",

        "chez",
        "parmi",
        "depuis",
        "avant",
        "après",
        "pendant",
        "durant",
        "malgré",
        "selon",
        "suivant",
        "envers",
        "excepté",
        "hormis",
        "sauf",
        "outre",
        "via",
        "jusque",
        "jusqu'à",
        "quant à",
        "grâce à",
        "à cause de",
        "à côté de",
        "au-dessus de",
        "au-dessous de",
        "au-delà de",
        "en face de",
        "face à",
        "auprès de",
        "autour de",
        "au milieu de",
        "au centre de",
        "à travers",
        "à travers de",
        "à proximité de",
        "à distance de",
        "à partir de",
        "à destination de",
        "à l'intérieur de",
        "à l'extérieur de",
        "à droite de",
        "à gauche de",
        "en haut de",
        "en bas de",
        "en dehors de",
        "en dedans de",
        "en direction de",
        "en provenance de",
        "en raison de",
        "au lieu de",
        "à défaut de",
        "à l'aide de",
        "à force de",
        "à partir du",
        "à partir des",
        "à partir duquel",
        "à partir de laquelle",
        "au moyen de",
        "au sujet de",
        "à propos de",
        "en plus de",
        "en moins de",
        "en compagnie de",
        "en présence de",
        "en absence de",
        "en dehors de",
        "indépendamment de",
        "contrairement à",
        "conformément à",
        "comparativement à",
        "relativement à",
        "par rapport à",
        "vis-à-vis de",
        "quant à",
        "jusqu'au",
        "jusqu'aux",
        "jusqu'en"
    ]

};

const NEO_CONNECTEURS = {

    fr: [
        "et",
        "ou",
        "mais",
        "donc",
        "puis",
        "ensuite",
        "alors",
        "avant",
        "après",
        "pendant",
        "lorsque",
        "quand",
        "parce que",
        "afin de",
        "sans",
        "pour",
        "car",
        "ni",
        "or",
        "pourtant",
        "cependant",
        "toutefois",
        "néanmoins",
        "ainsi",
        "également",
        "aussi",
        "enfin",
        "d'abord",
        "premièrement",
        "deuxièmement",
        "finalement",
        "bref",
        "puisque",
        "comme",
        "quoique",
        "bien que",
        "même si",
        "si",
        "tandis que",
        "alors que",
        "pendant que",
        "depuis que",
        "dès que",
        "aussitôt que",
        "avant que",
        "après que",
        "jusqu'à ce que",
        "pour que",
        "afin que",
        "sans que",
        "étant donné que",
        "vu que",
        "du fait que",
        "de sorte que",
        "de façon que",
        "de manière que",
        "si bien que",
        "tellement que",
        "tant que",
        "à condition que",
        "à moins que",
        "pourvu que",
        "dans le cas où",
        "au cas où",
        "même lorsque",
        "en revanche",
        "au contraire",
        "par contre",
        "d'un côté",
        "de l'autre",
        "en plus",
        "de plus",
        "par ailleurs",
        "en outre",
        "notamment",
        "par exemple",
        "autrement dit",
        "c'est-à-dire",
        "en effet",
        "en réalité",
        "en fait",
        "ainsi que",
        "de même que",
        "comme si",
        "plutôt que",
        "au lieu de",
        "de peur de",
        "de crainte de",
        "à force de",
        "en conséquence",
        "par conséquent",
        "en premier lieu",
        "en second lieu",
        "en dernier lieu",
        "pour commencer",
        "pour finir",
        "en conclusion",
        "en résumé",
        "en somme",
        "par la suite",
        "entre-temps",
        "simultanément"
    ]

};


const NEO_PRONOMS = {

    fr: [
        "je",
        "tu",
        "il",
        "elle",
        "on",
        "nous",
        "vous",
        "ils",
        "elles",
        "me",
        "te",
        "se",
        "le",
        "la",
        "les",
        "lui",
        "leur",
        "son",
        "sa",
        "ses",
        "mon",
        "ma",
        "mes",
        "ton",
        "ta",
        "tes",
        "notre",
        "votre",
        "leur"
    ]

};


//==============================================================
// 📐 FORMULES GRAMMATICALES
//==============================================================
//
// Ces formules ne servent pas à analyser directement la phrase.
// Elles servent à identifier les structures des modèles.
//
//==============================================================
//==============================================================
// 🧩 FORMULES GRAMMATICALES / STRUCTURES
//==============================================================

const NEO_FORMULES = {

    fr: [

        //==========================================================
        // 🔹 STRUCTURES DE BASE
        //==========================================================

        "S + V",
        "S + V + O",
        "S + V + A",
        "S + V + ADV",

        //==========================================================
        // 🧭 DIRECTION / DÉPLACEMENT
        //==========================================================

        "S + V + CC_DIRECTION",
        "S + V + CC_LIEU",
        "S + V + CC_DISTANCE",
        "S + V + CC_TEMPS",

        "S + V + MANIERE + CC_DIRECTION",
        "S + V + MANIERE + CC_LIEU",
        "S + V + MANIERE + CC_DISTANCE",

        "S + V + CC_DIRECTION + CC_DISTANCE",
        "S + V + CC_DIRECTION + CC_TEMPS",
        "S + V + CC_LIEU + CC_TEMPS",

        "S + V + MANIERE + CC_DIRECTION + CC_DISTANCE",
        "S + V + MANIERE + CC_DIRECTION + CC_TEMPS",

        //==========================================================
        // 🎯 CIBLE / INTERACTION
        //==========================================================

        "S + V + CC_CIBLE",
        "S + V + O + CC_CIBLE",
        "S + V + O + CC_LIEU",
        "S + V + O + CC_TEMPS",
        "S + V + O + CC_DISTANCE",

        "S + V + MANIERE + CC_CIBLE",
        "S + V + MANIERE + O",
        "S + V + O + MANIERE",

        "S + V + MANIERE + O + CC_CIBLE",
        "S + V + O + MANIERE + CC_CIBLE",

        "S + V + MANIERE + O + CC_DIRECTION",
        "S + V + O + MANIERE + CC_DIRECTION",

        "S + V + O + CC_CIBLE + CC_LIEU",
        "S + V + O + CC_CIBLE + CC_TEMPS",
        "S + V + O + CC_CIBLE + CC_DISTANCE",

        //==========================================================
        // 🥊 COMBAT / PARTIES DU CORPS
        //==========================================================

        "S + V + O + PARTIE_CORPS",
        "S + V + CC_CIBLE + PARTIE_CORPS",

        "S + V + O + PARTIE_CORPS + CC_CIBLE",
        "S + V + O + CC_CIBLE + PARTIE_CORPS",

        "S + V + MANIERE + O + PARTIE_CORPS",
        "S + V + MANIERE + O + PARTIE_CORPS + CC_CIBLE",

        "S + V + O + MANIERE + PARTIE_CORPS",
        "S + V + O + MANIERE + PARTIE_CORPS + CC_CIBLE",

        "S + V + CC_CIBLE + MANIERE + PARTIE_CORPS",

        //==========================================================
        // ⚔️ ACTION + MOYEN / INSTRUMENT
        //==========================================================

        "S + V + O + CC_MOYEN",
        "S + V + MANIERE + O + CC_MOYEN",
        "S + V + O + PARTIE_CORPS + CC_MOYEN",

        //==========================================================
        // ⏱️ TEMPS / DURÉE
        //==========================================================

        "S + V + CC_TEMPS + O",
        "S + V + CC_TEMPS + CC_DIRECTION",
        "S + V + CC_TEMPS + CC_LIEU",

        "S + V + O + CC_TEMPS + CC_DISTANCE",
        "S + V + MANIERE + CC_TEMPS",

        //==========================================================
        // 🔗 ENCHAÎNEMENTS D'ACTIONS
        //==========================================================

        "S + V + PUIS + V",
        "S + V + PUIS + V + O",
        "S + V + PUIS + V + CC_DIRECTION",
        "S + V + PUIS + V + CC_LIEU",
        "S + V + PUIS + V + MANIERE",

        "S + V + O + PUIS + V",
        "S + V + O + PUIS + V + O",
        "S + V + O + PUIS + V + CC_CIBLE",

        "S + V + MANIERE + PUIS + V",
        "S + V + MANIERE + O + PUIS + V",

        //==========================================================
        // 🎯 BUT / INTENTION
        //==========================================================

        "S + V + POUR + V",
        "S + V + POUR + V + O",
        "S + V + O + POUR + V",
        "S + V + CC_DIRECTION + POUR + V",

        "S + V + AFIN_DE + V",
        "S + V + AFIN_DE + V + O",

        //==========================================================
        // 🚫 NÉGATION / ABSENCE D'ACTION
        //==========================================================

        "S + SANS + V",
        "S + V + SANS + V",
        "S + V + O + SANS + V",

        //==========================================================
        // ⏮️ ANTÉRIORITÉ
        //==========================================================

        "S + V + AVANT_DE + V",
        "S + V + AVANT_DE + V + O",
        "S + V + O + AVANT_DE + V",

        //==========================================================
        // 🔄 DOUBLE ACTION
        //==========================================================

        "S + V + V",
        "S + V + V + O",
        "S + V + V + CC_DIRECTION",
        "S + V + V + CC_LIEU",
        "S + V + V + CC_CIBLE",
        "S + V + V + MANIERE",
        "S + V + V + O + CC_CIBLE",

        //==========================================================
        // 🧠 ÉTAT / DESCRIPTION
        //==========================================================

        "S + V + A",
        "S + V + A + CC_LIEU",
        "S + V + A + CC_TEMPS",
        "S + V + MANIERE + A",

        //==========================================================
        // 📍 POSITION / LOCALISATION
        //==========================================================

        "S + V + CC_LIEU",
        "S + V + CC_LIEU + CC_DIRECTION",
        "S + V + CC_LIEU + CC_TEMPS",

        //==========================================================
        // 📏 DISTANCE / MESURE
        //==========================================================

        "S + V + CC_DISTANCE",
        "S + V + O + CC_DISTANCE",
        "S + V + CC_CIBLE + CC_DISTANCE",
        "S + V + MANIERE + CC_DISTANCE",

        //==========================================================
        // 🔀 STRUCTURES COMPLEXES
        //==========================================================

        "S + V + O + MANIERE + CC_CIBLE + CC_LIEU",
        "S + V + MANIERE + O + CC_CIBLE + CC_LIEU",
        "S + V + O + PARTIE_CORPS + CC_CIBLE + CC_TEMPS",
        "S + V + MANIERE + O + PARTIE_CORPS + CC_CIBLE + CC_TEMPS",

        "S + V + CC_DIRECTION + PUIS + V + O",
        "S + V + O + PUIS + V + O + CC_CIBLE",
        "S + V + MANIERE + PUIS + V + O + CC_CIBLE"

    ]

};

//==============================================================
// 📝 MODÈLES DE PHRASES
//==============================================================
//
// IMPORTANT :
// Ces phrases sont des EXEMPLES DE MODÈLES.
//
// Le joueur peut écrire une phrase totalement différente.
// NeoAI cherchera la phrase connue qui possède la structure
// et le sens lexical les plus proches.
//
// Le sujet n'est JAMAIS fixe.
//
// "Le lion"
// "Maki"
// "Neo"
// "Le joueur"
// etc.
//
// peuvent tous occuper S.
//
//==============================================================
const NEO_MODELES_PHRASES = {

    fr: {

 //==============================================================
// 🚶 DÉPLACEMENT
//==============================================================

deplacement: [

    //========================================================
    // 🔹 DÉPLACEMENT SIMPLE
    //========================================================

    {
        phrase: "le lion court",
        structure: "S + V"
    },

    {
        phrase: "le lion marche",
        structure: "S + V"
    },

    {
        phrase: "le lion avance",
        structure: "S + V"
    },

    {
        phrase: "le lion recule",
        structure: "S + V"
    },

    {
        phrase: "le lion part",
        structure: "S + V"
    },

    {
        phrase: "le lion arrive",
        structure: "S + V"
    },

    {
        phrase: "le lion se déplace",
        structure: "S + V"
    },

    {
        phrase: "le lion se dirige",
        structure: "S + V"
    },

    {
        phrase: "le lion approche",
        structure: "S + V"
    },

    {
        phrase: "le lion s'éloigne",
        structure: "S + V"
    },

    //========================================================
    // 🎯 DÉPLACEMENT VERS UNE CIBLE
    //========================================================

    {
        phrase: "le lion court vers la chèvre",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion fonce vers Maki",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion avance vers son adversaire",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion marche vers la cible",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion se dirige vers son adversaire",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion approche de la cible",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion fonce sur son adversaire",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion court en direction de la cible",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion se rapproche de son adversaire",
        structure: "S + V + CIBLE"
    },

    {
        phrase: "le lion s'éloigne de son adversaire",
        structure: "S + V + CIBLE"
    },

    //========================================================
    // 🧭 DIRECTIONS
    //========================================================

    {
        phrase: "le lion fonce vers l'avant",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion fonce vers l'arrière",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion fonce vers la gauche",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion fonce vers la droite",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion avance vers l'avant",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion recule vers l'arrière",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion se déplace vers la gauche",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion se déplace vers la droite",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion tourne vers la gauche",
        structure: "S + V + DIRECTION"
    },

    {
        phrase: "le lion tourne vers la droite",
        structure: "S + V + DIRECTION"
    },

    //========================================================
    // 📍 DÉPLACEMENT VERS UN LIEU
    //========================================================

    {
        phrase: "le lion avance vers la ville",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le lion va au marché",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le voyageur avance vers la ville",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le personnage se dirige vers la porte",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le personnage marche dans la ville",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le personnage entre dans la maison",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le personnage sort de la maison",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le voyageur arrive à la gare",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le joueur retourne au stade",
        structure: "S + V + LIEU"
    },

    {
        phrase: "le combattant se rend dans l'arène",
        structure: "S + V + LIEU"
    },

    //========================================================
    // ⚡ MANIÈRE
    //========================================================

    {
        phrase: "le lion court rapidement",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le joueur recule rapidement",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le lion avance lentement",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le personnage marche calmement",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le personnage court brutalement",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le combattant avance prudemment",
        structure: "S + V + MANIERE"
    },

    {
        phrase: "le joueur recule rapidement",
        structure: "S + V + MANIERE"
    },

    //========================================================
    // ⚡ MANIÈRE + CIBLE
    //========================================================

    {
        phrase: "le lion court rapidement vers la chèvre",
        structure: "S + V + MANIERE + CIBLE"
    },

    {
        phrase: "le lion fonce brutalement vers son adversaire",
        structure: "S + V + MANIERE + CIBLE"
    },

    {
        phrase: "le combattant avance rapidement vers la cible",
        structure: "S + V + MANIERE + CIBLE"
    },

    {
        phrase: "le joueur recule rapidement face à son adversaire",
        structure: "S + V + MANIERE + CIBLE"
    },

    {
        phrase: "le personnage se dirige calmement vers la porte",
        structure: "S + V + MANIERE + CIBLE"
    },

    //========================================================
    // 📍 MANIÈRE + LIEU
    //========================================================

    {
        phrase: "le voyageur avance rapidement vers la ville",
        structure: "S + V + MANIERE + LIEU"
    },

    {
        phrase: "le personnage marche lentement dans la ville",
        structure: "S + V + MANIERE + LIEU"
    },

    {
        phrase: "le joueur court rapidement vers le stade",
        structure: "S + V + MANIERE + LIEU"
    },

    {
        phrase: "le combattant se dirige prudemment vers l'arène",
        structure: "S + V + MANIERE + LIEU"
    },

    //========================================================
    // 📏 DISTANCE
    //========================================================

    {
        phrase: "le personnage court sur dix mètres",
        structure: "S + V + CC_DISTANCE"
    },

    {
        phrase: "le personnage avance de cinq mètres",
        structure: "S + V + CC_DISTANCE"
    },

    {
        phrase: "le joueur recule de trois mètres",
        structure: "S + V + CC_DISTANCE"
    },

    {
        phrase: "le combattant fonce sur cinq mètres",
        structure: "S + V + CC_DISTANCE"
    },

    {
        phrase: "le personnage se déplace sur dix mètres",
        structure: "S + V + CC_DISTANCE"
    },

    //========================================================
    // 📏 DISTANCE + CIBLE
    //========================================================

    {
        phrase: "le personnage court sur dix mètres vers la cible",
        structure: "S + V + CC_DISTANCE + CIBLE"
    },

    {
        phrase: "le combattant avance de cinq mètres vers son adversaire",
        structure: "S + V + CC_DISTANCE + CIBLE"
    },

    {
        phrase: "le joueur recule de trois mètres face à son adversaire",
        structure: "S + V + CC_DISTANCE + CIBLE"
    },

    {
        phrase: "le lion fonce sur dix mètres vers la cible",
        structure: "S + V + CC_DISTANCE + CIBLE"
    },

    //========================================================
    // 📏 MANIÈRE + DISTANCE
    //========================================================

    {
        phrase: "le personnage court rapidement sur dix mètres",
        structure: "S + V + MANIERE + CC_DISTANCE"
    },

    {
        phrase: "le combattant avance lentement de cinq mètres",
        structure: "S + V + MANIERE + CC_DISTANCE"
    },

    {
        phrase: "le joueur recule rapidement de trois mètres",
        structure: "S + V + MANIERE + CC_DISTANCE"
    },

    //========================================================
    // 🔗 ENCHAÎNEMENT
    //========================================================

    {
        phrase: "le personnage avance puis court",
        structure: "S + V + PUIS + V"
    },

    {
        phrase: "le personnage marche puis accélère",
        structure: "S + V + PUIS + V"
    },

    {
        phrase: "le personnage court puis s'arrête",
        structure: "S + V + PUIS + V"
    },

    {
        phrase: "le personnage avance puis recule",
        structure: "S + V + PUIS + V"
    },

    {
        phrase: "le personnage court puis tourne",
        structure: "S + V + PUIS + V"
    },

    {
        phrase: "le personnage avance puis court vers la cible",
        structure: "S + V + PUIS + V + CIBLE"
    },

    {
        phrase: "le personnage court puis frappe son adversaire",
        structure: "S + V + PUIS + V + O"
    },

    //========================================================
    // 🎯 ACTION + BUT
    //========================================================

    {
        phrase: "le personnage part pour rejoindre la ville",
        structure: "S + V + POUR + V"
    },

    {
        phrase: "le joueur court pour rejoindre son adversaire",
        structure: "S + V + POUR + V"
    },

    {
        phrase: "le combattant avance pour atteindre la cible",
        structure: "S + V + POUR + V"
    },

    {
        phrase: "le voyageur marche pour rejoindre la gare",
        structure: "S + V + POUR + V"
    },

    //========================================================
    // ⏱️ TEMPS
    //========================================================

    {
        phrase: "le personnage court maintenant",
        structure: "S + V + CC_TEMPS"
    },

    {
        phrase: "le personnage avance ensuite",
        structure: "S + V + CC_TEMPS"
    },

    {
        phrase: "le joueur recule immédiatement",
        structure: "S + V + CC_TEMPS"
    },

    {
        phrase: "le combattant avance après le signal",
        structure: "S + V + CC_TEMPS"
    },

    //========================================================
    // 🌀 STRUCTURES COMBINÉES
    //========================================================

    {
        phrase: "le personnage court rapidement vers la cible sur dix mètres",
        structure: "S + V + MANIERE + CIBLE + CC_DISTANCE"
    },

    {
        phrase: "le combattant avance rapidement vers son adversaire de cinq mètres",
        structure: "S + V + MANIERE + CIBLE + CC_DISTANCE"
    },

    {
        phrase: "le joueur recule rapidement vers la gauche",
        structure: "S + V + MANIERE + DIRECTION"
    },

    {
        phrase: "le joueur avance rapidement vers la droite",
        structure: "S + V + MANIERE + DIRECTION"
    },

    {
        phrase: "le personnage court rapidement vers la ville",
        structure: "S + V + MANIERE + LIEU"
    }

],
            
        //========================================================
        // ⚔️ COMBAT
        //========================================================

        combat: [

            {
                phrase: "le combattant attaque",
                structure: "S + V"
            },

            {
                phrase: "le combattant attaque son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant attaque rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant frappe",
                structure: "S + V"
            },

            {
                phrase: "le combattant frappe son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant frappe rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant bloque le coup",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant bloque rapidement le coup",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant esquive le coup",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant esquive rapidement le coup",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant saisit son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant pousse son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant repousse son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant frappe vers le visage",
                structure: "S + V + CIBLE"
            },

            {
                phrase: "le combattant frappe rapidement vers le visage",
                structure: "S + V + MANIERE + CIBLE"
            },

            {
                phrase: "le combattant avance vers son adversaire",
                structure: "S + V + CIBLE"
            },

            {
                phrase: "le combattant avance rapidement vers son adversaire",
                structure: "S + V + MANIERE + CIBLE"
            },

            {
                phrase: "le combattant attaque puis frappe son adversaire",
                structure: "S + V + PUIS + V"
            }

        ],


        //========================================================
        // ⚽ FOOTBALL
        //========================================================

        football: [

            {
                phrase: "le joueur contrôle le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur contrôle rapidement le ballon",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur conduit le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur conduit le ballon vers le but",
                structure: "S + V + O + LIEU"
            },

            {
                phrase: "le joueur dribble son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur dribble rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur passe le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur passe le ballon vers son coéquipier",
                structure: "S + V + O + CIBLE"
            },

            {
                phrase: "le joueur tire",
                structure: "S + V"
            },

            {
                phrase: "le joueur tire vers le but",
                structure: "S + V + LIEU"
            },

            {
                phrase: "le joueur tire rapidement vers le but",
                structure: "S + V + MANIERE + LIEU"
            },

            {
                phrase: "le joueur centre vers la surface",
                structure: "S + V + LIEU"
            },

            {
                phrase: "le joueur avance avec le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur avance rapidement avec le ballon",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur marque un but",
                structure: "S + V + O"
            }

        ],


        //========================================================
        // ✈️ VOYAGE
        //========================================================

        voyage: [

            {
                phrase: "le voyageur part vers la ville",
                structure: "S + V + LIEU"
            },

            {
                phrase: "le voyageur part rapidement vers la ville",
                structure: "S + V + MANIERE + LIEU"
            },

            {
                phrase: "le voyageur arrive à la gare",
                structure: "S + V + LIEU"
            },

            {
                phrase: "le voyageur prend le train",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur prend l'avion",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur réserve une chambre",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur visite la ville",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur transporte sa valise",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur se dirige vers l'aéroport",
                structure: "S + V + LIEU"
            }

        ],


        //========================================================
        // 🏠 VIE COURANTE
        //========================================================

        vie_courante: [

            {
                phrase: "l'homme ouvre la porte",
                structure: "S + V + O"
            },

            {
                phrase: "la femme prépare le repas",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant regarde la télévision",
                structure: "S + V + O"
            },

            {
                phrase: "la personne prend son téléphone",
                structure: "S + V + O"
            },

            {
                phrase: "l'homme parle à son ami",
                structure: "S + V + O"
            },

            {
                phrase: "la femme écoute son ami",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant court dans la maison",
                structure: "S + V + LIEU"
            },

            {
                phrase: "la personne marche dans la rue",
                structure: "S + V + LIEU"
            },

            {
                phrase: "l'homme cherche ses clés",
                structure: "S + V + O"
            },

            {
                phrase: "la femme trouve son téléphone",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant joue rapidement",
                structure: "S + V + MANIERE"
            },

            {
                phrase: "le lion est grand",
                structure: "S + V + A"
            },

            {
                phrase: "le combattant est fort",
                structure: "S + V + A"
            },

            {
                phrase: "le joueur est rapide",
                structure: "S + V + A"
            },

            {
                phrase: "le personnage est agile",
                structure: "S + V + A"
            },

            {
                phrase: "la cible est proche",
                structure: "S + V + A"
            },

            {
                phrase: "l'adversaire est dangereux",
                structure: "S + V + A"
            }

        ],


        //========================================================
        // 💬 COMMUNICATION
        //========================================================

        communication: [

            {
                phrase: "l'homme parle à son ami",
                structure: "S + V + O"
            },

            {
                phrase: "la femme dit la vérité",
                structure: "S + V + O"
            },

            {
                phrase: "la personne explique le problème",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur demande une information",
                structure: "S + V + O"
            },

            {
                phrase: "l'homme répond à la question",
                structure: "S + V + O"
            },

            {
                phrase: "la femme écoute son interlocuteur",
                structure: "S + V + O"
            }

        ]

    }

};
                                            
//==============================================================
// 🧠 NEO CONTEXTES SÉMANTIQUES
//==============================================================
//
// Le contexte ne dépend pas d'une phrase exacte.
// Il décrit CE QUE FAIT l'action et quels rôles elle accepte.
//
// Exemple :
//
// "Maki frappe Tobirama au visage"
// "Tobirama reçoit un coup au visage de Maki"
// "Maki assène violemment un coup dans le visage de Tobirama"
//
// peuvent appartenir au même contexte :
//
// action = attaque_physique
// cible = Tobirama
// partieCorps = visage
// manière = violemment
//
//==============================================================

const NEO_CONTEXTES = {

    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    deplacement: {

        avancer: {
            famille: "deplacement",
            action: "avancer",

            verbes: [
                "avancer",
                "progresser",
                "marcher",
                "aller",
                "continuer",
                "se déplacer"
            ],

            expressions: [
                "faire un pas",
                "faire des pas",
                "se mettre en mouvement"
            ],

            objets: [],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        courir: {
            famille: "deplacement",
            action: "courir",

            verbes: [
                "courir",
                "foncer",
                "sprinter",
                "galoper",
                "se précipiter"
            ],

            expressions: [
                "partir en courant",
                "prendre sa course",
                "se lancer en courant"
            ],

            objets: [],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        reculer: {
            famille: "deplacement",
            action: "reculer",

            verbes: [
                "reculer",
                "s'éloigner",
                "retourner",
                "se retirer"
            ],

            expressions: [
                "faire un pas en arrière",
                "faire plusieurs pas en arrière"
            ],

            objets: [],

            cible: false,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        approcher: {
            famille: "deplacement",
            action: "approcher",

            verbes: [
                "approcher",
                "s'approcher",
                "avancer",
                "se rapprocher",
                "venir"
            ],

            expressions: [
                "réduire la distance",
                "se rapprocher de"
            ],

            objets: [],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        tourner: {
            famille: "deplacement",
            action: "rotation",

            verbes: [
                "tourner",
                "pivoter",
                "se retourner",
                "changer de direction"
            ],

            expressions: [
                "faire demi-tour",
                "effectuer une rotation"
            ],

            objets: [],

            cible: false,
            lieu: false,
            direction: true,
            distance: false,
            temps: true,
            maniere: true
        }
    },


    //----------------------------------------------------------
    // 🥊 COMBAT
    //----------------------------------------------------------

    combat: {

        frapper: {
            famille: "attaque_physique",
            action: "frapper",

            verbes: [
                "frapper",
                "asséner",
                "porter",
                "donner",
                "infliger",
                "atteindre",
                "toucher"
            ],

            expressions: [
                "donner un coup",
                "porter un coup",
                "asséner un coup",
                "porter une frappe",
                "donner une frappe"
            ],

            objets: [
                "coup",
                "frappe",
                "attaque",
                "poing",
                "pied"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        },

        attaquer: {
            famille: "attaque_physique",
            action: "attaquer",

            verbes: [
                "attaquer",
                "agresser",
                "assaillir",
                "charger",
                "assaut"
            ],

            expressions: [
                "lancer une attaque",
                "porter une attaque",
                "lancer un assaut"
            ],

            objets: [
                "attaque",
                "assaut"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        },

        bloquer: {
            famille: "defense",
            action: "bloquer",

            verbes: [
                "bloquer",
                "parer",
                "intercepter",
                "stopper",
                "arrêter"
            ],

            expressions: [
                "faire barrage",
                "parer une attaque"
            ],

            objets: [
                "attaque",
                "coup",
                "frappe"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        },

        esquiver: {
            famille: "defense",
            action: "esquiver",

            verbes: [
                "esquiver",
                "éviter",
                "détourner"
            ],

            expressions: [
                "se décaler",
                "se dérober",
                "se déplacer pour éviter"
            ],

            objets: [
                "attaque",
                "coup",
                "frappe"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        },

        saisir: {
            famille: "contact",
            action: "saisir",

            verbes: [
                "saisir",
                "attraper",
                "empoigner",
                "agripper",
                "prendre"
            ],

            expressions: [
                "prendre par",
                "attraper par",
                "empoigner par"
            ],

            objets: [
                "bras",
                "main",
                "poignet",
                "vêtement"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: false,
            distance: true,
            temps: true
        },

        pousser: {
            famille: "contact",
            action: "pousser",

            verbes: [
                "pousser",
                "repousser",
                "bousculer"
            ],

            expressions: [
                "donner une poussée",
                "repousser violemment"
            ],

            objets: [
                "coup",
                "corps"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        },

        projeter: {
            famille: "projection",
            action: "projeter",

            verbes: [
                "projeter",
                "jeter",
                "lancer",
                "envoyer",
                "expédier"
            ],

            expressions: [
                "faire tomber",
                "envoyer au sol",
                "projeter au sol"
            ],

            objets: [
                "corps",
                "adversaire"
            ],

            cible: true,
            partieCorps: true,
            maniere: true,
            direction: true,
            distance: true,
            temps: true
        }
    },


    //----------------------------------------------------------
    // ⚽ FOOTBALL
    //----------------------------------------------------------

    football: {

        passe: {
            famille: "football",
            action: "passe",

            verbes: [
                "passer",
                "transmettre",
                "donner",
                "envoyer"
            ],

            expressions: [
                "faire une passe",
                "adresser une passe",
                "transmettre le ballon"
            ],

            objets: [
                "ballon",
                "passe"
            ],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            maniere: true
        },

        tir: {
            famille: "football",
            action: "tir",

            verbes: [
                "tirer",
                "frapper",
                "shooter"
            ],

            expressions: [
                "tirer au but",
                "prendre sa chance",
                "décocher une frappe"
            ],

            objets: [
                "ballon",
                "tir",
                "frappe",
                "but"
            ],

            cible: true,
            partieCorps: true,
            lieu: true,
            direction: true,
            distance: true,
            maniere: true
        },

        dribble: {
            famille: "football",
            action: "dribbler",

            verbes: [
                "dribbler",
                "éliminer",
                "déborder",
                "feinter"
            ],

            expressions: [
                "passer un adversaire",
                "prendre de vitesse",
                "faire une feinte"
            ],

            objets: [
                "ballon",
                "adversaire"
            ],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            maniere: true
        },

        controle: {
            famille: "football",
            action: "controle",

            verbes: [
                "contrôler",
                "contrôle",
                "maîtriser",
                "récupérer"
            ],

            expressions: [
                "prendre le contrôle",
                "amortir le ballon",
                "contrôler le ballon"
            ],

            objets: [
                "ballon"
            ],

            cible: false,
            lieu: true,
            direction: true,
            distance: true,
            maniere: true
        }
    },


    //----------------------------------------------------------
    // ✈️ VOYAGE
    //----------------------------------------------------------

    voyage: {

        partir: {
            famille: "voyage",
            action: "partir",

            verbes: [
                "partir",
                "quitter",
                "s'en aller",
                "voyager"
            ],

            expressions: [
                "prendre le départ",
                "prendre la route"
            ],

            objets: [
                "ville",
                "pays",
                "destination"
            ],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        arriver: {
            famille: "voyage",
            action: "arriver",

            verbes: [
                "arriver",
                "atteindre",
                "parvenir",
                "rejoindre"
            ],

            expressions: [
                "atteindre sa destination",
                "parvenir à destination"
            ],

            objets: [
                "destination",
                "gare",
                "aéroport",
                "hôtel"
            ],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        },

        conduire: {
            famille: "transport",
            action: "conduire",

            verbes: [
                "conduire",
                "piloter",
                "rouler"
            ],

            expressions: [
                "prendre le volant",
                "prendre la route"
            ],

            objets: [
                "voiture",
                "moto",
                "véhicule",
                "avion",
                "bateau"
            ],

            cible: true,
            lieu: true,
            direction: true,
            distance: true,
            temps: true,
            maniere: true
        }
    },


    //----------------------------------------------------------
    // 🏠 VIE COURANTE
    //----------------------------------------------------------

    vie_courante: {

        prendre: {
            famille: "interaction_objet",
            action: "prendre",

            verbes: [
                "prendre",
                "saisir",
                "attraper",
                "récupérer"
            ],

            expressions: [
                "mettre la main sur",
                "se saisir de"
            ],

            objets: [
                "objet",
                "livre",
                "clé",
                "téléphone",
                "sac"
            ],

            cible: true,
            lieu: true,
            maniere: true,
            temps: true
        },

        poser: {
            famille: "interaction_objet",
            action: "poser",

            verbes: [
                "poser",
                "déposer",
                "placer",
                "mettre"
            ],

            expressions: [
                "mettre sur",
                "déposer sur"
            ],

            objets: [
                "objet",
                "livre",
                "sac",
                "clé",
                "téléphone"
            ],

            cible: false,
            lieu: true,
            maniere: true,
            temps: true
        },

        regarder: {
            famille: "perception",
            action: "regarder",

            verbes: [
                "regarder",
                "observer",
                "contempler",
                "examiner",
                "fixer"
            ],

            expressions: [
                "porter son regard sur",
                "jeter un regard sur"
            ],

            objets: [
                "personne",
                "objet",
                "lieu"
            ],

            cible: true,
            lieu: true,
            maniere: true,
            temps: true
        }
    },


    //----------------------------------------------------------
    // 🗣️ COMMUNICATION
    //----------------------------------------------------------

    communication: {

        parler: {
            famille: "communication",
            action: "parler",

            verbes: [
                "parler",
                "discuter",
                "s'exprimer",
                "communiquer"
            ],

            expressions: [
                "prendre la parole",
                "adresser la parole"
            ],

            objets: [
                "message",
                "question",
                "réponse"
            ],

            cible: true,
            lieu: true,
            maniere: true,
            temps: true
        },

        dire: {
            famille: "communication",
            action: "dire",

            verbes: [
                "dire",
                "annoncer",
                "déclarer",
                "répondre",
                "expliquer",
                "préciser"
            ],

            expressions: [
                "donner une réponse",
                "faire une annonce",
                "donner une explication"
            ],

            objets: [
                "message",
                "réponse",
                "question",
                "information"
            ],

            cible: true,
            lieu: false,
            maniere: true,
            temps: true
        }
    }
};

//==============================================================
// 🔎 RECHERCHE DU CONTEXTE D'ACTION
//==============================================================

function neoTrouverContexteAction(texte) {

    const normalise = neoNormaliserTexte(texte);

    let meilleur = null;
    let meilleurScore = 0;

    for (const [categorie, actions] of Object.entries(NEO_CONTEXTES)) {

        for (const [nomAction, contexte] of Object.entries(actions)) {

            let score = 0;

            // Verbes
            for (const verbe of contexte.verbes || []) {
                const v = neoNormaliserTexte(verbe);

                if (
                    normalise.includes(v)
                ) {
                    score += 40;
                }
            }

            // Expressions multi-mots
            for (const expression of contexte.expressions || []) {

                const e = neoNormaliserTexte(expression);

                if (
                    normalise.includes(e)
                ) {
                    score += 60;
                }
            }

            // Objets / mots d'action
            for (const objet of contexte.objets || []) {

                const o = neoNormaliserTexte(objet);

                if (
                    normalise.includes(o)
                ) {
                    score += 10;
                }
            }

            if (score > meilleurScore) {

                meilleurScore = score;

                meilleur = {
                    categorie,
                    action: nomAction,
                    famille: contexte.famille,
                    contexte,
                    score: Math.min(score, 100)
                };
            }
        }
    }

    return meilleur;
}

//==============================================================
// 🧠 EXTRACTION DES RÔLES SÉMANTIQUES
//==============================================================

function neoEstPartieCorps(mot) {

    const normalise = neoNormaliserTexte(mot);

    const corps = NEO_NOMS?.fr?.corps || [];

    return corps.some(
        x => neoNormaliserTexte(x) === normalise
    );
}


//--------------------------------------------------------------
// 🎯 DÉTECTION D'UNE CIBLE
//--------------------------------------------------------------

function neoEstCibleContextuelle(mot) {

    const normalise = neoNormaliserTexte(mot);

    // Personnes connues
    const personnes =
        NEO_NOMS?.fr?.personnes || [];

    if (
        personnes.some(
            x => neoNormaliserTexte(x) === normalise
        )
    ) {
        return true;
    }

    // Une cible peut aussi être un nom propre inconnu.
    //
    // Exemple :
    // Maki
    // Tobirama
    // Isagi
    // Neo
    //
    // On ne les ajoute PAS à la base.
    //
    if (
        /^[A-ZÀ-Ý][a-zà-ÿ]+$/.test(mot)
    ) {
        return true;
    }

    return false;
}


//--------------------------------------------------------------
// 🧩 EXTRACTION DU CONTEXTE
//--------------------------------------------------------------

function neoExtraireContexte(texte) {

    const tokens = neoTokeniser(texte);

    const contexteAction =
        neoTrouverContexteAction(texte);

    const resultat = {

        categorie:
            contexteAction?.categorie || null,

        action:
            contexteAction?.action || null,

        famille:
            contexteAction?.famille || null,

        sujet: null,

        cible: null,

        partieCorps: null,

        objet: null,

        maniere: [],

        direction: null,

        lieu: null,

        distance: null,

        temps: null,

        connecteurs: [],

        tokens
    };


    //----------------------------------------------------------
    // 🔗 CONNECTEURS
    //----------------------------------------------------------

    for (const token of tokens) {

        if (
            NEO_CONNECTEURS?.fr?.includes?.(token)
        ) {
            resultat.connecteurs.push(token);
        }
    }


    //----------------------------------------------------------
    // 🧍 PARTIES DU CORPS
    //----------------------------------------------------------

    for (const token of tokens) {

        if (
            neoEstPartieCorps(token)
        ) {
            resultat.partieCorps = token;
        }
    }


    //----------------------------------------------------------
    // 🎯 CIBLE
    //----------------------------------------------------------

    for (let i = 0; i < tokens.length; i++) {

        const token = tokens[i];

        if (
            neoEstCibleContextuelle(token)
        ) {

            // On évite de prendre automatiquement
            // le premier nom comme cible.
            if (i > 0) {
                resultat.cible = token;
            }
        }
    }


    //----------------------------------------------------------
    // 🧭 DIRECTIONS
    //----------------------------------------------------------

    const directions = [
        "avant",
        "arrière",
        "arriere",
        "gauche",
        "droite",
        "haut",
        "bas",
        "devant",
        "derrière",
        "derriere"
    ];

    for (const token of tokens) {

        if (
            directions.includes(token)
        ) {
            resultat.direction = token;
        }
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    for (let i = 0; i < tokens.length; i++) {

        if (
            /^\d+(?:[.,]\d+)?$/.test(tokens[i])
        ) {

            const unite = tokens[i + 1];

            if (
                [
                    "m",
                    "mètre",
                    "metre",
                    "mètres",
                    "metres",
                    "km",
                    "kilomètre",
                    "kilometre"
                ].includes(unite)
            ) {

                resultat.distance = {
                    valeur: Number(
                        tokens[i].replace(",", ".")
                    ),
                    unite
                };
            }
        }
    }


    //----------------------------------------------------------
    // 📍 LIEUX
    //----------------------------------------------------------

    const lieux =
        NEO_NOMS?.fr?.lieux || [];

    for (const lieu of lieux) {

        if (
            tokens.includes(
                neoNormaliserTexte(lieu)
            )
        ) {
            resultat.lieu = lieu;
        }
    }


    //----------------------------------------------------------
    // 🧍 SUJET
    //----------------------------------------------------------

    if (tokens.length > 0) {

        // Le sujet est généralement placé
        // avant l'action principale.
        //
        // On prend le premier groupe nominal
        // avant l'action détectée.

        const indexAction =
            contexteAction
                ? neoTrouverIndexAction(
                    tokens,
                    contexteAction
                )
                : -1;

        if (indexAction > 0) {

            resultat.sujet =
                tokens
                    .slice(0, indexAction)
                    .join(" ");
        }
    }


    //----------------------------------------------------------
    // 💨 MANIÈRE
    //----------------------------------------------------------

    const adverbes =
        NEO_ADVERBES?.fr || [];

    for (const token of tokens) {

        if (
            adverbes.some(
                x =>
                    neoNormaliserTexte(x) === token
            )
        ) {
            resultat.maniere.push(token);
        }
    }


    return resultat;
}

//==============================================================
// 🔎 TROUVER L'INDEX DE L'ACTION
//==============================================================

function neoTrouverIndexAction(tokens, contexteAction) {

    if (!contexteAction) {
        return -1;
    }

    const contexte =
        contexteAction.contexte;

    //----------------------------------------------------------
    // Expressions multi-mots prioritaires
    //----------------------------------------------------------

    for (const expression of contexte.expressions || []) {

        const morceaux =
            neoTokeniser(expression);

        for (
            let i = 0;
            i <= tokens.length - morceaux.length;
            i++
        ) {

            const segment =
                tokens.slice(
                    i,
                    i + morceaux.length
                );

            if (
                segment.join(" ") ===
                morceaux.join(" ")
            ) {
                return i;
            }
        }
    }


    //----------------------------------------------------------
    // Verbe simple
    //----------------------------------------------------------

    for (let i = 0; i < tokens.length; i++) {

        for (const verbe of contexte.verbes || []) {

            if (
                tokens[i] ===
                neoNormaliserTexte(verbe)
            ) {
                return i;
            }
        }
    }

    return -1;
}

//==============================================================
// 🧬 SIGNATURE SÉMANTIQUE
//==============================================================

function neoConstruireSignature(contexte) {

    if (!contexte) {
        return "";
    }

    const signature = [];

    if (contexte.sujet) {
        signature.push("S");
    }

    if (contexte.action) {
        signature.push(
            `ACTION:${contexte.action}`
        );
    }

    if (contexte.objet) {
        signature.push("O");
    }

    if (contexte.cible) {
        signature.push("CIBLE");
    }

    if (contexte.partieCorps) {
        signature.push("PARTIE_CORPS");
    }

    if (contexte.maniere?.length) {
        signature.push("MANIERE");
    }

    if (contexte.direction) {
        signature.push("DIRECTION");
    }

    if (contexte.lieu) {
        signature.push("LIEU");
    }

    if (contexte.distance) {
        signature.push("DISTANCE");
    }

    if (contexte.temps) {
        signature.push("TEMPS");
    }

    return signature.join(" + ");
}

//==============================================================
// 🔎 RECHERCHE D'UN VERBE
//==============================================================

function neoTrouverVerbe(mot = "") {

    const recherche =
        neoSansAccents(mot);

    if (!recherche) {
        return null;
    }

    const verbes =
        NEO_VERBES.fr || {};

    for (const [lemme, formes] of Object.entries(verbes)) {

        const liste = Array.isArray(formes)
            ? formes
            : [];

        if (
            neoSansAccents(lemme) === recherche ||
            liste.some(
                forme =>
                    neoSansAccents(forme) === recherche
            )
        ) {

            return {
                lemme,
                forme: mot
            };

        }

    }

    return null;

}


//==============================================================
// 🔎 RECHERCHE D'UN MOT
//==============================================================

function neoRechercherMot(mot = "") {

    if (
        typeof mot !== "string" ||
        !mot.trim()
    ) {

        return {
            trouve: false,
            mot,
            categories: []
        };

    }

    const recherche =
        neoSansAccents(mot);

    const categories = [];

    //----------------------------------------------------------
    // VERBES
    //----------------------------------------------------------

    const verbe =
        neoTrouverVerbe(mot);

    if (verbe) {

        categories.push({
            categorie: "verbe",
            lemme: verbe.lemme,
            forme: verbe.forme
        });

    }

    //----------------------------------------------------------
    // NOMS
    //----------------------------------------------------------

    for (
        const [categorie, mots]
        of Object.entries(
            NEO_NOMS.fr || {}
        )
    ) {

        if (
            Array.isArray(mots) &&
            mots.some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
        ) {

            categories.push({
                categorie: "nom",
                sousCategorie: categorie
            });

        }

    }

    //----------------------------------------------------------
    // ADJECTIFS
    //----------------------------------------------------------

    if (
        (NEO_ADJECTIFS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "adjectif"
        });

    }

    //----------------------------------------------------------
    // ADVERBES
    //----------------------------------------------------------

    if (
        (NEO_ADVERBES.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "adverbe"
        });

    }

    //----------------------------------------------------------
    // PRÉPOSITIONS
    //----------------------------------------------------------

    if (
        (NEO_PREPOSITIONS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "preposition"
        });

    }

    //----------------------------------------------------------
    // PRONOMS
    //----------------------------------------------------------

    if (
        (NEO_PRONOMS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "pronom"
        });

    }

    //----------------------------------------------------------
    // CONNECTEURS
    //----------------------------------------------------------

    if (
        (NEO_CONNECTEURS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "connecteur"
        });

    }

    return {

        trouve:
            categories.length > 0,

        mot,

        motNormalise:
            recherche,

        categories

    };

}


//==============================================================
// 🔎 RECHERCHE DE TEXTE
//==============================================================

function neoRechercherTexte(texte = "") {

    const tokens =
        neoTokeniser(texte);

    const resultats =
        tokens.map(
            mot => neoRechercherMot(mot)
        );

    return {

        texte,

        mots: tokens,

        resultats,

        connus:
            resultats.filter(
                resultat =>
                    resultat.trouve
            ),

        inconnus:
            resultats.filter(
                resultat =>
                    !resultat.trouve
            )

    };

}


//==============================================================
// 🧠 MOT CONNU ?
//==============================================================

function neoConnaitMot(mot = "") {

    return neoRechercherMot(mot)
        .trouve === true;

}


//==============================================================
// 🔎 MOTS SIGNIFICATIFS
//==============================================================
//
// Pour la comparaison des modèles.
// Les petits mots grammaticaux peuvent être conservés
// lorsqu'ils sont importants pour la structure.
//
//==============================================================
//==============================================================
// 🔎 NEO AI — MOTEUR DE STRUCTURE ET COMPARAISON
//==============================================================

//==============================================================
// 🔎 MOTS GRAMMATICAUX NEUTRES
//==============================================================

const NEO_MOTS_NEUTRES = new Set([

    "le",
    "la",
    "les",

    "un",
    "une",
    "des",

    "du",
    "de",
    "d",

    "au",
    "aux",

    "son",
    "sa",
    "ses",

    "mon",
    "ma",
    "mes",

    "ton",
    "ta",
    "tes",

    "notre",
    "nos",

    "votre",
    "vos",

    "leur",
    "leurs",

    "ce",
    "cet",
    "cette",
    "ces"

]);


//==============================================================
// 🧭 DIRECTIONS
//==============================================================

const NEO_DIRECTIONS_FR = new Set([

    "gauche",
    "droite",

    "avant",
    "arriere",

    "devant",
    "derriere",

    "haut",
    "bas",

    "nord",
    "sud",
    "est",
    "ouest",

    "centre",
    "milieu",

    "interieur",
    "exterieur",

    "dessus",
    "dessous"

]);


//==============================================================
// 🔎 MOTS DE MANIÈRE
//==============================================================

const NEO_MANIERES_FR = new Set([

    "rapidement",
    "lentement",
    "vite",
    "doucement",
    "brutalement",
    "violemment",
    "calmement",
    "directement",
    "precisement",
    "fortement",
    "faiblement",
    "soudainement",
    "immediatement",
    "progressivement",
    "silencieusement",
    "prudemment",
    "discretement"

]);


//==============================================================
// ⏱️ MOTS DE TEMPS
//==============================================================

const NEO_TEMPS_FR = new Set([

    "maintenant",
    "ensuite",
    "avant",
    "apres",
    "demain",
    "hier",
    "aujourd'hui",
    "maintenant",
    "bientot",
    "tard",
    "tot"

]);


//==============================================================
// 📏 UNITÉS DE DISTANCE
//==============================================================

const NEO_UNITES_DISTANCE_FR = new Set([

    "metre",
    "metres",
    "m",

    "centimetre",
    "centimetres",
    "cm",

    "kilometre",
    "kilometres",
    "km"

]);


//==============================================================
// 🧹 NORMALISER UN MOT
//==============================================================

function neoNormaliserMot(mot = "") {

    return neoSansAccents(
        String(mot)
            .toLowerCase()
            .replace(/[.,!?;:()[\]{}"'«»]/g, "")
            .trim()
    );

}


//==============================================================
// 🟦 EST-CE UN ADJECTIF ?
//==============================================================

function neoEstAdjectif(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const adjectifs =
        NEO_ADJECTIFS?.fr || [];

    return adjectifs.some(
        adjectif =>
            neoNormaliserMot(adjectif) ===
            recherche
    );

}


//==============================================================
// 🟦 EST-CE UN ADVERBE ?
//==============================================================

function neoEstAdverbe(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const adverbes =
        NEO_ADVERBES?.fr || [];

    return (
        adverbes.some(
            adverbe =>
                neoNormaliserMot(adverbe) ===
                recherche
        ) ||
        NEO_MANIERES_FR.has(recherche)
    );

}


//==============================================================
// 🧭 EST-CE UNE DIRECTION ?
//==============================================================

function neoEstDirection(mot = "") {

    return NEO_DIRECTIONS_FR.has(
        neoNormaliserMot(mot)
    );

}


//==============================================================
// 👤 EST-CE UNE PERSONNE ?
//==============================================================

function neoEstPersonne(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const personnes =
        NEO_NOMS?.fr?.personnes || [];

    return personnes.some(
        personne =>
            neoNormaliserMot(personne) ===
            recherche
    );

}


//==============================================================
// 🐺 EST-CE UN ANIMAL ?
//==============================================================

function neoEstAnimal(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const animaux =
        NEO_NOMS?.fr?.animaux || [];

    return animaux.some(
        animal =>
            neoNormaliserMot(animal) ===
            recherche
    );

}


//==============================================================
// 📦 EST-CE UN OBJET ?
//==============================================================

function neoEstObjet(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const objets =
        NEO_NOMS?.fr?.objets || [];

    return objets.some(
        objet =>
            neoNormaliserMot(objet) ===
            recherche
    );

}


//==============================================================
// 📍 EST-CE UN LIEU ?
//==============================================================

function neoEstLieu(mot = "") {

    const recherche =
        neoNormaliserMot(mot);

    if (!recherche) {
        return false;
    }

    const lieux =
        NEO_NOMS?.fr?.lieux || [];

    return lieux.some(
        lieu =>
            neoNormaliserMot(lieu) ===
            recherche
    );

}


//==============================================================
// 🧠 EST-CE UN NOM CONNU ?
//==============================================================

function neoEstNom(mot = "") {

    return (
        neoEstPersonne(mot) ||
        neoEstAnimal(mot) ||
        neoEstObjet(mot) ||
        neoEstLieu(mot)
    );

}


//==============================================================
// 🧹 RETIRER LES MOTS GRAMMATICAUX
//==============================================================

function neoRetirerDeterminants(
    mots = []
) {

    return mots.filter(
        mot =>
            !NEO_MOTS_NEUTRES.has(
                neoNormaliserMot(mot)
            )
    );

}


//==============================================================
// 🧠 IDENTIFIER LE TYPE D'UN COMPLÉMENT
//==============================================================
//
// Priorité :
//
// DIRECTION
// LIEU
// CIBLE
// OBJET
//
// Exemple :
//
// vers la gauche
// → DIRECTION
//
// vers Maki
// → CIBLE
//
// au marché
// → LIEU
//
// un coup de poing
// → O
//
//==============================================================

function neoIdentifierComplement(
    mots = [],
    preposition = null
) {

    const utiles =
        neoRetirerDeterminants(
            mots
        );

    if (!utiles.length) {
        return null;
    }


    //==========================================================
    // 🧭 DIRECTION
    //==========================================================

    if (
        utiles.some(
            mot =>
                neoEstDirection(mot)
        )
    ) {

        return "DIRECTION";

    }


    //==========================================================
    // 📍 LIEU
    //==========================================================

    if (
        utiles.some(
            mot =>
                neoEstLieu(mot)
        )
    ) {

        return "LIEU";

    }


    //==========================================================
    // 👤 PERSONNE
    //==========================================================

    if (
        utiles.some(
            mot =>
                neoEstPersonne(mot)
        )
    ) {

        return "CIBLE";

    }


    //==========================================================
    // 🐺 ANIMAL
    //==========================================================

    if (
        utiles.some(
            mot =>
                neoEstAnimal(mot)
        )
    ) {

        return "CIBLE";

    }


    //==========================================================
    // 📦 OBJET
    //==========================================================

    if (
        utiles.some(
            mot =>
                neoEstObjet(mot)
        )
    ) {

        return "O";

    }


    //==========================================================
    // 🎯 NOM PROPRE / CIBLE APRÈS "VERS"
    //==========================================================
    //
    // Exemple :
    //
    // vers Maki
    // vers Tobirama
    // vers Neo
    //
    // Même si le nom propre n'est pas encore
    // enregistré dans NEO_NOMS, "vers" permet
    // d'identifier une cible potentielle.
    //
    //==========================================================

    if (
        preposition === "vers"
    ) {

        return "CIBLE";

    }


    //==========================================================
    // 📦 FALLBACK
    //==========================================================

    return "O";

}


//==============================================================
// 📏 DÉTECTER UNE DISTANCE
//==============================================================

function neoContientDistance(
    mots = []
) {

    return mots.some(
        mot =>
            NEO_UNITES_DISTANCE_FR.has(
                neoNormaliserMot(mot)
            )
    );

}


//==============================================================
// ⏱️ DÉTECTER UN INDICATEUR TEMPOREL
//==============================================================

function neoContientTemps(
    mots = []
) {

    return mots.some(
        mot =>
            NEO_TEMPS_FR.has(
                neoNormaliserMot(mot)
            )
    );

}


//==============================================================
// 🧠 ANALYSE STRUCTURELLE
//==============================================================
//
// Cette fonction détermine réellement la structure
// de la phrase utilisateur.
//
// Exemples :
//
// le lion court
// → S + V
//
// le lion est grand
// → S + V + A
//
// le lion court rapidement
// → S + V + MANIERE
//
// le lion fonce vers Maki
// → S + V + CIBLE
//
// le lion fonce vers la gauche
// → S + V + DIRECTION
//
// le lion va au marché
// → S + V + LIEU
//
// Tobirama bloque un coup de poing
// → S + V + O
//
//==============================================================

function neoAnalyserStructure(
    phrase = ""
) {

    if (
        !phrase ||
        typeof phrase !== "string"
    ) {

        return {

            structure: null,
            sujet: [],
            verbe: null,
            complement: [],
            typeComplement: null

        };

    }


    const texte =
        neoNormaliserTexte(
            phrase
        );

    const tokens =
        neoTokeniser(
            texte
        );


    if (!tokens.length) {

        return {

            structure: null,
            sujet: [],
            verbe: null,
            complement: [],
            typeComplement: null

        };

    }


    //==========================================================
    // 🔎 TROUVER LE VERBE PRINCIPAL
    //==========================================================

    let indexVerbe = -1;
    let verbe = null;

    for (
        let i = 0;
        i < tokens.length;
        i++
    ) {

        const resultat =
            neoTrouverVerbe(
                tokens[i]
            );

        if (resultat) {

            indexVerbe = i;
            verbe = resultat;

            break;

        }

    }


    //==========================================================
    // ❌ PAS DE VERBE
    //==========================================================

    if (indexVerbe < 0) {

        return {

            structure: null,
            sujet: tokens,
            verbe: null,
            complement: [],
            typeComplement: null

        };

    }


    //==========================================================
    // 👤 SUJET
    //==========================================================

    const sujet =
        tokens.slice(
            0,
            indexVerbe
        );


    //==========================================================
    // ➡️ APRÈS LE VERBE
    //==========================================================

    const apresVerbe =
        tokens.slice(
            indexVerbe + 1
        );


    //==========================================================
    // 🟢 S + V
    //==========================================================

    if (!apresVerbe.length) {

        return {

            structure: "S + V",
            sujet,
            verbe,
            complement: [],
            typeComplement: null

        };

    }


    //==========================================================
    // 🟦 S + V + A
    //==========================================================

    const indexAdjectif =
        apresVerbe.findIndex(
            mot =>
                neoEstAdjectif(mot)
        );

    if (
        indexAdjectif >= 0
    ) {

        return {

            structure:
                "S + V + A",

            sujet,

            verbe,

            complement:
                apresVerbe,

            typeComplement:
                "ADJECTIF"

        };

    }


    //==========================================================
    // 🟦 S + V + MANIERE
    //==========================================================

    const indexManiere =
        apresVerbe.findIndex(
            mot =>
                neoEstAdverbe(mot)
        );


    //==========================================================
    // 🧭 RECHERCHE DE PRÉPOSITION
    //==========================================================

    const introducteurs = [

        "a",
        "au",
        "aux",

        "dans",
        "en",

        "sur",
        "sous",

        "vers",

        "contre",
        "envers",

        "pour",

        "avec"

    ];


    let indexPreposition = -1;
    let preposition = null;


    for (
        let i = 0;
        i < apresVerbe.length;
        i++
    ) {

        const mot =
            neoNormaliserMot(
                apresVerbe[i]
            );

        if (
            introducteurs.includes(
                mot
            )
        ) {

            indexPreposition = i;
            preposition = mot;

            break;

        }

    }


    //==========================================================
    // 🧠 COMPLÉMENT APRÈS PRÉPOSITION
    //==========================================================

    let complement = apresVerbe;


    if (
        indexPreposition >= 0
    ) {

        complement =
            apresVerbe.slice(
                indexPreposition + 1
            );

    }


    //==========================================================
    // 🧭 TYPE DU COMPLÉMENT
    //==========================================================

    const typeComplement =
        neoIdentifierComplement(
            complement,
            preposition
        );


    //==========================================================
    // 📏 DISTANCE
    //==========================================================

    if (
        neoContientDistance(
            apresVerbe
        )
    ) {

        if (
            indexManiere >= 0 &&
            indexPreposition >= 0
        ) {

            return {

                structure:
                    "S + V + MANIERE + CC_DISTANCE",

                sujet,
                verbe,
                complement:
                    apresVerbe,
                typeComplement:
                    "DISTANCE"

            };

        }


        return {

            structure:
                "S + V + CC_DISTANCE",

            sujet,
            verbe,
            complement:
                apresVerbe,
            typeComplement:
                "DISTANCE"

        };

    }


    //==========================================================
    // ⏱️ TEMPS
    //==========================================================

    if (
        neoContientTemps(
            apresVerbe
        )
    ) {

        return {

            structure:
                "S + V + CC_TEMPS",

            sujet,
            verbe,
            complement:
                apresVerbe,
            typeComplement:
                "TEMPS"

        };

    }


    //==========================================================
    // 🧠 MANIÈRE + COMPLÉMENT
    //==========================================================

    if (
        indexManiere >= 0 &&
        indexPreposition >= 0
    ) {

        if (
            typeComplement ===
            "DIRECTION"
        ) {

            return {

                structure:
                    "S + V + MANIERE + DIRECTION",

                sujet,
                verbe,
                complement:
                    apresVerbe,
                typeComplement

            };

        }


        if (
            typeComplement ===
            "LIEU"
        ) {

            return {

                structure:
                    "S + V + MANIERE + LIEU",

                sujet,
                verbe,
                complement:
                    apresVerbe,
                typeComplement

            };

        }


        if (
            typeComplement ===
            "CIBLE"
        ) {

            return {

                structure:
                    "S + V + MANIERE + CIBLE",

                sujet,
                verbe,
                complement:
                    apresVerbe,
                typeComplement

            };

        }


        return {

            structure:
                "S + V + MANIERE + O",

            sujet,
            verbe,
            complement:
                apresVerbe,
            typeComplement:
                "O"

        };

    }


    //==========================================================
    // 🧠 MANIÈRE SEULE
    //==========================================================

    if (
        indexManiere >= 0 &&
        apresVerbe.length === 1
    ) {

        return {

            structure:
                "S + V + MANIERE",

            sujet,
            verbe,
            complement:
                apresVerbe,
            typeComplement:
                "MANIERE"

        };

    }


    //==========================================================
    // 🧭 DIRECTION
    //==========================================================

    if (
        typeComplement ===
        "DIRECTION"
    ) {

        return {

            structure:
                "S + V + DIRECTION",

            sujet,
            verbe,
            complement,
            typeComplement

        };

    }


    //==========================================================
    // 📍 LIEU
    //==========================================================

    if (
        typeComplement ===
        "LIEU"
    ) {

        return {

            structure:
                "S + V + LIEU",

            sujet,
            verbe,
            complement,
            typeComplement

        };

    }


    //==========================================================
    // 👤 CIBLE
    //==========================================================

    if (
        typeComplement ===
        "CIBLE"
    ) {

        return {

            structure:
                "S + V + CIBLE",

            sujet,
            verbe,
            complement,
            typeComplement

        };

    }


    //==========================================================
    // 📦 OBJET
    //==========================================================

    return {

        structure:
            "S + V + O",

        sujet,
        verbe,
        complement,
        typeComplement:
            "O"

    };

}


//==============================================================
// 📐 STRUCTURE D'UN MODÈLE
//==============================================================
//
// On utilise d'abord la structure déclarée dans
// NEO_MODELES_PHRASES.
//
// Si elle n'existe pas, on analyse automatiquement
// la phrase du modèle.
//
//==============================================================

function detecterStructureModele(
    modele
) {

    if (
        !modele
    ) {

        return null;

    }


    //==========================================================
    // 🟢 MODÈLE OBJET
    //==========================================================

    if (
        typeof modele === "object" &&
        modele.structure
    ) {

        return modele.structure;

    }


    //==========================================================
    // 📝 MODÈLE TEXTE
    //==========================================================

    if (
        typeof modele === "string"
    ) {

        return neoAnalyserStructure(
            modele
        ).structure;

    }


    return null;

}


//==============================================================
// 🧠 COMPARAISON DES PHRASES
//==============================================================
//
// IMPORTANT :
//
// La structure est prioritaire.
//
// Si :
//
// utilisateur = S + V + A
// modèle     = S + V + MANIERE
//
// → score = 0
//
// Cela empêche :
//
// "le lion est grand"
//
// de matcher avec :
//
// "le lion court rapidement"
//
//==============================================================

function neoComparerPhrase(
    phraseUtilisateur,
    phraseModele
) {

    if (
        !phraseUtilisateur ||
        !phraseModele ||
        typeof phraseUtilisateur !== "string" ||
        typeof phraseModele !== "string"
    ) {

        return {

            score: 0,
            structure: null,
            structureModele: null

        };

    }


    //==========================================================
    // 🧠 ANALYSE UTILISATEUR
    //==========================================================

    const analyseUtilisateur =
        neoAnalyserStructure(
            phraseUtilisateur
        );


    //==========================================================
    // 🧠 ANALYSE MODÈLE
    //==========================================================

    const analyseModele =
        neoAnalyserStructure(
            phraseModele
        );


    const structureUtilisateur =
        analyseUtilisateur.structure;

    const structureModele =
        analyseModele.structure;


    //==========================================================
    // ❌ STRUCTURES DIFFÉRENTES
    //==========================================================

    if (
        structureUtilisateur &&
        structureModele &&
        structureUtilisateur !==
        structureModele
    ) {

        return {

            score: 0,

            structure:
                structureUtilisateur,

            structureModele,

            verbe:
                analyseUtilisateur.verbe,

            sujet:
                analyseUtilisateur.sujet,

            objet:
                analyseUtilisateur.complement

        };

    }


    //==========================================================
    // 🔤 TOKENS
    //==========================================================

    const tokensUtilisateur =
        neoTokeniser(
            neoNormaliserTexte(
                phraseUtilisateur
            )
        );


    const tokensModele =
        neoTokeniser(
            neoNormaliserTexte(
                phraseModele
            )
        );


    if (
        !tokensUtilisateur.length ||
        !tokensModele.length
    ) {

        return {

            score: 0,

            structure:
                structureUtilisateur,

            structureModele

        };

    }


    //==========================================================
    // 🔎 MOTS SIGNIFICATIFS
    //==========================================================

    const tokensSignificatifs =
        tokensModele.filter(
            mot =>
                !NEO_MOTS_NEUTRES.has(
                    neoNormaliserMot(mot)
                )
        );


    // Si le modèle ne contient aucun mot significatif,
    // on utilise tous ses tokens.

    const motsAComparer =
        tokensSignificatifs.length
            ? tokensSignificatifs
            : tokensModele;


    let correspondances = 0;


    //==========================================================
    // 🔎 COMPARAISON LEXICALE
    //==========================================================

    for (
        const motModele of motsAComparer
    ) {

        const normaliseModele =
            neoNormaliserMot(
                motModele
            );


        //======================================================
        // 🟢 MOT EXACT
        //======================================================

        const motExact =
            tokensUtilisateur.some(
                motUtilisateur =>
                    neoNormaliserMot(
                        motUtilisateur
                    ) ===
                    normaliseModele
            );


        if (motExact) {

            correspondances++;

            continue;

        }


        //======================================================
        // 🧠 MÊME VERBE
        //======================================================

        const verbeModele =
            neoTrouverVerbe(
                motModele
            );


        if (
            verbeModele
        ) {

            const memeVerbe =
                tokensUtilisateur.some(
                    motUtilisateur => {

                        const verbeUtilisateur =
                            neoTrouverVerbe(
                                motUtilisateur
                            );

                        return (
                            verbeUtilisateur &&
                            verbeUtilisateur.lemme ===
                            verbeModele.lemme
                        );

                    }
                );


            if (memeVerbe) {

                correspondances++;

                continue;

            }

        }


        //======================================================
        // 🟦 ADJECTIF
        //======================================================

        if (
            neoEstAdjectif(
                motModele
            )
        ) {

            const utilisateurPossedeAdjectif =
                tokensUtilisateur.some(
                    mot =>
                        neoEstAdjectif(mot)
                );


            if (
                utilisateurPossedeAdjectif
            ) {

                correspondances++;

                continue;

            }

        }


        //======================================================
        // 🟦 ADVERBE
        //======================================================

        if (
            neoEstAdverbe(
                motModele
            )
        ) {

            const utilisateurPossedeAdverbe =
                tokensUtilisateur.some(
                    mot =>
                        neoEstAdverbe(mot)
                );


            if (
                utilisateurPossedeAdverbe
            ) {

                correspondances++;

                continue;

            }

        }

    }


    //==========================================================
    // 📊 SCORE LEXICAL
    //==========================================================

    let score = 0;


    if (
        motsAComparer.length
    ) {

        score =
            Math.round(
                (
                    correspondances /
                    motsAComparer.length
                ) * 100
            );

    }


    //==========================================================
    // 📐 BONUS STRUCTURE
    //==========================================================

    if (
        structureUtilisateur &&
        structureModele &&
        structureUtilisateur ===
        structureModele
    ) {

        score += 20;

    }


    //==========================================================
    // 🔒 LIMITER À 100
    //==========================================================

    if (
        score > 100
    ) {

        score = 100;

    }


    return {

        score,

        structure:
            structureUtilisateur,

        structureModele,

        verbe:
            analyseUtilisateur.verbe,

        sujet:
            analyseUtilisateur.sujet,

        objet:
            analyseUtilisateur.complement,

        typeComplement:
            analyseUtilisateur.typeComplement

    };

}


//==============================================================
// 🧠 MEILLEUR MODÈLE
//==============================================================
//
// 1. Analyse la structure du texte.
// 2. Ignore tous les modèles incompatibles.
// 3. Compare uniquement les modèles de même structure.
// 4. Sélectionne le meilleur score.
//
//==============================================================

function neoTrouverMeilleurModele(
    texte,
    categorie
) {

    if (
        !texte ||
        !categorie ||
        !NEO_MODELES_PHRASES?.fr?.[categorie]
    ) {

        return {

            trouve: false,

            score: 0,

            modele: null,

            structure: null,

            categorie

        };

    }


    const modeles =
        NEO_MODELES_PHRASES
            .fr[
                categorie
            ];


    //==========================================================
    // 🧠 STRUCTURE UTILISATEUR
    //==========================================================

    const analyseUtilisateur =
        neoAnalyserStructure(
            texte
        );


    const structureUtilisateur =
        analyseUtilisateur.structure;


    let meilleur = {

        trouve: false,

        score: 0,

        modele: null,

        structure:
            structureUtilisateur,

        categorie,

        structureModele: null,

        verbe:
            analyseUtilisateur.verbe ||
            null,

        sujet:
            analyseUtilisateur.sujet ||
            [],

        objet:
            analyseUtilisateur.complement ||
            [],

        typeComplement:
            analyseUtilisateur.typeComplement ||
            null

    };


    //==========================================================
    // 🔎 PARCOURS DES MODÈLES
    //==========================================================

    for (
        const modele of modeles
    ) {

        if (
            !modele ||
            !modele.phrase
        ) {

            continue;

        }


        //======================================================
        // 📐 STRUCTURE DU MODÈLE
        //======================================================

        const structureModele =
            detecterStructureModele(
                modele
            );


        //======================================================
        // ❌ STRUCTURE INCOMPATIBLE
        //======================================================

        if (
            structureUtilisateur &&
            structureModele &&
            structureUtilisateur !==
            structureModele
        ) {

            continue;

        }


        //======================================================
        // 📊 COMPARAISON
        //======================================================

        const comparaison =
            neoComparerPhrase(
                texte,
                modele.phrase
            );


        //======================================================
        // 🏆 MEILLEUR SCORE
        //======================================================

        if (
            comparaison.score >
            meilleur.score
        ) {

            meilleur = {

                trouve:
                    comparaison.score >=
                    NEOAI_CONFIG.seuilSimilarite,

                score:
                    comparaison.score,

                modele:
                    modele.phrase,

                structure:
                    structureUtilisateur ||
                    structureModele ||
                    null,

                categorie,

                structureModele:
                    structureModele ||
                    null,

                verbe:
                    comparaison.verbe ||
                    analyseUtilisateur.verbe ||
                    null,

                sujet:
                    comparaison.sujet ||
                    analyseUtilisateur.sujet ||
                    [],

                objet:
                    comparaison.objet ||
                    analyseUtilisateur.complement ||
                    [],

                typeComplement:
                    comparaison.typeComplement ||
                    analyseUtilisateur.typeComplement ||
                    null

            };

        }

    }


    return meilleur;

}


//==============================================================
// 📊 LISTE DES MODÈLES
//==============================================================

function neoListerModeles(
    categorie = null
) {

    if (
        !categorie
    ) {

        return (
            NEO_MODELES_PHRASES
                ?.fr ||
            {}
        );

    }


    return (
        NEO_MODELES_PHRASES
            ?.fr
            ?.[
                categorie
            ] || []
    );

}


//==============================================================
// 📚 LISTE DES VERBES
//==============================================================

function neoListerVerbes() {

    return Object.keys(
        NEO_VERBES?.fr || {}
    );

}


//==============================================================
// 📚 LISTE DES CATÉGORIES
//==============================================================

function neoListerCategories() {

    return Object.keys(
        NEO_MODELES_PHRASES?.fr || {}
    );

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    //==========================================================
    // ⚙️ CONFIGURATION
    //==========================================================

    NEOAI_CONFIG,


    //==========================================================
    // 📚 VOCABULAIRE
    //==========================================================

    NEO_VERBES,
    NEO_NOMS,
    NEO_ADJECTIFS,
    NEO_ADVERBES,
    NEO_PREPOSITIONS,
    NEO_CONNECTEURS,
    NEO_PRONOMS,
    NEO_LEARN,


    //==========================================================
    // 📐 FORMULES
    //==========================================================

    NEO_FORMULES,


    //==========================================================
    // 📝 MODÈLES
    //==========================================================

    NEO_MODELES_PHRASES,

    // Alias compatibilité
    NEO_MODELES:
        NEO_MODELES_PHRASES,

    NEO_COMBAT_MODELS,


    //==========================================================
    // 🧹 OUTILS
    //==========================================================

    neoNormaliserTexte,
    neoMinuscule,
    neoSansAccents,
    neoTokeniser,
    neoDecouperPhrases,


    //==========================================================
    // 🔎 RECHERCHE
    //==========================================================

    neoTrouverVerbe,
    neoRechercherMot,
    neoRechercherTexte,
    neoConnaitMot,


    //==========================================================
    // 🧠 ANALYSE
    //==========================================================

    neoAnalyserStructure,
    detecterStructureModele,

    // Analyse sémantique combat
    neoAnalyserCombat,
    neoAnalyserStructureCombat,
    neoGenererComprehensionCombat,
    neoGenererResumeCombat,


    //==========================================================
    // 🔎 COMPARAISON
    //==========================================================

    neoComparerPhrase,
    neoTrouverMeilleurModele,


    //==========================================================
    // 🧠 CLASSIFICATION
    //==========================================================

    neoEstAdjectif,
    neoEstAdverbe,
    neoEstDirection,
    neoEstPersonne,
    neoEstAnimal,
    neoEstObjet,
    neoEstLieu,
    neoEstNom,


    //==========================================================
    // 📚 UTILITAIRES
    //==========================================================

    neoListerModeles,
    neoListerVerbes,
    neoListerCategories

};
