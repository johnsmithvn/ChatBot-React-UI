import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const LazyCodeBlock = ({ language, children, ...props }) => {
  return (
    <SyntaxHighlighter
      style={oneDark}
      language={language}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
};
