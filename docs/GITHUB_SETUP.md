# Hướng dẫn đưa repo lên GitHub

Tài liệu này là checklist chuẩn để đưa repo `Admatrix-loveable-convert-wordpress` lên GitHub theo cách người mới đọc vào hiểu ngay repo dùng để làm gì, chạy thế nào và liên quan tới những repo/tài liệu nào.

## Tiêu chí trình bày

README của repo phải đạt các điểm sau:

- Viết bằng tiếng Việt trước, rõ cho team nội bộ.
- Mở đầu bằng mục đích repo trong 2-3 câu.
- Nói rõ repo giải quyết vấn đề gì, dùng khi nào và không dùng khi nào.
- Có workflow tổng quát từ input tới output.
- Có lệnh cài đặt/chạy tối thiểu.
- Có cấu trúc thư mục để người đọc biết file nào nằm ở đâu.
- Có link repo/tài liệu liên quan.
- Có luật an toàn về credential, draft/publish và dữ liệu client.

Tham khảo cách trình bày của [WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter): mở đầu rõ, có overview, feature, architecture/cấu trúc, dependencies và installation. Không cần copy độ dài của họ, chỉ học cách giúp người đọc định vị nhanh.

## Thông tin repo

```text
Tên repo: Admatrix-loveable-convert-wordpress
Owner hiện tại: tranquan2206
URL hiện tại: https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress
Mục đích: chuyển Lovable export/dist thành WordPress landing page draft
Runtime: Node.js 20+
```

Visibility tùy mục tiêu:

- `Private`: phù hợp nếu repo chứa workflow nội bộ, cấu trúc vận hành, ví dụ khách hàng hoặc script gắn với site Admatrix.
- `Public`: chỉ dùng khi đã quét sạch credential, dữ liệu khách hàng, output thật, đường dẫn nhạy cảm và nội dung nội bộ không muốn lộ.

## Không được commit

Không đưa các loại dữ liệu này lên GitHub:

- GitHub PAT token.
- WordPress Application Password.
- `.env`.
- File credential JSON local.
- Source export của client trong `input/`.
- Output đã generate trong `output/`.
- `node_modules/`.
- File backup hoặc ZIP chứa dữ liệu khách hàng.

## Link cần đính kèm trong README

Repo liên quan:

- [WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter): tham khảo format README và hướng MCP cho WordPress.
- [Automattic/mcp-wordpress-remote](https://github.com/Automattic/mcp-wordpress-remote): tham khảo hướng WordPress remote/MCP.

Tài liệu liên quan:

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress REST API Pages](https://developer.wordpress.org/rest-api/reference/pages/)
- [WordPress REST API Media](https://developer.wordpress.org/rest-api/reference/media/)
- [Flatsome Page Templates](https://docs.uxthemes.com/article/40-page-templates)
- [Elementor Canvas Template](https://elementor.com/help/canvas-template/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

## Checklist trước khi push

1. README đã viết bằng tiếng Việt và người mới hiểu repo làm gì.
2. `docs/GITHUB_SETUP.md` đã có link repo/tài liệu liên quan.
3. `.gitignore` đã loại `input/`, `output/`, `.env`, credential và `node_modules/`.
4. Không có credential trong toàn repo.
5. Test chạy pass:

```powershell
npm install
npm test
```

6. Nếu repo public, kiểm tra lại bằng search:

```powershell
rg -n "password|token|secret|api_key|application_password|wp-json|Authorization|Bearer" .
```

Chỉ giữ lại placeholder hoặc đoạn hướng dẫn an toàn. Không để secret thật.

## Tạo repo mới bằng GitHub CLI

Dùng token chỉ trong phiên terminal hiện tại, không lưu token vào file.

```powershell
cd F:\Agent_Home\Tools\Admatrix-loveable-convert-wordpress
git init
git add .
git commit -m "Initial Admatrix Lovable to WordPress converter"

$env:GH_TOKEN = "<paste-token-for-this-session-only>"
gh repo create tranquan2206/Admatrix-loveable-convert-wordpress --private --source . --remote origin --push
Remove-Item Env:GH_TOKEN
```

Nếu repo đã tồn tại:

```powershell
git remote add origin https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress.git
git branch -M main
git push -u origin main
```

## GitHub Actions

Workflow hiện tại nên chỉ chạy kiểm tra cơ bản:

```powershell
npm install
npm test
```

Không đưa credential production WordPress vào GitHub Actions nếu chưa có quyết định rõ về tự động deploy.

## Sau khi push

Kiểm tra các trang sau:

- Repo chính: https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress
- Actions: https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress/actions
- Issues: https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress/issues
- Secrets nếu cần CI deploy sau này: https://github.com/tranquan2206/Admatrix-loveable-convert-wordpress/settings/secrets/actions

README đạt yêu cầu khi một người không tham gia cuộc chat vẫn trả lời được 4 câu:

1. Repo này dùng để làm gì?
2. Khi nào nên dùng?
3. Chạy thử bằng lệnh nào?
4. Đọc tiếp tài liệu nào nếu cần triển khai thật?
