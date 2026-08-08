const ElysiumRessources = {

    //================================================
    // ⚙️ RESSOURCES COMMUNES
    //================================================

    Fer: {
        id: "RES_FER",
        nom: "Fer",
        image: "resources/fer.png",
        rarete: "Commun",
        utilite: "Fabrication"
    },

    Bois: {
        id: "RES_BOIS",
        nom: "Bois",
        image: "resources/bois.png",
        rarete: "Commun",
        utilite: "Construction"
    },

    Pierres: {
        id: "RES_PIERRE",
        nom: "Pierres",
        image: "resources/pierres.png",
        rarete: "Commun",
        utilite: "Construction"
    },

    PlanteVerte: {
        id: "RES_PLANTE_VERTE",
        nom: "Plante verte",
        image: "resources/plante_verte.png",
        rarete: "Commun",
        utilite: "Soins"
    },

    PlanteRouge: {
        id: "RES_PLANTE_ROUGE",
        nom: "Plante rouge",
        image: "resources/plante_rouge.png",
        rarete: "Commun",
        utilite: "Stimulant"
    },

    PlanteJaune: {
        id: "RES_PLANTE_JAUNE",
        nom: "Plante jaune",
        image: "resources/plante_jaune.png",
        rarete: "Commun",
        utilite: "Antidotes"
    },

    PiecesMecaniques: {
        id: "RES_PIECES_MECANIQUES",
        nom: "Pièces mécaniques",
        image: "resources/pieces_mecaniques.png",
        rarete: "Commun",
        utilite: "Fabrication"
    },

    CristalJaune: {
        id: "RES_CRISTAL_JAUNE",
        nom: "Cristal jaune",
        image: "resources/cristal_jaune.png",
        rarete: "Commun",
        utilite: "Échanges"
    },

    CristalVert: {
        id: "RES_CRISTAL_VERT",
        nom: "Cristal vert",
        image: "resources/cristal_vert.png",
        rarete: "Commun",
        utilite: "Échanges"
    },

    CristalRouge: {
        id: "RES_CRISTAL_ROUGE",
        nom: "Cristal rouge",
        image: "resources/cristal_rouge.png",
        rarete: "Commun",
        utilite: "Échanges"
    },


    //================================================
    // 💠 RESSOURCES RARES
    //================================================

    AcierSpatial: {
        id: "RES_ACIER_SPATIAL",
        nom: "Acier spatial",
        image: "resources/acier_spatial.png",
        rarete: "Rare",
        utilite: "Fabrication"
    },

    NoyauEnergie: {
        id: "RES_NOYAU_ENERGIE",
        nom: "Noyau d'énergie",
        image: "resources/noyau_energie.png",
        rarete: "Rare",
        utilite: "Source d'énergie"
    },

    PlanteBleue: {
        id: "RES_PLANTE_BLEUE",
        nom: "Plante bleue",
        image: "resources/plante_bleue.png",
        rarete: "Rare",
        utilite: "Stimulant"
    },

    CristalBleu: {
        id: "RES_CRISTAL_BLEU",
        nom: "Cristal bleu",
        image: "resources/cristal_bleu.png",
        rarete: "Rare",
        utilite: "Échanges"
    },

    CristalGlace: {
        id: "RES_CRISTAL_GLACE",
        nom: "Cristal de glace",
        image: "resources/cristal_glace.png",
        rarete: "Rare",
        utilite: "Échanges"
    },

    TitaniumNoir: {
        id: "RES_TITANIUM_NOIR",
        nom: "Titanium noir",
        image: "resources/titanium_noir.png",
        rarete: "Rare",
        utilite: "Échanges"
    },

    Xenorium: {
        id: "RES_XENORIUM",
        nom: "Xénorium",
        image: "resources/xenorium.png",
        rarete: "Rare",
        utilite: "Échanges"
    },

    Tyrium: {
        id: "RES_TYRIUM",
        nom: "Tyrium",
        image: "resources/tyrium.png",
        rarete: "Rare",
        utilite: "Échanges"
    }

};


//================================================
// 🔎 RÉCUPÉRATION D'UNE RESSOURCE
//================================================

function getRessource(id) {

    return Object.values(ElysiumRessources).find(
        ressource => ressource.id === id
    ) || null;

}


//================================================
// 📦 RÉCUPÉRATION DE TOUTES LES RESSOURCES
//================================================

function getAllRessources() {

    return Object.values(ElysiumRessources);

}


//================================================
// 🔎 RECHERCHE PAR NOM
//================================================

function getRessourceByName(nom) {

    return Object.values(ElysiumRessources).find(
        ressource =>
            ressource.nom.toLowerCase() === nom.toLowerCase()
    ) || null;

}


//================================================
// 💠 RÉCUPÉRATION PAR RARETÉ
//================================================

function getRessourcesByRarity(rarete) {

    return Object.values(ElysiumRessources).filter(
        ressource => ressource.rarete === rarete
    );

}


//================================================
// 🛠️ RÉCUPÉRATION PAR UTILITÉ
//================================================

function getRessourcesByUtility(utilite) {

    return Object.values(ElysiumRessources).filter(
        ressource => ressource.utilite === utilite
    );

}


//================================================
// 📤 EXPORT
//================================================

module.exports = {
    ElysiumRessources,
    getRessource,
    getAllRessources,
    getRessourceByName,
    getRessourcesByRarity,
    getRessourcesByUtility
};
