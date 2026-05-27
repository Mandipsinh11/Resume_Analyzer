import { useEffect, useState } from "react";
import r1 from "../assets/res1.jpg";
import r2 from "../assets/res2.jpg";
import r3 from "../assets/res3.jpg";
import r4 from "../assets/res4.jpg";
import r5 from "../assets/res5.jpg";
import r6 from "../assets/res6.webp";

const images = [r1, r2, r3, r4, r5, r6];

const FallingResumes = ({ count = 20 }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 5,
      scale: 0.6 + Math.random() * 0.6,
      rotation: Math.random() * 360,
      img: images[Math.floor(Math.random() * images.length)],
    }));

    setItems(arr);
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {items.map((item) => (
        <div
        key={item.id}
        className="absolute animate-fall"
        style={{
        left: `${item.left}%`,
        animationDuration: `${item.duration}s`,
        animationDelay: `${item.delay}s`,
        transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
  }}
>
  <img
  src={item.img}
    alt="resume"
    className="w-20 opacity-80 drop-shadow-lg rounded-md"
  />
</div>
      ))}
    </div>
  );
};

export default FallingResumes;