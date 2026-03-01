// ── Tab navigation ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ── Helpers ──────────────────────────────────────────────────────
function setLoading(btn, loading) {
  if (loading) btn.classList.add('loading'), btn.disabled = true;
  else btn.classList.remove('loading'), btn.disabled = false;
}

function showError(el, msg) {
  el.className = 'result-area error';
  el.textContent = '⚠️ ' + msg;
}

function showDownload(el, blob, filename) {
  el.className = 'result-area';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.className = 'download-btn';
  a.innerHTML = '<span class="dl-icon">⬇️</span> Tải file kết quả: ' + filename;
  el.innerHTML = '';
  el.appendChild(a);
}

function getFilename(original, contentDisposition) {
  if (contentDisposition) {
    const m = contentDisposition.match(/filename="(.+)"/);
    if (m) return m[1];
  }
  return 'ketqua_' + original;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// ── PDF ↔ DOCX ───────────────────────────────────────────────────
const docDropZone   = document.getElementById('doc-drop-zone');
const docFileInput  = document.getElementById('doc-file-input');
const docFileInfo   = document.getElementById('doc-file-info');
const docFileName   = document.getElementById('doc-file-name');
const docFileClear  = document.getElementById('doc-file-clear');
const docDirection  = document.getElementById('doc-conv-direction');
const docFromBadge  = document.getElementById('doc-from-badge');
const docToBadge    = document.getElementById('doc-to-badge');
const btnConvertDoc = document.getElementById('btn-convert-doc');
const resultDoc     = document.getElementById('result-doc');

let docSelectedFile = null;

function setDocFile(file) {
  if (!file) return;
  docSelectedFile = file;
  const ext = file.name.split('.').pop().toLowerCase();
  docFileName.textContent = file.name + '  (' + formatSize(file.size) + ')';
  docFileInfo.classList.add('visible');
  if (ext === 'pdf') {
    docFromBadge.textContent = 'PDF';
    docToBadge.textContent = 'DOCX';
    docDirection.classList.remove('hidden');
    btnConvertDoc.disabled = false;
  } else if (ext === 'docx') {
    docFromBadge.textContent = 'DOCX';
    docToBadge.textContent = 'PDF';
    docDirection.classList.remove('hidden');
    btnConvertDoc.disabled = false;
  } else {
    docDirection.classList.add('hidden');
    btnConvertDoc.disabled = true;
    showError(resultDoc, 'Chỉ hỗ trợ file .PDF hoặc .DOCX');
  }
  resultDoc.className = 'result-area';
  resultDoc.innerHTML = '';
}

docFileInput.addEventListener('change', () => { if (docFileInput.files[0]) setDocFile(docFileInput.files[0]); });

docDropZone.addEventListener('dragover', e => { e.preventDefault(); docDropZone.classList.add('dragover'); });
docDropZone.addEventListener('dragleave', () => docDropZone.classList.remove('dragover'));
docDropZone.addEventListener('drop', e => {
  e.preventDefault();
  docDropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) { docFileInput.files = e.dataTransfer.files; setDocFile(file); }
});

docFileClear.addEventListener('click', () => {
  docSelectedFile = null;
  docFileInput.value = '';
  docFileInfo.classList.remove('visible');
  docDirection.classList.add('hidden');
  btnConvertDoc.disabled = true;
  resultDoc.className = 'result-area';
  resultDoc.innerHTML = '';
});

btnConvertDoc.addEventListener('click', async () => {
  if (!docSelectedFile) return;
  setLoading(btnConvertDoc, true);
  resultDoc.className = 'result-area';
  resultDoc.innerHTML = '';
  const formData = new FormData();
  formData.append('file', docSelectedFile);
  try {
    const res = await fetch('/api/convert-doc', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    const blob = await res.blob();
    const filename = getFilename(docSelectedFile.name, res.headers.get('content-disposition'));
    showDownload(resultDoc, blob, filename);
  } catch (err) {
    showError(resultDoc, err.error || err.detail || 'Có lỗi xảy ra khi chuyển đổi!');
  } finally {
    setLoading(btnConvertDoc, false);
  }
});

// ── Image conversion ─────────────────────────────────────────────
const imgDropZone   = document.getElementById('img-drop-zone');
const imgFileInput  = document.getElementById('img-file-input');
const imgFileInfo   = document.getElementById('img-file-info');
const imgFileName   = document.getElementById('img-file-name');
const imgFileClear  = document.getElementById('img-file-clear');
const formImage     = document.getElementById('form-image');
const btnConvertImg = document.getElementById('btn-convert-img');
const resultImage   = document.getElementById('result-image');

let imgSelectedFile = null;

function setImgFile(file) {
  imgSelectedFile = file;
  imgFileName.textContent = file.name + '  (' + formatSize(file.size) + ')';
  imgFileInfo.classList.add('visible');
  btnConvertImg.disabled = false;
  resultImage.className = 'result-area';
  resultImage.innerHTML = '';
}

imgFileInput.addEventListener('change', () => { if (imgFileInput.files[0]) setImgFile(imgFileInput.files[0]); });

imgDropZone.addEventListener('dragover', e => { e.preventDefault(); imgDropZone.classList.add('dragover'); });
imgDropZone.addEventListener('dragleave', () => imgDropZone.classList.remove('dragover'));
imgDropZone.addEventListener('drop', e => {
  e.preventDefault();
  imgDropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) { imgFileInput.files = e.dataTransfer.files; setImgFile(file); }
});

imgFileClear.addEventListener('click', () => {
  imgSelectedFile = null;
  imgFileInput.value = '';
  imgFileInfo.classList.remove('visible');
  btnConvertImg.disabled = true;
  resultImage.className = 'result-area';
  resultImage.innerHTML = '';
});

formImage.addEventListener('submit', async e => {
  e.preventDefault();
  if (!imgSelectedFile) return;
  setLoading(btnConvertImg, true);
  resultImage.className = 'result-area';
  resultImage.innerHTML = '';
  const formData = new FormData(formImage);
  formData.append('image', imgSelectedFile);
  try {
    const res = await fetch('/api/convert-image', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    const blob = await res.blob();
    const filename = getFilename(imgSelectedFile.name, res.headers.get('content-disposition'));
    showDownload(resultImage, blob, filename);
  } catch (err) {
    showError(resultImage, err.error || err.detail || 'Có lỗi xảy ra khi chuyển đổi ảnh!');
  } finally {
    setLoading(btnConvertImg, false);
  }
});

// ── TikTok downloader ─────────────────────────────────────────────
const formTiktok   = document.getElementById('form-tiktok');
const btnTiktok    = document.getElementById('btn-tiktok');
const resultTiktok = document.getElementById('result-tiktok');

formTiktok.addEventListener('submit', async e => {
  e.preventDefault();
  const url = formTiktok.url.value.trim();
  setLoading(btnTiktok, true);
  resultTiktok.className = 'result-area';
  resultTiktok.innerHTML = '';
  try {
    const res = await fetch('/api/download-tiktok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    const blob = await res.blob();
    showDownload(resultTiktok, blob, 'tiktok_video.mp4');
  } catch (err) {
    showError(resultTiktok, err.error || err.detail || 'Có lỗi khi tải video TikTok!');
  } finally {
    setLoading(btnTiktok, false);
  }
}); 