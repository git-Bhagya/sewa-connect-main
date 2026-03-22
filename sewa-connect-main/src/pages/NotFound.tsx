import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative pt-20">
        <div className="absolute inset-0 max-w-7xl mx-auto overflow-hidden pointer-events-none opacity-20 dark:opacity-10 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="text-center w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 relative inline-block">
            <h1 className="text-[150px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-slate-200 opacity-90 select-none">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Page Not Found
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 w-full sm:w-auto shadow-lg shadow-primary/20" asChild>
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-xl w-full sm:w-auto border-2 hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
