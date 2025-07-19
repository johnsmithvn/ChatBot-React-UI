# 🚀 ChatBot React - Quick Start Guide

## 📦 Installation & Setup

### Option 1: Quick Start (Recommended)
```bash
# Double-click start.bat (Windows)
# Or run in PowerShell:
.\start.ps1
```

### Option 2: Manual Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run start` | Alias for `npm run dev` |
| `npm run setup` | Install + build |
| `npm run clean` | Clean node_modules and dist |

## 🌐 Server URLs

- **Development**: http://localhost:5173
- **Network Access**: http://[your-ip]:5173
- **Production Preview**: http://localhost:4173

## 🎯 Testing Features

### 1. **Workspace Management**
- Navigate to sidebar → Click "🏢 Workspaces"
- Create new workspace: "Test Workspace"
- Set description: "Testing workspace functionality"

### 2. **Groups Management**
- Click ➕ next to "📁 Groups"
- Create groups: "Development", "Testing", "Bug Fixes"
- Test expand/collapse by clicking 📁/📂

### 3. **Chat Management**
- Click ➕ next to group name to create chat in group
- Click "New Chat" button to create ungrouped chat
- Rename chats by clicking ✏️ icon

### 4. **Message Actions**
- Send a message in any chat
- Hover over AI response to see action buttons
- Test: 🔄 Regenerate, ✏️ Edit, 🌿 Branch, 🗑️ Delete, 📖 Bookmark

### 5. **Prompt Templates**
- Click "📋 Templates" in sidebar footer
- Create template with variables: "Hello {{name}}, please help me with {{task}}"
- Test variable replacement

### 6. **Resizable Sidebar**
- Hover over right edge of sidebar
- Drag to resize (250px - 600px range)
- Test on different screen sizes

## 📱 Mobile Testing

1. **Local Network Access**:
   ```bash
   # Find your IP address
   ipconfig (Windows)
   ifconfig (Mac/Linux)
   
   # Access from mobile device
   http://[your-ip]:5173
   ```

2. **Mobile Features**:
   - Responsive sidebar collapse
   - Touch-friendly interface
   - Optimized for small screens

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill process on port 5173
   netstat -ano | findstr :5173
   taskkill /PID [PID] /F
   ```

2. **Dependencies issues**:
   ```bash
   npm run clean
   npm install
   ```

3. **Build errors**:
   ```bash
   npm run build
   # Check console for specific errors
   ```

4. **Performance issues**:
   - Check if React DevTools shows unnecessary re-renders
   - Verify React.memo is working
   - Monitor console for warnings

## 🎨 Features to Test

### ✅ **Core Features**
- [ ] Workspace creation and selection
- [ ] Group creation and management
- [ ] Chat creation in groups vs ungrouped
- [ ] Message sending and receiving
- [ ] Sidebar resize functionality

### ✅ **Advanced Features**
- [ ] Message actions (all 5 types)
- [ ] Prompt templates with variables
- [ ] Default group prompts
- [ ] Drag & drop chat organization
- [ ] Expand/collapse groups

### ✅ **UI/UX Features**
- [ ] Smooth animations
- [ ] Hover effects
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile responsiveness

### ✅ **Performance Features**
- [ ] No unnecessary re-renders
- [ ] Smooth scrolling
- [ ] Quick interactions
- [ ] Memory usage optimization

## 📊 Performance Monitoring

### Browser DevTools:
1. **React DevTools**: Check component re-renders
2. **Performance Tab**: Monitor frame rate
3. **Memory Tab**: Check for memory leaks
4. **Network Tab**: Monitor bundle size

### Expected Performance:
- **First Load**: < 2 seconds
- **Interactions**: < 100ms response time
- **Smooth 60fps**: animations and scrolling
- **Memory usage**: < 50MB for typical usage

## 🔧 Development Tips

1. **Hot Reload**: Changes auto-reload in development
2. **Error Overlay**: Syntax errors show in browser
3. **Console Logs**: Check browser console for warnings
4. **Network Tab**: Monitor API calls and responses

---

**🎉 Ready to test! Double-click `start.bat` or run `.\start.ps1` to begin!**
