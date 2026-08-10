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
// 🎮 ACTIONS MAP — BASE DU GAMEPLAY
//================================================

const ACTIONS_MAP = {

    //============================================
    // 🥊 FRAPPES — MAINS
    //============================================
    frappes: {

        mains: {

            coup_direct: {
                nom: "Coup direct",
                aliases: [
                    "coup direct",
                    "direct",
                    "poing direct",
                    "jab",
                    "straight"
                ],
                description:
                    "Poing avant ou arrière propulsé en ligne droite vers le visage ou le torse."
            },

            crochet_gauche: {
                nom: "Crochet gauche",
                aliases: [
                    "crochet gauche",
                    "left hook",
                    "hook gauche"
                ],
                description:
                    "Poing gauche lancé en arc horizontal vers la tête ou le flanc droit."
            },

            crochet_droit: {
                nom: "Crochet droit",
                aliases: [
                    "crochet droit",
                    "right hook",
                    "hook droit"
                ],
                description:
                    "Poing droit lancé en arc horizontal vers la tête ou le flanc gauche."
            },

            uppercut: {
                nom: "Uppercut",
                aliases: [
                    "uppercut",
                    "coup uppercut"
                ],
                description:
                    "Poing propulsé de bas en haut sous le menton ou le torse."
            },

            uppercut_saute: {
                nom: "Uppercut sauté",
                aliases: [
                    "uppercut sauté",
                    "uppercut saute",
                    "rising uppercut"
                ],
                description:
                    "Uppercut effectué en sautant vers le menton ou la poitrine."
            },

            revers: {
                nom: "Coup en revers",
                aliases: [
                    "revers",
                    "coup en revers",
                    "backfist"
                ],
                description:
                    "Poing lancé horizontalement ou diagonalement avec le dos du poing."
            },

            revers_circulaire: {
                nom: "Revers circulaire",
                aliases: [
                    "revers circulaire",
                    "spinning backfist",
                    "spinning back fist"
                ],
                description:
                    "Rotation du corps à 180° ou 360° avec frappe circulaire du dos du poing."
            },

            marteau_descendant: {
                nom: "Coup marteau descendant",
                aliases: [
                    "coup marteau",
                    "marteau descendant",
                    "hammer",
                    "hammer fist"
                ],
                description:
                    "Poing descendant verticalement comme un marteau."
            },

            marteau_lateral: {
                nom: "Coup marteau latéral",
                aliases: [
                    "marteau latéral",
                    "marteau lateral",
                    "hammer fist side",
                    "hammer side"
                ],
                description:
                    "Frappe latérale effectuée avec le poing comme un marteau."
            },

            marteau_revers: {
                nom: "Coup marteau en revers",
                aliases: [
                    "marteau en revers",
                    "reverse hammer",
                    "reverse hammer fist"
                ],
                description:
                    "Frappe horizontale ou diagonale effectuée avec le dos du poing."
            }
        },

        //========================================
        // 🦵 FRAPPES — PIEDS
        //========================================

        pieds: {

            front_kick: {
                nom: "Coup de pied frontal",
                aliases: [
                    "coup de pied frontal",
                    "front kick",
                    "frontkick",
                    "coup frontal"
                ],
                description:
                    "Pied propulsé vers l'avant ou l'arrière contre le torse ou le menton."
            },

            roundhouse_kick: {
                nom: "Coup circulaire",
                aliases: [
                    "coup circulaire",
                    "roundhouse kick",
                    "roundhouse",
                    "kick circulaire"
                ],
                description:
                    "Coup de pied circulaire frappant latéralement la tête, le torse ou les côtes."
            },

            side_kick: {
                nom: "Coup de pied latéral",
                aliases: [
                    "coup de pied latéral",
                    "coup de pied lateral",
                    "side kick",
                    "sidekick"
                ],
                description:
                    "Coup de pied propulsé sur le côté avec la jambe tendue."
            },

            back_kick: {
                nom: "Coup de pied arrière",
                aliases: [
                    "coup de pied arrière",
                    "coup de pied arriere",
                    "back kick",
                    "backkick"
                ],
                description:
                    "Rotation du corps et frappe arrière avec le talon."
            },

            hook_kick: {
                nom: "Coup de pied en crochet",
                aliases: [
                    "coup de pied en crochet",
                    "hook kick",
                    "hookkick",
                    "kick crochet"
                ],
                description:
                    "Coup de pied en crochet frappant de côté ou par l'arrière."
            },

            axe_kick: {
                nom: "Coup de pied descendant",
                aliases: [
                    "coup de pied descendant",
                    "axe kick",
                    "axekick",
                    "coup descendant"
                ],
                description:
                    "Jambe levée verticalement puis redescendue pour frapper avec le talon."
            },

            spinning_back_kick: {
                nom: "Coup de pied arrière circulaire",
                aliases: [
                    "coup de pied arrière circulaire",
                    "coup de pied arriere circulaire",
                    "spinning back kick",
                    "spinning backkick"
                ],
                description:
                    "Rotation complète de 360° suivie d'une frappe arrière puissante."
            },

            low_kick: {
                nom: "Coup bas",
                aliases: [
                    "coup bas",
                    "low kick",
                    "lowkick"
                ],
                description:
                    "Coup de pied visant principalement la cuisse ou le mollet."
            },

            knee_strike: {
                nom: "Coup de genou",
                aliases: [
                    "coup de genou",
                    "genou",
                    "knee strike"
                ],
                description:
                    "Genou levé et propulsé vers le corps ou la tête à courte distance."
            },

            flying_kick: {
                nom: "Coup sauté",
                aliases: [
                    "coup sauté",
                    "coup saute",
                    "flying kick",
                    "flyingkick",
                    "kick sauté"
                ],
                description:
                    "Saut vers l'avant ou latéral avec frappe du pied."
            }
        }
    },

    //============================================
    // 🏃 DÉPLACEMENTS
    //============================================

    déplacements: {

        avancer: {
            nom: "Avancer",
            aliases: [
                "avance",
                "avancer",
                "s'avance",
                "s'avancer"
            ]
        },

        reculer: {
            nom: "Reculer",
            aliases: [
                "recule",
                "reculer",
                "s'éloigne",
                "s'eloigne"
            ]
        },

        gauche: {
            nom: "Déplacement gauche",
            aliases: [
                "va à gauche",
                "va a gauche",
                "se déplace à gauche",
                "se deplace a gauche",
                "gauche"
            ]
        },

        droite: {
            nom: "Déplacement droite",
            aliases: [
                "va à droite",
                "va a droite",
                "se déplace à droite",
                "se deplace a droite",
                "droite"
            ]
        },

        saut: {
            nom: "Saut",
            aliases: [
                "saute",
                "saut",
                "bondit",
                "bond"
            ]
        }
    },

    //============================================
    // 🛡️ DÉFENSE
    //============================================

    defenses: {

        garde: {
            nom: "Garde",
            aliases: [
                "garde",
                "se met en garde",
                "bloque"
            ]
        },

        esquive_gauche: {
            nom: "Esquive gauche",
            aliases: [
                "esquive gauche",
                "esquive sur la gauche",
                "part à gauche",
                "part a gauche"
            ]
        },

        esquive_droite: {
            nom: "Esquive droite",
            aliases: [
                "esquive droite",
                "esquive sur la droite",
                "part à droite",
                "part a droite"
            ]
        },

        esquive_arriere: {
            nom: "Esquive arrière",
            aliases: [
                "esquive arrière",
                "esquive arriere",
                "recule pour esquiver",
                "se baisse"
            ]
        },

        blocage: {
            nom: "Blocage",
            aliases: [
                "blocage",
                "bloque le coup",
                "pare",
                "parer",
                "pare le coup"
            ]
        }
    },

    //============================================
    // 🤼 CONTACT / TECHNIQUES
    //============================================

    contact: {

        saisie: {
            nom: "Saisie",
            aliases: [
                "saisie",
                "attrape",
                "agrippe",
                "empoigne"
            ]
        },

        projection: {
            nom: "Projection",
            aliases: [
                "projection",
                "projette",
                "jette au sol"
            ]
        },

        repousser: {
            nom: "Repousser",
            aliases: [
                "repousse",
                "repousser",
                "pousse"
            ]
        }
    }
};

//================================================
// 🔎 NORMALISATION D'UNE ACTION
//================================================

