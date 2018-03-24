$().ready(() => {
  setupUserAuthentication()
  initBountyTables()
  initClickHandlers()
  setupUserStatCircles()
})

function setupUserStatCircles() {
  let ghUsername = window.localStorage.getItem('ghUsername')
  getTotalUserOpenedBounties(ghUsername, value => {
    $('.num-bounties-issued-circle').text(abbreviateNumber(value))
  })

  getTotalUserEarnedBounties(ghUsername, value => {
    $('.num-bounties-earned-circle').text(abbreviateNumber(value))
  })

  getTotalAmountPaid(ghUsername, value => {
    $('.amount-bounties-paid-circle').text(abbreviateNumber(value))
  })

  getTotalAmountEarned(ghUsername, value => {
    $('.amount-bounties-earned-circle').text(abbreviateNumber(value))
  })
}

function initClickHandlers () {
  //Issue link click handlers
  $(document).on('click', dbSelectors.bountyLink, event => {
    event.preventDefault()
    gotoBountyDetailPage(event.currentTarget)
  })

  //Button click handlers
  $(dbSelectors.btnNewBounty).on('click', event => {
    event.preventDefault()
    showNewBountyModal()
  })
}

function initBountyTables () {
  let username = window.localStorage.getItem('ghUsername')

  let userOpenBountiesRef = database.ref('users').child(username).child('open_bounties')
  let openBountiesRef = database.ref('open_bounties')
  setupBountyTable(userOpenBountiesRef, openBountiesRef, '.open-bounties-well')

  let userTeackedBountiesRef = database.ref('users').child(username).child('tracked_bounties')
  let allBountiesRef = database.ref('bounties')
  setupBountyTable(userTeackedBountiesRef, allBountiesRef, '.tracked-bounties-well')

  let userClaimedBountiesRef = database.ref('users').child(username).child('claimed_bounties')
  setupBountyTable(userClaimedBountiesRef, allBountiesRef, '.claimed-bounties-well')

  let userEarnedBountiesRef = database.ref('users').child(username).child('bounties_earned')
  setupBountyTable(userEarnedBountiesRef, allBountiesRef, '.earned-bounties-well')

  let userClosedBountiesRef = database.ref('users').child(username).child('closed_bounties')
  setupBountyTable(userClosedBountiesRef, allBountiesRef, '.paid-bounties-well')

  let claimedBountiesRef = database.ref('claimed_bounties')
  claimedBountiesRef.on('child_added', claimedSnapshot => {
    allBountiesRef.once('value')
      .then(bountiesSnapshot => {
        let loggedInUsername = window.localStorage.getItem('ghUsername')
        let isOwned = false
        bountiesSnapshot.forEach(childSnapshot => {
          if (childSnapshot.val().user_opened === loggedInUsername) {
            isOwned = true
          }
        })

        if (isOwned) {
          $('.nothing-here-row', '.waiting-approval-well').addClass('d-none')
          let hashId = claimedSnapshot.key
          let issueVal = bountiesSnapshot.child(hashId).val()
          let issueApiUrl = issueVal.issue_url

          $.get(issueApiUrl + getAuthTokenParameter(), issueResponse => {
            let commentApiUrl = issueResponse.comments_url + getAuthTokenParameter()
            $.get(commentApiUrl, commentsResponse => {
              let linkId = getIssueIdFromApiUrl(issueApiUrl)
              let bountyAmount = issueVal.bounty_amount_posted
              if ($('.waiting-approval-well').children('.issue-link-row').length <= 0) {
                appendNewLink('.waiting-approval-well', linkId, issueResponse.title, commentsResponse.length, bountyAmount, false, hashId)
              }
              else {
                appendNewLink('.waiting-approval-well', linkId, issueResponse.title, commentsResponse.length, bountyAmount, true, hashId)
              }
            })
          })
        }
      })
  })
  claimedBountiesRef.on('child_removed', claimedSnapshot => {
    let hashId = claimedSnapshot.key
    $('#' + hashId, appendSelector).remove()
    if ($('.waiting-approval-well').children('.issue-link-row').length <= 0) {
      $('.waiting-approval-well').children('.nothing-here-row').removeClass('d-none')
    }
  })
}

