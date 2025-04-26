
declare module '@monaco-editor/react' {
  import React from 'react';
  
  interface EditorProps {
    height?: string | number;
    width?: string | number;
    value?: string;
    defaultValue?: string;
    language?: string;
    defaultLanguage?: string;
    theme?: string;
    options?: object;
    loading?: JSX.Element;
    path?: string;
    onMount?: (editor: any, monaco: any) => void;
    onChange?: (value: string | undefined, event: any) => void;
    onValidate?: (markers: any[]) => void;
  }
  
  const Editor: React.FC<EditorProps>;
  
  export function useMonaco(): any;
  export default Editor;
}

declare module 'monaco-editor' {
  export namespace editor {
    type IStandaloneCodeEditor = any;
  }
}
