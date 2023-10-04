const path = require('path')
const http = require('node:http')
const express = require('express')
const cors = require('cors')
const app = express()
const socketio = require('socket.io')

const PORT = 3000

// app.use(cors({
//   origin: '*'
// }))

// ------------------------------------------------------------------------- //
// app.use('/', express.static(path.resolve(__dirname, '..', 'app', 'dist')))

app.get('/', (req, res) => {
  res.send({
    status: 'OK',
    statusCode: 200,
    message: 'API is running is working'
  })
})

// app.get('/sample/:id', (req, res) => {
//   setTimeout(() => {
//     return res.json({
//       caller: `${req.params.id}`
//     })
//   }, 1500);
// })

// ------------------------------------------------------------------------- //

const server = http.createServer(app)

const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
})

const users = {}

app.get('/app', function (req, res) {
  const { id, username, room } = req.query
  users[id] = { username, room }
  // res.json({ id, username, room, time: new Date().Hours + ':' + new Date().Minutes })
  res.json({ id, username, room, time: new Date().toLocaleTimeString() })
})

io.on('connection', function (socket) {
  users[socket.id]

  socket.on('user-list', message => {
    io.emit('user-list', Object.entries(users).map(([key, value]) => ({ id: key, 'username': value.username, 'room': value.room })))
    console.log('[CONNECT] Current Users', users)
  })

  socket.on('client-message', message => {
    console.log(message)
    io.emit('message', message)
  })

  socket.on('disconnect', function () {
    io.emit('client-disconnect', `User ${socket.id} has disconnected`)
    delete users[socket.id]
    io.emit('user-list', Object.entries(users).map(([key, value]) => ({ 'socket-id': key, 'username': value.username, 'room': value.room })))
    console.log('[DISCONNECT] Current Users', users)
  })
})

server.listen(PORT, () => console.log(`Server is listening at http://localhost:${PORT}`))
