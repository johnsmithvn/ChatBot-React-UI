import { useEffect, useRef, useState } from "react";
import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_ENCRYPTION_SECRET;
const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const encryptedKey = localStorage.getItem("user_api_key");
const userApiKey = encryptedKey ? decryptKey(encryptedKey) : null;

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

function isBotMessage(msg) {
  return msg.role === "assistant";
}

// 🧠 Gọi LM Studio
async function callLocalModel(chatHistory, userMessage) {
  const model = "local-model-name"; // Đổi thành tên model local thật sự

  const messages = [...chatHistory, userMessage];
  if (!messages.length) throw new Error("🛑 Không có message để gửi!");

  const res = await fetch("/api/local/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });

  const data = await res.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error("❌ Phản hồi từ LM Studio không hợp lệ");
  }

  return data.choices[0].message.content;
}

// 🌐 Gọi OpenAI
async function callOpenAI(chatHistory, userMessage) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userApiKey || envApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [...chatHistory, userMessage],
    }),
  });
  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content || "❌ Không có phản hồi từ OpenAI."
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [useLocalModel, setUseLocalModel] = useState(false);
  const messagesEndRef = useRef(null);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const thinkingMsg = {
      role: "assistant",
      content: "🤖 Đang nghĩ trả lời...",
    };

    setChatHistory((prev) => [...prev, userMessage, thinkingMsg]);
    setMessage("");

    try {
      const responseText = useLocalModel
        ? await callLocalModel(chatHistory, userMessage)
        : await callOpenAI(chatHistory, userMessage);

      const botMessage = { role: "assistant", content: responseText };
      setChatHistory((prev) => [...prev.slice(0, -1), botMessage]); // remove thinkingMsg
    } catch (err) {
      console.error("❌ Gọi API lỗi:", err);
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "❌ Không kết nối được model. Kiểm tra lại API hoặc local server.",
        },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-screen-xl flex flex-col">
        <h1 className="text-3xl font-bold mb-2 text-center">💬 Chat với GPT</h1>
       <div className="text-xs text-center text-gray-500 mb-4 space-y-1">
  <p>
    Đang dùng:{" "}
    <span className="font-mono bg-gray-200 px-2 py-1 rounded">
      {useLocalModel
        ? "Local Model (LM Studio)"
        : userApiKey
        ? "User Key (🔐)"
        : "ENV Key"}
    </span>
  </p>
  <p>
    🧠 Hệ thống đang sử dụng:{" "}
    <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-gray-800">
      {useLocalModel
        ? "⚡ Local Model từ LM Studio"
        : userApiKey
        ? "🔐 OpenAI (User Key)"
        : "🌐 OpenAI (ENV Key)"}
    </span>
  </p>
</div>


        <div className="flex justify-center flex-wrap gap-4 mb-4 text-sm">
          <button
            onClick={() => {
              const newKey = prompt("Nhập OpenAI API Key của bạn:");
              if (newKey) {
                localStorage.setItem("user_api_key", encryptKey(newKey));
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
          <button
            onClick={() => setUseLocalModel((prev) => !prev)}
            className="text-purple-600 underline"
          >
            Chuyển sang {useLocalModel ? "OpenAI" : "Local Model"}
          </button>
        </div>

        <form onSubmit={submitForm} className="flex mb-4 w-full">
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

        {/* Scrollable Chat Box */}
        <div className="flex-grow overflow-hidden">
          <div
            className="overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
            style={{
              maxHeight: "calc(100vh - 300px)", // Chiếm gần full màn
              minHeight: "400px", // Đảm bảo tối thiểu nhìn rõ
            }}
          >
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
                      ? "bg-green-100 text-left"
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
