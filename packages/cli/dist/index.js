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
const analyzer_1 = require("@repograph/analyzer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    const repoIdx = process.argv.indexOf("--repo");
    const outIdx = process.argv.indexOf("--out");
    const repo = repoIdx >= 0 ? process.argv[repoIdx + 1] : ".";
    const out = outIdx >= 0 ? process.argv[outIdx + 1] : "./graph.json";
    const repoAbs = path.resolve(repo);
    if (!fs.existsSync(repoAbs)) {
        console.error(`❌ Repo path not found: ${repoAbs}`);
        process.exit(1);
    }
    const graph = await (0, analyzer_1.analyzeRepo)(repoAbs);
    const outAbs = path.isAbsolute(out) ? out : path.resolve(process.cwd(), out);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, JSON.stringify(graph, null, 2), "utf8");
    console.log(`✅ Graph saved to ${outAbs} (nodes: ${graph.nodes.length}, edges: ${graph.edges.length})`);
}
main().catch(e => {
    console.error("❌ Unhandled error:", e);
    process.exit(1);
});
