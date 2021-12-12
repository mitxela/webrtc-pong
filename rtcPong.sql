
--   DESCRIBE rtcPong;
--   +-----------+---------------------+------+-----+---------+----------------+
--   | Field     | Type                | Null | Key | Default | Extra          |
--   +-----------+---------------------+------+-----+---------+----------------+
--   | id        | int(4)              | NO   | PRI | 0       |                |
--   | to        | enum('alice','bob') | NO   | PRI | NULL    |                |
--   | msg_id    | int(4)              | NO   | PRI | NULL    | auto_increment |
--   | timestamp | datetime            | NO   |     | NULL    |                |
--   | msg       | text                | NO   |     | NULL    |                |
--   +-----------+---------------------+------+-----+---------+----------------+


CREATE TABLE `rtcPong` (
  `id` int(4) NOT NULL DEFAULT '0',
  `to` enum('alice','bob') NOT NULL,
  `msg_id` int(4) NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `msg` text NOT NULL,
  PRIMARY KEY (`id`,`to`,`msg_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

