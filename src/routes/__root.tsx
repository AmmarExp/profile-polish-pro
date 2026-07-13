import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">الصفحة غير موجودة / Page not found</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            الرئيسية / Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">حدث خطأ / Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            حاول مجدداً / Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ReachLink | اكتب وجدول منشورات لينكدإن بالذكاء الاصطناعي" },
      { name: "description", content: "ReachLink يساعدك على كتابة وجدولة منشورات لينكدإن بالعربية والإنجليزية، وتحسين ملفك المهني لبناء علامتك الشخصية وجذب وظائف وعملاء وفرص أفضل." },
      { property: "og:title", content: "ReachLink | اكتب وجدول منشورات لينكدإن بالذكاء الاصطناعي" },
      { property: "og:description", content: "ReachLink يساعدك على كتابة وجدولة منشورات لينكدإن بالعربية والإنجليزية، وتحسين ملفك المهني لبناء علامتك الشخصية وجذب وظائف وعملاء وفرص أفضل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ReachLink | اكتب وجدول منشورات لينكدإن بالذكاء الاصطناعي" },
      { name: "twitter:description", content: "ReachLink يساعدك على كتابة وجدولة منشورات لينكدإن بالعربية والإنجليزية، وتحسين ملفك المهني لبناء علامتك الشخصية وجذب وظائف وعملاء وفرص أفضل." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea317261-cf12-4a58-805a-6123794ef6a4/id-preview-e96e53d0--262bfaac-0fad-4524-ad74-4d0c08174a57.lovable.app-1783642978683.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea317261-cf12-4a58-805a-6123794ef6a4/id-preview-e96e53d0--262bfaac-0fad-4524-ad74-4d0c08174a57.lovable.app-1783642978683.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "canonical", href: "https://link-enhancer-ai.lovable.app/" },
      { rel: "alternate", href: "https://link-enhancer-ai.lovable.app/", hrefLang: "ar" },
      { rel: "alternate", href: "https://link-enhancer-ai.lovable.app/en", hrefLang: "en" },
      { rel: "alternate", href: "https://link-enhancer-ai.lovable.app/", hrefLang: "x-default" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: "ReachLink",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "أداة ذكاء اصطناعي لكتابة وجدولة منشورات لينكدإن وتحسين الحضور المهني.",
              url: "https://link-enhancer-ai.lovable.app/",
            },
            {
              "@type": "Organization",
              name: "ReachLink",
              url: "https://link-enhancer-ai.lovable.app/",
              logo: "https://link-enhancer-ai.lovable.app/favicon.ico",
              termsOfService: "https://link-enhancer-ai.lovable.app/terms",
              publishingPrinciples: "https://link-enhancer-ai.lovable.app/privacy",
              sameAs: [],
            },
            {
              "@type": "WebSite",
              name: "ReachLink",
              url: "https://link-enhancer-ai.lovable.app/",
              inLanguage: "ar",
              publisher: { "@type": "Organization", name: "ReachLink" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function LangEffect() {
  const { lang, dir } = useI18n();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LangEffect />
        <AuthSync />
        <Outlet />
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}
