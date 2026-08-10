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

//==============================================================
// ⚔️ ALL STARS — GESTION DES ÉTATS / EFFETS
//==============================================================
// Gère les conséquences persistantes du combat.
//
// États principaux :
// - normal
// - sonné
// - immobilisé
// - KO
// - mort
//
// Effets temporaires :
// - durée
// - puissance
// - source
// - expiration
//
// Ce système ne raconte pas le combat.
// Il maintient l'état réel des combattants.
//==============================================================


//==============================================================
// 🧠 TYPES D'EFFETS
//==============================================================

const EFFETS_COMBAT_ALLSTARS = {

    SONNE: "sonne",

    IMMOBILISE: "immobilise",

    AFFAIBLI: "affaibli",

    DESORIENTE: "desoriente",

    SAIGNEMENT: "saignement",

    RALENTI: "ralenti",

    REGENERATION: "regeneration"
};


//==============================================================
// ⏱️ AJOUTER UN EFFET
//==============================================================

function ajouterEffetCombat({

    joueur,

    type,

    duree = 1,

    puissance = 1,

    source = null,

    metadata = {}

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


    duree =
        Math.max(
            1,
            Number(duree) || 1
        );


    puissance =
        Math.max(
            0,
            Number(puissance) || 0
        );


    //----------------------------------------------------------
    // 🔎 EFFET EXISTANT
    //----------------------------------------------------------

    const existant =
        joueur.effets.find(
            effet =>
                effet.type === type
        );


    if (existant) {

        // On conserve la durée la plus élevée
        existant.duree =
            Math.max(
                Number(existant.duree) || 0,
                duree
            );


        // On conserve la puissance la plus forte
        existant.puissance =
            Math.max(
                Number(existant.puissance) || 0,
                puissance
            );


        existant.source =
            source ??
            existant.source;


        existant.metadata = {

            ...existant.metadata,

            ...metadata
        };


        return {

            succes: true,

            effet:
                existant,

            nouveau: false
        };
    }


    //----------------------------------------------------------
    // ➕ NOUVEL EFFET
    //----------------------------------------------------------

    const effet = {

        id:
            `${type}_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        type,

        duree,

        puissance,

        source,

        metadata: {

            ...metadata
        },

        cree:
            Date.now()
    };


    joueur.effets.push(
        effet
    );


    //----------------------------------------------------------
    // 🔄 APPLICATION IMMÉDIATE
    //----------------------------------------------------------

    appliquerEffetEtatCombat(
        joueur,
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

function supprimerEffetCombat(
    joueur,
    type
) {

    if (!joueur) {

        return false;
    }


    if (!Array.isArray(joueur.effets)) {

        return false;
    }


    const avant =
        joueur.effets.length;


    joueur.effets =
        joueur.effets.filter(
            effet =>
                effet.type !== type
        );


    const supprime =
        avant !==
        joueur.effets.length;


    if (supprime) {

        actualiserEtatDepuisEffetsCombat(
            joueur
        );
    }


    return supprime;
}


//==============================================================
// 🔎 POSSÈDE UN EFFET
//==============================================================

function joueurPossedeEffetCombat(
    joueur,
    type
) {

    return !!(
        joueur &&
        Array.isArray(
            joueur.effets
        ) &&
        joueur.effets.some(
            effet =>
                effet.type === type &&
                Number(effet.duree) > 0
        )
    );
}


//==============================================================
// 🔎 RÉCUPÉRER UN EFFET
//==============================================================

function obtenirEffetCombat(
    joueur,
    type
) {

    if (
        !joueur ||
        !Array.isArray(
            joueur.effets
        )
    ) {

        return null;
    }


    return (
        joueur.effets.find(
            effet =>
                effet.type === type
        ) ??
        null
    );
}


//==============================================================
// 🧠 APPLICATION D'UN EFFET
//==============================================================

function appliquerEffetEtatCombat(
    joueur,
    effet
) {

    if (!joueur || !effet) {
        return;
    }


    switch (
        effet.type
    ) {

        //------------------------------------------------------
        // 😵 SONNÉ
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.SONNE:

            joueur.etat =
                ETATS_COMBAT_ALLSTARS.SONNE;

            break;


        //------------------------------------------------------
        // 🧊 IMMOBILISÉ
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.IMMOBILISE:

            joueur.etat =
                ETATS_COMBAT_ALLSTARS.IMMOBILISE;

            break;


        //------------------------------------------------------
        // 🩸 SAIGNEMENT
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.SAIGNEMENT:

            break;


        //------------------------------------------------------
        // 🐌 RALENTI
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.RALENTI:

            break;


        //------------------------------------------------------
        // 💢 AFFAIBLI
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.AFFAIBLI:

            break;


        //------------------------------------------------------
        // 🌀 DÉSORIENTÉ
        //------------------------------------------------------

        case EFFETS_COMBAT_ALLSTARS.DESORIENTE:

            break;
    }
}


//==============================================================
// 🔄 ACTUALISER L'ÉTAT SELON LES EFFETS
//==============================================================

function actualiserEtatDepuisEffetsCombat(
    joueur
) {

    if (!joueur) {
        return;
    }


    if (
        joueur.etat ===
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        return;
    }


    //----------------------------------------------------------
    // ☠️ PV
    //----------------------------------------------------------

    if (
        Number(joueur.pv) <= 0
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.MORT;

        return;
    }


    //----------------------------------------------------------
    // 😵 SONNÉ
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            joueur,
            EFFETS_COMBAT_ALLSTARS.SONNE
        )
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.SONNE;

        return;
    }


    //----------------------------------------------------------
    // 🧊 IMMOBILISÉ
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            joueur,
            EFFETS_COMBAT_ALLSTARS.IMMOBILISE
        )
    ) {

        joueur.etat =
            ETATS_COMBAT_ALLSTARS.IMMOBILISE;

        return;
    }


    //----------------------------------------------------------
    // ✅ NORMAL
    //----------------------------------------------------------

    joueur.etat =
        ETATS_COMBAT_ALLSTARS.NORMAL;
}


//==============================================================
// ⏱️ FAIRE AVANCER LES EFFETS
//==============================================================

function avancerEffetsCombat(
    joueur
) {

    if (!joueur) {

        return {

            succes: false,

            effetsExpires: []
        };
    }


    if (!Array.isArray(joueur.effets)) {

        joueur.effets = [];
    }


    const effetsExpires = [];


    //----------------------------------------------------------
    // 🔄 TICK
    //----------------------------------------------------------

    for (
        const effet of joueur.effets
    ) {

        //------------------------------------------------------
        // 🩸 SAIGNEMENT
        //------------------------------------------------------

        if (
            effet.type ===
            EFFETS_COMBAT_ALLSTARS.SAIGNEMENT
        ) {

            const degats =
                Math.max(
                    0,
                    Number(
                        effet.puissance
                    ) || 0
                );


            if (degats > 0) {

                appliquerDegatsCombat(

                    joueur,

                    degats,

                    effet.source
                );
            }
        }


        //------------------------------------------------------
        // 💚 RÉGÉNÉRATION
        //------------------------------------------------------

        if (
            effet.type ===
            EFFETS_COMBAT_ALLSTARS.REGENERATION
        ) {

            const soin =
                Math.max(
                    0,
                    Number(
                        effet.puissance
                    ) || 0
                );


            joueur.pv =
                Math.min(

                    Number(
                        joueur.pvMax
                    ) || 100,

                    Number(
                        joueur.pv
                    ) + soin
                );
        }


        //------------------------------------------------------
        // ⏳ DURÉE
        //------------------------------------------------------

        effet.duree =
            Math.max(
                0,
                (
                    Number(
                        effet.duree
                    ) || 0
                ) - 1
            );


        //------------------------------------------------------
        // ❌ EXPIRATION
        //------------------------------------------------------

        if (
            effet.duree <= 0
        ) {

            effetsExpires.push(
                effet
            );
        }
    }


    //----------------------------------------------------------
    // 🧹 SUPPRESSION
    //----------------------------------------------------------

    joueur.effets =
        joueur.effets.filter(
            effet =>
                Number(
                    effet.duree
                ) > 0
        );


    //----------------------------------------------------------
    // 🔄 ÉTAT
    //----------------------------------------------------------

    actualiserEtatDepuisEffetsCombat(
        joueur
    );


    return {

        succes: true,

        effetsExpires
    };
}


//==============================================================
// 🧠 VÉRIFIER SI LE JOUEUR PEUT AGIR
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
    // 😵 SONNÉ
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
    // 🧊 IMMOBILISÉ
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

        succes: true
    };
}


//==============================================================
// 👤 RÉCUPÉRER UN JOUEUR
//==============================================================

function obtenirJoueurCombat(
    combat,
    jid
) {

    if (
        !combat ||
        !jid
    ) {

        return null;
    }


    return (
        combat.joueurs?.[jid] ??
        null
    );
}


//==============================================================
// 🎯 ACTION ACTIVE D'UN JOUEUR
//==============================================================

function obtenirActionActiveCombat(
    combat,
    jid
) {

    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {
        return null;
    }


    return joueur.actionEnCours ??
        null;
}


//==============================================================
// 📊 CAPACITÉS DU COMBATTANT
//==============================================================

function calculerCapacitesCombat(
    joueur
) {

    if (!joueur) {

        return {

            force: 0,

            vitesse: 0,

            defense: 0,

            reflexes: 0,

            intelligenceCombat: 0
        };
    }


    //----------------------------------------------------------
    // 🔎 SOURCES POSSIBLES
    //----------------------------------------------------------

    const stats =
        joueur.stats ??
        joueur.statistiquesCombat ??
        joueur.attributs ??
        {};


    return {

        force:
            Number(
                joueur.force ??
                stats.force ??
                50
            ),

        vitesse:
            Number(
                joueur.vitesse ??
                stats.vitesse ??
                joueur.combatSpeed ??
                50
            ),

        defense:
            Number(
                joueur.defense ??
                stats.defense ??
                50
            ),

        reflexes:
            Number(
                joueur.reflexes ??
                stats.reflexes ??
                50
            ),

        intelligenceCombat:
            Number(
                joueur.intelligenceCombat ??
                stats.intelligenceCombat ??
                50
            )
    };
}


//==============================================================
// 💪 PUISSANCE D'ATTAQUE
//==============================================================

function calculerPuissanceAttaqueCombat(
    joueur
) {

    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let puissance =
        capacites.force;


    //----------------------------------------------------------
    // 💢 AFFAIBLI
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            joueur,
            EFFETS_COMBAT_ALLSTARS.AFFAIBLI
        )
    ) {

        const effet =
            obtenirEffetCombat(
                joueur,
                EFFETS_COMBAT_ALLSTARS.AFFAIBLI
            );


        puissance *=
            Math.max(
                0,
                1 -
                (
                    Number(
                        effet.puissance
                    ) || 0
                ) / 100
            );
    }


    return Math.max(
        0,
        puissance
    );
}


//==============================================================
// 🛡️ DÉFENSE EFFECTIVE
//==============================================================

function calculerDefenseEffectiveCombat(
    joueur
) {

    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let defense =
        capacites.defense;


    //----------------------------------------------------------
    // 😵 DÉSORIENTÉ
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            joueur,
            EFFETS_COMBAT_ALLSTARS.DESORIENTE
        )
    ) {

        const effet =
            obtenirEffetCombat(
                joueur,
                EFFETS_COMBAT_ALLSTARS.DESORIENTE
            );


        defense *=
            Math.max(
                0,
                1 -
                (
                    Number(
                        effet.puissance
                    ) || 0
                ) / 100
            );
    }


    return Math.max(
        0,
        defense
    );
}


//==============================================================
// 💨 ESQUIVE EFFECTIVE
//==============================================================

function calculerEsquiveEffectiveCombat(
    joueur
) {

    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    let esquive =
        capacites.vitesse;


    if (
        joueurPossedeEffetCombat(
            joueur,
            EFFETS_COMBAT_ALLSTARS.RALENTI
        )
    ) {

        const effet =
            obtenirEffetCombat(
                joueur,
                EFFETS_COMBAT_ALLSTARS.RALENTI
            );


        esquive *=
            Math.max(
                0,
                1 -
                (
                    Number(
                        effet.puissance
                    ) || 0
                ) / 100
            );
    }


    return Math.max(
        0,
        esquive
    );
}


//==============================================================
// 📊 PROFIL COMPLET DU COMBATTANT
//==============================================================

function creerProfilCombat(
    joueur
) {

    if (!joueur) {

        return {

            vitesseEffective: 0,

            puissanceAttaque: 0,

            defenseEffective: 0,

            capacites:
                calculerCapacitesCombat(
                    null
                )
        };
    }


    const capacites =
        calculerCapacitesCombat(
            joueur
        );


    return {

        vitesseEffective:
            Math.max(
                0,
                capacites.vitesse
            ),

        puissanceAttaque:
            calculerPuissanceAttaqueCombat(
                joueur
            ),

        defenseEffective:
            calculerDefenseEffectiveCombat(
                joueur
            ),

        esquiveEffective:
            calculerEsquiveEffectiveCombat(
                joueur
            ),

        capacites
    };
}


//==============================================================
// 📏 PORTÉE D'UNE ACTION
//==============================================================

function obtenirPorteeActionCombat(
    type,
    valeurDefaut = 1
) {

    const portees = {

        attaque: 2,

        defense: 0,

        esquive: 2,

        saisie: 1.5,

        contre: 2,

        technique: 5,

        deplacement: 0,

        recuperation: 0,

        attente: 0
    };


    return (
        portees[type] ??
        valeurDefaut
    );
}


//==============================================================
// 💥 DÉGÂTS DE BASE
//==============================================================

function obtenirDegatsBaseActionCombat(
    type,
    valeurDefaut = 10
) {

    const degats = {

        attaque: 10,

        saisie: 5,

        contre: 12,

        technique: 20
    };


    return (
        degats[type] ??
        valeurDefaut
    );
}


//==============================================================
// 🧠 CONDITIONS D'UNE ACTION
//==============================================================

function verifierConditionsActionCombat({

    joueur,

    cible,

    profil

} = {}) {


    const raisons = [];


    if (!joueur) {

        raisons.push(
            "Joueur introuvable."
        );


        return {

            valide: false,

            raisons
        };
    }


    //----------------------------------------------------------
    // 🚫 ÉTAT
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


    return {

        valide:
            raisons.length === 0,

        raisons
    };
}


//==============================================================
// 🔄 ACTUALISER L'ÉTAT GLOBAL DU COMBAT
//==============================================================

function actualiserEtatCombatAllStars(
    combat
) {

    if (!combat) {
        return null;
    }


    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        actualiserEtatDepuisEffetsCombat(
            joueur
        );
    }


    //----------------------------------------------------------
    // 🏁 FIN DU COMBAT
    //----------------------------------------------------------

    const joueursVivants =
        (combat.ordre || [])
            .filter(
                jid => {

                    const joueur =
                        obtenirJoueurCombat(
                            combat,
                            jid
                        );


                    return (
                        joueur &&
                        joueur.etat !==
                        ETATS_COMBAT_ALLSTARS.MORT
                    );
                }
            );


    if (
        joueursVivants.length <= 1
    ) {

        combat.phase =
            "termine";
    }


    return combat;
}


//==============================================================
// 🏃 DÉPLACEMENT
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


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const peutAgir =
        joueurPeutAgirCombat(
            joueur
        );


    if (!peutAgir.succes) {

        return peutAgir;
    }


    if (!destination) {

        return {

            succes: false,

            raison:
                "Destination manquante."
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
    // 📍 POSITION
    //----------------------------------------------------------

    const anciennePosition = {

        ...joueur.position
    };


    joueur.position = {

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


    //----------------------------------------------------------
    // 📊 ENREGISTREMENT
    //----------------------------------------------------------

    combat.deplacements.push({

        jid,

        anciennePosition,

        nouvellePosition:
            {
                ...joueur.position
            },

        temps:
            combat.temps,

        sequence:
            ++combat.sequence
    });


    return {

        succes: true,

        anciennePosition,

        nouvellePosition:
            {
                ...joueur.position
            },

        stamina
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


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    const peutAgir =
        joueurPeutAgirCombat(
            joueur
        );


    if (!peutAgir.succes) {

        return peutAgir;
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.DEFENSE,

        sousType:
            type,

        actif: true
    };


    return {

        succes: true,

        action:
            joueur.actionEnCours
    };
}


//==============================================================
// ⚔️ PRÉPARER UNE ATTAQUE
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


    if (!attaquant) {

        return {

            succes: false,

            raison:
                "Attaquant introuvable."
        };
    }


    const cible =
        obtenirJoueurCombat(
            combat,
            cibleJid
        );


    if (!cible) {

        return {

            succes: false,

            raison:
                "Cible introuvable."
        };
    }


    const peutAgir =
        joueurPeutAgirCombat(
            attaquant
        );


    if (!peutAgir.succes) {

        return peutAgir;
    }


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
            Number(
                coutStamina
            ) || 0;


        return energie;
    }


    //----------------------------------------------------------
    // ⚔️ ACTION
    //----------------------------------------------------------

    const action = {

        jid,

        type:
            ACTIONS_COMBAT_ALLSTARS.ATTAQUE,

        sousType:
            type,

        cibleJid,

        technique,

        coutStamina,

        coutEnergie,

        actif: true
    };


    attaquant.actionEnCours =
        action;


    combat.actionsEnCours.push(
        action
    );


    return {

        succes: true,

        action,

        stamina,

        energie
    };
}


//==============================================================
// ⏳ ATTENTE
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


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.ATTENTE,

        actif: true
    };


    return {

        succes: true,

        action:
            joueur.actionEnCours
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Gestion des états ALL STARS chargée."
);

//==============================================================
// ⚔️ ALL STARS — SYSTÈME DE TOURS
//==============================================================
// Un TOUR représente un échange COMPLET.
//
// TOUR 1
//
// Joueur 1 joue
//      ↓
// Joueur 2 joue
//      ↓
// Résolution
//      ↓
// Mise à jour du combat
//      ↓
// Calcul de domination
//      ↓
// FIN DU TOUR
//
// Puis :
// tour 2
// tour 3
// ...
// tour 10
//
// À la fin du 10e tour :
// décision finale.
//==============================================================


//==============================================================
// ⚙️ CONFIGURATION DES TOURS
//==============================================================

const CONFIG_TOURS_ALLSTARS = {

    MAX_TOURS: 10,

    JOUEURS_PAR_TOUR: 2,

    DECISION_APRES_MAX_TOURS: true
};


//==============================================================
// 📊 INITIALISER LE TRACKER DE TOUR
//==============================================================

function initialiserToursCombatAllStars(
    combat
) {

    if (!combat) {
        return null;
    }


    combat.tour = 0;

    combat.sequence = 0;


    //----------------------------------------------------------
    // ACTIONS DU TOUR
    //----------------------------------------------------------

    combat.tourActuel = {

        numero: 1,

        joueursAyantJoue: [],

        actions: [],

        resolutionEffectuee: false,

        termine: false
    };


    //----------------------------------------------------------
    // DOMINATION
    //----------------------------------------------------------

    combat.domination = {};


    for (
        const jid of combat.ordre || []
    ) {

        combat.domination[jid] = {

            score: 0,

            attaquesReussies: 0,

            attaquesRatees: 0,

            coupsPortes: 0,

            coupsRecus: 0,

            degatsInfliges: 0,

            degatsRecus: 0,

            esquives: 0,

            blocages: 0,

            contres: 0,

            saisies: 0,

            actionsReussies: 0,

            actionsRatees: 0,

            tempsDominant: 0
        };
    }


    //----------------------------------------------------------
    // ÉTAT
    //----------------------------------------------------------

    combat.phase =
        "combat";


    return combat;
}


//==============================================================
// 👤 VÉRIFIER SI LE JOUEUR A DÉJÀ JOUÉ
//==============================================================

function joueurADejaJoueTourCombat(
    combat,
    jid
) {

    if (
        !combat ||
        !combat.tourActuel
    ) {

        return false;
    }


    return combat.tourActuel
        .joueursAyantJoue
        .includes(jid);
}


//==============================================================
// 👤 ENREGISTRER L'ACTION DU JOUEUR
//==============================================================

function enregistrerActionTourCombat({

    combat,

    jid,

    action

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    if (!combat.tourActuel) {

        initialiserToursCombatAllStars(
            combat
        );
    }


    //----------------------------------------------------------
    // 🚫 JOUEUR INCONNU
    //----------------------------------------------------------

    if (
        !combat.ordre.includes(jid)
    ) {

        return {

            succes: false,

            raison:
                "Le joueur ne participe pas à ce combat."
        };
    }


    //----------------------------------------------------------
    // 🚫 A DÉJÀ JOUÉ
    //----------------------------------------------------------

    if (
        joueurADejaJoueTourCombat(
            combat,
            jid
        )
    ) {

        return {

            succes: false,

            raison:
                "Ce joueur a déjà joué pendant ce tour."
        };
    }


    //----------------------------------------------------------
    // 📝 ENREGISTREMENT
    //----------------------------------------------------------

    combat.tourActuel
        .joueursAyantJoue
        .push(jid);


    combat.tourActuel
        .actions
        .push(action);


    return {

        succes: true,

        joueursAyantJoue:
            [
                ...combat.tourActuel
                    .joueursAyantJoue
            ]
    };
}


//==============================================================
// 🔎 VÉRIFIER SI LES DEUX JOUEURS ONT JOUÉ
//==============================================================

function tousLesJoueursOntJoueTourCombat(
    combat
) {

    if (!combat) {
        return false;
    }


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length === 0
    ) {

        return false;
    }


    return joueurs.every(
        jid =>
            combat.tourActuel
                ?.joueursAyantJoue
                ?.includes(jid)
    );
}


//==============================================================
// ⚔️ PRÉPARER LES ACTIONS DU TOUR
//==============================================================

function preparerActionsTourCombat(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            actions: []
        };
    }


    if (
        !combat.tourActuel
    ) {

        initialiserToursCombatAllStars(
            combat
        );
    }


    const actions =
        combat.tourActuel.actions || [];


    //----------------------------------------------------------
    // 📦 COPIE
    //----------------------------------------------------------

    const actionsResolution = [];


    for (
        const action of actions
    ) {

        if (!action) {
            continue;
        }


        actionsResolution.push({

            ...action,

            tour:
                combat.tourActuel.numero
        });
    }


    //----------------------------------------------------------
    // 📥 AJOUT AUX ACTIONS DU COMBAT
    //----------------------------------------------------------

    combat.actionsEnCours.push(
        ...actionsResolution
    );


    return {

        succes: true,

        actions:
            actionsResolution
    };
}


//==============================================================
// 📊 ENREGISTRER LES STATISTIQUES D'UNE RÉSOLUTION
//==============================================================

function enregistrerResultatTourCombat({

    combat,

    action,

    resultat

} = {}) {


    if (
        !combat ||
        !action
    ) {

        return;
    }


    const jid =
        action.jid;


    const stats =
        combat.domination?.[jid];


    if (!stats) {
        return;
    }


    const resultatReel =
        resultat?.resultat ??
        resultat?.resultat?.resultat ??
        null;


    //----------------------------------------------------------
    // 📊 ACTION RÉUSSIE
    //----------------------------------------------------------

    if (
        resultat?.succes
    ) {

        stats.actionsReussies++;
    }


    //----------------------------------------------------------
    // 📊 ACTION RATÉE
    //----------------------------------------------------------

    else {

        stats.actionsRatees++;
    }


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        if (
            resultatReel ===
            RESULTATS_COMBAT_ALLSTARS.IMPACT
        ) {

            stats.attaquesReussies++;

        } else {

            stats.attaquesRatees++;
        }
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        stats.esquives++;
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.BLOQUE
    ) {

        stats.blocages++;
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.CONTRE
    ) {

        stats.contres++;
    }


    //----------------------------------------------------------
    // 💥 DÉGÂTS
    //----------------------------------------------------------

    const degats =
        resultat?.degats?.degats ??
        resultat?.resultat?.degats?.degats ??
        0;


    stats.degatsInfliges +=
        Number(degats) || 0;
}


//==============================================================
// 📊 CALCULER LES DÉGÂTS REÇUS
//==============================================================

function actualiserDegatsRecusTourCombat(
    combat
) {

    if (!combat) {
        return;
    }


    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        const stats =
            combat.domination?.[jid];


        if (
            !joueur ||
            !stats
        ) {

            continue;
        }


        //------------------------------------------------------
        // PV PERDUS
        //------------------------------------------------------

        const pvMax =
            Number(
                joueur.pvMax
            ) || 100;


        const pv =
            Number(
                joueur.pv
            ) || 0;


        const totalDegatsSubis =
            pvMax - pv;


        stats.degatsRecus =
            Math.max(
                0,
                totalDegatsSubis
            );
    }
}


//==============================================================
// 👑 CALCUL DE DOMINATION DU TOUR
//==============================================================
// La domination mesure qui a réellement pris le dessus.
//
// Elle ne correspond PAS simplement aux dégâts.
//==============================================================

function calculerDominationTourCombat(
    combat
) {

    if (!combat) {
        return null;
    }


    actualiserDegatsRecusTourCombat(
        combat
    );


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length < 2
    ) {

        return null;
    }


    const j1 =
        joueurs[0];


    const j2 =
        joueurs[1];


    const s1 =
        combat.domination[j1];


    const s2 =
        combat.domination[j2];


    //----------------------------------------------------------
    // 📊 SCORE BRUT
    //----------------------------------------------------------

    const score1 =

        s1.degatsInfliges * 0.40 +

        s1.attaquesReussies * 5 +

        s1.esquives * 4 +

        s1.blocages * 3 +

        s1.contres * 7 +

        s1.actionsReussies * 2;


    const score2 =

        s2.degatsInfliges * 0.40 +

        s2.attaquesReussies * 5 +

        s2.esquives * 4 +

        s2.blocages * 3 +

        s2.contres * 7 +

        s2.actionsReussies * 2;


    //----------------------------------------------------------
    // 📈 AVANTAGE DU TOUR
    //----------------------------------------------------------

    const difference =
        score1 - score2;


    let gagnantTour = null;


    if (
        difference > 0
    ) {

        gagnantTour =
            j1;

    } else if (
        difference < 0
    ) {

        gagnantTour =
            j2;
    }


    //----------------------------------------------------------
    // 👑 DOMINATION
    //----------------------------------------------------------

    if (gagnantTour) {

        combat.domination[
            gagnantTour
        ].tempsDominant++;
    }


    return {

        j1: {

            jid:
                j1,

            score:
                score1
        },

        j2: {

            jid:
                j2,

            score:
                score2
        },

        difference,

        gagnantTour
    };
}


//==============================================================
// ❤️ SCORE PV
//==============================================================

function calculerScorePvDecisionCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const pv =
        Number(
            joueur.pv
        ) || 0;


    const pvMax =
        Number(
            joueur.pvMax
        ) || 100;


    if (
        pvMax <= 0
    ) {

        return 0;
    }


    return (
        pv /
        pvMax
    ) * 100;
}


//==============================================================
// 🔋 SCORE STAMINA
//==============================================================

function calculerScoreStaminaDecisionCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    return Math.max(
        0,
        Math.min(
            100,
            Number(
                joueur.stamina
            ) || 0
        )
    );
}


//==============================================================
// ⚔️ SCORE DOMINATION FINAL
//==============================================================

function calculerScoreDominationFinalCombat(
    combat,
    jid
) {

    const stats =
        combat.domination?.[jid];


    if (!stats) {
        return 0;
    }


    //----------------------------------------------------------
    // SCORE DE BASE
    //----------------------------------------------------------

    let score = 0;


    score +=
        stats.degatsInfliges *
        0.40;


    score +=
        stats.attaquesReussies *
        5;


    score +=
        stats.esquives *
        4;


    score +=
        stats.blocages *
        3;


    score +=
        stats.contres *
        7;


    score +=
        stats.saisies *
        5;


    score +=
        stats.actionsReussies *
        2;


    //----------------------------------------------------------
    // DOMINATION DES TOURS
    //----------------------------------------------------------

    score +=
        stats.tempsDominant *
        10;


    return score;
}


//==============================================================
// 🏆 DÉCISION FINALE APRÈS 10 TOURS
//==============================================================
// Pondération :
//
// PV          = 25 %
// STAMINA     = 15 %
// DÉGÂTS      = 20 %
// DOMINATION  = 25 %
// EFFICACITÉ  = 15 %
//==============================================================

function calculerDecisionFinaleCombat(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length < 2
    ) {

        return {

            succes: false,

            raison:
                "Deux joueurs sont nécessaires."
        };
    }


    const resultats = [];


    //----------------------------------------------------------
    // 📊 SCORES
    //----------------------------------------------------------

    for (
        const jid of joueurs
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        const stats =
            combat.domination[jid];


        if (!joueur) {
            continue;
        }


        //------------------------------------------------------
        // ❤️ PV
        //------------------------------------------------------

        const scorePv =
            calculerScorePvDecisionCombat(
                joueur
            );


        //------------------------------------------------------
        // 🔋 STAMINA
        //------------------------------------------------------

        const scoreStamina =
            calculerScoreStaminaDecisionCombat(
                joueur
            );


        //------------------------------------------------------
        // ⚔️ DÉGÂTS
        //------------------------------------------------------

        const totalDegats =
            Math.max(
                1,

                Number(
                    stats.degatsInfliges
                ) +
                Number(
                    stats.degatsRecus
                )
            );


        const scoreDegats =
            (
                Number(
                    stats.degatsInfliges
                ) /
                totalDegats
            ) * 100;


        //------------------------------------------------------
        // 👑 DOMINATION
        //------------------------------------------------------

        const scoreDomination =
            calculerScoreDominationFinalCombat(
                combat,
                jid
            );


        //------------------------------------------------------
        // 📈 EFFICACITÉ
        //------------------------------------------------------

        const totalActions =
            Math.max(
                1,

                Number(
                    stats.actionsReussies
                ) +
                Number(
                    stats.actionsRatees
                )
            );


        const scoreEfficacite =
            (
                Number(
                    stats.actionsReussies
                ) /
                totalActions
            ) * 100;


        //------------------------------------------------------
        // 🏆 SCORE FINAL
        //------------------------------------------------------

        const scoreFinal =

            scorePv * 0.25 +

            scoreStamina * 0.15 +

            scoreDegats * 0.20 +

            Math.min(
                100,
                scoreDomination
            ) * 0.25 +

            scoreEfficacite * 0.15;


        resultats.push({

            jid,

            pseudo:
                joueur.pseudo,

            scorePv,

            scoreStamina,

            scoreDegats,

            scoreDomination,

            scoreEfficacite,

            scoreFinal
        });
    }


    //----------------------------------------------------------
    // 🥇 CLASSEMENT
    //----------------------------------------------------------

    resultats.sort(
        (
            a,
            b
        ) =>
            b.scoreFinal -
            a.scoreFinal
    );


    const premier =
        resultats[0];


    const second =
        resultats[1];


    //----------------------------------------------------------
    // 🤝 ÉGALITÉ
    //----------------------------------------------------------

    const difference =
        Math.abs(
            premier.scoreFinal -
            second.scoreFinal
        );


    let vainqueur =
        premier.jid;


    let decision =
        "victoire";


    if (
        difference < 2
    ) {

        vainqueur = null;

        decision =
            "egalite";
    }


    //----------------------------------------------------------
    // 🏁 FIN
    //----------------------------------------------------------

    combat.phase =
        "termine";


    combat.decisionFinale = {

        decision,

        vainqueur,

        scores:
            resultats,

        difference,

        tourFinal:
            combat.tour
    };


    return {

        succes: true,

        ...combat.decisionFinale
    };
}


//==============================================================
// 🔄 TERMINER UN TOUR
//==============================================================

function terminerTourCombatAllStars(
    combat
) {

    if (!combat) {

        return {

            succes: false
        };
    }


    //----------------------------------------------------------
    // 🚫 DÉJÀ TERMINÉ
    //----------------------------------------------------------

    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: false,

            raison:
                "Le combat est déjà terminé."
        };
    }


    //----------------------------------------------------------
    // 📊 DOMINATION
    //----------------------------------------------------------

    const domination =
        calculerDominationTourCombat(
            combat
        );


    //----------------------------------------------------------
    // 🔄 ÉTATS
    //----------------------------------------------------------

    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        avancerEffetsCombat(
            joueur
        );


        joueur.actionEnCours =
            null;
    }


    actualiserEtatCombatAllStars(
        combat
    );


    //----------------------------------------------------------
    // ☠️ FIN PRÉMATURÉE
    //----------------------------------------------------------

    const morts =
        (combat.ordre || [])
            .filter(
                jid => {

                    const joueur =
                        obtenirJoueurCombat(
                            combat,
                            jid
                        );


                    return (
                        joueur &&
                        joueur.etat ===
                        ETATS_COMBAT_ALLSTARS.MORT
                    );
                }
            );


    if (
        morts.length > 0
    ) {

        combat.phase =
            "termine";


        const vivants =
            combat.ordre.filter(
                jid =>
                    !morts.includes(jid)
            );


        combat.decisionFinale = {

            decision:
                "victoire_par_ko",

            vainqueur:
                vivants.length === 1
                    ? vivants[0]
                    : null,

            tourFinal:
                combat.tour,

            domination
        };


        return {

            succes: true,

            termine: true,

            raison:
                "Combat terminé avant la limite.",

            domination,

            decisionFinale:
                combat.decisionFinale
        };
    }


    //----------------------------------------------------------
    // 🔢 FIN DU TOUR
    //----------------------------------------------------------

    combat.tour++;


    //----------------------------------------------------------
    // 🏁 10 TOURS
    //----------------------------------------------------------

    if (
        combat.tour >=
        CONFIG_TOURS_ALLSTARS.MAX_TOURS
    ) {

        const decision =
            calculerDecisionFinaleCombat(
                combat
            );


        return {

            succes: true,

            termine: true,

            tour:
                combat.tour,

            domination,

            decisionFinale:
                decision
        };
    }


    //----------------------------------------------------------
    // 🔄 NOUVEAU TOUR
    //----------------------------------------------------------

    combat.tourActuel = {

        numero:
            combat.tour + 1,

        joueursAyantJoue: [],

        actions: [],

        resolutionEffectuee: false,

        termine: false
    };


    return {

        succes: true,

        termine: false,

        tour:
            combat.tour,

        prochainTour:
            combat.tour + 1,

        domination
    };
}


//==============================================================
// ⚔️ TRAITER LA FIN D'UN ÉCHANGE COMPLET
//==============================================================

function resoudreTourCombatAllStars(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    //----------------------------------------------------------
    // 🔎 VÉRIFICATION
    //----------------------------------------------------------

    if (
        !tousLesJoueursOntJoueTourCombat(
            combat
        )
    ) {

        return {

            succes: false,

            termine: false,

            raison:
                "Tous les joueurs n'ont pas encore joué."
        };
    }


    //----------------------------------------------------------
    // ⚔️ PRÉPARER
    //----------------------------------------------------------

    const preparation =
        preparerActionsTourCombat(
            combat
        );


    //----------------------------------------------------------
    // 💥 RÉSOLUTION
    //----------------------------------------------------------

    const resolution =
        resoudreActionsPhysiquesCombat(
            combat
        );


    combat.tourActuel
        .resolutionEffectuee = true;


    //----------------------------------------------------------
    // 📊 ENREGISTRER
    //----------------------------------------------------------

    for (
        let i = 0;

        i < resolution.resultats.length;

        i++
    ) {

        const element =
            resolution.resultats[i];


        enregistrerResultatTourCombat({

            combat,

            action:
                element.action,

            resultat:
                element.resultat
        });
    }


    //----------------------------------------------------------
    // 🔄 TERMINER
    //----------------------------------------------------------

    const fin =
        terminerTourCombatAllStars(
            combat
        );


    return {

        succes: true,

        tour:
            combat.tour,

        preparation,

        resolution,

        fin
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Système de tours ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — SYSTÈME DE TOURS
//==============================================================
// Un TOUR représente un échange COMPLET.
//
// TOUR 1
//
// Joueur 1 joue
//      ↓
// Joueur 2 joue
//      ↓
// Résolution
//      ↓
// Mise à jour du combat
//      ↓
// Calcul de domination
//      ↓
// FIN DU TOUR
//
// Puis :
// tour 2
// tour 3
// ...
// tour 10
//
// À la fin du 10e tour :
// décision finale.
//==============================================================


//==============================================================
// ⚙️ CONFIGURATION DES TOURS
//==============================================================

const CONFIG_TOURS_ALLSTARS = {

    MAX_TOURS: 10,

    JOUEURS_PAR_TOUR: 2,

    DECISION_APRES_MAX_TOURS: true
};


//==============================================================
// 📊 INITIALISER LE TRACKER DE TOUR
//==============================================================

function initialiserToursCombatAllStars(
    combat
) {

    if (!combat) {
        return null;
    }


    combat.tour = 0;

    combat.sequence = 0;


    //----------------------------------------------------------
    // ACTIONS DU TOUR
    //----------------------------------------------------------

    combat.tourActuel = {

        numero: 1,

        joueursAyantJoue: [],

        actions: [],

        resolutionEffectuee: false,

        termine: false
    };


    //----------------------------------------------------------
    // DOMINATION
    //----------------------------------------------------------

    combat.domination = {};


    for (
        const jid of combat.ordre || []
    ) {

        combat.domination[jid] = {

            score: 0,

            attaquesReussies: 0,

            attaquesRatees: 0,

            coupsPortes: 0,

            coupsRecus: 0,

            degatsInfliges: 0,

            degatsRecus: 0,

            esquives: 0,

            blocages: 0,

            contres: 0,

            saisies: 0,

            actionsReussies: 0,

            actionsRatees: 0,

            tempsDominant: 0
        };
    }


    //----------------------------------------------------------
    // ÉTAT
    //----------------------------------------------------------

    combat.phase =
        "combat";


    return combat;
}


//==============================================================
// 👤 VÉRIFIER SI LE JOUEUR A DÉJÀ JOUÉ
//==============================================================

function joueurADejaJoueTourCombat(
    combat,
    jid
) {

    if (
        !combat ||
        !combat.tourActuel
    ) {

        return false;
    }


    return combat.tourActuel
        .joueursAyantJoue
        .includes(jid);
}


//==============================================================
// 👤 ENREGISTRER L'ACTION DU JOUEUR
//==============================================================

function enregistrerActionTourCombat({

    combat,

    jid,

    action

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    if (!combat.tourActuel) {

        initialiserToursCombatAllStars(
            combat
        );
    }


    //----------------------------------------------------------
    // 🚫 JOUEUR INCONNU
    //----------------------------------------------------------

    if (
        !combat.ordre.includes(jid)
    ) {

        return {

            succes: false,

            raison:
                "Le joueur ne participe pas à ce combat."
        };
    }


    //----------------------------------------------------------
    // 🚫 A DÉJÀ JOUÉ
    //----------------------------------------------------------

    if (
        joueurADejaJoueTourCombat(
            combat,
            jid
        )
    ) {

        return {

            succes: false,

            raison:
                "Ce joueur a déjà joué pendant ce tour."
        };
    }


    //----------------------------------------------------------
    // 📝 ENREGISTREMENT
    //----------------------------------------------------------

    combat.tourActuel
        .joueursAyantJoue
        .push(jid);


    combat.tourActuel
        .actions
        .push(action);


    return {

        succes: true,

        joueursAyantJoue:
            [
                ...combat.tourActuel
                    .joueursAyantJoue
            ]
    };
}


//==============================================================
// 🔎 VÉRIFIER SI LES DEUX JOUEURS ONT JOUÉ
//==============================================================

function tousLesJoueursOntJoueTourCombat(
    combat
) {

    if (!combat) {
        return false;
    }


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length === 0
    ) {

        return false;
    }


    return joueurs.every(
        jid =>
            combat.tourActuel
                ?.joueursAyantJoue
                ?.includes(jid)
    );
}


//==============================================================
// ⚔️ PRÉPARER LES ACTIONS DU TOUR
//==============================================================

function preparerActionsTourCombat(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            actions: []
        };
    }


    if (
        !combat.tourActuel
    ) {

        initialiserToursCombatAllStars(
            combat
        );
    }


    const actions =
        combat.tourActuel.actions || [];


    //----------------------------------------------------------
    // 📦 COPIE
    //----------------------------------------------------------

    const actionsResolution = [];


    for (
        const action of actions
    ) {

        if (!action) {
            continue;
        }


        actionsResolution.push({

            ...action,

            tour:
                combat.tourActuel.numero
        });
    }


    //----------------------------------------------------------
    // 📥 AJOUT AUX ACTIONS DU COMBAT
    //----------------------------------------------------------

    combat.actionsEnCours.push(
        ...actionsResolution
    );


    return {

        succes: true,

        actions:
            actionsResolution
    };
}


//==============================================================
// 📊 ENREGISTRER LES STATISTIQUES D'UNE RÉSOLUTION
//==============================================================

function enregistrerResultatTourCombat({

    combat,

    action,

    resultat

} = {}) {


    if (
        !combat ||
        !action
    ) {

        return;
    }


    const jid =
        action.jid;


    const stats =
        combat.domination?.[jid];


    if (!stats) {
        return;
    }


    const resultatReel =
        resultat?.resultat ??
        resultat?.resultat?.resultat ??
        null;


    //----------------------------------------------------------
    // 📊 ACTION RÉUSSIE
    //----------------------------------------------------------

    if (
        resultat?.succes
    ) {

        stats.actionsReussies++;
    }


    //----------------------------------------------------------
    // 📊 ACTION RATÉE
    //----------------------------------------------------------

    else {

        stats.actionsRatees++;
    }


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        if (
            resultatReel ===
            RESULTATS_COMBAT_ALLSTARS.IMPACT
        ) {

            stats.attaquesReussies++;

        } else {

            stats.attaquesRatees++;
        }
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        stats.esquives++;
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.BLOQUE
    ) {

        stats.blocages++;
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        resultatReel ===
        RESULTATS_COMBAT_ALLSTARS.CONTRE
    ) {

        stats.contres++;
    }


    //----------------------------------------------------------
    // 💥 DÉGÂTS
    //----------------------------------------------------------

    const degats =
        resultat?.degats?.degats ??
        resultat?.resultat?.degats?.degats ??
        0;


    stats.degatsInfliges +=
        Number(degats) || 0;
}


//==============================================================
// 📊 CALCULER LES DÉGÂTS REÇUS
//==============================================================

function actualiserDegatsRecusTourCombat(
    combat
) {

    if (!combat) {
        return;
    }


    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        const stats =
            combat.domination?.[jid];


        if (
            !joueur ||
            !stats
        ) {

            continue;
        }


        //------------------------------------------------------
        // PV PERDUS
        //------------------------------------------------------

        const pvMax =
            Number(
                joueur.pvMax
            ) || 100;


        const pv =
            Number(
                joueur.pv
            ) || 0;


        const totalDegatsSubis =
            pvMax - pv;


        stats.degatsRecus =
            Math.max(
                0,
                totalDegatsSubis
            );
    }
}


//==============================================================
// 👑 CALCUL DE DOMINATION DU TOUR
//==============================================================
// La domination mesure qui a réellement pris le dessus.
//
// Elle ne correspond PAS simplement aux dégâts.
//==============================================================

function calculerDominationTourCombat(
    combat
) {

    if (!combat) {
        return null;
    }


    actualiserDegatsRecusTourCombat(
        combat
    );


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length < 2
    ) {

        return null;
    }


    const j1 =
        joueurs[0];


    const j2 =
        joueurs[1];


    const s1 =
        combat.domination[j1];


    const s2 =
        combat.domination[j2];


    //----------------------------------------------------------
    // 📊 SCORE BRUT
    //----------------------------------------------------------

    const score1 =

        s1.degatsInfliges * 0.40 +

        s1.attaquesReussies * 5 +

        s1.esquives * 4 +

        s1.blocages * 3 +

        s1.contres * 7 +

        s1.actionsReussies * 2;


    const score2 =

        s2.degatsInfliges * 0.40 +

        s2.attaquesReussies * 5 +

        s2.esquives * 4 +

        s2.blocages * 3 +

        s2.contres * 7 +

        s2.actionsReussies * 2;


    //----------------------------------------------------------
    // 📈 AVANTAGE DU TOUR
    //----------------------------------------------------------

    const difference =
        score1 - score2;


    let gagnantTour = null;


    if (
        difference > 0
    ) {

        gagnantTour =
            j1;

    } else if (
        difference < 0
    ) {

        gagnantTour =
            j2;
    }


    //----------------------------------------------------------
    // 👑 DOMINATION
    //----------------------------------------------------------

    if (gagnantTour) {

        combat.domination[
            gagnantTour
        ].tempsDominant++;
    }


    return {

        j1: {

            jid:
                j1,

            score:
                score1
        },

        j2: {

            jid:
                j2,

            score:
                score2
        },

        difference,

        gagnantTour
    };
}


//==============================================================
// ❤️ SCORE PV
//==============================================================

function calculerScorePvDecisionCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    const pv =
        Number(
            joueur.pv
        ) || 0;


    const pvMax =
        Number(
            joueur.pvMax
        ) || 100;


    if (
        pvMax <= 0
    ) {

        return 0;
    }


    return (
        pv /
        pvMax
    ) * 100;
}


//==============================================================
// 🔋 SCORE STAMINA
//==============================================================

function calculerScoreStaminaDecisionCombat(
    joueur
) {

    if (!joueur) {
        return 0;
    }


    return Math.max(
        0,
        Math.min(
            100,
            Number(
                joueur.stamina
            ) || 0
        )
    );
}


//==============================================================
// ⚔️ SCORE DOMINATION FINAL
//==============================================================

function calculerScoreDominationFinalCombat(
    combat,
    jid
) {

    const stats =
        combat.domination?.[jid];


    if (!stats) {
        return 0;
    }


    //----------------------------------------------------------
    // SCORE DE BASE
    //----------------------------------------------------------

    let score = 0;


    score +=
        stats.degatsInfliges *
        0.40;


    score +=
        stats.attaquesReussies *
        5;


    score +=
        stats.esquives *
        4;


    score +=
        stats.blocages *
        3;


    score +=
        stats.contres *
        7;


    score +=
        stats.saisies *
        5;


    score +=
        stats.actionsReussies *
        2;


    //----------------------------------------------------------
    // DOMINATION DES TOURS
    //----------------------------------------------------------

    score +=
        stats.tempsDominant *
        10;


    return score;
}


//==============================================================
// 🏆 DÉCISION FINALE APRÈS 10 TOURS
//==============================================================
// Pondération :
//
// PV          = 25 %
// STAMINA     = 15 %
// DÉGÂTS      = 20 %
// DOMINATION  = 25 %
// EFFICACITÉ  = 15 %
//==============================================================

function calculerDecisionFinaleCombat(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const joueurs =
        combat.ordre || [];


    if (
        joueurs.length < 2
    ) {

        return {

            succes: false,

            raison:
                "Deux joueurs sont nécessaires."
        };
    }


    const resultats = [];


    //----------------------------------------------------------
    // 📊 SCORES
    //----------------------------------------------------------

    for (
        const jid of joueurs
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        const stats =
            combat.domination[jid];


        if (!joueur) {
            continue;
        }


        //------------------------------------------------------
        // ❤️ PV
        //------------------------------------------------------

        const scorePv =
            calculerScorePvDecisionCombat(
                joueur
            );


        //------------------------------------------------------
        // 🔋 STAMINA
        //------------------------------------------------------

        const scoreStamina =
            calculerScoreStaminaDecisionCombat(
                joueur
            );


        //------------------------------------------------------
        // ⚔️ DÉGÂTS
        //------------------------------------------------------

        const totalDegats =
            Math.max(
                1,

                Number(
                    stats.degatsInfliges
                ) +
                Number(
                    stats.degatsRecus
                )
            );


        const scoreDegats =
            (
                Number(
                    stats.degatsInfliges
                ) /
                totalDegats
            ) * 100;


        //------------------------------------------------------
        // 👑 DOMINATION
        //------------------------------------------------------

        const scoreDomination =
            calculerScoreDominationFinalCombat(
                combat,
                jid
            );


        //------------------------------------------------------
        // 📈 EFFICACITÉ
        //------------------------------------------------------

        const totalActions =
            Math.max(
                1,

                Number(
                    stats.actionsReussies
                ) +
                Number(
                    stats.actionsRatees
                )
            );


        const scoreEfficacite =
            (
                Number(
                    stats.actionsReussies
                ) /
                totalActions
            ) * 100;


        //------------------------------------------------------
        // 🏆 SCORE FINAL
        //------------------------------------------------------

        const scoreFinal =

            scorePv * 0.25 +

            scoreStamina * 0.15 +

            scoreDegats * 0.20 +

            Math.min(
                100,
                scoreDomination
            ) * 0.25 +

            scoreEfficacite * 0.15;


        resultats.push({

            jid,

            pseudo:
                joueur.pseudo,

            scorePv,

            scoreStamina,

            scoreDegats,

            scoreDomination,

            scoreEfficacite,

            scoreFinal
        });
    }


    //----------------------------------------------------------
    // 🥇 CLASSEMENT
    //----------------------------------------------------------

    resultats.sort(
        (
            a,
            b
        ) =>
            b.scoreFinal -
            a.scoreFinal
    );


    const premier =
        resultats[0];


    const second =
        resultats[1];


    //----------------------------------------------------------
    // 🤝 ÉGALITÉ
    //----------------------------------------------------------

    const difference =
        Math.abs(
            premier.scoreFinal -
            second.scoreFinal
        );


    let vainqueur =
        premier.jid;


    let decision =
        "victoire";


    if (
        difference < 2
    ) {

        vainqueur = null;

        decision =
            "egalite";
    }


    //----------------------------------------------------------
    // 🏁 FIN
    //----------------------------------------------------------

    combat.phase =
        "termine";


    combat.decisionFinale = {

        decision,

        vainqueur,

        scores:
            resultats,

        difference,

        tourFinal:
            combat.tour
    };


    return {

        succes: true,

        ...combat.decisionFinale
    };
}


//==============================================================
// 🔄 TERMINER UN TOUR
//==============================================================

function terminerTourCombatAllStars(
    combat
) {

    if (!combat) {

        return {

            succes: false
        };
    }


    //----------------------------------------------------------
    // 🚫 DÉJÀ TERMINÉ
    //----------------------------------------------------------

    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: false,

            raison:
                "Le combat est déjà terminé."
        };
    }


    //----------------------------------------------------------
    // 📊 DOMINATION
    //----------------------------------------------------------

    const domination =
        calculerDominationTourCombat(
            combat
        );


    //----------------------------------------------------------
    // 🔄 ÉTATS
    //----------------------------------------------------------

    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        avancerEffetsCombat(
            joueur
        );


        joueur.actionEnCours =
            null;
    }


    actualiserEtatCombatAllStars(
        combat
    );


    //----------------------------------------------------------
    // ☠️ FIN PRÉMATURÉE
    //----------------------------------------------------------

    const morts =
        (combat.ordre || [])
            .filter(
                jid => {

                    const joueur =
                        obtenirJoueurCombat(
                            combat,
                            jid
                        );


                    return (
                        joueur &&
                        joueur.etat ===
                        ETATS_COMBAT_ALLSTARS.MORT
                    );
                }
            );


    if (
        morts.length > 0
    ) {

        combat.phase =
            "termine";


        const vivants =
            combat.ordre.filter(
                jid =>
                    !morts.includes(jid)
            );


        combat.decisionFinale = {

            decision:
                "victoire_par_ko",

            vainqueur:
                vivants.length === 1
                    ? vivants[0]
                    : null,

            tourFinal:
                combat.tour,

            domination
        };


        return {

            succes: true,

            termine: true,

            raison:
                "Combat terminé avant la limite.",

            domination,

            decisionFinale:
                combat.decisionFinale
        };
    }


    //----------------------------------------------------------
    // 🔢 FIN DU TOUR
    //----------------------------------------------------------

    combat.tour++;


    //----------------------------------------------------------
    // 🏁 10 TOURS
    //----------------------------------------------------------

    if (
        combat.tour >=
        CONFIG_TOURS_ALLSTARS.MAX_TOURS
    ) {

        const decision =
            calculerDecisionFinaleCombat(
                combat
            );


        return {

            succes: true,

            termine: true,

            tour:
                combat.tour,

            domination,

            decisionFinale:
                decision
        };
    }


    //----------------------------------------------------------
    // 🔄 NOUVEAU TOUR
    //----------------------------------------------------------

    combat.tourActuel = {

        numero:
            combat.tour + 1,

        joueursAyantJoue: [],

        actions: [],

        resolutionEffectuee: false,

        termine: false
    };


    return {

        succes: true,

        termine: false,

        tour:
            combat.tour,

        prochainTour:
            combat.tour + 1,

        domination
    };
}


//==============================================================
// ⚔️ TRAITER LA FIN D'UN ÉCHANGE COMPLET
//==============================================================

function resoudreTourCombatAllStars(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    //----------------------------------------------------------
    // 🔎 VÉRIFICATION
    //----------------------------------------------------------

    if (
        !tousLesJoueursOntJoueTourCombat(
            combat
        )
    ) {

        return {

            succes: false,

            termine: false,

            raison:
                "Tous les joueurs n'ont pas encore joué."
        };
    }


    //----------------------------------------------------------
    // ⚔️ PRÉPARER
    //----------------------------------------------------------

    const preparation =
        preparerActionsTourCombat(
            combat
        );


    //----------------------------------------------------------
    // 💥 RÉSOLUTION
    //----------------------------------------------------------

    const resolution =
        resoudreActionsPhysiquesCombat(
            combat
        );


    combat.tourActuel
        .resolutionEffectuee = true;


    //----------------------------------------------------------
    // 📊 ENREGISTRER
    //----------------------------------------------------------

    for (
        let i = 0;

        i < resolution.resultats.length;

        i++
    ) {

        const element =
            resolution.resultats[i];


        enregistrerResultatTourCombat({

            combat,

            action:
                element.action,

            resultat:
                element.resultat
        });
    }


    //----------------------------------------------------------
    // 🔄 TERMINER
    //----------------------------------------------------------

    const fin =
        terminerTourCombatAllStars(
            combat
        );


    return {

        succes: true,

        tour:
            combat.tour,

        preparation,

        resolution,

        fin
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Système de tours ALL STARS chargé."
);

//==============================================================
// 🧠 ALL STARS — INTERPRÉTEUR DU PAVÉ JOUEUR
//==============================================================
// Transforme le texte libre du joueur en INTENTION structurée.
//
// IMPORTANT :
// Ce système ne décide PAS si l'action réussit.
//
// Il répond uniquement à :
// "Qu'est-ce que le joueur essaie de faire ?"
//
// Exemple :
//
// "Je fonce vers lui et lui donne un coup de poing au visage."
//
// devient :
//
// déplacement
// attaque
// cible = visage
// arme = poing
//
// L'ARBITRE décidera ensuite si cela est possible.
//==============================================================


//==============================================================
// 🎮 TYPES D'ACTIONS
//==============================================================

const ACTIONS_COMBAT_ALLSTARS = {

    ATTAQUE: "attaque",

    DEFENSE: "defense",

    ESQUIVE: "esquive",

    DEPLACEMENT: "deplacement",

    SAISIE: "saisie",

    CONTRE: "contre",

    TECHNIQUE: "technique",

    RECUPERATION: "recuperation",

    ATTENTE: "attente"
};


//==============================================================
// 🎯 TYPES DE CIBLES
//==============================================================

const CIBLES_COMBAT_ALLSTARS = {

    TETE: "tete",

    VISAGE: "visage",

    COU: "cou",

    TORSE: "torse",

    ABDOMEN: "abdomen",

    DOS: "dos",

    BRAS_GAUCHE: "brasGauche",

    BRAS_DROIT: "brasDroit",

    JAMBE_GAUCHE: "jambeGauche",

    JAMBE_DROITE: "jambeDroite",

    CORPS: "corps",

    ADVERSAIRE: "adversaire",

    INCONNUE: null
};


//==============================================================
// 🧭 DIRECTIONS
//==============================================================

const DIRECTIONS_COMBAT_ALLSTARS = {

    AVANT: "avant",

    ARRIERE: "arriere",

    GAUCHE: "gauche",

    DROITE: "droite",

    HAUT: "haut",

    BAS: "bas",

    CIBLE: "vers_cible",

    INCONNUE: null
};


//==============================================================
// 🧹 NORMALISATION DU TEXTE
//==============================================================

function normaliserTexteCombat(
    texte
) {

    return String(
        texte ?? ""
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[’']/g,
            "'"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


//==============================================================
// 🔎 DÉTECTION D'UN MOT
//==============================================================

function texteContientMotCombat(
    texte,
    mots = []
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    return mots.some(
        mot =>
            texteNormalise.includes(
                normaliserTexteCombat(
                    mot
                )
            )
    );
}


//==============================================================
// ⚔️ DÉTECTION ATTAQUE
//==============================================================

function detecterAttaqueCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "attaque",

            "frappe",

            "frapper",

            "coup",

            "poing",

            "coup de poing",

            "pied",

            "coup de pied",

            "genou",

            "coude",

            "assene",

            "assener",

            "tape",

            "taper",

            "percute",

            "percuter",

            "ecrase",

            "ecraser",

            "matraque"
        ]
    );
}


//==============================================================
// 🛡️ DÉTECTION DÉFENSE
//==============================================================

function detecterDefenseCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "defend",

            "defendre",

            "bloque",

            "bloquer",

            "blocage",

            "pare",

            "parer",

            "garde",

            "proteger",

            "protege",

            "encaisse"
        ]
    );
}


//==============================================================
// 💨 DÉTECTION ESQUIVE
//==============================================================

function detecterEsquiveCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "esquive",

            "esquiver",

            "evite",

            "eviter",

            "se decale",

            "decaler",

            "roule",

            "roulade",

            "saute",

            "bondit",

            "bondir",

            "se baisse",

            "baisse"
        ]
    );
}


//==============================================================
// 🏃 DÉTECTION DÉPLACEMENT
//==============================================================

function detecterDeplacementCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "avance",

            "avancer",

            "recule",

            "reculer",

            "approche",

            "approcher",

            "eloigne",

            "eloigner",

            "fonce",

            "foncer",

            "cours",

            "courir",

            "se deplace",

            "deplace",

            "bouge",

            "bondit",

            "sprint"
        ]
    );
}


//==============================================================
// 🤼 DÉTECTION SAISIE
//==============================================================

function detecterSaisieCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "saisit",

            "saisir",

            "attrape",

            "attraper",

            "agrippe",

            "agripper",

            "empoigne",

            "empoigner",

            "serre",

            "serrer",

            "maintient",

            "maintenir",

            "immobilise",

            "immobiliser",

            "prise",

            "grapple"
        ]
    );
}


//==============================================================
// 🔄 DÉTECTION CONTRE
//==============================================================

function detecterContreCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "contre",

            "contre-attaque",

            "contre attaque",

            "riposte",

            "riposter",

            "renvoie",

            "renvoyer"
        ]
    );
}


//==============================================================
// ⚡ DÉTECTION TECHNIQUE
//==============================================================

function detecterTechniqueCombat(
    texte
) {

    return texteContientMotCombat(
        texte,
        [

            "technique",

            "pouvoir",

            "capacite",

            "competence",

            "special",

            "ultime",

            "attaque speciale",

            "technique speciale"
        ]
    );
}


//==============================================================
// 🎯 DÉTECTION DE LA CIBLE
//==============================================================

function detecterCibleCombat(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    //----------------------------------------------------------
    // 👤 VISAGE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "visage"
        ) ||
        texteNormalise.includes(
            "face"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.VISAGE;
    }


    //----------------------------------------------------------
    // 🧠 TÊTE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "tete"
        ) ||
        texteNormalise.includes(
            "crane"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.TETE;
    }


    //----------------------------------------------------------
    // 🦴 COU
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "cou"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.COU;
    }


    //----------------------------------------------------------
    // 💪 BRAS DROIT
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "bras droit"
        ) ||
        texteNormalise.includes(
            "droit"
        ) &&
        texteNormalise.includes(
            "bras"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.BRAS_DROIT;
    }


    //----------------------------------------------------------
    // 💪 BRAS GAUCHE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "bras gauche"
        ) ||
        texteNormalise.includes(
            "gauche"
        ) &&
        texteNormalise.includes(
            "bras"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.BRAS_GAUCHE;
    }


    //----------------------------------------------------------
    // 🦵 JAMBE DROITE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "jambe droite"
        ) ||
        texteNormalise.includes(
            "droit"
        ) &&
        texteNormalise.includes(
            "jambe"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.JAMBE_DROITE;
    }


    //----------------------------------------------------------
    // 🦵 JAMBE GAUCHE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "jambe gauche"
        ) ||
        texteNormalise.includes(
            "gauche"
        ) &&
        texteNormalise.includes(
            "jambe"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.JAMBE_GAUCHE;
    }


    //----------------------------------------------------------
    // 🫀 TORSE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "torse"
        ) ||
        texteNormalise.includes(
            "poitrine"
        ) ||
        texteNormalise.includes(
            "ventre"
        ) ||
        texteNormalise.includes(
            "abdomen"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.TORSE;
    }


    //----------------------------------------------------------
    // 🧍 CORPS
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "corps"
        )
    ) {

        return CIBLES_COMBAT_ALLSTARS.CORPS;
    }


    //----------------------------------------------------------
    // ❔ INCONNUE
    //----------------------------------------------------------

    return CIBLES_COMBAT_ALLSTARS.INCONNUE;
}


//==============================================================
// 🧭 DÉTECTION DIRECTION
//==============================================================

function detecterDirectionCombat(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    if (
        texteNormalise.includes(
            "avance"
        ) ||
        texteNormalise.includes(
            "vers lui"
        ) ||
        texteNormalise.includes(
            "vers elle"
        ) ||
        texteNormalise.includes(
            "approche"
        ) ||
        texteNormalise.includes(
            "fonce vers"
        )
    ) {

        return DIRECTIONS_COMBAT_ALLSTARS.AVANT;
    }


    if (
        texteNormalise.includes(
            "recule"
        ) ||
        texteNormalise.includes(
            "en arriere"
        )
    ) {

        return DIRECTIONS_COMBAT_ALLSTARS.ARRIERE;
    }


    if (
        texteNormalise.includes(
            "a gauche"
        ) ||
        texteNormalise.includes(
            "sur la gauche"
        )
    ) {

        return DIRECTIONS_COMBAT_ALLSTARS.GAUCHE;
    }


    if (
        texteNormalise.includes(
            "a droite"
        ) ||
        texteNormalise.includes(
            "sur la droite"
        )
    ) {

        return DIRECTIONS_COMBAT_ALLSTARS.DROITE;
    }


    return DIRECTIONS_COMBAT_ALLSTARS.INCONNUE;
}


//==============================================================
// 🥊 TYPE D'ATTAQUE
//==============================================================

function detecterTypeAttaqueCombat(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    if (
        texteNormalise.includes(
            "poing"
        ) ||
        texteNormalise.includes(
            "coup de poing"
        )
    ) {

        return "poing";
    }


    if (
        texteNormalise.includes(
            "pied"
        ) ||
        texteNormalise.includes(
            "coup de pied"
        ) ||
        texteNormalise.includes(
            "coup de pied circulaire"
        )
    ) {

        return "pied";
    }


    if (
        texteNormalise.includes(
            "genou"
        )
    ) {

        return "genou";
    }


    if (
        texteNormalise.includes(
            "coude"
        )
    ) {

        return "coude";
    }


    if (
        texteNormalise.includes(
            "coup"
        ) ||
        texteNormalise.includes(
            "frappe"
        )
    ) {

        return "frappe";
    }


    return null;
}


//==============================================================
// 🏃 INTENSITÉ DU DÉPLACEMENT
//==============================================================

function detecterIntensiteDeplacementCombat(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    if (
        texteNormalise.includes(
            "sprint"
        ) ||
        texteNormalise.includes(
            "fonce"
        ) ||
        texteNormalise.includes(
            "a toute vitesse"
        ) ||
        texteNormalise.includes(
            "rapidement"
        )
    ) {

        return "rapide";
    }


    if (
        texteNormalise.includes(
            "lentement"
        ) ||
        texteNormalise.includes(
            "doucement"
        )
    ) {

        return "lent";
    }


    return "normal";
}


//==============================================================
// 📏 DÉTECTION DISTANCE
//==============================================================

function detecterDistanceCombatTexte(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    //----------------------------------------------------------
    // 📏 DISTANCE NUMÉRIQUE
    //----------------------------------------------------------

    const match =
        texteNormalise.match(
            /(\d+(?:[.,]\d+)?)\s*(m|metres|metre)/
        );


    if (match) {

        return Number(
            match[1]
                .replace(",", ".")
        );
    }


    //----------------------------------------------------------
    // 🔵 PROCHE
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "tres pres"
        ) ||
        texteNormalise.includes(
            "au contact"
        ) ||
        texteNormalise.includes(
            "a bout portant"
        )
    ) {

        return 1;
    }


    if (
        texteNormalise.includes(
            "pres"
        ) ||
        texteNormalise.includes(
            "proche"
        )
    ) {

        return 2;
    }


    //----------------------------------------------------------
    // 🔴 LOIN
    //----------------------------------------------------------

    if (
        texteNormalise.includes(
            "loin"
        ) ||
        texteNormalise.includes(
            "a distance"
        )
    ) {

        return 10;
    }


    return null;
}


//==============================================================
// 🔗 EXTRAIRE LES ÉTAPES D'UNE ACTION
//==============================================================
// Exemple :
//
// "Je cours vers lui puis je frappe son visage"
//
// → ["je cours vers lui", "je frappe son visage"]
//==============================================================

function decouperSequenceCombat(
    texte
) {

    const texteNormalise =
        normaliserTexteCombat(
            texte
        );


    return texteNormalise
        .split(
            /\s+(?:puis|ensuite|et ensuite|avant de|apres avoir|tout en)\s+/
        )
        .map(
            morceau =>
                morceau.trim()
        )
        .filter(
            Boolean
        );
}


//==============================================================
// 🧠 CLASSIFIER UNE ACTION
//==============================================================

function classifierActionCombat(
    morceau
) {

    const attaque =
        detecterAttaqueCombat(
            morceau
        );


    const defense =
        detecterDefenseCombat(
            morceau
        );


    const esquive =
        detecterEsquiveCombat(
            morceau
        );


    const deplacement =
        detecterDeplacementCombat(
            morceau
        );


    const saisie =
        detecterSaisieCombat(
            morceau
        );


    const contre =
        detecterContreCombat(
            morceau
        );


    const technique =
        detecterTechniqueCombat(
            morceau
        );


    //----------------------------------------------------------
    // PRIORITÉ
    //----------------------------------------------------------

    if (contre) {

        return ACTIONS_COMBAT_ALLSTARS.CONTRE;
    }


    if (technique) {

        return ACTIONS_COMBAT_ALLSTARS.TECHNIQUE;
    }


    if (saisie) {

        return ACTIONS_COMBAT_ALLSTARS.SAISIE;
    }


    if (attaque) {

        return ACTIONS_COMBAT_ALLSTARS.ATTAQUE;
    }


    if (esquive) {

        return ACTIONS_COMBAT_ALLSTARS.ESQUIVE;
    }


    if (defense) {

        return ACTIONS_COMBAT_ALLSTARS.DEFENSE;
    }


    if (deplacement) {

        return ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT;
    }


    return ACTIONS_COMBAT_ALLSTARS.ATTENTE;
}


//==============================================================
// 🧩 CONSTRUIRE UNE ACTION STRUCTURÉE
//==============================================================

function construireActionInterpreteeCombat({

    morceau,

    index = 0

} = {}) {


    const type =
        classifierActionCombat(
            morceau
        );


    const cible =
        detecterCibleCombat(
            morceau
        );


    const direction =
        detecterDirectionCombat(
            morceau
        );


    const distance =
        detecterDistanceCombatTexte(
            morceau
        );


    const action = {

        index,

        texteOriginal:
            morceau,

        type,

        cible,

        direction,

        distance,

        intention: {

            type,

            cible,

            direction,

            distance
        },

        details: {}
    };


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        action.details = {

            typeAttaque:
                detecterTypeAttaqueCombat(
                    morceau
                ),

            puissanceDeclaree:
                texteContientMotCombat(
                    morceau,
                    [
                        "puissant",
                        "fort",
                        "de toutes mes forces",
                        "maximum"
                    ]
                )
        };
    }


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT
    ) {

        action.details = {

            intensite:
                detecterIntensiteDeplacementCombat(
                    morceau
                )
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        action.details = {

            direction,

            intensite:
                detecterIntensiteDeplacementCombat(
                    morceau
                )
        };
    }


    //----------------------------------------------------------
    // 🤼 SAISIE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.SAISIE
    ) {

        action.details = {

            zoneSaisie:
                cible
        };
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        action.details = {

            reaction:
                "contre_action_adverse"
        };
    }


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    if (
        type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        action.details = {

            mode:
                "blocage"
        };
    }


    return action;
}


//==============================================================
// 🧠 INTERPRÉTER LE PAVÉ COMPLET
//==============================================================

function interpreterPaveCombat({

    texte,

    joueur = null,

    combat = null

} = {}) {


    //----------------------------------------------------------
    // ❌ TEXTE VIDE
    //----------------------------------------------------------

    if (
        !texte ||
        !String(texte).trim()
    ) {

        return {

            succes: false,

            raison:
                "Pavé vide.",

            actions: []
        };
    }


    const texteOriginal =
        String(texte).trim();


    //----------------------------------------------------------
    // ✂️ DÉCOUPAGE
    //----------------------------------------------------------

    const morceaux =
        decouperSequenceCombat(
            texteOriginal
        );


    //----------------------------------------------------------
    // 🧩 CONSTRUCTION
    //----------------------------------------------------------

    const actions =
        morceaux.map(

            (
                morceau,
                index
            ) =>

                construireActionInterpreteeCombat({

                    morceau,

                    index
                })
        );


    //----------------------------------------------------------
    // 🧹 SUPPRESSION DES ATTENTES
    //----------------------------------------------------------

    const actionsUtiles =
        actions.filter(
            action =>
                action.type !==
                ACTIONS_COMBAT_ALLSTARS.ATTENTE
        );


    //----------------------------------------------------------
    // 🆔 ID
    //----------------------------------------------------------

    const intentionId =
        `INT_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;


    //----------------------------------------------------------
    // 📦 RÉSULTAT
    //----------------------------------------------------------

    const interpretation = {

        id:
            intentionId,

        joueurJid:
            joueur?.jid ??
            null,

        texteOriginal,

        actions:
            actionsUtiles,

        nombreActions:
            actionsUtiles.length,

        ciblePrincipale:
            actionsUtiles.find(
                action =>
                    action.cible
            )?.cible ??
            null,

        intentionPrincipale:
            actionsUtiles[0]?.type ??
            ACTIONS_COMBAT_ALLSTARS.ATTENTE
    };


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    if (
        combat &&
        Array.isArray(
            combat.historique
        )
    ) {

        combat.historique.push({

            type:
                "interpretation",

            intentionId,

            jid:
                joueur?.jid ??
                null,

            texte:
                texteOriginal,

            actions:
                actionsUtiles,

            temps:
                combat.temps,

            tour:
                combat.tour
        });
    }


    return {

        succes: true,

        interpretation
    };
}


//==============================================================
// 🎯 TRANSFORMER L'INTERPRÉTATION EN ACTION DE COMBAT
//==============================================================
// Cette fonction ne valide toujours PAS l'action.
// Elle la prépare seulement pour l'arbitre.
//==============================================================

function preparerIntentionPourArbitreCombat({

    interpretation,

    joueur,

    cible = null

} = {}) {


    if (
        !interpretation
    ) {

        return {

            succes: false,

            raison:
                "Interprétation absente."
        };
    }


    const actions =
        interpretation.actions || [];


    return {

        succes: true,

        intention: {

            id:
                interpretation.id,

            joueurJid:
                joueur?.jid ??
                interpretation.joueurJid ??
                null,

            cibleJid:
                cible?.jid ??
                null,

            actions,

            texteOriginal:
                interpretation.texteOriginal,

            statut:
                "a_arbitrer"
        }
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "🧠 Interpréteur de pavé ALL STARS chargé."
);

//==============================================================
// ⚖️ ALL STARS — ARBITRE DE COMBAT
//==============================================================
// L'arbitre transforme les intentions des joueurs en résultats
// cohérents avec l'état réel du combat.
//
// ORDRE :
//
// PAVÉ JOUEUR
//      ↓
// INTERPRÉTEUR
//      ↓
// ARBITRE
//      ↓
// RÉSOLUTION
//
// L'arbitre vérifie notamment :
//
// - distance
// - position
// - état physique
// - stamina
// - énergie
// - vitesse
// - disponibilité des membres
// - cible
// - action adverse
// - règles de combat
//
// IMPORTANT :
// L'arbitre ne doit PAS favoriser un joueur.
// Il applique les mêmes règles aux deux.
//==============================================================


//==============================================================
// ⚖️ TYPES DE DÉCISIONS
//==============================================================

const DECISIONS_ARBITRE_ALLSTARS = {

    ACCEPTEE: "acceptee",

    PARTIELLE: "partielle",

    REFUSEE: "refusee",

    INTERCEPTEE: "interceptee",

    ESQUIVEE: "esquivee",

    BLOQUEE: "bloquee",

    CONTREE: "contree",

    IMPOSSIBLE: "impossible"
};


//==============================================================
// 📊 RÉSULTATS DE COMBAT
//==============================================================

const RESULTATS_COMBAT_ALLSTARS = {

    IMPACT: "impact",

    ESQUIVE: "esquive",

    BLOQUE: "bloque",

    CONTRE: "contre",

    SAISIE: "saisie",

    DEPLACEMENT: "deplacement",

    ECHEC: "echec",

    IMPOSSIBLE: "impossible",

    ATTENTE: "attente"
};


//==============================================================
// 🎯 RÉCUPÉRER L'ACTION PRINCIPALE
//==============================================================

function obtenirActionPrincipaleArbitre(
    intention
) {

    if (
        !intention ||
        !Array.isArray(
            intention.actions
        )
    ) {

        return null;
    }


    return (
        intention.actions.find(
            action =>
                action.type !==
                ACTIONS_COMBAT_ALLSTARS.ATTENTE
        ) ??
        null
    );
}


//==============================================================
// 🎯 RÉCUPÉRER LA CIBLE
//==============================================================

function obtenirCibleArbitre(
    combat,
    intention
) {

    if (
        !combat ||
        !intention
    ) {

        return null;
    }


    //----------------------------------------------------------
    // 🆔 CIBLE DIRECTE
    //----------------------------------------------------------

    if (
        intention.cibleJid
    ) {

        return obtenirJoueurCombat(
            combat,
            intention.cibleJid
        );
    }


    //----------------------------------------------------------
    // 👤 ADVERSAIRE AUTOMATIQUE
    //----------------------------------------------------------

    const joueur =
        obtenirJoueurCombat(
            combat,
            intention.joueurJid
        );


    if (!joueur) {
        return null;
    }


    return (
        combat.ordre
            .filter(
                jid =>
                    jid !==
                    joueur.jid
            )
            .map(
                jid =>
                    obtenirJoueurCombat(
                        combat,
                        jid
                    )
            )
            .find(
                Boolean
            ) ??
        null
    );
}


//==============================================================
// 📏 VÉRIFICATION DE PORTÉE
//==============================================================

function verifierPorteeArbitre({

    joueur,

    cible,

    action

} = {}) {


    if (
        !joueur ||
        !cible ||
        !action
    ) {

        return {

            valide: false,

            raison:
                "Données insuffisantes."
        };
    }


    const distance =
        calculerDistanceCombat(
            joueur,
            cible
        );


    const portee =
        obtenirPorteeActionCombat(
            action.type
        );


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT
    ) {

        return {

            valide: true,

            distance,

            portee
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        return {

            valide: true,

            distance,

            portee
        };
    }


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        distance > portee
    ) {

        return {

            valide: false,

            raison:
                "La cible est hors de portée.",

            distance,

            portee
        };
    }


    return {

        valide: true,

        distance,

        portee
    };
}


//==============================================================
// 🧍 VÉRIFIER LA CIBLE
//==============================================================

function verifierCibleArbitre({

    joueur,

    cible,

    action

} = {}) {


    if (!cible) {

        return {

            valide: false,

            raison:
                "Aucune cible valide."
        };
    }


    if (
        cible.etat ===
        ETATS_COMBAT_ALLSTARS.MORT
    ) {

        return {

            valide: false,

            raison:
                "La cible est morte."
        };
    }


    //----------------------------------------------------------
    // 🦴 MEMBRE CIBLÉ
    //----------------------------------------------------------

    const membre =
        action?.cible;


    if (
        membre ===
        CIBLES_COMBAT_ALLSTARS.BRAS_DROIT
    ) {

        if (
            cible.membres?.brasDroit
                ?.disponible === false
        ) {

            return {

                valide: false,

                raison:
                    "Le bras droit de la cible est indisponible."
            };
        }
    }


    if (
        membre ===
        CIBLES_COMBAT_ALLSTARS.BRAS_GAUCHE
    ) {

        if (
            cible.membres?.brasGauche
                ?.disponible === false
        ) {

            return {

                valide: false,

                raison:
                    "Le bras gauche de la cible est indisponible."
            };
        }
    }


    if (
        membre ===
        CIBLES_COMBAT_ALLSTARS.JAMBE_DROITE
    ) {

        if (
            cible.membres?.jambeDroite
                ?.disponible === false
        ) {

            return {

                valide: false,

                raison:
                    "La jambe droite de la cible est indisponible."
            };
        }
    }


    if (
        membre ===
        CIBLES_COMBAT_ALLSTARS.JAMBE_GAUCHE
    ) {

        if (
            cible.membres?.jambeGauche
                ?.disponible === false
        ) {

            return {

                valide: false,

                raison:
                    "La jambe gauche de la cible est indisponible."
            };
        }
    }


    return {

        valide: true
    };
}


//==============================================================
// 🧠 VÉRIFIER L'ÉTAT DU JOUEUR
//==============================================================

function verifierEtatArbitre(
    joueur
) {

    if (!joueur) {

        return {

            valide: false,

            raison:
                "Joueur introuvable."
        };
    }


    const peutAgir =
        joueurPeutAgirCombat(
            joueur
        );


    if (
        !peutAgir.succes
    ) {

        return {

            valide: false,

            raison:
                peutAgir.raison
        };
    }


    return {

        valide: true
    };
}


//==============================================================
// 🔋 VÉRIFIER LES RESSOURCES
//==============================================================

function verifierRessourcesArbitre({

    joueur,

    action

} = {}) {


    if (!joueur) {

        return {

            valide: false,

            raison:
                "Joueur introuvable."
        };
    }


    const coutStamina =
        Number(
            action?.coutStamina ??
            0
        );


    const coutEnergie =
        Number(
            action?.coutEnergie ??
            0
        );


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    if (
        joueur.stamina <
        coutStamina
    ) {

        return {

            valide: false,

            raison:
                "Stamina insuffisante."
        };
    }


    //----------------------------------------------------------
    // ⚡ ÉNERGIE
    //----------------------------------------------------------

    if (
        joueur.energie <
        coutEnergie
    ) {

        return {

            valide: false,

            raison:
                "Énergie insuffisante."
        };
    }


    return {

        valide: true
    };
}


//==============================================================
// 💨 CALCUL DE VITESSE RELATIVE
//==============================================================

function calculerAvantageVitesseArbitre({

    attaquant,

    defenseur

} = {}) {


    const profilAttaquant =
        creerProfilCombat(
            attaquant
        );


    const profilDefenseur =
        creerProfilCombat(
            defenseur
        );


    const vitesseA =
        profilAttaquant
            .vitesseEffective;


    const vitesseD =
        profilDefenseur
            .vitesseEffective;


    if (
        vitesseA <= 0 &&
        vitesseD <= 0
    ) {

        return {

            attaquant: 0,

            defenseur: 0,

            difference: 0
        };
    }


    const total =
        Math.max(
            1,
            vitesseA +
            vitesseD
        );


    return {

        attaquant:
            vitesseA /
            total,

        defenseur:
            vitesseD /
            total,

        difference:
            vitesseA -
            vitesseD
    };
}


//==============================================================
// 🧠 CALCULER LA PROBABILITÉ D'ESQUIVE
//==============================================================

function calculerChanceEsquiveArbitre({

    attaquant,

    defenseur,

    action

} = {}) {


    if (
        !attaquant ||
        !defenseur
    ) {

        return 0;
    }


    const vitesse =
        calculerAvantageVitesseArbitre({

            attaquant:
                defenseur,

            defenseur:
                attaquant
        });


    //----------------------------------------------------------
    // 🎯 BASE
    //----------------------------------------------------------

    let chance =
        0.20;


    //----------------------------------------------------------
    // 💨 VITESSE
    //----------------------------------------------------------

    chance +=
        vitesse.attaquant *
        0.35;


    //----------------------------------------------------------
    // 🧠 RÉFLEXES
    //----------------------------------------------------------

    const profil =
        calculerCapacitesCombat(
            defenseur
        );


    chance +=
        (
            profil.reflexes /
            100
        ) * 0.25;


    //----------------------------------------------------------
    // 🐌 RALENTI
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            defenseur,
            EFFETS_COMBAT_ALLSTARS.RALENTI
        )
    ) {

        chance -= 0.15;
    }


    //----------------------------------------------------------
    // 😵 DÉSORIENTÉ
    //----------------------------------------------------------

    if (
        joueurPossedeEffetCombat(
            defenseur,
            EFFETS_COMBAT_ALLSTARS.DESORIENTE
        )
    ) {

        chance -= 0.20;
    }


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    const distance =
        calculerDistanceCombat(
            attaquant,
            defenseur
        );


    if (
        distance <= 1
    ) {

        chance -= 0.05;
    }


    return Math.max(
        0.05,
        Math.min(
            0.80,
            chance
        )
    );
}


