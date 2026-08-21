import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center"
    >
      <div className="text-center">
        <h1 className="font-['Orbitron'] text-6xl sm:text-8xl font-normal tracking-[0.15em] text-[#c2202f] mb-4">
          404
        </h1>
        <p className="font-['Orbitron'] text-lg font-normal tracking-[0.15em] uppercase text-[#999999] mb-8">
          Page Not Found
        </p>
        <Button
          className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium cursor-pointer"
          onClick={() => navigate("/")}
        >
          Back to Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
