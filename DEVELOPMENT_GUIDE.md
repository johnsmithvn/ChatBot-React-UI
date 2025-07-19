# 🛠️ ChatBot React - Development Guide

## 🎯 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn equivalent)
- **OpenAI API Key**: For AI functionality
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd ChatBot_react

# Install dependencies
npm install

# Create environment file (optional)
echo "VITE_OPENAI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

### Development Server
- **URL**: http://localhost:5173
- **Hot Reload**: Enabled by default
- **Error Overlay**: Development errors shown in browser

## 🏗️ Project Structure for Developers

### Key Directories

#### `/src/components/`
Component organization by feature:

```
components/
├── Chat/                     # Future: Chat interface components
├── MessageActions/           # Message interaction toolbar
├── PromptTemplateManager/    # Template system management
├── Settings/                 # Global application settings
├── Sidebar/                  # Navigation and workspace management
├── TokenUsage/              # Token consumption visualization
├── UI/                      # Shared/reusable UI components
└── WorkspaceManager/        # Workspace configuration
```

#### `/src/hooks/`
Custom React hooks for business logic:

```
hooks/
├── useChats.js              # Chat state management
├── useLocalStorage.js       # Storage abstraction layer
├── useSettings.js           # Global settings management
└── useWorkspace.js          # Workspace state management
```

#### `/src/styles/`
CSS architecture with modular approach:

```
styles/
├── index.css               # Main entry point (imports all)
├── base.css                # Variables, reset, global styles
├── sidebar.css             # Sidebar navigation styles
├── chat.css                # Chat interface styles
├── workspace.css           # Workspace management styles
├── settings.css            # Settings modal styles
├── modal.css               # Modal system styles
├── forms.css               # Form elements styles
├── message.css             # Message bubble styles
├── template.css            # Template manager styles
└── token.css               # Token usage styles
```

## 🧩 Component Development Guidelines

### Component Structure Template

```jsx
import React, { useState, useCallback, memo } from 'react';

/**
 * ComponentName - Brief description of component purpose
 * 
 * @param {Object} props - Component props
 * @param {string} props.requiredProp - Description of required prop
 * @param {function} props.onAction - Event handler description
 * @param {boolean} [props.optionalProp=false] - Optional prop with default
 */
const ComponentName = memo(function ComponentName({
  requiredProp,
  onAction,
  optionalProp = false,
  ...restProps
}) {
  // State declarations
  const [localState, setLocalState] = useState(initialValue);
  
  // Event handlers with useCallback for performance
  const handleAction = useCallback((params) => {
    // Action logic
    onAction?.(params);
  }, [onAction]);
  
  // Early returns for loading/error states
  if (!requiredProp) {
    return <div className="component-error">Missing required data</div>;
  }
  
  return (
    <div className="component-name" {...restProps}>
      {/* Component JSX */}
    </div>
  );
});

export { ComponentName };
```

### Styling Guidelines

#### CSS Class Naming Convention
```css
/* Component-based naming */
.component-name { }                    /* Root component class */
.component-name__element { }           /* BEM-style element */
.component-name--modifier { }          /* BEM-style modifier */

/* State classes */
.component-name.is-active { }          /* Active state */
.component-name.is-loading { }         /* Loading state */
.component-name.is-disabled { }        /* Disabled state */

/* Responsive modifiers */
.component-name.mobile { }             /* Mobile-specific styles */
.component-name.desktop { }            /* Desktop-specific styles */
```

#### CSS Variables Usage
```css
.your-component {
  /* Use defined variables */
  padding: var(--spacing-md);
  color: var(--text-primary);
  background: var(--background-light);
  
  /* Custom component variables */
  --component-height: 48px;
  --component-border-radius: 8px;
}
```

### Performance Guidelines

#### Component Optimization
```jsx
// 1. Memo for expensive components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* Complex rendering */}</div>;
});

// 2. Callback memoization
const handleClick = useCallback((id) => {
  onItemClick(id);
}, [onItemClick]);

// 3. Value memoization
const filteredData = useMemo(() => {
  return data.filter(item => item.visible);
}, [data]);

// 4. Conditional rendering optimization
{items.length > 0 && (
  <div className="items-container">
    {items.map(item => <Item key={item.id} data={item} />)}
  </div>
)}
```

