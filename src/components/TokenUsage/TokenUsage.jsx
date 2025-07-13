import React from 'react';
import { calculateTotalTokens } from '../../utils/helpers';
import { CHAT_SETTINGS } from '../../utils/constants';

/**
 * Component hiển thị token usage
 */
export function TokenUsage({ messages, contextTokens = CHAT_SETTINGS.DEFAULT_CONTEXT_TOKENS }) {
  const totalTokens = calculateTotalTokens(messages || []);
  const percentage = Math.min((totalTokens / contextTokens) * 100, 100);
  
  // Định nghĩa màu sắc theo mức độ sử dụng
  const getBarColor = () => {
    if (percentage < 50) return '#10b981'; // green
    if (percentage < 80) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getStatusText = () => {
    if (percentage < 50) return '✅ Tốt';
    if (percentage < 80) return '⚠️ Cảnh báo';
    return '🚨 Gần đầy';
  };

  return (
    <div className="token-usage">
      <div className="token-usage-header">
        <span className="token-usage-label">
          🧠 Context Tokens
        </span>
        <span className="token-usage-status">
          {getStatusText()}
        </span>
      </div>
      
      <div className="token-usage-bar">
        <div 
          className="token-usage-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getBarColor()
          }}
        />
      </div>
      
      <div className="token-usage-info">
        <span className="token-usage-text">
          {totalTokens.toLocaleString()} / {contextTokens.toLocaleString()} tokens
        </span>
        <span className="token-usage-percentage">
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      {percentage > 80 && (
        <div className="token-usage-warning">
          <small>
            💡 Lịch sử chat sẽ được rút gọn tự động khi gửi tin nhắn
          </small>
        </div>
      )}
    </div>
  );
}
