// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDTJVV6W1RfD27lzmOj-0Q3AoxaOdcpB1g",
  authDomain: "gadeer-7cdeb.firebaseapp.com",
  projectId: "gadeer-7cdeb",
  storageBucket: "gadeer-7cdeb.appspot.com",
  messagingSenderId: "460471858459",
  appId: "1:460471858459:web:de6b7b248502a2f14bcfbe",
  measurementId: "G-B8NVFCPH0B",
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية
messaging.onBackgroundMessage(function (payload) {
  console.log("[🔥 SW] Background notification received:", payload);

  const notificationTitle = payload.notification?.title || "إشعار جديد";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/assets/icons/notification-icon.png",
    data: payload.data, // ✨ هنا مربط الفرس!
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// التعامل مع الضغط على الإشعار
self.addEventListener("notificationclick", function (event) {
  console.log("[🔗 SW] Notification clicked");

  // اطبع كل شيء متاح
  console.log("📦 event.notification:", event.notification);
  console.log("📦 event.notification.data:", event.notification?.data);
  console.log("📦 event:", event);

  const data = event.notification?.data || {};
  console.log("📦 Extracted data object:", data);

  let path = "/";

  if (data.type === "consultation") {
    path = `/ConsultDetails/${data.consultation_id}`;
  } else if (data.type === "chat" || data.type === "end-consultation") {
    path = `/consultations_messages/${data.consultation_id}`;
  }

  // 👇 نضيف نوع الإشعار في الـ query param لو end-consultation
  if (data.type === "end-consultation") {
    path += `?from_notification=end-consultation`;
  }

  const fullUrl = `https://gader.tanami.org.sa${path}`;
  console.log("🌐 Full URL to navigate:", fullUrl);

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.navigate(fullUrl).then(() => client.focus());
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});



