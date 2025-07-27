import React, { useState, useEffect, useMemo } from 'react';
import { MODELS, PROVIDERS, PROVIDER_INFO } from '../../utils/constants';
import { AIHubService } from '../../services/aiHub';
import '../../styles/provider-settings.css';

export function SettingsModal({ isOpen, onClose, settings, onUpdateSetting }) {
  const [tempSettings, setTempSettings] = useState({...settings});
  const [localModels, setLocalModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [aiHubStatus, setAiHubStatus] = useState('unknown');
  
  // Initialize AI Hub service with useMemo to avoid dependency issues
  const aiHubService = useMemo(() => new AIHubService(), []);
  
  // Update tempSettings when settings change or modal opens
  useEffect(() => {
    if (isOpen && settings) {
      setTempSettings({...settings});
    }
  }, [isOpen, settings]);

  // Check AI Hub status and load models when local provider is selected
  useEffect(() => {
    const checkAiHubAndLoadModels = async () => {
      try {
        setLoadingModels(true);
        setAiHubStatus('checking');
        
        // Check AI Hub health
        await aiHubService.getHealth();
        setAiHubStatus('connected');
        
        // Load available models
        const modelsResponse = await aiHubService.getModels();
        setLocalModels(modelsResponse.data || modelsResponse);
        
      } catch (error) {
        console.error('AI Hub connection failed:', error);
        setAiHubStatus('error');
        setLocalModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    if (isOpen && tempSettings.provider === PROVIDERS.LOCAL) {
      checkAiHubAndLoadModels();
    }
  }, [isOpen, tempSettings.provider, aiHubService]);

  const refreshModels = async () => {
    try {
      setLoadingModels(true);
      setAiHubStatus('checking');
      
      // Check AI Hub health
      await aiHubService.getHealth();
      setAiHubStatus('connected');
      
      // Load available models
      const modelsResponse = await aiHubService.getModels();
      setLocalModels(modelsResponse.data || modelsResponse);
      
    } catch (error) {
      console.error('AI Hub connection failed:', error);
      setAiHubStatus('error');
      setLocalModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleLoadModel = async (modelName) => {
    try {
      await aiHubService.loadModel(modelName);
      // Refresh models to get updated status
      await refreshModels();
    } catch (error) {
      console.error('Failed to load model:', error);
      alert(`Không thể load model ${modelName}: ${error.message}`);
    }
  };

  const handleUnloadModel = async (modelName) => {
    try {
      await aiHubService.unloadModel(modelName);
      // Refresh models to get updated status
      await refreshModels();
    } catch (error) {
      console.error('Failed to unload model:', error);
      alert(`Không thể unload model ${modelName}: ${error.message}`);
    }
  };

  const handleModelSelection = (modelName, isSelected) => {
    const newSelectedModels = isSelected
      ? [...(tempSettings.selectedLocalModels || []), modelName]
      : (tempSettings.selectedLocalModels || []).filter(m => m !== modelName);
    
    setTempSettings({
      ...tempSettings,
      selectedLocalModels: newSelectedModels
    });
  };

  const handleSetActiveModel = async (modelName) => {
    try {
      await aiHubService.switchModel(modelName);
      setTempSettings({
        ...tempSettings,
        localActiveModel: modelName
      });
    } catch (error) {
      console.error('Failed to set active model:', error);
      alert(`Không thể đặt model active ${modelName}: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    // Cập nhật từng setting
    Object.keys(tempSettings).forEach(key => {
      if (JSON.stringify(tempSettings[key]) !== JSON.stringify(settings[key])) {
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
          {/* Provider Selection */}
          <div className="settings-section">
            <h3>🔌 AI Provider</h3>
            
            <div className="provider-selection">
              {Object.entries(PROVIDER_INFO).map(([providerId, info]) => (
                <label key={providerId} className="provider-option">
                  <input
                    type="radio"
                    name="provider"
                    value={providerId}
                    checked={tempSettings.provider === providerId}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      provider: e.target.value
                    })}
                  />
                  <div className="provider-card">
                    <div className="provider-icon">{info.icon}</div>
                    <div className="provider-info">
                      <div className="provider-name">{info.name}</div>
                      <div className="provider-description">{info.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* OpenAI API Configuration */}
          {tempSettings.provider === PROVIDERS.OPENAI && (
            <div className="settings-section">
              <h3>🔑 OpenAI API Configuration</h3>
              
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
                  <span>Use Custom API Key</span>
                </label>
              </div>

              {tempSettings.useCustomApiKey && (
                <div className="form-group">
                  <label htmlFor="apiKey">OpenAI API Key</label>
                  <input
                    id="apiKey"
                    type="password"
                    value={tempSettings.apiKey || ''}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      apiKey: e.target.value
                    })}
                    className="form-input"
                    placeholder="sk-..."
                  />
                  <small className="form-hint">
                    🔒 Your API key is stored locally and never sent to our servers
                  </small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="model">OpenAI Model</label>
                <select
                  id="model"
                  value={tempSettings.model || MODELS.GPT_4O_MINI}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    model: e.target.value
                  })}
                  className="form-select"
                >
                  {Object.entries(MODELS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Local AI Hub Configuration */}
          {tempSettings.provider === PROVIDERS.LOCAL && (
            <div className="settings-section">
              <h3>🏠 Local AI Hub Configuration</h3>
              
              <div className="ai-hub-status">
                <div className={`status-indicator ${aiHubStatus}`}>
                  {aiHubStatus === 'checking' && '🔄 Checking connection...'}
                  {aiHubStatus === 'connected' && '✅ Connected to AI Hub'}
                  {aiHubStatus === 'error' && '❌ Failed to connect to AI Hub'}
                  {aiHubStatus === 'unknown' && '⏳ Not checked yet'}
                </div>
                
                {aiHubStatus === 'error' && (
                  <button 
                    className="retry-btn" 
                    onClick={refreshModels}
                    disabled={loadingModels}
                  >
                    🔄 Retry Connection
                  </button>
                )}
              </div>

              {aiHubStatus === 'connected' && (
                <div className="local-models-section">
                  <h4>🤖 Available Models</h4>
                  
                  {loadingModels ? (
                    <div className="loading-models">🔄 Loading models...</div>
                  ) : (
                    <div className="models-list">
                      {localModels.length === 0 ? (
                        <div className="no-models">No models found</div>
                      ) : (
                        localModels.map((model) => (
                          <div key={model.name} className="model-item">
                            <div className="model-info">
                              <div className="model-name">{model.name}</div>
                              <div className="model-details">
                                <span className={`model-status ${model.status}`}>
                                  {model.status === 'loaded' && '� Loaded'}
                                  {model.status === 'unloaded' && '🔴 Unloaded'}
                                  {model.status === 'loading' && '🟡 Loading...'}
                                </span>
                                {model.provider && (
                                  <span className="model-provider">{model.provider}</span>
                                )}
                                {model.vram_usage && (
                                  <span className="model-vram">VRAM: {model.vram_usage}MB</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="model-actions">
                              <label className="model-checkbox">
                                <input
                                  type="checkbox"
                                  checked={(tempSettings.selectedLocalModels || []).includes(model.name)}
                                  onChange={(e) => handleModelSelection(model.name, e.target.checked)}
                                />
                                <span>Select</span>
                              </label>
                              
                              {model.status === 'loaded' ? (
                                <button 
                                  className="unload-btn"
                                  onClick={() => handleUnloadModel(model.name)}
                                >
                                  🔴 Unload
                                </button>
                              ) : (
                                <button 
                                  className="load-btn"
                                  onClick={() => handleLoadModel(model.name)}
                                >
                                  🟢 Load
                                </button>
                              )}
                              
                              {model.status === 'loaded' && (
                                <button 
                                  className={`active-btn ${tempSettings.localActiveModel === model.name ? 'active' : ''}`}
                                  onClick={() => handleSetActiveModel(model.name)}
                                >
                                  {tempSettings.localActiveModel === model.name ? '⭐ Active' : '⭐ Set Active'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  {(tempSettings.selectedLocalModels || []).length > 0 && (
                    <div className="selected-models-summary">
                      <h5>📋 Selected Models ({(tempSettings.selectedLocalModels || []).length})</h5>
                      <div className="selected-models-list">
                        {(tempSettings.selectedLocalModels || []).map(modelName => (
                          <span key={modelName} className="selected-model-tag">
                            {modelName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* API Configuration Notice - Only show if OpenAI is selected but they have workspace-specific API */}
          {tempSettings.provider === PROVIDERS.OPENAI && (
            <div className="settings-section">
              <div className="api-config-notice">
                <div className="notice-content">
                  <p className="notice-title">🏢 API settings are now workspace-specific</p>
                  <p className="notice-description">
                    Each workspace can override these global OpenAI settings with their own API key and model.
                  </p>
                  <div className="notice-actions">
                    <p className="notice-instruction">
                      📝 To configure workspace-specific API: Go to any workspace → ⚙️ Settings → 🔑 API Configuration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
