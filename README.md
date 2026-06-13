# Admatrix Lovable Convert WordPress

Bộ công cụ nội bộ của Admatrix để chuyển export từ Lovable thành landing page WordPress có thể kiểm tra, chỉnh sửa và tái sử dụng.

Repo này sinh ra để team không phải lục lại hướng dẫn trong chat mỗi lần làm landing page. Một người chỉ cần clone repo, đặt source Lovable vào đúng thư mục, chọn builder WordPress phù hợp, chạy converter/deployer và review bản nháp trên WordPress.

## Repo này giải quyết việc gì?

Lovable thường xuất ra một gói HTML/CSS/JS đẹp nhưng chưa sẵn sàng để đưa thẳng vào WordPress. Repo này chuẩn hóa quy trình:

- Nhận export Lovable hoặc thư mục `dist` đã build.
- Chuyển HTML/CSS/media thành format dùng được trong WordPress.
- Tạo draft page qua WordPress REST API.
- Giữ nguyên layout, ảnh, CSS, diagram và interaction quan trọng.
- Tách rõ 3 hướng triển khai: Flatsome, Elementor hoặc Gutenberg.
- Đóng gói hướng dẫn cho agent/Codex để lần sau làm đúng quy trình.

## Khi nào dùng repo này?

Dùng repo này khi có một landing page, web demo hoặc app nhỏ được tạo bằng Lovable và cần đưa lên WordPress.

Không dùng repo này để quản lý toàn bộ theme WordPress, viết plugin production lớn, hoặc deploy tự động thẳng lên live mà chưa review bản nháp.

## Cách hoạt động

```text
Lovable export / dist
        |
        v
input/<campaign>/
        |
        v
scripts/convert-static.js
        |
        v
WordPress draft page + uploaded media
        |
        v
QA checklist + manual review
```

Builder được chọn ngay từ đầu:

- `flatsome`: mặc định an toàn nhất cho `admatrix.vn`, dùng WordPress Page + Flatsome blank page template.
- `elementor`: chỉ dùng khi project yêu cầu Elementor Canvas.
- `gutenberg`: dùng cho trang đơn giản theo luồng block/page mặc định của WordPress.

Không trộn Flatsome và Elementor trong cùng một landing page.

## Cài đặt nhanh

Yêu cầu Node.js 20+.

```powershell
npm install
npm test
```

Chạy deploy draft page mặc định cho Flatsome:

```powershell
npm run deploy:page -- `
  --input "input/<campaign>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder flatsome
```

Kết quả mong muốn: một WordPress draft page, media đã upload, CSS được inline/giữ phạm vi, diagram động được bảo toàn, và page template được đặt đúng cho builder đã chọn.

## Credential WordPress

Dùng WordPress Application Password. Không commit credential vào repo.

Đường dẫn local mặc định:

```text
F:\Agent_Home\00_Raw_Assets\credentials\wordpress-admatrix-mcp.json
```

Format:

```json
{
  "api_url": "https://admatrix.vn/wp-json",
  "username": "admin",
  "application_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
}
```

## Cấu trúc repo

```text
docs/                 Hướng dẫn vận hành, QA, lỗi thường gặp, GitHub setup
scripts/              Converter, deployer và QA script
skills/               Hướng dẫn riêng cho agent theo từng builder
templates/            Mẫu CF7, interaction, child-theme page template, plugin scaffold
examples/             Ví dụ Lovable tối giản để test nhanh
test/                 Test tự động cho converter
wordpress-plugin/     Scaffold plugin shortcode cho Flow B
```

## Tài liệu chính

- [Runbook](docs/RUNBOOK.md): quy trình chạy thực tế.
- [GitHub Setup](docs/GITHUB_SETUP.md): cách đưa repo lên GitHub theo chuẩn Admatrix.
- [Pitfalls](docs/PITFALLS.md): lỗi dễ gặp khi chuyển Lovable sang WordPress.
- [Direct Page Deployment](docs/10-direct-page-deployment.md): triển khai trực tiếp thành WordPress page.
- [QA Checklist](docs/05-qa-checklist.md): checklist trước khi bàn giao/publish.

## Link repo và tài liệu liên quan

Các link này là nền tham chiếu, không phải code copy trực tiếp:

- [WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter): cách trình bày README rõ ràng, có overview, feature, architecture, install.
- [Automattic/mcp-wordpress-remote](https://github.com/Automattic/mcp-wordpress-remote): tham khảo hướng kết nối WordPress từ agent/remote MCP.
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/): API nền để tạo page, upload media và cập nhật nội dung.
- [WordPress REST API Pages](https://developer.wordpress.org/rest-api/reference/pages/): endpoint page.
- [WordPress REST API Media](https://developer.wordpress.org/rest-api/reference/media/): endpoint media.
- [Flatsome Page Templates](https://docs.uxthemes.com/article/40-page-templates): tham khảo template cho Flatsome.
- [Elementor Canvas Template](https://elementor.com/help/canvas-template/): tham khảo khi bắt buộc dùng Elementor.

## Hướng dẫn cho agent/Codex

Agent không tự đoán builder. Hỏi hoặc xác định rõ một builder trước, rồi chỉ dùng skill tương ứng:

```text
skills/flatsome/SKILL.md
skills/elementor/SKILL.md
skills/gutenberg/SKILL.md
```

Nguyên tắc: nếu site hiện tại chạy Flatsome thì ưu tiên Flatsome. Chỉ dùng Elementor khi người vận hành chọn Elementor.

## Luật an toàn

- Tạo draft trước, publish chỉ khi có phê duyệt rõ.
- Không commit WordPress credential, GitHub token, `.env`, `input/`, `output/`, `node_modules/`.
- Không dùng MCP `wsp/update-page` để thay toàn bộ landing content nếu chưa test style preservation trên draft bỏ đi.
- Với SVG/chart phức tạp, giữ dạng self-contained SVG data image khi cần bảo toàn animation.
- Với icon tĩnh, có thể rasterize sang WebP.
- Với Flatsome, xử lý wrapper spacing bằng CSS có scope theo page.
