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
      }
    },
  },

  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class',

};

module.exports = config;