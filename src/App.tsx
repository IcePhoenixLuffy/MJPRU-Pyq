/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MagneticCursor } from './components/common/MagneticCursor';
import { PdfViewerModal } from './components/common/PdfViewerModal';
import { HomePage } from './pages/HomePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { PyqLibraryPage } from './pages/PyqLibraryPage';
import { RecentlyUploadedPage } from './pages/RecentlyUploadedPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { dataStore } from './lib/dataStore';
import { Department, Subject, QuestionPaper, SystemStatistics } from './types';
import { downloadQuestionPaperPdf } from './utils/pdfGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [statistics, setStatistics] = useState<SystemStatistics>({
    totalDepartments: 0,
    totalSubjects: 0,
    totalQuestionPapers: 0,
    latestUploadsCount: 0,
  });

  // Selected filters passed to Library
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>('all');
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>('');

  // Active viewing paper for PDF Modal
  const [viewingPaper, setViewingPaper] = useState<QuestionPaper | null>(null);

  // Load state from dataStore
  const refreshData = async () => {
    const depts = await dataStore.getDepartments();
    const subs = await dataStore.getSubjects();
    const pyqs = await dataStore.getQuestionPapers();
    const stats = await dataStore.getStatistics();

    setDepartments(depts);
    setSubjects(subs);
    setPapers(pyqs);
    setStatistics(stats);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to jump to search in library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('library');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleSelectDepartmentFromHome = (deptId: string) => {
    setTargetDepartmentId(deptId);
    setActiveTab('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTab = (tab: string, query?: string) => {
    if (query !== undefined) {
      setTargetSearchQuery(query);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPaper = (paper: QuestionPaper) => {
    setViewingPaper(paper);
  };

  const handleDownloadPaper = (paper: QuestionPaper) => {
    dataStore.incrementDownloadCount(paper.id);
    downloadQuestionPaperPdf(paper);
    refreshData();
  };

  const handleAddDepartment = async (dept: Omit<Department, 'id' | 'createdAt' | 'slug'>) => {
    const res = await dataStore.addDepartment(dept);
    await refreshData();
    return res;
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<Department>) => {
    const res = await dataStore.updateDepartment(id, updates);
    await refreshData();
    return res;
  };

  const handleDeleteDepartment = async (id: string) => {
    const res = await dataStore.deleteDepartment(id);
    await refreshData();
    return res;
  };

  const handleAddSubject = async (sub: Omit<Subject, 'id' | 'createdAt'>) => {
    const res = await dataStore.addSubject(sub);
    await refreshData();
    return res;
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    const res = await dataStore.updateSubject(id, updates);
    await refreshData();
    return res;
  };

  const handleDeleteSubject = async (id: string) => {
    const res = await dataStore.deleteSubject(id);
    await refreshData();
    return res;
  };

  const handleAddPaper = async (paper: Omit<QuestionPaper, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const res = await dataStore.addQuestionPaper(paper);
    await refreshData();
    return res;
  };

  const handleUpdatePaper = async (id: string, updates: Partial<QuestionPaper>) => {
    const res = await dataStore.updateQuestionPaper(id, updates);
    await refreshData();
    return res;
  };

  const handleDeletePaper = async (id: string) => {
    const res = await dataStore.deleteQuestionPaper(id);
    await refreshData();
    return res;
  };

  const handleResetData = () => {
    dataStore.resetToSampleData();
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#8bf0ba] selection:text-slate-900">
      {/* Magnetic Cursor for Desktop (True magnetic element attraction, no dot or circle) */}
      <MagneticCursor />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigateTab(tab)}
        onOpenSearch={() => handleNavigateTab('library')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            departments={departments}
            recentPapers={papers}
            allPapers={papers}
            statistics={statistics}
            onSelectDepartment={handleSelectDepartmentFromHome}
            onViewPaper={handleViewPaper}
            onDownloadPaper={handleDownloadPaper}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsPage
            departments={departments}
            subjects={subjects}
            papers={papers}
            academicYears={dataStore.getAcademicYears()}
            semesters={dataStore.getSemesters()}
            onSelectDepartmentForLibrary={(deptId) => {
              setTargetDepartmentId(deptId);
              setActiveTab('library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewPaper={handleViewPaper}
          />
        )}

        {activeTab === 'library' && (
          <PyqLibraryPage
            departments={departments}
            academicYears={dataStore.getAcademicYears()}
            semesters={dataStore.getSemesters()}
            subjects={subjects}
            papers={papers}
            onViewPaper={handleViewPaper}
            onDownloadPaper={handleDownloadPaper}
            initialDepartmentId={targetDepartmentId}
            initialQuery={targetSearchQuery}
          />
        )}

        {activeTab === 'recent' && (
          <RecentlyUploadedPage
            papers={papers}
            departments={departments}
            onViewPaper={handleViewPaper}
            onDownloadPaper={handleDownloadPaper}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            onNavigateToUpload={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            departments={departments}
            subjects={subjects}
            papers={papers}
            academicYears={dataStore.getAcademicYears()}
            semesters={dataStore.getSemesters()}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddPaper={handleAddPaper}
            onUpdatePaper={handleUpdatePaper}
            onDeletePaper={handleDeletePaper}
            onResetData={handleResetData}
            onViewPaper={handleViewPaper}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => handleNavigateTab(tab)} />

      {/* PDF Document Viewer Modal */}
      <PdfViewerModal
        paper={viewingPaper}
        isOpen={Boolean(viewingPaper)}
        onClose={() => setViewingPaper(null)}
        onDownload={handleDownloadPaper}
      />
    </div>
  );
}
