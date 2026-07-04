/**
 * Utility to generate and download a highly professional Word (.doc) User Manual
 * formatted elegantly for Microsoft Word.
 */
export function downloadUserManualDocx() {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Thiết Bị Y Tế - BVĐK Bảo Thắng</title>
  <style>
    @page {
      size: 21cm 29.7cm; /* A4 size */
      margin: 2cm 2cm 2cm 2.5cm; /* Word Standard Margins */
    }
    body {
      font-family: "Times New Roman", Times, serif;
      line-height: 1.6;
      font-size: 13pt;
      color: #1a202c;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-bottom: 30pt;
    }
    .header-table td {
      border: none;
      padding: 0;
      vertical-align: top;
    }
    .title-hospital {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      color: #2d3748;
    }
    .title-slogan {
      font-size: 11pt;
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1.5pt solid #1a202c;
      padding-bottom: 5pt;
    }
    h1 {
      font-size: 18pt;
      color: #1a365d;
      text-align: center;
      text-transform: uppercase;
      font-weight: bold;
      margin-top: 40pt;
      margin-bottom: 10pt;
    }
    h2 {
      font-size: 14pt;
      color: #2b6cb0;
      border-bottom: 1px solid #cbd5e0;
      padding-bottom: 4pt;
      margin-top: 25pt;
      margin-bottom: 10pt;
      font-weight: bold;
    }
    h3 {
      font-size: 13pt;
      color: #2d3748;
      font-weight: bold;
      margin-top: 15pt;
      margin-bottom: 5pt;
    }
    p {
      text-align: justify;
      margin-top: 0;
      margin-bottom: 8pt;
      text-indent: 0.5in;
    }
    p.no-indent {
      text-indent: 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      margin-bottom: 15pt;
    }
    table.data-table th {
      border: 1pt solid #cbd5e0;
      background-color: #ebf8ff;
      color: #2c5282;
      padding: 8pt;
      font-weight: bold;
      text-align: center;
      font-size: 11pt;
    }
    table.data-table td {
      border: 1pt solid #cbd5e0;
      padding: 8pt;
      font-size: 11pt;
      text-align: left;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 4pt;
      text-align: justify;
    }
    .note-box {
      background-color: #fffaf0;
      border-left: 3pt solid #dd6b20;
      padding: 10pt;
      margin: 15pt 0;
    }
    .note-box p {
      text-indent: 0;
      margin: 0;
      font-style: italic;
      color: #dd6b20;
    }
    .footer {
      text-align: center;
      font-size: 10pt;
      color: #718096;
      margin-top: 50pt;
      border-top: 1px solid #e2e8f0;
      padding-top: 10pt;
    }
    .signature-section {
      width: 100%;
      margin-top: 40pt;
      border-collapse: collapse;
      border: none;
    }
    .signature-section td {
      border: none;
      width: 50%;
      text-align: center;
      vertical-align: top;
      font-size: 12pt;
    }
  </style>
</head>
<body>

  <!-- TIÊU NGỮ QUỐC GIA & THÔNG TIN VIỆN -->
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="title-hospital">
          SỞ Y TẾ TỈNH LÀO CAI<br>
          <b>BỆNH VIỆN ĐA KHOA BẢO THẮNG</b><br>
          <span style="font-size: 9pt; font-weight: normal;">Số: ....../HDSD-BVBT</span>
        </div>
      </td>
      <td style="width: 10%;">&nbsp;</td>
      <td style="width: 45%;">
        <div class="title-slogan">
          <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
          <span style="font-size: 10pt; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</span><br>
          <span style="font-size: 9pt; font-weight: normal; font-style: italic; text-transform: none; display: block; margin-top: 4pt;">Bảo Thắng, ngày 04 tháng 07 năm 2026</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- TIÊU ĐỀ CHÍNH -->
  <h1>HƯỚNG DẪN SỬ DỤNG VÀ VẬN HÀNH<br><span style="font-size: 14pt;">HỆ THỐNG QUẢN LÝ TRANG THIẾT BỊ LÂM SÀNG TRỰC TUYẾN</span></h1>
  
  <p class="no-indent" style="text-align: center; font-style: italic; margin-bottom: 30pt;">
    (Áp dụng cho toàn thể Cán bộ, Y bác sĩ, Kỹ thuật viên và Điều dưỡng tại Bệnh viện Đa khoa Bảo Thắng)
  </p>

  <!-- PHẦN 1 -->
  <h2>1. KHẢ NĂNG ĐỒNG BỘ ĐA NGƯỜI DÙNG (MULTIPLE USERS)</h2>
  <p>
    Hệ thống quản lý thiết bị y tế của Bệnh viện Đa khoa Bảo Thắng đã được tích hợp thành công công nghệ <b>Google Firebase Firestore</b>. Đây là cơ sở dữ liệu đám mây thời gian thực (Real-time Cloud Database) hàng đầu thế giới của Google. Nhờ vào sự nâng cấp cốt lõi này, hệ thống sở hữu các năng lực đặc biệt sau:
  </p>
  <ul>
    <li><b>Sử dụng đồng thời (Multi-user concurrency):</b> Hệ thống hỗ trợ không giới hạn số lượng y bác sĩ, điều dưỡng, kỹ thuật viên truy cập đồng thời từ nhiều thiết bị khác nhau (Điện thoại di động, Máy tính bảng, Máy tính để bàn cá nhân tại Khoa phòng).</li>
    <li><b>Đồng bộ hóa tức thì (Real-time Syncing):</b> Khi một người dùng thực hiện bất kỳ hành động nào (như cập nhật trạng thái sạc pin, khai báo máy mới, ghi chép biên bản bảo trì định kỳ hoặc bàn giao thiết bị), dữ liệu sẽ lập tức được cập nhật lên đám mây và đồng bộ đến màn hình của tất cả những người dùng khác đang mở ứng dụng mà không cần tải lại trang.</li>
    <li><b>An toàn & Bảo mật cao:</b> Toàn bộ dữ liệu được lưu trữ an toàn trên máy chủ của Google, ngăn chặn việc mất dữ liệu do hỏng máy tính cục bộ hoặc bị xóa bộ nhớ cache trình duyệt. Quy trình hoạt động hoàn toàn trực tuyến và tin cậy 100%.</li>
  </ul>

  <!-- PHẦN 2 -->
  <h2>2. PHÂN QUYỀN VAI TRÒ TRONG HỆ THỐNG</h2>
  <p>
    Để quản lý khoa học, hệ thống thiết lập sẵn 3 vai trò chính. Người dùng có thể chuyển đổi nhanh vai trò thông qua góc phải trên cùng màn hình (Ảnh đại diện tài khoản) để mô phỏng và thực hiện các nghiệp vụ chuyên biệt:
  </p>
  
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Vai trò (Role)</th>
        <th style="width: 40%;">Quyền hạn chuyên môn</th>
        <th style="width: 35%;">Nhiệm vụ trọng tâm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Điều dưỡng viên<br>(Nurse)</b></td>
        <td>Bàn giao thiết bị, thu hồi thiết bị, thực hiện cắm sạc pin định kỳ hằng tháng. Xem thông số thiết bị.</td>
        <td>Đảm bảo máy móc y tế luôn sẵn sàng vận hành tại buồng bệnh; cắm sạc ngay khi hệ thống cảnh báo pin yếu dưới 15%.</td>
      </tr>
      <tr>
        <td><b>Kỹ thuật viên<br>(Technician)</b></td>
        <td>Thực hiện ghi nhật ký bảo trì định kỳ 6 tháng. Thực hiện sạc pin máy. Cập nhật lỗi kỹ thuật.</td>
        <td>Kiểm tra an toàn kỹ thuật, bảo dưỡng thiết bị định kỳ, khắc phục sự cố hỏng hóc nhanh chóng.</td>
      </tr>
      <tr>
        <td><b>Quản trị viên<br>(Admin)</b></td>
        <td>Toàn quyền hệ thống: Khai báo thiết bị mới, xóa hồ sơ máy, quản lý phân quyền và tải các báo cáo xuất dữ liệu.</td>
        <td>Quản lý tổng thể danh mục trang thiết bị toàn viện; xuất báo cáo định kỳ phục vụ kiểm tra chất lượng bệnh viện.</td>
      </tr>
    </tbody>
  </table>

  <!-- PHẦN 3 -->
  <h2>3. QUY TRÌNH VẬN HÀNH VÀ SỬ DỤNG THIẾT BỊ</h2>
  
  <h3>3.1. Quy trình sử dụng và bàn giao máy lâm sàng</h3>
  <p>
    Khi cần sử dụng một thiết bị y tế cho bệnh nhân, điều dưỡng viên thực hiện các bước sau:
  </p>
  <ol>
    <li>Tại danh sách thiết bị, tìm kiếm theo tên hoặc mã máy, hoặc nhấn <b>Quét mã máy nhanh</b> (Giả lập quét nhãn QR vật lý dán trên thân máy).</li>
    <li>Nhấn vào thiết bị để mở hộp thoại <b>Chi tiết hồ sơ thiết bị</b>.</li>
    <li>Nhấn chọn nút <b>Bàn giao sử dụng</b>, hệ thống sẽ yêu cầu ghi nhận tên người tiếp nhận. Sau khi xác nhận, trạng thái thiết bị tự động chuyển sang <span style="color: #dd6b20; font-weight: bold;">Đang vận hành (InUse)</span>.</li>
    <li>Sau khi sử dụng xong cho bệnh nhân, nhấn <b>Thu hồi thiết bị</b>. Hệ thống sẽ tự động tính toán tổng số phút vận hành thực tế và lưu vào nhật ký sử dụng lâm sàng, đưa trạng thái máy về <span style="color: #38a169; font-weight: bold;">Sẵn sàng sử dụng (Ready)</span>.</li>
  </ol>

  <div class="note-box">
    <p>
      <b>Cảnh báo pin yếu tự động:</b> Trong lúc thiết bị ở trạng thái "Đang vận hành", dung lượng pin sẽ tự động tiêu hao mô phỏng theo thời gian thực. Khi pin giảm xuống mức 15%, một cảnh báo đẩy màu đỏ sẽ ngay lập tức phát ra ở "Trung tâm thông báo đẩy" gửi tới toàn khoa phòng để cắm sạc khẩn cấp.
    </p>
  </div>

  <h3>3.2. Quy trình sạc pin định kỳ hằng tháng</h3>
  <p>
    Theo khuyến cáo của nhà sản xuất, tất cả các thiết bị y tế chạy pin phải được sạc đầy định kỳ ít nhất 1 lần/tháng để tránh chai pin và hỏng nguồn điện dự phòng:
  </p>
  <ul>
    <li>Hệ thống tự động lên lịch hạn sạc tiếp theo (30 ngày sau lần sạc gần nhất).</li>
    <li>Khi đến hạn sạc, hệ thống gửi cảnh báo yêu cầu cắm sạc.</li>
    <li>Người dùng (Điều dưỡng hoặc Kỹ thuật viên) thực hiện cắm sạc thực tế và nhấn nút <b>Sạc pin (100%)</b> trên phần mềm. Hệ thống sẽ khôi phục pin về 100% và tự động cộng thêm 30 ngày vào lịch sạc tiếp theo, ghi nhận ngày sạc gần nhất tức thì.</li>
  </ul>

  <h3>3.3. Quy trình ghi lý lịch bảo trì định kỳ (6 tháng)</h3>
  <p>
    Chỉ dành riêng cho tài khoản Kỹ thuật viên (Technician) hoặc Quản trị viên (Admin):
  </p>
  <ol>
    <li>Mở chi tiết thiết bị cần bảo trì, nhấn chọn <b>Ghi lý lịch bảo trì mới</b>.</li>
    <li>Nhập đầy đủ thông tin vào biểu mẫu: Tên người thực hiện, nội dung kỹ thuật đã xử lý (ví dụ: vệ sinh máy, căn chỉnh cảm biến, đo dòng điện rò rỉ, kiểm tra chức năng), phân loại kết quả (Hoàn thành tốt / Đạt yêu cầu / Chờ thay thế linh kiện).</li>
    <li>Nhấn <b>Xác nhận bảo trì</b>. Phần mềm sẽ tự động cập nhật lịch hẹn bảo trì tiếp theo (180 ngày sau) và reset trạng thái thiết bị về <b>Sẵn sàng sử dụng (Ready)</b> nếu trước đó máy bị lỗi kỹ thuật.</li>
  </ol>

  <!-- PHẦN 4 -->
  <h2>4. HƯỚNG DẪN TRÍCH XUẤT BÁO CÁO TỰ ĐỘNG</h2>
  <p>
    Hệ thống hỗ trợ Cán bộ Quản lý xuất dữ liệu nhanh phục vụ công tác thanh tra hoặc giao ban khoa phòng:
  </p>
  <ul>
    <li><b>Báo cáo Excel (Xuất Excel):</b> Tạo ngay file bảng tính .xlsx chứa đầy đủ danh mục máy móc, số serial, tình trạng pin, trạng thái hoạt động thực tế và lịch bảo trì để phục vụ chỉnh sửa dữ liệu hoặc in ấn bảng biểu.</li>
    <li><b>Báo cáo PDF Tự Động:</b> Biên soạn tài liệu định dạng PDF cực kỳ chuyên nghiệp trực tiếp từ trình duyệt, trình bày đầy đủ biểu đồ phân tích, danh sách máy cảnh báo và chữ ký xác nhận của đại diện Phòng Vật tư - Trang thiết bị y tế.</li>
  </ul>

  <!-- PHẦN KÝ TÊN -->
  <table class="signature-section">
    <tr>
      <td>
        <b>NGƯỜI LẬP BIÊN BẢN</b><br>
        <span style="font-size: 10pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
        <br><br><br><br><br>
        <b>Phòng Vật tư - TBYT</b>
      </td>
      <td>
        <b>GIÁM ĐỐC BỆNH VIỆN</b><br>
        <span style="font-size: 10pt; font-style: italic;">(Ký tên và đóng dấu)</span>
        <br><br><br><br><br>
        <b>ThS.BS. Nguyễn Văn A</b>
      </td>
    </tr>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    Bệnh viện Đa khoa Bảo Thắng • Tổ Quản lý Trang thiết bị Y tế Lâm sàng<br>
    Địa chỉ: Thị trấn Phố Lu, Bảo Thắng, Lào Cai • Hotline Kỹ thuật: 0912.345.xxx
  </div>

</body>
</html>
  `;

  // Use application/msword with charset utf-8
  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Huong_Dan_Su_Dung_Quan_Ly_Thiet_Bi_Y_Te_Bao_Thang.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
