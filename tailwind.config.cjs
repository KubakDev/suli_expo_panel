const config = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
		'./node_modules/kubak-svelte-component/**/*.{html,js,svelte}'
	],

	theme: {
		colors: {
			secondary: {
				DEFAULT: '#292E36'
			},
			primary: {
				50: '#c',
				100: '#E1B168',
				200: '#E1B168',
				300: '#E1B168',
				400: '#E1B168',
				500: '#E1B168',
				600: '#E1B168',
				700: '#E1B168',
				800: '#E1B168',
				900: '#E1B168',
				DEFAULT: '#E1B168', //500
				on: '#E1B168', //50
				dark: {
					DEFAULT: '#E1B168', //300
					on: '#E1B168' //800
				}
			},
			status: {
				"Pending": "#111827",
				"Accept": "#10B981",
				"Rejected": "#EF4444",
			},
			danger: '#cf250d',
			hoverBox: '#e0dddd',
			info: '#c27803',
			backgroundComponent: '#f2f3f7'
		},
		extend: {
			minWidth: {
				10: '2.5rem',
				20: '5rem',
				32: '8rem',
				40: '10rem',
				48: '12rem',
				64: '16rem',
				80: '20rem',
				96: '24rem',
				128: '32rem',
				150: '37.5rem',
				175: '43.75rem'
			},
			height: {
				128: '32rem',
				'screen-1/2': '50vh',
				'screen-1/3': '33.333333vh',
				'screen-2/3': '66.666667vh',
				'screen-1/4': '25vh'
			}
		}
	},
	plugins: [require('flowbite/plugin')],

	darkMode: 'class'
};

module.exports = config;
