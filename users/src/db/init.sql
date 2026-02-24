CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blue_player_id UUID NOT NULL REFERENCES users(id),
    red_player_id UUID REFERENCES users(id), -- Null if you play against a BOT
    is_bot BOOLEAN DEFAULT false,
    bot_difficulty INT DEFAULT 0, -- 0 f you play against a real local player, 1=Easy, 2=Medium, 3=Hard
    winner_id UUID REFERENCES users(id), -- Null if the match hasn't ended yet or if there is a tie
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'finished', 'abandoned'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);