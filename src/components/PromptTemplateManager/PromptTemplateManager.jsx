import React, { useState, useCallback } from 'react';
import { PROMPT_TEMPLATES } from '../../utils/constants';

/**
 * Component quản lý prompt templates
 */
export function PromptTemplateManager({ 
  templates,
  onSelectTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate
}) {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});

  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    // Extract variables từ template
    const templateVariables = extractVariables(template.template);
    setVariables(templateVariables.reduce((acc, variable) => {
      acc[variable] = '';
      return acc;
    }, {}));
  }, []);

  const handleUseTemplate = useCallback(() => {
    if (!selectedTemplate) return;
    
    let processedTemplate = selectedTemplate.template;
    
    // Replace variables với values
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, variables[variable] || '');
    });
    
    onSelectTemplate?.(processedTemplate);
    setSelectedTemplate(null);
    setVariables({});
  }, [selectedTemplate, variables, onSelectTemplate]);

  const allTemplates = [...Object.values(PROMPT_TEMPLATES), ...(templates || [])];

  return (
    <div className="prompt-template-manager">
      <div className="template-header">
        <h3>📋 Prompt Templates</h3>
        <button
          className="template-create-btn"
          onClick={() => setShowCreateTemplate(true)}
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
            onEdit={() => setEditingTemplate(template)}
            onDelete={() => onDeleteTemplate?.(template.id)}
            isCustom={!Object.values(PROMPT_TEMPLATES).includes(template)}
          />
        ))}
      </div>

      {/* Template Usage Modal */}
      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>🎯 Use Template: {selectedTemplate.name}</h3>
              <button className="modal-close" onClick={() => setSelectedTemplate(null)}>
                ✕
              </button>
            </div>
            
            <div className="template-usage">
              <div className="template-preview">
                <h4>Template Preview</h4>
                <div className="template-content">
                  <pre>{selectedTemplate.template}</pre>
                </div>
              </div>
              
              <div className="template-variables">
                <h4>Variables</h4>
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
              
              <div className="template-result">
                <h4>Result</h4>
                <div className="result-content">
                  <pre>{generatePreview(selectedTemplate.template, variables)}</pre>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedTemplate(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUseTemplate}
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <TemplateForm
          onSubmit={(templateData) => {
            onCreateTemplate?.(templateData);
            setShowCreateTemplate(false);
          }}
          onCancel={() => setShowCreateTemplate(false)}
        />
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <TemplateForm
          template={editingTemplate}
          onSubmit={(templateData) => {
            onUpdateTemplate?.(editingTemplate.id, templateData);
            setEditingTemplate(null);
          }}
          onCancel={() => setEditingTemplate(null)}
        />
      )}
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
 * Form tạo/chỉnh sửa template
 */
function TemplateForm({ template, onSubmit, onCancel }) {
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
          <h3>{template ? 'Edit Template' : 'Create New Template'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
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
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {template ? 'Update' : 'Create'} Template
            </button>
          </div>
        </form>
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
