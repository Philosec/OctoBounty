//-------------------------------------
//CRUD
//-------------------------------------

function addNewBountyData (issueUrlId, userOpened, bountyAmount, failCallback) {
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

        let userOpenBountiesRef = database.ref('users').child(userOpened).child('open_bounties')
        userOpenBountiesRef.child(issueHashId).set(true)

        let userOwnedBountiesRef = database.ref('users').child(userOpened).child('owned_bounties')
        userOwnedBountiesRef.child(issueHashId).set(true)
      }
    })
}

function addProfileKeyValue (ghUsername, key, value) {
  if (value !== '') {
    let userPersonalInfoRef = database.ref('users').child(ghUsername).child('personal_info')
    userPersonalInfoRef.child(key).set(value)
  }
}

function addCardInfoKeyValue (ghUsername, key, value) {
  if (value !== '') {
    let userPersonalInfoRef = database.ref('users').child(ghUsername).child('card_info')
    userPersonalInfoRef.child(key).set(value)
  }
}

function removeOpenBounty (issueHashId) {
  let openBountiesRef = database.ref('open_bounties')
  openBountiesRef.child(issueHashId).remove()
}

function updateBountyOpenStatus (issueHashId, boolValue) {
  let bountiesRef = database.ref('bounties')
  bountiesRef.child(issueHashId).child('is_open').set(boolValue)
}

function addNewUserData (ghUsername) {
  let ref = database.ref('users')
  ref.once('value')
    .then(snapshot => {
      if (!snapshot.child(ghUsername).exists()) {
        let userRef = database.ref('users')
        userRef.child(ghUsername).set(true)
      }
    })
}

function addBountyClaim (ghUsername, issueHashId) {
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

function removeBountyClaim (ghUsername, issueHashId) {
  let claimedBountiesRef = database.ref('claimed_bounties')
  claimedBountiesRef.child(issueHashId).remove()
  let userClaimedBountiesRef = database.ref('users').child(ghUsername).child('claimed_bounties')
  userClaimedBountiesRef.child(issueHashId).remove()
}

function addClosedBounty (ghusername, issueHashId) {
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
        removeTrackBountyFromUser(claimerUsername, issueHashId)
        updateBountyOpenStatus(issueHashId, false)
      }
    })
}

function addTrackBountyToUser (ghUsername, issueHashId) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child('tracked_bounties')

  userTrackedBountiesRef.once('value')
    .then(snapshot => {
      if (!snapshot.child(issueHashId).exists()) {
        userTrackedBountiesRef.child(issueHashId).set(true)
      }
    })
}

function removeTrackBountyFromUser (ghUsername, issueHashId) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child('tracked_bounties')
  userTrackedBountiesRef.child(issueHashId).remove()
}

function removeOpenBountyFromUser (ghUsername, issueHashId) {
  let userOpenBountiesRef = database.ref('users').child(ghUsername).child('open_bounties')
  userOpenBountiesRef.child(issueHashId).remove()
}

//-------------------------------------
//CALLBACKS
//-------------------------------------

