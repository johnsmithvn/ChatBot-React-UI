/**
 * Unified AI Service - Handles both OpenAI and Local AI Hub
 */
import { OpenAIService } from './openai';
import { AIHubService } from './aiHub';
import { PROVIDERS } from '../utils/constants';

export class AIService {
  constructor(settings) {
    this.settings = settings;
    this.openaiService = null;
    this.aiHubService = null;
    
    this.initializeServices();
  }

  initializeServices() {
    // Initialize OpenAI service if needed
    if (this.settings.provider === PROVIDERS.OPENAI) {
      const apiKey = this.getOpenAIApiKey();
      if (apiKey) {
        this.openaiService = new OpenAIService(apiKey);
      }
    }
    
    // Initialize AI Hub service if needed
    if (this.settings.provider === PROVIDERS.LOCAL) {
      this.aiHubService = new AIHubService();
    }
  }

  getOpenAIApiKey() {
    // Ưu tiên API key do user nhập
    if (this.settings.useCustomApiKey && this.settings.apiKey) {
      return this.settings.apiKey;
    }
    // Fallback sang biến môi trường
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY;
    }
    return '';
  }

  /**
   * Send message using the configured provider
   */
  async sendMessage(messages, model = null, options = {}) {
    if (this.settings.provider === PROVIDERS.OPENAI) {
      if (!this.openaiService) {
        throw new Error('OpenAI service not initialized. Please check your API key.');
      }
      const selectedModel = model || this.settings.model;
      return await this.openaiService.sendMessage(messages, selectedModel, options);
    } 
    else if (this.settings.provider === PROVIDERS.LOCAL) {
      if (!this.aiHubService) {
        throw new Error('AI Hub service not initialized.');
      }
      
      // For local, use the workspace-specific active model if available
      let selectedModel = model;
      if (!selectedModel) {
        // Try workspace-specific local settings first
        if (this.settings.localSettings?.activeModel) {
          selectedModel = this.settings.localSettings.activeModel;
        } 
        // Fallback to global local active model
        else if (this.settings.localActiveModel) {
          selectedModel = this.settings.localActiveModel;
        } 
        // Final fallback to auto-selection
        else {
          selectedModel = 'auto';
        }
      }
      
      return await this.aiHubService.sendMessage(messages, selectedModel, options);
    }
    else {
      throw new Error(`Unsupported provider: ${this.settings.provider}`);
    }
  }

  /**
   * Send message with streaming using the configured provider
   */
  async sendMessageStream(messages, onChunk, model = null, options = {}) {
    if (this.settings.provider === PROVIDERS.OPENAI) {
      if (!this.openaiService) {
        throw new Error('OpenAI service not initialized. Please check your API key.');
      }
      const selectedModel = model || this.settings.model;
      return await this.openaiService.sendMessageStream(messages, selectedModel, onChunk, options);
    } 
    else if (this.settings.provider === PROVIDERS.LOCAL) {
      if (!this.aiHubService) {
        throw new Error('AI Hub service not initialized.');
      }
      
      // For local, use the workspace-specific active model if available
      let selectedModel = model;
      if (!selectedModel) {
        // Try workspace-specific local settings first
        if (this.settings.localSettings?.activeModel) {
          selectedModel = this.settings.localSettings.activeModel;
        } 
        // Fallback to global local active model
        else if (this.settings.localActiveModel) {
          selectedModel = this.settings.localActiveModel;
        } 
        // Final fallback to auto-selection
        else {
          selectedModel = 'auto';
        }
      }
      
      return await this.aiHubService.sendMessageStream(messages, selectedModel, onChunk, options);
    }
    else {
      throw new Error(`Unsupported provider: ${this.settings.provider}`);
    }
  }

  /**
   * Validate the current configuration
   */
  async validateConfiguration() {
    if (this.settings.provider === PROVIDERS.OPENAI) {
      if (!this.openaiService) {
        return { valid: false, error: 'OpenAI API key not configured' };
      }
      try {
        const isValid = await this.openaiService.validateApiKey();
        return { valid: isValid, error: isValid ? null : 'Invalid OpenAI API key' };
      } catch (error) {
        return { valid: false, error: error.message };
      }
    }
    else if (this.settings.provider === PROVIDERS.LOCAL) {
      if (!this.aiHubService) {
        return { valid: false, error: 'AI Hub service not available' };
      }
      try {
        const isValid = await this.aiHubService.validateConnection();
        return { valid: isValid, error: isValid ? null : 'Cannot connect to AI Hub' };
      } catch (error) {
        return { valid: false, error: error.message };
      }
    }
    else {
      return { valid: false, error: `Unsupported provider: ${this.settings.provider}` };
    }
  }

  /**
   * Get available models based on provider
   */
  async getAvailableModels() {
    if (this.settings.provider === PROVIDERS.OPENAI) {
      // Return OpenAI models from constants
      const { MODELS, MODEL_INFO } = await import('../utils/constants');
      return Object.entries(MODELS).map(([, value]) => ({
        id: value,
        name: MODEL_INFO[value]?.name || value,
        description: MODEL_INFO[value]?.description || '',
        provider: 'openai'
      }));
    }
    else if (this.settings.provider === PROVIDERS.LOCAL) {
      if (!this.aiHubService) {
        throw new Error('AI Hub service not initialized');
      }
      try {
        const response = await this.aiHubService.getModels();
        return response.data || response;
      } catch (error) {
        console.error('Failed to get local models:', error);
        return [];
      }
    }
    else {
      return [];
    }
  }

  /**
   * Switch active model (mainly for local provider)
   */
  async switchModel(modelName) {
    if (this.settings.provider === PROVIDERS.LOCAL && this.aiHubService) {
      try {
        await this.aiHubService.switchModel(modelName);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    // For OpenAI, model switching is handled via settings
    return { success: true };
  }

  /**
   * Load model (for local provider)
   */
  async loadModel(modelName, options = {}) {
    if (this.settings.provider === PROVIDERS.LOCAL && this.aiHubService) {
      try {
        await this.aiHubService.loadModel(modelName, options);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    throw new Error('Model loading is only supported for local provider');
  }

  /**
   * Unload model (for local provider)
   */
  async unloadModel(modelName) {
    if (this.settings.provider === PROVIDERS.LOCAL && this.aiHubService) {
      try {
        await this.aiHubService.unloadModel(modelName);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    throw new Error('Model unloading is only supported for local provider');
  }

  /**
   * Optimize VRAM (for local provider)
   */
  async optimizeVRAM() {
    if (this.settings.provider === PROVIDERS.LOCAL && this.aiHubService) {
      try {
        await this.aiHubService.optimizeVRAM();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    throw new Error('VRAM optimization is only supported for local provider');
  }

  /**
   * Get current provider info
   */
  async getProviderInfo() {
    const { PROVIDER_INFO } = await import('../utils/constants');
    return PROVIDER_INFO[this.settings.provider] || null;
  }

  /**
   * Update settings and reinitialize services if needed
   */
  updateSettings(newSettings) {
    const oldProvider = this.settings.provider;
    this.settings = { ...this.settings, ...newSettings };
    
    // Reinitialize services if provider changed
    if (oldProvider !== this.settings.provider) {
      this.initializeServices();
    }
    // Reinitialize OpenAI service if API key changed
    else if (this.settings.provider === PROVIDERS.OPENAI) {
      const apiKey = this.getOpenAIApiKey();
      if (apiKey && (!this.openaiService || this.openaiService.apiKey !== apiKey)) {
        this.openaiService = new OpenAIService(apiKey);
      }
    }
  }

  /**
   * Check if current configuration is ready for use
   */
  isReady() {
    if (this.settings.provider === PROVIDERS.OPENAI) {
      return !!this.openaiService && !!this.getOpenAIApiKey();
    }
    else if (this.settings.provider === PROVIDERS.LOCAL) {
      // For local provider, we need the service to be initialized
      // Selected models are optional - AI Hub can auto-select
      return !!this.aiHubService;
    }
    return false;
  }
}
