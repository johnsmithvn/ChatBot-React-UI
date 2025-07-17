# CSS Architecture Documentation

## Overview
The CSS has been reorganized into a modular, maintainable structure that eliminates duplicates and organizes styles by functionality.

## File Structure

```
src/styles/
├── index.css          # Main entry point - imports all other files
├── base.css          # Global variables, reset, utilities
├── sidebar.css       # Sidebar layout and navigation
├── chat.css          # Main chat area and input
├── message.css       # Message bubbles and actions
├── modal.css         # Modal components and animations
├── forms.css         # Form inputs and validation
├── workspace.css     # Workspace management
├── template.css      # Template manager
└── settings.css      # Settings modal
```

## Import Structure

```css
src/index.css
└── src/styles/index.css
    ├── base.css
    ├── sidebar.css
    ├── chat.css
    ├── message.css
    ├── modal.css
    ├── forms.css
    ├── workspace.css
    ├── template.css
    └── settings.css
```

## CSS Variables (base.css)

All colors and common values are defined as CSS custom properties:

```css
:root {
  --primary-color: #3b82f6;
  --primary-color-light: #dbeafe;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --background-default: #ffffff;
  --background-light: #f8fafc;
  --border-color: #e5e7eb;
  /* ... */
}
```

## File Responsibilities

### base.css
- CSS custom properties (variables)
- Global reset and normalize
- App layout containers
- Utility classes
- Animation keyframes
- Responsive breakpoints

### sidebar.css
- Sidebar container and layout
- Header and navigation
- Resize handle
- Footer and buttons
- Collapsed state

### chat.css
- Main chat area layout
- Chat header and info
- Messages container
- Input area and form
- Welcome screen
- Empty states

### message.css
- Message containers and bubbles
- Avatar styling
- Message actions
- Typing indicators
- Markdown content
- Timestamps

### modal.css
- Modal overlay and backdrop
- Modal content containers
- Headers and close buttons
- Animations and transitions
- Responsive behavior
- State variations (success, error)

### forms.css
- Form groups and labels
- Input fields and validation
- Buttons and actions
- Checkboxes and radios
- File inputs
- Switch toggles

### workspace.css
- Workspace selector
- Group containers
- Chat lists and items
- Group actions
- Prompt sections
- Help modals

### template.css
- Template manager layout
- Template cards
- Usage modals
- Variable inputs
- Action buttons

### settings.css
- Settings modal layout
- Configuration sections
- API key inputs
- Model selection
- Theme chooser
- Export/import

## Benefits

1. **No Duplicates**: Eliminated all duplicate CSS rules
2. **Modular**: Each file has a clear responsibility
3. **Maintainable**: Easy to find and modify specific styles
4. **Scalable**: Easy to add new components
5. **Consistent**: Centralized variables ensure consistency
6. **Performance**: Better organization can improve CSS parsing

## Responsive Design

All components use consistent breakpoints:
- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`
- Desktop: `min-width: 769px`

## Usage

To modify styles for a specific component:
1. Identify which file contains the component styles
2. Make changes in that specific file
3. Use CSS variables for consistency
4. Follow existing naming conventions

## Migration Notes

- Old `components.css` has been backed up as `components.css.backup`
- All existing class names remain the same
- CSS variables replace hardcoded values
- Responsive styles are consolidated
- Dark mode support is prepared in modal and form components
