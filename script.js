// ==========================================
// 0. INITIALISATION DE STRIPE
// ==========================================
// ⚠️ ATTENTION : REMPLACE PAR TA VRAIE CLÉ PUBLIQUE STRIPE
const stripe = Stripe('pk_test_51U6ggQH9XGzkkTIl6TOpdSkL2rzAZuhYQ6Vl48UyBrGciyVmL9j7n4QltBisAQCtbRD46FgRomg5HuFvtvR3oimy00YYh2n3h4');

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
const db = firebase.firestore();

// ==========================================
// 2. SYSTÈME DE NOTIFICATION CUSTOM (STYLE FIVEM)
// ==========================================
// On injecte le CSS de l'animation directement depuis le JS
const styleNotif = document.createElement('style');
styleNotif.innerHTML = `
    .custom-notification {
        position: fixed;
        top: 30px;
        left: -500px; /* Caché à gauche */
        transform: translateX(-50%);
        background: #fff;
        color: #000;
        padding: 15px 30px;
        border-radius: 5px;
        font-family: 'Montserrat', sans-serif;
        font-weight: bold;
        font-size: 0.9rem;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        text-transform: uppercase;
        text-align: center;
        border-left: 5px solid #000;
    }
    .custom-notification.show {
        left: 50%; /* Centre de l'écran */
    }
    .custom-notification.hide {
        left: 150vw; /* Repart loin à droite */
    }
`;
document.head.appendChild(styleNotif);

// La fonction magique pour afficher les messages
window.afficherNotification = function(message) {
    const notif = document.createElement('div');
    notif.className = 'custom-notification';
    notif.innerText = message;
    document.body.appendChild(notif);

    // 1. Glisse vers le centre
    setTimeout(() => notif.classList.add('show'), 50);
    
    // 2. Attend 3.5 secondes, puis glisse vers la droite
    setTimeout(() => {
        notif.classList.remove('show');
        notif.classList.add('hide');
    }, 3500);

    // 3. Supprime l'élément du code
    setTimeout(() => notif.remove(), 4200);
}


// ==========================================
// 3. GESTION DE L'AUTHENTIFICATION (COMPTES)
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

btnCompte.addEventListener('click', () => { authSidebar.classList.add('active'); });
closeAuth.addEventListener('click', () => { authSidebar.classList.remove('active'); });

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

btnSubmitAuth.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) return afficherNotification("Veuillez remplir tous les champs.");

    if(isLoginMode) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { 
                emailInput.value = ""; passwordInput.value = ""; 
                closeView(); 
                afficherNotification("Connexion réussie !");
            })
            .catch(err => afficherNotification("Erreur : Identifiants incorrects."));
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { 
                emailInput.value = ""; passwordInput.value = ""; 
                afficherNotification("Compte créé avec succès !");
            })
            .catch(err => afficherNotification("Erreur lors de la création du compte."));
    }
});

btnLogout.addEventListener('click', () => { 
    auth.signOut(); 
    closeView(); 
    afficherNotification("Tu es déconnecté.");
});

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
// 4. NAVIGATION ET CHARGEMENT DYNAMIQUE
// ==========================================
function openView(viewId) {
    sectionDashboard.style.display = "none";
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'view-commandes') chargerCommandes();
    if (viewId === 'view-adresses') chargerAdresses();
    if (viewId === 'view-paiement') chargerCartes();
    if (viewId === 'view-retours') chargerRetours();
}

function closeView() {
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    if (auth.currentUser) {
        sectionDashboard.style.display = "block";
    } else {
        sectionLogin.style.display = "block";
    }
}

