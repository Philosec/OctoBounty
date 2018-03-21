$().ready(() => {
  var issueId = getParameterByName('issueId')
  var issueJSON = {}

  let apiUrl = ghRepoApiUrl + issueId

  $.get(apiUrl, (response) => {
    populateIssueDetails(response, issueId)
  })
})

function populateIssueDetails(issueJSON, issueId) {
  $(biSelectors.bountyTitle).text(issueJSON.title)
  $(biSelectors.issueIdHeader).text(issueId)

  var descriptionHTML = converter.makeHtml(issueJSON.body)
  $(biSelectors.issueDescription).html(descriptionHTML)
  $.get(issueJSON.comments_url, (response) => {
    $.each(response, (index, value) => {
      var $img = $('<img>').attr('src', value.user.avatar_url)
      console.log($img)
      var $mediaBody = $('<div>').addClass('media-body container')
      var $mediaHeader = $('<div>').addClass('media-heading').text(value.user.login + ' commented on ' + value.updated_at)
      var $mediaBodyContent = converter.makeHtml(value.body)
      $mediaBody.append($mediaHeader)
      $mediaBody.append($mediaBodyContent)
      var $commentHTML = $('<div>').attr('class', 'media')
      $commentHTML.append($img)
      $commentHTML.append($mediaBody)


      $('.comment-container').append($commentHTML)
    })
  })
}