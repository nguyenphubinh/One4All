// Xử lý chuyển đổi PDF <-> DOCX
const formDoc = document.getElementById('form-doc');
formDoc.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formDoc);
  document.getElementById('result-doc').textContent = 'Đang xử lý...';
  try {
    const res = await fetch('http://localhost:3001/api/convert-doc', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw await res.json();
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadName(formData.get('file').name, res.headers.get('content-disposition'));
    a.textContent = 'Tải file kết quả';
    document.getElementById('result-doc').innerHTML = '';
    document.getElementById('result-doc').appendChild(a);
  } catch (err) {
    document.getElementById('result-doc').textContent = err.error || 'Có lỗi xảy ra!';
  }
});

// Xử lý chuyển đổi ảnh
const formImage = document.getElementById('form-image');
formImage.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formImage);
  document.getElementById('result-image').textContent = 'Đang xử lý...';
  try {
    const res = await fetch('http://localhost:3001/api/convert-image', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw await res.json();
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadName(formData.get('image').name, res.headers.get('content-disposition'));
    a.textContent = 'Tải ảnh kết quả';
    document.getElementById('result-image').innerHTML = '';
    document.getElementById('result-image').appendChild(a);
  } catch (err) {
    document.getElementById('result-image').textContent = err.error || 'Có lỗi xảy ra!';
  }
});

// Xử lý tải video TikTok
const formTiktok = document.getElementById('form-tiktok');
formTiktok.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = formTiktok.url.value;
  document.getElementById('result-tiktok').textContent = 'Đang xử lý...';
  try {
    const res = await fetch('http://localhost:3001/api/download-tiktok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw await res.json();
    const blob = await res.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    a.download = 'tiktok_video.mp4';
    a.textContent = 'Tải video TikTok';
    document.getElementById('result-tiktok').innerHTML = '';
    document.getElementById('result-tiktok').appendChild(a);
  } catch (err) {
    document.getElementById('result-tiktok').textContent = err.error || 'Có lỗi xảy ra!';
  }
});

function getDownloadName(original, contentDisposition) {
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) return match[1];
  }
  return 'ketqua_' + original;
} 