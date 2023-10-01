
import n2words from 'n2words';
import { convertNumber2ku } from './numberToKurdishWord';
import { LanguageEnum } from '../../models/languageEnum';

export function convertNumberToWord(number: number, lang: string) {
  if (lang == LanguageEnum.CKB) {
    return convertNumber2ku(number);

  }
  else if (lang == LanguageEnum.AR) {
    return n2words(number, { lang: 'ar' });
  }
  else if (lang == LanguageEnum.EN) {
    return n2words(number, { lang: 'en' });
  }
}