//==============================================================
// 🎲 TIRAGE DÉTERMINISTE / PROBABILISTE
//==============================================================
// Utilise Math.random uniquement pour le résultat final.
// L'arbitre conserve toutes les raisons de sa décision.
//==============================================================

function tirageArbitre(
    chance
) {

    return Math.random() <
        Math.max(
            0,
            Math.min(
                1,
                chance
            )
        );
}


//==============================================================
// ⚔️ RÉSOLUTION D'UNE ATTAQUE
//==============================================================

function arbitrerAttaqueCombat({

    combat,

    attaquant,

    defenseur,

    action

} = {}) {


    //----------------------------------------------------------
    // 📏 PORTÉE
    //----------------------------------------------------------

    const portee =
        verifierPorteeArbitre({

            joueur:
                attaquant,

            cible:
                defenseur,

            action
        });


    if (
        !portee.valide
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.IMPOSSIBLE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            succes: false,

            raison:
                portee.raison,

            distance:
                portee.distance
        };
    }


    //----------------------------------------------------------
    // 🎯 CIBLE
    //----------------------------------------------------------

    const cible =
        verifierCibleArbitre({

            joueur:
                attaquant,

            cible:
                defenseur,

            action
        });


    if (
        !cible.valide
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                cible.raison
        };
    }


    //----------------------------------------------------------
    // 🧠 ÉTAT
    //----------------------------------------------------------

    const etat =
        verifierEtatArbitre(
            attaquant
        );


    if (
        !etat.valide
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                etat.raison
        };
    }


    //----------------------------------------------------------
    // 🛡️ ACTION DÉFENSIVE ADVERSE
    //----------------------------------------------------------

    const actionDefense =
        defenseur.actionEnCours;


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        actionDefense?.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        const chance =
            calculerChanceEsquiveArbitre({

                attaquant,

                defenseur,

                action
            });


        const esquive =
            tirageArbitre(
                chance
            );


        if (
            esquive
        ) {

            defenseur.statistiques
                .esquives++;


            return {

                decision:
                    DECISIONS_ARBITRE_ALLSTARS.ESQUIVEE,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

                succes: false,

                raison:
                    "La cible a réussi son esquive.",

                chanceEsquive:
                    chance
            };
        }
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        actionDefense?.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        const defense =
            calculerDefenseEffectiveCombat(
                defenseur
            );


        const attaque =
            calculerPuissanceAttaqueCombat(
                attaquant
            );


        const ratio =
            attaque /
            Math.max(
                1,
                attaque +
                defense
            );


        if (
            tirageArbitre(
                0.35 +
                ratio * 0.30
            ) === false
        ) {

            defenseur.statistiques
                .blocages++;


            return {

                decision:
                    DECISIONS_ARBITRE_ALLSTARS.BLOQUEE,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.BLOQUE,

                succes: false,

                raison:
                    "L'attaque a été bloquée.",

                attaque,

                defense
            };
        }
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        actionDefense?.type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        const vitesse =
            calculerAvantageVitesseArbitre({

                attaquant:
                    defenseur,

                defenseur:
                    attaquant
            });


        if (
            tirageArbitre(
                0.35 +
                vitesse.attaquant *
                0.35
            )
        ) {

            defenseur.statistiques
                .contres++;


            return {

                decision:
                    DECISIONS_ARBITRE_ALLSTARS.CONTREE,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.CONTRE,

                succes: false,

                raison:
                    "L'attaque a été contrée."
            };
        }
    }


    //----------------------------------------------------------
    // 💥 IMPACT
    //----------------------------------------------------------

    const puissance =
        calculerPuissanceAttaqueCombat(
            attaquant
        );


    const defense =
        calculerDefenseEffectiveCombat(
            defenseur
        );


    //----------------------------------------------------------
    // 📊 DÉGÂTS
    //----------------------------------------------------------

    let degats =

        obtenirDegatsBaseActionCombat(
            action.details
                ?.typeAttaque ??
            action.type
        );


    degats +=
        puissance * 0.20;


    degats -=
        defense * 0.10;


    //----------------------------------------------------------
    // 💪 PUISSANCE DÉCLARÉE
    //----------------------------------------------------------

    if (
        action.details
            ?.puissanceDeclaree
    ) {

        degats *= 1.15;
    }


    degats =
        Math.max(
            1,
            Math.round(
                degats
            )
        );


    //----------------------------------------------------------
    // ❤️ APPLICATION
    //----------------------------------------------------------

    const resultatDegats =
        appliquerDegatsCombat(

            defenseur,

            degats,

            attaquant.jid
        );


    attaquant.statistiques
        .coupsPortes++;


    //----------------------------------------------------------
    // 🩸 RÉDUCTION / KO
    //----------------------------------------------------------

    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.IMPACT,

        succes: true,

        raison:
            "L'attaque a atteint sa cible.",

        degats:
            resultatDegats,

        puissance,

        defense,

        distance:
            portee.distance
    };
}


