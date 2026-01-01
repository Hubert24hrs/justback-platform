import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class ApiClient {
  late Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptor for authentication
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired, try to refresh
          await _refreshToken();
          // Retry the request
          return handler.resolve(await _retry(error.requestOptions));
        }
        return handler.next(error);
      },
    ));
  }

  Future<Response> _retry(RequestOptions requestOptions) async {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  Future<void> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      final response = await _dio.post('/auth/refresh',
          data: {'refreshToken': refreshToken});

      if (response.statusCode == 200) {
        final newToken = response.data['data']['accessToken'];
        await _storage.write(key: AppConstants.tokenKey, value: newToken);
      }
    } catch (e) {
      // Refresh failed, logout user
      await _storage.deleteAll();
    }
  }

  // Auth endpoints
  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await _dio.post('/auth/register', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/auth/me');
    return response.data;
  }

  // Property endpoints
  Future<Map<String, dynamic>> searchProperties({
    String? city,
    double? minPrice,
    double? maxPrice,
    int? bedrooms,
    int page = 1,
  }) async {
    final response = await _dio.get('/properties', queryParameters: {
      if (city != null) 'city': city,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (bedrooms != null) 'bedrooms': bedrooms,
      'page': page,
      'limit': AppConstants.pageSize,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getPropertyDetails(String propertyId) async {
    final response = await _dio.get('/properties/$propertyId');
    return response.data;
  }

  Future<Map<String, dynamic>> checkAvailability({
    required String propertyId,
    required String startDate,
    required String endDate,
  }) async {
    final response = await _dio.get(
      '/properties/$propertyId/availability',
      queryParameters: {
        'startDate': startDate,
        'endDate': endDate,
      },
    );
    return response.data;
  }

  // Booking endpoints
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> data) async {
    final response = await _dio.post('/bookings', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> getMyBookings() async {
    final response = await _dio.get('/bookings');
    return response.data;
  }

  Future<Map<String, dynamic>> getBookingDetails(String bookingId) async {
    final response = await _dio.get('/bookings/$bookingId');
    return response.data;
  }

  Future<Map<String, dynamic>> cancelBooking(String bookingId, String reason) async {
    final response = await _dio.put('/bookings/$bookingId/cancel', data: {
      'reason': reason,
    });
    return response.data;
  }

  // Payment endpoints
  Future<Map<String, dynamic>> verifyPayment(String reference) async {
    final response = await _dio.post('/payments/verify', data: {
      'reference': reference,
    });
    return response.data;
  }

  // Storage methods
  Future<void> saveToken(String token, String refreshToken) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
    await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
  }

  // --- Chat ---
  Future<Map<String, dynamic>> getConversations() async {
    final response = await _dio.get('/chat/conversations');
    return response.data;
  }

  Future<Map<String, dynamic>> getMessages(String conversationId) async {
    final response = await _dio.get('/chat/conversations/$conversationId/messages');
    return response.data;
  }

  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> data) async {
    final response = await _dio.post('/chat/messages', data: data);
    return response.data;
  }

  // --- Host Endpoints ---
  Future<Map<String, dynamic>> getMyProperties() async {
    final response = await _dio.get('/host/properties');
    return response.data;
  }

  Future<Map<String, dynamic>> getHostStats() async {
    final response = await _dio.get('/host/stats');
    return response.data;
  }

  Future<Map<String, dynamic>> getHostBookings() async {
    final response = await _dio.get('/host/bookings');
    return response.data;
  }

  Future<Map<String, dynamic>> createProperty(Map<String, dynamic> data) async {
    final response = await _dio.post('/properties', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> updateProperty(String id, Map<String, dynamic> data) async {
    final response = await _dio.put('/properties/$id', data: data);
    return response.data;
  }

  Future<void> deleteProperty(String id) async {
    await _dio.delete('/properties/$id');
  }

  // --- Wallet Endpoints ---
  Future<Map<String, dynamic>> getWalletBalance() async {
    final response = await _dio.get('/wallet/balance');
    return response.data;
  }

  Future<Map<String, dynamic>> getTransactionHistory() async {
    final response = await _dio.get('/wallet/transactions');
    return response.data;
  }

  Future<Map<String, dynamic>> requestWithdrawal(double amount, String bankDetails) async {
    final response = await _dio.post('/wallet/withdraw', data: {
      'amount': amount,
      'bankDetails': bankDetails,
    });
    return response.data;
  }

  // --- AI Voice / Call Endpoints ---
  Future<Map<String, dynamic>> requestAICall(String propertyId) async {
    final response = await _dio.post('/ai-voice/request-call', data: {
      'propertyId': propertyId,
      'callReason': 'property_details_inquiry'
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getAICallLogs() async {
    final response = await _dio.get('/ai-voice/calls');
    return response.data;
  }
}
