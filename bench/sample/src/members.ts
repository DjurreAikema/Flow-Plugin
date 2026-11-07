/**
 * Members of the library and the rules of each membership tier.
 */

import { isValidDate } from "./dates.ts";
import type { IsoDate } from "./dates.ts";

/** The error that the member registry throws for bad input or an unknown id. */
export class MemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberError";
  }
}

/** The membership tiers. */
export type Tier = "standard" | "premium";

/** Whether a member can borrow. A suspended member cannot. */
export type MemberStatus = "active" | "suspended";

/** The loan rules of each tier. The discount is a share of the late fee that is waived. */
export const TIER_RULES = {
  standard: { maxLoans: 5, loanDays: 14, maxRenewals: 2, feeDiscount: 0 },
  premium: { maxLoans: 10, loanDays: 21, maxRenewals: 3, feeDiscount: 0.5 },
} as const;

/** The loan rules of one tier. */
export type TierRules = (typeof TIER_RULES)[Tier];

/** A library member. */
export interface Member {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  joined: IsoDate;
  status: MemberStatus;
}

/** The input to register a member. The tier defaults to "standard". */
export interface MemberInput {
  id: string;
  name: string;
  email: string;
  tier?: Tier;
  joined: IsoDate;
}

/** The filters of a member list. Every filter is optional. */
export interface MemberFilter {
  tier?: Tier;
  status?: MemberStatus;
  nameContains?: string;
}

/** A record of one suspension. */
export interface SuspensionRecord {
  memberId: string;
  reason: string;
}

/** Check that a value is a tier name. */
export function isTier(value: unknown): value is Tier {
  return value === "standard" || value === "premium";
}

/**
 * Check an email address in a simple way: one "@", some text before it, and
 * a dot after it with text on both sides. This is a basic check, not a full RFC check.
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (/\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts as [string, string];
  if (local.length === 0 || domain.length === 0) return false;
  const dot = domain.indexOf(".");
  if (dot <= 0) return false;
  return domain.lastIndexOf(".") < domain.length - 1;
}

/** The registry of members. */
export class MemberRegistry {
  private readonly members = new Map<string, Member>();
  private readonly emails = new Map<string, string>();
  private readonly suspensions: SuspensionRecord[] = [];

  /**
   * Register a member. Throws MemberError for an empty id or name, for an
   * invalid email, for an invalid join date, for an unknown tier, and for a
   * duplicate id or email. The comparison of emails ignores case.
   * Returns a copy of the stored member.
   */
  register(input: MemberInput): Member {
    if (typeof input.id !== "string" || input.id.trim().length === 0) {
      throw new MemberError("A member needs a non-empty id");
    }
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      throw new MemberError("A member needs a non-empty name");
    }
    if (!isValidEmail(input.email)) {
      throw new MemberError(`Invalid email address: ${String(input.email)}`);
    }
    if (!isValidDate(input.joined)) {
      throw new MemberError(`Invalid join date: ${String(input.joined)}`);
    }
    const tier = input.tier ?? "standard";
    if (!isTier(tier)) {
      throw new MemberError(`Unknown tier: ${String(tier)}`);
    }
    if (this.members.has(input.id)) {
      throw new MemberError(`Duplicate member id: ${input.id}`);
    }
    const emailKey = input.email.toLowerCase();
    if (this.emails.has(emailKey)) {
      throw new MemberError(`Duplicate email address: ${input.email}`);
    }
    const member: Member = {
      id: input.id,
      name: input.name.trim(),
      email: input.email,
      tier,
      joined: input.joined,
      status: "active",
    };
    this.members.set(member.id, member);
    this.emails.set(emailKey, member.id);
    return { ...member };
  }

  /** Return a member by id. Throws MemberError when the member does not exist. */
  get(id: string): Member {
    return { ...this.require(id) };
  }

  /** Return true when a member with this id exists. */
  has(id: string): boolean {
    return this.members.has(id);
  }

  /** Return the members that match the filter, sorted by name and then by id. */
  list(filter: MemberFilter = {}): Member[] {
    const needle = filter.nameContains?.trim().toLowerCase();
    const result: Member[] = [];
    for (const member of this.members.values()) {
      if (filter.tier !== undefined && member.tier !== filter.tier) continue;
      if (filter.status !== undefined && member.status !== filter.status) continue;
      if (needle !== undefined && needle.length > 0 && !member.name.toLowerCase().includes(needle)) {
        continue;
      }
      result.push({ ...member });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  }

  /**
   * Suspend a member. A reason is required. Suspending a member that is
   * suspended already is allowed, and it records the new reason.
   */
  suspend(id: string, reason: string): Member {
    const member = this.require(id);
    if (typeof reason !== "string" || reason.trim().length === 0) {
      throw new MemberError("A suspension needs a reason");
    }
    member.status = "suspended";
    this.suspensions.push({ memberId: id, reason: reason.trim() });
    return { ...member };
  }

  /** Make a suspended member active again. An active member stays active. */
  reactivate(id: string): Member {
    const member = this.require(id);
    member.status = "active";
    return { ...member };
  }

  /** Change the tier of a member. Throws MemberError for an unknown tier. */
  changeTier(id: string, tier: Tier): Member {
    const member = this.require(id);
    if (!isTier(tier)) {
      throw new MemberError(`Unknown tier: ${String(tier)}`);
    }
    member.tier = tier;
    return { ...member };
  }

  /** Return the loan rules that apply to a member, based on the tier. */
  rulesFor(id: string): TierRules {
    return TIER_RULES[this.require(id).tier];
  }

  /** Return the reasons that were recorded for the suspensions of a member, oldest first. */
  suspensionReasons(id: string): string[] {
    this.require(id);
    return this.suspensions.filter((record) => record.memberId === id).map((record) => record.reason);
  }

  /** Return the number of members. */
  get size(): number {
    return this.members.size;
  }

  private require(id: string): Member {
    const member = this.members.get(id);
    if (member === undefined) {
      throw new MemberError(`Unknown member id: ${id}`);
    }
    return member;
  }
}
