import type { LayoutLoad } from "./$types";

export const load = (async () => {
    let sideBarPage = [{
        "title": "news",
        "url": "/web_builder/news",
    },

    {
        "title": "exhibition",
        "url": "/web_builder/exhibition",

    },
    {
        "title": "web builder",
        "url": "/web_builder/web",

    }]
    return { sideBarPage };
});