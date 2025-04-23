from flask import Flask, render_template
from routes.scan import scan_bp
import os

app = Flask(
    __name__,
    static_folder='static',
    template_folder='templates'
)

# Register the scanner blueprint
app.register_blueprint(scan_bp, url_prefix='/api')

# Home page route (renders the form)
@app.route('/')
def home():
    return render_template('index.html')

# Optional: 404 fallback
@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404 - Page Not Found</h1>", 404

# Optional: Run on custom port and host for LAN/dev testing
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
