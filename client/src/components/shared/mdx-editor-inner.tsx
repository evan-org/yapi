"use client";

/**
 * MDXEditor 客户端实现（Lexical 内核，须在浏览器端初始化插件）
 */
import { useEffect, useRef } from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertTable,
  ListsToggle,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const editorPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "json" }),
  tablePlugin(),
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <UndoRedo />
        <Separator />
        <BlockTypeSelect />
        <Separator />
        <BoldItalicUnderlineToggles />
        <CodeToggle />
        <ListsToggle />
        <Separator />
        <CreateLink />
        <InsertCodeBlock />
        <InsertTable />
      </>
    ),
  }),
];

export interface MdxEditorInnerProps
  extends Omit<MDXEditorProps, "plugins" | "markdown" | "onChange"> {
  /** 外部受控 markdown，与表单/接口数据同步 */
  value: string;
  onChange: (value: string) => void;
  editorRef?: React.Ref<MDXEditorMethods | null>;
}

export default function MdxEditorInner({
  value,
  onChange,
  editorRef,
  className,
  contentEditableClassName,
  placeholder = "支持 Markdown 语法，可使用标题、列表、代码块、表格等",
  ...rest
}: MdxEditorInnerProps) {
  const innerRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    const api = innerRef.current;
    if (!api) return;
    const current = api.getMarkdown();
    if (current !== value) {
      api.setMarkdown(value);
    }
  }, [value]);

  return (
    <MDXEditor
      ref={(instance) => {
        innerRef.current = instance;
        if (typeof editorRef === "function") {
          editorRef(instance);
        } else if (editorRef && "current" in editorRef) {
          (editorRef as React.MutableRefObject<MDXEditorMethods | null>).current =
            instance;
        }
      }}
      plugins={editorPlugins}
      className={className}
      contentEditableClassName={contentEditableClassName}
      placeholder={placeholder}
      {...rest}
      markdown={value}
      onChange={(md, initialNormalize) => {
        if (initialNormalize) return;
        onChange(md);
      }}
    />
  );
}
