#!/usr/bin/env node

/**
 * Script de test pour valider la configuration AI
 * Usage: node scripts/test-ai-config.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FREE MODELS (February 2026) - Source: https://ai.google.dev/pricing
const VALID_FREE_MODELS = [
  'gemini-3-flash',           // Latest, best speed/quality
  'gemini-2.5-pro',           // Complex reasoning
  'gemini-2.5-flash',         // Recommended for CAD
  'gemini-2.5-flash-lite',    // High throughput
  'gemini-2.0-flash',         // Multimodal, agents
  'gemini-1.5-flash',         // Stable, proven
  'gemini-1.5-flash-8b',      // Lightweight
  'gemma-3',                  // Open source
  'gemma-3n'                  // Open source, mobile
];

const PAID_ONLY_MODELS = [
  'gemini-3-pro',             // NOT FREE
  'gemini-2.5-computer-use',  // NOT FREE
];

console.log('🔍 Vérification de la configuration AI...\n');

// Lire le fichier .env
let envContent;
try {
  envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
} catch (error) {
  console.error('❌ Fichier .env introuvable');
  console.error('   Créez un fichier .env à partir de .env.example\n');
  process.exit(1);
}

// Parser les variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

// Test 1: Clé API
const apiKey = env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ VITE_GEMINI_API_KEY non définie dans .env');
  process.exit(1);
}

if (!apiKey.startsWith('AIza') || apiKey.length !== 39) {
  console.error('❌ Format de clé API invalide');
  console.error('   La clé doit commencer par "AIza" et faire 39 caractères');
  process.exit(1);
}

console.log('✅ Clé API valide (format correct)');
console.log(`   Clé: ${apiKey.substring(0, 10)}...${apiKey.substring(35)}\n`);

// Test 2: Modèle
const model = env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

// Check if it's a paid-only model
if (PAID_ONLY_MODELS.includes(model)) {
  console.error(`❌ ERREUR: "${model}" n'est PAS gratuit!`);
  console.error('   Ce modèle nécessite un compte payant.\n');
  console.error('   Modèles GRATUITS disponibles:');
  VALID_FREE_MODELS.forEach(m => console.error(`   - ${m}`));
  process.exit(1);
}

if (!VALID_FREE_MODELS.includes(model)) {
  console.warn(`⚠️  Modèle "${model}" non reconnu`);
  console.warn('   Modèles GRATUITS valides:');
  VALID_FREE_MODELS.forEach(m => console.warn(`   - ${m}`));
  console.warn(`   Le système utilisera le modèle par défaut: gemini-2.5-flash\n`);
} else {
  console.log(`✅ Modèle GRATUIT valide: ${model}\n`);
}

// Informations sur le modèle
const modelInfo = {
  'gemini-3-flash': {
    speed: '⚡⚡⚡ Très rapide',
    quality: '⭐⭐⭐⭐ Excellente',
    use: '🎯 Meilleur équilibre vitesse/qualité',
    free: '✅ GRATUIT'
  },
  'gemini-2.5-pro': {
    speed: '🐢 Plus lent',
    quality: '⭐⭐⭐⭐⭐ Maximale',
    use: '🎯 Raisonnement complexe, analyse',
    free: '✅ GRATUIT'
  },
  'gemini-2.5-flash': {
    speed: '⚡⚡ Rapide',
    quality: '⭐⭐⭐⭐ Très bonne',
    use: '🎯 Recommandé pour génération CAD',
    free: '✅ GRATUIT'
  },
  'gemini-2.5-flash-lite': {
    speed: '⚡⚡⚡ Très rapide',
    quality: '⭐⭐⭐ Bonne',
    use: '🎯 Haut débit, économique',
    free: '✅ GRATUIT'
  },
  'gemini-2.0-flash': {
    speed: '⚡⚡ Rapide',
    quality: '⭐⭐⭐⭐ Très bonne',
    use: '🎯 Multimodal, agents',
    free: '✅ GRATUIT'
  },
  'gemini-1.5-flash': {
    speed: '⚡⚡ Rapide',
    quality: '⭐⭐⭐ Bonne',
    use: '🎯 Stable, éprouvé',
    free: '✅ GRATUIT'
  },
  'gemini-1.5-flash-8b': {
    speed: '⚡⚡⚡ Très rapide',
    quality: '⭐⭐ Correcte',
    use: '🎯 Léger, rapide',
    free: '✅ GRATUIT'
  }
};

if (modelInfo[model]) {
  console.log('📊 Informations sur le modèle:');
  console.log(`   Vitesse: ${modelInfo[model].speed}`);
  console.log(`   Qualité: ${modelInfo[model].quality}`);
  console.log(`   Usage: ${modelInfo[model].use}`);
  console.log(`   Prix: ${modelInfo[model].free}\n`);
}

console.log('✅ Configuration AI valide!\n');
console.log('💡 Pour démarrer l\'application:');
console.log('   npm run dev\n');
console.log('📚 Documentation officielle:');
console.log('   https://ai.google.dev/pricing\n');
