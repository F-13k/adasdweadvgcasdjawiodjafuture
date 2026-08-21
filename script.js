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

// Ouvrir / Fermer
btnCompte.addEventListener('click', () => { authSidebar.classList.add('active'); });
closeAuth.addEventListener('click', () => { authSidebar.classList.remove('active'); });

// Basculer Connexion/Inscription
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

// Valider Auth
btnSubmitAuth.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) return alert("Veuillez remplir tous les champs.");

    if(isLoginMode) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { emailInput.value = ""; passwordInput.value = ""; closeView(); })
            .catch(err => alert("Erreur de connexion. Vérifiez vos identifiants."));
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { alert("Compte créé !"); emailInput.value = ""; passwordInput.value = ""; })
            .catch(err => alert("Erreur : Mot de passe trop court ou e-mail utilisé."));
    }
});

btnLogout.addEventListener('click', () => { auth.signOut(); closeView(); });

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
// 2. NAVIGATION DANS LE PANNEAU CLIENT
// ==========================================

// Fonction pour ouvrir une sous-page
function openView(viewId) {
    // 1. Cacher le menu principal
    sectionDashboard.style.display = "none";
    // 2. Cacher toutes les autres vues au cas où
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.remove('active');
    });
    // 3. Afficher la vue demandée
    document.getElementById(viewId).classList.add('active');
}

// Fonction pour faire "Retour" et revoir le menu principal
function closeView() {
    // Cacher toutes les vues
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.remove('active');
    });
    // Réafficher le menu si on est connecté, sinon la page login
    if (auth.currentUser) {
        sectionDashboard.style.display = "block";
    } else {
        sectionLogin.style.display = "block";
    }
}

// ==========================================
// 3. FORMULAIRE DE SUPPORT
// ==========================================
function envoyerMessage(event) {
    event.preventDefault(); // Empêche la page de se recharger
    
    // Le code ci-dessous simule l'envoi. 
    // Plus tard, on connectera ça à un service d'envoi d'emails pro (ex: Formspree)
    alert("Ton message a bien été envoyé au support (fefesimcer@gmail.com) ! Nous te répondrons sous 24h.");
    
    // On vide les champs après envoi
    document.getElementById('sujet-support').value = "";
    document.getElementById('message-support').value = "";
    closeView(); // Retour au menu
}


// ==========================================
// 4. GESTION DU PANIER
// ==========================================
let panier = [];
const cartSidebar = document.getElementById('cart-sidebar');
const btnPanier = document.getElementById('btn-panier');
const closeCartBtn = document.getElementById('close-cart-btn');

btnPanier.addEventListener('click', () => { cartSidebar.classList.add('active'); });
closeCartBtn.addEventListener('click', () => { cartSidebar.classList.remove('active'); });

function ajouterAuPanier(nom, prix) {
    panier.push({ nom: nom, prix: prix });
    mettreAJourPanier();
    cartSidebar.classList.add('active');
}

function mettreAJourPanier() {
    const conteneur = document.getElementById('cart-items');
    const affichageTotal = document.getElementById('total-price');
    document.getElementById('cart-count').innerText = panier.length;
    
    conteneur.innerHTML = '';
    let total = 0;
    
    if (panier.length === 0) {
        conteneur.innerHTML = '<p style="color: #aaa;">Ton panier est vide.</p>';
    } else {
        panier.forEach(article => {
            total += article.prix;
            conteneur.innerHTML += `
                <div class="cart-item">
                    <span>${article.nom}</span>
                    <span>${article.prix} €</span>
                </div>
            `;
        });
    }
    affichageTotal.innerText = total;
}