function normaliserAction(texte = "") {

    return String(texte)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[’']/g, " ")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

//================================================
// 📚 OBTENIR TOUTES LES ACTIONS DISPONIBLES
//================================================

function obtenirToutesLesActions() {

    const actions = [];

    for (const [categorie, groupes] of Object.entries(ACTIONS_MAP)) {

        for (const [groupe, listeActions] of Object.entries(groupes)) {

            for (const [id, action] of Object.entries(listeActions)) {

                actions.push({
                    id,
                    categorie,
                    groupe,
                    nom: action.nom,
                    aliases: action.aliases || [],
                    description: action.description || ""
                });
            }
        }
    }

    return actions;
}

//==============================================================
// ⚔️ ALL STARS — MOTEUR DES RÈGLES DE COMBAT
//==============================================================
// Ce bloc contient uniquement les règles fondamentales du combat.
// Il ne résout PAS encore les combats.
// L'arbitre IA utilisera ces règles pour interpréter les actions.
//==============================================================

const REGLES_COMBAT_ALLSTARS = {

    //==========================================================
    // ⏱️ STRUCTURE D'UN PAVÉ
    //==========================================================

    pave: {

        actionsMax: 4,

        actionsMaxParSequence: 2,

        dureeAction: 1, // seconde

        separateurSequences: [
            "/",
            "|"
        ],

        // Une action sans vitesse explicitement précisée
        // est considérée comme un déplacement à 1 m/s.
        vitesseDeplacementParDefaut: 1
    },


    //==========================================================
    // 👁️ PERCEPTION
    //==========================================================

    perception: {

        zoneSensibilite: 1, // mètres

        tempsRechercheAdversaire: 1 // seconde
    },


    //==========================================================
    // 🏃 TRAVEL SPEED
    //==========================================================

    travelSpeed: {

        bronze: {
            nom: "Bronze",
            vitesseBase: 6,
            unite: "m/s"
        },

        silver: {
            nom: "Silver",
            vitesse: "foudre",
            bonusPowerscaling: 2,
            unite: "m/s"
        },

        gold: {
            nom: "Gold",
            vitesse: "lumière",
            bonusPowerscalingMin: 4,
            bonusPowerscalingMax: 10,
            unite: "m/s"
        },

        vol: {
            bonus: 1,
            unite: "m/s"
        }
    },


    //==========================================================
    // ⚡ COMBAT SPEED
    //==========================================================

    combatSpeed: {

        // Combat Speed inférieur
        inferieur: {
            retard: 1, // seconde

            reactionsAutorisees: [
                "bloquer",
                "esquiver"
            ],

            peutDevier: false,
            peutSaisir: false
        },

        // Combat Speed égal
        egal: {
            retard: 0.5,

            reactionsAutorisees: [
                "bloquer",
                "esquiver",
                "devier",
                "saisir"
            ],

            peutDevier: true,
            peutSaisir: true
        },

        // +1 Combat Speed
        superieur1: {
            retard: 0,

            reactionsAutorisees: [
                "bloquer",
                "esquiver",
                "devier",
                "saisir",
                "contreAttaque"
            ],

            peutReagirMemeTemps: true
        },

        // +2 Combat Speed
        superieur2: {

            retard: 0,

            reactionsAutorisees: [
                "bloquer",
                "esquiver",
                "devier",
                "saisir",
                "contreAttaque"
            ],

            saisieCoutStamina: 0,

            esquiveCoutStamina: 5
        },

        // SS contre S
        ssContreS: {

            avantage: 2,

            retard: 0,

            toujoursSuperieur: true
        }
    },


    //==========================================================
    // 🌀 DÉPLACEMENT INSTANTANÉ
    //==========================================================

    deplacementInstantane: {

        coutStamina: 10,

        uniteCout: "%",

        effet: "surprise",

        prendAdversaireDeVitesse: true,

        reactionsAdversaireEgalOuInferieur: [
            "bloquer",
            "devier",
            "esquiver"
        ],

        peutSaisirCoupApresDeplacement: false
    },


    //==========================================================
    // 🏃 DÉPLACEMENTS
    //==========================================================

    deplacement: {

        vitesseParDefaut: 1,

        uniteVitesse: "m/s",

        dash: {
            coutStamina: 10
        },

        vmax: {
            doitEtrePrecisee: true
        }
    },


    //==========================================================
    // 👊 COMBAT CORPS À CORPS
    //==========================================================

    corpsACorps: {

        // Zone d'effet d'une attaque frontale
        zoneEffetAttaqueFrontale: 5,

        uniteDistance: "m",

        // Préparation d'une attaque
        preparation: {
            dureeTotale: 1,

            preparation: 0.5,

            lancement: 0.5,

            peutLancerComboPendantPreparation: false
        }
    },


    //==========================================================
    // 💥 DÉGÂTS
    //==========================================================

    degats: {

        coupNormal: 10,

        membreBrise: 15,

        membreCoupe: 30,

        unite: "%PV"
    },


    //==========================================================
    // 🦴 MEMBRES
    //==========================================================

    membres: {

        briser: {

            forceNecessaire: "superieure",

            coupsNecessairesSiForceNonSuperieure: 2,

            memeZoneObligatoire: true,

            ecartForceMaxPourBrisure: 1
        },

        couper: {

            degats: 30,

            peutEtreMortel: true
        }
    },


    //==========================================================
    // 😵 ÉTAT SONNÉ
    //==========================================================

    sonne: {

        condition: {

            coupsConsecutifsVisage: 2
        },

        mouvementBoostNecessaire: true,

        coutStaminaBoost: 30,

        actionsDefensivesApresBoost: [
            "bloquer",
            "esquiver"
        ]
    },


    //==========================================================
    // 💨 ESQUIVE
    //==========================================================

    esquive: {

        normale: {

            coutStamina: 10
        },

        vitesseMaximale: {

            coutStamina: 10,

            permetChangerTrajectoire: true
        },

        contreAttaqueFrontaleDansZone5m: {

            coutStamina: 20,

            condition: "adversaire_pas_plus_rapide"
        },

        plusRapideQueAttaque: {

            coutStamina: 10
        }
    },


    //==========================================================
    // ↪️ DÉVIATION / CHANGEMENT DE TRAJECTOIRE
    //==========================================================

    trajectoire: {

        changer: {

            coutStamina: 5
        },

        apresUtilisationMembre: {

            membreIndisponiblePour:

                [
                    "bloquer",
                    "changer_trajectoire"
                ],

            duree: "action_en_cours"
        }
    },


    //==========================================================
    // 🤝 SAISIE
    //==========================================================

    saisie: {

        coutStamina: 5,

        // Ce coût devient 0 avec Combat Speed +2
        coutAvecCombatSpeedPlus2: 0,

        necessiteAvantageCombatSpeed: true
    },


    //==========================================================
    // 🛡️ BLOCAGE
    //==========================================================

    blocage: {

        autoriseSiCombatSpeedInferieur: true,

        autoriseSiCombatSpeedEgal: true,

        autoriseSiCombatSpeedSuperieur: true
    },


    //==========================================================
    // ⚡ ATTAQUES D'ÉNERGIE
    //==========================================================

    energie: {

        attaque: {

            dureeLancement: 1,

            preparation: 0.5,

            lancement: 0.5
        },

        maintien: {

            coutEnergie: 20,

            dureeMaxTours: 2
        },

        projectile: {

            coutEnergie: 5,

            vitesse: 6,

            uniteVitesse: "m/s"
        },

        recuperation: {

            degagement: {
                gainEnergie: 20,
                duree: 1,
                uniteDuree: "sequence"
            },

            chargeImmobile: {
                gainEnergie: 20
            }
        }
    },


    //==========================================================
    // 👊 NIVEAUX D'ATTAQUES
    //==========================================================

    attaques: {

        basic: {

            niveau: "Bronze",

            vitesse: 6,

            coutEnergie: 20,

            degats: 50,

            uniteVitesse: "m/s",

            uniteDegats: "%PV"
        },

        advanced: {

            niveau: "Silver",

            vitesse: 8,

            coutEnergie: 30,

            degats: 70,

            uniteVitesse: "m/s",

            uniteDegats: "%PV"
        },

        ultimate: {

            niveau: "Gold",

            vitesse: 10,

            coutEnergie: 50,

            degats: 100,

            uniteVitesse: "m/s",

            uniteDegats: "%PV"
        }
    },


    //==========================================================
    // 🎯 PROJECTILES
    //==========================================================

    projectiles: {

        nombreMaxStandard: 3,

        vitesseStandard: 5,

        degatsStandard: 20,

        uniteVitesse: "m/s",

        uniteDegats: "%PV",

        exemplesAutorises: [
            "shuriken",
            "kunai"
        ],

        exceptions: [
            "explosif",
            "fil"
        ]
    },


    //==========================================================
    // ☠️ MORT / ATTAQUES CRITIQUES
    //==========================================================

    mort: {

        attaqueTranchanteZoneCritique: {

            peutTuerInstantanement: true
        },

        attaqueMortelleSelonNature: true,

        // Important :
        // 100% PV n'est PAS la seule manière de mourir.
        mortParEffetSpecial: true
    },


    //==========================================================
    // 🔋 STAMINA
    //==========================================================

    stamina: {

        valeurs: {

            minimale: 0,

            maximale: 100
        },

        couts: {

            deplacementInstantane: 10,

            dash: 10,

            esquive: 10,

            esquiveZoneAttaqueFrontale: 20,

            changementTrajectoire: 5,

            saisie: 5,

            saisieCombatSpeedPlus2: 0,

            boostApresSonne: 30
        }
    },


    //==========================================================
    // ⚠️ PRINCIPES GÉNÉRAUX DE L'ARBITRE
    //==========================================================

    principes: {

        vitesseMaxDoitEtrePrecisee: true,

        actionSansVitesse:
            "vitesse_deplacement_1m_s",

        impossibleDePasserLimiteActions: true,

        impossibleDeFairePlusDeDeuxActionsParSequence: true,

        distanceObligatoirePourAttaque:
            true,

        vitesseCompareeAvantResolution:
            true,

        combatSpeedCompareAvantReaction:
            true,

        coutStaminaVerifieAvantAction:
            true,

        energieVerifieeAvantTechnique:
            true,

        positionVerifieeAvantAttaque:
            true,

        coherencePhysiqueVerifiee:
            true,

        resultatNeDoitJamaisEtreAutomatiquementAccepte:
            true
    }
};


//==============================================================
// 🧪 OUTIL DE LECTURE DES RÈGLES
//==============================================================

function obtenirRegleCombat(chemin) {

    const parties = chemin.split(".");

    let resultat = REGLES_COMBAT_ALLSTARS;

    for (const partie of parties) {

        if (
            resultat === undefined ||
            resultat === null
        ) {
            return null;
        }

        resultat = resultat[partie];
    }

    return resultat;
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log("========================================");
console.log("⚔️ RÈGLES ALL STARS CHARGÉES");
console.log("========================================");

console.log(
    "🎮 Actions max par pavé :",
    REGLES_COMBAT_ALLSTARS.pave.actionsMax
);

console.log(
    "🎮 Actions max par séquence :",
    REGLES_COMBAT_ALLSTARS.pave.actionsMaxParSequence
);

console.log(
    "👊 Dégâts coup normal :",
    REGLES_COMBAT_ALLSTARS.degats.coupNormal + "% PV"
);

console.log(
    "💨 Coût dash :",
    REGLES_COMBAT_ALLSTARS.deplacement.dash.coutStamina + "% Stamina"
);

console.log(
    "🤝 Coût saisie :",
    REGLES_COMBAT_ALLSTARS.saisie.coutStamina + "% Stamina"
);

console.log("========================================");


//==============================================================
// ⚔️ ALL STARS — ÉTAT RÉEL DU COMBAT
//==============================================================
// Ce bloc représente la situation ACTUELLE du combat.
// Il ne décide encore d'aucune action.
//==============================================================


//==============================================================
// 🧍 CRÉATION DE L'ÉTAT D'UN COMBATTANT
//==============================================================

function creerEtatCombattant(joueur, personnage) {

    return {

        //======================================================
        // 👤 IDENTITÉ
        //======================================================

        joueur: {
            pseudo: joueur?.pseudo || "Inconnu",
            jid: joueur?.jid || null
        },

        personnage: {
            nom: personnage?.name ||
                 personnage?.nom ||
                 "Inconnu",

            categorie:
                personnage?.category ||
                personnage?.categorie ||
                null,

            grade:
                personnage?.grade ||
                null
        },


        //======================================================
        // ❤️ RESSOURCES
        //======================================================

        ressources: {

            pv: 100,

            pvMax: 100,

            stamina: 100,

            staminaMax: 100,

            energie: 100,

            energieMax: 100
        },


        //======================================================
        // 📍 POSITION
        //======================================================

        position: {

            x: 0,

            y: 0,

            z: 0
        },


        // Distance actuelle avec l'adversaire
        distanceAdversaire: null,


        //======================================================
        // 🧭 DIRECTION / ORIENTATION
        //======================================================

        orientation: {

            direction: "adversaire",

            angle: 0
        },


        //======================================================
        // 🏃 VITESSES
        //======================================================

        vitesse: {

            travelSpeed: 0,

            combatSpeed: 0,

            vitesseActuelle: 0,

            vitesseVol: 0,

            vole: false
        },


        //======================================================
        // 🧠 PERCEPTION
        //======================================================

        perception: {

            adversaireVisible: true,

            adversaireLocalise: true,

            distanceDetection:
                REGLES_COMBAT_ALLSTARS.perception.zoneSensibilite
        },


        //======================================================
        // 🦴 ÉTAT DU CORPS
        //======================================================

        membres: {

            tete: {
                etat: "normal",
                utilisable: true
            },

            brasGauche: {
                etat: "normal",
                utilisable: true
            },

            brasDroit: {
                etat: "normal",
                utilisable: true
            },

            jambeGauche: {
                etat: "normal",
                utilisable: true
            },

            jambeDroite: {
                etat: "normal",
                utilisable: true
            },

            torse: {
                etat: "normal",
                utilisable: true
            }
        },


        //======================================================
        // 😵 ÉTATS / EFFETS
        //======================================================

        etats: {

            sonne: false,

            immobilise: false,

            aveugle: false,

            surpris: false,

            enChute: false,

            enVol: false,

            chargeAttaque: false,

            attaqueEnCours: false,

            esquiveEnCours: false,

            blocageEnCours: false,

            saisieEnCours: false
        },


        //======================================================
        // 🎯 COMBAT
        //======================================================

        combat: {

            cible: null,

            dernierCoupRecu: null,

            dernierCoupDonne: null,

            coupsConsecutifsVisage: 0,

            coupsConsecutifsMemeMembre: 0,

            derniereZoneFrappee: null,

            dernieresActions: []
        },


        //======================================================
        // 🌀 DÉPLACEMENT
        //======================================================

        deplacement: {

            enMouvement: false,

            type: null,

            vitesse: 0,

            destination: null,

            tempsRestant: 0,

            deplacementInstantane: false
        },


        //======================================================
        // ⚡ ACTION EN COURS
        //======================================================

        actionEnCours: null,


        //======================================================
        // ⏱️ TEMPS
        //======================================================

        temps: {

            dernierAction: 0,

            tempsDepuisDerniereAction: 0
        },


        //======================================================
        // ☠️ ÉTAT DE VIE
        //======================================================

        vivant: true,

        mort: false
    };
}



//==============================================================
// ⚔️ CRÉATION DE L'ÉTAT GLOBAL DU COMBAT
//==============================================================

function creerEtatCombat(joueur1, personnage1, joueur2, personnage2) {

    const combattant1 =
        creerEtatCombattant(
            joueur1,
            personnage1
        );

    const combattant2 =
        creerEtatCombattant(
            joueur2,
            personnage2
        );


    //==========================================================
    // 📍 POSITIONS INITIALES
    //==========================================================

    combattant1.position = {
        x: 0,
        y: 0,
        z: 0
    };

    combattant2.position = {
        x: 10,
        y: 0,
        z: 0
    };


    //==========================================================
    // 📏 DISTANCE INITIALE
    //==========================================================

    const distanceInitiale =
        calculerDistanceCombattants(
            combattant1,
            combattant2
        );

    combattant1.distanceAdversaire =
        distanceInitiale;

    combattant2.distanceAdversaire =
        distanceInitiale;


    //==========================================================
    // 🎯 CIBLES
    //==========================================================

    combattant1.combat.cible =
        combattant2.personnage.nom;

    combattant2.combat.cible =
        combattant1.personnage.nom;


    return {

        actif: true,

        tour: 0,

        temps: 0,

        combattant1,

        combattant2,

        historique: [],

        derniereResolution: null
    };
}



//==============================================================
// 📏 CALCUL DE DISTANCE
//==============================================================

function calculerDistanceCombattants(a, b) {

    if (!a?.position || !b?.position) {
        return Infinity;
    }

    const dx =
        a.position.x -
        b.position.x;

    const dy =
        a.position.y -
        b.position.y;

    const dz =
        a.position.z -
        b.position.z;

    return Math.sqrt(
        (dx * dx) +
        (dy * dy) +
        (dz * dz)
    );
}



//==============================================================
// 🔄 MISE À JOUR DE LA DISTANCE
//==============================================================

function mettreAJourDistanceCombat(etatCombat) {

    if (!etatCombat) {
        return;
    }

    const distance =
        calculerDistanceCombattants(
            etatCombat.combattant1,
            etatCombat.combattant2
        );

    etatCombat.combattant1.distanceAdversaire =
        distance;

    etatCombat.combattant2.distanceAdversaire =
        distance;

    return distance;
}



//==============================================================
// 🧪 DEBUG ÉTAT COMBAT
//==============================================================

function afficherEtatCombat(etatCombat) {

    if (!etatCombat) {

        console.log(
            "❌ Aucun état de combat."
        );

        return;
    }

    console.log(
        "========================================"
    );

    console.log(
        "⚔️ ÉTAT ACTUEL DU COMBAT"
    );

    console.log(
        "========================================"
    );


    for (
        const combattant of [
            etatCombat.combattant1,
            etatCombat.combattant2
        ]
    ) {

        console.log(
            "👤",
            combattant.joueur.pseudo,
            "→",
            combattant.personnage.nom
        );

        console.log(
            "❤️ PV :",
            combattant.ressources.pv
        );

        console.log(
            "❤️ Stamina :",
            combattant.ressources.stamina
        );

        console.log(
            "⚡ Énergie :",
            combattant.ressources.energie
        );

        console.log(
            "📍 Position :",
            combattant.position
        );

        console.log(
            "📏 Distance :",
            combattant.distanceAdversaire,
            "m"
        );

        console.log(
            "🏃 Travel Speed :",
            combattant.vitesse.travelSpeed
        );

        console.log(
            "⚡ Combat Speed :",
            combattant.vitesse.combatSpeed
        );

        console.log(
            "🧠 États :",
            combattant.etats
        );

        console.log(
            "----------------------------------------"
        );
    }
}

//==============================================================
// ⚖️ ALL STARS — VALIDATEUR DES RÈGLES DU PAVÉ
//==============================================================
// Ce bloc vérifie les contraintes générales d'un pavé.
//
// Il NE décide PAS encore :
// - si une attaque touche
// - si une esquive réussit
// - qui est le plus rapide
// - si un personnage est réellement blessé
//
// Il vérifie uniquement si le pavé respecte les règles
// structurelles et les ressources disponibles.
//==============================================================


function validerPaveCombat({
    pave = "",
    actions = [],
    joueur = null,
    etatCombat = null
} = {}) {

    const erreurs = [];
    const avertissements = [];

    //----------------------------------------------------------
    // 🧹 Nettoyage
    //----------------------------------------------------------

    const texte = String(pave || "").trim();

    if (!texte) {

        return {
            valide: false,
            erreurs: [
                "Le pavé de combat est vide."
            ],
            avertissements: [],
            actionsValidees: []
        };
    }


    //----------------------------------------------------------
    // 🎮 LIMITE D'ACTIONS
    //----------------------------------------------------------

    const nombreActions = actions.length;

    const limiteActions =
        REGLES_COMBAT_ALLSTARS.pave.actionsMax;

    if (nombreActions > limiteActions) {

        erreurs.push(
            `Le pavé contient ${nombreActions} actions alors que la limite est de ${limiteActions}.`
        );
    }


    //----------------------------------------------------------
    // 🧩 DÉTECTION DES SÉQUENCES
    //----------------------------------------------------------
    // Les séquences sont séparées par "/" ou "|".
    //
    // Exemple :
    //
    // action 1 / action 2
    // action 3 | action 4
    //
    //----------------------------------------------------------

    const sequences = texte
        .split(/\s*[\/|]\s*/)
        .map(sequence => sequence.trim())
        .filter(Boolean);


    const limiteParSequence =
        REGLES_COMBAT_ALLSTARS.pave.actionsMaxParSequence;


    //----------------------------------------------------------
    // ⚠️ Vérification des séquences
    //----------------------------------------------------------

    if (sequences.length > 0) {

        for (let i = 0; i < sequences.length; i++) {

            const sequence = sequences[i];

            const mots = sequence
                .split(/\s+/)
                .filter(Boolean);

            // Estimation prudente des actions dans la séquence.
            //
            // La détection exacte sera améliorée ensuite avec
            // notre interpréteur d'intentions.
            const actionsDansSequence =
                actions.filter(action => {

                    if (!action.termeDetecte) {
                        return false;
                    }

                    return normaliserAction(sequence)
                        .includes(
                            normaliserAction(
                                action.termeDetecte
                            )
                        );
                });


            if (
                actionsDansSequence.length >
                limiteParSequence
            ) {

                erreurs.push(
                    `Séquence ${i + 1} : maximum ${limiteParSequence} actions autorisées.`
                );
            }
        }
    }


    //----------------------------------------------------------
    // 🏃 VITESSE DE DÉPLACEMENT
    //----------------------------------------------------------

    const vitesseObligatoire =
        REGLES_COMBAT_ALLSTARS
            .principes
            .vitesseMaxDoitEtrePrecisee;


    if (vitesseObligatoire) {

        const motsDeplacement = [
            "fonce",
            "avance",
            "recule",
            "court",
            "dash",
            "déplace",
            "deplace",
            "vole",
            "vole vers",
            "vmax"
        ];


        const texteNormalise =
            normaliserAction(texte);


        const contientDeplacement =
            motsDeplacement.some(
                mot =>
                    texteNormalise.includes(
                        normaliserAction(mot)
                    )
            );


        //------------------------------------------------------
        // Si déplacement détecté sans vitesse explicite
        //------------------------------------------------------

        if (contientDeplacement) {

            const contientVitesse =
                /\b(vmax|max|maximum|6\s*m\/?s|8\s*m\/?s|10\s*m\/?s|\d+\s*m\/?s)\b/i
                    .test(texte);


            if (!contientVitesse) {

                avertissements.push(
                    "Aucune vitesse de déplacement précisée : déplacement interprété à 1 m/s."
                );
            }
        }
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------
    // Pour l'instant on ne consomme PAS encore la stamina.
    // On vérifie seulement si l'état existe.
    //----------------------------------------------------------

    if (joueur) {

        const stamina =
            joueur.stamina ??
            etatCombat?.joueurs?.[joueur.jid]?.stamina;


        if (
            stamina !== undefined &&
            stamina !== null
        ) {

            if (stamina < 0) {

                erreurs.push(
                    "La stamina du joueur est invalide."
                );
            }

            if (
                stamina >
                REGLES_COMBAT_ALLSTARS.stamina.valeurs.maximale
            ) {

                avertissements.push(
                    "La stamina dépasse 100 : valeur ramenée à 100."
                );
            }
        }
    }


    //----------------------------------------------------------
    // ⚡ ÉNERGIE
    //----------------------------------------------------------

    const texteNormalise =
        normaliserAction(texte);


    const motsEnergie = [
        "énergie",
        "energie",
        "ki",
        "chakra",
        "reiatsu",
        "attaque énergétique",
        "attaque energetique",
        "projectile"
    ];


    const utiliseEnergie =
        motsEnergie.some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (utiliseEnergie) {

        const energie =
            joueur?.energie ??
            etatCombat?.joueurs?.[joueur?.jid]?.energie;


        if (
            energie !== undefined &&
            energie !== null &&
            energie < 0
        ) {

            erreurs.push(
                "La réserve d'énergie du joueur est invalide."
            );
        }
    }


    //----------------------------------------------------------
    // 👊 ATTAQUE
    //----------------------------------------------------------

    const motsAttaque = [
        "frappe",
        "frapper",
        "coup",
        "attaque",
        "attaquer",
        "poing",
        "pied",
        "tranche",
        "trancher",
        "projette",
        "projectile"
    ];


    const contientAttaque =
        motsAttaque.some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    //----------------------------------------------------------
    // 📍 CIBLE
    //----------------------------------------------------------

    if (contientAttaque) {

        const zones = [

            "visage",
            "tête",
            "tete",

            "cou",

            "torse",
            "poitrine",

            "ventre",
            "abdomen",

            "dos",

            "épaule",
            "epaule",

            "bras",
            "avant-bras",
            "avant bras",

            "main",

            "jambe",
            "cuisse",

            "genou",

            "mollet",

            "cheville",

            "pied"
        ];


        const cibleTrouvee =
            zones.some(
                zone =>
                    texteNormalise.includes(
                        normaliserAction(zone)
                    )
            );


        if (!cibleTrouvee) {

            avertissements.push(
                "L'attaque ne précise pas clairement la zone ciblée."
            );
        }
    }


    //----------------------------------------------------------
    // 🌀 DÉPLACEMENT INSTANTANÉ
    //----------------------------------------------------------

    const instantane = [
        "téléporte",
        "teleporte",
        "téléportation",
        "teleportation",
        "déplacement instantané",
        "deplacement instantane"
    ];


    const utiliseInstantane =
        instantane.some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (utiliseInstantane) {

        avertissements.push(
            `Déplacement instantané détecté : coût prévu ${REGLES_COMBAT_ALLSTARS.deplacementInstantane.coutStamina}% Stamina.`
        );
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    const esquive =
        [
            "esquive",
            "esquiver",
            "évite",
            "evite"
        ].some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (esquive) {

        avertissements.push(
            `Esquive détectée : coût de base ${REGLES_COMBAT_ALLSTARS.esquive.normale.coutStamina}% Stamina.`
        );
    }


    //----------------------------------------------------------
    // 🤝 SAISIE
    //----------------------------------------------------------

    const saisie =
        [
            "saisit",
            "saisir",
            "attrape",
            "agrippe",
            "empoigne"
        ].some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (saisie) {

        avertissements.push(
            `Saisie détectée : coût prévu ${REGLES_COMBAT_ALLSTARS.saisie.coutStamina}% Stamina.`
        );
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    const blocage =
        [
            "bloque",
            "bloquer",
            "pare",
            "parer"
        ].some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (blocage) {

        avertissements.push(
            "Blocage détecté : sa réussite sera déterminée lors de la résolution."
        );
    }


    //----------------------------------------------------------
    // ↪️ DÉVIATION
    //----------------------------------------------------------

    const deviation =
        [
            "dévie",
            "devie",
            "dévier",
            "devier",
            "change la trajectoire",
            "changer la trajectoire"
        ].some(
            mot =>
                texteNormalise.includes(
                    normaliserAction(mot)
                )
        );


    if (deviation) {

        avertissements.push(
            `Déviation détectée : coût prévu ${REGLES_COMBAT_ALLSTARS.trajectoire.changer.coutStamina}% Stamina.`
        );
    }


    //----------------------------------------------------------
    // ☠️ COHÉRENCE DU NOMBRE D'ACTIONS
    //----------------------------------------------------------

    if (
        actions.length === 0
    ) {

        erreurs.push(
            "Aucune action reconnue dans le pavé."
        );
    }


    //----------------------------------------------------------
    // 🧠 RÉSULTAT
    //----------------------------------------------------------

    const valide =
        erreurs.length === 0;


    return {

        valide,

        erreurs,

        avertissements,

        nombreActions,

        nombreSequences:
            sequences.length,

        sequences,

        actionsValidees:
            actions,

        joueur:
            joueur
                ? {
                    pseudo: joueur.pseudo,
                    jid: joueur.jid
                }
                : null
    };
}

//==============================================================
// 🧠 ALL STARS — INTERPRÉTEUR D'INTENTION
//==============================================================
// Transforme le langage naturel du pavé en intentions structurées.
//
// Exemple :
//
// "Yamato fonce sur Tobirama a vmax puis frappe un coup de
// poing direct du droit dans le visage"
//
// devient :
//
// déplacement → cible Tobirama → vmax
// attaque → coup direct → poing droit → visage
//
// IMPORTANT :
// Ce bloc NE décide PAS si l'action réussit.
// Il décrit uniquement ce que le joueur ESSAIE de faire.
//==============================================================


function interpreterIntentionCombat({
    pave = "",
    actions = [],
    joueur = null
} = {}) {

    const texte = String(pave || "").trim();

    const texteNormalise =
        normaliserAction(texte);

    const intentions = [];


    //==========================================================
    // 🧹 UTILITAIRES
    //==========================================================

    function contient(...mots) {

        return mots.some(mot =>
            texteNormalise.includes(
                normaliserAction(mot)
            )
        );
    }


    function trouverCible() {

        // Recherche après certaines prépositions.
        const match = texte.match(
            /\b(?:sur|vers|contre|cible|vise|attaquer|attaque)\s+([A-Za-zÀ-ÿ0-9_👑⚡™🇨🇬-]+)/i
        );

        if (match) {
            return match[1];
        }

        return null;
    }


    function trouverZone() {

        const zones = [

            "visage",
            "tête",
            "tete",

            "cou",

            "torse",
            "poitrine",

            "ventre",
            "abdomen",

            "flanc",
            "côtes",
            "cotes",

            "dos",

            "épaule",
            "epaule",

            "bras",
            "avant-bras",
            "avant bras",

            "main",

            "menton",

            "jambe",
            "cuisse",

            "genou",

            "mollet",

            "cheville",

            "pied"
        ];


        for (const zone of zones) {

            if (
                texteNormalise.includes(
                    normaliserAction(zone)
                )
            ) {

                return zone;
            }
        }

        return null;
    }


    function trouverMembre() {

        if (
            contient(
                "poing droit",
                "main droite",
                "bras droit"
            )
        ) {
            return "droit";
        }

        if (
            contient(
                "poing gauche",
                "main gauche",
                "bras gauche"
            )
        ) {
            return "gauche";
        }

        if (
            contient(
                "poing",
                "main",
                "bras"
            )
        ) {
            return "indetermine";
        }

        if (
            contient(
                "pied droit",
                "jambe droite"
            )
        ) {
            return "droit";
        }

        if (
            contient(
                "pied gauche",
                "jambe gauche"
            )
        ) {
            return "gauche";
        }

        return null;
    }


    function trouverVitesse() {

        //------------------------------------------------------
        // VMAX
        //------------------------------------------------------

        if (
            contient(
                "vmax",
                "v max",
                "vitesse maximale",
                "maximum"
            )
        ) {

            return {
                type: "vmax",
                valeur: "maximum"
            };
        }


        //------------------------------------------------------
        // Vitesse numérique
        //------------------------------------------------------

        const match = texte.match(
            /(\d+(?:[.,]\d+)?)\s*m\s*\/?\s*s/i
        );

        if (match) {

            return {
                type: "numerique",
                valeur:
                    Number(
                        match[1]
                            .replace(",", ".")
                    ),
                unite: "m/s"
            };
        }


        //------------------------------------------------------
        // Aucune vitesse
        //------------------------------------------------------

        return {
            type: "defaut",
            valeur:
                REGLES_COMBAT_ALLSTARS
                    .pave
                    .vitesseDeplacementParDefaut,
            unite: "m/s"
        };
    }


    //==========================================================
    // 🏃 DÉPLACEMENT
    //==========================================================

    const mouvementDetecte =
        contient(
            "fonce",
            "foncer",
            "avance",
            "avancer",
            "recule",
            "reculer",
            "court",
            "courir",
            "dash",
            "déplace",
            "deplace",
            "déplacement",
            "deplacement",
            "vole",
            "voler"
        );


    if (mouvementDetecte) {

        const cible =
            trouverCible();

        const vitesse =
            trouverVitesse();


        let mouvement = "deplacement";

        if (
            contient(
                "fonce",
                "foncer"
            )
        ) {
            mouvement = "foncer";
        }

        else if (
            contient(
                "dash"
            )
        ) {
            mouvement = "dash";
        }

        else if (
            contient(
                "recule",
                "reculer"
            )
        ) {
            mouvement = "recul";
        }

        else if (
            contient(
                "avance",
                "avancer"
            )
        ) {
            mouvement = "avance";
        }

        else if (
            contient(
                "vole",
                "voler"
            )
        ) {
            mouvement = "vol";
        }


        intentions.push({

            type: "deplacement",

            mouvement,

            cible,

            vitesse,

            source: "texte"
        });
    }


    //==========================================================
    // 🌀 DÉPLACEMENT INSTANTANÉ
    //==========================================================

    if (
        contient(
            "téléporte",
            "teleporte",
            "téléportation",
            "teleportation",
            "déplacement instantané",
            "deplacement instantane"
        )
    ) {

        intentions.push({

            type: "deplacement",

            mouvement: "instantane",

            cible: trouverCible(),

            coutStamina:
                REGLES_COMBAT_ALLSTARS
                    .deplacementInstantane
                    .coutStamina,

            source: "texte"
        });
    }


    //==========================================================
    // 👊 ATTAQUE / FRAPPE
    //==========================================================

    const attaqueDetectee =
        contient(
            "frappe",
            "frapper",
            "attaque",
            "attaquer",
            "coup",
            "poing",
            "pied",
            "tranche",
            "trancher",
            "projectile",
            "projette"
        );


    if (attaqueDetectee) {

        //------------------------------------------------------
        // Technique reconnue
        //------------------------------------------------------

        let technique = null;

        if (
            contient(
                "coup direct",
                "direct"
            )
        ) {
            technique = "coup_direct";
        }

        else if (
            contient(
                "coup de poing",
                "poing"
            )
        ) {
            technique = "coup_de_poing";
        }

        else if (
            contient(
                "coup de pied",
                "pied"
            )
        ) {
            technique = "coup_de_pied";
        }

        else if (
            contient(
                "tranche",
                "trancher"
            )
        ) {
            technique = "attaque_tranchante";
        }

        else if (
            contient(
                "projectile",
                "projette"
            )
        ) {
            technique = "projectile";
        }

        else {

            technique = "attaque_generique";
        }


        intentions.push({

            type: "attaque",

            technique,

            cible:
                trouverCible(),

            zone:
                trouverZone(),

            membre:
                trouverMembre(),

            vitesse:
                trouverVitesse(),

            source: "texte"
        });
    }


    //==========================================================
    // 💨 ESQUIVE
    //==========================================================

    if (
        contient(
            "esquive",
            "esquiver",
            "évite",
            "evite",
            "éviter",
            "eviter"
        )
    ) {

        let type = "normale";

        if (
            contient(
                "vitesse maximale",
                "vmax",
                "maximum"
            )
        ) {
            type = "vitesse_maximale";
        }


        intentions.push({

            type: "defense",

            defense: "esquive",

            variante: type,

            coutStamina:
                REGLES_COMBAT_ALLSTARS
                    .esquive
                    .normale
                    .coutStamina,

            source: "texte"
        });
    }


    //==========================================================
    // 🛡️ BLOCAGE
    //==========================================================

    if (
        contient(
            "bloque",
            "bloquer",
            "pare",
            "parer",
            "garde"
        )
    ) {

        intentions.push({

            type: "defense",

            defense: "blocage",

            zone:
                trouverZone(),

            source: "texte"
        });
    }


    //==========================================================
    // ↪️ DÉVIATION
    //==========================================================

    if (
        contient(
            "dévie",
            "devie",
            "dévier",
            "devier",
            "change la trajectoire",
            "changer la trajectoire"
        )
    ) {

        intentions.push({

            type: "defense",

            defense: "deviation",

            coutStamina:
                REGLES_COMBAT_ALLSTARS
                    .trajectoire
                    .changer
                    .coutStamina,

            source: "texte"
        });
    }


    //==========================================================
    // 🤝 SAISIE
    //==========================================================

    if (
        contient(
            "saisit",
            "saisir",
            "attrape",
            "agrippe",
            "agripper",
            "empoigne"
        )
    ) {

        intentions.push({

            type: "attaque",

            technique: "saisie",

            cible:
                trouverCible(),

            membre:
                trouverMembre(),

            coutStamina:
                REGLES_COMBAT_ALLSTARS
                    .saisie
                    .coutStamina,

            source: "texte"
        });
    }


    //==========================================================
    // 🔄 CONTRE-ATTAQUE
    //==========================================================

    if (
        contient(
            "contre attaque",
            "contre-attaque",
            "contre attaque",
            "contre"
        )
    ) {

        intentions.push({

            type: "contre_attaque",

            cible:
                trouverCible(),

            zone:
                trouverZone(),

            membre:
                trouverMembre(),

            source: "texte"
        });
    }


    //==========================================================
    // ⚡ ATTAQUE ÉNERGÉTIQUE
    //==========================================================

    if (
        contient(
            "attaque énergétique",
            "attaque energetique",
            "projectile énergétique",
            "projectile energetique",
            "rayon",
            "laser",
            "boule d'énergie",
            "boule d energie"
        )
    ) {

        intentions.push({

            type: "energie",

            technique: "attaque_energetique",

            cible:
                trouverCible(),

            vitesse:
                trouverVitesse(),

            source: "texte"
        });
    }


    //==========================================================
    // 📊 RÉSULTAT
    //==========================================================

    return {

        succes:
            intentions.length > 0,

        nombreIntentions:
            intentions.length,

        intentions,

        texteOriginal:
            texte,

        joueur:
            joueur
                ? {
                    pseudo: joueur.pseudo,
                    jid: joueur.jid
                }
                : null
    };
}

//==============================================================
// ⚔️ ALL STARS — ÉTAT DU COMBAT
//==============================================================
// Représente l'état réel du combat à un instant donné.
//
// L'interpréteur décrit ce que le joueur VEUT faire.
// Ce bloc décrit ce qui EXISTE réellement dans le combat.
//
// L'arbitre utilisera ensuite les deux pour prendre sa décision.
//==============================================================


const ETATS_COMBAT_ALLSTARS = {

    NORMAL: "normal",
    SONNE: "sonne",
    IMMOBILISE: "immobilise",
    KO: "ko",
    MORT: "mort"
};


//==============================================================
// 🧍 CRÉATION D'UN JOUEUR DE COMBAT
//==============================================================

function creerEtatJoueurCombat(joueur = {}, personnage = {}) {

    return {

        //------------------------------------------------------
        // 👤 IDENTITÉ
        //------------------------------------------------------

        jid:
            joueur.jid ?? null,

        pseudo:
            joueur.pseudo ??
            "Inconnu",

        personnage:
            personnage.name ??
            personnage.nom ??
            joueur.personnage ??
            "Inconnu",


        //------------------------------------------------------
        // ❤️ RESSOURCES
        //------------------------------------------------------

        pv: Number(
            joueur.pv ??
            personnage.pv ??
            100
        ),

        pvMax: Number(
            joueur.pvMax ??
            personnage.pvMax ??
            100
        ),

        stamina: Number(
            joueur.stamina ??
            personnage.stamina ??
            100
        ),

        energie: Number(
            joueur.energie ??
            personnage.energie ??
            100
        ),

        energieMax: Number(
            joueur.energieMax ??
            personnage.energieMax ??
            100
        ),


        //------------------------------------------------------
        // ⚡ VITESSES
        //------------------------------------------------------

        travelSpeed:
            joueur.travelSpeed ??
            personnage.travelSpeed ??
            null,

        combatSpeed:
            joueur.combatSpeed ??
            personnage.combatSpeed ??
            0,


        //------------------------------------------------------
        // 📍 POSITION
        //------------------------------------------------------

        position: {

            x: Number(
                joueur.position?.x ??
                personnage.position?.x ??
                0
            ),

            y: Number(
                joueur.position?.y ??
                personnage.position?.y ??
                0
            ),

            z: Number(
                joueur.position?.z ??
                personnage.position?.z ??
                0
            )
        },


        //------------------------------------------------------
        // 🧭 ORIENTATION
        //------------------------------------------------------

        orientation:
            joueur.orientation ??
            "face_adversaire",


        //------------------------------------------------------
        // 🦴 ÉTAT DES MEMBRES
        //------------------------------------------------------

        membres: {

            brasGauche: {
                disponible: true,
                blessure: null
            },

            brasDroit: {
                disponible: true,
                blessure: null
            },

            jambeGauche: {
                disponible: true,
                blessure: null
            },

            jambeDroite: {
                disponible: true,
                blessure: null
            }
        },


        //------------------------------------------------------
        // 🧠 ÉTAT PHYSIQUE
        //------------------------------------------------------

        etat:
            ETATS_COMBAT_ALLSTARS.NORMAL,

        effets: [],


        //------------------------------------------------------
        // 🔄 ACTION EN COURS
        //------------------------------------------------------

        actionEnCours: null,

        sequenceEnCours: 0,

        tempsActionRestant: 0,


        //------------------------------------------------------
        // 🎯 CIBLE ACTUELLE
        //------------------------------------------------------

        cibleActuelle: null,


        //------------------------------------------------------
        // 📊 STATISTIQUES DE COMBAT
        //------------------------------------------------------

        statistiques: {

            coupsPortes: 0,

            coupsRecus: 0,

            esquives: 0,

            blocages: 0,

            saisies: 0,

            contres: 0
        }
    };
}


//==============================================================
// ⚔️ CRÉATION DE L'ÉTAT DU COMBAT
//==============================================================

function creerEtatCombatAllStars({

    joueur1 = null,
    joueur2 = null,

    personnage1 = null,
    personnage2 = null,

    distanceInitiale = 10,

    arena = null

} = {}) {


    //----------------------------------------------------------
    // 🧍 JOUEURS
    //----------------------------------------------------------

    const j1 =
        creerEtatJoueurCombat(
            joueur1,
            personnage1
        );

    const j2 =
        creerEtatJoueurCombat(
            joueur2,
            personnage2
        );


    //----------------------------------------------------------
    // 📍 POSITION INITIALE
    //----------------------------------------------------------

    j1.position = {
        x: 0,
        y: 0,
        z: 0
    };

    j2.position = {
        x: distanceInitiale,
        y: 0,
        z: 0
    };


    //----------------------------------------------------------
    // 🎯 CIBLES
    //----------------------------------------------------------

    j1.cibleActuelle =
        j2.jid;

    j2.cibleActuelle =
        j1.jid;


    //----------------------------------------------------------
    // 🏟️ ÉTAT GLOBAL
    //----------------------------------------------------------

    return {

        //------------------------------------------------------
        // 🆔 IDENTIFIANT
        //------------------------------------------------------

        id:
            Date.now().toString(),


        //------------------------------------------------------
        // 🏟️ ARÈNE
        //------------------------------------------------------

        arena:
            arena ?? "Salle du temps ⌛",


        //------------------------------------------------------
        // ⏱️ TEMPS
        //------------------------------------------------------

        temps: 0,

        tour: 0,

        sequence: 0,


        //------------------------------------------------------
        // 🎮 PHASE
        //------------------------------------------------------

        phase:
            "combat",


        //------------------------------------------------------
        // 👥 JOUEURS
        //------------------------------------------------------

        joueurs: {

            [j1.jid || "joueur1"]: j1,

            [j2.jid || "joueur2"]: j2
        },


        //------------------------------------------------------
        // 🔗 ORDRE DES JOUEURS
        //------------------------------------------------------

        ordre: [

            j1.jid || "joueur1",

            j2.jid || "joueur2"
        ],


        //------------------------------------------------------
        // ⚔️ ACTIONS EN COURS
        //------------------------------------------------------

        actionsEnCours: [],


        //------------------------------------------------------
        // 🏃 DÉPLACEMENTS
        //------------------------------------------------------

        deplacements: [],


        //------------------------------------------------------
        // 💥 DERNIÈRE ACTION
        //------------------------------------------------------

        derniereAction: null,


        //------------------------------------------------------
        // 🧠 DERNIÈRE DÉCISION
        //------------------------------------------------------

        derniereDecisionArbitre: null,


        //------------------------------------------------------
        // 📜 HISTORIQUE
        //------------------------------------------------------

        historique: []
    };
}


//==============================================================
// 📏 DISTANCE ENTRE DEUX JOUEURS
//==============================================================

function calculerDistanceCombat(joueurA, joueurB) {

    if (!joueurA || !joueurB) {
        return Infinity;
    }

    const ax = Number(joueurA.position?.x ?? 0);
    const ay = Number(joueurA.position?.y ?? 0);
    const az = Number(joueurA.position?.z ?? 0);

    const bx = Number(joueurB.position?.x ?? 0);
    const by = Number(joueurB.position?.y ?? 0);
    const bz = Number(joueurB.position?.z ?? 0);

    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;

    return Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
    );
}


//==============================================================
// 📊 INFORMATIONS DE DISTANCE
//==============================================================

function obtenirInfosDistanceCombat(
    joueurA,
    joueurB
) {

    const distance =
        calculerDistanceCombat(
            joueurA,
            joueurB
        );


    return {

        distance,

        contact:
            distance <= 1,

        corpsACorps:
            distance <=
            REGLES_COMBAT_ALLSTARS
                .corpsACorps
                .zoneEffetAttaqueFrontale,

        horsPorteeCorpsACorps:
            distance >
            REGLES_COMBAT_ALLSTARS
                .corpsACorps
                .zoneEffetAttaqueFrontale
    };
}


//==============================================================
// 🔋 CONSOMMATION DE STAMINA
//==============================================================

function consommerStaminaCombat(
    joueur,
    cout = 0
) {

    if (!joueur) {

        return {
            succes: false,
            raison: "Joueur introuvable."
        };
    }


    cout =
        Math.max(
            0,
            Number(cout) || 0
        );


    const staminaActuelle =
        Number(
            joueur.stamina ?? 0
        );


    //----------------------------------------------------------
    // ❌ PAS ASSEZ DE STAMINA
    //----------------------------------------------------------

    if (staminaActuelle < cout) {

        return {

            succes: false,

            raison:
                "Stamina insuffisante.",

            staminaAvant:
                staminaActuelle,

            cout,

            staminaApres:
                staminaActuelle
        };
    }


    //----------------------------------------------------------
    // ✅ CONSOMMATION
    //----------------------------------------------------------

    joueur.stamina =
        Math.max(
            0,
            staminaActuelle - cout
        );


    return {

        succes: true,

        staminaAvant:
            staminaActuelle,

        cout,

        staminaApres:
            joueur.stamina
    };
}


//==============================================================
// ⚡ CONSOMMATION D'ÉNERGIE
//==============================================================

function consommerEnergieCombat(
    joueur,
    cout = 0
) {

    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    cout =
        Math.max(
            0,
            Number(cout) || 0
        );


    const energieActuelle =
        Number(
            joueur.energie ?? 0
        );


    if (energieActuelle < cout) {

        return {

            succes: false,

            raison:
                "Énergie insuffisante.",

            energieAvant:
                energieActuelle,

            cout,

            energieApres:
                energieActuelle
        };
    }


    joueur.energie =
        Math.max(
            0,
            energieActuelle - cout
        );


    return {

        succes: true,

        energieAvant:
            energieActuelle,

        cout,

        energieApres:
            joueur.energie
    };
}


//==============================================================
// ❤️ APPLICATION DES DÉGÂTS
//==============================================================

function appliquerDegatsCombat(
    cible,
    degats = 0,
    source = null
) {

    if (!cible) {

        return {

            succes: false,

            raison:
                "Cible introuvable."
        };
    }


    degats =
        Math.max(
            0,
            Number(degats) || 0
        );


    const pvAvant =
        Number(
            cible.pv ?? 0
        );


    cible.pv =
        Math.max(
            0,
            pvAvant - degats
        );


    cible.statistiques.coupsRecus++;


    //----------------------------------------------------------
    // ☠️ KO / MORT
    //----------------------------------------------------------

    if (cible.pv <= 0) {

        cible.etat =
            ETATS_COMBAT_ALLSTARS.MORT;
    }


    return {

        succes: true,

        cible:
            cible.jid,

        degats,

        pvAvant,

        pvApres:
            cible.pv,

        etat:
            cible.etat,

        source
    };
}


//==============================================================
// 🦴 DISPONIBILITÉ D'UN MEMBRE
//==============================================================

function membreDisponibleCombat(
    joueur,
    membre
) {

    if (!joueur || !membre) {
        return true;
    }


    const correspondances = {

        droit: [
            "brasDroit",
            "jambeDroite"
        ],

        gauche: [
            "brasGauche",
            "jambeGauche"
        ]
    };


    const membres =
        correspondances[membre];


    if (!membres) {
        return true;
    }


    return membres.some(
        nom =>
            joueur.membres?.[nom]?.disponible !== false
    );
}


//==============================================================
// 🧠 SNAPSHOT DU COMBAT
//==============================================================
// L'arbitre IA ne recevra pas directement tout l'objet interne.
// On préparera un snapshot propre et lisible.
//==============================================================

function creerSnapshotCombat(
    combat
) {

    if (!combat) {
        return null;
    }


    const joueurs = [];


    for (const jid of combat.ordre || []) {

        const joueur =
            combat.joueurs?.[jid];

        if (!joueur) {
            continue;
        }


        joueurs.push({

            jid:
                joueur.jid,

            pseudo:
                joueur.pseudo,

            personnage:
                joueur.personnage,

            pv:
                joueur.pv,

            pvMax:
                joueur.pvMax,

            stamina:
                joueur.stamina,

            energie:
                joueur.energie,

            travelSpeed:
                joueur.travelSpeed,

            combatSpeed:
                joueur.combatSpeed,

            position: {
                x: joueur.position.x,
                y: joueur.position.y,
                z: joueur.position.z
            },

            orientation:
                joueur.orientation,

            etat:
                joueur.etat,

            membres:
                joueur.membres,

            actionEnCours:
                joueur.actionEnCours,

            cibleActuelle:
                joueur.cibleActuelle,

            effets:
                joueur.effets
        });
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    let distanceEntreJoueurs = null;


    if (joueurs.length >= 2) {

        distanceEntreJoueurs =
            calculerDistanceCombat(
                joueurs[0],
                joueurs[1]
            );
    }


    return {

        combatId:
            combat.id,

        arena:
            combat.arena,

        temps:
            combat.temps,

        tour:
            combat.tour,

        sequence:
            combat.sequence,

        phase:
            combat.phase,

        distanceEntreJoueurs,

        joueurs
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ État du combat ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — MOTEUR D'EXÉCUTION DES ACTIONS
//==============================================================
// Ce bloc transforme une décision de l'arbitre en modification
// réelle de l'état du combat.
//
// Exemple :
// L'interpréteur comprend :
// "Je fonce vers l'adversaire."
//
// L'arbitre décide :
// action = "deplacement"
//
// Ce moteur applique alors réellement le déplacement.
//==============================================================


//==============================================================
// 🎯 TYPES D'ACTIONS AUTORISÉES
//==============================================================

const ACTIONS_COMBAT_ALLSTARS = {

    DEPLACEMENT: "deplacement",

    ATTAQUE: "attaque",

    DEFENSE: "defense",

    ESQUIVE: "esquive",

    BLOCAGE: "blocage",

    SAISIE: "saisie",

    CONTRE: "contre",

    TECHNIQUE: "technique",

    RECUPERATION: "recuperation",

    ATTENTE: "attente"
};


//==============================================================
// 🔎 RÉCUPÉRER UN JOUEUR
//==============================================================

function obtenirJoueurCombat(
    combat,
    jid
) {

    if (!combat || !jid) {
        return null;
    }


    return combat.joueurs?.[jid] ?? null;
}


//==============================================================
// 🔎 VÉRIFIER SI UN JOUEUR PEUT AGIR
//==============================================================

function joueurPeutAgirCombat(
    joueur
) {

    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    //----------------------------------------------------------
    // ☠️ MORT
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        return {

            succes: false,

            raison:
                "Le joueur est mort."
        };
    }


    //----------------------------------------------------------
    // 😵 KO
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.KO
    ) {

        return {

            succes: false,

            raison:
                "Le joueur est KO."
        };
    }


    //----------------------------------------------------------
    // 💤 SONNÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        return {

            succes: false,

            raison:
                "Le joueur est sonné."
        };
    }


    //----------------------------------------------------------
    // 🦴 IMMOBILISÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.IMMOBILISE
    ) {

        return {

            succes: false,

            raison:
                "Le joueur est immobilisé."
        };
    }


    return {

        succes: true,

        raison:
            null
    };
}


//==============================================================
// 📍 DÉPLACEMENT
//==============================================================

function executerDeplacementCombat({

    combat,
    jid,
    destination,
    coutStamina = 0

} = {}) {


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    //----------------------------------------------------------
    // 👤 JOUEUR
    //----------------------------------------------------------

    const verification =
        joueurPeutAgirCombat(
            joueur
        );


    if (!verification.succes) {
        return verification;
    }


    //----------------------------------------------------------
    // 📍 DESTINATION
    //----------------------------------------------------------

    if (
        !destination ||
        typeof destination !== "object"
    ) {

        return {

            succes: false,

            raison:
                "Destination invalide."
        };
    }


    const x =
        Number(destination.x);

    const y =
        Number(destination.y);

    const z =
        Number(destination.z ?? 0);


    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(z)
    ) {

        return {

            succes: false,

            raison:
                "Coordonnées invalides."
        };
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const stamina =
        consommerStaminaCombat(
            joueur,
            coutStamina
        );


    if (!stamina.succes) {
        return stamina;
    }


    //----------------------------------------------------------
    // 📍 ANCIENNE POSITION
    //----------------------------------------------------------

    const anciennePosition = {

        x: joueur.position.x,

        y: joueur.position.y,

        z: joueur.position.z
    };


    //----------------------------------------------------------
    // 📍 NOUVELLE POSITION
    //----------------------------------------------------------

    joueur.position = {

        x,

        y,

        z
    };


    //----------------------------------------------------------
    // 🏃 ENREGISTREMENT
    //----------------------------------------------------------

    const mouvement = {

        jid,

        anciennePosition,

        nouvellePosition: {

            x,
            y,
            z
        },

        coutStamina,

        temps:
            combat.temps,

        sequence:
            ++combat.sequence
    };


    combat.deplacements.push(
        mouvement
    );


    combat.derniereAction = {

        type:
            ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT,

        jid,

        mouvement
    };


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "deplacement",

        jid,

        anciennePosition,

        nouvellePosition: {

            x,
            y,
            z
        },

        temps:
            combat.temps,

        sequence:
            combat.sequence
    });


    return {

        succes: true,

        action:
            "deplacement",

        jid,

        anciennePosition,

        nouvellePosition: {

            x,
            y,
            z
        },

        stamina:
            joueur.stamina
    };
}


//==============================================================
// 🛡️ DÉFENSE
//==============================================================

function executerDefenseCombat({

    combat,
    jid,
    type = "blocage"

} = {}) {


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    const verification =
        joueurPeutAgirCombat(
            joueur
        );


    if (!verification.succes) {
        return verification;
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.DEFENSE,

        sousType:
            type,

        debut:
            combat.temps,

        sequence:
            ++combat.sequence
    };


    combat.actionsEnCours.push(
        joueur.actionEnCours
    );


    combat.derniereAction = {

        type:
            ACTIONS_COMBAT_ALLSTARS.DEFENSE,

        jid,

        sousType:
            type
    };


    combat.historique.push({

        type:
            "defense",

        jid,

        sousType:
            type,

        temps:
            combat.temps,

        sequence:
            combat.sequence
    });


    return {

        succes: true,

        action:
            "defense",

        jid,

        sousType:
            type
    };
}


//==============================================================
// ⚔️ PRÉPARATION D'UNE ATTAQUE
//==============================================================
// IMPORTANT :
// Cette fonction ne décide PAS si l'attaque touche.
// Elle prépare seulement l'action.
//
// La résolution sera faite plus tard par l'ARBITRE.
//==============================================================

function preparerAttaqueCombat({

    combat,
    jid,
    cibleJid,
    type = "attaque",
    coutStamina = 0,
    coutEnergie = 0,
    technique = null

} = {}) {


    const attaquant =
        obtenirJoueurCombat(
            combat,
            jid
        );


    const cible =
        obtenirJoueurCombat(
            combat,
            cibleJid
        );


    //----------------------------------------------------------
    // 👤 VÉRIFICATIONS
    //----------------------------------------------------------

    const verification =
        joueurPeutAgirCombat(
            attaquant
        );


    if (!verification.succes) {
        return verification;
    }


    if (!cible) {

        return {

            succes: false,

            raison:
                "Cible introuvable."
        };
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    const infosDistance =
        obtenirInfosDistanceCombat(
            attaquant,
            cible
        );


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const stamina =
        consommerStaminaCombat(
            attaquant,
            coutStamina
        );


    if (!stamina.succes) {
        return stamina;
    }


    //----------------------------------------------------------
    // ⚡ ÉNERGIE
    //----------------------------------------------------------

    const energie =
        consommerEnergieCombat(
            attaquant,
            coutEnergie
        );


    if (!energie.succes) {

        // remboursement stamina
        attaquant.stamina +=
            stamina.cout;

        return energie;
    }


    //----------------------------------------------------------
    // ⚔️ ACTION
    //----------------------------------------------------------

    const action = {

        id:
            `${combat.id}_${++combat.sequence}`,

        type:
            ACTIONS_COMBAT_ALLSTARS.ATTAQUE,

        sousType:
            type,

        jid,

        cibleJid,

        technique,

        distance:
            infosDistance.distance,

        contact:
            infosDistance.contact,

        corpsACorps:
            infosDistance.corpsACorps,

        temps:
            combat.temps,

        sequence:
            combat.sequence,

        resolue:
            false
    };


    //----------------------------------------------------------
    // 📦 ENREGISTRER
    //----------------------------------------------------------

    combat.actionsEnCours.push(
        action
    );


    attaquant.actionEnCours =
        action;


    combat.derniereAction =
        action;


    combat.historique.push({

        type:
            "attaque_preparee",

        action
    });


    return {

        succes: true,

        action
    };
}


//==============================================================
// ⏳ ACTION D'ATTENTE
//==============================================================

function executerAttenteCombat({

    combat,
    jid

} = {}) {


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    const verification =
        joueurPeutAgirCombat(
            joueur
        );


    if (!verification.succes) {
        return verification;
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.ATTENTE,

        debut:
            combat.temps,

        sequence:
            ++combat.sequence
    };


    combat.derniereAction =
        joueur.actionEnCours;


    combat.historique.push({

        type:
            "attente",

        jid,

        temps:
            combat.temps,

        sequence:
            combat.sequence
    });


    return {

        succes: true,

        action:
            joueur.actionEnCours
    };
}


//==============================================================
// 🧹 NETTOYAGE DES ACTIONS TERMINÉES
//==============================================================

function nettoyerActionsCombat(
    combat
) {

    if (!combat) {
        return;
    }


    combat.actionsEnCours =
        (combat.actionsEnCours || [])
            .filter(
                action =>
                    action &&
                    action.resolue !== true
            );


    for (
        const jid of
        combat.ordre || []
    ) {

        const joueur =
            combat.joueurs?.[jid];

        if (!joueur) {
            continue;
        }


        if (
            joueur.actionEnCours &&
            joueur.actionEnCours.resolue === true
        ) {

            joueur.actionEnCours =
                null;
        }
    }
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Moteur d'exécution des actions ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — RÉSOLUTION DES ACTIONS
//==============================================================
// Ce bloc transforme les actions préparées en résultats réels.
//
// Il ne comprend PAS encore le texte du joueur.
// Il reçoit des actions déjà interprétées.
//
// Exemple :
//
// Attaque préparée
//        ↓
// Résolveur
//        ↓
// défense / esquive / blocage / impact
//        ↓
// dégâts / état / historique
//
// L'arbitre IA pourra ensuite utiliser ce moteur pour décider
// quelle résolution est logique.
//==============================================================


//==============================================================
// 🎯 RÉSULTATS POSSIBLES
//==============================================================

const RESULTATS_COMBAT_ALLSTARS = {

    TOUCHE: "touche",

    ESQUIVE: "esquive",

    BLOQUE: "bloque",

    CONTRE: "contre",

    ECHEC: "echec",

    IMPOSSIBLE: "impossible"
};


//==============================================================
// 🔎 RÉCUPÉRER L'ACTION ACTIVE D'UN JOUEUR
//==============================================================

function obtenirActionActiveCombat(
    combat,
    jid
) {

    if (!combat || !jid) {
        return null;
    }


    const joueur =
        combat.joueurs?.[jid];


    if (!joueur) {
        return null;
    }


    //----------------------------------------------------------
    // Action directement attachée au joueur
    //----------------------------------------------------------

    if (joueur.actionEnCours) {

        return joueur.actionEnCours;
    }


    //----------------------------------------------------------
    // Recherche dans les actions globales
    //----------------------------------------------------------

    return (
        combat.actionsEnCours || []
    ).find(
        action =>
            action &&
            action.jid === jid &&
            action.resolue !== true
    ) || null;
}


//==============================================================
// 📏 VÉRIFIER LA PORTÉE D'UNE ATTAQUE
//==============================================================

function verifierPorteeAttaqueCombat({

    attaquant,
    cible,
    portee = null

} = {}) {


    if (!attaquant || !cible) {

        return {

            valide: false,

            raison:
                "Attaquant ou cible introuvable."
        };
    }


    const distance =
        calculerDistanceCombat(
            attaquant,
            cible
        );


    //----------------------------------------------------------
    // Si aucune portée spécifique
    //----------------------------------------------------------

    if (
        portee === null ||
        portee === undefined
    ) {

        return {

            valide: true,

            distance
        };
    }


    const porteeNumerique =
        Number(portee);


    if (
        !Number.isFinite(
            porteeNumerique
        )
    ) {

        return {

            valide: false,

            raison:
                "Portée invalide.",

            distance
        };
    }


    return {

        valide:
            distance <=
            porteeNumerique,

        distance,

        portee:
            porteeNumerique
    };
}


//==============================================================
// 🛡️ DÉTECTER LA DÉFENSE ACTIVE
//==============================================================

function obtenirDefenseActiveCombat(
    combat,
    jid
) {

    const joueur =
        combat?.joueurs?.[jid];


    if (!joueur) {
        return null;
    }


    const action =
        obtenirActionActiveCombat(
            combat,
            jid
        );


    if (!action) {
        return null;
    }


    //----------------------------------------------------------
    // Défense
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        return action;
    }


    //----------------------------------------------------------
    // Esquive
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        return action;
    }


    //----------------------------------------------------------
    // Contre
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        return action;
    }


    return null;
}


