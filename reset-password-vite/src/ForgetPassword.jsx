import { useState } from "react";
import axios from "axios";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/users/forget-pass", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "حدث خطأ");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>نسيت كلمة المرور</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: 8, width: "100%" }}>إرسال الرابط</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}