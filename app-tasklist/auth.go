package main

import (
	"context"
	"fmt"
	jwt "github.com/golang-jwt/jwt/v4"
	"log"
	"net/http"
)

func permissionDenied(w http.ResponseWriter) {
	WriteJSON(w, http.StatusForbidden, ApiError{Error: "permission denied"})
}

var secret string = "knosh_442"

func createJWT(account *Account) (string, error) {
	claims := &jwt.MapClaims{
		"expiration": 1500000,
		"id":         account.ID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(secret))
}

func withAuth(handlerFunc http.HandlerFunc, s Storage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_t := r.Header.Get("token")
		log.Printf("hit auth | token -> %v", _t)
		token, err := validateToken(_t)
		if err != nil {
			log.Printf("error validating token | %v", err)
			permissionDenied(w)
			return
		}
		if !token.Valid {
			log.Printf("invalid token")
			permissionDenied(w)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		_id, ok := claims["id"].(float64)
		if !ok {
			log.Printf("Invalid type for id claim | expected float64, got %T", claims["id"])
			permissionDenied(w)
			return
		}

		account, err := s.GetById_User(int(_id))
		if err != nil {
			permissionDenied(w)
			return
		}

		ctx := context.WithValue(r.Context(), "account", account)
		r = r.WithContext(ctx)
		handlerFunc(w, r.WithContext(ctx))
	}
}

func validateToken(_t string) (*jwt.Token, error) {
	return jwt.Parse(_t, func(token *jwt.Token) (interface{}, error) {
		log.Println("validating request")
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
}
