import { useState } from 'react';
import { AlertCircle, Upload } from 'lucide-react';

export default function SpreadsheetUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Spreadsheet Upload</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Upload a spreadsheet to bulk import or update people in your league.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">Upload Spreadsheet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Download the template, fill it with your data, and upload it back.
            </p>
            
            <button className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-[#00ade5]">
                    Click to upload
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Excel or CSV files only
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <span className="text-sm text-gray-600">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}

          <button
            disabled={!selectedFile}
            className="w-full px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] disabled:bg-gray-300"
          >
            Upload and Process
          </button>
        </div>
      </div>
    </div>
  );
}