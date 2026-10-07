/**
 * ============================================================================
 * NeoAI.js — Base de connaissances sémantiques
 * ----------------------------------------------------------------------------
 * Ce fichier NE CONTIENT AUCUNE LOGIQUE DE PARSING.
 * Le parsing réel est effectué ailleurs (cmd/outils.js : AnalyserNeoAI,
 * analysePaveAvecNeoAI). Ce fichier fournit uniquement les connaissances :
 * vocabulaire, synonymes sémantiques, entités, paramètres, relations et
 * modèles structurels légers, utilisés par le moteur pour ramener des
 * formulations très différentes vers une structure sémantique commune.
 *
 * CommonJS pur. Aucune dépendance externe. Aucun accès réseau.
 * ============================================================================
 */

'use strict';

/* ============================================================================
 * 1. CONFIGURATION
 * ========================================================================== */

const NEOAI_CONFIG = {
    version: '1.0.0',
    langue: 'fr',
    // Le moteur doit normaliser (minuscule, accents optionnels, morphologie)
    // avant de consulter cette base. Cette base fournit les formes normalisées
    // cibles (toujours en minuscule, sans accent quand une variante existe).
    normalisationAttendue: {
        minuscule: true,
        accentsTolerantsEntree: true,
        moprhologieGereeParMoteur: true // conjugaisons, pluriels -> racine
    },
    champsEssentielsAction: [
        'sujet',
        'action',
        'mouvement',
        'cible',
        'direction',
        'trajectoire',
        'distance',
        'hauteur',
        'vitesse',
        'partie_corps',
        'cote_corps',
        'zone',
        'intention'
    ]
};

/* ============================================================================
 * 2. VOCABULAIRE
 * ========================================================================== */

// ---- 2.1 Verbes (racines / infinitifs), regroupés par famille sémantique --
const NEO_VERBES = {
    deplacement: [
        'foncer', 'courir', 'se precipiter', 'charger', 'sprinter',
        'accourir', 'se ruer', 'se jeter', 'filer', 'bondir',
        'sauter', 'plonger', 'voler', 'glisser', 'ramper',
        'marcher', 'avancer', 'reculer', 'retomber', 'atterrir',
        'esquiver', 'eviter', 'se decaler', 'se deplacer', 'contourner'
    ],
    attaque: [
        'frapper', 'attaquer', 'donner un coup', 'assener', 'cogner',
        'envoyer', 'decocher', 'lancer', 'porter un coup', 'tenter de toucher',
        'viser', 'transpercer', 'trancher', 'couper', 'mordre',
        'griffer', 'projeter une attaque', 'percuter'
    ],
    defense: [
        'parer', 'bloquer', 'devier', 'contrer', 'se proteger',
        'se couvrir', 'encaisser', 'absorber', 'repousser', 'resister'
    ],
    saisie: [
        'saisir', 'agripper', 'attraper', 'empoigner', 'accrocher',
        'immobiliser', 'ceinturer', 'maintenir', 'retenir', 'bloquer un membre'
    ],
    projection: [
        'projeter', 'balancer', 'jeter', 'faire tomber', 'renverser',
        'plaquer', 'terrasser', 'faucher', 'basculer'
    ],
    interaction: [
        'saisir un objet', 'ramasser', 'lancer un objet', 'utiliser',
        'activer', 'invoquer', 'degainer', 'ranger'
    ]
};

// ---- 2.2 Noms génériques utiles au contexte de combat ----------------------
const NEO_NOMS = {
    cibles: ['adversaire', 'ennemi', 'cible', 'allie', 'personnage', 'joueur'],
    armes: ['epee', 'kunai', 'shuriken', 'lance', 'baton', 'poing americain', 'arme'],
    zonesCombat: ['sol', 'air', 'mur', 'arene', 'terrain'],
    energies: ['chakra', 'energie', 'aura', 'reserve']
};

// ---- 2.3 Adjectifs qualifiant intensité / manière --------------------------
const NEO_ADJECTIFS = [
    'rapide', 'lent', 'puissant', 'violent', 'precis', 'brutal',
    'soudain', 'fulgurant', 'leger', 'lourd', 'direct', 'circulaire',
    'frontal', 'lateral', 'vertical', 'diagonal'
];

// ---- 2.4 Adverbes de manière / intensité -----------------------------------
const NEO_ADVERBES = [
    'rapidement', 'lentement', 'brutalement', 'violemment', 'soudainement',
    'frontalement', 'lateralement', 'directement', 'fortement', 'legerement',
    'immediatement', 'aussitot'
];

// ---- 2.5 Connecteurs (structure de phrase / enchainement) ------------------
const NEO_CONNECTEURS = [
    'puis', 'ensuite', 'et', 'avant de', 'apres avoir', 'en meme temps que',
    'pendant que', 'pour', 'afin de', 'dans le but de', 'avec'
];

// ---- 2.6 Prépositions marquant la cible / la relation spatiale -------------
const NEO_PREPOSITIONS = {
    marqueursCible: [
        'vers', 'sur', 'contre', 'contre lui', 'contre elle',
        'sur lui', 'sur elle', 'en direction de', 'a'
    ],
    marqueursOrigine: ['depuis', 'de puis', 'a partir de'],
    marqueursMoyen: ['avec', 'a l\'aide de', 'au moyen de'],
    marqueursZone: ['au', 'a la', 'sur le', 'sur la', 'dans le', 'dans la']
};

/* ============================================================================
 * 3. ENTITES
 * ========================================================================== */

// ---- 3.1 Parties du corps (taxonomie) avec synonymes -----------------------
// Chaque entrée : concept canonique -> liste de synonymes / variantes.
const NEO_PARTIES_CORPS = {
    // tête et environs
    tete: ['tete', 'crane'],
    visage: ['visage', 'face'],
    front: ['front'],
    tempe: ['tempe', 'tempes'],
    oeil: ['oeil', 'yeux', 'oeils'],
    nez: ['nez'],
    bouche: ['bouche'],
    menton: ['menton'],
    machoire: ['machoire'],
    oreille: ['oreille', 'oreilles'],

    // cou
    cou: ['cou'],
    nuque: ['nuque'],
    gorge: ['gorge'],

    // membres supérieurs
    epaule: ['epaule', 'epaules'],
    bras: ['bras'],
    coude: ['coude'],
    avant_bras: ['avant-bras', 'avant bras'],
    poignet: ['poignet'],
    main: ['main', 'mains'],
    doigts: ['doigts', 'doigt'],
    poing: ['poing', 'poings'],

    // tronc
    torse: ['torse'],
    poitrine: ['poitrine'],
    thorax: ['thorax'],
    abdomen: ['abdomen'],
    ventre: ['ventre'],
    estomac: ['estomac'],
    cotes: ['cotes', 'cote (torse)'],
    flanc: ['flanc'],
    dos: ['dos'],

    // bassin
    hanche: ['hanche'],
    bassin: ['bassin'],

    // membres inférieurs
    jambe: ['jambe'],
    cuisse: ['cuisse'],
    genou: ['genou'],
    mollet: ['mollet'],
    cheville: ['cheville'],
    pied: ['pied', 'pieds'],
    talon: ['talon'],
    orteils: ['orteils', 'orteil']
};

// ---- 3.2 Côtés du corps (INDEPENDANT de la direction spatiale) -------------
const NEO_COTES_CORPS = {
    gauche: ['gauche'],
    droit: ['droit', 'droite']
};

// ---- 3.3 Zones corporelles élargies (regroupements pour désambiguïsation) --
const NEO_ZONES_CORPORELLES = {
    zone_tete: ['tete', 'visage', 'front', 'tempe', 'oeil', 'nez', 'bouche', 'menton', 'machoire', 'oreille'],
    zone_cou: ['cou', 'nuque', 'gorge'],
    zone_membre_superieur: ['epaule', 'bras', 'coude', 'avant_bras', 'poignet', 'main', 'doigts', 'poing'],
    zone_tronc: ['torse', 'poitrine', 'thorax', 'abdomen', 'ventre', 'estomac', 'cotes', 'flanc', 'dos'],
    zone_bassin: ['hanche', 'bassin'],
    zone_membre_inferieur: ['jambe', 'cuisse', 'genou', 'mollet', 'cheville', 'pied', 'talon', 'orteils']
};

// ---- 3.4 Types de cibles ----------------------------------------------------
const NEO_TYPES_CIBLES = ['personnage', 'objet', 'zone', 'soi_meme'];

/* ============================================================================
 * 4. PARAMETRES SEMANTIQUES
 * ========================================================================== */

// ---- 4.1 Direction (spatiale globale du mouvement) — DIFFERENT de TRAJECTOIRE
const NEO_DIRECTIONS = {
    avant: ['avant', 'vers l\'avant', 'en avant', 'droit devant', 'devant', 'frontalement'],
    arriere: ['arriere', 'vers l\'arriere', 'en arriere', 'derriere'],
    gauche: ['gauche', 'vers la gauche', 'a gauche'],
    droite: ['droite', 'vers la droite', 'a droite'],
    haut: ['haut', 'vers le haut', 'en haut', 'en l\'air', 'vers le ciel'],
    bas: ['bas', 'vers le bas', 'en bas', 'vers le sol'],
    avant_gauche: ['avant-gauche', 'en diagonale avant gauche'],
    avant_droite: ['avant-droite', 'en diagonale avant droite'],
    arriere_gauche: ['arriere-gauche', 'en diagonale arriere gauche'],
    arriere_droite: ['arriere-droite', 'en diagonale arriere droite'],
    vertical: ['vertical', 'a la verticale']
};

// ---- 4.2 Trajectoire (forme du mouvement) ----------------------------------
const NEO_TRAJECTOIRES = {
    frontale: ['frontale', 'droit devant', 'en ligne droite', 'frontalement', 'de face'],
    laterale: ['laterale', 'sur le cote', 'de cote'],
    diagonale: ['diagonale', 'en diagonale'],
    circulaire: ['circulaire', 'en cercle', 'en tournant autour', 'en rotation'],
    courbe: ['courbe', 'en courbe', 'en arc de cercle'],
    zig_zag: ['zig-zag', 'en zigzag', 'en serpentant'],
    verticale: ['verticale', 'a la verticale'],
    aerienne: ['aerienne', 'dans les airs', 'en vol'],
    descendante: ['descendante', 'vers le bas', 'en piquet', 'en piquant'],
    ascendante: ['ascendante', 'vers le haut', 'montante'],
    retournee: ['retournee', 'en se retournant', 'a l\'envers']
};

// ---- 4.3 Distance -----------------------------------------------------------
const NEO_DISTANCES = {
    categories: {
        close: ['au corps a corps', 'tres proche', 'colle', 'a bout portant'],
        courte: ['courte distance', 'de pres', 'proche'],
        moyenne: ['distance moyenne', 'a moyenne portee'],
        longue: ['longue distance', 'de loin', 'a distance']
    },
    // Le moteur doit conserver la valeur numérique quand elle existe.
    // Unités reconnues : m, cm, mètre(s), centimètre(s).
    unitesReconnues: ['m', 'metre', 'metres', 'cm', 'centimetre', 'centimetres'],
    formatSortie: { valeur: 'number', unite: 'm|cm' }
};