function onBountyTracked (ghUsername, issueHashId, successCallback, failCallback) {
  let userTrackedBountiesRef = database.ref('users').child(ghUsername).child('tracked_bounties')

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

function onCheckUserOwnsBounty (ghUsername, issueHashId, successCallback, failCallback) {
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

function onCheckUserClaimedBounty (ghUsername, issueHashId, successCallback, failCallback) {
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

function onClaimCanBeAwarded (ghUsername, issueHashId, successCallback, failCallback) {
  let claimedBountiesRef = database.ref('claimed_bounties')

  claimedBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        onCheckUserOwnsBounty(ghUsername, issueHashId, () => {
          if (successCallback) {
            successCallback(snapshot.child(issueHashId).child('username').val())
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

function onBountyActive (issueHashId, successCallback, failCallback) {
  let openBountiesRef = database.ref('open_bounties')
  openBountiesRef.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        if (successCallback) {
          successCallback()
        }
      } else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}

function onPersonalInfoExists (ghUsername, successCallback, failCallback) {
  let userPersonalInfoRef = database.ref('users').child(ghUsername).child('personal_info')
  userPersonalInfoRef.once('value')
    .then(userPersonalInfoSnapshot, () => {
      let exists = true
      if (!userPersonalInfoSnapshot.child('first_name').exists() || userPersonalInfoSnapshot.child('first_name').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('last_name').exists() || userPersonalInfoSnapshot.child('last_name').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('street_address').exists() || userPersonalInfoSnapshot.child('street_address').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('apt_suite').exists() || userPersonalInfoSnapshot.child('apt_suite').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('city').exists() || userPersonalInfoSnapshot.child('city').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('state').exists() || userPersonalInfoSnapshot.child('state').val() === '') {
        exists = false
      }
      if (!userPersonalInfoSnapshot.child('zip').exists() || userPersonalInfoSnapshot.child('zip').val() === '') {
        exists = false
      }
      if (exists) {
        if (successCallback) {
          successCallback()
        }
      } else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}

function onCardInfoExists (ghUsername, successCallback, failCallback) {
  let userCardInfoRef = database.ref('users').child(ghUsername).child('card_info')
  userCardInfoRef.once('value')
    .then(cardInfoSnapshot, () => {
      let exists = true
      if (!cardInfoSnapshot.child('name_on_card').exists() || cardInfoSnapshot.child('name_on_card').val() === '') {
        exists = false
      }
      if (!cardInfoSnapshot.child('card_number').exists() || cardInfoSnapshot.child('card_number').val() === '') {
        exists = false
      }
      if (!cardInfoSnapshot.child('exp_month').exists() || cardInfoSnapshot.child('exp_month').val() === '') {
        exists = false
      }
      if (!cardInfoSnapshot.child('exp_year').exists() || cardInfoSnapshot.child('exp_year').val() === '') {
        exists = false
      }
      if (!cardInfoSnapshot.child('csv').exists() || cardInfoSnapshot.child('csv').val() === '') {
        exists = false
      }
      if (exists) {
        if (successCallback) {
          successCallback()
        }
      } else {
        if (failCallback) {
          failCallback()
        }
      }
    })
}
//-------------------------------------
//Get Callbacks
//-------------------------------------

function getTotalUserOpenedBounties (ghUsername, callback) {
  let userOwnedBountiesRef = database.ref('users').child(ghUsername).child('owned_bounties')
  userOwnedBountiesRef.on('value', snapshot => {
    if (snapshot.val() === null) {
      if (callback) {
        callback(0)
      }
    }
    else {
      if (callback) {
        callback(Object.keys(snapshot.val()).length)
      }
    }
  })
}

function getTotalUserEarnedBounties (ghUsername, callback) {
  let userEarnedBountiesRef = database.ref('users').child(ghUsername).child('bounties_earned')
  userEarnedBountiesRef.on('value', snapshot => {
    if (snapshot.val() === null) {
      if (callback) {
        callback(0)
      }
    }
    else {
      if (callback) {
        callback(Object.keys(snapshot.val()).length)
      }
    }
  })
}

function getTotalAmountPaid (ghUsername, callback) {
  let userClosedBountiesRef = database.ref('users').child(ghUsername).child('closed_bounties')
  let bountiesRef = database.ref('bounties')

  userClosedBountiesRef.on('value', userClosedSnapshot => {
    if (userClosedSnapshot.val() === null) {
      if (callback) {
        callback(0)
      }
    }
    else {
      bountiesRef.once('value')
        .then(bountiesSnapshot => {
          let amountPaid = 0
          userClosedSnapshot.forEach(childUserEarnedSnapshot => {
            amountPaid += parseInt(bountiesSnapshot.child(childUserEarnedSnapshot.key).val().bounty_amount_posted)
          })

          if (callback) {
            callback(amountPaid)
          }
        })
    }
  })
}

function getTotalAmountEarned (ghUsername, callback) {
  let userEarnedBountiesRef = database.ref('users').child(ghUsername).child('bounties_earned')
  let bountiesRef = database.ref('bounties')

  userEarnedBountiesRef.on('value', userEarnedSnapshot => {
    if (userEarnedSnapshot.val() === null) {
      if (callback) {
        callback(0)
      }
    }
    else {
      bountiesRef.once('value')
        .then(bountiesSnapshot => {
          let amountPaid = 0
          userEarnedSnapshot.forEach(childUserEarnedSnapshot => {
            amountPaid += parseInt(bountiesSnapshot.child(childUserEarnedSnapshot.key).val().bounty_amount_posted)
          })

          if (callback) {
            callback(amountPaid)
          }
        })
    }
  })
}