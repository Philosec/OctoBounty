function writeNewBountyData(issueUrlId, userOpened, bountyAmount, failCallback) {

  console.log(issueUrlId + " " + userOpened + " " + bountyAmount)

  var issueHashId = getHashFromIssueId(issueUrlId)
  var issuesRef = database.ref('bounties')

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

        var openIssuesRef = database.ref('open_bounties')
        openIssuesRef.child(issueHashId).set({
          user_opened: userOpened,
          issue_url: getFullIssueUrlFromId(issueUrlId),
          bounty_amount_posted: bountyAmount
        })

        var userOpenBountiesRef = database.ref('users').child(userOpened).child("open_bounties");
        userOpenBountiesRef.child(issueHashId).set(true)
      }
    })
}

function writeNewUserData(ghUsername) {
  var ref = database.ref('users')

  ref.once('value')
    .then(snapshot => {
      if (snapshot.child(ghUsername).exists()) {
        return
      }
      else {
        var userRef = database.ref('users')
        userRef.child(ghUsername).set(true)
      }
    })
}

// function getIssueIdFromHashId(hashId, callback) {
//   database.ref('bounties').child(hashId).once('value')
//     .then(snapshot => {
//       var sv = snapshot.val()
//       var issueUrl = sv.issue_url
//       callback('.open-bounties-well', getIssueIdFromApiUrl(issueUrl))
//     })
// }