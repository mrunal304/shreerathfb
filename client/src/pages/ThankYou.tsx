import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";
import logoPath from "@assets/shreerath_logo_brown-removebg-preview_1772012002969.png";

export default function ThankYou() {
  const [location] = useLocation();
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    // Get visit count from navigation state or local storage if needed
    // For now, we'll try to get it from the URL or state if passed
    const searchParams = new URLSearchParams(window.location.search);
    const count = searchParams.get('visits');
    if (count) {
      setVisitCount(parseInt(count));
    }

    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#78350f", "#f97316", "#22c55e"]; // brown, orange, green

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 45,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        scalar: 0.7
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 45,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        scalar: 0.7
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden text-center bg-[#FFF8E1]">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#78350f]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f97316]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full z-10 bg-white rounded-[2rem] shadow-2xl shadow-brown-900/20 p-8 border border-amber-100 relative"
      >
        {/* Logo at Top */}
        <div className="mb-6 flex justify-center">
          <img src={logoPath} alt="Shree Rath Logo" className="h-20 w-auto object-contain" />
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-200" />
          <div className="w-2 h-2 rounded-full bg-amber-300" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-200" />
        </div>

        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border-2 border-green-100">
            <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-4xl font-extrabold text-[#5D4037] mb-4 tracking-tight">
          Thank <span className="text-[#8D6E63]">You!</span>
        </h1>

        {/* Success Message */}
        <p className="text-lg text-brown-800/80 font-medium mb-6 px-2">
          Your feedback has been submitted successfully. We truly appreciate your time!
        </p>

        {/* Visit Count Message */}
        {visitCount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 py-3 px-4 bg-amber-50 rounded-xl border border-amber-100 inline-block"
          >
            <p className="text-[#78350f] font-bold text-lg">
              This was your {visitCount}{visitCount === 1 ? 'st' : visitCount === 2 ? 'nd' : visitCount === 3 ? 'rd' : 'th'} visit to Shree Rath!
            </p>
          </motion.div>
        )}

        {/* Decorative divider line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent mb-8" />

        {/* Back Button */}
        <div className="flex flex-col gap-4">
          <Button 
            asChild 
            className="bg-[#5D4037] hover:bg-[#4E342E] text-white h-14 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Link href="/">
              <div className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Back to Home
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </Button>
          
          <p className="text-brown-400 text-sm font-semibold uppercase tracking-widest">
            Have a wonderful day!
          </p>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        iframe#replit-badge { display: none !important; }
        .replit-auth-button { display: none !important; }
      `}} />
    </div>
  );
}


