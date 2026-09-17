/**
 * ╔══════════════════════════════════════════════════════╗
 * ║                     NEOAI                            ║
 * ║          BASE DE CONNAISSANCES LINGUISTIQUES        ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * IMPORTANT :
 * Ce fichier contient uniquement les connaissances de NeoAI.
 *
 * Tu peux ajouter :
 * - des mots
 * - des synonymes
 * - des catégories
 * - des modèles
 *
 * Le moteur NeoAIEngine.js ne doit normalement pas être modifié
 * lorsque tu enrichis cette base.
 */

// ======================================================
// CONFIGURATION
// ======================================================

const NEOAI_CONFIG = {
    langues: ["fr"],
    langueDefaut: "fr",

    debug: true,

    // Similarité minimale pour considérer qu'un modèle
    // est suffisamment proche.
    similariteMinimale: 50,

    // Similarité permettant une reconnaissance forte.
    similariteForte: 75,

    maxActions: 20
};


// ======================================================
// VERBES
// ======================================================

const NEO_VERBES = {

    // Déplacement
    deplacement: [
        "aller",
        "avancer",
        "reculer",
        "courir",
        "foncer",
        "charger",
        "s'élancer",
        "se ruer",
        "se précipiter",
        "marcher",
        "s'approcher",
        "s'éloigner",
        "tourner",
        "pivoter",
        "se déplacer",
        "bondir",
        "sauter",
        "retomber",
        "atterrir",
        "grimper",
        "descendre",
        "monter",
        "voler",
        "plonger",
        "ramper",
        "glisser"
    ],

    // Combat
    combat: [
        "frapper",
        "attaquer",
        "cogner",
        "asséner",
        "porter",
        "donner",
        "viser",
        "tirer",
        "bloquer",
        "parer",
        "esquiver",
        "éviter",
        "contrer",
        "saisir",
        "agripper",
        "attraper",
        "projeter",
        "repousser",
        "plaquer",
        "immobiliser",
        "désarmer"
    ],

    // Général
    general: [
        "prendre",
        "poser",
        "regarder",
        "observer",
        "voir",
        "entendre",
        "parler",
        "crier",
        "ouvrir",
        "fermer",
        "entrer",
        "sortir",
        "chercher",
        "trouver",
        "suivre",
        "attendre",
        "rejoindre",
        "quitter"
    ]
};


// ======================================================
// NOMS
// ======================================================

const NEO_NOMS = {

    combat: [
        "combat",
        "attaque",
        "défense",
        "coup",
        "frappe",
        "impact",
        "choc",
        "duel",
        "adversaire",
        "ennemi",
        "cible"
    ],

    deplacement: [
        "course",
        "saut",
        "bond",
        "déplacement",
        "trajectoire",
        "direction",
        "distance",
        "hauteur",
        "sol",
        "air"
    ],

    voyage: [
        "route",
        "chemin",
        "voyage",
        "destination",
        "ville",
        "pays",
        "gare",
        "aéroport",
        "véhicule"
    ]
};


// ======================================================
// ADJECTIFS
// ======================================================

const NEO_ADJECTIFS = [

    "violent",
    "puissant",
    "rapide",
    "lent",
    "brutal",
    "fort",
    "faible",
    "direct",
    "frontal",
    "latéral",
    "aérien",
    "vertical",
    "horizontal",
    "court",
    "long",
    "grand",
    "petit",
    "lourd",
    "léger"
];


// ======================================================
// ADVERBES
// ======================================================

const NEO_ADVERBES = [

    "rapidement",
    "lentement",
    "brutalement",
    "violemment",
    "directement",
    "soudainement",
    "instantanément",
    "précipitamment",
    "silencieusement"
];


// ======================================================
// CONNECTEURS
// ======================================================

const NEO_CONNECTEURS = [

    "puis",
    "ensuite",
    "après",
    "avant",
    "alors",
    "ensuite",
    "et",
    "mais",
    "pendant",
    "tandis",
    "avant de",
    "après avoir",
    "pour",
    "afin de"
];


// ======================================================
// PRÉPOSITIONS
// ======================================================

const NEO_PREPOSITIONS = [

    "vers",
    "sur",
    "sous",
    "dans",
    "contre",
    "avec",
    "sans",
    "depuis",
    "jusqu'à",
    "devant",
    "derrière",
    "au-dessus",
    "au-dessous",
    "entre",
    "près",
    "loin",
    "à",
    "de"
];


// ======================================================
// PARTIES DU CORPS
// ======================================================

