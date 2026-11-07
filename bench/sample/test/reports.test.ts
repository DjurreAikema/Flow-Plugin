import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Catalog } from "../src/catalog.ts";
import { FeeLedger } from "../src/fees.ts";
import { LoanService } from "../src/loans.ts";
import type { Loan } from "../src/loans.ts";
import { MemberRegistry } from "../src/members.ts";
import {
  FEES_COLUMNS,
  ReportError,
  feesReport,
  formatTable,
  loansPerMonth,
  memberSummary,
  overdueReport,
  popularBooks,
  renderFees,
  renderOverdue,
  renderStock,
  stockReport,
  summaryDate,
} from "../src/reports.ts";

interface World {
  catalog: Catalog;
  members: MemberRegistry;
  ledger: FeeLedger;
  service: LoanService;
}

function makeWorld(): World {
  const catalog = new Catalog();
  const members = new MemberRegistry();
  const ledger = new FeeLedger();
  catalog.addBook({ id: "b1", title: "Dune", author: "Frank Herbert", year: 1965 });
  catalog.addBook({ id: "b2", title: "Emma", author: "Jane Austen", year: 1815 });
  catalog.addBook({ id: "b3", title: "Ulysses", author: "James Joyce", year: 1922 });
  for (const bookId of ["b1", "b2", "b3"]) {
    catalog.addCopy(bookId, "2024-01-01");
    catalog.addCopy(bookId, "2024-01-01");
  }
  members.register({ id: "m1", name: "Carol", email: "carol@example.com", joined: "2024-01-01" });
  members.register({ id: "m2", name: "Alice", email: "alice@example.com", joined: "2024-01-01" });
  members.register({ id: "m3", name: "Bob", email: "bob@example.com", tier: "premium", joined: "2024-01-01" });
  return { catalog, members, ledger, service: new LoanService(catalog, members, ledger) };
}

describe("reports: formatTable", () => {
  it("makes a header, a rule and the rows with aligned columns", () => {
    const text = formatTable(
      [
        { name: "Alice", qty: 5 },
        { name: "Bartholomew", qty: 120 },
      ],
      [
        { key: "name", title: "Name", align: "left" },
        { key: "qty", title: "Qty", align: "right" },
      ],
    );
    assert.equal(
      text,
      ["Name         Qty", "-----------  ---", "Alice          5", "Bartholomew  120"].join("\n"),
    );
  });

  it("shows an empty text for a missing value and ends no line with a space", () => {
    const text = formatTable(
      [{ name: "Alice" }],
      [
        { key: "name", title: "Name", align: "left" },
        { key: "note", title: "Note", align: "left" },
      ],
    );
    for (const line of text.split("\n")) {
      assert.equal(line, line.trimEnd());
    }
    assert.equal(text.split("\n")[2], "Alice");
  });

  it("makes a column as wide as its title when the rows are short", () => {
    const text = formatTable([{ a: "x" }], [{ key: "a", title: "Heading", align: "left" }]);
    assert.equal(text.split("\n")[1], "-------");
  });

  it("prints only the header and the rule for no rows", () => {
    const text = formatTable([], FEES_COLUMNS);
    assert.equal(text.split("\n").length, 2);
  });

  it("refuses a table without columns", () => {
    assert.throws(() => formatTable([{ a: 1 }], []), ReportError);
  });
});

