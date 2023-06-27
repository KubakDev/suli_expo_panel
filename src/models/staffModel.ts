import type { LanguageEnum } from './languageEnum';

export interface StaffModel {
	id: number;
	image: string;
	staff_languages?: StaffModelLang[];
}

export interface StaffModelLang {
	id?: number;
	title: string;
	name: string;
	language: LanguageEnum;
}
