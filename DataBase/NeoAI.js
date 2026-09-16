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

        deplacement: {
        categorie: "deplacement",

    course: [

    // ==================================================
    // COURSE FRONTALE
    // ==================================================

    {
        id: "COURSE_001",
        action: "course",
        maniere: "frontale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant",
                "arriere"
            ],

            trajectoire: [
                "frontale"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "rapidement",
                "tres_rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato court droit vers Naruto à VMax sur 5m pour l'atteindre",

            "Goku se précipite frontalement vers Vegeta à pleine vitesse sur 6m pour réduire la distance",

            "Ichigo sprinte vers Ulquiorra en ligne droite à vitesse maximale sur 4m pour le rejoindre",

            "Luffy fonce vers Zoro à grande vitesse sur 3m pour arriver devant lui",

            "Sasuke accélère droit vers Naruto à VMax sur 5m pour l'intercepter"
        ]
    },


    // ==================================================
    // COURSE CIRCULAIRE
    // ==================================================

    {
        id: "COURSE_002",
        action: "course",
        maniere: "circulaire",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "COURBE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite"
            ],

            trajectoire: [
                "circulaire"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "rapidement",
                "tres_rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            },

            courbe: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto court autour de Sasuke vers la droite à grande vitesse avec une courbe de 2m sur 5m pour le contourner",

            "Luffy se précipite autour de Zoro vers la gauche à pleine vitesse avec une courbe de 1,5m sur 4m pour atteindre son flanc",

            "Goku accélère en cercle autour de Vegeta vers la droite à VMax avec une courbe de 3m sur 6m pour passer derrière lui",

            "Yamato file autour de Madara vers la gauche à vitesse maximale avec une courbe de 2,5m sur 5m pour le contourner",

            "Ichigo progresse en trajectoire circulaire vers la droite autour d'Ulquiorra avec une courbe de 1m sur 4m pour arriver sur son côté"
        ]
    },


    // ==================================================
    // COURSE DIAGONALE
    // ==================================================

    {
        id: "COURSE_003",
        action: "course",
        maniere: "diagonale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite",
                "avant",
                "arriere"
            ],

            trajectoire: [
                "diagonale"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "rapidement",
                "tres_rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Goku court en diagonale vers la droite en direction de Vegeta à VMax sur 5m pour l'intercepter",

            "Sasuke se précipite en diagonale vers la gauche vers Naruto à pleine vitesse sur 4m pour le rejoindre",

            "Ichigo sprinte en diagonale vers l'avant à grande vitesse sur 6m pour atteindre Ulquiorra",

            "Luffy file en diagonale vers la droite vers Zoro à vitesse maximale sur 3m pour se rapprocher de lui",

            "Yamato accélère en diagonale vers la gauche à VMax sur 5m pour couper la trajectoire de Madara"
        ]
    },


    // ==================================================
    // COURSE EN ZIG ZAG
    // ==================================================

    {
        id: "COURSE_004",
        action: "course",
        maniere: "zig_zag",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant",
                "arriere"
            ],

            trajectoire: [
                "zig_zag"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "rapidement",
                "tres_rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto court en zig zag vers Sasuke à VMax sur 5m pour l'atteindre",

            "Goku se précipite en zig zag vers Vegeta à grande vitesse sur 6m pour se rapprocher de lui",

            "Luffy sprinte en zig zag vers Zoro à pleine vitesse sur 4m pour éviter ses attaques",

            "Ichigo file en zig zag vers Ulquiorra à vitesse maximale sur 5m pour l'intercepter",

            "Yamato avance en zig zag vers Madara rapidement sur 3m pour brouiller sa trajectoire"
        ]
    },


    // ==================================================
    // COURSE LATERALE
    // ==================================================

    {
        id: "COURSE_005",
        action: "course",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite"
            ],

            trajectoire: [
                "laterale"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "rapidement",
                "tres_rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke court latéralement vers la droite à VMax sur 4m pour contourner Naruto",

            "Goku se déplace rapidement sur le côté gauche vers Vegeta sur 3m pour éviter son attaque",

            "Luffy sprinte latéralement vers la droite à pleine vitesse sur 5m pour arriver sur le flanc de Zoro",

            "Ichigo file sur le côté gauche vers Ulquiorra à grande vitesse sur 4m pour se repositionner",

            "Yamato accélère latéralement vers la droite à vitesse maximale sur 6m pour passer à côté de Madara"
        ]
    }

],

    // ======================================================
    // PROCHAINE ACTION : SAUT
    // ======================================================
saut: [

    // ==================================================
    // SAUT VERTICAL — SUR PLACE
    // ==================================================

    {
        id: "SAUT_001",
        action: "saut",
        maniere: "vertical",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: [
                "verticale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato saute verticalement à 2m de hauteur pour prendre de la hauteur face à Naruto",

            "Goku saute droit vers le haut à une hauteur de 3m pour éviter Vegeta",

            "Luffy effectue un saut vertical de 1,5m de hauteur pour atteindre Zoro",

            "Ichigo réalise un saut vertical de 2,5m de hauteur pour esquiver Ulquiorra",

            "Sasuke se propulse en sautant vers le haut jusqu'à 3m de hauteur pour prendre de la hauteur face à Naruto"
        ]
    },


    // ==================================================
    // SAUT FRONTAL
    // ==================================================

    {
        id: "SAUT_002",
        action: "saut",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant"
            ],

            trajectoire: [
                "frontale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto saute vers l'avant à 1m de hauteur sur 3m pour atteindre Sasuke",

            "Goku effectue un saut frontal vers Vegeta à une hauteur de 2m sur 4m pour l'intercepter",

            "Luffy réalise un saut en avant à 1,5m de hauteur sur 2m pour rejoindre Zoro",

            "Ichigo se propulse en sautant droit devant lui à 2,5m de hauteur sur 5m pour atteindre Ulquiorra",

            "Yamato saute vers Madara en trajectoire frontale à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },


    // ==================================================
    // SAUT ARRIERE
    // ==================================================

    {
        id: "SAUT_003",
        action: "saut",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "arriere"
            ],

            trajectoire: [
                "arriere"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke saute vers l'arrière à 1m de hauteur sur 2m pour s'éloigner de Naruto",

            "Goku effectue un saut arrière à 2m de hauteur sur 3m pour éviter l'attaque de Vegeta",

            "Ichigo réalise un saut vers l'arrière à 1,5m de hauteur sur 2,5m pour prendre ses distances avec Ulquiorra",

            "Luffy se propulse en sautant vers l'arrière à 2m de hauteur sur 3m pour esquiver Zoro",

            "Yamato saute en arrière à 2,5m de hauteur sur 4m pour sortir de portée de Madara"
        ]
    },


    // ==================================================
    // SAUT LATERAL
    // ==================================================

    {
        id: "SAUT_004",
        action: "saut",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite"
            ],

            trajectoire: [
                "laterale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto saute vers la droite à 1m de hauteur sur 2m pour éviter Sasuke",

            "Goku effectue un saut latéral vers la gauche à 1,5m de hauteur sur 3m pour esquiver Vegeta",

            "Luffy réalise un saut sur le côté droit à 2m de hauteur sur 2,5m pour contourner Zoro",

            "Ichigo se propulse en sautant vers la gauche à 1m de hauteur sur 1,5m pour se décaler d'Ulquiorra",

            "Yamato saute latéralement vers la droite à 2m de hauteur sur 3m pour passer à côté de Madara"
        ]
    },


    // ==================================================
    // SAUT DIAGONAL
    // ==================================================

    {
        id: "SAUT_005",
        action: "saut",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],

            trajectoire: [
                "diagonale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto saute en diagonale vers l'avant droite à 1,5m de hauteur sur 3m pour atteindre Sasuke",

            "Goku effectue un saut diagonal vers l'avant gauche à 2m de hauteur sur 4m pour intercepter Vegeta",

            "Luffy réalise un saut en diagonale vers l'arrière droite à 1m de hauteur sur 2,5m pour éviter Zoro",

            "Ichigo se propulse en sautant en diagonale vers l'avant gauche à 2,5m de hauteur sur 5m pour rejoindre Ulquiorra",

            "Yamato saute en diagonale vers l'arrière gauche à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
        ]
    }

],
        
    
    // ======================================================
    // PROCHAINE ACTION : BOND
    // ======================================================
bond: [

    // ==================================================
    // BOND VERTICAL — SUR PLACE
    // ==================================================

    {
        id: "BOND_001",
        action: "bond",
        maniere: "vertical",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: [
                "verticale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato bondit verticalement à 2m de hauteur pour prendre de la hauteur face à Naruto",

            "Goku effectue un bond vertical à 3m de hauteur pour éviter Vegeta",

            "Luffy réalise un bond droit vers le haut à 1,5m de hauteur pour atteindre Zoro",

            "Ichigo bondit verticalement jusqu'à 2,5m de hauteur pour esquiver Ulquiorra",

            "Sasuke effectue un bond vers le haut jusqu'à 3m de hauteur pour prendre de la hauteur face à Naruto"
        ]
    },


    // ==================================================
    // BOND FRONTAL
    // ==================================================

    {
        id: "BOND_002",
        action: "bond",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant"
            ],

            trajectoire: [
                "frontale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto bondit vers l'avant à 1m de hauteur sur 3m pour atteindre Sasuke",

            "Goku effectue un bond frontal vers Vegeta à 2m de hauteur sur 4m pour l'intercepter",

            "Luffy réalise un bond en avant à 1,5m de hauteur sur 2m pour rejoindre Zoro",

            "Ichigo bondit droit devant lui à 2,5m de hauteur sur 5m pour atteindre Ulquiorra",

            "Yamato effectue un bond vers Madara en trajectoire frontale à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },


    // ==================================================
    // BOND ARRIERE
    // ==================================================

    {
        id: "BOND_003",
        action: "bond",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "arriere"
            ],

            trajectoire: [
                "arriere"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke bondit vers l'arrière à 1m de hauteur sur 2m pour s'éloigner de Naruto",

            "Goku effectue un bond arrière à 2m de hauteur sur 3m pour éviter l'attaque de Vegeta",

            "Ichigo réalise un bond vers l'arrière à 1,5m de hauteur sur 2,5m pour prendre ses distances avec Ulquiorra",

            "Luffy bondit en arrière à 2m de hauteur sur 3m pour esquiver Zoro",

            "Yamato effectue un bond vers l'arrière à 2,5m de hauteur sur 4m pour sortir de portée de Madara"
        ]
    },


    // ==================================================
    // BOND LATERAL
    // ==================================================

    {
        id: "BOND_004",
        action: "bond",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite"
            ],

            trajectoire: [
                "laterale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto bondit vers la droite à 1m de hauteur sur 2m pour éviter Sasuke",

            "Goku effectue un bond latéral vers la gauche à 1,5m de hauteur sur 3m pour esquiver Vegeta",

            "Luffy réalise un bond sur le côté droit à 2m de hauteur sur 2,5m pour contourner Zoro",

            "Ichigo bondit vers la gauche à 1m de hauteur sur 1,5m pour se décaler d'Ulquiorra",

            "Yamato effectue un bond latéral vers la droite à 2m de hauteur sur 3m pour passer à côté de Madara"
        ]
    },


    // ==================================================
    // BOND DIAGONAL
    // ==================================================

    {
        id: "BOND_005",
        action: "bond",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],

            trajectoire: [
                "diagonale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto bondit en diagonale vers l'avant droite à 1,5m de hauteur sur 3m pour atteindre Sasuke",

            "Goku effectue un bond diagonal vers l'avant gauche à 2m de hauteur sur 4m pour intercepter Vegeta",

            "Luffy réalise un bond en diagonale vers l'arrière droite à 1m de hauteur sur 2,5m pour éviter Zoro",

            "Ichigo bondit en diagonale vers l'avant gauche à 2,5m de hauteur sur 5m pour rejoindre Ulquiorra",

            "Yamato effectue un bond en diagonale vers l'arrière gauche à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
        ]
    }

],
    
    // ======================================================
    // PROCHAINE ACTION : VOL
    // ======================================================

