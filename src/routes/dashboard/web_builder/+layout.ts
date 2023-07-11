export const load = async () => {
	let sideBarPage = [
		{
			title: 'news',
			url: '/dashboard/web_builder/news',
			icon: 'svelte-icons-pack/bs/BsTrash'
		},
		{
			title: 'service',
			url: '/dashboard/web_builder/service',
			icon: 'svelte-icons-pack/bs/BsTrash'
		},

<<<<<<< HEAD
		{
			title: 'exhibition',
			url: '/dashboard/web_builder/exhibition',
			icon: 'svelte-icons-pack/bs/BsTrash'
		},
		{
			title: 'web builder',
			url: '/dashboard/web_builder',
			icon: 'svelte-icons-pack/bs/BsTrash'
		},
		{
			title: 'theme color',
			url: '/dashboard/web_builder/theme_color'
		}
	];
	return { sideBarPage };
};
=======
export const load = (async () => {
    let sideBarPage = [
        {
            "title": "News",
            "url": "/dashboard/web_builder/news",
            "icon": 'svelte-icons-pack/bs/BsTrash'
        },
        {
            "title": "Service",
            "url": "/dashboard/web_builder/service",
            "icon": 'svelte-icons-pack/bs/BsTrash'
        },

        {
            "title": "Exhibition",
            "url": "/dashboard/web_builder/exhibition",
            "icon": 'svelte-icons-pack/bs/BsTrash'

        },
        {
            "title": "Web Builder",
            "url": "/dashboard/web_builder/web",
            "icon": 'svelte-icons-pack/bs/BsTrash'

        },
        {
            "title": "Theme Color",
            "url": "/dashboard/web_builder/theme_color",

        },
    ]
    return { sideBarPage };
});
>>>>>>> 6575a20c4f5adb435220fb26782bd43d38879d68
