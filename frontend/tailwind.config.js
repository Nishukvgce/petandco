/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", // light gray
        input: "var(--color-input)", // white
        ring: "var(--color-ring)", // turmeric orange
        background: "var(--color-background)", // warm off-white
        foreground: "var(--color-foreground)", // warm charcoal
        primary: {
          DEFAULT: "var(--color-primary)", // turmeric orange
          foreground: "var(--color-primary-foreground)", // white
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", // cinnamon brown
          foreground: "var(--color-secondary-foreground)", // white
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", // clear red
          foreground: "var(--color-destructive-foreground)", // white
        },
        muted: {
          DEFAULT: "var(--color-muted)", // light gray
          foreground: "var(--color-muted-foreground)", // medium gray
        },
        accent: {
          DEFAULT: "var(--color-accent)", // curry leaf green
          foreground: "var(--color-accent-foreground)", // white
        },
        popover: {
          DEFAULT: "var(--color-popover)", // white
          foreground: "var(--color-popover-foreground)", // warm charcoal
        },
        card: {
          DEFAULT: "var(--color-card)", // white
          foreground: "var(--color-card-foreground)", // warm charcoal
        },
        success: {
          DEFAULT: "var(--color-success)", // vibrant green
          foreground: "var(--color-success-foreground)", // white
        },
        warning: {
          DEFAULT: "var(--color-warning)", // amber orange
          foreground: "var(--color-warning-foreground)", // white
        },
        error: {
          DEFAULT: "var(--color-error)", // clear red
          foreground: "var(--color-error-foreground)", // white
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Source Sans Pro', 'sans-serif'],
        caption: ['Roboto', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'warm': '0 1px 3px rgba(212, 118, 26, 0.1)',
        'warm-md': '0 4px 6px rgba(212, 118, 26, 0.1), 0 2px 4px rgba(212, 118, 26, 0.06)',
        'warm-lg': '0 10px 15px rgba(212, 118, 26, 0.1), 0 4px 6px rgba(212, 118, 26, 0.05)',
        'warm-xl': '0 20px 25px rgba(212, 118, 26, 0.1), 0 10px 10px rgba(212, 118, 26, 0.04)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}