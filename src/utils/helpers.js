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
 * Validate message content
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
