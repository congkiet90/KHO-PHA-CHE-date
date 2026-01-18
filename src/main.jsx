import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Camera, Package, List, Save, CheckCircle2, 
  AlertCircle, Database, LayoutDashboard, 
  Clock, RotateCcw, Search, X, RefreshCw, Lock, AlertTriangle 
} from 'lucide-react';

// --- 1. CẤU HÌNH HỆ THỐNG ---
const FIXED_SHEET_URL = "https://script.google.com/macros/s/AKfycbwUCPOacIF5FDOAuo8e8266cgntJU18LqgEywK70iFimEaral_XmDCfvEf10aJ_hmXl/exec";
const RESET_PASSWORD = "040703";

// --- 2. DANH SÁCH 177 SẢN PHẨM ĐẦY ĐỦ ---
const SKU_LIST = [
  { sku: "110011", name: "Cà phê chế phin 1-500Gr", unit: "KG", min: 10 },
  { sku: "210014", name: "Cà phê chế phin 4-500Gr", unit: "KG", min: 10 },
  { sku: "310015", name: "Cà phê chế phin 5-500Gr", unit: "KG", min: 10 },
  { sku: "410027", name: "Cà phê Gourmet Blend - 500gr", unit: "HOP", min: 5 },
  { sku: "10227", name: "NL bar - Đá tinh khiết", unit: "KG", min: 20 },
  { sku: "10255", name: "NL-Gừng tươi", unit: "KG", min: 2 },
  { sku: "10301", name: "NL-Rau húng lũi", unit: "KG", min: 1 },
  { sku: "10318", name: "NL Bar-Sira tươi", unit: "KG", min: 1 },
  { sku: "10348", name: "NL bếp - Sả cây", unit: "KG", min: 2 },
  { sku: "10386", name: "Dao thái trung", unit: "CAI", min: 1 },
  { sku: "10398", name: "Gạt Tàn Vuông", unit: "CAI", min: 5 },
  { sku: "10423", name: "Muỗng cà phê đá Inox", unit: "CAL", min: 10 },
  { sku: "10424", name: "Muỗng cà phê nóng Inox", unit: "CAI", min: 10 },
  { sku: "10427", name: "Muông Inox Lớn (ăn cơm)", unit: "CAI", min: 10 },
  { sku: "10481", name: "Cà phê Sáng tạo 8-250gr", unit: "KG", min: 5 },
  { sku: "10483", name: "Cà phê Sáng tạo 8-500gr", unit: "KG", min: 5 },
  { sku: "10506", name: "NL-Đường cát", unit: "KG", min: 10 },
  { sku: "10564", name: "NL bar - Bột quế", unit: "KG", min: 1 },
  { sku: "10589", name: "Bao rác đen (90x110)", unit: "KG", min: 5 },
  { sku: "10597", name: "Bao tay cao su", unit: "DOI", min: 5 },
  { sku: "10673", name: "NL Bar-Trà anta", unit: "KG", min: 5 },
  { sku: "10731", name: "Ly đo lường nhựa 100ml", unit: "CAI", min: 2 },
  { sku: "10811", name: "Ông hút nóng", unit: "BICH", min: 3 },
  { sku: "10923", name: "Nước lau kính", unit: "CHAI", min: 2 },
  { sku: "10927", name: "Nước rửa chén - 3,6lit", unit: "BINH", min: 2 },
  { sku: "10938", name: "Mouse rửa chén", unit: "CAI", min: 5 },
  { sku: "10939", name: "Màng bọc thực phẩm", unit: "CUON", min: 2 },
  { sku: "11054", name: "Kéo cắt thức ăn", unit: "CAY", min: 2 },
  { sku: "11168", name: "Bao tay xốp", unit: "KG", min: 2 },
  { sku: "11209", name: "Muôi thái", unit: "KG", min: 1 },
  { sku: "11253", name: "Phin nhôm đen Legend", unit: "CAI", min: 5 },
  { sku: "11285", name: "Hũ thủy tinh Ocean nắp gỗ 350ml", unit: "CAI", min: 3 },
  { sku: "11585", name: "Cà phê Legend 225gr", unit: "HOP", min: 5 },
  { sku: "11587", name: "Cà Phê Legend Cappucino Hazelnut", unit: "HOP", min: 3 },
  { sku: "11589", name: "Cà Phê Legend Cappucino Mocha", unit: "HOP", min: 3 },
  { sku: "11590", name: "Cà Phê G7 hòa tan đen hộp 15 gói", unit: "HOP", min: 5 },
  { sku: "11593", name: "Cà phê G7 3in1 bịch 50 sachets", unit: "BICH", min: 5 },
  { sku: "11594", name: "Cà phê G7 3in1 - Hộp 18 sticks", unit: "HOP", min: 5 },
  { sku: "11595", name: "Cà phê G7 3in1 - Hộp 21", unit: "HOP", min: 5 },
  { sku: "11596", name: "Cà phê Legend Passiona - hộp 14 sticks", unit: "HOP", min: 3 },
  { sku: "11597", name: "Cà phê G7 2in1 hộp 15 sachets", unit: "HOP", min: 5 },
  { sku: "11631", name: "Cà Phê G7 gu mạnh 3in1 12stick", unit: "HOP", min: 3 },
  { sku: "11645", name: "Bộ lau nhà 360 độ", unit: "BO", min: 1 },
  { sku: "11848", name: "Cà phê Premium Blend 425gr", unit: "LON", min: 5 },
  { sku: "12665", name: "Dĩa Cappuccino gốm nâu", unit: "CAL", min: 10 },
  { sku: "12666", name: "Tách Cappuccino gốm nâu", unit: "CAI", min: 10 },
  { sku: "12781", name: "Nước rửa tay 500ml", unit: "CHAI", min: 3 },
  { sku: "12796", name: "NL-Lá dứa", unit: "KG", min: 1 },
  { sku: "12806", name: "Cà phê Sáng tạo 1 340gr", unit: "GOI", min: 5 },
  { sku: "12807", name: "Cà phê Sáng tạo 2 340gr", unit: "GOI", min: 5 },
  { sku: "12808", name: "Cà phê Sáng tạo 3 340gr", unit: "GOL", min: 5 },
  { sku: "12809", name: "Cà phê Sáng tạo 4 340gr", unit: "GOI", min: 5 },
  { sku: "12810", name: "Cà phê Sáng tạo 5 340gr", unit: "GOI", min: 5 },
  { sku: "12854", name: "Sữa đặc có đường TN Brother", unit: "LON", min: 12 },
  { sku: "13318", name: "Muỗng lớn delivery", unit: "CAI", min: 20 },
  { sku: "15314", name: "Sách Quốc gia khởi nghiệp nhỏ", unit: "QUYEN", min: 2 },
  { sku: "15973", name: "Ly Thông Điệp Sáng Tạo Legend", unit: "CAL", min: 10 },
  { sku: "16753", name: "Kronos Đào ngâm 820g", unit: "HU", min: 6 },
  { sku: "17009", name: "Hũ thủy tinh nắp cài Fido 2L", unit: "HU", min: 2 },
  { sku: "18312", name: "NL Bar - Đường que vàng 4gr", unit: "GOI", min: 100 },
  { sku: "19096", name: "Túi chữ T 12oz logo E-coffee", unit: "KG", min: 2 },
  { sku: "19144", name: "Ca inox zebra 1.9L có nắp", unit: "CAI", min: 1 },
  { sku: "19151", name: "Túi xốp có quai nhỏ e-coffee", unit: "KG", min: 2 },
  { sku: "19153", name: "Túi hột xoài lớn e-coffee", unit: "KG", min: 2 },
  { sku: "19241", name: "Cà phê Phin E-Coffee 500gr", unit: "GOI", min: 5 },
  { sku: "19246", name: "Bột Kem Pha CP 1kg", unit: "KG", min: 5 },
  { sku: "19327", name: "Chai thủy tinh nút gài 1000ml", unit: "CAI", min: 5 },
  { sku: "19385", name: "Hũ thủy tinh nắp gài 1L", unit: "CAT", min: 5 },
  { sku: "19745", name: "Legend cà phê sữa đá - 9 sticks", unit: "HOP", min: 5 },
  { sku: "19876", name: "Cà phê Legend Classic - 12 sachts", unit: "HOP", min: 5 },
  { sku: "19877", name: "Cà phê Legend Special Ed - 18 sticks", unit: "HOP", min: 5 },
  { sku: "19912", name: "Bình giữ nhiệt VF013 - Đen", unit: "CAI", min: 2 },
  { sku: "20061", name: "NL Bar - Chanh không hạt", unit: "KG", min: 3 },
  { sku: "20147", name: "Chổi quét bột cà phê", unit: "CAI", min: 2 },
  { sku: "20148", name: "Ông hút trong phi 6", unit: "KG", min: 2 },
  { sku: "20149", name: "Bột VS máy pha Cafe Cafiza", unit: "CHAI", min: 1 },
  { sku: "20426", name: "Nước tẩy rửa SUMO 700gr", unit: "CHAI", min: 2 },
  { sku: "20549", name: "Ống hút trân châu", unit: "KG", min: 2 },
  { sku: "21025", name: "Nắp bật đen 9oz", unit: "CAI", min: 50 },
  { sku: "21043", name: "Hạt chia Úc 500gr", unit: "GOI", min: 1 },
  { sku: "21044", name: "Mứt việt quất Osterberg", unit: "CHAI", min: 2 },
  { sku: "21319", name: "Cà phê Cappuccino Coconut", unit: "HOP", min: 3 },
  { sku: "21386", name: "Nắp cầu PET ly 12-16oz", unit: "CAI", min: 50 },
  { sku: "21396", name: "TNE - Cà Phê Hạt 1kg", unit: "KG", min: 5 },
  { sku: "21833", name: "Cà phê phin giấy - Americano", unit: "HOP", min: 3 },
  { sku: "21834", name: "Cà phê phin giấy - Fusion Blend", unit: "HOP", min: 3 },
  { sku: "21856", name: "Túi take away (túi đơn)", unit: "KG", min: 2 },
  { sku: "21857", name: "Túi take away (túi đôi)", unit: "KG", min: 2 },
  { sku: "21860", name: "Cà Phê Hạt Mộc Legend Success 3", unit: "LON", min: 3 },
  { sku: "21861", name: "Cà Phê Hạt Mộc Legend Success 8", unit: "LON", min: 3 },
  { sku: "21921", name: "Phin nhôm hoa văn TN Bạc", unit: "CAI", min: 5 },
  { sku: "21928", name: "Phin nhôm đen Vì Nhân", unit: "CAI", min: 5 },
  { sku: "22050", name: "Tách thủy tinh nóng", unit: "CAI", min: 10 },
  { sku: "22051", name: "Dĩa thủy tinh nóng", unit: "CAI", min: 10 },
  { sku: "22074", name: "Ly trà đá sanmarino logo EC", unit: "CAI", min: 20 },
  { sku: "22128", name: "Cà phê Legend Special Edition - 9st", unit: "HOP", min: 5 },
  { sku: "22196", name: "Giấy in bill K80x60", unit: "CUON", min: 5 },
  { sku: "22253", name: "Ly giấy 9oz logo EC", unit: "CAI", min: 50 },
  { sku: "22377", name: "Ly giấy 12oz logo EC", unit: "CAI", min: 50 },
  { sku: "22668", name: "NL Bar - Bột sương sáo 3K", unit: "GOI", min: 5 },
  { sku: "22745", name: "Chunky - Lê Cúc", unit: "TUI", min: 3 },
  { sku: "22809", name: "Ly ocean Long Drink 495ml", unit: "CAI", min: 12 },
  { sku: "22820", name: "Chanh muối đường EC - 900gr", unit: "HU", min: 2 },
  { sku: "22821", name: "Hoa hibicus - gói 200gr", unit: "GOI", min: 1 },
  { sku: "22822", name: "NL Bar - Nước cốt dừa 400ml", unit: "LON", min: 6 },
  { sku: "22838", name: "Kỷ tử - 250gr", unit: "GOI", min: 1 },
  { sku: "22839", name: "Nhãn nhục EC - 100gr", unit: "TUI", min: 1 },
  { sku: "22840", name: "Hoa cúc khô EC - 100gr", unit: "TUI", min: 1 },
  { sku: "22905", name: "Trà đào Cozy EC - 400gr", unit: "GOI", min: 3 },
  { sku: "22969", name: "Cà Phê Legend Classic - Túi 50st", unit: "BICH", min: 5 },
  { sku: "22984", name: "Thiên - Bộ Thiên 2 ly", unit: "BO", min: 2 },
  { sku: "22987", name: "Roman - Bình Moka CF Roman", unit: "BINH", min: 1 },
  { sku: "23051", name: "Củ năng ngâm đường - 560gr", unit: "LON", min: 5 },
  { sku: "23052", name: "Bột cacao - 250gr", unit: "GOI", min: 2 },
  { sku: "23078", name: "Nắp cầu PET ly nhựa 500ml", unit: "CAI", min: 50 },
  { sku: "23080", name: "Mật ong hoa nhãn - 600ml", unit: "CHAI", min: 2 },
  { sku: "23161", name: "Ly nhựa 500ml Logo EC", unit: "CAI", min: 50 },
  { sku: "23163", name: "Xí muội (không hạt) - 100gr", unit: "GOI", min: 1 },
  { sku: "23257", name: "Bột Kem Béo / Whipping cream", unit: "KG", min: 5 },
  { sku: "23454", name: "Bột kem cà phê 200gr", unit: "TUI", min: 5 },
  { sku: "23630", name: "Hộp quà giàu có 2023", unit: "HOP", min: 2 },
  { sku: "23771", name: "Phin nhôm hoa văn Trung Nguyên vàng", unit: "CAI", min: 5 },
  { sku: "23782", name: "Phin nhôm hoa văn Trung Nguyên nâu", unit: "CAI", min: 5 },
  { sku: "23826", name: "Cà Phê Legend Americano - 15 gói", unit: "HOP", min: 3 },
  { sku: "23905", name: "Ly Centra Hi Ball 300ml - EC", unit: "CAI", min: 12 },
  { sku: "24008", name: "Khăn giấy 24*24cm logo EC", unit: "BICH", min: 10 },
  { sku: "24013", name: "Ly bạc sỉu C13013-Logo EC", unit: "CAI", min: 12 },
  { sku: "24048", name: "Bột Trà xanh Matcha Special", unit: "GOI", min: 2 },
  { sku: "24052", name: "NL - Bột kem mặn 1kg", unit: "TUI", min: 3 },
  { sku: "24120", name: "Bột giặt - Bịch 0,8kg", unit: "BICH", min: 1 },
  { sku: "24168", name: "Cà Phê G7 Gold RuMi - 14st", unit: "HOP", min: 3 },
  { sku: "24169", name: "Cà Phê G7 Gold Picasso Latte", unit: "HOP", min: 3 },
  { sku: "24170", name: "Cà Phê G7 Gold Motherland", unit: "HOP", min: 3 },
  { sku: "24238", name: "Sữa Yến Mạch - 1L", unit: "HOP", min: 6 },
  { sku: "24845", name: "Bình giữ nhiệt 350ml - Thiền", unit: "CAI", min: 2 },
  { sku: "24846", name: "Bình giữ nhiệt 350ml - Roman", unit: "CAI", min: 2 },
  { sku: "24847", name: "Bình giữ nhiệt 350ml - Ottoman", unit: "CAI", min: 2 },
  { sku: "24932", name: "Bình giữ nhiệt VF128", unit: "CAI", min: 2 },
  { sku: "24956", name: "Túi vải canvas G7 Gold", unit: "CAI", min: 5 },
  { sku: "25001", name: "Bột quế DH", unit: "HU", min: 2 },
  { sku: "25062", name: "Ly sứ Legend VIP đen", unit: "BO", min: 2 },
  { sku: "25097", name: "Chunky - Xoài", unit: "TUI", min: 3 },
  { sku: "25101", name: "BGN VF013 350ml - Hawking", unit: "CAI", min: 2 },
  { sku: "25103", name: "BGN VF013 350ml - Napoléon", unit: "CAI", min: 2 },
  { sku: "25104", name: "BGN VF013 350ml - Jonathan", unit: "CAI", min: 2 },
  { sku: "25156", name: "Chunky - Nhân Hoa Mộc Tê", unit: "TUI", min: 2 },
  { sku: "25171", name: "Mật ong Rừng Nhiệt Đới 700g", unit: "CHAI", min: 2 },
  { sku: "25202", name: "Đào ngâm Countree 820g", unit: "LON", min: 6 },
  { sku: "25213", name: "Hòa tan Sấy lạnh Legend Gold", unit: "HU", min: 5 },
  { sku: "25223", name: "Túi Canvas Thiền", unit: "CAI", min: 3 },
  { sku: "25224", name: "Túi canvas Roman", unit: "CAI", min: 3 },
  { sku: "25225", name: "Túi canvas Ottoman", unit: "CAI", min: 3 },
  { sku: "25250", name: "Bút bi tre (T.S.Eliot)", unit: "CAY", min: 5 },
  { sku: "25254", name: "Bút bi tre (Jefferson)", unit: "CAY", min: 5 },
  { sku: "25255", name: "Bút bi tre (Franklin)", unit: "CAY", min: 5 },
  { sku: "25284", name: "BGN VF254 600ML - white", unit: "CAI", min: 2 },
  { sku: "25285", name: "BGN VF254 600ML - black", unit: "CAI", min: 2 },
  { sku: "25286", name: "BGN VF013 - Trắng", unit: "CAI", min: 2 },
  { sku: "25287", name: "BGN VF013 - Bạc", unit: "CAI", min: 2 },
  { sku: "25304", name: "Bộ móc khóa CCDC pha chế", unit: "BO", min: 5 },
  { sku: "25333", name: "Túi vải đay TNL Gold", unit: "CAI", min: 3 },
  { sku: "25377", name: "Sữa tươi Emborg 1L", unit: "HOP", min: 12 },
  { sku: "25379", name: "Nước cốt dừa Aroy-D 165ml", unit: "LON", min: 6 },
  { sku: "25413", name: "Tem phụ BGN TNE VF254", unit: "CAI", min: 10 },
  { sku: "25426", name: "Vỏ hộp quà tiêu chuẩn", unit: "HOP", min: 5 },
  { sku: "25428", name: "Túi vải đặc biệt TNL (trắng)", unit: "CAI", min: 5 },
  { sku: "25429", name: "Display TNL-Cappuchino", unit: "CAI", min: 1 },
  { sku: "25430", name: "Display TNL - Bộ 3", unit: "CAI", min: 1 },
  { sku: "25431", name: "Shelftalker TNL hòa tan", unit: "CAI", min: 5 },
  { sku: "25432", name: "Ly sứ TNL Cappuccino", unit: "CAI", min: 10 },
  { sku: "25433", name: "Wobler TNL hòa tan", unit: "CAI", min: 5 },
  { sku: "25434", name: "Bình giữ nhiệt TNL 2025", unit: "CAI", min: 2 },
  { sku: "25435", name: "Sample Kit bộ 3 (Tiếng Việt)", unit: "HOP", min: 2 },
  { sku: "25443", name: "Túi vải đặc biệt TNL (đen)", unit: "CAI", min: 5 },
  { sku: "25447", name: "Giấy rơm", unit: "B500", min: 1 },
  { sku: "25503", name: "Vỏ hộp quà Yêu Thương", unit: "HOP", min: 5 },
  { sku: "25559", name: "Mứt Táo đỏ long nhãn 1kg", unit: "HOP", min: 2 }
];

