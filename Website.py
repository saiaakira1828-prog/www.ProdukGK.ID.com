"""
Website Portfolio Modern - Flask Backend
Aplikasi web portfolio yang responsif dengan tema gelap/terang dan form kontak
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json

# Inisialisasi Flask app
app = Flask(__name__, 
            template_folder=os.path.dirname(os.path.abspath(__file__)),
            static_folder=os.path.dirname(os.path.abspath(__file__)))

# Konfigurasi
app.config['JSON_SORT_KEYS'] = False

# Data produk digital (contoh)
DIGITAL_PRODUCTS = [
    {
        'id': 1,
        'name': 'Template Website Modern',
        'description': 'Template website responsif dengan desain minimalis',
        'price': 49.99,
        'image': '🎨',
        'rating': 4.8
    },
    {
        'id': 2,
        'name': 'UI Component Library',
        'description': 'Koleksi 100+ komponen UI siap pakai',
        'price': 29.99,
        'image': '⚡',
        'rating': 4.9
    },
    {
        'id': 3,
        'name': 'Kursus Web Design',
        'description': 'Belajar web design dari dasar hingga advanced',
        'price': 59.99,
        'image': '📚',
        'rating': 4.7
    }
]

# Data testimoni
TESTIMONIALS = [
    {
        'name': 'Ahmad Rifai',
        'role': 'Web Developer',
        'text': 'Website ini sangat membantu mengembangkan portofolio saya!',
        'rating': 5
    },
    {
        'name': 'Siti Nurhayati',
        'role': 'UI/UX Designer',
        'text': 'Desainnya modern dan responsif. Sangat recommended!',
        'rating': 5
    },
    {
        'name': 'Budi Santoso',
        'role': 'Entrepreneur',
        'text': 'Produk digital berkualitas tinggi dengan harga terjangkau.',
        'rating': 4
    }
]


# ============= ROUTES =============

@app.route('/')
def home():
    """Halaman utama website"""
    return render_template_or_file('Website.html')


@app.route('/api/products')
def get_products():
    """API untuk mendapatkan daftar produk digital"""
    return jsonify({
        'status': 'success',
        'products': DIGITAL_PRODUCTS,
        'total': len(DIGITAL_PRODUCTS)
    })


@app.route('/api/testimonials')
def get_testimonials():
    """API untuk mendapatkan testimoni pelanggan"""
    return jsonify({
        'status': 'success',
        'testimonials': TESTIMONIALS,
        'total': len(TESTIMONIALS)
    })


@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """
    Handle form kontak dari UI
    Request body: { name, email, message }
    """
    try:
        data = request.get_json()
        
        # Validasi input
        if not data or not all(key in data for key in ['name', 'email', 'message']):
            return jsonify({
                'status': 'error',
                'message': 'Data tidak lengkap. Mohon isi semua field.'
            }), 400
        
        name = data['name'].strip()
        email = data['email'].strip()
        message = data['message'].strip()
        
        # Validasi format email
        if '@' not in email:
            return jsonify({
                'status': 'error',
                'message': 'Format email tidak valid.'
            }), 400
        
        # Validasi panjang pesan
        if len(message) < 10:
            return jsonify({
                'status': 'error',
                'message': 'Pesan terlalu pendek. Minimal 10 karakter.'
            }), 400
        
        # Simpan ke log file
        log_contact_message(name, email, message)
        
        # Opsi: Kirim email (uncomment jika sudah konfigurasi)
        # send_email_notification(name, email, message)
        
        return jsonify({
            'status': 'success',
            'message': f'Terima kasih {name}! Pesan Anda telah diterima. Saya akan segera menghubungi Anda.',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f'Error dalam handle_contact: {str(e)}')
        return jsonify({
            'status': 'error',
            'message': 'Terjadi kesalahan. Silakan coba lagi nanti.'
        }), 500


@app.route('/api/stats')
def get_stats():
    """API untuk statistik website"""
    return jsonify({
        'status': 'success',
        'stats': {
            'projects_completed': 45,
            'happy_clients': 28,
            'years_experience': 5,
            'total_products': len(DIGITAL_PRODUCTS)
        }
    })


@app.route('/<path:filename>')
def serve_files(filename):
    """Serve static files (CSS, JS, HTML, dll)"""
    base_path = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_path, filename)
    
    if os.path.isfile(file_path):
        return send_from_directory(base_path, filename)
    
    return jsonify({'error': 'File not found'}), 404


# ============= HELPER FUNCTIONS =============

def render_template_or_file(filename):
    """Render template HTML atau serve file langsung"""
    try:
        return render_template(filename)
    except:
        base_path = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_path, filename)
        if os.path.isfile(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        return "File not found", 404


def log_contact_message(name, email, message):
    """Simpan pesan kontak ke file JSON"""
    log_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'contact_messages.json'
    )
    
    new_message = {
        'id': datetime.now().timestamp(),
        'name': name,
        'email': email,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        # Baca data existing
        messages = []
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                messages = json.load(f)
        
        # Tambah pesan baru
        messages.append(new_message)
        
        # Simpan kembali
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(messages, f, indent=2, ensure_ascii=False)
        
        print(f'✅ Pesan dari {name} telah disimpan.')
        
    except Exception as e:
        print(f'⚠️ Error menyimpan pesan: {str(e)}')


def send_email_notification(name, email, message):
    """
    Kirim email notifikasi (gunakan SMTP)
    CATATAN: Uncomment dan konfigurasi dengan email Anda sendiri
    """
    # Contoh konfigurasi Gmail:
    # smtp_server = 'smtp.gmail.com'
    # sender_email = 'your_email@gmail.com'
    # sender_password = 'your_app_password'  # Gunakan App Password, bukan password biasa
    # 
    # try:
    #     msg = MIMEMultipart()
    #     msg['From'] = sender_email
    #     msg['To'] = sender_email
    #     msg['Subject'] = f'Pesan Baru dari {name}'
    #     
    #     body = f"""
    #     Anda menerima pesan baru dari formulir kontak:
    #     
    #     Nama: {name}
    #     Email: {email}
    #     
    #     Pesan:
    #     {message}
    #     """
    #     
    #     msg.attach(MIMEText(body, 'plain'))
    #     
    #     with smtplib.SMTP_SSL(smtp_server, 465) as server:
    #         server.login(sender_email, sender_password)
    #         server.send_message(msg)
    #     
    #     print(f'📧 Email notifikasi terkirim untuk pesan dari {name}')
    # except Exception as e:
    #     print(f'⚠️ Error mengirim email: {str(e)}')
    pass


# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Halaman tidak ditemukan',
        'error': 'Not Found'
    }), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Terjadi kesalahan server',
        'error': 'Internal Server Error'
    }), 500


# ============= MAIN =============

if __name__ == '__main__':
    """Jalankan server Flask"""
    print('🚀 Website Portfolio Modern dimulai...')
    print('📍 Akses di: http://localhost:5000')
    print('🌐 Tekan Ctrl+C untuk menghentikan server')
    print('=' * 50)
    
    # Jalankan dengan debug mode untuk development
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True,
        use_reloader=True
    )