## 🎣 Custom Hooks Development

### Hook Structure Template

```javascript
import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * useCustomHook - Hook description and purpose
 * 
 * @param {any} initialValue - Initial value parameter
 * @returns {Object} Hook return object
 */
export function useCustomHook(initialValue) {
  // State management
  const [state, setState] = useLocalStorage('hookKey', initialValue);
  const [loading, setLoading] = useState(false);
  
  // Computed values
  const computedValue = useMemo(() => {
    return state.map(item => ({ ...item, computed: true }));
  }, [state]);
  
  // Actions
  const addItem = useCallback((item) => {
    setState(prev => [...prev, { ...item, id: Date.now() }]);
  }, [setState]);
  
  const removeItem = useCallback((id) => {
    setState(prev => prev.filter(item => item.id !== id));
  }, [setState]);
  
  // Return interface
  return {
    // State
    items: state,
    computedValue,
    loading,
    
    // Actions
    addItem,
    removeItem,
    
    // Utilities
    hasItems: state.length > 0
  };
}
```

### Hook Testing Guidelines

```javascript
// hooks/__tests__/useCustomHook.test.js
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useCustomHook([]));
    
    expect(result.current.items).toEqual([]);
    expect(result.current.hasItems).toBe(false);
  });
  
  test('should add item correctly', () => {
    const { result } = renderHook(() => useCustomHook([]));
    
    act(() => {
      result.current.addItem({ name: 'Test Item' });
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.hasItems).toBe(true);
  });
});
```

## 🔧 API Integration Patterns

### Service Layer Pattern

```javascript
// services/BaseService.js
export class BaseService {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.options = {
      timeout: 10000,
      retries: 3,
      ...options
    };
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...this.options,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }
}

// services/OpenAIService.js
import { BaseService } from './BaseService';

export class OpenAIService extends BaseService {
  constructor(apiKey) {
    super('https://api.openai.com/v1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }
  
  async sendMessage(messages, model, options = {}) {
    const payload = {
      model,
      messages: this.prepareMessages(messages),
      ...options
    };
    
    return await this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}
```

### Error Handling Pattern

```javascript
// utils/errorHandler.js
export class AppError extends Error {
  constructor(message, type = 'GENERAL', details = {}) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleAPIError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError('Network connection failed', 'NETWORK_ERROR');
  }
  
  if (error.status === 401) {
    return new AppError('Invalid API key', 'AUTH_ERROR');
  }
  
  if (error.status === 429) {
    return new AppError('Rate limit exceeded', 'RATE_LIMIT');
  }
  
  return new AppError('Unexpected error occurred', 'UNKNOWN_ERROR', { originalError: error });
};

// In components
const handleSendMessage = async (content) => {
  try {
    setLoading(true);
    await sendMessage(content);
  } catch (error) {
    const appError = handleAPIError(error);
    setError(appError.message);
    console.error('Send message failed:', appError);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Styling Development

### CSS Architecture Guidelines

#### Variable System
```css
/* base.css - Define system variables */
:root {
  /* Color Palette */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-active: #1e40af;
  
  /* Spacing System (8px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  
  /* Component Tokens */
  --input-height: 48px;
  --button-height: 40px;
  --modal-width: 600px;
  --sidebar-width: 320px;
}
```

#### Component Styles
```css
/* Component-specific file: sidebar.css */
.sidebar {
  /* Layout */
  width: var(--sidebar-width);
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  /* Theme */
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  
  /* Performance */
  contain: layout style;
  transform: translateZ(0);
}

.sidebar__header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

/* State variations */
.sidebar--collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar--mobile {
  position: fixed;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar--mobile.is-open {
  transform: translateX(0);
}
```

### Responsive Design Guidelines

```css
/* Mobile-first approach */
.component {
  /* Base mobile styles */
  padding: var(--space-2);
  font-size: var(--text-sm);
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  .component {
    padding: var(--space-4);
    font-size: var(--text-base);
  }
}

/* Desktop breakpoint */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
}