// --- 3. LOGIC CHÍNH CỦA ỨNG DỤNG ---
function App() {
  const [view, setView] = useState('scan'); 
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isAdjustment, setIsAdjustment] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const inventorySummary = useMemo(() => {
    const summary = {};
    logs.forEach(log => {
      const productSku = String(log.sku).trim();
      if (!summary[productSku]) {
        const prodInfo = SKU_LIST.find(s => s.sku === productSku);
        summary[productSku] = { 
          sku: productSku, 
          name: log.ten_san_pham, 
          unit: log.don_vi || "",
          min: prodInfo?.min || 5,
          totalQty: 0,
          batches: {} 
        };
      }
      const qty = Number(log.so_luong) || 0;
      const hsd = log.hsd || "Không có Date";
      if (log.loai === 'KiemKe') {
         summary[productSku].batches[hsd] = qty;
      } else {
         summary[productSku].batches[hsd] = (summary[productSku].batches[hsd] || 0) + qty;
      }
    });
    return Object.values(summary).map(item => {
      const total = Object.values(item.batches).reduce((sum, val) => sum + val, 0);
      return { ...item, totalQty: total };
    });
  }, [logs]);

  const getBatchColor = (hsd) => {
    if (!hsd || hsd === "Không có Date") return "text-gray-400";
    const today = new Date();
    const exp = new Date(hsd);
    const diffDays = Math.ceil((exp - today) / (86400000));
    if (diffDays < 0) return "text-red-600 font-bold"; 
    if (diffDays <= 120) return "text-orange-600 font-medium"; 
    if (diffDays <= 180) return "text-yellow-600"; 
    return "text-green-600"; 
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    const filtered = SKU_LIST.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm)
    ).slice(0, 15);
    setFilteredProducts(filtered);
  }, [searchTerm]);

  const selectProduct = (p) => {
    setSku(p.sku); setName(p.name); setUnit(p.unit);
    setSearchTerm(p.name); setShowSuggestions(false);
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSave = async () => {
    if (!sku || !quantity || !expiryDate) {
      showStatus('error', 'Điền đủ thông tin!'); return;
    }
    const newEntry = {
      thoi_gian: new Date().toLocaleString('vi-VN'),
      sku: String(sku).trim(), ten_san_pham: name, don_vi: unit,
      so_luong: quantity, hsd: expiryDate, loai: isAdjustment ? 'KiemKe' : 'NhapHang'
    };
    setIsSyncing(true);
    try {
      await fetch(FIXED_SHEET_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      setLogs([ {id: Date.now(), ...newEntry}, ...logs]);
      showStatus('success', 'Đã lưu kho!');
      setSku(''); setName(''); setSearchTerm(''); setQuantity(''); setExpiryDate(''); setUnit('');
    } catch (err) { showStatus('error', 'Lỗi kết nối!'); } finally { setIsSyncing(false); }
  };

  const handleReset = async () => {
    if (passwordInput !== RESET_PASSWORD) { alert("Mật khẩu sai!"); return; }
    setIsSyncing(true);
    try {
      await fetch(FIXED_SHEET_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: "ResetKho" })
      });
      setLogs([]); showStatus('success', 'Đã xóa kho!');
      setShowResetConfirm(false); setPasswordInput('');
    } catch (err) { showStatus('error', 'Lỗi!'); } finally { setIsSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24 select-none">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Kiệt Inventory</h1>
            <p className="text-[9px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Final v5.3</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
        </div>
      </header>

      {status && (
        <div className={`fixed top-16 left-4 right-4 z-[60] py-3 px-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          status.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold uppercase">{status.message}</span>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-50">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase">Admin Password</h3>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="******" className="w-full mt-4 p-4 bg-gray-100 border-none rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="py-3.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold uppercase">Hủy</button>
              <button onClick={handleReset} className="py-3.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase">Xóa kho</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 space-y-4">
        {view === 'scan' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-gray-200 p-1 rounded-xl flex text-[10px] font-bold uppercase">
              <button onClick={() => setIsAdjustment(false)} className={`flex-1 py-3 rounded-lg transition-all ${!isAdjustment ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Nhập Hàng</button>
              <button onClick={() => setIsAdjustment(true)} className={`flex-1 py-3 rounded-lg transition-all ${isAdjustment ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}>Kiểm Kê</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-5">
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Sản phẩm</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                    placeholder="Tìm tên hoặc SKU..."
                  />
                </div>
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                    {filteredProducts.map((p, idx) => (
                      <button key={idx} onClick={() => selectProduct(p)} className="w-full p-4 text-left border-b border-gray-50 hover:bg-blue-50 flex justify-between items-center group">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</div>
                          <div className="text-[9px] text-gray-400 mt-1 font-mono tracking-tighter">{p.sku} • Định mức: {p.min} {p.unit}</div>
                        </div>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold uppercase">{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {name && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center animate-in zoom-in-95">
                  <div className="flex-1 pr-2">
                    <span className="text-xs font-bold text-indigo-800 line-clamp-1">{name}</span>
                    <p className="text-[10px] text-indigo-400 font-medium mt-1 uppercase tracking-tight">Cần nhập khi còn: {SKU_LIST.find(s => s.sku === sku)?.min} {unit}</p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-white px-2 py-1 rounded shadow-sm shrink-0">{sku}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Số lượng</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full p-4 bg-gray-50 rounded-xl text-center text-2xl font-bold text-indigo-600 shadow-inner border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Hạn dùng</label>
                  <input 
                    type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                    className="w-full p-4 bg-gray-50 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave} disabled={isSyncing} 
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-lg ${
                  isSyncing ? 'bg-gray-300 text-gray-500' : (isAdjustment ? 'bg-orange-600 text-white shadow-orange-100' : 'bg-indigo-600 text-white shadow-indigo-100')
                }`}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{isSyncing ? 'Sending...' : 'Put in Store'}</span>
              </button>
            </div>
          </div>
        )}

        {view === 'summary' && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2"><Database size={14} /> All Man</h2>
              <button onClick={() => setShowResetConfirm(true)} className="text-[9px] font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 uppercase uppercase tracking-tighter">Clear All</button>
            </div>
            {inventorySummary.length === 0 ? (
              <div className="py-20 text-center text-gray-300 bg-white rounded-2xl border border-dashed border-gray-200"><Package size={48} className="mx-auto mb-3 opacity-20" /><p className="text-[10px] font-bold uppercase tracking-widest">Store Dry</p></div>
            ) : (
              <div className="space-y-3">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${item.totalQty <= item.min ? 'border-rose-300 ring-1 ring-rose-100' : 'border-gray-200'}`}>
                    <div className="p-4 flex justify-between items-center bg-gray-50/50">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-900 text-xs line-clamp-1">{item.name}</h3>
                           {item.totalQty <= item.min && (
                             <span className="text-[8px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1 shrink-0">
                               <AlertTriangle size={8} /> BUY MORE
                             </span>
                           )}
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono mt-1 uppercase">{item.sku} • Min: {item.min}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black tracking-tighter ${item.totalQty <= item.min ? 'text-rose-600' : 'text-gray-900'}`}>{item.totalQty}</span>
                        <span className="text-[9px] text-gray-400 ml-1 uppercase">{item.unit}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                        <div key={bIdx} className="p-3 flex justify-between items-center text-[10px] bg-white">
                          <div className={`flex items-center gap-2 ${getBatchColor(date)}`}><Clock size={12} /><span className="font-bold">{new Date(date).toLocaleDateString('vi-VN')}</span></div>
                          <span className="font-bold text-gray-600">{qty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><List size={14} /> Pass Tory</h2>
             <div className="space-y-3 pb-6">
              {logs.length === 0 ? (
                 <p className="text-xs text-gray-400 text-center py-10 italic">Nothin done happen.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">{log.thoi_gian}</p>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{log.ten_san_pham}</h4>
                      <div className="mt-1 flex gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase border ${log.loai === 'KiemKe' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{log.loai === 'KiemKe' ? 'Check' : 'In'}</span>
                      </div>
                    </div>
                    <div className="text-right"><span className="text-lg font-black text-gray-900">{log.so_luong}</span></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl px-2 py-2 flex justify-around items-center z-40 shadow-2xl">
        <button onClick={() => setView('scan')} className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${view === 'scan' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><Camera size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">In</span></button>
        <button onClick={() => setView('summary')} className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${view === 'summary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><LayoutDashboard size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">All</span></button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${view === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><List size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">Tory</span></button>
      </nav>
    </div>
  );
}

// --- 4. KHỞI CHẠY ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
