import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Catalog,
  CatalogError,
  MIN_BOOK_YEAR,
  allTags,
  isCopyStatus,
  stockOverview,
  unavailableBooks,
} from "../src/catalog.ts";
import { currentYear } from "../src/dates.ts";

function makeCatalog(): Catalog {
  const catalog = new Catalog();
  catalog.addBook({ id: "b1", title: "Dune", author: "Frank Herbert", year: 1965, tags: ["SciFi", "classic"] });
  catalog.addBook({ id: "b2", title: "Emma", author: "Jane Austen", year: 1815, tags: ["classic"] });
  catalog.addBook({ id: "b3", title: "Neuromancer", author: "William Gibson", year: 1984, tags: ["scifi"] });
  return catalog;
}

describe("catalog: adding books", () => {
  it("stores a book and trims the text fields", () => {
    const catalog = new Catalog();
    const book = catalog.addBook({ id: "b1", title: "  Dune ", author: " Frank Herbert ", year: 1965 });
    assert.equal(book.title, "Dune");
    assert.equal(book.author, "Frank Herbert");
    assert.deepEqual(book.tags, []);
    assert.equal(catalog.bookCount, 1);
  });

  it("normalizes tags to lower case and removes duplicates and empty tags", () => {
    const catalog = new Catalog();
    const book = catalog.addBook({
      id: "b1",
      title: "Dune",
      author: "Frank Herbert",
      year: 1965,
      tags: [" SciFi", "scifi", "", "  ", "Classic"],
    });
    assert.deepEqual(book.tags, ["scifi", "classic"]);
  });

  it("refuses an empty id, title or author", () => {
    const catalog = new Catalog();
    assert.throws(() => catalog.addBook({ id: " ", title: "T", author: "A", year: 2000 }), CatalogError);
    assert.throws(() => catalog.addBook({ id: "x", title: "", author: "A", year: 2000 }), CatalogError);
    assert.throws(() => catalog.addBook({ id: "x", title: "T", author: "  ", year: 2000 }), CatalogError);
  });

  it("refuses a duplicate id", () => {
    const catalog = makeCatalog();
    assert.throws(
      () => catalog.addBook({ id: "b1", title: "Other", author: "Someone", year: 2000 }),
      /Duplicate book id/,
    );
  });

  it("accepts the first year of printing and the current year", () => {
    const catalog = new Catalog();
    catalog.addBook({ id: "old", title: "Old", author: "A", year: MIN_BOOK_YEAR });
    catalog.addBook({ id: "new", title: "New", author: "A", year: currentYear() });
    assert.equal(catalog.bookCount, 2);
  });

  it("refuses a year before 1450 and a year in the future", () => {
    const catalog = new Catalog();
    assert.throws(() => catalog.addBook({ id: "a", title: "T", author: "A", year: MIN_BOOK_YEAR - 1 }), CatalogError);
    assert.throws(() => catalog.addBook({ id: "b", title: "T", author: "A", year: currentYear() + 1 }), CatalogError);
  });

  it("refuses a year that is not a whole number", () => {
    const catalog = new Catalog();
    assert.throws(() => catalog.addBook({ id: "a", title: "T", author: "A", year: 1999.5 }), CatalogError);
    assert.throws(() => catalog.addBook({ id: "b", title: "T", author: "A", year: Number.NaN }), CatalogError);
  });

  it("returns copies, so that a caller cannot change the stored book", () => {
    const catalog = makeCatalog();
    const book = catalog.getBook("b1");
    book.tags.push("hacked");
    book.title = "Changed";
    assert.deepEqual(catalog.getBook("b1").tags, ["scifi", "classic"]);
    assert.equal(catalog.getBook("b1").title, "Dune");
  });
});

