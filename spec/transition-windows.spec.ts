interface ITransitionWindow {
  id: string;
  what: string;
  condition: string;
  owner: string;
  reviewBy: string;
  reference: string;
}

const OPEN_WINDOWS: ITransitionWindow[] = [];

describe('transition windows', () => {
  it('no open window is past its reviewBy date', () => {
    const today = new Date();
    const overdue = OPEN_WINDOWS.filter((w) => new Date(w.reviewBy) <= today);

    expect(
      overdue.map(
        (w) =>
          `\n  [${w.id}] (${w.reference}, owner: ${w.owner}) came due on ${w.reviewBy}.` +
          `\n    OWED:      ${w.what}` +
          `\n    CONDITION: ${w.condition}`,
      ),
    ).toEqual([]);
  });

  it('every window names an owner that is not a group', () => {
    for (const w of OPEN_WINDOWS) {
      expect(w.owner.trim().length).toBeGreaterThan(0);
      expect(w.owner.toLowerCase()).not.toBe('the team');
    }
  });

  it('every window has a parseable ISO reviewBy date', () => {
    for (const w of OPEN_WINDOWS) {
      expect(w.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(w.reviewBy).getTime())).toBe(false);
    }
  });

  it('ids are unique, so a failure names one thing', () => {
    const ids = OPEN_WINDOWS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
