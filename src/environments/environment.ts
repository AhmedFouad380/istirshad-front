export const environment = {
  production: true,
  apiBaseUrl: 'https://gadeer.tanami.org.sa/api/',
  apiBaseUrlConsultant: 'https://gadeer.tanami.org.sa/consultant/',
  pusher: {
    key: 'ab784e6ee42989dd21c3',
    cluster: 'eu',
  },
  firebase: {
    apiKey: 'AIzaSy...YOUR_API_KEY_HERE...', // ✅ ضيف ده من Firebase Console
    authDomain: 'gadeer-7cdeb.firebaseapp.com',
    projectId: 'gadeer-7cdeb',
    storageBucket: 'gadeer-7cdeb.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID', // ✅ مهم
    appId: 'YOUR_APP_ID', // ✅ مهم
    vapidKey: 'BOP...YOUR_REAL_VAPID_KEY_HERE...', // ✅ هنا تحط VAPID الحقيقي اللي جبناه من Firebase Console
  },
};
