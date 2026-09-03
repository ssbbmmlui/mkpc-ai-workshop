import { ClipboardList, ExternalLink, FileText } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';

export const QWEN_MINUTES_PROMPT = `mp4為會議時的錄音
word檔為會議記錄的temlpate
請把錄音中的內容歸納並整理, 然後把會議記錄填到template上
現在請根據template, 為我生成一個word檔的會議記錄`;

export const QWEN_MINUTES_PROMPT_EN = `The mp4 is the recording of the meeting.
The Word file is the meeting minutes template.
Please summarise and organise the content of the recording, then fill the minutes into the template.
Now, based on the template, generate a Word file of the meeting minutes.`;

export const QWEN_LESSON_PLAN_PROMPT = `word檔為教案template
請根據我提供的課題資料，把內容歸納並整理，然後填到template上
現在請根據template，為我生成一個word檔的教案`;

export const QWEN_LESSON_PLAN_PROMPT_EN = `The Word file is the lesson-plan template.
Please summarise and organise the lesson materials I provided, then fill them into the template.
Now, based on the template, generate a Word file of the lesson plan.`;

export const QWEN_SCHEME_PROMPT = `word檔為教學進度表template
請根據我提供的課程大綱／周年計劃，把內容歸納並整理，然後填到template上
現在請根據template，為我生成一個word檔的教學進度表`;

export const QWEN_SCHEME_PROMPT_EN = `The Word file is the teaching-progress / scheme-of-work template.
Please summarise and organise the syllabus or yearly plan I provided, then fill them into the template.
Now, based on the template, generate a Word file of the teaching progress table.`;

interface Props {
  lang: Lang;
}

export function QwenMinutesTab({ lang }: Props) {
  const lessonPrompt = lang === 'en' ? QWEN_LESSON_PLAN_PROMPT_EN : QWEN_LESSON_PLAN_PROMPT;
  const schemePrompt = lang === 'en' ? QWEN_SCHEME_PROMPT_EN : QWEN_SCHEME_PROMPT;

  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenMinutes', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('qwenMinutesIntro', lang)}</p>
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
          <ClipboardList size={22} className="text-violet-500" />
          {t('qwenMinutesStepsTitle', lang)}
        </h3>

        <div className="step-card space-y-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="font-medium text-slate-700">{t(`qwenMinutesStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenMinutesPromptTitle', lang)}</h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">{t('qwenMinutesPromptNote', lang)}</p>
        <PromptBlock text={QWEN_MINUTES_PROMPT} label={t('copyPrompt', lang)} maxHeight="240px" />
      </div>

      <div>
        <h3 className="section-title">{t('qwenMinutesPromptEnTitle', lang)}</h3>
        <PromptBlock text={QWEN_MINUTES_PROMPT_EN} label={t('copyPrompt', lang)} maxHeight="240px" />
      </div>

      <div>
        <h3 className="section-title">
          <FileText size={22} className="text-violet-500" />
          {t('qwenMinutesMoreTitle', lang)}
        </h3>
        <div className="step-card space-y-3">
          <p className="leading-relaxed text-slate-600">{t('qwenMinutesMoreIntro', lang)}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('qwenMinutesMoreItem1', lang)}</li>
            <li>{t('qwenMinutesMoreItem2', lang)}</li>
            <li>{t('qwenMinutesMoreItem3', lang)}</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenMinutesLessonPromptTitle', lang)}</h3>
        <PromptBlock text={lessonPrompt} label={t('copyPrompt', lang)} maxHeight="200px" />
      </div>

      <div>
        <h3 className="section-title">{t('qwenMinutesSchemePromptTitle', lang)}</h3>
        <PromptBlock text={schemePrompt} label={t('copyPrompt', lang)} maxHeight="200px" />
      </div>
    </div>
  );
}
