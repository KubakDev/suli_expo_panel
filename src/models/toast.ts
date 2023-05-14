import type { ToastTypeEnum } from "./toastTypeEnum"
export interface ToastType {
  id?: number;
  title?: string;
  message?: string;
  type: ToastTypeEnum;
}