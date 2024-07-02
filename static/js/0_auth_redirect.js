//[1]檢查並重定向未登入用戶

(function () {
  // **函數定義區**

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

  // 當頁面加載時立即執行檢查
  checkAndRedirect();
})();
