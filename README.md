# rental-system

A full-stack rental platform connecting owners, tenants and admin. `<br>`

Owners list properties for rent (enter pending, need admin approval). **
Tenants search approved properties, submit rental applications, and request viewings. `<br>`
Admin approves new listings, verifies tenants, manages users and overall operations. `<br>`

# Tech:

[React & TypeScript] – SPA with modern tooling `<br>`
[React Router] – pages & navigation `<br>`
[React Query] – data fetching, cache & mutations `<br>`
[shadcn/ui] & [Tailwind CSS] – UI components & styling
[Spring Boot] – backend REST API
[Gradle] – build & dependency management
[Spring Security + JWT] – authentication & authorization
[MySQL] – relational database
[Hibernate JPA] – ORM & DB access
[MapStruct] – DTO ↔ Entity mapping
[OpenAPI/Swagger] – API docs & live testing

# Installation & Run
```
{
  "scripts": {
    "dev": "vite",
    "dev:all": "concurrently \"npm:dev\" \"cd ../rental-api && gradlew.bat bootRun\""
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}
```
Frontend
```
cd rental-frontend
npm install
npm run dev:all
```

# Run as Admin

username : admin
password: 12345



