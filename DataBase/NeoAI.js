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

                                                                       ],
//==============================================================
// 🎮 NEO ACTION MODELS
//==============================================================
// ACTION      = concept d'action canonique
// TRAJECTOIRE = manière géométrique / orientation d'exécution
// CONCEPT     = définition sémantique de l'action
//
// Les champs de "structure" sont OBLIGATOIRES.
// Les champs non présents dans la structure sont facultatifs.
//
// IMPORTANT :
// - MANIERE n'est plus utilisé.
// - Le moteur doit déduire ACTION à partir du concept,
//   des synonymes et des formulations.
// - TRAJECTOIRE décrit comment l'action se déroule.
//==============================================================

// ================================================================
// 🧠 NEO ACTION MODELS
// Base sémantique des actions de NEO
// ================================================================

const NEO_ACTION_MODELS = {

    // ============================================================
    // 🏃 DÉPLACEMENTS
    // ============================================================

    deplacement: {

        // ==========================================================
        // MARCHE
        // ==========================================================

        marche: {

    categorie: "deplacement",
    id: "MARCHE",

    concept:
        "Déplacement volontaire d'un sujet au sol à pied, généralement à vitesse normale ou modérée.",

    trajectoires: {

        normale: {

            concept:
                "Progression régulière au sol sans accélération explosive.",

            structure: [
                "SUJET",
                "ACTION",
                "DIRECTION",
                "DISTANCE",
                "INTENTION"
            ],

            exemples: [

                // 1. Sujet + verbe simple
                "{Sujet} marche.",

                // 2. Synonyme du verbe
                "{Sujet} avance à pied.",

                // 3. Formulation naturelle
                "{Sujet} se dirige tranquillement vers {Cible}.",

                // 4. Formulation technique
                "{Sujet} progresse au sol à pied en direction de {Cible}.",

                // 5. Action + intention
                "{Sujet} marche vers {Cible} pour {Intention}.",

                // 6. Intention + action
                "Pour {Intention}, {Sujet} avance à pied vers {Cible}.",

                // 7. Description du mouvement
                "{Sujet} progresse pas à pas vers {Cible}.",

                // 8. Description du résultat recherché
                "{Sujet} se déplace à pied afin de se rapprocher de {Cible}.",

                // 9. Ordre des mots différent
                "Vers {Cible}, {Sujet} avance à pied.",

                // 10. Formulation courte
                "{Sujet} avance vers {Cible}.",

                // 11. Formulation détaillée
                "{Sujet} avance calmement à pied sur {Distance} en direction de {Cible}.",

                // 12. Avec cible
                "{Sujet} marche en direction de {Cible} sur {Distance}.",

                // 13. Sans cible
                "{Sujet} marche sur {Distance}.",

                // 14. Présence de vitesse
                "{Sujet} marche lentement vers {Cible}.",

                // 15. Présence de direction
                "{Sujet} marche vers la gauche sur {Distance}.",

                // 16. Présence de distance
                "{Sujet} avance à pied sur {Distance}.",

                // 17. Présence de manière
                "{Sujet} marche d'un pas régulier vers {Cible}.",

                // Combinaisons supplémentaires
                "{Sujet} se rapproche de {Cible} en marchant sur {Distance}.",

                "{Sujet} parcourt {Distance} à pied vers {Cible} afin de {Intention}.",

                "{Sujet} avance progressivement vers {Cible}, sans accélération, pour {Intention}."
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
                "Déplacement rapide au sol par course.",

            trajectoires: {

                frontale: {

                    concept:
                        "Course suivant une trajectoire directe vers l'avant.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "DIRECTION",
                        "TRAJECTOIRE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                "{Sujet} court vers {Cible}.",
                "{Sujet} court droit vers {Cible}.",
                "{Sujet} fonce vers {Cible}.",
                "{Sujet} avance en courant vers {Cible}.",
                "{Sujet} se dirige rapidement vers {Cible}.",
                "{Sujet} court en ligne droite vers {Cible}.",
                "{Sujet} court directement en direction de {Cible}.",
                "{Sujet} fonce droit devant lui vers {Cible}.",
                "{Sujet} progresse rapidement vers {Cible} en courant.",
                "{Sujet} accélère en courant vers {Cible}.",
                "{Sujet} court à {Vitesse} vers {Cible}.",
                "{Sujet} fonce à {Vitesse} en direction de {Cible}.",
                "{Sujet} court en ligne droite sur {Distance} vers {Cible}.",
                "{Sujet} parcourt {Distance} en courant vers {Cible}.",
                "{Sujet} court droit sur {Distance} pour {Intention}.",
                "{Sujet} fonce vers {Cible} sur {Distance} afin de {Intention}.",
                "Pour {Intention}, {Sujet} court directement vers {Cible}.",
                "Afin de {Intention}, {Sujet} accélère et court vers {Cible}.",
                "{Sujet} se lance dans une course frontale vers {Cible} à {Vitesse}.",
                "{Sujet} court à {Vitesse} en trajectoire frontale vers {Cible} sur {Distance} pour {Intention}."
            ]
        },


                diagonale: {

                    concept:
                        "Course suivant une trajectoire diagonale.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "DIRECTION",
                        "TRAJECTOIRE",
                        "COTE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                "{Sujet} court en diagonale vers {Cible}.",
                "{Sujet} fonce en diagonale vers {Cible}.",
                "{Sujet} court en diagonale vers la {Cote}.",
                "{Sujet} avance en courant en diagonale vers {Cible}.",
                "{Sujet} se déplace rapidement en diagonale.",
                "{Sujet} court en direction diagonale vers {Cible}.",
                "{Sujet} coupe sa trajectoire en courant vers la {Cote}.",
                "{Sujet} progresse en diagonale vers {Cible}.",
                "{Sujet} fonce vers la {Cote} en diagonale.",
                "{Sujet} court diagonalement vers {Cible}.",
                "{Sujet} court à {Vitesse} en diagonale vers {Cible}.",
                "{Sujet} fonce à {Vitesse} vers la {Cote}.",
                "{Sujet} parcourt {Distance} en diagonale vers {Cible}.",
                "{Sujet} court sur {Distance} en direction de la {Cote}.",
                "{Sujet} court en diagonale vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} court en diagonale vers {Cible}.",
                "{Sujet} se lance en diagonale vers {Cible} à {Vitesse}.",
                "{Sujet} change légèrement d'axe et court en diagonale vers {Cible}.",
                "{Sujet} fonce en diagonale sur {Distance} vers la {Cote} afin de {Intention}.",
                "{Sujet} court à {Vitesse} en trajectoire diagonale vers {Cible} sur {Distance} pour {Intention}."
            ]
        },


                laterale: {

                    concept:
                        "Course parallèle ou principalement orientée latéralement.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "DIRECTION",
                        "TRAJECTOIRE",
                        "COTE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                "{Sujet} court latéralement.",
                "{Sujet} court vers la {Cote}.",
                "{Sujet} se déplace rapidement sur le côté.",
                "{Sujet} court sur le côté vers la {Cote}.",
                "{Sujet} progresse latéralement.",
                "{Sujet} se déplace en courant vers la {Cote}.",
                "{Sujet} court parallèlement vers la {Cote}.",
                "{Sujet} se décale en courant vers la {Cote}.",
                "{Sujet} fonce latéralement vers la {Cote}.",
                "{Sujet} court de côté en direction de {Cible}.",
                "{Sujet} court latéralement à {Vitesse}.",
                "{Sujet} fonce vers la {Cote} à {Vitesse}.",
                "{Sujet} parcourt {Distance} latéralement vers la {Cote}.",
                "{Sujet} court sur {Distance} vers la {Cote}.",
                "{Sujet} court latéralement vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} se déplace rapidement vers la {Cote}.",
                "{Sujet} court de côté vers {Cible} afin de {Intention}.",
                "{Sujet} accélère latéralement en direction de {Cible}.",
                "{Sujet} fonce sur {Distance} vers la {Cote} à {Vitesse}.",
                "{Sujet} court à {Vitesse} latéralement sur {Distance} vers {Cible} pour {Intention}."
            ]
        },


                circulaire: {

                    concept:
                        "Course suivant une trajectoire courbe autour d'un point ou d'une cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "DIRECTION",
                        "TRAJECTOIRE",
                        "COTE",
                        "COURBE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                "{Sujet} court en cercle autour de {Cible}.",
                "{Sujet} court autour de {Cible}.",
                "{Sujet} contourne {Cible} en courant.",
                "{Sujet} tourne autour de {Cible} en courant.",
                "{Sujet} décrit un cercle autour de {Cible}.",
                "{Sujet} progresse en arc de cercle autour de {Cible}.",
                "{Sujet} suit une trajectoire courbe autour de {Cible}.",
                "{Sujet} court en formant une courbe autour de {Cible}.",
                "{Sujet} contourne {Cible} par la {Cote}.",
                "{Sujet} tourne autour de {Cible} vers la {Cote}.",
                "{Sujet} court autour de {Cible} à {Vitesse}.",
                "{Sujet} contourne {Cible} rapidement en courant.",
                "{Sujet} parcourt {Distance} autour de {Cible}.",
                "{Sujet} court en arc de cercle sur {Distance}.",
                "{Sujet} tourne autour de {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} contourne {Cible} en courant.",
                "{Sujet} court autour de {Cible} en passant par la {Cote}.",
                "{Sujet} décrit une trajectoire circulaire autour de {Cible}.",
                "{Sujet} contourne {Cible} à {Vitesse} sur {Distance} afin de {Intention}.",
                "{Sujet} court à {Vitesse} en trajectoire circulaire autour de {Cible} sur {Distance} pour {Intention}."
            ]
        },


                zig_zag: {

                    concept:
                        "Course composée de changements successifs de direction.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "DIRECTION",
                        "TRAJECTOIRE",
                        "INTENTION",
                        "CIBLE",
                        "DISTANCE",
                        "VITESSE"
                    ],

                    exemples: [
                "{Sujet} court en zigzag vers {Cible}.",
                "{Sujet} fonce en zigzag vers {Cible}.",
                "{Sujet} avance en changeant rapidement de direction.",
                "{Sujet} court en alternant ses directions.",
                "{Sujet} progresse en zigzag vers {Cible}.",
                "{Sujet} change plusieurs fois de direction en courant.",
                "{Sujet} court en effectuant des écarts successifs.",
                "{Sujet} se déplace en zigzag pour atteindre {Cible}.",
                "{Sujet} fonce en changeant continuellement de direction.",
                "{Sujet} serpente en courant vers {Cible}.",
                "{Sujet} court en zigzag à {Vitesse}.",
                "{Sujet} fonce à {Vitesse} en zigzag vers {Cible}.",
                "{Sujet} parcourt {Distance} en zigzag vers {Cible}.",
                "{Sujet} court sur {Distance} en changeant de direction.",
                "{Sujet} court en zigzag vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} avance en zigzag vers {Cible}.",
                "{Sujet} alterne gauche et droite en courant vers {Cible}.",
                "{Sujet} multiplie les changements de direction tout en courant.",
                "{Sujet} fonce en zigzag sur {Distance} à {Vitesse} vers {Cible}.",
                "{Sujet} court à {Vitesse} en trajectoire zigzag sur {Distance} vers {Cible} pour {Intention}."
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
                "Accélération explosive et brève permettant de parcourir rapidement une courte distance.",

            trajectoires: {

                frontale: {

                    concept:
                        "Dash explosif en ligne directe.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "DISTANCE",
                        "VITESSE",
                        "INTENTION"
                    ],

                    contraintes: {
                        distance_max: 5,
                        unite: "m"
                    },

                    exemples: [
                "{Sujet} dash directement vers {Cible}.",
                "{Sujet} dash droit vers {Cible}.",
                "{Sujet} effectue un dash vers {Cible}.",
                "{Sujet} part brusquement en direction de {Cible}.",
                "{Sujet} accélère brutalement vers {Cible}.",
                "{Sujet} jaillit vers {Cible} en ligne droite.",
                "{Sujet} bondit en avant sur une courte distance.",
                "{Sujet} propulse son corps vers {Cible}.",
                "{Sujet} effectue une accélération explosive vers {Cible}.",
                "{Sujet} démarre instantanément vers {Cible}.",
                "{Sujet} dash à {Vitesse} vers {Cible}.",
                "{Sujet} accélère à {Vitesse} en direction de {Cible}.",
                "{Sujet} effectue un dash sur {Distance} vers {Cible}.",
                "{Sujet} parcourt rapidement {Distance} en ligne droite.",
                "{Sujet} dash sur {Distance} pour {Intention}.",
                "Pour {Intention}, {Sujet} déclenche un dash vers {Cible}.",
                "{Sujet} jaillit vers {Cible} à {Vitesse}.",
                "{Sujet} accélère brutalement sur {Distance} en direction de {Cible}.",
                "{Sujet} effectue un dash frontal à {Vitesse} vers {Cible}.",
                "{Sujet} dash à pleine vitesse sur {Distance} vers {Cible} afin de {Intention}."
            ]
                },


                diagonale: {

                    concept:
                        "Dash explosif suivant une trajectoire diagonale.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "COTE",
                        "DISTANCE",
                        "VITESSE",
                        "INTENTION"
                    ],

                    contraintes: {
                        distance_max: 5,
                        unite: "m"
                    },

                    exemples: [
                "{Sujet} dash en diagonale vers la {Cote}.",
                "{Sujet} dash diagonal vers {Cible}.",
                "{Sujet} effectue un dash en diagonale.",
                "{Sujet} accélère brusquement en diagonale vers {Cible}.",
                "{Sujet} jaillit en diagonale vers la {Cote}.",
                "{Sujet} part en diagonale vers {Cible}.",
                "{Sujet} se propulse en diagonale vers la {Cote}.",
                "{Sujet} effectue une accélération diagonale vers {Cible}.",
                "{Sujet} dash vers la {Cote} en direction de {Cible}.",
                "{Sujet} bondit rapidement en diagonale vers {Cible}.",
                "{Sujet} dash à {Vitesse} vers la {Cote}.",
                "{Sujet} accélère à {Vitesse} en diagonale vers {Cible}.",
                "{Sujet} effectue un dash sur {Distance} vers la {Cote}.",
                "{Sujet} parcourt {Distance} en diagonale vers {Cible}.",
                "{Sujet} dash en diagonale sur {Distance} pour {Intention}.",
                "Pour {Intention}, {Sujet} déclenche un dash diagonal vers {Cible}.",
                "{Sujet} jaillit à {Vitesse} en diagonale vers la {Cote}.",
                "{Sujet} accélère brutalement sur {Distance} vers {Cible} en diagonale.",
                "{Sujet} effectue un dash diagonal à {Vitesse} vers {Cible}.",
                "{Sujet} dash à pleine vitesse sur {Distance} vers la {Cote} afin de {Intention}."
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
                "Charge offensive rapide et continue destinée à réduire rapidement la distance avec une cible.",

            trajectoires: {

                frontale: {

                    concept:
                        "Charge directe vers une cible.",

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "CIBLE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} rush vers {Cible}.",
                "{Sujet} fonce directement vers {Cible}.",
                "{Sujet} charge vers {Cible}.",
                "{Sujet} se précipite vers {Cible}.",
                "{Sujet} se lance à l'assaut de {Cible}.",
                "{Sujet} charge droit devant vers {Cible}.",
                "{Sujet} fonce en ligne droite sur {Cible}.",
                "{Sujet} se rue vers {Cible}.",
                "{Sujet} réduit rapidement la distance avec {Cible}.",
                "{Sujet} accélère droit vers {Cible} dans une charge continue.",
                "{Sujet} rush à pleine vitesse vers {Cible}.",
                "{Sujet} fonce à {Vitesse} vers {Cible}.",
                "{Sujet} charge sur {Distance} vers {Cible}.",
                "{Sujet} parcourt {Distance} en fonçant vers {Cible}.",
                "{Sujet} rush vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} charge directement vers {Cible}.",
                "{Sujet} se rue sur {Cible} afin de {Intention}.",
                "{Sujet} accélère continuellement vers {Cible} pour {Intention}.",
                "{Sujet} effectue une charge frontale sur {Distance} vers {Cible}.",
                "{Sujet} fonce en charge directe sur {Distance} vers {Cible} afin de {Intention}."
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
                "Action permettant au sujet de quitter momentanément le sol grâce à une impulsion.",

            trajectoires: {

                avant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} saute vers l'avant.",
                "{Sujet} bondit vers l'avant.",
                "{Sujet} effectue un saut en avant.",
                "{Sujet} fait un bond vers l'avant.",
                "{Sujet} se propulse vers l'avant en sautant.",
                "{Sujet} quitte le sol et saute vers l'avant.",
                "{Sujet} prend appui et bondit vers l'avant.",
                "{Sujet} s'élance dans les airs vers l'avant.",
                "{Sujet} effectue un bond en direction de {Cible}.",
                "{Sujet} saute en direction de {Cible}.",
                "{Sujet} saute à une hauteur de {Hauteur} vers l'avant.",
                "{Sujet} bondit à {Hauteur} vers l'avant.",
                "{Sujet} effectue un saut vers l'avant pour {Intention}.",
                "Pour {Intention}, {Sujet} bondit vers l'avant.",
                "{Sujet} se projette vers l'avant dans les airs afin de {Intention}.",
                "{Sujet} prend son impulsion et saute vers {Cible}.",
                "{Sujet} quitte le sol pour se projeter vers l'avant.",
                "{Sujet} bondit vers {Cible} en prenant de la hauteur.",
                "{Sujet} effectue un saut avant jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse vers {Cible} par un saut vers l'avant pour {Intention}."
            ]
                },


                arriere: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} saute vers l'arrière.",
                "{Sujet} bondit en arrière.",
                "{Sujet} effectue un saut arrière.",
                "{Sujet} fait un bond vers l'arrière.",
                "{Sujet} se propulse vers l'arrière en sautant.",
                "{Sujet} quitte le sol et saute en arrière.",
                "{Sujet} prend appui et bondit vers l'arrière.",
                "{Sujet} s'élance dans les airs vers l'arrière.",
                "{Sujet} recule dans les airs en effectuant un saut.",
                "{Sujet} saute en direction de l'arrière.",
                "{Sujet} saute à une hauteur de {Hauteur} vers l'arrière.",
                "{Sujet} bondit à {Hauteur} en arrière.",
                "{Sujet} effectue un saut arrière pour {Intention}.",
                "Pour {Intention}, {Sujet} bondit vers l'arrière.",
                "{Sujet} se projette vers l'arrière afin de {Intention}.",
                "{Sujet} prend son impulsion et saute en arrière.",
                "{Sujet} quitte le sol pour se projeter vers l'arrière.",
                "{Sujet} bondit en arrière tout en prenant de la hauteur.",
                "{Sujet} effectue un saut arrière jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse vers l'arrière par un saut pour {Intention}."
            ]
                },


                vertical: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} saute verticalement.",
                "{Sujet} bondit vers le haut.",
                "{Sujet} effectue un saut vertical.",
                "{Sujet} fait un bond vers le haut.",
                "{Sujet} se propulse directement vers le haut.",
                "{Sujet} quitte le sol à la verticale.",
                "{Sujet} prend appui et bondit vers le ciel.",
                "{Sujet} s'élève dans les airs par un saut.",
                "{Sujet} saute directement vers le haut.",
                "{Sujet} effectue une impulsion verticale.",
                "{Sujet} saute jusqu'à {Hauteur}.",
                "{Sujet} bondit à une hauteur de {Hauteur}.",
                "{Sujet} s'élève de {Hauteur} dans les airs.",
                "{Sujet} effectue un saut vertical pour {Intention}.",
                "Pour {Intention}, {Sujet} bondit verticalement.",
                "{Sujet} se projette vers le haut afin de {Intention}.",
                "{Sujet} prend une forte impulsion et s'élève verticalement.",
                "{Sujet} quitte le sol pour atteindre {Hauteur}.",
                "{Sujet} bondit jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse verticalement dans les airs pour {Intention}."
            ]
                },


                laterale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} saute vers la gauche.",
                "{Sujet} bondit vers la droite.",
                "{Sujet} effectue un saut latéral vers la {Cote}.",
                "{Sujet} fait un bond sur le côté.",
                "{Sujet} se propulse latéralement vers la {Cote}.",
                "{Sujet} quitte le sol en sautant vers la {Cote}.",
                "{Sujet} prend appui et bondit sur le côté.",
                "{Sujet} s'élance dans les airs vers la {Cote}.",
                "{Sujet} saute de côté en direction de {Cible}.",
                "{Sujet} bondit latéralement vers {Cible}.",
                "{Sujet} saute à {Hauteur} vers la {Cote}.",
                "{Sujet} bondit à une hauteur de {Hauteur} sur le côté.",
                "{Sujet} effectue un saut latéral pour {Intention}.",
                "Pour {Intention}, {Sujet} bondit vers la {Cote}.",
                "{Sujet} se projette latéralement afin de {Intention}.",
                "{Sujet} prend son impulsion et saute vers la {Cote}.",
                "{Sujet} quitte le sol pour se déplacer latéralement.",
                "{Sujet} bondit vers {Cible} en prenant de la hauteur sur la {Cote}.",
                "{Sujet} effectue un saut latéral jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse vers {Cible} par un saut latéral vers la {Cote} pour {Intention}."
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
                "Déplacement au sol réalisé par rotation successive du corps.",

            trajectoires: {

                avant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} fait une roulade vers l'avant.",
                "{Sujet} roule vers l'avant.",
                "{Sujet} effectue une roulade avant.",
                "{Sujet} se roule vers l'avant.",
                "{Sujet} plonge au sol et roule vers l'avant.",
                "{Sujet} prend appui et effectue une roulade avant.",
                "{Sujet} se projette au sol en roulant vers l'avant.",
                "{Sujet} enchaîne une roulade vers l'avant.",
                "{Sujet} roule au sol en direction de {Cible}.",
                "{Sujet} effectue une roulade vers {Cible}.",
                "{Sujet} roule sur {Distance} vers l'avant.",
                "{Sujet} parcourt {Distance} en roulade vers {Cible}.",
                "{Sujet} effectue une roulade avant sur {Distance}.",
                "{Sujet} roule rapidement vers {Cible}.",
                "{Sujet} fait une roulade vers l'avant pour {Intention}.",
                "Pour {Intention}, {Sujet} roule vers l'avant.",
                "{Sujet} se projette au sol en roulade afin de {Intention}.",
                "{Sujet} roule vers {Cible} sur {Distance} pour {Intention}.",
                "{Sujet} effectue une roulade avant en direction de {Cible}.",
                "{Sujet} se lance au sol et parcourt {Distance} en roulade vers {Cible} afin de {Intention}."
            ]
                },


                arriere: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                        "{Sujet} fait une roulade arrière.",
                        "{Sujet} roule vers l'arrière."
                    ]
                },


                laterale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "COTE",
                        "DISTANCE",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} fait une roulade arrière.",
                "{Sujet} roule vers l'arrière.",
                "{Sujet} effectue une roulade vers l'arrière.",
                "{Sujet} se roule vers l'arrière.",
                "{Sujet} plonge au sol et roule en arrière.",
                "{Sujet} prend appui et effectue une roulade arrière.",
                "{Sujet} se projette au sol en roulant vers l'arrière.",
                "{Sujet} enchaîne une roulade vers l'arrière.",
                "{Sujet} roule au sol en direction de l'arrière.",
                "{Sujet} effectue une roulade arrière pour reculer.",
                "{Sujet} roule sur {Distance} vers l'arrière.",
                "{Sujet} parcourt {Distance} en roulade arrière.",
                "{Sujet} effectue une roulade arrière sur {Distance}.",
                "{Sujet} roule rapidement vers l'arrière.",
                "{Sujet} fait une roulade arrière pour {Intention}.",
                "Pour {Intention}, {Sujet} roule vers l'arrière.",
                "{Sujet} se projette au sol en roulade afin de {Intention}.",
                "{Sujet} roule vers l'arrière sur {Distance} pour {Intention}.",
                "{Sujet} effectue une roulade arrière en s'éloignant de {Cible}.",
                "{Sujet} se lance au sol et parcourt {Distance} en roulade arrière afin de {Intention}."
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
                "Déplacement aérien continu sans contact permanent avec le sol.",

            trajectoires: {

                frontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "HAUTEUR",
                        "DISTANCE",
                        "VITESSE",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} vole vers {Cible}.",
                "{Sujet} se déplace dans les airs vers {Cible}.",
                "{Sujet} avance dans les airs en direction de {Cible}.",
                "{Sujet} vole droit vers {Cible}.",
                "{Sujet} se propulse dans les airs vers l'avant.",
                "{Sujet} progresse dans les airs vers {Cible}.",
                "{Sujet} traverse les airs en ligne droite.",
                "{Sujet} avance en volant vers {Cible}.",
                "{Sujet} se dirige dans les airs vers {Cible}.",
                "{Sujet} fonce dans les airs vers {Cible}.",
                "{Sujet} vole à {Vitesse} vers {Cible}.",
                "{Sujet} se déplace dans les airs à {Vitesse}.",
                "{Sujet} vole sur {Distance} vers {Cible}.",
                "{Sujet} parcourt {Distance} dans les airs vers {Cible}.",
                "{Sujet} vole à {Hauteur} vers {Cible}.",
                "{Sujet} se maintient à {Hauteur} et avance vers {Cible}.",
                "{Sujet} vole vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} se propulse dans les airs vers {Cible}.",
                "{Sujet} vole à {Vitesse} sur {Distance} vers {Cible} afin de {Intention}.",
                "{Sujet} se déplace à {Hauteur} et {Vitesse} en trajectoire frontale sur {Distance} vers {Cible} pour {Intention}."
            ]
                },


                diagonale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "DISTANCE",
                        "VITESSE",
                        "INTENTION"
                    ],

                    exemples: [
                "{Sujet} vole en diagonale vers {Cible}.",
                "{Sujet} traverse les airs en diagonale.",
                "{Sujet} se déplace dans les airs en diagonale vers {Cible}.",
                "{Sujet} vole en diagonale vers la {Cote}.",
                "{Sujet} se propulse en diagonale vers {Cible}.",
                "{Sujet} avance dans les airs en direction de la {Cote}.",
                "{Sujet} monte en diagonale vers {Cible}.",
                "{Sujet} descend en diagonale vers {Cible}.",
                "{Sujet} traverse les airs en suivant une trajectoire diagonale.",
                "{Sujet} se dirige en diagonale vers {Cible}.",
                "{Sujet} vole à {Vitesse} en diagonale vers {Cible}.",
                "{Sujet} se déplace à {Vitesse} vers la {Cote}.",
                "{Sujet} vole sur {Distance} en diagonale vers {Cible}.",
                "{Sujet} parcourt {Distance} dans les airs vers la {Cote}.",
                "{Sujet} vole à {Hauteur} en diagonale vers {Cible}.",
                "{Sujet} se déplace à {Hauteur} vers la {Cote}.",
                "{Sujet} vole en diagonale vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} se propulse en diagonale vers {Cible}.",
                "{Sujet} vole à {Vitesse} sur {Distance} vers la {Cote} afin de {Intention}.",
                "{Sujet} se déplace à {Hauteur} et {Vitesse} en trajectoire diagonale sur {Distance} vers {Cible} pour {Intention}."
            ]
                },


                laterale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "TRAJECTOIRE",
                        "DIRECTION",
                        "COTE",
                        "HAUTEUR",
                        "DISTANCE",
                        "VITESSE",
                        "INTENTION"
                    ],

                   exemples: [
                "{Sujet} vole latéralement vers la droite.",
                "{Sujet} vole vers la gauche.",
                "{Sujet} se déplace dans les airs vers la {Cote}.",
                "{Sujet} avance latéralement dans les airs.",
                "{Sujet} se propulse sur le côté vers la {Cote}.",
                "{Sujet} traverse les airs latéralement.",
                "{Sujet} se déplace dans les airs en direction de la {Cote}.",
                "{Sujet} vole de côté vers {Cible}.",
                "{Sujet} progresse latéralement vers {Cible}.",
                "{Sujet} se dirige dans les airs vers la {Cote}.",
                "{Sujet} vole latéralement à {Vitesse}.",
                "{Sujet} se déplace à {Vitesse} vers la {Cote}.",
                "{Sujet} vole sur {Distance} vers la {Cote}.",
                "{Sujet} parcourt {Distance} latéralement dans les airs.",
                "{Sujet} vole à {Hauteur} vers la {Cote}.",
                "{Sujet} maintient une hauteur de {Hauteur} en se déplaçant latéralement.",
                "{Sujet} vole latéralement vers {Cible} pour {Intention}.",
                "Pour {Intention}, {Sujet} se déplace dans les airs vers la {Cote}.",
                "{Sujet} vole à {Vitesse} sur {Distance} vers {Cible} afin de {Intention}.",
                "{Sujet} se déplace à {Hauteur} et {Vitesse} latéralement sur {Distance} vers la {Cote} pour {Intention}."
            ] 
                }
            }
        },

