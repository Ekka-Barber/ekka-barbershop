
// This is a simple polyfill/stub for monaco editor
// to help with build when the package is not available

export const createMonacoEditorPolyfill = () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Create stub for monaco namespace
    window.monaco = window.monaco || {
      editor: {
        create: () => ({
          dispose: () => {},
          onDidChangeModelContent: () => ({ dispose: () => {} }),
          getValue: () => '',
          setValue: () => {},
          getModel: () => ({ updateOptions: () => {} }),
          updateOptions: () => {}
        }),
        createModel: () => ({})
      },
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: () => {}
          }
        }
      }
    };
  }
};
