import eventBus from './eventBus.js';
// in-memory follow map: sellerId -> Set of followerIds
const followersMap=new Map();
export function followSeller(req,res){
  const { userId,sellerId }=req.body;
  if(!followersMap.has(sellerId))followersMap.set(sellerId,new Set());
  followersMap.get(sellerId).add(userId);
  eventBus.emit('newFollower',{sellerId,userId,timestamp:new Date().toLocaleTimeString('en-GB',{hour12:false,timeZone:'Australia/Sydney'})});
  res.status(200).json({sellerId,followers:Array.from(followersMap.get(sellerId))});
}
export function shareListing(req,res){
  const { userId,listingId }=req.body;
  const ts=new Date().toLocaleTimeString('en-GB',{hour12:false,timeZone:'Australia/Sydney'});
  eventBus.emit('listingShared',{userId,listingId,timestamp:ts});
  res.status(200).json({listingId,sharedBy:userId,timestamp:ts});
}