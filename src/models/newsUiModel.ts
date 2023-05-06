import type { ColorTheme } from "./colorTheme";



export interface NewsUiModel {

    id: number;
    component_type: ComponentType;
    component: Component;
    color_palette: ColorTheme;

}



export interface Component {
    title: string;
}
export interface ComponentType {
    id: number;
    type: string;
}