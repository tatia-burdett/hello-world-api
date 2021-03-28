function makeCommentArray() {
  return [
    {
      id: 1,
      nickname: 'Test Nickname 1',
      user_location: 'Seattle, WA',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text'
    },
    {
      id: 2,
      nickname: 'Test Nickname 2',
      user_location: 'Cleveland, OH',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 2'
    },
    {
      id: 3,
      nickname: 'Test Nickname 3',
      user_location: 'Denver, CO',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 3'
    },
    {
      id: 4,
      nickname: 'Test Nickname 4',
      user_location: 'Miami, FL',
      date_posted: '2100-05-22T16:28:32.615Z',
      content: 'Hello world sample text number 4'
    },
  ]
}

module.exports = {
  makeCommentArray
}