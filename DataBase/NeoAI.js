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
// 📚🌀 NEO LEARNING SKILLS OPEN SOURCE 2.5
//==============================================================
const NEO_LEARN = {

    fr: [
        "mot1",
        "mot2",
        "mot3"
    ]

};

//==============================================================
// 📚 NEO_VERBES
//==============================================================
const NEO_VERBES = {

    fr: {

        //======================================================
        // 🧠 Général
        //======================================================

        "aller": {
            present: ["vais", "vas", "va", "allons", "allez", "vont"],
            imparfait: ["allais", "allait", "allions", "alliez", "allaient"],
            futur: ["irai", "iras", "ira", "irons", "irez", "iront"],
            conditionnel: ["irais", "irait", "irions", "iriez", "iraient"],
            subjonctif: ["aille", "ailles", "allions", "alliez", "aillent"],
            participe_present: ["allant"],
            participe_passe: ["allé", "allée", "allés", "allées"]
        },

        "avoir": {
            present: ["ai", "as", "a", "avons", "avez", "ont"],
            imparfait: ["avais", "avait", "avions", "aviez", "avaient"],
            futur: ["aurai", "auras", "aura", "aurons", "aurez", "auront"],
            conditionnel: ["aurais", "aurait", "aurions", "auriez", "auraient"],
            subjonctif: ["aie", "aies", "ait", "ayons", "ayez", "aient"],
            participe_present: ["ayant"],
            participe_passe: ["eu", "eue", "eus", "eues"]
        },

        "chercher": {
            present: ["cherche", "cherches", "cherchons", "cherchez", "cherchent"],
            imparfait: ["cherchais", "cherchait", "cherchions", "cherchiez", "cherchaient"],
            futur: ["chercherai", "chercheras", "cherchera", "chercherons", "chercherez", "chercheront"],
            conditionnel: ["chercherais", "chercherait", "chercherions", "chercheriez", "chercheraient"],
            subjonctif: ["cherche", "cherches", "cherchions", "cherchiez", "cherchent"],
            participe_present: ["cherchant"],
            participe_passe: ["cherché", "cherchée", "cherchés", "cherchées"]
        },

        "comprendre": {
            present: ["comprends", "comprend", "comprenons", "comprenez", "comprennent"],
            imparfait: ["comprenais", "comprenait", "comprenions", "compreniez", "comprenaient"],
            futur: ["comprendrai", "comprendras", "comprendra", "comprendrons", "comprendrez", "comprendront"],
            conditionnel: ["comprendrais", "comprendrait", "comprendrions", "comprendriez", "comprendraient"],
            subjonctif: ["comprenne", "comprennes", "comprenions", "compreniez", "comprennent"],
            participe_present: ["comprenant"],
            participe_passe: ["compris", "comprise", "comprises"]
        },

        "devoir": {
            present: ["dois", "doit", "devons", "devez", "doivent"],
            imparfait: ["devais", "devait", "devions", "deviez", "devaient"],
            futur: ["devrai", "devras", "devra", "devrons", "devrez", "devront"],
            conditionnel: ["devrais", "devrait", "devrions", "devriez", "devraient"],
            subjonctif: ["doive", "doives", "devions", "deviez", "doivent"],
            participe_present: ["devant"],
            participe_passe: ["dû", "due", "dus", "dues"]
        },

        "dire": {
            present: ["dis", "dit", "disons", "dites", "disent"],
            imparfait: ["disais", "disait", "disions", "disiez", "disaient"],
            futur: ["dirai", "diras", "dira", "dirons", "direz", "diront"],
            conditionnel: ["dirais", "dirait", "dirions", "diriez", "diraient"],
            subjonctif: ["dise", "dises", "disions", "disiez", "disent"],
            participe_present: ["disant"],
            participe_passe: ["dit", "dite", "dits", "dites"]
        },

        "écouter": {
            present: ["écoute", "écoutes", "écoutons", "écoutez", "écoutent"],
            imparfait: ["écoutais", "écoutait", "écoutions", "écoutiez", "écoutaient"],
            futur: ["écouterai", "écouteras", "écoutera", "écouterons", "écouterez", "écouteront"],
            conditionnel: ["écouterais", "écouterait", "écouterions", "écouteriez", "écouteraient"],
            subjonctif: ["écoute", "écoutes", "écoutions", "écoutiez", "écoutent"],
            participe_present: ["écoutant"],
            participe_passe: ["écouté", "écoutée", "écoutés", "écoutées"]
        },

        "entendre": {
            present: ["entends", "entend", "entendons", "entendez", "entendent"],
            imparfait: ["entendais", "entendait", "entendions", "entendiez", "entendaient"],
            futur: ["entendrai", "entendras", "entendra", "entendrons", "entendrez", "entendront"],
            conditionnel: ["entendrais", "entendrait", "entendrions", "entendriez", "entendraient"],
            subjonctif: ["entende", "entendes", "entendions", "entendiez", "entendent"],
            participe_present: ["entendant"],
            participe_passe: ["entendu", "entendue", "entendus", "entendues"]
        },

        "être": {
            present: ["suis", "es", "est", "sommes", "êtes", "sont"],
            imparfait: ["étais", "était", "étions", "étiez", "étaient"],
            futur: ["serai", "seras", "sera", "serons", "serez", "seront"],
            conditionnel: ["serais", "serait", "serions", "seriez", "seraient"],
            subjonctif: ["sois", "soit", "soyons", "soyez", "soient"],
            participe_present: ["étant"],
            participe_passe: ["été"]
        },

        "faire": {
            present: ["fais", "fait", "faisons", "faites", "font"],
            imparfait: ["faisais", "faisait", "faisions", "faisiez", "faisaient"],
            futur: ["ferai", "feras", "fera", "ferons", "ferez", "feront"],
            conditionnel: ["ferais", "ferait", "ferions", "feriez", "feraient"],
            subjonctif: ["fasse", "fasses", "fassions", "fassiez", "fassent"],
            participe_present: ["faisant"],
            participe_passe: ["fait", "faite", "faits", "faites"]
        },

        "parler": {
            present: ["parle", "parles", "parlons", "parlez", "parlent"],
            imparfait: ["parlais", "parlait", "parlions", "parliez", "parlaient"],
            futur: ["parlerai", "parleras", "parlera", "parlerons", "parlerez", "parleront"],
            conditionnel: ["parlerais", "parlerait", "parlerions", "parleriez", "parleraient"],
            subjonctif: ["parle", "parles", "parlions", "parliez", "parlent"],
            participe_present: ["parlant"],
            participe_passe: ["parlé", "parlée", "parlés", "parlées"]
        },

        "penser": {
            present: ["pense", "penses", "pensons", "pensez", "pensent"],
            imparfait: ["pensais", "pensait", "pensions", "pensiez", "pensaient"],
            futur: ["penserai", "penseras", "pensera", "penserons", "penserez", "penseront"],
            conditionnel: ["penserais", "penserait", "penserions", "penseriez", "penseraient"],
            subjonctif: ["pense", "penses", "pensions", "pensiez", "pensent"],
            participe_present: ["pensant"],
            participe_passe: ["pensé", "pensée", "pensés", "pensées"]
        },

        "pouvoir": {
            present: ["peux", "peut", "pouvons", "pouvez", "peuvent"],
            imparfait: ["pouvais", "pouvait", "pouvions", "pouviez", "pouvaient"],
            futur: ["pourrai", "pourras", "pourra", "pourrons", "pourrez", "pourront"],
            conditionnel: ["pourrais", "pourrait", "pourrions", "pourriez", "pourraient"],
            subjonctif: ["puisse", "puisses", "puissions", "puissiez", "puissent"],
            participe_present: ["pouvant"],
            participe_passe: ["pu"]
        },

        "regarder": {
            present: ["regarde", "regardes", "regardons", "regardez", "regardent"],
            imparfait: ["regardais", "regardait", "regardions", "regardiez", "regardaient"],
            futur: ["regarderai", "regarderas", "regardera", "regarderons", "regarderez", "regarderont"],
            conditionnel: ["regarderais", "regarderait", "regarderions", "regarderiez", "regarderaient"],
            subjonctif: ["regarde", "regardes", "regardions", "regardiez", "regardent"],
            participe_present: ["regardant"],
            participe_passe: ["regardé", "regardée", "regardés", "regardées"]
        },

        "savoir": {
            present: ["sais", "sait", "savons", "savez", "savent"],
            imparfait: ["savais", "savait", "savions", "saviez", "savaient"],
            futur: ["saurai", "sauras", "saura", "saurons", "saurez", "sauront"],
            conditionnel: ["saurais", "saurait", "saurions", "sauriez", "sauraient"],
            subjonctif: ["sache", "saches", "sachions", "sachiez", "sachent"],
            participe_present: ["sachant"],
            participe_passe: ["su", "sue", "sus", "sues"]
        },

        "sentir": {
            present: ["sens", "sent", "sentons", "sentez", "sentent"],
            imparfait: ["sentais", "sentait", "sentions", "sentiez", "sentaient"],
            futur: ["sentirai", "sentiras", "sentira", "sentirons", "sentirez", "sentiront"],
            conditionnel: ["sentirais", "sentirait", "sentirions", "sentiriez", "sentiraient"],
            subjonctif: ["sente", "sentes", "sentions", "sentiez", "sentent"],
            participe_present: ["sentant"],
            participe_passe: ["senti", "sentie", "sentis", "senties"]
        },

        "trouver": {
            present: ["trouve", "trouves", "trouvons", "trouvez", "trouvent"],
            imparfait: ["trouvais", "trouvait", "trouvions", "trouviez", "trouvaient"],
            futur: ["trouverai", "trouveras", "trouvera", "trouverons", "trouverez", "trouveront"],
            conditionnel: ["trouverais", "trouverait", "trouverions", "trouveriez", "trouveraient"],
            subjonctif: ["trouve", "trouves", "trouvions", "trouviez", "trouvent"],
            participe_present: ["trouvant"],
            participe_passe: ["trouvé", "trouvée", "trouvés", "trouvées"]
        },

        "venir": {
            present: ["viens", "vient", "venons", "venez", "viennent"],
            imparfait: ["venais", "venait", "venions", "veniez", "venaient"],
            futur: ["viendrai", "viendras", "viendra", "viendrons", "viendrez", "viendront"],
            conditionnel: ["viendrais", "viendrait", "viendrions", "viendriez", "viendraient"],
            subjonctif: ["vienne", "viennes", "venions", "veniez", "viennent"],
            participe_present: ["venant"],
            participe_passe: ["venu", "venue", "venus", "venues"]
        },

        "voir": {
            present: ["vois", "voit", "voyons", "voyez", "voient"],
            imparfait: ["voyais", "voyait", "voyions", "voyiez", "voyaient"],
            futur: ["verrai", "verras", "verra", "verrons", "verrez", "verront"],
            conditionnel: ["verrais", "verrait", "verrions", "verriez", "verraient"],
            subjonctif: ["voie", "voies", "voyions", "voyiez", "voient"],
            participe_present: ["voyant"],
            participe_passe: ["vu", "vue", "vus", "vues"]
        },

        "vouloir": {
            present: ["veux", "veut", "voulons", "voulez", "veulent"],
            imparfait: ["voulais", "voulait", "voulions", "vouliez", "voulaient"],
            futur: ["voudrai", "voudras", "voudra", "voudrons", "voudrez", "voudront"],
            conditionnel: ["voudrais", "voudrait", "voudrions", "voudriez", "voudraient"],
            subjonctif: ["veuille", "veuilles", "veuillions", "veuilliez", "veuillent"],
            participe_present: ["voulant"],
            participe_passe: ["voulu", "voulue", "voulus", "voulues"]
        },

        //======================================================
        // 🚶 Déplacement
        //======================================================

        "accélérer": {
            present: ["accélère", "accélères", "accélérons", "accélérez", "accélèrent"],
            imparfait: ["accélérais", "accélérait", "accélérions", "accélériez", "accéléraient"],
            futur: ["accélérerai", "accéléreras", "accélérera", "accélérerons", "accélérerez", "accéléreront"],
            conditionnel: ["accélérerais", "accélérerait", "accélérerions", "accéléreriez", "accéléreraient"],
            subjonctif: ["accélère", "accélères", "accélérions", "accélériez", "accélèrent"],
            participe_present: ["accélérant"],
            participe_passe: ["accéléré", "accélérée", "accélérés", "accélérées"]
        },

        "aller": {
            present: ["vais", "vas", "va", "allons", "allez", "vont"],
            imparfait: ["allais", "allait", "allions", "alliez", "allaient"],
            futur: ["irai", "iras", "ira", "irons", "irez", "iront"],
            conditionnel: ["irais", "irait", "irions", "iriez", "iraient"],
            subjonctif: ["aille", "ailles", "allions", "alliez", "aillent"],
            participe_present: ["allant"],
            participe_passe: ["allé", "allée", "allés", "allées"]
        }, 
        "approcher": {
            present: ["approche", "approches", "approchons", "approchez", "approchent"],
            imparfait: ["approchais", "approchait", "approchions", "approchiez", "approchaient"],
            futur: ["approcherai", "approcheras", "approchera", "approcherons", "approcherez", "approcheront"],
            conditionnel: ["approcherais", "approcherait", "approcherions", "approcheriez", "approcheraient"],
            subjonctif: ["approche", "approches", "approchions", "approchiez", "approchent"],
            participe_present: ["approchant"],
            participe_passe: ["approché", "approchée", "approchés", "approchées"]
        },

        "arriver": {
            present: ["arrive", "arrives", "arrivons", "arrivez", "arrivent"],
            imparfait: ["arrivais", "arrivait", "arrivions", "arriviez", "arrivaient"],
            futur: ["arriverai", "arriveras", "arrivera", "arriverons", "arriverez", "arriveront"],
            conditionnel: ["arriverais", "arriverait", "arriverions", "arriveriez", "arriveraient"],
            subjonctif: ["arrive", "arrives", "arrivions", "arriviez", "arrivent"],
            participe_present: ["arrivant"],
            participe_passe: ["arrivé", "arrivée", "arrivés", "arrivées"]
        },

        "avancer": {
            present: ["avance", "avances", "avançons", "avancez", "avancent"],
            imparfait: ["avançais", "avançait", "avancions", "avanciez", "avançaient"],
            futur: ["avancerai", "avanceras", "avancera", "avancerons", "avancerez", "avanceront"],
            conditionnel: ["avancerais", "avancerait", "avancerions", "avanceriez", "avanceraient"],
            subjonctif: ["avance", "avances", "avancions", "avanciez", "avancent"],
            participe_present: ["avançant"],
            participe_passe: ["avancé", "avancée", "avancés", "avancées"]
        },

        "courir": {
            present: ["cours", "court", "courons", "courez", "courent"],
            imparfait: ["courais", "courait", "courions", "couriez", "couraient"],
            futur: ["courrai", "courras", "courra", "courrons", "courrez", "courront"],
            conditionnel: ["courrais", "courrait", "courrions", "courriez", "courraient"],
            subjonctif: ["coure", "coures", "courions", "couriez", "courent"],
            participe_present: ["courant"],
            participe_passe: ["couru", "courue", "courus", "courues"]
        },

        "descendre": {
            present: ["descends", "descend", "descendons", "descendez", "descendent"],
            imparfait: ["descendais", "descendait", "descendions", "descendiez", "descendaient"],
            futur: ["descendrai", "descendras", "descendra", "descendrons", "descendrez", "descendront"],
            conditionnel: ["descendrais", "descendrait", "descendrions", "descendriez", "descendraient"],
            subjonctif: ["descende", "descendes", "descendions", "descendiez", "descendent"],
            participe_present: ["descendant"],
            participe_passe: ["descendu", "descendue", "descendus", "descendues"]
        },

        "entrer": {
            present: ["entre", "entres", "entrons", "entrez", "entrent"],
            imparfait: ["entrais", "entrait", "entrions", "entriez", "entraient"],
            futur: ["entrerai", "entreras", "entrera", "entrerons", "entrerez", "entreront"],
            conditionnel: ["entrerais", "entrerait", "entrerions", "entreriez", "entreraient"],
            subjonctif: ["entre", "entres", "entrions", "entriez", "entrent"],
            participe_present: ["entrant"],
            participe_passe: ["entré", "entrée", "entrés", "entrées"]
        },

        "grimper": {
            present: ["grimpe", "grimpes", "grimpons", "grimpez", "grimpent"],
            imparfait: ["grimpais", "grimpait", "grimpions", "grimpiez", "grimpaient"],
            futur: ["grimperai", "grimperas", "grimpera", "grimperons", "grimperez", "grimperont"],
            conditionnel: ["grimperais", "grimperait", "grimperions", "grimperiez", "grimpaient"],
            subjonctif: ["grimpe", "grimpes", "grimpions", "grimpiez", "grimpent"],
            participe_present: ["grimpant"],
            participe_passe: ["grimpé", "grimpée", "grimpés", "grimpées"]
        },

        "marcher": {
            present: ["marche", "marches", "marchons", "marchez", "marchent"],
            imparfait: ["marchais", "marchait", "marchions", "marchiez", "marchaient"],
            futur: ["marcherai", "marcheras", "marchera", "marcherons", "marcherez", "marcheront"],
            conditionnel: ["marcherais", "marcherait", "marcherions", "marcheriez", "marcheraient"],
            subjonctif: ["marche", "marches", "marchions", "marchiez", "marchent"],
            participe_present: ["marchant"],
            participe_passe: ["marché", "marchée", "marchés", "marchées"]
        },

        "monter": {
            present: ["monte", "montes", "montons", "montez", "montent"],
            imparfait: ["montais", "montait", "montions", "montiez", "montaient"],
            futur: ["monterai", "monteras", "montera", "monterons", "monterez", "monteront"],
            conditionnel: ["monterais", "monterait", "monterions", "monteriez", "monteraient"],
            subjonctif: ["monte", "montes", "montions", "montiez", "montent"],
            participe_present: ["montant"],
            participe_passe: ["monté", "montée", "montés", "montées"]
        },

        "partir": {
            present: ["pars", "part", "partons", "partez", "partent"],
            imparfait: ["partais", "partait", "partions", "partiez", "partaient"],
            futur: ["partirai", "partiras", "partira", "partirons", "partirez", "partiront"],
            conditionnel: ["partirais", "partirait", "partirions", "partiriez", "partiraient"],
            subjonctif: ["parte", "partes", "partions", "partiez", "partent"],
            participe_present: ["partant"],
            participe_passe: ["parti", "partie", "partis", "parties"]
        },

        "ramper": {
            present: ["rampe", "rampes", "rampons", "rampez", "rampent"],
            imparfait: ["rampais", "rampait", "rampions", "rampiez", "rampaient"],
            futur: ["ramperai", "ramperas", "rampera", "ramperons", "ramperez", "ramperont"],
            conditionnel: ["ramperais", "ramperait", "ramperions", "ramperiez", "ramperaient"],
            subjonctif: ["rampe", "rampes", "rampions", "rampiez", "rampent"],
            participe_present: ["rampant"],
            participe_passe: ["rampé", "rampée", "rampés", "rampées"]
        },

        "ralentir": {
            present: ["ralentis", "ralentit", "ralentissons", "ralentissez", "ralentissent"],
            imparfait: ["ralentissais", "ralentissait", "ralentissions", "ralentissiez", "ralentissaient"],
            futur: ["ralentirai", "ralentiras", "ralentira", "ralentirons", "ralentirez", "ralentiront"],
            conditionnel: ["ralentirais", "ralentirait", "ralentirions", "ralentiriez", "ralentiraient"],
            subjonctif: ["ralentisse", "ralentisses", "ralentissions", "ralentissiez", "ralentissent"],
            participe_present: ["ralentissant"],
            participe_passe: ["ralenti", "ralentie", "ralentis", "ralenties"]
        },

        "reculer": {
            present: ["recule", "recules", "reculons", "reculez", "reculent"],
            imparfait: ["reculais", "reculait", "reculions", "reculiez", "reculaient"],
            futur: ["reculerai", "reculeras", "reculera", "reculerons", "reculerez", "reculeront"],
            conditionnel: ["reculerais", "reculerait", "reculerions", "reculeriez", "reculeraient"],
            subjonctif: ["recule", "recules", "reculions", "reculiez", "reculent"],
            participe_present: ["reculant"],
            participe_passe: ["reculé", "reculée", "reculés", "reculées"]
        },

        "revenir": {
            present: ["reviens", "revient", "revenons", "revenez", "reviennent"],
            imparfait: ["revenais", "revenait", "revenions", "reveniez", "revenaient"],
            futur: ["reviendrai", "reviendras", "reviendra", "reviendrons", "reviendrez", "reviendront"],
            conditionnel: ["reviendrais", "reviendrait", "reviendrions", "reviendriez", "reviendraient"],
            subjonctif: ["revienne", "reviennes", "revenions", "reveniez", "reviennent"],
            participe_present: ["revenant"],
            participe_passe: ["revenu", "revenue", "revenus", "revenues"]
        },

        "s'éloigner": {
            present: ["m'éloigne", "t'éloignes", "s'éloigne", "nous éloignons", "vous éloignez", "s'éloignent"],
            imparfait: ["m'éloignais", "t'éloignais", "s'éloignait", "nous éloignions", "vous éloigniez", "s'éloignaient"],
            futur: ["m'éloignerai", "t'éloigneras", "s'éloignera", "nous éloignerons", "vous éloignerez", "s'éloigneront"],
            conditionnel: ["m'éloignerais", "t'éloignerais", "s'éloignerait", "nous éloignerions", "vous éloigneriez", "s'éloigneraient"],
            subjonctif: ["m'éloigne", "t'éloignes", "s'éloigne", "nous éloignions", "vous éloigniez", "s'éloignent"],
            participe_present: ["s'éloignant"],
            participe_passe: ["éloigné", "éloignée", "éloignés", "éloignées"]
        },

        "sauter": {
            present: ["saute", "sautes", "sautons", "sautez", "sautent"],
            imparfait: ["sautais", "sautait", "sautions", "sautiez", "sautaient"],
            futur: ["sauterai", "sauteras", "sautera", "sauterons", "sauterez", "sauteront"],
            conditionnel: ["sauterais", "sauterait", "sauterions", "sauteriez", "sauteraient"],
            subjonctif: ["saute", "sautes", "sautions", "sautiez", "sautent"],
            participe_present: ["sautant"],
            participe_passe: ["sauté", "sautée", "sautés", "sautées"]
        },

        "sortir": {
            present: ["sors", "sort", "sortons", "sortez", "sortent"],
            imparfait: ["sortais", "sortait", "sortions", "sortiez", "sortaient"],
            futur: ["sortirai", "sortiras", "sortira", "sortirons", "sortirez", "sortiront"],
            conditionnel: ["sortirais", "sortirait", "sortirions", "sortiriez", "sortiraient"],
            subjonctif: ["sorte", "sortes", "sortions", "sortiez", "sortent"],
            participe_present: ["sortant"],
            participe_passe: ["sorti", "sortie", "sortis", "sorties"]
        },

        "tomber": {
            present: ["tombe", "tombes", "tombons", "tombez", "tombent"],
            imparfait: ["tombais", "tombait", "tombions", "tombiez", "tombaient"],
            futur: ["tomberai", "tomberas", "tombera", "tomberons", "tomberez", "tomberont"],
            conditionnel: ["tomberais", "tomberait", "tomberions", "tomberiez", "tomberaient"],
            subjonctif: ["tombe", "tombes", "tombions", "tombiez", "tombent"],
            participe_present: ["tombant"],
            participe_passe: ["tombé", "tombée", "tombés", "tombées"]
        },

        "tourner": {
            present: ["tourne", "tournes", "tournons", "tournez", "tournent"],
            imparfait: ["tournais", "tournait", "tournions", "tourniez", "tournaient"],
            futur: ["tournerai", "tourneras", "tournera", "tournerons", "tournerez", "tourneront"],
            conditionnel: ["tournerais", "tournerait", "tournerions", "tourneriez", "tourneraient"],
            subjonctif: ["tourne", "tournes", "tournions", "tourniez", "tournent"],
            participe_present: ["tournant"],
            participe_passe: ["tourné", "tournée", "tournés", "tournées"]
        },

        "voler": {
            present: ["vole", "voles", "volons", "volez", "volent"],
            imparfait: ["volais", "volait", "volions", "voliez", "volaient"],
            futur: ["volerai", "voleras", "volera", "volerons", "volerez", "voleront"],
            conditionnel: ["volerais", "volerait", "volerions", "voleriez", "voleraient"],
            subjonctif: ["vole", "voles", "volions", "voliez", "volent"],
            participe_present: ["volant"],
            participe_passe: ["volé", "volée", "volés", "volées"]
        },

        "voyager": {
            present: ["voyage", "voyages", "voyageons", "voyagez", "voyagent"],
            imparfait: ["voyageais", "voyageait", "voyagions", "voyagiez", "voyageaient"],
            futur: ["voyagerai", "voyageras", "voyagera", "voyagerons", "voyagerez", "voyageront"],
            conditionnel: ["voyagerais", "voyagerait", "voyagerions", "voyageriez", "voyageraient"],
            subjonctif: ["voyage", "voyages", "voyagions", "voyagiez", "voyagent"],
            participe_present: ["voyageant"],
            participe_passe: ["voyagé", "voyagée", "voyagés", "voyagées"]
        },

        //======================================================
        // ⚔️ Combat
        //======================================================

        "agripper": {
            present: ["agrippe", "agrippes", "agrippons", "agrippez", "agrippent"],
            imparfait: ["agrippais", "agrippait", "agrippions", "agrippiez", "agrippaient"],
            futur: ["agripperai", "agripperas", "agrippera", "agripperons", "agripperez", "agripperont"],
            conditionnel: ["agripperais", "agripperait", "agripperions", "agripperiez", "agripperaient"],
            subjonctif: ["agrippe", "agrippes", "agrippions", "agrippiez", "agrippent"],
            participe_present: ["agrippant"],
            participe_passe: ["agrippé", "agrippée", "agrippés", "agrippées"]
        },

        "attaquer": {
            present: ["attaque", "attaques", "attaquons", "attaquez", "attaquent"],
            imparfait: ["attaquais", "attaquait", "attaquions", "attaquiez", "attaquaient"],
            futur: ["attaquerai", "attaqueras", "attaquera", "attaquerons", "attaquerez", "attaqueront"],
            conditionnel: ["attaquerais", "attaquerait", "attaquerions", "attaqueriez", "attaqueraient"],
            subjonctif: ["attaque", "attaques", "attaquions", "attaquiez", "attaquent"],
            participe_present: ["attaquant"],
            participe_passe: ["attaqué", "attaquée", "attaqués", "attaquées"]
        },

        "attraper": {
            present: ["attrape", "attrapes", "attrapons", "attrapez", "attrapent"],
            imparfait: ["attrapais", "attrapait", "attrapions", "attrapiez", "attrapaient"],
            futur: ["attraperai", "attraperas", "attrapera", "attraperons", "attraperez", "attraperont"],
            conditionnel: ["attraperais", "attraperait", "attraperions", "attraperiez", "attraperaient"],
            subjonctif: ["attrape", "attrapes", "attrapions", "attrapiez", "attrapent"],
            participe_present: ["attrapant"],
            participe_passe: ["attrapé", "attrapée", "attrapés", "attrapées"]
        },

        "bloquer": {
            present: ["bloque", "bloques", "bloquons", "bloquez", "bloquent"],
            imparfait: ["bloquais", "bloquait", "bloquions", "bloquiez", "bloquaient"],
            futur: ["bloquerai", "bloqueras", "bloquera", "bloquerons", "bloquerez", "bloqueront"],
            conditionnel: ["bloquerais", "bloquerait", "bloquerions", "bloqueriez", "bloqueraient"],
            subjonctif: ["bloque", "bloques", "bloquions", "bloquiez", "bloquent"],
            participe_present: ["bloquant"],
            participe_passe: ["bloqué", "bloquée", "bloqués", "bloquées"]
        },

        "combattre": {
            present: ["combats", "combat", "combattons", "combattez", "combattent"],
            imparfait: ["combattais", "combattait", "combattions", "combattiez", "combattaient"],
            futur: ["combattrai", "combattras", "combattra", "combattrons", "combattrez", "combattront"],
            conditionnel: ["combattrais", "combattrait", "combattrions", "combattriez", "combattraient"],
            subjonctif: ["combatte", "combattes", "combattions", "combattiez", "combattent"],
            participe_present: ["combattant"],
            participe_passe: ["combattu", "combattue", "combattus", "combattues"]
        },

        "défendre": {
            present: ["défends", "défend", "défendons", "défendez", "défendent"],
            imparfait: ["défendais", "défendait", "défendions", "défendiez", "défendaient"],
            futur: ["défendrai", "défendras", "défendra", "défendrons", "défendrez", "défendront"],
            conditionnel: ["défendrais", "défendrait", "défendrions", "défendriez", "défendraient"],
            subjonctif: ["défende", "défendes", "défendions", "défendiez", "défendent"],
            participe_present: ["défendant"],
            participe_passe: ["défendu", "défendue", "défendus", "défendues"]
        },

        "esquiver": {
            present: ["esquive", "esquives", "esquivons", "esquivez", "esquivent"],
            imparfait: ["esquivais", "esquivait", "esquivions", "esquiviez", "esquivaient"],
            futur: ["esquiverai", "esquiveras", "esquivera", "esquiverons", "esquiverez", "esquiveront"],
            conditionnel: ["esquiverais", "esquiverait", "esquiverions", "esquiveriez", "esquiveraient"],
            subjonctif: ["esquive", "esquives", "esquivions", "esquiviez", "esquivent"],
            participe_present: ["esquivant"],
            participe_passe: ["esquivé", "esquivée", "esquivés", "esquivées"]
        },

        "frapper": {
            present: ["frappe", "frappes", "frappons", "frappez", "frappent"],
            imparfait: ["frappais", "frappait", "frappions", "frappiez", "frappaient"],
            futur: ["frapperai", "frapperas", "frappera", "frapperons", "frapperez", "frapperont"],
            conditionnel: ["frapperais", "frapperait", "frapperions", "frapperiez", "frapperaient"],
            subjonctif: ["frappe", "frappes", "frappions", "frappiez", "frappent"],
            participe_present: ["frappant"],
            participe_passe: ["frappé", "frappée", "frappés", "frappées"]
        },

        "immobiliser": {
            present: ["immobilise", "immobilises", "immobilisons", "immobilisez", "immobilisent"],
            imparfait: ["immobilisais", "immobilisait", "immobilisions", "immobilisiez", "immobilisaient"],
            futur: ["immobiliserai", "immobiliseras", "immobilisera", "immobiliserons", "immobiliserez", "immobiliseront"],
            conditionnel: ["immobiliserais", "immobiliserait", "immobiliserions", "immobiliseriez", "immobiliseraient"],
            subjonctif: ["immobilise", "immobilises", "immobilisions", "immobilisiez", "immobilisent"],
            participe_present: ["immobilisant"],
            participe_passe: ["immobilisé", "immobilisée", "immobilisés", "immobilisées"]
        },

        "lancer": {
            present: ["lance", "lances", "lançons", "lancez", "lancent"],
            imparfait: ["lançais", "lançait", "lancions", "lanciez", "lançaient"],
            futur: ["lancerai", "lanceras", "lancera", "lancerons", "lancerez", "lanceront"],
            conditionnel: ["lancerais", "lancerait", "lancerions", "lanceriez", "lanceraient"],
            subjonctif: ["lance", "lances", "lancions", "lanciez", "lancent"],
            participe_present: ["lançant"],
            participe_passe: ["lancé", "lancée", "lancés", "lancées"]
        },

        "porter": {
            present: ["porte", "portes", "portons", "portez", "portent"],
            imparfait: ["portais", "portait", "portions", "portiez", "portaient"],
            futur: ["porterai", "porteras", "portera", "porterons", "porterez", "porteront"],
            conditionnel: ["porterais", "porterait", "porterions", "porteriez", "porteraient"],
            subjonctif: ["porte", "portes", "portions", "portiez", "portent"],
            participe_present: ["portant"],
            participe_passe: ["porté", "portée", "portés", "portées"]
        },

        "poursuivre": {
            present: ["poursuis", "poursuit", "poursuivons", "poursuivez", "poursuivent"],
            imparfait: ["poursuivais", "poursuivait", "poursuivions", "poursuiviez", "poursuivaient"],
            futur: ["poursuivrai", "poursuivras", "poursuivra", "poursuivrons", "poursuivrez", "poursuivront"],
            conditionnel: ["poursuivrais", "poursuivrait", "poursuivrions", "poursuivriez", "poursuivraient"],
            subjonctif: ["poursuive", "poursuives", "poursuivions", "poursuiviez", "poursuivent"],
            participe_present: ["poursuivant"],
            participe_passe: ["poursuivi", "poursuivie", "poursuivis", "poursuivies"]
        },

        "pousser": {
            present: ["pousse", "pousses", "poussons", "poussez", "poussent"],
            imparfait: ["poussais", "poussait", "poussions", "poussiez", "poussaient"],
            futur: ["pousserai", "pousseras", "poussera", "pousserons", "pousserez", "pousseront"],
            conditionnel: ["pousserais", "pousserait", "pousserions", "pousseriez", "pousseraient"],
            subjonctif: ["pousse", "pousses", "poussions", "poussiez", "poussent"],
            participe_present: ["poussant"],
            participe_passe: ["poussé", "poussée", "poussés", "poussées"]
        },

        "prendre": {
            present: ["prends", "prend", "prenons", "prenez", "prennent"],
            imparfait: ["prenais", "prenait", "prenions", "preniez", "prenaient"],
            futur: ["prendrai", "prendras", "prendra", "prendrons", "prendrez", "prendront"],
            conditionnel: ["prendrais", "prendrait", "prendrions", "prendriez", "prendraient"],
            subjonctif: ["prenne", "prennes", "prenions", "preniez", "prennent"],
            participe_present: ["prenant"],
            participe_passe: ["pris", "prise", "prises"]
        },

        "projeter": {
            present: ["projette", "projettes", "projetons", "projetez", "projettent"],
            imparfait: ["projetais", "projetait", "projetions", "projetiez", "projetaient"],
            futur: ["projetterai", "projetteras", "projettera", "projetterons", "projetterez", "projetteront"],
            conditionnel: ["projetterais", "projetterait", "projetterions", "projetteriez", "projetteraient"],
            subjonctif: ["projette", "projettes", "projetions", "projetiez", "projettent"],
            participe_present: ["projetant"],
            participe_passe: ["projeté", "projetée", "projetés", "projetées"]
        },

        "protéger": {
            present: ["protège", "protèges", "protégeons", "protégez", "protègent"],
            imparfait: ["protégeais", "protégeait", "protégions", "protégiez", "protégeaient"],
            futur: ["protégerai", "protégeras", "protégera", "protégerons", "protégerez", "protégeront"],
            conditionnel: ["protégerais", "protégerait", "protégerions", "protégeriez", "protégeraient"],
            subjonctif: ["protège", "protèges", "protégions", "protégiez", "protègent"],
            participe_present: ["protégeant"],
            participe_passe: ["protégé", "protégée", "protégés", "protégées"]
        },

        "saisir": {
            present: ["saisis", "saisit", "saisissons", "saisissez", "saisissent"],
            imparfait: ["saisissais", "saisissait", "saisissions", "saisissiez", "saisissaient"],
            futur: ["saisirai", "saisiras", "saisira", "saisirons", "saisirez", "saisiront"],
            conditionnel: ["saisirais", "saisirait", "saisirions", "saisiriez", "saisiraient"],
            subjonctif: ["saisisse", "saisisses", "saisissions", "saisissiez", "saisissent"],
            participe_present: ["saisissant"],
            participe_passe: ["saisi", "saisie", "saisis", "saisies"]
        },

        "tirer": {
            present: ["tire", "tires", "tirons", "tirez", "tirent"],
            imparfait: ["tirais", "tirait", "tirions", "tiriez", "tiraient"],
            futur: ["tirerai", "tireras", "tirera", "tirerons", "tirerez", "tireront"],
            conditionnel: ["tirerais", "tirerait", "tirerions", "tireriez", "tireraient"],
            subjonctif: ["tire", "tires", "tirions", "tiriez", "tirent"],
            participe_present: ["tirant"],
            participe_passe: ["tiré", "tirée", "tirés", "tirées"]
        },

        "toucher": {
            present: ["touche", "touches", "touchons", "touchez", "touchent"],
            imparfait: ["touchais", "touchait", "touchions", "touchiez", "touchaient"],
            futur: ["toucherai", "toucheras", "touchera", "toucherons", "toucherez", "toucheront"],
            conditionnel: ["toucherais", "toucherait", "toucherions", "toucheriez", "toucheraient"],
            subjonctif: ["touche", "touches", "touchions", "touchiez", "touchent"],
            participe_present: ["touchant"],
            participe_passe: ["touché", "touchée", "touchés", "touchées"]
        },

        "viser": {
            present: ["vise", "vises", "visons", "visez", "visent"],
            imparfait: ["visais", "visait", "visions", "visiez", "visaient"],
            futur: ["viserai", "viseras", "visera", "viserons", "viserez", "viseront"],
            conditionnel: ["viserais", "viserait", "viserions", "viseriez", "viseraient"],
            subjonctif: ["vise", "vises", "visions", "visiez", "visent"],
            participe_present: ["visant"],
            participe_passe: ["visé", "visée", "visés", "visées"]
        },

        //======================================================
        // 🏠 Vie courante
        //======================================================

        "arrêter": {
            present: ["arrête", "arrêtes", "arrêtons", "arrêtez", "arrêtent"],
            imparfait: ["arrêtais", "arrêtait", "arrêtions", "arrêtiez", "arrêtaient"],
            futur: ["arrêterai", "arrêteras", "arrêtera", "arrêterons", "arrêterez", "arrêteront"],
            conditionnel: ["arrêterais", "arrêterait", "arrêterions", "arrêteriez", "arrêteraient"],
            subjonctif: ["arrête", "arrêtes", "arrêtions", "arrêtiez", "arrêtent"],
            participe_present: ["arrêtant"],
            participe_passe: ["arrêté", "arrêtée", "arrêtés", "arrêtées"]
        },

        "attendre": {
            present: ["attends", "attend", "attendons", "attendez", "attendent"],
            imparfait: ["attendais", "attendait", "attendions", "attendiez", "attendaient"],
            futur: ["attendrai", "attendras", "attendra", "attendrons", "attendrez", "attendront"],
            conditionnel: ["attendrais", "attendrait", "attendrions", "attendriez", "attendraient"],
            subjonctif: ["attende", "attendes", "attendions", "attendiez", "attendent"],
            participe_present: ["attendant"],
            participe_passe: ["attendu", "attendue", "attendus", "attendues"]
        },

        "boire": {
            present: ["bois", "boit", "buvons", "buvez", "boivent"],
            imparfait: ["buvais", "buvait", "buvions", "buviez", "buvaient"],
            futur: ["boirai", "boiras", "boira", "boirons", "boirez", "boiront"],
            conditionnel: ["boirais", "boirait", "boirions", "boiriez", "boiraient"],
            subjonctif: ["boive", "boives", "buvions", "buviez", "boivent"],
            participe_present: ["buvant"],
            participe_passe: ["bu", "bue", "bus", "bues"]
        },

        "commencer": {
            present: ["commence", "commences", "commençons", "commencez", "commencent"],
            imparfait: ["commençais", "commençait", "commencions", "commenciez", "commençaient"],
            futur: ["commencerai", "commenceras", "commencera", "commencerons", "commencerez", "commenceront"],
            conditionnel: ["commencerais", "commencerait", "commencerions", "commenceriez", "commenceraient"],
            subjonctif: ["commence", "commences", "commencions", "commenciez", "commencent"],
            participe_present: ["commençant"],
            participe_passe: ["commencé", "commencée", "commencés", "commencées"]
        },

        "continuer": {
            present: ["continue", "continues", "continuons", "continuez", "continuent"],
            imparfait: ["continuais", "continuait", "continuions", "continuiez", "continuaient"],
            futur: ["continuerai", "continueras", "continuera", "continuerons", "continuerez", "continueront"],
            conditionnel: ["continuerais", "continuerait", "continuerions", "continueriez", "continueraient"],
            subjonctif: ["continue", "continues", "continuions", "continuiez", "continuent"],
            participe_present: ["continuant"],
            participe_passe: ["continué", "continuée", "continués", "continuées"]
        },

        "dormir": {
            present: ["dors", "dort", "dormons", "dormez", "dorment"],
            imparfait: ["dormais", "dormait", "dormions", "dormiez", "dormaient"],
            futur: ["dormirai", "dormiras", "dormira", "dormirons", "dormirez", "dormiront"],
            conditionnel: ["dormirais", "dormirait", "dormirions", "dormiriez", "dormiraient"],
            subjonctif: ["dorme", "dormes", "dormions", "dormiez", "dorment"],
            participe_present: ["dormant"],
            participe_passe: ["dormi"]
        },

        "fermer": {
            present: ["ferme", "fermes", "fermons", "fermez", "ferment"],
            imparfait: ["fermais", "fermait", "fermions", "fermiez", "fermaient"],
            futur: ["fermerai", "fermeras", "fermera", "fermerons", "fermerez", "fermeront"],
            conditionnel: ["fermerais", "fermerait", "fermerions", "fermeriez", "fermeraient"],
            subjonctif: ["ferme", "fermes", "fermions", "fermiez", "ferment"],
            participe_present: ["fermant"],
            participe_passe: ["fermé", "fermée", "fermés", "fermées"]
        },

        "finir": {
            present: ["finis", "finit", "finissons", "finissez", "finissent"],
            imparfait: ["finissais", "finissait", "finissions", "finissiez", "finissaient"],
            futur: ["finirai", "finiras", "finira", "finirons", "finirez", "finiront"],
            conditionnel: ["finirais", "finirait", "finirions", "finiriez", "finiraient"],
            subjonctif: ["finisse", "finisses", "finissions", "finissiez", "finissent"],
            participe_present: ["finissant"],
            participe_passe: ["fini", "finie", "finis", "finies"]
        },

        "manger": {
            present: ["mange", "manges", "mangeons", "mangez", "mangent"],
            imparfait: ["mangeais", "mangeait", "mangions", "mangiez", "mangeaient"],
            futur: ["mangerai", "mangeras", "mangera", "mangerons", "mangerez", "mangeront"],
            conditionnel: ["mangerais", "mangerait", "mangerions", "mangeriez", "mangeraient"],
            subjonctif: ["mange", "manges", "mangions", "mangiez", "mangent"],
            participe_present: ["mangeant"],
            participe_passe: ["mangé", "mangée", "mangés", "mangées"]
        },

        "ouvrir": {
            present: ["ouvre", "ouvres", "ouvrons", "ouvrez", "ouvrent"],
            imparfait: ["ouvrais", "ouvrait", "ouvrions", "ouvriez", "ouvraient"],
            futur: ["ouvrirai", "ouvriras", "ouvrira", "ouvrirons", "ouvrirez", "ouvriront"],
            conditionnel: ["ouvrirais", "ouvrirait", "ouvririons", "ouvririez", "ouvriraient"],
            subjonctif: ["ouvre", "ouvres", "ouvrions", "ouvriez", "ouvrent"],
            participe_present: ["ouvrant"],
            participe_passe: ["ouvert", "ouverte", "ouverts", "ouvertes"]
        }
    }
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

        "abondant",
        "abordable",
        "absent",
        "absolu",
        "absurde",
        "acceptable",
        "accompli",
        "accueillant",
        "acide",
        "actif",
        "actuel",
        "acéré",
        "adapté",
        "admirable",
        "admiratif",
        "adroit",
        "affamé",
        "affectueux",
        "affolé",
        "affreux",
        "agile",
        "agité",
        "agressif",
        "alerté",
        "allongé",
        "altruiste",
        "ambitieux",
        "amical",
        "ample",
        "amusant",
        "ancien",
        "angélique",
        "anxieux",
        "apaisé",
        "apparent",
        "approprié",
        "ardent",
        "arrogant",
        "artistique",
        "assidu",
        "assuré",
        "atroce",
        "attachant",
        "attentif",
        "audacieux",
        "authentique",
        "autoritaire",
        "avancé",
        "avantageux",
        "aveuglant",
        "aveugle",

        "beau",
        "beige",
        "bizarre",
        "blanc",
        "bleu",
        "borné",
        "brave",
        "bref",
        "brillant",
        "brutal",
        "bruyant",
        "brûlant",
        "bénéfique",

        "caché",
        "calme",
        "capable",
        "central",
        "certain",
        "chaleureux",
        "charmant",
        "chaud",
        "cher",
        "civil",
        "clair",
        "classique",
        "cohérent",
        "comique",
        "compact",
        "complet",
        "complexe",
        "compétent",
        "concentré",
        "concerné",
        "concret",
        "confiant",
        "consistant",
        "constant",
        "constructif",
        "contemporain",
        "convaincant",
        "correct",
        "coupable",
        "courageux",
        "cruel",
        "créatif",
        "curieux",
        "céleste",
        "célèbre",

        "dangereux",
        "dense",
        "difficile",
        "direct",
        "discret",
        "distinct",
        "divers",
        "dominé",
        "doux",
        "dynamique",
        "décisif",
        "décontracté",
        "défensif",
        "définitif",
        "délicat",
        "délicieux",
        "démesuré",
        "désagréable",
        "désespéré",
        "déterminant",
        "déterminé",
        "dévastateur",

        "efficace",
        "excellent",
        "exigeant",
        "extrême",
        "extérieur",

        "faible",
        "faux",
        "favorable",
        "fiable",
        "fier",
        "fin",
        "fort",
        "froid",
        "futur",

        "gentil",
        "grand",
        "grave",
        "généreux",

        "habile",
        "habitué",
        "haut",
        "honnête",

        "immédiat",
        "important",
        "intelligent",
        "intense",
        "invisible",

        "jeune",
        "joli",

        "lent",
        "libre",
        "lointain",
        "long",
        "lourd",
        "loyal",
        "léger",

        "magnifique",
        "maigre",
        "mauvais",
        "mince",
        "moderne",
        "motivé",

        "nerveux",
        "nombreux",
        "nouveau",

        "patient",
        "petit",
        "poli",
        "possessif",
        "proche",
        "prudent",
        "précis",
        "puissant",

        "rapide",
        "rare",
        "réel",
        "résistant",

        "silencieux",
        "simple",
        "simultané",
        "solide",
        "sombre",
        "souple",
        "stable",
        "stratégique",
        "successif",
        "sérieux",

        "technique",
        "tranquille",

        "vif",
        "violent",
        "visible",
        "vrai",

        "âpre",
        "élégant",
        "énergique",
        "énervé",
        "énorme",
        "évident"

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
        "confrontation",
        "affronter",
        "se battre",
        "fight",
        "fighting",
        "battle",
        "duel"
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
        "asséner",
        "frapper",
        "porter un coup",
        "lancer une attaque",
        "passer à l'attaque",
        "attack",
        "offensive",
        "assault"
    ]

},


