# 🚀 Cosmic Todo App (PayloadCMS v3 + Next.js)

Một ứng dụng quản lý công việc (Todo App) toàn diện, sở hữu giao diện tuyệt đẹp mang phong cách **Glassmorphism Dark Mode**. Dự án được xây dựng dựa trên sự kết hợp mạnh mẽ giữa **Next.js App Router** và **PayloadCMS v3** (Headless CMS), cung cấp cả giao diện người dùng (Frontend) mượt mà lẫn hệ thống quản trị nội dung (Admin Dashboard) chuyên nghiệp.

---

## 🌟 Tổng Quan Tính Năng (Features)

### 💻 Giao diện người dùng (Frontend)
- **Thiết kế Premium**: Giao diện tối (Dark Mode) kết hợp hiệu ứng kính (Glassmorphism) sang trọng cùng các hiệu ứng chuyển động (animations) tinh tế.
- **Quản lý linh hoạt**: Hỗ trợ đầy đủ Thêm mới, Xóa và Đánh dấu hoàn thành công việc.
- **Phân loại & Tìm kiếm**: Tìm kiếm công việc theo thời gian thực (realtime) và lọc nhanh theo các trạng thái (Tất cả / Chưa xong / Đã xong).
- **Sao chép thông minh (Tính năng nâng cao)**: Cho phép sao chép công việc từ các ngày trước đó sang ngày hiện tại nhanh chóng thông qua Modal chuyên dụng.

### ⚙️ Quản trị hệ thống (Backend / Admin)
- **Payload Admin Dashboard**: Cung cấp giao diện quản trị hệ thống mạnh mẽ để quản lý Người dùng, File (Media) và Công việc (Todos).
- **Auto-Seeding**: Tự động sinh dữ liệu mẫu (1 tài khoản Admin và 4 công việc) ngay lần chạy đầu tiên. Bạn không cần phải tốn công tạo dữ liệu thủ công để thử nghiệm!
- **Cơ sở dữ liệu tích hợp sẵn**: Sử dụng **SQLite** lưu file cục bộ (local). Bạn **không cần** cài đặt Docker hay thiết lập Postgres để chạy dự án. Mọi thứ hoạt động ngay lập tức (Plug and Play).

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)
- **Framework**: Next.js 16 (App Router)
- **CMS & Backend**: PayloadCMS 3.0
- **Database**: SQLite (qua `@payloadcms/db-sqlite`)
- **Styling**: Vanilla CSS nguyên bản (Không phụ thuộc thư viện ngoài)
- **Testing**:
  - `Vitest` + `React Testing Library`: Unit & Integration Tests.
  - `Playwright`: End-to-End (E2E) Tests.

---

## 🚀 Hướng Dẫn Chạy Dự Án (Từng Bước Cụ Thể)

### 📋 Yêu cầu trước khi chạy (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt **Node.js** phiên bản `>= 18.20.2` hoặc `>= 20.9.0`. Bạn có thể kiểm tra bằng lệnh `node -v` trong Terminal.

### Bước 1: Cài đặt thư viện (Dependencies)
Mở Terminal/Command Prompt tại thư mục gốc của dự án (`todo-app`) và chạy:
```bash
cd todo-app
npm install
```

### Bước 2: Khởi chạy môi trường Phát triển (Development Server)
Khởi động hệ thống với lệnh:
```bash
npm run dev
```
Hệ thống sẽ chạy và tự động khởi tạo cơ sở dữ liệu. Một file `payload.db` (chứa dữ liệu của SQLite) sẽ được sinh ra ở thư mục gốc. Đồng thời, **Auto-Seeding** sẽ tạo ra các dữ liệu có sẵn.

### Bước 3: Trải nghiệm Ứng dụng
Mở trình duyệt web của bạn:
- 🌐 **Giao diện người dùng (App):** Truy cập [http://localhost:3000](http://localhost:3000)
- ⚙️ **Trang quản trị (Admin):** Truy cập [http://localhost:3000/admin](http://localhost:3000/admin)

**Tài khoản Admin tự động tạo (Auto-Seeded):**
- **Email:** `admin@example.com`
- **Mật khẩu:** `password123`

---

## 🧪 Hướng Dẫn Chạy Kiểm Thử (Testing)

Dự án đã được tích hợp sẵn các bài test để đảm bảo chất lượng code.

- **Chạy Unit/Integration Test (Vitest):**
  ```bash
  npm run test:int
  ```
- **Chạy End-to-End Test (Playwright):**
  ```bash
  npm run test:e2e
  ```
- **Chạy toàn bộ các Test:**
  ```bash
  npm run test
  ```

---

## 📂 Cấu Trúc Thư Mục Quan Trọng (Folder Structure)

Dưới đây là một số thành phần lõi của dự án giúp bạn dễ dàng tuỳ biến:

- `src/payload.config.ts`: File cấu hình của PayloadCMS. Chứa cấu hình SQLite, cấu hình Collections, và **đặc biệt là đoạn hook `onInit` để Auto-Seed dữ liệu**.
- `src/collections/`: Nơi chứa định nghĩa các bảng dữ liệu (schema).
  - `Todos.ts`: Bảng dữ liệu công việc.
  - `Users.ts`: Bảng người dùng quản trị.
- `src/app/(frontend)/page.tsx`: File UI chính của người dùng, render Component quản lý todo list kết nối với REST API của Payload.
- `src/app/(frontend)/styles.css`: Chứa toàn bộ CSS phong cách Glassmorphism của dự án.
- `tests/`: Thư mục chứa các kịch bản test.