// ==========================================================
// PIVOT
// ==========================================================

pivot: {

    categorie: "deplacement",
    id: "PIVOT",

    concept:
        "Rotation du corps au sol autour d'un appui afin de modifier son orientation selon un angle déterminé.",

    trajectoires: {

        droite: {

            structure: [
                "SUJET",
                "ACTION",
                "COTE",
                "TRAJECTOIRE",
                "ANGLE",
                "VITESSE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} pivote de {Angle}° vers la droite.",
                "{Sujet} pivote rapidement de {Angle}° vers la droite.",
                "{Sujet} pivote lentement de {Angle}° vers la droite.",
                "{Sujet} effectue un pivot de {Angle}° à droite.",
                "{Sujet} tourne de {Angle}° vers la droite à {Vitesse}.",
                "{Sujet} pivote de 60° vers la droite à {Vitesse}.",
                "{Sujet} pivote de 90° vers la droite à {Vitesse}.",
                "{Sujet} effectue une rotation de 90° vers la droite.",
                "{Sujet} tourne son corps de 60° vers la droite.",
                "{Sujet} pivote à droite sur un angle de 90°.",
                "{Sujet} effectue un pivot droit de 90° rapidement.",
                "{Sujet} réalise une rotation de 180° vers la droite.",
                "{Sujet} pivote brusquement de {Angle}° vers la droite.",
                "{Sujet} tourne rapidement de {Angle}° à droite.",
                "{Sujet} prend appui et pivote de {Angle}° vers la droite.",
                "{Sujet} change son orientation de {Angle}° vers la droite à {Vitesse}.",
                "{Sujet} pivote de {Angle}° à droite afin de faire face à {Cible}.",
                "Pour {Intention}, {Sujet} pivote rapidement de {Angle}° vers la droite.",
                "{Sujet} tourne de {Angle}° vers la droite à {Vitesse} pour {Intention}.",
                "{Sujet} prend appui et effectue un pivot de {Angle}° vers la droite à {Vitesse} afin de {Intention}."
            ]
        },


        gauche: {

            structure: [
                "SUJET",
                "ACTION",
                "COTE",
                "TRAJECTOIRE",
                "ANGLE",
                "VITESSE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} pivote de {Angle}° vers la gauche.",
                "{Sujet} pivote rapidement de {Angle}° vers la gauche.",
                "{Sujet} pivote lentement de {Angle}° vers la gauche.",
                "{Sujet} effectue un pivot de {Angle}° à gauche.",
                "{Sujet} tourne de {Angle}° vers la gauche à {Vitesse}.",
                "{Sujet} pivote de 60° vers la gauche à {Vitesse}.",
                "{Sujet} pivote de 90° vers la gauche à {Vitesse}.",
                "{Sujet} effectue une rotation de 90° vers la gauche.",
                "{Sujet} tourne son corps de 60° vers la gauche.",
                "{Sujet} pivote à gauche sur un angle de 90°.",
                "{Sujet} effectue un pivot gauche de 90° rapidement.",
                "{Sujet} réalise une rotation de 180° vers la gauche.",
                "{Sujet} pivote brusquement de {Angle}° vers la gauche.",
                "{Sujet} tourne rapidement de {Angle}° à gauche.",
                "{Sujet} prend appui et pivote de {Angle}° vers la gauche.",
                "{Sujet} change son orientation de {Angle}° vers la gauche à {Vitesse}.",
                "{Sujet} pivote de {Angle}° à gauche afin de faire face à {Cible}.",
                "Pour {Intention}, {Sujet} pivote rapidement de {Angle}° vers la gauche.",
                "{Sujet} tourne de {Angle}° vers la gauche à {Vitesse} pour {Intention}.",
                "{Sujet} prend appui et effectue un pivot de {Angle}° vers la gauche à {Vitesse} afin de {Intention}."
            ]
        }
    }
},
        
// ==========================================================
// VRILLE / PIROUETTE
// ==========================================================

