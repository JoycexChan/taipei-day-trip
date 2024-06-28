///////////註冊登入功能
(function () {
  // 模態窗口控制代碼
  let modal = document.getElementById("myModal");
  let link = document.getElementById("loginRegisterLink");
  let span = document.getElementsByClassName("close")[0];

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

  function showLoginRegister() {
    loginRegisterLink.classList.add("visible"); // 確保登入/註冊按鈕可見
    loginRegisterLink.style.display = "block"; // 使用 display:block 來顯示按鈕
    if (logoutLink) {
      logoutLink.classList.remove("visible"); // 確保登出按鈕不可見
      logoutLink.style.display = "none"; // 使用 display:none 來隱藏按鈕
    }
  }

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

  function logout() {
    console.log("Logging out, removing token"); // 添加打印以確認登出時被調用
    localStorage.removeItem("token");
    showLoginRegister(); // 顯示登入/註冊界面
  }

  // 當文件加載完成後，檢查用戶登入狀態
  document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
  });

  // 登入功能
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

  // 註冊功能
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

  link.onclick = function (event) {
    event.preventDefault();
    modal.style.display = "block";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  // 將需要全局訪問的函數附加到 window 對象上
  window.login = login;
  window.register = register;
  window.showLogin = showLogin;
  window.showRegister = showRegister;
})();
