import { LoginRequestDTO, RegisterRequestDTO } from "../dtos/auth.dto";

export function validateRegisterInput(dto: RegisterRequestDTO) {
  const { name, email, password } = dto;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  if (!email.toLowerCase().endsWith("@student.uc.ac.id")) {
    throw new Error("Email must use @student.uc.ac.id domain");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}

export function validateLoginInput(dto: LoginRequestDTO) {
  const { email, password } = dto;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }
}