import GA, { InitializeOptions, event as Event, pageview as Pageview } from 'react-ga';

type Analytics = Promise<typeof GA>;

declare global {
  interface Window {
    analytics?: Analytics;
  }
}

export const analyticsAsync = async (trackingId: string, options?: InitializeOptions) => {
  if (window.analytics) return window.analytics;

  window.analytics = import('react-ga');

  (await window.analytics).initialize(trackingId, options);

  return window.analytics;
};

export const pageview = async (...args: Parameters<typeof Pageview>) =>
  (await window.analytics)?.pageview(...args);

export const event = async (...args: Parameters<typeof Event>) =>
  (await window.analytics)?.event(...args);
