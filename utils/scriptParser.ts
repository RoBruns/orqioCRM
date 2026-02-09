import { ScriptBlock, ScriptSection, ScriptBlockType } from '../types/ScriptTypes';

export const parseMarkdownToBlocks = (markdown: string): ScriptBlock[] => {
    const lines = markdown.split('\n');
    const blocks: ScriptBlock[] = [];
    let currentId = 0;

    const generateId = () => `block-${Date.now()}-${currentId++}`;

    let currentBlock: ScriptBlock | null = null;
    let insideCodeBlock = false;
    let codeBlockContent = '';
    // let codeBlockLang = ''; // unused for now

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code Blocks
        if (line.trim().startsWith('```')) {
            if (insideCodeBlock) {
                // End of code block
                blocks.push({
                    id: generateId(),
                    type: 'code',
                    content: codeBlockContent.trim()
                });
                codeBlockContent = '';
                insideCodeBlock = false;
            } else {
                // Start of code block
                insideCodeBlock = true;
                // codeBlockLang = line.replace('```', '').trim(); // unused
            }
            continue;
        }

        if (insideCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }

        // Headers
        if (line.startsWith('# ')) {
            blocks.push({ id: generateId(), type: 'h1', content: line.replace('# ', '').trim() });
            continue;
        }
        if (line.startsWith('## ')) {
            blocks.push({ id: generateId(), type: 'h2', content: line.replace('## ', '').trim() });
            continue;
        }
        if (line.startsWith('### ')) {
            blocks.push({ id: generateId(), type: 'h3', content: line.replace('### ', '').trim() });
            continue;
        }

        // Blockquotes / Alerts
        if (line.startsWith('> ')) {
            const content = line.replace('> ', '').trim();
            // Simple heuristic for alerts
            const type = content.includes('⚠️') || content.includes('❌') || content.includes('✅') ? 'alert' : 'blockquote';

            blocks.push({ id: generateId(), type, content });
            continue;
        }

        // Tables (Very basic detection, assuming GFM style)
        if (line.startsWith('|')) {
            // If previous block type matches table, append? For simplicity, let's just treat tables as text blocks that are rendered specially in markdown or proper structured table later.
            // for now, let's treat generic text including tables as 'text' unless we want a specific table editor.
            // The user wants "beautiful steps" and "simple editor". A complex table editor might be too much for now. 
            // Let's treat valid markdown table lines as a 'table' block if possible, or just 'text' that the viewer handles.
            // Actually, let's stick to 'text' for complex things like tables for MVP editor, 
            // BUT the parser needs to identify them to at least keep them together if we were doing block-based editing.
            // For this version, let's aggregate contiguous text lines into one 'text' block to avoid fragmentation.
        }

        // Horizontal Rules
        if (line.trim() === '---' || line.trim() === '***') {
            // Skip or represent as separator? 
            // The step viewer uses H2 as separators.
            continue;
        }

        // Empty lines
        if (line.trim() === '') {
            continue;
        }

        // Text Lines
        // If previous block is text, append to it?
        if (blocks.length > 0 && blocks[blocks.length - 1].type === 'text') {
            blocks[blocks.length - 1].content += '\n' + line;
        } else {
            blocks.push({ id: generateId(), type: 'text', content: line });
        }
    }

    return blocks;
};

export const blocksToMarkdown = (blocks: ScriptBlock[]): string => {
    return blocks.map(block => {
        switch (block.type) {
            case 'h1': return `# ${block.content}\n\n---\n`;
            case 'h2': return `\n---\n\n## ${block.content}\n\n`;
            case 'h3': return `### ${block.content}\n`;
            case 'code': return `\`\`\`\n${block.content}\n\`\`\`\n`;
            case 'blockquote': return `> ${block.content}\n`;
            case 'alert': return `> ${block.content}\n`;
            case 'text': return `${block.content}\n`;
            case 'table': return `${block.content}\n`;
            default: return `${block.content}\n`;
        }
    }).join('\n');
};
