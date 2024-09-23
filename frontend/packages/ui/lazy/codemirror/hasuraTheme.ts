/* eslint-disable @typescript-eslint/no-unused-vars */
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

import { alpha, lighten } from '@/ui/core';
import { staticTheme } from '@/ui/mantine';

const base00 = (theme: 'light' | 'dark') =>
  theme === 'light'
    ? lighten('var(--mantine-primary-color-0)', 0.25)
    : 'var(--mantine-color-dark-9)';

const base02 = (theme: 'light' | 'dark') =>
  theme === 'light'
    ? alpha('var(--mantine-color-green-text)', 0.15)
    : alpha('var(--mantine-color-gray-text)', 0.15);

const base01 = staticTheme.colors.gray[2],
  base03 = staticTheme.colors.gray[4],
  base04 = staticTheme.colors.gray[6],
  base05 = staticTheme.colors.gray[7],
  base06 = 'var(--mantine-color-gray-text)',
  base07 = staticTheme.colors.gray[9],
  base08 = 'var(--mantine-color-red-text)',
  base09 = 'var(--mantine-color-orange-text)',
  base0A = 'var(--mantine-color-grape-text)',
  base0B = 'var(--mantine-color-orange-text)',
  base0C = 'var(--mantine-color-blue-text)',
  base0D = 'var(--mantine-color-green-text)',
  base0E = 'var(--mantine-color-orange-text)',
  base0F = 'var(--mantine-color-green-text)';

type EditorStyleObject = Parameters<typeof EditorView.theme>[0];

const createTheme = (theme: 'light' | 'dark') => {
  const invalid = base09,
    lightBackground = base00(theme),
    highlightBackground = 'transparent',
    background = base00(theme),
    tooltipBackground = base01,
    selection = base02(theme),
    cursor = base07;

  const themeStyle: EditorStyleObject = {
    '&': {
      color: base06,
      backgroundColor: background,
      fontFamily: 'monospace !important',
      height: '100%',
    },

    '&.cm-focused': { outline: 'none' },

    '.cm-scroller': {
      fontFamily: 'monospace !important',
    },

    '.cm-content': {
      caretColor: cursor,
    },

    '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: selection },

    '.cm-panels': { backgroundColor: lightBackground, color: base03 },
    '.cm-panels.cm-panels-top': {
      borderBottom: '2px solid ' + base00(theme),
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '2px solid ' + base00(theme),
    },

    '.cm-searchMatch': {
      backgroundColor: base02(theme),
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
      backgroundColor: base02(theme),
      color: base07,
    },

    '.cm-gutters': {
      borderRight: '1px solid ' + base02(theme),
      color: base06,
      backgroundColor: lightBackground,
    },

    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: base02(theme),
    },

    '.cm-tooltip': {
      border: 'none',
      backgroundColor: tooltipBackground,
    },
    '.cm-button': {
      color: base07,
    },
    '.cm-panel.cm-search label': {
      color: base07,
    },
    '.cm-textfield': {
      color: base07,
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
  };

  const highlightStyle = HighlightStyle.define([
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
    { tag: [t.string], color: base0A },
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
    { tag: [t.comment], color: base06, fontStyle: 'italic' },
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
    {
      tag: t.invalid,
      color: base02(theme),
      borderBottom: `1px dotted ${invalid}`,
    },
  ]);

  return {
    theme: themeStyle,
    highlightStyle,
  };
};

export const hasuraLight: Extension = [
  EditorView.theme(createTheme('light').theme, {
    dark: false,
  }),
  syntaxHighlighting(createTheme('light').highlightStyle),
];

export const hasuraDark: Extension = [
  EditorView.theme(createTheme('dark').theme, { dark: true }),
  syntaxHighlighting(createTheme('dark').highlightStyle),
];
