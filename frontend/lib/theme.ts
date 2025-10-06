/**
 * Theme configuration and type definitions
 * Provides type-safe theme management for BlogTube application
 */

export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  /**
   * Available theme options
   */
  themes: readonly Theme[];

  /**
   * Default theme when no preference is set
   */
  defaultTheme: Theme;

  /**
   * Whether to enable system theme preference detection
   */
  enableSystem: boolean;

  /**
   * Attribute to use for theme switching (class or data-theme)
   */
  attribute: "class" | "data-theme";
}

export const themeConfig: ThemeConfig = {
  themes: ["light", "dark", "system"] as const,
  defaultTheme: "light",
  enableSystem: true,
  attribute: "class",
};

/**
 * Theme display names for UI components
 */
export const themeDisplayNames: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/**
 * Theme icons for UI components (can be used with icon libraries)
 */
export const themeIcons: Record<Theme, string> = {
  light: "sun",
  dark: "moon",
  system: "laptop",
};
