const fs = require('fs');
const path = require('path');

const racesDir = path.join(__dirname, 'races');
const outputFile = path.join(__dirname, 'data', 'combined_races.csv');

async function combineRaces() {
  const files = fs.readdirSync(racesDir)
    .filter(file => file.startsWith('races_') && file.endsWith('.csv'))
    .sort(); // Sort to ensure chronological order

  if (files.length === 0) {
    console.log('No race files found.');
    return;
  }

  const writeStream = fs.createWriteStream(outputFile);
  let isFirstFile = true;

  for (const file of files) {
    const filePath = path.join(racesDir, file);
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    if (lines.length === 0) continue;

    if (isFirstFile) {
      // Write header from first file
      writeStream.write(lines[0] + '\n');
      isFirstFile = false;
    }

    // Write data lines (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        writeStream.write(lines[i] + '\n');
      }
    }

    console.log(`Processed ${file}`);
  }

  writeStream.end();
  console.log(`Combined ${files.length} files into ${outputFile}`);
}

combineRaces().catch(console.error);