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
// ⚠️ METS TON E-MAIL ICI POUR AVOIR L'ACCÈS PATRON
const ADMIN_EMAIL = "fefesimcer@gmail.com"; 

const styleNotif = document.createElement('style');
styleNotif.innerHTML = `
    .custom-notification {
        position: fixed; top: 30px; left: -500px; transform: translateX(-50%);
        background: #fff; color: #000; padding: 15px 30px; border-radius: 5px;
        font-family: 'Montserrat', sans-serif; font-weight: bold; font-size: 0.9rem;
        z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        text-transform: uppercase; text-align: center; border-left: 5px solid #000;
    }
    .custom-notification.show { left: 50%; }
    .custom-notification.hide { left: 150vw; }
`;
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
// 3. GESTION DES COMPTES
// ==========================================
let isLoginMode = true;
const authSidebar = document.getElementById('auth-sidebar');
const btnCompte = document.getElementById('btn-compte');
const closeAuth = document.getElementById('close-auth');
const sectionLogin = document.getElementById('section-login');
const sectionDashboard = document.getElementById('section-dashboard');

btnCompte.addEventListener('click', () => { authSidebar.classList.add('active'); });
closeAuth.addEventListener('click', () => { authSidebar.classList.remove('active'); });

document.getElementById('toggle-auth-mode').addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "CONNEXION" : "INSCRIPTION";
    document.getElementById('btn-submit-auth').innerText = isLoginMode ? "SE CONNECTER" : "CRÉER MON COMPTE";
    document.getElementById('toggle-auth-mode').innerText = isLoginMode ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter";
});

document.getElementById('btn-submit-auth').addEventListener('click', () => {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    if (!email || !password) return afficherNotification("Veuillez remplir tous les champs.");

    if(isLoginMode) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { document.getElementById('email-input').value = ""; document.getElementById('password-input').value = ""; closeView(); afficherNotification("Connexion réussie !"); })
            .catch(err => afficherNotification("Erreur : Identifiants incorrects."));
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { document.getElementById('email-input').value = ""; document.getElementById('password-input').value = ""; afficherNotification("Compte créé avec succès !"); })
            .catch(err => afficherNotification("Erreur lors de la création du compte."));
    }
});

document.getElementById('btn-logout').addEventListener('click', () => { auth.signOut(); closeView(); afficherNotification("Tu es déconnecté."); });

auth.onAuthStateChanged((user) => {
    if (user) {
        btnCompte.innerText = "MON ESPACE";
        sectionLogin.style.display = "none";
        sectionDashboard.style.display = "block";
        document.getElementById('user-email').innerText = user.email;
        
        // AFFICHAGE DU BOUTON PATRON SI C'EST TOI
        if(user.email === ADMIN_EMAIL) {
            document.getElementById('btn-admin-menu').style.display = 'block';
        } else {
            document.getElementById('btn-admin-menu').style.display = 'none';
        }
    } else {
        btnCompte.innerText = "MON COMPTE";
        sectionLogin.style.display = "block";
        sectionDashboard.style.display = "none";
    }
});

// ==========================================
// 4. NAVIGATION
// ==========================================
function openView(viewId) {
    sectionDashboard.style.display = "none";
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'view-commandes') chargerCommandes();
    if (viewId === 'view-adresses') chargerAdresses();
    if (viewId === 'view-paiement') chargerCartes();
    if (viewId === 'view-retours') chargerRetours();
    if (viewId === 'view-support') chargerSupportClient();
}

function closeView() {
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    if (auth.currentUser) sectionDashboard.style.display = "block";
    else sectionLogin.style.display = "block";
}


