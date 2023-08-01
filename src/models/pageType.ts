import type { ColorTheme } from './colorTheme';
import type { ComponentType } from './newsUiModel';

export interface PageData {
	id?: number;
	componentId: number;
	componentTypeId: number;
	page: string;
	color_palette_id_lightMode: number;
	color_palette_id_darkMode: number;
	status?: boolean;
	color_palette_light: ColorTheme;
	color_palette_dark: ColorTheme;
	component_type: ComponentType;
}
