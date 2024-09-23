import { PromiseType } from '@/utils/js-utils';

export const loadAutocomplete = async () => {
  try {
    const module = await import('@codemirror/autocomplete');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/autocomplete:', e);
    throw e;
  }
};

export const loadCommands = async () => {
  try {
    const module = await import('@codemirror/commands');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/commands:', e);
    throw e;
  }
};

export const loadLangJavascript = async () => {
  try {
    const module = await import('@codemirror/lang-javascript');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/lang-javascript:', e);
    throw e;
  }
};

export const loadLangPython = async () => {
  try {
    const module = await import('@codemirror/lang-python');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/lang-python:', e);
    throw e;
  }
};

export const loadLangJson = async () => {
  try {
    const module = await import('@codemirror/lang-json');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/lang-json:', e);
    throw e;
  }
};

export const loadLanguage = async () => {
  try {
    const module = await import('@codemirror/language');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/language:', e);
    throw e;
  }
};

export const loadSqlModes = async () => {
  try {
    const module = await import('@codemirror/legacy-modes/mode/sql');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/legacy-modes/mode/sql:', e);
    throw e;
  }
};
export const loadPythonModes = async () => {
  try {
    const module = await import('@codemirror/legacy-modes/mode/python');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/legacy-modes/mode/python:', e);
    throw e;
  }
};

export const loadLint = async () => {
  try {
    const module = await import('@codemirror/lint');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/lint:', e);
    throw e;
  }
};

export const loadSearch = async () => {
  try {
    const module = await import('@codemirror/search');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/search:', e);
    throw e;
  }
};

export const loadState = async () => {
  try {
    const module = await import('@codemirror/state');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/state:', e);
    throw e;
  }
};

export const loadThemeOneDark = async () => {
  try {
    const module = await import('@codemirror/theme-one-dark');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/theme-one-dark:', e);
    throw e;
  }
};

export const loadView = async () => {
  try {
    const module = await import('@codemirror/view');
    return module;
  } catch (e) {
    console.error('Error loading @codemirror/view:', e);
    throw e;
  }
};

export const loadCodeMirror = async () => {
  const autocomplete = await loadAutocomplete();
  const commands = await loadCommands();
  const langJavascript = await loadLangJavascript();
  const langPython = await loadLangPython();
  const langJson = await loadLangJson();
  const language = await loadLanguage();
  const sqlModes = await loadSqlModes();
  const pythonModes = await loadPythonModes();
  const lint = await loadLint();
  const search = await loadSearch();
  const state = await loadState();
  const themeOneDark = await loadThemeOneDark();
  const view = await loadView();

  return {
    autocomplete,
    commands,
    langJavascript,
    langJson,
    langPython,
    language,
    sqlModes,
    pythonModes,
    lint,
    search,
    state,
    themeOneDark,
    view,
  };
};

export type CodeMirrorModules = PromiseType<ReturnType<typeof loadCodeMirror>>;
