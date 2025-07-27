#!/usr/bin/env node

/**
 * Script để validate ENV configuration cho ChatBot React
 * Chạy: node validate-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating ENV configuration...\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('💡 Copy .env.example to .env and configure it');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').replace(/^['"]|['"]$/g, ''); // Remove quotes
  envVars[key] = value;
});

console.log('📋 Found environment variables:');
Object.entries(envVars).forEach(([key, value]) => {
  const maskedValue = key.includes('KEY') || key.includes('SECRET') 
    ? value.substring(0, 8) + '...' 
    : value;
  console.log(`   ${key}: ${maskedValue}`);
});

console.log('\n🔍 Validation results:\n');

// Validate OpenAI API Key
if (envVars.VITE_OPENAI_API_KEY) {
  if (envVars.VITE_OPENAI_API_KEY.startsWith('sk-')) {
    if (envVars.VITE_OPENAI_API_KEY.length > 40) {
      console.log('✅ OpenAI API Key format looks valid');
    } else {
      console.log('⚠️  OpenAI API Key seems too short');
    }
  } else {
    console.log('❌ OpenAI API Key should start with "sk-"');
  }
} else {
  console.log('⚠️  No OpenAI API Key configured (OK if using only Local AI Hub)');
}

// Validate AI Hub URL
if (envVars.VITE_MODEL_API_URL) {
  const url = envVars.VITE_MODEL_API_URL;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
      console.log('✅ AI Hub URL configured for local development');
    } else if (url.includes('localhost:1234')) {
      console.log('✅ AI Hub URL configured for LM Studio');
    } else if (url.includes('localhost:11434')) {
      console.log('✅ AI Hub URL configured for Ollama');
    } else {
      console.log(`✅ AI Hub URL configured for custom endpoint: ${url}`);
    }
    
    // Check if URL ends with correct API path
    if (url.endsWith('/api/v1') || url.endsWith('/v1')) {
      console.log('✅ API path looks correct');
    } else {
      console.log('⚠️  AI Hub URL should end with /api/v1 for AI Hub or /v1 for LM Studio/Ollama');
    }
  } else {
    console.log('❌ AI Hub URL should start with http:// or https://');
  }
} else {
  console.log('❌ VITE_MODEL_API_URL is required');
}

// Validate encryption secret
if (envVars.VITE_ENCRYPTION_SECRET) {
  if (envVars.VITE_ENCRYPTION_SECRET.length >= 16) {
    console.log('✅ Encryption secret length is sufficient');
  } else {
    console.log('⚠️  Encryption secret should be at least 16 characters');
  }
} else {
  console.log('⚠️  No encryption secret configured');
}

// Validate default model
if (envVars.VITE_DEFAULT_MODEL) {
  if (envVars.VITE_DEFAULT_MODEL === 'auto') {
    console.log('✅ Default model set to auto-selection');
  } else {
    console.log(`✅ Default model configured: ${envVars.VITE_DEFAULT_MODEL}`);
  }
} else {
  console.log('⚠️  No default model configured (will use auto)');
}

console.log('\n🔧 Configuration recommendations:\n');

// Provider recommendations
if (envVars.VITE_OPENAI_API_KEY && envVars.VITE_MODEL_API_URL) {
  console.log('💡 You have both OpenAI and Local AI Hub configured');
  console.log('   You can switch between providers in Settings');
} else if (envVars.VITE_OPENAI_API_KEY) {
  console.log('💡 Only OpenAI configured - you can add Local AI Hub later');
} else if (envVars.VITE_MODEL_API_URL) {
  console.log('💡 Only Local AI Hub configured - you can add OpenAI API key later');
} else {
  console.log('❌ No AI provider configured! Please set up at least one.');
}

// URL-specific recommendations
if (envVars.VITE_MODEL_API_URL?.includes('localhost:8000')) {
  console.log('💡 Make sure AI Hub is running: python main.py');
  console.log('💡 Test connection: curl http://localhost:8000/health');
} else if (envVars.VITE_MODEL_API_URL?.includes('localhost:1234')) {
  console.log('💡 Make sure LM Studio is running with API server enabled');
} else if (envVars.VITE_MODEL_API_URL?.includes('localhost:11434')) {
  console.log('💡 Make sure Ollama is running: ollama serve');
}

console.log('\n🚀 Ready to start? Run: npm run dev');

// Test AI Hub connection if configured
if (envVars.VITE_MODEL_API_URL?.includes('localhost:8000')) {
  console.log('\n🔍 Testing AI Hub connection...');
  
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        console.log('✅ AI Hub is running and accessible');
      } else {
        console.log('❌ AI Hub responded with error:', response.status);
      }
    } catch {
      console.log('❌ Cannot connect to AI Hub. Make sure it\'s running.');
      console.log('💡 Start AI Hub: cd "AI hub" && python main.py');
    }
  };
  
  // Only test if we're in a browser-like environment
  if (typeof fetch !== 'undefined') {
    testConnection();
  }
}
