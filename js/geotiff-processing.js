async function readgeoTIFF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tidd.getImage();

    const rasters = await image.readRasters();
    const width = image.getWidth();
    const height = image.getHeight();

    // Extract geotiff metadata
    const bbox = image.getBoundingBox(); // [xmin, ymin, xmax, ymax] in UTM
    const crs = image.getGeoKeys().ProjectedCSTypeGeoKey; 

    return { rasters, width, height, bbox, crs };
}

// Convert bbox from UTM to WGS84
function convertBboxToWGS84(bbox, utmZoneEPSG) {
    const projSrc = `EPSG:${utmZoneEPSG}`;
    const projDst = 'EPSG:4326';

    const [xmin, ymin, xmax, ymax] = bbox;

    const [lngMin, latMin] = proj4(projSrc, projDst, [xmin, ymin]);
    const [lngMax, latMax] = proj4(projSrc, projDst, [xmax, ymax]);

    return [[latMin, lngMin], [latMax, lngMax]]
}