//==============================================================
// 🏃 ARBITRER UN DÉPLACEMENT
//==============================================================

function arbitrerDeplacementCombat({

    combat,

    joueur,

    cible,

    action

} = {}) {


    const intensite =
        action.details
            ?.intensite ??
        "normal";


    //----------------------------------------------------------
    // 📏 DISTANCE DEMANDÉE
    //----------------------------------------------------------

    const distanceActuelle =
        cible
            ? calculerDistanceCombat(
                joueur,
                cible
            )
            : 0;


    //----------------------------------------------------------
    // 💨 VITESSE
    //----------------------------------------------------------

    const profil =
        creerProfilCombat(
            joueur
        );


    let distanceDeplacement =
        Math.max(
            1,
            profil.vitesseEffective /
            10
        );


    if (
        intensite ===
        "rapide"
    ) {

        distanceDeplacement *=
            1.5;
    }


    if (
        intensite ===
        "lent"
    ) {

        distanceDeplacement *=
            0.5;
    }


    //----------------------------------------------------------
    // 🎯 VERS LA CIBLE
    //----------------------------------------------------------

    if (
        cible &&
        action.direction ===
        DIRECTIONS_COMBAT_ALLSTARS.AVANT
    ) {

        const dx =
            cible.position.x -
            joueur.position.x;


        const dy =
            cible.position.y -
            joueur.position.y;


        const dz =
            cible.position.z -
            joueur.position.z;


        const longueur =
            Math.sqrt(
                dx * dx +
                dy * dy +
                dz * dz
            );


        if (
            longueur > 0
        ) {

            const ratio =
                Math.min(
                    1,
                    distanceDeplacement /
                    longueur
                );


            joueur.position.x +=
                dx * ratio;


            joueur.position.y +=
                dy * ratio;


            joueur.position.z +=
                dz * ratio;
        }
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const cout =
        Math.max(
            1,
            Math.round(
                distanceDeplacement *
                (
                    intensite ===
                    "rapide"
                        ? 2
                        : 1
                )
            )
        );


    const stamina =
        consommerStaminaCombat(
            joueur,
            cout
        );


    if (
        !stamina.succes
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "Stamina insuffisante pour le déplacement."
        };
    }


    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.DEPLACEMENT,

        succes: true,

        distanceParcourue:
            distanceDeplacement,

        distanceAvant:
            distanceActuelle,

        distanceApres:
            cible
                ? calculerDistanceCombat(
                    joueur,
                    cible
                )
                : null,

        stamina
    };
}


