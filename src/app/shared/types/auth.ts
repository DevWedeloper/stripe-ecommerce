type EmailField = {
  email: string;
};

type PasswordField = {
  password: string;
};

type ConfirmPasswordField = {
  confirmPassword: string;
};

export type UserCredentials = EmailField & PasswordField;

export type UserRegistration = EmailField & PasswordField & ConfirmPasswordField;

export type EmailUpdate = EmailField;

export type PasswordUpdate  = PasswordField & ConfirmPasswordField;
