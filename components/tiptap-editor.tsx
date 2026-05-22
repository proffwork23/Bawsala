"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Italic,
  List,
  Link as LinkIcon,
  Strikethrough,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className="h-8 px-2"
      onClick={onClick}
      title={label}
    >
      {children}
    </Button>
  );
}

export function TipTapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] rounded-b-xl border border-t-0 bg-white p-4 text-right outline-none font-[var(--font-amiri)] text-[18px] leading-9",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 rounded-t-xl border bg-slate-50 p-2">
        <ToolButton
          label="عريض"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="مائل"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="مشطوب"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="عنوان 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="عنوان 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="قائمة نقطية"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="كود"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          label="إضافة رابط"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("أدخل الرابط");
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

