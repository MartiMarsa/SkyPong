export async function seedProfiles(db, users) {
  for (const u of users) {
    if (!u.email) {
      console.warn('⚠️  User object missing email, skipping:', u);
      continue;
    }

    await run(
      db,
      `INSERT OR IGNORE INTO players (user_id, nickname)
       VALUES (?, ?)`,
      [u.id, u.email.split('@')[0]]
    );

    await run(
      db,
      `INSERT OR IGNORE INTO player_stats (user_id)
       VALUES (?)`,
      [u.id]
    );
  }

  // friendships
  await friend(db, users[0].id, users[1].id, 'accepted', users[0].id);
  await friend(db, users[0].id, users[2].id, 'pending', users[0].id);
  await friend(db, users[0].id, users[3].id, 'accepted', users[0].id);
  await friend(db, users[3].id, users[4].id, 'blocked', users[3].id);
  await friend(db, users[3].id, users[1].id, 'accepted', users[3].id);
  await friend(db, users[3].id, users[4].id, 'pending', users[3].id);
  await friend(db, users[3].id, users[2].id, 'accpeted', users[3].id);
  await friend(db, users[2].id, users[1].id, 'accepted', users[2].id);
  await friend(db, users[4].id, users[5].id, 'accepted', users[2].id);
  await friend(db, users[4].id, users[6].id, 'blocked', users[2].id);
}

async function friend(db, a, b, status, requester) {
  const [u1, u2] = [a, b].sort();

  await run(
    db,
    `INSERT OR IGNORE INTO friends
     (user1_id, user2_id, status, requester_id, blocked_by)
     VALUES (?, ?, ?, ?, ?)`,
    [u1, u2, status, requester, status === 'blocked' ? requester : null]
  );
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      if (this.changes === 0) console.log('⚠️  Record exists, skipped:', params);
      else console.log('✅ Record inserted:', params);
      resolve();
    })
  );
}
