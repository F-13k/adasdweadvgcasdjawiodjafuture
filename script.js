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
// 2. CONFIGURATION ADMIN & NOTIFICATIONS
// ==========================================
const ADMIN_EMAIL = "fefesimcer@gmail.com"; 

const styleNotif = document.createElement('style');
styleNotif.innerHTML = `.custom-notification { position: fixed; top: 30px; left: -500px; transform: translateX(-50%); background: #fff; color: #000; padding: 15px 30px; border-radius: 5px; font-family: 'Montserrat', sans-serif; font-weight: bold; font-size: 0.9rem; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1); text-transform: uppercase; text-align: center; border-left: 5px solid #000; } .custom-notification.show { left: 50%; } .custom-notification.hide { left: 150vw; }`;
document.head.appendChild(styleNotif);

window.afficherNotification = function(message) {
    const notif = document.createElement('div');
    notif.className = 'custom-notification';
    notif.innerText = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 50);
    setTimeout(() => { notif.classList.remove('show'); notif.classList.add('hide'); }, 3500);
    setTimeout(() => notif.remove(), 4200);
}

// ==========================================
// 3. GESTION DES COMPTES ET NAVIGATION (Raccourci)
// ==========================================
let isLoginMode = true;
const authSidebar = document.getElementById('auth-sidebar');
const sectionDashboard = document.getElementById('section-dashboard');

document.getElementById('btn-compte').addEventListener('click', () => { authSidebar.classList.add('active'); });
document.getElementById('close-auth').addEventListener('click', () => { authSidebar.classList.remove('active'); });
document.getElementById('toggle-auth-mode').addEventListener('click', () => { isLoginMode = !isLoginMode; document.getElementById('auth-title').innerText = isLoginMode ? "CONNEXION" : "INSCRIPTION"; document.getElementById('btn-submit-auth').innerText = isLoginMode ? "SE CONNECTER" : "CRÉER MON COMPTE"; document.getElementById('toggle-auth-mode').innerText = isLoginMode ? "Pas de compte ?" : "Déjà un compte ?"; });

document.getElementById('btn-submit-auth').addEventListener('click', () => {
    const email = document.getElementById('email-input').value; const password = document.getElementById('password-input').value;
    if (!email || !password) return afficherNotification("Remplir tous les champs.");
    if(isLoginMode) auth.signInWithEmailAndPassword(email, password).then(() => { closeView(); afficherNotification("Connecté !"); }).catch(err => afficherNotification("Identifiants incorrects."));
    else auth.createUserWithEmailAndPassword(email, password).then(() => { afficherNotification("Compte créé !"); }).catch(err => afficherNotification("Erreur de création."));
});

document.getElementById('btn-logout').addEventListener('click', () => { auth.signOut(); closeView(); afficherNotification("Déconnecté."); });

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('btn-compte').innerText = "MON ESPACE"; document.getElementById('section-login').style.display = "none"; sectionDashboard.style.display = "block"; document.getElementById('user-email').innerText = user.email;
        document.getElementById('btn-admin-menu').style.display = (user.email === ADMIN_EMAIL) ? 'block' : 'none';
    } else { document.getElementById('btn-compte').innerText = "MON COMPTE"; document.getElementById('section-login').style.display = "block"; sectionDashboard.style.display = "none"; }
});