vol: [

    // ==================================================
    // VOL VERTICAL — SUR PLACE
    // ==================================================

    {
        id: "VOL_001",
        action: "vol",
        maniere: "vertical",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: [
                "verticale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato vole verticalement jusqu'à 5m de hauteur pour prendre de la hauteur face à Naruto",

            "Goku s'élève dans les airs jusqu'à une hauteur de 10m pour éviter Vegeta",

            "Luffy monte verticalement à 3m de hauteur pour atteindre Zoro",

            "Ichigo prend de l'altitude jusqu'à 7m de hauteur pour esquiver Ulquiorra",

            "Sasuke se maintient en vol à 4m de hauteur pour observer Naruto"
        ]
    },


    // ==================================================
    // VOL FRONTAL
    // ==================================================

    {
        id: "VOL_002",
        action: "vol",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant"
            ],

            trajectoire: [
                "frontale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto vole vers l'avant à 5m de hauteur sur 10m pour atteindre Sasuke",

            "Goku se déplace dans les airs vers Vegeta à 8m de hauteur sur 15m pour l'intercepter",

            "Luffy vole droit devant lui à 3m de hauteur sur 6m pour rejoindre Zoro",

            "Ichigo traverse les airs à 7m de hauteur sur 12m pour atteindre Ulquiorra",

            "Yamato fonce dans les airs vers Madara à 10m de hauteur sur 20m pour l'attaquer"
        ]
    },


    // ==================================================
    // VOL ARRIERE
    // ==================================================

    {
        id: "VOL_003",
        action: "vol",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "arriere"
            ],

            trajectoire: [
                "arriere"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke vole vers l'arrière à 4m de hauteur sur 5m pour s'éloigner de Naruto",

            "Goku recule dans les airs à 8m de hauteur sur 10m pour éviter l'attaque de Vegeta",

            "Ichigo se déplace en volant vers l'arrière à 6m de hauteur sur 7m pour prendre ses distances avec Ulquiorra",

            "Luffy vole en arrière à 3m de hauteur sur 5m pour esquiver Zoro",

            "Yamato se retire dans les airs à 10m de hauteur sur 12m pour sortir de portée de Madara"
        ]
    },


    // ==================================================
    // VOL LATERAL
    // ==================================================

    {
        id: "VOL_004",
        action: "vol",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "gauche",
                "droite"
            ],

            trajectoire: [
                "laterale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto vole vers la droite à 5m de hauteur sur 6m pour éviter Sasuke",

            "Goku se déplace dans les airs vers la gauche à 8m de hauteur sur 10m pour esquiver Vegeta",

            "Luffy vole sur le côté droit à 3m de hauteur sur 5m pour contourner Zoro",

            "Ichigo se déplace latéralement dans les airs vers la gauche à 7m de hauteur sur 8m pour se décaler d'Ulquiorra",

            "Yamato vole vers la droite à 10m de hauteur sur 12m pour passer à côté de Madara"
        ]
    },


    // ==================================================
    // VOL DIAGONAL
    // ==================================================

    {
        id: "VOL_005",
        action: "vol",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],

            trajectoire: [
                "diagonale"
            ],

            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },

            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto vole en diagonale vers l'avant droite à 5m de hauteur sur 8m pour atteindre Sasuke",

            "Goku se déplace dans les airs en diagonale vers l'avant gauche à 10m de hauteur sur 12m pour intercepter Vegeta",

            "Luffy vole en diagonale vers l'arrière droite à 3m de hauteur sur 6m pour éviter Zoro",

            "Ichigo traverse les airs en diagonale vers l'avant gauche à 7m de hauteur sur 10m pour rejoindre Ulquiorra",

            "Yamato vole en diagonale vers l'arrière gauche à 12m de hauteur sur 15m pour s'éloigner de Madara"
        ]
    }

],
        
