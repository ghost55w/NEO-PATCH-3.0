const ElysiumVehicles = {

    //================================================
    // 🏍️ MOTOS
    //================================================

    //---------------- NOVICE 🥉 ----------------

    ViperBike: {
        id: "VEH_VIPER_BIKE",
        nom: "Viper Bike",
        image: "vehicles/viper_bike.png",
        type: "Moto",
        rarete: "Novice🥉",

        vitesseMax: 30,
        resistance: 100,
        energie: 100,

        niveauRequis: 1,
        prix: 25000
    },

    //---------------- PRODIGE 🥈 ----------------

    PhantomRider: {
        id: "VEH_PHANTOM_RIDER",
        nom: "Phantom Rider",
        image: "vehicles/phantom_rider.png",
        type: "Moto",
        rarete: "Prodige🥈",

        vitesseMax: 45,
        resistance: 150,
        energie: 150,

        niveauRequis: 5,
        prix: 120000
    },

    //---------------- LÉGENDAIRE 🥇 ----------------

    EclipseBike: {
        id: "VEH_ECLIPSE_BIKE",
        nom: "Eclipse Bike",
        image: "vehicles/eclipse_bike.png",
        type: "Moto",
        rarete: "Légendaire🥇",

        vitesseMax: 60,
        resistance: 200,
        energie: 200,

        niveauRequis: 10,
        prix: 350000
    },


    //================================================
    // 🚗 VOITURES
    //================================================

    //---------------- NOVICE 🥉 ----------------

    RoadRunner: {
        id: "VEH_ROAD_RUNNER",
        nom: "Road Runner",
        image: "vehicles/road_runner.png",
        type: "Voiture",
        rarete: "Novice🥉",

        vitesseMax: 28,
        resistance: 150,
        energie: 150,

        niveauRequis: 1,
        prix: 30000
    },

    UrbanX: {
        id: "VEH_URBAN_X",
        nom: "Urban-X",
        image: "vehicles/urban_x.png",
        type: "Voiture",
        rarete: "Novice🥉",

        vitesseMax: 32,
        resistance: 160,
        energie: 160,

        niveauRequis: 1,
        prix: 40000
    },

    IronWolf: {
        id: "VEH_IRON_WOLF",
        nom: "Iron Wolf",
        image: "vehicles/iron_wolf.png",
        type: "Voiture blindée",
        rarete: "Novice🥉",

        vitesseMax: 24,
        resistance: 250,
        energie: 180,

        niveauRequis: 2,
        prix: 65000
    },


    //---------------- PRODIGE 🥈 ----------------

    NovaGT: {
        id: "VEH_NOVA_GT",
        nom: "Nova GT",
        image: "vehicles/nova_gt.png",
        type: "Voiture",
        rarete: "Prodige🥈",

        vitesseMax: 42,
        resistance: 220,
        energie: 220,

        niveauRequis: 5,
        prix: 120000
    },

    PhantomGT: {
        id: "VEH_PHANTOM_GT",
        nom: "Phantom GT",
        image: "vehicles/phantom_gt.png",
        type: "Voiture",
        rarete: "Prodige🥈",

        vitesseMax: 48,
        resistance: 210,
        energie: 230,

        niveauRequis: 6,
        prix: 160000
    },

    TitanSUV: {
        id: "VEH_TITAN_SUV",
        nom: "Titan SUV",
        image: "vehicles/titan_suv.png",
        type: "SUV blindé",
        rarete: "Prodige🥈",

        vitesseMax: 38,
        resistance: 350,
        energie: 280,

        niveauRequis: 7,
        prix: 200000
    },

    CyberCruiser: {
        id: "VEH_CYBER_CRUISER",
        nom: "Cyber Cruiser",
        image: "vehicles/cyber_cruiser.png",
        type: "Voiture",
        rarete: "Prodige🥈",

        vitesseMax: 45,
        resistance: 250,
        energie: 250,

        niveauRequis: 8,
        prix: 220000
    },


    //---------------- LÉGENDAIRE 🥇 ----------------

    EclipseGT: {
        id: "VEH_ECLIPSE_GT",
        nom: "Eclipse GT",
        image: "vehicles/eclipse_gt.png",
        type: "Supercar",
        rarete: "Légendaire🥇",

        vitesseMax: 70,
        resistance: 300,
        energie: 300,

        niveauRequis: 10,
        prix: 500000
    },

    HellRunner: {
        id: "VEH_HELL_RUNNER",
        nom: "Hell Runner",
        image: "vehicles/hell_runner.png",
        type: "Supercar blindée",
        rarete: "Légendaire🥇",

        vitesseMax: 65,
        resistance: 450,
        energie: 350,

        niveauRequis: 12,
        prix: 650000
    },

    XenoPhantom: {
        id: "VEH_XENO_PHANTOM",
        nom: "Xeno Phantom",
        image: "vehicles/xeno_phantom.png",
        type: "Hypercar",
        rarete: "Légendaire🥇",

        vitesseMax: 80,
        resistance: 350,
        energie: 400,

        niveauRequis: 15,
        prix: 900000
    }

};

module.exports = ElysiumVehicles; 
