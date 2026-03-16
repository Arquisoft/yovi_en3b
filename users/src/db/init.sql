CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blue_player_id UUID NOT NULL REFERENCES users(id),
    red_player_id UUID REFERENCES users(id), -- Null if you play against a BOT
    is_bot BOOLEAN DEFAULT false,
    bot_difficulty INT DEFAULT 0, -- 0 if you play against a real local player, 1=Easy, 2=Medium, 3=Hard
    winner_id UUID REFERENCES users(id), -- Null if the match hasn't ended yet or if there is a tie
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'finished', 'abandoned'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- GameSave table: stores move history and game state progression
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id), -- The match moves and state belongs to
    move_number INT NOT NULL,                      -- Move sequence (1, 2, 3...)
    player_last_move VARCHAR(10),                  -- Barycentric. Null in PvP.
    bot_last_move VARCHAR(10),                     -- Barycentric. Null in PvP.
    resulting_board_state JSONB NOT NULL,          -- YEN notation JSON (size, turn, layout)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, move_number)                  -- Prevents duplicate move numbers per match
);

-- Rankings table: stores aggregated stats per user
CREATE TABLE IF NOT EXISTS rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    total_matches INT DEFAULT 0,
    win_matches INT DEFAULT 0,
    score INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
