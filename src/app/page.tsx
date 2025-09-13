"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 landing-page">
      <div className="text-center space-y-6 lg:space-y-8 max-w-sm sm:max-w-md mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900"
        >
          Career Guide AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-sm sm:max-w-md mx-auto"
        >
          Get personalized career guidance powered by AI
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Button size="sm" className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 lg:py-6 cursor-pointer bg-gray-700 hover:bg-gray-800 text-white w-full sm:w-auto">
            <Link href="/chat" className="text-white text-bold flex items-center justify-center space-x-2">
              <span>Start Chatting</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
