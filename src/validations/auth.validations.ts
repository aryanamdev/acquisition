import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z
    .string()
    .email('email must be a valid email')
    .max(255)
    .toLowerCase()
    .trim(),
  role: z.enum(['user', 'admin']).default('user'),
  password: z.string().min(8).max(128),
});

export const loginSchema = registerSchema.pick({
  email: true,
  password: true,
});
