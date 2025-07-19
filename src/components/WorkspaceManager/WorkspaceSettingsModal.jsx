import React, { useState, useEffect } from 'react';
import { MODELS } from '../../utils/constants';
import '../../styles/settings.css';

export function WorkspaceSettingsModal({ 
  isOpen, 
  workspace, 
  onClose, 
  onUpdateWorkspace,
  onCreateWorkspace, // Add support for create mode
  settings 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: null,
    customCharacterDefinition: '', // For editing persona's characterDefinition
    useGlobalSystemPrompt: true, // New field - default true
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      contextTokens: 4000
    }
  });

  // Load workspace data when modal opens or reset for create mode
  useEffect(() => {
    if (isOpen) {
      if (workspace) {
        // Edit mode: Load existing workspace data
        console.log('🏢 Loading workspace for edit:', workspace);
        setFormData({
          name: workspace.name || '',
          description: workspace.description || '',
          persona: workspace.persona || null,
          customCharacterDefinition: workspace.persona?.characterDefinition || '',
          useGlobalSystemPrompt: workspace.useGlobalSystemPrompt ?? true, // Default to true if not set
          settings: {
            temperature: workspace.settings?.temperature || 0.7,
            maxTokens: workspace.settings?.maxTokens || 1000,
            contextTokens: workspace.settings?.contextTokens || 4000
          }
        });
      } else {
        // Create mode: Reset to defaults
        console.log('🆕 Create mode - resetting to defaults');
        setFormData({
          name: '',
          description: '',
          persona: null, // Start with Default (no persona)
          customCharacterDefinition: settings?.defaultWorkspacePrompt || '', // Use default workspace prompt
          useGlobalSystemPrompt: true, // Default to true for new workspaces
          settings: {
            temperature: 0.7,
            maxTokens: 1000,
            contextTokens: 4000
          }
        });
      }
    }
  }, [isOpen, workspace, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workspace) {
      // Edit mode
      const updatedData = {
        ...formData,
        persona: formData.persona ? {
          ...formData.persona,
          characterDefinition: formData.customCharacterDefinition
        } : null,
        useGlobalSystemPrompt: formData.useGlobalSystemPrompt
      };
      onUpdateWorkspace(workspace.id, updatedData);
    } else {
      // Create mode
      const newWorkspace = {
        id: `workspace_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        persona: formData.persona ? {
          ...formData.persona,
          characterDefinition: formData.customCharacterDefinition
        } : null,
        useGlobalSystemPrompt: formData.useGlobalSystemPrompt,
        settings: formData.settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onCreateWorkspace(newWorkspace);
    }
    onClose();
  };

  const handlePersonaChange = (personaKey) => {
    if (personaKey === '' || personaKey === 'default') {
      setFormData(prev => ({
        ...prev,
        persona: null,
        customCharacterDefinition: settings?.defaultWorkspacePrompt || ''
      }));
      return;
    }

    const selectedPersona = settings?.customPersonas?.[personaKey];
    if (selectedPersona) {
      setFormData(prev => ({
        ...prev,
        persona: selectedPersona,
        customCharacterDefinition: selectedPersona.characterDefinition || '',
        settings: {
          ...prev.settings,
          // Pre-fill with persona defaults but allow override
          temperature: selectedPersona.temperature || prev.settings.temperature,
          maxTokens: selectedPersona.maxTokens || prev.settings.maxTokens
        }
      }));
    }
  };

  // Helper function to get persona key from persona object
  const getPersonaKey = (persona) => {
    if (!persona || !settings?.customPersonas) return '';
    return Object.entries(settings.customPersonas).find(([, p]) => 
      p.name === persona.name && p.description === persona.description
    )?.[0] || '';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content workspace-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{workspace ? '⚙️ Workspace Settings' : '➕ Create New Workspace'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="workspace-settings-form">
          {/* Basic Info Section */}
          <div className="settings-section">
            <h4>📋 Basic Information</h4>
            
            <div className="form-group">
              <label htmlFor="workspaceName">Workspace Name</label>
              <input
                id="workspaceName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="workspaceDescription">Description</label>
              <textarea
                id="workspaceDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* Persona Section */}
          <div className="settings-section">
            <h4>🎭 AI Persona</h4>
            
            <div className="form-group">
              <label htmlFor="workspacePersona">Select Persona</label>
              <select
                id="workspacePersona"
                value={getPersonaKey(formData.persona)}
                onChange={(e) => handlePersonaChange(e.target.value)}
                className="form-select"
              >
                <option value="">🌟 Default (Use default workspace prompt)</option>
                {settings?.customPersonas && Object.entries(settings.customPersonas).map(([key, persona]) => (
                  <option key={key} value={key}>
                    {persona.name}
                  </option>
                ))}
              </select>
              
              {formData.persona && (
                <div className="persona-preview">
                  <p className="persona-description">{formData.persona.description}</p>
                  <div className="persona-info">
                    <small className="persona-settings">
                      🌡️ Temperature: <strong>{formData.persona.temperature}</strong> | 
                      📝 Max Tokens: <strong>{formData.persona.maxTokens}</strong>
                    </small>
                    <small className="persona-prompt-info">
                      💬 Character definition sẽ được load vào editor bên dưới để bạn có thể tùy chỉnh
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="settings-section">
            <h4>🤖 AI Configuration</h4>
            
            <div className="form-group">
              <div className="temperature-slider">
                <div className="slider-container">
                  <label htmlFor="workspaceTemperature" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    🌡️ Temperature:
                  </label>
                  <input
                    id="workspaceTemperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.settings.temperature}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        temperature: parseFloat(e.target.value)
                      }
                    }))}
                    className="slider-input"
                  />
                  <span className="slider-value" data-label="VALUE">
                    {formData.settings.temperature}
                  </span>
                </div>
                <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                  🎯 Điều chỉnh tính sáng tạo (0 = chính xác, 2 = sáng tạo)
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="workspaceMaxTokens">Max Tokens</label>
              <input
                id="workspaceMaxTokens"
                type="number"
                min="100"
                max="4000"
                value={formData.settings.maxTokens}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    maxTokens: parseInt(e.target.value)
                  }
                }))}
                className="form-input"
              />
              <small className="form-hint">
                📝 Độ dài tối đa của phản hồi
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="workspaceContextTokens">Context Tokens</label>
              <input
                id="workspaceContextTokens"
                type="number"
                min="1000"
                max="16000"
                value={formData.settings.contextTokens}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    contextTokens: parseInt(e.target.value)
                  }
                }))}
                className="form-input"
              />
              <small className="form-hint">
                🧠 Số tokens tối đa cho context (bao gồm lịch sử chat)
              </small>
            </div>
          </div>

          {/* Global System Prompt Section */}
          <div className="settings-section">
            <h4>🌐 Global System Prompt</h4>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.useGlobalSystemPrompt}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    useGlobalSystemPrompt: e.target.checked
                  }))}
                />
                <span>🔄 Sử dụng Global System Prompt</span>
              </label>
              <small className="form-hint">
                💡 Bật để áp dụng Global System Prompt từ Settings cùng với Character Definition
              </small>
            </div>

            {formData.useGlobalSystemPrompt && (
              <div className="form-group">
                <label htmlFor="globalSystemPromptPreview">Global System Prompt (Read-only)</label>
                <textarea
                  id="globalSystemPromptPreview"
                  value={settings?.globalSystemPrompt || 'Chưa có Global System Prompt...'}
                  readOnly
                  className="form-textarea readonly-textarea"
                  rows={6}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'not-allowed',
                    opacity: 0.8
                  }}
                />
                <small className="form-hint">
                  ⚙️ Để chỉnh sửa Global System Prompt, vào <strong>Settings &gt; System Prompts</strong>
                </small>
              </div>
            )}
          </div>

          {/* Character Definition Section */}
          <div className="settings-section">
            <h4>💬 Character Definition</h4>
            
            <div className="form-group">
              <label htmlFor="characterDefinition">AI Character & Behavior</label>
              <textarea
                id="characterDefinition"
                value={formData.customCharacterDefinition}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customCharacterDefinition: e.target.value
                }))}
                className="form-textarea prompt-textarea"
                rows={8}
                placeholder={formData.persona 
                  ? `Character definition từ persona "${formData.persona.name}" đã được load. Bạn có thể tùy chỉnh...`
                  : "Định nghĩa tính cách và cách thức hoạt động của AI trong workspace này..."
                }
              />
              <small className="form-hint">
                {formData.persona 
                  ? `🎭 Đã load character definition từ persona "${formData.persona.name}". Bạn có thể chỉnh sửa tùy ý cho workspace này.`
                  : "🎯 Character definition này sẽ định nghĩa tính cách và cách AI phản hồi trong workspace"
                }
              </small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {workspace ? '💾 Save Settings' : '✨ Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
