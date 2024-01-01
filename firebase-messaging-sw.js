importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyD4I7jHkdbOr6Nzn_VaT46X-GYyDKCEr_c",
  authDomain: "portofolio-aziz.firebaseapp.com",
  projectId: "portofolio-aziz",
  storageBucket: "portofolio-aziz.appspot.com",
  messagingSenderId: "40268641906",
  appId: "1:40268641906:web:239090ae53726fd8f8f4eb"
};

const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

// Optional: Add an event listener to handle background messages
self.addEventListener('push', (event) => {
  const payload = event.data.json();
  const options = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  self.registration.showNotification(payload.notification.title, options);
});