$().ready(() => {
  setupUserAuthentication()

  $(document).on('click', dbSelectors.bountyLink, event => {
    event.preventDefault()
    let issueId = $(event.currentTarget).data('issue-id')
    window.location = $(event.currentTarget).attr('href') + '?issueId=' + issueId
  })

  let openBountiesRef = database.ref('open_bounties')
  let allBountiesRef = database.ref('bounties')

  openBountiesRef.on('child_added', openBountiesSnapshot => {
    allBountiesRef.once('value')
      .then(allBountiesSnapshot => {
        let hashId = openBountiesSnapshot.key
        let issueVal = allBountiesSnapshot.child(hashId).val()
        let issueApiUrl = issueVal.issue_url

        $.get(issueApiUrl + getAuthTokenParameter(), issueResponse => {
          let commentApiUrl = issueResponse.comments_url + getAuthTokenParameter()
          $.get(commentApiUrl, commentsResponse => {
            let linkId = getIssueIdFromApiUrl(issueApiUrl)
            let bountyAmount = issueVal.bounty_amount_posted
            appendNewSearchLink('.search-bounties-well', linkId, issueResponse.title, commentsResponse.length, bountyAmount, hashId)
          })
        })
      })
  })
})

function appendNewSearchLink (parentSelector, linkId, issueTitle, commentCount, bountyAmount, hashId) {
  let $link = $('<a href="bounty-info.html" class="issue-text bounty-link" data-issue-id=' + linkId + '>').text(issueTitle)
  let $issueTitleCol = $('<div class="col-12 col-md-6 text-truncate my-auto">')
  let $commentCountCol = $('<div class="col-6 col-md-4 text-center comment-count my-auto">').text(commentCount + ' Comments')
  let $bountyAmountCol = $('<div class="col-6 col-md-2 text-center text-price my-auto">').text('$' + bountyAmount)
  let $row = $('<div class="row issue-link-row" id=' + hashId + '>')

  $($issueTitleCol).append($link)
  $($row).append($issueTitleCol)
  $($row).append($commentCountCol)
  $($row).append($bountyAmountCol)
  $($row).addClass('top-border-gray')

  $(parentSelector).append($row)
}