import { v4 as uuid } from 'uuid';

export async function seedGames(db, users) {
  for (let i = 0; i < 10; i++) {
    const u1 = users[i % users.length].id;
    const u2 = users[(i + 1) % users.length].id;

    const [a, b] = [u1, u2].sort();

    await run(
      db,
      `INSERT OR IGNORE INTO games_and_results (
        game_id,
        user1_id,
        user2_id,
        user1_score,
        user2_score,
        user1_result,
        user2_result,
        start_at,
        end_at,
        processed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)`,
      [
        uuid(),
        a,
        b,
        10,
        5,
        'win',
        'loss'
      ]
    );
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, err => (err ? reject(err) : resolve()))
  );
}
