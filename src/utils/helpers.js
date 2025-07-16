import { CHAT_SETTINGS } from './constants';

/**
 * Tạo title cho chat từ tin nhắn đầu tiên
 * @param {string} firstMessage - Tin nhắn đầu tiên
 * @returns {string} - Title được tạo
 */
export function generateChatTitle(firstMessage) {
  if (!firstMessage || typeof firstMessage !== 'string') {
    return 'New Chat';
  }

  // Loại bỏ whitespace thừa
  const cleaned = firstMessage.trim();
  
  if (cleaned.length === 0) {
    return 'New Chat';
  }

  // Lấy 6 từ đầu tiên
  const words = cleaned.split(/\s+/);
  const title = words.slice(0, 6).join(' ');
  
  // Giới hạn độ dài
  if (title.length > 40) {
    return title.substring(0, 40) + '...';
  }
  
  return title;
}

/**
 * Format thời gian hiển thị
 * @param {string|Date} timestamp - Timestamp
 * @param {string} format - Format type: 'time', 'date', 'datetime', 'relative'
 * @returns {string} - Formatted time
 */
export function formatMessageTime(timestamp, format = 'time') {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  switch (format) {
    case 'time':
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });

    case 'date':
      return date.toLocaleDateString('vi-VN');

    case 'datetime':
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

    case 'relative':
      if (diff < 60000) { // < 1 minute
        return 'Vừa xong';
      } else if (diff < 3600000) { // < 1 hour
        return `${Math.floor(diff / 60000)} phút trước`;
      } else if (diff < 86400000) { // < 1 day
        return `${Math.floor(diff / 3600000)} giờ trước`;
      } else if (diff < 604800000) { // < 1 week
        return `${Math.floor(diff / 86400000)} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }

    default:
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback cho browsers cũ
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Debounce function để giảm số lần gọi hàm
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function để giới hạn số lần gọi hàm
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @returns {Object} - Validation result
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  if (trimmed.length > CHAT_SETTINGS.MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message is too long. Maximum ${CHAT_SETTINGS.MAX_MESSAGE_LENGTH} characters allowed.`
    };
  }

  return {
    isValid: true,
    message: trimmed
  };
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if text contains code
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains code
 */
export function containsCode(text) {
  // Check for code blocks
  if (text.includes('```') || text.includes('`')) {
    return true;
  }
  
  // Check for common programming keywords
  const codeKeywords = [
    'function', 'const', 'let', 'var', 'class', 'import', 'export',
    'if', 'else', 'for', 'while', 'return', 'console.log', 'print',
    'def', 'public', 'private', 'static', 'void', 'int', 'string'
  ];
  
  return codeKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Parse error message from API response
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export function parseErrorMessage(error) {
  if (!error) return 'Unknown error occurred';
  
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // API errors
  if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
    return 'Invalid API key. Please check your settings.';
  }
  
  if (error.message?.includes('429') || error.message?.includes('rate limit')) {
    return 'Rate limit exceeded. Please try again later.';
  }
  
  if (error.message?.includes('quota')) {
    return 'API quota exceeded. Please check your OpenAI billing.';
  }
  
  // Return original message or fallback
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Ước tính số tokens trong text
 * @param {string} text - Text cần ước tính
 * @returns {number} - Số tokens ước tính
 */
export function estimateTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Rough estimation cho tiếng Việt: 1 token ≈ 2.5 characters
  // Cho tiếng Anh: 1 token ≈ 4 characters
  // Sử dụng 3 để balanced
  return Math.ceil(text.length / 3);
}

/**
 * Tính tổng tokens của một array messages
 * @param {Array} messages - Array messages
 * @returns {number} - Tổng tokens
 */
export function calculateTotalTokens(messages) {
  if (!Array.isArray(messages)) {
    return 0;
  }
  
  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content || '');
  }, 0);
}

/**
 * Giới hạn messages theo token limit
 * @param {Array} messages - Array messages
 * @param {number} maxTokens - Giới hạn tokens
 * @returns {Array} - Messages đã được giới hạn
 */
