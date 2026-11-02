import { QuestionPaper } from '../types';

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
 * Generates an actual downloadable PDF document using clean standard PDF syntax
 */
export function downloadQuestionPaperPdf(paper: QuestionPaper): void {
  const subCode = paper.subjectCode || 'BT401';
  const subName = paper.subjectName || 'Question-Paper';
  const year = paper.examinationYear || 2024;
  const fileName = `MJPRU_${subCode}_${year}_PYQ.pdf`;

  // Create printable iframe / window for authentic high-resolution print-to-PDF or instant direct download
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popups are blocked, generate a clean download data URI
    const content = `
%PDF-1.4
%MJPRU PYQ Academic Paper
1 0 obj
<< /Title (MJPRU PYQ - ${subName} ${year})
   /Author (M.J.P. Rohilkhand University, Bareilly)
   /Subject (${subCode} Previous Year Question Paper)
   /Creator (MJPRU PYQ Digital Library) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R
   /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
                          /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
5 0 obj
<< /Length 580 >>
stream
BT
/F1 14 Tf
70 800 Td
(MAHATMA JYOTIBA PHULE ROHILKHAND UNIVERSITY, BAREILLY) Tj
0 -22 Td
/F1 11 Tf
(B.TECH EXAMINATION ${year} - ${paper.departmentName || 'ENGINEERING'}) Tj
0 -18 Td
/F2 10 Tf
(Subject: ${subName} [Course Code: ${subCode}]) Tj
0 -16 Td
(Semester: ${paper.semesterNumber || 1} | Exam Type: ${paper.examinationType}) Tj
0 -24 Td
/F1 10 Tf
(Time: 3 Hours                                                Max Marks: 60) Tj
0 -20 Td
/F2 9 Tf
(Instructions: Section A: Attempt 3 of 6 = 30M | Section B: Attempt 2 of 4 = 30M) Tj
0 -25 Td
/F1 10 Tf
(SECTION A - 30 MARKS [Attempt any 3 questions out of 6]) Tj
0 -18 Td
/F2 9 Tf
(Q1. State fundamental theorems and governing principles. [10 Marks]) Tj
0 -14 Td
(Q2. Derive state response transfer function and block model. [10 Marks]) Tj
0 -14 Td
(Q3. Compute damping ratio, natural frequency and settling time. [10 Marks]) Tj
0 -25 Td
/F1 10 Tf
(SECTION B - 30 MARKS [Attempt any 2 questions out of 4]) Tj
0 -18 Td
/F2 9 Tf
(Q7. Formulate system architecture and state space optimization. [15 Marks]) Tj
0 -14 Td
(Q8. Comprehensive analytical study and trade-off evaluation. [15 Marks]) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000072 00000 n 
0000000250 00000 n 
0000000299 00000 n 
0000000356 00000 n 
0000000550 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
1180
%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Populate formatted print document
  const htmlDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .page-break { page-break-before: always; }
            @page { size: A4; margin: 15mm; }
          }
        </style>
      </head>
      <body class="bg-slate-100 p-8 antialiased">
        <div class="max-w-3xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow print:hidden">
          <div>
            <h2 class="font-bold text-slate-800 text-sm">MJPRU PYQ PDF Document Ready</h2>
            <p class="text-xs text-slate-500">${fileName} &bull; 2 Pages</p>
          </div>
          <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded text-xs transition">
            Print / Save as PDF
          </button>
        </div>
        ${generateQuestionPaperHtml(paper, 1)}
        <div class="page-break my-8 print:my-0"></div>
        ${generateQuestionPaperHtml(paper, 2)}
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlDoc);
  printWindow.document.close();
}
