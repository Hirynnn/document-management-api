declare module "bcrypt";
declare module "cors";
declare module "morgan";
declare module "swagger-jsdoc";
declare module "swagger-ui-express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
      };
    }
  }
}

export {};
