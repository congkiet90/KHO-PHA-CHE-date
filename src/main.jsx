import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, Package, List, Save, CheckCircle2, 
  AlertCircle, Database, LayoutDashboard, 
  Clock, Search, X, RefreshCw, Lock 
} from 'lucide-react';

/**
 * PHIÊN BẢN V6.0 LITE - KIỆT INVENTORY
 * - Đã loại bỏ tính năng định mức tồn kho.
 * - Giao diện tối giản, tập trung vào trải nghiệm nhập liệu.
 */

const FIXED_SHEET_URL = "https://script.google.com/macros/s/AKfycbwUCPOacIF5FDOAuo8e8266cgntJU18LqgEywK70iFimEaral_XmDCfvEf10aJ_hmXl/exec";
const RESET_PASSWORD = "040703";

// --- DANH SÁCH 177 SẢN PHẨM (ĐÃ LƯỢC BỎ BIẾN MIN) ---
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

  // --- LOGIC TỔNG HỢP ---
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

  const getBatchColor = (hsd) => {
    if (!hsd || hsd === "Không có Date") return "text-gray-400";
    const today = new Date();
    const exp = new Date(hsd);
    const diffDays = Math.ceil((exp - today) / (86400000));
    if (diffDays < 0) return "text-red-600 font-bold"; 
    if (diffDays <= 90) return "text-orange-500 font-medium"; 
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
    setTimeout(() => setStatus(null), 2500);
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
    if (passwordInput !== RESET_PASSWORD) { showStatus('error', 'Mật khẩu sai!'); return; }
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
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24 select-none">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Kiệt Inventory</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">v6.0 Lite Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-full">
           <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
           <span className="text-[9px] font-bold text-green-700 uppercase">Live</span>
        </div>
      </header>

      {/* TOAST STATUS */}
      {status && (
        <div className={`fixed top-20 left-4 right-4 z-[60] py-4 px-5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-red-500 border-red-400 text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold tracking-tight">{status.message}</span>
        </div>
      )}

      {/* MODAL RESET */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h3 className="text-lg font-bold">Xác nhận xóa kho</h3>
            <p className="text-xs text-gray-400 mt-1">Hành động này không thể hoàn tác.</p>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mã pin" className="w-full mt-5 p-4 bg-gray-50 border-none rounded-2xl text-center text-xl tracking-[0.3em] focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="py-3.5 bg-gray-50 text-gray-500 rounded-2xl text-xs font-bold uppercase">Hủy</button>
              <button onClick={handleReset} className="py-3.5 bg-red-500 text-white rounded-2xl text-xs font-bold uppercase">Xóa hết</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-5 space-y-6">
        
        {/* VIEW: SCAN / NHẬP LIỆU */}
        {view === 'scan' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-100 p-1.5 rounded-2xl flex text-[10px] font-bold uppercase">
              <button onClick={() => setIsAdjustment(false)} className={`flex-1 py-3 rounded-xl transition-all ${!isAdjustment ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Nhập Hàng</button>
              <button onClick={() => setIsAdjustment(true)} className={`flex-1 py-3 rounded-xl transition-all ${isAdjustment ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}>Kiểm Kê</button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Tìm món hàng</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                    className="w-full pl-12 pr-4 py-4.5 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm transition-all"
                    placeholder="Tên hoặc mã SKU..."
                  />
                </div>
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto animate-in slide-in-from-top-2">
                    {filteredProducts.map((p, idx) => (
                      <button key={idx} onClick={() => selectProduct(p)} className="w-full p-4 text-left border-b border-gray-50 hover:bg-indigo-50 flex justify-between items-center active:scale-[0.98] transition-transform">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-800">{p.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-mono">{p.sku}</div>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold uppercase">{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {name && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center animate-in zoom-in-95 duration-300">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">Đã chọn sản phẩm</span>
                    <span className="text-xs font-bold text-indigo-900 leading-tight">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-indigo-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-indigo-100">{sku}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Số lượng</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full p-4 bg-gray-50 rounded-2xl text-center text-3xl font-black text-indigo-600 border-none focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm placeholder:text-gray-200"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Hạn dùng</label>
                  <input 
                    type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                    className="w-full p-4 bg-gray-50 rounded-2xl text-[11px] font-bold border-none focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave} disabled={isSyncing} 
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-xl ${
                  isSyncing ? 'bg-gray-200 text-gray-400' : (isAdjustment ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-indigo-600 text-white shadow-indigo-100')
                } active:scale-[0.97]`}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{isSyncing ? 'Đang gửi...' : 'Xác nhận lưu'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW: SUMMARY / TỒN KHO */}
        {view === 'summary' && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Database size={14} /> Tổng Tồn Thực Tế</h2>
              <button onClick={() => setShowResetConfirm(true)} className="text-[9px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 uppercase">Dọn dẹp kho</button>
            </div>
            
            {inventorySummary.length === 0 ? (
              <div className="py-24 text-center text-gray-300 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <Package size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Kho đang trống</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="p-5 flex justify-between items-start bg-gray-50/30">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-xs leading-tight">{item.name}</h3>
                        <p className="text-[9px] text-gray-400 font-mono mt-1.5 uppercase tracking-wider">{item.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline gap-1 justify-end">
                           <span className="text-2xl font-black tracking-tight text-indigo-600">{item.totalQty}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white px-2 pb-2">
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-50">
                        {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                          <div key={bIdx} className="p-3.5 flex justify-between items-center text-[11px] border-b last:border-0 border-gray-50">
                            <div className={`flex items-center gap-2.5 ${getBatchColor(date)}`}>
                              <div className="p-1 bg-current opacity-10 rounded-lg"><Clock size={12} /></div>
                              <span className="font-bold">{date === "Không có Date" ? "Chưa có HSD" : new Date(date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <span className="font-black text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: HISTORY / NHẬT KÝ */}
        {view === 'history' && (
          <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
             <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><List size={14} /> Nhật Ký Hoạt Động</h2>
             <div className="space-y-3 pb-8">
              {logs.length === 0 ? (
                 <div className="text-center py-20 text-gray-300 italic text-xs">Chưa ghi nhận giao dịch nào.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center animate-in fade-in duration-300">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                          log.loai === 'KiemKe' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {log.loai === 'KiemKe' ? 'Kiểm' : 'Nhập'}
                        </span>
                        <span className="text-[9px] text-gray-300 font-medium">{log.thoi_gian.split(',')[0]}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{log.ten_san_pham}</h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${log.loai === 'KiemKe' ? 'text-orange-500' : 'text-indigo-600'}`}>
                        {log.loai === 'KiemKe' ? '' : '+'}{log.so_luong}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl p-2 flex justify-around items-center z-40 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <button onClick={() => setView('scan')} className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-2xl transition-all duration-300 ${view === 'scan' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-4px]' : 'text-gray-400 hover:text-indigo-400'}`}>
          <Camera size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Nhập</span>
        </button>
        <button onClick={() => setView('summary')} className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-2xl transition-all duration-300 ${view === 'summary' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-4px]' : 'text-gray-400 hover:text-indigo-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Kho</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-2xl transition-all duration-300 ${view === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-4px]' : 'text-gray-400 hover:text-indigo-400'}`}>
          <List size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Sử</span>
        </button>
      </nav>
    </div>
  );
}

