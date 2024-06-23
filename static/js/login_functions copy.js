(function () {
  // 取得UI元素參考
  const modal = document.getElementById("myModal");
  const loginRegisterLink = document.getElementById("loginRegisterLink");
  const logoutLink = document.getElementById("logoutLink");
  const closeSpan = document.getElementsByClassName("close")[0];

  // 檢查並更新登入狀態
  function checkLoginStatus() {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user/auth", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      })
        .then((response) => response.json())
        .then((data) => updateUIBasedOnLogin(data && data.data))
        .catch((error) => {
          console.error("Error during token validation:", error);
          updateUIBasedOnLogin(false);
        });
    } else {
      updateUIBasedOnLogin(false);
    }
  }

  // 根據登入狀態更新UI
  // 根據登入狀態更新UI
  function updateUIBasedOnLogin(isLoggedIn) {
    if (isLoggedIn) {
      logoutLink.style.display = "block";
      logoutLink.classList.add("visible");
      loginRegisterLink.style.display = "none";
      loginRegisterLink.classList.remove("visible");
    } else {
      logoutLink.style.display = "none";
      logoutLink.classList.remove("visible");
      loginRegisterLink.style.display = "block";
      loginRegisterLink.classList.add("visible");
    }
  }

  // 登出操作
  function logout() {
    localStorage.removeItem("token");
    updateUIBasedOnLogin(false);
  }

  // 事件綁定
  document.addEventListener("DOMContentLoaded", checkLoginStatus);
  loginRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    modal.style.display = "block";
  });
  closeSpan.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
  logoutLink.addEventListener("click", logout);

  // 全局暴露的功能
  window.login = login;
  window.register = register;

  // 登入操作
  function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    fetch("/api/user/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${email}&password=${password}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          updateUIBasedOnLogin(true);
          modal.style.display = "none";
        } else {
          throw new Error(data.message || "Unknown error");
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
      });
  }

  // 註冊操作
  function register() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          login(); // 直接調用登入函數
        } else {
          throw new Error(data.message || "Unknown error");
        }
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        alert("Registration failed: " + error.message);
      });
  }
  // 將需要全局訪問的函數附加到 window 對象上
  window.login = login;
  window.register = register;
  window.showLoginRegister = showLoginRegister;
  window.showLogout = showLogout;
})();
