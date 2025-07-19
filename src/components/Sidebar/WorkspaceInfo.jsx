/**
 * WorkspaceInfo - Component hiển thị thông tin về workspace và groups
 */
export function WorkspaceInfo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏢 Workspace & Groups Guide</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="info-section">
            <h4>🏢 Workspace là gì?</h4>
            <p>
              Workspace là một "không gian làm việc" lớn để tổ chức tất cả các cuộc trò chuyện 
              theo chủ đề hoặc mục đích sử dụng.
            </p>
            <div className="examples">
              <div className="example">
                <strong>Ví dụ:</strong>
                <ul>
                  <li>🏢 Workspace "Công việc" - cho tất cả chats về công việc</li>
                  <li>🎓 Workspace "Học tập" - cho tất cả chats về học tập</li>
                  <li>🏠 Workspace "Cá nhân" - cho chats cá nhân</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>📁 Groups là gì?</h4>
            <p>
              Groups là các nhóm nhỏ <strong>BÊN TRONG</strong> workspace để tổ chức 
              chats chi tiết hơn.
            </p>
            <div className="examples">
              <div className="example">
                <strong>Ví dụ trong workspace "Công việc":</strong>
                <ul>
                  <li>📁 Group "Dự án A" - chats về dự án A</li>
                  <li>📁 Group "Họp team" - chats về họp</li>
                  <li>📁 Group "Bug fixes" - chats về sửa lỗi</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>🎯 Cách sử dụng:</h4>
            <div className="usage-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Tạo Workspace:</strong> Chọn hoặc tạo workspace cho chủ đề lớn
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Tạo Groups:</strong> Nhấn ➕ bên cạnh "📁 Groups" để tạo nhóm
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Thêm Chats:</strong> Nhấn ➕ bên cạnh tên group để tạo chat trong group
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <strong>Xem Chats:</strong> Nhấn vào 📁 để mở rộng/thu gọn group
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>💡 Lợi ích:</h4>
            <ul className="benefits">
              <li>🎯 <strong>Tổ chức tốt hơn:</strong> Chats được sắp xếp theo chủ đề</li>
              <li>🔍 <strong>Dễ tìm kiếm:</strong> Biết chat nằm ở đâu</li>
              <li>🎨 <strong>Default Prompts:</strong> Mỗi group có thể có prompt mặc định</li>
              <li>🚀 <strong>Hiệu quả cao:</strong> Tập trung vào từng dự án/chủ đề</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Đã hiểu!
          </button>
        </div>
      </div>
    </div>
  );
}
