var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var User = require('../models/user');
var BookRental = require('../models/book_rental');
var date = require('date-and-time');

const paginate = require('express-paginate');
var async = require('async');


exports.create = async function (req, res, next) {
try{
  var book_instance = await BookInstance.findById(req.params.id);
  if (book_instance.status == "Available"){
    var rent_book = new BookRental({
      user: req.user,
      book_instance: book_instance
    });
    rent_book.save(function (err) {
      if (err) { return next(err); }
      current_date = new Date();
      book_instance.due_back = date.addDays(current_date, 5);
      book_instance.status = "Loaned";
      console.log(book_instance);
      book_instance.save(function (err) {
        if (err) { return next(err); }
      })
      req.flash('success', "book loaned")
      res.redirect('/catalog/book/'+ book_instance.book);
    });
  }
  else {
    req.flash('danger', "book not found")
    res.redirect('/catalog/book/'+ book_instance.book);
  }
}catch (err) {
      next(err);
    }
};


exports.index = async function (req, res, next) {
  try {
    console.log(req.user);
    var rentals = await BookRental.find({user: req.user}).populate({
      path: 'book_instance', populate: { path: 'book', populate:{ path: 'author'} }})
    .populate('user').limit(req.query.limit).skip(req.skip).exec();
    var rentals_count = rentals.length;
    const pageCount = Math.ceil(rentals_count / req.query.limit);
    var currentPage = req.query.page;
     return res.render('book_rentals/index',{title: "rental list", book_rentals: rentals, pageCount: pageCount,
          currentPage,
          pages: paginate.getArrayPages(req)(2, pageCount, req.query.page)});
  } catch (err) {
      next(err);
  }
};
