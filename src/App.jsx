import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SettingsModal } from './components/Settings/SettingsModal';
import { useChats } from './hooks/useChats';
import { useSettings } from './hooks/useSettings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom hooks
  const { settings, updateSetting } = useSettings();
  
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    initializeFirstChat
  } = useChats(settings);

  // Khởi tạo chat đầu tiên nếu cần
  useEffect(() => {
    initializeFirstChat();
  }, [initializeFirstChat]);

  // Toggle sidebar
  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
    updateSetting('sidebarCollapsed', !sidebarCollapsed);
  };

  // Chat input state
  const [message, setMessage] = useState('');

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageToSend = message.trim();
    setMessage('');
    
    await sendMessage(messageToSend);
  };

  // Handle input keypress
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Chat Area */}
      <div className="main-area">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <h2 className="chat-title">{currentChat.title}</h2>
              <div className="chat-info">
                <span className="message-count">
                  {currentChat.messages?.length || 0} messages
                </span>
                <span className="model-info">
                  🤖 {settings.model}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              <div className="messages-container">
                {currentChat.messages?.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-content">
                      <h3>👋 Start a conversation</h3>
                      <p>Type a message below to get started!</p>
                    </div>
                  </div>
                ) : (
                  currentChat.messages?.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`message-container ${
                        msg.role === 'assistant' ? 'assistant' : 'user'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="message-avatar">
                          <span className="avatar-icon">🤖</span>
                        </div>
                      )}

                      <div className={`message-bubble ${msg.role}`}>
                        {msg.role === 'assistant' ? (
                          <div className="markdown-content">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="message-text">{msg.content}</p>
                        )}
                        
                        {settings.showTimestamps && (
                          <div className="message-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="message-avatar">
                          <span className="avatar-icon">👤</span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="message-container assistant">
                    <div className="message-avatar">
                      <span className="avatar-icon">🤖</span>
                    </div>
                    <div className="message-bubble assistant loading">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <div className="input-container">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    className="message-input"
                    disabled={isLoading}
                    rows={1}
                    onInput={(e) => {
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                    }}
                  />
                  
                  <button 
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="send-button"
                    title="Send message"
                  >
                    {isLoading ? '⏳' : '📤'}
                  </button>
                </div>
                
                <div className="input-footer">
                  <div className="input-hints">
                    <span className="hint">💡 Press Shift+Enter for new line</span>
                    <span className="char-count">
                      {message.length}/4000
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* No chat selected */
          <div className="no-chat-selected">
            <div className="welcome-content">
              <h1>💬 Welcome to ChatBot</h1>
              <p>Select a chat from the sidebar or create a new one to get started</p>
              <button 
                onClick={createNewChat}
                className="welcome-button"
              >
                ➕ Start New Chat
              </button>
              
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <span className="feature-text">AI-powered conversations</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📝</span>
                  <span className="feature-text">Markdown support</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💾</span>
                  <span className="feature-text">Auto-save chat history</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
}

export default App;
