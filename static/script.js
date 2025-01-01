document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category-select");
    const fetchButton = document.getElementById("fetch-button");
    const wallpaperContainer = document.getElementById("wallpaper-container");

    fetchButton.addEventListener("click", () => {
        const selectedCategory = categorySelect.value;

        wallpaperContainer.innerHTML = "<div class='spinner'>Loading...</div>";

        // Fetch wallpapers from Flask backend
        fetch("/fetch-wallpapers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: selectedCategory }),
        })
            .then((response) => response.json())
            .then((data) => {
                wallpaperContainer.innerHTML = "";

                if (data.wallpapers.length === 0) {
                    wallpaperContainer.innerHTML = "<p>No wallpapers found for this category.</p>";
                    return;
                }

                data.wallpapers.forEach((wallpaper) => {
                    const img = document.createElement("img");
                    img.src = wallpaper;
                    img.alt = "Wallpaper";
                    img.classList.add("wallpaper-image");

                    const setWallpaperButton = document.createElement("button");
                    setWallpaperButton.textContent = "Set as Wallpaper";
                    setWallpaperButton.classList.add("set-wallpaper-button");

                    setWallpaperButton.addEventListener("click", async () => {
                        try {
                            const result = await window.api.setWallpaper(wallpaper); // Use the API exposed by preload.js
                            if (result.success) {
                                alert("Wallpaper set successfully!");
                            } else {
                                alert(`Failed to set wallpaper: ${result.error}`);
                            }
                        } catch (error) {
                            alert(`Error setting wallpaper: ${error.message}`);
                        }
                    });

                    const wallpaperItem = document.createElement("div");
                    wallpaperItem.classList.add("wallpaper-item");
                    wallpaperItem.appendChild(img);
                    wallpaperItem.appendChild(setWallpaperButton);

                    wallpaperContainer.appendChild(wallpaperItem);
                });
            })
            .catch((error) => {
                console.error("Error fetching wallpapers:", error);
                wallpaperContainer.innerHTML = "<p>Failed to fetch wallpapers. Please try again later.</p>";
            });
    });
});