frappe: {

    description:
        "Action consistant à porter un coup physique",

    mots: [
        "frapper",
        "frappe",
        "coup",
        "taper",
        "cogner",
        "heurter",
        "percuter",
        "impact",
        "porter un coup",
        "asséner un coup",
        "asséner",
        "strike",
        "hit",
        "blow",
        "smash"
    ]

},


coup_de_poing: {

    description:
        "Frappe réalisée avec le poing",

    mots: [
        "coup de poing",
        "coup de poing direct",
        "poing",
        "punch",
        "jab",
        "direct",
        "straight",
        "cross",
        "crochet",
        "hook",
        "uppercut",
        "overhand",
        "coup de poing circulaire",
        "coup de poing remontant",
        "coup de poing descendant"
    ]

},


coup_de_pied: {

    description:
        "Frappe réalisée avec le pied ou la jambe",

    mots: [
        "coup de pied",
        "kick",
        "front kick",
        "coup de pied frontal",
        "roundhouse",
        "roundhouse kick",
        "coup de pied circulaire",
        "side kick",
        "coup de pied latéral",
        "back kick",
        "coup de pied retourné",
        "hook kick",
        "coup de pied crochet",
        "axe kick",
        "coup de pied en hache",
        "low kick",
        "coup de pied bas",
        "spinning back kick",
        "coup de pied retourné circulaire"
    ]

},


