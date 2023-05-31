import { redirect } from '@sveltejs/kit';
import { goto } from '$app/navigation';

export const load = async () => {
	let pages = [
		{
			title: 'Home',
			url: '/'
		},
		{
			title: 'news',
			url: '/dashboard/news'
		},
		{
			title: 'services',
			url: '/dashboard/service'
		},
		{
			title: 'exhibition',
			url: '/dashboard/exhibition'
		},
		{
			title: 'web builder',
			url: '/dashboard/web_builder',
			children: [
				{
					title: 'Build News',
					url: '/dashboard/web_builder/news'
				}
			]
		},
		{
			title: 'seats',
			url: '/dashboard/seats'
		},
		{
			title: 'seats-ui',
			url: '/dashboard/seats_ui'
		},
		{
			title: 'carousel',
			url: '/dashboard/create_carousel'
		}
	];
	let primaryColor = '#bb222f';
	let colorTheme = [
		{
			name: '--primary-color',
			color: '#bb222f'
		},
		{
			name: '--secondary-color',
			color: '#eeca52'
		}
	];

	return { pages, primaryColor, colorTheme };
};
