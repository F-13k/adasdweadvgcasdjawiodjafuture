// --- IMPORTATION FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCRiUSyocGDUNaGN7cAgbVJAXGDBFt0v5c",
  authDomain: "future-be1d6.firebaseapp.com",
  projectId: "future-be1d6",
  storageBucket: "future-be1d6.firebasestorage.app",
  messagingSenderId: "13040430008",
  appId: "1:13040430008:web:8ebbf7f3fcadd32893fd4d",
  measurementId: "G-R03K1D0KYC"
};

// Initialisation de l'application et de l'authentification
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ==========================================
// 1. GESTION DE L'AUTHENTIFICATION (COMPTES)
// ==========================================
let isLoginMode = true;

const authModal = document.getElementById('auth-modal');
const btnCompte = document.getElementById('btn-compte');
const closeAuth = document.getElementById('close-auth');
const toggleAuthMode = document.getElementById('toggle-auth-mode');
const authTitle = document.getElementById('auth-title');
const btnSubmitAuth = document.getElementById('btn-submit-auth');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');

const sectionLogin = document.getElementById('section-login');
const sectionDashboard = document.getElementById('section-dashboard');
const userEmailDisplay = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

// Ouvrir / Fermer la fenêtre de compte
btnCompte.addEventListener('click', () => {
    authModal.style.display = 'flex';
});
closeAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Basculer entre Connexion et Inscription
toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if(isLoginMode) {
        authTitle.innerText = "CONNEXION";
        btnSubmitAuth.innerText = "SE CONNECTER";
        toggleAuthMode.innerText = "Pas de compte ? Créer un compte";
    } else {
        authTitle.innerText = "INSCRIPTION";
        btnSubmitAuth.innerText = "CRÉER MON COMPTE";
        toggleAuthMode.innerText = "Déjà un compte ? Se connecter";
    }
});

// Action du bouton principal (S'inscrire / Se connecter)
btnSubmitAuth.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if(isLoginMode) {
        // Logique de Connexion
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Connexion réussie ! Bienvenue sur Future.");
                emailInput.value = "";
                passwordInput.value = "";
            })
            .catch((error) => {
                alert("Erreur de connexion. Vérifiez votre e-mail et mot de passe.");
                console.error(error);
            });
    } else {
        // Logique d'Inscription
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Compte créé avec succès ! Bienvenue dans la famille Future.");
                emailInput.value = "";
                passwordInput.value = "";
            })
            .catch((error) => {
                alert("Erreur : Le mot de passe doit faire au moins 6 caractères ou l'e-mail est déjà utilisé.");
                console.error(error);
            });
    }
});

// Action de Déconnexion
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Vous êtes déconnecté.");
    });
});

// Observer l'état de l'utilisateur en direct (Le Gardien)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Utilisateur connecté
        btnCompte.innerText = "MON ESPACE";
        sectionLogin.style.display = "none";
        sectionDashboard.style.display = "block";
        userEmailDisplay.innerText = user.email;
    } else {
        // Utilisateur déconnecté
        btnCompte.innerText = "MON COMPTE";
        sectionLogin.style.display = "block";
        sectionDashboard.style.display = "none";
    }
});


// ==========================================
// 2. GESTION DU PANIER
// ==========================================
let panier = [];

const cartSidebar = document.getElementById('cart-sidebar');
const btnPanier = document.getElementById('btn-panier');
const closeCartBtn = document.getElementById('close-cart-btn');

// Ouvrir / Fermer le panier
btnPanier.addEventListener('click', () => {
    cartSidebar.classList.add('active');
});
closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

// Fonction pour ajouter au panier (appelée depuis le HTML)
window.ajouterAuPanier = function(nom, prix) {
    panier.push({ nom: nom, prix: prix });
    mettreAJourPanier();
    cartSidebar.classList.add('active'); // Ouvre le panier
}

// Mettre à jour l'affichage du panier
function mettreAJourPanier() {
    const conteneurArticles = document.getElementById('cart-items');
    const compteur = document.getElementById('cart-count');
    const affichageTotal = document.getElementById('total-price');
    
    compteur.innerText = panier.length;
    conteneurArticles.innerHTML = '';
    
    let total = 0;
    
    if (panier.length === 0) {
        conteneurArticles.innerHTML = '<p style="color: #aaa;">Ton panier est vide.</p>';
    } else {
        panier.forEach(article => {
            total += article.prix;
            conteneurArticles.innerHTML += `
                <div class="cart-item">
                    <span>${article.nom}</span>
                    <span>${article.prix} €</span>
                </div>
            `;
        });
    }
    
    affichageTotal.innerText = total;
}