import React, { useState, useEffect, useMemo, memo } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  height?: string; // Optional custom height, defaults to mobile-optimized
}

const PDFViewer = ({ pdfUrl, height }: PDFViewerProps) => {
  // Get language directly from localStorage to avoid context re-renders
  const language = useMemo(() => {
    const stored = localStorage.getItem('ekka-language-preference');
    return stored === 'en' ? 'en' : 'ar';
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic height calculation for better container fit
  const viewerHeight = useMemo(() => {
    if (height) return height;
    // Use available viewport height with some space for page elements
    return 'calc(100vh - 200px)';
  }, [height]);

  useEffect(() => {
    // Simulate loading for iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(language === 'ar' ? 'فشل في تحميل PDF' : 'Failed to load PDF');
  };

  return (
    <div className="pdf-viewer w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col" style={{ height: viewerHeight }}>
        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-4 border-[#C4A36F] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#222222] font-medium">
                  {language === 'ar' ? 'جاري تحميل PDF...' : 'Loading PDF...'}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-4">{error}</p>
                <div className="flex gap-4 justify-center">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {language === 'ar' ? 'فتح PDF في نافذة جديدة' : 'Open PDF in new window'}
                  </a>

                  <a
                    href={pdfUrl}
                    download
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>

        {/* Footer with PDF info */}
        {!isLoading && !error && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {language === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new window'}
                </a>

                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {language === 'ar' ? 'تحميل' : 'Download'}
                </a>
              </div>

              <div className="text-sm text-gray-500">
                {language === 'ar' ? 'PDF يتم عرضه باستخدام المشاهد الافتراضي للمتصفح' : 'PDF displayed using browser\'s default viewer'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PDFViewer);