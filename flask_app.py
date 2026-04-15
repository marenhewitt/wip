from flask import Flask, redirect, request, render_template, jsonify
import weatherdata

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_weather')
def get_weather():
    zip_code = request.args.get('zip')
    data = weatherdata.get_weather(zip_code)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)