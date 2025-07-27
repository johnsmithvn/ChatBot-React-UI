/**
 * Service kết nối với AI‑Hub (FastAPI)
 */
import { API_CONFIG } from '../utils/constants';

export class AiHubService {
  constructor(baseUrl = API_CONFIG.AI_HUB_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async listModels() {
    const res = await fetch(`${this.baseUrl}/models`);
    if (!res.ok) {
      throw new Error(`Không lấy được danh sách model: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // API trả về { models: [...], total: n, loaded: m }
    return data.models.map(m => m.name);
  }

  async loadModel(modelName) {
    const res = await fetch(`${this.baseUrl}/models/${modelName}/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return await res.json();
  }

  async unloadModel(modelName) {
    const res = await fetch(`${this.baseUrl}/models/${modelName}/unload`, { method: 'POST' });
    return await res.json();
  }

  async switchModel(modelName) {
    const res = await fetch(`${this.baseUrl}/models/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: modelName })
    });
    return await res.json();
  }

  async sendMessage(messages, modelName, options = {}) {
    const body = {
      model: modelName,
      messages,
      stream: false,
      ...options
    };
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI‑Hub error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
    };
  }
}
