export interface Reservation {
	id?: number;
	exhibition_id: number;
	object_id: number;
	services: string[];
	company_id: number;
	status: ReservationStatusEnum;
}

export enum ReservationStatusEnum {
	ACCEPT = 'accept',
	REJECT = 'reject'
}
