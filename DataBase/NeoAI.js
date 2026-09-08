"use strict";

/*
╔══════════════════════════════════════════════════════════════╗
║                         NEO AI                               ║
║                    COMBAT ENGINE                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. NEO_DICTIONNAIRES                                        ║
║     → vocabulaire / synonymes / expressions                 ║
║                                                              ║
║  2. NEO_ACTIONS_COMBAT                                       ║
║     → actions + modèles structurels                          ║
║                                                              ║
║  3. MOTEUR GÉNÉRIQUE                                         ║
║     → reconnaît l'action                                     ║
║     → extrait les slots                                      ║
║     → compare uniquement les modèles de cette action        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
*/


//==============================================================
// 🧠 NEO DICTIONNAIRES
//==============================================================

const NEO_DICTIONNAIRES = {

    //==========================================================
    // ⚔️ ACTIONS
    //==========================================================

    actions: {

        frapper: [
            "frapper",
            "frappe",
            "frappé",
            "frappée",
            "frappés",
            "frappées",
            "frappant",

            "asséner",
            "assène",
            "asséné",
            "assénée",
            "assénant",

            "porter un coup",
            "porte un coup",
            "porté un coup",

            "porter une frappe",
            "porte une frappe",
            "porté une frappe",

            "donner un coup",
            "donne un coup",
            "donné un coup",

            "donner une frappe",
            "donne une frappe",

            "infliger un coup",
            "inflige un coup",
            "infligé un coup",

            "toucher",
            "touche",
            "touché",
            "touchée",
            "touchant"
        ],

        attaquer: [
            "attaquer",
            "attaque",
            "attaqué",
            "attaquée",
            "attaquant",
            "attaquants",

            "agresser",
            "agresse",
            "agressé",

            "assaillir",
            "assaille",
            "assailli",

            "charger",
            "charge",
            "chargé",

            "lancer une attaque",
            "lance une attaque",
            "lancé une attaque",

            "lancer un assaut",
            "lance un assaut",
            "lancé un assaut",

            "porter une attaque",
            "porte une attaque"
        ],

        courir: [
            "courir",
            "court",
            "courant",
            "couru",

            "foncer",
            "fonce",
            "foncé",
            "fonçant",

            "sprinter",
            "sprinte",
            "sprintant",

            "galoper",
            "galope",

            "se précipiter",
            "se précipite",
            "se précipitant",

            "prendre sa course",
            "partir en courant",
            "se lancer en courant"
        ],

        avancer: [
            "avancer",
            "avance",
            "avancé",
            "avançant",

            "progresser",
            "progresse",
            "progressant",

            "aller vers",
            "se diriger vers",

            "s'approcher",
            "s'approche",
            "s'approchant",

            "approcher",
            "approche",
            "approchant"
        ],

        reculer: [
            "reculer",
            "recule",
            "reculé",
            "reculant",

            "faire marche arrière",
            "faire marche arriere",

            "retourner en arrière",
            "retourner en arriere",

            "s'éloigner",
            "s'eloigner",
            "s'éloigne",
            "s'eloigne",

            "prendre ses distances"
        ],

        sauter: [
            "sauter",
            "saute",
            "sauté",
            "sautée",
            "sautant",

            "bondir",
            "bondit",
            "bondi",
            "bondissant",

            "faire un bond",
            "fait un bond",

            "s'élancer",
            "s'élance",
            "s'élançant"
        ],

        esquiver: [
            "esquiver",
            "esquive",
            "esquivé",
            "esquivée",
            "esquivant",

            "éviter",
            "évite",
            "évité",
            "évitant",

            "se décaler",
            "se décale",
            "se décalant",

            "se dérober",
            "se dérobe",

            "se déplacer pour éviter",

            "faire un écart",
            "fait un écart"
        ],

        bloquer: [
            "bloquer",
            "bloque",
            "bloqué",
            "bloquée",
            "bloquant",

            "stopper",
            "stoppe",
            "stoppé",

            "arrêter",
            "arrête",
            "arrêté",

            "intercepter",
            "intercepte",
            "intercepté"
        ],

        parer: [
            "parer",
            "pare",
            "paré",
            "parée",
            "parant",

            "parer un coup",
            "parer une attaque",

            "dévier",
            "dévie",
            "dévié",
            "déviant",

            "détourner",
            "détourne",
            "détourné"
        ],

        contre: [
            "contrer",
            "contre",
            "contré",
            "contrée",
            "contrant",

            "riposter",
            "riposte",
            "riposté",
            "ripostant",

            "contre-attaquer",
            "contre attaque",
            "contre-attaque",
            "contre attaque",

            "répliquer",
            "réplique",
            "répliqué"
        ],

        saisir: [
            "saisir",
            "saisit",
            "saisi",
            "saisie",
            "saisissant",

            "attraper",
            "attrape",
            "attrapé",
            "attrapant",

            "agripper",
            "agrippe",
            "agrippé",
            "agrippant",

            "empoigner",
            "empoigne",
            "empoigné",

            "prendre",
            "prend",
            "pris"
        ],

        pousser: [
            "pousser",
            "pousse",
            "poussé",
            "poussée",
            "poussant",

            "repousser",
            "repousse",
            "repoussé",

            "bousculer",
            "bouscule",
            "bousculé"
        ],

        tirer: [
            "tirer",
            "tire",
            "tiré",
            "tirant",

            "tracter",
            "tracte",
            "tracté",

            "ramener",
            "ramène",
            "ramené"
        ],

        projeter: [
            "projeter",
            "projette",
            "projeté",
            "projetant",

            "lancer",
            "lance",
            "lancé",
            "lançant",

            "jeter",
            "jette",
            "jeté",

            "envoyer",
            "envoie",
            "envoyé"
        ]

    },


    //==========================================================
    // 🥊 MANIÈRES / ARMES / MOYENS
    //==========================================================

    manieres: {

        poing: [
            "poing",
            "poings",
            "coup de poing",
            "coup de poings"
        ],

        pied: [
            "pied",
            "pieds",
            "coup de pied",
            "coup de pieds",
            "jambe"
        ],

        coude: [
            "coude",
            "coudes",
            "coup de coude"
        ],

        genou: [
            "genou",
            "genoux",
            "coup de genou"
        ],

        tête: [
            "tête",
            "tete",
            "crâne",
            "crane",
            "coup de tête",
            "coup de tete"
        ],

        main: [
            "main",
            "mains",
            "paume",
            "paume de la main"
        ],

        avant_bras: [
            "avant-bras",
            "avant bras"
        ],

        épaule: [
            "épaule",
            "epaule",
            "épaules",
            "epaules"
        ],

        corps: [
            "corps",
            "torse"
        ],

        arme: [
            "arme",
            "arme blanche"
        ],

        sabre: [
            "sabre",
            "katana"
        ],

        épée: [
            "épée",
            "epee"
        ],

        couteau: [
            "couteau",
            "couteaux",
            "lame"
        ]
    },


    //==========================================================
    // 🎯 PARTIES DU CORPS / ZONES VISÉES
    //==========================================================

    partiesCorps: {

        visage: [
            "visage",
            "face"
        ],

        tête: [
            "tête",
            "tete",
            "crâne",
            "crane"
        ],

        front: [
            "front"
        ],

        yeux: [
            "œil",
            "oeil",
            "yeux"
        ],

        nez: [
            "nez"
        ],

        bouche: [
            "bouche",
            "lèvres",
            "levres"
        ],

        mâchoire: [
            "mâchoire",
            "machoire",
            "menton"
        ],

        cou: [
            "cou",
            "gorge",
            "nuque"
        ],

        épaule: [
            "épaule",
            "epaule",
            "épaules",
            "epaules"
        ],

        bras: [
            "bras"
        ],

        avant_bras: [
            "avant-bras",
            "avant bras"
        ],

        coude: [
            "coude"
        ],

        poignet: [
            "poignet"
        ],

        main: [
            "main",
            "mains",
            "paume"
        ],

        poitrine: [
            "poitrine",
            "torse",
            "pectoraux"
        ],

        ventre: [
            "ventre",
            "abdomen",
            "abdominaux",
            "estomac"
        ],

        dos: [
            "dos"
        ],

        hanche: [
            "hanche",
            "hanches"
        ],

        jambe: [
            "jambe",
            "jambes"
        ],

        cuisse: [
            "cuisse",
            "cuisses"
        ],

        genou: [
            "genou",
            "genoux"
        ],

        mollet: [
            "mollet",
            "mollets"
        ],

        cheville: [
            "cheville",
            "chevilles"
        ],

        pied: [
            "pied",
            "pieds"
        ],

        talon: [
            "talon",
            "talons"
        ]
    },


    //==========================================================
    // ↔️ CÔTÉS
    //==========================================================

    cotes: {

        gauche: [
            "gauche",
            "gauchement",
            "côté gauche",
            "cote gauche",
            "du côté gauche",
            "du cote gauche",
            "sur la gauche",
            "vers la gauche"
        ],

        droite: [
            "droite",
            "droit",
            "côté droit",
            "cote droit",
            "du côté droit",
            "du cote droit",
            "sur la droite",
            "vers la droite"
        ]
    },


    //==========================================================
    // 🧭 DIRECTIONS
    //==========================================================

    directions: {

        gauche: [
            "gauche",
            "vers la gauche",
            "sur la gauche",
            "à gauche",
            "a gauche"
        ],

        droite: [
            "droite",
            "vers la droite",
            "sur la droite",
            "à droite",
            "a droite"
        ],

        devant: [
            "devant",
            "en avant",
            "vers l'avant",
            "vers l avant"
        ],

        derriere: [
            "derrière",
            "derriere",
            "en arrière",
            "en arriere",
            "vers l'arrière",
            "vers l arriere"
        ],

        haut: [
            "haut",
            "vers le haut",
            "au-dessus",
            "au dessus",
            "vers le ciel"
        ],

        bas: [
            "bas",
            "vers le bas",
            "vers le sol",
            "au sol"
        ],

        droite_avant: [
            "avant droit",
            "diagonale droite",
            "diagonalement à droite",
            "diagonalement a droite"
        ],

        gauche_avant: [
            "avant gauche",
            "diagonale gauche",
            "diagonalement à gauche",
            "diagonalement a gauche"
        ]
    },


    //==========================================================
    // 🌀 TRAJECTOIRES
    //==========================================================

    trajectoires: {

        directe: [
            "direct",
            "directe",
            "directement",
            "en ligne droite"
        ],

        diagonale: [
            "diagonal",
            "diagonale",
            "diagonalement",
            "en diagonale"
        ],

        circulaire: [
            "circulaire",
            "circulairement",
            "en cercle",
            "en arc",
            "arc de cercle"
        ],

        laterale: [
            "latéral",
            "latérale",
            "latéralement",
            "sur le côté",
            "sur le cote"
        ],

        descendante: [
            "descendant",
            "descendante",
            "vers le bas"
        ],

        montante: [
            "montant",
            "montante",
            "vers le haut"
        ],

        horizontale: [
            "horizontal",
            "horizontale",
            "horizontalement"
        ],

        verticale: [
            "vertical",
            "verticale",
            "verticalement"
        ],

        zigzag: [
            "zigzag",
            "zig zag",
            "en zigzag",
            "en zig zag"
        ]
    },


    //==========================================================
    // ⚡ VITESSES
    //==========================================================

    vitesses: {

        lente: [
            "lent",
            "lente",
            "lentement",
            "doucement"
        ],

        normale: [
            "normal",
            "normale",
            "normalement"
        ],

        rapide: [
            "rapide",
            "rapidement",
            "vite"
        ],

        tres_rapide: [
            "très rapide",
            "tres rapide",
            "très vite",
            "tres vite",
            "vitesse maximale",
            "vitesse max",
            "vmax"
        ]
    },


    //==========================================================
    // 📏 DISTANCES
    //==========================================================

    distances: [
        "m",
        "mètre",
        "mètres",
        "metre",
        "metres",
        "cm",
        "centimètre",
        "centimètres",
        "centimetre",
        "centimetres"
    ],


    //==========================================================
    // 📐 ANGLES
    //==========================================================

    angles: [
        "angle",
        "degrés",
        "degré",
        "degres",
        "degre"
    ],


    //==========================================================
    // 🧍 POSITIONS / FIN DE TRAJET
    //==========================================================

    positions: {

        devant: [
            "devant",
            "en face",
            "face à",
            "face a"
        ],

        derriere: [
            "derrière",
            "derriere",
            "dans son dos",
            "derrière lui",
            "derriere lui"
        ],

        cote_gauche: [
            "sur son profil gauche",
            "sur son côté gauche",
            "sur son cote gauche",
            "à sa gauche",
            "a sa gauche"
        ],

        cote_droit: [
            "sur son profil droit",
            "sur son côté droit",
            "sur son cote droit",
            "à sa droite",
            "a sa droite"
        ],

        proche: [
            "à proximité",
            "a proximite",
            "près de",
            "pres de",
            "close distance",
            "au contact"
        ]
    }

};


