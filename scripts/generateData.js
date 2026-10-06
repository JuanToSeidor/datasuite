const fs = require('fs');
const path = require('path');

const months = [
  { short: 'Jan', full: 'January', num: 1 },
  { short: 'Feb', full: 'February', num: 2 },
  { short: 'Mar', full: 'March', num: 3 },
  { short: 'Apr', full: 'April', num: 4 },
  { short: 'May', full: 'May', num: 5 },
  { short: 'Jun', full: 'June', num: 6 },
  { short: 'Jul', full: 'July', num: 7 },
  { short: 'Aug', full: 'August', num: 8 },
  { short: 'Sep', full: 'September', num: 9 },
  { short: 'Oct', full: 'October', num: 10 },
  { short: 'Nov', full: 'November', num: 11 },
  { short: 'Dec', full: 'December', num: 12 },
];

const startYear = 2001;
const endYear = 2026;
const data = [];

for (let y = startYear; y <= endYear; y++) {
  // Gradual growth over the years
  const yearProgress = (y - startYear) / (endYear - startYear);
  const baseScale = 0.4 + yearProgress * 1.6; // from smaller historical scale up to current enterprise scale

  for (let m = 0; m < 12; m++) {
    const monthObj = months[m];
    // seasonal variation with some peak at end of quarter/year
    const seasonalFactor = 0.9 + Math.sin((m / 11) * Math.PI) * 0.2 + (m === 11 ? 0.15 : 0);
    const noise = () => 0.9 + Math.random() * 0.2;

    const compute = Math.round(1850 * baseScale * seasonalFactor * noise());
    const storage = Math.round(820 * baseScale * seasonalFactor * noise());
    const database = Math.round(650 * baseScale * seasonalFactor * noise());
    const other = Math.round(280 * baseScale * seasonalFactor * noise());
    const total = compute + storage + database + other;
    const budget = Math.round(total * (0.92 + Math.random() * 0.18));

    data.push({
      id: `${y}-${String(monthObj.num).padStart(2, '0')}`,
      year: y,
      month: monthObj.short,
      monthFull: monthObj.full,
      monthIndex: m,
      label: `${monthObj.short} ${String(y).slice(-2)}`,
      fullLabel: `${monthObj.full} ${y}`,
      compute,
      storage,
      database,
      other,
      total,
      budget
    });
  }
}

const dir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'costEvolution.json'), JSON.stringify(data, null, 2), 'utf8');
console.log(`Generated ${data.length} records in data/costEvolution.json across ${endYear - startYear + 1} years (${startYear}-${endYear})`);
