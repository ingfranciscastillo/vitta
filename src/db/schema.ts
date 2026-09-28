import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	date,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	time,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "user"]);
export const sex = pgEnum("sex", ["male", "female", "other"]);
export const weightUnit = pgEnum("weight_unit", ["kg", "lb"]);
export const heightUnit = pgEnum("height_unit", ["cm", "ft"]);
export const goalPace = pgEnum("goal_pace", ["slow", "moderate", "fast"]);
export const supportStatus = pgEnum("support_status", [
	"open",
	"in_progress",
	"resolved",
	"closed",
]);
export const bodyMeasurementType = pgEnum("body_measurement_type", [
	"waist",
	"hip",
	"chest",
	"arm",
	"thigh",
	"neck",
	"body_fat",
]);
export const habitType = pgEnum("habit_type", ["water", "steps", "sleep"]);
export const mealType = pgEnum("meal_type", [
	"breakfast",
	"lunch",
	"dinner",
	"snack",
]);
export const activityIntensity = pgEnum("activity_intensity", [
	"low",
	"medium",
	"high",
]);
export const fastStatus = pgEnum("fast_status", ["active", "completed"]);
export const reminderType = pgEnum("reminder_type", ["weight"]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: userRole("role").default("user").notNull(),
	sex: sex("sex"),
	birthDate: date("birth_date"),
	height: numeric("height", { precision: 6, scale: 2 }),
	weightUnit: weightUnit("weight_unit").default("kg").notNull(),
	heightUnit: heightUnit("height_unit").default("cm").notNull(),
	timezone: text("timezone").default("UTC").notNull(),
	completedTours: text("completed_tours").default("[]").notNull(),
	dodoCustomerId: text("dodo_customer_id"),
	isPro: boolean("is_pro").default(false).notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
	// Consentimiento explícito para tratar datos de salud (RGPD art. 9).
	// Sin él, la app pide aceptarlo antes de dejar registrar nada.
	healthConsentAt: timestamp("health_consent_at"),
	waterGoal: numeric("water_goal", { precision: 7, scale: 2 })
		.default("2000")
		.notNull(),
	stepsGoal: numeric("steps_goal", { precision: 8, scale: 2 })
		.default("8000")
		.notNull(),
	sleepGoal: numeric("sleep_goal", { precision: 4, scale: 2 })
		.default("8")
		.notNull(),
	calorieGoal: numeric("calorie_goal", { precision: 7, scale: 2 })
		.default("2000")
		.notNull(),
	proteinGoal: numeric("protein_goal", { precision: 6, scale: 2 })
		.default("100")
		.notNull(),
	carbsGoal: numeric("carbs_goal", { precision: 6, scale: 2 })
		.default("250")
		.notNull(),
	fatGoal: numeric("fat_goal", { precision: 6, scale: 2 })
		.default("70")
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		issuer: text("issuer"),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("account_issuer_accountId_uidx").on(
			table.issuer,
			table.accountId,
		),
		index("account_userId_idx").on(table.userId),
	],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
	id: text("id").primaryKey(),
	key: text("key").notNull().unique(),
	count: integer("count").notNull(),
	lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const twoFactor = pgTable(
	"two_factor",
	{
		id: text("id").primaryKey(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verified: boolean("verified").default(true).notNull(),
		failedVerificationCount: integer("failed_verification_count")
			.default(0)
			.notNull(),
		lockedUntil: timestamp("locked_until"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("two_factor_secret_idx").on(table.secret),
		index("two_factor_userId_idx").on(table.userId),
	],
);

export const goal = pgTable(
	"goal",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		targetWeight: numeric("target_weight", {
			precision: 6,
			scale: 2,
		}).notNull(),
		targetDate: date("target_date"),
		pace: goalPace("pace").default("moderate").notNull(),
		startWeight: numeric("start_weight", { precision: 6, scale: 2 }),
		startDate: date("start_date"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("goal_created_by_id_idx").on(table.createdById)],
);

export const weightEntry = pgTable(
	"weight_entry",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		weight: numeric("weight", { precision: 6, scale: 2 }).notNull(),
		date: date("date").notNull(),
		time: time("time"),
		note: text("note"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("weight_entry_created_by_id_idx").on(table.createdById),
		index("weight_entry_date_idx").on(table.date),
	],
);

export const supportTicket = pgTable(
	"support_ticket",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subject: text("subject").notNull(),
		message: text("message").notNull(),
		status: supportStatus("status").default("open").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("support_ticket_created_by_id_idx").on(table.createdById),
		index("support_ticket_status_idx").on(table.status),
	],
);

export const bodyMeasurement = pgTable(
	"body_measurement",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: bodyMeasurementType("type").notNull(),
		value: numeric("value", { precision: 6, scale: 2 }).notNull(),
		date: date("date").notNull(),
		time: time("time"),
		note: text("note"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("body_measurement_created_by_id_idx").on(table.createdById),
		index("body_measurement_date_idx").on(table.date),
	],
);

export const habitLog = pgTable(
	"habit_log",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: habitType("type").notNull(),
		value: numeric("value", { precision: 8, scale: 2 }).notNull(),
		date: date("date").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("habit_log_created_by_id_idx").on(table.createdById),
		index("habit_log_date_idx").on(table.date),
		uniqueIndex("habit_log_user_type_date_unique").on(
			table.createdById,
			table.type,
			table.date,
		),
	],
);

