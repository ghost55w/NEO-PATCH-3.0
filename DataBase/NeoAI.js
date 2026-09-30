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
                        "{Sujet} frappe en overhand descendant."
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
                        "{Sujet} frappe avec un backfist du {Membre}.",
                        "{Sujet} effectue un backfist horizontal vers {Cible}."
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
                "Frappe réalisée avec le côté inférieur ou externe du poing fermé.",

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
                        "{Sujet} abat un hammerfist sur {Cible}.",
                        "{Sujet} frappe avec le poing en marteau."
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
                        "{Sujet} frappe latéralement avec un hammerfist.",
                        "{Sujet} lance un hammerfist vers la {Direction}."
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
                        "{Sujet} pousse violemment sa paume vers {Cible}."
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
                        "{Sujet} frappe avec une paume ascendante."
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
                        "{Sujet} frappe avec le tranchant de la main vers {Cible}.",
                        "{Sujet} porte une frappe horizontale du tranchant."
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
                        "{Sujet} frappe de haut en bas avec le tranchant."
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
                        "{Sujet} frappe avec son coude vers {Cible}.",
                        "{Sujet} lance un coude horizontal vers la tempe de {Cible}."
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
                        "{Sujet} porte un coude ascendant."
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
                        "{Sujet} frappe avec un coude descendant."
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
                        "{Sujet} percute {Cible} avec son front."
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
                        "{Sujet} donne un coup de tête latéral.",
                        "{Sujet} percute {Cible} avec sa tête sur le côté."
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
                        "{Sujet} porte un coup de tête ascendant."
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
                "Coup de pied direct utilisant principalement la poussée de la jambe vers l'avant.",

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
                        "{Sujet} donne un front kick du {Membre} au ventre de {Cible}.",
                        "{Sujet} frappe directement avec son pied vers {Cible}."
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
                "Coup de pied circulaire ou latéral visant principalement la partie basse du corps.",

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
                        "{Sujet} donne un low kick du {Membre} à la cuisse de {Cible}.",
                        "{Sujet} frappe la jambe de {Cible} avec un low kick."
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
                "Coup de pied circulaire utilisant une rotation de la hanche et de la jambe.",

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
                        "{Sujet} lance un roundhouse kick du {Membre} vers {Cible}.",
                        "{Sujet} frappe circulairement les côtes de {Cible}."
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
                        "{Sujet} frappe latéralement avec son pied."
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
                        "{Sujet} porte un axe kick vers la tête de {Cible}."
                         ]
                }
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
                        "{Sujet} dirige son katana droit vers {Cible}."
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
                        "{Sujet} frappe de haut en bas avec son katana."
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
                        "{Sujet} porte une coupe ascendante.",
                        "{Sujet} frappe de bas en haut avec son katana."
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
                        "{Sujet} donne une coupe oblique vers la {Direction}."
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
                        "{Sujet} frappe en revers vers la {Direction}."
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
                        "{Sujet} frappe {Cible} avec une coupe circulaire."
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
                        "{Sujet} balaie avec son katana vers la {Direction}."
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
                        "{Sujet} tranche verticalement vers {Cible}."
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
                        "{Sujet} pousse son katana directement vers {Cible}."
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
                        "{Sujet} plonge la lame vers {Cible}."
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
                        "{Sujet} effectue une coupe ascendante oblique."
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
                        "{Sujet} effectue une coupe descendante oblique."
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
                        "{Sujet} effectue une coupe en rotation vers {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // COUTEAU
        // ==========================================================

        couteau: {

            categorie: "arme",
            id: "COUTEAU",

            concept:
                "Arme courte permettant principalement des frappes d'estoc, de coupe et de revers.",

            trajectoires: {

                estoc: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE"
                    ],

                    exemples: [
                        "{Sujet} donne un coup de couteau direct vers {Cible}.",
                        "{Sujet} porte une estocade vers {Zone} de {Cible}."
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
                        "{Sujet} frappe de haut en bas avec son couteau."
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
                        "{Sujet} frappe de bas en haut avec son couteau."
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
                        "{Sujet} effectue une coupe horizontale avec son couteau."
                    ]
                },

                revers: {

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
                        "{Sujet} frappe en revers avec son couteau."
                    ]
                }
            }
        },


        // ==========================================================
        // BÂTON / MATRAQUE
        // ==========================================================

        baton: {

            categorie: "arme",
            id: "BATON",

            concept:
                "Arme contondante allongée permettant des frappes directes, circulaires et descendantes.",

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
                        "{Sujet} frappe frontalement avec son bâton vers {Cible}."
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
                        "{Sujet} abat son bâton sur {Cible}."
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
                        "{Sujet} remonte son bâton vers {Cible}."
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
                        "{Sujet} balaie horizontalement avec son bâton vers {Cible}."
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
                        "DIRECTION"
                    ],

                    exemples: [
                        "{Sujet} fait tournoyer son bâton vers {Cible}."
                    ]
                }
            }
        },


        // ==========================================================
        // LANCE
        // ==========================================================

        lance: {

            categorie: "arme",
            id: "LANCE",

            concept:
                "Arme d'hast permettant principalement des attaques d'estoc et des frappes avec le manche.",

            trajectoires: {

                estoc: {

                    structure: [
                        "SUJET",
                        "ACTION",
                        "MEMBRE",
                        "MANIERE",
                        "ZONE",
                        "CIBLE",
                        "DISTANCE"
                    ],

                    exemples: [
                        "{Sujet} pousse sa lance vers {Cible}.",
                        "{Sujet} porte une estocade avec sa lance."
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
                        "{Sujet} abat sa lance vers {Cible}."
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
                        "{Sujet} remonte sa lance vers {Cible}."
                    ]
                },

                balayage: {

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
                        "{Sujet} balaie avec le manche de sa lance vers {Cible}."
                         ]
                }
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
