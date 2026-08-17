import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-hooks v6 (bundled by eslint-config-next on Next 16) ships React
    // Compiler-readiness rules. This project has reactCompiler disabled
    // (next.config.ts), and PlayerContext legitimately calls setState from
    // effects to synchronize React state with the native <audio> element and
    // to hydrate persisted settings on mount — both are the "synchronize
    // with an external system" case React's own docs describe as the valid
    // use of an effect. Kept as a warning rather than silenced entirely.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
