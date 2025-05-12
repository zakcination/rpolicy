"use client"

import { useState, useEffect, useRef } from "react"
import * as pdfjsLib from "pdfjs-dist"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PDFThumbnailProps {
  pdfUrl: string
  width?: number
  height?: number
  className?: string
}

export default function PDFThumbnail({ pdfUrl, width = 150, height = 200, className = "" }: PDFThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let isMounted = true
    let pdfDocument: PDFDocumentProxy | null = null

    const generateThumbnail = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load the PDF document with authentication headers if needed
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: true,
        })

        pdfDocument = await loadingTask.promise

        // Get the first page
        const page = await pdfDocument.getPage(1)

        // Calculate scale to fit the canvas
        const viewport = page.getViewport({ scale: 1 })
        const scale = Math.min(width / viewport.width, height / viewport.height)
        const scaledViewport = page.getViewport({ scale })

        // Render to canvas
        if (canvasRef.current && isMounted) {
          const canvas = canvasRef.current
          const context = canvas.getContext("2d")
          canvas.width = scaledViewport.width
          canvas.height = scaledViewport.height

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: scaledViewport,
            }).promise

            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL("image/png")
            if (isMounted) {
              setThumbnail(dataUrl)
            }
          }
        }
      } catch (err) {
        console.error("Error generating PDF thumbnail:", err)
        if (isMounted) {
          setError("Failed to generate thumbnail")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (pdfUrl) {
      generateThumbnail()
    }

    return () => {
      isMounted = false
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error)
      }
    }
  }, [pdfUrl, width, height])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-secondary/20 ${className}`} style={{ width, height }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary/20 text-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-xs text-gray-500">Preview not available</div>
      </div>
    )
  }

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      {thumbnail && (
        <img
          src={thumbnail || "/placeholder.svg"}
          alt="PDF Preview"
          className={`object-contain ${className}`}
          style={{ maxWidth: width, maxHeight: height }}
        />
      )}
    </>
  )
}