genou: {

    description:
        "Frappe ou action réalisée avec le genou",

    mots: [
        "genou",
        "coup de genou",
        "genou direct",
        "genou sauté",
        "genou frontal",
        "genou circulaire",
        "knee",
        "knee strike",
        "knee kick",
        "flying knee",
        "jumping knee"
    ]

},


coude: {

    description:
        "Frappe réalisée avec le coude",

    mots: [
        "coude",
        "coup de coude",
        "coude horizontal",
        "coude circulaire",
        "coude remontant",
        "coude descendant",
        "elbow",
        "elbow strike",
        "horizontal elbow",
        "rising elbow",
        "downward elbow"
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
        "renverser",
        "mettre au sol",
        "envoyer au sol",
        "faire chuter",
        "takedown",
        "throw",
        "fauchage",
        "balayage",
        "sweep",
        "trip",
        "toss"
    ]

},


saisie: {

    description:
        "Action consistant à saisir ou contrôler une personne ou un objet",

    mots: [
        "saisir",
        "saisie",
        "attraper",
        "agripper",
        "empoigner",
        "tenir",
        "prise",
        "empoignade",
        "grab",
        "grip",
        "hold",
        "clinch",
        "grapple",
        "grappling"
    ]

},


immobilisation: {

    description:
        "Action visant à empêcher une cible de bouger",

    mots: [
        "immobiliser",
        "immobilisation",
        "maintenir",
        "retenir",
        "bloquer",
        "empêcher de bouger",
        "maintenir au sol",
        "clé",
        "clé de bras",
        "clé de jambe",
        "clé d'épaule",
        "étranglement",
        "soumission",
        "submission",
        "arm lock",
        "leg lock",
        "choke",
        "hold",
        "pin"
    ]

},


