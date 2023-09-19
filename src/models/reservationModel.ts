import type { CompanyType } from './companyModel';
import type { ExhibitionModel } from './exhibitionTypeModel';
import type { ReservationStatusEnum } from './reservationEnum';

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
}
