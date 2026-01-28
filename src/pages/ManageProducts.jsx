import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Package, Search } from 'lucide-react';

const ManageProducts = ({ API_URL, showStatus }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [category, setCategory] = useState('bar');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "GetProducts" })
            });
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            showStatus('error', 'Lỗi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!sku || !name || !unit) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    loai: "AddProduct",
                    sku, name, unit, category
                })
            });
            const res = await response.json();
            if (res.status === 'success') {
                showStatus('success', 'Đã thêm sản phẩm mới');
                setSku(''); setName(''); setUnit('');
                fetchProducts();
            } else {
                showStatus('error', res.message || 'Lỗi khi thêm sản phẩm');
            }
        } catch (err) {
            showStatus('error', 'Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.sku).includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                    <Package size={24} className="text-black" /> Quản Lý Sản Phẩm
                </h2>
                <p className="text-sm text-stone-500 mt-1 font-medium">Thêm mới mã hàng vào hệ thống</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Creation */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-[24px] shadow-lg shadow-black/5 border border-stone-100 sticky top-4">
                        <h3 className="font-bold text-lg mb-4 text-black">Thêm Mã Hàng Mới</h3>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Mã SKU</label>
                                <input
                                    value={sku} onChange={e => setSku(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="vd: 10023"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Tên Sản Phẩm</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="vd: Cà phê Phin"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Đơn Vị Tính</label>
                                <input
                                    value={unit} onChange={e => setUnit(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="vd: KG, HOP, CAI"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Phân Loại</label>
                                <select
                                    value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black"
                                >
                                    <option value="bar">Pha Chế (Bar)</option>
                                    <option value="retail">Bán Lẻ (Retail)</option>
                                </select>
                            </div>

                            <button
                                disabled={isSubmitting || !sku || !name || !unit}
                                className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/20 hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Thêm Sản Phẩm
                            </button>
                        </form>
                    </div>
                </div>

                {/* Product List */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden flex flex-col h-[600px]">
                        {/* Search Header */}
                        <div className="p-4 border-b border-stone-100 flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border-none outline-none font-medium text-sm"
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                            </div>
                            <button onClick={fetchProducts} className="p-2 bg-stone-50 rounded-xl hover:bg-stone-100 text-stone-500"><Loader2 size={18} className={loading ? 'animate-spin' : ''} /></button>
                        </div>

                        {/* Table */}
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-[#F5F5F7] text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-black/5 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3">Tên Sản Phẩm</th>
                                        <th className="px-6 py-3 text-center">ĐVT</th>
                                        <th className="px-6 py-3 text-center">Loại</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {filteredProducts.map((p, i) => (
                                        <tr key={i} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-3 text-stone-500 font-mono text-xs">{p.sku}</td>
                                            <td className="px-6 py-3 font-medium text-black text-sm">{p.name}</td>
                                            <td className="px-6 py-3 text-center text-xs text-stone-500 lowercase">{p.unit}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${p.category === 'retail' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {p.category === 'retail' ? 'Bán Lẻ' : 'Pha Chế'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && !loading && (
                                        <tr className="text-center"><td colSpan={4} className="py-10 text-stone-400 text-sm">Không tìm thấy sản phẩm</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageProducts;
