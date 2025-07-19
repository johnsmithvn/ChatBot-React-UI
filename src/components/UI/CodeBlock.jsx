import { lazy, Suspense } from 'react';

// Lazy load the syntax highlighter
const LazyCodeBlock = lazy(() => import('./LazyCodeBlock').then(module => ({ default: module.LazyCodeBlock })));

// Fallback component for loading state
const CodeBlockFallback = ({ children, className }) => (
  <pre className={`${className} bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto`}>
    <code>{children}</code>
  </pre>
);

export const CodeBlock = ({ inline, className, children, language, ...props }) => {
  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <Suspense fallback={<CodeBlockFallback className={className}>{children}</CodeBlockFallback>}>
      <LazyCodeBlock
        language={language}
        className={className}
        {...props}
      >
        {children}
      </LazyCodeBlock>
    </Suspense>
  );
};
