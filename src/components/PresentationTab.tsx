import { Presentation } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';

const PPT_PROMPT = `生成一個ppt簡報，內容是關於香港大館`;

interface Props {
  lang: Lang;
}

export function PresentationTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      {/* Steps */}
      <div>
        <h3 className="section-title">
          <Presentation size={22} className="text-amber-500" />
          {t('pptStepsTitle', lang)}
        </h3>

        <div className="step-card">
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">1</span>
              <span className="font-medium text-slate-700">{t('pptStep1', lang)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">2</span>
              <span className="font-medium text-slate-700">{t('pptStep2', lang)}</span>
            </div>
          </div>
          <PromptBlock text={PPT_PROMPT} label={t('copyPrompt', lang)} />
          <img
            src="/images/presentation/ppt1.png"
            alt="Presentation generation steps"
            className="rounded-lg border border-slate-200 max-w-full md:max-w-lg mt-4"
          />
        </div>
      </div>

      {/* Sample output */}
      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <div className="step-card p-0 overflow-hidden">
          <img
            src="/images/presentation/ppt2.png"
            alt="Presentation sample output"
            className="rounded-xl max-w-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
