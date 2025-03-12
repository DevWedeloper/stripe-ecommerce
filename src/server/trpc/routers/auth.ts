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
import { protectedProcedure, publicProcedure, router } from '../trpc';

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

export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordWithValidationSchema,
      }),
    )
    .mutation(
      async ({ input, ctx: { event } }) =>
        await signUp(createClient(event), input),
    ),

  signInWithPassword: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordSchema,
      }),
    )
    .mutation(
      async ({ input, ctx: { event } }) =>
        await signInWithPassword(createClient(event), input),
    ),

  updateEmail: protectedProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(
      async ({ input, ctx: { event } }) =>
        await updateEmail(createClient(event), input),
    ),

  updatePassword: protectedProcedure
    .input(z.object({ password: passwordWithValidationSchema }))
    .mutation(
      async ({ input, ctx: { event } }) =>
        await updatePassword(createClient(event), input),
    ),

  resetPasswordForEmail: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ input: { email }, ctx: { event } }) => {
      const protocol = getRequestProtocol(event);
      const host = getRequestHost(event);
      const baseURL = `${protocol}://${host}`;

      return await resetPasswordForEmail(createClient(event), {
        email,
        url: baseURL,
      });
    }),

  exchangeCodeForSession: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(
      async ({ input, ctx: { event } }) =>
        await exchangeCodeForSession(createClient(event), input),
    ),

  getUser: publicProcedure.query(
    async ({ ctx: { event } }) => await getUser(createClient(event)),
  ),

  signOut: publicProcedure.mutation(
    async ({ ctx: { event } }) => await signOut(createClient(event)),
  ),

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(
      async ({ input, ctx: { event } }) =>
        await deleteUser(createAdminClient(event), input),
    ),
});