// ==================================================
// ACCROBATIES
// ==================================================
salto: [

    {
        id: "SALTO_001",
        action: "salto",
        maniere: "sur_place",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: ["rotation_avant", "rotation_arriere"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato effectue un salto sur place à 2m de hauteur pour esquiver Naruto",
            "Goku réalise un salto arrière sur place à 3m de hauteur pour éviter Vegeta",
            "Luffy fait un salto avant sur place à 1,5m de hauteur pour prendre de la hauteur face à Zoro",
            "Ichigo exécute un salto arrière sur place jusqu'à 2,5m de hauteur pour esquiver Ulquiorra",
            "Sasuke réalise une rotation acrobatique sur place à 2m de hauteur pour éviter Naruto"
        ]
    },

    {
        id: "SALTO_002",
        action: "salto",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["avant"],
            trajectoire: ["rotation_avant"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un salto avant vers Sasuke à 2m de hauteur sur 3m pour l'atteindre",
            "Goku réalise un salto frontal vers Vegeta à 2,5m de hauteur sur 4m pour l'intercepter",
            "Luffy fait un salto vers l'avant à 1,5m de hauteur sur 2m pour rejoindre Zoro",
            "Ichigo exécute un salto avant sur 5m à 3m de hauteur pour atteindre Ulquiorra",
            "Yamato se lance dans un salto frontal vers Madara à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },

    {
        id: "SALTO_003",
        action: "salto",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["arriere"],
            trajectoire: ["rotation_arriere"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke effectue un salto arrière à 2m de hauteur sur 3m pour s'éloigner de Naruto",
            "Goku réalise un salto vers l'arrière à 2,5m de hauteur sur 4m pour éviter Vegeta",
            "Ichigo fait un salto arrière sur 2m à 1,5m de hauteur pour prendre ses distances avec Ulquiorra",
            "Luffy exécute une rotation arrière sur 3m à 2m de hauteur pour esquiver Zoro",
            "Yamato se propulse dans un salto arrière à 3m de hauteur sur 4m pour sortir de portée de Madara"
        ]
    },

    {
        id: "SALTO_004",
        action: "salto",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["gauche", "droite"],
            trajectoire: ["rotation_laterale"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un salto latéral vers la droite à 1,5m de hauteur sur 2m pour éviter Sasuke",
            "Goku réalise un salto latéral vers la gauche à 2m de hauteur sur 3m pour esquiver Vegeta",
            "Luffy fait une rotation latérale vers la droite à 2,5m de hauteur sur 2m pour contourner Zoro",
            "Ichigo exécute un salto sur le côté gauche à 1,5m de hauteur sur 2,5m pour se décaler d'Ulquiorra",
            "Yamato effectue un salto latéral vers la droite à 3m de hauteur sur 4m pour passer à côté de Madara"
        ]
    },

    {
        id: "SALTO_005",
        action: "salto",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],
            trajectoire: ["rotation_diagonale"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un salto diagonal vers l'avant droite à 2m de hauteur sur 3m pour atteindre Sasuke",
            "Goku réalise un salto en diagonale vers l'avant gauche à 2,5m de hauteur sur 4m pour intercepter Vegeta",
            "Luffy fait un salto diagonal vers l'arrière droite à 1,5m de hauteur sur 2,5m pour éviter Zoro",
            "Ichigo exécute un salto en diagonale vers l'avant gauche à 3m de hauteur sur 5m pour rejoindre Ulquiorra",
            "Yamato se propulse dans un salto diagonal vers l'arrière gauche à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
        ]
    }

],        
            
vrille: [

    {
        id: "VRILLE_001",
        action: "vrille",
        maniere: "sur_place",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: ["rotation_verticale", "vrille"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato effectue une vrille sur place de 360° vers la droite à 2m de hauteur pour esquiver Naruto",
            "Goku réalise une vrille de 180° vers la gauche sur place à 3m de hauteur pour éviter Vegeta",
            "Luffy effectue une rotation de 540° vers la droite sur place à 2,5m de hauteur pour impressionner Zoro",
            "Ichigo réalise une vrille de 720° vers la gauche à 3m de hauteur pour esquiver Ulquiorra",
            "Sasuke tourne sur lui-même de 360° vers la droite à 2m de hauteur pour éviter Naruto"
        ]
    },

    {
        id: "VRILLE_002",
        action: "vrille",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["avant"],
            trajectoire: ["rotation_verticale", "vrille"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto avance en vrille de 360° vers la droite à 2m de hauteur sur 3m pour atteindre Sasuke",
            "Goku effectue une vrille frontale de 180° vers la gauche à 2,5m de hauteur sur 4m pour intercepter Vegeta",
            "Luffy se déplace vers l'avant en tournant de 540° vers la droite à 1,5m de hauteur sur 2m pour rejoindre Zoro",
            "Ichigo traverse les airs en vrille de 360° vers la gauche à 3m de hauteur sur 5m pour atteindre Ulquiorra",
            "Yamato fonce vers Madara en vrille de 720° vers la droite à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },

    {
        id: "VRILLE_003",
        action: "vrille",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["arriere"],
            trajectoire: ["rotation_verticale", "vrille"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke recule en vrille de 360° vers la droite à 2m de hauteur sur 3m pour s'éloigner de Naruto",
            "Goku effectue une vrille arrière de 180° vers la gauche à 2,5m de hauteur sur 4m pour éviter Vegeta",
            "Ichigo se déplace vers l'arrière en tournant de 540° vers la droite à 1,5m de hauteur sur 2,5m pour esquiver Ulquiorra",
            "Luffy part en arrière avec une vrille de 360° vers la gauche à 2m de hauteur sur 3m pour éviter Zoro",
            "Yamato se retire en vrille de 720° vers la droite à 3m de hauteur sur 4m pour sortir de portée de Madara"
        ]
    },

    {
        id: "VRILLE_004",
        action: "vrille",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["gauche", "droite"],
            trajectoire: ["rotation_laterale", "vrille"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue une vrille latérale de 360° vers la droite à 1,5m de hauteur sur 2m pour éviter Sasuke",
            "Goku se déplace vers la gauche en vrille de 180° vers la gauche à 2m de hauteur sur 3m pour esquiver Vegeta",
            "Luffy réalise une vrille latérale de 540° vers la droite à 2,5m de hauteur sur 2m pour contourner Zoro",
            "Ichigo part sur le côté gauche avec une vrille de 360° vers la gauche à 2m de hauteur sur 2,5m pour se décaler d'Ulquiorra",
            "Yamato effectue une vrille latérale de 720° vers la droite à 3m de hauteur sur 4m pour passer à côté de Madara"
        ]
    },

    {
        id: "VRILLE_005",
        action: "vrille",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],
            trajectoire: ["rotation_diagonale", "vrille"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto avance en diagonale avec une vrille de 360° vers la droite à 2m de hauteur sur 3m pour atteindre Sasuke",
            "Goku effectue une vrille diagonale de 180° vers la gauche à 2,5m de hauteur sur 4m pour intercepter Vegeta",
            "Luffy se déplace en diagonale avec une rotation de 540° vers la droite à 1,5m de hauteur sur 2,5m pour éviter Zoro",
            "Ichigo traverse les airs en diagonale avec une vrille de 360° vers la gauche à 3m de hauteur sur 5m pour rejoindre Ulquiorra",
            "Yamato fonce en diagonale avec une vrille de 720° vers la droite à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
        ]
    }

],

pirouette: [

    {
        id: "PIROUETTE_001",
        action: "pirouette",
        maniere: "sur_place",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: ["rotation_verticale", "pirouette"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato effectue une pirouette sur place de 360° vers la droite à 1m de hauteur pour esquiver Naruto",
            "Goku réalise une pirouette de 180° vers la gauche sur place à 1,5m de hauteur pour éviter Vegeta",
            "Luffy effectue une pirouette de 540° vers la droite sur place à 2m de hauteur pour contourner Zoro",
            "Ichigo réalise une pirouette de 720° vers la gauche sur place à 2,5m de hauteur pour esquiver Ulquiorra",
            "Sasuke tourne sur lui-même de 360° vers la droite à 1,5m de hauteur pour éviter Naruto"
        ]
    },

    {
        id: "PIROUETTE_002",
        action: "pirouette",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["avant"],
            trajectoire: ["rotation_verticale", "pirouette"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto avance avec une pirouette de 360° vers la droite à 1m de hauteur sur 3m pour atteindre Sasuke",
            "Goku effectue une pirouette frontale de 180° vers la gauche à 1,5m de hauteur sur 4m pour intercepter Vegeta",
            "Luffy se déplace vers l'avant en pirouette de 540° vers la droite à 2m de hauteur sur 2m pour rejoindre Zoro",
            "Ichigo traverse les airs avec une pirouette de 360° vers la gauche à 2,5m de hauteur sur 5m pour atteindre Ulquiorra",
            "Yamato fonce vers Madara avec une pirouette de 720° vers la droite à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },

    {
        id: "PIROUETTE_003",
        action: "pirouette",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["arriere"],
            trajectoire: ["rotation_verticale", "pirouette"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke recule avec une pirouette de 360° vers la droite à 1m de hauteur sur 3m pour s'éloigner de Naruto",
            "Goku effectue une pirouette arrière de 180° vers la gauche à 1,5m de hauteur sur 4m pour éviter Vegeta",
            "Ichigo se déplace vers l'arrière en pirouette de 540° vers la droite à 2m de hauteur sur 2,5m pour esquiver Ulquiorra",
            "Luffy part en arrière avec une pirouette de 360° vers la gauche à 2m de hauteur sur 3m pour éviter Zoro",
            "Yamato se retire avec une pirouette de 720° vers la droite à 2,5m de hauteur sur 4m pour sortir de portée de Madara"
        ]
    },

    {
        id: "PIROUETTE_004",
        action: "pirouette",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["gauche", "droite"],
            trajectoire: ["rotation_laterale", "pirouette"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue une pirouette latérale de 360° vers la droite à 1m de hauteur sur 2m pour éviter Sasuke",
            "Goku se déplace vers la gauche avec une pirouette de 180° vers la gauche à 1,5m de hauteur sur 3m pour esquiver Vegeta",
            "Luffy réalise une pirouette latérale de 540° vers la droite à 2m de hauteur sur 2,5m pour contourner Zoro",
            "Ichigo part sur le côté gauche avec une pirouette de 360° vers la gauche à 1,5m de hauteur sur 2m pour se décaler d'Ulquiorra",
            "Yamato effectue une pirouette latérale de 720° vers la droite à 2,5m de hauteur sur 4m pour passer à côté de Madara"
        ]
    },

    {
        id: "PIROUETTE_005",
        action: "pirouette",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],
            trajectoire: ["rotation_diagonale", "pirouette"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto avance en diagonale avec une pirouette de 360° vers la droite à 1,5m de hauteur sur 3m pour atteindre Sasuke",
            "Goku effectue une pirouette diagonale de 180° vers la gauche à 2m de hauteur sur 4m pour intercepter Vegeta",
            "Luffy se déplace en diagonale avec une pirouette de 540° vers la droite à 1m de hauteur sur 2,5m pour éviter Zoro",
            "Ichigo traverse les airs en diagonale avec une pirouette de 360° vers la gauche à 2,5m de hauteur sur 5m pour rejoindre Ulquiorra",
            "Yamato fonce en diagonale avec une pirouette de 720° vers la droite à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
        ]
    }    
],

flip: [

    {
        id: "FLIP_001",
        action: "flip",
        maniere: "sur_place",

        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            trajectoire: ["rotation_avant", "rotation_arriere"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["avant", "arriere"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Yamato effectue un flip avant sur place de 360° à 2m de hauteur pour esquiver Naruto",
            "Goku réalise un flip arrière sur place de 360° à 3m de hauteur pour éviter Vegeta",
            "Luffy fait un frontflip sur place de 540° à 2m de hauteur pour contourner Zoro",
            "Ichigo réalise un backflip sur place de 360° à 2,5m de hauteur pour esquiver Ulquiorra",
            "Sasuke effectue un flip arrière de 720° sur place à 3m de hauteur pour éviter Naruto"
        ]
    },

    {
        id: "FLIP_002",
        action: "flip",
        maniere: "frontal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["avant"],
            trajectoire: ["rotation_avant"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["avant"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un frontflip de 360° vers Sasuke à 2m de hauteur sur 3m pour l'atteindre",
            "Goku réalise un flip avant vers Vegeta de 540° à 2,5m de hauteur sur 4m pour l'intercepter",
            "Luffy fait un frontflip vers l'avant de 360° à 1,5m de hauteur sur 2m pour rejoindre Zoro",
            "Ichigo se propulse en flip avant de 720° à 3m de hauteur sur 5m pour atteindre Ulquiorra",
            "Yamato fonce vers Madara avec un frontflip de 360° à 2m de hauteur sur 3,5m pour l'attaquer"
        ]
    },

    {
        id: "FLIP_003",
        action: "flip",
        maniere: "arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["arriere"],
            trajectoire: ["rotation_arriere"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["arriere"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Sasuke effectue un backflip de 360° vers l'arrière à 2m de hauteur sur 3m pour s'éloigner de Naruto",
            "Goku réalise un flip arrière de 540° à 2,5m de hauteur sur 4m pour éviter Vegeta",
            "Ichigo fait un backflip vers l'arrière de 360° à 1,5m de hauteur sur 2,5m pour esquiver Ulquiorra",
            "Luffy se propulse en flip arrière de 720° à 2m de hauteur sur 3m pour sortir de portée de Zoro",
            "Yamato recule avec un backflip de 360° à 3m de hauteur sur 4m pour éviter Madara"
        ]
    },

    {
        id: "FLIP_004",
        action: "flip",
        maniere: "laterale",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: ["gauche", "droite"],
            trajectoire: ["rotation_laterale"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["gauche", "droite"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un flip latéral de 360° vers la droite à 1,5m de hauteur sur 2m pour éviter Sasuke",
            "Goku réalise un flip latéral vers la gauche de 540° à 2m de hauteur sur 3m pour esquiver Vegeta",
            "Luffy fait une rotation latérale de 360° vers la droite à 2,5m de hauteur sur 2m pour contourner Zoro",
            "Ichigo exécute un flip latéral de 720° vers la gauche à 2m de hauteur sur 3m pour se décaler d'Ulquiorra",
            "Yamato effectue un flip sur le côté droit de 360° à 3m de hauteur sur 4m pour passer à côté de Madara"
        ]
    },

    {
        id: "FLIP_005",
        action: "flip",
        maniere: "diagonal",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "ROTATION",
            "SENS_ROTATION",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            direction: [
                "avant_gauche",
                "avant_droite",
                "arriere_gauche",
                "arriere_droite"
            ],
            trajectoire: ["rotation_diagonale"],
            rotation: {
                type: "angle",
                unite: ["°"]
            },
            sensRotation: ["avant", "arriere"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },

        exemples: [
            "Naruto effectue un flip diagonal avant de 360° vers la droite à 2m de hauteur sur 3m pour atteindre Sasuke",
            "Goku réalise un flip diagonal arrière de 540° vers la gauche à 2,5m de hauteur sur 4m pour éviter Vegeta",
            "Luffy fait un flip en diagonale vers l'avant droite de 360° à 1,5m de hauteur sur 2,5m pour rejoindre Zoro",
            "Ichigo se propulse en flip diagonal arrière de 720° vers la gauche à 3m de hauteur sur 5m pour esquiver Ulquiorra",
            "Yamato fonce en diagonale avec un flip avant de 360° à 2m de hauteur sur 3,5m pour atteindre Madara"
        ]
    }

],

//================================================
    // 👊 CATÉGORIE — ATTAQUE
//================================================
attaque: {
        categorie: "attaque",
            
//================================================
// 👊 ATTAQUE — FRAPPES AVEC LES MAINS
//================================================
frappe: {
    
mains: {

    //================================================
    // 1 — COUP DIRECT
    //================================================

    coup_direct: {
        id: "MAIN_001",
        action: "frappe",
        maniere: "coup_direct",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["directe"]
        },

        aliases: [
            "coup direct",
            "direct",
            "coup de poing direct",
            "poing direct",
            "jab",
            "straight"
        ],

        exemples: [
            "Yamato frappe Naruto au visage avec un coup direct du poing droit",
            "Goku donne un direct du poing gauche dans le ventre de Vegeta",
            "Luffy envoie un coup de poing direct au visage de Zoro",
            "Ichigo porte un straight du poing droit à la mâchoire d'Ulquiorra",
            "Sasuke frappe Naruto avec son poing gauche directement au torse"
        ]
    },


    //================================================
    // 2 — CROCHET GAUCHE
    //================================================

    crochet_gauche: {
        id: "MAIN_002",
        action: "frappe",
        maniere: "crochet_gauche",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: "gauche",
            trajectoire: ["circulaire"]
        },

        aliases: [
            "crochet gauche",
            "left hook",
            "hook gauche"
        ],

        exemples: [
            "Yamato frappe Naruto au visage avec un crochet gauche",
            "Goku envoie un crochet gauche à la mâchoire de Vegeta",
            "Luffy porte un hook gauche dans les côtes de Zoro",
            "Ichigo assène un crochet gauche au visage d'Ulquiorra",
            "Sasuke frappe Naruto d'un crochet gauche au niveau du menton"
        ]
    },


    //================================================
    // 3 — CROCHET DROIT
    //================================================

    crochet_droit: {
        id: "MAIN_003",
        action: "frappe",
        maniere: "crochet_droit",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: "droite",
            trajectoire: ["circulaire"]
        },

        aliases: [
            "crochet droit",
            "right hook",
            "hook droit"
        ],

        exemples: [
            "Naruto frappe Sasuke au visage avec un crochet droit",
            "Goku envoie un crochet droit à la mâchoire de Vegeta",
            "Luffy porte un hook droit dans les côtes de Zoro",
            "Ichigo assène un crochet droit au menton d'Ulquiorra",
            "Yamato frappe Madara d'un crochet droit au niveau du visage"
        ]
    },


    //================================================
    // 4 — UPPERCUT
    //================================================

    uppercut: {
        id: "MAIN_004",
        action: "frappe",
        maniere: "uppercut",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["montante"]
        },

        aliases: [
            "uppercut",
            "coup de poing remontant",
            "poing remontant",
            "coup remontant"
        ],

        exemples: [
            "Yamato frappe Naruto au menton avec un uppercut droit",
            "Goku envoie un uppercut gauche sous la mâchoire de Vegeta",
            "Luffy porte un coup de poing remontant au visage de Zoro",
            "Ichigo assène un uppercut au menton d'Ulquiorra",
            "Sasuke remonte son poing droit vers le menton de Naruto"
        ]
    },


    //================================================
    // 5 — UPPERCUT SAUTÉ
    //================================================

    uppercut_saute: {
        id: "MAIN_005",
        action: "frappe",
        maniere: "uppercut_saute",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "MOUVEMENT",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["montante"],
            mouvement: ["saut"]
        },

        aliases: [
            "uppercut sauté",
            "rising uppercut",
            "uppercut en sautant",
            "uppercut sauté vers le haut"
        ],

        exemples: [
            "Yamato saute en donnant un uppercut droit au menton de Naruto",
            "Goku se propulse vers le haut avec un uppercut gauche contre Vegeta",
            "Luffy effectue un uppercut sauté au visage de Zoro",
            "Ichigo saute vers Ulquiorra en lançant un rising uppercut",
            "Sasuke saute et remonte son poing droit sous le menton de Naruto"
        ]
    },


    //================================================
    // 6 — COUP EN REVERS
    //================================================

    backfist: {
        id: "MAIN_006",
        action: "frappe",
        maniere: "backfist",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: [
                "horizontale",
                "diagonale"
            ]
        },

        aliases: [
            "coup en revers",
            "backfist",
            "back fist",
            "revers",
            "coup de revers"
        ],

        exemples: [
            "Yamato frappe Naruto au visage avec un revers du poing droit",
            "Goku donne un backfist gauche à la tempe de Vegeta",
            "Luffy porte un coup en revers au visage de Zoro",
            "Ichigo frappe Ulquiorra avec le dos de son poing droit",
            "Sasuke assène un revers du poing gauche à la mâchoire de Naruto"
        ]
    },


    //================================================
    // 7 — REVERS CIRCULAIRE
    //================================================

    spinning_backfist: {
        id: "MAIN_007",
        action: "frappe",
        maniere: "spinning_backfist",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "ROTATION",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["circulaire"],
            rotation: {
                type: "angle",
                unite: ["°"]
            }
        },

        aliases: [
            "revers circulaire",
            "spinning backfist",
            "spinning back fist",
            "backfist tournant",
            "revers tournant"
        ],

        exemples: [
            "Yamato effectue une rotation de 360° avant de frapper Naruto avec un spinning backfist",
            "Goku réalise un revers circulaire de 180° au visage de Vegeta",
            "Luffy tourne sur lui-même à 360° et frappe Zoro avec un revers circulaire",
            "Ichigo effectue un spinning backfist de 360° contre Ulquiorra",
            "Sasuke réalise un revers tournant de 180° vers le visage de Naruto"
        ]
    },


    //================================================
    // 8 — MARTEAU DESCENDANT
    //================================================

    hammer_descendant: {
        id: "MAIN_008",
        action: "frappe",
        maniere: "descendant",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["descendante"]
        },

        aliases: [
            "coup marteau descendant",
            "marteau descendant",
            "coup de marteau",
            "hammer",
            "hammer fist",
            "hammer descendant"
        ],

        exemples: [
            "Yamato frappe Naruto au sommet du crâne avec un coup de marteau descendant",
            "Goku abat son poing droit en marteau sur l'épaule de Vegeta",
            "Luffy donne un hammer fist descendant sur Zoro",
            "Ichigo porte un coup de marteau du poing gauche sur Ulquiorra",
            "Sasuke frappe Naruto d'un marteau descendant au niveau de la tête"
        ]
    },


    //================================================
    // 9 — MARTEAU LATÉRAL
    //================================================

    hammer_lateral: {
        id: "MAIN_009",
        action: "frappe",
        maniere: "hammer_lateral",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: ["laterale"]
        },

        aliases: [
            "coup marteau latéral",
            "marteau latéral",
            "hammer fist side",
            "side hammer",
            "coup de marteau latéral"
        ],

        exemples: [
            "Naruto frappe Sasuke à la tempe avec un marteau latéral droit",
            "Goku donne un coup de marteau latéral gauche au visage de Vegeta",
            "Luffy porte un side hammer sur les côtes de Zoro",
            "Ichigo frappe Ulquiorra avec un marteau latéral du poing droit",
            "Yamato assène un coup de marteau latéral à la mâchoire de Madara"
        ]
    },


    //================================================
    // 10 — MARTEAU EN REVERS
    //================================================

    reverse_hammer: {
        id: "MAIN_010",
        action: "frappe",
        maniere: "reverse_hammer",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        params: {
            type: "poing",
            main: ["gauche", "droite"],
            trajectoire: [
                "horizontale",
                "diagonale"
            ]
        },

        aliases: [
            "coup marteau en revers",
            "marteau en revers",
            "reverse hammer",
            "reverse hammer fist",
            "marteau inversé"
        ],

        exemples: [
            "Yamato frappe Naruto avec un marteau en revers du poing droit",
            "Goku porte un reverse hammer gauche au visage de Vegeta",
            "Luffy donne un coup marteau en revers à la mâchoire de Zoro",
            "Ichigo frappe Ulquiorra avec un reverse hammer diagonal",
            "Sasuke assène un marteau en revers du poing gauche au visage de Naruto"
        ]
    }

},            
                                            
