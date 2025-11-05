RepoGraph (monorepo)

Visualize a codebase as an interactive dependency map.
This monorepo contains:

packages/analyzer – walks a repository and extracts nodes/edges

packages/cli – command-line wrapper that writes graph.json

packages/web – Next.js app that renders the graph with pan/zoom, a file tree, and a file details overlay

Works on Windows, macOS, and Linux. Tested with pnpm workspaces.

Quick start
# 1) Install dependencies (root)
pnpm install

# 2) Build analyzer + web (or use dev in step 4)
pnpm -w build

# 3) Generate the graph.json for a repo
#    (Adjust the paths for your machine)
pnpm -F cli start --repo D:\sample-pipeline --out D:\grph-new\packages\web\public\graph.json
# or on *nix: pnpm -F cli start --repo ~/code/sample-pipeline --out ./packages/web/public/graph.json

# 4) Run the web app
pnpm -F web dev
# open http://localhost:3000


If you change the target repo later, re-run step 3 to refresh graph.json.

What you’ll see

Left sidebar: the target repo’s folder structure.

Click a folder → focuses the graph on that subtree.

Click a file → opens a details overlay (right side) for LLM/Copilot-style descriptions (placeholder UI now).

Canvas: a right-to-left graph with edges labelled by relationship (child, imports, etc.).

Zoom: mouse wheel / trackpad.

Pan: click + drag (or trackpad two-finger scroll).

Clear focus: resets to the full view.

Overlay file details: appears on top of the canvas (no page scrolling required).

Packages
packages/analyzer

Exposes a small API used by the CLI to walk files and produce an in-memory graph:

nodes: { id, label } where id is prefixed dir: or file:

edges: { from, to, type } where type ∈ { child, imports, ... }

Output is serialized to graph.json.

packages/cli

Generate the graph file from any repo.

pnpm -F cli start --repo <ABSOLUTE_PATH_TO_REPO> --out <ABSOLUTE_PATH_TO_graph.json>


Common Windows gotchas

Use absolute paths. If you see ENOENT scandir 'D:\sample-pipeline', double-check the folder name.

Escape backslashes in package scripts if you edit them.

Example outputs

{
  "meta": { "repo": "sample-pipeline" },
  "nodes": [],
  "edges": []
}


(Real output includes the full tree; above is just the shape.)

packages/web

Next.js app (App Router) using:

[Reaflow] for graph + ELK layout

react-zoom-pan-pinch for NiFi-style pan/zoom

public/graph.json is read on the client at runtime.

Dev

pnpm -F web dev


Production build

pnpm -F web build && pnpm -F web start

Project scripts

At repo root:

pnpm install                # install all workspaces
pnpm -w build               # build analyzer + web
pnpm -F cli start ...       # run the CLI (see above)
pnpm -F web dev             # run the Next.js app (localhost:3000)
pnpm -F web build           # production build
pnpm -F web start           # serve production build

Configuration & tuning

Open packages/web/app/page.tsx:

Direction: graph flows RIGHT (left→right).

Spacing (ELK):

layoutOptions={{
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.edgeRouting': 'SPLINES',
  'elk.spacing.nodeNode': '28',
  'elk.layered.spacing.nodeNodeBetweenLayers': '96',
  'elk.layered.considerModelOrder': 'true',
}}


Increase/decrease spacing for tighter or looser layouts.

Wide-layer wrapping: extremely wide folders are chunked into sub-columns using tiny “group” nodes to reduce clipping.

const MAX_CHILDREN_PER_GROUP = 8; // lower => more sub-columns


If large folders still look clipped, try 6 or 4.

Pan/Zoom:

minScale={0.15}
maxScale={2.5}
initialScale={0.9}
limitToBounds={false} // infinite plane like NiFi
wheel={{ step: 0.005, smoothStep: 0.002 }}

Known limitations / roadmap

Very large folders can still feel “wide.” The stagger/wrap logic helps, but we plan:

virtualized layers,

collapsible edges (group by type),

“depth limiter” with expand-on-click.

Imports parsing is basic in the sample; extend the analyzer for TS/JS/py/etc. import graph edges.

File Details overlay is LLM-ready but currently a static placeholder—wire your model of choice.

Troubleshooting

ENOENT: no such file or directory, scandir

The CLI was given a bad --repo path. Fix the path (Windows users: ensure the drive/dir exists).

Build warnings like “Unable to snapshot resolve dependencies”

Webpack cache warnings are safe to ignore for dev in this project.

Type errors about alert (older code)

We removed browser-only calls in server paths; if you re-add them, move to client components.

react-zoom-pan-pinch API differences

We target v3.7.x and avoid calling instance methods during mount. If you upgrade, keep centerOnInit={false} and avoid calling zoom methods in onInit.

Graph doesn’t update after repo changes

Re-run the CLI to regenerate graph.json (step 3 above), then refresh the page.

Contributing

Fork + create a feature branch.

Make your changes in analyzer and/or web.

Add a short note to this README if you introduce new options.


PRs welcome!