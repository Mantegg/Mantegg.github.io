import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Formats gamebook text with support for both HTML (from TipTap) and markdown-like styling.
 * Supports:
 * - HTML content from TipTap rich text editor
 * - **bold** text (markdown fallback)
 * - _italic_ or *italic* text (markdown fallback)
 * - Line breaks (\n\n for paragraphs in plain text)
 * 
 * This is rendering only - no game logic.
 */
export function formatText(text: string): React.ReactNode {
  if (!text) return null;

  // Check if text contains HTML tags (from TipTap)
  const hasHtml = /<[^>]+>/.test(text);

  if (hasHtml) {
    // Sanitize and render HTML content
    const sanitized = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'hr',
        'a', 'span', 'div'
      ],
      ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
    });

    return (
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Fallback to markdown-like formatting for plain text
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((paragraph, pIndex) => {
    // Split by single newlines within paragraphs
    const lines = paragraph.split(/\n/);
    
    const formattedLines = lines.map((line, lIndex) => {
      const formatted = formatLine(line);
      return (
        <React.Fragment key={lIndex}>
          {formatted}
          {lIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });

    return (
      <p key={pIndex} className="mb-4 last:mb-0">
        {formattedLines}
      </p>
    );
  });
}

/**
 * Format a single line of text with bold and italic.
 */
function formatLine(text: string): React.ReactNode {
  // Combined regex for bold (**text**) and italic (_text_ or *text*)
  // Process bold first, then italic to avoid conflicts
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Match **bold**, _italic_, or *italic* (but not inside words for single *)
  const regex = /\*\*(.+?)\*\*|_(.+?)_|\*([^*]+?)\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // Bold: **text**
      parts.push(
        <strong key={key++} className="font-bold">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      // Italic: _text_
      parts.push(
        <em key={key++} className="italic">
          {match[2]}
        </em>
      );
    } else if (match[3] !== undefined) {
      // Italic: *text*
      parts.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
