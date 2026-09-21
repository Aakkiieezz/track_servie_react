export interface EditResult {
    value: string;
    selectionStart: number;
    selectionEnd: number;
}

interface Edit {
    pos: number; // where in the ORIGINAL string
    del: number; // how many characters to delete
    ins: string; // what to insert
}

interface Segment {
    start: number;
    end: number;
}

/* ---------- small string helpers ---------- */

const lineStartOf = (value: string, pos: number): number =>
    pos <= 0 ? 0 : value.lastIndexOf('\n', pos - 1) + 1;

const lineEndOf = (value: string, pos: number): number => {
    const i = value.indexOf('\n', pos);
    return i === -1 ? value.length : i;
};

const countRun = (text: string, char: string, fromEnd: boolean): number => {
    let n = 0;
    while (n < text.length && text[fromEnd ? text.length - 1 - n : n] === char) n++;
    return n;
};

/** Blockquote prefix at the start of a line, e.g. "> " or "> > " */
const QUOTE_PREFIX = /^(?:>[ \t]?)*/;

/* ---------- inline formatting (bold, italic, spoiler) ---------- */

/**
 * Is [start, end) already wrapped by the marker from the outside?  e.g. **|text|**
 * "*" is shared by bold (**) and italic (*): a run of 1 or 3 stars means italic is on.
 */
const isOutsideWrapped = (value: string, start: number, end: number, marker: string): boolean => {
    const before = value.slice(0, start);
    const after = value.slice(end);
    if (!before.endsWith(marker) || !after.startsWith(marker))
        return false;
    if (marker !== '*')
        return true;
    return Math.min(countRun(before, '*', true), countRun(after, '*', false)) % 2 === 1;
};

/** Does the selected text itself start and end with the marker? e.g. |**text**| */
const isInsideWrapped = (text: string, marker: string): boolean => {
    if (text.length <= marker.length * 2)
        return false;
    if (!text.startsWith(marker) || !text.endsWith(marker))
        return false;
    if (marker !== '*')
        return true;
    return Math.min(countRun(text, '*', true), countRun(text, '*', false)) % 2 === 1;
};

/**
 * Splits the selection into one segment per line. Markdown emphasis can't span a blank line,
 * and blockquote prefixes ("> ") must stay outside the markers, so each line is wrapped on its own.
 * Leading/trailing whitespace is left outside the markers ("** bold **" would not render).
 */
const getSegments = (value: string, start: number, end: number): Segment[] => {
    const segments: Segment[] = [];
    let lineStart = lineStartOf(value, start);

    while (lineStart <= end) {
        const lineEnd = lineEndOf(value, lineStart);
        const prefixLength = QUOTE_PREFIX.exec(value.slice(lineStart, lineEnd))![0].length;

        let a = Math.max(start, lineStart + prefixLength);
        let b = Math.min(end, lineEnd);
        while (a < b && /\s/.test(value[a])) a++;
        while (b > a && /\s/.test(value[b - 1])) b--;
        if (a < b) segments.push({ start: a, end: b });

        if (lineEnd >= value.length)
            break;

        lineStart = lineEnd + 1;
    }
    return segments;
};

/** Applies edits (positions refer to the original string) and maps the selection across them. */
const applyEdits = (value: string, edits: Edit[], selStart: number, selEnd: number): EditResult => {
    const sorted = [...edits].sort((a, b) => b.pos - a.pos);
    let out = value;
    for (const ed of sorted)
        out = out.slice(0, ed.pos) + ed.ins + out.slice(ed.pos + ed.del);

    const shift = (p: number, isStart: boolean): number =>
        edits.reduce((acc, ed) => {
            const delta = ed.ins.length - ed.del;
            const applies =
                ed.del > 0
                    ? ed.pos + ed.del <= p
                    : ed.pos < p || (isStart && ed.pos === p);
            return applies ? acc + delta : acc;
        }, p);

    return { value: out, selectionStart: shift(selStart, true), selectionEnd: shift(selEnd, false) };
};

/**
 * Toggles an inline marker (** bold, * italic, || spoiler) around the selection.
 * - nothing selected: inserts marker + placeholder + marker, with the placeholder selected
 * - already wrapped: removes the markers
 */
