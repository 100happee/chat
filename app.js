import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔐 Supabase credentials
const supabaseUrl = "https://lcsfchtrwrjgaqpqlpwc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2ZjaHR3cndqZ2FxcHFscHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzA3MDgsImV4cCI6MjA2MDUwNjcwOH0.S5tWZT9jso6BpuWwZHzkvNN0E7eGFUeqlQp7UxY9Mhg";

const supabase = createClient(supabaseUrl, supabaseKey);

// ✉️ Send message
window.sendMessage = async () => {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text) {
    await supabase.from("messages").insert([{ text }]);
    input.value = "";
  }
};

// 📥 Show message
function showMessage(msg) {
  const chatBox = document.getElementById("chat-box");
  const p = document.createElement("p");
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  p.textContent = `[${time}] ${msg.text}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 📚 Load chat history
async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("timestamp", { ascending: true });

  if (data) {
    data.forEach(showMessage);
  }
}

// 🔁 Listen for new messages
function listenForNewMessages() {
  supabase
    .channel("chat-room")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages"
    }, (payload) => {
      showMessage(payload.new);
    })
    .subscribe();
}

// 📚 Initialize chat history and listen for updates
loadMessages();
listenForNewMessages();

// ⏎ Support Enter key to send
document.getElementById("message-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
