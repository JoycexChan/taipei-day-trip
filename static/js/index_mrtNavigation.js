//index.html [1] 下拉加載和 [2] 捷運站快捷鍵

//[2] 捷運站快捷鍵

const mrtList = document.getElementById("mrt-list");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const mrtStations = document.getElementById("mrt-stations");

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

// 左右箭頭滾動捷運站名列表
document.getElementById("left-arrow").addEventListener("click", () => {
  mrtStations.scrollBy({ left: -1000, behavior: "smooth" });
});

document.getElementById("right-arrow").addEventListener("click", () => {
  mrtStations.scrollBy({ left: 1000, behavior: "smooth" });
});

// 初始加載數據和捷運站名
loadMRTStations();
