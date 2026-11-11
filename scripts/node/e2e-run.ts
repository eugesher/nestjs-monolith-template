import { spawnSync } from 'child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface IJestReport {
  success: boolean;
  numPassedTests: number;
  numFailedTests: number;
  numTotalTests: number;
  snapshot: { matched: number; total: number };
}

interface ISuiteResult {
  suite: string;
  status: string;
  tests: string;
  failed: number;
  snapshots: string;
  seconds: number;
}

const SUITES = ['staff', 'customer', 'processor', 'system:staff', 'system:customer'];

const readReport = (outputFile: string): IJestReport | null =>
  existsSync(outputFile) ? (JSON.parse(readFileSync(outputFile, 'utf8')) as IJestReport) : null;

const runSuite = (suite: string, directory: string): ISuiteResult => {
  const outputFile = join(directory, `${suite.replace(':', '-')}.json`);
  const startedAt = Date.now();
  const run = spawnSync('yarn', [`test:e2e:${suite}`, '--json', `--outputFile=${outputFile}`], {
    stdio: 'inherit',
  });
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  const report = readReport(outputFile);

  if (!report) {
    return { suite, status: 'not run', tests: '-', failed: 0, snapshots: '-', seconds };
  }

  const passed = run.status === 0 && report.success;
  const { numPassedTests, numFailedTests, numTotalTests, snapshot } = report;

  return {
    suite,
    status: passed ? 'passed' : 'failed',
    tests: `${numPassedTests}/${numTotalTests}`,
    failed: numFailedTests,
    snapshots: `${snapshot.matched}/${snapshot.total}`,
    seconds,
  };
};

const formatTable = (rows: ISuiteResult[]): string => {
  const header = ['suite', 'status', 'tests', 'failed', 'snapshots', 'seconds'];
  const cells = rows.map((row) => [
    row.suite,
    row.status,
    row.tests,
    String(row.failed),
    row.snapshots,
    String(row.seconds),
  ]);
  const widths = header.map((title, column) =>
    Math.max(title.length, ...cells.map((cell) => cell[column].length)),
  );
  const line = (cell: string[]): string =>
    cell.map((value, column) => value.padEnd(widths[column])).join('  ');

  return [line(header), line(widths.map((width) => '-'.repeat(width))), ...cells.map(line)].join(
    '\n',
  );
};

const directory = mkdtempSync(join(tmpdir(), 'acme-e2e-'));
const results = SUITES.map((suite) => runSuite(suite, directory));

rmSync(directory, { recursive: true, force: true });

process.stdout.write(`\nE2E report\n${formatTable(results)}\n`);

process.exitCode = results.every((result) => result.status === 'passed') ? 0 : 1;
