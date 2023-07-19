import { writable } from 'svelte/store';
import type { ComponentType } from '../models/ComponentTypeModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const component = writable<ComponentType[]>([]);

//Get all component data
export const getComponentData = async (supabase: SupabaseClient) => {
	const { data } = await supabase.from('component_type').select('*').order('id');
	component.set(data as ComponentType[]);

	return data as ComponentType[];
};
