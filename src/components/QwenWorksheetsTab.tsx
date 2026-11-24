import { Download, ExternalLink, FileText } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';
import { promptForLang } from '../promptLang';

export const QWEN_WORKSHEETS_PROMPT_ZH = `請根據布魯姆分類學（Bloom’s Taxonomy），為指定科目與課題生成一張「基礎程度」工作紙，適用於語文、人文、歷史、數學及理科（包括生物、化學、物理、綜合科學等）。

程度與目標
- 「基礎程度」以記憶（Remember）與理解（Understand）為主，可有少量簡單應用（Apply）；不要出分析、評鑑、創作，或跨單元綜合長題。
- 題目由淺入深，每題只考一個重點；用語淺白，適合該年級學生獨立作答。
- 必須嚴格按使用者提供的科目、年級、課題、課文或範本出題；資料不足時，以佔位符標明須補項目，勿擅自改科、改課題或提高難度。

題目結構（建議一張、約 1–2 頁；按科目選用合適題型，層次不變）
1. 記憶：詞彙、定義、公式、年代、事實或基本符號名稱。
2. 理解：解釋概念、辨識例子、判斷對錯並改正，或用自己的話說明一項關係／步驟。
3. 簡單應用：按已教步驟或公式完成一至兩題（例如代入計算、標示圖表、完成句式），不需自行設計新解法。
語文科可用字詞、理解短答；人文／歷史可用史實填空與簡述因果；數學與理科則用定義、符號辨識與一步計算或實驗觀察。每部分註明對應的布魯姆層次與分數。文末另頁附完整答案（理科／數學須含簡要計法或要點）。

文件與符號規格
- 文件格式必須前後一致：標題、科目、年級、課題、姓名欄、題號、分數、作答空間、間距與字型層級須統一；若有範本，嚴格跟範本，不要自行改版面。
- 同一題（含題幹、附圖／附表及該題作答空間）必須完整出現在同一頁，不得在頁中間斷開或跨頁；若將超出頁末，應把整題移到下一頁，必要時微調間距，不可因此刪題或縮小至難以閱讀。
- 所有數學與科學符號必須以可正常閱讀、可列印的方式呈現，使用 Word 方程式編輯器或等價的正式排版，包括但不限於：分數、指數、根號、上下標、方程式、單位、溫度、離子與化學式、電子排佈、箭號、平衡符號、希臘字母、向量、以及生物／物理常用標記。
- 數學符號一律使用斜體（italic），例如變數、未知數與數學函數寫作 *x*、*y*、*n*、*f*(*x*)；上下標跟隨所屬符號。單位、阿拉伯數字、化學元素符號與化學式保持直立體（例如 3 cm、H₂O、CO₂、Na⁺），不要把單位或元素名稱做成斜體。
- 禁止使用亂碼、截圖公式，或 \`H_2O\`、\`x^2\`、\`1/2\`、\`sqrt\`、\`pi\`、\`->\`、\`CO2\` 這類純文字標記代替正式符號（正確應為 H₂O、*x*²、½ 或直式分數、*π*、→、CO₂ 等）。
- 圖、表、實驗裝置或地圖若需作答，須完整保留標示，並與所屬題目置於同一頁，不要裁走必要部分。
- 用語使用繁體中文（書面語）；題幹為完整句子；數字、符號、單位與專有名詞格式全卷一致。

限制
- 不要超出基礎程度，不要加入挑戰題、公開考試長題或專題研習。
- 不要虛構未提供的課文原文、數據、史實年份、實驗結果或評分準則；分數分配須合理並在卷面標明。
- 交貨為可直接列印的完整工作紙（含獨立答案頁），版面整齊，不要只交題目大綱。`;

export const QWEN_WORKSHEETS_PROMPT_SC = `请根据布鲁姆分类学（Bloom’s Taxonomy），为指定科目与课题生成一张「基础程度」工作纸，适用于语文、人文、历史、数学及理科（包括生物、化学、物理、综合科学等）。

程度与目标
- 「基础程度」以记忆（Remember）与理解（Understand）为主，可有少量简单应用（Apply）；不要出分析、评鉴、创作，或跨单元综合长题。
- 题目由浅入深，每题只考一个重点；用语浅白，适合该年级学生独立作答。
- 必须严格按使用者提供的科目、年级、课题、课文或范本出题；资料不足时，以占位符标明须补项目，勿擅自改科、改课题或提高难度。

题目结构（建议一张、约 1–2 页；按科目选用合适题型，层次不变）
1. 记忆：词汇、定义、公式、年代、事实或基本符号名称。
2. 理解：解释概念、辨识例子、判断对错并改正，或用自己的话说明一项关系／步骤。
3. 简单应用：按已教步骤或公式完成一至两题（例如代入计算、标示图表、完成句式），不需自行设计新解法。
语文科可用字词、理解短答；人文／历史可用史实填空与简述因果；数学与理科则用定义、符号辨识与一步计算或实验观察。每部分注明对应的布鲁姆层次与分数。文末另页附完整答案（理科／数学须含简要计法或要点）。

文件与符号规格
- 文件格式必须前后一致：标题、科目、年级、课题、姓名栏、题号、分数、作答空间、间距与字型层级须统一；若有范本，严格跟范本，不要自行改版面。
- 同一题（含题干、附图／附表及该题作答空间）必须完整出现在同一页，不得在页中间断开或跨页；若将超出页末，应把整题移到下一页，必要时微调间距，不可因此删题或缩小至难以阅读。
- 所有数学与科学符号必须以可正常阅读、可列印的方式呈现，使用 Word 方程式编辑器或等价的正式排版，包括但不限于：分数、指数、根号、上下标、方程式、单位、温度、离子与化学式、电子排布、箭号、平衡符号、希腊字母、向量、以及生物／物理常用标记。
- 数学符号一律使用斜体（italic），例如变数、未知数与数学函数写作 *x*、*y*、*n*、*f*(*x*)；上下标跟随所属符号。单位、阿拉伯数字、化学元素符号与化学式保持直立体（例如 3 cm、H₂O、CO₂、Na⁺），不要把单位或元素名称做成斜体。
- 禁止使用乱码、截图公式，或 \`H_2O\`、\`x^2\`、\`1/2\`、\`sqrt\`、\`pi\`、\`->\`、\`CO2\` 这类纯文字标记代替正式符号（正确应为 H₂O、*x*²、½ 或直式分数、*π*、→、CO₂ 等）。
- 图、表、实验装置或地图若需作答，须完整保留标示，并与所属题目置于同一页，不要裁走必要部分。
- 用语使用繁体中文（书面语）；题干为完整句子；数字、符号、单位与专有名词格式全卷一致。

限制
- 不要超出基础程度，不要加入挑战题、公开考试长题或专题研习。
- 不要虚构未提供的课文原文、数据、史实年份、实验结果或评分准则；分数分配须合理并在卷面标明。
- 交货为可直接列印的完整工作纸（含独立答案页），版面整齐，不要只交题目大纲。`;

