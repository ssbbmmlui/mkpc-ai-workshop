import { Briefcase } from 'lucide-react';
import { Lang, t } from '../i18n';

interface Props {
  lang: Lang;
}

export function QwenWorkTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenWork', lang)}</h2>
            <p className="text-sm font-medium text-violet-600 mb-2">{t('qwenWorkComingSoon', lang)}</p>
            <p className="text-slate-600 leading-relaxed">{t('qwenWorkPlaceholder', lang)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
