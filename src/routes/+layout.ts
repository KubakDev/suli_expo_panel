
export const load = (async () => {
  let pages = [{
    "title": "Home",
    "url": "/",
  },
  {
    "title": "news",
    "url": "/news",
  },
  {
    "title": "exhibition",
    "url": "/exhibition",

  },
  {
    "title": "web builder",
    "url": "/web_builder",
    "children": [{
      "title": "Build News",
      "url": "/web_builder/news",
    }]
  }, {
    "title": "seats",
    "url": "/seats",

  },]
  return { pages };
});