/* Container queries (when supported) */
@container (min-width: 400px) {
  .component {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## 🧪 Testing Guidelines

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Component Testing Template

```javascript
// components/__tests__/ComponentName.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    requiredProp: 'test value',
    onAction: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correctly with required props', () => {
    render(<ComponentName {...defaultProps} />);
    
    expect(screen.getByText('test value')).toBeInTheDocument();
  });
  
  test('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<ComponentName {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /action/i });
    await user.click(button);
    
    expect(defaultProps.onAction).toHaveBeenCalledWith(expect.any(Object));
  });
  
  test('handles async operations', async () => {
    render(<ComponentName {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

### Hook Testing Template

```javascript
// hooks/__tests__/useCustomHook.test.js
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('useCustomHook', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
  });
  
  test('initializes with default state', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
  
  test('adds item correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.addItem({ name: 'Test' });
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ name: 'Test' });
  });
});
```

## 🚀 Build & Deployment

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite",                          // Start dev server
    "build": "vite build",                  // Production build
    "preview": "vite preview",              // Preview build
    "lint": "eslint src --ext .js,.jsx",    // Lint code
    "lint:fix": "eslint src --ext .js,.jsx --fix",  // Fix linting issues
    "test": "vitest",                       // Run tests
    "test:ui": "vitest --ui",               // Test UI
    "test:coverage": "vitest --coverage"    // Coverage report
  }
}
```

### Build Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Build optimization
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
          'highlight-vendor': ['react-syntax-highlighter'],
          'openai-vendor': ['openai']
        }
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: true
  },
  
  // Development configuration
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@styles': '/src/styles'
    }
  }
});
```

### Environment Configuration

```bash
# .env.local (gitignored)
VITE_OPENAI_API_KEY=your_development_api_key
VITE_APP_NAME=ChatBot React Dev
VITE_DEBUG_MODE=true

# .env.production
VITE_APP_NAME=ChatBot React
VITE_DEBUG_MODE=false
```

### Deployment Guidelines

#### Static Hosting (Netlify, Vercel)
```bash
# Build for production
npm run build

# Deploy dist folder
# Configure environment variables in hosting platform
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Debugging Guidelines

### Browser DevTools Usage

#### React DevTools
```javascript
// Component debugging
console.log('Component state:', state);
console.log('Props received:', props);

// Performance profiling
React.unstable_Profiler('ComponentName', (id, phase, actualDuration) => {
  console.log('Render performance:', { id, phase, actualDuration });
});
```

#### Network Debugging
```javascript
// API request debugging
const debugAPICall = async (endpoint, options) => {
  console.group(`API Call: ${endpoint}`);
  console.log('Request:', options);
  
  try {
    const response = await fetch(endpoint, options);
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
};
```

### Common Debugging Scenarios

#### State Issues
```javascript
// Debug state updates
useEffect(() => {
  console.log('State changed:', { prev: prevState, current: currentState });
}, [currentState]);

// Debug render cycles
console.log('Component rendering:', { props, state, timestamp: Date.now() });
```

#### Performance Issues
```javascript
// Measure component render time
const renderStart = performance.now();
// Component render
const renderEnd = performance.now();
console.log(`Render time: ${renderEnd - renderStart}ms`);

// Debug expensive operations
const expensiveOperation = useMemo(() => {
  console.time('Expensive Operation');
  const result = doExpensiveWork(data);
  console.timeEnd('Expensive Operation');
  return result;
}, [data]);
```

## 🤝 Contributing Guidelines

### Code Style Standards

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    files: ['src/**/*.{js,jsx}'],
    rules: {
      'react/prop-types': 'warn',
      'react/display-name': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'warn',
      'no-unused-vars': 'error'
    }
  }
];
```

#### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

This development guide provides comprehensive guidelines for contributing to and extending the ChatBot React application.
