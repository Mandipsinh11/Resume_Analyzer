import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = [
    {
        title: "Product",
        links: [
            { name: "AI Analyzer", href: "#features" },
            { name: "Templates", href: "#templates" },
            { name: "Pricing", href: "#pricing" },
            { name: "How it Works", href: "#how" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About Us", href: "/about" },
            { name: "Careers", href: "/careers" },
            { name: "Blog", href: "/blog" },
            { name: "Contact", href: "/contact" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Cookie Policy", href: "/cookies" },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="border-t border-[var(--border)] pt-24 pb-12 relative z-10" style={{ background: "var(--bg)" }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-8 group cursor-pointer">
                            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10 group-hover:rotate-[10deg] transition-transform">
                                <span className="font-black text-xl">A</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-[var(--text)]">
                                ATSify<span className="text-[var(--primary)]">.ai</span>
                            </span>
                        </div>
                        <p className="text-[var(--text-2)] text-lg font-medium max-w-sm mb-10 leading-relaxed">
                            Empowering job seekers with cutting-edge AI to bypass filters and land dream interviews.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: Twitter, href: "#" },
                                { Icon: Linkedin, href: "#" },
                                { Icon: Github, href: "#" },
                                { Icon: Mail, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-11 h-11 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:-translate-y-1 transition-all"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {FOOTER_LINKS.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-[var(--text)] font-black uppercase tracking-[0.2em] text-[10px] mb-8">
                                {group.title}
                            </h4>
                            <ul className="space-y-4">
                                {group.links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="group flex items-center gap-2 text-[var(--text-2)] font-medium hover:text-[var(--primary)] transition-colors"
                                        >
                                            {link.name}
                                            <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-12 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[var(--text-3)] text-sm font-medium">
                        © {new Date().getFullYear()} ATSify Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-[var(--text-3)] text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Status: All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
