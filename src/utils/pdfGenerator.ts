import { QuestionPaper } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Resolves a paper's filePath to a fully accessible URL for preview and download.
 * Handles:
 * 1. Full URLs (http:// or https://)
 * 2. Supabase Storage bucket paths ('pyq-papers' bucket)
 * 3. Relative clean file names in the Supabase Storage bucket
 */
export function resolvePdfUrl(filePath: string): string {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('blob:') ||
    filePath.startsWith('data:')
  ) {
    return filePath;
  }

  if (isSupabaseConfigured() && supabase) {
    const cleanPath = filePath
      .replace(/^\/?(papers|pyq-papers)\//, '')
      .replace(/^\//, '');

    const { data } = supabase.storage
      .from('pyq-papers')
      .getPublicUrl(cleanPath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  return filePath;
}

/**
 * Generates an authentic MJPRU University Question Paper document content
 */
export function generateQuestionPaperHtml(paper: QuestionPaper, pageNum = 1): string {
  const isSecondPage = pageNum === 2;
  const dept = paper.departmentName || 'Engineering & Technology';
  const subName = paper.subjectName || 'Engineering Subject';
  const subCode = paper.subjectCode || 'BT-401';
  const year = paper.examinationYear || 2024;
  const examType = paper.examinationType || 'Regular';
  const sem = paper.semesterNumber ? `Semester ${paper.semesterNumber}` : 'Odd Semester';

  if (isSecondPage) {
    return `
      <div class="p-8 max-w-3xl mx-auto font-serif text-slate-900 bg-white min-h-[900px] shadow-sm select-text">
        <div class="flex justify-between items-center border-b pb-2 mb-6 text-xs text-slate-500 uppercase tracking-wider font-mono">
          <span>${subCode}: ${subName}</span>
          <span>Page 2 of 2</span>
        </div>

        <div class="mb-6">
          <div class="font-bold text-sm tracking-wide uppercase mb-3 flex items-center justify-between border-b pb-1 font-sans">
            <span>SECTION – B (30 Marks)</span>
            <span class="text-xs font-normal text-slate-600">Attempt any TWO questions out of 4 (2 &times; 15 = 30 Marks)</span>
          </div>

          <div class="space-y-4 text-xs leading-relaxed text-slate-800">
            <div class="flex gap-3">
              <span class="font-bold min-w-[25px]">Q7.</span>
              <div class="flex-1">
                <p class="font-medium">With neat architectural diagrams, explain the operational stages and subsystems relevant to <strong>${subName}</strong>.</p>
                <p class="text-slate-600 mt-1 italic">Derive the comparative state complexity and analyze boundary condition performance.</p>
              </div>
              <span class="font-bold text-slate-500 min-w-[35px] text-right">[15]</span>
            </div>

            <div class="flex gap-3">
              <span class="font-bold min-w-[25px]">Q8.</span>
              <div class="flex-1">
                <p class="font-medium">Formulate the theoretical foundation for high-performance deployment in modern ${dept} applications.</p>
                <p class="text-slate-600 mt-1 italic">Evaluate trade-offs between throughput, latency, and fault tolerance with an illustrative numerical derivation.</p>
              </div>
              <span class="font-bold text-slate-500 min-w-[35px] text-right">[15]</span>
            </div>

            <div class="flex gap-3">
              <span class="font-bold min-w-[25px]">Q9.</span>
              <div class="flex-1">
                <p class="font-medium">Discuss the recent computational or experimental advancements in <strong>${subName}</strong>.</p>
                <p class="text-slate-600 mt-1 italic">Propose an optimal design workflow to mitigate thermal and operational degradation in continuous cycles.</p>
              </div>
              <span class="font-bold text-slate-500 min-w-[35px] text-right">[15]</span>
            </div>

            <div class="flex gap-3">
              <span class="font-bold min-w-[25px]">Q10.</span>
              <div class="flex-1">
                <p class="font-medium">Write comprehensive analytical notes on any TWO of the following core areas:</p>
                <ul class="list-disc list-inside mt-1 space-y-1 text-slate-700 ml-4">
                  <li>System stability criteria and frequency response compensation</li>
                  <li>Real-time deterministic scheduling and control architectures</li>
                  <li>Scalability protocols in modern engineering application testbeds</li>
                </ul>
              </div>
              <span class="font-bold text-slate-500 min-w-[35px] text-right">[15]</span>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-dashed border-slate-300 text-center text-xs text-slate-400 font-sans">
          --- END OF QUESTION PAPER ---
          <div class="text-[10px] text-slate-400 mt-1">Mahatma Jyotiba Phule Rohilkhand University, Bareilly • Academic Examination Paper</div>
        </div>
      </div>
    `;
  }

  // Page 1
  return `
    <div class="p-8 max-w-3xl mx-auto font-serif text-slate-900 bg-white min-h-[900px] shadow-sm select-text">
      <!-- Header -->
      <div class="text-center border-b-2 border-slate-900 pb-4 mb-4">
        <div class="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">Roll No: [ _ _ _ _ _ _ _ _ _ _ ]</div>
        <div class="text-sm font-sans font-bold text-slate-700 mt-1">Printed Pages: 02 &nbsp;|&nbsp; Paper ID: <span class="font-mono text-slate-900 font-bold">${subCode}-EX</span></div>
        <h1 class="text-lg md:text-xl font-bold uppercase tracking-wide mt-2 text-slate-900 font-serif">
          M.J.P. Rohilkhand University, Bareilly
        </h1>
        <h2 class="text-sm font-semibold uppercase text-slate-700 mt-0.5">
          B.Tech. Examination, ${year}
        </h2>
        <div class="text-xs font-medium text-slate-600">(${dept})</div>
        <div class="text-xs font-semibold text-slate-800 uppercase mt-1">
          ${sem} &bull; ${examType} Examination
        </div>
      </div>

      <!-- Subject & Metadata -->
      <div class="text-center mb-4">
        <h3 class="text-base font-bold text-slate-900 uppercase tracking-wide">
          ${subName}
        </h3>
        <div class="font-mono text-xs font-semibold text-slate-700">Course Code: ${subCode}</div>
      </div>

      <!-- Time & Marks -->
      <div class="flex justify-between items-center text-xs font-bold border-y border-slate-300 py-1.5 mb-4 font-sans">
        <span>Time: 3 Hours</span>
        <span class="font-mono text-[#0e0fed]">Total Marks: 60</span>
      </div>

      <!-- Instructions -->
      <div class="text-[11px] text-slate-600 italic mb-5 leading-normal bg-slate-50 p-2.5 rounded border border-slate-200 font-sans">
        <strong>Instructions for Candidates:</strong>
        <ol class="list-decimal list-inside space-y-0.5 mt-1">
          <li><strong>Section A:</strong> Attempt any <strong>THREE</strong> questions out of 6 (3 &times; 10 = 30 Marks).</li>
          <li><strong>Section B:</strong> Attempt any <strong>TWO</strong> questions out of 4 (2 &times; 15 = 30 Marks).</li>
          <li>Assume any missing standard empirical data suitably and specify it clearly.</li>
          <li>Use of scientific non-programmable calculators is permitted.</li>
        </ol>
      </div>

      <!-- Section A -->
      <div class="mb-5">
        <div class="font-bold text-xs tracking-wide uppercase mb-3 flex items-center justify-between border-b pb-1 font-sans">
          <span>SECTION – A (30 Marks)</span>
          <span class="text-[11px] font-normal text-slate-600">Attempt any THREE questions out of 6 (3 &times; 10 = 30 Marks)</span>
        </div>

        <div class="space-y-3.5 text-xs text-slate-800">
          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q1.</span>
            <div class="flex-1">
              <p class="font-medium">Define the fundamental operating principles and governing theoretical equations underlying <strong>${subName}</strong>.</p>
              <p class="text-slate-600 mt-1 italic">Illustrate with a comprehensive schematic block diagram.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>

          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q2.</span>
            <div class="flex-1">
              <p class="font-medium">State the primary distinction between steady-state and transient responses in this technical domain.</p>
              <p class="text-slate-600 mt-1 italic">Derive the mathematical transfer function governing the primary response curve.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>

          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q3.</span>
            <div class="flex-1">
              <p class="font-medium">What is the physical significance of damping ratio, natural frequency, and the characteristic polynomial?</p>
              <p class="text-slate-600 mt-1 italic">Solve for the peak overshoot and settling time for a standard step input.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>

          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q4.</span>
            <div class="flex-1">
              <p class="font-medium">Explain the Nyquist and Routh-Hurwitz stability criteria with their practical engineering limitations.</p>
              <p class="text-slate-600 mt-1 italic">Determine the range of parameter values for guaranteed marginal stability.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>

          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q5.</span>
            <div class="flex-1">
              <p class="font-medium">Discuss the role of closed-loop feedback mechanisms in minimizing environmental distortion and sensitivity.</p>
              <p class="text-slate-600 mt-1 italic">Calculate the maximum steady-state error coefficient under ramp excitation.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>

          <div class="flex gap-2">
            <span class="font-bold min-w-[25px]">Q6.</span>
            <div class="flex-1">
              <p class="font-medium">Differentiate between lumped-parameter and distributed-parameter modeling in <strong>${dept}</strong> systems.</p>
              <p class="text-slate-600 mt-1 italic">Provide two real-world case studies demonstrating performance optimization.</p>
            </div>
            <span class="font-mono text-slate-500 min-w-[30px] text-right">[10]</span>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-slate-400 font-sans">
        [ Section B continues on Page 2 &bull; Total Examination: 60 Marks ]
      </div>
    </div>
  `;
}

/**
 * Downloads the actual uploaded question paper PDF from Supabase Storage.
 * Initiates a real binary file download matching the uploaded file byte-for-byte.
 */
export async function downloadQuestionPaperPdf(paper: QuestionPaper): Promise<void> {
  const url = resolvePdfUrl(paper.filePath);
  const downloadFileName = paper.fileName || `MJPRU_${paper.subjectCode || 'Paper'}_${paper.examinationYear || 'Exam'}.pdf`;

  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:'))) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return;
      }
    } catch (err) {
      console.warn('Direct blob fetch failed, falling back to direct anchor download:', err);
    }

    // Direct browser anchor fallback
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback for relative paths
  const link = document.createElement('a');
  link.href = url || paper.filePath;
  link.download = downloadFileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
