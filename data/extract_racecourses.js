const fs = require('fs');
const path = require('path');

const countryCodeToName = {
  GB: 'United Kingdom',
  IRE: 'Ireland',
  AUS: 'Australia',
  USA: 'United States',
  CAN: 'Canada',
  NZ: 'New Zealand',
  HK: 'Hong Kong',
  FR: 'France',
  GER: 'Germany',
  SAF: 'South Africa',
  JPN: 'Japan',
  TUR: 'Turkey',
  ITY: 'Italy',
  ESP: 'Spain',
  CHI: 'Chile',
  DEN: 'Denmark',
  SWI: 'Switzerland',
  SWE: 'Sweden',
  UAE: 'United Arab Emirates',
  SPA: 'Spain',
  PERTH: 'Australia',
  BRZ: 'Brazil',
  ARG: 'Argentina',
  SIN: 'Singapore'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeCourse(query, countryCode = null) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  if (countryCode) {
    url.searchParams.set('countrycodes', countryCode.toLowerCase());
  }
  url.searchParams.set('q', query);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'aky6IAT355-horseracing/1.0 (github.com)',
      }
    });
    const results = await response.json();
    if (results && results.length > 0) {
      const place = results[0];
      return { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    }
  } catch (err) {
    console.error(`Geocoding failed for ${query}:`, err.message || err);
  }
  return null;
}

