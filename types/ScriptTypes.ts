export type ScriptBlockType = 'h1' | 'h2' | 'h3' | 'text' | 'code' | 'table' | 'blockquote' | 'alert';

export interface ScriptBlock {
    id: string;
    type: ScriptBlockType;
    content: string;
    meta?: any;
}

export interface ScriptSection {
    id: string;
    title: string;
    blocks: ScriptBlock[];
}
