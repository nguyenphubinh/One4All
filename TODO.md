# TODO - Quản lý tiến độ dự án Web Tiện Ích Chuyển Đổi

## 1. Backend
- [v] Khởi tạo project Node.js + Express.js
- [v] Tạo API upload file (PDF/DOCX, ảnh)
- [v] Tạo API nhận URL TikTok
- [v] Xử lý chuyển đổi PDF ↔ DOCX (dùng LibreOffice/local lib)
- [v] Xử lý chuyển đổi định dạng ảnh (dùng sharp)
- [v] Xử lý tải video TikTok không logo (dùng yt-dlp)
- [v] Lưu file tạm trên server (EC2/local)
- [v] Tạo API trả link tải file kết quả
- [v] Ghi log các hoạt động vào file log local

## 2. Frontend
- [ ] Giao diện upload file PDF/DOCX, chọn định dạng, nút chuyển đổi, link tải
- [ ] Giao diện nhập URL TikTok, nút tải, hiển thị trạng thái, link tải
- [ ] Giao diện upload ảnh, chọn định dạng, nén/resize, link tải
- [ ] Responsive cho mobile
- [ ] Xử lý upload bằng AJAX/fetch

## 3. Chuẩn bị tích hợp Cloud (sau)
- [ ] Tích hợp lưu trữ S3
- [ ] Tích hợp queue SQS
- [ ] Ghi log lên CloudWatch/S3

---
**Khi hoàn thành task nào, hãy đánh dấu [x] vào ô tương ứng.** 