const NEO_PARTIES_CORPS = {

    tete: [
        "tête",
        "crâne",
        "visage",
        "face",
        "front",
        "tempe",
        "joue",
        "menton",
        "mâchoire",
        "nez",
        "bouche",
        "œil",
        "yeux",
        "oreille"
    ],

    torse: [
        "torse",
        "poitrine",
        "ventre",
        "abdomen",
        "estomac",
        "thorax",
        "dos",
        "côtes",
        "flanc"
    ],

    bras: [
        "bras",
        "avant-bras",
        "coude",
        "poignet",
        "main",
        "doigt",
        "épaule"
    ],

    jambes: [
        "jambe",
        "cuisse",
        "genou",
        "mollet",
        "cheville",
        "pied",
        "talon",
        "semelle",
        "orteil"
    ]
};


// ======================================================
// MANIÈRES
// ======================================================

const NEO_MANIERES = {

    vitesse: [
        "vmax",
        "vitesse maximale",
        "rapidement",
        "lentement",
        "à pleine vitesse",
        "à toute vitesse"
    ],

    intensite: [
        "violent",
        "violente",
        "violemment",
        "puissant",
        "puissante",
        "brutal",
        "brutale",
        "fort",
        "fortement"
    ],

    mouvement: [
        "direct",
        "directement",
        "frontal",
        "latéral",
        "aérien",
        "en tournant",
        "en courant",
        "en sautant",
        "en bondissant"
    ]
};


// ======================================================
// VITESSES
// ======================================================

const NEO_VITESSES = [

    "vmax",
    "vitesse maximale",
    "rapide",
    "rapidement",
    "lent",
    "lentement",
    "pleine vitesse",
    "toute vitesse"
];


// ======================================================
// DISTANCES
// ======================================================

const NEO_DISTANCES = {

    close: [
        "close distance",
        "close",
        "courte distance",
        "à courte distance",
        "au contact",
        "corps à corps"
    ],

    moyenne: [
        "moyenne distance",
        "à moyenne distance"
    ],

    longue: [
        "longue distance",
        "à longue distance",
        "de loin"
    ]
};


// ======================================================
// SYNONYMES
// ======================================================
const NEO_SYNONYMES = {

    // ==============================================
    // DÉPLACEMENTS
    // ==============================================

    deplacement: {

        course: [
            "courir",
            "court",
            "foncer",
            "fonce",
            "fonçant",
            "sprinter",
            "sprint",
            "sprinte",
            "se précipiter",
            "se précipite",
            "filer",
            "file",
            "accélérer",
            "accélère"
        ],

        saut: [
            "sauter",
            "saute",
            "bondir",
            "bondit",
            "s'élancer",
            "s'élance"
        ],

        bond: [
            "bondir",
            "bondit",
            "faire un bond",
            "bond"
        ],

        vol: [
            "voler",
            "vole",
            "s'envoler",
            "s'envole",
            "planer",
            "plane"
        ]
    }
};


// ======================================================
// ACTIONS NORMALISÉES
// ======================================================

const NEO_ACTIONS = {

    deplacement: [
        "avancer",
        "reculer",
        "courir",
        "foncer",
        "marcher",
        "s'approcher",
        "s'éloigner",
        "sauter",
        "bondir",
        "voler",
        "grimper",
        "descendre",
        "tourner",
        "pivoter",
        "glisser",
        "ramper"
    ],

    attaque: [
        "frapper",
        "attaquer",
        "cogner",
        "asséner",
        "tirer"
    ],

    esquive: [
        "esquiver",
        "éviter"
    ],

    parade: [
        "bloquer",
        "parer",
        "intercepter"
    ],

    contre: [
        "contrer",
        "riposter"
    ],

    saisie: [
        "saisir",
        "attraper",
        "agripper",
        "empoigner"
    ],

    projection: [
        "projeter",
        "lancer",
        "repousser"
    ]
};


// ======================================================
// CATÉGORIES GÉNÉRALES
// ======================================================

const NEO_CATEGORIES = {

    voyages: [
        "voyage",
        "route",
        "transport",
        "destination",
        "déplacement"
    ],

    vie_courante: [
        "maison",
        "travail",
        "école",
        "manger",
        "boire",
        "dormir",
        "acheter",
        "vendre"
    ],

    combats: [
        "combat",
        "attaque",
        "défense",
        "esquive",
        "parade",
        "saisie",
        "projection"
    ],

    deplacements: [
        "courir",
        "marcher",
        "sauter",
        "voler",
        "avancer",
        "reculer"
    ]
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    NEOAI_CONFIG,

    NEO_VERBES,
    NEO_NOMS,
    NEO_ADJECTIFS,
    NEO_ADVERBES,
    NEO_CONNECTEURS,
    NEO_PREPOSITIONS,

    NEO_PARTIES_CORPS,
    NEO_MANIERES,
    NEO_VITESSES,
    NEO_DISTANCES,

    NEO_SYNONYMES,
    NEO_ACTIONS,
    NEO_ACTION_MODELS,
    NEO_CATEGORIES
};
                
                                                                                     