//==============================================================
// 🧠 CALCUL DU TAUX D'EFFICACITÉ
//==============================================================
// Cette fonction ne remplace PAS l'arbitre.
// Elle fournit simplement une base numérique.
//
// Plus tard, les statistiques du personnage, les techniques,
// les blessures, les effets et la situation pourront modifier
// cette valeur.
//==============================================================

function calculerEfficaciteCombat({

    attaquant,
    cible,
    action

} = {}) {


    if (!attaquant || !cible || !action) {

        return 0;
    }


    let efficacite = 1;


    //----------------------------------------------------------
    // 🩸 État de l'attaquant
    //----------------------------------------------------------

    if (
        attaquant.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        efficacite *= 0.5;
    }


    //----------------------------------------------------------
    // 🦴 Membres
    //----------------------------------------------------------

    if (
        action.membre &&
        !membreDisponibleCombat(
            attaquant,
            action.membre
        )
    ) {

        efficacite *= 0;
    }


    //----------------------------------------------------------
    // 🎯 Cible immobilisée
    //----------------------------------------------------------

    if (
        cible.etat ===
        ETATS_COMBAT_ALLSTARS.IMMOBILISE
    ) {

        efficacite *= 1.15;
    }


    //----------------------------------------------------------
    // 📏 Distance
    //----------------------------------------------------------

    const distance =
        calculerDistanceCombat(
            attaquant,
            cible
        );


    if (distance <= 1) {

        efficacite *= 1.1;
    }


    return Math.max(
        0,
        efficacite
    );
}