//================================================
 // 🦵 FRAPPES AVEC LES PIEDS
//================================================

        pieds: {

            // 1 — FRONT KICK
            front_kick: {
                aliases: [
                    "front kick",
                    "coup de pied frontal",
                    "coup de pied direct",
                    "coup de pied avant"
                ],
                type: "pied",
                trajectoire: "directe",
                surface: [
                    "semelle",
                    "plante du pied"
                ]
            },

            // 2 — ROUNDHOUSE KICK
            roundhouse_kick: {
                aliases: [
                    "roundhouse kick",
                    "coup circulaire",
                    "coup de pied circulaire"
                ],
                type: "pied",
                trajectoire: "circulaire",
                surface: [
                    "cou-de-pied",
                    "tibia"
                ]
            },

            // 3 — SIDE KICK
            side_kick: {
                aliases: [
                    "side kick",
                    "coup de pied latéral"
                ],
                type: "pied",
                trajectoire: "latérale",
                surface: [
                    "tranchant du pied",
                    "talon"
                ]
            },

            // 4 — BACK KICK
            back_kick: {
                aliases: [
                    "back kick",
                    "coup de pied arrière"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: true,
                surface: [
                    "talon"
                ]
            },

            // 5 — HOOK KICK
            hook_kick: {
                aliases: [
                    "hook kick",
                    "coup de pied en crochet"
                ],
                type: "pied",
                trajectoire: "crochet",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 6 — AXE KICK
            axe_kick: {
                aliases: [
                    "axe kick",
                    "coup de pied descendant",
                    "coup de pied en axe"
                ],
                type: "pied",
                trajectoire: "descendante",
                surface: [
                    "talon",
                    "plante du pied"
                ]
            },

            // 7 — SPINNING BACK KICK
            spinning_back_kick: {
                aliases: [
                    "spinning back kick",
                    "coup de pied arrière circulaire"
                ],
                type: "pied",
                trajectoire: "arrière",
                rotation: "360",
                surface: [
                    "talon"
                ]
            },

            // 8 — LOW KICK
            low_kick: {
                aliases: [
                    "low kick",
                    "coup bas",
                    "coup de pied bas"
                ],
                type: "pied",
                trajectoire: "latérale",
                cible: [
                    "cuisse",
                    "mollet"
                ],
                surface: [
                    "tibia",
                    "cou-de-pied"
                ]
            },

            // 9 — KNEE STRIKE
            knee_strike: {
                aliases: [
                    "knee strike",
                    "coup de genou",
                    "coup genou",
                    "genou"
                ],
                type: "genou",
                trajectoire: "montante",
                surface: [
                    "genou"
                ]
            },

            // 10 — FLYING KICK
            flying_kick: {
                aliases: [
                    "flying kick",
                    "coup sauté",
                    "coup de pied sauté"
                ],
                type: "pied",
                mouvement: "saut",
                trajectoire: [
                    "directe",
                    "latérale"
                ],
                surface: [
                    "pied",
                    "talon"
                ]
            }
        }
    },
            circulaire"
            ],

            exemples: [
                "Yamato fait tourner son épée à 360° avant de frapper Naruto",
                "Goku effectue une coupe circulaire de 180° vers Vegeta",
                "Ichigo réalise une taillade circulaire de 360° contre Ulquiorra",
                "Sasuke tourne son épée et frappe Naruto avec une coupe circulaire",
                "Luffy effectue une rotation de 360° avec son épée vers Zoro"
            ]
        }
    },

//================================================
// ⚔️ FRAPPES AVEC ARMES
//================================================

