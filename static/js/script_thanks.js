// // 獲取 URL 中的查詢參數
// const urlParams = new URLSearchParams(window.location.search);
// const orderNumber = urlParams.get("number");

// // 顯示訂單號碼
// document.getElementById("order-number").textContent = orderNumber;
document.addEventListener("DOMContentLoaded", function () {
  // 檢查並重定向未登入用戶
  checkAndRedirect();

  // 為登出按鈕添加事件監聽器
  document.getElementById("logoutLink").addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  });

  // 獲取 URL 中的查詢參數
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get("number");
  const user = JSON.parse(localStorage.getItem("user"));

  if (orderNumber && user) {
    document.getElementById("userName").textContent = user.name;
    document.getElementById("order-number").textContent = orderNumber;
  } else {
    window.location.href = "/";
  }
});

// 檢查用戶是否登入，如果未登入則重定向到首頁
function checkAndRedirect() {
  if (!isUserLoggedIn()) {
    window.location.href = "/"; // 重定向到首頁
    return; // 結束執行以避免進一步加載頁面
  }
}

// 單獨檢查是否已登入，返回布爾值
function isUserLoggedIn() {
  // 檢查登入狀態的邏輯，例如檢查本地存儲或cookie
  return localStorage.getItem("isLoggedIn") === "true";
}
