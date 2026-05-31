import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useProfileStore } from '../store/useDataStore';

const defaultLatex = `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\begin{document}
\\begin{center}
    {\\huge \\textbf{Your Name}} \\\\
    your.email@example.com $\\vert$ (123) 456-7890 $\\vert$ LinkedIn $\\vert$ GitHub
\\end{center}

\\section*{Experience}
\\textbf{Software Engineer} \\hfill 2023 - Present\\\\
\\textit{Tech Company, City, State}
\\begin{itemize}
    \\item Built a highly scalable web application using React and Node.js.
    \\item Improved ATS score by 40\\% through intelligent keyword optimization.
\\end{itemize}

\\end{document}`;

const Builder: React.FC = () => {
  const { latexCode, setLatexCode } = useProfileStore();
  const formRef = useRef<HTMLFormElement>(null);

  const handleCompile = () => {
    if (formRef.current) formRef.current.submit();
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-gradient">Resume Builder Workspace</h1>
        <button className="btn btn-primary" onClick={handleCompile}>Compile PDF</button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Overleaf-style Editor */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>LaTeX Source</h3>
          </div>
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="latex"
              theme="vs-dark"
              value={latexCode}
              onChange={(value) => setLatexCode(value || '')}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 14,
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Live PDF Preview</h3>
          </div>
          <div style={{ flex: 1, background: '#525659', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            
            {/* Hidden form for compilation */}
            <form 
              ref={formRef} 
              method="POST" 
              action="https://texlive.net/cgi-bin/latexcgi" 
              target="pdf-iframe" 
              encType="multipart/form-data"
              style={{ display: 'none' }}
            >
              <input type="hidden" name="filecontents[]" value={latexCode} />
              <input type="hidden" name="filename[]" value="document.tex" />
              <input type="hidden" name="engine" value="pdflatex" />
              <input type="hidden" name="return" value="pdf" />
            </form>

            <iframe 
              name="pdf-iframe"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
