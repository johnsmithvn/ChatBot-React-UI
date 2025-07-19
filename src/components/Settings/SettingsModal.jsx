import React, { useState, useEffect } from 'react';
import { MODELS } from '../../utils/constants';

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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        className="modal-content settings-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="modal-close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body settings-content">
          {/* API Configuration Notice */}
          <div className="settings-section">
            <h3>🔑 API Configuration</h3>
            
            <div className="api-config-notice">
              <div className="notice-content">
                <p className="notice-title">🏢 API settings are now workspace-specific</p>
                <p className="notice-description">
                  API configuration has been moved to individual workspace settings. 
                  Each workspace can now have its own API key and model configuration.
                </p>
                <div className="notice-actions">
                  <p className="notice-instruction">
                    📝 To configure API settings: Go to any workspace → ⚙️ Settings → 🔑 API Configuration
                  </p>
                </div>
              </div>
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

          {/* System Prompts */}
          <div className="settings-section">
            <h3>🤖 System Prompts</h3>
            
            <div className="form-group">
              <label htmlFor="globalSystemPrompt">Global System Prompt</label>
              <textarea
                id="globalSystemPrompt"
                value={tempSettings.globalSystemPrompt || ''}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  globalSystemPrompt: e.target.value
                })}
                className="form-textarea"
                rows={8}
                placeholder="Nhập system prompt chung cho toàn bộ ứng dụng..."
              />
              <small className="form-hint">
                🎯 Prompt cơ bản để định hình cách AI trả lời trong toàn bộ ứng dụng
              </small>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="reset-prompts-btn"
                onClick={() => {
                  // Reset to default global system prompt
                  setTempSettings({
                    ...tempSettings,
                    globalSystemPrompt: `Bạn là một AI assistant thông minh và hữu ích. Hãy trả lời bằng tiếng Việt và LUÔN sử dụng định dạng Markdown để làm đẹp câu trả lời:

🎯 **Quy tắc định dạng:**
- Sử dụng **bold** cho từ khóa quan trọng
- Sử dụng \`inline code\` cho tên function, variable, command
- Sử dụng \`\`\`language cho code blocks với ngôn ngữ cụ thể
- Sử dụng ## cho headers chính, ### cho sub-headers  
- Sử dụng - hoặc 1. cho lists
- Sử dụng > cho blockquotes khi cần nhấn mạnh
- Sử dụng | | cho tables khi trình bày data

Hãy luôn format đẹp để dễ đọc!`
                  });
                }}
              >
                🔄 Reset to Default Prompts
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <button 
              className="modal-btn secondary" 
              onClick={handleCancel}
              type="button"
            >
              ❌ Cancel
            </button>
            <button 
              className="modal-btn primary" 
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
