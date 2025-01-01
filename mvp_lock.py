from flask import Flask, request, jsonify, render_template
import requests
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Replace with your own secret key

# Wikimedia Commons API Endpoint
WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php"

# Fetch Images from Wikimedia Commons
def fetch_wikimedia_images(category):
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": category,
        "srnamespace": "6",  # Search only in the file namespace
        "srlimit": 10,  # Number of images to fetch
    }
    response = requests.get(WIKIMEDIA_API_URL, params=params)
    data = response.json()
    print("Wikimedia API Response:", data)  # Debugging
    if data and data.get("query", {}).get("search"):
        return [item["title"] for item in data["query"]["search"]]
    return []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/fetch-wallpapers", methods=["POST"])
def fetch_wallpapers():
    category = request.json.get("category")
    image_titles = fetch_wikimedia_images(category)
    image_urls = []

    for title in image_titles:
        # Construct the image URL
        image_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{title.replace(' ', '_')}"
        image_urls.append(image_url)

    print("Fetched Image URLs:", image_urls)  # Debugging
    return jsonify({"wallpapers": image_urls})

if __name__ == "__main__":
    app.run(debug=True)