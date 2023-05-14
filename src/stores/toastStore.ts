import { writable } from "svelte/store";
import type { ToastType } from "../models/toast";
import { ToastTypeEnum } from "../models/toastTypeEnum";

let toastsData = writable<ToastType[]>([
]);

export function addNewToast({ title, message, type }: ToastType) {
  toastsData.update((toasts) => {
    const newToast: ToastType = {
      title: title,
      message: message,
      type: type
    };
    return [...toasts, newToast];
  });
}

export default toastsData;