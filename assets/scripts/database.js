function writeNewIssueData(issueUrlId, userOpened, bountyAmount, failCallback) {
  var issueHashId = getHashFromIssueId(issueUrlId)
  var ref = database.ref('issues')

  ref.once('value')
    .then(snapshot => {
      if (snapshot.child(issueHashId).exists()) {
        failCallback()
      }
      else {
        database.ref('issues/' + issueHashId).set({
          user_opened: userOpened,
          issue_url: getFullIssueUrlFromId(issueUrlId),
          bounty_amount_posted: bountyAmount,
          is_open: true
        })

        database.ref('open_issues/' + issueHashId).set({
          user_opened: userOpened,
          issue_url: getFullIssueUrlFromId(issueUrlId),
          bounty_amount_posted: bountyAmount
        })
      }
    })
}