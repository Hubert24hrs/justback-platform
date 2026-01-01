import 'package:flutter/material.dart';
import '../services/api_client.dart';

class PropertyProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _featuredProperties = [];
  List<dynamic> _discoveryProperties = [];
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

  Future<void> fetchFeaturedProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.searchProperties();
      if (response['success']) {
        _featuredProperties = response['data']['properties'];
        // Shuffle for discovery feed
        _discoveryProperties = List.from(_featuredProperties)..shuffle();
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
