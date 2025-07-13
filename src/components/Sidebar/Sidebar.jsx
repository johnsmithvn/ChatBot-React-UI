import { ChatList } from './ChatList';
import { NewChatButton } from './NewChatButton';

/**
 * Sidebar component - Thanh bên trái chứa danh sách chat và navigation
 */
export function Sidebar({
  chats = [],
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  isCollapsed = false,
  onToggleCollapse,
  onSettingsClick
}) {

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button 
          onClick={onToggleCollapse}
          className="collapse-button"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '👁️' : '👁️‍🗨️'}
        </button>
        
        {!isCollapsed && (
          <h1 className="sidebar-title">💬 ChatBot</h1>
        )}
      </div>

      {/* New Chat Button */}
      {!isCollapsed && (
        <div className="sidebar-section">
          <NewChatButton onClick={onNewChat} />
        </div>
      )}

      {/* Chat List */}
      <div className="sidebar-section sidebar-main">
        <ChatList 
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onRenameChat={onRenameChat}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button 
          onClick={onSettingsClick}
          className="settings-button"
          title="Settings"
          aria-label="Open settings"
        >
          ⚙️ {!isCollapsed && 'Settings'}
        </button>
        
        {!isCollapsed && (
          <div className="sidebar-stats">
            <span className="chat-count">
              {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
