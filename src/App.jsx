import OpenAI from "openai";
import { useState } from "react";
import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_ENCRYPTION_SECRET;
const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

function encryptKey(rawKey) {
  return CryptoJS.AES.encrypt(rawKey, secretKey).toString();
}

function decryptKey(encryptedKey) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Không giải mã được API key:", e);
    return null;
  }
}

const encryptedKey = localStorage.getItem("user_api_key");
const userApiKey = encryptedKey ? decryptKey(encryptedKey) : null;

const openai = new OpenAI({
  apiKey: userApiKey || envApiKey,
  dangerouslyAllowBrowser: true,
});

function isBotMessage(msg) {
  return msg.role === "assistant";
}

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const waitingBotMessage = {
      role: "assistant",
      content: "🤖 Đang nghĩ trả lời...",
    };

    setChatHistory([...chatHistory, userMessage, waitingBotMessage]);
    setMessage("");

    try {
      const response = await openai.chat.completions.create({
        messages: [...chatHistory, userMessage],
        model: "gpt-4o-mini",
      });
      const botMessage = {
        role: "assistant",
        content: response.choices[0].message.content,
      };
      setChatHistory([...chatHistory, userMessage, botMessage]);
    } catch (error) {
      console.error("Lỗi OpenAI:", error);
      const errorMsg = {
        role: "assistant",
        content: "❌ Lỗi gọi API. Kiểm tra kết nối hoặc API key.",
      };
      setChatHistory([...chatHistory, userMessage, errorMsg]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">💬 Chat với GPT</h1>
        <p className="text-xs text-center text-gray-500 mb-4">
          Đang dùng API key:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {userApiKey ? "Tự nhập (🔐)" : "Mặc định (ENV)"}
          </span>
        </p>

        <div className="flex justify-center gap-4 mb-4 text-sm">
          <button
            onClick={() => {
              const newKey = prompt("Nhập OpenAI API Key của bạn:");
              if (newKey) {
                const encrypted = encryptKey(newKey);
                localStorage.setItem("user_api_key", encrypted);
                window.location.reload();
              }
            }}
            className="text-blue-600 underline"
          >
            Nhập key thủ công
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("user_api_key");
              window.location.reload();
            }}
            className="text-red-600 underline"
          >
            Dùng lại key mặc định
          </button>
        </div>

        <form onSubmit={submitForm} className="flex mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-grow p-2 border border-gray-300 rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Gửi
          </button>
        </form>

        <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                isBotMessage(msg) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  isBotMessage(msg)
                    ? "bg-green-100 text-right"
                    : "bg-blue-100 text-left"
                }`}
              >
                <p className="font-semibold text-xs text-gray-500 mb-1">
                  {isBotMessage(msg) ? "🤖 Bot" : "🧑 Người dùng"}
                </p>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
