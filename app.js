// Firebase scripts
document.write('<script src="https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js"></script>');

document.addEventListener("DOMContentLoaded", function () {
    loadPage("page1");

    // Event klik navigasi
    document.querySelectorAll('.nav-link').forEach(function (element) {
        element.addEventListener('click', function (event) {
            event.preventDefault();
            const targetPage = this.getAttribute('href').substring(1);
            loadPage(targetPage);

            // Sembunyikan menu setelah diklik
            document.getElementById("navbarNav").classList.remove("show");
        });
    });
});

function loadPage(page) {
    const appShell = document.getElementById("app-shell");
    fetch(`${page}.html`)
        .then(response => response.text())
        .then(html => {
            appShell.innerHTML = html;
            // Setelah halaman dimuat, inisialisasi fungsionalitas khusus jika diperlukan
            if (page === 'page1') {
                initializePage1();
            } else if (page === 'page2') {
                initializePage2();
            }
        })
        .catch(error => console.error('Error loading page:', error));
}

function initializePage1() {
    // Inisialisasi Firebase dan fungsionalitas terkait untuk halaman 1
    const firebaseConfig = {
        apiKey: "AIzaSyD4I7jHkdbOr6Nzn_VaT46X-GYyDKCEr_c",
            authDomain: "portofolio-aziz.firebaseapp.com",
            projectId: "portofolio-aziz",
            storageBucket: "portofolio-aziz.appspot.com",
            messagingSenderId: "40268641906",
            appId: "1:40268641906:web:239090ae53726fd8f8f4eb"
    };
    const app = firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Dapatkan token perangkat
    messaging.getToken({ vapidKey: "BNPAK_oIwCHPffoGn-XyTIK-04IADmZgfNzvjM6ZMZ2lvuBxu_ox-_hRypbTtI37Brwrj0nezgu0HUoFIzXzBUs" })
        .then((token) => {
            console.log("Device Token:", token);
            document.getElementById("deviceToken").innerText = " " + token;
            // Atur token perangkat sesuai kebutuhan
        }).catch((error) => {
            console.error('Error getting device token:', error);
        });

    // Dengarkan pesan yang masuk
    messaging.onMessage((payload) => {
        console.log('Message received ', payload);
        const messagesElement = document.querySelector('.message');
            const dataHeaderElement = document.createElement('h5');
            const dataElement = document.createElement('pre');
            dataElement.style = "overflow-x: hidden;";
            dataHeaderElement.textContent = "Message Received:";
            dataElement.textContent = JSON.stringify(payload, null, 2);
            messagesElement.appendChild(dataHeaderElement);
            messagesElement.appendChild(dataElement);
    });
}

function initializePage2() {
    // Inisialisasi IndexedDB dan fungsionalitas terkait untuk halaman 2
    const dbVersion = 1;
    const dbName = "KomentarDB";
    let db;

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("komentar")) {
            const objectStore = db.createObjectStore("komentar", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadCommentsFromDB();
    };

    request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.error);
    };

    const form = document.getElementById("komentar-form");
    const komentarInput = document.getElementById("komentar");
    const daftarKomentar = document.getElementById("daftar-komentar");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = document.getElementById("nama").value;
        const komentarText = document.getElementById("komentar").value;
        const timestamp = new Date().toISOString();

        const komentar = { nama, komentar: komentarText, timestamp };

        saveCommentToDB(komentar);
    });

    function saveCommentToDB(comment) {
        console.log("Saving comment to DB:", comment);
    
        const transaction = db.transaction(["komentar"], "readwrite");
        const objectStore = transaction.objectStore("komentar");
        const request = objectStore.add(comment);
    
        request.onsuccess = () => {
            loadCommentsFromDB();
            document.getElementById("nama").value = "";
            document.getElementById("komentar").value = "";
        };
    
        request.onerror = (event) => {
            console.error("Error saving comment: " + event.target.error);
        };
    }
    

    function loadCommentsFromDB() {
        while (daftarKomentar.firstChild) {
            daftarKomentar.removeChild(daftarKomentar.firstChild);
        }

        const transaction = db.transaction(["komentar"], "readonly");
        const objectStore = transaction.objectStore("komentar");
        const index = objectStore.index("timestamp");

        index.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const komentar = cursor.value;

                const commentDiv = document.createElement("div");
                commentDiv.className = "comment";
                commentDiv.innerHTML = `
                    <p>${komentar.nama}</p>
                    <p>${komentar.komentar}</p>
                    <p><small>${komentar.timestamp}</small></p>
                    <button class="edit-button" data-id="${cursor.primaryKey}">Edit</button>
                    <button class="delete-button" data-id="${cursor.primaryKey}">Delete</button>
                `;
                daftarKomentar.appendChild(commentDiv);

                // Add event listeners for edit and delete buttons
                const editButton = commentDiv.querySelector(".edit-button");
                const deleteButton = commentDiv.querySelector(".delete-button");

                editButton.addEventListener("click", () => editComment(cursor.primaryKey));
                deleteButton.addEventListener("click", () => deleteComment(cursor.primaryKey));

                cursor.continue();
            }
        };
    }

    function editComment(commentId) {
        const transaction = db.transaction(["komentar"], "readwrite");
        const objectStore = transaction.objectStore("komentar");
        const request = objectStore.get(commentId);

        request.onsuccess = (event) => {
            const komentar = event.target.result;

            // Remove the existing comment
            const commentDiv = document.querySelector(`[data-id="${commentId}"]`);
            commentDiv.innerHTML = "";

            // Create an input field for editing
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.value = komentar.komentar;

            // Create a "Save" button
            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";

            // Add event listener for the "Save" button
            saveButton.addEventListener("click", () => saveEditedComment(commentId, editInput.value));

            commentDiv.appendChild(editInput);
            commentDiv.appendChild(saveButton);
        };
    }

    function saveEditedComment(commentId, editedComment) {
        const transaction = db.transaction(["komentar"], "readwrite");
        const objectStore = transaction.objectStore("komentar");
        const request = objectStore.get(commentId);

        request.onsuccess = (event) => {
            const komentar = event.target.result;

            // Update the comment text
            komentar.komentar = editedComment;

            // Put the updated comment back into IndexedDB
            const updateRequest = objectStore.put(komentar);

            updateRequest.onsuccess = () => {
                // Reload the comments after editing
                loadCommentsFromDB();
            };

            updateRequest.onerror = (event) => {
                console.error("Error updating comment: " + event.target.error);
            };
        };
    }

    function deleteComment(commentId) {
        const transaction = db.transaction(["komentar"], "readwrite");
        const objectStore = transaction.objectStore("komentar");
        objectStore.delete(commentId);

        transaction.oncomplete = () => loadCommentsFromDB();
    }
}



