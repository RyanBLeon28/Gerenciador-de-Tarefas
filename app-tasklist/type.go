package main

import (
	"log"
)

type LoginResponse struct {
	ID    int    `json:"Id"`
	Token string `json:"token"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TasklistRequest struct {
	OwnerID int `json:"owner"`
}

type CreateAccountRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type CreateTasklistRequest struct {
	Title   string `json:"title"`
	OwnerID int    `json:"owner_id"`
}

type GetTasklistRequest struct {
	OwnerID int `json:"owner_id"`
}

type UpdateTasklistRequest struct {
	ID      int    `json:"id"`
	OwnerID int    `json:"owner_id"`
	Title   string `json:"title"`
	Task    *Task  `json:"data"`
}

type CreateTaskRequest struct {
	ParentID    int    `json:"parent_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

type Account struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Tasklist struct {
	ID      int     `json:"id"`
	Title   string  `json:"title"`
	OwnerID int     `json:"ownerId"`
	Tasks   []*Task `json:"data"`
}

type Task struct {
	ID          int    `json:"id"`
	ParentID    int    `json:"parent_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

func NewAccount(username, password string) *Account {
	log.Printf("new account: [%s] [%s]", username, password)
	return &Account{
		ID:       0,
		Username: username,
		Password: password,
	}
}

func (a *Account) ValidPassword(pw string) bool {
	if a.Password == pw {
		return true
	}
	return false
}

func NewTasklist(title string, id int) *Tasklist {
	log.Printf("new Tasklist created by [%d]", id)
	return &Tasklist{
		Title:   title,
		OwnerID: id,
	}
}
