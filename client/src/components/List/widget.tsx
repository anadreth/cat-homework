export type ListItem = {
  id: string;
  label: string;
  description?: string;
};

export type ListWidgetProps = {
  title?: string;
  items: ListItem[];
  className?: string;
};

export const ListWidget = (props: ListWidgetProps) => {
  const { title, items = [], className = "" } = props;

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        backgroundColor: '#faf5ff',
        border: '2px solid #c084fc',
        borderRadius: '0.5rem',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {title && (
        <h3
          style={{
            marginBottom: '1rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#7e22ce',
          }}
        >
          {title}
        </h3>
      )}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {items.length === 0 ? (
          <li
            style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#9333ea',
              fontSize: '0.875rem',
            }}
          >
            No items to display
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e9d5ff',
                borderRadius: '0.375rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#7e22ce',
                  marginBottom: item.description ? '0.25rem' : '0',
                }}
              >
                {item.label}
              </div>
              {item.description && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#9333ea',
                  }}
                >
                  {item.description}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
