// src/alertStore.ts
import { writable } from 'svelte/store';

interface Alert {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

const createAlertStore = () => {
    const state = writable<Alert[]>([]);

    const addAlert = (title: string, message: string, type: Alert['type'] = 'info') => {

        const id = Date.now();
        state.update((alerts) => [...alerts, { id, title, message, type }]);
        setTimeout(() => removeAlert(id), 5000);
    };

    const removeAlert = (id: number) => {
        state.update((alerts) => alerts.filter((alert) => alert.id !== id));
    };

    return {
        subscribe: state.subscribe,
        addAlert,
        removeAlert,
    };
};

export const alertStore = createAlertStore();
