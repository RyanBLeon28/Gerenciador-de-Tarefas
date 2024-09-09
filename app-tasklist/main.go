package main

import (
	"os"
)

func main() {
	s, err := Connect()
	if err != nil {
		os.Exit(1)
	}
	defer s.db.Close()
	s.Init()

	server := NewServer(":6900", s)
	server.Run()
}
