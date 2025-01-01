const { contextBridge, ipcRenderer } = require('electron');

// Securely expose ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('api', {
    setWallpaper: async (imagePath) => {
        return await ipcRenderer.invoke('set-wallpaper', imagePath);
    },
});
