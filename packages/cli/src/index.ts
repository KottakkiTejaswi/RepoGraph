import { analyzeRepo } from "@repograph/analyzer";
import * as fs from "fs";
import * as path from "path";

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

  const graph = await analyzeRepo(repoAbs);

  const outAbs = path.isAbsolute(out) ? out : path.resolve(process.cwd(), out);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, JSON.stringify(graph, null, 2), "utf8");
  console.log(`✅ Graph saved to ${outAbs} (nodes: ${graph.nodes.length}, edges: ${graph.edges.length})`);
}

main().catch(e => {
  console.error("❌ Unhandled error:", e);
  process.exit(1);
});
