// Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDksSfoYP4Nmt1Gb0ad50kA29My1SJhSOw",
      authDomain: "mealyeah-1c61b.firebaseapp.com",
      projectId: "mealyeah-1c61b",
      storageBucket: "mealyeah-1c61b.appspot.com",
      messagingSenderId: "929819945813",
      appId: "1:929819945813:web:acdb450832773816911ddc"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const ADMIN_KEY = "L@zYA$f^*K";
    const today = new Date();
    const tomorrowKey = new Date(today);
    tomorrowKey.setDate(today.getDate() + 1);
    const dateKey = tomorrowKey.toISOString().split('T')[0];

    function selectRole(role) {
  document.getElementById('roleSelect').classList.add('hidden');
 


  if (role === 'resident') {
    document.getElementById('residentUI').classList.remove('hidden');
  } else {
    const savedAdminKey = localStorage.getItem("adminAccessKey");

    if (savedAdminKey === ADMIN_KEY) {
      // Auto-login
      document.getElementById('adminUI').classList.remove('hidden');
      loadMenu();
      loadResponsesSummary();
    } else {
      const inputKey = prompt("Enter Admin Access Key:");
      if (inputKey === ADMIN_KEY) {
        localStorage.setItem("adminAccessKey", inputKey);  // Save key
        document.getElementById('adminUI').classList.remove('hidden');
        document.getElementById("adminGreeting").innerText = "Welcome back, Admin!";
        loadMenu();
        loadResponsesSummary();
      } else {
        alert("Access Denied. Returning to home.");
        document.getElementById('roleSelect').classList.remove('hidden');
        
      }
    }
  }
}


function continueResident() {
  const name = document.getElementById("resName").value.trim();
  const room = document.getElementById("resRoom").value.trim();
  const mobile = document.getElementById("resMobile").value.trim();
  const pgname = document.getElementById("resPG").value.trim();

  // Validate name (should be a string and not empty)
  if (!name || !isNaN(name)) {
    alert("Please enter a valid name (letters only).");
    return;
  }

  // Validate room (should be a number)
  if (!room || isNaN(room)) {
    alert("Please enter a valid room number (numbers only).");
    return;
  }

  // Validate mobile (if provided, should be a number)
  if (mobile && isNaN(mobile)) {
    alert("Please enter a valid phone number (numbers only).");
    return;
  }

  // Validate PG name (if provided, should be a string)
  if (pgname && !isNaN(pgname)) {
    alert("Please enter a valid PG name (letters only).");
    return;
  }

  // Save to localStorage
  localStorage.setItem("residentInfo", JSON.stringify({ name, room, mobile, pgname }));
  document.getElementById("greetingText").innerText = `Hello, ${name}!`;

  document.getElementById("residentStep1").classList.add("hidden");
  document.getElementById("residentStep2").classList.remove("hidden");
  loadMenu();

  // Update the account icon dropdown
  setAccountInfo(name, room, pgname);
}


    function loadMenu() {
      db.collection("menus").doc(dateKey).get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("menuBreakfast").innerText = data.breakfast || "--";
          document.getElementById("menuLunch").innerText = data.lunch || "--";
          document.getElementById("menuDinner").innerText = data.dinner || "--";

          if (document.getElementById("adminBreakfast")) {
            document.getElementById("adminBreakfast").value = data.breakfast || "";
            document.getElementById("adminLunch").value = data.lunch || "";
            document.getElementById("adminDinner").value = data.dinner || "";
          }
        }
      });
    }

      // ...existing code...
      function goBackToRoleSelect() {
        // Hide all main sections
        document.getElementById("residentUI").classList.add("hidden");
        document.getElementById("adminUI").classList.add("hidden");
        // Show only the role selection
        document.getElementById("roleSelect").classList.remove("hidden");
      }
// ...existing code...
    function submitResponse() {
      const name = document.getElementById("resName").value.trim();
      const room = document.getElementById("resRoom").value.trim();
      const pgname = document.getElementById("resPG").value.trim();
      const mobile = document.getElementById("resMobile").value.trim();
      if (!name || !room) {
        alert("Name and Room number are required.");
        return;
      }

      const responseData = {
        breakfast: document.getElementById("breakfastSelect").value,
        lunch: document.getElementById("lunchSelect").value,
        dinner: document.getElementById("dinnerSelect").value,
        room,
        pgname,
        mobile
      };

      db.collection("responses").doc(dateKey).set({
        [name]: responseData
      }, { merge: true }).then(() => {
        document.getElementById("thankYouMessage").classList.remove("hidden");
      });
    }
    window.onload = () => {
  const savedInfo = JSON.parse(localStorage.getItem("residentInfo"));
  document.getElementById("greetingText").innerText = `Hello, ${savedInfo.name}!`;

  if (savedInfo && savedInfo.name && savedInfo.room) {
    // Populate hidden inputs in case needed later
    document.getElementById("resName").value = savedInfo.name;
    document.getElementById("resRoom").value = savedInfo.room;
    document.getElementById("resMobile").value = savedInfo.mobile || "";
    document.getElementById("resPG").value = savedInfo.pgname || "";

    document.getElementById("roleSelect").classList.add("hidden");
    document.getElementById("residentUI").classList.remove("hidden");
    document.getElementById("residentStep1").classList.add("hidden");
    document.getElementById("residentStep2").classList.remove("hidden");
    loadMenu();
  }
};

