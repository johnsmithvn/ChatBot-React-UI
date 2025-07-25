import { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SettingsModal } from './components/Settings/SettingsModal';
import { TokenUsage } from './components/TokenUsage/TokenUsage';
import { MessageActions } from './components/MessageActions/MessageActions';
import { WorkspaceSettingsModal } from './components/WorkspaceManager/WorkspaceSettingsModal';
import { PromptTemplateManager, UseTemplateModal, TemplateForm } from './components/PromptTemplateManager/PromptTemplateManager';
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
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showUseTemplate, setShowUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Custom hooks
  const { settings, updateSetting, addPersona } = useSettings();
  
  // Workspace management
  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    updateWorkspace,
    selectWorkspace,
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

  // Ref cho messages container để auto scroll
  const messagesEndRef = useRef(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages, isLoading]);

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
    await sendMessage(messageToSend);
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
          setShowSettings(true);
        }}
        onWorkspaceClick={() => {
          setEditingWorkspace(null); // Null = create mode
          setShowWorkspaceSettings(true);
        }}
        onTemplateClick={() => setShowTemplateManager(true)}
        // Workspace props
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={selectWorkspace}
        onOpenPromptModal={() => {
          setEditingWorkspace(currentWorkspace);
          setShowWorkspaceSettings(true);
        }}
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
                
                {/* Workspace Persona Info */}
                {currentWorkspace?.persona && (
                  <div className="workspace-prompt-info">
                    <span className="prompt-active">� {currentWorkspace.persona.name}</span>
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
            <div className="messages-area">
              <div className="messages-container">
                {/* Debug logs commented out
                {(() => {
                */}
                {currentChat.messages?.filter(msg => msg.content && msg.content.trim()).length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-content">
                      <h3>👋 Start a conversation</h3>
                      <p>Type a message below to get started!</p>
                      <div className="empty-chat-suggestions">
                        <div className="suggestion-item" onClick={() => setMessage("Hello! How can you help me today?")}>
                          <span className="suggestion-icon">💬</span>
                          <span className="suggestion-text">Say hello</span>
                        </div>
                        <div className="suggestion-item" onClick={() => setMessage("Can you explain how this chatbot works?")}>
                          <span className="suggestion-icon">❓</span>
                          <span className="suggestion-text">Ask about features</span>
                        </div>
                        <div className="suggestion-item" onClick={() => setMessage("Help me write a professional email")}>
                          <span className="suggestion-icon">✍️</span>
                          <span className="suggestion-text">Get help writing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentChat.messages?.filter(msg => msg.content && msg.content.trim()).map((msg, index) => (
                    <div key={msg.id || index} className="message-wrapper">
                      <div
                        className={`message-container ${
                          msg.role === 'assistant' ? 'assistant' : 'user'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="message-avatar-wrapper">
                            <div className="message-avatar">
                              <span className="avatar-icon">🤖</span>
                            </div>
                            {settings.showTimestamps && (
                              <div className="message-timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {msg.role === 'user' && (
                          <div className="message-avatar-wrapper">
                            <div className="message-avatar">
                              <span className="avatar-icon">👤</span>
                            </div>
                            {settings.showTimestamps && (
                              <div className="message-timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
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

                      {/* Message Actions dưới message container */}
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
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator - chỉ 3 chấm */}
                {isLoading && (
                  <div className="message-wrapper">
                    <div className="message-container assistant">
                      <div className="message-avatar-wrapper">
                        <div className="message-avatar">
                          <span className="avatar-icon">🤖</span>
                        </div>
                      </div>
                      <div className="typing-indicator-standalone">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto scroll target */}
                <div ref={messagesEndRef} />
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
              
              <div className="welcome-actions">
                <button 
                  onClick={handleCreateNewChat}
                  className="welcome-button primary"
                >
                  ➕ Start New Chat
                </button>
                <button 
                  onClick={() => setShowTemplateManager(true)}
                  className="welcome-button secondary"
                >
                  📋 Browse Templates
                </button>
              </div>
              
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
                <div className="feature">
                  <span className="feature-icon">🏢</span>
                  <span className="feature-text">Workspace management</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📋</span>
                  <span className="feature-text">Prompt templates</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚙️</span>
                  <span className="feature-text">Customizable settings</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal luôn render cùng cấp với app, không che mất các thành phần khác */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdateSetting={updateSetting}
        />
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
                  setSelectedTemplate(template);
                  setShowUseTemplate(true);
                }}
                onCreateClick={() => {
                  setShowCreateTemplate(true);
                }}
                onEditClick={(template) => {
                  setEditingTemplate(template);
                  setShowEditTemplate(true);
                }}
                onDeleteTemplate={deletePromptTemplate}
                onClose={() => setShowTemplateManager(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Use Template Modal */}
      {showUseTemplate && selectedTemplate && (
        <UseTemplateModal
          template={selectedTemplate}
          onUse={(processedTemplate) => {
            setMessage(processedTemplate);
            setShowUseTemplate(false);
            setSelectedTemplate(null);
          }}
          onCancel={() => {
            setShowUseTemplate(false);
            setSelectedTemplate(null);
            setShowTemplateManager(true);
          }}
        />
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <TemplateForm
          onSubmit={(templateData) => {
            createPromptTemplate(templateData);
            setShowCreateTemplate(false);
          }}
          onCancel={() => {
            setShowCreateTemplate(false);
            setShowTemplateManager(true);
          }}
        />
      )}

      {/* Edit Template Modal */}
      {showEditTemplate && editingTemplate && (
        <TemplateForm
          template={editingTemplate}
          onSubmit={(templateData) => {
            updatePromptTemplate(editingTemplate.id, templateData);
            setShowEditTemplate(false);
            setEditingTemplate(null);
          }}
          onCancel={() => {
            setShowEditTemplate(false);
            setEditingTemplate(null);
            setShowTemplateManager(true);
          }}
        />
      )}

      {/* Workspace Settings Modal - Unified for Create & Edit */}
      <WorkspaceSettingsModal
        isOpen={showWorkspaceSettings}
        workspace={editingWorkspace} // null = create mode, object = edit mode
        onClose={() => {
          setShowWorkspaceSettings(false);
          setEditingWorkspace(null);
        }}
        onUpdateWorkspace={updateWorkspace}
        onCreateWorkspace={createWorkspace}
        settings={{
          ...settings,
          onAddPersona: addPersona
        }}
      />
    </div>
  );
}

export default App;
