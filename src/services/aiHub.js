/**
 * Service để kết nối với AI Hub Local API
 */
import { API_CONFIG } from '../utils/constants';

export class AIHubService {
  constructor() {
    this.baseUrl = API_CONFIG.AI_HUB_BASE_URL;
  }

  /**
   * Kiểm tra tình trạng hệ thống
   */
  async getHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health/`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('AI Hub health check failed:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách models có sẵn
   */
  async getModels(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.provider) params.append('provider', filters.provider);

      const url = `${this.baseUrl}/models/?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get models:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái chi tiết của một model
   */
  async getModelStatus(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/models/${encodeURIComponent(modelName)}/status`);
      if (!response.ok) {
        throw new Error(`Failed to get model status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to get status for model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Load model vào memory
   */
  async loadModel(modelName, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/models/${encodeURIComponent(modelName)}/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          force: options.force || false,
          priority: options.priority || 'normal'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load model: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Unload model khỏi memory
   */
  async unloadModel(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/models/${encodeURIComponent(modelName)}/unload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to unload model: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to unload model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Chuyển đổi active model
   */
  async switchModel(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/models/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_name: modelName
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to switch model: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to switch to model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Tối ưu VRAM
   */
  async optimizeVRAM() {
    try {
      const response = await fetch(`${this.baseUrl}/models/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to optimize VRAM: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to optimize VRAM:', error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn chat (tương thích với OpenAI API)
   */
  async sendMessage(messages, model = 'auto', options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1000,
      top_p = 1.0,
      presence_penalty = 0.0,
      frequency_penalty = 0.0,
      stop = undefined,
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'auto',
          messages: fullMessages,
          temperature,
          max_tokens,
          top_p,
          presence_penalty,
          frequency_penalty,
          ...(stop && stop.length > 0 && { stop }),
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          errorData.detail ||
          `AI Hub API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from AI Hub API');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage
      };

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check AI Hub connection.');
      }
      throw error;
    }
  }

  /**
   * Gửi tin nhắn với streaming response
   */
  async sendMessageStream(messages, model = 'auto', onChunk, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1000,
      top_p = 1.0,
      presence_penalty = 0.0,
      frequency_penalty = 0.0,
      stop = undefined,
      systemPrompt = null
    } = options;

    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'auto',
          messages: fullMessages,
          temperature,
          max_tokens,
          top_p,
          presence_penalty,
          frequency_penalty,
          ...(stop && stop.length > 0 && { stop }),
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          errorData.detail ||
          `AI Hub API error: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const content = parsed.choices[0].delta.content;
                if (content) {
                  onChunk(content);
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check AI Hub connection.');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách models chat có sẵn
   */
  async getChatModels() {
    try {
      const response = await fetch(`${this.baseUrl}/chat/models`);
      if (!response.ok) {
        throw new Error(`Failed to get chat models: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get chat models:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi active model cho chat
   */
  async switchChatModel(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/switch-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_name: modelName
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to switch chat model: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to switch chat model to ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối đến AI Hub
   */
  async validateConnection() {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }
}
