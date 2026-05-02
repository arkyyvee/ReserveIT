export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "hsl(245, 78%, 58%)",
        canvas: "hsl(40, 20%, 98%)",
        surface: "hsl(0, 0%, 100%)",
        line: "hsl(220, 13%, 88%)"
      },
      boxShadow: {
        soft: "0 14px 36px rgba(30, 41, 59, 0.08)"
      }
    }
  },
  plugins: []
};