export const meal = pgTable(
	"meal",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: date("date").notNull(),
		time: time("time"),
		name: text("name").notNull(),
		calories: numeric("calories", { precision: 7, scale: 2 }).notNull(),
		protein: numeric("protein", { precision: 6, scale: 2 }),
		carbs: numeric("carbs", { precision: 6, scale: 2 }),
		fat: numeric("fat", { precision: 6, scale: 2 }),
		mealType: mealType("meal_type").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("meal_created_by_id_idx").on(table.createdById),
		index("meal_date_idx").on(table.date),
	],
);

export const activity = pgTable(
	"activity",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: date("date").notNull(),
		time: time("time"),
		type: text("type").notNull(),
		durationMinutes: numeric("duration_minutes", {
			precision: 5,
			scale: 2,
		}).notNull(),
		intensity: activityIntensity("intensity"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("activity_created_by_id_idx").on(table.createdById),
		index("activity_date_idx").on(table.date),
	],
);

export const fast = pgTable(
	"fast",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: fastStatus("status").default("active").notNull(),
		startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
		endedAt: timestamp("ended_at", { withTimezone: true }),
		durationMinutes: numeric("duration_minutes", {
			precision: 8,
			scale: 2,
		}),
		type: text("type"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("fast_created_by_id_idx").on(table.createdById),
		index("fast_started_at_idx").on(table.startedAt),
	],
);

// Suscripción Web Push de un navegador o app instalada. Una persona puede
// tener varias (móvil, ordenador). Se borra cuando el servicio de push la
// da por caducada (404/410).
export const pushSubscription = pgTable(
	"push_subscription",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		endpoint: text("endpoint").notNull().unique(),
		p256dh: text("p256dh").notNull(),
		auth: text("auth").notNull(),
		userAgent: text("user_agent"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		lastSuccessAt: timestamp("last_success_at"),
	},
	(table) => [index("push_subscription_user_id_idx").on(table.userId)],
);

// Recordatorio diario. `time` es la hora local en la zona horaria del
// usuario; `days` es una máscara de bits con el domingo en el bit 0 (como
// Date.getDay). `lastSentOn` es la fecha local del último aviso, para no
// repetirlo el mismo día.
export const reminder = pgTable(
	"reminder",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: reminderType("type").notNull(),
		enabled: boolean("enabled").default(true).notNull(),
		time: time("time").default("08:00").notNull(),
		days: integer("days").default(127).notNull(),
		lastSentOn: date("last_sent_on"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("reminder_user_type_idx").on(table.userId, table.type),
		index("reminder_enabled_idx").on(table.enabled),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	goals: many(goal),
	weightEntries: many(weightEntry),
	supportTickets: many(supportTicket),
	bodyMeasurements: many(bodyMeasurement),
	habitLogs: many(habitLog),
	meals: many(meal),
	activities: many(activity),
	fasts: many(fast),
	pushSubscriptions: many(pushSubscription),
	reminders: many(reminder),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const goalRelations = relations(goal, ({ one }) => ({
	user: one(user, {
		fields: [goal.createdById],
		references: [user.id],
	}),
}));

export const weightEntryRelations = relations(weightEntry, ({ one }) => ({
	user: one(user, {
		fields: [weightEntry.createdById],
		references: [user.id],
	}),
}));

export const supportTicketRelations = relations(supportTicket, ({ one }) => ({
	user: one(user, {
		fields: [supportTicket.createdById],
		references: [user.id],
	}),
}));

export const bodyMeasurementRelations = relations(
	bodyMeasurement,
	({ one }) => ({
		user: one(user, {
			fields: [bodyMeasurement.createdById],
			references: [user.id],
		}),
	}),
);

export const habitLogRelations = relations(habitLog, ({ one }) => ({
	user: one(user, {
		fields: [habitLog.createdById],
		references: [user.id],
	}),
}));

export const mealRelations = relations(meal, ({ one }) => ({
	user: one(user, {
		fields: [meal.createdById],
		references: [user.id],
	}),
}));

export const activityRelations = relations(activity, ({ one }) => ({
	user: one(user, {
		fields: [activity.createdById],
		references: [user.id],
	}),
}));

export const fastRelations = relations(fast, ({ one }) => ({
	user: one(user, {
		fields: [fast.createdById],
		references: [user.id],
	}),
}));

export const pushSubscriptionRelations = relations(
	pushSubscription,
	({ one }) => ({
		user: one(user, {
			fields: [pushSubscription.userId],
			references: [user.id],
		}),
	}),
);

export const reminderRelations = relations(reminder, ({ one }) => ({
	user: one(user, {
		fields: [reminder.userId],
		references: [user.id],
	}),
}));
