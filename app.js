require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const app = express();
app.use(bodyparser.json());

const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//parse URL-encoded bodies (as send by HTML forms)
app.use(express.urlencoded({ extended: false}))
//parse JSON bodies (as sent by API clients)
app.use(express.json())

app.use(cookieParser());
app.set('view engine', 'hbs');

//connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Database Connected...')
});

app.listen('8001', ()=> {
    console.log('Server started on port 8001')
});

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
//GET ALL BOOKS

app.get('/books', (req, res) => {
    db.query('SELECT * FROM book', async (err, rows) =>{
        try {
            await res.json(rows);
        } catch(err){
            res.json({
                message: err
            });
        }
    })
})

//SPECIFIC BOOK
app.get('/books/:id', (req, res) => {
    db.query('SELECT * FROM book WHERE id = ?',[req.params.id], async (err, rows) =>{
        try{
            await res.json(rows);
        } catch(err){
            res.json({
                message: err
            });
        }
    })
})

//ADD BOOK
app.post('/books', (req, res) => {
    db.query('INSERT INTO book SET ?',req.body, async (err,) =>{
        try{
            res.json({
                message: "Book has been added successfully",
                added: true
            })
        } catch(err){
            res.json({
                message: err
            });
        }
    })
});

//UPDATE BOOK
app.patch('/books/:id', (req, res)=>{
    db.query('UPDATE book SET ? WHERE id = ?', [req.body, req.params.id], async (err) =>{
        try{
            res.json({
                message: "Book has been updated successfully",
                updated: true
            })
        } catch(err){
            res.json({
                message: err
            });
        }
    })
})

//DELETE BOOK
app.delete('/books/:id', (req, res)=>{
    db.query('DELETE FROM book WHERE id = ?',[req.params.id], async (err) =>{
        try{
            res.json({
                message: "Book has been deleted successfully",
                deleted: true
            })
        } catch(err){
            res.json({
                message: err
            });
        }
    })
})