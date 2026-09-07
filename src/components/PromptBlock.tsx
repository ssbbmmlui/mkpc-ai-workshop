import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PromptBlockProps {
  text: string;
  label: string;
  maxHeight?: string;
}

export function PromptBlock({ text, label, maxHeight }: PromptBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="prompt-block group">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已複製！' : label}
        </button>
      </div>
      <pre
        className="overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
        style={maxHeight ? { maxHeight } : undefined}
      >{text}</pre>
    </div>
  );
}
