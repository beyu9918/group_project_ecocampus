const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../data/items.json');
const reviewsPath = path.join(__dirname, '../data/reviews.json');
const usersPath = path.join(__dirname, '../data/users.json');

//reviews
exports.getItemDetails = (req, res) => {
  const itemId = parseInt(req.params.id);
  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
  const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  const item = items.find(i => i.id === itemId);
  const itemReviews = reviews.filter(r => r.itemId === itemId);
  const seller = users.find(u => u.id === item?.sellerId);

  res.render('item', {
    item,
    reviews: itemReviews,
    seller,
    user: req.user
  });
};

// submit review
exports.submitReview = (req, res) => {
  const itemId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));

  // limit one time
  const existing = reviews.find(r => r.itemId === itemId && r.reviewerId === req.user.id);
  if (existing) {
    return res.status(400).send('You already submitted a review.');
  }

  const newReview = {
    id: Date.now(),
    itemId,
    reviewerId: req.user.id,
    rating: parseInt(rating),
    comment,
    createTime: new Date().toISOString()
  };

  reviews.push(newReview);
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2), 'utf-8');

  
  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
  const item = items.find(i => i.id === itemId);
  const related = reviews.filter(r => r.itemId === itemId);
  item.avgRating = (related.reduce((sum, r) => sum + r.rating, 0) / related.length).toFixed(1);
  fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf-8');

  res.redirect('/item/' + itemId);
};
