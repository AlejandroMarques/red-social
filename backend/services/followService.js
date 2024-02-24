const Follow = require('../schemas/Follow');
const {checkDocumentExistance} = require('../helper');

const followUserIds = async (identityUserId) => {
  const followingFilter = {"user": identityUserId}
  const followingSelect = {'followed': 1, '_id': 0}
  const following = await checkDocumentExistance(Follow, followingFilter, followingSelect)
  const formattedFollowing = []
  following.docs.forEach((follow) => formattedFollowing.push(follow.followed))

  const followersFilter = {"followed": identityUserId}
  const followersSelect = {'user': 1, '_id': 0}
  const followers = await checkDocumentExistance(Follow, followersFilter, followersSelect)
  const formattedFollowers = []
  followers.docs.forEach((follow) => formattedFollowers.push(follow.user))
  
  return {following: formattedFollowing, followers: formattedFollowers}
}

const userFollowsMe = async (identityUserId, profileUserId) => {
  const followingFilter = {"user": identityUserId, "followed": profileUserId}
  const following = await checkDocumentExistance(Follow, followingFilter)

  const followersFilter = {'user': profileUserId, "followed": identityUserId}
  const followers = await checkDocumentExistance(Follow, followersFilter)

  return {following: following.docs[0], follower: followers.docs[0]}
}

const userFollowInfo = async (req, model, property, populatePath, populateOpts) => {
  return new Promise ((resolve, reject) => {
    const userID = req.params.id? req.params.id : req.user.id;
    const page = req.params.page ? req.params.page : 1;
    const itemsPerPage = 5;
    
    model.find({[property]: userID}).populate(populatePath, populateOpts).paginate(page, itemsPerPage).then(async (follows) => {
      if (!follows) reject({status: 'error', message : 'No follows!'});
      const total = await model.countDocuments({[property]: userID}).exec()
      const myFollows = await followUserIds(req.user.id);
      resolve({status: 'success', message : 'followers!', user_following: myFollows.following, user_follow_me: myFollows.followers, follows, total, pages: Math.ceil(total/itemsPerPage) });
    })
  })
}

module.exports = {
  followUserIds,
  userFollowsMe,
  userFollowInfo
}