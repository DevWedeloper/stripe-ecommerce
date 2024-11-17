type EmailField = {
  email: string;
};

type PasswordField = {
  password: string;
};

type ConfirmPasswordField = {
  confirmPassword: string;
};

export type LoginData = EmailField & PasswordField;

export type SignUpData = EmailField & PasswordField & ConfirmPasswordField;

export type ForgotPasswordData = EmailField;

export type ResetPasswordData = PasswordField & ConfirmPasswordField;
