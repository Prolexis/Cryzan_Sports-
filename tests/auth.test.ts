import { describe, it, expect } from 'vitest';
import { loginSchema } from '../lib/schemas';

describe('Validación de Esquema de Autenticación (Zod)', () => {
  it('debe validar credenciales válidas', () => {
    const result = loginSchema.safeParse({
      email: 'admin@cryzan.com',
      password: '123456Password',
    });

    expect(result.success).toBe(true);
  });

  it('debe rechazar correos inválidos o contraseñas cortas', () => {
    const resultEmail = loginSchema.safeParse({
      email: 'correo-invalido',
      password: '123456Password',
    });
    expect(resultEmail.success).toBe(false);

    const resultPassword = loginSchema.safeParse({
      email: 'admin@cryzan.com',
      password: '123',
    });
    expect(resultPassword.success).toBe(false);
  });
});
