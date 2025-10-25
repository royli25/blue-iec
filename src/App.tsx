import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TranslationProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProfileContext from "./pages/ProfileContext";
import Technology from "./pages/Technology";
import ApplicationContext from "./pages/ApplicationContext";
import PersonalBlueprint from "./pages/PersonalBlueprint";
import AdmittedData from "./pages/AdmittedData";
import PurchasedContent from "./pages/PurchasedContent";
import Unlocks from "./pages/Unlocks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider>
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
              <Route path="/admitted-data" element={<AdmittedData />} />
              <Route path="/unlocks" element={<Unlocks />} />
              <Route path="/purchased-content" element={<PurchasedContent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </TranslationProvider>
  </QueryClientProvider>
);

export default App;
