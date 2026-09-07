from flask import Flask, request, jsonify, send_from_directory, render_template
import sqlite3

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory("static/assets", filename)


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            guests TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


@app.route("/api/reservations", methods=["POST"])
def create_reservation():

    data = request.get_json()

    name = data.get("name")
    guests = data.get("guests")
    date = data.get("date")
    time = data.get("time")

    if not name or not guests or not date or not time:
        return jsonify({
            "success": False,
            "message": "Please fill in all required fields."
        }), 400

    from datetime import datetime

    try:
        reservation_date = datetime.strptime(date, "%Y-%m-%d").date()
        today = datetime.today().date()

        if reservation_date < today:
            return jsonify({
                "success": False,
                "message": "Please select a future date."
            }), 400

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Please enter a valid date."
        }), 400

    conn = get_db()

    # Check if the same date and time already exists
    existing = conn.execute("""
        SELECT id
        FROM reservations
        WHERE date = ? AND time = ?
    """, (date, time)).fetchone()

    if existing:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Sorry, that time is already requested. Please choose another time."
        }), 409

    # Save reservation
    conn.execute("""
        INSERT INTO reservations (name, guests, date, time)
        VALUES (?, ?, ?, ?)
    """, (name, guests, date, time))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Your table request has been received."
    })


@app.route("/admin/reservations")
def admin_reservations():
    conn = get_db()

    reservations = conn.execute("""
        SELECT * FROM reservations
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    from datetime import datetime
    today = datetime.today().date().isoformat()

    return render_template(
        "reservations.html",
        reservations=reservations,
        today=today
    )


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", debug=True)