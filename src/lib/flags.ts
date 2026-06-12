/**
 * Maps each team name (exactly as used in the draw) to its flag-icons code.
 * Codes are ISO 3166-1 alpha-2, except England/Scotland which use the
 * GB subdivision codes that flag-icons provides.
 */
export const TEAM_CODE: Record<string, string> = {
  // Shadi
  Turkey: "tr",
  Japan: "jp",
  Belgium: "be",
  Portugal: "pt",
  "Korea Republic": "kr",
  Jordan: "jo",
  // Leon
  "South Africa": "za",
  Sweden: "se",
  Iran: "ir",
  Germany: "de",
  Mexico: "mx",
  Panama: "pa",
  // Cole
  Canada: "ca",
  Egypt: "eg",
  "Côte d'Ivoire": "ci",
  "Czech Republic": "cz",
  Ghana: "gh",
  Norway: "no",
  // Fergus
  "Congo DR": "cd",
  "Bosnia and Herzegovina": "ba",
  "Curaçao": "cw",
  Australia: "au",
  Morocco: "ma",
  Croatia: "hr",
  // Josh
  Spain: "es",
  Tunisia: "tn",
  Netherlands: "nl",
  "Cape Verde Islands": "cv",
  Switzerland: "ch",
  "New Zealand": "nz",
  // Yaro
  Argentina: "ar",
  Iraq: "iq",
  Uzbekistan: "uz",
  England: "gb-eng",
  "United States": "us",
  Colombia: "co",
  // Connor
  Senegal: "sn",
  Brazil: "br",
  Paraguay: "py",
  "Saudi Arabia": "sa",
  Haiti: "ht",
  Ecuador: "ec",
  // Emanuele
  Algeria: "dz",
  Austria: "at",
  France: "fr",
  Qatar: "qa",
  Scotland: "gb-sct",
  Uruguay: "uy",
};
