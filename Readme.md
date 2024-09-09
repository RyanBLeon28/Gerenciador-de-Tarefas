## BACKEND
Como rodar a aplicacao localmente: 

segue o guia pra instalar go:
```https://go.dev/doc/install```
entra na pasta app-tasklist/ e executa os seguintes comandos para baixar a dependencias:
```
go get github.com/golang-jwt/jwt/v4@v4.5.0
go get github.com/gorilla/mux@v1.8.1
go get github.com/mattn/go-sqlite3@v1.14.23
```
a partir disso a UNICA maneira de executar o app:
```make run```
Se tiver qualquer erro pra rodar isso, pfvr nao me chama e joga no chatgpt, abraco amo vcs


## Rotas:
## Documentacao incompleta !!
Basicamente todas as requests precisam do token de autentificacao na header, as que nao precisarem estara avisado.

ex. 
    "token" : {...} 

### User

Cria um usuario.

token nao e necessario.
```

POST /user

{
    "username" : string,
    "password" : string,
}

output : *User| error

username = nome do usuario
password = senha do usuario
```

### Login 
```
GET /login

{
    username : string,
    password : string
}

output : Token, UserID, *User| error

--------------------------------

username = nome do usuario
password = senha do usuario

token = salva isso pelo amor de deus
```
### Tasklist
Pegar todas as tasklist de um usuario
```
GET /user/tasklist

{
}

output : []*Tasklist | erro
```

Criar lista em branco
```
POST /user/tasklist

{
    "title" : nome
}

output: *Tasklist | erro

--------------------------------

title = nome para a criacao da lista

```
Atualizar tasklist
```
PATCH /user/tasklist
{
    "id": int,
    "title" : string,
    "data" : *Task
}

output : *Tasklist | error

id = id da lista
title = (opcional) novo nome da lista
data = (opcional) esse campo representa as tarefas, mais informacoes no final do arquivo
```

## Task
Cria umas task numa determinada lista
```
POST /user/tasklist/task

{
    "parent_id" : int,
    "title" : string,
    "description" : string,
    "status" : int
}

output : *Tasklist | error

----------------------------------------------------------------

parent_id = id da lista em que essa task faz parte
title = nome da tarefa
description = descricao da tarefa
status = status da tarefa (eh um numero)
```
Atualiza uma task
```
PATCH /user/tasklist/task

{
    "parent_id" : int,
    "data" : *Task
}

output: *Tasklist | error

----------------------------------------------------------------
parent_id = id da lista em que a task faz parte
data = tipo Task (final do arquivo)
```
Deletar uma task
```
DELETE /user/tasklist/task
{
    "parent_id" : int,
    "data" : *Task
}

output: *Tasklist | error
```

## Types 

### User
```
type: User 
fields:
    id,
    username,
    password

{
    "id" : int,
    "username" : string,
    "password" : string
}
```
### Tasklist
```
type: Tasklist 
fields:
    id,
    owner_id,
    title,
    tasks (nos json esse eh o data)

{
    "id" : int,
    "owner_id" : int,
    "title" : string,
    "data" : []*Task
}
```
### Task
```
type: Task
fields:
    id,
    parent_id,
    title,
    description,
    status

{
    "id" : int,
    "parent_id" : int,
    "title" : string,
    "description" : string,
    "status" : int
}
```

## Exemplos

### Criar um usuario:
```
POST /user
{
    "username" : "knosh",
    "password" : "russia_no_topo"
}

output
{
    "id": 3,
    "username": "knosh",
    "password": "russia_no_topo"
}
```
### Login
```
POST /login
{
    "username" : "knosh",
    "password" : "russia_no_topo"
}

output
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmF0aW9uIjoxNTAwMDAwLCJpZCI6M30.coVtL27ujEQ9oj0B0wTyaYxTrDDhQTppPa3eCX8Fzuw",
    "id": 3,
    "user_info": {
        "id": 3,
        "username": "knosh",
        "password": "russia_no_topo"
    }
}
```
### A partir daqui todos os exemplos quererem que o token recebido no login seja passado na HEADER DE TODA REQUEST
### Criar uma lista:
```
POST /user/tasklist
{
    "title" : "almoco da semana"
}

output:
{
    "id": 8,
    "title": "almoco da semana",
    "ownerId": 3,
    "data": []
}
```
### Alterar o nome da lista:
```
PATCH /user/tasklist
{
    "id" : 8,
    "title" : "almoco de segunda"
}

output
{
    "id": 8,
    "title": "almoco de segunda",
    "ownerId": 3,
    "data": [
        {
            "id": 6,
            "parent_id": 8,
            "title": "narreal sem feijao",
            "description": "odeio arroz",
            "status": 0
        }
    ]
}
```

### Criar uma tarefa:
```
POST /user/tasklist/task
{
    "parent_id" : 8,
    "title" : "feijao com arroz por cima",
    "description" : "sabe muito ntj",
    "status" : 0
}

output:
{
    "id": 8,
    "title": "almoco da semana",
    "ownerId": 3,
    "data": [
        {
            "id": 6,
            "parent_id": 8,
            "title": "feijao com arroz por cima",
            "description": "sabe muito ntj",
            "status": 0
        }
    ]
}
```
### Mudar a tarefa:
Primeira maneira
```
PATCH /user/tasklist/task
{
    "parent_id" : 8,
    "data" : {
        "id" : 6,
        "title" : "arroz com feijao por baixo",
        "description" : "mt ruim pqp",
        "status" : 1
    }
}
 
output 
{
    "id": 8,
    "title": "almoco da semana",
    "ownerId": 3,
    "data": [
        {
            "id": 6,
            "parent_id": 8,
            "title": "arroz com feijao por baixo",
            "description": "mt ruim pqp",
            "status": 1
        }
    ]
}
```
Segunda maneira

Nota: A diferenca e que por essa rota voce manda o id da tasklist como "id" e nao como "parent_id"
```
PATCH /user/tasklist
{
    "id" : 8,
    "data" : {
        "id" : 6,
        "title" : "narreal sem feijao",
        "description" : "odeio arroz",
        "status" : 0
    }
}

output 
{
    "id": 8,
    "title": "almoco da semana",
    "ownerId": 3,
    "data": [
        {
            "id": 6,
            "parent_id": 8,
            "title": "narreal sem feijao",
            "description": "odeio arroz",
            "status": 0
        }
    ]
}
```
