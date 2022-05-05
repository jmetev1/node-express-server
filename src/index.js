import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import axios from 'axios'
const app = express();
const bodyParser = require('body-parser');
app.use(cors());
const usersById = {};
const usersByUsername = {};
const chatsById = {}
app.use(bodyParser.json());

const data = axios.get('http://localhost:4001/chats').then(({ data }) => {
  const { users, chats } = data;

  users.forEach(user => {
    const { userId, username } = user;
    const userInfo = {
      ...user,
      chatIds: new Set()
    }
    usersById[userId] = userInfo;
    usersByUsername[username] = userInfo
  })
  chats.forEach(chat => {
    const { chatId, participants } = chat;
    chatsById[chatId] = {
      chatId,
      participants: new Set(participants)
    }
    participants.forEach(username => {
      const userExists = usersByUsername[username]
      if (userExists) {
        usersByUsername[username].chatIds.add(chatId)
      }
    })
  })

}).catch(error => {
  console.log({ error })
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/random_user', (req, res) => {
  const user = usersById[Object.keys(usersById)[0]]
  console.log({ user })
  res.send({
    ...user,
    chatIds: [...user.chatIds]
  })
});
app.get('/all_users', (req, res) => {
  res.send(Object.values(usersById))
});

app.get('/user/:userId', async (req, res) => {
  const user = usersById[req.params.userId];
  console.log('57', user)
  res.send({
    ...user,
    chatIds: [...user.chatIds]
  })
});

app.get('/chatoverlap', async (req, res) => {
  const { user1, user2 } = req.query
  const [oneChatIds, twoChatIds] = [user1, user2].map(user => usersById[user].chatIds)
  const chatIdsShared = [...oneChatIds].filter(chatId => twoChatIds.has(chatId))
  const chatOverlap = new Set();
  chatIdsShared.forEach(chatId => {
    const { participants } = chatsById[chatId];
    console.log({ participants })
    participants.forEach(username => {
      const { userId } = usersByUsername[username]
      if (![user1, user2].includes(userId)) {
        chatOverlap.add(userId)
      }
    })
  })
  console.log({ chatOverlap })
  res.send([...chatOverlap])
})


app.post('/delete', cors(), async (req, res) => {
  const { chatId, userId } = req.body;
  console.log({ chatId, userId })
  const { username } = usersById[userId]
  const chatIds = chatId ? [chatId] : usersById[userId].chatIds
  chatIds.forEach(chatId => {
    chatsById[chatId].participants.delete(username)
  })
  usersById[userId].chatIds = new Set()
  res.send('deleted');
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
