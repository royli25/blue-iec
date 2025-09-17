import ChatBot from "@/components/ChatBot";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, MessageSquarePlus } from "lucide-react";

const Index = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background relative">
      {/* Center vertical divider */}
      <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border transition-opacity duration-500 ${collapsed ? "opacity-0" : "opacity-100"}`} />

      {/* Two-column layout: hero left, chat right */}
      <div className="flex h-full w-full">
        {/* Left: includes its own top nav and centered hero */}
        <div className={`${collapsed ? "w-16" : "w-1/2"} h-full relative overflow-hidden transition-[width] duration-500 ease-in-out`}>
          {collapsed ? (
            // Collapsed sliver sidebar
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm border-r border-border flex flex-col items-center py-4 gap-4">
              <button className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-foreground/5 flex items-center justify-center" aria-label="Home">
                <Home className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-foreground/5 flex items-center justify-center" aria-label="New Chat">
                <MessageSquarePlus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Left-side nav */}
              <div className="relative z-10 flex items-center gap-8 px-8 sm:px-12 md:px-20 lg:px-28 pt-6 pb-4 text-base text-foreground/80">
                <span>clyro.ai</span>
                <nav className="hidden sm:flex items-center gap-6">
              <Link className="hover:text-foreground" to="#">About Us</Link>
              <Link className="hover:text-foreground" to="#">Solutions</Link>
              <Link className="hover:text-foreground" to="/blogs">Blogs</Link>
                </nav>
              </div>
              {/* Hero vertically centered */}
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <div className="px-8 sm:px-12 md:px-20 lg:px-28 -translate-y-[15%]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-[#2F647F]">
                    Understand College Admissions
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl md:text-2xl text-[#2F647F]">
                    // Identifying admissions patterns w. advanced neural networks.
                  </p>
                </div>
              </div>
              {/* Bottom-left supporting copy */}
              <div className="absolute bottom-8 left-0 px-8 sm:px-12 md:px-20 lg:px-28 pointer-events-none">
                <p className="text-[13px] sm:text-sm text-[#2F647F]/80 leading-relaxed">
                  — 3,600+ students have increased their chances of getting into college using clyro.ai
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right chat area */}
        <div className={`${collapsed ? "flex-1" : "w-1/2"} h-full relative transition-[width] duration-500 ease-in-out`}>
          {/* Collapse/expand carrot */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute top-4 left-4 z-30 h-8 w-8 rounded-full bg-card/80 border border-border backdrop-blur-sm flex items-center justify-center shadow-sm hover:opacity-90"
            aria-label={collapsed ? "Expand left panel" : "Collapse left panel"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default Index;
