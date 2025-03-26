// Placeholder NDVI calculation
async function calculateNDVIChange(beforeFile, afterFile) {
    const before = await readGeoTIFF(beforeFile);
    const after = await readGeoTIFF(afterFile);

    const width = before.width;
    const height = before.height;

    // Assuming Sentinel-2: Band 4 (Red), Band 8 (NIR)
    const beforeRed = before.rasters[3];  // Band 4
    const beforeNIR = before.rasters[7];  // Band 8

    const afterRed = after.rasters[3];  
    const afterNIR = after.rasters[7];

    let ndviDiff = new Float32Array(width * height);

    for (let i = 0; i < ndviDiff.length; i++) {
        const beforeNDVI = (beforeNIR[i] - beforeRed[i]) / (beforeNIR[i] + beforeRed[i] + 0.0001);
        const afterNDVI = (afterNIR[i] - afterRed[i]) / (afterNIR[i] + afterRed[i] + 0.0001);
        ndviDiff[i] = afterNDVI - beforeNDVI;
    }

    // Convert bounding box
    const bounds = convertBboxToWGS84(before.bbox, before.crs);

    // Render NDVI difference to map
    renderNDVIToMap(ndviDiff, width, height, bounds);
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
function renderNDVIToMap(ndviData, width, height, bounds) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    for (let i = 0, j = 0; i < ndviData.length; i++, j += 4) {
        const ndvi = ndviData[i];
        let color = [0, 0, 0];

        if (ndvi > 0) {
            color = [0, Math.min(255, ndvi * 255), 0];
        } else {
            color = [Math.min(255, Math.abs(ndvi) * 255), 0, 0];
        }

        imageData.data[j] = color[0];
        imageData.data[j + 1] = color[1];
        imageData.data[j + 2] = color[2];
        imageData.data[j + 3] = 150;
    }

    ctx.putImageData(imageData, 0, 0);
    const imgUrl = canvas.toDataURL();

    if (window.ndviLayer) {
        map.removeLayer(window.ndviLayer);
    }

    window.ndviLayer = L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);
}