export const QWEN_WORKSHEETS_PROMPT_EN = `Using Bloom’s Taxonomy, create one basic-level worksheet for the given subject and topic. It should suit language, humanities, history, mathematics, and science (including biology, chemistry, physics, integrated science, and similar subjects).

Level and aims
- Basic level focuses on Remember and Understand, with a little simple Apply. Do not set Analyse, Evaluate, or Create questions, or long questions that combine more than one unit.
- Move from easier to harder. Each question tests only one point. Use plain language so students in that year can answer on their own.
- Follow exactly the subject, year level, topic, text, or template the user provides. If information is missing, mark what must be filled in with a placeholder. Do not change the subject or the topic, and do not raise the difficulty.

Question structure (aim for one worksheet of about 1–2 pages; choose item types that suit the subject, but keep the same levels)
1. Remember: vocabulary, definitions, formulas, dates, facts, or the names of basic symbols.
2. Understand: explain a concept, recognise an example, judge true or false and correct it, or explain one relationship or step in the student’s own words.
3. Simple Apply: complete one or two questions using a step or formula already taught (for example, substitute into a calculation, label a chart or diagram, or complete a sentence pattern). Students do not need to devise a new method.
For language, use vocabulary and short comprehension answers. For humanities and history, use factual gap-fill and a short account of cause and effect. For mathematics and science, use definitions, recognition of symbols, and a one-step calculation or an observation from an experiment. Label each part with the matching Bloom level and the marks. On a separate page at the end, give the full answers (for science and mathematics, include brief working or the key points).

Document and symbol requirements
- The document format must be consistent throughout: title, subject, year level, topic, name field, question numbers, marks, answer space, spacing, and type hierarchy must be uniform. If a template is provided, follow it strictly and do not redesign the layout.
- A question (the stem, any figure or table, and that question’s answer space) must appear complete on the same page. Do not break it in the middle of a page or across pages. If it would run past the bottom of the page, move the whole question to the next page. Adjust the spacing if needed. Do not delete a question or shrink it until it is hard to read.
- Every mathematics and science symbol must be readable and printable. Use the Word equation editor or equivalent formal typesetting, including but not limited to: fractions, exponents, roots, subscripts and superscripts, equations, units, temperature, ions and chemical formulas, electronic arrangements, arrows, equilibrium symbols, Greek letters, vectors, and notation commonly used in biology and physics.
- Set mathematical symbols in italic, for example variables, unknowns, and functions written as *x*, *y*, *n*, and *f*(*x*). Subscripts and superscripts follow their parent symbol. Keep units, Arabic numerals, chemical element symbols, and chemical formulas upright (for example 3 cm, H₂O, CO₂, and Na⁺). Do not italicize units or the names of elements.
- Do not use garbled characters, screenshots of formulas, or plaintext markup such as \`H_2O\`, \`x^2\`, \`1/2\`, \`sqrt\`, \`pi\`, \`->\`, and \`CO2\` in place of formal symbols (the correct forms include H₂O, *x*², ½ or a stacked fraction, *π*, →, CO₂, and so on).
- If a figure, table, apparatus diagram, or map is needed for answering, keep its labels complete and keep it on the same page as its question. Do not crop away any part that is needed.
- Write in formal written Traditional Chinese. Each question stem must be a complete sentence. Keep numbers, symbols, units, and proper nouns in the same format throughout the paper.

Constraints
- Do not go beyond basic level. Do not add challenge questions, long public-examination questions, or project learning.
- Do not invent passage text, data, historical years, experimental results, or marking criteria that were not provided. Allocate marks reasonably and show them on the paper.
- Deliver a complete, print-ready worksheet (including a separate answer page) with a tidy layout. Do not submit only an outline of the questions.`;

function homeworkPromptForLang(lang: Lang): string {
  if (lang === 'en') return QWEN_WORKSHEETS_PROMPT_EN;
  if (lang === 'sc') return QWEN_WORKSHEETS_PROMPT_SC;
  return QWEN_WORKSHEETS_PROMPT_ZH;
}

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
            <div key={step} className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="pt-0.5 font-medium text-slate-700">{t(`qwenWorksheetsStep${step}`, lang)}</span>
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
        <h3 className="section-title">{t('qwenHomeworkPromptTitle', lang)}</h3>
        <PromptBlock text={homeworkPromptForLang(lang)} label={t('copyPrompt', lang)} />
      </div>

      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">{t('qwenWorksheetsSampleNote', lang)}</p>
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