armes: {

    //================================================
    // ⚔️ KATANA
    //================================================

    katana: {

        //================================================
        // 1 — COUPE HORIZONTALE
        //================================================

        coupe_horizontale: {
            id: "ARME_001",
            action: "frappe",
            maniere: "coupe_horizontale",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "katana",
                trajectoire: ["horizontale"],
                direction: ["gauche", "droite"]
            },

            aliases: [
                "coupe horizontale",
                "taillade horizontale",
                "coup horizontal",
                "slash horizontal"
            ],

            exemples: [
                "Yamato frappe Naruto avec son katana par une coupe horizontale de gauche à droite",
                "Goku taille horizontalement vers Vegeta avec son katana",
                "Ichigo porte une coupe horizontale vers le torse d'Ulquiorra",
                "Sasuke effectue une taillade horizontale vers Naruto",
                "Luffy donne un coup horizontal de katana vers le flanc de Zoro"
            ]
        },


        //================================================
        // 2 — COUPE VERTICALE
        //================================================

        coupe_verticale: {
            id: "ARME_002",
            action: "frappe",
            maniere: "coupe_verticale",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "katana",
                trajectoire: ["verticale"],
                direction: ["haut", "bas"]
            },

            aliases: [
                "coupe verticale",
                "taillade verticale",
                "coup vertical",
                "slash vertical"
            ],

            exemples: [
                "Yamato abat son katana verticalement vers Naruto",
                "Goku effectue une coupe verticale vers Vegeta",
                "Ichigo porte une taillade verticale vers Ulquiorra",
                "Sasuke frappe Naruto avec une coupe verticale descendante",
                "Luffy abat son katana vers le torse de Zoro"
            ]
        },


        //================================================
        // 3 — COUPE DIAGONALE
        //================================================

        coupe_diagonale: {
            id: "ARME_003",
            action: "frappe",
            maniere: "coupe_diagonale",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "katana",
                trajectoire: ["diagonale"],
                direction: [
                    "haut_gauche",
                    "haut_droite",
                    "bas_gauche",
                    "bas_droite"
                ]
            },

            aliases: [
                "coupe diagonale",
                "taillade diagonale",
                "coup diagonal",
                "slash diagonal"
            ],

            exemples: [
                "Yamato frappe Naruto avec une coupe diagonale descendante",
                "Goku porte une taillade diagonale vers Vegeta",
                "Ichigo effectue une coupe diagonale vers Ulquiorra",
                "Sasuke donne un slash diagonal vers Naruto",
                "Luffy frappe Zoro avec une coupe diagonale de son katana"
            ]
        },


        //================================================
        // 🗡️ ÉPÉE — ESTOC
        //================================================

        estoc_epee: {
            id: "ARME_004",
            action: "frappe",
            maniere: "estoc",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "epee",
                trajectoire: ["directe"],
                direction: ["avant"]
            },

            aliases: [
                "estoc",
                "coup d'estoc",
                "estocade",
                "coup d'épée direct",
                "coup d'épée droit"
            ],

            exemples: [
                "Yamato porte une estocade avec son épée vers Naruto",
                "Goku pousse son épée directement vers Vegeta",
                "Ichigo donne un coup d'estoc vers le torse d'Ulquiorra",
                "Sasuke effectue une estocade vers Naruto",
                "Luffy frappe Zoro avec un coup d'épée direct"
            ]
        },


        //================================================
        // 🗡️ ÉPÉE — COUPE CIRCULAIRE
        //================================================

        coupe_circulaire_epee: {
            id: "ARME_005",
            action: "frappe",
            maniere: "coupe_circulaire",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "ROTATION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "epee",
                trajectoire: ["circulaire"],
                rotation: {
                    type: "angle",
                    unite: ["°"]
                }
            },

            aliases: [
                "coupe circulaire",
                "coup d'épée circulaire",
                "épée tournante",
                "slash circulaire"
            ],

            exemples: [
                "Yamato fait tourner son épée à 360° avant de frapper Naruto",
                "Goku effectue une coupe circulaire de 180° vers Vegeta",
                "Ichigo réalise une taillade circulaire de 360° contre Ulquiorra",
                "Sasuke tourne son épée et frappe Naruto avec une coupe circulaire",
                "Luffy effectue une rotation de 360° avec son épée vers Zoro"
            ]
        }
    },


    //================================================
    // 🔱 LANCE
    //================================================

    lance: {

        //================================================
        // 6 — COUP D'ESTOC
        //================================================

        estoc_lance: {
            id: "ARME_006",
            action: "frappe",
            maniere: "estoc",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "lance",
                trajectoire: ["directe"],
                direction: ["avant"]
            },

            aliases: [
                "estoc de lance",
                "coup de lance",
                "pique de lance",
                "estocade à la lance"
            ],

            exemples: [
                "Yamato pousse sa lance directement vers Naruto",
                "Goku porte une estocade de lance vers Vegeta",
                "Luffy frappe Ulquiorra avec la pointe de sa lance",
                "Ichigo effectue un coup de lance direct vers Naruto",
                "Sasuke plante sa lance vers le torse de Madara"
            ]
        },


        //================================================
        // 7 — COUP DE LANCE CIRCULAIRE
        //================================================

        balayage_lance: {
            id: "ARME_007",
            action: "frappe",
            maniere: "balayage",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "TRAJECTOIRE",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "lance",
                trajectoire: ["circulaire"],
                direction: ["gauche", "droite"]
            },

            aliases: [
                "balayage de lance",
                "coup circulaire de lance",
                "balayage avec la lance",
                "lance circulaire"
            ],

            exemples: [
                "Yamato fait tourner sa lance vers la droite pour frapper Naruto",
                "Goku effectue un balayage circulaire de sa lance vers Vegeta",
                "Luffy balaie horizontalement avec sa lance vers Zoro",
                "Ichigo fait pivoter sa lance vers Ulquiorra",
                "Sasuke réalise un balayage de lance vers les jambes de Naruto"
            ]
        }
    },


    //================================================
    // 🥋 NUNCHAKU
    //================================================

    nunchaku: {

        //================================================
        // 8 — FRAPPE CIRCULAIRE
        //================================================

        frappe_circulaire: {
            id: "ARME_008",
            action: "frappe",
            maniere: "frappe_circulaire",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "TRAJECTOIRE",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "nunchaku",
                trajectoire: ["circulaire"],
                direction: ["gauche", "droite"]
            },

            aliases: [
                "frappe circulaire au nunchaku",
                "coup circulaire de nunchaku",
                "nunchaku circulaire"
            ],

            exemples: [
                "Yamato fait tourner son nunchaku vers Naruto avec une frappe circulaire",
                "Goku frappe Vegeta avec un mouvement circulaire de nunchaku",
                "Luffy porte une frappe circulaire de nunchaku au bras de Zoro",
                "Ichigo fait tournoyer son nunchaku vers Ulquiorra",
                "Sasuke frappe Naruto avec un nunchaku en mouvement circulaire"
            ]
        },


        //================================================
        // 9 — FRAPPE DIRECTE
        //================================================

        frappe_directe: {
            id: "ARME_009",
            action: "frappe",
            maniere: "frappe_directe",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "DIRECTION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "nunchaku",
                trajectoire: ["directe"],
                direction: ["avant"]
            },

            aliases: [
                "frappe directe au nunchaku",
                "coup direct de nunchaku",
                "nunchaku direct"
            ],

            exemples: [
                "Yamato frappe Naruto directement avec son nunchaku",
                "Goku donne un coup direct de nunchaku à Vegeta",
                "Luffy porte une frappe directe au visage de Zoro avec son nunchaku",
                "Ichigo frappe Ulquiorra directement avec son nunchaku",
                "Sasuke donne un coup de nunchaku direct vers Naruto"
            ]
        },


        //================================================
        // 10 — FRAPPE ROTATIVE
        //================================================

        frappe_rotative: {
            id: "ARME_010",
            action: "frappe",
            maniere: "frappe_rotative",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "ROTATION",
                "PARTIE_CORPS",
                "CIBLE",
                "DISTANCE",
                "INTENTION"
            ],

            params: {
                arme: "nunchaku",
                trajectoire: ["rotative"],
                rotation: {
                    type: "angle",
                    unite: ["°"]
                }
            },

            aliases: [
                "frappe rotative",
                "coup rotatif de nunchaku",
                "nunchaku rotatif",
                "frappe tournante au nunchaku"
            ],

            exemples: [
                "Yamato fait tourner son nunchaku à 360° avant de frapper Naruto",
                "Goku réalise une rotation de 180° avec son nunchaku vers Vegeta",
                "Luffy effectue une frappe rotative de nunchaku vers Zoro",
                "Ichigo fait tourner son nunchaku à 360° contre Ulquiorra",
                "Sasuke réalise une rotation avec son nunchaku avant de frapper Naruto"
            ]
        }

    }

},


 // ==================================================
 // BLOC DES ACTIONS DÉFENSIVES 🛡️ 
 // ==================================================      
  defense: {

    categorie: "defense",  

esquive: [

// ==================================================
// ESQUIVE 001 — RETRAIT DE LA TÊTE
// ==================================================

{
    id: "ESQUIVE_001",
    action: "esquive",
    maniere: "retrait_tete",

    structure: [
        "SUJET",
        "ACTION",
        "PARTIE_CORPS",
        "MOUVEMENT",
        "DIRECTION",
        "VITESSE",
        "DISTANCE",
        "AMPLITUDE",
        "CIBLE",
        "INTENTION"
    ],

    params: {
        partieCorps: [
            "tête",
            "tête entière",
            "visage",
            "menton"
        ],

        mouvement: [
            "retirer",
            "ramener",
            "reculer",
            "incliner"
        ],

        direction: [
            "arrière",
            "gauche",
            "droite"
        ],

        vitesse: [
            "vmax",
            "vitesse_maximale",
            "a_grande_vitesse",
            "a_pleine_vitesse",
            "rapidement",
            "tres_rapidement"
        ],

        distance: {
            type: "distance",
            unite: [
                "cm",
                "m"
            ],
            max: 50
        },

        amplitude: {
            type: "angle",
            unite: [
                "°"
            ],
            max: 90
        }
    },

    aliases: [
        "retrait de la tête",
        "retrait de tete",
        "retirer la tête",
        "retirer la tete",
        "reculer la tête",
        "reculer la tete",
        "ramener la tête",
        "ramener la tete",
        "esquive de tête",
        "esquive de tete"
    ],

    exemples: [
        "Yamato ramène sa tête vers l'arrière à VMax de 50cm pour laisser passer le coup de poing de Naruto dans le vide",
        "Goku retire sa tête vers l'arrière à pleine vitesse de 40cm pour esquiver le poing de Vegeta visant son visage",
        "Luffy incline sa tête vers la droite à grande vitesse de 30cm et 35° pour éviter le coup de poing de Zoro",
        "Ichigo recule sa tête vers l'arrière à VMax de 45cm pour laisser passer le crochet d'Ulquiorra",
        "Sasuke ramène sa tête vers la gauche à vitesse maximale de 25cm pour esquiver le coup de Naruto visant son menton"
    ]
},


// ==================================================
// ESQUIVE 002 — INCLINAISON DU BUSTE
// ==================================================

{
    id: "ESQUIVE_002",
    action: "esquive",
    maniere: "inclinaison",

    structure: [
        "SUJET",
        "ACTION",
        "PARTIE_CORPS",
        "MOUVEMENT",
        "DIRECTION",
        "VITESSE",
        "DISTANCE",
        "AMPLITUDE",
        "CIBLE",
        "INTENTION"
    ],

    params: {
        partieCorps: [
            "buste",
            "torse",
            "épaule gauche",
            "épaule droite"
        ],

        mouvement: [
            "incliner",
            "pencher",
            "courber",
            "dévier"
        ],

        direction: [
            "gauche",
            "droite",
            "arrière"
        ],

        vitesse: [
            "vmax",
            "vitesse_maximale",
            "a_grande_vitesse",
            "a_pleine_vitesse",
            "rapidement",
            "tres_rapidement"
        ],

        distance: {
            type: "distance",
            unite: [
                "cm",
                "m"
            ],
            max: 50
        },

        amplitude: {
            type: "angle",
            unite: [
                "°"
            ],
            max: 90
        }
    },

    aliases: [
        "inclinaison du buste",
        "incliner le buste",
        "pencher le buste",
        "esquive par inclinaison",
        "se penche",
        "se courbe",
        "dévier le buste",
        "devié le buste"
    ],

    exemples: [
        "Yamato incline son buste vers la gauche à VMax de 40cm et 45° pour esquiver le coup visant son torse",
        "Goku penche son torse vers la droite à pleine vitesse de 50cm pour laisser passer le crochet de Vegeta",
        "Luffy incline son buste vers l'arrière à grande vitesse de 35cm et 40° pour éviter le coup de Zoro",
        "Ichigo courbe son buste vers la gauche à VMax de 45cm et 50° pour esquiver le coup d'Ulquiorra visant son flanc",
        "Sasuke dévie son torse vers la droite à vitesse maximale de 30cm pour éviter l'attaque de Naruto"
    ]
},


// ==================================================
// ESQUIVE 003 — PIVOT
// ==================================================

{
    id: "ESQUIVE_003",
    action: "esquive",
    maniere: "pivot",

    structure: [
        "SUJET",
        "ACTION",
        "PARTIE_CORPS",
        "MOUVEMENT",
        "DIRECTION",
        "VITESSE",
        "DISTANCE",
        "AMPLITUDE",
        "CIBLE",
        "INTENTION"
    ],

    params: {
        partieCorps: [
            "buste",
            "torse",
            "bassin",
            "épaules"
        ],

        mouvement: [
            "pivoter",
            "tourner",
            "faire pivoter"
        ],

        direction: [
            "gauche",
            "droite"
        ],

        vitesse: [
            "vmax",
            "vitesse_maximale",
            "a_grande_vitesse",
            "a_pleine_vitesse",
            "rapidement",
            "tres_rapidement"
        ],

        distance: {
            type: "distance",
            unite: [
                "cm",
                "m"
            ],
            max: 50
        },

        amplitude: {
            type: "angle",
            unite: [
                "°"
            ],
            max: 90
        }
    },

    aliases: [
        "pivot",
        "esquive par pivot",
        "pivoter le buste",
        "tourner le buste",
        "rotation du buste",
        "rotation des épaules",
        "faire pivoter le corps"
    ],

    exemples: [
        "Yamato pivote son buste vers la gauche à VMax de 30cm et 60° pour laisser passer le coup de poing de Naruto",
        "Goku fait pivoter ses épaules vers la droite à pleine vitesse de 40cm et 70° pour esquiver le crochet de Vegeta",
        "Luffy tourne son torse vers la gauche à grande vitesse de 35cm et 60° pour éviter le coup circulaire de Zoro",
        "Ichigo pivote son buste vers la droite à VMax de 45cm et 80° pour laisser passer l'attaque d'Ulquiorra",
        "Sasuke fait pivoter son bassin et son buste vers la gauche à vitesse maximale de 30cm et 45° pour esquiver le coup de Naruto"
    ]
},


// ==================================================
// ESQUIVE 004 — DÉCALAGE CORPOREL
// ==================================================

{
    id: "ESQUIVE_004",
    action: "esquive",
    maniere: "decalage",

    structure: [
        "SUJET",
        "ACTION",
        "PARTIE_CORPS",
        "MOUVEMENT",
        "DIRECTION",
        "VITESSE",
        "DISTANCE",
        "CIBLE",
        "INTENTION"
    ],

    params: {
        partieCorps: [
            "corps",
            "buste",
            "torse",
            "bassin",
            "épaule gauche",
            "épaule droite"
        ],

        mouvement: [
            "décaler",
            "déplacer",
            "faire glisser",
            "écarter"
        ],

        direction: [
            "gauche",
            "droite"
        ],

        vitesse: [
            "vmax",
            "vitesse_maximale",
            "a_grande_vitesse",
            "a_pleine_vitesse",
            "rapidement",
            "tres_rapidement"
        ],

        distance: {
            type: "distance",
            unite: [
                "cm",
                "m"
            ],
            max: 50
        }
    },

    aliases: [
        "décalage",
        "decalage",
        "esquive par décalage",
        "se décaler",
        "se decaler",
        "décaler le corps",
        "decaler le corps",
        "déplacement latéral du corps"
    ],

    exemples: [
        "Yamato décale son corps vers la gauche à VMax de 40cm pour laisser passer le coup de poing de Naruto",
        "Goku déplace son buste vers la droite à pleine vitesse de 35cm pour esquiver l'attaque de Vegeta",
        "Luffy décale son torse vers la gauche à grande vitesse de 50cm pour éviter le coup de Zoro",
        "Ichigo fait glisser son corps vers la droite à VMax de 45cm pour sortir de la trajectoire du coup d'Ulquiorra",
        "Sasuke décale son épaule droite vers la gauche à vitesse maximale de 30cm pour esquiver le poing de Naruto"
    ]
},


// ==================================================
// ESQUIVE 005 — SAUT JAMBES PLIÉES
// ==================================================

{
    id: "ESQUIVE_005",
    action: "esquive",
    maniere: "saute_jambes_pliees",

    structure: [
        "SUJET",
        "ACTION",
        "PARTIE_CORPS",
        "MOUVEMENT",
        "TRAJECTOIRE",
        "VITESSE",
        "HAUTEUR",
        "CIBLE",
        "PARTIE_CORPS_CIBLE",
        "INTENTION"
    ],

    params: {
        partieCorps: [
            "jambes",
            "genoux",
            "corps"
        ],

        mouvement: [
            "sauter",
            "bondir",
            "se propulser"
        ],

        trajectoire: [
            "verticale"
        ],

        vitesse: [
            "vmax",
            "vitesse_maximale",
            "a_grande_vitesse",
            "a_pleine_vitesse",
            "rapidement",
            "tres_rapidement"
        ],

        hauteur: {
            type: "distance",
            unite: [
                "cm",
                "m"
            ],
            max: 50
        },

        partieCorpsCible: [
            "jambes",
            "genoux",
            "chevilles",
            "pieds"
        ]
    },

    aliases: [
        "esquive sautée jambes pliées",
        "esquive sautee jambes pliees",
        "saut jambes pliées",
        "saut jambes pliees",
        "saute par-dessus l'attaque",
        "bondit jambes pliées",
        "saut pour éviter les jambes",
        "saut pour eviter les jambes"
    ],

    exemples: [
        "Yamato saute à VMax avec les jambes pliées à 40cm de hauteur pour éviter le coup de pied de Naruto visant ses jambes",
        "Goku bondit rapidement jambes pliées à 50cm de hauteur pour esquiver le balayage de Vegeta visant ses chevilles",
        "Luffy se propulse à pleine vitesse avec les genoux pliés à 45cm de hauteur pour éviter le coup de pied de Zoro visant ses jambes",
        "Ichigo saute à grande vitesse jambes repliées à 50cm de hauteur pour laisser passer l'attaque d'Ulquiorra sous ses pieds",
        "Sasuke bondit à VMax avec les jambes pliées à 40cm de hauteur pour esquiver le balayage de Naruto"
    ]
}

],


blocage: [

    // ==================================================
    // BLOCAGE 001 — PAUME
    // ==================================================

    {
        id: "BLOCAGE_001",
        action: "blocage",
        maniere: "paume",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "main gauche",
                "main droite",
                "deux mains"
            ],

            zoneContact: [
                "paume gauche",
                "paume droite",
                "deux paumes"
            ],

            position: [
                "en opposition",
                "devant le visage",
                "devant la tête",
                "devant le torse",
                "devant l'abdomen",
                "devant le corps"
            ],

            mouvement: [
                "lever",
                "ramener",
                "avancer",
                "interposer",
                "placer"
            ]
        },

        aliases: [
            "blocage avec la paume",
            "bloquer avec la paume",
            "paume en opposition",
            "paume ouverte",
            "main ouverte en opposition",
            "interposer la paume"
        ],

        exemples: [
            "Yamato oppose sa paume droite devant son visage pour bloquer le poing de Naruto",
            "Goku place sa paume gauche devant son torse pour arrêter le coup de Vegeta",
            "Luffy interpose ses deux paumes devant son visage pour bloquer l'attaque de Zoro",
            "Ichigo avance sa paume droite pour stopper le poing d'Ulquiorra",
            "Sasuke ramène sa main gauche paume ouverte devant son visage pour bloquer le coup de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 002 — DOS DE LA MAIN
    // ==================================================

    {
        id: "BLOCAGE_002",
        action: "blocage",
        maniere: "dos_de_la_main",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "main gauche",
                "main droite"
            ],

            zoneContact: [
                "dos de la main gauche",
                "dos de la main droite"
            ],

            position: [
                "en opposition",
                "devant le visage",
                "devant le torse",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "ramener",
                "avancer",
                "interposer",
                "placer"
            ]
        },

        aliases: [
            "blocage avec le dos de la main",
            "bloquer avec le dos de la main",
            "dos de la main en opposition"
        ],

        exemples: [
            "Yamato place le dos de sa main droite devant son visage pour bloquer le coup de Naruto",
            "Goku interpose le dos de sa main gauche devant son torse pour arrêter l'attaque de Vegeta",
            "Luffy lève le dos de sa main droite pour bloquer le poing de Zoro",
            "Ichigo ramène le dos de sa main gauche devant son visage pour stopper l'attaque d'Ulquiorra",
            "Sasuke place le dos de sa main droite en opposition devant son visage pour bloquer Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 003 — AVANT-BRAS
    // ==================================================

    {
        id: "BLOCAGE_003",
        action: "blocage",
        maniere: "avant_bras",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "bras gauche",
                "bras droit"
            ],

            zoneContact: [
                "avant-bras gauche",
                "avant-bras droit"
            ],

            position: [
                "en opposition",
                "devant le visage",
                "devant le torse",
                "devant l'abdomen",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "ramener",
                "plier",
                "avancer",
                "interposer",
                "placer"
            ]
        },

        aliases: [
            "blocage avec l'avant-bras",
            "bloquer avec l'avant-bras",
            "avant-bras en opposition",
            "interposer l'avant-bras"
        ],

        exemples: [
            "Yamato lève son avant-bras droit devant son visage pour bloquer le poing de Naruto",
            "Goku place son avant-bras gauche devant son torse pour arrêter le coup de Vegeta",
            "Luffy interpose son avant-bras droit devant son visage pour bloquer Zoro",
            "Ichigo ramène son avant-bras gauche devant son torse pour stopper l'attaque d'Ulquiorra",
            "Sasuke place son avant-bras droit en opposition devant son abdomen pour bloquer Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 004 — BRAS EN L
    // ==================================================

    {
        id: "BLOCAGE_004",
        action: "blocage",
        maniere: "bras_en_L",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "bras gauche",
                "bras droit"
            ],

            zoneContact: [
                "avant-bras",
                "coude",
                "avant-bras et coude"
            ],

            position: [
                "en L",
                "bras en L",
                "devant le visage",
                "devant le torse"
            ],

            mouvement: [
                "lever",
                "plier",
                "ramener",
                "interposer"
            ]
        },

        aliases: [
            "bras en L",
            "garde en L",
            "bloquer en L",
            "bras plié en L"
        ],

        exemples: [
            "Yamato place son bras droit en L devant son visage pour bloquer le poing de Naruto avec son avant-bras",
            "Goku plie son bras gauche en L devant son torse pour arrêter le coup de Vegeta",
            "Luffy ramène son bras droit en L pour bloquer le crochet de Zoro",
            "Ichigo lève son bras gauche en L devant son visage pour bloquer l'attaque d'Ulquiorra",
            "Sasuke positionne son bras droit en L devant son torse pour protéger son corps contre Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 005 — BRAS EN X
    // ==================================================

    {
        id: "BLOCAGE_005",
        action: "blocage",
        maniere: "bras_en_X",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "deux bras"
            ],

            zoneContact: [
                "deux avant-bras",
                "avant-bras gauche et avant-bras droit"
            ],

            position: [
                "en X",
                "croisés devant le visage",
                "croisés devant le torse"
            ],

            mouvement: [
                "croiser",
                "ramener",
                "refermer"
            ]
        },

        aliases: [
            "bras en X",
            "blocage en X",
            "croiser les bras",
            "croiser les avant-bras",
            "garde en X",
            "bras croisés devant le visage",
            "bras croisés devant le torse"
        ],

        exemples: [
            "Yamato passe ses deux bras en X devant son visage pour bloquer le coup de Naruto avec ses avant-bras",
            "Goku croise ses deux avant-bras en X devant son torse pour arrêter l'attaque de Vegeta",
            "Luffy ramène ses deux bras en X devant son visage pour bloquer le coup de Zoro",
            "Ichigo croise ses avant-bras devant son torse pour bloquer l'attaque d'Ulquiorra",
            "Sasuke passe ses deux bras en X devant son visage pour bloquer le coup de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 006 — COUDE
    // ==================================================

    {
        id: "BLOCAGE_006",
        action: "blocage",
        maniere: "coude",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "bras gauche",
                "bras droit"
            ],

            zoneContact: [
                "coude gauche",
                "coude droit"
            ],

            position: [
                "en opposition",
                "devant le visage",
                "devant le torse",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "ramener",
                "plier",
                "interposer"
            ]
        },

        aliases: [
            "blocage avec le coude",
            "bloquer avec le coude",
            "coude en opposition",
            "interposer le coude"
        ],

        exemples: [
            "Yamato place son coude droit en opposition devant son torse pour bloquer le coup de Naruto",
            "Goku ramène son coude gauche devant son visage pour arrêter le crochet de Vegeta",
            "Luffy lève son coude droit pour bloquer l'attaque de Zoro",
            "Ichigo interpose son coude gauche devant son visage pour stopper le poing d'Ulquiorra",
            "Sasuke place son coude droit sur le côté pour bloquer le coup de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 007 — TIBIA
    // ==================================================

    {
        id: "BLOCAGE_007",
        action: "blocage",
        maniere: "tibia",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "jambe gauche",
                "jambe droite"
            ],

            zoneContact: [
                "tibia gauche",
                "tibia droit"
            ],

            position: [
                "en opposition",
                "devant le corps",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "plier",
                "interposer",
                "ramener"
            ]
        },

        aliases: [
            "blocage avec le tibia",
            "bloquer avec le tibia",
            "tibia en opposition",
            "interposer le tibia"
        ],

        exemples: [
            "Yamato lève son tibia gauche en opposition pour bloquer le coup de pied de Naruto",
            "Goku interpose son tibia droit pour arrêter le kick de Vegeta",
            "Luffy plie sa jambe gauche et place son tibia en opposition pour bloquer le coup de Zoro",
            "Ichigo ramène son tibia droit pour bloquer l'attaque d'Ulquiorra",
            "Sasuke lève son tibia droit en opposition pour bloquer le kick de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 008 — GENOU
    // ==================================================

    {
        id: "BLOCAGE_008",
        action: "blocage",
        maniere: "genou",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "jambe gauche",
                "jambe droite"
            ],

            zoneContact: [
                "genou gauche",
                "genou droit"
            ],

            position: [
                "en opposition",
                "devant le corps",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "plier",
                "remonter",
                "interposer"
            ]
        },

        aliases: [
            "blocage avec le genou",
            "bloquer avec le genou",
            "genou en opposition",
            "interposer le genou"
        ],

        exemples: [
            "Yamato lève son genou gauche en opposition pour bloquer le coup de pied de Naruto",
            "Goku remonte son genou droit pour arrêter le kick de Vegeta",
            "Luffy interpose son genou gauche pour bloquer le coup de Zoro",
            "Ichigo place son genou droit en opposition pour arrêter l'attaque d'Ulquiorra",
            "Sasuke lève son genou droit pour bloquer le coup de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 009 — SEMELLE / PLANTE DU PIED
    // ==================================================

    {
        id: "BLOCAGE_009",
        action: "blocage",
        maniere: "semelle",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "pied gauche",
                "pied droit"
            ],

            zoneContact: [
                "semelle",
                "plante du pied",
                "semelle gauche",
                "semelle droite"
            ],

            position: [
                "en opposition",
                "face à l'attaque",
                "devant le corps"
            ],

            mouvement: [
                "lever",
                "avancer",
                "interposer",
                "ramener"
            ]
        },

        aliases: [
            "blocage avec la semelle",
            "bloquer avec la semelle",
            "plante du pied en opposition",
            "semelle en opposition",
            "interposer la semelle"
        ],

        exemples: [
            "Yamato lève son pied gauche, semelle en opposition, pour bloquer le coup de pied de Naruto",
            "Goku interpose la plante de son pied droit pour arrêter le kick de Vegeta",
            "Luffy place sa semelle gauche face à l'attaque pour bloquer le coup de Zoro",
            "Ichigo avance son pied droit, semelle en opposition, pour stopper l'attaque d'Ulquiorra",
            "Sasuke lève sa semelle droite pour bloquer le coup de Naruto"
        ]
    },


    // ==================================================
    // BLOCAGE 010 — TALON
    // ==================================================

    {
        id: "BLOCAGE_010",
        action: "blocage",
        maniere: "talon",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "ZONE_CONTACT",
            "POSITION",
            "MOUVEMENT",
            "PARTIE_CORPS_CIBLE",
            "CIBLE",
            "INTENTION"
        ],

        params: {
            membre: [
                "pied gauche",
                "pied droit"
            ],

            zoneContact: [
                "talon gauche",
                "talon droit",
                "talon"
            ],

            position: [
                "en opposition",
                "devant le corps",
                "sur le côté"
            ],

            mouvement: [
                "lever",
                "ramener",
                "interposer",
                "placer"
            ]
        },

        aliases: [
            "blocage avec le talon",
            "bloquer avec le talon",
            "talon en opposition",
            "interposer le talon"
        ],

        exemples: [
            "Yamato ramène son pied gauche, talon en opposition, pour bloquer le coup de Naruto",
            "Goku interpose son talon droit pour arrêter l'attaque de Vegeta",
            "Luffy place son talon gauche en opposition pour bloquer le coup de Zoro",
            "Ichigo lève son talon droit pour arrêter l'attaque d'Ulquiorra",
            "Sasuke ramène son talon gauche pour bloquer le coup de Naruto"
        ]
    }, 
