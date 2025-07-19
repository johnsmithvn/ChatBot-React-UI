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
  onOpenPromptModal
}) {

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
          <p className="workspace-description">{currentWorkspace.description}</p>
        </div>
      </div>

      {/* Workspace Actions - Compact */}
      <div className="workspace-actions">
        <button
          className="workspace-action-button prompt-button"
          onClick={() => onOpenPromptModal?.()}
          title="Configure workspace settings"
        >
          <span className="action-icon">⚙️</span>
          <span className="action-text">Settings</span>
        </button>
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
    </div>
  );
}