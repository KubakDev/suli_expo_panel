import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

test('shows the correct text when rendered', () => {
	const { getByText } = render(Button, { props: { text: 'Test button', onClick: jest.fn() } });

	expect(getByText('Test button')).toBeInTheDocument();
});

test('reacts to a click', async () => {
	const handleClick = jest.fn();

	const { getByText } = render(Button, {
		props: {
			text: 'Test button',
			onClick: handleClick
		}
	});

	const button = getByText('Test button');

	await fireEvent.click(button);

	expect(handleClick).toHaveBeenCalledTimes(1);
});