// ==================================================
// BLOCAGE 011 — DEUX MAINS JOINTES
// ==================================================

{
    id: "BLOCAGE_011",
    action: "blocage",
    maniere: "deux_mains_jointes",

    structure: [
        "SUJET",
        "ACTION",
        "MEMBRE",
        "ZONE_CONTACT",
        "POSITION",
        "MOUVEMENT",
        "ARME",
        "PARTIE_CORPS_CIBLE",
        "CIBLE",
        "INTENTION"
    ],

    params: {
        membre: [
            "deux mains"
        ],

        zoneContact: [
            "deux paumes",
            "paumes jointes"
        ],

        position: [
            "jointes en opposition",
            "devant le visage",
            "devant le torse",
            "devant le corps"
        ],

        mouvement: [
            "joindre",
            "lever",
            "interposer",
            "ramener",
            "placer"
        ],

        arme: [
            "aucune",
            "katana",
            "épée",
            "lance",
            "arme"
        ]
    },

    aliases: [
        "blocage avec les deux mains",
        "bloquer avec les deux mains",
        "deux mains jointes",
        "paumes jointes",
        "deux paumes jointes",
        "bloquer une arme avec les deux mains",
        "bloquer un coup avec les deux mains"
    ],

    exemples: [
        "Yamato joint ses deux mains, paumes en opposition, pour stopper le coup de poing de Naruto",
        "Goku place ses deux paumes jointes devant son visage pour bloquer le coup d'épée de Vegeta",
        "Luffy interpose ses deux paumes jointes devant son torse pour arrêter le coup de katana de Zoro",
        "Ichigo joint ses deux mains devant son corps pour stopper la lame d'Ulquiorra",
        "Sasuke lève ses deux paumes jointes pour bloquer le coup de Naruto"
    ]
}

], 

  parade: {

    // ==================================================
    // PARADES AVEC LES MAINS
    // ==================================================

    mains: [

        {
            id: "PARADE_MAIN_001",
            action: "parade",
            maniere: "poussee_paume",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["main gauche", "main droite"],
                zoneContact: ["paume"],
                mouvement: [
                    "poussee laterale",
                    "poussee vers l'exterieur"
                ],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["devier", "repousser", "ecarter"]
            },

            exemples: [
                "Yamato dévie le coup de poing de Naruto avec sa paume gauche par une poussée vers la gauche pour écarter son attaque",
                "Goku repousse le bras de Vegeta avec sa paume droite en poussant vers la droite pour dévier le coup",
                "Luffy dévie la main de Zoro avec sa paume gauche en la repoussant vers la gauche pour faire manquer l'attaque",
                "Ichigo repousse le coup de poing d'Ulquiorra avec sa paume droite vers la droite pour l'écarter de son visage",
                "Sasuke dévie le coup de Naruto avec sa paume gauche en poussant vers l'extérieur pour le faire passer à côté"
            ]
        },

        {
            id: "PARADE_MAIN_002",
            action: "parade",
            maniere: "revers_dos_main",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["main gauche", "main droite"],
                zoneContact: ["dos de la main"],
                mouvement: ["revers", "revers lateral"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["devier", "ecarter", "repousser"]
            },

            exemples: [
                "Yamato dévie le coup de poing de Naruto avec le revers de sa main gauche vers la gauche pour l'écarter",
                "Goku repousse la main de Vegeta avec le revers de sa main droite vers la droite pour dévier son attaque",
                "Luffy dévie le poing de Zoro avec le dos de sa main gauche en revers vers la gauche",
                "Ichigo repousse le bras d'Ulquiorra avec le revers de sa main droite vers la droite pour protéger son visage",
                "Sasuke dévie le coup de Naruto avec le dos de sa main gauche en revers vers la gauche"
            ]
        },

        {
            id: "PARADE_MAIN_003",
            action: "parade",
            maniere: "balayage_avant_bras",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["avant-bras gauche", "avant-bras droit"],
                zoneContact: ["avant-bras"],
                mouvement: ["balayage", "balayage lateral"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["devier", "repousser", "ecarter"]
            },

            exemples: [
                "Yamato balaie le bras de Naruto avec son avant-bras gauche vers la gauche pour dévier son coup",
                "Goku repousse l'avant-bras de Vegeta avec son avant-bras droit vers la droite",
                "Luffy balaie le poing de Zoro avec son avant-bras gauche vers la gauche pour écarter l'attaque",
                "Ichigo dévie le bras d'Ulquiorra avec son avant-bras droit vers la droite",
                "Sasuke repousse le coup de Naruto avec un balayage de son avant-bras gauche vers la gauche"
            ]
        },

        {
            id: "PARADE_MAIN_004",
            action: "parade",
            maniere: "mouvement_circulaire",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "ROTATION",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: [
                    "main gauche",
                    "main droite",
                    "avant-bras gauche",
                    "avant-bras droit"
                ],
                zoneContact: ["paume", "avant-bras", "dos de la main"],
                mouvement: ["rotation circulaire", "balayage circulaire"],
                sensMouvement: ["gauche", "droite"],
                rotation: {
                    type: "angle",
                    unite: ["°"]
                },
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "ecarter"]
            },

            exemples: [
                "Yamato dévie le bras de Naruto avec sa main gauche dans un mouvement circulaire vers la gauche pour rediriger son attaque",
                "Goku dévie le coup de Vegeta avec sa main droite par une rotation circulaire vers la droite",
                "Luffy balaie le poing de Zoro avec son avant-bras gauche dans un mouvement circulaire vers la gauche",
                "Ichigo dévie le bras d'Ulquiorra avec sa main droite dans un mouvement circulaire vers l'extérieur",
                "Sasuke redirige le coup de Naruto avec son avant-bras droit dans une rotation vers la droite"
            ]
        },

        {
            id: "PARADE_MAIN_005",
            action: "parade",
            maniere: "accompagnement",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["main gauche", "main droite"],
                zoneContact: ["paume", "dos de la main"],
                mouvement: [
                    "accompagnement lateral",
                    "accompagnement vers l'exterieur"
                ],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "faire manquer"]
            },

            exemples: [
                "Yamato accompagne le poing de Naruto avec sa main gauche vers la gauche pour le faire passer à côté de son visage",
                "Goku accompagne le bras de Vegeta avec sa main droite vers la droite pour dévier son attaque",
                "Luffy accompagne le coup de Zoro vers l'extérieur avec sa paume gauche",
                "Ichigo accompagne le poing d'Ulquiorra avec sa main droite vers la droite pour le faire manquer",
                "Sasuke accompagne le bras de Naruto vers la gauche pour rediriger son attaque"
            ]
        }
    ],


    // ==================================================
    // PARADES AVEC LES PIEDS
    // ==================================================

    pieds: [

        {
            id: "PARADE_PIED_001",
            action: "parade",
            maniere: "poussee_semelle",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["semelle", "plante du pied"],
                mouvement: ["poussee", "poussee laterale"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["repousser", "devier", "ecarter"]
            },

            exemples: [
                "Yamato repousse le bras de Naruto avec la semelle de son pied gauche vers la gauche",
                "Goku dévie le coup de pied de Vegeta avec la semelle de son pied droit vers la droite",
                "Luffy repousse la jambe de Zoro avec son pied gauche vers la gauche pour écarter l'attaque",
                "Ichigo dévie le coup bas d'Ulquiorra avec la plante de son pied droit vers la droite",
                "Sasuke repousse le tibia de Naruto avec la semelle de son pied gauche vers l'extérieur"
            ]
        },

        {
            id: "PARADE_PIED_002",
            action: "parade",
            maniere: "revers_du_pied",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["dos du pied"],
                mouvement: ["revers", "revers lateral"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["devier", "ecarter", "repousser"]
            },

            exemples: [
                "Yamato dévie le coup de pied de Naruto avec le revers de son pied gauche vers la gauche",
                "Goku repousse la jambe de Vegeta avec le revers de son pied droit vers la droite",
                "Luffy dévie le tibia de Zoro avec le dos de son pied gauche vers la gauche",
                "Ichigo repousse le coup bas d'Ulquiorra avec le revers de son pied droit vers la droite",
                "Sasuke dévie la jambe de Naruto avec le revers de son pied gauche vers la gauche"
            ]
        },

        {
            id: "PARADE_PIED_003",
            action: "parade",
            maniere: "balayage_circulaire_interieur",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["plante du pied", "bord interieur du pied"],
                mouvement: ["balayage circulaire interieur"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["devier", "rediriger", "ecarter"]
            },

            exemples: [
                "Yamato dévie la jambe de Naruto avec son pied gauche dans un balayage circulaire intérieur vers la gauche",
                "Goku redirige le coup de pied de Vegeta avec son pied droit dans un mouvement circulaire intérieur vers la droite",
                "Luffy écarte la jambe de Zoro avec un balayage intérieur de son pied gauche vers la gauche",
                "Ichigo dévie le tibia d'Ulquiorra avec son pied droit dans un mouvement circulaire intérieur vers la droite",
                "Sasuke redirige le pied de Naruto avec son pied gauche dans un balayage circulaire intérieur"
            ]
        },

        {
            id: "PARADE_PIED_004",
            action: "parade",
            maniere: "balayage_circulaire_exterieur",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["bord exterieur du pied", "dos du pied"],
                mouvement: ["balayage circulaire exterieur"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "ecarter", "repousser"]
            },

            exemples: [
                "Yamato écarte le coup de pied de Naruto avec son pied gauche dans un balayage circulaire extérieur vers la gauche",
                "Goku dévie la jambe de Vegeta avec son pied droit dans un mouvement circulaire extérieur vers la droite",
                "Luffy repousse le tibia de Zoro avec le bord extérieur de son pied gauche vers la gauche",
                "Ichigo dévie le coup bas d'Ulquiorra avec son pied droit dans un balayage extérieur vers la droite",
                "Sasuke écarte la jambe de Naruto avec son pied gauche dans un mouvement circulaire extérieur"
            ]
        },

        {
            id: "PARADE_PIED_005",
            action: "parade",
            maniere: "deviation_talon",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["talon"],
                mouvement: ["poussee du talon", "balayage du talon"],
                sensMouvement: ["gauche", "droite", "arriere"],
                directionDeviation: ["gauche", "droite", "arriere"],
                effet: ["devier", "repousser", "ecarter"]
            },

            exemples: [
                "Yamato dévie la jambe de Naruto avec le talon de son pied gauche vers la gauche",
                "Goku repousse le tibia de Vegeta avec son talon droit vers la droite",
                "Luffy écarte le coup bas de Zoro avec le talon de son pied gauche vers l'extérieur",
                "Ichigo dévie la jambe d'Ulquiorra avec son talon droit vers la droite",
                "Sasuke repousse le pied de Naruto avec son talon gauche vers l'arrière"
            ]
        },

        {
            id: "PARADE_PIED_006",
            action: "parade",
            maniere: "deviation_plante",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                membre: ["pied gauche", "pied droit"],
                zoneContact: ["plante du pied"],
                mouvement: ["accompagnement", "poussee", "balayage"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "ecarter"]
            },

            exemples: [
                "Yamato accompagne le coup de pied de Naruto avec la plante de son pied gauche vers la gauche",
                "Goku dévie la jambe de Vegeta avec la plante de son pied droit vers la droite",
                "Luffy repousse le tibia de Zoro avec la plante de son pied gauche vers l'extérieur",
                "Ichigo redirige le coup bas d'Ulquiorra avec la plante de son pied droit vers la droite",
                "Sasuke dévie le pied de Naruto avec la plante de son pied gauche vers la gauche"
            ]
        }
    ],


    // ==================================================
    // PARADES AVEC DES ARMES
    // ==================================================

    armes: [

        {
            id: "PARADE_ARME_001",
            action: "parade",
            maniere: "revers_arme",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                arme: ["katana", "epee", "lance", "nunchaku"],
                membre: ["main gauche", "main droite", "deux mains"],
                mouvement: ["revers", "balayage", "poussee"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "repousser", "ecarter"]
            },

            exemples: [
                "Yamato dévie le katana de Naruto avec son katana tenu de la main gauche dans un mouvement de revers vers la gauche",
                "Goku repousse l'épée de Vegeta avec son katana tenu de la main droite par un revers vers la droite",
                "Luffy dévie la lance de Zoro avec son épée tenue à deux mains dans un balayage vers la gauche",
                "Ichigo repousse le katana d'Ulquiorra avec son épée tenue de la main droite vers la droite",
                "Sasuke dévie l'arme de Naruto avec son katana tenu de la main gauche dans un mouvement de revers vers la gauche"
            ]
        },

        {
            id: "PARADE_ARME_002",
            action: "parade",
            maniere: "poussee_arme",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                arme: ["katana", "epee", "lance"],
                membre: ["main gauche", "main droite", "deux mains"],
                mouvement: ["poussee laterale", "poussee vers l'exterieur"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite"],
                effet: ["repousser", "devier", "ecarter"]
            },

            exemples: [
                "Yamato repousse le katana de Naruto avec son épée tenue de la main gauche par une poussée vers la gauche",
                "Goku écarte la lame de Vegeta avec son katana tenu de la main droite vers la droite",
                "Luffy repousse la lance de Zoro avec son épée tenue à deux mains vers la gauche",
                "Ichigo dévie l'épée d'Ulquiorra avec son katana de la main droite vers la droite",
                "Sasuke repousse l'arme de Naruto avec son katana tenu de la main gauche vers la gauche"
            ]
        },

        {
            id: "PARADE_ARME_003",
            action: "parade",
            maniere: "balayage_arme",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                arme: ["katana", "epee", "lance", "nunchaku"],
                membre: ["main gauche", "main droite", "deux mains"],
                mouvement: ["balayage lateral", "balayage circulaire"],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "ecarter"]
            },

            exemples: [
                "Yamato dévie l'épée de Naruto avec son katana de la main gauche par un balayage vers la gauche",
                "Goku redirige le katana de Vegeta avec son épée de la main droite par un balayage vers la droite",
                "Luffy écarte la lance de Zoro avec son arme tenue à deux mains dans un balayage circulaire vers la gauche",
                "Ichigo dévie l'arme d'Ulquiorra avec son katana de la main droite par un balayage vers la droite",
                "Sasuke repousse l'épée de Naruto avec son katana tenu de la main gauche par un balayage vers la gauche"
            ]
        },

        {
            id: "PARADE_ARME_004",
            action: "parade",
            maniere: "rotation_arme",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "ROTATION",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                arme: ["katana", "epee", "nunchaku"],
                membre: ["main gauche", "main droite", "deux mains"],
                mouvement: ["rotation", "rotation circulaire"],
                sensMouvement: ["gauche", "droite"],
                rotation: {
                    type: "angle",
                    unite: ["°"]
                },
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "ecarter"]
            },

            exemples: [
                "Yamato dévie le katana de Naruto avec son épée tenue de la main gauche dans une rotation vers la gauche",
                "Goku redirige l'épée de Vegeta avec son katana de la main droite dans une rotation vers la droite",
                "Luffy dévie la lame de Zoro avec son épée tenue à deux mains dans une rotation circulaire vers la gauche",
                "Ichigo écarte l'arme d'Ulquiorra avec son katana de la main droite dans une rotation vers la droite",
                "Sasuke redirige l'épée de Naruto avec son katana tenu de la main gauche dans une rotation vers la gauche"
            ]
        },

        {
            id: "PARADE_ARME_005",
            action: "parade",
            maniere: "accompagnement_arme",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "MEMBRE",
                "ZONE_CONTACT",
                "COTE_ATTAQUE",
                "POSITION_DEPART",
                "MOUVEMENT",
                "SENS_MOUVEMENT",
                "DIRECTION_DEVIATION",
                "EFFET",
                "PARTIE_CORPS_CIBLE",
                "CIBLE",
                "INTENTION"
            ],

            params: {
                arme: ["katana", "epee", "lance"],
                membre: ["main gauche", "main droite", "deux mains"],
                mouvement: [
                    "accompagnement",
                    "accompagnement lateral",
                    "accompagnement circulaire"
                ],
                sensMouvement: ["gauche", "droite"],
                directionDeviation: ["gauche", "droite", "exterieur"],
                effet: ["devier", "rediriger", "faire manquer"]
            },

            exemples: [
                "Yamato accompagne la lame du katana de Naruto avec son épée vers la gauche pour la faire passer à côté",
                "Goku accompagne l'épée de Vegeta avec son katana vers la droite pour rediriger son attaque",
                "Luffy accompagne la lance de Zoro avec son épée tenue à deux mains vers l'extérieur",
                "Ichigo accompagne la lame d'Ulquiorra avec son katana de la main droite vers la droite",
                "Sasuke accompagne l'arme de Naruto avec son katana tenu de la main gauche vers la gauche"
            ]
        }
    ]
}    
            
    // ==================================================
    // PARADE — TÊTE / CORPS
    // ==================================================

    {
        id: "PAR_006",
        categorie: "parade",
        famille: "blocage_corps",

        structure: [
            "SUJET",
            "ACTION",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto protège son visage avec son avant-bras",
            "Naruto protège sa mâchoire avec son bras",
            "Naruto protège sa tête avec ses deux mains",
            "Naruto couvre son visage avec ses bras",
            "Naruto protège son abdomen avec son avant-bras",
            "Naruto couvre son torse avec ses bras",
            "Naruto protège ses côtes avec son coude",
            "Naruto protège son ventre avec son bras gauche",
            "Naruto protège son flanc droit avec son bras droit",
            "Naruto ferme sa garde pour protéger son visage"
        ]
    },

    // ==================================================
    // PARADE — OPPOSITION
    // ==================================================

    {
        id: "PAR_007",
        categorie: "parade",
        famille: "blocage_opposition",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "CIBLE",
            "MANIERE"
        ],

        exemples: [
            "Naruto bloque le coup en mettant sa paume gauche en opposition",
            "Naruto bloque le coup en mettant sa paume droite en opposition",
            "Naruto pare le poing en mettant son avant-bras gauche en opposition",
            "Naruto pare le poing en mettant son avant-bras droit en opposition",
            "Naruto intercepte l'attaque avec sa main gauche en opposition",
            "Naruto intercepte l'attaque avec sa main droite en opposition",
            "Naruto place son bras gauche en opposition au coup",
            "Naruto place son bras droit en opposition au coup",
            "Naruto met ses deux paumes en opposition à l'attaque",
            "Naruto met son tibia droit en opposition au coup de pied"
        ]
    },

    // ==================================================
    // PARADE — DÉVIATION
    // ==================================================

    {
        id: "PAR_008",
        categorie: "parade",
        famille: "deviation",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto dévie le coup avec sa main droite vers la gauche",
            "Naruto dévie le coup avec sa main gauche vers la droite",
            "Naruto dévie le poing avec son avant-bras droit vers l'extérieur",
            "Naruto dévie le poing avec son avant-bras gauche vers l'extérieur",
            "Naruto détourne le coup avec sa paume droite",
            "Naruto détourne le coup avec sa paume gauche",
            "Naruto repousse le poing sur le côté avec son avant-bras droit",
            "Naruto repousse l'attaque sur le côté avec son avant-bras gauche",
            "Naruto dévie le coup vers la droite avec sa main gauche",
            "Naruto dévie le coup vers la gauche avec sa main droite"
        ]
    },

    // ==================================================
    // PARADE — COMPLÈTE
    // ==================================================

    {
        id: "PAR_009",
        categorie: "parade",
        famille: "parade_complete",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup avec sa paume gauche en opposition à son visage",
            "Naruto bloque le coup avec sa paume droite en opposition à sa mâchoire",
            "Naruto pare le poing avec son avant-bras gauche devant son visage",
            "Naruto pare le poing avec son avant-bras droit devant sa tête",
            "Naruto bloque le coup avec son bras gauche devant son torse",
            "Naruto bloque le coup avec son bras droit devant son abdomen",
            "Naruto pare le kick avec son tibia gauche devant sa jambe",
            "Naruto pare le kick avec son tibia droit devant son genou",
            "Naruto dévie le coup avec sa main droite vers la gauche",
            "Naruto dévie l'attaque avec sa main gauche vers la droite"
        ]
    }
],