function updateMenu() {
  const breakfast = document.getElementById("adminBreakfast").value.trim();
  const lunch = document.getElementById("adminLunch").value.trim();
  const dinner = document.getElementById("adminDinner").value.trim();

  db.collection("menus").doc(dateKey).set({
    breakfast, lunch, dinner
  }).then(() => {
    // Clear old responses silently
    db.collection("responses").doc(dateKey).delete().catch((error) => {
      console.error("Error deleting responses: ", error);
    });

    // Show the "New Menu Updated" message in the UI
    const updateMessage = document.getElementById("menuUpdateMessage");
    updateMessage.style.display = "block"; // Show the message

    // Hide it after 3 seconds
    setTimeout(() => {
      updateMessage.style.display = "none"; // Hide the message
    }, 3000);

    loadMenu();
    loadResponsesSummary(); // Refresh the responses summary (or reset)
  });
}

    function loadResponsesSummary() {
      db.collection("responses").doc(dateKey).onSnapshot(doc => {
        if (!doc.exists) {
          document.getElementById("responseSummary").innerText = "No responses yet.";
          return;
        }

        const data = doc.data();
        let summary = {
          breakfast: { Yes: 0, No: 0, Maybe: 0 },
          lunch:    { Yes: 0, No: 0, Maybe: 0 },
          dinner:   { Yes: 0, No: 0, Maybe: 0 },
        };

        Object.values(data).forEach(entry => {
          ["breakfast", "lunch", "dinner"].forEach(meal => {
            if (entry[meal]) {
              summary[meal][entry[meal]]++;
            }
          });
        });
        

        document.getElementById("responseSummary").innerHTML = `
          🍳 <b>Breakfast:</b> Yes: ${summary.breakfast.Yes}, No: ${summary.breakfast.No}, Maybe: ${summary.breakfast.Maybe}<br>
          🍛 <b>Lunch:</b> Yes: ${summary.lunch.Yes}, No: ${summary.lunch.No}, Maybe: ${summary.lunch.Maybe}<br>
          🍽️ <b>Dinner:</b> Yes: ${summary.dinner.Yes}, No: ${summary.dinner.No}, Maybe: ${summary.dinner.Maybe}
        `;
      });
    }

    // Add to your mealyeah.js or a <script> tag
function toggleAccountDropdown() {
  const dropdown = document.getElementById('accountDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Optional: Hide dropdown when clicking outside
document.addEventListener('click', function(event) {
  const accContainer = document.querySelector('.account-container');
  if (!accContainer.contains(event.target)) {
    document.getElementById('accountDropdown').style.display = 'none';
  }
});

// Add to mealyeah.js or a <script> tag
function setAccountInfo(name, room, pg) {
  let greeting = "Hello!";
  if (name && room) {
    greeting = `Hello, ${name} from room ${room}!`;
  } else if (name) {
    greeting = `Hello, ${name}!`;
  }
  document.getElementById('accGreeting').innerHTML = `<strong>${greeting}</strong>`;
  document.getElementById('accRoomPG').innerHTML = pg ? `PG: ${pg}` : '';
}

// Call this after saving user info in continueResident()
function continueResident() {
  const name = document.getElementById("resName").value.trim();
  const room = document.getElementById("resRoom").value.trim();
  const mobile = document.getElementById("resMobile").value.trim();
  const pgname = document.getElementById("resPG").value.trim();

  // Validate name (should be a string and not empty)
  if (!name || !isNaN(name)) {
    alert("Please enter a valid name (letters only).");
    return;
  }

  // Validate room (should be a number)
  if (!room || isNaN(room)) {
    alert("Please enter a valid room number (numbers only).");
    return;
  }

  // Validate mobile (if provided, should be a number)
  if (mobile && isNaN(mobile)) {
    alert("Please enter a valid phone number (numbers only).");
    return;
  }

  // Validate PG name (if provided, should be a string)
  if (pgname && !isNaN(pgname)) {
    alert("Please enter a valid PG name (letters only).");
    return;
  }

  // Save to localStorage
  localStorage.setItem("residentInfo", JSON.stringify({ name, room, mobile, pgname }));
  document.getElementById("greetingText").innerText = `Hello, ${name}!`;

  document.getElementById("residentStep1").classList.add("hidden");
  document.getElementById("residentStep2").classList.remove("hidden");
  loadMenu();

  // Update the account icon dropdown
  setAccountInfo(name, room, pgname);
}

window.onload = function() {
  const residentInfo = JSON.parse(localStorage.getItem("residentInfo"));
  if (residentInfo && residentInfo.name) {
    setAccountInfo(residentInfo.name, residentInfo.room, residentInfo.pgname);
  }
}