const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  theme: {
    colors: {
      danger: '#cf250d',
      hoverBox: '#e0dddd',
      info: '#c27803',
      backgroundComponent: "#f2f3f7"

    },
    extend: {
      height: {
        '128': '32rem',
        'screen-1/2': '50vh',
        'screen-1/3': '33.333333vh',
        'screen-2/3': '66.666667vh',
        'screen-1/4': '25vh',
      }
    },
  },

  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class',

};

module.exports = config;