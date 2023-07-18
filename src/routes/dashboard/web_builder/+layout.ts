export const load = async () => {
	let sideBarPage = [
		{
			title: 'Build ThemeColor',
			url: '/dashboard/web_builder/buildThemeColor',
			icon: '../../../../images/icons/Frame-1.svg'
		},
		{
			title: 'Build News',
			url: '/dashboard/web_builder/newsBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build Service',
			url: '/dashboard/web_builder/serviceBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build Gallery',
			url: '/dashboard/web_builder/galleryBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build Magazine',
			url: '/dashboard/web_builder/magazineBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build publishing',
			url: '/dashboard/web_builder/publishingBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build Video',
			url: '/dashboard/web_builder/media_videoBuilder',
			icon: '../../../../images/icons/Frame.svg'
		}
	];
	return { sideBarPage };
};
