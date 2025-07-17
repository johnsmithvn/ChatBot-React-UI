import { useState, useEffect } from 'react';

/**
 * WorkspacePromptModal - Modal để chỉnh sửa workspace prompt
 */
export function WorkspacePromptModal({
  isOpen,
  onClose,
  workspace,
  onSave
}) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workspace) {
      setPrompt(workspace.systemPrompt || '');
    }
  }, [workspace]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(workspace.id, prompt);
      onClose();
    } catch (error) {
      console.error('Failed to save workspace prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPrompt(workspace?.systemPrompt || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="workspace-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">⚙️ Workspace Prompt</h2>
            <p className="modal-subtitle">
              Configure system prompt for <strong>{workspace?.name}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="modal-close-button"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="prompt-input-section">
            <label htmlFor="workspace-prompt" className="prompt-label">
              System Prompt
            </label>
            <textarea
              id="workspace-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter system prompt for this workspace..."
              className="prompt-textarea"
              rows={12}
              disabled={isLoading}
            />
            <div className="prompt-help">
              <span className="help-icon">💡</span>
              <span className="help-text">
                This prompt will be used as the system context for all chats in this workspace
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={handleCancel}
            className="modal-button secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="modal-button primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="button-icon">💾</span>
                Save Prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
