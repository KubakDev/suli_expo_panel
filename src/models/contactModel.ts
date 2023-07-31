import type { LanguageEnum } from './languageEnum';

export interface ContactModel {
	id?: number;
	created_at?: Date;
	facebook_link: string;
	instagram_link: string;
	linkedin_link: string;
	youtube_link: string;
	twitter_link: string;
	contact_info_languages?: ContactModelLang[];
}

export interface ContactModelLang {
	id?: number;
	location: string;
	email: string;
	phoneNumber_relations: string;
	phoneNumber_Technical: string;
	phoneNumber_Administration: string;
	phoneNumber_marketing: string;
	language: LanguageEnum;
	created_at?: Date;
}
