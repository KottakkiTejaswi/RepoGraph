'use client';
export default function FileDetails({
  path,
  onClose,
}: {
  path: string;
  onClose: () => void;
}) {
  const fileName = path.replace(/\\/g, '/').split('/').pop() || path;

  const describe = () => {
    if (typeof window !== 'undefined') {
      window.alert('Hook this to Copilot/LLM later');
    } else {
      console.log('Hook this to Copilot/LLM later');
    }
  };

  return (
    <div style={{
      width: 360,
      height: '100%',
      borderLeft: '1px solid #232833',
      background: '#0e1117',
      color: '#e5e7eb',
      display: 'grid',
      gridTemplateRows: '44px 1fr',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #232833' }}>
        <div style={{ opacity: 0.85 }}>Details</div>
        <button onClick={onClose}
          style={{ marginLeft: 'auto', background: '#1f2937', color: '#e5e7eb', border: '1px solid #2b3140', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
          Close
        </button>
      </div>
      <div style={{ padding: 12, overflow: 'auto' }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}><strong>{fileName}</strong></div>
        <div style={{ opacity: 0.8, marginBottom: 12 }}>{path}</div>

        <div style={{ background: '#0f1119', border: '1px solid #232833', borderRadius: 8, padding: 12 }}>
          <div style={{ marginBottom: 8, opacity: 0.9 }}>
            <em>AI summary (placeholder):</em>
          </div>
          <div style={{ opacity: 0.8 }}>
            Click “Describe file” to generate a summary of what this file does, key functions/exports,
            and where it’s used. (Wire this button to Copilot/LLM later.)
          </div>
          <button
            style={{ marginTop: 12, background: '#1f2937', color: '#e5e7eb', border: '1px solid #2b3140', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
            onClick={describe}
          >
            Describe file
          </button>
        </div>
      </div>
    </div>
  );
}
