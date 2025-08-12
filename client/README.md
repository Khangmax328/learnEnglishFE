Learn English UGC – MVP
Web app học tiếng Anh kiểu cộng đồng (UGC) cho phép người dùng đăng câu tiếng Anh, mọi người góp ý / sửa, và (tuỳ chọn) AI hỗ trợ chỉnh lỗi – giống forum mini cho người học.

Tính năng chính
+ Đăng ký / đăng nhập (JWT).
+ Tạo bài viết (câu tiếng Anh cần sửa).
+ Người dùng khác góp ý cho từng bài; hiển thị tổng góp ý, phân trang.
+ Trang Chi tiết bài: xem đầy đủ góp ý, gửi góp ý mới.
+ Trang của tôi: liệt kê bài của chính mình, xoá bài/góp ý của mình.
+ Admin: quản lý users, bài, góp ý (xoá/cấp quyền).
+ Responsive mobile

Kiến trúc
+ Frontend: React, React Router, Axios.
+ Backend: Node.js + Express, JWT, Mongoose (MongoDB).
+ DB: MongoDB Atlas.

Frontend – Client chạy localhost
+ cd client
+ npm i
+ cp .env.example .env
+ npm run dev
+ REACT_APP_API_URL=http://localhost:5000/api




