function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return ContentService.createTextOutput("System Busy");

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- PRODUCT MANAGEMENT SETUP ---
    // Check if PRODUCTS sheet exists, if not create it
    var productSheet = ss.getSheetByName("PRODUCTS");
    if (!productSheet) {
      productSheet = ss.insertSheet("PRODUCTS");
    }

    // Checking if we need to seed data (Empty sheet)
    if (productSheet.getLastRow() === 0) {
      productSheet.appendRow(["SKU", "NAME", "UNIT", "CATEGORY"]);
      productSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#000000").setFontColor("#ffffff");
      
      // Initial Seed Data
      var seedData = [
        { sku: "110011", name: "Cà phê chế phin 1-500Gr", unit: "KG" },
        { sku: "210014", name: "Cà phê chế phin 4-500Gr", unit: "KG" },
        { sku: "310015", name: "Cà phê chế phin 5-500Gr", unit: "KG" },
        { sku: "410027", name: "Cà phê Gourmet Blend - 500gr", unit: "HOP" },
        { sku: "10227", name: "NL bar - Đá tinh khiết", unit: "KG" },
        { sku: "10255", name: "NL-Gừng tươi", unit: "KG" },
        { sku: "10301", name: "NL-Rau húng lũi", unit: "KG" },
        { sku: "10318", name: "NL Bar-Sira tươi", unit: "KG" },
        { sku: "10348", name: "NL bếp - Sả cây", unit: "KG" },
        { sku: "10386", name: "Dao thái trung", unit: "CAI" },
        { sku: "10398", name: "Gạt Tàn Vuông", unit: "CAI" },
        { sku: "10423", name: "Muỗng cà phê đá Inox", unit: "CAL" },
        { sku: "10424", name: "Muỗng cà phê nóng Inox", unit: "CAI" },
        { sku: "10427", name: "Muông Inox Lớn (ăn cơm)", unit: "CAI" },
        { sku: "10481", name: "Cà phê Sáng tạo 8-250gr", unit: "KG" },
        { sku: "10483", name: "Cà phê Sáng tạo 8-500gr", unit: "KG" },
        { sku: "10506", name: "NL-Đường cát", unit: "KG" },
        { sku: "10564", name: "NL bar - Bột quế", unit: "KG" },
        { sku: "10589", name: "Bao rác đen (90x110)", unit: "KG" },
        { sku: "10597", name: "Bao tay cao su", unit: "DOI" },
        { sku: "10673", name: "NL Bar-Trà anta", unit: "KG" },
        { sku: "10731", name: "Ly đo lường nhựa 100ml", unit: "CAI" },
        { sku: "10811", name: "Ông hút nóng", unit: "BICH" },
        { sku: "10923", name: "Nước lau kính", unit: "CHAI" },
        { sku: "10927", name: "Nước rửa chén - 3,6lit", unit: "BINH" },
        { sku: "10938", name: "Mouse rửa chén", unit: "CAI" },
        { sku: "10939", name: "Màng bọc thực phẩm", unit: "CUON" },
        { sku: "11054", name: "Kéo cắt thức ăn", unit: "CAY" },
        { sku: "11168", name: "Bao tay xốp", unit: "KG" },
        { sku: "11209", name: "Muôi thái", unit: "KG" },
        { sku: "11253", name: "Phin nhôm đen Legend", unit: "CAI" },
        { sku: "11285", name: "Hũ thủy tinh Ocean nắp gỗ 350ml", unit: "CAI" },
        { sku: "11585", name: "Cà phê Legend 225gr", unit: "HOP" },
        { sku: "11587", name: "Cà Phê Legend Cappucino Hazelnut", unit: "HOP" },
        { sku: "11589", name: "Cà Phê Legend Cappucino Mocha", unit: "HOP" },
        { sku: "11590", name: "Cà Phê G7 hòa tan đen hộp 15 gói", unit: "HOP" },
        { sku: "11593", name: "Cà phê G7 3in1 bịch 50 sachets", unit: "BICH" },
        { sku: "11594", name: "Cà phê G7 3in1 - Hộp 18 sticks", unit: "HOP" },
        { sku: "11595", name: "Cà phê G7 3in1 - Hộp 21", unit: "HOP" },
        { sku: "11596", name: "Cà phê Legend Passiona - hộp 14 sticks", unit: "HOP" },
        { sku: "11597", name: "Cà phê G7 2in1 hộp 15 sachets", unit: "HOP" },
        { sku: "11631", name: "Cà Phê G7 gu mạnh 3in1 12stick", unit: "HOP" },
        { sku: "11645", name: "Bộ lau nhà 360 độ", unit: "BO" },
        { sku: "11848", name: "Cà phê Premium Blend 425gr", unit: "LON" },
        { sku: "12665", name: "Dĩa Cappuccino gốm nâu", unit: "CAL" },
        { sku: "12666", name: "Tách Cappuccino gốm nâu", unit: "CAI" },
        { sku: "12781", name: "Nước rửa tay 500ml", unit: "CHAI" },
        { sku: "12796", name: "NL-Lá dứa", unit: "KG" },
        { sku: "12806", name: "Cà phê Sáng tạo 1 340gr", unit: "GOI" },
        { sku: "12807", name: "Cà phê Sáng tạo 2 340gr", unit: "GOI" },
        { sku: "12808", name: "Cà phê Sáng tạo 3 340gr", unit: "GOL" },
        { sku: "12809", name: "Cà phê Sáng tạo 4 340gr", unit: "GOI" },
        { sku: "12810", name: "Cà phê Sáng tạo 5 340gr", unit: "GOI" },
        { sku: "12854", name: "Sữa đặc có đường TN Brother", unit: "LON" },
        { sku: "13318", name: "Muỗng lớn delivery", unit: "CAI" },
        { sku: "15314", name: "Sách Quốc gia khởi nghiệp nhỏ", unit: "QUYEN" },
        { sku: "15973", name: "Ly Thông Điệp Sáng Tạo Legend", unit: "CAL" },
        { sku: "16753", name: "Kronos Đào ngâm 820g", unit: "HU" },
        { sku: "17009", name: "Hũ thủy tinh nắp cài Fido 2L", unit: "HU" },
        { sku: "18312", name: "NL Bar - Đường que vàng 4gr", unit: "GOI" },
        { sku: "19096", name: "Túi chữ T 12oz logo E-coffee", unit: "KG" },
        { sku: "19144", name: "Ca inox zebra 1.9L có nắp", unit: "CAI" },
        { sku: "19151", name: "Túi xốp có quai nhỏ e-coffee", unit: "KG" },
        { sku: "19153", name: "Túi hột xoài lớn e-coffee", unit: "KG" },
        { sku: "19241", name: "Cà phê Phin E-Coffee 500gr", unit: "GOI" },
        { sku: "19246", name: "Bột Kem Pha CP 1kg", unit: "KG" },
        { sku: "19327", name: "Chai thủy tinh nút gài 1000ml", unit: "CAI" },
        { sku: "19385", name: "Hũ thủy tinh nắp gài 1L", unit: "CAT" },
        { sku: "19745", name: "Legend cà phê sữa đá - 9 sticks", unit: "HOP" },
        { sku: "19876", name: "Cà phê Legend Classic - 12 sachts", unit: "HOP" },
        { sku: "19877", name: "Cà phê Legend Special Ed - 18 sticks", unit: "HOP" },
        { sku: "19912", name: "Bình giữ nhiệt VF013 - Đen", unit: "CAI" },
        { sku: "20061", name: "NL Bar - Chanh không hạt", unit: "KG" },
        { sku: "20147", name: "Chổi quét bột cà phê", unit: "CAI" },
        { sku: "20148", name: "Ông hút trong phi 6", unit: "KG" },
        { sku: "20149", name: "Bột VS máy pha Cafe Cafiza", unit: "CHAI" },
        { sku: "20426", name: "Nước tẩy rửa SUMO 700gr", unit: "CHAI" },
        { sku: "20549", name: "Ống hút trân châu", unit: "KG" },
        { sku: "21025", name: "Nắp bật đen 9oz", unit: "CAI" },
        { sku: "21043", name: "Hạt chia Úc 500gr", unit: "GOI" },
        { sku: "21044", name: "Mứt việt quất Osterberg", unit: "CHAI" },
        { sku: "21319", name: "Cà phê Cappuccino Coconut", unit: "HOP" },
        { sku: "21386", name: "Nắp cầu PET ly 12-16oz", unit: "CAI" },
        { sku: "21396", name: "TNE - Cà Phê Hạt 1kg", unit: "KG" },
        { sku: "21833", name: "Cà phê phin giấy - Americano", unit: "HOP" },
        { sku: "21834", name: "Cà phê phin giấy - Fusion Blend", unit: "HOP" },
        { sku: "21856", name: "Túi take away (túi đơn)", unit: "KG" },
        { sku: "21857", name: "Túi take away (túi đôi)", unit: "KG" },
        { sku: "21860", name: "Cà Phê Hạt Mộc Legend Success 3", unit: "LON" },
        { sku: "21861", name: "Cà Phê Hạt Mộc Legend Success 8", unit: "LON" },
        { sku: "21921", name: "Phin nhôm hoa văn TN Bạc", unit: "CAI" },
        { sku: "21928", name: "Phin nhôm đen Vì Nhân", unit: "CAI" },
        { sku: "22050", name: "Tách thủy tinh nóng", unit: "CAI" },
        { sku: "22051", name: "Dĩa thủy tinh nóng", unit: "CAI" },
        { sku: "22074", name: "Ly trà đá sanmarino logo EC", unit: "CAI" },
        { sku: "22128", name: "Cà phê Legend Special Edition - 9st", unit: "HOP" },
        { sku: "22196", name: "Giấy in bill K80x60", unit: "CUON" },
        { sku: "22253", name: "Ly giấy 9oz logo EC", unit: "CAI" },
        { sku: "22377", name: "Ly giấy 12oz logo EC", unit: "CAI" },
        { sku: "22668", name: "NL Bar - Bột sương sáo 3K", unit: "GOI" },
        { sku: "22745", name: "Chunky - Lê Cúc", unit: "TUI" },
        { sku: "22809", name: "Ly ocean Long Drink 495ml", unit: "CAI" },
        { sku: "22820", name: "Chanh muối đường EC - 900gr", unit: "HU" },
        { sku: "22821", name: "Hoa hibicus - gói 200gr", unit: "GOI" },
        { sku: "22822", name: "NL Bar - Nước cốt dừa 400ml", unit: "LON" },
        { sku: "22838", name: "Kỷ tử - 250gr", unit: "GOI" },
        { sku: "22839", name: "Nhãn nhục EC - 100gr", unit: "TUI" },
        { sku: "22840", name: "Hoa cúc khô EC - 100gr", unit: "TUI" },
        { sku: "22905", name: "Trà đào Cozy EC - 400gr", unit: "GOI" },
        { sku: "22969", name: "Cà Phê Legend Classic - Túi 50st", unit: "BICH" },
        { sku: "22984", name: "Thiên - Bộ Thiên 2 ly", unit: "BO" },
        { sku: "22987", name: "Roman - Bình Moka CF Roman", unit: "BINH" },
        { sku: "23051", name: "Củ năng ngâm đường - 560gr", unit: "LON" },
        { sku: "23052", name: "Bột cacao - 250gr", unit: "GOI" },
        { sku: "23078", name: "Nắp cầu PET ly nhựa 500ml", unit: "CAI" },
        { sku: "23080", name: "Mật ong hoa nhãn - 600ml", unit: "CHAI" },
        { sku: "23161", name: "Ly nhựa 500ml Logo EC", unit: "CAI" },
        { sku: "23163", name: "Xí muội (không hạt) - 100gr", unit: "GOI" },
        { sku: "23257", name: "Bột Kem Béo / Whipping cream", unit: "KG" },
        { sku: "23454", name: "Bột kem cà phê 200gr", unit: "TUI" },
        { sku: "23630", name: "Hộp quà giàu có 2023", unit: "HOP" },
        { sku: "23771", name: "Phin nhôm hoa văn Trung Nguyên vàng", unit: "CAI" },
        { sku: "23782", name: "Phin nhôm hoa văn Trung Nguyên nâu", unit: "CAI" },
        { sku: "23826", name: "Cà Phê Legend Americano - 15 gói", unit: "HOP" },
        { sku: "23905", name: "Ly Centra Hi Ball 300ml - EC", unit: "CAI" },
        { sku: "24008", name: "Khăn giấy 24*24cm logo EC", unit: "BICH" },
        { sku: "24013", name: "Ly bạc sỉu C13013-Logo EC", unit: "CAI" },
        { sku: "24048", name: "Bột Trà xanh Matcha Special", unit: "GOI" },
        { sku: "24052", name: "NL - Bột kem mặn 1kg", unit: "TUI" },
        { sku: "24120", name: "Bột giặt - Bịch 0,8kg", unit: "BICH" },
        { sku: "24168", name: "Cà Phê G7 Gold RuMi - 14st", unit: "HOP" },
        { sku: "24169", name: "Cà Phê G7 Gold Picasso Latte", unit: "HOP" },
        { sku: "24170", name: "Cà Phê G7 Gold Motherland", unit: "HOP" },
        { sku: "24238", name: "Sữa Yến Mạch - 1L", unit: "HOP" },
        { sku: "24845", name: "Bình giữ nhiệt 350ml - Thiền", unit: "CAI" },
        { sku: "24846", name: "Bình giữ nhiệt 350ml - Roman", unit: "CAI" },
        { sku: "24847", name: "Bình giữ nhiệt 350ml - Ottoman", unit: "CAI" },
        { sku: "24932", name: "Bình giữ nhiệt VF128", unit: "CAI" },
        { sku: "24956", name: "Túi vải canvas G7 Gold", unit: "CAI" },
        { sku: "25001", name: "Bột quế DH", unit: "HU" },
        { sku: "25062", name: "Ly sứ Legend VIP đen", unit: "BO" },
        { sku: "25097", name: "Chunky - Xoài", unit: "TUI" },
        { sku: "25101", name: "BGN VF013 350ml - Hawking", unit: "CAI" },
        { sku: "25103", name: "BGN VF013 350ml - Napoléon", unit: "CAI" },
        { sku: "25104", name: "BGN VF013 350ml - Jonathan", unit: "CAI" },
        { sku: "25156", name: "Chunky - Nhân Hoa Mộc Tê", unit: "TUI" },
        { sku: "25171", name: "Mật ong Rừng Nhiệt Đới 700g", unit: "CHAI" },
        { sku: "25202", name: "Đào ngâm Countree 820g", unit: "LON" },
        { sku: "25213", name: "Hòa tan Sấy lạnh Legend Gold", unit: "HU" },
        { sku: "25223", name: "Túi Canvas Thiền", unit: "CAI" },
        { sku: "25224", name: "Túi canvas Roman", unit: "CAI" },
        { sku: "25225", name: "Túi canvas Ottoman", unit: "CAI" },
        { sku: "25250", name: "Bút bi tre (T.S.Eliot)", unit: "CAY" },
        { sku: "25254", name: "Bút bi tre (Jefferson)", unit: "CAY" },
        { sku: "25255", name: "Bút bi tre (Franklin)", unit: "CAY" },
        { sku: "25284", name: "BGN VF254 600ML - white", unit: "CAI" },
        { sku: "25285", name: "BGN VF254 600ML - black", unit: "CAI" },
        { sku: "25286", name: "BGN VF013 - Trắng", unit: "CAI" },
        { sku: "25287", name: "BGN VF013 - Bạc", unit: "CAI" },
        { sku: "25304", name: "Bộ móc khóa CCDC pha chế", unit: "BO" },
        { sku: "25333", name: "Túi vải đay TNL Gold", unit: "CAI" },
        { sku: "25377", name: "Sữa tươi Emborg 1L", unit: "HOP" },
        { sku: "25379", name: "Nước cốt dừa Aroy-D 165ml", unit: "LON" },
        { sku: "25413", name: "Tem phụ BGN TNE VF254", unit: "CAI" },
        { sku: "25426", name: "Vỏ hộp quà tiêu chuẩn", unit: "HOP" },
        { sku: "25428", name: "Túi vải đặc biệt TNL (trắng)", unit: "CAI" },
        { sku: "25429", name: "Display TNL-Cappuchino", unit: "CAI" },
        { sku: "25430", name: "Display TNL - Bộ 3", unit: "CAI" },
        { sku: "25431", name: "Shelftalker TNL hòa tan", unit: "CAI" },
        { sku: "25432", name: "Ly sứ TNL Cappuccino", unit: "CAI" },
        { sku: "25433", name: "Wobler TNL hòa tan", unit: "CAI" },
        { sku: "25434", name: "Bình giữ nhiệt TNL đặc biệt", unit: "CAI" },
        { sku: "25435", name: "Sample Kit bộ 3 (Tiếng Việt)", unit: "HOP" },
        { sku: "25443", name: "Túi vải đặc biệt TNL (đen)", unit: "CAI" },
        { sku: "25447", name: "Giấy rơm", unit: "B500" },
        { sku: "25503", name: "Vỏ hộp quà Yêu Thương", unit: "HOP" },
        { sku: "25559", name: "Mứt Táo đỏ long nhãn 1kg", unit: "HOP" }
      ];
      
      seedData.forEach(function(p) {
        var cat = 'bar';
        var n = p.name.toLowerCase();
        if (n.includes('cà phê') || n.includes('g7') || n.includes('legend') || 
            n.includes('hộp quà') || n.includes('bình giữ nhiệt') || n.includes('ly sứ') || 
            n.includes('bút') || n.includes('sách') || n.includes('túi vải') || n.includes('phin')) {
             cat = 'retail';
        }
        productSheet.appendRow([p.sku, p.name, p.unit, cat]);
      });
    }

    // --- USER MANAGEMENT SETUP ---
    var userSheet = ss.getSheetByName("USERS");
    if (!userSheet) {
      userSheet = ss.insertSheet("USERS");
      userSheet.appendRow(["USERNAME", "PASSWORD", "ROLE", "FULLNAME"]);
      userSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#000000").setFontColor("#ffffff");
      userSheet.appendRow(["admin", "123", "admin", "Quản Trị Viên"]);
    }

    // --- BLIND CHECK SHEETS SETUP ---
    var blindCheck1Sheet = ss.getSheetByName("KIEM_KHO_1");
    if (!blindCheck1Sheet) {
      blindCheck1Sheet = ss.insertSheet("KIEM_KHO_1");
      blindCheck1Sheet.appendRow(["SESSION_ID", "SKU", "NAME", "HSD", "QUANTITY", "USER", "CREATED_AT"]);
      blindCheck1Sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");
    }
    
    var blindCheck2Sheet = ss.getSheetByName("KIEM_KHO_2");
    if (!blindCheck2Sheet) {
      blindCheck2Sheet = ss.insertSheet("KIEM_KHO_2");
      blindCheck2Sheet.appendRow(["SESSION_ID", "SKU", "NAME", "HSD", "QUANTITY", "USER", "CREATED_AT"]);
      blindCheck2Sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#e8711a").setFontColor("#ffffff");
    }
    
    var sessionSheet = ss.getSheetByName("KIEM_KHO_SESSION");
    if (!sessionSheet) {
      sessionSheet = ss.insertSheet("KIEM_KHO_SESSION");
      sessionSheet.appendRow(["SESSION_ID", "USER_1", "USER_2", "STATUS_1", "STATUS_2", "CREATED_AT", "RESULT"]);
      sessionSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#34a853").setFontColor("#ffffff");
    }

    // --- MAIN INVENTORY SHEET ---
    var sheets = ss.getSheets();
    var sheet = null;
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName() !== "USERS" && sheets[i].getName() !== "PRODUCTS") {
            sheet = sheets[i];
            break;
        }
    }
    if (!sheet) sheet = ss.getSheets()[0];
    
    // Safety check just in case [0] is USERS or PRODUCTS (unlikely if logic above fails but good practice)
    if (sheet.getName() === "USERS" || sheet.getName() === "PRODUCTS") {
         // Try finding one that isn't
         var candidates = sheets.filter(function(s) { return s.getName() !== "USERS" && s.getName() !== "PRODUCTS"; });
         if (candidates.length > 0) sheet = candidates[0];
         else sheet = ss.insertSheet("KHO"); // Absolute fallback
    }

    var data = JSON.parse(e.postData.contents);

    // ==========================================
    // API HANDLING
    // ==========================================
    
    // 1. PRODUCT APIs
    if (data.loai == "GetProducts") {
        var pData = productSheet.getDataRange().getValues();
        pData.shift(); // Remove header
        var products = pData.map(function(r) { return { sku: r[0], name: r[1], unit: r[2], category: r[3] }; });
        return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.loai == "AddProduct") {
        if (!data.sku || String(data.sku).trim() === "" || !data.name || String(data.name).trim() === "") {
             return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Vui lòng nhập đầy đủ SKU và Tên'})).setMimeType(ContentService.MimeType.JSON);
        }
        var pData = productSheet.getDataRange().getValues();
        for(var i=1; i<pData.length; i++) {
            if(String(pData[i][0]) == String(data.sku)) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Mã SKU đã tồn tại'})).setMimeType(ContentService.MimeType.JSON);
        }
        productSheet.appendRow([data.sku, data.name, data.unit, data.category]);
        return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. AUTH APIs
    if (data.loai == "Login") {
        var uData = userSheet.getDataRange().getValues();
        for (var u = 1; u < uData.length; u++) {
            if (String(uData[u][0]) === String(data.username) && String(uData[u][1]) === String(data.password)) {
                return ContentService.createTextOutput(JSON.stringify({
                    status: "success",
                    role: uData[u][2],
                    name: uData[u][3]
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sai tên đăng nhập hoặc mật khẩu" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.loai == "CreateUser") { 
        // SECURITY CHECK: Only Admin can create Admin. Manager cannot create Admin.
        if (data.role === 'admin' && data.requestorRole !== 'admin') {
             return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Bạn không có quyền tạo tài khoản Admin'})).setMimeType(ContentService.MimeType.JSON);
        }

        var uData = userSheet.getDataRange().getValues();
        for (var u = 1; u < uData.length; u++) {
           if (String(uData[u][0]) === String(data.username)) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Tên đăng nhập đã tồn tại'})).setMimeType(ContentService.MimeType.JSON);
        }
        userSheet.appendRow([data.username, data.password, data.role, data.fullname]);
        return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.loai == "ChangePassword") {
        var uData = userSheet.getDataRange().getValues();
        for (var u = 1; u < uData.length; u++) {
            if (String(uData[u][0]) === String(data.username)) {
                // Verify old password
                if (String(uData[u][1]) !== String(data.oldPassword)) {
                     return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Mật khẩu cũ không chính xác'})).setMimeType(ContentService.MimeType.JSON);
                }
                // Update Password
                userSheet.getRange(u + 1, 2).setValue(data.newPassword);
                return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "User not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.loai == "DeleteUser") {
        var uData = userSheet.getDataRange().getValues();
        var deleted = false;
        var message = "";
        
        for (var u = uData.length - 1; u >= 1; u--) {
            if (String(uData[u][0]) === String(data.username)) {
                // SECURITY CHECK: Manager cannot delete Admin
                var targetRole = uData[u][2];
                if (targetRole === 'admin' && data.requestorRole !== 'admin') {
                    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Bạn không có quyền xóa Admin'})).setMimeType(ContentService.MimeType.JSON);
                }
                
                userSheet.deleteRow(u + 1);
                deleted = true;
                break; // Delete one and break
            }
        }
        if (deleted) return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
        else return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Không tìm thấy user" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.loai == "GetUsers") {
        var uData = userSheet.getDataRange().getValues();
        var usersList = [];
        for (var u = 1; u < uData.length; u++) {
            usersList.push({ username: uData[u][0], password: uData[u][1], role: uData[u][2], fullname: uData[u][3] });
        }
        return ContentService.createTextOutput(JSON.stringify(usersList)).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 3. BLIND CHECK APIs
    // ==========================================
    
    // API: Create a new blind check session
    if (data.loai == "CreateBlindSession") {
        var sessionId = new Date().getTime().toString();
        var createdAt = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
        sessionSheet.appendRow([sessionId, data.user1, data.user2, "pending", "pending", createdAt, "pending"]);
        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            sessionId: sessionId,
            user1: data.user1,
            user2: data.user2
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Get active session for a user
    if (data.loai == "GetBlindSession") {
        var sData = sessionSheet.getDataRange().getValues();
        for (var s = sData.length - 1; s >= 1; s--) {
            var row = sData[s];
            // Check if user is part of this session and session is not completed
            if ((String(row[1]) === String(data.username) || String(row[2]) === String(data.username)) && row[6] !== "applied") {
                var userSlot = (String(row[1]) === String(data.username)) ? 1 : 2;
                var myStatus = (userSlot === 1) ? row[3] : row[4];
                var otherStatus = (userSlot === 1) ? row[4] : row[3];
                return ContentService.createTextOutput(JSON.stringify({
                    status: "success",
                    sessionId: String(row[0]),
                    user1: row[1],
                    user2: row[2],
                    userSlot: userSlot,
                    myStatus: myStatus,
                    otherStatus: otherStatus,
                    result: row[6],
                    createdAt: row[5]
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "none" })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Get all sessions (for admin view)
    if (data.loai == "GetAllBlindSessions") {
        var sData = sessionSheet.getDataRange().getValues();
        var sessions = [];
        for (var s = 1; s < sData.length; s++) {
            sessions.push({
                sessionId: String(sData[s][0]),
                user1: sData[s][1],
                user2: sData[s][2],
                status1: sData[s][3],
                status2: sData[s][4],
                createdAt: sData[s][5],
                result: sData[s][6]
            });
        }
        return ContentService.createTextOutput(JSON.stringify(sessions)).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Save blind check data
    if (data.loai == "SaveBlindCheck") {
        var targetSheet = (data.slot === 1) ? blindCheck1Sheet : blindCheck2Sheet;
        var createdAt = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
        
        // Check if entry already exists for this session+sku+hsd
        var existingData = targetSheet.getDataRange().getValues();
        var found = false;
        for (var e = 1; e < existingData.length; e++) {
            if (String(existingData[e][0]) === String(data.sessionId) &&
                String(existingData[e][1]) === String(data.sku) &&
                String(existingData[e][3]) === String(data.hsd)) {
                // Update existing
                targetSheet.getRange(e + 1, 5).setValue(data.quantity);
                found = true;
                break;
            }
        }
        
        if (!found) {
            targetSheet.appendRow([data.sessionId, data.sku, data.name, data.hsd, data.quantity, data.username, createdAt]);
        }
        
        return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Get my blind check entries
    if (data.loai == "GetMyBlindEntries") {
        var targetSheet = (data.slot === 1) ? blindCheck1Sheet : blindCheck2Sheet;
        var entries = [];
        var eData = targetSheet.getDataRange().getValues();
        for (var e = 1; e < eData.length; e++) {
            if (String(eData[e][0]) === String(data.sessionId)) {
                entries.push({
                    sku: String(eData[e][1]),
                    name: eData[e][2],
                    hsd: eData[e][3],
                    quantity: Number(eData[e][4])
                });
            }
        }
        return ContentService.createTextOutput(JSON.stringify(entries)).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Mark blind check as done
    if (data.loai == "MarkBlindDone") {
        var sData = sessionSheet.getDataRange().getValues();
        for (var s = 1; s < sData.length; s++) {
            if (String(sData[s][0]) === String(data.sessionId)) {
                var colToUpdate = (data.slot === 1) ? 4 : 5; // STATUS_1 or STATUS_2
                sessionSheet.getRange(s + 1, colToUpdate).setValue("done");
                
                // Check if both are done
                var otherCol = (data.slot === 1) ? 5 : 4;
                var otherStatus = sessionSheet.getRange(s + 1, otherCol).getValue();
                
                if (otherStatus === "done") {
                    // Both done - compare results
                    var data1 = blindCheck1Sheet.getDataRange().getValues();
                    var data2 = blindCheck2Sheet.getDataRange().getValues();
                    
                    var entries1 = {};
                    var entries2 = {};
                    
                    for (var i = 1; i < data1.length; i++) {
                        if (String(data1[i][0]) === String(data.sessionId)) {
                            var key = String(data1[i][1]) + "|" + String(data1[i][3]);
                            entries1[key] = { sku: String(data1[i][1]), name: data1[i][2], hsd: data1[i][3], qty: Number(data1[i][4]) };
                        }
                    }
                    for (var i = 1; i < data2.length; i++) {
                        if (String(data2[i][0]) === String(data.sessionId)) {
                            var key = String(data2[i][1]) + "|" + String(data2[i][3]);
                            entries2[key] = { sku: String(data2[i][1]), name: data2[i][2], hsd: data2[i][3], qty: Number(data2[i][4]) };
                        }
                    }
                    
                    // Check if all match
                    var allMatch = true;
                    var allKeys = Object.keys(entries1).concat(Object.keys(entries2));
                    var uniqueKeys = allKeys.filter(function(v, i, a) { return a.indexOf(v) === i; });
                    
                    for (var k = 0; k < uniqueKeys.length; k++) {
                        var key = uniqueKeys[k];
                        if (!entries1[key] || !entries2[key] || entries1[key].qty !== entries2[key].qty) {
                            allMatch = false;
                            break;
                        }
                    }
                    
                    sessionSheet.getRange(s + 1, 7).setValue(allMatch ? "match" : "mismatch");
                }
                
                return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Session not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Get blind check comparison result
    if (data.loai == "GetBlindCheckResult") {
        var data1 = blindCheck1Sheet.getDataRange().getValues();
        var data2 = blindCheck2Sheet.getDataRange().getValues();
        
        var entries1 = {};
        var entries2 = {};
        
        for (var i = 1; i < data1.length; i++) {
            if (String(data1[i][0]) === String(data.sessionId)) {
                var key = String(data1[i][1]) + "|" + String(data1[i][3]);
                entries1[key] = { sku: String(data1[i][1]), name: data1[i][2], hsd: data1[i][3], qty: Number(data1[i][4]) };
            }
        }
        for (var i = 1; i < data2.length; i++) {
            if (String(data2[i][0]) === String(data.sessionId)) {
                var key = String(data2[i][1]) + "|" + String(data2[i][3]);
                entries2[key] = { sku: String(data2[i][1]), name: data2[i][2], hsd: data2[i][3], qty: Number(data2[i][4]) };
            }
        }
        
        var matches = [];
        var mismatches = [];
        
        var allKeys = Object.keys(entries1).concat(Object.keys(entries2));
        var uniqueKeys = allKeys.filter(function(v, i, a) { return a.indexOf(v) === i; });
        
        for (var k = 0; k < uniqueKeys.length; k++) {
            var key = uniqueKeys[k];
            var e1 = entries1[key];
            var e2 = entries2[key];
            
            if (e1 && e2 && e1.qty === e2.qty) {
                matches.push({ sku: e1.sku, name: e1.name, hsd: e1.hsd, qty1: e1.qty, qty2: e2.qty });
            } else {
                mismatches.push({
                    sku: (e1 || e2).sku,
                    name: (e1 || e2).name,
                    hsd: (e1 || e2).hsd,
                    qty1: e1 ? e1.qty : null,
                    qty2: e2 ? e2.qty : null
                });
            }
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            matches: matches,
            mismatches: mismatches
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Apply matched results to main inventory
    if (data.loai == "ApplyBlindResult") {
        // Update session status
        var sData = sessionSheet.getDataRange().getValues();
        for (var s = 1; s < sData.length; s++) {
            if (String(sData[s][0]) === String(data.sessionId)) {
                sessionSheet.getRange(s + 1, 7).setValue("applied");
                break;
            }
        }
        
        // Apply matched items to main kho
        var items = data.items; // Array of {sku, name, hsd, qty}
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            // Use existing KiemKe logic
            var skuInput = String(item.sku).trim();
            var hsdInputStr = String(item.hsd).trim().substring(0, 10);
            var qtyInput = Number(item.qty);
            var nameInput = item.name;
            
            // Read current data
            var range = sheet.getDataRange();
            var values = range.getValues();
            var cleanData = [];
            var lastSeenSku = "";
            var lastSeenName = "";
            
            for (var r = 1; r < values.length; r++) {
                var row = values[r];
                var rSku = String(row[0]).trim();
                var rName = String(row[1]);
                if (rSku === "" && lastSeenSku !== "") { rSku = lastSeenSku; rName = (lastSeenName !== "") ? lastSeenName : rName; }
                else if (rSku !== "") { lastSeenSku = rSku; lastSeenName = rName; }
                if (rSku === "") continue;
                if (rName === "") continue;
                var rDateVal = row[2];
                var rDateStr = "";
                if (rDateVal instanceof Date) rDateStr = Utilities.formatDate(rDateVal, "GMT+7", "yyyy-MM-dd");
                else rDateStr = String(rDateVal).trim().substring(0, 10);
                cleanData.push({ sku: rSku, name: rName, date: rDateStr, qty: Number(row[3]) });
            }
            
            // Update or add
            var found = false;
            for (var j = 0; j < cleanData.length; j++) {
                if (cleanData[j].sku === skuInput && cleanData[j].date === hsdInputStr) {
                    cleanData[j].qty = qtyInput;
                    cleanData[j].name = nameInput;
                    found = true;
                    break;
                }
            }
            if (!found) cleanData.push({ sku: skuInput, name: nameInput, date: hsdInputStr, qty: qtyInput });
        }
        
        return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // API: Reset session for re-checking mismatched items only
    if (data.loai == "RecheckMismatched") {
        var sData = sessionSheet.getDataRange().getValues();
        for (var s = 1; s < sData.length; s++) {
            if (String(sData[s][0]) === String(data.sessionId)) {
                // Reset statuses to pending
                sessionSheet.getRange(s + 1, 4).setValue("pending"); // STATUS_1
                sessionSheet.getRange(s + 1, 5).setValue("pending"); // STATUS_2
                sessionSheet.getRange(s + 1, 7).setValue("recheck"); // RESULT = recheck
                break;
            }
        }
        
        // Clear old entries for this session and keep only mismatched items to re-check
        var mismatches = data.mismatches; // Array of {sku, name, hsd}
        
        // Clear KIEM_KHO_1 entries for this session
        var data1 = blindCheck1Sheet.getDataRange().getValues();
        for (var i = data1.length - 1; i >= 1; i--) {
            if (String(data1[i][0]) === String(data.sessionId)) {
                blindCheck1Sheet.deleteRow(i + 1);
            }
        }
        
        // Clear KIEM_KHO_2 entries for this session
        var data2 = blindCheck2Sheet.getDataRange().getValues();
        for (var i = data2.length - 1; i >= 1; i--) {
            if (String(data2[i][0]) === String(data.sessionId)) {
                blindCheck2Sheet.deleteRow(i + 1);
            }
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
            status: "success", 
            message: "Phiên đã được reset để kiểm lại các mục sai lệch"
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 4. INVENTORY LOGIC (Existing)
    sheet.getRange("G1").setValue("VER 9.1 DYNAMIC").setFontColor("purple").setFontWeight("bold");

    if (data.loai == "ResetKho") {
      sheet.clear();
      sheet.getRange("A:A").setNumberFormat("@");
      sheet.appendRow(["MÃ SKU", "TÊN SẢN PHẨM", "HẠN DÙNG", "SL LÔ", "TRẠNG THÁI", "TỔNG TỒN"]);
      sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#434343").setFontColor("white").setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      return ContentService.createTextOutput("Reset Done").setMimeType(ContentService.MimeType.TEXT);
    }

    // Read Data
    var range = sheet.getDataRange();
    var values = range.getValues(); 
    var cleanData = [];
    var lastSeenSku = "";
    var lastSeenName = "";

    for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var rSku = String(row[0]).trim();
        var rName = String(row[1]);
        
        if (rSku === "" && lastSeenSku !== "") { rSku = lastSeenSku; rName = (lastSeenName !== "") ? lastSeenName : rName; } 
        else if (rSku !== "") { lastSeenSku = rSku; lastSeenName = rName; }

        // STRICT VALIDATION: If SKU is still empty, skip this row entirely
        if (rSku === "") continue;
        // If Name is empty (and couldn't be filled by merge logic), skip
        if (rName === "") continue;

        if (rSku === "" && String(row[2]) === "") continue;

        var rDateVal = row[2];
        var rDateStr = "";
        if (rDateVal instanceof Date) rDateStr = Utilities.formatDate(rDateVal, "GMT+7", "yyyy-MM-dd");
        else rDateStr = String(rDateVal).trim().substring(0, 10);

        cleanData.push({ sku: rSku, name: rName, date: rDateStr, qty: Number(row[3]) });
    }

    if (data.loai == "GetData") {
       return ContentService.createTextOutput(JSON.stringify(cleanData)).setMimeType(ContentService.MimeType.JSON);
    }

    // Write Logic
    var skuInput = String(data.sku).trim();
    var hsdInputStr = String(data.hsd).trim().substring(0, 10);
    var qtyInput = Number(data.so_luong);
    var nameInput = data.ten_san_pham; 
    
    var found = false;
    
    if (data.loai === "XoaMuc") {
       var newData = [];
       for (var j = 0; j < cleanData.length; j++) {
         if (cleanData[j].sku === skuInput && cleanData[j].date === hsdInputStr) found = true; 
         else newData.push(cleanData[j]);
       }
       cleanData = newData;
    } else {
      for (var j = 0; j < cleanData.length; j++) {
        if (cleanData[j].sku === skuInput && cleanData[j].date === hsdInputStr) {
          if (data.loai === "KiemKe") cleanData[j].qty = qtyInput;
          else cleanData[j].qty += qtyInput;
          cleanData[j].name = nameInput; 
          found = true;
          break;
        }
      }
      if (!found) cleanData.push({ sku: skuInput, name: nameInput, date: hsdInputStr, qty: qtyInput });
    }

    cleanData.sort(function(a, b) {
      var skuDiff = a.sku.localeCompare(b.sku);
      if (skuDiff !== 0) return skuDiff;
      return a.date.localeCompare(b.date);
    });

    if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clear(); 
    
    var outputRows = [];
    var today = new Date();
    var mergeRanges = []; 
    var totalRanges = []; 
    var currentSku = "";
    var startRowIndex = 0; 
    var groupQty = 0;

    for (var k = 0; k < cleanData.length; k++) {
      var item = cleanData[k];
      var status = "OK";
      var d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        var diff = Math.ceil((d - today) / 86400000);
        if (diff < 0) status = "HẾT HẠN";
        else if (diff < 30) status = "1 Tháng";
        else if (diff < 60) status = "2 Tháng";
        else if (diff < 90) status = "3 Tháng";
      }

      outputRows.push([item.sku, item.name, item.date, item.qty, status, ""]);

      var isLast = (k === cleanData.length - 1);
      var isNextDiff = !isLast && (cleanData[k+1].sku !== item.sku);

      if (item.sku !== currentSku) {
        currentSku = item.sku;
        startRowIndex = k;
        groupQty = item.qty;
      } else {
        groupQty += item.qty;
      }

      if (isLast || isNextDiff) {
        var sheetStartRow = startRowIndex + 2; 
        var numRows = k - startRowIndex + 1;
        if (numRows > 1) mergeRanges.push({r: sheetStartRow, nr: numRows, val: groupQty});
        else totalRanges.push({r: sheetStartRow, val: groupQty});
      }
    }

    if (outputRows.length > 0) {
      sheet.getRange(2, 1, outputRows.length, 6).setValues(outputRows);
      var fullRange = sheet.getRange(2, 1, outputRows.length, 6);
      fullRange.setVerticalAlignment("middle").setBorder(true, true, true, true, true, true, "#e0e0e0", SpreadsheetApp.BorderStyle.SOLID);
      
      for (var m = 0; m < mergeRanges.length; m++) {
        var mg = mergeRanges[m];
        sheet.getRange(mg.r, 1, mg.nr, 1).merge().setFontWeight("bold");
        sheet.getRange(mg.r, 2, mg.nr, 1).merge();
        sheet.getRange(mg.r, 6, mg.nr, 1).merge().setValue(mg.val).setBackground("#f5f5f5").setFontWeight("bold").setHorizontalAlignment("center");
      }
      for (var t = 0; t < totalRanges.length; t++) {
        var tr = totalRanges[t];
        sheet.getRange(tr.r, 6).setValue(tr.val).setBackground("#f5f5f5").setFontWeight("bold").setHorizontalAlignment("center");
      }
      
      var statusColors = [];
      var fontColors = [];
      for (var s = 0; s < outputRows.length; s++) {
        var txt = outputRows[s][4];
        if (txt === "HẾT HẠN") { statusColors.push(["#b71c1c"]); fontColors.push(["#ffffff"]); }
        else if (txt === "1 Tháng") { statusColors.push(["#c62828"]); fontColors.push(["#ffffff"]); }
        else if (txt === "2 Tháng") { statusColors.push(["#d32f2f"]); fontColors.push(["#ffffff"]); }
        else if (txt === "3 Tháng") { statusColors.push(["#ef6c00"]); fontColors.push(["#ffffff"]); }
        else { statusColors.push(["#e8f5e9"]); fontColors.push(["#2e7d32"]); }
      }
      sheet.getRange(2, 5, outputRows.length, 1).setBackgrounds(statusColors).setFontColors(fontColors).setFontWeight("bold").setHorizontalAlignment("center");
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}