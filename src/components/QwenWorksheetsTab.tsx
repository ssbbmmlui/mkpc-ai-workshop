import { Download, ExternalLink, FileText } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';
import { promptForLang } from '../promptLang';

export const QWEN_WORKSHEETS_PROMPT = `i would like you to create differentiated homework.
@12 Reacting masses_Homework_Student.docx this is the normal level.
@cbte12_e_cleaned.pdf this is the textbook

Maintain the exact font, formatting, heading layout, question numbering, and visual styling used in @12 Reacting masses_Homework_Student.docx 

Ensure all the format of the chemical equations and values align accurately with the textbook content in @cbte12_e_cleaned.pdf .

Provide the complete, fully drafted text for both homework papers so they are ready for classroom use.

please create a basic (foundation) and an advanced level homework using the same font and style based on @12 Reacting masses_Homework_Student.docx`;

export const QWEN_WORKSHEETS_PROMPT_ZH = `請幫我製作分層功課。
@12 Reacting masses_Homework_Student.docx 這是普通程度。
@cbte12_e_cleaned.pdf 這是教科書

請維持與 @12 Reacting masses_Homework_Student.docx 完全相同的字體、格式、標題版面、題號及視覺風格。

請確保化學方程式與數值的格式準確對齊教科書 @cbte12_e_cleaned.pdf 的內容。

請提供兩份完整、可直接用於課堂的功課全文。

請根據 @12 Reacting masses_Homework_Student.docx 的字體與風格，製作一份基礎（foundation）及一份進階程度功課。`;

export const QWEN_TIERED_WS_PROMPT = `Differentiated worksheet prompt ------------------------------------
First prompt: [Level 1 Foundation worksheet] Who it is for: students with lower motivation or a weaker foundation (Low Ability). Design focus: provide plenty of scaffolding, such as a word bank and hint sentences, to reduce frustration and build confidence. You are a secondary-school teacher with experience in learning support. Using the teaching slides I uploaded (the source material), design a foundation worksheet for students at a basic level. Follow these rules: 1. **Scope**: select only the most central, most basic definitions and concepts from the slides. Avoid overly difficult detail. 2. **Format**: provide plenty of scaffolding so students can find the answers directly in the source material. 3. **Basis**: design the questions at the remember and understand levels of Bloom's Taxonomy. *Worksheet structure:* 1. **Guided summary (cloze)**: write a simple summary of about 150-200 words based on the slides. Remove 8-10 key words. **You must include a word bank** for students to choose from. 2. **Picture matching or glossary** (10 questions): list 10 core terms and their definitions as a matching exercise. 3. **True or false, clarifying the concepts** (10 questions): write 10 simple true-or-false questions. If the answer is false, give a one-sentence correction. *Finally, provide the complete answers.*

* Second prompt: [Level 2 Concept application worksheet] Who it is for: students of average ability. Design focus: standard question types used in ordinary tests and public exams, with emphasis on understanding and application. You are an experienced secondary-school subject teacher. Using the teaching slides I uploaded (the source material), design a concept-application worksheet for average students. Follow these rules: 1. **Scope**: cover the main concepts, processes, and cause-and-effect relationships in the slides. 2. **Basis**: design the questions at the apply and analyse levels of Bloom's Taxonomy. *Worksheet structure:* 1. **Multiple choice** (5-8 questions): each question has options A, B, C, and D. Include 1-2 distractors that test whether students really understand the concept. 2. **Short questions** (4 questions): ask students to explain why or how. For example, explain the cause of a phenomenon, or list the advantages of a strategy. 3. **Scenario-based question** (1 question): set an everyday situation based on the slides and ask students which concept from the slides it uses. *Finally, provide answers and a marking scheme.*

* Third prompt: [Level 3 Advanced challenge worksheet] Who it is for: stronger students, or students who need extension (High Ability). Design focus: open questions with no single model answer, emphasising critical thinking, evaluation, and creativity. You are a teacher who values higher-order thinking. Using the teaching slides I uploaded (the source material), design an advanced challenge worksheet for high-ability students. Follow these rules: 1. **Scope**: focus on complex ideas, points of debate, or further applications in the slides. 2. **Basis**: design the questions at the evaluate and create levels of Bloom's Taxonomy. *Worksheet structure:* 1. **Data or case analysis** (1 question): take data, a chart, or a case mentioned in the slides and ask students to analyse the trend or the implied meaning. If there is no data, ask students to compare and contrast two different concepts from the slides. 2. **Critical-thinking essay** (1 question): for example, "To what extent do you agree with the view in the slides about ...? Give three arguments for your position." Or: "If the strategy mentioned in the slides were carried out in real life, what difficulties would you meet, and how would you solve them?" 3. **Creative extension** (1 question): ask students to propose a new example, an improvement, or a prediction based on what they have learned. *Finally, for these open questions provide answering guidance or suggested points, rather than a model answer.*

Follow the format of @worksheet template.docx and generate three DOC worksheets at different levels, plus a DOC marking scheme for each.`;

