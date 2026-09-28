const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS variables for Light Mode and Animations
content = content.replace(':root {', `:root {
    --bg-grad-1: #1e293b;
    --bg-grad-2: #0f172a;
    --input-bg: rgba(0, 0, 0, 0.2);
    --input-color: white;`);

content = content.replace('  }\n  * { box-sizing: border-box; }', `  }
  .theme-light {
    --bg-dark: #f1f5f9;
    --panel-bg: rgba(255, 255, 255, 0.9);
    --border-color: rgba(0, 0, 0, 0.1);
    --text-main: #0f172a;
    --text-muted: #64748b;
    --bg-grad-1: #ffffff;
    --bg-grad-2: #e2e8f0;
    --input-bg: #ffffff;
    --input-color: #0f172a;
  }
  * { box-sizing: border-box; }`);

content = content.replace(
  'background-image: radial-gradient(circle at 0% 0%, #1e293b 0%, #0f172a 100%);',
  'background-image: radial-gradient(circle at 0% 0%, var(--bg-grad-1) 0%, var(--bg-grad-2) 100%);\n    transition: background 0.3s ease, color 0.3s ease;'
);

// Update input background
content = content.replace('background: rgba(0, 0, 0, 0.2); color: white;', 'background: var(--input-bg); color: var(--input-color);');
content = content.replace('border: 1px dashed rgba(255,255,255,0.2);', 'border: 1px dashed var(--border-color); color: var(--text-muted);');

// Animations CSS
content = content.replace('</style>', `
  .employee-editor { transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease; }
  .employee-editor.dragging { opacity: 0.4; transform: scale(0.98); box-shadow: 0 0 20px rgba(59,130,246,0.2); border-color: var(--primary); }
  .employee-editor.drag-over { border-top: 3px dashed var(--primary); }
  @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .employee-editor { animation: slideIn 0.3s ease; }
</style>`);

// 2. Add Theme Toggle Button & Loading Spinner text
content = content.replace('<button class="btn" id="saveBtn">Save Draft</button>', '<button class="btn" id="themeToggleBtn">☀️ Light Mode</button>\n      <button class="btn" id="saveBtn">Save Draft</button>');

// 3. Add Cropper Zoom/Rotate HTML
content = content.replace('<button class="btn" id="cropCancelBtn">Cancel</button>', `<button class="btn" id="cropZoomIn">+ Zoom</button>
        <button class="btn" id="cropZoomOut">- Zoom</button>
        <button class="btn" id="cropRotate">Rotate</button>
        <div style="flex:1"></div>
        <button class="btn" id="cropCancelBtn">Cancel</button>`);

// 4. JS for Dark Mode Toggle
let jsInjections = `
$("themeToggleBtn").addEventListener("click", () => {
  document.body.classList.toggle("theme-light");
  const isLight = document.body.classList.contains("theme-light");
  localStorage.setItem("lubiTheme", isLight ? "light" : "dark");
  $("themeToggleBtn").textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
});
if(localStorage.getItem("lubiTheme") === "light") {
  document.body.classList.add("theme-light");
  $("themeToggleBtn").textContent = "🌙 Dark Mode";
}
`;
content = content.replace('loadDraft();', jsInjections + '\nloadDraft();');

// 5. JS for Cropper Controls
let cropperJs = `
$("cropZoomIn").addEventListener("click", () => { if(currentCropper) currentCropper.zoom(0.1); });
$("cropZoomOut").addEventListener("click", () => { if(currentCropper) currentCropper.zoom(-0.1); });
$("cropRotate").addEventListener("click", () => { if(currentCropper) currentCropper.rotate(45); });
`;
content = content.replace('loadDraft();', cropperJs + '\nloadDraft();');

// 6. JS for Drag and Drop in renderEditors
let dndJS = `
  let dragStartIndex = null;
  document.querySelectorAll(".employee-editor").forEach(div => {
    div.addEventListener("dragstart", function(e) {
      dragStartIndex = Number(this.dataset.index);
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    div.addEventListener("dragover", function(e) {
      e.preventDefault();
      this.classList.add("drag-over");
    });
    div.addEventListener("dragleave", function(e) {
      this.classList.remove("drag-over");
    });
    div.addEventListener("drop", function(e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      const dragEndIndex = Number(this.dataset.index);
      if(dragStartIndex !== null && dragStartIndex !== dragEndIndex) {
        const item = state.employees.splice(dragStartIndex, 1)[0];
        state.employees.splice(dragEndIndex, 0, item);
        renderEditors();
        renderPreview();
      }
    });
    div.addEventListener("dragend", function(e) {
      this.classList.remove("dragging");
    });
  });
`;

let renderEditorsFunc = content.match(/function renderEditors\(\)\{[\s\S]*?\}\n/)[0];
let newRenderEditorsFunc = renderEditorsFunc.replace('box.querySelectorAll("input[data-field]").forEach', dndJS + '\n  box.querySelectorAll("input[data-field]").forEach');
newRenderEditorsFunc = newRenderEditorsFunc.replace('<div class="employee-editor">', '<div class="employee-editor" draggable="true" data-index="${i}">');
content = content.replace(renderEditorsFunc, newRenderEditorsFunc);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Modifications complete');
