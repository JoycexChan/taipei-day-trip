//[1]初始加載預定數據 [2]初始加載用戶名稱 [3]取消預訂垃圾桶 [4]登出功能
// [1]初始加載預定數據和用戶名稱
import { isLoggedIn } from "./1_auth_helpers.js";

// 初始加載用戶名稱
document.addEventListener("DOMContentLoaded", function () {
  checkLoginAndUpdateUsername();
});

function checkLoginAndUpdateUsername() {
  const user = localStorage.getItem("user");
  console.log("localStorage contents:", localStorage); // 打印 localStorage 的內容
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData && userData.name) {
        document.getElementById("user-name").textContent = userData.name;
        console.log("User name updated on the page.");
      } else {
        console.log("No user data available.");
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  } else {
    console.log("No user data found in localStorage.");
  }
}

// 初始加載預定數據與用戶名稱
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/"; // 重定向到首頁
    return;
  }

  try {
    // 加載預定數據（同時包含用戶數據）
    const bookingResponse = await fetch("/api/booking", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const bookingData = await bookingResponse.json();
    if (bookingResponse.ok) {
      // 處理預定數據
      const attraction = bookingData.data.attraction;
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
    console.error("Error loading the booking details or user details:", error);
    alert("無法加載預訂信息：" + error.message);
  }
});

//取消預訂垃圾桶
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
  localStorage.removeItem("user");
  window.location.href = "/";
});
