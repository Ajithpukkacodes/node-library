var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const validator = require('express-validator')

var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    BookInstance.find({}).populate('book').exec(function (err, instance_list) {
      res.render('book_instances/bookinstance_list',{ title: 'bookinstance_list', instance_list: instance_list});
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    async.parallel({
      book_instance: function (callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      },
    },function (err, results) {
       if (err) { return next(err);}
       if (results == null) {
          var err = new Error("BookInstance not found");
          return next(err);
       }
       res.render('book_instances/bookinstance_detail', { title: "Copy:" + results.book_instance.book.title, book_instance: results.book_instance});
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({},'title').exec(function (err, books) {
      if (err) {
        return next(err);
      }
      res.render('book_instances/bookinstance_form',{title: "create book instance", book_list: books});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
   validator.body('book', 'book must be specified').trim().isLength({min: 1}),
   validator.body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
   validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

   // Sanitize fields.
   validator.sanitizeBody('book').escape(),
   validator.sanitizeBody('imprint').escape(),
   validator.sanitizeBody('status').trim().escape(),
   validator.sanitizeBody('due_back').toDate(),

   (req, res, next) => {
     const errors = validator.validationResult(req);

     var bookinstance = new BookInstance(
     { book: req.body.book,
       imprint: req.body.imprint,
       status: req.body.status,
       due_back: req.body.due_back
     });

     if (!errors.isEmpty()) {
       Book.find({},'title').exec(function (err, books) {
         if (err) {
           return next(err);
         }
         res.render('book_instances/bookinstance_form',{title: "create book instance", book_list: books, errors: errors.array(), selected_book: bookinstance.book, book_instance: book_instance});
       });
       return;
     }
     else {
       bookinstance.save(function (err) {
        if (err) { return next(err); }
           // Successful - redirect to new record.
           res.redirect(bookinstance.url);
        });
     }
   }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
