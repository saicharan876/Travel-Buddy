process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const app = require('../app.js');
const setupChat = require('../Chatbox/chat_socket.js');
const User = require('../user/user_model.js');
const Message = require('../Chatbox/chat_model.js');

let passed = 0;
let failed = 0;

function check(name, cond, extra) {
  if (cond) {
    passed++;
    console.log('PASS  ' + name);
  } else {
    failed++;
    console.log('FAIL  ' + name + (extra !== undefined ? '  -> ' + extra : ''));
  }
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function bearer(token) {
  return { Authorization: 'Bearer ' + token };
}

function waitFor(socket, event, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms || 1500);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function connect(port, token) {
  return ioClient('http://localhost:' + port, {
    auth: token ? { token: token } : {},
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });
}

async function signup(name, email, extra) {
  const body = Object.assign({ name: name, email: email, password: 'pw123456' }, extra || {});
  const r = await request(app).post('/signup').send(body);
  return { token: r.body.token, id: r.body.user && r.body.user.id, res: r };
}

async function createTrip(token, data) {
  return request(app).post('/trip/create').set(bearer(token)).send(data);
}

(async () => {
  let memServer = null;
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    uri = memServer.getUri() + 'travel_test';
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setupChat(io);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;

  // ---------- auth ----------
  const A = await signup('Alice', 'alice@x.com', { college: 'NIT Rourkela', job: 'Student', dob: '2003-05-01' });
  const B = await signup('Bob', 'bob@x.com');
  const C = await signup('Carol', 'carol@x.com');
  check('signup returns a token', !!A.token, JSON.stringify(A.res.body));

  const decoded = jwt.decode(A.token);
  const lifetimeHours = (decoded.exp - decoded.iat) / 3600;
  check('token now expires (about 24 hours)', lifetimeHours > 23 && lifetimeHours < 25, String(lifetimeHours));

  const dbAlice = await User.findById(A.id);
  check('signup saves college, job and dob (lowercase field names from the form)',
    dbAlice.College === 'NIT Rourkela' && dbAlice.Job === 'Student' && !!dbAlice.dob,
    JSON.stringify({ College: dbAlice.College, Job: dbAlice.Job, dob: dbAlice.dob }));

  let r = await request(app).post('/login').send({ email: 'alice@x.com', password: 'pw123456' });
  check('login works', r.status === 200 && !!r.body.token, String(r.status));
  r = await request(app).post('/login').send({ email: 'alice@x.com', password: 'wrong' });
  check('wrong password -> 401', r.status === 401, String(r.status));

  const forged = jwt.sign({ id: A.id }, 'some-other-secret');
  r = await createTrip(forged, { destination: 'X', date: daysFromNow(5) });
  check('token signed with a different secret is rejected (401)', r.status === 401, String(r.status));

  const expired = jwt.sign({ id: A.id }, process.env.JWT_SECRET, { expiresIn: -10 });
  r = await createTrip(expired, { destination: 'X', date: daysFromNow(5) });
  check('expired token is rejected (401)', r.status === 401, String(r.status));

  // ---------- trips ----------
  r = await request(app).post('/trip/create').send({ destination: 'X', date: daysFromNow(5) });
  check('create trip without token -> 401', r.status === 401, String(r.status));

  r = await createTrip(A.token, { destination: 'Goa', location: 'Goa', description: 'beach', college: 'NIT', date: daysFromNow(10), endDate: daysFromNow(8) });
  check('end date before start date -> 400', r.status === 400, String(r.status));

  r = await createTrip(A.token, { destination: 'Goa Beach', location: 'Goa', description: 'beach and trek', college: 'NIT', date: daysFromNow(10) });
  const openTrip = r.body.trip;
  check('create trip -> 201', r.status === 201, JSON.stringify(r.body));
  check('end date defaults to the start date', openTrip && openTrip.endDate === openTrip.date, JSON.stringify(openTrip));

  r = await request(app).post('/trip/join/' + openTrip._id).set(bearer(A.token));
  check('creator cannot join their own trip (400)', r.status === 400, String(r.status));
  r = await request(app).post('/trip/join/' + openTrip._id).set(bearer(B.token));
  check('another user can join (200)', r.status === 200, String(r.status));
  r = await request(app).post('/trip/join/' + openTrip._id).set(bearer(B.token));
  check('joining twice -> 400', r.status === 400, String(r.status));
  r = await request(app).post('/trip/join/not-an-id').set(bearer(B.token));
  check('join with invalid id -> 400', r.status === 400, String(r.status));

  r = await request(app).put('/trip/edit/' + openTrip._id).set(bearer(B.token)).send({ destination: 'Hacked' });
  check('non-creator cannot edit (403)', r.status === 403, String(r.status));
  r = await request(app).put('/trip/edit/' + openTrip._id).set(bearer(A.token)).send({ endDate: daysFromNow(14) });
  check('creator can edit and set an end date', r.status === 200 && r.body.trip.endDate.slice(0, 10) === daysFromNow(14), JSON.stringify(r.body));
  r = await request(app).delete('/trip/delete/' + openTrip._id).set(bearer(B.token));
  check('non-creator cannot delete (403)', r.status === 403, String(r.status));

  r = await request(app).get('/trip/' + openTrip._id).set(bearer(B.token));
  check('open trip: participant sees creator name and participant names',
    r.body.creator && r.body.creator.name === 'Alice' && r.body.participants.length === 1 && r.body.participants[0].name === 'Bob',
    JSON.stringify(r.body));
  check('open trip: role flags for participant', r.body.isParticipant === true && r.body.isCreator === false, JSON.stringify(r.body));

  // ---------- blind trips ----------
  r = await createTrip(A.token, { destination: 'Secret Hills', location: 'Manali', description: 'surprise trek', college: 'NIT', date: daysFromNow(30), endDate: daysFromNow(33), blind: true });
  const blindTrip = r.body.trip;
  await request(app).post('/trip/join/' + blindTrip._id).set(bearer(B.token));

  const hidden = (t) => t && t.creator === null && Array.isArray(t.participants) && t.participants.length === 0 && t.identitiesHidden === true;
  const findIn = (list) => (list || []).find((t) => t._id === blindTrip._id);

  r = await request(app).get('/trip');
  check('All Trips list hides blind identities (anonymous)', hidden(findIn(r.body)), JSON.stringify(findIn(r.body)));
  check('All Trips list still shows how many joined', findIn(r.body).participantCount === 1, JSON.stringify(findIn(r.body)));
  r = await request(app).get('/trip/college?college=NIT').set(bearer(C.token));
  check('College list hides blind identities', hidden(findIn(r.body)), JSON.stringify(findIn(r.body)));
  r = await request(app).get('/trip?location=Manali');
  check('Location filter hides blind identities', hidden(findIn(r.body)), JSON.stringify(findIn(r.body)));
  r = await request(app).get('/trip/location?location=Manali');
  check('/trip/location also hides blind identities', hidden(findIn(r.body)), JSON.stringify(findIn(r.body)));
  r = await request(app).get('/trip/blind');
  check('Blind list hides identities', hidden(findIn(r.body)), JSON.stringify(findIn(r.body)));

  r = await request(app).get('/trip/' + blindTrip._id).set(bearer(B.token));
  check('blind detail for participant: identities hidden but isParticipant is true (so chat and map can show)',
    hidden(r.body) && r.body.isParticipant === true, JSON.stringify(r.body));
  r = await request(app).get('/trip/' + blindTrip._id).set(bearer(A.token));
  check('blind detail for creator: isCreator true and sees participant names',
    r.body.isCreator === true && r.body.participants.length === 1 && r.body.participants[0].name === 'Bob', JSON.stringify(r.body));

  const PastTrip = mongoose.model('Trip');
  const pastBlind = await PastTrip.create({ destination: 'Old Secret', location: 'Ooty', description: 'done', college: 'NIT',
    date: new Date(Date.now() - 3 * 86400000), endDate: new Date(Date.now() - 1 * 86400000), blind: true, creator: A.id, participants: [B.id] });
  r = await request(app).get('/trip/' + pastBlind._id).set(bearer(C.token));
  check('blind trip is revealed once its start date has passed', r.body.identitiesHidden === false && r.body.creator && r.body.creator.name === 'Alice', JSON.stringify(r.body));

  // ---------- profiles ----------
  r = await request(app).get('/user/' + A.id);
  check('profile needs login (401)', r.status === 401, String(r.status));
  r = await request(app).get('/user/' + A.id).set(bearer(C.token));
  const othersView = r.body;
  check("other user's view: email hidden, isOwnProfile false", othersView.user && othersView.user.email === undefined && othersView.isOwnProfile === false, JSON.stringify(othersView.user));
  check("other user's view: hidden blind trip not listed under the creator", !(othersView.tripsCreated || []).some((t) => t._id === blindTrip._id), JSON.stringify((othersView.tripsCreated || []).map((t) => t.destination)));
  r = await request(app).get('/user/' + B.id).set(bearer(C.token));
  check("other user's view: hidden blind trip not listed under the participant", !(r.body.tripsJoined || []).some((t) => t._id === blindTrip._id), JSON.stringify((r.body.tripsJoined || []).map((t) => t.destination)));
  r = await request(app).get('/user/' + A.id).set(bearer(A.token));
  check('own profile: email shown, isOwnProfile true, blind trip listed',
    r.body.user.email === 'alice@x.com' && r.body.isOwnProfile === true && r.body.tripsCreated.some((t) => t._id === blindTrip._id), JSON.stringify(r.body.user));

  r = await request(app).put('/user/' + A.id + '/update-photo-url').set(bearer(B.token)).send({ profilePhoto: 'https://x.com/a.png' });
  check("cannot change someone else's photo (403)", r.status === 403, String(r.status));
  r = await request(app).put('/user/' + A.id + '/update-photo-url').set(bearer(A.token)).send({ profilePhoto: 'https://x.com/a.png' });
  check('can change own photo (200)', r.status === 200 && r.body.profilePhoto === 'https://x.com/a.png', JSON.stringify(r.body));
  r = await request(app).put('/user/' + A.id + '/update-photo-url').set(bearer(A.token)).send({ profilePhoto: 'not a url' });
  check('invalid photo URL rejected (400)', r.status === 400, String(r.status));

  // ---------- blogs ----------
  r = await request(app).post('/blogs/createBlog').send({ title: 't', destination: 'd', content: 'c', author: 'a' });
  check('create blog without login -> 401', r.status === 401, String(r.status));
  r = await request(app).post('/blogs/createBlog').set(bearer(B.token)).send({ title: 't', destination: 'd', content: 'c', author: 'Bob', author_Id: A.id });
  check('blog author comes from the token, not the request body', r.status === 201 && r.body.blog.author_Id === B.id, JSON.stringify(r.body));

  // ---------- overlap matching ----------
  await PastTrip.deleteMany({ description: /match-test/ });
  const mk = (destination, location, start, end, description) => createTrip(C.token, {
    destination: destination, location: location, description: description || 'match-test', college: 'X', date: start, endDate: end,
  });
  await mk('Goa T1', 'Goa', '2027-06-01', '2027-06-10', 'match-test beach');
  await mk('Goa T2', 'Goa', '2027-06-08', '2027-06-12', 'match-test trek');
  await mk('Manali T3', 'Manali', '2027-06-01', '2027-06-10');
  await mk('Goa T4', 'Goa', '2027-07-01');
  await mk('Goa T5', 'goa', '2027-06-05');

  r = await request(app).get('/trip/match?location=Goa&start=2027-06-05&end=2027-06-09');
  const names = (r.body || []).map((t) => t.destination + ':' + t.overlapDays);
  check('match: right trips by place and dates, case-insensitive, most overlap first',
    JSON.stringify(names) === JSON.stringify(['Goa T1:5', 'Goa T2:2', 'Goa T5:1']), JSON.stringify(names));
  r = await request(app).get('/trip/match?location=Goa&start=2027-06-05&end=2027-06-09&goal=TREK');
  check('match: trip-goal keyword narrows results (case-insensitive)', JSON.stringify((r.body || []).map((t) => t.destination)) === JSON.stringify(['Goa T2']), JSON.stringify((r.body || []).map((t) => t.destination)));
  r = await request(app).get('/trip/match?start=2027-06-09&end=2027-06-09');
  const anyPlace = (r.body || []).map((t) => t.destination).sort();
  check('match: no location means any place with overlapping dates', JSON.stringify(anyPlace) === JSON.stringify(['Goa T1', 'Goa T2', 'Manali T3']), JSON.stringify(anyPlace));
  r = await request(app).get('/trip/match?location=Goa&start=nonsense');
  check('match: invalid start date -> 400', r.status === 400, String(r.status));
  r = await request(app).get('/trip/match?location=Goa&start=2027-06-10&end=2027-06-01');
  check('match: end before start -> 400', r.status === 400, String(r.status));
  r = await request(app).get('/trip/match?location=' + encodeURIComponent('Goa (') + '&start=2027-06-05');
  check('match: special characters in search do not crash (200)', r.status === 200 && Array.isArray(r.body), String(r.status));

  // ---------- chat history route ----------
  r = await request(app).get('/api/chat/' + openTrip._id);
  check('chat history needs login (401)', r.status === 401, String(r.status));
  r = await request(app).get('/api/chat/' + openTrip._id).set(bearer(C.token));
  check('chat history: non-member gets 403', r.status === 403, String(r.status));

  // ---------- chat socket ----------
  const anon = connect(port, null);
  const anonErr = await waitFor(anon, 'connect_error');
  check('socket without token is refused', anonErr && anonErr.message === 'Unauthorized', anonErr && anonErr.message);
  anon.close();

  const sa = connect(port, A.token);
  const sb = connect(port, B.token);
  const sc = connect(port, C.token);
  await Promise.all([waitFor(sa, 'connect'), waitFor(sb, 'connect'), waitFor(sc, 'connect')]);

  sc.emit('joinRoom', { roomId: openTrip._id });
  const cErr = await waitFor(sc, 'chatError');
  check('non-member cannot join the trip chat', cErr && /members/.test(cErr.message), JSON.stringify(cErr));

  sc.emit('sendMessage', { roomId: openTrip._id, message: 'sneaky' });
  const cErr2 = await waitFor(sc, 'chatError');
  check('cannot send without joining', cErr2 && /Join/.test(cErr2.message), JSON.stringify(cErr2));

  sa.emit('joinRoom', { roomId: openTrip._id });
  sb.emit('joinRoom', { roomId: openTrip._id });
  const ja = await waitFor(sa, 'joinedRoom');
  const jb = await waitFor(sb, 'joinedRoom');
  check('creator and participant can join', !!ja && !!jb);

  const gotA = waitFor(sa, 'receiveMessage');
  const gotB = waitFor(sb, 'receiveMessage');
  sb.emit('sendMessage', { roomId: openTrip._id, message: '  hello team  ', senderId: A.id });
  const msgA = await gotA;
  const msgB = await gotB;
  check('message reaches everyone in the room', !!msgA && !!msgB);
  check('sender comes from the token, not the payload (fake senderId ignored)', msgA && msgA.senderId._id === B.id, JSON.stringify(msgA));
  check('live message includes the sender name (fixes "Unknown" and own-message display)', msgA && msgA.senderId.name === 'Bob' && msgA.message === 'hello team', JSON.stringify(msgA));
  const saved = await Message.findOne({ tripId: openTrip._id });
  check('message saved with the real sender', saved && saved.senderId.toString() === B.id, JSON.stringify(saved));

  sb.emit('sendMessage', { roomId: openTrip._id, message: '   ' });
  const emptyErr = await waitFor(sb, 'chatError');
  check('empty message rejected', !!emptyErr, JSON.stringify(emptyErr));

  r = await request(app).get('/api/chat/' + openTrip._id).set(bearer(A.token));
  check('chat history for member returns sender names', r.status === 200 && r.body.length === 1 && r.body[0].senderId.name === 'Bob', JSON.stringify(r.body));

  sa.emit('joinRoom', { roomId: blindTrip._id });
  sb.emit('joinRoom', { roomId: blindTrip._id });
  await waitFor(sa, 'joinedRoom');
  await waitFor(sb, 'joinedRoom');
  const blindGot = waitFor(sb, 'receiveMessage');
  sa.emit('sendMessage', { roomId: blindTrip._id, message: 'welcome!' });
  const blindMsg = await blindGot;
  check('blind trip chat works for members and hides real names (creator shown as "Organizer")', blindMsg && blindMsg.senderId.name === 'Organizer', JSON.stringify(blindMsg));
  const blindGot2 = waitFor(sa, 'receiveMessage');
  sb.emit('sendMessage', { roomId: blindTrip._id, message: 'hi!' });
  const blindMsg2 = await blindGot2;
  check('blind trip chat: participant shown as "Traveler 1"', blindMsg2 && blindMsg2.senderId.name === 'Traveler 1', JSON.stringify(blindMsg2));
  r = await request(app).get('/api/chat/' + blindTrip._id).set(bearer(B.token));
  check('blind trip history also uses aliases', r.status === 200 && r.body.map((m) => m.senderId.name).join(',') === 'Organizer,Traveler 1', JSON.stringify(r.body.map((m) => m.senderId.name)));

  sa.close();
  sb.close();
  sc.close();
  io.close();
  server.close();

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (memServer) {
    await memServer.stop();
  }
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('CRASH', e);
  process.exit(2);
});
