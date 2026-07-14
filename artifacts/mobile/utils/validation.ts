export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'weak';
  if (isStrongPassword(password)) return 'strong';
  return 'medium';
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidWeight(weight: number): boolean {
  return weight > 0 && weight < 500;
}

export function isValidHeight(height: number): boolean {
  return height > 50 && height < 300;
}

export function isValidAge(age: number): boolean {
  return age >= 13 && age <= 120;
}

export function validateLoginForm(
  email: string,
  password: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Name is required';
  else if (!isValidName(name)) errors.name = 'Name must be at least 2 characters';
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email';
  if (!password) errors.password = 'Password is required';
  else if (!isValidPassword(password))
    errors.password = 'Password must be at least 8 characters';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}