//==============================================================
// 💨 ARBITRER UNE ESQUIVE
//==============================================================

function arbitrerEsquiveCombat({

    joueur,

    cible,

    action

} = {}) {


    const profil =
        creerProfilCombat(
            joueur
        );


    const intensite =
        action.details
            ?.intensite ??
        "normal";


    let cout =
        4;


    if (
        intensite ===
        "rapide"
    ) {

        cout = 7;
    }


    if (
        intensite ===
        "lent"
    ) {

        cout = 2;
    }


    const stamina =
        consommerStaminaCombat(
            joueur,
            cout
        );


    if (
        !stamina.succes
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "Stamina insuffisante pour esquiver."
        };
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.ESQUIVE,

        direction:
            action.direction,

        intensite,

        vitesse:
            profil.vitesseEffective
    };


    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

        succes: true,

        stamina
    };
}


//==============================================================
// 🛡️ ARBITRER UNE DÉFENSE
//==============================================================

function arbitrerDefenseCombat({

    joueur,

    action

} = {}) {


    const cout =
        3;


    const stamina =
        consommerStaminaCombat(
            joueur,
            cout
        );


    if (
        !stamina.succes
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "Stamina insuffisante."
        };
    }


    joueur.actionEnCours = {

        type:
            ACTIONS_COMBAT_ALLSTARS.DEFENSE,

        sousType:
            action.details?.mode ??
            "blocage",

        actif: true
    };


    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.BLOQUE,

        succes: true,

        stamina
    };
}