defense: {

    description:
        "Action visant à empêcher ou réduire les effets d'une attaque",

    mots: [
        "défendre",
        "défense",
        "se défendre",
        "protéger",
        "protection",
        "se protéger",
        "garde",
        "defend",
        "defense",
        "protect",
        "protection"
    ]

},


blocage: {

    description:
        "Action consistant à arrêter ou absorber une attaque",

    mots: [
        "bloquer",
        "blocage",
        "bloque",
        "parer",
        "parade",
        "garde",
        "protection",
        "absorber le coup",
        "arrêter le coup",
        "stopper le coup",
        "block",
        "guard",
        "parry"
    ]

},


deviation: {

    description:
        "Action consistant à détourner ou modifier la trajectoire d'une attaque",

    mots: [
        "dévier",
        "déviation",
        "dévie",
        "détourner",
        "détourne",
        "détournement",
        "dévier le coup",
        "dévier l'attaque",
        "détourner l'attaque",
        "repousser sur le côté",
        "écarter",
        "écarter le coup",
        "écarter l'attaque",
        "déviation de trajectoire",
        "deflect",
        "deflection",
        "redirect",
        "redirecting"
    ]

},


parade: {

    description:
        "Action défensive visant à détourner ou neutraliser une frappe",

    mots: [
        "parer",
        "parade",
        "parer le coup",
        "parer l'attaque",
        "bloquer avec la garde",
        "détourner le coup",
        "dévier le coup",
        "parry",
        "parried"
    ]

},