export function limitMessagesByTokens(messages, maxTokens = CHAT_SETTINGS.DEFAULT_CONTEXT_TOKENS) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }
  
  // Validate maxTokens
  if (maxTokens < CHAT_SETTINGS.MIN_CONTEXT_TOKENS) {
    maxTokens = CHAT_SETTINGS.MIN_CONTEXT_TOKENS;
  }
  
  if (maxTokens > CHAT_SETTINGS.MAX_CONTEXT_TOKENS) {
    maxTokens = CHAT_SETTINGS.MAX_CONTEXT_TOKENS;
  }
  
  let totalTokens = 0;
  const limitedMessages = [];
  
  // Đi từ cuối lên đầu để giữ lại messages gần nhất
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content || '');
    
    // Kiểm tra nếu thêm message này có vượt quá limit không
    if (totalTokens + messageTokens > maxTokens) {
      // Nếu chưa có message nào và message đầu tiên đã vượt quá limit
      if (limitedMessages.length === 0) {
        // Truncate message content để fit
        const maxContentLength = Math.floor(maxTokens * 3); // Reverse của estimateTokens
        const truncatedContent = message.content.substring(0, maxContentLength) + '...';
        limitedMessages.unshift({
          ...message,
          content: truncatedContent
        });
      }
      break;
    }
    
    totalTokens += messageTokens;
    limitedMessages.unshift(message);
  }
  
  return limitedMessages;
}

/**
 * Giới hạn messages theo token limit với bảo vệ default prompt
 * @param {Array} messages - Danh sách messages
 * @param {number} maxTokens - Giới hạn token
 * @param {string} defaultPrompt - Prompt mặc định của group (luôn được bảo vệ)
 * @returns {Array} - Messages sau khi giới hạn
 */
export function limitMessagesByTokensWithPrompt(messages, maxTokens, defaultPrompt = null) {
  if (!messages || messages.length === 0) return [];

  // Tính token cho default prompt (nếu có)
  const promptTokens = defaultPrompt ? estimateTokens(defaultPrompt) : 0;
  const availableTokens = maxTokens - promptTokens;

  // Nếu available tokens quá ít, chỉ giữ lại message cuối cùng
  if (availableTokens < 500) {
    return messages.slice(-1);
  }

  // Tính token từ cuối lên đầu (để giữ lại messages gần nhất)
  let totalTokens = 0;
  const result = [];
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);
    
    if (totalTokens + messageTokens <= availableTokens) {
      totalTokens += messageTokens;
      result.unshift(message);
    } else {
      // Đã đạt giới hạn, dừng lại
      break;
    }
  }

  console.log(`🔒 Prompt tokens: ${promptTokens}, Available: ${availableTokens}, Used: ${totalTokens}`);
  
  return result;
}

/**
 * Chuẩn bị messages cho API với default prompt
 * @param {Array} messages - Danh sách messages
 * @param {string} defaultPrompt - Prompt mặc định của group
 * @returns {Array} - Messages cho API
 */
export function prepareMessagesForAPI(messages, defaultPrompt = null) {
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Nếu có default prompt, thêm vào đầu như system message
  if (defaultPrompt && defaultPrompt.trim()) {
    return [
      {
        role: 'system',
        content: defaultPrompt.trim()
      },
      ...apiMessages
    ];
  }

  return apiMessages;
}

/**
 * Validate context tokens input
 * @param {number|string} value - Giá trị cần validate
 * @returns {Object} - { isValid: boolean, value: number, error: string }
 */
export function validateContextTokens(value) {
  // Convert to number
  const numValue = typeof value === 'string' ? parseInt(value.trim(), 10) : value;
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      value: CHAT_SETTINGS.DEFAULT_CONTEXT_TOKENS,
      error: 'Vui lòng nhập số hợp lệ'
    };
  }
  
  if (numValue < CHAT_SETTINGS.MIN_CONTEXT_TOKENS) {
    return {
      isValid: false,
      value: CHAT_SETTINGS.MIN_CONTEXT_TOKENS,
      error: `Tối thiểu ${CHAT_SETTINGS.MIN_CONTEXT_TOKENS.toLocaleString()} tokens`
    };
  }
  
  if (numValue > CHAT_SETTINGS.MAX_CONTEXT_TOKENS) {
    return {
      isValid: false,
      value: CHAT_SETTINGS.MAX_CONTEXT_TOKENS,
      error: `Tối đa ${CHAT_SETTINGS.MAX_CONTEXT_TOKENS.toLocaleString()} tokens`
    };
  }
  
  return {
    isValid: true,
    value: numValue,
    error: null
  };
}
