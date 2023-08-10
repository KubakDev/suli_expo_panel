import type { CompanyType } from './companyModel';
import type { ExhibitionModel } from './exhibitionTypeModel';
import type { ReservationStatusEnum } from './reservationEnum';

export interface Reservation {
	id: number;
	exhibition_id: number;
	object_id: number;
	services: string[];
	company_id: number;
	company: CompanyType;
	exhibition: ExhibitionModel;
	status: ReservationStatusEnum;
}
