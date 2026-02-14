import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Lazy initialization to prevent crashes at module load time
let genAI = null;
let model = null;

const isOnline = () => navigator.onLine;

// Helper to verify if a model works with a simple ping
// Returns: { works: boolean, isQuotaError: boolean, error: string }
async function verifyModel(modelInstance) {
    if (!modelInstance) return { works: false, isQuotaError: false, error: "No model instance" };
    try {
        console.log(`GeminiService: Sending verification ping to ${modelInstance.model}...`);
        // Minimal effort ping
        await modelInstance.generateContent({
            contents: [{ role: "user", parts: [{ text: "hi" }] }],
            generationConfig: { maxOutputTokens: 1 }
        });
        return { works: true, isQuotaError: false };
    } catch (e) {
        const msg = e.message || "";
        const status = e.status || (e.response && e.response.status);

        const isQuota = status === 429 || msg.includes("429") || msg.includes("QUOTA_EXCEEDED") || msg.includes("rate limit");

        if (isQuota) {
            console.warn(`GeminiService: Model ${modelInstance.model} is VALID but Quota exceeded (429). Stop falling back.`);
            return { works: true, isQuotaError: true };
        }

        console.warn(`GeminiService: ${modelInstance.model} ping failed:`, { status, message: msg });
        return { works: false, isQuotaError: false, error: msg };
    }
}

async function getModel() {
    if (model) return model;

    if (!API_KEY) {
        console.error("GeminiService: VITE_GEMINI_API_KEY is MISSING.");
        return null;
    }

    const cleanKey = API_KEY.trim().replace(/[\n\r]/g, "");
    console.log("GeminiService: Initializing...");

    try {
        genAI = new GoogleGenerativeAI(cleanKey);
        const modelsToTry = [
            "gemini-3.0-flash",
            "gemini-3.0-flash-latest",
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`GeminiService: Attempting discovery for ${modelName}...`);
                const tempModel = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { maxOutputTokens: 2048 }
                });

                const { works, isQuotaError, error } = await verifyModel(tempModel);
                if (works) {
                    model = tempModel;
                    if (isQuotaError) {
                        console.log(`GeminiService: Discovery STOPPED at ${modelName} due to Quota (429).`);
                    } else {
                        console.log(`GeminiService: Discovery SUCCESS for ${modelName}`);
                    }
                    break;
                } else {
                    console.log(`GeminiService: Skipping ${modelName} (Error: ${error})`);
                }
            } catch (e) {
                console.warn(`GeminiService: Critical error during ${modelName} discovery:`, e.message);
            }
        }

        if (!model) {
            console.error("GeminiService: All models failed verification or are unavailable.");
        }
    } catch (e) {
        console.error("GeminiService: General Initialization Error", e);
    }

    return model;
}

/**
 * Diagnostic tool to check available models
 */
export const listAvailableModels = async () => {
    if (!API_KEY) return [];
    try {
        const genAI = new GoogleGenerativeAI(API_KEY.trim());
        // Note: listModels is part of the API, let's see if we can log it
        console.log("GeminiService: Diagnostic - Attempting to check API access...");
        const result = await testGeminiConnection();
        return result;
    } catch (e) {
        return { error: e.message };
    }
};

/**
 * Diagnostic tool to test connection status
 */
export const testGeminiConnection = async () => {
    console.log("GeminiService: Testing connection...");
    if (!API_KEY) return { status: "missing_key", message: "API Key không tồn tại trong .env" };
    if (!isOnline()) return { status: "offline", message: "Không có kết nối mạng" };

    try {
        const testModel = await getModel();
        if (!testModel) return { status: "init_error", message: "Không thể khởi tạo Model (Kiểm tra API Key/Model Name)" };

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

// Auto-run test on module load removed to optimize usage.
// testGeminiConnection();

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
    const modelName = model?.model || "AI";

    if (msg.includes("429") || msg.includes("QUOTA_EXCEEDED")) {
        return `Model ${modelName} đang hết lượt miễn phí (Quota exceeded). Vui lòng đợi 1 phút hoặc nâng cấp API Key.`;
    }
    if (msg.includes("404")) return `Lỗi 404: Model ${modelName} không tồn tại hoặc không được hỗ trợ cho Key này.`;
    if (msg.includes("401") || msg.includes("API_KEY_INVALID")) return "Lỗi xác thực: API Key không hợp lệ.";
    if (msg.includes("403")) return `Lỗi 403: Key của bạn không có quyền dùng model ${modelName}.`;
    if (!isOnline()) return "Mất kết nối mạng.";
    return "Lỗi kết nối bộ não AI. Vui lòng kiểm tra console.";
};

/**
 * Validate an action
 */
export const validateWarehouseAction = async (actionType, actionData, inventoryData) => {
    if (!API_KEY) return null;
    const model = await getModel();
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
    const model = await getModel();
    if (!model) return "Lỗi khởi tạo AI. Vui lòng kiểm tra API Key hoặc Model khả dụng.";

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
    const model = await getModel();
    if (!model) return "Lỗi khởi tạo AI. Vui lòng kiểm tra console.";

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
    const model = await getModel();
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
