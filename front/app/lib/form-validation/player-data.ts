// /app/lib/form-validation/auth.ts
import { z } from "zod";

export const playerDataSchema = (t: any) => {
  // Define errores con valores por defecto
  const errors = {
    nicknameRequired: t?.user?.errors?.nicknameRequired || 'Nickname is required',
    nicknameMinLength: t?.user?.errors?.nicknameMinLength(8) || 'Nickname must be at least 8 characters',
    whinphraseRequired: t?.user?.errors?.winphraseRequired || 'Winphrase is required',
    winphraseMinLength: t?.user?.errors?.winphraseMinLength(8) || 'Winphrase must be at least 8 characters',
  };

  return z.object({
    nickname: z.string()
      .min(1, { message: errors.nicknameRequired }) 
      .min(8, { message: errors.nicknameMinLength }), 
    winPhrase: z.string()
      .min(1, { message: errors.whinphraseRequired }) 
      .min(8, { message: errors.winphraseMinLength })
  });
};

