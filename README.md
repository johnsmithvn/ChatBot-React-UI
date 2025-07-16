# 🤖 ChatBot React UI

A modern, feature-rich chatbot interface built with React and Vite, inspired by professional AI chat applications.

## ✨ Features

### 🎯 Core Chat Features
- **Real-time messaging** with AI models (OpenAI GPT-4, GPT-3.5, etc.)
- **Markdown rendering** with syntax highlighting
- **Message history** with local storage
- **Multiple chat sessions** management
- **Token usage tracking** with context window limits

### 🔧 Advanced Features
- **Message Actions**: Copy, Edit, Regenerate, Branch conversations
- **Workspace Management**: Organize chats into workspaces and groups
- **Prompt Templates**: Pre-built and custom prompt templates with variables
- **Custom Personas**: Different AI personalities for various use cases
- **Drag & Drop**: Move chats between groups easily
- **Context Control**: Smart token limiting to prevent API limits

### 🎨 UI/UX
- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop and mobile
- **Dark/Light Theme**: (Coming soon)
- **Customizable Settings**: API keys, model selection, temperature control
- **Token Usage Indicator**: Visual feedback on context usage

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/johnsmithvn/ChatBot-React-UI.git
cd ChatBot-React-UI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. **API Key Setup**: Open Settings and either:
   - Use custom API key (toggle on and enter your OpenAI API key)
   - Set `VITE_OPENAI_API_KEY` in your environment variables

2. **Model Selection**: Choose your preferred OpenAI model in Settings

3. **Context Tokens**: Configure the context window size (default: 10,000 tokens)

## 🏗️ Architecture

### 📁 Project Structure
```
src/
├── components/
│   ├── MessageActions/          # Message action buttons
│   ├── WorkspaceManager/        # Workspace and group management
│   ├── PromptTemplateManager/   # Prompt template system
│   ├── TokenUsage/              # Token usage indicator
│   ├── Settings/                # Settings modal
│   └── Sidebar/                 # Chat sidebar
├── hooks/
│   ├── useChats.js             # Chat management logic
│   ├── useSettings.js          # Settings management
│   └── useLocalStorage.js      # Local storage utility
├── services/
│   └── openai.js               # OpenAI API integration
├── utils/
│   ├── constants.js            # App constants
│   └── helpers.js              # Utility functions
└── styles/
    └── components.css          # Component styles
```

### 🔧 Key Technologies
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **ReactMarkdown**: Markdown rendering
- **react-syntax-highlighter**: Code syntax highlighting
- **OpenAI API**: AI model integration
- **LocalStorage**: Client-side data persistence

## 🎯 Advanced Features

### 📋 Prompt Templates
Create reusable prompt templates with variables:

```javascript
// Example template
const codingTemplate = {
  name: "💻 Code Assistant",
  template: `You are a senior developer. Help with:
Language: {{language}}
Framework: {{framework}}
Task: {{task}}`
};
```

### 🏢 Workspace System
- **Workspaces**: Top-level organization (e.g., "Work", "Personal")
- **Groups**: Categories within workspaces (e.g., "Frontend", "Backend")
- **Drag & Drop**: Move chats between groups
- **Custom Personas**: Each workspace/group can have different AI behavior

### 🎭 Custom Personas
Pre-built personas for different use cases:
- **🤖 AI Assistant**: General helpful assistant
- **💻 Code Expert**: Programming specialist
- **🎨 Creative Writer**: Content creation
- **📊 Data Analyst**: Analysis and insights
- **🌍 Translator**: Language translation
- **🎓 Teacher**: Educational explanations

### 🔄 Message Actions
- **Copy**: Copy message content to clipboard
- **Edit**: Edit user messages (regenerates AI response)
- **Regenerate**: Get new AI response for same prompt
- **Branch**: Create conversation branches
- **Bookmark**: Save important messages
- **Delete**: Remove messages

## 🎨 Customization

### Adding New Personas
```javascript
// In constants.js
export const CUSTOM_PERSONAS = {
  MARKETING: {
    name: '📈 Marketing Expert',
    systemPrompt: 'You are a marketing specialist...',
    temperature: 0.8,
    maxTokens: 1200
  }
};
```

### Creating Prompt Templates
```javascript
// Template with variables
const template = {
  name: "Custom Template",
  template: `Context: {{context}}
Task: {{task}}
Output format: {{format}}`
};
```

## 🔧 Configuration

### Environment Variables
```env
VITE_OPENAI_API_KEY=your_api_key_here
VITE_APP_NAME=ChatBot React UI
```

### Settings Options
- **API Configuration**: Custom API keys, model selection
- **Chat Settings**: Context tokens, temperature, max tokens
- **UI Settings**: Timestamps, sidebar collapsed state
- **Advanced**: System prompts, persona customization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) by McKay Wrigley
- Built with modern React and Vite
- Uses OpenAI API for AI responses

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Happy chatting! 🎉**
