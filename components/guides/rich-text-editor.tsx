"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import {
  Bold, Italic, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your guide here…",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", class: "text-blue-600 underline" },
      }),
      Placeholder.configure({ placeholder }),
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap prose-content min-h-64 outline-none",
        "aria-label": "Guide content editor",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const href = window.prompt("URL:");
    if (href === null) return;
    if (href === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor!.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
  }

  return (
    <div className="overflow-hidden rounded-b-lg">
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-0.5 border-b border-slate-100 bg-slate-50 p-2"
        role="toolbar"
        aria-label="Text formatting"
      >
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (⌘B)"
            aria-label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (⌘I)"
            aria-label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
            aria-label="Code"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <div className="mx-1 w-px self-stretch bg-slate-200" aria-hidden="true" />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
            aria-label="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
            aria-label="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <div className="mx-1 w-px self-stretch bg-slate-200" aria-hidden="true" />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
            aria-label="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
            aria-label="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
            aria-label="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
            aria-label="Horizontal rule"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title="Add link"
            aria-label="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <div className="mx-1 w-px self-stretch bg-slate-200" aria-hidden="true" />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (⌘Z)"
            aria-label="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (⌘⇧Z)"
            aria-label="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      {...rest}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
        "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-slate-200 text-slate-900"
      )}
    >
      {children}
    </button>
  );
}
