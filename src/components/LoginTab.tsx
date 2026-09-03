import { PromptBlock } from './PromptBlock';
import { LogIn, ExternalLink } from 'lucide-react';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';

interface Props {
  lang: Lang;
}

export function LoginTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <LogIn size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('login', lang)}</h2>
            <a
              href="https://gemini.google.com/app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-medium text-sm"
            >
              <ExternalLink size={14} />
              https://gemini.google.com/app
            </a>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="step-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
          <span className="font-medium text-slate-700">{t('loginStep1', lang)}</span>
        </div>
        <img src={assetUrl('images/login/login1.png')} alt="Login step 1" className="rounded-lg border border-slate-200 max-w-full" />
      </div>

      {/* Step 2 */}
      <div className="step-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</span>
          <span className="font-medium text-slate-700">{t('loginStep2', lang)}</span>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600">{t('loginFormat', lang)}</p>
          <PromptBlock text="tXX@mail.mkpc.edu.hk" label={t('copyPrompt', lang)} />

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 whitespace-pre-line">
            {t('loginNote', lang)}
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-medium">
            {t('loginPassword', lang)}
          </div>
        </div>
      </div>
    </div>
  );
}
