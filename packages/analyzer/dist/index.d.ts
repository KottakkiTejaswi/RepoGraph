type NodeT = {
    id: string;
    kind: "dir" | "file";
    label: string;
    file?: string;
};
type EdgeT = {
    from: string;
    to: string;
    type: "child" | "imports";
};
export declare function analyzeRepo(repoRoot: string): Promise<{
    meta: {
        repo: string;
        generatedAt: string;
        fileCount: number;
        dirCount: number;
    };
    nodes: NodeT[];
    edges: EdgeT[];
}>;
export {};
