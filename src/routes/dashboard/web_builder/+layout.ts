export const load = async () => {
	let sideBarPage = [
		{
			title: 'newsBuilder',
			url: '/dashboard/web_builder/newsBuilder'
		},
		{
			title: 'buildThemeColor',
			url: '/dashboard/web_builder/buildThemeColor'
		}
	];
	return { sideBarPage };
};
