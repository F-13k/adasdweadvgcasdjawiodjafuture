// On importe l'outil Stripe (Netlify va le télécharger tout seul grâce au package.json)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    // On vérifie que c'est bien une requête POST (une demande d'achat)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Méthode non autorisée' };
    }

    try {
        // On récupère le contenu du panier que notre site a envoyé
        const { panier } = JSON.parse(event.body);

        // On transforme le panier de notre site en format compréhensible pour Stripe
        const lineItems = panier.map(article => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: article.nom,
                },
                unit_amount: Math.round(article.prix * 100), // Stripe compte en centimes (35€ = 3500)
            },
            quantity: 1, // On simplifie pour l'instant : 1 quantité par article ajouté
        }));

        // On crée la fameuse session de paiement sécurisée
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // Les pages de redirection après paiement
            success_url: 'https://boutiquefuture.netlify.app/', // Redirige vers l'accueil après succès pour l'instant
            cancel_url: 'https://boutiquefuture.netlify.app/', // Redirige vers l'accueil si annulation
        });

        // On renvoie l'URL de la page de paiement sécurisée Stripe à notre site
        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };

    } catch (error) {
        console.error("Erreur Stripe:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
