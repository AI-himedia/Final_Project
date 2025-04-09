import React, { useState } from "react";
import axios from "axios";

const ChatTestPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const subscriptionCode = 300; // 하드코딩된 테스트용 코드

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("http://localhost:8080/be/sms/chat", {
        subscriptionCode,
        userInput: input,
      });

      const aiMessage = {
        type: "ai",
        content: response.data.response || "(응답 없음)",
      };
    //   print(response);


      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: `오류: ${error.response?.data?.message || error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto border rounded p-4 space-y-2 bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-4 py-2 rounded-xl ${
              msg.type === "user"
                ? "bg-blue-100 self-start text-left"
                : "bg-green-100 self-end text-right"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <textarea
        className="mt-4 border p-2 rounded resize-none h-24"
        placeholder="메시지를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatTestPage;
