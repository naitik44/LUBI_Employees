const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add Reorder button to UI (Next to Add Employee button)
content = content.replace('<button class="add" id="addEmployee">+ Add Another Employee</button>', '<button class="add" id="addEmployee" style="margin-bottom:10px;">+ Add Another Employee</button>\n        <button class="add" id="reorderBtn" style="border-style: solid; background: rgba(255,255,255,0.05); color: var(--text-main); border-color: var(--border-color);">⇅ Reorder Employees</button>');

// 2. Add Reorder Modal HTML
const reorderModalHtml = `
<div id="reorderModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
  <div style="background:var(--panel-bg); padding:24px; border-radius:16px; width:400px; max-width:90%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid var(--border-color);">
    <h3 style="margin-top:0; color:var(--text-main); font-size:18px; font-weight:700; margin-bottom:20px;">Reorder Employees</h3>
    <ul id="reorderList" style="list-style:none; padding:0; margin:0; max-height:60vh; overflow-y:auto; gap:8px; display:flex; flex-direction:column;">
    </ul>
    <div style="margin-top:24px; display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn" id="reorderCancelBtn">Cancel</button>
      <button class="btn primary" id="reorderSaveBtn">Save Order</button>
    </div>
  </div>
</div>
`;
content = content.replace('</body>', reorderModalHtml + '\n</body>');

// 3. Add CSS for Reorder items
const reorderCss = `
  #reorderList li {
    padding: 12px 16px;
    background: var(--input-bg);
    color: var(--input-color);
    border-radius: 10px;
    cursor: grab;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    transition: all 0.2s;
  }
  #reorderList li:hover { background: rgba(59,130,246,0.1); }
  #reorderList li.dragging { opacity: 0.5; border-color: var(--primary); transform: scale(0.98); }
`;
content = content.replace('</style>', reorderCss + '\n</style>');

// 4. Add JS logic
const reorderJs = `
let tempOrder = [];
let reorderDragStartIndex = null;

$("reorderBtn").addEventListener("click", () => {
  tempOrder = [...state.employees];
  renderReorderList();
  $("reorderModal").style.display = "flex";
});

function renderReorderList() {
  const list = $("reorderList");
  list.innerHTML = "";
  tempOrder.forEach((emp, i) => {
    const li = document.createElement("li");
    li.draggable = true;
    li.innerHTML = \`<span style="color:var(--text-muted); cursor:grab;">☰</span> <strong>\${escapeHtml(emp.name || 'Unnamed')}</strong> <span style="color:var(--text-muted); font-size:12px;">\${escapeHtml(emp.role)}</span>\`;
    
    li.addEventListener("dragstart", function(e) {
      reorderDragStartIndex = i;
      this.classList.add("dragging");
    });
    li.addEventListener("dragover", function(e) {
      e.preventDefault();
      this.style.borderTop = "3px solid var(--primary)";
    });
    li.addEventListener("dragleave", function(e) {
      this.style.borderTop = "1px solid var(--border-color)";
    });
    li.addEventListener("drop", function(e) {
      e.preventDefault();
      this.style.borderTop = "1px solid var(--border-color)";
      if (reorderDragStartIndex !== null && reorderDragStartIndex !== i) {
        const item = tempOrder.splice(reorderDragStartIndex, 1)[0];
        tempOrder.splice(i, 0, item);
        renderReorderList();
      }
    });
    li.addEventListener("dragend", function(e) {
      this.classList.remove("dragging");
    });
    
    list.appendChild(li);
  });
}

$("reorderCancelBtn").addEventListener("click", () => {
  $("reorderModal").style.display = "none";
});

$("reorderSaveBtn").addEventListener("click", () => {
  state.employees = [...tempOrder];
  renderEditors();
  renderPreview();
  $("reorderModal").style.display = "none";
});
`;

content = content.replace('loadDraft();', reorderJs + '\nloadDraft();');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Reorder popup added successfully');
