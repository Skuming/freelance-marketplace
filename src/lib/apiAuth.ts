import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      response: Response.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return { session, response: null };
}

export async function requireRole(roles: string[]) {
  const { session, response } = await requireSession();
  if (!session) return { session: null, response };

  if (!roles.includes(session.user.role)) {
    return {
      session: null,
      response: Response.json(
        { ok: false, message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return { session, response: null };
}
