import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// We need an API client to interact with your existing backend for authentication
// For now, we'll mock it or define a simple fetch
async function authenticateUser(credentials: Record<string, string>): Promise<any | null> {
    // Replace with actual API call to your backend
    // Example:
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });

    if (res.ok) {
        const user = await res.json();
        // Assume your backend returns user data including a token
        return user;
    } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Credenciales inválidas");
    }
}


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials) {
                    return null;
                }
                try {
                    const user = await authenticateUser(credentials);
                    if (user) {
                        return user; // Return user object with an 'id' property
                    } else {
                        return null;
                    }
                } catch (error: any) {
                    console.error("Authentication error:", error.message);
                    throw new Error(error.message);
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin', // Custom sign-in page (will create later)
        error: '/auth/error', // Custom error page (will create later)
    },
    callbacks: {
        async jwt({ token, user }) {
            // Persist the user data (from authorize) into the JWT
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.nombre = user.nombre;
                token.accessToken = user.accessToken; // Assuming your backend returns an accessToken
                token.isadmin = user.isadmin;
                token.tipo_usuario = user.tipo_usuario;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email;
                session.user.nombre = token.nombre;
                session.accessToken = token.accessToken as string;
                session.user.isadmin = token.isadmin as boolean;
                session.user.tipo_usuario = token.tipo_usuario as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET, // Define NEXTAUTH_SECRET in .env.local
};

export default NextAuth(authOptions);
