"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRepo = analyzeRepo;
const glob_1 = require("glob");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const isCodeFile = (p) => /\.(js|jsx|ts|tsx|py|tsc|tsx)$/i.test(p);
// Build a Python module name from a repo-relative path: "dir/file.py" -> "dir.file"
function pyModuleName(repoRoot, absPath) {
    const rel = path.relative(repoRoot, absPath).replace(/\\/g, "/");
    if (!rel.toLowerCase().endsWith(".py"))
        return null;
    return rel.slice(0, -3).replace(/\//g, ".");
}
async function analyzeRepo(repoRoot) {
    // 1) find all files (case-insensitive)
    const rels = glob_1.glob.sync("**/*", {
        cwd: repoRoot,
        nocase: true,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**", "**/build/**"]
    });
    const absPaths = rels.map(r => path.resolve(repoRoot, r));
    // 2) collect all directories that lead to each file (to emit folder nodes)
    const dirSet = new Set();
    const fileSet = new Set();
    for (const abs of absPaths) {
        const stat = safeStat(abs);
        if (!stat)
            continue;
        if (stat.isDirectory()) {
            dirSet.add(abs);
        }
        else {
            fileSet.add(abs);
            // ensure its ancestors are in dirSet
            let cur = path.dirname(abs);
            while (cur.startsWith(repoRoot)) {
                dirSet.add(cur);
                const parent = path.dirname(cur);
                if (parent === cur)
                    break;
                cur = parent;
            }
        }
    }
    // Ensure repo root included
    dirSet.add(repoRoot);
    const nodes = [];
    const edges = [];
    const dirId = (abs) => `dir:${abs}`;
    const fileId = (abs) => `file:${abs}`;
    const rel = (abs) => path.relative(repoRoot, abs).replace(/\\/g, "/") || ".";
    // 3) emit directory nodes
    const dirs = Array.from(dirSet.values()).sort((a, b) => a.localeCompare(b));
    for (const d of dirs) {
        nodes.push({ id: dirId(d), kind: "dir", label: rel(d) });
    }
    // 4) emit file nodes (only code files or you can include all files)
    const files = Array.from(fileSet.values())
        .filter(isCodeFile) // include only code files; remove this filter to include every file
        .sort((a, b) => a.localeCompare(b));
    for (const f of files) {
        nodes.push({ id: fileId(f), kind: "file", label: rel(f), file: f });
    }
    // 5) tree edges: parent dir -> child dir and parent dir -> file
    for (const d of dirs) {
        const parent = path.dirname(d);
        if (d !== repoRoot && parent && parent !== d && parent.startsWith(repoRoot)) {
            edges.push({ from: dirId(parent), to: dirId(d), type: "child" });
        }
    }
    for (const f of files) {
        const parent = path.dirname(f);
        if (parent && parent.startsWith(repoRoot)) {
            edges.push({ from: dirId(parent), to: fileId(f), type: "child" });
        }
    }
    // 6) Python import edges (optional; keeps your previous behavior)
    const pyModuleToFile = new Map();
    for (const f of files) {
        if (f.toLowerCase().endsWith(".py")) {
            const mod = pyModuleName(repoRoot, f);
            if (mod)
                pyModuleToFile.set(mod, f);
        }
    }
    const FROM_RE = /^\s*from\s+([\w.]+)\s+import\s+([*\w,\s]+)\s*$/gim;
    const IMPORT_RE = /^\s*import\s+([\w.,\s]+)\s*$/gim;
    for (const f of files) {
        if (!f.toLowerCase().endsWith(".py"))
            continue;
        const code = safeRead(f);
        if (code == null)
            continue;
        // from pkg.mod import x, y
        for (const m of code.matchAll(FROM_RE)) {
            const base = (m[1] ?? "").toString();
            const names = (m[2] ?? "").toString().split(",").map(s => s.trim()).filter(Boolean);
            for (const name of names) {
                const exact = pyModuleToFile.get(`${base}.${name}`);
                if (exact)
                    edges.push({ from: fileId(f), to: fileId(exact), type: "imports" });
                else {
                    const baseFile = pyModuleToFile.get(base);
                    if (baseFile)
                        edges.push({ from: fileId(f), to: fileId(baseFile), type: "imports" });
                }
            }
        }
        // import a, b.c
        for (const m of code.matchAll(IMPORT_RE)) {
            const list = (m[1] ?? "").toString().split(",").map(s => s.trim()).filter(Boolean);
            for (const mod of list) {
                const target = pyModuleToFile.get(mod);
                if (target)
                    edges.push({ from: fileId(f), to: fileId(target), type: "imports" });
            }
        }
    }
    return {
        meta: {
            repo: path.basename(repoRoot),
            generatedAt: new Date().toISOString(),
            fileCount: files.length,
            dirCount: dirs.length
        },
        nodes,
        edges
    };
}
function safeStat(p) {
    try {
        return fs.statSync(p);
    }
    catch {
        return null;
    }
}
function safeRead(p) {
    try {
        return fs.readFileSync(p, "utf8");
    }
    catch {
        return null;
    }
}
