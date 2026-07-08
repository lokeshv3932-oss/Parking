const TOKEN_KEY = "symmes_customer_token";
const EMAIL_KEY = "symmes_customer_email";

export function saveCustomerSession(token: string, email: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(EMAIL_KEY, email);
  }
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getCustomerEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function clearCustomerSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(EMAIL_KEY);
  }
}

export function isCustomerLoggedIn(): boolean {
  return !!getCustomerToken();
}
