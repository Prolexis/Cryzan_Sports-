import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export const contactSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
  message: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres' }),
});

export const productSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  description: z.string().min(5, { message: 'La descripción es requerida' }),
  price: z.number().positive({ message: 'El precio debe ser positivo' }),
  categoryName: z.string().min(2, { message: 'Seleccione una categoría válida' }),
  image: z.string().min(1, { message: 'La URL de la imagen es requerida' }),
  stock: z.number().int().nonnegative({ message: 'El stock debe ser no negativo' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
