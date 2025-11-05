'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from 'reaflow';
import dynamic from 'next/dynamic';
import FileTree, { TreeItem } from './components/FileTree';
import FileDetails from './components/FileDetails';

// Zoom/Pan (client-only)
const TransformWrapper = dynamic(
  () => import('react-zoom-pan-pinch').then(m => m.TransformWrapper),
  { ssr: false }
);
const TransformComponent = dynamic(
  () => import('react-zoom-pan-pinch').then(m => m.TransformComponent),
  { ssr: false }
);

type RawGraph = { nodes: any[]; edges: any[] };
const isDirId = (id: string) => id.startsWith('dir:');

// Padding (pixels) we’ll add around the measured bbox before fitting
const FIT_PADDING = { x: 80, y: 80 };
// Clamp initial scale so text stays readable
const MIN_FIT_SCALE = 0.06;
const MAX_FIT_SCALE = 1.2;

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [raw, setRaw] = useState<RawGraph>({ nodes: [], edges: [] });
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [detailsPath, setDetailsPath] = useState<string | null>(null);

  // We’ll store latest laid-out nodes (x/y/width/height) here
  const layoutMapRef = useRef<Map<string, any>>(new Map());

  // The container holding the zoom canvas (we read its client size)
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Values we compute to *fit* the graph in view
  const [fit, setFit] = useState<{
    scale: number;
    posX: number;
    posY: number;
    // changing this key forces TransformWrapper to remount and apply new initial* props
    key: string;
  }>({ scale: 0.9, posX: 0, posY: 0, key: 'init' });

  // Load graph.json
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/graph.json', { cache: 'no-store' });
        const json = await res.json();
        setRaw(json);
      } catch (err) {
        console.error('Failed to load graph.json:', err);
      }
    })();
  }, []);

  // label -> id
  const labelToId = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of raw.nodes ?? []) {
      const label = String(n.label ?? '').replace(/\\/g, '/');
      if (label) m.set(label, String(n.id));
    }
    return m;
  }, [raw]);

  // file -> parent dir
  const parentOfFile = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of raw.edges ?? []) {
      if (e.type === 'child' && String(e.to).startsWith('file:') && String(e.from).startsWith('dir:')) {
        map.set(String(e.to), String(e.from));
      }
    }
    return map;
  }, [raw]);

  // Sidebar tree
  const treeItems: TreeItem[] = useMemo(() => {
    return (raw.nodes ?? [])
      .filter(n => n.label)
      .map(n => ({
        path: String(n.label).replace(/\\/g, '/'),
        isDir: String(n.id).startsWith('dir:'),
      }));
  }, [raw]);

  const filename = (p: string) => {
    const parts = p.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || p;
  };

  // Nodes
  const allNodes = useMemo(() => {
    return (raw.nodes ?? []).map((n: any) => {
      const isDir = String(n.id).startsWith('dir:');
      const text = isDir ? `📁 ${filename(String(n.label ?? n.id))}` : filename(String(n.label ?? n.id));
      return {
        id: String(n.id),
        text,
        width: Math.min(260, Math.max(140, text.length * 7)),
        height: isDir ? 38 : 46,
      };
    });
  }, [raw]);

  // Edges
  const allEdges = useMemo(() => {
    return (raw.edges ?? []).map((e: any, i: number) => ({
      id: `${e.from}->${e.to}:${i}`,
      from: String(e.from),
      to: String(e.to),
      type: e.type,
    }));
  }, [raw]);

  // Focus logic (subtree)
  const { nodes, edges } = useMemo(() => {
    if (!focusedId) return { nodes: allNodes, edges: allEdges };

    const buildSubtree = (root: string) => {
      const childEdges = allEdges.filter(e => e.type === 'child');
      const toChildren = new Map<string, string[]>();
      for (const e of childEdges) {
        const arr = toChildren.get(e.from) ?? [];
        arr.push(e.to);
        toChildren.set(e.from, arr);
      }
      const keep = new Set<string>([root]);
      const q = [root];
      while (q.length) {
        const cur = q.shift()!;
        for (const c of toChildren.get(cur) ?? []) {
          if (!keep.has(c)) { keep.add(c); q.push(c); }
        }
      }
      return {
        nodes: allNodes.filter(n => keep.has(n.id)),
        edges: allEdges.filter(e => keep.has(e.from) && keep.has(e.to)),
      };
    };

    if (isDirId(focusedId)) return buildSubtree(focusedId);
    const parent = parentOfFile.get(focusedId);
    return parent ? buildSubtree(parent) : { nodes: allNodes, edges: allEdges };
  }, [focusedId, allNodes, allEdges, parentOfFile]);

  // Sidebar click
  const handleSelect = (path: string, kind: 'dir' | 'file') => {
    const id = labelToId.get(path.replace(/\\/g, '/'));
    if (!id) return;
    setFocusedId(id);
    setDetailsPath(kind === 'file' ? path : null);
  };

  // Zoom configs
  const dblClickCfg = useMemo(() => ({ disabled: false, mode: 'zoomIn' as const }), []);
  const wheelCfg = useMemo(() => ({ step: 0.005, smoothStep: 0.002, activationKeys: [] }), []);
  const panCfg = useMemo(() => ({ velocityDisabled: true }), []);
  const pinchCfg = useMemo(() => ({ step: 5 }), []);

  // When layout changes (or focus changes), compute a fit-to-view transform
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    // read latest laid-out nodes
    const laidOut = layoutMapRef.current;
    if (!laidOut || laidOut.size === 0) return;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    laidOut.forEach((n) => {
      const x0 = n.x ?? 0;
      const y0 = n.y ?? 0;
      const w = n.width ?? 0;
      const h = n.height ?? 0;
      minX = Math.min(minX, x0);
      minY = Math.min(minY, y0);
      maxX = Math.max(maxX, x0 + w);
      maxY = Math.max(maxY, y0 + h);
    });

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return;

    const gWidth = (maxX - minX) + FIT_PADDING.x * 2;
    const gHeight = (maxY - minY) + FIT_PADDING.y * 2;

    const viewW = el.clientWidth;
    const viewH = el.clientHeight;

    // Compute scale so entire bbox fits
    const scale = Math.max(
      MIN_FIT_SCALE,
      Math.min(MAX_FIT_SCALE, Math.min(viewW / gWidth, viewH / gHeight))
    );

    // Position so graph bbox is centered
    const posX = -((minX - FIT_PADDING.x) * scale) + (viewW - gWidth * scale) / 2;
    const posY = -((minY - FIT_PADDING.y) * scale) + (viewH - gHeight * scale) / 2;

    // Force TransformWrapper to remount with these initial values
    setFit({
      scale,
      posX,
      posY,
      key: `fit-${focusedId ?? 'all'}-${nodes.length}-${edges.length}-${Math.round(scale * 1000)}`,
    });
  }, [focusedId, nodes.length, edges.length]);

  if (!mounted) {
    return <div style={{ height: '100vh', width: '100vw', background: '#0f1115' }} />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: '1px solid #232833',
          background: '#0e1117',
          color: '#e5e7eb',
          overflowY: 'auto',
        }}
      >
        <FileTree items={treeItems} onSelect={handleSelect} />
      </aside>

      {/* Graph region */}
      <main
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateRows: '44px 1fr',
          background: '#0f1115',
          overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: '1px solid #232833',
            gap: 8,
          }}
        >
          <span style={{ opacity: 0.9 }}>
            {focusedId ? (isDirId(focusedId) ? 'Folder subtree' : 'Focused file view') : 'Full view'}
          </span>
          {(focusedId || detailsPath) && (
            <button
              onClick={() => { setFocusedId(null); setDetailsPath(null); }}
              style={btnStyle}
            >
              Clear focus
            </button>
          )}
        </div>

        {/* Zoom/canvas viewport */}
        <div ref={viewportRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          <TransformWrapper
            // remount when fit changes so new initial values apply
            key={fit.key}
            minScale={0.05}
            maxScale={2.5}
            initialScale={fit.scale}
            initialPositionX={fit.posX}
            initialPositionY={fit.posY}
            centerOnInit={false}
            doubleClick={dblClickCfg}
            wheel={wheelCfg}
            panning={panCfg}
            pinch={pinchCfg}
            limitToBounds={false}
          >
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#0f1115',
              }}
              contentStyle={{ width: 'max-content', height: 'max-content' }}
            >
              <Canvas
                key={`c-${focusedId ?? 'all'}-${nodes.length}-${edges.length}`}
                direction="RIGHT"
                layoutOptions={{
                    'elk.algorithm': 'layered',
                    'elk.direction': 'RIGHT',
                    'elk.edgeRouting': 'SPLINES',
                    // tighten spacing a bit (tweak to taste)
                    'elk.spacing.nodeNode': '28',
                    'elk.layered.spacing.nodeNodeBetweenLayers': '96',
                    'elk.layered.considerModelOrder': 'true'
                  }}
                nodes={nodes as any}
                edges={edges as any}
                readonly
                animated
                onLayoutChange={(layout: any) => {
                  const pos = new Map<string, any>();
                  layout?.nodes?.forEach((n: any) => pos.set(n.id, n));
                  layoutMapRef.current = pos;
                  // The effect above (that computes fit) will run after this re-render.
                }}
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Floating Details overlay */}
          {detailsPath && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 360,
                height: '100%',
                background: '#111827',
                borderLeft: '1px solid #232833',
                overflowY: 'auto',
                zIndex: 40,
                boxShadow: '-4px 0 8px rgba(0,0,0,0.4)',
              }}
            >
              <FileDetails path={detailsPath} onClose={() => setDetailsPath(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #2b3140',
  background: '#1f2937',
  color: '#e5e7eb',
  cursor: 'pointer',
};
