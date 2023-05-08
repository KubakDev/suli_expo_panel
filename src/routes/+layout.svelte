<script lang="ts">
	import './styles.scss';
	import '../app.postcss';
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { setSupabaseStore, supabaseStore } from '../stores/supabaseStore';
	import CustomAlert from '$lib/components/alert/CustomAlert.svelte';
	import { alertStore } from '../stores/alertStore';
	export let data: PageData;
	$: ({ supabase, session } = data);

	onMount(() => {
		// supabaseStore.set(supabase);
		supabase.auth.getUser().then((user) => {
			if (!user) {
				invalidate('supabase:auth');
			}
		});
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="alerts">
	{#each $alertStore as alert}
		<CustomAlert type={alert.type} message={alert.message} title={alert.title} />
	{/each}
</div>
<slot />
