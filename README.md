## Getting Started

## Prerequisites

- Java JDK 25
- Maven 3.8+
- Oracle Database
- IDE (Eclipse, VSC)

## Quick start (Dockerized 🐳)

```bash
# 1. Clone & Setup Environment

mkdir projects

cd projects

git clone https://github.com/Java-Project-Demo/backend
git clone https://github.com/Java-Project-Demo/devops

cd devops

cp .example.env .env

# 2. Run the Cluster
docker compose up --build
```

## Start Manually

### Step 1: Setup Database

```SQL
  sqlplus / AS SYSDBA
  ALTER SESSION SET CONTAINER = ORCLPDB;
  CREATE USER backend IDENTIFIED BY abc123;
  GRANT CONNECT, RESOURCE, CREATE VIEW, UNLIMITED TABLESPACE TO backend;
  GRANT CREATE SESSION TO backend;
```

### Step 2: Clone Project

```bash
# 1. Clone & Setup Environment

mkdir projects
cd projects
git clone https://github.com/Java-Project-Demo/backend
cd backend
```

### Step 3: Config App

- Open file `src/main/resources/application.yml`

```bash
server:
  port: 8888
# Swagger config
  # Database config
  datasource:
    url: jdbc:oracle:thin:@localhost:1521/ORCL
    username: backend
    password: 123456
    driver-class-name: oracle.jdbc.OracleDriver
app:
  jwtCookieName: jwt
  jwtRefreshCookieName: jwt-refresh
  jwtSecret: RGF3bkJyZWFrZXJEYXduQnJlYWtlckRhd25CcmVha2Vy
  jwtExpirationsMs: 60000
  jwtRefreshExpirationsMs: 120000
  setup:
    admin:
      username: admin
      password: admin
```

### Step 4: Build and run apps

- With CMD

```bash
mvn clean install -DskipTests
mvn spring-boot:run
```
