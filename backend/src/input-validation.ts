import { BadRequestException } from '@nestjs/common';

function hasInvalidControls(value: string, multiline = false) {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code === 127 || (code < 32 && !(multiline && [9, 10, 13].includes(code)))) return true;
  }
  return false;
}

export function bodyRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Envía un objeto con los datos del registro.');
  }
  return value as Record<string, unknown>;
}

export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new BadRequestException('El identificador no es válido.');
  }
  return value;
}

export function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength || hasInvalidControls(value)) {
    throw new BadRequestException(`${label} debe tener entre 1 y ${maxLength} caracteres.`);
  }
  return value.trim();
}

export function nullableText(value: unknown, label: string, maxLength: number, multiline = false): string | null {
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > maxLength || hasInvalidControls(value, multiline)) {
    throw new BadRequestException(`${label} debe ser un texto de hasta ${maxLength} caracteres.`);
  }
  return value.trim() || null;
}

export function booleanValue(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new BadRequestException(`${label} debe ser verdadero o falso.`);
  return value;
}

export function positiveAmount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 99999999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
    throw new BadRequestException('El descuento debe ser un número positivo con hasta dos decimales.');
  }
  return value;
}

export function requireChanges(data: Record<string, unknown>, fields: readonly string[]) {
  if (!fields.some(field => data[field] !== undefined)) throw new BadRequestException('Envía al menos un campo para actualizar.');
}