function getSearchTerms(courseName, countryCode) {
  const nameIsGeneric = /^[A-Za-z\s\-']+$/.test(courseName) && courseName.split(' ').length <= 2;
  const useRacetrack = /\b(USA|CAN|AUS|NZ|SAF|UAE|JPN|KSA|ARG|BRZ|CHI|HK|SIN)\b/i.test(courseName);
  const hasParkOrDowns = /\b(Park|Downs|Raceway|Racetrack|Track)\b/i.test(courseName);

  const base = courseName;
  const terms = [];

  if (hasParkOrDowns || useRacetrack) {
    terms.push(`${base} horse racing`);
    terms.push(`${base} racetrack`);
    terms.push(`${base}`);
  } else {
    terms.push(`${base} racecourse`);
    terms.push(`${base} horse racing`);
    terms.push(`${base} racetrack`);
    terms.push(`${base}`);
  }

  if (nameIsGeneric) {
    terms.unshift(`${base} horse racing`);
  }

  return terms;
}

async function geocodeUnmatched(courses) {
  const results = {};
  for (const courseName of courses) {
    const normalized = normalizeCourse(courseName);
    const countryCodeMatch = courseName.match(/\(([A-Z]{2,4})\)/);
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : null;
    let queryName = normalized || courseName;

    const terms = getSearchTerms(queryName, countryCode);
    let coords = null;
    let usedQuery = null;

    for (const term of terms) {
      let query = term;
      if (countryCode && term === queryName) {
        query = `${term}`;
      }
      if (!coords) {
        console.log(`Geocoding: ${courseName} -> ${query}`);
        coords = await geocodeCourse(query, countryCode);
        if (coords) {
          usedQuery = query;
          break;
        }
        await sleep(1200);
      }
    }

    if (coords) {
      results[courseName] = coords;
      console.log(`  Found ${coords.lat}, ${coords.lng} via query: ${usedQuery}`);
    } else {
      console.warn(`  No geocode result for ${courseName}`);
    }
  }
  return results;
}

// Comprehensive racecourse coordinates database (includes international courses)
const courseCoordinates = {
  // UK Courses
  "Ascot": { lat: 51.4096, lng: -0.5856 },
  "Ayr": { lat: 55.4667, lng: -4.6333 },
  "Bangor-on-Dee": { lat: 52.9375, lng: -3.0875 },
  "Bath": { lat: 51.3781, lng: -2.3708 },
  "Beverley": { lat: 53.8333, lng: -0.4333 },
  "Brighton": { lat: 50.8278, lng: -0.1528 },
  "Carlisle": { lat: 54.8942, lng: -2.9370 },
  "Cartmel": { lat: 54.3333, lng: -3.0333 },
  "Catterick": { lat: 54.3753, lng: -1.6312 },
  "Chelmsford (AW)": { lat: 51.7742, lng: 0.4411 },
  "Cheltenham": { lat: 51.9194, lng: -2.0581 },
  "Chepstow": { lat: 51.6403, lng: -2.6767 },
  "Chester": { lat: 53.2036, lng: -2.8835 },
  "Doncaster": { lat: 53.5228, lng: -1.1136 },
  "Epsom": { lat: 51.3233, lng: -0.2833 },
  "Exeter": { lat: 50.7172, lng: -3.4708 },
  "Fakenham": { lat: 52.8667, lng: 0.8667 },
  "Ffos Las": { lat: 51.8000, lng: -4.0833 },
  "Fontwell Park": { lat: 50.8572, lng: -0.4817 },
  "Goodwood": { lat: 50.8714, lng: -0.6786 },
  "Haydock Park": { lat: 53.4678, lng: -2.6603 },
  "Hereford": { lat: 52.0567, lng: -2.7167 },
  "Hexham": { lat: 54.9736, lng: -2.1039 },
  "Huntingdon": { lat: 52.3300, lng: -0.1867 },
  "Kelso": { lat: 55.6000, lng: -2.4333 },
  "Kempton Park": { lat: 51.4183, lng: -0.4094 },
  "Leicester": { lat: 52.6211, lng: -1.2067 },
  "Lingfield Park": { lat: 51.1744, lng: -0.0064 },
  "Ludlow": { lat: 52.3681, lng: -2.7139 },
  "Market Rasen": { lat: 53.3872, lng: -0.3375 },
  "Musselburgh": { lat: 55.9428, lng: -3.0500 },
  "Newbury": { lat: 51.3925, lng: -1.3217 },
  "Newcastle": { lat: 54.9606, lng: -1.6204 },
  "Newmarket": { lat: 52.2446, lng: 0.4074 },
  "Newton Abbot": { lat: 50.5292, lng: -3.5931 },
  "Nottingham": { lat: 52.9500, lng: -1.1333 },
  "Perth": { lat: 56.3967, lng: -3.4333 },
  "Plumpton": { lat: 50.9042, lng: 0.1833 },
  "Pontefract": { lat: 53.6917, lng: -1.3167 },
  "Redcar": { lat: 54.5833, lng: -1.0667 },
  "Ripon": { lat: 54.1333, lng: -1.5167 },
  "Salford": { lat: 53.4833, lng: -2.2833 },
  "Sandown Park": { lat: 51.3708, lng: -0.3367 },
  "Sedgefield": { lat: 54.6500, lng: -1.4500 },
  "Southwell": { lat: 53.0833, lng: -0.9500 },
  "Southwell (AW)": { lat: 53.0833, lng: -0.9500 },
  "Stratford-upon-Avon": { lat: 52.1917, lng: -1.7167 },
  "Taunton": { lat: 51.0142, lng: -3.1028 },
  "Thirsk": { lat: 54.2333, lng: -1.3667 },
  "Towcester": { lat: 52.1333, lng: -0.9833 },
  "Uttoxeter": { lat: 52.9000, lng: -1.8667 },
  "Warwick": { lat: 52.2833, lng: -1.5833 },
  "Wetherby": { lat: 53.9333, lng: -1.3833 },
  "Wincanton": { lat: 51.0542, lng: -2.4097 },
  "Windsor": { lat: 51.4826, lng: -0.6089 },
  "Wolverhampton": { lat: 52.5833, lng: -2.1167 },
  "Worcester": { lat: 52.2000, lng: -2.2167 },
  "Yarmouth": { lat: 52.6167, lng: 1.7167 },
  "York": { lat: 53.9626, lng: -1.0819 },
  "Aintree": { lat: 53.4769, lng: -2.9424 },
  
  // Irish Courses
  "Ballinrobe (IRE)": { lat: 53.5667, lng: -9.2667 },
  "Bellewstown (IRE)": { lat: 53.6000, lng: -6.4500 },
  "Clonmel (IRE)": { lat: 52.3500, lng: -7.7167 },
  "Cork (IRE)": { lat: 52.1333, lng: -8.5667 },
  "Curragh (IRE)": { lat: 53.3667, lng: -6.7500 },
  "Downpatrick (IRE)": { lat: 54.3333, lng: -5.7167 },
  "Down Royal (IRE)": { lat: 54.4333, lng: -6.0667 },
  "Dundalk (IRE)": { lat: 54.0000, lng: -6.4167 },
  "Dundalk (AW) (IRE)": { lat: 54.0000, lng: -6.4167 },
  "Fairyhouse (IRE)": { lat: 53.5000, lng: -6.1500 },
  "Galway (IRE)": { lat: 53.2667, lng: -9.0167 },
  "Gowran Park (IRE)": { lat: 52.4500, lng: -7.0500 },
  "Killarney (IRE)": { lat: 52.0333, lng: -9.5000 },
  "Leopardstown (IRE)": { lat: 53.2833, lng: -6.2167 },
  "Listowel (IRE)": { lat: 52.4500, lng: -9.4833 },
  "Naas (IRE)": { lat: 53.4333, lng: -6.6667 },
  "Punchestown (IRE)": { lat: 53.2667, lng: -6.5667 },
  "Roscommon (IRE)": { lat: 53.6333, lng: -8.1833 },
  "Sligo (IRE)": { lat: 54.2667, lng: -8.4833 },
  "Thurles (IRE)": { lat: 52.6667, lng: -7.6000 },
  "Tramore (IRE)": { lat: 52.1667, lng: -7.8167 },
  "Curragh (IRE) (ARAB)": { lat: 53.3667, lng: -6.7500 },
  
  // France
  "Auteuil (FR)": { lat: 48.8561, lng: 2.2495 },
  "Chantilly (FR)": { lat: 49.1929, lng: 2.3964 },
  "Chantilly (fr) (ARAB)": { lat: 49.1929, lng: 2.3964 },
  "Clairefontaine (FR)": { lat: 49.2231, lng: 0.4892 },
  "Compiegne (FR)": { lat: 49.4195, lng: 2.8061 },
  "Deauville (FR)": { lat: 49.3495, lng: 0.0877 },
  "Dieppe (FR)": { lat: 49.9265, lng: 1.0810 },
  "Enghien (FR)": { lat: 48.9704, lng: 2.3106 },
  "Fontainebleau (FR)": { lat: 48.4028, lng: 2.6992 },
  "Longchamp (FR)": { lat: 48.8447, lng: 2.2349 },
  "Lyon-Parilly (FR)": { lat: 45.7242, lng: 4.8825 },
  "Marseille-Borely (FR)": { lat: 43.2965, lng: 5.3708 },
  "Maisons-Laffitte (FR)": { lat: 48.9492, lng: 2.1397 },
  "Toulouse (FR)": { lat: 43.5853, lng: 1.4619 },
  
  // Germany
  "Baden-Baden (GER)": { lat: 48.7569, lng: 8.2418 },
  "Cologne (GER)": { lat: 51.0459, lng: 6.9607 },
  "Dortmund (GER)": { lat: 51.5136, lng: 7.4653 },
  "Dusseldorf (GER)": { lat: 51.4360, lng: 6.7461 },
  "Frankfurt (GER)": { lat: 50.0951, lng: 8.6827 },
  "Hamburg (GER)": { lat: 53.5582, lng: 9.9482 },
  "Munich (GER)": { lat: 48.1351, lng: 11.5820 },
  "Mulheim (GER)": { lat: 51.4397, lng: 7.0053 },
  
  // Italy
  "Capannelle (ITY)": { lat: 41.8832, lng: 12.5664 },
  "Milan (ITY)": { lat: 45.5017, lng: 9.1350 },
  "Rome (ITY)": { lat: 41.9028, lng: 12.4964 },
  
  // Spain
  "Barcelona (SPA)": { lat: 41.3874, lng: 2.1686 },
  "Madrid (SPA)": { lat: 40.4168, lng: -3.7038 },
  
  // Asia
  "Sha Tin (HK)": { lat: 22.3038, lng: 114.2129 },
  "Happy Valley (HK)": { lat: 22.2786, lng: 114.1816 },
  "Chukyo (JPN)": { lat: 35.1217, lng: 136.9633 },
  "Hanshin (JPN)": { lat: 34.8189, lng: 135.2981 },
  "Tokyo (JPN)": { lat: 35.6762, lng: 139.7674 },
  "Kyoto (JPN)": { lat: 35.0116, lng: 135.7681 },
  
  // Australia
  "Flemington (AUS)": { lat: -37.8064, lng: 144.9590 },
  "Doomben (AUS)": { lat: -27.4239, lng: 153.0839 },
  "Eagle Farm (AUS)": { lat: -27.3606, lng: 153.0956 },
  "Moonee Valley (AUS)": { lat: -37.7903, lng: 144.9364 },
  "Caulfield (AUS)": { lat: -37.8926, lng: 144.9997 },
  "Randwick (AUS)": { lat: -33.9959, lng: 151.1761 },
  "Ascot (AUS)": { lat: -31.9505, lng: 115.8605 },
  "Ballarat (AUS)": { lat: -37.5630, lng: 143.8505 },
  "Bendigo (AUS)": { lat: -36.7597, lng: 144.2711 },
  "Geelong (AUS)": { lat: -38.1502, lng: 144.3616 },
  "Cranbourne (AUS)": { lat: -38.1267, lng: 145.2100 },
  "Sunshine Coast (AUS)": { lat: -26.6987, lng: 153.0976 },
  "Grafton (AUS)": { lat: -29.1779, lng: 152.9350 },
  "Newcastle (AUS)": { lat: -32.9190, lng: 151.7781 },
  "Rosehill (AUS)": { lat: -33.8467, lng: 151.0167 },
  "Canterbury Park (AUS)": { lat: -33.9094, lng: 151.1131 },
  "Gold Coast (AUS)": { lat: -27.9758, lng: 153.4269 },
  "Hobart (AUS)": { lat: -42.8821, lng: 147.3272 },
  "Adelaide (AUS)": { lat: -34.9285, lng: 138.6007 },
  "Perth (AUS)": { lat: -31.9779, lng: 115.8455 },
  
  // New Zealand
  "Ellerslie (NZ)": { lat: -37.8150, lng: 174.8317 },
  "Awapuni (NZ)": { lat: -40.4167, lng: 175.6167 },
  "Hastings (NZ)": { lat: -39.6442, lng: 176.8497 },
  "Riccarton (NZ)": { lat: -43.5310, lng: 172.6310 },
  "Arawa Park (NZ)": { lat: -38.1333, lng: 176.2500 },
  "Cambridge (NZ)": { lat: -37.8933, lng: 175.4667 },
  "Matamata (NZ)": { lat: -37.8147, lng: 175.7639 },
  "Pukekohe (NZ)": { lat: -37.2167, lng: 174.9667 },
  "Tauranga (NZ)": { lat: -37.7867, lng: 176.1278 },
  
  // Canada  
  "Woodbine (CAN)": { lat: 43.7315, lng: -79.2605 },
  "Fort Erie (CAN)": { lat: 42.9937, lng: -79.0374 },
  "Assiniboia Downs (CAN)": { lat: 49.7833, lng: -97.2500 },
  "Century Mile (CAN)": { lat: 53.4631, lng: -113.5067 },
  
  // South Africa
  "Turffontein (SAF)": { lat: -26.2408, lng: 28.0312 },
  "Greyville (SAF)": { lat: -29.8261, lng: 30.9450 },
  "Durbanville (SAF)": { lat: -33.8403, lng: 18.6353 },
  "Fairview (SAF)": { lat: -34.0161, lng: 18.6642 },
  
  // Belgium
  "Ghlin (BEL)": { lat: 50.5833, lng: 3.9333 },
  
  // Sweden
  "Bro Park (SWE)": { lat: 59.3333, lng: 17.8667 },
  "Taby (SWE)": { lat: 59.2500, lng: 18.3667 },
  
  // Norway
  "Ovrevoll (NOR)": { lat: 59.9425, lng: 10.7069 },
  
  // Denmark
  "Klampenborg (DEN)": { lat: 55.8167, lng: 12.5667 },
  
  // Brazil
  "Cidade Jardim (BRZ)": { lat: -23.5505, lng: -46.6333 },
  "Gavea (BRZ)": { lat: -23.0096, lng: -43.2871 },
  
  // Chile
  "Hipico (CHI)": { lat: -33.4909, lng: -70.5708 },
  
  // USA
  "Santa Anita (USA)": { lat: 34.0464, lng: -118.1006 },
  "Churchill Downs (USA)": { lat: 38.2137, lng: -85.7680 },
  "Belmont Park (USA)": { lat: 40.8514, lng: -73.8233 },
  "Pimlico (USA)": { lat: 39.3291, lng: -76.6183 },
  "Saratoga Springs (USA)": { lat: 43.0859, lng: -73.7844 },
  "Keeneland (USA)": { lat: 38.0174, lng: -84.6050 },
  "Gulfstream Park (USA)": { lat: 26.0139, lng: -80.2356 },
  "Woodbine (USA)": { lat: 43.7315, lng: -79.2605 },
  "Golden Gate Fields (USA)": { lat: 37.9308, lng: -122.2983 },
  "Aqueduct (USA)": { lat: 40.8450, lng: -73.8267 },
  "Del Mar (USA)": { lat: 32.5807, lng: -117.2724 },
  "Arlington Park (USA)": { lat: 42.0902, lng: -87.8339 },
  "Fair Grounds (USA)": { lat: 30.1158, lng: -90.1117 },
  "Oaklawn Park (USA)": { lat: 34.7415, lng: -93.6488 }
};

// Read all race CSV files and extract unique courses
function extractUniqueCourses() {
  const archivePath = path.join(__dirname, 'archive');
  const files = fs.readdirSync(archivePath);
  const raceFiles = files.filter(f => f.startsWith('races_') && f.endsWith('.csv'));
  
  const uniqueCourses = new Set();
  
  raceFiles.forEach(fileName => {
    try {
      const filePath = path.join(archivePath, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      
      // Find the index of the 'course' column
      const headers = lines[0].split(',');
      const courseIndex = headers.indexOf('course');
      
      if (courseIndex === -1) return;
      
      // Parse each line and extract course
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parsing - split by comma
        const values = lines[i].split(',');
        if (values[courseIndex]) {
          const course = values[courseIndex].trim();
          if (course) {
            uniqueCourses.add(course);
          }
        }
      }
    } catch (err) {
      console.error(`Error processing ${fileName}:`, err.message);
    }
  });
  
  return Array.from(uniqueCourses).sort();
}

// Normalize course names to handle variations with suffixes
function normalizeCourse(courseName) {
  let normalized = courseName
    .replace(/\s*\(ARAB\)\s*/gi, '')
    .replace(/\s*\(AW\)\s*/gi, '')
    .replace(/\s*\((?:gb|GB|IRE|AUS|USA|CAN|NZ|HK|FR|GER|SAF|JPN|TUR|ITY|ESP|CHI|DEN|SWI|SWE|UAE|SPA|PERTH)\)\s*/gi, '')
    .replace(/\s*Racecourse\s*$/i, '')
    .replace(/\s*Racetrack\s*$/i, '')
    .trim();

  const aliases = {
    'Kempton': 'Kempton Park',
    'Kempton Park': 'Kempton Park',
    'Haydock': 'Haydock Park',
    'Haydock Park': 'Haydock Park',
    'Fontwell': 'Fontwell Park',
    'Fontwell Park': 'Fontwell Park',
    'Chelmsford': 'Chelmsford (AW)',
    'Southwell': 'Southwell (AW)',
    'Hamilton': 'Hamilton Park',
    'Haydock': 'Haydock Park',
    'Belmont Park': 'Belmont Park (USA)',
    'Arawa park': 'Arawa Park (NZ)',
    'Canterbury Park': 'Canterbury Park (AUS)',
    'Fairyhouse': 'Fairyhouse (IRE)',
    'Tramore': 'Tramore (IRE)',
    'Sha Tin': 'Sha Tin (HK)',
    'Santa Anita': 'Santa Anita (USA)',
    'Churchill Downs': 'Churchill Downs (USA)',
    'Belmont': 'Belmont Park (USA)',
    'Newcastle': 'Newcastle',
    'Belfast': 'Belfast'
  };

  normalized = normalized.replace(/\s+$/g, '');
  if (aliases[normalized]) {
    normalized = aliases[normalized];
  }

  return normalized;
}

// Main execution
const courses = extractUniqueCourses();
const raceCourses = courses
  .map(courseName => {
    // Try exact match first, then try normalized name
    let coords = courseCoordinates[courseName];
    if (!coords) {
      const normalized = normalizeCourse(courseName);
      coords = courseCoordinates[normalized];
    }
    return {
      name: courseName,
      ...(coords || { lat: null, lng: null })
    };
  })
  .filter(course => course.lat !== null && course.lng !== null); // Only include courses with coordinates

console.log(`Found ${courses.length} unique courses`);

const exactMatches = [];
const unmatched = [];
for (const courseName of courses) {
  const coords = courseCoordinates[courseName] || courseCoordinates[normalizeCourse(courseName)];
  if (coords) {
    exactMatches.push({ name: courseName, ...coords });
  } else {
    unmatched.push(courseName);
  }
}

console.log(`Initially matched ${exactMatches.length} courses with local coordinates`);
console.log(`Need to geocode ${unmatched.length} courses`);

(async () => {
  const geocoded = await geocodeUnmatched(unmatched);
  const finalCourses = exactMatches.slice();

  for (const courseName of Object.keys(geocoded)) {
    finalCourses.push({ name: courseName, ...geocoded[courseName] });
  }

  const stillMissing = unmatched.filter(courseName => !geocoded[courseName]);
  console.log(`Final matched courses: ${finalCourses.length}`);
  console.log(`Still missing after geocoding: ${stillMissing.length}`);
  if (stillMissing.length > 0) {
    console.log('Missing course names:', stillMissing.slice(0, 50));    // Save unmatched to file
    const unmatchedPath = path.join(__dirname, 'data', 'unmatched_courses.txt');
    fs.writeFileSync(unmatchedPath, stillMissing.join('\n'));
    console.log(`Unmatched courses saved to ${unmatchedPath}`);  }

  const outputPath = path.join(__dirname, 'data', 'racecourses.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalCourses, null, 2));
  console.log(`\nRacecourses data saved to ${outputPath}`);
})();
