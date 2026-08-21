const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // On récupère le panier ET la remise envoyés par le site web
        const { panier, remise } = JSON.parse(event.body);

        // Si y'a un code promo de 20%, le multiplicateur sera 0.80. Sinon c'est 1.
        const multiplicateurRemise = remise ? (1 - (remise / 100)) : 1;

        const lineItems = panier.map(article => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    // On affiche le Nom ET la Taille sur Stripe !
                    name: `${article.nom} (Taille: ${article.taille})`,
                },
                // On applique la remise sur le prix de l'article avant de l'envoyer à Stripe
                unit_amount: Math.round((article.prix * multiplicateurRemise) * 100),
            },
            quantity: article.quantite,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://boutiquefuture.netlify.app/',
            cancel_url: 'https://boutiquefuture.netlify.app/',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };

    } catch (error) {
        console.error("Stripe error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
