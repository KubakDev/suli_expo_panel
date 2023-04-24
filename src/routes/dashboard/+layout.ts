
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
    "url": "/dashboard/exhibition",

  },
  {
    "title": "web builder",
    "url": "/dashboard/web_builder",
    "children": [{
      "title": "Build News",
      "url": "/dashboard/web_builder/news",
    }]
  }, {
    "title": "seats",
    "url": "/dashboard/seats",

  },]
  let primaryColor = "#bb222f";
  let colorTheme = [{
    name: "--primary-color", color: "#bb222f"
  }, {
    name: "--secondary-color", color: "#eeca52"
  }]
  return { pages, primaryColor, colorTheme };
});