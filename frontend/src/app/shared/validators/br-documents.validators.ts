import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { z } from 'zod';

const onlyDigits = (value: unknown): string => String(value ?? '').replace(/\D/g, '');

const allDigitsEqual = (digits: string): boolean => /^([0-9])\1+$/.test(digits);

function isValidCpfDigits(cpf: string): boolean {
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;

  return remainder === Number(cpf[10]);
}

function isValidCnpjDigits(cnpj: string): boolean {
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base = cnpj.slice(0, 12);
  const first = calcDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calcDigit(`${base}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj.endsWith(`${first}${second}`);
}

const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine((cpf) => cpf.length === 11, { message: 'CPF deve conter 11 digitos' })
  .refine((cpf) => isValidCpfDigits(cpf), { message: 'CPF invalido' });

const cnpjSchema = z
  .string()
  .transform(onlyDigits)
  .refine((cnpj) => cnpj.length === 14, { message: 'CNPJ deve conter 14 digitos' })
  .refine((cnpj) => isValidCnpjDigits(cnpj), { message: 'CNPJ invalido' });

const phoneSchema = z
  .string()
  .transform(onlyDigits)
  .refine((phone) => phone.length === 10 || phone.length === 11, {
    message: 'Telefone deve conter 10 ou 11 digitos',
  });

function buildValidator(
  schema: z.ZodSchema<string>,
  errorKey: string,
  options?: { allowEmpty?: boolean },
): ValidatorFn {
  const allowEmpty = options?.allowEmpty ?? false;

  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;
    if (
      allowEmpty &&
      (rawValue === null || rawValue === undefined || String(rawValue).trim() === '')
    ) {
      return null;
    }

    const result = schema.safeParse(String(rawValue ?? ''));
    if (result.success) {
      return null;
    }

    return { [errorKey]: true };
  };
}

export const cpfValidator = buildValidator(cpfSchema, 'cpfInvalid', { allowEmpty: true });
export const cnpjValidator = buildValidator(cnpjSchema, 'cnpjInvalid', { allowEmpty: true });
export const telefoneValidator = buildValidator(phoneSchema, 'telefoneInvalid', {
  allowEmpty: true,
});
export const celularValidator = buildValidator(phoneSchema, 'celularInvalid');