// ==========================================
// 5. ESPACE CLIENT CLASSIQUE
// ==========================================
function chargerCommandes() {
    const vue = document.getElementById('view-commandes');
    vue.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3><p class="empty-state">Chargement...</p>`;
    if (!auth.currentUser) return;

    db.collection('commandes').where('email', '==', auth.currentUser.email).get().then((snapshot) => {
        if (snapshot.empty) return vue.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3><p class="empty-state">Tu n'as aucune commande.</p>`;
        
        let html = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3>`;
        snapshot.forEach((doc) => {
            const cmd = doc.data();
            const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
            html += `<div class="saved-item" style="flex-direction: column; align-items: flex-start;">
                <div style="width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;">
                    <strong>Commande du ${date}</strong><span style="color: #4CAF50;">${cmd.statut}</span>
                </div>
                <ul style="color: #ccc; font-size: 0.85rem; margin-bottom: 10px; width: 100%;">
                    ${cmd.articles.map(art => `<li>• 1x ${art.nom} - ${art.prix} €</li>`).join('')}
                </ul>
                <strong>Total : ${cmd.total} €</strong>
            </div>`;
        });
        vue.innerHTML = html;
    });
}

function chargerRetours() {
    const container = document.getElementById('view-retours');
    container.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3><p class="empty-state">Recherche...</p>`;
    if(!auth.currentUser) return;

    db.collection('commandes').where('email', '==', auth.currentUser.email).get().then(snapshot => {
        if(snapshot.empty) return container.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3><p class="empty-state">Tu n'as pas de commande éligible.</p>`;
        
        let html = `<button class="btn-back" onclick="closeView()">⬅ Retour au menu</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3>`;
        snapshot.forEach(doc => {
            const cmd = doc.data();
            const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
            html += `<div class="saved-item" style="justify-content: space-between;">
                        <div><strong>Commande du ${date}</strong><br><span style="font-size: 0.8rem; color: #ccc;">${cmd.total} €</span></div>
                        <button class="btn-style" style="padding: 5px 10px; font-size: 0.8rem;" onclick="demanderRetour('${doc.id}', '${auth.currentUser.email}')">Retourner</button>
                    </div>`;
        });
        container.innerHTML = html;
    });
}

window.demanderRetour = async function(idCommande, email) {
    await db.collection('retours').add({ email: email, idCommande: idCommande, date: Date.now(), statut: 'En attente' });
    afficherNotification("Demande de retour envoyée !");
}

// ADRESSES ET CARTES (Simplifiés)
document.getElementById('btn-show-address').addEventListener('click', () => { document.getElementById('form-address').style.display = 'block'; document.getElementById('btn-show-address').style.display = 'none'; });
window.sauvegarderAdresse = async function(e) { e.preventDefault(); await db.collection('adresses').add({ email: auth.currentUser.email, adresse: `${document.getElementById('addr-rue').value}, ${document.getElementById('addr-cp').value} ${document.getElementById('addr-ville').value}` }); document.getElementById('form-address').reset(); document.getElementById('form-address').style.display='none'; document.getElementById('btn-show-address').style.display='block'; chargerAdresses(); afficherNotification("Adresse sauvegardée"); }
function chargerAdresses() { db.collection('adresses').where('email','==',auth.currentUser.email).get().then(snap => { let h=''; snap.forEach(doc => h+=`<div class="saved-item">📍 <span>${doc.data().adresse}</span></div>`); document.getElementById('adresses-list').innerHTML = h||'<p class="empty-state">Aucune adresse.</p>'; }); }
document.getElementById('btn-show-card').addEventListener('click', () => { document.getElementById('form-card').style.display = 'block'; document.getElementById('btn-show-card').style.display = 'none'; });
window.sauvegarderCarte = async function(e) { e.preventDefault(); await db.collection('cartes').add({ email: auth.currentUser.email, chiffres: document.getElementById('card-numero').value.slice(-4) }); document.getElementById('form-card').reset(); document.getElementById('form-card').style.display='none'; document.getElementById('btn-show-card').style.display='block'; chargerCartes(); afficherNotification("Carte ajoutée"); }
function chargerCartes() { db.collection('cartes').where('email','==',auth.currentUser.email).get().then(snap => { let h=''; snap.forEach(doc => h+=`<div class="saved-item">💳 <span>Carte terminant par **** ${doc.data().chiffres}</span></div>`); document.getElementById('cartes-list').innerHTML = h||'<p class="empty-state">Aucune carte.</p>'; }); }


// ==========================================
// 6. SYSTÈME DE SUPPORT (CLIENT)
// ==========================================
let currentTicketId = null;

window.afficherFormulaireTicket = () => {
    document.getElementById('support-tickets-list').style.display = 'none';
    document.getElementById('btn-show-ticket-form').style.display = 'none';
    document.getElementById('form-support').style.display = 'block';
}

window.cacherFormulaireTicket = () => {
    document.getElementById('form-support').style.display = 'none';
    document.getElementById('support-tickets-list').style.display = 'block';
    document.getElementById('btn-show-ticket-form').style.display = 'block';
}

