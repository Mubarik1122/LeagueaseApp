import { Download, AlertCircle } from 'lucide-react';

export default function StatisticsDownload() {
  const handleDownload = () => {
    // Implement download logic
    console.log('Downloading statistics...');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Statistics Download</h1>

      <div className="space-y-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Download a spreadsheet containing all statistics entered for the season
            </p>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Download size={20} />
          Download the file
        </button>
      </div>
    </div>
  );
}