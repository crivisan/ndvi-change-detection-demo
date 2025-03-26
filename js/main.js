// Initialize Leaflet map
const map = L.map('map').setView([0, 0], 2);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Handle File Upload
const beforeInput = document.getElementById('beforeImage');
const afterInput = document.getElementById('afterImage');
const calculateBtn = document.getElementById('calculateNDVI');

let beforeImageData = null;
let afterImageData = null;

beforeInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            beforeImageData = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

afterInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            afterImageData = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

calculateBtn.addEventListener('click', () => {
    if (beforeImageData && afterImageData) {
        calculateNDVIChange(beforeImageData, afterImageData);
    } else {
        alert("Please upload both images first!");
    }
});