export function toggleInline(
    value: string,
    start: number,
    end: number,
    marker: string,
    placeholder: string
): EditResult {
    const m = marker.length;
    const segments = getSegments(value, start, end);

    // Nothing (or only whitespace) selected
    if (segments.length === 0) {
        if (start === end && isOutsideWrapped(value, start, end, marker)) {
            const caret = start - m;
            return {
                value: value.slice(0, caret) + value.slice(end + m),
                selectionStart: caret,
                selectionEnd: caret,
            };
        }
        return {
            value: value.slice(0, start) + marker + placeholder + marker + value.slice(end),
            selectionStart: start + m,
            selectionEnd: start + m + placeholder.length,
        };
    }

    const outside = (s: Segment) => isOutsideWrapped(value, s.start, s.end, marker);
    const inside = (s: Segment) => isInsideWrapped(value.slice(s.start, s.end), marker);
    const active = (s: Segment) => outside(s) || inside(s);
    const allActive = segments.every(active);

    const edits: Edit[] = [];
    for (const seg of segments)
        if (allActive) {
            if (outside(seg))
                edits.push({ pos: seg.start - m, del: m, ins: '' }, { pos: seg.end, del: m, ins: '' });
            else
                edits.push({ pos: seg.start, del: m, ins: '' }, { pos: seg.end - m, del: m, ins: '' });
        } else if (!active(seg))
            edits.push({ pos: seg.start, del: 0, ins: marker }, { pos: seg.end, del: 0, ins: marker });

    const first = segments[0];
    const last = segments[segments.length - 1];
    const result = applyEdits(value, edits, first.start, last.end);
    if (allActive || segments.length === 1)
        return result;

    // Multi-line wrap: select from the first opening marker to the last closing marker,
    // so pressing the button again sees every line as wrapped and toggles them all off.
    return {
        ...result,
        selectionStart: !outside(first) && inside(first) ? result.selectionStart : result.selectionStart - m,
        selectionEnd: !outside(last) && inside(last) ? result.selectionEnd : result.selectionEnd + m,
    };
}

/* ---------- blockquote ---------- */

/** Adds or removes "> " on every line touched by the selection. */
export function toggleQuote(value: string, start: number, end: number): EditResult {
    const firstLineStart = lineStartOf(value, start);
    // If the selection stops right after a newline, don't include the next (untouched) line
    const lastPos = end > start && value[end - 1] === '\n' ? end - 1 : end;
    const lastLineEnd = lineEndOf(value, lastPos);

    const block = value.slice(firstLineStart, lastLineEnd);
    const lines = block.split('\n');
    const allQuoted = lines.every((l) => l.startsWith('>'));

    const newBlock = lines
        .map((l) => (allQuoted ? l.replace(/^> ?/, '') : l.startsWith('>') ? l : '> ' + l))
        .join('\n');

    // A quote needs a blank line after it, otherwise the next line becomes part of the quote
    let after = value.slice(lastLineEnd);
    if (!allQuoted && after.startsWith('\n')) {
        const nextLine = value.slice(lastLineEnd + 1, lineEndOf(value, lastLineEnd + 1));
        if (nextLine.trim() !== '' && !nextLine.startsWith('>'))
            after = '\n' + after;
    }

    const newValue = value.slice(0, firstLineStart) + newBlock + after;

    if (start === end) {
        const caret = Math.max(firstLineStart, start + (newBlock.length - block.length));
        return { value: newValue, selectionStart: caret, selectionEnd: caret };
    }
    return {
        value: newValue,
        selectionStart: firstLineStart,
        selectionEnd: firstLineStart + newBlock.length,
    };
}

/**
 * Enter at the end of a quote line: continue the quote ("> ") on the next line.
 * Enter on an empty quote line: leave the quote (and leave the blank line markdown needs).
 * Returns null when the caret isn't in a quote, so the browser handles Enter normally.
 */
export function continueQuote(value: string, caret: number): EditResult | null {
    const lineStart = lineStartOf(value, caret);
    const lineEnd = lineEndOf(value, caret);
    if (caret !== lineEnd)
        return null;

    const line = value.slice(lineStart, lineEnd);
    const prefix = QUOTE_PREFIX.exec(line)![0];
    if (!prefix) return null;

    if (line.slice(prefix.length).trim() === '')
        return {
            value: value.slice(0, lineStart) + '\n' + value.slice(lineEnd),
            selectionStart: lineStart + 1,
            selectionEnd: lineStart + 1,
        };

    const continuation = prefix.endsWith(' ') ? prefix : prefix + ' ';
    const next = caret + 1 + continuation.length;
    return {
        value: value.slice(0, caret) + '\n' + continuation + value.slice(caret),
        selectionStart: next,
        selectionEnd: next,
    };
}