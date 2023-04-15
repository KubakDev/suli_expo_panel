
export const load = (async () => {
  let pages = [{
    "title": "Home",
    "url": "/",
  },
  {
    "title": "news",
    "url": "/panel/news",
  },
  {
    "title": "exhibition",
    "url": "/panel/exhibition",

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
  let primaryColor = "#bb222f";
  let colorTheme = [{
    name: "--primary-color", color: "#bb222f"
  }, {
    name: "--secondary-color", color: "#eeca52"
  }]
  return { pages, primaryColor, colorTheme };
});