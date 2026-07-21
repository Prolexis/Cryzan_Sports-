import { describe, it, expect } from 'vitest';
import { contactSchema } from '../lib/schemas';

describe('Validación de Formulario de Contacto (Zod)', () => {
  it('debe aceptar datos de contacto válidos', () => {
    const result = contactSchema.safeParse({
      name: 'Carlos Mendoza',
      email: 'carlos@ejemplo.com',
      message: 'Deseo información sobre la disponibilidad de casacas.',
    });

    expect(result.success).toBe(true);
  });

  it('debe rechazar mensajes de contacto demasiado cortos', () => {
    const result = contactSchema.safeParse({
      name: 'Carlos',
      email: 'carlos@ejemplo.com',
      message: 'Hola',
    });

    expect(result.success).toBe(false);
  });
});
