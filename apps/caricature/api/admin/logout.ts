import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearAdminSession } from "../../server/admin-auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  clearAdminSession(res);
  return res.status(204).end();
}
