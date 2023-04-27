import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg'



const svgOptions: any = {
	type: 'component',
	svgoOptions: {
		plugins: [
			{ removeViewBox: false },
			{ removeDimensions: true },
			{ removeAttrs: { attrs: '(stroke|fill)' } }
		]
	},
	includePaths: ['src/static/']
};

export default defineConfig({
	plugins: [
		sveltekit(

		),
		svg({
			includePaths: ['./src/lib/icons/', './src/assets/icons/'],
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: 'preset-default',
						// by default svgo removes the viewBox which prevents svg icons from scaling
						// not a good idea! https://github.com/svg/svgo/pull/1461
						params: { overrides: { removeViewBox: false } },
					},
					{ name: 'removeAttrs', params: { attrs: '(fill|stroke)' } },
				],
			},
		}),
		svg({
			includePaths: ['./src/lib/graphics/'],
			svgoOptions: {
				multipass: true,
				plugins: ['preset-default'],
			},
		}),
	]
});