describe("catalog: reading books", () => {
  it("throws for an unknown book id", () => {
    assert.throws(() => makeCatalog().getBook("nope"), /Unknown book id/);
  });

  it("answers hasBook", () => {
    const catalog = makeCatalog();
    assert.equal(catalog.hasBook("b1"), true);
    assert.equal(catalog.hasBook("zz"), false);
  });

  it("lists books by title, ignoring case, then by id", () => {
    const catalog = new Catalog();
    catalog.addBook({ id: "z", title: "alpha", author: "A", year: 2000 });
    catalog.addBook({ id: "y", title: "Beta", author: "A", year: 2000 });
    catalog.addBook({ id: "b", title: "Alpha", author: "A", year: 2000 });
    assert.deepEqual(
      catalog.listBooks().map((book) => book.id),
      ["b", "z", "y"],
    );
  });
});

describe("catalog: copies", () => {
  it("numbers copy ids per book", () => {
    const catalog = makeCatalog();
    assert.equal(catalog.addCopy("b1", "2024-01-01").id, "b1-c1");
    assert.equal(catalog.addCopy("b1", "2024-01-02").id, "b1-c2");
    assert.equal(catalog.addCopy("b2", "2024-01-03").id, "b2-c1");
  });

  it("starts a copy as available", () => {
    const catalog = makeCatalog();
    assert.equal(catalog.addCopy("b1", "2024-01-01").status, "available");
  });

  it("refuses a copy for an unknown book or with a bad date", () => {
    const catalog = makeCatalog();
    assert.throws(() => catalog.addCopy("nope", "2024-01-01"), /Unknown book id/);
    assert.throws(() => catalog.addCopy("b1", "2024-02-30"), /Invalid acquisition date/);
    assert.throws(() => catalog.addCopy("b1", "yesterday"), CatalogError);
  });

  it("keeps the numbering after a copy is removed", () => {
    const catalog = makeCatalog();
    const first = catalog.addCopy("b1", "2024-01-01");
    catalog.addCopy("b1", "2024-01-02");
    catalog.removeCopy(first.id);
    assert.equal(catalog.addCopy("b1", "2024-01-03").id, "b1-c3");
  });

  it("gets a copy and throws for an unknown copy", () => {
    const catalog = makeCatalog();
    const copy = catalog.addCopy("b1", "2024-01-01");
    assert.equal(catalog.getCopy(copy.id).bookId, "b1");
    assert.throws(() => catalog.getCopy("b1-c9"), /Unknown copy id/);
  });

  it("lists the copies of a book and counts them", () => {
    const catalog = makeCatalog();
    catalog.addCopy("b1", "2024-01-01");
    catalog.addCopy("b1", "2024-01-02");
    catalog.addCopy("b2", "2024-01-02");
    assert.equal(catalog.copiesOf("b1").length, 2);
    assert.equal(catalog.countCopies("b2"), 1);
    assert.equal(catalog.countCopies("b3"), 0);
    assert.throws(() => catalog.copiesOf("nope"), CatalogError);
  });

  it("lists only the available copies", () => {
    const catalog = makeCatalog();
    const first = catalog.addCopy("b1", "2024-01-01");
    catalog.addCopy("b1", "2024-01-02");
    catalog.setCopyStatus(first.id, "repair");
    assert.deepEqual(
      catalog.availableCopies("b1").map((copy) => copy.id),
      ["b1-c2"],
    );
  });

  it("changes the status of a copy and refuses an unknown status", () => {
    const catalog = makeCatalog();
    const copy = catalog.addCopy("b1", "2024-01-01");
    assert.equal(catalog.setCopyStatus(copy.id, "lost").status, "lost");
    assert.throws(() => catalog.setCopyStatus(copy.id, "stolen" as never), /Invalid copy status/);
    assert.throws(() => catalog.setCopyStatus("b1-c9", "lost"), /Unknown copy id/);
  });

  it("recognizes the copy statuses", () => {
    assert.equal(isCopyStatus("repair"), true);
    assert.equal(isCopyStatus("on-loan"), true);
    assert.equal(isCopyStatus("gone"), false);
    assert.equal(isCopyStatus(3), false);
  });

  it("removes only an available copy", () => {
    const catalog = makeCatalog();
    const copy = catalog.addCopy("b1", "2024-01-01");
    catalog.setCopyStatus(copy.id, "on-loan");
    assert.throws(() => catalog.removeCopy(copy.id), /Only an available copy/);
    catalog.setCopyStatus(copy.id, "available");
    catalog.removeCopy(copy.id);
    assert.equal(catalog.countCopies("b1"), 0);
    assert.throws(() => catalog.removeCopy(copy.id), /Unknown copy id/);
  });

  it("counts the copies per status", () => {
    const catalog = makeCatalog();
    const a = catalog.addCopy("b1", "2024-01-01");
    const b = catalog.addCopy("b1", "2024-01-01");
    catalog.addCopy("b1", "2024-01-01");
    catalog.setCopyStatus(a.id, "on-loan");
    catalog.setCopyStatus(b.id, "lost");
    assert.deepEqual(catalog.statusCounts("b1"), { available: 1, "on-loan": 1, lost: 1, repair: 0 });
  });
});

