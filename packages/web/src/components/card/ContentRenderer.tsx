/**
 * ContentRenderer - Markdown + KaTeX + Cloze 렌더링
 * Raw 텍스트와 렌더링된 뷰를 토글 가능
 */
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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
 * HTML 태그를 마크다운/HTML 호환 형식으로 변환
 */
function preprocessAnkiHtml(text: string): string {
  let processed = text;

  // <br> 태그를 줄바꿈으로 변환
  processed = processed.replace(/<br\s*\/?>/gi, '\n');

  // &nbsp;를 일반 공백으로 변환
  processed = processed.replace(/&nbsp;/gi, ' ');

  return processed;
}

export function ContentRenderer({
  content,
  className,
  showToggle = true,
  defaultView = 'rendered',
}: ContentRendererProps) {
  const [view, setView] = useState<'rendered' | 'raw'>(defaultView);

  const processedContent = useMemo(() => {
    let processed = content;
    // 1. HTML 전처리 (<br> -> 줄바꿈, &nbsp; -> 공백)
    processed = preprocessAnkiHtml(processed);
    // 2. nid 링크 처리 (마크다운 링크와 충돌 방지를 위해 먼저 처리)
    processed = processNidLinks(processed);
    // 3. Cloze 처리
    processed = processCloze(processed, true);
    // 4. 컨테이너 처리 (:::로 시작하는 블록)
    processed = processContainers(processed);
    return processed;
  }, [content]);

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
          <div className="prose prose-sm dark:prose-invert max-w-none content-rendered">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// 컴팩트 버전 (토글 없이 렌더링만)
export function ContentPreview({ content, className }: { content: string; className?: string }) {
  const processedContent = useMemo(() => {
    let processed = content;
    processed = processCloze(processed, true);
    processed = processContainers(processed);
    return processed;
  }, [content]);

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none content-rendered', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
