import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "#0c0e15" }}>
      <div className="max-w-6xl mx-auto">
        <Motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
          style={{ background: "linear-gradient(135deg, #0a0d18 0%, #080b14 60%, #0a0c15 100%)" }}>
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ padding: "1px", background: "linear-gradient(135deg, rgba(37,99,235,0.5), rgba(59,130,246,0.15), rgba(245,158,11,0.3))", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
          {/* Glows */}
          <div className="absolute top-0 left-1/3 w-100 h-75 rounded-full pointer-events-none opacity-25"
            style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.35) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-87.5 h-62.5 rounded-full pointer-events-none opacity-15"
            style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.3) 0%, transparent 70%)" }} />
          {/* Floating orbs */}
          {[{ x:"10%",y:"20%",c:"rgba(59,130,246,0.7)",s:5 },{ x:"90%",y:"18%",c:"rgba(245,158,11,0.7)",s:4 },{ x:"88%",y:"78%",c:"rgba(59,130,246,0.5)",s:6 },{ x:"12%",y:"82%",c:"rgba(245,158,11,0.5)",s:4 }].map((o,i)=>(
            <Motion.div key={i} className="absolute rounded-full" style={{ left:o.x, top:o.y, width:o.s, height:o.s, background:o.c }}
              animate={{ y:[0,-14,0], opacity:[0.4,0.85,0.4] }} transition={{ duration:3+i, repeat:Infinity, delay:i*0.6 }} />
          ))}

          <div className="relative z-10 max-w-3xl mx-auto">
            <Motion.div initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8"
              style={{ background:"rgba(37,99,235,0.1)", border:"1px solid rgba(59,130,246,0.25)", color:"#93c5fd" }}>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              AI Engine Active — Analyzing Resumes Right Now
            </Motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-[-0.04em] leading-tight mb-6">
              Stop being filtered out.
              <br />
              <span style={{ color: "#3b82f6" }}>Start getting hired.</span>
            </h2>

            <p className="text-lg leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: "#64748b" }}>
              Thousands of job seekers used ATSify to bypass ATS filters and land interviews at Meta, Google, Amazon, and more.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
              <button onClick={() => navigate("/login")} className="group relative px-10 py-4 rounded-2xl font-black text-base text-white overflow-hidden"
                style={{ background:"linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow:"0 0 40px rgba(37,99,235,0.3)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:"linear-gradient(135deg, #2563eb, #3b82f6)" }} />
                <span className="relative z-10">Get Started for Free</span>
              </button>
             
                <button onClick={()=>{
                  const section=document.getElementById("pricing");
                  if(section) section.scrollIntoView({ behavior:"smooth" });}}
                  className="px-10 py-4 rounded-2xl font-black text-base text-white transition-all hover:brightness-110"
                  style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)" }}>
                  See Pricing
                </button>
              
            </div>

            <div className="pt-8" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          
              <div className="flex flex-wrap justify-center gap-8">
                {["Meta","Google","Amazon","Netflix","Apple","Stripe","Spotify","Airbnb"].map(n=>(
                  <span key={n} className="text-sm font-black tracking-tight transition-colors" style={{ color:"#334155" }}
                    onMouseEnter={e=>e.target.style.color="#64748b"} onMouseLeave={e=>e.target.style.color="#334155"}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </section>
  );
};
export default CTA;