esquive: {

    description:
        "Action visant à éviter une attaque sans nécessairement la bloquer",

    mots: [
        "esquiver",
        "esquive",
        "éviter",
        "évite",
        "se décaler",
        "décaler",
        "pas de côté",
        "retrait",
        "reculer pour éviter",
        "plonger",
        "se pencher",
        "se baisser",
        "se courber",
        "duck",
        "dodge",
        "evade",
        "sidestep",
        "slip",
        "weave",
        "backstep"
    ]

},


contre_attaque: {

    description:
        "Action offensive réalisée en réponse à une attaque adverse",

    mots: [
        "contre",
        "contre-attaque",
        "contre attaque",
        "riposte",
        "riposter",
        "répliquer",
        "réponse offensive",
        "contre offensif",
        "contre immédiatement",
        "counter",
        "counterattack",
        "counter strike",
        "retaliation"
    ]

},


garde: {

    description:
        "Position défensive ou posture de combat",

    mots: [
        "garde",
        "garde haute",
        "garde basse",
        "garde ouverte",
        "garde fermée",
        "garde latérale",
        "position de garde",
        "position défensive",
        "posture de combat",
        "stance",
        "fighting stance",
        "high guard",
        "low guard",
        "open guard",
        "closed guard"
    ]

},


clinch: {

    description:
        "Situation de combat à très courte distance avec contact physique",

    mots: [
        "clinch",
        "corps à corps",
        "au corps à corps",
        "accrochage",
        "prise rapprochée",
        "combat rapproché",
        "contact rapproché",
        "s'agripper",
        "agrippés",
        "close combat"
    ]

},


