document.addEventListener("DOMContentLoaded", function () {
  const attractionId = window.location.pathname.split("/").pop();
  const imageElement = document.querySelector(".welcome-image");
  const indicatorsContainer = document.getElementById("image-indicators");
  let images = [];
  let currentIndex = 0;

  function updateImage() {
    imageElement.src = images[currentIndex];
    updateIndicators();
  }

  function updateIndicators() {
    indicatorsContainer.innerHTML = ""; // 清除現有的指示器
    images.forEach((img, index) => {
      const dot = document.createElement("span");
      dot.className =
        "image-indicator" + (index === currentIndex ? " active-indicator" : "");
      indicatorsContainer.appendChild(dot);
    });
  }

  document.getElementById("next-button").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  });

  document.getElementById("prev-button").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  });

  fetch(`/api/attraction/${attractionId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch attraction details");
      return response.json();
    })
    .then((data) => {
      if (data && data.data) {
        // 更新圖片數據
        images = data.data.images;
        updateImage();

        // 更新景點名稱和捷運/類別信息
        document.getElementById("attraction-name").textContent = data.data.name;
        document.getElementById(
          "attraction-category-mrt"
        ).textContent = `${data.data.category} at ${data.data.mrt}`;
        document.querySelector(".attraction-description").textContent =
          data.data.description;
        document.querySelector(".attraction-address").textContent =
          data.data.address;
        document.querySelector(".attraction-transport").textContent =
          data.data.transport;
      } else {
        console.error("No data returned from the API.");
      }
    })
    .catch((error) => {
      console.error("Error loading the attraction details:", error);
    });
});

// 價格
document.querySelectorAll('input[name="time-slot"]').forEach((input) => {
  input.addEventListener("change", function () {
    document.getElementById("price").value =
      this.value === "morning" ? "新台幣 2000 元" : "新台幣 2500 元";
  });
});

///////////註冊登入功能

document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
});

function checkLoginStatus() {
  let token = localStorage.getItem("token");
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
  document.getElementById("loginRegisterLink").style.display = "block";
  let logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.style.display = "none";
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
    document.querySelector(".navbar-menu-content").appendChild(logoutLink);
  }
  logoutLink.style.display = "block";
  logoutLink.addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("token");
  showLoginRegister();
}

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
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        modal.style.display = "none";
        showLogout();
        document.getElementById("loginError").className = "success";
      } else {
        document.getElementById("loginError").textContent =
          "登入失敗：" + data.detail;
        document.getElementById("loginError").className = "error";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("loginError").textContent = "登入失敗：系統錯誤";
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
      response.json().then((data) => ({ status: response.status, body: data }))
    )
    .then((data) => {
      if (data.status === 200) {
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;
        showLogin();
        let loginSuccessElement = document.getElementById("loginSuccess");
        loginSuccessElement.textContent = "註冊成功，請登入";
        document.getElementById("loginSuccess").className = "success";
      } else {
        document.getElementById("registerError").textContent =
          "註冊失敗：" + (data.body.message || "未知錯誤");
        document.getElementById("registerError").className = "error";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("registerError").textContent =
        "註冊失敗：系統錯誤";
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

// 模態窗口控制代碼
let modal = document.getElementById("myModal");
let link = document.getElementById("loginRegisterLink");
let span = document.getElementsByClassName("close")[0];

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
