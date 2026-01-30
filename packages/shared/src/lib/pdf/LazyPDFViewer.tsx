import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@shared/lib/utils'
import { Card, CardContent } from '@shared/ui/components/card'

import { useLanguage } from '@/contexts/LanguageContext'

GlobalWorkerOptions.workerSrc = pdfWorker

interface LazyPDFViewerProps {
  pdfUrl: string
  className?: string
  height?: string
  variant?: 'default' | 'dialog'
  fileName?: string
}

const SPINNER_CLASS = 'h-10 w-10 border-4 border-[#E9B353]/35 border-t-[#E9B353] rounded-full animate-spin'

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
  pdfUrl,
  className,
  height = '70vh',
  variant = 'default',
  fileName,
}) => {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setErrored(false)
    setPdfBuffer(null)

    const controller = new AbortController()

    const fetchPdf = async () => {
      try {
        const response = await fetch(pdfUrl, {
          credentials: 'omit',
          cache: 'no-cache',
          mode: 'cors',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to load PDF')
        }

        const buffer = await response.arrayBuffer()
        if (!controller.signal.aborted) {
          setPdfBuffer(buffer)
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error('[LazyPDFViewer] Failed to fetch PDF preview', error)
        setErrored(true)
        setLoading(false)
      }
    }

    fetchPdf()

    return () => controller.abort()
  }, [pdfUrl])

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()

    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      return undefined
    }

    const observer = new ResizeObserver(() => {
      updateWidth()
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!pdfBuffer) {
      return undefined
    }

    let active = true
    let loadedPdf: PDFDocumentProxy | null = null

    const loadDoc = async () => {
      try {
        setLoading(true)
        setErrored(false)
        const loadingTask = getDocument({
          data: pdfBuffer,
          cMapPacked: true,
          disableAutoFetch: true,
        })

        loadedPdf = await loadingTask.promise
        if (!active) {
          loadedPdf.destroy()
          return
        }

        pdfDocRef.current = loadedPdf
        setPageCount(loadedPdf.numPages)
        setCurrentPage(1)
      } catch (error) {
        console.error('[LazyPDFViewer] Failed to load PDF document', error)
        setErrored(true)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDoc()

    return () => {
      active = false
      if (loadedPdf) {
        loadedPdf.destroy()
      }
      if (pdfDocRef.current === loadedPdf) {
        pdfDocRef.current = null
      }
    }
  }, [pdfBuffer])

  useEffect(() => {
    if (!pdfDocRef.current || pageCount === 0) {
      return undefined
    }

    let active = true

    const renderPage = async () => {
      setLoading(true)
      setErrored(false)

      try {
        const page = await pdfDocRef.current!.getPage(currentPage)
        const viewport = page.getViewport({ scale: 1 })
        const targetWidth = Math.max(280, containerWidth || viewport.width)
        const cssScale = targetWidth / viewport.width
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
        const renderScale = cssScale * dpr
        const renderViewport = page.getViewport({ scale: renderScale })

        const canvas = canvasRef.current
        if (!canvas) {
          throw new Error('Canvas is not mounted')
        }

        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Unable to access canvas context')
        }

        canvas.width = renderViewport.width
        canvas.height = renderViewport.height
        canvas.style.width = '100%'
        canvas.style.height = 'auto'

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.scale(dpr, dpr)
        context.clearRect(0, 0, canvas.width, canvas.height)

        await page.render({
          canvasContext: context,
          viewport: renderViewport,
        }).promise
      } catch (error) {
        if (!active) {
          return
        }
        console.error('[LazyPDFViewer] Failed to render PDF preview', error)
        setErrored(true)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    renderPage()

    return () => {
      active = false
    }
  }, [pageCount, containerWidth, currentPage])

  const errorTitle = t('pdf.viewer.failed') || 'Unable to load this PDF'
  const errorMessage =
    t('pdf.viewer.fallbackMessage') || 'Open the PDF in a new tab to view it.'

  const renderLoadingOverlay = () => (
    <div className="pdf-loading-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-gold-50/95 backdrop-blur-md z-10 pointer-events-none">
      <div className={SPINNER_CLASS} />
      <p className="text-sm text-muted-foreground">
        {t('loading.pdf.viewer') || 'Loading PDF viewer...'}
      </p>
    </div>
  )

const canNavigatePrev = currentPage > 1
const canNavigateNext = pageCount > currentPage

const handlePrev = () => {
  setCurrentPage((prev) => Math.max(1, prev - 1))
}

const handleNext = () => {
  setCurrentPage((prev) => Math.min(pageCount, prev + 1))
}

const renderCanvasArea = () => (
  <div
    ref={containerRef}
    className="relative w-full h-full overflow-hidden pdf-preview"
    style={{ minHeight: height }}
  >
    <canvas
      ref={canvasRef}
      aria-label={
        fileName
          ? `${fileName} preview`
          : t('pdf.viewer.preview') || 'PDF preview'
      }
      role="img"
      className="pdf-canvas block w-full h-auto rounded-lg bg-white shadow-sm"
    />
    {(canNavigatePrev || canNavigateNext) && (
      <div className="pdf-page-nav absolute inset-0 flex pointer-events-none">
        {canNavigatePrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="w-1/2 pointer-events-auto flex items-center justify-start px-6 text-white opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        {canNavigateNext && (
          <button
            type="button"
            onClick={handleNext}
            className="w-1/2 pointer-events-auto flex items-center justify-end px-6 text-white opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Next page"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>
    )}
    {loading && !errored && renderLoadingOverlay()}

    {pageCount > 0 && (
      <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none text-xs font-semibold uppercase tracking-widest text-white/90">
        {t('pdf.viewer.pageIndicator') || `Page ${currentPage} / ${pageCount}`}
      </div>
    )}
  </div>
)

  const renderErrorState = () => (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center gap-4 bg-red-50/50 border border-red-200 p-6',
        className
      )}
    >
      <p className="text-lg font-semibold text-red-800">{errorTitle}</p>
      <p className="text-sm text-red-600 text-center">{errorMessage}</p>
    </div>
  )

  if (errored) {
    if (variant === 'dialog') {
      return renderErrorState()
    }
    return (
      <Card className={cn('w-full border-red-200 bg-red-50/50', className)}>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <p className="text-lg font-semibold text-red-800">{errorTitle}</p>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'dialog') {
    return (
      <div
        className={cn('relative w-full h-full bg-brand-gold-50', className)}
        style={{ minHeight: height }}
      >
        {renderCanvasArea()}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'w-full overflow-hidden bg-white border border-[#E4D8C8]/70 shadow-sm',
        className
      )}
    >
      <CardContent className="p-0">
        <div
          className="relative w-full bg-brand-gold-50 overflow-hidden"
          style={{ minHeight: height }}
        >
          {renderCanvasArea()}
        </div>
      </CardContent>
    </Card>
  )
}
