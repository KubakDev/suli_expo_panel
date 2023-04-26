<script lang="ts">
	import Logo from '$lib/images/logo.svg';
	import { Button, Input, Label } from 'flowbite-svelte';
	import type { UserLogin } from '../models/userLogin';
	import { supabase } from '../supabase';
	import LoginComponent from '$lib/components/login/login.svelte';
	import { goto } from '$app/navigation';

	let userInfo: UserLogin = {
		email: '',
		password: ''
	};
	test();
	async function test() {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		console.log(session);
		if (session) goto('/dashboard/news');
	}
	async function submitForm() {
		console.log(userInfo);
		const response = await supabase.auth.signInWithPassword(userInfo);
		console.log(response);
	}
</script>

<LoginComponent />

<!-- <div class="h-screen w-full flex justify-center items-center">
	<div class="login-section flex flex-col justify-center items-center px-44">
		<h1 class="text-2xl font-bold">login here</h1>
		<img src={Logo} alt="logo" class="h-44 w-44" />
		<form class="w-full" action="?/login">
			<div>
				<Label for="first_name" class="mb-2">Email</Label>
				<Input
					type="text"
					id="first_name"
					placeholder="example@example.com"
					required
					bind:value={userInfo.email}
				/>
			</div>
			<div class="my-5">
				<Label for="first_name" class="mb-2">Password</Label>
				<Input
					type="password"
					id="first_name"
					placeholder="*********"
					required
					bind:value={userInfo.password}
				/>
			</div>
			<Button type="submit" class="w-full">Submit</Button>
		</form>
	</div>
</div> -->

<style lang="scss">
	.login-section {
		height: 50%;
		width: 40%;
		background-color: rgb(249, 249, 249);
		box-shadow: 2px 2px 5px rgb(200, 199, 199);
		border-radius: 10px;
	}
</style>
