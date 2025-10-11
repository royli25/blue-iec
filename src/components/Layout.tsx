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
      <div className="relative min-h-screen w-screen overflow-x-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
        {showGrid && <div className="absolute inset-0 grid-bg opacity-70" />}
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

