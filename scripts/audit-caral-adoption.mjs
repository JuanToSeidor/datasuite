import * as fs from 'fs';
import * as path from 'path';

const TARGET_DIRS = ['app', 'components'].map(d => path.join(process.cwd(), d)).filter(d => fs.existsSync(d));

const stats = {
  totalFilesScanned: 0,
  caralstableImports: 0,
  iconcaralImports: 0,
  caralButtonCount: 0,
  nativeButtonCount: 0,
  caralTabsCount: 0,
  caralDrawerCount: 0,
  caralToggleCount: 0,
  caralIconCorrectProp: 0, // classname
  caralIconWrongProp: 0,   // className
  semanticColorsCount: 0,
  hardcodedColorsCount: 0,
  hardcodedColorDetails: [],
  lowContrastNeutral500Count: 0,
  lowContrastDetails: [],
  redundantDarkClassesCount: 0,
  redundantDarkDetails: [],
  fileCompliance: []
};

const SEMANTIC_COLOR_REGEX = /\b(bg|text|border)-(info|success|warning|danger|seidor|indido|sakura|container|full)(-[a-z0-9]+)?\b/g;
const HARDCODED_COLOR_REGEX = /\b(bg|text|border|ring|from|to|via)-(emerald|blue|amber|rose|purple|indigo|teal|cyan|lime|orange|violet|fuchsia|pink|red|green|yellow|slate|zinc|gray|stone)-[0-9]{2,3}\b|\b(bg|text|border|ring|from|to|via)-\[#[0-9a-fA-F]{3,8}\]\b/g;
const LOW_CONTRAST_REGEX = /\btext-neutral-(400|500)\b/g;
const REDUNDANT_DARK_REGEX = /\bdark:(text-white|bg-neutral-[0-9]{3}|text-neutral-[0-9]{3}|border-neutral-[0-9]{3})\b/g;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'data') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  stats.totalFilesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

  const fileReport = {
    file: relPath,
    hasCaralstable: false,
    hasIconcaral: false,
    caralButtons: 0,
    nativeButtons: 0,
    hardcodedColors: 0,
    lowContrast: 0,
    redundantDark: 0,
    caralIconClassNameIssues: 0
  };

  if (content.includes("from 'caralstable'") || content.includes('from "caralstable"')) {
    stats.caralstableImports++;
    fileReport.hasCaralstable = true;
  }

  if (content.includes("from 'iconcaral2'") || content.includes('from "iconcaral2"')) {
    stats.iconcaralImports++;
    fileReport.hasIconcaral = true;
  }

  // Component matches
  const caralButtons = (content.match(/<Button\b/g) || []).length;
  const nativeButtons = (content.match(/<button\b/g) || []).length;
  const caralTabs = (content.match(/<Tabs\b/g) || []).length;
  const caralDrawers = (content.match(/<Drawer\b/g) || []).length;
  const caralToggles = (content.match(/<Toggle\b/g) || []).length;

  stats.caralButtonCount += caralButtons;
  stats.nativeButtonCount += nativeButtons;
  stats.caralTabsCount += caralTabs;
  stats.caralDrawerCount += caralDrawers;
  stats.caralToggleCount += caralToggles;

  fileReport.caralButtons = caralButtons;
  fileReport.nativeButtons = nativeButtons;

  // CaralIcon prop inspection
  const caralIconMatches = content.match(/<CaralIcon\s+[^>]+>/g) || [];
  for (const tag of caralIconMatches) {
    if (tag.includes('className=')) {
      stats.caralIconWrongProp++;
      fileReport.caralIconClassNameIssues++;
    } else if (tag.includes('classname=')) {
      stats.caralIconCorrectProp++;
    }
  }

  // Colors check
  const semMatches = content.match(SEMANTIC_COLOR_REGEX) || [];
  stats.semanticColorsCount += semMatches.length;

  const hardcodedMatches = content.match(HARDCODED_COLOR_REGEX) || [];
  stats.hardcodedColorsCount += hardcodedMatches.length;
  fileReport.hardcodedColors = hardcodedMatches.length;
  if (hardcodedMatches.length > 0) {
    stats.hardcodedColorDetails.push({ file: relPath, count: hardcodedMatches.length, samples: [...new Set(hardcodedMatches)].slice(0, 5) });
  }

  // Low contrast check
  const lowContrastMatches = content.match(LOW_CONTRAST_REGEX) || [];
  stats.lowContrastNeutral500Count += lowContrastMatches.length;
  fileReport.lowContrast = lowContrastMatches.length;
  if (lowContrastMatches.length > 0) {
    stats.lowContrastDetails.push({ file: relPath, count: lowContrastMatches.length });
  }

  // Redundant dark check
  const redundantDarkMatches = content.match(REDUNDANT_DARK_REGEX) || [];
  stats.redundantDarkClassesCount += redundantDarkMatches.length;
  fileReport.redundantDark = redundantDarkMatches.length;
  if (redundantDarkMatches.length > 0) {
    stats.redundantDarkDetails.push({ file: relPath, count: redundantDarkMatches.length, samples: [...new Set(redundantDarkMatches)].slice(0, 3) });
  }

  stats.fileCompliance.push(fileReport);
}

