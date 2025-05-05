import eventBus from './eventBus.js';
// In-memory follow map: sellerId -> Set of followerIds
const followersMap = new Map();

export function followSeller(req, res) {
  const { userId, sellerId } = req.body;
  if (!userId)   return res.status(400).json({ error: 'userId is required' });
  if (!sellerId) return res.status(400).json({ error: 'sellerId is required' });

  if (!followersMap.has(sellerId)) followersMap.set(sellerId, new Set());
  followersMap.get(sellerId).add(userId);

  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Australia/Sydney' });
  eventBus.emit('newFollower', { sellerId, userId, timestamp });
  res.status(200).json({ sellerId, followers: Array.from(followersMap.get(sellerId)) });
}

export function shareListing(req, res) {
  const { userId, listingId } = req.body;
  if (!userId)    return res.status(400).json({ error: 'userId is required' });
  if (!listingId) return res.status(400).json({ error: 'listingId is required' });

  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Australia/Sydney' });
  eventBus.emit('listingShared', { userId, listingId, timestamp });
  res.status(200).json({ listingId, sharedBy: userId, timestamp });
}