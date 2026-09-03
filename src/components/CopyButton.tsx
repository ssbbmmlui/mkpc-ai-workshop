import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
        copied
          ? 'bg-emerald-500 text-white animate-copied'
          : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md'
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? '已複製！' : label}
    </button>
  );
}