vrille: {

    categorie: "deplacement",
    id: "VRILLE",

    concept:
        "Rotation du corps autour de son axe longitudinal, pouvant être réalisée au sol ou pendant un déplacement, avec un angle de rotation déterminé.",

    trajectoires: {

        rotation: {

            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "ANGLE",
                "VITESSE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} effectue une vrille de {Angle}°.",
                "{Sujet} effectue une pirouette de {Angle}°.",
                "{Sujet} tourne sur lui-même de {Angle}°.",
                "{Sujet} réalise une rotation de {Angle}° sur son axe.",
                "{Sujet} pivote sur son axe de {Angle}°.",
                "{Sujet} effectue une rotation à {Vitesse} de {Angle}°.",
                "{Sujet} tourne rapidement de {Angle}° sur lui-même.",
                "{Sujet} tourne lentement de {Angle}° sur son axe.",
                "{Sujet} réalise une vrille de 180°.",
                "{Sujet} réalise une vrille de 360°.",
                "{Sujet} effectue une pirouette de 180°.",
                "{Sujet} effectue une pirouette de 360°.",
                "{Sujet} tourne de 90° sur son axe à {Vitesse}.",
                "{Sujet} enchaîne une rotation de {Angle}° pendant son déplacement.",
                "{Sujet} se met à tourner sur lui-même de {Angle}°.",
                "{Sujet} effectue plusieurs rotations successives de {Angle}°.",
                "Pour {Intention}, {Sujet} effectue une vrille de {Angle}°.",
                "{Sujet} réalise une pirouette de {Angle}° afin de {Intention}.",
                "{Sujet} tourne sur son axe de {Angle}° à {Vitesse} pour {Intention}.",
                "{Sujet} se propulse tout en effectuant une rotation de {Angle}° à {Vitesse} afin de {Intention}."
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
        "Rotation aérienne du corps autour d'un axe horizontal.",

    trajectoires: {

        avant: {

            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "DIRECTION",
                "HAUTEUR",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} effectue un salto avant.",
                "{Sujet} réalise un salto vers l'avant.",
                "{Sujet} fait une rotation aérienne vers l'avant.",
                "{Sujet} tourne dans les airs vers l'avant.",
                "{Sujet} effectue une rotation avant en plein vol.",
                "{Sujet} se projette dans les airs et réalise un salto avant.",
                "{Sujet} prend appui et effectue un salto vers l'avant.",
                "{Sujet} bondit puis réalise une rotation aérienne vers l'avant.",
                "{Sujet} effectue une rotation complète vers l'avant.",
                "{Sujet} enchaîne un salto avant dans les airs.",
                "{Sujet} effectue un salto avant jusqu'à {Hauteur}.",
                "{Sujet} réalise une rotation aérienne à {Hauteur}.",
                "{Sujet} bondit à {Hauteur} avant d'effectuer un salto.",
                "{Sujet} effectue un salto vers l'avant pour {Intention}.",
                "Pour {Intention}, {Sujet} réalise un salto avant.",
                "{Sujet} se projette dans les airs afin d'effectuer un salto vers l'avant.",
                "{Sujet} prend son impulsion puis tourne vers l'avant dans les airs.",
                "{Sujet} effectue une rotation avant en prenant de la hauteur.",
                "{Sujet} réalise un salto avant jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse dans les airs, atteint {Hauteur} et effectue un salto avant pour {Intention}."
            ]
        },


        arriere: {

            structure: [
                "SUJET",
                "ACTION",
                "TRAJECTOIRE",
                "DIRECTION",
                "HAUTEUR",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} effectue un salto arrière.",
                "{Sujet} réalise un salto vers l'arrière.",
                "{Sujet} fait une rotation aérienne vers l'arrière.",
                "{Sujet} tourne dans les airs vers l'arrière.",
                "{Sujet} effectue une rotation arrière en plein vol.",
                "{Sujet} se projette dans les airs et réalise un salto arrière.",
                "{Sujet} prend appui et effectue un salto vers l'arrière.",
                "{Sujet} bondit puis réalise une rotation aérienne vers l'arrière.",
                "{Sujet} effectue une rotation complète vers l'arrière.",
                "{Sujet} enchaîne un salto arrière dans les airs.",
                "{Sujet} effectue un salto arrière jusqu'à {Hauteur}.",
                "{Sujet} réalise une rotation aérienne à {Hauteur}.",
                "{Sujet} bondit à {Hauteur} avant d'effectuer un salto arrière.",
                "{Sujet} effectue un salto vers l'arrière pour {Intention}.",
                "Pour {Intention}, {Sujet} réalise un salto arrière.",
                "{Sujet} se projette dans les airs afin d'effectuer un salto vers l'arrière.",
                "{Sujet} prend son impulsion puis tourne vers l'arrière dans les airs.",
                "{Sujet} effectue une rotation arrière en prenant de la hauteur.",
                "{Sujet} réalise un salto arrière jusqu'à {Hauteur} afin de {Intention}.",
                "{Sujet} se propulse dans les airs, atteint {Hauteur} et effectue un salto arrière pour {Intention}."
            ]
        }
    }
}, 

    // ============================================================
    // 👊 ATTAQUES — MAINS / BRAS / TÊTE
    // ============================================================

    attaque: {

        // ==========================================================
        // DIRECT
        // ==========================================================

        direct: {

    categorie: "attaque",
    id: "DIRECT",

    concept:
        "Frappe de poing directe exécutée en ligne relativement rectiligne vers la cible.",

    trajectoires: {

        frontale: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE"
            ],

            exemples: [
                "{Sujet} frappe un direct du {Membre} visant le {Zone} de {Cible}.",
                "{Sujet} porte un direct du {Membre} au visage de {Cible}.",
                "{Sujet} lance un direct vers {Cible}.",
                "{Sujet} envoie un direct du {Membre} dans la garde de {Cible}.",
                "{Sujet} décoche un direct droit vers le {Zone} de {Cible}.",
                "{Sujet} frappe rapidement en direct du {Membre} vers {Cible}.",
                "{Sujet} porte un direct puissant du {Membre} au menton de {Cible}.",
                "{Sujet} tend son poing en ligne droite vers le visage de {Cible}.",
                "{Sujet} projette son {Membre} droit devant lui vers {Cible}.",
                "{Sujet} envoie son poing directement vers le {Zone} de {Cible}.",
                "{Sujet} frappe en ligne droite avec son {Membre}.",
                "{Sujet} décoche un direct rapide au visage de {Cible}.",
                "{Sujet} avance son {Membre} pour frapper directement {Cible}.",
                "{Sujet} lance un direct à courte distance vers {Cible}.",
                "{Sujet} porte un direct à longue portée vers le torse de {Cible}.",
                "{Sujet} frappe du {Membre} à grande vitesse vers {Cible}.",
                "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un direct du {Membre}.",
                "{Sujet} décoche rapidement un direct du {Membre} afin de toucher {Cible}.",
                "Afin de repousser {Cible}, {Sujet} porte un direct puissant du {Membre}.",
                "{Sujet} arme brièvement son {Membre} puis projette un direct rapide vers le {Zone} de {Cible}."
            ]
        }
    }
},


        // ==========================================================
        // CROSS
        // ==========================================================

        cross: {

    categorie: "attaque",
    id: "CROSS",

    concept:
        "Frappe de poing directe généralement exécutée avec le bras arrière, traversant la ligne centrale du corps.",

    trajectoires: {

        frontale: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE"
            ],

            exemples: [
                "{Sujet} porte un cross du {Membre} vers le visage de {Cible}.",
                "{Sujet} frappe un cross du droit visant les côtes de {Cible}.",
                "{Sujet} décoche un cross vers le menton de {Cible}.",
                "{Sujet} envoie un cross puissant du {Membre} vers {Cible}.",
                "{Sujet} lance rapidement un cross du bras arrière.",
                "{Sujet} frappe en cross directement au visage de {Cible}.",
                "{Sujet} traverse sa ligne centrale avec un cross du {Membre}.",
                "{Sujet} projette son poing arrière vers le {Zone} de {Cible}.",
                "{Sujet} décoche un cross rapide contre la garde de {Cible}.",
                "{Sujet} porte un cross lourd du {Membre} au torse de {Cible}.",
                "{Sujet} frappe à courte distance avec un cross du {Membre}.",
                "{Sujet} lance un cross à distance vers {Cible}.",
                "{Sujet} engage son épaule puis envoie un cross vers {Cible}.",
                "{Sujet} tourne le bassin et frappe en cross du {Membre}.",
                "{Sujet} transfère son poids vers l'avant pour porter un cross à {Cible}.",
                "Pour toucher le visage de {Cible}, {Sujet} décoche un cross rapide.",
                "{Sujet} lance un cross du {Membre} afin d'ouvrir la garde de {Cible}.",
                "Afin de repousser {Cible}, {Sujet} frappe puissamment en cross.",
                "{Sujet} accélère son mouvement et envoie un cross du {Membre} au menton de {Cible}.",
                "{Sujet} tourne le bassin, engage le bras arrière et projette un cross puissant vers le {Zone} de {Cible}."
            ]
        }
    }
},

        // ==========================================================
        // JAB
        // ==========================================================

        jab: {

    categorie: "attaque",
    id: "JAB",

    concept:
        "Frappe de poing directe, rapide et généralement exécutée avec le membre avant.",

    trajectoires: {

        frontale: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE"
            ],

            exemples: [
                "{Sujet} lance un jab du {Membre} vers le visage de {Cible}.",
                "{Sujet} pique un jab au visage de {Cible}.",
                "{Sujet} envoie rapidement un jab vers {Cible}.",
                "{Sujet} frappe du {Membre} avec un jab direct.",
                "{Sujet} décoche un jab rapide au menton de {Cible}.",
                "{Sujet} tend son poing avant vers le {Zone} de {Cible}.",
                "{Sujet} pique rapidement la garde de {Cible} avec un jab.",
                "{Sujet} porte un jab léger vers le visage de {Cible}.",
                "{Sujet} lance plusieurs jabs rapides vers {Cible}.",
                "{Sujet} frappe en jab à courte distance.",
                "{Sujet} utilise son {Membre} pour toucher directement le {Zone} de {Cible}.",
                "{Sujet} avance légèrement son poing avant vers {Cible}.",
                "{Sujet} projette rapidement son {Membre} vers le visage de {Cible}.",
                "{Sujet} envoie un jab précis vers le {Zone} de {Cible}.",
                "{Sujet} lance un jab à distance pour maintenir {Cible} à portée.",
                "Pour tester la garde de {Cible}, {Sujet} lance un jab du {Membre}.",
                "{Sujet} décoche rapidement un jab afin de toucher le visage de {Cible}.",
                "Afin de maintenir la distance, {Sujet} pique un jab vers {Cible}.",
                "{Sujet} avance son {Membre} rapidement pour atteindre le menton de {Cible}.",
                "{Sujet} lance un jab court et rapide du {Membre} directement vers le {Zone} de {Cible}."
            ]
        }
    }
},


        
               // ==========================================================
        // CROCHET
        // ==========================================================

        crochet: {

            categorie: "attaque",
            id: "CROCHET",

            concept:
                "Frappe circulaire du poing dont la trajectoire contourne partiellement l'axe central.",

            trajectoires: {

                horizontal: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} fait un crochet du {Membre} vers la {Direction} visant le {Zone} de {Cible}.",
                        "{Sujet} lance un crochet horizontal du {Membre} vers la {Direction} en visant {Cible}.",
                        "{Sujet} frappe en crochet du {Membre} vers la {Direction}.",
                        "{Sujet} décoche un crochet horizontal au visage de {Cible}.",
                        "{Sujet} balance son poing en crochet vers la {Direction} au {Zone} de {Cible}.",
                        "{Sujet} porte un crochet rapide du {Membre} vers {Cible}.",
                        "{Sujet} frappe latéralement avec un crochet du {Membre} vers la {Direction}.",
                        "{Sujet} fait tourner son poing vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} lance un crochet puissant vers la {Direction} aux côtes de {Cible}.",
                        "{Sujet} envoie un crochet court vers la tête de {Cible}.",
                        "{Sujet} frappe en crochet à courte distance vers la {Direction}.",
                        "{Sujet} décoche un crochet large vers {Cible}.",
                        "{Sujet} pivote le bras et lance un crochet vers la {Direction}.",
                        "{Sujet} contourne la garde de {Cible} avec un crochet du {Membre}.",
                        "{Sujet} balaie horizontalement avec son {Membre} vers {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un crochet vers la {Direction}.",
                        "{Sujet} décoche rapidement un crochet afin de contourner la garde de {Cible}.",
                        "Afin de frapper sur le côté, {Sujet} porte un crochet du {Membre} vers la {Direction}.",
                        "{Sujet} engage son épaule et projette un crochet puissant vers le {Zone} de {Cible}.",
                        "{Sujet} effectue un mouvement circulaire du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance un crochet oblique du {Membre} vers la {Direction}.",
                        "{Sujet} porte un crochet oblique vers le {Zone} de {Cible}.",
                        "{Sujet} frappe en crochet oblique du {Membre} vers {Cible}.",
                        "{Sujet} décoche un crochet oblique vers la {Direction}.",
                        "{Sujet} balance son poing en crochet oblique vers {Cible}.",
                        "{Sujet} porte rapidement un crochet oblique vers la {Direction}.",
                        "{Sujet} lance un crochet oblique puissant vers le {Zone} de {Cible}.",
                        "{Sujet} frappe en oblique avec son {Membre} vers {Cible}.",
                        "{Sujet} incline sa trajectoire et lance un crochet vers la {Direction}.",
                        "{Sujet} fait monter son crochet en oblique vers le {Zone} de {Cible}.",
                        "{Sujet} fait descendre son crochet en oblique vers {Cible}.",
                        "{Sujet} décoche un crochet oblique à courte distance.",
                        "{Sujet} frappe diagonalement avec un crochet vers la {Direction}.",
                        "{Sujet} contourne la garde de {Cible} avec un crochet oblique.",
                        "{Sujet} projette son {Membre} en arc oblique vers {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un crochet oblique vers la {Direction}.",
                        "{Sujet} décoche rapidement un crochet oblique afin de contourner la garde de {Cible}.",
                        "Afin de frapper en angle, {Sujet} porte un crochet oblique du {Membre} vers la {Direction}.",
                        "{Sujet} engage son épaule et projette un crochet oblique vers le {Zone} de {Cible}.",
                        "{Sujet} effectue un mouvement circulaire oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                },

                montant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} lance un crochet montant vers {Cible}.",
                        "{Sujet} frappe en crochet montant du {Membre}.",
                        "{Sujet} remonte son poing en crochet vers le visage de {Cible}.",
                        "{Sujet} porte un crochet montant au menton de {Cible}.",
                        "{Sujet} décoche un crochet ascendant du {Membre}.",
                        "{Sujet} frappe rapidement sous la garde de {Cible}.",
                        "{Sujet} fait monter son poing vers le {Zone} de {Cible}.",
                        "{Sujet} projette un crochet montant vers le menton de {Cible}.",
                        "{Sujet} lance un crochet court en remontant vers {Cible}.",
                        "{Sujet} frappe du {Membre} sous la ligne de défense de {Cible}.",
                        "{Sujet} remonte brusquement son poing vers le visage de {Cible}.",
                        "{Sujet} porte un crochet ascendant puissant.",
                        "{Sujet} envoie son {Membre} vers le haut en crochet.",
                        "{Sujet} frappe sous la garde avec un crochet montant.",
                        "{Sujet} dégage la garde de {Cible} avec un crochet ascendant.",
                        "Pour atteindre le menton de {Cible}, {Sujet} lance un crochet montant.",
                        "{Sujet} remonte rapidement son {Membre} afin de toucher le {Zone} de {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte un crochet montant.",
                        "{Sujet} fléchit légèrement puis projette un crochet montant vers {Cible}.",
                        "{Sujet} remonte son {Membre} avec puissance pour frapper le {Zone} de {Cible}."
                    ]
                },

                descendant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} lance un crochet descendant.",
                        "{Sujet} frappe en crochet descendant vers {Cible}.",
                        "{Sujet} abat son poing en crochet sur {Cible}.",
                        "{Sujet} porte un crochet descendant au sommet de la garde de {Cible}.",
                        "{Sujet} frappe du {Membre} en descendant vers {Cible}.",
                        "{Sujet} rabat son poing vers le {Zone} de {Cible}.",
                        "{Sujet} décoche un crochet descendant puissant.",
                        "{Sujet} fait tomber son {Membre} en crochet vers {Cible}.",
                        "{Sujet} frappe rapidement de haut en bas avec un crochet.",
                        "{Sujet} porte un crochet descendant vers la tête de {Cible}.",
                        "{Sujet} abat son poing vers le visage de {Cible}.",
                        "{Sujet} lance un crochet descendant à courte distance.",
                        "{Sujet} rabat brusquement son {Membre} vers {Cible}.",
                        "{Sujet} frappe au-dessus de la garde avec un crochet descendant.",
                        "{Sujet} projette son poing vers le {Zone} de {Cible} en suivant une trajectoire descendante.",
                        "Pour frapper le haut du corps de {Cible}, {Sujet} lance un crochet descendant.",
                        "{Sujet} abat rapidement son {Membre} afin d'atteindre {Cible}.",
                        "Afin de passer au-dessus de la garde, {Sujet} porte un crochet descendant.",
                        "{Sujet} charge son bras puis rabat son {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} effectue un mouvement circulaire descendant du {Membre} pour frapper {Cible}."
                    ]
                }
            }
        }, 


               // ==========================================================
        // UPPERCUT
        // ==========================================================

        uppercut: {

            categorie: "attaque",
            id: "UPPERCUT",

            concept:
                "Frappe de poing ascendante visant généralement une cible située au-dessus de la ligne d'impact.",

            trajectoires: {

                ascendant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} porte un uppercut du {Membre} au menton de {Cible}.",
                        "{Sujet} remonte son poing sous le menton de {Cible}.",
                        "{Sujet} lance un uppercut vers le visage de {Cible}.",
                        "{Sujet} frappe en uppercut du {Membre} vers {Cible}.",
                        "{Sujet} remonte rapidement son {Membre} vers le menton de {Cible}.",
                        "{Sujet} porte un uppercut puissant sous la garde de {Cible}.",
                        "{Sujet} projette son poing vers le haut pour atteindre {Cible}.",
                        "{Sujet} décoche un uppercut ascendant vers le {Zone} de {Cible}.",
                        "{Sujet} frappe sous la ligne de défense de {Cible}.",
                        "{Sujet} fait remonter son {Membre} vers le visage de {Cible}.",
                        "{Sujet} lance un uppercut court au menton de {Cible}.",
                        "{Sujet} porte rapidement un uppercut vers {Cible}.",
                        "{Sujet} remonte brusquement son poing vers le {Zone} de {Cible}.",
                        "{Sujet} frappe de bas en haut avec son {Membre}.",
                        "{Sujet} glisse son poing sous la garde de {Cible} avec un uppercut.",
                        "Pour atteindre le menton de {Cible}, {Sujet} lance un uppercut.",
                        "{Sujet} remonte rapidement son {Membre} afin de frapper le {Zone} de {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte un uppercut puissant.",
                        "{Sujet} fléchit puis projette son {Membre} vers le haut pour atteindre {Cible}.",
                        "{Sujet} concentre sa frappe vers le haut afin d'atteindre le {Zone} de {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} porte un uppercut oblique vers la {Direction} sur {Cible}.",
                        "{Sujet} frappe en uppercut oblique du {Membre} vers {Cible}.",
                        "{Sujet} lance un uppercut oblique vers la {Direction}.",
                        "{Sujet} décoche un uppercut oblique au {Zone} de {Cible}.",
                        "{Sujet} remonte son poing en oblique vers la {Direction}.",
                        "{Sujet} porte un uppercut oblique du {Membre} vers le visage de {Cible}.",
                        "{Sujet} frappe obliquement vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} projette son {Membre} en uppercut oblique vers {Cible}.",
                        "{Sujet} lance un uppercut ascendant oblique vers la {Direction}.",
                        "{Sujet} remonte son poing en angle vers le {Zone} de {Cible}.",
                        "{Sujet} frappe sous la garde avec un uppercut oblique vers {Cible}.",
                        "{Sujet} décoche rapidement un uppercut oblique vers la {Direction}.",
                        "{Sujet} porte un uppercut oblique puissant au visage de {Cible}.",
                        "{Sujet} fait monter son {Membre} en diagonale vers la {Direction}.",
                        "{Sujet} projette son poing vers le haut et la {Direction} pour atteindre {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un uppercut oblique vers la {Direction}.",
                        "{Sujet} remonte rapidement son {Membre} afin de frapper {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte un uppercut oblique vers la {Direction}.",
                        "{Sujet} fléchit puis projette son {Membre} vers le haut et la {Direction}.",
                        "{Sujet} concentre sa frappe vers le haut et la {Direction} pour atteindre le {Zone} de {Cible}."
                    ]
                }
            }
        }, 

        // ==========================================================
        // OVERHAND
        // ==========================================================

        overhand: {

            categorie: "attaque",
            id: "OVERHAND",

            concept:
                "Frappe de poing arquée passant au-dessus de la garde avant de redescendre vers la cible.",

            trajectoires: {

                descendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} lance un overhand du {Membre} vers le visage de {Cible}.",
                        "{Sujet} frappe en overhand descendant.",
                        "{Sujet} abat un overhand vers le {Zone} de {Cible}.",
                        "{Sujet} porte un overhand du {Membre} au visage de {Cible}.",
                        "{Sujet} fait passer son poing au-dessus de la garde de {Cible}.",
                        "{Sujet} lance un overhand puissant vers {Cible}.",
                        "{Sujet} frappe en overhand en redescendant vers {Cible}.",
                        "{Sujet} projette son {Membre} en arc vers le visage de {Cible}.",
                        "{Sujet} abat son poing en overhand sur {Cible}.",
                        "{Sujet} fait passer son poing par-dessus la garde avant de frapper {Cible}.",
                        "{Sujet} décoche un overhand descendant vers le {Zone} de {Cible}.",
                        "{Sujet} frappe rapidement en overhand vers {Cible}.",
                        "{Sujet} lance un overhand large au visage de {Cible}.",
                        "{Sujet} contourne la garde de {Cible} avec un overhand.",
                        "{Sujet} rabat son {Membre} vers le {Zone} de {Cible} en overhand.",
                        "Pour passer au-dessus de la garde de {Cible}, {Sujet} lance un overhand.",
                        "{Sujet} projette rapidement son {Membre} afin d'atteindre le {Zone} de {Cible}.",
                        "Afin de contourner la garde, {Sujet} porte un overhand puissant.",
                        "{Sujet} arme son bras puis abat son {Membre} vers {Cible}.",
                        "{Sujet} effectue une trajectoire arquée descendante du {Membre} pour frapper {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // BACKFIST
        // ==========================================================

        backfist: {

            categorie: "attaque",
            id: "BACKFIST",

            concept:
                "Frappe utilisant le dos du poing avec un mouvement de rotation ou de balayage.",

            trajectoires: {

                horizontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} frappe avec un backfist du {Membre} vers la {Direction}.",
                        "{Sujet} effectue un backfist horizontal vers {Cible}.",
                        "{Sujet} lance un backfist vers la {Direction} au visage de {Cible}.",
                        "{Sujet} frappe latéralement avec le dos de son poing.",
                        "{Sujet} porte un backfist du {Membre} vers {Cible}.",
                        "{Sujet} balaie horizontalement avec son {Membre} vers {Cible}.",
                        "{Sujet} décoche un backfist rapide vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec un backfist.",
                        "{Sujet} fait pivoter son bras et lance un backfist vers {Cible}.",
                        "{Sujet} balance le dos de son poing vers la {Direction}.",
                        "{Sujet} porte un backfist puissant au visage de {Cible}.",
                        "{Sujet} frappe en rotation avec son {Membre} vers {Direction}.",
                        "{Sujet} lance un backfist latéral à courte distance.",
                        "{Sujet} balaie le {Zone} de {Cible} avec un backfist.",
                        "{Sujet} fait passer le dos de son poing vers la {Direction}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un backfist vers la {Direction}.",
                        "{Sujet} pivote rapidement son bras afin de frapper {Cible} avec un backfist.",
                        "Afin de toucher le côté de {Cible}, {Sujet} porte un backfist vers la {Direction}.",
                        "{Sujet} engage son épaule et balaie son {Membre} vers {Cible}.",
                        "{Sujet} effectue une rotation du bras vers la {Direction} pour frapper {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance un backfist oblique vers la {Direction}.",
                        "{Sujet} frappe en backfist oblique vers {Cible}.",
                        "{Sujet} porte un backfist oblique du {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} décoche un backfist oblique vers la {Direction}.",
                        "{Sujet} frappe avec le dos de son poing selon une trajectoire oblique.",
                        "{Sujet} projette son {Membre} en oblique vers {Cible}.",
                        "{Sujet} balance un backfist oblique vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec un backfist oblique.",
                        "{Sujet} fait pivoter son bras et lance un backfist oblique.",
                        "{Sujet} porte rapidement un backfist oblique vers {Cible}.",
                        "{Sujet} fait monter son backfist en oblique vers la {Direction}.",
                        "{Sujet} fait descendre son backfist en oblique vers {Cible}.",
                        "{Sujet} frappe en angle avec le dos de son poing vers la {Direction}.",
                        "{Sujet} contourne la garde de {Cible} avec un backfist oblique.",
                        "{Sujet} balaie son {Membre} en oblique vers le {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un backfist oblique vers la {Direction}.",
                        "{Sujet} pivote rapidement son bras afin de frapper {Cible} avec un backfist oblique.",
                        "Afin de contourner la garde, {Sujet} porte un backfist oblique vers la {Direction}.",
                        "{Sujet} engage son épaule et projette son {Membre} en oblique vers {Cible}.",
                        "{Sujet} effectue un mouvement de rotation oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                }
            }
        },
        
        // ==========================================================
        // HAMMERFIST
        // ==========================================================

        hammerfist: {

            categorie: "attaque",
            id: "HAMMERFIST",

            concept:
                "Frappe réalisée avec le côté inférieur ou externe du poing fermé, pouvant suivre une trajectoire ascendante, descendante, horizontale ou oblique.",

            trajectoires: {

                ascendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} remonte son hammerfist vers {Cible}.",
                        "{Sujet} frappe en hammerfist ascendant.",
                        "{Sujet} porte un hammerfist ascendant au {Zone} de {Cible}.",
                        "{Sujet} projette son {Membre} vers le haut contre {Cible}.",
                        "{Sujet} remonte son poing en marteau vers le visage de {Cible}.",
                        "{Sujet} frappe de bas en haut avec un hammerfist.",
                        "{Sujet} lance un hammerfist montant sous la garde de {Cible}.",
                        "{Sujet} fait remonter son {Membre} vers {Cible}.",
                        "{Sujet} porte rapidement un hammerfist ascendant.",
                        "{Sujet} frappe le {Zone} de {Cible} en remontant son poing.",
                        "{Sujet} soulève son {Membre} en hammerfist vers {Cible}.",
                        "{Sujet} projette son poing en marteau vers le haut.",
                        "{Sujet} remonte brusquement son poing vers le {Zone} de {Cible}.",
                        "{Sujet} frappe sous la garde avec un hammerfist ascendant.",
                        "{Sujet} porte une frappe montante avec son {Membre}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} remonte son hammerfist.",
                        "{Sujet} remonte rapidement son {Membre} afin de frapper {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte un hammerfist ascendant.",
                        "{Sujet} fléchit puis projette son {Membre} vers le haut pour atteindre {Cible}.",
                        "{Sujet} concentre sa frappe vers le haut afin d'atteindre le {Zone} de {Cible}."
                    ]
                },

                descendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} abat un hammerfist sur {Cible}.",
                        "{Sujet} frappe avec le poing en marteau.",
                        "{Sujet} abat son {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} lance un hammerfist descendant vers {Cible}.",
                        "{Sujet} frappe de haut en bas avec un hammerfist.",
                        "{Sujet} porte un hammerfist puissant sur {Cible}.",
                        "{Sujet} rabat son poing vers le {Zone} de {Cible}.",
                        "{Sujet} frappe rapidement avec un hammerfist descendant.",
                        "{Sujet} projette son {Membre} vers le bas sur {Cible}.",
                        "{Sujet} abat son poing en marteau sur {Cible}.",
                        "{Sujet} lance un hammerfist au sommet de la garde de {Cible}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec un hammerfist descendant.",
                        "{Sujet} rabat brusquement son {Membre} vers {Cible}.",
                        "{Sujet} effectue une frappe descendante avec le poing en marteau.",
                        "{Sujet} abat sa frappe vers le {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} abat son {Membre}.",
                        "{Sujet} frappe rapidement vers le bas afin d'atteindre {Cible}.",
                        "Afin de frapper au-dessus de la garde, {Sujet} porte un hammerfist descendant.",
                        "{Sujet} arme son bras puis abat son {Membre} vers {Cible}.",
                        "{Sujet} effectue un mouvement descendant puissant du {Membre} pour frapper {Cible}."
                    ]
                },

                horizontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} frappe horizontalement avec un hammerfist vers la {Direction}.",
                        "{Sujet} lance un hammerfist horizontal vers {Cible}.",
                        "{Sujet} porte un hammerfist horizontal du {Membre} vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec un hammerfist vers la {Direction}.",
                        "{Sujet} balaie son {Membre} horizontalement vers {Cible}.",
                        "{Sujet} décoche un hammerfist rapide vers la {Direction}.",
                        "{Sujet} frappe de côté avec son poing en marteau.",
                        "{Sujet} projette son {Membre} vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} porte un hammerfist puissant vers le côté de {Cible}.",
                        "{Sujet} fait passer son poing en marteau vers la {Direction}.",
                        "{Sujet} frappe latéralement au {Zone} de {Cible}.",
                        "{Sujet} balance son {Membre} vers la {Direction} avec un hammerfist.",
                        "{Sujet} effectue un mouvement horizontal avec son poing en marteau.",
                        "{Sujet} lance un hammerfist horizontal vers {Cible}.",
                        "{Sujet} balaie le {Zone} de {Cible} avec son {Membre}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un hammerfist vers la {Direction}.",
                        "{Sujet} pivote son bras afin de frapper {Cible} horizontalement.",
                        "Afin de toucher le côté de {Cible}, {Sujet} porte un hammerfist vers la {Direction}.",
                        "{Sujet} engage son épaule et balaie son {Membre} vers {Cible}.",
                        "{Sujet} effectue un mouvement horizontal du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance un hammerfist oblique vers la {Direction}.",
                        "{Sujet} frappe en hammerfist oblique vers {Cible}.",
                        "{Sujet} porte un hammerfist oblique du {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} projette son poing en marteau en oblique vers {Cible}.",
                        "{Sujet} décoche un hammerfist oblique vers la {Direction}.",
                        "{Sujet} frappe avec son {Membre} selon une trajectoire oblique.",
                        "{Sujet} abat son hammerfist en oblique vers {Cible}.",
                        "{Sujet} balance son poing en marteau vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec un hammerfist oblique.",
                        "{Sujet} projette son {Membre} en angle vers {Cible}.",
                        "{Sujet} fait monter son hammerfist en oblique vers la {Direction}.",
                        "{Sujet} fait descendre son hammerfist en oblique vers {Cible}.",
                        "{Sujet} frappe diagonalement avec son poing en marteau.",
                        "{Sujet} contourne la garde de {Cible} avec un hammerfist oblique.",
                        "{Sujet} balaie son {Membre} en oblique vers le {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un hammerfist oblique vers la {Direction}.",
                        "{Sujet} projette rapidement son {Membre} afin de frapper {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte un hammerfist oblique vers la {Direction}.",
                        "{Sujet} engage son épaule et projette son poing en marteau vers {Cible}.",
                        "{Sujet} effectue un mouvement oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                }
            }
        },            

        // ==========================================================
        // PAUME
        // ==========================================================

        paume: {

            categorie: "attaque",
            id: "PAUME",

            concept:
                "Frappe réalisée avec la paume ou le talon de la main.",

            trajectoires: {

                frontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} frappe avec la paume vers le visage de {Cible}.",
                        "{Sujet} pousse violemment sa paume vers {Cible}.",
                        "{Sujet} porte une frappe frontale de la paume au {Zone} de {Cible}.",
                        "{Sujet} projette sa paume directement vers {Cible}.",
                        "{Sujet} frappe avec le talon de sa main vers le visage de {Cible}.",
                        "{Sujet} pousse sa paume contre le {Zone} de {Cible}.",
                        "{Sujet} lance une paume rapide vers {Cible}.",
                        "{Sujet} porte une paume puissante au visage de {Cible}.",
                        "{Sujet} tend sa main et frappe directement {Cible}.",
                        "{Sujet} percute {Cible} avec la paume de sa main.",
                        "{Sujet} envoie sa paume vers le {Zone} de {Cible}.",
                        "{Sujet} frappe droit devant avec sa paume.",
                        "{Sujet} projette rapidement sa main ouverte vers {Cible}.",
                        "{Sujet} pousse violemment le {Zone} de {Cible} avec sa paume.",
                        "{Sujet} porte une frappe directe de la paume à courte distance.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} projette sa paume vers l'avant.",
                        "{Sujet} avance sa main rapidement afin de frapper {Cible}.",
                        "Afin de repousser {Cible}, {Sujet} pousse sa paume contre son {Zone}.",
                        "{Sujet} arme sa main puis la projette directement vers {Cible}.",
                        "{Sujet} concentre sa frappe dans la paume pour atteindre le {Zone} de {Cible}."
                    ]
                },

                ascendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} remonte sa paume sous le menton de {Cible}.",
                        "{Sujet} frappe avec une paume ascendante.",
                        "{Sujet} porte une paume ascendante au visage de {Cible}.",
                        "{Sujet} remonte rapidement sa paume vers le {Zone} de {Cible}.",
                        "{Sujet} projette le talon de sa main vers le menton de {Cible}.",
                        "{Sujet} frappe de bas en haut avec sa paume.",
                        "{Sujet} lance une paume montante sous la garde de {Cible}.",
                        "{Sujet} fait remonter sa main vers le visage de {Cible}.",
                        "{Sujet} porte une paume puissante vers le menton de {Cible}.",
                        "{Sujet} soulève sa paume pour atteindre {Cible}.",
                        "{Sujet} frappe rapidement vers le haut avec sa main ouverte.",
                        "{Sujet} remonte son {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} projette sa paume sous la garde de {Cible}.",
                        "{Sujet} porte une frappe ascendante de la paume.",
                        "{Sujet} fait monter sa main ouverte vers {Cible}.",
                        "Pour atteindre le menton de {Cible}, {Sujet} remonte sa paume.",
                        "{Sujet} remonte rapidement son {Membre} afin de toucher le {Zone} de {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte une paume ascendante.",
                        "{Sujet} fléchit puis projette sa paume vers le haut pour atteindre {Cible}.",
                        "{Sujet} concentre sa frappe vers le haut afin d'atteindre le {Zone} de {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance une paume oblique vers la {Direction}.",
                        "{Sujet} frappe avec sa paume en oblique vers {Cible}.",
                        "{Sujet} porte une paume oblique du {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} projette sa paume vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} frappe en angle avec la paume vers {Cible}.",
                        "{Sujet} décoche rapidement une paume oblique vers la {Direction}.",
                        "{Sujet} pousse sa paume en oblique vers le {Zone} de {Cible}.",
                        "{Sujet} frappe diagonalement avec sa paume vers {Cible}.",
                        "{Sujet} incline sa trajectoire et projette sa paume vers la {Direction}.",
                        "{Sujet} porte une paume oblique puissante au visage de {Cible}.",
                        "{Sujet} fait monter sa paume en oblique vers la {Direction}.",
                        "{Sujet} fait descendre sa paume en oblique vers {Cible}.",
                        "{Sujet} projette le talon de sa main en oblique vers {Cible}.",
                        "{Sujet} contourne la garde de {Cible} avec une paume oblique.",
                        "{Sujet} balaie son {Membre} en oblique vers le {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance une paume oblique vers la {Direction}.",
                        "{Sujet} projette rapidement sa paume afin de frapper {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte une paume oblique vers la {Direction}.",
                        "{Sujet} engage son bras et projette sa paume en oblique vers {Cible}.",
                        "{Sujet} effectue un mouvement oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // TRANCHANT
        // ==========================================================

        tranchant: {

            categorie: "attaque",
            id: "TRANCHANT",

            concept:
                "Frappe réalisée avec le tranchant de la main.",

            trajectoires: {

                horizontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} frappe avec le tranchant de la main vers la {Direction}.",
                        "{Sujet} porte une frappe horizontale du tranchant vers {Cible}.",
                        "{Sujet} balaie horizontalement avec le tranchant vers {Cible}.",
                        "{Sujet} lance une frappe du tranchant vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec le tranchant.",
                        "{Sujet} décoche rapidement une frappe horizontale vers {Cible}.",
                        "{Sujet} porte un tranchant du {Membre} vers la {Direction}.",
                        "{Sujet} balaie le {Zone} de {Cible} avec sa main.",
                        "{Sujet} frappe latéralement avec le tranchant de sa main.",
                        "{Sujet} projette son {Membre} horizontalement vers {Cible}.",
                        "{Sujet} fait passer le tranchant de sa main vers la {Direction}.",
                        "{Sujet} frappe de côté avec le tranchant vers {Cible}.",
                        "{Sujet} lance un tranchant puissant vers le {Zone} de {Cible}.",
                        "{Sujet} effectue un balayage horizontal du tranchant vers la {Direction}.",
                        "{Sujet} porte une frappe rapide du tranchant au visage de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance le tranchant vers la {Direction}.",
                        "{Sujet} balaie rapidement avec son {Membre} afin de frapper {Cible}.",
                        "Afin de toucher le côté de {Cible}, {Sujet} porte une frappe horizontale vers la {Direction}.",
                        "{Sujet} engage son bras et projette le tranchant vers {Cible}.",
                        "{Sujet} effectue un mouvement horizontal du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                },

                descendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} abat le tranchant de sa main sur {Cible}.",
                        "{Sujet} frappe de haut en bas avec le tranchant.",
                        "{Sujet} porte une frappe descendante au {Zone} de {Cible}.",
                        "{Sujet} rabat sa main vers {Cible}.",
                        "{Sujet} abat son {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} lance un tranchant descendant sur {Cible}.",
                        "{Sujet} frappe rapidement de haut en bas.",
                        "{Sujet} projette le tranchant de sa main vers le bas.",
                        "{Sujet} porte un tranchant puissant sur {Cible}.",
                        "{Sujet} rabat brusquement sa main vers le {Zone} de {Cible}.",
                        "{Sujet} frappe au-dessus de la garde avec le tranchant.",
                        "{Sujet} abat sa main vers le visage de {Cible}.",
                        "{Sujet} descend son {Membre} rapidement vers {Cible}.",
                        "{Sujet} effectue une frappe descendante avec le tranchant.",
                        "{Sujet} écrase sa trajectoire vers le {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} abat son tranchant.",
                        "{Sujet} frappe rapidement vers le bas afin d'atteindre {Cible}.",
                        "Afin de passer au-dessus de la garde, {Sujet} porte un tranchant descendant.",
                        "{Sujet} arme son bras puis abat son {Membre} vers {Cible}.",
                        "{Sujet} effectue un mouvement descendant puissant du {Membre} pour frapper {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance une frappe oblique du tranchant vers la {Direction}.",
                        "{Sujet} frappe en tranchant oblique vers {Cible}.",
                        "{Sujet} porte un tranchant oblique du {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} projette le tranchant de sa main en oblique vers {Cible}.",
                        "{Sujet} décoche une frappe oblique vers la {Direction}.",
                        "{Sujet} frappe avec son {Membre} selon une trajectoire oblique.",
                        "{Sujet} balaie son tranchant en oblique vers {Cible}.",
                        "{Sujet} porte une frappe en angle vers le {Zone} de {Cible}.",
                        "{Sujet} projette sa main en oblique vers la {Direction}.",
                        "{Sujet} frappe diagonalement avec le tranchant vers {Cible}.",
                        "{Sujet} fait monter son tranchant en oblique vers la {Direction}.",
                        "{Sujet} fait descendre son tranchant en oblique vers {Cible}.",
                        "{Sujet} porte rapidement un tranchant oblique au visage de {Cible}.",
                        "{Sujet} contourne la garde de {Cible} avec une frappe oblique.",
                        "{Sujet} balaie le {Zone} de {Cible} avec son tranchant en oblique.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un tranchant oblique vers la {Direction}.",
                        "{Sujet} projette rapidement son {Membre} afin de frapper {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte un tranchant oblique vers la {Direction}.",
                        "{Sujet} engage son bras et projette son tranchant en oblique vers {Cible}.",
                        "{Sujet} effectue un mouvement oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // COUDE
        // ==========================================================

        coude: {

            categorie: "attaque",
            id: "COUDE",

            concept:
                "Frappe effectuée avec le coude.",

            trajectoires: {

                horizontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} frappe avec son coude vers la {Direction} en visant {Cible}.",
                        "{Sujet} lance un coude horizontal vers la tempe de {Cible}.",
                        "{Sujet} porte un coude horizontal du {Membre} vers {Cible}.",
                        "{Sujet} frappe latéralement avec son coude.",
                        "{Sujet} projette son coude vers la {Direction}.",
                        "{Sujet} balaie horizontalement avec son coude vers {Cible}.",
                        "{Sujet} décoche un coude rapide vers la {Direction}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec son coude.",
                        "{Sujet} pivote son corps et lance un coude horizontal.",
                        "{Sujet} porte un coude puissant vers le visage de {Cible}.",
                        "{Sujet} frappe de côté avec son coude vers la {Direction}.",
                        "{Sujet} projette son {Membre} horizontalement vers {Cible}.",
                        "{Sujet} lance un coude court vers la {Direction}.",
                        "{Sujet} balaie le {Zone} de {Cible} avec son coude.",
                        "{Sujet} effectue un mouvement horizontal du coude vers {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance son coude vers la {Direction}.",
                        "{Sujet} pivote rapidement afin de frapper {Cible} avec un coude horizontal.",
                        "Afin de toucher le côté de {Cible}, {Sujet} porte un coude vers la {Direction}.",
                        "{Sujet} engage son épaule et projette son coude vers {Cible}.",
                        "{Sujet} effectue une rotation du bras vers la {Direction} pour frapper {Cible}."
                    ]
                },

                ascendant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} remonte son coude vers le menton de {Cible}.",
                        "{Sujet} porte un coude ascendant.",
                        "{Sujet} lance un coude montant vers {Cible}.",
                        "{Sujet} frappe de bas en haut avec son coude.",
                        "{Sujet} projette son {Membre} vers le visage de {Cible}.",
                        "{Sujet} remonte rapidement son coude vers le {Zone} de {Cible}.",
                        "{Sujet} porte un coude ascendant puissant.",
                        "{Sujet} frappe sous la garde de {Cible} avec son coude.",
                        "{Sujet} fait monter son coude vers {Cible}.",
                        "{Sujet} lance un coude montant au menton de {Cible}.",
                        "{Sujet} remonte brusquement son {Membre} vers le visage de {Cible}.",
                        "{Sujet} frappe rapidement de bas en haut.",
                        "{Sujet} projette son coude sous la garde de {Cible}.",
                        "{Sujet} porte une frappe ascendante avec son {Membre}.",
                        "{Sujet} remonte son coude afin d'atteindre le {Zone} de {Cible}.",
                        "Pour atteindre le menton de {Cible}, {Sujet} remonte son coude.",
                        "{Sujet} remonte rapidement son {Membre} afin de frapper {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte un coude ascendant.",
                        "{Sujet} fléchit puis projette son coude vers le haut pour atteindre {Cible}.",
                        "{Sujet} concentre sa frappe vers le haut afin d'atteindre le {Zone} de {Cible}."
                    ]
                },

                descendant: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} abat son coude sur {Cible}.",
                        "{Sujet} frappe avec un coude descendant.",
                        "{Sujet} lance un coude descendant vers {Cible}.",
                        "{Sujet} rabat son coude vers le {Zone} de {Cible}.",
                        "{Sujet} frappe de haut en bas avec son coude.",
                        "{Sujet} porte un coude descendant puissant.",
                        "{Sujet} projette son {Membre} vers le bas sur {Cible}.",
                        "{Sujet} abat rapidement son coude vers le visage de {Cible}.",
                        "{Sujet} frappe au-dessus de la garde avec son coude.",
                        "{Sujet} rabat brusquement son {Membre} vers {Cible}.",
                        "{Sujet} porte une frappe descendante au {Zone} de {Cible}.",
                        "{Sujet} abat son coude vers le {Zone} de {Cible}.",
                        "{Sujet} frappe rapidement de haut en bas.",
                        "{Sujet} projette son coude vers le bas pour atteindre {Cible}.",
                        "{Sujet} effectue une frappe descendante avec son {Membre}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} abat son coude.",
                        "{Sujet} abat rapidement son {Membre} afin de frapper {Cible}.",
                        "Afin de passer au-dessus de la garde, {Sujet} porte un coude descendant.",
                        "{Sujet} arme son bras puis rabat son coude vers {Cible}.",
                        "{Sujet} effectue un mouvement descendant puissant du {Membre} pour frapper {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance un coude oblique vers la {Direction}.",
                        "{Sujet} frappe en coude oblique vers {Cible}.",
                        "{Sujet} porte un coude oblique du {Membre} vers le {Zone} de {Cible}.",
                        "{Sujet} projette son coude en oblique vers {Cible}.",
                        "{Sujet} décoche un coude oblique vers la {Direction}.",
                        "{Sujet} frappe avec son coude selon une trajectoire oblique.",
                        "{Sujet} balaie son coude en oblique vers {Cible}.",
                        "{Sujet} porte un coude en angle vers le {Zone} de {Cible}.",
                        "{Sujet} projette son {Membre} en oblique vers la {Direction}.",
                        "{Sujet} frappe diagonalement avec son coude vers {Cible}.",
                        "{Sujet} fait monter son coude en oblique vers la {Direction}.",
                        "{Sujet} fait descendre son coude en oblique vers {Cible}.",
                        "{Sujet} porte rapidement un coude oblique au visage de {Cible}.",
                        "{Sujet} contourne la garde de {Cible} avec un coude oblique.",
                        "{Sujet} balaie le {Zone} de {Cible} avec son coude en oblique.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} lance un coude oblique vers la {Direction}.",
                        "{Sujet} projette rapidement son {Membre} afin de frapper {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte un coude oblique vers la {Direction}.",
                        "{Sujet} engage son épaule et projette son coude en oblique vers {Cible}.",
                        "{Sujet} effectue un mouvement oblique du {Membre} vers la {Direction} pour frapper {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // COUP DE TÊTE
        // ==========================================================

        coup_de_tete: {

            categorie: "attaque",
            id: "COUP_DE_TETE",

            concept:
                "Frappe utilisant la tête comme partie du corps d'impact.",

            trajectoires: {

                frontale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} donne un coup de tête vers le visage de {Cible}.",
                        "{Sujet} percute {Cible} avec son front.",
                        "{Sujet} porte un coup de tête frontal au {Zone} de {Cible}.",
                        "{Sujet} projette son front vers le visage de {Cible}.",
                        "{Sujet} frappe frontalement avec sa tête.",
                        "{Sujet} avance sa tête pour percuter {Cible}.",
                        "{Sujet} percute le {Zone} de {Cible} avec son front.",
                        "{Sujet} lance un coup de tête rapide vers {Cible}.",
                        "{Sujet} frappe directement avec son front.",
                        "{Sujet} porte un coup de tête puissant au visage de {Cible}.",
                        "{Sujet} projette sa tête contre {Cible}.",
                        "{Sujet} percute {Cible} de face avec son front.",
                        "{Sujet} avance brusquement la tête vers {Cible}.",
                        "{Sujet} frappe le {Zone} de {Cible} avec son front.",
                        "{Sujet} porte une percussion frontale avec sa tête.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} projette son front vers l'avant.",
                        "{Sujet} avance rapidement sa tête afin de percuter {Cible}.",
                        "Afin de surprendre {Cible}, {Sujet} porte un coup de tête frontal.",
                        "{Sujet} rapproche son visage puis projette son front vers {Cible}.",
                        "{Sujet} concentre son mouvement vers l'avant pour percuter le {Zone} de {Cible}."
                    ]
                },

                laterale: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} donne un coup de tête latéral vers la {Direction}.",
                        "{Sujet} percute {Cible} avec sa tête sur le côté.",
                        "{Sujet} porte un coup de tête latéral vers le {Zone} de {Cible}.",
                        "{Sujet} projette sa tête vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} frappe de côté avec son front.",
                        "{Sujet} lance un coup de tête vers la {Direction}.",
                        "{Sujet} percute le {Zone} de {Cible} avec le côté de sa tête.",
                        "{Sujet} porte un coup de tête latéral puissant.",
                        "{Sujet} balaie sa tête vers la {Direction} contre {Cible}.",
                        "{Sujet} frappe latéralement le {Zone} de {Cible}.",
                        "{Sujet} incline sa tête et percute {Cible} sur le côté.",
                        "{Sujet} projette brusquement sa tête vers la {Direction}.",
                        "{Sujet} porte une percussion latérale avec sa tête.",
                        "{Sujet} frappe de côté vers le visage de {Cible}.",
                        "{Sujet} effectue un mouvement latéral de la tête vers {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} projette sa tête vers la {Direction}.",
                        "{Sujet} tourne rapidement la tête afin de percuter {Cible}.",
                        "Afin de toucher le côté de {Cible}, {Sujet} porte un coup de tête vers la {Direction}.",
                        "{Sujet} engage son cou et projette sa tête latéralement vers {Cible}.",
                        "{Sujet} effectue un mouvement latéral de la tête vers la {Direction} pour frapper {Cible}."
                    ]
                },

                ascendante: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} remonte la tête vers le visage de {Cible}.",
                        "{Sujet} porte un coup de tête ascendant.",
                        "{Sujet} lance un coup de tête montant vers {Cible}.",
                        "{Sujet} frappe de bas en haut avec son front.",
                        "{Sujet} projette son front vers le visage de {Cible}.",
                        "{Sujet} remonte rapidement sa tête vers le {Zone} de {Cible}.",
                        "{Sujet} porte un coup de tête ascendant puissant.",
                        "{Sujet} frappe sous la garde de {Cible} avec son front.",
                        "{Sujet} fait monter sa tête vers {Cible}.",
                        "{Sujet} lance un coup de tête montant au menton de {Cible}.",
                        "{Sujet} remonte brusquement son front vers le visage de {Cible}.",
                        "{Sujet} frappe rapidement de bas en haut.",
                        "{Sujet} projette son front sous la garde de {Cible}.",
                        "{Sujet} porte une percussion ascendante avec sa tête.",
                        "{Sujet} remonte sa tête afin d'atteindre le {Zone} de {Cible}.",
                        "Pour atteindre le menton de {Cible}, {Sujet} remonte sa tête.",
                        "{Sujet} remonte rapidement sa tête afin de percuter {Cible}.",
                        "Afin de passer sous la garde, {Sujet} porte un coup de tête ascendant.",
                        "{Sujet} fléchit puis projette son front vers le haut pour atteindre {Cible}.",
                        "{Sujet} concentre sa frappe vers le haut afin d'atteindre le {Zone} de {Cible}."
                    ]
                },

                oblique: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} lance un coup de tête oblique vers la {Direction}.",
                        "{Sujet} percute {Cible} avec sa tête en oblique.",
                        "{Sujet} porte un coup de tête oblique vers le {Zone} de {Cible}.",
                        "{Sujet} projette son front en oblique vers {Cible}.",
                        "{Sujet} frappe avec sa tête selon une trajectoire oblique.",
                        "{Sujet} lance son front vers la {Direction} pour atteindre {Cible}.",
                        "{Sujet} percute le {Zone} de {Cible} avec un mouvement oblique de la tête.",
                        "{Sujet} porte un coup de tête oblique puissant.",
                        "{Sujet} balaie sa tête en oblique vers {Cible}.",
                        "{Sujet} frappe en angle avec son front vers la {Direction}.",
                        "{Sujet} projette sa tête vers le haut et la {Direction}.",
                        "{Sujet} projette sa tête vers le bas et la {Direction}.",
                        "{Sujet} frappe diagonalement avec son front vers {Cible}.",
                        "{Sujet} incline sa tête et percute {Cible} selon un angle.",
                        "{Sujet} porte une percussion oblique au {Zone} de {Cible}.",
                        "Pour atteindre le {Zone} de {Cible}, {Sujet} projette son front en oblique vers la {Direction}.",
                        "{Sujet} projette rapidement sa tête afin de percuter {Cible} sous un angle oblique.",
                        "Afin de contourner la garde, {Sujet} porte un coup de tête oblique vers la {Direction}.",
                        "{Sujet} engage son cou et projette son front en oblique vers {Cible}.",
                        "{Sujet} effectue un mouvement oblique de la tête vers la {Direction} pour percuter {Cible}."
                    ]
                }
            }
        }
    },


    // ============================================================
    // 🦵 FRAPPES — JAMBES
    // ============================================================

    frappe_jambe: {

        // ==========================================================
// FRONT KICK
// ==========================================================

front_kick: {

    categorie: "frappe_jambe",
    id: "FRONT_KICK",

    concept:
        "Coup de pied direct et frontal utilisant principalement la poussée de la jambe vers l'avant, avec la semelle ou la plante du pied comme surface d'impact.",

    trajectoires: {

        frontale: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE"
            ],

            exemples: [
                "{Sujet} donne un coup de pied direct avec la semelle de son pied droit au ventre de {Cible}.",
                "{Sujet} frappe frontalement le ventre de {Cible} avec la semelle de son pied.",
                "{Sujet} pousse la semelle de son pied droit directement vers le torse de {Cible}.",
                "{Sujet} porte un coup de pied frontal avec la plante de son pied au plexus de {Cible}.",
                "{Sujet} tend sa jambe gauche et envoie la semelle vers l'abdomen de {Cible}.",
                "{Sujet} propulse son pied droit vers le ventre de {Cible}.",
                "{Sujet} frappe {Cible} avec la semelle de son pied.",
                "{Sujet} envoie son pied droit droit devant vers {Cible}.",
                "{Sujet} pousse la plante de son pied contre le ventre de {Cible}.",
                "{Sujet} lance un coup de pied frontal avec la semelle vers le torse de {Cible}.",
                "{Sujet} frappe directement le buste de {Cible} avec la plante de son pied.",
                "{Sujet} tend rapidement son pied droit, semelle en avant, vers {Cible}.",
                "{Sujet} porte un front kick direct avec la semelle au ventre de {Cible}.",
                "{Sujet} projette sa jambe vers l'avant pour toucher {Cible}.",
                "{Sujet} pousse la plante de son pied gauche droit devant contre {Cible}.",
                "{Sujet} effectue un coup de pied frontal avec la semelle de son pied droit.",
                "{Sujet} frappe le plexus de {Cible} avec la plante de son pied.",
                "{Sujet} avance sa jambe et percute {Cible} avec sa semelle.",
                "{Sujet} envoie la semelle de son pied droit vers l'abdomen de {Cible}.",
                "{Sujet} effectue un coup de pied direct et frontal avec la semelle contre {Cible}."
            ]
        }
    }
},


        // ==========================================================
