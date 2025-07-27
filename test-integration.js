/**
 * Test Integration Script
 * Kiểm tra tính năng tích hợp giữa ChatBot React và AI Hub
 */

// Test cho browser environment
if (typeof window !== 'undefined') {
  window.testIntegration = {
    // Test basic AI service functionality
    async testAIService() {
      console.log('🧪 Testing AI Service...');
      
      try {
        const { aiService } = await import('./src/services/aiService.js');
        console.log('✅ AI Service imported successfully');
        
        // Test provider switching
        const providers = ['openai', 'local'];
        providers.forEach(provider => {
          console.log(`Testing ${provider} provider configuration...`);
          // Basic provider test would go here
        });
        
        return true;
      } catch (error) {
        console.error('❌ AI Service test failed:', error);
        return false;
      }
    },

    // Test AI Hub connection
    async testAIHubConnection() {
      console.log('🌐 Testing AI Hub connection...');
      
      const apiUrl = import.meta.env.VITE_MODEL_API_URL;
      if (!apiUrl) {
        console.error('❌ VITE_MODEL_API_URL not configured');
        return false;
      }

      try {
        // Test health endpoint
        const healthResponse = await fetch(`${apiUrl.replace('/api/v1', '')}/health`);
        if (healthResponse.ok) {
          console.log('✅ AI Hub health check passed');
        } else {
          console.error('❌ AI Hub health check failed:', healthResponse.status);
          return false;
        }

        // Test models endpoint
        const modelsResponse = await fetch(`${apiUrl}/models`);
        if (modelsResponse.ok) {
          const models = await modelsResponse.json();
          console.log(`✅ Found ${models.data?.length || 0} models`);
          if (models.data?.length > 0) {
            console.log('Available models:', models.data.map(m => m.id).join(', '));
          }
        } else {
          console.warn('⚠️ Models endpoint not accessible:', modelsResponse.status);
        }

        return true;
      } catch (error) {
        console.error('❌ AI Hub connection test failed:', error);
        return false;
      }
    },

    // Test workspace functionality
    async testWorkspaceFeatures() {
      console.log('📁 Testing workspace features...');
      
      try {
        // Test workspace creation
        const testWorkspace = {
          id: 'test-workspace-' + Date.now(),
          name: 'Test Workspace',
          description: 'Integration test workspace',
          settings: {
            provider: 'local',
            model: 'auto',
            systemPrompt: 'You are a helpful assistant.'
          }
        };

        // Test workspace storage
        const workspaces = JSON.parse(localStorage.getItem('react-gpt-workspaces') || '[]');
        workspaces.push(testWorkspace);
        localStorage.setItem('react-gpt-workspaces', JSON.stringify(workspaces));
        console.log('✅ Workspace storage test passed');

        // Clean up
        const updatedWorkspaces = workspaces.filter(w => w.id !== testWorkspace.id);
        localStorage.setItem('react-gpt-workspaces', JSON.stringify(updatedWorkspaces));

        return true;
      } catch (error) {
        console.error('❌ Workspace features test failed:', error);
        return false;
      }
    },

    // Test environment configuration
    testEnvironmentConfig() {
      console.log('⚙️ Testing environment configuration...');
      
      const requiredVars = [
        'VITE_MODEL_API_URL'
      ];

      const optionalVars = [
        'VITE_OPENAI_API_KEY',
        'VITE_DEFAULT_MODEL',
        'VITE_DEFAULT_PROVIDER',
        'VITE_ENCRYPTION_SECRET'
      ];

      let allPassed = true;

      // Check required variables
      requiredVars.forEach(varName => {
        const value = import.meta.env[varName];
        if (value) {
          console.log(`✅ ${varName}: configured`);
        } else {
          console.error(`❌ ${varName}: missing (required)`);
          allPassed = false;
        }
      });

      // Check optional variables
      optionalVars.forEach(varName => {
        const value = import.meta.env[varName];
        if (value) {
          const masked = varName.includes('KEY') || varName.includes('SECRET') 
            ? value.substring(0, 8) + '...' 
            : value;
          console.log(`✅ ${varName}: ${masked}`);
        } else {
          console.log(`⚠️ ${varName}: not configured (optional)`);
        }
      });

      return allPassed;
    },

    // Run all tests
    async runAllTests() {
      console.log('🚀 Starting integration tests...\n');
      
      const results = {
        environment: this.testEnvironmentConfig(),
        aiHub: await this.testAIHubConnection(),
        aiService: await this.testAIService(),
        workspace: await this.testWorkspaceFeatures()
      };

      console.log('\n📊 Test Results:');
      Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      });

      const allPassed = Object.values(results).every(r => r);
      console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
      
      if (!allPassed) {
        console.log('\n💡 Check console output above for specific issues');
        console.log('💡 Make sure AI Hub is running and .env is configured correctly');
      }

      return results;
    }
  };

  // Auto-run tests in development
  if (import.meta.env.DEV) {
    console.log('🔧 Development mode detected');
    console.log('💡 Run window.testIntegration.runAllTests() to test integration');
  }
}

// Node.js environment tests
if (typeof window === 'undefined' && typeof module !== 'undefined') {
  const fs = require('fs');
  const path = require('path');

  function testNodeEnvironment() {
    console.log('🔍 Testing Node.js environment...');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file found');
    } else {
      console.error('❌ .env file not found');
      return false;
    }

    // Check if required files exist
    const requiredFiles = [
      'src/services/aiService.js',
      'src/hooks/useChats.js', 
      'src/utils/aiHubHelpers.js',
      'src/constants.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.error(`❌ ${file} missing`);
        return false;
      }
    }

    return true;
  }

  if (require.main === module) {
    testNodeEnvironment();
  }

  module.exports = { testNodeEnvironment };
}
