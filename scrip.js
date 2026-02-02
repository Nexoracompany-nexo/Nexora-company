/**
 * NEXORA CORE JAVASCRIPT
 * Menangani Navigasi, Animasi 3D (Three.js), dan Interaksi UI
 */

// Konfigurasi State Global
let scene, camera, renderer, particles, torus;
let mouseX = 0, mouseY = 0;
let currentObjectURL = null;

/**
 * Navigasi Halaman
 * Berfungsi untuk berpindah antar section tanpa reload browser
 */
function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    const buttons = document.querySelectorAll('.nav-btn');
    
    // Sembunyikan semua section dan hapus status aktif pada tombol
    sections.forEach(s => s.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    // Tampilkan section yang dituju
    const targetSection = document.getElementById('page-' + pageId);
    const targetBtn = document.getElementById('btn-' + pageId);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
    
    // Tutup menu dropdown jika sedang terbuka
    const dropdown = document.getElementById('contact-dropdown');
    if (dropdown) dropdown.classList.remove('active');
    
    // Scroll kembali ke atas dengan efek halus
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Inisialisasi Background 3D (Three.js)
 */
function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Membuat sistem partikel (bintang-bintang digital)
        const particlesGeo = new THREE.BufferGeometry();
        const posArr = new Float32Array(1000 * 3);
        for (let i = 0; i < 3000; i++) {
            posArr[i] = (Math.random() - 0.5) * 15;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        
        const particlesMat = new THREE.PointsMaterial({
            size: 0.012,
            color: 0x4facfe,
            transparent: true,
            opacity: 0.4
        });
        
        particles = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particles);

        // Membuat objek Torus (donat kawat) sebagai elemen estetika
        const torusGeo = new THREE.TorusGeometry(3, 0.5, 16, 100);
        const torusMat = new THREE.MeshBasicMaterial({ 
            color: 0x4facfe, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.06 
        });
        torus = new THREE.Mesh(torusGeo, torusMat);
        scene.add(torus);

        animate();
    } catch (error) {
        console.error("Three.js Init Error:", error);
    }
}

/**
 * Loop Animasi 3D
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (particles) {
        particles.rotation.y += 0.0004;
        particles.rotation.x += 0.0002;
    }
    
    if (torus) {
        torus.rotation.z += 0.001;
        torus.rotation.y += 0.0005;
    }

    // Efek kamera mengikuti pergerakan mouse (Paralaks)
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

/**
 * Event Listeners & Penanganan Input
 */
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// Penanganan Unggahan Video
const videoInput = document.getElementById('video-input');
const mainVideo = document.getElementById('main-video');

if (videoInput) {
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
            currentObjectURL = URL.createObjectURL(file);
            mainVideo.src = currentObjectURL;
            
            document.getElementById('preview-wrapper').classList.remove('hidden');
            document.getElementById('drop-zone').classList.add('hidden');
            mainVideo.play();
        }
    });
}

// Fungsi Reset/Hapus Video
window.resetVideo = function() {
    if (!mainVideo) return;
    mainVideo.pause();
    mainVideo.src = "";
    if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
    
    document.getElementById('preview-wrapper').classList.add('hidden');
    document.getElementById('drop-zone').classList.remove('hidden');
};

// Toggle Menu Kontak
window.toggleContactMenu = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('contact-dropdown');
    if (dropdown) dropdown.classList.toggle('active');
};

// Klik di luar menu untuk menutup
document.addEventListener('click', () => {
    const dropdown = document.getElementById('contact-dropdown');
    if (dropdown) dropdown.classList.remove('active');
});

// Penyesuaian Ukuran Jendela
window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Jalankan inisialisasi saat halaman dimuat
window.addEventListener('load', init3D);