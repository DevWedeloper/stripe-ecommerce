import { AuthError } from '@supabase/supabase-js';
import { getRequestHost, getRequestProtocol } from 'h3';
import { deleteUser } from 'src/server/use-cases/auth/delete-user';
import { exchangeCodeForSession } from 'src/server/use-cases/auth/exchange-code-for-session';
import { getUser } from 'src/server/use-cases/auth/get-user';
import { resetPasswordForEmail } from 'src/server/use-cases/auth/reset-password-for-email';
import { signInWithPassword } from 'src/server/use-cases/auth/sign-in-with-password';
import { signOut } from 'src/server/use-cases/auth/sign-out';
import { signUp } from 'src/server/use-cases/auth/sign-up';
import { updateEmail } from 'src/server/use-cases/auth/update-email';
import { updatePassword } from 'src/server/use-cases/auth/update-password';
import { createAdminClient, createClient } from 'src/supabase/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const emailSchema = z.string().email();
const passwordSchema = z.string();
const passwordWithValidationSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /\d/.test(val), {
    message: 'Password must contain at least one digit',
  })
  .refine((val) => /[\p{P}\p{S}]/u.test(val), {
    message: 'Password must contain at least one special character',
  });

const formatError = (error: AuthError) => ({
  ...error,
  code: error.code,
  status: error.status,
  name: error.name,
  message: error.message,
  stack: error.stack,
  cause: error.cause,
});

const handleResult = <T extends { error: AuthError | null }>(result: T): T => {
  if (result.error) {
    return {
      ...result,
      error: formatError(result.error),
    };
  }
  return result;
};

export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordWithValidationSchema,
      }),
    )
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await signUp(createClient(event), input);
      return handleResult(result);
    }),

  signInWithPassword: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordSchema,
      }),
    )
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await signInWithPassword(createClient(event), input);
      return handleResult(result);
    }),

  updateEmail: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await updateEmail(createClient(event), input);
      return handleResult(result);
    }),

  updatePassword: publicProcedure
    .input(z.object({ password: passwordWithValidationSchema }))
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await updatePassword(createClient(event), input);
      return handleResult(result);
    }),

  resetPasswordForEmail: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ input: { email }, ctx: { event } }) => {
      const protocol = getRequestProtocol(event);
      const host = getRequestHost(event);
      const baseURL = `${protocol}://${host}`;
      const result = await resetPasswordForEmail(createClient(event), {
        email,
        url: baseURL,
      });
      return handleResult(result);
    }),

  exchangeCodeForSession: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await exchangeCodeForSession(createClient(event), input);
      return handleResult(result);
    }),

  getUser: publicProcedure.query(async ({ ctx: { event } }) => {
    const result = await getUser(createClient(event));
    return handleResult(result);
  }),

  signOut: publicProcedure.mutation(async ({ ctx: { event } }) => {
    const result = await signOut(createClient(event));
    return handleResult(result);
  }),

  deleteUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { event } }) => {
      const result = await deleteUser(createAdminClient(event), input);
      return handleResult(result);
    }),
});