export const QWEN_TIERED_WS_PROMPT_ZH = `差異化學習的工作紙prompt ------------------------------------
第一個提示詞：【Level 1 基礎鞏固工作紙】 適用對象： 學習動機較弱或基礎較差的學生 (Low Ability) 設計重點： 提供大量「鷹架」（Scaffolding），如選詞庫、提示句，降低挫折感，建立信心。 你是一位具備教育支援經驗的中學教師。請根據我上傳的教學簡報（來源資料），為基礎程度的學生設計一份「基礎鞏固工作紙」。 請遵守以下規則： 1. **內容範圍**：僅選取簡報中最核心、最基礎的定義與概念，避免過於艱深的細節。 2. **形式要求**：提供大量輔助（Scaffolding），確保學生能從來源資料中直接找到答案。 3.**理論依據**：依據 Bloom's Taxonomy 的「remember」與「understand」層次設計題目。 *工作紙內容架構：* 1. **課文摘要填充（Guided Summary）**： 請根據簡報內容撰寫一段約 150-200 字的簡單摘要。 挖空 8-10 個關鍵詞（Key Concepts）。 **必須附上「選詞庫（Word Bank）」**供學生選擇。 2. **圖文配對或名詞解釋**（10題）： 列出 10 個核心專有名詞及其定義，以配對題（Matching）形式呈現。 3. **是非題（連貫念釐清）**（10題）： 設計 10題簡單的是非題，若答案為「非」，請提供簡單的一句話修正建議。 *最後，請提供完整的參考答案。

* 第二個提示詞：【Level 2 概念應用工作紙】 適用對象： 一般程度學生 (Average Ability) 設計重點： 符合一般測驗與公開考試的標準題型，強調理解與應用。 你是一位資深的中學學科教師。請根據我上傳的教學簡報（來源資料），為一般程度的學生設計一份「概念應用工作紙」。 請遵守以下規則： 1. **內容範圍**：涵蓋簡報中的主要概念、流程及因果關係。 2. **理論依據**：依據 Bloom's Taxonomy 的「應用」與「分析」層次設計題目。 *工作紙內容架構：* 1. **多項選擇題（Multiple Choice）**（5-8題）： 每題設有 A, B, C, D 四個選項。 設計 1-2 個具誘答性（Distractor）的選項，測試學生是否真正理解概念。 2. **短答題（Short Questions）**（4題）： 請設計需要學生解釋「為什麼（Why）」或「如何（How）」的題目。 例如：解釋某個現象的成因、列舉某個策略的優點等。 3. **情境題（Scenario-based Question）**（1題）： 根據簡報內容設定一個生活化情境，請學生指出該情境運用了簡報中的哪個概念。 *最後，請提供參考答案及評分標準（Marking Scheme）。

* 第三個提示詞：【Level 3 進階挑戰工作紙】 適用對象： 能力較強或需要拔尖的學生 (High Ability) 設計重點： 開放式問題，沒有單一標準答案，強調批判性思考、評價與創新。 你是一位重視高階思維訓練的教師。請根據我上傳的教學簡報（來源資料），為高能力學生設計一份「進階挑戰工作紙」。 請遵守以下規則： 1. **內容範圍**：聚焦於簡報中的複雜概念、爭議點或未來的延伸應用。 2. **理論依據**：依據 Bloom's Taxonomy 的「評鑑」與「創造」層次設計題目。 *工作紙內容架構：* 1. **資料分析題（Data/Case Analysis）**（1題）： 提取簡報中提到的數據、圖表或案例，請學生分析其背後的趨勢或隱含意義。 如果不包含數據，請要求學生比較簡報中兩個不同概念的異同（Compare and Contrast）。 2. **批判性思考長問答（Essay Question）**（1題）： 設計題目如：「你多大程度上同意簡報中關於...的觀點？請提出三個論點支持你的立場。」 或是：「如果要在現實生活中執行簡報提到的...策略，你認為會遇到什麼困難？該如何解決？」 3. **創意延伸（Extension Task）**（1題）： 請學生根據所學，提出一個新的例子、一個改進方案，或預測未來的發展。 *最後，請針對這些開放式問題提供「答題指引」或「建議論點（Suggested Points）」，而非標準答案。

參考＠worksheet template.docx的格式，生成三份不同程度WS 的DOC 和對應MARKING SCHEME 的DOC`;