//==============================================================
// ⚔️ NEO ACTIONS COMBAT
//
// IMPORTANT :
// Chaque action possède SES PROPRES modèles.
//
// Le moteur ne parcourt jamais toutes les actions.
// Il reconnaît d'abord l'action puis parcourt uniquement
// NEO_ACTIONS_COMBAT[action].
//==============================================================

const NEO_ACTIONS_COMBAT = {


    //==========================================================
    // 🥊 FRAPPER
    //==========================================================

    frapper: [

        {
            id: "ATT_001",

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

            exemple:
                "Naruto frappe Maki avec un coup de poing."
        },

        {
            id: "ATT_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS",
                "COTE"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Naruto frappe Maki du poing droit au visage."
        },

        {
            id: "ATT_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "DISTANCE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Naruto frappe Maki à 2 mètres au visage."
        },

        {
            id: "ATT_004",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "DIRECTION",
                "ANGLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Naruto frappe Maki avec son poing vers la droite à 45 degrés au visage."
        },

        {
            id: "ATT_005",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "TRAJECTOIRE",
                "VITESSE",
                "DISTANCE",
                "PARTIE_CORPS",
                "COTE"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Naruto frappe Maki du poing droit en diagonale à grande vitesse au visage."
        },

        {
            id: "ATT_006",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "CIBLE",
                "TRAJECTOIRE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "ARME",
                "CIBLE"
            ],

            exemple:
                "Naruto frappe Maki avec son sabre en diagonale."
        },

        {
            id: "ATT_007",

            structure: [
                "SUJET",
                "ACTION",
                "ARME",
                "CIBLE",
                "TRAJECTOIRE",
                "DIRECTION",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "ARME",
                "CIBLE"
            ],

            exemple:
                "Naruto frappe Maki avec son sabre en diagonale vers la gauche."
        }
    ],


    //==========================================================
    // ⚔️ ATTAQUER
    //==========================================================

    attaquer: [

        {
            id: "ATQ_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Naruto attaque Maki."
        },

        {
            id: "ATQ_002",

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

            exemple:
                "Naruto attaque Maki avec un coup de poing."
        },

        {
            id: "ATQ_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Naruto attaque Maki avec un coup de poing au visage."
        },

        {
            id: "ATQ_004",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "DIRECTION"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE"
            ],

            exemple:
                "Naruto attaque Maki avec un coup de poing vers la droite."
        }
    ],


    //==========================================================
    // 🏃 COURIR
    //==========================================================

    courir: [

        {
            id: "DEP_C_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Naruto court vers Maki."
        },

        {
            id: "DEP_C_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Naruto fonce en courant vers Maki."
        },

        {
            id: "DEP_C_003",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Naruto court vers Maki sur 10 mètres."
        },

        {
            id: "DEP_C_004",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "VITESSE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Naruto court très vite vers Maki sur 10 mètres."
        }
    ],


    //==========================================================
    // ➡️ AVANCER
    //==========================================================

    avancer: [

        {
            id: "DEP_F_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Naruto avance vers Maki."
        },

        {
            id: "DEP_F_002",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Naruto avance de 5 mètres vers Maki."
        },

        {
            id: "DEP_F_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Naruto avance en courant de 5 mètres vers Maki."
        }
    ],


    //==========================================================
    // ⬅️ RECULER
    //==========================================================

    reculer: [

        {
            id: "DEP_A_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Naruto recule devant Maki."
        },

        {
            id: "DEP_A_002",

            structure: [
                "SUJET",
                "ACTION",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "DISTANCE"
            ],

            exemple:
                "Naruto recule de 5 mètres."
        },

        {
            id: "DEP_A_003",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "DISTANCE",
                "FIN_TRAJET"
            ],

            requis: [
                "ACTION",
                "DISTANCE"
            ],

            exemple:
                "Naruto recule de 5 mètres pour finir sur le profil gauche de Maki."
        }
    ],


    //==========================================================
    // 🦘 SAUTER
    //==========================================================

    sauter: [

        {
            id: "SAUT_001",

            structure: [
                "SUJET",
                "ACTION"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Naruto saute."
        },

        {
            id: "SAUT_002",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Naruto saute vers Maki."
        },

        {
            id: "SAUT_003",

            structure: [
                "SUJET",
                "ACTION",
                "HAUTEUR"
            ],

            requis: [
                "ACTION",
                "HAUTEUR"
            ],

            exemple:
                "Naruto saute à 5 mètres de hauteur."
        },

        {
            id: "SAUT_004",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "HAUTEUR",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "HAUTEUR",
                "DISTANCE"
            ],

            exemple:
                "Naruto saute vers Maki à 5 mètres de hauteur puis avance de 8 mètres."
        }
    ],


    //==========================================================
    // 🌀 ESQUIVER
    //==========================================================

    esquiver: [

        {
            id: "ESQ_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Maki esquive l'attaque de Naruto."
        },

        {
            id: "ESQ_002",

            structure: [
                "SUJET",
                "ACTION",
                "DIRECTION"
            ],

            requis: [
                "ACTION",
                "DIRECTION"
            ],

            exemple:
                "Maki esquive vers la gauche."
        },

        {
            id: "ESQ_003",

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

            exemple:
                "Maki esquive en se décalant vers la gauche."
        },

        {
            id: "ESQ_004",

            structure: [
                "SUJET",
                "ACTION",
                "DIRECTION",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "DIRECTION",
                "DISTANCE"
            ],

            exemple:
                "Maki esquive vers la gauche de 3 mètres."
        },

        {
            id: "ESQ_005",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "DIRECTION",
                "DISTANCE",
                "FIN_TRAJET"
            ],

            requis: [
                "ACTION",
                "DIRECTION",
                "DISTANCE"
            ],

            exemple:
                "Maki esquive en se décalant de 3 mètres vers la gauche pour finir sur le profil droit de Naruto."
        }
    ],


    //==========================================================
    // 🛡️ BLOQUER
    //==========================================================

    bloquer: [

        {
            id: "BLOQ_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Maki bloque l'attaque de Naruto."
        },

        {
            id: "BLOQ_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "MANIERE"
            ],

            exemple:
                "Maki bloque le coup avec son avant-bras."
        },

        {
            id: "BLOQ_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "COTE",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "MANIERE"
            ],

            exemple:
                "Maki bloque le coup avec son avant-bras gauche."
        }
    ],


    //==========================================================
    // 🛡️ PARER
    //==========================================================

    parer: [

        {
            id: "PAR_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION"
            ],

            exemple:
                "Maki pare l'attaque de Naruto."
        },

        {
            id: "PAR_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "MANIERE"
            ],

            exemple:
                "Maki pare le coup avec son avant-bras."
        },

        {
            id: "PAR_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "COTE",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "MANIERE"
            ],

            exemple:
                "Maki pare le coup avec son avant-bras gauche."
        }
    ],


    //==========================================================
    // 🔄 CONTRE
    //==========================================================

    contre: [

        {
            id: "CTR_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki contre Naruto."
        },

        {
            id: "CTR_002",

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

            exemple:
                "Maki contre Naruto avec un coup de genou."
        },

        {
            id: "CTR_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Maki contre Naruto avec un coup de genou au ventre."
        },

        {
            id: "CTR_004",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "COTE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Maki contre Naruto du genou droit au ventre."
        }
    ],


    //==========================================================
    // ✋ SAISIR
    //==========================================================

    saisir: [

        {
            id: "SAI_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki saisit Naruto."
        },

        {
            id: "SAI_002",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Maki saisit Naruto par le poignet."
        },

        {
            id: "SAI_003",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS",
                "COTE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Maki saisit Naruto par le poignet droit."
        }
    ],


    //==========================================================
    // 🤜 POUSSER
    //==========================================================

    pousser: [

        {
            id: "POU_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki pousse Naruto."
        },

        {
            id: "POU_002",

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

            exemple:
                "Maki pousse Naruto avec ses deux mains."
        },

        {
            id: "POU_003",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Maki pousse Naruto de 3 mètres."
        }
    ],


    //==========================================================
    // 🫳 TIRER
    //==========================================================

    tirer: [

        {
            id: "TIR_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki tire Naruto."
        },

        {
            id: "TIR_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            requis: [
                "ACTION",
                "CIBLE",
                "PARTIE_CORPS"
            ],

            exemple:
                "Maki tire Naruto par le bras."
        }
    ],


    //==========================================================
    // 💥 PROJETER
    //==========================================================

    projeter: [

        {
            id: "PROJ_001",

            structure: [
                "SUJET",
                "ACTION",
                "CIBLE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki projette Naruto."
        },

        {
            id: "PROJ_002",

            structure: [
                "SUJET",
                "ACTION",
                "MANIERE",
                "CIBLE",
                "DISTANCE"
            ],

            requis: [
                "ACTION",
                "CIBLE"
            ],

            exemple:
                "Maki projette Naruto de 5 mètres."
        },

        {
            id: "PROJ_003",

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
                "CIBLE",
                "DISTANCE"
            ],

            exemple:
                "Maki projette Naruto vers la gauche sur 5 mètres."
        }
    ]

};