//==============================================================
// 🤼 ARBITRER UNE SAISIE
//==============================================================

function arbitrerSaisieCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    const distance =
        calculerDistanceCombat(
            attaquant,
            defenseur
        );


    //----------------------------------------------------------
    // 📏 DISTANCE
    //----------------------------------------------------------

    if (
        distance >
        obtenirPorteeActionCombat(
            ACTIONS_COMBAT_ALLSTARS.SAISIE
        )
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.IMPOSSIBLE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            succes: false,

            raison:
                "La cible est trop éloignée pour une saisie."
        };
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const stamina =
        consommerStaminaCombat(
            attaquant,
            5
        );


    if (
        !stamina.succes
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "Stamina insuffisante."
        };
    }


    //----------------------------------------------------------
    // 💪 FORCE
    //----------------------------------------------------------

    const forceA =
        calculerCapacitesCombat(
            attaquant
        ).force;


    const forceD =
        calculerCapacitesCombat(
            defenseur
        ).force;


    const chance =
        0.35 +
        (
            forceA /
            Math.max(
                1,
                forceA +
                forceD
            )
        ) * 0.40;


    if (
        !tirageArbitre(
            chance
        )
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "La cible résiste à la saisie.",

            chance
        };
    }


    //----------------------------------------------------------
    // 🧊 IMMOBILISATION
    //----------------------------------------------------------

    ajouterEffetCombat({

        joueur:
            defenseur,

        type:
            EFFETS_COMBAT_ALLSTARS.IMMOBILISE,

        duree:
            1,

        puissance:
            1,

        source:
            attaquant.jid
    });


    attaquant.statistiques
        .saisies++;


    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.SAISIE,

        succes: true,

        raison:
            "La saisie a réussi.",

        chance
    };
}


