import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginRequestDTO, RegisterRequestDTO } from "../dtos/auth.dto";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validations/auth.validation";

export class AuthService {
  private authRepository = new AuthRepository();

  async register(dto: RegisterRequestDTO) {
    validateRegisterInput(dto);

    const { name, email, password } = dto;

    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.authRepository.saveUser(
      name,
      email,
      hashedPassword
    );

    return {
      message: "Register success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        division: user.division,
      },
    };
  }

  async login(dto: LoginRequestDTO) {
    validateLoginInput(dto);

    const { email, password } = dto;

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        division: user.division,
      },
      process.env.JWT_SECRET_KEY || "backend",
      { expiresIn: "7d" }
    );

    return {
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        division: user.division,
      },
    };
  }
}