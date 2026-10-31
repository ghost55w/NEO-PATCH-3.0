
const teamsFC = {

  // ==========================================
  // 🇪🇸 LIGA
  // ==========================================
  liga: [
    { id: "real_madrid", name: "Real Madrid", league: "La Liga", country: "Espagne" },
    { id: "barcelona", name: "FC Barcelona", league: "La Liga", country: "Espagne" },
    { id: "atletico_madrid", name: "Atlético Madrid", league: "La Liga", country: "Espagne" },
    { id: "athletic_club", name: "Athletic Club", league: "La Liga", country: "Espagne" },
    { id: "sevilla", name: "Sevilla FC", league: "La Liga", country: "Espagne" },
    { id: "real_sociedad", name: "Real Sociedad", league: "La Liga", country: "Espagne" },
    { id: "villarreal", name: "Villarreal CF", league: "La Liga", country: "Espagne" },
    { id: "real_betis", name: "Real Betis", league: "La Liga", country: "Espagne" },
    { id: "valencia", name: "Valencia CF", league: "La Liga", country: "Espagne" },
    { id: "osasuna", name: "CA Osasuna", league: "La Liga", country: "Espagne" }
  ],

  // ==========================================
  // 🏴 PREMIER LEAGUE
  // ==========================================
  premier_league: [
    { id: "manchester_city", name: "Manchester City", league: "Premier League", country: "Angleterre" },
    { id: "arsenal", name: "Arsenal FC", league: "Premier League", country: "Angleterre" },
    { id: "liverpool", name: "Liverpool FC", league: "Premier League", country: "Angleterre" },
    { id: "manchester_united", name: "Manchester United", league: "Premier League", country: "Angleterre" },
    { id: "chelsea", name: "Chelsea FC", league: "Premier League", country: "Angleterre" },
    { id: "tottenham", name: "Tottenham Hotspur", league: "Premier League", country: "Angleterre" },
    { id: "newcastle", name: "Newcastle United", league: "Premier League", country: "Angleterre" },
    { id: "aston_villa", name: "Aston Villa", league: "Premier League", country: "Angleterre" },
    { id: "brighton", name: "Brighton", league: "Premier League", country: "Angleterre" },
    { id: "everton", name: "Everton FC", league: "Premier League", country: "Angleterre" }
  ],

  // ==========================================
  // 🇮🇹 SERIE A
  // ==========================================
  serie_a: [
    { id: "inter", name: "Inter Milan", league: "Serie A", country: "Italie" },
    { id: "ac_milan", name: "AC Milan", league: "Serie A", country: "Italie" },
    { id: "juventus", name: "Juventus", league: "Serie A", country: "Italie" },
    { id: "napoli", name: "SSC Napoli", league: "Serie A", country: "Italie" },
    { id: "roma", name: "AS Roma", league: "Serie A", country: "Italie" },
    { id: "lazio", name: "SS Lazio", league: "Serie A", country: "Italie" },
    { id: "atalanta", name: "Atalanta BC", league: "Serie A", country: "Italie" },
    { id: "fiorentina", name: "ACF Fiorentina", league: "Serie A", country: "Italie" },
    { id: "bologna", name: "Bologna FC", league: "Serie A", country: "Italie" },
    { id: "como", name: "Como 1907", league: "Serie A", country: "Italie" }
  ],

  // ==========================================
  // 🇩🇪 BUNDESLIGA
  // ==========================================
  bundesliga: [
    { id: "bayern", name: "Bayern Munich", league: "Bundesliga", country: "Allemagne" },
    { id: "dortmund", name: "Borussia Dortmund", league: "Bundesliga", country: "Allemagne" },
    { id: "rb_leipzig", name: "RB Leipzig", league: "Bundesliga", country: "Allemagne" },
    { id: "leverkusen", name: "Bayer Leverkusen", league: "Bundesliga", country: "Allemagne" },
    { id: "stuttgart", name: "VfB Stuttgart", league: "Bundesliga", country: "Allemagne" },
    { id: "frankfurt", name: "Eintracht Frankfurt", league: "Bundesliga", country: "Allemagne" },
    { id: "gladbach", name: "Borussia Mönchengladbach", league: "Bundesliga", country: "Allemagne" },
    { id: "freiburg", name: "SC Freiburg", league: "Bundesliga", country: "Allemagne" },
    { id: "hoffenheim", name: "TSG Hoffenheim", league: "Bundesliga", country: "Allemagne" },
    { id: "hamburg", name: "Hamburger SV", league: "Bundesliga", country: "Allemagne" }
  ],

  // ==========================================
  // 🇫🇷 LIGUE 1
  // ==========================================
  ligue_1: [
    { id: "psg", name: "Paris Saint-Germain", league: "Ligue 1", country: "France" },
    { id: "marseille", name: "Olympique de Marseille", league: "Ligue 1", country: "France" },
    { id: "lyon", name: "Olympique Lyonnais", league: "Ligue 1", country: "France" },
    { id: "monaco", name: "AS Monaco", league: "Ligue 1", country: "France" },
    { id: "lille", name: "LOSC Lille", league: "Ligue 1", country: "France" },
    { id: "lens", name: "RC Lens", league: "Ligue 1", country: "France" },
    { id: "rennes", name: "Stade Rennais", league: "Ligue 1", country: "France" },
    { id: "nice", name: "OGC Nice", league: "Ligue 1", country: "France" },
    { id: "strasbourg", name: "RC Strasbourg", league: "Ligue 1", country: "France" },
    { id: "toulouse", name: "Toulouse FC", league: "Ligue 1", country: "France" }
  ],

  // ==========================================
  // 🇵🇹 LIGA PORTUGAL
  // ==========================================
  liga_portugal: [
    { id: "benfica", name: "SL Benfica", league: "Liga Portugal", country: "Portugal" },
    { id: "porto", name: "FC Porto", league: "Liga Portugal", country: "Portugal" },
    { id: "sporting", name: "Sporting CP", league: "Liga Portugal", country: "Portugal" },
    { id: "braga", name: "SC Braga", league: "Liga Portugal", country: "Portugal" },
    { id: "vitoria_guimaraes", name: "Vitória SC", league: "Liga Portugal", country: "Portugal" },
    { id: "casa_pia", name: "Casa Pia AC", league: "Liga Portugal", country: "Portugal" },
    { id: "famalicao", name: "FC Famalicão", league: "Liga Portugal", country: "Portugal" },
    { id: "gil_vicente", name: "Gil Vicente FC", league: "Liga Portugal", country: "Portugal" },
    { id: "rio_ave", name: "Rio Ave FC", league: "Liga Portugal", country: "Portugal" },
    { id: "moreirense", name: "Moreirense FC", league: "Liga Portugal", country: "Portugal" }
  ]

};

// ==========================================
// 🔎 FONCTIONS UTILITAIRES
// ==========================================

// Récupérer les équipes d'un championnat
function getTeamsByLeague(league) {
  return teamsFC[league] || [];
}

// Rechercher une équipe par son ID ou son nom
function findTeam(query) {
  const search = String(query || "").toLowerCase().trim();

  if (!search) return null;

  return Object.values(teamsFC)
    .flat()
    .find(team =>
      team.id === search ||
      team.name.toLowerCase() === search
    ) || null;
}

// Récupérer toutes les équipes
function getAllTeams() {
  return Object.values(teamsFC).flat();
}

// Export
module.exports = {
  teamsFC,
  getTeamsByLeague,
  findTeam,
  getAllTeams
};