//==============================================================
// ⚡ ARBITRER UNE TECHNIQUE
//==============================================================

function arbitrerTechniqueCombat({

    attaquant,

    defenseur,

    action

} = {}) {


    const coutEnergie =
        Number(
            action.coutEnergie ??
            20
        );


    const energie =
        consommerEnergieCombat(
            attaquant,
            coutEnergie
        );


    if (
        !energie.succes
    ) {

        return {

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            succes: false,

            raison:
                "Énergie insuffisante."
        };
    }


    //----------------------------------------------------------
    // 💥 TECHNIQUE
    //----------------------------------------------------------

    const puissance =
        calculerPuissanceAttaqueCombat(
            attaquant
        );


    const degats =
        Math.max(
            1,
            Math.round(
                puissance *
                0.50
            )
        );


    const impact =
        appliquerDegatsCombat(

            defenseur,

            degats,

            attaquant.jid
        );


    attaquant.statistiques
        .coupsPortes++;


    return {

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.IMPACT,

        succes: true,

        degats:
            impact,

        energie
    };
}


//==============================================================
// ⚖️ ARBITRER UNE ACTION
//==============================================================

function arbitrerActionCombat({

    combat,

    intention,

    joueur,

    cible

} = {}) {


    if (
        !intention ||
        !joueur
    ) {

        return {

            succes: false,

            decision:
                DECISIONS_ARBITRE_ALLSTARS.IMPOSSIBLE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.IMPOSSIBLE,

            raison:
                "Intention ou joueur manquant."
        };
    }


    const action =
        obtenirActionPrincipaleArbitre(
            intention
        );


    //----------------------------------------------------------
    // ⏳ AUCUNE ACTION
    //----------------------------------------------------------

    if (!action) {

        return {

            succes: true,

            decision:
                DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ATTENTE,

            action: null
        };
    }


    //----------------------------------------------------------
    // 🧠 ÉTAT
    //----------------------------------------------------------

    const etat =
        verifierEtatArbitre(
            joueur
        );


    if (
        !etat.valide
    ) {

        return {

            succes: false,

            decision:
                DECISIONS_ARBITRE_ALLSTARS.REFUSEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            action,

            raison:
                etat.raison
        };
    }


    //----------------------------------------------------------
    // 🎯 CIBLE AUTOMATIQUE
    //----------------------------------------------------------

    cible =
        cible ??
        obtenirCibleArbitre(
            combat,
            intention
        );


    //----------------------------------------------------------
    // ⚔️ ATTAQUE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ATTAQUE
    ) {

        return {

            ...arbitrerAttaqueCombat({

                combat,

                attaquant:
                    joueur,

                defenseur:
                    cible,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEPLACEMENT
    ) {

        return {

            ...arbitrerDeplacementCombat({

                combat,

                joueur,

                cible,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        return {

            ...arbitrerEsquiveCombat({

                joueur,

                cible,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // 🛡️ DÉFENSE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.DEFENSE
    ) {

        return {

            ...arbitrerDefenseCombat({

                joueur,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // 🤼 SAISIE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.SAISIE
    ) {

        return {

            ...arbitrerSaisieCombat({

                attaquant:
                    joueur,

                defenseur:
                    cible,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // ⚡ TECHNIQUE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.TECHNIQUE
    ) {

        return {

            ...arbitrerTechniqueCombat({

                attaquant:
                    joueur,

                defenseur:
                    cible,

                action
            }),

            action
        };
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        action.type ===
        ACTIONS_COMBAT_ALLSTARS.CONTRE
    ) {

        joueur.actionEnCours = {

            type:
                ACTIONS_COMBAT_ALLSTARS.CONTRE,

            actif: true
        };


        return {

            succes: true,

            decision:
                DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

            resultat:
                RESULTATS_COMBAT_ALLSTARS.CONTRE,

            action
        };
    }


    //----------------------------------------------------------
    // ⏳ ATTENTE
    //----------------------------------------------------------

    return {

        succes: true,

        decision:
            DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

        resultat:
            RESULTATS_COMBAT_ALLSTARS.ATTENTE,

        action
    };
}


//==============================================================
// ⚖️ ARBITRER LES DEUX JOUEURS
//==============================================================
// Les deux intentions sont analysées AVANT la résolution.
// Cela permet de prendre en compte les interactions :
//
// attaque VS esquive
// attaque VS blocage
// attaque VS contre
// saisie VS déplacement
// etc.
//==============================================================

function arbitrerTourCombatAllStars({

    combat,

    intentions = {}

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const resultats = [];


    //----------------------------------------------------------
    // 👥 ORDRE DES JOUEURS
    //----------------------------------------------------------

    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        const intention =
            intentions[jid];


        //------------------------------------------------------
        // ⏳ PAS D'INTENTION
        //------------------------------------------------------

        if (!intention) {

            resultats.push({

                jid,

                succes: true,

                decision:
                    DECISIONS_ARBITRE_ALLSTARS.ACCEPTEE,

                resultat:
                    RESULTATS_COMBAT_ALLSTARS.ATTENTE,

                action: null
            });

            continue;
        }


        //------------------------------------------------------
        // 🎯 CIBLE
        //------------------------------------------------------

        const cible =
            obtenirCibleArbitre(
                combat,
                intention
            );


        //------------------------------------------------------
        // ⚖️ ARBITRAGE
        //------------------------------------------------------

        const resultat =
            arbitrerActionCombat({

                combat,

                intention,

                joueur,

                cible
            });


        resultats.push({

            jid,

            ...resultat
        });
    }


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.derniereDecisionArbitre = {

        tour:
            combat.tour,

        resultats,

        temps:
            combat.temps
    };


    combat.historique.push({

        type:
            "arbitrage",

        tour:
            combat.tour,

        resultats,

        temps:
            combat.temps
    });


    return {

        succes: true,

        tour:
            combat.tour,

        resultats
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚖️ Arbitre ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — MOTEUR DE TOUR
//==============================================================
// Un tour représente UNE SÉQUENCE COMPLÈTE :
//
// 1. Joueur 1 envoie son pavé
// 2. Joueur 2 envoie son pavé
// 3. Les deux intentions sont interprétées
// 4. Les deux intentions sont arbitrées
// 5. Les actions sont résolues
// 6. Les statistiques sont mises à jour
// 7. Le tour est terminé
//
// IMPORTANT :
// Le compteur "tour" n'augmente QU'APRÈS la résolution des
// deux joueurs.
//
// À 10 tours terminés → décision finale.
//==============================================================


//==============================================================
// 🔢 CONFIGURATION DES TOURS
//==============================================================

const CONFIG_TOURS_ALLSTARS = {

    toursMaximum: 10,

    tourInitial: 0
};


//==============================================================
// 🏆 CRÉATION DES DONNÉES DE DOMINATION
//==============================================================

function initialiserDominationCombat(
    joueur
) {

    if (!joueur) {
        return;
    }


    joueur.domination = {

        score: 0,

        attaquesReussies: 0,

        attaquesRatees: 0,

        esquivesReussies: 0,

        blocagesReussis: 0,

        contresReussis: 0,

        saisiesReussies: 0,

        deplacementsReussis: 0,

        coupsRecus: 0,

        pression: 0,

        toursDomines: 0
    };
}


//==============================================================
// 🏆 INITIALISER LA DOMINATION DU COMBAT
//==============================================================

function initialiserDominationCombatAllStars(
    combat
) {

    if (!combat) {
        return;
    }


    for (
        const jid of combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        if (
            !joueur.domination
        ) {

            initialiserDominationCombat(
                joueur
            );
        }
    }
}


//==============================================================
// 📊 AJOUTER DES POINTS DE DOMINATION
//==============================================================

function ajouterDominationCombat(
    joueur,
    points,
    raison = null
) {

    if (!joueur) {
        return;
    }


    if (
        !joueur.domination
    ) {

        initialiserDominationCombat(
            joueur
        );
    }


    points =
        Number(points) || 0;


    joueur.domination.score +=
        points;


    //----------------------------------------------------------
    // HISTORIQUE DE PRESSION
    //----------------------------------------------------------

    if (points > 0) {

        joueur.domination.pression +=
            points;
    }


    //----------------------------------------------------------
    // ÉVÉNEMENT
    //----------------------------------------------------------

    if (
        raison
    ) {

        joueur.domination.derniereAction =
            raison;
    }
}


//==============================================================
// 📈 ANALYSER LA DOMINATION D'UN RÉSULTAT
//==============================================================

function analyserDominationResultatCombat({

    joueur,

    resultat

} = {}) {


    if (
        !joueur ||
        !resultat
    ) {

        return;
    }


    if (
        !joueur.domination
    ) {

        initialiserDominationCombat(
            joueur
        );
    }


    const domination =
        joueur.domination;


    //----------------------------------------------------------
    // 💥 COUP RÉUSSI
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.IMPACT
    ) {

        domination.attaquesReussies++;

        ajouterDominationCombat(
            joueur,
            3,
            "attaque réussie"
        );
    }


    //----------------------------------------------------------
    // ❌ ATTAQUE RATÉE
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.ECHEC
    ) {

        domination.attaquesRatees++;

        ajouterDominationCombat(
            joueur,
            -1,
            "action échouée"
        );
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.ESQUIVE
    ) {

        domination.esquivesReussies++;

        ajouterDominationCombat(
            joueur,
            2,
            "esquive réussie"
        );
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.BLOQUE
    ) {

        domination.blocagesReussis++;

        ajouterDominationCombat(
            joueur,
            2,
            "blocage réussi"
        );
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.CONTRE
    ) {

        domination.contresReussis++;

        ajouterDominationCombat(
            joueur,
            4,
            "contre réussi"
        );
    }


    //----------------------------------------------------------
    // 🤼 SAISIE
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.SAISIE
    ) {

        domination.saisiesReussies++;

        ajouterDominationCombat(
            joueur,
            3,
            "saisie réussie"
        );
    }


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        resultat.resultat ===
        RESULTATS_COMBAT_ALLSTARS.DEPLACEMENT
    ) {

        domination.deplacementsReussis++;

        ajouterDominationCombat(
            joueur,
            1,
            "déplacement réussi"
        );
    }
}


//==============================================================
// ❤️ CALCULER L'AVANTAGE PV
//==============================================================

function calculerAvantagePVCombat(
    joueurA,
    joueurB
) {

    if (
        !joueurA ||
        !joueurB
    ) {

        return 0;
    }


    const pvA =
        Math.max(
            0,
            Number(
                joueurA.pv ?? 0
            )
        );


    const pvB =
        Math.max(
            0,
            Number(
                joueurB.pv ?? 0
            )
        );


    const maxA =
        Math.max(
            1,
            Number(
                joueurA.pvMax ?? 100
            )
        );


    const maxB =
        Math.max(
            1,
            Number(
                joueurB.pvMax ?? 100
            )
        );


    const ratioA =
        pvA / maxA;


    const ratioB =
        pvB / maxB;


    return (
        ratioA -
        ratioB
    );
}


//==============================================================
// 🔋 CALCULER L'AVANTAGE STAMINA
//==============================================================

function calculerAvantageStaminaCombat(
    joueurA,
    joueurB
) {

    if (
        !joueurA ||
        !joueurB
    ) {

        return 0;
    }


    const staminaA =
        Math.max(
            0,
            Number(
                joueurA.stamina ?? 0
            )
        );


    const staminaB =
        Math.max(
            0,
            Number(
                joueurB.stamina ?? 0
            )
        );


    return (
        staminaA -
        staminaB
    );
}


//==============================================================
// 👑 COMPARER LA DOMINATION
//==============================================================

function calculerAvantageDominationCombat(
    joueurA,
    joueurB
) {

    const dominationA =
        Number(
            joueurA?.domination?.score ??
            0
        );


    const dominationB =
        Number(
            joueurB?.domination?.score ??
            0
        );


    return (
        dominationA -
        dominationB
    );
}


//==============================================================
// 🧠 ÉVALUATION DU COMBAT
//==============================================================
// Cette fonction donne une photographie du combat.
// Elle ne décide PAS encore définitivement du vainqueur.
//==============================================================

function evaluerCombatAllStars(
    combat
) {

    if (
        !combat ||
        !combat.ordre
    ) {

        return null;
    }


    const joueurs =
        combat.ordre
            .map(
                jid =>
                    obtenirJoueurCombat(
                        combat,
                        jid
                    )
            )
            .filter(
                Boolean
            );


    if (
        joueurs.length < 2
    ) {

        return null;
    }


    const joueurA =
        joueurs[0];


    const joueurB =
        joueurs[1];


    const avantagePV =
        calculerAvantagePVCombat(
            joueurA,
            joueurB
        );


    const avantageStamina =
        calculerAvantageStaminaCombat(
            joueurA,
            joueurB
        );


    const avantageDomination =
        calculerAvantageDominationCombat(
            joueurA,
            joueurB
        );


    return {

        joueurA:
            joueurA.jid,

        joueurB:
            joueurB.jid,

        avantagePV,

        avantageStamina,

        avantageDomination,

        pv: {

            [joueurA.jid]:
                joueurA.pv,

            [joueurB.jid]:
                joueurB.pv
        },

        stamina: {

            [joueurA.jid]:
                joueurA.stamina,

            [joueurB.jid]:
                joueurB.stamina
        },

        domination: {

            [joueurA.jid]:
                joueurA.domination?.score ?? 0,

            [joueurB.jid]:
                joueurB.domination?.score ?? 0
        }
    };
}


//==============================================================
// 👑 DÉTERMINER LE DOMINANT DU TOUR
//==============================================================

function determinerDominantTourCombat(
    combat
) {

    const joueurs =
        combat.ordre
            .map(
                jid =>
                    obtenirJoueurCombat(
                        combat,
                        jid
                    )
            )
            .filter(
                Boolean
            );


    if (
        joueurs.length < 2
    ) {

        return null;
    }


    const A =
        joueurs[0];


    const B =
        joueurs[1];


    const scoreA =
        Number(
            A.domination?.score ??
            0
        );


    const scoreB =
        Number(
            B.domination?.score ??
            0
        );


    if (
        scoreA === scoreB
    ) {

        return null;
    }


    return scoreA > scoreB
        ? A.jid
        : B.jid;
}


//==============================================================
// 📊 ENREGISTRER LE TOUR DOMINÉ
//==============================================================

function enregistrerDominationTourCombat(
    combat
) {

    const dominant =
        determinerDominantTourCombat(
            combat
        );


    if (!dominant) {
        return null;
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            dominant
        );


    if (!joueur) {
        return null;
    }


    if (
        !joueur.domination
    ) {

        initialiserDominationCombat(
            joueur
        );
    }


    joueur.domination
        .toursDomines++;


    return dominant;
}


//==============================================================
// ⚔️ RÉSOUDRE UN TOUR COMPLET
//==============================================================

async function resoudreTourCombatAllStars({

    combat,

    intentions = {}

} = {}) {


    //----------------------------------------------------------
    // 🛑 COMBAT TERMINÉ
    //----------------------------------------------------------

    if (
        !combat
    ) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: false,

            raison:
                "Le combat est déjà terminé."
        };
    }


    //----------------------------------------------------------
    // 🧠 INITIALISATION DOMINATION
    //----------------------------------------------------------

    initialiserDominationCombatAllStars(
        combat
    );


    //----------------------------------------------------------
    // ⚖️ ARBITRAGE SIMULTANÉ
    //----------------------------------------------------------

    const arbitrage =
        arbitrerTourCombatAllStars({

            combat,

            intentions
        });


    if (
        !arbitrage.succes
    ) {

        return {

            succes: false,

            raison:
                "Impossible d'arbitrer le tour."
        };
    }


    //----------------------------------------------------------
    // 📊 ANALYSE DES RÉSULTATS
    //----------------------------------------------------------

    for (
        const resultat of
        arbitrage.resultats
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                resultat.jid
            );


        if (!joueur) {
            continue;
        }


        analyserDominationResultatCombat({

            joueur,

            resultat
        });
    }


    //----------------------------------------------------------
    // 👑 DOMINATION DU TOUR
    //----------------------------------------------------------

    const dominantTour =
        enregistrerDominationTourCombat(
            combat
        );


    //----------------------------------------------------------
    // 🔢 LE TOUR EST MAINTENANT TERMINÉ
    //----------------------------------------------------------
    // C'est ici et seulement ici que le compteur augmente.
    //----------------------------------------------------------

    combat.tour++;

    combat.sequence++;


    //----------------------------------------------------------
    // 📸 ÉVALUATION
    //----------------------------------------------------------

    const evaluation =
        evaluerCombatAllStars(
            combat
        );


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "fin_tour",

        tour:
            combat.tour,

        dominant:
            dominantTour,

        evaluation,

        resultats:
            arbitrage.resultats,

        temps:
            combat.temps
    });


    //----------------------------------------------------------
    // ☠️ VÉRIFICATION KO / MORT
    //----------------------------------------------------------

    const finImmediate =
        verifierFinCombatAllStars(
            combat
        );


    if (
        finImmediate.termine
    ) {

        return terminerCombatAllStars({

            combat,

            raison:
                finImmediate.raison,

            type:
                "ko"
        });
    }


    //----------------------------------------------------------
    // ⏱️ LIMITE DES 10 TOURS
    //----------------------------------------------------------

    if (
        combat.tour >=
        CONFIG_TOURS_ALLSTARS.toursMaximum
    ) {

        return terminerCombatAllStars({

            combat,

            raison:
                "Les 10 tours sont terminés.",

            type:
                "decision"
        });
    }


    //----------------------------------------------------------
    // 🔄 TOUR SUIVANT
    //----------------------------------------------------------

    for (
        const jid of
        combat.ordre
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        joueur.actionEnCours =
            null;

        joueur.cibleActuelle =
            joueur.cibleActuelle ??
            combat.ordre.find(
                id =>
                    id !== jid
            );
    }


    return {

        succes: true,

        termine: false,

        tourTermine:
            combat.tour,

        prochainTour:
            combat.tour + 1,

        arbitrage,

        dominantTour,

        evaluation
    };
}


//==============================================================
// ☠️ VÉRIFIER SI LE COMBAT DOIT S'ARRÊTER
//==============================================================

function verifierFinCombatAllStars(
    combat
) {

    for (
        const jid of
        combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        if (
            joueur.etat ===
            ETATS_COMBAT_ALLSTARS.MORT
        ) {

            return {

                termine: true,

                raison:
                    "Un joueur est mort."
            };
        }


        if (
            joueur.pv <= 0
        ) {

            joueur.pv = 0;

            joueur.etat =
                ETATS_COMBAT_ALLSTARS.KO;


            return {

                termine: true,

                raison:
                    "Un joueur est KO."
            };
        }
    }


    return {

        termine: false
    };
}


//==============================================================
// 🏆 SCORE FINAL
//==============================================================
// IMPORTANT :
// On compare séparément les 3 critères.
//
// 1️⃣ PV
// 2️⃣ STAMINA
// 3️⃣ DOMINATION
//
// Le critère suivant ne sert que si le précédent est égal.
//==============================================================

function calculerDecisionFinaleAllStars(
    combat
) {

    const joueurs =
        combat.ordre
            .map(
                jid =>
                    obtenirJoueurCombat(
                        combat,
                        jid
                    )
            )
            .filter(
                Boolean
            );


    if (
        joueurs.length < 2
    ) {

        return {

            vainqueur: null,

            egalite: true,

            raison:
                "Impossible de déterminer un vainqueur."
        };
    }


    const A =
        joueurs[0];


    const B =
        joueurs[1];


    //----------------------------------------------------------
    // ❤️ PV
    //----------------------------------------------------------

    const pvA =
        A.pv /
        Math.max(
            1,
            A.pvMax
        );


    const pvB =
        B.pv /
        Math.max(
            1,
            B.pvMax
        );


    if (
        pvA !== pvB
    ) {

        return {

            vainqueur:
                pvA > pvB
                    ? A.jid
                    : B.jid,

            egalite: false,

            critere:
                "pv",

            raison:
                "Le joueur possède le meilleur pourcentage de PV restants."
        };
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    const staminaA =
        Number(
            A.stamina ?? 0
        );


    const staminaB =
        Number(
            B.stamina ?? 0
        );


    if (
        staminaA !== staminaB
    ) {

        return {

            vainqueur:
                staminaA > staminaB
                    ? A.jid
                    : B.jid,

            egalite: false,

            critere:
                "stamina",

            raison:
                "Les PV sont égaux ; le joueur possède davantage de stamina."
        };
    }


    //----------------------------------------------------------
    // 👑 DOMINATION
    //----------------------------------------------------------

    const dominationA =
        Number(
            A.domination?.score ??
            0
        );


    const dominationB =
        Number(
            B.domination?.score ??
            0
        );


    if (
        dominationA !== dominationB
    ) {

        return {

            vainqueur:
                dominationA >
                dominationB
                    ? A.jid
                    : B.jid,

            egalite: false,

            critere:
                "domination",

            raison:
                "Les PV et la stamina sont égaux ; le joueur ayant le plus dominé le combat l'emporte."
        };
    }


    //----------------------------------------------------------
    // 🤝 ÉGALITÉ
    //----------------------------------------------------------

    return {

        vainqueur: null,

        egalite: true,

        critere:
            "egalite",

        raison:
            "Les deux combattants sont parfaitement à égalité."
    };
}


//==============================================================
// 🏁 TERMINER LE COMBAT
//==============================================================

function terminerCombatAllStars({

    combat,

    raison = "Combat terminé.",

    type = "decision"

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    //----------------------------------------------------------
    // 🛑 ÉVITER DOUBLE TERMINAISON
    //----------------------------------------------------------

    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: true,

            dejaTermine: true,

            decision:
                combat.decisionFinale
        };
    }


    //----------------------------------------------------------
    // 🏁 PHASE
    //----------------------------------------------------------

    combat.phase =
        "termine";


    //----------------------------------------------------------
    // 🏆 DÉCISION
    //----------------------------------------------------------

    const decision =
        calculerDecisionFinaleAllStars(
            combat
        );


    combat.decisionFinale = {

        type,

        raison,

        tour:
            combat.tour,

        vainqueur:
            decision.vainqueur,

        egalite:
            decision.egalite,

        critere:
            decision.critere,

        explication:
            decision.raison,

        evaluation:
            evaluerCombatAllStars(
                combat
            )
    };


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "fin_combat",

        tour:
            combat.tour,

        decision:
            combat.decisionFinale,

        temps:
            combat.temps
    });


    return {

        succes: true,

        termine: true,

        decision:
            combat.decisionFinale
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Moteur de tours ALL STARS chargé."
);

//==============================================================
// ⚔️ ALL STARS — RÉSOLUTION DES ACTIONS
//==============================================================
// Ce module transforme les intentions arbitrées en conséquences
// réelles dans l'état du combat.
//
// Exemple :
//
// Joueur 1 → attaque
// Joueur 2 → esquive
//
//              ↓
//
// Résolution
//
//              ↓
//
// Joueur 2 esquive
// Joueur 1 consomme sa stamina
// statistiques mises à jour
// domination mise à jour
// historique enregistré
//
//==============================================================


//==============================================================
// 🎯 TYPES DE RÉSULTATS
//==============================================================

const RESULTATS_COMBAT_ALLSTARS = {

    IMPACT: "impact",

    ECHEC: "echec",

    ESQUIVE: "esquive",

    BLOQUE: "bloque",

    CONTRE: "contre",

    SAISIE: "saisie",

    DEPLACEMENT: "deplacement",

    INTERROMPU: "interrompu",

    INVALIDE: "invalide"
};


//==============================================================
// 🧍 OBTENIR UN JOUEUR
//==============================================================

function obtenirJoueurCombat(
    combat,
    jid
) {

    if (
        !combat ||
        !jid
    ) {
        return null;
    }


    return combat.joueurs?.[jid] ??
        null;
}


//==============================================================
// 🎯 OBTENIR L'ADVERSAIRE
//==============================================================

function obtenirAdversaireCombat(
    combat,
    jid
) {

    if (
        !combat ||
        !jid
    ) {
        return null;
    }


    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {
        return null;
    }


    const adversaireJid =
        combat.ordre.find(
            id =>
                id !== jid
        );


    return obtenirJoueurCombat(
        combat,
        adversaireJid
    );
}


//==============================================================
// 🧠 NORMALISATION D'UNE ACTION
//==============================================================

function normaliserActionCombat(
    action
) {

    if (!action) {

        return {

            type: "attendre",

            cible: null,

            puissance: 0,

            coutStamina: 0,

            coutEnergie: 0,

            donnees: {}
        };
    }


    if (
        typeof action ===
        "string"
    ) {

        return {

            type:
                action
                .toLowerCase()
                .trim(),

            cible: null,

            puissance: 0,

            coutStamina: 0,

            coutEnergie: 0,

            donnees: {}
        };
    }


    return {

        type:
            String(
                action.type ??
                action.action ??
                "attendre"
            )
            .toLowerCase()
            .trim(),

        cible:
            action.cible ??
            null,

        puissance:
            Number(
                action.puissance ??
                action.power ??
                0
            ),

        coutStamina:
            Number(
                action.coutStamina ??
                action.stamina ??
                0
            ),

        coutEnergie:
            Number(
                action.coutEnergie ??
                action.energie ??
                0
            ),

        donnees:
            action.donnees ??
            action
    };
}


//==============================================================
// 🏃 ACTIONS QUI NÉCESSITENT DE LA STAMINA
//==============================================================

function actionNecessiteStamina(
    action
) {

    const types = [

        "attaque",

        "frappe",

        "coup",

        "esquive",

        "blocage",

        "defense",

        "contre",

        "saisie",

        "projection",

        "course",

        "sprint",

        "deplacement",

        "dash",

        "charge"
    ];


    return types.includes(
        action.type
    );
}


//==============================================================
// ⚡ ACTIONS QUI NÉCESSITENT DE L'ÉNERGIE
//==============================================================

function actionNecessiteEnergie(
    action
) {

    const types = [

        "technique",

        "special",

        "attaque_speciale",

        "pouvoir",

        "ultime"
    ];


    return types.includes(
        action.type
    );
}


//==============================================================
// 💰 CONSOMMATION DES RESSOURCES
//==============================================================

function appliquerCoutsActionCombat(
    joueur,
    action
) {

    if (
        !joueur ||
        !action
    ) {

        return {

            succes: false,

            raison:
                "Joueur ou action introuvable."
        };
    }


    //----------------------------------------------------------
    // 🔋 STAMINA
    //----------------------------------------------------------

    if (
        action.coutStamina > 0
    ) {

        const resultat =
            consommerStaminaCombat(
                joueur,
                action.coutStamina
            );


        if (
            !resultat.succes
        ) {

            return {

                succes: false,

                raison:
                    resultat.raison,

                type:
                    "stamina"
            };
        }
    }


    //----------------------------------------------------------
    // ⚡ ÉNERGIE
    //----------------------------------------------------------

    if (
        action.coutEnergie > 0
    ) {

        const resultat =
            consommerEnergieCombat(
                joueur,
                action.coutEnergie
            );


        if (
            !resultat.succes
        ) {

            return {

                succes: false,

                raison:
                    resultat.raison,

                type:
                    "energie"
            };
        }
    }


    return {

        succes: true
    };
}


//==============================================================
// 📏 VÉRIFIER LA PORTÉE
//==============================================================

function verifierPorteeActionCombat({

    attaquant,

    cible,

    action

} = {}) {


    if (
        !attaquant ||
        !cible ||
        !action
    ) {

        return false;
    }


    const distance =
        calculerDistanceCombat(
            attaquant,
            cible
        );


    //----------------------------------------------------------
    // 👊 CORPS À CORPS
    //----------------------------------------------------------

    if (
        [
            "attaque",
            "frappe",
            "coup",
            "saisie",
            "projection",
            "contre",
            "blocage"
        ].includes(
            action.type
        )
    ) {

        const portee =
            Number(
                action.donnees?.portee ??
                REGLES_COMBAT_ALLSTARS
                    .corpsACorps
                    .zoneEffetAttaqueFrontale
            );


        return distance <= portee;
    }


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        [
            "deplacement",
            "course",
            "sprint",
            "dash",
            "charge"
        ].includes(
            action.type
        )
    ) {

        return true;
    }


    //----------------------------------------------------------
    // 🎯 DISTANCE
    //----------------------------------------------------------

    return true;
}


//==============================================================
// 💥 CALCUL DES DÉGÂTS
//==============================================================

function calculerDegatsCombat({

    attaquant,

    cible,

    action

} = {}) {


    if (
        !attaquant ||
        !cible ||
        !action
    ) {

        return 0;
    }


    let degats =
        Number(
            action.donnees?.degats ??
            action.donnees?.damage ??
            action.puissance ??
            0
        );


    //----------------------------------------------------------
    // ⚔️ BONUS DE PUISSANCE
    //----------------------------------------------------------

    if (
        action.donnees?.multiplicateur
    ) {

        degats *=
            Number(
                action.donnees.multiplicateur
            );
    }


    //----------------------------------------------------------
    // 🧠 BONUS DE DOMINATION
    //----------------------------------------------------------

    const domination =
        Number(
            attaquant.domination?.score ??
            0
        );


    if (
        domination > 0
    ) {

        const bonus =
            Math.min(
                0.25,
                domination / 1000
            );


        degats *=
            1 + bonus;
    }


    //----------------------------------------------------------
    // 🛡️ MINIMUM
    //----------------------------------------------------------

    return Math.max(
        0,
        Math.round(
            degats
        )
    );
}


//==============================================================
// 💥 RÉSOLUTION D'UNE ATTAQUE
//==============================================================

function resoudreAttaqueCombat({

    attaquant,

    defenseur,

    actionAttaquant,

    actionDefenseur

} = {}) {


    //----------------------------------------------------------
    // 📏 PORTÉE
    //----------------------------------------------------------

    if (
        !verifierPorteeActionCombat({

            attaquant,

            cible:
                defenseur,

            action:
                actionAttaquant

        })
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            raison:
                "La cible est hors de portée.",

            degats: 0
        };
    }


    //----------------------------------------------------------
    // 💨 ESQUIVE
    //----------------------------------------------------------

    if (
        [
            "esquive",
            "dash",
            "deplacement"
        ].includes(
            actionDefenseur.type
        )
    ) {

        defenseur.statistiques.esquives++;


        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ESQUIVE,

            attaquant:
                attaquant.jid,

            defenseur:
                defenseur.jid,

            degats: 0,

            raison:
                "L'attaque a été évitée."
        };
    }


    //----------------------------------------------------------
    // 🛡️ BLOCAGE
    //----------------------------------------------------------

    if (
        [
            "blocage",
            "defense",
            "garde"
        ].includes(
            actionDefenseur.type
        )
    ) {

        defenseur.statistiques.blocages++;


        const degats =
            Math.floor(
                calculerDegatsCombat({

                    attaquant,

                    cible:
                        defenseur,

                    action:
                        actionAttaquant

                }) * 0.25
            );


        if (
            degats > 0
        ) {

            appliquerDegatsCombat(
                defenseur,
                degats,
                attaquant.jid
            );
        }


        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.BLOQUE,

            attaquant:
                attaquant.jid,

            defenseur:
                defenseur.jid,

            degats,

            raison:
                "L'attaque a été bloquée."
        };
    }


    //----------------------------------------------------------
    // 🔄 CONTRE
    //----------------------------------------------------------

    if (
        actionDefenseur.type ===
        "contre"
    ) {

        defenseur.statistiques.contres++;


        const degats =
            calculerDegatsCombat({

                attaquant:
                    defenseur,

                cible:
                    attaquant,

                action:
                    actionDefenseur

            });


        if (
            degats > 0
        ) {

            appliquerDegatsCombat(
                attaquant,
                degats,
                defenseur.jid
            );
        }


        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.CONTRE,

            attaquant:
                defenseur.jid,

            defenseur:
                attaquant.jid,

            degats,

            raison:
                "Le défenseur a retourné l'attaque."
        };
    }


    //----------------------------------------------------------
    // 💥 IMPACT
    //----------------------------------------------------------

    const degats =
        calculerDegatsCombat({

            attaquant,

            cible:
                defenseur,

            action:
                actionAttaquant

        });


    if (
        degats > 0
    ) {

        appliquerDegatsCombat(
            defenseur,
            degats,
            attaquant.jid
        );
    }


    attaquant.statistiques.coupsPortes++;


    return {

        resultat:
            RESULTATS_COMBAT_ALLSTARS.IMPACT,

        attaquant:
            attaquant.jid,

        defenseur:
            defenseur.jid,

        degats,

        raison:
            "L'attaque touche la cible."
    };
}


//==============================================================
// 🤼 RÉSOLUTION D'UNE SAISIE
//==============================================================

function resoudreSaisieCombat({

    attaquant,

    defenseur,

    actionAttaquant,

    actionDefenseur

} = {}) {


    if (
        !verifierPorteeActionCombat({

            attaquant,

            cible:
                defenseur,

            action:
                actionAttaquant

        })
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            raison:
                "La saisie est hors de portée."
        };
    }


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENT
    //----------------------------------------------------------

    if (
        [
            "esquive",
            "dash",
            "deplacement",
            "course",
            "sprint"
        ].includes(
            actionDefenseur.type
        )
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            raison:
                "La cible s'est éloignée."
        };
    }


    //----------------------------------------------------------
    // 🤼 SAISIE RÉUSSIE
    //----------------------------------------------------------

    attaquant.statistiques.saisies++;


    return {

        resultat:
            RESULTATS_COMBAT_ALLSTARS.SAISIE,

        attaquant:
            attaquant.jid,

        defenseur:
            defenseur.jid,

        degats:
            Number(
                actionAttaquant.donnees?.degats ??
                0
            ),

        raison:
            "La saisie est réussie."
    };
}


