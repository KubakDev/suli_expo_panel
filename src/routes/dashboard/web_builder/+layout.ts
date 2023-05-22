
export const load = (async () => {
    let sideBarPage = [
        {
            "title": "news",
            "url": "/dashboard/web_builder/news",
            "icon": 'svelte-icons-pack/bs/BsTrash'
        },
        {
            "title": "service",
            "url": "/dashboard/web_builder/service",
            "icon": 'svelte-icons-pack/bs/BsTrash'
        },

        {
            "title": "exhibition",
            "url": "/dashboard/web_builder/exhibition",
            "icon": 'svelte-icons-pack/bs/BsTrash'

        },
        {
            "title": "web builder",
            "url": "/dashboard/web_builder/web",
            "icon": 'svelte-icons-pack/bs/BsTrash'

        },
        {
            "title": "theme color",
            "url": "/dashboard/web_builder/theme_color",

        },
    ]
    return { sideBarPage };
});