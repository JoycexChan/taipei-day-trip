## Taipei Day Trip
Taipei Day Trip 是一個電子商務網站，讓使用者可以瀏覽旅遊行程、查看更多詳細資訊，並進行預訂與付款。專案旨在提供直觀且便捷的用戶體驗。

## 功能特點
- 無限滾動: 增加使用者參與度的無限滾動功能，提供無縫的瀏覽體驗，減少伺服器負載和頁面加載時間。
- 圖片幻燈片: 不依賴插件的圖片幻燈片，讓使用者能輕鬆瀏覽行程圖片。
- 第三方支付系統: 整合 TapPay 第三方支付系統，讓使用者可以順利完成支付流程。
- 會員頁面: 提供使用者註冊、登入功能，並管理個人預訂資訊。

## 使用技術
- JavaScript	使用純 JavaScript 實現網站互動功能
- CSS	負責佈局與響應式設計，保證在不同裝置上有良好體驗
- Python	後端使用 FastAPI 框架處理 API 請求與數據交互
- MySQL	作為後端資料庫，並設置連接池以優化資料庫性能
- AWS	使用 AWS EC2 伺服器部署網站

## 專案功能詳述
- 無限滾動: 提供無限滾動體驗，使用 AJAX 請求動態加載更多內容，提升使用者的體驗。
- 圖片幻燈片: 自訂實現的圖片幻燈片，無需依賴任何外部插件，具備優化效能的展示功能。
- 第三方支付系統整合: 支援 TapPay 來進行行程的安全支付，完整的購買流程從選擇行程到付款。
