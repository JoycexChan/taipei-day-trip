let page = 0;
const limit = 12;
let nextPage = 0;
let isLoading = false; // 狀態標誌，表明是否正在加載數據
let lastScrollTop = 0; // 保存最後滾動位置
const mrtList = document.getElementById("mrt-list");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const mrtStations = document.getElementById("mrt-stations");

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

const throttledScroll = throttle(() => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 1000
  ) {
    // 假設 loadMoreData() 是加載更多數據的函數
    loadMoreData();
  }
}, 200);

window.addEventListener("scroll", throttledScroll);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    console.log("Reached the bottom of the page");
    // 可以在這裡加載更多數據或觸發其他行為
  }
});

function loadMoreData(query = "") {
  // 確保不會加載超出範圍的頁面
  if (isLoading || nextPage === null) {
    console.log("Request is already in progress or no more pages to load.");
    return;
  }

  isLoading = true; // 開始加載數據
  fetch(`/api/attractions?page=${page}&limit=${limit}&keyword=${query}`)
    .then((response) => response.json())
    .then((data) => {
      if (page === 0) mrtList.innerHTML = ""; // 清空列表以顯示新搜索結果
      data.data.forEach((item) => {
        const link = document.createElement("a");
        link.href = `/attraction/${item.id}`; // 確保此路徑與服務器路由設置匹配
        link.className = "attraction-link"; // 設置 CSS 以進一步美化鏈接

        const card = document.createElement("div");
        card.className = "attraction-card";
        card.style.position = "relative"; // 確保卡片是相對定位的，以便 .overlay 可以正確放置

        // 創建包含圖片和overlay的容器
        const imageOverlayWrapper = document.createElement("div");
        imageOverlayWrapper.className = "image-overlay-wrapper";

        // 創建圖片容器
        const imgContainer = document.createElement("div");
        imgContainer.className = "attraction-image-container";
        const img = document.createElement("img");
        img.src = item.images[0];
        img.className = "attraction-image";
        imgContainer.appendChild(img);

        // 創建半透明層顯示景點名稱
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        const name = document.createElement("div");
        name.className = "attraction-name-overlay";
        name.textContent = item.name;
        overlay.appendChild(name);

        // 組裝圖片和overlay到其容器
        imageOverlayWrapper.appendChild(imgContainer);
        imageOverlayWrapper.appendChild(overlay);
        card.appendChild(imageOverlayWrapper);

        // 景點資訊層，包括捷運站和類別
        const info = document.createElement("div");
        info.className = "attraction-info";
        info.style.display = "flex";
        info.style.justifyContent = "space-between"; // 兩端對齊

        const mrt = document.createElement("div");
        mrt.className = "attraction-mrt";
        mrt.textContent = item.mrt;
        info.appendChild(mrt);

        const category = document.createElement("div");
        category.className = "attraction-category";
        category.textContent = item.category;
        info.appendChild(category);

        card.appendChild(info);
        link.appendChild(card); // 將 card 加入到 link 中
        mrtList.appendChild(link); // 將 link 加到列表中
      });
      isLoading = false;
      if (data.nextPage) {
        page++;
        nextPage = data.nextPage;
      } else {
        nextPage = null;
      }
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      isLoading = false; // 發生錯誤時，重置加載標誌
    });
}

function loadMRTStations() {
  fetch("/api/mrts")
    .then((response) => response.json())
    .then((data) => {
      data.data.forEach((station) => {
        const div = document.createElement("div");
        div.className = "mrt-station";
        div.textContent = station;
        div.addEventListener("click", () => {
          searchInput.value = station;
          page = 0;
          loadMoreData(station);
        });
        mrtStations.appendChild(div);
      });
    });
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  page = 0;
  loadMoreData(query);
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 20) {
    // 微調以觸發滾動
    if (nextPage) {
      // 只有在有下一頁的情況下才加載
      const query = searchInput.value.trim();
      loadMoreData(query);
    }
  }
});

// 初始加載數據和捷運站名
loadMoreData();
loadMRTStations();

// 左右箭頭滾動捷運站名列表
document.getElementById("left-arrow").addEventListener("click", () => {
  mrtStations.scrollBy({ left: -1000, behavior: "smooth" });
});

document.getElementById("right-arrow").addEventListener("click", () => {
  mrtStations.scrollBy({ left: 1000, behavior: "smooth" });
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
      if (data.token) {
        localStorage.setItem("token", data.access_token);
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
