export const load = async () => {
	const pages = [
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
		},
		{
			title: 'about',
			url: '/dashboard/create_About'
		},

		{
			title: 'contact',
			url: '/dashboard/create_Contact'
		},
		{
			title: 'seat-services',
			url: '/dashboard/create_SeatServices'
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
			title: 'media',
			children: [
				{
					title: 'publishing',
					url: '/dashboard/publishing'
				},
				{
					title: 'video',
					url: '/dashboard/mediaVideo'
				},
				{
					title: 'magazine',
					url: '/dashboard/magazine'
				},
				{
					title: 'gallery',
					url: '/dashboard/gallery'
				}
			]
		}
	];
	const primaryColor = '#bb222f';
	const colorTheme = [
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
