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
