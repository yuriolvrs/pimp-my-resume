// What this file is: configuration wiring Tailwind and Autoprefixer into
// the CSS build pipeline; Vite picks this up automatically.
// In plain terms: settings that let the styling tool actually run during
// the build.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
