/* Pirates of Ybor store settings. © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
   To switch on card payments:
   1. In Stripe, make one Payment Link per pack at exactly these prices (USD).
   2. Set each link's "after payment" redirect to:
        https://thepiratesofybor.netlify.app/shop.html?session_id={CHECKOUT_SESSION_ID}
   3. Paste each link into stripeLink below and set cardPaymentsOn to true.
   4. In Supabase (project pirates-of-ybor) add the secret STRIPE_SECRET_KEY.
   The claim server checks every payment with Stripe and pays each one out once.
   Never put a Stripe secret key in this file: it is public. */
window.POY_STORE={
  cardPaymentsOn:false,
  claimUrl:"https://uizbohxmekiibbocxndo.supabase.co/functions/v1/claim-doubloons",
  packs:[
    {id:"pack500",doubloons:500,price:"$0.99",stripeLink:""},
    {id:"pack1500",doubloons:1500,price:"$2.49",stripeLink:""},
    {id:"pack5000",doubloons:5000,price:"$6.99",stripeLink:""}
  ]
};
