$(document).ready(() => {
    $("#signupForm").submit(async (event) => {
        event.preventDefault();

        const username = $("#username").val().trim();
        const email = $("#email").val().trim();
        const firstname = $("#firstname").val().trim();
        const lastname = $("#lastname").val().trim();
        const password = $("#password").val().trim();

        if (!username || !email || !firstname || !lastname || !password) {
            alert("All fields are required.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, firstname, lastname, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Failed to connect to server.");
        }
    });

        $("#loginForm").submit(async function (e) {
            e.preventDefault();
    
            const username = $("#loginUsername").val().trim();
            const password = $("#loginPassword").val().trim();
    
            if (!username || !password) {
                alert("All fields are required.");
                return;
            }
    
            try {
                const response = await fetch("http://localhost:3000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("username", data.user.username);
                    alert("Login successful!");
                    window.location.href = "chat.html"; 
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(" Login Request Error:", error);
                alert("Failed to connect to server.");
            }
        });
    });
    