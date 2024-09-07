# back

Oi, fiquei ate as 5am fazendo essa porra e nao consegui terminar.
O meu unico divertimento dessa noite vai ser fazer esse doc entao vamo dale rapaziadaaaaaaa (rec)ebaaaa

## Rotas:

### PRINCIPAL = 

### usuario
```
Essa aqui serve pra cria um usuario, pq eu nao coloquei na de registro? nao sei tbm

POST /user

{
    "username" : string,
    "password" : string,
}

username = nome do usuario
password = senha do usuario

output : user | error
```
```
GET /user

{
    precisa manda p#rra nenhuma   
}

output : lista com todos os usuarios do banco | erro
```

### login 
```
ta funcionando mas nao ta retornando o token(fiquei com sono e nao implementei o JWT)

GET /login

{
    username : string,
    password : string
}

username = nome do usuario
password = senha do usuario

output : account.id | error
```
## aqui chegamo na parte boa

### Lista de tarefas
```
GET /user/tasklist

{
    "owner_id" : id
}

owner_id e necessariamente o Id do usuario que foi passado quando isso foi criado

output : Lista das lista | erro

```
```
# Essa rota serve pra CRIAR uma lista EM BRANCO / SEM TAREFAS

POST /user/tasklist

{
    "owner_id" : id,
    "title" : nome
}

Ta meio obvio ne, mas assim owner_id e o id do usuario que vai ser dono disso e title eh o proprio nome da lista

output: lista | erro
```
```
# Essa rota serve pra ATUALIZAR informacoes da lista
# ELA TA QUASEEEE FUNCIONANDO

PATCH /user/tasklist
{
    "owner_id" : int,
    "id": int,
    "title" : string,
    "data" : [] 
}

owner_id = id do dono dessa lista
id = id da lista
title = (opcional) novo nome da lista
data = (opcional) esse campo representa as tarefas, mais informacoes no final do arquivo

output : lista modificada | error

```

```
# Essa rota serve para CRIAR tarefas novas numa lista
POST /user/tasklist/task

{
    "parent_id" : int,
    "title" : string,
    "description" : string,
    "status" : int
}

parent_id = id da lista que essa tarefa faz parte
title = nome dessa tarefa
description = descricao da mesma
status = oq o ryan pediu (te amo rei)

output : ok | error
```

## TIPOS | TYPES

salve tropa;

Os tipos sao basicamente os objetos que compoe nossa aplicacao:
```
Usuario

type: account
fields:
    id,
    username,
    password
```
```
Lista

type: tasklist
fields:
    id,
    owner_id,
    title,
    tasks (nos json esse eh o data)
```

```
Tarefa

type: task
fields:
    id,
    parent_id,
    title,
    description,
    status
```

## Exemplos

```
Criar um usuario:
    POST /user
    {
        "username" : "deadpool",
        "password" : "wolverine"
    }
    
    output:
    {
        "id": 11,
        "username": "deadpool",
        "password": "wolverine"
    }
```

```
Criar uma lista:
    POST /user/tasklist
    {
        "owner_id" : 11,
        "title" : "adamantium"
    }
    
    output:
    {
        "id": 5,
        "title": "adamantium",
        "ownerId": 11,
        "data": null
    }
```
```
Criar uma tarefa:
    POST /user/tasklist/task
    {
        "parent_id" : 5,
        "title" : "get golden .50 caliber",
        "description" : "fuck nicepool",
        "status" : 0
    }
    output:
    {
        "ok"
    }