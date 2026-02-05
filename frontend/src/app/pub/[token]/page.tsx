"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Clock } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function ViewerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [presentation, setPresentation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  const [pdf, setPdf] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load PDF.js from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      fetchPresentation();
    };
    script.onerror = () => setError("Falha ao carregar motor de PDF.");
    document.head.appendChild(script);

    // Fullscreen listener
    const handleFSChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      if (!isFS) setShowControls(true);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Controls Auto-hide logic
  useEffect(() => {
    if (!isFullscreen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isFullscreen]);

  // Tracking Heartbeat (Every 5 seconds)
  useEffect(() => {
    if (isLoading || error || !token) return;

    const heartbeat = setInterval(() => {
      const duration = Date.now() - pageStartTime;
      trackEvent('STAY', { slideIndex: currentPage, duration });
    }, 5000);

    return () => clearInterval(heartbeat);
  }, [currentPage, pageStartTime, isLoading, error]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handlePageChange(currentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        handlePageChange(currentPage - 1);
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isFullscreen]);

  const fetchPresentation = async () => {
    try {
      const res = await fetch(`https://api-a9-tracker.f7g8uz.easypanel.host/api/stats/${token}`);
      const data = await res.json();
      if (data.presentation) {
        setPresentation(data.presentation);
        loadPdf(data.presentation.pdfUrl);
      } else {
        setError("Apresentação não encontrada.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
      setIsLoading(false);
    }
  };

  const loadPdf = async (url: string) => {
    try {
      let finalUrl = url;

      // If it's a Google Slides link, route through our proxy
      if (url.includes('docs.google.com/presentation')) {
        finalUrl = `https://api-a9-tracker.f7g8uz.easypanel.host/api/proxy-pdf?url=${encodeURIComponent(url)}`;
      }

      const loadingTask = window.pdfjsLib.getDocument(finalUrl);
      loadingTaskRef.current = loadingTask;
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setIsLoading(false);

      // Initial Open Tracking
      trackEvent('OPEN', { userAgent: navigator.userAgent });
    } catch (err) {
      console.error("PDF Load Error:", err);
      setError("Não foi possível carregar o arquivo. Verifique se o link é público e está correto.");
      setIsLoading(false);
    }
  };

  // 2. Render Page to Canvas
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdf.getPage(currentPage);
      // Scale dynamic based on fullscreen
      const scale = isFullscreen ? (window.innerHeight / page.getViewport({ scale: 1 }).height) : 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdf, currentPage, isFullscreen]);

  const trackEvent = (type: string, extra = {}) => {
    fetch('https://api-a9-tracker.f7g8uz.easypanel.host/api/track/' + type.toLowerCase(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...extra })
    }).catch(err => console.error("Tracking Error:", err));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Send final STAY event for current page before switching
    const duration = Date.now() - pageStartTime;
    trackEvent('STAY', { slideIndex: currentPage, duration });

    setCurrentPage(newPage);
    setPageStartTime(Date.now());

    // Check for Completion
    if (newPage === totalPages) {
      trackEvent('COMPLETE');
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-brand-gray animate-pulse font-medium tracking-widest uppercase text-xs">Acessando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20 rotate-12">
          <ShieldCheck className="text-red-500" size={40} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Acesso Interrompido</h2>
        <p className="text-brand-gray mb-8 max-w-md mx-auto">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-brand-neon transition-all">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`min-h-screen bg-brand-black flex flex-col items-center justify-center relative overflow-hidden ${isFullscreen ? 'p-0 cursor-none' : 'p-4'}`} style={{ cursor: isFullscreen && !showControls ? 'none' : 'default' }}>
      {/* Background Decor - Only show if NOT fullscreen */}
      {!isFullscreen && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-neon/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Header Info - Hide if fullscreen */}
      {!isFullscreen && (
        <div className="z-10 w-full max-w-5xl mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white">{presentation?.title}</h1>
            {/* <p className="text-brand-gray text-xs uppercase tracking-widest font-bold mt-1">
              Visualização Segura • {presentation?.clientId ? 'Link Exclusivo' : 'Preview'}
            </p> */}
          </div>
          <div className="flex items-center gap-4 bg-brand-darkgray/50 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-white font-bold text-sm">Página {currentPage} / {totalPages}</span>
          </div>
        </div>
      )}

      {/* Viewer Frame */}
      <div className={`z-10 w-full group relative flex items-center justify-center ${isFullscreen ? 'h-screen w-screen' : 'max-w-5xl'}`}>
        <div className={`bg-brand-darkgray overflow-hidden relative flex items-center justify-center ${isFullscreen ? 'h-full w-full rounded-0' : 'rounded-3xl shadow-2xl border border-white/5 aspect-[14/9]'}`}>
          <canvas
            ref={canvasRef}
            className={`${isFullscreen ? 'h-full w-auto' : 'max-w-full max-h-full'} object-contain shadow-2xl`}
          />

          {/* Navigation Overlay (Mobile Friendly) */}
          <div className={`absolute inset-y-0 left-0 w-20 flex items-center justify-start pl-4 transition-opacity duration-500 ${showControls ? 'opacity-100 group-hover:opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-brand-neon hover:text-black transition-all disabled:opacity-0"
            >
              <ChevronLeft />
            </button>
          </div>
          <div className={`absolute inset-y-0 right-0 w-20 flex items-center justify-end pr-4 transition-opacity duration-500 ${showControls ? 'opacity-100 group-hover:opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-brand-neon hover:text-black transition-all disabled:opacity-0"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Floating Controls Bar */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-brand-darkgray/80 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-glow transition-all duration-500 ${isFullscreen ? (showControls ? 'bottom-8 opacity-100' : 'bottom-0 opacity-0 pointer-events-none') : '-bottom-16'}`}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="px-6 py-2 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3">
            <span className="text-white font-black text-lg">{currentPage}</span>
            <div className="w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-neon transition-all duration-500 shadow-[0_0_10px_#1AFF00]"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
            <span className="text-brand-gray font-bold">{totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-3 rounded-xl hover:bg-white/10 transition-all ml-2 border-l border-white/10 ${isFullscreen ? 'text-brand-neon' : 'text-white'}`}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Footer Branding - Adjusted with A9 Logo */}
      {!isFullscreen && (
        <div className="mt-24 z-10 flex flex-col items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <a
            href="https://a9p.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://framerusercontent.com/images/PzCl0ZZKL1UcqxhMTTRf2szX0XU.svg?width=222&height=64"
              alt="A9 Logo"
              className="h-6 w-auto"
            />
            <div className="w-[1px] h-4 bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
              A9 Educação
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
