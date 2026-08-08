const ElysiumWeapons = {

    //================================================
    // 🥉 NOVICE
    //================================================

    Viper09: {
        id: "WPN_VIPER_09",
        nom: "Viper-09",
        image: "weapons/viper_09.png",
        type: "Couteau",
        rarete: "Novice🥉",

        degats: {
            humain: 5,
            animal: 5,
            creature: 2,
            vehicule: 1.25
        },

        effet: "coupure",
        portee: "1m + Bras",
        durabilite: 5,
        niveauRequis: 1,
        prix: 5000
    },

    KatanaSaberXR: {
        id: "WPN_KATANA_SABER_XR",
        nom: "Katana Saber XR",
        image: "weapons/katana_saber_xr.png",
        type: "Katana",
        rarete: "Novice🥉",

        degats: {
            humain: 10,
            animal: 10,
            creature: 5,
            vehicule: 2.5
        },

        effet: "coupure",
        portee: "2m + Bras",
        durabilite: 10,
        niveauRequis: 1,
        prix: 20000
    },


    //================================================
    // 🥈 PRODIGE
    //================================================

    KatanaOni: {
        id: "WPN_KATANA_ONI",
        nom: "Katana Oni",
        image: "weapons/katana_oni.png",
        type: "Katana",
        rarete: "Prodige🥈",

        degats: {
            humain: 25,
            animal: 20,
            creature: 10,
            vehicule: 6.25
        },

        effet: "coupure",
        portee: "2m + Bras",
        durabilite: 20,
        niveauRequis: 5,
        prix: 100000
    },


    //================================================
    // 🥇 LÉGENDAIRE
    //================================================

    KatanaEclipse: {
        id: "WPN_KATANA_ECLIPSE",
        nom: "Katana Eclipse",
        image: "weapons/katana_eclipse.png",
        type: "Katana",
        rarete: "Légendaire🥇",

        degats: {
            humain: 30,
            animal: 30,
            creature: 20,
            vehicule: 7.5
        },

        effet: "coupure",
        portee: "2m + Bras",
        durabilite: 30,
        niveauRequis: 10,
        prix: 300000
    },


    //================================================
    // 🔫 PISTOLETS
    //================================================

    //---------------- NOVICE 🥉 ----------------

    Viper9: {
        id: "WPN_VIPER_9",
        nom: "Viper-9",
        image: "weapons/viper_9.png",
        type: "Pistolet",
        rarete: "Novice🥉",

        degats: {
            humain: 12,
            animal: 12,
            creature: 8,
            vehicule: 3
        },

        effet: "tir",
        portee: "15m",
        puissance: 20,
        cadenceTir: 2,
        energieParTir: 10,
        niveauRequis: 1,
        prix: 10000
    },

    //---------------- PRODIGE 🥈 ----------------

    Nova45: {
        id: "WPN_NOVA_45",
        nom: "Nova-45",
        image: "weapons/nova_45.png",
        type: "Pistolet",
        rarete: "Prodige🥈",

        degats: {
            humain: 20,
            animal: 20,
            creature: 14,
            vehicule: 5
        },

        effet: "tir",
        portee: "20m",
        puissance: 35,
        cadenceTir: 3,
        energieParTir: 10,
        niveauRequis: 5,
        prix: 60000
    },

    //---------------- LÉGENDAIRE 🥇 ----------------

    EclipseHandgun: {
        id: "WPN_ECLIPSE_HANDGUN",
        nom: "Eclipse Handgun",
        image: "weapons/eclipse_handgun.png",
        type: "Pistolet énergétique",
        rarete: "Légendaire🥇",

        degats: {
            humain: 30,
            animal: 30,
            creature: 22,
            vehicule: 7.5
        },

        effet: "tir",
        portee: "25m",
        puissance: 55,
        cadenceTir: 3,
        energieParTir: 10,
        niveauRequis: 10,
        prix: 250000
    },


    //================================================
    // 🔫 RIFLEGUNS
    //================================================

    //---------------- NOVICE 🥉 ----------------

    AR7Striker: {
        id: "WPN_AR7_STRIKER",
        nom: "AR-7 Striker",
        image: "weapons/ar7_striker.png",
        type: "Riflegun",
        rarete: "Novice🥉",

        degats: {
            humain: 18,
            animal: 18,
            creature: 12,
            vehicule: 4.5
        },

        effet: "tir",
        portee: "35m",
        puissance: 30,
        cadenceTir: 6,
        energieParTir: 10,
        niveauRequis: 1,
        prix: 30000
    },

    //---------------- PRODIGE 🥈 ----------------

    XR77Phantom: {
        id: "WPN_XR77_PHANTOM",
        nom: "XR-77 Phantom",
        image: "weapons/xr77_phantom.png",
        type: "Riflegun",
        rarete: "Prodige🥈",

        degats: {
            humain: 28,
            animal: 28,
            creature: 20,
            vehicule: 7
        },

        effet: "tir",
        portee: "45m",
        puissance: 50,
        cadenceTir: 8,
        energieParTir: 10,
        niveauRequis: 5,
        prix: 120000
    },

    //---------------- LÉGENDAIRE 🥇 ----------------

    CyberARX: {
        id: "WPN_CYBER_AR_X",
        nom: "Cyber AR-X",
        image: "weapons/cyber_ar_x.png",
        type: "Riflegun énergétique",
        rarete: "Légendaire🥇",

        degats: {
            humain: 40,
            animal: 40,
            creature: 30,
            vehicule: 10
        },

        effet: "tir",
        portee: "55m",
        puissance: 75,
        cadenceTir: 10,
        energieParTir: 10,
        niveauRequis: 10,
        prix: 350000
    },


    //================================================
    // 💥 SHOTGUNS
    //================================================

    //---------------- NOVICE 🥉 ----------------

    Thunder12: {
        id: "WPN_THUNDER_12",
        nom: "Thunder-12",
        image: "weapons/thunder_12.png",
        type: "Shotgun",
        rarete: "Novice🥉",

        degats: {
            humain: 30,
            animal: 30,
            creature: 22,
            vehicule: 7.5
        },

        effet: "tir",
        portee: "10m",
        puissance: 40,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 1,
        prix: 35000
    },

    //---------------- PRODIGE 🥈 ----------------

    RiotX: {
        id: "WPN_RIOT_X",
        nom: "Riot-X",
        image: "weapons/riot_x.png",
        type: "Shotgun",
        rarete: "Prodige🥈",

        degats: {
            humain: 42,
            animal: 42,
            creature: 30,
            vehicule: 10.5
        },

        effet: "tir",
        portee: "15m",
        puissance: 65,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 5,
        prix: 140000
    },

    //---------------- LÉGENDAIRE 🥇 ----------------

    Hellstorm: {
        id: "WPN_HELLSTORM",
        nom: "Hellstorm",
        image: "weapons/hellstorm.png",
        type: "Shotgun énergétique",
        rarete: "Légendaire🥇",

        degats: {
            humain: 55,
            animal: 55,
            creature: 40,
            vehicule: 13.75
        },

        effet: "tir",
        portee: "20m",
        puissance: 90,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 10,
        prix: 450000
    },


    //================================================
    // 🎯 SNIPERS
    //================================================

    //---------------- NOVICE 🥉 ----------------

    Scout50: {
        id: "WPN_SCOUT_50",
        nom: "Scout-50",
        image: "weapons/scout_50.png",
        type: "Sniper",
        rarete: "Novice🥉",

        degats: {
            humain: 40,
            animal: 40,
            creature: 30,
            vehicule: 10
        },

        effet: "tir",
        portee: "80m",
        puissance: 50,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 1,
        prix: 50000
    },

    //---------------- PRODIGE 🥈 ----------------

    PhantomSR: {
        id: "WPN_PHANTOM_SR",
        nom: "Phantom SR",
        image: "weapons/phantom_sr.png",
        type: "Sniper",
        rarete: "Prodige🥈",

        degats: {
            humain: 55,
            animal: 55,
            creature: 40,
            vehicule: 13.75
        },

        effet: "tir",
        portee: "120m",
        puissance: 75,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 5,
        prix: 180000
    },

    //---------------- LÉGENDAIRE 🥇 ----------------

    EclipseRailgun: {
        id: "WPN_ECLIPSE_RAILGUN",
        nom: "Eclipse Railgun",
        image: "weapons/eclipse_railgun.png",
        type: "Sniper énergétique",
        rarete: "Légendaire🥇",

        degats: {
            humain: 75,
            animal: 75,
            creature: 55,
            vehicule: 18.75
        },

        effet: "tir",
        portee: "180m",
        puissance: 100,
        cadenceTir: 1,
        energieParTir: 10,
        niveauRequis: 10,
        prix: 600000
    }

};


