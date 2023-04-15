const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  theme: {
    colors: {
      danger: '#cf250d',
      hoverBox: '#e0dddd',
      info: '#c27803'

    },
    extend: {
    },
  },

  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class',

};

module.exports = config;