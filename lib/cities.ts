export interface City {
  name: string; // Hebrew name exactly as it appears in HFC alerts
  lat: number;
  lng: number;
}

/**
 * Static mapping of HFC Hebrew city/zone names to centroid coordinates.
 * Built from Israeli CBS open data and HFC district list.
 * Update periodically if HFC adds/renames zones.
 */
export const CITIES: City[] = [
  // Tel Aviv area
  { name: "תל אביב - מרכז העיר", lat: 32.0739, lng: 34.7898 },
  { name: "תל אביב - צפון", lat: 32.1010, lng: 34.7921 },
  { name: "תל אביב - דרום", lat: 32.0456, lng: 34.7580 },
  { name: "תל אביב - יפו", lat: 32.0500, lng: 34.7650 },
  { name: "גוש דן", lat: 32.0500, lng: 34.8000 },

  // Jerusalem
  { name: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { name: "ירושלים - מרכז", lat: 31.7800, lng: 35.2200 },

  // Haifa area
  { name: "חיפה", lat: 32.7940, lng: 34.9896 },
  { name: "חיפה - כרמל", lat: 32.7500, lng: 34.9700 },
  { name: "קריית ים", lat: 32.8451, lng: 35.0681 },
  { name: "קריית ביאליק", lat: 32.8392, lng: 35.0878 },
  { name: "קריית מוצקין", lat: 32.8360, lng: 35.0748 },
  { name: "קריית אתא", lat: 32.8117, lng: 35.1086 },
  { name: "טירת כרמל", lat: 32.7649, lng: 34.9700 },
  { name: "נשר", lat: 32.7638, lng: 35.0467 },
  { name: "עתלית", lat: 32.6921, lng: 34.9425 },

  // Gush Dan / Central
  { name: "ראשון לציון", lat: 31.9730, lng: 34.7925 },
  { name: "פתח תקווה", lat: 32.0869, lng: 34.8878 },
  { name: "בני ברק", lat: 32.0840, lng: 34.8330 },
  { name: "חולון", lat: 32.0109, lng: 34.7792 },
  { name: "בת ים", lat: 32.0167, lng: 34.7500 },
  { name: "רמת גן", lat: 32.0682, lng: 34.8239 },
  { name: "גבעתיים", lat: 32.0694, lng: 34.8124 },
  { name: "אור יהודה", lat: 32.0265, lng: 34.8545 },
  { name: "גבעת שמואל", lat: 32.0778, lng: 34.8536 },
  { name: "קריית אונו", lat: 32.0648, lng: 34.8552 },
  { name: "יהוד-מונוסון", lat: 32.0323, lng: 34.8881 },
  { name: "אלעד", lat: 32.0491, lng: 34.9511 },
  { name: "ראש העין", lat: 32.0956, lng: 34.9568 },

  // Sharon / North Center
  { name: "נתניה", lat: 32.3215, lng: 34.8532 },
  { name: "הרצליה", lat: 32.1653, lng: 34.8439 },
  { name: "כפר סבא", lat: 32.1783, lng: 34.9078 },
  { name: "רעננה", lat: 32.1842, lng: 34.8707 },
  { name: "הוד השרון", lat: 32.1500, lng: 34.8900 },
  { name: "רמת השרון", lat: 32.1451, lng: 34.8367 },
  { name: "השרון", lat: 32.3000, lng: 34.9000 },
  { name: "חדרה", lat: 32.4351, lng: 34.9198 },
  { name: "פרדס חנה-כרכור", lat: 32.4700, lng: 34.9700 },
  { name: "זכרון יעקב", lat: 32.5703, lng: 34.9516 },
  { name: "עמק חפר", lat: 32.4000, lng: 34.9200 },
  { name: "טייבה", lat: 32.2671, lng: 35.0050 },
  { name: "טירה", lat: 32.2336, lng: 34.9527 },
  { name: "קלנסווה", lat: 32.2871, lng: 34.9740 },
  { name: "ג'לג'וליה", lat: 32.1600, lng: 34.9500 },

  // Shfela / South Center
  { name: "רחובות", lat: 31.8928, lng: 34.8113 },
  { name: "נס ציונה", lat: 31.9280, lng: 34.7975 },
  { name: "רמלה", lat: 31.9298, lng: 34.8706 },
  { name: "לוד", lat: 31.9518, lng: 34.8969 },
  { name: "יבנה", lat: 31.8765, lng: 34.7437 },
  { name: "גדרה", lat: 31.8121, lng: 34.7764 },
  { name: "גן יבנה", lat: 31.7876, lng: 34.7082 },
  { name: "שפלה", lat: 31.7000, lng: 34.8000 },
  { name: "חבל לכיש", lat: 31.5000, lng: 34.8000 },
  { name: "בית שמש", lat: 31.7445, lng: 34.9896 },
  { name: "מודיעין-מכבים-רעות", lat: 31.8978, lng: 35.0106 },

  // South
  { name: "אשדוד", lat: 31.8044, lng: 34.6553 },
  { name: "אשקלון", lat: 31.6688, lng: 34.5742 },
  { name: "שדרות", lat: 31.5247, lng: 34.5971 },
  { name: "נתיבות", lat: 31.4165, lng: 34.5873 },
  { name: "אופקים", lat: 31.3161, lng: 34.6226 },
  { name: "חבל אשכול", lat: 31.3500, lng: 34.5000 },
  { name: "באר שבע", lat: 31.2520, lng: 34.7915 },
  { name: "עומר", lat: 31.2628, lng: 34.8476 },
  { name: "להבים", lat: 31.3658, lng: 34.8134 },
  { name: "הנגב הצפוני", lat: 31.3000, lng: 34.6000 },
  { name: "קריית גת", lat: 31.6100, lng: 34.7700 },
  { name: "ירוחם", lat: 30.9881, lng: 34.9305 },
  { name: "דימונה", lat: 31.0686, lng: 35.0316 },
  { name: "ערד", lat: 31.2589, lng: 35.2128 },
  { name: "מצפה רמון", lat: 30.6106, lng: 34.8007 },
  { name: "הנגב הדרומי", lat: 30.5000, lng: 34.9000 },
  { name: "אילת", lat: 29.5581, lng: 34.9482 },

  // Gaza envelope / Otef
  { name: "עוטף עזה", lat: 31.4000, lng: 34.5000 },
  { name: "אשכול", lat: 31.3500, lng: 34.5000 },

  // North
  { name: "עפולה", lat: 32.6066, lng: 35.2892 },
  { name: "נצרת", lat: 32.6996, lng: 35.3030 },
  { name: "נוף הגליל", lat: 32.7044, lng: 35.3286 },
  { name: "יוקנעם עילית", lat: 32.6556, lng: 35.1000 },
  { name: "מגדל העמק", lat: 32.6781, lng: 35.2403 },
  { name: "עמק יזרעאל", lat: 32.6500, lng: 35.2000 },
  { name: "עמק הירדן", lat: 32.5000, lng: 35.5500 },
  { name: "בית שאן", lat: 32.4983, lng: 35.4979 },
  { name: "בקעת בית שאן", lat: 32.5000, lng: 35.5000 },
  { name: "עכו", lat: 32.9261, lng: 35.0719 },
  { name: "נהריה", lat: 33.0064, lng: 35.0955 },
  { name: "כרמיאל", lat: 32.9186, lng: 35.2974 },
  { name: "שפרעם", lat: 32.8059, lng: 35.1700 },
  { name: "אום אל פחם", lat: 32.5189, lng: 35.1553 },
  { name: "גליל עליון", lat: 33.0000, lng: 35.3000 },
  { name: "גליל תחתון", lat: 32.7000, lng: 35.3000 },
  { name: "קריית שמונה", lat: 33.2072, lng: 35.5708 },
  { name: "מטולה", lat: 33.2754, lng: 35.5700 },
  { name: "ריחאניה", lat: 33.1000, lng: 35.5300 },
  { name: "טבריה", lat: 32.7940, lng: 35.5299 },
  { name: "כנרת", lat: 32.8000, lng: 35.6000 },
  { name: "צפת", lat: 32.9648, lng: 35.4959 },

  // Golan / North East
  { name: "רמת הגולן", lat: 33.0000, lng: 35.7500 },
  { name: "מג'דל שמס", lat: 33.2700, lng: 35.7700 },
  { name: "מסעדה", lat: 33.2400, lng: 35.7700 },
  { name: "בוקעתא", lat: 33.2300, lng: 35.7500 },
  { name: "קצרין", lat: 32.9916, lng: 35.6900 },
  { name: "החרמון", lat: 33.3500, lng: 35.7000 },

  // West Bank / Judea & Samaria (Israeli settlements receive HFC alerts)
  { name: "אריאל", lat: 32.1061, lng: 35.1673 },
  { name: "מעלה אדומים", lat: 31.7727, lng: 35.2982 },
  { name: "קרני שומרון", lat: 32.1600, lng: 35.1300 },
  { name: "גוש עציון", lat: 31.6500, lng: 35.1200 },
  { name: "אפרת", lat: 31.6600, lng: 35.1500 },
  { name: "בית אל", lat: 31.9300, lng: 35.2200 },
];

/** Lookup a city by its Hebrew name (exact match). */
export function findCity(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}
