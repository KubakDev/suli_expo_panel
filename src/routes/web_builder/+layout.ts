
export const load = (async () => {
    let sideBarPage = [{
        "title": "news",
        "url": "/web_builder/news",
        "icon": 'svelte-icons-pack/bs/BsTrash'
    },

    {
        "title": "exhibition",
        "url": "/web_builder/exhibition",
        "icon": 'svelte-icons-pack/bs/BsTrash'

    },
    {
        "title": "web builder",
        "url": "/web_builder/web",
        "icon": 'svelte-icons-pack/bs/BsTrash'

    }]
    return { sideBarPage };
});