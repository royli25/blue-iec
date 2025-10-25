import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";

interface LayoutProps {
  children: ReactNode;
  showGrid?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
}

export function Layout({ children, showGrid = false, showHeader = true, showSidebar = true }: LayoutProps) {
  // If sidebar is hidden, don't use SidebarProvider
  if (!showSidebar) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="relative min-h-screen w-full overflow-x-hidden bg-gray-50">
        {showHeader && <PageHeader />}
        <div className="relative min-h-[calc(100vh-3.5rem)]">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
