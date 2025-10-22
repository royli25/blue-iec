import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { Editor } from "@tiptap/react";

interface EditorBridgeContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const EditorBridgeContext = createContext<EditorBridgeContextValue | undefined>(undefined);

export function EditorBridgeProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);

  const value = useMemo(() => ({ editor, setEditor }), [editor]);

  return (
    <EditorBridgeContext.Provider value={value}>{children}</EditorBridgeContext.Provider>
  );
}

export function useEditorBridge(): EditorBridgeContextValue {
  const ctx = useContext(EditorBridgeContext);
  if (!ctx) throw new Error("useEditorBridge must be used within EditorBridgeProvider");
  return ctx;
}


