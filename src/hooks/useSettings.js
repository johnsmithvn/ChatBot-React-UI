import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';
import { MODELS, API_CONFIG, DEFAULT_PERSONAS, PROVIDERS } from '../utils/constants';

/**
 * Hook quản lý settings của ứng dụng
 */
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('app_settings', {
    // Provider Settings
    provider: PROVIDERS.OPENAI,
    
    // API Settings - OpenAI
    useCustomApiKey: false, // Toggle để sử dụng API key tùy chỉnh
    apiKey: '',
    model: MODELS.GPT_4O_MINI,
    
    // Local AI Hub Settings
    selectedLocalModels: [], // Array of selected model names for local provider
    localActiveModel: null, // Currently active local model
    
    // UI Settings
    theme: 'light',
    language: 'vi',
    sidebarCollapsed: false,
    
    // Chat Settings
    autoSave: true,
    showTimestamps: true,
    markdownEnabled: true,
    
    // Global System Prompt (configurable by user)
    globalSystemPrompt: `Bạn là một AI assistant thông minh và hữu ích. Hãy trả lời bằng tiếng Việt và LUÔN sử dụng định dạng Markdown để làm đẹp câu trả lời:

🎯 **Quy tắc định dạng:**
- Sử dụng **bold** cho từ khóa quan trọng
- Sử dụng \`inline code\` cho tên function, variable, command
- Sử dụng \`\`\`language cho code blocks với ngôn ngữ cụ thể
- Sử dụng ## cho headers chính, ### cho sub-headers  
- Sử dụng - hoặc 1. cho lists
- Sử dụng > cho blockquotes khi cần nhấn mạnh
- Sử dụng | | cho tables khi trình bày data

Hãy luôn format đẹp để dễ đọc!`,

    // Default Workspace Character Definition
    defaultWorkspacePrompt: `Định nghĩa tính cách và cách thức hoạt động của AI trong workspace này...`,

    // Custom Personas (user can modify these)
    customPersonas: { ...DEFAULT_PERSONAS }
  });

  /**
   * Cập nhật một setting
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setSettings]);

  /**
   * Cập nhật nhiều settings cùng lúc
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, [setSettings]);

  /**
   * Reset về settings mặc định
   */
  const resetSettings = useCallback(() => {
    setSettings({
      provider: PROVIDERS.OPENAI,
      useCustomApiKey: false,
      apiKey: '',
      model: MODELS.GPT_4O_MINI,
      selectedLocalModels: [],
      localActiveModel: null,
      theme: 'light',
      language: 'vi',
      sidebarCollapsed: false,
      autoSave: true,
      showTimestamps: true,
      markdownEnabled: true,
      temperature: 0.7,

      defaultWorkspacePrompt: `Bạn đang làm việc trong một workspace chuyên nghiệp. Hãy:

📋 **Nguyên tắc làm việc:**
- Tập trung vào context của workspace hiện tại
- Đưa ra lời khuyên practical và actionable
- Giải thích rõ ràng từng bước thực hiện
- Suggest best practices trong domain này
- Hỗ trợ troubleshooting khi gặp vấn đề

💡 **Mục tiêu:** Trở thành trợ lý đắc lực giúp hoàn thành công việc hiệu quả!`,

      customPersonas: { ...DEFAULT_PERSONAS }
    });
  }, [setSettings]);

  /**
   * Persona Management Functions
   */
  const updatePersona = useCallback((personaId, updatedPersona) => {
    setSettings(prev => ({
      ...prev,
      customPersonas: {
        ...prev.customPersonas,
        [personaId]: updatedPersona
      }
    }));
  }, [setSettings]);

  const addPersona = useCallback((persona) => {
    setSettings(prev => ({
      ...prev,
      customPersonas: {
        ...prev.customPersonas,
        [persona.id]: persona
      }
    }));
  }, [setSettings]);

  const deletePersona = useCallback((personaId) => {
    setSettings(prev => {
      const newPersonas = { ...prev.customPersonas };
      delete newPersonas[personaId];
      return {
        ...prev,
        customPersonas: newPersonas
      };
    });
  }, [setSettings]);

  const resetPersonas = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      customPersonas: { ...DEFAULT_PERSONAS }
    }));
  }, [setSettings]);

  /**
   * Validate API configuration based on provider
   */
  const isApiConfigValid = useCallback(() => {
    if (settings.provider === PROVIDERS.OPENAI) {
      if (!settings.useCustomApiKey) {
        // Sử dụng env API key
        return import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY.length > 0;
      }
      return settings.apiKey && settings.apiKey.startsWith(API_CONFIG.API_KEY_PREFIX) && settings.apiKey.length > API_CONFIG.MIN_API_KEY_LENGTH;
    } else if (settings.provider === PROVIDERS.LOCAL) {
      // Local provider không cần API key, chỉ cần có model được chọn
      return settings.selectedLocalModels && settings.selectedLocalModels.length > 0;
    }
    return false;
  }, [settings.provider, settings.apiKey, settings.useCustomApiKey, settings.selectedLocalModels]);

  /**
   * Lấy API key hiện tại (chỉ cho OpenAI provider)
   */
  const getApiKey = useCallback(() => {
    if (settings.provider !== PROVIDERS.OPENAI) {
      return '';
    }
    
    // Ưu tiên API key do user nhập
    if (settings.useCustomApiKey && settings.apiKey && settings.apiKey.startsWith(API_CONFIG.API_KEY_PREFIX)) {
      return settings.apiKey;
    }
    // Fallback sang biến môi trường
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY;
    }
    // Nếu không có, log cảnh báo
    console.warn('⚠️ Không tìm thấy OpenAI API key!');
    return '';
  }, [settings.provider, settings.apiKey, settings.useCustomApiKey]);

  /**
   * Local model management functions
   */
  const updateSelectedLocalModels = useCallback((models) => {
    setSettings(prev => ({
      ...prev,
      selectedLocalModels: models
    }));
  }, [setSettings]);

  const setLocalActiveModel = useCallback((modelName) => {
    setSettings(prev => ({
      ...prev,
      localActiveModel: modelName
    }));
  }, [setSettings]);

  return {
    // Settings object
    settings,
    
    // Actions
    updateSetting,
    updateSettings,
    resetSettings,
    
    // Persona management
    updatePersona,
    addPersona,
    deletePersona,
    resetPersonas,
    
    // Local model management
    updateSelectedLocalModels,
    setLocalActiveModel,
    
    // Helpers
    isApiConfigValid,
    getApiKey
  };
}
