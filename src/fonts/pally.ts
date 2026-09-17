import localFont from "next/font/local";

/**
 * Pally, caricato dai file in `./pally/`.
 * Espone la variabile CSS `--font-pally`, mappata sull'utility Tailwind
 * `font-display` in `globals.css`.
 */
export const pally = localFont({
  src: [
    { path: "./pally/Pally-Regular.otf", weight: "400", style: "normal" },
    { path: "./pally/Pally-Medium.otf", weight: "500", style: "normal" },
    { path: "./pally/Pally-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-pally",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Variante con il file variable, se lo usi al posto dei tre statici:
 *
 * export const pally = localFont({
 *   src: "./pally/Pally-Variable.woff2",
 *   weight: "400 700",
 *   variable: "--font-pally",
 *   display: "swap",
 *   fallback: ["system-ui", "sans-serif"],
 * });
 */
