import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import './RichTextEditor.css';

function ToolbarBtn({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
                active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export default function RichTextEditor({ value, onChange, placeholder }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
        ],
        content: value,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-gray-400 transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/80 flex-wrap">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <strong>B</strong>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <em>I</em>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <s>S</s>
                </ToolbarBtn>

                <Divider />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <span className="text-xs font-bold">H2</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <span className="text-xs font-bold">H3</span>
                </ToolbarBtn>

                <Divider />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                        <path d="M4 6h1v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4 10h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M3 14h1.5a.5.5 0 0 1 0 1H3.5a.5.5 0 0 0 0 1H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </ToolbarBtn>

                <Divider />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                    </svg>
                </ToolbarBtn>

                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                    </svg>
                </ToolbarBtn>

                <Divider />

                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                    </svg>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
                    </svg>
                </ToolbarBtn>
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} className="rich-editor" />
        </div>
    );
}
