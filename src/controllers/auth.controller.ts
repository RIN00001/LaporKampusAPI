import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ResponseError } from "../utils/response-error";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ResponseError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ResponseError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  };
}