import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

import { staticTheme } from '@/ui/mantine';

const base00 = staticTheme.colors.dark[9], // '#2E3235',
  base01 = 'var(--tw-color-secondary-100-hex)', // '#DDDDDD',
  base02 = 'var(--tw-color-secondary-200-hex)', // '#B9D2FF',
  base03 = 'var(--tw-color-secondary-300-hex)', // '#b0b0b0',
  base04 = 'var(--tw-color-secondary-500-hex)', // '#d0d0d0',
  base05 = 'var(--tw-color-secondary-700-hex)', // '#e0e0e0',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // base06 = 'var(--tw-color-secondary-800-hex)', // '#808080',
  base07 = 'var(--tw-color-secondary-950-hex)', // '#000000',
  base08 = 'var(--tw-color-red-400-hex)', // '#A54543',
  base09 = 'var(--tw-color-amber-400-hex)', // '#fc6d24',
  base0A = 'var(--tw-color-purple-400-hex)', // '#fda331',
  base0B = 'var(--tw-color-yellow-400-hex)', // '#8abeb7',
  base0C = 'var(--tw-color-blue-400-hex)', // '#b5bd68',
  base0D = 'var(--tw-color-lime-400-hex)', // '#6fb3d2',
  base0E = 'var(--tw-color-orange-400-hex)', // '#cc99cc',
  base0F = 'var(--tw-color-green-400-hex)'; // '#6987AF';

const invalid = base09,
  darkBackground = base00,
  highlightBackground = 'transparent',
  background = base00,
  tooltipBackground = base01,
  selection = base05,
  cursor = base01;

/// The editor theme styles for Hasura Dark.
export const hasuraDarkTheme = EditorView.theme(
  {
    '&': {
      color: base01,
      backgroundColor: background,
      fontFamily: 'var(--tw-font-family-mono) !important',
      height: '100%',
    },

    '&.cm-focused': { outline: 'none' },

    '.cm-scroller': {
      fontFamily: 'var(--tw-font-family-mono) !important',
    },

    '.cm-content': {
      caretColor: cursor,
    },

    '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: selection },

    '.cm-panels': { backgroundColor: darkBackground, color: base03 },
    '.cm-panels.cm-panels-top': {
      borderBottom: '2px solid ' + base07,
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '2px solid ' + base07,
    },

    '.cm-searchMatch': {
      backgroundColor: base02,
      outline: `1px solid ${base03}`,
      color: base07,
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: base05,
      color: base07,
    },

    '.cm-activeLine': { backgroundColor: highlightBackground },
    '.cm-selectionMatch': { backgroundColor: selection },

    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      outline: `1px solid ${base03}`,
    },

    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: base05,
      color: base07,
    },

    '.cm-gutters': {
      borderRight: '1px solid ' + base07,
      color: base04,
      backgroundColor: darkBackground,
    },

    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: base02,
    },

    '.cm-tooltip': {
      border: 'none',
      backgroundColor: tooltipBackground,
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground,
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: highlightBackground,
        color: base03,
      },
    },
    '.cm-tooltip ': {
      backgroundColor: 'black',
    },
  },
  { dark: true }
);

/// The highlighting style for code in the Hasura Light theme.
export const hasuraDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: base0A },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: base0C,
  },
  { tag: [t.variableName], color: base0D },
  { tag: [t.function(t.variableName)], color: base0A },
  { tag: [t.labelName], color: base09 },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: base0A,
  },
  { tag: [t.definition(t.name), t.separator], color: base0E },
  { tag: [t.brace], color: base0E },
  {
    tag: [t.annotation],
    color: invalid,
  },
  {
    tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: base0A,
  },
  {
    tag: [t.typeName, t.className],
    color: base0D,
  },
  {
    tag: [t.operator, t.operatorKeyword],
    color: base0E,
  },
  {
    tag: [t.tagName],
    color: base0A,
  },
  {
    tag: [t.squareBracket],
    color: base0E,
  },
  {
    tag: [t.angleBracket],
    color: base0E,
  },
  {
    tag: [t.attributeName],
    color: base0D,
  },
  {
    tag: [t.regexp],
    color: base0A,
  },
  {
    tag: [t.quote],
    color: base01,
  },
  { tag: [t.string], color: base0C },
  {
    tag: t.link,
    color: base0F,
    textDecoration: 'underline',
    textUnderlinePosition: 'under',
  },
  {
    tag: [t.url, t.escape, t.special(t.string)],
    color: base0B,
  },
  { tag: [t.meta], color: base08 },
  { tag: [t.comment], color: base03, fontStyle: 'italic' },
  { tag: t.monospace, color: base01 },
  { tag: t.strong, fontWeight: 'bold', color: base0A },
  { tag: t.emphasis, fontStyle: 'italic', color: base0D },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.heading, fontWeight: 'bold', color: base01 },
  { tag: t.special(t.heading1), fontWeight: 'bold', color: base01 },
  { tag: t.heading1, fontWeight: 'bold', color: base01 },
  {
    tag: [t.heading2, t.heading3, t.heading4],
    fontWeight: 'bold',
    color: base01,
  },
  {
    tag: [t.heading5, t.heading6],
    color: base01,
  },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: base0B },
  {
    tag: [t.processingInstruction, t.inserted],
    color: base0B,
  },
  {
    tag: [t.contentSeparator],
    color: base0D,
  },
  { tag: t.invalid, color: base02, borderBottom: `1px dotted ${invalid}` },
]);

/// Extension to enable the Hasura Dark theme (both the editor theme and
/// the highlight style).
export const hasuraDark: Extension = [
  hasuraDarkTheme,
  syntaxHighlighting(hasuraDarkHighlightStyle),
];
