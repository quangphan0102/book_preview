import express from "express";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    password: "9623402",
    host: "localhost",
    database: "book_review",
    port: 5432
})

db.connect();

//middleware:
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//Fetching books from DB:
const fetchBooks = async () => {
    const books = await db.query("SELECT * FROM books ORDER BY id ASC");

    return books.rows;
}

const getCurrentBook = async (id) => {
    const books = await fetchBooks();

    const book = books.find(book => book.id === id)

    return book;
}

//Homepage:
app.get("/", async (req, res) => {
    const books = await fetchBooks();

    res.render("index.ejs", {
        books
    })
});


//New review page:
app.get("/new", async (req, res) => {
    res.render("new.ejs", {
        action: "/add"
    });
});

//Insert new item into book page: 
app.post("/add", async (req, res) => {

    //Client's request Input:
    const isbnCode = req.body.isbn_code;
    const title = req.body.title.trim();
    const author = req.body.author;
    const reviewing = req.body.reviewing;
    const reviewer = req.body.reviewer;
    const readDate = req.body.read_date;
    const rating = req.body.rating;
    try {

        await db.query(
            `INSERT INTO books (isbn_code, book_title, author, reviewing, reviewer, date_read, rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [isbnCode, title, author, reviewing, reviewer, readDate, rating]
        );

        res.redirect("/");
    }
    catch (err) {
        console.log(err.message);
        throw err;
    }
});

//List item page:
app.get("/lists", async (req, res) => {
    const books = await fetchBooks();

    res.render("lists.ejs", {
        books
    });
});

//Edit book page:
app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const book = await getCurrentBook(id);

        res.render("new.ejs", {
            action: `/edit/${book.id}`,
            book
        })
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
});

//Handling edit books:
app.post("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    const isbnCode = req.body.isbn_code;
    const title = req.body.title.trim();
    const author = req.body.author;
    const reviewing = req.body.reviewing;
    const reviewer = req.body.reviewer;
    const readDate = req.body.read_date;
    const rating = req.body.rating;

    if (rating > 10) 
        return res.status(404).send("Rating is not greater than 10");

    try {

        await db.query(
            `UPDATE books
            SET isbn_code = $1, author = $2, reviewing = $3, 
                reviewer = $4, date_read = $5, rating = $6, book_title = $7 
            WHERE ID = ${id}`,
            [isbnCode, author, reviewing, reviewer, readDate, rating, title]
        );

        res.redirect("/");
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
});

//Fetching note to render to Overview page:
const fetchNotes = async (id) => {
    try {
        const notes = await db.query(
            `SELECT n.id, n.note_text, n.book_id, TO_CHAR(n.note_date, 'FMDay, FMMonth DD, YYYY') as date
            FROM notes n
            JOIN books AS b ON b.id = n.book_id
            WHERE n.book_id = ${id}
            ORDER BY n.id ASC`,
        )

        return notes.rows;
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
}

//Overview page:
app.get("/overview/:id", async (req, res) => {

    const id = parseInt(req.params.id);

    const book = await getCurrentBook(id);

    const notes = await fetchNotes(book.id);

    res.render("main.ejs", {
        book,
        notes
    });
})

//New note page:
app.get("/overview/:id/add-note", async (req ,res) => {
    const id = parseInt(req.params.id);

    const book = await getCurrentBook(id);

    res.render("create-note.ejs", {
        action: "/note/add",
        book
    });
})

app.post('/note/add', async (req, res) => {
    
    const noteText = req.body.note_text;

    const id = req.body.id;

    const book = await getCurrentBook(id);

    try {
        
        await db.query(
            `INSERT INTO notes (note_text, note_date, book_id)
            VALUES ($1, $2, $3)`,
            [noteText, new Date(), id]
        );

        res.redirect(`/overview/${id}`)
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
})

app.get("/note/edit/:book_id&:note_id", async (req, res) => {
    const bookId = parseInt(req.params.book_id);
    const noteId = parseInt(req.params.note_id);

    const notes = await fetchNotes(bookId);

    const note = notes.find(note => note.id === noteId);

    const book = await getCurrentBook(bookId);

    res.render("create-note.ejs", {
        book,
        action: `/note/edit/${noteId}`,
        note,
        heading: 'Editing'
    })
});

app.post("/note/edit/:id", async (req, res) => {
    const noteId = req.params.id;
    const bookId = parseInt(req.body.id);
    const noteText = req.body.note_text;

    try {
        await db.query(
            `UPDATE notes
            SET note_text = $1
            WHERE id = ${noteId}`,
            [noteText]
        )

        res.redirect(`/overview/${bookId}`)
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
})

app.post("/note/delete/:book_id&:note_id", async (req, res) => {

    const bookID = parseInt(req.params.book_id);
    const noteID = parseInt(req.params.note_id);

    try {
        await db.query(
            `DELETE FROM notes
            WHERE id = ${noteID}`
        )

        res.redirect(`/overview/${bookID}`);
    }
    catch (err) {
        console.log(err.message);

        throw err;
    }
})

app.listen(port, () => {
    console.log(`Listen on port: ${port}`);
})