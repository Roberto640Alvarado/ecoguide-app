"use client";

import { useEffect, useId, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapUnderline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold as BoldIcon,
  Code as CodeIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`size-8 inline-flex shrink-0 justify-center items-center rounded-full focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none ${
        isActive
          ? "bg-accent-soft text-accent-soft-foreground"
          : "text-foreground hover:bg-muted-hover"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Editor de texto enriquecido (Tiptap) con la barra de herramientas estilo
 * Preline UI, adaptado a React/Next.js (useEditor) en vez del bootstrap
 * vanilla-JS + CDN del snippet original. Guarda/recibe el contenido como
 * HTML (string), sanitizado en el servidor antes de guardarse y de nuevo en
 * cliente antes de renderizarse (ver lib/utils/rich-text.ts).
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
}: RichTextEditorProps) {
  const editorId = `rte-${useId().replace(/:/g, "")}`;

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: editorId,
        class:
          "min-h-32 sm:min-h-40 max-h-96 overflow-y-auto p-3 text-sm text-foreground focus:outline-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: { HTMLAttributes: { class: "list-disc ps-5" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ps-5" } },
        blockquote: {
          HTMLAttributes: { class: "border-s-4 border-line-2 ps-4 italic" },
        },
      }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-accent underline underline-offset-2" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Sincroniza cambios externos (ej. al cargar defaultValues en el
  // formulario de edición) sin pisar lo que el usuario está escribiendo.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt("URL", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={editorId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={`bg-layer border rounded-lg overflow-hidden ${
          error ? "border-danger" : "border-layer-line"
        }`}
      >
        {editor && (
          <div className="flex flex-wrap items-center gap-x-0.5 border-b border-layer-line p-2">
            <ToolbarButton
              label="Bold"
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <BoldIcon className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Underline"
              isActive={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Strikethrough"
              isActive={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton label="Link" isActive={editor.isActive("link")} onClick={setLink}>
              <LinkIcon className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Ordered list"
              isActive={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Bullet list"
              isActive={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Blockquote"
              isActive={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Code"
              isActive={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <CodeIcon className="size-4 shrink-0" aria-hidden="true" />
            </ToolbarButton>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
