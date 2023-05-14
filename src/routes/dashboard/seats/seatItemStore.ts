import { writable } from 'svelte/store';
import { hideHandlers } from './seatDesignUtils';

const initialItem: {
    id: null | string,
    class: '',
    price: 0,
    description: '',
    isSelectable: false,
    rotation: undefined | number,
    width: undefined | number,
    height: undefined | number,
    x: undefined | number,
    y: undefined | number,
    radius: undefined | number,
    fillColor: undefined | string,
    strokeWidth: undefined | number,
}
    = {
    id: null,
    class: '',
    price: 0,
    description: '',
    isSelectable: false,
    rotation: undefined,
    width: undefined,
    height: undefined,
    x: undefined,
    y: undefined,
    radius: undefined,
    fillColor: undefined,
    strokeWidth: undefined,
};

const createItemStore = () => {
    const { subscribe, set, update } = writable(initialItem);

    return {
        subscribe,
        setItem: (item: any) => {
            set(item)
        },
        reset: (d3: any) => {
            hideHandlers(d3);
            set(initialItem);
        },
        updateItem: (field: any, value: any) => update((item) => ({ ...item, [field]: value })),
    };
};


export const seatItemStore = createItemStore();