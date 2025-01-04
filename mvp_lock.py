from flask import Flask, request, jsonify, render_template
import requests
import os
import win32api
import win32con
import win32gui

# import modules
#from py-wallpaper import set_wallpaper, get_wallpaper,change_wallpaper
  # Importing py-wallpaper

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/fetch-wallpapers", methods=["POST"])
def fetch_wallpapers():
    category = request.json.get("category")
    proxy_url = "http://localhost:5000/proxy"  # Node.js proxy server
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": category,
        "srnamespace": "6",
        "srlimit": 10,
    }
    try:
        response = requests.get(proxy_url, params=params)
        response.raise_for_status()
        wallpapers = [
            f"https://commons.wikimedia.org/wiki/Special:FilePath/{item['title'].replace(' ', '_')}"
            for item in response.json().get("query", {}).get("search", [])
        ]
        return jsonify({"wallpapers": wallpapers})
    except requests.exceptions.RequestException as e:
        print(f"Error fetching wallpapers: {e}")
        return jsonify({"error": "Failed to fetch wallpapers"}), 500

@app.route("/set-wallpaper", methods=["POST"])
def set_wallpaper():
    image_url = request.json.get("imageUrl")
    try:
        # Download the image to a temporary file
        local_image_path = os.path.join(os.getcwd(), "temp_wallpaper.jpg")
        response = requests.get(image_url)
        with open(local_image_path, "wb") as f:
            f.write(response.content)
        # Set the wallpaper
        win32gui.SystemParametersInfo(win32con.SPI_SETDESKWALLPAPER, local_image_path, win32con.SPIF_SENDCHANGE)


        return jsonify({"success": True, "message": "Wallpaper set successfully"})
    except Exception as e:
        print(f"Error setting wallpaper: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
