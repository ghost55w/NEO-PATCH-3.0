// cards BLUE LOCK 🔷
const cardsBlueLock = {
  
  goal: "https://files.catbox.moe/7gww4i.mp4",
  image: "https://files.catbox.moe/l1lbgq.jpg",
  rank: "A",
  taille: "183cm",
  pieds: "droit"
},

"yukimiya Kenyu": {
  name: "Yukimiya",
  country: "Japan",
  ovr: 82,
  sho: 83,
  dri: 92,
  pas: 80,
  acc: 90,
  phy: 75,
  def: 80,
  goal: "https://files.catbox.moe/oog906.mp4",
  image: "https://files.catbox.moe/wx0gd3.jpg",
  rank: "A",
  taille: "184cm",
  pieds: "droit"
},

"hiori Yo": {
  name: "Hiori",
  country: "Japan",
  ovr: 76,
  sho: 78,
  dri: 80,
  pas: 90,
  acc: 75,
  phy: 75,
  def: 75,
  goal: "https://files.catbox.moe/cwmmhe.mp4",
  image: "https://files.catbox.moe/tc21iq.jpg",
  rank: "B",
  taille: "183cm",
  pieds: "gauche"
},

"Nanase Nijiro": {
  name: "Nanase",
  country: "Japan",
  ovr: 76,
  sho: 78,
  dri: 75,
  pas: 82,
  acc: 85,
  phy: 76,
  def: 78,
  goal: "",
  image: "https://files.catbox.moe/gt6h1k.jpg",
  rank: "B",
  taille: "178cm",
  pieds: "Ambidextre"
},


  ovr: 92,
  sho: 92,
  dri: 80,
  pas: 82,
  acc: 90,
  phy: 86,
  def: 80,
  goal: "",
  image: "https://files.catbox.moe/u1jpas.jpg",
  rank: "S",
  taille: "185cm",
  pieds: "droit"
},

"charles Chevalier": {
  name: "charles",
  country: "France",
  ovr: 93,
  sho: 80,
  dri: 88,
  pas: 98,
  acc: 85,
  phy: 70,
  def: 80,
  goal: "",
  image: "https://files.catbox.moe/d2zx5s.jpg",
  rank: "S",
  taille: "178cm",

// --------------------
// 🔵 FONCTION PRIX
// --------------------
function determinePrice(rank) {
  const rankPrices = {
    "SS": 3000000,
    "S": 1000000,
    "A": 500000,
    "B": 100000,
  };
  return rankPrices[rank] || 0;
}

// --------------------
// 🔵 CATÉGORIE SELON OVR
// --------------------
function determineCategory(ovr) {
  if (ovr >= 100) return "world_class";
  if (ovr >= 90) return "next_gen";
  if (ovr >= 80) return "rare";
  return "normal";
}

// --------------------
// 🔵 CRÉATION D’UNE CARD
// --------------------
function createCardFromBlueLock(name, data) {
  return {
    name: data.name,
    country: data.country,
    ovr: data.ovr,
    sho: data.sho,
    dri: data.dri,
    pas: data.pas,
    acc: data.acc,
    phy: data.phy,
    def: data.def,
    goal: data.goal,
    image: data.image,
    rank: data.rank,
    taille: data.taille,
    pieds: data.pieds,
    category: determineCategory(data.ovr),
    price: determinePrice(data.rank) + (data.ovr * 1000),
    placement:
      data.rank === "SS"
        ? "elite"
        : data.rank === "S"
        ? "world_class"
        : "normal"
  };
}
// --------------------
// 🔵 CRÉATION D’UNE CARD
// --------------------
function createCardFromBlueLock(name, data) {
  return {
    name: data.name,
    country: data.country,
    ovr: data.ovr,
    sho: data.sho,
    dri: data.dri,
    pas: data.pas,
    acc: data.acc,
    phy: data.phy,
    def: data.def,
    goal: data.goal, // ⬅️ conservé ici si tu en as besoin ailleurs
    image: data.image,
    rank: data.rank,
    taille: data.taille,
    pieds: data.pieds,
    category: determineCategory(data.ovr),
    price: determinePrice(data.rank) + (data.ovr * 1000),
    placement:
      data.rank === "SS"
        ? "elite"
        : data.rank === "S"
        ? "world_class"
        : "normal"
  };
}

// --------------------
// 🔵 GROUPER PAR PLACEMENT (SANS goal)
// --------------------
function groupCardsByPlacement(cardsArray) {
  const grouped = {};
  for (const card of cardsArray) {
    const place = card.placement;
    if (!grouped[place]) grouped[place] = [];

    grouped[place].push({
      name: card.name,
      country: card.country,
      rank: card.rank,
      ovr: card.ovr,
      category: card.category,
      image: card.image,
      price: card.price,
      taille: card.taille,
      pieds: card.pieds
    });
  }
  return grouped;
}

// --------------------
// 🔵 GÉNÉRER TOUTES LES CARTES
// --------------------
function generateCardsFromBlueLock(cardsObject) {
  const all = [];
  for (const [key, value] of Object.entries(cardsObject)) {
    const card = createCardFromBlueLock(key, value);
    all.push(card);
  }
  return groupCardsByPlacement(all);
}

// --------------------
// 🔵 EXPORT COMPLET
// --------------------
const groupedCards = generateCardsFromBlueLock(cardsBlueLock);

module.exports = { cardsBlueLock, groupedCards, generateCardsFromBlueLock };
