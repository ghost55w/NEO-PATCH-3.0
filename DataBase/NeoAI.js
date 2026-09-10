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
                "Naruto saute vers panda en montant à 5m de hauteur",
                "Naruto bondit vers panda à 5 mètres",
                "Naruto effectue un saut aérien vers panda"
            ]
        },

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
                "Naruto court vers panda",
                "Naruto fonce vers panda",
                "Naruto se rue vers panda",
                "Naruto charge panda"
            ]
        },

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
                "Naruto se déplace de 8m"
            ]
        },

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
                "Naruto se replie de 5 mètres"
            ]
        },

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
                "Naruto effectue une rotation vers la droite"
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