//==============================================================
// 💥 CALCUL DES DÉGÂTS
//==============================================================

function calculerDegatsCombat({

    attaquant,
    cible,
    action,
    degatsBase = 0

} = {}) {


    if (!attaquant || !cible) {
        return 0;
    }


    let degats =
        Math.max(
            0,
            Number(degatsBase) || 0
        );


    //----------------------------------------------------------
    // EFFICACITÉ
    //----------------------------------------------------------

    const efficacite =
        calculerEfficaciteCombat({

            attaquant,
            cible,
            action
        });


    degats *=
        efficacite;


    //----------------------------------------------------------
    // Arrondi
    //----------------------------------------------------------

    return Math.max(
        0,
        Math.round(degats)
    );
}


//==============================================================
// 🛡️ RÉSOLUTION D'UNE DÉFENSE
//==============================================================

function resoudreDefenseCombat({

    attaque,
    defense

} = {}) {


    if (!attaque) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            raison:
                "Attaque inexistante."
        };
    }


    //----------------------------------------------------------
    // Aucune défense
    //----------------------------------------------------------

    if (!defense) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.TOUCHE
        };
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        defense.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.BLOQUE,

            reduction:
                0.7
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        defense.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

            reduction:
                1
        };
    }


    //----------------------------------------------------------
    // ⚔️ CONTRE
    //----------------------------------------------------------

    if (
        defense.type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.CONTRE,

            reduction:
                1
        };
    }


    return {

        resultat:
            RESULTATS_COMBAT_ALLSTARS.TOUCHE
    };
}


//==============================================================
// 💥 RÉSOUDRE UNE ATTAQUE
//==============================================================

function resoudreAttaqueCombat({

    combat,
    action,
    degatsBase = 10,
    portee = null

} = {}) {


    if (!combat || !action) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Combat ou action introuvable."
        };
    }


    //----------------------------------------------------------
    // 👤 RÉCUPÉRATION
    //----------------------------------------------------------

    const attaquant =
        obtenirJoueurCombat(
            combat,
            action.jid
        );


    const cible =
        obtenirJoueurCombat(
            combat,
            action.cibleJid
        );


    if (!attaquant) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Attaquant introuvable."
        };
    }


    if (!cible) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Cible introuvable."
        };
    }


    //----------------------------------------------------------
    // 📏 PORTÉE
    //----------------------------------------------------------

    const verificationPortee =
        verifierPorteeAttaqueCombat({

            attaquant,
            cible,
            portee
        });


    if (!verificationPortee.valide) {

        action.resolue = true;


        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            raison:
                "Cible hors de portée.",

            distance:
                verificationPortee.distance
        };
    }


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    const defense =
        obtenirDefenseActiveCombat(
            combat,
            cible.jid
        );


    const resolutionDefense =
        resoudreDefenseCombat({

            attaque:
                action,

            defense
        });


    //----------------------------------------------------------
    // ⚔️ CONTRE
    //----------------------------------------------------------

    if (
        resolutionDefense.resultat ===
        RESULTATS_COMBAT_ALLSTARS.CONTRE
    ) {

        action.resolue = true;


        attaquant.actionEnCours = null;


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.CONTRE,

            attaquant:
                attaquant.jid,

            cible:
                cible.jid
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        resolutionDefense.resultat ===
        RESULTATS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        attaquant.statistiques.esquives++;


        action.resolue = true;


        attaquant.actionEnCours = null;


        combat.historique.push({

            type:
                "esquive",

            attaquant:
                attaquant.jid,

            defenseur:
                cible.jid,

            temps:
                combat.temps,

            sequence:
                ++combat.sequence
        });


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

            attaquant:
                attaquant.jid,

            cible:
                cible.jid
        };
    }


    //----------------------------------------------------------
    // 💥 DÉGÂTS
    //----------------------------------------------------------

    let degats =
        calculerDegatsCombat({

            attaquant,
            cible,
            action,
            degatsBase
        });


    //----------------------------------------------------------
    // 🛡️ RÉDUCTION DU BLOCAGE
    //----------------------------------------------------------

    if (
        resolutionDefense.resultat ===
        RESULTATS_COMBAT_ALLSTARS.BLOQUE
    ) {

        degats =
            Math.round(
                degats *
                (
                    1 -
                    resolutionDefense.reduction
                )
            );


        cible.statistiques.blocages++;
    }


    //----------------------------------------------------------
    // APPLICATION
    //----------------------------------------------------------

    const application =
        appliquerDegatsCombat(
            cible,
            degats,
            attaquant.jid
        );


    //----------------------------------------------------------
    // STATISTIQUES
    //----------------------------------------------------------

    if (degats > 0) {

        attaquant.statistiques.coupsPortes++;
    }


    //----------------------------------------------------------
    // ACTION TERMINÉE
    //----------------------------------------------------------

    action.resolue = true;


    attaquant.actionEnCours = null;


    if (defense) {

        defense.resolue = true;
    }


    //----------------------------------------------------------
    // HISTORIQUE
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "attaque_resolue",

        attaquant:
            attaquant.jid,

        cible:
            cible.jid,

        resultat:
            resolutionDefense.resultat,

        degats,

        pvAvant:
            application.pvAvant,

        pvApres:
            application.pvApres,

        temps:
            combat.temps,

        sequence:
            ++combat.sequence
    });


    return {

        succes: true,

        resultat:
            resolutionDefense.resultat,

        attaquant:
            attaquant.jid,

        cible:
            cible.jid,

        degats,

        pvAvant:
            application.pvAvant,

        pvApres:
            application.pvApres,

        etatCible:
            cible.etat,

        distance:
            verificationPortee.distance
    };
}


//==============================================================
// 🧹 RÉSOLUTION DE TOUTES LES ATTAQUES
//==============================================================

function resoudreActionsCombat(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            resultats: []
        };
    }


    const resultats = [];


    const actions =
        [...(
            combat.actionsEnCours || []
        )];


    for (
        const action of actions
    ) {

        if (!action) {
            continue;
        }


        if (
            action.resolue === true
        ) {
            continue;
        }


        //------------------------------------------------------
        // ⚔️ ATTAQUE
        //------------------------------------------------------

        if (
            action.type ===
            ACTIONS_COMBAT_ALLSTARS.ATTAQUE
        ) {

            const resultat =
                resoudreAttaqueCombat({

                    combat,

                    action,

                    degatsBase:
                        action.degatsBase ??
                        10,

                    portee:
                        action.portee ??
                        null
                });


            resultats.push(
                resultat
            );
        }
    }


    //----------------------------------------------------------
    // 🧹 NETTOYAGE
    //----------------------------------------------------------

    nettoyerActionsCombat(
        combat
    );


    return {

        succes: true,

        resultats
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Résolveur de combat ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — SYSTÈME DE BLESSURES & ÉTATS
//==============================================================
// Gère les conséquences physiques des actions.
//
// Le résolveur détermine :
// "L'attaque touche."
//
// Ce système détermine ensuite :
// - quelle partie est touchée
// - si un membre devient indisponible
// - si le joueur est sonné
// - si le joueur est immobilisé
// - si le joueur tombe KO
// - si un effet temporaire doit être ajouté
// - quand les effets expirent
//==============================================================


//==============================================================
// 🦴 TYPES DE BLESSURES
//==============================================================

const TYPES_BLESSURES_ALLSTARS = {

    LEGER: "leger",

    MOYENNE: "moyenne",

    GRAVE: "grave",

    CRITIQUE: "critique"
};


//==============================================================
// 🧠 TYPES D'EFFETS
//==============================================================

const TYPES_EFFETS_ALLSTARS = {

    SAIGNE: "saigne",

    SONNE: "sonne",

    IMMOBILISE: "immobilise",

    RALENTI: "ralenti",

    AFFAIBLI: "affaibli",

    DESORIENTE: "desoriente"
};


//==============================================================
// 🦴 VÉRIFIER QU'UN MEMBRE EXISTE
//==============================================================

function obtenirMembreCombat(
    joueur,
    membre
) {

    if (!joueur || !membre) {
        return null;
    }


    return joueur.membres?.[membre] ?? null;
}


//==============================================================
// 🩸 AJOUTER UNE BLESSURE À UN MEMBRE
//==============================================================

function appliquerBlessureMembreCombat({

    joueur,
    membre,
    gravite =
        TYPES_BLESSURES_ALLSTARS.LEGER,
    description = null

} = {}) {


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const partie =
        obtenirMembreCombat(
            joueur,
            membre
        );


    if (!partie) {

        return {

            succes: false,

            raison:
                `Membre invalide : ${membre}`
        };
    }


    //----------------------------------------------------------
    // 🩸 ENREGISTREMENT
    //----------------------------------------------------------

    partie.blessure = {

        gravite,

        description:
            description ??
            `Blessure ${gravite}`,

        temps:
            Date.now()
    };


    //----------------------------------------------------------
    // ⚠️ INDISPONIBILITÉ
    //----------------------------------------------------------

    if (
        gravite ===
        TYPES_BLESSURES_ALLSTARS.GRAVE ||

        gravite ===
        TYPES_BLESSURES_ALLSTARS.CRITIQUE
    ) {

        partie.disponible = false;
    }


    //----------------------------------------------------------
    // 📜 HISTORIQUE DU JOUEUR
    //----------------------------------------------------------

    if (!joueur.blessures) {

        joueur.blessures = [];
    }


    joueur.blessures.push({

        membre,

        gravite,

        description:
            description ??
            null,

        temps:
            Date.now()
    });


    return {

        succes: true,

        jid:
            joueur.jid,

        membre,

        gravite,

        disponible:
            partie.disponible
    };
}


//==============================================================
// 🧠 AJOUTER UN EFFET TEMPORAIRE
//==============================================================

function ajouterEffetCombat({

    joueur,

    type,

    duree = 1,

    intensite = 1,

    source = null

} = {}) {


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    if (!type) {

        return {

            succes: false,

            raison:
                "Type d'effet manquant."
        };
    }


    if (!Array.isArray(joueur.effets)) {

        joueur.effets = [];
    }


    //----------------------------------------------------------
    // 🔄 REMPLACER / ACTUALISER UN EFFET EXISTANT
    //----------------------------------------------------------

    const effetExistant =
        joueur.effets.find(
            effet =>
                effet.type === type
        );


    if (effetExistant) {

        effetExistant.duree =
            Math.max(
                Number(
                    effetExistant.duree
                ) || 0,

                Number(duree) || 0
            );


        effetExistant.intensite =
            Number(intensite) || 1;


        return {

            succes: true,

            effet:
                effetExistant,

            nouveau: false
        };
    }


    //----------------------------------------------------------
    // ➕ NOUVEL EFFET
    //----------------------------------------------------------

    const effet = {

        type,

        duree:
            Math.max(
                1,
                Number(duree) || 1
            ),

        intensite:
            Number(intensite) || 1,

        source,

        ajouteA:
            Date.now()
    };


    joueur.effets.push(
        effet
    );


    return {

        succes: true,

        effet,

        nouveau: true
    };
}


//==============================================================
// ❌ SUPPRIMER UN EFFET
//==============================================================

function retirerEffetCombat(
    joueur,
    type
) {

    if (!joueur) {
        return false;
    }


    if (!Array.isArray(joueur.effets)) {
        return false;
    }


    const longueurAvant =
        joueur.effets.length;


    joueur.effets =
        joueur.effets.filter(
            effet =>
                effet.type !== type
        );


    return (
        joueur.effets.length <
        longueurAvant
    );
}


//==============================================================
// 🔎 VÉRIFIER UN EFFET
//==============================================================

function joueurAEffetCombat(
    joueur,
    type
) {

    if (!joueur) {
        return false;
    }


    return (
        Array.isArray(joueur.effets) &&
        joueur.effets.some(
            effet =>
                effet.type === type
        )
    );
}


//==============================================================
// 🧠 APPLIQUER AUTOMATIQUEMENT LES CONSÉQUENCES
//==============================================================

function appliquerEtatPhysiqueCombat({

    joueur,

    degats = 0,

    membre = null,

    graviteBlessure = null,

    sonne = false,

    immobilise = false,

    dureeEffet = 1

} = {}) {


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const resultats = [];


    //----------------------------------------------------------
    // 🩸 BLESSURE
    //----------------------------------------------------------

    if (
        membre &&
        graviteBlessure
    ) {

        const blessure =
            appliquerBlessureMembreCombat({

                joueur,

                membre,

                gravite:
                    graviteBlessure
            });


        resultats.push(
            blessure
        );
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (sonne) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.SONNE;


        const effet =
            ajouterEffetCombat({

                joueur,

                type:
                    TYPES_EFFETS_ALLSTARS.SONNE,

                duree:
                    dureeEffet,

                intensite:
                    1
            });


        resultats.push(
            effet
        );
    }


    //----------------------------------------------------------
    // 🦿 IMMOBILISATION
    //----------------------------------------------------------

    if (immobilise) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.IMMOBILISE;


        const effet =
            ajouterEffetCombat({

                joueur,

                type:
                    TYPES_EFFETS_ALLSTARS.IMMOBILISE,

                duree:
                    dureeEffet,

                intensite:
                    1
            });


        resultats.push(
            effet
        );
    }


    //----------------------------------------------------------
    // ☠️ KO
    //----------------------------------------------------------

    if (
        joueur.pv <= 0 &&
        joueur.etat !==
            ETATS_COMBAT_ALLSTARS.MORT
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.KO;


        resultats.push({

            type:
                "ko",

            jid:
                joueur.jid
        });
    }


    return {

        succes: true,

        jid:
            joueur.jid,

        pv:
            joueur.pv,

        etat:
            joueur.etat,

        resultats
    };
}


