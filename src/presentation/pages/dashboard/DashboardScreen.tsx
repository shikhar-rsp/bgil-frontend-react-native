import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { ListChecks } from 'phosphor-react-native';
import { Button, BottomNav, MoreMenu, colors, spacing, typography, type BottomNavItem } from '@atlas-ds/react-native';
import { DashboardTopBar, HEADER_GRADIENTS } from '../../components/dashboard/sections/DashboardTopBar';
import { YourInsights } from '../../components/dashboard/sections/YourInsights';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import { TodaysTasks } from '../../components/dashboard/sections/TodaysTasks';
import { TasksScreen, type TasksTab } from '../../components/dashboard/tasks/TasksScreen';
import { NotesSheet } from '../../components/dashboard/tasks/NotesSheet';
import { WhatsNew } from '../../components/dashboard/sections/WhatsNew';
import { SearchPanel } from '../../components/dashboard/sections/SearchPanel';
import { buildMoreMenuItems } from '../../components/dashboard/sections/moreMenuItems';
import { ObboardingModal } from '../../components/dashboard/sections/ObboardingModal';
import { BusinessScreen, type QuoteRequest } from './BusinessScreen';
import {
  WalkthroughProvider,
  WalkthroughTarget,
  useWalkthrough,
  type TargetRect,
} from '../../components/dashboard/walkthrough/WalkthroughContext';
import { DashboardWalkthrough } from '../../components/dashboard/walkthrough/DashboardWalkthrough';
import { WALKTHROUGH_STEPS, type WalkthroughSurface } from '../../components/dashboard/walkthrough/walkthroughSteps';
import type { AuthScreenProps, OpenTaskRequest } from '../../../navigation';

/** Bottom-nav tabs — split 2 + 2 around the centre AI button. */
const NAV_ITEMS: BottomNavItem[] = [
  { key: 'Home', label: 'Home', iconName: 'home' },
  { key: 'Business', label: 'Business', iconName: 'bank' },
  // BottomNav's built-in glyph set has no tasks icon, so this passes Phosphor
  // through the `icon` override. Custom nodes are rendered as-is — the bar
  // doesn't recolour them — so both states are supplied to match the built-ins
  // (regular + textBody inactive, fill + brand active).
  {
    key: 'Tasks',
    label: 'Tasks',
    icon: <ListChecks size={24} color={colors.textBody} weight="regular" />,
    activeIcon: <ListChecks size={24} color={colors.brand} weight="fill" />,
  },
  { key: 'More', label: 'More', iconName: 'grid' },
];

/** Home sub-tabs, driven by the segmented control. */
const HOME_TABS = [
  { label: 'Tools', value: 'tools' },
  { label: 'Insights', value: 'insights' },
  { label: 'Tasks', value: 'tasks' },
];

/** Tasks-tab sub-views, driven by the same header segmented control. */
const TASKS_TABS = [
  { label: 'Tasks', value: 'tasks' },
  { label: 'Events', value: 'events' },
  { label: 'Meetings', value: 'meetings' },
];

/**
 * Agent dashboard. The top section is an avatar + search + notifications row
 * with a Tools / Insights / Tasks segmented control; the bottom nav switches
 * the primary surface (Home / Business / …). This layout is agent-only.
 */
