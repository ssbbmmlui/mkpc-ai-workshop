import { Download, ExternalLink, FileText } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';

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

export const QWEN_ADVANCED_PROMPT_ZH = `請根據布魯姆分類學（Bloom’s Taxonomy），為指定科目與課題生成一張「進階程度」工作紙，適用於語文、人文、歷史、數學及理科（包括生物、化學、物理、綜合科學等）。

程度與目標
- 「進階程度」以應用（Apply）與分析（Analyse）為主，可有少量評鑑（Evaluate）；不要停留在純記憶或只考定義默寫，也不要做成大型專題研習或無範圍的創作任務。
- 題目由淺入深，但仍屬進階：學生須調用已學知識，比較、解釋原因、拆解步驟或判斷對錯並說明理據。
- 必須嚴格按使用者提供的科目、年級、課題、課文或範本出題；資料不足時，以佔位符標明須補項目，勿擅自改科、改課題或降低／任意拔高精度。

題目結構（建議一張、約 2–3 頁；按科目選用合適題型，層次不變）
1. 應用：將已教方法、公式、概念或史論用於新情境（例如多步計算、解釋實驗現象、用語境完成分析短答）。可設一題簡短回憶作鋪墊，但不可佔主要篇幅。
2. 分析：比較異同、指出關係或謬誤、詮釋材料／圖表／史料，或拆解多步驟過程並說明原因。
3. 少量評鑑：就兩種說法、方法或結論作出有理據的判斷（須設定清楚準則，不要空泛發表意見）。
語文科可用篇章分析與手法作用；人文／歷史可用史料比較與論證；數學與理科則用多步解題、解釋異常數據或比較方法。每部分註明對應的布魯姆層次與分數。文末另頁附完整答案（理科／數學須含計法與要點；語文／人文須含評分要點）。

文件與符號規格
- 文件格式必須前後一致：標題、科目、年級、課題、姓名欄、題號、分數、作答空間、間距與字型層級須統一；若有範本，嚴格跟範本，不要自行改版面。
- 同一題（含題幹、附圖／附表及該題作答空間）必須完整出現在同一頁，不得在頁中間斷開或跨頁；若將超出頁末，應把整題移到下一頁，必要時微調間距，不可因此刪題或縮小至難以閱讀。
- 所有數學與科學符號必須以可正常閱讀、可列印的方式呈現，使用 Word 方程式編輯器或等價的正式排版，包括但不限於：分數、指數、根號、上下標、方程式、單位、溫度、離子與化學式、電子排佈、箭號、平衡符號、希臘字母、向量、以及生物／物理常用標記。
- 數學符號一律使用斜體（italic），例如變數、未知數與數學函數寫作 *x*、*y*、*n*、*f*(*x*)；上下標跟隨所屬符號。單位、阿拉伯數字、化學元素符號與化學式保持直立體（例如 3 cm、H₂O、CO₂、Na⁺），不要把單位或元素名稱做成斜體。
- 禁止使用亂碼、截圖公式，或 \`H_2O\`、\`x^2\`、\`1/2\`、\`sqrt\`、\`pi\`、\`->\`、\`CO2\` 這類純文字標記代替正式符號（正確應為 H₂O、*x*²、½ 或直式分數、*π*、→、CO₂ 等）。
- 圖、表、實驗裝置、史料或地圖若需作答，須完整保留標示，並與所屬題目置於同一頁，不要裁走必要部分。
- 用語使用繁體中文（書面語）；題幹為完整句子；數字、符號、單位與專有名詞格式全卷一致。

限制
- 不要出純默寫或只考記憶的基礎卷，也不要加入超出本課題的公開考試長卷或跨科專題。
- 不要虛構未提供的課文原文、數據、史實年份、實驗結果或評分準則；分數分配須合理並在卷面標明。
- 交貨為可直接列印的完整工作紙（含獨立答案頁），版面整齊，不要只交題目大綱。`;

