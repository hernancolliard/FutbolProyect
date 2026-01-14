import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    isadmin?: boolean;
    tipo_usuario?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      accessToken?: string;
      isadmin?: boolean;
      tipo_usuario?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    isadmin?: boolean;
    tipo_usuario?: string;
  }
}
