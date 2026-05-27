import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
   <>
  {/* INNER DOT */}
  <motion.div
    className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-9999"
    animate={{ x: pos.x - 1, y: pos.y - 1 }}
    transition={{ duration: 0.05 }}
  />

  {/* OUTER RING */}
  <motion.div
    className="fixed top-0 left-0 rounded-full pointer-events-none z-9998 
               border border-white/30"
    animate={{
      x: pos.x - 12,
      y: pos.y - 12,
      width: 24,
      height: 24,
    }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  />
</>
  );
};

export default CustomCursor;