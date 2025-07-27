/**
 * Hook để quản lý AI Service dựa trên settings
 */
import { useMemo, useCallback } from 'react';
import { AIService } from '../services/aiService';
import { useSettings } from './useSettings';

export function useAIService() {
  const { settings } = useSettings();

  // Create AI service instance based on current settings
  const aiService = useMemo(() => {
    return new AIService(settings);
  }, [settings]);

  /**
   * Send a message using the AI service
   */
  const sendMessage = useCallback(async (messages, model = null, options = {}) => {
    return await aiService.sendMessage(messages, model, options);
  }, [aiService]);

  /**
   * Send a message with streaming
   */
  const sendMessageStream = useCallback(async (messages, onChunk, model = null, options = {}) => {
    return await aiService.sendMessageStream(messages, onChunk, model, options);
  }, [aiService]);

  /**
   * Validate current configuration
   */
  const validateConfiguration = useCallback(async () => {
    return await aiService.validateConfiguration();
  }, [aiService]);

  /**
   * Get available models
   */
  const getAvailableModels = useCallback(async () => {
    return await aiService.getAvailableModels();
  }, [aiService]);

  /**
   * Switch active model
   */
  const switchModel = useCallback(async (modelName) => {
    return await aiService.switchModel(modelName);
  }, [aiService]);

  /**
   * Load model (for local provider)
   */
  const loadModel = useCallback(async (modelName, options = {}) => {
    return await aiService.loadModel(modelName, options);
  }, [aiService]);

  /**
   * Unload model (for local provider)
   */
  const unloadModel = useCallback(async (modelName) => {
    return await aiService.unloadModel(modelName);
  }, [aiService]);

  /**
   * Optimize VRAM (for local provider)
   */
  const optimizeVRAM = useCallback(async () => {
    return await aiService.optimizeVRAM();
  }, [aiService]);

  /**
   * Check if service is ready
   */
  const isReady = useCallback(() => {
    return aiService.isReady();
  }, [aiService]);

  /**
   * Get provider info
   */
  const getProviderInfo = useCallback(async () => {
    return await aiService.getProviderInfo();
  }, [aiService]);

  return {
    // Main AI operations
    sendMessage,
    sendMessageStream,
    
    // Configuration
    validateConfiguration,
    isReady,
    getProviderInfo,
    
    // Model management
    getAvailableModels,
    switchModel,
    loadModel,
    unloadModel,
    optimizeVRAM,
    
    // Current settings info
    currentProvider: settings.provider,
    currentModel: settings.provider === 'openai' ? settings.model : settings.localActiveModel,
    selectedLocalModels: settings.selectedLocalModels
  };
}