async function blobDownload(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function FileButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-left text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
    >
      <Download size={16} className="shrink-0" />
      {label}
    </button>
  );
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
            <h2 className="section-title mb-2">{t('qwenHomeworkTitle', lang)}</h2>
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
            <FileButton
              label={t('qwenWorksheetsFileNormal', lang)}
              onClick={() =>
                blobDownload(
                  encodeURI(assetUrl('files/qwen-work/12 Reacting masses_Homework_Student.docx')),
                  '12 Reacting masses_Homework_Student.docx',
                )
              }
            />
            <FileButton
              label={t('qwenWorksheetsFileTextbook', lang)}
              onClick={() =>
                blobDownload(assetUrl('files/qwen-work/cbte12_e_cleaned.pdf'), 'cbte12_e_cleaned.pdf')
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWorksheetsPromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_WORKSHEETS_PROMPT_ZH, QWEN_WORKSHEETS_PROMPT)} label={t('copyPrompt', lang)} maxHeight="360px" />
      </div>

      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <div className="step-card overflow-hidden p-0">
          <img
            src={assetUrl('images/qwen-work/differentiated-worksheets.png')}
            alt={t('qwenWorksheetsSampleAlt', lang)}
            className="h-auto w-full max-w-full"
          />
        </div>
      </div>

      <div
        role="separator"
        aria-label={t('qwenTieredWsTitle', lang)}
        className="h-2 rounded-full bg-violet-600 shadow-[0_0_0_6px_rgba(124,58,237,0.18)]"
      />

      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-violet-700">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenTieredWsTitle', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('qwenTieredWsIntro', lang)}</p>
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
          {t('qwenTieredWsStepsTitle', lang)}
        </h3>

        <div className="step-card space-y-3">
          <div className="flex items-start gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              1
            </span>
            <span className="pt-0.5 font-medium text-slate-700">{t('qwenWorksheetsStep1', lang)}</span>
          </div>
          {[2, 3].map((step) => (
            <div key={step} className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="pt-0.5 font-medium text-slate-700">{t(`qwenTieredWsStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWorksheetsFilesTitle', lang)}</h3>
        <div className="step-card space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">{t('qwenTieredWsFilesIntro', lang)}</p>
          <div className="flex flex-wrap gap-3">
            <FileButton
              label={t('qwenTieredWsFileTemplate', lang)}
              onClick={() =>
                blobDownload(
                  encodeURI(assetUrl('files/qwen-work/worksheet template.docx')),
                  'worksheet template.docx',
                )
              }
            />
            <FileButton
              label={t('qwenTieredWsFileTextbook', lang)}
              onClick={() =>
                blobDownload(
                  encodeURI(assetUrl('files/qwen-work/Strength of acids and alkalis.pdf')),
                  'Strength of acids and alkalis.pdf',
                )
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWorksheetsPromptTitle', lang)}</h3>
        <PromptBlock
          text={promptForLang(lang, QWEN_TIERED_WS_PROMPT_ZH, QWEN_TIERED_WS_PROMPT)}
          label={t('copyPrompt', lang)}
          maxHeight="480px"
        />
      </div>

      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <div className="step-card overflow-hidden p-0">
          <img
            src={assetUrl('images/qwen-work/tiered-question-worksheets.jpg')}
            alt={t('qwenTieredWsSampleAlt', lang)}
            className="h-auto w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