// -- COMMANDES --
function chargerCommandes() {
    const vueCommandes = document.getElementById('view-commandes');
    vueCommandes.innerHTML = `
        <button class="btn-back" onclick="closeView()">⬅ Retour au menu</button>
        <h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3>
        <p class="empty-state" id="loading-txt">Chargement de tes commandes...</p>
        <div id="liste-commandes"></div>
    `;

    if (!auth.currentUser) return;

    db.collection('commandes').where('email', '==', auth.currentUser.email).get().then((snapshot) => {
        document.getElementById('loading-txt').style.display = 'none';
        const liste = document.getElementById('liste-commandes');

        if (snapshot.empty) {
            liste.innerHTML = '<p class="empty-state">Tu n\'as aucune commande pour le moment.</p>';
            return;
        }

        let html = '';
        snapshot.forEach((doc) => {
            const cmd = doc.data();
            const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
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
            </div>`;
        });
        liste.innerHTML = html;
    }).catch(err => console.error(err));
}

// -- ADRESSES --
document.getElementById('btn-show-address').addEventListener('click', () => {
    document.getElementById('form-address').style.display = 'block';
    document.getElementById('btn-show-address').style.display = 'none';
});

window.sauvegarderAdresse = async function(event) {
    event.preventDefault();
    if(!auth.currentUser) return;
    
    const rue = document.getElementById('addr-rue').value;
    const cp = document.getElementById('addr-cp').value;
    const ville = document.getElementById('addr-ville').value;
    const adresseComplete = `${rue}, ${cp} ${ville}`;
    
    await db.collection('adresses').add({ email: auth.currentUser.email, adresse: adresseComplete });
    
    document.getElementById('form-address').reset();
    document.getElementById('form-address').style.display = 'none';
    document.getElementById('btn-show-address').style.display = 'block';
    chargerAdresses();
    afficherNotification("Nouvelle adresse sauvegardée !");
}

function chargerAdresses() {
    if(!auth.currentUser) return;
    const container = document.getElementById('adresses-list');
    container.innerHTML = '<p class="empty-state">Chargement...</p>';
    
    db.collection('adresses').where('email', '==', auth.currentUser.email).get().then(snapshot => {
        if(snapshot.empty) {
            container.innerHTML = '<p class="empty-state">Aucune adresse enregistrée.</p>';
        } else {
            container.innerHTML = '';
            snapshot.forEach(doc => {
                container.innerHTML += `<div class="saved-item">📍 <span>${doc.data().adresse}</span></div>`;
            });
        }
    });
}

// -- CARTES --
document.getElementById('btn-show-card').addEventListener('click', () => {
    document.getElementById('form-card').style.display = 'block';
    document.getElementById('btn-show-card').style.display = 'none';
});

window.sauvegarderCarte = async function(event) {
    event.preventDefault();
    if(!auth.currentUser) return;

    const numero = document.getElementById('card-numero').value;
    const derniersChiffres = numero.slice(-4);
    
    await db.collection('cartes').add({ email: auth.currentUser.email, chiffres: derniersChiffres });
    
    document.getElementById('form-card').reset();
    document.getElementById('form-card').style.display = 'none';
    document.getElementById('btn-show-card').style.display = 'block';
    chargerCartes();
    afficherNotification("Moyen de paiement ajouté !");
}

function chargerCartes() {
    if(!auth.currentUser) return;
    const container = document.getElementById('cartes-list');
    container.innerHTML = '<p class="empty-state">Chargement...</p>';
    
    db.collection('cartes').where('email', '==', auth.currentUser.email).get().then(snapshot => {
        if(snapshot.empty) {
            container.innerHTML = '<p class="empty-state">Aucun moyen de paiement enregistré.</p>';
        } else {
            container.innerHTML = '';
            snapshot.forEach(doc => {
                container.innerHTML += `<div class="saved-item">💳 <span>Carte terminant par **** ${doc.data().chiffres}</span></div>`;
            });
        }
    });
}

// -- RETOURS (Maintenant connectés à Firebase) --
function chargerRetours() {
    const container = document.getElementById('view-retours');
    container.innerHTML = `
        <button class="btn-back" onclick="closeView()">⬅ Retour au menu</button>
        <h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3>
        <p class="empty-state" id="loading-retours">Recherche des commandes éligibles...</p>
        <div id="liste-retours"></div>
    `;

    if(!auth.currentUser) return;

    db.collection('commandes').where('email', '==', auth.currentUser.email).get().then(snapshot => {
        document.getElementById('loading-retours').style.display = 'none';
        const liste = document.getElementById('liste-retours');
        
        if(snapshot.empty) {
            liste.innerHTML = '<p class="empty-state">Tu ne peux demander un retour que si tu possèdes une commande.</p>';
        } else {
            let html = '';
            snapshot.forEach(doc => {
                const cmd = doc.data();
                const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
                html += `
                    <div class="saved-item" style="justify-content: space-between;">
                        <div>
                            <strong>Commande du ${date}</strong><br>
                            <span style="font-size: 0.8rem; color: #ccc;">${cmd.total} €</span>
                        </div>
                        <button class="btn-style" style="padding: 5px 10px; font-size: 0.8rem;" onclick="demanderRetour('${doc.id}')">Retourner</button>
                    </div>
                `;
            });
            liste.innerHTML = html;
        }
    });
}

window.demanderRetour = async function(idCommande) {
    if(!auth.currentUser) return;
    try {
        await db.collection('retours').add({
            email: auth.currentUser.email,
            idCommande: idCommande,
            dateDemande: firebase.firestore.FieldValue.serverTimestamp(),
            statut: 'En attente'
        });
        afficherNotification("Demande de retour envoyée avec succès !");
    } catch(e) {
        afficherNotification("Erreur lors de la demande.");
    }
}

// ==========================================
// 5. FORMULAIRE DE SUPPORT (Connecté à Firebase)
// ==========================================
window.envoyerMessage = async function(event) {
    event.preventDefault();
    if(!auth.currentUser) return;
    
    const sujet = document.getElementById('sujet-support').value;
    const message = document.getElementById('message-support').value;

    try {
        await db.collection('support').add({
            email: auth.currentUser.email,
            sujet: sujet,
            message: message,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            statut: 'Non lu'
        });
        
        document.getElementById('sujet-support').value = "";
        document.getElementById('message-support').value = "";
        closeView();
        afficherNotification("Ton message a été envoyé au support !");
    } catch(e) {
        afficherNotification("Erreur lors de l'envoi du message.");
    }
}

// ==========================================
// 6. GESTION DU PANIER & PAIEMENT
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

const btnCheckout = document.getElementById('btn-checkout');

btnCheckout.addEventListener('click', async () => {
    if (panier.length === 0) {
        return afficherNotification("Ton panier est vide !");
    }

    if (!auth.currentUser) {
        cartSidebar.classList.remove('active');
        authSidebar.classList.add('active');
        return afficherNotification("Connecte-toi pour commander !");
    }

    btnCheckout.innerText = "CHARGEMENT...";
    btnCheckout.disabled = true;

    try {
        const totalCommande = panier.reduce((somme, article) => somme + article.prix, 0);
        
        await db.collection('commandes').add({
            email: auth.currentUser.email,
            articles: panier,
            total: totalCommande,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            statut: 'En cours de préparation'
        });

        const response = await fetch('/.netlify/functions/create-checkout', {
            method: 'POST',
            body: JSON.stringify({ panier: panier }),
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            afficherNotification("Erreur de paiement.");
            btnCheckout.innerText = "VALIDER LA COMMANDE";
            btnCheckout.disabled = false;
        }
    } catch (error) {
        console.error("Erreur globale:", error);
        afficherNotification("Erreur de connexion au serveur.");
        btnCheckout.innerText = "VALIDER LA COMMANDE";
        btnCheckout.disabled = false;
    }
});
