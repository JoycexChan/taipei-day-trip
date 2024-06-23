///////////註冊登入功能
(function () {
  // 模態窗口控制代碼
  const modal = document.getElementById("myModal");
  const loginRegisterLink = document.getElementById("loginRegisterLink");
  const logoutLink = document.getElementById("logoutLink");
  const closeSpan = document.getElementsByClassName("close")[0];

  function checkLoginStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
      showLoginRegister();
    } else {
      fetch("/api/user/auth", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.data && data.data.id) {
            showLogout();
          } else {
            showLoginRegister();
          }
        })
        .catch((error) => {
          console.error("Error during token validation:", error);
          showLoginRegister();
        });
    }
  }

  function showLoginRegister() {
    loginRegisterLink.style.display = "block";
    loginRegisterLink.classList.add("visible");
    logoutLink.style.display = "none";
    logoutLink.classList.remove("visible");
  }

  function showLogout() {
    logoutLink.style.display = "block";
    logoutLink.classList.add("visible");
    loginRegisterLink.style.display = "none";
    loginRegisterLink.classList.remove("visible");
    logoutLink.addEventListener("click", logout);
  }

  function logout() {
    console.log("Logging out, removing token");
    localStorage.removeItem("token");
    showLoginRegister();
  }

  document.addEventListener("DOMContentLoaded", checkLoginStatus);
  loginRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    modal.style.display = "block";
    showLogin();
  });

  closeSpan.addEventListener("click", () => {
    modal.style.display = "none";
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