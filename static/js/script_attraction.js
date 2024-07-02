//[1]頁面加載與圖片顯示 [2]價格變更 [3]預約行程

// 當頁面加載完成後執行的函數
import { isLoggedIn } from "./1_auth_helpers.js";

document.addEventListener("DOMContentLoaded", function () {
  const attractionId = window.location.pathname.split("/").pop();
  const imageElement = document.querySelector(".welcome-image");
  const indicatorsContainer = document.getElementById("image-indicators");
  let images = [];
  let currentIndex = 0;

  // 更新顯示的圖片
  function updateImage() {
    imageElement.src = images[currentIndex];
    updateIndicators();
  }

  // 更新圖片指示器
  function updateIndicators() {
    indicatorsContainer.innerHTML = ""; // 清除現有的指示器
    images.forEach((img, index) => {
      const dot = document.createElement("span");
      dot.className =
        "image-indicator" + (index === currentIndex ? " active-indicator" : "");
      indicatorsContainer.appendChild(dot);
    });
  }

  // 更新圖片指示器
  document.getElementById("next-button").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  });

  // 上一張圖片按鈕點擊事件
  document.getElementById("prev-button").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  });

  // 獲取景點詳細資訊
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

// 價格根據時間段變化
document.querySelectorAll('input[name="time-slot"]').forEach((input) => {
  input.addEventListener("change", function () {
    document.getElementById("price").value =
      this.value === "morning" ? "新台幣 2000 元" : "新台幣 2500 元";
  });
});

// 預約行程按鈕點擊事件
document
  .getElementById("startBooking")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      // 顯示登入窗口
      document.getElementById("myModal").style.display = "block";
      document.getElementById("loginForm").style.display = "block";
      document.getElementById("registerForm").style.display = "none";
    } else {
      // 用戶已登入執行預定邏輯
      createBooking();
    }
  });

// 創建預訂
async function createBooking() {
  const date = document.getElementById("date").value;
  const timeSlot = document.querySelector(
    'input[name="time-slot"]:checked'
  ).value;
  const priceText = document
    .getElementById("price")
    .value.replace("新台幣 ", "")
    .replace(" 元", "");
  const attractionId = window.location.pathname.split("/").pop(); // 確保這是正確的獲取方式
  // 確保將價格和景點 ID 轉換為整數
  const price = parseInt(priceText, 10);
  const attractionIdInt = parseInt(attractionId, 10);

  // 需要發送的數據
  const bookingData = {
    attraction_id: attractionIdInt,
    date: date,
    time: timeSlot,
    price: price,
  };

  // 打印即將發送的數據及其類型
  console.log("Sending booking data:", bookingData);
  console.log(
    "attractionId:",
    bookingData.attraction_id,
    "Type:",
    typeof bookingData.attraction_id
  );
  console.log("date:", bookingData.date, "Type:", typeof bookingData.date);
  console.log("time:", bookingData.time, "Type:", typeof bookingData.time);
  console.log("price:", bookingData.price, "Type:", typeof bookingData.price);

  const response = await fetch("/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      attraction_id: attractionId, // 添加景點ID
      date: date,
      time: timeSlot,
      price: price,
    }),
  });

  const result = await response.json();
  if (response.ok) {
    console.log("Booking success:", result);
    window.location.href = "/booking"; // 預定成功 定向預定頁面
  } else {
    console.error("Booking failed:", result);
    alert("預定失敗: " + result.message); // 顯示錯誤訊息
  }
}
