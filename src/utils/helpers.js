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
