import type { ImgSourceEnum } from './imgSourceEnum';

export interface ImagesModel {
	id: number;
	imgurl: string;
	imgSource: ImgSourceEnum;
	fileName?: File[] | string;
}
