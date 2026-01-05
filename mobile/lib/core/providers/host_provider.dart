import 'package:flutter/material.dart';
import '../services/api_client.dart';

class HostProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _myListings = [];
  List<dynamic> _hostBookings = [];
  Map<String, dynamic>? _hostStats;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get myListings => _myListings;
  List<dynamic> get hostBookings => _hostBookings;
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

  Future<void> fetchHostBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Mock bookings data for now - will connect to real API later
      _hostBookings = [
        {
          'id': 'booking-001',
          'propertyTitle': 'Skyline Glass Penthouse',
          'propertyImage': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800',
          'guestName': 'Chukwuemeka Okafor',
          'guests': 2,
          'checkIn': 'Jan 15, 2026',
          'checkOut': 'Jan 18, 2026',
          'totalPrice': 255000,
          'status': 'pending',
        },
        {
          'id': 'booking-002',
          'propertyTitle': 'Neon Horizon Duplex',
          'propertyImage': 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800',
          'guestName': 'Amina Bello',
          'guests': 4,
          'checkIn': 'Jan 10, 2026',
          'checkOut': 'Jan 14, 2026',
          'totalPrice': 380000,
          'status': 'confirmed',
        },
        {
          'id': 'booking-003',
          'propertyTitle': 'Quantum Smart-Stay',
          'propertyImage': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800',
          'guestName': 'Tunde Adeyemi',
          'guests': 2,
          'checkIn': 'Jan 5, 2026',
          'checkOut': 'Jan 8, 2026',
          'totalPrice': 105000,
          'status': 'checked_in',
        },
        {
          'id': 'booking-004',
          'propertyTitle': 'Solaris Grand Hotel',
          'propertyImage': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800',
          'guestName': 'Ngozi Eze',
          'guests': 2,
          'checkIn': 'Dec 28, 2025',
          'checkOut': 'Dec 31, 2025',
          'totalPrice': 165000,
          'status': 'completed',
        },
      ];
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
