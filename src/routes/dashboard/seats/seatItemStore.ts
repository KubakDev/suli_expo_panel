import { writable } from 'svelte/store';

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
};

const createItemStore = () => {
    const { subscribe, set, update } = writable(initialItem);

    return {
        subscribe,
        setItem: (item: any) => {
            console.log(item)
            set(item)
        },
        reset: () => set(initialItem),
        updateItem: (field: any, value: any) => update((item) => ({ ...item, [field]: value })),
    };
};


export const seatItemStore = createItemStore();