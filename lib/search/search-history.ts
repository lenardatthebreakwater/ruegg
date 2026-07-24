"use client";

import { canTrackStatistics } from "@/lib/analytics/can-track-analytics";
import { pushConsentGatedGtmEvent } from "@/lib/analytics/push-consent-gated-gtm-event";
import { normalizeSearchQuery } from "@/lib/search/product-search";

export type SearchBiEventType =
  | "search_opened"
  | "search_submitted"
  | "search_result_clicked"
  | "search_suggestion_clicked";

type SearchHistoryRecord = {
  query: string;
  normalizedQuery: string;
  count: number;
  lastSearchedAt: string;
  sessions: string[];
};

type SearchBiEvent = {
  eventType: SearchBiEventType;
  query?: string;
  resultCount?: number;
  productSlug?: string;
  source?: "quick-search" | "full-search" | "suggestion" | "archive-search";
};

type SearchBiEventPayload = SearchBiEvent & {
  timestamp: string;
  visitorId: string;
  sessionId: string;
};

const SEARCH_HISTORY_KEY = "pb.search.history.v1";
const SEARCH_BI_EVENTS_KEY = "pb.search.bi-events.v1";
const SEARCH_VISITOR_ID_KEY = "pb.search.visitor-id.v1";
const SEARCH_SESSION_ID_KEY = "pb.search.session-id.v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readRecords(): SearchHistoryRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SearchHistoryRecord[]) : [];
  } catch {
    return [];
  }
}

function writeRecords(records: SearchHistoryRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(records));
}

export function getOrCreateVisitorId(): string {
  if (!canUseStorage()) return "server";
  const existing = window.localStorage.getItem(SEARCH_VISITOR_ID_KEY);
  if (existing) return existing;

  const nextId = `visitor-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
  window.localStorage.setItem(SEARCH_VISITOR_ID_KEY, nextId);
  return nextId;
}

export function getOrCreateSessionId(): string {
  if (!canUseStorage()) return "server";
  const existing = window.sessionStorage.getItem(SEARCH_SESSION_ID_KEY);
  if (existing) return existing;

  const nextId = `session-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
  window.sessionStorage.setItem(SEARCH_SESSION_ID_KEY, nextId);
  return nextId;
}

export function recordSearchQuery(query: string) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return;

  const sessionId = getOrCreateSessionId();
  const now = new Date().toISOString();
  const records = readRecords();
  const existing = records.find((record) => record.normalizedQuery === normalizedQuery);

  if (existing) {
    existing.count += 1;
    existing.lastSearchedAt = now;
    existing.query = query.trim();
    if (!existing.sessions.includes(sessionId)) {
      existing.sessions.push(sessionId);
    }
  } else {
    records.push({
      query: query.trim(),
      normalizedQuery,
      count: 1,
      lastSearchedAt: now,
      sessions: [sessionId],
    });
  }

  records.sort(
    (a, b) =>
      new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime()
  );
  writeRecords(records.slice(0, 200));
}

export function getRecentSearches(limit = 8): string[] {
  return readRecords()
    .sort(
      (a, b) =>
        new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime()
    )
    .slice(0, limit)
    .map((entry) => entry.query);
}

export function getPopularSearches(limit = 8): string[] {
  return readRecords()
    .sort(
      (a, b) =>
        b.count - a.count ||
        new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime()
    )
    .slice(0, limit)
    .map((entry) => entry.query);
}

export function getSessionSearches(limit = 8): string[] {
  const sessionId = getOrCreateSessionId();
  return readRecords()
    .filter((entry) => entry.sessions.includes(sessionId))
    .sort(
      (a, b) =>
        new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime()
    )
    .slice(0, limit)
    .map((entry) => entry.query);
}

function queueBiEvent(event: SearchBiEventPayload) {
  if (!canUseStorage()) return;

  try {
    const raw = window.localStorage.getItem(SEARCH_BI_EVENTS_KEY);
    const existing = raw ? (JSON.parse(raw) as SearchBiEventPayload[]) : [];
    const next = [...existing, event].slice(-500);
    window.localStorage.setItem(SEARCH_BI_EVENTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore serialization errors to keep search UX non-blocking.
  }
}

export function trackSearchBiEvent(event: SearchBiEvent) {
  if (!canUseStorage()) return;
  // BI + dataLayer + beacon require statistics consent (same as ecommerce / leads).
  if (!canTrackStatistics()) return;

  const payload: SearchBiEventPayload = {
    ...event,
    query: event.query?.trim(),
    timestamp: new Date().toISOString(),
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
  };

  queueBiEvent(payload);

  const win = window as Window & { dataLayer?: unknown[] };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({
    event: "pb_search_event",
    ...payload,
  });

  // Native GA4 site-search event for built-in Search term reports (no GTM remapping).
  const searchTerm = payload.query?.trim() ?? "";
  if (event.eventType === "search_submitted" && searchTerm.length > 0) {
    pushConsentGatedGtmEvent({
      event: "search",
      search_term: searchTerm,
      ...(typeof payload.resultCount === "number"
        ? { search_results: payload.resultCount }
        : {}),
      ...(payload.source ? { search_source: payload.source } : {}),
    });
  }

  const body = JSON.stringify(payload);
  const endpoint = "/api/analytics/search";

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore network failures; data stays in localStorage queue.
  });
}
