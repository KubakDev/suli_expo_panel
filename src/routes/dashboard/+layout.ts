export const load = async () => {
	const pages = [
		{
			title: 'Promotions',
			url: '/dashboard/promotions'
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
			title: 'seatServices',
			url: '/dashboard/seatServices'
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
			title: 'Reservation',
			url: `/dashboard/reservation/1`
		},
		{
			title: 'Company',
			url: '/dashboard/companiesInfo/1'
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
