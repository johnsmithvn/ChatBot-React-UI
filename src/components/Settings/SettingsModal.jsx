import React, { useState, useEffect } from 'react';
import { MODELS, CHAT_SETTINGS } from '../../utils/constants';
import { validateContextTokens } from '../../utils/helpers';

export function SettingsModal({ isOpen, onClose, settings, onUpdateSetting }) {
  const [tempSettings, setTempSettings] = useState({...settings});
  
  // Update tempSettings when settings change or modal opens
  useEffect(() => {
    if (isOpen && settings) {
      console.log("SettingsModal: Updating tempSettings with", settings);
      setTempSettings({...settings});
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Log the settings before saving
    console.log("SettingsModal: Saving settings", { tempSettings, currentSettings: settings });
    
    // Cập nhật từng setting
    Object.keys(tempSettings).forEach(key => {
      if (JSON.stringify(tempSettings[key]) !== JSON.stringify(settings[key])) {
        console.log(`SettingsModal: Updating setting ${key}`, { 
          oldValue: settings[key], 
          newValue: tempSettings[key] 
        });
        onUpdateSetting(key, tempSettings[key]);
      }
    });
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  console.log('SettingsModal: Rendered with isOpen =', isOpen, 'settings =', settings);
  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        className="modal-content"
        style={{
          position: 'relative',
          zIndex: 1010,
          minWidth: 400,
          minHeight: 200,
          padding: 24,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '2px solid #007aff',
        }}
        onClick={e => e.stopPropagation()}
      >
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

            <div className="form-group">
              <label htmlFor="contextTokens">Context Tokens</label>
              <input
                id="contextTokens"
                type="number"
                min={CHAT_SETTINGS.MIN_CONTEXT_TOKENS}
                max={CHAT_SETTINGS.MAX_CONTEXT_TOKENS}
                value={tempSettings.contextTokens || CHAT_SETTINGS.DEFAULT_CONTEXT_TOKENS}
                onChange={(e) => {
                  const validation = validateContextTokens(e.target.value);
                  setTempSettings({
                    ...tempSettings,
                    contextTokens: validation.value
                  });
                }}
                className="form-input"
              />
              <small className="form-hint">
                🧠 Số tokens tối đa cho context (bao gồm lịch sử chat)
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
