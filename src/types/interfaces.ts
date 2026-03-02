/* eslint-disable @typescript-eslint/no-unused-vars */

interface RegData {
  email: string;
  password: string;
}

interface UserData {
  id: string | undefined;
  name: string | null | undefined;
  email: string | undefined;
  createdAt: Date | undefined;
  role: Roles | undefined;
}

type Roles = "FREELANCER" | "CUSTOMER" | "ADMIN";

interface Return<T> {
  ok: boolean;
  message: string;
  data?: T;
}
