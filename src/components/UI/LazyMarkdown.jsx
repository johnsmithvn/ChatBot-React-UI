import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

export const LazyMarkdown = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            return (
              <CodeBlock
                inline={inline}
                className={className}
                language={language}
                {...props}
              >
                {children}
              </CodeBlock>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
