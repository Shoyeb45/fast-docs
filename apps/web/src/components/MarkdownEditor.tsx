// components/MarkdownEditorPanel.tsx
"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { yCollab } from "y-codemirror.next";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Collaborative mode props
interface CollaborativeEditorProps {
  mode: "collaborative";
  ytext: Y.Text;
  provider: WebsocketProvider;
  onContentChange?: (content: string) => void;
}

// Standalone mode props
interface StandaloneEditorProps {
  mode: "standalone";
  initialValue?: string;
  onContentChange: (content: string) => void;
}

type MarkdownEditorPanelProps = CollaborativeEditorProps | StandaloneEditorProps;

export interface EditorHandle {
  insertMarkdown: (text: string) => void;
  getContent: () => string;
  focus: () => void;
}

export const MarkdownEditorPanel = forwardRef<EditorHandle, MarkdownEditorPanelProps>(
  (props, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      insertMarkdown: (text: string) => {
        if (viewRef.current) {
          const { state, dispatch } = viewRef.current;
          const { from, to } = state.selection.main;
          dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + text.length },
          });
          viewRef.current.focus();
        }
      },
      getContent: () => {
        return viewRef.current?.state.doc.toString() || "";
      },
      focus: () => {
        viewRef.current?.focus();
      },
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      const extensions = [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.theme({
          "&": {
            backgroundColor: "#0d1117",
            height: "100%",
          },
          ".cm-scroller": {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            lineHeight: "1.6",
            backgroundColor: "#0d1117"
          },
          ".cm-content": {
            caretColor: "#58a6ff",
            padding: "16px 0",
          },
          ".cm-line": {
            padding: "0 16px",
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(88, 166, 255, 0.06)",
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            borderRight: "1px solid #30363d",
            color: "#8b949e",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "rgba(88, 166, 255, 0.1)",
          },
          ".cm-ySelectionInfo": {
            fontSize: "11px",
            fontFamily: "var(--font-outfit)",
            padding: "2px 6px",
            borderRadius: "4px",
            opacity: "1 !important",
          },
        }),
      ];

      let initialDoc = "";

      // Add mode-specific extensions
      if (props.mode === "collaborative") {
        initialDoc = props.ytext.toString();
        extensions.push(yCollab(props.ytext, props.provider.awareness));
        
        if (props.onContentChange) {
          extensions.push(
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                props.onContentChange!(update.state.doc.toString());
              }
            })
          );
        }
      } else {
        // Standalone mode
        initialDoc = props.initialValue || "";
        extensions.push(
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              props.onContentChange(update.state.doc.toString());
            }
          })
        );
      }

      const state = EditorState.create({
        doc: initialDoc,
        extensions,
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // Only recreate editor when mode changes or collaboration objects change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      props.mode,
      // Only include these for collaborative mode
      ...(props.mode === "collaborative" ? [props.ytext, props.provider] : [])
    ]);

    return (
      <div className="h-full bg-[#0d1117] overflow-hidden">
        <div ref={editorRef} className="h-full w-full" />
      </div>
    );
  }
);

MarkdownEditorPanel.displayName = "MarkdownEditorPanel";

// Hook for using editor actions (alternative to ref)
export function useEditorActions(viewRef: React.RefObject<EditorView | null>) {
  const insertMarkdown = (text: string) => {
    if (viewRef.current) {
      const { state, dispatch } = viewRef.current;
      const { from, to } = state.selection.main;
      dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      viewRef.current.focus();
    }
  };

  const getContent = () => {
    return viewRef.current?.state.doc.toString() || "";
  };

  const focus = () => {
    viewRef.current?.focus();
  };

  return { insertMarkdown, getContent, focus };
}