'use client';
import { useMemo, useState } from 'react';

export type TreeItem = { path: string; isDir: boolean };

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

function buildTree(items: TreeItem[]): TreeNode {
  const root: TreeNode = { name: '', path: '', isDir: true, children: [] };
  const byPath = new Map(items.map(i => [i.path.replace(/\\/g, '/'), i.isDir]));

  for (const item of items) {
    const p = item.path.replace(/\\/g, '/');
    const parts = p.split('/').filter(Boolean);
    let cur = root;
    let acc = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      acc = acc ? `${acc}/${part}` : part;
      const isDir = i < parts.length - 1 || !!byPath.get(acc);
      let next = cur.children!.find(c => c.name === part && c.isDir === isDir);
      if (!next) {
        next = { name: part, path: acc, isDir, children: isDir ? [] : undefined };
        cur.children!.push(next);
      }
      cur = next;
    }
  }

  const sort = (n: TreeNode) => {
    if (n.children) {
      n.children.sort((a, b) =>
        a.isDir === b.isDir ? a.name.localeCompare(b.name) : (a.isDir ? -1 : 1)
      );
      n.children.forEach(sort);
    }
  };
  sort(root);
  return root;
}

function Row({
  node, depth, open, toggle, onSelect,
}: {
  node: TreeNode;
  depth: number;
  open: Set<string>;
  toggle: (p: string) => void;
  onSelect?: (path: string, kind: 'dir' | 'file') => void;
}) {
  const isOpen = open.has(node.path);
  const canToggle = node.isDir && node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.isDir) {
      if (canToggle) toggle(node.path);
      onSelect?.(node.path, 'dir');
    } else {
      onSelect?.(node.path, 'file');
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        title={node.path}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 6px',
          marginLeft: depth * 12,
          cursor: 'pointer',
          borderRadius: 8,
        }}
      >
        <span style={{ width: 14, display: 'inline-block', textAlign: 'center' }}>
          {node.isDir ? (canToggle ? (isOpen ? '▾' : '▸') : '•') : '•'}
        </span>
        <span style={{ opacity: node.isDir ? 0.95 : 0.85 }}>
          {node.isDir ? node.name : node.name}
        </span>
      </div>
      {node.children && isOpen && node.children.map(c =>
        <Row key={c.path} node={c} depth={depth + 1} open={open} toggle={toggle} onSelect={onSelect} />
      )}
    </div>
  );
}

export default function FileTree({
  items,
  onSelect,
}: {
  items: TreeItem[];
  onSelect?: (path: string, kind: 'dir' | 'file') => void;
}) {
  const tree = useMemo(() => buildTree(items), [items]);
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>();
    // open top-level folder(s) by default
    tree.children?.forEach(c => c.isDir && s.add(c.path));
    return s;
  });

  const toggle = (p: string) => {
    setOpen(prev => {
      const n = new Set(prev);
      if (n.has(p)) n.delete(p); else n.add(p);
      return n;
    });
  };

  return (
    <div style={{ fontSize: 14, lineHeight: 1.3 }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #232833', opacity: 0.9 }}>
        <strong>Project files</strong>
        <span style={{ opacity: 0.6 }}> • {items.length}</span>
      </div>
      <div style={{ padding: '6px 4px' }}>
        {tree.children?.map(n => (
          <Row key={n.path} node={n} depth={0} open={open} toggle={toggle} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
