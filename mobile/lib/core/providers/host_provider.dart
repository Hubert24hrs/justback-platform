import 'package:flutter/material.dart';
import '../services/api_client.dart';

class HostProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _myListings = [];
  Map<String, dynamic>? _hostStats;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get myListings => _myListings;
  Map<String, dynamic>? get hostStats => _hostStats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchHostDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Mocking stats for now as backend might not have a combined "dashboard" endpoint yet
      _hostStats = {
        'totalEarnings': 150000.0,
        'activeBookings': 3,
        'totalViews': 1240,
        'rating': 4.8,
      };

      final response = await _apiClient.searchProperties(); // Filtering would happen server-side by host token
      if (response['success']) {
        _myListings = response['data']['properties'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addProperty(Map<String, dynamic> propertyData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.createProperty(propertyData);
      if (response['success']) {
        _myListings.insert(0, response['data']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to add property';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }
}
