import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, Package, List, Save, CheckCircle2, 
  AlertCircle, Database, LayoutDashboard, 
  Clock, RotateCcw, Search, X, RefreshCw, Lock, 
  ChevronRight, Calendar, Box, Activity 
} from 'lucide-react';

// --- CẤU HÌNH LIÊN KẾT ---
const FIXED_SHEET_URL = "https://script.google.com/macros/s/AKfycbwUCPOacIF5FDOAuo8e8266cgntJU18LqgEywK70iFimEaral_XmDCfvEf10aJ_hmXl/exec";
const RESET_PASSWORD = "040703";

// --- DANH SÁCH 177 SẢN PHẨM (Đã bỏ min) ---
const SKU_LIST = [
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

export default function App() {
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

  // --- LOGIC GỘP TỒN KHO ---
  const inventorySummary = useMemo(() => {
    const summary = {};
    logs.forEach(log => {
      const productSku = String(log.sku).trim();
      if (!summary[productSku]) {
        summary[productSku] = { 
          sku: productSku, 
          name: log.ten_san_pham, 
          unit: log.don_vi || "",
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

  // Màu Date tinh tế
  const getBatchColor = (hsd) => {
    if (!hsd || hsd === "Không có Date") return "text-gray-400";
    const today = new Date();
    const exp = new Date(hsd);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600 font-bold bg-red-50 px-2 rounded"; 
    if (diffDays <= 120) return "text-orange-600 font-medium bg-orange-50 px-2 rounded"; 
    if (diffDays <= 180) return "text-yellow-600 font-medium"; 
    return "text-emerald-600 font-medium"; 
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
      {/* Header - Royal Blue Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-5 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-700 text-white p-2 rounded-xl shadow-md shadow-blue-200">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none tracking-tight">Kiệt Inventory</h1>
            <p className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Premium v6.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
           <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`}></span>
           <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Online</span>
        </div>
      </header>

      {/* Status Bar - Floating */}
      {status && (
        <div className={`fixed top-20 left-4 right-4 z-[60] py-3 px-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md ${
          status.type === 'success' ? 'bg-white/90 border-emerald-100 text-emerald-700' : 'bg-white/90 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      {/* Modal Reset - Minimal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Lock size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Xác thực Admin</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">Nhập mã PIN để xóa dữ liệu.</p>
            
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all mb-6"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="py-3 bg-white border border-gray-300 text-gray-600 rounded-xl text-xs font-bold uppercase hover:bg-gray-50">Hủy</button>
              <button onClick={handleReset} className="py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-red-700 shadow-md shadow-red-200">Xóa Ngay</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* VIEW 1: NHẬP & KIỂM KÊ */}
        {view === 'scan' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Mode Switcher */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex text-sm font-bold">
              <button 
                onClick={() => setIsAdjustment(false)} 
                className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${!isAdjustment ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <Package size={16} /> Nhập Hàng
              </button>
              <button 
                onClick={() => setIsAdjustment(true)} 
                className={`flex-1 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${isAdjustment ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <ClipboardCheck size={16} /> Kiểm Kê
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Tìm kiếm */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Sản phẩm</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold"
                      placeholder="Gõ tên để tìm..."
                    />
                    {searchTerm && (
                      <button onClick={() => {setSearchTerm(''); setSku(''); setName('');}} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  {/* Dropdown Gợi ý */}
                  {showSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-gray-50 ring-4 ring-gray-50">
                      {filteredProducts.map((p, idx) => (
                        <button key={idx} onClick={() => selectProduct(p)} className="w-full p-4 text-left hover:bg-blue-50/50 flex justify-between items-center group transition-colors">
                          <div className="flex-1 pr-2">
                            <div className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-700">{p.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{p.sku}</div>
                          </div>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg font-bold uppercase group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">{p.unit}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SKU Info Box */}
                {name && (
                  <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex justify-between items-center animate-in zoom-in-95 duration-200">
                    <div className="flex-1">
                      <span className="text-sm font-bold text-blue-900 line-clamp-1">{name}</span>
                      <p className="text-[10px] text-blue-500 font-medium mt-0.5">Đơn vị: {unit}</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-sm shrink-0">{sku}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{isAdjustment ? 'Thực tế' : 'Số lượng'}</label>
                    <div className="relative">
                      <input 
                        type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 text-center font-bold text-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Hạn dùng</label>
                    <div className="relative">
                       <input 
                        type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSave} disabled={isSyncing} 
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all font-bold text-sm uppercase tracking-widest shadow-lg active:scale-95 ${
                    isSyncing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                    (isAdjustment ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200')
                  }`}
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : (isAdjustment ? <ClipboardCheck size={18} /> : <Save size={18} />)}
                  <span>{isSyncing ? 'Đang xử lý...' : (isAdjustment ? 'Xác nhận Kiểm Kê' : 'Lưu Nhập Kho')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TỔNG KHO - Layout Card Chuyên nghiệp */}
        {view === 'summary' && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                <Database size={18} className="text-blue-600" /> Tổng Quan Kho
              </h2>
              <button 
                onClick={() => setShowResetConfirm(true)} 
                className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-red-100 shadow-sm"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            
            {inventorySummary.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <Package size={56} className="mx-auto mb-3 opacity-30 text-gray-300" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="p-5 flex justify-between items-start border-b border-gray-50 bg-gray-50/30">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{item.sku}</span>
                        </div>
                      </div>
                      <div className="text-right pl-4">
                        <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5 tracking-wider">Tổng</span>
                        <div className="flex items-baseline justify-end gap-1">
                           <span className="text-2xl font-black text-gray-900 leading-none">{item.totalQty}</span>
                           <span className="text-[10px] text-gray-500 font-bold">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                        <div key={bIdx} className="p-4 flex justify-between items-center text-xs hover:bg-gray-50 transition-colors">
                          <div className={`flex items-center gap-2.5 font-medium ${getBatchColor(date)}`}>
                            <Clock size={16} />
                            <span className="tracking-tight">{new Date(date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-xs shadow-sm">SL: {qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: NHẬT KÝ - Dạng Timeline Gọn gàng */}
        {view === 'history' && (
          <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
             <h2 className="text-sm font-bold text-gray-800 px-1 flex items-center gap-2 uppercase tracking-wide">
              <List size={18} className="text-green-600" /> Nhật Ký Hoạt Động
            </h2>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-6 pl-6">
              {logs.length === 0 ? (
                 <p className="text-xs text-gray-400 italic py-4">Chưa có hoạt động nào hôm nay.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[31px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 ${log.loai === 'KiemKe' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start hover:border-blue-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${log.loai === 'KiemKe' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {log.loai === 'KiemKe' ? 'Kiểm kê' : 'Nhập'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">{log.thoi_gian}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{log.ten_san_pham}</h4>
                      </div>
                      <div className="text-right pl-4">
                        <span className="block text-lg font-black text-gray-900 leading-none">{log.so_luong}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{log.don_vi}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-2 pb-6 flex justify-around items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setView('scan')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${view === 'scan' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Camera size={24} strokeWidth={view === 'scan' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Nhập</span>
          {view === 'scan' && <span className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></span>}
        </button>
        <button 
          onClick={() => setView('summary')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${view === 'summary' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard size={24} strokeWidth={view === 'summary' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Tổng Kho</span>
          {view === 'summary' && <span className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></span>}
        </button>
        <button 
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${view === 'history' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <List size={24} strokeWidth={view === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Lịch Sử</span>
          {view === 'history' && <span className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></span>}
        </button>
      </nav>
    </div>
  );
}


