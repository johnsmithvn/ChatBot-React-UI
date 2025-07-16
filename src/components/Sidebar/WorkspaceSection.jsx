import { useState, useEffect, memo } from 'react';
import { WorkspaceInfo } from './WorkspaceInfo';

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
        
        <div className="chats-list">
          {chats.length === 0 ? (
            <div className="empty-chats">
              <p>No chats in this workspace</p>
              <p className="empty-hint">Create a new chat to get started</p>
            </div>
          ) : (
            chats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onSelect={() => onSelectChat?.(chat.id)}
                onDelete={() => onDeleteChat?.(chat.id)}
                onRename={(newTitle) => onRenameChat?.(chat.id, newTitle)}
              />
            ))
          )}
        </div>
      </div>

      {/* Workspace Info Modal */}
      <WorkspaceInfo 
        isOpen={showWorkspaceInfo}
        onClose={() => setShowWorkspaceInfo(false)}
      />
    </div>
  );
}

/**
 * ChatItem - Individual chat item component with enhanced formatting
 */
const ChatItem = memo(function ChatItem({ chat, isActive, onSelect, onDelete, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(chat.title);
      setIsEditing(false);
    }
  };

  const getTimeAgo = () => {
    if (!chat.updatedAt) return '';
    const now = new Date();
    const updated = new Date(chat.updatedAt);
    const diffInHours = Math.floor((now - updated) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(chat.updatedAt).toLocaleDateString();
  };

  return (
    <div className={`chat-item enhanced ${isActive ? 'active' : ''}`}>
      <div className="chat-content" onClick={onSelect}>
        <div className="chat-main">
          <div className="chat-icon">💬</div>
          <div className="chat-info">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRename}
                onKeyPress={handleKeyPress}
                className="chat-title-input"
                autoFocus
              />
            ) : (
              <>
                <div className="chat-title">{chat.title}</div>
              </>
            )}
          </div>
        </div>
        <div className="chat-meta">
          <span className="chat-time">{getTimeAgo()}</span>
          <span className="chat-message-count">{(chat.messages && chat.messages.length) || 0}</span>
        </div>
      </div>
      
      <div className="chat-actions">
        <button
          className="chat-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="Rename chat"
        >
          ✏️
        </button>
        <button
          className="chat-action-btn danger"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this chat?')) {
              onDelete();
            }
          }}
          title="Delete chat"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});