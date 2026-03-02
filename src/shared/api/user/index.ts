import axios, { AxiosError } from "axios";

interface IUser {
  email: string;
  password: string;
  role: Roles;
}
type Roles = "FREELANCER" | "CUSTOMER" | "ADMIN";

const User = {
  async create(data: IUser): Promise<Return<UserData>> {
    try {
      const res = await axios.post("/api/register", {
        data,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const res = error.response?.data;
        return res;
      }
      return { ok: false, message: "Something Wrong!" };
    }
  },
};

export default User;
