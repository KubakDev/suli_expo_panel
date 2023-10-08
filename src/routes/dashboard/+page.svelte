<script lang="ts">
	import { onMount } from 'svelte';
	import { getViewerData, viewerData } from '../../stores/viewersStore.js';
	//@ts-ignore
	import Countup from 'svelte-countup';
	import BarChart from '$lib/components/BarChart.svelte';

	export let data;
	let isDataLoaded = false;
	let selectedDate: Date;

	async function fetchData() {
		await getViewerData(data.supabase, 1, undefined);
		isDataLoaded = true;
	}
	onMount(fetchData);

	// This will be a string formatted as 'YYYY-MM-DD'

	async function handleDateChange() {
		await getViewerData(data.supabase, 1, selectedDate);
	}

	function formatDate(dateString: any) {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
</script>

{#if isDataLoaded}
	<div class="max-w-screen-2xl mx-auto py-10">
		<!-- filter by depend month  -->
		<div class="flex justify-end px-4">
			<input
				type="date"
				name="date_filter"
				class="text-gray-900 rounded dark:border-gray-700 border-gray-300 dark:bg-gray-900 dark:text-white"
				bind:value={selectedDate}
				on:change={handleDateChange}
			/>
		</div>

		<!-- card header -->
		<div class="flex flex-col flex-auto flex-shrink-0 antialiased text-black dark:text-white">
			<div class="h-full mb-10">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
					<div
						class="bg-white dark:bg-gray-900 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#ff6384] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<svg
								class="w-20 h-16"
								viewBox="0 0 48 48"
								id="b"
								xmlns="http://www.w3.org/2000/svg"
								fill="#000000"
								><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
									id="SVGRepo_tracerCarrier"
									stroke-linecap="round"
									stroke-linejoin="round"
								/><g id="SVGRepo_iconCarrier">
									<defs>
										<style>
											.g {
												fill: none;
												stroke: #000000;
												stroke-linecap: round;
												stroke-linejoin: round;
											}
										</style>
									</defs>
									<path
										id="c"
										class="g"
										d="m40.5,5.5H7.5c-1.1046,0-2,.8954-2,2v33c0,1.1046.8954,2,2,2h33c1.1046,0,2-.8954,2-2V7.5c0-1.1046-.8954-2-2-2Z"
									/>
									<g>
										<path id="d" class="g" d="m20.373,11.5005h16.502v5h-16.502v-5Z" />
										<path id="e" class="g" d="m20.373,21.5h16.502v5h-16.502v-5Z" />
										<path id="f" class="g" d="m20.373,31.4995h16.502v5h-16.502v-5Z" />
										<rect class="g" x="11.125" y="11.5005" width="5" height="5" />
										<rect class="g" x="11.125" y="21.5" width="5" height="5" />
										<rect class="g" x="11.125" y="31.4995" width="5" height="5" />
									</g>
								</g></svg
							>
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.news_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.news_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>News Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
					<div
						class="bg-white dark:bg-gray-900 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#36a2eb] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<svg
								class="w-20 h-16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
									id="SVGRepo_tracerCarrier"
									stroke-linecap="round"
									stroke-linejoin="round"
								/><g id="SVGRepo_iconCarrier">
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M11.9427 1.25H12.0575C14.3659 1.24999 16.1749 1.24998 17.5864 1.43975C19.0311 1.63399 20.1712 2.03933 21.066 2.93414C21.9608 3.82895 22.3661 4.96897 22.5603 6.41371C22.7501 7.82519 22.7501 9.63423 22.7501 11.9426V12.0574C22.7501 12.5023 22.7501 12.9287 22.7487 13.3372C22.7508 13.3696 22.7507 13.4025 22.7484 13.4356C22.7419 15.1021 22.7106 16.4688 22.5603 17.5863C22.3661 19.031 21.9608 20.1711 21.066 21.0659C20.1712 21.9607 19.0311 22.366 17.5864 22.5603C16.8486 22.6594 16.0023 22.7068 15.0327 22.7294C14.9408 22.7515 14.8431 22.7566 14.7438 22.7414C14.7332 22.7398 14.7228 22.7379 14.7124 22.7359C13.9107 22.75 13.0282 22.75 12.0575 22.75H11.9427C9.63433 22.75 7.82529 22.75 6.4138 22.5603C4.96907 22.366 3.82904 21.9607 2.93423 21.0659C2.03942 20.1711 1.63408 19.031 1.43984 17.5863C1.25007 16.1748 1.25008 14.3658 1.2501 12.0574V11.9426C1.25009 11.3365 1.25009 10.7647 1.25352 10.2256C1.24841 10.1729 1.24893 10.1208 1.25462 10.07C1.26582 8.62518 1.30473 7.41868 1.43984 6.41371C1.63408 4.96897 2.03942 3.82895 2.93423 2.93414C3.82904 2.03933 4.96907 1.63399 6.4138 1.43975C7.82529 1.24998 9.63432 1.24999 11.9427 1.25ZM2.75118 10.8037C2.75015 11.1826 2.7501 11.5809 2.7501 12C2.7501 14.3782 2.75169 16.0864 2.92647 17.3864C3.09834 18.6648 3.42524 19.4355 3.99489 20.0052C4.56455 20.5749 5.33527 20.9018 6.61367 21.0736C7.91365 21.2484 9.62187 21.25 12.0001 21.25C12.8044 21.25 13.5321 21.2498 14.1933 21.2428C14.7362 15.0501 9.3515 9.85595 3.08743 10.7554L2.75118 10.8037ZM15.7011 21.2078C16.3324 21.182 16.8893 21.1405 17.3865 21.0736C18.6649 20.9018 19.4356 20.5749 20.0053 20.0052C20.575 19.4355 20.9018 18.6648 21.0737 17.3864C21.194 16.4918 21.2323 15.4038 21.2444 14.0371L20.9238 13.9927C18.5043 13.6577 16.3038 14.7947 15.0847 16.636C15.5912 18.0541 15.8189 19.6005 15.7011 21.2078ZM14.3875 15.0736C12.2459 11.1169 7.79524 8.56403 2.87423 9.27064L2.76456 9.28639C2.78339 8.2301 2.82673 7.35537 2.92647 6.61358C3.09834 5.33517 3.42524 4.56445 3.99489 3.9948C4.56455 3.42514 5.33527 3.09825 6.61367 2.92637C7.91365 2.75159 9.62187 2.75 12.0001 2.75C14.3783 2.75 16.0865 2.75159 17.3865 2.92637C18.6649 3.09825 19.4356 3.42514 20.0053 3.9948C20.575 4.56445 20.9018 5.33517 21.0737 6.61358C21.2485 7.91356 21.2501 9.62178 21.2501 12C21.2501 12.1783 21.2501 12.3528 21.25 12.5236L21.1295 12.5069C18.4402 12.1345 15.9698 13.22 14.3875 15.0736ZM16.0001 6.75C15.3097 6.75 14.7501 7.30964 14.7501 8C14.7501 8.69036 15.3097 9.25 16.0001 9.25C16.6905 9.25 17.2501 8.69036 17.2501 8C17.2501 7.30964 16.6905 6.75 16.0001 6.75ZM13.2501 8C13.2501 6.48122 14.4813 5.25 16.0001 5.25C17.5189 5.25 18.7501 6.48122 18.7501 8C18.7501 9.51878 17.5189 10.75 16.0001 10.75C14.4813 10.75 13.2501 9.51878 13.2501 8Z"
										fill="#1C274C"
									/>
								</g></svg
							>
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.exhibition_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.exhibition_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>Exhibition Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
					<div
						class="bg-white dark:bg-gray-900 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#ffce56] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<svg
								class="w-20 h-16"
								viewBox="0 0 48 48"
								id="b"
								xmlns="http://www.w3.org/2000/svg"
								fill="#000000"
								><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
									id="SVGRepo_tracerCarrier"
									stroke-linecap="round"
									stroke-linejoin="round"
								/><g id="SVGRepo_iconCarrier">
									<defs>
										<style>
											.g {
												fill: none;
												stroke: #000000;
												stroke-linecap: round;
												stroke-linejoin: round;
											}
										</style>
									</defs>
									<path
										id="c"
										class="g"
										d="m40.5,5.5H7.5c-1.1046,0-2,.8954-2,2v33c0,1.1046.8954,2,2,2h33c1.1046,0,2-.8954,2-2V7.5c0-1.1046-.8954-2-2-2Z"
									/>
									<g>
										<path id="d" class="g" d="m20.373,11.5005h16.502v5h-16.502v-5Z" />
										<path id="e" class="g" d="m20.373,21.5h16.502v5h-16.502v-5Z" />
										<path id="f" class="g" d="m20.373,31.4995h16.502v5h-16.502v-5Z" />
										<rect class="g" x="11.125" y="11.5005" width="5" height="5" />
										<rect class="g" x="11.125" y="21.5" width="5" height="5" />
										<rect class="g" x="11.125" y="31.4995" width="5" height="5" />
									</g>
								</g></svg
							>
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.suly_expo_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.suly_expo_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>SulyExpo Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- chart js -->
		<div class="px-4"><BarChart {data} /></div>
	</div>
{/if}
