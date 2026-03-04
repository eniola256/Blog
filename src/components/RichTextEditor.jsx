import { useRef, useState, useEffect } from "react";
import "./RichTextEditor.css";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set initial content after render
  useEffect(() => {
    if (editorRef.current && value && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle content change
  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Execute formatting command
  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  // Insert heading
  const insertHeading = (level) => {
    const heading = `<h${level}>Heading ${level}</h${level}><p></p>`;
    format("insertHTML", heading);
  };

  // Insert image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgTag = `<img src="${event.target.result}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" /><p></p>`;
        format("insertHTML", imgTag);
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      format("createLink", url);
    }
  };

  // Insert blockquote
  const insertBlockquote = () => {
    const quote = `<blockquote style="border-left: 4px solid #f97316; padding-left: 1rem; margin: 1rem 0; color: #666; font-style: italic;">Enter your quote here...</blockquote><p></p>`;
    format("insertHTML", quote);
  };

  // Insert code block
  const insertCodeBlock = () => {
    const code = `<pre style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0;"><code>Enter your code here...</code></pre><p></p>`;
    format("insertHTML", code);
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" onClick={() => format("bold")} title="Bold">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => format("italic")} title="Italic">
            <em>I</em>
          </button>
          <button type="button" onClick={() => format("underline")} title="Underline">
            <u>U</u>
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button type="button" onClick={() => insertHeading(1)} title="Heading 1">
            H1
          </button>
          <button type="button" onClick={() => insertHeading(2)} title="Heading 2">
            H2
          </button>
          <button type="button" onClick={() => insertHeading(3)} title="Heading 3">
            H3
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button type="button" onClick={() => format("insertUnorderedList")} title="Bullet List">
            •
          </button>
          <button type="button" onClick={() => format("insertOrderedList")} title="Numbered List">
            1.
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button type="button" onClick={insertLink} title="Insert Link">
            🔗
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Insert Image">
            🖼️
          </button>
          <button type="button" onClick={insertBlockquote} title="Quote">
            ❝
          </button>
          <button type="button" onClick={insertCodeBlock} title="Code Block">
            {'</>'}
          </button>
        </div>
      </div>

      {/* Hidden file input for images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleChange}
        onBlur={(e) => onChange(e.target.innerHTML)}
        placeholder={placeholder || "Write your content here..."}
      />
    </div>
  );
}
