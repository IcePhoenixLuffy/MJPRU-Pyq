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
import { 
  parseRoute, 
  buildRouteUrl, 
  getParentRoute, 
  resolvePaper, 
  getPageTitle, 
  NavigationRoute 
} from './utils/navigation';

export default function App() {
  // Current route parsed from URL
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>(() =>
    parseRoute(window.location.pathname, window.location.search)
  );

  const activeTab = currentRoute.tab;

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
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>(
    currentRoute.deptId || 'all'
  );
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>(
    currentRoute.searchQuery || ''
  );

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

  // Browser navigation engine: handle popstate (Back and Forward buttons)
  useEffect(() => {
    // Ensure initial entry has state tracking
    if (!window.history.state || !(window.history.state as any).isAppHistory) {
      const initial = parseRoute(window.location.pathname, window.location.search);
      window.history.replaceState({ isAppHistory: true, route: initial }, '', window.location.href);
    }

    const onPopState = () => {
      const poppedRoute = parseRoute(window.location.pathname, window.location.search);
      setCurrentRoute(poppedRoute);

      if (poppedRoute.deptId) {
        setTargetDepartmentId(poppedRoute.deptId);
      }
      if (poppedRoute.searchQuery !== undefined) {
        setTargetSearchQuery(poppedRoute.searchQuery);
      }

      // Close or open PDF modal in sync with URL
      if (!poppedRoute.paperId) {
        setViewingPaper(null);
      } else if (papers.length > 0) {
        const found = resolvePaper(poppedRoute.paperId, papers);
        if (found) setViewingPaper(found);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [papers]);

  // Synchronize viewingPaper when papers data is loaded from dataStore
  useEffect(() => {
    if (currentRoute.paperId && !viewingPaper && papers.length > 0) {
      const found = resolvePaper(currentRoute.paperId, papers);
      if (found) setViewingPaper(found);
    }
  }, [currentRoute.paperId, papers, viewingPaper]);

  // Document Title Synchronization
  useEffect(() => {
    const activeDeptObj = departments.find(
      (d) => d.id === currentRoute.deptId || d.code.toLowerCase() === currentRoute.deptId?.toLowerCase()
    );
    const activeSemObj = dataStore.getSemesters().find((s) => s.id === currentRoute.semId);
    const activeSubObj = subjects.find(
      (s) => s.id === currentRoute.subjectId || s.subjectCode.toLowerCase() === currentRoute.subjectId?.toLowerCase()
    );

    document.title = getPageTitle(currentRoute, {
      deptName: activeDeptObj?.name,
      deptCode: activeDeptObj?.code,
      semName: activeSemObj?.name,
      subName: activeSubObj?.subjectName,
      subCode: activeSubObj?.subjectCode,
      paperTitle: viewingPaper?.subjectName || activeSubObj?.subjectName,
    });
  }, [currentRoute, departments, subjects, viewingPaper]);

  // Programmatic navigation handler (creates history entries via pushState)
  const navigate = (
    next: Partial<NavigationRoute>,
    options?: { replace?: boolean; scroll?: boolean }
  ) => {
    setCurrentRoute((prev) => {
      const merged: NavigationRoute = {
        tab: next.tab || prev.tab || 'home',
        deptId: next.deptId !== undefined ? next.deptId : prev.deptId,
        yearId: next.yearId !== undefined ? next.yearId : prev.yearId,
        semId: next.semId !== undefined ? next.semId : prev.semId,
        subjectId: next.subjectId !== undefined ? next.subjectId : prev.subjectId,
        paperId: next.paperId !== undefined ? next.paperId : prev.paperId,
        searchQuery: next.searchQuery !== undefined ? next.searchQuery : prev.searchQuery,
        isModal: Boolean(next.paperId || next.subjectId),
      };

      // Reset nested drill-downs when switching tabs
      if (next.tab && next.tab !== prev.tab) {
        if (next.tab !== 'departments' && next.tab !== 'library') {
          merged.deptId = undefined;
          merged.yearId = undefined;
          merged.semId = undefined;
          merged.subjectId = undefined;
        }
        if (next.paperId === undefined) {
          merged.paperId = undefined;
        }
      }

      const newUrl = buildRouteUrl(merged);
      const currentUrl = window.location.pathname + window.location.search;
      const historyState = { isAppHistory: true, route: merged };

      if (options?.replace) {
        window.history.replaceState(historyState, '', newUrl);
      } else if (newUrl !== currentUrl) {
        window.history.pushState(historyState, '', newUrl);
      }

      if (merged.deptId) {
        setTargetDepartmentId(merged.deptId);
      }
      if (merged.searchQuery !== undefined) {
        setTargetSearchQuery(merged.searchQuery);
      }

      if (options?.scroll !== false && next.tab && next.tab !== prev.tab) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      return merged;
    });
  };

  // Back action helper: pops browser history or steps up to parent route
  const goBack = () => {
    if (window.history.state && (window.history.state as any).isAppHistory) {
      window.history.back();
    } else {
      const parent = getParentRoute(currentRoute);
      if (parent) {
        navigate(parent, { replace: true });
      } else {
        window.history.back();
      }
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to jump to search in library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate({ tab: 'library' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute]);

  // Handlers
  const handleSelectDepartmentFromHome = (deptId: string) => {
    navigate({
      tab: 'departments',
      deptId,
      yearId: 'all',
      semId: 'all',
      subjectId: undefined,
      paperId: undefined,
    });
  };

  const handleNavigateTab = (tab: string, query?: string) => {
    navigate({
      tab: tab as any,
      searchQuery: query,
      paperId: undefined,
      subjectId: undefined,
    });
  };

  const handleViewPaper = (paper: QuestionPaper) => {
    setViewingPaper(paper);
    navigate({
      paperId: paper.id,
    });
  };

  const handleClosePdfViewer = () => {
    if (currentRoute.paperId) {
      goBack();
    } else {
      setViewingPaper(null);
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-full-mesh text-slate-900 selection:bg-[#8bf0ba] selection:text-slate-900 relative">
      {/* Custom Magnetic Cursor (Replaces default Windows cursor, no dot/ring) */}
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
            currentDeptId={currentRoute.deptId || null}
            currentYearId={currentRoute.yearId || 'all'}
            currentSemesterId={currentRoute.semId || 'all'}
            currentSubjectId={currentRoute.subjectId || null}
            onDepartmentChange={(deptId) => {
              navigate({
                tab: 'departments',
                deptId,
                yearId: 'all',
                semId: 'all',
                subjectId: undefined,
                paperId: undefined,
              });
            }}
            onYearChange={(yearId) => {
              navigate({
                tab: 'departments',
                deptId: currentRoute.deptId,
                yearId,
                semId: 'all',
                subjectId: undefined,
                paperId: undefined,
              });
            }}
            onSemesterChange={(semId) => {
              navigate({
                tab: 'departments',
                deptId: currentRoute.deptId,
                yearId: currentRoute.yearId || 'all',
                semId,
                subjectId: undefined,
                paperId: undefined,
              });
            }}
            onOpenSubject={(subject) => {
              navigate({
                tab: 'departments',
                deptId: subject.departmentId || currentRoute.deptId,
                yearId: subject.academicYearId || currentRoute.yearId || 'all',
                semId: subject.semesterId || currentRoute.semId,
                subjectId: subject.id,
                paperId: undefined,
              });
            }}
            onCloseSubject={() => {
              if (currentRoute.subjectId) {
                goBack();
              }
            }}
            onSelectDepartmentForLibrary={(deptId) => {
              navigate({
                tab: 'library',
                deptId,
                yearId: 'all',
                semId: 'all',
                subjectId: undefined,
                paperId: undefined,
              });
            }}
            onViewPaper={handleViewPaper}
            onDownloadPaper={handleDownloadPaper}
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
              navigate({ tab: 'admin' });
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
        onClose={handleClosePdfViewer}
        onDownload={handleDownloadPaper}
      />
    </div>
  );
}
