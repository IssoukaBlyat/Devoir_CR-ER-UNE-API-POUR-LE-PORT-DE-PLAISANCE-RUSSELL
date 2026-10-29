
import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';
import session from 'express-session';
import mongoose from 'mongoose';

import { createApp } from '../src/app.js';
import { AppError } from '../src/services/errors.js';
import Catway from '../src/models/Catway.js';
import Reservation from '../src/models/Reservation.js';

import * as catways from '../src/services/catways.js';
import * as reservations from '../src/services/reservations.js';

const TEST_URI = process.env.TEST_MONGODB_URI;

describe('API Russell - sécurité', () => {

  it('refuse la liste des catways sans authentification', async () => {
    const app = createApp({
      sessionStore: new session.MemoryStore()
    });

    const response = await request(app)
      .get('/api/catways')
      .set('Accept', 'application/json');

    expect(response.status).to.equal(401);
  });

  it('rejette les champs non autorisés', async () => {
    try {
      await catways.create({ foo: 'bar' });
      throw new Error('La validation aurait dû échouer');
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
    }
  });
});

describe('API Russell - 9 fonctionnalités CRUD', function () {

  this.timeout(15000);

  let catwayId;
  let reservationId;

  const number = 900000 + Math.floor(Math.random() * 99999);

  before(async () => {
    if (!TEST_URI) {
      throw new Error('Définis TEST_MONGODB_URI dans .env');
    }

    const dbName = new URL(TEST_URI).pathname.replace(/^\//, '');

    if (!/^russell[_-]test(?:[_-].*)?$/i.test(dbName)) {
      throw new Error('La base doit être nommée russell_test');
    }

    if (TEST_URI === process.env.MONGODB_URI) {
      throw new Error('La base de test doit être différente');
    }

    await mongoose.connect(TEST_URI, {
      serverSelectionTimeoutMS: 8000
    });

    const created = await Catway.create({
      catwayNumber: number,
      type: 'short',
      catwayState: 'Test initial'
    });

    catwayId = created.id;
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      if (catwayId) {
        await Reservation.deleteMany({ catwayNumber: number });
        await Catway.deleteOne({ _id: catwayId });
      }

      await mongoose.disconnect();
    }
  });

  it('1. crée un catway', async () => {
    const c = await Catway.findById(catwayId);

    expect(c).to.exist;
    expect(c.catwayNumber).to.equal(number);
    expect(c.type).to.equal('short');
  });

  it('2. liste les catways', async () => {
    const items = await catways.list();

    expect(items.some(c => c.id === catwayId)).to.equal(true);
  });

  it('3. récupère les détails d’un catway', async () => {
    const c = await catways.get(catwayId);

    expect(c.catwayState).to.equal('Test initial');
  });

  it('4. modifie l’état du catway', async () => {
    const c = await catways.patch(catwayId, {
      catwayState: 'Test modifié'
    });

    expect(c.catwayState).to.equal('Test modifié');

    const updated = await Catway.findById(catwayId);
    expect(updated.catwayState).to.equal('Test modifié');
  });

  it('5. crée une réservation', async () => {
    const r = await reservations.create(catwayId, {
      clientName: 'Client Test',
      boatName: 'Bateau Test',
      checkIn: '2030-06-01T10:00:00Z',
      checkOut: '2030-06-03T10:00:00Z'
    });

    reservationId = r.id;

    expect(r.catwayNumber).to.equal(number);
  });

  it('6. liste les réservations du catway', async () => {
    const items = await reservations.list(catwayId);

    expect(
      items.some(r => r.id === reservationId)
    ).to.equal(true);
  });

  it('7. récupère les détails d’une réservation', async () => {
    const r = await reservations.get(catwayId, reservationId);

    expect(r.boatName).to.equal('Bateau Test');
  });

  it('8. supprime une réservation', async () => {
    await reservations.remove(catwayId, reservationId);

    const deleted = await Reservation.findById(reservationId);

    expect(deleted).to.equal(null);
  });

  it('9. supprime un catway', async () => {
    await catways.remove(catwayId);

    const deleted = await Catway.findById(catwayId);

    expect(deleted).to.equal(null);
  });
});