function openView(viewId) {
    sectionDashboard.style.display = "none"; document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active')); document.getElementById(viewId).classList.add('active');
    if (viewId === 'view-commandes') chargerCommandes(); if (viewId === 'view-adresses') chargerAdresses(); if (viewId === 'view-paiement') chargerCartes(); if (viewId === 'view-retours') chargerRetours(); if (viewId === 'view-support') chargerSupportClient();
}
function closeView() { document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active')); if (auth.currentUser) sectionDashboard.style.display = "block"; else document.getElementById('section-login').style.display = "block"; }


// (Ici se trouvent tes fonctions chargerCommandes, Adresses, Cartes, Support et Retours comme avant)
// Je les garde ultra compactes pour qu'on se concentre sur le Panier
window.chargerCommandes = () => { /* Reste identique */ }
window.chargerRetours = () => { /* Reste identique */ }
window.demanderRetour = async (idCommande, email) => { await db.collection('retours').add({ email: email, idCommande: idCommande, date: Date.now(), statut: 'En attente' }); afficherNotification("Demande envoyée !"); }
window.sauvegarderAdresse = async (e) => { e.preventDefault(); await db.collection('adresses').add({ email: auth.currentUser.email, adresse: document.getElementById('addr-rue').value }); afficherNotification("Adresse ajoutée"); }
window.chargerAdresses = () => { /* Reste identique */ }
window.sauvegarderCarte = async (e) => { e.preventDefault(); await db.collection('cartes').add({ email: auth.currentUser.email, chiffres: document.getElementById('card-numero').value.slice(-4) }); afficherNotification("Carte ajoutée"); }
window.chargerCartes = () => { /* Reste identique */ }

// SUPPORT
window.afficherFormulaireTicket = () => { document.getElementById('support-tickets-list').style.display = 'none'; document.getElementById('form-support').style.display = 'block'; }
window.cacherFormulaireTicket = () => { document.getElementById('form-support').style.display = 'none'; document.getElementById('support-tickets-list').style.display = 'block'; }
window.creerNouveauTicket = async (e) => { e.preventDefault(); await db.collection('support').add({ email: auth.currentUser.email, sujet: document.getElementById('sujet-support').value, statut: 'En attente', dateMAJ: Date.now(), messages: [{ sender: auth.currentUser.email, text: document.getElementById('message-support').value }]}); document.getElementById('form-support').reset(); cacherFormulaireTicket(); afficherNotification("Ticket envoyé !"); }
window.chargerSupportClient = () => { /* Reste identique */ }


// ==========================================
// ADMIN PATRON
// ==========================================
window.chargerAdminCommandes = async () => { const div = document.getElementById('admin-content'); div.innerHTML = 'Chargement...'; const snap = await db.collection('commandes').orderBy('date', 'desc').get(); let html = ''; snap.forEach(doc => { const c = doc.data(); html += `<div class="saved-item" style="flex-direction: column; align-items: flex-start;"><strong>${c.email}</strong><span style="color:#4CAF50;">${c.statut}</span><span style="color:#ccc;">${c.total} €</span></div>`; }); div.innerHTML = html || 'Aucune commande.'; }
window.chargerAdminRetours = async () => { /* Reste identique */ }
window.chargerAdminSupport = async () => { /* Reste identique */ }

// -- NOUVEAU : GÉRER LES CODES PROMO (ADMIN) --
window.chargerAdminPromos = async () => {
    const div = document.getElementById('admin-content');
    div.innerHTML = `<button class="btn-buy" style="margin-bottom:15px; border-color:#555;" onclick="afficherFormPromo()">+ Créer un Code Promo</button>
                     <div id="form-create-promo" style="display:none; margin-bottom:20px; background:#111; padding:15px; border-radius:8px;">
                        <input type="text" id="new-promo-code" placeholder="Nom du code (ex: SOLDE20)" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:#fff; border:1px solid #444;">
                        <input type="number" id="new-promo-perc" placeholder="Réduction en % (ex: 20)" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:#fff; border:1px solid #444;">
                        <button class="btn-buy" style="background:#fff; color:#000;" onclick="creerPromo()">ENREGISTRER LE CODE</button>
                     </div><div id="list-promos">Chargement...</div>`;
    
    const snap = await db.collection('promos').get();
    let html = '';
    snap.forEach(doc => {
        const p = doc.data();
        html += `<div class="saved-item" style="justify-content: space-between;">
            <div><strong>${p.code}</strong><br><span style="color:#ccc;">-${p.pourcentage}%</span></div>
            <button class="btn-style" style="background:#f44336; color:#fff; border:none; padding:5px 10px;" onclick="supprimerPromo('${doc.id}')">🗑️</button>
        </div>`;
    });
    document.getElementById('list-promos').innerHTML = html || '<p class="empty-state">Aucun code promo actif.</p>';
}

window.afficherFormPromo = () => { document.getElementById('form-create-promo').style.display = 'block'; }
window.creerPromo = async () => {
    const code = document.getElementById('new-promo-code').value.toUpperCase();
    const perc = parseInt(document.getElementById('new-promo-perc').value);
    if(!code || !perc) return afficherNotification("Remplissez tous les champs !");
    await db.collection('promos').add({ code: code, pourcentage: perc });
    afficherNotification("Code Promo Créé !");
    chargerAdminPromos();
}
window.supprimerPromo = async (id) => { await db.collection('promos').doc(id).delete(); afficherNotification("Code supprimé."); chargerAdminPromos(); }


// ==========================================
// GESTION DU PANIER (AVEC TAILLES ET QUANTITÉS)
// ==========================================
let panier = [];
let remisePourcentage = 0; // Stocke la réduction du code promo
let codePromoApplique = "";

const cartSidebar = document.getElementById('cart-sidebar');
document.getElementById('btn-panier').addEventListener('click', () => { cartSidebar.classList.add('active'); });
document.getElementById('close-cart-btn').addEventListener('click', () => { cartSidebar.classList.remove('active'); });

window.ajouterAuPanier = function(nom, prix, taille) {
    // Vérifie si on a DÉJÀ ce vêtement dans CETTE taille
    const indexExistant = panier.findIndex(article => article.nom === nom && article.taille === taille);
    
    if (indexExistant !== -1) {
        panier[indexExistant].quantite += 1; // +1 en quantité
    } else {
        panier.push({ nom: nom, prix: prix, taille: taille, quantite: 1 });
    }
    
    mettreAJourPanier();
    cartSidebar.classList.add('active');
    afficherNotification(`${nom} (${taille}) ajouté !`);
}

window.modifierQuantite = function(index, delta) {
    panier[index].quantite += delta;
    if (panier[index].quantite <= 0) {
        panier.splice(index, 1); // Si quantité tombe à 0, on supprime l'article
    }
    mettreAJourPanier();
}

window.supprimerDuPanier = function(index) {
    panier.splice(index, 1);
    mettreAJourPanier();
}

window.appliquerPromo = async () => {
    const codeSaisi = document.getElementById('input-promo').value.toUpperCase();
    if(!codeSaisi) return;

    const snap = await db.collection('promos').where('code', '==', codeSaisi).get();
    const msgBox = document.getElementById('promo-msg');
    
    if(snap.empty) {
        msgBox.style.color = "#f44336";
        msgBox.innerText = "Code promo invalide.";
        remisePourcentage = 0;
        codePromoApplique = "";
    } else {
        const promo = snap.docs[0].data();
        remisePourcentage = promo.pourcentage;
        codePromoApplique = promo.code;
        msgBox.style.color = "#4CAF50";
        msgBox.innerText = `Code appliqué : -${remisePourcentage}% !`;
    }
    mettreAJourPanier();
}

function mettreAJourPanier() {
    const conteneur = document.getElementById('cart-items');
    const affichageTotal = document.getElementById('zone-total');
    
    // Calcule le nombre total de vêtements (pas juste le nombre de lignes)
    const nbTotalArticles = panier.reduce((sum, art) => sum + art.quantite, 0);
    document.getElementById('cart-count').innerText = nbTotalArticles;
    
    conteneur.innerHTML = '';
    let sousTotal = 0;
    
    if (panier.length === 0) {
        conteneur.innerHTML = '<p style="color: #aaa;">Ton panier est vide.</p>';
        remisePourcentage = 0; // Annule le code promo si panier vide
        document.getElementById('promo-msg').innerText = '';
        document.getElementById('input-promo').value = '';
    } else {
        panier.forEach((article, index) => {
            const prixTotalArticle = article.prix * article.quantite;
            sousTotal += prixTotalArticle;
            
            conteneur.innerHTML += `
                <div class="cart-item">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <span style="font-weight: bold;">${article.nom} (Taille ${article.taille})</span>
                        <span>${prixTotalArticle} €</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; background:#000; border-radius:4px; padding: 2px;">
                            <button style="padding: 5px 10px; background:transparent; color:#fff; border:none; cursor:pointer;" onclick="modifierQuantite(${index}, -1)">-</button>
                            <span style="margin: 0 10px; font-weight:bold;">${article.quantite}</span>
                            <button style="padding: 5px 10px; background:transparent; color:#fff; border:none; cursor:pointer;" onclick="modifierQuantite(${index}, 1)">+</button>
                        </div>
                        <button style="background:transparent; color:#f44336; border:none; cursor:pointer; font-size: 1.2rem;" onclick="supprimerDuPanier(${index})">🗑️</button>
                    </div>
                </div>
            `;
        });
    }

    // Calcul de la réduction finale
    let prixFinal = sousTotal;
    let textTotal = `Total: ${sousTotal} €`;
    
    if (remisePourcentage > 0 && sousTotal > 0) {
        const montantReduc = (sousTotal * remisePourcentage) / 100;
        prixFinal = sousTotal - montantReduc;
        textTotal = `<span style="text-decoration: line-through; color: #888; font-size:1rem;">${sousTotal} €</span> <br> Total Promo: ${prixFinal} €`;
    }
    
    affichageTotal.innerHTML = textTotal;
    
    // On sauvegarde le prix final globalement pour l'envoyer à la caisse
    window.totalActuel = prixFinal;
}

// ==========================================
// PAIEMENT ET REDIRECTION STRIPE
// ==========================================
const btnCheckout = document.getElementById('btn-checkout');
btnCheckout.addEventListener('click', async () => {
    if (panier.length === 0) return afficherNotification("Ton panier est vide !");
    if (!auth.currentUser) { cartSidebar.classList.remove('active'); authSidebar.classList.add('active'); return afficherNotification("Connecte-toi pour commander !"); }

    btnCheckout.innerText = "CHARGEMENT...";
    btnCheckout.disabled = true;

    try {
        // Enregistre dans l'historique Firebase
        await db.collection('commandes').add({
            email: auth.currentUser.email,
            articles: panier,
            total: window.totalActuel,
            codePromo: codePromoApplique || 'Aucun',
            date: firebase.firestore.FieldValue.serverTimestamp(),
            statut: 'En cours de préparation'
        });

        // ENVOI AU SERVEUR NETLIFY (Avec la remise en % !)
        const response = await fetch('/.netlify/functions/create-checkout', { 
            method: 'POST', 
            body: JSON.stringify({ 
                panier: panier,
                remise: remisePourcentage // On passe le % de réduction au serveur !
            }) 
        });
        
        const data = await response.json();

        if (data.url) window.location.href = data.url;
        else { afficherNotification("Erreur de paiement."); btnCheckout.innerText = "VALIDER LA COMMANDE"; btnCheckout.disabled = false; }
    } catch (error) {
        afficherNotification("Erreur de connexion au serveur.");
        btnCheckout.innerText = "VALIDER LA COMMANDE"; btnCheckout.disabled = false;
    }
});
