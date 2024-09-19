import { useEffect, useState } from 'react';
import { indentWithTab } from '@codemirror/commands';
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  Extension,
  StateEffect,
  StateField,
} from '@codemirror/state';
import { EditorView, keymap, placeholder, ViewUpdate } from '@codemirror/view';

import { basicSetup, BasicSetupOptions } from './basicSetup';
import { hasuraDark, hasuraLight } from './hasuraTheme';
import { getStatistics, Statistics } from './utils';

const External = Annotation.define<boolean>();

export function useCodeMirror(props: {
  container: HTMLDivElement;
  initialState:
    | { json: any; fields?: Record<string, StateField<any>> }
    | undefined;
  onChange: ((value: string, viewUpdate: ViewUpdate) => void) | undefined;
  editable: boolean | undefined;
  minWidth: string | undefined;
  readOnly: boolean | undefined;
  autoFocus: boolean | undefined;
  onCreateEditor: ((view: EditorView, state: EditorState) => void) | undefined;
  minHeight: string | undefined;
  extensions: any[];
  indentWithTab: boolean | undefined;
  selection: EditorSelection | { anchor: number; head?: number };
  maxHeight: string | undefined;
  root: ShadowRoot | Document | undefined;
  width: string | undefined;
  onStatistics: ((data: Statistics) => void) | undefined;
  theme: Extension | 'light' | 'dark' | 'none' | undefined;
  placeholder: string | HTMLElement | undefined;
  value: string;
  onUpdate: ((viewUpdate: ViewUpdate) => void) | undefined;
  basicSetup: boolean | BasicSetupOptions | undefined;
  height: string | undefined;
  maxWidth: string | undefined;
}) {
  const {
    value,
    selection,
    onChange,
    onStatistics,
    onCreateEditor,
    onUpdate,
    extensions = [],
    autoFocus,
    theme = 'light',
    height = '',
    minHeight = '',
    maxHeight = '',
    placeholder: placeholderStr = '',
    width = '',
    minWidth = '',
    maxWidth = '',
    editable = true,
    readOnly = false,
    indentWithTab: defaultIndentWithTab = true,
    basicSetup: defaultBasicSetup = true,
    root,
    initialState,
  } = props;
  const [observer, setObserver] = useState<MutationObserver | null>(null);
  const [container, setContainer] = useState<HTMLDivElement>();
  const [currentThemeCompartment] = useState<Compartment>(new Compartment());
  const [view, setView] = useState<EditorView>();
  const [state, setState] = useState<EditorState>();
  const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
    if (
      vu.docChanged &&
      typeof onChange === 'function' &&
      // Fix echoing of the remote changes:
      // If transaction is market as remote we don't have to call `onChange` handler again
      !vu.transactions.some(tr => tr.annotation(External))
    ) {
      const doc = vu.state.doc;
      const value = doc.toString();
      onChange(value, vu);
    }
    onStatistics && onStatistics(getStatistics(vu));
  });

  let getExtensions = [updateListener];
  if (defaultIndentWithTab) {
    getExtensions.unshift(keymap.of([indentWithTab]));
  }
  if (defaultBasicSetup) {
    if (typeof defaultBasicSetup === 'boolean') {
      getExtensions.unshift(basicSetup());
    } else {
      getExtensions.unshift(basicSetup(defaultBasicSetup));
    }
  }

  if (placeholderStr) {
    getExtensions.unshift(placeholder(placeholderStr));
  }

  useEffect(() => {
    const obs = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target
        ) {
          view?.dispatch({
            effects: currentThemeCompartment.reconfigure(
              document.querySelector('html.dark') ? hasuraDark : hasuraLight
            ),
          });
        }
      });
    });
    setObserver(obs);
  }, [setObserver, view]);

  switch (theme) {
    case 'light':
      getExtensions.push(currentThemeCompartment.of(hasuraLight));
      break;
    case 'dark':
      getExtensions.push(currentThemeCompartment.of(hasuraDark));
      break;
    case 'none':
      getExtensions.push(
        currentThemeCompartment.of(
          document.querySelector('html.dark') ? hasuraDark : hasuraLight
        )
      );
      break;
    default:
      getExtensions.push(currentThemeCompartment.of(hasuraLight));
      break;
  }

  useEffect(() => {
    if (!observer) return;
    const element = document.querySelector('html');
    if (element) {
      observer.observe(element, { attributes: true });
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  if (editable === false) {
    getExtensions.push(EditorView.editable.of(false));
  }
  if (readOnly) {
    getExtensions.push(EditorState.readOnly.of(true));
  }

  if (onUpdate && typeof onUpdate === 'function') {
    getExtensions.push(EditorView.updateListener.of(onUpdate));
  }
  getExtensions = getExtensions.concat(extensions);

  useEffect(() => {
    if (container && !state) {
      const config = {
        doc: value,
        selection,
        extensions: getExtensions,
      };
      const stateCurrent = initialState
        ? EditorState.fromJSON(initialState.json, config, initialState.fields)
        : EditorState.create(config);
      setState(stateCurrent);
      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
          root,
        });
        setView(viewCurrent);
        onCreateEditor && onCreateEditor(viewCurrent, stateCurrent);
      }
    }
    return () => {
      if (view) {
        setState(undefined);
        setView(undefined);
      }
    };
  }, [container, state]);

  useEffect(() => setContainer(props.container!), [props.container]);

  useEffect(
    () => () => {
      if (view) {
        view.destroy();
        setView(undefined);
      }
    },
    [view]
  );

  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);

  useEffect(() => {
    if (view) {
      view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    extensions,
    height,
    minHeight,
    maxHeight,
    width,
    minWidth,
    maxWidth,
    placeholderStr,
    editable,
    readOnly,
    defaultIndentWithTab,
    defaultBasicSetup,
    onChange,
    onUpdate,
  ]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    const currentValue = view ? view.state.doc.toString() : '';
    if (view && value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || '' },
        annotations: [External.of(true)],
      });
    }
  }, [value, view]);

  return { state, setState, view, setView, container, setContainer };
}
