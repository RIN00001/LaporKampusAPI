import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/AuthRepository";
import { LoginRequestDTO, RegisterRequestDTO } from "../dtos/AuthDTO";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validations/AuthValidation";
import { DivisionType } from "@prisma/client";

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

  // Validate if an user is a staff
  async checkIfUserStaff(userId: number) {
    const user = await this.authRepository.checkUser(userId)
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "STAFF") {
      throw new Error("Unauthorized: Only staff members can validate reports");
    }

    return user;
  }

  // Validate staff that access admin
  validateStaffDivision(division: DivisionType | null) {
    // If user have no division, throw error
    if (!division) {
      throw new Error("Unauthorized: You are not assigned to any division")
    }

    // Return division
    return division;
  }

  // Validate if user is a staff of a certain division that's the same as the report
  checkIfReportIsPartOfStaffDivision(staffDivision: DivisionType | null, reportTakenDivision: DivisionType) {
    if(!staffDivision) {
      throw new Error("Unauthorized: You are not assigned to any division")
    } 
    if(staffDivision !== reportTakenDivision) {
      throw new Error(`Unauthorized: You can only validate reports for ${staffDivision}`)
    }
  }
}