export const QWEN_ADVANCED_PROMPT_SC = `请根据布鲁姆分类学（Bloom’s Taxonomy），为指定科目与课题生成一张「进阶程度」工作纸，适用于语文、人文、历史、数学及理科（包括生物、化学、物理、综合科学等）。

程度与目标
- 「进阶程度」以应用（Apply）与分析（Analyse）为主，可有少量评鉴（Evaluate）；不要停留在纯记忆或只考定义默写，也不要做成大型专题研习或无范围的创作任务。
- 题目由浅入深，但仍属进阶：学生须调用已学知识，比较、解释原因、拆解步骤或判断对错并说明理据。
- 必须严格按使用者提供的科目、年级、课题、课文或范本出题；资料不足时，以占位符标明须补项目，勿擅自改科、改课题或降低／任意拔高难度。

题目结构（建议一张、约 2–3 页；按科目选用合适题型，层次不变）
1. 应用：将已教方法、公式、概念或史论用于新情境（例如多步计算、解释实验现象、用语境完成分析短答）。可设一题简短回忆作铺垫，但不可占主要篇幅。
2. 分析：比较异同、指出关系或谬误、诠释材料／图表／史料，或拆解多步骤过程并说明原因。
3. 少量评鉴：就两种说法、方法或结论作出有理据的判断（须设定清楚准则，不要空泛发表意见）。
语文科可用篇章分析与手法作用；人文／历史可用史料比较与论证；数学与理科则用多步解题、解释异常数据或比较方法。每部分注明对应的布鲁姆层次与分数。文末另页附完整答案（理科／数学须含计法与要点；语文／人文须含评分要点）。

文件与符号规格
- 文件格式必须前后一致：标题、科目、年级、课题、姓名栏、题号、分数、作答空间、间距与字型层级须统一；若有范本，严格跟范本，不要自行改版面。
- 同一题（含题干、附图／附表及该题作答空间）必须完整出现在同一页，不得在页中间断开或跨页；若将超出页末，应把整题移到下一页，必要时微调间距，不可因此删题或缩小至难以阅读。
- 所有数学与科学符号必须以可正常阅读、可列印的方式呈现，使用 Word 方程式编辑器或等价的正式排版，包括但不限于：分数、指数、根号、上下标、方程式、单位、温度、离子与化学式、电子排布、箭号、平衡符号、希腊字母、向量、以及生物／物理常用标记。
- 数学符号一律使用斜体（italic），例如变数、未知数与数学函数写作 *x*、*y*、*n*、*f*(*x*)；上下标跟随所属符号。单位、阿拉伯数字、化学元素符号与化学式保持直立体（例如 3 cm、H₂O、CO₂、Na⁺），不要把单位或元素名称做成斜体。
- 禁止使用乱码、截图公式，或 \`H_2O\`、\`x^2\`、\`1/2\`、\`sqrt\`、\`pi\`、\`->\`、\`CO2\` 这类纯文字标记代替正式符号（正确应为 H₂O、*x*²、½ 或直式分数、*π*、→、CO₂ 等）。
- 图、表、实验装置、史料或地图若需作答，须完整保留标示，并与所属题目置于同一页，不要裁走必要部分。
- 用语使用繁体中文（书面语）；题干为完整句子；数字、符号、单位与专有名词格式全卷一致。

限制
- 不要出纯默写或只考记忆的基础卷，也不要加入超出本课题的公开考试长卷或跨科专题。
- 不要虚构未提供的课文原文、数据、史实年份、实验结果或评分准则；分数分配须合理并在卷面标明。
- 交货为可直接列印的完整工作纸（含独立答案页），版面整齐，不要只交题目大纲。`;

