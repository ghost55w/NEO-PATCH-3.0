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

                    maniere: "marche",
                    trajectoire: "normale",

                    synonymes: [
                        "marche",
                        "marcher",
                        "marche à pied",
                        "au pas",
                        "avance à pied",
                        "progresse à pied",
                        "se déplace à pied",
                        "avance tranquillement",
                        "progresse normalement"
                    ],

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
                        "{Sujet} marche en direction de {Cible} sur {Distance} pour se rapprocher",
                        "{Sujet} avance lentement vers {Cible} pour réduire la distance",
                        "{Sujet} progresse à pied vers {Cible} sur {Distance}",
                        "{Sujet} se dirige à pied vers {Cible} pour l'atteindre",
                        "{Sujet} avance normalement en direction de {Cible} sur {Distance}",
                        "{Sujet} marche droit vers {Cible} pour arriver à proximité",
                        "{Sujet} se met à marcher vers {Cible} sur {Distance}",
                        "{Sujet} poursuit sa progression à pied vers {Cible}",
                        "{Sujet} avance au pas en direction de {Cible}",
                        "{Sujet} marche progressivement vers {Cible} pour rejoindre sa position",
                        "{Sujet} se rapproche de {Cible} en marchant sur {Distance}",
                        "{Sujet} progresse au pas vers {Cible} pour réduire l'écart",
                        "{Sujet} se déplace normalement à pied jusqu'à {Cible}",
                        "{Sujet} avance à allure normale vers {Cible} sur {Distance}",
                        "{Sujet} continue à pied en direction de {Cible}",
                        "{Sujet} effectue une progression à pied vers {Cible} sur {Distance}"
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

                    maniere: "course",
                    trajectoire: "frontale",

                    synonymes: [
                        "course",
                        "courir",
                        "court",
                        "fonce",
                        "foncer",
                        "se rue",
                        "se ruer",
                        "s'élance",
                        "s'élancer",
                        "file",
                        "part en courant",
                        "court droit",
                        "fonce droit",
                        "course frontale",
                        "frontalement",
                        "de manière frontale",
                        "en ligne droite",
                        "droit vers",
                        "directement vers"
                    ],

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
                        "{Sujet} court vers {Cible} sur {Distance} pour l'atteindre",
                        "{Sujet} fonce vers {Cible} à {Vitesse} sur {Distance} pour arriver au contact",
                        "{Sujet} se rue droit vers {Cible} sur {Distance} pour le rejoindre",
                        "{Sujet} s'élance directement vers {Cible} à {Vitesse} pour atteindre sa position",
                        "{Sujet} file droit vers {Cible} sur {Distance} pour arriver jusqu'à lui",
                        "{Sujet} court en ligne droite vers {Cible} sur {Distance}",
                        "{Sujet} fonce directement en direction de {Cible} pour réduire la distance",
                        "{Sujet} court frontalement vers {Cible} à {Vitesse}",
                        "{Sujet} avance en courant droit vers {Cible} sur {Distance}",
                        "{Sujet} se précipite en ligne droite vers {Cible} pour l'atteindre",
                        "{Sujet} court de manière frontale vers {Cible} sur {Distance}",
                        "{Sujet} fonce de manière frontale vers {Cible} à {Vitesse}",
                        "{Sujet} court droit devant lui en direction de {Cible}",
                        "{Sujet} part en courant directement vers {Cible}",
                        "{Sujet} prend sa course et fonce vers {Cible} sur {Distance}",
                        "{Sujet} accélère en courant vers {Cible} pour arriver au contact",
                        "{Sujet} progresse rapidement en ligne droite vers {Cible}",
                        "{Sujet} se lance frontalement à la poursuite de {Cible}",
                        "{Sujet} court tout droit jusqu'à {Cible} sur {Distance}",
                        "{Sujet} effectue une course directe vers {Cible} à {Vitesse}"
                    ]
                },


                // --------------------------------------------------
                // COURSE CIRCULAIRE
                // --------------------------------------------------

                circulaire: {
                    concept:
                        "Course effectuée autour d'une cible ou selon une trajectoire courbe. Le côté indique vers quel côté le sujet se déplace autour de la cible.",

                    maniere: "course",
                    trajectoire: "circulaire",

                    synonymes: [
                        "circulaire",
                        "course circulaire",
                        "court autour",
                        "tourne autour",
                        "contourne en courant",
                        "fait le tour",
                        "court en cercle",
                        "tourne autour de",
                        "se déplace autour"
                    ],

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
                        "{Sujet} court en cercle autour de {Cible} par sa droite",
                        "{Sujet} tourne autour de {Cible} en courant vers sa gauche",
                        "{Sujet} fait le tour de {Cible} en courant sur sa droite",
                        "{Sujet} contourne {Cible} en effectuant une course vers sa gauche",
                        "{Sujet} court autour de {Cible} dans un mouvement circulaire",
                        "{Sujet} se déplace en cercle autour de {Cible} pour le contourner",
                        "{Sujet} fonce autour de {Cible} en passant par sa gauche",
                        "{Sujet} court en trajectoire circulaire autour de {Cible}",
                        "{Sujet} décrit une courbe autour de {Cible} en courant",
                        "{Sujet} se met à courir autour de {Cible} vers sa droite",
                        "{Sujet} effectue le tour de {Cible} en courant sur {Distance}",
                        "{Sujet} contourne rapidement {Cible} par sa gauche",
                        "{Sujet} tourne autour de {Cible} en courant à {Vitesse}",
                        "{Sujet} progresse autour de {Cible} selon une trajectoire circulaire",
                        "{Sujet} réalise une course autour de {Cible} pour se placer derrière lui"
                    ]
                },


                // --------------------------------------------------
                // COURSE DIAGONALE
                // --------------------------------------------------

                diagonale: {
                    concept:
                        "Course effectuée selon une trajectoire oblique vers une cible ou une position. Le côté indique si le sujet se déplace en diagonale vers sa gauche ou vers sa droite.",

                    maniere: "course",
                    trajectoire: "diagonale",

                    synonymes: [
                        "diagonale",
                        "diagonalement",
                        "en diagonale",
                        "oblique",
                        "obliquement",
                        "en biais",
                        "sur le côté en avançant"
                    ],

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
                        "{Sujet} court obliquement vers {Cible} sur sa gauche",
                        "{Sujet} fonce en biais vers {Cible} par la droite",
                        "{Sujet} progresse en diagonale vers {Cible} à {Vitesse}",
                        "{Sujet} court de manière diagonale vers {Cible}",
                        "{Sujet} avance en diagonale sur son côté gauche vers {Cible}",
                        "{Sujet} se déplace en diagonale vers sa droite pour rejoindre {Cible}",
                        "{Sujet} prend une trajectoire oblique en courant vers {Cible}",
                        "{Sujet} court en biais sur {Distance} vers {Cible}",
                        "{Sujet} fonce diagonalement sur sa droite pour atteindre {Cible}",
                        "{Sujet} s'élance en diagonale vers sa gauche en direction de {Cible}",
                        "{Sujet} coupe sa trajectoire en diagonale vers {Cible}",
                        "{Sujet} effectue une course oblique vers {Cible}",
                        "{Sujet} court en diagonale sur son côté droit à {Vitesse}",
                        "{Sujet} progresse en courant de façon diagonale vers {Cible}",
                        "{Sujet} rejoint {Cible} en courant selon une trajectoire diagonale"
                    ]
                },


                // --------------------------------------------------
                // COURSE ZIGZAG
                // --------------------------------------------------

                zig_zag: {
                    concept:
                        "Course durant laquelle le sujet alterne successivement ses déplacements vers la gauche et vers la droite tout en progressant vers son objectif.",

                    maniere: "course",
                    trajectoire: "zig_zag",

                    synonymes: [
                        "zigzag",
                        "zig zag",
                        "en zigzag",
                        "en zig-zag",
                        "serpente",
                        "serpenter",
                        "alternance gauche droite",
                        "gauche droite",
                        "change de côté"
                    ],

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
                        "{Sujet} court en zig-zag vers {Cible}",
                        "{Sujet} fonce vers {Cible} en alternant gauche et droite",
                        "{Sujet} progresse en zigzag sur {Distance} vers {Cible}",
                        "{Sujet} court en changeant constamment de côté vers {Cible}",
                        "{Sujet} se déplace en zigzag pour rejoindre {Cible}",
                        "{Sujet} serpente en courant vers {Cible}",
                        "{Sujet} court en alternant ses mouvements latéraux vers {Cible}",
                        "{Sujet} avance vers {Cible} en faisant des écarts successifs",
                        "{Sujet} fonce en zigzag à {Vitesse} pour atteindre {Cible}",
                        "{Sujet} court en trajectoire brisée vers {Cible}",
                        "{Sujet} progresse rapidement en zigzag sur {Distance}",
                        "{Sujet} se rue vers {Cible} en changeant de direction alternativement",
                        "{Sujet} effectue une course en zigzag pour éviter {Cible}",
                        "{Sujet} court de gauche à droite en direction de {Cible}",
                        "{Sujet} rejoint {Cible} en courant selon un mouvement en zigzag"
                    ]
                },


                // --------------------------------------------------
                // COURSE LATERALE
                // --------------------------------------------------

                laterale: {
                    concept:
                        "Course effectuée principalement vers un côté par rapport à l'orientation actuelle du sujet. Le côté indique obligatoirement la direction latérale du déplacement.",

                    maniere: "course",
                    trajectoire: "laterale",

                    synonymes: [
                        "latérale",
                        "latéralement",
                        "sur le côté",
                        "de côté",
                        "vers le côté",
                        "sur sa gauche",
                        "sur sa droite",
                        "déplacement latéral"
                    ],

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
                        "{Sujet} court de côté vers sa gauche sur {Distance}",
                        "{Sujet} court de côté vers sa droite sur {Distance}",
                        "{Sujet} se déplace latéralement vers {Cible}",
                        "{Sujet} fonce sur le côté gauche pour éviter {Cible}",
                        "{Sujet} progresse rapidement sur sa droite",
                        "{Sujet} court vers son côté gauche à {Vitesse}",
                        "{Sujet} court vers son côté droit à {Vitesse}",
                        "{Sujet} se décale en courant vers sa gauche",
                        "{Sujet} se décale en courant vers sa droite",
                        "{Sujet} effectue une course latérale sur {Distance}",
                        "{Sujet} avance latéralement vers sa gauche pour se repositionner",
                        "{Sujet} avance latéralement vers sa droite pour atteindre {Cible}",
                        "{Sujet} se rue de côté vers {Cible}",
                        "{Sujet} court parallèlement sur le côté vers {Cible}",
                        "{Sujet} rejoint sa position en courant latéralement vers la droite"
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

                    maniere: "dash",

                    synonymes: [
                        "dash",
                        "dashes",
                        "accélération",
                        "accélération brutale",
                        "accélère brutalement",
                        "sprint instantané",
                        "propulsion rapide",
                        "déplacement instantané",
                        "bond rapide"
                    ],

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
                        "{Sujet} effectue une accélération fulgurante vers {Cible} sur {Distance}",
                        "{Sujet} déclenche un dash vers {Cible} sur {Distance}",
                        "{Sujet} part en dash sur {Distance} vers {Cible}",
                        "{Sujet} effectue une poussée rapide de {Distance} vers {Cible}",
                        "{Sujet} accélère instantanément en direction de {Cible}",
                        "{Sujet} se propulse brutalement sur {Distance} vers {Cible}",
                        "{Sujet} traverse rapidement {Distance} pour rejoindre {Cible}",
                        "{Sujet} effectue une accélération soudaine vers {Cible}",
                        "{Sujet} dash en avant sur {Distance} pour se rapprocher",
                        "{Sujet} fonce instantanément sur {Distance} vers {Cible}",
                        "{Sujet} effectue une poussée fulgurante vers {Cible}",
                        "{Sujet} se projette rapidement vers {Cible} sur {Distance}",
                        "{Sujet} réalise un déplacement éclair vers {Cible}",
                        "{Sujet} accélère d'un coup vers {Cible} sur {Distance}",
                        "{Sujet} effectue un dash frontal pour réduire la distance avec {Cible}",
                        "{Sujet} se propulse en avant sur {Distance} pour arriver au contact de {Cible}"
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

                    maniere: "rush",

                    synonymes: [
                        "rush",
                        "fonce",
                        "foncer",
                        "charge",
                        "charger",
                        "se rue",
                        "se ruer",
                        "se précipite",
                        "se précipiter",
                        "attaque en avançant",
                        "charge vers"
                    ],

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
                        "{Sujet} lance un rush vers {Cible}",
                        "{Sujet} se rue à toute vitesse sur {Cible}",
                        "{Sujet} fonce agressivement vers {Cible}",
                        "{Sujet} charge droit sur {Cible}",
                        "{Sujet} se précipite directement vers {Cible}",
                        "{Sujet} part en rush sur {Cible} sur {Distance}",
                        "{Sujet} réduit rapidement la distance avec {Cible}",
                        "{Sujet} accélère brutalement vers {Cible} pour entrer au contact",
                        "{Sujet} se lance à l'assaut de {Cible} en courant",
                        "{Sujet} charge rapidement en direction de {Cible}",
                        "{Sujet} se rue directement sur {Cible} à {Vitesse}",
                        "{Sujet} fonce sur {Cible} sans ralentir",
                        "{Sujet} effectue une charge rapide vers {Cible}",
                        "{Sujet} se précipite vers {Cible} pour rejoindre sa position",
                        "{Sujet} effectue un rush direct afin d'atteindre {Cible}"
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

                    maniere: "saut",
                    trajectoire: "avant",

                    synonymes: [
                        "saute",
                        "sauter",
                        "bondit",
                        "bondir",
                        "saute vers l'avant",
                        "bond vers l'avant",
                        "s'élève vers l'avant",
                        "franchit dans les airs"
                    ],

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
                        "{Sujet} bondit en avant vers {Cible} à {Hauteur}",
                        "{Sujet} saute directement vers {Cible}",
                        "{Sujet} prend son impulsion et saute vers l'avant",
                        "{Sujet} s'élance dans les airs vers {Cible}",
                        "{Sujet} effectue un saut avant sur {Distance}",
                        "{Sujet} quitte le sol et progresse vers {Cible}",
                        "{Sujet} bondit en direction de {Cible}",
                        "{Sujet} saute vers {Cible} avec une trajectoire vers l'avant",
                        "{Sujet} se propulse dans les airs vers {Cible}",
                        "{Sujet} s'élève vers l'avant pour rejoindre {Cible}",
                        "{Sujet} effectue une impulsion vers l'avant et saute",
                        "{Sujet} bondit à hauteur de {Hauteur} vers {Cible}",
                        "{Sujet} saute en avant pour se rapprocher de {Cible}",
                        "{Sujet} prend appui et s'envole vers {Cible}",
                        "{Sujet} franchit la distance vers {Cible} par un saut avant",
                        "{Sujet} réalise un saut orienté vers l'avant pour atteindre {Cible}"
                    ]
                },


                arriere: {
                    concept:
                        "Saut orienté vers l'arrière permettant au sujet de s'éloigner ou de se repositionner.",

                    maniere: "saut",
                    trajectoire: "arriere",

                    synonymes: [
                        "saut arrière",
                        "saute en arrière",
                        "bond arrière",
                        "bondit en arrière",
                        "recul dans les airs",
                        "s'élève vers l'arrière"
                    ],

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
                        "{Sujet} effectue un saut arrière pour s'éloigner de {Cible}",
                        "{Sujet} bondit vers l'arrière à {Hauteur}",
                        "{Sujet} saute en reculant pour éviter {Cible}",
                        "{Sujet} prend appui et part en arrière dans les airs",
                        "{Sujet} s'élève vers l'arrière pour créer de la distance",
                        "{Sujet} effectue un bond arrière sur {Distance}",
                        "{Sujet} saute en arrière pour sortir de portée de {Cible}",
                        "{Sujet} recule dans les airs en sautant",
                        "{Sujet} se propulse vers l'arrière pour esquiver {Cible}",
                        "{Sujet} effectue une impulsion arrière et quitte le sol",
                        "{Sujet} bondit en arrière pour se repositionner",
                        "{Sujet} saute à reculons pour s'éloigner de {Cible}",
                        "{Sujet} s'élance vers l'arrière dans les airs",
                        "{Sujet} réalise un saut orienté vers l'arrière",
                        "{Sujet} prend de la hauteur en reculant par un saut",
                        "{Sujet} effectue un saut arrière à {Hauteur} pour éviter {Cible}",
                        "{Sujet} se dégage de {Cible} en sautant vers l'arrière"
                    ]
                },


                vertical: {
                    concept:
                        "Saut principalement orienté vers le haut avec une progression horizontale minimale.",

                    maniere: "saut",
                    trajectoire: "verticale",

                    synonymes: [
                        "saut vertical",
                        "verticalement",
                        "saute vers le haut",
                        "bondit vers le haut",
                        "s'élève",
                        "s'envole verticalement",
                        "bond vertical"
                    ],

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
                        "{Sujet} effectue un saut vertical pour prendre de la hauteur",
                        "{Sujet} bondit droit vers le ciel à {Hauteur}",
                        "{Sujet} saute sur place pour s'élever",
                        "{Sujet} quitte le sol verticalement",
                        "{Sujet} se propulse directement vers le haut",
                        "{Sujet} prend de la hauteur par un saut vertical",
                        "{Sujet} s'élève dans les airs sans avancer",
                        "{Sujet} effectue une impulsion verticale à {Hauteur}",
                        "{Sujet} bondit vers le haut pour éviter {Cible}",
                        "{Sujet} saute directement au-dessus de sa position",
                        "{Sujet} monte verticalement dans les airs",
                        "{Sujet} réalise un bond vertical pour se repositionner",
                        "{Sujet} s'envole vers le haut à {Hauteur}",
                        "{Sujet} prend appui et saute verticalement",
                        "{Sujet} effectue un saut principalement vertical",
                        "{Sujet} quitte le sol en montant droit vers le haut",
                        "{Sujet} saute verticalement afin d'éviter {Cible}"
                    ]
                },


                laterale: {
                    concept:
                        "Saut effectué vers un côté. Le côté indique obligatoirement la direction latérale du déplacement.",

                    maniere: "saut",
                    trajectoire: "laterale",

                    synonymes: [
                        "saut latéral",
                        "saute latéralement",
                        "bond latéral",
                        "bondit sur le côté",
                        "saute sur le côté",
                        "bond vers le côté"
                    ],

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
                        "{Sujet} bondit sur le côté gauche pour éviter {Cible}",
                        "{Sujet} saute de côté vers sa droite",
                        "{Sujet} quitte le sol en se projetant sur sa gauche",
                        "{Sujet} se propulse latéralement vers sa droite",
                        "{Sujet} effectue un bond latéral sur {Distance}",
                        "{Sujet} saute vers sa gauche à {Hauteur}",
                        "{Sujet} saute vers sa droite à {Hauteur}",
                        "{Sujet} bondit latéralement pour esquiver {Cible}",
                        "{Sujet} se déplace dans les airs vers son côté gauche",
                        "{Sujet} s'élance sur le côté droit par un saut",
                        "{Sujet} effectue une impulsion latérale vers {Cible}",
                        "{Sujet} saute de côté pour se repositionner",
                        "{Sujet} bondit vers son côté gauche pour éviter l'attaque",
                        "{Sujet} bondit vers son côté droit pour atteindre sa position",
                        "{Sujet} réalise un saut orienté latéralement",
                        "{Sujet} quitte le sol et se déplace sur le côté droit"
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

                    maniere: "roulade",
                    trajectoire: "avant",

                    synonymes: [
                        "roulade",
                        "roulade avant",
                        "roule",
                        "rouler",
                        "roule vers l'avant",
                        "fait une roulade",
                        "se met à rouler"
                    ],

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
                        "{Sujet} effectue une roulade avant sur {Distance}",
                        "{Sujet} se met à rouler vers l'avant pour éviter {Cible}",
                        "{Sujet} plonge au sol et roule vers l'avant",
                        "{Sujet} réalise une roulade en direction de {Cible}",
                        "{Sujet} avance au sol en effectuant une roulade",
                        "{Sujet} roule rapidement vers {Cible}",
                        "{Sujet} effectue une rotation au sol vers l'avant",
                        "{Sujet} part en roulade vers l'avant",
                        "{Sujet} se propulse au sol par une roulade avant",
                        "{Sujet} roule sur {Distance} pour atteindre {Cible}",
                        "{Sujet} fait une roulade au sol en direction de {Cible}",
                        "{Sujet} se déplace au sol en roulant vers l'avant",
                        "{Sujet} effectue une roulade avant pour esquiver",
                        "{Sujet} roule droit vers {Cible}",
                        "{Sujet} avance en roulant sur {Distance}",
                        "{Sujet} réalise un déplacement en roulade vers l'avant pour rejoindre {Cible}"
                    ]
                },


                arriere: {
                    concept:
                        "Roulade au sol orientée vers l'arrière.",

                    maniere: "roulade",
                    trajectoire: "arriere",

                    synonymes: [
                        "roulade arrière",
                        "roule vers l'arrière",
                        "roule en arrière",
                        "fait une roulade arrière",
                        "roulade de recul"
                    ],

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
                        "{Sujet} part en roulade arrière pour esquiver {Cible}",
                        "{Sujet} se met à rouler en arrière pour prendre de la distance",
                        "{Sujet} recule au sol en effectuant une roulade",
                        "{Sujet} effectue une rotation au sol vers l'arrière",
                        "{Sujet} roule à reculons pour s'éloigner de {Cible}",
                        "{Sujet} réalise une roulade arrière sur {Distance}",
                        "{Sujet} se propulse en arrière par une roulade",
                        "{Sujet} roule vers l'arrière pour sortir de portée",
                        "{Sujet} effectue une roulade de recul",
                        "{Sujet} se déplace au sol en roulant vers l'arrière",
                        "{Sujet} fait une roulade arrière pour éviter {Cible}",
                        "{Sujet} roule rapidement en arrière",
                        "{Sujet} effectue une roulade orientée vers l'arrière",
                        "{Sujet} prend de la distance en roulant vers l'arrière",
                        "{Sujet} se repositionne par une roulade arrière",
                        "{Sujet} s'éloigne de {Cible} en effectuant une roulade arrière"
                    ]
                },


                laterale: {
                    concept:
                        "Roulade au sol effectuée latéralement. Le côté indique obligatoirement vers lequel le sujet roule.",

                    maniere: "roulade",
                    trajectoire: "laterale",

                    synonymes: [
                        "roulade latérale",
                        "roule sur le côté",
                        "roule latéralement",
                        "roulade de côté",
                        "roule à gauche",
                        "roule à droite"
                    ],

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
                        "{Sujet} roule sur son côté gauche pour éviter {Cible}",
                        "{Sujet} roule latéralement vers sa droite",
                        "{Sujet} part en roulade sur le côté gauche",
                        "{Sujet} effectue une roulade de côté sur {Distance}",
                        "{Sujet} se déplace au sol en roulant vers sa droite",
                        "{Sujet} se déplace au sol en roulant vers sa gauche",
                        "{Sujet} roule latéralement pour esquiver {Cible}",
                        "{Sujet} effectue une roulade vers son côté droit",
                        "{Sujet} effectue une roulade vers son côté gauche",
                        "{Sujet} se projette sur le côté en roulant",
                        "{Sujet} roule de côté pour se repositionner",
                        "{Sujet} réalise une roulade latérale pour éviter {Cible}",
                        "{Sujet} roule rapidement vers sa gauche sur {Distance}",
                        "{Sujet} roule rapidement vers sa droite sur {Distance}",
                        "{Sujet} change de position par une roulade latérale",
                        "{Sujet} esquive {Cible} en effectuant une roulade sur le côté"
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

                    maniere: "vol",
                    trajectoire: "frontale",

                    synonymes: [
                        "vole",
                        "voler",
                        "vole vers",
                        "s'envole",
                        "plane",
                        "planer",
                        "avance dans les airs",
                        "se déplace dans les airs",
                        "vole frontalement"
                    ],

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
                        "{Sujet} avance dans les airs en direction de {Cible}",
                        "{Sujet} vole en ligne droite vers {Cible}",
                        "{Sujet} s'élance dans les airs vers {Cible}",
                        "{Sujet} plane vers {Cible} à {Hauteur}",
                        "{Sujet} prend son envol et se dirige vers {Cible}",
                        "{Sujet} vole frontalement vers {Cible}",
                        "{Sujet} avance en vol direct vers {Cible}",
                        "{Sujet} traverse les airs en direction de {Cible}",
                        "{Sujet} se propulse dans les airs vers {Cible}",
                        "{Sujet} vole droit devant lui vers {Cible}",
                        "{Sujet} se déplace aériennement vers {Cible}",
                        "{Sujet} effectue un vol direct jusqu'à {Cible}",
                        "{Sujet} plane en ligne droite vers {Cible}",
                        "{Sujet} vole rapidement vers {Cible} à {Hauteur}",
                        "{Sujet} rejoint {Cible} par un déplacement aérien frontal"
                    ]
                },


                diagonale: {
                    concept:
                        "Déplacement aérien oblique vers un côté. Le côté indique obligatoirement la direction latérale du déplacement.",

                    maniere: "vol",
                    trajectoire: "diagonale",

                    synonymes: [
                        "vole en diagonale",
                        "vol diagonal",
                        "vole obliquement",
                        "plane en diagonale",
                        "s'élève en diagonale",
                        "se déplace en diagonale dans les airs"
                    ],

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
                        "{Sujet} vole diagonalement vers {Cible}",
                        "{Sujet} traverse les airs en diagonale vers sa gauche",
                        "{Sujet} se déplace en diagonale vers sa droite dans les airs",
                        "{Sujet} plane en biais vers {Cible}",
                        "{Sujet} prend une trajectoire aérienne diagonale vers {Cible}",
                        "{Sujet} vole obliquement vers sa gauche",
                        "{Sujet} vole obliquement vers sa droite",
                        "{Sujet} s'élève en diagonale à {Hauteur} vers {Cible}",
                        "{Sujet} se propulse dans les airs en diagonale vers {Cible}",
                        "{Sujet} avance dans les airs selon une trajectoire diagonale",
                        "{Sujet} effectue un vol diagonal sur sa gauche",
                        "{Sujet} effectue un vol diagonal sur sa droite",
                        "{Sujet} plane en diagonale pour rejoindre {Cible}",
                        "{Sujet} vole en biais à {Hauteur} vers {Cible}",
                        "{Sujet} rejoint {Cible} par une trajectoire aérienne oblique",
                        "{Sujet} se déplace vers {Cible} en vol diagonal"
                    ]
                },


                laterale: {
                    concept:
                        "Déplacement aérien principalement latéral. Le côté indique obligatoirement vers lequel le sujet vole.",

                    maniere: "vol",
                    trajectoire: "laterale",

                    synonymes: [
                        "vol latéral",
                        "vole latéralement",
                        "vole de côté",
                        "plane sur le côté",
                        "se déplace latéralement dans les airs"
                    ],

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
                        "{Sujet} vole de côté vers sa gauche",
                        "{Sujet} vole de côté vers sa droite",
                        "{Sujet} se déplace latéralement dans les airs vers {Cible}",
                        "{Sujet} plane sur son côté gauche à {Hauteur}",
                        "{Sujet} plane sur son côté droit à {Hauteur}",
                        "{Sujet} se décale dans les airs vers sa gauche",
                        "{Sujet} se décale dans les airs vers sa droite",
                        "{Sujet} effectue un déplacement aérien latéral",
                        "{Sujet} vole parallèlement sur le côté gauche",
                        "{Sujet} vole parallèlement sur le côté droit",
                        "{Sujet} traverse les airs latéralement vers sa gauche",
                        "{Sujet} traverse les airs latéralement vers sa droite",
                        "{Sujet} change de position en volant sur le côté",
                        "{Sujet} esquive {Cible} en volant latéralement",
                        "{Sujet} rejoint sa position en se déplaçant dans les airs vers sa droite",
                        "{Sujet} effectue un vol latéral pour se repositionner"
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

                    maniere: "pivot",
                    trajectoire: "droite",

                    synonymes: [
                        "pivote à droite",
                        "pivoter à droite",
                        "tourne à droite",
                        "tourne vers la droite",
                        "rotation à droite",
                        "pivot droit"
                    ],

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
                        "{Sujet} pivote à droite pour regarder {Cible}",
                        "{Sujet} effectue une rotation vers sa droite",
                        "{Sujet} tourne vers sa droite pour changer de direction",
                        "{Sujet} réalise un pivot droit",
                        "{Sujet} fait pivoter son corps vers la droite",
                        "{Sujet} change son orientation en pivotant à droite",
                        "{Sujet} tourne sur son appui vers la droite",
                        "{Sujet} effectue un mouvement de pivot vers sa droite",
                        "{Sujet} pivote sur place vers la droite",
                        "{Sujet} tourne rapidement vers sa droite",
                        "{Sujet} effectue une rotation du corps vers la droite",
                        "{Sujet} se réoriente vers la droite par un pivot",
                        "{Sujet} pivote à droite afin de faire face à {Cible}",
                        "{Sujet} tourne son axe vers la droite",
                        "{Sujet} effectue un pivot latéral droit",
                        "{Sujet} réoriente son corps en tournant à droite",
                        "{Sujet} se place face à {Cible} en pivotant vers la droite"
                    ]
                },


                gauche: {
                    concept:
                        "Rotation du corps vers le côté gauche.",

                    maniere: "pivot",
                    trajectoire: "gauche",

                    synonymes: [
                        "pivote à gauche",
                        "pivoter à gauche",
                        "tourne à gauche",
                        "tourne vers la gauche",
                        "rotation à gauche",
                        "pivot gauche"
                    ],

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
                        "{Sujet} pivote à gauche pour regarder {Cible}",
                        "{Sujet} effectue une rotation vers sa gauche",
                        "{Sujet} tourne vers sa gauche pour changer de direction",
                        "{Sujet} réalise un pivot gauche",
                        "{Sujet} fait pivoter son corps vers la gauche",
                        "{Sujet} change son orientation en pivotant à gauche",
                        "{Sujet} tourne sur son appui vers la gauche",
                        "{Sujet} effectue un mouvement de pivot vers sa gauche",
                        "{Sujet} pivote sur place vers la gauche",
                        "{Sujet} tourne rapidement vers sa gauche",
                        "{Sujet} effectue une rotation du corps vers la gauche",
                        "{Sujet} se réoriente vers la gauche par un pivot",
                        "{Sujet} pivote à gauche afin de faire face à {Cible}",
                        "{Sujet} tourne son axe vers la gauche",
                        "{Sujet} effectue un pivot latéral gauche",
                        "{Sujet} réoriente son corps en tournant à gauche",
                        "{Sujet} se place face à {Cible} en pivotant vers la gauche"
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

                    maniere: "vrille",

                    synonymes: [
                        "vrille",
                        "vriller",
                        "tourne sur lui-même",
                        "rotation sur soi-même",
                        "rotation axiale",
                        "rotation répétée",
                        "tournoiement"
                    ],

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
                        "{Sujet} effectue une rotation sur son axe vers la droite",
                        "{Sujet} vrille dans les airs pour esquiver {Cible}",
                        "{Sujet} tourne plusieurs fois sur lui-même",
                        "{Sujet} réalise une rotation axiale pour changer de position",
                        "{Sujet} effectue une vrille vers la gauche",
                        "{Sujet} se met à tourner sur lui-même dans les airs",
                        "{Sujet} enchaîne plusieurs rotations autour de son axe",
                        "{Sujet} vrille rapidement pour éviter l'attaque",
                        "{Sujet} effectue une rotation continue sur lui-même",
                        "{Sujet} tourne autour de son propre axe",
                        "{Sujet} réalise une vrille aérienne",
                        "{Sujet} se propulse en tournoyant vers {Cible}",
                        "{Sujet} change de trajectoire en effectuant une vrille",
                        "{Sujet} tourne sur lui-même tout en avançant",
                        "{Sujet} effectue plusieurs tours sur son axe pour esquiver {Cible}",
                        "{Sujet} réalise un mouvement de vrille pour se repositionner"
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

                    maniere: "salto",
                    trajectoire: "avant",

                    synonymes: [
                        "salto avant",
                        "salto vers l'avant",
                        "rotation avant",
                        "rotation aérienne avant",
                        "tourne vers l'avant dans les airs"
                    ],

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
                        "{Sujet} réalise une rotation avant dans les airs",
                        "{Sujet} fait un salto vers l'avant pour franchir {Cible}",
                        "{Sujet} part en salto avant pour éviter l'attaque",
                        "{Sujet} tourne dans les airs vers l'avant",
                        "{Sujet} effectue une rotation complète vers l'avant",
                        "{Sujet} s'élance dans les airs et réalise un salto avant",
                        "{Sujet} fait une rotation aérienne avant pour changer de position",
                        "{Sujet} réalise un salto avant au-dessus de {Cible}",
                        "{Sujet} effectue un salto vers l'avant pour atterrir derrière {Cible}",
                        "{Sujet} tourne vers l'avant pendant son saut",
                        "{Sujet} se projette dans les airs avec un salto avant",
                        "{Sujet} passe au-dessus de {Cible} par un salto avant",
                        "{Sujet} réalise une rotation avant pour se repositionner",
                        "{Sujet} effectue un mouvement acrobatique en salto avant",
                        "{Sujet} saute puis effectue une rotation vers l'avant",
                        "{Sujet} termine son déplacement par un salto avant"
                    ]
                },


                arriere: {
                    concept:
                        "Rotation aérienne vers l'arrière.",

                    maniere: "salto",
                    trajectoire: "arriere",

                    synonymes: [
                        "salto arrière",
                        "salto vers l'arrière",
                        "rotation arrière",
                        "rotation aérienne arrière",
                        "tourne vers l'arrière dans les airs"
                    ],

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
                        "{Sujet} effectue un salto arrière dans les airs",
                        "{Sujet} tourne vers l'arrière pendant son saut",
                        "{Sujet} réalise une rotation complète vers l'arrière",
                        "{Sujet} part en salto arrière pour esquiver {Cible}",
                        "{Sujet} se projette dans les airs avec un salto arrière",
                        "{Sujet} effectue une rotation aérienne vers l'arrière",
                        "{Sujet} saute puis tourne vers l'arrière",
                        "{Sujet} fait un salto arrière pour prendre de la distance",
                        "{Sujet} réalise un mouvement acrobatique arrière",
                        "{Sujet} effectue un salto vers l'arrière pour éviter l'attaque",
                        "{Sujet} tourne dans les airs vers l'arrière",
                        "{Sujet} se repositionne par un salto arrière",
                        "{Sujet} réalise une rotation arrière pour s'éloigner de {Cible}",
                        "{Sujet} effectue une rotation aérienne arrière pour retomber plus loin",
                        "{Sujet} fait un salto arrière afin de sortir de portée",
                        "{Sujet} saute et effectue une rotation vers l'arrière",
                        "{Sujet} termine son déplacement par un salto arrière"
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

                    maniere: "flip",
                    trajectoire: "avant",

                    synonymes: [
                        "flip avant",
                        "flip vers l'avant",
                        "rotation avant",
                        "retournement avant",
                        "acrobatique avant"
                    ],

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
                        "{Sujet} réalise un flip aérien vers l'avant",
                        "{Sujet} saute et effectue un flip avant",
                        "{Sujet} part en flip avant pour éviter {Cible}",
                        "{Sujet} tourne dans les airs vers l'avant",
                        "{Sujet} effectue un retournement avant dans les airs",
                        "{Sujet} réalise une rotation complète vers l'avant",
                        "{Sujet} passe au-dessus de {Cible} avec un flip avant",
                        "{Sujet} se projette dans les airs en flip avant",
                        "{Sujet} effectue un mouvement acrobatique vers l'avant",
                        "{Sujet} fait une rotation avant pour se repositionner",
                        "{Sujet} réalise un flip pour retomber derrière {Cible}",
                        "{Sujet} saute par-dessus {Cible} en effectuant un flip avant",
                        "{Sujet} effectue un flip frontal dans les airs",
                        "{Sujet} tourne vers l'avant pendant son saut",
                        "{Sujet} change de position avec un flip avant",
                        "{Sujet} termine son déplacement par un flip vers l'avant"
                    ]
                },


                arriere: {
                    concept:
                        "Flip réalisé vers l'arrière.",

                    maniere: "flip",
                    trajectoire: "arriere",

                    synonymes: [
                        "flip arrière",
                        "flip vers l'arrière",
                        "rotation arrière",
                        "retournement arrière",
                        "acrobatique arrière"
                    ],

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
                        "{Sujet} réalise un flip aérien vers l'arrière",
                        "{Sujet} saute et effectue un flip arrière",
                        "{Sujet} part en flip arrière pour esquiver {Cible}",
                        "{Sujet} tourne dans les airs vers l'arrière",
                        "{Sujet} effectue un retournement arrière dans les airs",
                        "{Sujet} réalise une rotation complète vers l'arrière",
                        "{Sujet} prend de la distance avec un flip arrière",
                        "{Sujet} se projette dans les airs en flip arrière",
                        "{Sujet} effectue un mouvement acrobatique vers l'arrière",
                        "{Sujet} fait une rotation arrière pour se repositionner",
                        "{Sujet} réalise un flip pour retomber plus loin",
                        "{Sujet} effectue un flip arrière afin d'éviter {Cible}",
                        "{Sujet} tourne vers l'arrière pendant son saut",
                        "{Sujet} change de position avec un flip arrière",
                        "{Sujet} réalise un retournement aérien vers l'arrière",
                        "{Sujet} termine son déplacement par un flip vers l'arrière"
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
