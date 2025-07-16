import React, { useState, useCallback } from 'react';
import { WORKSPACE_CONFIG, DEFAULT_PERSONAS } from '../../utils/constants';

/**
 * Component quản lý workspace và groups
 */
export function WorkspaceManager({ 
  workspaces, 
  currentWorkspace, 
  onCreateWorkspace,
  onSelectWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace, // eslint-disable-line no-unused-vars
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveChatsToGroup
}) {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleCreateWorkspace = useCallback((workspaceData) => {
    const newWorkspace = {
      id: Date.now().toString(),
      name: workspaceData.name || WORKSPACE_CONFIG.DEFAULT_WORKSPACE_NAME,
      description: workspaceData.description || '',
      persona: workspaceData.persona || DEFAULT_PERSONAS.assistant,
      groups: [{
        id: `group_${Date.now()}`,
        name: WORKSPACE_CONFIG.DEFAULT_GROUP_NAME,
        description: '',
        chatIds: [],
        promptTemplate: null,
        persona: workspaceData.persona || DEFAULT_PERSONAS.assistant
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onCreateWorkspace?.(newWorkspace);
    setShowCreateWorkspace(false);
  }, [onCreateWorkspace]);

  const handleCreateGroup = useCallback((groupData) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupData.name || WORKSPACE_CONFIG.DEFAULT_GROUP_NAME,
      description: groupData.description || '',
      chatIds: [],
      promptTemplate: groupData.promptTemplate || null,
      persona: groupData.persona || currentWorkspace?.persona || DEFAULT_PERSONAS.assistant,
      defaultPrompt: groupData.defaultPrompt || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onCreateGroup?.(currentWorkspace.id, newGroup);
    setShowCreateGroup(false);
  }, [currentWorkspace, onCreateGroup]);

  return (
    <div className="workspace-manager">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-selector">
          <select
            value={currentWorkspace?.id || ''}
            onChange={(e) => onSelectWorkspace?.(e.target.value)}
            className="workspace-select"
          >
            {workspaces.map(workspace => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <button
            className="workspace-create-btn"
            onClick={() => setShowCreateWorkspace(true)}
            title="Create new workspace"
          >
            ➕
          </button>
        </div>
        
        {currentWorkspace && (
          <div className="workspace-info">
            <h3 className="workspace-name">{currentWorkspace.name}</h3>
            <p className="workspace-description">{currentWorkspace.description}</p>
            <div className="workspace-persona">
              <span className="persona-label">Persona:</span>
              <span className="persona-name">{currentWorkspace.persona?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Groups */}
      {currentWorkspace && (
        <div className="groups-container">
          <div className="groups-header">
            <h4>Groups</h4>
            <button
              className="group-create-btn"
              onClick={() => setShowCreateGroup(true)}
              title="Create new group"
            >
              ➕ New Group
            </button>
          </div>
          
          <div className="groups-list">
            {currentWorkspace.groups?.map(group => (
              <GroupItem
                key={group.id}
                group={group}
                onEdit={(group) => setEditingGroup(group)}
                onDelete={(groupId) => onDeleteGroup?.(currentWorkspace.id, groupId)}
                onDrop={(chatIds) => onMoveChatsToGroup?.(currentWorkspace.id, group.id, chatIds)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <WorkspaceForm
          onSubmit={handleCreateWorkspace}
          onCancel={() => setShowCreateWorkspace(false)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateGroup(false)}
        />
      )}

      {/* Edit Workspace Modal */}
      {editingWorkspace && (
        <WorkspaceForm
          workspace={editingWorkspace}
          onSubmit={(data) => {
            onUpdateWorkspace?.(editingWorkspace.id, data);
            setEditingWorkspace(null);
          }}
          onCancel={() => setEditingWorkspace(null)}
        />
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <GroupForm
          group={editingGroup}
          onSubmit={(data) => {
            onUpdateGroup?.(currentWorkspace.id, editingGroup.id, data);
            setEditingGroup(null);
          }}
          onCancel={() => setEditingGroup(null)}
        />
      )}
    </div>
  );
}

/**
 * Component hiển thị group item
 */
function GroupItem({ group, onEdit, onDelete, onDrop }) {
  const [dragOver, setDragOver] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const chatIds = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop?.(chatIds);
  };

  return (
    <div
      className={`group-item ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="group-header">
        <div className="group-info">
          <h5 className="group-name">{group.name}</h5>
          <p className="group-description">{group.description}</p>
          <div className="group-stats">
            <span className="chat-count">{group.chatIds?.length || 0} chats</span>
            {group.promptTemplate && (
              <span className="template-indicator">📋 Template</span>
            )}
            {group.defaultPrompt && (
              <span className="prompt-indicator">🎯 Default Prompt</span>
            )}
          </div>
        </div>
        
        <div className="group-actions">
          <button
            className="group-action-btn"
            onClick={() => setShowPromptEditor(true)}
            title="Edit default prompt"
          >
            🎯
          </button>
          <button
            className="group-action-btn"
            onClick={() => onEdit?.(group)}
            title="Edit group"
          >
            ✏️
          </button>
          <button
            className="group-action-btn danger"
            onClick={() => onDelete?.(group.id)}
            title="Delete group"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Default Prompt Section */}
      <div className="group-prompt-section">
        <div className="prompt-header">
          <span className="prompt-label">Default Prompt:</span>
          <button
            className="prompt-toggle-btn"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
          >
            {showPromptEditor ? '🔼' : '🔽'}
          </button>
        </div>
        
        {group.defaultPrompt && (
          <div className="prompt-preview">
            <div className="prompt-text">
              {group.defaultPrompt.length > 100 
                ? `${group.defaultPrompt.substring(0, 100)}...`
                : group.defaultPrompt
              }
            </div>
            <div className="prompt-status">
              <span className="status-indicator active">🟢 Active</span>
              <span className="priority-indicator">🔝 High Priority</span>
            </div>
          </div>
        )}
        
        {!group.defaultPrompt && (
          <div className="prompt-empty">
            <span className="empty-text">No default prompt set</span>
            <button
              className="add-prompt-btn"
              onClick={() => setShowPromptEditor(true)}
            >
              ➕ Add Prompt
            </button>
          </div>
        )}
      </div>
      
      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <GroupPromptEditor
          group={group}
          onSave={(prompt) => {
            onEdit?.({...group, defaultPrompt: prompt});
            setShowPromptEditor(false);
          }}
          onCancel={() => setShowPromptEditor(false)}
        />
      )}
      
      {group.persona && (
        <div className="group-persona">
          <span className="persona-icon">{group.persona.icon}</span>
          <span className="persona-name">{group.persona.name}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Form tạo/chỉnh sửa workspace
 */
function WorkspaceForm({ workspace, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    persona: workspace?.persona || DEFAULT_PERSONAS.assistant
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{workspace ? 'Edit Workspace' : 'Create New Workspace'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="workspace-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter workspace name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter workspace description"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Default Persona</label>
            <select
              value={formData.persona?.id || ''}
              onChange={(e) => {
                const persona = Object.values(DEFAULT_PERSONAS).find(p => p.id === e.target.value);
                setFormData({...formData, persona});
              }}
            >
              {Object.values(DEFAULT_PERSONAS).map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {workspace ? 'Update' : 'Create'} Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Form tạo/chỉnh sửa group
 */
function GroupForm({ group, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    promptTemplate: group?.promptTemplate || null,
    persona: group?.persona || DEFAULT_PERSONAS.assistant,
    defaultPrompt: group?.defaultPrompt || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{group ? 'Edit Group' : 'Create New Group'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter group description"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Persona</label>
            <select
              value={formData.persona?.id || ''}
              onChange={(e) => {
                const persona = Object.values(DEFAULT_PERSONAS).find(p => p.id === e.target.value);
                setFormData({...formData, persona});
              }}
            >
              {Object.values(DEFAULT_PERSONAS).map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Default Prompt (Optional)</label>
            <div className="prompt-field-info">
              <span className="field-info">🔝 This prompt will be used for all chats in this group</span>
            </div>
            <textarea
              value={formData.defaultPrompt}
              onChange={(e) => setFormData({...formData, defaultPrompt: e.target.value})}
              placeholder="Enter default prompt for this group..."
              rows="4"
              className="prompt-textarea"
            />
            <div className="prompt-field-stats">
              <span className="char-count">{formData.defaultPrompt.length}/2000 characters</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {group ? 'Update' : 'Create'} Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Component editor cho default prompt của group
 */
function GroupPromptEditor({ group, onSave, onCancel }) {
  const [prompt, setPrompt] = useState(group.defaultPrompt || '');
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    onSave(prompt.trim());
  };

  const handleClear = () => {
    setPrompt('');
  };

  const promptLength = prompt.length;
  const isValidPrompt = promptLength >= 10 && promptLength <= 2000;

  return (
    <div className="modal-overlay">
      <div className="modal-content prompt-editor-modal">
        <div className="modal-header">
          <h3>Default Prompt for "{group.name}"</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <div className="prompt-editor-content">
          <div className="prompt-info">
            <div className="info-item">
              <span className="info-label">📝 Purpose:</span>
              <span className="info-text">This prompt will be used for all chats in this group</span>
            </div>
            <div className="info-item">
              <span className="info-label">🔝 Priority:</span>
              <span className="info-text">Always preserved, even when max tokens reached</span>
            </div>
            <div className="info-item">
              <span className="info-label">📊 Length:</span>
              <span className={`info-text ${isValidPrompt ? 'valid' : 'invalid'}`}>
                {promptLength}/2000 characters
              </span>
            </div>
          </div>

          <div className="prompt-tabs">
            <button
              className={`tab-btn ${!isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(false)}
            >
              ✏️ Edit
            </button>
            <button
              className={`tab-btn ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(true)}
            >
              👁️ Preview
            </button>
          </div>

          {!isPreview ? (
            <div className="prompt-editor">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your default prompt here...

Examples:
- You are a helpful assistant specialized in [topic]
- Always respond in a professional and friendly manner
- Provide detailed explanations with examples
- Format code blocks properly"
                rows="12"
                className="prompt-textarea"
              />
              
              <div className="prompt-suggestions">
                <h4>💡 Suggestions:</h4>
                <div className="suggestion-items">
                  <button
                    className="suggestion-btn"
                    onClick={() => setPrompt('You are a helpful coding assistant. Always provide clean, well-documented code with explanations.')}
                  >
                    🔧 Coding Assistant
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setPrompt('You are a creative writing assistant. Help users with storytelling, character development, and narrative structure.')}
                  >
                    ✍️ Creative Writing
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setPrompt('You are a business consultant. Provide strategic advice, market analysis, and professional recommendations.')}
                  >
                    💼 Business Consultant
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setPrompt('You are a learning tutor. Explain concepts clearly, provide examples, and adapt to different learning styles.')}
                  >
                    📚 Learning Tutor
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="prompt-preview">
              <div className="preview-header">
                <h4>📋 Prompt Preview</h4>
                <div className="preview-stats">
                  <span className="stat-item">Words: {prompt.split(' ').length}</span>
                  <span className="stat-item">Characters: {prompt.length}</span>
                  <span className="stat-item">Lines: {prompt.split('\n').length}</span>
                </div>
              </div>
              
              <div className="preview-content">
                {prompt ? (
                  <div className="preview-text">
                    {prompt.split('\n').map((line, index) => (
                      <div key={index} className="preview-line">
                        {line || <span className="empty-line">&nbsp;</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="preview-empty">
                    <span className="empty-message">No prompt content to preview</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="prompt-actions">
          <div className="actions-left">
            <button 
              className="btn-secondary" 
              onClick={handleClear}
              disabled={!prompt}
            >
              🗑️ Clear
            </button>
          </div>
          
          <div className="actions-right">
            <button 
              className="btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={!isValidPrompt}
            >
              💾 Save Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
