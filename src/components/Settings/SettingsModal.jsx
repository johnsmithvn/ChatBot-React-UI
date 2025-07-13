import React, { useState } from 'react';
import { MODELS } from '../../utils/constants';

export function SettingsModal({ isOpen, onClose, settings, onUpdateSetting }) {
  const [tempSettings, setTempSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    // Cập nhật từng setting
    Object.keys(tempSettings).forEach(key => {
      if (tempSettings[key] !== settings[key]) {
        onUpdateSetting(key, tempSettings[key]);
      }
    });
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="modal-close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* API Settings */}
          <div className="settings-section">
            <h3>🔑 API Configuration</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={tempSettings.useCustomApiKey}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    useCustomApiKey: e.target.checked
                  })}
                />
                <span>🔧 Use custom API key</span>
              </label>
              <small className="form-hint">
                {tempSettings.useCustomApiKey 
                  ? "💡 Sử dụng API key tùy chỉnh" 
                  : "💡 Sử dụng API key từ environment variables"}
              </small>
            </div>

            {tempSettings.useCustomApiKey && (
              <div className="form-group">
                <label htmlFor="apiKey">OpenAI API Key</label>
                <input
                  id="apiKey"
                  type="password"
                  value={tempSettings.apiKey}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    apiKey: e.target.value
                  })}
                  placeholder="sk-..."
                  className="form-input"
                />
                <small className="form-hint">
                  🔒 API key sẽ được lưu an toàn trên thiết bị của bạn
                </small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="model">Model</label>
              <select
                id="model"
                value={tempSettings.model}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  model: e.target.value
                })}
                className="form-select"
              >
                <option value={MODELS.GPT_4O_MINI}>GPT-4o Mini (Recommended)</option>
                <option value={MODELS.GPT_4O}>GPT-4o</option>
                <option value={MODELS.GPT_4_TURBO}>GPT-4 Turbo</option>
                <option value={MODELS.GPT_3_5_TURBO}>GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="settings-section">
            <h3>🎛️ Advanced Settings</h3>
            
            <div className="form-group">
              <label htmlFor="temperature">
                Temperature: {tempSettings.temperature}
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={tempSettings.temperature}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  temperature: parseFloat(e.target.value)
                })}
                className="form-range"
              />
              <small className="form-hint">
                🎯 Điều chỉnh tính sáng tạo (0 = chính xác, 2 = sáng tạo)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="maxTokens">Max Tokens</label>
              <input
                id="maxTokens"
                type="number"
                min="100"
                max="4000"
                value={tempSettings.maxTokens}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  maxTokens: parseInt(e.target.value)
                })}
                className="form-input"
              />
              <small className="form-hint">
                📝 Độ dài tối đa của phản hồi
              </small>
            </div>
          </div>

          {/* UI Settings */}
          <div className="settings-section">
            <h3>🎨 UI Settings</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={tempSettings.showTimestamps}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    showTimestamps: e.target.checked
                  })}
                />
                <span>🕒 Show timestamps</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={tempSettings.markdownEnabled}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    markdownEnabled: e.target.checked
                  })}
                />
                <span>📝 Enable Markdown</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel}
              type="button"
            >
              ❌ Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              type="button"
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
