const os = navigator.platform;
const display = document.getElementById("os-display");

if (display) {
    if (os.includes("Linux"))         { display.textContent = "Welcome Linux user!"; }
    else if (os.includes("Win"))      { display.textContent = "Welcome Windows user!"; }
    else if (os.includes("Mac"))      { display.textContent = "Welcome MacOS user!"; }
    else                              { display.textContent = "Welcome!"; }
}

function openWindow() {
    document.getElementById("myWindow").style.display = "block";
}

function closeWindow() {
    document.getElementById("myWindow").style.display = "none";
}

function showTab(name, clicked) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
    document.getElementById("tab-" + name).classList.add("active");
    clicked.classList.add("active");
}

const bar = document.getElementById("windowBar");
const win = document.getElementById("myWindow");
let dragging = false;
let offsetX = 0;
let offsetY = 0;

bar.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("tab") || e.target.classList.contains("close-button")) return;
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    bar.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
    if (dragging) {
        win.style.left = (e.clientX - offsetX) + "px";
        win.style.top  = (e.clientY - offsetY) + "px";
    }
});

document.addEventListener("mouseup", () => {
    dragging = false;
    bar.style.cursor = "grab";
});


const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#853ba2";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


function toggleSidebar() {
    const sidebar = document.querySelector(".left-sidebar");
    if (sidebar.style.display === "none") {
        sidebar.style.display = "block";
    } else {
        sidebar.style.display = "none";
    }
}