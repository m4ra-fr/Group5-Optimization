import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
  appName: "Agri-Connect JA", // shows up as the issuer in authenticator apps
  database: new Database("./sqlite.db"),
  emailAndPassword: {
    enabled: true,
  },
    user: {
    additionalFields: {
      role: { type: "string", required: true },
      phone: { type: "string", required: false },
    },
  },
  plugins: [
    twoFactor(),
    nextCookies(), // keep this last
  ],
});