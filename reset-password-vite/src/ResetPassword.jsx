import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/users/reset-pass", {
        token,
        newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "حدث خطأ");
    }
  };

  if (!token) return <p style={{ textAlign: "center" }}>الرابط غير صالح</p>;

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>إعادة تعيين كلمة المرور</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: 8, width: "100%" }}>تحديث كلمة المرور</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}