//==============================================================
// 🧹 NORMALISATION
//==============================================================

function neoNormaliserTexte(texte) {

    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[’']/g, "'")
        .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}


//==============================================================
// 🔎 TEST D'EXPRESSION
//==============================================================

function neoContientExpression(texte, expression) {

    const t = neoNormaliserTexte(texte);
    const e = neoNormaliserTexte(expression);

    if (!e) return false;

    return (
        ` ${t} `.includes(` ${e} `) ||
        t === e ||
        t.startsWith(`${e} `) ||
        t.endsWith(` ${e}`)
    );
}


//==============================================================
// 🎯 RECONNAÎTRE L'ACTION
//
// On teste les expressions les plus longues en premier.
// Exemple :
//
// "assène un coup de poing"
//       ↓
// frapper
//
// et pas une simple reconnaissance aléatoire de "coup".
//==============================================================

function neoTrouverAction(texte) {

    const t = neoNormaliserTexte(texte);

    let meilleur = null;

    for (
        const [action, variantes]
        of Object.entries(NEO_DICTIONNAIRES.actions)
    ) {

        for (const variante of variantes) {

            const v =
                neoNormaliserTexte(variante);

            if (!v) continue;

            if (
                t === v ||
                t.includes(v)
            ) {

                const score =
                    v.split(" ").length * 20 +
                    v.length;

                if (
                    !meilleur ||
                    score > meilleur.score
                ) {

                    meilleur = {
                        action,
                        expression: variante,
                        score
                    };
                }
            }
        }
    }

    return meilleur;
}


//==============================================================
// 🔍 TROUVER UNE NOTION DANS LE DICTIONNAIRE
//==============================================================

function neoTrouverNotion(
    texte,
    dictionnaire
) {

    const t =
        neoNormaliserTexte(texte);

    let meilleur = null;

    for (
        const [valeur, variantes]
        of Object.entries(dictionnaire)
    ) {

        for (const variante of variantes) {

            const v =
                neoNormaliserTexte(variante);

            if (!v) continue;

            if (
                t.includes(v)
            ) {

                if (
                    !meilleur ||
                    v.length > meilleur.longueur
                ) {

                    meilleur = {
                        valeur,
                        expression: variante,
                        longueur: v.length
                    };
                }
            }
        }
    }

    return meilleur?.valeur || null;
}


//==============================================================
// 📏 EXTRAIRE DISTANCE
//==============================================================

function neoExtraireDistance(texte) {

    const match = String(texte || "").match(
        /(\d+(?:[.,]\d+)?)\s*(mètres?|metres?|m|centimètres?|centimetres?|cm)\b/i
    );

    if (!match) return null;

    return {
        valeur: Number(
            match[1].replace(",", ".")
        ),
        unite:
            match[2]
                .toLowerCase()
                .startsWith("c")
                ? "cm"
                : "m"
    };
}


//==============================================================
// 📐 EXTRAIRE ANGLE
//==============================================================

function neoExtraireAngle(texte) {

    const match = String(texte || "").match(
        /(\d+(?:[.,]\d+)?)\s*(?:degrés?|degres?|°)/i
    );

    if (!match) return null;

    return Number(
        match[1].replace(",", ".")
    );
}


//==============================================================
// 📏 EXTRAIRE HAUTEUR
//==============================================================

function neoExtraireHauteur(texte) {

    const t =
        neoNormaliserTexte(texte);

    const match =
        t.match(
            /(?:hauteur|haut de|monte a|monter a|s eleve a|s eleve jusqu a)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*(m|metre|metres)/
        );

    if (!match) return null;

    return {
        valeur: Number(
            match[1].replace(",", ".")
        ),
        unite: "m"
    };
}


//==============================================================
// 👤 EXTRAIRE LES NOMS / PERSONNAGES
//==============================================================

function neoExtraireNoms(texte) {

    const mots =
        String(texte || "")
            .match(
                /\b[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9_-]*\b/g
            ) || [];

    const uniques = [];

    for (const mot of mots) {

        if (
            !uniques.some(
                x =>
                    x.toLowerCase() ===
                    mot.toLowerCase()
            )
        ) {
            uniques.push(mot);
        }
    }

    return uniques;
}


//==============================================================
// 🧍 SUJET
//==============================================================

function neoExtraireSujet(texte) {

    const noms =
        neoExtraireNoms(texte);

    return noms[0] || null;
}


//==============================================================
// 🎯 CIBLE
//==============================================================

function neoExtraireCible(texte) {

    const noms =
        neoExtraireNoms(texte);

    return noms[1] || null;
}


//==============================================================
// 🧍 PARTIE DU CORPS
//==============================================================

function neoExtrairePartieCorps(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.partiesCorps
    );
}


