import type { ExhibitionsModel } from "./exhibitionModel"
import type { LanguageEnum } from "./languageEnum"

export interface InsertSeatDataModel {

  name?: string,
  exhibition?: ExhibitionsModel,
  image_url?: string,
  is_active?: boolean,
  design?: string,

}
export interface SeatPrivacyPolicyModel {
  language?: LanguageEnum,
  description?: string,
  discount_description?: string,
  extra_discount_description?: string,
}