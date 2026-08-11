-- Donnees reelles extraites du prototype, a executer APRES schema.sql
-- (Supabase Dashboard > SQL Editor > New query)

insert into planif_hebdo.charges (nom) values
  ('Santiago'),
  ('William'),
  ('Mathis'),
  ('Matteo'),
  ('Thomas'),
  ('Bryan')
on conflict (nom) do nothing;

insert into planif_hebdo.surintendants (nom) values
  ('Frank'),
  ('Nadeau'),
  ('Lalande'),
  ('Tony')
on conflict (nom) do nothing;

insert into planif_hebdo.contremaitres (nom, sort_order) values
  ('Biagio Pirro', 0),
  ('Brian Labelle', 1),
  ('Claude Cyr', 2),
  ('Daniel Boudreault', 3),
  ('Dominic Hamel', 4),
  ('Françis Jobin', 5),
  ('François Gosselin', 6),
  ('Jérémy Juneau', 7),
  ('Jocelyn Denicolai', 8),
  ('Jonathan Baulne', 9),
  ('Marco Chiovetti', 10),
  ('Martin Guillemette', 11),
  ('Michel Coulombe', 12),
  ('Patrick Courteau', 13),
  ('Patrick Desmeules', 14),
  ('Nouvelle equipe 1', 15),
  ('Nouvelle equipe 2', 16),
  ('Nouvelle equipe 3', 17);

insert into planif_hebdo.projects (no, projet, charge, surintendant, statut, s1, s2, commentaire, date_valeur, sort_order) values
  ('26-710', 'Marquise Phase 8 - QMD', 'Thomas', 'Tony', 'A venir', false, false, '', null, 0),
  ('26-190', 'Sina - Job a l''heure', 'Santiago', 'Frank', 'A venir', false, false, '', null, 1),
  ('26-177', 'Reparation nuance design', 'Santiago', 'Tony', 'A venir', false, false, '', null, 2),
  ('26-171', 'Rio Can - Autoroute 13 - Jasmin', 'William', 'Nadeau', 'A venir', false, false, '', null, 3),
  ('26-158', 'Distech', 'Mathis', 'Frank', 'A venir', false, false, '', null, 4),
  ('26-153', 'Parking Ray Jr', 'Mathis', 'Lalande', 'A venir', false, false, '', null, 5),
  ('26-123', 'Alubase', 'Thomas', 'Tony', 'A venir', false, false, '', null, 6),
  ('26-112', 'Bohar Vaudreuil TRIAD', 'Santiago', 'Frank', 'A venir', false, false, '', null, 7),
  ('25-246', 'Gaumont Phase A', 'William', 'Tony', 'A venir', false, false, '', null, 8),
  ('25-245', 'Kim Phat', 'Matteo', 'Frank', 'A venir', false, false, '', null, 9),
  ('25-235', 'Harbour Praxis', 'Santiago', 'Frank', 'A venir', false, false, '', null, 10),
  ('25-232', 'Anjou - Praxis', 'Mathis', 'Tony', 'A venir', false, false, '', null, 11),
  ('25-220', 'Civil Jasmin - Hector Lanthier', 'William', 'Frank', 'A venir', false, false, '', null, 12),
  ('25-214', 'Montpak', 'Matteo', 'Frank', 'A venir', false, false, '', null, 13),
  ('25-213', 'Quais Valditech', 'Mathis', 'Nadeau', 'A venir', false, false, '', null, 14),
  ('25-211', 'Doris-Lussier', 'William', 'Frank', 'A venir', false, false, '', null, 15),
  ('25-204', 'Hulix Construction', 'William', 'Tony', 'A venir', false, false, '', null, 16),
  ('25-199', 'Metro St-Hilaire', 'Mathis', 'Frank', 'A venir', false, false, '', null, 17),
  ('25-192', 'Momento Omnia', 'Matteo', 'Tony', 'A venir', false, false, '', null, 18),
  ('25-190', 'Deux montagne - Praxis', 'Mathis', 'Tony', 'A venir', false, false, '', null, 19),
  ('25-172', 'Skyblu', 'William', 'Lalande', 'A venir', false, false, '', null, 20),
  ('25-171', 'Proanima', 'Thomas', 'Tony', 'A venir', false, false, '', null, 21),
  ('25-151', 'Radio Canada', 'Santiago', 'Frank', 'A venir', false, false, '', null, 22),
  ('25-144', 'Citta B', 'Matteo', 'Frank', 'A venir', false, false, '', null, 23),
  ('25-113', 'Exal Quartier Olympique - Sherbrooke - Construgep', 'Matteo', 'Tony', 'A venir', false, false, '', null, 24),
  ('24-289', 'Walmart Brossard', 'Thomas', 'Tony', 'A venir', false, false, '', null, 25),
  ('24-284', 'Divco Centropolis', 'Matteo', 'Frank', 'A venir', false, false, '', null, 26),
  ('24-280', 'St-Elzear', 'Mathis', 'Tony', 'A venir', false, false, '', null, 27),
  ('24-276', 'Nua - Deslaurentides', 'Mathis', 'Tony', 'A venir', false, false, '', null, 28),
  ('24-268', 'HOOP Vaudreuil', 'William', 'Nadeau', 'A venir', false, false, '', null, 29),
  ('24-266', 'Lacordaire', 'Matteo', 'Tony', 'A venir', false, false, '', null, 30),
  ('24-251', 'Immeuble l''Assomption', 'William', 'Tony', 'A venir', false, false, '', null, 31),
  ('24-244', 'Cure-Labelle', 'Matteo', 'Frank', 'A venir', false, false, '', null, 32),
  ('24-203', 'Plaza St-Therese Ph 3-4', 'Thomas', 'Frank', 'A venir', false, false, '', null, 33),
  ('24-196', 'Azur', 'William', 'Tony', 'A venir', false, false, '', null, 34),
  ('24-141', 'Clement Phase 4', 'William', 'Frank', 'A venir', false, false, '', null, 35),
  ('24-113', 'Leo Lacombe', 'Santiago', 'Frank', 'A venir', false, false, '', null, 36),
  ('24-102', 'CSL', 'William', 'Tony', 'A venir', false, false, '', null, 37),
  ('23-215', 'Gardenia', 'William', 'Frank', 'A venir', false, false, '', null, 38),
  ('23-212', 'DDO', 'William', 'Lalande', 'A venir', false, false, '', null, 39),
  ('22-137', 'Volvo', 'William', 'Tony', 'A venir', false, false, '', null, 40),
  ('22-128', 'Rue Jean Nicolet', 'William', 'Frank', 'A venir', false, false, '', null, 41),
  ('22-056', 'Mtl-Nord', 'Bryan', 'Tony', 'A venir', false, false, '', null, 42);
