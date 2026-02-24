import { v4 as uuid } from 'uuid';
import argon2 from 'argon2';
import sqlite3 from 'sqlite3';

export async function seedAuthUsers(db) {
  const users = [
    { email: 'aliceCooper@test.com', password: 'Qwerty@123456' },
    { email: 'bobTeylor@test.com', password: 'Qwerty@123456' },
    { email: 'carolGemenez@test.com', password: 'Qwerty@123456' },
    { email: 'daveBarbacoa@test.com', password: 'Qwerty@123456' },
    { email: 'evePecadora@test.com', password: 'Qwerty@123456' },
  ];

  const result = [];

  for (const u of users) {
    const exists = await getOne(
      db,
      `SELECT id FROM users WHERE email = ?`,
      [u.email]
    );

    if (exists) {
      console.log('⚠️  User already exists, skipped:', u.email);
	  result.push({ id: exists.id, email: u.email });
      continue;
    }

    const id = 'seed_' + uuid();
    const hash = await argon2.hash(u.password, { type: argon2.argon2id });

    await run(
      db,
      `INSERT INTO users (id, email, password_hashed)
       VALUES (?, ?, ?)`,
      [id, u.email, hash]
    );

    console.log('✅ Created user:', u.email);
    result.push({ id, email: u.email });
  }

  return result;
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, err => (err ? reject(err) : resolve()))
  );
}

function getOne(db, sql, params = []) {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );
}
