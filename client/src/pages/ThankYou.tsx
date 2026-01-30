import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

// Import your logo here - assuming it's available or using a placeholder
// In a real scenario, you'd use the correct path to your logo
const LogoPlaceholder = () => (
  <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center p-2 mb-8 mx-auto border border-gray-100 overflow-hidden">
    <img 
      src="/attached_assets/Screenshot_2026-01-28_181524_1769770244247.png" 
      alt="Restaurant Logo" 
      className="max-w-full max-h-full object-contain"
    />
  </div>
);

export default function ThankYou() {
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#22c55e", "#78350f", "#f97316", "#D32F2F"]; // green, brown, orange, red

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Logo Section - Temporarily Removed */}

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#D32F2F] mb-6">
          Thank You!
        </h1>

        {/* Success Message */}
        <p className="text-xl md:text-2xl text-[#F48FB1] font-medium leading-relaxed mb-10 px-4">
          Your feedback has been submitted successfully. We truly appreciate you taking the time to help us improve!
        </p>

        {/* Restaurant Callout Box */}
        <div className="bg-[#FFF8E1] rounded-xl py-4 px-6 mb-12 inline-block shadow-sm border border-[#FFF3E0]">
          <p className="text-[#A1887F] text-lg md:text-xl">
            We hope to see you again soon at <span className="text-[#D32F2F] font-bold">Shree Rath</span>
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-16">
          <Button 
            asChild 
            variant="outline"
            className="bg-white hover:bg-gray-50 text-[#D32F2F] border-[#EEEEEE] hover:border-[#E0E0E0] px-8 h-12 text-lg font-medium rounded-md shadow-sm transition-all duration-200"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Footer Message */}
        <footer className="text-gray-400 text-lg">
          Have a wonderful day!
        </footer>
      </motion.div>
    </div>
  );
}
