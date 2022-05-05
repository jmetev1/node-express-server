const axios = require('axios')
const url = 'http://localhost:3000/'

test('the data is peanut butter', () => {
  let userId;
  return axios.get(url + 'random_user').then(({ data: user }) => {
    userId = user.userId;
    return axios.post(url + 'delete', { userId })
      .then(({ data }) => {
        console.log({ data })
        expect(data).toBe('deleted');
        return axios.get(url + 'user/' + userId).then(({ data: all }) => {
          const { chatIds } = all;
          console.log({ chatIds })
          expect(chatIds.length).toBe(0)
        })
      })
  })
})
test('in common', () => {
  let userId;
  return axios.get(url + 'all_users').then(({ data: users }) => {
    console.log({ users })
    const { userId: user1 } = users[0]
    const { userId: user2 } = users[1]
    const oneUrl = url + `chatoverlap?user1=${user1}&user2=${user2}`;
    console.log({ oneUrl })
    return axios.get(oneUrl)
      .then(({ data }) => {
        console.log({ user1, user2, data })
      })
  })
})