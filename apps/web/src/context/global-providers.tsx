import { ReactNode } from "react";
import { AuthProvider } from "./auth-context";

export function GlobalProviders({ children } : { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}