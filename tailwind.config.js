/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Colors are bound to CSS custom properties declared in src/index.css so a
      // single token set drives both light and dark themes. The <alpha-value>
      // placeholder keeps Tailwind opacity modifiers (e.g. border-accent/20) working.
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        surface2: 'rgb(var(--c-surface-2) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--c-accent-soft) / <alpha-value>)',
        accentSoft: 'rgb(var(--c-accent-soft) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--c-line-strong) / <alpha-value>)',
        lineStrong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        'success-soft': 'rgb(var(--c-success-soft) / <alpha-value>)',
        successSoft: 'rgb(var(--c-success-soft) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--c-danger-soft) / <alpha-value>)',
        dangerSoft: 'rgb(var(--c-danger-soft) / <alpha-value>)',
        violet: 'rgb(var(--c-violet) / <alpha-value>)',
        'violet-soft': 'rgb(var(--c-violet-soft) / <alpha-value>)',
        violetSoft: 'rgb(var(--c-violet-soft) / <alpha-value>)',
        amber: 'rgb(var(--c-amber) / <alpha-value>)',
        'amber-soft': 'rgb(var(--c-amber-soft) / <alpha-value>)',
        amberSoft: 'rgb(var(--c-amber-soft) / <alpha-value>)',
        'code-bg': 'rgb(var(--c-code-bg) / <alpha-value>)',
        codeBg: 'rgb(var(--c-code-bg) / <alpha-value>)',
        // Sidebar tokens are intentionally identical in light and dark mode so the
        // navigation rail stays dark navy regardless of the workspace theme.
        'nav-bg': 'rgb(var(--c-nav-bg) / <alpha-value>)',
        navBg: 'rgb(var(--c-nav-bg) / <alpha-value>)',
        'nav-header': 'rgb(var(--c-nav-header) / <alpha-value>)',
        navHeader: 'rgb(var(--c-nav-header) / <alpha-value>)',
        'nav-text': 'rgb(var(--c-nav-text) / <alpha-value>)',
        navText: 'rgb(var(--c-nav-text) / <alpha-value>)',
        'nav-muted': 'rgb(var(--c-nav-muted) / <alpha-value>)',
        navMuted: 'rgb(var(--c-nav-muted) / <alpha-value>)',
        'nav-faint': 'rgb(var(--c-nav-faint) / <alpha-value>)',
        navFaint: 'rgb(var(--c-nav-faint) / <alpha-value>)',
        'nav-active': 'rgb(var(--c-nav-active) / <alpha-value>)',
        navActive: 'rgb(var(--c-nav-active) / <alpha-value>)',
        'nav-hover': 'rgb(var(--c-nav-hover) / <alpha-value>)',
        navHover: 'rgb(var(--c-nav-hover) / <alpha-value>)',
        'nav-line': 'rgb(var(--c-nav-line) / <alpha-value>)',
        navLine: 'rgb(var(--c-nav-line) / <alpha-value>)',
      },
      // Preflight's default border color is a fixed light gray (#E5E7EB), which
      // would leave every bare `border` utility glaring in dark mode. Binding
      // DEFAULT to the line token keeps unclassed borders theme-aware too.
      borderColor: {
        DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'ui-monospace',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      borderRadius: {
        card: '7px',
      },
    },
  },
  plugins: [],
};
