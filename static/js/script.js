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
  if (nextPage === null) {
    console.log("No more pages to load.");
    return; // 如果已經沒有更多頁面，則不進行任何操作
  }

  isLoading = true; // 開始加載數據
  fetch(`/api/attractions?page=${page}&limit=${limit}&keyword=${query}`)
    .then((response) => response.json())
    .then((data) => {
      if (page === 0) mrtList.innerHTML = ""; // 清空列表以顯示新搜索結果
      data.data.forEach((item) => {
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
        mrtList.appendChild(card);
      });
      nextPage = data.nextPage; // 獲取下一頁
      page++;
      isLoading = false; // 加載完成
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
