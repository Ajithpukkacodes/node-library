const Author = require('../models/author');
const Book = require('../models/book');
var BookInstance = require('../models/bookinstance');
const async = require('async');
const validator = require('express-validator');

// Display list of all Authors.
exports.author_list = function(req, res, next) {

    Author.find().sort([['family_name', 'ascending']]).exec(function (err, author_list) {
     if (err) {return next(err);}
     res.render('authors/author_list', {title: 'Authors list', author_list: author_list});
   });
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    async.parallel({
      author: function(callback){
        Author.findById(req.params.id).exec(callback);
      },
      author_books: function(callback){
        Book.find({'author': req.params.id}).exec(callback);
      },
    },
  function (err, results) {
    if (err) { return next(err);}
    if (results.author == null){
      var err = new Error('author not found');
      return next(err);
    }
    res.render('authors/author_detail',{title: results.author.name, author: results.author, author_books: results.author_books});
  });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('authors/author_form', {title: 'Create author'});
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate fields.
    validator.body('first_name','First name must be specified.').isLength({ min: 1 }).trim().isAlpha().withMessage('First name has non-alphanumeric characters.'),
    validator.body('family_name').isLength({min: 1}).trim().withMessage('Family_name must be specified').isAlphanumeric().withMessage('Family_name must be non-alphanumeric'),
    validator.body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    validator.body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
  // Sanitize fields.
    validator.sanitizeBody('first_name').escape(),
    validator.sanitizeBody('family_name').escape(),
    validator.sanitizeBody('date_of_birth').toDate(),
    validator.sanitizeBody('date_of_death').toDate(),

  (req, res, next) => {
    var errors = validator.validationResult(req);

    if (!errors.isEmpty()){
      res.render('authors/author_form',{title: 'create author form', author: req.body, errors: errors.array()});
      return;
    }
    else {
      Author.findOne({'first_name': req.body.first_name, 'family_name': req.body.family_name}).exec(function (err, found_author) {
        if (err) {
          return next(err);
        }
        if (found_author){
          res.redirect(found_author.url);
        }
        else {
          var author = new Author(
            {
              first_name: req.body.first_name,
              family_name: req.body.family_name,
              date_of_birth: req.body.date_of_birth,
              date_of_death: req.body.date_of_death
            }
          );
          author.save(function (err) {
            if (err) { return next(err); }
            // Successful - redirect to new author record.
             res.redirect(author.url);
          });
      }
    });
    }
  }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
  async.parallel({
     author: function(callback) {
       Author.findById(req.params.id).exec(callback)
     },
     authors_books: function(callback) {
       Book.find({ 'author': req.params.id }).exec(callback)
     },
 }, function(err, results) {
     if (err) { return next(err); }
     // Success
     if (results.authors_books.length > 0) {
         // Author has books. Render in same way as for GET route.
           results.author.deleteOne({},function (err) {
             if (err) { return next(err); }
             for (let book of results.authors_books){
               book.deleteOne({},function () {
                 console.log("book is deleted");
                 BookInstance.deleteMany({'book': book.id},function (err) {
                   if (err) { return next(err); }
                   console.log("bookinstance is deleted");
                 });
               });
             }
           });
         res.redirect("/catalog/authors");
         // res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
         // return;
     }
     else {
         // Author has no books. Delete object and redirect to the list of authors.
         Author.findByIdAndRemove(req.params.id, function deleteAuthor(err) {
             if (err) { return next(err); }
             // Success - go to author list
             res.redirect('/catalog/authors');
         })
     }
 });
    // res.send(req.params);
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
res.send("not IMPLEMENTED");
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
