import React, { useState, useCallback } from 'react';
import { PROMPT_TEMPLATES } from '../../utils/constants';

/**
 * Component quản lý prompt templates
 */
export function PromptTemplateManager({ 
  templates,
  onSelectTemplate,
  onDeleteTemplate,
  onClose,
  onCreateClick,
  onEditClick
}) {

  const handleSelectTemplate = useCallback((template) => {
    // Đóng template manager và mở use template modal
    onClose?.();
    onSelectTemplate?.(template);
  }, [onClose, onSelectTemplate]);

  const allTemplates = [...Object.values(PROMPT_TEMPLATES), ...(templates || [])];

  return (
    <div className="prompt-template-manager">
      <div className="template-header">
        <h3>📋 Prompt Templates</h3>
        <button 
          className="template-create-btn"
          onClick={() => {
            onClose?.();
            onCreateClick?.();
          }}
        >
          ➕ New Template
        </button>
      </div>

      <div className="template-grid">
        {allTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
            onEdit={() => {
              onClose?.();
              onEditClick?.(template);
            }}
            onDelete={() => onDeleteTemplate?.(template.id)}
            isCustom={!Object.values(PROMPT_TEMPLATES).includes(template)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Component hiển thị template card
 */
function TemplateCard({ template, onSelect, onEdit, onDelete, isCustom }) {
  return (
    <div className="template-card">
      <div className="template-card-header">
        <h4 className="template-name">{template.name}</h4>
        <div className="template-actions">
          {isCustom && (
            <>
              <button
                className="template-action-btn"
                onClick={() => onEdit?.(template)}
                title="Edit template"
              >
                ✏️
              </button>
              <button
                className="template-action-btn danger"
                onClick={() => onDelete?.(template.id)}
                title="Delete template"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      
      <p className="template-description">{template.description}</p>
      
      <div className="template-variables">
        <div className="variables-count">
          {extractVariables(template.template).length} variables
        </div>
        <div className="variables-list">
          {extractVariables(template.template).slice(0, 3).map(variable => (
            <span key={variable} className="variable-tag">
              {variable}
            </span>
          ))}
        </div>
      </div>
      
      <button
        className="template-use-btn"
        onClick={() => onSelect?.(template)}
      >
        Use Template
      </button>
    </div>
  );
}

/**
 * Form tạo/chỉnh sửa template - Component độc lập
 */
export function TemplateForm({ template, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template: template?.template || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const templateData = {
      id: template?.id || `template_${Date.now()}`,
      ...formData,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSubmit(templateData);
  };

  const variables = extractVariables(formData.template);

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{template ? '✏️ Edit Template' : '➕ Create New Template'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="template-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter template name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter template description"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Template</label>
              <textarea
                value={formData.template}
                onChange={(e) => setFormData({...formData, template: e.target.value})}
                placeholder="Enter template content. Use {{variable}} for variables."
                rows="10"
                required
              />
              <div className="template-help">
                <p>💡 Use <code>{'{{variable}}'}</code> syntax for variables</p>
                {variables.length > 0 && (
                  <div className="detected-variables">
                    <span>Detected variables: </span>
                    {variables.map(variable => (
                      <span key={variable} className="variable-tag">
                        {variable}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="btn btn-primary">
            {template ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function để extract variables từ template
 */
function extractVariables(template) {
  if (!template) return [];
  
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * Helper function để generate preview
 */
function generatePreview(template, variables) {
  if (!template) return '';
  
  let preview = template;
  Object.keys(variables).forEach(variable => {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    preview = preview.replace(regex, variables[variable] || `[${variable}]`);
  });
  
  return preview;
}

/**
 * Component Use Template Modal độc lập
 */
export function UseTemplateModal({ 
  template, 
  onUse, 
  onCancel 
}) {
  const [variables, setVariables] = useState({});

  React.useEffect(() => {
    if (template) {
      const templateVariables = extractVariables(template.template);
      setVariables(templateVariables.reduce((acc, variable) => {
        acc[variable] = '';
        return acc;
      }, {}));
    }
  }, [template]);

  const handleUseTemplate = useCallback(() => {
    if (!template) return;
    
    let processedTemplate = template.template;
    
    // Replace variables với values
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, variables[variable] || '');
    });
    
    onUse?.(processedTemplate);
  }, [template, variables, onUse]);

  if (!template) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>🎯 Use Template: {template.name}</h3>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="template-usage">
            <div className="template-preview">
              <h4>Template Preview</h4>
              <div className="template-content">
                <pre>{template.template}</pre>
              </div>
            </div>
            
            {Object.keys(variables).length > 0 && (
              <div className="template-variables">
                <h4>🔧 Variables</h4>
                {Object.keys(variables).map(variable => (
                  <div key={variable} className="variable-input">
                    <label>{variable}</label>
                    <input
                      type="text"
                      value={variables[variable]}
                      onChange={(e) => setVariables({
                        ...variables,
                        [variable]: e.target.value
                      })}
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="template-result">
              <h4>📝 Result</h4>
              <div className="result-content">
                <pre>{generatePreview(template.template, variables)}</pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUseTemplate}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
