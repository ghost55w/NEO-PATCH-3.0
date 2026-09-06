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

        description:
            "Se déplacer frontalement vers une cible.",

        exemple:
            "Naruto avance en courant vers Maki."
    },

    {
        id: "DEP_F_002",

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

        description:
            "Se déplacer frontalement vers une cible en suivant une direction précise.",

        exemple:
            "Naruto fonce en courant vers Maki en direction de l'avant."
    },

    {
        id: "DEP_F_003",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "DISTANCE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "DISTANCE",
            "FIN_TRAJET"
        ],

        description:
            "Se déplacer frontalement sur une distance déterminée jusqu'à une position finale précise.",

        exemple:
            "Naruto court vers Maki sur 8 mètres pour arriver à 2 mètres d'elle."
    },

    {
        id: "DEP_F_004",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        description:
            "Se déplacer frontalement à une vitesse donnée jusqu'à une position finale précise.",

        exemple:
            "Naruto fonce vers Maki à vitesse maximale pour finir à 2 mètres d'elle."
    },

    {
        id: "DEP_F_005",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "DIRECTION",
            "CIBLE",
            "DISTANCE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "DIRECTION",
            "CIBLE",
            "FIN_TRAJET"
        ],

        description:
            "Déplacement frontal complet avec direction, distance, vitesse et position finale.",

        exemple:
            "Naruto fonce à vitesse maximale vers Maki sur 10 mètres dans sa direction pour arriver à 1 mètre d'elle."
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
            "COURBE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "FIN_TRAJET"
        ],

        description:
            "Course circulaire autour d'une cible avec une longueur de courbe et une fin de trajet précises.",

        exemple:
            "Naruto fait une course circulaire autour de Maki sur une courbe de 2 mètres pour arriver à 3 mètres d'elle."
    },

    {
        id: "DEP_C_002",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "FIN_TRAJET"
        ],

        description:
            "Course circulaire autour d'une cible avec une courbe et un côté déterminé jusqu'à une position finale précise.",

        exemple:
            "Naruto fait une course circulaire autour de Maki avec une courbe de 2 mètres pour arriver sur son côté gauche."
    },

    {
        id: "DEP_C_003",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "FIN_TRAJET"
        ],

        description:
            "Course circulaire avec une courbe et une vitesse déterminées jusqu'à une position finale précise.",

        exemple:
            "Naruto fait une course circulaire à vitesse maximale autour de Maki sur une courbe de 2 mètres pour finir à 3 mètres d'elle."
    },

    {
        id: "DEP_C_004",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "FIN_TRAJET"
        ],

        description:
            "Course circulaire avec courbe, côté, vitesse et position finale déterminés.",

        exemple:
            "Naruto fait une course circulaire à vitesse maximale autour de Maki sur une courbe de 2 mètres pour finir sur son côté gauche."
    },

    {
        id: "DEP_C_005",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "DISTANCE",
            "VITESSE",
            "FIN_TRAJET"
        ],

        requis: [
            "ACTION",
            "MANIERE",
            "CIBLE",
            "COURBE",
            "COTE",
            "FIN_TRAJET"
        ],

        description:
            "Course circulaire complète avec courbe, côté, distance parcourue, vitesse et position finale.",

        exemple:
            "Naruto fait une course circulaire à vitesse maximale autour de Maki sur 8 mètres avec une courbe de 2 mètres pour arriver à 2 mètres sur son profil droit."
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


    //==========================================================
    // ⚔️ FUTURES CATÉGORIES
    //==========================================================

    attaque: [],
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

    /*
     * On retire d'abord les valeurs explicitement
     * associées à une hauteur.
     *
     * Exemples :
     * 5m de hauteur
     * 5m mètres de hauteur
     * 5 mètres de hauteur
     * 5mh
     * 5cmh
     * 5kmh
     */
    let texteSansHauteur = texte.replace(
        /(?:monte|montant|s'élève|s eleve)\s*(?:à|a|de)?\s*\d+(?:[.,]\d+)?\s*(?:kmh?|cmh?|mh?|km|cm|mètres?|m)\b\s*(?:mètres?|centimètres?|kilomètres?)?\s*(?:de\s+)?hauteur\b/gi,
        " "
    );

    texteSansHauteur = texteSansHauteur.replace(
        /\d+(?:[.,]\d+)?\s*(?:kmh?|cmh?|mh?|km|cm|mètres?|m)\b\s*(?:de\s+)?hauteur\b/gi,
        " "
    );

    /*
     * Recherche de la distance.
     */
    const match = texteSansHauteur.match(
        /(?:sur|de|pendant|parcours?|parcourant|avance(?:r)?|recule(?:r)|distance)?\s*(\d+(?:[.,]\d+)?)\s*(km|cm|mètres?|m)\b(?:\s*(?:de\s+)?distance)?/i
    );

    if (!match) return null;

    const uniteBrute = match[2].toLowerCase();

    let unite = "m";

    if (uniteBrute === "cm") {
        unite = "cm";
    }
    else if (uniteBrute === "km") {
        unite = "km";
    }

    return {
        valeur: Number(
            match[1].replace(",", ".")
        ),
        unite
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

    /*
     * Formes :
     * 5m
     * 5mh
     * 5cm
     * 5cmh
     * 5km
     * 5kmh
     */
    const matchColle = texte.match(
        /(?:monte|montant|s'élève|s eleve|hauteur|haut)\s*(?:à|a|de)?\s*(\d+(?:[.,]\d+)?)\s*(kmh?|cmh?|mh?|km|cm|m)\b/i
    );

    if (matchColle) {

        const uniteBrute = matchColle[2]
            .toLowerCase()
            .replace(/h$/, "");

        return {
            valeur: Number(
                matchColle[1].replace(",", ".")
            ),
            unite: uniteBrute
        };
    }

    /*
     * Formes :
     * 5 mètres de hauteur
     * 5 m de hauteur
     * 5 centimètres de hauteur
     * 5 cm de haut
     * 5 kilomètres de hauteur
     */
    const matchInverse = texte.match(
        /(\d+(?:[.,]\d+)?)\s*(kilomètres?|km|centimètres?|cm|mètres?|m)\s*(?:de\s+)?(?:hauteur|haut)\b/i
    );

    if (matchInverse) {

        const uniteBrute = matchInverse[2]
            .toLowerCase();

        let unite = "m";

        if (
            uniteBrute === "cm" ||
            uniteBrute.startsWith("centim")
        ) {
            unite = "cm";
        }
        else if (
            uniteBrute === "km" ||
            uniteBrute.startsWith("kilom")
        ) {
            unite = "km";
        }

        return {
            valeur: Number(
                matchInverse[1].replace(",", ".")
            ),
            unite
        };
    }

    return null;
}


function neoExtraireCote(texte) {

    const t = neoNormaliserTexte(texte);

    /*
     * CÔTÉ DROIT
     */
    if (
        t.includes("par la droite") ||
        t.includes("par droite") ||
        t.includes("sur la droite") ||
        t.includes("sur droite") ||
        t.includes("cote droit") ||
        t.includes("cote droite") ||
        t.includes("du cote droit") ||
        t.includes("du cote droite") ||
        t.includes("sur son cote droit") ||
        t.includes("sur son cote droite") ||
        t.includes("son cote droit") ||
        t.includes("son cote droite") ||
        t.includes("cote droit de") ||
        t.includes("cote droite de") ||
        t.includes("profil droit") ||
        t.includes("de profil droit") ||
        t.includes("sur le profil droit") ||
        t.includes("sur son profil droit") ||
        t.includes("son profil droit") ||
        t.includes("profil droit de")
    ) {
        return "droite";
    }

    /*
     * CÔTÉ GAUCHE
     */
    if (
        t.includes("par la gauche") ||
        t.includes("par gauche") ||
        t.includes("sur la gauche") ||
        t.includes("sur gauche") ||
        t.includes("cote gauche") ||
        t.includes("du cote gauche") ||
        t.includes("sur son cote gauche") ||
        t.includes("son cote gauche") ||
        t.includes("cote gauche de") ||
        t.includes("profil gauche") ||
        t.includes("de profil gauche") ||
        t.includes("sur le profil gauche") ||
        t.includes("sur son profil gauche") ||
        t.includes("son profil gauche") ||
        t.includes("profil gauche de")
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
     * Priorité aux verbes qui introduisent directement
     * une cible.
     *
     * Exemple :
     * contourne Maki
     * attaque Maki
     * poursuit Maki
     */
    const matchVerbe = texte.match(
        /\b(?:contourne|contourner|contournant|attaque|attaquer|poursuit|poursuivre|suit|suivre)\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*)/i
    );

    if (matchVerbe) {
        return matchVerbe[1];
    }

    /*
     * Formes classiques :
     * vers X
     * autour de X
     * contre X
     * devant X
     * derrière X
     */
    const match = texte.match(
        /\b(?:vers|autour de|contre|devant|derrière|aupres de|aupres)\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*)/i
    );

    if (!match) return null;

    return match[1];
}


function neoExtraireSujet(texte) {

    /*
     * Le sujet est généralement le premier nom propre.
     * Exemple :
     * Maki se déplace...
     * Tobirama court...
     */

    const match = texte.match(
        /^\s*([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*)\b/
    );

    return match ? match[1] : null;
}


function neoDeterminerFamille(texte, maniere) {

    const t = neoNormaliserTexte(texte);

    /*
     * PRIORITÉ 1 :
     * Saut / bond.
     *
     * Dès qu'un mouvement de saut ou de bond
     * est explicitement présent dans le pavé,
     * on utilise la famille saut_bond.
     */

    if (
        t.includes("saute") ||
        t.includes("sauter") ||
        t.includes("saut") ||
        t.includes("en sautant") ||
        t.includes("bondit") ||
        t.includes("bondir") ||
        t.includes("bond") ||
        t.includes("fait un bond") ||
        t.includes("fait bond")
    ) {
        return "saut_bond";
    }

    /*
     * PRIORITÉ 2 :
     * Familles explicitement indiquées
     * dans NEO_COMBAT_FAMILLES.
     */

    for (
        const [famille, variantes]
        of Object.entries(NEO_COMBAT_FAMILLES)
    ) {

        for (const variante of variantes) {

            if (
                t.includes(
                    neoNormaliserTexte(variante)
                )
            ) {
                return famille;
            }
        }
    }

    /*
     * PRIORITÉ 3 :
     * Si aucun mouvement particulier n'est indiqué,
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

    if (
        t.includes("zig zag") ||
        t.includes("zigzag") ||
        t.includes("en zig zag") ||
        t.includes("en zigzag")
    ) {
        return "zigzag";
    }

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

    const sujet = neoExtraireSujet(texte);
    const cible = neoExtraireCible(texte);

    const maniere = neoTrouverCorrespondance(
        texte,
        NEO_COMBAT_MANIERES
    );

    const vitesse = neoTrouverCorrespondance(
        texte,
        NEO_COMBAT_VITESSES
    );

    const famille = neoDeterminerFamille(
        texte,
        maniere
    );

    const trajectoire = neoDeterminerTrajectoire(
        famille,
        texte
    );

    const cote = neoExtraireCote(texte);
    const direction = neoExtraireDirection(texte);
    const distance = neoExtraireDistance(texte);
    const courbe = neoExtraireCourbe(texte);
    const hauteur = neoExtraireHauteur(texte);

    /*
     * Pour les déplacements :
     * l'action sémantique est TOUJOURS
     * "se déplacer".
     *
     * La manière précise comment.
     */

    let action = null;

    if (
        maniere ||
        famille ||
        direction ||
        trajectoire
    ) {
        action = "se déplacer";
    }

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

    /*
     * Nettoyage des valeurs absentes.
     */

    for (const key of Object.keys(slots)) {
        if (
            slots[key] === null ||
            slots[key] === undefined
        ) {
            delete slots[key];
        }
    }

    return {
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


function neoTrouverMeilleurModeleCombat(analyse) {

    let meilleurs = [];

    for (
        const [categorie, familles]
        of Object.entries(NEO_COMBAT_MODELS)
    ) {

        /*
         * Si une famille a déjà été déterminée,
         * on ne compare que les modèles de cette famille.
         *
         * Exemple :
         * "saute" → saut_bond
         * "fonce" → frontal
         * "diagonale" → diagonal
         */
        const famillesAAnalyser =
            analyse?.famille &&
            familles?.[analyse.famille]
                ? {
                    [analyse.famille]:
                        familles[analyse.famille]
                }
                : familles;

        for (
            const [famille, modeles]
            of Object.entries(famillesAAnalyser)
        ) {

            if (!Array.isArray(modeles)) continue;

            for (const modele of modeles) {

                const comparaison =
                    neoComparerModeleCombat(
                        analyse,
                        modele
                    );

                meilleurs.push({
                    categorie,
                    famille,
                    modele,
                    score: comparaison.score,
                    requisManquants:
                        comparaison.requisManquants
                });
            }
        }
    }

    meilleurs.sort(
        (a, b) => b.score - a.score
    );

    return meilleurs[0] || null;
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


function neoGenererResumeCombat(analyse) {

    const s = analyse.slots || {};

    const sujet = s.SUJET || "Le combattant";
    const action = s.ACTION || "se déplace";
    const maniere = s.MANIERE;
    const cible = s.CIBLE;

    let phrase = sujet;

    /*
     * Manière
     */

    if (maniere === "courir") {
        phrase += " se déplace en courant";
    }

    else if (maniere === "marcher") {
        phrase += " se déplace en marchant";
    }

    else if (maniere === "ramper") {
        phrase += " se déplace en rampant";
    }

    else if (maniere === "glisser") {
        phrase += " se déplace en glissant";
    }

    else if (maniere === "sauter") {
        phrase += " effectue un saut";
    }

    else if (maniere === "voler") {
        phrase += " se déplace dans les airs";
    }

    else {
        phrase += ` ${action}`;
    }

    /*
     * Cible
     */

    if (cible) {

        if (analyse.famille === "circulaire") {
            phrase += ` autour de ${cible}`;
        } else {
            phrase += ` vers ${cible}`;
        }
    }

    /*
     * Côté
     */

    if (s.COTE) {
        phrase += ` par la ${s.COTE}`;
    }

    /*
     * Trajectoire / courbe
     */

    if (s.COURBE) {

        phrase +=
            ` en suivant une courbe de ${s.COURBE.valeur} ${s.COURBE.unite}`;
    }

    /*
     * Direction
     */

    if (s.DIRECTION) {
        phrase += ` vers ${s.DIRECTION}`;
    }

    /*
     * Vitesse
     */

    if (s.VITESSE === "vmax") {
        phrase += " à pleine vitesse";
    }

    else if (s.VITESSE) {
        phrase += ` à ${s.VITESSE} vitesse`;
    }

    /*
     * Distance
     */

    if (s.DISTANCE) {

        phrase +=
            ` sur une distance de ${s.DISTANCE.valeur} ${s.DISTANCE.unite}`;
    }

    /*
     * Hauteur
     */

    if (s.HAUTEUR) {

        phrase +=
            ` à ${s.HAUTEUR.valeur} ${s.HAUTEUR.unite} de hauteur`;
    }

    return phrase + ".";
}


function neoAnalyserCombat(texte) {

    const analyse =
        neoAnalyserStructureCombat(texte);

    const meilleur =
        neoTrouverMeilleurModeleCombat(analyse);

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
