/**
 * Helper functions for AI Hub integration
 */

import { API_CONFIG } from './constants';

/**
 * Validate AI Hub connection and get basic info
 */
export async function validateAIHubConnection() {
  try {
    const response = await fetch(`${API_CONFIG.AI_HUB_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    return {
      connected: true,
      status: data.status,
      version: data.version || 'unknown'
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Get model recommendations based on task type
 */
export function getModelRecommendations(models, taskType = 'chat') {
  if (!models || !Array.isArray(models)) return [];
  
  // Simple filtering based on model names and providers
  const recommendations = models.filter(model => {
    const name = (model.id || model.name || '').toLowerCase();
    
    if (taskType === 'chat') {
      return name.includes('chat') || name.includes('instruct') || name.includes('conversation');
    }
    
    if (taskType === 'code') {
      return name.includes('code') || name.includes('codellama') || name.includes('deepseek');
    }
    
    if (taskType === 'vietnamese') {
      return name.includes('vi') || name.includes('vietnam') || name.includes('pho');
    }
    
    return true; // Default to include all models
  });
  
  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Format model information for display
 */
export function formatModelInfo(model) {
  if (!model) return null;
  
  const name = model.id || model.name || 'Unknown Model';
  const status = model.status || 'unknown';
  const provider = model.provider || 'local';
  const vramUsage = model.vram_usage ? `${Math.round(model.vram_usage / (1024 * 1024))}MB` : null;
  
  return {
    name,
    status,
    provider,
    vramUsage,
    displayName: name.replace(/-/g, ' ').replace(/_/g, ' '),
    isLoaded: status === 'loaded',
    canLoad: status === 'unloaded' || status === 'unknown'
  };
}

/**
 * Build workspace-specific AI settings for requests
 */
export function buildWorkspaceAISettings(workspace, globalSettings) {
  const settings = {
    provider: workspace?.provider || globalSettings?.provider || 'openai',
    model: null,
    temperature: workspace?.settings?.temperature || 0.7,
    max_tokens: workspace?.settings?.maxTokens || 1000,
    top_p: workspace?.settings?.topP || 1.0,
    presence_penalty: workspace?.settings?.presencePenalty || 0.0,
    frequency_penalty: workspace?.settings?.frequencyPenalty || 0.0,
    stop: workspace?.settings?.stop?.length > 0 ? workspace.settings.stop : undefined
  };
  
  // Determine model based on provider
  if (settings.provider === 'openai') {
    // OpenAI: use workspace API settings or global settings
    if (workspace?.apiSettings?.useCustomApiKey && workspace?.apiSettings?.model) {
      settings.model = workspace.apiSettings.model;
    } else {
      settings.model = globalSettings?.model;
    }
  } else if (settings.provider === 'local') {
    // Local: use workspace local settings or global local settings
    if (workspace?.localSettings?.activeModel) {
      settings.model = workspace.localSettings.activeModel;
    } else if (globalSettings?.localActiveModel) {
      settings.model = globalSettings.localActiveModel;
    } else {
      settings.model = 'auto'; // Let AI Hub auto-select
    }
  }
  
  return settings;
}

/**
 * Build system prompt from multiple sources
 */
export function buildSystemPrompt(workspace, globalSettings, customPrompt = null) {
  let finalSystemPrompt = '';
  
  // 1. Global System Prompt (only if workspace enables it)
  if (globalSettings?.globalSystemPrompt && workspace?.useGlobalSystemPrompt !== false) {
    finalSystemPrompt += globalSettings.globalSystemPrompt;
  }
  
  // 2. Persona character definition (if workspace has persona)
  if (workspace?.persona?.characterDefinition) {
    if (finalSystemPrompt) finalSystemPrompt += '\n\n';
    finalSystemPrompt += workspace.persona.characterDefinition;
  }
  
  // 3. Custom system prompt (highest priority)
  if (customPrompt) {
    if (finalSystemPrompt) finalSystemPrompt += '\n\n';
    finalSystemPrompt += customPrompt;
  }
  
  return finalSystemPrompt || null;
}

/**
 * Check if workspace is properly configured for the selected provider
 */
export function validateWorkspaceConfiguration(workspace, globalSettings) {
  const errors = [];
  const warnings = [];
  
  if (!workspace) {
    errors.push('No workspace selected');
    return { valid: false, errors, warnings };
  }
  
  const provider = workspace.provider || globalSettings?.provider || 'openai';
  
  if (provider === 'openai') {
    // Check OpenAI configuration
    if (workspace.apiSettings?.useCustomApiKey) {
      if (!workspace.apiSettings?.apiKey) {
        errors.push('Custom API key is enabled but no API key provided');
      }
      if (!workspace.apiSettings?.model) {
        warnings.push('No model selected for workspace, will use default');
      }
    } else {
      if (!globalSettings?.apiKey && !globalSettings?.useCustomApiKey) {
        errors.push('No global API key configured');
      }
    }
  } else if (provider === 'local') {
    // Check Local AI Hub configuration
    if (!workspace.localSettings?.selectedModels?.length && !globalSettings?.selectedLocalModels?.length) {
      warnings.push('No local models selected, AI Hub will auto-select');
    }
    
    if (!workspace.localSettings?.activeModel && !globalSettings?.localActiveModel) {
      warnings.push('No active model set, AI Hub will auto-select');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
