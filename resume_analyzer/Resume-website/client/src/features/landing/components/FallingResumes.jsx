import React from "react";

/* Pure CSS resume shapes — no images needed */
const FallingResumes = () => {
    const resumes = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${4 + Math.random() * 92}%`,
        delay: Math.random() * 14,
        duration: 20 + Math.random() * 14,
        size: 32 + Math.random() * 44,
        rotation: -25 + Math.random() * 50,
        lines: 2 + Math.floor(Math.random() * 3),
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {resumes.map((r) => (
                <div
                    key={r.id}
                    className="absolute opacity-0"
                    style={{
                        left: r.left,
                        width: r.size,
                        height: r.size * 1.4,
                        animation: `falling ${r.duration}s linear infinite`,
                        animationDelay: `${r.delay}s`,
                    }}
                >
                    <div
                        className="w-full h-full rounded-md shadow-md border border-blue-100/40 overflow-hidden p-1.5 flex flex-col gap-1"
                        style={{
                            background: "rgba(255,255,255,0.75)",
                            transform: `rotate(${r.rotation}deg)`,
                            animation: `sway ${r.duration / 3}s ease-in-out infinite alternate`,
                        }}
                    >
                        {/* Mini header bar */}
                        <div className="w-3/5 h-1 rounded-full bg-blue-300/40" />
                        <div className="w-2/5 h-0.5 rounded-full bg-blue-200/30" />
                        <div className="mt-auto flex flex-col gap-0.5">
                            {Array.from({ length: r.lines }).map((_, j) => (
                                <div key={j} className="w-full h-0.5 rounded-full bg-gray-300/30" />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            {/* Gradient overlay to keep text readable */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, var(--bg) 0%, transparent 15%, transparent 85%, var(--bg) 100%)"
            }} />
        </div>
    );
};

export default FallingResumes;
