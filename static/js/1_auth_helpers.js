// auth_helpers.js

// 檢查用戶是否已登入，返回布爾值
async function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  try {
    const response = await fetch("/api/user/auth", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error("Unauthorized");
    }
    const data = await response.json();
    return data && data.data && data.data.id;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

export { isLoggedIn };
