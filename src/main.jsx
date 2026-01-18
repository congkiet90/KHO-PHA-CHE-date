import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Camera, Package, List, Save, CheckCircle2, 
  AlertCircle, Database, LayoutDashboard, 
  Clock, Search, RefreshCw, Lock 
} from 'lucide-react';

/**
 * KIỆT INVENTORY V6.0 LITE (SINGLE FILE EDITION)
 * - Đã gộp App.jsx và main.jsx làm một để tránh lỗi đường dẫn.
 * - Giao diện cân bằng, không định mức.
 */

const FIXED_SHEET_URL = "https://script.google.com/macros/s/AKfycbwUCPOacIF5FDOAuo8e8266cgntJU18LqgEywK70iFimEaral_XmDCfvEf10aJ_hmXl/exec";
const RESET_PASSWORD = "040703";

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
      so_luong: Number(quantity), hsd: expiryDate, loai: isAdjustment ? 'KiemKe' : 'NhapHang'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 select-none">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-slate-900">Kiệt Inventory</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">v6.0 Lite Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
           <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Live</span>
        </div>
      </header>

      {status && (
        <div className={`fixed top-24 left-6 right-6 z-[60] py-4.5 px-6 rounded-[1.25rem] shadow-2xl border flex items-center gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          <span className="text-sm font-bold tracking-tight">{status.message}</span>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Xóa toàn bộ kho?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Dữ liệu sẽ được làm sạch trên hệ thống Cloud và không thể khôi phục.</p>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••" className="w-full mt-6 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
            />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => {setShowResetConfirm(false); setPasswordInput('');}} className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">Hủy bỏ</button>
              <button onClick={handleReset} className="py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-transform">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-6 space-y-8">
        {view === 'scan' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-200 p-1.5 rounded-[1.5rem] flex text-[10px] font-black uppercase tracking-widest">
              <button onClick={() => setIsAdjustment(false)} className={`flex-1 py-4 rounded-2xl transition-all duration-300 ${!isAdjustment ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Nhập Hàng</button>
              <button onClick={() => setIsAdjustment(true)} className={`flex-1 py-4 rounded-2xl transition-all duration-300 ${isAdjustment ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}>Kiểm Kê</button>
            </div>

            <div className="space-y-8">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">Tìm kiếm sản phẩm</label>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}} 
                    className="w-full pl-14 pr-6 py-5.5 bg-white rounded-[1.5rem] text-sm font-bold border-2 border-slate-50 focus:border-indigo-500 focus:ring-0 outline-none shadow-sm transition-all placeholder:text-slate-300"
                    placeholder="Tên món hoặc SKU..."
                  />
                </div>
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50 max-h-80 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
                    {filteredProducts.map((p, idx) => (
                      <button key={idx} onClick={() => selectProduct(p)} className="w-full p-5 text-left border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center active:scale-[0.98] transition-all">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 mt-2 font-mono tracking-tighter">{p.sku}</div>
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl font-black uppercase">{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {name && (
                <div className="bg-indigo-600 rounded-[1.5rem] p-6 flex justify-between items-center animate-in zoom-in-95 duration-400 shadow-xl shadow-indigo-100 text-white">
                  <div className="flex-1 pr-6">
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] block mb-2">Đang chọn</span>
                    <span className="text-sm font-black leading-snug">{name}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-mono text-white bg-indigo-500/50 px-3 py-1.5 rounded-xl border border-indigo-400/30">{sku}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Số lượng</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full p-6 bg-white rounded-[1.5rem] text-center text-4xl font-black text-indigo-600 border-2 border-slate-50 focus:border-indigo-500 focus:ring-0 outline-none shadow-sm transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Hạn sử dụng</label>
                  <input 
                    type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} 
                    className="w-full p-6 bg-white rounded-[1.5rem] text-[12px] font-black border-2 border-slate-50 focus:border-indigo-500 focus:ring-0 outline-none shadow-sm transition-all uppercase"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave} disabled={isSyncing} 
                className={`w-full py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all duration-300 font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.96] ${
                  isSyncing ? 'bg-slate-200 text-slate-400' : (isAdjustment ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-indigo-600 text-white shadow-indigo-200')
                }`}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{isSyncing ? 'Processing...' : 'Lưu giao dịch'}</span>
              </button>
            </div>
          </div>
        )}

        {view === 'summary' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-1.5"><Database size={16} /> Kiểm kê tồn</h2>
                <p className="text-[10px] font-bold text-slate-300 italic uppercase tracking-tighter">Real-time Cloud Sync</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)} className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2.5 rounded-2xl border border-rose-100 uppercase tracking-widest active:scale-95 transition-transform">Xóa kho</button>
            </div>
            
            {inventorySummary.length === 0 ? (
              <div className="py-32 text-center text-slate-300 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner animate-in fade-in duration-700">
                <Package size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Kho đang trống</p>
              </div>
            ) : (
              <div className="space-y-5">
                {inventorySummary.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${idx * 60}ms`}}>
                    <div className="p-6 flex justify-between items-start bg-slate-50/50">
                      <div className="flex-1 pr-6">
                        <h3 className="font-black text-slate-900 text-[13px] leading-tight">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">{item.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline gap-1.5 justify-end">
                           <span className="text-3xl font-black tracking-tighter text-indigo-600">{item.totalQty}</span>
                           <span className="text-[10px] text-slate-400 font-black uppercase">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 pt-0">
                      <div className="bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-50">
                        {Object.entries(item.batches).sort().map(([date, qty], bIdx) => (
                          <div key={bIdx} className="p-4 flex justify-between items-center text-[11px] border-b last:border-0 border-slate-100/50">
                            <div className="flex items-center gap-3 text-slate-600">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Clock size={12} className="text-slate-400" /></div>
                              <span className="font-black tracking-tight">{date === "Không có Date" ? "Chưa có HSD" : new Date(date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <span className="font-black text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{qty} {item.unit}</span>
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

        {view === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-left-8 duration-500">
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-2"><List size={16} /> Lịch sử hoạt động</h2>
             <div className="space-y-4 pb-12">
              {logs.length === 0 ? (
                 <div className="text-center py-32 text-slate-300 italic text-sm font-medium">Danh sách nhật ký trống.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-50 shadow-sm flex justify-between items-center animate-in fade-in duration-400">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[8px] px-2.5 py-1 rounded-lg font-black uppercase tracking-[0.15em] ${
                          log.loai === 'KiemKe' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {log.loai === 'KiemKe' ? 'Kiểm kê' : 'Nhập hàng'}
                        </span>
                        <span className="text-[10px] text-slate-300 font-bold font-mono uppercase tracking-tighter">{log.thoi_gian}</span>
                      </div>
                      <h4 className="text-[13px] font-black text-slate-800 line-clamp-1 leading-none">{log.ten_san_pham}</h4>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-xl font-black ${log.loai === 'KiemKe' ? 'text-amber-500' : 'text-indigo-600'}`}>
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

      <nav className="fixed bottom-8 left-8 right-8 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-2.5 flex justify-around items-center z-40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <button onClick={() => setView('scan')} className={`flex flex-col items-center gap-2 flex-1 py-4.5 rounded-[1.8rem] transition-all duration-500 ${view === 'scan' ? 'bg-white text-slate-900 shadow-xl translate-y-[-6px]' : 'text-slate-400 hover:text-white/70'}`}>
          <Camera size={22} strokeWidth={view === 'scan' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nhập</span>
        </button>
        <button onClick={() => setView('summary')} className={`flex flex-col items-center gap-2 flex-1 py-4.5 rounded-[1.8rem] transition-all duration-500 ${view === 'summary' ? 'bg-white text-slate-900 shadow-xl translate-y-[-6px]' : 'text-slate-400 hover:text-white/70'}`}>
          <LayoutDashboard size={22} strokeWidth={view === 'summary' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tồn</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-2 flex-1 py-4.5 rounded-[1.8rem] transition-all duration-500 ${view === 'history' ? 'bg-white text-slate-900 shadow-xl translate-y-[-6px]' : 'text-slate-400 hover:text-white/70'}`}>
          <List size={22} strokeWidth={view === 'history' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sử</span>
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