// ==================================================
// SAISIES
// ==================================================

saisie: [

    // ==================================================
    // SAISIE — POIGNET
    // ==================================================

    {
        id: "SAI_001",
        categorie: "saisie",
        famille: "saisie_poignet",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit le poignet de Goku de la main droite",
            "Naruto saisit le poignet de Goku de la main gauche",
            "Naruto attrape le poignet droit de Goku avec sa main droite",
            "Naruto attrape le poignet gauche de Goku avec sa main gauche",
            "Naruto agrippe le poignet de Goku avec sa main droite",
            "Naruto agrippe le poignet de Goku avec sa main gauche",
            "Naruto empoigne le poignet de Goku de la main droite",
            "Naruto empoigne le poignet de Goku de la main gauche",
            "Naruto bloque le poignet de Goku avec sa main droite",
            "Naruto contrôle le poignet de Goku avec sa main gauche"
        ]
    },

    // ==================================================
    // SAISIE — BRAS / AVANT-BRAS
    // ==================================================

    {
        id: "SAI_002",
        categorie: "saisie",
        famille: "saisie_bras",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit le bras de Goku de la main droite",
            "Naruto saisit le bras de Goku de la main gauche",
            "Naruto attrape l'avant-bras de Goku avec sa main droite",
            "Naruto attrape l'avant-bras de Goku avec sa main gauche",
            "Naruto agrippe le bras droit de Goku",
            "Naruto agrippe le bras gauche de Goku",
            "Naruto empoigne l'avant-bras de Goku",
            "Naruto contrôle le bras de Goku avec sa main droite",
            "Naruto retient le bras de Goku avec sa main gauche",
            "Naruto saisit l'avant-bras de Goku de la main droite"
        ]
    },

    // ==================================================
    // SAISIE — ÉPAULE
    // ==================================================

    {
        id: "SAI_003",
        categorie: "saisie",
        famille: "saisie_epaule",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit l'épaule de Goku de la main droite",
            "Naruto saisit l'épaule de Goku de la main gauche",
            "Naruto attrape l'épaule droite de Goku avec sa main droite",
            "Naruto attrape l'épaule gauche de Goku avec sa main gauche",
            "Naruto agrippe l'épaule de Goku",
            "Naruto empoigne l'épaule de Goku de la main droite",
            "Naruto contrôle l'épaule de Goku avec sa main gauche",
            "Naruto retient Goku par l'épaule droite",
            "Naruto saisit Goku à l'épaule gauche",
            "Naruto attrape Goku par l'épaule avec sa main droite"
        ]
    },

    // ==================================================
    // SAISIE — COL / VÊTEMENT
    // ==================================================

    {
        id: "SAI_004",
        categorie: "saisie",
        famille: "saisie_col",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit Goku par le col de la main droite",
            "Naruto saisit Goku par le col de la main gauche",
            "Naruto attrape Goku par le col avec sa main droite",
            "Naruto attrape Goku par le col avec sa main gauche",
            "Naruto agrippe le col de Goku",
            "Naruto empoigne le col de Goku de la main droite",
            "Naruto retient Goku par son vêtement",
            "Naruto saisit le vêtement de Goku avec sa main droite",
            "Naruto attrape le haut de Goku avec sa main gauche",
            "Naruto saisit la tenue de Goku pour le retenir"
        ]
    },

    // ==================================================
    // SAISIE — CORPS
    // ==================================================

    {
        id: "SAI_005",
        categorie: "saisie",
        famille: "saisie_corps",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit Goku par le bras",
            "Naruto attrape Goku par l'épaule",
            "Naruto agrippe Goku au torse",
            "Naruto saisit Goku à la taille",
            "Naruto attrape le corps de Goku avec ses deux bras",
            "Naruto empoigne Goku au niveau du torse",
            "Naruto retient Goku par la taille",
            "Naruto saisit Goku au niveau des côtes",
            "Naruto agrippe Goku au niveau du dos",
            "Naruto contrôle le corps de Goku avec ses deux bras"
        ]
    },

    // ==================================================
    // SAISIE — JAMBES
    // ==================================================

    {
        id: "SAI_006",
        categorie: "saisie",
        famille: "saisie_jambe",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit la jambe de Goku de la main droite",
            "Naruto saisit la jambe de Goku de la main gauche",
            "Naruto attrape la cuisse de Goku avec sa main droite",
            "Naruto attrape le mollet de Goku avec sa main gauche",
            "Naruto agrippe la cheville de Goku",
            "Naruto empoigne le tibia de Goku",
            "Naruto saisit le genou de Goku",
            "Naruto contrôle la jambe de Goku avec ses deux mains",
            "Naruto retient le pied de Goku avec sa main droite",
            "Naruto attrape la cheville droite de Goku"
        ]
    },

    // ==================================================
    // SAISIE — DEUX MAINS
    // ==================================================

    {
        id: "SAI_007",
        categorie: "saisie",
        famille: "saisie_deux_mains",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto saisit le bras de Goku avec ses deux mains",
            "Naruto attrape le poignet de Goku avec ses deux mains",
            "Naruto agrippe l'avant-bras de Goku avec ses deux mains",
            "Naruto saisit l'épaule de Goku avec ses deux mains",
            "Naruto empoigne Goku à deux mains",
            "Naruto contrôle le bras de Goku avec ses deux mains",
            "Naruto retient Goku avec ses deux mains",
            "Naruto saisit la taille de Goku avec ses deux mains",
            "Naruto attrape le torse de Goku à deux mains",
            "Naruto agrippe le corps de Goku avec ses deux mains"
        ]
    },

    // ==================================================
    // SAISIE — AVEC INTENTION
    // ==================================================

    {
        id: "SAI_008",
        categorie: "saisie",
        famille: "saisie_intention",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "INTENTION"
        ],

        exemples: [
            "Naruto saisit le poignet de Goku de la main droite pour l'immobiliser",
            "Naruto saisit le poignet de Goku de la main gauche pour empêcher son attaque",
            "Naruto attrape le bras de Goku avec sa main droite pour le contrôler",
            "Naruto agrippe l'avant-bras de Goku avec sa main gauche pour bloquer son mouvement",
            "Naruto saisit l'épaule de Goku pour l'empêcher de reculer",
            "Naruto attrape le bras de Goku pour le maintenir sur place",
            "Naruto saisit la jambe de Goku pour stopper son déplacement",
            "Naruto agrippe la cheville de Goku pour l'empêcher de s'éloigner",
            "Naruto saisit le col de Goku pour le retenir",
            "Naruto attrape Goku par le bras pour préparer une projection"
        ]
    },

    // ==================================================
    // SAISIE — VMAX / DISTANCE
    // ==================================================

    {
        id: "SAI_009",
        categorie: "saisie",
        famille: "saisie_approche",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE"
        ],

        exemples: [
            "Naruto avance de 2m puis saisit le poignet de Goku de la main droite",
            "Naruto fonce sur 3m puis attrape le bras de Goku",
            "Naruto se rapproche de 1m pour saisir l'avant-bras de Goku",
            "Naruto parcourt 2m pour saisir le poignet de Goku",
            "Naruto court sur 3m vers Goku puis saisit son bras",
            "Naruto se déplace de 2m vers Goku pour attraper son poignet",
            "Naruto avance à VMAX sur 2m puis saisit le bras de Goku",
            "Naruto fonce à VMAX sur 3m pour agripper le poignet de Goku",
            "Naruto se rapproche à VMAX puis saisit l'épaule de Goku",
            "Naruto court à VMAX sur 2m pour attraper l'avant-bras de Goku"
        ]
    },

    // ==================================================
    // SAISIE — COMPLÈTE
    // ==================================================

    {
        id: "SAI_010",
        categorie: "saisie",
        famille: "saisie_complete",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE",
            "DISTANCE",
            "INTENTION"
        ],

        exemples: [
            "Naruto avance de 2m à VMAX puis saisit le poignet de Goku de la main droite pour l'immobiliser",
            "Naruto avance de 2m à VMAX puis saisit le poignet de Goku de la main gauche pour l'immobiliser",
            "Naruto fonce sur 3m à VMAX puis attrape le bras droit de Goku avec sa main droite",
            "Naruto court sur 2m à VMAX puis agrippe l'avant-bras de Goku pour empêcher son attaque",
            "Naruto se rapproche à VMAX sur 2m puis saisit l'épaule de Goku pour le contrôler",
            "Naruto avance sur 3m à VMAX puis attrape la jambe de Goku pour stopper son déplacement",
            "Naruto se déplace de 2m à VMAX puis saisit la cheville de Goku pour l'immobiliser",
            "Naruto fonce vers Goku à VMAX puis saisit son poignet de la main droite pour préparer une projection",
            "Naruto court sur 3m à VMAX vers Goku puis agrippe son bras avec ses deux mains",
            "Naruto avance de 2m à VMAX puis saisit Goku par le col pour le retenir"
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
