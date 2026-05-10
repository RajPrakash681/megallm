const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadSection = document.getElementById('upload-section');
const chatSection = document.getElementById('chat-section');
const uploadStatus = document.getElementById('upload-status');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const docName = document.getElementById('doc-name');
const docStats = document.getElementById('doc-stats');

let currentCollectionId = null;

// File Upload Handlers
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFileUpload(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFileUpload(e.target.files[0]);
  }
});

async function handleFileUpload(file) {
  if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
    alert('Please upload a PDF or TXT file.');
    return;
  }

  // UI state change
  dropZone.classList.add('hidden');
  uploadStatus.classList.remove('hidden');
  docName.textContent = file.name;

  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Upload failed');

    // Success
    currentCollectionId = data.collectionId;
    docStats.textContent = `${data.pageCount} Pages | ${data.chunkCount} Chunks`;
    
    // Switch to chat view
    uploadSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    alert(error.message);
    dropZone.classList.remove('hidden');
    uploadStatus.classList.add('hidden');
  }
}

// Chat Handlers
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question || !currentCollectionId) return;

  // Add user message
  appendMessage(question, 'user-msg');
  chatInput.value = '';

  // Add loading message
  const loadingId = 'msg-' + Date.now();
  appendMessage('Thinking...', 'system-msg', loadingId);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, collectionId: currentCollectionId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get answer');

    // Remove loading and add real answer
    document.getElementById(loadingId).remove();
    
    let answerHtml = data.answer;
    if (data.sources && data.sources.length) {
      answerHtml += `<br><br><small style="color:var(--primary)">Sources: Page(s) ${data.sources.join(', ')}</small>`;
    }
    
    appendMessageHTML(answerHtml, 'system-msg');
  } catch (error) {
    console.error(error);
    document.getElementById(loadingId).innerText = 'Error: ' + error.message;
  }
});

function appendMessage(text, className, id = null) {
  const div = document.createElement('div');
  div.className = `message ${className}`;
  div.textContent = text;
  if (id) div.id = id;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendMessageHTML(html, className) {
  const div = document.createElement('div');
  div.className = `message ${className}`;
  div.innerHTML = html;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
