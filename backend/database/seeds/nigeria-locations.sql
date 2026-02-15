-- Nigeria States and LGAs Seed Data
-- All 36 States + FCT with capitals, coordinates, and geo-zones

INSERT INTO states (name, capital, latitude, longitude, geo_zone) VALUES
-- South West
('Lagos', 'Ikeja', 6.5244, 3.3792, 'South West'),
('Ogun', 'Abeokuta', 7.1607, 3.3500, 'South West'),
('Oyo', 'Ibadan', 7.3775, 3.9470, 'South West'),
('Osun', 'Osogbo', 7.7827, 4.5418, 'South West'),
('Ondo', 'Akure', 7.2526, 5.2103, 'South West'),
('Ekiti', 'Ado-Ekiti', 7.6211, 5.2215, 'South West'),

-- South East
('Abia', 'Umuahia', 5.5320, 7.4861, 'South East'),
('Anambra', 'Awka', 6.2209, 7.0673, 'South East'),
('Ebonyi', 'Abakaliki', 6.3176, 8.1137, 'South East'),
('Enugu', 'Enugu', 6.4584, 7.5464, 'South East'),
('Imo', 'Owerri', 5.4836, 7.0332, 'South East'),

-- South South
('Akwa Ibom', 'Uyo', 5.0377, 7.9128, 'South South'),
('Bayelsa', 'Yenagoa', 4.9261, 6.2642, 'South South'),
('Cross River', 'Calabar', 4.9757, 8.3417, 'South South'),
('Delta', 'Asaba', 6.1981, 6.7250, 'South South'),
('Edo', 'Benin City', 6.3350, 5.6037, 'South South'),
('Rivers', 'Port Harcourt', 4.8156, 7.0498, 'South South'),

-- North Central
('Benue', 'Makurdi', 7.7411, 8.5121, 'North Central'),
('Kogi', 'Lokoja', 7.8023, 6.7333, 'North Central'),
('Kwara', 'Ilorin', 8.4966, 4.5426, 'North Central'),
('Nasarawa', 'Lafia', 8.4966, 8.5147, 'North Central'),
('Niger', 'Minna', 9.6139, 6.5569, 'North Central'),
('Plateau', 'Jos', 9.8965, 8.8583, 'North Central'),
('FCT', 'Abuja', 9.0579, 7.4951, 'North Central'),

-- North East
('Adamawa', 'Yola', 9.2035, 12.4954, 'North East'),
('Bauchi', 'Bauchi', 10.3158, 9.8442, 'North East'),
('Borno', 'Maiduguri', 11.8311, 13.1510, 'North East'),
('Gombe', 'Gombe', 10.2834, 11.1731, 'North East'),
('Taraba', 'Jalingo', 8.8937, 11.3596, 'North East'),
('Yobe', 'Damaturu', 11.7468, 11.9662, 'North East'),

-- North West
('Jigawa', 'Dutse', 11.7689, 9.3397, 'North West'),
('Kaduna', 'Kaduna', 10.5105, 7.4165, 'North West'),
('Kano', 'Kano', 12.0022, 8.5920, 'North West'),
('Katsina', 'Katsina', 13.0059, 7.6000, 'North West'),
('Kebbi', 'Birnin Kebbi', 12.4539, 4.1975, 'North West'),
('Sokoto', 'Sokoto', 13.0533, 5.2476, 'North West'),
('Zamfara', 'Gusau', 12.1628, 6.6612, 'North West');

-- Major LGAs for key states (representative subset)
-- Lagos LGAs
INSERT INTO lgas (state_id, name, latitude, longitude) VALUES
((SELECT id FROM states WHERE name = 'Lagos'), 'Ikeja', 6.5954, 3.3424),
((SELECT id FROM states WHERE name = 'Lagos'), 'Victoria Island', 6.4281, 3.4219),
((SELECT id FROM states WHERE name = 'Lagos'), 'Lekki', 6.4474, 3.4730),
((SELECT id FROM states WHERE name = 'Lagos'), 'Ikoyi', 6.4492, 3.4374),
((SELECT id FROM states WHERE name = 'Lagos'), 'Surulere', 6.5059, 3.3509),
((SELECT id FROM states WHERE name = 'Lagos'), 'Yaba', 6.5158, 3.3759),
((SELECT id FROM states WHERE name = 'Lagos'), 'Ajah', 6.4680, 3.5737),
((SELECT id FROM states WHERE name = 'Lagos'), 'Maryland', 6.5694, 3.3632),
((SELECT id FROM states WHERE name = 'Lagos'), 'Oshodi', 6.5568, 3.3415),
((SELECT id FROM states WHERE name = 'Lagos'), 'Agege', 6.6194, 3.3280),
((SELECT id FROM states WHERE name = 'Lagos'), 'Alimosho', 6.6105, 3.2608),
((SELECT id FROM states WHERE name = 'Lagos'), 'Ikorodu', 6.6157, 3.5072),
((SELECT id FROM states WHERE name = 'Lagos'), 'Badagry', 6.4317, 2.8814),
((SELECT id FROM states WHERE name = 'Lagos'), 'Epe', 6.5852, 3.9797),
((SELECT id FROM states WHERE name = 'Lagos'), 'Kosofe', 6.5897, 3.3909),

