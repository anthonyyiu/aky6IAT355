const fs = require('fs');
const csv = require('csv-parser');
const stringify = require('csv-stringify');

const racesIn = 'combined_races.csv';
const horsesIn = 'combined_horses.csv';
const racesOut = 'combined_races_restored.csv';
const horsesOut = 'combined_horses_restored.csv';

const raceCols = ['rid', 'course', 'date', 'prize', 'countryCode', 'condition', 'winningTime'];
const horseCols = ['rid', 'horseName', 'decimalPrice', 'trainerName', 'jockeyName', 'position', 'weight', 'TR', 'father', 'mother', 'gfather', 'res_win', 'year'];

function normalizeDate(date) {
  if (!date) return '';
  date = date.toString().trim();
  // remove time part if present
  date = date.split(' ')[0];
  if (date.includes('/')) {
    const parts = date.split('/').map(p => p.trim());
    if (parts.length === 3) {
      let [yy, mm, dd] = parts;
      yy = yy.padStart(2, '0');
      mm = mm.padStart(2, '0');
      dd = dd.padStart(2, '0');
      const year = yy.length === 2 ? (yy >= '90' ? `19${yy}` : `20${yy}`) : yy;
      return `${year}-${mm}-${dd}`;
    }
  }
  if (date.includes('-')) {
    const parts = date.split('-').map(p => p.trim());
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${yyyy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
  }
  return date;
}

function parseYear(date) {
  if (!date) return '';
  const norm = normalizeDate(date);
  const parts = norm.split('-');
  return parts.length === 3 ? parts[0] : '';
}

function restore() {
  const raceYearByRid = {};
  const races = [];

  fs.createReadStream(racesIn)
    .pipe(csv())
    .on('data', row => {
      const out = {
        rid: row.rid || '',
        course: row.course || '',
        date: normalizeDate(row.date),
        prize: row.prize || '',
        countryCode: row.countryCode || '',
        condition: row.condition || '',
        winningTime: row.winningTime || ''
      };
      races.push(out);
      if (out.rid) {
        raceYearByRid[out.rid] = parseYear(out.date) || raceYearByRid[out.rid] || '';
      }
    })
    .on('end', () => {
      stringify.stringify(races, { header: true, columns: raceCols }, (err, output) => {
        if (err) throw err;
        fs.writeFileSync(racesOut, output);
        console.log(`Wrote ${racesOut} (${Buffer.byteLength(output)} bytes)`);
        restoreHorses(raceYearByRid);
      });
    });
}

function restoreHorses(raceYearByRid) {
  const horses = [];
  fs.createReadStream(horsesIn)
    .pipe(csv())
    .on('data', row => {
      const year = row.year && row.year.trim() ? row.year.trim() : (raceYearByRid[row.rid] || '');
      horses.push({
        rid: row.rid || '',
        horseName: row.horseName || '',
        decimalPrice: row.decimalPrice || '',
        trainerName: row.trainerName || '',
        jockeyName: row.jockeyName || '',
        position: row.position || '',
        weight: row.weight || '',
        TR: row.TR || '',
        father: row.father || '',
        mother: row.mother || '',
        gfather: row.gfather || '',
        res_win: row.res_win || '',
        year,
      });
    })
    .on('end', () => {
      stringify.stringify(horses, { header: true, columns: horseCols }, (err, output) => {
        if (err) throw err;
        fs.writeFileSync(horsesOut, output);
        console.log(`Wrote ${horsesOut} (${Buffer.byteLength(output)} bytes)`);
      });
    });
}

restore();
