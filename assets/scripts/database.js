//-------------------------------------
//CRUD
//-------------------------------------

function addNewBountyData(issueUrlId, userOpened, bountyAmount, failCallback) {
  let issueHashId = getHashFromIssueId(issueUrlId)
  let issuesRef = database.ref('bounties')

  issuesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        failCallback()
      }
      else {
        issuesRef.child(issueHashId).set({
          user_opened: userOpened,
          issue_url: getFullIssueUrlFromId(issueUrlId),
          bounty_amount_posted: bountyAmount,
          is_open: true
        })

        let openIssuesRef = database.ref('open_bounties')
        openIssuesRef.child(issueHashId).set({
          user_opened: userOpened,
          issue_url: getFullIssueUrlFromId(issueUrlId),
          bounty_amount_posted: bountyAmount
        })

        let userOpenBountiesRef = database.ref('users').child(userOpened).child("open_bounties");
        userOpenBountiesRef.child(issueHashId).set(true)

        let userOwnedBountiesRef = database.ref('users').child(userOpened).child("owned_bounties");
        userOwnedBountiesRef.child(issueHashId).set(true)
      }
    })
}

function removeOpenBounty(issueHashId) {
  let openBountiesRef = database.ref('open_bounties')
  openBountiesRef.child(issueHashId).remove()
}

function updateBountyOpenStatus(issueHashId, boolValue) {
  let bountiesRef = database.ref('bounties')
  bountiesRef.child(issueHashId).child('is_open').set(boolValue)
}

function addNewUserData(ghUsername) {
  let ref = database.ref('users')
  ref.once('value')
    .then(snapshot => {
      if (!snapshot.child(ghUsername).exists()) {
        let userRef = database.ref('users')
        userRef.child(ghUsername).set(true)
      }
    })
}

function addBountyClaim(ghUsername, issueHashId) {
  let claimedBountiesRef = database.ref('claimed_bounties')
  claimedBountiesRef.once('value')
    .then(snapshot => {
      if (!snapshot.child(issueHashId).exists()) {
        claimedBountiesRef.child(issueHashId).set({
          username: ghUsername
        })
      }
    })

  let userClaimedBountiesRef = database.ref('users').child(ghUsername).child('claimed_bounties')
  userClaimedBountiesRef.once('value')
    .then(snapshot => {
      if (!snapshot.child(issueHashId).exists()) {
        userClaimedBountiesRef.child(issueHashId).set(true)
      }
    })
}

function removeBountyClaim(ghUsername, issueHashId) {
  let claimedBountiesRef = database.ref('claimed_bounties')
  claimedBountiesRef.child(issueHashId).remove()
  let userClaimedBountiesRef = database.ref('users').child(ghUsername).child('claimed_bounties')
  userClaimedBountiesRef.child(issueHashId).remove()
}

function addClosedBounty(ghusername, issueHashId) {
  let closedBountiesRef = database.ref('closed_bounties')
  let claimedBountiesRef = database.ref('claimed_bounties')
  let claimerUsername = ''

  claimedBountiesRef.once('value')
    .then(claimedSnapshot => {
      if (claimedSnapshot.child(issueHashId).exists()) {
        claimerUsername = claimedSnapshot.child(issueHashId).child('username').val()

        closedBountiesRef.once('value')
          .then(closedSnapshot => {
            if (!closedSnapshot.child(issueHashId).exists()) {
              closedBountiesRef.child(issueHashId).set({
                claimed_by: claimerUsername
              })
            }
          })

        let userclosedBountiesRef = database.ref('users').child(ghusername).child('closed_bounties')
        userclosedBountiesRef.once('value')
          .then(snapshot => {
            if (!snapshot.child(issueHashId).exists()) {
              userclosedBountiesRef.child(issueHashId).set(true)
            }
          })

        let userBountiesEarnedRef = database.ref('users').child(claimerUsername).child('bounties_earned')
        userBountiesEarnedRef.once('value')
          .then(snapshot => {
            if (!snapshot.child(issueHashId).exists()) {
              userBountiesEarnedRef.child(issueHashId).set(true)
            }
          })

        removeBountyClaim(claimerUsername, issueHashId)
        removeOpenBountyFromUser(ghusername, issueHashId)
        removeOpenBounty(issueHashId)
        updateBountyOpenStatus(issueHashId, false)
      }
    })
}

function addTrackBountyToUser(ghUsername, issueHashId) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child("tracked_bounties");

  userTrackedBountiesRef.once('value')
    .then(snapshot => {
      if (!snapshot.child(issueHashId).exists()) {
        userTrackedBountiesRef.child(issueHashId).set(true)
      }
    })
}

function removeTrackBountyFromUser(ghUsername, issueHashId) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child("tracked_bounties");
  userTrackedBountiesRef.child(issueHashId).remove()
}

function removeOpenBountyFromUser(ghUsername, issueHashId) {
  let userOpenBountiesRef = database.ref('users').child(ghUsername).child('open_bounties')
  userOpenBountiesRef.child(issueHashId).remove()
}


//-------------------------------------
//CALLBACKS
//-------------------------------------

function onBountyTracked(ghUsername, issueHashId, successCallback, failCallback) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child("tracked_bounties");

  userTrackedBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        if (successCallback) {
          successCallback()
        }
      }
      else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}

function onCheckUserOwnsBounty(ghUsername, issueHashId, successCallback, failCallback) {
  let userOwnedBountiesRef = database.ref('users').child(ghUsername).child('owned_bounties')

  userOwnedBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        if (successCallback) {
          successCallback()
        }
      }
      else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}

function onCheckUserClaimedBounty(ghUsername, issueHashId, successCallback, failCallback) {
  let userClaimedBountiesRef = database.ref('users').child(ghUsername).child('claimed_bounties')

  userClaimedBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        if (successCallback) {
          successCallback()
        }
      }
      else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}

function onClaimCanBeAwarded(ghUsername, issueHashId, successCallback, failCallback) {
  let claimedBountiesRef = database.ref('claimed_bounties')

  claimedBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        onCheckUserOwnsBounty(ghUsername, issueHashId, () => {
          if (successCallback) {
            successCallback()
          }
        })
      }
      else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}