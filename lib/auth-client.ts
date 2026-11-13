import { createAuthClient } from "better-auth/react";
import { twoFactorClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});