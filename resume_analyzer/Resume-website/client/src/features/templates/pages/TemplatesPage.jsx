import { useParams, useNavigate } from "react-router-dom";
import { templates } from "../../../data/templates";
import { useState } from "react";
import { X } from "lucide-react";

const categories = [
  { name: "All Templates", value: "all" },
  { name: "Simple", value: "simple" },
  { name: "Modern", value: "modern" },
  { name: "Professional", value: "professional" },
  { name: "One Column", value: "one-column" },
  { name: "With Photo", value: "with-photo" },
  { name: "ATS", value: "ats" },
];

const TemplatesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const activeCategory = category || "all";

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  return (
    <div className="bg-white min-h-screen text-black px-6 md:px-12 py-20">
      {/* TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold">Resume templates</h1>
        <p className="mt-4 text-gray-500 text-lg">
          Choose a category and start building.
        </p>
      </div>

      {/* CATEGORY NAVIGATION */}
      <div className="flex flex-wrap justify-center gap-6 border-b pb-6 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() =>
              cat.value === "all"
                ? navigate("/templates")
                : navigate(`/templates/${cat.value}`)
            }
            className={`font-semibold px-4 py-2 rounded-full transition ${activeCategory === cat.value
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-10">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition cursor-pointer flex flex-col items-center justify-center"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="h-64 w-48 flex items-center justify-center bg-gray-100">
              <img
                src={template.img}
                alt={template.name}
                className="w-24 h-24 object-cover"
              />
            </div>
            <h3 className="font-bold text-lg mt-4 mb-2">{template.name}</h3>
          </div>
        ))}
      </div>

      {/* Modal for template preview and actions */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={() => setSelectedTemplate(null)}>
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              <img src={selectedTemplate.img} alt={selectedTemplate.name} className="w-32 h-32 object-cover mb-4" />
              <h2 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h2>
              <p className="text-sm text-gray-500 mb-6">ATS Ready Template</p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => { setSelectedTemplate(null); navigate(`/editor/${selectedTemplate.id}`); }}
                >
                  Use Template
                </button>
                <button
                  className="w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                  onClick={() => { setSelectedTemplate(null); navigate(`/editor/${selectedTemplate.id}`); }}
                >
                  Edit Resume
                </button>
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  onClick={() => { setSelectedTemplate(null); navigate(`/analyze/${selectedTemplate.id}`); }}
                >
                  Analyze Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
