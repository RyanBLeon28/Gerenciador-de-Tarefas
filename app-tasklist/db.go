package main

import (
	"database/sql"
	// "encoding/json"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

type Sqlite struct {
	db *sql.DB
}

func Connect() (*Sqlite, error) {
	db, err := sql.Open("sqlite3", "database/prod.db")
	log.Printf("open db")
	if err != nil {
		log.Fatal(err)
		db.Close()
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Sqlite{
		db: db,
	}, nil
}

func (s *Sqlite) Init_Users() error {
	q := `CREATE TABLE IF NOT EXISTS account (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(100) NOT NULL,
		password VARCHAR(100) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
	);`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init_Tasklist() error {
	q := `CREATE TABLE IF NOT EXISTS tasklists (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		owner_id INTEGER NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
		FOREIGN KEY (owner_id) REFERENCES account(id) ON DELETE CASCADE
	);`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init_Task() error {
	q := `CREATE TABLE IF NOT EXISTS task (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		parent_id INTEGER NOT NULL,
		title TEXT NOT NULL,
		description TEXT,
		status INTEGER,
	    FOREIGN KEY (parent_id) REFERENCES tasklists(id) ON DELETE CASCADE
	);`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init() error {
	err := s.Init_Users()
	if err != nil {
		log.Printf("error in init users -> %v", err)
		return err
	}

	err = s.Init_Tasklist()
	if err != nil {
		log.Printf("error init tasklists table -> %v", err)
		return err
	}

	err = s.Init_Task()
	if err != nil {
		log.Printf("error init task table -> %v", err)
		return err
	}

	_, err = s.db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		log.Fatal("error enabling foreign key constraints:", err)
		return err
	}

	return nil
}

type Storage interface {
	Create_User(*Account) (*Account, error)
	Delete_User(*Account) error
	GetById_User(int) (*Account, error)
	GetByUsername_User(string) (*Account, error)

	Create_Tasklist(string, int) (*Tasklist, error)
	Update_Tasklist(int, int, string, *Task) (*Tasklist, error)
	Delete_Tasklist(int, string) error
	GetAllFromOwnerID_Tasklist(int) ([]*Tasklist, error)

	Create_Task(*Task) (*Tasklist, error)
	Update_Task(int, *Task) (*Tasklist, error)
	Delete_Task(int, int) (*Tasklist, error)
	GetAllFromParentID_Task(int) ([]*Task, error)
	GetById_Task(int) (*Task, error)

	GetAll_User() ([]*FullAccount, error)
}

func (s *Sqlite) Create_User(acc *Account) (*Account, error) {
	query := `insert into account (username, password) values (?, ?)`

	_, err := s.db.Exec(
		query,
		acc.Username,
		acc.Password)
	if err != nil {
		return nil, err
	}

	new, err := s.GetByUsername_User(acc.Username)
	if err != nil {
		return nil, err
	}

	return new, nil
}

func (s *Sqlite) Delete_User(u *Account) error {
	q := `delete from account where id = ?`
	_, err := s.db.Exec(q, u.ID)
	if err != nil {
		return err
	}
	return nil
}

func (s *Sqlite) GetByUsername_User(n string) (*Account, error) {
	row, err := s.db.Query(`select * from account where username= ?`, n)
	log.Printf("get by username %s", n)
	if err != nil {
		return nil, err
	}
	if row.Next() {
		account, err := scanAccount(row)
		if err != nil {
			return nil, err
		}
		row.Close()
		return account, nil
	}
	return nil, fmt.Errorf("no account for %s", n)
}

func (s *Sqlite) GetAll_User() ([]*FullAccount, error) {
	row, err := s.db.Query("select * from account")
	if err != nil {
		return nil, err
	}
	list := []*FullAccount{}
	for row.Next() {
		ac := new(FullAccount)
		account_info, err := scanAccount(row)
		if err != nil {
			row.Close()
			return nil, err
		}

		ac.User = account_info
		ac.List, _ = s.GetAllFromOwnerID_Tasklist(account_info.ID)
		list = append(list, ac)
	}
	return list, nil
}

func scanAccount(rows *sql.Rows) (*Account, error) {
	account := new(Account)
	var timestamp string
	err := rows.Scan(
		&account.ID,
		&account.Username,
		&account.Password,
		&timestamp)
	return account, err
}

func (s *Sqlite) GetById_User(id int) (*Account, error) {
	rows, err := s.db.Query("select * from account where id = ?", id)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		acc, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		rows.Close()
		return acc, nil
	}

	return nil, fmt.Errorf("account %d not found", id)
}

func (s *Sqlite) Create_Tasklist(title string, ownerID int) (*Tasklist, error) {
	query := `insert into tasklists (title, owner_id) values (?, ?)`
	r, err := s.db.Exec(
		query,
		title,
		ownerID,
	)
	if err != nil {
		return nil, err
	}

	inserted_id, err := r.LastInsertId()
	if err != nil {
		return nil, err
	}

	l, err := s.GetById_Tasklist(int(inserted_id))
	if err != nil {
		return nil, err
	}
	return l, nil
}

func (s *Sqlite) GetAllFromOwnerID_Tasklist(id int) ([]*Tasklist, error) {
	rows, err := s.db.Query(`select * from tasklists where owner_id = ?`, id)
	if err != nil {
		log.Printf("error in db getAllOwnerId -> %v", err)
		return nil, err
	}

	lists := []*Tasklist{}
	for rows.Next() {
		tasklist, err := scanTasklist(rows)
		if err != nil {
			log.Printf("error in row scan getAllOwnerId -> %v", err)
			return nil, err
		}
		tasks, err := s.GetAllFromParentID_Task(tasklist.ID)
		tasklist.Tasks = tasks

		lists = append(lists, tasklist)
	}
	return lists, nil
}

func (s *Sqlite) GetById_Tasklist(id int) (*Tasklist, error) {
	rows, err := s.db.Query(`select * from tasklists where id = ?`, id)
	if err != nil {
		log.Printf("Tasklist GetById error: %e", err)
		return nil, err
	}
	for rows.Next() {
		tasklist, err := scanTasklist(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		rows.Close()

		tasks, err := s.GetAllFromParentID_Task(tasklist.ID)
		tasklist.Tasks = tasks

		return tasklist, nil
	}
	return nil, fmt.Errorf("Not found")
}

func scanTasklist(rows *sql.Rows) (*Tasklist, error) {
	list := new(Tasklist)
	var timestamp string
	err := rows.Scan(
		&list.ID,
		&list.Title,
		&list.OwnerID,
		&timestamp,
	)

	return list, err
}

func (s *Sqlite) Update_Tasklist(owner_id int, tasklist_id int, title string, t *Task) (*Tasklist, error) {
	tasklist, err := s.GetById_Tasklist(tasklist_id)
	if err != nil {
		return nil, err
	}

	if tasklist.OwnerID != owner_id {
		return nil, fmt.Errorf("Not allowed")
	}

	if title != "" {
		tasklist.Title = title
	}

	query := `UPDATE tasklists SET title = ? WHERE id = ? AND owner_id = ?`
	_, err = s.db.Exec(query, tasklist.Title, tasklist_id, owner_id)
	if err != nil {
		log.Printf("error updating tasklist: %v", err)
		return nil, fmt.Errorf("error updating tasklist: %v", err)
	}

	if t != nil && t.ID != 0 {
		_, err = s.Update_Task(tasklist.ID, t)
		if err != nil {
			return nil, fmt.Errorf("error updating task: %v", err)
		}
	}

	log.Printf("Tasklist updated: %v", tasklist)
	tasklist, err = s.GetById_Tasklist(tasklist_id)
	if err != nil {
		return nil, err
	}
	return tasklist, nil
}

func (s *Sqlite) Delete_Tasklist(id int, title string) error {
	if id != 0 {
		q := `delete from tasklists where id = ?`
		_, err := s.db.Exec(q, id)
		if err != nil {
			return err
		}
		log.Printf("remove from tasklists where id %d", id)
		return nil
	}
	q := `delete from tasklists where title = ?`
	_, err := s.db.Exec(q, title)
	if err != nil {
		return err
	}
	log.Printf("remove from tasklists where title %s", title)
	return nil
}

func (s *Sqlite) Create_Task(t *Task) (*Tasklist, error) {
	q := `insert into task (parent_id, title, description, status) values (?, ?, ?, ?)`
	_, err := s.db.Exec(q, t.ParentID, t.Title, t.Description, t.Status)
	if err != nil {
		return nil, err
	}

	tasklist, err := s.GetById_Tasklist(t.ParentID)
	if err != nil {
		return nil, err
	}
	return tasklist, nil
}

func (s *Sqlite) Delete_Task(id, parentID int) (*Tasklist, error) {
	q := `delete from task where id = ? and parent_id = ?`

	_, err := s.db.Exec(q, id, parentID)
	if err != nil {
		return nil, fmt.Errorf("error deleting task with id %d and parent_id %d: %v", id, parentID, err)
	}

	tasklist, err := s.GetById_Tasklist(parentID)
	if err != nil {
		return nil, err
	}
	return tasklist, nil
}

func (s *Sqlite) Update_Task(parent_id int, t *Task) (*Tasklist, error) {
	q := `update task set title = ?, description = ?, status = ? where parent_id = ? and id = ?`

	og, err := s.GetById_Task(t.ID)
	if err != nil {
		return nil, err
	}
	tasklist, err := s.GetById_Tasklist(parent_id)
	if err != nil {
		return nil, err
	}

	updated := false

	if og.Title != t.Title && t.Title != "" {
		og.Title = t.Title
		updated = true
	}
	if og.Description != t.Description && t.Description != "" {
		og.Description = t.Description
		updated = true
	}
	if og.Status != t.Status {
		og.Status = t.Status
		updated = true
	}

	if !updated {
		return tasklist, nil
	}

	_, err = s.db.Exec(q, og.Title, og.Description, og.Status, parent_id, og.ID)
	if err != nil {
		return nil, nil
	}

	tasklist, err = s.GetById_Tasklist(parent_id)
	if err != nil {
		return nil, err
	}

	return tasklist, nil
}

func (s *Sqlite) GetById_Task(id int) (*Task, error) {
	q := `select * from task where id = ?`
	rows, err := s.db.Query(q, id)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		rows.Close()
		return task, nil
	}
	return nil, fmt.Errorf("Not found")
}

func (s *Sqlite) GetAllFromParentID_Task(id int) ([]*Task, error) {
	q := `select * from task where parent_id = ?`
	rows, err := s.db.Query(q, id)
	if err != nil {
		return nil, err
	}
	t := []*Task{}
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		t = append(t, task)
	}
	return t, nil
}

func scanTask(rows *sql.Rows) (*Task, error) {
	task := new(Task)
	err := rows.Scan(
		&task.ID,
		&task.ParentID,
		&task.Title,
		&task.Description,
		&task.Status)

	return task, err
}
