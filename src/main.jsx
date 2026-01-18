import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Sparkles, Box, History, Save, CheckCircle2, 
  AlertCircle, LayoutGrid, Calendar, Search, Loader2, Lock, X, Plus
} from 'lucide-react';

/**
 * KIỆT INVENTORY - GEMINI UI EDITION
 * - Backend: Apps Script v7.6 (Auto-sort & Rebuild)
 * - Frontend: Minimalist, Clean, Gemini-inspired Design
 */

// --- CẤU HÌNH ---
const API_URL = "https://script.google.com/macros/s/AKfycbxkYrOe1BZhMXH2OEtHhoMcMgeTDRPKrVgV7WVcXCtcSdFIBBgBVLKLzRrnsbykMD4e/exec";
const ADMIN_PIN = "040703";

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

  // --- LOGIC TỔNG HỢP ---
  const inventorySummary = useMemo(() => {
    const summary = {};
    logs.forEach(log => {
      const productSku = String(log.sku).trim();
      // Logic chuẩn hóa Date cho frontend display
      let normalizedDate = "Không có Date";
      if (log.hsd && log.hsd !== "Không có Date") {
        // Cắt 10 ký tự đầu để khớp với logic backend mới
        normalizedDate = String(log.hsd).trim().substring(0, 10);
      }

      if (!summary[productSku]) {
        summary[productSku] = { 
          sku: productSku, name: log.ten_san_pham, unit: log.don_vi || "",
          totalQty: 0, batches: {} 
        };
      }

      const qty = Number(log.so_luong) || 0;
      if (log.loai === 'KiemKe') {
         summary[productSku].batches[normalizedDate] = qty;
      } else {
         summary[productSku].batches[normalizedDate] = (summary[productSku].batches[normalizedDate] || 0) + qty;
      }
    });

    return Object.values(summary).map(item => {
      const total = Object.values(item.batches).reduce((sum, val) => sum + val, 0);
      return { ...item, totalQty: total };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [logs]);

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
      showStatus('error', 'Vui lòng nhập đầy đủ thông tin'); return;
    }
    const newEntry = {
      thoi_gian: new Date().toLocaleString('vi-VN'),
      sku: String(sku).trim(), ten_san_pham: name, don_vi: unit,
      so_luong: Number(quantity), hsd: expiryDate, loai: isAdjustment ? 'KiemKe' : 'NhapHang'
    };
    setIsSyncing(true);
    try {
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      setLogs(prev => [ {id: Date.now(), ...newEntry}, ...prev]);
      showStatus('success', 'Đã lưu kho thành công');
      // Reset form nhưng giữ các gợi ý
      setQuantity(''); setExpiryDate(''); 
    } catch (err) { showStatus('error', 'Lỗi kết nối máy chủ'); } finally { setIsSyncing(false); }
  };

  const handleReset = async () => {
    if (passwordInput !== ADMIN_PIN) { showStatus('error', 'Mật khẩu sai'); return; }
    setIsSyncing(true);
    try {
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: "ResetKho" })
      });
      setLogs([]); showStatus('success', 'Đã xóa dữ liệu kho');
      setShowResetConfirm(false); setPasswordInput('');
    } catch (err) { showStatus('error', 'Lỗi hệ thống'); } finally { setIsSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#1f1f1f] font-sans pb-32 select-none">
      
      {/* HEADER: Gemini Style - Clean, Simple, Gradient Text */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F0F4F9]/90 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="text-blue-600">
            <Sparkles size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kiệt Inventory</h1>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-[11px] font-medium tracking-wide ${isSyncing ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 border border-gray-200'}`}>
           {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-green-500"></div>}
           <span>{isSyncing ? 'Đang đồng bộ...' : 'Sẵn sàng'}</span>
        </div>
      </header>

      {/* TOAST: Floating Pill */}
      {status && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
          status.type === 'success' ? 'bg-black/80 text-white border-transparent' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* MODAL RESET: Clean Card */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 text-center border border-gray-100">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận Admin</h3>
            <p className="text-sm text-gray-500 mb-6">Nhập mã PIN để xóa toàn bộ dữ liệu.</p>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••" 
              className="w-full h-14 bg-gray-50 rounded-2xl text-center text-2xl tracking-[0.5em] font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={handleReset} className="flex-1 h-12 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 px-4 max-w-md mx-auto space-y-6">
        
        {/* === VIEW: SCAN === */}
        {view === 'scan' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toggle: Simple Pills */}
            <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm">
              <button onClick={() => setIsAdjustment(false)} className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${!isAdjustment ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>Nhập Hàng</button>
              <button onClick={() => setIsAdjustment(true)} className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${isAdjustment ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}>Kiểm Kê</button>
            </div>

            {/* Main Input Card: Gemini Style */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              {/* Search Bar - Big & Clean */}
              <div className="relative group">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                    className="w-full h-16 pl-14 pr-12 bg-gray-50 rounded-2xl text-base font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Tìm sản phẩm..."
                  />
                  {searchTerm && (
                    <button onClick={() => {setSearchTerm(''); setSku(''); setName('');}} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto p-2">
                    {filteredProducts.map((p, idx) => (
                      <button key={idx} onClick={() => selectProduct(p)} className="w-full p-3 text-left hover:bg-gray-50 rounded-xl flex justify-between items-center group transition-colors">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.sku}</div>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Item Pill */}
              {name && (
                <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">Đã chọn</div>
                    <div className="text-sm font-semibold text-blue-900 truncate">{name}</div>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-xs font-mono font-medium text-blue-600">{sku}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 ml-1">Số lượng</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full h-14 bg-gray-50 rounded-2xl text-center text-xl font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 ml-1">Hạn dùng</label>
                  <div className="relative">
                    <input 
                      type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                      className="w-full h-14 pl-4 pr-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button: Gradient Pill */}
              <button 
                onClick={handleSave} disabled={isSyncing} 
                className={`w-full h-14 rounded-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md active:scale-[0.98] transition-all ${
                  isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                }`}
              >
                {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                <span>{isSyncing ? 'Đang xử lý...' : 'Lưu Giao Dịch'}</span>
              </button>
            </div>
          </div>
        )}

        {/* === VIEW: SUMMARY === */}
        {view === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-blue-600" /> Tổng Kho
                </h2>
                <p className="text-xs text-gray-400 mt-1">Cập nhật thời gian thực</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-full text-xs font-medium hover:bg-red-50 transition-colors">
                Dọn Kho
              </button>
            </div>

            {inventorySummary.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                  <Box className="text-gray-300" size={24} />
                </div>
                <p className="text-sm text-gray-400">Kho đang trống</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">{item.name}</h3>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{item.sku}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 leading-none">{item.totalQty}</div>
                        <span className="text-[10px] text-gray-400 font-medium">{item.unit}</span>
                      </div>
                    </div>

                    {/* Batches List - Minimalist */}
                    <div className="space-y-2 pt-3 border-t border-gray-50">
                      {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                        <div key={bIdx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar size={14} className="text-gray-300" />
                            <span className="text-xs font-medium">
                              {date === "Không có Date" ? "Chưa có HSD" : new Date(date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-lg">{qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === VIEW: HISTORY === */}
        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2 px-2">
               <History size={20} className="text-purple-600" /> Lịch Sử
             </h2>
             <div className="space-y-3">
              {logs.length === 0 ? (
                 <div className="text-center py-20 text-gray-400 text-sm">Chưa có hoạt động nào.</div>
              ) : (
                logs.slice(0, 50).map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        log.loai === 'KiemKe' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {log.loai === 'KiemKe' ? <Search size={18} /> : <Save size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">{log.ten_san_pham}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{log.thoi_gian.split(' ')[1]}</span>
                          <span className={`text-[10px] font-medium ${log.loai === 'KiemKe' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {log.loai === 'KiemKe' ? 'Kiểm kê' : 'Nhập hàng'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold shrink-0 ${log.loai === 'KiemKe' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {log.loai === 'KiemKe' ? log.so_luong : `+${log.so_luong}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV: Floating Glass Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-2 py-2 flex items-center gap-1 z-40">
        <button onClick={() => setView('scan')} className={`p-3 rounded-full transition-all duration-300 ${view === 'scan' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <Plus size={24} />
        </button>
        <button onClick={() => setView('summary')} className={`p-3 rounded-full transition-all duration-300 ${view === 'summary' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <LayoutGrid size={24} />
        </button>
        <button onClick={() => setView('history')} className={`p-3 rounded-full transition-all duration-300 ${view === 'history' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <History size={24} />
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
