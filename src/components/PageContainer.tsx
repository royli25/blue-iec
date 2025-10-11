import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

export function PageContainer({ 
  children, 
  maxWidth = "4xl",
  className 
}: PageContainerProps) {
  return (
    <div className={cn("px-6 pt-12 pb-12", className)}>
      <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
}

