import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkSpoiler from '@/components/common/ReviewModal/RemarkSpoiler';
import styles from './ReviewText.module.css';

const REMARK_PLUGINS = [remarkBreaks, remarkSpoiler];
const ALLOWED_ELEMENTS = ['p', 'br', 'strong', 'em', 'blockquote', 'span'];

interface SpoilerProps {
    className?: string;
    children?: React.ReactNode;
}

/** Click (or Enter / Space) to reveal. */
const Spoiler: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [revealed, setRevealed] = useState(false);

    const toggle = (e: React.SyntheticEvent) => {
        // The review may sit inside a clickable card or link
        e.preventDefault();
        e.stopPropagation();
        setRevealed((r) => !r);
    };

    return (
        <span
            className={`${styles.spoiler} ${revealed ? styles.revealed : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={revealed}
            aria-label={revealed ? undefined : 'Spoiler, press to reveal'}
            onClick={toggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggle(e);
            }}
        >
            {children}
        </span>
    );
};

const Span: React.FC<SpoilerProps> = ({ className, children }) =>
    className?.includes('spoiler') ? <Spoiler>{children}</Spoiler> : <span>{children}</span>;

interface ReviewTextProps {
    text: string;
    className?: string;
}

const ReviewText: React.FC<ReviewTextProps> = ({ text, className }) => (
    <div className={`${styles.reviewText} ${className ?? ''}`}>
        <ReactMarkdown
            remarkPlugins={REMARK_PLUGINS}
            allowedElements={ALLOWED_ELEMENTS}
            unwrapDisallowed
            skipHtml
            components={{ span: Span }}
        >
            {text}
        </ReactMarkdown>
    </div>
);

export default ReviewText;