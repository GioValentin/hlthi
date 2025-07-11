import { AnalyticsBrowser } from '@segment/analytics-next';

export const SegmentClient = AnalyticsBrowser.load({
  writeKey: import.meta.env.VITE_APP_SEGMENT_WRITE_KEY!,
});
