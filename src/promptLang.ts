import { Lang } from './i18n';

/** Show the English prompt in English UI; otherwise the Chinese prompt. */
export function promptForLang(lang: Lang, chinese: string, english: string): string {
  return lang === 'en' ? english : chinese;
}