// ---- 4.4 Hauteur -------------------------------------------------------------
const NEO_HAUTEURS = {
    categories: {
        sol: ['au sol', 'a terre', 'au ras du sol'],
        basse: ['basse hauteur', 'peu haut'],
        moyenne: ['hauteur moyenne'],
        haute: ['tres haut', 'haute altitude', 'tres en hauteur']
    },
    unitesReconnues: ['m', 'metre', 'metres', 'cm']
};

// ---- 4.5 Vitesse --------------------------------------------------------------
const NEO_VITESSES = {
    lente: ['lentement', 'doucement', 'au ralenti', 'vitesse lente'],
    vitesse_normale: ['normalement', 'a vitesse normale', 'sans se presser'],
    rapide: ['rapidement', 'vite', 'rapide'],
    tres_rapide: ['tres rapidement', 'tres vite', 'a toute allure'],
    vitesse_maximale: [
        'a toute vitesse', 'a pleine vitesse', 'a vitesse maximale',
        'en trombe', 'vmax', 'v-max', 'a la vitesse maximale',
        'au maximum de sa vitesse'
    ]
};

// ---- 4.6 Intensité / impact ---------------------------------------------------
const NEO_INTENSITES = {
    faible: ['faiblement', 'legerement', 'en douceur'],
    moyenne: ['normalement', 'moyennement'],
    forte: ['fortement', 'violemment', 'brutalement', 'avec force'],
    maximale: ['de toutes ses forces', 'avec une force maximale', 'de toute sa puissance']
};

// ---- 4.7 Intention -------------------------------------------------------------
const NEO_INTENTIONS = {
    atteindre: ['atteindre', 'toucher', 'pour l\'atteindre', 'pour le toucher'],
    approcher: ['approcher', 'se rapprocher', 'se mettre a portee'],
    s_eloigner: ['s\'eloigner', 'prendre ses distances', 'reculer pour fuir'],
    fuir: ['fuir', 'echapper', 's\'enfuir', 'prendre la fuite'],
    attaquer: ['attaquer', 'porter une offensive', 'pour l\'attaquer'],
    esquiver: ['esquiver', 'eviter', 'echapper au coup'],
    bloquer: ['bloquer', 'stopper', 'arreter le coup'],
    repousser: ['repousser', 'faire reculer'],
    immobiliser: ['immobiliser', 'bloquer les mouvements', 'empecher de bouger'],
    projeter: ['projeter', 'envoyer au sol', 'faire voler'],
    intercepter: ['intercepter', 'couper la trajectoire', 'se placer devant']
};

// ---- 4.8 Position (statique, sans déplacement) ---------------------------------
const NEO_POSITIONS = {
    debout: ['debout'],
    au_sol: ['au sol', 'allonge', 'a terre'],
    accroupi: ['accroupi', 'baisse'],
    en_garde: ['en garde', 'en position de combat'],
    a_genoux: ['a genoux']
};

// ---- 4.9 Paramètres de combat génériques ----------------------------------------
const NEO_PARAMETRES_COMBAT = ['force', 'puissance', 'vitesse', 'distance', 'hauteur', 'impact', 'intensite', 'precision'];

/* ============================================================================
 * 5. SYNONYMES SEMANTIQUES
 * ========================================================================== */

const NEO_SYNONYMES = {
    // ---- déplacements ----------------------------------------------------
    deplacements: {
        course: ['foncer', 'courir', 'se precipiter', 'charger', 'sprinter', 'accourir', 'se ruer', 'se jeter', 'filer', 'courir droit sur', 's\'elancer'],
        saut: ['sauter', 'bondir en hauteur', 'faire un saut'],
        bond: ['bondir', 'faire un bond'],
        vol: ['voler', 's\'envoler', 'planer'],
        marche: ['marcher', 'avancer doucement', 'se deplacer au pas'],
        glissade: ['glisser', 'deraper'],
        plongeon: ['plonger', 'faire un plongeon'],
        escalade: ['escalader', 'grimper']
    },

    // ---- attaques ----------------------------------------------------------
    attaques: {
        frappe_generique: ['frapper', 'donner un coup', 'porter un coup', 'assener un coup', 'cogner'],
        direct: ['direct', 'coup droit', 'lance un direct', 'envoie un coup droit', 'decoche un direct', 'frappe droit devant'],
        crochet_gauche: ['crochet gauche', 'hook gauche', 'coup de crochet avec le poing gauche'],
        crochet_droit: ['crochet droit', 'hook droit', 'coup de crochet avec le poing droit'],
        uppercut: ['uppercut', 'coup remontant', 'coup de bas en haut'],
        uppercut_saute: ['uppercut saute', 'uppercut avec saut'],
        revers: ['revers', 'coup de revers'],
        revers_circulaire: ['revers circulaire', 'coup de revers en cercle'],
        marteau_descendant: ['coup marteau descendant', 'coup marteau vers le bas'],
        marteau_lateral: ['coup marteau lateral', 'coup marteau sur le cote'],
        marteau_revers: ['coup marteau revers']
    },

    // ---- attaques de pied ---------------------------------------------------
    attaquesPied: {
        coup_pied_direct: ['coup de pied direct', 'coup de pied droit devant'],
        coup_pied_circulaire: ['coup de pied circulaire', 'coup de pied en cercle', 'roundhouse'],
        coup_pied_lateral: ['coup de pied lateral', 'coup de pied de cote'],
        coup_pied_arriere: ['coup de pied arriere', 'coup de pied en reculant'],
        coup_pied_haut: ['coup de pied haut', 'coup de pied a la tete'],
        coup_pied_descendant: ['coup de pied descendant', 'coup de pied du haut vers le bas'],
        coup_pied_retourne: ['coup de pied retourne', 'coup de pied en se retournant'],
        coup_pied_saute: ['coup de pied saute', 'coup de pied avec un saut'],
        coup_pied_croise: ['coup de pied croise'],
        coup_pied_talon: ['coup de pied talon', 'coup de talon']
    },

    // ---- défenses ------------------------------------------------------------
    defenses: {
        parade: ['parer', 'devier le coup', 'faire une parade'],
        blocage: ['bloquer', 'stopper le coup'],
        contre: ['contrer', 'riposter'],
        esquive: ['esquiver', 'eviter', 'se decaler pour eviter']
    },

    // ---- saisies ---------------------------------------------------------------
    saisies: {
        saisie_generique: ['saisir', 'agripper', 'attraper', 'empoigner'],
        immobilisation: ['immobiliser', 'maintenir', 'retenir', 'ceinturer']
    },

    // ---- vitesses (miroir de NEO_VITESSES pour accès direct) -------------------
    vitesses: NEO_VITESSES,

    // ---- directions (miroir de NEO_DIRECTIONS) ----------------------------------
    directions: NEO_DIRECTIONS,

    // ---- trajectoires (miroir de NEO_TRAJECTOIRES) -------------------------------
    trajectoires: NEO_TRAJECTOIRES,

    // ---- distances -----------------------------------------------------------------
    distances: NEO_DISTANCES.categories,

    // ---- intentions ------------------------------------------------------------------
    intentions: NEO_INTENTIONS,

    // ---- parties du corps (miroir) -----------------------------------------------------
    partiesDuCorps: NEO_PARTIES_CORPS,

    // ---- verbes (formes conjuguées -> verbe canonique) --------------------------------
    // IMPORTANT : le moteur de parsing (cmd/outils.js) fait une correspondance
    // EXACTE mot-entier, sans aucune racinisation/lemmatisation. Chaque forme
    // conjuguée doit donc être listée littéralement en alias, sinon elle ne sera
    // jamais reconnue (c'est la cause du bug "zéro reconnaissance de verbe").
    verbes: {
        foncer: ['foncer', 'fonce', 'fonces', 'fonçons', 'foncez', 'foncent', 'fonçais', 'fonçait', 'fonçaient', 'fonça', 'foncèrent', 'fonçant', 'foncé', 'foncés', 'foncée', 'foncées'],
        precipiter: ['se precipiter', 'se precipite', 'se precipitent', 'se precipita', 'se precipitant', 'precipite', 'precipita', 'precipitant', 'precipite'],
        charger: ['charger', 'charge', 'charges', 'chargeons', 'chargez', 'chargent', 'chargeait', 'chargea', 'chargèrent', 'chargeant', 'charge', 'chargee', 'charges', 'chargees'],
        courir: ['courir', 'court', 'courons', 'courez', 'courent', 'courait', 'courut', 'coururent', 'courant', 'couru', 'courue', 'courus', 'courues'],
        sprinter: ['sprinter', 'sprinte', 'sprintes', 'sprintent', 'sprinta', 'sprintant', 'sprinte'],
        accourir: ['accourir', 'accourt', 'accourent', 'accourait', 'accourut', 'accourant', 'accouru'],
        ruer: ['se ruer', 'se rue', 'se ruent', 'se rua', 'se ruant', 'rue', 'ruee'],
        jeter_soi: ['se jeter', 'se jette', 'se jettent', 'se jeta', 'se jetant', 'jete', 'jetee'],
        filer: ['filer', 'file', 'files', 'filons', 'filez', 'filent', 'filait', 'fila', 'filant', 'file'],
        elancer: ['s\'elancer', 's\'elance', 's\'elancent', 's\'elanca', 's\'elancant', 'elance', 'elancee'],
        sauter: ['sauter', 'saute', 'sautes', 'sautons', 'sautez', 'sautent', 'sautait', 'sauta', 'sautant', 'saute', 'sautee'],
        bondir: ['bondir', 'bondit', 'bondissons', 'bondissez', 'bondissent', 'bondissait', 'bondit', 'bondissant', 'bondi', 'bondie'],
        voler: ['voler', 'vole', 'voles', 'volons', 'volez', 'volent', 'volait', 'vola', 'volant', 'vole', 'volee'],
        envoler: ['s\'envoler', 's\'envole', 's\'envolent', 's\'envola', 's\'envolant', 'envole', 'envolee'],
        planer: ['planer', 'plane', 'planes', 'planent', 'plana', 'planant', 'plane'],
        marcher: ['marcher', 'marche', 'marches', 'marchons', 'marchez', 'marchent', 'marchait', 'marcha', 'marchant', 'marche'],
        avancer: ['avancer', 'avance', 'avances', 'avancons', 'avancez', 'avancent', 'avancait', 'avanca', 'avancant', 'avance', 'avancee'],
        reculer: ['reculer', 'recule', 'recules', 'reculons', 'reculez', 'reculent', 'reculait', 'recula', 'reculant', 'recule', 'reculee'],
        retomber: ['retomber', 'retombe', 'retombes', 'retombent', 'retomba', 'retombant', 'retombe', 'retombee'],
        atterrir: ['atterrir', 'atterrit', 'atterrissons', 'atterrissez', 'atterrissent', 'atterrissait', 'atterrissant', 'atterri', 'atterrie'],
        glisser: ['glisser', 'glisse', 'glisses', 'glissons', 'glissez', 'glissent', 'glissait', 'glissa', 'glissant', 'glisse', 'glissee'],
        deraper: ['deraper', 'derape', 'derapes', 'derapent', 'derapa', 'derapant', 'derape'],
        plonger: ['plonger', 'plonge', 'plonges', 'plongeons', 'plongez', 'plongent', 'plongeait', 'plongea', 'plongeant', 'plonge', 'plongee'],
        escalader: ['escalader', 'escalade', 'escalades', 'escaladent', 'escalada', 'escaladant', 'escalade'],
        grimper: ['grimper', 'grimpe', 'grimpes', 'grimpent', 'grimpa', 'grimpant', 'grimpe'],
        contourner: ['contourner', 'contourne', 'contournes', 'contournent', 'contourna', 'contournant', 'contourne'],
        deplacer: ['se deplacer', 'se deplace', 'se deplacent', 'se deplaca', 'se deplacant', 'deplace', 'deplacee'],
        decaler: ['se decaler', 'se decale', 'se decalent', 'se decala', 'se decalant', 'decale', 'decalee'],

        frapper: ['frapper', 'frappe', 'frappes', 'frappons', 'frappez', 'frappent', 'frappait', 'frappa', 'frappant', 'frappe', 'frappee'],
        attaquer: ['attaquer', 'attaque', 'attaques', 'attaquons', 'attaquez', 'attaquent', 'attaquait', 'attaqua', 'attaquant', 'attaque', 'attaquee'],
        assener: ['assener', 'assener', 'assene', 'assenent', 'assena', 'assenant', 'assene'],
        cogner: ['cogner', 'cogne', 'cognes', 'cognent', 'cogna', 'cognant', 'cogne'],
        envoyer: ['envoyer', 'envoie', 'envoies', 'envoyons', 'envoyez', 'envoient', 'envoyait', 'envoya', 'envoyant', 'envoye', 'envoyee'],
        decocher: ['decocher', 'decoche', 'decoches', 'decochent', 'decocha', 'decochant', 'decoche'],
        lancer: ['lancer', 'lance', 'lances', 'lancons', 'lancez', 'lancent', 'lancait', 'lanca', 'lancant', 'lance', 'lancee'],
        viser: ['viser', 'vise', 'vises', 'visent', 'visait', 'visa', 'visant', 'vise', 'visee'],
        transpercer: ['transpercer', 'transperce', 'transperces', 'transpercent', 'transperca', 'transpercant', 'transperce'],
        trancher: ['trancher', 'tranche', 'tranches', 'tranchent', 'trancha', 'tranchant', 'tranche', 'tranchee'],
        couper: ['couper', 'coupe', 'coupes', 'coupent', 'coupa', 'coupant', 'coupe', 'coupee'],
        mordre: ['mordre', 'mord', 'mordons', 'mordez', 'mordent', 'mordait', 'mordit', 'mordant', 'mordu', 'mordue'],
        griffer: ['griffer', 'griffe', 'griffes', 'griffent', 'griffa', 'griffant', 'griffe', 'griffee'],
        percuter: ['percuter', 'percute', 'percutes', 'percutent', 'percuta', 'percutant', 'percute', 'percutee'],

        parer: ['parer', 'pare', 'pares', 'parons', 'parez', 'parent', 'parait', 'para', 'parant', 'pare', 'paree'],
        bloquer: ['bloquer', 'bloque', 'bloques', 'bloquons', 'bloquez', 'bloquent', 'bloquait', 'bloqua', 'bloquant', 'bloque', 'bloquee'],
        devier: ['devier', 'devie', 'devies', 'devient', 'devia', 'deviant', 'devie', 'deviee'],
        contrer: ['contrer', 'contre', 'contres', 'controns', 'contrez', 'contrent', 'contrait', 'contra', 'contrant', 'contre', 'contree'],
        proteger: ['se proteger', 'se protege', 'se protegent', 'se protegea', 'se protegeant', 'protege', 'protegee'],
        couvrir: ['se couvrir', 'se couvre', 'se couvrent', 'se couvrit', 'se couvrant', 'couvert', 'couverte'],
        encaisser: ['encaisser', 'encaisse', 'encaisses', 'encaissent', 'encaissa', 'encaissant', 'encaisse', 'encaissee'],
        absorber: ['absorber', 'absorbe', 'absorbes', 'absorbent', 'absorba', 'absorbant', 'absorbe', 'absorbee'],
        repousser: ['repousser', 'repousse', 'repousses', 'repoussent', 'repoussa', 'repoussant', 'repousse', 'repoussee'],
        resister: ['resister', 'resiste', 'resistes', 'resistent', 'resista', 'resistant', 'resiste'],
        esquiver: ['esquiver', 'esquive', 'esquives', 'esquivons', 'esquivez', 'esquivent', 'esquivait', 'esquiva', 'esquivant', 'esquive', 'esquivee'],
        eviter: ['eviter', 'evite', 'evites', 'evitons', 'evitez', 'evitent', 'evitait', 'evita', 'evitant', 'evite', 'evitee'],

        saisir: ['saisir', 'saisit', 'saisissons', 'saisissez', 'saisissent', 'saisissait', 'saisissant', 'saisi', 'saisie'],
        agripper: ['agripper', 'agrippe', 'agrippes', 'agrippent', 'agrippa', 'agrippant', 'agrippe', 'agrippee'],
        attraper: ['attraper', 'attrape', 'attrapes', 'attrapent', 'attrapa', 'attrapant', 'attrape', 'attrapee'],
        empoigner: ['empoigner', 'empoigne', 'empoignes', 'empoignent', 'empoigna', 'empoignant', 'empoigne', 'empoignee'],
        accrocher: ['accrocher', 'accroche', 'accroches', 'accrochent', 'accrocha', 'accrochant', 'accroche', 'accrochee'],
        immobiliser: ['immobiliser', 'immobilise', 'immobilises', 'immobilisent', 'immobilisa', 'immobilisant', 'immobilise', 'immobilisee'],
        ceinturer: ['ceinturer', 'ceinture', 'ceintures', 'ceinturent', 'ceintura', 'ceinturant', 'ceinture', 'ceinturee'],
        maintenir: ['maintenir', 'maintient', 'maintenons', 'maintenez', 'maintiennent', 'maintenait', 'maintint', 'maintenant', 'maintenu', 'maintenue'],
        retenir: ['retenir', 'retient', 'retenons', 'retenez', 'retiennent', 'retenait', 'retint', 'retenant', 'retenu', 'retenue'],

        projeter: ['projeter', 'projette', 'projettes', 'projetons', 'projetez', 'projettent', 'projetait', 'projeta', 'projetant', 'projete', 'projetee'],
        balancer: ['balancer', 'balance', 'balances', 'balancons', 'balancez', 'balancent', 'balancait', 'balanca', 'balancant', 'balance', 'balancee'],
        jeter: ['jeter', 'jette', 'jettes', 'jetons', 'jetez', 'jettent', 'jetait', 'jeta', 'jetant', 'jete', 'jetee'],
        renverser: ['renverser', 'renverse', 'renverses', 'renversent', 'renversa', 'renversant', 'renverse', 'renversee'],
        plaquer: ['plaquer', 'plaque', 'plaques', 'plaquent', 'plaqua', 'plaquant', 'plaque', 'plaquee'],
        terrasser: ['terrasser', 'terrasse', 'terrasses', 'terrassent', 'terrassa', 'terrassant', 'terrasse', 'terrassee'],
        faucher: ['faucher', 'fauche', 'fauches', 'fauchent', 'faucha', 'fauchant', 'fauche', 'fauchee'],
        basculer: ['basculer', 'bascule', 'bascules', 'basculent', 'bascula', 'basculant', 'bascule', 'basculee'],

        ramasser: ['ramasser', 'ramasse', 'ramasses', 'ramassent', 'ramassa', 'ramassant', 'ramasse', 'ramassee'],
        utiliser: ['utiliser', 'utilise', 'utilises', 'utilisent', 'utilisa', 'utilisant', 'utilise', 'utilisee'],
        activer: ['activer', 'active', 'actives', 'activent', 'activa', 'activant', 'active', 'activee'],
        invoquer: ['invoquer', 'invoque', 'invoques', 'invoquent', 'invoqua', 'invoquant', 'invoque', 'invoquee'],
        degainer: ['degainer', 'degaine', 'degaines', 'degainent', 'degaina', 'degainant', 'degaine', 'degainee'],
        ranger: ['ranger', 'range', 'ranges', 'rangeons', 'rangez', 'rangent', 'rangeait', 'rangea', 'rangeant', 'range', 'rangee']
    }
};

