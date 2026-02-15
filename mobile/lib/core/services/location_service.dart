import 'dart:math';
import 'package:geolocator/geolocator.dart';
import '../data/nigeria_locations.dart';

/// Service for handling location-related operations
class LocationService {
  /// Get the user's current GPS position
  static Future<Position?> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return null;
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Calculate distance between two coordinates using Haversine formula (km)
  static double calculateDistance(
    double lat1, double lon1,
    double lat2, double lon2,
  ) {
    const double R = 6371; // Earth radius in km
    final double dLat = _toRadians(lat2 - lat1);
    final double dLon = _toRadians(lon2 - lon1);
    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) * cos(_toRadians(lat2)) *
        sin(dLon / 2) * sin(dLon / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  /// Find the nearest state to given coordinates
  static NigerianState? getNearestState(double latitude, double longitude) {
    NigerianState? nearest;
    double minDistance = double.infinity;

    for (final state in NigeriaLocations.states) {
      final distance = calculateDistance(
        latitude, longitude,
        state.latitude, state.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = state;
      }
    }
    return nearest;
  }

  /// Find the nearest LGA within a state
  static NigerianLGA? getNearestLGA(
    String stateName,
    double latitude,
    double longitude,
  ) {
    final lgas = NigeriaLocations.getLGAs(stateName);
    if (lgas.isEmpty) return null;

    NigerianLGA? nearest;
    double minDistance = double.infinity;

    for (final lga in lgas) {
      final distance = calculateDistance(
        latitude, longitude,
        lga.latitude, lga.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = lga;
      }
    }
    return nearest;
  }

  /// Format distance for display
  static String formatDistance(double distanceKm) {
    if (distanceKm < 1) {
      return '${(distanceKm * 1000).round()}m';
    } else if (distanceKm < 10) {
      return '${distanceKm.toStringAsFixed(1)}km';
    } else {
      return '${distanceKm.round()}km';
    }
  }

  static double _toRadians(double degrees) {
    return degrees * pi / 180;
  }
}
