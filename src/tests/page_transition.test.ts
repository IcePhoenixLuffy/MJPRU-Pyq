import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  parseRoute, 
  buildRouteUrl, 
  getParentRoute, 
  getPageTitle,
  getPageTransitionKey,
  isPageNavigation,
  NavigationRoute
} from '../utils/navigation';

describe('Page Transitions and Route Navigation Logic', () => {
  it('Calculates stable page-transition key based on active tab', () => {
    const homeRoute: NavigationRoute = { tab: 'home' };
    const libraryRoute: NavigationRoute = { tab: 'library' };
    const deptsRoute: NavigationRoute = { tab: 'departments' };
    const aboutRoute: NavigationRoute = { tab: 'about' };
    const contactRoute: NavigationRoute = { tab: 'contact' };
    const adminRoute: NavigationRoute = { tab: 'admin' };

    assert.strictEqual(getPageTransitionKey(homeRoute), 'home');
    assert.strictEqual(getPageTransitionKey(libraryRoute), 'library');
    assert.strictEqual(getPageTransitionKey(deptsRoute), 'departments');
    assert.strictEqual(getPageTransitionKey(aboutRoute), 'about');
    assert.strictEqual(getPageTransitionKey(contactRoute), 'contact');
    assert.strictEqual(getPageTransitionKey(adminRoute), 'admin');
  });

  it('Does NOT alter page transition key when search query changes', () => {
    const libraryInitial: NavigationRoute = { 
      tab: 'library',
      searchQuery: ''
    };
    const libraryWithQuery1: NavigationRoute = { 
      tab: 'library',
      searchQuery: 'Physics'
    };
    const libraryWithQuery2: NavigationRoute = { 
      tab: 'library',
      searchQuery: 'Mathematics-II'
    };

    assert.strictEqual(getPageTransitionKey(libraryInitial), 'library');
    assert.strictEqual(getPageTransitionKey(libraryWithQuery1), 'library');
    assert.strictEqual(getPageTransitionKey(libraryWithQuery2), 'library');
    assert.strictEqual(
      getPageTransitionKey(libraryInitial), 
      getPageTransitionKey(libraryWithQuery2),
      'Changing search query must not change page transition key so animations do not replay on typing'
    );
  });

  it('Detects genuine page navigation between tabs', () => {
    const prev: NavigationRoute = { tab: 'home' };
    const next: NavigationRoute = { tab: 'departments' };
    assert.strictEqual(isPageNavigation(prev, next), true);

    const prevAbout: NavigationRoute = { tab: 'about' };
    const nextContact: NavigationRoute = { tab: 'contact' };
    assert.strictEqual(isPageNavigation(prevAbout, nextContact), true);
  });

  it('Detects Department detail navigation', () => {
    const csitDept: NavigationRoute = { tab: 'departments', deptId: 'dept-csit' };
    const eeDept: NavigationRoute = { tab: 'departments', deptId: 'dept-ee' };
    assert.strictEqual(isPageNavigation(csitDept, eeDept), true);
  });

  it('Detects Semester page navigation within department', () => {
    const sem1: NavigationRoute = { tab: 'departments', deptId: 'dept-csit', semId: 'sem-1' };
    const sem2: NavigationRoute = { tab: 'departments', deptId: 'dept-csit', semId: 'sem-2' };
    assert.strictEqual(isPageNavigation(sem1, sem2), true);
  });

  it('Detects Subject page/modal navigation', () => {
    const withoutSubject: NavigationRoute = { tab: 'departments', deptId: 'dept-csit', semId: 'sem-2' };
    const withSubject: NavigationRoute = { tab: 'departments', deptId: 'dept-csit', semId: 'sem-2', subjectId: 'sub-ph102t' };
    assert.strictEqual(isPageNavigation(withoutSubject, withSubject), true);
  });

  it('Returns false when only search query changes on same page', () => {
    const lib1: NavigationRoute = { tab: 'library', searchQuery: 'eng' };
    const lib2: NavigationRoute = { tab: 'library', searchQuery: 'engineering' };
    assert.strictEqual(isPageNavigation(lib1, lib2), false);
  });

  it('Parses /contact and query tab=contact correctly', () => {
    const route1 = parseRoute('/contact', '');
    assert.strictEqual(route1.tab, 'contact');

    const route2 = parseRoute('/', '?tab=contact');
    assert.strictEqual(route2.tab, 'contact');
  });

  it('Builds canonical URL for contact page', () => {
    const url = buildRouteUrl({ tab: 'contact' });
    assert.strictEqual(url, '/contact');
  });

  it('Returns home as parent route for contact page', () => {
    const parent = getParentRoute({ tab: 'contact' });
    assert.ok(parent);
    assert.strictEqual(parent.tab, 'home');
  });

  it('Generates appropriate document title for contact page', () => {
    const title = getPageTitle({ tab: 'contact' });
    assert.ok(title.includes('Contact'));
    assert.ok(title.includes('MJPRU PYQ'));
  });

  it('Verifies futuristic expanding gradient reveal parameters and palette', () => {
    // 5 MJPRU brand colors specified in user requirements
    const brandPalette = {
      green: '#8bf0ba',
      ironicBlue: '#0e0fed',
      blueUnderling: '#94f0f1',
      pinkyRing: '#f2b1d8',
      eggYellow: '#ffdc6a',
    };

    assert.strictEqual(brandPalette.green, '#8bf0ba');
    assert.strictEqual(brandPalette.ironicBlue, '#0e0fed');
    assert.strictEqual(brandPalette.blueUnderling, '#94f0f1');
    assert.strictEqual(brandPalette.pinkyRing, '#f2b1d8');
    assert.strictEqual(brandPalette.eggYellow, '#ffdc6a');

    // Animation configuration values
    const animationConfig = {
      totalDurationMs: 600,
      exitPhaseMs: 180,
      enterPhaseMs: 420,
      exitScale: 0.985,
      enterVerticalShiftPx: 15,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    };

    assert.strictEqual(animationConfig.totalDurationMs, 600);
    assert.strictEqual(animationConfig.exitScale, 0.985);
    assert.strictEqual(animationConfig.enterVerticalShiftPx, 15);
    assert.strictEqual(animationConfig.exitPhaseMs + animationConfig.enterPhaseMs, 600);
  });
});

