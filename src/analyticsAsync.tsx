import GA, { InitializeOptions } from 'react-ga';

let instance: typeof GA | null = null;

export const analyticsAsync = async (trackingId: string, options?: InitializeOptions) => {
  if (!instance) {
    const ReactGA = await import('react-ga');
    ReactGA.initialize(trackingId, options);
    instance = ReactGA;
  }

  return instance;
};
