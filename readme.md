# Documentação - Rotas de Usuários (`/users`)

Base de integração para o consumo das rotas de usuários da API.

---
## Setup
Após clonar o repositório e instalar as dependências, crie um arquivo .env com base nas variáveis disponíveis no .env.example.
Execute o comando no terminal do projeto 'npm run migration:generate' para gerar as tabelas, 
e 'npm run migration:run' para criar as tabelas no banco de dados


Para testar os middlewares eu fiz a rota 'GET:/testes'. Pode passar um ou mais roles no parametro do guard 'roleGuard' usando a enum 'UserRoles'.
Para testar o RoleGuard, altere a role do usuário diretamente no banco de dados.
As roles disponíveis são:

- user
- admin
- medic

---

## Autenticação
As rotas autenticadas utilizam JWT (JSON Web Token). Após realizar o login ou cadastro, o token retornado deve ser enviado no header:
```http
    Authorization: Bearer <token>
```

---

## EndPoints

### 1. Registrar usuário
Registra um novo usuário no sistema.

- **Método:** `POST`
- **Endpoint:** `/users/register`
- **Body (JSON):**
```json
{
    "email": "example@example.com",
    "password": "Example123"
}
```
#### (`201 Created`)
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJleGFtcGxlQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODkwNzk4ODQsImV4cCI6MTc4OTA4MzQ4NH0.BUmAgO9o-FjmWGzM7Je0AXCWckzDub2fy-cAAOQz38M",
    "data": {
        "id": 1,
        "email": "example@example.com",
        "role": "user"
    }
}
```
#### (`409 Conflict`)
```json
{
    "error": "Email já cadastrado"
}
```
#### (`400 Bad Request`)
```json
{
    "error": "Formato de email inválido"
}
```
```json
{
    "error": "Formato de senha inválido"
}
```

##
### 2. Logar usuário
Rota para efetuar o login do usuário.

- **Método:** `POST`
- **Endpoint:** `/users/login`
- **Body (JSON):**
```json
{
    "email": "example@example.com",
    "password": "Example123"
}
```
#### (`200 Ok`)
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJleGFtcGxlQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODkwODA0NjAsImV4cCI6MTc4OTA4NDA2MH0.S6ajFpIexbIoNjMscTO3-19Y3GfDmP-Rt1MQcoZ-eyY",
    "data": {
        "id": 1,
        "email": "example@example.com",
        "role": "user"
    }
}
```
#### (`401 Unauthorized`)
```json
{
    "error": "Credenciais inválidas"
}
```
#### (`400 Bad Request`)
```json
{
    "error": "Formato de email inválido"
}
```
```json
{
    "error": "Formato de senha inválido"
}
```

### 3. testes
Rota utilizada para testar os middlewares de autenticação e autorização por roles.

- **Método:** `GET`
- **Endpoint:** `/testes`
- **Header:**
```http
    Authorization: Bearer <token>
```

O acesso à rota depende das roles configuradas no `RoleGuard`