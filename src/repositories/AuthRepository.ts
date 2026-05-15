import { prisma } from "../config/prisma";
import { UserRole } from "@prisma/client";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  saveUser(name: string, email: string, hashedPassword: string) {
    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.MAHASISWA,
      },
    });
  }
}