//==============================================================
// 🏃 RÉSOLUTION D'UN DÉPLACEMENT
//==============================================================

function resoudreDeplacementCombat({

    joueur,

    adversaire,

    action

} = {}) {


    if (
        !joueur ||
        !action
    ) {

        return {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.INVALIDE
        };
    }


    const distanceAvant =
        calculerDistanceCombat(
            joueur,
            adversaire
        );


    //----------------------------------------------------------
    // 📐 DISTANCE DEMANDÉE
    //----------------------------------------------------------

    let distance =
        Number(
            action.donnees?.distance ??
            action.puissance ??
            0
        );


    distance =
        Math.max(
            0,
            distance
        );


    //----------------------------------------------------------
    // 🧭 DIRECTION
    //----------------------------------------------------------

    const direction =
        action.donnees?.direction ??
        "vers_adversaire";


    let dx = 0;
    let dy = 0;
    let dz = 0;


    if (
        direction ===
        "vers_adversaire"
    ) {

        const vx =
            adversaire.position.x -
            joueur.position.x;


        const vy =
            adversaire.position.y -
            joueur.position.y;


        const vz =
            adversaire.position.z -
            joueur.position.z;


        const longueur =
            Math.sqrt(
                vx * vx +
                vy * vy +
                vz * vz
            );


        if (
            longueur > 0
        ) {

            dx =
                (vx / longueur) *
                distance;

            dy =
                (vy / longueur) *
                distance;

            dz =
                (vz / longueur) *
                distance;
        }
    }


    if (
        direction ===
        "eloignement"
    ) {

        const vx =
            joueur.position.x -
            adversaire.position.x;


        const vy =
            joueur.position.y -
            adversaire.position.y;


        const vz =
            joueur.position.z -
            adversaire.position.z;


        const longueur =
            Math.sqrt(
                vx * vx +
                vy * vy +
                vz * vz
            );


        if (
            longueur > 0
        ) {

            dx =
                (vx / longueur) *
                distance;

            dy =
                (vy / longueur) *
                distance;

            dz =
                (vz / longueur) *
                distance;
        }
    }


    //----------------------------------------------------------
    // 📍 APPLICATION
    //----------------------------------------------------------

    joueur.position.x +=
        dx;

    joueur.position.y +=
        dy;

    joueur.position.z +=
        dz;


    const distanceApres =
        calculerDistanceCombat(
            joueur,
            adversaire
        );


    joueur.statistiques.deplacements =
        (joueur.statistiques.deplacements ?? 0) + 1;


    return {

        resultat:
            RESULTATS_COMBAT_ALLSTARS.DEPLACEMENT,

        joueur:
            joueur.jid,

        distanceAvant,

        distanceApres,

        distanceParcourue:
            distance,

        raison:
            "Déplacement effectué."
    };
}


//==============================================================
// ⚔️ RÉSOUDRE DEUX ACTIONS
//==============================================================

