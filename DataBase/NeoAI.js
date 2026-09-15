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

    course: {

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
                "arriere",
                "gauche",
                "droite"
            ],

            trajectoire: [
                "frontale",
                "circulaire",
                "diagonale",
                "zig_zag"
            ],

            vitesse: [
                "vmax",
                "vitesse_maximale",
                "a_grande_vitesse",
                "a_pleine_vitesse",
                "tres_rapidement",
                "rapidement"
            ],

            distance: {
                type: "distance",
                unite: ["cm", "m", "km"]
            }
        },

        exemples: [
            "Yamato court vers Naruto en trajectoire frontale vers l'avant à VMax sur 5m pour l'atteindre",

            "Naruto se précipite vers Sasuke en trajectoire circulaire vers la droite à grande vitesse sur 4m pour le contourner",

            "Goku accélère vers Vegeta en diagonale vers la gauche à vitesse maximale sur 6m pour l'intercepter",

            "Ichigo sprinte vers Ulquiorra en zig zag vers l'avant à pleine vitesse sur 5m pour se rapprocher de lui",

            "Sasuke se déplace vers Naruto en trajectoire frontale vers l'avant très rapidement sur 3m pour l'atteindre",

            "Luffy file vers Zoro en trajectoire circulaire vers la gauche à grande vitesse sur 4m pour passer sur son côté",

            "Vegeta progresse vers Goku en diagonale vers la droite à VMax sur 5m pour réduire la distance",

            "Kakashi se lance vers Obito en zig zag vers l'avant rapidement sur 4m pour éviter son attaque",

            "Yamato avance vers Madara en diagonale vers la gauche à pleine vitesse sur 5m pour arriver à portée",

            "Naruto traverse rapidement la distance vers Sasuke en trajectoire circulaire vers la droite à vitesse maximale sur 5m pour le contourner"
        ]
    },

    // ======================================================
    // PROCHAINE ACTION : SAUT
    // ======================================================

    saut: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // SAUT
        ]
    },

    // ======================================================
    // PROCHAINE ACTION : BOND
    // ======================================================

    bond: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // BOND
        ]
    },

    // ======================================================
    // PROCHAINE ACTION : VOL
    // ======================================================

    vol: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // VOL
        ]
    },
    // ======================================================
    // PROCHAINE ACTION : SAUT
    // ======================================================

    saut: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // SAUT
        ]
    },

    // ======================================================
    // PROCHAINE ACTION : BOND
    // ======================================================

    bond: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // BOND
        ]
    },

    // ======================================================
    // PROCHAINE ACTION : VOL
    // ======================================================

    vol: {

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "TRAJECTOIRE",
            "VITESSE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],

        params: {
            // À compléter
        },

        exemples: [
            // VOL
        ]
    },

    {
        id: "SAUT_004",
        famille: "vertical_hauteur_cible",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "HAUTEUR",
            "CIBLE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },
        exemples: [
            "Yamato saute à 1m de hauteur pour atteindre Naruto",
            "Naruto saute à 2m de hauteur vers Sasuke",
            "Goku saute à 3m de hauteur pour rejoindre Vegeta",
            "Ichigo saute à 50cm de hauteur vers Ulquiorra",
            "Sasuke saute à 1,5m de hauteur pour atteindre Naruto"
        ]
    },

    {
        id: "SAUT_005",
        famille: "vertical_distance",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "DISTANCE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },
        exemples: [
            "Yamato saute verticalement sur 1m",
            "Naruto saute vers le haut sur 2m",
            "Goku saute verticalement sur 3m",
            "Ichigo effectue un saut de 50cm",
            "Sasuke fait un saut vertical sur 1,5m"
        ]
    },

    {
        id: "SAUT_006",
        famille: "vertical_distance_hauteur",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "DISTANCE",
            "HAUTEUR",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            },
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            }
        },
        exemples: [
            "Yamato saute verticalement sur 1m jusqu'à 1m de hauteur",
            "Naruto saute sur 2m jusqu'à 2m de hauteur",
            "Goku effectue un saut de 3m jusqu'à 3m de hauteur",
            "Ichigo saute sur 50cm jusqu'à 50cm de hauteur",
            "Sasuke fait un saut sur 1,5m jusqu'à 1,5m de hauteur"
        ]
    },

    {
        id: "SAUT_007",
        famille: "vertical_vitesse",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "VITESSE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            vitesse: {
                type: "vitesse",
                unite: ["m/s", "km/h"]
            }
        },
        exemples: [
            "Yamato saute verticalement à 6 m/s",
            "Naruto saute vers le haut à 8 m/s",
            "Goku saute verticalement à 10 m/s",
            "Ichigo effectue un saut à 7 m/s",
            "Sasuke saute vers le haut à 9 m/s"
        ]
    },

    {
        id: "SAUT_008",
        famille: "vertical_cible_vitesse",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "CIBLE",
            "VITESSE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            vitesse: {
                type: "vitesse",
                unite: ["m/s", "km/h"]
            }
        },
        exemples: [
            "Yamato saute verticalement vers Naruto à 6 m/s",
            "Naruto saute vers Sasuke à 8 m/s",
            "Goku saute vers Vegeta à 10 m/s",
            "Ichigo saute vers Ulquiorra à 7 m/s",
            "Sasuke saute vers Naruto à 9 m/s"
        ]
    },

    {
        id: "SAUT_009",
        famille: "vertical_distance_vitesse",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "DISTANCE",
            "VITESSE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            },
            vitesse: {
                type: "vitesse",
                unite: ["m/s", "km/h"]
            }
        },
        exemples: [
            "Yamato saute verticalement sur 1m à 6 m/s",
            "Naruto saute sur 2m à 8 m/s",
            "Goku effectue un saut de 3m à 10 m/s",
            "Ichigo saute sur 50cm à 7 m/s",
            "Sasuke fait un saut vertical de 1,5m à 9 m/s"
        ]
    },

    {
        id: "SAUT_010",
        famille: "vertical_complet",
        structure: [
            "SUJET",
            "ACTION",
            "TRAJECTOIRE",
            "CIBLE",
            "DISTANCE",
            "HAUTEUR",
            "VITESSE",
            "INTENTION"
        ],
        params: {
            trajectoire: ["vertical", "vers_le_haut"],
            distance: {
                type: "distance",
                unite: ["cm", "m"]
            },
            hauteur: {
                type: "distance",
                unite: ["cm", "m"]
            },
            vitesse: {
                type: "vitesse",
                unite: ["m/s", "km/h"]
            }
        },
        exemples: [
            "Yamato saute verticalement vers Naruto sur 1m jusqu'à 2m de hauteur à 6 m/s",
            "Goku saute vers Vegeta sur 2m jusqu'à 3m de hauteur à 10 m/s",
            "Naruto saute vers Sasuke sur 1,5m jusqu'à 2m de hauteur à 8 m/s",
            "Ichigo saute vers Ulquiorra sur 50cm jusqu'à 1m de hauteur à 7 m/s",
            "Luffy saute vers Zoro sur 2m jusqu'à 2,5m de hauteur à 9 m/s"
        
            ]
        }

    ], 

],

    // ======================================================
    // MODÈLES BOND
    // BOND VERTICAL — 001 à 010
    // 5 EXEMPLES PAR MODÈLE
    // ======================================================

    bond: [

        {
            id: "BOND_001",
            famille: "vertical_simple",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"]
            },
            exemples: [
                "Yamato bondit verticalement pour s'élever",
                "Naruto bondit vers le haut pour prendre de la hauteur",
                "Goku bondit droit vers le ciel",
                "Ichigo effectue un bond vertical pour s'élever",
                "Sasuke fait un bond vertical pour prendre de la hauteur"
            ]
        },

        {
            id: "BOND_002",
            famille: "vertical_hauteur",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "HAUTEUR",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                hauteur: {
                    type: "distance",
                    unite: ["cm", "m"]
                }
            },
            exemples: [
                "Yamato bondit verticalement à 1m de hauteur",
                "Naruto bondit vers le haut à 2m de hauteur",
                "Goku bondit à 3 mètres de hauteur",
                "Ichigo effectue un bond vertical de 50cm",
                "Sasuke fait un bond vertical de 1,5m de hauteur"
            ]
        },

        {
            id: "BOND_003",
            famille: "vertical_cible",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "CIBLE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"]
            },
            exemples: [
                "Yamato bondit verticalement pour atteindre Naruto",
                "Naruto bondit vers le haut en direction de Sasuke",
                "Goku bondit verticalement vers Vegeta",
                "Ichigo bondit vers Ulquiorra",
                "Sasuke bondit vers le haut pour rejoindre Naruto"
            ]
        },

        {
            id: "BOND_004",
            famille: "vertical_hauteur_cible",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "HAUTEUR",
                "CIBLE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                hauteur: {
                    type: "distance",
                    unite: ["cm", "m"]
                }
            },
            exemples: [
                "Yamato bondit à 1m de hauteur pour atteindre Naruto",
                "Naruto bondit à 2m de hauteur vers Sasuke",
                "Goku bondit à 3m de hauteur pour rejoindre Vegeta",
                "Ichigo bondit à 50cm de hauteur vers Ulquiorra",
                "Sasuke bondit à 1,5m de hauteur pour atteindre Naruto"
            ]
        },

        {
            id: "BOND_005",
            famille: "vertical_distance",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "DISTANCE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                distance: {
                    type: "distance",
                    unite: ["cm", "m"]
                }
            },
            exemples: [
                "Yamato bondit verticalement sur 1m",
                "Naruto bondit vers le haut sur 2m",
                "Goku bondit verticalement sur 3m",
                "Ichigo effectue un bond de 50cm",
                "Sasuke fait un bond vertical sur 1,5m"
            ]
        },

        {
            id: "BOND_006",
            famille: "vertical_distance_hauteur",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "DISTANCE",
                "HAUTEUR",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                distance: {
                    type: "distance",
                    unite: ["cm", "m"]
                },
                hauteur: {
                    type: "distance",
                    unite: ["cm", "m"]
                }
            },
            exemples: [
                "Yamato bondit verticalement sur 1m jusqu'à 1m de hauteur",
                "Naruto bondit sur 2m jusqu'à 2m de hauteur",
                "Goku effectue un bond de 3m jusqu'à 3m de hauteur",
                "Ichigo bondit sur 50cm jusqu'à 50cm de hauteur",
                "Sasuke fait un bond sur 1,5m jusqu'à 1,5m de hauteur"
            ]
        },

        {
            id: "BOND_007",
            famille: "vertical_vitesse",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "VITESSE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                vitesse: {
                    type: "vitesse",
                    unite: ["m/s", "km/h"]
                }
            },
            exemples: [
                "Yamato bondit verticalement à 6 m/s",
                "Naruto bondit vers le haut à 8 m/s",
                "Goku bondit verticalement à 10 m/s",
                "Ichigo effectue un bond à 7 m/s",
                "Sasuke bondit vers le haut à 9 m/s"
            ]
        },

        {
            id: "BOND_008",
            famille: "vertical_cible_vitesse",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "CIBLE",
                "VITESSE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                vitesse: {
                    type: "vitesse",
                    unite: ["m/s", "km/h"]
                }
            },
            exemples: [
                "Yamato bondit verticalement vers Naruto à 6 m/s",
                "Naruto bondit vers Sasuke à 8 m/s",
                "Goku bondit vers Vegeta à 10 m/s",
                "Ichigo bondit vers Ulquiorra à 7 m/s",
                "Sasuke bondit vers Naruto à 9 m/s"
            ]
        },

        {
            id: "BOND_009",
            famille: "vertical_distance_vitesse",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "DISTANCE",
                "VITESSE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                distance: {
                    type: "distance",
                    unite: ["cm", "m"]
                },
                vitesse: {
                    type: "vitesse",
                    unite: ["m/s", "km/h"]
                }
            },
            exemples: [
                "Yamato bondit verticalement sur 1m à 6 m/s",
                "Naruto bondit sur 2m à 8 m/s",
                "Goku effectue un bond de 3m à 10 m/s",
                "Ichigo bondit sur 50cm à 7 m/s",
                "Sasuke fait un bond vertical de 1,5m à 9 m/s"
            ]
        },

        {
            id: "BOND_010",
            famille: "vertical_complet",
            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "CIBLE",
                "DISTANCE",
                "HAUTEUR",
                "VITESSE",
                "INTENTION"
            ],
            params: {
                trajectoire: ["vertical", "vers_le_haut"],
                distance: {
                    type: "distance",
                    unite: ["cm", "m"]
                },
                hauteur: {
                    type: "distance",
                    unite: ["cm", "m"]
                },
                vitesse: {
                    type: "vitesse",
                    unite: ["m/s", "km/h"]
                }
            },
            exemples: [
                "Yamato bondit verticalement vers Naruto sur 1m jusqu'à 2m de hauteur à 6 m/s",
                "Goku bondit vers Vegeta sur 2m jusqu'à 3m de hauteur à 10 m/s",
                "Naruto bondit vers Sasuke sur 1,5m jusqu'à 2m de hauteur à 8 m/s",
                "Ichigo bondit vers Ulquiorra sur 50cm jusqu'à 1m de hauteur à 7 m/s",
                "Luffy bondit vers Zoro sur 2m jusqu'à 2,5m de hauteur à 9 m/s"
            ]
        }
     
                           
                                    
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

    // ==================================================
    // ESQUIVE — LATÉRALE
    // ==================================================

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
            "Naruto esquive vers la gauche",
            "Naruto évite l'attaque en allant sur le côté droit",
            "Naruto évite l'attaque en allant sur le côté gauche",
            "Naruto se déporte vers la droite",
            "Naruto se déporte vers la gauche",
            "Naruto fait un pas sur le côté droit pour éviter le coup",
            "Naruto fait un pas sur le côté gauche pour éviter le coup",
            "Naruto se décale rapidement vers la droite",
            "Naruto se décale rapidement vers la gauche"
        ]
    },

    // ==================================================
    // ESQUIVE — LATÉRALE + VMAX
    // ==================================================

    {
        id: "ESQ_002",
        categorie: "esquive",
        famille: "esquive_laterale_vmax",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "VITESSE"
        ],

        exemples: [
            "Naruto esquive le coup vers la droite à VMAX",
            "Naruto esquive le coup vers la gauche à VMAX",
            "Naruto se déporte à VMAX vers la droite pour éviter le coup",
            "Naruto se déporte à VMAX vers la gauche pour éviter le coup",
            "Naruto esquive latéralement à VMAX vers la droite",
            "Naruto esquive latéralement à VMAX vers la gauche",
            "Naruto part sur le côté droit à VMAX pour éviter l'attaque",
            "Naruto part sur le côté gauche à VMAX pour éviter l'attaque",
            "Naruto se décale à vitesse maximale vers la droite",
            "Naruto se décale à vitesse maximale vers la gauche"
        ]
    },

    // ==================================================
    // ESQUIVE — ABAISSEMENT
    // ==================================================

    {
        id: "ESQ_003",
        categorie: "esquive",
        famille: "esquive_basse",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "CIBLE"
        ],

        exemples: [
            "Naruto esquive le coup en se baissant",
            "Naruto évite le coup en se baissant",
            "Naruto se baisse pour laisser passer le coup",
            "Naruto fléchit les jambes pour éviter l'attaque",
            "Naruto s'accroupit pour esquiver le coup",
            "Naruto se penche vers le bas pour éviter le coup",
            "Naruto abaisse son corps pour laisser passer l'attaque au-dessus de lui",
            "Naruto se baisse pour laisser passer le poing au-dessus de sa tête",
            "Naruto descend sous le coup pour l'éviter",
            "Naruto plonge vers le bas pour éviter l'attaque"
        ]
    },

    // ==================================================
    // ESQUIVE — ABAISSEMENT + VMAX
    // ==================================================

    {
        id: "ESQ_004",
        categorie: "esquive",
        famille: "esquive_basse_vmax",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "VITESSE",
            "CIBLE"
        ],

        exemples: [
            "Naruto esquive le coup en se baissant VMAX pour laisser passer le coup au-dessus de sa tête",
            "Naruto se baisse à VMAX pour éviter le poing visant sa tête",
            "Naruto s'accroupit à VMAX pour laisser passer l'attaque au-dessus de lui",
            "Naruto fléchit les jambes à VMAX pour esquiver le coup",
            "Naruto abaisse son corps à VMAX pour éviter l'attaque",
            "Naruto plonge vers le bas à VMAX pour esquiver le coup",
            "Naruto se penche vers le bas à VMAX pour éviter le poing",
            "Naruto descend sous l'attaque à VMAX pour la laisser passer",
            "Naruto baisse rapidement la tête à VMAX pour éviter le coup",
            "Naruto se baisse à vitesse maximale pour laisser passer le coup au-dessus de sa tête"
        ]
    },

    // ==================================================
    // ESQUIVE — ARRIÈRE
    // ==================================================

    {
        id: "ESQ_005",
        categorie: "esquive",
        famille: "esquive_arriere",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto recule pour éviter le coup",
            "Naruto fait un pas en arrière pour esquiver",
            "Naruto se déplace vers l'arrière pour éviter l'attaque",
            "Naruto se replie pour laisser passer le coup",
            "Naruto s'éloigne de l'attaque",
            "Naruto recule hors de portée du poing",
            "Naruto recule pour éviter le coup visant son visage",
            "Naruto fait un pas en arrière pour laisser passer le coup",
            "Naruto se retire vers l'arrière pour esquiver",
            "Naruto se dégage en reculant"
        ]
    },

    // ==================================================
    // ESQUIVE — ARRIÈRE + VMAX
    // ==================================================

    {
        id: "ESQ_006",
        categorie: "esquive",
        famille: "esquive_arriere_vmax",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "VITESSE",
            "CIBLE"
        ],

        exemples: [
            "Naruto recule à VMAX pour éviter le coup",
            "Naruto se déplace vers l'arrière à VMAX pour esquiver",
            "Naruto fait un pas en arrière à VMAX pour éviter l'attaque",
            "Naruto se replie à VMAX pour laisser passer le poing",
            "Naruto s'éloigne à VMAX du coup visant son visage",
            "Naruto recule à vitesse maximale pour sortir de portée",
            "Naruto se retire à VMAX pour éviter le coup",
            "Naruto recule rapidement à VMAX pour esquiver l'attaque",
            "Naruto se dégage vers l'arrière à VMAX",
            "Naruto recule à VMAX pour laisser passer l'attaque devant lui"
        ]
    },

    // ==================================================
    // ESQUIVE — PENCHÉE
    // ==================================================

    {
        id: "ESQ_007",
        categorie: "esquive",
        famille: "esquive_penchee",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "CIBLE"
        ],

        exemples: [
            "Naruto penche la tête vers la gauche pour éviter le coup",
            "Naruto penche la tête vers la droite pour éviter le coup",
            "Naruto incline son corps vers la gauche pour esquiver",
            "Naruto incline son corps vers la droite pour esquiver",
            "Naruto se penche à gauche pour laisser passer le poing",
            "Naruto se penche à droite pour laisser passer le poing",
            "Naruto dévie son buste vers la gauche pour éviter l'attaque",
            "Naruto dévie son buste vers la droite pour éviter l'attaque",
            "Naruto incline son visage vers la gauche pour éviter le coup",
            "Naruto incline son visage vers la droite pour éviter le coup"
        ]
    },

    // ==================================================
    // ESQUIVE — SAUT
    // ==================================================

    {
        id: "ESQ_008",
        categorie: "esquive",
        famille: "esquive_saut",

        structure: [
            "SUJET",
            "ACTION",
            "MANIERE",
            "HAUTEUR",
            "CIBLE"
        ],

        exemples: [
            "Naruto saute pour éviter le coup",
            "Naruto bondit pour esquiver l'attaque",
            "Naruto saute au-dessus du coup",
            "Naruto bondit au-dessus du poing",
            "Naruto s'élève dans les airs pour éviter l'attaque",
            "Naruto fait un bond pour laisser passer le coup sous lui",
            "Naruto saute à 1m de hauteur pour éviter le coup",
            "Naruto bondit à 2m de hauteur pour esquiver l'attaque",
            "Naruto saute pour laisser passer le coup sous ses pieds",
            "Naruto s'élève pour éviter l'attaque visant ses jambes"
        ]
    },

    // ==================================================
    // ESQUIVE — DISTANCE
    // ==================================================

    {
        id: "ESQ_009",
        categorie: "esquive",
        famille: "esquive_distance",

        structure: [
            "SUJET",
            "ACTION",
            "DISTANCE",
            "CIBLE"
        ],

        exemples: [
            "Naruto recule de 2m pour éviter le coup",
            "Naruto se décale de 1m vers la droite pour esquiver",
            "Naruto se déplace de 2m vers la gauche pour éviter l'attaque",
            "Naruto recule de 3m pour sortir de portée",
            "Naruto se déporte de 2m vers la droite pour éviter le poing",
            "Naruto se déporte de 2m vers la gauche pour éviter le poing",
            "Naruto bondit de 2m en arrière pour esquiver",
            "Naruto fait un déplacement de 1m vers la droite pour éviter le coup",
            "Naruto s'éloigne de 3m pour laisser passer l'attaque",
            "Naruto se retire de 2m pour éviter le coup"
        ]
    },

    // ==================================================
    // ESQUIVE — COMPLÈTE
    // ==================================================

    {
        id: "ESQ_010",
        categorie: "esquive",
        famille: "esquive_complete",

        structure: [
            "SUJET",
            "ACTION",
            "DIRECTION",
            "VITESSE",
            "HAUTEUR",
            "DISTANCE",
            "CIBLE"
        ],

        exemples: [
            "Naruto esquive le coup vers la droite à VMAX sur 2m",
            "Naruto esquive le coup vers la gauche à VMAX sur 2m",
            "Naruto se baisse à VMAX pour laisser passer le coup au-dessus de sa tête",
            "Naruto recule à VMAX sur 2m pour sortir de portée",
            "Naruto saute à 2m de hauteur pour éviter le coup",
            "Naruto bondit à VMAX sur 2m pour éviter l'attaque",
            "Naruto se déporte à VMAX de 2m vers la droite pour esquiver",
            "Naruto se déporte à VMAX de 2m vers la gauche pour esquiver",
            "Naruto recule de 3m à VMAX pour éviter le coup visant son visage",
            "Naruto saute à 1m de hauteur à VMAX pour laisser passer l'attaque sous lui"
        ]
    }
],


