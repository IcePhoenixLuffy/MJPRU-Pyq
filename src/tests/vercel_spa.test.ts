import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { parseRoute, buildRouteUrl, getParentRoute } from '../utils/navigation';

describe('Vercel SPA Deployment & Rewrite Configuration', () => {
  const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');

  it('vercel.json exists in root directory', () => {
    assert.strictEqual(fs.existsSync(vercelConfigPath), true, 'vercel.json must exist in the root directory');
  });

  it('vercel.json is valid JSON and contains required SPA rewrite to /index.html', () => {
    const raw = fs.readFileSync(vercelConfigPath, 'utf-8');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      assert.fail(`vercel.json is not valid JSON: ${err}`);
    }

    assert.ok(Array.isArray(parsed.rewrites), 'vercel.json must have a "rewrites" array');
    const spaRewrite = parsed.rewrites.find(
      (r: any) => (r.source === '/(.*)' || r.source === '/:match*') && r.destination === '/index.html'
    );
    assert.ok(
      spaRewrite,
      'vercel.json must include a rewrite rule matching all routes (/(.*)) to /index.html'
    );
  });

  it('Validates client-side router parses all direct nested URLs and refreshes without errors', () => {
    // 1. Homepage direct load / refresh
    const home = parseRoute('/', '');
    assert.strictEqual(home.tab, 'home');

    // 2. Departments page direct load / refresh
    const depts = parseRoute('/departments', '');
    assert.strictEqual(depts.tab, 'departments');
    assert.strictEqual(depts.deptId, undefined);

    // 3. Department detail page direct load / refresh
    const deptDetail = parseRoute('/departments', '?dept=dept-csit');
    assert.strictEqual(deptDetail.tab, 'departments');
    assert.strictEqual(deptDetail.deptId, 'dept-csit');

    // 4. Semester & Subject page direct load / refresh
    const subjectDeepLink = parseRoute(
      '/departments',
      '?dept=dept-csit&year=year-1&sem=sem-2&subject=sub-csit-sem2-4'
    );
    assert.strictEqual(subjectDeepLink.tab, 'departments');
    assert.strictEqual(subjectDeepLink.deptId, 'dept-csit');
    assert.strictEqual(subjectDeepLink.yearId, 'year-1');
    assert.strictEqual(subjectDeepLink.semId, 'sem-2');
    assert.strictEqual(subjectDeepLink.subjectId, 'sub-csit-sem2-4');
    assert.strictEqual(subjectDeepLink.isModal, true);

    // 5. Question paper direct deep link / refresh
    const paperDeepLink = parseRoute(
      '/departments',
      '?dept=dept-csit&sem=sem-2&paper=paper-csit-2026'
    );
    assert.strictEqual(paperDeepLink.tab, 'departments');
    assert.strictEqual(paperDeepLink.paperId, 'paper-csit-2026');

    // 6. Library search deep link
    const librarySearch = parseRoute('/library', '?dept=dept-csit&q=Physics');
    assert.strictEqual(librarySearch.tab, 'library');
    assert.strictEqual(librarySearch.deptId, 'dept-csit');
    assert.strictEqual(librarySearch.searchQuery, 'Physics');

    // 7. Recent uploads, About, and Admin routes
    assert.strictEqual(parseRoute('/recent', '').tab, 'recent');
    assert.strictEqual(parseRoute('/about', '').tab, 'about');
    assert.strictEqual(parseRoute('/admin', '').tab, 'admin');
  });

  it('Verifies backward navigation targets from refreshed nested URLs', () => {
    // From direct refreshed paper -> back to department/semester
    const paperRoute = parseRoute('/departments', '?dept=dept-csit&sem=sem-2&paper=paper-1');
    const parentOfPaper = getParentRoute(paperRoute);
    assert.ok(parentOfPaper);
    assert.strictEqual(parentOfPaper.paperId, undefined);
    assert.strictEqual(parentOfPaper.tab, 'departments');

    // From direct refreshed subject modal -> back to year/semester
    const subjectRoute = parseRoute('/departments', '?dept=dept-csit&year=yr-1&sem=sem-2&subject=sub-1');
    const parentOfSub = getParentRoute(subjectRoute);
    assert.ok(parentOfSub);
    assert.strictEqual(parentOfSub.subjectId, undefined);
    assert.strictEqual(parentOfSub.isModal, false);

    // From year/sem view -> back to department list
    const semRoute = parseRoute('/departments', '?dept=dept-csit&year=yr-1&sem=sem-2');
    const parentOfSem = getParentRoute(semRoute);
    assert.ok(parentOfSem);
    assert.strictEqual(parentOfSem.yearId, 'all');
    assert.strictEqual(parentOfSem.semId, 'all');

    // From department list -> back to home
    const deptRoute = parseRoute('/departments', '?dept=dept-csit');
    const parentOfDept = getParentRoute(deptRoute);
    assert.ok(parentOfDept);
    assert.strictEqual(parentOfDept.tab, 'home');

    // From home -> null (allows external history navigation)
    assert.strictEqual(getParentRoute({ tab: 'home' }), null);
  });
});
