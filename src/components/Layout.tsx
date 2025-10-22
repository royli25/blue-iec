import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
  showGrid?: boolean;
}

export function Layout({ children, showGrid = true }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className={"relative min-h-screen w-screen overflow-x-hidden overflow-y-visible bg-[hsl(45_52%_97%)] " + (showGrid ? "grid-bg" : "") }>
        {/* Content */}
        <div className="relative min-h-screen">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

