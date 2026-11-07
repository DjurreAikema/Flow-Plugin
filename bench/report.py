#!/usr/bin/env python3
"""Print the report of the benchmark runs: one table per run, one per setup."""
import argparse
import glob
import json
import os
import statistics

from run import TOKEN_WEIGHTS

HERE = os.path.dirname(os.path.abspath(__file__))
SETUPS = ["lean", "flow-thin", "lean-raw", "flow"]
# The setup that each setup compares its tokens with: the plain setup of its feature.
BASELINE = {"lean": "lean", "flow-thin": "lean", "lean-raw": "lean-raw", "flow": "lean-raw"}
MIN_RUNS = 3


def load_runs(folder, feature):
    """Read the files named <run ID>.json with status done."""
    runs = []
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        stem = os.path.basename(path)[:-5]
        if stem.endswith(".dry-run"):
            continue
        try:
            with open(path, encoding="utf-8") as f:
                d = json.load(f)
        except (OSError, ValueError):
            continue
        if not isinstance(d, dict) or d.get("status") != "done" or d.get("run_id") != stem:
            continue
        if feature and d.get("feature") != feature:
            continue
        runs.append(d)
    return runs


def total(tokens):
    return sum(sum(v for v in u.values() if isinstance(v, (int, float))) for u in tokens.values())


def weighted(tokens):
    return round(sum(u.get(kind, 0) * w for u in tokens.values() for kind, w in TOKEN_WEIGHTS.items()))


def yes_no(value):
    return None if value is None else int(bool(value))


def short_model(name):
    for family in ("opus", "sonnet", "haiku"):
        if family in name:
            return family
    return name


def fmt_tokens(n):
    if n >= 1e6:
        return "%.1fM" % (n / 1e6)
    if n >= 1e3:
        return "%.1fk" % (n / 1e3)
    return str(int(n))


def figures(r):
    """The numeric figures of one run."""
    cost, q, w = r.get("cost") or {}, r.get("quality") or {}, r.get("workflow") or {}
    tokens = cost.get("tokens_by_model") or {}
    parts = w.get("parts")
    dev = (cost.get("developer") or {}).get("tokens_by_model")
    exports = q.get("extra_exports")
    return {
        "total tokens": total(tokens),
        "weighted tokens": cost.get("weighted_tokens", weighted(tokens)),
        "developer tokens": None if dev is None else total(dev),
        "output tokens": sum(u.get("output", 0) for u in tokens.values()),
        "turns": cost.get("turns"),
        "wall time (s)": cost.get("wall_seconds"),
        # Older result files have no cost.sessions. Count the IDs of the calls.
        "sessions": cost.get("sessions", len({c.get("session_id") for c in cost.get("calls") or []
                                               if c.get("session_id")}) or None),
        "hidden tests passed": q.get("hidden_passed"),
        "verify passed (1 = yes)": None if q.get("verify_passed") is None else int(bool(q["verify_passed"])),
        "files outside allowed": len(q.get("files_outside_allowed") or []),
        "traps caught": q.get("traps_caught"),
        "extra exports": None if exports is None else len(exports),
        "test rule followed (1 = yes)": yes_no(q.get("test_rule_followed")),
        "commits": w.get("commits"),
        "parts": parts,
        "last-line errors": w.get("last_line_violations"),
        "questions": w.get("questions"),
        "step builders": cost.get("step_builders"),
    }


def cell(v):
    return "-" if v is None else str(v)


