import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Scan, Box, History, Save, CheckCircle2, 
  AlertTriangle, Archive, BarChart3, 
  Calendar, Search, Loader2, Lock, X
} from 'lucide-react';

/**
 * KIỆT INVENTORY V7.1 - LUXURY MOBILE EDITION
 * - Fix lỗi gộp: Sử dụng String Substring thay vì Date Object để tránh lệch múi giờ.
 * - Backend: Apps Script v6.4
 */

// --- CẤU HÌNH HỆ THỐNG ---
const API_URL = "https://script.google.com/macros/s/AKfycbxkZ4WuS_AV32gwwzEggLM4G-VL3uM_PfoFCqYpM9gKMO9dRpeV3BdUdG-oDPMAJkzw/exec";
const ADMIN_PIN = "040703";

// --- DANH SÁCH SẢN PHẨM ---
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

  // --- LOGIC TỔNG HỢP (FIXED: STRING SUBSTRING) ---
  const inventorySummary = useMemo(() => {
    const summary = {};
    logs.forEach(log => {
      const productSku = String(log.sku).trim();
      let normalizedDate = "Không có Date";
      
      if (log.hsd && log.hsd !== "Không có Date") {
        // Fix: Cắt chuỗi 10 ký tự đầu tiên thay vì dùng Date Object
        // Ví dụ: "2024-05-20" hoặc "2024-05-20T17:00..." đều thành "2024-05-20"
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
    setTimeout(() => setStatus(null), 2500);
  };

  const handleSave = async () => {
    if (!sku || !quantity || !expiryDate) {
      showStatus('error', 'Vui lòng điền đủ thông tin'); return;
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
      showStatus('success', 'Đã cập nhật kho');
      // Reset form nhưng giữ mode nhập
      setSku(''); setName(''); setSearchTerm(''); setQuantity(''); setExpiryDate(''); setUnit('');
    } catch (err) { showStatus('error', 'Lỗi kết nối máy chủ'); } finally { setIsSyncing(false); }
  };

  const handleReset = async () => {
    if (passwordInput !== ADMIN_PIN) { showStatus('error', 'Mật khẩu Admin sai'); return; }
    setIsSyncing(true);
    try {
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: "ResetKho" })
      });
      setLogs([]); showStatus('success', 'Đã xóa toàn bộ dữ liệu');
      setShowResetConfirm(false); setPasswordInput('');
    } catch (err) { showStatus('error', 'Lỗi hệ thống'); } finally { setIsSyncing(false); }
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32 select-none">
      
      {/* 1. HEADER KÍNH MỜ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">Kiệt Inventory</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-1 uppercase">Luxury Edition v7.1</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${isSyncing ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
           {isSyncing ? <Loader2 size={12} className="animate-spin text-amber-600" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>}
           <span className={`text-[10px] font-bold uppercase tracking-wide ${isSyncing ? 'text-amber-600' : 'text-emerald-700'}`}>
             {isSyncing ? 'Syncing' : 'Online'}
           </span>
        </div>
      </header>

      {/* 2. TOAST NOTIFICATION */}
      {status && (
        <div className={`fixed top-24 left-6 right-6 z-[60] p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-white/90 border-emerald-100 text-emerald-800' : 'bg-white/90 border-rose-100 text-rose-800'
        }`}>
          <div className={`p-2 rounded-full ${status.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <span className="text-sm font-bold">{status.message}</span>
        </div>
      )}

      {/* 3. MODAL RESET */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xs p-8 text-center border border-white/20">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Lock size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác thực Admin</h3>
            <p className="text-xs text-slate-400 mb-6 px-4">Nhập mã PIN để xóa toàn bộ dữ liệu kho vĩnh viễn.</p>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••" 
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl tracking-[0.5em] font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800"
            />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="h-12 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">Hủy</button>
              <button onClick={handleReset} className="h-12 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors">Xóa Ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT */}
      <main className="pt-24 px-5 max-w-md mx-auto space-y-6">
        
        {/* VIEW: NHẬP LIỆU (SCAN) */}
        {view === 'scan' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toggle Switch */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${isAdjustment ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
              <button onClick={() => setIsAdjustment(false)} className={`flex-1 py-3.5 relative z-10 text-[11px] font-bold uppercase tracking-wider transition-colors ${!isAdjustment ? 'text-indigo-600' : 'text-slate-400'}`}>Nhập Hàng</button>
              <button onClick={() => setIsAdjustment(true)} className={`flex-1 py-3.5 relative z-10 text-[11px] font-bold uppercase tracking-wider transition-colors ${isAdjustment ? 'text-amber-600' : 'text-slate-400'}`}>Kiểm Kê</button>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
              {/* Search Box */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Sản phẩm</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Tìm tên hoặc mã SKU..."
                  />
                  {searchTerm && (
                    <button onClick={() => {setSearchTerm(''); setSku(''); setName('');}} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {/* Dropdown Suggestions */}
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto">
                    {filteredProducts.map((p, idx) => (
                      <button key={idx} onClick={() => selectProduct(p)} className="w-full p-4 text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 flex justify-between items-center group">
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{p.sku}</div>
                        </div>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase">{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Item Indicator */}
              {name && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Đã chọn</div>
                    <div className="text-sm font-bold text-indigo-900 truncate">{name}</div>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                    <span className="text-[11px] font-mono font-bold text-indigo-600">{sku}</span>
                  </div>
                </div>
              )}

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Số lượng</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full h-16 bg-slate-50 rounded-2xl text-center text-3xl font-black text-slate-800 border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Hạn dùng</label>
                  <div className="relative">
                    <input 
                      type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                      className="w-full h-16 pl-4 pr-2 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all uppercase text-slate-600"
                    />
                    {!expiryDate && <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleSave} disabled={isSyncing} 
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all duration-200 ${
                  isSyncing ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 
                  isAdjustment ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-200' : 
                  'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200'
                }`}
              >
                {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{isSyncing ? 'Đang xử lý...' : 'Lưu Giao Dịch'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW: TỒN KHO (SUMMARY) */}
        {view === 'summary' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 mb-1"><BarChart3 size={16} /> Tổng Quan</h2>
                <p className="text-[10px] font-semibold text-slate-300">Cập nhật thời gian thực</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors">
                Xóa Kho
              </button>
            </div>

            {inventorySummary.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="text-slate-300" size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kho đang trống</p>
              </div>
            ) : (
              <div className="space-y-5">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[2.5rem] p-1 shadow-sm border border-slate-100/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-5">
                      {/* Header Card */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                          <h3 className="text-sm font-black text-slate-800 leading-snug">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{item.sku}</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng</span>
                          <div className="text-3xl font-black text-indigo-600 leading-none tracking-tighter">{item.totalQty}</div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 block">{item.unit}</span>
                        </div>
                      </div>

                      {/* Batches List */}
                      <div className="space-y-2">
                        {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                          <div key={bIdx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${date === 'Không có Date' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500'}`}>
                                <Calendar size={14} strokeWidth={2.5} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 tracking-tight">
                                {date === "Không có Date" ? "Chưa có HSD" : new Date(date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <span className="text-sm font-black text-slate-800">{qty}</span>
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

        {/* VIEW: LỊCH SỬ (HISTORY) */}
        {view === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-left-8 duration-500">
             <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 px-1"><History size={16} /> Nhật Ký Hoạt Động</h2>
             <div className="space-y-4">
              {logs.length === 0 ? (
                 <div className="text-center py-24 text-slate-400 text-xs italic">Chưa có giao dịch nào được ghi nhận.</div>
              ) : (
                logs.slice(0, 50).map((log) => (
                  <div key={log.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        log.loai === 'KiemKe' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {log.loai === 'KiemKe' ? <Scan size={18} /> : <Save size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{log.ten_san_pham}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{log.thoi_gian.split(' ')[1]}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className={`text-[9px] font-bold uppercase ${log.loai === 'KiemKe' ? 'text-amber-600' : 'text-indigo-600'}`}>
                            {log.loai === 'KiemKe' ? 'Kiểm kê' : 'Nhập hàng'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-base font-black shrink-0 ${log.loai === 'KiemKe' ? 'text-amber-500' : 'text-indigo-600'}`}>
                      {log.loai === 'KiemKe' ? log.so_luong : `+${log.so_luong}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. BOTTOM NAVIGATION BAR (GLASS) */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] flex justify-between items-center px-2 z-40">
        <button onClick={() => setView('scan')} className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-[2rem] transition-all duration-300 ${view === 'scan' ? 'text-indigo-600 scale-105' : 'text-slate-300 hover:text-slate-400'}`}>
          <div className={`p-2 rounded-2xl transition-all ${view === 'scan' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Scan size={24} strokeWidth={view === 'scan' ? 3 : 2} />
          </div>
          {view === 'scan' && <span className="text-[9px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-1">Nhập</span>}
        </button>

        <button onClick={() => setView('summary')} className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-[2rem] transition-all duration-300 ${view === 'summary' ? 'text-indigo-600 scale-105' : 'text-slate-300 hover:text-slate-400'}`}>
          <div className={`p-2 rounded-2xl transition-all ${view === 'summary' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Box size={24} strokeWidth={view === 'summary' ? 3 : 2} />
          </div>
          {view === 'summary' && <span className="text-[9px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-1">Kho</span>}
        </button>

        <button onClick={() => setView('history')} className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-[2rem] transition-all duration-300 ${view === 'history' ? 'text-indigo-600 scale-105' : 'text-slate-300 hover:text-slate-400'}`}>
          <div className={`p-2 rounded-2xl transition-all ${view === 'history' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <History size={24} strokeWidth={view === 'history' ? 3 : 2} />
          </div>
          {view === 'history' && <span className="text-[9px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-1">Sử</span>}
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
