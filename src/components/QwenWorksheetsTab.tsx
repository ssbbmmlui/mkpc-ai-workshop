import { Download, ExternalLink, FileText } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';

export const QWEN_WORKSHEETS_PROMPT = `i would like you to create differentiated worksheets.
@12 Reacting masses_Homework_Student.docx this is the normal level.
@cbte12_e_cleaned.pdf this is the textbook

Maintain the exact font, formatting, heading layout, question numbering, and visual styling used in @12 Reacting masses_Homework_Student.docx 

Ensure all the format of the chemical equations and values align accurately with the textbook content in @cbte12_e_cleaned.pdf .

Provide the complete, fully drafted text for both worksheets so they are ready for classroom use.

please create a basic (foundation) and an advanced level worksheet using the same font and style based on @12 Reacting masses_Homework_Student.docx`;

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

export function QwenWorksheetsTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenWorksheets', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('qwenWorksheetsIntro', lang)}</p>
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
          <FileText size={22} className="text-violet-500" />
          {t('qwenWorksheetsStepsTitle', lang)}
        </h3>

        <div className="step-card space-y-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="font-medium text-slate-700">{t(`qwenWorksheetsStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWorksheetsFilesTitle', lang)}</h3>
        <div className="step-card space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">{t('qwenWorksheetsFilesIntro', lang)}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                blobDownload(
                  encodeURI(assetUrl('files/qwen-work/12 Reacting masses_Homework_Student.docx')),
                  '12 Reacting masses_Homework_Student.docx',
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <Download size={16} />
              {t('qwenWorksheetsFileNormal', lang)}
            </button>
            <button
              type="button"
              onClick={() =>
                blobDownload(assetUrl('files/qwen-work/cbte12_e_cleaned.pdf'), 'cbte12_e_cleaned.pdf')
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <Download size={16} />
              {t('qwenWorksheetsFileTextbook', lang)}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWorksheetsPromptTitle', lang)}</h3>
        <PromptBlock text={QWEN_WORKSHEETS_PROMPT} label={t('copyPrompt', lang)} maxHeight="360px" />
      </div>
    </div>
  );
}
