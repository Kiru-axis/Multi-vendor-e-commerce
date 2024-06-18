# MultiVendor E-Commerce App

Ecommerce portal where some of the user(Seller) who want to sell the product and services using this and some of the user(Buyer/End User) who needs the product they can buy from the user(Seller)

_Zoneless application_

# Project Setup

**Step 1:** clone the project:

```sh
git clone https://github.com/Kiru-axis/Multi-vendor-e-commerce.git
```

**Step 2:** `cd e-commerce-app`

**Step 3:** `npm install`

**Step 4:** `npm install -g json-server` (Install JSON mock server)

**Step 5:** Open 2 terminals:
In one run

```sh
 ng serve
```

And the other

```sh
 npm run server
```

**Step 6:** Open your browser and type: http://localhost:4200 to open the angular app & http://localhost:3000/ to open the json mock server on another tab

## NB

- The components look lean because all the work is done on the services.
- Take your time to understand the services

- Just inject the service and use it directly on the template. These is possible due to '**selectors**' which are computed values from the '**store**' in the services they are defined.

- To Sign In as admin go: http://localhost:4200/auth/admin/admin-login and sign in with the credentials provided in db.json user 1