// LOW KICK
// ==========================================================

low_kick: {

    categorie: "frappe_jambe",
    id: "LOW_KICK",

    concept:
        "Coup de pied circulaire visant principalement les parties basses de la jambe ou de la cuisse de la cible.",

    trajectoires: {

        circulaire: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION"
            ],

            exemples: [
                "{Sujet} donne un low kick avec sa jambe droite à la cuisse de {Cible}.",
                "{Sujet} frappe la cuisse de {Cible} avec un low kick circulaire.",
                "{Sujet} balance sa jambe droite en cercle vers la cuisse de {Cible}.",
                "{Sujet} frappe la jambe gauche de {Cible} avec son tibia.",
                "{Sujet} porte un low kick circulaire à la cuisse droite de {Cible}.",
                "{Sujet} fait tourner sa jambe gauche vers le mollet de {Cible}.",
                "{Sujet} donne un coup de pied circulaire à la cuisse de {Cible}.",
                "{Sujet} projette sa jambe droite en arc vers la cuisse de {Cible}.",
                "{Sujet} frappe le mollet de {Cible} avec un low kick.",
                "{Sujet} envoie son tibia droit contre la cuisse de {Cible}.",
                "{Sujet} effectue un low kick vers la jambe droite de {Cible}.",
                "{Sujet} fouette sa jambe gauche autour de sa cible pour atteindre la cuisse.",
                "{Sujet} frappe la partie basse de la jambe de {Cible} avec un coup circulaire.",
                "{Sujet} fait pivoter sa jambe droite pour frapper le mollet de {Cible}.",
                "{Sujet} porte un low kick du tibia à la cuisse gauche de {Cible}.",
                "{Sujet} balance sa jambe vers l'extérieur pour frapper la cuisse de {Cible}.",
                "{Sujet} frappe latéralement la cuisse de {Cible} avec un mouvement circulaire.",
                "{Sujet} donne un coup de pied circulaire au genou de {Cible}.",
                "{Sujet} projette son tibia gauche vers la cuisse de {Cible}.",
                "{Sujet} exécute un low kick circulaire avec sa jambe droite vers la jambe de {Cible}."
            ]
        }
    }
},

