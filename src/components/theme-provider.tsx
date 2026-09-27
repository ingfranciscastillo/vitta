import { ScriptOnce } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";

// Color de la barra del navegador y del sistema: igual que --background.
export const THEME_COLORS = { light: "#f7f2f4", dark: "#1a1b1f" } as const;

function applyTheme(t: Theme): void {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const resolved =
		t === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: t;
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
	themeColorMeta().setAttribute("content", THEME_COLORS[resolved]);
}

function themeColorMeta(): HTMLMetaElement {
	const existing = document.querySelector<HTMLMetaElement>(
		'meta[name="theme-color"]',
	);
	if (existing) return existing;
	const meta = document.createElement("meta");
	meta.name = "theme-color";
	return document.head.appendChild(meta);
}

// Se ejecuta en el <head> antes del primer pintado, para que la página no
// salga en claro y salte a oscuro al hidratar. Misma lógica que applyTheme.
// También crea la meta theme-color: si la renderizara React, al hidratar
// añadiría otra en cuanto el color no coincida con el del servidor.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}m.setAttribute("content",d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}")}catch(e){}})();`;

export function ThemeScript() {
	return <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system";
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
		return "system";
	});

	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem(STORAGE_KEY, theme);
		if (theme !== "system") return;
		// En "sistema", sigue el cambio de modo del dispositivo sin recargar.
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