// ==================================================
// PARADES
// ==================================================

parade: [

    // ==================================================
    // PARADE — BRAS / AVANT-BRAS
    // ==================================================

    {
        id: "PAR_001",
        categorie: "parade",
        famille: "blocage_bras",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup avec son bras",
            "Naruto bloque l'attaque avec son avant-bras",
            "Naruto pare le coup avec son avant-bras droit",
            "Naruto pare le coup avec son avant-bras gauche",
            "Naruto bloque le poing avec son bras droit",
            "Naruto bloque le poing avec son bras gauche",
            "Naruto place son avant-bras droit en opposition au coup",
            "Naruto place son avant-bras gauche en opposition à l'attaque",
            "Naruto interpose son bras droit devant le coup",
            "Naruto interpose son avant-bras gauche devant son visage"
        ]
    },

    // ==================================================
    // PARADE — PAUME
    // ==================================================

    {
        id: "PAR_002",
        categorie: "parade",
        famille: "blocage_paume",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup avec sa paume",
            "Naruto pare l'attaque avec sa paume",
            "Naruto bloque le coup avec sa paume droite",
            "Naruto bloque le coup avec sa paume gauche",
            "Naruto met sa paume droite en opposition au coup",
            "Naruto met sa paume gauche en opposition au coup",
            "Naruto place sa paume droite devant l'attaque",
            "Naruto place sa paume gauche devant l'attaque",
            "Naruto interpose sa paume droite entre lui et le poing",
            "Naruto interpose sa paume gauche entre lui et le coup"
        ]
    },

    // ==================================================
    // PARADE — MAIN / POING
    // ==================================================

    {
        id: "PAR_003",
        categorie: "parade",
        famille: "blocage_main",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup avec sa main droite",
            "Naruto bloque le coup avec sa main gauche",
            "Naruto pare l'attaque avec sa main droite",
            "Naruto pare l'attaque avec sa main gauche",
            "Naruto utilise sa main droite pour bloquer le poing",
            "Naruto utilise sa main gauche pour bloquer le poing",
            "Naruto lève sa main droite pour bloquer le coup",
            "Naruto lève sa main gauche pour bloquer l'attaque",
            "Naruto place sa main droite en opposition au coup",
            "Naruto place sa main gauche en opposition à l'attaque"
        ]
    },

    // ==================================================
    // PARADE — DEUX MAINS
    // ==================================================

    {
        id: "PAR_004",
        categorie: "parade",
        famille: "blocage_deux_mains",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup à deux mains",
            "Naruto bloque le poing avec ses deux mains",
            "Naruto pare l'attaque avec ses deux mains",
            "Naruto interpose ses deux mains devant le coup",
            "Naruto utilise ses deux mains pour bloquer le poing",
            "Naruto place ses deux paumes en opposition au coup",
            "Naruto bloque l'attaque avec ses deux avant-bras",
            "Naruto croise ses deux bras pour bloquer le coup",
            "Naruto protège son visage avec ses deux mains",
            "Naruto ferme sa garde avec ses deux bras"
        ]
    },

    // ==================================================
    // PARADE — JAMBES
    // ==================================================

    {
        id: "PAR_005",
        categorie: "parade",
        famille: "blocage_jambe",

        structure: [
            "SUJET",
            "ACTION",
            "MEMBRE",
            "PARTIE_CORPS",
            "CIBLE"
        ],

        exemples: [
            "Naruto bloque le coup avec sa jambe droite",
            "Naruto bloque le coup avec sa jambe gauche",
            "Naruto pare le coup de pied avec son tibia droit",
            "Naruto pare le coup de pied avec son tibia gauche",
            "Naruto lève sa jambe droite pour bloquer le kick",
            "Naruto lève sa jambe gauche pour bloquer le coup",
            "Naruto interpose son tibia droit devant le pied",
            "Naruto interpose son tibia gauche devant le pied",
            "Naruto utilise son genou droit pour bloquer le coup",
            "Naruto utilise son genou gauche pour bloquer l'attaque"
        ]
    },

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
