import z from "zod";

const strongPassword = z
  .string()
  .min(8, "Password minimum 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /(?=.*[!@#$%^&*])/,
    "Password must contain at least one special character",
  );

export class UserValidation {
  static readonly REGISTER = z.object({
    email: z.email().min(1, "Email is required").max(100, "Email is too long"),

    username: z
      .string()
      .min(3, "Username minimum 3 characters")
      .max(100, "Username is too long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username must contain only letters, numbers, and underscores",
      ),

    password: strongPassword,

    fullName: z
      .string()
      .min(1, "Full Name is required")
      .max(100, "Full Name is too long"),

    secondary_number: z.string().optional(),
  });

  static readonly LOGIN = z.object({
    identifier: z
      .string()
      .min(1, "Username or Email is required")
      .superRefine((val, ctx) => {
        if (val.includes("@")) {
          const isEmailValid = z.email().safeParse(val).success;

          if (!isEmailValid) {
            ctx.addIssue({
              code: "custom",
              message: "Invalid email address",
            });
          }
          return;
        }

        if (val.length < 3) {
          ctx.addIssue({
            code: "custom",
            message: "Username must be at least 3 characters",
          });
        }
      })
      .max(100, "Username/Email is too long"),
    password: z.string().min(8, "Password is required"),
  });
}
