import type { Root, Parent, Text } from 'mdast';

/**
 * Remark plugin: ||hidden text|| -> <span class="spoiler">hidden text</span>
 *
 * Works on the markdown tree instead of the raw string, so a spoiler can contain other
 * formatting (||some **bold** text||) and can span a single line break. Unpaired "||"
 * are left as literal text.
 */

type Child = Parent['children'][number];
type Token = { marker: true } | { marker: false; node: Child };

const MARKER = '||';

const makeText = (value: string): Text => ({ type: 'text', value });

const makeSpoiler = (children: Child[]): Child =>
    ({
        type: 'spoiler', // unknown to mdast, so it is converted using data.hName / hProperties
        data: { hName: 'span', hProperties: { className: ['spoiler'] } },
        children,
    }) as unknown as Child;

const transform = (parent: Parent): void => {
    // Handle nested containers first (emphasis, strong, blockquote, ...)
    for (const child of parent.children)
        if ('children' in child) transform(child as Parent);

    // Split text nodes on "||" into [text, marker, text, ...]
    const tokens: Token[] = [];
    const markerIndexes: number[] = [];
    for (const child of parent.children)
        if (child.type === 'text')
            (child as Text).value.split(MARKER).forEach((part, i) => {
                if (i > 0) {
                    markerIndexes.push(tokens.length);
                    tokens.push({ marker: true });
                }
                if (part) tokens.push({ marker: false, node: makeText(part) });
            });
        else
            tokens.push({ marker: false, node: child });
    if (markerIndexes.length < 2) return;

    // Pair markers in order: 1st with 2nd, 3rd with 4th, ... (an empty pair "||||" stays literal)
    const closeOf = new Map<number, number>();
    for (let i = 0; i + 1 < markerIndexes.length; i += 2) {
        const open = markerIndexes[i];
        const close = markerIndexes[i + 1];
        if (close > open + 1)
            closeOf.set(open, close);
    }
    if (closeOf.size === 0) return;

    const result: Child[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token.marker) {
            result.push(token.node);
            continue;
        }
        const close = closeOf.get(i);
        if (close === undefined) {
            result.push(makeText(MARKER)); // unpaired / empty -> literal
            continue;
        }
        const inner = tokens
            .slice(i + 1, close)
            .map((t) => (t.marker ? makeText(MARKER) : t.node));
        result.push(makeSpoiler(inner));
        i = close;
    }
    parent.children = result;
};

export default function remarkSpoiler() {
    return (tree: Root): void => {
        transform(tree);
    };
}