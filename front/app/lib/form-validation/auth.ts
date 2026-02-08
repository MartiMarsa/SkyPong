// /app/libs/validations/auth.ts
import { z } from "zod";


export const loginSchema = (t) => z.object({
    email: z.string()
        .min(8, t.form.errors.required) // Texto personalizado para campo vacío
        .email(t.form.errors.invalidFormat), // Texto para formato email
    password: z
    .string()
    .min(8, { message: t.form.errors.minLength(8) })
    .regex(/[a-zA-Z]/, { message: t.form.errors.containsLetter })
    .regex(/[0-9]/, { message: t.form.errors.containsNumber })
    .regex(/[^a-zA-Z0-9]/, {
      message: t.form.errors.containsSpecialCharacter
    })
    .trim()
});

export const signUpSchema =  (t) => z.object({
  email: z.string().email(t.form.invalidEmail),
  password: z.string().min(8, t.form.passwordTooShort),
  confirmPassword: z.string().min(8, t.form.confirmPasswordTooShort),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.form.passwordsDoNotMatch,
  path: ["confirmPassword"],
});
