import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Organizations from "./pages/Organizations";
import AddOrganization from "./pages/AddOrganization";
import ReviewOrganizations from "./pages/ReviewOrganizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Causes from "./pages/Causes";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import JoinVolunteer from "./pages/JoinVolunteer";
import ReviewVolunteers from "./pages/ReviewVolunteers";
import ReviewInquiries from "./pages/ReviewInquiries";
import RegisterGroup from "./pages/RegisterGroup";
import ReviewGroups from "./pages/ReviewGroups";
import PaymentGateway from "./pages/PaymentGateway";
import PaymentSuccess from "./pages/PaymentSuccess";
import Transparency from "./pages/Transparency";
import { BottomNav } from "./components/layout/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="pb-16 lg:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/organizations/add" element={<AddOrganization />} />
                <Route path="/groups/register" element={<RegisterGroup />} />
                <Route path="/admin/review" element={<ReviewOrganizations />} />
                <Route path="/organizations/:id" element={<OrganizationDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/causes" element={<Causes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/volunteer/join" element={<JoinVolunteer />} />
                <Route path="/admin/volunteers" element={<ReviewVolunteers />} />
                <Route path="/admin/inquiries" element={<ReviewInquiries />} />
                <Route path="/admin/groups" element={<ReviewGroups />} />
                <Route path="/payment" element={<PaymentGateway />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/transparency" element={<Transparency />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