//================================================
// 🔎 RÉCUPÉRATION DES ARMES
//================================================

function getWeapon(id) {

    return Object.values(ElysiumWeapons).find(
        weapon => weapon.id === id
    ) || null;

}


//================================================
// 📦 RÉCUPÉRATION DE TOUTES LES ARMES
//================================================

function getAllWeapons() {

    return Object.values(ElysiumWeapons);

}


//================================================
// 🔎 RECHERCHE PAR NOM
//================================================

function getWeaponByName(nom) {

    return Object.values(ElysiumWeapons).find(
        weapon =>
            weapon.nom.toLowerCase() === nom.toLowerCase()
    ) || null;

}


//================================================
// 🎖️ RÉCUPÉRATION PAR RARETÉ
//================================================

function getWeaponsByRarity(rarete) {

    return Object.values(ElysiumWeapons).filter(
        weapon => weapon.rarete === rarete
    );

}


//================================================
// 🔫 RÉCUPÉRATION PAR TYPE
//================================================

function getWeaponsByType(type) {

    return Object.values(ElysiumWeapons).filter(
        weapon => weapon.type === type
    );

}


//================================================
// 📤 EXPORT
//================================================

module.exports = {
    ElysiumWeapons,
    getWeapon,
    getAllWeapons,
    getWeaponByName,
    getWeaponsByRarity,
    getWeaponsByType
};
