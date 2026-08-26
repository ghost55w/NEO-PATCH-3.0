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

//================================================
// ⚡ VITESSE MAXIMALE SELON LE GRADE
//================================================

function obtenirVitesseMaxParGrade(grade) {

    const g =
        String(grade || "")
            .toLowerCase()
            .trim();

    switch (g) {

        case "bronze":
            return 6;

        case "argent":
            return 8;

        case "or":
            return 10;

        default:
            return null;
    }
}


//================================================
// ⚡ VITESSE EFFECTIVE DU PERSONNAGE
//================================================

function obtenirVitesseEffective(
    joueur,
    details = {}
) {

    //============================================
    // 🚫 Aucune vitesse maximale demandée
    //============================================

    if (details.vmax !== true) {

        // Vitesse numérique explicitement donnée
        if (
            typeof details.vmax === "number"
        ) {

            return details.vmax;
        }

        // Vitesse normale
        if (
            typeof details.vitesse === "number"
        ) {

            return details.vitesse;
        }

        return null;
    }


    //============================================
    // 🎴 RÉCUPÉRATION DU GRADE
    //============================================

    const grade =
        joueur?.grade ||
        joueur?.Grade ||
        joueur?.card?.grade ||
        joueur?.carte?.grade ||
        null;


    //============================================
    // ⚡ VMAX SELON LE GRADE
    //============================================

    const vitesse =
        obtenirVitesseMaxParGrade(
            grade
        );


    //============================================
    // 📋 DEBUG
    //============================================

    console.log(
        "⚡ VMAX PERSONNAGE :",
        joueur?.nom ||
        joueur?.name ||
        "Inconnu",
        "| Grade :",
        grade,
        "| Vitesse :",
        vitesse
            ? `${vitesse} m/s`
            : "INCONNUE"
    );


    return vitesse;
}

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
// 📏⚔️ CONFIGURATION DISTANCES COMBAT ALL STARS
//================================================

// Distance initiale entre deux combattants
const DISTANCE_INITIALE_COMBAT = 5;

// Distance "close"
const DISTANCE_CLOSE = 0.5;

// Portée maximale des attaques
const PORTEE_MAIN = 0.5;
const PORTEE_PIED = 1.0;

// Tolérance pour éviter les erreurs de décimales
const TOLERANCE_DISTANCE = 0.01;

//================================================
// 🎮 ACTIONS MAP — ALL STARS
//================================================

