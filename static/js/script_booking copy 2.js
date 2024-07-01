document.getElementById("bookTrip").addEventListener("click", function (event) {
  event.preventDefault();
  const isLoggedIn = localStorage.getItem("isLoggedIn"); // 從本地存儲獲取登入狀態

  if (isLoggedIn) {
    // 如果用戶已登入，重定向到預訂頁面
    window.location.href = "/booking";
  } else {
    // 如果用戶未登入，打開登入/註冊對話框
    openLoginModal(); // 假設有一個函數用於打開登入模態框
  }
});

function openLoginModal() {
  // 假設這裡有個函數用於處理打開模態框
  console.log("Opening login modal...");
  // 實際操作可能是設置一個模態框的顯示狀態為可見
  // 例如: document.getElementById('loginModal').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/booking", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const bookingData = await response.json();
    if (response.ok) {
      const attraction = bookingData.data.attraction; // 確保使用正確的路徑訪問attraction對象
      if (attraction) {
        document.getElementById("nobooking").style.display = "none";
        document.getElementById("attraction-name").textContent =
          attraction.name || "未提供名稱";
        document.getElementById("attraction-image").src =
          attraction.image || "path_to_default_image.jpg";
        document.getElementById("attraction-address").textContent =
          attraction.address || "無地址信息";
        document.getElementById("booking-date").textContent =
          bookingData.data.date;
        document.getElementById("booking-time").textContent =
          bookingData.data.time;
        document.getElementById("booking-price").textContent =
          "新台幣 " + bookingData.data.price + " 元";
        document.getElementById("total-price").textContent =
          "新台幣 " + bookingData.data.price + " 元";
      } else {
        console.error("No attraction data available");
        alert("無有效的景點資料");
      }
    } else {
      document.getElementById("nobooking").style.display = "block";
      document.querySelector(".booking-detail-1").style.display = "none";
      document.querySelector(".booking-detail-2").style.display = "none";
      document.querySelector(".booking-detail-3").style.display = "none";
      document.querySelector(".booking-detail-4").style.display = "none";
      document.querySelector(".divider1").style.display = "none";
      document.querySelector(".divider2").style.display = "none";
      document.querySelector(".divider3").style.display = "none";
    }
  } catch (error) {
    console.error("Error loading the booking details:", error);
    alert("無法加載預訂信息：" + error.message);
  }
});

//使用者名稱
document.addEventListener("DOMContentLoaded", function () {
  checkLoginAndUpdateUsername();
});

function checkLoginAndUpdateUsername() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, user not logged in.");
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
        throw new Error("Failed to fetch user details");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.data && data.data.name) {
        const userNameElement = document.getElementById("user-name");
        userNameElement.textContent = data.data.name;
        console.log("User name updated on the page.");
      } else {
        console.log("No name available in the response.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
}

//垃圾桶
document
  .getElementById("delete-booking")
  .addEventListener("click", function () {
    const token = localStorage.getItem("token"); // 從localStorage獲取token
    if (!token) {
      alert("請先登入！");
      return;
    }

    fetch("/api/booking", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert("預定已取消！");
          window.location.reload(); // 刷新頁面或導向到其他頁面
        } else {
          response.json().then((data) => alert(data.message));
        }
      })
      .catch((error) => console.error("錯誤:", error));
  });

// 添加登出功能並重定向到首頁
document.getElementById("logoutLink").addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "/";
});
