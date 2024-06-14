document.addEventListener("DOMContentLoaded", function () {
  // 從URL中提取景點ID
  const attractionId = window.location.pathname.split("/").pop();

  // 定義更新頁面的函數
  function updatePageContent(attraction) {
    document.getElementById("attraction-name").textContent = attraction.name;
    document.getElementById(
      "attraction-category-mrt"
    ).textContent = `${attraction.mrt} / ${attraction.category}`;
    document.getElementById("attraction-description").textContent =
      attraction.description;
    document.getElementById("attraction-address").textContent =
      attraction.address;
    document.getElementById("attraction-transport").textContent =
      attraction.transport;

    // 確保 images 字段是一個解析過的 JSON 如果它是字符串
    const images =
      typeof attraction.images === "string"
        ? JSON.parse(attraction.images)
        : attraction.images;
    setupImageSlider(images); // 呼叫圖片輪播函數
  }

  function setupImageSlider(images) {
    const imageElement = document.querySelector(".welcome-image");
    let currentIndex = 0;

    function showCurrentImage() {
      imageElement.src = images[currentIndex];
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      showCurrentImage();
    }

    showCurrentImage();
    setInterval(nextImage, 3000); // 每3秒切換圖片
  }

  // 獲取景點詳情
  fetch(`/api/attraction/${attractionId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch attraction details");
      return response.json();
    })
    .then((data) => {
      if (data && data.data) {
        updatePageContent(data.data);
      } else {
        console.error("No data returned from the API.");
      }
    })
    .catch((error) => {
      console.error("Error loading the attraction details:", error);
    });

  // 處理預定表單提交
  const bookingForm = document.getElementById("booking-form");
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Booking form submitted");
    // 這裡應該加入與預定相關的邏輯，例如驗證、發送數據等
  });
});
