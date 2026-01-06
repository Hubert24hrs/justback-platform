import 'package:flutter/material.dart';
import '../services/api_client.dart';

class ReviewProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _reviews = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;
  Map<String, dynamic>? _ratingBreakdown;

  List<dynamic> get reviews => _reviews;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;
  Map<String, dynamic>? get ratingBreakdown => _ratingBreakdown;

  /// Fetch reviews for a property
  Future<void> fetchPropertyReviews(String propertyId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.getPropertyReviews(propertyId);
      
      if (response['success'] == true) {
        _reviews = response['data']['reviews'] ?? [];
        _ratingBreakdown = response['data']['breakdown'];
      }
    } catch (e) {
      _error = e.toString();
      // Fallback to mock data
      _loadMockReviews();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submit a new review
  Future<bool> submitReview({
    required String bookingId,
    required String propertyId,
    required double overallRating,
    required String comment,
    double? cleanlinessRating,
    double? communicationRating,
    double? locationRating,
    double? valueRating,
  }) async {
    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.createReview({
        'bookingId': bookingId,
        'propertyId': propertyId,
        'rating': overallRating,
        'comment': comment,
        'ratings': {
          'cleanliness': cleanlinessRating ?? overallRating,
          'communication': communicationRating ?? overallRating,
          'location': locationRating ?? overallRating,
          'value': valueRating ?? overallRating,
        },
      });

      if (response['success'] == true) {
        // Add to local list
        _reviews.insert(0, response['data']['review']);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Calculate average rating from reviews
  double get averageRating {
    if (_reviews.isEmpty) return 0;
    final sum = _reviews.fold<double>(0, (acc, r) => acc + (r['rating'] ?? 0));
    return sum / _reviews.length;
  }

  /// Get rating distribution (1-5 stars)
  Map<int, int> get ratingDistribution {
    final dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    for (var review in _reviews) {
      final rating = (review['rating'] as num?)?.round() ?? 0;
      if (rating >= 1 && rating <= 5) {
        dist[rating] = (dist[rating] ?? 0) + 1;
      }
    }
    return dist;
  }

  // ==================== MOCK DATA ====================

  void _loadMockReviews() {
    _reviews = [
      {
        'id': 'rev_1',
        'userId': 'user_1',
        'userName': 'John Doe',
        'userAvatar': 'https://i.pravatar.cc/150?u=john',
        'rating': 5,
        'comment': 'Amazing property! The host was very responsive and the place was exactly as described. Would definitely book again.',
        'createdAt': DateTime.now().subtract(const Duration(days: 5)).toIso8601String(),
        'ratings': {
          'cleanliness': 5,
          'communication': 5,
          'location': 4,
          'value': 5,
        },
      },
      {
        'id': 'rev_2',
        'userId': 'user_2',
        'userName': 'Jane Smith',
        'userAvatar': 'https://i.pravatar.cc/150?u=jane',
        'rating': 4,
        'comment': 'Great location and beautiful views. The only issue was the AC which was a bit noisy at night.',
        'createdAt': DateTime.now().subtract(const Duration(days: 12)).toIso8601String(),
        'ratings': {
          'cleanliness': 4,
          'communication': 5,
          'location': 5,
          'value': 4,
        },
      },
      {
        'id': 'rev_3',
        'userId': 'user_3',
        'userName': 'Mike Johnson',
        'userAvatar': 'https://i.pravatar.cc/150?u=mike',
        'rating': 5,
        'comment': 'Perfect for a weekend getaway. Very clean and comfortable. Highly recommended!',
        'createdAt': DateTime.now().subtract(const Duration(days: 20)).toIso8601String(),
        'ratings': {
          'cleanliness': 5,
          'communication': 4,
          'location': 5,
          'value': 5,
        },
      },
    ];
    _ratingBreakdown = {
      'average': 4.7,
      'total': 3,
      'cleanliness': 4.7,
      'communication': 4.7,
      'location': 4.7,
      'value': 4.7,
    };
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
