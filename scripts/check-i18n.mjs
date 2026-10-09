import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const APP_DIR = path.join(ROOT_DIR, 'app');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

// 1. Load dictionary objects from locales
async function loadLocales() {
  const locales = {};
  const files = ['es.ts', 'en.ts', 'pt.ts'];

  for (const file of files) {
    const filePath = path.join(LOCALES_DIR, file);
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf8');
      // Simple regex parser for keys and values in locales TS files
      const lang = file.replace('.ts', '');
      locales[lang] = extractKeysFromLocaleCode(code);
    }
  }
  return locales;
}

function extractKeysFromLocaleCode(content) {
  const keys = new Set();
  const keyValues = {};

  // Extract nested properties
  const lines = content.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*\{/);
    if (sectionMatch && !['es', 'en', 'pt', 'dictionaries'].includes(sectionMatch[1])) {
      currentSection = sectionMatch[1];
      continue;
    }

    if (trimmed.startsWith('},')) {
      currentSection = '';
      continue;
    }

    const propMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*["'`](.*)["'`],?$/);
    if (propMatch) {
      const propKey = currentSection ? `${currentSection}.${propMatch[1]}` : propMatch[1];
      keys.add(propKey);
      keyValues[propKey] = propMatch[2];
    }
  }

  return { keys: Array.from(keys), keyValues };
}

// 2. Scan TSX / JSX files for i18n usage and hardcoded strings
const IGNORED_PROP_VALUES = new Set([
  'use client', 'use server', 'text', 'password', 'number', 'email', 'submit', 'button', 'reset',
  'ghost', 'light', 'default', 'info', 'success', 'warning', 'danger', 'indido', 'sakura',
  'sm', 'md', 'lg', 'xl', '2xl', 'xs', 'none', 'auto', 'hidden', 'visible', 'center', 'left', 'right',
  'true', 'false', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
]);

