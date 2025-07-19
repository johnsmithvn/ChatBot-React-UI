/**
 * Các hằng số sử dụng trong ứng dụng
 */

// API Configuration
export const API_CONFIG = {
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  API_KEY_PREFIX: 'sk-',
  MIN_API_KEY_LENGTH: 20
};

// OpenAI Models
export const MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O: 'gpt-4o',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4_VISION: 'gpt-4-vision-preview',
  GPT_3_5_TURBO: 'gpt-3.5-turbo'
};

// Model descriptions
export const MODEL_INFO = {
  [MODELS.GPT_4O_MINI]: {
    name: 'GPT-4o Mini',
    description: 'Fast, cheap, and capable',
    supportsVision: false,
    maxTokens: 16385,
    cost: 'Low'
  },
  [MODELS.GPT_4O]: {
    name: 'GPT-4o',
    description: 'Most capable multimodal model',
    supportsVision: true,
    maxTokens: 128000,
    cost: 'High'
  },
  [MODELS.GPT_4_VISION]: {
    name: 'GPT-4 Vision Preview',
    description: 'GPT-4 with vision capabilities',
    supportsVision: true,
    maxTokens: 128000,
    cost: 'High'
  },
  [MODELS.GPT_4_TURBO]: {
    name: 'GPT-4 Turbo',
    description: 'More capable than GPT-4, optimized for chat',
    supportsVision: false,
    maxTokens: 128000,
    cost: 'High'
  }
};

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Languages
export const LANGUAGES = {
  VIETNAMESE: 'vi',
  ENGLISH: 'en',
  CHINESE: 'zh',
  JAPANESE: 'ja'
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_FILES_PER_MESSAGE: 5,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'text/markdown']
};

// Chat settings
export const CHAT_SETTINGS = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_CHATS: 100,
  MAX_MESSAGES_PER_CHAT: 1000,
  DEFAULT_CONTEXT_TOKENS: 10000, // Default context window limit
  MIN_CONTEXT_TOKENS: 1000, // Minimum context tokens
  MAX_CONTEXT_TOKENS: 100000, // Maximum context tokens (based on model limits)
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
  TYPING_INDICATOR_DELAY: 500 // 0.5 second
};

// API settings
export const API_SETTINGS = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 60,
  MESSAGE_BUBBLE_MAX_WIDTH: '85%',
  ANIMATION_DURATION: 300 // milliseconds
};

// LocalStorage keys
export const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chat_sessions',
  CURRENT_CHAT_ID: 'current_chat_id',
  APP_SETTINGS: 'app_settings',
  USER_PREFERENCES: 'user_preferences',
  API_KEY: 'user_api_key'
};

// Error messages
export const ERROR_MESSAGES = {
  NO_API_KEY: 'API Key is required. Please add your OpenAI API key in settings.',
  INVALID_API_KEY: 'Invalid API Key. Please check your OpenAI API key.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  MESSAGE_TOO_LONG: `Message is too long. Maximum ${CHAT_SETTINGS.MAX_MESSAGE_LENGTH} characters allowed.`,
  FILE_TOO_LARGE: `File is too large. Maximum ${FILE_LIMITS.MAX_SIZE / 1024 / 1024}MB allowed.`,
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CHAT_CREATED: 'New chat created successfully!',
  CHAT_DELETED: 'Chat deleted successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  MESSAGE_COPIED: 'Message copied to clipboard!'
};

// Workspace và Group Configuration
export const WORKSPACE_CONFIG = {
  MAX_WORKSPACES: 10,
  MAX_GROUPS_PER_WORKSPACE: 20,
  MAX_CHATS_PER_GROUP: 50,
  DEFAULT_WORKSPACE_NAME: 'Default Workspace',
  DEFAULT_GROUP_NAME: 'General'
};

