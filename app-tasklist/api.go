package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"io"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

type apiFunc func(http.ResponseWriter, *http.Request) error

type ApiError struct {
	Error string `json:"error"`
}

func makeHTTPHandleFunc(f apiFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if err := f(w, r); err != nil {
			WriteJSON(w, http.StatusBadRequest, ApiError{Error: err.Error()})
		}
	}
}

type APIServer struct {
	port string
	db   Storage
}

func NewServer(listenAddress string, d Storage) *APIServer {
	return &APIServer{
		port: listenAddress,
		db:   d,
	}
}
func getTest(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "pong")
}

func (s *APIServer) Run() {
	router := mux.NewRouter()

	router.Use(enableCORS)

	router.HandleFunc("/", getTest)
	router.HandleFunc("/login", makeHTTPHandleFunc(s.handleLogin))
	router.HandleFunc("/user", makeHTTPHandleFunc(s.handleAccount)).Methods("POST")
	router.HandleFunc("/user", withAuth(makeHTTPHandleFunc(s.handleAccountDeletion), s.db))
	router.HandleFunc("/special", makeHTTPHandleFunc(s.retrieveUsers))

	router.HandleFunc("/user/tasklist", withAuth(makeHTTPHandleFunc(s.handleTasklist), s.db))
	router.HandleFunc("/user/tasklist/task", withAuth(makeHTTPHandleFunc(s.handleTask), s.db))

	log.Println("spawned server running on port", s.port)

	err := http.ListenAndServe(s.port, router)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Println("server closed")
	} else if err != nil {
		fmt.Printf("unhandled error -> %s\n", err)
		os.Exit(1)
	}
}

func (s *APIServer) handleLogin(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "POST" {
		return fmt.Errorf("method not allowed %s", r.Method)
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("invalid login request -> %v", err)
		return WriteJSON(w, http.StatusBadRequest, "invalid request")
	}

	acc, err := s.db.GetByUsername_User(req.Username)
	if err != nil {
		log.Printf("error fetching user information -> %v", err)
		return WriteJSON(w, http.StatusInternalServerError, "")
	}

	if !acc.ValidPassword(req.Password) {
		return WriteJSON(w, http.StatusUnauthorized, fmt.Errorf("not authenticated"))
	}

	token, err := createJWT(acc)
	if err != nil {
		return err
	}
	log.Printf("log request -> user [%s] | pass [%s]", req.Username, req.Password)
	log.Printf("new token for [%s] -[%v]", req.Username, token)
	resp := LoginResponse{
		Token:   token,
		ID:      acc.ID,
		Account: *acc,
	}

	return WriteJSON(w, http.StatusOK, resp)
}

func (s *APIServer) retrieveUsers(w http.ResponseWriter, r *http.Request) error {
	accounts, err := s.db.GetAll_User()
	if err != nil {
		return err
	}
	return WriteJSON(w, http.StatusOK, accounts)
}

func (s *APIServer) handleAccount(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "POST" {
		return fmt.Errorf("method not allowed %s", r.Method)
	}
	return s.handleCreateAccount(w, r)
}

func (s *APIServer) handleAccountDeletion(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "DELETE" {
		return fmt.Errorf("method not allowed %s", r.Method)
	}
	return s.handleDeleteAccount(w, r)
}

func (s *APIServer) handleCreateAccount(w http.ResponseWriter, r *http.Request) error {
	req := new(CreateAccountRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		log.Printf("error in json decode -> %v", err)
		return WriteJSON(w, http.StatusBadRequest, err)
	}

	account := NewAccount(req.Username, req.Password)

	user, err := s.db.Create_User(account)
	if err != nil {
		log.Printf("error in creating user -> %v", err)
		return WriteJSON(w, http.StatusInternalServerError, "")
	}

	return WriteJSON(w, http.StatusOK, user)
}

func (s *APIServer) handleDeleteAccount(w http.ResponseWriter, r *http.Request) error {
	account, _ := r.Context().Value("account").(*Account)
	user, err := s.db.GetById_User(account.ID)
	if err != nil {
		return fmt.Errorf("error deleting user: %v", err)
	}
	if err := s.db.Delete_User(user); err != nil {
		return fmt.Errorf("error deleting user: %v", err)
	}
	return WriteJSON(w, http.StatusOK, fmt.Sprintf("deleted user: %s", user.Username))
}