//==============================================================
// 🥊 MANIÈRE
//==============================================================

function neoExtraireManiere(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.manieres
    );
}


//==============================================================
// ↔️ CÔTÉ
//==============================================================

function neoExtraireCote(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.cotes
    );
}


//==============================================================
// 🧭 DIRECTION
//==============================================================

function neoExtraireDirection(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.directions
    );
}


//==============================================================
// 🌀 TRAJECTOIRE
//==============================================================

function neoExtraireTrajectoire(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.trajectoires
    );
}


//==============================================================
// ⚡ VITESSE
//==============================================================

function neoExtraireVitesse(texte) {

    return neoTrouverNotion(
        texte,
        NEO_DICTIONNAIRES.vitesses
    );
}


//==============================================================
// 🧭 FIN DE TRAJET
//==============================================================

function neoExtraireFinTrajet(texte) {

    const t =
        neoNormaliserTexte(texte);

    const positions =
        NEO_DICTIONNAIRES.positions;

    for (
        const [position, variantes]
        of Object.entries(positions)
    ) {

        for (const variante of variantes) {

            if (
                t.includes(
                    neoNormaliserTexte(variante)
                )
            ) {
                return position;
            }
        }
    }

    return null;
}


//==============================================================
// 🧠 EXTRACTION GÉNÉRIQUE DES SLOTS
//==============================================================

