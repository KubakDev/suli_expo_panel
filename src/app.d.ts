// src/app.d.ts

import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
		declare module '*.svg?component' {
			import type { ComponentType, SvelteComponentTyped } from 'svelte'
			import type { SVGAttributes } from 'svelte/elements'

			const content: ComponentType<
				SvelteComponentTyped<SVGAttributes<SVGSVGElement>>
			>

			export default content
		}

		declare module '*.svg?src' {
			const content: string
			export default content
		}

		declare module '*.svg?url' {
			const content: string
			export default content
		}

		declare module '*.svg?dataurl' {
			const content: string
			export default content
		}

		declare module '*.svg?dataurl=base64' {
			const content: string
			export default content
		}

		declare module '*.svg?dataurl=enc' {
			const content: string
			export default content
		}

		declare module '*.svg?dataurl=unenc' {
			const content: string
			export default content
		}
		// interface Error {}
		// interface Platform {}
	}
}

