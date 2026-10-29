# TaskFlow — Hướng dẫn chạy, test, đưa lên GitHub và deploy

## 1. Chạy trên máy

Không cần Firebase hay API. Mở terminal trong thư mục `taskflow`:

```powershell
npm install
npm start
```

Mở http://localhost:4200. Lần đầu sẽ có sẵn bảng mẫu 4 cột, 8 task.

## 2. Chạy unit test

```powershell
npm test
```

Chrome mở ra một trang Karma, terminal in kết quả kiểu `Executed 19 of 19 SUCCESS`. Sửa code thì test tự chạy lại. Bấm `Ctrl + C` để dừng.

Chạy một lần không mở cửa sổ (giống trên GitHub Actions): `npm run test:ci`.

Thử làm test fail để hiểu: mở `board.logic.spec.ts`, đổi `['c2', 'c3', 'c1']` thành `['c1', 'c2', 'c3']`, lưu lại → test đỏ và chỉ rõ giá trị mong đợi với giá trị thực tế. Đổi lại cho xanh.

## 3. Cách dùng app

- **Thêm task nhanh**: bấm **+ Add task** cuối cột, gõ tên, Enter. Ô vẫn mở để gõ tiếp; Esc để đóng.
- **Thêm task đầy đủ**: trong ô thêm nhanh, bấm **More details…**.
- **Sửa / xóa task**: bấm vào thẻ → dialog hiện ra. Đổi **Status** để chuyển cột. Nút **Delete** ở góc trái dưới.
- **Kéo thả**: giữ chuột vào thẻ và kéo sang vị trí hoặc cột khác.
- **Cột**: bấm tên cột để đổi tên; 🗑 để xóa; **+ Add column** ở cuối bảng để thêm.
- **Lọc**: ô tìm kiếm và các nút High / Medium / Low trên đầu. Khi đang lọc, kéo thả tạm tắt.
- **Cột cuối cùng** được coi là "đã xong": thẻ mờ đi, gạch ngang, không báo quá hạn.
- **Reset demo**: đưa bảng về dữ liệu mẫu.
- Dữ liệu lưu trong trình duyệt (localStorage): tải lại trang vẫn còn, nhưng máy khác hoặc trình duyệt khác sẽ không thấy.

## 4. Đưa lên GitHub

Tạo repo trống `taskflow` trên GitHub, rồi:

```powershell
git init
git add .
git commit -m "feat: initial taskflow kanban board"
git branch -M main
git remote add origin https://github.com/tiennd03/taskflow.git
git push -u origin main
```

Tab **Actions** sẽ chạy test rồi build. Dấu ✓ xanh nghĩa là cả test lẫn build đều qua — khách nhìn thấy dự án có test tự động.

## 5. Deploy

Tạo project Firebase mới tên `taskflow` (chỉ dùng Hosting), rồi:

```powershell
npx firebase-tools use --add
npm run build
npx firebase-tools deploy --only hosting
git add .firebaserc
git commit -m "chore: add firebase project alias"
git push
```

## 6. Kiến thức mới so với hai dự án trước

| Chủ đề | File để đọc |
| --- | --- |
| NgRx SignalStore: state, computed, methods, hooks | `board/board.store.ts` |
| State chuẩn hóa (normalized) | `board/board.models.ts` |
| Hàm thuần (pure function), cập nhật bất biến | `board/board.logic.ts` |
| Kéo thả bằng CDK | `board/column.component.html`, `board/board.component.ts` |
| CDK Dialog: truyền dữ liệu vào, nhận kết quả ra, `await` | `shared/dialogs.service.ts`, `board/card-dialog.component.ts` |
| Lưu và kiểm tra dữ liệu localStorage | `board/board.storage.ts` |
| `afterNextRender` trong directive tự viết | `shared/autofocus.directive.ts` |
| Vì sao Tailwind cần tên class đầy đủ | `shared/styles.ts` |
| Unit test với Jasmine, TestBed, `TestBed.tick()` | `board/*.spec.ts` |
| CI chạy test trước khi build | `.github/workflows/ci.yml` |
