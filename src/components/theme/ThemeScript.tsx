import { BASE_COLOR_PALETTES } from "@/lib/theme/utils";
import { ACCENT_COLORS } from "@/lib/theme/config";

export function ThemeScript() {
  // Serialize color palettes & accents for fast synchronous pre-paint execution
  const basePalettesJson = JSON.stringify(BASE_COLOR_PALETTES);
  const accentColorsJson = JSON.stringify(ACCENT_COLORS);

  const scriptContent = `
    (function() {
      try {
        var raw = localStorage.getItem('repodeck:theme-settings');
        if (!raw) return;
        var s = JSON.parse(raw);
        if (!s) return;

        var basePalettes = ${basePalettesJson};
        var accentColors = ${accentColorsJson};

        // Determine active theme mode (dark vs light)
        var storedTheme = localStorage.getItem('theme');
        var isDark = storedTheme === 'dark' || (storedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var mode = isDark ? 'dark' : 'light';

        // 1. Accent color
        var accentName = (s.accentColor || 'blue').toLowerCase();
        var accent = null;
        for (var i = 0; i < accentColors.length; i++) {
          if (accentColors[i].name.toLowerCase() === accentName) {
            accent = accentColors[i];
            break;
          }
        }

        var primaryValue = accent ? (isDark ? accent.darkValue : accent.lightValue) : (isDark ? 'oklch(0.68 0.15 237)' : 'oklch(0.59 0.14 242)');
        var primaryForeground = isDark ? 'oklch(0.29 0.06 243)' : 'oklch(0.98 0.01 237)';

        // 2. Base palette
        var baseKey = (s.baseColor || 'zinc').toLowerCase();
        var basePalette = basePalettes[baseKey] || basePalettes['zinc'];
        var modeColors = basePalette ? (isDark ? basePalette.dark : basePalette.light) : null;

        var root = document.documentElement;

        if (modeColors) {
          root.style.setProperty('--background', modeColors.background);
          root.style.setProperty('--foreground', modeColors.foreground);
          root.style.setProperty('--card', modeColors.card);
          root.style.setProperty('--card-foreground', modeColors['card-foreground']);
          root.style.setProperty('--popover', modeColors.popover);
          root.style.setProperty('--popover-foreground', modeColors['popover-foreground']);
          root.style.setProperty('--secondary', modeColors.secondary);
          root.style.setProperty('--secondary-foreground', modeColors['secondary-foreground']);
          root.style.setProperty('--muted', modeColors.muted);
          root.style.setProperty('--muted-foreground', modeColors['muted-foreground']);
          root.style.setProperty('--accent', modeColors.accent);
          root.style.setProperty('--accent-foreground', modeColors['accent-foreground']);
          root.style.setProperty('--border', modeColors.border);
          root.style.setProperty('--input', modeColors.input);
          root.style.setProperty('--ring', modeColors.ring);
          root.style.setProperty('--sidebar', modeColors.sidebar);
          root.style.setProperty('--sidebar-foreground', modeColors['sidebar-foreground']);
          root.style.setProperty('--sidebar-accent', modeColors['sidebar-accent']);
          root.style.setProperty('--sidebar-accent-foreground', modeColors['sidebar-accent-foreground']);
          root.style.setProperty('--sidebar-border', modeColors['sidebar-border']);
          root.style.setProperty('--sidebar-ring', modeColors['sidebar-ring']);
        }

        root.style.setProperty('--primary', primaryValue);
        root.style.setProperty('--primary-foreground', primaryForeground);
        root.style.setProperty('--sidebar-primary', primaryValue);
        root.style.setProperty('--sidebar-primary-foreground', primaryForeground);

        // 3. Border Radius
        if (s.radius !== undefined) {
          root.style.setProperty('--radius', s.radius + 'rem');
        }

        // 4. Font
        if (s.font) {
          var fontFamilies = {
            'inter': 'var(--font-inter), sans-serif',
            'jetbrains-mono': 'var(--font-jetbrains-mono), monospace',
            'fira-code': 'var(--font-fira-code), monospace',
            'roboto-mono': 'var(--font-roboto-mono), monospace',
            'source-code-pro': 'var(--font-source-code-pro), monospace',
            'geist': 'var(--font-geist-sans), sans-serif',
            'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          };
          if (fontFamilies[s.font]) {
            root.style.setProperty('--font-sans', fontFamilies[s.font]);
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      id="repodeck-theme-init"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}
