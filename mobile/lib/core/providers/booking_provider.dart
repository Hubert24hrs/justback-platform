import 'package:flutter/material.dart';
import '../services/api_client.dart';

class BookingProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _myBookings = [];
  Map<String, dynamic>? _lastCreatedBooking;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get myBookings => _myBookings;
  Map<String, dynamic>? get lastCreatedBooking => _lastCreatedBooking;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> createBooking(Map<String, dynamic> bookingData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.createBooking(bookingData);
      if (response['success']) {
        _lastCreatedBooking = response['data'];
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to create booking';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  Future<void> fetchMyBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.getMyBookings();
      if (response['success']) {
        _myBookings = response['data'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