acrobatie: {

    description:
        "Mouvement physique impliquant un saut, une rotation ou une figure aérienne",

    mots: [
        "saut",
        "sauter",
        "roulade",
        "salto",
        "flip",
        "vrille",
        "rotation aérienne",
        "rotation",
        "tour aérien",
        "saut retourné",
        "saut périlleux",
        "backflip",
        "frontflip",
        "spin",
        "roll",
        "aerial rotation"
    ]

},


impact: {

    description:
        "Effet physique produit lorsqu'une attaque touche une cible",

    mots: [
        "impact",
        "choc",
        "coup",
        "collision",
        "percussion",
        "frapper",
        "toucher",
        "atteindre",
        "percuter",
        "impact violent",
        "gros impact",
        "impact direct",
        "impact puissant",
        "hit",
        "collision"
    ]

},


precision: {

    description:
        "Qualité d'une action réalisée avec exactitude",

    mots: [
        "précis",
        "précision",
        "viser",
        "visé",
        "cibler",
        "exact",
        "exactement",
        "directement",
        "coup précis",
        "frappe précise",
        "precision",
        "accurate",
        "precise",
        "aim"
    ]

},


cible: {

    description:
        "Personne, objet ou zone visée par une action",

    mots: [
        "cible",
        "viser",
        "visé",
        "cibler",
        "adversaire",
        "ennemi",
        "target",
        "aim",
        "opponent"
    ]

}, 

   projection: {

    description:
        "Action visant à faire tomber ou projeter une cible au sol",

    mots: [
        "projeter",
        "projection",
        "projection au sol",
        "projeter au sol",
        "jeter au sol",
        "faire tomber",
        "faire chuter",
        "renverser",
        "mettre au sol",
        "envoyer au sol",
        "plaquer au sol",
        "balayer",
        "balayage",
        "faire un balayage",
        "balayage de jambe",
        "balayage des jambes",
        "fauchage",
        "faucher",
        "takedown",
        "take down",
        "throw",
        "slam",
        "sweep",
        "trip",
        "toss"
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

    let verbe = null;
    let forme = null;


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


            //==================================================
            // 🧠 IDENTIFICATION GRAMMATICALE DU VERBE
            //==================================================

            if (
                nomCategorie === "NEO_VERBES" &&
                resultat.chemin
            ) {

                
                if (
                    resultat.chemin.length >= 3
                ) {

                    verbe =
                        resultat.chemin[1];

                    forme =
                        resultat.chemin[2];

                }

            }

        }

    }


    return {

        trouve:
            categories.length > 0,

        mot,

        motNormalise:
            recherche,

        verbe,

        forme,

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
// 🧠 NEO AI — MOTEUR SÉMANTIQUE
//==============================================================

// Cache des recherches pour éviter de parcourir toute la base
// à chaque mot / expression.
const NEO_CACHE_RECHERCHE = new Map();


//--------------------------------------------------------------
// Normalisation spéciale pour les expressions
//--------------------------------------------------------------

function neoNormaliserExpression(texte) {
    return String(texte || "")
        .toLowerCase()
        .trim()
        .replace(/[’‘]/g, "'")
        .replace(/[-‐-‒–—]/g, " ")
        .replace(/\s+/g, " ");
}


//--------------------------------------------------------------
// Recherche d'une expression complète
//--------------------------------------------------------------

function neoRechercherExpression(expression) {

    const recherche = neoNormaliserExpression(expression);

    if (!recherche || !recherche.includes(" ")) {
        return {
            trouve: false,
            expression,
            categories: []
        };
    }

    const cacheKey = `expr:${recherche}`;

    if (NEO_CACHE_RECHERCHE.has(cacheKey)) {
        return NEO_CACHE_RECHERCHE.get(cacheKey);
    }

    const categories = [];

    for (const [nomCategorie, dictionnaire] of Object.entries(NEO_DICTIONNAIRES)) {

        const resultat = neoChercherMotDansCategorie(
            recherche,
            dictionnaire
        );

        if (resultat.trouve) {
            categories.push({
                categorie: nomCategorie,
                chemin: resultat.chemin
            });
        }
    }

    const resultatFinal = {
        trouve: categories.length > 0,
        expression,
        expressionNormalisee: recherche,
        categories
    };

    NEO_CACHE_RECHERCHE.set(cacheKey, resultatFinal);

    return resultatFinal;
}


//--------------------------------------------------------------
// Détermine le rôle sémantique d'un résultat de recherche
//--------------------------------------------------------------

function neoDeterminerRoles(categories = []) {

    const roles = new Set();

    for (const element of categories) {

        const categorie = String(
            element.categorie || ""
        ).toUpperCase();

        const chemin = Array.isArray(element.chemin)
            ? element.chemin.map(x =>
                String(x).toLowerCase()
            )
            : [];

        //------------------------------------------------------
        // Verbes
        //------------------------------------------------------

        if (
            categorie === "NEO_VERBES" ||
            categorie === "NEO_VERBES_SPECIAUX"
        ) {
            roles.add("verbe");
        }

        //------------------------------------------------------
        // Corps
        //------------------------------------------------------

        if (categorie === "NEO_PARTIES_CORPS") {
            roles.add("corps");
        }

        //------------------------------------------------------
        // Directions
        //------------------------------------------------------

        if (categorie === "NEO_DIRECTIONS") {
            roles.add("direction");
        }

        //------------------------------------------------------
        // Prépositions / relations
        //------------------------------------------------------

        if (categorie === "NEO_PREPOSITIONS") {
            roles.add("preposition");
            roles.add("relation");
        }

        //------------------------------------------------------
        // Connecteurs
        //------------------------------------------------------

        if (categorie === "NEO_CONNECTEURS") {
            roles.add("connecteur");
        }

        //------------------------------------------------------
        // Temps
        //------------------------------------------------------

        if (categorie === "NEO_TEMPS") {
            roles.add("temps");
        }

        //------------------------------------------------------
        // Combat
        //------------------------------------------------------

        if (categorie === "NEO_COMBAT") {

            roles.add("combat");

            const conceptsAction = [
                "attaques",
                "attaque",
                "frappes",
                "frappe",
                "coups_de_poing",
                "coups_de_pied",
                "coup_de_poing",
                "coup_de_pied",
                "projection",
                "saisie",
                "immobilisation",
                "defense",
                "blocage",
                "parade",
                "esquive",
                "contre_attaque",
                "impact"
            ];

            if (
                chemin.some(x =>
                    conceptsAction.includes(x)
                )
            ) {
                roles.add("action_combat");
            }

            if (
                chemin.includes("cible")
            ) {
                roles.add("cible");
            }
        }
    }

    return [...roles];
}


//--------------------------------------------------------------
// Analyse sémantique d'un mot
//--------------------------------------------------------------

function neoAnalyserMot(mot) {

    const resultat = neoRechercherMot(mot);

    if (!resultat || !resultat.trouve) {

        return {
            mot,
            connu: false,
            roles: [],
            categories: []
        };
    }

    return {
        mot,
        connu: true,
        roles: neoDeterminerRoles(resultat.categories),
        categories: resultat.categories
    };
}


//--------------------------------------------------------------
// Tokenisation intelligente
//
// Cherche d'abord les expressions longues :
// "coup de poing"
// "coup de pied"
// etc.
//
// Puis descend progressivement jusqu'au mot simple.
//--------------------------------------------------------------

function neoTokeniserSemantique(texte) {

    const normalise = neoNormaliserExpression(texte);

    if (!normalise) return [];

    const mots = normalise.split(/\s+/);

    const tokens = [];

    let i = 0;

    while (i < mots.length) {

        let trouveExpression = null;

        // Maximum 6 mots dans une expression.
        const max = Math.min(6, mots.length - i);

        for (let longueur = max; longueur >= 2; longueur--) {

            const morceaux = mots.slice(
                i,
                i + longueur
            );

            const expression = morceaux.join(" ");

            const resultat =
                neoRechercherExpression(expression);

            if (resultat.trouve) {

                trouveExpression = {
                    texte: morceaux.join(" "),
                    debut: i,
                    fin: i + longueur - 1,
                    connu: true,
                    expression: true,
                    categories: resultat.categories,
                    roles: neoDeterminerRoles(
                        resultat.categories
                    )
                };

                break;
            }
        }

        //------------------------------------------------------
        // Expression trouvée
        //------------------------------------------------------

        if (trouveExpression) {

            tokens.push(trouveExpression);

            i = trouveExpression.fin + 1;

            continue;
        }

        //------------------------------------------------------
        // Mot simple
        //------------------------------------------------------

        const mot = mots[i];

        const analyse = neoAnalyserMot(mot);

        tokens.push({
            texte: mot,
            debut: i,
            fin: i,
            connu: analyse.connu,
            expression: false,
            categories: analyse.categories,
            roles: analyse.roles
        });

        i++;
    }

    return tokens;
}


//--------------------------------------------------------------
// Retourne les concepts de combat détectés
//--------------------------------------------------------------

function neoExtraireConceptsCombat(tokens = []) {

    const concepts = [];

    for (const token of tokens) {

        if (!token.roles?.includes("combat")) {
            continue;
        }

        for (const categorie of token.categories || []) {

            if (
                categorie.categorie !== "NEO_COMBAT"
            ) {
                continue;
            }

            const chemin = categorie.chemin || [];

            const concept = chemin.find(
                x =>
                    typeof x === "string" &&
                    x !== "mots"
            );

            if (
                concept &&
                !concepts.includes(concept)
            ) {
                concepts.push(concept);
            }
        }
    }

    return concepts;
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
    NEO_LEARN, 

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
    neoConnaitMot, 
// 🧠 Nouveau moteur sémantique
    neoRechercherExpression,
    neoDeterminerRoles,
    neoAnalyserMot,
    neoTokeniserSemantique,
    neoExtraireConceptsCombat
};