function setupBountyTable (userSubBountyRef, lookupRef, appendSelector) {
  userSubBountyRef.on('child_added', userSnapshot => {
    $('.nothing-here-row', appendSelector).addClass('d-none')
    lookupRef.once('value')
      .then(lookupRefSnapshot => {
        let hashId = userSnapshot.key
        let issueVal = lookupRefSnapshot.child(hashId).val()
        let issueApiUrl = issueVal.issue_url

        $.get(issueApiUrl + getAuthTokenParameter(), issueResponse => {
          let commentApiUrl = issueResponse.comments_url + getAuthTokenParameter()
          $.get(commentApiUrl, commentsResponse => {
            let linkId = getIssueIdFromApiUrl(issueApiUrl)
            let bountyAmount = issueVal.bounty_amount_posted
            if ($(appendSelector).children('.issue-link-row').length <= 0) {
              appendNewLink(appendSelector, linkId, issueResponse.title, commentsResponse.length, bountyAmount, false, hashId)
            }
            else {
              appendNewLink(appendSelector, linkId, issueResponse.title, commentsResponse.length, bountyAmount, true, hashId)
            }
          })
        })
      })
  })
  userSubBountyRef.on('child_removed', userSnapshot => {
    let hashId = userSnapshot.key
    $('#' + hashId, appendSelector).remove()
    if ($(appendSelector).children('.issue-link-row').length <= 0) {
      $(appendSelector).children('.nothing-here-row').removeClass('d-none')
    }
  })
}

function tryRenderEmptyTableMessages () {
  console.log('.tracked-bounties-well ' + $('.tracked-bounties-well').children('.issue-link-row').length)
  console.log('.open-bounties-well ' + $('.open-bounties-well').children('.issue-link-row').length)
  console.log('.claimed-bounties-well ' + $('.claimed-bounties-well').children('.issue-link-row').length)
  console.log('.earned-bounties-well ' + $('.earned-bounties-well').children('.issue-link-row').length)
  console.log('.paid-bounties-well ' + $('.paid-bounties-well').children('.issue-link-row').length)
}

function appendNewLink (parentSelector, linkId, issueTitle, commentCount, bountyAmount, useSeparator, hashId) {
  let $link = $('<a href="bounty-info.html" class="issue-text bounty-link" data-issue-id=' + linkId + '>').text(issueTitle)
  let $issueTitleCol = $('<div class="col-12 col-md-6 text-truncate my-auto">')
  let $commentCountCol = $('<div class="col-6 col-md-4 text-center comment-count my-auto">').text(commentCount + ' Comments')
  let $bountyAmountCol = $('<div class="col-6 col-md-2 text-center text-price my-auto">').text('$' + bountyAmount)
  let $row = $('<div class="row issue-link-row" id=' + hashId + '>')

  $($issueTitleCol).append($link)
  $($row).append($issueTitleCol)
  $($row).append($commentCountCol)
  $($row).append($bountyAmountCol)

  if (useSeparator) {
    $($row).addClass('top-border-gray')
  }

  $(parentSelector).append($row)
}

function gotoBountyDetailPage (linkTarget) {
  let issueId = $(linkTarget).data('issue-id')
  window.location = $(linkTarget).attr('href') + '?issueId=' + issueId
}

function showNewBountyModal () {
  swal({
    background: 'var(--dark)',
    html:
    '<h2 class="text-center text-light bounty-modal-title">Enter bounty information</h2>' +
    '<label for="issue-url-input" class="pt-3 text-light d-flex bounty-modal-label">Issue URL</label>' +
    '<input id="issue-url-input" class="swal2-input mt-1">' +
    '<label for="bounty-offered-input" class="text-light text-left d-flex bounty-modal-label">Bounty Offered <span class="text-success">&nbsp($)</span></label>' +
    '<input id="bounty-offered-input" class="swal2-input mt-1">',
    type: 'info',
    showCancelButton: true,
    confirmButtonText: 'Submit',
    showLoaderOnConfirm: true,
    focusConfirm: false,
    preConfirm: function () {
      return new Promise((resolve) => {
        let issueId = getIssueIdFromUrl($('#issue-url-input').val())
        let bountyOffered = $('#bounty-offered-input').val()
        let issueApiUrl = getFullIssueUrlFromId(issueId) + getAuthTokenParameter()

        if (isNaN(bountyOffered) || parseInt(bountyOffered) <= 0) {
          swal.showValidationError('Bounty offered must be greater than $0')
          resolve()
        }
        else {
          setTimeout(() => {
            //Validate and pass the api URL and show message on fail
            $.get(issueApiUrl, (response) => {
              resolve([issueId, bountyOffered])
            }).fail(() => {
              swal.showValidationError('Issue URL is not valid.')
              resolve()
            })
          }, 2000)
        }
      })
    },
    allowOutsideClick: () => !swal.isLoading()
  }).then(function (result) {
    if (result.value) {
      let username = window.localStorage.getItem('ghUsername')
      addNewBountyData(result.value[0], username, result.value[1], () => {
        swal({
          background: 'var(--dark)',
          html: '<h4 class="text-center text-light">Bounty already exists for that issue.</h4>',
          type: 'error',
          allowOutsideClick: false
        }).then(function (result) {
          showNewBountyModal()
        })
      })
    }
  }).catch(swal.noop)
}