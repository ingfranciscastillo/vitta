import {
	CalendarIcon,
	HomeIcon,
	StarIcon,
	UserIcon,
	WidgetIcon,
} from "@solar-icons/react/linear";
import { Link } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type RoutePath = string;

type NavItem = {
	to: RoutePath;
	label: string;
	icon: SolarIcon;
	end?: boolean;
};

const items: NavItem[] = [
	{ to: "/dashboard", label: "Inicio", icon: HomeIcon, end: true },
	{ to: "/habits", label: "Hábitos", icon: StarIcon },
	{ to: "/weekly-summary", label: "Resumen", icon: CalendarIcon },
	{ to: "/more", label: "Más", icon: WidgetIcon },
	{ to: "/profile", label: "Perfil", icon: UserIcon },
];

export function BottomNav() {
	return (
		<nav
			data-tour="bottom-nav"
			className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur pb-[env(safe-area-inset-bottom)]"
		>
			<div className="max-w-md mx-auto grid grid-cols-5">
				{items.map(({ to, label, icon: Icon, end }) => (
					<Link
						key={to}
						to={to}
						data-tour={to === "/profile" ? "settings-link" : undefined}
						activeOptions={end ? { exact: true } : undefined}
						activeProps={{
							className:
								"flex flex-col items-center gap-0.5 py-3 text-[10px] transition-colors text-primary",
						}}
						inactiveProps={{
							className:
								"flex flex-col items-center gap-0.5 py-3 text-[10px] transition-colors text-muted-foreground",
						}}
					>
						<Icon className="w-5 h-5 mb-1" />
						<span className="font-medium font-display">{label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}

export default BottomNav;
