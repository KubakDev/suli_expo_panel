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
}
