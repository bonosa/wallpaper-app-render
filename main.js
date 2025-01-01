const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Use axios for handling redirects

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load the Flask app

    mainWindow.loadURL('https://wallpaper-app-46.a.run.app');
});

// Function to sanitize the filename
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace invalid characters with underscores
        .replace(/\s+/g, '_'); // Replace spaces with underscores
};

// Function to download an image from a URL and save it locally
const downloadImage = async (url, localPath) => {
    try {
        const response = await axios({
            url,
            responseType: 'stream', // Stream the response
        });

        if (response.status !== 200) {
            throw new Error(`Failed to download image. Status code: ${response.status}`);
        }

        // Write the image to a file
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // Check the file size after download
                const stats = fs.statSync(localPath);
                if (stats.size === 0) {
                    fs.unlinkSync(localPath); // Delete the empty file
                    reject(new Error('Downloaded file is empty.'));
                } else {
                    resolve(localPath);
                }
            });

            writer.on('error', (error) => {
                fs.unlink(localPath, () => reject(error));
            });
        });
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
};

// IPC channel for setting wallpaper
ipcMain.handle('set-wallpaper', async (event, imageUrl) => {
    try {
        const wallpaper = await import('wallpaper'); // Dynamic import
        console.log(`Setting wallpaper from URL: ${imageUrl}`);

        // Sanitize the filename
        const filename = sanitizeFilename(path.basename(imageUrl));
        const localImagePath = path.join(__dirname, filename);

        // Download the image from the URL
        console.log('Downloading image...');
        await downloadImage(imageUrl, localImagePath);
        console.log(`Image downloaded to: ${localImagePath}`);

        // Check if the file exists
        if (!fs.existsSync(localImagePath)) {
            throw new Error('Downloaded file does not exist.');
        }

        // Set the wallpaper using the local file path
        console.log('Setting wallpaper...');
        await wallpaper.setWallpaper(localImagePath);

        return { success: true };
    } catch (error) {
        console.error(`Failed to set wallpaper: ${error.message}`);
        return { success: false, error: error.message };
    }
});