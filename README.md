# Trust Cloud Challenge

## Goal
The goal of this a application is to provide a catalog service.

## Data Model
![Alt text](./diagrams/ER/mer.svg)

## Sequence Diagram

### Master Catalog
#### Create Master Catalog Product
![Alt text](./diagrams/sequence/create-master-catalog.svg)
#### Update Master Catalog Product
![Alt text](./diagrams/sequence/update-master-catalog.svg)
#### Delete Master Catalog Product
![Alt text](./diagrams/sequence/delete-master-catalog.svg)
#### Get Master Catalog Products
![Alt text](./diagrams/sequence/get-master-catalog-from-catalog-product.svg)

### Catalog
#### Create Catalog Product
![Alt text](./diagrams/sequence/create-catalog-product.svg)
#### Update Catalog Product
![Alt text](./diagrams/sequence/update-catalog-product.svg)
#### Delete Master Catalog Product
![Alt text](./diagrams/sequence/delete-catalog-product.svg)
#### Get a Product from a Catalog
![Alt text](./diagrams/sequence/get-product-from-a-catalog.svg)
#### List Products of a Catalogs
![Alt text](./diagrams/sequence/find-all-products-of-a-catalog.svg)
#### Get Master Calog of a Catalog
![Alt text](./diagrams/sequence/find-master-catalog.svg)

## 💻 Requirements

- Docker
- Docker Compose
- Node >=16 (used version: 16.8.1)

## 🚀 Install

1. Clone this repository
2. Then, run the below command in source folder of this repository:
```shell
npm run run-docker or yarn run-docker
```

## Notes

### How to use 
In the catalog api you have 3 users:
- ADMIN - type admin
```
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE2NzkyNjAxODUsImV4cCI6MTk5NDgzNjE4NX0.hFb85vJ2QnqQO8vtV6kZa6V9ANQ6PM8ofk4DkOJNGhE'
```
- OEM 1 - type oem
```
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJvZW0iXSwic3ViIjoxLCJpYXQiOjE2NzkyNjAzMDIsImV4cCI6MTk5NDgzNjMwMn0.DGz5cgijCUTgwCO4NOrMom7L49zXEBTJkqGi2zHgBIs'
```
- OEM 2 - type oem
```
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJvZW0iXSwic3ViIjoyLCJpYXQiOjE2NzkyNjA0NjQsImV4cCI6MTk5NDgzNjQ2NH0.R7nwhv9Jk_NBGFlExatkcRdNN0cx0snY_NHMCCMbPYg'
```

##### Only a admin type user can access the master-catalogs path.
##### Only a oem type user can access the catalogs path.
##### Each OEM can only access its own catalog.

OEM 1 has 2 catalogs:
- Catalog 1 = id: 1
- Catalog 2 = id: 2

OEM 2 has 2 catalogs:
- Catalog 3 = id: 3
- Catalog 4 = id: 4



### API Documentation:
The api documentaion was written in OpenApi standard if you wanna take a look in the API Documentation you will need access the below url after you run the npm run run-docker:
```
http://localhost:3333/api
```

### Postman:
To facilitate the user experience I added a postman collection to test the api, it is placed at [here](./postman/).
- Note: You should import environment variables in your postman as well.
