$().ready(() => {
  var issueJSON = JSON.parse(window.localStorage.getItem(saveVars.issueJson))
  $(biSelectors.bountyTitle).text(issueJSON.title)
  var issueId = issueJSON.url.replace('https://api.github.com/repos/', '')
  $(biSelectors.issueIdHeader).text(issueId)

  var converter = new showdown.Converter()
  var descriptionHTML = converter.makeHtml(issueJSON.body)

  $(biSelectors.issueDescription).html(descriptionHTML)

  $.get(issueJSON.comments_url, (response) => {
    $.each(response, (index, value) => {
      var $img = $('<img>').addClass('mr-3').attr('src', value.avatar_url)
      var $mediaBody = $('<div>').addClass('media-body')
      var $mediaHeader = $('<div>').addClass('media-heading').text(value.login + ' commented on ' + value.updated_at)
      var $mediaBodyContent = converter.makeHtml(value.body)
      var $commentHTML = $('<div>').attr('class', 'media')
        .append($($img).html())
        .append($mediaBody).text($mediaHeader + $mediaBodyContent)

      console.log($commentHTML)

      $('.comment-container').append($commentHTML)
    })
  })
})