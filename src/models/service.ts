import type { ImgSourceEnum } from "./imgSourceEnum";
import type { LanguageEnum } from "./languageEnum";

export interface Service {
  id?: number;
  thumbnail: string;
  service_languages: ServiceLanguage[],
  imgSource?: ImgSourceEnum,
  primaryColor?: string,
  onPrimaryColor?: string,
}
export interface ServiceLanguage {
  title: string;
  short_description: string;
  language: LanguageEnum;
}