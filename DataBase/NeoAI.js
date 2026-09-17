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
// 🎮 MODÈLES D'ACTIONS — Déplacements 🏃 
// ======================================================

const NEO_ACTION_MODELS = {

    // ==================================================
    // CATÉGORIE : DÉPLACEMENT
    // ==================================================

    deplacement: {

        categorie: "deplacement",

        // ==============================================
        // COURSE
        // ==============================================

        course: [

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


        // ==============================================
        // SAUT
        // ==============================================

        saut: [

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


        // ==============================================
        // BOND
        // ==============================================

        bond: [

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
                    "Goku bondit vers le haut jusqu'à 3m pour éviter Vegeta",
                    "Luffy fait un bond vertical de 1,5m pour atteindre Zoro",
                    "Ichigo bondit verticalement à 2,5m pour esquiver Ulquiorra",
                    "Sasuke bondit vers le haut jusqu'à 3m pour prendre de la hauteur face à Naruto"
                ]
            },


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
                    "Goku fait un bond frontal vers Vegeta à 2m de hauteur sur 4m pour l'intercepter",
                    "Luffy bondit en avant à 1,5m de hauteur sur 2m pour rejoindre Zoro",
                    "Ichigo fait un bond droit devant lui à 2,5m de hauteur sur 5m pour atteindre Ulquiorra",
                    "Yamato bondit vers Madara à 2m de hauteur sur 3,5m pour l'attaquer"
                ]
            },


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
                    "Goku fait un bond arrière à 2m de hauteur sur 3m pour éviter Vegeta",
                    "Ichigo bondit vers l'arrière à 1,5m de hauteur sur 2,5m pour prendre ses distances avec Ulquiorra",
                    "Luffy fait un bond arrière à 2m de hauteur sur 3m pour esquiver Zoro",
                    "Yamato bondit en arrière à 2,5m de hauteur sur 4m pour sortir de portée de Madara"
                ]
            },


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
                    "Goku fait un bond latéral vers la gauche à 1,5m de hauteur sur 3m pour esquiver Vegeta",
                    "Luffy bondit sur le côté droit à 2m de hauteur sur 2,5m pour contourner Zoro",
                    "Ichigo fait un bond vers la gauche à 1m de hauteur sur 1,5m pour se décaler d'Ulquiorra",
                    "Yamato bondit latéralement vers la droite à 2m de hauteur sur 3m pour passer à côté de Madara"
                ]
            },


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
                    "Goku fait un bond diagonal vers l'avant gauche à 2m de hauteur sur 4m pour intercepter Vegeta",
                    "Luffy bondit en diagonale vers l'arrière droite à 1m de hauteur sur 2,5m pour éviter Zoro",
                    "Ichigo fait un bond en diagonale vers l'avant gauche à 2,5m de hauteur sur 5m pour rejoindre Ulquiorra",
                    "Yamato bondit en diagonale vers l'arrière gauche à 2m de hauteur sur 3,5m pour s'éloigner de Madara"
                ]
            }
        ],


        // ==============================================
        // VOL
        // ==============================================

        vol: [

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
        ]
    }
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
                
                                                                                     