const DashboardScreenInner: React.FC<AuthScreenProps<'Dashboard'>> = ({ navigation, route }) => {
  const [selectedItem, setSelectedItem] = useState('Home');
  // Business sub-views (browse / wizards) take over the screen — hide the nav
  // and swap the header avatar for a back button.
  const [hideNav, setHideNav] = useState(false);
  // Held in a ref: storing it in state would re-render on every report and
  // loop with the child's effect.
  const businessBackRef = useRef<(() => void) | null>(null);

  // Stable identity so the child's effect doesn't re-run every render.
  const handleFullScreenChange = useCallback((fullScreen: boolean, onBack: () => void) => {
    businessBackRef.current = onBack;
    setHideNav(fullScreen);
  }, []);
  const [homeTab, setHomeTab] = useState('tools');
  const [tasksTab, setTasksTab] = useState<TasksTab>('tasks');
  // A Quick Quotes tile hands its product to the Business tab, which opens the
  // matching flow. Cleared once BusinessScreen has routed it.
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  // The "More" tab opens a popup above the nav instead of switching surface.
  const [moreOpen, setMoreOpen] = useState(false);
  // Shown on every dashboard entry, matching the web.
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const { height: screenH } = useWindowDimensions();
  const homeScrollRef = useRef<ScrollView>(null);
  const homeScrollY = useRef(0);
  // Tour measurements are reported relative to this view, so the overlay needs
  // no status-bar/inset maths of its own.
  const rootRef = useRef<View | null>(null);
  const walkthrough = useWalkthrough();

  useEffect(() => {
    walkthrough?.registerRoot(rootRef);
  }, [walkthrough]);

  // Re-entry from Profile → Product Tour. The param is cleared once consumed so
  // returning to the dashboard later doesn't replay the tour.
  const startTourParam = route.params?.startTour;
  useEffect(() => {
    if (!startTourParam) {
      return;
    }
    navigation.setParams({ startTour: undefined });
    setShowOnboarding(false);
    setTourActive(true);
  }, [startTourParam, navigation]);

  // Tapping a task notification lands here with `openTask`: switch to the Tasks
  // tab and hand the task down so its detail modal opens. Cleared once consumed.
  const [pendingTask, setPendingTask] = useState<OpenTaskRequest | null>(null);
  const openTaskParam = route.params?.openTask;
  useEffect(() => {
    if (!openTaskParam) {
      return;
    }
    navigation.setParams({ openTask: undefined });
    setPendingTask(openTaskParam);
    setTasksTab('tasks');
    setSelectedItem('Tasks');
  }, [openTaskParam, navigation]);

  const dismissOnboarding = () => setShowOnboarding(false);

  // Put the step's target on screen: switch bottom-nav tab and Home sub-tab.
  const handleSurfaceChange = useCallback((surface: WalkthroughSurface) => {
    setHideNav(false);
    setSelectedItem(surface.nav);
    if (surface.nav === 'Home' && surface.homeTab) {
      setHomeTab(surface.homeTab);
    }
  }, []);

  // Centre the target within the band left between the header and bottom nav.
  const handleScrollIntoView = useCallback(
    (rect: TargetRect) => {
      const bandTop = screenH * 0.18;
      const bandBottom = screenH * 0.82;
      const top = rect.y;
      const bottom = rect.y + rect.height;
      if (top >= bandTop && bottom <= bandBottom) {
        return;
      }
      const delta = (top + rect.height / 2) - (bandTop + bandBottom) / 2;
      const next = Math.max(0, homeScrollY.current + delta);
      homeScrollRef.current?.scrollTo({ y: next, animated: false });
      homeScrollY.current = next;
    },
    [screenH],
  );

  const onHomeScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    homeScrollY.current = e.nativeEvent.contentOffset.y;
  };

  const endTour = () => {
    setTourActive(false);
    // Leave the user where the tour began rather than on the Business tab.
    setSelectedItem('Home');
    setHomeTab('tools');
  };

  const openProfile = () =>
    navigation.navigate('Profile', {
      persona: 'agent',
      userName: 'Rajesh Chaurasia',
      userId: 'BA78631498',
      userInitials: 'RC',
    });

  // A task's "View" opens the matching Business flow: Proposals → Two Wheeler,
  // Renewals → the renewals table, Quotes → Health Guard (mirrors the web).
  const handleViewTaskQuote = (taskType: 'Quotes' | 'Proposals' | 'Renewals', customer: string) => {
    if (taskType === 'Proposals') {
      // Open the Two Wheeler motor quote straight at Preview & Share (payment-pending toast).
      setQuoteRequest({ product: 'Two Wheeler', vehicleType: 'registered', initialStep: 6, customer });
    } else if (taskType === 'Renewals') {
      // Open the expiring-policy screen for the customer (policy is due for renewal).
      setQuoteRequest({ renewalPolicy: { customer } });
    } else {
      // Open the Health Guard quote straight at Preview & Share, seeded for the customer.
      setQuoteRequest({ product: 'Health Guard', initialStep: 6, customer });
    }
    setSelectedItem('Business');
  };

  const startWalkthrough = () => {
    setShowOnboarding(false);
    // Let the modal's fade-out finish before the overlay takes over, so the two
    // don't animate over each other (same 300ms handoff as the web).
    setTimeout(() => setTourActive(true), 300);
  };

  const handleSelectItem = (id: string) => {
    if (id === 'Home' && selectedItem !== 'Home') {
      setTourActive(false);
    }
    setSelectedItem(id);
  };

  // Tasks and Notes have somewhere to go; the rest belong to a later porting
  // phase and just dismiss the popup.
  const moreItems = buildMoreMenuItems(
    (key) => {
      setMoreOpen(false);
      if (key === 'tasks') {
        setHideNav(false);
        setTasksTab('tasks');
        handleSelectItem('Tasks');
      } else if (key === 'notes') {
        setNotesOpen(true);
      }
    },
    { notes: true },
  );

  return (
    <View ref={rootRef} collapsable={false} style={styles.safe}>
      <DashboardTopBar
        gradientColors={HEADER_GRADIENTS.platinum}
        onProfilePress={openProfile}
        showBack={hideNav}
        onBackPress={() => businessBackRef.current?.()}
        onSearchPress={() => setSearchOpen(true)}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        tabs={selectedItem === 'Home' ? HOME_TABS : selectedItem === 'Tasks' ? TASKS_TABS : undefined}
        activeTab={selectedItem === 'Tasks' ? tasksTab : homeTab}
        onTabChange={selectedItem === 'Tasks' ? (v) => setTasksTab(v as TasksTab) : setHomeTab}
      />

      <View style={styles.body}>
        {selectedItem === 'Home' ? (
          <ScrollView
            ref={homeScrollRef}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            onScroll={onHomeScroll}
            scrollEventThrottle={16}
          >
            {homeTab === 'tools' ? (
              <>
                <WalkthroughTarget id="quick-quotes">
                  <QuickQuotes
                    onNavigateToQuote={(product, vehicleType) => {
                      setQuoteRequest({ product, vehicleType });
                      setSelectedItem('Business');
                    }}
                    onNavigateToRenewals={() => {
                      setQuoteRequest({ tab: 'renewals' });
                      setSelectedItem('Business');
                    }}
                  />
                </WalkthroughTarget>
                <WhatsNew />
                <WalkthroughTarget id="your-toolkit">
                  <YourToolkit
                    onNavigateToRenewals={() => {
                      setQuoteRequest({ tab: 'renewals' });
                      setSelectedItem('Business');
                    }}
                  />
                </WalkthroughTarget>
                {/* <AssistantInsights isWalkthroughActive={tourActive} /> */}
              </>
            ) : homeTab === 'insights' ? (
              <>
              <WalkthroughTarget id="insights">
                <YourInsights isWalkthroughActive={tourActive} />
              </WalkthroughTarget>
              {/* WhatsNew renders on all three Home tabs; the tour points at
                  this copy so the id resolves to exactly one mounted view. */}
              <WalkthroughTarget id="whats-new">
                <WhatsNew />
              </WalkthroughTarget>
              </>

            ) : (
              <>
              <WalkthroughTarget id="todays-tasks">
                <TodaysTasks />
              </WalkthroughTarget>
              <WhatsNew />
              </>

            )}
          </ScrollView>
        ) : selectedItem === 'Business' ? (
          <BusinessScreen
            quoteRequest={quoteRequest}
            onQuoteRequestHandled={() => setQuoteRequest(null)}
            onFullScreenChange={handleFullScreenChange}
            // Exiting a task-opened quote unmounts BusinessScreen in the same
            // tick, so its full-screen effect never fires onFullScreenChange(false)
            // to restore the nav — reset hideNav here explicitly.
            onExitToHome={() => { setHideNav(false); handleSelectItem('Home'); }}
            onExitToTasks={() => { setHideNav(false); handleSelectItem('Tasks'); }}
          />
        ) : selectedItem === 'Tasks' ? (
          <TasksScreen
            tab={tasksTab}
            onViewTaskQuote={handleViewTaskQuote}
            openTask={pendingTask}
            onOpenTaskHandled={() => setPendingTask(null)}
            persona="agent"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>{selectedItem}</Text>
            <Text style={styles.placeholderBody}>
              This section is part of a later porting phase.
            </Text>
            <Button label="Back to Home" variant="secondaryGray" onPress={() => handleSelectItem('Home')} />
          </View>
        )}
      </View>

      {/* The create-quote FAB belongs to the Business tab only — BusinessScreen
          renders its own on its landing view. */}
      {/* The popup floats above the nav, so it renders before it — the bar and
          its centre button stay above the scrim and interactive. */}
      {!hideNav ? (
        <>
          <MoreMenu visible={moreOpen} onClose={() => setMoreOpen(false)} items={moreItems} />
          <WalkthroughTarget id="bottom-nav">
            <BottomNav
              items={NAV_ITEMS}
              activeKey={moreOpen ? 'More' : selectedItem}
              onChange={(id) => {
                if (id === 'More') {
                  setMoreOpen((open) => !open);
                  return;
                }
                setMoreOpen(false);
                setHideNav(false);
                handleSelectItem(id);
              }}
              center={{
                onPress: () => {
                  setMoreOpen(false);
                  handleSelectItem('MyAI');
                },
                accessibilityLabel: 'MyAI assistant',
              }}
            />
          </WalkthroughTarget>
        </>
      ) : null}


      <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />

      <NotesSheet visible={notesOpen} onClose={() => setNotesOpen(false)} />

      <ObboardingModal
        isOpen={showOnboarding}
        onClose={dismissOnboarding}
        onStartWalkthrough={startWalkthrough}
      />

      <DashboardWalkthrough
        isOpen={tourActive}
        onClose={endTour}
        steps={WALKTHROUGH_STEPS}
        onSurfaceChange={handleSurfaceChange}
        onScrollIntoView={handleScrollIntoView}
      />
    </View>
  );
};

/** Targets register into the provider, so it must sit above the whole screen. */
export const DashboardScreen: React.FC<AuthScreenProps<'Dashboard'>> = (props) => (
  <WalkthroughProvider>
    <DashboardScreenInner {...props} />
  </WalkthroughProvider>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  body: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  placeholderTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  placeholderBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
