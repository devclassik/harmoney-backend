# zippypay-backend

=== ZIPPYPAY MEETING =====
Home page airtime data cable would be arranged with most used/frequently used.

STRUCTURE FOR MARKETPLACE HOLDER

Structure 1
Safe haven feature 
  1. airtime
  2. data
  3. cable
  4. electricity
  5. internet

The Structure 2 below would be from multiple providers/merchants

Structure 2a.

- Merchants
- Payer ID (Payer Identification)
- Amount
- Note

  1. Water

Structure 2b

- Merchants
- Product/Service
- Amount
- Note

  1. Gas
  2. Event Ticketing
  3. Pharmacy
  4. Blood bank
  5. Hospital
  6. Doctor consult

Structure 2c

- Merchants
- Product/Service
- Sub Product/Service
- Identification
- Amount
- Note

  1. Insurance

Structure 2d

- Merchants
- Payer ID (Payer Identification)
- Product/Service
- Amount
- Note

  1. Apartment
  2. Education
  3. Government Payments
  4. Embassy
  5. Hotel
  6. Movies

Structure 2e

- Merchants
- From (Location)
- To (Location)
- Payer ID (Payer Identification)
- Amount
- Note

  1. Bus
  2. Train
  3. Flight

Merchants choose the category/Structure you belong to, this will determine the field available for each marketplace
Location is `select-once/fix-all` , this would also filter provider returned.

Location-based solutions- should there be state/city.
Marketplace is also dependent on the `agreement` zippypay has with certain providers.
`Select medication` should be referred to as product/service

Payments

- zippy to zippy
- send to anybody
- zippy to other account (zenith)
  Zippy can access your current, it then displays your contact who also have zippy pay users
  You can search zippypay (username or tag), you can send money to them

Send to anybody Process

- Token is sent to receiver email
- Receiver validates payment with token
- Receiver also input receiving account
- Sender gets notification that receiver has received
