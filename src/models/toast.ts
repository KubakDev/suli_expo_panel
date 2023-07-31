import type { ToastTypeEnum } from './toastTypeEnum';
export interface ToastType {
	id?: number;
	title?: string;
	message?: string;
	position?: string;
	time?: number;
	duration?: number;
	type: ToastTypeEnum;
}
