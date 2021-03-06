const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookRentalSchema = new Schema ({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true
  },
  book_instance: {
    type: Schema.Types.ObjectId, ref: 'BookInstance', required: true
  },
  status: {
    type: String, required: true, enum: ['Loaned', 'Returned'], default: 'Loaned'
  },
  returnedAt: {
    type: Date
  }
},{
  timestamps: true
});

// Virtual for book's rental URL
BookRentalSchema
.virtual('url')
.get(function () {
  return '/catalog/bookrentals/' + this._id;
});
module.exports = mongoose.model('BookRental', BookRentalSchema);
