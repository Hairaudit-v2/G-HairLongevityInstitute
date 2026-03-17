/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--bg-page))",
        card: "rgb(var(--bg-card))",
        subtle: "rgb(var(--bg-subtle))",
        gold: "rgb(var(--gold))",
        "gold-dark": "rgb(var(--gold-dark))",
        medical: "rgb(var(--medical))",
        "medical-muted": "rgb(var(--medical-muted))",
        "text-primary": "rgb(var(--text-primary))",
        "text-secondary": "rgb(var(--text-secondary))",
        "text-muted": "rgb(var(--text-muted))",
        "border-soft": "rgb(var(--border-soft))",
      },
      borderRadius: {
        card: "var(--radius-lg)",
        btn: "var(--radius-md)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
