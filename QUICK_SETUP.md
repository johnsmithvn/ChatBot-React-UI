# ChatBot React - Quick Setup

## 🚀 Bắt đầu nhanh

### 1. Cấu hình Environment
```bash
# Copy file cấu hình mẫu
copy .env.example .env

# Hoặc trên Linux/Mac
cp .env.example .env
```

### 2. Chỉnh sửa .env
Mở file `.env` và cấu hình theo nhu cầu:

```env
# Cho AI Hub (Local)
VITE_MODEL_API_URL=http://localhost:8000/api/v1
VITE_DEFAULT_PROVIDER=local

# Hoặc cho OpenAI
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_DEFAULT_PROVIDER=openai
```

### 3. Validate cấu hình
```bash
npm run validate-env
```

### 4. Khởi chạy
```bash
# Cài đặt và khởi chạy
npm run setup

# Hoặc chỉ khởi chạy
npm run dev
```

## 🔧 Kết nối với AI Hub

### Khởi chạy AI Hub
```bash
cd "AI hub"
python main.py
```

### Khởi chạy ChatBot
```bash
cd ChatBot_react
npm run dev
```

### Hoặc dùng script tự động
```bash
# Windows
./start_services.bat

# Linux/Mac
./start_services.sh
```

## 📋 Providers hỗ trợ

- **OpenAI**: Cần API key
- **AI Hub**: Local server với custom models
- **LM Studio**: Local với LM Studio API
- **Ollama**: Local với Ollama API

## 🛠️ Troubleshooting

### Lỗi kết nối AI Hub
1. Kiểm tra AI Hub đang chạy: `curl http://localhost:8000/health`
2. Kiểm tra cổng không bị chặn
3. Đảm bảo .env có đúng URL

### Lỗi models không hiển thị
1. Đảm bảo AI Hub đã load models
2. Check logs trong AI Hub
3. Thử reload page

### Lỗi CORS
AI Hub đã được cấu hình CORS cho localhost:5173, không cần thay đổi gì.

## 📁 Cấu trúc project
```
ChatBot_react/
├── src/
│   ├── services/aiService.js     # Unified AI service
│   ├── hooks/useChats.js         # Chat management
│   ├── utils/aiHubHelpers.js     # AI Hub utilities
│   └── components/...
├── .env                          # Environment config
├── validate-env.js               # Config validator
└── start_services.*              # Auto-start scripts
```
