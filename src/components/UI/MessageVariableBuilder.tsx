import { useRef, useEffect, useCallback } from 'react';
import { Sparkles, RotateCcw, MessageSquare } from 'lucide-react';

interface MessageVariableBuilderProps {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange: (newValue: string) => void;
  defaultMessage: string;
  disabled?: boolean;
}

// ─── Token / Badge helpers ────────────────────────────────────────────────────

const TOKEN_RE = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

const BADGE_BASE =
  'dg-var-badge inline-flex items-center rounded-full text-[11px] font-bold px-2 py-0.5 mx-0.5 select-none align-middle';

function prettyLabel(varName: string): string {
  return varName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function badgeClass(varName: string): string {
  if (varName.startsWith('host')) {
    return 'bg-[#F3E8BC] text-[#172525] border border-[#e5d59e]';
  }
  return 'bg-[#035352]/10 text-[#035352] border border-[#035352]/20';
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function makeBadgeHTML(varName: string): string {
  return (
    `<span ` +
    `class="${BADGE_BASE} ${badgeClass(varName)}" ` +
    `data-var="${varName}" ` +
    `contenteditable="false" ` +
    `style="user-select:none;"` +
    `>${prettyLabel(varName)}</span>`
  );
}

function valueToHTML(raw: string): string {
  const parts: string[] = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index);
    if (textBefore) parts.push(escapeHTML(textBefore));
    parts.push(makeBadgeHTML(match[1]));
    lastIndex = TOKEN_RE.lastIndex;
  }

  const tail = raw.slice(lastIndex);
  if (tail) parts.push(escapeHTML(tail));

  return parts.join('');
}

function htmlToValue(container: HTMLElement): string {
  let result = '';
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const varName = el.getAttribute('data-var');
      if (varName) {
        result += `:${varName}`;
      } else if (el.tagName === 'BR') {
        result += '\n';
      } else {
        result += htmlToValue(el);
      }
    }
  });
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageVariableBuilder({
  label,
  name,
  value,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: _onChange,
  onValueChange,
  defaultMessage,
  disabled = false,
}: MessageVariableBuilderProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const internalChange = useRef(false);

  // Sync external value → editor DOM (skip when change came from inside editor)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    const newHTML = valueToHTML(value || '');
    if (el.innerHTML !== newHTML) {
      el.innerHTML = newHTML;
    }
  }, [value]);

  // Initialise on mount
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = valueToHTML(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Serialise DOM → raw string on every edit
  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    internalChange.current = true;
    onValueChange(htmlToValue(el));
  }, [onValueChange]);

  // Paste: strip HTML, insert plain text only
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Insert a badge at the current caret position
  const insertVariable = useCallback(
    (varName: string) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      const range = sel.getRangeAt(0);

      const badge = document.createElement('span');
      badge.className = `${BADGE_BASE} ${badgeClass(varName)}`;
      badge.setAttribute('data-var', varName);
      badge.setAttribute('contenteditable', 'false');
      badge.style.userSelect = 'none';
      badge.textContent = prettyLabel(varName);

      const spaceAfter = document.createTextNode('\u00A0');

      range.deleteContents();
      range.insertNode(spaceAfter);
      range.insertNode(badge);

      // Move caret after the space
      const newRange = document.createRange();
      newRange.setStartAfter(spaceAfter);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      internalChange.current = true;
      onValueChange(htmlToValue(el));
    },
    [onValueChange]
  );

  // Reset to default message
  const resetToDefault = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = valueToHTML(defaultMessage);
    internalChange.current = true;
    onValueChange(defaultMessage);
  }, [defaultMessage, onValueChange]);

  // Live preview
  const sampleVisitor = 'John Doe';
  const sampleHost = 'Alex Smith';
  const previewMessage = (value || defaultMessage)
    .replace(/:visitor_name/g, sampleVisitor)
    .replace(/\{visitor_name\}/g, sampleVisitor)
    .replace(/:visitor/g, sampleVisitor)
    .replace(/\{visitor\}/g, sampleVisitor)
    .replace(/:host_name/g, sampleHost)
    .replace(/\{host_name\}/g, sampleHost)
    .replace(/:host/g, sampleHost)
    .replace(/\{host\}/g, sampleHost);

  return (
    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
      {/* Header: label + insert buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-extrabold text-[#172525] uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#035352]" />
          <span>{label}</span>
        </label>

        {!disabled && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400">Click to Insert:</span>

            <button
              type="button"
              onClick={() => insertVariable('visitor_name')}
              className="px-2 py-0.5 rounded-full bg-[#035352]/10 text-[#035352] border border-[#035352]/20 hover:bg-[#035352]/20 text-[11px] font-bold transition-all shadow-sm"
              title="Insert :visitor_name"
            >
              Visitor Name
            </button>

            <button
              type="button"
              onClick={() => insertVariable('host_name')}
              className="px-2 py-0.5 rounded-full bg-[#F3E8BC] text-[#172525] border border-[#e5d59e] hover:bg-[#e8da9d] text-[11px] font-bold transition-all shadow-sm"
              title="Insert :host_name"
            >
              Host Name
            </button>

            <button
              type="button"
              onClick={resetToDefault}
              className="flex items-center gap-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              title="Reset to default template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Hidden input so any native form serialisation still works */}
      <input type="hidden" name={name} value={value} readOnly />

      {/* ContentEditable editor */}
      <div
        ref={editorRef}
        id={`msg-editor-${name}`}
        role="textbox"
        aria-label={label}
        aria-multiline="true"
        aria-readonly={disabled}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={defaultMessage}
        className={[
          'w-full min-h-[3.5rem] px-4 py-3 bg-white border border-slate-300 rounded-xl',
          'outline-none text-xs font-bold text-slate-800 leading-relaxed',
          'focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm',
          'dg-msg-editor',
          disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ wordBreak: 'break-word' }}
      />

      {/* Live preview */}
      <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Visitor Screen Preview</span>
        </div>
        <p className="text-xs font-semibold text-slate-700 italic">
          &ldquo;{previewMessage}&rdquo;
        </p>
      </div>

      {/* Placeholder CSS */}
      <style>{`
        .dg-msg-editor:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
