import { useRef } from 'react';
import { User, UserCheck, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';

interface MessageVariableBuilderProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange: (newValue: string) => void;
  defaultMessage: string;
  disabled?: boolean;
}

export default function MessageVariableBuilder({
  label,
  name,
  value,
  onChange,
  onValueChange,
  defaultMessage,
  disabled = false,
}: MessageVariableBuilderProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sample data for real-time visual preview
  const sampleVisitor = 'John Doe';
  const sampleHost = 'Alex Smith';

  // Compute live rendered preview message
  const previewMessage = (value || defaultMessage)
    .replace(/:visitor_name/g, sampleVisitor)
    .replace(/\{visitor_name\}/g, sampleVisitor)
    .replace(/:visitor/g, sampleVisitor)
    .replace(/\{visitor\}/g, sampleVisitor)
    .replace(/:host_name/g, sampleHost)
    .replace(/\{host_name\}/g, sampleHost)
    .replace(/:host/g, sampleHost)
    .replace(/\{host\}/g, sampleHost);

  // Insert variable tag at cursor location
  const insertVariable = (variableTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;

    const currentValue = value || '';
    const newValue =
      currentValue.substring(0, startPos) +
      ` ${variableTag} ` +
      currentValue.substring(endPos);

    onValueChange(newValue);

    // Reposition cursor right after inserted variable
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + variableTag.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
      {/* Label & Variable Chips Header */}
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
              onClick={() => insertVariable(':visitor_name')}
              className="px-2.5 py-1 rounded-lg bg-[#035352]/10 text-[#035352] border border-[#035352]/20 hover:bg-[#035352]/20 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Click to insert Visitor Name placeholder"
            >
              <User className="w-3 h-3" />
              <span>+ Visitor Name</span>
            </button>

            <button
              type="button"
              onClick={() => insertVariable(':host_name')}
              className="px-2.5 py-1 rounded-lg bg-[#F3E8BC] text-[#172525] border border-[#e5d59e] hover:bg-[#e8da9d] text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Click to insert Host Name placeholder"
            >
              <UserCheck className="w-3 h-3 text-[#035352]" />
              <span>+ Host Name</span>
            </button>

            <button
              type="button"
              onClick={() => onValueChange(defaultMessage)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              title="Reset to default template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Message Input Field */}
      <div>
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={2}
          placeholder={defaultMessage}
          className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm resize-none ${
            disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : ''
          }`}
        />
      </div>

      {/* Real-time Rendered Live Preview Box */}
      <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Visitor Screen Preview</span>
        </div>
        <p className="text-xs font-semibold text-slate-700 italic">
          "{previewMessage}"
        </p>
      </div>
    </div>
  );
}
