-- Fix column names to use snake_case convention

-- CryptoWatchlist table
ALTER TABLE IF EXISTS crypto_watchlists 
  RENAME COLUMN "isFavorite" TO is_favorite;

-- Settings table
ALTER TABLE IF EXISTS settings
  RENAME COLUMN "defaultView" TO default_view,
  RENAME COLUMN "refreshInterval" TO refresh_interval,
  RENAME COLUMN "notificationEnabled" TO notification_enabled,
  RENAME COLUMN "darkMode" TO dark_mode;

-- Widget table
ALTER TABLE IF EXISTS widgets
  RENAME COLUMN "widgetType" TO widget_type,
  RENAME COLUMN "positionX" TO position_x,
  RENAME COLUMN "positionY" TO position_y,
  RENAME COLUMN "configData" TO config_data;
