// [2]初始化 DOM 元素 [3]檢查用戶登入狀態
//[4] 設置事件監聽器 [5] 登入功能實現 [6] 註冊功能實現 [6]表單切換及模態窗口操作
///////////註冊登入功能
import { isLoggedIn } from "./1_auth_helpers.js"; // 假設使用 ES6 模塊語法
import { showModal } from "./2_modal_functions.js"; // 假設使用 ES6 模塊語法

(function () {
  // 初始化 DOM 元素
  let modal = document.getElementById("myModal"); // 登入模態窗口
  let link = document.getElementById("loginRegisterLink"); // 登入/註冊連結
  let bookTripLink = document.getElementById("bookTrip"); // 獲取預定行程鏈接
  let span = document.getElementsByClassName("close")[0]; // 關閉按鈕（模態窗口）

  // 檢查用戶的登入狀態
  function checkLoginStatus() {
    let token = localStorage.getItem("token");
    console.log("Checking login status, token:", token); // 打印 token 值
    if (!token) {
      showLoginRegister();
      return;
    }

    fetch("/api/user/auth", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.data && data.data.id) {
          localStorage.setItem("user", JSON.stringify(data.data)); // 保存用戶數據
          showLogout();
        } else {
          showLoginRegister();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showLoginRegister();
      });
  }

  // 顯示登入/註冊選項
  function showLoginRegister() {
    loginRegisterLink.classList.add("visible"); // 確保登入/註冊按鈕可見
    loginRegisterLink.style.display = "block"; // 使用 display:block 來顯示按鈕
    if (logoutLink) {
      logoutLink.classList.remove("visible"); // 確保登出按鈕不可見
      logoutLink.style.display = "none"; // 使用 display:none 來隱藏按鈕
    }
  }

  // 顯示登出選項
  function showLogout() {
    document.getElementById("loginRegisterLink").style.display = "none";
    let logoutLink = document.getElementById("logoutLink");
    if (!logoutLink) {
      logoutLink = document.createElement("a");
      logoutLink.id = "logoutLink";
      logoutLink.href = "#";
      logoutLink.innerText = "登出系統";
      logoutLink.classList.add("link"); // 確保應用適當的樣式
      document.querySelector(".navbar-menu-content").appendChild(logoutLink);
    }
    logoutLink.style.display = "block";
    logoutLink.classList.add("visible"); // 確保可見性

    // 只在首次創建時添加事件監聽器
    if (!logoutLink.getAttribute("listener")) {
      logoutLink.addEventListener("click", logout);
      logoutLink.setAttribute("listener", "true"); // 標記監聽器已添加
    }
  }

  // 顯示登出選項
  function logout() {
    console.log("Logging out, removing token"); // 添加打印以確認登出時被調用
    localStorage.removeItem("token");
    showLoginRegister(); // 顯示登入/註冊界面
  }

  // 事件監聽：當 DOM 加載完成後，檢查用戶登入狀態
  document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
  });

  // 事件監聽：登入/註冊和預定行程的點擊事件處理
  //link.addEventListener("click", showModal); // 登入/註冊按鈕點擊事件
  //bookTripLink.addEventListener("click", showModal); // 預定行程按鈕點擊事件
  // 事件監聽：登入/註冊和預定行程的點擊事件處理
  link.addEventListener("click", handleLinkClick); // 登入/註冊按鈕點擊事件
  bookTripLink.addEventListener("click", handleLinkClick); // 預定行程按鈕點擊事件

  // 異步處理點擊事件:未登入，顯示登入/註冊模態窗口;已登入且點擊的是「預定行程」鏈接，則重定向到預訂頁面
  // 处理登录/注册和预定行程的点击事件
  async function handleLinkClick(event) {
    event.preventDefault();
    const loggedIn = await isLoggedIn(); // 使用新的函数检查是否已登录
    if (!loggedIn) {
      showModal(); // 如果未登录，显示登录模态窗口
    } else if (event.target === bookTripLink) {
      window.location.href = "/booking"; // 如果已登录，且点击的是预定行程，跳转到预定页面
    }
  }

  //事件監聽器設置:未登入，顯示登入/註冊模態窗口;已登入且點擊的是「預定行程」鏈接，則重定向到預訂頁面
  link.addEventListener("click", handleLinkClick);
  bookTripLink.addEventListener("click", handleLinkClick);

  // 登入功能實現
  function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    fetch("/api/user/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${email}&password=${password}`,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data received:", data); // 在此處打印數據
        if (data.token) {
          console.log("Token received:", data.token); // 在此處打印 token
          localStorage.setItem("token", data.token);
          console.log("Stored token:", localStorage.getItem("token")); // 在此處打印儲存的 token
          if (data.data) {
            localStorage.setItem("user", JSON.stringify(data.data)); // 正確保存用戶數據
            console.log("Stored user data:", localStorage.getItem("user")); // 在此處打印儲存的用戶數據
          }
          // 調用 checkLoginStatus 來更新用戶資料
          checkLoginStatus();

          // 隱藏模態窗口並顯示登出選項
          modal.style.display = "none";
          showLogout();
          document.getElementById("loginError").className = "success";
        } else {
          document.getElementById("loginError").textContent =
            "登入失敗：" + (data.message || "未知錯誤");
          document.getElementById("loginError").className = "error";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("loginError").textContent =
          "登入失敗：系統錯誤";
        document.getElementById("loginError").className = "error";
      });
  }

  // 註冊功能實現
  function register() {
    let name = document.getElementById("registerName").value;
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name, email: email, password: password }),
    })
      .then((response) =>
        response
          .json()
          .then((data) => ({ status: response.status, body: data }))
      )
      .then((data) => {
        if (data.status === 200 && data.body.ok) {
          document.getElementById("loginEmail").value = email;
          document.getElementById("loginPassword").value = password;
          showLogin();
          let loginSuccessElement = document.getElementById("loginSuccess");
          loginSuccessElement.textContent = "註冊成功，請登入系統";
          document.getElementById("loginSuccess").className = "success";
        } else if (data.status === 400) {
          document.getElementById("registerError").textContent =
            "註冊失敗：" + (data.body.message || "未知錯誤");
          document.getElementById("registerError").className = "error";
        } else if (data.status === 500) {
          document.getElementById("registerError").textContent =
            "註冊失敗：伺服器內部錯誤";
          document.getElementById("registerError").className = "error";
        } else {
          document.getElementById("registerError").textContent =
            "註冊失敗：未知錯誤";
          document.getElementById("registerError").className = "error";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("registerError").textContent =
          "註冊失敗：伺服器內部錯誤";
        document.getElementById("registerError").className = "error";
      });
  }

  // 切換到註冊表單
  function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginSuccess").textContent = "";
    document.getElementById("registerError").textContent = "";
  }

  // 切換回登入表單
  function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginSuccess").textContent = "";
    document.getElementById("registerError").textContent = "";
  }

  // 將需要全局訪問的函數附加到 window 對象上
  window.login = login;
  window.register = register;
  window.showLogin = showLogin;
  window.showRegister = showRegister;
})();
