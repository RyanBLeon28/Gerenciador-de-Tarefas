package main

import (
	"encoding/json"
	"errors"
	"fmt"
	// jwt "github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
)

func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

// func createJWT(account *Account) (string, error) {
// 	claims := &jwt.MapClaims{
// 		"expiresAt": 15000,
// 		"username":  account.Username,
// 	}

// 	secret := os.Getenv("JWT_SECRET")
// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

// 	return token.SignedString([]byte(secret))
// }

// func permissionDenied(w http.ResponseWriter) {
// 	WriteJSON(w, http.StatusForbidden, ApiError{Error: "permission denied"})
// }

// func withJWTAuth(handlerFunc http.HandlerFunc, s Storage) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		log.Println("jwt auth middleware")

// 		tokenString := r.Header.Get("x-jwt-token")
// 		token, err := validateJWT(tokenString)
// 		if err != nil {
// 			permissionDenied(w)
// 			return
// 		}
// 		if !token.Valid {
// 			permissionDenied(w)
// 			return
// 		}
// 		userID, err := getID(r)
// 		if err != nil {
// 			permissionDenied(w)
// 			return
// 		}
// 		account, err := s.GetById_User(userID)
// 		if err != nil {
// 			permissionDenied(w)
// 			return
// 		}

// 		claims := token.Claims.(jwt.MapClaims)
// 		if account.Username != string(claims["username"].(string)) {
// 			permissionDenied(w)
// 			return
// 		}

// 		if err != nil {
// 			WriteJSON(w, http.StatusForbidden, ApiError{Error: "invalid token"})
// 			return
// 		}

// 		handlerFunc(w, r)
// 	}
// }

// func validateJWT(tokenString string) (*jwt.Token, error) {
// 	secret := "knosh_brabo_442"
// 	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
// 		}
// 		return []byte(secret), nil
// 	})
// }

type apiFunc func(http.ResponseWriter, *http.Request) error

type ApiError struct {
	Error string `json:"error"`
}

func makeHTTPHandleFunc(f apiFunc) http.HandlerFunc {
	log.Printf("make http %v", f)
	return func(w http.ResponseWriter, r *http.Request) {
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

	router.HandleFunc("/", getTest)
	router.HandleFunc("/login", makeHTTPHandleFunc(s.handleLogin))
	router.HandleFunc("/user", makeHTTPHandleFunc(s.handleAccount))
	router.HandleFunc("/user/tasklist", makeHTTPHandleFunc(s.handleTasklist))
	router.HandleFunc("/user/tasklist/task", makeHTTPHandleFunc(s.handleTask))
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
		return err
	}

	acc, err := s.db.GetByUsername_User(req.Username)
	if err != nil {
		return err
	}
	log.Printf("username %s - password %s", req.Username, req.Password)

	if !acc.ValidPassword(req.Password) {
		return fmt.Errorf("not authenticated")
	}

	// token, err := createJWT(acc)
	// if err != nil {
	// 	return err
	// }

	resp := LoginResponse{
		// Token: token,
		ID: acc.ID,
	}

	return WriteJSON(w, http.StatusOK, resp)
}

func (s *APIServer) handleGetUserById(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		id, err := getID(r)
		if err != nil {
			log.Printf("error handleGetUserById -> %v", err)
			return err
		}

		account, err := s.db.GetById_User(id)
		if err != nil {
			return err
		}

		return WriteJSON(w, http.StatusOK, account)
	}

	return fmt.Errorf("method not allowed %s", r.Method)
}

func (s *APIServer) handleAccount(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		return s.handleGetAccount(w, r)
	}
	if r.Method == "POST" {
		return s.handleCreateAccount(w, r)
	}

	return fmt.Errorf("method not allowed %s", r.Method)
}

func (s *APIServer) handleGetTasklistByID(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		id, err := getID(r)
		if err != nil {
			log.Printf("error handleGetAccountById -> %v", err)
			return err
		}

		account, err := s.db.GetById_User(id)
		if err != nil {
			return err
		}

		return WriteJSON(w, http.StatusOK, account)
	}

	return fmt.Errorf("method not allowed %s", r.Method)
}

func (s *APIServer) handleGetAccount(w http.ResponseWriter, r *http.Request) error {
	accounts, err := s.db.GetAll_User()
	if err != nil {
		return err
	}
	return WriteJSON(w, http.StatusOK, accounts)
}

func (s *APIServer) handleCreateAccount(w http.ResponseWriter, r *http.Request) error {
	req := new(CreateAccountRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		log.Print(err)
		return err
	}

	account := NewAccount(req.Username, req.Password)
	a, err := s.db.Create_User(account)
	if err != nil {
		return err
	}

	return WriteJSON(w, http.StatusOK, a)
}

func (s *APIServer) handleTasklist(w http.ResponseWriter, r *http.Request) error {
	log.Printf("Tasklist request -> %s", r.Method)
	if r.Method == "GET" {
		return s.handleGetTasklists(w, r)
	}
	if r.Method == "POST" {
		return s.handleCreateTasklist(w, r)
	}
	if r.Method == "PATCH" {
		return s.handleUpdateTasklist(w, r)
	}
	return fmt.Errorf("method not allowed")
}

func (s *APIServer) handleTask(w http.ResponseWriter, r *http.Request) error {
	log.Printf("Task request -> %v", r.Method)
	if r.Method == "POST" {
		req := new(CreateTaskRequest)
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			log.Printf("error handleTask -> %v", err)
			return err
		}
		t := &Task{
			0,
			req.ParentID,
			req.Title,
			req.Description,
			req.Status}
		log.Printf("req ct -> %v", req)
		err := s.db.Create_Task(t)
		if err != nil {
			log.Printf("error in task db -> %v", err)
			return err
		}
		return WriteJSON(w, http.StatusOK, "ok")
	}
	return fmt.Errorf("method not allowed")
}

func (s *APIServer) handleCreateTasklist(w http.ResponseWriter, r *http.Request) error {
	req := new(CreateTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		log.Print(err)
		return err
	}
	list := NewTasklist(req.Title, req.OwnerID)
	list, err := s.db.Create_Tasklist(list.Title, list.OwnerID)
	if err != nil {
		log.Print(err)
		return fmt.Errorf("shit check console")
	}
	return WriteJSON(w, http.StatusOK, list)
}

func (s *APIServer) handleGetTasklists(w http.ResponseWriter, r *http.Request) error {
	req := new(GetTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		log.Printf("erro handleGetTasklists -> %v", err)
		return err
	}
	lists, err := s.db.GetAllFromOwnerID_Tasklist(req.OwnerID)
	if err != nil {
		log.Printf("error getAllFromOwner in handleGetTaskList -> %v", err)
		return err
	}

	return WriteJSON(w, http.StatusOK, lists)
}

func (s *APIServer) handleUpdateTasklist(w http.ResponseWriter, r *http.Request) error {
	req := new(UpdateTasklistRequest)
	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		log.Printf("error handleUpdateTasklist -> %v", err)
		return err
	}
	new_tasklist, err := s.db.Update_Tasklist(req.OwnerID, req.ID, req.Title, req.Task)
	if err != nil {
		return WriteJSON(w, http.StatusUnauthorized, err)
	}

	return WriteJSON(w, http.StatusOK, new_tasklist)
}

func getID(r *http.Request) (int, error) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return id, fmt.Errorf("invalid id given %s", idStr)
	}
	return id, nil
}
