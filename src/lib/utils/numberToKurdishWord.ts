export function convertNumber2ku(number: number) {
  if (number < 0) return false;
  let single_digit = ['', 'یەک', 'دو', 'سێ', 'چوار', 'پێنج', 'شەش', 'حەوت', 'هەشت', 'نۆ'];
  let double_digit = [
    'دە',
    'یانزە',
    'دوانزە',
    'سیانزە',
    'چواردە',
    'پانزە',
    'شانزە',
    'حەڤدە',
    'هەژدە',
    'نۆزدە'
  ];
  let below_hundred = ['بیست', 'سی', 'چل', 'پەنجا', 'شەست', 'حەفتا', 'هەشتا', 'نەوەد'];
  if (number === 0) return 'سفر';
  function translate(number: number) {
    let word = '';
    if (number < 10) {
      word = single_digit[number] + '';
    } else if (number < 20) {
      word = double_digit[number - 10] + '';
    } else if (number < 100) {
      let rem = translate(number % 10);

      word = below_hundred[(number - (number % 10)) / 10 - 2] + (rem ? ' و ' : ' ') + rem;
    } else if (number < 1000) {
      word =
        (Math.trunc(number / 100) > 1 ? single_digit[Math.trunc(number / 100)] : '') +
        ' سەد ' +
        (translate(number % 100) ? ' و ' : ' ') +
        translate(number % 100);
    } else if (number < 1000000) {
      word =
        (parseInt((number / 1000) + '') > 1 ? translate(parseInt((number / 1000) + '')).trim() : '') +
        ' هەزار ' +
        (translate(number % 1000) ? ' و ' : ' ') +
        translate(number % 1000);
    } else if (number < 1000000000) {
      word =
        translate(parseInt((number / 1000000) + '')).trim() +
        ' ملیۆن ' +
        (translate(number % 1000000) ? ' و ' : ' ') +
        translate(number % 1000000);
    } else {
      word =
        translate(parseInt((number / 1000000000) + '')).trim() +
        ' ملیار ' +
        (translate(number % 1000000000) ? ' و ' : ' ') +
        translate(number % 1000000000);
    }
    return word;
  }
  let result = translate(number);

  return result.trim() + '';
}