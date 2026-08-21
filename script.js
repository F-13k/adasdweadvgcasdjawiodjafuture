// ==========================================
// 0. INITIALISATION DE STRIPE
// ==========================================
// ⚠️ ATTENTION : REMPLACE LA LIGNE CI-DESSOUS PAR TA VRAIE CLÉ PUBLIQUE STRIPE
const stripe = Stripe('pk_test_51U6ggQH9XGzkkTIl6TOpdSkL2rzAZuhYQ6Vl48UyBrGciyVmL9j7n4QltBisAQCtbRD46FgRomg5HuFvtvR3oimy00YYh2n3h4');
const db = firebase.firestore();

// ==========================================
// 1. CONFIGURATION FIREBASE
// ==========================================
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
// 2. GESTION DE L'AUTHENTIFICATION (COMPTES)
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

// Ouvrir / Fermer le panneau compte
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

// Valider Connexion/Inscription
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
// 3. NAVIGATION ET CHARGEMENT DES COMMANDES
// ==========================================
function openView(viewId) {
    sectionDashboard.style.display = "none";
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // Si on ouvre l'onglet commandes, on va chercher les infos dans Firebase
    if (viewId === 'view-commandes') {
        chargerCommandes();
    }
}

function closeView() {
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    if (auth.currentUser) {
        sectionDashboard.style.display = "block";
    } else {
        sectionLogin.style.display = "block";
    }
}

function chargerCommandes() {
    const vueCommandes = document.getElementById('view-commandes');
    
    // On met un texte de chargement
    vueCommandes.innerHTML = `
        <button class="btn-back" onclick="closeView()">⬅ Retour au menu</button>
        <h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3>
        <p class="empty-state" id="loading-txt">Chargement de tes commandes...</p>
        <div id="liste-commandes"></div>
    `;

    if (!auth.currentUser) return;

    // On interroge la base de données Firebase
    db.collection('commandes')
      .where('email', '==', auth.currentUser.email)
      .get()
      .then((querySnapshot) => {
          document.getElementById('loading-txt').style.display = 'none';
          const liste = document.getElementById('liste-commandes');

          if (querySnapshot.empty) {
              liste.innerHTML = '<p class="empty-state">Tu n\'as aucune commande pour le moment.</p>';
              return;
          }

          let html = '';
          // On liste chaque commande trouvée
          querySnapshot.forEach((doc) => {
              const cmd = doc.data();
              const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
              
              // Design d'une commande
              html += `
                <div class="saved-item" style="flex-direction: column; align-items: flex-start;">
                    <div style="width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;">
                        <strong>Commande du ${date}</strong>
                        <span style="color: #4CAF50;">${cmd.statut}</span>
                    </div>
                    <ul style="color: #ccc; font-size: 0.85rem; margin-bottom: 10px; width: 100%;">
                        ${cmd.articles.map(art => `<li>• 1x ${art.nom} - ${art.prix} €</li>`).join('')}
                    </ul>
                    <strong>Total : ${cmd.total} €</strong>
                </div>
              `;
          });
          liste.innerHTML = html;
      })
      .catch((erreur) => {
          console.error("Erreur Firebase:", erreur);
          document.getElementById('loading-txt').innerText = "Erreur de chargement.";
      });
}

// ==========================================
// 4. GESTION DES ADRESSES ET CARTES
// ==========================================
let mesAdresses = [];
let mesCartes = [];

document.getElementById('btn-show-address').addEventListener('click', () => {
    document.getElementById('form-address').style.display = 'block';
    document.getElementById('btn-show-address').style.display = 'none';
});

document.getElementById('btn-show-card').addEventListener('click', () => {
    document.getElementById('form-card').style.display = 'block';
    document.getElementById('btn-show-card').style.display = 'none';
});

window.sauvegarderAdresse = function(event) {
    event.preventDefault();
    const rue = document.getElementById('addr-rue').value;
    const cp = document.getElementById('addr-cp').value;
    const ville = document.getElementById('addr-ville').value;
    
    mesAdresses.push(`${rue}, ${cp} ${ville}`);
    document.getElementById('form-address').reset();
    document.getElementById('form-address').style.display = 'none';
    document.getElementById('btn-show-address').style.display = 'block';
    afficherAdresses();
}

function afficherAdresses() {
    const container = document.getElementById('adresses-list');
    if (mesAdresses.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune adresse enregistrée.</p>';
    } else {
        container.innerHTML = '';
        mesAdresses.forEach(addr => {
            container.innerHTML += `<div class="saved-item">📍 <span>${addr}</span></div>`;
        });
    }
}

window.sauvegarderCarte = function(event) {
    event.preventDefault();
    const numero = document.getElementById('card-numero').value;
    const derniersChiffres = numero.slice(-4);
    mesCartes.push(`**** **** **** ${derniersChiffres}`);
    
    document.getElementById('form-card').reset();
    document.getElementById('form-card').style.display = 'none';
    document.getElementById('btn-show-card').style.display = 'block';
    afficherCartes();
}

function afficherCartes() {
    const container = document.getElementById('cartes-list');
    if (mesCartes.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun moyen de paiement enregistré.</p>';
    } else {
        container.innerHTML = '';
        mesCartes.forEach(carte => {
            container.innerHTML += `<div class="saved-item">💳 <span>Carte terminant par ${carte}</span></div>`;
        });
    }
}

// ==========================================
// 5. FORMULAIRE DE SUPPORT
// ==========================================
window.envoyerMessage = function(event) {
    event.preventDefault();
    alert("Ton message a bien été envoyé au support (fefesimcer@gmail.com) ! Nous te répondrons sous 24h.");
    document.getElementById('sujet-support').value = "";
    document.getElementById('message-support').value = "";
    closeView();
}

// ==========================================
// 6. GESTION DU PANIER
// ==========================================
let panier = [];
const cartSidebar = document.getElementById('cart-sidebar');
const btnPanier = document.getElementById('btn-panier');
const closeCartBtn = document.getElementById('close-cart-btn');

btnPanier.addEventListener('click', () => { cartSidebar.classList.add('active'); });
closeCartBtn.addEventListener('click', () => { cartSidebar.classList.remove('active'); });

window.ajouterAuPanier = function(nom, prix) {
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

// ==========================================
// 7. PAIEMENT AVEC STRIPE
// ==========================================
const btnCheckout = document.getElementById('btn-checkout');

btnCheckout.addEventListener('click', async () => {
    if (panier.length === 0) {
        alert("Ton panier est vide !");
        return;
    }

    // Fait patienter l'utilisateur pendant que le serveur travaille
    btnCheckout.innerText = "CHARGEMENT...";
    btnCheckout.disabled = true;

    try {
        // Appelle notre fichier backend Netlify (celui dans le dossier /netlify/functions)
        const response = await fetch('/.netlify/functions/create-checkout', {
            method: 'POST',
            body: JSON.stringify({ panier: panier }),
        });

        const data = await response.json();

        // Redirection vers la page de paiement Stripe
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Erreur lors de la création du paiement.");
            console.error(data);
            btnCheckout.innerText = "VALIDER LA COMMANDE";
            btnCheckout.disabled = false;
        }
    } catch (error) {
        console.error("Erreur de connexion au serveur:", error);
        alert("Impossible de contacter le serveur de paiement.");
        btnCheckout.innerText = "VALIDER LA COMMANDE";
        btnCheckout.disabled = false;
    }
});
