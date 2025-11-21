const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isString = (value: any): boolean => typeof value === 'string';
export const isNumber = (value: any): boolean => typeof value === 'number';
export const isBoolean = (value: any): boolean => typeof value === 'boolean';
export const isNumberString = (value: string): boolean =>
  isString(value) && value.trim() !== '' && !isNaN(+value);
export const isEmail = (email: string): boolean =>
  isString(email) && regex.test(email);
