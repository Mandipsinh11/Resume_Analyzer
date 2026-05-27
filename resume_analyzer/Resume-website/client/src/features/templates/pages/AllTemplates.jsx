import { useState } from "react";
import {
  LayoutGrid,
  FileText,
  Sparkles,
  Columns,
  User,
  Briefcase,
  CheckCircle,
} from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Galaxy",
    img: "/templates/template1.png",
    category: "simple",
  },
  {
    id: 2,
    name: "Eclipse",
    img: "/templates/template2.png",
    category: "professional",
  },
  {
    id: 3,
    name: "Aether",
    img: "/templates/template3.png",
    category: "simple",
  },
  {
    id: 4,
    name: "Solstice",
    img: "/templates/template4.png",
    category: "professional",
  },
  { id: 5, name: "Nova", img: "/templates/template5.png", category: "ats" },
  {
    id: 6,
    name: "Eon",
    img: "/templates/template6.png",
    category: "modern",
  },
  {
    id: 7,
    name: "Exoplanet",
    img: "/templates/template7.png",
    category: "one-column",
  },
  {
    id: 8,
    name: "Solastice",
    img: "/templates/template8.png",
    category: "one-column",
  },
  {
    id: 9,
    name: "Classic",
    img: "/templates/template9.png",
    category: "modern",
  },
  {
    id: 10,
    name: "Corporate",
    img: "/templates/template10.png",
    category: "professional",
  },
  {
    id: 11,
    name: "Corporate",
    img: "/templates/template11.png",
    category: "with-photo",
  },
  {
    id: 12,
    name: "Corporate",
    img: "/templates/template12.png",
    category: "with-photo",
  },
  {
    id: 13,
    name: "Corporate",
    img: "/templates/template13.png",
    category: "with-photo",
  },
  {
    id: 14,
    name: "Corporate",
    img: "/templates/template14.png",
    category: "modern",
  },
  {
    id: 15,
    name: "Corporate",
    img: "/templates/template15.png",
    category: "modern",
  },
  {
    id: 16,
    name: "Corporate",
    img: "/templates/template16.png",
    category: "professional",
  },
];

const categories = [
  { label: "All Templates", value: "all", icon: LayoutGrid },
  { label: "Simple", value: "simple", icon: FileText },
  { label: "Modern", value: "modern", icon: Sparkles },
  { label: "One column", value: "one-column", icon: Columns },
  { label: "With photo", value: "with-photo", icon: User },
  { label: "Professional", value: "professional", icon: Briefcase },
  { label: "ATS", value: "ats", icon: CheckCircle },
];

export default function AllTemplates() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-black py-24 px-10">
      <h1 className="text-5xl font-bold text-center mb-12">
        Professional Resume Templates
      </h1>

      {/* CATEGORY NAV */}
      <div className="flex flex-wrap justify-center gap-6 border-b pb-5 mb-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-2 pb-2 text-[25px] md:text-[18px] font-medium transition border-b-2 ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <Icon
                size={16}
                className={isActive ? "text-black" : "text-gray-400"}
              />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-2 transition"
          >
            <div className="aspect-3/4 bg-white border border-gray-200 overflow-hidden shadow-inner">
              <img
                src={template.img}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            <div className="p-5 text-center">
              <h3 className="font-medium text-[15px]">{template.name}</h3>
              <button className="mt-3 w-full bg-black text-white py-2 rounded-md text-[14px] font-medium">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
