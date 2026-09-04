//==============================================================
// 🧠 NEO AI — BASE DE CONNAISSANCES LINGUISTIQUES
//==============================================================
//
// NeoAI.js
//
// RÔLE :
// - Contenir le vocabulaire de NeoAI
// - Contenir les verbes et leurs formes
// - Contenir les noms / objets / personnes / lieux
// - Contenir les modèles de phrases
// - Contenir les formules grammaticales
// - Permettre au moteur NeoAI de comparer une phrase
//   avec des modèles connus
//
// ARCHITECTURE :
//
//                    🧠 NEO AI
//                         │
//          ┌──────────────┼──────────────┐
//          │              │              │
//      📚 MOTS       📝 MODÈLES       📐 FORMULES
//          │              │              │
//          └──────────────┼──────────────┘
//                         ↓
//                    🔎 COMPARATEUR
//                         ↓
//                      SCORE %
//
//==============================================================


//==============================================================
// ⚙️ CONFIGURATION
//==============================================================

const NEOAI_CONFIG = {

    langues: ["fr"],

    langueDefaut: "fr",

    seuilSimilarite: 50,

    version: "2.0.0",

    debug: true

};


//==============================================================
// 🧹 NORMALISATION
//==============================================================

function neoNormaliserTexte(texte = "") {

    if (typeof texte !== "string") {
        return "";
    }

    return texte
        .replace(/[’`]/g, "'")
        .replace(/[‐-‒–—]/g, "-")
        .replace(/\s+/g, " ")
        .replace(/\s+([,.!?;:])/g, "$1")
        .trim();

}


//==============================================================
// 🔡 MINUSCULE
//==============================================================

function neoMinuscule(texte = "") {

    return neoNormaliserTexte(texte)
        .toLowerCase();

}


//==============================================================
// 🧹 SANS ACCENTS
//==============================================================

function neoSansAccents(texte = "") {

    return neoMinuscule(texte)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


//==============================================================
// 🧩 TOKENISATION
//==============================================================

function neoTokeniser(texte = "") {

    const normalise =
        neoSansAccents(texte);

    if (!normalise) {
        return [];
    }

    return normalise
        .replace(/[^\p{L}\p{N}'-]+/gu, " ")
        .split(/\s+/)
        .filter(Boolean);

}


//==============================================================
// ✂️ DÉCOUPAGE DES PHRASES
//==============================================================

function neoDecouperPhrases(texte = "") {

    const normalise =
        neoNormaliserTexte(texte);

    if (!normalise) {
        return [];
    }

    return normalise
        .split(/(?<=[.!?])\s+/)
        .map(x => x.trim())
        .filter(Boolean);

}


//==============================================================
// 📖 NEO LEARN
//==============================================================
//
// Conservé pour le système NeoLearn.
// Cette liste peut être enrichie automatiquement.
//
//==============================================================

const NEO_LEARN = {

    fr: [
        "mot1",
        "mot2",
        "mot3"
    ]

};


//==============================================================
// 📚 VERBES
//==============================================================
//
// Les verbes sont la base d'action de NeoAI.
// Les formes permettent de reconnaître différentes
// conjugaisons sans construire un analyseur grammatical.
//
//==============================================================

const NEO_VERBES = {

    fr: {

        //========================================================
        // 🧠 VIE COURANTE / GÉNÉRAL
        //========================================================

        aller: [
            "aller",
            "vais",
            "vas",
            "va",
            "allons",
            "allez",
            "vont",
            "allais",
            "allait",
            "allions",
            "alliez",
            "allaient",
            "irai",
            "iras",
            "ira",
            "irons",
            "irez",
            "iront",
            "allant",
            "allé",
            "allée",
            "allés",
            "allées"
        ],

        avoir: [
            "avoir",
            "ai",
            "as",
            "a",
            "avons",
            "avez",
            "ont",
            "avais",
            "avait",
            "avions",
            "aviez",
            "avaient",
            "aurai",
            "auras",
            "aura",
            "aurons",
            "aurez",
            "auront",
            "ayant",
            "eu",
            "eue",
            "eus",
            "eues"
        ],

        être: [
            "être",
            "suis",
            "es",
            "est",
            "sommes",
            "êtes",
            "sont",
            "étais",
            "était",
            "étions",
            "étiez",
            "étaient",
            "serai",
            "seras",
            "sera",
            "serons",
            "serez",
            "seront",
            "étant",
            "été"
        ],

        faire: [
            "faire",
            "fais",
            "fait",
            "faisons",
            "faites",
            "font",
            "faisais",
            "faisait",
            "faisions",
            "faisiez",
            "faisaient",
            "ferai",
            "feras",
            "fera",
            "ferons",
            "ferez",
            "feront",
            "faisant",
            "faite",
            "faits",
            "faites"
        ],

        chercher: [
            "chercher",
            "cherche",
            "cherches",
            "cherchons",
            "cherchez",
            "cherchent",
            "cherchais",
            "cherchait",
            "cherchions",
            "cherchiez",
            "cherchaient",
            "chercherai",
            "cherchera",
            "chercherons",
            "cherchant",
            "cherché"
        ],

        comprendre: [
            "comprendre",
            "comprends",
            "comprend",
            "comprenons",
            "comprenez",
            "comprennent",
            "comprenais",
            "comprenait",
            "comprendrai",
            "comprendra",
            "comprenant",
            "compris",
            "comprise"
        ],

        devoir: [
            "devoir",
            "dois",
            "doit",
            "devons",
            "devez",
            "doivent",
            "devais",
            "devait",
            "devrai",
            "devra",
            "devant",
            "dû",
            "due"
        ],

        dire: [
            "dire",
            "dis",
            "dit",
            "disons",
            "dites",
            "disent",
            "disais",
            "disait",
            "dirai",
            "dira",
            "disant"
        ],

        écouter: [
            "écouter",
            "écoute",
            "écoutes",
            "écoutons",
            "écoutez",
            "écoutent",
            "écoutais",
            "écoutait",
            "écouterai",
            "écoutera",
            "écoutant",
            "écouté"
        ],

        entendre: [
            "entendre",
            "entends",
            "entend",
            "entendons",
            "entendez",
            "entendent",
            "entendais",
            "entendait",
            "entendrai",
            "entendra",
            "entendant",
            "entendu"
        ],

        parler: [
            "parler",
            "parle",
            "parles",
            "parlons",
            "parlez",
            "parlent",
            "parlais",
            "parlait",
            "parlerai",
            "parlera",
            "parlant",
            "parlé"
        ],

        penser: [
            "penser",
            "pense",
            "penses",
            "pensons",
            "pensez",
            "pensent",
            "pensais",
            "pensait",
            "penserai",
            "pensera",
            "pensant",
            "pensé"
        ],

        pouvoir: [
            "pouvoir",
            "peux",
            "peut",
            "pouvons",
            "pouvez",
            "peuvent",
            "pouvais",
            "pouvait",
            "pourrai",
            "pourra",
            "pouvant",
            "pu"
        ],

        regarder: [
            "regarder",
            "regarde",
            "regardes",
            "regardons",
            "regardez",
            "regardent",
            "regardais",
            "regardait",
            "regarderai",
            "regardera",
            "regardant",
            "regardé"
        ],

        savoir: [
            "savoir",
            "sais",
            "sait",
            "savons",
            "savez",
            "savent",
            "savais",
            "savait",
            "saurai",
            "saura",
            "sachant",
            "su"
        ],

        sentir: [
            "sentir",
            "sens",
            "sent",
            "sentons",
            "sentez",
            "sentent",
            "sentais",
            "sentait",
            "sentirai",
            "sentira",
            "sentant",
            "senti"
        ],

        trouver: [
            "trouver",
            "trouve",
            "trouves",
            "trouvons",
            "trouvez",
            "trouvent",
            "trouvais",
            "trouvait",
            "trouverai",
            "trouvera",
            "trouvant",
            "trouvé"
        ],

        venir: [
            "venir",
            "viens",
            "vient",
            "venons",
            "venez",
            "viennent",
            "venais",
            "venait",
            "viendrai",
            "viendra",
            "venant",
            "venu"
        ],

        voir: [
            "voir",
            "vois",
            "voit",
            "voyons",
            "voyez",
            "voient",
            "voyais",
            "voyait",
            "verrai",
            "verra",
            "voyant",
            "vu"
        ],

        vouloir: [
            "vouloir",
            "veux",
            "veut",
            "voulons",
            "voulez",
            "veulent",
            "voulais",
            "voulait",
            "voudrai",
            "voudra",
            "voulant",
            "voulu"
        ],


        //========================================================
        // 🚶 DÉPLACEMENT
        //========================================================

        accélérer: [
            "accélérer",
            "accélère",
            "accélères",
            "accélérons",
            "accélérez",
            "accélèrent",
            "accélérais",
            "accélérait",
            "accélérant",
            "accéléré"
        ],

        approcher: [
            "approcher",
            "approche",
            "approches",
            "approchons",
            "approchez",
            "approchent",
            "approchait",
            "approchant",
            "approché"
        ],

        arriver: [
            "arriver",
            "arrive",
            "arrives",
            "arrivons",
            "arrivez",
            "arrivent",
            "arrivait",
            "arrivant",
            "arrivé"
        ],

        avancer: [
            "avancer",
            "avance",
            "avances",
            "avançons",
            "avancez",
            "avancent",
            "avançais",
            "avançait",
            "avançant",
            "avancé"
        ],

        courir: [
            "courir",
            "cours",
            "court",
            "courons",
            "courez",
            "courent",
            "courais",
            "courait",
            "courant",
            "couru"
        ],

        descendre: [
            "descendre",
            "descends",
            "descend",
            "descendons",
            "descendez",
            "descendent",
            "descendais",
            "descendait",
            "descendant",
            "descendu"
        ],

        entrer: [
            "entrer",
            "entre",
            "entres",
            "entrons",
            "entrez",
            "entrent",
            "entrais",
            "entrait",
            "entrant",
            "entré"
        ],

        grimper: [
            "grimper",
            "grimpe",
            "grimpes",
            "grimpons",
            "grimpez",
            "grimpent",
            "grimpais",
            "grimpait",
            "grimpant",
            "grimpé"
        ],

        marcher: [
            "marcher",
            "marche",
            "marches",
            "marchons",
            "marchez",
            "marchent",
            "marchais",
            "marchait",
            "marchant",
            "marché"
        ],

        monter: [
            "monter",
            "monte",
            "montes",
            "montons",
            "montez",
            "montent",
            "montais",
            "montait",
            "montant",
            "monté"
        ],

        partir: [
            "partir",
            "pars",
            "part",
            "partons",
            "partez",
            "partent",
            "partais",
            "partait",
            "partant",
            "parti"
        ],

        ramper: [
            "ramper",
            "rampe",
            "rampes",
            "rampons",
            "rampez",
            "rampent",
            "rampais",
            "rampait",
            "rampant",
            "rampé"
        ],

        reculer: [
            "reculer",
            "recule",
            "recules",
            "reculons",
            "reculez",
            "reculent",
            "reculais",
            "reculait",
            "reculant",
            "reculé"
        ],

        sauter: [
            "sauter",
            "saute",
            "sautes",
            "sautons",
            "sautez",
            "sautent",
            "sautais",
            "sautait",
            "sautant",
            "sauté"
        ],

        foncer: [
            "foncer",
            "fonce",
            "fonces",
            "fonçons",
            "foncez",
            "foncent",
            "fonçait",
            "fonçant",
            "foncé"
        ],

        se_diriger: [
            "se diriger",
            "se dirige",
            "se dirigent",
            "se dirigeait",
            "se dirigeant"
        ],


        //========================================================
        // ⚔️ COMBAT
        //========================================================

        attaquer: [
            "attaquer",
            "attaque",
            "attaques",
            "attaquons",
            "attaquez",
            "attaquent",
            "attaquait",
            "attaquant",
            "attaqué"
        ],

        frapper: [
            "frapper",
            "frappe",
            "frappes",
            "frappons",
            "frappez",
            "frappent",
            "frappait",
            "frappant",
            "frappé"
        ],

        bloquer: [
            "bloquer",
            "bloque",
            "bloques",
            "bloquons",
            "bloquez",
            "bloquent",
            "bloquait",
            "bloquant",
            "bloqué"
        ],

        défendre: [
            "défendre",
            "défends",
            "défend",
            "défendons",
            "défendez",
            "défendent",
            "défendait",
            "défendant",
            "défendu"
        ],

        esquiver: [
            "esquiver",
            "esquive",
            "esquives",
            "esquivons",
            "esquivez",
            "esquivent",
            "esquivait",
            "esquivant",
            "esquivé"
        ],

        saisir: [
            "saisir",
            "saisis",
            "saisit",
            "saisissons",
            "saisissez",
            "saisissent",
            "saisissant",
            "saisi"
        ],

        attraper: [
            "attraper",
            "attrape",
            "attrapes",
            "attrapons",
            "attrapez",
            "attrapent",
            "attrapait",
            "attrapant",
            "attrapé"
        ],

        pousser: [
            "pousser",
            "pousse",
            "pousses",
            "poussons",
            "poussez",
            "poussent",
            "poussait",
            "poussant",
            "poussé"
        ],

        tirer: [
            "tirer",
            "tire",
            "tires",
            "tirons",
            "tirez",
            "tirent",
            "tirait",
            "tirant",
            "tiré"
        ],

        frapper_avec: [
            "frapper",
            "donner",
            "porter",
            "asséner"
        ],


        //========================================================
        // ⚽ FOOTBALL
        //========================================================

        passer: [
            "passer",
            "passe",
            "passes",
            "passons",
            "passez",
            "passent",
            "passait",
            "passant",
            "passé"
        ],

        tirer: [
            "tirer",
            "tire",
            "tires",
            "tirons",
            "tirez",
            "tirent",
            "tirait",
            "tirant",
            "tiré"
        ],

        contrôler: [
            "contrôler",
            "contrôle",
            "contrôles",
            "contrôlons",
            "contrôlez",
            "contrôlent",
            "contrôlait",
            "contrôlant",
            "contrôlé"
        ],

        dribbler: [
            "dribbler",
            "dribble",
            "dribbles",
            "dribblons",
            "dribblez",
            "dribblent",
            "dribblait",
            "dribblant",
            "dribblé"
        ],

        conduire: [
            "conduire",
            "conduis",
            "conduit",
            "conduisons",
            "conduisez",
            "conduisent",
            "conduisait",
            "conduisant",
            "conduit"
        ],

        centrer: [
            "centrer",
            "centre",
            "centres",
            "centrons",
            "centrez",
            "centrent",
            "centrant",
            "centré"
        ],

        marquer: [
            "marquer",
            "marque",
            "marques",
            "marquons",
            "marquez",
            "marquent",
            "marquait",
            "marquant",
            "marqué"
        ],


        //========================================================
        // ✈️ VOYAGE
        //========================================================

        voyager: [
            "voyager",
            "voyage",
            "voyages",
            "voyageons",
            "voyagez",
            "voyagent",
            "voyageait",
            "voyageant",
            "voyagé"
        ],

        conduire_un_vehicule: [
            "conduire",
            "conduis",
            "conduit",
            "conduisons",
            "conduisez",
            "conduisent"
        ],

        réserver: [
            "réserver",
            "réserve",
            "réserves",
            "réservons",
            "réservez",
            "réservent",
            "réservait",
            "réservant",
            "réservé"
        ],

        visiter: [
            "visiter",
            "visite",
            "visites",
            "visitons",
            "visitez",
            "visitent",
            "visitait",
            "visitant",
            "visité"
        ]

    }

};


//==============================================================
// 🧱 NOMS / OBJETS / PERSONNES / LIEUX
//==============================================================

const NEO_NOMS = {

    fr: {

        personnes: [
            "personne",
            "homme",
            "femme",
            "enfant",
            "joueur",
            "combattant",
            "adversaire",
            "ami",
            "ennemi",
            "voyageur",
            "gardien",
            "attaquant",
            "défenseur",
            "passager",
            "conducteur"
        ],

        animaux: [
            "lion",
            "tigre",
            "chien",
            "chat",
            "cheval",
            "loup",
            "ours",
            "chèvre",
            "mouton",
            "oiseau",
            "serpent",
            "poisson"
        ],

        corps: [
            "corps",
            "tête",
            "visage",
            "front",
            "nez",
            "bouche",
            "œil",
            "yeux",
            "oreille",
            "cou",
            "épaule",
            "bras",
            "avant-bras",
            "main",
            "doigt",
            "poitrine",
            "ventre",
            "dos",
            "jambe",
            "genou",
            "pied",
            "cheville"
        ],

        objets: [
            "objet",
            "arme",
            "épée",
            "couteau",
            "bâton",
            "ballon",
            "livre",
            "sac",
            "clé",
            "téléphone",
            "ordinateur",
            "véhicule",
            "voiture",
            "moto",
            "train",
            "avion",
            "bateau"
        ],

        lieux: [
            "lieu",
            "maison",
            "chambre",
            "école",
            "hôpital",
            "ville",
            "pays",
            "route",
            "rue",
            "gare",
            "aéroport",
            "hôtel",
            "terrain",
            "stade",
            "surface",
            "zone",
            "sol",
            "mur",
            "porte"
        ],

        football: [
            "ballon",
            "but",
            "filet",
            "terrain",
            "stade",
            "joueur",
            "gardien",
            "défenseur",
            "milieu",
            "attaquant",
            "adversaire",
            "équipe",
            "match",
            "passe",
            "tir",
            "dribble"
        ],

        voyage: [
            "voyage",
            "billet",
            "train",
            "avion",
            "bateau",
            "gare",
            "aéroport",
            "hôtel",
            "chambre",
            "bagage",
            "valise",
            "passeport",
            "pays",
            "ville",
            "destination",
            "départ",
            "arrivée"
        ],

        concepts: [
            "temps",
            "distance",
            "vitesse",
            "direction",
            "position",
            "action",
            "mouvement",
            "cible",
            "objectif",
            "manière",
            "cause",
            "raison",
            "résultat"
        ]

    }

};


//==============================================================
// 🔤 AUTRES MOTS
//==============================================================

const NEO_ADJECTIFS = {

    fr: [
        "grand",
        "petit",
        "fort",
        "faible",
        "rapide",
        "lent",
        "agile",
        "brutal",
        "direct",
        "violent",
        "calme",
        "dangereux",
        "puissant",
        "précis",
        "rapide",
        "lent",
        "proche",
        "lointain",
        "haut",
        "bas",
        "gros",
        "jeune",
        "vieux",
        "nouveau",
        "ancien",
        "bon",
        "mauvais",
        "important",
        "difficile",
        "facile"
    ]

};


const NEO_ADVERBES = {

    fr: [
        "rapidement",
        "lentement",
        "brutalement",
        "violemment",
        "doucement",
        "calmement",
        "directement",
        "précisément",
        "fortement",
        "faiblement",
        "soudainement",
        "immédiatement",
        "progressivement",
        "silencieusement",
        "prudemment"
    ]

};


const NEO_PREPOSITIONS = {

    fr: [
        "à",
        "au",
        "aux",
        "de",
        "du",
        "des",
        "dans",
        "en",
        "vers",
        "sur",
        "sous",
        "avec",
        "sans",
        "pour",
        "par",
        "entre",
        "contre",
        "devant",
        "derrière",
        "près",
        "loin"
    ]

};


const NEO_CONNECTEURS = {

    fr: [
        "et",
        "ou",
        "mais",
        "donc",
        "puis",
        "ensuite",
        "alors",
        "ensuite",
        "avant",
        "après",
        "pendant",
        "lorsque",
        "quand",
        "parce que",
        "afin de",
        "sans",
        "pour"
    ]

};


const NEO_PRONOMS = {

    fr: [
        "je",
        "tu",
        "il",
        "elle",
        "on",
        "nous",
        "vous",
        "ils",
        "elles",
        "me",
        "te",
        "se",
        "le",
        "la",
        "les",
        "lui",
        "leur",
        "son",
        "sa",
        "ses",
        "mon",
        "ma",
        "mes",
        "ton",
        "ta",
        "tes",
        "notre",
        "votre",
        "leur"
    ]

};


//==============================================================
// 📐 FORMULES GRAMMATICALES
//==============================================================
//
// Ces formules ne servent pas à analyser directement la phrase.
// Elles servent à identifier les structures des modèles.
//
//==============================================================

const NEO_FORMULES = {

    fr: [

        "S + V",

        "S + V + O",

        "S + V + CC_DIRECTION",

        "S + V + CC_LIEU",

        "S + V + CC_TEMPS",

        "S + V + CC_DISTANCE",

        "S + V + MANIERE",

        "S + V + MANIERE + CC_DIRECTION",

        "S + V + MANIERE + O",

        "S + V + O + MANIERE",

        "S + V + O + CC_CIBLE",

        "S + V + O + CC_LIEU",

        "S + V + O + CC_TEMPS",

        "S + V + O + CC_DISTANCE",

        "S + V + O + MANIERE + CC_CIBLE",

        "S + V + O + MANIERE + CC_DIRECTION",

        "S + V + POUR + V",

        "S + V + PUIS + V",

        "S + V + AVANT_DE + V",

        "S + V + SANS + V",

        "S + V + V",

        "S + V + V + O",

        "S + V + V + CC_DIRECTION",

        "S + V + V + CC_LIEU",

        "S + V + V + MANIERE",

        "S + V + O + PUIS + V"

    ]

};


//==============================================================
// 📝 MODÈLES DE PHRASES
//==============================================================
//
// IMPORTANT :
// Ces phrases sont des EXEMPLES DE MODÈLES.
//
// Le joueur peut écrire une phrase totalement différente.
// NeoAI cherchera la phrase connue qui possède la structure
// et le sens lexical les plus proches.
//
// Le sujet n'est JAMAIS fixe.
//
// "Le lion"
// "Maki"
// "Neo"
// "Le joueur"
// etc.
//
// peuvent tous occuper S.
//
//==============================================================

const NEO_MODELES_PHRASES = {

    fr: {

        //========================================================
        // 🚶 DÉPLACEMENT
        //========================================================

        deplacement: [

            {
                phrase: "le lion court",
                structure: "S + V"
            },

            {
                phrase: "le lion court vers la chèvre",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le lion court rapidement",
                structure: "S + V + MANIERE"
            },

            {
                phrase: "le lion court rapidement vers la chèvre",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le voyageur avance vers la ville",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le voyageur avance rapidement vers la ville",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le joueur recule",
                structure: "S + V"
            },

            {
                phrase: "le joueur recule rapidement",
                structure: "S + V + MANIERE"
            },

            {
                phrase: "le personnage se dirige vers la porte",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le personnage marche dans la ville",
                structure: "S + V + CC_LIEU"
            },

            {
                phrase: "le personnage court sur dix mètres",
                structure: "S + V + CC_DISTANCE"
            },

            {
                phrase: "le personnage court sur dix mètres vers la cible",
                structure: "S + V + CC_DISTANCE + CC_DIRECTION"
            },

            {
                phrase: "le personnage arrive rapidement vers la cible",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le personnage avance puis court",
                structure: "S + V + PUIS + V"
            },

            {
                phrase: "le personnage part pour rejoindre la ville",
                structure: "S + V + POUR + V"
            }

        ],


        //========================================================
        // ⚔️ COMBAT
        //========================================================

        combat: [

            {
                phrase: "le combattant attaque",
                structure: "S + V"
            },

            {
                phrase: "le combattant attaque son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant attaque rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant frappe",
                structure: "S + V"
            },

            {
                phrase: "le combattant frappe son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant frappe rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant bloque le coup",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant bloque rapidement le coup",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant esquive le coup",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant esquive rapidement le coup",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le combattant saisit son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant pousse son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant repousse son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le combattant frappe vers le visage",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le combattant frappe rapidement vers le visage",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le combattant attaque puis frappe son adversaire",
                structure: "S + V + PUIS + V"
            },

            {
                phrase: "le combattant avance vers son adversaire",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le combattant avance rapidement vers son adversaire",
                structure: "S + V + MANIERE + CC_DIRECTION"
            }

        ],


        //========================================================
        // ⚽ FOOTBALL
        //========================================================

        football: [

            {
                phrase: "le joueur contrôle le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur contrôle rapidement le ballon",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur conduit le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur conduit le ballon vers le but",
                structure: "S + V + O + CC_DIRECTION"
            },

            {
                phrase: "le joueur dribble son adversaire",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur dribble rapidement son adversaire",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur passe le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur passe le ballon vers son coéquipier",
                structure: "S + V + O + CC_DIRECTION"
            },

            {
                phrase: "le joueur tire",
                structure: "S + V"
            },

            {
                phrase: "le joueur tire vers le but",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le joueur tire rapidement vers le but",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le joueur centre vers la surface",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le joueur avance avec le ballon",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur avance rapidement avec le ballon",
                structure: "S + V + MANIERE + O"
            },

            {
                phrase: "le joueur marque un but",
                structure: "S + V + O"
            }

        ],


        //========================================================
        // ✈️ VOYAGE
        //========================================================

        voyage: [

            {
                phrase: "le voyageur part vers la ville",
                structure: "S + V + CC_DIRECTION"
            },

            {
                phrase: "le voyageur part rapidement vers la ville",
                structure: "S + V + MANIERE + CC_DIRECTION"
            },

            {
                phrase: "le voyageur arrive à la gare",
                structure: "S + V + CC_LIEU"
            },

            {
                phrase: "le voyageur prend le train",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur prend l'avion",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur réserve une chambre",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur visite la ville",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur transporte sa valise",
                structure: "S + V + O"
            },

            {
                phrase: "le voyageur se dirige vers l'aéroport",
                structure: "S + V + CC_DIRECTION"
            }

        ],


        //========================================================
        // 🏠 VIE COURANTE
        //========================================================

        vie_courante: [

            {
                phrase: "l'homme ouvre la porte",
                structure: "S + V + O"
            },

            {
                phrase: "la femme prépare le repas",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant regarde la télévision",
                structure: "S + V + O"
            },

            {
                phrase: "la personne prend son téléphone",
                structure: "S + V + O"
            },

            {
                phrase: "l'homme parle à son ami",
                structure: "S + V + O"
            },

            {
                phrase: "la femme écoute son ami",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant court dans la maison",
                structure: "S + V + CC_LIEU"
            },

            {
                phrase: "la personne marche dans la rue",
                structure: "S + V + CC_LIEU"
            },

            {
                phrase: "l'homme cherche ses clés",
                structure: "S + V + O"
            },

            {
                phrase: "la femme trouve son téléphone",
                structure: "S + V + O"
            },

            {
                phrase: "l'enfant joue rapidement",
                structure: "S + V + MANIERE"
            }

        ],


        //========================================================
        // 💬 COMMUNICATION
        //========================================================

        communication: [

            {
                phrase: "l'homme parle à son ami",
                structure: "S + V + O"
            },

            {
                phrase: "la femme dit la vérité",
                structure: "S + V + O"
            },

            {
                phrase: "la personne explique le problème",
                structure: "S + V + O"
            },

            {
                phrase: "le joueur demande une information",
                structure: "S + V + O"
            },

            {
                phrase: "l'homme répond à la question",
                structure: "S + V + O"
            },

            {
                phrase: "la femme écoute son interlocuteur",
                structure: "S + V + O"
            }

        ]

    }

};


//==============================================================
// 🔎 RECHERCHE D'UN VERBE
//==============================================================

function neoTrouverVerbe(mot = "") {

    const recherche =
        neoSansAccents(mot);

    if (!recherche) {
        return null;
    }

    const verbes =
        NEO_VERBES.fr || {};

    for (const [lemme, formes] of Object.entries(verbes)) {

        const liste = Array.isArray(formes)
            ? formes
            : [];

        if (
            neoSansAccents(lemme) === recherche ||
            liste.some(
                forme =>
                    neoSansAccents(forme) === recherche
            )
        ) {

            return {
                lemme,
                forme: mot
            };

        }

    }

    return null;

}


//==============================================================
// 🔎 RECHERCHE D'UN MOT
//==============================================================

function neoRechercherMot(mot = "") {

    if (
        typeof mot !== "string" ||
        !mot.trim()
    ) {

        return {
            trouve: false,
            mot,
            categories: []
        };

    }

    const recherche =
        neoSansAccents(mot);

    const categories = [];

    //----------------------------------------------------------
    // VERBES
    //----------------------------------------------------------

    const verbe =
        neoTrouverVerbe(mot);

    if (verbe) {

        categories.push({
            categorie: "verbe",
            lemme: verbe.lemme,
            forme: verbe.forme
        });

    }

    //----------------------------------------------------------
    // NOMS
    //----------------------------------------------------------

    for (
        const [categorie, mots]
        of Object.entries(
            NEO_NOMS.fr || {}
        )
    ) {

        if (
            Array.isArray(mots) &&
            mots.some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
        ) {

            categories.push({
                categorie: "nom",
                sousCategorie: categorie
            });

        }

    }

    //----------------------------------------------------------
    // ADJECTIFS
    //----------------------------------------------------------

    if (
        (NEO_ADJECTIFS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "adjectif"
        });

    }

    //----------------------------------------------------------
    // ADVERBES
    //----------------------------------------------------------

    if (
        (NEO_ADVERBES.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "adverbe"
        });

    }

    //----------------------------------------------------------
    // PRÉPOSITIONS
    //----------------------------------------------------------

    if (
        (NEO_PREPOSITIONS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "preposition"
        });

    }

    //----------------------------------------------------------
    // PRONOMS
    //----------------------------------------------------------

    if (
        (NEO_PRONOMS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "pronom"
        });

    }

    //----------------------------------------------------------
    // CONNECTEURS
    //----------------------------------------------------------

    if (
        (NEO_CONNECTEURS.fr || [])
            .some(
                motConnu =>
                    neoSansAccents(motConnu) === recherche
            )
    ) {

        categories.push({
            categorie: "connecteur"
        });

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
// 🔎 RECHERCHE DE TEXTE
//==============================================================

function neoRechercherTexte(texte = "") {

    const tokens =
        neoTokeniser(texte);

    const resultats =
        tokens.map(
            mot => neoRechercherMot(mot)
        );

    return {

        texte,

        mots: tokens,

        resultats,

        connus:
            resultats.filter(
                resultat =>
                    resultat.trouve
            ),

        inconnus:
            resultats.filter(
                resultat =>
                    !resultat.trouve
            )

    };

}


//==============================================================
// 🧠 MOT CONNU ?
//==============================================================

function neoConnaitMot(mot = "") {

    return neoRechercherMot(mot)
        .trouve === true;

}


//==============================================================
// 🔎 MOTS SIGNIFICATIFS
//==============================================================
//
// Pour la comparaison des modèles.
// Les petits mots grammaticaux peuvent être conservés
// lorsqu'ils sont importants pour la structure.
//
//==============================================================

const NEO_MOTS_NEUTRES = new Set([

    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "du",
    "de",
    "d",
    "au",
    "aux",
    "son",
    "sa",
    "ses",
    "mon",
    "ma",
    "mes",
    "ton",
    "ta",
    "tes",
    "ce",
    "cet",
    "cette",
    "ces"

]);


//==============================================================
// 🔎 COMPARAISON SIMPLE DE PHRASES
//==============================================================
//
// Cette fonction ne fait PAS d'analyse grammaticale complexe.
//
// Elle compare :
// - les mots
// - les verbes connus
// - les mots communs
//
// La structure vient du modèle correspondant.
//
//==============================================================

function neoComparerPhrase(
    phraseUtilisateur = "",
    phraseModele = ""
) {

    const a =
        neoTokeniser(
            phraseUtilisateur
        );

    const b =
        neoTokeniser(
            phraseModele
        );

    if (
        !a.length ||
        !b.length
    ) {

        return 0;

    }

    const utilises =
        new Set();

    let score = 0;

    for (
        const motA
        of a
    ) {

        let meilleur = -1;

        //------------------------------------------------------
        // Correspondance exacte
        //------------------------------------------------------

        for (
            let i = 0;
            i < b.length;
            i++
        ) {

            if (
                utilises.has(i)
            ) {
                continue;
            }

            if (
                motA === b[i]
            ) {

                meilleur = i;
                break;

            }

        }

        //------------------------------------------------------
        // Correspondance par lemme verbal
        //------------------------------------------------------

        if (
            meilleur === -1
        ) {

            const verbeA =
                neoTrouverVerbe(motA);

            if (verbeA) {

                for (
                    let i = 0;
                    i < b.length;
                    i++
                ) {

                    if (
                        utilises.has(i)
                    ) {
                        continue;
                    }

                    const verbeB =
                        neoTrouverVerbe(b[i]);

                    if (
                        verbeB &&
                        verbeA.lemme ===
                        verbeB.lemme
                    ) {

                        meilleur = i;
                        break;

                    }

                }

            }

        }

        //------------------------------------------------------
        // Correspondance trouvée
        //------------------------------------------------------

        if (
            meilleur !== -1
        ) {

            utilises.add(
                meilleur
            );

            score++;

        }

    }

    return Math.round(
        (
            score /
            Math.max(
                a.length,
                b.length
            )
        ) * 100
    );

}


//==============================================================
// 🔎 CHERCHER LE MEILLEUR MODÈLE
//==============================================================

function neoTrouverMeilleurModele(
    texte = "",
    categorie = null
) {

    const texteNormalise =
        neoNormaliserTexte(texte);

    if (!texteNormalise) {

        return {
            trouve: false,
            score: 0,
            modele: null,
            structure: null,
            categorie: null
        };

    }

    const categories =
        categorie
            ? [categorie]
            : Object.keys(
                NEO_MODELES_PHRASES.fr
            );

    let meilleur = null;

    for (
        const nomCategorie
        of categories
    ) {

        const modeles =
            NEO_MODELES_PHRASES
                ?.fr
                ?.[
                    nomCategorie
                ];

        if (
            !Array.isArray(modeles)
        ) {
            continue;
        }

        for (
            const modele
            of modeles
        ) {

            const score =
                neoComparerPhrase(
                    texteNormalise,
                    modele.phrase
                );

            if (
                !meilleur ||
                score > meilleur.score
            ) {

                meilleur = {

                    trouve:
                        score >=
                        NEOAI_CONFIG.seuilSimilarite,

                    score,

                    modele:
                        modele.phrase,

                    structure:
                        modele.structure,

                    categorie:
                        nomCategorie

                };

            }

        }

    }

    return (
        meilleur || {

            trouve: false,
            score: 0,
            modele: null,
            structure: null,
            categorie: null

        }
    );

}


//==============================================================
// 📊 LISTE DES MODÈLES
//==============================================================

function neoListerModeles(
    categorie = null
) {

    if (
        !categorie
    ) {

        return NEO_MODELES_PHRASES.fr;

    }

    return (
        NEO_MODELES_PHRASES
            ?.fr
            ?.[
                categorie
            ] || []
    );

}


//==============================================================
// 📚 LISTE DES VERBES
//==============================================================

function neoListerVerbes() {

    return Object.keys(
        NEO_VERBES.fr || {}
    );

}


//==============================================================
// 📚 LISTE DES CATÉGORIES
//==============================================================

function neoListerCategories() {

    return Object.keys(
        NEO_MODELES_PHRASES.fr || {}
    );

}


//==============================================================
// 📤 EXPORTS
//==============================================================

module.exports = {

    //==========================================================
    // ⚙️ CONFIGURATION
    //==========================================================

    NEOAI_CONFIG,


    //==========================================================
    // 📚 VOCABULAIRE
    //==========================================================

    NEO_VERBES,

    NEO_NOMS,

    NEO_ADJECTIFS,

    NEO_ADVERBES,

    NEO_PREPOSITIONS,

    NEO_CONNECTEURS,

    NEO_PRONOMS,

    NEO_LEARN,


    //==========================================================
    // 📐 FORMULES
    //==========================================================

    NEO_FORMULES,


    //==========================================================
    // 📝 MODÈLES
    //==========================================================

    NEO_MODELES_PHRASES,


    // Alias temporaire pour compatibilité
    // avec l'ancien nom utilisé ailleurs.

    NEO_MODELES:
        NEO_MODELES_PHRASES,


    //==========================================================
    // 🧹 OUTILS
    //==========================================================

    neoNormaliserTexte,

    neoMinuscule,

    neoSansAccents,

    neoTokeniser,

    neoDecouperPhrases,


    //==========================================================
    // 🔎 RECHERCHE
    //==========================================================

    neoTrouverVerbe,

    neoRechercherMot,

    neoRechercherTexte,

    neoConnaitMot,


    //==========================================================
    // 🔎 COMPARAISON
    //==========================================================

    neoComparerPhrase,

    neoTrouverMeilleurModele,


    //==========================================================
    // 📚 UTILITAIRES
    //==========================================================

    neoListerModeles,

    neoListerVerbes,

    neoListerCategories

};
