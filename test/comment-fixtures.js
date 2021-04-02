function makeCommentArray() {
  return [
    {
      id: 1,
      nickname: 'Test Nickname 1',
      user_location: 'Seattle, WA',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text',
      category: 'expression'
    },
    {
      id: 2,
      nickname: 'Test Nickname 2',
      user_location: 'Cleveland, OH',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 2',
      category: 'release'
    },
    {
      id: 3,
      nickname: 'Test Nickname 3',
      user_location: 'Denver, CO',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 3',
      category: 'rejoice'
    },
    {
      id: 4,
      nickname: 'Test Nickname 4',
      user_location: 'Miami, FL',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 4',
      category: 'embrace'
    },
  ]
}

function makeMaliciousComment() {
  const maliciousComment = {
    id: 911,
    nickname: 'Test nickname with script <script>alert("xss");</script>',
    user_location: 'Test location <script>alert("xss");</script>',
    date_posted: new Date().toISOString(),
    content: 'Bad image in content <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. More <strong>content</strong>',
    category: 'expression'
  }

  const expectedComment = {
    ...maliciousComment,
    nickname: 'Test nickname with script &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    user_location: 'Test location &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: 'Bad image in content <img src="https://url.to.file.which/does-not.exist">. More <strong>content</strong>'
  }

  return {
    maliciousComment,
    expectedComment
  }
}

module.exports = {
  makeCommentArray,
  makeMaliciousComment
}