// Message Actions
export const MESSAGE_ACTIONS = {
  COPY: 'copy',
  EDIT: 'edit',
  REGENERATE: 'regenerate',
  BRANCH: 'branch',
  DELETE: 'delete',
  BOOKMARK: 'bookmark'
};

// Persona Types
export const PERSONA_TYPES = {
  ASSISTANT: 'assistant',
  CODING: 'coding',
  CREATIVE: 'creative',
  ANALYTICAL: 'analytical',
  TRANSLATOR: 'translator',
  TEACHER: 'teacher',
  CUSTOM: 'custom'
};

// Prompt Templates
export const PROMPT_TEMPLATES = {
  CODING: {
    id: 'coding',
    name: '💻 Code Assistant',
    description: 'Giúp viết và debug code',
    template: `Bạn là một senior developer chuyên nghiệp. Hãy:
- Viết code sạch, có comment
- Giải thích logic rõ ràng
- Đưa ra best practices
- Suggest improvements nếu cần

Ngôn ngữ: {{language}}
Framework: {{framework}}
Yêu cầu: {{requirement}}`
  },
  TRANSLATOR: {
    id: 'translator',
    name: '🌍 Translator',
    description: 'Dịch thuật chuyên nghiệp',
    template: `Bạn là một translator chuyên nghiệp. Hãy:
- Dịch chính xác, tự nhiên
- Giữ nguyên format và context
- Giải thích thuật ngữ khó nếu cần

Từ: {{source_language}}
Sang: {{target_language}}
Nội dung: {{content}}`
  },
  CREATIVE: {
    id: 'creative',
    name: '🎨 Creative Writer',
    description: 'Viết content sáng tạo',
    template: `Bạn là một creative writer tài năng. Hãy:
- Viết content hấp dẫn, sáng tạo
- Sử dụng ngôn ngữ sinh động
- Phù hợp với tone & style

Thể loại: {{genre}}
Độ dài: {{length}}
Đối tượng: {{audience}}
Chủ đề: {{topic}}`
  },
  TEACHER: {
    id: 'teacher',
    name: '🎓 Teacher',
    description: 'Giảng dạy và giải thích',
    template: `Bạn là một giáo viên kinh nghiệm. Hãy:
- Giải thích đơn giản, dễ hiểu
- Đưa ra ví dụ cụ thể
- Kiểm tra hiểu biết
- Khuyến khích học tập

Môn học: {{subject}}
Trình độ: {{level}}
Chủ đề: {{topic}}`
  }
};

// Default Personas
export const DEFAULT_PERSONAS = {
  assistant: {
    id: 'assistant',
    name: '🤖 AI Assistant',
    description: 'Trợ lý AI thông minh và hữu ích',
    characterDefinition: `Bạn là một AI assistant thông minh và hữu ích. Hãy trả lời bằng tiếng Việt và sử dụng markdown để format đẹp câu trả lời.`,
    temperature: 0.7,
    maxTokens: 1000
  },
  coding: {
    id: 'coding',
    name: '💻 Code Expert',
    description: 'Chuyên gia lập trình',
    characterDefinition: `Bạn là một senior developer với kinh nghiệm sâu rộng. Hãy giúp viết code sạch, debug lỗi và đưa ra best practices.`,
    temperature: 0.3,
    maxTokens: 2000
  },
  creative: {
    id: 'creative',
    name: '🎨 Creative Writer',
    description: 'Nhà văn sáng tạo',
    characterDefinition: `Bạn là một creative writer tài năng. Hãy viết content sáng tạo, hấp dẫn với ngôn ngữ sinh động và phong phú.`,
    temperature: 0.9,
    maxTokens: 1500
  },
  analytical: {
    id: 'analytical',
    name: '📊 Data Analyst',
    description: 'Chuyên gia phân tích dữ liệu',
    characterDefinition: `Bạn là một data analyst chuyên nghiệp. Hãy phân tích dữ liệu một cách logic, đưa ra insights và recommendations.`,
    temperature: 0.2,
    maxTokens: 1200
  }
};