function neoExtraireSlots(texte, action) {

    const slots = {};

    const sujet =
        neoExtraireSujet(texte);

    const cible =
        neoExtraireCible(texte);

    const maniere =
        neoExtraireManiere(texte);

    const partieCorps =
        neoExtrairePartieCorps(texte);

    const cote =
        neoExtraireCote(texte);

    const direction =
        neoExtraireDirection(texte);

    const trajectoire =
        neoExtraireTrajectoire(texte);

    const vitesse =
        neoExtraireVitesse(texte);

    const distance =
        neoExtraireDistance(texte);

    const hauteur =
        neoExtraireHauteur(texte);

    const angle =
        neoExtraireAngle(texte);

    const finTrajet =
        neoExtraireFinTrajet(texte);


    if (sujet)
        slots.SUJET = sujet;

    slots.ACTION = action;


    if (maniere)
        slots.MANIERE = maniere;

    if (cible)
        slots.CIBLE = cible;

    if (partieCorps)
        slots.PARTIE_CORPS =
            partieCorps;

    if (cote)
        slots.COTE = cote;

    if (direction)
        slots.DIRECTION =
            direction;

    if (trajectoire)
        slots.TRAJECTOIRE =
            trajectoire;

    if (vitesse)
        slots.VITESSE =
            vitesse;

    if (distance)
        slots.DISTANCE =
            distance;

    if (hauteur)
        slots.HAUTEUR =
            hauteur;

    if (angle !== null)
        slots.ANGLE =
            angle;

    if (finTrajet)
        slots.FIN_TRAJET =
            finTrajet;


    return slots;
}