//==============================================================
// 🔄 RÉTABLIR L'ÉTAT NORMAL
//==============================================================

function actualiserEtatJoueurCombat(
    joueur
) {

    if (!joueur) {
        return null;
    }


    //----------------------------------------------------------
    // ☠️ MORT
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        return joueur.etat;
    }


    //----------------------------------------------------------
    // ❤️ PV = 0
    //----------------------------------------------------------

    if (joueur.pv <= 0) {

        joueur.pv = 0;

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.MORT;

        return joueur.etat;
    }


    //----------------------------------------------------------
    // 😵 EFFET SONNÉ
    //----------------------------------------------------------

    if (
        joueurAEffetCombat(
            joueur,
            TYPES_EFFETS_ALLSTARS.SONNE
        )
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.SONNE;

        return joueur.etat;
    }


    //----------------------------------------------------------
    // 🦿 EFFET IMMOBILISÉ
    //----------------------------------------------------------

    if (
        joueurAEffetCombat(
            joueur,
            TYPES_EFFETS_ALLSTARS.IMMOBILISE
        )
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.IMMOBILISE;

        return joueur.etat;
    }


    //----------------------------------------------------------
    // ❤️ RETOUR NORMAL
    //----------------------------------------------------------

    joueur.etat =
        ETATS_COMBAT_ALLSTARS.NORMAL;


    return joueur.etat;
}


//==============================================================
// ⏳ FAIRE AVANCER LES EFFETS
//==============================================================
// Une unité = un tour logique du combat.
// L'arbitre décidera plus tard combien de temps représente
// exactement un tour.
//==============================================================

function faireAvancerEffetsCombat(
    combat
) {

    if (!combat) {
        return [];
    }


    const changements = [];


    for (
        const jid of
        combat.ordre || []
    ) {

        const joueur =
            combat.joueurs?.[jid];


        if (!joueur) {
            continue;
        }


        if (
            !Array.isArray(
                joueur.effets
            )
        ) {

            joueur.effets = [];
        }


        //------------------------------------------------------
        // ⏳ DIMINUTION DES DURÉES
        //------------------------------------------------------

        const effetsAvant =
            joueur.effets.length;


        joueur.effets =
            joueur.effets
                .map(
                    effet => ({

                        ...effet,

                        duree:
                            (
                                Number(
                                    effet.duree
                                ) || 0
                            ) - 1
                    })
                )
                .filter(
                    effet =>
                        effet.duree > 0
                );


        //------------------------------------------------------
        // 📊 CHANGEMENT
        //------------------------------------------------------

        if (
            joueur.effets.length !==
            effetsAvant
        ) {

            changements.push({

                jid,

                effetsRestants:
                    joueur.effets.length
            });
        }


        //------------------------------------------------------
        // 🔄 ACTUALISATION DE L'ÉTAT
        //------------------------------------------------------

        const ancienEtat =
            joueur.etat;


        actualiserEtatJoueurCombat(
            joueur
        );


        if (
            ancienEtat !==
            joueur.etat
        ) {

            changements.push({

                jid,

                ancienEtat,

                nouvelEtat:
                    joueur.etat
            });
        }
    }


    return changements;
}


//==============================================================
// ❤️ RÉCUPÉRATION DE STAMINA
//==============================================================

function recupererStaminaCombat({

    joueur,

    quantite = 0

} = {}) {


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const avant =
        Number(
            joueur.stamina ?? 0
        );


    const maximum =
        Number(
            joueur.staminaMax ??
            100
        );


    joueur.stamina =
        Math.min(

            maximum,

            avant +
            Math.max(
                0,
                Number(quantite) || 0
            )
        );


    return {

        succes: true,

        avant,

        apres:
            joueur.stamina,

        recuperee:
            joueur.stamina - avant
    };
}


//==============================================================
// ⚡ RÉCUPÉRATION D'ÉNERGIE
//==============================================================

function recupererEnergieCombat({

    joueur,

    quantite = 0

} = {}) {


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const avant =
        Number(
            joueur.energie ?? 0
        );


    const maximum =
        Number(
            joueur.energieMax ??
            100
        );


    joueur.energie =
        Math.min(

            maximum,

            avant +
            Math.max(
                0,
                Number(quantite) || 0
            )
        );


    return {

        succes: true,

        avant,

        apres:
            joueur.energie,

        recuperee:
            joueur.energie - avant
    };
}


//==============================================================
// 🧹 FIN DE TOUR PHYSIQUE
//==============================================================

function actualiserEtatCombatAllStars(
    combat
) {

    if (!combat) {
        return null;
    }


    //----------------------------------------------------------
    // ⏳ EFFETS
    //----------------------------------------------------------

    const changements =
        faireAvancerEffetsCombat(
            combat
        );


    //----------------------------------------------------------
    // 👥 JOUEURS
    //----------------------------------------------------------

    for (
        const jid of
        combat.ordre || []
    ) {

        const joueur =
            combat.joueurs?.[jid];


        if (!joueur) {
            continue;
        }


        //------------------------------------------------------
        // ☠️ MORT
        //------------------------------------------------------

        if (
            joueur.pv <= 0
        ) {

            joueur.pv = 0;

            joueur.etat =
                ETATS_COMBAT_ALLSTARS.MORT;

            continue;
        }


        //------------------------------------------------------
        // ❤️ STAMINA
        //------------------------------------------------------

        if (
            joueur.stamina < 0
        ) {

            joueur.stamina = 0;
        }


        //------------------------------------------------------
        // ⚡ ÉNERGIE
        //------------------------------------------------------

        if (
            joueur.energie < 0
        ) {

            joueur.energie = 0;
        }
    }


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    if (
        changements.length > 0
    ) {

        combat.historique.push({

            type:
                "actualisation_etats",

            changements,

            temps:
                combat.temps,

            sequence:
                ++combat.sequence
        });
    }


    return {

        succes: true,

        changements
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Système de blessures et états ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — MOTEUR DES CAPACITÉS DE COMBAT
//==============================================================
// Transforme les statistiques du personnage en valeurs
// utilisables par le moteur de combat.
//
// IMPORTANT :
// Ce bloc ne décide pas de l'action.
// Il calcule uniquement les capacités disponibles.
//
// Exemple :
//
// personnage
//    ↓
// statistiques
//    ↓
// calculCapacitesCombat()
//    ↓
// vitesse / force / défense / précision / esquive
//    ↓
// arbitre + résolveur
//==============================================================


//==============================================================
// 📊 VALEURS PAR DÉFAUT
//==============================================================

const CAPACITES_COMBAT_DEFAUT = {

    force: 10,

    vitesse: 10,

    defense: 10,

    precision: 10,

    esquive: 10,

    endurance: 10,

    puissance: 10,

    reflexes: 10,

    resistance: 10,

    intelligenceCombat: 10
};


//==============================================================
// 🔢 NORMALISATION D'UNE STATISTIQUE
//==============================================================

function normaliserStatCombat(
    valeur,
    valeurDefaut = 10
) {

    const nombre =
        Number(valeur);


    if (
        !Number.isFinite(nombre)
    ) {

        return valeurDefaut;
    }


    return Math.max(
        0,
        nombre
    );
}


//==============================================================
// 🔎 RÉCUPÉRER UNE STATISTIQUE
//==============================================================

function obtenirStatCombat(
    joueur,
    noms = [],
    valeurDefaut = 10
) {

    if (!joueur) {
        return valeurDefaut;
    }


    //----------------------------------------------------------
    // Recherche directe sur le joueur
    //----------------------------------------------------------

    for (
        const nom of noms
    ) {

        if (
            joueur[nom] !== undefined &&
            joueur[nom] !== null
        ) {

            return normaliserStatCombat(
                joueur[nom],
                valeurDefaut
            );
        }
    }


    //----------------------------------------------------------
    // Recherche dans personnage
    //----------------------------------------------------------

    if (
        joueur.personnageData &&
        typeof joueur.personnageData === "object"
    ) {

        for (
            const nom of noms
        ) {

            if (
                joueur.personnageData[nom] !== undefined &&
                joueur.personnageData[nom] !== null
            ) {

                return normaliserStatCombat(
                    joueur.personnageData[nom],
                    valeurDefaut
                );
            }
        }
    }


    return valeurDefaut;
}


//==============================================================
// ⚔️ CRÉER LES CAPACITÉS D'UN JOUEUR
//==============================================================

function calculerCapacitesCombat(
    joueur
) {

    if (!joueur) {
        return null;
    }


    //----------------------------------------------------------
    // 📊 STATISTIQUES DE BASE
    //----------------------------------------------------------

    const force =
        obtenirStatCombat(
            joueur,
            [
                "force",
                "strength",
                "atk",
                "attaque",
                "puissancePhysique"
            ]
        );


    const vitesse =
        obtenirStatCombat(
            joueur,
            [
                "vitesse",
                "speed",
                "combatSpeed",
                "agi",
                "agilite"
            ]
        );


    const defense =
        obtenirStatCombat(
            joueur,
            [
                "defense",
                "def",
                "resistancePhysique"
            ]
        );


    const precision =
        obtenirStatCombat(
            joueur,
            [
                "precision",
                "accuracy",
                "accuracyRate"
            ]
        );


    const esquive =
        obtenirStatCombat(
            joueur,
            [
                "esquive",
                "evasion",
                "dodge"
            ]
        );


    const endurance =
        obtenirStatCombat(
            joueur,
            [
                "endurance",
                "stamina",
                "vitalite"
            ]
        );


    const puissance =
        obtenirStatCombat(
            joueur,
            [
                "puissance",
                "power",
                "damage",
                "attaquePuissance"
            ]
        );


    const reflexes =
        obtenirStatCombat(
            joueur,
            [
                "reflexes",
                "reflex",
                "reaction"
            ]
        );


    const resistance =
        obtenirStatCombat(
            joueur,
            [
                "resistance",
                "res",
                "durabilite"
            ]
        );


    const intelligenceCombat =
        obtenirStatCombat(
            joueur,
            [
                "intelligenceCombat",
                "combatIQ",
                "iq",
                "tactique"
            ]
        );


    //----------------------------------------------------------
    // 📦 CAPACITÉS
    //----------------------------------------------------------

    return {

        force,

        vitesse,

        defense,

        precision,

        esquive,

        endurance,

        puissance,

        reflexes,

        resistance,

        intelligenceCombat
    };
}


//==============================================================
// ⚡ VITESSE EFFECTIVE
//==============================================================
// La vitesse réelle peut être modifiée par :
// - blessures
// - effets
// - stamina
// - état physique
//==============================================================

function calculerVitesseEffectiveCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let vitesse =
        capacites.vitesse;


    //----------------------------------------------------------
    // 🩸 STAMINA
    //----------------------------------------------------------

    const stamina =
        Number(
            joueur.stamina ?? 100
        );


    if (stamina <= 20) {

        vitesse *= 0.75;

    } else if (stamina <= 40) {

        vitesse *= 0.9;
    }


    //----------------------------------------------------------
    // 🦿 MEMBRES
    //----------------------------------------------------------

    const jambeGauche =
        joueur.membres?.jambeGauche;


    const jambeDroite =
        joueur.membres?.jambeDroite;


    if (
        jambeGauche?.disponible === false
    ) {

        vitesse *= 0.65;
    }


    if (
        jambeDroite?.disponible === false
    ) {

        vitesse *= 0.65;
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        vitesse *= 0.5;
    }


    //----------------------------------------------------------
    // 🦿 IMMOBILISÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.IMMOBILISE
    ) {

        vitesse *= 0.15;
    }


    //----------------------------------------------------------
    // 🐌 RALENTISSEMENT
    //----------------------------------------------------------

    if (
        joueurAEffetCombat(
            joueur,
            TYPES_EFFETS_ALLSTARS.RALENTI
        )
    ) {

        vitesse *= 0.7;
    }


    return Math.max(
        0,
        vitesse
    );
}


//==============================================================
// 💪 PUISSANCE PHYSIQUE EFFECTIVE
//==============================================================

function calculerForceEffectiveCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let force =
        capacites.force;


    //----------------------------------------------------------
    // 🩸 BRAS
    //----------------------------------------------------------

    const brasGauche =
        joueur.membres?.brasGauche;


    const brasDroit =
        joueur.membres?.brasDroit;


    if (
        brasGauche?.disponible === false
    ) {

        force *= 0.7;
    }


    if (
        brasDroit?.disponible === false
    ) {

        force *= 0.7;
    }


    //----------------------------------------------------------
    // 🩸 AFFAIBLI
    //----------------------------------------------------------

    if (
        joueurAEffetCombat(
            joueur,
            TYPES_EFFETS_ALLSTARS.AFFAIBLI
        )
    ) {

        force *= 0.7;
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        force *= 0.6;
    }


    return Math.max(
        0,
        force
    );
}


//==============================================================
// 🛡️ DÉFENSE EFFECTIVE
//==============================================================

function calculerDefenseEffectiveCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let defense =
        capacites.defense;


    //----------------------------------------------------------
    // ❤️ ENDURANCE
    //----------------------------------------------------------

    const stamina =
        Number(
            joueur.stamina ?? 100
        );


    if (stamina <= 20) {

        defense *= 0.7;

    } else if (stamina <= 40) {

        defense *= 0.85;
    }


    //----------------------------------------------------------
    // 🛡️ MEMBRES
    //----------------------------------------------------------

    const brasGauche =
        joueur.membres?.brasGauche;


    const brasDroit =
        joueur.membres?.brasDroit;


    if (
        brasGauche?.disponible === false
    ) {

        defense *= 0.8;
    }


    if (
        brasDroit?.disponible === false
    ) {

        defense *= 0.8;
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        defense *= 0.5;
    }


    return Math.max(
        0,
        defense
    );
}


//==============================================================
// 🎯 PRÉCISION EFFECTIVE
//==============================================================

function calculerPrecisionEffectiveCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let precision =
        capacites.precision;


    //----------------------------------------------------------
    // 🧠 RÉFLEXES
    //----------------------------------------------------------

    precision =
        (
            precision * 0.7
        ) +
        (
            capacites.reflexes * 0.3
        );


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.SONNE
    ) {

        precision *= 0.55;
    }


    //----------------------------------------------------------
    // 🧭 DÉSORIENTATION
    //----------------------------------------------------------

    if (
        joueurAEffetCombat(
            joueur,
            TYPES_EFFETS_ALLSTARS.DESORIENTE
        )
    ) {

        precision *= 0.7;
    }


    return Math.max(
        0,
        precision
    );
}


//==============================================================
// 💨 ESQUIVE EFFECTIVE
//==============================================================

function calculerEsquiveEffectiveCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let esquive =
        capacites.esquive;


    //----------------------------------------------------------
    // ⚡ VITESSE
    //----------------------------------------------------------

    esquive =
        (
            esquive * 0.6
        ) +
        (
            calculerVitesseEffectiveCombat(
                joueur
            ) * 0.25
        ) +
        (
            capacites.reflexes * 0.15
        );


    //----------------------------------------------------------
    // 🦿 JAMBES
    //----------------------------------------------------------

    if (
        joueur.membres?.jambeGauche?.disponible === false
    ) {

        esquive *= 0.65;
    }


    if (
        joueur.membres?.jambeDroite?.disponible === false
    ) {

        esquive *= 0.65;
    }


    //----------------------------------------------------------
    // 🦿 IMMOBILISÉ
    //----------------------------------------------------------

    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.IMMOBILISE
    ) {

        esquive *= 0.1;
    }


    return Math.max(
        0,
        esquive
    );
}


//==============================================================
// 💥 PUISSANCE D'ATTAQUE
//==============================================================

function calculerPuissanceAttaqueCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    const force =
        calculerForceEffectiveCombat(
            joueur
        );


    return Math.max(

        0,

        (
            force * 0.45
        ) +
        (
            capacites.puissance * 0.4
        ) +
        (
            capacites.precision * 0.15
        )
    );
}


//==============================================================
// 🧠 AVANTAGE DE VITESSE
//==============================================================

function calculerAvantageVitesseCombat(
    attaquant,
    defenseur
) {

    if (!attaquant || !defenseur) {
        return 0;
    }


    const vitesseAttaquant =
        calculerVitesseEffectiveCombat(
            attaquant
        );


    const vitesseDefenseur =
        calculerVitesseEffectiveCombat(
            defenseur
        );


    return (
        vitesseAttaquant -
        vitesseDefenseur
    );
}


//==============================================================
// 🧠 AVANTAGE GLOBAL D'ATTAQUE
//==============================================================

function calculerAvantageAttaqueCombat({

    attaquant,

    defenseur,

    action = null

} = {}) {


    if (!attaquant || !defenseur) {
        return 0;
    }


    //----------------------------------------------------------
    // ⚡ VITESSE
    //----------------------------------------------------------

    const avantageVitesse =
        calculerAvantageVitesseCombat(
            attaquant,
            defenseur
        );


    //----------------------------------------------------------
    // 🎯 PRÉCISION
    //----------------------------------------------------------

    const precision =
        calculerPrecisionEffectiveCombat(
            attaquant
        );


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    const esquive =
        calculerEsquiveEffectiveCombat(
            defenseur
        );


    //----------------------------------------------------------
    // 🧠 INTELLIGENCE
    //----------------------------------------------------------

    const capacitesAttaquant =
        calculerCapacitesCombat(
            attaquant
        );


    const capacitesDefenseur =
        calculerCapacitesCombat(
            defenseur
        );


    const intelligence =
        (
            capacitesAttaquant
                .intelligenceCombat
        -
            capacitesDefenseur
                .intelligenceCombat
        );


    //----------------------------------------------------------
    // 📊 SCORE
    //----------------------------------------------------------

    let score = 50;


    score +=
        avantageVitesse * 0.5;


    score +=
        (
            precision -
            esquive
        ) * 0.25;


    score +=
        intelligence * 0.2;


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    const distance =
        calculerDistanceCombat(
            attaquant,
            defenseur
        );


    if (distance <= 1) {

        score += 5;
    }


    //----------------------------------------------------------
    // LIMITATION
    //----------------------------------------------------------

    return Math.max(
        0,
        Math.min(
            100,
            score
        )
    );
}


//==============================================================
// 🎲 TEST DE RÉUSSITE D'UNE ACTION
//==============================================================
// Utilisé uniquement lorsque le moteur doit effectuer un test
// numérique.
//
// L'arbitre peut toujours imposer directement un résultat si
// la situation narrative le justifie.
//==============================================================

function testerReussiteCombat(
    probabilite
) {

    probabilite =
        Math.max(
            0,
            Math.min(
                100,
                Number(probabilite) || 0
            )
        );


    const jet =
        Math.random() * 100;


    return {

        reussi:
            jet < probabilite,

        jet,

        probabilite
    };
}


//==============================================================
// ⚔️ TEST ATTAQUE VS DÉFENSE
//==============================================================

function testerAttaqueContreDefenseCombat({

    attaquant,

    defenseur,

    action = null

} = {}) {


    if (!attaquant || !defenseur) {

        return {

            succes: false,

            raison:
                "Combattant introuvable."
        };
    }


    const avantage =
        calculerAvantageAttaqueCombat({

            attaquant,

            defenseur,

            action
        });


    const test =
        testerReussiteCombat(
            avantage
        );


    return {

        succes: true,

        reussi:
            test.reussi,

        probabilite:
            test.probabilite,

        jet:
            test.jet,

        avantage
    };
}


//==============================================================
// 📊 PROFIL DE COMBAT COMPLET
//==============================================================