func (s *APIServer) handleTasklist(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		return s.handleGetTasklists(w, r)
	}
	if r.Method == "POST" {
		return s.handleCreateTasklist(w, r)
	}
	if r.Method == "PATCH" {
		return s.handleUpdateTasklist(w, r)
	}
	if r.Method == "DELETE" {
		return s.handleDeleteTasklist(w, r)
	}

	return fmt.Errorf("method not allowed")
}

func (s *APIServer) handleTask(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "POST" {
		return s.handleCreateTask(w, r)
	}
	if r.Method == "PATCH" {
		return s.handleUpdateTask(w, r)
	}
	if r.Method == "DELETE" {
		return s.handleDeleteTask(w, r)
	}

	return fmt.Errorf("method not allowed")
}

func (s *APIServer) handleCreateTasklist(w http.ResponseWriter, r *http.Request) error {
	req := new(CreateTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}
	account, _ := r.Context().Value("account").(*Account)

	list := NewTasklist(req.Title, account.ID)
	list, err := s.db.Create_Tasklist(list.Title, list.OwnerID)
	if err != nil {
		log.Printf("error in create tasklist -> %v", err)
		return fmt.Errorf("check console")
	}
	return WriteJSON(w, http.StatusOK, list)
}

func (s *APIServer) handleGetTasklists(w http.ResponseWriter, r *http.Request) error {
	ctx, _ := r.Context().Value("account").(*Account)

	lists, err := s.db.GetAllFromOwnerID_Tasklist(ctx.ID)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusOK, lists)
}

func (s *APIServer) handleUpdateTasklist(w http.ResponseWriter, r *http.Request) error {
	req := new(UpdateTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}

	account, _ := r.Context().Value("account").(*Account)
	new_tasklist, err := s.db.Update_Tasklist(account.ID, req.ID, req.Title, req.Task)
	if err != nil {
		log.Printf("error in update tasklist -> %v", err)
		return WriteJSON(w, http.StatusInternalServerError, err)
	}

	return WriteJSON(w, http.StatusOK, new_tasklist)
}

func (s *APIServer) handleDeleteTasklist(w http.ResponseWriter, r *http.Request) error {
	req := new(DeleteTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}

	account, _ := r.Context().Value("account").(*Account)
	if req == nil && account.ID != req.OwnerID {
		return fmt.Errorf("invalid request")
	}

	if err := s.db.Delete_Tasklist(req.ID, req.Title); err != nil {
		return err
	}

	user, err := s.db.GetAllFromOwnerID_Tasklist(account.ID)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusOK, user)
}

func (s *APIServer) handleCreateTask(w http.ResponseWriter, r *http.Request) error {
	req := new(CreateTaskRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}

	t := &Task{
		0,
		req.ParentID,
		req.Title,
		req.Description,
		req.Status}

	log.Printf("req ct -> %v", req)

	list, err := s.db.Create_Task(t)
	if err != nil {
		log.Printf("error in create task-> %v", err)
		return err
	}

	return WriteJSON(w, http.StatusOK, list)
}

func (s *APIServer) handleUpdateTask(w http.ResponseWriter, r *http.Request) error {
	req := new(UpdateTaskRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}

	new_tasklist, err := s.db.Update_Task(req.ParentID, req.Task)
	if err != nil {
		log.Printf("error in update task-> %v", err)
		return WriteJSON(w, http.StatusBadRequest, err)
	}

	return WriteJSON(w, http.StatusOK, new_tasklist)
}

func (s *APIServer) handleDeleteTask(w http.ResponseWriter, r *http.Request) error {
	req := new(DeleteTaskRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		return err
	}

	new_tasklist, err := s.db.Delete_Task(req.ParentID, req.Task.ID)
	if err != nil {
		log.Printf("error in delete task -> %v", err)
		return WriteJSON(w, http.StatusBadRequest, err)
	}

	return WriteJSON(w, http.StatusOK, new_tasklist)
}
