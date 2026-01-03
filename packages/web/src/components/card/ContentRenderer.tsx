/**
 * ContentRenderer - Anki 카드 HTML + Markdown 렌더링
 * Raw 텍스트와 렌더링된 뷰를 토글 가능
 *
 * Anki 카드는 HTML + Markdown 혼합 형식이므로
 * ReactMarkdown 대신 dangerouslySetInnerHTML 사용
 */
import { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '../../lib/utils';
import { Eye, Code } from 'lucide-react';

// KaTeX CSS
import 'katex/dist/katex.min.css';

interface ContentRendererProps {
  content: string;
  className?: string;
  showToggle?: boolean;
  defaultView?: 'rendered' | 'raw';
}

/**
 * Cloze 삭제 구문 처리
 * {{c1::답변::힌트}} -> [답변] 또는 [...] 형태로 표시
 */
function processCloze(text: string, showAnswer: boolean = true): string {
  // {{c숫자::내용::힌트?}} 패턴
  const clozePattern = /\{\{c(\d+)::([^:}]+)(?:::([^}]+))?\}\}/g;

  return text.replace(clozePattern, (match, num, answer, hint) => {
    if (showAnswer) {
      return `<span class="cloze cloze-${num}" data-cloze="${num}">${answer}</span>`;
    } else {
      return `<span class="cloze cloze-hidden cloze-${num}" data-cloze="${num}">[${hint || '...'}]</span>`;
    }
  });
}

/**
 * ::: 컨테이너 구문을 HTML로 변환
 */
function processContainers(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  const stack: string[] = [];

  for (const line of lines) {
    // 컨테이너 시작: ::: type [title]
    const startMatch = line.match(/^:::\s*(tip|warning|error|note|link|toggle)\s*(.*)$/);
    if (startMatch) {
      const [, type, title] = startMatch;
      const isToggle = type === 'toggle';

      if (isToggle) {
        result.push(`<details class="callout callout-toggle"><summary>${title || 'Toggle'}</summary>`);
      } else {
        result.push(`<div class="callout callout-${type}">`);
        if (title) {
          result.push(`<div class="callout-title">${title}</div>`);
        }
      }
      stack.push(isToggle ? 'details' : 'div');
      continue;
    }

    // 컨테이너 종료: :::
    if (line.match(/^:::$/)) {
      const tag = stack.pop();
      if (tag) {
        result.push(`</${tag}>`);
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * nid 링크 처리
 * [제목|nid1234567890123] -> 클릭 가능한 링크로 변환
 */
function processNidLinks(text: string): string {
  // [제목|nid{13자리}] 패턴
  const nidPattern = /\[([^\]|]+)\|nid(\d{13})\]/g;

  return text.replace(nidPattern, (match, title, nid) => {
    return `<a href="#" class="nid-link" data-nid="${nid}" title="Note ID: ${nid}">${title}</a>`;
  });
}

/**
 * 마크다운 리스트를 HTML로 변환
 * * item -> <li>item</li>
 */
function processMarkdownLists(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 리스트 아이템 감지: * 또는 - 또는 숫자. 으로 시작
    const listMatch = line.match(/^(\s*)(\*|-|\d+\.)\s+(.+)$/);

    if (listMatch) {
      const [, indent, marker, content] = listMatch;
      const currentIndent = indent.length;

      if (!inList) {
        // 새 리스트 시작
        const isOrdered = /^\d+\.$/.test(marker);
        result.push(isOrdered ? '<ol>' : '<ul>');
        inList = true;
        listIndent = currentIndent;
      }

      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        // 리스트 종료
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }

  // 마지막 리스트 닫기
  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

/**
 * 마크다운 헤더를 HTML로 변환
 * ### Header -> <h3>Header</h3>
 */
function processMarkdownHeaders(text: string): string {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content}</h${level}>`;
  });
}

/**
 * 마크다운 구분선을 HTML로 변환
 * --- -> <hr>
 */
function processMarkdownDividers(text: string): string {
  return text.replace(/^-{3,}$/gm, '<hr>');
}

/**
 * 인라인 코드를 HTML로 변환
 * `code` -> <code>code</code>
 */
function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * 이미지 경로를 API 프록시로 변환
 * <img src="file.png"> -> <img src="/api/media/file.png">
 */
function processImages(text: string): string {
  // 이미 절대 URL이 아닌 이미지만 변환
  return text.replace(/<img\s+src="([^"]+)"/gi, (match, src) => {
    // 이미 http/https URL이면 그대로
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/api/')) {
      return match;
    }
    // 상대 경로를 API 프록시로 변환
    return `<img src="/api/media/${encodeURIComponent(src)}"`;
  });
}

/**
 * HTML 태그를 정리
 */
function preprocessAnkiHtml(text: string): string {
  let processed = text;

  // &nbsp;를 일반 공백으로 변환
  processed = processed.replace(/&nbsp;/gi, ' ');

  // <br> 태그를 줄바꿈으로 변환 (컨테이너 파싱을 위해 필요)
  processed = processed.replace(/<br\s*\/?>/gi, '\n');

  // 이스케이프된 <br> 태그도 처리 (&lt;br&gt;)
  processed = processed.replace(/&lt;br&gt;/gi, '\n');

  return processed;
}

/**
 * 전체 처리 파이프라인
 */
function processContent(content: string): string {
  let processed = content;

  // 1. 기본 HTML 전처리
  processed = preprocessAnkiHtml(processed);

  // 2. nid 링크 처리
  processed = processNidLinks(processed);

  // 3. Cloze 처리
  processed = processCloze(processed, true);

  // 4. 마크다운 헤더 -> HTML
  processed = processMarkdownHeaders(processed);

  // 5. 마크다운 구분선 -> HTML
  processed = processMarkdownDividers(processed);

  // 6. 인라인 코드 -> HTML
  processed = processInlineCode(processed);

  // 7. 마크다운 리스트 -> HTML
  processed = processMarkdownLists(processed);

  // 8. 컨테이너 처리
  processed = processContainers(processed);

  // 9. 이미지 경로 변환
  processed = processImages(processed);

  // 10. DOMPurify로 XSS 방지
  processed = DOMPurify.sanitize(processed, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'a', 'img',
      'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub',
      'span', 'div', 'font',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'pre', 'code', 'blockquote',
      'details', 'summary',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style',
      'data-nid', 'data-cloze', 'color',
      'colspan', 'rowspan',
    ],
  });

  return processed;
}

export function ContentRenderer({
  content,
  className,
  showToggle = true,
  defaultView = 'rendered',
}: ContentRendererProps) {
  const [view, setView] = useState<'rendered' | 'raw'>(defaultView);

  const processedContent = useMemo(() => processContent(content), [content]);

  return (
    <div className={cn('relative', className)}>
      {/* 토글 버튼 */}
      {showToggle && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={() => setView('rendered')}
            className={cn(
              'p-1.5 rounded transition-colors',
              view === 'rendered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
            title="렌더링된 뷰"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('raw')}
            className={cn(
              'p-1.5 rounded transition-colors',
              view === 'raw'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
            title="원본 텍스트"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="pt-10">
        {view === 'raw' ? (
          <pre className="text-sm bg-muted p-4 rounded overflow-x-auto whitespace-pre-wrap font-mono">
            {content}
          </pre>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none content-rendered"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        )}
      </div>
    </div>
  );
}

// 컴팩트 버전 (토글 없이 렌더링만)
export function ContentPreview({ content, className }: { content: string; className?: string }) {
  const processedContent = useMemo(() => processContent(content), [content]);

  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none content-rendered', className)}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
