$().ready(() => {
  setupUserAuthentication()

  $('.nothing-here-row', '.tracked-bounties-well').removeClass('d-none')
  $('.nothing-here-row', '.open-bounties-well').removeClass('d-none')
  $('.nothing-here-row', '.claimed-bounties-well').removeClass('d-none')
  $('.nothing-here-row', '.earned-bounties-well').removeClass('d-none')
  $('.nothing-here-row', '.paid-bounties-well').removeClass('d-none')

  let username = window.localStorage.getItem('ghUsername')

  let userOpenBountiesRef = database.ref('users').child(username).child('open_bounties')
  let openBountiesRef = database.ref('open_bounties')
  setupBountyTable(userOpenBountiesRef, openBountiesRef, '.open-bounties-well')

  let userTeackedBountiesRef = database.ref('users').child(username).child('tracked_bounties')
  let allBountiesRef = database.ref('bounties')
  setupBountyTable(userTeackedBountiesRef, allBountiesRef, '.tracked-bounties-well')

  let userClaimedBountiesRef = database.ref('users').child(username).child('claimed_bounties')
  setupBountyTable(userClaimedBountiesRef, allBountiesRef, '.claimed-bounties-well')

  let userEarnedBountiesRef = database.ref('users').child(username).child('earned_bounties')
  setupBountyTable(userEarnedBountiesRef, allBountiesRef, '.earned-bounties-well')

  let userClosedBountiesRef = database.ref('users').child(username).child('closed_bounties')
  setupBountyTable(userClosedBountiesRef, allBountiesRef, '.paid-bounties-well')

  //Issue link click handlers
  $(document).on('click', dbSelectors.bountyLink, event => {
    event.preventDefault()
    gotoBountyDetailPage(event.currentTarget)
  })

  $(dbSelectors.btnNewBounty).on('click', event => {
    event.preventDefault()
    showNewBountyModal()
  })
})

function setupUserAuthentication() {
  let activeUser = null

  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      let token = result.credential.accessToken;
      window.localStorage.setItem('ghAuthToken', token)
      let ghUsername = result.additionalUserInfo.username.toLowerCase()
      window.localStorage.setItem('ghUsername', ghUsername)
      addNewUserData(ghUsername)
    }
  }).catch(function(error) {
    let errorCode = error.code;
    let errorMessage = error.message;
    let email = error.email;
    let credential = error.credential;

    console.log(errorCode + " " + errorMessage + " " + email + " " + credential)
  })

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      activeUser = user
      $('#btn-profile').html('<img src="' + activeUser.photoURL + '" class="rounded-circle">')
    }
  })

  //Profile button handler
  $('#btn-profile').on('click', event => {
    event.preventDefault()

    if (activeUser === null) {
      let provider = new firebase.auth.GithubAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  })
}

function setupBountyTable(userSubBountyRef, lookupRef, appendSelector) {
  userSubBountyRef.on('child_added', userSnapshot => {
    $('.nothing-here-row', appendSelector).addClass('d-none')
    lookupRef.once('value')
      .then(openBountiesSnapshot => {
        let hashId = userSnapshot.key
        let issueVal = openBountiesSnapshot.child(hashId).val()
        let issueApiUrl = issueVal.issue_url

        $.get(issueApiUrl + getAuthTokenParameter(), issueResponse => {
          let commentApiUrl = issueResponse.comments_url + getAuthTokenParameter()
          $.get(commentApiUrl, commentsResponse => {
            let linkId = getIssueIdFromApiUrl(issueApiUrl)
            let bountyAmount = issueVal.bounty_amount_posted
            if ($(appendSelector).children().length <= 1) {
              appendNewLink(appendSelector, linkId, issueResponse.title, commentsResponse.length, bountyAmount, false)
            }
            else {
              appendNewLink(appendSelector, linkId, issueResponse.title, commentsResponse.length, bountyAmount, true)
            }
          })
        })
      })
  })
}

function appendNewLink(parentSelector, linkId, issueTitle, commentCount, bountyAmount, useSeparator) {
  let $link = $('<a href="bounty-info.html" class="issue-text bounty-link" data-issue-id=' + linkId + '>').text(issueTitle)
  let $issueTitleCol = $('<div class="col-12 col-md-6 text-truncate my-auto">')
  let $commentCountCol = $('<div class="col-6 col-md-4 text-center comment-count my-auto">').text(commentCount + ' Comments')
  let $bountyAmountCol = $('<div class="col-6 col-md-2 text-center text-price my-auto">').text('$' + bountyAmount)
  let $row = $('<div class="row">')
  let $separator = $('<hr class="bg-gray">')

  $($issueTitleCol).append($link)
  $($row).append($issueTitleCol)
  $($row).append($commentCountCol)
  $($row).append($bountyAmountCol)

  if (useSeparator) {
    $(parentSelector).append($separator)
  }

  $(parentSelector).append($row)
}

function gotoBountyDetailPage(linkTarget) {
  let issueId = $(linkTarget).data('issue-id');
  window.location = $(linkTarget).attr('href') + '?issueId=' + issueId
}

function showNewBountyModal() {
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