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

        {
            id: "ATK_POING_001",
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
                "Naruto donne un direct du droit au visage de Panda",
                "Naruto porte un coup de poing droit au visage"
            ]
        },

        {
            id: "ATK_PIED_001",
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
                "Naruto donne un coup de pied frontal dans l'abdomen de Panda",
                "Naruto frappe Panda avec un front kick",
                "Naruto porte un violent coup de pied frontal au ventre"
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
