// WC 2026 Dashboard Data Layer
// v9 clean-data pass:
// - Removes fake scorers/injuries
// - Keeps real tournament structure in one place
// - Prepares the app for a future live API connection

const WC_DATA = {
  tournament: {
    name: "FIFA World Cup 2026",
    startDate: "2026-06-11T19:00:00",
    finalDate: "2026-07-19T23:59:59",
    hosts: [
      { code: "CA", name: "Canada", flag: "🇨🇦" },
      { code: "MX", name: "Mexico", flag: "🇲🇽" },
      { code: "US", name: "USA", flag: "🇺🇸" }
    ],
    metrics: {
      matches: 104,
      teams: 48,
      venues: 16,
      groups: 12
    }
  },

  groups: {
    A: [
      { code: "MEX", name: "Mexico", flag: "🇲🇽", p: 1, gd: "+2", pts: 3 },
      { code: "KOR", name: "South Korea", flag: "🇰🇷", p: 1, gd: "+1", pts: 3 },
      { code: "CZE", name: "Czechia", flag: "🇨🇿", p: 1, gd: "-1", pts: 0 },
      { code: "RSA", name: "South Africa", flag: "🇿🇦", p: 1, gd: "-2", pts: 0 }
    ],
    B: [
      { code: "CAN", name: "Canada", flag: "🇨🇦", p: 1, gd: "0", pts: 1 },
      { code: "BIH", name: "Bosnia & Herzegovina", flag: "🇧🇦", p: 1, gd: "0", pts: 1 },
      { code: "QAT", name: "Qatar", flag: "🇶🇦", p: 1, gd: "0", pts: 1 },
      { code: "SUI", name: "Switzerland", flag: "🇨🇭", p: 1, gd: "0", pts: 1 }
    ],
    C: [
      { code: "BRA", name: "Brazil", flag: "🇧🇷", p: 0, gd: "0", pts: 0 },
      { code: "MAR", name: "Morocco", flag: "🇲🇦", p: 0, gd: "0", pts: 0 },
      { code: "HTI", name: "Haiti", flag: "🇭🇹", p: 0, gd: "0", pts: 0 },
      { code: "SCO", name: "Scotland", flag: "🏴", p: 0, gd: "0", pts: 0 }
    ],
    D: [
      { code: "USA", name: "United States", flag: "🇺🇸", p: 1, gd: "+3", pts: 3 },
      { code: "AUS", name: "Australia", flag: "🇦🇺", p: 0, gd: "0", pts: 0 },
      { code: "TUR", name: "Türkiye", flag: "🇹🇷", p: 0, gd: "0", pts: 0 },
      { code: "PAR", name: "Paraguay", flag: "🇵🇾", p: 1, gd: "-3", pts: 0 }
    ],
    E: [
      { code: "GER", name: "Germany", flag: "🇩🇪", p: 0, gd: "0", pts: 0 },
      { code: "CUW", name: "Curaçao", flag: "🇨🇼", p: 0, gd: "0", pts: 0 },
      { code: "CIV", name: "Ivory Coast", flag: "🇨🇮", p: 0, gd: "0", pts: 0 },
      { code: "ECU", name: "Ecuador", flag: "🇪🇨", p: 0, gd: "0", pts: 0 }
    ],
    F: [
      { code: "NED", name: "Netherlands", flag: "🇳🇱", p: 0, gd: "0", pts: 0 },
      { code: "JPN", name: "Japan", flag: "🇯🇵", p: 0, gd: "0", pts: 0 },
      { code: "SWE", name: "Sweden", flag: "🇸🇪", p: 0, gd: "0", pts: 0 },
      { code: "TUN", name: "Tunisia", flag: "🇹🇳", p: 0, gd: "0", pts: 0 }
    ],
    G: [
      { code: "BEL", name: "Belgium", flag: "🇧🇪", p: 0, gd: "0", pts: 0 },
      { code: "EGY", name: "Egypt", flag: "🇪🇬", p: 0, gd: "0", pts: 0 },
      { code: "IRN", name: "Iran", flag: "🇮🇷", p: 0, gd: "0", pts: 0 },
      { code: "NZL", name: "New Zealand", flag: "🇳🇿", p: 0, gd: "0", pts: 0 }
    ],
    H: [
      { code: "ESP", name: "Spain", flag: "🇪🇸", p: 0, gd: "0", pts: 0 },
      { code: "CPV", name: "Cape Verde", flag: "🇨🇻", p: 0, gd: "0", pts: 0 },
      { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", p: 0, gd: "0", pts: 0 },
      { code: "URU", name: "Uruguay", flag: "🇺🇾", p: 0, gd: "0", pts: 0 }
    ],
    I: [
      { code: "FRA", name: "France", flag: "🇫🇷", p: 0, gd: "0", pts: 0 },
      { code: "SEN", name: "Senegal", flag: "🇸🇳", p: 0, gd: "0", pts: 0 },
      { code: "IRQ", name: "Iraq", flag: "🇮🇶", p: 0, gd: "0", pts: 0 },
      { code: "NOR", name: "Norway", flag: "🇳🇴", p: 0, gd: "0", pts: 0 }
    ],
    J: [
      { code: "ARG", name: "Argentina", flag: "🇦🇷", p: 0, gd: "0", pts: 0 },
      { code: "DZA", name: "Algeria", flag: "🇩🇿", p: 0, gd: "0", pts: 0 },
      { code: "AUT", name: "Austria", flag: "🇦🇹", p: 0, gd: "0", pts: 0 },
      { code: "JOR", name: "Jordan", flag: "🇯🇴", p: 0, gd: "0", pts: 0 }
    ],
    K: [
      { code: "POR", name: "Portugal", flag: "🇵🇹", p: 0, gd: "0", pts: 0 },
      { code: "COD", name: "DR Congo", flag: "🇨🇩", p: 0, gd: "0", pts: 0 },
      { code: "UZB", name: "Uzbekistan", flag: "🇺🇿", p: 0, gd: "0", pts: 0 },
      { code: "COL", name: "Colombia", flag: "🇨🇴", p: 0, gd: "0", pts: 0 }
    ],
    L: [
      { code: "ENG", name: "England", flag: "🏴", p: 0, gd: "0", pts: 0 },
      { code: "CRO", name: "Croatia", flag: "🇭🇷", p: 0, gd: "0", pts: 0 },
      { code: "GHA", name: "Ghana", flag: "🇬🇭", p: 0, gd: "0", pts: 0 },
      { code: "PAN", name: "Panama", flag: "🇵🇦", p: 0, gd: "0", pts: 0 }
    ]
  },

  liveMatches: [],

  todayMatches: [
    { time: "15:00", home: "🇶🇦 Qatar", away: "🇨🇭 Switzerland", group: "Group B", status: "Complete" },
    { time: "18:00", home: "🇧🇷 Brazil", away: "🇲🇦 Morocco", group: "Group C", status: "Upcoming" },
    { time: "21:00", home: "🇭🇹 Haiti", away: "🏴 Scotland", group: "Group C", status: "Upcoming" }
  ],

  recentResults: [
    { home: "🇲🇽 Mexico", score: "2 - 0", away: "🇿🇦 South Africa" },
    { home: "🇰🇷 South Korea", score: "2 - 1", away: "🇨🇿 Czechia" },
    { home: "🇨🇦 Canada", score: "1 - 1", away: "🇧🇦 Bosnia & Herzegovina" },
    { home: "🇺🇸 United States", score: "4 - 1", away: "🇵🇾 Paraguay" },
    { home: "🇶🇦 Qatar", score: "1 - 1", away: "🇨🇭 Switzerland" }
  ],

  scorers: [],

  alerts: [
    { type: "info", text: "📌 v9 clean-data pass: fake scorers and fake injury alerts removed." },
    { type: "info", text: "🔌 Live score API is not connected yet. Current live panel intentionally shows an empty state." },
    { type: "info", text: "🏆 Knockout bracket unlocks after group-stage qualification is known." }
  ],

  venues: [
    { name: "Atlanta Stadium", city: "Atlanta", country: "USA", matches: 8 },
    { name: "Boston Stadium", city: "Boston", country: "USA", matches: 7 },
    { name: "Dallas Stadium", city: "Dallas", country: "USA", matches: 9 },
    { name: "Guadalajara Stadium", city: "Guadalajara", country: "Mexico", matches: null },
    { name: "Houston Stadium", city: "Houston", country: "USA", matches: null },
    { name: "Kansas City Stadium", city: "Kansas City", country: "USA", matches: null },
    { name: "Los Angeles Stadium", city: "Los Angeles", country: "USA", matches: null },
    { name: "Mexico City Stadium", city: "Mexico City", country: "Mexico", matches: null },
    { name: "Miami Stadium", city: "Miami", country: "USA", matches: null },
    { name: "Monterrey Stadium", city: "Monterrey", country: "Mexico", matches: null },
    { name: "New York New Jersey Stadium", city: "New York / New Jersey", country: "USA", matches: null },
    { name: "Philadelphia Stadium", city: "Philadelphia", country: "USA", matches: null },
    { name: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", country: "USA", matches: null },
    { name: "Seattle Stadium", city: "Seattle", country: "USA", matches: null },
    { name: "Toronto Stadium", city: "Toronto", country: "Canada", matches: null },
    { name: "Vancouver Stadium", city: "Vancouver", country: "Canada", matches: null }
  ]
};


// Expose the data object to API connector scripts.
window.WC_DATA = WC_DATA;
