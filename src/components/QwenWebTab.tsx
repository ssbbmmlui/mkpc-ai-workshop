import { Download, ExternalLink, Globe } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';
import { promptForLang } from '../promptLang';

async function blobDownload(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const QWEN_WEB_PROMPT = `我是一名學校教學統籌主任，請幫我搭建一個公開的「學科遊戲學習平台」靜態網站。完成後請發布上線，並提供一個公網訪問網址。

版面要求
左上角顯示圓角 Logo，文字為【學校名】；
其下方顯示主標題【學科遊戲學習平台】。
右上角設置兩個開關：

中英文切換：切換後全站內容即時生效；
畫面預覽尺寸：可選擇手機 / iPad / 電腦。
（當選擇手機或 iPad 時，整個網站應分別顯示在寬度為 390px / 820px 的設備框內。）
主體區域為科目網格，科目需按照以下順序排列：

【中文、數學、英文、物理、化學、生物、地理、政治、歷史、音樂】

每個科目卡片需包含：

代表色；
科目名稱（中英對照）；
該科遊戲數量；
一個可愛小動物頭像（使用內嵌 SVG，不要引入外部圖片）；
點擊某一科目後，進入該科目的遊戲列表頁。列表頁頂部必須有「返回主頁」按鈕。
遊戲以卡片形式展示，內容包括：

遊戲名稱；
適用級別；
一句玩法說明；
「開始玩」按鈕；
如果該科目暫無遊戲，則顯示虛線邊框的空狀態提示。
整體風格要求
明亮可愛；
以淺紫色為主；
簡潔大方；
體現學校主色【藍色】；
文字對比度要充足；
按鈕尺寸應便於點擊。
技術要求
遊戲本身是獨立的 HTML 檔案，網站僅作為入口平台，不修改遊戲內部內容。
請採用「一科目一個資料夾 + 一份遊戲清單檔案」的結構，確保我日後添加遊戲時，只需將遊戲 HTML 檔案放入對應科目資料夾，並在遊戲清單檔案中新增一行記錄，無需修改任何元件代碼。
完成後請執行
類型檢查；
生產環境構建；
自我驗證；
最後請將網站發布上線，並提供公網訪問網址。`;

export const QWEN_WEB_PROMPT_EN = `I am a school curriculum coordinator. Please build a public static website for a “Subject Game Learning Platform”. When it is finished, publish it and give me a public URL.

Layout
Show a rounded logo in the top left with the text 【School name】;
below it, show the main title 【Subject Game Learning Platform】.
In the top right, add two switches:

Chinese/English toggle: the whole site updates immediately after switching;
Preview size: choose Phone / iPad / Computer.
(When Phone or iPad is selected, the whole site should appear inside a device frame 390px / 820px wide.)
The main area is a subject grid, in this order:

【Chinese, Mathematics, English, Physics, Chemistry, Biology, Geography, Politics, History, Music】

Each subject card must include:

a theme colour;
the subject name (Chinese and English);
the number of games for that subject;
a cute animal avatar (inline SVG only; do not use external images);
clicking a subject opens that subject’s game list. The list page must have a “Back to home” button at the top.
Games are shown as cards, including:

game name;
target year group;
one-line how-to-play;
a “Play” button;
if a subject has no games yet, show a dashed-border empty state.
Overall style
Bright and cute;
mainly light purple;
simple and tidy;
reflect the school colour 【blue】;
text contrast must be sufficient;
buttons should be easy to tap.
Technical requirements
Each game is a standalone HTML file. The site is only an entry platform and must not change the games themselves.
Use a “one folder per subject + one game list file” structure, so when I add games later I only put the HTML file in the subject folder and add one line to the game list, without changing any component code.
When finished, please run
type checking;
a production build;
self-verification;
then publish the site and provide a public URL.`;

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
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="font-medium text-slate-700">{t(`qwenWebStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenWebPromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_WEB_PROMPT, QWEN_WEB_PROMPT_EN)} label={t('copyPrompt', lang)} maxHeight="360px" />
      </div>

      <div>
        <h3 className="section-title">{t('sampleOutput', lang)}</h3>
        <div className="step-card overflow-hidden p-0">
          <img
            src={assetUrl('images/qwen-work/interactive-web.png')}
            alt={t('qwenWebSampleAlt', lang)}
            className="h-auto w-full max-w-full"
          />
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
      </div>
    </div>
  );
}
