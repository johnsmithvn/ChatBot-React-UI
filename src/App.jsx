import OpenAI from "openai";
import { useState } from "react";
import CryptoJS from "crypto-js";

// Lấy secret key từ biến môi trường

 const secretKey = import.meta.env.VITE_ENCRYPTION_SECRET;
 const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Hàm mã hóa key
function encryptKey(rawKey) {
  return CryptoJS.AES.encrypt(rawKey, secretKey).toString();
}

// Hàm giải mã key
function decryptKey(encryptedKey) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Không giải mã được API key:", e);
    return null;
  }
}

// Lấy key từ localStorage (đã mã hóa) và giải mã
const encryptedKey = localStorage.getItem("user_api_key");
const userApiKey = encryptedKey ? decryptKey(encryptedKey) : null;

// Ưu tiên key người dùng nếu có
const openai = new OpenAI({
  apiKey: userApiKey || envApiKey,
  dangerouslyAllowBrowser: true,
});

function isBotMessage(chatMessage) {
  return chatMessage.role === "assistant";
}

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessage("");

    const userMessage = { role: "user", content: message };
    const waitingBotMessage = {
      role: "assistant",
      content: "Vui lòng chờ bot trả lời...",
    };
    setChatHistory([...chatHistory, userMessage, waitingBotMessage]);

    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [...chatHistory, userMessage],
        model: "gpt-4o-mini",
      });

      const response = chatCompletion.choices[0].message.content;
      const botMessage = { role: "assistant", content: response };
      setChatHistory([...chatHistory, userMessage, botMessage]);
    } catch (error) {
      console.error("Lỗi gọi OpenAI:", error);
      const botMessage = {
        role: "assistant",
        content: "❌ Lỗi gọi OpenAI API. Kiểm tra API key hoặc kết nối mạng.",
      };
      setChatHistory([...chatHistory, userMessage, botMessage]);
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">ChatUI với React + OpenAI</h1>
        <p className="text-sm text-gray-500 mb-4">
          Đang dùng API key từ:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {userApiKey ? "Người dùng nhập (mã hóa)" : "ENV (mặc định)"}
          </span>
        </p>

        <div className="mb-4 flex gap-4 items-center">
          <button
            onClick={() => {
              const newKey = prompt("Nhập OpenAI API Key của bạn:");
              if (newKey) {
                const encrypted = encryptKey(newKey);
                localStorage.setItem("user_api_key", encrypted);
                window.location.reload();
              }
            }}
            className="text-sm text-blue-600 underline"
          >
            Nhập key thủ công
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("user_api_key");
              window.location.reload();
            }}
            className="text-sm text-red-600 underline"
          >
            Dùng lại key mặc định
          </button>
        </div>

        <form className="flex" onSubmit={submitForm}>
          <input
            type="text"
            placeholder="Tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 rounded-l border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Gửi tin nhắn
          </button>
        </form>

        <div className="flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
          {chatHistory.map((chatMessage, i) => (
            <div
              key={i}
              className={`mb-2 ${
                isBotMessage(chatMessage) ? "text-right" : ""
              }`}
            >
              <p className="text-gray-600 text-sm">
                {isBotMessage(chatMessage) ? "Bot" : "User"}
              </p>
              <p
                className={`p-2 rounded-lg inline-block ${
                  isBotMessage(chatMessage) ? "bg-green-100" : "bg-blue-100"
                }`}
              >
                {chatMessage.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
