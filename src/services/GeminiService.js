import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Common System Instructions for the "Thủ Kho AI"
 */
const SYSTEM_INSTRUCTION = `
Bạn là "Thủ Kho AI" của một kho nguyên liệu pha chế.
Nhiệm vụ: Giám sát, kiểm soát và hỗ trợ người dùng quản lý kho chuẩn xác 100%.
Tính cách: Nghiêm túc nhưng thân thiện, chính xác, luôn đặt câu hỏi về các con số bất thường.
Ngôn ngữ: Tiếng Việt.
`;

/**
 * Validate an action (Import/Export/Delete) before or after it happens.
 */
export const validateWarehouseAction = async (actionType, actionData, inventoryData) => {
    if (!isOnline()) return "Không có kết nối mạng. Vui lòng kiểm tra lại.";
    if (!API_KEY) return null;

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    BỐI CẢNH KHO: ${JSON.stringify(inventoryData).substring(0, 5000)}
    HÀNH ĐỘNG VỪA THỰC HIỆN: ${actionType}
    DỮ LIỆU GIAO DỊCH: ${JSON.stringify(actionData)}

    HÃY NHẬN XÉT:
    - Nếu là Nhập hàng: Có gì bất thường về số lượng hoặc tên SP không?
    - Nếu là Xóa/Điều chỉnh: Có gây ra thiếu hụt lớn không?
    - Nếu là Kiểm kho: Có sai lệch lớn so với tồn kho lý thuyết không?

    TRẢ LỜI: Chỉ trả lời 1-2 câu ngắn gọn, súc tích kiểu "Thủ kho trực chiến". Nếu bình thường hãy nói "Đã ghi nhận, thông tin khớp".
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) { return null; }
};

/**
 * Deep Analysis of Inventory State
 */
export const getDeepInsights = async (inventorySummary) => {
    if (!API_KEY) return "Vui lòng cấu hình API Key.";

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    DỮ LIỆU TỒN KHO CHI TIẾT: ${JSON.stringify(inventorySummary)}

    HÃY PHÂN TÍCH VÀ ĐƯA RA:
    1. CẢNH BÁO: Các mã hàng 'nguy kịch' (hết hạn, sắp hết hàng).
    2. CHIẾN LƯỢC: Nên ưu tiên xuất món nào, nhập thêm món nào.
    3. GỢI Ý: Một điều cần làm ngay bây giờ.
    
    Yêu cầu: Không dùng tiêu đề rườm rà, dùng bullet points ngắn.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) { return "Không thể phân tích lúc này."; }
};

/**
 * Intelligent Helper (Chat)
 */
export const askVirtualManager = async (userMessage, inventoryContext) => {
    if (!isOnline()) return "Mất kết nối mạng. Thủ kho AI đang offline.";
    if (!API_KEY) return "Vui lòng cấu hình API Key để trò chuyện với Thủ Kho.";

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    DỮ LIỆU HIỆN TẠI: ${JSON.stringify(inventoryContext).substring(0, 5000)}
    USER HỎI: "${userMessage}"

    TRẢ LỜI: Ngắn gọn, đi thẳng vào vấn đề dựa trên số liệu thực tế. Nếu không có số liệu, hãy nói rõ là dữ liệu chưa cập nhật.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) { return "Lỗi kết nối bộ não AI."; }
};

/**
 * AI Scanner: Extract product info from image (OCR & Barcode)
 */
export const scanProductImage = async (base64Image) => {
    if (!isOnline()) return { error: "Không có kết nối mạng." };
    if (!API_KEY) return { error: "Thiếu API Key" };

    const prompt = `
    Phân tích hình ảnh này để tìm:
    1. Tên sản phẩm.
    2. Mã SKU hoặc Barcode (nếu có).
    3. Ngày hết hạn hoặc Ngày sản xuất (nếu có, hãy chuyển sang định dạng YYYY-MM-DD).

    TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON:
    {
      "name": "tên sản phẩm",
      "sku": "mã sku hoặc barcode",
      "expiryDate": "YYYY-MM-DD hoặc null"
    }
    Chỉ trả về JSON, không có văn bản thừa.
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image.split(',')[1],
                    mimeType: "image/jpeg"
                }
            }
        ]);
        const text = result.response.text();
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
        console.error("AI Scanning Error:", e);
        return { error: "Không thể nhận diện hình ảnh này. Vui lòng thử lại hoặc nhập tay." };
    }
};
