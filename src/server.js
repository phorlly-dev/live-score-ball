import app from "./app.js";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`⚽ Server running on http://localhost:${PORT}`);
});

export default function handler(req, res) {
    app(req, res); // This makes it Vercel-compatible
}
