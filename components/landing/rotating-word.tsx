"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const WORDS = ["tienda", "restaurante", "farmacia", "clínica", "negocio"]

export function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        className="inline-block text-[#25D366]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
      >
        {WORDS[index]}
      </motion.span>
    </AnimatePresence>
  )
}
