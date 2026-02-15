// Nigeria Locations Data
// All 36 states + FCT with capitals, coordinates, and geo-zones
// Used for offline state selection and location filtering

class NigerianState {
  final String name;
  final String capital;
  final double latitude;
  final double longitude;
  final String geoZone;
  final List<NigerianLGA> lgas;

  const NigerianState({
    required this.name,
    required this.capital,
    required this.latitude,
    required this.longitude,
    required this.geoZone,
    this.lgas = const [],
  });
}

class NigerianLGA {
  final String name;
  final double latitude;
  final double longitude;

  const NigerianLGA({
    required this.name,
    required this.latitude,
    required this.longitude,
  });
}

class NigeriaLocations {
  static const List<NigerianState> states = [
    // ─── South West ───
    NigerianState(
      name: 'Lagos', capital: 'Ikeja', latitude: 6.5244, longitude: 3.3792, geoZone: 'South West',
      lgas: [
        NigerianLGA(name: 'Ikeja', latitude: 6.5954, longitude: 3.3424),
        NigerianLGA(name: 'Victoria Island', latitude: 6.4281, longitude: 3.4219),
        NigerianLGA(name: 'Lekki', latitude: 6.4474, longitude: 3.4730),
        NigerianLGA(name: 'Ikoyi', latitude: 6.4492, longitude: 3.4374),
        NigerianLGA(name: 'Surulere', latitude: 6.5059, longitude: 3.3509),
        NigerianLGA(name: 'Yaba', latitude: 6.5158, longitude: 3.3759),
        NigerianLGA(name: 'Ajah', latitude: 6.4680, longitude: 3.5737),
        NigerianLGA(name: 'Oshodi', latitude: 6.5568, longitude: 3.3415),
        NigerianLGA(name: 'Alimosho', latitude: 6.6105, longitude: 3.2608),
        NigerianLGA(name: 'Ikorodu', latitude: 6.6157, longitude: 3.5072),
        NigerianLGA(name: 'Badagry', latitude: 6.4317, longitude: 2.8814),
        NigerianLGA(name: 'Epe', latitude: 6.5852, longitude: 3.9797),
      ],
    ),
    NigerianState(
      name: 'Ogun', capital: 'Abeokuta', latitude: 7.1607, longitude: 3.3500, geoZone: 'South West',
      lgas: [
        NigerianLGA(name: 'Abeokuta South', latitude: 7.1475, longitude: 3.3619),
        NigerianLGA(name: 'Abeokuta North', latitude: 7.1800, longitude: 3.3200),
        NigerianLGA(name: 'Sagamu', latitude: 6.8388, longitude: 3.6397),
        NigerianLGA(name: 'Ijebu Ode', latitude: 6.8200, longitude: 3.9200),
      ],
    ),
    NigerianState(
      name: 'Oyo', capital: 'Ibadan', latitude: 7.3775, longitude: 3.9470, geoZone: 'South West',
      lgas: [
        NigerianLGA(name: 'Ibadan North', latitude: 7.4200, longitude: 3.9000),
        NigerianLGA(name: 'Ibadan South East', latitude: 7.3600, longitude: 3.9500),
        NigerianLGA(name: 'Ibadan North East', latitude: 7.4300, longitude: 3.9600),
        NigerianLGA(name: 'Ibadan South West', latitude: 7.3700, longitude: 3.9100),
        NigerianLGA(name: 'Ibadan North West', latitude: 7.4000, longitude: 3.8700),
      ],
    ),
    NigerianState(name: 'Osun', capital: 'Osogbo', latitude: 7.7827, longitude: 4.5418, geoZone: 'South West'),
    NigerianState(name: 'Ondo', capital: 'Akure', latitude: 7.2526, longitude: 5.2103, geoZone: 'South West'),
    NigerianState(name: 'Ekiti', capital: 'Ado-Ekiti', latitude: 7.6211, longitude: 5.2215, geoZone: 'South West'),

    // ─── South East ───
    NigerianState(
      name: 'Anambra', capital: 'Awka', latitude: 6.2209, longitude: 7.0673, geoZone: 'South East',
      lgas: [
        NigerianLGA(name: 'Awka South', latitude: 6.2100, longitude: 7.0700),
        NigerianLGA(name: 'Onitsha North', latitude: 6.1470, longitude: 6.7870),
        NigerianLGA(name: 'Onitsha South', latitude: 6.1300, longitude: 6.7800),
        NigerianLGA(name: 'Nnewi North', latitude: 6.0187, longitude: 6.9167),
      ],
    ),
    NigerianState(name: 'Abia', capital: 'Umuahia', latitude: 5.5320, longitude: 7.4861, geoZone: 'South East'),
    NigerianState(name: 'Ebonyi', capital: 'Abakaliki', latitude: 6.3176, longitude: 8.1137, geoZone: 'South East'),
    NigerianState(
      name: 'Enugu', capital: 'Enugu', latitude: 6.4584, longitude: 7.5464, geoZone: 'South East',
      lgas: [
        NigerianLGA(name: 'Enugu East', latitude: 6.4700, longitude: 7.5700),
        NigerianLGA(name: 'Enugu North', latitude: 6.4900, longitude: 7.5300),
        NigerianLGA(name: 'Enugu South', latitude: 6.4400, longitude: 7.5500),
        NigerianLGA(name: 'Nsukka', latitude: 6.8567, longitude: 7.3958),
      ],
    ),
    NigerianState(name: 'Imo', capital: 'Owerri', latitude: 5.4836, longitude: 7.0332, geoZone: 'South East'),

    // ─── South South ───
    NigerianState(name: 'Akwa Ibom', capital: 'Uyo', latitude: 5.0377, longitude: 7.9128, geoZone: 'South South'),
    NigerianState(name: 'Bayelsa', capital: 'Yenagoa', latitude: 4.9261, longitude: 6.2642, geoZone: 'South South'),
    NigerianState(name: 'Cross River', capital: 'Calabar', latitude: 4.9757, longitude: 8.3417, geoZone: 'South South'),
    NigerianState(
      name: 'Delta', capital: 'Asaba', latitude: 6.1981, longitude: 6.7250, geoZone: 'South South',
      lgas: [
        NigerianLGA(name: 'Warri South', latitude: 5.5167, longitude: 5.7333),
        NigerianLGA(name: 'Uvwie', latitude: 5.5400, longitude: 5.7700),
        NigerianLGA(name: 'Oshimili South', latitude: 6.2000, longitude: 6.7300),
        NigerianLGA(name: 'Sapele', latitude: 5.8900, longitude: 5.6800),
      ],
    ),
    NigerianState(
      name: 'Edo', capital: 'Benin City', latitude: 6.3350, longitude: 5.6037, geoZone: 'South South',
      lgas: [
        NigerianLGA(name: 'Oredo', latitude: 6.3470, longitude: 5.6145),
        NigerianLGA(name: 'Egor', latitude: 6.3200, longitude: 5.6100),
        NigerianLGA(name: 'Ikpoba-Okha', latitude: 6.2900, longitude: 5.6400),
      ],
    ),
    NigerianState(
      name: 'Rivers', capital: 'Port Harcourt', latitude: 4.8156, longitude: 7.0498, geoZone: 'South South',
      lgas: [
        NigerianLGA(name: 'Port Harcourt City', latitude: 4.8156, longitude: 7.0498),
        NigerianLGA(name: 'Obio-Akpor', latitude: 4.8500, longitude: 7.0000),
        NigerianLGA(name: 'Eleme', latitude: 4.7800, longitude: 7.1200),
        NigerianLGA(name: 'Ikwerre', latitude: 5.0100, longitude: 6.9200),
      ],
    ),

    // ─── North Central ───
    NigerianState(name: 'Benue', capital: 'Makurdi', latitude: 7.7411, longitude: 8.5121, geoZone: 'North Central'),
    NigerianState(name: 'Kogi', capital: 'Lokoja', latitude: 7.8023, longitude: 6.7333, geoZone: 'North Central'),
    NigerianState(name: 'Kwara', capital: 'Ilorin', latitude: 8.4966, longitude: 4.5426, geoZone: 'North Central'),
    NigerianState(name: 'Nasarawa', capital: 'Lafia', latitude: 8.4966, longitude: 8.5147, geoZone: 'North Central'),
    NigerianState(name: 'Niger', capital: 'Minna', latitude: 9.6139, longitude: 6.5569, geoZone: 'North Central'),
    NigerianState(name: 'Plateau', capital: 'Jos', latitude: 9.8965, longitude: 8.8583, geoZone: 'North Central'),
    NigerianState(
      name: 'FCT', capital: 'Abuja', latitude: 9.0579, longitude: 7.4951, geoZone: 'North Central',
      lgas: [
        NigerianLGA(name: 'Garki', latitude: 9.0108, longitude: 7.4874),
        NigerianLGA(name: 'Wuse', latitude: 9.0643, longitude: 7.4892),
        NigerianLGA(name: 'Maitama', latitude: 9.0817, longitude: 7.4926),
        NigerianLGA(name: 'Asokoro', latitude: 9.0408, longitude: 7.5271),
        NigerianLGA(name: 'Gwarinpa', latitude: 9.1067, longitude: 7.3968),
        NigerianLGA(name: 'Jabi', latitude: 9.0621, longitude: 7.4253),
        NigerianLGA(name: 'Kubwa', latitude: 9.1598, longitude: 7.3211),
        NigerianLGA(name: 'Lugbe', latitude: 8.9733, longitude: 7.3870),
      ],
    ),

    // ─── North East ───
    NigerianState(name: 'Adamawa', capital: 'Yola', latitude: 9.2035, longitude: 12.4954, geoZone: 'North East'),
    NigerianState(name: 'Bauchi', capital: 'Bauchi', latitude: 10.3158, longitude: 9.8442, geoZone: 'North East'),
    NigerianState(name: 'Borno', capital: 'Maiduguri', latitude: 11.8311, longitude: 13.1510, geoZone: 'North East'),
    NigerianState(name: 'Gombe', capital: 'Gombe', latitude: 10.2834, longitude: 11.1731, geoZone: 'North East'),
    NigerianState(name: 'Taraba', capital: 'Jalingo', latitude: 8.8937, longitude: 11.3596, geoZone: 'North East'),
    NigerianState(name: 'Yobe', capital: 'Damaturu', latitude: 11.7468, longitude: 11.9662, geoZone: 'North East'),

    // ─── North West ───
    NigerianState(name: 'Jigawa', capital: 'Dutse', latitude: 11.7689, longitude: 9.3397, geoZone: 'North West'),
    NigerianState(
      name: 'Kaduna', capital: 'Kaduna', latitude: 10.5105, longitude: 7.4165, geoZone: 'North West',
      lgas: [
        NigerianLGA(name: 'Kaduna North', latitude: 10.5400, longitude: 7.4400),
        NigerianLGA(name: 'Kaduna South', latitude: 10.4800, longitude: 7.4200),
        NigerianLGA(name: 'Chikun', latitude: 10.4000, longitude: 7.3500),
        NigerianLGA(name: 'Igabi', latitude: 10.7200, longitude: 7.4800),
        NigerianLGA(name: 'Zaria', latitude: 11.0667, longitude: 7.7000),
      ],
    ),
    NigerianState(
      name: 'Kano', capital: 'Kano', latitude: 12.0022, longitude: 8.5920, geoZone: 'North West',
      lgas: [
        NigerianLGA(name: 'Kano Municipal', latitude: 11.9964, longitude: 8.5167),
        NigerianLGA(name: 'Nassarawa', latitude: 11.9800, longitude: 8.5400),
        NigerianLGA(name: 'Fagge', latitude: 12.0100, longitude: 8.5300),
        NigerianLGA(name: 'Gwale', latitude: 11.9700, longitude: 8.5100),
        NigerianLGA(name: 'Tarauni', latitude: 11.9600, longitude: 8.5600),
      ],
    ),
    NigerianState(name: 'Katsina', capital: 'Katsina', latitude: 13.0059, longitude: 7.6000, geoZone: 'North West'),
    NigerianState(name: 'Kebbi', capital: 'Birnin Kebbi', latitude: 12.4539, longitude: 4.1975, geoZone: 'North West'),
    NigerianState(name: 'Sokoto', capital: 'Sokoto', latitude: 13.0533, longitude: 5.2476, geoZone: 'North West'),
    NigerianState(name: 'Zamfara', capital: 'Gusau', latitude: 12.1628, longitude: 6.6612, geoZone: 'North West'),
  ];

  /// Get all state names
  static List<String> get stateNames => states.map((s) => s.name).toList();

  /// Get state by name
  static NigerianState? getState(String name) {
    try {
      return states.firstWhere(
        (s) => s.name.toLowerCase() == name.toLowerCase(),
      );
    } catch (_) {
      return null;
    }
  }

  /// Get LGAs for a state
  static List<NigerianLGA> getLGAs(String stateName) {
    final state = getState(stateName);
    return state?.lgas ?? [];
  }

  /// Get LGA names for a state
  static List<String> getLGANames(String stateName) {
    return getLGAs(stateName).map((l) => l.name).toList();
  }

  /// Get states by geo-zone
  static List<NigerianState> getStatesByZone(String geoZone) {
    return states.where((s) => s.geoZone == geoZone).toList();
  }

  /// Get all geo-zone names
  static List<String> get geoZones => [
    'South West', 'South East', 'South South',
    'North Central', 'North East', 'North West',
  ];

  /// Center of Nigeria (for map default position)
  static const double centerLatitude = 9.0820;
  static const double centerLongitude = 8.6753;
  static const double defaultZoom = 6.0;
}
