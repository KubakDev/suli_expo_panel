
export const load = (async () => {
  let pages = [{
    "title": "Home",
    "url": "/",
  },
  {
    "title": "news",
    "url": "/dashboard/news",
  },
  {
    "title": "exhibition",
    "url": "/exhibition",
  },
  {
    "title": "web builder",
    "url": "/web_builder",
  }]
  return { pages };
});