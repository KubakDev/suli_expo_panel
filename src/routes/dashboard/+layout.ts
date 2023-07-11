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
			title: 'seats-ui',
			url: '/dashboard/seats_ui'
		},
		{
			title: 'carousel',
			url: '/dashboard/carousel'
		},
		{
			title: 'about',
			url: '/dashboard/about'
		},

		{
			title: 'contact',
			url: '/dashboard/contactInfo'
		},
		{
			title: 'seatServices',
			url: '/dashboard/seatServices'
		},
		{
			title: 'web builder',
			url: '/dashboard/web_builder',
			children: [
				{
					title: 'Build News',
					url: '/dashboard/web_builder/news'
				},
				{
					title: 'Create Theme',
					url: '/dashboard/web_builder/theme_color'
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
