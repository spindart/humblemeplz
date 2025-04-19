import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onUpload: (analysis: string, file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const [uploadingFile, setUploadingFile] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadingFile(true);
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.analysis) {
          onUpload(data.analysis, file);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploadingFile(false);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploadingFile || isLoading
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}
          ${(uploadingFile || isLoading) ? 'pointer-events-none opacity-75' : ''}`}
      >
        <input {...getInputProps()} />
        {(uploadingFile || isLoading) ? (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">
              {uploadingFile ? 'Preparing devastating comments...' : 'Analyzing your resume...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your CV here and get ready for reality' : 'Drag your CV here and get ready for reality'}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to select a PDF file</p>
              <p>🚨 Spoiler: it's going to hurt.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 