//==============================================================
// 📊 COMPARER UN MODÈLE
//==============================================================

function neoComparerModele(
    slots,
    modele
) {

    const structure =
        modele.structure || [];

    const requis =
        modele.requis || [];

    let obtenus = 0;
    let poidsTotal = 0;
    let requisManquants = [];


    for (const slot of structure) {

        const obligatoire =
            requis.includes(slot);

        const poids =
            obligatoire ? 4 : 1;

        poidsTotal += poids;

        if (
            slots[slot] !== undefined &&
            slots[slot] !== null &&
            slots[slot] !== ""
        ) {

            obtenus += pesoSafe(poids);

        }
        else if (obligatoire) {

            requisManquants.push(slot);
        }
    }


    let score =
        poidsTotal > 0
            ? Math.round(
                (obtenus / poidsTotal) * 100
            )
            : 0;


    /*
     * Un modèle dont les éléments obligatoires
     * ne sont pas présents ne doit pas gagner
     * artificiellement contre un modèle plus adapté.
     */
    if (requisManquants.length > 0) {

        score =
            Math.min(score, 69);
    }


    return {
        score,
        requisManquants
    };
}


//==============================================================
// 🛡️ PETITE SÉCURITÉ
//==============================================================

function pesoSafe(valeur) {

    return Number.isFinite(valeur)
        ? valeur
        : 0;
}


