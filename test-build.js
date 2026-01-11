#!/usr/bin/env node
/**
 * Script de test pour vérifier que le build fonctionne
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Tests de validation du projet...\n');

let errors = 0;
let warnings = 0;

// Test 1: Vérifier que les fichiers critiques existent
console.log('1️⃣  Vérification des fichiers critiques...');
const criticalFiles = [
  'components/app/app.tsx',
  'components/app/transcript-widget.tsx',
  'Dockerfile',
  'docker-compose.yml',
  'app/api/health/route.ts',
  'lib/utils.ts',
];

criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MANQUANT`);
    errors++;
  }
});

// Test 2: Vérifier que le type TokenSource est corrigé
console.log('\n2️⃣  Vérification de la correction TypeScript...');
const appContent = fs.readFileSync('components/app/app.tsx', 'utf8');
if (appContent.includes('ReturnType<typeof TokenSource.endpoint>')) {
  console.log('   ✅ Type TokenSource corrigé');
} else {
  console.log('   ❌ Type TokenSource non corrigé');
  errors++;
}

if (!appContent.includes('useMemo')) {
  console.log('   ✅ useMemo supprimé');
} else {
  console.log('   ⚠️  useMemo toujours présent');
  warnings++;
}

// Test 3: Vérifier les imports
console.log('\n3️⃣  Vérification des imports...');
const widgetContent = fs.readFileSync('components/app/transcript-widget.tsx', 'utf8');
const importMatches = widgetContent.match(/from '@\/lib\/utils'/g);
if (importMatches && importMatches.length === 1) {
  console.log('   ✅ Imports utils.ts non dupliqués');
} else {
  console.log('   ⚠️  Imports utils.ts dupliqués');
  warnings++;
}

// Test 4: Vérifier TypeScript
console.log('\n4️⃣  Vérification TypeScript...');
try {
  execSync('pnpm tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compile sans erreurs');
} catch (error) {
  console.log('   ❌ Erreurs TypeScript détectées');
  errors++;
}

// Test 5: Vérifier ESLint
console.log('\n5️⃣  Vérification ESLint...');
try {
  const lintOutput = execSync('pnpm run lint', { encoding: 'utf8' });
  if (lintOutput.includes('Failed to compile') || lintOutput.includes('Error:')) {
    console.log('   ❌ Erreurs ESLint détectées');
    errors++;
  } else {
    console.log('   ✅ ESLint passe (warnings acceptables)');
  }
} catch (error) {
  // ESLint peut retourner un code d'erreur même avec juste des warnings
  const output = error.stdout?.toString() || error.message;
  if (output.includes('Failed to compile') || output.includes('Error:')) {
    console.log('   ❌ Erreurs ESLint détectées');
    errors++;
  } else {
    console.log('   ✅ ESLint passe (warnings acceptables)');
  }
}

// Test 6: Vérifier Dockerfile
console.log('\n6️⃣  Vérification Dockerfile...');
const dockerfileContent = fs.readFileSync('Dockerfile', 'utf8');
if (dockerfileContent.includes('FROM node:22-alpine')) {
  console.log('   ✅ Dockerfile utilise node:22-alpine');
} else {
  console.log('   ⚠️  Dockerfile n\'utilise pas node:22-alpine');
  warnings++;
}

if (dockerfileContent.includes('output: \'standalone\'')) {
  console.log('   ✅ next.config.ts configure standalone');
} else {
  // Vérifier dans next.config.ts
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  if (nextConfig.includes("output: 'standalone'")) {
    console.log('   ✅ next.config.ts configure standalone');
  } else {
    console.log('   ⚠️  standalone non configuré');
    warnings++;
  }
}

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(50));
console.log(`✅ Tests réussis: ${criticalFiles.length + 4 - errors - warnings}`);
if (warnings > 0) {
  console.log(`⚠️  Warnings: ${warnings}`);
}
if (errors > 0) {
  console.log(`❌ Erreurs: ${errors}`);
  console.log('\n❌ Le build échouera. Veuillez corriger les erreurs.');
  process.exit(1);
} else {
  console.log('\n✅ Tous les tests critiques passent !');
  console.log('🚀 Le projet est prêt pour le build Docker.');
  process.exit(0);
}
