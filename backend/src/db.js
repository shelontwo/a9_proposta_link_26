const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { clients: [], presentations: [], logs: [] };
  }
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getClients() {
  const db = readDB();
  return db.clients;
}

function addClient(client) {
  const db = readDB();
  const newClient = { id: Date.now().toString(), ...client };
  db.clients.push(newClient);
  writeDB(db);
  return newClient;
}

function getPresentations() {
  const db = readDB();
  return db.presentations;
}

function addPresentation(presentation) {
  const db = readDB();
  const token = Math.random().toString(36).substring(2, 10);
  const newPres = {
    id: Date.now().toString(),
    token,
    createdAt: new Date().toISOString(),
    ...presentation
  };
  db.presentations.push(newPres);
  writeDB(db);
  return newPres;
}

function getPresentationByToken(token) {
  const db = readDB();
  return db.presentations.find(p => p.token === token);
}

function logAccess(log) {
  const db = readDB();
  const newLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), ...log };
  db.logs.push(newLog);
  writeDB(db);
  return newLog;
}

function updateStayDuration(token, slideIndex, duration) {
  const db = readDB();
  const recentStay = db.logs
    .filter(l => l.token === token && l.type === 'STAY' && Number(l.slideIndex) === Number(slideIndex))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  // If a stay log exists for this slide and it's from the same session (e.g., within 30 min)
  const isRecent = recentStay && (Date.now() - new Date(recentStay.timestamp).getTime() < 30 * 60 * 1000);

  if (isRecent) {
    recentStay.duration = duration;
    recentStay.timestamp = new Date().toISOString(); // Update last active timestamp
  } else {
    db.logs.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'STAY',
      token,
      slideIndex,
      duration
    });
  }
  writeDB(db);
}

function getLogsByToken(token) {
  const db = readDB();
  return db.logs.filter(l => l.token === token);
}

function updateClient(id, data) {
  const db = readDB();
  const index = db.clients.findIndex(c => c.id === id);
  if (index !== -1) {
    db.clients[index] = { ...db.clients[index], ...data, id };
    writeDB(db);
    return db.clients[index];
  }
  return null;
}

function deleteClient(id) {
  const db = readDB();
  db.clients = db.clients.filter(c => c.id !== id);
  writeDB(db);
  return true;
}

function updatePresentation(id, data) {
  const db = readDB();
  const index = db.presentations.findIndex(p => p.id === id);
  if (index !== -1) {
    db.presentations[index] = { ...db.presentations[index], ...data, id };
    writeDB(db);
    return db.presentations[index];
  }
  return null;
}

function deletePresentation(id) {
  const db = readDB();
  db.presentations = db.presentations.filter(p => p.id !== id);
  writeDB(db);
  return true;
}

function getUsers() {
  const db = readDB();
  return db.users || [];
}

function addUser(user) {
  const db = readDB();
  const newUser = { id: Date.now().toString(), ...user };
  if (!db.users) db.users = [];
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

function updateUser(id, data) {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...data, id };
    writeDB(db);
    return db.users[index];
  }
  return null;
}

function deleteUser(id) {
  const db = readDB();
  db.users = (db.users || []).filter(u => u.id !== id);
  writeDB(db);
  return true;
}

function validateUser(username, password) {
  const db = readDB();
  return (db.users || []).find(u => u.username === username && u.password === password);
}

module.exports = {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  getPresentations,
  addPresentation,
  updatePresentation,
  deletePresentation,
  getPresentationByToken,
  logAccess,
  getLogsByToken,
  updateStayDuration,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  validateUser,
  readDB
};
