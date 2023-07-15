export const load = async () => {
	const pages = [
		{
			title: 'Home',
			url: '/dashboard'
		},
		{
			title: 'News',
			url: '/dashboard/news'
		},
		{
			title: 'Services',
			url: '/dashboard/service'
		},
		{
			title: 'Exhibition',
			url: '/dashboard/exhibition'
		},

		{
			title: 'Seats-UI',
			url: '/dashboard/seats_ui'
		},
		{
			title: 'Carousel',
			url: '/dashboard/carousel'
		},
		{
			title: 'About',
			url: '/dashboard/about'
		},

		{
			title: 'Contact',
			url: '/dashboard/contactInfo'
		},
		{
			title: 'Seat Services',
			url: '/dashboard/seatServices'
		},
		{
			title: 'Web Builder',
			url: '/dashboard/web_builder/buildThemeColor'
		},
		{
			title: 'Media',
			children: [
				{
					title: 'Publishing',
					url: '/dashboard/publishing'
				},
				{
					title: 'Video',
					url: '/dashboard/mediaVideo'
				},
				{
					title: 'Magazine',
					url: '/dashboard/magazine'
				},
				{
					title: 'Gallery',
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
