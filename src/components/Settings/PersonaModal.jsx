import React, { useState, useEffect } from 'react';

/**
 * PersonaModal - Modal để tạo mới hoặc chỉnh sửa persona
 */
export function PersonaModal({ 
  isOpen, 
  onClose, 
  persona = null, // null = create new, object = edit existing
  onSave 
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or persona changes
  useEffect(() => {
    if (isOpen) {
      if (persona) {
        // Edit mode
        setFormData({
          id: persona.id,
          name: persona.name,
          description: persona.description,
          systemPrompt: persona.systemPrompt,
          temperature: persona.temperature || 0.7,
          maxTokens: persona.maxTokens || 1000
        });
      } else {
        // Create mode
        setFormData({
          id: '',
          name: '',
          description: '',
          systemPrompt: '',
          temperature: 0.7,
          maxTokens: 1000
        });
      }
      setErrors({});
    }
  }, [isOpen, persona]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }

    if (!persona && !formData.id.trim()) {
      // Auto-generate ID from name for new personas
      const autoId = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, id: autoId }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const personaData = {
        ...formData,
        id: formData.id || formData.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')
      };

      await onSave(personaData);
      onClose();
    } catch (error) {
      console.error('Failed to save persona:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 1000
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleCancel();
    }}>
      <div className="modal-content persona-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎭 {persona ? 'Edit Persona' : 'Create New Persona'}</h2>
          <button className="modal-close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Name */}
            <div className="form-group">
              <label htmlFor="persona-name">
                Persona Name <span className="required">*</span>
              </label>
              <input
                id="persona-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., 🤖 AI Assistant, 💻 Code Expert"
                className={`form-input ${errors.name ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* ID (for edit mode or manual override) */}
            <div className="form-group">
              <label htmlFor="persona-id">
                Persona ID {!persona && <span className="optional">(auto-generated)</span>}
              </label>
              <input
                id="persona-id"
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                placeholder="e.g., ai_assistant, code_expert"
                className="form-input"
                disabled={isLoading || !!persona} // Disable editing ID for existing personas
              />
              <small className="form-hint">
                💡 Unique identifier for this persona (lowercase, underscores only)
              </small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="persona-description">
                Description <span className="required">*</span>
              </label>
              <input
                id="persona-description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this persona"
                className={`form-input ${errors.description ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* System Prompt */}
            <div className="form-group">
              <label htmlFor="persona-prompt">
                System Prompt <span className="required">*</span>
              </label>
              <textarea
                id="persona-prompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                placeholder="Define the AI's behavior, personality, and capabilities..."
                className={`form-textarea ${errors.systemPrompt ? 'error' : ''}`}
                rows={6}
                disabled={isLoading}
              />
              {errors.systemPrompt && <span className="form-error">{errors.systemPrompt}</span>}
              <small className="form-hint">
                🎯 This prompt defines how the AI will behave when using this persona
              </small>
            </div>

            {/* Advanced Settings */}
            <div className="form-group">
              <label>Advanced Settings</label>
              <div className="advanced-settings">
                <div className="setting-row">
                  <label htmlFor="persona-temperature">Temperature</label>
                  <input
                    id="persona-temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                    className="form-input small"
                    disabled={isLoading}
                  />
                  <small>0 = deterministic, 2 = creative</small>
                </div>
                <div className="setting-row">
                  <label htmlFor="persona-tokens">Max Tokens</label>
                  <input
                    id="persona-tokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({...formData, maxTokens: parseInt(e.target.value)})}
                    className="form-input small"
                    disabled={isLoading}
                  />
                  <small>Maximum response length</small>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button 
            type="button"
            className="modal-btn secondary" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            ❌ Cancel
          </button>
          <button 
            type="button"
            className="modal-btn primary" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>⏳ Saving...</>
            ) : (
              <>💾 {persona ? 'Update' : 'Create'} Persona</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
