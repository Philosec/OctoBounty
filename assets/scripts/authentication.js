function setupUserAuthentication () {
  let activeUser = null

  firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
      let token = result.credential.accessToken
      window.localStorage.setItem('ghAuthToken', token)
      let ghUsername = result.additionalUserInfo.username.toLowerCase()
      window.localStorage.setItem('ghUsername', ghUsername)
      addNewUserData(ghUsername)
    }
  }).catch(function (error) {
    let errorCode = error.code
    let errorMessage = error.message
    let email = error.email
    let credential = error.credential

    console.log(errorCode + ' ' + errorMessage + ' ' + email + ' ' + credential)
  })

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      activeUser = user
      $('#btn-profile').html('<img src="' + activeUser.photoURL + '" class="rounded-circle">')
      $('.display-name').text(window.localStorage.getItem('ghUsername'))
    }
  })

  //Profile button handler
  $('#btn-profile').on('click', event => {
    event.preventDefault()

    if (activeUser === null) {
      let provider = new firebase.auth.GithubAuthProvider()
      firebase.auth().signInWithRedirect(provider)
    }else {
      window.location = "profile.html"
    }
  })
}