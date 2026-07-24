export type AuthErrorCode =
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "EMAIL_IN_USE"
  | "WEAK_PASSWORD"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED"
  | "WORDPRESS_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export type SessionUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  turnstileToken?: string;
};

export type PasswordResetRequestInput = {
  email: string;
};

export type PasswordResetInput = {
  login: string;
  key: string;
  newPassword: string;
};

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};

export type WordpressAuthSuccess = {
  ok: true;
  token?: string;
  expiresIn?: number;
  user?: SessionUser;
  message?: string;
  /** One-time SSO login URL (from /auth/sso-code). */
  loginUrl?: string;
};

export type WordpressAuthFailure = {
  ok: false;
  errorCode?: AuthErrorCode;
  message?: string;
};

export type WordpressAuthResponse = WordpressAuthSuccess | WordpressAuthFailure;