// ==========================================================
// ROUNDHOUSE KICK
// ==========================================================
roundhouse_kick: {
    categorie: "frappe_jambe",
    id: "ROUNDHOUSE_KICK",
    concept:
        "Coup de pied circulaire utilisant une rotation du corps et un pivot du pied d'appui pour générer une trajectoire frontale, circulaire, horizontale ou oblique.",

    trajectoires: {

        frontale: {
            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "COTE",
                "PIVOT"
            ],
            exemples: [
                "{Sujet} effectue un roundhouse kick frontal avec sa jambe droite vers {Cible}, pivot à gauche de 90°.",
                "{Sujet} lance un coup de pied circulaire frontal avec sa jambe gauche vers {Cible}, pivot à droite de 60°.",
                "{Sujet} porte un coup de pied en pivot frontal avec sa jambe droite vers {Cible}, pivot à gauche de 90°.",
                "{Sujet} frappe {Cible} avec un roundhouse kick frontal de la jambe gauche, pivot à droite de 90°.",
                "{Sujet} projette sa jambe droite vers {Cible} pour un coup de pied circulaire frontal, pivot à gauche de 60°.",
                "{Sujet} exécute un coup de pied circulaire avec pivot frontal, jambe droite, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec un roundhouse kick frontal de la jambe gauche, pivot à droite de 60°.",
                "{Sujet} tend sa jambe droite vers {Cible} pour porter un coup de pied circulaire frontal, pivot gauche de 90°.",
                "{Sujet} frappe frontalement {Cible} avec sa jambe droite en pivotant de 60° vers la gauche.",
                "{Sujet} lance un roundhouse kick frontal avec sa jambe gauche, pivot droit de 90° vers {Cible}.",
                "{Sujet} avance sa jambe droite vers {Cible} et déclenche un coup de pied circulaire frontal, pivot gauche de 60°.",
                "{Sujet} envoie sa jambe gauche droit devant {Cible}, avec un pivot de 90° vers la droite.",
                "{Sujet} effectue un coup de pied circulaire frontal de la jambe droite, pied d'appui pivoté à gauche de 90°.",
                "{Sujet} frappe {Cible} de face avec un roundhouse kick de la jambe gauche, pivot droit de 60°.",
                "{Sujet} porte un coup de pied circulaire frontal avec sa jambe droite, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} frontalement avec sa jambe gauche, pivot de 60° vers la droite.",
                "{Sujet} exécute un roundhouse kick frontal de la jambe droite, pivot gauche de 60°, visant {Cible}.",
                "{Sujet} dirige sa jambe gauche vers {Cible} pour porter un coup de pied circulaire frontal, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied en pivot frontal de la jambe droite, pivot gauche de 90°.",
                "{Sujet} lance un coup de pied circulaire frontal avec sa jambe gauche, pivot droit de 60°."
            ]
        },

        circulaire: {
            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "COTE",
                "PIVOT"
            ],
            exemples: [
                "{Sujet} lance un roundhouse kick circulaire avec sa jambe droite vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} effectue un coup de pied circulaire avec sa jambe gauche vers {Cible}, direction droite, pivot droit de 60°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire de la jambe droite, direction gauche, pivot gauche de 90°.",
                "{Sujet} porte un roundhouse kick circulaire de la jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} fait passer sa jambe droite en cercle vers {Cible}, direction gauche, pivot gauche de 60°.",
                "{Sujet} déclenche un coup de pied circulaire avec sa jambe gauche vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un roundhouse kick de la jambe droite, trajectoire circulaire gauche, pivot gauche de 60°.",
                "{Sujet} lance sa jambe gauche dans une trajectoire circulaire vers la droite, pivot droit de 90°.",
                "{Sujet} exécute un coup de pied circulaire de la jambe droite vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec un roundhouse kick circulaire de la jambe gauche, direction droite, pivot droit de 60°.",
                "{Sujet} fait passer sa jambe droite en arc vers la gauche pour frapper {Cible}, pivot gauche de 90°.",
                "{Sujet} porte un coup de pied circulaire avec sa jambe gauche, direction droite, pivot droit de 60°.",
                "{Sujet} frappe {Cible} avec sa jambe droite dans un mouvement circulaire gauche, pivot gauche de 90°.",
                "{Sujet} lance un roundhouse kick de la jambe gauche dans une trajectoire circulaire droite, pivot droit de 90°.",
                "{Sujet} effectue un coup de pied circulaire de la jambe droite vers la gauche, pivot gauche de 60°, visant {Cible}.",
                "{Sujet} attaque {Cible} avec sa jambe gauche dans une trajectoire circulaire droite, pivot droit de 90°.",
                "{Sujet} balance sa jambe droite en cercle vers {Cible}, direction gauche, pivot gauche de 60°.",
                "{Sujet} exécute un roundhouse kick circulaire de la jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire de la jambe droite, arc vers la gauche, pivot gauche de 90°.",
                "{Sujet} déclenche un roundhouse kick de la jambe gauche en trajectoire circulaire droite, pivot droit de 60°."
            ]
        },

        horizontale: {
            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "COTE",
                "PIVOT"
            ],
            exemples: [
                "{Sujet} lance un roundhouse kick horizontal avec sa jambe droite vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire horizontal de la jambe gauche, direction droite, pivot droit de 60°.",
                "{Sujet} effectue un roundhouse kick horizontal avec sa jambe droite vers la gauche, pivot gauche de 90°.",
                "{Sujet} porte un coup de pied circulaire horizontal de la jambe gauche vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} horizontalement avec sa jambe droite, pivot gauche de 60°.",
                "{Sujet} exécute un roundhouse kick horizontal de la jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} balance sa jambe droite horizontalement vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec un coup de pied circulaire horizontal de la jambe gauche, direction droite, pivot droit de 60°.",
                "{Sujet} lance sa jambe droite en arc horizontal vers la gauche, pivot gauche de 60°, contre {Cible}.",
                "{Sujet} effectue un roundhouse kick horizontal de la jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec sa jambe droite dans une trajectoire horizontale gauche, pivot gauche de 90°.",
                "{Sujet} porte un coup de pied circulaire horizontal de la jambe gauche vers la droite, pivot droit de 60°.",
                "{Sujet} exécute un roundhouse kick de la jambe droite horizontalement vers {Cible}, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec sa jambe gauche dans une trajectoire horizontale droite, pivot droit de 90°.",
                "{Sujet} fait passer sa jambe droite horizontalement vers la gauche pour frapper {Cible}, pivot gauche de 60°.",
                "{Sujet} lance un coup de pied circulaire horizontal avec sa jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un roundhouse kick horizontal de la jambe droite, direction gauche, pivot gauche de 60°.",
                "{Sujet} porte sa jambe gauche horizontalement vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} déclenche un roundhouse kick horizontal de la jambe droite vers la gauche, pivot gauche de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire horizontal de la jambe gauche, direction droite, pivot droit de 60°."
            ]
        },

        oblique: {
            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "COTE",
                "PIVOT"
            ],
            exemples: [
                "{Sujet} lance un roundhouse kick oblique avec sa jambe droite vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire oblique de la jambe gauche vers la droite, pivot droit de 60°.",
                "{Sujet} effectue un roundhouse kick oblique avec sa jambe droite, direction gauche, pivot gauche de 90°.",
                "{Sujet} porte un coup de pied circulaire oblique de la jambe gauche vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec sa jambe droite dans une trajectoire oblique gauche, pivot gauche de 60°.",
                "{Sujet} exécute un roundhouse kick oblique de la jambe gauche vers la droite, pivot droit de 90°.",
                "{Sujet} lance sa jambe droite dans une trajectoire oblique vers la gauche pour frapper {Cible}, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec un coup de pied circulaire oblique de la jambe gauche, direction droite, pivot droit de 60°.",
                "{Sujet} balance sa jambe droite dans une trajectoire oblique gauche, pivot gauche de 90°.",
                "{Sujet} porte un roundhouse kick oblique de la jambe gauche vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire oblique de la jambe droite, direction gauche, pivot gauche de 60°.",
                "{Sujet} lance sa jambe gauche obliquement vers la droite, avec un pivot droit de 90°.",
                "{Sujet} effectue un roundhouse kick oblique de la jambe droite vers la gauche, pivot gauche de 90°.",
                "{Sujet} attaque {Cible} avec sa jambe gauche dans une trajectoire oblique droite, pivot droit de 60°.",
                "{Sujet} frappe {Cible} avec sa jambe droite en décrivant une trajectoire oblique gauche, pivot gauche de 90°.",
                "{Sujet} porte un coup de pied circulaire oblique de la jambe gauche vers la droite, pivot droit de 60°.",
                "{Sujet} déclenche un roundhouse kick oblique de la jambe droite vers {Cible}, direction gauche, pivot gauche de 90°.",
                "{Sujet} lance sa jambe gauche obliquement vers {Cible}, direction droite, pivot droit de 90°.",
                "{Sujet} frappe {Cible} avec un coup de pied circulaire oblique de la jambe droite, direction gauche, pivot gauche de 60°.",
                "{Sujet} exécute un roundhouse kick oblique de la jambe gauche vers la droite, pivot droit de 90°."
            ]
        }
    }
}, 
            
