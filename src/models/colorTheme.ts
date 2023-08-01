export interface ColorTheme {
	id?: number;
	name?: string;
	primaryColor?: string;
	secondaryColor?: string;
	overlayPrimaryColor?: string;
	overlaySecondaryColor?: string;
	backgroundColor?: string;
	overlayBackgroundColor?: string;
	active?: boolean | null;
	mode_type: ModeTypeEnum;
}

export enum ModeTypeEnum {
	DARK = 'dark',
	LIGHT = 'light'
}
