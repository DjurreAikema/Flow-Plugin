/**
 * The catalog: books and the physical copies of each book.
 *
 * A book is a title. A copy is one physical item of that title that a member
 * can borrow. The catalog keeps everything in memory.
 */

import { currentYear, isValidDate } from "./dates.ts";
import type { IsoDate } from "./dates.ts";

/** The error that the catalog throws for bad input or an unknown id. */
export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogError";
  }
}

/** The first year in which a book can have been printed. */
export const MIN_BOOK_YEAR = 1450;

/** A title in the catalog. */
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
}

/** The states that a copy can have. */
export type CopyStatus = "available" | "on-loan" | "lost" | "repair";

/** The list of valid copy states, for input checks. */
export const COPY_STATUSES = ["available", "on-loan", "lost", "repair"] as const;

/** One physical copy of a book. A copy id has the form "<bookId>-c<n>". */
export interface Copy {
  id: string;
  bookId: string;
  status: CopyStatus;
  acquired: IsoDate;
}

/** The input to add a book. */
export interface BookInput {
  id: string;
  title: string;
  author: string;
  year: number;
  tags?: string[];
}

/** The filters of a catalog search. Every filter is optional. */
export interface SearchQuery {
  text?: string;
  author?: string;
  tag?: string;
  yearFrom?: number;
  yearTo?: number;
}

/** Trim a tag or a search word and fold it to lower case. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Check that a value is a non-empty string after trimming. */
function isFilled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Check that a status text is one of the four copy states. */
export function isCopyStatus(value: unknown): value is CopyStatus {
  return typeof value === "string" && (COPY_STATUSES as readonly string[]).includes(value);
}

/** The catalog of books and copies. */
export class Catalog {
  private readonly books = new Map<string, Book>();
  private readonly copies = new Map<string, Copy>();
  private readonly copyCounters = new Map<string, number>();

  /**
   * Add a book. Throws CatalogError for an empty id, title or author, for a year
   * outside the range from 1450 to the current year, or for a duplicate id.
   * Returns a copy of the stored book.
   */
  addBook(input: BookInput): Book {
    if (!isFilled(input.id)) {
      throw new CatalogError("A book needs a non-empty id");
    }
    if (!isFilled(input.title)) {
      throw new CatalogError("A book needs a non-empty title");
    }
    if (!isFilled(input.author)) {
      throw new CatalogError("A book needs a non-empty author");
    }
    const maxYear = currentYear();
    if (!Number.isInteger(input.year) || input.year < MIN_BOOK_YEAR || input.year > maxYear) {
      throw new CatalogError(
        `The year of a book must be a whole number from ${MIN_BOOK_YEAR} to ${maxYear}: ${input.year}`,
      );
    }
    if (this.books.has(input.id)) {
      throw new CatalogError(`Duplicate book id: ${input.id}`);
    }
    const tags = [...new Set((input.tags ?? []).map(normalize).filter((tag) => tag.length > 0))];
    const book: Book = {
      id: input.id,
      title: input.title.trim(),
      author: input.author.trim(),
      year: input.year,
      tags,
    };
    this.books.set(book.id, book);
    this.copyCounters.set(book.id, 0);
    return cloneBook(book);
  }

  /** Return a book by id. Throws CatalogError when the book does not exist. */
  getBook(id: string): Book {
    const book = this.books.get(id);
    if (book === undefined) {
      throw new CatalogError(`Unknown book id: ${id}`);
    }
    return cloneBook(book);
  }

  /** Return true when a book with this id exists. */
  hasBook(id: string): boolean {
    return this.books.has(id);
  }

  /** Return every book, sorted by title and then by id. */
  listBooks(): Book[] {
    return [...this.books.values()].sort(compareBooks).map(cloneBook);
  }

  /**
   * Add a copy of a book. The copy starts as available. The id of the copy is
   * "<bookId>-c<n>", where n starts at 1 and grows by one for each new copy of
   * that book. A removed copy does not free its number.
   */
  addCopy(bookId: string, acquired: IsoDate): Copy {
    if (!this.books.has(bookId)) {
      throw new CatalogError(`Unknown book id: ${bookId}`);
    }
    if (!isValidDate(acquired)) {
      throw new CatalogError(`Invalid acquisition date: ${String(acquired)}`);
    }
    const next = (this.copyCounters.get(bookId) ?? 0) + 1;
    this.copyCounters.set(bookId, next);
    const copy: Copy = {
      id: `${bookId}-c${next}`,
      bookId,
      status: "available",
      acquired,
    };
    this.copies.set(copy.id, copy);
    return { ...copy };
  }

  /** Return a copy by id. Throws CatalogError when the copy does not exist. */
  getCopy(id: string): Copy {
    const copy = this.copies.get(id);
    if (copy === undefined) {
      throw new CatalogError(`Unknown copy id: ${id}`);
    }
    return { ...copy };
  }

  /** Return every copy of a book, in the order in which they were added. */
  copiesOf(bookId: string): Copy[] {
    if (!this.books.has(bookId)) {
      throw new CatalogError(`Unknown book id: ${bookId}`);
    }
    return [...this.copies.values()].filter((copy) => copy.bookId === bookId).map((copy) => ({ ...copy }));
  }

