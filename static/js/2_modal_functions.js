//[6]模態窗口操作// 初始化 DOM 元素
let modal = document.getElementById("myModal");
let span = document.getElementsByClassName("close")[0];

// 顯示模態窗口
function showModal(event) {
  if (event) {
    event.preventDefault(); // 阻止默認行為
  }
  modal.style.display = "block";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

// 處理模態窗口的關閉事件
span.onclick = function () {
  modal.style.display = "none";
};

// 處理點擊模態窗口外部區域以關閉窗口
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// 導出 showModal 函數
export { showModal };
