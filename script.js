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

// ⚠️ METS TON E-MAIL ICI POUR AVOIR L'ACCÈS PATRON
const ADMIN_EMAIL = "fefesimcer@gmail.com"; 

const styleNotif = document.createElement('style');
styleNotif.innerHTML = `.custom-notification { position: fixed; top: 30px; left: -500px; transform: translateX(-50%); background: #fff; color: #000; padding: 15px 30px; border-radius: 5px; font-family: 'Montserrat', sans-serif; font-weight: bold; font-size: 0.9rem; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1); text-transform: uppercase; text-align: center; border-left: 5px solid #000; } .custom-notification.show { left: 50%; } .custom-notification.hide { left: 150vw; }`;
document.head.appendChild(styleNotif);

window.afficherNotification = function(message) {
    const notif = document.createElement('div'); notif.className = 'custom-notification'; notif.innerText = message; document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 50); setTimeout(() => { notif.classList.remove('show'); notif.classList.add('hide'); }, 3500); setTimeout(() => notif.remove(), 4200);
}

// ==========================================
// 2. GESTION DES COMPTES
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
    if(isLoginMode) auth.signInWithEmailAndPassword(email, password).then(() => { closeView(); afficherNotification("Connecté !"); }).catch(() => afficherNotification("Identifiants incorrects."));
    else auth.createUserWithEmailAndPassword(email, password).then(() => { afficherNotification("Compte créé !"); }).catch(() => afficherNotification("Erreur de création."));
});
document.getElementById('btn-logout').addEventListener('click', () => { auth.signOut(); closeView(); afficherNotification("Déconnecté."); });

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('btn-compte').innerText = "MON ESPACE"; document.getElementById('section-login').style.display = "none"; sectionDashboard.style.display = "block"; document.getElementById('user-email').innerText = user.email;
        document.getElementById('btn-admin-menu').style.display = (user.email === ADMIN_EMAIL) ? 'block' : 'none';
    } else { document.getElementById('btn-compte').innerText = "MON COMPTE"; document.getElementById('section-login').style.display = "block"; sectionDashboard.style.display = "none"; }
});

