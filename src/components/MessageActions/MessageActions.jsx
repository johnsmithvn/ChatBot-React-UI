import React from 'react';
import { MESSAGE_ACTIONS } from '../../utils/constants';

/**
 * Component hiển thị các actions cho message
 */
export function MessageActions({ 
  message, 
  onRegenerate, 
  onDelete
}) {

  return (
    <div className="message-actions-inline">
      {message.role === 'assistant' && (
        <button
          className="message-action-item"
          onClick={() => onRegenerate?.(message)}
          title="Regenerate"
        >
          <span className="message-action-icon">🔄</span>
          <span className="message-action-label">Regenerate</span>
        </button>
      )}
      <button
        className="message-action-item danger"
        onClick={() => onDelete?.(message)}
        title="Delete"
      >
        <span className="message-action-icon">🗑️</span>
        <span className="message-action-label">Delete</span>
      </button>
    </div>
  );
}
