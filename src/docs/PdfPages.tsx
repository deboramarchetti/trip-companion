import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Draws every page of a PDF as images inside the app (pdf.js). Phones can't be
 * trusted to show a PDF in a frame: Android Chrome shows nothing and iPhone
 * Safari only the first page. Runs offline (pdf.js is precached with the app).
 */
export function PdfPages({ blob, onError }: { blob: Blob; onError: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number>();

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const { default: PdfWorker } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker');
        if (!pdfjs.GlobalWorkerOptions.workerPort) pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();
        const task = pdfjs.getDocument({
          data: new Uint8Array(await blob.arrayBuffer()),
          isEvalSupported: false,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
        });
        destroy = () => { task.destroy(); };
        const pdf = await task.promise;
        if (cancelled || !box.current) return;
        setPages(pdf.numPages);
        const width = box.current.clientWidth || 360;
        const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
        for (let n = 1; n <= pdf.numPages && !cancelled; n++) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = 'mb-2 block w-full rounded-lg bg-white';
          canvas.setAttribute('aria-label', `Página ${n} de ${pdf.numPages}`);
          canvas.setAttribute('role', 'img');
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
          if (!cancelled) box.current?.append(canvas);
        }
      } catch {
        if (!cancelled) onError();
      }
    })();
    return () => { cancelled = true; destroy?.(); };
  }, [blob, onError]);

  return (
    <div ref={box} className="mx-auto w-full max-w-2xl">
      {pages === undefined && (
        <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-white/70"><Loader2 size={16} className="animate-spin" /> Abrindo documento…</div>
      )}
    </div>
  );
}
