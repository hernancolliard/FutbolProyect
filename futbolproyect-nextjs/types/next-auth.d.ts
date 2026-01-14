import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken?: string;
    isadmin?: boolean;
    tipo_usuario?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      accessToken?: string;
      isadmin?: boolean;
      tipo_usuario?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    isadmin?: boolean;
    tipo_usuario?: string;
  }
}
