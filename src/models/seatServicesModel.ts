import type { LanguageEnum } from './languageEnum';

export interface seatServicesModel {
	id: number;
	icon: string;
	price?: number;
	created_at?: Date;
	seat_services_languages?: seatServicesModelLang[];
}

export interface seatServicesModelLang {
	id?: number;
	title: string;
	description: string;
	language: LanguageEnum;
}
