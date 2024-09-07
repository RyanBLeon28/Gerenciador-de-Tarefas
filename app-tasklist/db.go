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
	db, err := sql.Open("sqlite3", "foo/foo.db")
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
	)`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init_Tasklist() error {
	q := `CREATE TABLE IF NOT EXISTS tasklists (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		owner_id INTEGER NOT NULL REFERENCES account(id),
		created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
	)`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init_Task() error {
	q := `CREATE TABLE task (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		parent_id INTEGER NOT NULL REFERENCES tasklists(id),
		title TEXT NOT NULL,
		description TEXT,
		status INTEGER
	)`
	_, err := s.db.Exec(q)
	return err
}

func (s *Sqlite) Init() error {
	err_user := s.Init_Users()
	if err_user != nil {
		log.Printf("error in init users -> %v", err_user)
		return err_user
	}

	err_tasklist := s.Init_Tasklist()
	if err_tasklist != nil {
		log.Printf("error init tasklists table -> %v", err_tasklist)
		return err_tasklist
	}

	err_task := s.Init_Task()
	if err_task != nil {
		log.Printf("error init task table -> %v", err_task)
		return err_task
	}
	return nil
}

type Storage interface {
	Create_User(*Account) (*Account, error)
	// Delete_User(*Account) error
	// Update_User(*Account) error
	GetAll_User() ([]*Account, error)
	GetById_User(int) (*Account, error)
	GetByUsername_User(string) (*Account, error)

	Create_Tasklist(string, int) (*Tasklist, error)
	GetAllFromOwnerID_Tasklist(int) ([]*Tasklist, error)
	Update_Tasklist(int, int, string, *Task) (*Tasklist, error)
	// Delete_Tasklist(*Task) error
	// GetById_Tasklist(*Task) error
	// GetData_Tasklist(*Task) error

	Create_Task(*Task) error
	Update_Task(int, int, string, string, int) error
	GetAllFromParentID_Task(int) ([]*Task, error)
	GetById_Task(int) (*Task, error)
	Delete_Task(int, int) error
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
		return account, nil
	}
	return nil, fmt.Errorf("no account for %s", n)
}

func (s *Sqlite) GetAll_User() ([]*Account, error) {
	row, err := s.db.Query("select * from account")
	if err != nil {
		return nil, err
	}
	list := []*Account{}
	for row.Next() {
		account, err := scanAccount(row)
		if err != nil {
			row.Close()
			return nil, err
		}
		list = append(list, account)
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
		rows.Close()
		return scanAccount(rows)
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
		return tasklist, nil
	}
	return nil, fmt.Errorf("Not found")
}

func scanTasklist(rows *sql.Rows) (*Tasklist, error) {
	list := new(Tasklist)
	var timestamp string
	var data sql.NullString
	err := rows.Scan(
		&list.ID,
		&list.Title,
		&list.OwnerID,
		&timestamp,
		&data,
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

	if t != nil {
		task, err := s.GetById_Task(t.ID)
		if err != nil {
			return nil, fmt.Errorf("error fetching task: %v", err)
		}

		updated := false
		if task.Title != t.Title {
			task.Title = t.Title
			updated = true
		}
		if task.Description != t.Description {
			task.Description = t.Description
			updated = true
		}
		if task.Status != t.Status {
			task.Status = t.Status
			updated = true
		}
		if updated {
			err := s.Update_Task(tasklist_id, task.ID, task.Title, task.Description, task.Status)
			if err != nil {
				return nil, fmt.Errorf("error updating task: %v", err)
			}
		}
	}

	log.Printf("Tasklist updated: %v", tasklist)
	return tasklist, nil
}

func (s *Sqlite) Create_Task(t *Task) error {
	q := `insert into task (parent_id, title, description, status) values (?, ?, ?, ?)`
	_, err := s.db.Exec(q, t.ParentID, t.Title, t.Description, t.Status)
	if err != nil {
		return err
	}
	return nil
}

func (s *Sqlite) Delete_Task(id, parentID int) error {
	q := `delete from task where id = ? and parent_id = ?`

	_, err := s.db.Exec(q, id, parentID)
	if err != nil {
		return fmt.Errorf("error deleting task with id %d and parent_id %d: %v", id, parentID, err)
	}

	return nil
}

func (s *Sqlite) Update_Task(parent_id int, id int, title string, description string, status int) error {
	q := `update task set title = ?, description = ?, status = ? where parent_id = ? and id = ?`

	og, err := s.GetById_Task(id)
	if err != nil {
		return err
	}

	updated := false

	if og.Title != title {
		og.Title = title
		updated = true
	}
	if og.Description != description {
		og.Description = description
		updated = true
	}
	if og.Status != status {
		og.Status = status
		updated = true
	}

	if !updated {
		return nil
	}

	_, _err := s.db.Exec(q, og.Title, og.Description, og.Status, parent_id, id)
	if _err != nil {
		return _err
	}

	return nil
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
