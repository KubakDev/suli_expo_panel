export const load = async () => {
	let sideBarPage = [
		{
			title: 'ThemeColor',
			url: '/dashboard/web_builder/buildThemeColor',
			icon: '../../../../images/icons/colorIcon.svg'
		},
		{
			title: 'News',
			url: '/dashboard/web_builder/newsBuilder',
			icon: '../../../../images/icons/newsIcon.svg'
		},
		{
			title: 'Service',
			url: '/dashboard/web_builder/serviceBuilder',
			icon: '../../../../images/icons/serviceIcon.svg'
		},
		{
			title: 'Gallery',
			url: '/dashboard/web_builder/galleryBuilder',
			icon: '../../../../images/icons/galleryIcon.svg'
		},
		{
			title: 'Magazine',
			url: '/dashboard/web_builder/magazineBuilder',
			icon: '../../../../images/icons/magazineIcon.svg'
		},
		{
			title: 'publishing',
			url: '/dashboard/web_builder/publishingBuilder',
			icon: '../../../../images/icons/publishingIcon.svg'
		},
		{
			title: 'Video',
			url: '/dashboard/web_builder/media_videoBuilder',
			icon: '../../../../images/icons/videoIcon.svg'
		},
		{
			title: 'Exhibition',
			url: '/dashboard/web_builder/exhibitionBuilder',
			icon: '../../../../images/icons/exhibitionIcon.svg'
		}
	];
	return { sideBarPage };
};
