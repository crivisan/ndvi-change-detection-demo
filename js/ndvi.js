// Placeholder NDVI calculation
function calculateNDVIChange(beforeImg, afterImg) {
    Promise.all([
        loadImage(beforeImgSrc),
        loadImage(afterImgSrc)
    ]).then(([beforeImg, afterImg]) => {
        const beforeNDVI = calculateNDVI(beforeImg);
        const afterNDVI = calculateNDVI(afterImg);

        // Compute NDVI difference (after - before)
        const diffNDVI = afterNDVI.map((val, idx) => val - beforeNDVI[idx]);

        // Visualize NDVI difference as overlay
        renderNDVIToMap(diffNDVI, beforeImg.width, beforeImg.height);
    });
}

// load an image and draw o a hidden canvas
function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.src = src;
    })
}

// Calculate NDVI from an Image (simplified version)
function calculateNDVI(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    let ndviArray = [];
    
    for (let i= 0; i < data.length; i +=4) {
        const nir = data[i];
        const red = data[i + 1];

        const ndvi = (nir - red) / (nir + red + 0.00001);
        ndviArray.push(ndvi)
    }
    
    return ndviArray;
}

// Visualize NDVI result on Leaflet map
function renderNDVIToMAp(ndviData, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    for (let i = 0, j = 0; i < ndviData.length; i++, j+=4) {
        const ndvi = ndviData[i];
        let color = [0, 0, 0];

        // simple coloring scheme (red-green)
        if (ndvi > 0) {
            color = [0, Math.min(255, ndvi* 255), 0]; //green for positiv NDVI
        } else {
            color = [Math.min(255, Math.abs(ndvi) * 255), 0, 0] // red for negativ NDVI
        }

        imageData.data[j] = color[0]; //red
        imageData.data[j + 1] = color[1]; // green
        imageData.data[j + 2] = color[2]; //blue
        imageData.data[j + 3] = 150; // alpha 
    }
    ctx.putImageData(imageData, 0, 0);

    const imgUrl = canvas.toDataURL();

    //clear previous layers
    if (window.ndviLayer) {
        map.removeLayer(window.ndviLayer);
    }

    // Overlay the results on Leadflet map
    const bounds = [[-90, -180], [90, 180]]; // Global bounds
    window.ndviLayer = L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);
}