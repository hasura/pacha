/* eslint-disable @typescript-eslint/no-restricted-imports */
import {
  ActionIcon,
  Alert,
  AppShell,
  Badge,
  Button,
  Card,
  createTheme,
  DEFAULT_THEME,
  Group,
  HoverCard,
  Input,
  mergeMantineTheme,
  Modal,
  NavLink,
  Notification,
  Paper,
  PaperProps,
  Popover,
  ScrollArea,
  Select,
  Skeleton,
  Switch,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import {
  APP_SHELL_HEADER_HEIGHT,
  APP_SHELL_ID,
  DEFAULT_RADIUS,
  PROJECT_APP_SHELL_NAVBAR_WIDTH,
} from '../constants';
import notificationStyles from './custom-styles/notifications.module.css';
import tabsStyles from './custom-styles/tabs.module.css';
import textInputStyles from './custom-styles/text-input.module.css';

export const defaultContainerProps = {
  radius: DEFAULT_RADIUS,
  shadow: 'none',
  withBorder: false,
} satisfies PaperProps;

const primaryColor: ExtendedCustomColors = 'indigo';

export const mantineTheme = createTheme({
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  primaryColor,
  primaryShade: 7,
  scale: 1.125, // our font size is 13px. so to compensate, we scale up the mantine theme slightly (default is 16px)
  defaultRadius: DEFAULT_RADIUS,
  headings: {
    fontWeight: '500',
  },
  colors: {
    // the mantine default gray is a bit on the light side
    // this is a bit of a darker gray

    ruby: [
      '#ffe9ef',
      '#fed3dd',
      '#f5a7b7',
      '#ed778f',
      '#e64e6d',
      '#e33457',
      '#e2254d',
      '#c9173d',
      '#b40e35',
      '#9e002d',
    ],
    green: DEFAULT_THEME.colors.teal,
  },
  components: {
    Paper: Paper.extend({
      defaultProps: {
        ...defaultContainerProps,
      },
    }),

    Button: Button.extend({
      defaultProps: {
        fw: 500,
      },
    }),
    TextInput: TextInput.extend({
      classNames: textInputStyles,
    }),
    NavLink: NavLink.extend({
      styles: {
        label: {
          fontSize: '14px',
        },
      },
    }),
    AppShell: AppShell.extend({
      defaultProps: {
        id: APP_SHELL_ID,
        header: {
          height: APP_SHELL_HEADER_HEIGHT,
        },
        navbar: {
          width: PROJECT_APP_SHELL_NAVBAR_WIDTH,
          breakpoint: 0,
        },
      },
    }),
    Skeleton: Skeleton.extend({
      defaultProps: {},
    }),
    ScrollArea: ScrollArea.extend({
      defaultProps: {
        type: 'auto',
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {},
    }),
    Notification: Notification.extend({
      defaultProps: {},
      classNames: notificationStyles,
    }),
    HoverCard: HoverCard.extend({
      defaultProps: {
        shadow: 'md',
      },
    }),
    Popover: Popover.extend({
      defaultProps: {
        shadow: 'md',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        variant: 'light',
        fw: 500,
      },
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    }),
    Card: Card.extend({
      defaultProps: {
        ...defaultContainerProps,
      },
    }),
    Input: Input.extend({
      defaultProps: {
        classNames: {
          input: 'dark:!placeholder-gray-0',
        },
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        padding: 'lg',
      },
    }),
    Alert: Alert.extend({
      defaultProps: {},
    }),
    Select: Select.extend({
      defaultProps: {
        allowDeselect: false,
      },
    }),
    Switch: Switch.extend({
      defaultProps: {
        styles: {
          label: { cursor: 'pointer' },
          track: { cursor: 'pointer' },
        },
      },
    }),
    Tabs: Tabs.extend({
      classNames: tabsStyles,
    }),
    /* 
      I really want these defaults because often when we use Group, 
      there are unintended wrapping behaviors that happen when the viewport
      shrinks or the width decreases. We don't notice it until it happens and visual regressions can occur.
      This sets a default behavior that is more predictable and less likely to cause issues.

      Please check for any unintended visual changes from this change.

      Also, the gap is often too large by default, so I'm setting it to 'xs' by default.

      - MG
    */
    Group: Group.extend({
      defaultProps: {
        wrap: 'nowrap',
        gap: 'xs',
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        openDelay: 250,
        transitionProps: {
          transition: 'pop',
        },
      },
    }),
  },
  breakpoints: {
    ...DEFAULT_THEME.breakpoints,
    xxl: '1920px',
  },
});

export const staticTheme = mergeMantineTheme(DEFAULT_THEME, mantineTheme);
