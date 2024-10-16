import { writable } from "svelte/store";
import type { ToastType } from "../models/toast";
 
let toastsData = writable<ToastType[]>([
]);

export function addNewToast({ title, message, type, duration = 3000 }: ToastType & { duration?: number }) {
  const newToast: ToastType = {
    title: title,
    message: message,
    type: type
  };

  toastsData.update((toasts) => {
    const updatedToasts = [...toasts, newToast];
    
    // Remove the toast after the specified duration
    setTimeout(() => {
      toastsData.update((toasts) => toasts.filter(t => t !== newToast));
    }, duration);

    return updatedToasts;
  });
}

export default toastsData;
