# Ali Express Scraper

## Installation

```bash
yarn install
```

## Usage

```bash
yarn start
```

- **Development**:

```bash
yarn dev
```

Run with docker:

```bash
docker-compose up
```

### Seeding

- **Seed manually**:

```curl
curl --location --request POST 'http://localhost:3000/products/seed/ali-express'
```

- **Seed automatically**:

```bash
node automate.js
```