function creerProfilCombat(
    joueur
) {

    if (!joueur) {
        return null;
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    return {

        jid:
            joueur.jid,

        pseudo:
            joueur.pseudo,

        capacites,

        vitesseEffective:
            calculerVitesseEffectiveCombat(
                joueur
            ),

        forceEffective:
            calculerForceEffectiveCombat(
                joueur
            ),

        defenseEffective:
            calculerDefenseEffectiveCombat(
                joueur
            ),

        precisionEffective:
            calculerPrecisionEffectiveCombat(
                joueur
            ),

        esquiveEffective:
            calculerEsquiveEffectiveCombat(
                joueur
            ),

        puissanceAttaque:
            calculerPuissanceAttaqueCombat(
                joueur
            ),

        etat:
            joueur.etat,

        stamina:
            joueur.stamina,

        energie:
            joueur.energie
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Moteur des capacités de combat ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — CONFIGURATION OPÉRATIONNELLE DES RÈGLES
//==============================================================
// Ce bloc transforme REGLES_COMBAT_ALLSTARS en paramètres
// directement utilisables par les différents moteurs.
//
// IMPORTANT :
// Il ne remplace PAS REGLES_COMBAT_ALLSTARS.
// Il sert uniquement de couche de lecture.
//
// Toutes les valeurs importantes du combat doivent idéalement
// provenir des règles centrales.
//==============================================================


//==============================================================
// 🔎 LECTURE SÉCURISÉE D'UNE RÈGLE
//==============================================================

function lireRegleCombat(
    chemin,
    valeurDefaut = null
) {

    if (
        !REGLES_COMBAT_ALLSTARS ||
        !chemin
    ) {

        return valeurDefaut;
    }


    const morceaux =
        String(chemin)
            .split(".");


    let valeur =
        REGLES_COMBAT_ALLSTARS;


    for (
        const morceau of morceaux
    ) {

        if (
            valeur === null ||
            valeur === undefined
        ) {

            return valeurDefaut;
        }


        valeur =
            valeur[morceau];
    }


    return (
        valeur === undefined
            ? valeurDefaut
            : valeur
    );
}


//==============================================================
// 🔢 LIRE UNE RÈGLE NUMÉRIQUE
//==============================================================

function lireRegleNumeriqueCombat(
    chemin,
    valeurDefaut = 0
) {

    const valeur =
        lireRegleCombat(
            chemin,
            valeurDefaut
        );


    const nombre =
        Number(valeur);


    if (
        !Number.isFinite(nombre)
    ) {

        return valeurDefaut;
    }


    return nombre;
}


//==============================================================
// 📏 CONFIGURATION DES DISTANCES
//==============================================================

function obtenirReglesDistanceCombat() {

    return {

        contact:
            lireRegleNumeriqueCombat(
                "corpsACorps.distanceContact",
                1
            ),

        corpsACorps:
            lireRegleNumeriqueCombat(
                "corpsACorps.zoneEffetAttaqueFrontale",
                1
            )
    };
}


//==============================================================
// 📏 INFORMATIONS DE DISTANCE CENTRALISÉES
//==============================================================

function obtenirInfosDistanceCombatCentralisees(
    joueurA,
    joueurB
) {

    if (!joueurA || !joueurB) {

        return {

            distance: Infinity,

            contact: false,

            corpsACorps: false,

            horsPorteeCorpsACorps: true
        };
    }


    const distance =
        calculerDistanceCombat(
            joueurA,
            joueurB
        );


    const regles =
        obtenirReglesDistanceCombat();


    return {

        distance,

        contact:
            distance <=
            regles.contact,

        corpsACorps:
            distance <=
            regles.corpsACorps,

        horsPorteeCorpsACorps:
            distance >
            regles.corpsACorps
    };
}


//==============================================================
// 🔋 COÛTS DES ACTIONS
//==============================================================
// On cherche plusieurs noms possibles afin de rester compatible
// avec les différentes versions de REGLES_COMBAT_ALLSTARS.
//==============================================================

function obtenirCoutActionCombat(
    type,
    ressource = "stamina",
    valeurDefaut = 0
) {

    const chemins = [

        `couts.${type}.${ressource}`,

        `actions.${type}.cout${ressource
            .charAt(0)
            .toUpperCase() +
            ressource.slice(1)}`,

        `actions.${type}.${ressource}`,

        `${type}.cout${ressource
            .charAt(0)
            .toUpperCase() +
            ressource.slice(1)}`,

        `${type}.${ressource}`
    ];


    for (
        const chemin of chemins
    ) {

        const valeur =
            lireRegleCombat(
                chemin,
                undefined
            );


        if (
            valeur !== undefined &&
            valeur !== null
        ) {

            const nombre =
                Number(valeur);


            if (
                Number.isFinite(nombre)
            ) {

                return Math.max(
                    0,
                    nombre
                );
            }
        }
    }


    return valeurDefaut;
}


//==============================================================
// ⚔️ PORTÉE D'UNE ACTION
//==============================================================

function obtenirPorteeActionCombat(
    type,
    valeurDefaut = null
) {

    const chemins = [

        `portees.${type}`,

        `portee.${type}`,

        `actions.${type}.portee`,

        `${type}.portee`
    ];


    for (
        const chemin of chemins
    ) {

        const valeur =
            lireRegleCombat(
                chemin,
                undefined
            );


        if (
            valeur !== undefined &&
            valeur !== null
        ) {

            const nombre =
                Number(valeur);


            if (
                Number.isFinite(nombre)
            ) {

                return Math.max(
                    0,
                    nombre
                );
            }
        }
    }


    return valeurDefaut;
}


//==============================================================
// 💥 DÉGÂTS DE BASE D'UNE ACTION
//==============================================================

function obtenirDegatsBaseActionCombat(
    type,
    valeurDefaut = 10
) {

    const chemins = [

        `degats.${type}`,

        `degatsBase.${type}`,

        `actions.${type}.degats`,

        `${type}.degats`
    ];


    for (
        const chemin of chemins
    ) {

        const valeur =
            lireRegleCombat(
                chemin,
                undefined
            );


        if (
            valeur !== undefined &&
            valeur !== null
        ) {

            const nombre =
                Number(valeur);


            if (
                Number.isFinite(nombre)
            ) {

                return Math.max(
                    0,
                    nombre
                );
            }
        }
    }


    return valeurDefaut;
}


//==============================================================
// 🧠 CONDITIONS D'ACTION
//==============================================================

function obtenirConditionsActionCombat(
    type
) {

    const chemins = [

        `conditions.${type}`,

        `actions.${type}.conditions`,

        `${type}.conditions`
    ];


    for (
        const chemin of chemins
    ) {

        const valeur =
            lireRegleCombat(
                chemin,
                undefined
            );


        if (
            valeur !== undefined &&
            valeur !== null
        ) {

            return valeur;
        }
    }


    return {};
}


//==============================================================
// ⚔️ PROFIL D'UNE ACTION
//==============================================================

function creerProfilActionCombat({

    type,

    coutStamina = null,

    coutEnergie = null,

    portee = null,

    degatsBase = null

} = {}) {


    if (!type) {
        return null;
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const stamina =
        coutStamina !== null
            ? Number(coutStamina)
            : obtenirCoutActionCombat(
                type,
                "stamina",
                0
            );


    //----------------------------------------------------------
    // ⚡ ÉNERGIE
    //----------------------------------------------------------

    const energie =
        coutEnergie !== null
            ? Number(coutEnergie)
            : obtenirCoutActionCombat(
                type,
                "energie",
                0
            );


    //----------------------------------------------------------
    // 📏 PORTÉE
    //----------------------------------------------------------

    const porteeFinale =
        portee !== null
            ? Number(portee)
            : obtenirPorteeActionCombat(
                type,
                null
            );


    //----------------------------------------------------------
    // 💥 DÉGÂTS
    //----------------------------------------------------------

    const degats =
        degatsBase !== null
            ? Number(degatsBase)
            : obtenirDegatsBaseActionCombat(
                type,
                10
            );


    //----------------------------------------------------------
    // 📋 CONDITIONS
    //----------------------------------------------------------

    const conditions =
        obtenirConditionsActionCombat(
            type
        );


    return {

        type,

        coutStamina:
            Number.isFinite(stamina)
                ? Math.max(0, stamina)
                : 0,

        coutEnergie:
            Number.isFinite(energie)
                ? Math.max(0, energie)
                : 0,

        portee:
            Number.isFinite(porteeFinale)
                ? Math.max(0, porteeFinale)
                : null,

        degatsBase:
            Number.isFinite(degats)
                ? Math.max(0, degats)
                : 10,

        conditions
    };
}


//==============================================================
// 🧠 VÉRIFICATION DES CONDITIONS
//==============================================================

function verifierConditionsActionCombat({

    joueur,

    cible = null,

    profil

} = {}) {


    if (!joueur) {

        return {

            valide: false,

            raisons: [
                "Joueur introuvable."
            ]
        };
    }


    const raisons = [];


    //----------------------------------------------------------
    // ☠️ ÉTAT
    //----------------------------------------------------------

    const peutAgir =
        joueurPeutAgirCombat(
            joueur
        );


    if (!peutAgir.succes) {

        raisons.push(
            peutAgir.raison
        );
    }


    //----------------------------------------------------------
    // 🎯 CIBLE
    //----------------------------------------------------------

    if (
        cible &&
        cible.etat ===
            ETATS_COMBAT_ALLSTARS.MORT
    ) {

        raisons.push(
            "La cible est morte."
        );
    }


    //----------------------------------------------------------
    // 📏 PORTÉE
    //----------------------------------------------------------

    if (
        cible &&
        profil &&
        profil.portee !== null
    ) {

        const distance =
            calculerDistanceCombat(
                joueur,
                cible
            );


        if (
            distance >
            profil.portee
        ) {

            raisons.push(
                "Cible hors de portée."
            );
        }
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    if (profil) {

        const stamina =
            Number(
                joueur.stamina ?? 0
            );


        if (
            stamina <
            profil.coutStamina
        ) {

            raisons.push(
                "Stamina insuffisante."
            );
        }


        //------------------------------------------------------
        // ⚡ ÉNERGIE
        //------------------------------------------------------

        const energie =
            Number(
                joueur.energie ?? 0
            );


        if (
            energie <
            profil.coutEnergie
        ) {

            raisons.push(
                "Énergie insuffisante."
            );
        }
    }


    return {

        valide:
            raisons.length === 0,

        raisons
    };
}


//==============================================================
// ⚔️ PRÉPARER UNE ACTION AVEC LES RÈGLES CENTRALES
//==============================================================

function preparerActionSelonReglesCombat({

    combat,

    jid,

    cibleJid = null,

    type,

    membre = null,

    technique = null,

    coutStamina = null,

    coutEnergie = null,

    portee = null,

    degatsBase = null

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    const cible =
        cibleJid
            ? obtenirJoueurCombat(
                combat,
                cibleJid
            )
            : null;


    //----------------------------------------------------------
    // 📋 PROFIL
    //----------------------------------------------------------

    const profil =
        creerProfilActionCombat({

            type,

            coutStamina,

            coutEnergie,

            portee,

            degatsBase
        });


    if (!profil) {

        return {

            succes: false,

            raison:
                "Type d'action invalide."
        };
    }


    //----------------------------------------------------------
    // 🧠 CONDITIONS
    //----------------------------------------------------------

    const conditions =
        verifierConditionsActionCombat({

            joueur,

            cible,

            profil
        });


    if (!conditions.valide) {

        return {

            succes: false,

            raison:
                conditions.raisons.join(
                    " "
                ),

            conditions:
                conditions.raisons
        };
    }


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        const resultat =
            preparerAttaqueCombat({

                combat,

                jid,

                cibleJid,

                type:
                    "attaque",

                coutStamina:
                    profil.coutStamina,

                coutEnergie:
                    profil.coutEnergie,

                technique
            });


        if (
            resultat.succes &&
            resultat.action
        ) {

            resultat.action.membre =
                membre;

            resultat.action.portee =
                profil.portee;

            resultat.action.degatsBase =
                profil.degatsBase;

            resultat.action.conditions =
                profil.conditions;
        }


        return resultat;
    }


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        return executerDefenseCombat({

            combat,

            jid,

            type:
                profil.conditions?.type ??
                "blocage"
        });
    }


    //----------------------------------------------------------
    // ⏳ ATTENTE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.ATTENTE
    ) {

        return executerAttenteCombat({

            combat,

            jid
        });
    }


    return {

        succes: false,

        raison:
            `Action non supportée : ${type}`
    };
}


//==============================================================
// 📊 APERÇU DES RÈGLES ACTUELLES
//==============================================================

function creerResumeReglesCombat() {

    return {

        corpsACorps:
            obtenirReglesDistanceCombat(),

        attaques: {

            coutStamina:
                obtenirCoutActionCombat(
                    "attaque",
                    "stamina",
                    0
                ),

            coutEnergie:
                obtenirCoutActionCombat(
                    "attaque",
                    "energie",
                    0
                ),

            portee:
                obtenirPorteeActionCombat(
                    "attaque",
                    null
                ),

            degatsBase:
                obtenirDegatsBaseActionCombat(
                    "attaque",
                    10
                )
        },

        defense: {

            coutStamina:
                obtenirCoutActionCombat(
                    "defense",
                    "stamina",
                    0
                ),

            coutEnergie:
                obtenirCoutActionCombat(
                    "defense",
                    "energie",
                    0
                )
        }
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Configuration opérationnelle des règles ALL STARS chargée."
);

//==============================================================
// ⚔️ ALL STARS — ARBITRE DE COMBAT
//==============================================================
// L'arbitre est le cerveau décisionnel du moteur.
//
// Il reçoit :
// - l'état réel du combat
// - le joueur qui agit
// - l'action interprétée
// - la cible éventuelle
//
// Il analyse :
// - état physique
// - distance
// - ressources
// - portée
// - capacités
// - position
// - actions adverses
// - cohérence de l'action
//
// Il produit ensuite une DÉCISION STRUCTURÉE.
//
// IMPORTANT :
// L'arbitre ne modifie pas directement le combat.
// Il décide.
// Le moteur d'exécution applique ensuite la décision.
//==============================================================


//==============================================================
// 🧠 TYPES DE DÉCISIONS
//==============================================================

const DECISIONS_ARBITRE_ALLSTARS = {

    ACCEPTER: "accepter",

    REFUSER: "refuser",

    MODIFIER: "modifier",

    ATTENDRE: "attendre"
};


//==============================================================
// 🎯 CRÉER UNE DÉCISION
//==============================================================

function creerDecisionArbitreCombat({

    decision =
        DECISIONS_ARBITRE_ALLSTARS.ACCEPTER,

    raison = "",

    action = null,

    jid = null,

    cibleJid = null,

    details = {}

} = {}) {

    return {

        decision,

        raison,

        action,

        jid,

        cibleJid,

        details,

        temps:
            Date.now()
    };
}


//==============================================================
// 🔎 ANALYSE DE LA SITUATION DU JOUEUR
//==============================================================

function analyserSituationJoueurCombat({

    combat,

    jid,

    cibleJid = null

} = {}) {


    if (!combat) {

        return {

            valide: false,

            raison:
                "Combat introuvable."
        };
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {

        return {

            valide: false,

            raison:
                "Joueur introuvable."
        };
    }


    const cible =
        cibleJid
            ? obtenirJoueurCombat(
                combat,
                cibleJid
            )
            : null;


    //----------------------------------------------------------
    // 📊 PROFIL
    //----------------------------------------------------------

    const profil =
        creerProfilCombat(
            joueur
        );


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    let distance = null;


    if (cible) {

        distance =
            calculerDistanceCombat(
                joueur,
                cible
            );
    }


    //----------------------------------------------------------
    // 🎯 ACTION ADVERSE
    //----------------------------------------------------------

    let actionAdverse = null;


    if (cible) {

        actionAdverse =
            obtenirActionActiveCombat(
                combat,
                cible.jid
            );
    }


    //----------------------------------------------------------
    // 📊 ANALYSE
    //----------------------------------------------------------

    return {

        valide: true,

        joueur: {

            jid:
                joueur.jid,

            pseudo:
                joueur.pseudo,

            personnage:
                joueur.personnage,

            etat:
                joueur.etat,

            pv:
                joueur.pv,

            pvMax:
                joueur.pvMax,

            stamina:
                joueur.stamina,

            energie:
                joueur.energie
        },

        profil,

        cible: cible
            ? {

                jid:
                    cible.jid,

                pseudo:
                    cible.pseudo,

                personnage:
                    cible.personnage,

                etat:
                    cible.etat,

                pv:
                    cible.pv,

                pvMax:
                    cible.pvMax,

                stamina:
                    cible.stamina,

                energie:
                    cible.energie
            }
            : null,

        distance,

        actionAdverse
    };
}


//==============================================================
// 🧠 ANALYSER UNE ACTION
//==============================================================

function analyserActionArbitreCombat({

    combat,

    jid,

    action

} = {}) {


    if (!combat) {

        return {

            valide: false,

            raison:
                "Combat introuvable."
        };
    }


    if (!action) {

        return {

            valide: false,

            raison:
                "Action inexistante."
        };
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {

        return {

            valide: false,

            raison:
                "Joueur introuvable."
        };
    }


    //----------------------------------------------------------
    // 🎮 TYPE
    //----------------------------------------------------------

    const type =
        action.type;


    const typesAutorises =
        Object.values(
            ACTIONS_COMBAT_ALLSTARS
        );


    if (
        !typesAutorises.includes(
            type
        )
    ) {

        return {

            valide: false,

            raison:
                `Action inconnue : ${type}`
        };
    }


    //----------------------------------------------------------
    // 👤 PEUT AGIR ?
    //----------------------------------------------------------

    const peutAgir =
        joueurPeutAgirCombat(
            joueur
        );


    if (!peutAgir.succes) {

        return {

            valide: false,

            raison:
                peutAgir.raison
        };
    }


    //----------------------------------------------------------
    // 🎯 CIBLE
    //----------------------------------------------------------

    let cible = null;


    if (action.cibleJid) {

        cible =
            obtenirJoueurCombat(
                combat,
                action.cibleJid
            );


        if (!cible) {

            return {

                valide: false,

                raison:
                    "Cible introuvable."
            };
        }
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    let distance = null;


    if (cible) {

        distance =
            calculerDistanceCombat(
                joueur,
                cible
            );
    }


    //----------------------------------------------------------
    // 📋 PROFIL ACTION
    //----------------------------------------------------------

    const profil =
        creerProfilActionCombat({

            type,

            portee:
                action.portee ??
                null,

            coutStamina:
                action.coutStamina ??
                null,

            coutEnergie:
                action.coutEnergie ??
                null,

            degatsBase:
                action.degatsBase ??
                null
        });


    //----------------------------------------------------------
    // 🔎 CONDITIONS
    //----------------------------------------------------------

    const conditions =
        verifierConditionsActionCombat({

            joueur,

            cible,

            profil
        });


    return {

        valide:
            conditions.valide,

        raison:
            conditions.valide
                ? null
                : conditions.raisons.join(
                    " "
                ),

        type,

        joueur,

        cible,

        distance,

        profil,

        conditions
    };
}


//==============================================================
// 🚨 DÉTECTION D'ACTIONS IMPOSSIBLES
//==============================================================

function detecterActionImpossibleCombat({

    combat,

    jid,

    action

} = {}) {


    const analyse =
        analyserActionArbitreCombat({

            combat,

            jid,

            action
        });


    if (
        !analyse.valide
    ) {

        return {

            impossible: true,

            raison:
                analyse.raison,

            analyse
        };
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    if (
        analyse.cible &&
        analyse.profil?.portee !== null &&
        analyse.profil?.portee !== undefined
    ) {

        if (
            analyse.distance >
            analyse.profil.portee
        ) {

            return {

                impossible: true,

                raison:
                    "La cible est hors de portée.",

                analyse
            };
        }
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    if (analyse.profil) {

        if (
            Number(
                analyse.joueur.stamina
            ) <
            Number(
                analyse.profil.coutStamina
            )
        ) {

            return {

                impossible: true,

                raison:
                    "Stamina insuffisante.",

                analyse
            };
        }


        //------------------------------------------------------
        // ⚡ ÉNERGIE
        //------------------------------------------------------

        if (
            Number(
                analyse.joueur.energie
            ) <
            Number(
                analyse.profil.coutEnergie
            )
        ) {

            return {

                impossible: true,

                raison:
                    "Énergie insuffisante.",

                analyse
            };
        }
    }


    return {

        impossible: false,

        analyse
    };
}


//==============================================================
// 🧠 ÉVALUATION DU RAPPORT DE FORCE
//==============================================================

function evaluerRapportCombat({

    attaquant,

    defenseur

} = {}) {


    if (!attaquant || !defenseur) {

        return {

            valide: false
        };
    }


    const profilA =
        creerProfilCombat(
            attaquant
        );


    const profilD =
        creerProfilCombat(
            defenseur
        );


    //----------------------------------------------------------
    // ⚡ VITESSE
    //----------------------------------------------------------

    const vitesseA =
        profilA.vitesseEffective;


    const vitesseD =
        profilD.vitesseEffective;


    //----------------------------------------------------------
    // 💪 PUISSANCE
    //----------------------------------------------------------

    const puissanceA =
        profilA.puissanceAttaque;


    const puissanceD =
        profilD.puissanceAttaque;


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    const defenseA =
        profilA.defenseEffective;


    const defenseD =
        profilD.defenseEffective;


    //----------------------------------------------------------
    // 🧠 SCORE GLOBAL
    //----------------------------------------------------------

    const scoreA =
        (
            vitesseA * 0.30
        ) +
        (
            puissanceA * 0.35
        ) +
        (
            defenseA * 0.20
        ) +
        (
            profilA.capacites
                .intelligenceCombat * 0.15
        );


    const scoreD =
        (
            vitesseD * 0.30
        ) +
        (
            puissanceD * 0.35
        ) +
        (
            defenseD * 0.20
        ) +
        (
            profilD.capacites
                .intelligenceCombat * 0.15
        );


    //----------------------------------------------------------
    // 📊 AVANTAGE
    //----------------------------------------------------------

    let avantage = 0;


    if (
        scoreA +
        scoreD >
        0
    ) {

        avantage =
            (
                scoreA -
                scoreD
            ) /
            (
                scoreA +
                scoreD
            );
    }


    return {

        valide: true,

        attaquant: {

            score:
                scoreA,

            profil:
                profilA
        },

        defenseur: {

            score:
                scoreD,

            profil:
                profilD
        },

        avantage
    };
}


//==============================================================
// 🧠 CHOISIR LE TYPE DE RÉSOLUTION
//==============================================================
// Cette fonction ne lance PAS encore le résultat.
// Elle indique simplement au moteur comment l'action doit être
// traitée.
//==============================================================

function determinerModeResolutionCombat({

    action,

    cible

} = {}) {


    if (!action) {

        return "impossible";
    }


    switch (
        action.type
    ) {

        case ACTIONS_COMBAT_ALLSTARS.ATTAQUE:

            return "attaque";


        case ACTIONS_COMBAT_ALLSTARS.DEFENSE:

            return "defense";


        case ACTIONS_COMBAT_ALLSTARS.ESQUIVE:

            return "esquive";


        case ACTIONS_COMBAT_ALLSTARS.SAISIE:

            return "saisie";


        case ACTIONS_COMBAT_ALLSTARS.CONTRE:

            return "contre";


        case ACTIONS_COMBAT_ALLSTARS.TECHNIQUE:

            return "technique";


        case ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT:

            return "deplacement";


        case ACTIONS_COMBAT_ALLSTARS.RECUPERATION:

            return "recuperation";


        case ACTIONS_COMBAT_ALLSTARS.ATTENTE:

            return "attente";


        default:

            return "impossible";
    }
}


//==============================================================
// ⚔️ ARBITRER UNE ACTION
//==============================================================

function arbitrerActionCombat({

    combat,

    jid,

    action

} = {}) {


    //----------------------------------------------------------
    // 🔎 ANALYSE
    //----------------------------------------------------------

    const analyse =
        analyserActionArbitreCombat({

            combat,

            jid,

            action
        });


    //----------------------------------------------------------
    // ❌ ACTION INVALIDE
    //----------------------------------------------------------

    if (!analyse.valide) {

        const decision =
            creerDecisionArbitreCombat({

                decision:
                    DECISIONS_ARBITRE_ALLSTARS.REFUSER,

                raison:
                    analyse.raison,

                action,

                jid,

                cibleJid:
                    action?.cibleJid ??
                    null,

                details: {

                    analyse
                }
            });


        combat.derniereDecisionArbitre =
            decision;


        return decision;
    }


    //----------------------------------------------------------
    // 🧠 MODE
    //----------------------------------------------------------

    const mode =
        determinerModeResolutionCombat({

            action,

            cible:
                analyse.cible
        });


    //----------------------------------------------------------
    // 📊 RAPPORT DE FORCE
    //----------------------------------------------------------

    let rapport = null;


    if (analyse.cible) {

        rapport =
            evaluerRapportCombat({

                attaquant:
                    analyse.joueur,

                defenseur:
                    analyse.cible
            });
    }


    //----------------------------------------------------------
    // 📋 DÉCISION
    //----------------------------------------------------------

    const decision =
        creerDecisionArbitreCombat({

            decision:
                DECISIONS_ARBITRE_ALLSTARS.ACCEPTER,

            raison:
                "Action valide.",

            action: {

                ...action,

                modeResolution:
                    mode
            },

            jid,

            cibleJid:
                action.cibleJid ??
                null,

            details: {

                analyse,

                rapport
            }
        });


    combat.derniereDecisionArbitre =
        decision;


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "decision_arbitre",

        decision:
            decision.decision,

        raison:
            decision.raison,

        jid,

        cibleJid:
            action.cibleJid ??
            null,

        modeResolution:
            mode,

        temps:
            combat.temps,

        sequence:
            ++combat.sequence
    });


    return decision;
}


//==============================================================
// ⚔️ ARBITRER ET EXÉCUTER
//==============================================================
// Cette fonction fait le pont entre le cerveau décisionnel
// et le moteur physique.
//
// L'arbitre décide.
// L'exécuteur applique.
//==============================================================

function arbitrerEtExecuterActionCombat({

    combat,

    jid,

    action

} = {}) {


    const decision =
        arbitrerActionCombat({

            combat,

            jid,

            action
        });


    //----------------------------------------------------------
    // ❌ REFUS
    //----------------------------------------------------------

    if (
        decision.decision ===
        DECISIONS_ARBITRE_ALLSTARS.REFUSER
    ) {

        return {

            succes: false,

            decision
        };
    }


    const actionFinale =
        decision.action;


    //----------------------------------------------------------
    // ⚔️ EXÉCUTION
    //----------------------------------------------------------

    let resultat = null;


    switch (
        actionFinale.type
    ) {

        //------------------------------------------------------
        // 🏃 DÉPLACEMENT
        //------------------------------------------------------

        case ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT:

            resultat =
                executerDeplacementCombat({

                    combat,

                    jid,

                    destination:
                        actionFinale.destination,

                    coutStamina:
                        actionFinale.coutStamina ??
                        0
                });

            break;


        //------------------------------------------------------
        // 🛡️ DÉFENSE
        //------------------------------------------------------

        case ACTIONS_COMBAT_ALLSTARS.DEFENSE:

            resultat =
                executerDefenseCombat({

                    combat,

                    jid,

                    type:
                        actionFinale.sousType ??
                        "blocage"
                });

            break;


        //------------------------------------------------------
        // ⚔️ ATTAQUE
        //------------------------------------------------------

        case ACTIONS_COMBAT_ALLSTARS.ATTAQUE:

            resultat =
                preparerAttaqueCombat({

                    combat,

                    jid,

                    cibleJid:
                        actionFinale.cibleJid,

                    type:
                        actionFinale.sousType ??
                        "attaque",

                    coutStamina:
                        actionFinale.coutStamina ??
                        0,

                    coutEnergie:
                        actionFinale.coutEnergie ??
                        0,

                    technique:
                        actionFinale.technique ??
                        null
                });

            break;


        //------------------------------------------------------
        // ⏳ ATTENTE
        //------------------------------------------------------

        case ACTIONS_COMBAT_ALLSTARS.ATTENTE:

            resultat =
                executerAttenteCombat({

                    combat,

                    jid
                });

            break;


        //------------------------------------------------------
        // ❌ NON SUPPORTÉ
        //------------------------------------------------------

        default:

            resultat = {

                succes: false,

                raison:
                    `Exécution non supportée : ${actionFinale.type}`
            };
    }


    //----------------------------------------------------------
    // 📊 RETOUR
    //----------------------------------------------------------

    return {

        succes:
            resultat?.succes === true,

        decision,

        resultat
    };
}


//==============================================================
// 🧠 ARBITRER + EXÉCUTER + RÉSOUDRE
//==============================================================
// Fonction principale du moteur.
//
// Flux :
//
// ACTION
//   ↓
// ARBITRE
//   ↓
// EXÉCUTION
//   ↓
// RÉSOLUTION
//   ↓
// ÉTAT FINAL
//==============================================================

function traiterActionCombatAllStars({

    combat,

    jid,

    action,

    resoudre = true

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    if (!action) {

        return {

            succes: false,

            raison:
                "Action inexistante."
        };
    }


    //----------------------------------------------------------
    // 🧠 ARBITRE + EXÉCUTION
    //----------------------------------------------------------

    const execution =
        arbitrerEtExecuterActionCombat({

            combat,

            jid,

            action
        });


    //----------------------------------------------------------
    // ❌ ÉCHEC
    //----------------------------------------------------------

    if (!execution.succes) {

        return execution;
    }


    //----------------------------------------------------------
    // ⚔️ RÉSOLUTION
    //----------------------------------------------------------

    let resolution = null;


    if (resoudre) {

        resolution =
            resoudreActionsCombat(
                combat
            );
    }


    //----------------------------------------------------------
    // 🔄 ÉTATS
    //----------------------------------------------------------

    actualiserEtatCombatAllStars(
        combat
    );


    //----------------------------------------------------------
    // 📸 SNAPSHOT
    //----------------------------------------------------------

    const snapshot =
        creerSnapshotCombat(
            combat
        );


    return {

        succes: true,

        decision:
            execution.decision,

        execution:
            execution.resultat,

        resolution,

        snapshot
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Arbitre ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — ROUTEUR D'ACTIONS
//==============================================================
// Le routeur est le point d'entrée unique des actions.
//
// Il reçoit une action interprétée et :
//
// 1. vérifie sa structure
// 2. normalise les noms
// 3. récupère le joueur et la cible
// 4. construit une action standardisée
// 5. transmet l'action à l'arbitre
//
// IMPORTANT :
// Le routeur ne décide jamais si une action réussit.
// Il prépare et transmet.
//==============================================================


//==============================================================
// 🎮 TYPES D'ACTIONS ALL STARS
//==============================================================

const ACTIONS_COMBAT_ALLSTARS = {

    ATTAQUE: "attaque",

    DEFENSE: "defense",

    ESQUIVE: "esquive",

    SAISIE: "saisie",

    CONTRE: "contre",

    TECHNIQUE: "technique",

    DEPLACEMENT: "deplacement",

    RECUPERATION: "recuperation",

    ATTENTE: "attente"
};


//==============================================================
// 🔄 ALIAS DES ACTIONS
//==============================================================

const ALIAS_ACTIONS_COMBAT_ALLSTARS = {

    attaque: "attaque",
    attaquer: "attaque",
    frappe: "attaque",
    frapper: "attaque",
    coup: "attaque",

    defense: "defense",
    défendre: "defense",
    defendre: "defense",
    blocage: "defense",
    bloquer: "defense",

    esquive: "esquive",
    esquiver: "esquive",

    saisie: "saisie",
    saisir: "saisie",
    attraper: "saisie",
    attrape: "saisie",

    contre: "contre",
    contrer: "contre",

    technique: "technique",

    deplacement: "deplacement",
    déplacement: "deplacement",
    bouger: "deplacement",
    avancer: "deplacement",
    reculer: "deplacement",

    recuperation: "recuperation",
    récupération: "recuperation",
    repos: "recuperation",

    attente: "attente",
    attendre: "attente"
};


//==============================================================
// 🧹 NORMALISATION DU TYPE
//==============================================================

function normaliserTypeActionCombat(
    type
) {

    if (!type) {
        return null;
    }


    const propre =
        String(type)
            .trim()
            .toLowerCase();


    return (
        ALIAS_ACTIONS_COMBAT_ALLSTARS[
            propre
        ] ??
        null
    );
}


//==============================================================
// 🧹 NORMALISATION D'UNE CIBLE
//==============================================================

function normaliserCibleActionCombat(
    action = {}
) {

    return (
        action.cibleJid ??
        action.targetJid ??
        action.cible ??
        action.target ??
        null
    );
}


//==============================================================
// 🧹 NORMALISATION D'UNE DESTINATION
//==============================================================

function normaliserDestinationActionCombat(
    action = {}
) {

    const destination =
        action.destination ??
        action.position ??
        null;


    if (!destination) {
        return null;
    }


    return {

        x:
            Number(
                destination.x ?? 0
            ),

        y:
            Number(
                destination.y ?? 0
            ),

        z:
            Number(
                destination.z ?? 0
            )
    };
}


//==============================================================
// 🧹 NORMALISATION D'UNE ACTION
//==============================================================

function normaliserActionCombat(
    action = {}
) {

    if (
        !action ||
        typeof action !== "object"
    ) {

        return {

            valide: false,

            raison:
                "Action invalide."
        };
    }


    const type =
        normaliserTypeActionCombat(
            action.type ??
            action.action ??
            action.intent
        );


    if (!type) {

        return {

            valide: false,

            raison:
                "Type d'action inconnu."
        };
    }


    const cibleJid =
        normaliserCibleActionCombat(
            action
        );


    const destination =
        normaliserDestinationActionCombat(
            action
        );


    return {

        valide: true,

        action: {

            type,

            sousType:
                action.sousType ??
                action.subType ??
                null,

            cibleJid,

            destination,

            technique:
                action.technique ??
                null,

            membre:
                action.membre ??
                action.partieCorps ??
                null,

            direction:
                action.direction ??
                null,

            distance:
                action.distance ??
                null,

            intensite:
                action.intensite ??
                null,

            duree:
                action.duree ??
                null,

            description:
                action.description ??
                null,

            coutStamina:
                action.coutStamina ??
                null,

            coutEnergie:
                action.coutEnergie ??
                null,

            portee:
                action.portee ??
                null,

            degatsBase:
                action.degatsBase ??
                null,

            metadata:
                action.metadata ??
                {}
        }
    };
}


//==============================================================
// 🔎 VALIDATION STRUCTURELLE
//==============================================================

function validerStructureActionCombat(
    action
) {

    if (!action) {

        return {

            valide: false,

            raisons: [
                "Action inexistante."
            ]
        };
    }


    const raisons = [];


    //----------------------------------------------------------
    // TYPE
    //----------------------------------------------------------

    if (!action.type) {

        raisons.push(
            "Type d'action manquant."
        );
    }


    //----------------------------------------------------------
    // CIBLE
    //----------------------------------------------------------

    const actionsAvecCible = [

        ACTIONS_COMBAT_ALLSTARS.ATTAQUE,

        ACTIONS_COMBAT_ALLSTARS.SAISIE,

        ACTIONS_COMBAT_ALLSTARS.CONTRE,

        ACTIONS_COMBAT_ALLSTARS.TECHNIQUE
    ];


    if (
        actionsAvecCible.includes(
            action.type
        ) &&
        !action.cibleJid
    ) {

        raisons.push(
            "Cible manquante."
        );
    }


    //----------------------------------------------------------
    // DESTINATION
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT
    ) {

        if (
            !action.destination
        ) {

            raisons.push(
                "Destination manquante."
            );
        }
    }


    return {

        valide:
            raisons.length === 0,

        raisons
    };
}


//==============================================================
// 👤 VÉRIFIER LE JOUEUR
//==============================================================

function verifierJoueurRouteurCombat({

    combat,

    jid

} = {}) {


    if (!combat) {

        return {

            valide: false,

            raison:
                "Combat introuvable."
        };
    }


    if (!jid) {

        return {

            valide: false,

            raison:
                "JID du joueur manquant."
        };
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {

        return {

            valide: false,

            raison:
                "Joueur introuvable dans le combat."
        };
    }


    return {

        valide: true,

        joueur
    };
}


//==============================================================
// 🎯 VÉRIFIER LA CIBLE
//==============================================================

function verifierCibleRouteurCombat({

    combat,

    action

} = {}) {


    const actionsAvecCible = [

        ACTIONS_COMBAT_ALLSTARS.ATTAQUE,

        ACTIONS_COMBAT_ALLSTARS.SAISIE,

        ACTIONS_COMBAT_ALLSTARS.CONTRE,

        ACTIONS_COMBAT_ALLSTARS.TECHNIQUE
    ];


    if (
        !actionsAvecCible.includes(
            action.type
        )
    ) {

        return {

            valide: true,

            cible: null
        };
    }


    if (!action.cibleJid) {

        return {

            valide: false,

            raison:
                "Cette action nécessite une cible."
        };
    }


    const cible =
        obtenirJoueurCombat(
            combat,
            action.cibleJid
        );


    if (!cible) {

        return {

            valide: false,

            raison:
                "Cible introuvable."
        };
    }


    return {

        valide: true,

        cible
    };
}


//==============================================================
// 🚦 PRÉPARER UNE ACTION POUR L'ARBITRE
//==============================================================

function preparerActionRouteurCombat({

    combat,

    jid,

    action

} = {}) {


    //----------------------------------------------------------
    // 🧹 NORMALISATION
    //----------------------------------------------------------

    const normalisation =
        normaliserActionCombat(
            action
        );


    if (!normalisation.valide) {

        return {

            succes: false,

            raison:
                normalisation.raison
        };
    }


    const actionFinale =
        normalisation.action;


    //----------------------------------------------------------
    // 👤 JOUEUR
    //----------------------------------------------------------

    const joueur =
        verifierJoueurRouteurCombat({

            combat,

            jid
        });


    if (!joueur.valide) {

        return {

            succes: false,

            raison:
                joueur.raison
        };
    }


    //----------------------------------------------------------
    // 🎯 CIBLE
    //----------------------------------------------------------

    const cible =
        verifierCibleRouteurCombat({

            combat,

            action:
                actionFinale
        });


    if (!cible.valide) {

        return {

            succes: false,

            raison:
                cible.raison
        };
    }


    //----------------------------------------------------------
    // 📋 VALIDATION
    //----------------------------------------------------------

    const validation =
        validerStructureActionCombat(
            actionFinale
        );


    if (!validation.valide) {

        return {

            succes: false,

            raison:
                validation.raisons.join(
                    " "
                )
        };
    }


    //----------------------------------------------------------
    // 📦 ACTION FINALE
    //----------------------------------------------------------

    actionFinale.metadata = {

        ...actionFinale.metadata,

        routeur: {

            date:
                Date.now(),

            joueurJid:
                jid,

            cibleJid:
                actionFinale.cibleJid
        }
    };


    return {

        succes: true,

        joueur:
            joueur.joueur,

        cible:
            cible.cible,

        action:
            actionFinale
    };
}


//==============================================================
// ⚔️ ENVOYER UNE ACTION À L'ARBITRE
//==============================================================

function routerActionCombatAllStars({

    combat,

    jid,

    action

} = {}) {


    //----------------------------------------------------------
    // 📦 PRÉPARATION
    //----------------------------------------------------------

    const preparation =
        preparerActionRouteurCombat({

            combat,

            jid,

            action
        });


    //----------------------------------------------------------
    // ❌ ERREUR
    //----------------------------------------------------------

    if (!preparation.succes) {

        return {

            succes: false,

            raison:
                preparation.raison
        };
    }


    //----------------------------------------------------------
    // 🧠 ARBITRE
    //----------------------------------------------------------

    const decision =
        arbitrerActionCombat({

            combat,

            jid,

            action:
                preparation.action
        });


    //----------------------------------------------------------
    // 📊 RETOUR
    //----------------------------------------------------------

    return {

        succes:
            decision.decision !==
            DECISIONS_ARBITRE_ALLSTARS.REFUSER,

        action:
            preparation.action,

        decision
    };
}


//==============================================================
// ⚔️ ROUTER + EXÉCUTER
//==============================================================

function routerExecuterActionCombat({

    combat,

    jid,

    action

} = {}) {


    //----------------------------------------------------------
    // 📦 PRÉPARATION
    //----------------------------------------------------------

    const preparation =
        preparerActionRouteurCombat({

            combat,

            jid,

            action
        });


    if (!preparation.succes) {

        return {

            succes: false,

            raison:
                preparation.raison
        };
    }


    //----------------------------------------------------------
    // ⚔️ EXÉCUTION
    //----------------------------------------------------------

    return traiterActionCombatAllStars({

        combat,

        jid,

        action:
            preparation.action
    });
}


//==============================================================
// 🧠 ROUTER UNE ACTION DÉCRITE EN TEXTE
//==============================================================
// Cette fonction n'interprète PAS encore le langage naturel.
//
// Elle sert seulement de point d'entrée.
//
// L'interpréteur IA sera branché ici plus tard.
//
// Exemple :
//
// "Je frappe son visage"
//        ↓
// interpreterActionAllStars()
//        ↓
// { type:"attaque", cibleJid:"..." }
//        ↓
// routerExecuterActionCombat()
//==============================================================

async function routerTexteCombatAllStars({

    combat,

    jid,

    texte,

    contexte = {}

} = {}) {


    if (
        !texte ||
        typeof texte !== "string"
    ) {

        return {

            succes: false,

            raison:
                "Texte d'action invalide."
        };
    }


    //----------------------------------------------------------
    // 🧠 INTERPRÉTEUR
    //----------------------------------------------------------

    if (
        typeof interpreterActionAllStars !==
        "function"
    ) {

        return {

            succes: false,

            raison:
                "Interpréteur ALL STARS non chargé."
        };
    }


    //----------------------------------------------------------
    // 🤖 INTERPRÉTATION
    //----------------------------------------------------------

    const actionInterpretee =
        await interpreterActionAllStars({

            combat,

            jid,

            texte,

            contexte
        });


    //----------------------------------------------------------
    // ⚔️ ROUTEUR
    //----------------------------------------------------------

    return routerExecuterActionCombat({

        combat,

        jid,

        action:
            actionInterpretee
    });
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Routeur d'actions ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — RÉSOLVEUR PHYSIQUE DU COMBAT
//==============================================================
// Ce bloc transforme une décision arbitrée en conséquence réelle.
//
// Exemple :
//
// attaque
//    ↓
// comparaison attaque / défense
//    ↓
// réussite ?
//    ↓
// esquive / blocage / impact
//    ↓
// dégâts
//    ↓
// blessure
//    ↓
// mise à jour de l'état
//
// IMPORTANT :
// Ce moteur ne raconte PAS l'action.
// Il calcule ce qui s'est réellement produit.
//==============================================================


//==============================================================
// 🎯 TYPES DE RÉSULTATS
//==============================================================

const RESULTATS_COMBAT_ALLSTARS = {

    REUSSI: "reussi",

    RATE: "rate",

    ESQUIVE: "esquive",

    BLOQUE: "bloque",

    CONTRE: "contre",

    IMPACT: "impact",

    IMPOSSIBLE: "impossible"
};


//==============================================================
// 🔢 LIMITER UNE VALEUR
//==============================================================

function limiterValeurCombat(
    valeur,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            Number(valeur) || 0
        )
    );
}


//==============================================================
// 🎲 TEST COMBAT AVEC BONUS
//==============================================================

function effectuerTestCombat({

    attaque = 50,

    defense = 50,

    bonus = 0,

    malus = 0

} = {}) {


    attaque =
        Number(attaque) || 0;


    defense =
        Number(defense) || 0;


    bonus =
        Number(bonus) || 0;


    malus =
        Number(malus) || 0;


    //----------------------------------------------------------
    // 📊 SCORE
    //----------------------------------------------------------

    let probabilite =
        50 +
        (
            attaque -
            defense
        ) * 0.5;


    probabilite +=
        bonus;


    probabilite -=
        malus;


    probabilite =
        limiterValeurCombat(
            probabilite,
            5,
            95
        );


    //----------------------------------------------------------
    // 🎲 JET
    //----------------------------------------------------------

    const jet =
        Math.random() * 100;


    return {

        reussi:
            jet < probabilite,

        jet,

        probabilite,

        attaque,

        defense,

        bonus,

        malus
    };
}


//==============================================================
// 💥 CALCUL DES DÉGÂTS
//==============================================================

function calculerDegatsCombat({

    attaquant,

    defenseur,

    action,

    multiplicateur = 1

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return {

            valide: false,

            degats: 0,

            raison:
                "Combattant introuvable."
        };
    }


    //----------------------------------------------------------
    // 💪 PUISSANCE
    //----------------------------------------------------------

    const puissance =
        calculerPuissanceAttaqueCombat(
            attaquant
        );


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    const defense =
        calculerDefenseEffectiveCombat(
            defenseur
        );


    //----------------------------------------------------------
    // 💥 DÉGÂTS DE BASE
    //----------------------------------------------------------

    const degatsBase =
        Number(
            action?.degatsBase ??
            obtenirDegatsBaseActionCombat(
                action?.type ??
                "attaque",
                10
            )
        );


    //----------------------------------------------------------
    // 📊 FORMULE
    //----------------------------------------------------------

    let degats =
        degatsBase;


    degats +=
        puissance * 0.35;


    degats -=
        defense * 0.25;


    degats *=
        Number(
            multiplicateur
        ) || 1;


    //----------------------------------------------------------
    // MINIMUM
    //----------------------------------------------------------

    degats =
        Math.max(
            1,
            Math.round(
                degats
            )
        );


    return {

        valide: true,

        degats,

        degatsBase,

        puissance,

        defense,

        multiplicateur
    };
}


//==============================================================
// 🛡️ CALCUL DU BLOCAGE
//==============================================================

function calculerBlocageCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return {

            valide: false
        };
    }


    const attaque =
        calculerPuissanceAttaqueCombat(
            attaquant
        );


    const defense =
        calculerDefenseEffectiveCombat(
            defenseur
        );


    const bonusBlocage =
        10;


    const test =
        effectuerTestCombat({

            attaque:
                defense,

            defense:
                attaque,

            bonus:
                bonusBlocage
        });


    return {

        valide: true,

        bloque:
            test.reussi,

        test
    };
}


//==============================================================
// 💨 CALCUL DE L'ESQUIVE
//==============================================================

function calculerEsquiveCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return {

            valide: false
        };
    }


    const puissanceAttaque =
        calculerPuissanceAttaqueCombat(
            attaquant
        );


    const esquive =
        calculerEsquiveEffectiveCombat(
            defenseur
        );


    const reflexes =
        calculerCapacitesCombat(
            defenseur
        ).reflexes;


    const test =
        effectuerTestCombat({

            attaque:
                esquive +
                reflexes * 0.25,

            defense:
                puissanceAttaque,

            bonus: 5
        });


    return {

        valide: true,

        esquive:
            test.reussi,

        test
    };
}


//==============================================================
// ⚡ CALCUL DU CONTRE
//==============================================================

function calculerContreCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return {

            valide: false
        };
    }


    const profilDefenseur =
        creerProfilCombat(
            defenseur
        );


    const profilAttaquant =
        creerProfilCombat(
            attaquant
        );


    const avantage =
        (
            profilDefenseur
                .vitesseEffective
            -
            profilAttaquant
                .vitesseEffective
        );


    const test =
        effectuerTestCombat({

            attaque:
                profilDefenseur
                    .puissanceAttaque,

            defense:
                profilAttaquant
                    .defenseEffective,

            bonus:
                avantage * 0.3
        });


    return {

        valide: true,

        contre:
            test.reussi,

        test
    };
}


//==============================================================
// 🦴 DÉTERMINER LE MEMBRE TOUCHÉ
//==============================================================

function determinerMembreToucheCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    //----------------------------------------------------------
    // 🎯 MEMBRE EXPLICITEMENT VISÉ
    //----------------------------------------------------------

    if (
        action?.membre
    ) {

        const membre =
            String(
                action.membre
            );


        const correspondances = {

            bras:
                [
                    "brasGauche",
                    "brasDroit"
                ],

            jambe:
                [
                    "jambeGauche",
                    "jambeDroite"
                ],

            brasGauche:
                [
                    "brasGauche"
                ],

            brasDroit:
                [
                    "brasDroit"
                ],

            jambeGauche:
                [
                    "jambeGauche"
                ],

            jambeDroite:
                [
                    "jambeDroite"
                ]
        };


        if (
            correspondances[membre]
        ) {

            const liste =
                correspondances[membre];


            return liste[
                Math.floor(
                    Math.random() *
                    liste.length
                )
            ];
        }
    }


    //----------------------------------------------------------
    // 🎲 TOUCHER ALÉATOIRE
    //----------------------------------------------------------

    const membres = [

        "brasGauche",

        "brasDroit",

        "jambeGauche",

        "jambeDroite"
    ];


    return membres[
        Math.floor(
            Math.random() *
            membres.length
        )
    ];
}


//==============================================================
// 🩸 APPLIQUER UNE BLESSURE
//==============================================================

function appliquerBlessureCombat({

    joueur,

    membre,

    gravite = 1

} = {}) {


    if (
        !joueur ||
        !membre
    ) {

        return {

            succes: false,

            raison:
                "Membre invalide."
        };
    }


    if (
        !joueur.membres?.[membre]
    ) {

        return {

            succes: false,

            raison:
                "Membre introuvable."
        };
    }


    const partie =
        joueur.membres[membre];


    //----------------------------------------------------------
    // 🩸 DÉJÀ HORS SERVICE
    //----------------------------------------------------------

    if (
        partie.disponible === false
    ) {

        return {

            succes: false,

            raison:
                "Membre déjà indisponible.",

            membre
        };
    }


    //----------------------------------------------------------
    // 📊 GRAVITÉ
    //----------------------------------------------------------

    gravite =
        limiterValeurCombat(
            gravite,
            1,
            3
        );


    //----------------------------------------------------------
    // 🩹 BLESSURE
    //----------------------------------------------------------

    let typeBlessure =
        "legere";


    if (
        gravite >= 3
    ) {

        typeBlessure =
            "grave";

    } else if (
        gravite >= 2
    ) {

        typeBlessure =
            "moderee";
    }


    partie.blessure = {

        type:
            typeBlessure,

        gravite,

        temps:
            Date.now()
    };


    //----------------------------------------------------------
    // 🚫 DISPONIBILITÉ
    //----------------------------------------------------------

    if (
        gravite >= 3
    ) {

        partie.disponible =
            false;
    }


    return {

        succes: true,

        membre,

        blessure:
            partie.blessure,

        disponible:
            partie.disponible
    };
}


//==============================================================
// 😵 DÉTERMINER SI LA CIBLE EST SONNÉE
//==============================================================

function determinerEtatApresImpactCombat({

    defenseur,

    degats,

    multiplicateur = 1

} = {}) {


    if (!defenseur) {
        return null;
    }


    const pv =
        Number(
            defenseur.pv ?? 0
        );


    const pvMax =
        Number(
            defenseur.pvMax ?? 100
        );


    //----------------------------------------------------------
    // ☠️ MORT
    //----------------------------------------------------------

    if (
        pv <= 0
    ) {

        return ETATS_COMBAT_ALLSTARS.MORT;
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    const pourcentage =
        pvMax > 0
            ? (
                pv /
                pvMax
            ) * 100
            : 0;


    if (
        multiplicateur >= 1.5 &&
        pourcentage <= 30
    ) {

        return ETATS_COMBAT_ALLSTARS.SONNE;
    }


    if (
        degats >=
        pvMax * 0.25
    ) {

        return ETATS_COMBAT_ALLSTARS.SONNE;
    }


    return ETATS_COMBAT_ALLSTARS.NORMAL;
}


//==============================================================
// 💥 RÉSOLUTION D'UN IMPACT
//==============================================================

function resoudreImpactCombat({

    attaquant,

    defenseur,

    action,

    multiplicateur = 1

} = {}) {


    const calcul =
        calculerDegatsCombat({

            attaquant,

            defenseur,

            action,

            multiplicateur
        });


    if (
        !calcul.valide
    ) {

        return {

            succes: false,

            raison:
                calcul.raison
        };
    }


    //----------------------------------------------------------
    // ❤️ DÉGÂTS
    //----------------------------------------------------------

    const degats =
        appliquerDegatsCombat(

            defenseur,

            calcul.degats,

            attaquant.jid
        );


    //----------------------------------------------------------
    // 🦴 MEMBRE
    //----------------------------------------------------------

    const membre =
        determinerMembreToucheCombat({

            attaquant,

            defenseur,

            action
        });


    //----------------------------------------------------------
    // 🩸 GRAVITÉ
    //----------------------------------------------------------

    let gravite = 1;


    if (
        calcul.degats >=
        defenseur.pvMax * 0.25
    ) {

        gravite = 2;
    }


    if (
        calcul.degats >=
        defenseur.pvMax * 0.45
    ) {

        gravite = 3;
    }


    const blessure =
        appliquerBlessureCombat({

            joueur:
                defenseur,

            membre,

            gravite
        });


    //----------------------------------------------------------
    // 😵 ÉTAT
    //----------------------------------------------------------

    if (
        defenseur.etat !==
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        defenseur.etat =
            determinerEtatApresImpactCombat({

                defenseur,

                degats:
                    calcul.degats,

                multiplicateur
            });
    }


    //----------------------------------------------------------
    // 📊 STATISTIQUES
    //----------------------------------------------------------

    attaquant.statistiques.coupsPortes++;


    return {

        succes: true,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.IMPACT,

        degats,

        calcul,

        membre,

        blessure,

        etatFinal:
            defenseur.etat
    };
}


//==============================================================
// ⚔️ RÉSOLUTION D'UNE ATTAQUE
//==============================================================

function resoudreAttaqueCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Combattant introuvable."
        };
    }


    //----------------------------------------------------------
    // ☠️ CIBLE MORTE
    //----------------------------------------------------------

    if (
        defenseur.etat ===
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "La cible est morte."
        };
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    const distance =
        calculerDistanceCombat(
            attaquant,
            defenseur
        );


    const portee =
        action?.portee ??
        obtenirPorteeActionCombat(
            action?.type ??
            "attaque",
            1
        );


    if (
        portee !== null &&
        distance > portee
    ) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Cible hors de portée.",

            distance,

            portee
        };
    }


    //----------------------------------------------------------
    // ⚡ CONTRE
    //----------------------------------------------------------

    if (
        defenseur.actionEnCours?.type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        const contre =
            calculerContreCombat({

                attaquant,

                defenseur,

                action
            });


        if (
            contre.contre
        ) {

            return {

                succes: true,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.CONTRE,

                contre
            };
        }
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    const esquive =
        calculerEsquiveCombat({

            attaquant,

            defenseur,

            action
        });


    if (
        esquive.esquive
    ) {

        defenseur.statistiques.esquives++;


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

            esquive
        };
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        defenseur.actionEnCours?.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        const blocage =
            calculerBlocageCombat({

                attaquant,

                defenseur,

                action
            });


        if (
            blocage.bloque
        ) {

            defenseur.statistiques.blocages++;


            return {

                succes: true,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.BLOQUE,

                blocage
            };
        }
    }


    //----------------------------------------------------------
    // 💥 IMPACT
    //----------------------------------------------------------

    return resoudreImpactCombat({

        attaquant,

        defenseur,

        action,

        multiplicateur:
            distance <= 1
                ? 1
                : 0.85
    });
}


