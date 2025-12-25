import { useState, useRef } from "react";
import { Package, Upload, FileSpreadsheet, Info, RefreshCw, TreeDeciduous, Search, Palette, Zap } from "lucide-react";
import TreeWorkspace from "./components/TreeWorkspace";
import { parseExcel } from "./components/ExcelUpload";

export default function App() {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
      setError("Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      await parseExcel(file, setTreeData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to parse Excel file. Please check the file format.");
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleReset = () => {
    setTreeData(null);
    setFileName("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (treeData) {
    return (
      <>
        <TreeWorkspace data={treeData} />
        <button
          onClick={handleReset}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 border border-slate-200 font-medium rounded-lg shadow-xl shadow-slate-950/5 hover:bg-slate-50 hover:shadow-2xl hover:border-slate-300 transition-all duration-300 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Upload New File
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex items-center justify-center p-8 bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30">
      {/* Subtle Professional Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in space-y-6">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm group hover:border-cyan-500/50 transition-all duration-500 hover:scale-110">
              <Package className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-2xl">
            BharatNetra <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent font-extrabold pb-2">NCRP-GraphX</span>
          </h1>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Advanced financial transaction visualization and layering analysis platform for investigation professionals.
          </p>
        </div>

        {/* Upload Card */}
        <div
          className={`relative bg-slate-900/60 border rounded-3xl p-12 lg:p-16 text-center transition-all duration-300 backdrop-blur-md ${isDragging
            ? 'border-cyan-500 bg-cyan-500/10 ring-4 ring-cyan-500/20 scale-[1.02]'
            : 'border-slate-800 hover:border-slate-700 shadow-2xl shadow-black/40 hover:shadow-cyan-900/20'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="py-12">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-4 border-slate-700 rounded-full opacity-50"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Processing Analysis...</h3>
              <p className="text-slate-400 text-base">Parsing complex transaction hierarchy for {fileName}</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="w-24 h-24 bg-slate-800/80 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/20">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>

                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Upload Transaction Data</h2>
                <p className="text-slate-400 text-xl max-w-xl mx-auto leading-relaxed">
                  Drag and drop your <span className="text-cyan-200 font-bold font-mono text-sm px-2 py-1 bg-cyan-900/30 rounded border border-cyan-500/20">.xlsx</span> or <span className="text-cyan-200 font-bold font-mono text-sm px-2 py-1 bg-cyan-900/30 rounded border border-cyan-500/20">.csv</span> file
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .XLSX, .XLS, .CSV"
                onChange={handleFileChange}
                id="file-input"
                className="hidden"
              />

              <div className="flex flex-col items-center gap-8">
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-lg rounded-2xl cursor-pointer transition-all duration-300 shadow-xl shadow-cyan-900/40 hover:shadow-cyan-500/30 hover:-translate-y-1 min-w-[240px] justify-center"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  Select Spreadsheet
                </label>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-800/80">
                    <Info className="w-4 h-4 text-cyan-500/70" />
                    Max file size: 100MB
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-800/80">
                    <Info className="w-4 h-4 text-cyan-500/70" />
                    Required columns: Account No, Layer
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-6 right-6 max-w-md bg-red-950/80 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl flex items-start gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 text-left">
              <Info className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="text-base font-medium leading-relaxed">{error}</div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 opacity-90">
          {[
            { icon: TreeDeciduous, label: "Layer Visualization", desc: "Automated hierarchy mapping" },
            { icon: Search, label: "Deep Inspection", desc: "Interactive node details" },
            { icon: Palette, label: "Smart Coloring", desc: "Distinct phase identification" },
            { icon: Zap, label: "Instant Analysis", desc: "Real-time graph generation" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-6 text-center hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <feature.icon className="w-10 h-10 mx-auto mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              <div className="text-lg font-bold text-slate-200 mb-2">{feature.label}</div>
              <div className="text-sm text-slate-500 group-hover:text-slate-400">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 text-slate-600 text-sm font-medium tracking-wide">
          © 2025 BharatNetra | All rights reserved.
        </div>
      </div>
    </div>
  );
}
