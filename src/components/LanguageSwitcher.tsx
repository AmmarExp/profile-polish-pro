import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {lang === "ar" ? "EN" : "عربي"}
    </Button>
  );
}
