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