//==============================================================
// 🏆 TROUVER LE MEILLEUR MODÈLE
//
// C'EST LA FONCTION CENTRALE.
//
// Elle ne connaît aucune catégorie.
// Elle reçoit une action.
// Elle parcourt uniquement les modèles
// de cette action.
//==============================================================

function neoTrouverMeilleurModele(
    action,
    slots
) {

    const modeles =
        NEO_ACTIONS_COMBAT[action];

    if (
        !Array.isArray(modeles) ||
        modeles.length === 0
    ) {
        return null;
    }


    let meilleur = null;


    for (const modele of modeles) {

        const comparaison =
            neoComparerModele(
                slots,
                modele
            );


        const resultat = {

            action,

            modele,

            score:
                comparaison.score,

            requisManquants:
                comparaison.requisManquants
        };


        if (
            !meilleur ||
            resultat.score > meilleur.score
        ) {

            meilleur = resultat;

        }

    }


    return meilleur;
}


//==============================================================
// 🧠 ANALYSE PRINCIPALE
//==============================================================

function analyserNeoAI(texte) {

    const texteOriginal =
        String(texte || "").trim();


    if (!texteOriginal) {

        return {
            texte: "",
            action: null,
            expression: null,
            slots: {},
            modele: null,
            score: 0,
            valide: false
        };

    }


    //==========================================================
    // 1️⃣ RECONNAISSANCE DE L'ACTION
    //==========================================================

    const reconnaissance =
        neoTrouverAction(
            texteOriginal
        );


    if (!reconnaissance) {

        return {

            texte:
                texteOriginal,

            action:
                null,

            expression:
                null,

            slots: {},

            modele:
                null,

            score:
                0,

            valide:
                false
        };

    }


    const action =
        reconnaissance.action;


    //==========================================================
    // 2️⃣ EXTRACTION DES SLOTS
    //==========================================================

    const slots =
        neoExtraireSlots(
            texteOriginal,
            action
        );


    //==========================================================
    // 3️⃣ MODÈLES DE CETTE ACTION UNIQUEMENT
    //==========================================================

    const modele =
        neoTrouverMeilleurModele(
            action,
            slots
        );


    //==========================================================
    // 4️⃣ RÉSULTAT
    //==========================================================

    return {

        texte:
            texteOriginal,

        action,

        expression:
            reconnaissance.expression,

        slots,

        modele:
            modele?.modele || null,

        score:
            modele?.score || 0,

        requisManquants:
            modele?.requisManquants || [],

        valide:
            Boolean(
                modele &&
                modele.score > 0
            )
    };
}


//==============================================================
// 🔄 ALIAS COMPATIBLE
//==============================================================
//
// Permet de continuer à appeler NeoAI depuis d'autres fichiers
// pendant la transition.
//==============================================================

function neoAnalyserStructureCombat(texte) {

    const resultat =
        analyserNeoAI(texte);

    return {

        action:
            resultat.action,

        slots:
            resultat.slots,

        modele:
            resultat.modele,

        score:
            resultat.score
    };
}


//==============================================================
// 📚 API PUBLIQUE
//==============================================================

module.exports = {

    NEO_DICTIONNAIRES,

    NEO_ACTIONS_COMBAT,

    analyserNeoAI,

    neoAnalyserStructureCombat,

    neoTrouverAction,

    neoExtraireSlots,

    neoTrouverMeilleurModele,

    neoComparerModele,

    neoNormaliserTexte

};