describe("reports: overdue", () => {
  it("lists only the overdue loans with the days late", () => {
    const { service, catalog, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m2", "b2", "2024-06-10");
    const rows = overdueReport(service.allLoans(), catalog, members, "2024-06-20");
    assert.deepEqual(rows, [{ title: "Dune", member: "Carol", due: "2024-06-17", daysLate: 3 }]);
  });

  it("sorts by days late, highest first", () => {
    const { service, catalog, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-10");
    service.checkout("m2", "b2", "2024-06-01");
    service.checkout("m3", "b3", "2024-05-01");
    const rows = overdueReport(service.allLoans(), catalog, members, "2024-07-01");
    assert.deepEqual(
      rows.map((row) => row.title),
      ["Ulysses", "Emma", "Dune"],
    );
    assert.ok((rows[0]?.daysLate ?? 0) > (rows[1]?.daysLate ?? 0));
  });

  it("sorts equal days late by title and then by member name", () => {
    const { service, catalog, members } = makeWorld();
    service.checkout("m1", "b2", "2024-06-03");
    service.checkout("m2", "b1", "2024-06-03");
    service.checkout("m1", "b1", "2024-06-03");
    const rows = overdueReport(service.allLoans(), catalog, members, "2024-07-01");
    assert.deepEqual(
      rows.map((row) => `${row.title}/${row.member}`),
      ["Dune/Alice", "Dune/Carol", "Emma/Carol"],
    );
  });

  it("leaves out returned and lost loans and loans due today", () => {
    const { service, catalog, members } = makeWorld();
    const returned = service.checkout("m1", "b1", "2024-06-03");
    const lost = service.checkout("m2", "b2", "2024-06-03");
    service.checkout("m3", "b3", "2024-06-03");
    service.returnCopy(returned.id, "2024-06-04");
    service.reportLost(lost.id, "2024-06-04");
    assert.equal(overdueReport(service.allLoans(), catalog, members, "2024-06-24").length, 0);
  });

  it("refuses a bad date", () => {
    const { service, catalog, members } = makeWorld();
    assert.throws(() => overdueReport(service.allLoans(), catalog, members, "2024-00-10"), ReportError);
  });

  it("renders as text with the column titles", () => {
    const { service, catalog, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    const text = renderOverdue(overdueReport(service.allLoans(), catalog, members, "2024-06-20"));
    const lines = text.split("\n");
    assert.equal(lines[0], "Title  Member  Due         Days late");
    assert.equal(lines[2], "Dune   Carol   2024-06-17          3");
  });
});

describe("reports: popular books", () => {
  function busyWorld(): World {
    const world = makeWorld();
    const { service } = world;
    const first = service.checkout("m1", "b2", "2024-05-01");
    service.returnCopy(first.id, "2024-05-02");
    service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m2", "b1", "2024-06-04");
    service.checkout("m2", "b2", "2024-06-05");
    service.checkout("m3", "b3", "2024-06-06");
    return world;
  }

  it("counts the loans per book, highest first", () => {
    const { service, catalog } = busyWorld();
    const rows = popularBooks(service.allLoans(), catalog, "2024-01-01", 10);
    assert.deepEqual(
      rows.map((row) => [row.title, row.loans]),
      [
        ["Dune", 2],
        ["Emma", 2],
        ["Ulysses", 1],
      ],
    );
  });

  it("sorts equal counts by title", () => {
    const { service, catalog } = busyWorld();
    const rows = popularBooks(service.allLoans(), catalog, "2024-01-01", 10);
    assert.deepEqual(
      rows.map((row) => row.title),
      ["Dune", "Emma", "Ulysses"],
    );
  });

  it("counts a loan that starts on the date and not one before it", () => {
    const { service, catalog } = busyWorld();
    const rows = popularBooks(service.allLoans(), catalog, "2024-06-03", 10);
    assert.equal(rows.find((row) => row.title === "Emma")?.loans, 1);
    assert.equal(rows.find((row) => row.title === "Dune")?.loans, 2);
    assert.equal(popularBooks(service.allLoans(), catalog, "2024-06-04", 10).find((row) => row.title === "Dune")?.loans, 1);
  });

  it("cuts the list at the limit", () => {
    const { service, catalog } = busyWorld();
    const rows = popularBooks(service.allLoans(), catalog, "2024-01-01", 2);
    assert.deepEqual(
      rows.map((row) => row.title),
      ["Dune", "Emma"],
    );
  });

  it("refuses a bad date or a bad limit", () => {
    const { service, catalog } = busyWorld();
    assert.throws(() => popularBooks(service.allLoans(), catalog, "bad", 3), /Invalid date/);
    assert.throws(() => popularBooks(service.allLoans(), catalog, "2024-01-01", 0), /positive whole number/);
    assert.throws(() => popularBooks(service.allLoans(), catalog, "2024-01-01", 1.5), /positive whole number/);
  });

  it("gives an empty list when no loan is recent enough", () => {
    const { service, catalog } = busyWorld();
    assert.deepEqual(popularBooks(service.allLoans(), catalog, "2025-01-01", 5), []);
  });
});

describe("reports: member summary", () => {
  it("lists the active loans, the overdue count and the balance", () => {
    const { service, ledger, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m1", "b2", "2024-06-10");
    ledger.charge("m1", 150, "late", "2024-06-01");
    const summary = memberSummary("m1", service.allLoans(), ledger, members, "2024-06-20");
    assert.equal(summary.name, "Carol");
    assert.equal(summary.activeLoans.length, 2);
    assert.equal(summary.overdueCount, 1);
    assert.equal(summary.balanceCents, 150);
  });

  it("does not count returned loans", () => {
    const { service, ledger, members } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-04");
    const summary = memberSummary("m1", service.allLoans(), ledger, members, "2024-07-01");
    assert.equal(summary.activeLoans.length, 0);
    assert.equal(summary.overdueCount, 0);
  });

  it("ignores the loans of other members", () => {
    const { service, ledger, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m2", "b2", "2024-06-03");
    const summary = memberSummary("m2", service.allLoans(), ledger, members, "2024-07-01");
    assert.equal(summary.activeLoans.length, 1);
    assert.equal(summary.overdueCount, 1);
  });

  it("judges overdue on the date that the caller passes", () => {
    const { service, ledger, members } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    assert.equal(memberSummary("m1", service.allLoans(), ledger, members, "2024-06-17").overdueCount, 0);
    assert.equal(memberSummary("m1", service.allLoans(), ledger, members, "2024-06-18").overdueCount, 1);
  });

  it("throws for an unknown member", () => {
    const { service, ledger, members } = makeWorld();
    assert.throws(() => memberSummary("zz", service.allLoans(), ledger, members, "2024-06-17"));
  });

  it("picks the latest start date for the summary date", () => {
    const loans = [
      { id: "L1", copyId: "c", bookId: "b", memberId: "m", start: "2024-06-03", due: "2024-06-17", renewals: 0 },
      { id: "L2", copyId: "c", bookId: "b", memberId: "m", start: "2024-06-09", due: "2024-06-23", renewals: 0 },
    ] satisfies Loan[];
    assert.equal(summaryDate(loans), "2024-06-09");
    assert.equal(summaryDate([]), undefined);
  });
});

describe("reports: fees", () => {
  it("lists the members with a balance, highest first", () => {
    const { ledger, members } = makeWorld();
    ledger.charge("m1", 200, "late", "2024-06-01");
    ledger.charge("m2", 300, "late", "2024-06-01");
    const rows = feesReport(ledger, members);
    assert.deepEqual(
      rows.map((row) => [row.name, row.balanceCents]),
      [
        ["Alice", 300],
        ["Carol", 200],
      ],
    );
  });

  it("sorts equal balances by name", () => {
    const { ledger, members } = makeWorld();
    ledger.charge("m1", 200, "late", "2024-06-01");
    ledger.charge("m2", 200, "late", "2024-06-01");
    ledger.charge("m3", 200, "late", "2024-06-01");
    assert.deepEqual(
      feesReport(ledger, members).map((row) => row.name),
      ["Alice", "Bob", "Carol"],
    );
  });

  it("leaves out members with a balance of 0 or below", () => {
    const { ledger, members } = makeWorld();
    const charge = ledger.charge("m1", 200, "late", "2024-06-01");
    ledger.charge("m2", 100, "late", "2024-06-01");
    ledger.pay("m2", 100, "2024-06-02");
    ledger.pay("m1", 200, "2024-06-02");
    ledger.waive(charge.id, "2024-06-03");
    assert.deepEqual(feesReport(ledger, members), []);
  });

  it("renders the balances as dollars", () => {
    const { ledger, members } = makeWorld();
    ledger.charge("m1", 1250, "late", "2024-06-01");
    ledger.charge("m2", 75, "late", "2024-06-01");
    const lines = renderFees(feesReport(ledger, members)).split("\n");
    assert.equal(lines[0], "Member  Balance");
    assert.equal(lines[2], "Carol    $12.50");
    assert.equal(lines[3], "Alice     $0.75");
  });
});

describe("reports: stock and months", () => {
  it("counts the available and the total copies per book, sorted by title", () => {
    const { service, catalog } = makeWorld();
    service.checkout("m1", "b2", "2024-06-03");
    const rows = stockReport(catalog);
    assert.deepEqual(
      rows.map((row) => [row.title, row.available, row.total]),
      [
        ["Dune", 2, 2],
        ["Emma", 1, 2],
        ["Ulysses", 2, 2],
      ],
    );
  });

  it("does not count a lost copy as available", () => {
    const { service, catalog } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.reportLost(loan.id, "2024-06-04");
    const row = stockReport(catalog)[0];
    assert.equal(row?.available, 1);
    assert.equal(row?.total, 2);
  });

  it("renders the stock as text", () => {
    const { catalog } = makeWorld();
    const lines = renderStock(stockReport(catalog)).split("\n");
    assert.equal(lines[0], "Title    Author         Available  Total");
    assert.equal(lines[2], "Dune     Frank Herbert          2      2");
  });

  it("counts the loans per month, sorted by month", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b1", "2024-07-01");
    service.checkout("m2", "b2", "2024-06-30");
    service.checkout("m3", "b3", "2024-06-01");
    service.checkout("m3", "b1", "2023-12-31");
    assert.deepEqual(loansPerMonth(service.allLoans()), [
      { month: "2023-12", loans: 1 },
      { month: "2024-06", loans: 2 },
      { month: "2024-07", loans: 1 },
    ]);
  });
});
