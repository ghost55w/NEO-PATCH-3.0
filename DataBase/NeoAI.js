//==============================================================
// 🧠 NEO AI — MOTEUR LINGUISTIQUE GÉNÉRAL
//==============================================================
// NeoAI.js
//
// Objectif :
// Comprendre le langage naturel français / anglais
// indépendamment des règles d'un jeu.
//
// ⚠️ Ce fichier n'est PAS l'arbitre d'un jeu.
// Il sert uniquement de cerveau linguistique.
//
// Architecture :
//
// TEXTE
//   ↓
// NORMALISATION
//   ↓
// DÉTECTION LANGUE
//   ↓
// DÉCOUPAGE
//   ↓
// DICTIONNAIRES
//   ↓
// SYNONYMES
//   ↓
// CONNECTEURS
//   ↓
// CONTEXTE
//   ↓
// EXTRACTION
//==============================================================


//==============================================================
// 📦 CONFIGURATION GÉNÉRALE
//==============================================================

const NEOAI_CONFIG = {

    langues: [
        "fr",
        "en"
    ],

    langueDefaut: "fr",

    debug: true,

    maxActions: 20

};


//==============================================================
// 🧹 NORMALISATION DU TEXTE
//==============================================================

function neoNormaliserTexte(texte = "") {

    if (
        typeof texte !== "string"
    ) {

        return "";

    }

    return texte

        // Supprimer espaces inutiles
        .replace(/\s+/g, " ")

        // Normaliser apostrophes
        .replace(/[’`]/g, "'")

        // Normaliser tirets
        .replace(/[‐-‒–—]/g, "-")

        // Supprimer espaces avant ponctuation
        .replace(/\s+([,.!?;:])/g, "$1")

        // Supprimer espaces multiples
        .trim();

}


//==============================================================
// 🔡 TEXTE MINUSCULE
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
        neoNormaliserTexte(texte);

    if (!texteNormalise) {

        return [];

    }

    return texteNormalise
        .split(/\s+/)
        .filter(Boolean);

}


//==============================================================
// ✂️ DÉCOUPAGE EN PHRASES
//==============================================================

function neoDecouperPhrases(texte = "") {

    const texteNormalise =
        neoNormaliserTexte(texte);

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
// 🌍 DÉTECTION SIMPLE DE LANGUE
//==============================================================

function neoDetecterLangue(texte = "") {

    const t =
        neoSansAccents(texte);

    if (!t) {

        return NEOAI_CONFIG.langueDefaut;

    }


    const motsFrancais = [

        "le",
        "la",
        "les",
        "un",
        "une",
        "des",
        "dans",
        "vers",
        "avec",
        "puis",
        "ensuite",
        "mais",
        "sur",
        "sous",
        "pour",
        "contre",
        "et",
        "ou"

    ];


    const motsAnglais = [

        "the",
        "a",
        "an",
        "to",
        "with",
        "then",
        "after",
        "but",
        "on",
        "under",
        "for",
        "against",
        "and",
        "or"

    ];


    const mots =
        t.split(/\s+/);


    let scoreFR = 0;
    let scoreEN = 0;


    for (
        const mot of mots
    ) {

        if (
            motsFrancais.includes(mot)
        ) {

            scoreFR++;

        }

        if (
            motsAnglais.includes(mot)
        ) {

            scoreEN++;

        }

    }


    if (
        scoreEN > scoreFR
    ) {

        return "en";

    }


    return "fr";

}


//==============================================================
// 🔍 RECHERCHE D'UN MOT DANS UNE LISTE
//==============================================================

function neoContientMot(
    texte = "",
    liste = []
) {

    const t =
        neoSansAccents(texte);


    for (
        const mot of liste
    ) {

        const recherche =
            neoSansAccents(mot);


        if (!recherche) {

            continue;

        }


        if (
            t.includes(recherche)
        ) {

            return true;

        }

    }


    return false;

}


//==============================================================
// 📚 DICTIONNAIRE DE BASE — PRONOMS
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
            "elle",
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
// 📚 DICTIONNAIRE DE BASE — CONNECTEURS
//==============================================================

const NEO_CONNECTEURS = {

    succession: [

        "puis",
        "ensuite",
        "apres",
        "après",
        "dans la foulee",
        "dans la foulée",
        "immediatement",
        "immédiatement",
        "enchaine",
        "enchaîne",
        "aussitot",
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
        "en meme temps",
        "en même temps",

        "while",
        "at the same time"
    ],


    condition: [

        "si",
        "lorsque",
        "quand",
        "des que",
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
// 🧠 ANALYSE LINGUISTIQUE DE BASE
//==============================================================

function neoAnalyserTexteBase(texte = "") {

    const original =
        texte;

    const normalise =
        neoNormaliserTexte(
            texte
        );

    const langue =
        neoDetecterLangue(
            normalise
        );

    const phrases =
        neoDecouperPhrases(
            normalise
        );

    const tokens =
        neoTokeniser(
            normalise
        );


    return {

        original,

        texte: normalise,

        texteMinuscule:
            neoMinuscule(
                normalise
            ),

        texteSansAccents:
            neoSansAccents(
                normalise
            ),

        langue,

        phrases,

        tokens,

        nombreMots:
            tokens.length,

        nombrePhrases:
            phrases.length

    };

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    NEOAI_CONFIG,

    NEO_PRONOMS,

    NEO_CONNECTEURS,

    neoNormaliserTexte,

    neoMinuscule,

    neoSansAccents,

    neoTokeniser,

    neoDecouperPhrases,

    neoDetecterLangue,

    neoContientMot,

    neoAnalyserTexteBase

};
