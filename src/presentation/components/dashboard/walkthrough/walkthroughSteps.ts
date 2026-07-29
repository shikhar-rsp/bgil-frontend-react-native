import type { TargetRect } from './WalkthroughContext';

/** Which dashboard surface a step's target lives on. */
export type WalkthroughSurface = {
  /** Bottom-nav tab. */
  nav: 'Home' | 'Business';
  /** Home sub-tab (segmented control). Only meaningful when `nav` is 'Home'. */
  homeTab?: 'tools' | 'insights' | 'tasks';
};

export interface WalkthroughStep {
  id: string;
  /** Id registered via `WalkthroughTarget`. */
  targetId: string;
  title: string;
  description: string;
  surface: WalkthroughSurface;
  /**
   * Narrows the spotlight within the measured target. Used where the registered
   * view is a container rather than the thing being pointed at.
   */
  focus?: (rect: TargetRect) => TargetRect;
  /** Corner radius of the cutout. Defaults to the 12px card radius. */
  radius?: number;
  /**
   * Scroll the target into view before spotlighting it. Turn off for chrome
   * that lives outside the scrolling area, such as the bottom nav.
   */
  autoScroll?: boolean;
}

/** Centre AI button geometry inside the BottomNav (see BottomNav styles). */
const CENTER_BUTTON_SIZE = 60;
const CENTER_BUTTON_RISE = 14;

/**
 * The seven dashboard tour steps, ported from the web `walkthroughSteps` array.
 *
 * Order differs from the web in one place: Today's Tasks comes before Business
 * Insights. The web renders every target on a single scrolling page, whereas
 * here they are spread over three Home sub-tabs plus the Business tab — so the
 * sequence is grouped by surface to keep tab switching to a minimum, and ends
 * on Business, the largest context change.
 */
export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'insights',
    targetId: 'insights',
    title: 'Your Insights',
    description:
      'Statistics like premium generated, policies sold, etc. Comparison with previous month, trendline shows growth.',
    surface: { nav: 'Home', homeTab: 'insights' },
  },
  {
    id: 'whats-new',
    targetId: 'whats-new',
    title: 'Latest News and Updates',
    description: 'Updates of new campaigns, announcements, so you don’t miss out on latest updates from us.',
    surface: { nav: 'Home', homeTab: 'insights' },
  },
  {
    id: 'quick-quotes',
    targetId: 'quick-quotes',
    title: 'Quick Quotes',
    description: 'Personalise your dashboard by keeping your line of businesses upfront.',
    surface: { nav: 'Home', homeTab: 'tools' },
  },
  {
    id: 'your-toolkit',
    targetId: 'your-toolkit',
    title: 'Your Toolkit',
    description: 'Toolkit, calculators and resources for speeding up processes.',
    surface: { nav: 'Home', homeTab: 'tools' },
  },
  {
    id: 'my-ai',
    targetId: 'bottom-nav',
    title: 'MyAI - Your business buddy',
    description:
      'MyAI is your AI business buddy to help you with anything related to quotes, policies, customer, and more!',
    // Stays on the Tools tab — the bottom nav is present on every Home tab, so
    // this step costs no switch. The registered target is the whole nav bar;
    // narrow it to the circular AI button that floats above its centre.
    surface: { nav: 'Home', homeTab: 'tools' },
    focus: (rect) => ({
      x: rect.x + rect.width / 2 - CENTER_BUTTON_SIZE / 2,
      y: rect.y - CENTER_BUTTON_RISE,
      width: CENTER_BUTTON_SIZE,
      height: CENTER_BUTTON_SIZE,
    }),
    radius: CENTER_BUTTON_SIZE / 2,
    // Fixed chrome below the scroll area — scrolling would never reach it.
    autoScroll: false,
  },
  {
    id: 'todays-tasks',
    targetId: 'todays-tasks',
    title: 'Today’s Tasks',
    description: 'A quick view of what needs to done today.',
    surface: { nav: 'Home', homeTab: 'tasks' },
  },
  {
    id: 'business-insights',
    targetId: 'business-insights',
    title: 'Business Insights',
    description: 'You can view your progress on various insights related to claims, renewals, quotes.',
    surface: { nav: 'Business' },
  },
];
