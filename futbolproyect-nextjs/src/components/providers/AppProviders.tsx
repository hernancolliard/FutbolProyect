"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import RootClientLayout from "@/components/layout/RootClientLayout";
import I18nProvider from "@/components/I18nProvider";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ParallaxClientProvider from "@/components/providers/ParallaxProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ParallaxClientProvider>
      <ReactQueryProvider>
        <ThemeRegistry>
          <I18nProvider>
            <SessionProvider>
              <AuthProvider>
                <RootClientLayout>{children}</RootClientLayout>
              </AuthProvider>
            </SessionProvider>
          </I18nProvider>
        </ThemeRegistry>
      </ReactQueryProvider>
    </ParallaxClientProvider>
  );
}
