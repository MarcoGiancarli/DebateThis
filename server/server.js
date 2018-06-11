'use strict';

const inProd = false

const assert = require('assert')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const db
const dbUrl = 'mongodb://localhost:27017'
const dbName = 'debatethisdb'
const MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({ extended: true }))

MongoClient.connect(dbUrl, (err, client) => {
  assert.equal(err, null)
  console.log('Connected to MongoDB.')

  db = client.db(dbName)
  
//  app.listen(3000, () => {
//    console.log('MongoDB listening on port 3000')
//  })
})

const topics = db.collection('topics')
const messages = db.collection('messages')
const rooms = {}

io.on('connection', (socket) => {
  console.log('user connected to menu.')

  socket.on('disconnect', () => {
    console.log('user disconnected from menu.')
    // TODO: set all of this socket's topics to not-live
  })

  socket.on('add-topic', (title) => {
    // TODO: fix the race condition here if possible
    let topicWithThisTitle = topics.findOne({
      $and: [
        { title: title },
        { live: true }
      ]
    })
    let topicFromThisSocket = topics.findOne({
      $and: [
        { socket: socket },
        { live: true }
      ]
    })
    if(topicWithThisTitle) {
      socket.emit('info', {
        type: 'issue', 
        text: 'A topic with that title already exists.' 
      })
    } else if(topicFromThisSocket) {
      socket.emit('info', {
        type: 'issue',
        text: 'You already have a topic. Remove it before creating a new one.'
      })
    } else {
      let topic = { socket: socket, title: title, live: true } 
      // TODO: add tags later, maybe autogenerate from title?
      topic.id = topics.insertOne(topic).insertedId
      // TODO: don't send socket objects to users. hash it or something.
      socket.emit('topic', { type: 'add-owned', topicId: topic.id })
      io.emit('topic', { type: 'add-topic', topic: topic })
    }
  })

  socket.on('remove-topic', (topicId) => {
    let topicToRemove = topics.findOne({ _id: topicId })
    if(topicToRemove.socket === socket) {
      topics.update(
        { _id: topicToRemove._id },
        { $set: { live: false } }
      )
      io.emit('topic', { type: 'remove-topic', topicId: topicId })
    }
  })

  socket.on('join-topic', (topicId) => {
    let topicToJoin = topics.findOne({ _id: topicId })
    if(topicToJoin.socket === socket) {
      socket.emit('info', {
        type: 'issue',
        text: "You can't join your own topic."
      })
    } else if(topicToJoin.socket === socket) {
      socket.emit('info', {
        type: 'issue',
        text: "You can't join a topic that isn't live."
      })
    } else {
      let topicRoom = {
        topicId: topicId,
        title: topicToJoin.title
      }
      socket.emit('join-topic', topicRoom)
      topicToJoin.socket.emit('join-topic', topicRoom)
    }
  })
})

let chatNsp = io.of('/chat')
chatNsp.on('connection', (socket) => {
  console.log('user connected to chat.')
  var room

  socket.on('disconnect', () => {
    console.log('user disconnected from chat.')
  })

  socket.on('join-room', (roomId) => {
    room = roomId
    socket.join(roomId)
  })

  socket.on('add-message', (message) => {
    if(room) {
      chatNsp.to(room).emit('message', { type: 'new-message', text: message })
      messages.insertOne({ text: message, dt: new Date(), })
    } else {
      socket.emit('info', {
        type: 'issue',
        text: 'You must be in a room to send a message.'
      })
    }
  })
})

http.listen(5000, () => {
  console.log('Server started on port 5000');
})