TARGET_DIRS.forEach(dir => scanDir(dir));

console.log("\n=======================================================");
console.log("📊 REPORTE DE AUDITORÍA DE ADOPCIÓN DE CARAL & DESIGN SYSTEM");
console.log("=======================================================\n");

console.log(`📁 Total archivos analizados en [${TARGET_DIRS.map(d => path.basename(d)).join(', ')}]: ${stats.totalFilesScanned}`);
console.log(`📦 Archivos que importan 'caralstable': ${stats.caralstableImports}`);
console.log(`🏷️  Archivos que importan 'iconcaral2': ${stats.iconcaralImports}\n`);

console.log("--- 🔘 USO DE COMPONENTES UI ---");
console.log(`• <Button /> de caralstable: ${stats.caralButtonCount} instancias`);
console.log(`• <button> HTML nativos: ${stats.nativeButtonCount} instancias`);
const buttonAdoption = Math.round((stats.caralButtonCount / (stats.caralButtonCount + stats.nativeButtonCount || 1)) * 100);
console.log(`  -> Nivel de adopción de botones Caral: ${buttonAdoption}%`);
console.log(`• <Tabs /> de caralstable: ${stats.caralTabsCount} instancias`);
console.log(`• <Drawer /> de caralstable: ${stats.caralDrawerCount} instancias`);
console.log(`• <Toggle /> de caralstable: ${stats.caralToggleCount} instancias\n`);

console.log("--- 🏷️ ICONOGRAFÍA (iconcaral2) ---");
console.log(`• <CaralIcon /> con prop correcta ('classname'): ${stats.caralIconCorrectProp}`);
console.log(`• <CaralIcon /> con prop errónea ('className'): ${stats.caralIconWrongProp}`);
const iconPropCompliance = Math.round((stats.caralIconCorrectProp / (stats.caralIconCorrectProp + stats.caralIconWrongProp || 1)) * 100);
console.log(`  -> Cumplimiento de sintaxis de iconos: ${iconPropCompliance}%\n`);

console.log("--- 🎨 PALETA DE COLORES SEMÁNTICA ---");
console.log(`• Clases semánticas (info, success, warning, danger, seidor, etc.): ${stats.semanticColorsCount}`);
console.log(`• Colores directos/hardcoded (emerald, blue, amber, etc.): ${stats.hardcodedColorsCount}`);
const colorCompliance = Math.round((stats.semanticColorsCount / (stats.semanticColorsCount + stats.hardcodedColorsCount || 1)) * 100);
console.log(`  -> Cumplimiento de colores semánticos: ${colorCompliance}%\n`);

console.log("--- 🖋️ CONTRASTE Y MODO OSCURO ---");
console.log(`• Ocurrencias de bajo contraste (text-neutral-500/400): ${stats.lowContrastNeutral500Count}`);
console.log(`• Clases dark: redundantes sobre tokens nativos: ${stats.redundantDarkClassesCount}\n`);

console.log("--- 🏆 ARCHIVOS CON MAYOR ADOPCIÓN DE CARAL ---");
const topCaralFiles = stats.fileCompliance
  .filter(f => f.hasCaralstable || f.hasIconcaral)
  .sort((a, b) => b.caralButtons - a.caralButtons)
  .slice(0, 8);

if (topCaralFiles.length > 0) {
  topCaralFiles.forEach(f => {
    console.log(`  ✅ ${f.file} (${f.caralButtons} Buttons Caral, ${f.nativeButtons} nativos)`);
  });
} else {
  console.log("  (Ningún archivo importa caralstable o iconcaral2 aún)");
}

// Calculate penalty score for each file
stats.fileCompliance.forEach(f => {
  f.penaltyScore = (f.nativeButtons * 3) +
                   (f.hardcodedColors * 2) +
                   (f.lowContrast * 1.5) +
                   (f.caralIconClassNameIssues * 4) +
                   (f.redundantDark * 0.5);
});

const worstFiles = stats.fileCompliance
  .filter(f => f.penaltyScore > 15)
  .sort((a, b) => b.penaltyScore - a.penaltyScore)
  .slice(0, 12);

console.log("\n=======================================================");
console.log("🚨 TOP ARCHIVOS CON MENOR CUMPLIMIENTO DE REGLAS (PEOR ADOPCIÓN)");
console.log("=======================================================\n");

if (worstFiles.length > 0) {
  worstFiles.forEach((f, idx) => {
    console.log(`${idx + 1}. 📄 ${f.file}`);
    console.log(`   • Puntuación de Infracciones: ${Math.round(f.penaltyScore)} pts`);
    console.log(`   • <button> nativos sin migrar: ${f.nativeButtons} (vs ${f.caralButtons} Caral Buttons)`);
    console.log(`   • Colores directos (no semánticos): ${f.hardcodedColors}`);
    console.log(`   • Textos con bajo contraste (neutral-500/400): ${f.lowContrast}`);
    console.log(`   • Iconos con prop incorrecta (className): ${f.caralIconClassNameIssues}`);
    console.log(`   • Clases dark: redundantes: ${f.redundantDark}\n`);
  });
} else {
  console.log("  🎉 No se encontraron archivos con infracciones severas (> 15 pts).\n");
}

console.log("=======================================================\n");


