import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const res = await fetch("/api/chat/b2b_chat_complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput })
    });

    const data = await res.json();
    setResponse(data.reply || "No response.");
  };

  return (
    <>
      <Head>
        <title>B2B Smart Chat Platform</title>
        <meta name="description" content="AI-powered assistant for B2B customer interaction" />
      </Head>

      <main className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-4">
          <h1 className="text-3xl font-bold text-center">🤖 B2B Smart Chat</h1>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full border border-gray-300 rounded-lg p-3 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>

          {response && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <h2 className="font-semibold mb-2">Response:</h2>
              <p>{response}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