window.creerNouveauTicket = async (e) => {
    e.preventDefault();
    if(!auth.currentUser) return;
    const msg = document.getElementById('message-support').value;
    
    await db.collection('support').add({
        email: auth.currentUser.email,
        sujet: document.getElementById('sujet-support').value,
        statut: 'En attente',
        dateMAJ: Date.now(),
        messages: [{ sender: auth.currentUser.email, text: msg, date: Date.now() }]
    });
    
    document.getElementById('form-support').reset();
    cacherFormulaireTicket();
    afficherNotification("Ticket envoyé !");
    chargerSupportClient();
}

window.chargerSupportClient = () => {
    if(!auth.currentUser) return;
    document.getElementById('support-conversation').style.display = 'none';
    document.getElementById('support-tickets-list').style.display = 'block';
    document.getElementById('btn-show-ticket-form').style.display = 'block';
    
    db.collection('support').where('email', '==', auth.currentUser.email).get().then(snap => {
        const liste = document.getElementById('support-tickets-list');
        if(snap.empty) return liste.innerHTML = '<p class="empty-state">Tu n\'as aucune demande en cours.</p>';
        
        let html = '';
        snap.forEach(doc => {
            const ticket = doc.data();
            let color = ticket.statut === 'Répondu' ? '#4CAF50' : '#FF9800';
            html += `
                <div class="saved-item" style="justify-content: space-between; cursor: pointer;" onclick="ouvrirConversation('${doc.id}')">
                    <div>
                        <strong>${ticket.sujet}</strong><br>
                        <span style="font-size: 0.8rem; color: #ccc;">Dernier message le ${new Date(ticket.dateMAJ).toLocaleDateString()}</span>
                    </div>
                    <span style="color: ${color}; font-size: 0.8rem; font-weight: bold;">${ticket.statut}</span>
                </div>
            `;
        });
        liste.innerHTML = html;
    });
}

window.ouvrirConversation = async (ticketId) => {
    currentTicketId = ticketId;
    document.getElementById('support-tickets-list').style.display = 'none';
    document.getElementById('btn-show-ticket-form').style.display = 'none';
    const convDiv = document.getElementById('support-conversation');
    convDiv.style.display = 'block';
    
    const doc = await db.collection('support').doc(ticketId).get();
    const ticket = doc.data();
    document.getElementById('conv-sujet').innerText = ticket.sujet;
    
    let htmlMsg = '';
    ticket.messages.forEach(m => {
        let isFuture = m.sender === 'FUTURE';
        let align = isFuture ? 'flex-start' : 'flex-end';
        let bg = isFuture ? '#fff' : '#333';
        let txtColor = isFuture ? '#000' : '#fff';
        let senderName = isFuture ? '👑 FUTURE' : 'Moi';
        
        htmlMsg += `
            <div style="align-self: ${align}; background: ${bg}; color: ${txtColor}; padding: 10px; border-radius: 8px; max-width: 80%;">
                <div style="font-size: 0.7rem; font-weight: bold; margin-bottom: 5px; opacity: 0.7;">${senderName}</div>
                <div style="font-size: 0.9rem;">${m.text}</div>
            </div>
        `;
    });
    document.getElementById('conv-messages').innerHTML = htmlMsg;
}

window.fermerConversation = () => { chargerSupportClient(); }

window.repondreAuTicket = async () => {
    const text = document.getElementById('reply-support-client').value;
    if(!text || !currentTicketId) return;
    
    await db.collection('support').doc(currentTicketId).update({
        statut: 'En attente',
        dateMAJ: Date.now(),
        messages: firebase.firestore.FieldValue.arrayUnion({ sender: auth.currentUser.email, text: text, date: Date.now() })
    });
    
    document.getElementById('reply-support-client').value = '';
    ouvrirConversation(currentTicketId); // Recharge les messages
}


