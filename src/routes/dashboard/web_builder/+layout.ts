export const load = async () => {
	let sideBarPage = [
		{
			title: 'News Builder',
			url: '/dashboard/web_builder/newsBuilder',
			icon: '../../../../images/icons/Frame.svg'
		},
		{
			title: 'Build ThemeColor',
			url: '/dashboard/web_builder/buildThemeColor',
			icon: '../../../../images/icons/Frame-1.svg'
		}
	];
	return { sideBarPage };
};
