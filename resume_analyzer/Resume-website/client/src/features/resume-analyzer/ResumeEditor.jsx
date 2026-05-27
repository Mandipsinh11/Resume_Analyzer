import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Bold,
  Italic,
  List,
  Type
} from "lucide-react";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-[var(--bg-3)] border-b border-[var(--border)] rounded-t-3xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive("bold") ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-3)] hover:bg-[var(--bg)]"}`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive("italic") ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-3)] hover:bg-[var(--bg)]"}`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive("bulletList") ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-3)] hover:bg-[var(--bg)]"}`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-lg transition-all ${editor.isActive("heading", { level: 2 }) ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-3)] hover:bg-[var(--bg)]"}`}
      >
        <Type className="w-4 h-4" />
      </button>
    </div>
  );
};

const ResumeEditor = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [exporting, setExporting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h2 style="font-size: 24px; font-weight: 900; color: #1e293b; margin-bottom: 20px;">Professional Experience</h2>
      <p style="color: #475569;">[Job Title] | [Company Name] | [Dates]</p>
      <ul>
        <li>Implemented neural ATS optimization reducing bypass failure by 40%...</li>
        <li>Architected scalable semantic search engines for enterprise discovery...</li>
      </ul>
    `,
  });

  const onDrop = (acceptedFiles) => {
    setUploadedFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDownloadPDF = async () => {
    setExporting(true);
    setTimeout(async () => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 800]);
      page.drawText(editor.getHTML().replace(/<[^>]+>/g, ""), { x: 50, y: 750, size: 12 });
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setExporting(false);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'Optimized_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] hover:text-[var(--primary)] transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Command Center
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={exporting}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Download className="w-4 h-4" />}
              {exporting ? "Compiling..." : "Export PDF"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Editor Sidebar */}
          <div className="space-y-8">
            <div className="p-8 bg-[var(--bg-2)] rounded-[32px] border border-[var(--border)] shadow-xl">
              <h3 className="text-xl font-black tracking-tight text-[var(--text)] mb-6">Import Context</h3>
              <div
                {...getRootProps()}
                className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragActive ? "border-[var(--primary)] bg-[var(--primary-glow)]/5" : "border-[var(--border)] hover:border-[var(--primary)]"
                  } ${uploadedFile ? "bg-emerald-50/10 border-emerald-500/50" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {uploadedFile ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Upload className="w-6 h-6 text-[var(--text-3)]" />}
                </div>
                <p className="text-xs font-bold text-[var(--text-3)] mb-1">
                  {uploadedFile ? uploadedFile.name : "Drag & drop resume"}
                </p>
                <p className="text-[10px] text-[var(--text-3)] opacity-60 uppercase tracking-widest font-black">
                  PDF / DOCX Payload
                </p>
              </div>
            </div>

            <div className="p-8 bg-[var(--bg-2)] rounded-[32px] border border-[var(--border)] shadow-xl">
              <h3 className="text-xl font-black tracking-tight text-[var(--text)] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" /> Pro Tip
              </h3>
              <p className="text-sm font-medium text-[var(--text-3)] leading-relaxed">
                ATS systems prioritize readability over complex layouts. Use clear section headers and avoid overlapping text boxes.
              </p>
            </div>
          </div>

          {/* Main Editor Surface */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] shadow-2xl border border-[var(--border)] overflow-hidden">
              <MenuBar editor={editor} />
              <div className="p-12 min-h-[800px] prose prose-slate max-w-none">
                <EditorContent
                  editor={editor}
                  className="outline-none min-h-[700px] text-[var(--text)] font-medium leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
