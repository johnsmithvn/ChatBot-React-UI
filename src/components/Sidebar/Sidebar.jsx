import { ChatList } from './ChatList';
import { NewChatButton } from './NewChatButton';
import { WorkspaceSection } from './WorkspaceSection';
import { useState, useEffect, useRef, useCallback, memo } from 'react';

/**
 * Sidebar component - Thanh bên trái chứa danh sách chat và navigation
 */
export const Sidebar = memo(function Sidebar({
  chats = [],
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  isCollapsed = false,
  onToggleCollapse,
  onSettingsClick,
  onWorkspaceClick,
  onTemplateClick,
  // Workspace props
  workspaces = [],
  currentWorkspace,
  onSelectWorkspace,
  onOpenPromptModal,
  onOpenWorkspaceInfo
}) {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Handle resize với useCallback để tối ưu performance
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '60px' : `${sidebarWidth}px` }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div 
          className="sidebar-resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
      
      {/* Header - Enhanced */}
      <div className="sidebar-header">
        <div className="header-content">
          {!isCollapsed && (
            <div className="app-branding">
              <div className="app-icon">💬</div>
              <div className="app-info">
                <h1 className="app-title">ChatBot</h1>
                <span className="app-subtitle">AI Assistant</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={onToggleCollapse}
            className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '👁️' : '⚡'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* New Chat Button - Fixed at top */}
          <div className="sidebar-new-chat">
            <NewChatButton onClick={onNewChat} />
          </div>

          {/* Workspace Section - Collapsible */}
          <div className="sidebar-workspace">
            <WorkspaceSection
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              onSelectWorkspace={onSelectWorkspace}
              chats={chats}
              currentChatId={currentChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
              onRenameChat={onRenameChat}
              onOpenPromptModal={onOpenPromptModal}
              onOpenWorkspaceInfo={onOpenWorkspaceInfo}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <>
            <button 
              onClick={onWorkspaceClick}
              className="footer-button workspace-button"
              title="Workspace Manager"
            >
              🏢 Workspaces
            </button>
            
            <button 
              onClick={onTemplateClick}
              className="footer-button template-button"
              title="Template Manager"
            >
              📋 Templates
            </button>
          </>
        )}
        
        <button 
          onClick={onSettingsClick}
          className={`footer-button settings-button ${isCollapsed ? 'collapsed' : ''}`}
          title="Settings"
          aria-label="Open settings"
        >
          ⚙️ {!isCollapsed && 'Settings'}
        </button>
      </div>
    </div>
  );
});
