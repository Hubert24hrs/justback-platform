import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../data/nigeria_locations.dart';
import '../services/location_service.dart';

/// Provider for managing location state across the app
class LocationProvider extends ChangeNotifier {
  // Selected location
  NigerianState? _selectedState;
  NigerianLGA? _selectedLGA;
  
  // Current user location
  Position? _currentPosition;
  NigerianState? _detectedState;
  NigerianLGA? _detectedLGA;
  
  // Loading states
  bool _isDetectingLocation = false;
  String? _locationError;

  // Getters
  NigerianState? get selectedState => _selectedState;
  NigerianLGA? get selectedLGA => _selectedLGA;
  Position? get currentPosition => _currentPosition;
  NigerianState? get detectedState => _detectedState;
  NigerianLGA? get detectedLGA => _detectedLGA;
  bool get isDetectingLocation => _isDetectingLocation;
  String? get locationError => _locationError;
  
  List<NigerianState> get allStates => NigeriaLocations.states;
  
  List<NigerianLGA> get availableLGAs {
    if (_selectedState == null) return [];
    return _selectedState!.lgas;
  }

  List<String> get stateNames => NigeriaLocations.stateNames;

  /// Select a state
  void selectState(String? stateName) {
    if (stateName == null) {
      _selectedState = null;
      _selectedLGA = null;
    } else {
      _selectedState = NigeriaLocations.getState(stateName);
      _selectedLGA = null; // Reset LGA when state changes
    }
    notifyListeners();
  }

  /// Select an LGA
  void selectLGA(String? lgaName) {
    if (lgaName == null || _selectedState == null) {
      _selectedLGA = null;
    } else {
      try {
        _selectedLGA = _selectedState!.lgas.firstWhere(
          (l) => l.name == lgaName,
        );
      } catch (_) {
        _selectedLGA = null;
      }
    }
    notifyListeners();
  }

  /// Detect user's current location and set nearest state/LGA
  Future<void> detectCurrentLocation() async {
    _isDetectingLocation = true;
    _locationError = null;
    notifyListeners();

    try {
      final position = await LocationService.getCurrentLocation();
      if (position == null) {
        _locationError = 'Location permission denied or service unavailable';
        _isDetectingLocation = false;
        notifyListeners();
        return;
      }

      _currentPosition = position;
      _detectedState = LocationService.getNearestState(
        position.latitude,
        position.longitude,
      );

      if (_detectedState != null) {
        _detectedLGA = LocationService.getNearestLGA(
          _detectedState!.name,
          position.latitude,
          position.longitude,
        );
        
        // Auto-select detected location
        _selectedState = _detectedState;
        _selectedLGA = _detectedLGA;
      }
    } catch (e) {
      _locationError = 'Failed to detect location: $e';
    }

    _isDetectingLocation = false;
    notifyListeners();
  }

  /// Clear selection
  void clearSelection() {
    _selectedState = null;
    _selectedLGA = null;
    notifyListeners();
  }

  /// Get coordinates for current selection (state or LGA center)
  Map<String, double>? get selectedCoordinates {
    if (_selectedLGA != null) {
      return {
        'latitude': _selectedLGA!.latitude,
        'longitude': _selectedLGA!.longitude,
      };
    }
    if (_selectedState != null) {
      return {
        'latitude': _selectedState!.latitude,
        'longitude': _selectedState!.longitude,
      };
    }
    return null;
  }
}
