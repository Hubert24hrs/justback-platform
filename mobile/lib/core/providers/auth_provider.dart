import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_client.dart';
import '../constants/app_constants.dart';
import 'dart:convert';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final _storage = const FlutterSecureStorage();

  bool _isLoggedIn = false;
  bool _isLoading = false;
  Map<String, dynamic>? _user;
  String? _error;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get user => _user;
  Map<String, dynamic>? get currentUser => _user;
  String? get error => _error;
  String? get userRole => _user?['role'];

  Future<void> checkAuthStatus() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token != null) {
      try {
        final response = await _apiClient.getProfile();
        if (response['success']) {
          _user = response['data'];
          _isLoggedIn = true;
          notifyListeners();
        }
      } catch (e) {
        await logout();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.login(email, password);
      
      if (response['success']) {
        final data = response['data'];
        _user = data['user'];
        await _apiClient.saveToken(
          data['accessToken'],
          data['refreshToken'],
        );
        await _storage.write(
          key: AppConstants.userKey,
          value: json.encode(_user),
        );
        _isLoggedIn = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.register(data);
      
      if (response['success']) {
        final responseData = response['data'];
        _user = responseData['user'];
        await _apiClient.saveToken(
          responseData['accessToken'],
          responseData['refreshToken'],
        );
        _isLoggedIn = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _apiClient.clearTokens();
    await _storage.delete(key: AppConstants.userKey);
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }
}