export const QWEN_ADVANCED_PROMPT_EN = `Using Bloom’s Taxonomy, create one advanced-level worksheet for the given subject and topic. It should suit language, humanities, history, mathematics, and science (including biology, chemistry, physics, integrated science, and similar subjects).

Level and aims
- Advanced level focuses on Apply and Analyse, with a little Evaluate. Do not stay at pure memory, or only test the writing-out of definitions. Do not turn it into a large project-learning task, or a Create task with no set scope.
- Move from easier to harder, but keep it advanced: students must use what they have already learned, compare, explain a cause, break a process into steps, or judge true or false and give their reasons.
- Follow exactly the subject, year level, topic, text, or template the user provides. If information is missing, mark what must be filled in with a placeholder. Do not change the subject or the topic, and do not lower the level or raise it at will.

Question structure (aim for one worksheet of about 2–3 pages; choose item types that suit the subject, but keep the same levels)
1. Apply: use a taught method, formula, concept, or historical argument in a new situation (for example, a multi-step calculation, an explanation of an experimental observation, or a short analytical answer completed from a context). You may set one short recall item as a lead-in, but it must not take up most of the paper.
2. Analyse: compare similarities and differences, point out a relationship or an error, interpret a source, a chart, or historical material, or break a multi-step process into parts and explain why.
3. A little Evaluate: make a reasoned judgement between two claims, methods, or conclusions. Set clear criteria. Do not invite a vague opinion.
For language, use passage analysis and the effect of techniques. For humanities and history, use comparison of historical sources and argument. For mathematics and science, use multi-step solutions, an explanation of unexpected data, or a comparison of methods. Label each part with the matching Bloom level and the marks. On a separate page at the end, give the full answers (for science and mathematics, include the working and the key points; for language and humanities, include the marking points).

Document and symbol requirements
- The document format must be consistent throughout: title, subject, year level, topic, name field, question numbers, marks, answer space, spacing, and type hierarchy must be uniform. If a template is provided, follow it strictly and do not redesign the layout.
- A question (the stem, any figure or table, and that question’s answer space) must appear complete on the same page. Do not break it in the middle of a page or across pages. If it would run past the bottom of the page, move the whole question to the next page. Adjust the spacing if needed. Do not delete a question or shrink it until it is hard to read.
- Every mathematics and science symbol must be readable and printable. Use the Word equation editor or equivalent formal typesetting, including but not limited to: fractions, exponents, roots, subscripts and superscripts, equations, units, temperature, ions and chemical formulas, electronic arrangements, arrows, equilibrium symbols, Greek letters, vectors, and notation commonly used in biology and physics.
- Set mathematical symbols in italic, for example variables, unknowns, and functions written as *x*, *y*, *n*, and *f*(*x*). Subscripts and superscripts follow their parent symbol. Keep units, Arabic numerals, chemical element symbols, and chemical formulas upright (for example 3 cm, H₂O, CO₂, and Na⁺). Do not italicize units or the names of elements.
- Do not use garbled characters, screenshots of formulas, or plaintext markup such as \`H_2O\`, \`x^2\`, \`1/2\`, \`sqrt\`, \`pi\`, \`->\`, and \`CO2\` in place of formal symbols (the correct forms include H₂O, *x*², ½ or a stacked fraction, *π*, →, CO₂, and so on).
- If a figure, table, apparatus diagram, historical source, or map is needed for answering, keep its labels complete and keep it on the same page as its question. Do not crop away any part that is needed.
- Write in formal written Traditional Chinese. Each question stem must be a complete sentence. Keep numbers, symbols, units, and proper nouns in the same format throughout the paper.

Constraints
- Do not set a basic paper of pure dictation, or one that only tests memory. Do not add a long public-examination paper that goes beyond this topic, or a cross-subject project.
- Do not invent passage text, data, historical years, experimental results, or marking criteria that were not provided. Allocate marks reasonably and show them on the paper.
- Deliver a complete, print-ready worksheet (including a separate answer page) with a tidy layout. Do not submit only an outline of the questions.`;

function advancedPromptForLang(lang: Lang): string {
  if (lang === 'en') return QWEN_ADVANCED_PROMPT_EN;
  if (lang === 'sc') return QWEN_ADVANCED_PROMPT_SC;
  return QWEN_ADVANCED_PROMPT_ZH;
}

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

const ADVANCED_WORKSHEET_FILE = '21_MIF2nd_S3A_ws03.4_Set1_c.doc';

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
              label={t('qwenWorksheetsFileWorksheet', lang)}
              onClick={() =>
                blobDownload(
                  encodeURI(assetUrl(`files/qwen-work/${ADVANCED_WORKSHEET_FILE}`)),
                  ADVANCED_WORKSHEET_FILE,
                )
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
        <h3 className="section-title">{t('qwenHomeworkAdvancedPromptTitle', lang)}</h3>
        <PromptBlock text={advancedPromptForLang(lang)} label={t('copyPrompt', lang)} />
      </div>

      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">{t('qwenWorksheetsSampleNote', lang)}</p>
        <div className="step-card overflow-hidden p-0">
          <img
            src={assetUrl('images/qwen-work/advanced-level-worksheet.png')}
            alt={t('qwenWorksheetsSampleAlt', lang)}
            className="h-auto w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
