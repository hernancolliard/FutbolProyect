import { GTM_CONTAINER_ID } from "@/lib/analyticsConfig";

export type AnalyticsValue = string | number | boolean;
export type AnalyticsParameters = Record<
  string,
  AnalyticsValue | null | undefined
>;

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

const isAnalyticsEnabled = Boolean(GTM_CONTAINER_ID);

const cleanParameters = (parameters: AnalyticsParameters) =>
  Object.fromEntries(
    Object.entries(parameters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const trackAnalyticsEvent = (
  event: string,
  parameters: AnalyticsParameters = {},
) => {
  if (typeof window === "undefined" || !isAnalyticsEnabled) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...cleanParameters(parameters),
  });
};

export const trackAnalyticsEventOnce = (
  storageKey: string,
  event: string,
  parameters: AnalyticsParameters = {},
) => {
  if (typeof window === "undefined" || !isAnalyticsEnabled) return false;

  try {
    if (window.localStorage.getItem(storageKey)) return false;
    trackAnalyticsEvent(event, parameters);
    window.localStorage.setItem(storageKey, "true");
    return true;
  } catch {
    trackAnalyticsEvent(event, parameters);
    return true;
  }
};

export const getCompletionRange = (completionPercent: number) => {
  if (completionPercent >= 100) return "100";
  if (completionPercent >= 75) return "75_99";
  if (completionPercent >= 50) return "50_74";
  if (completionPercent >= 25) return "25_49";
  return "0_24";
};
