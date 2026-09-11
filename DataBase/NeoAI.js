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

    foncer: [
        "courir",
        "se précipiter",
        "se ruer",
        "s'élancer",
        "charger",
        "foncer"
    ],

    courir: [
        "foncer",
        "charger",
        "s'élancer",
        "se ruer"
    ],

    frapper: [
        "attaquer",
        "cogner",
        "asséner",
        "porter un coup",
        "donner un coup",
        "frapper"
    ],

    attaquer: [
        "frapper",
        "cogner",
        "asséner",
        "porter un coup"
    ],

    sauter: [
        "bondir",
        "faire un bond",
        "effectuer un saut",
        "sauter"
    ],

    avancer: [
        "progresser",
        "se déplacer",
        "marcher",
        "aller vers",
        "avancer"
    ],

    esquiver: [
        "éviter",
        "se dérober",
        "éviter l'attaque",
        "esquiver"
    ],

    bloquer: [
        "parer",
        "intercepter",
        "bloquer"
    ],

    saisir: [
        "attraper",
        "agripper",
        "empoigner",
        "saisir"
    ]
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
// MODÈLES D'ACTIONS
// ======================================================

const NEO_ACTION_MODELS = {

// ==================================================
// DÉPLACEMENTS
// ==================================================

deplacement: [

    // ==================================================
    // SAUT / BOND — MODÈLE EXISTANT
    // ==================================================

    {
        id: "DEP_SB_001",
        categorie: "deplacement",
        famille: "saut_bond",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "HAUTEUR"
        ],

        exemples: [
            "Naruto saute vers Panda en montant à 5m de hauteur",
            "Naruto bondit vers Panda à 5 mètres",
            "Naruto effectue un saut aérien vers Panda",
            "Naruto fait un bond vers Panda",
            "Naruto effectue un bond vers Panda à 5m",
            "Naruto saute en direction de Panda",
            "Naruto bondit en direction de Panda"
        ]
    },


    // ==================================================
    // SAUT SIMPLE
    // ==================================================

    {
        id: "DEP_SAUT_001",
        categorie: "deplacement",
        famille: "saut",

        structure: [
            "SUJET",
            "ACTION"
        ],

        exemples: [
            "Naruto saute",
            "Naruto bondit",
            "Naruto fait un saut",
            "Naruto fait un bond",
            "Naruto effectue un saut",
            "Naruto effectue un bond",
            "Naruto réalise un saut",
            "Naruto réalise un bond",
            "Naruto s'élève dans les airs",
            "Naruto bondit dans les airs",
            "Naruto fait un saut dans les airs",
            "Naruto fait un bond dans les airs",
            "Naruto effectue un saut aérien",
            "Naruto effectue un bond aérien",
            "Naruto prend son élan et saute",
            "Naruto prend son élan et fait un bond",
            "Naruto se projette dans les airs",
            "Naruto quitte le sol en sautant"
        ]
    },


    // ==================================================
    // SAUT VERS UNE CIBLE
    // ==================================================

    {
        id: "DEP_SAUT_002",
        categorie: "deplacement",
        famille: "saut_vers_cible",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto saute vers Panda",
            "Naruto bondit vers Panda",
            "Naruto fait un saut vers Panda",
            "Naruto fait un bond vers Panda",
            "Naruto effectue un saut vers Panda",
            "Naruto effectue un bond vers Panda",
            "Naruto réalise un saut vers Panda",
            "Naruto réalise un bond vers Panda",
            "Naruto saute en direction de Panda",
            "Naruto bondit en direction de Panda",
            "Naruto fait un saut en direction de Panda",
            "Naruto fait un bond en direction de Panda",
            "Naruto effectue un saut en direction de Panda",
            "Naruto effectue un bond en direction de Panda",
            "Naruto s'élance vers Panda en sautant",
            "Naruto se projette dans les airs vers Panda",
            "Naruto saute pour rejoindre Panda",
            "Naruto fait un bond pour rejoindre Panda"
        ]
    },


    // ==================================================
    // SAUT AVEC DISTANCE
    // ==================================================

    {
        id: "DEP_SAUT_003",
        categorie: "deplacement",
        famille: "saut_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto saute sur 5m",
            "Naruto bondit sur 5m",
            "Naruto fait un saut sur 5m",
            "Naruto fait un bond sur 5m",
            "Naruto effectue un saut de 5m",
            "Naruto effectue un bond de 5m",
            "Naruto réalise un saut de 5m",
            "Naruto réalise un bond de 5m",
            "Naruto saute sur une distance de 5m",
            "Naruto bondit sur une distance de 5m",
            "Naruto fait un saut sur une distance de 5m",
            "Naruto fait un bond sur une distance de 5m",
            "Naruto parcourt 5m dans les airs",
            "Naruto se projette sur 5m",
            "Naruto se propulse sur 5m"
        ]
    },


    // ==================================================
    // SAUT AVEC HAUTEUR
    // ==================================================

    {
        id: "DEP_SAUT_004",
        categorie: "deplacement",
        famille: "saut_hauteur",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR"
        ],

        exemples: [
            "Naruto saute à 5m de hauteur",
            "Naruto bondit à 5m de hauteur",
            "Naruto fait un saut à 5m de hauteur",
            "Naruto fait un bond à 5m de hauteur",
            "Naruto effectue un saut de 5m de hauteur",
            "Naruto effectue un bond de 5m de hauteur",
            "Naruto réalise un saut à 5m de hauteur",
            "Naruto réalise un bond à 5m de hauteur",
            "Naruto s'élève à 5m",
            "Naruto monte à 5m dans les airs",
            "Naruto atteint une hauteur de 5m en sautant",
            "Naruto fait un saut jusqu'à 5m",
            "Naruto fait un bond jusqu'à 5m"
        ]
    },


    // ==================================================
    // SAUT + HAUTEUR + DISTANCE
    // ==================================================

    {
        id: "DEP_SAUT_005",
        categorie: "deplacement",
        famille: "saut_hauteur_distance",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "DISTANCE"
        ],

        exemples: [
            "Naruto saute de 5m de hauteur sur 10m",
            "Naruto bondit à 5m de hauteur sur 10m",
            "Naruto fait un saut de 5m de hauteur sur 10m",
            "Naruto fait un bond de 5m de hauteur sur 10m",
            "Naruto effectue un saut de 5m de hauteur sur 10m",
            "Naruto effectue un bond de 5m de hauteur sur 10m",
            "Naruto réalise un saut de 5m de hauteur sur 10m",
            "Naruto réalise un bond de 5m de hauteur sur 10m",
            "Naruto s'élève à 5m et parcourt 10m",
            "Naruto saute à 5m de hauteur pour parcourir 10m",
            "Naruto se projette à 5m de hauteur sur 10m",
            "Naruto fait un saut de 5m de haut sur une distance de 10m",
            "Naruto fait un bond de 5m de haut sur une distance de 10m"
        ]
    },


    // ==================================================
    // SAUT + VITESSE
    // ==================================================

    {
        id: "DEP_SAUT_006",
        categorie: "deplacement",
        famille: "saut_vitesse",

        structure: [
            "SUJET",
            "ACTION",
            "VITESSE"
        ],

        exemples: [
            "Naruto saute à vitesse maximale",
            "Naruto bondit à vitesse maximale",
            "Naruto fait un saut à vitesse maximale",
            "Naruto fait un bond à vitesse maximale",
            "Naruto effectue un saut à vitesse maximale",
            "Naruto effectue un bond à vitesse maximale",
            "Naruto réalise un saut à vitesse maximale",
            "Naruto réalise un bond à vitesse maximale",
            "Naruto saute à vmax",
            "Naruto bondit à vmax",
            "Naruto fait un saut à vmax",
            "Naruto fait un bond à vmax",
            "Naruto effectue un saut à vmax",
            "Naruto effectue un bond à vmax",
            "Naruto s'élance dans les airs à pleine vitesse",
            "Naruto se projette dans les airs à vitesse maximale"
        ]
    },


    // ==================================================
    // SAUT + ATTERRISSAGE
    // ==================================================

    {
        id: "DEP_SAUT_007",
        categorie: "deplacement",
        famille: "saut_atterrissage",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto saute vers Panda pour atterrir sur lui",
            "Naruto bondit vers Panda pour retomber sur lui",
            "Naruto fait un saut vers Panda pour atterrir sur lui",
            "Naruto fait un bond vers Panda pour retomber sur lui",
            "Naruto effectue un saut vers Panda pour atterrir sur lui",
            "Naruto effectue un bond vers Panda pour retomber sur lui",
            "Naruto réalise un saut vers Panda pour atterrir sur lui",
            "Naruto réalise un bond vers Panda pour retomber sur lui",
            "Naruto saute jusqu'à Panda avant d'atterrir",
            "Naruto bondit jusqu'à Panda avant de retomber",
            "Naruto saute vers Panda et atterrit sur lui",
            "Naruto bondit vers Panda et retombe sur lui"
        ]
    },


    // ==================================================
    // SAUT + ATTERRISSAGE + PARTIE DU CORPS
    // ==================================================

    {
        id: "DEP_SAUT_008",
        categorie: "deplacement",
        famille: "saut_atterrissage_corps",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "PARTIE_CORPS"
        ],

        exemples: [
            "Naruto saute vers Panda pour atterrir sur sa tête",
            "Naruto bondit vers Panda pour retomber sur sa tête",
            "Naruto fait un saut vers Panda pour atterrir sur sa tête",
            "Naruto fait un bond vers Panda pour retomber sur sa tête",
            "Naruto effectue un saut vers Panda pour atterrir sur son abdomen",
            "Naruto effectue un bond vers Panda pour retomber sur son abdomen",
            "Naruto réalise un saut vers Panda pour atterrir sur son dos",
            "Naruto réalise un bond vers Panda pour retomber sur son dos",
            "Naruto saute vers Panda et atterrit sur son épaule",
            "Naruto bondit vers Panda et retombe sur son épaule",
            "Naruto fait un saut vers Panda pour atterrir sur son torse",
            "Naruto fait un bond vers Panda pour retomber sur son torse",
            "Naruto saute vers Panda pour atterrir sur ses jambes",
            "Naruto bondit vers Panda pour retomber sur ses jambes",
            "Naruto effectue un saut vers Panda et atterrit sur sa tête",
            "Naruto effectue un bond vers Panda et retombe sur son abdomen"
        ]
    },


    // ==================================================
    // SAUT + CIBLE + VITESSE + DISTANCE
    // ==================================================

    {
        id: "DEP_SAUT_009",
        categorie: "deplacement",
        famille: "saut_cible_vitesse_distance",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "VITESSE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto saute vers Panda vmax sur 10m",
            "Naruto bondit vers Panda vmax sur 10m",
            "Naruto fait un saut vers Panda vmax sur 10m",
            "Naruto fait un bond vers Panda vmax sur 10m",
            "Naruto effectue un saut vers Panda à vitesse maximale sur 10m",
            "Naruto effectue un bond vers Panda à vitesse maximale sur 10m",
            "Naruto réalise un saut vers Panda à vmax sur 10m",
            "Naruto réalise un bond vers Panda à vmax sur 10m",
            "Naruto saute en direction de Panda à pleine vitesse sur 10m",
            "Naruto bondit en direction de Panda à pleine vitesse sur 10m",
            "Naruto fait un saut en direction de Panda à vitesse maximale sur 10m",
            "Naruto fait un bond en direction de Panda à vitesse maximale sur 10m",
            "Naruto se projette vers Panda à vitesse maximale sur 10m"
        ]
    },


    // ==================================================
    // SAUT COMPLET
    // ==================================================

    {
        id: "DEP_SAUT_010",
        categorie: "deplacement",
        famille: "saut_complet",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "CIBLE",
            "VITESSE",
            "DISTANCE",
            "PARTIE_CORPS"
        ],

        exemples: [
            "Naruto saute de 5m de hauteur vers Panda vmax sur 10m pour atterrir sur sa tête",
            "Naruto bondit de 5m de hauteur vers Panda vmax sur 10m pour retomber sur sa tête",
            "Naruto fait un saut de 5m de hauteur vers Panda vmax sur 10m pour atterrir sur sa tête",
            "Naruto fait un bond de 5m de hauteur vers Panda vmax sur 10m pour retomber sur sa tête",
            "Naruto effectue un saut de 5m de hauteur vers Panda à vitesse maximale sur 10m pour atterrir sur sa tête",
            "Naruto effectue un bond de 5m de hauteur vers Panda à vitesse maximale sur 10m pour retomber sur sa tête",
            "Naruto réalise un saut de 5m de hauteur vers Panda à vmax sur 10m pour atterrir sur sa tête",
            "Naruto réalise un bond de 5m de hauteur vers Panda à vmax sur 10m pour retomber sur sa tête",
            "Naruto s'élève à 5m puis se projette vers Panda à vmax sur 10m pour atterrir sur sa tête",
            "Naruto fait un saut à 5m de hauteur vers Panda à vitesse maximale sur 10m pour retomber sur sa tête",
            "Naruto fait un bond à 5m de hauteur vers Panda à vitesse maximale sur 10m pour atterrir sur sa tête",
            "Naruto effectue un saut aérien de 5m vers Panda sur 10m avant de retomber sur sa tête",
            "Naruto effectue un bond aérien de 5m vers Panda sur 10m avant d'atterrir sur sa tête",
            "Naruto saute à 5m de hauteur vers Panda sur 10m pour atterrir sur sa tête",
            "Naruto bondit à 5m de hauteur vers Panda sur 10m pour retomber sur sa tête"
        ]
    },


    // ==================================================
    // COURSE SIMPLE
    // ==================================================

    {
        id: "DEP_COURSE_001",
        categorie: "deplacement",
        famille: "course",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE"
        ],

        exemples: [
            "Naruto court vers Panda",
            "Naruto fonce vers Panda",
            "Naruto se rue vers Panda",
            "Naruto charge Panda",
            "Naruto court en direction de Panda",
            "Naruto se précipite vers Panda",
            "Naruto s'élance vers Panda",
            "Naruto sprinte vers Panda",
            "Naruto court rapidement vers Panda",
            "Naruto court à pleine vitesse vers Panda",
            "Naruto fonce à toute vitesse vers Panda",
            "Naruto charge en courant vers Panda",
            "Naruto avance en courant vers Panda",
            "Naruto court droit vers Panda",
            "Naruto court frontalement vers Panda",
            "Naruto court de face vers Panda"
        ]
    },


    // ==================================================
    // COURSE + DISTANCE
    // ==================================================

    {
        id: "DEP_COURSE_002",
        categorie: "deplacement",
        famille: "course_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto court sur 5m",
            "Naruto court sur 10m",
            "Naruto parcourt 10m en courant",
            "Naruto court pendant 10m",
            "Naruto sprinte sur 10m",
            "Naruto fonce sur 10m",
            "Naruto se précipite sur 10m",
            "Naruto avance en courant sur 10m",
            "Naruto parcourt une distance de 10m en courant",
            "Naruto court sur une distance de 20m"
        ]
    },


    // ==================================================
    // COURSE + VITESSE
    // ==================================================

    {
        id: "DEP_COURSE_003",
        categorie: "deplacement",
        famille: "course_vitesse",

        structure: [
            "SUJET",
            "ACTION",
            "VITESSE"
        ],

        exemples: [
            "Naruto court à vitesse maximale",
            "Naruto fonce à vitesse maximale",
            "Naruto sprinte à pleine vitesse",
            "Naruto court à vmax",
            "Naruto fonce à vmax",
            "Naruto se rue à toute vitesse",
            "Naruto court rapidement",
            "Naruto accélère à pleine vitesse",
            "Naruto sprinte à toute vitesse"
        ]
    },


    // ==================================================
    // COURSE + CIBLE + VITESSE + DISTANCE
    // ==================================================

    {
        id: "DEP_COURSE_004",
        categorie: "deplacement",
        famille: "course_complete",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "VITESSE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto court vers Panda à vmax sur 10m",
            "Naruto fonce vers Panda à vitesse maximale sur 10m",
            "Naruto sprinte vers Panda à pleine vitesse sur 10m",
            "Naruto se rue vers Panda à vmax sur 10m",
            "Naruto charge Panda à toute vitesse sur 10m",
            "Naruto court en direction de Panda à vmax sur 10m",
            "Naruto se précipite vers Panda à vitesse maximale sur 10m"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE / EN COURBE
    // ==================================================

    {
        id: "DEP_COURSE_005",
        categorie: "deplacement",
        famille: "course_circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda",
            "Naruto court en arc autour de Panda",
            "Naruto décrit une courbe autour de Panda en courant",
            "Naruto décrit un arc de cercle autour de Panda",
            "Naruto effectue une trajectoire courbe autour de Panda en courant",
            "Naruto se déplace en courbe autour de Panda",
            "Naruto court en cercle autour de Panda en suivant une courbe",
            "Naruto tourne en courant autour de Panda en courbe",
            "Naruto court en courbe vers la gauche autour de Panda",
            "Naruto court en courbe vers la droite autour de Panda",
            "Naruto effectue une courbe de 2m autour de Panda en courant",
            "Naruto court en arc de 2m autour de Panda",
            "Naruto décrit une courbe de 2m autour de Panda",
            "Naruto contourne Panda en courant suivant une trajectoire courbe",
            "Naruto contourne Panda en décrivant une courbe",
            "Naruto court autour de Panda en suivant une courbe",
            "Naruto se déplace autour de Panda en arc de cercle"
        ]
    },

        // ==================================================
    // COURSE CIRCULAIRE + CÔTÉ GAUCHE
    // ==================================================

    {
        id: "DEP_COURSE_006",
        categorie: "deplacement",
        famille: "course_circulaire_cote_gauche",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "INTENTION"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda par la gauche",
            "Naruto court autour de Panda en passant par la gauche",
            "Naruto contourne Panda par la gauche en courant",
            "Naruto contourne Panda en passant par la gauche",
            "Naruto effectue une course circulaire par la gauche autour de Panda",
            "Naruto court en cercle autour de Panda par la gauche",
            "Naruto décrit une courbe autour de Panda par la gauche",
            "Naruto court en arc autour de Panda en passant par la gauche",
            "Naruto court autour de Panda afin d'arriver par la gauche",
            "Naruto court autour de Panda pour arriver sur son profil gauche",
            "Naruto court en courbe autour de Panda pour finir sur son profil gauche",
            "Naruto court autour de Panda afin de finir sur son côté gauche",
            "Naruto contourne Panda par la gauche pour arriver sur son profil gauche",
            "Naruto se déplace en courbe autour de Panda pour finir à gauche de lui"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE + CÔTÉ DROIT
    // ==================================================

    {
        id: "DEP_COURSE_007",
        categorie: "deplacement",
        famille: "course_circulaire_cote_droit",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "INTENTION"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda par la droite",
            "Naruto court autour de Panda en passant par la droite",
            "Naruto contourne Panda par la droite en courant",
            "Naruto contourne Panda en passant par la droite",
            "Naruto effectue une course circulaire par la droite autour de Panda",
            "Naruto court en cercle autour de Panda par la droite",
            "Naruto décrit une courbe autour de Panda par la droite",
            "Naruto court en arc autour de Panda en passant par la droite",
            "Naruto court autour de Panda afin d'arriver par la droite",
            "Naruto court autour de Panda pour arriver sur son profil droit",
            "Naruto court en courbe autour de Panda pour finir sur son profil droit",
            "Naruto court autour de Panda afin de finir sur son côté droit",
            "Naruto contourne Panda par la droite pour arriver sur son profil droit",
            "Naruto se déplace en courbe autour de Panda pour finir à droite de lui"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE + DISTANCE + INTENTION
    // ==================================================

    {
        id: "DEP_COURSE_008",
        categorie: "deplacement",
        famille: "course_circulaire_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "COURBE",
            "DISTANCE",
            "INTENTION"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda sur 5m pour arriver sur son profil gauche",
            "Naruto court en courbe autour de Panda sur 5m pour arriver sur son profil droit",
            "Naruto court autour de Panda sur 5m afin d'arriver par la gauche",
            "Naruto court autour de Panda sur 5m afin d'arriver par la droite",
            "Naruto contourne Panda sur 5m en passant par la gauche",
            "Naruto contourne Panda sur 5m en passant par la droite",
            "Naruto décrit une courbe de 5m autour de Panda pour finir sur son côté gauche",
            "Naruto décrit une courbe de 5m autour de Panda pour finir sur son côté droit",
            "Naruto court en arc de 5m autour de Panda pour arriver sur son profil gauche",
            "Naruto court en arc de 5m autour de Panda pour arriver sur son profil droit",
            "Naruto effectue une course circulaire de 5m autour de Panda afin de finir à gauche de lui",
            "Naruto effectue une course circulaire de 5m autour de Panda afin de finir à droite de lui"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE + VITESSE + INTENTION
    // ==================================================

    {
        id: "DEP_COURSE_009",
        categorie: "deplacement",
        famille: "course_circulaire_vitesse_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "COURBE",
            "VITESSE",
            "INTENTION"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda à vmax pour arriver sur son profil gauche",
            "Naruto court en courbe autour de Panda à vmax pour arriver sur son profil droit",
            "Naruto fonce autour de Panda en passant par la gauche à vitesse maximale",
            "Naruto fonce autour de Panda en passant par la droite à vitesse maximale",
            "Naruto court autour de Panda à pleine vitesse afin d'arriver par la gauche",
            "Naruto court autour de Panda à pleine vitesse afin d'arriver par la droite",
            "Naruto contourne Panda à vmax par la gauche pour finir sur son profil gauche",
            "Naruto contourne Panda à vmax par la droite pour finir sur son profil droit"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE COMPLÈTE
    // ==================================================

    {
        id: "DEP_COURSE_010",
        categorie: "deplacement",
        famille: "course_circulaire_complete",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "VITESSE",
            "DISTANCE",
            "INTENTION"
        ],

        exemples: [
            "Naruto court en courbe autour de Panda par la gauche à vmax sur 5m pour arriver sur son profil gauche",
            "Naruto court en courbe autour de Panda par la droite à vmax sur 5m pour arriver sur son profil droit",
            "Naruto court autour de Panda en passant par la gauche à vitesse maximale sur 5m afin d'arriver sur son profil gauche",
            "Naruto court autour de Panda en passant par la droite à vitesse maximale sur 5m afin d'arriver sur son profil droit",
            "Naruto contourne Panda par la gauche à vmax sur 5m pour finir sur son côté gauche",
            "Naruto contourne Panda par la droite à vmax sur 5m pour finir sur son côté droit",
            "Naruto effectue une course circulaire de 5m autour de Panda par la gauche à vmax pour arriver sur son profil gauche",
            "Naruto effectue une course circulaire de 5m autour de Panda par la droite à vmax pour arriver sur son profil droit",
            "Naruto court en arc autour de Panda sur 5m en passant par la gauche pour finir sur son profil gauche",
            "Naruto court en arc autour de Panda sur 5m en passant par la droite pour finir sur son profil droit"
        ]
    },

    // ==================================================
    // COURSE LATÉRALE
    // ==================================================

    {
        id: "DEP_COURSE_006",
        categorie: "deplacement",
        famille: "course_laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto court vers la gauche",
            "Naruto court vers la droite",
            "Naruto sprinte vers la gauche",
            "Naruto sprinte vers la droite",
            "Naruto fonce latéralement vers la gauche",
            "Naruto fonce latéralement vers la droite",
            "Naruto court sur le côté gauche",
            "Naruto court sur le côté droit",
            "Naruto court latéralement vers Panda",
            "Naruto sprinte latéralement vers Panda",
            "Naruto se déplace en courant vers le côté gauche",
            "Naruto se déplace en courant vers le côté droit"
        ]
    },


    // ==================================================
    // COURSE DIAGONALE
    // ==================================================

    {
        id: "DEP_COURSE_007",
        categorie: "deplacement",
        famille: "course_diagonale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto court en diagonale",
            "Naruto court en diagonale vers la gauche",
            "Naruto court en diagonale vers la droite",
            "Naruto fonce en diagonale vers Panda",
            "Naruto sprinte en diagonale vers Panda",
            "Naruto se précipite en diagonale vers Panda",
            "Naruto court diagonalement vers Panda",
            "Naruto avance en courant en diagonale vers Panda"
        ]
    },


    // ==================================================
    // COURSE ARRIÈRE
    // ==================================================

    {
        id: "DEP_COURSE_008",
        categorie: "deplacement",
        famille: "course_arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto court vers l'arrière",
            "Naruto court à reculons",
            "Naruto sprinte à reculons",
            "Naruto recule en courant",
            "Naruto court en arrière",
            "Naruto se déplace en courant vers l'arrière",
            "Naruto fuit en courant vers l'arrière",
            "Naruto court à reculons sur 5m",
            "Naruto recule en courant de 5m"
        ]
    },


    // ==================================================
    // AVANCE
    // ==================================================

    {
        id: "DEP_AV_001",
        categorie: "deplacement",
        famille: "avance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto avance de 8m",
            "Naruto progresse de 8 mètres",
            "Naruto se déplace de 8m",
            "Naruto avance de 5m",
            "Naruto progresse de 10m",
            "Naruto fait quelques pas en avant",
            "Naruto avance progressivement",
            "Naruto s'avance de 5m",
            "Naruto se dirige vers l'avant",
            "Naruto marche vers l'avant",
            "Naruto avance droit devant",
            "Naruto fait un pas en avant",
            "Naruto fait plusieurs pas en avant"
        ]
    },


    // ==================================================
    // AVANCE VERS UNE CIBLE
    // ==================================================

    {
        id: "DEP_AV_002",
        categorie: "deplacement",
        famille: "avance_vers_cible",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto avance vers Panda",
            "Naruto progresse vers Panda",
            "Naruto s'avance vers Panda",
            "Naruto se dirige vers Panda",
            "Naruto marche vers Panda",
            "Naruto avance en direction de Panda",
            "Naruto progresse en direction de Panda",
            "Naruto s'approche de Panda",
            "Naruto marche en direction de Panda"
        ]
    },


    // ==================================================
    // RECUL
    // ==================================================

    {
        id: "DEP_REC_001",
        categorie: "deplacement",
        famille: "recul",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto recule de 5m",
            "Naruto se replie de 5 mètres",
            "Naruto recule de 10m",
            "Naruto fait un pas en arrière",
            "Naruto fait plusieurs pas en arrière",
            "Naruto se retire de 5m",
            "Naruto s'éloigne de 5m",
            "Naruto revient en arrière de 5m",
            "Naruto prend du recul",
            "Naruto fait marche arrière"
        ]
    },


    // ==================================================
    // RECUL PAR RAPPORT À UNE CIBLE
    // ==================================================

    {
        id: "DEP_REC_002",
        categorie: "deplacement",
        famille: "recul_cible",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto recule face à Panda",
            "Naruto se replie face à Panda",
            "Naruto s'éloigne de Panda",
            "Naruto prend ses distances avec Panda",
            "Naruto recule loin de Panda",
            "Naruto se retire devant Panda",
            "Naruto s'éloigne en reculant de Panda"
        ]
    },


    // ==================================================
    // ROTATION
    // ==================================================

    {
        id: "DEP_ROT_001",
        categorie: "deplacement",
        famille: "rotation",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto pivote vers la droite",
            "Naruto tourne à droite",
            "Naruto effectue une rotation vers la droite",
            "Naruto pivote vers la gauche",
            "Naruto tourne à gauche",
            "Naruto effectue une rotation vers la gauche",
            "Naruto pivote sur lui-même",
            "Naruto tourne sur lui-même",
            "Naruto effectue un demi-tour",
            "Naruto fait volte-face",
            "Naruto fait demi-tour",
            "Naruto se retourne"
        ]
    },


    // ==================================================
    // DÉPLACEMENT LATÉRAL
    // ==================================================

    {
        id: "DEP_LAT_001",
        categorie: "deplacement",
        famille: "lateral",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto se déplace latéralement vers la gauche",
            "Naruto se déplace latéralement vers la droite",
            "Naruto avance sur le côté gauche",
            "Naruto avance sur le côté droit",
            "Naruto fait un pas latéral à gauche",
            "Naruto fait un pas latéral à droite",
            "Naruto se décale vers la gauche",
            "Naruto se décale vers la droite",
            "Naruto glisse sur le côté gauche",
            "Naruto glisse sur le côté droit",
            "Naruto se déplace de 2m vers la gauche",
            "Naruto se déplace de 2m vers la droite"
        ]
    },


    // ==================================================
    // DÉPLACEMENT DIAGONAL
    // ==================================================

    {
        id: "DEP_DIAG_001",
        categorie: "deplacement",
        famille: "diagonale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto avance en diagonale",
            "Naruto se déplace en diagonale",
            "Naruto avance en diagonale vers la gauche",
            "Naruto avance en diagonale vers la droite",
            "Naruto se déplace en diagonale vers la gauche",
            "Naruto se déplace en diagonale vers la droite",
            "Naruto fonce en diagonale vers Panda",
            "Naruto court en diagonale vers Panda",
            "Naruto avance en diagonale sur 5m",
            "Naruto se déplace en diagonale sur 3m"
        ]
    },


    // ==================================================
    // DÉPLACEMENT CIRCULAIRE / EN COURBE
    // ==================================================

    {
        id: "DEP_CIRC_001",
        categorie: "deplacement",
        famille: "circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "COURBE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto se déplace en cercle autour de Panda en suivant une courbe",
            "Naruto tourne autour de Panda en courbe",
            "Naruto court autour de Panda en décrivant une courbe",
            "Naruto se déplace circulairement autour de Panda en courbe",
            "Naruto effectue une trajectoire courbe autour de Panda",
            "Naruto décrit un cercle autour de Panda en suivant une courbe",
            "Naruto tourne en courbe vers la gauche autour de Panda",
            "Naruto tourne en courbe vers la droite autour de Panda",
            "Naruto fait une courbe de 2m autour de Panda",
            "Naruto se déplace en arc autour de Panda",
            "Naruto contourne Panda en suivant une courbe",
            "Naruto contourne Panda en arc de cercle"
        ]
    },


    // ==================================================
    // ZIGZAG
    // ==================================================

    {
        id: "DEP_ZIG_001",
        categorie: "deplacement",
        famille: "zigzag",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE"
        ],

        exemples: [
            "Naruto avance en zigzag",
            "Naruto court en zigzag",
            "Naruto fonce en zigzag vers Panda",
            "Naruto se déplace en zigzag vers Panda",
            "Naruto se précipite en zigzag vers Panda",
            "Naruto effectue un déplacement en zigzag",
            "Naruto zigzague vers Panda",
            "Naruto se déplace en zig-zag",
            "Naruto court en zig-zag vers Panda",
            "Naruto avance en zig-zag vers Panda"
        ]
    },


    // ==================================================
    // DÉPLACEMENT ARRIÈRE
    // ==================================================

    {
        id: "DEP_ARR_001",
        categorie: "deplacement",
        famille: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto se déplace vers l'arrière",
            "Naruto marche vers l'arrière",
            "Naruto recule en marchant",
            "Naruto recule en courant",
            "Naruto part vers l'arrière",
            "Naruto avance à reculons",
            "Naruto se déplace à reculons",
            "Naruto court à reculons",
            "Naruto recule de 5m",
            "Naruto marche à reculons",
            "Naruto se déplace en arrière"
        ]
    },


    // ==================================================
    // MARCHE
    // ==================================================

    {
        id: "DEP_MARCHE_001",
        categorie: "deplacement",
        famille: "marche",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto marche",
            "Naruto marche vers Panda",
            "Naruto avance en marchant",
            "Naruto marche en direction de Panda",
            "Naruto se dirige vers Panda en marchant",
            "Naruto progresse à pied vers Panda",
            "Naruto se déplace à pied vers Panda",
            "Naruto marche droit vers Panda",
            "Naruto marche rapidement vers Panda",
            "Naruto marche lentement vers Panda"
        ]
    },


    // ==================================================
    // DÉPLACEMENT AVEC MANIÈRE
    // ==================================================

    {
        id: "DEP_MAN_001",
        categorie: "deplacement",
        famille: "deplacement_manier",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE"
        ],

        exemples: [
            "Naruto se déplace en courant vers Panda",
            "Naruto se déplace en marchant vers Panda",
            "Naruto avance en courant vers Panda",
            "Naruto avance en marchant vers Panda",
            "Naruto fonce en courant vers Panda",
            "Naruto se dirige rapidement vers Panda",
            "Naruto se déplace lentement vers Panda",
            "Naruto progresse rapidement vers Panda",
            "Naruto avance prudemment vers Panda",
            "Naruto se déplace rapidement vers Panda",
            "Naruto se déplace lentement vers Panda"
        ]
    },


    // ==================================================
    // VOL SIMPLE
    // ==================================================

    {
        id: "DEP_VOL_001",
        categorie: "deplacement",
        famille: "vol",

        structure: [
            "SUJET",
            "ACTION"
        ],

        exemples: [
            "Naruto vole",
            "Naruto s'envole",
            "Naruto est en vol",
            "Naruto se maintient dans les airs",
            "Naruto plane dans les airs",
            "Naruto se déplace dans les airs",
            "Naruto évolue dans les airs",
            "Naruto se déplace en volant",
            "Naruto vole dans les airs",
            "Naruto prend son envol"
        ]
    },


    // ==================================================
    // VOL VERS UNE CIBLE
    // ==================================================

    {
        id: "DEP_VOL_002",
        categorie: "deplacement",
        famille: "vol_vers_cible",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto vole vers Panda",
            "Naruto s'envole vers Panda",
            "Naruto plane vers Panda",
            "Naruto se dirige vers Panda dans les airs",
            "Naruto vole en direction de Panda",
            "Naruto se déplace dans les airs vers Panda",
            "Naruto fonce dans les airs vers Panda",
            "Naruto se précipite vers Panda en volant",
            "Naruto prend son envol vers Panda",
            "Naruto se rapproche de Panda en volant"
        ]
    },


    // ==================================================
    // VOL AVEC DISTANCE
    // ==================================================

    {
        id: "DEP_VOL_003",
        categorie: "deplacement",
        famille: "vol_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole sur 10m",
            "Naruto parcourt 10m dans les airs",
            "Naruto se déplace sur 10m en volant",
            "Naruto plane sur 10m",
            "Naruto avance dans les airs sur 10m",
            "Naruto parcourt une distance de 10m dans les airs",
            "Naruto se déplace de 10m dans les airs",
            "Naruto vole sur une distance de 10m"
        ]
    },


    // ==================================================
    // VOL AVEC HAUTEUR
    // ==================================================

    {
        id: "DEP_VOL_004",
        categorie: "deplacement",
        famille: "vol_hauteur",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR"
        ],

        exemples: [
            "Naruto vole à 5m de hauteur",
            "Naruto s'envole à 5m de hauteur",
            "Naruto monte à 5m dans les airs",
            "Naruto vole à 5m au-dessus du sol",
            "Naruto se maintient à 5m de hauteur",
            "Naruto plane à 5m de hauteur",
            "Naruto évolue à 5m dans les airs",
            "Naruto atteint 5m de hauteur en volant"
        ]
    },


    // ==================================================
    // VOL + HAUTEUR + DISTANCE
    // ==================================================

    {
        id: "DEP_VOL_005",
        categorie: "deplacement",
        famille: "vol_hauteur_distance",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole à 5m de hauteur sur 10m",
            "Naruto parcourt 10m à 5m de hauteur",
            "Naruto vole à 5m au-dessus du sol sur 10m",
            "Naruto se déplace dans les airs à 5m de hauteur sur 10m",
            "Naruto plane à 5m de hauteur sur une distance de 10m",
            "Naruto évolue à 5m de hauteur et parcourt 10m"
        ]
    },


    // ==================================================
    // VOL + VITESSE
    // ==================================================

    {
        id: "DEP_VOL_006",
        categorie: "deplacement",
        famille: "vol_vitesse",

        structure: [
            "SUJET",
            "ACTION",
            "VITESSE"
        ],

        exemples: [
            "Naruto vole à vitesse maximale",
            "Naruto s'envole à vitesse maximale",
            "Naruto plane à pleine vitesse",
            "Naruto vole à vmax",
            "Naruto se déplace dans les airs à vmax",
            "Naruto fonce dans les airs à vitesse maximale",
            "Naruto vole à toute vitesse",
            "Naruto accélère dans les airs à pleine vitesse"
        ]
    },


    // ==================================================
    // VOL + CIBLE + VITESSE + DISTANCE
    // ==================================================

    {
        id: "DEP_VOL_007",
        categorie: "deplacement",
        famille: "vol_cible_vitesse_distance",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "VITESSE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole vers Panda vmax sur 10m",
            "Naruto s'envole vers Panda à vitesse maximale sur 10m",
            "Naruto fonce vers Panda dans les airs à vmax sur 10m",
            "Naruto vole en direction de Panda à pleine vitesse sur 10m",
            "Naruto se déplace dans les airs vers Panda à vmax sur 10m",
            "Naruto plane vers Panda à vitesse maximale sur 10m"
        ]
    },


    // ==================================================
    // VOL COMPLET
    // ==================================================

    {
        id: "DEP_VOL_008",
        categorie: "deplacement",
        famille: "vol_complet",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "CIBLE",
            "VITESSE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole à 5m de hauteur vers Panda vmax sur 10m",
            "Naruto s'envole à 5m de hauteur vers Panda à vitesse maximale sur 10m",
            "Naruto fonce dans les airs à 5m de hauteur vers Panda vmax sur 10m",
            "Naruto se déplace dans les airs à 5m de hauteur vers Panda sur 10m",
            "Naruto vole vers Panda à 5m de hauteur à pleine vitesse sur 10m",
            "Naruto plane à 5m de hauteur vers Panda à vmax sur 10m"
        ]
    },


    // ==================================================
    // VOL LATÉRAL
    // ==================================================

    {
        id: "DEP_VOL_009",
        categorie: "deplacement",
        famille: "vol_lateral",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole vers la gauche",
            "Naruto vole vers la droite",
            "Naruto se déplace dans les airs vers la gauche",
            "Naruto se déplace dans les airs vers la droite",
            "Naruto plane latéralement vers la gauche",
            "Naruto plane latéralement vers la droite",
            "Naruto vole de 5m vers la gauche",
            "Naruto vole de 5m vers la droite"
        ]
    },


    // ==================================================
    // VOL DIAGONAL
    // ==================================================

    {
        id: "DEP_VOL_010",
        categorie: "deplacement",
        famille: "vol_diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole en diagonale",
            "Naruto se déplace en diagonale dans les airs",
            "Naruto vole en diagonale vers la gauche",
            "Naruto vole en diagonale vers la droite",
            "Naruto plane en diagonale vers Panda",
            "Naruto fonce en diagonale dans les airs vers Panda",
            "Naruto vole en diagonale sur 10m"
        ]
    },


    // ==================================================
    // VOL CIRCULAIRE / EN COURBE
    // ==================================================

    {
        id: "DEP_VOL_011",
        categorie: "deplacement",
        famille: "vol_circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda",
            "Naruto vole en arc autour de Panda",
            "Naruto décrit une courbe autour de Panda en volant",
            "Naruto décrit un arc de cercle autour de Panda",
            "Naruto effectue une trajectoire courbe autour de Panda",
            "Naruto se déplace en courbe autour de Panda dans les airs",
            "Naruto plane en courbe autour de Panda",
            "Naruto vole en courbe vers la gauche autour de Panda",
            "Naruto vole en courbe vers la droite autour de Panda",
            "Naruto effectue une courbe de 2m autour de Panda",
            "Naruto vole en arc de 2m autour de Panda",
            "Naruto décrit une courbe de 2m autour de Panda",
            "Naruto contourne Panda en suivant une trajectoire courbe",
            "Naruto contourne Panda dans les airs en décrivant une courbe",
            "Naruto vole autour de Panda en suivant une courbe",
            "Naruto se déplace autour de Panda en arc de cercle"
        ]
    },

    // ==================================================
    // VOL CIRCULAIRE + CÔTÉ GAUCHE
    // ==================================================

    {
        id: "DEP_VOL_014",
        categorie: "deplacement",
        famille: "vol_circulaire_cote_gauche",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "INTENTION"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda par la gauche",
            "Naruto vole autour de Panda en passant par la gauche",
            "Naruto contourne Panda par la gauche dans les airs",
            "Naruto vole en cercle autour de Panda par la gauche",
            "Naruto décrit une courbe autour de Panda en passant par la gauche",
            "Naruto vole en arc autour de Panda par la gauche",
            "Naruto vole autour de Panda afin d'arriver par la gauche",
            "Naruto vole autour de Panda pour arriver sur son profil gauche",
            "Naruto vole en courbe autour de Panda pour finir sur son profil gauche",
            "Naruto vole autour de Panda afin de finir sur son côté gauche",
            "Naruto contourne Panda par la gauche pour arriver sur son profil gauche",
            "Naruto se déplace dans les airs autour de Panda pour finir à gauche de lui"
        ]
    },


    // ==================================================
    // VOL CIRCULAIRE + CÔTÉ DROIT
    // ==================================================

    {
        id: "DEP_VOL_015",
        categorie: "deplacement",
        famille: "vol_circulaire_cote_droit",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "INTENTION"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda par la droite",
            "Naruto vole autour de Panda en passant par la droite",
            "Naruto contourne Panda par la droite dans les airs",
            "Naruto vole en cercle autour de Panda par la droite",
            "Naruto décrit une courbe autour de Panda en passant par la droite",
            "Naruto vole en arc autour de Panda par la droite",
            "Naruto vole autour de Panda afin d'arriver par la droite",
            "Naruto vole autour de Panda pour arriver sur son profil droit",
            "Naruto vole en courbe autour de Panda pour finir sur son profil droit",
            "Naruto vole autour de Panda afin de finir sur son côté droit",
            "Naruto contourne Panda par la droite pour arriver sur son profil droit",
            "Naruto se déplace dans les airs autour de Panda pour finir à droite de lui"
        ]
    },


    // ==================================================
    // VOL CIRCULAIRE + DISTANCE + INTENTION
    // ==================================================

    {
        id: "DEP_VOL_016",
        categorie: "deplacement",
        famille: "vol_circulaire_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "COURBE",
            "DISTANCE",
            "INTENTION"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda sur 5m pour arriver sur son profil gauche",
            "Naruto vole en courbe autour de Panda sur 5m pour arriver sur son profil droit",
            "Naruto vole autour de Panda sur 5m afin d'arriver par la gauche",
            "Naruto vole autour de Panda sur 5m afin d'arriver par la droite",
            "Naruto contourne Panda sur 5m en passant par la gauche",
            "Naruto contourne Panda sur 5m en passant par la droite",
            "Naruto décrit une courbe de 5m autour de Panda pour finir sur son côté gauche",
            "Naruto décrit une courbe de 5m autour de Panda pour finir sur son côté droit",
            "Naruto vole en arc de 5m autour de Panda pour arriver sur son profil gauche",
            "Naruto vole en arc de 5m autour de Panda pour arriver sur son profil droit"
        ]
    },


    // ==================================================
    // VOL CIRCULAIRE + VITESSE + INTENTION
    // ==================================================

    {
        id: "DEP_VOL_017",
        categorie: "deplacement",
        famille: "vol_circulaire_vitesse_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "COURBE",
            "VITESSE",
            "INTENTION"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda à vmax pour arriver sur son profil gauche",
            "Naruto vole en courbe autour de Panda à vmax pour arriver sur son profil droit",
            "Naruto fonce autour de Panda dans les airs en passant par la gauche à vitesse maximale",
            "Naruto fonce autour de Panda dans les airs en passant par la droite à vitesse maximale",
            "Naruto vole autour de Panda à pleine vitesse afin d'arriver par la gauche",
            "Naruto vole autour de Panda à pleine vitesse afin d'arriver par la droite",
            "Naruto contourne Panda à vmax par la gauche pour finir sur son profil gauche",
            "Naruto contourne Panda à vmax par la droite pour finir sur son profil droit"
        ]
    },


    // ==================================================
    // VOL CIRCULAIRE COMPLET
    // ==================================================

    {
        id: "DEP_VOL_018",
        categorie: "deplacement",
        famille: "vol_circulaire_complet",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DIRECTION",
            "COURBE",
            "VITESSE",
            "DISTANCE",
            "INTENTION"
        ],

        exemples: [
            "Naruto vole en courbe autour de Panda par la gauche à vmax sur 5m pour arriver sur son profil gauche",
            "Naruto vole en courbe autour de Panda par la droite à vmax sur 5m pour arriver sur son profil droit",
            "Naruto vole autour de Panda en passant par la gauche à vitesse maximale sur 5m afin d'arriver sur son profil gauche",
            "Naruto vole autour de Panda en passant par la droite à vitesse maximale sur 5m afin d'arriver sur son profil droit",
            "Naruto contourne Panda par la gauche à vmax sur 5m pour finir sur son côté gauche",
            "Naruto contourne Panda par la droite à vmax sur 5m pour finir sur son côté droit",
            "Naruto effectue un vol circulaire de 5m autour de Panda par la gauche à vmax pour arriver sur son profil gauche",
            "Naruto effectue un vol circulaire de 5m autour de Panda par la droite à vmax pour arriver sur son profil droit",
            "Naruto vole en arc autour de Panda sur 5m en passant par la gauche pour finir sur son profil gauche",
            "Naruto vole en arc autour de Panda sur 5m en passant par la droite pour finir sur son profil droit"
        ]
    },
    
    // ==================================================
    // VOL ZIGZAG
    // ==================================================

    {
        id: "DEP_VOL_012",
        categorie: "deplacement",
        famille: "vol_zigzag",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE"
        ],

        exemples: [
            "Naruto vole en zigzag",
            "Naruto vole en zigzag vers Panda",
            "Naruto se déplace dans les airs en zigzag",
            "Naruto fonce en zigzag vers Panda dans les airs",
            "Naruto plane en zigzag vers Panda",
            "Naruto effectue un déplacement aérien en zigzag",
            "Naruto se précipite vers Panda en zigzag dans les airs"
        ]
    },


    // ==================================================
    // VOL RAS DU SOL
    // ==================================================

    {
        id: "DEP_VOL_013",
        categorie: "deplacement",
        famille: "vol_ras_du_sol",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto vole ras du sol",
            "Naruto vole à ras du sol",
            "Naruto se déplace à ras du sol en volant",
            "Naruto rase le sol en volant",
            "Naruto plane juste au-dessus du sol",
            "Naruto vole à quelques centimètres du sol",
            "Naruto se déplace dans les airs juste au-dessus du sol",
            "Naruto fonce à ras du sol vers Panda",
            "Naruto vole à ras du sol vers Panda",
            "Naruto se déplace à ras du sol vers Panda",
            "Naruto plane à ras du sol vers Panda",
            "Naruto vole à ras du sol sur 10m",
            "Naruto fonce à ras du sol sur 10m",
            "Naruto se déplace à ras du sol vers Panda sur 10m",
            "Naruto vole à quelques centimètres du sol vers Panda"
        ]
    }, 
                                
    // ==================================================
    // DÉPLACEMENT + INTENTION FINALE
    // ==================================================

    {
        id: "DEP_INTENTION_001",
        categorie: "deplacement",
        famille: "deplacement_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DISTANCE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto court autour de Panda sur 5m pour arriver sur son profil gauche",
            "Naruto court autour de Panda sur 5m pour arriver sur son profil droit",
            "Naruto court autour de Panda sur 5m afin d'arriver sur son profil gauche",
            "Naruto court autour de Panda sur 5m afin d'arriver sur son profil droit",
            "Naruto court autour de Panda sur 5m pour finir sur son profil gauche",
            "Naruto court autour de Panda sur 5m pour finir sur son profil droit",
            "Naruto court autour de Panda sur 5m afin de finir sur son côté gauche",
            "Naruto court autour de Panda sur 5m afin de finir sur son côté droit",
            "Naruto vole autour de Panda sur 5m pour arriver sur son profil gauche",
            "Naruto vole autour de Panda sur 5m pour arriver sur son profil droit",
            "Naruto vole autour de Panda sur 5m afin d'arriver sur son profil gauche",
            "Naruto vole autour de Panda sur 5m afin d'arriver sur son profil droit",
            "Naruto vole autour de Panda sur 5m pour atterrir sur son côté gauche",
            "Naruto vole autour de Panda sur 5m pour atterrir sur son côté droit",
            "Naruto vole autour de Panda sur 5m pour finir sur son profil gauche",
            "Naruto vole autour de Panda sur 5m pour finir sur son profil droit"
        ]
    }, 
        // ==================================================
    // ACROBATIE — SIMPLE
    // ==================================================

    {
        id: "DEP_ACRO_001",
        categorie: "deplacement",
        famille: "acrobatie",

        structure: [
            "SUJET",
            "ACTION"
        ],

        exemples: [
            "Naruto fait un salto",
            "Naruto effectue un salto",
            "Naruto réalise un salto",
            "Naruto fait une pirouette",
            "Naruto effectue une pirouette",
            "Naruto réalise une pirouette",
            "Naruto fait une vrille",
            "Naruto effectue une vrille",
            "Naruto réalise une vrille",
            "Naruto fait un backflip",
            "Naruto effectue un backflip",
            "Naruto réalise un backflip",
            "Naruto fait un flip",
            "Naruto effectue un flip",
            "Naruto fait une roulade",
            "Naruto effectue une roulade",
            "Naruto fait une rotation aérienne",
            "Naruto effectue une rotation aérienne"
        ]
    },


    // ==================================================
    // SALTO AVANT
    // ==================================================

    {
        id: "DEP_ACRO_002",
        categorie: "deplacement",
        famille: "salto_avant",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto fait un salto avant",
            "Naruto effectue un salto avant",
            "Naruto réalise un salto avant",
            "Naruto fait une rotation vers l'avant",
            "Naruto effectue une rotation avant",
            "Naruto fait un flip avant",
            "Naruto effectue un flip avant",
            "Naruto réalise un flip avant",
            "Naruto fait une roulade avant dans les airs",
            "Naruto effectue une rotation aérienne vers l'avant"
        ]
    },


    // ==================================================
    // SALTO ARRIÈRE / BACKFLIP
    // ==================================================

    {
        id: "DEP_ACRO_003",
        categorie: "deplacement",
        famille: "salto_arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto fait un salto arrière",
            "Naruto effectue un salto arrière",
            "Naruto réalise un salto arrière",
            "Naruto fait un backflip",
            "Naruto effectue un backflip",
            "Naruto réalise un backflip",
            "Naruto fait un flip arrière",
            "Naruto effectue un flip arrière",
            "Naruto réalise un flip arrière",
            "Naruto fait une rotation vers l'arrière",
            "Naruto effectue une rotation aérienne vers l'arrière",
            "Naruto fait une roulade arrière dans les airs"
        ]
    },


    // ==================================================
    // SALTO LATÉRAL
    // ==================================================

    {
        id: "DEP_ACRO_004",
        categorie: "deplacement",
        famille: "salto_lateral",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto fait un salto latéral gauche",
            "Naruto fait un salto latéral droit",
            "Naruto effectue un salto latéral vers la gauche",
            "Naruto effectue un salto latéral vers la droite",
            "Naruto réalise un flip latéral gauche",
            "Naruto réalise un flip latéral droit",
            "Naruto fait une rotation latérale vers la gauche",
            "Naruto fait une rotation latérale vers la droite",
            "Naruto effectue une acrobatie latérale vers la gauche",
            "Naruto effectue une acrobatie latérale vers la droite"
        ]
    },


    // ==================================================
    // PIROUETTE
    // ==================================================

    {
        id: "DEP_ACRO_005",
        categorie: "deplacement",
        famille: "pirouette",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto fait une pirouette",
            "Naruto effectue une pirouette",
            "Naruto réalise une pirouette",
            "Naruto fait une pirouette vers la gauche",
            "Naruto fait une pirouette vers la droite",
            "Naruto effectue une pirouette vers la gauche",
            "Naruto effectue une pirouette vers la droite",
            "Naruto tourne sur lui-même",
            "Naruto effectue une rotation sur lui-même",
            "Naruto fait une rotation complète",
            "Naruto effectue une rotation complète"
        ]
    },


    // ==================================================
    // VRILLE
    // ==================================================

    {
        id: "DEP_ACRO_006",
        categorie: "deplacement",
        famille: "vrille",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION"
        ],

        exemples: [
            "Naruto fait une vrille",
            "Naruto effectue une vrille",
            "Naruto réalise une vrille",
            "Naruto part en vrille",
            "Naruto effectue une vrille vers la gauche",
            "Naruto effectue une vrille vers la droite",
            "Naruto fait une vrille latérale",
            "Naruto effectue une vrille aérienne",
            "Naruto tourne en vrille dans les airs",
            "Naruto se vrille dans les airs"
        ]
    },


    // ==================================================
    // ACROBATIE + HAUTEUR
    // ==================================================

    {
        id: "DEP_ACRO_007",
        categorie: "deplacement",
        famille: "acrobatie_hauteur",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR"
        ],

        exemples: [
            "Naruto fait un salto à 5m de hauteur",
            "Naruto effectue un salto à 5m de hauteur",
            "Naruto fait un backflip à 5m de hauteur",
            "Naruto effectue un backflip à 5m de hauteur",
            "Naruto fait une pirouette à 5m de hauteur",
            "Naruto effectue une pirouette à 5m de hauteur",
            "Naruto fait une vrille à 5m de hauteur",
            "Naruto effectue une vrille à 5m de hauteur",
            "Naruto effectue un flip à 5m dans les airs",
            "Naruto réalise une rotation aérienne à 5m"
        ]
    },


    // ==================================================
    // ACROBATIE + DISTANCE
    // ==================================================

    {
        id: "DEP_ACRO_008",
        categorie: "deplacement",
        famille: "acrobatie_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto fait un salto sur 5m",
            "Naruto effectue un salto sur 5m",
            "Naruto fait un backflip sur 5m",
            "Naruto effectue un backflip sur 5m",
            "Naruto fait une pirouette sur 5m",
            "Naruto effectue une pirouette sur 5m",
            "Naruto fait une vrille sur 5m",
            "Naruto effectue une vrille sur 5m",
            "Naruto réalise un flip sur 5m",
            "Naruto effectue une rotation aérienne sur 5m"
        ]
    },


    // ==================================================
    // ACROBATIE + HAUTEUR + DISTANCE
    // ==================================================

    {
        id: "DEP_ACRO_009",
        categorie: "deplacement",
        famille: "acrobatie_hauteur_distance",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "DISTANCE"
        ],

        exemples: [
            "Naruto fait un salto à 5m de hauteur sur 10m",
            "Naruto effectue un salto à 5m de hauteur sur 10m",
            "Naruto fait un backflip à 5m de hauteur sur 10m",
            "Naruto effectue un backflip à 5m de hauteur sur 10m",
            "Naruto fait une pirouette à 5m de hauteur sur 10m",
            "Naruto effectue une pirouette à 5m de hauteur sur 10m",
            "Naruto fait une vrille à 5m de hauteur sur 10m",
            "Naruto effectue une vrille à 5m de hauteur sur 10m",
            "Naruto réalise un flip à 5m de hauteur sur 10m",
            "Naruto effectue une rotation aérienne à 5m sur 10m"
        ]
    },


    // ==================================================
    // ACROBATIE + CÔTÉ GAUCHE
    // ==================================================

    {
        id: "DEP_ACRO_010",
        categorie: "deplacement",
        famille: "acrobatie_cote_gauche",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto fait un salto vers la gauche autour de Panda",
            "Naruto effectue un salto vers la gauche autour de Panda",
            "Naruto fait un backflip vers la gauche autour de Panda",
            "Naruto effectue un backflip vers la gauche autour de Panda",
            "Naruto fait une pirouette vers la gauche autour de Panda",
            "Naruto effectue une pirouette vers la gauche autour de Panda",
            "Naruto fait une vrille vers la gauche autour de Panda",
            "Naruto effectue une vrille vers la gauche autour de Panda",
            "Naruto passe par la gauche de Panda en faisant un salto",
            "Naruto passe par la gauche de Panda en faisant une pirouette",
            "Naruto contourne Panda par la gauche en faisant une vrille"
        ]
    },


    // ==================================================
    // ACROBATIE + CÔTÉ DROIT
    // ==================================================

    {
        id: "DEP_ACRO_011",
        categorie: "deplacement",
        famille: "acrobatie_cote_droit",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto fait un salto vers la droite autour de Panda",
            "Naruto effectue un salto vers la droite autour de Panda",
            "Naruto fait un backflip vers la droite autour de Panda",
            "Naruto effectue un backflip vers la droite autour de Panda",
            "Naruto fait une pirouette vers la droite autour de Panda",
            "Naruto effectue une pirouette vers la droite autour de Panda",
            "Naruto fait une vrille vers la droite autour de Panda",
            "Naruto effectue une vrille vers la droite autour de Panda",
            "Naruto passe par la droite de Panda en faisant un salto",
            "Naruto passe par la droite de Panda en faisant une pirouette",
            "Naruto contourne Panda par la droite en faisant une vrille"
        ]
    },


    // ==================================================
    // ACROBATIE + DISTANCE + DIRECTION
    // ==================================================

    {
        id: "DEP_ACRO_012",
        categorie: "deplacement",
        famille: "acrobatie_direction_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "DISTANCE"
        ],

        exemples: [
            "Naruto fait un salto vers la gauche sur 5m",
            "Naruto fait un salto vers la droite sur 5m",
            "Naruto effectue un backflip vers la gauche sur 5m",
            "Naruto effectue un backflip vers la droite sur 5m",
            "Naruto fait une pirouette vers la gauche sur 5m",
            "Naruto fait une pirouette vers la droite sur 5m",
            "Naruto effectue une vrille vers la gauche sur 5m",
            "Naruto effectue une vrille vers la droite sur 5m",
            "Naruto fait un flip en diagonale vers la gauche sur 5m",
            "Naruto fait un flip en diagonale vers la droite sur 5m"
        ]
    },


    // ==================================================
    // ACROBATIE + CIBLE
    // ==================================================

    {
        id: "DEP_ACRO_013",
        categorie: "deplacement",
        famille: "acrobatie_cible",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto fait un salto vers Panda",
            "Naruto effectue un salto vers Panda",
            "Naruto fait un backflip vers Panda",
            "Naruto effectue un backflip vers Panda",
            "Naruto fait une pirouette vers Panda",
            "Naruto effectue une pirouette vers Panda",
            "Naruto fait une vrille vers Panda",
            "Naruto effectue une vrille vers Panda",
            "Naruto fait un flip vers Panda",
            "Naruto effectue une rotation aérienne vers Panda"
        ]
    },


    // ==================================================
    // ACROBATIE + INTENTION
    // ==================================================

    {
        id: "DEP_ACRO_014",
        categorie: "deplacement",
        famille: "acrobatie_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto fait un salto vers Panda pour arriver sur son profil gauche",
            "Naruto fait un salto vers Panda pour arriver sur son profil droit",
            "Naruto effectue un salto vers Panda afin d'arriver sur son profil gauche",
            "Naruto effectue un salto vers Panda afin d'arriver sur son profil droit",
            "Naruto fait un backflip vers Panda pour finir sur son profil gauche",
            "Naruto fait un backflip vers Panda pour finir sur son profil droit",
            "Naruto effectue une pirouette vers Panda pour arriver sur son côté gauche",
            "Naruto effectue une pirouette vers Panda pour arriver sur son côté droit",
            "Naruto fait une vrille vers Panda afin de finir à gauche de lui",
            "Naruto fait une vrille vers Panda afin de finir à droite de lui",
            "Naruto effectue un flip vers Panda pour se retrouver sur son profil gauche",
            "Naruto effectue un flip vers Panda pour se retrouver sur son profil droit"
        ]
    },


    // ==================================================
    // ACROBATIE + HAUTEUR + INTENTION
    // ==================================================

    {
        id: "DEP_ACRO_015",
        categorie: "deplacement",
        famille: "acrobatie_hauteur_intention",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "CIBLE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto fait un salto à 5m de hauteur vers Panda pour arriver sur son profil gauche",
            "Naruto fait un salto à 5m de hauteur vers Panda pour arriver sur son profil droit",
            "Naruto effectue un backflip à 5m de hauteur vers Panda afin d'arriver sur son profil gauche",
            "Naruto effectue un backflip à 5m de hauteur vers Panda afin d'arriver sur son profil droit",
            "Naruto fait une pirouette à 5m de hauteur vers Panda pour finir sur son côté gauche",
            "Naruto fait une pirouette à 5m de hauteur vers Panda pour finir sur son côté droit",
            "Naruto effectue une vrille à 5m de hauteur vers Panda pour atterrir à gauche de lui",
            "Naruto effectue une vrille à 5m de hauteur vers Panda pour atterrir à droite de lui",
            "Naruto fait un flip à 5m vers Panda afin de se retrouver sur son profil gauche",
            "Naruto fait un flip à 5m vers Panda afin de se retrouver sur son profil droit"
        ]
    },


    // ==================================================
    // ACROBATIE + DISTANCE + INTENTION
    // ==================================================

    {
        id: "DEP_ACRO_016",
        categorie: "deplacement",
        famille: "acrobatie_distance_intention",

        structure: [
            "SUJET",
            "ACTION",
            "CIBLE",
            "DISTANCE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto fait un salto vers Panda sur 5m pour arriver sur son profil gauche",
            "Naruto fait un salto vers Panda sur 5m pour arriver sur son profil droit",
            "Naruto effectue un backflip vers Panda sur 5m afin d'arriver sur son profil gauche",
            "Naruto effectue un backflip vers Panda sur 5m afin d'arriver sur son profil droit",
            "Naruto fait une pirouette vers Panda sur 5m pour finir sur son côté gauche",
            "Naruto fait une pirouette vers Panda sur 5m pour finir sur son côté droit",
            "Naruto effectue une vrille vers Panda sur 5m pour atterrir à gauche de lui",
            "Naruto effectue une vrille vers Panda sur 5m pour atterrir à droite de lui"
        ]
    },


    // ==================================================
    // ACROBATIE + HAUTEUR + DISTANCE + INTENTION
    // ==================================================

    {
        id: "DEP_ACRO_017",
        categorie: "deplacement",
        famille: "acrobatie_hauteur_distance_intention",

        structure: [
            "SUJET",
            "ACTION",
            "HAUTEUR",
            "CIBLE",
            "DISTANCE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto fait un salto à 5m de hauteur vers Panda sur 10m pour arriver sur son profil gauche",
            "Naruto fait un salto à 5m de hauteur vers Panda sur 10m pour arriver sur son profil droit",
            "Naruto effectue un backflip à 5m de hauteur vers Panda sur 10m afin d'arriver sur son profil gauche",
            "Naruto effectue un backflip à 5m de hauteur vers Panda sur 10m afin d'arriver sur son profil droit",
            "Naruto fait une pirouette à 5m de hauteur vers Panda sur 10m pour finir sur son côté gauche",
            "Naruto fait une pirouette à 5m de hauteur vers Panda sur 10m pour finir sur son côté droit",
            "Naruto effectue une vrille à 5m de hauteur vers Panda sur 10m pour atterrir à gauche de lui",
            "Naruto effectue une vrille à 5m de hauteur vers Panda sur 10m pour atterrir à droite de lui",
            "Naruto fait un flip à 5m vers Panda sur 10m afin de se retrouver sur son profil gauche",
            "Naruto fait un flip à 5m vers Panda sur 10m afin de se retrouver sur son profil droit"
        ]
    },


    // ==================================================
    // ACROBATIE COMPLÈTE
    // ==================================================

    {
        id: "DEP_ACRO_018",
        categorie: "deplacement",
        famille: "acrobatie_complete",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "HAUTEUR",
            "CIBLE",
            "DISTANCE",
            "VITESSE",
            "INTENTION",
            "POSITION_FINALE"
        ],

        exemples: [
            "Naruto effectue un salto avant à 5m de hauteur vers Panda sur 10m à vmax pour arriver sur son profil gauche",
            "Naruto effectue un salto avant à 5m de hauteur vers Panda sur 10m à vmax pour arriver sur son profil droit",
            "Naruto fait un backflip à 5m de hauteur vers Panda sur 10m à vmax afin d'arriver sur son profil gauche",
            "Naruto fait un backflip à 5m de hauteur vers Panda sur 10m à vmax afin d'arriver sur son profil droit",
            "Naruto effectue une pirouette vers la gauche à 5m de hauteur vers Panda sur 10m pour finir sur son côté gauche",
            "Naruto effectue une pirouette vers la droite à 5m de hauteur vers Panda sur 10m pour finir sur son côté droit",
            "Naruto fait une vrille vers la gauche à 5m de hauteur vers Panda sur 10m à vmax pour atterrir sur son profil gauche",
            "Naruto fait une vrille vers la droite à 5m de hauteur vers Panda sur 10m à vmax pour atterrir sur son profil droit",
            "Naruto effectue un flip latéral gauche à 5m vers Panda sur 10m pour arriver sur son côté gauche",
            "Naruto effectue un flip latéral droit à 5m vers Panda sur 10m pour arriver sur son côté droit"
        ]
    }
    
   ], 

 // ==================================================
