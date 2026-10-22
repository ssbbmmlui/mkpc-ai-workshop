import { Download, Notebook } from 'lucide-react';
import { assetUrl } from '../assetUrl';
import { Lang, t } from '../i18n';

const SOURCE_PDF = 'files/gemini/Strength of acids and alkalis.pdf';
const SOURCE_FILENAME = 'Strength of acids and alkalis.pdf';

const STEPS = [1, 2, 3, 4, 5] as const;

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

export function GeminiNotebookTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600">
            <Notebook size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('geminiNotebook', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('geminiNotebookIntro', lang)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('geminiNotebookSourceTitle', lang)}</h3>
        <div className="step-card space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">{t('geminiNotebookSourceIntro', lang)}</p>
          <button
            type="button"
            onClick={() => blobDownload(encodeURI(assetUrl(SOURCE_PDF)), SOURCE_FILENAME)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
          >
            <Download size={16} />
            {SOURCE_FILENAME}
          </button>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('geminiNotebookStepsTitle', lang)}</h3>
        <div className="space-y-6">
          {STEPS.map((step) => {
            const caption = t(`geminiNotebookStep${step}`, lang);
            return (
              <figure key={step} className="step-card">
                <img
                  src={assetUrl(`images/gemini/notebook-${step}.png`)}
                  alt={caption}
                  className="h-auto w-full max-w-3xl rounded-lg border border-slate-200"
                />
                <figcaption className="mt-3 flex items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {step}
                  </span>
                  <span className="font-medium leading-relaxed text-slate-700">{caption}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
