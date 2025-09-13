"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl font-bold text-gray-900 dark:text-white"
        >
          Career Guide AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto"
        >
          Get personalized career guidance powered by AI
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >

          <Button size="sm" className="text-lg px-8 py-6 cursor-pointer bg-black text-white">
            <Link href="/chat" className="text-white text-bold">
              Start Chatting
              {/* <span><ArrowRight className="h-4 w-4" /></span> */}
              
            </Link>
          </Button>

        </motion.div>
      </div>
    </div>
  );
}
