import type { UserInfo } from './usersModel';

export interface CompanyType {
	id?: number;
	company_name?: string;
	created_at?: Date;
	email?: string;
	logo_url?: string;
	phone_number?: string;
	type?: string;
	uid?: UserInfo;
	comment?: string;
	address?: string;
	passport_number?: string;
	manager_name?: string;
	working_field?: string;
	passport_image?: string[];
	user_image?: string[];
	country?: string;
	edit?: boolean;
}
