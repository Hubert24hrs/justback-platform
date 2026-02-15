import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/location_service.dart';

class PropertyProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _featuredProperties = [];
  List<dynamic> _discoveryProperties = [];
  List<dynamic> _searchResults = [];
  String _selectedCategory = 'All';
  Map<String, dynamic>? _selectedProperty;
  bool _isLoading = false;
  bool _isAIProcessing = false;
  String? _currentCallSid;
  List<dynamic>? _simulatedTranscript;
  String? _error;

  List<dynamic> get featuredProperties {
    if (_selectedCategory == 'All') return _featuredProperties;
    return _featuredProperties.where((p) => p['category'] == _selectedCategory).toList();
  }
  
  List<dynamic> get discoveryProperties => _discoveryProperties;
  List<dynamic> get searchResults => _searchResults;
  String get selectedCategory => _selectedCategory;
  Map<String, dynamic>? get selectedProperty => _selectedProperty;
  bool get isLoading => _isLoading;
  bool get isAIProcessing => _isAIProcessing;
  String? get currentCallSid => _currentCallSid;
  List<dynamic>? get simulatedTranscript => _simulatedTranscript;
  String? get error => _error;

  void clearAICall() {
    _currentCallSid = null;
    _simulatedTranscript = null;
    _isAIProcessing = false;
    notifyListeners();
  }

  Future<void> requestAICall(String propertyId) async {
    _isAIProcessing = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.requestAICall(propertyId);
      if (response['success']) {
        _currentCallSid = response['data']['callSid'];
        _simulatedTranscript = response['data']['simulatedTranscript'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isAIProcessing = false;
      notifyListeners();
    }
  }

  void setCategory(String category) {
    if (_selectedCategory == category) {
      _selectedCategory = 'All';
    } else {
      _selectedCategory = category;
    }
    notifyListeners();
  }

  /// Advanced search with filters including state and LGA
  void searchProperties({
    String? city,
    String? state,
    String? lga,
    String? category,
    int? minPrice,
    int? maxPrice,
    int? minBedrooms,
    String? query,
  }) {
    _isLoading = true;
    notifyListeners();

    List<dynamic> results = List.from(_featuredProperties);

    // Filter by state
    if (state != null && state.isNotEmpty) {
      results = results.where((p) {
        final propState = (p['state'] ?? '').toString().toLowerCase();
        return propState == state.toLowerCase();
      }).toList();
    }

    // Filter by LGA
    if (lga != null && lga.isNotEmpty) {
      results = results.where((p) {
        final propLGA = (p['lga'] ?? '').toString().toLowerCase();
        return propLGA == lga.toLowerCase();
      }).toList();
    }

    // Filter by city
    if (city != null && city.isNotEmpty) {
      results = results.where((p) {
        final propCity = (p['city'] ?? '').toString().toLowerCase();
        return propCity.contains(city.toLowerCase());
      }).toList();
    }

    // Filter by category
    if (category != null && category.isNotEmpty) {
      results = results.where((p) => p['category'] == category).toList();
    }

    // Filter by price range
    if (minPrice != null) {
      results = results.where((p) {
        final price = p['pricePerNight'] ?? 0;
        return price >= minPrice;
      }).toList();
    }
    if (maxPrice != null) {
      results = results.where((p) {
        final price = p['pricePerNight'] ?? 0;
        return price <= maxPrice;
      }).toList();
    }

    // Filter by bedrooms
    if (minBedrooms != null && minBedrooms > 1) {
      results = results.where((p) {
        final beds = p['bedrooms'] ?? 0;
        return beds >= minBedrooms;
      }).toList();
    }

    // Filter by search query
    if (query != null && query.isNotEmpty) {
      final lowercaseQuery = query.toLowerCase();
      results = results.where((p) {
        final title = (p['title'] ?? '').toString().toLowerCase();
        final desc = (p['description'] ?? '').toString().toLowerCase();
        final propCity = (p['city'] ?? '').toString().toLowerCase();
        return title.contains(lowercaseQuery) || 
               desc.contains(lowercaseQuery) || 
               propCity.contains(lowercaseQuery);
      }).toList();
    }

    _searchResults = results;
    _isLoading = false;
    notifyListeners();
  }

  /// Search properties by geo-radius from coordinates
  Future<void> searchByRadius(
    double latitude,
    double longitude,
    double radiusKm,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Try API first
      final response = await _apiClient.searchNearbyProperties(
        latitude: latitude,
        longitude: longitude,
        radius: radiusKm,
      );
      if (response['success'] == true) {
        _searchResults = response['data']['properties'] ?? [];
        _isLoading = false;
        notifyListeners();
        return;
      }
    } catch (_) {
      // Fall back to local Haversine filtering
    }

    // Client-side fallback with Haversine
    _searchResults = _featuredProperties.where((p) {
      final lat = (p['latitude'] as num?)?.toDouble();
      final lng = (p['longitude'] as num?)?.toDouble();
      if (lat == null || lng == null) return false;
      final distance = LocationService.calculateDistance(
        latitude, longitude, lat, lng,
      );
      return distance <= radiusKm;
    }).map((p) {
      final lat = (p['latitude'] as num).toDouble();
      final lng = (p['longitude'] as num).toDouble();
      return {
        ...Map<String, dynamic>.from(p),
        'distance': LocationService.calculateDistance(
          latitude, longitude, lat, lng,
        ),
      };
    }).toList()
      ..sort((a, b) => 
        ((a['distance'] as double?) ?? 0).compareTo((b['distance'] as double?) ?? 0)
      );

    _isLoading = false;
    notifyListeners();
  }

  /// Search properties by state and optional LGA
  Future<void> searchByStateAPI(String state, {String? lga}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.searchByStateName(state, lga: lga);
      if (response['success'] == true) {
        _searchResults = response['data']['properties'] ?? [];
        _isLoading = false;
        notifyListeners();
        return;
      }
    } catch (_) {
      // Fall back to client-side filtering
    }

    searchProperties(state: state, lga: lga);
  }

  /// Simple text search (original method)
  void simpleSearch(String query) {
    if (query.isEmpty) {
      _selectedCategory = 'All';
      _discoveryProperties = List.from(_featuredProperties)..shuffle();
    } else {
      final lowercaseQuery = query.toLowerCase();
      _discoveryProperties = _featuredProperties.where((p) {
        final title = (p['title'] ?? '').toString().toLowerCase();
        final city = (p['city'] ?? '').toString().toLowerCase();
        return title.contains(lowercaseQuery) || city.contains(lowercaseQuery);
      }).toList();
    }
    notifyListeners();
  }

  Future<void> fetchFeaturedProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.searchProperties();
      if (response['success']) {
        _featuredProperties = response['data']['properties'];
        _discoveryProperties = List.from(_featuredProperties)..shuffle();
        _searchResults = List.from(_featuredProperties);
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPropertyDetails(String propertyId) async {
    _isLoading = true;
    _error = null;
    _selectedProperty = null;
    notifyListeners();

    try {
      final response = await _apiClient.getPropertyDetails(propertyId);
      if (response['success']) {
        _selectedProperty = response['data'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
