import React, { useState } from 'react';
import { MESSAGE_ACTIONS } from '../../utils/constants';

/**
 * Component hiển thị các actions cho message
 */
export function MessageActions({ 
  message, 
  onCopy, 
  onEdit, 
  onRegenerate, 
  onBranch, 
  onDelete,
  onBookmark,
  isEditing = false 
}) {
  const [showActions, setShowActions] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      if (onCopy) onCopy(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const actions = [
    {
      id: MESSAGE_ACTIONS.COPY,
      icon: '📋',
      label: 'Copy',
      onClick: handleCopy,
      show: true
    },
    {
      id: MESSAGE_ACTIONS.EDIT,
      icon: '✏️',
      label: 'Edit',
      onClick: () => onEdit?.(message),
      show: message.role === 'user' && !isEditing
    },
    {
      id: MESSAGE_ACTIONS.REGENERATE,
      icon: '🔄',
      label: 'Regenerate',
      onClick: () => onRegenerate?.(message),
      show: message.role === 'assistant'
    },
    {
      id: MESSAGE_ACTIONS.BRANCH,
      icon: '🌿',
      label: 'Branch',
      onClick: () => onBranch?.(message),
      show: true
    },
    {
      id: MESSAGE_ACTIONS.BOOKMARK,
      icon: message.bookmarked ? '🔖' : '📌',
      label: message.bookmarked ? 'Unbookmark' : 'Bookmark',
      onClick: () => onBookmark?.(message),
      show: true
    },
    {
      id: MESSAGE_ACTIONS.DELETE,
      icon: '🗑️',
      label: 'Delete',
      onClick: () => onDelete?.(message),
      show: true,
      danger: true
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  return (
    <div className="message-actions-container">
      <div 
        className="message-actions-trigger"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <button className="message-actions-button">
          <span className="message-actions-icon">⋯</span>
        </button>
        
        {showActions && (
          <div className="message-actions-dropdown">
            {visibleActions.map(action => (
              <button
                key={action.id}
                className={`message-action-item ${action.danger ? 'danger' : ''}`}
                onClick={action.onClick}
                title={action.label}
              >
                <span className="message-action-icon">{action.icon}</span>
                <span className="message-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
