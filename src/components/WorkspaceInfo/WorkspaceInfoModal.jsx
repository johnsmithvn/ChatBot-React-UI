import { useWorkspace } from '../../hooks/useWorkspace';
import { useChats } from '../../hooks/useChats';

/**
 * WorkspaceInfoModal - Modal hiển thị thông tin chi tiết về workspace hiện tại
 */
export function WorkspaceInfoModal({ isOpen, onClose }) {
  const { currentWorkspace } = useWorkspace();
  const { chats } = useChats();

  // Tính số chats trong workspace hiện tại
  const workspaceChats = chats.filter(chat => chat.workspaceId === currentWorkspace?.id);
  const chatCount = workspaceChats.length;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content workspace-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏢 Workspace Information</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {currentWorkspace ? (
            <>
              <div className="workspace-details">
                <div className="detail-item">
                  <label>Workspace Name:</label>
                  <div className="detail-value">
                    🏢 {currentWorkspace.name}
                  </div>
                </div>

                <div className="detail-item">
                  <label>Description:</label>
                  <div className="detail-value">
                    {currentWorkspace.description || 'No description provided'}
                  </div>
                </div>

                <div className="detail-item">
                  <label>Workspace ID:</label>
                  <div className="detail-value workspace-id">
                    {currentWorkspace.id}
                  </div>
                </div>

                {currentWorkspace.systemPrompt && (
                  <div className="detail-item">
                    <label>System Prompt:</label>
                    <div className="detail-value system-prompt">
                      <div className="prompt-preview">
                        {currentWorkspace.systemPrompt.length > 150 
                          ? `${currentWorkspace.systemPrompt.substring(0, 150)}...`
                          : currentWorkspace.systemPrompt
                        }
                      </div>
                      {currentWorkspace.systemPrompt.length > 150 && (
                        <div className="prompt-note">
                          <small>💡 Full prompt can be viewed/edited via Prompt button</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="detail-item">
                  <label>Created:</label>
                  <div className="detail-value">
                    {currentWorkspace.createdAt 
                      ? new Date(currentWorkspace.createdAt).toLocaleString()
                      : 'Unknown'
                    }
                  </div>
                </div>

                <div className="detail-item">
                  <label>Last Modified:</label>
                  <div className="detail-value">
                    {currentWorkspace.updatedAt 
                      ? new Date(currentWorkspace.updatedAt).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
              </div>

              <div className="workspace-stats">
                <h4>📊 Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span className="stat-label">Total Chats</span>
                    <span className="stat-value">{chatCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔄</span>
                    <span className="stat-label">Active Sessions</span>
                    <span className="stat-value">1</span>
                  </div>
                </div>
              </div>

              <div className="workspace-features">
                <h4>✨ Features</h4>
                <ul className="features-list">
                  <li>🎯 <strong>Custom System Prompts:</strong> Configure AI behavior for this workspace</li>
                  <li>💬 <strong>Chat Organization:</strong> Keep all related conversations in one place</li>
                  <li>🔄 <strong>Context Persistence:</strong> Maintain conversation context across sessions</li>
                  <li>⚙️ <strong>Workspace Settings:</strong> Customize behavior and appearance</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="no-workspace">
              <div className="empty-state">
                <span className="empty-icon">🏢</span>
                <h4>No Workspace Selected</h4>
                <p>Please select a workspace to view its information.</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
