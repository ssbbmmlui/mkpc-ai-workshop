import { Download, ExternalLink, Globe } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';
import { promptForLang } from '../promptLang';
import qwenWebPromptZh from '../prompts/qwen-web-playlab.zh.txt?raw';
import qwenWebPromptEn from '../prompts/qwen-web-playlab.en.txt?raw';

export const QWEN_WEB_DEMO_URL = 'https://mkpcplay.netlify.app/';

const QWEN_WEB_RESULT_SHOTS = [
  { step: 1, image: 'images/qwen-work/playlab-preview.png' },
  { step: 2, image: 'images/qwen-work/playlab-publish.png' },
] as const;
export const QWEN_WEB_PROMPT = qwenWebPromptZh.trim();
export const QWEN_WEB_PROMPT_EN = qwenWebPromptEn.trim();

async function blobDownload(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

interface Props {
  lang: Lang;
}

export function QwenWebTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenFeatWebTitle', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('qwenWebIntro', lang)}</p>
            <a
              href="https://qwenwork.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <ExternalLink size={14} />
              {t('openQwenWork', lang)}
            </a>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">
          <Globe size={22} className="text-violet-500" />
          {t('qwenWebStepsTitle', lang)}
        </h3>

        <div className="step-card space-y-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="font-medium text-slate-700">{t(`qwenWebStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWebPromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_WEB_PROMPT, QWEN_WEB_PROMPT_EN)} label={t('copyPrompt', lang)} maxHeight="480px" />
      </div>

      <div>
        <h3 className="section-title">{t('qwenWebResultTitle', lang)}</h3>
        <div className="space-y-6">
          {QWEN_WEB_RESULT_SHOTS.map(({ step, image }) => {
            const caption = t(`qwenWebResultStep${step}`, lang);
            return (
              <figure key={step} className="step-card">
                <figcaption className="mb-3 flex items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                    {step}
                  </span>
                  <span className="font-medium leading-relaxed text-slate-700">{caption}</span>
                </figcaption>
                <img
                  src={assetUrl(image)}
                  alt={caption}
                  className="h-auto w-full max-w-3xl rounded-lg border border-slate-200"
                />
              </figure>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWebDemoTitle', lang)}</h3>
        <div className="step-card space-y-4">
          <p className="leading-relaxed text-slate-600">{t('qwenWebDemoIntro', lang)}</p>
          <a
            href={QWEN_WEB_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
          >
            <ExternalLink size={14} />
            {t('qwenWebDemoOpen', lang)}
          </a>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={QWEN_WEB_DEMO_URL}
              title={t('qwenWebDemoAlt', lang)}
              className="h-[720px] w-full border-0"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWebFilesTitle', lang)}</h3>
        <div className="step-card space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">{t('qwenWebFilesIntro', lang)}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                blobDownload(assetUrl('files/qwen-work/ionic-bubbles.html'), 'ionic-bubbles.html')
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <Download size={16} />
              {t('qwenWebFileBubbles', lang)}
            </button>
            <button
              type="button"
              onClick={() => blobDownload(assetUrl('files/qwen-work/math-snake.html'), 'math-snake.html')}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <Download size={16} />
              {t('qwenWebFileSnake', lang)}
            </button>
          </div>
        </div>
        <figure className="step-card mt-4">
          <figcaption className="mb-3 font-medium leading-relaxed text-slate-700">
            {t('qwenWebAddGameCaption', lang)}
          </figcaption>
          <img
            src={assetUrl('images/qwen-work/playlab-add-game.png')}
            alt={t('qwenWebAddGameCaption', lang)}
            className="h-auto w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </figure>
      </div>
    </div>
  );
}