//==============================================================
// ⚔️ RÉSOLUTION D'UNE ACTION
//==============================================================

function resoudreActionPhysiqueCombat({

    combat,

    action

} = {}) {


    if (!combat || !action) {

        return {

            succes: false,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Combat ou action invalide."
        };
    }


    const attaquant =
        obtenirJoueurCombat(
            combat,
            action.jid
        );


    if (!attaquant) {

        return {

            succes: false,

            raison:
                "Attaquant introuvable."
        };
    }


    const defenseur =
        action.cibleJid
            ? obtenirJoueurCombat(
                combat,
                action.cibleJid
            )
            : null;


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        return resoudreAttaqueCombat({

            attaquant,

            defenseur,

            action
        });
    }


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        attaquant.actionEnCours = {

            type:
                ACTIONS_COMBAT_ALLSTARS.DEFENSE,

            actif: true
        };


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.REUSSI,

            action:
                "defense"
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        attaquant.actionEnCours = {

            type:
                ACTIONS_COMBAT_ALLSTARS.ESQUIVE,

            actif: true
        };


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.REUSSI,

            action:
                "esquive"
        };
    }


    //----------------------------------------------------------
    // ⏳ ATTENTE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ATTENTE
    ) {

        attaquant.actionEnCours = {

            type:
                ACTIONS_COMBAT_ALLSTARS.ATTENTE,

            actif: true
        };


        return {

            succes: true,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.REUSSI,

            action:
                "attente"
        };
    }


    return {

        succes: false,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

        raison:
            `Action physique non supportée : ${action.type}`
    };
}


