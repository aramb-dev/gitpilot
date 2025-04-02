/**
 * GitPilot Theme Configuration
 * Used for styling consistency across the application
 */

const theme = {
    // Color palette based on GitHub design and ShadCN defaults
    colors: {
      // Primary colors
      primary: {
        lightest: '#f6f8fa', // GitHub bg-gray-light
        lighter: '#eaeef2',
        light: '#d0d7de', // GitHub border-gray
        main: '#0969da', // GitHub blue
        dark: '#0550ae',
        darker: '#033d8a'
      },
      // Secondary/accent colors
      secondary: {
        light: '#ddf4ff',
        main: '#54aeff', // GitHub blue-light
        dark: '#218bff'
      },
      // Success colors
      success: {
        light: '#dafbe1',
        main: '#2da44e', // GitHub green
        dark: '#1a7f37'
      },
      // Warning colors
      warning: {
        light: '#fff8c5',
        main: '#d4a72c', // GitHub yellow
        dark: '#9e6a03'
      },
      // Error/danger colors
      error: {
        light: '#ffebe9',
        main: '#cf222e', // GitHub red
        dark: '#a40e26'
      },
      // Neutral colors for text and backgrounds
      neutral: {
        100: '#f6f8fa', // GitHub bg-gray-light
        200: '#eaeef2',
        300: '#d0d7de', // GitHub border-gray
        400: '#afb8c1',
        500: '#8c959f', // GitHub text-gray
        600: '#6e7781',
        700: '#57606a', // GitHub text-gray-light
        800: '#24292f', // GitHub text-primary
        900: '#1b1f24',
      }
    },

    // Typography
    typography: {
      fontFamily: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem' // 30px
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },

    // Spacing (used for margins, paddings, etc.)
    spacing: {
      0: '0',
      1: '0.25rem',    // 4px
      2: '0.5rem',     // 8px
      3: '0.75rem',    // 12px
      4: '1rem',       // 16px
      5: '1.25rem',    // 20px
      6: '1.5rem',     // 24px
      8: '2rem',       // 32px
      10: '2.5rem',    // 40px
      12: '3rem',      // 48px
      16: '4rem',      // 64px
      20: '5rem',      // 80px
      24: '6rem'       // 96px
    },

    // Breakpoints for responsive design
    breakpoints: {
      xs: '0px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },

    // Z-index values
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      dropdown: 10,
      sticky: 20,
      fixed: 30,
      overlay: 40,
      modal: 50,
      popover: 60,
      toast: 70,
      tooltip: 80
    },

    // Border radius
    borderRadius: {
      none: '0',
      sm: '0.125rem',    // 2px
      default: '0.25rem', // 4px
      md: '0.375rem',     // 6px
      lg: '0.5rem',       // 8px
      xl: '0.75rem',      // 12px
      full: '9999px'
    },

    // Shadows
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none'
    },

    // Transitions
    transitions: {
      default: 'all 0.3s ease',
      fast: 'all 0.15s ease',
      slow: 'all 0.5s ease'
    }
  };

  export default theme;