def run_table(runs):
    head = ["Setup", "Run ID", "Tokens per model", "Weighted", "Developer", "Turns",
            "Wall time (s)", "Hidden tests", "Traps", "Extra exports", "Test rule", "Verify",
            "Files outside", "Commits", "Parts", "Last-line errors", "Questions", "Step builders"]
    rows = []
    for r in runs:
        f, q = figures(r), r.get("quality") or {}
        tokens = (r.get("cost") or {}).get("tokens_by_model") or {}
        per_model = ", ".join("%s %s" % (short_model(m), fmt_tokens(total({m: u})))
                              for m, u in sorted(tokens.items())) or "-"
        hidden = "-" if q.get("hidden_total") is None else "%s/%s" % (q.get("hidden_passed"), q["hidden_total"])
        verify = "-" if q.get("verify_passed") is None else ("pass" if q["verify_passed"] else "fail")
        traps = "-" if q.get("traps_total") is None else "%s of %s" % (q.get("traps_caught"), q["traps_total"])
        rule = "-" if q.get("test_rule_followed") is None else ("yes" if q["test_rule_followed"] else "no")
        dev = "-" if f["developer tokens"] is None else fmt_tokens(f["developer tokens"])
        rows.append([r.get("setup"), r.get("run_id"), per_model, fmt_tokens(f["weighted tokens"]), dev,
                     cell(f["turns"]), cell(f["wall time (s)"]), hidden, traps,
                     cell(f["extra exports"]), rule, verify, cell(f["files outside allowed"]),
                     cell(f["commits"]), cell(f["parts"]), cell(f["last-line errors"]),
                     cell(f["questions"]), cell(f["step builders"])])
    return table(head, rows)


def table(head, rows):
    out = ["| " + " | ".join(head) + " |", "|" + "|".join("---" for _ in head) + "|"]
    out += ["| " + " | ".join(str(c) for c in row) + " |" for row in rows]
    return "\n".join(out)


def num(x):
    return ("%d" % x) if float(x).is_integer() else ("%.1f" % x)


def spread(values):
    vals = [v for v in values if v is not None]
    if not vals:
        return "-"
    big = max(vals) >= 1e5
    f = fmt_tokens if big else num
    return "%s (%s to %s)" % (f(statistics.median(vals)), f(min(vals)), f(max(vals)))


def median(values):
    vals = [v for v in values if v is not None]
    return statistics.median(vals) if vals else None


def setup_table(by_setup):
    names = [s for s in SETUPS if s in by_setup] + sorted(s for s in by_setup if s not in SETUPS)
    figs = {s: [figures(r) for r in by_setup[s]] for s in names}
    traps_total = {s: max((r.get("quality") or {}).get("traps_total") or 0 for r in by_setup[s])
                   for s in names}
    rows = []
    for key in next(iter(figs.values()))[0].keys() if names else []:
        cells = []
        for s in names:
            c = spread([f[key] for f in figs[s]])
            if key == "traps caught" and traps_total[s] and c != "-":
                c = c.replace(" (", " of %d (" % traps_total[s], 1)
            cells.append(c)
        rows.append([key] + cells)
    # Each setup against the plain setup of its feature: lean for holds, lean-raw for closing.
    ratio = []
    for s in names:
        base = median([f["total tokens"] for f in figs.get(BASELINE.get(s, "lean"), [])])
        m = median([f["total tokens"] for f in figs[s]])
        ratio.append("n/a" if not base or m is None else "%.1fx" % (m / base))
    rows.insert(1, ["total tokens against lean"] + ratio)
    return table(["Figure"] + names, rows)


def main():
    p = argparse.ArgumentParser(description="Report of the benchmark runs.")
    p.add_argument("--feature", default=None, help="Only the runs of this feature, e.g. holds.")
    p.add_argument("--results", default=os.path.join(HERE, "results"), help="The results folder.")
    args = p.parse_args()

    runs = load_runs(args.results, args.feature)
    if not runs:
        print("No finished runs in %s." % args.results)
        return 0
    order = {s: i for i, s in enumerate(SETUPS)}
    runs.sort(key=lambda r: (order.get(r.get("setup"), 99), r.get("run_id")))
    by_setup = {}
    for r in runs:
        by_setup.setdefault(r.get("setup"), []).append(r)

    print("## Runs\n")
    print(run_table(runs))
    print("\n## Setups\n")
    print("Each cell is `median (minimum to maximum)`. The row \"total tokens against lean\" "
          "compares `flow-thin` with `lean`, and `lean-raw` and `flow` with `lean-raw`. "
          "\"total tokens\" leaves out the simulated developer.\n")
    print(setup_table(by_setup))
    short = [s for s in SETUPS if len(by_setup.get(s, [])) < MIN_RUNS]
    if short:
        print()
        for s in short:
            n = len(by_setup.get(s, []))
            print("%s: %d of %d finished runs." % (s, n, MIN_RUNS))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