-- FCT/Abuja LGAs
((SELECT id FROM states WHERE name = 'FCT'), 'Garki', 9.0108, 7.4874),
((SELECT id FROM states WHERE name = 'FCT'), 'Wuse', 9.0643, 7.4892),
((SELECT id FROM states WHERE name = 'FCT'), 'Maitama', 9.0817, 7.4926),
((SELECT id FROM states WHERE name = 'FCT'), 'Asokoro', 9.0408, 7.5271),
((SELECT id FROM states WHERE name = 'FCT'), 'Gwarinpa', 9.1067, 7.3968),
((SELECT id FROM states WHERE name = 'FCT'), 'Jabi', 9.0621, 7.4253),
((SELECT id FROM states WHERE name = 'FCT'), 'Kubwa', 9.1598, 7.3211),
((SELECT id FROM states WHERE name = 'FCT'), 'Lugbe', 8.9733, 7.3870),
((SELECT id FROM states WHERE name = 'FCT'), 'Nyanya', 8.9700, 7.5600),
((SELECT id FROM states WHERE name = 'FCT'), 'Karu', 8.9955, 7.5847),

-- Rivers/Port Harcourt LGAs
((SELECT id FROM states WHERE name = 'Rivers'), 'Port Harcourt City', 4.8156, 7.0498),
((SELECT id FROM states WHERE name = 'Rivers'), 'Obio-Akpor', 4.8500, 7.0000),
((SELECT id FROM states WHERE name = 'Rivers'), 'Eleme', 4.7800, 7.1200),
((SELECT id FROM states WHERE name = 'Rivers'), 'Ikwerre', 5.0100, 6.9200),
((SELECT id FROM states WHERE name = 'Rivers'), 'Oyigbo', 4.8700, 7.1500),

-- Oyo/Ibadan LGAs
((SELECT id FROM states WHERE name = 'Oyo'), 'Ibadan North', 7.4200, 3.9000),
((SELECT id FROM states WHERE name = 'Oyo'), 'Ibadan South East', 7.3600, 3.9500),
((SELECT id FROM states WHERE name = 'Oyo'), 'Ibadan North East', 7.4300, 3.9600),
((SELECT id FROM states WHERE name = 'Oyo'), 'Ibadan South West', 7.3700, 3.9100),
((SELECT id FROM states WHERE name = 'Oyo'), 'Ibadan North West', 7.4000, 3.8700),

-- Kaduna LGAs
((SELECT id FROM states WHERE name = 'Kaduna'), 'Kaduna North', 10.5400, 7.4400),
((SELECT id FROM states WHERE name = 'Kaduna'), 'Kaduna South', 10.4800, 7.4200),
((SELECT id FROM states WHERE name = 'Kaduna'), 'Chikun', 10.4000, 7.3500),
((SELECT id FROM states WHERE name = 'Kaduna'), 'Igabi', 10.7200, 7.4800),
((SELECT id FROM states WHERE name = 'Kaduna'), 'Zaria', 11.0667, 7.7000),

-- Kano LGAs
((SELECT id FROM states WHERE name = 'Kano'), 'Kano Municipal', 11.9964, 8.5167),
((SELECT id FROM states WHERE name = 'Kano'), 'Nassarawa', 11.9800, 8.5400),
((SELECT id FROM states WHERE name = 'Kano'), 'Fagge', 12.0100, 8.5300),
((SELECT id FROM states WHERE name = 'Kano'), 'Gwale', 11.9700, 8.5100),
((SELECT id FROM states WHERE name = 'Kano'), 'Tarauni', 11.9600, 8.5600),

-- Enugu LGAs
((SELECT id FROM states WHERE name = 'Enugu'), 'Enugu East', 6.4700, 7.5700),
((SELECT id FROM states WHERE name = 'Enugu'), 'Enugu North', 6.4900, 7.5300),
((SELECT id FROM states WHERE name = 'Enugu'), 'Enugu South', 6.4400, 7.5500),
((SELECT id FROM states WHERE name = 'Enugu'), 'Nsukka', 6.8567, 7.3958),
((SELECT id FROM states WHERE name = 'Enugu'), 'Nkanu West', 6.3800, 7.5900),

-- Delta LGAs
((SELECT id FROM states WHERE name = 'Delta'), 'Warri South', 5.5167, 5.7333),
((SELECT id FROM states WHERE name = 'Delta'), 'Uvwie', 5.5400, 5.7700),
((SELECT id FROM states WHERE name = 'Delta'), 'Oshimili South', 6.2000, 6.7300),
((SELECT id FROM states WHERE name = 'Delta'), 'Sapele', 5.8900, 5.6800),
((SELECT id FROM states WHERE name = 'Delta'), 'Ethiope East', 5.8400, 5.9600),

-- Edo LGAs
((SELECT id FROM states WHERE name = 'Edo'), 'Oredo', 6.3470, 5.6145),
((SELECT id FROM states WHERE name = 'Edo'), 'Egor', 6.3200, 5.6100),
((SELECT id FROM states WHERE name = 'Edo'), 'Ikpoba-Okha', 6.2900, 5.6400),
((SELECT id FROM states WHERE name = 'Edo'), 'Ovia North East', 6.5900, 5.5200),

-- Anambra LGAs
((SELECT id FROM states WHERE name = 'Anambra'), 'Awka South', 6.2100, 7.0700),
((SELECT id FROM states WHERE name = 'Anambra'), 'Onitsha North', 6.1470, 6.7870),
((SELECT id FROM states WHERE name = 'Anambra'), 'Onitsha South', 6.1300, 6.7800),
((SELECT id FROM states WHERE name = 'Anambra'), 'Nnewi North', 6.0187, 6.9167);