// ==========================================================
// SIDE KICK
// ==========================================================

side_kick: {

    categorie: "frappe_jambe",
    id: "SIDE_KICK",

    concept:
        "Coup de pied effectué latéralement avec extension de la jambe.",

    trajectoires: {

        laterale: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION"
            ],

            exemples: [
                "{Sujet} donne un side kick vers les côtes de {Cible}.",
                "{Sujet} frappe latéralement avec son pied vers {Cible}.",
                "{Sujet} projette sa jambe sur le côté pour frapper {Cible}.",
                "{Sujet} étend sa jambe latéralement vers {Cible}.",
                "{Sujet} porte un coup de pied latéral avec son pied droit vers {Cible}.",
                "{Sujet} frappe {Cible} avec un side kick dirigé vers la gauche.",
                "{Sujet} lance un coup de pied latéral vers les côtes de {Cible}.",
                "{Sujet} repousse {Cible} avec un side kick latéral.",
                "{Sujet} tend sa jambe droite sur le côté pour frapper {Cible}.",
                "{Sujet} donne un coup de pied latéral avec sa jambe gauche vers {Cible}.",
                "{Sujet} attaque {Cible} avec un side kick dirigé vers la droite.",
                "{Sujet} étend rapidement sa jambe sur le côté en direction de {Cible}.",
                "{Sujet} frappe {Cible} avec la plante de son pied dans un mouvement latéral.",
                "{Sujet} projette son pied latéralement vers le flanc de {Cible}.",
                "{Sujet} porte un side kick horizontal vers {Cible}.",
                "{Sujet} étend sa jambe sur le côté et frappe {Cible} avec son pied.",
                "{Sujet} lance sa jambe gauche latéralement vers {Cible}.",
                "{Sujet} frappe {Cible} d'un coup de pied latéral avec son pied droit.",
                "{Sujet} dirige son pied sur le côté vers {Cible} pour porter un side kick.",
                "{Sujet} pousse sa jambe latéralement contre {Cible} avec un coup de pied."
            ]
        }
    }
},
        
       // ==========================================================
// AXE KICK
// ==========================================================

axe_kick: {

    categorie: "frappe_jambe",
    id: "AXE_KICK",

    concept:
        "Coup de pied descendant utilisant une trajectoire montante puis descendante.",

    trajectoires: {

        descendante: {

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE"
            ],

            exemples: [
                "{Sujet} lève sa jambe puis l'abat sur {Cible}.",
                "{Sujet} porte un axe kick vers la tête de {Cible}.",
                "{Sujet} lève son pied au-dessus de {Cible} avant de le rabattre vers le bas.",
                "{Sujet} frappe {Cible} avec un coup de pied descendant.",
                "{Sujet} monte sa jambe puis la fait redescendre sur {Cible}.",
                "{Sujet} soulève sa jambe au-dessus de sa cible avant de frapper vers le bas.",
                "{Sujet} abat sa jambe sur {Cible} avec un axe kick.",
                "{Sujet} projette son pied vers le haut puis le rabat sur {Cible}.",
                "{Sujet} lève sa jambe droite et l'abat vers {Cible}.",
                "{Sujet} frappe {Cible} avec sa jambe après l'avoir élevée au-dessus de lui.",
                "{Sujet} monte son pied puis le laisse retomber directement sur {Cible}.",
                "{Sujet} exécute un axe kick descendant vers {Cible}.",
                "{Sujet} élève sa jambe au-dessus de {Cible} avant de la rabattre.",
                "{Sujet} porte un coup de pied verticalement descendant sur {Cible}.",
                "{Sujet} lève rapidement sa jambe puis frappe {Cible} vers le bas.",
                "{Sujet} place son pied au-dessus de {Cible} avant de l'abattre.",
                "{Sujet} frappe {Cible} avec la descente de sa jambe après l'avoir levée.",
                "{Sujet} monte sa jambe gauche puis l'abat directement sur {Cible}.",
                "{Sujet} lance un axe kick en levant sa jambe avant de la rabattre sur {Cible}.",
                "{Sujet} élève son pied au-dessus de {Cible} et le fait redescendre violemment."
            ]
        }
    }
}, 
        
   // ============================================================
// ⚔️ FRAPPES AVEC ARMES
// ============================================================

