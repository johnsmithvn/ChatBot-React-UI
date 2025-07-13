/**
 * Service để kết nối với OpenAI API
 */
import { MODELS, API_CONFIG } from '../utils/constants';

export class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = API_CONFIG.OPENAI_BASE_URL;
  }

  /**
   * Gửi tin nhắn tới OpenAI
   * @param {Array} messages - Mảng các tin nhắn
   * @param {string} model - Model AI sử dụng
   * @param {Object} options - Các tùy chọn khác
   * @returns {Promise<string>} - Response từ AI
   */
  async sendMessage(messages, model = MODELS.GPT_4O_MINI, options = {}) {
    if (!this.apiKey) {
      throw new Error('API Key is required');
    }

    const {
      temperature = 0.7,
      max_tokens = 1000,
      systemPrompt = null
    } = options;

    // Thêm system prompt nếu có
    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: fullMessages,
          temperature,
          max_tokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      return data.choices[0].message.content;

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Gửi tin nhắn với streaming response
   * @param {Array} messages - Mảng các tin nhắn
   * @param {string} model - Model AI sử dụng
   * @param {Function} onChunk - Callback cho mỗi chunk nhận được
   * @param {Object} options - Các tùy chọn khác
   */
  async sendMessageStream(messages, model = MODELS.GPT_4O_MINI, onChunk, options = {}) {
    if (!this.apiKey) {
      throw new Error('API Key is required');
    }

    const {
      temperature = 0.7,
      max_tokens = 1000,
      systemPrompt = null
    } = options;

    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: fullMessages,
          temperature,
          max_tokens,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body.getReader();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return fullContent;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                onChunk(content, fullContent);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullContent;

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Validate API key
   * @returns {Promise<boolean>} - True nếu API key hợp lệ
   */
  async validateApiKey() {
    try {
      await this.sendMessage([
        { role: 'user', content: 'Hello' }
      ], MODELS.GPT_4O_MINI);
      return true;
    } catch {
      return false;
    }
  }
}