window.openView = function(viewId) {
    sectionDashboard.style.display = "none"; document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active')); document.getElementById(viewId).classList.add('active');
    if (viewId === 'view-commandes') chargerCommandes(); if (viewId === 'view-adresses') chargerAdresses(); if (viewId === 'view-paiement') chargerCartes(); if (viewId === 'view-retours') chargerRetours(); if (viewId === 'view-support') chargerSupportClient();
}
window.closeView = function() { document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active')); if (auth.currentUser) sectionDashboard.style.display = "block"; else document.getElementById('section-login').style.display = "block"; }

// ==========================================
// 3. FONCTIONS CLIENTS
// ==========================================
window.chargerCommandes = () => {
    const vue = document.getElementById('view-commandes'); vue.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3><p class="empty-state">Chargement...</p>`;
    if (!auth.currentUser) return;
    db.collection('commandes').where('email', '==', auth.currentUser.email).orderBy('date', 'desc').get().then((snapshot) => {
        if (snapshot.empty) return vue.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3><p class="empty-state">Aucune commande.</p>`;
        let html = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Mes Commandes</h3>`;
        snapshot.forEach((doc) => {
            const cmd = doc.data(); const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
            html += `<div class="saved-item" style="flex-direction: column; align-items: flex-start;"><div style="width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;"><strong>Commande du ${date}</strong><span style="color: #4CAF50;">${cmd.statut}</span></div><ul style="color: #ccc; font-size: 0.85rem; margin-bottom: 10px; width: 100%;">${cmd.articles.map(art => `<li>• ${art.quantite}x ${art.nom} (Taille ${art.taille}) - ${art.prix * art.quantite} €</li>`).join('')}</ul><strong>Total : ${cmd.total} € ${cmd.codePromo !== 'Aucun' ? `(Promo: ${cmd.codePromo})` : ''}</strong></div>`;
        });
        vue.innerHTML = html;
    });
}

window.chargerRetours = () => {
    const container = document.getElementById('view-retours'); container.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3><p class="empty-state">Recherche...</p>`;
    if(!auth.currentUser) return;
    db.collection('commandes').where('email', '==', auth.currentUser.email).get().then(snapshot => {
        if(snapshot.empty) return container.innerHTML = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3><p class="empty-state">Tu n'as pas de commande éligible.</p>`;
        let html = `<button class="btn-back" onclick="closeView()">⬅ Retour</button><h3 class="montserrat" style="margin-bottom:15px;">Faire un retour</h3>`;
        snapshot.forEach(doc => {
            const cmd = doc.data(); const date = cmd.date ? cmd.date.toDate().toLocaleDateString('fr-FR') : 'Récente';
            html += `<div class="saved-item" style="justify-content: space-between;"><div><strong>Commande du ${date}</strong><br><span style="font-size: 0.8rem; color: #ccc;">${cmd.total} €</span></div><button class="btn-style" style="padding: 5px 10px; font-size: 0.8rem;" onclick="demanderRetour('${doc.id}', '${auth.currentUser.email}')">Retourner</button></div>`;
        });
        container.innerHTML = html;
    });
}
window.demanderRetour = async (idCommande, email) => { await db.collection('retours').add({ email: email, idCommande: idCommande, date: firebase.firestore.FieldValue.serverTimestamp(), statut: 'En attente' }); afficherNotification("Demande envoyée !"); }

document.getElementById('btn-show-address').addEventListener('click', () => { document.getElementById('form-address').style.display = 'block'; document.getElementById('btn-show-address').style.display = 'none'; });
window.sauvegarderAdresse = async (e) => { e.preventDefault(); const adresse = `${document.getElementById('addr-rue').value}, ${document.getElementById('addr-cp').value} ${document.getElementById('addr-ville').value}`; await db.collection('adresses').add({ email: auth.currentUser.email, adresse: adresse }); document.getElementById('form-address').reset(); document.getElementById('form-address').style.display='none'; document.getElementById('btn-show-address').style.display='block'; chargerAdresses(); afficherNotification("Adresse ajoutée"); }
window.chargerAdresses = () => { db.collection('adresses').where('email','==',auth.currentUser.email).get().then(snap => { let h=''; snap.forEach(doc => h+=`<div class="saved-item">📍 <span>${doc.data().adresse}</span></div>`); document.getElementById('adresses-list').innerHTML = h||'<p class="empty-state">Aucune adresse.</p>'; }); }

document.getElementById('btn-show-card').addEventListener('click', () => { document.getElementById('form-card').style.display = 'block'; document.getElementById('btn-show-card').style.display = 'none'; });
window.sauvegarderCarte = async (e) => { e.preventDefault(); await db.collection('cartes').add({ email: auth.currentUser.email, chiffres: document.getElementById('card-numero').value.slice(-4) }); document.getElementById('form-card').reset(); document.getElementById('form-card').style.display='none'; document.getElementById('btn-show-card').style.display='block'; chargerCartes(); afficherNotification("Carte ajoutée"); }
window.chargerCartes = () => { db.collection('cartes').where('email','==',auth.currentUser.email).get().then(snap => { let h=''; snap.forEach(doc => h+=`<div class="saved-item">💳 <span>Carte terminant par **** ${doc.data().chiffres}</span></div>`); document.getElementById('cartes-list').innerHTML = h||'<p class="empty-state">Aucune carte.</p>'; }); }

// SUPPORT
let currentTicketId = null;
window.afficherFormulaireTicket = () => { document.getElementById('support-tickets-list').style.display = 'none'; document.getElementById('btn-show-ticket-form').style.display = 'none'; document.getElementById('form-support').style.display = 'block'; }
window.cacherFormulaireTicket = () => { document.getElementById('form-support').style.display = 'none'; document.getElementById('support-tickets-list').style.display = 'block'; document.getElementById('btn-show-ticket-form').style.display = 'block'; }
window.creerNouveauTicket = async (e) => { e.preventDefault(); const msg = document.getElementById('message-support').value; await db.collection('support').add({ email: auth.currentUser.email, sujet: document.getElementById('sujet-support').value, statut: 'En attente', dateMAJ: Date.now(), messages: [{ sender: auth.currentUser.email, text: msg, date: Date.now() }]}); document.getElementById('form-support').reset(); cacherFormulaireTicket(); afficherNotification("Ticket envoyé !"); chargerSupportClient(); }
window.chargerSupportClient = () => {
    if(!auth.currentUser) return; document.getElementById('support-conversation').style.display = 'none'; document.getElementById('support-tickets-list').style.display = 'block'; document.getElementById('btn-show-ticket-form').style.display = 'block';
    db.collection('support').where('email', '==', auth.currentUser.email).orderBy('dateMAJ', 'desc').get().then(snap => {
        const liste = document.getElementById('support-tickets-list'); if(snap.empty) return liste.innerHTML = '<p class="empty-state">Tu n\'as aucune demande en cours.</p>';
        let html = '';
        snap.forEach(doc => { const t = doc.data(); let color = t.statut === 'Répondu' ? '#4CAF50' : (t.statut === 'Clôturé' ? '#f44336' : '#FF9800'); html += `<div class="saved-item" style="justify-content: space-between; cursor: pointer;" onclick="ouvrirConversation('${doc.id}')"><div><strong>${t.sujet}</strong><br><span style="font-size: 0.8rem; color: #ccc;">Dernière modif le ${new Date(t.dateMAJ).toLocaleDateString()}</span></div><span style="color: ${color}; font-size: 0.8rem; font-weight: bold;">${t.statut}</span></div>`; });
        liste.innerHTML = html;
    });
}
window.ouvrirConversation = async (ticketId) => {
    currentTicketId = ticketId; document.getElementById('support-tickets-list').style.display = 'none'; document.getElementById('btn-show-ticket-form').style.display = 'none'; document.getElementById('support-conversation').style.display = 'block';
    const doc = await db.collection('support').doc(ticketId).get(); const ticket = doc.data(); document.getElementById('conv-sujet').innerText = ticket.sujet;
    let htmlMsg = ''; ticket.messages.forEach(m => { let isFuture = m.sender === 'FUTURE'; let align = isFuture ? 'flex-start' : 'flex-end'; let bg = isFuture ? '#fff' : '#333'; let txtColor = isFuture ? '#000' : '#fff'; let senderName = isFuture ? '👑 FUTURE' : 'Moi'; htmlMsg += `<div style="align-self: ${align}; background: ${bg}; color: ${txtColor}; padding: 10px; border-radius: 8px; max-width: 80%;"><div style="font-size: 0.7rem; font-weight: bold; margin-bottom: 5px; opacity: 0.7;">${senderName}</div><div style="font-size: 0.9rem;">${m.text}</div></div>`; });
    if (ticket.statut === 'Clôturé') { htmlMsg += `<div style="align-self: center; color: #f44336; font-size: 0.8rem; margin-top: 10px; font-weight: bold;">🔒 Ce ticket est clôturé.</div>`; document.getElementById('conv-reply-box').style.display = 'none'; } 
    else { document.getElementById('conv-reply-box').style.display = 'flex'; if (!document.getElementById('btn-close-ticket-client')) { const btnClose = document.createElement('button'); btnClose.id = 'btn-close-ticket-client'; btnClose.className = 'btn-style'; btnClose.style.cssText = 'background: #f44336; color: #fff; padding: 10px; border: none; margin-top: 5px; cursor: pointer; border-radius: 5px;'; btnClose.innerText = '🔒 CLÔTURER CE TICKET'; btnClose.onclick = () => fermerTicket(ticketId, 'client'); document.getElementById('conv-reply-box').appendChild(btnClose); } }
    document.getElementById('conv-messages').innerHTML = htmlMsg;
}
window.fermerConversation = () => { chargerSupportClient(); }
window.repondreAuTicket = async () => { const text = document.getElementById('reply-support-client').value; if(!text || !currentTicketId) return; await db.collection('support').doc(currentTicketId).update({ statut: 'En attente', dateMAJ: Date.now(), messages: firebase.firestore.FieldValue.arrayUnion({ sender: auth.currentUser.email, text: text, date: Date.now() }) }); document.getElementById('reply-support-client').value = ''; ouvrirConversation(currentTicketId); }
window.fermerTicket = async (ticketId, role) => { if(!confirm("Es-tu sûr de vouloir clôturer ce ticket ?")) return; await db.collection('support').doc(ticketId).update({ statut: 'Clôturé', dateMAJ: Date.now() }); afficherNotification("Ticket clôturé !"); if (role === 'client') ouvrirConversation(ticketId); else chargerAdminSupport(); }


// ==========================================
// 4. ESPACE PATRON (ADMIN + STOCKS)
// ==========================================
window.chargerAdminCommandes = async () => { const div = document.getElementById('admin-content'); div.innerHTML = '<p class="empty-state">Chargement...</p>'; const snap = await db.collection('commandes').orderBy('date', 'desc').get(); let html = ''; snap.forEach(doc => { const c = doc.data(); const date = c.date ? c.date.toDate().toLocaleDateString('fr-FR') : 'Inconnue'; html += `<div class="saved-item" style="flex-direction: column; align-items: flex-start; border-color: #555;"><div style="width:100%; display:flex; justify-content:space-between; margin-bottom:5px;"><strong>${c.email}</strong><span style="color:#4CAF50;">${c.statut}</span></div><span style="color: #ccc; font-size: 0.8rem;">${c.total} € | Le ${date} | Promo: ${c.codePromo || 'Aucun'}</span></div>`; }); div.innerHTML = html || '<p class="empty-state">Aucune commande.</p>'; }
window.chargerAdminRetours = async () => { const div = document.getElementById('admin-content'); div.innerHTML = '<p class="empty-state">Chargement...</p>'; const snap = await db.collection('retours').orderBy('date', 'desc').get(); let html = ''; snap.forEach(doc => { const r = doc.data(); html += `<div class="saved-item" style="justify-content: space-between; border-color: #555;"><div><strong>${r.email}</strong><br><span style="font-size: 0.8rem; color:#ccc;">Commande ID: ${r.idCommande}</span></div><span style="color: #FF9800;">${r.statut}</span></div>`; }); div.innerHTML = html || '<p class="empty-state">Aucun retour.</p>'; }
window.chargerAdminSupport = async () => { const div = document.getElementById('admin-content'); div.innerHTML = '<p class="empty-state">Chargement...</p>'; const snap = await db.collection('support').orderBy('dateMAJ', 'desc').get(); let html = ''; snap.forEach(doc => { const t = doc.data(); let color = t.statut === 'Répondu' ? '#4CAF50' : (t.statut === 'Clôturé' ? '#f44336' : '#FF9800'); let actionsHtml = t.statut !== 'Clôturé' ? `<div style="display: flex; gap: 10px; margin-top: 10px;"><input type="text" id="reply-admin-${doc.id}" placeholder="Répondre..." style="flex: 1; padding: 8px; background: #000; color: #fff; border: 1px solid #444; border-radius: 4px;"><button class="btn-style" onclick="envoyerReponseAdmin('${doc.id}')" style="font-size: 0.8rem; padding: 8px 15px;">RÉPONDRE</button><button class="btn-style" onclick="fermerTicket('${doc.id}', 'admin')" style="background: #f44336; color: #fff; font-size: 0.8rem; padding: 8px 15px; border:none;">🔒 CLÔTURER</button></div>` : `<div style="color: #f44336; font-size: 0.8rem; margin-top: 10px; font-weight: bold; text-align: center;">🔒 TICKET CLÔTURÉ</div>`; html += `<div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #555;"><div style="display: flex; justify-content: space-between; margin-bottom: 10px;"><strong>De: ${t.email}</strong><span style="color: ${color};">${t.statut}</span></div><p style="font-size: 0.9rem; margin-bottom: 10px;">Sujet: ${t.sujet}</p><div style="background: #000; padding: 10px; border-radius: 5px; max-height: 150px; overflow-y: auto; font-size: 0.8rem; color: #ccc;">${t.messages.map(m => `<b>${m.sender==='FUTURE'?'FUTURE':'Client'}</b>: ${m.text}`).join('<br><br>')}</div>${actionsHtml}</div>`; }); div.innerHTML = html || '<p class="empty-state">Aucun message client.</p>'; }
window.envoyerReponseAdmin = async (ticketId) => { const text = document.getElementById(`reply-admin-${ticketId}`).value; if(!text) return; await db.collection('support').doc(ticketId).update({ statut: 'Répondu', dateMAJ: Date.now(), messages: firebase.firestore.FieldValue.arrayUnion({ sender: 'FUTURE', text: text, date: Date.now() }) }); afficherNotification("Réponse envoyée !"); chargerAdminSupport(); }

window.chargerAdminPromos = async () => { const div = document.getElementById('admin-content'); div.innerHTML = `<button class="btn-buy" style="margin-bottom:15px; border-color:#555;" onclick="afficherFormPromo()">+ Créer un Code Promo</button><div id="form-create-promo" style="display:none; margin-bottom:20px; background:#111; padding:15px; border-radius:8px;"><input type="text" id="new-promo-code" placeholder="Nom du code (ex: SOLDE20)" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:#fff; border:1px solid #444;"><input type="number" id="new-promo-perc" placeholder="Réduction en % (ex: 20)" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:#fff; border:1px solid #444;"><button class="btn-buy" style="background:#fff; color:#000;" onclick="creerPromo()">ENREGISTRER LE CODE</button></div><div id="list-promos">Chargement...</div>`; const snap = await db.collection('promos').get(); let html = ''; snap.forEach(doc => { const p = doc.data(); html += `<div class="saved-item" style="justify-content: space-between;"><div><strong>${p.code}</strong><br><span style="color:#ccc;">-${p.pourcentage}%</span></div><button class="btn-style" style="background:#f44336; color:#fff; border:none; padding:5px 10px;" onclick="supprimerPromo('${doc.id}')">🗑️</button></div>`; }); document.getElementById('list-promos').innerHTML = html || '<p class="empty-state">Aucun code promo actif.</p>'; }
window.afficherFormPromo = () => { document.getElementById('form-create-promo').style.display = 'block'; }
window.creerPromo = async () => { const code = document.getElementById('new-promo-code').value.toUpperCase(); const perc = parseInt(document.getElementById('new-promo-perc').value); if(!code || !perc) return afficherNotification("Remplissez tous les champs !"); await db.collection('promos').add({ code: code, pourcentage: perc }); afficherNotification("Code Promo Créé !"); chargerAdminPromos(); }
window.supprimerPromo = async (id) => { await db.collection('promos').doc(id).delete(); afficherNotification("Code supprimé."); chargerAdminPromos(); }

// LES STOCKS 
window.chargerAdminStocks = async () => {
    const div = document.getElementById('admin-content');
    const articles = ['T-Shirt The Beginning', 'Track Jacket', 'Doudoune Glossy'];
    let html = ``;
    for(let nom of articles) {
        const doc = await db.collection('stocks').doc(nom).get();
        const estRupture = doc.exists ? doc.data().rupture : false;
        html += `<div class="saved-item" style="justify-content: space-between; border-color:#555;">
            <span>${nom}</span>
            <button class="btn-style" style="background:${estRupture ? '#4CAF50' : '#f44336'}; color:#fff; border:none;" 
            onclick="toggleStock('${nom}', ${estRupture})">${estRupture ? 'Remettre en stock' : 'Mettre en rupture'}</button>
        </div>`;
    }
    div.innerHTML = html;
}
window.toggleStock = async (nom, estActuellementRupture) => {
    await db.collection('stocks').doc(nom).set({ rupture: !estActuellementRupture });
    afficherNotification(`Stock mis à jour pour ${nom}`);
    chargerAdminStocks(); verifierStocks();
}
async function verifierStocks() {
    const articles = { 'T-Shirt The Beginning': 'tshirt', 'Track Jacket': 'veste', 'Doudoune Glossy': 'puffer' };
    for (let [nom, id] of Object.entries(articles)) {
        const doc = await db.collection('stocks').doc(nom).get();
        const btn = document.getElementById(`btn-${id}`);
        const badge = document.getElementById(`badge-${id}`);
        if (doc.exists && doc.data().rupture) {
            badge.style.display = 'block'; btn.disabled = true; btn.innerText = "INDISPONIBLE";
        } else {
            badge.style.display = 'none'; btn.disabled = false; btn.innerText = "AJOUTER AU PANIER";
        }
    }
}
verifierStocks();


// ==========================================
// 5. GESTION DU PANIER (TAILLES ET QUANTITÉS)
// ==========================================
let panier = [];
let remisePourcentage = 0; let codePromoApplique = "";
const cartSidebar = document.getElementById('cart-sidebar');
document.getElementById('btn-panier').addEventListener('click', () => { cartSidebar.classList.add('active'); });
document.getElementById('close-cart-btn').addEventListener('click', () => { cartSidebar.classList.remove('active'); });

window.ajouterAuPanier = function(nom, prix, taille) {
    const indexExistant = panier.findIndex(article => article.nom === nom && article.taille === taille);
    if (indexExistant !== -1) panier[indexExistant].quantite += 1; else panier.push({ nom: nom, prix: prix, taille: taille, quantite: 1 });
    mettreAJourPanier(); cartSidebar.classList.add('active'); afficherNotification(`${nom} (${taille}) ajouté !`);
}
window.modifierQuantite = function(index, delta) { panier[index].quantite += delta; if (panier[index].quantite <= 0) panier.splice(index, 1); mettreAJourPanier(); }
window.supprimerDuPanier = function(index) { panier.splice(index, 1); mettreAJourPanier(); }

window.appliquerPromo = async () => {
    const codeSaisi = document.getElementById('input-promo').value.toUpperCase(); if(!codeSaisi) return;
    const snap = await db.collection('promos').where('code', '==', codeSaisi).get();
    const msgBox = document.getElementById('promo-msg');
    if(snap.empty) { msgBox.style.color = "#f44336"; msgBox.innerText = "Code promo invalide."; remisePourcentage = 0; codePromoApplique = ""; } 
    else { const promo = snap.docs[0].data(); remisePourcentage = promo.pourcentage; codePromoApplique = promo.code; msgBox.style.color = "#4CAF50"; msgBox.innerText = `Code appliqué : -${remisePourcentage}% !`; }
    mettreAJourPanier();
}

function mettreAJourPanier() {
    const conteneur = document.getElementById('cart-items');
    document.getElementById('cart-count').innerText = panier.reduce((sum, art) => sum + art.quantite, 0);
    conteneur.innerHTML = ''; let sousTotal = 0;
    if (panier.length === 0) {
        conteneur.innerHTML = '<p style="color: #aaa;">Ton panier est vide.</p>'; remisePourcentage = 0; codePromoApplique = ""; document.getElementById('promo-msg').innerText = ''; document.getElementById('input-promo').value = '';
    } else {
        panier.forEach((article, index) => {
            const prixTotalArticle = article.prix * article.quantite; sousTotal += prixTotalArticle;
            conteneur.innerHTML += `<div class="cart-item"><div style="display:flex; justify-content:space-between; margin-bottom: 8px;"><span style="font-weight: bold;">${article.nom} (Taille ${article.taille})</span><span>${prixTotalArticle} €</span></div><div style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; background:#000; border-radius:4px; padding: 2px;"><button style="padding: 5px 10px; background:transparent; color:#fff; border:none; cursor:pointer;" onclick="modifierQuantite(${index}, -1)">-</button><span style="margin: 0 10px; font-weight:bold;">${article.quantite}</span><button style="padding: 5px 10px; background:transparent; color:#fff; border:none; cursor:pointer;" onclick="modifierQuantite(${index}, 1)">+</button></div><button style="background:transparent; color:#f44336; border:none; cursor:pointer; font-size: 1.2rem;" onclick="supprimerDuPanier(${index})">🗑️</button></div></div>`;
        });
    }

    let prixFinal = sousTotal; let textTotal = `Total: ${sousTotal} €`;
    if (remisePourcentage > 0 && sousTotal > 0) { prixFinal = sousTotal - ((sousTotal * remisePourcentage) / 100); textTotal = `<span style="text-decoration: line-through; color: #888; font-size:1rem;">${sousTotal} €</span> <br> Total Promo: ${prixFinal} €`; }
    document.getElementById('zone-total').innerHTML = textTotal; window.totalActuel = prixFinal;
}

// ==========================================
// 6. PAIEMENT ET REDIRECTION STRIPE
// ==========================================
const btnCheckout = document.getElementById('btn-checkout');
btnCheckout.addEventListener('click', async () => {
    if (panier.length === 0) return afficherNotification("Ton panier est vide !");
    if (!auth.currentUser) { cartSidebar.classList.remove('active'); authSidebar.classList.add('active'); return afficherNotification("Connecte-toi pour commander !"); }

    btnCheckout.innerText = "CHARGEMENT..."; btnCheckout.disabled = true;

    try {
        await db.collection('commandes').add({ email: auth.currentUser.email, articles: panier, total: window.totalActuel, codePromo: codePromoApplique || 'Aucun', date: firebase.firestore.FieldValue.serverTimestamp(), statut: 'En cours de préparation' });
        const response = await fetch('/.netlify/functions/create-checkout', { method: 'POST', body: JSON.stringify({ panier: panier, remise: remisePourcentage }) });
        const data = await response.json();
        if (data.url) window.location.href = data.url; else throw new Error();
    } catch (error) { afficherNotification("Erreur serveur."); btnCheckout.innerText = "VALIDER LA COMMANDE"; btnCheckout.disabled = false; }
});