arme: {

    // ==========================================================
    // KATANA
    // ==========================================================

    katana: {

        categorie: "arme",
        id: "KATANA",

        concept:
            "Action offensive réalisée avec une lame de type katana, permettant des frappes de coupe selon différentes trajectoires.",

        trajectoires: {

            // --------------------------------------------------
            // FRAPPE FRONTALE
            // --------------------------------------------------

            frontale: {

                concept:
                    "Frappe de coupe dirigée directement vers l'avant.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} frappe frontalement avec son katana vers {Cible}.",
                    "{Sujet} porte une coupe frontale vers {Zone} de {Cible}.",
                    "{Sujet} dirige son katana droit vers {Cible}.",
                    "{Sujet} lance une coupe directe avec son katana vers {Cible}.",
                    "{Sujet} attaque {Cible} avec une frappe frontale de son katana.",
                    "{Sujet} projette sa lame directement vers {Cible}.",
                    "{Sujet} porte son katana droit devant lui pour frapper {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe dirigée vers l'avant.",
                    "{Sujet} effectue une coupe directe vers {Zone} de {Cible}.",
                    "{Sujet} avance son katana directement vers {Cible}.",
                    "{Sujet} porte une frappe frontale de lame contre {Cible}.",
                    "{Sujet} dirige la lame de son katana vers {Cible} en ligne droite.",
                    "{Sujet} frappe droit devant avec son katana vers {Cible}.",
                    "{Sujet} effectue une attaque frontale avec son katana contre {Cible}.",
                    "{Sujet} pousse sa lame vers l'avant pour atteindre {Cible}.",
                    "{Sujet} donne une coupe directe en direction de {Cible}.",
                    "{Sujet} abat son katana droit vers {Cible}.",
                    "{Sujet} porte une frappe de face avec son katana vers {Cible}.",
                    "{Sujet} dirige une coupe frontale vers {Zone} de {Cible}.",
                    "{Sujet} attaque directement {Cible} avec son katana."
                ]
            },


            // --------------------------------------------------
            // DESCENDANTE
            // --------------------------------------------------

            descendante: {

                concept:
                    "Frappe de coupe dirigée de haut en bas.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} abat son katana verticalement sur {Cible}.",
                    "{Sujet} porte une coupe descendante vers {Cible}.",
                    "{Sujet} frappe de haut en bas avec son katana.",
                    "{Sujet} rabat son katana vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe descendante.",
                    "{Sujet} fait tomber sa lame vers {Cible}.",
                    "{Sujet} lève son katana puis l'abat sur {Cible}.",
                    "{Sujet} dirige une coupe de haut en bas vers {Cible}.",
                    "{Sujet} tranche vers le bas avec son katana.",
                    "{Sujet} abat sa lame sur {Zone} de {Cible}.",
                    "{Sujet} porte une frappe verticale descendante sur {Cible}.",
                    "{Sujet} descend son katana directement vers {Cible}.",
                    "{Sujet} frappe {Cible} en rabattant sa lame vers le bas.",
                    "{Sujet} effectue une coupe descendante de son katana.",
                    "{Sujet} fait passer son katana du haut vers le bas sur {Cible}.",
                    "{Sujet} abat sa lame droit sur {Cible}.",
                    "{Sujet} lance une coupe descendante vers {Zone} de {Cible}.",
                    "{Sujet} frappe {Cible} avec un mouvement de lame descendant.",
                    "{Sujet} rabat son katana verticalement contre {Cible}.",
                    "{Sujet} termine son mouvement par une coupe descendante sur {Cible}."
                ]
            },


            // --------------------------------------------------
            // ASCENDANTE
            // --------------------------------------------------

            ascendante: {

                concept:
                    "Frappe de coupe dirigée de bas en haut.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} remonte son katana vers {Cible}.",
                    "{Sujet} porte une coupe ascendante vers {Cible}.",
                    "{Sujet} frappe de bas en haut avec son katana.",
                    "{Sujet} relève sa lame vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe ascendante.",
                    "{Sujet} fait remonter son katana vers {Cible}.",
                    "{Sujet} lance une coupe du bas vers le haut.",
                    "{Sujet} dirige sa lame vers le haut pour frapper {Cible}.",
                    "{Sujet} tranche en remontant son katana vers {Cible}.",
                    "{Sujet} porte une frappe ascendante vers {Zone} de {Cible}.",
                    "{Sujet} soulève sa lame en direction de {Cible}.",
                    "{Sujet} frappe {Cible} avec un mouvement de lame ascendant.",
                    "{Sujet} effectue une coupe ascendante avec son katana.",
                    "{Sujet} remonte rapidement sa lame vers {Cible}.",
                    "{Sujet} dirige une coupe vers le haut contre {Cible}.",
                    "{Sujet} frappe de bas en haut avec la lame vers {Cible}.",
                    "{Sujet} fait monter son katana sous la garde de {Cible}.",
                    "{Sujet} porte son katana vers le haut pour atteindre {Cible}.",
                    "{Sujet} effectue une frappe ascendante vers {Zone} de {Cible}.",
                    "{Sujet} termine son mouvement en remontant sa lame vers {Cible}."
                ]
            },


            // --------------------------------------------------
            // OBLIQUE
            // --------------------------------------------------

            oblique: {

                concept:
                    "Frappe de coupe suivant un angle diagonal entre une direction verticale et horizontale.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} porte une coupe oblique vers {Cible}.",
                    "{Sujet} frappe diagonalement avec son katana.",
                    "{Sujet} donne une coupe oblique vers la {Direction}.",
                    "{Sujet} frappe {Cible} avec une coupe diagonale.",
                    "{Sujet} dirige son katana en diagonale vers {Cible}.",
                    "{Sujet} porte une coupe oblique vers {Zone} de {Cible}.",
                    "{Sujet} tranche en diagonale vers la {Direction}.",
                    "{Sujet} effectue une frappe oblique avec son katana vers {Cible}.",
                    "{Sujet} abat sa lame en diagonale vers {Cible}.",
                    "{Sujet} remonte sa lame en diagonale vers {Cible}.",
                    "{Sujet} frappe {Cible} selon une trajectoire oblique.",
                    "{Sujet} dirige une coupe diagonale vers la {Direction}.",
                    "{Sujet} fait passer son katana en oblique vers {Cible}.",
                    "{Sujet} porte une frappe diagonale sur {Zone} de {Cible}.",
                    "{Sujet} coupe en biais vers {Cible}.",
                    "{Sujet} attaque {Cible} avec une coupe orientée vers la {Direction}.",
                    "{Sujet} effectue un mouvement de coupe oblique vers {Cible}.",
                    "{Sujet} tranche en biais avec son katana vers {Cible}.",
                    "{Sujet} lance sa lame en diagonale vers {Cible}.",
                    "{Sujet} porte une coupe oblique en direction de la {Direction}."
                ]
            },


            // --------------------------------------------------
            // REVERS
            // --------------------------------------------------

            revers: {

                concept:
                    "Frappe exécutée dans le sens opposé au mouvement de coupe initial, généralement après une inversion de direction de la lame.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} effectue un revers avec son katana vers {Cible}.",
                    "{Sujet} revient avec une coupe en revers.",
                    "{Sujet} frappe en revers vers la {Direction}.",
                    "{Sujet} renverse le mouvement de sa lame pour frapper {Cible}.",
                    "{Sujet} porte un revers de katana vers {Cible}.",
                    "{Sujet} inverse sa coupe et frappe {Cible} en revers.",
                    "{Sujet} ramène sa lame en revers vers {Cible}.",
                    "{Sujet} effectue une coupe en retour vers {Cible}.",
                    "{Sujet} frappe {Cible} avec le mouvement de retour de son katana.",
                    "{Sujet} inverse la direction de sa lame vers la {Direction}.",
                    "{Sujet} lance un revers vers {Zone} de {Cible}.",
                    "{Sujet} revient avec sa lame pour frapper {Cible}.",
                    "{Sujet} effectue un mouvement de revers vers la {Direction}.",
                    "{Sujet} frappe {Cible} après avoir inversé la trajectoire de son katana.",
                    "{Sujet} ramène son katana dans la direction opposée pour toucher {Cible}.",
                    "{Sujet} porte une coupe de revers vers {Cible}.",
                    "{Sujet} change brusquement la direction de sa lame et frappe en revers.",
                    "{Sujet} fait revenir sa lame vers {Cible} avec un revers.",
                    "{Sujet} effectue une coupe en retour vers la {Direction}.",
                    "{Sujet} attaque {Cible} avec un revers de son katana."
                ]
            },


            // --------------------------------------------------
            // CIRCULAIRE
            // --------------------------------------------------

            circulaire: {

                concept:
                    "Frappe de coupe suivant un mouvement courbe autour du corps ou d'un axe.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} effectue une coupe circulaire avec son katana.",
                    "{Sujet} fait tournoyer sa lame vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe circulaire.",
                    "{Sujet} décrit un arc avec son katana vers {Cible}.",
                    "{Sujet} fait tourner sa lame vers la {Direction}.",
                    "{Sujet} porte une coupe circulaire vers {Cible}.",
                    "{Sujet} frappe en arc de cercle vers {Cible}.",
                    "{Sujet} fait pivoter son katana pour couper {Cible}.",
                    "{Sujet} lance une frappe circulaire vers la {Direction}.",
                    "{Sujet} fait passer sa lame autour de lui avant de frapper {Cible}.",
                    "{Sujet} décrit un mouvement circulaire avec son katana vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une trajectoire courbe.",
                    "{Sujet} fait tournoyer sa lame dans la direction de {Cible}.",
                    "{Sujet} effectue une coupe en arc vers {Cible}.",
                    "{Sujet} balaie avec son katana dans un mouvement circulaire.",
                    "{Sujet} porte une frappe circulaire vers la {Direction}.",
                    "{Sujet} fait tourner sa lame autour de son axe pour atteindre {Cible}.",
                    "{Sujet} coupe {Cible} avec un mouvement courbe de son katana.",
                    "{Sujet} lance sa lame dans un mouvement circulaire vers {Cible}.",
                    "{Sujet} effectue une coupe tournoyante en direction de la {Direction}."
                ]
            },


            // --------------------------------------------------
            // HORIZONTALE
            // --------------------------------------------------

            horizontale: {

                concept:
                    "Frappe de coupe suivant principalement un axe horizontal.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} effectue une coupe horizontale vers {Cible}.",
                    "{Sujet} tranche horizontalement vers {Cible}.",
                    "{Sujet} balaie avec son katana vers la {Direction}.",
                    "{Sujet} frappe {Cible} avec une coupe horizontale.",
                    "{Sujet} dirige sa lame horizontalement vers {Cible}.",
                    "{Sujet} porte une coupe horizontale vers {Zone} de {Cible}.",
                    "{Sujet} balance son katana horizontalement vers {Cible}.",
                    "{Sujet} tranche de gauche à droite vers {Cible}.",
                    "{Sujet} effectue une frappe horizontale vers la {Direction}.",
                    "{Sujet} balaie sa lame devant lui pour frapper {Cible}.",
                    "{Sujet} porte son katana horizontalement vers {Cible}.",
                    "{Sujet} frappe {Cible} avec un mouvement latéral de sa lame.",
                    "{Sujet} coupe horizontalement dans la direction de {Cible}.",
                    "{Sujet} dirige une coupe vers la {Direction}.",
                    "{Sujet} effectue un balayage horizontal avec son katana.",
                    "{Sujet} frappe {Cible} avec une lame lancée horizontalement.",
                    "{Sujet} fait passer son katana horizontalement vers {Cible}.",
                    "{Sujet} porte une coupe latérale vers {Zone} de {Cible}.",
                    "{Sujet} balaie son katana vers {Cible} dans un mouvement horizontal.",
                    "{Sujet} termine son mouvement par une coupe horizontale vers la {Direction}."
                ]
            },


            // --------------------------------------------------
            // VERTICALE
            // --------------------------------------------------

            verticale: {

                concept:
                    "Frappe de coupe suivant principalement un axe vertical.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} porte une coupe verticale sur {Cible}.",
                    "{Sujet} tranche verticalement vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe verticale.",
                    "{Sujet} dirige son katana verticalement vers {Cible}.",
                    "{Sujet} abat sa lame dans un axe vertical sur {Cible}.",
                    "{Sujet} remonte sa lame verticalement vers {Cible}.",
                    "{Sujet} effectue une frappe verticale avec son katana.",
                    "{Sujet} coupe verticalement vers {Zone} de {Cible}.",
                    "{Sujet} frappe de manière verticale avec sa lame.",
                    "{Sujet} porte son katana dans un mouvement vertical vers {Cible}.",
                    "{Sujet} effectue une coupe droite verticale sur {Cible}.",
                    "{Sujet} dirige une frappe verticale vers {Cible}.",
                    "{Sujet} tranche {Cible} selon un axe vertical.",
                    "{Sujet} abat son katana verticalement vers {Cible}.",
                    "{Sujet} remonte son katana dans un mouvement vertical contre {Cible}.",
                    "{Sujet} lance une coupe verticale vers {Zone} de {Cible}.",
                    "{Sujet} frappe {Cible} avec un mouvement vertical de sa lame.",
                    "{Sujet} effectue une coupe verticale directe vers {Cible}.",
                    "{Sujet} porte une frappe de lame selon un axe vertical.",
                    "{Sujet} dirige une coupe verticale directement vers {Cible}."
                ]
            },


            // --------------------------------------------------
            // ESTOC
            // --------------------------------------------------

            estoc: {

                concept:
                    "Attaque utilisant principalement la pointe de la lame dans un mouvement de poussée directe.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} porte une estocade avec son katana vers {Cible}.",
                    "{Sujet} plante la pointe de son katana vers {Cible}.",
                    "{Sujet} pousse son katana directement vers {Cible}.",
                    "{Sujet} transperce vers {Cible} avec la pointe de sa lame.",
                    "{Sujet} porte une attaque d'estoc vers {Cible}.",
                    "{Sujet} tend son katana pour atteindre {Cible} avec la pointe.",
                    "{Sujet} dirige la pointe de son katana vers {Cible}.",
                    "{Sujet} pousse sa lame en ligne droite vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une estocade directe.",
                    "{Sujet} projette la pointe de sa lame vers {Cible}.",
                    "{Sujet} porte une estocade vers {Zone} de {Cible}.",
                    "{Sujet} avance son katana pour piquer directement {Cible}.",
                    "{Sujet} enfonce la pointe de sa lame vers {Cible}.",
                    "{Sujet} effectue une poussée d'estoc vers {Cible}.",
                    "{Sujet} frappe {Cible} avec la pointe de son katana.",
                    "{Sujet} tend sa lame droit devant {Cible} pour porter une estocade.",
                    "{Sujet} dirige une poussée de lame vers {Cible}.",
                    "{Sujet} lance une estocade directe vers {Cible}.",
                    "{Sujet} pousse son arme vers {Zone} de {Cible}.",
                    "{Sujet} attaque {Cible} en utilisant la pointe de son katana."
                ]
            },


            // --------------------------------------------------
            // PIQUÉ
            // --------------------------------------------------

            pique: {

                concept:
                    "Attaque descendante utilisant la pointe de la lame.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE"
                ],

                exemples: [
                    "{Sujet} pique avec la pointe de son katana vers {Cible}.",
                    "{Sujet} plonge la lame vers {Cible}.",
                    "{Sujet} dirige la pointe de son katana vers le bas sur {Cible}.",
                    "{Sujet} porte un piqué avec son katana vers {Cible}.",
                    "{Sujet} abat la pointe de sa lame vers {Cible}.",
                    "{Sujet} plonge son katana en direction de {Cible}.",
                    "{Sujet} attaque {Cible} avec une pointe descendante.",
                    "{Sujet} enfonce la pointe de son katana vers {Cible}.",
                    "{Sujet} dirige son arme vers le bas pour atteindre {Cible}.",
                    "{Sujet} frappe {Cible} avec un mouvement de piqué.",
                    "{Sujet} fait descendre la pointe de sa lame vers {Cible}.",
                    "{Sujet} porte une attaque en piqué vers {Zone} de {Cible}.",
                    "{Sujet} plonge son katana directement vers {Cible}.",
                    "{Sujet} rabat la pointe de sa lame sur {Cible}.",
                    "{Sujet} effectue un piqué vertical avec son katana.",
                    "{Sujet} descend son arme pointe en avant vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une attaque descendante de la pointe.",
                    "{Sujet} dirige la pointe de sa lame vers {Cible} depuis le haut.",
                    "{Sujet} lance son katana vers le bas pour atteindre {Cible}.",
                    "{Sujet} effectue une attaque en piqué avec la pointe de son katana."
                ]
            },


            // --------------------------------------------------
            // COUPE ASCENDANTE OBLIQUE
            // --------------------------------------------------

            gyaku_kesa: {

                concept:
                    "Coupe ascendante oblique traversant le corps selon une diagonale.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} remonte son katana en diagonale vers {Cible}.",
                    "{Sujet} effectue une coupe ascendante oblique vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe diagonale ascendante.",
                    "{Sujet} dirige sa lame du bas vers le haut en diagonale.",
                    "{Sujet} porte un gyaku kesa vers {Cible}.",
                    "{Sujet} remonte sa lame obliquement vers la {Direction}.",
                    "{Sujet} frappe en diagonale ascendante vers {Zone} de {Cible}.",
                    "{Sujet} lance une coupe oblique montante vers {Cible}.",
                    "{Sujet} fait remonter son katana en biais vers {Cible}.",
                    "{Sujet} tranche de bas en haut selon une trajectoire oblique.",
                    "{Sujet} porte une coupe ascendante vers la {Direction}.",
                    "{Sujet} frappe {Cible} avec une lame remontant en diagonale.",
                    "{Sujet} effectue une coupe montante oblique avec son katana.",
                    "{Sujet} dirige une coupe ascendante vers {Cible}.",
                    "{Sujet} remonte sa lame en biais pour frapper {Cible}.",
                    "{Sujet} lance un gyaku kesa vers {Cible}.",
                    "{Sujet} frappe de bas en haut dans une direction oblique.",
                    "{Sujet} porte une coupe ascendante diagonale vers {Zone} de {Cible}.",
                    "{Sujet} fait monter son katana en diagonale vers la {Direction}.",
                    "{Sujet} termine son mouvement par une coupe ascendante oblique sur {Cible}."
                ]
            },


            // --------------------------------------------------
            // COUPE DESCENDANTE OBLIQUE
            // --------------------------------------------------

            kesa: {

                concept:
                    "Coupe descendante oblique traversant le corps selon une diagonale.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} abat son katana en diagonale vers {Cible}.",
                    "{Sujet} effectue une coupe descendante oblique vers {Cible}.",
                    "{Sujet} frappe {Cible} avec une coupe diagonale descendante.",
                    "{Sujet} dirige sa lame du haut vers le bas en diagonale.",
                    "{Sujet} porte un kesa vers {Cible}.",
                    "{Sujet} abat sa lame obliquement vers la {Direction}.",
                    "{Sujet} frappe en diagonale descendante vers {Zone} de {Cible}.",
                    "{Sujet} lance une coupe oblique descendante vers {Cible}.",
                    "{Sujet} fait descendre son katana en biais vers {Cible}.",
                    "{Sujet} tranche de haut en bas selon une trajectoire oblique.",
                    "{Sujet} porte une coupe descendante vers la {Direction}.",
                    "{Sujet} frappe {Cible} avec une lame descendant en diagonale.",
                    "{Sujet} effectue une coupe descendante oblique avec son katana.",
                    "{Sujet} dirige une coupe descendante vers {Cible}.",
                    "{Sujet} abat sa lame en biais pour frapper {Cible}.",
                    "{Sujet} lance un kesa vers {Cible}.",
                    "{Sujet} frappe de haut en bas dans une direction oblique.",
                    "{Sujet} porte une coupe descendante diagonale vers {Zone} de {Cible}.",
                    "{Sujet} fait descendre son katana en diagonale vers la {Direction}.",
                    "{Sujet} termine son mouvement par une coupe descendante oblique sur {Cible}."
                ]
            },


            // --------------------------------------------------
            // COUPE EN ROTATION
            // --------------------------------------------------

            rotation: {

                concept:
                    "Coupe réalisée pendant une rotation du corps ou un changement circulaire de position.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "TRAJECTOIRE",
                    "ZONE",
                    "CIBLE",
                    "DIRECTION"
                ],

                exemples: [
                    "{Sujet} tourne sur lui-même et frappe avec son katana.",
                    "{Sujet} effectue une coupe en rotation vers {Cible}.",
                    "{Sujet} pivote et fait tournoyer son katana vers {Cible}.",
                    "{Sujet} tourne avant de porter une coupe vers {Cible}.",
                    "{Sujet} effectue une rotation du corps avec son katana vers {Cible}.",
                    "{Sujet} frappe {Cible} pendant une rotation.",
                    "{Sujet} fait tourner son corps et tranche vers la {Direction}.",
                    "{Sujet} tourne sur lui-même avant de frapper {Cible}.",
                    "{Sujet} porte une coupe tournoyante avec son katana.",
                    "{Sujet} effectue une rotation et dirige sa lame vers {Cible}.",
                    "{Sujet} tourne en entraînant son katana dans une trajectoire circulaire.",
                    "{Sujet} frappe {Cible} après avoir effectué une rotation.",
                    "{Sujet} fait pivoter son corps puis porte une coupe vers {Cible}.",
                    "{Sujet} tourne avec son katana et frappe dans la direction de {Cible}.",
                    "{Sujet} réalise une coupe en rotation vers la {Direction}.",
                    "{Sujet} effectue un mouvement tournant avant de frapper {Cible}.",
                    "{Sujet} fait tourner sa lame autour de lui pour atteindre {Cible}.",
                    "{Sujet} pivote sur lui-même et porte une frappe tournoyante.",
                    "{Sujet} tourne et dirige son katana vers {Zone} de {Cible}.",
                    "{Sujet} effectue une coupe tournante avec son katana vers {Cible}."
                ]
            }
        }
    },                                                                      
                                        
    
