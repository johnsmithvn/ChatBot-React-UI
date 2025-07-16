import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SettingsModal } from './components/Settings/SettingsModal';
import { TokenUsage } from './components/TokenUsage/TokenUsage';
import { MessageActions } from './components/MessageActions/MessageActions';
import { WorkspaceManager } from './components/WorkspaceManager/WorkspaceManager';
import { PromptTemplateManager } from './components/PromptTemplateManager/PromptTemplateManager';
import { useChats } from './hooks/useChats';
import { useSettings } from './hooks/useSettings';
import { useWorkspace } from './hooks/useWorkspace';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  
  // Custom hooks
  const { settings, updateSetting } = useSettings();
  
  // Workspace management
  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    updateWorkspacePrompt,
    initializeDefaultWorkspace,
    promptTemplates,
    createPromptTemplate,
    updatePromptTemplate,
    deletePromptTemplate
  } = useWorkspace();
  
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    createNewChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    // Message actions
    regenerateResponse,
    
    
    deleteMessage,
    
  } = useChats(settings, currentWorkspace?.id, currentWorkspace);

  // Khởi tạo workspace mặc định
  useEffect(() => {
    initializeDefaultWorkspace();
  }, [initializeDefaultWorkspace]);

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
    
    console.log('📤 handleSendMessage - currentWorkspace:', currentWorkspace);
    console.log('📤 handleSendMessage - currentWorkspace.systemPrompt:', currentWorkspace?.systemPrompt);
    
    // Sử dụng system prompt từ workspace
    const systemPrompt = currentWorkspace?.systemPrompt || null;
    console.log('📤 handleSendMessage - final systemPrompt:', systemPrompt);
    
    await sendMessage(messageToSend, systemPrompt);
  };

  // Wrapper function để tạo chat mới
  const handleCreateNewChat = useCallback(() => {
    const newChat = createNewChat();
    return newChat;
  }, [createNewChat]);

  // Function để tạo chat mới trong group cụ thể
  // Handle input keypress
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="app-container">
      {(() => {
        console.log('🎯 App render - currentChat:', currentChat);
        console.log('🎯 App render - currentChatId:', currentChatId);
        console.log('🎯 App render - chats:', chats);
        return null;
      })()}
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleCreateNewChat}
        onSelectChat={switchToChat}
        onDeleteChat={deleteChat}
        onRenameChat={updateChatTitle}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onSettingsClick={() => {
          console.log("Settings button clicked, current state:", showSettings);
          setShowSettings(true);
        }}
        onWorkspaceClick={() => setShowWorkspaceManager(true)}
        onTemplateClick={() => setShowTemplateManager(true)}
        // Workspace props
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={selectWorkspace}
        onUpdateWorkspacePrompt={updateWorkspacePrompt}
      />

      {/* Main Chat Area */}
      <div className="main-area" style={{ minHeight: 500, background: '#fff', borderRadius: 8, margin: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {(() => {
          console.log('📊 Main area render - currentChat:', currentChat);
          console.log('📊 Main area render - currentChatId:', currentChatId);
          console.log('📊 Main area render - chats:', chats);
          return null;
        })()}
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
                
                {/* Workspace System Prompt Info */}
                {currentWorkspace?.systemPrompt && (
                  <div className="workspace-prompt-info">
                    <span className="prompt-active">🎯 Workspace Prompt Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Token Usage */}
            <div className="token-usage-container">
              <TokenUsage 
                messages={currentChat.messages} 
                contextTokens={settings.contextTokens}
              />
            </div>

            {/* Messages Area */}
            <div className="messages-area" style={{ minHeight: 300, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
              <div className="messages-container" style={{ minHeight: 200 }}>
                {(() => {
                  console.log('🖥️ UI Render - currentChat:', currentChat);
                  console.log('🖥️ UI Render - messages:', currentChat?.messages);
                  console.log('🖥️ UI Render - messages length:', currentChat?.messages?.length);
                  return null;
                })()}
                {currentChat.messages?.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-content">
                      <h3>👋 Start a conversation</h3>
                      <p>Type a message below to get started!</p>
                    </div>
                  </div>
                ) : (
                  currentChat.messages?.map((msg, index) => (
                    <div key={msg.id || index} className="message-wrapper">
                      <div
                        className={`message-container ${
                          msg.role === 'assistant' ? 'assistant' : 'user'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="message-avatar">
                            <span className="avatar-icon">🤖</span>
                          </div>
                        )}

                        {msg.role === 'user' && (
                          <div className="message-avatar">
                            <span className="avatar-icon">👤</span>
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
                        </div>
                      </div>

                      {/* Message Actions và Timestamp dưới message container */}
                      <div className={`message-actions-inline-wrapper ${msg.role}`}> 
                        <MessageActions
                          message={msg}
                          onRegenerate={(message) => {
                            const messageIndex = currentChat.messages.findIndex(msg => msg.id === message.id);
                            if (messageIndex !== -1) {
                              regenerateResponse(currentChatId, messageIndex);
                            }
                          }}
                          onDelete={(message) => {
                            if (confirm('Are you sure you want to delete this message?')) {
                              deleteMessage(currentChatId, message.id);
                            }
                          }}
                        />
                        
                        {settings.showTimestamps && (
                          <div className="message-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
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
                onClick={handleCreateNewChat}
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

      {/* Settings Modal luôn render cùng cấp với app, không che mất các thành phần khác */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
      />

      {/* Workspace Manager Modal */}
      {showWorkspaceManager && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>🏢 Workspace Manager</h3>
              <button className="modal-close" onClick={() => setShowWorkspaceManager(false)}>✕</button>
            </div>
            <div className="modal-body">
              <WorkspaceManager
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
                onCreateWorkspace={createWorkspace}
                onSelectWorkspace={selectWorkspace}
                onUpdateWorkspace={updateWorkspace}
                onDeleteWorkspace={deleteWorkspace}
              />
            </div>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>📋 Template Manager</h3>
              <button className="modal-close" onClick={() => setShowTemplateManager(false)}>✕</button>
            </div>
            <div className="modal-body">
              <PromptTemplateManager
                templates={promptTemplates}
                onSelectTemplate={(template) => {
                  setMessage(template);
                  setShowTemplateManager(false);
                }}
                onCreateTemplate={createPromptTemplate}
                onUpdateTemplate={updatePromptTemplate}
                onDeleteTemplate={deletePromptTemplate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
