import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import PasswordGate from "@/components/PasswordGate";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Blogs from "./pages/Blogs";
import ProfileContext from "./pages/ProfileContext";
import Technology from "./pages/Technology";
import ApplicationContext from "./pages/ApplicationContext";
import PersonalBlueprint from "./pages/PersonalBlueprint";

const queryClient = new QueryClient();

// Change this password to whatever you want
const SITE_PASSWORD = "blueprint2024";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PasswordGate correctPassword={SITE_PASSWORD}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<ProfileContext />} />
              <Route path="/personal-blueprint" element={<PersonalBlueprint />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/context" element={<ApplicationContext />} />
              <Route path="/blogs" element={<Blogs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </PasswordGate>
  </QueryClientProvider>
);

export default App;
