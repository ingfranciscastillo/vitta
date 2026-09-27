"use client";

import { EyeClosedIcon, EyeIcon } from "@solar-icons/react/linear";
import * as React from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "#/components/ui/input-group.tsx";
import { computePasswordStrength } from "#/lib/password-strength.ts";
import { cn } from "#/lib/utils.ts";

type PasswordInputProps = Omit<
	React.ComponentProps<typeof InputGroupInput>,
	"type" | "size"
> & {
	startIcon?: React.ReactNode;
	size?: "sm" | "md";
	showStrengthMeter?: boolean;
};

function PasswordInput({
	startIcon,
	size = "md",
	showStrengthMeter = false,
	value,
	className,
	disabled,
	onFocus,
	onBlur,
	...props
}: PasswordInputProps) {
	const [visible, setVisible] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const stringValue = typeof value === "string" ? value : "";
	const strength = React.useMemo(
		() => (showStrengthMeter ? computePasswordStrength(stringValue) : null),
		[stringValue, showStrengthMeter],
	);
	const revealed = showStrengthMeter && (focused || stringValue.length > 0);

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<InputGroup data-size={size}>
				{startIcon ? (
					<InputGroupAddon align="inline-start">
						<span className="text-muted-foreground">{startIcon}</span>
					</InputGroupAddon>
				) : null}
				<InputGroupInput
					{...props}
					value={value}
					type={visible ? "text" : "password"}
					disabled={disabled}
					onFocus={(e) => {
						setFocused(true);
						onFocus?.(e);
					}}
					onBlur={(e) => {
						setFocused(false);
						onBlur?.(e);
					}}
					className={cn(size === "md" ? "h-12" : "h-11")}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						size="icon-xs"
						type="button"
						tabIndex={-1}
						aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
						aria-pressed={visible}
						onClick={() => setVisible((v) => !v)}
						disabled={disabled}
					>
						{visible ? <EyeClosedIcon /> : <EyeIcon />}
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>

			{strength && revealed ? (
				<div className="flex items-center gap-2 text-xs" aria-live="polite">
					<meter
						className="flex flex-1 gap-1 [&::-webkit-meter-bar]:bg-muted"
						min={0}
						max={4}
						value={strength.score}
						aria-label="Fortaleza de la contraseña"
					>
						<div className="flex flex-1 gap-1">
							{[0, 1, 2, 3].map((i) => (
								<div
									key={i}
									className={cn(
										"h-1 flex-1 rounded-full transition-colors",
										i < strength.score ? strength.activeClass : "bg-muted",
									)}
								/>
							))}
						</div>
					</meter>
					<span className={cn("font-medium", strength.labelClass)}>
						{strength.label}
					</span>
				</div>
			) : null}
		</div>
	);
}

export { PasswordInput };