function isIgnoredString(str) {
  if (!str) return true;
  const s = str.trim();
  if (s.length <= 1) return true;
  if (/^https?:\/\//.test(s) || /^\/[a-zA-Z0-9_\-\/]*$/.test(s)) return true; // URLs & Paths
  if (/^[0-9\.\,\:\-\+\%\$\#\@\_]+$/.test(s)) return true; // Numbers / symbols
  if (IGNORED_PROP_VALUES.has(s)) return true;
  if (/^(var\(|calc\(|rgba?\(|hsla?\(|#[0-9a-fA-F]{3,8})/.test(s)) return true; // CSS color / formula
  if (/^[a-z0-9_\-]+:[a-z0-9_\-]+/.test(s)) return true; // Tailwind / icons format
  return false;
}

function scanFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'public'].includes(entry.name)) {
        scanFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function analyzeFile(filePath, allKeys) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');

  const hasLanguageHook = /useLanguage\s*\(/.test(content);
  const usesDict = /\bdict\./.test(content);
  const usesTFunc = /\bt\s*\(/.test(content);

  const hardcodedTexts = [];

  // Parse lines for JSX text nodes and label/title/placeholder props
  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    const trimmed = line.trim();

    // Skip comments and imports
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('import ')) {
      return;
    }

    // 1. Match JSX text outside brackets: >Some text<
    const jsxTextMatches = line.matchAll(/>([^<>{}\n]+)</g);
    for (const match of jsxTextMatches) {
      const text = match[1].trim();
      if (!isIgnoredString(text) && text.length > 1 && !/^\{\s*.*\s*\}$/.test(text)) {
        hardcodedTexts.push({
          line: lineNum,
          type: 'JSX Text',
          text,
          snippet: trimmed,
        });
      }
    }

    // 2. Match common user-facing props: label="...", title="...", placeholder="...", description="..."
    const propMatches = line.matchAll(/\b(label|title|placeholder|description|emptyMessage|filterLabel)\s*=\s*["'`]([^"'`{]+)["'`]/g);
    for (const match of propMatches) {
      const propName = match[1];
      const text = match[2].trim();
      if (!isIgnoredString(text) && text.length > 1) {
        hardcodedTexts.push({
          line: lineNum,
          type: `Prop (${propName})`,
          text,
          snippet: trimmed,
        });
      }
    }
  });

  return {
    file: relPath,
    hasLanguageHook,
    usesDict,
    usesTFunc,
    isFullyLocalized: hasLanguageHook && hardcodedTexts.length === 0,
    hardcodedTexts,
  };
}

async function runAudit() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     CRESTONE SUITE - I18N & DICTIONARY AUDIT       ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // 1. Locales Parity Check
  const locales = await loadLocales();
  const langCodes = Object.keys(locales);

  console.log(`${colors.bold}1. Comprobación de Diccionarios (${langCodes.join(', ')}):${colors.reset}`);
  
  if (langCodes.length === 0) {
    console.log(`${colors.red}❌ No se encontraron archivos de diccionario en /locales.${colors.reset}\n`);
    return;
  }

  const baseLang = 'es';
  const baseKeys = locales[baseLang]?.keys || [];
  console.log(`   ${colors.green}✔${colors.reset} Idioma base (${baseLang.toUpperCase()}): ${colors.bold}${baseKeys.length}${colors.reset} claves encontradas.`);

  let totalParityErrors = 0;
  for (const lang of langCodes) {
    if (lang === baseLang) continue;
    const currentKeys = new Set(locales[lang]?.keys || []);
    const missingKeys = baseKeys.filter(k => !currentKeys.has(k));
    const extraKeys = (locales[lang]?.keys || []).filter(k => !baseKeys.includes(k));

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`   ${colors.green}✔${colors.reset} Idioma ${lang.toUpperCase()}: 100% sincronizado con ${baseLang.toUpperCase()} (${currentKeys.size} claves).`);
    } else {
      totalParityErrors++;
      if (missingKeys.length > 0) {
        console.log(`   ${colors.yellow}⚠${colors.reset} Idioma ${lang.toUpperCase()}: Le faltan ${missingKeys.length} claves: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`);
      }
      if (extraKeys.length > 0) {
        console.log(`   ${colors.magenta}ℹ${colors.reset} Idioma ${lang.toUpperCase()}: Tiene ${extraKeys.length} claves adicionales: ${extraKeys.slice(0, 5).join(', ')}`);
      }
    }
  }

  // 2. Scan Pages and Components
  console.log(`\n${colors.bold}2. Escaneo de Páginas y Componentes:${colors.reset}`);
  const filesToScan = [...scanFiles(APP_DIR), ...scanFiles(COMPONENTS_DIR)];
  const results = filesToScan.map(file => analyzeFile(file, baseKeys));

  const totalFiles = results.length;
  const localizedFiles = results.filter(r => r.hasLanguageHook || (r.hardcodedTexts.length === 0 && (r.usesDict || r.usesTFunc)));
  const filesWithHardcoded = results.filter(r => r.hardcodedTexts.length > 0);
  const totalHardcodedInstances = results.reduce((acc, r) => acc + r.hardcodedTexts.length, 0);

  console.log(`   Total archivos analizados: ${colors.bold}${totalFiles}${colors.reset}`);
  console.log(`   Archivos con hook useLanguage / dict: ${colors.green}${results.filter(r => r.hasLanguageHook || r.usesDict).length}${colors.reset}`);
  console.log(`   Archivos con textos directos detectados: ${filesWithHardcoded.length > 0 ? colors.yellow : colors.green}${filesWithHardcoded.length}${colors.reset}`);
  console.log(`   Total posibles cadenas literales: ${totalHardcodedInstances > 0 ? colors.yellow : colors.green}${totalHardcodedInstances}${colors.reset}`);

  // 3. Detailed Grouped File Reports
  if (filesWithHardcoded.length > 0) {
    console.log(`\n${colors.bold}3. Lista de Archivos Pendientes por Módulo:${colors.reset}`);
    
    const groups = {
      'Configuración (Settings)': [],
      'Perfil de Usuario (Profile)': [],
      'Conexiones (Connections)': [],
      'Módulo Optimize': [],
      'Autenticación (Auth / Login)': [],
      'Componentes Reutilizables (Components)': [],
      'Otros / Páginas': [],
    };

    filesWithHardcoded.forEach(res => {
      if (res.file.includes('settings')) groups['Configuración (Settings)'].push(res);
      else if (res.file.includes('profile')) groups['Perfil de Usuario (Profile)'].push(res);
      else if (res.file.includes('connections')) groups['Conexiones (Connections)'].push(res);
      else if (res.file.includes('optimize')) groups['Módulo Optimize'].push(res);
      else if (res.file.includes('login') || res.file.includes('auth')) groups['Autenticación (Auth / Login)'].push(res);
      else if (res.file.startsWith('components/')) groups['Componentes Reutilizables (Components)'].push(res);
      else groups['Otros / Páginas'].push(res);
    });

    for (const [groupName, groupFiles] of Object.entries(groups)) {
      if (groupFiles.length === 0) continue;
      console.log(`\n  ${colors.bold}${colors.cyan}📁 ${groupName} (${groupFiles.length} archivos):${colors.reset}`);
      groupFiles.forEach(res => {
        const badge = res.hasLanguageHook ? colors.green + '[useLanguage OK]' : colors.yellow + '[Falta hook]';
        console.log(`    • ${colors.bold}${res.file}${colors.reset} ${badge}${colors.reset} ${colors.gray}(${res.hardcodedTexts.length} cadenas)${colors.reset}`);
        res.hardcodedTexts.slice(0, 2).forEach(item => {
          console.log(`       ${colors.gray}L${item.line}:${colors.reset} ${colors.yellow}"${item.text}"${colors.reset}`);
        });
        if (res.hardcodedTexts.length > 2) {
          console.log(`       ${colors.gray}... +${res.hardcodedTexts.length - 2} más${colors.reset}`);
        }
      });
    }
  }

  // 4. Summary & Score
  const adoptionScore = Math.round(((totalFiles - filesWithHardcoded.length) / totalFiles) * 100);
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}RESUMEN DE AUDITORÍA I18N:${colors.reset}`);
  console.log(`- Diccionarios sincronizados: ${totalParityErrors === 0 ? colors.green + '100% OK' : colors.yellow + 'Con advertencias'}${colors.reset}`);
  console.log(`- Nivel de adopción i18n: ${adoptionScore >= 80 ? colors.green : colors.yellow}${adoptionScore}% (${totalFiles - filesWithHardcoded.length}/${totalFiles} archivos limpios)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);
}

runAudit();