// ---- Catégories de haut niveau, pour un accès rapide par grande famille -------------
const NEO_CATEGORIES = {
    deplacement: ['course', 'saut', 'bond', 'vol', 'marche', 'glissade', 'plongeon', 'escalade'],
    attaque: ['frappe', 'coup_de_poing', 'coup_de_pied', 'coup_de_tete', 'coup_de_coude', 'coup_de_genou'],
    defense: ['esquive', 'parade', 'contre', 'blocage'],
    saisie: ['saisie', 'immobilisation', 'desarmement'],
    projection: ['projection'],
    interaction: ['interaction']
};

/* ============================================================================
 * 5 bis. NEO_ACTIONS — LISTE PLATE DES VERBES/ACTIONS RECONNUS
 * ----------------------------------------------------------------------------
 * C'est la structure directement consultée par le moteur de parsing
 * (neoDetecterAction / neoDetecterActeur dans cmd/outils.js) pour repérer
 * l'action d'une phrase. Le moteur fait une correspondance EXACTE mot-entier
 * (regex sur le mot normalisé), SANS aucune racinisation : chaque forme
 * conjuguée utile doit donc apparaître littéralement dans "synonymes",
 * sinon elle ne sera jamais reconnue.
 *
 * Format attendu par le moteur pour chaque entrée (objet) :
 *   { action, nom, categorie, famille, synonymes: [...] }
 * ========================================================================== */