  /** Return the copies of a book that a member can borrow now. */
  availableCopies(bookId: string): Copy[] {
    return this.copiesOf(bookId).filter((copy) => copy.status === "available");
  }

  /** Count the copies of a book, whatever their status. */
  countCopies(bookId: string): number {
    return this.copiesOf(bookId).length;
  }

  /**
   * Change the status of a copy and return the updated copy.
   * Throws CatalogError for an unknown copy or for an invalid status.
   */
  setCopyStatus(copyId: string, status: CopyStatus): Copy {
    const copy = this.copies.get(copyId);
    if (copy === undefined) {
      throw new CatalogError(`Unknown copy id: ${copyId}`);
    }
    if (!isCopyStatus(status)) {
      throw new CatalogError(`Invalid copy status: ${String(status)}`);
    }
    copy.status = status;
    return { ...copy };
  }

  /**
   * Remove a copy from the catalog. Only an available copy can go.
   * Throws CatalogError for an unknown copy or for a copy in another state.
   */
  removeCopy(copyId: string): void {
    const copy = this.copies.get(copyId);
    if (copy === undefined) {
      throw new CatalogError(`Unknown copy id: ${copyId}`);
    }
    if (copy.status !== "available") {
      throw new CatalogError(`Only an available copy can be removed: ${copyId} is ${copy.status}`);
    }
    this.copies.delete(copyId);
  }

  /**
   * Search the books. Every filter that is present must match.
   * - text: matches the title or the author, without case.
   * - author: matches the author, without case.
   * - tag: the book has this tag, without case.
   * - yearFrom and yearTo: an inclusive range of years.
   * The result is sorted by title, then by id.
   */
  search(query: SearchQuery = {}): Book[] {
    if (query.yearFrom !== undefined && !Number.isInteger(query.yearFrom)) {
      throw new CatalogError(`yearFrom must be a whole number: ${query.yearFrom}`);
    }
    if (query.yearTo !== undefined && !Number.isInteger(query.yearTo)) {
      throw new CatalogError(`yearTo must be a whole number: ${query.yearTo}`);
    }
    if (
      query.yearFrom !== undefined &&
      query.yearTo !== undefined &&
      query.yearFrom > query.yearTo
    ) {
      throw new CatalogError(`yearFrom (${query.yearFrom}) is after yearTo (${query.yearTo})`);
    }
    const text = query.text === undefined ? undefined : normalize(query.text);
    const author = query.author === undefined ? undefined : normalize(query.author);
    const tag = query.tag === undefined ? undefined : normalize(query.tag);
    const result: Book[] = [];
    for (const book of this.books.values()) {
      if (text !== undefined && text.length > 0) {
        const inTitle = book.title.toLowerCase().includes(text);
        const inAuthor = book.author.toLowerCase().includes(text);
        if (!inTitle && !inAuthor) continue;
      }
      if (author !== undefined && author.length > 0) {
        if (!book.author.toLowerCase().includes(author)) continue;
      }
      if (tag !== undefined && tag.length > 0) {
        if (!book.tags.includes(tag)) continue;
      }
      if (query.yearFrom !== undefined && book.year < query.yearFrom) continue;
      if (query.yearTo !== undefined && book.year > query.yearTo) continue;
      result.push(book);
    }
    return result.sort(compareBooks).map(cloneBook);
  }

  /** Return the number of books in the catalog. */
  get bookCount(): number {
    return this.books.size;
  }

  /** Return the copy counts per status for one book. */
  statusCounts(bookId: string): Record<CopyStatus, number> {
    const counts: Record<CopyStatus, number> = {
      available: 0,
      "on-loan": 0,
      lost: 0,
      repair: 0,
    };
    for (const copy of this.copiesOf(bookId)) {
      counts[copy.status] += 1;
    }
    return counts;
  }
}

/** Compare two books by title without case, then by id. */
function compareBooks(a: Book, b: Book): number {
  const byTitle = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  if (byTitle !== 0) return byTitle;
  return a.id.localeCompare(b.id);
}

/** Make a deep enough copy of a book, so that a caller cannot change the catalog. */
function cloneBook(book: Book): Book {
  return { ...book, tags: [...book.tags] };
}

/** A line of the stock overview: a book and the state of its copies. */
export interface StockLine {
  book: Book;
  counts: Record<CopyStatus, number>;
  total: number;
}

/**
 * Build a stock overview of the whole catalog, sorted by title. Use it to see
 * how many copies of each book are available, on loan, lost or in repair.
 */
export function stockOverview(catalog: Catalog): StockLine[] {
  return catalog.listBooks().map((book) => {
    const counts = catalog.statusCounts(book.id);
    const total = counts.available + counts["on-loan"] + counts.lost + counts.repair;
    return { book, counts, total };
  });
}

/** List the books that have no available copy now, sorted by title. */
export function unavailableBooks(catalog: Catalog): Book[] {
  return catalog.listBooks().filter((book) => catalog.availableCopies(book.id).length === 0);
}

/** List every tag that the catalog uses, sorted, without duplicates. */
export function allTags(catalog: Catalog): string[] {
  const tags = new Set<string>();
  for (const book of catalog.listBooks()) {
    for (const tag of book.tags) tags.add(tag);
  }
  return [...tags].sort();
}
