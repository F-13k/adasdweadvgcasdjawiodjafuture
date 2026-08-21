// --- CONFIGURATION FIREBASE CLASSIQUE ---
const firebaseConfig = {
  apiKey: "AIzaSyCRiUSyocGDUNaGN7cAgbVJAXGDBFt0v5c",
  authDomain: "future-be1d6.firebaseapp.com",
  projectId: "future-be1d6",
  storageBucket: "future-be1d6.firebasestorage.app",
  messagingSenderId: "13040430008",
  appId: "1:13040430008:web:8ebbf7f3fcadd32893fd4d",
  measurementId: "G-R03K1D0KYC"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ==========================================
// 1. GESTION DE L'AUTHENTIFICATION (COMPTES)
// ==========================================
let isLoginMode = true;

const authSidebar = document.getElementById('auth-sidebar');
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

// Ouvrir / Fermer le panneau compte (Gauche)
btnCompte.addEventListener('click', () => {
    authSidebar.classList.add('active');
});
closeAuth.addEventListener('click', () => {
    authSidebar.classList.remove('active');
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

// Bouton Valider
btnSubmitAuth.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if(isLoginMode) {
        // Connexion
        auth.signInWithEmailAndPassword(email, password)
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
        // Inscription
        auth.createUserWithEmailAndPassword(email, password)
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

// Déconnexion
btnLogout.addEventListener('click', () => {
    auth.signOut().then(() => {
        alert("Vous êtes déconnecté.");
    });
});

// Observer l'état
auth.onAuthStateChanged((user) => {
    if (user) {
        btnCompte.innerText = "MON ESPACE";
        sectionLogin.style.display = "none";
        sectionDashboard.style.display = "block";
        userEmailDisplay.innerText = user.email;
    } else {
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

// Ouvrir / Fermer le panier (Droite)
btnPanier.addEventListener('click', () => {
    cartSidebar.classList.add('active');
});
closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

function ajouterAuPanier(nom, prix) {
    panier.push({ nom: nom, prix: prix });
    mettreAJourPanier();
    cartSidebar.classList.add('active');
}

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
