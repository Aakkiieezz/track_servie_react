import React, { useLayoutEffect, useRef, useState } from 'react';
import ReviewText from '@/components/common/ReviewModal/ReviewText';
import { toggleInline, toggleQuote, continueQuote, type EditResult } from './markdownFormat';
import styles from './FormattingTextarea.module.css';

interface FormattingTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

type Mode = 'write' | 'preview';

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl+';

const FormattingTextarea: React.FC<FormattingTextareaProps> = ({ value, onChange, placeholder }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingSelection = useRef<{ start: number; end: number } | null>(null);
    const [mode, setMode] = useState<Mode>('write');
    const [previewHeight, setPreviewHeight] = useState<number | undefined>(undefined);
    const isPreview = mode === 'preview';

    // After React has rendered the new value, put the selection back where the edit wants it
    useLayoutEffect(() => {
        const selection = pendingSelection.current;
        const el = textareaRef.current;
        if (selection && el) {
            el.focus();
            el.setSelectionRange(selection.start, selection.end);
            pendingSelection.current = null;
        }
    }, [value]);

    const showPreview = () => {
        // Give the preview the textarea's current height so the modal doesn't jump
        if (textareaRef.current)
            setPreviewHeight(textareaRef.current.offsetHeight);
        setMode('preview');
    };

    const showWrite = () => {
        setMode('write');
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

    const commit = (result: EditResult) => {
        const el = textareaRef.current;
        if (!el) return;
        if (result.value === el.value) {
            el.setSelectionRange(result.selectionStart, result.selectionEnd);
            return;
        }
        pendingSelection.current = { start: result.selectionStart, end: result.selectionEnd };
        onChange(result.value);
    };

    const run = (edit: (value: string, start: number, end: number) => EditResult) => {
        const el = textareaRef.current;
        if (!el)
            return;
        commit(edit(el.value, el.selectionStart, el.selectionEnd));
    };

    const bold    = () => run((v, s, e) => toggleInline(v, s, e, '**', 'bold text'));
    const italic  = () => run((v, s, e) => toggleInline(v, s, e, '*', 'italic text'));
    const spoiler = () => run((v, s, e) => toggleInline(v, s, e, '||', 'spoiler'));
    const quote   = () => run(toggleQuote);

    // Clears the whole review. Nothing is saved until the modal's Save, so Cancel still brings the old text back.
    const clear = () => {
        pendingSelection.current = { start: 0, end: 0 };
        onChange('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
            const key = e.key.toLowerCase();
            if (key === 'b') {
                e.preventDefault();
                bold();
                return;
            }
            if (key === 'i') {
                e.preventDefault();
                italic();
                return;
            }
        }

        // Enter inside a quote continues it; Enter on an empty quote line leaves it
        if (e.key === 'Enter' &&
            !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey &&
            !e.nativeEvent.isComposing
        ) {
            const el = e.currentTarget;
            if (el.selectionStart !== el.selectionEnd) return;
            const result = continueQuote(el.value, el.selectionStart);
            if (result) {
                e.preventDefault();
                commit(result);
            }
        }
    };

    // Keep the textarea's focus and selection when a toolbar button is pressed
    const keepFocus = (e: React.MouseEvent) => e.preventDefault();

    return (
        <div className={styles.editor}>
            <div className={styles.bar}>
                <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
                    <button
                        type="button"
                        className={styles.toolBtn}
                        title={`Bold (${MOD}B)`}
                        aria-label="Bold"
                        disabled={isPreview}
                        onMouseDown={keepFocus}
                        onClick={bold}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        className={styles.toolBtn}
                        title={`Italic (${MOD}I)`}
                        aria-label="Italic"
                        disabled={isPreview}
                        onMouseDown={keepFocus}
                        onClick={italic}
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolBtn} ${styles.quoteGlyph}`}
                        title="Quote"
                        aria-label="Quote"
                        disabled={isPreview}
                        onMouseDown={keepFocus}
                        onClick={quote}
                    >
                        &ldquo;
                    </button>

                    <span className={styles.divider} aria-hidden="true" />

                    <button
                        type="button"
                        className={styles.toolBtn}
                        title="Hide as spoiler"
                        aria-label="Spoiler"
                        disabled={isPreview}
                        onMouseDown={keepFocus}
                        onClick={spoiler}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="17"
                            height="17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="3" y1="3" x2="21" y2="21" />
                        </svg>
                        <span className={styles.toolLabel}>Spoiler</span>
                    </button>

                    {value.length > 0 && (
                        <>
                            <span className={styles.divider} aria-hidden="true" />

                            <button
                                type="button"
                                className={`${styles.toolBtn} ${styles.clearBtn}`}
                                title="Clear review"
                                aria-label="Clear review"
                                disabled={isPreview}
                                onMouseDown={keepFocus}
                                onClick={clear}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="17"
                                    height="17"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.tabs} role="tablist" aria-label="Editor mode">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isPreview}
                        className={`${styles.tab} ${!isPreview ? styles.tabActive : ''}`}
                        onClick={showWrite}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isPreview}
                        className={`${styles.tab} ${isPreview ? styles.tabActive : ''}`}
                        onClick={showPreview}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Stays mounted (just hidden) so its height and cursor position survive a trip to Preview */}
            <textarea
                ref={textareaRef}
                className={`${styles.textarea} ${isPreview ? styles.hidden : ''}`}
                placeholder={placeholder}
                aria-label="Review"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {isPreview && (
                <div className={styles.preview} style={{ height: previewHeight }} role="tabpanel" aria-label="Review preview">
                    {value.trim() ? (
                        <ReviewText text={value} />
                    ) : (
                        <p className={styles.previewEmpty}>Nothing to preview yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FormattingTextarea;