CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    book_title VARCHAR(255),
    isbn_code CHAR(13) NOT NULL UNIQUE,
    author VARCHAR(50) NOT NULL,
    reviewing TEXT,
    reviewer VARCHAR(50),
    date_read DATE,
    rating FLOAT
)

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    note_text TEXT,
    note_date DATE,
    book_id INTEGER REFERENCES books(id)
)