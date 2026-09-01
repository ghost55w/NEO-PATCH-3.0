//==============================================================
// 🧠 NEO AI — BASE DE CONNAISSANCES LINGUISTIQUES
//==============================================================
// NeoAI.js
//
// RÔLE :
// - Contenir le vocabulaire de NeoAI
// - Organiser les mots par catégories
// - Contenir les synonymes / antonymes
// - Contenir les expressions
// - Contenir les unités, temps, directions, etc.
// - Permettre à NeoAIchat.js de rechercher dans cette base
//
// ⚠️ CE FICHIER N'EST PAS L'ARBITRE D'UN JEU.
//
// NeoAIchat.js = moteur qui lit/analyse un texte
// NeoAI.js     = mémoire linguistique de NeoAI
//
// ARCHITECTURE :
//
// TEXTE
//   ↓
// NeoAIchat.js
//   ↓
// NORMALISATION
//   ↓
// RECHERCHE DANS NeoAI.js
//   ↓
// CATÉGORIES
//   ↓
// SYNONYMES
//   ↓
// CONTEXTE
//   ↓
// COMPRÉHENSION
//
//==============================================================


//==============================================================
// 📦 CONFIGURATION
//==============================================================

const NEOAI_CONFIG = {

    langues: [
        "fr",
        "en"
    ],

    langueDefaut: "fr",

    debug: true,

    maxActions: 20,

    version: "1.0.0"

};


//==============================================================
// 🧹 NORMALISATION
//==============================================================

