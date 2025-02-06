const socket = io("http://localhost:3000");

$(document).ready(() => {
    let currentRoom = localStorage.getItem("room");
    const username = localStorage.getItem("username");

    if (!username || !currentRoom) {
        window.location.href = "join.html";
    }

    $("#roomName").text(currentRoom);
    socket.emit("joinRoom", { username, room: currentRoom });

    
    $.get("/auth/members", (users) => {
        $("#allMembers").empty();
        users.forEach(user => {
            $("#allMembers").append(`<option value="${user.username}">${user.username}</option>`);
        });
    });

   
    $("#addMember").click(() => {
        const newMember = $("#memberUsername").val();
        if (!newMember || !currentRoom) {
            alert("Please select a user to add.");
            return;
        }

        socket.emit("addMemberToRoom", { admin: username, username: newMember, room: currentRoom });
        $("#memberUsername").val("");
    });

    $("#removeMember").click(() => {
        const removeMember = $("#memberUsername").val();
        if (!removeMember || !currentRoom) {
            alert("Please select a user to remove.");
            return;
        }

        socket.emit("removeMemberFromRoom", { admin: username, username: removeMember, room: currentRoom });
        $("#memberUsername").val("");
    });

    $("#leaveRoom").click(() => {
        if (confirm(`Are you sure you want to leave the room: ${currentRoom}?`)) {
            socket.emit("leaveRoom", { username, room: currentRoom });
            localStorage.removeItem("room");
            setTimeout(() => window.location.href = "join.html", 500);
        }
    });

  
    $("#logoutBtn").click(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("room");
        alert("You have been logged out successfully!");
        window.location.href = "login.html";
    });

   
    socket.on("updateUsers", (users) => {
        $("#userList").empty();
        users.forEach(user => {
            $("#userList").append(`<li>${user}</li>`);
        });
    });

    
    $("#sendMessage").click(() => {
        const message = $("#messageInput").val();
        if (!message) return;

        socket.emit("sendMessage", { username, room: currentRoom, message });
        $("#messageInput").val("");
    });

   
    socket.on("message", (data) => {
        $("#chatWindow").append(`<p><strong>${data.user}:</strong> ${data.text}</p>`);
    });

  
    $("#messageInput").on("keypress", () => {
        socket.emit("typing", { username, room: currentRoom });
    });

    socket.on("typing", (data) => {
        $("#typingIndicator").text(`${data.user} is typing...`);
        setTimeout(() => { $("#typingIndicator").text(""); }, 2000);
    });

   
    socket.on("memberAdded", (data) => {
        $("#chatWindow").append(`<p class="text-green-500"><strong>System:</strong> ${data.username} was added to the room.</p>`);
    });

    socket.on("memberRemoved", (data) => {
        $("#chatWindow").append(`<p class="text-red-500"><strong>System:</strong> ${data.username} was removed from the room.</p>`);
    });
});
