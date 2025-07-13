import { useState } from 'react';
import { formatMessageTime } from '../../utils/helpers';

/**
 * ChatList component - Danh sách các cuộc trò chuyện
 */
export function ChatList({
  chats = [],
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  isCollapsed = false
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId) => {
    if (editTitle.trim() && editTitle.trim() !== '') {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(chatId);
    }
  };

  if (chats.length === 0) {
    return (
      <div className="chat-list-empty">
        {!isCollapsed && (
          <div className="empty-state">
            <p>No chats yet</p>
            <span>Create your first chat to get started</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <div 
          key={chat.id}
          className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
          onClick={() => onSelectChat(chat.id)}
          title={isCollapsed ? chat.title : ''}
        >
          {isCollapsed ? (
            // Collapsed view - chỉ hiển thị icon
            <div className="chat-item-collapsed">
              <span className="chat-icon">💬</span>
            </div>
          ) : (
            // Expanded view - hiển thị full info
            <>
              <div className="chat-item-content">
                {editingId === chat.id ? (
                  <input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(chat.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="chat-title-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="chat-title">{chat.title}</div>
                    <div className="chat-meta">
                      <span className="chat-time">
                        {formatMessageTime(chat.updatedAt, 'relative')}
                      </span>
                      <span className="chat-count">
                        {chat.messages?.length || 0} messages
                      </span>
                    </div>
                  </>
                )}
              </div>

              {editingId !== chat.id && (
                <div className="chat-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat);
                    }}
                    className="action-button edit-button"
                    title="Rename chat"
                    aria-label="Rename chat"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="action-button delete-button"
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
