import { z } from "zod";

// Custom User schema for validation
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  age: z.number().int().min(18).max(80),
  active: z.boolean(),
});


// Custom User type
export type User = z.infer<typeof UserSchema>;