//==============================================================
// ⚔️ RÉSOLUTION DE TOUTES LES ACTIONS
//==============================================================

function resoudreActionsPhysiquesCombat(
    combat
) {


    if (!combat) {

        return {

            succes: false,

            resultats: []
        };
    }


    const actions =
        Array.isArray(
            combat.actionsEnCours
        )
            ? [
                ...combat.actionsEnCours
            ]
            : [];


    const resultats = [];


    //----------------------------------------------------------
    // ⚔️ RÉSOLUTION
    //----------------------------------------------------------

    for (
        const action of actions
    ) {

        const resultat =
            resoudreActionPhysiqueCombat({

                combat,

                action
            });


        resultats.push({

            action,

            resultat
        });
    }


    //----------------------------------------------------------
    // 🧹 ACTIONS TERMINÉES
    //----------------------------------------------------------

    combat.actionsEnCours = [];


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    for (
        const element of resultats
    ) {

        combat.historique.push({

            type:
                "resolution",

            action:
                element.action,

            resultat:
                element.resultat,

            temps:
                combat.temps,

            sequence:
                ++combat.sequence
        });
    }


    return {

        succes: true,

        resultats
    };
}


//==============================================================
// 🔗 COMPATIBILITÉ AVEC LE MOTEUR EXISTANT
//==============================================================
// Certaines parties précédentes appellent déjà
// resoudreActionsCombat().
// On crée donc un pont unique.
//==============================================================

function resoudreActionsCombat(
    combat
) {

    return resoudreActionsPhysiquesCombat(
        combat
    );
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Résolveur physique ALL STARS chargé."
);

//================================================
// 🧠 DÉTECTION DES ACTIONS DANS UN PAVÉ
//================================================
function detecterActionsPave(texte = "") {

    const texteNormalise = normaliserAction(texte);

    const toutesLesActions = obtenirToutesLesActions();

    // 🔎 DEBUG
    console.log(
        "🔎 Recherche des actions dans :",
        texte
    );

    console.log(
        "📚 Nombre d'actions disponibles :",
        toutesLesActions.length
    );

    const actionsDetectees = [];

    for (const action of toutesLesActions) {

        const termes = [
            action.nom,
            ...(action.aliases || [])
        ];

        let trouve = false;
        let termeUtilise = null;

        for (const terme of termes) {

            const termeNormalise = normaliserAction(terme);

            if (!termeNormalise) continue;

            if (texteNormalise.includes(termeNormalise)) {

                trouve = true;
                termeUtilise = terme;

                break;
            }
        }

        if (trouve) {

            actionsDetectees.push({
                id: action.id,
                nom: action.nom,
                categorie: action.categorie,
                groupe: action.groupe,
                termeDetecte: termeUtilise,
                description: action.description
            });
        }
    }

    console.log(
        "✅ ACTIONS TROUVÉES :",
        actionsDetectees
    );

    return actionsDetectees;
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

function AnalysePaveMatch(message, joueur) {

    const pave = extrairePaveAction(message);


    //============================================
    // 🥊 DEBUG ANALYSE PAVÉ ALL STARS
    //============================================

    console.log("========================================");
    console.log("🥊 ANALYSE PAVÉ ALL STARS");
    console.log("========================================");

    console.log(
        "👤 Joueur :",
        joueur?.pseudo || "Inconnu"
    );

    console.log(
        "📝 Pavé :",
        pave || "(vide)"
    );


    //============================================
    // ❌ PAVÉ VIDE
    //============================================

    if (!pave) {

        console.log(
            "🎮 Actions détectées :",
            []
        );

        console.log(
            "🔢 Nombre d'actions :",
            0
        );

        console.log("========================================");

        return {
            valide: false,
            note: 0,

            pave: "",

            actions: [],

            erreurs: [
                "Aucune action détectée dans la section 🌀🎮."
            ],

            raison:
                "Le joueur doit écrire son action dans la section 🌀🎮."
        };
    }


    //============================================
    // 🔎 DÉTECTION DES ACTIONS
    //============================================

    const actions = detecterActionsPave(pave);


    //============================================
    // 🥊 DEBUG ACTIONS
    //============================================

    console.log(
        "🎮 Actions détectées :",
        actions
    );

    console.log(
        "🔢 Nombre d'actions :",
        actions.length
    );

    console.log("========================================");


    //============================================
    // 📊 CALCUL DE LA QUALITÉ DU PAVÉ
    //============================================

    let note = 0;

    const erreurs = [];


    // -------------------------------------------
    // 1️⃣ PRÉSENCE D'UNE ACTION
    // -------------------------------------------

    if (actions.length > 0) {

        note += 4;

    } else {

        erreurs.push(
            "Aucune action reconnue."
        );
    }


    // -------------------------------------------
    // 2️⃣ LONGUEUR / DÉTAIL
    // -------------------------------------------

    const nombreMots = pave
        .split(/\s+/)
        .filter(Boolean)
        .length;

    if (nombreMots >= 8) {

        note += 2;

    } else if (nombreMots >= 4) {

        note += 1;

    } else {

        erreurs.push(
            "Action trop peu détaillée."
        );
    }


    // -------------------------------------------
    // 3️⃣ PRÉCISION
    // -------------------------------------------

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

    const paveNormalise = normaliserAction(pave);

    const precisionTrouvee = precision.some(
        mot =>
            paveNormalise.includes(
                normaliserAction(mot)
            )
    );

    if (precisionTrouvee) {

        note += 2;

    } else {

        erreurs.push(
            "Cible insuffisamment précise."
        );
    }


    // -------------------------------------------
    // 4️⃣ COHÉRENCE / DESCRIPTION
    // -------------------------------------------
    const verbesAction = [
        "frappe",
        "frapper",
        "lance",
        "lancer",
        "avance",
        "recule",
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

    const verbeTrouve = verbesAction.some(
        verbe =>
            paveNormalise.includes(
                normaliserAction(verbe)
            )
    );

    if (verbeTrouve) {

        note += 2;

    } else {

        erreurs.push(
            "Action insuffisamment décrite."
        );
    }


    //============================================
    // 🔟 LIMITE
    //============================================

    note = Math.max(
        0,
        Math.min(10, note)
    );


    //============================================
    // ✅ VALIDATION
    //============================================

    const valide =
        actions.length > 0 &&
        note >= 4;


    //============================================
    // 📦 RESULTAT
    //============================================

    return {

        valide,

        note,

        pave,

        actions,

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
// 📊 MESSAGE D'ANALYSE DU PAVÉ
//================================================

function genererResultatAnalysePave(
    analyse,
    prochainJoueur
) {

    //============================================
    // ❌ PAVÉ NON VALIDÉ
    //============================================

    if (!analyse.valide) {

        const raison =
            analyse.erreurs.length > 0
                ? analyse.erreurs.join(" ")
                : "Action invalide.";

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
    // ✅ PAVÉ VALIDÉ
    //============================================

    return `░▒░   *🎮COMBAT ♨️🌀* ░▒░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

✅ : Actions en cours....

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
    // 👤 UTILISER UNIQUEMENT LE JID DÉJÀ SAUVEGARDÉ
    // ============================================
    console.log("🆔 JID reçu pour choix carte :", sender);

    console.log(
        "🆔 JID des joueurs sauvegardés :",
        match.joueurs.map(j => j.jid)
    );

    const joueur = match.joueurs.find(j =>
        j.jid === sender
    );

    if (!joueur) {
        console.log("❌ Joueur non trouvé :", sender);
        return;
    }

    console.log(
        "✅ Joueur identifié :",
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
        .replace(/^🌀/, "")
        .trim();


    if (!nomCarte) return;


    console.log(
        "🎴 Carte demandée :",
        nomCarte,
        "par",
        joueur.pseudo
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
        normalize(c) === normalize(nomCarte)
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


    //================================================
// 🎴 RÉCUPÉRATION EXACTE DES CARTES DE LA BOUTIQUE
//================================================
const allCards = [];

for (const [placementKey, placementCards] of Object.entries(cards)) {

    if (!Array.isArray(placementCards)) continue;

    for (const c of placementCards) {

        if (!c) continue;

        allCards.push({
            ...c,
            placement: placementKey
        });
    }
}


console.log(
    "🎴 Nombre total de cartes dans la base :",
    allCards.length
);


//================================================
// 🔎 RECHERCHE EXACTE DE LA CARTE
//================================================
// 🔎 Recherche exacte de la carte
const card = allCards.find(c =>
    normalize(c.name || "") === normalize(nomCarte)
);

if (!card) {
    await ovl.sendMessage(chat, {
        text:
`❌ Carte introuvable dans la base :
🎴 ${nomCarte}`
    });

    return;
}

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
// 🖼️ Confirmation avec les caractéristiques de la carte
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
    duelsEnCours,
    matchAttente
};
