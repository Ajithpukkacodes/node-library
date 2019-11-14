var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
const validator = require('express-validator');



var async = require('async');

exports.index = function(req, res) {
    console.log(res.locals.user = req.user || null);
    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books.
exports.book_list = function(req, res) {
    Book.find({}).populate('author').exec(function (err, list_books) {
       res.render("books/book_list", {title: 'Book List', book_list: list_books});
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
      book: function(callback) {
       Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
     },
      book_instance: function(callback) {
        BookInstance.find({'book': req.params.id }).exec(callback);
      },
  },function (err, results) {
       if (err) {return next(err);}
       if (results.book == null){
         var err = new Error('book not found');
         err.status = 404;
         return next(err);
       }
       res.render('books/book_detail',{title: results.book.title, book: results.book, book_instance: results.book_instance});
    });
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
      authors: function (callback) {
        Author.find().exec(callback);
      },
      genres: function (callback) {
        Genre.find().exec(callback);
      },
    },
    function (err, results) {
      if (err) { return next(err); }
        res.render('books/book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
};

// Handle book create on POST.
exports.book_create_post = [// Convert the genre to an array.
    (req, res, next) => {
        console.log((req.body.genre instanceof Array));
        if(!(req.body.genre instanceof Array)){
            console.log("sasfdsfsf");
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    validator.body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    validator.body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    validator.body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    validator.body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    validator.sanitizeBody('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
         console.log(req.body.genre);
        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    //looping all the genres
                    console.log(book.genre.indexOf(results.genres[i]._id));
                    //compare the index of genre with the selected ones
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('books/book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   req.flash('success', 'Flash is back!');
                   res.redirect(book.url);
                });
        }
    }];

// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    async.parallel({
      book: function (callback) {
        Book.findById(req.params.id).exec(callback);
      },
    },function deletebook(err, results) {
      if (err) { return next(err); }
      if (results.book==null) { // No results.
          var err = new Error('Book not found');
          err.status = 404;
          return next(err);
      }
      results.book.deleteOne({},function (err) {
         if (err) { return next(err); }
         BookInstance.deleteMany({'book': req.params.id},function (err) {
           if (err) { return next(err); }
           req.flash('success', "book deleted")
           res.redirect("/catalog/books")
         });
      });
    });
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
  // Get book, authors and genres for form.
 async.parallel({
     book: function(callback) {
         Book.findById(req.params.id).populate('author').exec(callback);
     },
     authors: function(callback) {
         Author.find(callback);
     },
     genres: function(callback) {
         Genre.find(callback);
     },
     }, function(err, results) {
         if (err) { return next(err); }
         if (results.book==null) { // No results.
             var err = new Error('Book not found');
             err.status = 404;
             return next(err);
         }
         // Success.
         // Mark our selected genres as checked.
         for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
             // for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
             //     if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
             //         results.genres[all_g_iter].checked='true';
             //     }
             // }
             console.log(results.book.genre.length);
             console.log(results.genres[all_g_iter]._id);
             console.log(results.book.genre);
             console.log(results.book.genre.indexOf(results.genres[all_g_iter]._id));
             if (results.book.genre.indexOf(results.genres[all_g_iter]._id) > -1) {
                 results.genres[all_g_iter].checked='true';
             }
         }
         res.render('books/book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
     });
};

// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
      console.log((req.body.genre instanceof Array));
      if(!(req.body.genre instanceof Array)){
          console.log("sasfdsfsf");
          if(typeof req.body.genre==='undefined')
          req.body.genre=[];
          else
          req.body.genre=new Array(req.body.genre);
      }
      next();
  },

  // Validate fields.
  validator.body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

  // Sanitize fields (using wildcard).
  validator.sanitizeBody('genre.*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validator.validationResult(req);
       console.log(req.body.genre);
      // Create a Book object with escaped and trimmed data.
      var book = new Book(
      { title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
        _id:req.params.id //This is required, or a new ID will be assigned!
       });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all authors and genres for form.
          async.parallel({
              authors: function(callback) {
                  Author.find(callback);
              },
              genres: function(callback) {
                  Genre.find(callback);
              },
          }, function(err, results) {
              if (err) { return next(err); }

              // Mark our selected genres as checked.
              for (let i = 0; i < results.genres.length; i++) {
                  //looping all the genres
                  console.log(book.genre.indexOf(results.genres[i]._id));
                  //compare the index of genre with the selected ones
                  if (book.genre.indexOf(results.genres[i]._id) > -1) {
                      results.genres[i].checked='true';
                  }
              }
              res.render('books/book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
          });
          return;
      }
      else {
          // Data from form is valid. Save book.
          Book.findByIdAndUpdate(req.params.id, book,{},function (err, thebook) {
              if (err) { return next(err); }
                 //successful - redirect to new book record.
                 req.flash('success', 'updated successful!');
                 res.redirect(thebook.url);
              });
      }
    }
];
