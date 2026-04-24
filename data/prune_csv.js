const fs = require('fs');
const csv = require('csv-parser');
const { Transform } = require('stream');

// Prune combined_races.csv
const racesColumnsToKeep = ['rid', 'course', 'date', 'prize', 'countryCode'];

const pruneRaces = () => {
  const results = [];
  fs.createReadStream('combined_races.csv')
    .pipe(csv())
    .on('data', (data) => {
      const pruned = {};
      racesColumnsToKeep.forEach(col => {
        if (data[col] !== undefined) pruned[col] = data[col];
      });
      results.push(pruned);
    })
    .on('end', () => {
      const csvWriter = fs.createWriteStream('combined_races_pruned.csv');
      csvWriter.write(racesColumnsToKeep.join(',') + '\n');
      results.forEach(row => {
        csvWriter.write(racesColumnsToKeep.map(col => row[col] || '').join(',') + '\n');
      });
      csvWriter.end();
      console.log('Pruned races CSV created');
    });
};

// Prune combined_horses.csv
const horsesColumnsToKeep = ['rid', 'horseName', 'trainerName', 'jockeyName', 'position', 'weight', 'father', 'mother', 'gfather', 'year'];

const pruneHorses = () => {
  const results = [];
  fs.createReadStream('combined_horses.csv')
    .pipe(csv())
    .on('data', (data) => {
      const pruned = {};
      horsesColumnsToKeep.forEach(col => {
        if (data[col] !== undefined) pruned[col] = data[col];
      });
      results.push(pruned);
    })
    .on('end', () => {
      const csvWriter = fs.createWriteStream('combined_horses_pruned.csv');
      csvWriter.write(horsesColumnsToKeep.join(',') + '\n');
      results.forEach(row => {
        csvWriter.write(horsesColumnsToKeep.map(col => row[col] || '').join(',') + '\n');
      });
      csvWriter.end();
      console.log('Pruned horses CSV created');
    });
};

pruneRaces();
pruneHorses();