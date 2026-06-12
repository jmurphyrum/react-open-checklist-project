CREATE TABLE IF NOT EXISTS sets (
  uuid TEXT PRIMARY KEY,
  set_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL CHECK(genre IN ('Sports', 'TCG', 'Non-Sport')),
  category TEXT NOT NULL,
  sports TEXT,
  season TEXT,
  years TEXT,
  parallel INTEGER DEFAULT 0,
  insert_set INTEGER DEFAULT 0,
  autograph INTEGER DEFAULT 0,
  relic INTEGER DEFAULT 0,
  base_set TEXT,
  series TEXT,
  series_number INTEGER,
  release_date TEXT,
  manufacturer TEXT,
  card_count INTEGER,
  print_run INTEGER,
  subset TEXT,
  description TEXT,
  image_url TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sets_genre ON sets(genre);
CREATE INDEX IF NOT EXISTS idx_sets_set_id ON sets(set_id);
CREATE INDEX IF NOT EXISTS idx_sets_series ON sets(series);
CREATE INDEX IF NOT EXISTS idx_sets_release ON sets(release_date);

CREATE TABLE IF NOT EXISTS cards (
  uuid TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  genre TEXT NOT NULL CHECK(genre IN ('Sports', 'TCG', 'Non-Sport')),
  sport TEXT,
  sports TEXT,
  set_id TEXT NOT NULL,
  subjects TEXT NOT NULL,
  card_name TEXT,
  description TEXT,
  series TEXT,
  set_number TEXT,
  subset TEXT,
  variation TEXT,
  parallel TEXT,
  print_run INTEGER,
  serial_numbered INTEGER DEFAULT 0,
  autograph INTEGER DEFAULT 0,
  relic INTEGER DEFAULT 0,
  rookie_card INTEGER DEFAULT 0,
  release_date TEXT,
  image_url TEXT,
  external_links TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (set_id) REFERENCES sets(set_id)
);

CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);
CREATE INDEX IF NOT EXISTS idx_cards_genre ON cards(genre);
CREATE INDEX IF NOT EXISTS idx_cards_sport ON cards(sport);
CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(number);
CREATE INDEX IF NOT EXISTS idx_cards_rookie ON cards(rookie_card);
CREATE INDEX IF NOT EXISTS idx_cards_card_name ON cards(card_name);
