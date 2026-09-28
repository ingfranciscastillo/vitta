import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import {
	checkout,
	dodopayments,
	portal,
	webhooks,
} from "@dodopayments/better-auth";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import DodoPayments from "dodopayments";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { user } from "#/db/schema";
import { OtpEmail } from "#/emails/otp-email";
import { PasswordChangedEmail } from "#/emails/password-changed-email";
import { ResetPasswordEmail } from "#/emails/reset-password-email";
import { VerifyEmail } from "#/emails/verify-email";
import { sendEmail } from "#/lib/email";

const DODO_PAYMENTS_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const DODO_PRODUCT_PRO_LIFETIME = process.env.DODO_PRODUCT_PRO_LIFETIME;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

if (!DODO_PAYMENTS_API_KEY)
	throw new Error("DODO_PAYMENTS_API_KEY is required");
if (!DODO_PAYMENTS_WEBHOOK_SECRET)
	throw new Error("DODO_PAYMENTS_WEBHOOK_SECRET is required");
if (!DODO_PRODUCT_PRO_LIFETIME)
	throw new Error("DODO_PRODUCT_PRO_LIFETIME is required");

const dodoPayments = new DodoPayments({
	bearerToken: DODO_PAYMENTS_API_KEY,
	environment:
		process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins,
	rateLimit: {
		enabled: true,
		storage: "database",
		customRules: {
			"/api/auth/sign-in/email": { window: 60, max: 5 },
			"/api/auth/sign-up/email": { window: 60 * 60, max: 5 },
			"/api/auth/forget-password": { window: 60 * 60, max: 3 },
			"/api/auth/reset-password": { window: 60 * 60, max: 5 },
			"/api/auth/send-verification-email": { window: 60 * 60, max: 3 },
			// Pide la contraseña: limita los intentos de adivinarla.
			"/api/auth/delete-user": { window: 60 * 60, max: 5 },
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
			strategy: "jwe",
		},
	},
	account: {
		encryptOAuthTokens: true,
		storeStateStrategy: "cookie",
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
		},
		useSecureCookies: process.env.NODE_ENV === "production",
		crossSubDomainCookies: { enabled: false },
		defaultCookieAttributes: {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		},
		backgroundTasks: {
			handler: (promise) => {
				const c = (
					globalThis as {
						cloudflare?: {
							context?: { waitUntil?: (p: Promise<unknown>) => void };
						};
					}
				).cloudflare?.context;
				if (c?.waitUntil) {
					c.waitUntil(promise);
				} else {
					void promise;
				}
			},
		},
	},
	databaseHooks: {
		user: {
			update: {
				after: async (hook) => {
					const data = hook.data as { id: string; email?: string };
					const oldData = hook.oldData as { email?: string } | null;
					if (oldData?.email && oldData.email !== data.email) {
						console.warn(
							`[auth] email changed user=${data.id} from=${oldData.email} to=${data.email}`,
						);
					}
				},
			},
		},
	},
	user: {
		// Borrado definitivo desde el perfil. Con contraseña se verifica la
		// contraseña; en cuentas de Google, Better Auth exige una sesión
		// reciente (freshAge, 1 día por defecto). El resto de tablas del
		// usuario se borran en cascada.
		deleteUser: {
			enabled: true,
		},
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
				input: false,
				returned: true,
			},
			sex: {
				type: "string",
				required: false,
				input: true,
				returned: true,
			},
			birthDate: {
				type: "string",
				required: false,
				input: true,
				returned: true,
			},
			height: {
				type: "number",
				required: false,
				input: true,
				returned: true,
			},
			weightUnit: {
				type: "string",
				defaultValue: "kg",
				input: true,
				returned: true,
			},
			heightUnit: {
				type: "string",
				defaultValue: "cm",
				input: true,
				returned: true,
			},
			timezone: {
				type: "string",
				defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
				input: true,
				returned: true,
			},
			completedTours: {
				type: "string",
				defaultValue: "[]",
				input: true,
				returned: true,
			},
			isPro: {
				type: "boolean",
				defaultValue: false,
				input: false,
				returned: true,
			},
			waterGoal: {
				type: "number",
				defaultValue: 2000,
				input: true,
				returned: true,
			},
			stepsGoal: {
				type: "number",
				defaultValue: 8000,
				input: true,
				returned: true,
			},
			sleepGoal: {
				type: "number",
				defaultValue: 8,
				input: true,
				returned: true,
			},
			calorieGoal: {
				type: "number",
				defaultValue: 2000,
				input: true,
				returned: true,
			},
			proteinGoal: {
				type: "number",
				defaultValue: 100,
				input: true,
				returned: true,
			},
			carbsGoal: {
				type: "number",
				defaultValue: 250,
				input: true,
				returned: true,
			},
			fatGoal: {
				type: "number",
				defaultValue: 70,
				input: true,
				returned: true,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 256,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Restablece tu contraseña",
				text: `Haz click en el siguiente enlace para restablecer tu contraseña: ${url}`,
				react: ResetPasswordEmail({ url }),
			});
		},
		onPasswordReset: async ({ user }) => {
			await sendEmail({
				to: user.email,
				subject: "Tu contraseña fue cambiada",
				text: "Tu contraseña de Vitta fue cambiada correctamente. Si no fuiste tú, contacta a soporte de inmediato.",
				react: PasswordChangedEmail(),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Verifica tu email",
				text: `Haz click en el siguiente enlace para verificar tu email: ${url}`,
				react: VerifyEmail({ url }),
			});
		},
	},

	plugins: [
		dodopayments({
			client: dodoPayments,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: DODO_PRODUCT_PRO_LIFETIME,
							slug: "pro-lifetime",
						},
					],
					successUrl: `${BETTER_AUTH_URL}/pricing/success`,
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					webhookKey: DODO_PAYMENTS_WEBHOOK_SECRET,
					onPaymentSucceeded: async (payload) => {
						const metadata = (
							payload as { data?: { metadata?: Record<string, unknown> } }
						).data?.metadata;
						const userId =
							(metadata?.userId as string | undefined) ?? undefined;
						if (!userId) return;
						await db
							.update(user)
							.set({ isPro: true })
							.where(eq(user.id, userId));
					},
				}),
			],
		}),
		twoFactor({
			issuer: "Vitta",
			totpOptions: {
				digits: 6,
				period: 30,
			},
			otpOptions: {
				sendOTP: async ({ user, otp }) => {
					await sendEmail({
						to: user.email,
						subject: "Tu código de verificación",
						text: `Tu código de acceso es: ${otp}. Válido por 5 minutos.`,
						react: OtpEmail({ otp }),
					});
				},
				period: 5,
				digits: 6,
				allowedAttempts: 5,
				storeOTP: "encrypted",
			},
			backupCodeOptions: {
				amount: 10,
				length: 10,
				storeBackupCodes: "encrypted",
			},
			twoFactorCookieMaxAge: 600,
			trustDeviceMaxAge: 30 * 24 * 60 * 60,
		}),
		tanstackStartCookies(),
	],
});
