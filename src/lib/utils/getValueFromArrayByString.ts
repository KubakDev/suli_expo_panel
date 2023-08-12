import moment from 'moment';
export function getValueFromArrayByString(item: any, slotProps: any) {
  let value = item.field
    .replace(/\[|\]\.?/g, '.')
    .split('.')
    .filter((s: any) => s)
    .reduce((acc: any, val: any) => acc && acc[val], slotProps);
  if (Array.isArray(value)) {
    value = value.join(', ');
  }
  if (item.field === 'created_at') {

    value = moment(value).format('DD/MM/YYYY HH:mm')
  }
  return value;
}