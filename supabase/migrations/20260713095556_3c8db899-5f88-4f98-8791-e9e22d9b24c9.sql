
CREATE TABLE public.tone_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tone TEXT NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
GRANT SELECT ON public.tone_prompts TO authenticated;
GRANT ALL ON public.tone_prompts TO service_role;
ALTER TABLE public.tone_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read tone prompts" ON public.tone_prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage tone prompts" ON public.tone_prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.tone_prompts (tone, system_prompt) VALUES
('ودّي', 'اكتب المنشور بأسلوب ودي وحميمي. استخدم لغة بسيطة وجُمَلاً قصيرة. ابدأ بموقف من الحياة. أضف لمسة شخصية وتجنب المصطلحات المعقدة.'),
('رسمي', 'اكتب المنشور بأسلوب مهني ورسمي. استخدم مصطلحات متخصصة. ابدأ بحقيقة أو إحصائية. الجمل واضحة ومنطقية.'),
('ملهم', 'اكتب المنشور بأسلوب ملهم يحفز القراء. استخدم قصصاً قصيرة وعبارات قوية. اختم بدعوة للتفكير أو التغيير.'),
('تعليمي', 'اكتب المنشور بأسلوب تعليمي. قدّم معلومات مفيدة وقابلة للتطبيق. استخدم قوائم أو خطوات. كن دقيقاً وموضوعياً.'),
('خفيف الظل', 'اكتب المنشور بأسلوب خفيف وممتع. أضف دفئاً وفكاهة لطيفة. تجنب الجدية الزائدة. اجعل القارئ يبتسم.')
ON CONFLICT (tone) DO NOTHING;

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manages settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (key, value) VALUES
('max_free_posts_per_month', '3'),
('image_generation_enabled', 'true'),
('welcome_message', 'مرحباً بك في ReachLink! ابدأ بكتابة أول منشور لك.'),
('app_name', 'ReachLink')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;
