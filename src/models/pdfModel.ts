import type { ImgSourceEnum } from './imgSourceEnum';

export interface PDFModel {
	id: number;
	imgurl: string;
	imgSource: ImgSourceEnum;
	fileName?: File[] | string;
}