// ==========================================
// 7. ESPACE PATRON (ADMIN)
// ==========================================
window.chargerAdminCommandes = async () => {
    const div = document.getElementById('admin-content');
    div.innerHTML = '<p class="empty-state">Chargement de toutes les commandes...</p>';
    const snap = await db.collection('commandes').get();
    let html = '';
    snap.forEach(doc => {
        const c = doc.data();
        html += `<div class="saved-item" style="flex-direction: column; align-items: flex-start; border-color: #555;">
            <strong>Client: ${c.email}</strong>
            <span style="color: #ccc; font-size: 0.8rem;">${c.total} € | Statut: ${c.statut}</span>
        </div>`;
    });
    div.innerHTML = html || '<p class="empty-state">Aucune commande.</p>';
}

window.chargerAdminRetours = async () => {
    const div = document.getElementById('admin-content');
    div.innerHTML = '<p class="empty-state">Chargement des retours...</p>';
    const snap = await db.collection('retours').get();
    let html = '';
    snap.forEach(doc => {
        const r = doc.data();
        html += `<div class="saved-item" style="justify-content: space-between; border-color: #555;">
            <div><strong>${r.email}</strong><br><span style="font-size: 0.8rem; color:#ccc;">Commande ID: ${r.idCommande}</span></div>
            <span style="color: #FF9800;">${r.statut}</span>
        </div>`;
    });
    div.innerHTML = html || '<p class="empty-state">Aucun retour demandé.</p>';
}

window.chargerAdminSupport = async () => {
    const div = document.getElementById('admin-content');
    div.innerHTML = '<p class="empty-state">Chargement des tickets clients...</p>';
    const snap = await db.collection('support').orderBy('dateMAJ', 'desc').get();
    let html = '';
    snap.forEach(doc => {
        const t = doc.data();
        html += `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #555;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>De: ${t.email}</strong>
                <span style="color: ${t.statut==='En attente'?'#FF9800':'#4CAF50'};">${t.statut}</span>
            </div>
            <p style="font-size: 0.9rem; margin-bottom: 10px;">Sujet: ${t.sujet}</p>
            <div style="background: #000; padding: 10px; border-radius: 5px; max-height: 150px; overflow-y: auto; margin-bottom: 10px; font-size: 0.8rem; color: #ccc;">
                ${t.messages.map(m => `<b>${m.sender==='FUTURE'?'FUTURE':'Client'}</b>: ${m.text}`).join('<br><br>')}
            </div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="reply-admin-${doc.id}" placeholder="Répondre au client..." style="flex: 1; padding: 8px; background: #000; color: #fff; border: 1px solid #444; border-radius: 4px;">
                <button class="btn-style" onclick="envoyerReponseAdmin('${doc.id}')" style="font-size: 0.8rem; padding: 8px 15px;">RÉPONDRE</button>
            </div>
        </div>`;
    });
    div.innerHTML = html || '<p class="empty-state">Aucun message client.</p>';
}

window.envoyerReponseAdmin = async (ticketId) => {
    const text = document.getElementById(`reply-admin-${ticketId}`).value;
    if(!text) return;
    
    await db.collection('support').doc(ticketId).update({
        statut: 'Répondu',
        dateMAJ: Date.now(),
        messages: firebase.firestore.FieldValue.arrayUnion({ sender: 'FUTURE', text: text, date: Date.now() })
    });
    
    afficherNotification("Réponse envoyée au client !");
    chargerAdminSupport(); // Rafraîchit la liste
}


// ==========================================
// 8. PANIER ET PAIEMENT
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
            conteneur.innerHTML += `<div class="cart-item"><span>${article.nom}</span><span>${article.prix} €</span></div>`;
        });
    }
    affichageTotal.innerText = total;
}

const btnCheckout = document.getElementById('btn-checkout');
btnCheckout.addEventListener('click', async () => {
    if (panier.length === 0) return afficherNotification("Ton panier est vide !");
    if (!auth.currentUser) { cartSidebar.classList.remove('active'); authSidebar.classList.add('active'); return afficherNotification("Connecte-toi pour commander !"); }

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

        const response = await fetch('/.netlify/functions/create-checkout', { method: 'POST', body: JSON.stringify({ panier: panier }) });
        const data = await response.json();

        if (data.url) window.location.href = data.url;
        else { afficherNotification("Erreur de paiement."); btnCheckout.innerText = "VALIDER LA COMMANDE"; btnCheckout.disabled = false; }
    } catch (error) {
        afficherNotification("Erreur de connexion au serveur.");
        btnCheckout.innerText = "VALIDER LA COMMANDE"; btnCheckout.disabled = false;
    }
});