// ==========================================================
// 🛡️ DEFENSE
// ==========================================================

defense: {

    
// ESQUIVE
// ======================================================

esquive: {

    categorie: "defense",
    id: "ESQUIVE",

    concept:
        "Action défensive consistant à éviter une attaque en déplaçant son corps hors de sa trajectoire.",

    trajectoires: {

        // ==================================================
        // BAS
        // ==================================================

        bas: {

            concept:
                "Abaissement rapide du corps pour laisser une attaque passer au-dessus.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} se baisse rapidement pour éviter le coup de {Cible}.",
                "{Sujet} abaisse rapidement son buste pour laisser passer le poing de {Cible}.",
                "{Sujet} fléchit rapidement les genoux pour passer sous le coup de {Cible}."
            ]
        },

        // ==================================================
        // ACCROUPI
        // ==================================================

        accroupi: {

            concept:
                "Abaissement important du centre de gravité en position accroupie afin d'éviter une attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} s'accroupit rapidement pour éviter le crochet de {Cible}.",
                "{Sujet} descend rapidement en position accroupie pour esquiver le coup de {Cible}.",
                "{Sujet} se baisse rapidement en position accroupie pour laisser passer l'attaque."
            ]
        },

        // ==================================================
        // LATÉRALE
        // ==================================================

        laterale: {

            concept:
                "Déplacement latéral rapide du corps afin de sortir de la trajectoire d'une attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} se décale rapidement vers la gauche pour éviter le poing de {Cible}.",
                "{Sujet} esquive rapidement vers la droite le coup de {Cible}.",
                "{Sujet} se déplace rapidement sur le côté gauche pour sortir de la trajectoire du coup."
            ]
        },

        // ==================================================
        // RECUL
        // ==================================================

        recul: {

            concept:
                "Déplacement rapide vers l'arrière afin d'augmenter la distance et sortir de la portée de l'attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "DISTANCE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} recule rapidement de 2 mètres pour éviter le direct de {Cible}.",
                "{Sujet} fait rapidement deux pas en arrière pour laisser passer le coup de {Cible}.",
                "{Sujet} recule rapidement hors de portée de {Cible}."
            ]
        },

        // ==================================================
        // AVANCE
        // ==================================================

        avance: {

            concept:
                "Déplacement rapide vers l'avant permettant de sortir de la trajectoire d'une attaque ou de passer à l'intérieur de celle-ci.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} avance rapidement vers {Cible} pour passer sous son crochet.",
                "{Sujet} entre rapidement vers l'avant pour éviter le poing de {Cible}.",
                "{Sujet} avance rapidement à l'intérieur de la trajectoire du coup."
            ]
        },

        // ==================================================
        // PIVOT
        // ==================================================

        pivot: {

            concept:
                "Rotation rapide du corps autour d'un appui afin de sortir de la trajectoire d'une attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} pivote rapidement vers la gauche pour laisser passer le poing de {Cible}.",
                "{Sujet} pivote rapidement vers la droite pour éviter le coup de {Cible}.",
                "{Sujet} tourne rapidement sur son appui pour sortir de la trajectoire de l'attaque."
            ]
        },

        // ==================================================
        // PENCHÉE
        // ==================================================

        penche: {

            concept:
                "Inclinaison rapide du buste ou de la tête afin d'éviter une attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} penche rapidement la tête vers la gauche pour éviter le poing de {Cible}.",
                "{Sujet} incline rapidement son buste vers l'arrière pour esquiver le coup.",
                "{Sujet} penche rapidement son corps sur le côté pour éviter l'attaque."
            ]
        },

        // ==================================================
        // SAUT
        // ==================================================

        saut: {

            concept:
                "Élévation rapide du corps permettant d'éviter une attaque passant au niveau du sol ou des jambes.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "HAUTEUR",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} saute rapidement pour éviter le balayage de {Cible}.",
                "{Sujet} bondit rapidement vers le haut pour éviter le coup de pied.",
                "{Sujet} saute rapidement de 1 mètre pour laisser passer l'attaque."
            ]
        },

        // ==================================================
        // ROULADE
        // ==================================================

        roulade: {

            concept:
                "Rotation rapide du corps au sol permettant de sortir de la trajectoire d'une attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} fait rapidement une roulade vers la gauche pour éviter l'attaque.",
                "{Sujet} roule rapidement vers l'avant sous le coup de {Cible}.",
                "{Sujet} effectue rapidement une roulade vers l'arrière pour esquiver."
            ]
        },

        // ==================================================
        // PASSAGE
        // ==================================================

        passage: {

            concept:
                "Déplacement rapide permettant de passer autour ou à proximité de l'adversaire en sortant de la trajectoire de son attaque.",

            structure: [
                "SUJET",
                "ACTION",
                "VITESSE",
                "DIRECTION",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} passe rapidement sur le côté de {Cible} pour éviter son attaque.",
                "{Sujet} se glisse rapidement derrière {Cible} en sortant de la trajectoire du coup.",
                "{Sujet} passe rapidement sur la droite de {Cible} pour esquiver son attaque."
            ]
        }
    }
}, 
                

    // ======================================================
    // GARDE
    // ======================================================

    garde: {
        categorie: "defense",
        id: "GARDE",

        concept:
            "Posture défensive destinée à protéger une ou plusieurs zones du corps.",

        trajectoires: {

            haute: {
                concept: "Garde protégeant principalement la tête et le haut du corps.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "ZONE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} lève sa garde pour protéger son visage.",
                    "{Sujet} place ses bras en garde haute."
                ]
            },

            basse: {
                concept: "Garde protégeant principalement le bas du corps.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "ZONE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} adopte une garde basse pour protéger ses jambes.",
                    "{Sujet} descend sa garde pour protéger son abdomen."
                ]
            },

            centrale: {
                concept: "Garde centrée devant le corps pour protéger les zones vitales.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "ZONE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} place ses bras devant son corps.",
                    "{Sujet} adopte une garde centrale pour protéger son torse."
                ]
            },

            complete: {
                concept: "Posture défensive couvrant plusieurs zones simultanément.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MANIERE",
                    "ZONE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} se recroqueville pour protéger tout son corps.",
                    "{Sujet} adopte une garde complète pour encaisser l'attaque."
                ]
            }
        }
    },


    // ======================================================
    // BLOCAGE
    // ======================================================

    blocage: {
        categorie: "defense",
        id: "BLOCAGE",

        concept:
            "Action défensive consistant à utiliser une partie du corps pour arrêter ou absorber directement une attaque.",

        trajectoires: {

            bras: {
                concept:
                    "Blocage effectué avec un membre supérieur.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} bloque le poing de {Cible} avec son avant-bras droit.",
                    "{Sujet} interpose sa paume gauche devant le coup de {Cible}.",
                    "{Sujet} bloque le direct avec son coude gauche."
                ]
            },

            jambes: {
                concept:
                    "Blocage effectué avec un membre inférieur.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} bloque le coup de pied de {Cible} avec son tibia droit.",
                    "{Sujet} lève sa jambe gauche pour bloquer l'attaque.",
                    "{Sujet} arrête le coup avec la plante de son pied droit."
                ]
            },

            corps: {
                concept:
                    "Blocage effectué directement avec une partie du corps.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} bloque le coup avec son épaule.",
                    "{Sujet} absorbe l'impact avec son torse.",
                    "{Sujet} encaisse le coup avec son flanc."
                ]
            }
        }
    },


    // ======================================================
    // PARADE
    // ======================================================

    parade: {
        categorie: "defense",
        id: "PARADE",

        concept:
            "Action défensive consistant à intercepter activement une attaque avec une partie du corps.",

        trajectoires: {

            intercepter: {
                concept:
                    "Interception directe de l'attaque avant qu'elle atteigne sa cible.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} intercepte le poing de {Cible} avec sa paume droite.",
                    "{Sujet} arrête le coup avec son avant-bras gauche."
                ]
            },

            exterieur: {
                concept:
                    "Parade dirigeant l'attaque vers l'extérieur du corps.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "DIRECTION",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} repousse le poing de {Cible} vers l'extérieur avec sa paume droite.",
                    "{Sujet} détourne le bras de {Cible} vers la droite avec son avant-bras gauche."
                ]
            },

            interieur: {
                concept:
                    "Parade dirigeant l'attaque vers l'intérieur du corps ou vers l'axe central.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "DIRECTION",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} ramène le poing de {Cible} vers l'intérieur avec sa paume gauche.",
                    "{Sujet} dévie le bras de {Cible} vers son axe avec son avant-bras droit."
                ]
            },

            bas: {
                concept:
                    "Parade dirigeant l'attaque vers le bas.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "DIRECTION",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} rabat le poing de {Cible} vers le bas avec sa paume droite.",
                    "{Sujet} pousse le bras de {Cible} vers le bas avec son avant-bras gauche."
                ]
            },

            haut: {
                concept:
                    "Parade dirigeant l'attaque vers le haut.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "DIRECTION",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} dévie le bras de {Cible} vers le haut avec sa paume droite.",
                    "{Sujet} relève le poing de {Cible} avec son avant-bras gauche."
                ]
            }
        }
    },


    // ======================================================
// DÉVIATION
// ======================================================

deviation: {

    categorie: "defense",
    id: "DEVIATION",

    concept:
        "Action défensive consistant à modifier volontairement la trajectoire d'un membre, d'une arme ou d'une attaque adverse à l'aide d'une partie du corps.",

    // ==================================================
    // MEMBRES POUVANT ÊTRE UTILISÉS
    // ==================================================

    membres: {

        superieurs: [
            "main",
            "paume",
            "doigts",
            "poignet",
            "avant_bras",
            "coude",
            "epaule"
        ],

        inferieurs: [
            "cuisse",
            "genou",
            "tibia",
            "cheville",
            "pied",
            "talon",
            "plante",
            "semelle"
        ]
    },

    trajectoires: {

        // ==================================================
        // LATÉRALE
        // ==================================================

        laterale: {

            concept:
                "Déviation d'une attaque vers un côté.",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} dévie le coude de {Cible} vers la gauche avec sa paume droite.",
                "{Sujet} dévie le poing de {Cible} vers la droite avec son avant-bras gauche.",
                "{Sujet} dévie le coup de pied de {Cible} vers la gauche avec son tibia droit.",
                "{Sujet} dévie la jambe de {Cible} vers la droite avec la semelle de son pied gauche.",
                "{Sujet} dévie le genou de {Cible} vers la gauche avec son genou droit.",
                "{Sujet} dévie le bras de {Cible} vers l'extérieur avec son coude gauche."
            ]
        },

        // ==================================================
        // CIRCULAIRE
        // ==================================================

        circulaire: {

            concept:
                "Déviation suivant une trajectoire circulaire afin de modifier progressivement la trajectoire de l'attaque adverse.",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} dévie le poignet de {Cible} dans un mouvement circulaire avec sa paume droite.",
                "{Sujet} accompagne le bras de {Cible} dans un mouvement circulaire avec son avant-bras gauche.",
                "{Sujet} dévie la jambe de {Cible} dans un mouvement circulaire avec son tibia droit.",
                "{Sujet} guide le pied de {Cible} dans une trajectoire circulaire avec la semelle de son pied gauche."
            ]
        },

        // ==================================================
        // VERS LE BAS
        // ==================================================

        bas: {

            concept:
                "Déviation dirigeant l'attaque adverse vers le bas.",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} dévie le poing de {Cible} vers le bas avec sa paume droite.",
                "{Sujet} rabat le bras de {Cible} vers le bas avec son avant-bras gauche.",
                "{Sujet} dévie le coup de pied de {Cible} vers le bas avec la semelle de son pied droit.",
                "{Sujet} repousse la jambe de {Cible} vers le bas avec son tibia gauche.",
                "{Sujet} pousse le genou de {Cible} vers le bas avec son genou droit."
            ]
        },

        // ==================================================
        // VERS LE HAUT
        // ==================================================

        haut: {

            concept:
                "Déviation dirigeant l'attaque adverse vers le haut.",

            structure: [
                "SUJET",
                "ACTION",
                "MEMBRE",
                "MANIERE",
                "ZONE",
                "CIBLE",
                "DIRECTION",
                "INTENTION"
            ],

            exemples: [
                "{Sujet} dévie le poing de {Cible} vers le haut avec sa paume droite.",
                "{Sujet} relève le bras de {Cible} avec son avant-bras gauche.",
                "{Sujet} dévie le coup de pied de {Cible} vers le haut avec la semelle de son pied droit.",
                "{Sujet} soulève la jambe de {Cible} avec son tibia gauche.",
                "{Sujet} repousse le genou de {Cible} vers le haut avec son genou droit."
            ]
        }
    }
}, 
            
    // ======================================================
    // SAISIE
    // ======================================================

    saisie: {
        categorie: "defense",
        id: "SAISIE",

        concept:
            "Action défensive consistant à saisir une partie du corps ou une arme adverse afin d'en contrôler le mouvement.",

        trajectoires: {

            bras: {
                concept:
                    "Capture et contrôle du bras adverse.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} saisit le poignet de {Cible} avec sa main droite.",
                    "{Sujet} attrape l'avant-bras de {Cible} avec ses deux mains."
                ]
            },

            poignet: {
                concept:
                    "Capture directe du poignet adverse.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} capture le poignet de {Cible} avec sa main gauche.",
                    "{Sujet} verrouille le poignet de {Cible} avec ses deux mains."
                ]
            },

            jambe: {
                concept:
                    "Capture d'une jambe adverse afin d'en limiter le mouvement.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} saisit la cheville de {Cible} avec ses deux mains.",
                    "{Sujet} attrape la jambe de {Cible} sous le genou."
                ]
            },

            arme: {
                concept:
                    "Capture ou contrôle d'une arme adverse.",

                structure: [
                    "SUJET",
                    "ACTION",
                    "MEMBRE",
                    "MANIERE",
                    "ZONE",
                    "CIBLE",
                    "INTENTION"
                ],

                exemples: [
                    "{Sujet} saisit le poignet armé de {Cible}.",
                    "{Sujet} attrape le manche de l'arme de {Cible} avec sa main droite."
                ]
            }
        }
    }
}
                                                                                                
                    
                                
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