describe("catalog: search", () => {
  it("returns every book for an empty query, sorted by title", () => {
    assert.deepEqual(
      makeCatalog().search().map((book) => book.id),
      ["b1", "b2", "b3"],
    );
  });

  it("matches text in the title or the author, ignoring case", () => {
    const catalog = makeCatalog();
    assert.deepEqual(catalog.search({ text: "DUNE" }).map((book) => book.id), ["b1"]);
    assert.deepEqual(catalog.search({ text: "austen" }).map((book) => book.id), ["b2"]);
    assert.deepEqual(catalog.search({ text: "zzz" }), []);
  });

  it("filters by author", () => {
    assert.deepEqual(makeCatalog().search({ author: "gibson" }).map((book) => book.id), ["b3"]);
  });

  it("filters by tag, ignoring case and spaces", () => {
    const catalog = makeCatalog();
    assert.deepEqual(catalog.search({ tag: " SciFi " }).map((book) => book.id), ["b1", "b3"]);
    assert.deepEqual(catalog.search({ tag: "classic" }).map((book) => book.id), ["b1", "b2"]);
  });

  it("filters by year with both ends included", () => {
    const catalog = makeCatalog();
    assert.deepEqual(catalog.search({ yearFrom: 1965, yearTo: 1984 }).map((book) => book.id), ["b1", "b3"]);
    assert.deepEqual(catalog.search({ yearTo: 1815 }).map((book) => book.id), ["b2"]);
    assert.deepEqual(catalog.search({ yearFrom: 1985 }), []);
  });

  it("combines filters with and", () => {
    const catalog = makeCatalog();
    assert.deepEqual(catalog.search({ tag: "classic", yearFrom: 1900 }).map((book) => book.id), ["b1"]);
  });

  it("refuses a bad year range", () => {
    const catalog = makeCatalog();
    assert.throws(() => catalog.search({ yearFrom: 2000, yearTo: 1990 }), /is after/);
    assert.throws(() => catalog.search({ yearFrom: 1990.5 }), /whole number/);
    assert.throws(() => catalog.search({ yearTo: Number.NaN }), /whole number/);
  });

  it("treats an empty text filter as no filter", () => {
    assert.equal(makeCatalog().search({ text: "  " }).length, 3);
  });
});

describe("catalog: stock helpers", () => {
  it("builds the stock overview with a total per book", () => {
    const catalog = makeCatalog();
    const copy = catalog.addCopy("b1", "2024-01-01");
    catalog.addCopy("b1", "2024-01-01");
    catalog.setCopyStatus(copy.id, "repair");
    const lines = stockOverview(catalog);
    assert.equal(lines.length, 3);
    assert.equal(lines[0]?.book.id, "b1");
    assert.equal(lines[0]?.total, 2);
    assert.equal(lines[0]?.counts.repair, 1);
    assert.equal(lines[1]?.total, 0);
  });

  it("lists the books without an available copy", () => {
    const catalog = makeCatalog();
    catalog.addCopy("b1", "2024-01-01");
    const lent = catalog.addCopy("b2", "2024-01-01");
    catalog.setCopyStatus(lent.id, "on-loan");
    assert.deepEqual(
      unavailableBooks(catalog).map((book) => book.id),
      ["b2", "b3"],
    );
  });

  it("lists every tag once, sorted", () => {
    assert.deepEqual(allTags(makeCatalog()), ["classic", "scifi"]);
  });
});
