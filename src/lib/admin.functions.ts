import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error("تعذر التحقق من الصلاحية");
  if (!data) throw new Error("غير مصرح لك بالوصول");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const start = new Date(); start.setHours(0, 0, 0, 0);
    const [{ count: users }, { count: linked }, { count: publishedToday }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("linkedin_connected", true),
      supabaseAdmin.from("posts").select("*", { count: "exact", head: true }).eq("status", "published").gte("published_at", start.toISOString()),
    ]);
    return {
      totalUsers: users ?? 0,
      linkedinConnected: linked ?? 0,
      publishedToday: publishedToday ?? 0,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, linkedin_email, linkedin_connected, disabled, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ToggleInput = z.object({ userId: z.string().uuid(), disabled: z.boolean() });
export const adminToggleUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ToggleInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ disabled: data.disabled }).eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListTones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase.from("tone_prompts").select("tone, system_prompt, updated_at").order("tone");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const SaveToneInput = z.object({ tone: z.string().min(1), system_prompt: z.string().min(1) });
export const adminSaveTone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SaveToneInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("tone_prompts")
      .upsert({ tone: data.tone, system_prompt: data.system_prompt, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: "tone" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase.from("app_settings").select("key, value");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const SaveSettingsInput = z.object({ entries: z.array(z.object({ key: z.string(), value: z.string() })) });
export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SaveSettingsInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    for (const e of data.entries) {
      const { error } = await supabase.from("app_settings")
        .upsert({ key: e.key, value: e.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return { isAdmin: !!data };
  });
