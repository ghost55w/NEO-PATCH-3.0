const { ovlcmd } = require("../lib/ovlcmd");

const {
    getData,
    setfiche,
    getAllFiches
} = require("../DataBase/allstars_divs_fiches");

const { AllStarsDivsFiche } = require("../DataBase/allstars_divs_fiches");

const { cards } = require("../DataBase/cards");
const { MyNeoFunctions } = require("../DataBase/myneo_lineup_team");
const config = require("../set");

//-------- UTILITAIRES
const formatNumber = n => {
    try {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch {
        return n;
    }
};

const normalize = str =>
    String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");




//================= UTILS =================
function limiterStats(stats, stat, val) {
    stats[stat] = Math.max(0, Math.min(100, stats[stat] + val));
}

function clean(txt) {
    return txt.replace(/[\u2066-\u2069\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function normalizeName(str = "") {
    return String(str)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "") // retire les drapeaux
        .replace(/[^\p{L}\p{N}]/gu, "")         // garde seulement lettres et chiffres
        .toLowerCase()
        .trim();
}


//================================================
// 🎮 ACTIONS MAP — GAMEPLAY COMPLET
//================================================

const ACTIONS_MAP = {

    //================================================
    // 🥊 FRAPPES
    //================================================

    frappes: {

        mains: {

            coup_direct: {
                nom: "Coup direct",
                aliases: [
                    "coup de poing direct",
                    "coup direct",
                    "poing direct",
                    "direct",
                    "jab",
                    "straight"
                ],
                parametres: [
                    "main",
                    "zoneVisee"
                ]
            },

            crochet_gauche: {
                nom: "Crochet gauche",
                aliases: [
                    "crochet gauche",
                    "left hook",
                    "hook gauche"
                ],
                parametres: [
                    "zoneVisee"
                ]
            },

            crochet_droit: {
                nom: "Crochet droit",
                aliases: [
                    "crochet droit",
                    "right hook",
                    "hook droit"
                ],
                parametres: [
                    "zoneVisee"
                ]
            },

            uppercut: {
                nom: "Uppercut",
                aliases: [
                    "uppercut",
                    "coup uppercut"
                ],
                parametres: [
                    "main",
                    "zoneVisee"
                ]
            },

            uppercut_saute: {
                nom: "Uppercut sauté",
                aliases: [
                    "uppercut sauté",
                    "uppercut saute",
                    "rising uppercut"
                ],
                parametres: [
                    "main",
                    "hauteur",
                    "direction",
                    "zoneVisee"
                ]
            },

            revers: {
                nom: "Coup en revers",
                aliases: [
                    "coup en revers",
                    "revers",
                    "backfist"
                ],
                parametres: [
                    "main",
                    "zoneVisee"
                ]
            },

            revers_circulaire: {
                nom: "Revers circulaire",
                aliases: [
                    "revers circulaire",
                    "spinning backfist",
                    "spinning back fist"
                ],
                parametres: [
                    "angle",
                    "coteEngagement",
                    "main",
                    "zoneVisee"
                ]
            },

            marteau_descendant: {
                nom: "Coup marteau descendant",
                aliases: [
                    "coup marteau descendant",
                    "marteau descendant",
                    "coup marteau",
                    "hammer fist",
                    "hammer"
                ],
                parametres: [
                    "main",
                    "zoneVisee"
                ]
            },

            marteau_lateral: {
                nom: "Coup marteau latéral",
                aliases: [
                    "marteau latéral",
                    "marteau lateral",
                    "hammer fist side",
                    "hammer side"
                ],
                parametres: [
                    "main",
                    "direction",
                    "zoneVisee"
                ]
            },

            marteau_revers: {
                nom: "Coup marteau en revers",
                aliases: [
                    "marteau en revers",
                    "reverse hammer",
                    "reverse hammer fist"
                ],
                parametres: [
                    "main",
                    "direction",
                    "zoneVisee"
                ]
            }
        },


        //================================================
        // 🦵 PIEDS
        //================================================

        pieds: {

            front_kick: {
                nom: "Coup de pied frontal",
                aliases: [
                    "coup de pied frontal",
                    "front kick",
                    "frontkick",
                    "coup frontal"
                ],
                parametres: [
                    "pied",
                    "direction",
                    "zoneVisee"
                ]
            },

            roundhouse_kick: {
                nom: "Coup circulaire",
                aliases: [
                    "coup de pied circulaire",
                    "coup circulaire",
                    "roundhouse kick",
                    "roundhouse",
                    "kick circulaire"
                ],
                parametres: [
                    "pied",
                    "coteEngagement",
                    "zoneVisee"
                ]
            },

            side_kick: {
                nom: "Coup de pied latéral",
                aliases: [
                    "coup de pied latéral",
                    "coup de pied lateral",
                    "side kick",
                    "sidekick"
                ],
                parametres: [
                    "pied",
                    "direction",
                    "zoneVisee"
                ]
            },

            back_kick: {
                nom: "Coup de pied arrière",
                aliases: [
                    "coup de pied arrière",
                    "coup de pied arriere",
                    "back kick",
                    "backkick"
                ],
                parametres: [
                    "pied",
                    "angle",
                    "coteEngagement",
                    "zoneVisee"
                ]
            },

            hook_kick: {
                nom: "Coup de pied en crochet",
                aliases: [
                    "coup de pied en crochet",
                    "hook kick",
                    "hookkick",
                    "kick crochet"
                ],
                parametres: [
                    "pied",
                    "direction",
                    "zoneVisee"
                ]
            },

            axe_kick: {
                nom: "Coup de pied descendant",
                aliases: [
                    "coup de pied descendant",
                    "axe kick",
                    "axekick",
                    "coup descendant"
                ],
                parametres: [
                    "pied",
                    "hauteur",
                    "zoneVisee"
                ]
            },

            spinning_back_kick: {
                nom: "Coup de pied arrière circulaire",
                aliases: [
                    "coup de pied arrière circulaire",
                    "coup de pied arriere circulaire",
                    "spinning back kick",
                    "spinning backkick"
                ],
                parametres: [
                    "angle",
                    "coteEngagement",
                    "pied",
                    "direction",
                    "zoneVisee"
                ]
            },

            low_kick: {
                nom: "Coup bas",
                aliases: [
                    "coup de pied bas",
                    "coup bas",
                    "low kick",
                    "lowkick"
                ],
                parametres: [
                    "pied",
                    "zoneVisee"
                ]
            },

            knee_strike: {
                nom: "Coup de genou",
                aliases: [
                    "coup de genou",
                    "genou",
                    "knee strike"
                ],
                parametres: [
                    "pied",
                    "direction",
                    "zoneVisee"
                ]
            },

            flying_kick: {
                nom: "Coup sauté",
                aliases: [
                    "coup de pied sauté",
                    "coup sauté",
                    "coup saute",
                    "flying kick",
                    "flyingkick",
                    "kick sauté"
                ],
                parametres: [
                    "hauteur",
                    "direction",
                    "pied",
                    "zoneVisee"
                ]
            }
        }
    },


    //================================================
    // 🏃 DÉPLACEMENTS
    //================================================

    déplacements: {

        avancer: {
    nom: "Avancer",

    aliases: [
        "avance",
        "avancer",
        "s avance",
        "s avancer",
        "va devant",
        "va vers l avant",
        "avance devant",
        "avance vers l avant",
        "fonce",
        "foncer",
        "fonce vers",
        "foncer vers"
    ],

    parametres: [
        "direction",
        "distance",
        "vitesse"
    ]
},

        reculer: {
            nom: "Reculer",
            aliases: [
                "recule",
                "reculer",
                "s eloigne",
                "va derriere",
                "va vers l arriere",
                "s'écarte", 
                "recule vers"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        gauche: {
            nom: "Déplacement gauche",
            aliases: [
                "va à gauche",
                "va a gauche",
                "se déplace à gauche",
                "se deplace a gauche",
                "déplacement gauche",
                "deplacement gauche",
                "part à gauche",
                "part a gauche"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        droite: {
            nom: "Déplacement droite",
            aliases: [
                "va à droite",
                "va a droite",
                "se déplace à droite",
                "se deplace a droite",
                "déplacement droite",
                "deplacement droite",
                "part à droite",
                "part a droite"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        diagonal_avant_gauche: {
            nom: "Déplacement diagonal avant gauche",
            aliases: [
                "diagonale avant gauche",
                "diagonal avant gauche",
                "avance en diagonale gauche",
                "court en diagonale gauche",
                "fonce en diagonale gauche",
                "vers l avant gauche",
                "vers l avant gauche"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        diagonal_avant_droite: {
            nom: "Déplacement diagonal avant droit",
            aliases: [
                "diagonale avant droite",
                "diagonal avant droite",
                "avance en diagonale droite",
                "court en diagonale droite",
                "fonce en diagonale droite",
                "vers l avant droite",
                "vers l avant droit"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        diagonal_arriere_gauche: {
            nom: "Déplacement diagonal arrière gauche",
            aliases: [
                "diagonale arrière gauche",
                "diagonale arriere gauche",
                "diagonal arrière gauche",
                "diagonal arriere gauche",
                "recule en diagonale gauche",
                "part en diagonale arrière gauche",
                "part en diagonale arriere gauche"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        diagonal_arriere_droite: {
            nom: "Déplacement diagonal arrière droit",
            aliases: [
                "diagonale arrière droite",
                "diagonale arriere droite",
                "diagonal arrière droite",
                "diagonal arriere droite",
                "recule en diagonale droite",
                "part en diagonale arrière droite",
                "part en diagonale arriere droite"
            ],
            parametres: [
                "direction",
                "distance",
                "vitesse"
            ]
        },

        //================================================
// 🏃 MODES DE DÉPLACEMENT
//================================================

modes_deplacement: {

    course: {
        nom: "Course",

        aliases: [
            "course",
            "en course",
            "court",
            "courir"
        ]
    },

    sprint: {
        nom: "Sprint",

        aliases: [
            "sprint",
            "sprinte",
            "sprinter"
        ]
    },

    acceleration: {
        nom: "Accélération",

        aliases: [
            "accelere",
            "accélère",
            "acceleration",
            "accélération"
        ]
    }
}, 

        //================================================
        // 🦘 SAUT / BOND / VOL
        //================================================

        saut: {
            nom: "Saut",
            aliases: [
                "saute",
                "saut",
                "sauter"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        bond: {
            nom: "Bond",
            aliases: [
                "bond",
                "bondit",
                "bondir",
                "fait un bond",
                "grand bond"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        vol: {
            nom: "Vol",
            aliases: [
                "vole",
                "vol",
                "voler",
                "s envole",
                "senvole",
                "vol stationnaire"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        }
    },


    //================================================
    // 🔄 ROTATIONS / PIVOTS
    //================================================

    rotations: {

        pivot_60: {
            nom: "Pivot 60°",
            aliases: [
                "pivot 60",
                "pivot à 60",
                "pivot a 60",
                "rotation 60",
                "rotation à 60",
                "rotation a 60",
                "tourne à 60",
                "tourne a 60"
            ],
            parametres: [
                "angle",
                "coteEngagement"
            ]
        },

        pivot_90: {
            nom: "Pivot 90°",
            aliases: [
                "pivot 90",
                "pivot à 90",
                "pivot a 90",
                "rotation 90",
                "rotation à 90",
                "rotation a 90",
                "tourne à 90",
                "tourne a 90"
            ],
            parametres: [
                "angle",
                "coteEngagement"
            ]
        },

        pivot_180: {
            nom: "Pivot 180°",
            aliases: [
                "pivot 180",
                "pivot à 180",
                "pivot a 180",
                "rotation 180",
                "rotation à 180",
                "rotation a 180",
                "tourne à 180",
                "tourne a 180",
                "demi tour",
                "demi-tour"
            ],
            parametres: [
                "angle",
                "coteEngagement"
            ]
        },

        pivot_360: {
            nom: "Rotation 360°",
            aliases: [
                "pivot 360",
                "pivot à 360",
                "pivot a 360",
                "rotation 360",
                "rotation à 360",
                "rotation a 360",
                "tourne à 360",
                "tourne a 360",
                "tour complet"
            ],
            parametres: [
                "angle",
                "coteEngagement"
            ]
        }
    },


    //================================================
    // 🤸 ACROBATIES
    //================================================

    acrobaties: {

        salto_avant: {
            nom: "Salto avant",
            aliases: [
                "salto avant",
                "salto en avant",
                "front flip",
                "frontflip",
                "flip avant"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        salto_arriere: {
            nom: "Salto arrière",
            aliases: [
                "salto arrière",
                "salto arriere",
                "salto en arrière",
                "salto en arriere",
                "backflip",
                "back flip",
                "flip arrière",
                "flip arriere"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        salto_lateral_gauche: {
            nom: "Salto latéral gauche",
            aliases: [
                "salto latéral gauche",
                "salto lateral gauche",
                "salto gauche",
                "side flip gauche",
                "sideflip gauche"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        salto_lateral_droit: {
            nom: "Salto latéral droit",
            aliases: [
                "salto latéral droit",
                "salto lateral droit",
                "salto droite",
                "side flip droite",
                "sideflip droite"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        salto_360: {
            nom: "Salto 360°",
            aliases: [
                "salto 360",
                "salto à 360",
                "salto a 360",
                "flip 360",
                "flip à 360",
                "flip a 360"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        salto_540: {
            nom: "Salto 540°",
            aliases: [
                "salto 540",
                "salto à 540",
                "salto a 540",
                "flip 540",
                "flip à 540",
                "flip a 540"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        salto_720: {
            nom: "Salto 720°",
            aliases: [
                "salto 720",
                "salto à 720",
                "salto a 720",
                "flip 720",
                "flip à 720",
                "flip a 720"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        pirouette: {
            nom: "Pirouette",
            aliases: [
                "pirouette",
                "pirouette aérienne",
                "pirouette aerienne",
                "tour aérien",
                "tour aerien"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        rotation_aerienne_180: {
            nom: "Rotation aérienne 180°",
            aliases: [
                "rotation aérienne 180",
                "rotation aerienne 180",
                "tour aérien 180",
                "tour aerien 180"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        rotation_aerienne_360: {
            nom: "Rotation aérienne 360°",
            aliases: [
                "rotation aérienne 360",
                "rotation aerienne 360",
                "tour aérien 360",
                "tour aerien 360"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        rotation_aerienne_540: {
            nom: "Rotation aérienne 540°",
            aliases: [
                "rotation aérienne 540",
                "rotation aerienne 540",
                "tour aérien 540",
                "tour aerien 540"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        rotation_aerienne_720: {
            nom: "Rotation aérienne 720°",
            aliases: [
                "rotation aérienne 720",
                "rotation aerienne 720",
                "tour aérien 720",
                "tour aerien 720"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        roue_gauche: {
            nom: "Roue gauche",
            aliases: [
                "roue gauche",
                "cartwheel gauche",
                "roulade laterale gauche"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        roue_droite: {
            nom: "Roue droite",
            aliases: [
                "roue droite",
                "cartwheel droite",
                "roulade laterale droite"
            ],
            parametres: [
                "hauteur",
                "direction"
            ]
        },

        vrille: {
            nom: "Vrille",
            aliases: [
                "vrille",
                "vrille aérienne",
                "vrille aerienne",
                "spin aérien",
                "spin aerien"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        vrille_180: {
            nom: "Vrille 180°",
            aliases: [
                "vrille 180",
                "vrille à 180",
                "vrille a 180"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        },

        vrille_360: {
            nom: "Vrille 360°",
            aliases: [
                "vrille 360",
                "vrille à 360",
                "vrille a 360"
            ],
            parametres: [
                "angle",
                "hauteur",
                "direction",
                "coteEngagement"
            ]
        }
    },


    //================================================
    // 🛡️ DÉFENSE
    //================================================

    defenses: {

        garde: {
            nom: "Garde",
            aliases: [
                "garde",
                "se met en garde"
            ],
            parametres: []
        },

        esquive_gauche: {
            nom: "Esquive gauche",
            aliases: [
                "esquive gauche",
                "esquive sur la gauche"
            ],
            parametres: [
                "direction"
            ]
        },

        esquive_droite: {
            nom: "Esquive droite",
            aliases: [
                "esquive droite",
                "esquive sur la droite"
            ],
            parametres: [
                "direction"
            ]
        },

        esquive_arriere: {
            nom: "Esquive arrière",
            aliases: [
                "esquive arrière",
                "esquive arriere",
                "recule pour esquiver",
                "se baisse"
            ],
            parametres: [
                "direction"
            ]
        },

        blocage: {
            nom: "Blocage",
            aliases: [
                "blocage",
                "bloque le coup",
                "pare le coup",
                "pare"
            ],
            parametres: []
        }
    },


    //================================================
    // 🤼 CONTACT
    //================================================

    contact: {

        saisie: {
            nom: "Saisie",
            aliases: [
                "saisie",
                "attrape",
                "agrippe",
                "empoigne"
            ],
            parametres: [
                "zoneVisee"
            ]
        },

        projection: {
            nom: "Projection",
            aliases: [
                "projection",
                "projette",
                "jette au sol"
            ],
            parametres: [
                "direction",
                "distance"
            ]
        },

        repousser: {
            nom: "Repousser",
            aliases: [
                "repousse",
                "repousser",
                "pousse"
            ],
            parametres: [
                "direction",
                "distance"
            ]
        }
    }
};
        
                    
//================================================
// 🔎 NORMALISATION
//================================================
function normaliserAction(texte = "") {

    return String(texte)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
        .toLowerCase()
        .replace(/[’']/g, " ")
        .replace(/[^\p{L}\p{N}°\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

//================================================
// 🎮 CONFIGURATION PAVÉ ALL STARS
//================================================

const MAX_ACTIONS_PAVE = 4;

const DUREE_ACTION_NORMALE = 1;   // 1 seconde
const DUREE_ACTION_COMBO = 0.5;   // 0.5 seconde

//================================================
// 🧩 MOTS DE STRUCTURE
//================================================

const MOTS_STRUCTURE = new Set([
    "combo",
    "enchaîne",
    "enchaîne avec",
    "puis",
    "ensuite",
    "après"
]);

//================================================
// 📏⚡ MODIFICATEURS DE DÉPLACEMENT
//================================================

const MODIFICATEURS_DEPLACEMENT = {

    course: [
        "course",
        "en course",
        "court",
        "courant",
        "courir"
    ],

    sprint: [
        "sprint",
        "en sprint",
        "sprinte",
        "sprinter"
    ],

    acceleration: [
        "accélère",
        "accelere",
        "accélération",
        "acceleration",
        "accélérer",
        "accelerer"
    ],

    vmax: [
        "vmax",
        "v max",
        "vitesse maximale",
        "à vitesse maximale",
        "a vitesse maximale",
        "pleine vitesse",
        "à pleine vitesse",
        "a pleine vitesse",
        "vitesse max"
    ]
};


//================================================
// 🔎 EXTRACTION DES ACTIONS DANS L'ORDRE
//================================================
function extraireActionsChronologiques(texte = "") {

    const texteOriginal = String(texte);

    const texteNormalise =
        normaliserAction(texteOriginal);

    const toutesLesActions =
        obtenirToutesLesActions();

    //================================================
    // MODIFICATEURS
    //================================================

    const modificateurs =
        detecterModificateursDeplacement(
            texteOriginal
        );

    const occurrences = [];

    //================================================
    // MOTS À NE JAMAIS COMPTER COMME ACTIONS
    //================================================

    const motsModificateurs = new Set(
        Object.values(MODIFICATEURS_DEPLACEMENT)
            .flat()
            .map(x => normaliserAction(x))
    );

    //================================================
    // RECHERCHE DES ACTIONS
    //================================================

    for (const action of toutesLesActions) {

        const termes = [
            action.nom,
            ...(action.aliases || [])
        ];

        for (const terme of termes) {

            const termeNormalise =
                normaliserAction(terme);

            if (!termeNormalise) {
                continue;
            }

            // -----------------------------------------
            // IMPORTANT :
            // "course", "en course", sprint, etc.
            // ne sont PAS des actions.
            // -----------------------------------------

            if (
                action.categorie === "déplacements" &&
                motsModificateurs.has(termeNormalise)
            ) {
                continue;
            }

            const regex = new RegExp(
                `(^|\\s)${echapperRegex(termeNormalise)}(?=\\s|$)`,
                "g"
            );

            let match;

            while (
                (match = regex.exec(texteNormalise))
                !== null
            ) {

                const index =
                    match.index +
                    match[1].length;

                occurrences.push({

                    index,

                    fin:
                        index +
                        termeNormalise.length,

                    longueur:
                        termeNormalise.length,

                    id:
                        action.id,

                    nom:
                        action.nom,

                    categorie:
                        action.categorie,

                    groupe:
                        action.groupe,

                    termeDetecte:
                        terme,

                    termeNormalise,

                    description:
                        action.description || "",

                    modificateurs:
                        action.categorie === "déplacements"
                            ? modificateurs
                            : {}
                });

                if (
                    regex.lastIndex ===
                    match.index
                ) {
                    regex.lastIndex++;
                }
            }
        }
    }

    //================================================
    // TRI
    //================================================

    occurrences.sort((a, b) => {

        if (a.index !== b.index) {
            return a.index - b.index;
        }

        return b.longueur - a.longueur;
    });

    //================================================
    // SUPPRESSION DES CHEVAUCHEMENTS
    //================================================

    const actionsFinales = [];

    for (const action of occurrences) {

        let conflit = null;

        for (const precedente of actionsFinales) {

            const chevauchement =
                action.index < precedente.fin &&
                action.fin > precedente.index;

            if (chevauchement) {

                conflit = precedente;
                break;
            }
        }

        if (!conflit) {

            actionsFinales.push(action);

            continue;
        }

        if (
            action.longueur >
            conflit.longueur
        ) {

            const indexConflit =
                actionsFinales.indexOf(conflit);

            if (indexConflit !== -1) {

                actionsFinales.splice(
                    indexConflit,
                    1
                );

                actionsFinales.push(action);
            }

        } else {

            console.log(
                "♻️ ACTION IGNORÉE — CHEVAUCHEMENT :",
                action.termeDetecte,
                "avec",
                conflit.termeDetecte
            );
        }
    }

    //================================================
    // TRI FINAL
    //================================================

    actionsFinales.sort(
        (a, b) =>
            a.index - b.index
    );

    //================================================
// 🔢 NUMÉROTATION
//================================================

const resultat =
    actionsFinales.map(
        (action, index) => {

            const {
                index: position,
                termeNormalise,
                ...actionPropre
            } = action;

            return {

                ...actionPropre,

                ordre:
                    index + 1,

                numero:
                    index + 1,

                position
            };
        }
    );


//================================================
// 📋 DEBUG FINAL
//================================================

console.log(
    "✅ ACTIONS FINALES :",
    resultat.map(a => ({
        ordre: a.ordre,
        id: a.id,
        nom: a.nom,
        terme: a.termeDetecte,
        categorie: a.categorie,
        groupe: a.groupe,
        position: a.position
    }))
);


//================================================
// ↩️ RETOUR
//================================================

return resultat;
}


//================================================
// 🛡️ ÉCHAPPER REGEX
//================================================
function echapperRegex(texte = "") {

    return String(texte)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
    
//================================================
// 🧩 EXTRACTION DES PARAMÈTRES D'ACTION
//================================================

function extraireParametresAction(
    texte = "",
    action = {},
    actionsToutes = []
) {

    const texteComplet =
        String(texte);

    //================================================
    // 📍 POSITION DE DÉBUT
    //================================================

    const debut =
        Number.isInteger(action.position)
            ? action.position
            : 0;


    //================================================
    // 📍 POSITION DE FIN
    //================================================

    let fin =
        texteComplet.length;

    if (Array.isArray(actionsToutes)) {

        const actionSuivante =
            actionsToutes
                .filter(a =>
                    Number.isInteger(a.position) &&
                    a.position > debut
                )
                .sort(
                    (a, b) =>
                        a.position - b.position
                )[0];

        if (actionSuivante) {

            fin =
                actionSuivante.position;
        }
    }


    //================================================
    // ✂️ CONTEXTE DE L'ACTION
    //================================================

    const contexte =
        texteComplet.slice(
            debut,
            fin
        );


    const t =
        normaliserAction(contexte);


    console.log(
        "🧩 CONTEXTE ACTION :",
        action.nom,
        "=>",
        contexte
    );


    //================================================
    // 📦 PARAMÈTRES
    //================================================

    const params = {

        direction: null,

        distance: null,

        vitesse: null,

        vmax: null,

        hauteur: null,

        angle: null,

        coteEngagement: null,

        main: null,

        pied: null,

        genou: null,

        zoneVisee: null,

        partieCorps: null,

        mouvement: null,

        pivot: {
            angle: 0,
            sens: null
        },

        cible: null
    };


    //================================================
    // 🏃 MOUVEMENT
    //================================================

    const mouvements = [

        {
            valeur: "fonce",
            termes: [
                "fonce",
                "foncer"
            ]
        },

        {
            valeur: "court",
            termes: [
                "court",
                "courir",
                "en course"
            ]
        },

        {
            valeur: "avance",
            termes: [
                "avance",
                "avancer"
            ]
        },

        {
            valeur: "recule",
            termes: [
                "recule",
                "reculer"
            ]
        },

        {
            valeur: "deplace",
            termes: [
                "deplace",
                "deplacer",
                "se deplace"
            ]
        },

        {
            valeur: "pivote",
            termes: [
                "pivote",
                "pivoter",
                "rotation",
                "tourne",
                "tourner"
            ]
        }
    ];


    for (const mouvement of mouvements) {

        if (
            mouvement.termes.some(
                terme =>
                    t.includes(
                        normaliserAction(
                            terme
                        )
                    )
            )
        ) {

            params.mouvement =
                mouvement.valeur;

            break;
        }
    }


    //================================================
    // 🧭 DIRECTION
    //================================================

    params.direction =
        extraireDirection(
            contexte
        );


    //================================================
    // 📏 DISTANCE
    //================================================

    const vitesseDistance =
        extraireVitesseDistance(
            contexte
        );

    params.distance =
        vitesseDistance.distance;


    //================================================
    // ⚡ VITESSE
    //================================================

    params.vitesse =
        vitesseDistance.vitesse;


    //================================================
    // ⚡ VMAX
    //================================================

    const vmaxNumerique =
        t.match(
            /\bvmax\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*m\s*\/?\s*s\b/
        );

    if (vmaxNumerique) {

        params.vmax =
            Number(
                vmaxNumerique[1]
                    .replace(",", ".")
            );
    }

    else if (
        /\bvmax\b/.test(t) ||
        /\bvitesse max\b/.test(t) ||
        /\bvitesse maximale\b/.test(t)
    ) {

        params.vitesse =
            "vmax";
    }


    //================================================
    // 🦘 HAUTEUR
    //================================================

    params.hauteur =
        extraireHauteur(
            contexte
        );


    //================================================
    // 🔄 PIVOT / ROTATION
    //================================================

    const pivotMatch =
        t.match(
            /\b(?:pivote|pivoter|rotation|tourne|tourner)\b[\s\S]*?\b(60|90|180|360|540|720)\s*(?:°|degres?|deg)?\b/
        );

    if (pivotMatch) {

        params.pivot.angle =
            Number(
                pivotMatch[1]
            );


        //-------------------------------
        // ↩️ GAUCHE
        //-------------------------------

        if (
            /\b(?:sur|vers|a)\s+(?:ma\s+)?gauche\b/.test(t) ||
            /\bpivote\s+(?:de\s+)?gauche\b/.test(t)
        ) {

            params.pivot.sens =
                "gauche";
        }


        //-------------------------------
        // ↪️ DROITE
        //-------------------------------

        else if (
            /\b(?:sur|vers|a)\s+(?:ma\s+)?droite\b/.test(t) ||
            /\bpivote\s+(?:de\s+)?droite\b/.test(t)
        ) {

            params.pivot.sens =
                "droite";
        }
    }


    //================================================
    // 🔄 ANGLE SIMPLE
    //================================================

    if (
        !params.pivot.angle
    ) {

        params.angle =
            extraireAngle(
                contexte
            );
    }


    //================================================
    // ↩️ CÔTÉ D'ENGAGEMENT
    //================================================

    params.coteEngagement =
        extraireCoteEngagement(
            contexte
        );


    //================================================
    // ✊ MAIN
    //================================================

    params.main =
        extraireMain(
            contexte
        );


    //================================================
    // 🦶 PIED
    //================================================

    params.pied =
        extrairePied(
            contexte
        );


    //================================================
    // 🦵 GENOU
    //================================================

    if (
        /\bgenou\s+gauche\b/.test(t)
    ) {

        params.genou =
            "gauche";
    }

    else if (
        /\bgenou\s+droit\b/.test(t)
    ) {

        params.genou =
            "droite";
    }


    //================================================
    // 🎯 ZONE VISÉE
    //================================================

    params.zoneVisee =
        extraireZoneVisee(
            contexte
        );

    params.partieCorps =
        params.zoneVisee;


    //================================================
    // 🎯 CIBLE
    //================================================

    const cibleMatch =
        t.match(
            /\b(?:vers|sur|contre|attaque|frappe|vise|cible)\s+([a-z0-9_()'-]+)/
        );

    if (cibleMatch) {

        params.cible =
            cibleMatch[1];
    }


    //================================================
    // 📋 DEBUG
    //================================================

    console.log(
        "🧠 PARAMÈTRES ACTION :",
        action.nom,
        params
    );


    return params;
}


//================================================
// 🧭 EXTRACTION DIRECTION
//================================================

function extraireDirection(texte = "") {

    const t =
        normaliserAction(texte);

    const directions = [

        {
            valeur: "diagonale_avant_gauche",
            termes: [
                "diagonale avant gauche",
                "diagonal avant gauche",
                "avant gauche",
                "avant-gauche"
            ]
        },

        {
            valeur: "diagonale_avant_droite",
            termes: [
                "diagonale avant droite",
                "diagonal avant droite",
                "avant droite",
                "avant-droit"
            ]
        },

        {
            valeur: "diagonale_arriere_gauche",
            termes: [
                "diagonale arriere gauche",
                "diagonal arriere gauche",
                "arriere gauche",
                "arriere-gauche"
            ]
        },

        {
            valeur: "diagonale_arriere_droite",
            termes: [
                "diagonale arriere droite",
                "diagonal arriere droite",
                "arriere droite",
                "arriere-droit"
            ]
        },

        {
            valeur: "devant",
            termes: [
                "devant",
                "vers l avant",
                "en avant",
                "vers avant"
            ]
        },

        {
            valeur: "derriere",
            termes: [
                "derriere",
                "vers l arriere",
                "en arriere",
                "vers arriere"
            ]
        },

        {
            valeur: "gauche",
            termes: [
                "a gauche",
                "vers la gauche",
                "sur la gauche"
            ]
        },

        {
            valeur: "droite",
            termes: [
                "a droite",
                "vers la droite",
                "sur la droite"
            ]
        }
    ];

    // Les diagonales passent avant.
    for (
        const direction of directions
    ) {

        for (
            const terme of direction.termes
        ) {

            if (
                t.includes(
                    normaliserAction(terme)
                )
            ) {
                return direction.valeur;
            }
        }
    }

    return null;
}


//================================================
// 📏⚡MODIFICATION DE DISTANCE 
//================================================
function detecterModificateursDeplacement(texte = "") {

    const t = normaliserAction(texte);

    const result = {
        course: false,
        sprint: false,
        acceleration: false,
        vmax: false
    };

    for (const [type, termes] of Object.entries(
        MODIFICATEURS_DEPLACEMENT
    )) {

        for (const terme of termes) {

            const termeN = normaliserAction(terme);

            if (!termeN) continue;

            const regex = new RegExp(
                `(^|\\s)${echapperRegex(termeN)}(?=\\s|$)`,
                "i"
            );

            if (regex.test(t)) {
                result[type] = true;
                break;
            }
        }
    }

    return result;
}

//================================================
// ⚡ CALCUL DE LA VITESSE DE DÉPLACEMENT
//================================================
function determinerVitesseDeplacement(
    joueur,
    modificateurs = {}
) {

    // Par défaut : déplacement lent
    if (modificateurs.vmax) {

        // Vitesse maximale réelle du personnage
        return joueur.vitesseMax || joueur.speed || 1;
    }

    if (modificateurs.sprint) {

        return joueur.vitesseSprint
            || joueur.vitesseMax
            || joueur.speed
            || 1;
    }

    if (modificateurs.course) {

        return joueur.vitesseCourse
            || joueur.vitesseMax
            || joueur.speed
            || 1;
    }

    // Aucun modificateur = déplacement lent
    return 1;
}
//================================================
// 📏⚡ DISTANCE + VITESSE
//================================================

function extraireVitesseDistance(
    texte = ""
) {

    const t =
        normaliserAction(texte);

    let vitesse = null;
    let distance = null;

    //============================================
    // ⚡ VMAX
    //============================================

    if (
        /\bvmax\b/.test(t) ||
        /\bvitesse max\b/.test(t) ||
        /\bvitesse maximale\b/.test(t)
    ) {

        vitesse = "vmax";
    }

    //============================================
    // ⚡ VITESSE NUMÉRIQUE
    //============================================

    const vitesseMatch =
        t.match(
            /(?:vitesse|speed)\s*(?:de)?\s*(\d+(?:\.\d+)?)\s*m\s*\/?\s*s/
        );

    if (vitesseMatch) {

        vitesse =
            Number(vitesseMatch[1]);
    }

    //============================================
    // 📏 DISTANCE
    //============================================

    const distanceMatch =
        t.match(
            /(\d+(?:\.\d+)?)\s*(?:m|metre|metres)\b/
        );

    if (distanceMatch) {

        distance =
            Number(distanceMatch[1]);
    }

    return {
        vitesse,
        distance
    };
}

//================================================
// 🦘 EXTRACTION HAUTEUR
//================================================

function extraireHauteur(texte = "") {

    const t =
        normaliserAction(texte);

    //==============================
    // RAS DU SOL
    //==============================

    if (
        t.includes("ras du sol")
    ) {
        return 0;
    }

    //==============================
    // HAUTEUR EN CM
    //==============================

    const cm =
        t.match(
            /(\d+(?:\.\d+)?)\s*(?:cm|centimetres?|centimetres?)/
        );

    if (cm) {

        const hauteur =
            Number(cm[1]) / 100;

        if (
            hauteur <= 20
        ) {
            return hauteur;
        }
    }

    //==============================
    // HAUTEUR EN M
    //==============================

    const metres =
        t.match(
            /(\d+(?:\.\d+)?)\s*(?:m|metres?|metre)/
        );

    if (metres) {

        const hauteur =
            Number(metres[1]);

        if (
            hauteur <= 20
        ) {
            return hauteur;
        }
    }

    return null;
}

//================================================
// 🔄 EXTRACTION ANGLE
//================================================

function extraireAngle(texte = "") {

    const t =
        normaliserAction(texte);

    const match =
        t.match(
            /(\d+)\s*(?:°|degres?|deg)/
        );

    if (!match) {
        return null;
    }

    const angle =
        Number(match[1]);

    const autorises = [
        60,
        90,
        180,
        360,
        540,
        720
    ];

    if (
        !autorises.includes(angle)
    ) {
        return null;
    }

    return angle;
}

//================================================
// ↔️ CÔTÉ D'ENGAGEMENT
//================================================

function extraireCoteEngagement(
    texte = ""
) {

    const t =
        normaliserAction(texte);

    if (
        /\bpar sa gauche\b/.test(t) ||
        /\bpar la gauche\b/.test(t) ||
        /\bdu cote gauche\b/.test(t) ||
        /\ba gauche\b/.test(t)
    ) {

        return "gauche";
    }

    if (
        /\bpar sa droite\b/.test(t) ||
        /\bpar la droite\b/.test(t) ||
        /\bdu cote droit\b/.test(t) ||
        /\ba droite\b/.test(t)
    ) {

        return "droite";
    }

    return null;
}


//================================================
// ✊ EXTRACTION MAIN
//================================================

function extraireMain(texte = "") {

    const t =
        normaliserAction(texte);

    if (
        /\bdu droit\b/.test(t) ||
        /\bmain droite\b/.test(t) ||
        /\bpoing droit\b/.test(t)
    ) {

        return "droite";
    }

    if (
        /\bdu gauche\b/.test(t) ||
        /\bmain gauche\b/.test(t) ||
        /\bpoing gauche\b/.test(t)
    ) {

        return "gauche";
    }

    return null;
}

//================================================
// 🦶 EXTRACTION PIED
//================================================

function extrairePied(texte = "") {

    const t =
        normaliserAction(texte);

    if (
        /\bpied droit\b/.test(t) ||
        /\bjambe droite\b/.test(t) ||
        /\bdu pied droit\b/.test(t)
    ) {

        return "droit";
    }

    if (
        /\bpied gauche\b/.test(t) ||
        /\bjambe gauche\b/.test(t) ||
        /\bdu pied gauche\b/.test(t)
    ) {

        return "gauche";
    }

    return null;
}

//================================================
// 🎯 ZONE VISÉE
//================================================

function extraireZoneVisee(
    texte = ""
) {

    const t =
        normaliserAction(texte);

    const zones = [

        "pied gauche",
        "pied droit",

        "flanc gauche",
        "flanc droit",

        "avant bras",

        "visage",
        "tete",
        "menton",
        "machoire",

        "cou",

        "torse",
        "poitrine",

        "abdomen",
        "ventre",

        "cotes",
        "flanc",

        "epaule",

        "bras",
        "coude",
        "poignet",
        "main",

        "cuisse",
        "genou",
        "tibia",
        "mollet",
        "cheville",
        "pied"
    ];

    zones.sort(
        (a, b) =>
            b.length - a.length
    );

    for (
        const zone of zones
    ) {

        if (
            t.includes(zone)
        ) {

            return zone;
        }
    }

    return null;
}

//================================================
// ✅ VALIDATION PARAMÈTRES
//================================================

function validerParametresAction(
    action,
    parametres
) {

    const obligatoires =
        action.parametres || [];

    const manquants = [];

    for (
        const parametre of obligatoires
    ) {

        const valeur =
            parametres[parametre];

        if (
            valeur === null ||
            valeur === undefined ||
            valeur === ""
        ) {

            manquants.push(
                parametre
            );
        }
    }

    return {
        valide:
            manquants.length === 0,

        manquants
    };
}

//================================================
// 👤 EXTRACTION DES PERSONNAGES DU PAVÉ
//================================================
function extrairePersonnagesPave(
    pave = "",
    match = null
) {

    const texte = String(pave);

    const personnages = [];

    //============================================
    // 🎴 RÉCUPÉRATION DES PERSONNAGES DU DUEL
    //============================================

    if (match?.duel) {

        const duel = match.duel;

        if (duel.perso1?.nom) {
            personnages.push(duel.perso1.nom);
        }

        if (duel.perso2?.nom) {
            personnages.push(duel.perso2.nom);
        }
    }

    //============================================
    // 🔎 FALLBACK
    //============================================

    if (
        !personnages.length &&
        match?.joueurs
    ) {

        for (const joueur of match.joueurs) {

            if (joueur.personnage?.name) {

                personnages.push(
                    joueur.personnage.name
                );
            }
        }
    }


    //============================================
    // 🔎 RECHERCHE DANS LE TEXTE
    //============================================

    const trouves = [];

    for (const nom of personnages) {

        if (!nom) continue;

        const nomNormalise =
            normaliserAction(nom);

        const texteNormalise =
            normaliserAction(texte);

        if (
            nomNormalise &&
            texteNormalise.includes(nomNormalise)
        ) {

            trouves.push({
                nom,
                position:
                    texteNormalise.indexOf(
                        nomNormalise
                    )
            });
        }
    }


    //============================================
    // 📊 ORDRE D'APPARITION
    //============================================

    trouves.sort(
        (a, b) => a.position - b.position
    );

    return trouves;
}

//================================================
// 🆚 DÉTERMINER ACTEUR / CIBLE
//================================================

function determinerActeurEtCible(
    pave,
    actions,
    match
) {

    const personnages =
        extrairePersonnagesPave(
            pave,
            match
        );

    if (personnages.length < 2) {

        return {
            acteur: null,
            cible: null,
            valide: false,
            erreur:
                "Le pavé doit mentionner le personnage qui agit et le personnage ciblé."
        };
    }


    //============================================
    // 🎮 PREMIER PERSONNAGE
    //============================================

    const acteur = personnages[0];


    //============================================
    // 🎯 SECOND PERSONNAGE
    //============================================

    const cible = personnages[1];


    return {
        acteur,
        cible,
        valide: true
    };
}

//================================================
// 🌀 DÉTECTION DU COMBO
//================================================

function detecterCombo(pave = "") {

    const texte = normaliserAction(pave);

    return (
        texte.includes("combo") ||
        texte.includes("en combo")
    );
}

  //================================================
// 🎮 CONSTRUIRE LA SÉQUENCE DU PAVÉ
//================================================

function construireSequencePave(
    pave,
    match
) {

    //============================================
    // 🔎 DÉTECTION BRUTE DES ACTIONS
    //============================================

    const actions =
        extraireActionsChronologiques(pave);


    //============================================
    // ❌ AUCUNE ACTION
    //============================================

    if (!actions.length) {

        return {

            valide: false,

            erreur:
                "Aucune action reconnue dans le pavé.",

            actions: []
        };
    }


    //============================================
    // 🚫 MAXIMUM 4 ACTIONS
    //============================================

    if (actions.length > MAX_ACTIONS_PAVE) {

        return {

            valide: false,

            erreur:
                `Le pavé contient ${actions.length} actions. Maximum autorisé : ${MAX_ACTIONS_PAVE}.`,

            actions
        };
    }


    //============================================
    // 🧩 EXTRACTION DES PARAMÈTRES
    //============================================

    const actionsAvecParametres =
        actions.map(action => {

            const details =
                extraireParametresAction(
                    pave,
                    action,
                    actions
                );

            return {

                ...action,

                details
            };
        });


    //============================================
    // 👤 ACTEUR / CIBLE
    //============================================

    const relation =
        determinerActeurEtCible(
            pave,
            actionsAvecParametres,
            match
        );


    if (!relation.valide) {

        return {

            valide: false,

            erreur:
                relation.erreur,

            actions:
                actionsAvecParametres
        };
    }


    //============================================
    // 🌀 COMBO
    //============================================

    const combo =
        detecterCombo(pave);


    //============================================
    // ⏱️ DURÉE
    //============================================

    const dureeParAction =
        combo
            ? DUREE_ACTION_COMBO
            : DUREE_ACTION_NORMALE;


    const dureeTotale =
        actionsAvecParametres.length *
        dureeParAction;


    //============================================
    // 📦 SÉQUENCE FINALE
    //============================================

    const sequence =
        actionsAvecParametres.map(
            (action, index) => ({

                ordre:
                    index + 1,

                id:
                    action.id,

                nom:
                    action.nom,

                categorie:
                    action.categorie,

                groupe:
                    action.groupe,

                termeDetecte:
                    action.termeDetecte ||
                    action.terme,

                acteur:
                    relation.acteur.nom,

                cible:
                    relation.cible.nom,

                // ⭐ PARAMÈTRES EXTRAITS
                details:
                    action.details || {},

                combo,

                duree:
                    dureeParAction
            })
        );


    //============================================
    // 📋 DEBUG
    //============================================

    console.log(
        "🧠 ACTIONS AVEC PARAMÈTRES :",
        JSON.stringify(
            sequence,
            null,
            2
        )
    );


    //============================================
    // ✅ RÉSULTAT
    //============================================

    return {

        valide: true,

        acteur:
            relation.acteur.nom,

        cible:
            relation.cible.nom,

        combo,

        nombreActions:
            sequence.length,

        dureeParAction,

        dureeTotale,

        actions:
            sequence
    };
}  

//================================================
// 📚 OBTENIR TOUTES LES ACTIONS DISPONIBLES
//================================================

function obtenirToutesLesActions() {

const actions = [];  

//================================================  
// 🔁 PARCOURS RÉCURSIF  
//================================================  

function parcourir(  
    objet,  
    categorie = null,  
    groupe = null  
) {  

    if (  
        !objet ||  
        typeof objet !== "object" ||  
        Array.isArray(objet)  
    ) {  
        return;  
    }  


    for (  
        const [id, valeur] of Object.entries(objet)  
    ) {  

        if (  
            !valeur ||  
            typeof valeur !== "object" ||  
            Array.isArray(valeur)  
        ) {  
            continue;  
        }  


        //================================================  
        // 🎯 VRAIE ACTION  
        //================================================  

        if (  
            typeof valeur.nom === "string"  
        ) {  

            actions.push({  

                id,  

                categorie:  
                    categorie || id,  

                groupe:  
                    groupe || id,  

                nom:  
                    valeur.nom,  

                aliases:  
                    Array.isArray(valeur.aliases)  
                        ? valeur.aliases  
                        : [],  

                parametres:  
                    Array.isArray(valeur.parametres)  
                        ? valeur.parametres  
                        : [],  

                description:  
                    valeur.description || ""  
            });  

            continue;  
        }  


        //================================================  
        // 📂 SOUS-GROUPE  
        //================================================  

        parcourir(  

            valeur,  

            categorie || id,  

            groupe || id  

        );  
    }  
}  


//================================================  
// 🚀 LANCEMENT  
//================================================  

for (  
    const [categorie, groupes] of Object.entries(ACTIONS_MAP)  
) {  

    parcourir(  
        groupes,  
        categorie,  
        null  
    );  
}  


return actions;

}

//================================================
// 🛡️ VÉRIFICATION GROUPE
//================================================
function gruposValide(obj) {

    return (
        obj &&
        typeof obj === "object" &&
        !Array.isArray(obj)
    );
}


//================================================
// 🧠 DÉTECTION DES ACTIONS DANS UN PAVÉ
//================================================
function detecterActionsPave(texte = "") {

    const texteNormalise =
        normaliserAction(texte);

    const toutesLesActions =
        obtenirToutesLesActions();

    console.log(
        "🔎 Recherche des actions dans :",
        texte
    );

    console.log(
        "📚 Nombre d'actions disponibles :",
        toutesLesActions.length
    );

    const candidats = [];

    //================================================
    // 🔎 RECHERCHE DE TOUS LES TERMES
    //================================================

    for (const action of toutesLesActions) {

        const termes = [
            action.nom,
            ...(action.aliases || [])
        ];

        for (const terme of termes) {

            const termeNormalise =
                normaliserAction(terme);

            if (!termeNormalise) continue;

            const position =
                texteNormalise.indexOf(
                    termeNormalise
                );

            if (position === -1) continue;

            candidats.push({

                action,

                termeOriginal:
                    terme,

                termeNormalise,

                position,

                longueur:
                    termeNormalise.length
            });
        }
    }


    //================================================
    // 📍 ORDRE CHRONOLOGIQUE
    //    + TERMES LES PLUS LONGS EN PRIORITÉ
    //================================================

    candidats.sort((a, b) => {

        if (a.position !== b.position) {

            return a.position -
                   b.position;
        }

        return b.longueur -
               a.longueur;
    });


    const actionsDetectees = [];
    const zonesOccupees = [];


    //================================================
    // 🧹 ÉVITER LES DOUBLONS / SOUS-TERMES
    //================================================

    for (const candidat of candidats) {

        const debut =
            candidat.position;

        const fin =
            debut +
            candidat.longueur;


        //================================================
        // 🚫 LE TERME EST DÉJÀ COUVERT
        //================================================

        const dejaCouvert =
            zonesOccupees.some(
                zone =>
                    debut >= zone.debut &&
                    fin <= zone.fin
            );

        if (dejaCouvert) {

            console.log(
                "♻️ DÉTECTION IGNORÉE — SOUS-TERME :",
                candidat.termeOriginal
            );

            continue;
        }


        //================================================
        // 🔄 SUPPRIMER LES TERMES PLUS COURTS
        //    SI LE TERME ACTUEL EST PLUS PRÉCIS
        //================================================

        for (
            let i = zonesOccupees.length - 1;
            i >= 0;
            i--
        ) {

            const zone =
                zonesOccupees[i];

            const contientZone =
                debut <= zone.debut &&
                fin >= zone.fin;

            if (!contientZone) continue;


            const index =
                actionsDetectees.findIndex(
                    action =>
                        action._debut === zone.debut &&
                        action._fin === zone.fin
                );


            if (index !== -1) {

                console.log(
                    "🔄 TERME PLUS PRÉCIS :",
                    actionsDetectees[index]
                        .termeDetecte,
                    "→",
                    candidat.termeOriginal
                );

                actionsDetectees.splice(
                    index,
                    1
                );
            }

            zonesOccupees.splice(
                i,
                1
            );
        }


        //================================================
        // ✅ AJOUT DE L'ACTION
        //================================================

        actionsDetectees.push({

            id:
                candidat.action.id,

            nom:
                candidat.action.nom,

            categorie:
                candidat.action.categorie,

            groupe:
                candidat.action.groupe,

            termeDetecte:
                candidat.termeOriginal,

            description:
                candidat.action.description,

            // Données internes
            _debut:
                debut,

            _fin:
                fin
        });


        zonesOccupees.push({

            debut,

            fin
        });
    }


    //================================================
    // 🔢 TRI FINAL CHRONOLOGIQUE
    //================================================

    actionsDetectees.sort(
        (a, b) =>
            a._debut -
            b._debut
    );


    //================================================
    // 🧹 RETIRER LES DONNÉES INTERNES
    //================================================

    const resultat =
        actionsDetectees.map(action => {

            const {
                _debut,
                _fin,
                ...actionPropre
            } = action;

            return actionPropre;
        });


    console.log(
        "✅ ACTIONS TROUVÉES :",
        resultat
    );

    return resultat;
}



//================================================
// 🎮 EXTRACTION DU PAVÉ D'ACTION
//================================================
function extrairePaveAction(message = "") {

    const texte = clean(String(message));

    // Recherche du marqueur d'action
    const match = texte.match(
        /🌀🎮\s*:\s*([\s\S]*?)(?:\n\s*\n|\n╰|$)/i
    );

    if (!match) {
        return "";
    }

    return match[1].trim();
}

//================================================
// 🧠 ANALYSE DU PAVÉ DE MATCH
//================================================
function AnalysePaveMatch(
    message,
    joueur,
    match = null,
    auteurJid = null
) {

    //================================================
    // 🔐 VÉRIFICATIONS DE SÉCURITÉ
    //================================================

    if (!match || !auteurJid) {
        return null;
    }

    //================================================
    // 👥 JIDS AUTORISÉS DANS CE MATCH
    //================================================

    const joueursAutorises = [
        match.joueur1?.jid,
        match.joueur2?.jid,
        ...(match.joueurs || []).map(j => j?.jid)
    ].filter(Boolean);

    //================================================
    // 🚫 L'AUTEUR DOIT ÊTRE UN JOUEUR DU MATCH
    //================================================

    if (!joueursAutorises.includes(auteurJid)) {

        console.log(
            "🚫 PAVÉ IGNORÉ — JID NON CONCERNÉ PAR LE MATCH :",
            auteurJid
        );

        return null;
    }

    //================================================
    // 👤 IDENTIFIER LE JOUEUR CORRESPONDANT AU JID
    //================================================

    const joueurReel =
        (match.joueurs || []).find(
            j => j?.jid === auteurJid
        )
        ||
        (
            match.joueur1?.jid === auteurJid
                ? match.joueur1
                : match.joueur2?.jid === auteurJid
                    ? match.joueur2
                    : joueur
        );

    if (!joueurReel) {
        console.log(
            "🚫 PAVÉ IGNORÉ — JOUEUR INTROUVABLE POUR LE JID :",
            auteurJid
        );

        return null;
    }

    //================================================
    // 🎮 VÉRIFIER QUE C'EST BIEN UN PAVÉ DE JEU
    //================================================

    const texte = String(message || "");

    const estPaveJeu =
        texte.includes("🌀🎮") ||
        texte.includes("🎮🌀");

    if (!estPaveJeu) {

        console.log(
            "🚫 MESSAGE IGNORÉ — PAS UN PAVÉ DE JEU"
        );

        return null;
    }

    //================================================
    // 🧠 EXTRACTION DU PAVÉ
    //================================================

    const pave =
        extrairePaveAction(message);

    console.log(
        "========================================"
    );

    console.log(
        "🥊 ANALYSE PAVÉ ALL STARS"
    );

    console.log(
        "🆔 JID auteur :",
        auteurJid
    );

    console.log(
        "👤 Joueur :",
        joueurReel?.pseudo || "Inconnu"
    );

    console.log(
        "📝 Pavé :",
        pave || "(vide)"
    );

    //================================================
    // ❌ AUCUN PAVÉ D'ACTION
    //================================================

    if (!pave) {

        return {
            valide: false,

            note: 0,

            pave: "",

            sequence: null,

            actions: [],

            erreurs: [
                "Aucune action détectée dans la section 🌀🎮."
            ],

            raison:
                "Le joueur doit écrire son action dans la section 🌀🎮."
        };
    }

    
    //============================================
    // 🎮 CONSTRUCTION DE LA SÉQUENCE
    //============================================

    const sequence =
        construireSequencePave(
            pave,
            match
        );


    console.log(
        "🎮 SÉQUENCE :",
        sequence
    );


    //============================================
    // ❌ SÉQUENCE INVALIDE
    //============================================

    if (!sequence.valide) {

        console.log(
            "❌ PAVÉ REFUSÉ :",
            sequence.erreur
        );

        return {

            valide: false,

            note: 0,

            pave,

            sequence,

            actions:
                sequence.actions || [],

            erreurs: [
                sequence.erreur
            ],

            raison:
                sequence.erreur,

            joueur: joueur
                ? {
                    pseudo: joueur.pseudo,
                    jid: joueur.jid
                }
                : null
        };
    }


    //============================================
    // 📊 CALCUL DE LA NOTE DE BASE
    //============================================

    let note = 0;

    const erreurs = [];


    //============================================
    // 1️⃣ ACTIONS
    //============================================

    if (
        sequence.nombreActions >= 1
    ) {

        note += 4;

    }


    //============================================
    // 2️⃣ DÉTAIL
    //============================================

    const nombreMots =
        pave
            .split(/\s+/)
            .filter(Boolean)
            .length;


    if (nombreMots >= 8) {

        note += 2;

    }

    else if (nombreMots >= 4) {

        note += 1;

    }

    else {

        erreurs.push(
            "Action trop peu détaillée."
        );
    }


    //============================================
    // 3️⃣ CIBLE
    //============================================

    const precision = [

        "visage",
        "tête",
        "tete",
        "torse",
        "ventre",
        "abdomen",
        "flanc",
        "côtes",
        "cotes",
        "jambe",
        "cuisse",
        "mollet",
        "menton",
        "épaule",
        "epaule",
        "dos",
        "bras"
    ];


    const paveNormalise =
        normaliserAction(pave);


    const precisionTrouvee =
        precision.some(
            mot =>
                paveNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (precisionTrouvee) {

        note += 2;

    }

    else {

        erreurs.push(
            "Cible insuffisamment précise."
        );
    }


    //============================================
    // 4️⃣ COHÉRENCE
    //============================================

    const verbesAction = [

        "frappe",
        "frapper",

        "lance",
        "lancer",

        "avance",
        "avancer",

        "fonce",
        "foncer",

        "recule",
        "reculer",

        "esquive",

        "bloque",

        "pare",

        "saute",

        "tourne",

        "attrape",

        "agrippe",

        "repousse",

        "projette"
    ];


    const verbeTrouve =
        verbesAction.some(
            verbe =>
                paveNormalise.includes(
                    normaliserAction(verbe)
                )
        );


    if (verbeTrouve) {

        note += 2;

    }

    else {

        erreurs.push(
            "Action insuffisamment décrite."
        );
    }


    //============================================
    // 🔟 LIMITE
    //============================================

    note =
        Math.max(
            0,
            Math.min(10, note)
        );


    //============================================
    // ✅ VALIDATION
    //============================================

    const valide =
        sequence.valide &&
        sequence.nombreActions >= 1 &&
        note >= 4;


    console.log(
        "📊 NOTE :",
        note,
        "/10"
    );

    console.log(
        "🔢 ACTIONS :",
        sequence.nombreActions
    );

    console.log(
        "👤 ACTEUR :",
        sequence.acteur
    );

    console.log(
        "🎯 CIBLE :",
        sequence.cible
    );

    console.log(
        "🌀 COMBO :",
        sequence.combo
    );

    console.log(
        "⏱️ DURÉE TOTALE :",
        sequence.dureeTotale,
        "s"
    );


    console.log(
        "========================================"
    );


    return {

        valide,

        note,

        pave,

        acteur:
            sequence.acteur,

        cible:
            sequence.cible,

        sequence,

        actions:
            sequence.actions,

        nombreActions:
            sequence.nombreActions,

        combo:
            sequence.combo,

        dureeTotale:
            sequence.dureeTotale,

        erreurs,

        joueur: joueur
            ? {
                pseudo: joueur.pseudo,
                jid: joueur.jid
            }
            : null
    };
}

//================================================
// 📊 RÉSULTAT ANALYSE PAVÉ
//================================================

function genererResultatAnalysePave(
    analyse,
    prochainJoueur
) {

    //============================================
    // ❌ REFUS
    //============================================

    if (!analyse.valide) {

        const raison =
            analyse.erreurs?.length
                ? analyse.erreurs.join(" ")
                : analyse.raison ||
                  "Action invalide.";

        return `░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

❌: ${raison}

📊Note du pavé : ${analyse.note}/10 ❌

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆joueur suivant:
➡️ @${prochainJoueur.pseudo} NEXT!! 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;
    }


    //============================================
    // 🧠 ACTIONS
    //============================================

    const actions =
        Array.isArray(analyse.actions)
            ? analyse.actions
            : [];


    //============================================
    // 🛑 SÉCURITÉ
    //============================================

    if (!actions.length) {

        return `░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

❌ Aucune action reconnue dans le pavé.

📊Note du pavé : ${analyse.note}/10 ❌

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆joueur suivant:
➡️ @${prochainJoueur.pseudo} NEXT!! 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;
    }


    //============================================
    // 🧍 ACTEUR
    //============================================

    const acteur =
        analyse.acteur ||
        actions[0].acteur ||
        "Le joueur";


    //============================================
    // 📝 GÉNÉRATEUR DE DESCRIPTION COURTE
    //============================================

    function genererDescriptionAction(action) {

        const nom =
            String(
                action.nom || ""
            ).toLowerCase();

        const details =
            action.details || {};

        const categorie =
            String(
                action.categorie || ""
            ).toLowerCase();


        //========================================
        // 🏃 DÉPLACEMENTS
        //========================================

        if (
            categorie === "déplacements" ||
            categorie === "deplacements"
        ) {

            let texte = "";


            switch (action.id) {

                case "avancer":
                    texte = "avance";
                    break;

                case "reculer":
                    texte = "recule";
                    break;

                case "gauche":
                    texte =
                        "se déplace vers la gauche";
                    break;

                case "droite":
                    texte =
                        "se déplace vers la droite";
                    break;

                case "diagonal_avant_gauche":
                    texte =
                        "avance en diagonale vers la gauche";
                    break;

                case "diagonal_avant_droite":
                    texte =
                        "avance en diagonale vers la droite";
                    break;

                case "diagonal_arriere_gauche":
                    texte =
                        "recule en diagonale vers la gauche";
                    break;

                case "diagonal_arriere_droite":
                    texte =
                        "recule en diagonale vers la droite";
                    break;

                default:
                    texte =
                        nom
                            ? nom
                            : "effectue un déplacement";
                    break;
            }


            //====================================
            // ⚡ STYLE
            //====================================

            if (
                details.mouvement === "court"
            ) {

                texte +=
                    " à grande vitesse en course";

            } else if (
                details.mouvement === "fonce"
            ) {

                texte +=
                    " à grande vitesse";
            }


            //====================================
            // 🎯 CIBLE
            //====================================

            if (
                details.cible
            ) {

                texte +=
                    ` vers ${details.cible}`;

            } else if (
                action.cible &&
                action.cible !== acteur
            ) {

                texte +=
                    ` vers ${action.cible}`;
            }


            return texte;
        }


        //========================================
        // 🥊 ATTAQUES / COMBAT
        //========================================

        if (
            categorie === "attaques" ||
            categorie === "attaque" ||
            categorie === "combat" ||
            categorie === "offensives" ||
            categorie === "offensive"
        ) {

            /*
             * On utilise le NOM DE L'ACTION.
             *
             * Exemple :
             *
             * "coup de poing"
             * "reverse punch"
             * "coup de pied"
             * "uppercut"
             *
             * Mais on ne raconte PAS les détails :
             *
             * ❌ "frappe Tobirama au visage avec..."
             * ❌ "pivot de 90°..."
             * ❌ "à 8 m/s..."
             */

            let attaque =
                nom || "attaque";


            // Petites corrections de formulation
            if (
                attaque === "attaque"
            ) {

                attaque =
                    "attaque";
            }


            if (
                /^coup de poing$/i.test(attaque)
            ) {

                return "attaque avec un coup de poing";
            }


            if (
                /^coup de pied$/i.test(attaque)
            ) {

                return "attaque avec un coup de pied";
            }


            if (
                /^frappe$/i.test(attaque)
            ) {

                return "frappe";
            }


            if (
                /^tir$/i.test(attaque)
            ) {

                return "tire";
            }


            return `attaque avec ${attaque}`;
        }


        //========================================
        // 🌀 DRIBBLE
        //========================================

        if (
            categorie === "dribbles" ||
            categorie === "dribble"
        ) {

            return `effectue ${nom}`;
        }


        //========================================
        // ⚽ PASSE
        //========================================

        if (
            categorie === "passes" ||
            categorie === "passe"
        ) {

            return `effectue une ${nom}`;
        }


        //========================================
        // 🎯 AUTRE
        //========================================

        return nom ||
            "effectue une action";
    }


    //============================================
    // 🧩 CONSTRUCTION DE LA NARRATION
    //============================================

    const descriptions =
        actions.map(
            action =>
                genererDescriptionAction(
                    action
                )
        );


    //============================================
    // 🔗 ASSEMBLAGE
    //============================================

    let description =
        `${acteur} ${descriptions[0]}`;


    for (
        let i = 1;
        i < descriptions.length;
        i++
    ) {

        description +=
            ` puis ${descriptions[i]}`;
    }


    //============================================
    // 🔚 FIN
    //============================================

    description += ".";


    //============================================
    // 📋 DEBUG
    //============================================

    console.log(
        "📝 NARRATION FINALE :",
        description
    );


    //============================================
    // 📤 MESSAGE FINAL
    //============================================

    return `░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

✅ ACTIONS VALIDÉES :
- ${description}

📊Note du pavé : ${analyse.note}/10 ⭐

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔆joueur suivant:
➡️ @${prochainJoueur.pseudo} NEXT!! 🔥

╰───────────────────
               *JUMP BATTLE ARENA 🌀🔆*`;
}

               

//================= RECHERCHE FICHE PAR PSEUDO =================
async function getFicheByPseudo(pseudo) {

    const fiches = await getAllFiches();

    // 1️⃣ Correspondance exacte d'abord
    let fiche = fiches.find(f => f.pseudo === pseudo);

    if (fiche) return fiche;

    // 2️⃣ Correspondance insensible à la casse
    fiche = fiches.find(f =>
        String(f.pseudo).toLowerCase() === String(pseudo).toLowerCase()
    );

    if (fiche) return fiche;

    // 3️⃣ En dernier seulement, version normalisée
    const candidats = fiches.filter(f =>
        normalizeName(f.pseudo) === normalizeName(pseudo)
    );

    // Si plusieurs fiches correspondent, on privilégie celle qui possède un JID
    return candidats.find(f => f.jid && f.jid !== "aucun") || candidats[0];
}

function randomImage(list) {
    return list[Math.floor(Math.random() * list.length)];
}


//================================================
// 🏟️ ARENES
//================================================
const arenes = [
    {
        nom: "Desert Montagneux⛰️",
        image: "https://files.catbox.moe/aoximf.jpg"
    },
    {
        nom: "Ville en Ruines🏚️",
        image: "https://files.catbox.moe/2qmvpa.jpg"
    },
    {
        nom: "Centre-ville🏙️",
        image: "https://files.catbox.moe/pzlkf9.jpg"
    },
    {
        nom: "Arise🌇",
        image: "https://files.catbox.moe/3vlsmw.jpg"
    },
    {
        nom: "Salle du temps ⌛",
        image: "https://files.catbox.moe/j4e1pp.jpg"
    },
    {
        nom: "Valley de la fin🗿",
        image: "https://files.catbox.moe/m0k1jp.jpg"
    },
    {
        nom: "École d'exorcisme de Tokyo📿",
        image: "https://files.catbox.moe/rgznzb.jpg"
    },
    {
        nom: "Marinford🏰",
        image: "https://files.catbox.moe/4bygut.jpg"
    },
    {
        nom: "Cathédrale⛩️",
        image: "https://files.catbox.moe/ie6jvx.jpg"
    }
];


//================================================
// 🌀 DUELS PAR GROUPE
//================================================
const duelsEnCours = {};
const matchAttente = {};

let lastArenaIndex = -1;


//================================================
// 🏟️ TIRAGE ALEATOIRE DE L'ARENE
//================================================
function tirerAr() {

    let i;

    do {
        i = Math.floor(Math.random() * arenes.length);
    } while (
        arenes.length > 1 &&
        i === lastArenaIndex
    );

    lastArenaIndex = i;

    return arenes[i];
}

//================================================
// ⭐ HIERARCHIE DES CATEGORIES
//================================================
const HIERARCHIE_CATEGORIES = [
    "S-",
    "S",
    "S+",
    "S+ super",
    "S+ ultra",
    "S+ extreme",
    "S+ mega",
    "S+ ultimate",

    "SS-",
    "SS",
    "SS+",
    "SS+ super",
    "SS+ ultra",
    "SS+ extreme",
    "SS+ mega",
    "SS+ ultimate"
];


//================================================
// 🔎 NORMALISATION DE CATEGORIE
//================================================
function normalizeCategorie(categorie = "") {

    return String(categorie)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


//================================================
// 📊 OBTENIR LE NIVEAU D'UNE CATEGORIE
//================================================
function getNiveauCategorie(categorie) {

    const normalisee = normalizeCategorie(categorie);

    const index = HIERARCHIE_CATEGORIES.findIndex(
        c => normalizeCategorie(c) === normalisee
    );

    return index;
}


//================================================
// ⚖️ COMPARER DEUX CATEGORIES
//================================================
function comparerCategories(categorie1, categorie2) {

    const niveau1 = getNiveauCategorie(categorie1);
    const niveau2 = getNiveauCategorie(categorie2);

    if (niveau1 === -1 || niveau2 === -1) {
        console.log(
            "⚠️ Catégorie inconnue :",
            categorie1,
            categorie2
        );

        return 0;
    }

    if (niveau1 > niveau2) return 1;

    if (niveau1 < niveau2) return -1;

    return 0;
}

//================================================
// 🎴 PREPARATION DES PERSONNAGES POUR LE MATCH
//================================================
function preparerPersonnageMatch(joueur, personnage) {

    return {

        // Joueur propriétaire
        pseudo: joueur.pseudo,
        jid: joueur.jid,

        // Personnage / carte
        nom: personnage.name,

        image: personnage.image,

        grade: personnage.grade,

        category: personnage.category,

        //========================================
        // ❤️ STATS DE COMBAT
        //========================================
        stats: {

            // Endurance
            sta: 100,

            // Energie
            energie: 100,

            // Points de vie
            pv: 100
        }
    };
}

//================================================
// 🆚 CREATION DU DUEL
//================================================
function creerDuel(match) {

    const joueur1 = match.joueurs[0];
    const joueur2 = match.joueurs[1];

    const personnage1 = joueur1.personnage;
    const personnage2 = joueur2.personnage;

    //============================================
    // 🏟️ ARENE ALEATOIRE
    //============================================
    const arene = tirerAr();

    //============================================
    // 📊 COMPARAISON DES CATEGORIES
    //============================================
    const comparaison = comparerCategories(
        personnage1.category,
        personnage2.category
    );

    let avantageCategorie = "Égalité";

    if (comparaison > 0) {
        avantageCategorie =
            `${personnage1.name} possède la catégorie supérieure`;
    }

    else if (comparaison < 0) {
        avantageCategorie =
            `${personnage2.name} possède la catégorie supérieure`;
    }

    //============================================
    // 🎴 CREATION DES PERSONNAGES
    //============================================
    const perso1 = preparerPersonnageMatch(
        joueur1,
        personnage1
    );

    const perso2 = preparerPersonnageMatch(
        joueur2,
        personnage2
    );
//============================================
// ⚖️ CALCUL DE L'AVANTAGE
//============================================
const avantage = calculerAvantage(
    personnage1,
    personnage2
);
    
    //============================================
    // 🆚 DUEL
    //============================================
    const duel = {

    id: match.id,

    joueur1: joueur1,
    joueur2: joueur2,

    perso1: perso1,
    perso2: perso2,

    equipe1: [
        perso1
    ],

    equipe2: [
        perso2
    ],

    arene: arene,

    tour: 0,

    avantage: avantage,

    avantageCategorie: avantageCategorie,

    etat: "ready",

    createdAt: Date.now()
};

    return duel;
}

//================================================
// 🆚 FICHE DUEL
//================================================
function generateFicheDuel(duel) {

    const perso1 = duel.perso1;
    const perso2 = duel.perso2;

    return `*🆚VERSUS ARENA BATTLE🏆🎮*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒░░▒░

🔆🎴 *${perso1.nom}* :
🫀 Sta : ${perso1.stats.sta}%
🌀 En : ${perso1.stats.energie}%
❤️ Pv : ${perso1.stats.pv}%

                         ~  *🆚*  ~

🔆🎴 *${perso2.nom}* :
🫀 Sta : ${perso2.stats.sta}%
🌀 En : ${perso2.stats.energie}%
❤️ Pv : ${perso2.stats.pv}%

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*🌍 𝐀𝐫𝐞̀𝐧𝐞* : ${duel.arene.nom}
*🚫 𝐇𝐚𝐧𝐝𝐢𝐜𝐚𝐩𝐞* : Boost 1 fois chaque 2 tours!
*⚖️ 𝐒𝐭𝐚𝐭𝐬* : ${duel.avantage.texte}
*🏞️ 𝐀𝐢𝐫 𝐝𝐞 𝐜𝐨𝐦𝐛𝐚𝐭* : illimitée
*🦶🏼 𝐃𝐢𝐬𝐭𝐚𝐧𝐜𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐞 📌* : 5m
*⌚ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞* : 7mins ⚠️
*⭕ 𝐏𝐨𝐫𝐭𝐞́* : 10m

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

*⚠️ Vous avez 🔟 tours max pour finir votre Adversaire !*
*Sinon la victoire sera donnée par décision selon l'offensive !*

╰───────────────────
                            🌀🔆`;
}


//================================================
// 🚀 LANCEMENT DU MATCH ALL STARS
//================================================
async function lancerMatchAllStars(match, chat, ovl) {

    try {

        console.log("🚀 PRÉPARATION DU MATCH :", match.id);

        match.etat = "loading_match";

        //========================================
        // 🌀 MESSAGE DE CHARGEMENT
        //========================================
        const loading = await ovl.sendMessage(chat, {
            text: "🏟️ Sélection de l'arène."
        });


        //========================================
        // 🏟️ ÉTAPE 1 — 15 SECONDES
        //========================================
        for (const txt of [
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène...",
            "🏟️ Sélection de l'arène..",
            "🏟️ Sélection de l'arène..."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🌀 ÉTAPE 2 — 15 SECONDES
        //========================================
        for (const txt of [
            "🌀 Préparation du match.",
            "🌀 Préparation du match..",
            "🌀 Préparation du match...",
            "🌀 Préparation du match.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🔥 ÉTAPE 3 — 15 SECONDES
        //========================================
        for (const txt of [
            "🔥 Initialisation du combat.",
            "🔥 Initialisation du combat..",
            "🔥 Initialisation du combat...",
            "🔥 Initialisation du combat.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // ♨️ ÉTAPE 4 — 15 SECONDES
        //========================================
        for (const txt of [
            "♨️ Le combat va commencer.",
            "♨️ Le combat va commencer..",
            "♨️ Le combat va commencer...",
            "♨️ Le combat va commencer.."
        ]) {

            await new Promise(resolve =>
                setTimeout(resolve, 3500)
            );

            await ovl.sendMessage(chat, {
                text: txt,
                edit: loading.key
            });
        }


        //========================================
        // 🆚 CRÉATION DU DUEL
        //========================================
        const duel = creerDuel(match);

        match.duel = duel;

        match.arene = duel.arene;

        match.etat = "in_match";


        //========================================
        // 🏟️ AFFICHAGE DE L'ARÈNE
        //========================================
        await ovl.sendMessage(chat, {

            image: {
                url: duel.arene.image
            },

            caption: generateFicheDuel(duel)

        });


        //========================================
        // ♨️ DÉMARRAGE DU COMBAT
        //========================================
        await demarrerCombat(
            match,
            chat,
            ovl
        );


        //========================================
        // 📊 LOGS
        //========================================

        console.log(
            "🏟️ Arène sélectionnée :",
            duel.arene.nom
        );

        console.log(
            "🎴 Personnage 1 :",
            duel.perso1.nom,
            "| Catégorie :",
            duel.perso1.category
        );

        console.log(
            "🎴 Personnage 2 :",
            duel.perso2.nom,
            "| Catégorie :",
            duel.perso2.category
        );


    } catch (error) {

        console.error(
            "❌ ERREUR LANCEMENT MATCH ALL STARS :",
            error
        );

        match.etat = "error";

        await ovl.sendMessage(chat, {
            text:
`❌ Une erreur est survenue lors du lancement du match.

Veuillez réessayer.`
        });
    }
}

//================================================
// 🏆 HIERARCHIE DES GRADES
//================================================
const HIERARCHIE_GRADES = [
    "Bronze",
    "Argent",
    "Or"
];


//================================================
// ⚖️ COMPARAISON GRADE
//================================================
function getNiveauGrade(grade = "") {

    const index = HIERARCHIE_GRADES.findIndex(
        g => g.toLowerCase() === String(grade).toLowerCase()
    );

    return index;
}

//================================================
// ⚖️ CALCUL DE L'AVANTAGE TOTAL
//================================================
function calculerAvantage(personnage1, personnage2) {

    const cat1 = getNiveauCategorie(personnage1.category);
    const cat2 = getNiveauCategorie(personnage2.category);

    //============================================
    // 1️⃣ CATÉGORIE DIFFÉRENTE
    //============================================
    if (cat1 !== cat2) {

        const ecart = Math.abs(cat1 - cat2);

        if (cat1 > cat2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 2️⃣ CATÉGORIE ÉGALE → GRADE
    //============================================
    const grade1 = getNiveauGrade(personnage1.grade);
    const grade2 = getNiveauGrade(personnage2.grade);

    if (grade1 !== grade2) {

        const ecart = Math.abs(grade1 - grade2);

        if (grade1 > grade2) {
            return {
                joueur: 1,
                valeur: ecart,
                texte: `${personnage1.name} +${ecart}`
            };
        }

        return {
            joueur: 2,
            valeur: ecart,
            texte: `${personnage2.name} +${ecart}`
        };
    }

    //============================================
    // 3️⃣ CATÉGORIE + GRADE IDENTIQUES
    //============================================
    return {
        joueur: 0,
        valeur: 0.5,
        texte: `${personnage1.name} +0.5 / ${personnage2.name} +0.5`,
        statsEqual: true
    };
}

//================================================
// 🥊 DETERMINER QUI COMMENCE
//================================================
function determinerPremierJoueur(match) {

    const j1 = match.joueurs[0];
    const j2 = match.joueurs[1];

    const p1 = j1.personnage;
    const p2 = j2.personnage;

    //============================================
    // 1️⃣ COMPARAISON DES CATEGORIES
    //============================================
    const cat1 = getNiveauCategorie(p1.category);
    const cat2 = getNiveauCategorie(p2.category);

    console.log("⚖️ Catégorie J1 :", p1.category, cat1);
    console.log("⚖️ Catégorie J2 :", p2.category, cat2);

    // Catégories différentes
    if (cat1 < cat2) {
        return {
            joueur: j1,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat2 - cat1,
            statsEqual: false
        };
    }

    if (cat2 < cat1) {
        return {
            joueur: j2,
            raison: "catégorie inférieure",
            type: "category",
            ecart: cat1 - cat2,
            statsEqual: false
        };
    }


    //============================================
    // 2️⃣ CATÉGORIES ÉGALES → COMPARAISON GRADE
    //============================================
    const grade1 = getNiveauGrade(p1.grade);
    const grade2 = getNiveauGrade(p2.grade);

    console.log("🏅 Grade J1 :", p1.grade, grade1);
    console.log("🏅 Grade J2 :", p2.grade, grade2);

    // Grades différents
    if (grade1 < grade2) {
        return {
            joueur: j1,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade2 - grade1,
            statsEqual: false
        };
    }

    if (grade2 < grade1) {
        return {
            joueur: j2,
            raison: "grade inférieur",
            type: "grade",
            ecart: grade1 - grade2,
            statsEqual: false
        };
    }

//============================================
// 3️⃣ CATÉGORIE + GRADE IDENTIQUES
//============================================
const joueurAleatoire =
    Math.random() < 0.5 ? j1 : j2;

return {
    joueur: joueurAleatoire,
    raison: "catégorie et grade identiques → tirage 0.5",
    type: "random",
    ecart: 0.5,
    statsEqual: true
};
}

//================================================
// ⏱️ TIMER DU JOUEUR ACTIF
//================================================
function lancerTimerTour(match, chat, ovl) {

    // Sécurité : annuler les anciens timers
    if (match.timerTour) {
        clearTimeout(match.timerTour);
    }

    if (match.timerWarning) {
        clearTimeout(match.timerWarning);
    }

    const joueur = match.joueurActif;

    if (!joueur || !joueur.jid) {
        console.log("❌ Impossible de lancer le timer : joueur actif introuvable");
        return;
    }

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    console.log(
        "⏱️ TIMER LANCÉ POUR :",
        pseudo,
        "| JID :",
        jid
    );

    //============================================
    // ⚠️ AVERTISSEMENT À 6 MINUTES
    //============================================
    match.timerWarning = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Le joueur doit toujours être celui qui joue
        if (actuel.joueurActif?.jid !== jid) return;

        await ovl.sendMessage(chat, {
            text:
`⚠️ *PLUS QU'1 MINUTE !*

➡️ @${pseudo}

Il te reste seulement 1 minute pour envoyer ton pavé !`,
            mentions: [jid]
        });

    }, 6 * 60 * 1000);


    //============================================
    // ⏰ FIN DES 7 MINUTES
    //============================================
    match.timerTour = setTimeout(async () => {

        const actuel = duelsEnCours[match.id];

        if (!actuel) return;

        if (actuel.etat !== "in_match") return;

        // Vérifie que le joueur est toujours actif
        if (actuel.joueurActif?.jid !== jid) return;

        console.log(
            "⏰ TEMPS ÉCOULÉ POUR :",
            pseudo
        );

        await ovl.sendMessage(chat, {
            text:
`⏰ *TEMPS ÉCOULÉ !*

➡️ @${pseudo}

Tu n'as pas envoyé ton pavé dans les 7 minutes.

❌ Ton tour est perdu.`
        });

    }, 7 * 60 * 1000);
}

//================================================
// ♨️ DEBUT DU COMBAT
//================================================
async function demarrerCombat(match, chat, ovl) {

    const premier = determinerPremierJoueur(match);

    const joueur = premier.joueur;

    const jid = joueur.jid;
    const pseudo = joueur.pseudo;

    // Sauvegarde du joueur actif
    match.joueurActif = joueur;
    match.joueurActifJid = jid;

    match.tour = 1;
    match.phase = "attaque";

    console.log(
        "♨️ PREMIER JOUEUR :",
        pseudo,
        "| JID :",
        jid,
        "| Raison :",
        premier.raison
    );

    //================================================
    // 🎬 MEDIA DE DEBUT DU COMBAT
    //================================================
    await ovl.sendMessage(chat, {
    video: {
        url: "https://files.catbox.moe/1td1ai.mp4"
    },
    gifPlayback: true,
    caption:
`*♨️🎮 DEBUT DU COMBAT🌀*
▔▔▔▔▔▔▔▔▔
➡️ @${pseudo} GO !!!! 🔥

╰───────────────────
                            🌀🔆`,
    mentions: [jid]
});

    //================================================
    // ⏱️ TIMER UNIQUEMENT POUR LE PREMIER JOUEUR
    //================================================
    lancerTimerTour(match, chat, ovl);
}



// COMMANDE DE LANCEMENT DU MATCH🌀🆚//
ovlcmd({
    nom_cmd: "match🌀",
    classe: "ALLSTARS🌀",
    react: "🌀",
    desc: "Lancer un match VS"
}, async (ms_org, ovl, cmd_options) => {

    const chat = ms_org.from || ms_org.key?.remoteJid || ms_org;

    const matchId = Date.now().toString();

    // 🧠 création du match
duelsEnCours[matchId] = {
    id: matchId,
    etat: "waiting_players",
    joueurs: [],
    fiches: {},
    personnages: {},
    arene: null,
    tour: 0,
    createdAt: Date.now(),

    timers: {
        waitingPlayers: null,
        turn: null,
        warning: null
    }
};

    matchAttente[chat] = matchId;

    const images = [
        "https://files.catbox.moe/fc5v8n.jpg",
        "https://files.catbox.moe/8g6zu2.jpg"
    ];

    const img = images[Math.floor(Math.random() * images.length)];

    await ovl.sendMessage(chat, {
        image: { url: img },
        caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔅 *MATCH MAKING*
Veuillez inscrire vos pseudos de joueurs:

*🎮 Joueur 1:*
*🎮 Joueur 2:*

⏳ Vous avez 2 minutes pour répondre.

╰───────────────────
🔆 ALL STARS JUMP 🌀`
    });

    // ⏱️ TIMER 2 MINUTES
match.timers.waitingPlayers = setTimeout(async () => {

    const matchActuel = duelsEnCours[matchId];

    if (!matchActuel) return;

    if (matchActuel.etat !== "waiting_players") return;

    await ovl.sendMessage(chat, {
        text:
`⛔ MATCH ANNULÉ
Aucun joueur valide détecté dans le temps imparti.`
    });

    delete duelsEnCours[matchId];
    delete matchAttente[chat];

}, 120000);
});

//================================================
// 🌀 SYSTEME INSCRIPTION JOUEURS MATCH
//================================================
async function verifierJoueursMatch(message, chat, ovl) {


    const matchId = matchAttente[chat];

    if (!matchId) return;


    const match = duelsEnCours[matchId];


    if (!match || match.etat !== "waiting_players") return;



    // Vérifie que c'est bien la fiche du match
    if(
        !message.includes("Joueur 1") ||
        !message.includes("Joueur 2")
    ) return;



    const j1 = message.match(/joueur\s*1\s*:\s*(.+)/i);
    const j2 = message.match(/joueur\s*2\s*:\s*(.+)/i);



    if(!j1 || !j2) return;



    const pseudo1 = j1[1].trim();
const pseudo2 = j2[1].trim();

const fiche1 = await getFicheByPseudo(pseudo1);
const fiche2 = await getFicheByPseudo(pseudo2);

console.log("Pseudo reçu J1 :", pseudo1);
console.log("Pseudo reçu J2 :", pseudo2);

const toutes = await getAllFiches();
console.log("Tous les pseudos :", toutes.map(x => x.pseudo));

if (!fiche1 || !fiche2) {

    await ovl.sendMessage(chat,{
        text:
`❌ JOUEUR INTROUVABLE

${!fiche1 ? `❌ ${pseudo1}` : ""}
${!fiche2 ? `❌ ${pseudo2}` : ""}

Les joueurs doivent posséder une fiche ALL STARS.`
    });

    return;
}
    
const data1 = fiche1.dataValues || fiche1;
const data2 = fiche2.dataValues || fiche2;

match.joueurs=[
{
    pseudo: data1.pseudo,
    jid: data1.jid,
    fiche: data1
},
{
    pseudo: data2.pseudo,
    jid: data2.jid,
    fiche: data2
}
];

console.log("🆔 JID J1 :", data1.jid);
console.log("🆔 JID J2 :", data2.jid);

console.log("🎮 Joueurs sauvegardés :", match.joueurs);

    match.fiches={
        joueur1: fiche1,
        joueur2: fiche2
    };

    if (match.timers?.waitingPlayers) {
    clearTimeout(match.timers.waitingPlayers);
    match.timers.waitingPlayers = null;
    }
    match.etat="loading_characters";

    await ovl.sendMessage(chat,{
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
✅ JOUEURS CONFIRMÉS 🎉

🎮 Joueur 1 : ${fiche1.pseudo}
              🆚
🎮 Joueur 2 : ${fiche2.pseudo}

📂 Les deux fiches ont été trouvées.

╰───────────────────
                      🔆🌀`
    });

   
    const msg = await ovl.sendMessage(chat,{
        text:"🌀 Chargement."
    });

    for(const txt of [
        "🌀 Chargement.",
        "🌀 Chargement..",
        "🌀 Chargement..."
    ]){

        await new Promise(r=>setTimeout(r,500));


        await ovl.sendMessage(chat,{
            text:txt,
            edit:msg.key
        });

    }

    match.etat="waiting_cards";
    
    const imagesChoixPersonnage = [
    "https://files.catbox.moe/ygzb4n.jpg",
    "https://files.catbox.moe/a49tvk.jpg",
    "https://files.catbox.moe/vvspfe.jpg",
    "https://files.catbox.moe/txd8so.jpg"
];

const imgChoix = imagesChoixPersonnage[
    Math.floor(Math.random() * imagesChoixPersonnage.length)
];

await ovl.sendMessage(chat,{
    image: {
        url: imgChoix
    },
    caption:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔▔▔
*🎮\`CHOIX DU PERSONNAGE\`*

♨️Veuillez écrire le nom complet de vos personnages !

Exemple :
🌀 Tanjiro
🌀 Sasuke Hebi
🌀 Goku SSJ

🎮⌛ Temps d'attente : 2 minutes...

╰───────────────────
                      🔆🌀`
});   
 }

//================================================
// 🎴 SYSTEME CHOIX DES PERSONNAGES / CARDS
//================================================
async function verifierCardsMatch(message, chat, ovl, sender) {

    const matchId = matchAttente[chat];

    if (!matchId) return;

    const match = duelsEnCours[matchId];

    if (!match || match.etat !== "waiting_cards") return;


    // ============================================
// 🎮 DÉTERMINER LE JOUEUR QUI DOIT CHOISIR
// ============================================

// ⚠️ Le message peut venir du BOT lui-même.
// On ne doit donc PAS utiliser `sender` pour identifier
// le joueur qui choisit sa carte.

console.log(
    "🤖 JID du message reçu :",
    sender
);

console.log(
    "🆔 JID des joueurs sauvegardés :",
    match.joueurs.map(j => j.jid)
);


// ============================================
// 🎴 CHERCHER LE PREMIER JOUEUR
// QUI N'A PAS ENCORE CHOISI
// ============================================

const joueur = match.joueurs.find(
    j => !j.personnage
);


if (!joueur) {

    console.log(
        "❌ Tous les joueurs ont déjà choisi leur personnage."
    );

    return;
}


console.log(
    "✅ Joueur identifié pour le choix :",
    joueur.pseudo,
    "| JID :",
    joueur.jid
);


    const texte = clean(message);


    // 🚫 Ignorer les messages système
    if (
        texte.includes("ANIME JUMP VERSUS") ||
        texte.includes("CHOIX DU PERSONNAGE") ||
        texte.includes("Veuillez écrire")
    ) return;


    const nomCarte = texte
    .replace(/^[🌀]\s*/u, "")
    .trim();


    if (!nomCarte) return;


    console.log(
        "🎴 Carte demandée :",
        nomCarte,
        "par",
        joueur.pseudo
    );

// ============================================
// 🎴 RÉCUPÉRATION DES CARTES
// 🔥 MÊME SYSTÈME QUE LA BOUTIQUE
// ============================================

const allCards = [];

for (const [placementKey, placementCards] of Object.entries(cards)) {

    for (const c of placementCards) {

        allCards.push({
            ...c,
            placement: placementKey
        });

    }
}


// ============================================
// 🔎 NORMALISATION
// ============================================

const normaliserCarte = str =>
    String(str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-_]/g, "")
        .trim();

const recherche = normaliserCarte(nomCarte);

console.log("🔎 Recherche carte normalisée :", recherche);


// ============================================
// 🎴 RECHERCHE EXACTE
// ============================================

let carte = allCards.find(c =>
    normaliserCarte(c.name) === recherche
);


// ============================================
// 🎴 RECHERCHE PARTIELLE
// ============================================

if (!carte) {

    carte = allCards.find(c =>
        normaliserCarte(c.name).includes(recherche)
    );

}


// ============================================
// ❌ CARTE INTROUVABLE
// ============================================

if (!carte) {

    console.log(
        "❌ Carte introuvable dans la base :",
        nomCarte
    );

    console.log(
        "🔎 Recherche utilisée :",
        recherche
    );

    return;
}


// ============================================
// ✅ CARTE TROUVÉE
// ============================================

console.log(
    "🎴 CARTE TROUVÉE :",
    carte.name
);

console.log(
    "📊 Grade :",
    carte.grade,
    "| Catégorie :",
    carte.category
);
   
// ============================================
// 📂 FICHE DU JOUEUR DÉJÀ SAUVEGARDÉE
// ============================================

const ficheData = joueur.fiche.dataValues || joueur.fiche;


// ============================================
// 🎴 CARTES POSSÉDÉES
// ============================================

const cartesJoueur = ficheData.cards
    ? ficheData.cards
        .split("\n")
        .map(c => c.trim())
        .filter(Boolean)
    : [];


console.log(
    "🎴 Cartes de",
    joueur.pseudo,
    ":",
    cartesJoueur
);


// ============================================
// ✅ VÉRIFICATION DE POSSESSION
// ============================================

const cartePossedee = cartesJoueur.find(c =>
    normaliserCarte(c) === recherche
);


if (!cartePossedee) {

    await ovl.sendMessage(chat, {
        text:
`❌ CARTE NON POSSÉDÉE

🎮 ${joueur.pseudo}
n'a pas la carte :
🎴 ${nomCarte}

Choisis une carte présente dans ta fiche.`
    });

    return;
}


// ============================================
// 🎴 CARTE DÉJÀ TROUVÉE DANS LA BASE
// ============================================

const card = carte;

console.log("🎴 CARTE TROUVÉE :", card);


// ============================================
// 💾 SAUVEGARDE DU PERSONNAGE
// ============================================

joueur.personnage = card;

console.log(
    "✅ Carte validée :",
    joueur.pseudo,
    "=>",
    card.name
);


// ============================================
// 🖼️ CONFIRMATION
// ============================================

await ovl.sendMessage(chat, {
    image: {
        url: card.image
    },
    caption:
`🎴🌀 *Carte :* ${card.name}

Nom : ${card.name}
Grade : ${card.grade}
Catégorie : ${card.category}

▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░
                                 🔆🌀`
});

   
    // ============================================
    // 🔥 LES DEUX JOUEURS ONT CHOISI
    // ============================================
if (
    match.joueurs[0].personnage &&
    match.joueurs[1].personnage
) {

    match.personnages = {
        joueur1: match.joueurs[0].personnage,
        joueur2: match.joueurs[1].personnage
    };

    match.etat = "cards_loaded";

    await ovl.sendMessage(chat, {
        text:
`🌀🔆 *ANIME JUMP VERSUS🆚*
▔▔▔▔▔▔▔▔▔▔
🎴 PERSONNAGES FINALISÉS ✅

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

                🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                      🔆🌀`
    });


//============================================
// ⏳ MATCH PRÊT → CHARGEMENT PENDANT 1 MINUTE
//============================================
match.etat = "waiting_match_start";

//============================================
// 🖼️ IMAGE DE CREATION DU MATCH
//============================================
const imagesMatch = [
    "https://files.catbox.moe/fc5v8n.jpg",
    "https://files.catbox.moe/8g6zu2.jpg"
];

const imageMatch = imagesMatch[
    Math.floor(Math.random() * imagesMatch.length)
];

//============================================
// 🎴 MESSAGE DES JOUEURS PRÊTS
//============================================
await ovl.sendMessage(chat, {

    image: {
        url: imageMatch
    },

    caption:
`🌀🔆 *ANIME JUMP VERSUS*

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

🎴✅ *LES JOUEURS SONT PRÊTS !*
*LE MATCH DÉBUTERA DANS 1 MIN⌚ ...*

🎮 ${match.joueurs[0].pseudo}
➡️ ${match.joueurs[0].personnage.name}

🆚

🎮 ${match.joueurs[1].pseudo}
➡️ ${match.joueurs[1].personnage.name}

╰───────────────────
                             🔆🌀`
});

//============================================
// ⏱️ ATTENTE AVANT LE CHARGEMENT
//============================================
// Petite pause avant de commencer les animations
await new Promise(resolve =>
    setTimeout(resolve, 1000)
);


//============================================
// 🚀 LANCEMENT DU CHARGEMENT
//============================================
await lancerMatchAllStars(
    match,
    chat,
    ovl
); 
}       
}

//================================================
// 🛑 COMMANDE ARRÊT DU MATCH
//================================================
ovlcmd({
    nom_cmd: "stopmatch🌀",
    classe: "ALLSTARS🌀",
    react: "🛑",
    desc: "Arrêter le match ALL STARS en cours"
}, async (ms_org, ovl, cmd_options) => {

    const chat =
        ms_org.from ||
        ms_org.key?.remoteJid ||
        ms_org;

    //============================================
    // 🔎 RECHERCHE DU MATCH DU GROUPE
    //============================================
    const matchId = matchAttente[chat];

    if (!matchId) {

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Il n'y a actuellement aucun match ALL STARS actif dans ce groupe.`
        });

        return;
    }

    //============================================
    // 🔎 RECUPERATION DU MATCH
    //============================================
    const match = duelsEnCours[matchId];

    if (!match) {

        // Nettoyage au cas où matchAttente
        // contient un ancien ID
        delete matchAttente[chat];

        await ovl.sendMessage(chat, {
            text:
`❌ *AUCUN MATCH EN COURS*

Le match associé à ce groupe n'existe plus.`
        });

        return;
    }

    //============================================
    // 🛑 ARRET DU MATCH
    //============================================
    const joueurs = match.joueurs || [];

    const nomsJoueurs = joueurs.length
        ? joueurs.map(j => j.pseudo).join(" 🆚 ")
        : "Aucun joueur enregistré";

    console.log(
        "🛑 MATCH ARRÊTÉ :",
        matchId,
        "| Groupe :",
        chat,
        "| Joueurs :",
        nomsJoueurs
    );

    //============================================
    // 🗑️ SUPPRESSION DU MATCH
    //============================================
    delete duelsEnCours[matchId];
    delete matchAttente[chat];

    //============================================
    // 📢 MESSAGE
    //============================================
    await ovl.sendMessage(chat, {
        text:
`🛑 *MATCH ALL STARS ARRÊTÉ*

${nomsJoueurs}

❌ Le match a été annulé avec succès.

╰───────────────────
                 🌀🔆`
    });
});
               
module.exports = {
    verifierJoueursMatch,
    verifierCardsMatch,
    lancerMatchAllStars,
    AnalysePaveMatch,
    genererResultatAnalysePave,
    duelsEnCours,
    matchAttente,
    lancerTimerTour
};
