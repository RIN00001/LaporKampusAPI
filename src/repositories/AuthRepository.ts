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

  checkUser(userId: number) {
    return prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        role: true,
        division: true
      }
    })
  }
}