function resoudreDeuxActionsCombat({

    joueurA,

    joueurB,

    actionA,

    actionB

} = {}) {


    if (
        !joueurA ||
        !joueurB
    ) {

        return {

            succes: false,

            raison:
                "Combattants introuvables."
        };
    }


    actionA =
        normaliserActionCombat(
            actionA
        );


    actionB =
        normaliserActionCombat(
            actionB
        );


    //----------------------------------------------------------
    // 🏃 DÉPLACEMENTS SIMULTANÉS
    //----------------------------------------------------------

    const deplacementA =
        [
            "deplacement",
            "course",
            "sprint",
            "dash"
        ].includes(
            actionA.type
        );


    const deplacementB =
        [
            "deplacement",
            "course",
            "sprint",
            "dash"
        ].includes(
            actionB.type
        );


    if (
        deplacementA
    ) {

        resoudreDeplacementCombat({

            joueur:
                joueurA,

            adversaire:
                joueurB,

            action:
                actionA
        });
    }


    if (
        deplacementB
    ) {

        resoudreDeplacementCombat({

            joueur:
                joueurB,

            adversaire:
                joueurA,

            action:
                actionB
        });
    }


    //----------------------------------------------------------
    // 👊 ACTION A → B
    //----------------------------------------------------------

    let resultatA = null;


    if (
        [
            "attaque",
            "frappe",
            "coup"
        ].includes(
            actionA.type
        )
    ) {

        resultatA =
            resoudreAttaqueCombat({

                attaquant:
                    joueurA,

                defenseur:
                    joueurB,

                actionAttaquant:
                    actionA,

                actionDefenseur:
                    actionB
            });
    }


    //----------------------------------------------------------
    // 🤼 SAISIE A → B
    //----------------------------------------------------------

    else if (
        [
            "saisie",
            "projection"
        ].includes(
            actionA.type
        )
    ) {

        resultatA =
            resoudreSaisieCombat({

                attaquant:
                    joueurA,

                defenseur:
                    joueurB,

                actionAttaquant:
                    actionA,

                actionDefenseur:
                    actionB
            });
    }


    //----------------------------------------------------------
    // 👊 ACTION B → A
    //----------------------------------------------------------

    let resultatB = null;


    if (
        [
            "attaque",
            "frappe",
            "coup"
        ].includes(
            actionB.type
        )
    ) {

        resultatB =
            resoudreAttaqueCombat({

                attaquant:
                    joueurB,

                defenseur:
                    joueurA,

                actionAttaquant:
                    actionB,

                actionDefenseur:
                    actionA
            });
    }


    //----------------------------------------------------------
    // 🤼 SAISIE B → A
    //----------------------------------------------------------

    else if (
        [
            "saisie",
            "projection"
        ].includes(
            actionB.type
        )
    ) {

        resultatB =
            resoudreSaisieCombat({

                attaquant:
                    joueurB,

                defenseur:
                    joueurA,

                actionAttaquant:
                    actionB,

                actionDefenseur:
                    actionA
            });
    }


    //----------------------------------------------------------
    // 🛑 ACTIONS NON OFFENSIVES
    //----------------------------------------------------------

    if (
        !resultatA
    ) {

        resultatA = {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            attaquant:
                joueurA.jid,

            raison:
                "Aucune action offensive résolue."
        };
    }


    if (
        !resultatB
    ) {

        resultatB = {

            resultat:
                RESULTATS_COMBAT_ALLSTARS.ECHEC,

            attaquant:
                joueurB.jid,

            raison:
                "Aucune action offensive résolue."
        };
    }


    return {

        succes: true,

        resultats: [

            {
                jid:
                    joueurA.jid,

                action:
                    actionA,

                resultat:
                    resultatA
            },

            {
                jid:
                    joueurB.jid,

                action:
                    actionB,

                resultat:
                    resultatB
            }
        ]
    };
}


//==============================================================
// ⚖️ ARBITRER UN TOUR
//==============================================================
// Cette fonction est le pont entre l'arbitre IA et le moteur.
//
// L'IA décide :
// "Joueur A attaque avec 20 de puissance."
//
// Le moteur applique réellement :
// - coût
// - portée
// - esquive
// - blocage
// - dégâts
// - PV
// - statistiques
// - position
//==============================================================

function arbitrerTourCombatAllStars({

    combat,

    intentions = {}

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const joueurA =
        obtenirJoueurCombat(
            combat,
            combat.ordre[0]
        );


    const joueurB =
        obtenirJoueurCombat(
            combat,
            combat.ordre[1]
        );


    if (
        !joueurA ||
        !joueurB
    ) {

        return {

            succes: false,

            raison:
                "Les deux combattants ne sont pas disponibles."
        };
    }


    //----------------------------------------------------------
    // 🧠 RÉCUPÉRATION DES INTENTIONS
    //----------------------------------------------------------

    const actionA =
        normaliserActionCombat(
            intentions[joueurA.jid] ??
            intentions.joueur1 ??
            intentions[joueurA.pseudo]
        );


    const actionB =
        normaliserActionCombat(
            intentions[joueurB.jid] ??
            intentions.joueur2 ??
            intentions[joueurB.pseudo]
        );


    //----------------------------------------------------------
    // 💰 COÛTS
    //----------------------------------------------------------

    const coutA =
        appliquerCoutsActionCombat(
            joueurA,
            actionA
        );


    const coutB =
        appliquerCoutsActionCombat(
            joueurB,
            actionB
        );


    //----------------------------------------------------------
    // ❌ RESSOURCES INSUFFISANTES
    //----------------------------------------------------------

    if (
        !coutA.succes
    ) {

        actionA.type =
            "attendre";


        actionA.coutStamina =
            0;


        actionA.coutEnergie =
            0;
    }


    if (
        !coutB.succes
    ) {

        actionB.type =
            "attendre";


        actionB.coutStamina =
            0;


        actionB.coutEnergie =
            0;
    }


    //----------------------------------------------------------
    // ⚔️ RÉSOLUTION
    //----------------------------------------------------------

    const resolution =
        resoudreDeuxActionsCombat({

            joueurA,

            joueurB,

            actionA,

            actionB
        });


    if (
        !resolution.succes
    ) {

        return resolution;
    }


    //----------------------------------------------------------
    // 📜 HISTORIQUE
    //----------------------------------------------------------

    combat.derniereAction = {

        tour:
            combat.tour + 1,

        actions: [

            {
                jid:
                    joueurA.jid,

                action:
                    actionA,

                resultat:
                    resolution.resultats[0]
            },

            {
                jid:
                    joueurB.jid,

                action:
                    actionB,

                resultat:
                    resolution.resultats[1]
            }
        ]
    };


    //----------------------------------------------------------
    // 📊 STATISTIQUES DOMINATION
    //----------------------------------------------------------

    for (
        const element of
        resolution.resultats
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                element.jid
            );


        if (!joueur) {
            continue;
        }


        const resultat =
            element.resultat;


        analyserDominationResultatCombat({

            joueur,

            resultat
        });
    }


    //----------------------------------------------------------
    // 📜 HISTORIQUE GLOBAL
    //----------------------------------------------------------

    combat.historique.push({

        type:
            "resolution_actions",

        tour:
            combat.tour + 1,

        resultats:
            resolution.resultats,

        positions: {

            [joueurA.jid]:
                {
                    ...joueurA.position
                },

            [joueurB.jid]:
                {
                    ...joueurB.position
                }
        },

        ressources: {

            [joueurA.jid]: {

                pv:
                    joueurA.pv,

                stamina:
                    joueurA.stamina,

                energie:
                    joueurA.energie
            },

            [joueurB.jid]: {

                pv:
                    joueurB.pv,

                stamina:
                    joueurB.stamina,

                energie:
                    joueurB.energie
            }
        }
    });


    return {

        succes: true,

        resultats:
            resolution.resultats,

        actions: {

            [joueurA.jid]:
                actionA,

            [joueurB.jid]:
                actionB
        }
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Résolution des actions ALL STARS chargée."
);

//==============================================================
// ⚔️ ALL STARS — GESTIONNAIRE DES TOURS ET DES PAVÉS
//==============================================================
// Ce module gère le déroulement réel d'un combat.
//
// 1. Le tour commence
// 2. Joueur 1 envoie son pavé
// 3. Joueur 2 envoie son pavé
// 4. Les deux pavés sont conservés
// 5. La résolution est lancée UNE SEULE FOIS
// 6. Le tour est terminé
// 7. On passe au tour suivant
//
// IMPORTANT :
//
// joueur 1 seul  → aucun tour terminé
// joueur 2 seul  → aucun tour terminé
// les deux      → résolution
// résolution    → tour +1
//
//==============================================================


//==============================================================
// ⚙️ CONFIGURATION DU GESTIONNAIRE
//==============================================================

const CONFIG_GESTION_TOURS_ALLSTARS = {

    tempsMaximumTour: 360000,

    toursMaximum: 10
};


//==============================================================
// 🧠 INITIALISER LE GESTIONNAIRE
//==============================================================

function initialiserGestionToursCombat(
    combat
) {

    if (!combat) {
        return null;
    }


    if (
        !combat.gestionTours
    ) {

        combat.gestionTours = {

            tourActuel:
                combat.tour ?? 0,

            pavésRecus: {},

            resolutionEnCours:
                false,

            tourEnCours:
                false,

            dernierTourResolu:
                0,

            toursHistorique: []
        };
    }


    return combat.gestionTours;
}


//==============================================================
// 🔄 DÉMARRER UN NOUVEAU TOUR
//==============================================================

function demarrerTourCombatAllStars(
    combat
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: false,

            raison:
                "Le combat est terminé."
        };
    }


    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    //----------------------------------------------------------
    // 🛑 NE PAS DÉMARRER DEUX FOIS
    //----------------------------------------------------------

    if (
        gestion.tourEnCours
    ) {

        return {

            succes: false,

            raison:
                "Un tour est déjà en cours."
        };
    }


    //----------------------------------------------------------
    // 🏁 LIMITE
    //----------------------------------------------------------

    if (
        combat.tour >=
        CONFIG_GESTION_TOURS_ALLSTARS
            .toursMaximum
    ) {

        return terminerCombatAllStars({

            combat,

            raison:
                "Les 10 tours sont terminés.",

            type:
                "decision"
        });
    }


    //----------------------------------------------------------
    // 🧹 NETTOYAGE
    //----------------------------------------------------------

    gestion.pavésRecus = {};

    gestion.resolutionEnCours =
        false;

    gestion.tourEnCours =
        true;


    gestion.tourActuel =
        combat.tour + 1;


    //----------------------------------------------------------
    // ACTIONS EN COURS
    //----------------------------------------------------------

    for (
        const jid of
        combat.ordre || []
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        joueur.actionEnCours =
            null;
    }


    return {

        succes: true,

        tour:
            gestion.tourActuel,

        joueursAyantJoue:
            []
    };
}


//==============================================================
// 📝 ENREGISTRER LE PAVÉ D'UN JOUEUR
//==============================================================
// "pave" peut être :
//
// - le texte brut envoyé par WhatsApp
// - une intention déjà interprétée
// - un objet d'action
//
// L'interprétation peut donc être branchée plus tard
// sans modifier le gestionnaire.
//
//==============================================================

async function enregistrerPaveCombatAllStars({

    combat,

    jid,

    pave,

    intention = null

} = {}) {


    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    //----------------------------------------------------------
    // 🛑 COMBAT TERMINÉ
    //----------------------------------------------------------

    if (
        combat.phase ===
        "termine"
    ) {

        return {

            succes: false,

            raison:
                "Le combat est terminé."
        };
    }


    //----------------------------------------------------------
    // 🧍 JOUEUR
    //----------------------------------------------------------

    const joueur =
        obtenirJoueurCombat(
            combat,
            jid
        );


    if (!joueur) {

        return {

            succes: false,

            raison:
                "Joueur introuvable."
        };
    }


    //----------------------------------------------------------
    // ⚙️ GESTION
    //----------------------------------------------------------

    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    //----------------------------------------------------------
    // 🔄 DÉMARRAGE AUTOMATIQUE
    //----------------------------------------------------------

    if (
        !gestion.tourEnCours
    ) {

        const debut =
            demarrerTourCombatAllStars(
                combat
            );


        if (
            !debut.succes
        ) {

            return debut;
        }
    }


    //----------------------------------------------------------
    // 🚫 JOUEUR DÉJÀ JOUÉ
    //----------------------------------------------------------

    if (
        gestion.pavésRecus[jid]
    ) {

        return {

            succes: false,

            raison:
                "Tu as déjà envoyé ton action pour ce tour.",

            tour:
                gestion.tourActuel
        };
    }


    //----------------------------------------------------------
    // 🧠 ACTION / INTENTION
    //----------------------------------------------------------

    let action =
        intention ??
        pave;


    action =
        normaliserActionCombat(
            action
        );


    //----------------------------------------------------------
    // 📦 STOCKAGE
    //----------------------------------------------------------

    gestion.pavésRecus[jid] = {

        jid,

        pave,

        action,

        timestamp:
            Date.now()
    };


    joueur.actionEnCours =
        action;


    //----------------------------------------------------------
    // 📊 NOMBRE DE JOUEURS AYANT JOUÉ
    //----------------------------------------------------------

    const nombrePaves =
        Object.keys(
            gestion.pavésRecus
        ).length;


    const nombreJoueurs =
        combat.ordre.length;


    //----------------------------------------------------------
    // ⏳ UN SEUL JOUEUR A JOUÉ
    //----------------------------------------------------------

    if (
        nombrePaves <
        nombreJoueurs
    ) {

        return {

            succes: true,

            tour:
                gestion.tourActuel,

            actionEnregistree:
                true,

            pretPourResolution:
                false,

            joueursAyantJoue:
                Object.keys(
                    gestion.pavésRecus
                ),

            joueursRestants:
                combat.ordre.filter(
                    id =>
                        !gestion.pavésRecus[id]
                )
        };
    }


    //----------------------------------------------------------
    // ⚔️ LES DEUX ONT JOUÉ
    //----------------------------------------------------------

    if (
        gestion.resolutionEnCours
    ) {

        return {

            succes: true,

            resolutionDejaLancee:
                true
        };
    }


    gestion.resolutionEnCours =
        true;


    //----------------------------------------------------------
    // 🧠 CONSTRUIRE LES INTENTIONS
    //----------------------------------------------------------

    const intentions = {};


    for (
        const joueurJid of
        combat.ordre
    ) {

        const entree =
            gestion.pavésRecus[
                joueurJid
            ];


        if (!entree) {
            continue;
        }


        intentions[joueurJid] =
            entree.action;
    }


    //----------------------------------------------------------
    // ⚖️ RÉSOLUTION DU TOUR
    //----------------------------------------------------------

    let resolution;


    try {

        resolution =
            await resoudreTourCombatAllStars({

                combat,

                intentions
            });

    } catch (error) {

        console.error(
            "❌ Erreur résolution tour ALL STARS :",
            error
        );


        gestion.resolutionEnCours =
            false;


        return {

            succes: false,

            raison:
                "Erreur pendant la résolution du tour.",

            erreur:
                error.message
        };
    }


    //----------------------------------------------------------
    // 🏁 TOUR TERMINÉ
    //----------------------------------------------------------

    gestion.dernierTourResolu =
        combat.tour;


    gestion.toursHistorique.push({

        tour:
            combat.tour,

        pavés:
            gestion.pavésRecus,

        resolution
    });


    gestion.tourEnCours =
        false;

    gestion.resolutionEnCours =
        false;


    //----------------------------------------------------------
    // 🛑 COMBAT TERMINÉ
    //----------------------------------------------------------

    if (
        resolution.termine
    ) {

        return {

            succes: true,

            tour:
                combat.tour,

            tourTermine:
                true,

            combatTermine:
                true,

            resolution
        };
    }


    //----------------------------------------------------------
    // 🔄 PRÉPARER LE TOUR SUIVANT
    //----------------------------------------------------------

    const prochainTour =
        demarrerTourCombatAllStars(
            combat
        );


    return {

        succes: true,

        tour:
            combat.tour,

        tourTermine:
            true,

        combatTermine:
            false,

        prochainTour:
            prochainTour.tour,

        resolution
    };
}


//==============================================================
// 🔎 SAVOIR SI LES DEUX JOUEURS ONT JOUÉ
//==============================================================

function combatAllStarsPretPourResolution(
    combat
) {

    if (!combat) {
        return false;
    }


    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    return combat.ordre.every(
        jid =>
            Boolean(
                gestion.pavésRecus[jid]
            )
    );
}


//==============================================================
// 👤 SAVOIR SI UN JOUEUR A DÉJÀ JOUÉ
//==============================================================

function joueurADejaJoueTourAllStars(
    combat,
    jid
) {

    if (
        !combat ||
        !jid
    ) {
        return false;
    }


    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    return Boolean(
        gestion.pavésRecus[jid]
    );
}


//==============================================================
// 📊 ÉTAT DU TOUR
//==============================================================

function obtenirEtatTourCombatAllStars(
    combat
) {

    if (!combat) {
        return null;
    }


    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    const joueurs =
        combat.ordre.map(
            jid => {

                const joueur =
                    obtenirJoueurCombat(
                        combat,
                        jid
                    );


                return {

                    jid,

                    pseudo:
                        joueur?.pseudo ??
                        "Inconnu",

                    aJoue:
                        Boolean(
                            gestion.pavésRecus[jid]
                        )
                };
            }
        );


    return {

        tour:
            gestion.tourActuel,

        tourCombat:
            combat.tour,

        tourEnCours:
            gestion.tourEnCours,

        resolutionEnCours:
            gestion.resolutionEnCours,

        pretPourResolution:
            combatAllStarsPretPourResolution(
                combat
            ),

        joueurs
    };
}


//==============================================================
// ⏱️ ANNULER / ABANDONNER LE TOUR
//==============================================================

function annulerTourCombatAllStars(
    combat,
    raison =
        "Tour annulé."
) {

    if (!combat) {

        return {

            succes: false,

            raison:
                "Combat introuvable."
        };
    }


    const gestion =
        initialiserGestionToursCombat(
            combat
        );


    if (
        gestion.resolutionEnCours
    ) {

        return {

            succes: false,

            raison:
                "La résolution est déjà en cours."
        };
    }


    gestion.pavésRecus = {};

    gestion.tourEnCours =
        false;

    gestion.resolutionEnCours =
        false;


    for (
        const jid of
        combat.ordre
    ) {

        const joueur =
            obtenirJoueurCombat(
                combat,
                jid
            );


        if (!joueur) {
            continue;
        }


        joueur.actionEnCours =
            null;
    }


    combat.historique.push({

        type:
            "tour_annule",

        tour:
            combat.tour + 1,

        raison,

        temps:
            combat.temps
    });


    return {

        succes: true,

        raison
    };
}


//==============================================================
// 🧪 DEBUG
//==============================================================

console.log(
    "⚔️ Gestionnaire des tours ALL STARS chargé."
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
