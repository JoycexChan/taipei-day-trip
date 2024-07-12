document.addEventListener("DOMContentLoaded", function () {
  TPDirect.setupSDK(
    151723,
    "app_bOMzvdEJJRo34omSfQ3HA7hyjnSADrWmCA450aeFOgNgTcou6ig4qPG5a4Te",
    "sandbox"
  );

  let fields = {
    number: {
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: "#card-expiration-date",
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#card-ccv",
      placeholder: "CVV",
    },
  };

  TPDirect.card.setup({
    fields: fields,
    styles: {
      input: {
        color: "gray",
        "font-size": "16px",
      },
      ":focus": {
        color: "black",
      },
      ".valid": {
        color: "green",
      },
      ".invalid": {
        color: "red",
      },
    },
  });

  TPDirect.card.onUpdate(function (update) {
    document.getElementById("confirm-booking").disabled = !update.canGetPrime;
  });

  document
    .getElementById("confirm-booking")
    .addEventListener("click", function (event) {
      event.preventDefault();
      processPayment();
    });
});

function processPayment() {
  // 從表單中獲取數據
  const name = document.getElementById("contact-name").value;
  const email = document.getElementById("contact-email").value;
  const phone = document.getElementById("contact-phone").value;
  const totalPriceText = document.getElementById("total-price").textContent;

  // 使用正則表達式提取數字部分
  const totalPrice = parseInt(totalPriceText.replace(/[^\d]/g, ""), 10);

  console.log("Starting payment process...");

  // 這裡假設 TapPay 已經初始化並設置好 card fields
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      console.error("Failed to get prime:", result.msg);
      return;
    }

    const prime = result.card.prime;
    console.log("Got prime:", prime);

    // 發送支付請求
    fetch("/api/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        prime: prime,
        amount: totalPrice, // 確保 totalPrice 轉換為整數
        cardholder: {
          phone_number: phone,
          name: name,
          email: email,
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 0) {
          // 支付成功，清空預訂資料
          clearBookingData();
          // 支付成功，將狀態存入 localStorage
          localStorage.setItem("isLoggedIn", "true");

          // 重定向到感謝頁面
          window.location.href = `/thankyou?number=${data.order_number}`;
        } else {
          // 處理支付失敗情況
          console.error("Payment failed:", data.msg);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

function clearBookingData() {
  // 清空預訂資料，這裡應根據你的應用邏輯進行相應操作
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
      if (!response.ok) {
        response.json().then((data) => console.error(data.message));
      }
    })
    .catch((error) => console.error("錯誤:", error));
}
