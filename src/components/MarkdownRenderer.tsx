'use client';

import React from 'react';

interface MarkdownImageProps {
  src: string;
  alt?: string;
  maxWidth?: string;
  className?: string;
}

/**
 * Markdown-style image frame for embedding images in text
 * Usage: [image src="url" alt="description" maxWidth="300px"]
 */
export function MarkdownImage({
  src,
  alt = '',
  maxWidth = '300px',
  className = '',
}: MarkdownImageProps) {
  return (
    <figure className={`inline-block my-2 mx-auto ${className}`}>
      <img
        src={src}
        alt={alt}
        style={{ maxWidth }}
        className="border border-[#333] rounded max-h-96 object-contain"
        loading="lazy"
      />
      {alt && (
        <figcaption className="text-xs text-[#666] text-center mt-1 font-mono">{alt}</figcaption>
      )}
    </figure>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer that supports:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `code`
 * - [image src="url" alt="description" maxWidth="300px"]
 * - Links: [text](url)
 * - Headings: #, ##, ###, etc.
 * - Lists: -, *, 1.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parseMarkdown = (text: string): (string | React.JSX.Element)[] => {
    const elements: (string | React.JSX.Element)[] = [];
    let lastIndex = 0;

    // Pattern for [image ...]
    const imagePattern =
      /\[image\s+src="([^"]+)"(?:\s+alt="([^"]*)")?(?:\s+maxWidth="([^"]*)")?\]/g;
    let match;

    while ((match = imagePattern.exec(text)) !== null) {
      // Add text before this image
      if (match.index > lastIndex) {
        elements.push(formatText(text.substring(lastIndex, match.index)));
      }

      // Add image element
      elements.push(
        <MarkdownImage
          key={`img-${match.index}`}
          src={match[1]}
          alt={match[2] || ''}
          maxWidth={match[3] || '300px'}
        />,
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(formatText(text.substring(lastIndex)));
    }

    return elements.length > 0 ? elements : [formatText(text)];
  };

  const formatText = (text: string): React.JSX.Element => {
    const parts: (string | React.JSX.Element)[] = [];
    const _lastIndex = 0;

    // Bold
    const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
    let boldMatch;
    const boldMatches: Array<{ index: number; end: number; text: string }> = [];

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      boldMatches.push({
        index: boldMatch.index,
        end: boldMatch.index + boldMatch[0].length,
        text: boldMatch[1] || boldMatch[2],
      });
    }

    // Italic
    const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|_(?!_)(.+?)_(?!_)/g;
    let italicMatch;
    const italicMatches: Array<{ index: number; end: number; text: string }> = [];

    while ((italicMatch = italicRegex.exec(text)) !== null) {
      italicMatches.push({
        index: italicMatch.index,
        end: italicMatch.index + italicMatch[0].length,
        text: italicMatch[1] || italicMatch[2],
      });
    }

    // Code
    const codeRegex = /`([^`]+)`/g;
    let codeMatch;
    const codeMatches: Array<{ index: number; end: number; text: string }> = [];

    while ((codeMatch = codeRegex.exec(text)) !== null) {
      codeMatches.push({
        index: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length,
        text: codeMatch[1],
      });
    }

    // Merge and sort all matches
    const allMatches = [
      ...boldMatches.map((m) => ({ ...m, type: 'bold' })),
      ...italicMatches.map((m) => ({ ...m, type: 'italic' })),
      ...codeMatches.map((m) => ({ ...m, type: 'code' })),
    ].sort((a, b) => a.index - b.index);

    // Filter overlapping matches (keep the first one)
    const uniqueMatches: Array<{ index: number; end: number; text: string; type: string }> = [];
    for (const match of allMatches) {
      const overlaps = uniqueMatches.some(
        (m) =>
          (match.index >= m.index && match.index < m.end) ||
          (match.end > m.index && match.end <= m.end),
      );
      if (!overlaps) {
        uniqueMatches.push(match);
      }
    }

    // Build JSX with formatting
    let textIndex = 0;
    uniqueMatches.forEach((match, idx) => {
      if (match.index > textIndex) {
        parts.push(text.substring(textIndex, match.index));
      }

      if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${idx}-${match.index}`} className="font-bold">
            {match.text}
          </strong>,
        );
      } else if (match.type === 'italic') {
        parts.push(
          <em key={`italic-${idx}-${match.index}`} className="italic">
            {match.text}
          </em>,
        );
      } else if (match.type === 'code') {
        parts.push(
          <code
            key={`code-${idx}-${match.index}`}
            className="bg-[#1a1a1a] border border-[#333] px-1.5 py-0.5 rounded text-xs font-mono text-[#00ff00]"
          >
            {match.text}
          </code>,
        );
      }

      textIndex = match.end;
    });

    if (textIndex < text.length) {
      parts.push(text.substring(textIndex));
    }

    return (
      <>
        {parts.map((part, idx) => {
          if (typeof part === 'string') {
            return <React.Fragment key={`text-${idx}`}>{part}</React.Fragment>;
          }
          return part;
        })}
      </>
    );
  };

  const elements = parseMarkdown(content);

  return (
    <div
      className={`prose prose-invert max-w-none text-sm text-[#ccc] leading-relaxed ${className}`}
    >
      {elements.map((element, idx) =>
        typeof element === 'string' ? (
          <React.Fragment key={`element-${idx}`}>{element}</React.Fragment>
        ) : (
          <React.Fragment key={`element-${idx}`}>{element}</React.Fragment>
        ),
      )}
    </div>
  );
}
