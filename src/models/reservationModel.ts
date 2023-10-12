import type { CompanyType } from './companyModel';
import type { ExhibitionModel } from './exhibitionTypeModel';
import type { ReservationStatusEnum } from './reservationEnum';
import { type } from './../lib/components/DateTimePicker/parse';

export interface Reservation {
	id?: number;
	exhibition_id?: number;
	object_id?: number;
	comments?: string[];
	services?: string[];
	company_id?: number;
	companies?: CompanyType[];
	company?: CompanyType;
	exhibitions?: ExhibitionModel[];
	status?: ReservationStatusEnum;
	created_at?: Date;
	reserved_areas?: string[];
	total_count?: number;
}

export interface ReservationStatus {
	id?: number;
	exhibition_id?: number;
	object_id?: number;
	comment?: string;
	services?: string[];
	company_id?: number;
	companies?: CompanyType[];
	company?: CompanyType[];
	exhibition?: ExhibitionModel[];
	status?: ReservationStatusEnum;
	created_at?: Date;
	reserved_areas?: string[];
	total_count?: number;
}