const NEO_ACTIONS = [

    // ---- déplacements --------------------------------------------------------
    { action: 'foncer', nom: 'foncer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.foncer },
    { action: 'precipiter', nom: 'se precipiter', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.precipiter },
    { action: 'charger', nom: 'charger', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.charger },
    { action: 'courir', nom: 'courir', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.courir },
    { action: 'sprinter', nom: 'sprinter', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.sprinter },
    { action: 'accourir', nom: 'accourir', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.accourir },
    { action: 'ruer', nom: 'se ruer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.ruer },
    { action: 'jeter_soi', nom: 'se jeter', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.jeter_soi },
    { action: 'filer', nom: 'filer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.filer },
    { action: 'elancer', nom: 's\'elancer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.elancer },
    { action: 'sauter', nom: 'sauter', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.sauter },
    { action: 'bondir', nom: 'bondir', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.bondir },
    { action: 'voler', nom: 'voler', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.voler },
    { action: 'envoler', nom: 's\'envoler', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.envoler },
    { action: 'planer', nom: 'planer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.planer },
    { action: 'marcher', nom: 'marcher', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.marcher },
    { action: 'avancer', nom: 'avancer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.avancer },
    { action: 'reculer', nom: 'reculer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.reculer },
    { action: 'retomber', nom: 'retomber', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.retomber },
    { action: 'atterrir', nom: 'atterrir', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.atterrir },
    { action: 'glisser', nom: 'glisser', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.glisser },
    { action: 'deraper', nom: 'deraper', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.deraper },
    { action: 'plonger', nom: 'plonger', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.plonger },
    { action: 'escalader', nom: 'escalader', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.escalader },
    { action: 'grimper', nom: 'grimper', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.grimper },
    { action: 'contourner', nom: 'contourner', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.contourner },
    { action: 'deplacer', nom: 'se deplacer', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.deplacer },
    { action: 'decaler', nom: 'se decaler', categorie: 'deplacement', famille: 'deplacement', synonymes: NEO_SYNONYMES.verbes.decaler },

    // ---- attaques génériques --------------------------------------------------
    { action: 'frapper', nom: 'frapper', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.frapper },
    { action: 'attaquer', nom: 'attaquer', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.attaquer },
    { action: 'assener', nom: 'assener', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.assener },
    { action: 'cogner', nom: 'cogner', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.cogner },
    { action: 'envoyer', nom: 'envoyer', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.envoyer },
    { action: 'decocher', nom: 'decocher', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.decocher },
    { action: 'lancer', nom: 'lancer', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.lancer },
    { action: 'viser', nom: 'viser', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.viser },
    { action: 'transpercer', nom: 'transpercer', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.transpercer },
    { action: 'trancher', nom: 'trancher', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.trancher },
    { action: 'couper', nom: 'couper', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.couper },
    { action: 'mordre', nom: 'mordre', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.mordre },
    { action: 'griffer', nom: 'griffer', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.griffer },
    { action: 'percuter', nom: 'percuter', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.verbes.percuter },

    // ---- attaques de poing (concepts, phrasés nominaux) ------------------------
    { action: 'direct', nom: 'direct', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.direct },
    { action: 'crochet_gauche', nom: 'crochet gauche', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.crochet_gauche },
    { action: 'crochet_droit', nom: 'crochet droit', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.crochet_droit },
    { action: 'uppercut', nom: 'uppercut', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.uppercut },
    { action: 'uppercut_saute', nom: 'uppercut saute', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.uppercut_saute },
    { action: 'revers', nom: 'revers', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.revers },
    { action: 'revers_circulaire', nom: 'revers circulaire', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.revers_circulaire },
    { action: 'marteau_descendant', nom: 'marteau descendant', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.marteau_descendant },
    { action: 'marteau_lateral', nom: 'marteau lateral', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.marteau_lateral },
    { action: 'marteau_revers', nom: 'marteau revers', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaques.marteau_revers },

    // ---- attaques de pied (concepts, phrasés nominaux) -------------------------
    { action: 'coup_pied_direct', nom: 'coup de pied direct', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_direct },
    { action: 'coup_pied_circulaire', nom: 'coup de pied circulaire', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_circulaire },
    { action: 'coup_pied_lateral', nom: 'coup de pied lateral', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_lateral },
    { action: 'coup_pied_arriere', nom: 'coup de pied arriere', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_arriere },
    { action: 'coup_pied_haut', nom: 'coup de pied haut', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_haut },
    { action: 'coup_pied_descendant', nom: 'coup de pied descendant', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_descendant },
    { action: 'coup_pied_retourne', nom: 'coup de pied retourne', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_retourne },
    { action: 'coup_pied_saute', nom: 'coup de pied saute', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_saute },
    { action: 'coup_pied_croise', nom: 'coup de pied croise', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_croise },
    { action: 'coup_pied_talon', nom: 'coup de pied talon', categorie: 'attaque', famille: 'attaque', synonymes: NEO_SYNONYMES.attaquesPied.coup_pied_talon },

    // ---- défenses --------------------------------------------------------------
    { action: 'parer', nom: 'parer', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.parer },
    { action: 'bloquer', nom: 'bloquer', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.bloquer },
    { action: 'devier', nom: 'devier', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.devier },
    { action: 'contrer', nom: 'contrer', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.contrer },
    { action: 'proteger', nom: 'se proteger', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.proteger },
    { action: 'couvrir', nom: 'se couvrir', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.couvrir },
    { action: 'encaisser', nom: 'encaisser', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.encaisser },
    { action: 'absorber', nom: 'absorber', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.absorber },
    { action: 'repousser', nom: 'repousser', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.repousser },
    { action: 'resister', nom: 'resister', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.resister },
    { action: 'esquiver', nom: 'esquiver', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.esquiver },
    { action: 'eviter', nom: 'eviter', categorie: 'defense', famille: 'defense', synonymes: NEO_SYNONYMES.verbes.eviter },

    // ---- saisies -----------------------------------------------------------------
    { action: 'saisir', nom: 'saisir', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.saisir },
    { action: 'agripper', nom: 'agripper', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.agripper },
    { action: 'attraper', nom: 'attraper', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.attraper },
    { action: 'empoigner', nom: 'empoigner', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.empoigner },
    { action: 'accrocher', nom: 'accrocher', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.accrocher },
    { action: 'immobiliser', nom: 'immobiliser', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.immobiliser },
    { action: 'ceinturer', nom: 'ceinturer', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.ceinturer },
    { action: 'maintenir', nom: 'maintenir', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.maintenir },
    { action: 'retenir', nom: 'retenir', categorie: 'saisie', famille: 'saisie', synonymes: NEO_SYNONYMES.verbes.retenir },

    // ---- projections ---------------------------------------------------------------
    { action: 'projeter', nom: 'projeter', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.projeter },
    { action: 'balancer', nom: 'balancer', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.balancer },
    { action: 'jeter', nom: 'jeter', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.jeter },
    { action: 'renverser', nom: 'renverser', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.renverser },
    { action: 'plaquer', nom: 'plaquer', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.plaquer },
    { action: 'terrasser', nom: 'terrasser', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.terrasser },
    { action: 'faucher', nom: 'faucher', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.faucher },
    { action: 'basculer', nom: 'basculer', categorie: 'projection', famille: 'projection', synonymes: NEO_SYNONYMES.verbes.basculer },

    // ---- interactions ---------------------------------------------------------------
    { action: 'ramasser', nom: 'ramasser', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.ramasser },
    { action: 'utiliser', nom: 'utiliser', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.utiliser },
    { action: 'activer', nom: 'activer', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.activer },
    { action: 'invoquer', nom: 'invoquer', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.invoquer },
    { action: 'degainer', nom: 'degainer', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.degainer },
    { action: 'ranger', nom: 'ranger', categorie: 'interaction', famille: 'interaction', synonymes: NEO_SYNONYMES.verbes.ranger }
];

/* ============================================================================
 * 6. PARAMETRES (regroupement pour export direct)
 * ========================================================================== */

const NEO_PARAMETRES = {
    direction: NEO_DIRECTIONS,
    trajectoire: NEO_TRAJECTOIRES,
    distance: NEO_DISTANCES,
    hauteur: NEO_HAUTEURS,
    vitesse: NEO_VITESSES,
    intensite: NEO_INTENSITES,
    intention: NEO_INTENTIONS,
    position: NEO_POSITIONS,
    combat: NEO_PARAMETRES_COMBAT
};

/* ============================================================================
 * 7. RELATIONS SEMANTIQUES
 * ========================================================================== */

// Décrit, pour chaque grande famille d'action, quels champs sémantiques
// peuvent lui être rattachés. Sert de guide au moteur de parsing, PAS de
// logique d'extraction.
const NEO_RELATIONS = {
    // règle absolue : SUJET = celui qui réalise l'action ; CIBLE = celui/ce
    // qui reçoit/subit l'action. Ces deux rôles sont toujours indépendants.
    reglesRoles: {
        sujet: 'entite_qui_realise_action',
        cible: 'entite_qui_subit_action',
        independance: true
    },

    action: [
        'SUJET',
        'CIBLE',
        'DIRECTION',
        'TRAJECTOIRE',
        'DISTANCE',
        'HAUTEUR',
        'VITESSE',
        'PARTIE_CORPS',
        'COTE_CORPS',
        'ZONE',
        'INTENTION',
        'INTENSITE'
    ],

    // Relations fines par type de champ (utile pour valider une extraction)
    sujet_action: ['sujet', 'action'],
    action_cible: ['action', 'cible'],
    action_partie_corps: ['action', 'partie_corps', 'cote_corps'],
    action_direction: ['action', 'direction'],
    action_trajectoire: ['action', 'trajectoire'],
    action_parametres: ['action', 'distance', 'hauteur', 'vitesse', 'intensite', 'intention'],

    // Contraintes explicites d'indépendance entre champs proches
    contraintes: [
        { champ_a: 'direction', champ_b: 'trajectoire', regle: 'toujours_distincts' },
        { champ_a: 'cote_corps', champ_b: 'direction', regle: 'toujours_distincts' },
        { champ_a: 'partie_corps', champ_b: 'direction', regle: 'jamais_deduire_direction_depuis_partie_corps' }
    ]
};


//==============================================================
// 🎮 NEO ACTION MODELS
//==============================================================
// Chaque action possède ses propres paramètres.
// SUJET  = personnage qui exécute l'action
// CIBLE  = personnage visé / concerné par l'action
//
// Les champs de "structure" sont OBLIGATOIRES.
// Les champs de "optionnels" sont facultatifs.
//==============================================================
 const NEO_ACTION_MODELS = {

    deplacement: {

        // ==========================================================
        // MARCHE
        // ==========================================================

        marche: {
            categorie: "deplacement",
            id: "MARCHE",

            concept:
                "Déplacement volontaire d'un sujet à pied, généralement à vitesse normale ou modérée.",

            manieres: {

                normale: {
                    concept:
                        "Déplacement au sol effectué à pied avec une progression régulière.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} marche vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} avance à pied vers {Cible} sur {Distance} pour se rapprocher",
                        "{Sujet} se déplace au pas vers {Cible} sur {Distance} pour arriver à proximité",
                        "{Sujet} progresse tranquillement vers {Cible} sur {Distance} pour rejoindre sa position",
                        "{Sujet} avance lentement vers {Cible} sur {Distance} pour le rejoindre",
                        "{Sujet} marche directement en direction de {Cible} sur {Distance}",
                        "{Sujet} se dirige à pied vers {Cible} pour réduire la distance",
                        "{Sujet} progresse à pied jusqu'à {Cible} sur {Distance}",
                        "{Sujet} avance normalement vers {Cible} pour se rapprocher de lui",
                        "{Sujet} marche calmement en direction de {Cible} sur {Distance}",
                        "{Sujet} se rend à pied vers {Cible} pour atteindre sa position",
                        "{Sujet} avance progressivement vers {Cible} sur {Distance}",
                        "{Sujet} se rapproche de {Cible} en marchant sur {Distance}",
                        "{Sujet} progresse au pas en direction de {Cible} pour le rejoindre",
                        "{Sujet} marche droit vers {Cible} sur {Distance}",
                        "{Sujet} avance tranquillement en direction de {Cible}",
                        "{Sujet} se déplace à pied jusqu'à la position de {Cible}",
                        "{Sujet} continue son avancée à pied vers {Cible} sur {Distance}",
                        "{Sujet} parcourt {Distance} en marchant vers {Cible}",
                        "{Sujet} avance au pas pour parvenir jusqu'à {Cible} sur {Distance}"
                    ]
                }
            }
        },


        // ==========================================================
        // COURSE
        // ==========================================================

        course: {
            categorie: "deplacement",
            id: "COURSE",

            concept:
                "Déplacement volontaire rapide d'un sujet par la course afin de progresser vers une position, une cible ou un objectif.",

            manieres: {

                // --------------------------------------------------
                // COURSE FRONTALE
                // --------------------------------------------------

                frontale: {
                    concept:
                        "Course effectuée selon une progression directe et principalement linéaire vers l'avant ou vers une cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                        "{Sujet} court en course frontale vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} fonce frontalement vers {Cible} à {Vitesse} sur {Distance} pour arriver au contact",
                        "{Sujet} se rue droit vers {Cible} sur {Distance} pour le rejoindre",
                        "{Sujet} s'élance directement vers {Cible} à {Vitesse} pour atteindre sa position",
                        "{Sujet} file droit vers {Cible} sur {Distance} pour arriver jusqu'à lui",
                        "{Sujet} court droit devant lui en direction de {Cible} sur {Distance}",
                        "{Sujet} fonce tout droit vers {Cible} à {Vitesse}",
                        "{Sujet} sprinte directement vers {Cible} sur {Distance} pour le rejoindre",
                        "{Sujet} se précipite en ligne droite vers {Cible} à {Vitesse}",
                        "{Sujet} charge droit vers {Cible} sur {Distance} pour arriver au contact",
                        "{Sujet} court directement en direction de {Cible} à {Vitesse}",
                        "{Sujet} s'élance en ligne droite vers {Cible} sur {Distance}",
                        "{Sujet} accélère en courant droit vers {Cible} pour atteindre sa position",
                        "{Sujet} avance rapidement en ligne droite vers {Cible} sur {Distance}",
                        "{Sujet} fonce droit devant vers {Cible} à {Vitesse} pour réduire la distance",
                        "{Sujet} court sans dévier vers {Cible} sur {Distance}",
                        "{Sujet} se rue en ligne droite sur {Cible} à {Vitesse}",
                        "{Sujet} sprinte droit vers {Cible} pour parvenir jusqu'à lui",
                        "{Sujet} part en course directe vers {Cible} sur {Distance}",
                        "{Sujet} effectue une course en ligne droite vers {Cible} à {Vitesse} pour l'atteindre"
                    ]
                },


                // --------------------------------------------------
                // COURSE CIRCULAIRE
                // --------------------------------------------------

                circulaire: {
                    concept:
                        "Course effectuée autour d'une cible ou selon une trajectoire courbe. Le côté indique vers quel côté le sujet se déplace autour de la cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE",
                        "COURBE"
                    ],

                    exemples: [
                        "{Sujet} court autour de {Cible} par sa gauche avec une courbe de {Courbe} pour se placer derrière lui",
                        "{Sujet} court autour de {Cible} par sa droite avec une courbe de {Courbe} pour le contourner",
                        "{Sujet} contourne {Cible} en courant sur sa gauche pour atteindre sa position",
                        "{Sujet} fonce autour de {Cible} par sa droite pour se positionner derrière lui",
                        "{Sujet} effectue une course circulaire autour de {Cible} vers sa gauche pour changer de position",
                        "{Sujet} court en cercle autour de {Cible} par la gauche sur {Distance}",
                        "{Sujet} tourne autour de {Cible} en courant vers sa droite",
                        "{Sujet} contourne {Cible} par la droite à {Vitesse} pour passer derrière lui",
                        "{Sujet} contourne {Cible} par la gauche en courant sur {Distance}",
                        "{Sujet} court autour de {Cible} dans un mouvement circulaire vers sa droite",
                        "{Sujet} se déplace en cercle autour de {Cible} par sa gauche pour le contourner",
                        "{Sujet} fonce en arc de cercle autour de {Cible} vers sa droite",
                        "{Sujet} court en décrivant une courbe autour de {Cible} par la gauche",
                        "{Sujet} effectue une course courbe autour de {Cible} vers sa droite",
                        "{Sujet} tourne autour de {Cible} en courant par son côté gauche",
                        "{Sujet} se rue autour de {Cible} par la droite pour atteindre son dos",
                        "{Sujet} court en rotation autour de {Cible} vers sa gauche sur {Distance}",
                        "{Sujet} effectue un déplacement circulaire en courant autour de {Cible}",
                        "{Sujet} court autour de {Cible} en décrivant une trajectoire courbe vers la droite",
                        "{Sujet} contourne rapidement {Cible} en courant par sa gauche pour changer de position"
                    ]
                },


                // --------------------------------------------------
                // COURSE DIAGONALE
                // --------------------------------------------------

                diagonale: {
                    concept:
                        "Course effectuée selon une trajectoire oblique vers une cible ou une position. Le côté indique si le sujet se déplace en diagonale vers sa gauche ou vers sa droite.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                        "{Sujet} court en diagonale sur sa gauche vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} court en diagonale sur sa droite vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} fonce diagonalement vers sa gauche en direction de {Cible} à {Vitesse}",
                        "{Sujet} se rue en diagonale sur sa droite vers {Cible} pour le rejoindre",
                        "{Sujet} s'élance en diagonale vers sa gauche à {Vitesse} pour atteindre {Cible}",
                        "{Sujet} court obliquement vers la gauche en direction de {Cible}",
                        "{Sujet} court obliquement vers la droite sur {Distance} pour rejoindre {Cible}",
                        "{Sujet} fonce en diagonale à gauche vers {Cible} à {Vitesse}",
                        "{Sujet} fonce en diagonale à droite vers {Cible} sur {Distance}",
                        "{Sujet} avance en biais vers sa gauche pour atteindre {Cible}",
                        "{Sujet} avance en biais vers sa droite à {Vitesse} vers {Cible}",
                        "{Sujet} se déplace en diagonale gauche vers {Cible} sur {Distance}",
                        "{Sujet} se déplace en diagonale droite vers {Cible} à {Vitesse}",
                        "{Sujet} part en course oblique vers sa gauche pour rejoindre {Cible}",
                        "{Sujet} part en course oblique vers sa droite pour atteindre {Cible}",
                        "{Sujet} coupe en diagonale vers la gauche en direction de {Cible}",
                        "{Sujet} coupe en diagonale vers la droite pour rejoindre {Cible}",
                        "{Sujet} se rue en biais vers sa gauche à {Vitesse}",
                        "{Sujet} se rue en biais vers sa droite sur {Distance}",
                        "{Sujet} effectue une course diagonale vers sa gauche à {Vitesse} pour atteindre {Cible}"
                    ]
                },


                // --------------------------------------------------
                // COURSE ZIGZAG
                // --------------------------------------------------

                zig_zag: {
                    concept:
                        "Course durant laquelle le sujet alterne successivement ses déplacements vers la gauche et vers la droite tout en progressant vers son objectif.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                        "{Sujet} court en zigzag vers {Cible} sur {Distance} pour éviter ses attaques et l'atteindre",
                        "{Sujet} fonce en zigzag vers {Cible} à {Vitesse} sur {Distance} pour arriver au contact",
                        "{Sujet} se rue vers {Cible} en zigzag sur {Distance} pour éviter ses attaques et le rejoindre",
                        "{Sujet} serpente rapidement vers {Cible} à {Vitesse} pour parvenir jusqu'à lui",
                        "{Sujet} avance en alternant ses déplacements de gauche à droite vers {Cible} pour l'atteindre",
                        "{Sujet} court en zigzag vers {Cible} pour réduire la distance",
                        "{Sujet} fonce en alternant gauche et droite vers {Cible}",
                        "{Sujet} se déplace en zigzag à {Vitesse} en direction de {Cible}",
                        "{Sujet} court en changeant constamment de côté vers {Cible}",
                        "{Sujet} serpente en courant vers {Cible} sur {Distance}",
                        "{Sujet} avance en zigzag jusqu'à {Cible} à {Vitesse}",
                        "{Sujet} se rue vers {Cible} en alternant ses déplacements latéraux",
                        "{Sujet} court en faisant des écarts successifs vers {Cible}",
                        "{Sujet} fonce vers {Cible} en alternant gauche et droite sur {Distance}",
                        "{Sujet} progresse en zigzag à grande vitesse vers {Cible}",
                        "{Sujet} court en serpentant de gauche à droite vers {Cible}",
                        "{Sujet} effectue une course sinueuse vers {Cible} pour éviter ses attaques",
                        "{Sujet} avance rapidement en zigzag sur {Distance} pour rejoindre {Cible}",
                        "{Sujet} se précipite vers {Cible} en changeant alternativement de direction",
                        "{Sujet} court vers {Cible} en effectuant des changements de direction successifs"
                    ]
                },


                // --------------------------------------------------
                // COURSE LATERALE
                // --------------------------------------------------

                laterale: {
                    concept:
                        "Course effectuée principalement vers un côté par rapport à l'orientation actuelle du sujet. Le côté indique obligatoirement la direction latérale du déplacement.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                        "{Sujet} court latéralement sur sa gauche sur {Distance}",
                        "{Sujet} court latéralement sur sa droite sur {Distance}",
                        "{Sujet} se déplace rapidement vers sa gauche pour atteindre {Cible}",
                        "{Sujet} fonce sur le côté droit vers {Cible} à {Vitesse}",
                        "{Sujet} se rue latéralement sur sa gauche pour esquiver {Cible}",
                        "{Sujet} court vers son côté gauche sur {Distance}",
                        "{Sujet} court vers son côté droit sur {Distance}",
                        "{Sujet} se déplace latéralement vers la gauche à {Vitesse}",
                        "{Sujet} se déplace latéralement vers la droite à {Vitesse}",
                        "{Sujet} fonce sur sa gauche pour changer de position",
                        "{Sujet} fonce sur sa droite pour rejoindre {Cible}",
                        "{Sujet} sprinte latéralement vers sa gauche sur {Distance}",
                        "{Sujet} sprinte latéralement vers sa droite sur {Distance}",
                        "{Sujet} part en course vers son côté gauche à {Vitesse}",
                        "{Sujet} part en course vers son côté droit à {Vitesse}",
                        "{Sujet} se rue sur le côté gauche pour éviter {Cible}",
                        "{Sujet} se rue sur le côté droit pour atteindre {Cible}",
                        "{Sujet} court parallèlement vers sa gauche en direction de {Cible}",
                        "{Sujet} court parallèlement vers sa droite pour se repositionner",
                        "{Sujet} effectue une course latérale vers sa gauche à {Vitesse} sur {Distance}"
                    ]
                }
            }
        },


        // ==========================================================
        // DASH
        // ==========================================================

        dash: {
            categorie: "deplacement",
            id: "DASH",

            concept:
                "Déplacement extrêmement rapide et bref permettant au sujet de parcourir instantanément ou presque une courte distance.",

            manieres: {

                rapide: {
                    concept:
                        "Accélération brutale produisant un déplacement très rapide sur une courte distance.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DISTANCE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    contraintes: {
                        distance_max: 5,
                        unite: "m"
                    },

                    exemples: [
                        "{Sujet} effectue un dash de {Distance} vers {Cible} pour l'atteindre",
                        "{Sujet} dash rapidement sur {Distance} vers {Cible} pour se rapprocher",
                        "{Sujet} accélère brutalement sur {Distance} vers l'avant pour atteindre {Cible}",
                        "{Sujet} réalise une accélération instantanée de {Distance} pour rejoindre {Cible}",
                        "{Sujet} bondit rapidement sur {Distance} vers {Cible} pour arriver au contact",
                        "{Sujet} effectue une accélération fulgurante vers {Cible} sur {Distance}",
                        "{Sujet} jaillit brusquement vers {Cible} pour réduire la distance",
                        "{Sujet} propulse son corps sur {Distance} en direction de {Cible}",
                        "{Sujet} part en dash vers {Cible} à toute vitesse",
                        "{Sujet} accélère soudainement vers {Cible} sur {Distance}",
                        "{Sujet} fonce instantanément vers {Cible} sur une courte distance",
                        "{Sujet} effectue une poussée rapide vers l'avant sur {Distance}",
                        "{Sujet} se projette brutalement vers {Cible} pour arriver au contact",
                        "{Sujet} traverse rapidement {Distance} en direction de {Cible}",
                        "{Sujet} réalise une accélération explosive vers {Cible}",
                        "{Sujet} démarre brusquement et parcourt {Distance} vers {Cible}",
                        "{Sujet} jaillit en avant sur {Distance} pour atteindre {Cible}",
                        "{Sujet} se propulse rapidement vers {Cible} sur {Distance}",
                        "{Sujet} effectue une accélération soudaine pour rejoindre {Cible}",
                        "{Sujet} bondit en avant sur {Distance} pour réduire l'écart avec {Cible}"
                    ]
                }
            }
        },


        // ==========================================================
        // RUSH
        // ==========================================================

        rush: {
            categorie: "deplacement",
            id: "RUSH",

            concept:
                "Déplacement offensif ou agressif rapide vers une cible afin de réduire rapidement la distance qui les sépare.",

            manieres: {

                directe: {
                    concept:
                        "Progression rapide et agressive directement vers une cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "CIBLE",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} rush vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} fonce rapidement sur {Cible} pour arriver au contact",
                        "{Sujet} se rue brutalement vers {Cible} pour réduire la distance",
                        "{Sujet} se précipite sur {Cible} à grande vitesse pour l'atteindre",
                        "{Sujet} charge vers {Cible} pour parvenir immédiatement au contact",
                        "{Sujet} se jette rapidement vers {Cible} pour l'atteindre",
                        "{Sujet} fonce agressivement sur {Cible} pour réduire l'écart",
                        "{Sujet} se précipite droit sur {Cible} pour arriver jusqu'à lui",
                        "{Sujet} charge directement {Cible} pour entrer au contact",
                        "{Sujet} se rue à toute vitesse vers {Cible}",
                        "{Sujet} attaque la distance en fonçant vers {Cible}",
                        "{Sujet} part brutalement à l'assaut de {Cible}",
                        "{Sujet} s'élance avec force vers {Cible} pour le rejoindre",
                        "{Sujet} fonce sur {Cible} sans ralentir pour arriver au contact",
                        "{Sujet} se précipite droit vers {Cible} pour réduire la distance",
                        "{Sujet} charge rapidement en direction de {Cible}",
                        "{Sujet} se rue directement sur {Cible} à grande vitesse",
                        "{Sujet} accélère agressivement vers {Cible} pour parvenir au contact",
                        "{Sujet} se lance à pleine vitesse vers {Cible} pour l'atteindre",
                        "{Sujet} effectue une charge rapide vers {Cible} pour réduire l'écart"
                    ]
                }
            }
        },


        // ==========================================================
        // SAUT
        // ==========================================================

        saut: {
            categorie: "deplacement",
            id: "SAUT",

            concept:
                "Déplacement durant lequel le sujet quitte temporairement le sol grâce à une impulsion verticale ou orientée.",

            manieres: {

                avant: {
                    concept:
                        "Saut orienté vers l'avant permettant de progresser dans cette direction pendant la phase aérienne.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "HAUTEUR",
                        "TRAJECTOIRE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} saute vers l'avant à {Hauteur} de hauteur pour atteindre {Cible}",
                        "{Sujet} bondit vers {Cible} en trajectoire ascendante à {Hauteur} pour l'atteindre",
                        "{Sujet} quitte le sol en sautant vers l'avant pour rejoindre {Cible}",
                        "{Sujet} s'élève dans les airs vers l'avant à {Hauteur} pour parvenir jusqu'à {Cible}",
                        "{Sujet} bondit en avant pour atteindre {Cible}",
                        "{Sujet} saute directement vers {Cible} à {Hauteur}",
                        "{Sujet} se projette dans les airs vers l'avant pour rejoindre {Cible}",
                        "{Sujet} prend son impulsion et saute vers {Cible}",
                        "{Sujet} effectue un bond vers l'avant à {Hauteur} pour atteindre {Cible}",
                        "{Sujet} s'élance dans les airs en direction de {Cible}",
                        "{Sujet} bondit vers l'avant pour se rapprocher de {Cible}",
                        "{Sujet} saute en avant en direction de {Cible} à {Hauteur}",
                        "{Sujet} quitte le sol et progresse vers {Cible} pendant son saut",
                        "{Sujet} se propulse vers l'avant dans les airs pour atteindre {Cible}",
                        "{Sujet} réalise un saut orienté vers {Cible}",
                        "{Sujet} effectue un bond aérien vers l'avant pour rejoindre {Cible}",
                        "{Sujet} saute en direction de {Cible} avec une trajectoire ascendante",
                        "{Sujet} s'élève puis avance vers {Cible} à {Hauteur}",
                        "{Sujet} bondit vers l'avant sur sa trajectoire pour atteindre {Cible}",
                        "{Sujet} prend de l'élan et saute vers {Cible} pour le rejoindre"
                    ]
                },


                arriere: {
                    concept:
                        "Saut orienté vers l'arrière permettant au sujet de s'éloigner ou de se repositionner.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "HAUTEUR",
                        "TRAJECTOIRE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} saute vers l'arrière à {Hauteur} pour s'éloigner de {Cible}",
                        "{Sujet} bondit en arrière pour éviter {Cible} et se repositionner",
                        "{Sujet} quitte le sol en reculant dans les airs pour esquiver {Cible}",
                        "{Sujet} saute en arrière pour prendre de la distance avec {Cible}",
                        "{Sujet} se projette dans les airs vers l'arrière pour s'éloigner",
                        "{Sujet} bondit vers l'arrière à {Hauteur} pour éviter {Cible}",
                        "{Sujet} recule en sautant pour sortir de portée de {Cible}",
                        "{Sujet} effectue un saut arrière pour se repositionner",
                        "{Sujet} saute directement en arrière pour éviter l'attaque de {Cible}",
                        "{Sujet} se propulse vers l'arrière dans les airs",
                        "{Sujet} bondit en arrière afin de créer de la distance",
                        "{Sujet} prend appui et saute vers l'arrière pour s'éloigner de {Cible}",
                        "{Sujet} quitte le sol en reculant vers l'arrière",
                        "{Sujet} effectue un bond arrière pour éviter {Cible}",
                        "{Sujet} saute en direction opposée à {Cible}",
                        "{Sujet} s'élève puis recule dans les airs pour se repositionner",
                        "{Sujet} bondit en arrière pour sortir de la portée de {Cible}",
                        "{Sujet} réalise un saut arrière à {Hauteur} pour esquiver",
                        "{Sujet} se déplace vers l'arrière par un saut pour prendre de la distance",
                        "{Sujet} effectue un saut de recul pour s'éloigner de {Cible}"
                    ]
                },


                vertical: {
                    concept:
                        "Saut principalement orienté vers le haut avec une progression horizontale minimale.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} saute verticalement à {Hauteur} pour éviter {Cible}",
                        "{Sujet} bondit directement vers le haut pour prendre de la hauteur",
                        "{Sujet} s'élève verticalement à {Hauteur} pour se repositionner",
                        "{Sujet} saute droit vers le ciel à {Hauteur}",
                        "{Sujet} bondit sur place pour prendre de la hauteur",
                        "{Sujet} se propulse verticalement dans les airs",
                        "{Sujet} quitte le sol en montant directement vers le haut",
                        "{Sujet} effectue un saut vertical pour éviter {Cible}",
                        "{Sujet} bondit directement vers le ciel pour s'élever",
                        "{Sujet} saute à la verticale jusqu'à {Hauteur}",
                        "{Sujet} prend de la hauteur avec un saut vertical",
                        "{Sujet} s'élève brusquement dans une trajectoire verticale",
                        "{Sujet} effectue un bond droit vers le haut",
                        "{Sujet} saute verticalement pour se repositionner",
                        "{Sujet} se projette directement vers le haut à {Hauteur}",
                        "{Sujet} monte dans les airs par une impulsion verticale",
                        "{Sujet} bondit sur place afin d'éviter {Cible}",
                        "{Sujet} effectue une impulsion verticale pour gagner de la hauteur",
                        "{Sujet} saute directement au-dessus de sa position actuelle",
                        "{Sujet} s'élève à la verticale pour prendre de la hauteur"
                    ]
                },


                laterale: {
                    concept:
                        "Saut effectué vers un côté. Le côté indique obligatoirement la direction latérale du déplacement.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} saute latéralement sur sa gauche pour éviter {Cible}",
                        "{Sujet} bondit sur sa droite pour esquiver {Cible}",
                        "{Sujet} saute vers son côté gauche pour se repositionner",
                        "{Sujet} effectue un saut latéral vers sa droite pour atteindre sa position",
                        "{Sujet} bondit vers la gauche à {Hauteur} pour éviter {Cible}",
                        "{Sujet} bondit vers la droite à {Hauteur} pour esquiver {Cible}",
                        "{Sujet} se projette dans les airs vers sa gauche",
                        "{Sujet} se projette latéralement vers sa droite",
                        "{Sujet} saute sur le côté gauche pour éviter l'attaque",
                        "{Sujet} saute sur le côté droit pour changer de position",
                        "{Sujet} effectue un bond latéral vers sa gauche",
                        "{Sujet} effectue un bond latéral vers sa droite",
                        "{Sujet} quitte le sol en se déplaçant vers sa gauche",
                        "{Sujet} quitte le sol en se déplaçant vers sa droite",
                        "{Sujet} bondit de côté vers la gauche pour se repositionner",
                        "{Sujet} bondit de côté vers la droite pour se repositionner",
                        "{Sujet} saute vers sa gauche à {Hauteur} pour éviter {Cible}",
                        "{Sujet} saute vers sa droite à {Hauteur} pour atteindre sa position",
                        "{Sujet} réalise un saut latéral gauche pour esquiver",
                        "{Sujet} réalise un saut latéral droit pour esquiver"
                    ]
                }
            }
        },


        // ==========================================================
        // ROULADE
        // ==========================================================

        roulade: {
            categorie: "deplacement",
            id: "ROULADE",

            concept:
                "Déplacement au sol réalisé par rotation du corps autour de lui-même.",

            manieres: {

                avant: {
                    concept:
                        "Roulade au sol orientée vers l'avant.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} effectue une roulade vers l'avant sur {Distance} pour se rapprocher de {Cible}",
                        "{Sujet} roule au sol vers l'avant sur {Distance} pour éviter {Cible}",
                        "{Sujet} fait une roulade avant pour esquiver l'attaque de {Cible}",
                        "{Sujet} roule vers l'avant pour se rapprocher de {Cible}",
                        "{Sujet} effectue une roulade frontale sur {Distance}",
                        "{Sujet} se met à rouler vers l'avant pour éviter {Cible}",
                        "{Sujet} plonge dans une roulade vers l'avant",
                        "{Sujet} se propulse au sol en roulade avant vers {Cible}",
                        "{Sujet} effectue un roulement vers l'avant pour avancer",
                        "{Sujet} roule rapidement vers l'avant sur {Distance}",
                        "{Sujet} réalise une roulade avant pour franchir la distance",
                        "{Sujet} s'engage dans une roulade vers l'avant pour atteindre {Cible}",
                        "{Sujet} avance au sol en effectuant une roulade avant",
                        "{Sujet} roule en avant afin de se rapprocher de {Cible}",
                        "{Sujet} effectue plusieurs rotations au sol vers l'avant",
                        "{Sujet} fait une roulade frontale pour esquiver {Cible}",
                        "{Sujet} se déplace au sol par une roulade vers l'avant",
                        "{Sujet} roule droit vers l'avant sur {Distance}",
                        "{Sujet} effectue une roulade avant pour changer de position",
                        "{Sujet} utilise une roulade vers l'avant pour rejoindre {Cible}"
                    ]
                },


                arriere: {
                    concept:
                        "Roulade au sol orientée vers l'arrière.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} effectue une roulade arrière sur {Distance} pour s'éloigner de {Cible}",
                        "{Sujet} roule vers l'arrière pour éviter l'attaque de {Cible}",
                        "{Sujet} fait une roulade arrière pour se repositionner",
                        "{Sujet} roule au sol vers l'arrière sur {Distance}",
                        "{Sujet} effectue un roulement arrière pour prendre de la distance",
                        "{Sujet} se laisse rouler vers l'arrière pour éviter {Cible}",
                        "{Sujet} part en roulade arrière pour s'éloigner",
                        "{Sujet} réalise une roulade vers l'arrière afin de sortir de portée",
                        "{Sujet} roule rapidement en arrière sur {Distance}",
                        "{Sujet} effectue une roulade arrière pour esquiver",
                        "{Sujet} se déplace au sol en roulant vers l'arrière",
                        "{Sujet} recule en effectuant une roulade",
                        "{Sujet} fait un roulement arrière pour se repositionner",
                        "{Sujet} roule en arrière pour créer de la distance avec {Cible}",
                        "{Sujet} effectue une roulade arrière afin d'éviter {Cible}",
                        "{Sujet} plonge dans une roulade vers l'arrière",
                        "{Sujet} se propulse au sol en arrière par une roulade",
                        "{Sujet} roule droit vers l'arrière sur {Distance}",
                        "{Sujet} utilise une roulade arrière pour s'éloigner de {Cible}",
                        "{Sujet} effectue une rotation au sol vers l'arrière pour changer de position"
                    ]
                },


                laterale: {
                    concept:
                        "Roulade au sol effectuée latéralement. Le côté indique obligatoirement vers lequel le sujet roule.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} effectue une roulade latérale sur sa gauche sur {Distance} pour esquiver {Cible}",
                        "{Sujet} effectue une roulade latérale sur sa droite sur {Distance} pour esquiver {Cible}",
                        "{Sujet} roule au sol vers sa gauche pour éviter l'attaque",
                        "{Sujet} réalise une roulade sur son côté droit pour se repositionner",
                        "{Sujet} roule latéralement vers sa gauche pour éviter {Cible}",
                        "{Sujet} roule latéralement vers sa droite pour éviter {Cible}",
                        "{Sujet} effectue une roulade sur sa gauche sur {Distance}",
                        "{Sujet} effectue une roulade sur sa droite sur {Distance}",
                        "{Sujet} se laisse rouler vers son côté gauche",
                        "{Sujet} se laisse rouler vers son côté droit",
                        "{Sujet} part en roulade latérale à gauche pour esquiver",
                        "{Sujet} part en roulade latérale à droite pour esquiver",
                        "{Sujet} se déplace au sol par une roulade vers sa gauche",
                        "{Sujet} se déplace au sol par une roulade vers sa droite",
                        "{Sujet} roule de côté vers la gauche pour se repositionner",
                        "{Sujet} roule de côté vers la droite pour se repositionner",
                        "{Sujet} effectue un roulement latéral gauche pour éviter {Cible}",
                        "{Sujet} effectue un roulement latéral droit pour éviter {Cible}",
                        "{Sujet} réalise une roulade vers son flanc gauche sur {Distance}",
                        "{Sujet} réalise une roulade vers son flanc droit sur {Distance}"
                    ]
                }
            }
        },


        // ==========================================================
        // VOL
        // ==========================================================

        vol: {
            categorie: "deplacement",
            id: "VOL",

            concept:
                "Déplacement aérien continu d'un sujet sans contact permanent avec le sol.",

            manieres: {

                frontale: {
                    concept:
                        "Déplacement aérien principalement direct vers l'avant ou vers une cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "HAUTEUR",
                        "TRAJECTOIRE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} vole vers {Cible} à {Hauteur} de hauteur en trajectoire frontale pour l'atteindre",
                        "{Sujet} s'envole vers {Cible} à {Hauteur} pour le rejoindre",
                        "{Sujet} plane directement vers {Cible} pour arriver au contact",
                        "{Sujet} vole droit vers {Cible} à {Hauteur}",
                        "{Sujet} se déplace dans les airs vers {Cible}",
                        "{Sujet} avance en volant vers {Cible} à {Hauteur}",
                        "{Sujet} prend son envol en direction de {Cible}",
                        "{Sujet} plane en ligne droite vers {Cible}",
                        "{Sujet} vole frontalement vers {Cible} pour l'atteindre",
                        "{Sujet} se propulse dans les airs vers {Cible}",
                        "{Sujet} traverse les airs en direction de {Cible}",
                        "{Sujet} vole directement jusqu'à {Cible} à {Hauteur}",
                        "{Sujet} s'élance dans les airs vers {Cible}",
                        "{Sujet} se dirige en volant vers {Cible}",
                        "{Sujet} plane rapidement vers {Cible} pour arriver au contact",
                        "{Sujet} avance dans les airs en trajectoire directe vers {Cible}",
                        "{Sujet} vole en ligne droite vers {Cible} à {Hauteur}",
                        "{Sujet} prend de la vitesse dans les airs en direction de {Cible}",
                        "{Sujet} effectue un déplacement aérien direct vers {Cible}",
                        "{Sujet} fonce dans les airs vers {Cible} pour le rejoindre"
                    ]
                },


                diagonale: {
                    concept:
                        "Déplacement aérien oblique vers un côté. Le côté indique obligatoirement la direction latérale du déplacement.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "TRAJECTOIRE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} vole en diagonale sur sa gauche vers {Cible} à {Hauteur}",
                        "{Sujet} vole en diagonale sur sa droite vers {Cible} à {Hauteur}",
                        "{Sujet} s'élève en diagonale vers sa gauche pour se positionner au-dessus de {Cible}",
                        "{Sujet} plane obliquement vers sa droite à {Hauteur} pour rejoindre {Cible}",
                        "{Sujet} vole obliquement vers sa gauche en direction de {Cible}",
                        "{Sujet} vole obliquement vers sa droite pour atteindre {Cible}",
                        "{Sujet} se déplace dans les airs en diagonale vers sa gauche",
                        "{Sujet} se déplace dans les airs en diagonale vers sa droite",
                        "{Sujet} fonce en diagonale dans les airs vers {Cible}",
                        "{Sujet} plane en biais vers sa gauche à {Hauteur}",
                        "{Sujet} plane en biais vers sa droite à {Hauteur}",
                        "{Sujet} s'envole en diagonale vers sa gauche pour rejoindre {Cible}",
                        "{Sujet} s'envole en diagonale vers sa droite pour rejoindre {Cible}",
                        "{Sujet} traverse les airs en diagonale vers la gauche",
                        "{Sujet} traverse les airs en diagonale vers la droite",
                        "{Sujet} change de hauteur en volant vers sa gauche",
                        "{Sujet} change de hauteur en volant vers sa droite",
                        "{Sujet} effectue un déplacement aérien oblique vers sa gauche",
                        "{Sujet} effectue un déplacement aérien oblique vers sa droite",
                        "{Sujet} vole en biais vers {Cible} à {Hauteur} pour atteindre sa position"
                    ]
                },


                laterale: {
                    concept:
                        "Déplacement aérien principalement latéral. Le côté indique obligatoirement vers lequel le sujet vole.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} vole latéralement sur sa gauche à {Hauteur}",
                        "{Sujet} vole latéralement sur sa droite à {Hauteur}",
                        "{Sujet} se déplace dans les airs vers sa gauche pour éviter {Cible}",
                        "{Sujet} plane vers son côté droit pour se repositionner",
                        "{Sujet} vole vers sa gauche à {Hauteur}",
                        "{Sujet} vole vers sa droite à {Hauteur}",
                        "{Sujet} se déplace aériennement sur sa gauche",
                        "{Sujet} se déplace aériennement sur sa droite",
                        "{Sujet} glisse dans les airs vers sa gauche",
                        "{Sujet} glisse dans les airs vers sa droite",
                        "{Sujet} plane latéralement vers sa gauche",
                        "{Sujet} plane latéralement vers sa droite",
                        "{Sujet} fonce dans les airs vers sa gauche pour éviter {Cible}",
                        "{Sujet} fonce dans les airs vers sa droite pour éviter {Cible}",
                        "{Sujet} se décale dans les airs vers sa gauche",
                        "{Sujet} se décale dans les airs vers sa droite",
                        "{Sujet} effectue un déplacement aérien latéral vers sa gauche",
                        "{Sujet} effectue un déplacement aérien latéral vers sa droite",
                        "{Sujet} vole parallèlement vers sa gauche pour changer de position",
                        "{Sujet} vole parallèlement vers sa droite pour changer de position"
                    ]
                }
            }
        },


        // ==========================================================
        // PIVOT
        // ==========================================================

        pirouette_pivot: {
            categorie: "deplacement",
            id: "PIVOT",

            concept:
                "Rotation du corps autour d'un axe ou d'un point d'appui afin de changer son orientation ou sa position.",

            manieres: {

                droite: {
                    concept:
                        "Rotation du corps vers le côté droit.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "COTE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} pivote vers sa droite pour faire face à {Cible}",
                        "{Sujet} effectue un pivot sur sa droite pour changer d'orientation",
                        "{Sujet} tourne son corps vers la droite pour se placer face à {Cible}",
                        "{Sujet} pivote à droite pour faire face à {Cible}",
                        "{Sujet} tourne vers sa droite pour changer de position",
                        "{Sujet} effectue une rotation vers la droite pour se repositionner",
                        "{Sujet} tourne son corps sur la droite",
                        "{Sujet} pivote du côté droit pour faire face à {Cible}",
                        "{Sujet} réalise un pivot droit pour changer d'orientation",
                        "{Sujet} fait pivoter son corps vers la droite",
                        "{Sujet} tourne sur son appui vers la droite",
                        "{Sujet} effectue une rotation corporelle vers sa droite",
                        "{Sujet} pivote sur sa droite afin de se retrouver face à {Cible}",
                        "{Sujet} tourne rapidement vers son côté droit",
                        "{Sujet} change son orientation en pivotant vers la droite",
                        "{Sujet} effectue un demi-tour par pivot vers la droite",
                        "{Sujet} pivote vers la droite pour se repositionner",
                        "{Sujet} tourne sur lui-même vers la droite",
                        "{Sujet} réoriente son corps vers la droite par un pivot",
                        "{Sujet} effectue un mouvement de pivot vers sa droite pour faire face à {Cible}"
                    ]
                },


                gauche: {
                    concept:
                        "Rotation du corps vers le côté gauche.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "COTE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} pivote vers sa gauche pour faire face à {Cible}",
                        "{Sujet} effectue un pivot sur sa gauche pour changer d'orientation",
                        "{Sujet} tourne son corps vers la gauche pour se placer face à {Cible}",
                        "{Sujet} pivote à gauche pour faire face à {Cible}",
                        "{Sujet} tourne vers sa gauche pour changer de position",
                        "{Sujet} effectue une rotation vers la gauche pour se repositionner",
                        "{Sujet} tourne son corps sur la gauche",
                        "{Sujet} pivote du côté gauche pour faire face à {Cible}",
                        "{Sujet} réalise un pivot gauche pour changer d'orientation",
                        "{Sujet} fait pivoter son corps vers la gauche",
                        "{Sujet} tourne sur son appui vers la gauche",
                        "{Sujet} effectue une rotation corporelle vers sa gauche",
                        "{Sujet} pivote sur sa gauche afin de se retrouver face à {Cible}",
                        "{Sujet} tourne rapidement vers son côté gauche",
                        "{Sujet} change son orientation en pivotant vers la gauche",
                        "{Sujet} effectue un demi-tour par pivot vers la gauche",
                        "{Sujet} pivote vers la gauche pour se repositionner",
                        "{Sujet} tourne sur lui-même vers la gauche",
                        "{Sujet} réoriente son corps vers la gauche par un pivot",
                        "{Sujet} effectue un mouvement de pivot vers sa gauche pour faire face à {Cible}"
                    ]
                }
            }
        },


        // ==========================================================
        // VRILLE
        // ==========================================================

        vrille: {
            categorie: "deplacement",
            id: "VRILLE",

            concept:
                "Rotation répétée du corps autour de son propre axe pendant un déplacement ou une phase aérienne.",

            manieres: {

                rotation: {
                    concept:
                        "Rotation du corps autour de son axe avec une ou plusieurs rotations successives.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} effectue une vrille vers la droite dans les airs pour éviter {Cible}",
                        "{Sujet} vrille sur lui-même en avançant pour esquiver l'attaque de {Cible}",
                        "{Sujet} réalise une vrille aérienne vers la gauche pour changer de trajectoire",
                        "{Sujet} tourne sur lui-même plusieurs fois pour éviter {Cible}",
                        "{Sujet} effectue une rotation complète autour de son axe",
                        "{Sujet} vrille dans les airs vers la droite",
                        "{Sujet} vrille dans les airs vers la gauche",
                        "{Sujet} tourne plusieurs fois sur lui-même pour se repositionner",
                        "{Sujet} effectue plusieurs rotations successives dans les airs",
                        "{Sujet} se met à tourner sur son axe pour éviter {Cible}",
                        "{Sujet} réalise une vrille aérienne pour changer de direction",
                        "{Sujet} effectue une rotation rapide de son corps dans les airs",
                        "{Sujet} tourne continuellement autour de son propre axe",
                        "{Sujet} vrille vers la droite pour esquiver {Cible}",
                        "{Sujet} vrille vers la gauche pour éviter l'attaque",
                        "{Sujet} enchaîne plusieurs rotations autour de lui-même",
                        "{Sujet} effectue une vrille tout en avançant",
                        "{Sujet} tourne sur lui-même pendant son déplacement",
                        "{Sujet} réalise une rotation aérienne répétée pour se repositionner",
                        "{Sujet} effectue plusieurs tours sur son axe pour changer de trajectoire"
                    ]
                }
            }
        },


        // ==========================================================
        // SALTO
        // ==========================================================

        salto: {
            categorie: "deplacement",
            id: "SALTO",

            concept:
                "Rotation aérienne du corps autour d'un axe horizontal permettant d'effectuer une rotation complète pendant un saut.",

            manieres: {

                avant: {
                    concept:
                        "Rotation aérienne vers l'avant.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} fait un salto avant pour atterrir derrière {Cible}",
                        "{Sujet} effectue un salto vers l'avant pour éviter {Cible}",
                        "{Sujet} réalise un salto avant pour se repositionner",
                        "{Sujet} effectue une rotation aérienne vers l'avant pour passer au-dessus de {Cible}",
                        "{Sujet} bondit dans les airs en réalisant un salto avant",
                        "{Sujet} fait une rotation complète vers l'avant",
                        "{Sujet} effectue un salto frontal pour dépasser {Cible}",
                        "{Sujet} réalise une rotation avant dans les airs",
                        "{Sujet} tourne vers l'avant pendant son saut",
                        "{Sujet} effectue une rotation aérienne avant pour esquiver",
                        "{Sujet} fait un salto avant afin de retomber derrière {Cible}",
                        "{Sujet} se projette dans les airs puis effectue un salto vers l'avant",
                        "{Sujet} réalise un salto en direction de l'avant pour changer de position",
                        "{Sujet} effectue une rotation complète vers l'avant au-dessus de {Cible}",
                        "{Sujet} bondit puis tourne vers l'avant dans les airs",
                        "{Sujet} fait un salto avant pour franchir {Cible}",
                        "{Sujet} effectue un mouvement de rotation aérienne vers l'avant",
                        "{Sujet} réalise un salto frontal pour éviter l'attaque",
                        "{Sujet} tourne complètement vers l'avant pendant son déplacement aérien",
                        "{Sujet} effectue un salto avant pour se repositionner derrière {Cible}"
                    ]
                },


                arriere: {
                    concept:
                        "Rotation aérienne vers l'arrière.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} fait un salto arrière pour éviter {Cible}",
                        "{Sujet} effectue un salto vers l'arrière pour se repositionner",
                        "{Sujet} réalise une rotation aérienne arrière pour s'éloigner de {Cible}",
                        "{Sujet} bondit dans les airs en réalisant un salto arrière",
                        "{Sujet} effectue une rotation complète vers l'arrière",
                        "{Sujet} fait un salto arrière pour prendre de la distance",
                        "{Sujet} réalise une rotation arrière dans les airs",
                        "{Sujet} tourne vers l'arrière pendant son saut",
                        "{Sujet} effectue un salto arrière pour esquiver {Cible}",
                        "{Sujet} se projette dans les airs puis tourne vers l'arrière",
                        "{Sujet} réalise un salto vers l'arrière pour changer de position",
                        "{Sujet} bondit puis effectue une rotation arrière",
                        "{Sujet} fait une rotation complète vers l'arrière dans les airs",
                        "{Sujet} effectue un salto arrière pour retomber plus loin",
                        "{Sujet} réalise un mouvement de rotation aérienne vers l'arrière",
                        "{Sujet} tourne complètement vers l'arrière pendant son saut",
                        "{Sujet} effectue un salto arrière afin de s'éloigner de {Cible}",
                        "{Sujet} bondit en arrière et réalise une rotation aérienne",
                        "{Sujet} fait un salto arrière pour éviter l'attaque de {Cible}",
                        "{Sujet} réalise un salto arrière pour se repositionner hors de portée"
                    ]
                }
            }
        },


        // ==========================================================
        // FLIP
        // ==========================================================

        flip: {
            categorie: "deplacement",
            id: "FLIP",

            concept:
                "Mouvement acrobatique aérien impliquant une rotation du corps afin de changer de position ou de franchir un obstacle.",

            manieres: {

                avant: {
                    concept:
                        "Flip réalisé vers l'avant.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} fait un flip avant pour passer au-dessus de {Cible}",
                        "{Sujet} effectue un flip vers l'avant pour esquiver {Cible}",
                        "{Sujet} réalise un flip avant pour franchir l'obstacle",
                        "{Sujet} effectue une rotation avant pour retomber derrière {Cible}",
                        "{Sujet} bondit dans les airs et réalise un flip avant",
                        "{Sujet} effectue un retournement vers l'avant",
                        "{Sujet} réalise une rotation acrobatique vers l'avant",
                        "{Sujet} fait un flip frontal pour dépasser {Cible}",
                        "{Sujet} tourne vers l'avant pendant son saut",
                        "{Sujet} effectue un flip avant pour changer de position",
                        "{Sujet} se projette dans les airs puis tourne vers l'avant",
                        "{Sujet} réalise un mouvement acrobatique vers l'avant",
                        "{Sujet} effectue une rotation complète vers l'avant dans les airs",
                        "{Sujet} fait un flip vers l'avant pour éviter l'attaque",
                        "{Sujet} bondit puis réalise une rotation avant",
                        "{Sujet} effectue un retournement aérien vers l'avant",
                        "{Sujet} réalise un flip avant pour retomber derrière {Cible}",
                        "{Sujet} tourne complètement vers l'avant au cours de son saut",
                        "{Sujet} effectue un flip frontal pour se repositionner",
                        "{Sujet} réalise une rotation aérienne avant pour franchir {Cible}"
                    ]
                },


                arriere: {
                    concept:
                        "Flip réalisé vers l'arrière.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MANIERE",
                        "DIRECTION",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} fait un flip arrière pour retomber derrière {Cible}",
                        "{Sujet} effectue un flip vers l'arrière pour éviter {Cible}",
                        "{Sujet} réalise un flip arrière pour se repositionner",
                        "{Sujet} effectue une rotation arrière pour s'éloigner de {Cible}",
                        "{Sujet} bondit dans les airs et réalise un flip arrière",
                        "{Sujet} effectue un retournement vers l'arrière",
                        "{Sujet} réalise une rotation acrobatique vers l'arrière",
                        "{Sujet} fait un flip arrière pour prendre de la distance",
                        "{Sujet} tourne vers l'arrière pendant son saut",
                        "{Sujet} effectue un flip arrière pour changer de position",
                        "{Sujet} se projette dans les airs puis tourne vers l'arrière",
                        "{Sujet} réalise un mouvement acrobatique vers l'arrière",
                        "{Sujet} effectue une rotation complète vers l'arrière dans les airs",
                        "{Sujet} fait un flip vers l'arrière pour esquiver l'attaque",
                        "{Sujet} bondit puis réalise une rotation arrière",
                        "{Sujet} effectue un retournement aérien vers l'arrière",
                        "{Sujet} réalise un flip arrière pour retomber plus loin",
                        "{Sujet} tourne complètement vers l'arrière au cours de son saut",
                        "{Sujet} effectue un flip arrière pour sortir de portée de {Cible}",
                        "{Sujet} réalise une rotation aérienne arrière pour se repositionner"
                    ]
                }
            }
        }
    }
};                   
                                                                    
      
/* ============================================================================
 * 9. EXPORT
 * ========================================================================== */

module.exports = {
    NEOAI_CONFIG,
    NEO_VERBES,
    NEO_NOMS,
    NEO_ADJECTIFS,
    NEO_ADVERBES,
    NEO_CONNECTEURS,
    NEO_PREPOSITIONS,
    NEO_PARTIES_CORPS,
    NEO_COTES_CORPS,
    NEO_ZONES_CORPORELLES,
    NEO_TYPES_CIBLES,
    NEO_MANIERES: {
        directions: NEO_DIRECTIONS,
        trajectoires: NEO_TRAJECTOIRES,
        positions: NEO_POSITIONS
    },
    NEO_VITESSES,
    NEO_DISTANCES,
    NEO_HAUTEURS,
    NEO_INTENSITES,
    NEO_INTENTIONS,
    NEO_SYNONYMES,
    NEO_CATEGORIES,
    NEO_ACTIONS,
    NEO_PARAMETRES,
    NEO_RELATIONS,
    NEO_ACTION_MODELS
};
