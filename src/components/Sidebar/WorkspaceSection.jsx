import { useState, useEffect } from 'react';
import { WorkspaceInfo } from './WorkspaceInfo';
import { ChatList } from './ChatList';

/**
 * WorkspaceSection - Hiển thị workspace structure trong sidebar (simplified without groups)
 */
export function WorkspaceSection({
  workspaces = [],
  currentWorkspace,
  onSelectWorkspace,
  chats = [],
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onUpdateWorkspacePrompt
}) {
  const [showWorkspaceInfo, setShowWorkspaceInfo] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  // Update temp prompt when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      setTempPrompt(currentWorkspace.systemPrompt || '');
    }
  }, [currentWorkspace]);

  const handleSavePrompt = () => {
    if (currentWorkspace && onUpdateWorkspacePrompt) {
      onUpdateWorkspacePrompt(currentWorkspace.id, tempPrompt);
      setShowPromptEditor(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="workspace-section-empty">
        <div className="empty-message">
          <p>No workspace selected</p>
          <p className="empty-hint">Create a workspace to organize your chats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-section">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-selector">
          <select
            value={currentWorkspace.id}
            onChange={(e) => onSelectWorkspace?.(e.target.value)}
            className="workspace-select"
          >
            {workspaces.map(workspace => (
              <option key={workspace.id} value={workspace.id}>
                🏢 {workspace.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="workspace-info">
          <div className="workspace-description-container">
            <p className="workspace-description">{currentWorkspace.description}</p>
            <button 
              className="workspace-help-btn"
              onClick={() => setShowWorkspaceInfo(true)}
              title="Workspace Guide"
            >
              ❓
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Prompt Configuration */}
      <div className="workspace-prompt-section">
        <div className="prompt-header">
          <h4 className="prompt-title">⚙️ Workspace Prompt</h4>
          <button
            className="prompt-edit-btn"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            title="Edit workspace prompt"
          >
            ✏️
          </button>
        </div>
        
        {showPromptEditor ? (
          <div className="prompt-editor">
            <textarea
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              placeholder="Enter system prompt for this workspace..."
              className="prompt-textarea"
              rows={4}
            />
            <div className="prompt-actions">
              <button 
                onClick={handleSavePrompt}
                className="prompt-save-btn"
              >
                Save
              </button>
              <button 
                onClick={() => {
                  setShowPromptEditor(false);
                  setTempPrompt(currentWorkspace.systemPrompt || '');
                }}
                className="prompt-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prompt-preview">
            <p className="prompt-text">
              {currentWorkspace.systemPrompt || 'No system prompt configured'}
            </p>
          </div>
        )}
      </div>

      {/* Chats List */}
      <div className="workspace-chats">
        <div className="section-header">
          <h4 className="section-title">💬 Chats ({chats.length})</h4>
        </div>
        
        {/* Use ChatList component with scroll */}
        <ChatList
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onRenameChat={onRenameChat}
          isCollapsed={false}
        />
      </div>

      {/* Workspace Info Modal */}
      <WorkspaceInfo 
        isOpen={showWorkspaceInfo}
        onClose={() => setShowWorkspaceInfo(false)}
      />
    </div>
  );
}