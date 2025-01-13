<script lang="ts">
	import { Button, Input, Label, Spinner } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	export let form;
	let loading = false;

	$: {
		if (form?.errors) {
			loading = false;
		}
	}

	function onSubmit() {
		loading = true;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                Sign in to your account
            </h1>

            <form action="?/signin" method="POST" use:enhance class="space-y-6 mt-10">
                <div>
                    <Label for="email" class="text-sm font-medium text-gray-700 mb-1 block">
                        Email address
                    </Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e1b167] focus:border-transparent"
                        placeholder="name@company.com"
                        value={form?.email ?? ''}
                    />
                </div>

                <div>
                    <Label for="password" class="text-sm font-medium text-gray-700 mb-1 block">
                        Password
                    </Label>
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e1b167] focus:border-transparent"
                        placeholder="••••••••"
                        value={form?.password ?? ''}
                    />
                </div>

                {#if form?.errors}
                    <div class="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                        {form.errors}
                    </div>
                {/if}

                <Button
                    type="submit"
                    class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e1b167] to-[#d19d4d] hover:from-[#d19d4d] hover:to-[#c08b35] text-white font-medium text-center transition-all duration-200"
                    on:click={onSubmit}
                >
                    {#if loading}
                        <Spinner class="mr-3" size="4" color="white" />
                    {/if}
                    Sign in
                </Button>
            </form>

           
        </div>
    </div>
</div>