// ATTAQUES
// ==================================================

attaque: [

    // ==================================================
    // 👊 COUPS DE POING
    // ==================================================

    {
        id: "ATK_POING_DIRECT_001",
        categorie: "attaque",
        famille: "coup_de_poing_direct",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe un coup de poing direct du droit dans le visage de Panda",
            "Naruto frappe un coup de poing direct du gauche vers le torse de Panda",
            "Naruto porte un direct du poing droit au visage de Panda",
            "Naruto porte un direct du gauche dans l'abdomen de Panda",
            "Naruto donne un coup de poing direct avec sa main droite vers la mâchoire de Panda",
            "Naruto donne un direct de la main gauche visant le ventre de Panda",
            "Naruto attaque Panda avec un coup de poing direct du droit au niveau du torse",
            "Naruto projette son poing gauche en ligne droite vers le visage de Panda",
            "Naruto lance un direct du poing droit visant le menton de Panda",
            "Naruto frappe Panda d'un coup de poing direct de la main gauche dans le ventre"
        ]
    },

    {
        id: "ATK_POING_CROCHET_GAUCHE_001",
        categorie: "attaque",
        famille: "crochet_gauche",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un crochet gauche au visage",
            "Naruto porte un crochet du poing gauche vers la mâchoire de Panda",
            "Naruto donne un crochet gauche en arc horizontal dans le visage de Panda",
            "Naruto lance son poing gauche en crochet vers le flanc droit de Panda",
            "Naruto attaque Panda avec un crochet gauche visant sa tête",
            "Naruto frappe de la main gauche en décrivant un arc vers le visage de Panda",
            "Naruto porte un crochet gauche au niveau des côtes de Panda",
            "Naruto balance un crochet du gauche contre le flanc droit de Panda",
            "Naruto assène un crochet gauche à la mâchoire de Panda",
            "Naruto frappe Panda avec son poing gauche en trajectoire circulaire vers le visage"
        ]
    },

    {
        id: "ATK_POING_CROCHET_DROIT_001",
        categorie: "attaque",
        famille: "crochet_droit",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un crochet droit au visage",
            "Naruto porte un crochet du poing droit vers la mâchoire de Panda",
            "Naruto donne un crochet droit en arc horizontal dans le visage de Panda",
            "Naruto lance son poing droit en crochet vers le flanc gauche de Panda",
            "Naruto attaque Panda avec un crochet droit visant sa tête",
            "Naruto frappe de la main droite en décrivant un arc vers le visage de Panda",
            "Naruto porte un crochet droit au niveau des côtes de Panda",
            "Naruto balance un crochet du droit contre le flanc gauche de Panda",
            "Naruto assène un crochet droit à la mâchoire de Panda",
            "Naruto frappe Panda avec son poing droit en trajectoire circulaire vers le visage"
        ]
    },

    {
        id: "ATK_POING_UPPERCUT_001",
        categorie: "attaque",
        famille: "uppercut",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un uppercut du droit sous le menton",
            "Naruto porte un uppercut du gauche vers le menton de Panda",
            "Naruto donne un coup de poing remontant sous la mâchoire de Panda",
            "Naruto lance un uppercut du poing droit vers le visage de Panda",
            "Naruto frappe de bas en haut sous le menton de Panda",
            "Naruto attaque Panda avec un uppercut de la main gauche",
            "Naruto porte un coup de poing ascendant vers le menton de Panda",
            "Naruto assène un uppercut droit sous la mâchoire de Panda",
            "Naruto remonte son poing gauche sous le menton de Panda",
            "Naruto frappe Panda avec un uppercut visant sa mâchoire"
        ]
    },

    {
        id: "ATK_POING_UPPERCUT_SAUTE_001",
        categorie: "attaque",
        famille: "uppercut_saute",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saute et frappe Panda d'un uppercut du droit sous le menton",
            "Naruto bondit vers Panda en lançant un uppercut gauche vers sa mâchoire",
            "Naruto effectue un uppercut sauté du poing droit sous le menton de Panda",
            "Naruto s'élève dans les airs et frappe Panda d'un uppercut gauche",
            "Naruto saute vers Panda en projetant son poing droit vers le menton",
            "Naruto porte un uppercut ascendant en sautant vers le visage de Panda",
            "Naruto bondit et donne un coup de poing remontant sous la mâchoire de Panda",
            "Naruto attaque Panda en plein saut avec un uppercut du gauche",
            "Naruto prend appui puis saute en lançant un uppercut droit vers le menton de Panda",
            "Naruto frappe Panda avec un uppercut sauté visant sa mâchoire"
        ]
    },

    {
        id: "ATK_POING_REVERS_001",
        categorie: "attaque",
        famille: "coup_en_revers",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup en revers du droit au visage",
            "Naruto porte un revers du poing gauche vers la tempe de Panda",
            "Naruto donne un backfist droit contre le visage de Panda",
            "Naruto lance le dos de son poing gauche vers la mâchoire de Panda",
            "Naruto attaque Panda avec un coup de poing en revers du droit",
            "Naruto frappe Panda avec le dos de son poing gauche vers la tête",
            "Naruto porte un revers horizontal du poing droit au visage de Panda",
            "Naruto assène un backfist gauche à la tempe de Panda",
            "Naruto frappe en revers avec sa main droite vers le menton de Panda",
            "Naruto balance le dos de son poing gauche contre le visage de Panda"
        ]
    },

    {
        id: "ATK_POING_SPINNING_BACKFIST_001",
        categorie: "attaque",
        famille: "revers_circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto pivote sur lui-même et frappe Panda d'un revers circulaire",
            "Naruto tourne à 180 degrés avant de lancer un spinning backfist vers le visage de Panda",
            "Naruto effectue une rotation complète et frappe Panda avec le dos du poing",
            "Naruto tourne sur lui-même puis porte un revers circulaire du droit vers la tête de Panda",
            "Naruto attaque Panda avec un spinning backfist visant le visage",
            "Naruto pivote et projette le dos de son poing gauche vers la mâchoire de Panda",
            "Naruto effectue un tour complet avant de frapper Panda en revers circulaire",
            "Naruto tourne son corps et lance un coup de poing circulaire avec le dos du poing vers Panda",
            "Naruto frappe Panda après une rotation de 180 degrés avec un revers du poing",
            "Naruto réalise un spinning backfist droit visant le torse de Panda"
        ]
    },

    {
        id: "ATK_POING_MARTEAU_DESCENDANT_001",
        categorie: "attaque",
        famille: "coup_marteau_descendant",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de poing marteau descendant sur le crâne",
            "Naruto abat son poing droit verticalement sur la tête de Panda",
            "Naruto porte un hammer fist descendant du gauche sur l'épaule de Panda",
            "Naruto frappe de haut en bas avec le poing droit sur le bras de Panda",
            "Naruto donne un coup marteau descendant sur la tête de Panda",
            "Naruto lève son poing gauche puis l'abat sur le crâne de Panda",
            "Naruto attaque Panda avec un hammer fist vertical visant son épaule",
            "Naruto fait tomber son poing droit de haut en bas sur la tête de Panda",
            "Naruto assène un coup marteau du gauche sur le bras de Panda",
            "Naruto frappe Panda verticalement avec le côté de son poing vers le crâne"
        ]
    },

    {
        id: "ATK_POING_MARTEAU_LATERAL_001",
        categorie: "attaque",
        famille: "coup_marteau_lateral",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup marteau latéral du droit vers la tête",
            "Naruto porte un hammer fist latéral du gauche contre le torse de Panda",
            "Naruto lance son poing droit horizontalement de côté vers le visage de Panda",
            "Naruto donne un coup marteau latéral du gauche au niveau des côtes de Panda",
            "Naruto frappe Panda avec un marteau latéral visant son flanc",
            "Naruto attaque Panda avec son poing droit lancé horizontalement vers la tête",
            "Naruto porte un hammer fist side du gauche contre le torse de Panda",
            "Naruto balance son poing droit de côté vers la mâchoire de Panda",
            "Naruto assène un coup marteau latéral au flanc de Panda",
            "Naruto frappe Panda avec un coup marteau horizontal visant ses côtes"
        ]
    },

    {
        id: "ATK_POING_MARTEAU_REVERS_001",
        categorie: "attaque",
        famille: "coup_marteau_revers",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup marteau en revers du droit",
            "Naruto porte un reverse hammer du gauche vers le visage de Panda",
            "Naruto lance son poing droit en revers horizontal vers la tête de Panda",
            "Naruto donne un coup marteau en revers diagonal avec la main gauche",
            "Naruto attaque Panda avec un reverse hammer visant sa tempe",
            "Naruto frappe Panda avec le dos de son poing droit en trajectoire diagonale",
            "Naruto porte un marteau en revers du gauche vers la mâchoire de Panda",
            "Naruto balance son poing droit en revers vers le visage de Panda",
            "Naruto assène un coup marteau inversé avec la main gauche au niveau de la tête",
            "Naruto frappe Panda avec un reverse hammer horizontal porté du droit"
        ]
    },


    // ==================================================
    // 🦵 COUPS DE PIED
    // ==================================================

    {
        id: "ATK_PIED_FRONT_001",
        categorie: "attaque",
        famille: "coup_de_pied_frontal",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de pied frontal du droit au torse",
            "Naruto porte un front kick de la jambe gauche vers le ventre de Panda",
            "Naruto donne un coup de pied frontal droit dans le torse de Panda",
            "Naruto projette son pied droit en ligne droite vers le menton de Panda",
            "Naruto frappe Panda avec un front kick de la jambe gauche visant l'abdomen",
            "Naruto lance son pied avant vers le visage de Panda avec un coup frontal",
            "Naruto attaque Panda d'un coup de pied frontal du gauche au ventre",
            "Naruto pousse son pied droit directement vers le torse de Panda",
            "Naruto porte un coup de pied direct avec sa jambe droite vers le menton de Panda",
            "Naruto frappe Panda avec son pied gauche propulsé droit vers le ventre"
        ]
    },

    {
        id: "ATK_PIED_ROUNDHOUSE_001",
        categorie: "attaque",
        famille: "coup_de_pied_circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de pied circulaire droit vers la tête",
            "Naruto porte un roundhouse kick de la jambe gauche au torse de Panda",
            "Naruto donne un coup de pied circulaire avec sa jambe droite vers les côtes de Panda",
            "Naruto lance sa jambe gauche en arc horizontal vers la tête de Panda",
            "Naruto frappe Panda avec un roundhouse kick du droit au flanc",
            "Naruto attaque Panda d'un coup de pied circulaire visant son visage",
            "Naruto balance sa jambe droite en trajectoire circulaire vers le torse de Panda",
            "Naruto porte un coup circulaire de la jambe gauche contre les côtes de Panda",
            "Naruto frappe Panda latéralement avec son pied droit vers la tête",
            "Naruto assène un roundhouse kick gauche au niveau du flanc de Panda"
        ]
    },

    {
        id: "ATK_PIED_SIDE_001",
        categorie: "attaque",
        famille: "coup_de_pied_lateral",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de pied latéral droit dans le flanc",
            "Naruto porte un side kick de la jambe gauche vers les côtes de Panda",
            "Naruto donne un coup de pied latéral avec sa jambe droite au torse de Panda",
            "Naruto propulse son pied gauche sur le côté vers le ventre de Panda",
            "Naruto frappe Panda avec un side kick droit visant son abdomen",
            "Naruto attaque Panda d'un coup de pied latéral gauche vers le torse",
            "Naruto tend sa jambe droite sur le côté et frappe le flanc de Panda",
            "Naruto projette son talon gauche latéralement vers le ventre de Panda",
            "Naruto porte un coup de pied de côté du droit vers les côtes de Panda",
            "Naruto frappe Panda avec sa jambe gauche tendue latéralement vers le torse"
        ]
    },

    {
        id: "ATK_PIED_BACK_001",
        categorie: "attaque",
        famille: "coup_de_pied_arriere",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de pied arrière du droit au torse",
            "Naruto porte un back kick de la jambe gauche vers l'abdomen de Panda",
            "Naruto donne un coup de pied arrière avec son talon droit dans le ventre de Panda",
            "Naruto tourne son corps et frappe Panda avec un back kick gauche",
            "Naruto projette son talon droit derrière lui vers le torse de Panda",
            "Naruto attaque Panda d'un coup de pied arrière visant son abdomen",
            "Naruto frappe Panda derrière lui avec sa jambe gauche tendue",
            "Naruto porte un back kick droit au niveau du ventre de Panda",
            "Naruto pivote et envoie son talon gauche vers le torse de Panda",
            "Naruto frappe Panda avec un coup de pied arrière puissant de la jambe droite"
        ]
    },

    {
        id: "ATK_PIED_HOOK_001",
        categorie: "attaque",
        famille: "coup_de_pied_en_crochet",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un hook kick droit vers la tête",
            "Naruto porte un coup de pied en crochet de la jambe gauche vers le visage de Panda",
            "Naruto donne un hook kick du droit visant la mâchoire de Panda",
            "Naruto lance sa jambe gauche en crochet vers le flanc de Panda",
            "Naruto frappe Panda avec un coup de pied en crochet du droit au visage",
            "Naruto attaque Panda avec sa jambe gauche en décrivant un crochet vers la tête",
            "Naruto porte un hook kick droit contre la tempe de Panda",
            "Naruto fait passer sa jambe gauche en crochet vers la tête de Panda",
            "Naruto frappe Panda de côté avec un coup de pied en crochet du gauche",
            "Naruto assène un hook kick droit au niveau du flanc de Panda"
        ]
    },

    {
        id: "ATK_PIED_AXE_001",
        categorie: "attaque",
        famille: "coup_de_pied_descendant",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de pied descendant du droit sur le crâne",
            "Naruto porte un axe kick de la jambe gauche sur l'épaule de Panda",
            "Naruto lève sa jambe droite verticalement puis l'abat sur la tête de Panda",
            "Naruto donne un coup de pied descendant gauche vers le sommet du crâne de Panda",
            "Naruto attaque Panda avec un axe kick droit visant son épaule",
            "Naruto monte son pied gauche au-dessus de la tête de Panda puis le rabat vers lui",
            "Naruto frappe Panda de haut en bas avec sa jambe droite",
            "Naruto porte un coup de pied en hache du gauche sur le crâne de Panda",
            "Naruto lève sa jambe droite puis la fait retomber sur l'épaule de Panda",
            "Naruto assène un axe kick gauche descendant vers la tête de Panda"
        ]
    },

    {
        id: "ATK_PIED_SPINNING_BACK_001",
        categorie: "attaque",
        famille: "coup_de_pied_arriere_circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto pivote sur lui-même et frappe Panda d'un spinning back kick",
            "Naruto tourne à 360 degrés avant de lancer un coup de pied arrière vers le torse de Panda",
            "Naruto effectue une rotation complète puis projette son talon droit dans l'abdomen de Panda",
            "Naruto tourne sur lui-même et frappe Panda avec un spinning back kick gauche",
            "Naruto réalise un tour complet avant de frapper le torse de Panda avec son talon",
            "Naruto attaque Panda après une rotation de 360 degrés avec un coup de pied arrière",
            "Naruto pivote complètement puis envoie sa jambe droite vers le ventre de Panda",
            "Naruto effectue un spinning back kick du gauche visant l'abdomen de Panda",
            "Naruto tourne son corps et propulse son talon vers le torse de Panda",
            "Naruto frappe Panda avec un coup de pied arrière circulaire après une rotation complète"
        ]
    },

    {
        id: "ATK_PIED_LOW_001",
        categorie: "attaque",
        famille: "coup_bas",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un low kick droit dans la cuisse",
            "Naruto porte un coup bas de la jambe gauche sur le mollet de Panda",
            "Naruto donne un low kick avec sa jambe droite contre la cuisse de Panda",
            "Naruto frappe la jambe gauche de Panda avec son pied droit",
            "Naruto attaque Panda d'un coup bas visant sa cuisse",
            "Naruto lance sa jambe arrière gauche contre le mollet de Panda",
            "Naruto porte un low kick droit au niveau de la cuisse de Panda",
            "Naruto frappe la jambe de Panda avec un coup de pied bas du gauche",
            "Naruto balance sa jambe droite vers le mollet de Panda",
            "Naruto assène un coup bas de la jambe gauche contre la cuisse de Panda"
        ]
    },

    {
        id: "ATK_GENOU_001",
        categorie: "attaque",
        famille: "coup_de_genou",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto frappe Panda d'un coup de genou droit dans le ventre",
            "Naruto porte un knee strike de la jambe gauche vers l'abdomen de Panda",
            "Naruto donne un coup de genou droit au torse de Panda",
            "Naruto lève son genou gauche et le projette vers le ventre de Panda",
            "Naruto attaque Panda avec un knee strike visant son abdomen",
            "Naruto frappe Panda à courte distance avec son genou droit",
            "Naruto porte un coup de genou gauche vers le torse de Panda",
            "Naruto propulse son genou droit contre le ventre de Panda",
            "Naruto assène un knee strike gauche au niveau des côtes de Panda",
            "Naruto frappe Panda avec son genou droit vers le corps"
        ]
    },

    {
        id: "ATK_PIED_FLYING_001",
        categorie: "attaque",
        famille: "coup_de_pied_saute",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saute vers Panda et le frappe d'un flying kick au torse",
            "Naruto bondit dans les airs et donne un coup de pied sauté au visage de Panda",
            "Naruto s'élance en avant puis frappe Panda avec un flying kick droit",
            "Naruto saute latéralement vers Panda et projette son pied vers le torse",
            "Naruto attaque Panda en plein saut avec un coup de pied vers l'abdomen",
            "Naruto prend son élan et bondit vers Panda pour frapper son visage avec son pied",
            "Naruto s'élève dans les airs et porte un coup de pied sauté au torse de Panda",
            "Naruto effectue un saut en avant avant de frapper Panda avec un flying kick",
            "Naruto bondit vers Panda et projette sa jambe droite vers son ventre",
            "Naruto saute et frappe Panda avec un coup de pied aérien visant le torse"
        ]
    }

],


    // ==================================================
    // ESQUIVES
    // ==================================================

    esquive: [

        {
            id: "ESQ_001",
            categorie: "esquive",
            famille: "esquive_laterale",

            structure: [
                "SUJET",
                "ACTION",
                "DIRECTION"
            ],

            exemples: [
                "Naruto esquive vers la droite",
                "Naruto évite l'attaque en allant sur le côté",
                "Naruto se déporte vers la droite"
            ]
        }
    ],


    // ==================================================
    // PARADES
    // ==================================================

    parade: [

        {
            id: "PAR_001",
            categorie: "parade",
            famille: "blocage",

            structure: [
                "SUJET",
                "ACTION",
                "PARTIE_CORPS"
            ],

            exemples: [
                "Naruto bloque le coup avec son bras",
                "Naruto pare l'attaque avec son avant-bras"
            ]
        }
    ],


    // ==================================================
    // SAISIES
    // ==================================================

    saisie: [

        {
            id: "SAI_001",
            categorie: "saisie",
            famille: "saisie_corps",

            structure: [
                "SUJET",
                "ACTION",
                "PARTIE_CORPS",
                "CIBLE"
            ],

            exemples: [
                "Naruto saisit le bras de Panda",
                "Naruto attrape Panda par le bras",
                "Naruto agrippe son adversaire au bras"
            ]
        }
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
