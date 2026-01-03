import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_client.dart';

/// Provider for managing user's favorite properties
class FavoritesProvider extends ChangeNotifier {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Set<String> _favoriteIds = {};
  List<Map<String, dynamic>> _favoriteProperties = [];
  bool _isLoading = false;

  Set<String> get favoriteIds => _favoriteIds;
  List<Map<String, dynamic>> get favoriteProperties => _favoriteProperties;
  bool get isLoading => _isLoading;

  FavoritesProvider() {
    _loadFavorites();
  }

  /// Load favorites from local storage
  Future<void> _loadFavorites() async {
    try {
      final storedFavorites = await _storage.read(key: 'favorites');
      if (storedFavorites != null) {
        _favoriteIds.addAll(storedFavorites.split(',').where((id) => id.isNotEmpty));
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading favorites: $e');
    }
  }

  /// Save favorites to local storage
  Future<void> _saveFavorites() async {
    try {
      await _storage.write(key: 'favorites', value: _favoriteIds.join(','));
    } catch (e) {
      debugPrint('Error saving favorites: $e');
    }
  }

  /// Check if a property is favorited
  bool isFavorite(String propertyId) {
    return _favoriteIds.contains(propertyId);
  }

  /// Toggle favorite status for a property
  Future<void> toggleFavorite(String propertyId, {Map<String, dynamic>? property}) async {
    if (_favoriteIds.contains(propertyId)) {
      _favoriteIds.remove(propertyId);
      _favoriteProperties.removeWhere((p) => p['id'] == propertyId);
    } else {
      _favoriteIds.add(propertyId);
      if (property != null) {
        _favoriteProperties.add(property);
      }
    }
    
    await _saveFavorites();
    notifyListeners();
  }

  /// Add a property to favorites
  Future<void> addFavorite(String propertyId, Map<String, dynamic> property) async {
    if (!_favoriteIds.contains(propertyId)) {
      _favoriteIds.add(propertyId);
      _favoriteProperties.add(property);
      await _saveFavorites();
      notifyListeners();
    }
  }

  /// Remove a property from favorites
  Future<void> removeFavorite(String propertyId) async {
    if (_favoriteIds.contains(propertyId)) {
      _favoriteIds.remove(propertyId);
      _favoriteProperties.removeWhere((p) => p['id'] == propertyId);
      await _saveFavorites();
      notifyListeners();
    }
  }

  /// Clear all favorites
  Future<void> clearFavorites() async {
    _favoriteIds.clear();
    _favoriteProperties.clear();
    await _saveFavorites();
    notifyListeners();
  }

  /// Fetch full property details for all favorites
  Future<void> fetchFavoriteProperties(ApiClient apiClient) async {
    if (_favoriteIds.isEmpty) {
      _favoriteProperties = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    notifyListeners();

    try {
      final List<Map<String, dynamic>> properties = [];
      
      for (final propertyId in _favoriteIds) {
        try {
          final response = await apiClient.getPropertyDetails(propertyId);
          if (response['success'] == true && response['data'] != null) {
            properties.add(response['data']);
          }
        } catch (e) {
          debugPrint('Error fetching property $propertyId: $e');
        }
      }
      
      _favoriteProperties = properties;
    } catch (e) {
      debugPrint('Error fetching favorite properties: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
