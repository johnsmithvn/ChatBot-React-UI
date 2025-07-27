import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MODELS, PROVIDERS, PROVIDER_INFO } from '../../utils/constants';
import { AIHubService } from '../../services/aiHub';
import '../../styles/settings.css';
import '../../styles/provider-settings.css';

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
    provider: PROVIDERS.OPENAI, // Provider selection
    apiSettings: {
      useCustomApiKey: false,
      apiKey: '',
      model: 'gpt-4o-mini'
    },
    localSettings: {
      selectedModels: [],
      activeModel: null
    },
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      contextTokens: 4000,
      topP: 1.0,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
      stop: [],
      logitBias: {}
    }
  });

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
  const [localModels, setLocalModels] = useState([]);
  const [loadingLocalModels, setLoadingLocalModels] = useState(false);
  const [aiHubStatus, setAiHubStatus] = useState('unknown');
  const aiHubService = useMemo(() => new AIHubService(), []);
  
  const [newPersonaData, setNewPersonaData] = useState({
    name: '',
    description: '',
    characterDefinition: '',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    stop: [],
    logitBias: {}
  });

  // Load local models when provider is LOCAL
  useEffect(() => {
    const loadLocalModels = async () => {
      if (isOpen && formData.provider === PROVIDERS.LOCAL) {
        try {
          setLoadingLocalModels(true);
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
          setLoadingLocalModels(false);
        }
      }
    };

    loadLocalModels();
  }, [isOpen, formData.provider, aiHubService]);

  // Handlers for local model management
  const handleLoadModel = async (modelName) => {
    try {
      await aiHubService.loadModel(modelName);
      // Refresh models to get updated status
      const modelsResponse = await aiHubService.getModels();
      setLocalModels(modelsResponse.data || modelsResponse);
    } catch (error) {
      console.error('Failed to load model:', error);
      alert(`Không thể load model ${modelName}: ${error.message}`);
    }
  };

  const handleUnloadModel = async (modelName) => {
    try {
      await aiHubService.unloadModel(modelName);
      // Refresh models to get updated status
      const modelsResponse = await aiHubService.getModels();
      setLocalModels(modelsResponse.data || modelsResponse);
    } catch (error) {
      console.error('Failed to unload model:', error);
      alert(`Không thể unload model ${modelName}: ${error.message}`);
    }
  };

  const handleSetActiveModel = (modelName) => {
    setFormData(prev => ({
      ...prev,
      localSettings: {
        ...prev.localSettings,
        activeModel: modelName
      }
    }));
  };

  const handleModelSelection = (modelName, isSelected) => {
    setFormData(prev => {
      const currentSelected = prev.localSettings.selectedModels || [];
      const newSelected = isSelected 
        ? [...currentSelected, modelName]
        : currentSelected.filter(name => name !== modelName);
      
      return {
        ...prev,
        localSettings: {
          ...prev.localSettings,
          selectedModels: newSelected
        }
      };
    });
  };
  useEffect(() => {
    if (isOpen) {
      if (workspace) {
        // Edit mode: Load existing workspace data
        setFormData({
          name: workspace.name || '',
          description: workspace.description || '',
          persona: workspace.persona || null,
          customCharacterDefinition: workspace.persona?.characterDefinition || '',
          useGlobalSystemPrompt: workspace.useGlobalSystemPrompt ?? true, // Default to true if not set
          provider: workspace.provider || PROVIDERS.OPENAI, // Default to OpenAI
          apiSettings: {
            useCustomApiKey: workspace.apiSettings?.useCustomApiKey || false,
            apiKey: workspace.apiSettings?.apiKey || '',
            model: workspace.apiSettings?.model || 'gpt-4o-mini'
          },
          localSettings: {
            selectedModels: workspace.localSettings?.selectedModels || [],
            activeModel: workspace.localSettings?.activeModel || null
          },
          settings: {
            temperature: workspace.settings?.temperature || 0.7,
            maxTokens: workspace.settings?.maxTokens || 1000,
            contextTokens: workspace.settings?.contextTokens || 4000,
            topP: workspace.settings?.topP || 1.0,
            presencePenalty: workspace.settings?.presencePenalty || 0.0,
            frequencyPenalty: workspace.settings?.frequencyPenalty || 0.0,
            stop: workspace.settings?.stop || [],
            logitBias: workspace.settings?.logitBias || {}
          }
        });
      } else {
        // Create mode: Reset to defaults
        setFormData({
          name: '',
          description: '',
          persona: null, // Start with Default (no persona)
          customCharacterDefinition: settings?.defaultWorkspacePrompt || '', // Use default workspace prompt
          useGlobalSystemPrompt: true, // Default to true for new workspaces
          provider: settings?.provider || PROVIDERS.OPENAI, // Use global provider setting as default
          apiSettings: {
            useCustomApiKey: false,
            apiKey: '',
            model: 'gpt-4o-mini'
          },
          localSettings: {
            selectedModels: [],
            activeModel: null
          },
          settings: {
            temperature: 0.7,
            maxTokens: 1000,
            contextTokens: 4000,
            topP: 1.0,
            presencePenalty: 0.0,
            frequencyPenalty: 0.0,
            stop: [],
            logitBias: {}
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
        useGlobalSystemPrompt: formData.useGlobalSystemPrompt,
        provider: formData.provider,
        apiSettings: formData.apiSettings,
        localSettings: formData.localSettings
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
        provider: formData.provider,
        apiSettings: formData.apiSettings,
        localSettings: formData.localSettings,
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
          // Update all AI parameters from persona
          temperature: selectedPersona.temperature ?? prev.settings.temperature,
          maxTokens: selectedPersona.maxTokens ?? prev.settings.maxTokens,
          topP: selectedPersona.topP ?? prev.settings.topP,
          presencePenalty: selectedPersona.presencePenalty ?? prev.settings.presencePenalty,
          frequencyPenalty: selectedPersona.frequencyPenalty ?? prev.settings.frequencyPenalty,
          stop: selectedPersona.stop ?? prev.settings.stop,
          logitBias: selectedPersona.logitBias ?? prev.settings.logitBias
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

  // Handle Add Persona form submission
  const handleAddPersonaSubmit = (e) => {
    e.preventDefault();
    
    // Generate a unique key for the new persona
    const personaKey = `persona_${Date.now()}`;
    
    // Create the new persona object
    const newPersona = {
      id: personaKey, // Use personaKey as id for the addPersona function
      name: newPersonaData.name,
      description: newPersonaData.description,
      characterDefinition: newPersonaData.characterDefinition,
      temperature: newPersonaData.temperature,
      maxTokens: newPersonaData.maxTokens,
      topP: newPersonaData.topP,
      presencePenalty: newPersonaData.presencePenalty,
      frequencyPenalty: newPersonaData.frequencyPenalty,
      stop: newPersonaData.stop,
      logitBias: newPersonaData.logitBias,
      createdAt: new Date().toISOString()
    };

    // Update settings with new persona
    if (settings && typeof settings.onAddPersona === 'function') {
      settings.onAddPersona(newPersona); // Pass persona object with id, not separate key and persona
    }

    // Reset form and close modal
    setNewPersonaData({
      name: '',
      description: '',
      characterDefinition: '',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
      stop: [],
      logitBias: {}
    });
    setShowAddPersonaModal(false);

    // Automatically select the new persona
    setTimeout(() => {
      handlePersonaChange(personaKey);
    }, 100);
  };

  // Reset Add Persona form when modal closes
  const handleCloseAddPersonaModal = () => {
    setNewPersonaData({
      name: '',
      description: '',
      characterDefinition: '',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
      stop: [],
      logitBias: {}
    });
    setShowAddPersonaModal(false);
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

          {/* Provider Selection Section */}
          <div className="settings-section">
            <h4>🔌 AI Provider</h4>
            <p className="section-description">
              Choose between OpenAI API or Local AI Hub for this workspace
            </p>
            
            <div className="provider-selection">
              {Object.entries(PROVIDER_INFO).map(([providerId, info]) => (
                <label key={providerId} className="provider-option">
                  <input
                    type="radio"
                    name="provider"
                    value={providerId}
                    checked={formData.provider === providerId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      provider: e.target.value
                    }))}
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

          {/* API Configuration Section - Only for OpenAI */}
          {formData.provider === PROVIDERS.OPENAI && (
          <div className="settings-section">
            <h4>🔑 API Configuration</h4>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.apiSettings.useCustomApiKey}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    apiSettings: {
                      ...prev.apiSettings,
                      useCustomApiKey: e.target.checked
                    }
                  }))}
                />
                <span>🔐 Use Custom API Key for this workspace</span>
              </label>
              <small className="form-hint">
                💡 Enable to use a different API key and model for this workspace
              </small>
            </div>

            {formData.apiSettings.useCustomApiKey && (
              <>
                <div className="form-group">
                  <label htmlFor="workspaceApiKey">OpenAI API Key</label>
                  <input
                    id="workspaceApiKey"
                    type="password"
                    value={formData.apiSettings.apiKey}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      apiSettings: {
                        ...prev.apiSettings,
                        apiKey: e.target.value
                      }
                    }))}
                    className="form-input"
                    placeholder="sk-..."
                  />
                  <small className="form-hint">
                    🔒 API key specific to this workspace (kept secure in local storage)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="workspaceModel">AI Model</label>
                  <select
                    id="workspaceModel"
                    value={formData.apiSettings.model}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      apiSettings: {
                        ...prev.apiSettings,
                        model: e.target.value
                      }
                    }))}
                    className="form-select"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                  <small className="form-hint">
                    🤖 AI model to use for this workspace
                  </small>
                </div>
              </>
            )}

            {!formData.apiSettings.useCustomApiKey && (
              <div className="api-info-box">
                <p className="api-info-text">
                  🌐 This workspace will use the global API configuration from Settings
                </p>
                <small className="form-hint">
                  ⚙️ To change global API settings, go to <strong>Settings &gt; API Configuration</strong>
                </small>
              </div>
            )}
          </div>
          )}

          {/* Local AI Hub Configuration - Only for Local provider */}
          {formData.provider === PROVIDERS.LOCAL && (
            <div className="settings-section">
              <h4>🏠 Local AI Hub Configuration</h4>
              <p className="section-description">
                Configure local models for this workspace
              </p>
              
              <div className="ai-hub-status">
                <div className={`status-indicator ${aiHubStatus}`}>
                  {aiHubStatus === 'checking' && '🔄 Checking connection...'}
                  {aiHubStatus === 'connected' && '✅ Connected to AI Hub'}
                  {aiHubStatus === 'error' && '❌ Failed to connect to AI Hub'}
                  {aiHubStatus === 'unknown' && '⏳ Not checked yet'}
                </div>
              </div>

              {aiHubStatus === 'connected' && (
                <div className="local-models-section">
                  <h5>🤖 Available Models</h5>
                  
                  {loadingLocalModels ? (
                    <div className="loading-models">🔄 Loading models...</div>
                  ) : (
                    <div className="models-list">
                      {localModels.length === 0 ? (
                        <div className="no-models">No models found</div>
                      ) : (
                        localModels.map((model) => (
                          <div key={model.id || model.name} className="model-item">
                            <div className="model-info">
                              <div className="model-name">{model.id || model.name}</div>
                              <div className="model-details">
                                <span className={`model-status ${model.status || 'unknown'}`}>
                                  {model.status === 'loaded' && '🟢 Loaded'}
                                  {model.status === 'unloaded' && '🔴 Unloaded'}
                                  {model.status === 'loading' && '� Loading...'}
                                  {!model.status && '⚫ Unknown'}
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
                                  checked={(formData.localSettings.selectedModels || []).includes(model.id || model.name)}
                                  onChange={(e) => handleModelSelection(model.id || model.name, e.target.checked)}
                                />
                                <span>Select</span>
                              </label>
                              
                              {model.status === 'loaded' ? (
                                <button 
                                  type="button"
                                  className="unload-btn"
                                  onClick={() => handleUnloadModel(model.id || model.name)}
                                >
                                  🔴 Unload
                                </button>
                              ) : (
                                <button 
                                  type="button"
                                  className="load-btn"
                                  onClick={() => handleLoadModel(model.id || model.name)}
                                >
                                  🟢 Load
                                </button>
                              )}
                              
                              {model.status === 'loaded' && (
                                <button 
                                  type="button"
                                  className={`active-btn ${formData.localSettings.activeModel === (model.id || model.name) ? 'active' : ''}`}
                                  onClick={() => handleSetActiveModel(model.id || model.name)}
                                >
                                  {formData.localSettings.activeModel === (model.id || model.name) ? '⭐ Active' : '⭐ Set Active'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  {(formData.localSettings.selectedModels || []).length > 0 && (
                    <div className="selected-models-summary">
                      <h6>📋 Selected Models ({(formData.localSettings.selectedModels || []).length})</h6>
                      <div className="selected-models-list">
                        {(formData.localSettings.selectedModels || []).map(modelName => (
                          <span key={modelName} className="selected-model-tag">
                            {modelName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.localSettings.activeModel && (
                    <div className="active-model-info">
                      <p><strong>🎯 Active Model:</strong> {formData.localSettings.activeModel}</p>
                      <small>This model will be used for chat completions in this workspace</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Persona & Configuration Section - Merged */}
          <div className="settings-section">
            <h4>
              🎭 AI Persona & Configuration 
              <button 
                type="button"
                className="help-icon-btn"
                onClick={() => setShowHelpModal(true)}
                title="View parameter explanations and examples"
              >
                ❓
              </button>
            </h4>
            
            {/* Persona Selection */}
            <div className="form-group">
              <div className="persona-header">
                <label htmlFor="workspacePersona">Select Persona</label>
                <button 
                  type="button"
                  className="btn-add-persona"
                  onClick={() => setShowAddPersonaModal(true)}
                  title="Add new persona"
                >
                  ➕ Add Persona
                </button>
              </div>
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

            {/* AI Configuration Parameters */}
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

            <div className="form-group">
              <div className="slider-container">
                <label htmlFor="workspaceTopP" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  🎯 Top P:
                </label>
                <input
                  id="workspaceTopP"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={formData.settings.topP}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      topP: parseFloat(e.target.value)
                    }
                  }))}
                  className="slider-input"
                />
                <span className="slider-value" data-label="VALUE">
                  {formData.settings.topP}
                </span>
              </div>
              <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                🎲 Điều khiển tính đa dạng (1.0 = đa dạng, 0.1 = ít lựa chọn)
              </small>
            </div>

            <div className="form-group">
              <div className="slider-container">
                <label htmlFor="workspacePresencePenalty" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  🚫 Presence Penalty:
                </label>
                <input
                  id="workspacePresencePenalty"
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={formData.settings.presencePenalty}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      presencePenalty: parseFloat(e.target.value)
                    }
                  }))}
                  className="slider-input"
                />
                <span className="slider-value" data-label="VALUE">
                  {formData.settings.presencePenalty}
                </span>
              </div>
              <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                🔄 Phạt khi lặp lại chủ đề (tăng để AI nói đa dạng hơn)
              </small>
            </div>

            <div className="form-group">
              <div className="slider-container">
                <label htmlFor="workspaceFrequencyPenalty" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  📊 Frequency Penalty:
                </label>
                <input
                  id="workspaceFrequencyPenalty"
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={formData.settings.frequencyPenalty}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      frequencyPenalty: parseFloat(e.target.value)
                    }
                  }))}
                  className="slider-input"
                />
                <span className="slider-value" data-label="VALUE">
                  {formData.settings.frequencyPenalty}
                </span>
              </div>
              <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                🔁 Phạt khi lặp lại từ/ngữ (hữu ích khi AI spam từ)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="workspaceStop">Stop Sequences</label>
              <input
                id="workspaceStop"
                type="text"
                value={formData.settings.stop.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    stop: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }
                }))}
                className="form-input"
                placeholder="Enter stop sequences separated by commas"
              />
              <small className="form-hint">
                ⛔ Cắt output nếu gặp các chuỗi cụ thể (ngăn AI "nói quá lố")
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="workspaceLogitBias">Logit Bias (JSON)</label>
              <textarea
                id="workspaceLogitBias"
                value={JSON.stringify(formData.settings.logitBias, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || '{}');
                    setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        logitBias: parsed
                      }
                    }));
                  } catch {
                    // Invalid JSON, don't update state but keep the input value
                  }
                }}
                className="form-textarea"
                rows={3}
                placeholder='{"50256": -100, "11": 5}'
              />
              <small className="form-hint">
                🎛️ Điều chỉnh xác suất token cụ thể (JSON: {`{"token_id": bias_value}`})
              </small>
            </div>
          </div>

          {/* Character Definition Section */}
          <div className="settings-section">
            <h4>� Character Definition</h4>
            
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
                  : "� Character definition này sẽ định nghĩa tính cách và cách AI phản hồi trong workspace"
                }
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

      {/* Add Persona Modal - Rendered outside using portal */}
      {showAddPersonaModal && createPortal(
        <div className="help-modal-overlay" onClick={handleCloseAddPersonaModal}>
          <div className="modal-content workspace-settings-modal add-persona-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Persona</h3>
              <button className="modal-close" onClick={handleCloseAddPersonaModal}>×</button>
            </div>
            
            <form onSubmit={handleAddPersonaSubmit} className="workspace-settings-form">
              <div className="settings-section">
                <h4>📋 Basic Information</h4>
                
                <div className="form-group">
                  <label htmlFor="newPersonaName">Persona Name</label>
                  <input
                    id="newPersonaName"
                    type="text"
                    value={newPersonaData.name}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="form-input"
                    placeholder="e.g., Marketing Expert, Code Reviewer..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPersonaDescription">Description</label>
                  <textarea
                    id="newPersonaDescription"
                    value={newPersonaData.description}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="form-textarea"
                    rows={3}
                    placeholder="Brief description of this persona's purpose and expertise..."
                    required
                  />
                </div>
              </div>

              <div className="settings-section">
                <h4>💬 Character Definition</h4>
                
                <div className="form-group">
                  <label htmlFor="newPersonaCharacterDefinition">AI Character & Behavior</label>
                  <textarea
                    id="newPersonaCharacterDefinition"
                    value={newPersonaData.characterDefinition}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      characterDefinition: e.target.value
                    }))}
                    className="form-textarea prompt-textarea"
                    rows={6}
                    placeholder="Define the AI's personality, expertise, communication style, and behavior..."
                    required
                  />
                  <small className="form-hint">
                    💡 This will define how the AI behaves and responds when using this persona
                  </small>
                </div>
              </div>

              <div className="settings-section">
                <h4>
                  🤖 AI Configuration 
                  <button 
                    type="button"
                    className="help-icon-btn"
                    onClick={() => setShowHelpModal(true)}
                    title="View parameter explanations and examples"
                  >
                    ❓
                  </button>
                </h4>

              {/* Reuse exact same AI Configuration UI from workspace settings */}
              <div className="form-group">
                <div className="temperature-slider">
                  <div className="slider-container">
                    <label htmlFor="newPersonaTemperature" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      🌡️ Temperature:
                    </label>
                    <input
                      id="newPersonaTemperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={newPersonaData.temperature || 0.7}
                      onChange={(e) => setNewPersonaData(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value)
                      }))}
                      className="slider-input"
                    />
                    <span className="slider-value" data-label="VALUE">
                      {newPersonaData.temperature || 0.7}
                    </span>
                  </div>
                  <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                    🎯 Điều chỉnh tính sáng tạo (0 = chính xác, 2 = sáng tạo)
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPersonaMaxTokens">Max Tokens</label>
                <input
                  id="newPersonaMaxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={newPersonaData.maxTokens || 1000}
                  onChange={(e) => setNewPersonaData(prev => ({
                    ...prev,
                    maxTokens: parseInt(e.target.value)
                  }))}
                  className="form-input"
                />
                <small className="form-hint">
                  📝 Độ dài tối đa của phản hồi
                </small>
              </div>

              <div className="form-group">
                <div className="slider-container">
                  <label htmlFor="newPersonaTopP" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    🎯 Top P:
                  </label>
                  <input
                    id="newPersonaTopP"
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={newPersonaData.topP || 1.0}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      topP: parseFloat(e.target.value)
                    }))}
                    className="slider-input"
                  />
                  <span className="slider-value" data-label="VALUE">
                    {newPersonaData.topP || 1.0}
                  </span>
                </div>
                <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                  🎲 Điều khiển tính đa dạng (1.0 = đa dạng, 0.1 = ít lựa chọn)
                </small>
              </div>

              <div className="form-group">
                <div className="slider-container">
                  <label htmlFor="newPersonaPresencePenalty" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    🚫 Presence Penalty:
                  </label>
                  <input
                    id="newPersonaPresencePenalty"
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.1"
                    value={newPersonaData.presencePenalty || 0.0}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      presencePenalty: parseFloat(e.target.value)
                    }))}
                    className="slider-input"
                  />
                  <span className="slider-value" data-label="VALUE">
                    {newPersonaData.presencePenalty || 0.0}
                  </span>
                </div>
                <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                  🔄 Phạt khi lặp lại chủ đề (tăng để AI nói đa dạng hơn)
                </small>
              </div>

              <div className="form-group">
                <div className="slider-container">
                  <label htmlFor="newPersonaFrequencyPenalty" style={{ minWidth: '120px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    📊 Frequency Penalty:
                  </label>
                  <input
                    id="newPersonaFrequencyPenalty"
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.1"
                    value={newPersonaData.frequencyPenalty || 0.0}
                    onChange={(e) => setNewPersonaData(prev => ({
                      ...prev,
                      frequencyPenalty: parseFloat(e.target.value)
                    }))}
                    className="slider-input"
                  />
                  <span className="slider-value" data-label="VALUE">
                    {newPersonaData.frequencyPenalty || 0.0}
                  </span>
                </div>
                <small className="form-hint" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                  🔁 Phạt khi lặp lại từ/ngữ (hữu ích khi AI spam từ)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="newPersonaStop">Stop Sequences</label>
                <input
                  id="newPersonaStop"
                  type="text"
                  value={(newPersonaData.stop || []).join(', ')}
                  onChange={(e) => setNewPersonaData(prev => ({
                    ...prev,
                    stop: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  className="form-input"
                  placeholder="Enter stop sequences separated by commas"
                />
                <small className="form-hint">
                  ⛔ Cắt output nếu gặp các chuỗi cụ thể (ngăn AI "nói quá lố")
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="newPersonaLogitBias">Logit Bias (JSON)</label>
                <textarea
                  id="newPersonaLogitBias"
                  value={JSON.stringify(newPersonaData.logitBias || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value || '{}');
                      setNewPersonaData(prev => ({
                        ...prev,
                        logitBias: parsed
                      }));
                    } catch {
                      // Invalid JSON, don't update state but keep the input value
                    }
                  }}
                  className="form-textarea"
                  rows={3}
                  placeholder='{"50256": -100, "11": 5}'
                />
                <small className="form-hint">
                  🎛️ Điều chỉnh xác suất token cụ thể (JSON: {`{"token_id": bias_value}`})
                </small>
              </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseAddPersonaModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ✨ Create Persona
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Help Modal - Rendered outside using portal */}
      {showHelpModal && createPortal(
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📖 AI Configuration Guide</h3>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}>×</button>
            </div>
            
            <div className="help-content">
              <div className="help-section">
                <h4>🌡️ Temperature (0.0 - 2.0)</h4>
                <p><strong>Mục đích:</strong> Điều khiển tính sáng tạo và ngẫu nhiên của AI</p>
                <ul>
                  <li><strong>0.0:</strong> Hoàn toàn nhất quán, luôn chọn câu trả lời có xác suất cao nhất</li>
                  <li><strong>0.7:</strong> Cân bằng tốt giữa sáng tạo và nhất quán (recommended)</li>
                  <li><strong>1.5+:</strong> Rất sáng tạo, có thể tạo ra câu trả lời bất ngờ</li>
                </ul>
                <p><strong>Ví dụ:</strong> Dùng 0.1 cho FAQ, 1.2 cho viết creative</p>
              </div>

              <div className="help-section">
                <h4>🎯 Top P (0.1 - 1.0)</h4>
                <p><strong>Mục đích:</strong> Giới hạn từ vựng AI có thể chọn</p>
                <ul>
                  <li><strong>0.1:</strong> Chỉ chọn từ 10% từ vựng có xác suất cao nhất</li>
                  <li><strong>0.9:</strong> Chọn từ 90% từ vựng phù hợp nhất</li>
                  <li><strong>1.0:</strong> Xem xét toàn bộ từ vựng</li>
                </ul>
                <p><strong>Ví dụ:</strong> 0.2 cho technical docs, 0.8 cho conversation</p>
              </div>

              <div className="help-section">
                <h4>🚫 Presence Penalty (0.0 - 2.0)</h4>
                <p><strong>Mục đích:</strong> Phạt AI khi lặp lại chủ đề đã nói</p>
                <ul>
                  <li><strong>0.0:</strong> Không phạt, AI có thể lặp lại chủ đề</li>
                  <li><strong>0.6:</strong> Khuyến khích AI đổi chủ đề nhẹ</li>
                  <li><strong>1.5+:</strong> Mạnh mẽ tránh lặp lại chủ đề</li>
                </ul>
                <p><strong>Ví dụ:</strong> 0.8 cho brainstorming, 0.2 cho support chat</p>
              </div>

              <div className="help-section">
                <h4>📊 Frequency Penalty (0.0 - 2.0)</h4>
                <p><strong>Mục đích:</strong> Phạt AI khi lặp lại từ/cụm từ</p>
                <ul>
                  <li><strong>0.0:</strong> Cho phép lặp từ tự nhiên</li>
                  <li><strong>0.3:</strong> Giảm nhẹ việc lặp từ</li>
                  <li><strong>1.0+:</strong> Mạnh mẽ tránh spam từ</li>
                </ul>
                <p><strong>Ví dụ:</strong> 0.5 khi AI hay nói "hihi", "ơ kìa"</p>
              </div>

              <div className="help-section">
                <h4>⛔ Stop Sequences</h4>
                <p><strong>Mục đích:</strong> Tự động dừng khi gặp chuỗi ký tự cụ thể</p>
                <p><strong>Cách nhập:</strong> Các chuỗi ngăn cách bởi dấu phẩy</p>
                <p><strong>Ví dụ:</strong></p>
                <ul>
                  <li><code>Human:, AI:</code> - Dừng khi gặp label hội thoại</li>
                  <li><code>\n\n###</code> - Dừng khi gặp separator</li>
                  <li><code>[END]</code> - Dừng khi AI tự kết thúc</li>
                </ul>
              </div>

              <div className="help-section">
                <h4>🎛️ Logit Bias</h4>
                <p><strong>Mục đích:</strong> Tăng/giảm xác suất của token cụ thể</p>
                <p><strong>Cách nhập:</strong> JSON object với token_id làm key</p>
                <p><strong>Giá trị:</strong> -100 (chặn hoàn toàn) đến +100 (ưu tiên cao)</p>
                <p><strong>Ví dụ:</strong></p>
                <pre><code>{`{
  "50256": -100,
  "11": 5,
  "784": -50
}`}</code></pre>
                <p><strong>Lưu ý:</strong> Cần biết token ID của từ muốn bias</p>
              </div>

              <div className="help-section">
                <h4>💡 Mẹo sử dụng</h4>
                <ul>
                  <li><strong>Chatbot customer service:</strong> temp=0.3, top_p=0.7, freq_penalty=0.3</li>
                  <li><strong>Creative writing:</strong> temp=1.1, top_p=0.9, presence_penalty=0.6</li>
                  <li><strong>Technical Q&A:</strong> temp=0.2, top_p=0.5, freq_penalty=0.1</li>
                  <li><strong>Brainstorming:</strong> temp=1.2, presence_penalty=1.0</li>
                </ul>
              </div>
            </div>

            <div className="help-actions">
              <button type="button" onClick={() => setShowHelpModal(false)} className="btn-primary">
                ✅ Got it!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
