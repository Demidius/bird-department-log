// Account management for the bird department journal.
// Only an active admin (checked against public.profiles) may call it.
// A copy of each password set here goes to public.account_passwords (only admins can read it; owner's request).
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const LOGIN_DOMAIN = "zoo-log.invalid";
const ROLES = ["admin", "staff", "viewer"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clean = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);
// deno-lint-ignore no-explicit-any
const keepPassword = async (admin: any, userId: string, password: string) =>
  !(await admin.from("account_passwords").upsert({ user_id: userId, password, updated_at: new Date().toISOString() })).error;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "unauthorized" }, 401);
    const { data: who, error: whoErr } = await admin.auth.getUser(jwt);
    if (whoErr || !who?.user) return json({ error: "unauthorized" }, 401);
    const callerId = who.user.id;
    const { data: caller } = await admin.from("profiles").select("role, active").eq("id", callerId).maybeSingle();
    if (!caller || !caller.active || caller.role !== "admin") return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;

    if (body.action === "create") {
      const login = clean(body.login, 32).toLowerCase();
      if (!/^[a-z0-9._-]{2,32}$/.test(login)) return json({ error: "bad_login" }, 400);
      const password = String(body.password ?? "");
      if (password.length < 8) return json({ error: "short_password" }, 400);
      const role = ROLES.includes(String(body.role)) ? String(body.role) : "staff";
      const { data: taken } = await admin.from("profiles").select("id").eq("login", login).maybeSingle();
      if (taken) return json({ error: "login_taken" }, 409);
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: `${login}@${LOGIN_DOMAIN}`,
        password,
        email_confirm: true,
        user_metadata: { login },
      });
      if (createErr || !created?.user) return json({ error: "create_failed", detail: createErr?.message ?? "" }, 400);
      const { error: profErr } = await admin.from("profiles").insert({
        id: created.user.id,
        login,
        display_name: clean(body.display_name, 80) || login,
        role,
        active: true,
      });
      if (profErr) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: "create_failed", detail: profErr.message }, 400);
      }
      const password_saved = await keepPassword(admin, created.user.id, password);
      return json({ ok: true, id: created.user.id, password_saved });
    }

    if (body.action === "update") {
      const id = clean(body.id, 64);
      const { data: target } = await admin.from("profiles").select("id, role, active").eq("id", id).maybeSingle();
      if (!target) return json({ error: "not_found" }, 404);
      const patch: Record<string, unknown> = {};
      if (body.display_name !== undefined) patch.display_name = clean(body.display_name, 80);
      if (body.role !== undefined) {
        if (!ROLES.includes(String(body.role))) return json({ error: "bad_role" }, 400);
        patch.role = String(body.role);
      }
      if (body.active !== undefined) patch.active = Boolean(body.active);
      if (body.login !== undefined) {
        const login = clean(body.login, 32).toLowerCase();
        if (!/^[a-z0-9._-]{2,32}$/.test(login)) return json({ error: "bad_login" }, 400);
        const { data: cur } = await admin.auth.admin.getUserById(id);
        if (!cur?.user?.email?.endsWith("@" + LOGIN_DOMAIN)) return json({ error: "email_login" }, 400);
        const { data: taken } = await admin.from("profiles").select("id").eq("login", login).neq("id", id).maybeSingle();
        if (taken) return json({ error: "login_taken" }, 409);
        if (`${login}@${LOGIN_DOMAIN}` !== cur.user.email) {
          const { error } = await admin.auth.admin.updateUserById(id, { email: `${login}@${LOGIN_DOMAIN}`, email_confirm: true });
          if (error) return json({ error: "login_update_failed" }, 400);
        }
        patch.login = login;
      }
      if (id === callerId && ((patch.role !== undefined && patch.role !== "admin") || patch.active === false)) {
        return json({ error: "self_lock" }, 400);
      }
      const password = body.password;
      if (password !== undefined && (typeof password !== "string" || password.length < 8)) {
        return json({ error: "short_password" }, 400);
      }
      if (typeof password === "string") {
        const { data, error } = await admin.auth.admin.updateUserById(id, { password });
        if (error || data?.user?.id !== id) return json({ error: "password_update_failed" }, 400);
      }
      const password_saved = typeof password === "string" ? await keepPassword(admin, id, password) : undefined;
      if (patch.active !== undefined && patch.active !== target.active) {
        const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: patch.active ? "none" : "876000h" });
        if (error) return json({ error: "update_failed", detail: error.message }, 400);
      }
      if (Object.keys(patch).length) {
        const { error } = await admin.from("profiles").update(patch).eq("id", id);
        if (error) return json({ error: "update_failed", detail: error.message }, 400);
      }
      return json({ ok: true, password_changed: typeof password === "string", password_saved });
    }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: "server", detail: String(e) }, 500);
  }
});