const ACTIONS_MAP = {

    //================================================
    // 🥊 FRAPPES
    //================================================

    frapper: {

        //================================================
        // 👊 FRAPPES AVEC LES MAINS
        //================================================

        mains: {

            // 1 — COUP DIRECT
            coup_direct: {
                aliases: [
                    "coup direct",
                    "direct",
                    "coup de poing direct",
                    "poing direct",
                    "jab",
                    "straight"
                ],
                type: "poing",
                trajectoire: "directe",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 2 — CROCHET GAUCHE
            crochet_gauche: {
                aliases: [
                    "crochet gauche",
                    "left hook",
                    "hook gauche"
                ],
                type: "poing",
                main: "gauche",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 3 — CROCHET DROIT
            crochet_droit: {
                aliases: [
                    "crochet droit",
                    "right hook",
                    "hook droit"
                ],
                type: "poing",
                main: "droite",
                trajectoire: "circulaire",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 4 — UPPERCUT
            uppercut: {
                aliases: [
                    "uppercut",
                    "coup de poing remontant"
                ],
                type: "poing",
                trajectoire: "montante",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 5 — UPPERCUT SAUTÉ
            uppercut_saute: {
                aliases: [
                    "uppercut sauté",
                    "rising uppercut",
                    "uppercut en sautant"
                ],
                type: "poing",
                trajectoire: "montante",
                mouvement: "saut",
                surface: [
                    "phalanges",
                    "poing"
                ]
            },

            // 6 — COUP EN REVERS
            backfist: {
                aliases: [
                    "coup en revers",
                    "backfist",
                    "revers"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 7 — REVERS CIRCULAIRE
            spinning_backfist: {
                aliases: [
                    "revers circulaire",
                    "spinning backfist",
                    "spinning back fist"
                ],
                type: "poing",
                trajectoire: "circulaire",
                rotation: [
                    "180",
                    "360"
                ],
                surface: [
                    "dos du poing"
                ]
            },

            // 8 — MARTEAU DESCENDANT
            hammer_descendant: {
                aliases: [
                    "coup marteau descendant",
                    "marteau descendant",
                    "hammer",
                    "hammer fist",
                    "hammer descendant"
                ],
                type: "poing",
                trajectoire: "descendante",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 9 — MARTEAU LATÉRAL
            hammer_lateral: {
                aliases: [
                    "coup marteau latéral",
                    "marteau latéral",
                    "hammer fist side",
                    "side hammer"
                ],
                type: "poing",
                trajectoire: "latérale",
                surface: [
                    "tranchant du poing",
                    "poing"
                ]
            },

            // 10 — MARTEAU EN REVERS
            reverse_hammer: {
                aliases: [
                    "coup marteau en revers",
                    "marteau en revers",
                    "reverse hammer",
                    "reverse hammer fist"
                ],
                type: "poing",
                trajectoire: [
                    "horizontale",
                    "diagonale"
                ],
                surface: [
                    "dos du poing"
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


    //================================================
    // 🏃 DÉPLACEMENTS
    //================================================

    deplacer: {

        avancer: [
            "avance",
            "avancer",
            "avance vers",
            "fonce vers",
            "se rapproche",
            "approche"
        ],

        reculer: [
            "recule",
            "reculer",
            "se recule",
            "prend du recul"
        ],

        gauche: [
            "va à gauche",
            "se déplace à gauche",
            "déplacement gauche"
        ],

        droite: [
            "va à droite",
            "se déplace à droite",
            "déplacement droite"
        ],

        dash: [
            "dash",
            "dash avant",
            "dash arrière",
            "dash gauche",
            "dash droit"
        ],

        course: [
            "court",
            "course",
            "fonce",
            "sprint"
        ],

        vmax: [
            "vmax",
            "à vitesse maximale",
            "vitesse maximale",
            "à pleine vitesse"
        ],

        deplacement_instantane: [
            "déplacement instantané",
            "instantané",
            "téléportation"
        ],

        saut: [
            "saute",
            "saut",
            "bond"
        ],

        bond: [
            "bondit",
            "bond",
            "bond en avant",
            "bond en arrière"
        ]
    },


    //================================================
    // 🛡️ BLOCAGES
    //================================================

    bloquer: {

        blocage: [
            "bloque",
            "blocage",
            "bloquer",
            "pare",
            "parer"
        ],

        blocage_main: [
            "bloque avec la main",
            "blocage à une main",
            "pare avec la main"
        ],

        blocage_deux_mains: [
            "bloque à deux mains",
            "blocage deux mains",
            "pare à deux mains"
        ],

        garde_haute: [
            "garde haute",
            "bloque en garde haute"
        ],

        garde_basse: [
            "garde basse",
            "bloque en garde basse"
        ],

        garde_corps: [
            "protège son corps",
            "garde du corps",
            "bloque le corps"
        ],

        garde_visage: [
            "protège son visage",
            "garde du visage",
            "bloque le visage"
        ]
    },


    //================================================
    // 🌀 ESQUIVES
    //================================================

    esquiver: {

        esquive: [
            "esquive",
            "esquiver",
            "évite",
            "éviter"
        ],

        esquive_gauche: [
            "esquive à gauche",
            "évite à gauche"
        ],

        esquive_droite: [
            "esquive à droite",
            "évite à droite"
        ],

        esquive_arriere: [
            "esquive en arrière",
            "recule pour esquiver"
        ],

        esquive_avant: [
            "esquive vers l'avant"
        ],

        esquive_basse: [
            "se baisse",
            "esquive basse",
            "duck"
        ],

        esquive_laterale: [
            "esquive latérale",
            "déplacement latéral pour esquiver"
        ],

        esquive_vmax: [
            "esquive à vmax",
            "esquive à vitesse maximale"
        ]
    },


    //================================================
    // ✋ SAISIES / GRAPPLES
    //================================================

    saisir: {

        saisie: [
            "saisit",
            "saisie",
            "attrape",
            "agrippe",
            "empoigne"
        ],

        saisir_bras: [
            "saisit le bras",
            "attrape le bras",
            "agrippe le bras"
        ],

        saisir_jambe: [
            "saisit la jambe",
            "attrape la jambe",
            "agrippe la jambe"
        ],

        saisir_corps: [
            "saisit le corps",
            "attrape le corps",
            "agrippe le corps"
        ],

        saisir_coup: [
            "saisit le coup",
            "attrape le coup",
            "saisit l'attaque"
        ]
    },


    //================================================
    // ↪️ DÉVIATIONS
    //================================================

    devier: {

        deviation: [
            "dévie",
            "dévier",
            "déviation",
            "dévie le coup"
        ],

        deviation_main: [
            "dévie avec la main",
            "dévie le coup avec la main"
        ],

        deviation_bras: [
            "dévie avec le bras",
            "dévie avec l'avant-bras"
        ],

        deviation_jambe: [
            "dévie avec la jambe",
            "dévie le coup avec la jambe"
        ]
    },


    //================================================
    // 🔄 CHANGEMENTS DE TRAJECTOIRE
    //================================================

    modifier_trajectoire: {

        changer_trajectoire: [
            "change la trajectoire",
            "modifie la trajectoire",
            "change la direction du coup"
        ],

        rediriger: [
            "redirige le coup",
            "redirige son attaque",
            "redirige l'attaque"
        ]
    },


    //================================================
    // ⚡ ACTIONS DE VITESSE
    //================================================

    vitesse: {

        acceleration: [
            "accélère",
            "accélération",
            "accélère sa course"
        ],

        boost: [
            "boost",
            "booste",
            "mouvement boosté",
            "se booste"
        ],

        vitesse_reduite: [
            "vitesse réduite",
            "avance lentement"
        ]
    },


    //================================================
    // 👁️ SENSORIALITÉ / RECHERCHE
    //================================================

    rechercher: {

        regarder: [
            "regarde autour",
            "regarde autour de lui",
            "observe autour"
        ],

        localiser: [
            "localise",
            "cherche l'adversaire",
            "recherche l'adversaire",
            "tente de localiser"
        ],

        detection: [
            "détecte",
            "détecte l'adversaire",
            "ressent sa présence"
        ]
    },


    //================================================
    // 💥 PROJECTIONS
    //================================================

    projeter: {

        projection: [
            "projette",
            "projection",
            "envoie valser",
            "jette"
        ],

        repousser: [
            "repousse",
            "repousser",
            "fait reculer"
        ],

        envoyer_sol: [
            "projette au sol",
            "envoie au sol",
            "écrase au sol"
        ],

        envoyer_mur: [
            "projette contre un mur",
            "envoie contre un mur",
            "projette contre un bâtiment"
        ]
    },


    //================================================
    // 🗡️ PROJECTILES
    //================================================

    lancer: {

        projectile: [
            "lance",
            "lancer",
            "projectile",
            "projette un projectile"
        ],

        shuriken: [
            "shuriken",
            "lance un shuriken"
        ],

        kunai: [
            "kunai",
            "lance un kunai"
        ],

        couteau: [
            "couteau",
            "lance un couteau"
        ]
    },


    //================================================
    // 🔋 ÉNERGIE / RÉCUPÉRATION
    //================================================

    energie: {

        charger: [
            "charge son énergie",
            "accumule son énergie"
        ],

        recuperer: [
            "récupère",
            "récupère son énergie",
            "récupère sa stamina"
        ],

        degager_energie: [
            "dégage son énergie",
            "libère son énergie"
        ]
    }
};


//================================================
// 🤖 RÈGLES ARBITRE GEMINI
//================================================
const GEMINI_RULES_PROMPT = `
TU ES L'ARBITRE D'UN SYSTÈME DE COMBAT DYNAMIQUE.

Ton rôle est UNIQUEMENT de parcourir et appliquer les règles ci-dessous
lorsque tu analyses un pavé de combat.

Tu ne dois pas inventer de règles.
Tu ne dois pas modifier les règles.
Tu ne dois pas ajouter de capacités qui ne sont pas indiquées.
Tu dois considérer ces règles comme les règles officielles du système.


============================================================
0. MATCH🎮 
============================================================
- Dès le début du match la distance initiale entre les deux perso est de 5m.
- le match se termine après 10 tours maximum et un tour c'est quand les deux joueurs ont envoyés leurs pavés donc après le verdict. 

============================================================
1. STRUCTURE D'UN PAVÉ🎮 
============================================================

- Un pavé peut contenir au maximum 4 ACTIONS, les Actions de ACTIONS MAP. 
- Une action se réalise en 1s. 
- Si celui qui attaque fait 4 actions par exemple et que celui qui défends rate son esquive où son contre depuis la première action alors le reste des actions du pavés vont s'appliquer en conséquence. 
- Chaque personnage possède une zone de sensorialité de 1 mètre autour de lui permettant de ressentir les coups et la présence d'un adversaire. Il a donc juste à mentionner dans son pavé (ZS) où Zone de sensorialité.
- La vitesse de déplacement doit toujours être précisée lorsqu'un déplacement est effectué à vitesse maximale (VMAX).
- Si la VMAX n'est pas précisée, le déplacement, esquives ect est considéré comme effectué à vitesse réduite de 1 m/s.
- Celui qui défends doit toujours commencer par préciser à quoi il réagit avant de mentionner ses actions. Par exemple : Voyant le coup venir vers son visage... 

============================================================
2. VITESSE DE DÉPLACEMENT
============================================================

La Travel Speed représente la vitesse de déplacement du personnage.

GRADES :

- Bronze : 6 m/s.
- Silver / Argent : 8 m/s.
- Gold / Or : 10 m/s.

Le powerscaling réduit peut modifier la vitesse selon les règles du personnage.

============================================================
3. COMBAT SPEED
============================================================

La note S représente la Combat Speed, c'est-à-dire la vitesse de réaction en combat rapproché.

Si la Combat Speed est INFÉRIEURE à celle de l'adversaire :
- retard de 1 seconde ;
- le personnage peut uniquement bloquer ou esquiver les coups.

Si la Combat Speed est ÉGALE :
- retard de 0,5 seconde ;
- le personnage peut désormais dévier et saisir les coups.

Si la Combat Speed est SUPÉRIEURE de +1 :
- aucun retard ;
- le personnage peut réagir au même moment que l'adversaire.

Si la Combat Speed est SUPÉRIEURE de +2 :
- saisir ne coûte plus de Stamina ;
- esquiver coûte 5% de Stamina.

Les personnages SS peuvent combattre tous les tiers S sans retard et sont donc toujours considérés comme supérieurs de +2.

============================================================
4. DÉPLACEMENTS INSTANTANÉS
============================================================

Les déplacements instantanés coûtent 10% de Stamina ou d'énergie selon le personnage.

Après avoir utilisé un déplacement instantané :
- le personnage prend l'adversaire de vitesse avec un effet de surprise ;
- un adversaire de vitesse égale ou inférieure ne peut que réagir aux actions venant après le déplacement ;
- il peut uniquement esquiver ou bloquer ;
- il ne peut pas saisir le coup ;
- il peut cependant bloquer, dévier et esquiver.

============================================================
5. ZONE D'EFFET DES ATTAQUES
============================================================

La zone d'effet de vitesse d'une attaque frontale est de 5 mètres.

Si une attaque est lancée depuis cette distance :
- l'esquive coûte 20% de Stamina si le personnage n'est pas plus rapide que l'attaque ;
- normalement, une esquive coûte 10% de Stamina.

Exception :
- les déplacements instantanés ne suivent pas cette règle.

============================================================
6. TEMPS D'UNE ATTAQUE
============================================================

Une attaque est lancée en 1 seconde.

Elle nécessite :
- 0,5 seconde de préparation ;
- 0,5 seconde de lancement.

Une attaque ne peut pas être lancée en combo pendant sa préparation.

============================================================
7. PRÉPARATION D'UNE ATTAQUE
============================================================

Maintenir la préparation d'une attaque coûte 20% d'énergie.

Les attaques à effet maintenu, comme les barrières, durent au maximum 2 tours.

Une attaque d'énergie peut être lancée en projectile pour 5% d'énergie.

La vitesse de ce projectile est de 6 m/s.

Un personnage peut également récupérer son énergie :
- en dégageant son énergie ;
- ou en restant debout sans effectuer d'action.

Cette récupération rapporte 20% d'énergie en 1 séquence.

============================================================
8. VITESSE DES ATTAQUES
============================================================

Les attaques BASIC ont une vitesse de 6 m/s.

Coût :
- 20% d'énergie ;
- 50% des PV en dégâts selon les règles indiquées.

Les attaques ADVANCED ont une vitesse de 8 m/s.

Coût :
- 30% d'énergie ;
- 70% des PV en dégâts.

Les attaques ULTIME ont une vitesse de 10 m/s.

Coût :
- 50% d'énergie ;
- peuvent causer jusqu'à 100% de dégâts aux PV.

Certaines attaques peuvent causer des dégâts mortels selon leur nature.

Exemple :
- une attaque tranchante placée dans une zone critique peut provoquer la mort même si elle est classée comme attaque basique.

============================================================
9. PROJECTILES
============================================================

Selon l'univers, un personnage peut posséder jusqu'à 3 projectiles maximum.

Exemples :
- shuriken ;
- kunai.

Les explosifs, fils, etc. ne sont pas automatiquement considérés comme des projectiles autorisés.

Certains personnages possédant des couteaux peuvent lancer jusqu'à 3 projectiles.

La vitesse d'un projectile est de 5 m/s.

Un projectile cause 20% de dégâts aux PV selon la zone touchée.

============================================================
10. DÉGÂTS DES COUPS
============================================================

Les dégâts des coups sont de 10% des PV.

Un membre BRISÉ représente 15% des PV.

Un membre COUPÉ représente 30% des PV.

Pour sonner un adversaire :
- la force du personnage doit être supérieure à celle de l'adversaire ;
- il faut réussir à placer 2 coups consécutifs au visage.

Une fois sonné :
- l'adversaire est bloqué.

Pour sortir de cet état :
- il doit effectuer un mouvement BOOSTÉ ;
- ce mouvement coûte 30% de Stamina.

============================================================
11. BRISER UN MEMBRE
============================================================

Pour briser un membre avec un seul coup :
- la force de l'attaquant doit être supérieure à celle de l'adversaire.

Alternative :
- frapper deux fois de suite exactement au même endroit.

Si l'écart de force est de +2 ou plus :
- il n'est pas possible de briser le membre avec un seul coup.

============================================================
12. FORCE PHYSIQUE
============================================================

La Force représente :
- la force physique ;
- la résistance ;
- la capacité à encaisser ou repousser les attaques.

Si la Force est INFÉRIEURE de -1 :
- le personnage peut être repoussé par un coup ou une main ;
- il peut perdre sa posture.

Si la Force est INFÉRIEURE de -2 :
- bloquer à une main peut faire perdre l'équilibre ;
- bloquer à deux mains peut casser la posture.

Si la Force est INFÉRIEURE de -3 :
- il devient impossible de résister à certaines attaques ;
- le personnage peut être projeté.

Si la Force est SUPÉRIEURE de +2 :
- les dégâts des coups et projections sont augmentés ;
- les déplacements peuvent être réduits de moitié ;
- le personnage peut être projeté jusqu'à 10 m maximum.

Les personnages ayant une Force de 3 ou plus peuvent :
- soulever ou bloquer certaines parties de bâtiments ;
- projeter un adversaire jusqu'à 20 m maximum ;
- transpercer le corps d'un adversaire ayant une Force inférieure de 3.

Les bonds de 10 m sont possibles selon les niveaux de Force.

Un personnage ayant une Force de 3 ou plus peut effectuer des bonds de 20 m maximum.

============================================================
13. COLLISION ENTRE ATTAQUES
============================================================

La puissance d'attaque détermine le résultat lorsqu'une attaque rencontre une autre attaque.

Lorsque deux attaques entrent en collision :
- leur nature d'énergie doit être prise en compte.

Si l'écart de puissance est de 1 :
- une explosion se produit ;
- le personnage inférieur encaisse la moitié des dégâts.

Si l'écart est de 2 ou plus :
- l'attaque du personnage inférieur est complètement submergée ;
- il encaisse les dégâts.

============================================================
14. STAMINA
============================================================

Les esquives à VMAX précise coûtent 10% de Stamina.

Changer la trajectoire d'un coup déjà en cours coûte 5% de Stamina.

Après cette modification de trajectoire :
- la partie du corps utilisée ne peut plus être ramenée ;
- elle ne peut plus être utilisée pour effectuer un bloc ;
- elle ne peut plus être utilisée pour changer une nouvelle fois la trajectoire.

Les dashs coûtent 10% de Stamina.

Saisir un coup coûte 5% de Stamina.

============================================================
15. DÉPLACEMENTS BOOSTÉS
============================================================

Un mouvement boosté peut être nécessaire pour :
- sortir d'un état sonné ;
- augmenter temporairement les performances du personnage selon les règles.

Le coût indiqué pour sortir d'un état sonné est de 30% de Stamina.

============================================================
16. DESTRUCTION DE L'ARÈNE
============================================================

Les personnages peuvent provoquer des destructions sur l'arène.

Ils peuvent envoyer leur adversaire :
- contre des bâtiments ;
- contre le sol ;
- contre différents éléments du décor.

Les dégâts de destruction sont de 10% des PV.

Un personnage peut récupérer 20% de Stamina en restant 1 séquence complète sans effectuer la moindre action.

Niveaux de destruction :

SUPER < MEGA < ULTRA < EXTREME < ULTIMATE

============================================================
17. RÈGLE DE LECTURE DU PAVÉ
============================================================

Lorsqu'un pavé est analysé :

1. Identifier toutes les actions réalisées.
2. Respecter l'ordre chronologique.
3. Ne jamais considérer deux actions comme une seule si elles sont réellement distinctes.
4. Vérifier que le nombre total d'actions ne dépasse pas 4.
5. Vérifier que chaque séquence ne dépasse pas 2 actions.
6. Vérifier que les séquences sont séparées par "/" ou "|".
7. Vérifier les vitesses utilisées.
8. Vérifier les distances parcourues.
9. Vérifier les coûts de Stamina ou d'énergie.
10. Vérifier les conditions nécessaires à chaque action.
11. Vérifier les rapports de Force, Combat Speed et Travel Speed lorsque cela est nécessaire.
12. Vérifier si une attaque peut réellement toucher, être bloquée, déviée, esquivée ou saisie.
13. Vérifier les conséquences des coups selon la zone touchée.
14. Vérifier les règles de combo.
15. Ne jamais inventer une information absente du pavé.

============================================================
18. RÈGLE ABSOLUE DE L'ARBITRE
============================================================

Tu ne dois pas décider selon ce qui semble logique dans un anime ou dans un combat réel.

Tu dois uniquement appliquer les règles présentes dans ce prompt
et les informations fournies dans le pavé.

Si une information nécessaire manque :
- ne l'invente pas ;
- signale qu'elle est manquante ;
- considère l'action comme NON VALIDABLE tant que cette information
  n'est pas disponible.

Tu dois analyser le pavé comme un arbitre strict et impartial.
`;



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

    //========================================
    // ⚡ VITESSE MAXIMALE SELON LE GRADE
    //========================================
    const vitesseMax =
        obtenirVitesseMaxParGrade(
            personnage.grade
        );

    console.log(
        "⚡ VITESSE PERSONNAGE :",
        personnage.name,
        "| Grade :", personnage.grade,
        "| Vmax :", vitesseMax, "m/s"
    );

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
        // ⚡ VITESSE
        //========================================
        vitesseMax: vitesseMax,

        //========================================
        // ❤️ STATS DE COMBAT
        //========================================
        stats: {

            sta: 100,

            energie: 100,

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
    duelsEnCours,
    matchAttente,
    lancerTimerTour
};
