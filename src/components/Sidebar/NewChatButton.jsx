/**
 * NewChatButton component - Nút tạo chat mới
 */
export function NewChatButton({ onClick, disabled = false }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="new-chat-button"
      title="Create new chat"
      aria-label="Create new chat"
    >
      <span className="button-icon">➕</span>
      <span className="button-text">New Chat</span>
    </button>
  );
}