function neoNormaliserTexte(texte = "") {

    if (
        typeof texte !== "string"
    ) {

        return "";

    }

    return texte

        .replace(/\s+/g, " ")

        .replace(/[’`]/g, "'")

        .replace(/[‐-‒–—]/g, "-")

        .replace(/\s+([,.!?;:])/g, "$1")

        .trim();

}


//==============================================================
// 🔡 MINUSCULE
//==============================================================

function neoMinuscule(texte = "") {

    return neoNormaliserTexte(
        texte
    ).toLowerCase();

}


//==============================================================
// 🧹 SUPPRESSION DES ACCENTS
//==============================================================

function neoSansAccents(texte = "") {

    return neoMinuscule(
        texte
    )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


//==============================================================
// 🧩 TOKENISATION
//==============================================================

function neoTokeniser(texte = "") {

    const texteNormalise =
        neoNormaliserTexte(
            texte
        );

    if (!texteNormalise) {

        return [];

    }

    return texteNormalise

        .split(/\s+/)

        .filter(Boolean);

}


//==============================================================
// ✂️ DÉCOUPAGE DES PHRASES
//==============================================================

function neoDecouperPhrases(texte = "") {

    const texteNormalise =
        neoNormaliserTexte(
            texte
        );

    if (!texteNormalise) {

        return [];

    }

    return texteNormalise

        .split(
            /(?<=[.!?])\s+/
        )

        .map(
            phrase =>
                phrase.trim()
        )

        .filter(Boolean);

}


//==============================================================
// 📚 NEO_VERBES
//==============================================================

const NEO_VERBES = {

    fr: [

        //======================================================
        // 🧠 Général
        //======================================================

        "être",
        "avoir",
        "faire",
        "aller",
        "venir",
        "voir",
        "regarder",
        "parler",
        "dire",
        "penser",
        "comprendre",
        "savoir",
        "vouloir",
        "pouvoir",
        "devoir",
        "sentir",
        "entendre",
        "écouter",
        "chercher",
        "trouver",


        //======================================================
        // 🚶 Déplacement
        //======================================================

        "marcher",
        "courir",
        "avancer",
        "reculer",
        "sauter",
        "tomber",
        "voler",
        "ramper",
        "grimper",
        "descendre",
        "monter",
        "entrer",
        "sortir",
        "arriver",
        "partir",
        "revenir",
        "approcher",
        "s'éloigner",
        "tourner",
        "accélérer",
        "ralentir",
        "voyager",


        //======================================================
        // ⚔️ Action / combat
        //======================================================

        "frapper",
        "attaquer",
        "défendre",
        "esquiver",
        "bloquer",
        "toucher",
        "prendre",
        "lancer",
        "attraper",
        "porter",
        "pousser",
        "tirer",
        "projeter",
        "saisir",
        "agripper",
        "immobiliser",
        "protéger",
        "viser",
        "combattre",
        "poursuivre",


        //======================================================
        // 🏠 Vie courante
        //======================================================

        "manger",
        "boire",
        "dormir",
        "se réveiller",
        "se lever",
        "s'asseoir",
        "s'allonger",
        "se laver",
        "se doucher",
        "se baigner",
        "s'habiller",
        "se déshabiller",
        "se coiffer",
        "se brosser",
        "nettoyer",
        "cuisiner",
        "préparer",
        "servir",
        "acheter",
        "vendre",
        "payer",
        "coûter",
        "gagner",
        "perdre",
        "travailler",
        "étudier",
        "apprendre",
        "lire",
        "écrire",
        "dessiner",
        "jouer",
        "chanter",
        "danser",
        "rire",
        "sourire",
        "pleurer",
        "aimer",
        "détester",
        "préférer",
        "choisir",
        "utiliser",
        "ouvrir",
        "fermer",
        "allumer",
        "éteindre",
        "attendre",
        "commencer",
        "finir",
        "continuer",
        "arrêter"

    ],


    //==========================================================
    // 🇬🇧 ANGLAIS
    //==========================================================

    en: [

        // 🧠 Général

        "be",
        "have",
        "do",
        "go",
        "come",
        "see",
        "watch",
        "speak",
        "say",
        "think",
        "understand",
        "know",
        "want",
        "can",
        "must",
        "feel",
        "hear",
        "listen",
        "search",
        "find",


        // 🚶 Déplacement

        "walk",
        "run",
        "move",
        "advance",
        "retreat",
        "jump",
        "fall",
        "fly",
        "crawl",
        "climb",
        "descend",
        "go up",
        "enter",
        "exit",
        "arrive",
        "leave",
        "return",
        "approach",
        "move away",
        "turn",
        "accelerate",
        "slow",
        "travel",


        // ⚔️ Action / combat

        "hit",
        "attack",
        "defend",
        "dodge",
        "block",
        "touch",
        "take",
        "throw",
        "catch",
        "carry",
        "push",
        "pull",
        "project",
        "grab",
        "grip",
        "immobilize",
        "protect",
        "aim",
        "fight",
        "pursue",


        // 🏠 Vie courante

        "eat",
        "drink",
        "sleep",
        "wake up",
        "get up",
        "sit down",
        "lie down",
        "wash",
        "shower",
        "bathe",
        "dress",
        "undress",
        "comb",
        "brush",
        "clean",
        "cook",
        "prepare",
        "serve",
        "buy",
        "sell",
        "pay",
        "cost",
        "win",
        "lose",
        "work",
        "study",
        "learn",
        "read",
        "write",
        "draw",
        "play",
        "sing",
        "dance",
        "laugh",
        "smile",
        "cry",
        "love",
        "hate",
        "prefer",
        "choose",
        "use",
        "open",
        "close",
        "turn on",
        "turn off",
        "wait",
        "start",
        "finish",
        "continue",
        "stop"

    ]

};


const NEO_VERBES_SPECIAUX = {
    //==========================================================
    // 🔴 ÊTRE / AVOIR
    //==========================================================

    "être": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "été",

        present: {
            je: "suis",
            tu: "es",
            il: "est",
            elle: "est",
            on: "est",
            nous: "sommes",
            vous: "êtes",
            ils: "sont",
            elles: "sont"
        },

        futur: {
            je: "serai",
            tu: "seras",
            il: "sera",
            elle: "sera",
            on: "sera",
            nous: "serons",
            vous: "serez",
            ils: "seront",
            elles: "seront"
        }
    },


    "avoir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "eu",

        present: {
            je: "ai",
            tu: "as",
            il: "a",
            elle: "a",
            on: "a",
            nous: "avons",
            vous: "avez",
            ils: "ont",
            elles: "ont"
        },

        futur: {
            je: "aurai",
            tu: "auras",
            il: "aura",
            elle: "aura",
            on: "aura",
            nous: "aurons",
            vous: "aurez",
            ils: "auront",
            elles: "auront"
        }
    },


    //==========================================================
    // 🔴 VERBES TRÈS IRRÉGULIERS
    //==========================================================

    "aller": {
        type: "irregulier",
        auxiliaire: "être",
        participePasse: "allé",

        present: {
            je: "vais",
            tu: "vas",
            il: "va",
            elle: "va",
            on: "va",
            nous: "allons",
            vous: "allez",
            ils: "vont",
            elles: "vont"
        },

        futur: {
            je: "irai",
            tu: "iras",
            il: "ira",
            elle: "ira",
            on: "ira",
            nous: "irons",
            vous: "irez",
            ils: "iront",
            elles: "iront"
        }
    },


    "faire": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "fait",

        present: {
            je: "fais",
            tu: "fais",
            il: "fait",
            elle: "fait",
            on: "fait",
            nous: "faisons",
            vous: "faites",
            ils: "font",
            elles: "font"
        },

        futur: {
            je: "ferai",
            tu: "feras",
            il: "fera",
            elle: "fera",
            on: "fera",
            nous: "ferons",
            vous: "ferez",
            ils: "feront",
            elles: "feront"
        }
    },


    "venir": {
        type: "irregulier",
        auxiliaire: "être",
        participePasse: "venu",

        present: {
            je: "viens",
            tu: "viens",
            il: "vient",
            elle: "vient",
            on: "vient",
            nous: "venons",
            vous: "venez",
            ils: "viennent",
            elles: "viennent"
        },

        futur: {
            je: "viendrai",
            tu: "viendras",
            il: "viendra",
            elle: "viendra",
            on: "viendra",
            nous: "viendrons",
            vous: "viendrez",
            ils: "viendront",
            elles: "viendront"
        }
    },


    "voir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "vu",

        present: {
            je: "vois",
            tu: "vois",
            il: "voit",
            elle: "voit",
            on: "voit",
            nous: "voyons",
            vous: "voyez",
            ils: "voient",
            elles: "voient"
        },

        futur: {
            je: "verrai",
            tu: "verras",
            il: "verra",
            elle: "verra",
            on: "verra",
            nous: "verrons",
            vous: "verrez",
            ils: "verront",
            elles: "verront"
        }
    },


    "pouvoir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "pu",

        present: {
            je: "peux",
            tu: "peux",
            il: "peut",
            elle: "peut",
            on: "peut",
            nous: "pouvons",
            vous: "pouvez",
            ils: "peuvent",
            elles: "peuvent"
        },

        futur: {
            je: "pourrai",
            tu: "pourras",
            il: "pourra",
            elle: "pourra",
            on: "pourra",
            nous: "pourrons",
            vous: "pourrez",
            ils: "pourront",
            elles: "pourront"
        }
    },


    "vouloir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "voulu",

        present: {
            je: "veux",
            tu: "veux",
            il: "veut",
            elle: "veut",
            on: "veut",
            nous: "voulons",
            vous: "voulez",
            ils: "veulent",
            elles: "veulent"
        },

        futur: {
            je: "voudrai",
            tu: "voudras",
            il: "voudra",
            elle: "voudra",
            on: "voudra",
            nous: "voudrons",
            vous: "voudrez",
            ils: "voudront",
            elles: "voudront"
        }
    },


    "devoir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "dû",

        present: {
            je: "dois",
            tu: "dois",
            il: "doit",
            elle: "doit",
            on: "doit",
            nous: "devons",
            vous: "devez",
            ils: "doivent",
            elles: "doivent"
        },

        futur: {
            je: "devrai",
            tu: "devras",
            il: "devra",
            elle: "devra",
            on: "devra",
            nous: "devrons",
            vous: "devrez",
            ils: "devront",
            elles: "devront"
        }
    },


    "savoir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "su",

        present: {
            je: "sais",
            tu: "sais",
            il: "sait",
            elle: "sait",
            on: "sait",
            nous: "savons",
            vous: "savez",
            ils: "savent",
            elles: "savent"
        },

        futur: {
            je: "saurai",
            tu: "sauras",
            il: "saura",
            elle: "saura",
            on: "saura",
            nous: "saurons",
            vous: "saurez",
            ils: "sauront",
            elles: "sauront"
        }
    },


    "prendre": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "pris",

        present: {
            je: "prends",
            tu: "prends",
            il: "prend",
            elle: "prend",
            on: "prend",
            nous: "prenons",
            vous: "prenez",
            ils: "prennent",
            elles: "prennent"
        },

        futur: {
            je: "prendrai",
            tu: "prendras",
            il: "prendra",
            elle: "prendra",
            on: "prendra",
            nous: "prendrons",
            vous: "prendrez",
            ils: "prendront",
            elles: "prendront"
        }
    },


    "mettre": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "mis",

        present: {
            je: "mets",
            tu: "mets",
            il: "met",
            elle: "met",
            on: "met",
            nous: "mettons",
            vous: "mettez",
            ils: "mettent",
            elles: "mettent"
        },

        futur: {
            je: "mettrai",
            tu: "mettras",
            il: "mettra",
            elle: "mettra",
            on: "mettra",
            nous: "mettrons",
            vous: "mettrez",
            ils: "mettront",
            elles: "mettront"
        }
    },


    "dire": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "dit",

        present: {
            je: "dis",
            tu: "dis",
            il: "dit",
            elle: "dit",
            on: "dit",
            nous: "disons",
            vous: "dites",
            ils: "disent",
            elles: "disent"
        },

        futur: {
            je: "dirai",
            tu: "diras",
            il: "dira",
            elle: "dira",
            on: "dira",
            nous: "dirons",
            vous: "direz",
            ils: "diront",
            elles: "diront"
        }
    },


    "écrire": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "écrit",

        present: {
            je: "écris",
            tu: "écris",
            il: "écrit",
            elle: "écrit",
            on: "écrit",
            nous: "écrivons",
            vous: "écrivez",
            ils: "écrivent",
            elles: "écrivent"
        },

        futur: {
            je: "écrirai",
            tu: "écriras",
            il: "écrira",
            elle: "écrira",
            on: "écrira",
            nous: "écrirons",
            vous: "écrirez",
            ils: "écriront",
            elles: "écriront"
        }
    },


    "lire": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "lu",

        present: {
            je: "lis",
            tu: "lis",
            il: "lit",
            elle: "lit",
            on: "lit",
            nous: "lisons",
            vous: "lisez",
            ils: "lisent",
            elles: "lisent"
        },

        futur: {
            je: "lirai",
            tu: "liras",
            il: "lira",
            elle: "lira",
            on: "lira",
            nous: "lirons",
            vous: "lirez",
            ils: "liront",
            elles: "liront"
        }
    },


    "boire": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "bu",

        present: {
            je: "bois",
            tu: "bois",
            il: "boit",
            elle: "boit",
            on: "boit",
            nous: "buvons",
            vous: "buvez",
            ils: "boivent",
            elles: "boivent"
        },

        futur: {
            je: "boirai",
            tu: "boiras",
            il: "boira",
            elle: "boira",
            on: "boira",
            nous: "boirons",
            vous: "boirez",
            ils: "boiront",
            elles: "boiront"
        }
    },


    "manger": {
        type: "regulier",
        auxiliaire: "avoir",
        participePasse: "mangé",

        present: {
            je: "mange",
            tu: "manges",
            il: "mange",
            elle: "mange",
            on: "mange",
            nous: "mangeons",
            vous: "mangez",
            ils: "mangent",
            elles: "mangent"
        }
    },


    "venir": {
        type: "irregulier",
        auxiliaire: "être",
        participePasse: "venu"
    },


    "dormir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "dormi",

        present: {
            je: "dors",
            tu: "dors",
            il: "dort",
            elle: "dort",
            on: "dort",
            nous: "dormons",
            vous: "dormez",
            ils: "dorment",
            elles: "dorment"
        },

        futur: {
            je: "dormirai",
            tu: "dormiras",
            il: "dormira",
            elle: "dormira",
            on: "dormira",
            nous: "dormirons",
            vous: "dormirez",
            ils: "dormiront",
            elles: "dormiront"
        }
    },


    "courir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "couru",

        present: {
            je: "cours",
            tu: "cours",
            il: "court",
            elle: "court",
            on: "court",
            nous: "courons",
            vous: "courez",
            ils: "courent",
            elles: "courent"
        },

        futur: {
            je: "courrai",
            tu: "courras",
            il: "courra",
            elle: "courra",
            on: "courra",
            nous: "courrons",
            vous: "courrez",
            ils: "courront",
            elles: "courront"
        }
    },


    "venir": {
        type: "irregulier",
        auxiliaire: "être",
        participePasse: "venu"
    },


    "tenir": {
        type: "irregulier",
        auxiliaire: "avoir",
        participePasse: "tenu",

        present: {
            je: "tiens",
            tu: "tiens",
            il: "tient",
            elle: "tient",
            on: "tient",
            nous: "tenons",
            vous: "tenez",
            ils: "tiennent",
            elles: "tiennent"
        },

        futur: {
            je: "tiendrai",
            tu: "tiendras",
            il: "tiendra",
            elle: "tiendra",
            on: "tiendra",
            nous: "tiendrons",
            vous: "tiendrez",
            ils: "tiendront",
            elles: "tiendront"
        }
    },


    //==========================================================
    // 🟠 CAS PARTICULIERS EN -IR
    //==========================================================

    "ouvrir": {
        type: "particulier",
        auxiliaire: "avoir",
        participePasse: "ouvert",

        present: {
            je: "ouvre",
            tu: "ouvres",
            il: "ouvre",
            elle: "ouvre",
            on: "ouvre",
            nous: "ouvrons",
            vous: "ouvrez",
            ils: "ouvrent",
            elles: "ouvrent"
        },

        futur: {
            je: "ouvrirai",
            tu: "ouvriras",
            il: "ouvrira",
            elle: "ouvrira",
            on: "ouvrira",
            nous: "ouvrirons",
            vous: "ouvrirez",
            ils: "ouvriront",
            elles: "ouvriront"
        }
    },


    "offrir": {
        type: "particulier",
        auxiliaire: "avoir",
        participePasse: "offert",

        present: {
            je: "offre",
            tu: "offres",
            il: "offre",
            elle: "offre",
            on: "offre",
            nous: "offrons",
            vous: "offrez",
            ils: "offrent",
            elles: "offrent"
        },

        futur: {
            je: "offrirai",
            tu: "offriras",
            il: "offrira",
            elle: "offrira",
            on: "offrira",
            nous: "offrirons",
            vous: "offrirez",
            ils: "offriront",
            elles: "offriront"
        }
    },


    //==========================================================
    // 🟡 VERBES PRONOMINAUX
    //==========================================================

    "s'éloigner": {
        type: "pronominal",
        verbeBase: "éloigner",
        auxiliaire: "être",
        participePasse: "éloigné"
    },

    "se réveiller": {
        type: "pronominal",
        verbeBase: "réveiller",
        auxiliaire: "être",
        participePasse: "réveillé"
    },

    "se lever": {
        type: "pronominal",
        verbeBase: "lever",
        auxiliaire: "être",
        participePasse: "levé"
    },

    "s'asseoir": {
        type: "pronominal",
        verbeBase: "asseoir",
        auxiliaire: "être",
        participePasse: "assis"
    },

    "s'allonger": {
        type: "pronominal",
        verbeBase: "allonger",
        auxiliaire: "être",
        participePasse: "allongé"
    },

    "se laver": {
        type: "pronominal",
        verbeBase: "laver",
        auxiliaire: "être",
        participePasse: "lavé"
    },

    "se baigner": {
        type: "pronominal",
        verbeBase: "baigner",
        auxiliaire: "être",
        participePasse: "baigné"
    },

    "s'habiller": {
        type: "pronominal",
        verbeBase: "habiller",
        auxiliaire: "être",
        participePasse: "habillé"
    },

    "se déshabiller": {
        type: "pronominal",
        verbeBase: "déshabiller",
        auxiliaire: "être",
        participePasse: "déshabillé"
    },

    "se coiffer": {
        type: "pronominal",
        verbeBase: "coiffer",
        auxiliaire: "être",
        participePasse: "coiffé"
    }

};

//==============================================================
// 📚 NEO_NOMS
//==============================================================

const NEO_NOMS = {

    fr: [

        "personne",
        "homme",
        "femme",
        "enfant",
        "joueur",
        "adversaire",
        "ami",
        "ennemi",

        "corps",
        "tête",
        "visage",
        "bras",
        "main",
        "jambe",
        "pied",

        "terrain",
        "sol",
        "mur",
        "porte",
        "route",
        "ville",
        "pays",
        "monde",

        "temps",
        "distance",
        "vitesse",
        "direction",
        "position",
        "action",
        "mouvement"

    ],

    en: [

        "person",
        "man",
        "woman",
        "child",
        "player",
        "opponent",
        "friend",
        "enemy",

        "body",
        "head",
        "face",
        "arm",
        "hand",
        "leg",
        "foot",

        "ground",
        "wall",
        "door",
        "road",
        "city",
        "country",
        "world",

        "time",
        "distance",
        "speed",
        "direction",
        "position",
        "action",
        "movement"

    ]

};


//==============================================================
// 📚 NEO_ADJECTIFS
//==============================================================

const NEO_ADJECTIFS = {

    fr: [

        "grand",
        "petit",
        "rapide",
        "lent",
        "fort",
        "faible",
        "proche",
        "loin",
        "long",
        "court",

        "haut",
        "bas",
        "gauche",
        "droit",

        "violent",
        "puissant",
        "précis",
        "direct",
        "brutal",
        "calme",

        "immédiat",
        "simultané",
        "successif"

    ],

    en: [

        "big",
        "small",
        "fast",
        "slow",
        "strong",
        "weak",
        "near",
        "far",
        "long",
        "short",

        "high",
        "low",
        "left",
        "right",

        "violent",
        "powerful",
        "precise",
        "direct",
        "brutal",
        "calm",

        "immediate",
        "simultaneous",
        "successive"

    ]

};


//==============================================================
// 📚 NEO_ADVERBES
//==============================================================

const NEO_ADVERBES = {

    fr: [

        "rapidement",
        "lentement",
        "immédiatement",
        "directement",
        "brusquement",
        "précisément",
        "fortement",
        "doucement",
        "soudainement",
        "actuellement",
        "maintenant",
        "ensuite",
        "déjà",
        "encore",
        "toujours",
        "jamais",
        "souvent",
        "parfois"

    ],

    en: [

        "quickly",
        "slowly",
        "immediately",
        "directly",
        "suddenly",
        "precisely",
        "strongly",
        "gently",
        "currently",
        "now",
        "then",
        "already",
        "again",
        "always",
        "never",
        "often",
        "sometimes"

    ]

};


//==============================================================
// 📚 NEO_SYNONYMES
//==============================================================

const NEO_SYNONYMES = {

    fr: {

        courir: [
            "courir",
            "foncer",
            "sprinter",
            "se précipiter"
        ],

        frapper: [
            "frapper",
            "taper",
            "cogner",
            "porter un coup"
        ],

        regarder: [
            "regarder",
            "observer",
            "fixer",
            "contempler"
        ],

        avancer: [
            "avancer",
            "progresser",
            "se déplacer vers",
            "aller vers"
        ],

        reculer: [
            "reculer",
            "se retirer",
            "s'éloigner"
        ],

        rapide: [
            "rapide",
            "vite",
            "vif",
            "prompt"
        ],

        lent: [
            "lent",
            "lentement",
            "ralenti"
        ]

    },

    en: {

        run: [
            "run",
            "sprint",
            "rush"
        ],

        hit: [
            "hit",
            "strike",
            "punch",
            "smash"
        ],

        look: [
            "look",
            "watch",
            "observe",
            "stare"
        ],

        move: [
            "move",
            "advance",
            "approach"
        ]

    }

};


//==============================================================
// 📚 NEO_ANTONYMES
//==============================================================

const NEO_ANTONYMES = {

    fr: {

        grand: [
            "petit"
        ],

        petit: [
            "grand"
        ],

        rapide: [
            "lent"
        ],

        lent: [
            "rapide"
        ],

        avancer: [
            "reculer"
        ],

        reculer: [
            "avancer"
        ],

        entrer: [
            "sortir"
        ],

        sortir: [
            "entrer"
        ],

        proche: [
            "loin"
        ],

        loin: [
            "proche"
        ]

    },

    en: {

        big: [
            "small"
        ],

        small: [
            "big"
        ],

        fast: [
            "slow"
        ],

        slow: [
            "fast"
        ],

        advance: [
            "retreat"
        ],

        enter: [
            "exit"
        ]

    }

};


//==============================================================
// 📚 NEO_CONNECTEURS
//==============================================================

const NEO_CONNECTEURS = {

    succession: [

        "puis",
        "ensuite",
        "après",
        "dans la foulée",
        "immédiatement",
        "enchaîne",
        "enchaîne puis",
        "aussitôt",

        "then",
        "after",
        "afterwards",
        "immediately",
        "next"

    ],

    simultaneite: [

        "pendant que",
        "alors que",
        "en même temps",

        "while",
        "at the same time"

    ],

    condition: [

        "si",
        "lorsque",
        "quand",
        "dès que",
        "une fois que",

        "if",
        "when",
        "once",
        "as soon as"

    ],

    opposition: [

        "mais",
        "cependant",
        "pourtant",
        "toutefois",
        "en revanche",

        "but",
        "however",
        "yet",
        "instead"

    ]

};


//==============================================================
// 📚 NEO_PREPOSITIONS
//==============================================================

const NEO_PREPOSITIONS = {

    fr: [

        "à",
        "de",
        "dans",
        "sur",
        "sous",
        "avec",
        "sans",
        "pour",
        "contre",
        "vers",
        "entre",
        "par",
        "chez",
        "devant",
        "derrière",
        "près de",
        "loin de",
        "au-dessus de",
        "en dessous de"

    ],

    en: [

        "to",
        "from",
        "in",
        "on",
        "under",
        "with",
        "without",
        "for",
        "against",
        "toward",
        "between",
        "by",
        "behind",
        "near",
        "far from",
        "above",
        "below"

    ]

};


//==============================================================
// 📚 NEO_PRONOMS
//==============================================================

const NEO_PRONOMS = {

    fr: {

        personnels: [
            "je",
            "tu",
            "il",
            "elle",
            "on",
            "nous",
            "vous",
            "ils",
            "elles"
        ],

        objets: [
            "le",
            "la",
            "les",
            "lui",
            "leur",
            "eux",
            "y",
            "en"
        ]

    },

    en: {

        personnels: [
            "i",
            "you",
            "he",
            "she",
            "it",
            "we",
            "they"
        ],

        objets: [
            "him",
            "her",
            "them",
            "it",
            "us"
        ]

    }

};


//==============================================================
// 📚 NEO_EXPRESSIONS
//==============================================================

const NEO_EXPRESSIONS = {

    fr: [

        "à toute vitesse",
        "à pleine vitesse",
        "à grande vitesse",
        "dans la foulée",
        "en un instant",
        "au même moment",
        "face à",
        "en direction de",
        "à proximité de",
        "à distance",
        "au corps à corps",
        "à bout portant"

    ],

    en: [

        "at full speed",
        "at high speed",
        "in an instant",
        "at the same time",
        "facing",
        "toward",
        "near",
        "at a distance",
        "close range",
        "point blank"

    ]

};


//==============================================================
// 📚 NEO_UNITES
//==============================================================

const NEO_UNITES = {

    distance: [

        "mm",
        "cm",
        "m",
        "km",
        "millimètre",
        "centimètre",
        "mètre",
        "kilomètre"

    ],

    temps: [

        "ms",
        "s",
        "min",
        "h",
        "seconde",
        "secondes",
        "minute",
        "minutes",
        "heure",
        "heures"

    ],

    vitesse: [

        "m/s",
        "km/h",
        "mph"

    ]

};


//==============================================================
// 📚 NEO_TEMPS
//==============================================================

const NEO_TEMPS = {

    fr: [

        "maintenant",
        "avant",
        "après",
        "ensuite",
        "plus tard",
        "bientôt",
        "immédiatement",
        "hier",
        "aujourd'hui",
        "demain",
        "matin",
        "midi",
        "soir",
        "nuit"

    ],

    en: [

        "now",
        "before",
        "after",
        "then",
        "later",
        "soon",
        "immediately",
        "yesterday",
        "today",
        "tomorrow",
        "morning",
        "noon",
        "evening",
        "night"

    ]

};


//==============================================================
// 📚 NEO_DIRECTIONS
//==============================================================

const NEO_DIRECTIONS = {

    fr: [

        "gauche",
        "droite",
        "devant",
        "derrière",
        "haut",
        "bas",
        "nord",
        "sud",
        "est",
        "ouest",
        "vers",
        "depuis",
        "en direction de",
        "à gauche",
        "à droite"

    ],

    en: [

        "left",
        "right",
        "front",
        "behind",
        "up",
        "down",
        "north",
        "south",
        "east",
        "west",
        "toward",
        "from",
        "in the direction of"

    ]

};


//==============================================================
// 📚 NEO_PARTIES_CORPS
//==============================================================

const NEO_PARTIES_CORPS = {

    fr: [

        "tête",
        "visage",
        "front",
        "œil",
        "yeux",
        "nez",
        "bouche",
        "menton",
        "mâchoire",
        "cou",
        "épaule",
        "bras",
        "avant-bras",
        "coude",
        "poignet",
        "main",
        "doigt",
        "torse",
        "poitrine",
        "ventre",
        "abdomen",
        "dos",
        "hanche",
        "cuisse",
        "genou",
        "jambe",
        "cheville",
        "pied",
        "talon",
        "plante",
        "orteil"

    ],

    en: [

        "head",
        "face",
        "forehead",
        "eye",
        "eyes",
        "nose",
        "mouth",
        "chin",
        "jaw",
        "neck",
        "shoulder",
        "arm",
        "forearm",
        "elbow",
        "wrist",
        "hand",
        "finger",
        "chest",
        "torso",
        "stomach",
        "abdomen",
        "back",
        "hip",
        "thigh",
        "knee",
        "leg",
        "ankle",
        "foot",
        "heel",
        "sole",
        "toe"

    ]

};


//==============================================================
// 📚 NEO_EMOTIONS
//==============================================================

const NEO_EMOTIONS = {

    positives: [

        "joie",
        "bonheur",
        "amour",
        "plaisir",
        "confiance",
        "espoir",
        "fierté",
        "excitation",
        "enthousiasme",

        "joy",
        "happiness",
        "love",
        "pleasure",
        "confidence",
        "hope",
        "pride",
        "excitement"

    ],

    negatives: [

        "tristesse",
        "peur",
        "colère",
        "haine",
        "stress",
        "angoisse",
        "panique",
        "déception",

        "sadness",
        "fear",
        "anger",
        "hate",
        "stress",
        "anxiety",
        "panic",
        "disappointment"

    ]

};


//==============================================================
// 📚 NEO_INTENSITE
//==============================================================

const NEO_INTENSITE = {

    faible: [

        "un peu",
        "légèrement",
        "doucement",
        "faiblement",
        "presque"

    ],

    moyenne: [

        "assez",
        "normalement",
        "modérément"

    ],

    forte: [

        "très",
        "extrêmement",
        "fortement",
        "énormément",
        "totalement",
        "complètement",
        "brutalement"

    ]

};


//==============================================================
// 📚 NEO_VITESSE
//==============================================================

const NEO_VITESSE = {

    lente: [

        "lent",
        "lentement",
        "doucement",
        "au ralenti"

    ],

    normale: [

        "normalement",
        "à vitesse normale",
        "à vitesse moyenne"

    ],

    rapide: [

        "rapidement",
        "vite",
        "très vite",
        "à grande vitesse",
        "à pleine vitesse",
        "à toute vitesse",
        "vitesse maximale",
        "vmax",
        "full speed",
        "full vitesse"

    ]

};

//==============================================================
// 📚 NEO_RELATIONS
//==============================================================

const NEO_RELATIONS = {

    fr: {

        possession: [

            "à",
            "de",
            "appartient à",
            "possède"

        ],

        opposition: [

            "contre",
            "face à",
            "opposé à",
            "adversaire de"

        ],

        proximite: [

            "près de",
            "proche de",
            "à côté de",
            "à proximité de"

        ],

        eloignement: [

            "loin de",
            "éloigné de",
            "à distance de"

        ]

    },

    en: {

        possession: [

            "of",
            "belongs to",
            "owns"

        ],

        opposition: [

            "against",
            "facing",
            "opposite"

        ],

        proximite: [

            "near",
            "close to",
            "next to"

        ],

        eloignement: [

            "far from",
            "away from",
            "at a distance from"

        ]

    }

};

//==============================================================
// 🥊 NEO_COMBAT
//==============================================================

const NEO_COMBAT = {

    attaques: {

        fr: [
            "attaque",
            "offensive",
            "assaut",
            "agression"
        ],

        en: [
            "attack",
            "offensive",
            "assault"
        ]

    },


    frappes: {

        fr: [
            "frappe",
            "coup",
            "impact",
            "strike"
        ],

        en: [
            "strike",
            "hit",
            "blow"
        ]

    },


    coups_de_poing: {

        fr: [
            "coup de poing",
            "direct",
            "jab",
            "cross",
            "crochet",
            "uppercut",
            "overhand",
            "coup de poing direct"
        ],

        en: [
            "punch",
            "jab",
            "cross",
            "hook",
            "uppercut",
            "overhand",
            "straight"
        ]

    },


    coups_de_pied: {

        fr: [
            "coup de pied",
            "coup de pied frontal",
            "front kick",
            "roundhouse",
            "coup de pied circulaire",
            "side kick",
            "coup de pied latéral",
            "back kick",
            "coup de pied retourné",
            "hook kick",
            "axe kick",
            "low kick",
            "spinning back kick"
        ],

        en: [
            "kick",
            "front kick",
            "roundhouse kick",
            "side kick",
            "back kick",
            "hook kick",
            "axe kick",
            "low kick",
            "spinning back kick"
        ]

    },


    genoux: {

        fr: [
            "genou",
            "coup de genou",
            "genou direct",
            "genou sauté"
        ],

        en: [
            "knee",
            "knee strike",
            "knee kick",
            "flying knee"
        ]

    },


    coudes: {

        fr: [
            "coude",
            "coup de coude",
            "coude horizontal",
            "coude circulaire",
            "coude remontant"
        ],

        en: [
            "elbow",
            "elbow strike",
            "horizontal elbow",
            "rising elbow"
        ]

    },


    projections: {

        fr: [
            "projection",
            "jeter",
            "projeter",
            "faire tomber",
            "balayage",
            "fauchage"
        ],

        en: [
            "throw",
            "takedown",
            "sweep",
            "trip"
        ]

    },


    saisies: {

        fr: [
            "saisie",
            "attraper",
            "agripper",
            "empoigner",
            "tenir",
            "prise"
        ],

        en: [
            "grab",
            "grip",
            "hold",
            "clinch"
        ]

    },


    esquives: {

        fr: [
            "esquive",
            "esquiver",
            "éviter",
            "se décaler",
            "pas de côté",
            "retrait",
            "reculer pour éviter",
            "plonger",
            "se pencher"
        ],

        en: [
            "dodge",
            "evade",
            "avoid",
            "sidestep",
            "slip",
            "duck",
            "weave",
            "backstep"
        ]

    },


    blocages: {

        fr: [
            "blocage",
            "bloquer",
            "parer",
            "parade",
            "garde",
            "protection",
            "dévier"
        ],

        en: [
            "block",
            "guard",
            "parry",
            "deflect",
            "protect"
        ]

    },


    contres: {

        fr: [
            "contre",
            "contre-attaque",
            "riposte",
            "riposter",
            "contre offensif"
        ],

        en: [
            "counter",
            "counterattack",
            "counter strike",
            "retaliation"
        ]

    },


    immobilisations: {

        fr: [
            "immobilisation",
            "immobiliser",
            "clé",
            "clé de bras",
            "clé de jambe",
            "étranglement",
            "soumission"
        ],

        en: [
            "submission",
            "arm lock",
            "leg lock",
            "choke",
            "hold",
            "immobilization"
        ]

    },


    déplacements: {

        fr: [
            "avancer",
            "reculer",
            "pas de côté",
            "déplacement latéral",
            "approche",
            "retrait",
            "rotation",
            "pivot"
        ],

        en: [
            "advance",
            "retreat",
            "sidestep",
            "lateral movement",
            "approach",
            "pivot",
            "rotation"
        ]

    },


    gardes: {

        fr: [
            "garde",
            "garde haute",
            "garde basse",
            "garde ouverte",
            "garde fermée",
            "position de garde"
        ],

        en: [
            "guard",
            "high guard",
            "low guard",
            "open guard",
            "closed guard",
            "fighting stance"
        ]

    },


    acrobaties: {

        fr: [
            "saut",
            "roulade",
            "salto",
            "rotation",
            "vrille",
            "saut retourné",
            "rotation aérienne"
        ],

        en: [
            "jump",
            "roll",
            "flip",
            "spin",
            "aerial rotation"
        ]

    }

}; 

//==============================================================
// 🧠 NEO AI — CONCEPTS SÉMANTIQUES
//==============================================================
//
// Les concepts représentent les idées comprises par Neo.
//
// Plusieurs mots / expressions peuvent appartenir au même
// concept.
//
// Exemple :
//
// "courir"
// "foncer"
// "sprinter"
// "se précipiter"
//
//        ↓
//
// concept : deplacement_rapide
//
// NeoAIchat.js pourra ensuite utiliser ces concepts pour
// comprendre le sens global d'une phrase.
//
//==============================================================

const NEO_CONCEPTS = {

    //==========================================================
    // 🧠 GÉNÉRAL
    //==========================================================

    existence: {

        description:
            "Fait d'exister ou d'être présent",

        mots: [
            "être",
            "exister",
            "présent",
            "présente",
            "existe",
            "existence"
        ]

    },


    possession: {

        description:
            "Relation indiquant qu'une personne possède quelque chose",

        mots: [
            "avoir",
            "posséder",
            "appartenir",
            "appartient",
            "possède",
            "à",
            "de"
        ]

    },


    action: {

        description:
            "Action réalisée par un sujet",

        mots: [
            "faire",
            "agir",
            "action",
            "effectuer",
            "réaliser",
            "accomplir"
        ]

    },


    changement: {

        description:
            "Modification d'un état ou d'une situation",

        mots: [
            "changer",
            "modifier",
            "transformer",
            "évoluer",
            "devenir",
            "variation"
        ]

    },


    //==========================================================
    // 🚶 DÉPLACEMENT
    //==========================================================

    deplacement: {

        description:
            "Action de changer de position",

        mots: [
            "marcher",
            "courir",
            "avancer",
            "reculer",
            "bouger",
            "déplacer",
            "se déplacer",
            "partir",
            "arriver",
            "venir",
            "revenir",
            "voyager"
        ]

    },


    deplacement_rapide: {

        description:
            "Déplacement effectué à grande vitesse",

        mots: [
            "courir",
            "foncer",
            "sprinter",
            "se précipiter",
            "accélérer",
            "rapidement",
            "vite",
            "très vite",
            "à grande vitesse",
            "à pleine vitesse",
            "à toute vitesse",
            "vitesse maximale",
            "vmax",
            "full speed"
        ]

    },


    deplacement_lent: {

        description:
            "Déplacement effectué à faible vitesse",

        mots: [
            "marcher",
            "avancer lentement",
            "ralentir",
            "lentement",
            "doucement",
            "au ralenti"
        ]

    },


    approche: {

        description:
            "Action de réduire la distance vers une cible",

        mots: [
            "approcher",
            "s'approcher",
            "avancer vers",
            "venir vers",
            "aller vers",
            "se rapprocher",
            "progresser vers"
        ]

    },


    eloignement: {

        description:
            "Action d'augmenter la distance avec une cible",

        mots: [
            "reculer",
            "s'éloigner",
            "partir",
            "se retirer",
            "prendre ses distances",
            "éloigner",
            "fuir"
        ]

    },


    changement_direction: {

        description:
            "Action consistant à changer de direction",

        mots: [
            "tourner",
            "pivoter",
            "changer de direction",
            "faire demi-tour",
            "virer",
            "rotation"
        ]

    },


    mouvement_vertical: {

        description:
            "Mouvement vers le haut ou vers le bas",

        mots: [
            "monter",
            "descendre",
            "sauter",
            "tomber",
            "s'élever",
            "chuter"
        ]

    },


    mouvement_lateral: {

        description:
            "Déplacement vers la gauche ou la droite",

        mots: [
            "se décaler",
            "pas de côté",
            "déplacement latéral",
            "aller à gauche",
            "aller à droite",
            "sidestep"
        ]

    },


    //==========================================================
    // ⚔️ COMBAT
    //==========================================================

    combat: {

        description:
            "Situation ou action impliquant un affrontement",

        mots: [
            "combat",
            "combattre",
            "affrontement",
            "duel",
            "bataille",
            "confrontation"
        ]

    },


    attaque: {

        description:
            "Action offensive visant une cible",

        mots: [
            "attaquer",
            "attaque",
            "offensive",
            "assaut",
            "agression",
            "frapper",
            "coup"
        ]

    },


    frappe: {

        description:
            "Action consistant à porter un coup",

        mots: [
            "frapper",
            "frappe",
            "coup",
            "taper",
            "cogner",
            "impact",
            "porter un coup"
        ]

    },


    coup_de_poing: {

        description:
            "Frappe réalisée avec le poing",

        mots: [
            "coup de poing",
            "punch",
            "jab",
            "direct",
            "straight",
            "cross",
            "crochet",
            "hook",
            "uppercut",
            "overhand"
        ]

    },


    coup_de_pied: {

        description:
            "Frappe réalisée avec le pied ou la jambe",

        mots: [
            "coup de pied",
            "kick",
            "front kick",
            "roundhouse",
            "roundhouse kick",
            "side kick",
            "back kick",
            "hook kick",
            "axe kick",
            "low kick",
            "spinning back kick"
        ]

    },


    genou: {

        description:
            "Frappe ou action réalisée avec le genou",

        mots: [
            "genou",
            "coup de genou",
            "knee",
            "knee strike",
            "flying knee"
        ]

    },


    coude: {

        description:
            "Frappe réalisée avec le coude",

        mots: [
            "coude",
            "coup de coude",
            "elbow",
            "elbow strike",
            "coude horizontal",
            "coude circulaire"
        ]

    },


    projection: {

        description:
            "Action visant à faire tomber ou projeter une cible",

        mots: [
            "projeter",
            "projection",
            "jeter",
            "faire tomber",
            "takedown",
            "fauchage",
            "balayage",
            "sweep",
            "trip"
        ]

    },


    saisie: {

        description:
            "Action consistant à saisir une personne ou un objet",

        mots: [
            "saisir",
            "attraper",
            "agripper",
            "empoigner",
            "tenir",
            "prise",
            "grab",
            "grip",
            "hold"
        ]

    },


    immobilisation: {

        description:
            "Action visant à empêcher une cible de bouger",

        mots: [
            "immobiliser",
            "immobilisation",
            "maintenir",
            "bloquer",
            "clé",
            "clé de bras",
            "clé de jambe",
            "soumission",
            "submission",
            "choke"
        ]

    },


    defense: {

        description:
            "Action visant à empêcher ou réduire une attaque",

        mots: [
            "défendre",
            "défense",
            "protéger",
            "protection",
            "garde"
        ]

    },


    blocage: {

        description:
            "Action visant à bloquer une attaque",

        mots: [
            "bloquer",
            "blocage",
            "parer",
            "parade",
            "dévier",
            "guard",
            "block",
            "parry"
        ]

    },


    esquive: {

        description:
            "Action visant à éviter une attaque",

        mots: [
            "esquiver",
            "esquive",
            "éviter",
            "se décaler",
            "pas de côté",
            "retrait",
            "plonger",
            "se pencher",
            "dodge",
            "evade",
            "sidestep",
            "slip",
            "duck",
            "weave"
        ]

    },


    contre_attaque: {

        description:
            "Action offensive réalisée en réponse à une attaque",

        mots: [
            "contre",
            "contre-attaque",
            "riposte",
            "riposter",
            "contre offensif",
            "counter",
            "counterattack",
            "retaliation"
        ]

    },


    garde: {

        description:
            "Position destinée à se protéger ou combattre",

        mots: [
            "garde",
            "garde haute",
            "garde basse",
            "garde ouverte",
            "garde fermée",
            "position de garde",
            "fighting stance"
        ]

    },


    acrobatie: {

        description:
            "Mouvement physique impliquant une rotation ou un saut",

        mots: [
            "saut",
            "roulade",
            "salto",
            "vrille",
            "rotation aérienne",
            "flip",
            "spin",
            "roll"
        ]

    },


    //==========================================================
    // 🍽️ VIE COURANTE
    //==========================================================

    alimentation: {

        description:
            "Actions liées à la nourriture et à l'alimentation",

        mots: [
            "manger",
            "boire",
            "déjeuner",
            "dîner",
            "goûter",
            "cuisiner",
            "préparer",
            "se nourrir",
            "repas",
            "nourriture"
        ]

    },


    sommeil: {

        description:
            "Actions et états liés au sommeil",

        mots: [
            "dormir",
            "s'endormir",
            "se réveiller",
            "se reposer",
            "faire une sieste",
            "sommeil",
            "sieste"
        ]

    },


    hygiene: {

        description:
            "Actions liées à l'hygiène corporelle",

        mots: [
            "se laver",
            "laver",
            "se doucher",
            "se baigner",
            "se brosser",
            "nettoyer",
            "se nettoyer",
            "se coiffer",
            "s'habiller",
            "se déshabiller"
        ]

    },


    communication: {

        description:
            "Action consistant à transmettre une information",

        mots: [
            "parler",
            "dire",
            "expliquer",
            "répondre",
            "demander",
            "raconter",
            "écrire",
            "lire",
            "communiquer",
            "discuter",
            "conversation"
        ]

    },


    travail: {

        description:
            "Actions liées au travail ou à une activité professionnelle",

        mots: [
            "travailler",
            "étudier",
            "apprendre",
            "enseigner",
            "construire",
            "réparer",
            "fabriquer",
            "produire",
            "organiser"
        ]

    },


    achat: {

        description:
            "Actions liées aux achats et aux échanges",

        mots: [
            "acheter",
            "vendre",
            "payer",
            "coûter",
            "commander",
            "choisir",
            "recevoir",
            "livrer"
        ]

    },


    //==========================================================
    // 👁️ PERCEPTION
    //==========================================================

    vision: {

        description:
            "Perception utilisant les yeux",

        mots: [
            "voir",
            "regarder",
            "observer",
            "fixer",
            "apercevoir",
            "contempler",
            "vision"
        ]

    },


    audition: {

        description:
            "Perception utilisant l'ouïe",

        mots: [
            "entendre",
            "écouter",
            "son",
            "bruit",
            "voix",
            "musique"
        ]

    },


    toucher: {

        description:
            "Perception ou contact physique",

        mots: [
            "toucher",
            "sentir",
            "contact",
            "contact physique",
            "effleurer",
            "palper"
        ]

    },


    odorat: {

        description:
            "Perception des odeurs",

        mots: [
            "sentir",
            "odeur",
            "renifler",
            "respirer"
        ]

    },


    //==========================================================
    // 🧠 PENSÉE / CONNAISSANCE
    //==========================================================

    pensee: {

        description:
            "Action mentale consistant à réfléchir",

        mots: [
            "penser",
            "réfléchir",
            "imaginer",
            "raisonner",
            "analyser",
            "considérer"
        ]

    },


    connaissance: {

        description:
            "Possession ou acquisition d'une information",

        mots: [
            "savoir",
            "connaître",
            "comprendre",
            "apprendre",
            "connaissance",
            "information"
        ]

    },


    comprehension: {

        description:
            "Capacité à comprendre le sens d'une information",

        mots: [
            "comprendre",
            "compris",
            "comprendre",
            "interpréter",
            "saisir le sens",
            "signification"
        ]

    },


    memoire: {

        description:
            "Capacité à conserver ou retrouver une information",

        mots: [
            "se souvenir",
            "souvenir",
            "mémoriser",
            "retenir",
            "oublier",
            "mémoire"
        ]

    },


    //==========================================================
    // ❤️ ÉMOTIONS
    //==========================================================

    joie: {

        description:
            "État émotionnel positif",

        mots: [
            "joie",
            "heureux",
            "heureuse",
            "bonheur",
            "plaisir",
            "ravi",
            "content",
            "enthousiasme"
        ]

    },


    tristesse: {

        description:
            "État émotionnel négatif lié à la peine",

        mots: [
            "tristesse",
            "triste",
            "malheureux",
            "peine",
            "chagrin",
            "déception"
        ]

    },


    peur: {

        description:
            "État émotionnel lié à la crainte ou au danger",

        mots: [
            "peur",
            "craindre",
            "crainte",
            "angoisse",
            "panique",
            "terrifié"
        ]

    },


    colere: {

        description:
            "État émotionnel lié à l'agressivité ou au mécontentement",

        mots: [
            "colère",
            "colérique",
            "énervé",
            "énervement",
            "rage",
            "furieux",
            "fureur"
        ]

    },


    confiance: {

        description:
            "Sentiment de sécurité ou de certitude",

        mots: [
            "confiance",
            "confiant",
            "assurance",
            "certain",
            "certitude"
        ]

    },


    //==========================================================
    // 🗣️ COMMUNICATION
    //==========================================================

    question: {

        description:
            "Expression visant à obtenir une information",

        mots: [
            "question",
            "demander",
            "pourquoi",
            "comment",
            "quand",
            "où",
            "qui",
            "quoi",
            "quel",
            "quelle"
        ]

    },


    affirmation: {

        description:
            "Expression présentant une information comme vraie",

        mots: [
            "oui",
            "exact",
            "vrai",
            "correct",
            "certain",
            "confirmer",
            "affirmer"
        ]

    },


    negation: {

        description:
            "Expression indiquant qu'une information est négative",

        mots: [
            "non",
            "ne",
            "pas",
            "jamais",
            "aucun",
            "personne",
            "rien"
        ]

    },


    //==========================================================
    // 📍 ESPACE / POSITION
    //==========================================================

    position: {

        description:
            "Emplacement d'une personne ou d'un objet",

        mots: [
            "position",
            "emplacement",
            "place",
            "localisation",
            "situé",
            "se trouve"
        ]

    },


    proximite: {

        description:
            "Relation indiquant qu'une distance est faible",

        mots: [
            "près",
            "proche",
            "à côté",
            "à proximité",
            "close",
            "near"
        ]

    },


    distance: {

        description:
            "Relation indiquant une séparation spatiale",

        mots: [
            "distance",
            "loin",
            "éloigné",
            "à distance",
            "far",
            "away"
        ]

    },


    contact: {

        description:
            "Deux éléments sont physiquement en contact",

        mots: [
            "contact",
            "toucher",
            "touche",
            "contre",
            "collé",
            "au contact",
            "corps à corps"
        ]

    },


    orientation: {

        description:
            "Direction dans laquelle un élément se trouve ou se déplace",

        mots: [
            "gauche",
            "droite",
            "devant",
            "derrière",
            "haut",
            "bas",
            "nord",
            "sud",
            "est",
            "ouest",
            "vers",
            "direction"
        ]

    },


    //==========================================================
    // 📏 DISTANCE
    //==========================================================

    distance_courte: {

        description:
            "Distance faible entre deux éléments",

        mots: [
            "proche",
            "près",
            "à proximité",
            "corps à corps",
            "bout portant",
            "close range"
        ]

    },


    distance_moyenne: {

        description:
            "Distance intermédiaire entre deux éléments",

        mots: [
            "distance moyenne",
            "à moyenne distance",
            "mi-distance"
        ]

    },


    distance_longue: {

        description:
            "Distance importante entre deux éléments",

        mots: [
            "loin",
            "éloigné",
            "longue distance",
            "à longue distance",
            "far"
        ]

    },


    //==========================================================
    // 🏃 VITESSE
    //==========================================================

    vitesse_lente: {

        description:
            "Déplacement ou action effectuée lentement",

        mots: [
            "lent",
            "lentement",
            "ralenti",
            "doucement",
            "au ralenti"
        ]

    },


    vitesse_normale: {

        description:
            "Déplacement effectué à une vitesse normale",

        mots: [
            "normal",
            "normalement",
            "vitesse normale",
            "vitesse moyenne"
        ]

    },


    vitesse_rapide: {

        description:
            "Déplacement ou action effectué rapidement",

        mots: [
            "rapide",
            "rapidement",
            "vite",
            "très vite",
            "grande vitesse",
            "pleine vitesse",
            "toute vitesse",
            "vitesse maximale",
            "vmax"
        ]

    },


    //==========================================================
    // ⚡ INTENSITÉ
    //==========================================================

    intensite_faible: {

        description:
            "Action réalisée avec une faible intensité",

        mots: [
            "un peu",
            "légèrement",
            "doucement",
            "faiblement",
            "presque"
        ]

    },


    intensite_moyenne: {

        description:
            "Action réalisée avec une intensité moyenne",

        mots: [
            "assez",
            "normalement",
            "modérément"
        ]

    },


    intensite_forte: {

        description:
            "Action réalisée avec une forte intensité",

        mots: [
            "très",
            "extrêmement",
            "fortement",
            "énormément",
            "totalement",
            "complètement",
            "brutalement"
        ]

    },


    //==========================================================
    // ⏱️ TEMPS
    //==========================================================

    present: {

        description:
            "Action réalisée actuellement",

        mots: [
            "maintenant",
            "actuellement",
            "aujourd'hui",
            "en ce moment"
        ]

    },


    passe: {

        description:
            "Action réalisée avant le moment présent",

        mots: [
            "avant",
            "hier",
            "auparavant",
            "précédemment",
            "déjà"
        ]

    },


    futur: {

        description:
            "Action qui doit avoir lieu après le moment présent",

        mots: [
            "demain",
            "plus tard",
            "bientôt",
            "ensuite",
            "après"
        ]

    },


    instantane: {

        description:
            "Action réalisée immédiatement",

        mots: [
            "immédiatement",
            "instantanément",
            "aussitôt",
            "en un instant",
            "tout de suite"
        ]

    },


    //==========================================================
    // 🔄 RELATIONS TEMPORELLES
    //==========================================================

    succession: {

        description:
            "Une action se produit après une autre",

        mots: [
            "puis",
            "ensuite",
            "après",
            "dans la foulée",
            "aussitôt",
            "enchaîne",
            "next",
            "then",
            "after"
        ]

    },


    simultaneite: {

        description:
            "Deux actions se produisent en même temps",

        mots: [
            "pendant que",
            "alors que",
            "en même temps",
            "simultanément",
            "au même moment",
            "while",
            "at the same time"
        ]

    },


    condition: {

        description:
            "Une action dépend d'une condition",

        mots: [
            "si",
            "lorsque",
            "quand",
            "dès que",
            "une fois que",
            "if",
            "when",
            "once"
        ]

    },


    //==========================================================
    // 🔗 RELATIONS LOGIQUES
    //==========================================================

    cause: {

        description:
            "Relation indiquant la raison d'un événement",

        mots: [
            "car",
            "parce que",
            "puisque",
            "à cause de",
            "grâce à",
            "en raison de"
        ]

    },


    consequence: {

        description:
            "Résultat produit par une action ou un événement",

        mots: [
            "donc",
            "ainsi",
            "alors",
            "par conséquent",
            "résultat",
            "entraîne",
            "provoque"
        ]

    },


    opposition: {

        description:
            "Deux idées ou actions sont opposées",

        mots: [
            "mais",
            "cependant",
            "pourtant",
            "toutefois",
            "en revanche",
            "contre",
            "opposé"
        ]

    },


    //==========================================================
    // 🔢 QUANTITÉ
    //==========================================================

    quantite_faible: {

        description:
            "Petite quantité",

        mots: [
            "peu",
            "quelques",
            "un peu",
            "presque aucun",
            "faible quantité"
        ]

    },


    quantite_moyenne: {

        description:
            "Quantité moyenne",

        mots: [
            "plusieurs",
            "assez",
            "beaucoup",
            "une certaine quantité"
        ]

    },


    quantite_forte: {

        description:
            "Grande quantité",

        mots: [
            "beaucoup",
            "énormément",
            "nombreux",
            "plein",
            "totalité",
            "tous",
            "tout"
        ]

    },


    //==========================================================
    // 👤 PERSONNES / ENTITÉS
    //==========================================================

    personne: {

        description:
            "Être humain ou individu",

        mots: [
            "personne",
            "homme",
            "femme",
            "enfant",
            "individu",
            "humain"
        ]

    },


    acteur: {

        description:
            "Personne qui réalise une action",

        mots: [
            "joueur",
            "combattant",
            "attaquant",
            "défenseur",
            "personnage",
            "acteur"
        ]

    },


    cible: {

        description:
            "Personne ou objet qui subit ou reçoit une action",

        mots: [
            "cible",
            "adversaire",
            "ennemi",
            "victime",
            "destinataire"
        ]

    },


    //==========================================================
    // 🧩 INTERACTION
    //==========================================================

    interaction: {

        description:
            "Action impliquant plusieurs éléments",

        mots: [
            "interagir",
            "rencontrer",
            "toucher",
            "parler",
            "attaquer",
            "aider",
            "suivre",
            "poursuivre"
        ]

    },


    poursuite: {

        description:
            "Action consistant à suivre une cible",

        mots: [
            "poursuivre",
            "suivre",
            "chasser",
            "rattraper",
            "traquer",
            "courir après"
        ]

    },


    fuite: {

        description:
            "Action visant à s'éloigner d'un danger ou d'une cible",

        mots: [
            "fuir",
            "s'échapper",
            "s'enfuir",
            "partir",
            "s'éloigner",
            "prendre la fuite"
        ]

    }

};

//==============================================================
// 🗂️ INDEX GLOBAL DES DICTIONNAIRES
//==============================================================
//
// Permet à NeoAIchat.js de parcourir toute la base
// sans devoir importer chaque dictionnaire séparément.
//
//==============================================================

const NEO_DICTIONNAIRES = {

    NEO_VERBES,
    NEO_VERBES_SPECIAUX,
    NEO_NOMS,
    NEO_ADJECTIFS,
    NEO_ADVERBES,
    NEO_SYNONYMES,
    NEO_ANTONYMES,
    NEO_CONNECTEURS,
    NEO_PREPOSITIONS,
    NEO_PRONOMS,
    NEO_EXPRESSIONS,
    NEO_UNITES,
    NEO_TEMPS,
    NEO_DIRECTIONS,
    NEO_PARTIES_CORPS,
    NEO_EMOTIONS,
    NEO_INTENSITE,
    NEO_VITESSE,
    NEO_RELATIONS, 
    NEO_COMBAT, 
    NEO_CONCEPTS


};


//==============================================================
// 🔎 RECHERCHER UN MOT DANS UNE CATÉGORIE
//==============================================================

function neoChercherMotDansCategorie(
    mot = "",
    categorie = null
) {

    if (
        !mot ||
        !categorie
    ) {

        return false;

    }

    const recherche =
        neoSansAccents(
            mot
        );


    function parcourir(
        valeur,
        chemin = []
    ) {

        if (
            Array.isArray(valeur)
        ) {

            for (
                const element of valeur
            ) {

                if (
                    neoSansAccents(
                        String(element)
                    ) === recherche
                ) {

                    return {
                        trouve: true,
                        chemin
                    };

                }

            }

            return null;

        }


        if (
            typeof valeur === "object" &&
            valeur !== null
        ) {

            for (
                const cle of Object.keys(valeur)
            ) {

                const resultat =
                    parcourir(
                        valeur[cle],
                        [
                            ...chemin,
                            cle
                        ]
                    );

                if (resultat) {

                    return resultat;

                }

            }

        }

        return null;

    }


    return (
        parcourir(
            categorie
        ) || {
            trouve: false,
            chemin: []
        }
    );

}


//==============================================================
// 🔎 RECHERCHER UN MOT DANS TOUT NEO
//==============================================================

function neoRechercherMot(
    mot = ""
) {

    if (
        !mot ||
        typeof mot !== "string"
    ) {

        return {

            trouve: false,

            mot,

            categories: []

        };

    }


    const recherche =
        neoSansAccents(
            mot
        );


    const categories = [];


    for (
        const nomCategorie
        of Object.keys(NEO_DICTIONNAIRES)
    ) {

        const resultat =
            neoChercherMotDansCategorie(
                recherche,
                NEO_DICTIONNAIRES[
                    nomCategorie
                ]
            );


        if (
            resultat.trouve
        ) {

            categories.push({

                categorie:
                    nomCategorie,

                chemin:
                    resultat.chemin

            });

        }

    }


    return {

        trouve:
            categories.length > 0,

        mot,

        motNormalise:
            recherche,

        categories

    };

}


//==============================================================
// 🔎 RECHERCHER PLUSIEURS MOTS
//==============================================================

function neoRechercherTexte(
    texte = ""
) {

    const tokens =
        neoTokeniser(
            texte
        );


    return tokens.map(
        mot =>
            neoRechercherMot(
                mot
            )
    );

}


//==============================================================
// 🔗 RECHERCHER LES SYNONYMES
//==============================================================

function neoTrouverSynonymes(
    mot = "",
    langue = "fr"
) {

    const dictionnaire =
        NEO_SYNONYMES[
            langue
        ] || {};


    const recherche =
        neoSansAccents(
            mot
        );


    for (
        const motPrincipal
        of Object.keys(dictionnaire)
    ) {

        const groupe =
            dictionnaire[
                motPrincipal
            ];


        const tousLesMots = [

            motPrincipal,

            ...groupe

        ];


        if (
            tousLesMots.some(
                element =>
                    neoSansAccents(
                        element
                    ) === recherche
            )
        ) {

            return {

                trouve: true,

                motPrincipal,

                synonymes: [
                    ...new Set(
                        tousLesMots
                    )
                ]

            };

        }

    }


    return {

        trouve: false,

        motPrincipal: null,

        synonymes: []

    };

}


//==============================================================
// 🔄 RECHERCHER LES ANTONYMES
//==============================================================

function neoTrouverAntonymes(
    mot = "",
    langue = "fr"
) {

    const dictionnaire =
        NEO_ANTONYMES[
            langue
        ] || {};


    const recherche =
        neoSansAccents(
            mot
        );


    for (
        const motPrincipal
        of Object.keys(dictionnaire)
    ) {

        if (
            neoSansAccents(
                motPrincipal
            ) === recherche
        ) {

            return {

                trouve: true,

                motPrincipal,

                antonymes:
                    dictionnaire[
                        motPrincipal
                    ]

            };

        }

    }


    return {

        trouve: false,

        motPrincipal: null,

        antonymes: []

    };

}


//==============================================================
// 🔍 TESTER SI UN MOT EXISTE
//==============================================================

function neoConnaitMot(
    mot = ""
) {

    return neoRechercherMot(
        mot
    ).trouve;

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    NEOAI_CONFIG,

    NEO_VERBES,
    NEO_VERBES_SPECIAUX,

    NEO_NOMS,
    NEO_ADJECTIFS,
    NEO_ADVERBES,

    NEO_SYNONYMES,
    NEO_ANTONYMES,
    NEO_CONNECTEURS,

    NEO_PREPOSITIONS,
    NEO_PRONOMS,
    NEO_EXPRESSIONS,

    NEO_UNITES,
    NEO_TEMPS,
    NEO_DIRECTIONS,

    NEO_PARTIES_CORPS,
    NEO_EMOTIONS,
    NEO_INTENSITE,
    NEO_VITESSE,
    NEO_RELATIONS,

    NEO_COMBAT,

    NEO_CONCEPTS,

    NEO_DICTIONNAIRES,

    neoNormaliserTexte,
    neoMinuscule,
    neoSansAccents,
    neoTokeniser,
    neoDecouperPhrases,

    neoChercherMotDansCategorie,
    neoRechercherMot,
    neoRechercherTexte,

    neoTrouverSynonymes,
    neoTrouverAntonymes,

    neoConnaitMot

};
