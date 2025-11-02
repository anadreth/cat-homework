export type TextWidgetProps = {
  title?: string;
  content: string;
  className?: string;
};

export const TextWidget = (props: TextWidgetProps) => {
  const { title, content = "No content provided", className = "" } = props;

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {title && (
        <h3
          style={{
            marginBottom: '0.75rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#1f2937',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '0.5rem',
          }}
        >
          {title}
        </h3>
      )}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          color: '#4b5563',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {content || 'No content provided'}
      </div>
    </div>
  );
};
