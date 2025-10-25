import { useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageConfig {
  title: string;
  subtitle?: string;
}

const getPageConfig = (pathname: string, t: (key: string) => string): PageConfig => {
  const routes: Record<string, PageConfig> = {
    "/": {
      title: t("pages.home.title"),
      subtitle: "AI-powered college admissions advisor",
    },
    "/personal-blueprint": {
      title: t("pages.blueprint.title"),
      subtitle: "Your personalized college application roadmap",
    },
    "/admitted-data": {
      title: t("pages.admittedData.title"),
      subtitle: "Explore real student profiles and outcomes",
    },
    "/technology": {
      title: t("pages.technology.title"),
      subtitle: "How Blueprint works",
    },
    "/profile": {
      title: t("pages.profile.title"),
      subtitle: "Build your profile for personalized recommendations",
    },
    "/unlocks": {
      title: t("pages.unlocks.title"),
      subtitle: "Premium features and content",
    },
    "/purchased-content": {
      title: t("pages.purchasedContent.title"),
      subtitle: "Your unlocked resources",
    },
  };

  return routes[pathname] || { title: "Blueprint", subtitle: "College Admissions Platform" };
};

export function PageHeader() {
  const location = useLocation();
  const { t } = useTranslation();
  const config = getPageConfig(location.pathname, t);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-6">
      <SidebarTrigger className="h-5 w-5 text-gray-600 hover:text-gray-900" />
      <div className="flex flex-col">
        <h1 className="text-base font-semibold text-gray-900">{config.title}</h1>
        {config.subtitle && (
          <p className="text-xs text-gray-500">{config.subtitle}</p>
        )}
      </div>
    </header>
  );
}

