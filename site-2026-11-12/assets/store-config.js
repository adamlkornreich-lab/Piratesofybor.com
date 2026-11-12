/* Pirates of Ybor store settings. © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
   Card payments stay OFF until BOTH are true:
   1. a Stripe Payment Link is pasted below for each pack, and
   2. a server (the Supabase project) confirms each payment and credits the doubloons.
   Never put a Stripe secret key in this file: it is public. */
window.POY_STORE={
  cardPaymentsOn:false,
  packs:[
    {id:"pack500",doubloons:500,price:"$0.99",stripeLink:""},
    {id:"pack1500",doubloons:1500,price:"$2.49",stripeLink:""},
    {id:"pack5000",doubloons:5000,price:"$6.99",stripeLink:""}
  ]
};
