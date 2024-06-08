let page = 0;
const limit = 12;
let nextPage = 0;
const mrtList = document.getElementById("mrt-list");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const mrtStations = document.getElementById("mrt-stations");

function loadMoreData(query = "") {
  fetch(`/api/attractions?page=${page}&limit=${limit}&keyword=${query}`)
    .then((response) => response.json())
    .then((data) => {
      if (page === 0) mrtList.innerHTML = ""; // 清空列表以顯示新搜索結果
      data.data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "attraction-card";
        card.style.position = "relative"; // 確保卡片是相對定位的，以便 .overlay 可以正確放置

        const img = document.createElement("img");
        img.src = item.images[0]; // 使用第一張圖片
        card.appendChild(img);

        const overlay = document.createElement("div");
        overlay.className = "overlay";
        card.appendChild(overlay);

        const info = document.createElement("div");
        info.className = "attraction-info";

        const name = document.createElement("div");
        name.className = "attraction-name-overlay";
        name.textContent = item.name; // 景點名稱
        overlay.appendChild(name);

        const category = document.createElement("div");
        category.className = "attraction-category";
        category.textContent = item.category; // 類別
        info.appendChild(category);

        const mrt = document.createElement("div");
        mrt.className = "attraction-mrt";
        mrt.textContent = item.mrt; // 捷運站
        info.appendChild(mrt);

        card.appendChild(info);
        mrtList.appendChild(card);
      });
      nextPage = data.nextPage; // 獲取下一頁
      page++;
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
  mrtStations.scrollBy({ left: -200, behavior: "smooth" });
});

document.getElementById("right-arrow").addEventListener("click", () => {
  mrtStations.scrollBy({ left: 200, behavior: "smooth" });
});
