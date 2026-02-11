import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Lazy initialization to prevent crashes at module load time
let genAI = null;
let model = null;

const isOnline = () => navigator.onLine;

function getModel() {
    if (!model) {
        if (!API_KEY) {
            console.error("GeminiService: VITE_GEMINI_API_KEY is MISSING in import.meta.env.");
            return null;
        }
        console.log("GeminiService: Initializing with key prefix: " + API_KEY.substring(0, 5));
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    return model;
}

/**
 * Diagnostic tool to test connection status
 */
export const testGeminiConnection = async () => {
    console.log("GeminiService: Testing connection...");
    if (!API_KEY) return { status: "missing_key", message: "API Key không tồn tại trong .env" };
    if (!isOnline()) return { status: "offline", message: "Không có kết nối mạng" };

    try {
        const testModel = getModel();
        if (!testModel) return { status: "init_error", message: "Không thể khởi tạo Model" };

        const result = await testModel.generateContent("ping");
        const response = await result.response;
        console.log("GeminiService: Connection SUCCESS!");
        return { status: "ok", message: "Kết nối thành công!" };
    } catch (e) {
        console.error("GeminiService: Connection FAILED!", e);
        let errorType = "unknown";
        if (e.message?.includes("403")) errorType = "permission_denied";
        if (e.message?.includes("404")) errorType = "model_not_found";
        if (e.message?.includes("401") || e.message?.includes("API_KEY_INVALID")) errorType = "invalid_key";
        if (e.message?.includes("429")) errorType = "rate_limited";

        return {
            status: "error",
            errorType,
            message: e.message || "Lỗi không xác định",
            technical: e.toString()
        };
    }
};

// Auto-run test on module load (logs to console)
testGeminiConnection();

/**
 * Common System Instructions
 */
const SYSTEM_INSTRUCTION = `
Bạn là "Thủ Kho AI" của một kho nguyên liệu pha chế.
Nhiệm vụ: Giám sát, kiểm soát và hỗ trợ người dùng quản lý kho chuẩn xác 100%.
Tính cách: Nghiêm túc nhưng thân thiện, chính xác, luôn đặt câu hỏi về các con số bất thường.
Ngôn ngữ: Tiếng Việt.
`;

const handleAIError = (e, context) => {
    console.error(`GeminiService [${context}]:`, e);
    const msg = e.message || "";
    if (msg.includes("429")) return "Hệ thống AI đang quá tải (429). Vui lòng đợi vài giây.";
    if (msg.includes("404")) return "Không tìm thấy phiên bản AI (404). Có thể model đã bị đổi tên.";
    if (msg.includes("401") || msg.includes("API_KEY_INVALID")) return "Lỗi xác thực: API Key không hợp lệ.";
    if (msg.includes("403")) return "Lỗi quyền truy cập: Key của bạn không được dùng model này.";
    if (!isOnline()) return "Mất kết nối mạng.";
    return "Lỗi kết nối bộ não AI. Vui lòng kiểm tra console.";
};

/**
 * Validate an action
 */
export const validateWarehouseAction = async (actionType, actionData, inventoryData) => {
    if (!API_KEY) return null;
    const model = getModel();
    if (!model) return null;

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    BỐI CẢNH KHO: ${JSON.stringify(inventoryData).substring(0, 3000)}
    HÀNH ĐỘNG: ${actionType}
    DỮ LIỆU: ${JSON.stringify(actionData)}

    HÃY NHẬN XÉT ngắn gọn 1-2 câu. Nếu bình thường nói "Đã ghi nhận, thông tin khớp".
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        return null; // Silent fail for validation to not block user
    }
};

/**
 * Deep Analysis
 */
export const getDeepInsights = async (inventorySummary) => {
    if (!API_KEY) return "Vui lòng cấu hình API Key.";
    const model = getModel();
    if (!model) return "Lỗi khởi tạo AI.";

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    DỮ LIỆU TỒN KHO: ${JSON.stringify(inventorySummary)}
    PHÂN TÍCH VÀ ĐƯA RA: 1. CẢNH BÁO (hết hạn), 2. CHIẾN LƯỢC (nhập/xuất), 3. GỢI Ý.
    Dùng bullet points ngắn.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        return handleAIError(e, "Insights");
    }
};

/**
 * Virtual Manager Chat
 */
export const askVirtualManager = async (userMessage, inventoryContext) => {
    if (!API_KEY) return "Vui lòng cấu hình API Key để trò chuyện.";
    const model = getModel();
    if (!model) return "Lỗi khởi tạo AI.";

    const prompt = `
    ${SYSTEM_INSTRUCTION}
    DỮ LIỆU: ${JSON.stringify(inventoryContext).substring(0, 4000)}
    USER HỎI: "${userMessage}"
    TRẢ LỜI: Ngắn gọn.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        return handleAIError(e, "Chat");
    }
};

/**
 * AI Scanner
 */
export const scanProductImage = async (base64Image) => {
    if (!API_KEY) return { error: "Thiếu API Key" };
    const model = getModel();
    if (!model) return { error: "Lỗi khởi tạo AI." };

    const prompt = `
    Phân tích hình ảnh sản phẩm để tìm: Tên, Mã SKU (hoặc Barcode), Hạn sử dụng (YYYY-MM-DD).
    TRẢ VỀ JSON: {"name": "...", "sku": "...", "expiryDate": "..."}
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
        return { error: handleAIError(e, "Scanner") };
    }
};
